/* Bewertungs-Wächter (11.11.2026, Maximilian).
 *
 * Täglich werden die Google-Profile aller Bewertungs-Kunden gescannt (SerpApi, neueste zuerst). Taucht eine neue
 * negative Bewertung auf – oder wird eine bestehende auf 1–3 ★ geändert („Edited") –, bekommt der Kunde EINE Mail
 * mit Screenshot, Direktlink und Button ins Dashboard (Bewertung dort vorausgefüllt, Kunde bestätigt, abgebucht wird
 * erst nach der Löschung). Bündelt mehrere neue Bewertungen je Profil und Lauf in einer Mail.
 *
 * Regeln:
 *  - Kunden: alle Bewertungs-Aufträge außer storniert, Test-Adressen und Kunden aus DE/AT (dort kein Produkt).
 *  - Gemeldet wird nur, was wir löschen können: mit Text, 1–REVIEW_WATCH_MAX_STARS ★ (Standard 3), jünger als 4 Wochen
 *    und mindestens 2 Tage Luft bis „vor 4 Wochen". Ab der ersten Bewertung mit „vor 4 Wochen" wird nicht weitergelesen
 *    (reviewsFetch.fetchNewestReviews).
 *  - Schon beauftragte Bewertungen (gleiche Review-ID oder Name+Text in einem Auftrag des Kunden) → keine Mail.
 *  - Erster Scan eines Profils = nur merken (Ausgangsstand), keine Mail.
 *  - Jede Bewertung höchstens einmal (rw_alerts UNIQUE). Abgemeldete Kunden (rw_unsub) bekommen nichts.
 *
 * Schalter (Railway):
 *  - REVIEW_WATCH=on        täglicher Lauf (ab REVIEW_WATCH_HOUR Uhr Wien, Standard 7). Ohne: Worker aus.
 *  - REVIEW_WATCH_SEND=on   Mails wirklich verschicken. Ohne: Treffer werden nur als „Vorschau" gespeichert (Admin).
 *  - REVIEW_WATCH_MAX_STARS (3), REVIEW_WATCH_PAGES (5), REVIEW_WATCH_HOUR (7)
 *
 * Endpunkte:
 *  - POST /admin/review-watch { token, action: "status" | "scan" | "preview", placeId?, email?, orderId? }
 *  - GET  /admin/review-watch/mail?token=…&placeId=…  → fertige Mail im Browser (Bilder eingebettet)
 *  - GET  /rw/unsub?e=…&s=…                            → Kunde meldet sich ab
 */
import crypto from "node:crypto";
import * as React from "react";
import { render } from "@react-email/render";
import type { FastifyInstance } from "fastify";
import { pool, dbReady, insertEvent } from "./db";
import { sendMail, mailTrace, type MailAttachment } from "./mailer";
import { notifyTeam, fmtMoney } from "./notify";
import { fetchNewestReviews, serpKey, type FetchedReview } from "./reviewsFetch";
import { captureReviewCard, shotKey } from "./reviewShots";
import { reviewIdOf } from "./reviewPage";
import { resolveReviewLink } from "./monitor";
import { isTestEmail } from "./testAccounts";
import { dashLink } from "./customers";
import { pricingFor, tierFor } from "./bulkPricing";
import { PRICE_V2_FRESH } from "./reviewsPricing";
import NeueBewertung, { subject as neueBewertungSubject, type NeueBewertungItem } from "./emails/NeueBewertung";

const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const EXCLUDED_COUNTRIES = ["DE", "AT"];
const on = (k: string) => String(process.env[k] || "").toLowerCase() === "on";
const MAX_STARS = () => Math.min(4, Math.max(1, Number(process.env.REVIEW_WATCH_MAX_STARS) || 3));
/** Mindestens so viele Tage Luft bis Tag 28 („vor 4 Wochen"), sonst lohnt die Mail nicht mehr. */
const MIN_DAYS_LEFT = 2;
const OPS_PUBLIC = () => (process.env.OPS_PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN : "")).replace(/\/+$/, "");
const norm = (e: unknown) => String(e || "").trim().toLowerCase();

let secret = "";
const sign = (email: string) => crypto.createHmac("sha256", secret || process.env.RW_SECRET || "rw").update("rw-unsub|" + norm(email)).digest("hex").slice(0, 32);
const unsubUrl = (email: string) => OPS_PUBLIC() ? `${OPS_PUBLIC()}/rw/unsub?e=${encodeURIComponent(norm(email))}&s=${sign(email)}` : undefined;

/* ---------------- Tabellen ---------------- */
let tablesOk = false;
async function ensureTables(): Promise<void> {
  if (tablesOk || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS rw_profiles (
    place_id text PRIMARY KEY, email text NOT NULL, order_id text, business text, lang text, country text, cur text,
    first_name text, baseline_at timestamptz, last_scan_at timestamptz, last_error text, last_found integer,
    created_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rw_seen (place_id text NOT NULL, review_id text NOT NULL, rating integer,
    first_seen timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (place_id, review_id))`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rw_alerts (
    id serial PRIMARY KEY, place_id text NOT NULL, email text NOT NULL, review_id text NOT NULL, name text, rating integer,
    text text, rel text, iso text, link text, edited boolean NOT NULL DEFAULT false, mime text, img bytea,
    status text NOT NULL DEFAULT 'pending', reason text, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz,
    UNIQUE (place_id, review_id))`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rw_order_place (order_id text PRIMARY KEY, place_id text, checked_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rw_unsub (email text PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())`);
  tablesOk = true;
}

/* ---------------- Kunden → Profile ---------------- */
type OrderRow = { id: string; email: string; name: string | null; lang: string | null; country: string | null; profile: string | null; created_at: string; raw: Record<string, any> | null };

/** placeId eines Auftrags: raw.placeId, sonst einmalig über den ersten Bewertungslink ermitteln (gemerkt). */
async function placeOf(o: OrderRow): Promise<string> {
  const pid = String(o.raw?.placeId || "").trim();
  if (pid) return pid;
  const known = await pool!.query(`SELECT place_id FROM rw_order_place WHERE order_id=$1`, [o.id]);
  if (known.rowCount) return String(known.rows[0].place_id || "");
  const link = ((o.raw?.reviewItems || []) as { url?: string }[]).map((i) => i?.url || "").find(Boolean) || "";
  let found = "";
  if (link) found = (await resolveReviewLink(link).catch(() => null))?.place?.placeId || "";
  await pool!.query(`INSERT INTO rw_order_place (order_id, place_id) VALUES ($1,$2) ON CONFLICT (order_id) DO UPDATE SET place_id=EXCLUDED.place_id, checked_at=now()`, [o.id, found || null]);
  return found;
}

/** Alle überwachten Profile aus den Aufträgen aufbauen/aktualisieren (neuester Auftrag je Profil gewinnt). */
async function syncProfiles(): Promise<number> {
  const r = await pool!.query(
    `SELECT id, email, name, lang, country, profile, created_at, raw FROM orders
      WHERE service='reviews' AND COALESCE(status,'') <> 'storniert' AND email IS NOT NULL
      ORDER BY created_at`);
  const byPlace = new Map<string, OrderRow>();
  for (const o of r.rows as OrderRow[]) {
    if (isTestEmail(o.email) || EXCLUDED_COUNTRIES.includes(String(o.country || "").toUpperCase())) continue;
    const pid = await placeOf(o).catch(() => "");
    if (pid) byPlace.set(pid, o); // spätere Aufträge überschreiben frühere
  }
  for (const [pid, o] of byPlace) {
    const lang = LANGS.includes(String(o.lang || "").slice(0, 2)) ? String(o.lang).slice(0, 2) : "en";
    const cur = String(o.raw?.cur || "").toLowerCase() === "usd" || String(o.country || "").toUpperCase() === "US" ? "usd" : "eur";
    const first = String(o.name || "").trim().split(/\s+/)[0] || null;
    await pool!.query(
      `INSERT INTO rw_profiles (place_id, email, order_id, business, lang, country, cur, first_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (place_id) DO UPDATE SET email=EXCLUDED.email, order_id=EXCLUDED.order_id, business=EXCLUDED.business,
         lang=EXCLUDED.lang, country=EXCLUDED.country, cur=EXCLUDED.cur, first_name=EXCLUDED.first_name`,
      [pid, norm(o.email), o.id, String(o.profile || o.raw?.placeName || "").slice(0, 200) || null, lang, String(o.country || "").toUpperCase() || null, cur, first]);
  }
  return byPlace.size;
}

/** Schon beauftragt? Review-IDs aus den Links + „Name|Text" aller (nicht stornierten) Aufträge des Kunden. */
async function orderedRefs(email: string): Promise<{ ids: Set<string>; nameText: Set<string> }> {
  const ids = new Set<string>(), nameText = new Set<string>();
  const r = await pool!.query(`SELECT raw->'reviewItems' AS items FROM orders WHERE lower(email)=$1 AND service='reviews' AND COALESCE(status,'') <> 'storniert'`, [norm(email)]);
  for (const row of r.rows as { items: unknown }[]) for (const it of (Array.isArray(row.items) ? row.items : []) as Record<string, string>[]) {
    const id = reviewIdOf(String(it.url || ""));
    if (id) ids.add(id);
    if (it.name) nameText.add(`${norm(it.name)}|${norm(it.text).slice(0, 80)}`);
  }
  return { ids, nameText };
}

/* ---------------- Preis + Mail ---------------- */
async function priceLabel(email: string, cur: string): Promise<string> {
  const p = await pricingFor(email).catch(() => null);
  if (p && p.source === "custom" && p.tiers.length) {
    const t = tierFor(p.tiers, 1);
    if (t) return fmtMoney(t.price, p.cur);
  }
  return fmtMoney(PRICE_V2_FRESH, cur); // Bestandskunden: 199 (€ bzw. $)
}

type AlertRow = { id: number; place_id: string; email: string; review_id: string; name: string | null; rating: number; text: string | null; rel: string | null; iso: string | null; link: string | null; edited: boolean; mime: string | null; img: Buffer | null; status: string };
type ProfileRow = { place_id: string; email: string; order_id: string | null; business: string | null; lang: string; country: string | null; cur: string; first_name: string | null; baseline_at: string | null };

/** Fertige Mail (Screenshots als Anhang). withLogin=false → Vorschau ohne Login-Link. */
async function buildMail(p: ProfileRow, alerts: AlertRow[], opts: { withLogin: boolean }) {
  const lang = (LANGS.includes(p.lang) ? p.lang : "en") as "en";
  const attachments: MailAttachment[] = [];
  // Screenshot als ANHANG (nicht im Text) – im Text nur Name + Bewertungstext + Direktlink (Maximilian 11.11.2026).
  const safe = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "Review";
  for (const a of alerts) if (a.img && a.mime) attachments.push({ filename: `Screenshot-${safe(a.name || "Review")}.${a.mime.includes("png") ? "png" : "jpg"}`, content: a.img, contentType: a.mime });
  const items: NeueBewertungItem[] = alerts.map((a) => ({ name: a.name || "Google user", rating: a.rating, text: a.text || undefined, link: a.link || undefined }));
  const base = opts.withLogin ? await dashLink(p.email, lang).catch(() => "") : "";
  const links = alerts.map((a) => a.link).filter(Boolean) as string[];
  const dashUrl = base ? base + links.map((l) => "&add=" + encodeURIComponent(l)).join("") : undefined;
  const props = { lang, first: p.first_name || undefined, business: p.business || "Google Business Profile", items, price: await priceLabel(p.email, p.cur), dashUrl: dashUrl || "#", unsubUrl: unsubUrl(p.email) || "#" };
  const html = await render(React.createElement(NeueBewertung as React.FC<typeof props>, props));
  return { html, subject: neueBewertungSubject(props), attachments };
}

/* ---------------- Scan ---------------- */
type ScanResult = { placeId: string; business: string | null; email: string; baseline?: number; scanned?: number; found?: number; mailed?: "sent" | "preview" | null; skipped?: string; error?: string };

const daysLeft = (r: FetchedReview) => 27 - (r.days >= 0 ? r.days : 99);

async function scanProfile(p: ProfileRow, log: FastifyInstance["log"]): Promise<ScanResult> {
  const res: ScanResult = { placeId: p.place_id, business: p.business, email: p.email };
  const unsub = await pool!.query(`SELECT 1 FROM rw_unsub WHERE email=$1`, [p.email]);
  if (unsub.rowCount) return { ...res, skipped: "abgemeldet" };
  let list: FetchedReview[];
  try { list = await fetchNewestReviews(p.place_id, p.lang || "en"); }
  catch (e) {
    const msg = String((e as Error).message || e).slice(0, 300);
    await pool!.query(`UPDATE rw_profiles SET last_scan_at=now(), last_error=$2 WHERE place_id=$1`, [p.place_id, msg]);
    return { ...res, error: msg };
  }
  res.scanned = list.length;

  // Erster Scan: nur Ausgangsstand merken.
  if (!p.baseline_at) {
    for (const r of list) await pool!.query(`INSERT INTO rw_seen (place_id, review_id, rating) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [p.place_id, r.id, r.rating]);
    await pool!.query(`UPDATE rw_profiles SET baseline_at=now(), last_scan_at=now(), last_error=NULL, last_found=0 WHERE place_id=$1`, [p.place_id]);
    return { ...res, baseline: list.length };
  }

  const refs = await orderedRefs(p.email);
  const fresh: { r: FetchedReview; edited: boolean }[] = [];
  for (const r of list) {
    const prev = await pool!.query(`SELECT rating FROM rw_seen WHERE place_id=$1 AND review_id=$2`, [p.place_id, r.id]);
    const isNew = !prev.rowCount;
    const editedDown = !isNew && Number(prev.rows[0].rating) > MAX_STARS() && r.rating <= MAX_STARS();
    await pool!.query(`INSERT INTO rw_seen (place_id, review_id, rating) VALUES ($1,$2,$3) ON CONFLICT (place_id, review_id) DO UPDATE SET rating=EXCLUDED.rating`, [p.place_id, r.id, r.rating]);
    if (!isNew && !editedDown) continue;
    if (r.rating < 1 || r.rating > MAX_STARS() || !String(r.text || "").trim()) continue;
    if (daysLeft(r) < MIN_DAYS_LEFT) continue;
    const rid = reviewIdOf(r.link) || r.id;
    if (refs.ids.has(rid) || refs.ids.has(r.id) || refs.nameText.has(`${norm(r.name)}|${norm(r.text).slice(0, 80)}`)) continue;
    fresh.push({ r, edited: editedDown });
  }

  for (const { r, edited } of fresh) {
    let shot: { buf: Buffer; mime: string } | null = null;
    if (shotKey() && r.link) shot = await captureReviewCard(r.link).catch((e) => { log.warn({ err: String(e) }, "Bewertungs-Wächter: Screenshot fehlgeschlagen"); return null; });
    await pool!.query(
      `INSERT INTO rw_alerts (place_id, email, review_id, name, rating, text, rel, iso, link, edited, mime, img) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (place_id, review_id) DO NOTHING`,
      [p.place_id, p.email, r.id, r.name, r.rating, r.text, r.rel || null, r.date || null, r.link || null, edited, shot?.mime || null, shot?.buf || null]);
  }
  await pool!.query(`UPDATE rw_profiles SET last_scan_at=now(), last_error=NULL, last_found=$2 WHERE place_id=$1`, [p.place_id, fresh.length]);
  res.found = fresh.length;
  res.mailed = await deliver(p, log);
  return res;
}

/** Offene Treffer eines Profils verschicken (bzw. als Vorschau ablegen). */
async function deliver(p: ProfileRow, log: FastifyInstance["log"]): Promise<"sent" | "preview" | null> {
  const a = await pool!.query(`SELECT * FROM rw_alerts WHERE place_id=$1 AND status='pending' ORDER BY id`, [p.place_id]);
  const alerts = a.rows as AlertRow[];
  if (!alerts.length) return null;
  const ids = alerts.map((x) => x.id);
  const who = alerts.map((x) => `${x.name || "?"} ${x.rating}★`).join(", ");
  if (!on("REVIEW_WATCH_SEND")) {
    await pool!.query(`UPDATE rw_alerts SET status='preview' WHERE id = ANY($1::int[])`, [ids]);
    await notifyTeam("Neue schlechte Bewertung (nur Vorschau)", `${p.business || p.place_id} · ${who} · Kunde NICHT angeschrieben (Versand aus)`, undefined, { kind: "review-watch" });
    return "preview";
  }
  const mail = await buildMail(p, alerts, { withLogin: true });
  try {
    const sent = await sendMail({ to: p.email, subject: mail.subject, html: mail.html, attachments: mail.attachments, replyTo: process.env.MAIL_REPLY_TO });
    await pool!.query(`UPDATE rw_alerts SET status='sent', sent_at=now() WHERE id = ANY($1::int[])`, [ids]);
    await insertEvent({ orderId: p.order_id || undefined, email: p.email, type: "mail", title: `Bewertungs-Wächter: neue negative Bewertung gemeldet (automatisch)`, detail: `${who} · an ${p.email} · ${mailTrace(sent)}`, html: mail.html, subject: mail.subject, auto: true }).catch(() => {});
    await notifyTeam("Neue schlechte Bewertung · Kunde informiert", `${p.business || p.place_id} · ${who}`, undefined, { kind: "review-watch" });
    return "sent";
  } catch (e) {
    await pool!.query(`UPDATE rw_alerts SET status='error', reason=$2 WHERE id = ANY($1::int[])`, [ids, String((e as Error).message).slice(0, 300)]);
    log.error({ err: e, place: p.place_id }, "Bewertungs-Wächter: Versand fehlgeschlagen");
    return null;
  }
}

let running = false;
async function runAll(log: FastifyInstance["log"], only?: { placeId?: string; email?: string }): Promise<{ profiles: number; results: ScanResult[] }> {
  if (running) throw new Error("läuft schon");
  running = true;
  try {
    await ensureTables();
    await syncProfiles();
    const where = only?.placeId ? `WHERE place_id=$1` : only?.email ? `WHERE email=$1` : "";
    const args = only?.placeId ? [only.placeId] : only?.email ? [norm(only.email)] : [];
    const r = await pool!.query(`SELECT * FROM rw_profiles ${where} ORDER BY created_at`, args);
    const results: ScanResult[] = [];
    for (const p of r.rows as ProfileRow[]) {
      try { results.push(await scanProfile(p, log)); }
      catch (e) { results.push({ placeId: p.place_id, business: p.business, email: p.email, error: String((e as Error).message).slice(0, 200) }); }
    }
    const found = results.reduce((s, x) => s + (x.found || 0), 0);
    log.info(`Bewertungs-Wächter: ${results.length} Profile gescannt, ${found} neue negative Bewertung(en)`);
    return { profiles: results.length, results };
  } finally { running = false; }
}

/* ---------------- Routen ---------------- */
export function registerReviewWatch(app: FastifyInstance, adminToken: string): void {
  secret = process.env.RW_SECRET || adminToken || "";
  const ok = (t: unknown) => !!adminToken && String(t || "") === adminToken;

  app.post("/admin/review-watch", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!ok(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool || !dbReady()) return reply.code(503).send({ ok: false, error: "keine DB" });
    if (!serpKey()) return reply.code(503).send({ ok: false, error: "SERPAPI_KEY fehlt" });
    await ensureTables();
    const action = String(b.action || "status");
    if (action === "scan") {
      try { return { ok: true, send: on("REVIEW_WATCH_SEND"), ...(await runAll(app.log, { placeId: String(b.placeId || "") || undefined, email: String(b.email || "") || undefined })) }; }
      catch (e) { return reply.code(409).send({ ok: false, error: String((e as Error).message) }); }
    }
    if (action === "sync") return { ok: true, profiles: await syncProfiles() };
    const prof = await pool.query(`SELECT place_id, email, order_id, business, lang, country, baseline_at, last_scan_at, last_error, last_found FROM rw_profiles ORDER BY business`);
    const al = await pool.query(`SELECT id, place_id, email, name, rating, rel, status, edited, created_at, sent_at, (img IS NOT NULL) AS has_img FROM rw_alerts ORDER BY id DESC LIMIT 200`);
    return { ok: true, worker: on("REVIEW_WATCH"), send: on("REVIEW_WATCH_SEND"), profiles: prof.rows, alerts: al.rows };
  });

  /* Fertige Mail eines Profils im Browser (letzte Treffer, Bilder eingebettet, ohne Login-Link). */
  app.get("/admin/review-watch/mail", async (req, reply) => {
    const q = (req.query || {}) as Record<string, string>;
    if (!ok(q.token)) return reply.code(401).send("unauthorized");
    await ensureTables();
    const p = (await pool!.query(`SELECT * FROM rw_profiles WHERE place_id=$1`, [q.placeId])).rows[0] as ProfileRow | undefined;
    if (!p) return reply.code(404).send("Profil nicht überwacht");
    const a = await pool!.query(`SELECT * FROM rw_alerts WHERE place_id=$1 ORDER BY id DESC LIMIT 5`, [p.place_id]);
    if (!a.rowCount) return reply.code(404).send("Keine Treffer für dieses Profil");
    const mail = await buildMail(p, (a.rows as AlertRow[]).reverse(), { withLogin: false });
    return reply.type("text/html; charset=utf-8").send(`<!-- Betreff: ${mail.subject.replace(/--/g, "–")} -->` + mail.html);
  });

  /* Abmeldung (Link in der Mail). */
  app.get("/rw/unsub", async (req, reply) => {
    const q = (req.query || {}) as Record<string, string>;
    const e = norm(q.e);
    const valid = !!e && !!q.s && crypto.timingSafeEqual(Buffer.from(sign(e).padEnd(32)), Buffer.from(String(q.s).slice(0, 32).padEnd(32)));
    if (valid && pool) {
      await ensureTables();
      await pool.query(`INSERT INTO rw_unsub (email) VALUES ($1) ON CONFLICT DO NOTHING`, [e]);
      await insertEvent({ email: e, type: "note", title: "Bewertungs-Wächter abbestellt (Kunde)", detail: e, auto: true }).catch(() => {});
    }
    const msg = valid ? "You won't receive any more review alerts. · Sie erhalten keine weiteren Bewertungs-Hinweise mehr." : "Invalid link. · Ungültiger Link.";
    return reply.type("text/html; charset=utf-8").send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>RapidRemove</title><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f4f4;margin:0;padding:48px 16px"><div style="max-width:460px;margin:0 auto;background:#fff;border-radius:24px;padding:32px"><h1 style="margin:0 0 12px;font-size:24px">RapidRemove</h1><p style="font-size:16px;line-height:1.55;color:#2b2b2b">${msg}</p></div></body>`);
  });
}

/** Täglicher Lauf ab REVIEW_WATCH_HOUR (Wien), einmal pro Tag (ops_flags schützt auch über Neustarts). */
export function startReviewWatchWorker(app: FastifyInstance): void {
  if (!dbReady() || !on("REVIEW_WATCH")) { app.log.info("Bewertungs-Wächter: Worker aus (REVIEW_WATCH≠on)"); return; }
  const hour = Math.min(23, Math.max(0, Number(process.env.REVIEW_WATCH_HOUR) || 7));
  const tick = async () => {
    try {
      const v = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Vienna" }));
      if (v.getHours() < hour || !serpKey() || running) return;
      const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Vienna" });
      await pool!.query(`CREATE TABLE IF NOT EXISTS ops_flags (key text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now())`);
      const f = await pool!.query(`INSERT INTO ops_flags (key) VALUES ($1) ON CONFLICT DO NOTHING RETURNING key`, ["review-watch-" + day]);
      if (!f.rowCount) return;
      await runAll(app.log);
    } catch (e) { app.log.error({ err: e }, "Bewertungs-Wächter: Lauf fehlgeschlagen"); }
  };
  setTimeout(tick, 90_000);
  setInterval(tick, 10 * 60_000);
}
