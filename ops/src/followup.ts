/*
 * followup.ts — automatisches Nachfassen bei Kunden (Einzelbewertungen), die nicht reagieren.
 *
 * Regeln (mit Maximilian abgestimmt, 06.10.2026):
 *  - Versand nur 8–20 Uhr Ortszeit des Kunden (Zeitzone aus Land bzw. US-/CA-/AU-Bundesstaat der Adresse).
 *  - Höchstens 1 automatische Mail pro Kunde und Tag; alles Fällige kommt gesammelt in diese Mail –
 *    inkl. allem, was in den nächsten 24 h fällig würde (außer Zahlungsstufen), damit nichts auf morgen rutscht (07.10.2026).
 *  - Jede Erinnerung stoppt, sobald der Kunde das Nötige erledigt hat (zahlen / entscheiden / einloggen).
 *
 *   Fall                                   Erinnerung 1             Erinnerung 2        Danach
 *   Update-Mail, aber nicht eingeloggt     +10 h „Neuigkeiten"      –                   –
 *   Noch nie eingeloggt seit Bestellung    +24 h                    +48 h nach Erinn. 1 Admin „Nachfassen"
 *   Software-Entscheidung offen            +6 h (Mail + Push)       +24 h nach Erinn. 1 Tag 3: Admin „Nachfassen"
 *   Zahlung offen (gelöschte Bewertungen)  +24 h Stufe 1            +48 h → Stufe 2     Tag 5: Admin „Letzte Mahnung fällig"
 *  Die letzte Mahnung (Stufe 3: wieder online + Inkasso) geht NIE automatisch. PayPal-/Wise-Zahler: keine
 *  automatische Zahlungserinnerung (eigene Zahlungsdaten) → direkt in „Nachfassen".
 *
 * Modus: FOLLOWUP_MODE = live | dry | off (Standard live). Nur Auslöser ab FOLLOWUP_SINCE zählen (kein Altbestand).
 * Protokoll: Tabelle cust_followups + Auftrags-Events (Admin „Verlauf"/Mahnungs-Historie) + Dashboard-Aktivität.
 */
import * as React from "react";
import { render } from "@react-email/render";
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { insertEvent } from "./db";
import { sendMail } from "./mailer";
import { loadCustomerOrders, dashLink } from "./customers";
import { logCustEvent } from "./custTrack";
import { notifyCustomer } from "./custPush";
import { fmtReviewMoney } from "./reviewsPricing";
import KundenErinnerungReviews, { erinnerungSubject, erinnerungTitle, type ErinnerungProps } from "./emails/KundenErinnerungReviews";

const H = 3600_000;
const MODE = () => (process.env.FOLLOWUP_MODE || "dry").toLowerCase();
const SINCE = () => new Date(process.env.FOLLOWUP_SINCE || "2026-10-04T00:00:00Z").getTime();
const MAIL_LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

/* ---------- Zeitzone ---------- */
const US_TZ: Record<string, string> = {
  CT: "America/New_York", DE: "America/New_York", DC: "America/New_York", FL: "America/New_York", GA: "America/New_York", ME: "America/New_York", MD: "America/New_York", MA: "America/New_York", MI: "America/Detroit", NH: "America/New_York", NJ: "America/New_York", NY: "America/New_York", NC: "America/New_York", OH: "America/New_York", PA: "America/New_York", RI: "America/New_York", SC: "America/New_York", VT: "America/New_York", VA: "America/New_York", WV: "America/New_York", IN: "America/Indiana/Indianapolis", KY: "America/New_York",
  AL: "America/Chicago", AR: "America/Chicago", IL: "America/Chicago", IA: "America/Chicago", KS: "America/Chicago", LA: "America/Chicago", MN: "America/Chicago", MS: "America/Chicago", MO: "America/Chicago", NE: "America/Chicago", ND: "America/Chicago", OK: "America/Chicago", SD: "America/Chicago", TN: "America/Chicago", TX: "America/Chicago", WI: "America/Chicago",
  AZ: "America/Phoenix", CO: "America/Denver", ID: "America/Boise", MT: "America/Denver", NM: "America/Denver", UT: "America/Denver", WY: "America/Denver",
  CA: "America/Los_Angeles", NV: "America/Los_Angeles", OR: "America/Los_Angeles", WA: "America/Los_Angeles", AK: "America/Anchorage", HI: "Pacific/Honolulu",
};
const CA_TZ: Record<string, string> = { BC: "America/Vancouver", AB: "America/Edmonton", SK: "America/Regina", MB: "America/Winnipeg", ON: "America/Toronto", QC: "America/Toronto", NB: "America/Halifax", NS: "America/Halifax", PE: "America/Halifax", NL: "America/St_Johns", YT: "America/Whitehorse", NT: "America/Yellowknife" };
const AU_TZ: Record<string, string> = { NSW: "Australia/Sydney", ACT: "Australia/Sydney", VIC: "Australia/Melbourne", TAS: "Australia/Hobart", QLD: "Australia/Brisbane", SA: "Australia/Adelaide", WA: "Australia/Perth", NT: "Australia/Darwin" };
const CC_TZ: Record<string, string> = {
  US: "America/Chicago", CA: "America/Toronto", AU: "Australia/Sydney", GB: "Europe/London", UK: "Europe/London", IE: "Europe/Dublin", PT: "Europe/Lisbon",
  AT: "Europe/Vienna", DE: "Europe/Berlin", CH: "Europe/Zurich", IT: "Europe/Rome", FR: "Europe/Paris", ES: "Europe/Madrid", NL: "Europe/Amsterdam", BE: "Europe/Brussels", LU: "Europe/Luxembourg",
  DK: "Europe/Copenhagen", SE: "Europe/Stockholm", NO: "Europe/Oslo", FI: "Europe/Helsinki", PL: "Europe/Warsaw", CZ: "Europe/Prague", SK: "Europe/Bratislava", HU: "Europe/Budapest", SI: "Europe/Ljubljana", HR: "Europe/Zagreb",
  GR: "Europe/Athens", RO: "Europe/Bucharest", BG: "Europe/Sofia", TR: "Europe/Istanbul", CY: "Asia/Nicosia", MT: "Europe/Malta", EE: "Europe/Tallinn", LV: "Europe/Riga", LT: "Europe/Vilnius",
  NZ: "Pacific/Auckland", ZA: "Africa/Johannesburg", AE: "Asia/Dubai", IL: "Asia/Jerusalem", IN: "Asia/Kolkata", SG: "Asia/Singapore", HK: "Asia/Hong_Kong", JP: "Asia/Tokyo", KR: "Asia/Seoul", CN: "Asia/Shanghai",
  BR: "America/Sao_Paulo", MX: "America/Mexico_City", AR: "America/Argentina/Buenos_Aires", CL: "America/Santiago", CO: "America/Bogota", PH: "Asia/Manila", TH: "Asia/Bangkok", MY: "Asia/Kuala_Lumpur", ID: "Asia/Jakarta",
};
export function tzOf(country: string | null | undefined, addr: string | null | undefined): string {
  const cc = String(country || "").toUpperCase();
  const a = String(addr || "");
  if (cc === "US" || /\bUSA\b|United States/i.test(a)) { const m = a.match(/,\s*([A-Z]{2})\s+\d{5}/); if (m && US_TZ[m[1]]) return US_TZ[m[1]]; return CC_TZ.US; }
  if (cc === "CA" || /\bCanada\b/i.test(a)) { const m = a.match(/,\s*([A-Z]{2})\s+[A-Z]\d[A-Z]/); if (m && CA_TZ[m[1]]) return CA_TZ[m[1]]; return CC_TZ.CA; }
  if (cc === "AU" || /\bAustralia\b/i.test(a)) { const m = a.match(/\b(NSW|ACT|VIC|TAS|QLD|SA|WA|NT)\b/); if (m) return AU_TZ[m[1]]; return CC_TZ.AU; }
  return CC_TZ[cc] || "Europe/Vienna";
}
export function localHour(tz: string, at = new Date()): number {
  try { return Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(at)) % 24; } catch { return at.getUTCHours(); }
}
const quietOk = (tz: string) => { const h = localHour(tz); return h >= 8 && h < 20; };

/* ---------- Tabelle ---------- */
let ready = false;
async function init(): Promise<void> {
  if (!pool || ready) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_followups (
      id bigserial PRIMARY KEY,
      email text NOT NULL,
      kind text NOT NULL,
      ref text NOT NULL,
      stage int NOT NULL DEFAULT 1,
      order_id text,
      sent_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (email, kind, ref, stage)
    )`);
  ready = true;
}

/* ---------- Analyse je Kunde ---------- */
type Kind = "pay" | "sw" | "never" | "news";
export type Attention = { email: string; name: string; orderId: string | null; kind: Kind | "pay_manual"; since: string; text: string };
export type Upcoming = { email: string; name: string; orderId: string | null; kind: Kind; stage: number; dueAt: string; waitQuiet?: boolean };
type Plan = {
  email: string; name: string; lang: string; tz: string;
  due: { pay?: { stage: 1 | 2; ref: string; amount: string; n: number; orderId: string }; sw?: { ref: string; n: number; price: string; orderId: string }; never?: { ref: string; stage: 1 | 2; orderId: string }; news?: { ref: string; orderId: string | null } };
  upcoming: Upcoming[]; attention: Attention[]; lastAutoAt: number;
};
const ts = (v: unknown) => (v ? new Date(String(v)).getTime() : 0);
const iso = (n: number) => new Date(n).toISOString();
const daysTxt = (ms: number) => { const d = Math.floor(ms / (24 * H)); return d >= 1 ? `${d} T` : `${Math.floor(ms / H)} Std`; };

/** horizon: Erinnerungen, die innerhalb dieser Zeit fällig würden, gelten schon als fällig (Zusammenfassen beim Versand).
 *  Zahlungsstufen nie vorziehen (Eskalation bleibt beim festen Rhythmus). */
async function analyze(email: string, now = Date.now(), horizon = 0): Promise<Plan | null> {
  const soon = now + horizon;
  if (!pool) return null;
  const since = SINCE();
  const d = await loadCustomerOrders(email);
  const orders = (d.orders || []).filter((o) => !o.cancelled && (o as { kind?: string }).kind !== "profile"); // nur Einzelbewertungen
  if (!orders.length) return null;
  const meta = await pool.query(`SELECT id, country, raw->>'addr' AS addr, raw->>'payPref' AS pay_pref, form->>'paypal' AS pp FROM orders WHERE lower(email)=$1 AND service='reviews' ORDER BY created_at DESC`, [email]).catch(() => ({ rows: [] as Record<string, string | null>[] }));
  const m0 = meta.rows[0] || {};
  const tz = tzOf(m0.country, m0.addr);
  const payPref = meta.rows.map((r) => (r.pay_pref === "wise" ? "Wise" : r.pay_pref === "paypal" || (r.pp && r.pp.trim()) ? "PayPal" : "")).find(Boolean) || "";
  const lang = MAIL_LANGS.includes(String(d.lang)) ? String(d.lang) : "en";

  // Wann zuletzt im Dashboard? (Ereignisse, echte Sitzung, Passwort-Login)
  const seen = await pool.query(`SELECT GREATEST(
      (SELECT max(created_at) FROM customer_events WHERE email=$1 AND type IN ('login','dash_open','page_view','click')),
      (SELECT max(created_at) FROM cust_sessions WHERE email=$1 AND NOT impersonation),
      (SELECT last_login FROM cust_accounts WHERE email=$1)) AS t`, [email]).catch(() => ({ rows: [{ t: null }] }));
  const lastSeen = ts(seen.rows[0]?.t);
  const fu = await pool.query(`SELECT kind, ref, stage, sent_at FROM cust_followups WHERE email=$1`, [email]);
  const sent = (kind: string, ref: string) => fu.rows.filter((r) => r.kind === kind && r.ref === ref);
  const lastAutoAt = fu.rows.reduce((mx, r) => Math.max(mx, ts(r.sent_at)), 0);

  const plan: Plan = { email, name: d.name, lang, tz, due: {}, upcoming: [], attention: [], lastAutoAt };
  type It = Record<string, unknown> & { o: (typeof orders)[number] };
  const items: It[] = orders.flatMap((o) => (o.items as unknown as Record<string, unknown>[]).map((i) => ({ ...i, o }) as It));

  /* Zahlung offen */
  const unpaid = items.filter((i) => i.status === "removed" && !i.paid);
  if (unpaid.length) {
    const first = Math.min(...unpaid.map((i) => ts(i.removedAt) || ts(i.changedAt) || now));
    const payOrder = unpaid[0].o;
    const cur = String(payOrder.cur || "eur");
    const amountNum = orders.filter((o) => o.cur === cur).reduce((s, o) => s + (Number(o.toPay) || 0), 0);
    const ref = iso(first).slice(0, 16);
    // Manuell gesendete Mahnungen zählen mit (Stufe aus dem Titel).
    const man = await pool.query(`SELECT title, created_at FROM events WHERE lower(email)=$1 AND title LIKE 'Mahnung (Bewertungen)%' AND created_at > $2`, [email, iso(first)]).catch(() => ({ rows: [] as { title: string; created_at: string }[] }));
    const stages = [...sent("pay", ref).map((r) => ({ s: Number(r.stage), t: ts(r.sent_at) })), ...man.rows.map((r) => ({ s: Number((String(r.title).match(/Stufe\s*(\d)/) || [])[1] || 1), t: ts(r.created_at) }))];
    const cur0 = stages.reduce((mx, x) => Math.max(mx, x.s), 0);
    const lastT = stages.reduce((mx, x) => Math.max(mx, x.t), 0);
    if (first >= since && amountNum > 0) {
      if (payPref) {
        if (now - first >= 72 * H) plan.attention.push({ email, name: d.name, orderId: payOrder.id as string, kind: "pay_manual", since: iso(first), text: `Zahlung offen seit ${daysTxt(now - first)} · will per ${payPref} zahlen – keine automatische Erinnerung` });
      } else if (cur0 === 0) {
        const at = first + 24 * H;
        if (now >= at) plan.due.pay = { stage: 1, ref, amount: fmtReviewMoney(amountNum, cur), n: unpaid.length, orderId: payOrder.id as string };
        else plan.upcoming.push({ email, name: d.name, orderId: payOrder.id as string, kind: "pay", stage: 1, dueAt: iso(at) });
      } else if (cur0 === 1) {
        const at = lastT + 48 * H;
        if (now >= at) plan.due.pay = { stage: 2, ref, amount: fmtReviewMoney(amountNum, cur), n: unpaid.length, orderId: payOrder.id as string };
        else plan.upcoming.push({ email, name: d.name, orderId: payOrder.id as string, kind: "pay", stage: 2, dueAt: iso(at) });
      } else if (now - first >= 5 * 24 * H) {
        plan.attention.push({ email, name: d.name, orderId: payOrder.id as string, kind: "pay", since: iso(first), text: `Zahlung ${fmtReviewMoney(amountNum, cur)} offen seit ${daysTxt(now - first)} · ${cur0} Erinnerungen – Letzte Mahnung fällig` });
      }
    }
  }

  /* Software-Entscheidung offen */
  // Software-Fälle mit Zustimmung bei der Bestellung (pre) haben eigene Mails (Zahlungsaufforderung + Erinnerung vor Fristende).
  const sw = items.filter((i) => i.status === "software" && !(i as { pre?: boolean }).pre);
  if (sw.length) {
    const first = Math.min(...sw.map((i) => ts(i.changedAt) || now));
    const ref = iso(first).slice(0, 16);
    const s = sent("sw", ref);
    const st = s.reduce((mx, r) => Math.max(mx, Number(r.stage)), 0);
    const lastT = s.reduce((mx, r) => Math.max(mx, ts(r.sent_at)), 0);
    const o = sw[0].o;
    if (first >= since) {
      const price = fmtReviewMoney(Number(o.swPrice) || 300, String(o.cur || "eur"));
      // Schneller als die anderen Fälle: es hängt eine Vorauszahlung dran (+6 h, dann +24 h, ab Tag 3 Admin).
      if (st === 0) { const at = first + 6 * H; if (soon >= at) plan.due.sw = { ref, n: sw.length, price, orderId: o.id as string }; else plan.upcoming.push({ email, name: d.name, orderId: o.id as string, kind: "sw", stage: 1, dueAt: iso(at) }); }
      else if (st === 1) { const at = lastT + 24 * H; if (soon >= at) plan.due.sw = { ref, n: sw.length, price, orderId: o.id as string }; else plan.upcoming.push({ email, name: d.name, orderId: o.id as string, kind: "sw", stage: 2, dueAt: iso(at) }); }
      if (now - first >= 3 * 24 * H) plan.attention.push({ email, name: d.name, orderId: o.id as string, kind: "sw", since: iso(first), text: `Software-Entscheidung offen seit ${daysTxt(now - first)} (${sw.length} Bewertung${sw.length > 1 ? "en" : ""}) · ${st} Erinnerung${st === 1 ? "" : "en"} – bitte entscheiden` });
    }
  }

  /* Noch nie eingeloggt */
  if (!lastSeen) {
    const firstOrder = orders.reduce((a, b) => (ts(a.created) <= ts(b.created) ? a : b));
    const created = ts(firstOrder.created);
    const ref = String(firstOrder.id);
    const s = sent("never", ref);
    const st = s.reduce((mx, r) => Math.max(mx, Number(r.stage)), 0);
    const lastT = s.reduce((mx, r) => Math.max(mx, ts(r.sent_at)), 0);
    if (created >= since) {
      if (st === 0) { const at = created + 24 * H; if (soon >= at) plan.due.never = { ref, stage: 1, orderId: ref }; else plan.upcoming.push({ email, name: d.name, orderId: ref, kind: "never", stage: 1, dueAt: iso(at) }); }
      else if (st === 1) { const at = lastT + 48 * H; if (soon >= at) plan.due.never = { ref, stage: 2, orderId: ref }; else plan.upcoming.push({ email, name: d.name, orderId: ref, kind: "never", stage: 2, dueAt: iso(at) }); }
      else if (now - lastT >= 24 * H) plan.attention.push({ email, name: d.name, orderId: ref, kind: "never", since: iso(created), text: `Noch nie eingeloggt seit ${daysTxt(now - created)} · 2 Erinnerungen – anrufen oder WhatsApp` });
    }
  } else {
    /* Neuigkeiten-Mail bekommen, aber seitdem nicht im Dashboard */
    const ev = await pool.query(`SELECT id, order_id, created_at FROM events WHERE lower(email)=$1 AND title LIKE 'Dashboard-Update an Kunden gesendet%' ORDER BY created_at DESC LIMIT 1`, [email]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
    const e = ev.rows[0];
    if (e) {
      const t = ts(e.created_at);
      const ref = String(e.id);
      if (t >= since && lastSeen < t && !sent("news", ref).length) {
        const at = t + 10 * H;
        if (soon >= at) plan.due.news = { ref, orderId: (e.order_id as string) || null };
        else plan.upcoming.push({ email, name: d.name, orderId: (e.order_id as string) || null, kind: "news", stage: 1, dueAt: iso(at) });
      }
    }
  }
  return plan;
}

async function candidates(): Promise<string[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT DISTINCT lower(email) AS e FROM orders WHERE service='reviews' AND email IS NOT NULL AND email <> ''
    AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '120 days'`);
  return r.rows.map((x) => x.e).filter((e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
}

/* ---------- Versand ---------- */
const KIND_L: Record<Kind, string> = { pay: "Zahlung", sw: "Software-Entscheidung", never: "Noch nie eingeloggt", news: "Neuigkeiten nicht angesehen" };

async function sendPlan(app: FastifyInstance, p: Plan): Promise<boolean> {
  const due = p.due;
  if (!due.pay && !due.sw && !due.never && !due.news) return false;
  const props: ErinnerungProps = {
    lang: p.lang, name: p.name, dashUrl: await dashLink(p.email, p.lang).then((u) => (due.sw ? u + (u.includes("?") ? "&" : "?") + "open=software" : u)), // Software: Entscheidung öffnet sich direkt
    pay: due.pay ? { stage: due.pay.stage, amount: due.pay.amount, n: due.pay.n } : null,
    sw: due.sw ? { n: due.sw.n, price: due.sw.price } : null,
    never: !!due.never, news: !!due.news,
  };
  const html = await render(React.createElement(KundenErinnerungReviews, props));
  const subject = erinnerungSubject(props);
  await sendMail({ to: p.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
  const parts: string[] = [];
  const rec = async (kind: Kind, ref: string, stage: number, orderId: string | null) => {
    await pool!.query(`INSERT INTO cust_followups (email, kind, ref, stage, order_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [p.email, kind, ref, stage, orderId]);
  };
  if (due.pay) { await rec("pay", due.pay.ref, due.pay.stage, due.pay.orderId); parts.push(`Zahlung ${due.pay.amount} · Stufe ${due.pay.stage}`); }
  if (due.sw) {
    const st = (await pool!.query(`SELECT count(*)::int AS n FROM cust_followups WHERE email=$1 AND kind='sw' AND ref=$2`, [p.email, due.sw.ref])).rows[0].n + 1;
    await rec("sw", due.sw.ref, st, due.sw.orderId); parts.push(`Software-Entscheidung (${due.sw.n}) · Erinnerung ${st}`);
  }
  if (due.never) { await rec("never", due.never.ref, due.never.stage, due.never.orderId); parts.push(`Noch nie eingeloggt · Erinnerung ${due.never.stage}`); }
  if (due.news) { await rec("news", due.news.ref, 1, due.news.orderId); parts.push("Neuigkeiten nicht angesehen"); }
  const orderId = due.pay?.orderId || due.sw?.orderId || due.never?.orderId || due.news?.orderId || undefined;
  // Admin: Verlauf/Mahnungs-Historie (Titel mit „Mahnung (Bewertungen) … Stufe N" zählt in „Mahnung senden" mit).
  const title = due.pay
    ? `Mahnung (Bewertungen) gesendet · Stufe ${due.pay.stage} (automatische Erinnerung${parts.length > 1 ? " + " + parts.slice(1).join(", ") : ""})`
    : `Erinnerung gesendet (automatisch) · ${parts.join(" · ")}`;
  await insertEvent({ orderId, email: p.email, type: due.pay ? "pay" : "mail", title, detail: `${parts.join(" · ")} · ${erinnerungTitle(props)} · Sprache ${p.lang.toUpperCase()} · ${p.tz}`, html, subject, auto: true });
  // Dashboard-Aktivität (Admin „Aktivitäten")
  void logCustEvent(p.email, "reminder", parts.join(" · "), { subject, auto: true }, { orderId: orderId || null });
  // Push dazu bei Zahlung / Software
  if (due.pay || due.sw) void notifyCustomer(p.email, erinnerungTitle(props), subject, `rrc-reminder-${Date.now()}`, { url: "/my-reviews" }).catch(() => false);
  app.log.info({ email: p.email, parts }, "Nachfassen: Erinnerung gesendet");
  return true;
}

let running = false;
async function tick(app: FastifyInstance): Promise<void> {
  if (running || !pool || MODE() === "off") return;
  running = true;
  try {
    await init();
    const now = Date.now();
    for (const email of await candidates()) {
      try {
        const p = await analyze(email, now);
        if (!p) continue;
        const has = p.due.pay || p.due.sw || p.due.never || p.due.news;
        if (!has) continue;
        if (now - p.lastAutoAt < 20 * H) continue; // max. 1 automatische Mail pro Tag
        if (!quietOk(p.tz)) continue;              // nur 8–20 Uhr Ortszeit
        // Was ohnehin in den nächsten 24 h fällig würde, gleich mitschicken (1 Mail statt Warten auf morgen).
        const full = (await analyze(email, now, 24 * H)) || p;
        if (MODE() !== "live") { app.log.info({ email, due: Object.keys(full.due) }, "Nachfassen (dry): würde senden"); continue; }
        await sendPlan(app, full);
      } catch (e) { app.log.error({ err: e, email }, "Nachfassen: Fehler bei Kunde"); }
    }
  } finally { running = false; }
}

export function startFollowupWorker(app: FastifyInstance): void {
  void init().catch(() => {});
  setTimeout(() => void tick(app), 90_000);
  setInterval(() => void tick(app), 10 * 60_000);
}

/* ---------- Admin ---------- */
export function registerFollowupRoutes(app: FastifyInstance, adminOk: (t: unknown) => boolean): void {
  // Liste „Nachfassen" + geplante Erinnerungen + zuletzt gesendete.
  app.post("/admin/followups", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "Keine Datenbank" });
    await init();
    const now = Date.now();
    const attention: Attention[] = []; const upcoming: Upcoming[] = []; const dueNow: Upcoming[] = [];
    for (const email of await candidates()) {
      const p = await analyze(email, now).catch(() => null);
      if (!p) continue;
      attention.push(...p.attention);
      upcoming.push(...p.upcoming);
      for (const k of Object.keys(p.due) as Kind[]) {
        const x = p.due[k] as { orderId?: string | null; stage?: number };
        dueNow.push({ email, name: p.name, orderId: x.orderId || null, kind: k, stage: x.stage || 1, dueAt: iso(now), waitQuiet: !quietOk(p.tz) || now - p.lastAutoAt < 20 * H });
      }
    }
    const recent = await pool.query(`SELECT email, kind, stage, order_id, sent_at FROM cust_followups ORDER BY sent_at DESC LIMIT 50`);
    attention.sort((a, b) => ts(a.since) - ts(b.since));
    upcoming.sort((a, b) => ts(a.dueAt) - ts(b.dueAt));
    return { ok: true, mode: MODE(), since: iso(SINCE()), attention, dueNow, upcoming, recent: recent.rows, kinds: KIND_L };
  });
  // Vorschau der Erinnerungs-Mail (alle Blöcke) für eine Sprache.
  app.post("/admin/followups/preview", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const lang = MAIL_LANGS.includes(String(b.lang)) ? String(b.lang) : "de";
    const kind = String(b.kind || "pay");
    const props: ErinnerungProps = {
      lang, name: String(b.name || "Maria Muster"), dashUrl: "https://www.rapid-remove.com/my-reviews",
      pay: kind === "pay" || kind === "pay2" ? { stage: kind === "pay2" ? 2 : 1, amount: fmtReviewMoney(358, "eur"), n: 2 } : null,
      sw: kind === "sw" || kind === "combo" ? { n: 1, price: fmtReviewMoney(300, "eur") } : null,
      never: kind === "never", news: kind === "news" || kind === "combo",
    };
    if (kind === "combo") props.pay = { stage: 1, amount: fmtReviewMoney(358, "eur"), n: 2 };
    const html = await render(React.createElement(KundenErinnerungReviews, props));
    return { ok: true, subject: erinnerungSubject(props), html };
  });
}
