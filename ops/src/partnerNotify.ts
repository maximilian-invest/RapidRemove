/* Benachrichtigungen an den Lösch-Partner: Web-Push (Partner-App am Home-Bildschirm, Scope /partner)
 * und E-Mail an die Login-Adresse(n) aus partner_accounts. Keine Kontaktdaten der Besteller —
 * nur der öffentliche Profilname + Anzahl/Art der Bewertungen. Englisch (Partner sitzt in Lahore). */
import * as React from "react";
import { render } from "@react-email/render";
import { pool } from "./db";
import { hasWebPush, sendWebPushAll, type PushSub } from "./integrations/webpush";
import { sendMail } from "./mailer";
import { EmailShell, P, Bullets, CtaButton } from "./emails/components";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

export async function initPartnerPush(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_push_subs (endpoint text PRIMARY KEY, p256dh text NOT NULL, auth text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
}
export async function savePartnerSub(sub: PushSub): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO partner_push_subs (endpoint, p256dh, auth) VALUES ($1,$2,$3) ON CONFLICT (endpoint) DO UPDATE SET p256dh=$2, auth=$3`,
    [sub.endpoint, sub.keys.p256dh, sub.keys.auth],
  );
}

/** Push an alle Partner-Geräte (Uber-Stil: kurzer Titel, Body „Kunde · Details"). */
export async function notifyPartner(title: string, body: string, tag?: string): Promise<void> {
  try {
    if (!pool || !hasWebPush()) return;
    const r = await pool.query(`SELECT endpoint, p256dh, auth FROM partner_push_subs`);
    if (!r.rows.length) return;
    const subs: PushSub[] = r.rows.map((x) => ({ endpoint: x.endpoint, keys: { p256dh: x.p256dh, auth: x.auth } }));
    const expired = await sendWebPushAll(subs, { title, body, url: "/partner", tag: tag || `rrp-${Date.now().toString(36)}` });
    for (const ep of expired) await pool.query(`DELETE FROM partner_push_subs WHERE endpoint=$1`, [ep]).catch(() => {});
  } catch { /* best effort */ }
}

const KIND: Record<string, string> = { normal: "standard", old: "older than 4 weeks", nt: "no text" };

/** Neue Bewertungen auf dem Board → Push + E-Mail an den Partner. */
export async function partnerNewOrder(customer: string, tasks: { code: string; kind: string }[]): Promise<void> {
  if (!tasks.length) return;
  const n = tasks.length;
  const name = customer || "New customer";
  const kinds = Object.entries(tasks.reduce((m, t) => ({ ...m, [t.kind]: (m[t.kind] || 0) + 1 }), {} as Record<string, number>))
    .map(([k, c]) => `${c} ${KIND[k] || k}`).join(", ");
  await notifyPartner(`New order · ${name}`, `${n} review${n > 1 ? "s" : ""} · ${kinds}`, `rrp-order-${tasks[0].code}`);
  try {
    if (!pool) return;
    const acc = await pool.query(`SELECT email FROM partner_accounts`);
    const to = acc.rows.map((x) => x.email).filter(Boolean);
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
