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

function apiUrl(target: string): string {
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
  p.append("headers", "Accept-Language:de-DE,de;q=0.9");
  p.append("cookies", "CONSENT=YES+; Domain=.google.com; Path=/");
  p.append("cookies", "SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmRlIAEaBgiA_LyaBg; Domain=.google.com; Path=/");
  const qs = p.toString();
  const sig = shotSecret() ? "&signature=" + createHmac("sha256", shotSecret()).update(qs).digest("hex") : "";
  return (process.env.SCREENSHOT_API_BASE || "https://api.screenshotone.com") + "/take?" + qs + sig;
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
const running = new Set<string>();

/**
 * Screenshots für eine Bestellung im Hintergrund aufnehmen (blockiert nie die
 * Antwort). onlyMissing: nur Bewertungen ohne erfolgreichen Screenshot.
 */
export function queueReviewShots(orderId: string, items: Item[], log?: (o: object, m: string) => void, onlyMissing = false): boolean {
  if (!shotKey() || !dbReady() || !pool || !orderId) return false;
  if (running.has(orderId)) return true;
  void runShots(orderId, items, log, onlyMissing);
  return true;
}

/** Nimmt die Screenshots einer Bestellung auf (sequenziell, 1 Wiederholung je Bewertung). */
async function runShots(orderId: string, items: Item[], log?: (o: object, m: string) => void, onlyMissing = false): Promise<number> {
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
    for (let i = 0; i < items.length; i++) {
      const u = items[i] && items[i].url;
      if (!u || have.has(i)) continue;
      let done = false;
      for (let attempt = 0; attempt < 2 && !done; attempt++) {
        await takeOne(orderId, i, u);
        const r = await pool!.query(`SELECT status FROM review_shots WHERE order_id = $1 AND idx = $2`, [orderId, i]);
        done = r.rows[0] && r.rows[0].status === "ok";
      }
      if (done) taken++;
    }
    if (log) log({ orderId, n: items.length, taken }, "Bewertungs-Screenshots fertig");
  } catch (e) {
    if (log) log({ orderId, err: String((e as Error)?.message || e) }, "Bewertungs-Screenshots fehlgeschlagen");
  } finally { running.delete(orderId); }
  return taken;
}

let backfillRunning = false;
/**
 * Nachholen: alle Bewertungs-Bestellungen der letzten `days` Tage, denen noch
 * Screenshots fehlen — Bestellung für Bestellung (keine Lastspitze bei der API).
 * Läuft beim Serverstart automatisch (sobald SCREENSHOTONE_KEY gesetzt ist) und
 * per Admin-Endpunkt.
 */
export async function backfillReviewShots(days = 14, log?: (o: object, m: string) => void): Promise<{ orders: number; taken: number } | null> {
  if (!shotKey() || !dbReady() || !pool || backfillRunning) return null;
  backfillRunning = true;
  let orders = 0, taken = 0;
  try {
    await ensureTable();
    const r = await pool.query(
      `SELECT o.id, o.raw->'reviewItems' AS items
         FROM orders o
        WHERE o.service = 'reviews' AND o.created_at > now() - make_interval(days => $1::int)
          AND jsonb_typeof(o.raw->'reviewItems') = 'array'
        ORDER BY o.created_at`,
      [Math.max(1, Math.min(90, Math.round(days)))],
    );
    for (const row of r.rows as { id: string; items: Item[] }[]) {
      const items = Array.isArray(row.items) ? row.items : [];
      if (!items.some((it) => it && it.url)) continue;
      const okRows = await pool.query(`SELECT count(*)::int AS n FROM review_shots WHERE order_id = $1 AND status = 'ok'`, [row.id]);
      if (okRows.rows[0].n >= items.filter((it) => it && it.url).length) continue;
      orders++;
      taken += await runShots(row.id, items, log, true);
    }
    if (log) log({ days, orders, taken }, "Bewertungs-Screenshots nachgeholt");
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

/** Bewertungs-Items einer Bestellung aus dem raw-JSON (für „Neu aufnehmen"). */
export async function orderReviewItems(orderId: string): Promise<Item[]> {
  if (!dbReady() || !pool) return [];
  const r = await pool.query(`SELECT raw->'reviewItems' AS items FROM orders WHERE id = $1`, [orderId]);
  const items = r.rows[0] && r.rows[0].items;
  return Array.isArray(items) ? items : [];
}

export const shotsRunning = (orderId: string) => running.has(orderId);
