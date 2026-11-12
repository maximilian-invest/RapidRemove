/* Datums-Prüfung nach der Bestellung (12.11.2026, Maximilian: „können wir auch erst später prüfen, ich will's nur nicht
 * manuell machen“).
 *
 * Problem: Bei nachträglich bearbeiteten Bewertungen zeigen Google („vor einer Woche (bearbeitet)“) und SerpApi nur das
 * Bearbeitungsdatum. Maßgeblich ist das URSPRÜNGLICHE Veröffentlichungsdatum – ist es ≥ 28 Tage vor der Bestellung,
 * können wir die Bewertung nicht übernehmen.
 *
 * Ablauf (alle 30 Min.): neue Bewertungs-Aufträge (ab REVIEW_DATECHECK_SINCE) → jede noch nicht geprüfte Bewertung mit
 * Link einmal über die Google-Seitendaten prüfen (reviewShots.captureReviewDates: Erstell- + Bearbeitungsdatum).
 *  - ursprünglich ≥ 28 Tage vor der Bestellung → automatisch storniert (orders.raw.reviewsTooOld[key]): Status
 *    „storniert“ im Dashboard/Admin, wird nicht abgerechnet; Kunde bekommt EINE Mail je Auftrag (StornoReviewEdited),
 *    Eintrag im Auftragsprotokoll, Team-Push.
 *  - schon gelöscht / beim Partner in Arbeit → nichts automatisch, nur Team-Push.
 *  - Datum nicht ermittelbar → bis zu 3 Versuche, danach Team-Push „bitte selbst prüfen“.
 * Ergebnis je Bewertung in orders.raw.reviewsDateCheck[key] = { at, created?, edited?, tries, tooOld? }.
 *
 * Schalter REVIEW_DATECHECK (Maximilian 12.11.: „vorerst nur an mich senden, damit ich prüfen kann“):
 *  - preview (Standard): NICHTS wird storniert, der Kunde bekommt nichts. Die Mail, die der Kunde bekäme, geht an den
 *    Inhaber („[PRÜFUNG] an …“), dazu Team-Push. Ziel: REVIEW_DATECHECK_PREVIEW_TO, sonst die Inhaber-Adresse (aus den
 *    Aufträgen über den SHA in testAccounts – steht nicht im öffentlichen Repo).
 *  - live: stornieren + Kunden-Mail (auch alle Treffer, die vorher nur als Prüfung gemeldet wurden).
 *  - off: aus. Ältere Aufträge (vor SINCE) werden NICHT automatisch angefasst –
 * dafür POST /admin/review-datecheck { token, orderIds?, days?, apply? } (ohne apply = nur Liste).
 */
import type { FastifyInstance } from "fastify";
import { pool, dbReady, insertEvent, setOrderRawField } from "./db";
import { sendMail, mailTrace } from "./mailer";
import { notifyTeam } from "./notify";
import { captureReviewDates, shotKey } from "./reviewShots";
import { reviewIdOf } from "./reviewPage";
import { keyOf, dashLink } from "./customers";
import crypto from "node:crypto";
import { isTestEmail, OWNER_EMAIL_SHA } from "./testAccounts";
import { renderTemplate } from "./renderTemplate";

const SINCE = () => process.env.REVIEW_DATECHECK_SINCE || "2026-11-12T11:00:00Z";
const DAY = 86_400_000;
const MAX_TRIES = 3;
type Mode = "off" | "preview" | "live";
const mode = (): Mode => { const v = String(process.env.REVIEW_DATECHECK || "preview").toLowerCase(); return v === "off" ? "off" : v === "live" ? "live" : "preview"; };
let ownerCache = "";
async function previewTo(): Promise<string> {
  const env = String(process.env.REVIEW_DATECHECK_PREVIEW_TO || "").trim();
  if (env) return env;
  if (ownerCache) return ownerCache;
  const r = await pool!.query(`SELECT DISTINCT lower(email) AS e FROM orders WHERE email IS NOT NULL ORDER BY 1`).catch(() => null);
  ownerCache = (r?.rows || []).map((x: { e: string }) => x.e).find((e: string) => crypto.createHash("sha256").update(e).digest("hex") === OWNER_EMAIL_SHA) || "";
  return ownerCache;
}

type Item = { url?: string; name?: string; text?: string; rating?: number; days?: number };
type Check = { at: string; created?: string; edited?: string; tries: number; tooOld?: boolean; previewed?: string; note?: string };
type OrderRow = { id: string; email: string; name: string | null; lang: string | null; status: string | null; created_at: string; raw: Record<string, any> | null };

/** Reine Entscheidung (getestet): zu alt = ursprünglich ≥ 28 Tage vor der Bestellung veröffentlicht. */
export function tooOldAtOrder(createdIso: string, orderCreatedIso: string): boolean {
  const c = Date.parse(createdIso), o = Date.parse(orderCreatedIso);
  return Number.isFinite(c) && Number.isFinite(o) && o - c >= 28 * DAY;
}

/** Status einer Bewertung im Auftrag, soweit für die Prüfung nötig. */
async function itemState(o: OrderRow, key: string): Promise<"removed" | "partner" | "open"> {
  const raw = o.raw || {};
  const rem = [...(Array.isArray(raw.reviewsRemovedAll) ? raw.reviewsRemovedAll : []), ...(Array.isArray(raw.reviewsRemoved) ? raw.reviewsRemoved : [])] as Item[];
  if (rem.some((x) => keyOf(x) === key)) return "removed";
  const t = await pool!.query(`SELECT status FROM partner_tasks WHERE order_id=$1 AND item_key=$2 AND status <> 'cancelled' ORDER BY id DESC LIMIT 1`, [o.id, key]).catch(() => null);
  const s = t?.rows[0]?.status as string | undefined;
  if (s === "removed") return "removed";
  if (s && s !== "new") return "partner";
  return "open";
}

type Found = { key: string; it: Item; created: string; edited: string; state: "removed" | "partner" | "open" };

/** Einen Auftrag prüfen. apply=false → nur ermitteln (nichts speichern, keine Mail). */
async function checkOrder(o: OrderRow, apply: boolean, log: FastifyInstance["log"], m: Mode = mode()): Promise<{ checked: number; tooOld: Found[]; failed: string[] }> {
  const raw = o.raw || {};
  const items = (Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as Item[];
  const done = { ...((raw.reviewsDateCheck as Record<string, Check>) || {}) };
  const gone = { ...((raw.reviewsTooOld as Record<string, unknown>) || {}) };
  const tooOld: Found[] = [], failed: string[] = [];
  let checked = 0, dirty = false;
  for (const it of items) {
    const key = keyOf(it);
    const prev = done[key];
    if (gone[key]) continue;
    if (prev?.created) {
      // schon geprüft: in „live“ die vorher nur gemeldeten (Prüfmodus) jetzt wirklich stornieren
      if (prev.tooOld && m === "live") tooOld.push({ key, it, created: prev.created, edited: prev.edited || prev.created, state: await itemState(o, key) });
      continue;
    }
    if (prev && prev.tries >= MAX_TRIES) continue;
    const rid = reviewIdOf(String(it.url || ""));
    if (!it.url || !rid) { if (apply) { done[key] = { at: new Date().toISOString(), tries: MAX_TRIES, note: "kein Direktlink mit Review-ID" }; dirty = true; } continue; }
    checked++;
    const d = await captureReviewDates(it.url, rid).catch((e) => { log.warn({ err: String(e), order: o.id }, "Datums-Prüfung: Abruf fehlgeschlagen"); return null; });
    if (!d) {
      const tries = (prev?.tries || 0) + 1;
      if (apply) { done[key] = { at: new Date().toISOString(), tries }; dirty = true; }
      if (tries >= MAX_TRIES) failed.push(it.name || it.url);
      continue;
    }
    const old = tooOldAtOrder(d.created, o.created_at);
    if (apply) { done[key] = { at: new Date().toISOString(), created: d.created, edited: d.edited, tries: (prev?.tries || 0) + 1, ...(old ? { tooOld: true } : {}) }; dirty = true; }
    if (old) tooOld.push({ key, it, created: d.created, edited: d.edited, state: await itemState(o, key) });
  }
  if (!apply) return { checked, tooOld, failed };

  const cancel = tooOld.filter((f) => f.state === "open");
  if (m === "preview") {
    // Prüfmodus: nichts stornieren – die Kunden-Mail geht an den Inhaber (je Bewertung nur einmal).
    const fresh = cancel.filter((f) => !done[f.key]?.previewed);
    for (const f of fresh) { done[f.key] = { ...(done[f.key] || { at: new Date().toISOString(), tries: 1 }), previewed: new Date().toISOString() }; dirty = true; }
    if (dirty) await setOrderRawField(o.id, "reviewsDateCheck", done);
    const to = fresh.length ? await previewTo() : "";
    if (fresh.length && to) {
      const lang = String(o.lang || "en").slice(0, 2);
      const props = { lang, name: String(o.name || "").trim().split(/\s+/)[0] || "", orderId: o.id, others: items.length - Object.keys(gone).length - fresh.length,
        items: fresh.map((f) => ({ name: f.it.name, text: f.it.text, url: f.it.url, created: f.created })) };
      try {
        const { html, subject } = await renderTemplate("storno-bewertung-bearbeitet", props as Record<string, unknown>);
        const note = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:12px auto;padding:12px 16px;background:#fff3cd;border-radius:12px;font-size:14px;color:#664d03"><b>PRÜFUNG – nicht an den Kunden geschickt, nichts storniert.</b><br>Auftrag ${o.id} · Kunde: ${o.email}<br>${fresh.map((f) => `${f.it.name || "?"}: ursprünglich ${f.created.slice(0, 10)}, bearbeitet ${f.edited.slice(0, 10)}`).join("<br>")}<br>Live schalten: Railway REVIEW_DATECHECK=live</div>`;
        await sendMail({ to, subject: `[PRÜFUNG] an ${o.email}: ${subject}`, html: html.replace(/<body([^>]*)>/i, (x) => x + note) });
        await insertEvent({ orderId: o.id, email: o.email, type: "note", auto: true, title: "Datums-Prüfung (Prüfmodus): Bewertung wäre storniert worden – nur an Inhaber gemeldet",
          detail: fresh.map((f) => `${f.it.name || "?"} (ursprünglich ${f.created.slice(0, 10)}, bearbeitet ${f.edited.slice(0, 10)})`).join(" · ") });
      } catch (e) { log.error({ err: e, order: o.id }, "Datums-Prüfung: Prüf-Mail fehlgeschlagen"); }
      await notifyTeam("Prüfung: Bewertung wäre storniert worden", `${o.id} · ${fresh.map((f) => `${f.it.name || "?"}, ursprünglich ${f.created.slice(0, 10)}`).join(" · ")} · Kunde NICHT informiert`, o.id, { kind: "review-datecheck" }).catch(() => {});
    }
    return { checked, tooOld, failed };
  }
  for (const f of cancel) gone[f.key] = { at: new Date().toISOString(), created: f.created, edited: f.edited };
  if (dirty) await setOrderRawField(o.id, "reviewsDateCheck", done);
  if (cancel.length) {
    await setOrderRawField(o.id, "reviewsTooOld", gone);
    const lang = String(o.lang || "en").slice(0, 2);
    const others = items.length - Object.keys(gone).length;
    const props = { lang, name: String(o.name || "").trim().split(/\s+/)[0] || "", orderId: o.id, others, dashUrl: await dashLink(o.email, lang).catch(() => undefined),
      items: cancel.map((f) => ({ name: f.it.name, text: f.it.text, url: f.it.url, created: f.created })) };
    try {
      const { html, subject } = await renderTemplate("storno-bewertung-bearbeitet", props as Record<string, unknown>);
      const sent = await sendMail({ to: o.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
      await insertEvent({ orderId: o.id, email: o.email, type: "mail", auto: true, html, subject,
        title: "Bewertung automatisch storniert – bearbeitet, ursprünglich älter als 4 Wochen",
        detail: cancel.map((f) => `${f.it.name || "?"} (ursprünglich ${f.created.slice(0, 10)}, bearbeitet ${f.edited.slice(0, 10)})`).join(" · ") + ` · an ${o.email} · ${mailTrace(sent)}` });
    } catch (e) { log.error({ err: e, order: o.id }, "Datums-Prüfung: Storno-Mail fehlgeschlagen"); }
    await notifyTeam("Bewertung automatisch storniert (zu alt)", `${o.id} · ${cancel.map((f) => `${f.it.name || "?"}, ursprünglich ${f.created.slice(0, 10)}`).join(" · ")} · Kunde informiert`, o.id, { kind: "review-datecheck" }).catch(() => {});
  }
  const manual = tooOld.filter((f) => f.state !== "open");
  if (manual.length) await notifyTeam("Bewertung zu alt – bitte prüfen", `${o.id} · ${manual.map((f) => `${f.it.name || "?"} (ursprünglich ${f.created.slice(0, 10)}, ${f.state === "removed" ? "schon gelöscht" : "beim Partner"})`).join(" · ")}`, o.id, { kind: "review-datecheck" }).catch(() => {});
  if (failed.length) await notifyTeam("Bewertungsdatum nicht prüfbar", `${o.id} · ${failed.join(" · ")} · bitte selbst ansehen`, o.id, { kind: "review-datecheck" }).catch(() => {});
  return { checked, tooOld, failed };
}

let running = false;
async function tick(log: FastifyInstance["log"]): Promise<void> {
  if (running || !pool || !dbReady() || !shotKey() || mode() === "off") return;
  running = true;
  try {
    const r = await pool.query(
      `SELECT id, email, name, lang, status, created_at, raw FROM orders
        WHERE service='reviews' AND COALESCE(status,'') <> 'storniert' AND created_at >= $1 AND created_at > now() - interval '30 days'
        ORDER BY created_at LIMIT 40`, [SINCE()]);
    for (const o of r.rows as OrderRow[]) {
      if (isTestEmail(o.email) && process.env.REVIEW_DATECHECK_TESTS !== "on") continue;
      await checkOrder(o, true, log).catch((e) => log.error({ err: e, order: o.id }, "Datums-Prüfung fehlgeschlagen"));
    }
  } finally { running = false; }
}

export function registerReviewDateCheck(app: FastifyInstance, adminToken: string): void {
  /* Admin: Aufträge (auch ältere) prüfen. Ohne apply nur Liste – nichts wird gespeichert, keine Mail.
   * Mit apply wie der Worker je nach Modus (preview: Mail an Inhaber · live: stornieren + Kunden-Mail).
   * { token, orderIds?: string[], days?: number (Standard 30), apply?: boolean } */
  app.post("/admin/review-datecheck", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool || !dbReady()) return reply.code(503).send({ ok: false, error: "keine DB" });
    if (!shotKey()) return reply.code(503).send({ ok: false, error: "SCREENSHOTONE_KEY fehlt" });
    const ids = (Array.isArray(b.orderIds) ? b.orderIds : []).map(String).filter(Boolean).slice(0, 50);
    const days = Math.min(60, Math.max(1, Number(b.days) || 30));
    const r = ids.length
      ? await pool.query(`SELECT id, email, name, lang, status, created_at, raw FROM orders WHERE id = ANY($1::text[]) AND service='reviews'`, [ids])
      : await pool.query(`SELECT id, email, name, lang, status, created_at, raw FROM orders WHERE service='reviews' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - ($1 || ' days')::interval ORDER BY created_at`, [String(days)]);
    const apply = b.apply === true;
    const out = [];
    for (const o of r.rows as OrderRow[]) {
      const res = await checkOrder(o, apply, app.log);
      if (res.tooOld.length || res.failed.length) out.push({ orderId: o.id, checked: res.checked, failed: res.failed, tooOld: res.tooOld.map((f) => ({ name: f.it.name, created: f.created.slice(0, 10), edited: f.edited.slice(0, 10), state: f.state })) });
    }
    return { ok: true, apply, mode: mode(), orders: r.rowCount, hits: out };
  });
}

export function startReviewDateCheckWorker(app: FastifyInstance): void {
  if (!dbReady()) return;
  setTimeout(() => void tick(app.log), 120_000);
  setInterval(() => void tick(app.log), 30 * 60_000);
}
