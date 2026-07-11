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
import { dbReady, listChecksToEnrich, markCheckEnriched } from "./db";

const EMAIL_RX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const EMAIL_JUNK = /\.(png|jpe?g|gif|webp|svg|css|js|woff2?)$|example\.|sentry|wixpress|schema\.org|@\dx\./i;

/** SSRF-Schutz: lokale/private Ziele blocken (Hostnamen-/IP-Literal-Prüfung). */
export const privateHost = (h: string): boolean => {
  const host = h.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.includes(":")) return true;
  const m = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]), c = Number(m[2]);
  return a === 10 || a === 127 || a === 0 || (a === 172 && c >= 16 && c <= 31) || (a === 192 && c === 168) || (a === 169 && c === 254);
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

async function fetchPageText(url: string): Promise<string> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 6000);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; RapidRemove/1.0)" } });
    if (!res.ok) return "";
    const buf = await res.arrayBuffer();
    return Buffer.from(buf.slice(0, 400_000)).toString("utf8"); // Größen-Deckel pro Seite
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
