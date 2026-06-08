/* Vorschau-/Test-Server: zeigt alle Templates im Browser und kann
   Test-Mails per Link versenden. Auf Railway: Start-Command "npm start". */
import "dotenv/config";
import Fastify from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";
import stripeWebhook from "./webhooks/stripe";
import { initDb, dbReady, insertOrder, upsertCheck, linkCheck, listOrders, listChecks, dbCounts } from "./db";
import { hasSecretKey, getStripeMetrics } from "./integrations/stripe";

const app = Fastify({ logger: true, trustProxy: true });
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// CORS: erlaubt den Browser-POST der Marketing-Site auf den öffentlichen /order-Endpunkt.
// SITE_ORIGIN optional auf die Site-URL setzen; sonst "*" (Endpunkt ist nicht credentialed).
const SITE_ORIGIN = process.env.SITE_ORIGIN || "*";
app.addHook("onRequest", async (req, reply) => {
  reply.header("Access-Control-Allow-Origin", SITE_ORIGIN);
  reply.header("Vary", "Origin");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return reply.code(204).send();
});

// einfache In-Memory-Drosselung pro IP (Missbrauchsschutz)
function throttle(map: Map<string, number[]>, ip: string, limit: number): boolean {
  const now = Date.now();
  const arr = (map.get(ip) || []).filter((ts) => now - ts < 60_000);
  if (arr.length >= limit) { map.set(ip, arr); return false; }
  arr.push(now); map.set(ip, arr);
  return true;
}
const orderHits = new Map<string, number[]>();
const checkHits = new Map<string, number[]>();
const allowOrder = (ip: string) => throttle(orderHits, ip, 5);
const allowCheck = (ip: string) => throttle(checkHits, ip, 30);
const escapeHtml = (s: string) =>
  String(s).replace(/[<>&]/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// Stripe-Webhook (eigener Scope mit RAW-Body für die Signaturprüfung)
app.register(stripeWebhook);

app.get("/health", async () => {
  let orders = 0, checks = 0;
  try { const c = await dbCounts(); orders = c.orders; checks = c.checks; } catch { /* Tabellen evtl. noch nicht da */ }
  return { ok: true, db: dbReady(), stripe: hasSecretKey(), orders, checks };
});

// Übersicht aller Templates (nach Gruppe sortiert, im Markendesign)
app.get("/", async (_req, reply) => {
  const ORDER = ["Bestellung", "Mitwirkung", "Storno", "Schutz"];
  const groups = new Map<string, string[]>();
  for (const [k, t] of Object.entries(TEMPLATES)) {
    const row =
      `<li style="margin:0;padding:13px 0;border-bottom:1px solid #ece7e1;display:flex;` +
      `justify-content:space-between;align-items:center;gap:12px">` +
      `<a href="/preview/${k}" style="color:#1c1916;text-decoration:none;font-weight:600">${t.label}</a>` +
      `<span style="white-space:nowrap"><a href="/preview/${k}?lang=de" style="color:#ff8000;text-decoration:none;font-weight:700">DE</a>` +
      `<span style="color:#d6cfc7"> · </span>` +
      `<a href="/preview/${k}?lang=en" style="color:#ff8000;text-decoration:none;font-weight:700">EN</a></span></li>`;
    (groups.get(t.group) ?? groups.set(t.group, []).get(t.group)!).push(row);
  }
  const sections = ORDER.filter((g) => groups.has(g)).map((g) =>
    `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#6b6259;` +
    `margin:28px 0 4px">${g}</h2><ul style="list-style:none;margin:0;padding:0">${groups.get(g)!.join("")}</ul>`,
  ).join("");
  const count = Object.keys(TEMPLATES).length;
  return reply.type("text/html").send(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>RapidRemove · E-Mail-Vorschau</title>` +
    `<div style="font-family:'Manrope',system-ui,sans-serif;max-width:680px;margin:0 auto;` +
    `padding:40px 20px;color:#2a2622;background:#f6f3f0;min-height:100vh">` +
    `<div style="background:#fff;border:1px solid #ece7e1;border-top:4px solid #ff8000;` +
    `border-radius:18px;padding:28px 32px">` +
    `<div style="font-size:21px;font-weight:800;letter-spacing:-.02em;color:#ff8000">RapidRemove</div>` +
    `<h1 style="margin:14px 0 4px;font-size:24px;letter-spacing:-.02em;color:#1c1916">E-Mail-Vorschau</h1>` +
    `<p style="color:#6b6259;margin:0;font-size:14px">${count} Templates · klick öffnet die fertige Mail. ` +
    `Test-Versand: <code style="background:#fff4e8;padding:1px 5px;border-radius:5px">` +
    `/send-test?key=…&amp;to=du@mail.de&amp;token=…</code></p>` +
    `${sections}</div></div>`);
});

// Einzelne Vorschau (HTML im Browser)
app.get("/preview/:key", async (req, reply) => {
  const { key } = req.params as { key: string };
  const { lang } = req.query as { lang?: string };
  const t = TEMPLATES[key];
  if (!t) return reply.code(404).type("text/html").send("Unbekanntes Template");
  const props = { ...t.sample, ...(lang ? { lang } : {}) };
  const html = await render(React.createElement(t.component, props));
  return reply.type("text/html").send(html);
});

// Test-Versand per Link (mit ADMIN_TOKEN geschützt)
app.get("/send-test", async (req, reply) => {
  const { key = "auftragsbestaetigung", to, token, lang } = req.query as Record<string, string>;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return reply.code(401).send("unauthorized");
  const t = TEMPLATES[key];
  if (!t || !to) return reply.code(400).send("Parameter fehlen: key, to");
  const props = { ...t.sample, ...(lang ? { lang } : {}) };
  const html = await render(React.createElement(t.component, props));
  await sendMail({ to, subject: t.subject(props), html });
  return { sent: to, template: key };
});

// Bestellung aus dem Wizard: bestehende Auftragsbestätigung an den Kunden
// + interne Benachrichtigung an das Postfach. Kein Stripe nötig.
app.post("/order", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  const email = String(b.email ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "invalid email" });
  if (!allowOrder(req.ip)) return reply.code(429).send({ ok: false, error: "rate limited" });

  const name = clip(b.name, 120);
  const company = clip(b.company, 160);
  const phone = clip(b.phone, 60);
  const service = clip(b.service, 40);
  const protection = clip(b.protection, 40);
  const profile = clip(b.profile, 200);
  const orderId = clip(b.orderId, 40);
  const lang = clip(b.lang, 5) || "de";
  const tlang = lang === "de" ? "de" : "en";

  const t = TEMPLATES["auftragsbestaetigung"];
  const anrede = name ? (tlang === "de" ? `Guten Tag ${name},` : `Hello ${name},`) : undefined;
  const props = { lang: tlang, anrede };
  const html = await render(React.createElement(t.component, props));

  const result = { ok: true, customer: false, notify: false, saved: false };
  // 1) Kundenbestätigung (bestehendes Template)
  try {
    await sendMail({ to: email, subject: t.subject(props), html, replyTo: process.env.MAIL_REPLY_TO });
    result.customer = true;
  } catch (e) { app.log.error({ err: e }, "Kundenbestätigung fehlgeschlagen"); }

  // 2) interne Benachrichtigung an das Postfach
  try {
    const notify = process.env.NOTIFY_TO || process.env.MAIL_FROM || "info@rapid-remove.com";
    const row = (l: string, v: string) =>
      v ? `<tr><td style="padding:3px 14px 3px 0;color:#6b6259">${l}</td><td style="padding:3px 0;font-weight:600">${escapeHtml(v)}</td></tr>` : "";
    const adminHtml =
      `<div style="font-family:system-ui,sans-serif;color:#1c1916"><h2 style="color:#ff8000;margin:0 0 10px">Neue Bestellung</h2>` +
      `<table style="border-collapse:collapse;font-size:14px">` +
      row("Name", name) + row("E-Mail", email) + row("Telefon", phone) + row("Unternehmen", company) +
      row("Profil", profile) + row("Leistung", service) + row("Schutz", protection) +
      row("Sprache", lang) + row("Bestell-Nr.", orderId) +
      `</table></div>`;
    await sendMail({ to: notify, subject: `Neue Bestellung – ${company || name || email}`, html: adminHtml, replyTo: email });
    result.notify = true;
  } catch (e) { app.log.error({ err: e }, "interne Benachrichtigung fehlgeschlagen"); }

  // 3) Bestellung in der Datenbank speichern (falls DATABASE_URL gesetzt)
  try {
    if (dbReady()) {
      const id = orderId || ("RR-" + Math.floor(100000 + Math.random() * 899999));
      const checkId = clip(b.checkId, 40);
      await insertOrder({
        id, name, email, phone, company, lang, profile, service, protection,
        country: clip(b.country, 6) || "DE",
        category: clip(b.category, 120),
        rating: clip(b.rating, 12),
        reviews: Number(b.reviews) || 0,
        amount: Number(b.amount) || 0,
        protAmount: Number(b.protAmount) || 0,
        checkId, raw: b,
      });
      if (checkId) await linkCheck(checkId, id);
      result.saved = true;
    }
  } catch (e) { app.log.error({ err: e }, "Bestellung speichern fehlgeschlagen"); }

  return result;
});

// Profil-Prüfung aus dem Wizard protokollieren (Lead). Öffentlich, gedrosselt.
app.post("/check", async (req, reply) => {
  if (!allowCheck(req.ip)) return reply.code(429).send({ ok: false, error: "rate limited" });
  const b = (req.body || {}) as Record<string, unknown>;
  const id = clip(b.checkId, 40) || ("CHK-" + Math.floor(100000 + Math.random() * 899999));
  try {
    if (dbReady()) {
      await upsertCheck({
        id,
        profile: clip(b.profile, 200), category: clip(b.category, 120), rating: clip(b.rating, 12),
        reviews: Number(b.reviews) || 0, recommend: clip(b.recommend, 40) || "remove",
        name: clip(b.name, 160), email: clip(b.email, 160) || undefined,
        country: clip(b.country, 6) || "DE", lang: clip(b.lang, 5) || "de",
      });
    }
  } catch (e) { app.log.error({ err: e }, "Prüfung speichern fehlgeschlagen"); }
  return { ok: true, id };
});

// Admin-Dashboard: Login-Prüfung (gegen ADMIN_TOKEN)
app.post("/admin/verify", async (req) => {
  const b = (req.body || {}) as Record<string, unknown>;
  return { ok: !!ADMIN_TOKEN && String(b.token || "") === ADMIN_TOKEN };
});

// Admin-Dashboard: frei verfasste E-Mail aus dem Composer versenden (token-geschützt)
app.post("/admin/send", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.to || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  const subject = String(b.subject || "").trim() || "RapidRemove";
  const safe = escapeHtml(String(b.text || "")).replace(/\n/g, "<br>");
  const html =
    `<div style="font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1c1916;max-width:560px">` +
    `<div style="font-weight:800;color:#ff8000;font-size:18px;margin-bottom:14px">RapidRemove</div>` +
    `<div>${safe}</div></div>`;
  try {
    await sendMail({ to, subject, html, replyTo: process.env.MAIL_REPLY_TO });
    return { ok: true };
  } catch (e) {
    app.log.error({ err: e }, "admin/send fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: "send failed" });
  }
});

// Admin-Dashboard: Live-Daten (Bestellungen + Prüfungen) aus der DB
app.post("/admin/data", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const [orders, checks] = await Promise.all([listOrders(200), listChecks(200)]);
  return { ok: true, db: dbReady(), orders, checks };
});

// Admin-Dashboard: Abos & Umsatz live aus Stripe (read-only, 60s gecacht)
let stripeCache: { ts: number; data: unknown } | null = null;
app.post("/admin/stripe", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!hasSecretKey()) return { ok: true, connected: false, error: "STRIPE_SECRET_KEY nicht gesetzt" };
  try {
    if (!stripeCache || Date.now() - stripeCache.ts > 60_000) {
      stripeCache = { ts: Date.now(), data: await getStripeMetrics() };
    }
    return { ok: true, connected: true, ...(stripeCache.data as Record<string, unknown>) };
  } catch (e) {
    app.log.error({ err: e }, "Stripe-Kennzahlen fehlgeschlagen");
    return { ok: true, connected: false, error: String((e as Error)?.message || e).slice(0, 240) };
  }
});

// Admin-Dashboard: echte E-Mail-Vorlagen (Liste + Betreff) für die Vorlagen-Ansicht.
// Die Vorschau läuft über den bestehenden öffentlichen /preview/:key-Endpunkt.
app.post("/admin/templates", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const templates = Object.entries(TEMPLATES).map(([key, t]) => {
    let subject = "";
    try { subject = (t.subject as (p: any) => string)(t.sample as any); } catch { /* Betreff optional */ }
    return { key, label: t.label, group: t.group, subject };
  });
  return { ok: true, templates };
});

const port = Number(process.env.PORT) || 3000;
async function start() {
  try { await initDb(); if (dbReady()) app.log.info("DB verbunden, Tabellen bereit"); }
  catch (e) { app.log.error({ err: e }, "DB-Init fehlgeschlagen – Backend läuft ohne DB weiter"); }
  try {
    const addr = await app.listen({ host: "0.0.0.0", port });
    app.log.info(`ops läuft auf ${addr}`);
  } catch (err) { app.log.error(err); process.exit(1); }
}
start();
