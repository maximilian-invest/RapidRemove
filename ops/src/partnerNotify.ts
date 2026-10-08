/* Benachrichtigungen an den Lösch-Partner: Web-Push (Partner-App am Home-Bildschirm, Scope /partner)
 * und E-Mail an die Login-Adresse(n) aus partner_accounts. Keine Kontaktdaten der Besteller —
 * nur der öffentliche Profilname + Anzahl/Art der Bewertungen. Englisch (Partner sitzt in Lahore). */
import * as React from "react";
import { render } from "@react-email/render";
import { pool } from "./db";
import { hasWebPush, sendWebPushAll, type PushSub } from "./integrations/webpush";
import { sendMail } from "./mailer";
import { isTestEmail } from "./testAccounts";
import { EmailShell, P, Bullets, CtaButton } from "./emails/components";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

export async function initPartnerPush(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_push_subs (endpoint text PRIMARY KEY, p256dh text NOT NULL, auth text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
  // Geräte des Test-Logins bekommen nur Pushes zu Testaufträgen (und umgekehrt).
  await pool.query(`ALTER TABLE partner_push_subs ADD COLUMN IF NOT EXISTS test boolean NOT NULL DEFAULT false`);
}
export async function savePartnerSub(sub: PushSub, test = false): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO partner_push_subs (endpoint, p256dh, auth, test) VALUES ($1,$2,$3,$4) ON CONFLICT (endpoint) DO UPDATE SET p256dh=$2, auth=$3, test=$4`,
    [sub.endpoint, sub.keys.p256dh, sub.keys.auth, test],
  );
}

/** Push an alle Partner-Geräte (Uber-Stil: kurzer Titel, Body „Kunde · Details"). */
export async function notifyPartner(title: string, body: string, tag?: string, test = false): Promise<void> {
  try {
    if (!pool || !hasWebPush()) return;
    const r = await pool.query(`SELECT endpoint, p256dh, auth FROM partner_push_subs WHERE test=$1`, [test]);
    if (!r.rows.length) return;
    const subs: PushSub[] = r.rows.map((x) => ({ endpoint: x.endpoint, keys: { p256dh: x.p256dh, auth: x.auth } }));
    // App-Badge = offene Aufgaben (Not started + Working).
    const b = await pool.query(`SELECT count(*)::int AS n FROM partner_tasks WHERE status IN ('new','working') AND test=$1`, [test]).catch(() => ({ rows: [{ n: 0 }] }));
    const expired = await sendWebPushAll(subs, { title, body, url: "/partner", tag: tag || `rrp-${Date.now().toString(36)}`, badge: Number(b.rows[0]?.n || 0) });
    for (const ep of expired) await pool.query(`DELETE FROM partner_push_subs WHERE endpoint=$1`, [ep]).catch(() => {});
  } catch { /* best effort */ }
}

const KIND: Record<string, string> = { normal: "standard", old: "older than 4 weeks", nt: "no text" };

/** Neue Bewertungen auf dem Board → Push + E-Mail an den Partner. */
export async function partnerNewOrder(customer: string, tasks: { code: string; kind: string; price?: number }[], test = false, added = false): Promise<void> {
  if (!tasks.length) return;
  const n = tasks.length;
  const name = customer || "New customer";
  const sum = Math.round(tasks.reduce((s, t) => s + Number(t.price || 0), 0) * 100) / 100;
  const rv = `review${n > 1 ? "s" : ""}`;
  // Design: Titel „New order", Text „{Kunde} · {n} reviews · {Betrag}". Nachbestellung: „Review added", „{Kunde} · +1 review …".
  const head = added ? `${n > 1 ? "Reviews" : "Review"} added` : "New order";
  await notifyPartner(`${test ? "TEST · " : ""}${head}`, `${name} · ${added ? "+" : ""}${n} ${rv}${added ? " (existing customer)" : ""}${sum ? ` · ${sum} USD` : ""}`, `rrp-order-${tasks[0].code}`, test);
  try {
    if (!pool) return;
    const acc = await pool.query(`SELECT email FROM partner_accounts`);
    const to = acc.rows.map((x) => x.email).filter((e) => e && isTestEmail(e) === test); // Test ↔ echt strikt getrennt
    if (!to.length) return;
    const url = `${SITE_URL}/partner`;
    const subj = added ? `${head}: ${name} – +${n} ${rv}` : `New order: ${name} – ${n} ${rv}`;
    const el = React.createElement(EmailShell as any, { preview: subj, title: added ? `${head} to an existing order` : "New order on your board", lang: "en" },
      React.createElement(P as any, null, React.createElement("strong", null, "Hi,")),
      React.createElement(P as any, null, added ? `${name} has ordered ${n === 1 ? "one more review" : `${n} more reviews`} – it's on your board now.` : `there's a new order on your RapidRemove board: ${name} – ${n} ${rv}.`),
      React.createElement(Bullets as any, { items: tasks.slice(0, 20).map((t) => `${t.code} · ${KIND[t.kind] || t.kind}`) }),
      React.createElement("div", { style: { textAlign: "center", margin: "10px 0 20px" } }, React.createElement(CtaButton as any, { href: url }, "Open my board")),
      React.createElement(P as any, { muted: true }, "Please set each review to Working when you start, and to Removed once it's gone."),
      React.createElement(P as any, { muted: true }, "Tip: add rapid-remove.com/partner to your home screen and turn on notifications under Account – then you get every new order instantly."),
    );
    const html = await render(el);
    for (const email of to) await sendMail({ to: email, subject: subj, html, replyTo: process.env.MAIL_REPLY_TO });
  } catch { /* best effort */ }
}

/* ---- Erinnerung: Kunde wartet auf Bestätigung ----
 * Ein Kunde gilt als „neu", solange der Partner bei KEINER seiner offenen Bewertungen einen Status gesetzt hat
 * (alles noch „new" und nie auf Working). Ab 1 h Wartezeit: stündlich Push „Customer waiting for order confirmation",
 * nachts in Pakistan (01–08 Uhr PKT) Ruhe. Testaufträge nur an Test-Geräte. */
async function remindWaiting(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_reminders (customer text NOT NULL, test boolean NOT NULL DEFAULT false, last_at timestamptz NOT NULL DEFAULT now(), n integer NOT NULL DEFAULT 0, PRIMARY KEY (customer, test))`);
  const pk = Number(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", hour: "numeric", hour12: false })) % 24;
  if (pk >= 1 && pk < 8) return;
  const r = await pool.query(`
    SELECT COALESCE(customer, '') AS customer, test, count(*)::int AS n, min(created_at) AS since
      FROM partner_tasks
     WHERE status IN ('new','working')
     GROUP BY COALESCE(customer, ''), test
    HAVING bool_and(status = 'new' AND working_since IS NULL AND first_working_at IS NULL)
       AND min(created_at) < now() - interval '1 hour'`);
  for (const g of r.rows as { customer: string; test: boolean; n: number; since: string }[]) {
    const last = await pool.query(`SELECT last_at FROM partner_reminders WHERE customer = $1 AND test = $2`, [g.customer, g.test]);
    const lastAt = last.rows[0] ? new Date(last.rows[0].last_at).getTime() : 0;
    if (Date.now() - lastAt < 58 * 60_000) continue;
    const h = Math.max(1, Math.floor((Date.now() - new Date(g.since).getTime()) / 3600e3));
    await notifyPartner(`${g.test ? "TEST · " : ""}Customer waiting for order confirmation`,
      `${g.customer || "Customer"} · ${g.n} review${g.n > 1 ? "s" : ""} · waiting ${h} h – please start now`,
      `rrp-wait-${(g.customer || "x").slice(0, 40)}`, g.test);
    await pool.query(`INSERT INTO partner_reminders (customer, test, last_at, n) VALUES ($1,$2,now(),1)
      ON CONFLICT (customer, test) DO UPDATE SET last_at = now(), n = partner_reminders.n + 1`, [g.customer, g.test]);
  }
}
export function startPartnerReminders(log?: (o: object, m: string) => void): void {
  const run = () => { remindWaiting().catch((e) => log && log({ err: String((e as Error)?.message || e) }, "Partner-Erinnerung fehlgeschlagen")); };
  setTimeout(run, 60_000);
  setInterval(run, 5 * 60_000);
}
