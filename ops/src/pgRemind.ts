/* pgRemind.ts — Erinnerungen „Zahlungsart fehlt noch" (08.10.2026, mit Maximilian abgestimmt: öfter als 1× am Tag, aber kein Spam).
 *
 * Wer: Kunden mit Aufträgen, die auf die hinterlegte Zahlungsart warten – Auftrag/Nachbestellung (payGate) oder bestätigte
 *      Software-Fälle (Status „software", vorgemerkt) – und noch KEINE Zahlungsart haben.
 * Inhalt: „An Ihren Bewertungen wird nicht gearbeitet: <Liste> – bitte schnellstmöglich hinterlegen, es wird nichts abgebucht."
 * Takt (ab Beginn des Wartens): +1 h, +5 h, +24 h, +29 h, +48 h, +53 h, +72 h, +96 h, +120 h → max. 9 Mails (+ Push),
 *      in den ersten 3 Tagen 2× täglich, danach 1× täglich. Versand nur 8–20 Uhr Ortszeit des Kunden.
 *      Stopp, sobald die Zahlungsart hinterlegt ist bzw. nichts mehr wartet.
 * Danach (Tag 7, PG_STALE_DAYS): Auftrag rutscht im Admin in „Zahlungsdaten fehlen", Kunde bekommt die finale Mail
 *      („reserviert bis <Datum>"); 3 Tage vor Ablauf eine letzte Warnung; nach PG_GRACE_DAYS (Standard 14) automatisch storniert
 *      (+ Storno-Mail, keine Kosten). Nachbestellung: nur die wartenden Bewertungen fallen raus, Laufendes bleibt.
 * Test-Konten: Takt in MINUTEN statt Stunden (Pause nach 12 Min., Storno 10 Min. später), ohne Uhrzeit-Fenster. PG_REMIND=off schaltet ab. */
import * as React from "react";
import { render } from "@react-email/render";
import type { FastifyInstance } from "fastify";
import { pool, insertEvent, setOrderRawField, updateOrderStatus } from "./db";
import { partnerOrderStatus } from "./partner";
import { declineSoftwareKeys } from "./customers";
import { quoteReviews } from "./reviewsPricing";
import { sendMail } from "./mailer";
import { loadCustomerOrders, dashLink } from "./customers";
import { hasSavedMethod } from "./autopay";
import { notifyCustomer } from "./custPush";
import { logCustEvent } from "./custTrack";
import { isTestEmail } from "./testAccounts";
import { tzOf, localHour } from "./followup";
import KundenZahlungsartReviews, { zahlungsartSubject, zahlungsartPush, type PgItem, type PgMode } from "./emails/KundenZahlungsartReviews";

const STEPS_H = [1, 5, 24, 29, 48, 53, 72, 96, 120];
const MAIL_LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const SITE_URL = (process.env.SITE_URL || "https://rapid-remove.com").replace(/\/+$/, "");
let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS pg_reminders (email text PRIMARY KEY, started_at timestamptz NOT NULL, n int NOT NULL DEFAULT 0, last_at timestamptz, team_at timestamptz)`);
  await pool.query(`ALTER TABLE pg_reminders ADD COLUMN IF NOT EXISTS stale_at timestamptz, ADD COLUMN IF NOT EXISTS cancel_at timestamptz, ADD COLUMN IF NOT EXISTS warn_at timestamptz, ADD COLUMN IF NOT EXISTS cancelled_at timestamptz`);
  ready = true;
}

type Act = { orderId: string; whole: boolean; gateKeys: string[]; swKeys: string[] };
type Waiting = { email: string; name: string; lang: string; country: string | null; addr: string | null; since: number; items: PgItem[]; orderIds: string[]; acts: Act[] };
const STALE_D = () => Math.max(1, Number(process.env.PG_STALE_DAYS) || 7);
const GRACE_D = () => Math.max(3, Number(process.env.PG_GRACE_DAYS) || 14);

/** Alle Kunden, bei denen etwas auf die Zahlungsart wartet (ohne hinterlegte Zahlungsart). */
async function waitingCustomers(): Promise<Waiting[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT DISTINCT lower(email) AS email FROM orders
      WHERE COALESCE(status,'') <> 'storniert' AND email IS NOT NULL
        AND (raw->'payGate'->>'status' = 'pending' OR raw ? 'reviewsSwWant')`);
  const out: Waiting[] = [];
  for (const { email } of r.rows as { email: string }[]) {
    if (await hasSavedMethod(email).catch(() => true)) continue;
    const { name, lang, orders } = await loadCustomerOrders(email).catch(() => ({ name: "", lang: "en", orders: [] as never[] }));
    const items: PgItem[] = []; const orderIds: string[] = []; const acts: Act[] = [];
    let since = Infinity, country: string | null = null, addr: string | null = null;
    for (const o of orders as any[]) {
      if (o.cancelled) continue;
      const raw = await pool.query(`SELECT raw->'payGate' AS g, raw->'reviewsSwConfirmed' AS c, raw->>'addr' AS addr, created_at FROM orders WHERE id=$1`, [o.id]).then((x) => x.rows[0]).catch(() => null);
      let hit = false;
      const act: Act = { orderId: o.id, whole: false, gateKeys: [], swKeys: [] };
      if (o.payGate) {
        const keys: string[] | null = o.payGateKeys || null;
        if (!keys) act.whole = true;
        if (o.kind === "profile") { items.push({ profile: o.business || o.id }); hit = true; }
        else for (const it of o.items || []) if (it.status === "new" && (!keys || keys.includes(it.key))) { items.push({ name: it.name, text: it.text, url: it.url }); hit = true; if (keys) act.gateKeys.push(it.key); }
        const at = Date.parse(raw?.g?.at || "") || Date.parse(raw?.created_at || "") || Date.now();
        if (hit) since = Math.min(since, at);
      }
      for (const it of o.items || []) {
        if (it.status === "software" && (it.swWant || it.pre)) {
          items.push({ name: it.name, text: it.text, url: it.url }); hit = true; act.swKeys.push(it.key);
          const at = Date.parse((raw?.c || {})[it.key] || "") || Date.now();
          since = Math.min(since, at);
        }
      }
      if (hit) { orderIds.push(o.id); acts.push(act); country = country || o.country || null; addr = addr || raw?.addr || null; }
    }
    if (items.length && Number.isFinite(since)) out.push({ email, name, lang, country, addr, since, items, orderIds, acts });
  }
  return out;
}

/** Storno nach Ablauf der Frist: ganzer Auftrag (wartet komplett) bzw. nur die wartenden Bewertungen (Nachbestellung/Software). */
async function cancelWaiting(w: Waiting): Promise<void> {
  if (!pool) return;
  for (const a of w.acts) {
    const r = await pool.query(`SELECT raw, country FROM orders WHERE id=$1`, [a.orderId]).catch(() => null);
    const raw = (r?.rows[0]?.raw || {}) as Record<string, unknown>;
    if (a.whole) {
      await updateOrderStatus(a.orderId, "storniert").catch(() => false);
      await partnerOrderStatus(a.orderId, "storniert").catch(() => {});
      await setOrderRawField(a.orderId, "payGate", { status: "expired", at: new Date().toISOString() }).catch(() => false);
      await insertEvent({ orderId: a.orderId, email: w.email, type: "status", title: "Automatisch storniert – keine Zahlungsart hinterlegt", detail: `Frist abgelaufen (${GRACE_D()} Tage nach der finalen Mail) · keine Kosten`, auto: true }).catch(() => {});
      continue;
    }
    if (a.gateKeys.length) {
      const items = (Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as { url?: string; name?: string; text?: string }[];
      const keyOf = (it: { url?: string; name?: string; text?: string }) => it.url || `${it.name || ""}|${it.text || ""}`;
      const keep = items.filter((it) => !a.gateKeys.includes(keyOf(it)));
      await setOrderRawField(a.orderId, "reviewItems", keep).catch(() => false);
      const total = quoteReviews(keep as never[], String(r?.rows[0]?.country || "") === "US" ? "usd" : "eur").total;
      await pool.query(`UPDATE orders SET reviews=$2, amount=$3 WHERE id=$1`, [a.orderId, keep.length, total]).catch(() => {});
      await setOrderRawField(a.orderId, "payGate", { status: "expired", at: new Date().toISOString() }).catch(() => false);
      await insertEvent({ orderId: a.orderId, email: w.email, type: "status", title: `Nachbestellung storniert – ${a.gateKeys.length} Bewertung(en) entfernt`, detail: "Keine Zahlungsart hinterlegt · laufende Bewertungen bleiben", auto: true }).catch(() => {});
    }
    if (a.swKeys.length) await declineSoftwareKeys(a.orderId, a.swKeys, "Frist abgelaufen");
    await setOrderRawField(a.orderId, "pgStale", null).catch(() => false);
  }
}

export async function pgRemindTick(log: (o: unknown, m: string) => void = () => {}): Promise<number> {
  if (!pool || String(process.env.PG_REMIND || "on").toLowerCase() === "off") return 0;
  await init();
  const list = await waitingCustomers();
  const active = new Set(list.map((w) => w.email));
  // Nichts mehr offen (Zahlungsart hinterlegt / storniert) → Zähler zurücksetzen, damit ein späterer Fall neu beginnt.
  const known = await pool.query(`SELECT email FROM pg_reminders`);
  for (const { email } of known.rows as { email: string }[]) {
    if (active.has(email)) continue;
    await pool.query(`DELETE FROM pg_reminders WHERE email=$1`, [email]).catch(() => {});
    // Zahlungsart doch noch hinterlegt (bzw. erledigt) → raus aus „Zahlungsdaten fehlen".
    await pool.query(`UPDATE orders SET raw = raw - 'pgStale' WHERE lower(email)=$1 AND raw ? 'pgStale'`, [email]).catch(() => {});
  }
  let sent = 0;
  for (const w of list) {
    const test = isTestEmail(w.email);
    const unit = test ? 60_000 : 3600_000;
    const st = (await pool.query(
      `INSERT INTO pg_reminders (email, started_at) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING started_at, n, last_at, stale_at, cancel_at, warn_at, cancelled_at`,
      [w.email, new Date(w.since).toISOString()],
    )).rows[0] as { started_at: string; n: number; last_at: string | null; stale_at: string | null; cancel_at: string | null; warn_at: string | null; cancelled_at: string | null };
    const start = new Date(st.started_at).getTime();
    const now = Date.now();
    const day = test ? 0 : 24 * unit;
    const staleAfter = test ? 12 * unit : STALE_D() * day, grace = test ? 10 * unit : GRACE_D() * day, warnBefore = test ? 3 * unit : 3 * day;
    const daytime = test || (() => { const h = localHour(tzOf(w.country, w.addr)); return h >= 8 && h < 20; })();
    const lang = MAIL_LANGS.includes(String(w.lang)) ? String(w.lang) : "en";
    const mail = async (mode: PgMode, extra: Record<string, unknown>, title: string): Promise<boolean> => {
      try {
        const dashUrl = await dashLink(w.email, lang);
        const props = { lang, name: w.name, dashUrl, siteUrl: SITE_URL, items: w.items, mode, ...extra };
        const html = await render(React.createElement(KundenZahlungsartReviews as any, props as any));
        const subject = zahlungsartSubject(props as any);
        await sendMail({ to: w.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
        if (mode !== "cancelled") { const p = zahlungsartPush(lang); void notifyCustomer(w.email, p.title, p.body, `rrc-pg-${w.email}`, { url: "/my-reviews" }).catch(() => false); }
        for (const oid of w.orderIds) await insertEvent({ orderId: oid, email: w.email, type: "mail", title, detail: `${w.items.length} wartend · ${w.items.slice(0, 4).map((x) => x.profile || x.name || x.url).join(" · ")}`, html, subject, auto: true }).catch(() => {});
        void logCustEvent(w.email, "reminder_pg", title, { mode }, { orderId: w.orderIds[0] });
        sent++;
        return true;
      } catch (e) { log({ err: e, email: w.email }, "Zahlungsart-Mail fehlgeschlagen"); return false; }
    };

    // 3) Frist abgelaufen → stornieren (wartende Bewertungen bzw. ganzer Auftrag), Storno-Mail.
    if (st.cancel_at && !st.cancelled_at && now >= new Date(st.cancel_at).getTime()) {
      await cancelWaiting(w);
      await pool.query(`UPDATE pg_reminders SET cancelled_at=now() WHERE email=$1`, [w.email]);
      await mail("cancelled", {}, "Automatisch storniert – keine Zahlungsart (Storno-Mail)");
      continue;
    }
    if (st.cancelled_at) continue;
    // 2b) Letzte Warnung 3 Tage vor dem Storno.
    if (st.cancel_at && !st.warn_at && now >= new Date(st.cancel_at).getTime() - warnBefore) {
      if (!daytime) continue;
      if (await mail("last", { date: st.cancel_at }, "Letzte Warnung: Storno in 3 Tagen (Zahlungsart fehlt)")) await pool.query(`UPDATE pg_reminders SET warn_at=now() WHERE email=$1`, [w.email]);
      continue;
    }
    if (st.stale_at) continue;
    // 2) Nach STALE_D Tagen: pausiert → Admin „Zahlungsdaten fehlen", finale Mail mit Frist.
    if (now >= start + staleAfter) {
      if (!daytime) continue;
      const cancelAt = new Date(now + grace).toISOString();
      for (const a of w.acts) await setOrderRawField(a.orderId, "pgStale", { at: new Date(now).toISOString(), cancelAt, keys: a.whole ? null : [...a.gateKeys, ...a.swKeys] }).catch(() => false);
      await pool.query(`UPDATE pg_reminders SET stale_at=now(), cancel_at=$2 WHERE email=$1`, [w.email, cancelAt]);
      await mail("final", { date: cancelAt, days: Math.max(1, Math.round((now - start) / (24 * 3600_000))) || STALE_D() }, `Finale Mail: pausiert, Storno am ${cancelAt.slice(0, 10)} (Zahlungsart fehlt)`);
      continue;
    }
    // 1) Erinnerungen
    if (st.n >= STEPS_H.length) continue;
    if (now < start + STEPS_H[st.n] * unit) continue;
    // Mindestabstand 4 Std. (Test: 4 Min.) – auch wenn ein Fall schon länger wartet, kommt nicht alles auf einmal.
    if (st.last_at && now - new Date(st.last_at).getTime() < 4 * unit) continue;
    if (!daytime) continue; // nur tagsüber (Ortszeit)
    if (await mail(st.n > 0 ? "reminder" : "first", {}, `Erinnerung ${st.n + 1}/${STEPS_H.length}: Zahlungsart fehlt noch`)) {
      await pool.query(`UPDATE pg_reminders SET n=n+1, last_at=now() WHERE email=$1`, [w.email]);
    }
  }
  return sent;
}

export function startPgRemindWorker(app: FastifyInstance): void {
  const run = () => void pgRemindTick((o, m) => app.log.error(o, m)).then((n) => { if (n) app.log.info({ n }, "Zahlungsart-Erinnerungen gesendet"); }).catch((e) => app.log.error({ err: e }, "pgRemind fehlgeschlagen"));
  setTimeout(run, 90_000);
  setInterval(run, 5 * 60_000);
}
