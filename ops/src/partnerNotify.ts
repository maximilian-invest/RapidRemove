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
export async function partnerNewOrder(customer: string, tasks: { code: string; kind: string; price?: number }[], test = false): Promise<void> {
  if (!tasks.length) return;
  const n = tasks.length;
  const name = customer || "New customer";
  const sum = Math.round(tasks.reduce((s, t) => s + Number(t.price || 0), 0) * 100) / 100;
  // Design: Titel „New order", Text „{Kunde} · {n} reviews · {Betrag}".
  await notifyPartner(`${test ? "TEST · " : ""}New order`, `${name} · ${n} review${n > 1 ? "s" : ""}${sum ? ` · ${sum} USD` : ""}`, `rrp-order-${tasks[0].code}`, test);
  try {
    if (!pool) return;
    const acc = await pool.query(`SELECT email FROM partner_accounts`);
    const to = acc.rows.map((x) => x.email).filter((e) => e && isTestEmail(e) === test); // Test ↔ echt strikt getrennt
    if (!to.length) return;
    const url = `${SITE_URL}/partner`;
    const el = React.createElement(EmailShell as any, { preview: `New order: ${name} – ${n} review${n > 1 ? "s" : ""}`, title: "New order on your board", lang: "en" },
      React.createElement(P as any, null, React.createElement("strong", null, "Hi,")),
      React.createElement(P as any, null, `there's a new order on your RapidRemove board: ${name} – ${n} review${n > 1 ? "s" : ""}.`),
      React.createElement(Bullets as any, { items: tasks.slice(0, 20).map((t) => `${t.code} · ${KIND[t.kind] || t.kind}`) }),
      React.createElement("div", { style: { textAlign: "center", margin: "10px 0 20px" } }, React.createElement(CtaButton as any, { href: url }, "Open my board")),
      React.createElement(P as any, { muted: true }, "Please set each review to Working when you start, and to Removed once it's gone."),
      React.createElement(P as any, { muted: true }, "Tip: add rapid-remove.com/partner to your home screen and turn on notifications under Account – then you get every new order instantly."),
    );
    const html = await render(el);
    for (const email of to) await sendMail({ to: email, subject: `New order: ${name} – ${n} review${n > 1 ? "s" : ""}`, html, replyTo: process.env.MAIL_REPLY_TO });
  } catch { /* best effort */ }
}
