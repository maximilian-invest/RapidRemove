/* Schutz sichtbar machen (06.11.2026, Maximilian): Monitoring ist in jedem Schutz enthalten.
 *
 *  - POST /cust/protection: Kunden-Dashboard zeigt je geschütztem Profil den Überwachungs-Status
 *    (weiterhin gelöscht / wieder aufgetaucht), letzte Prüfung, Prüfungen der letzten 7 Tage.
 *  - Wöchentlicher Schutz-Bericht per Mail (Montag ab 09:00 Wien), nur an Kunden mit AKTIVEM Schutz
 *    und nur, wenn die Profile weiterhin gelöscht sind. Je Kunde und Kalenderwoche höchstens einmal.
 *  - Admin: POST /admin/protection-report { token, dry?, email? } → Vorschau / Testversand.
 *
 * Aktiver Schutz = lebenslang ODER laufendes Stripe-Abo (aktiv/Zahlung offen) ODER Schutz per PayPal/Wise
 * in den letzten 12 Monaten bezahlt. Daten der Überwachung: monitor_profiles / monitor_checks (monitor.ts, Scan täglich 05:00).
 * Nur Aufträge ab 06.11.2026 (PROTECTION_REPORT_SINCE) – ältere Kunden bekommen weder Bericht noch Dashboard-Karte.
 * Abschalten: Umgebungsvariable PROTECTION_REPORT=off.
 */
import * as React from "react";
import { render } from "@react-email/render";
import type { FastifyInstance } from "fastify";
import { pool, dbReady, insertEvent } from "./db";
import { sendMail, mailTrace } from "./mailer";
import { hasSecretKey, stripeList } from "./integrations/stripe";
import { dashLink, customerSessionInfo } from "./customers";
import SchutzBericht, { subject as schutzBerichtSubject } from "./emails/SchutzBericht";

const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const LOCALE: Record<string, string> = { de: "de-AT", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ja: "ja-JP", sv: "sv-SE", da: "da-DK", no: "nb-NO" };

let subCache: { at: number; emails: Set<string> } | null = null;
/** E-Mails mit laufendem Stripe-Abo (aktiv, Testphase oder Zahlung offen). Cache 1 Std. */
async function activeSubEmails(): Promise<Set<string>> {
  if (subCache && Date.now() - subCache.at < 3600_000) return subCache.emails;
  const emails = new Set<string>();
  if (hasSecretKey()) {
    for (const st of ["active", "trialing", "past_due"]) {
      const subs = await stripeList<any>(`subscriptions?status=${st}&limit=100&expand[]=data.customer`, 10).catch(() => [] as any[]);
      for (const s of subs) { const e = String(s.customer?.email || "").trim().toLowerCase(); if (e) emails.add(e); }
    }
  }
  subCache = { at: Date.now(), emails };
  return emails;
}

/** Schutz per PayPal/Wise (ohne Stripe-Abo) in den letzten 12 Monaten bezahlt. */
async function prepaidEmails(): Promise<Set<string>> {
  const out = new Set<string>();
  if (!pool) return out;
  const r = await pool.query(
    `SELECT DISTINCT lower(trim(email)) AS e FROM orders
      WHERE pay='paid' AND COALESCE(protection,'') IN ('monthly','monitor','yearly')
        AND raw->>'payPref' IN ('paypal','wise') AND COALESCE(done_at, created_at) > now() - interval '365 days'`).catch(() => ({ rows: [] as { e: string }[] }));
  for (const x of r.rows) if (x.e) out.add(x.e);
  return out;
}

/** Schutz-Bericht + Überwachung im Dashboard gibt es nur für Aufträge AB HEUTE (Maximilian 06.11.2026: „vorher bekommt das keiner“).
 *  Maßgeblich: Bestelldatum des Auftrags (orders.created_at). Profile ohne Auftrag (manuell im Monitor) sind ausgenommen. */
export const PROTECTION_REPORT_SINCE = process.env.PROTECTION_REPORT_SINCE || "2026-11-06T10:00:00Z";

type Row = { id: number; order_id: string | null; business_name: string; cust_email: string | null; lang: string | null; type: string; status: string; since: string; last_check_at: string | null; checks7: number; last_ok: string | null };
async function profilesFor(email?: string): Promise<Row[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT p.id, p.order_id, p.business_name, p.cust_email, p.lang, p.type, p.status, p.since, p.last_check_at,
            (SELECT count(*)::int FROM monitor_checks c WHERE c.profile_id=p.id AND c.checked_at > now() - interval '7 days') AS checks7,
            (SELECT max(c.checked_at) FROM monitor_checks c WHERE c.profile_id=p.id AND c.result IN ('ok','re')) AS last_ok
       FROM monitor_profiles p
       JOIN orders o ON o.id = p.order_id AND o.created_at >= $1::timestamptz
      WHERE p.source NOT IN ('deleted','archived') AND p.status NOT IN ('paused','exp') AND p.cust_email IS NOT NULL
        ${email ? "AND lower(trim(p.cust_email))=$2" : ""}
      ORDER BY p.since`, email ? [PROTECTION_REPORT_SINCE, email] : [PROTECTION_REPORT_SINCE]).catch(() => ({ rows: [] as Row[] }));
  return r.rows as Row[];
}

async function isActive(email: string, rows: Row[]): Promise<boolean> {
  if (rows.some((r) => r.type === "lifetime")) return true;
  const [subs, pre] = await Promise.all([activeSubEmails(), prepaidEmails()]);
  return subs.has(email) || pre.has(email);
}

const fmtDate = (iso: string | null, lang: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(LOCALE[lang] || "en-US", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Vienna" });
};

/** ISO-Kalenderwoche (Wien) als „2026-W45". */
function isoWeek(d = new Date()): string {
  const v = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Vienna" }));
  const t = new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t.getTime() - y0.getTime()) / 86400000 + 1) / 7)).padStart(2, "0")}`;
}

let tablesOk = false;
async function ensureTable() {
  if (tablesOk || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS protection_reports (email text NOT NULL, week text NOT NULL, sent_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (email, week))`);
  tablesOk = true;
}

/** Bericht an einen Kunden (oder Vorschau). Rückgabe: was passiert ist. */
async function reportFor(email: string, opts: { dry?: boolean; force?: boolean } = {}): Promise<{ email: string; sent: boolean; reason?: string; n?: number }> {
  const rows = await profilesFor(email);
  if (!rows.length) return { email, sent: false, reason: "keine überwachten Profile" };
  if (!(await isActive(email, rows))) return { email, sent: false, reason: "Schutz nicht aktiv" };
  if (rows.some((r) => r.status === "found")) return { email, sent: false, reason: "Profil wieder aufgetaucht – Team informiert separat" };
  const okRows = rows.filter((r) => r.status === "ok" || r.status === "re");
  if (!okRows.length) return { email, sent: false, reason: "noch keine erfolgreiche Prüfung" };
  const lang = LANGS.includes(String(okRows[0].lang || "").slice(0, 2)) ? String(okRows[0].lang).slice(0, 2) : "en";
  const week = isoWeek();
  if (!opts.force) {
    const done = await pool!.query(`SELECT 1 FROM protection_reports WHERE email=$1 AND week=$2`, [email, week]);
    if (done.rowCount) return { email, sent: false, reason: "diese Woche schon verschickt" };
  }
  if (opts.dry) return { email, sent: false, reason: "Vorschau", n: okRows.length };
  const items = okRows.map((r) => ({ name: r.business_name, lastCheck: fmtDate(r.last_ok || r.last_check_at, lang), checks: Math.max(1, Number(r.checks7) || 0) }));
  const props = { lang: lang as "de", items, dashUrl: await dashLink(email, lang).catch(() => undefined) };
  const html = await render(React.createElement(SchutzBericht as React.FC<typeof props>, props));
  const subj = schutzBerichtSubject(props);
  const res = await sendMail({ to: email, subject: subj, html, replyTo: process.env.MAIL_REPLY_TO });
  await pool!.query(`INSERT INTO protection_reports (email, week) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [email, week]);
  await insertEvent({ email, type: "mail", title: "Wöchentlicher Schutz-Bericht gesendet (automatisch)", detail: `an ${email} · ${okRows.length} Profil(e) · ${mailTrace(res)}`, html, subject: subj, auto: true }).catch(() => {});
  return { email, sent: true, n: okRows.length };
}

async function weeklyRun(log: FastifyInstance["log"], opts: { dry?: boolean } = {}) {
  await ensureTable();
  const rows = await profilesFor();
  const emails = [...new Set(rows.map((r) => String(r.cust_email || "").trim().toLowerCase()).filter(Boolean))];
  const out: Awaited<ReturnType<typeof reportFor>>[] = [];
  for (const e of emails) {
    try { out.push(await reportFor(e, opts)); }
    catch (err) { log.error({ err, email: e }, "Schutz-Bericht fehlgeschlagen"); out.push({ email: e, sent: false, reason: "Fehler: " + String((err as Error).message).slice(0, 120) }); }
  }
  const sent = out.filter((x) => x.sent).length;
  if (!opts.dry) log.info(`Schutz-Bericht ${isoWeek()}: ${sent} von ${emails.length} verschickt`);
  return { week: isoWeek(), total: emails.length, sent, list: out };
}

export function registerProtectionWatch(app: FastifyInstance, adminToken: string) {
  /* Kunden-Dashboard: Überwachung je geschütztem Profil. */
  app.post("/cust/protection", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const email = s.email.trim().toLowerCase();
    const rows = await profilesFor(email);
    const active = rows.length ? await isActive(email, rows).catch(() => false) : false;
    return {
      ok: true, active,
      items: rows.map((r) => ({ id: r.id, orderId: r.order_id || null, name: r.business_name, status: r.status === "found" ? "found" : r.status === "fail" ? "checking" : "removed", type: r.type, since: r.since, lastCheck: r.last_ok || r.last_check_at, checks7: Number(r.checks7) || 0 })),
    };
  });

  /* Admin: Vorschau (dry) oder Versand – für alle bzw. eine E-Mail (force = auch wenn diese Woche schon verschickt). */
  app.post("/admin/protection-report", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool || !dbReady()) return reply.code(503).send({ ok: false, error: "keine DB" });
    await ensureTable();
    const email = String(b.email || "").trim().toLowerCase();
    if (email) return { ok: true, ...(await reportFor(email, { dry: b.dry === true, force: b.force === true })) };
    return { ok: true, ...(await weeklyRun(app.log, { dry: b.dry !== false })) }; // ohne E-Mail standardmäßig nur Vorschau
  });
}

/** Montag ab 09:00 (Wien) einmal je Woche – prüft stündlich. */
export function startProtectionReportWorker(app: FastifyInstance) {
  if (!dbReady() || String(process.env.PROTECTION_REPORT || "").toLowerCase() === "off") { app.log.info("Schutz-Bericht: Worker aus"); return; }
  let lastWeek = "";
  const tick = async () => {
    try {
      const v = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Vienna" }));
      const wk = isoWeek();
      if (v.getDay() !== 1 || v.getHours() < 9 || lastWeek === wk) return;
      lastWeek = wk; // Doppelversand verhindert zusätzlich protection_reports (email, week)
      await weeklyRun(app.log);
    } catch (e) { app.log.error({ err: e }, "Schutz-Bericht: Lauf fehlgeschlagen"); }
  };
  setTimeout(tick, 60_000);
  setInterval(tick, 3600_000);
}
