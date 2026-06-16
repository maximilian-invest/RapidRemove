/* Vorschau-/Test-Server: zeigt alle Templates im Browser und kann
   Test-Mails per Link versenden. Auf Railway: Start-Command "npm start". */
import "dotenv/config";
import Fastify from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";
import stripeWebhook from "./webhooks/stripe";
import { initDb, dbReady, insertOrder, upsertCheck, linkCheck, listOrders, listChecks, dbCounts, insertEvent, listEvents, listEventsByEmail, getEventEmail, updateOrderStatus, setOrderForm, setOrderAssignee, getOrderBasic, savePushSubscription, listPushSubscriptions, deletePushSubscription, wipeOrderData, listRedirects, listEnabledRedirects, upsertRedirect, deleteRedirect } from "./db";
import { hasSecretKey, getStripeMetrics, matchPaymentLink, listPaymentLinks } from "./integrations/stripe";
import { hasClickSend, sendSms } from "./integrations/clicksend";
import { hasFirstPromoter, trackSale, trackSignup } from "./integrations/firstpromoter";
import { sendPush } from "./integrations/push";
import { hasWebPush, vapidPublicKey, sendWebPushAll } from "./integrations/webpush";
import { payLinkFor } from "./paymentLinks";
import { runExpressSetup } from "./expressSetup";
import { startUpsellWorker } from "./upsell";

const app = Fastify({ logger: true, trustProxy: true });
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "55default";

// Alle vom Kunden wählbaren Sprachen — Mails werden in der echten Sprache verschickt (Fallback: en).
const MAIL_LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const mailLang = (l: unknown): string => { const s = String(l || "").slice(0, 5); return MAIL_LANGS.includes(s) ? s : "en"; };
const GREETING: Record<string, (n: string) => string> = {
  de: (n) => `Guten Tag ${n},`, en: (n) => `Hello ${n},`, es: (n) => `Hola ${n},`,
  fr: (n) => `Bonjour ${n},`, it: (n) => `Gentile ${n},`, nl: (n) => `Beste ${n},`,
  pt: (n) => `Olá ${n},`, ja: (n) => `${n} 様`, sv: (n) => `Hej ${n},`,
  da: (n) => `Hej ${n},`, no: (n) => `Hei ${n},`,
};
const DUE_NOW: Record<string, string> = { de: "sofort", en: "immediately", es: "de inmediato", fr: "immédiatement", it: "subito", nl: "direct", pt: "de imediato", ja: "ただちに", sv: "omgående", da: "straks", no: "umiddelbart" };
const DUE_MAHN: Record<string, string> = { de: "umgehend", en: "now", es: "ahora", fr: "maintenant", it: "ora", nl: "nu", pt: "agora", ja: "今すぐ", sv: "nu", da: "nu", no: "nå" };

// CORS: erlaubt den Browser-POST der Marketing-Site auf den öffentlichen /order-Endpunkt.
// SITE_ORIGIN optional auf die Site-URL setzen; sonst "*" (Endpunkt ist nicht credentialed).
const SITE_ORIGIN = process.env.SITE_ORIGIN || "*";
// Öffentliche Site-URL (für Links in E-Mails, z. B. Fragebogen-Seite). NICHT SITE_ORIGIN nehmen (kann "*" sein).
const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
const FORM_FIELDS = ["verified", "smsOk", "payment48"];
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

// 301-Weiterleitungen: Quelle immer als sauberer Pfad ("/alt"), Ziel als Pfad
// oder absolute URL. Tolerant gegenüber eingefügten vollständigen URLs.
function normRedirectSource(input: string): string {
  let s = String(input || "").trim().replace(/^https?:\/\/[^/]+/i, "");
  s = s.split("#")[0].split("?")[0];
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s;
}
function normRedirectDest(input: string): string {
  const s = String(input || "").trim();
  if (/^https?:\/\//i.test(s)) return s;
  let p = s.split("#")[0];
  if (!p.startsWith("/")) p = "/" + p;
  return p;
}

// Stripe-Webhook (eigener Scope mit RAW-Body für die Signaturprüfung)
app.register(stripeWebhook);

app.get("/health", async () => {
  let orders = 0, checks = 0, dbError = "";
  try { const c = await dbCounts(); orders = c.orders; checks = c.checks; }
  catch (e) { dbError = String((e as Error)?.message || e).slice(0, 160); }
  return { ok: true, db: dbReady(), stripe: hasSecretKey(), sms: hasClickSend(), firstPromoter: hasFirstPromoter(), orders, checks, ...(dbError ? { dbError } : {}) };
});

// Öffentlich: aktive 301/302-Weiterleitungen für die Middleware der Marketing-Site.
// Bewusst ohne Token (Regeln sind kein Geheimnis) und kurz gecacht.
app.get("/redirects.json", async (_req, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  try {
    const rules = await listEnabledRedirects();
    reply.header("Cache-Control", "public, max-age=60");
    return rules;
  } catch (e) {
    reply.header("Cache-Control", "public, max-age=30");
    return [];
  }
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
  const { lang, variant } = req.query as { lang?: string; variant?: string };
  const t = TEMPLATES[key];
  if (!t) return reply.code(404).type("text/html").send("Unbekanntes Template");
  const props = { ...t.sample, ...(lang ? { lang } : {}), ...(variant ? { variant: Number(variant) } : {}) };
  const html = await render(React.createElement(t.component, props));
  return reply.type("text/html").send(html);
});

// Test-Versand per Link (mit ADMIN_TOKEN geschützt)
app.get("/send-test", async (req, reply) => {
  const { key = "auftragsbestaetigung", to, token, lang, variant } = req.query as Record<string, string>;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return reply.code(401).send("unauthorized");
  const t = TEMPLATES[key];
  if (!t || !to) return reply.code(400).send("Parameter fehlen: key, to");
  const props = { ...t.sample, ...(lang ? { lang } : {}), ...(variant ? { variant: Number(variant) } : {}) };
  const html = await render(React.createElement(t.component, props));
  await sendMail({ to, subject: t.subject(props), html });
  return { sent: to, template: key };
});

// Öffentliches Kontaktformular (Kontakt-Seite): mailt die Nachricht ans Team,
// Reply-To = Absender. Rate-limited wie /order. Kein Speichern in der DB.
app.post("/contact", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  const email = String(b.email ?? "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "invalid email" });
  if (!allowOrder(req.ip)) return reply.code(429).send({ ok: false, error: "rate limited" });
  const name = clip(b.name, 120);
  const topic = clip(b.topic, 120);
  const message = clip(b.message, 4000);
  const lang = clip(b.lang, 5) || "de";
  if (!message) return reply.code(400).send({ ok: false, error: "empty message" });
  try {
    const notify = process.env.CONTACT_TO || "helpdesk@rapid-remove.com";
    const row = (l: string, v: string) => (v ? `<tr><td style="padding:3px 14px 3px 0;color:#6b6259">${l}</td><td style="padding:3px 0;font-weight:600">${escapeHtml(v)}</td></tr>` : "");
    const html =
      `<div style="font-family:system-ui,sans-serif;color:#1c1916"><h2 style="color:#ff8000;margin:0 0 10px">Neue Kontaktanfrage</h2>` +
      `<table style="border-collapse:collapse;font-size:14px">` +
      row("Name", name) + row("E-Mail", email) + row("Thema", topic) + row("Sprache", lang) +
      `</table><p style="white-space:pre-wrap;font-size:14px;margin-top:14px">${escapeHtml(message)}</p></div>`;
    await sendMail({ to: notify, subject: `Kontaktanfrage – ${topic || name || email}`, html, replyTo: email });
    return { ok: true };
  } catch (e) {
    app.log.error({ err: e }, "Kontaktformular fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: "send failed" });
  }
});

// Live-Bewertungszahl von Trustpilot: serverseitig vom Profil gelesen (6 h gecacht).
// Für die eigene Trustpilot-Zeile auf der Website — das offizielle Widget-iframe
// ließ sich nicht zuverlässig linksbündig ausrichten (Inhalt cross-origin).
let tpCountCache: { ts: number; count: number; rating: string | null } | null = null;
app.get("/tp-count", async () => {
  if (tpCountCache && Date.now() - tpCountCache.ts < 6 * 3600_000) {
    return { ok: true, count: tpCountCache.count, rating: tpCountCache.rating };
  }
  try {
    const res = await fetch("https://at.trustpilot.com/review/rapid-remove.com", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RapidRemove/1.0; +https://www.rapid-remove.com)" },
    });
    const html = await res.text();
    const m = html.match(/"reviewCount"\s*:\s*"?(\d+)/) || html.match(/"numberOfReviews"\s*:\s*(\d+)/);
    const r = html.match(/"ratingValue"\s*:\s*"?([\d.]+)/) || html.match(/"trustScore"\s*:\s*([\d.]+)/);
    const count = m ? parseInt(m[1], 10) : 0;
    const rating = r ? r[1] : null;
    if (count > 0) { tpCountCache = { ts: Date.now(), count, rating }; return { ok: true, count, rating }; }
    return { ok: false, count: null, rating };
  } catch (e) {
    app.log.warn({ err: e }, "tp-count fehlgeschlagen");
    if (tpCountCache) return { ok: true, count: tpCountCache.count, rating: tpCountCache.rating, stale: true };
    return { ok: false, count: null, rating: null };
  }
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
  const note = clip(b.note, 2000);
  const tlang = mailLang(lang);
  // Presse-/Suchergebnis-Auslistung (Wizard) ist eine kostenlose Prüfung, keine
  // bestätigte Löschung — landet als Bestellung „deindex" im Admin. Der Kunde
  // bekommt dafür die Eingangsbestätigung „Wir prüfen Ihren Fall" statt der
  // Auftragsbestätigung fürs Profil-Löschen.
  const isPress = service === "deindex";
  // Affiliate (FirstPromoter): lesbarer Partner-Code aus dem _fprom_ref-Cookie,
  // vom Browser mitgeschickt. Wird in interner Mail, Push und Admin angezeigt,
  // damit sofort sichtbar ist, von welchem Partner die Bestellung kommt.
  // Kann unten aus der track/sale-Antwort (Promoter-Name) angereichert werden.
  let affiliate = clip(b.fprRef, 200);
  if (affiliate) { try { affiliate = decodeURIComponent(affiliate); } catch (e) { /* roher Wert ok */ } affiliate = affiliate.replace(/[<>\r\n]/g, "").trim().slice(0, 120); }
  // Diagnose: zeigt bei jeder Bestellung im Log, was zur Affiliate-Zuordnung ankam.
  app.log.info({ orderId, isPress, hasFPR: hasFirstPromoter(), fprRefIn: clip(b.fprRef, 120), fprTidIn: b.fprTid ? "yes" : "no", affiliate }, "Order: Affiliate-Eingang");

  const t = TEMPLATES[isPress ? "presse-eingang" : "auftragsbestaetigung"];
  const anrede = name ? (GREETING[tlang] || GREETING.de)(name) : undefined;
  const props = { lang: tlang, anrede };
  const html = await render(React.createElement(t.component, props));

  const result = { ok: true, customer: false, notify: false, saved: false, saveError: "" };
  // 1) Kundenbestätigung — nur noch für Presse-Anfragen (Eingangsbestätigung der kostenlosen
  //    Prüfung). Die Auftragsbestätigung per E-Mail bei Bestellungen ist abgeschaltet (auf
  //    Wunsch); der Kunde erhält den nächsten Schritt (Zahlungslink) separat.
  if (isPress) {
    try {
      await sendMail({ to: email, subject: t.subject(props), html, replyTo: process.env.MAIL_REPLY_TO });
      result.customer = true;
    } catch (e) { app.log.error({ err: e }, "Kundenbestätigung fehlgeschlagen"); }
  }

  // 2) interne Benachrichtigung per E-Mail — ABGESCHALTET, sofern NOTIFY_TO nicht
  //    explizit gesetzt ist. Bestell-Mails an helpdesk@ entfallen damit; die
  //    Benachrichtigung über neue Bestellungen läuft über Push + Admin-Portal.
  const notify = (process.env.NOTIFY_TO || "").trim();
  if (notify) {
    try {
      const row = (l: string, v: string) =>
        v ? `<tr><td style="padding:3px 14px 3px 0;color:#6b6259">${l}</td><td style="padding:3px 0;font-weight:600">${escapeHtml(v)}</td></tr>` : "";
      const heading = isPress ? "Neue Presse-Prüfung" : "Neue Bestellung";
      const adminHtml =
        `<div style="font-family:system-ui,sans-serif;color:#1c1916"><h2 style="color:#ff8000;margin:0 0 10px">${heading}</h2>` +
        (affiliate ? `<div style="display:inline-block;background:#fff5ec;border:1px solid #ffd9b3;color:#c2410c;font-weight:700;font-size:13px;border-radius:8px;padding:6px 12px;margin:0 0 12px">Affiliate: ${escapeHtml(affiliate)}</div>` : "") +
        `<table style="border-collapse:collapse;font-size:14px">` +
        row("Name", name) + row("E-Mail", email) + row("Telefon", phone) + row("Unternehmen", company) +
        row("Profil", profile) + row("Leistung", service) + row("Schutz", protection) +
        row("Sprache", lang) + row("Bestell-Nr.", orderId) +
        `</table>` +
        (note ? `<div style="margin-top:14px"><div style="color:#6b6259;font-size:13px;margin-bottom:4px">${isPress ? "Zu prüfende Inhalte" : "Notiz"}</div><pre style="white-space:pre-wrap;font:inherit;background:#faf6f0;border-radius:8px;padding:10px 12px;margin:0">${escapeHtml(note)}</pre></div>` : "") +
        `</div>`;
      await sendMail({ to: notify, subject: `${heading} – ${company || name || email}`, html: adminHtml, replyTo: email });
      result.notify = true;
    } catch (e) { app.log.error({ err: e }, "interne Benachrichtigung fehlgeschlagen"); }
  }

  // 2b) Push-Benachrichtigung – best effort, blockiert die Antwort nicht.
  // Tap öffnet das Admin-Panel direkt bei dieser Bestellung.
  {
    const heading = isPress ? "Neue Presse-Prüfung" : "Neue Bestellung";
    const ptitle = `${heading} – ${company || name || email}`;
    const pbody = [company || name || email, [service, protection && protection !== "none" ? protection : ""].filter(Boolean).join(" + "), affiliate ? "Affiliate: " + affiliate : "", [email, phone].filter(Boolean).join(" · ")].filter(Boolean).join("\n");
    const adminUrl = SITE_URL + "/admin" + (orderId ? "?order=" + encodeURIComponent(orderId) : "");
    // Web-Push an die installierte Admin-App (öffnet die App selbst beim Tap)
    try {
      if (hasWebPush() && dbReady()) {
        const subs = await listPushSubscriptions();
        if (subs.length) {
          const expired = await sendWebPushAll(subs, { title: ptitle, body: pbody, url: adminUrl });
          for (const ep of expired) await deletePushSubscription(ep).catch(() => {});
        }
      }
    } catch (e) { app.log.error({ err: e }, "Web-Push fehlgeschlagen"); }
    // ntfy/Pushover (Fallback/zusätzlich, opt-in)
    try { await sendPush(ptitle, pbody, adminUrl); }
    catch (e) { app.log.error({ err: e }, "Push-Benachrichtigung fehlgeschlagen"); }
  }

  // 2c) FirstPromoter: Affiliate-Sale erfassen (best effort, blockiert die Antwort nie).
  // Nur echte (kostenpflichtige) Bestellungen – die kostenlose Presse-Prüfung nicht.
  // event_id = Bestell-Nr. → keine doppelten Provisionen. Provisionen erscheinen in
  // FirstPromoter zunächst als „ausstehend"; final freigeben, sobald der Kunde zahlt.
  if (!isPress && hasFirstPromoter()) {
    const fprTid = clip(b.fprTid, 200);
    const refId = affiliate || undefined; // Promoter-Code aus ?via= (= ref_id) sichern, bevor affiliate ggf. überschrieben wird
    // 1) Referral anlegen: Kunden-E-Mail dem Promoter zuweisen. OHNE diesen Schritt
    //    existiert in FirstPromoter kein Referral, dem ein Sale zugeordnet werden kann.
    if (refId || fprTid) {
      try {
        const sg = await trackSignup({ email, refId, tid: fprTid || undefined });
        if (sg.ok) {
          if (sg.promoter && !affiliate) affiliate = sg.promoter;
          app.log.info({ orderId, promoter: sg.promoter || "", fprRaw: sg.raw || "" }, "FirstPromoter Referral angelegt");
        } else if (!sg.skipped) app.log.warn({ orderId, fpr: sg }, "FirstPromoter Referral NICHT angelegt");
      } catch (e) { app.log.error({ err: e }, "FirstPromoter Signup fehlgeschlagen"); }
    }
    // 2) Sale auf das Referral buchen. Einmalbetrag (Leistung + Express + ggf.
    //    lebenslanger Schutz); laufende Monatsbeträge nicht (kein Zahlungs-Webhook).
    const saleTotal = Number(b.saleTotal) || ((Number(b.amount) || 0) + (protection === "lifetime" ? (Number(b.protAmount) || 0) : 0));
    if (saleTotal > 0) {
      try {
        const fr = await trackSale({
          email,
          eventId: orderId || ("RR-" + Math.floor(100000 + Math.random() * 899999)),
          amount: saleTotal,
          currency: clip(b.country, 6) === "US" ? "USD" : "EUR",
          tid: fprTid || undefined,
          refId,
        });
        if (fr.ok) {
          if (fr.promoter && !affiliate) affiliate = fr.promoter; // Promoter-Name aus FP-Antwort, falls Cookie-Code fehlte
          app.log.info({ orderId, saleTotal, promoter: fr.promoter || "", fprRaw: fr.raw || "" }, "FirstPromoter Sale erfasst");
        } else if (!fr.skipped) app.log.warn({ fpr: fr }, "FirstPromoter Sale nicht erfasst");
      } catch (e) { app.log.error({ err: e }, "FirstPromoter fehlgeschlagen"); }
    }
  }

  // 3) Bestellung in der Datenbank speichern (falls DATABASE_URL gesetzt)
  try {
    if (dbReady()) {
      const id = orderId || ("RR-" + Math.floor(100000 + Math.random() * 899999));
      const checkId = clip(b.checkId, 40);
      b.affiliate = affiliate; // aufgelösten Partner im raw-JSON mitspeichern → Admin zeigt ihn an
      await insertOrder({
        id, name, email, phone, company, lang, profile, service, protection,
        country: clip(b.country, 6) || "DE",
        category: clip(b.category, 120),
        rating: clip(b.rating, 12),
        reviews: Number(b.reviews) || 0,
        amount: Number(b.amount) || 0,
        protAmount: Number(b.protAmount) || 0,
        note, checkId, raw: b,
      });
      if (checkId) await linkCheck(checkId, id);
      await insertEvent({ orderId: id, type: "order", title: isPress ? "Presse-Prüfung angefragt" : "Bestellung eingegangen", detail: `${id} erstellt` });
      if (result.customer) await insertEvent({ orderId: id, type: "mail", title: isPress ? "Eingangsbestätigung Presse gesendet" : "Bestellbestätigung gesendet", detail: `an ${email}`, auto: true, html, subject: t.subject(props) });
      result.saved = true;
    }
  } catch (e) {
    app.log.error({ err: e }, "Bestellung speichern fehlgeschlagen");
    result.saveError = String((e as Error)?.message || e).slice(0, 200);
  }

  return result;
});

// Fragebogen-Antworten zur Bestellung speichern (öffentlich: Danke-Schritt ODER Mail-Link). Gedrosselt.
app.post("/order-form", async (req, reply) => {
  if (!allowCheck(req.ip)) return reply.code(429).send({ ok: false, error: "rate limited" });
  const b = (req.body || {}) as Record<string, unknown>;
  const id = clip(b.orderId, 40);
  if (!id) return reply.code(400).send({ ok: false, error: "orderId fehlt" });
  if (!dbReady()) return { ok: true, saved: false };
  const ans = (b.form && typeof b.form === "object") ? (b.form as Record<string, unknown>) : {};
  const form: Record<string, unknown> = { filledAt: new Date().toISOString() };
  for (const k of FORM_FIELDS) { const v = clip(ans[k], 6); if (v === "ja" || v === "nein") form[k] = v; }
  try {
    const ok = await setOrderForm(id, form);
    if (!ok) return reply.code(404).send({ ok: false, error: "Bestellung nicht gefunden" });
    await insertEvent({ orderId: id, type: "order", title: "Fragebogen ausgefüllt", detail: "vom Kunden ausgefüllt" });
    return { ok: true, saved: true };
  } catch (e) {
    app.log.error({ err: e }, "Fragebogen speichern fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: "Speichern fehlgeschlagen" });
  }
});

// Minimal-Infos für die öffentliche Fragebogen-Seite (Firmenname + ob schon ausgefüllt). Gedrosselt.
app.post("/order-form-info", async (req, reply) => {
  if (!allowCheck(req.ip)) return reply.code(429).send({ ok: false, error: "rate limited" });
  const b = (req.body || {}) as Record<string, unknown>;
  const id = clip(b.orderId, 40);
  if (!id) return reply.code(400).send({ ok: false, error: "orderId fehlt" });
  if (!dbReady()) return { ok: true, exists: false };
  const row = await getOrderBasic(id);
  if (!row) return { ok: true, exists: false };
  const f = (row.form || {}) as Record<string, unknown>;
  return { ok: true, exists: true, company: row.company || "", lang: row.lang || "de", filled: !!f.filledAt, form: f };
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

// FirstPromoter-Diagnose (im Browser aufrufbar): legt einen Test-Referral + Test-Sale an
// und gibt die ROHEN FirstPromoter-Antworten zurück, damit sofort sichtbar ist, ob die
// API die Calls akzeptiert (Status/Fehlertext). Aufruf z. B.:
//   /admin/fpr-test?token=<ADMIN_TOKEN>&email=test@example.com&ref=matthew
app.get("/admin/fpr-test", async (req, reply) => {
  const q = (req.query || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(q.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const email = String(q.email || "").trim();
  const refId = (String(q.ref || q.via || "").trim() || undefined) as string | undefined;
  const tid = (String(q.tid || "").trim() || undefined) as string | undefined;
  const amount = Number(q.amount) || 1;
  // Optional: Kandidaten-Key zum Testen direkt mitgeben (?key=…), ohne Railway-Env
  // neu zu deployen. Sonst wird der hinterlegte FPR_API_KEY benutzt.
  const key = (String(q.key || "").trim() || undefined) as string | undefined;
  // Optional v2: ?accountId=… → benutzt Bearer + Account-ID gegen die v2-API. Ohne → v1 (x-api-key).
  const accountId = (String(q.accountId || q.account || "").trim() || undefined) as string | undefined;
  if (!email) return reply.code(400).send({ ok: false, error: "Parameter email fehlt – z. B. ?email=test@example.com&ref=matthew" });
  const signup = await trackSignup({ email, refId, tid, key, accountId });
  const sale = await trackSale({ email, eventId: "TEST-" + Date.now(), amount, currency: "EUR", tid, refId, key, accountId });
  return { ok: true, configured: hasFirstPromoter(), api: accountId ? "v2" : "v1", keySource: key ? "query" : "env", input: { email, refId, tid, amount }, signup, sale };
});

// Öffentlicher VAPID-Public-Key – der Browser braucht ihn für die Push-Subscription.
app.get("/push/vapid", async () => ({ ok: hasWebPush(), publicKey: vapidPublicKey() }));

// Admin: Web-Push-Subscription der installierten App speichern (token-geschützt).
app.post("/admin/push-subscribe", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const sub = b.subscription as { endpoint?: string; keys?: { p256dh?: string; auth?: string } } | undefined;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return reply.code(400).send({ ok: false, error: "ungültige Subscription" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  try { await savePushSubscription(sub as { endpoint: string; keys: { p256dh: string; auth: string } }); return { ok: true }; }
  catch (e: unknown) { return reply.code(500).send({ ok: false, error: (e as Error)?.message || "Fehler" }); }
});

// Admin-Dashboard: SMS an die Kunden-Telefonnummer (ClickSend), token-geschützt.
app.post("/admin/send-sms", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = clip(b.to, 32);
  const message = clip(b.message, 612);
  const country = (clip(b.country, 2).toUpperCase() || undefined);
  if (!to || (to.replace(/[^0-9]/g, "").length < 6)) return reply.code(400).send({ ok: false, error: "ungültige Telefonnummer" });
  if (!message) return reply.code(400).send({ ok: false, error: "Nachricht fehlt" });
  if (!hasClickSend()) return reply.code(503).send({ ok: false, error: "SMS nicht konfiguriert (CLICKSEND_USERNAME/CLICKSEND_API_KEY im Backend setzen)" });
  try {
    const r = await sendSms(to, message, country);
    if (!r.ok) return reply.code(502).send({ ok: false, error: r.error || "SMS-Versand fehlgeschlagen" });
    const oid = clip(b.orderId, 40);
    if (oid) await insertEvent({ orderId: oid, type: "sms", title: "SMS gesendet", detail: "an " + to + " · " + message.slice(0, 100) });
    return { ok: true, status: r.status };
  } catch (e: any) {
    return reply.code(500).send({ ok: false, error: e?.message || "Fehler beim SMS-Versand" });
  }
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
    const oid = clip(b.orderId, 40);
    if (oid) await insertEvent({ orderId: oid, type: "mail", title: (clip(b.label, 80) || "E-Mail") + " gesendet", detail: "an " + to, html, subject });
    return { ok: true };
  } catch (e) {
    app.log.error({ err: e }, "admin/send fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: "send failed" });
  }
});

// Dedizierter Mail-Versand über das Helpdesk-Postfach (Microsoft Graph), gedacht
// fürs automatisierte/agentische Senden. Eigenes Token MAIL_TOKEN statt des
// allmächtigen ADMIN_TOKEN → eng begrenzte Berechtigung. Ohne gesetztes
// MAIL_TOKEN ist der Endpoint deaktiviert (opt-in).
//   POST /mail/send  { token, to, subject, text | html, cc?, from?, replyTo? }
app.post("/mail/send", async (req, reply) => {
  const MAIL_TOKEN = (process.env.MAIL_TOKEN || "").trim();
  if (!MAIL_TOKEN) return reply.code(503).send({ ok: false, error: "MAIL_TOKEN nicht gesetzt – Endpoint deaktiviert" });
  const b = (req.body || {}) as Record<string, unknown>;
  if (String(b.token || "") !== MAIL_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.to || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  const subject = String(b.subject || "").trim() || "RapidRemove";
  const cc = String(b.cc || "").split(/[,;\s]+/).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  const from = String(b.from || "").trim() || undefined;       // z. B. helpdesk@rapid-remove.com (Default: MAIL_FROM)
  const replyTo = String(b.replyTo || "").trim() || undefined;
  // Entweder fertiges HTML (b.html) ODER Plaintext (b.text) → ins Standard-Layout gehüllt.
  let html: string;
  if (typeof b.html === "string" && b.html.trim()) {
    html = b.html;
  } else {
    const safe = escapeHtml(String(b.text || "")).replace(/\n/g, "<br>");
    if (!safe) return reply.code(400).send({ ok: false, error: "text oder html fehlt" });
    html = `<div style="font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1c1916;max-width:560px"><div style="font-weight:800;color:#ff8000;font-size:18px;margin-bottom:14px">RapidRemove</div><div>${safe}</div></div>`;
  }
  try {
    const r = await sendMail({ to, subject, html, from, replyTo, cc: cc.length ? cc : undefined });
    return { ok: true, to, subject, status: r.status, requestId: r.requestId };
  } catch (e: any) {
    app.log.error({ err: e }, "mail/send fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: "send failed: " + (e?.message || "") });
  }
});

// Admin-Dashboard: Live-Daten (Bestellungen + Prüfungen) aus der DB
app.post("/admin/data", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const [orders, checks] = await Promise.all([listOrders(200), listChecks(200)]);
  return { ok: true, db: dbReady(), orders, checks };
});

// Live-Go: ALLE Test-Bestelldaten löschen (orders/checks/events/upsell_jobs).
// Push-Abos bleiben. Doppelt abgesichert: Admin-Token + Bestätigungswort.
app.post("/admin/reset-data", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (String(b.confirm || "") !== "ALLE-TESTDATEN-LOESCHEN") return reply.code(400).send({ ok: false, error: "Bestätigung fehlt: confirm muss 'ALLE-TESTDATEN-LOESCHEN' sein" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  try {
    const r = await wipeOrderData();
    app.log.warn({ wiped: r }, "Admin: Testdaten gelöscht (Live-Go)");
    return { ok: true, ...r };
  } catch (e) {
    return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin: Bestellung einem Bearbeiter zuweisen (max | matthias | null).
app.post("/admin/order-assign", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = String(b.orderId || "");
  const who = b.assignee == null || b.assignee === "" ? null : String(b.assignee);
  if (!id) return reply.code(400).send({ ok: false, error: "orderId fehlt" });
  if (who && !["max", "matthias"].includes(who)) return reply.code(400).send({ ok: false, error: "ungültige Zuweisung" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  try { const ok = await setOrderAssignee(id, who); return { ok, assignee: who }; }
  catch (e) { return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) }); }
});

// Admin: alle 301-Weiterleitungen auflisten (inkl. deaktivierte).
app.post("/admin/redirects", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!dbReady()) return { ok: true, db: false, redirects: [] };
  try { return { ok: true, db: true, redirects: await listRedirects() }; }
  catch (e) { return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) }); }
});

// Admin: Weiterleitung anlegen (ohne id) oder aktualisieren (mit id).
app.post("/admin/redirects/save", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const source = normRedirectSource(String(b.source || ""));
  const destination = normRedirectDest(String(b.destination || ""));
  if (source.length < 2) return reply.code(400).send({ ok: false, error: "Quelle (Pfad) fehlt." });
  if (!destination) return reply.code(400).send({ ok: false, error: "Ziel fehlt." });
  if (source === destination) return reply.code(400).send({ ok: false, error: "Quelle und Ziel sind identisch." });
  const code = Number(b.code) || 301;
  try {
    const redirect = await upsertRedirect({ id: b.id ? Number(b.id) : null, source, destination, code, enabled: b.enabled !== false });
    return { ok: true, redirect };
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/duplicate key|unique/i.test(msg)) return reply.code(409).send({ ok: false, error: "Diese Quelle ist bereits angelegt." });
    return reply.code(500).send({ ok: false, error: msg.slice(0, 240) });
  }
});

// Admin: Weiterleitung löschen.
app.post("/admin/redirects/delete", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  try { return { ok: await deleteRedirect(Number(b.id)) }; }
  catch (e) { return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) }); }
});

// Admin-Dashboard: Abos & Umsatz live aus Stripe (read-only). Stale-while-revalidate:
// Der gecachte Stand wird SOFORT zurückgegeben, die Auffrischung läuft im Hintergrund —
// so wartet das Dashboard nie auf die (mehrere Sekunden langen) Stripe-Abrufe.
let stripeCache: { ts: number; data: unknown } | null = null;
let stripeInFlight: Promise<void> | null = null;
function refreshStripeCache(): Promise<void> {
  if (stripeInFlight) return stripeInFlight;
  stripeInFlight = (async () => {
    try { stripeCache = { ts: Date.now(), data: await getStripeMetrics() }; }
    catch (e) { app.log.error({ err: e }, "Stripe-Kennzahlen-Refresh fehlgeschlagen"); }
    finally { stripeInFlight = null; }
  })();
  return stripeInFlight;
}
// Cache beim Start vorwärmen → der erste Dashboard-Aufruf ist sofort da.
if (hasSecretKey()) refreshStripeCache();

app.post("/admin/stripe", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!hasSecretKey()) return { ok: true, connected: false, error: "STRIPE_SECRET_KEY nicht gesetzt" };
  const STALE = 300_000; // 5 Min
  if (stripeCache) {
    const stale = Date.now() - stripeCache.ts > STALE;
    if (stale) refreshStripeCache().catch(() => {}); // im Hintergrund auffrischen, nicht blockieren
    return { ok: true, connected: true, ...(stale ? { stale: true } : {}), ...(stripeCache.data as Record<string, unknown>) };
  }
  // Kaltstart (noch kein Cache): auf den – evtl. schon laufenden – ersten Abruf warten.
  try {
    await refreshStripeCache();
    const cached = stripeCache as { ts: number; data: unknown } | null;
    if (cached) return { ok: true, connected: true, ...(cached.data as Record<string, unknown>) };
    return { ok: true, connected: false, error: "Stripe-Daten konnten nicht geladen werden" };
  } catch (e) {
    return reply.code(200).send({ ok: true, connected: false, error: String((e as Error)?.message || e).slice(0, 240) });
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

// Admin-Dashboard: alle AKTIVEN Stripe-Zahlungslinks auflisten (read-only).
// Liefert je Link die Positionen (Betrag/Währung/Intervall) – das Dashboard baut daraus die Auswahl.
app.post("/admin/paylinks", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!hasSecretKey()) return { ok: true, links: [], error: "STRIPE_SECRET_KEY nicht gesetzt" };
  try {
    const links = await listPaymentLinks();
    return { ok: true, links: links.map((l) => ({ id: l.id, url: l.url, items: l.items })) };
  } catch (e) {
    app.log.error({ err: e }, "Payment-Links lesen fehlgeschlagen");
    return { ok: true, links: [], error: String((e as Error)?.message || e).slice(0, 200) };
  }
});

// Admin-Dashboard: Express-Zahlungslinks anlegen (alle Kombinationen). apply=false → Trockenlauf.
app.post("/admin/setup-express", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!hasSecretKey()) return reply.code(400).send({ ok: false, error: "STRIPE_SECRET_KEY nicht gesetzt" });
  const apply = b.apply === true || b.apply === "true";
  try {
    const report = await runExpressSetup({ apply });
    return { ok: true, ...report };
  } catch (e) {
    app.log.error({ err: e }, "Express-Setup fehlgeschlagen");
    return reply.code(400).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 300) });
  }
});

// Löst den passenden Stripe-Zahlungslink für eine Bestellung auf (ohne Versand):
// 0) direkt gewählter aktiver Link, 1) hinterlegter Link, 2) Betrag-Match. KEIN Erstellen in Stripe.
async function resolvePayLink(b: Record<string, unknown>): Promise<{ url?: string; available?: string[]; error?: string; code?: number }> {
  const service = clip(b.service, 40);
  const protection = clip(b.protection, 20) || "none";
  const currency = (clip(b.currency, 8) || "eur").toLowerCase();
  const express = b.express === true || b.express === "true" || b.express === 1 || b.express === "1";
  const chosenUrl = clip(b.url, 300);
  let url: string | undefined;
  let available: string[] = [];
  if (chosenUrl) {
    if (!hasSecretKey()) return { code: 400, error: "STRIPE_SECRET_KEY nicht gesetzt" };
    try { const links = await listPaymentLinks(); if (links.some((l) => l.url === chosenUrl)) url = chosenUrl; }
    catch (e) { app.log.error({ err: e }, "Link-Validierung fehlgeschlagen"); }
    if (!url) return { code: 400, error: "Unbekannter oder inaktiver Zahlungslink." };
  }
  if (!url) url = payLinkFor(service, protection, currency, express);
  if (!url) {
    if (!hasSecretKey()) return { code: 400, error: "STRIPE_SECRET_KEY nicht gesetzt" };
    const serviceAmount = Number(b.serviceAmount) || 0;
    const protAmount = Number(b.protAmount) || 0;
    const protType = clip(b.protType, 20);
    const items: { amount: number; interval: string }[] = [];
    if (serviceAmount > 0) items.push({ amount: Math.round(serviceAmount * 100), interval: "once" });
    if (protAmount > 0) items.push({ amount: Math.round(protAmount * 100), interval: protType === "monthly" || protType === "monitor" ? "month" : "once" });
    try { const m = await matchPaymentLink(items); url = m.url; available = m.available; }
    catch (e) { app.log.error({ err: e }, "Payment-Link-Suche fehlgeschlagen"); }
  }
  if (!url) return { code: 400, error: `Kein passender Stripe-Zahlungslink gefunden (${service}|${protection}|${currency}).`, available };
  return { url, available };
}

// Admin-Dashboard: Zahlungslink nur AUFLÖSEN (für SMS-Vorlage) – ohne Versand.
app.post("/admin/paylink-url", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const r = await resolvePayLink(b);
  if (!r.url) return reply.code(r.code || 400).send({ ok: false, error: r.error, available: r.available });
  return { ok: true, url: r.url };
});

// Admin-Dashboard: echten Stripe-Zahlungslink erstellen + dem Kunden mailen
app.post("/admin/paylink", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  const service = clip(b.service, 40);
  const protection = clip(b.protection, 20) || "none";
  const currency = (clip(b.currency, 8) || "eur").toLowerCase();
  const express = b.express === true || b.express === "true" || b.express === 1 || b.express === "1";
  const r = await resolvePayLink(b);
  if (!r.url) return reply.code(r.code || 400).send({ ok: false, error: r.error, available: r.available });
  const url = r.url;
  const orderId = clip(b.orderId, 40);
  const total = Number(b.total) || 0;
  try {
    const tplKey = clip(b.template, 40) || "zahlungslink";
    const t = TEMPLATES[tplKey] || TEMPLATES["zahlungslink"];
    const money = currency === "usd"
      ? `$ ${total.toLocaleString("en-US")}`
      : `${total.toLocaleString("de-DE", { minimumFractionDigits: total % 1 ? 2 : 0 })} €`;
    const tlang = mailLang(b.lang);
    const due = tplKey === "mahnung" ? (DUE_MAHN[tlang] || DUE_MAHN.en) : (DUE_NOW[tlang] || DUE_NOW.en);
    const props = { lang: tlang, total: money, due, payUrl: url, protectionLabel: clip(b.protectionLabel, 160) || undefined, expressLabel: clip(b.expressLabel, 160) || undefined };
    const html = await render(React.createElement(t.component, props as any));
    await sendMail({ to, subject: t.subject(props as any), html, replyTo: process.env.MAIL_REPLY_TO });
    const title = tplKey === "mahnung" ? "Mahnung gesendet" : "Zahlungslink gesendet";
    if (orderId) await insertEvent({ orderId, type: "pay", title, detail: `${money} · ${service}${express ? "+express" : ""}|${protection} · an ${to}`, html, subject: t.subject(props as any) });
    return { ok: true, url };
  } catch (e) {
    app.log.error({ err: e }, "Zahlungslink-Mail fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin-Dashboard: eine echte (gebrandete) Vorlage an den Kunden senden
app.post("/admin/send-template", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.to || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  const t = TEMPLATES[clip(b.key, 60)];
  if (!t) return reply.code(400).send({ ok: false, error: "unknown template" });
  const orderId = clip(b.orderId, 40);
  try {
    const tlang = mailLang(b.lang);
    const props = { ...(t.sample as object), lang: tlang, formUrl: orderId ? SITE_URL + "/auftrag/" + orderId : undefined };
    const html = await render(React.createElement(t.component, props as any));
    await sendMail({ to, subject: t.subject(props as any), html, replyTo: process.env.MAIL_REPLY_TO });
    if (orderId) await insertEvent({ orderId, type: "mail", title: t.label + " gesendet", detail: "an " + to, html, subject: t.subject(props as any) });
    return { ok: true };
  } catch (e) {
    app.log.error({ err: e }, "send-template fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
  }
});

// Admin-Dashboard: Aktivitäts-Verlauf einer Bestellung
app.post("/admin/events", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const email = clip(b.email, 160);
  const events = email ? await listEventsByEmail(email, 100) : await listEvents(clip(b.orderId, 40), 100);
  return { ok: true, events };
});

// Admin-Dashboard: die EXAKT versendete Mail (1:1 gespeichertes HTML + Betreff) zu einem Aktivitäts-Eintrag.
app.post("/admin/email", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = String((b.id as string | number) ?? "").trim();
  if (!/^\d+$/.test(id)) return reply.code(400).send({ ok: false, error: "id erforderlich" });
  const mail = await getEventEmail(id);
  if (!mail) return { ok: false, error: "Für diesen Eintrag wurde keine 1:1-Kopie gespeichert (nur Mails ab diesem Update)." };
  return { ok: true, ...mail };
});

// Admin-Dashboard: Bestell-Status dauerhaft setzen (+ Aktivitäts-Eintrag).
// Bleibt bestehen, bis er erneut geändert wird (z. B. Storno → „storniert“,
// Reaktivierung → „progress“, Pipeline-Klicks).
app.post("/admin/order-status", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = clip(b.orderId, 40);
  const status = clip(b.status, 40);
  const pay = clip(b.pay, 20) || undefined;
  if (!id || !status) return reply.code(400).send({ ok: false, error: "orderId und status erforderlich" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const ok = await updateOrderStatus(id, status, pay);
  if (!ok) return reply.code(404).send({ ok: false, error: "Bestellung nicht gefunden" });
  const label = clip(b.label, 80) || status;
  await insertEvent({ orderId: id, type: "status", title: `Status → ${label}`, detail: pay ? `Zahlung: ${pay} · im Dashboard gesetzt` : "im Dashboard gesetzt" });
  return { ok: true };
});

const port = Number(process.env.PORT) || 3000;
async function start() {
  try { await initDb(); if (dbReady()) app.log.info("DB verbunden, Tabellen bereit"); }
  catch (e) { app.log.error({ err: e }, "DB-Init fehlgeschlagen – Backend läuft ohne DB weiter"); }
  try {
    const addr = await app.listen({ host: "0.0.0.0", port });
    app.log.info(`ops läuft auf ${addr}`);
    startUpsellWorker(app);
  } catch (err) { app.log.error(err); process.exit(1); }
}
start();
