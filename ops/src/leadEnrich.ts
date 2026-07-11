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
import { isIP } from "node:net";
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
 *  Schließt „öffentlicher Name → interne IP" – der Rest-Fall DNS-Rebinding bleibt bei
 *  reinem fetch ohne IP-Pinning nur eng begrenzt möglich (Best-Effort-Worker). */
async function hostAllowed(hostname: string): Promise<boolean> {
  if (privateHost(hostname)) return false;
  if (isIP(hostname)) return !privateIp(hostname); // Literal schon geprüft, aber sicher ist sicher
  try {
    const addrs = await lookup(hostname, { all: true });
    if (!addrs.length) return false;
    return addrs.every((a) => !privateIp(a.address)); // ein einziger privater Treffer blockt
  } catch { return false; }
}

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

/** Antwort-Body streamen und bei MAX_BYTES hart abschneiden (kein Voll-Puffern). */
async function readCapped(res: Response): Promise<string> {
  const body = res.body;
  if (!body) return "";
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
        if (total >= MAX_BYTES) break;
      }
    }
  } finally {
    try { await reader.cancel(); } catch { /* egal */ }
  }
  return Buffer.concat(chunks).subarray(0, MAX_BYTES).toString("utf8");
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
      if (!(await hostAllowed(current.hostname))) return "";
      const res = await fetch(current.href, {
        signal: ctl.signal,
        redirect: "manual", // jeden Hop selbst re-validieren (302 → interne IP blocken)
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RapidRemove/1.0)" },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        try { await res.body?.cancel(); } catch { /* egal */ }
        if (!loc) return "";
        try { current = new URL(loc, current); } catch { return ""; }
        continue; // nächste Runde re-validiert Schema + Host + DNS erneut
      }
      if (!res.ok) return "";
      return await readCapped(res);
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
