/*
 * reviewShots.ts — automatischer Screenshot JEDER bestellten Bewertung.
 *
 * Bei jeder Bestellung „Einzelne Bewertungen löschen" wird von jeder Bewertung
 * mit Link ein Screenshot der Google-Seite gemacht und in Postgres abgelegt
 * (Tabelle review_shots). Das Admin-Dashboard zeigt sie bei der Bestellung an
 * (Beweis, wie die Bewertung vor der Löschung aussah).
 *
 * Kein eigener Browser auf dem Server: die Aufnahme macht die Screenshot-API
 * ScreenshotOne (https://screenshotone.com) — ein HTTP-Aufruf je Bewertung.
 * Schlüssel: Railway-Variable SCREENSHOTONE_KEY (Access Key; NIE ins Repo).
 * Optional: SCREENSHOTONE_SECRET (Signatur der Aufrufe), SCREENSHOT_DELAY (s).
 * Ohne Schlüssel passiert nichts, die Bestellung läuft normal.
 */
import { createHmac } from "node:crypto";
import { pool, dbReady } from "./db";

export const shotKey = (): string => (process.env.SCREENSHOTONE_KEY || "").trim();
const shotSecret = (): string => (process.env.SCREENSHOTONE_SECRET || "").trim();

let ready = false;
async function ensureTable(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS review_shots (
      id          serial PRIMARY KEY,
      order_id    text NOT NULL,
      idx         integer NOT NULL,
      url         text NOT NULL,
      status      text NOT NULL DEFAULT 'pending',
      error       text,
      mime        text,
      img         bytea,
      created_at  timestamptz NOT NULL DEFAULT now(),
      UNIQUE (order_id, idx)
    )
  `);
  ready = true;
}

/** Google-Link für die Aufnahme: deutsche Oberfläche, Consent-Seite umgehen. */
function targetUrl(u: string): string {
  try {
    const url = new URL(u);
    if (/(^|\.)google\.[a-z.]+$/.test(url.hostname) && !url.searchParams.has("hl")) url.searchParams.set("hl", "de");
    return url.toString();
  } catch { return u; }
}

function apiUrl(target: string, withTitle = false): string {
  const p = new URLSearchParams({
    access_key: shotKey(),
    url: targetUrl(target),
    viewport_width: "1280",
    viewport_height: "900",
    device_scale_factor: "1",
    format: "jpg",
    image_quality: "82",
    delay: String(Math.min(30, Math.max(0, Number(process.env.SCREENSHOT_DELAY) || 8))),
    timeout: "90",
    navigation_timeout: "30",
    block_cookie_banners: "true",
    block_ads: "true",
    cache: "false",
  });
  // Google-Einwilligung vorab setzen, sonst landet die Aufnahme auf „Bevor Sie fortfahren".
  if (withTitle) p.set("metadata_page_title", "true"); // Seitentitel → Header x-screenshotone-page-title
  p.append("headers", "Accept-Language:de-DE,de;q=0.9");
  p.append("cookies", "CONSENT=YES+; Domain=.google.com; Path=/");
  p.append("cookies", "SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmRlIAEaBgiA_LyaBg; Domain=.google.com; Path=/");
  const qs = p.toString();
  const sig = shotSecret() ? "&signature=" + createHmac("sha256", shotSecret()).update(qs).digest("hex") : "";
  return (process.env.SCREENSHOT_API_BASE || "https://api.screenshotone.com") + "/take?" + qs + sig;
}

/**
 * Ein Screenshot + Seitentitel (für die Monitor-Verifizierung: Google Maps trägt den
 * Firmennamen im Titel, ein leerer/fehlender Eintrag nur „Google Maps"). Wirft bei Fehlern.
 */
export async function captureShot(url: string): Promise<{ buf: Buffer; mime: string; title: string }> {
  if (!shotKey()) throw new Error("SCREENSHOTONE_KEY fehlt");
  const res = await fetch(apiUrl(url, true), { signal: AbortSignal.timeout(100_000) });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.startsWith("image/")) {
    const t = await res.text().catch(() => "");
    throw new Error("HTTP " + res.status + " " + t.slice(0, 200));
  }
  let title = res.headers.get("x-screenshotone-page-title") || "";
  try { title = decodeURIComponent(title); } catch { /* roh lassen */ }
  return { buf: Buffer.from(await res.arrayBuffer()), mime: type.split(";")[0], title };
}

async function takeOne(orderId: string, idx: number, url: string): Promise<void> {
  await pool!.query(
    `INSERT INTO review_shots (order_id, idx, url, status) VALUES ($1,$2,$3,'pending')
     ON CONFLICT (order_id, idx) DO UPDATE SET url = EXCLUDED.url, status = 'pending', error = NULL`,
    [orderId, idx, url],
  );
  try {
    const res = await fetch(apiUrl(url), { signal: AbortSignal.timeout(100_000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) {
      const t = await res.text().catch(() => "");
      throw new Error("HTTP " + res.status + " " + t.slice(0, 200));
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await pool!.query(
      `UPDATE review_shots SET status = 'ok', mime = $3, img = $4, error = NULL, created_at = now() WHERE order_id = $1 AND idx = $2`,
      [orderId, idx, type.split(";")[0], buf],
    );
  } catch (e) {
    await pool!.query(
      `UPDATE review_shots SET status = 'error', error = $3 WHERE order_id = $1 AND idx = $2`,
      [orderId, idx, String((e as Error)?.message || e).slice(0, 300)],
    );
  }
}

type Item = { url?: string };
type Entry = { idx: number; url: string };
const running = new Set<string>();

/** idx des Unternehmensprofil-Screenshots (Bewertungen haben 0, 1, 2 …). */
export const PROFILE_IDX = -1;

const reviewEntries = (items: Item[]): Entry[] =>
  (items || []).map((it, i) => ({ idx: i, url: (it && it.url) || "" })).filter((e) => e.url);

/** Google-Link des Unternehmensprofils aus den Bestelldaten (mapsUri, sonst placeId). */
export function profileTarget(raw: Record<string, unknown> | null | undefined): string {
  if (!raw) return "";
  const m = String(raw.mapsUri || "").trim();
  if (/^https?:\/\//i.test(m)) return m;
  const pid = String(raw.placeId || "").trim();
  if (/^[A-Za-z0-9_-]{10,200}$/.test(pid)) return "https://www.google.com/maps/place/?q=place_id:" + pid;
  return "";
}

/** Was für eine Bestellung aufzunehmen ist: Bewertungen bzw. das Profil (Presse: nichts). */
function entriesFor(service: string, raw: Record<string, unknown> | null): Entry[] {
  if (service === "deindex") return [];
  const t = profileTarget(raw);
  const prof: Entry[] = t ? [{ idx: PROFILE_IDX, url: t }] : [];
  // Bewertungs-Bestellungen: jede Bewertung + zusätzlich das Google-Profil.
  if (service === "reviews") return [...reviewEntries(Array.isArray(raw && raw.reviewItems) ? (raw!.reviewItems as Item[]) : []), ...prof];
  return prof;
}

function enqueue(orderId: string, entries: Entry[], log?: (o: object, m: string) => void, onlyMissing = false): boolean {
  if (!shotKey() || !dbReady() || !pool || !orderId || !entries.length) return false;
  if (running.has(orderId)) return true;
  void runShots(orderId, entries, log, onlyMissing);
  return true;
}

/**
 * Screenshots der Bewertungen einer Bestellung im Hintergrund aufnehmen
 * (blockiert nie die Antwort). onlyMissing: nur ohne erfolgreichen Screenshot.
 */
export function queueReviewShots(orderId: string, items: Item[], log?: (o: object, m: string) => void, onlyMissing = false): boolean {
  return enqueue(orderId, reviewEntries(items), log, onlyMissing);
}

/** Alle Screenshots einer neuen Bestellung (Bewertungen und/oder Profil) im Hintergrund. */
export function queueOrderShots(orderId: string, service: string, raw: Record<string, unknown>, log?: (o: object, m: string) => void): boolean {
  return enqueue(orderId, entriesFor(service, raw), log);
}

/** Screenshot des Google-Unternehmensprofils einer Profil-Bestellung (Hintergrund). */
export function queueProfileShot(orderId: string, raw: Record<string, unknown>, log?: (o: object, m: string) => void): boolean {
  const t = profileTarget(raw);
  return t ? enqueue(orderId, [{ idx: PROFILE_IDX, url: t }], log) : false;
}

/** Nimmt die Screenshots einer Bestellung auf (sequenziell, 1 Wiederholung je Bild). */
async function runShots(orderId: string, entries: Entry[], log?: (o: object, m: string) => void, onlyMissing = false): Promise<number> {
  if (running.has(orderId)) return 0;
  running.add(orderId);
  let taken = 0;
  try {
    await ensureTable();
    let have = new Set<number>();
    if (onlyMissing) {
      const r = await pool!.query(`SELECT idx FROM review_shots WHERE order_id = $1 AND status = 'ok'`, [orderId]);
      have = new Set(r.rows.map((x: { idx: number }) => x.idx));
    }
    for (const e of entries) {
      if (have.has(e.idx)) continue;
      let done = false;
      for (let attempt = 0; attempt < 2 && !done; attempt++) {
        await takeOne(orderId, e.idx, e.url);
        const r = await pool!.query(`SELECT status FROM review_shots WHERE order_id = $1 AND idx = $2`, [orderId, e.idx]);
        done = r.rows[0] && r.rows[0].status === "ok";
      }
      if (done) taken++;
    }
    if (log) log({ orderId, n: entries.length, taken }, "Screenshots fertig");
  } catch (e) {
    if (log) log({ orderId, err: String((e as Error)?.message || e) }, "Screenshots fehlgeschlagen");
  } finally { running.delete(orderId); }
  return taken;
}

let backfillRunning = false;
/**
 * Nachholen: alle Bestellungen der letzten `days` Tage (Bewertungen UND
 * Unternehmensprofile), denen noch Screenshots fehlen — Bestellung für
 * Bestellung (keine Lastspitze bei der API). Läuft beim Serverstart automatisch
 * (sobald SCREENSHOTONE_KEY gesetzt ist) und per Admin-Endpunkt.
 */
export async function backfillReviewShots(days = 14, log?: (o: object, m: string) => void): Promise<{ orders: number; taken: number } | null> {
  if (!shotKey() || !dbReady() || !pool || backfillRunning) return null;
  backfillRunning = true;
  let orders = 0, taken = 0;
  try {
    await ensureTable();
    const r = await pool.query(
      `SELECT o.id, o.service, o.raw FROM orders o
        WHERE o.created_at > now() - make_interval(days => $1::int)
          AND COALESCE(o.service, '') <> 'deindex'
        ORDER BY o.created_at`,
      [Math.max(1, Math.min(90, Math.round(days)))],
    );
    for (const row of r.rows as { id: string; service: string | null; raw: Record<string, unknown> | null }[]) {
      const entries = entriesFor(String(row.service || ""), row.raw);
      if (!entries.length) continue;
      const ok = await pool.query(`SELECT idx FROM review_shots WHERE order_id = $1 AND status = 'ok'`, [row.id]);
      const have = new Set(ok.rows.map((x: { idx: number }) => x.idx));
      if (entries.every((e) => have.has(e.idx))) continue;
      orders++;
      taken += await runShots(row.id, entries, log, true);
    }
    if (log) log({ days, orders, taken }, "Screenshots nachgeholt");
  } catch (e) {
    if (log) log({ err: String((e as Error)?.message || e) }, "Screenshot-Nachholen fehlgeschlagen");
  } finally { backfillRunning = false; }
  return { orders, taken };
}
export const backfillActive = () => backfillRunning;

export async function listShots(orderId: string) {
  if (!dbReady() || !pool) return [];
  await ensureTable();
  const r = await pool.query(
    `SELECT id, idx, url, status, error, created_at FROM review_shots WHERE order_id = $1 ORDER BY idx`,
    [orderId],
  );
  return r.rows;
}

export async function getShot(id: number): Promise<{ mime: string; img: Buffer } | null> {
  if (!dbReady() || !pool) return null;
  await ensureTable();
  const r = await pool.query(`SELECT mime, img FROM review_shots WHERE id = $1 AND status = 'ok'`, [id]);
  return r.rows[0] && r.rows[0].img ? { mime: r.rows[0].mime || "image/jpeg", img: r.rows[0].img } : null;
}

/** „Neu aufnehmen" im Admin: fehlende/fehlgeschlagene Screenshots einer Bestellung. */
export async function retakeShots(orderId: string, log?: (o: object, m: string) => void): Promise<boolean> {
  if (!dbReady() || !pool) return false;
  const r = await pool.query(`SELECT service, raw FROM orders WHERE id = $1`, [orderId]);
  if (!r.rows[0]) return false;
  return enqueue(orderId, entriesFor(String(r.rows[0].service || ""), r.rows[0].raw), log, true);
}

export const shotsRunning = (orderId: string) => running.has(orderId);
