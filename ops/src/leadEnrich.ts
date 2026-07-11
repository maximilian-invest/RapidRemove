/* Lead-Recherche: E-Mail-Adressen zu geprüften Profilen automatisch finden.
 *
 * Zwei Wege nutzen dieselbe Scan-Logik:
 *  1) Admin-Browser (ohne Server-Key): Places liefert die Website clientseitig
 *     (Browser-Key, websiteUri), POST /admin/check-enrich scannt sie hier und
 *     speichert den besten Treffer direkt am Check (autosave).
 *  2) Server-Worker (mit GOOGLE_MAPS_API_KEY): läuft periodisch auch ohne
 *     geöffnetes Admin, holt Website + E-Mail für alle offenen Prüfungen ohne
 *     E-Mail und markiert sie als recherchiert (enriched_at) – auch bei
 *     Fehlschlag, damit nichts endlos erneut versucht wird.
 */
import type { FastifyInstance } from "fastify";
import { lookup } from "node:dns/promises";
import { lookup as lookupCb } from "node:dns";
import { isIP, type LookupFunction } from "node:net";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import { createGunzip, createInflate, createBrotliDecompress } from "node:zlib";
import { dbReady, listChecksToEnrich, markCheckEnriched } from "./db";

const EMAIL_RX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const EMAIL_JUNK = /\.(png|jpe?g|gif|webp|svg|css|js|woff2?)$|example\.|sentry|wixpress|schema\.org|@\dx\./i;
const MAX_BYTES = 400_000; // Größen-Deckel pro Seite
const MAX_REDIRECTS = 4;

/** Normalisierte IPv6-Adresse in ihre 8 16-Bit-Gruppen zerlegen (inkl. „::"-Kürzung
 *  und eingebettetem dotted-IPv4-Suffix); null = nicht parsebar → Aufrufer blockt. */
function ipv6Groups(ip: string): number[] | null {
  let s = ip.toLowerCase();
  const dm = s.match(/^(.*:)(\d+)\.(\d+)\.(\d+)\.(\d+)$/); // eingebettetes IPv4 (::ffff:1.2.3.4 / ::1.2.3.4)
  if (dm) {
    const o = [Number(dm[2]), Number(dm[3]), Number(dm[4]), Number(dm[5])];
    if (o.some((n) => n > 255)) return null;
    s = dm[1] + ((o[0] << 8) | o[1]).toString(16) + ":" + ((o[2] << 8) | o[3]).toString(16);
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":").filter((x) => x !== "") : [];
  let groups: string[];
  if (halves.length === 2) {
    const tail = halves[1] ? halves[1].split(":").filter((x) => x !== "") : [];
    const fill = 8 - head.length - tail.length;
    if (fill < 0) return null;
    groups = [...head, ...Array(fill).fill("0"), ...tail];
  } else {
    groups = head;
  }
  if (groups.length !== 8) return null;
  const nums = groups.map((g) => parseInt(g || "0", 16));
  return nums.some((n) => Number.isNaN(n) || n < 0 || n > 0xffff) ? null : nums;
}

/** IP-Literal (v4/v6) auf private/lokale/reservierte Bereiche prüfen. */
function privateIp(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const p = ip.split(".").map(Number);
    const [a, b] = p;
    return a === 0 || a === 10 || a === 127 || a >= 224 ||          // 0/8, 10/8, loopback, multicast+reserved
      (a === 169 && b === 254) ||                                    // link-local (Metadaten-Endpunkt)
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || // private
      (a === 100 && b >= 64 && b <= 127);                            // CGNAT 100.64/10
  }
  if (v === 6) {
    const g = ipv6Groups(ip);
    if (!g) return true;                                             // unparsebar → sicherheitshalber blocken
    if (g.every((x) => x === 0)) return true;                         // :: (unspecified)
    if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return true; // ::1 (loopback)
    if ((g[0] & 0xffc0) === 0xfe80) return true;                      // fe80::/10 link-local
    if ((g[0] & 0xfe00) === 0xfc00) return true;                      // fc00::/7 Unique Local Address
    // IPv4-gemappt ::ffff:0:0/96 und IPv4-kompatibel ::/96 → eingebettetes IPv4 prüfen
    if (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0xffff || g[5] === 0)) {
      const v4 = `${g[6] >> 8}.${g[6] & 0xff}.${g[7] >> 8}.${g[7] & 0xff}`;
      return privateIp(v4);
    }
    return false;
  }
  return false;
}

/** SSRF-Schutz (rein lexikalisch): lokale Namen / IP-Literale sofort blocken. */
export const privateHost = (h: string): boolean => {
  const host = String(h || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) return true;
  if (isIP(host)) return privateIp(host);
  return false;
};

/** SSRF-Schutz (mit DNS-Auflösung): blockt, wenn der Host auf eine private IP zeigt.
 *  Vorprüfung (klare Ablehnung); die eigentliche Durchsetzung passiert beim Connect
 *  über pinnedLookup (kein TOCTOU-Fenster). IPv6-Literale kommen mit Klammern an. */
async function hostAllowed(hostname: string): Promise<boolean> {
  const h = String(hostname || "").replace(/^\[|\]$/g, "");
  if (privateHost(h)) return false;
  if (isIP(h)) return !privateIp(h);
  try {
    const addrs = await lookup(h, { all: true });
    if (!addrs.length) return false;
    return addrs.every((a) => !privateIp(a.address)); // ein einziger privater Treffer blockt
  } catch { return false; }
}

/** DNS-Auflösung, die dem Socket NUR vorab-validierte öffentliche IP(s) zurückgibt.
 *  Da der Socket exakt diese IP verbindet, gibt es kein TOCTOU-/DNS-Rebinding-Fenster
 *  zwischen Prüfung und Verbindung (anders als bei fetch, das selbst neu auflöst).
 *  Der SNI/Host-Name bleibt der echte Hostname → TLS-Zertifikat bleibt gültig. */
const pinnedLookup: LookupFunction = (hostname, options, cb) => {
  lookupCb(hostname, { all: true }, (err, addresses) => {
    if (err) return (cb as (e: Error | null) => void)(err);
    const list = (addresses as unknown as { address: string; family: number }[]) || [];
    if (!list.length || list.some((a) => privateIp(a.address)))
      return (cb as (e: Error | null) => void)(new Error("SSRF blockiert: private Adresse"));
    if ((options as { all?: boolean }).all) return (cb as unknown as (e: null, a: unknown) => void)(null, list);
    (cb as (e: null, a: string, f: number) => void)(null, list[0].address, list[0].family);
  });
};

/** Website-Eingabe normalisieren (https ergänzen) und validieren; null = unzulässig. */
export function normalizeWebsite(site: string): URL | null {
  let s = String(site || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || privateHost(u.hostname)) return null;
    return u;
  } catch { return null; }
}

/** Antwort ggf. entpacken (fetch macht das automatisch, node:http nicht). */
function decompress(res: IncomingMessage): NodeJS.ReadableStream {
  const enc = String(res.headers["content-encoding"] || "").toLowerCase();
  if (enc === "gzip" || enc === "x-gzip") return res.pipe(createGunzip());
  if (enc === "deflate") return res.pipe(createInflate());
  if (enc === "br") return res.pipe(createBrotliDecompress());
  return res;
}

type OneResult = { status: number; location: string; body: string };

/** EINE Anfrage – IP-gepinnt (pinnedLookup), Redirects NICHT automatisch, Body gedeckelt.
 *  Über node:http(s) statt fetch, weil nur so die verbundene IP == die geprüfte IP ist. */
function requestOnce(u: URL, signal: AbortSignal): Promise<OneResult> {
  return new Promise((resolve) => {
    const https = u.protocol === "https:";
    const doRequest = https ? httpsRequest : httpRequest;
    const req = doRequest(
      {
        protocol: u.protocol,
        hostname: u.hostname.replace(/^\[|\]$/g, ""), // reiner Host für SNI/DNS (ohne []-Klammern)
        port: u.port || (https ? 443 : 80),
        path: (u.pathname || "/") + (u.search || ""),
        method: "GET",
        lookup: pinnedLookup, // erzwingt: verbundene IP == geprüfte öffentliche IP
        signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; RapidRemove/1.0)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Encoding": "gzip, deflate, br",
        },
      },
      (res) => {
        const status = res.statusCode || 0;
        const location = String(res.headers.location || "");
        if (status >= 300 && status < 400) { res.resume(); return resolve({ status, location, body: "" }); }
        const chunks: Buffer[] = [];
        let total = 0;
        let settled = false;
        const cap = () => Buffer.concat(chunks).subarray(0, MAX_BYTES).toString("utf8");
        const finish = (body: string) => { if (settled) return; settled = true; try { req.destroy(); } catch { /* egal */ } resolve({ status, location, body }); };
        let stream: NodeJS.ReadableStream;
        try { stream = decompress(res); } catch { res.resume(); return resolve({ status, location, body: "" }); }
        stream.on("data", (c: Buffer) => { if (settled) return; chunks.push(c); total += c.length; if (total >= MAX_BYTES) finish(cap()); });
        stream.on("end", () => finish(cap()));
        stream.on("error", () => finish(""));
        res.on("error", () => finish(""));
      },
    );
    req.on("error", () => resolve({ status: 0, location: "", body: "" }));
    req.end();
  });
}

/** SSRF-sicherer GET: Schema/Host je Hop prüfen, Redirects manuell folgen, Body gedeckelt. */
async function fetchPageText(url: string): Promise<string> {
  let current: URL;
  try { current = new URL(url); } catch { return ""; }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!/^https?:$/.test(current.protocol)) return "";
      if (!(await hostAllowed(current.hostname))) return ""; // Vorprüfung; Pinning setzt es beim Connect endgültig durch
      const r = await requestOnce(current, ctl.signal);
      if (r.status >= 300 && r.status < 400) {
        if (!r.location) return "";
        try { current = new URL(r.location, current); } catch { return ""; }
        continue; // nächster Hop re-validiert Schema + Host + IP-Pin erneut
      }
      if (r.status < 200 || r.status >= 300) return "";
      return r.body;
    }
    return ""; // zu viele Redirects
  } catch { return ""; } finally { clearTimeout(timer); }
}

/** Startseite + gängige Kontakt-/Impressum-Pfade nach E-Mails durchsuchen (max. 5). */
export async function scanWebsiteEmails(u: URL): Promise<string[]> {
  const pages = [u.href, u.origin + "/kontakt", u.origin + "/contact", u.origin + "/impressum", u.origin + "/contact-us"];
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const p of pages) {
    if (emails.length >= 5) break;
    const html = await fetchPageText(p);
    for (const m of html.matchAll(EMAIL_RX)) {
      const e = m[0].toLowerCase();
      if (EMAIL_JUNK.test(e) || seen.has(e)) continue;
      seen.add(e); emails.push(e);
      if (emails.length >= 5) break;
    }
  }
  return emails;
}

/** Besten Kandidaten wählen: Domain der Website > typische Kontakt-Präfixe > erster Fund. */
export function pickBestEmail(emails: string[], host: string): string {
  if (!emails.length) return "";
  const dom = (host || "").toLowerCase().replace(/^www\./, "");
  const onDomain = emails.filter((e) => dom && e.endsWith("@" + dom));
  const pool = onDomain.length ? onDomain : emails;
  const PREF = ["info@", "office@", "kontakt@", "contact@", "hello@", "mail@"];
  for (const p of PREF) { const hit = pool.find((e) => e.startsWith(p)); if (hit) return hit; }
  return pool[0];
}

/* ---------- Server-Worker (braucht eigenen Server-Key, s. o.) ---------- */

const gkey = () => (process.env.GOOGLE_MAPS_API_KEY || "").trim();
export const hasGoogleKey = (): boolean => !!gkey();

/** Unternehmens-Website zu einer Place-ID (Places API New, Feld websiteUri). */
export async function placeWebsite(placeId: string): Promise<string> {
  if (!gkey() || !placeId) return "";
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": "websiteUri" },
    });
    if (!res.ok) return "";
    const j = (await res.json().catch(() => null)) as { websiteUri?: string } | null;
    return (j && j.websiteUri) || "";
  } catch { return ""; }
}

/** Periodische Auto-Recherche für offene Prüfungen ohne E-Mail (best effort). */
export function startLeadEnrichWorker(app: FastifyInstance, everyMs = 30 * 60 * 1000): void {
  if (!hasGoogleKey()) {
    app.log.info("Lead-Recherche: kein GOOGLE_MAPS_API_KEY – Auto-Recherche läuft nur im Admin-Browser");
    return;
  }
  const tick = async () => {
    try {
      if (!dbReady()) return;
      const pending = await listChecksToEnrich(8);   // sanftes Tempo je Tick (Places-Kosten)
      let found = 0;
      for (const c of pending) {
        let email = "";
        try {
          const u = normalizeWebsite(await placeWebsite(c.place_id));
          if (u) email = pickBestEmail(await scanWebsiteEmails(u), u.hostname);
        } catch { /* einzelner Fehlschlag kippt den Lauf nicht */ }
        await markCheckEnriched(c.id, email || null); // auch ohne Fund markieren (kein Endlos-Retry)
        if (email) { found++; app.log.info(`Lead-Recherche: ${c.id} → ${email}`); }
      }
      if (pending.length) app.log.info(`Lead-Recherche: ${pending.length} Prüfung(en) verarbeitet, ${found} E-Mail(s) gefunden`);
    } catch (e) { app.log.error({ err: e }, "Lead-Recherche-Tick fehlgeschlagen"); }
  };
  setTimeout(tick, 25_000);
  setInterval(tick, everyMs);
  app.log.info(`Lead-Recherche aktiv: automatische E-Mail-Suche alle ${Math.round(everyMs / 60000)} Min`);
}
