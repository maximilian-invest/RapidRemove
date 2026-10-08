/* pgRemind.ts — Erinnerungen „Zahlungsart fehlt noch" (08.10.2026, mit Maximilian abgestimmt: öfter als 1× am Tag, aber kein Spam).
 *
 * Wer: Kunden mit Aufträgen, die auf die hinterlegte Zahlungsart warten – Auftrag/Nachbestellung (payGate) oder bestätigte
 *      Software-Fälle (Status „software", vorgemerkt) – und noch KEINE Zahlungsart haben.
 * Inhalt: „An Ihren Bewertungen wird nicht gearbeitet: <Liste> – bitte schnellstmöglich hinterlegen, es wird nichts abgebucht."
 * Takt (ab Beginn des Wartens): +1 h, +5 h, +24 h, +29 h, +48 h, +53 h, +72 h, +96 h, +120 h → max. 9 Mails (+ Push),
 *      in den ersten 3 Tagen 2× täglich, danach 1× täglich. Versand nur 8–20 Uhr Ortszeit des Kunden.
 *      Danach einmal Push ans Team („bitte anrufen"). Stopp, sobald die Zahlungsart hinterlegt ist bzw. nichts mehr wartet.
 * Test-Konten: gleicher Takt in MINUTEN statt Stunden, ohne Uhrzeit-Fenster (zum Ausprobieren). PG_REMIND=off schaltet ab. */
import * as React from "react";
import { render } from "@react-email/render";
import type { FastifyInstance } from "fastify";
import { pool, insertEvent } from "./db";
import { sendMail } from "./mailer";
import { loadCustomerOrders, dashLink } from "./customers";
import { hasSavedMethod } from "./autopay";
import { notifyCustomer } from "./custPush";
import { notifyTeam } from "./notify";
import { logCustEvent } from "./custTrack";
import { isTestEmail } from "./testAccounts";
import { tzOf, localHour } from "./followup";
import KundenZahlungsartReviews, { zahlungsartSubject, zahlungsartPush, type PgItem } from "./emails/KundenZahlungsartReviews";

const STEPS_H = [1, 5, 24, 29, 48, 53, 72, 96, 120];
const MAIL_LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const SITE_URL = (process.env.SITE_URL || "https://rapid-remove.com").replace(/\/+$/, "");
let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS pg_reminders (email text PRIMARY KEY, started_at timestamptz NOT NULL, n int NOT NULL DEFAULT 0, last_at timestamptz, team_at timestamptz)`);
  ready = true;
}

type Waiting = { email: string; name: string; lang: string; country: string | null; addr: string | null; since: number; items: PgItem[]; orderIds: string[] };

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
    const items: PgItem[] = []; const orderIds: string[] = [];
    let since = Infinity, country: string | null = null, addr: string | null = null;
    for (const o of orders as any[]) {
      if (o.cancelled) continue;
      const raw = await pool.query(`SELECT raw->'payGate' AS g, raw->'reviewsSwConfirmed' AS c, raw->>'addr' AS addr, created_at FROM orders WHERE id=$1`, [o.id]).then((x) => x.rows[0]).catch(() => null);
      let hit = false;
      if (o.payGate) {
        const keys: string[] | null = o.payGateKeys || null;
        if (o.kind === "profile") { items.push({ profile: o.business || o.id }); hit = true; }
        else for (const it of o.items || []) if (it.status === "new" && (!keys || keys.includes(it.key))) { items.push({ name: it.name, text: it.text, url: it.url }); hit = true; }
        const at = Date.parse(raw?.g?.at || "") || Date.parse(raw?.created_at || "") || Date.now();
        if (hit) since = Math.min(since, at);
      }
      for (const it of o.items || []) {
        if (it.status === "software" && (it.swWant || it.pre)) {
          items.push({ name: it.name, text: it.text, url: it.url }); hit = true;
          const at = Date.parse((raw?.c || {})[it.key] || "") || Date.now();
          since = Math.min(since, at);
        }
      }
      if (hit) { orderIds.push(o.id); country = country || o.country || null; addr = addr || raw?.addr || null; }
    }
    if (items.length && Number.isFinite(since)) out.push({ email, name, lang, country, addr, since, items, orderIds });
  }
  return out;
}

export async function pgRemindTick(log: (o: unknown, m: string) => void = () => {}): Promise<number> {
  if (!pool || String(process.env.PG_REMIND || "on").toLowerCase() === "off") return 0;
  await init();
  const list = await waitingCustomers();
  const active = new Set(list.map((w) => w.email));
  // Nichts mehr offen (Zahlungsart hinterlegt / storniert) → Zähler zurücksetzen, damit ein späterer Fall neu beginnt.
  const known = await pool.query(`SELECT email FROM pg_reminders`);
  for (const { email } of known.rows as { email: string }[]) if (!active.has(email)) await pool.query(`DELETE FROM pg_reminders WHERE email=$1`, [email]).catch(() => {});
  let sent = 0;
  for (const w of list) {
    const test = isTestEmail(w.email);
    const unit = test ? 60_000 : 3600_000;
    const st = (await pool.query(
      `INSERT INTO pg_reminders (email, started_at) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING started_at, n, team_at`,
      [w.email, new Date(w.since).toISOString()],
    )).rows[0] as { started_at: string; n: number; team_at: string | null };
    const start = new Date(st.started_at).getTime();
    const now = Date.now();
    if (st.n >= STEPS_H.length) {
      if (!st.team_at && now - start >= (STEPS_H[STEPS_H.length - 1] + 6) * unit) {
        await pool.query(`UPDATE pg_reminders SET team_at=now() WHERE email=$1`, [w.email]);
        void notifyTeam(`${test ? "TEST · " : ""}Zahlungsart fehlt seit ${Math.round((now - start) / 86_400_000)} Tagen`, `${w.name || w.email} · ${w.items.length} wartend · ${STEPS_H.length} Erinnerungen ohne Reaktion – bitte anrufen`, `${SITE_URL}/admin?order=${encodeURIComponent(w.orderIds[0])}`, { kind: "customer" });
      }
      continue;
    }
    if (now < start + STEPS_H[st.n] * unit) continue;
    // Mindestabstand 4 Std. (Test: 4 Min.) – auch wenn ein Fall schon länger wartet, kommt nicht alles auf einmal.
    const lastAt = (await pool.query(`SELECT last_at FROM pg_reminders WHERE email=$1`, [w.email])).rows[0]?.last_at;
    if (lastAt && now - new Date(lastAt).getTime() < 4 * unit) continue;
    if (!test) { const h = localHour(tzOf(w.country, w.addr)); if (h < 8 || h >= 20) continue; } // nur tagsüber (Ortszeit)
    const lang = MAIL_LANGS.includes(String(w.lang)) ? String(w.lang) : "en";
    try {
      const dashUrl = await dashLink(w.email, lang);
      const props = { lang, name: w.name, dashUrl, items: w.items, reminder: st.n > 0 };
      const html = await render(React.createElement(KundenZahlungsartReviews as any, props as any));
      const subject = zahlungsartSubject(props);
      await sendMail({ to: w.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
      await pool.query(`UPDATE pg_reminders SET n=n+1, last_at=now() WHERE email=$1`, [w.email]);
      const p = zahlungsartPush(lang);
      void notifyCustomer(w.email, p.title, p.body, `rrc-pg-${w.email}`, { url: "/my-reviews" }).catch(() => false);
      for (const oid of w.orderIds) await insertEvent({ orderId: oid, email: w.email, type: "mail", title: `Erinnerung ${st.n + 1}/${STEPS_H.length}: Zahlungsart fehlt noch`, detail: `${w.items.length} wartend · ${w.items.slice(0, 4).map((x) => x.profile || x.name || x.url).join(" · ")}`, html, subject, auto: true }).catch(() => {});
      void logCustEvent(w.email, "reminder_pg", `Erinnerung Zahlungsart (${st.n + 1}/${STEPS_H.length})`, { n: st.n + 1 }, { orderId: w.orderIds[0] });
      sent++;
    } catch (e) { log({ err: e, email: w.email }, "Zahlungsart-Erinnerung fehlgeschlagen"); }
  }
  return sent;
}

export function startPgRemindWorker(app: FastifyInstance): void {
  const run = () => void pgRemindTick((o, m) => app.log.error(o, m)).then((n) => { if (n) app.log.info({ n }, "Zahlungsart-Erinnerungen gesendet"); }).catch((e) => app.log.error({ err: e }, "pgRemind fehlgeschlagen"));
  setTimeout(run, 90_000);
  setInterval(run, 5 * 60_000);
}
