import crypto from "node:crypto";
/* Vorschau-/Test-Server: zeigt alle Templates im Browser und kann
   Test-Mails per Link versenden. Auf Railway: Start-Command "npm start". */
import "dotenv/config";
import Fastify from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";
import stripeWebhook from "./webhooks/stripe";
import { initDb, dbReady, insertOrder, upsertCheck, linkCheck, listOrders, listChecks, dbCounts, insertEvent, listEvents, listEventsByEmail, getEventEmail, updateOrderStatus, correctOrderPayment, markOrderPaidById, setOrderForm, setOrderAssignee, getOrderBasic, savePushSubscription, listPushSubscriptions, deletePushSubscription, wipeOrderData, wipeChecks, listRedirects, listEnabledRedirects, upsertRedirect, deleteRedirect, deletionsForGamification, reviewsForGamification, getTemplateOverrides, saveTemplateOverride, setCheckEmail, markCheckEnriched, markCheckRueckgewinnung, setOrderRawField, reportStats, changeVersion } from "./db";
import { renderTemplate, editableFields } from "./renderTemplate";
import { normalizeWebsite, scanWebsiteEmails, pickBestEmail, startLeadEnrichWorker } from "./leadEnrich";
import { buildBoard, buildReviewsBoard, personStats, rankInfo, PEOPLE, DELETION_SERVICES, type Assignee } from "./gamification";
import { hasSecretKey, getStripeMetrics, matchPaymentLink, listPaymentLinks } from "./integrations/stripe";
import { hasClickSend, sendSms } from "./integrations/clicksend";
import { hasFirstPromoter, trackSale, trackSignup } from "./integrations/firstpromoter";
import { sendPush } from "./integrations/push";
import { hasWebPush, vapidPublicKey, sendWebPushAll } from "./integrations/webpush";
import { payLinkFor, reviewsLinkFor } from "./paymentLinks";
import { runExpressSetup } from "./expressSetup";
import { runReviewsSetup, ensureReviewsLink, ensureReviewsAmountLink, upgradeReviewLinks, linkUpgrade, enableInvoicesAllLinks, invoiceUpgrade } from "./reviewsSetup";
import { quoteReviews, fmtReviewMoney, chatPctOf, reviewMethod, cpOf } from "./reviewsPricing";
import { CHAT_INTERNAL } from "./chat/chat";
import { startOrderIfReady } from "./orderStart";
import { registerVerifyRoutes, needsVerify } from "./verify";
import { registerOrderAddRoutes, registerPriceEditRoute } from "./orderAdd";
import { startPgRemindWorker, pgNextFor } from "./pgRemind";
import { registerAutopayRoutes, payGateNeeded, retryTick, autopayAvailable, hasSavedMethod, chargeProfileOrder } from "./autopay";
import { dueDateText } from "./emails/dueText";
import { payoutTick } from "./payouts";
import { initPartnerRegistry } from "./partnerRegistry";
import { initPartnerTables, registerPartnerRoutes, partnerAutoSend, partnerAutoSendProfile, partnerAutoEnabled, partnerOrderStatus, payDiscountEnabled } from "./partner";
import { registerPartnerBackfill, runRv60BackfillOnce } from "./partnerBackfill";
import { initPartnerAuth, registerPartnerAuth, seedPartnerAccount } from "./partnerAuth";
import { initPartnerPush, startPartnerReminders } from "./partnerNotify";
import { initPasskeys, registerPasskeyRoutes } from "./passkeys";
import { createAutologin, customerSessionInfo, initCustomerTables, registerCustomerRoutes, registerCustomerAdminRoutes, ensureCustomerAccount, addOrderPayment, DASH_URL, takeDueNotifications, requeueNotify, markPayRequested, payRequestGuard, pollReviewPayments, payHoldSweep, dashLink, newPayId, withRef, keyOf, markOrderReviewsPaidManual, loadCustomerOrders } from "./customers";
import { registerCustChat, registerSiteChat, linkSiteChat } from "./chat/chat";
import { wiseAccounts, wiseBankFor } from "./wiseAccounts";
import { isTestEmail } from "./testAccounts";
import ZahlungErhaltenReviews, { zahlungErhaltenSubject } from "./emails/ZahlungErhaltenReviews";
import { notifyTeam } from "./notify";
import { startFollowupWorker, registerFollowupRoutes, quietOk, tzOf, followupNextFor, nextDaytime } from "./followup";
import KundenUpdateReviews, { kundenUpdateSubject } from "./emails/KundenUpdateReviews";
import KundenSoftwareReviews, { kundenSoftwareSubject } from "./emails/KundenSoftwareReviews";
import KundenSoftwarePayReviews, { kundenSoftwarePaySubject } from "./emails/KundenSoftwarePayReviews";
import { initCustPush, registerCustPushRoutes } from "./custPush";
import { resetLinkMail } from "./emails/ResetLinkMail";
import DashInvite, { dashInviteSubject } from "./emails/DashInvite";
import { startUpsellWorker, scheduleProtectionUpsell } from "./upsell";
import { serpKey, fetchPlaceReviews, findPlaceReview, serpUsage } from "./reviewsFetch";
import { initPartnerStats, registerPartnerStats } from "./partnerStats";
import { registerMonitor, startMonitorScheduler, monitorKeys, resolveReviewLink } from "./monitor";
import { registerCustTrack } from "./custTrack";
import { shotKey, queueOrderShots, retakeShots, listShots, getShot, shotsRunning, backfillReviewShots, backfillActive } from "./reviewShots";
import { reconcilePaymentsOnce, startPaymentReconciler } from "./reconcile";
import { sendEvent as capiSend, capiEnabled, sendPurchaseForOrder } from "./integrations/metaCapi";
import { claimCapiSend, releaseCapiSend, pool } from "./db";



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

// Schutz gegen Durchprobieren von Admin-Token / Logins: zu viele abgelehnte Anfragen (401/403) je IP → 15 Min. gesperrt.
const authFails = new Map<string, number[]>();
const AUTH_LIMIT = 25;
const isAuthPath = (u: string) => /^\/(admin|partner|cust)\//.test(u);
app.addHook("onRequest", async (req, reply) => {
  if (!isAuthPath(req.url)) return;
  const a = (authFails.get(req.ip) || []).filter((t) => Date.now() - t < 15 * 60_000);
  authFails.set(req.ip, a);
  if (a.length >= AUTH_LIMIT) return reply.code(429).send({ ok: false, error: "too_many" });
});
app.addHook("onResponse", async (req, reply) => {
  if (!isAuthPath(req.url) || (reply.statusCode !== 401 && reply.statusCode !== 403)) return;
  const a = authFails.get(req.ip) || []; a.push(Date.now()); authFails.set(req.ip, a.slice(-100));
  if (a.length === AUTH_LIMIT) app.log.warn({ ip: req.ip, url: req.url.split("?")[0] }, "Zu viele abgelehnte Zugriffe – IP 15 Min. gesperrt");
});

// Live-Aktualisierung: Kunden-App, Admin und Partner-Board fragen alle paar Sekunden, ob sich etwas geändert hat (nur ein Zähler, keine Daten).
app.get("/ping", async (_req, reply) => { reply.header("Cache-Control", "no-store"); return { v: changeVersion() }; });

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
/** Nur http/https-URLs durchlassen (blockt javascript:/data: – XSS-Schutz, da Links
 *  aus der öffentlichen /check-Route später im Admin als <a href> gerendert werden). */
const httpUrl = (v: unknown, n: number): string => {
  const s = clip(v, n);
  if (!s) return "";
  try { return /^https?:$/.test(new URL(s).protocol) ? s : ""; } catch { return ""; }
};

/** „GLÖSCHT"-Hype-Push fürs Team (Web-Push an die installierte App + ntfy/Pushover),
 *  inkl. Gamification-Rang der zugewiesenen Person. Wird beim Zahlungslink-Versand UND
 *  beim PayPal-Angebot ausgelöst – beide bedeuten „Profil gelöscht, Zahlung angestoßen".
 *  Best effort: Fehler kippen den Aufrufer nicht. */
async function fireDeletionHypePush(orderId: string, name: string, to: string): Promise<void> {
  try {
    let assignee: string | null = null, company: string | null = null, oStatus: string | null = null, oService: string | null = null;
    if (orderId && dbReady()) {
      const ob = await getOrderBasic(orderId);
      assignee = ob?.assignee || null;
      company = ob?.company || null;
      oStatus = ob?.status || null;
      oService = ob?.service || null;
    }
    const isPerson = assignee === "max" || assignee === "matthias";
    const who = isPerson ? PEOPLE[assignee as Assignee].name : "Das Team";
    const kunde = company || clip(name, 80) || to;
    // Gamification: Lösch-Counter + Rang (diese Löschung mitgezählt, falls der Auftrag noch
    // nicht auf "done" steht – der Frontend-Statuswechsel passiert erst nach diesem Aufruf).
    let rankLine = "", levelUpLine = "";
    if (isPerson && dbReady()) {
      const base = personStats(assignee as Assignee, await deletionsForGamification()).count;
      const counts = oService ? DELETION_SERVICES.has(oService) : true;
      const n = base + (counts && oStatus !== "done" ? 1 : 0);
      const ri = rankInfo(n);
      rankLine = ` · #${n} · ${ri.rank.emoji} ${ri.rank.name}`;
      if (n > 0 && ri.rank.key !== rankInfo(n - 1).rank.key) levelUpLine = `\n🏆 Neuer Rang: ${ri.rank.name}!`;
    }
    // Uber-Stil: Titel = was passiert ist, Body = wer · Rang.
    const ptitle = `Gelöscht ✓ ${kunde ? "· " + kunde : ""}`.trim();
    const pbody = `Von ${who}${rankLine}${levelUpLine}`;
    const adminUrl = SITE_URL + "/admin" + (orderId ? "?order=" + encodeURIComponent(orderId) : "");
    if (hasWebPush() && dbReady()) {
      const subs = await listPushSubscriptions();
      if (subs.length) {
        const expired = await sendWebPushAll(subs, { title: ptitle, body: pbody, url: adminUrl, tag: "rr-del-" + (orderId || Date.now()), kind: "removed" });
        for (const ep of expired) await deletePushSubscription(ep).catch(() => {});
      }
    }
    await sendPush(ptitle, pbody, adminUrl);
  } catch (e) { app.log.error({ err: e }, "Hype-Push fehlgeschlagen"); }
}

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
// Partner-Board (Übergabe einzelner Bewertungen an den Lösch-Partner, geheimer Link).
registerPartnerRoutes(app, ADMIN_TOKEN);
registerVerifyRoutes(app, ADMIN_TOKEN); // Inhaber-Nachweis bei 4–5-Sterne-Bewertungen (KI-Prüfung)
registerAutopayRoutes(app); // Automatisch bezahlen (hinterlegte Zahlungsart) – Test-Konten: STRIPE_TEST_SECRET_KEY, live nur mit AUTOPAY_LIVE=on
registerOrderAddRoutes(app, ADMIN_TOKEN); registerPriceEditRoute(app, ADMIN_TOKEN); // Preise eines Auftrags nachträglich anpassen // Nachbestellung: Bewertungen zu bestehendem Auftrag (Admin + Kunde im Dashboard)
registerPartnerStats(app, (b) => !!ADMIN_TOKEN && String(b.token || "") === ADMIN_TOKEN);
registerPartnerBackfill(app, ADMIN_TOKEN); // einmalig: 60 USD (WhatsApp, vor dem Board) nachtragen
registerPasskeyRoutes(app); // Face ID / Touch ID (Passkeys) für Kunden + Partner
registerPartnerAuth(app, ADMIN_TOKEN); // Partner-Login (E-Mail + Passwort), Admin sieht/setzt Zugangsdaten
// Kunden-Dashboard (nur Einzelbewertungen): Login, Status, Zahlungen.
registerCustPushRoutes(app);
registerCustomerAdminRoutes(app, ADMIN_TOKEN, {
  sendInvite: async (email, name, url, lang) => {
    await sendMail({ to: email, subject: dashInviteSubject(lang), html: await render(React.createElement(DashInvite, { lang, name, url })), replyTo: process.env.MAIL_REPLY_TO });
  },
});
registerCustomerRoutes(app, {
  sendResetLink: async (email, url, lang) => {
    const m = resetLinkMail(lang, url);
    await sendMail({ to: email, subject: m.subject, html: await render(m.el), replyTo: process.env.MAIL_REPLY_TO });
  },
});

// Dashboard-Aktivität: Tracking aus dem Kunden-Dashboard, Zählpixel, Admin-Timeline.
registerCustTrack(app, { sessionInfo: customerSessionInfo, adminOk: (t) => !!ADMIN_TOKEN && String(t || "") === ADMIN_TOKEN });
// Support-Chatbot im Kunden-Dashboard (Claude API, Fallback ohne Schlüssel) + Team-Anfrage per Mail.
registerCustChat(app, {
  sessionInfo: customerSessionInfo,
  loadOrders: (email) => loadCustomerOrders(email) as unknown as Promise<{ name: string; lang: string; orders: Record<string, unknown>[] }>,
  sendMail: (a) => sendMail(a),
  adminOk: (t) => !!ADMIN_TOKEN && String(t || "") === ADMIN_TOKEN,
});
registerSiteChat(app, (t) => !!ADMIN_TOKEN && String(t || "") === ADMIN_TOKEN); // Website-Chat (öffentlich) → Tidio bei Team-Wunsch
// Automatisches Nachfassen (Zahlung · Software · nie eingeloggt · Neuigkeiten) + Admin-Liste „Nachfassen".
registerFollowupRoutes(app, (t) => !!ADMIN_TOKEN && String(t || "") === ADMIN_TOKEN);

app.get("/health", async () => {
  let orders = 0, checks = 0, dbError = "";
  try { const c = await dbCounts(); orders = c.orders; checks = c.checks; }
  catch (e) { dbError = String((e as Error)?.message || e).slice(0, 160); }
  return { ok: true, db: dbReady(), stripe: hasSecretKey(), sms: hasClickSend(), firstPromoter: hasFirstPromoter(), serpapi: !!serpKey(), serpUsage: serpUsage(), screenshots: !!shotKey(), googleMaps: !!(process.env.GOOGLE_MAPS_API_KEY || "").trim(), wiseBank: wiseAccounts().length, monitor: monitorKeys(), payLinks: linkUpgrade, invoiceLinks: invoiceUpgrade, orders, checks, ...(dbError ? { dbError } : {}) };
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
  const { lang, variant, service } = req.query as { lang?: string; variant?: string; service?: string };
  const t = TEMPLATES[key];
  if (!t) return reply.code(404).type("text/html").send("Unbekanntes Template");
  const props = { ...t.sample, ...(lang ? { lang } : {}), ...(variant ? { variant: Number(variant) } : {}), ...(service ? { service } : {}) };
  const { html } = await renderTemplate(key, props);
  return reply.type("text/html").send(html);
});

// Test-Versand per Link (mit ADMIN_TOKEN geschützt)
app.get("/send-test", async (req, reply) => {
  const { key = "auftragsbestaetigung", to, token, lang, variant, service } = req.query as Record<string, string>;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return reply.code(401).send("unauthorized");
  const t = TEMPLATES[key];
  if (!t || !to) return reply.code(400).send("Parameter fehlen: key, to");
  const props = { ...t.sample, ...(lang ? { lang } : {}), ...(variant ? { variant: Number(variant) } : {}), ...(service ? { service } : {}) };
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
  // Bewertungs-Produkt: Bestellung „Einzelne Bewertungen löschen" (nur außerhalb
  // DACH). Bekommt eine EIGENE Auftragsbestätigung, weil die die Abrechnungs-
  // regeln festhält (nur gelöschte Bewertungen zahlen, fällig am Löschtag).
  const isReviews = service === "reviews";
  // Je Bewertung entweder der Teilen-Link ODER Name + Bewertungstext (Alternative,
  // wenn der Kunde den Link nicht findet). Beides wird bereinigt gespeichert.
  type ReviewItem = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean; rating?: number; days?: number };
  const reviewItems: ReviewItem[] = Array.isArray(b.reviewItems)
    ? (b.reviewItems as unknown[]).slice(0, 40).map((raw) => {
        const o = (raw || {}) as Record<string, unknown>;
        const url = httpUrl(o.url, 400);
        const nm = clip(o.name, 80);
        const tx = clip(o.text, 400);
        // nt = reine Sternebewertung ohne Text → Spezialverfahren (Festpreis, Vorauszahlung, kein Altersaufschlag)
        const flags = o.nt === true ? { nt: true } : o.old === true ? { old: true } : {}; // old: älter als 4 Wochen → Aufpreis
        // Für die Partner-Statistik: Sterne + Alter (aus der Google-Suche im Wizard, sonst leer)
        const rt = Math.round(Number(o.rating)); const dy = Math.round(Number(o.days));
        Object.assign(flags, rt >= 1 && rt <= 5 ? { rating: rt } : {}, Number.isFinite(dy) && dy >= 0 && dy < 20000 ? { days: dy } : {});
        if (url) return { url, ...(nm ? { name: nm } : {}), ...(tx ? { text: tx } : {}), ...flags } as ReviewItem;
        if (nm && tx) return { name: nm, text: tx, ...flags } as ReviewItem;
        return null;
      }).filter(Boolean) as ReviewItem[]
    : Array.isArray(b.reviewUrls)
      ? ((b.reviewUrls as unknown[]).map((u) => httpUrl(u, 400)).filter(Boolean).slice(0, 40) as string[]).map((u) => ({ url: u }))
      : [];
  // Doppelte Beauftragung erkennen (Einzelbewertungen): gleiche Bestell-Nr. (Doppelklick/Retry) → nichts erneut senden;
  // dieselbe Bewertung schon in einem offenen Auftrag (gleiche E-Mail oder gleiches Profil, 120 Tage) → herausnehmen;
  // sind ALLE Bewertungen schon beauftragt → keine neue Bestellung, Wizard zeigt „bereits beauftragt".
  let dupSkipped: { name: string; orderId: string }[] = [];
  if (isReviews && pool && reviewItems.length) {
    try {
      if (orderId) {
        const ex = await pool.query(`SELECT id FROM orders WHERE id=$1`, [orderId]);
        if (ex.rows[0]) return { ok: true, duplicate: true, orderId };
      }
      const normU = (u?: string) => String(u || "").trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "");
      const normT = (t?: string) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();
      const prev = await pool.query(
        `SELECT id, raw->'reviewItems' AS items FROM orders
          WHERE service='reviews' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '120 days'
            AND (lower(email)=lower($1) OR ($2 <> '' AND lower(COALESCE(profile,''))=lower($2)))`,
        [email, profile || ""],
      );
      const seen: { u: string; nt: string; oid: string }[] = [];
      for (const r of prev.rows) for (const it of (Array.isArray(r.items) ? r.items : []) as ReviewItem[]) {
        seen.push({ u: normU(it.url), nt: it.name && it.text ? normT(it.name) + "|" + normT(it.text).slice(0, 80) : "", oid: r.id });
      }
      const hitOf = (it: ReviewItem) => seen.find((x) => (it.url && x.u && x.u === normU(it.url)) || (it.name && it.text && x.nt && x.nt === normT(it.name) + "|" + normT(it.text).slice(0, 80)));
      const keep: ReviewItem[] = [];
      for (const it of reviewItems) { const h = hitOf(it); if (h) dupSkipped.push({ name: it.name || it.url || "", orderId: h.oid }); else keep.push(it); }
      if (dupSkipped.length && !keep.length) {
        app.log.warn({ email, orderId, dup: dupSkipped }, "Bestellung: alle Bewertungen bereits beauftragt – keine neue Bestellung");
        return { ok: false, error: "already_ordered", orders: [...new Set(dupSkipped.map((d) => d.orderId))], items: dupSkipped.map((d) => d.name) };
      }
      if (dupSkipped.length) { reviewItems.splice(0, reviewItems.length, ...keep); app.log.warn({ email, orderId, dup: dupSkipped }, "Bestellung: doppelte Bewertungen entfernt"); }
    } catch (e) { app.log.error({ err: e }, "Doppel-Prüfung fehlgeschlagen – Bestellung läuft normal weiter"); dupSkipped = []; }
  }
  // Verfahren je Bewertung (Partner-Regel): Software-Fälle (ohne Text; älter als 4 Wochen mit Text aus den USA) kosten 300
  // und werden VOR dem Start bezahlt – aber erst, wenn der Partner bestätigt, dass Software verfügbar ist (keine Zahlung bei der Bestellung).
  // Land = Land des Google-Profils (aus der Adresse), nicht die Website-Sprache.
  const pcRaw = String(b.profileCountry || "").trim().toUpperCase();
  const ruleCountry = /^[A-Z]{2}$/.test(pcRaw) ? pcRaw : "";
  (b as Record<string, unknown>).profileCountry = ruleCountry || undefined;
  // Bewertungs-Produkt: Währung + Land des Auftrags = Land des Profils (US-Profil → $, sonst €), nicht die Website-Sprache.
  if (isReviews && ruleCountry) (b as Record<string, unknown>).country = ruleCountry;
  // 4–5-Sterne-Bewertungen beauftragt → erst Inhaber-Nachweis (Dashboard-Upload, KI prüft), dann normaler Ablauf.
  // Nur die 4–5-Sterne-Bewertungen warten auf den Nachweis (verify.keys); die übrigen starten nach der Zahlungsart sofort.
  // Einmal pro Profil: hat derselbe Kunde (E-Mail) für dasselbe Profil schon einen freigegebenen Nachweis, gilt der weiter.
  let verifyNeeded = isReviews && needsVerify(reviewItems);
  if (verifyNeeded) {
    const vKeys = reviewItems.filter((it) => Number(it.rating) >= 4).map((it) => it.url || `${it.name || ""}|${it.text || ""}`);
    let reuse: string | null = null;
    if (email && dbReady() && pool) {
      const pid = clip(b.placeId, 200), pname = clip(b.placeName, 200).toLowerCase(), prof = profile.toLowerCase();
      const rr = await pool.query(
        `SELECT id FROM orders WHERE lower(email)=lower($1) AND service='reviews' AND raw->'verify'->>'status'='ok'
           AND (($2<>'' AND raw->>'placeId'=$2) OR ($3<>'' AND lower(COALESCE(raw->>'placeName',''))=$3) OR ($4<>'' AND lower(COALESCE(profile,''))=$4))
         ORDER BY created_at DESC LIMIT 1`, [email, pid, pname, prof]).catch(() => ({ rows: [] as { id: string }[] }));
      reuse = rr.rows[0]?.id || null;
    }
    (b as Record<string, unknown>).verify = reuse
      ? { status: "ok", by: "reuse", from: reuse, keys: vKeys, at: new Date().toISOString() }
      : { status: "pending", keys: vKeys, at: new Date().toISOString() };
    if (reuse) verifyNeeded = false;
  }
  // Zahlungsart hinterlegen („Automatisch bezahlen"): Auftrag startet erst, wenn sie im Dashboard hinterlegt ist.
  // Nur wo freigeschaltet (Test-Konten / AUTOPAY_LIVE=on), nicht bei Wise-/PayPal-Zahlern, nicht wenn schon hinterlegt.
  // PayPal/Wise −10 % in den Einstellungen für diese Kategorie aus → Wunsch ignorieren (normale Zahlung).
  if (["wise", "paypal"].includes(String(b.payPref || "")) && !(await payDiscountEnabled(isReviews ? "reviews" : "profiles").catch(() => true))) (b as Record<string, unknown>).payPref = "none";
  const payGate = isReviews && !["wise", "paypal"].includes(String(b.payPref || "")) && email ? await payGateNeeded(email).catch(() => false) : false;
  if (payGate) (b as Record<string, unknown>).payGate = { status: "pending", at: new Date().toISOString() };
  // Zusicherung des Kunden: „Bewertungen verstoßen nach bestem Wissen gegen die Google-Richtlinien" (Checkbox im Bestellprozess).
  // Nachweis beim Auftrag: Zeitpunkt, IP, Gerät, Sprache, Textversion. Fehlt sie (z. B. alter Browser-Stand), wird das vermerkt.
  if (isReviews) {
    const ipC = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    (b as Record<string, unknown>).policyConsent = b.policyConsent === true
      ? { at: new Date().toISOString(), ip: ipC.slice(0, 60), ua: clip(req.headers["user-agent"], 240), lang: clip(b.lang, 5), v: clip(b.policyV, 20) || "2026-10-09", n: reviewItems.length, via: req.headers["x-rr-chat"] === CHAT_INTERNAL ? "chat" : "web" }
      : null;
    if (b.policyConsent == null) app.log.warn({ orderId, email }, "Bestellung ohne Richtlinien-Bestätigung (alter Browser-Stand?)");
  } else delete (b as Record<string, unknown>).policyConsent;
  delete (b as Record<string, unknown>).policyV;
  if (isReviews) for (const it of reviewItems) {
    if (!it.nt && reviewMethod(it, ruleCountry) === "sw") { it.sw = true; it.old = true; }
  }
  const reviewUrls = reviewItems.map((it) => it.url).filter(Boolean) as string[];
  // Bereinigte Items zurück ins raw-JSON — der Admin liest sie von dort.
  if (isReviews) (b as Record<string, unknown>).reviewItems = reviewItems;
  if (dupSkipped.length) (b as Record<string, unknown>).duplicatesSkipped = dupSkipped;
  // Affiliate (FirstPromoter): lesbarer Partner-Code aus dem _fprom_ref-Cookie,
  // vom Browser mitgeschickt. Wird in interner Mail, Push und Admin angezeigt,
  // damit sofort sichtbar ist, von welchem Partner die Bestellung kommt.
  // Kann unten aus der track/sale-Antwort (Promoter-Name) angereichert werden.
  let affiliate = clip(b.fprRef, 200);
  if (affiliate) { try { affiliate = decodeURIComponent(affiliate); } catch (e) { /* roher Wert ok */ } affiliate = affiliate.replace(/[<>\r\n]/g, "").trim().slice(0, 120); }
  // Diagnose: zeigt bei jeder Bestellung im Log, was zur Affiliate-Zuordnung ankam.
  app.log.info({ orderId, isPress, hasFPR: hasFirstPromoter(), fprRefIn: clip(b.fprRef, 120), fprTidIn: b.fprTid ? "yes" : "no", affiliate }, "Order: Affiliate-Eingang");

  const t = TEMPLATES[isReviews ? "auftragsbestaetigung-reviews" : isPress ? "presse-eingang" : "auftragsbestaetigung"];
  const anrede = name ? (GREETING[tlang] || GREETING.de)(name) : undefined;
  // Bewertungs-Produkt: Stückpreis/Maximalbetrag in der Währung der Bestellung.
  const revCur = clip(b.country, 6) === "US" ? "usd" : "eur";
  const revChatPct = req.headers["x-rr-chat"] === CHAT_INTERNAL && !["wise", "paypal"].includes(String(b.payPref)) ? Math.max(0, Math.min(10, Math.round(Number(b.chatPct) || 0))) : 0;
  const revQ = quoteReviews(reviewItems, revCur, undefined, "full", revChatPct);
  const revPer = revQ.per;
  const revTotal = revQ.totalStr;
  // Kunden-Dashboard: Konto anlegen (Zugangsdaten nur beim ersten Mal in der Mail).
  let dash: { url: string; email?: string; password?: string; existing?: boolean } | undefined;
  let autologin: string | null = null;
  if (isReviews && dbReady() && email) {
    try {
      const acc = await ensureCustomerAccount(email);
      const durl = await dashLink(email, lang);
      if (acc) dash = acc.created ? { url: durl, email: email.trim().toLowerCase(), password: acc.password } : { url: durl, existing: true };
      // Direkt ins Dashboard (nur NEUES Konto): einmaliger Code, 15 Min., Sitzung nur 24 Std. – wer eine fremde E-Mail angibt,
      // kommt so höchstens in ein Konto mit seiner eigenen Bestellung und verliert den Zugang nach 24 Std. Bestehende Konten → Login/Mail-Link.
      if (acc?.created) autologin = await createAutologin(email).catch(() => null);
    } catch (e) { app.log.error({ err: e }, "Kundenkonto anlegen fehlgeschlagen"); }
  }
  const props = isReviews
    ? { lang: tlang, name, items: reviewItems, per: revPer, total: revTotal, currency: revCur, orderId, dash, chatPct: revChatPct, verify: verifyNeeded, verifyN: verifyNeeded ? (((b as Record<string, unknown>).verify as { keys?: string[] } | undefined)?.keys?.length || 0) : 0, payGate, policyAt: ((b as Record<string, unknown>).policyConsent as { at?: string } | null)?.at || "" }
    : { lang: tlang, anrede };
  const html = await render(React.createElement(t.component, props as any));

  const result = { ok: true, customer: false, notify: false, saved: false, saveError: "" };
  // 1) Kundenbestätigung — für JEDE Bestellung automatisch (seit 4.10.2026 wieder an):
  //    Profil-Bestellung → Auftragsbestätigung (inkl. AGB + Widerrufsbelehrung, FAGG),
  //    Bewertungs-Produkt → eigene Bestätigung mit den Abrechnungsregeln,
  //    Presse → Eingangsbestätigung der kostenlosen Prüfung.
  {
    const subj = t.subject(props as any);
    try {
      await sendMail({ to: email, subject: subj, html, replyTo: process.env.MAIL_REPLY_TO });
      result.customer = true;
      // Im Admin-Verlauf der Bestellung sichtbar machen.
      if (dbReady() && orderId) await insertEvent({ orderId, email, type: "mail", title: (isReviews ? "Auftragsbestätigung (Bewertungen)" : isPress ? "Eingangsbestätigung (Presse)" : "Auftragsbestätigung") + " gesendet (automatisch)", detail: "an " + email, html, subject: subj, auto: true }).catch(() => {});
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
    // Design „App-Icon & Push": 1 neuer Auftrag → „Neuer Auftrag · {Firma}", mehrere offen → „{n} neue Aufträge ·
    // Ältester wartet seit {Dauer}." (eine Meldung, wird ersetzt; App-Badge = Anzahl neuer Aufträge).
    let newN = 1, oldestMin = 0;
    try {
      if (pool && !isPress) {
        const q = await pool.query(`SELECT count(*)::int AS n, EXTRACT(EPOCH FROM (now() - min(created_at)))::int AS s FROM orders WHERE COALESCE(status,'new')='new' AND created_at > now() - interval '30 days'`);
        newN = Math.max(1, Number(q.rows[0]?.n || 1)); oldestMin = Math.round(Number(q.rows[0]?.s || 0) / 60);
      }
    } catch { /* egal */ }
    const dur = oldestMin < 60 ? `${Math.max(1, oldestMin)} Min.` : oldestMin < 2880 ? `${Math.round(oldestMin / 60)} Std.` : `${Math.round(oldestMin / 1440)} Tagen`;
    const heading = isPress ? "Neue Presse-Prüfung" : newN > 1 ? `${newN} neue Aufträge` : "Neuer Auftrag";
    const ptitle = isPress || newN <= 1 ? `${heading} · ${company || name || email}` : heading;
    const payPrefTxt = b.payPref === "wise" ? "zahlt per Wise (−10 %)" : b.payPref === "paypal" ? "zahlt per PayPal (−10 %)" : "";
    const pbody = !isPress && newN > 1
      ? `Ältester wartet seit ${dur}. Neu: ${company || name || email}`
      : [service, payPrefTxt, affiliate ? "Affiliate " + affiliate : ""].filter(Boolean).join(" · ");
    void protection; void phone;
    const adminUrl = SITE_URL + "/admin" + (orderId && newN <= 1 ? "?order=" + encodeURIComponent(orderId) : "");
    // Web-Push an die installierte Admin-App (öffnet die App selbst beim Tap)
    try {
      if (hasWebPush() && dbReady()) {
        const subs = await listPushSubscriptions();
        if (subs.length) {
          const expired = await sendWebPushAll(subs, { title: ptitle, body: pbody, url: adminUrl, tag: isPress ? "rr-order-" + (orderId || Date.now()) : "rr-new-orders", kind: "order", badge: newN });
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
      // Öffentliche Route: Maps-Link auf http/https begrenzen, bevor er im raw-JSON landet
      // und später im Admin als <a href> gerendert wird (XSS-Schutz gegen javascript:/data:).
      b.mapsUri = httpUrl(b.mapsUri, 400);
      b.affiliate = affiliate; // aufgelösten Partner im raw-JSON mitspeichern → Admin zeigt ihn an
      // Rabatt-Abfrage beim Absenden: nur bekannte Werte speichern.
      b.payPref = ["wise", "paypal", "none"].includes(String(b.payPref)) ? String(b.payPref) : undefined;
      if (["DE", "AT", "CH"].includes(String(b.country || "").toUpperCase()) && b.payPref !== "none") b.payPref = undefined; // PayPal/Wise −10 % nur außerhalb von DACH
      // Website-Chat: Rabatt NUR über den internen Aufruf aus /chat/site/order (nie vom Browser direkt).
      b.chatPct = req.headers["x-rr-chat"] === CHAT_INTERNAL ? (Math.max(0, Math.min(10, Math.round(Number(b.chatPct) || 0))) || undefined) : undefined;
      await insertOrder({
        id, name, email, phone, company, lang, profile, service, protection,
        country: clip(b.country, 6) || "DE",
        category: clip(b.category, 120),
        rating: clip(b.rating, 12),
        reviews: Number(b.reviews) || 0,
        amount: Number(b.amount) || 0,
        protAmount: Number(b.protAmount) || 0,
        note, checkId, raw: b,
        // Herkunft + Conversions-API-Kennungen in eigene Spalten spiegeln.
        source: clip(b.source, 40), sourceFirst: clip(b.sourceFirst, 40),
        utmSource: clip(b.utmSource, 120), utmMedium: clip(b.utmMedium, 120),
        utmCampaign: clip(b.utmCampaign, 200), utmContent: clip(b.utmContent, 200),
        referrer: clip(b.referrer, 200), landing: clip(b.landing, 200),
        fbclid: clip(b.fbclid, 260), fbclidTs: clip(b.fbclidTs, 40),
        fbc: clip(b.fbc, 300), fbp: clip(b.fbp, 120),
        consentMarketing: b.consentMarketing === true,
        eventSourceUrl: httpUrl(b.eventSourceUrl, 500),
        clientIp: String(req.ip || "").slice(0, 60),
        clientUa: String(req.headers["user-agent"] || "").slice(0, 400),
      });
      if (checkId) await linkCheck(checkId, id);
      if (b.chatSid) void linkSiteChat(b.chatSid, id, email).catch(() => {}); // Website-Chat → Bestellung (Admin: „hat bestellt")
      // Bewertungs-Bestellung → alle Bewertungen sofort aufs Partner-Board (Kunde = Profilname).
      // Software-Fälle (sw) sind normale Aufgaben: der Partner prüft, ob Software verfügbar ist, und setzt dann „Software"
      // → Kunde bekommt die Zahlungsaufforderung im Dashboard → nach Zahlung „Customer paid – start now".
      const vInfo = (b as Record<string, unknown>).verify as { by?: string; from?: string; keys?: string[] } | undefined;
      if (vInfo && vInfo.by === "reuse") await insertEvent({ orderId: id, type: "note", title: "Inhaber-Nachweis schon vorhanden (gleiches Profil)", detail: `Freigegeben in Auftrag ${vInfo.from} – kein neuer Nachweis nötig`, auto: true }).catch(() => {});
      if (verifyNeeded || payGate) {
        if (verifyNeeded) await insertEvent({ orderId: id, type: "note", title: `Inhaber-Nachweis nötig für ${vInfo?.keys?.length || 1} Bewertung(en) mit 4–5 Sternen`, detail: payGate ? "Reihenfolge: erst Zahlungsart, dann laufen die übrigen; diese erst nach dem Nachweis" : "Die übrigen gehen jetzt ans Partner-Board, diese erst nach dem Nachweis", auto: true }).catch(() => {});
        if (payGate) await insertEvent({ orderId: id, type: "note", title: "Zahlungsart nötig – Auftrag startet nach dem Hinterlegen", detail: "Kunde hinterlegt im Dashboard Karte/PayPal; abgebucht wird erst je Löschung", auto: true }).catch(() => {});
        if (!payGate) await startOrderIfReady(id).catch((e) => app.log.error({ err: e, orderId: id }, "Partner-Board: Teilstart fehlgeschlagen"));
      } else if (isReviews && reviewItems.length && await partnerAutoEnabled("reviews").catch(() => true)) {
        await partnerAutoSend(id, profile || company || name, reviewItems as Record<string, unknown>[])
          .catch((e) => app.log.error({ err: e, orderId: id }, "Partner-Board: automatische Übergabe fehlgeschlagen"));
      }
      // Profil-Bestellung (Löschung / Neustart / Express) → Profil als Partner-Aufgabe, falls in den Einstellungen aktiv.
      if (["remove", "reset", "express"].includes(service) && await partnerAutoEnabled("profiles").catch(() => false)) {
        const purl = (typeof b.mapsUri === "string" && b.mapsUri) || (/^https?:\/\//i.test(profile) ? profile : "");
        await partnerAutoSendProfile(id, profile || company || name, purl)
          .catch((e) => app.log.error({ err: e, orderId: id }, "Partner-Board: Profil-Weiterleitung fehlgeschlagen"));
      }
      // Automatische Screenshots (Hintergrund, blockiert die Antwort nicht) → Admin:
      // Bewertungs-Bestellung = jede Bewertung + Google-Profil; Profil-Bestellung =
      // Google-Profil (Zustand vor der Löschung); Presse = nichts.
      queueOrderShots(id, service, b, (o, m) => app.log.info(o, m));
      // Serverseitiges InitiateCheckout: Auftrag erteilt, Profil freigegeben.
      if (capiEnabled() && b.consentMarketing === true && await claimCapiSend("orders", "capi_checkout_at", id)) {
        const r = await capiSend({
          eventName: "InitiateCheckout",
          eventId: id,                                  // Order-ID ist stabil und eindeutig
          eventSourceUrl: httpUrl(b.eventSourceUrl, 500) || null,
          consentMarketing: true,
          user: {
            email, phone, country: clip(b.country, 6) || "DE",
            fbc: clip(b.fbc, 300) || null, fbp: clip(b.fbp, 120) || null,
            clientIp: String(req.ip || "").slice(0, 60),
            clientUa: String(req.headers["user-agent"] || "").slice(0, 400),
          },
          customData: { content_name: "profil_loeschung" },
        });
        if (!r.ok) { await releaseCapiSend("orders", "capi_checkout_at", id); app.log.warn({ id, error: r.error }, "CAPI InitiateCheckout fehlgeschlagen"); }
        else if (!r.skipped) app.log.info({ id, received: r.received, match: r.matchKeys }, "CAPI InitiateCheckout gesendet");
      }
      await insertEvent({ orderId: id, type: "order", title: isPress ? "Presse-Prüfung angefragt" : "Bestellung eingegangen", detail: `${id} erstellt` });
      if (result.customer) await insertEvent({ orderId: id, type: "mail", title: isPress ? "Eingangsbestätigung Presse gesendet" : "Bestellbestätigung gesendet", detail: `an ${email}`, auto: true, html, subject: t.subject(props) });
      result.saved = true;
    }
  } catch (e) {
    app.log.error({ err: e }, "Bestellung speichern fehlgeschlagen");
    result.saveError = String((e as Error)?.message || e).slice(0, 200);
  }

  return autologin ? { ...result, autologin } : result;
});

// Admin (neu) · „Neuer Auftrag": Auftrag manuell anlegen (Telefon/WhatsApp-Kunden).
// Läuft wie eine Website-Bestellung: gleiche Preise (Bewertungen: 179/Stk., +50 älter 4 Wo.,
// Mengenrabatt; Profil: 450 € / $495), gleiche Auftragsbestätigung (optional), Partner-Auto-
// Weiterleitung, Screenshots und Verlauf. Land-Chip bestimmt Währung + Sprache:
// AT/DE/CH → € + Deutsch; USA/UK/Andere → $ + Englisch (intern country "US" = USD).
const PROFILE_REASONS: Record<string, string> = { closed: "Dauerhaft geschlossen", fake: "Fake / nicht meins", dup: "Doppeltes Profil", moved: "Umgezogen", other: "Sonstiges" };
app.post("/admin/orders/create", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "Keine Datenbank" });
  const type = b.type === "profile" ? "profile" : "reviews";
  const c = (b.customer || {}) as Record<string, unknown>;
  const name = clip(c.name, 120), email = clip(c.email, 200).toLowerCase(), phone = clip(c.phone, 60);
  if (name.length < 2) return reply.code(400).send({ ok: false, error: "Name fehlt" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
  // Land = Land des Google-Profils (Admin übernimmt es aus dem Profil): USA → $, sonst € – wie bei Website-Bestellungen.
  const cIn = String(c.country || "").toUpperCase().replace(/^UK$/, "GB");
  const ctry = /^[A-Z]{2}$/.test(cIn) && cIn !== "XX" ? cIn : "AT";
  const eur = ctry !== "US";
  const country = ctry;
  // Sprache der Kunden-Mails/Dashboards: im Admin wählbar, sonst aus dem Land (DACH → de, sonst en).
  const langIn = String(c.lang || "").slice(0, 2);
  const lang = MAIL_LANGS.includes(langIn) ? langIn : ["AT", "DE", "CH", "LI"].includes(ctry) ? "de" : "en";
  const pl = (b.place || {}) as Record<string, unknown>;
  const company = clip(pl.name, 160);
  const mapsUri = httpUrl(pl.mapsUrl, 400);
  const placeId = clip(pl.placeId, 200);
  const addr = clip(pl.address, 300);
  type Item = { url?: string; name?: string; text?: string; old?: boolean; sw?: boolean; rating?: number; days?: number; cp?: number };
  const ctryPre = String(c.country || "").toUpperCase();
  const items: Item[] = type === "reviews" && Array.isArray(b.reviewItems)
    ? (b.reviewItems as unknown[]).slice(0, 40).map((raw) => {
        const o = (raw || {}) as Record<string, unknown>;
        const url = httpUrl(o.url, 400), nm = clip(o.name, 80), tx = clip(o.text, 400);
        const flags: Record<string, unknown> = o.old === true ? { old: true } : {};
        const rt = Math.round(Number(o.rating)), dy = Math.round(Number(o.days));
        if (rt >= 1 && rt <= 5) flags.rating = rt;
        if (Number.isFinite(dy) && dy >= 0 && dy < 20000 && o.days !== null && o.days !== undefined) flags.days = dy;
        // Software-Fall (Partner-Regel): ältere Bewertung mit Text aus den USA → wie Website-Bestellungen.
        if (reviewMethod({ old: o.old === true, days: flags.days as number }, ctryPre) === "sw") { flags.sw = true; flags.old = true; }
        if (cpOf(o)) flags.cp = cpOf(o); // individueller Preis je Bewertung (wird so abgebucht + verrechnet)
        if (url) return { url, ...(nm ? { name: nm } : {}), ...(tx ? { text: tx } : {}), ...flags } as Item;
        if (nm && tx) return { name: nm, text: tx, ...flags } as Item;
        return null;
      }).filter(Boolean) as Item[]
    : [];
  if (type === "reviews" && !items.length) return reply.code(400).send({ ok: false, error: "Keine Bewertungen gewählt" });
  if (type === "profile" && !company && !mapsUri) return reply.code(400).send({ ok: false, error: "Profil fehlt" });
  const reason = type === "profile" ? (PROFILE_REASONS[String(b.reason)] || "") : "";
  const cur = eur ? "eur" : "usd";
  const q = type === "reviews" ? quoteReviews(items, cur) : null;
  // Profil: individueller Preis möglich (Admin), sonst Preisliste.
  const profAmt = Number(b.amount);
  const amount = q ? q.total : profAmt > 0 && profAmt < 100000 ? Math.round(profAmt * 100) / 100 : (eur ? 450 : 495);
  const pay = ["auto", "link", "paypal", "invoice"].includes(String(b.payment)) ? String(b.payment) : "link";
  // „auto": Kunde hinterlegt im Dashboard seine Zahlungsart → Auftrag startet erst danach, abgebucht wird bei Löschung.
  const autoPay = pay === "auto" && autopayAvailable(email);
  const gate = autoPay && !(await hasSavedMethod(email).catch(() => false));
  const staff = ["max", "matthias"].includes(String(b.staff)) ? String(b.staff) : null;
  const sendConfirm = b.sendConfirm !== false;
  const id = "RR-" + Math.floor(100000 + Math.random() * 899999);
  const service = type === "reviews" ? "reviews" : "remove";
  const raw: Record<string, unknown> = {
    createdBy: "admin", service, orderId: id, name, email, phone, company, profile: company, country, lang,
    countryChoice: ctry, mapsUri, placeId, addr, amount,
    payMethod: autoPay ? "auto" : pay === "auto" ? "link" : pay, payPref: pay === "paypal" ? "paypal" : "none",
    ...(gate ? { payGate: { status: "pending", at: new Date().toISOString() } } : {}),
    ...(type === "reviews" ? { reviewItems: items } : { reason }),
  };
  try {
    await insertOrder({
      id, name, email, phone, company, lang, profile: company || mapsUri, service, protection: "",
      country, category: "", rating: "", reviews: items.length, amount, protAmount: 0,
      note: reason ? "Grund: " + reason : "", checkId: "", raw, source: "admin",
    });
    if (staff) await setOrderAssignee(id, staff).catch(() => false);
    await insertEvent({ orderId: id, type: "order", title: "Auftrag manuell angelegt (Admin)", detail: `${id} · ${type === "reviews" ? items.length + " Bewertung(en)" : "Profil löschen" + (reason ? " · " + reason : "")} · ${autoPay ? "automatische Abbuchung" + (gate ? " (wartet auf Zahlungsart)" : "") : pay === "paypal" ? "PayPal (−10 %)" : pay === "invoice" ? "Rechnung" : "Zahlungslink"}` });
  } catch (e) {
    app.log.error({ err: e }, "Admin-Auftrag anlegen fehlgeschlagen");
    return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
  }
  // Auftragsbestätigung wie bei Website-Bestellungen (optional abwählbar)
  let mailed = false;
  if (sendConfirm) {
    try {
      const tlang = mailLang(lang);
      const t = TEMPLATES[type === "reviews" ? "auftragsbestaetigung-reviews" : "auftragsbestaetigung"];
      let dash: { url: string; email?: string; password?: string; existing?: boolean } | undefined;
      { // Dashboard-Zugang für jeden Admin-Auftrag (Bewertungen + Profil): Status, „Pay" bzw. Zahlungsart hinterlegen
        try {
          const acc = await ensureCustomerAccount(email);
          const durl = await dashLink(email, lang);
          if (acc) dash = acc.created ? { url: durl, email, password: acc.password } : { url: durl, existing: true };
        } catch (e) { app.log.error({ err: e }, "Kundenkonto anlegen fehlgeschlagen"); }
      }
      const props = type === "reviews"
        ? { lang: tlang, name, items, per: q!.per, total: q!.totalStr, currency: cur, orderId: id, dash, payGate: gate }
        : { lang: tlang, anrede: (GREETING[tlang] || GREETING.de)(name), dash, payGate: gate };
      const html = await render(React.createElement(t.component, props as any));
      const subj = t.subject(props as any);
      await sendMail({ to: email, subject: subj, html, replyTo: process.env.MAIL_REPLY_TO });
      mailed = true;
      await insertEvent({ orderId: id, email, type: "mail", title: (type === "reviews" ? "Auftragsbestätigung (Bewertungen)" : "Auftragsbestätigung") + " gesendet", detail: "an " + email, html, subject: subj }).catch(() => {});
    } catch (e) { app.log.error({ err: e, orderId: id }, "Auftragsbestätigung (Admin) fehlgeschlagen"); }
  }
  // Partner-Board (Auto-Weiterleitung laut Einstellungen) + Screenshots
  let partner = 0;
  try {
    if (gate) await insertEvent({ orderId: id, type: "note", title: "Zahlungsart nötig – Auftrag startet nach dem Hinterlegen", detail: "Kunde hinterlegt im Dashboard Karte/PayPal; abgebucht wird erst bei Löschung", auto: true }).catch(() => {});
    else if (type === "reviews" && await partnerAutoEnabled("reviews").catch(() => true)) partner = await partnerAutoSend(id, company || name, items as Record<string, unknown>[]);
    else if (type === "profile" && await partnerAutoEnabled("profiles").catch(() => false)) partner = await partnerAutoSendProfile(id, company || name, mapsUri);
  } catch (e) { app.log.error({ err: e, orderId: id }, "Partner-Board (Admin-Auftrag) fehlgeschlagen"); }
  queueOrderShots(id, service, raw, (o, m) => app.log.info(o, m));
  return { ok: true, id, amount, currency: cur, mailed, partner, payGate: gate, autoPay };
});

// Admin (neu) · „Neuer Auftrag": Bewertungs-Link auflösen → Profil + Bewertung (Autor, Sterne, Alter).
// Die Review-ID im Link wird mit der SerpApi-Liste des Profils abgeglichen (neueste zuerst, SERPAPI_PAGES Seiten).
app.post("/admin/reviews/resolve", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const link = httpUrl(b.link, 600);
  if (!link) return reply.code(400).send({ ok: false, error: "Link fehlt" });
  try {
    const { place, reviewId } = await resolveReviewLink(link);
    let review = null as null | { name: string; rating: number; days: number; text: string };
    if (place && place.placeId && reviewId && serpKey()) {
      // auch ältere Bewertungen finden (nicht nur die neuesten Seiten): Suche nach Review-ID, schlechteste zuerst
      const hit = await findPlaceReview(place.placeId, reviewId, mailLang(b.lang || "de")).catch(() => null);
      if (hit) review = { name: hit.name, rating: hit.rating, days: hit.days, text: hit.text };
    }
    return { ok: true, place, review };
  } catch (e) { return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) }); }
});

// Admin (neu) · „Neuer Auftrag": Bewertungen eines Profils zum Anhaken (SerpApi, ohne Drosselung).
app.post("/admin/places/reviews", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!serpKey()) return { ok: true, enabled: false, reviews: [] };
  const placeId = clip(b.placeId, 200);
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(placeId)) return reply.code(400).send({ ok: false, error: "bad placeId" });
  try { return { ok: true, enabled: true, reviews: await fetchPlaceReviews(placeId, mailLang(b.lang || "de")) }; }
  catch (e) { return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) }); }
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
  const paypal = clip(ans.paypal, 200);   // optionaler PayPal-Wunsch (E-Mail) für 10 % Rabatt – nur außerhalb DACH abgefragt
  if (paypal) form.paypal = paypal;
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
        // Reine Folge-Updates (Stufe, Grund) schicken kein reviews/recommend mit –
        // dann NICHT mit 0/"remove" überschreiben (COALESCE greift nur bei NULL).
        reviews: b.reviews != null ? Number(b.reviews) || 0 : undefined,
        recommend: clip(b.recommend, 40) || (b.profile ? "remove" : undefined),
        reason: clip(b.reason, 40) || undefined,
        name: clip(b.name, 160), email: clip(b.email, 160) || undefined,
        country: clip(b.country, 6) || "DE", lang: clip(b.lang, 5) || "de",
        // Funnel-Tracking: erreichte Wizard-Stufe (1–4), gesehener Preis, Herkunft.
        step: b.step != null ? Number(b.step) || undefined : undefined,
        amount: b.amount != null ? Number(b.amount) || undefined : undefined,
        source: clip(b.source, 40) || undefined,
        // Herkunft ausgeschrieben: `source` ist der Last-Touch (die Quelle, die
        // zählt), `sourceFirst` der unveränderliche First-Touch. utm_content
        // trägt den Motivschlüssel der Anzeige.
        sourceFirst: clip(b.sourceFirst, 40) || undefined,
        utmSource: clip(b.utmSource, 120) || undefined,
        utmMedium: clip(b.utmMedium, 120) || undefined,
        utmCampaign: clip(b.utmCampaign, 200) || undefined,
        utmContent: clip(b.utmContent, 200) || undefined,
        clickId: clip(b.clickId, 260) || undefined,
        referrer: clip(b.referrer, 200) || undefined,
        landing: clip(b.landing, 200) || undefined,
        attribution: b.attribution && typeof b.attribution === "object" ? b.attribution : undefined,
        attributionFirst: b.attributionFirst && typeof b.attributionFirst === "object" ? b.attributionFirst : undefined,
        // Google-Profil-Bezug (für klickbare Profile + Lead-Recherche im Admin).
        placeId: clip(b.placeId, 120) || undefined,
        mapsUri: httpUrl(b.mapsUri, 400) || undefined,
        addr: clip(b.addr, 250) || undefined,
        // Conversions API: Kennungen am Datensatz festhalten. Sie werden IMMER
        // gespeichert — die eigene Datenbank beantwortet „aus welchem Kanal kam
        // die Anfrage" auch ohne Einwilligung, weil die Daten das Haus nicht
        // verlassen. Gesendet wird nur bei consent_marketing.
        fbclid: clip(b.fbclid, 260) || undefined,
        fbclidTs: clip(b.fbclidTs, 40) || undefined,
        fbc: clip(b.fbc, 300) || undefined,
        fbp: clip(b.fbp, 120) || undefined,
        consentMarketing: b.consentMarketing === true,
        leadEventId: clip(b.leadEventId, 80) || undefined,
        eventSourceUrl: httpUrl(b.eventSourceUrl, 500) || undefined,
        clientIp: String(req.ip || "").slice(0, 60) || undefined,
        clientUa: String(req.headers["user-agent"] || "").slice(0, 400) || undefined,
      });
      // Serverseitiges Lead — dasselbe event_id wie im Browser, damit Meta
      // dedupliziert statt doppelt zu zählen. Nur beim ERSTEN Aufruf je Prüfung
      // (die Funnel-Updates senden weder Einwilligung noch Ereignis-ID mit).
      if (capiEnabled() && b.consentMarketing === true && b.leadEventId) {
        if (await claimCapiSend("checks", "capi_lead_at", id)) {
          const r = await capiSend({
            eventName: "Lead",
            eventId: String(b.leadEventId).slice(0, 80),
            eventSourceUrl: httpUrl(b.eventSourceUrl, 500) || null,
            consentMarketing: true,
            user: {
              email: clip(b.email, 160) || null, phone: null,
              country: clip(b.country, 6) || "DE",
              fbc: clip(b.fbc, 300) || null, fbp: clip(b.fbp, 120) || null,
              clientIp: String(req.ip || "").slice(0, 60),
              clientUa: String(req.headers["user-agent"] || "").slice(0, 400),
            },
            customData: { content_name: "gratis_check" },
          });
          if (!r.ok) { await releaseCapiSend("checks", "capi_lead_at", id); app.log.warn({ id, error: r.error }, "CAPI Lead fehlgeschlagen"); }
          else if (!r.skipped) app.log.info({ id, received: r.received, match: r.matchKeys }, "CAPI Lead gesendet");
        }
      }
    }
  } catch (e) { app.log.error({ err: e }, "Prüfung speichern fehlgeschlagen"); }
  return { ok: true, id };
});

// Bewertungs-Wizard: Google-Bewertungen eines Profils (SerpApi) zum Anhaken.
// Ohne SERPAPI_KEY → { enabled: false }, der Wizard bleibt bei der Link-Eingabe.
const reviewHits = new Map<string, number[]>();
app.get("/reviews", async (req, reply) => {
  const q = (req.query || {}) as Record<string, string>;
  if (!serpKey()) return { ok: false, enabled: false };
  if (q.probe) return { ok: true, enabled: true };
  const placeId = clip(q.placeId, 200);
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(placeId)) return reply.code(400).send({ ok: false, enabled: true, error: "bad placeId" });
  if (!throttle(reviewHits, req.ip, 6)) return reply.code(429).send({ ok: false, enabled: true, error: "rate limited" });
  try {
    const reviews = await fetchPlaceReviews(placeId, mailLang(q.lang));
    return { ok: true, enabled: true, reviews };
  } catch (e) {
    app.log.error({ err: e, placeId }, "SerpApi-Bewertungen fehlgeschlagen");
    return reply.code(502).send({ ok: false, enabled: true, error: "fetch failed" });
  }
});

// Admin-Dashboard: Login-Prüfung (gegen ADMIN_TOKEN)
app.post("/admin/verify", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  const t = Buffer.from(String(b.token || "")), r = Buffer.from(ADMIN_TOKEN || "");
  const ok = !!ADMIN_TOKEN && t.length === r.length && crypto.timingSafeEqual(t, r);
  if (!ok) reply.code(401); // zählt für die Sperre nach zu vielen Fehlversuchen
  return { ok };
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
    if (oid) {
      await insertEvent({ orderId: oid, type: "sms", title: "SMS gesendet", detail: "an " + to + " · " + message.slice(0, 100) });
      // Enthält die SMS einen Zahlungslink, gilt sie als gesendeter Zahlungslink → Status „Zahlungslink gesandt".
      if (/stripe\.com/i.test(message)) await insertEvent({ orderId: oid, type: "pay", title: "Zahlungslink gesendet", detail: "per SMS an " + to });
    }
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
  // plain: persönliche Mail ohne Marken-Kopf (z. B. Presse-/Partner-Anfragen aus dem Admin).
  const linked = safe.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#cc6300">$1</a>');
  const html = b.plain === true
    ? `<div style="font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1c1916;max-width:620px">${linked}</div>`
    : `<div style="font-family:'Segoe UI',system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1c1916;max-width:560px">` +
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
  // Test-Flag (Inhaber-Adresse, „+test", TEST_EMAILS): Admin markiert diese Aufträge und lässt sie aus allen Zahlen raus.
  const flag = <T extends Record<string, unknown>>(r: T) => ({ ...r, test: isTestEmail(r.email) });
  return { ok: true, db: dbReady(), orders: orders.map(flag), checks: checks.map(flag) };
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

// Admin: EIN Test-Konto leeren (nur Test-Adressen laut isTestEmail). Ohne apply = nur zählen.
// Löscht Aufträge + alles daran (Partner-Aufgaben, Verlauf, Mails, Zahlungs-/Mahn-Daten, Dashboard-Aktivität, Zahlungsart).
// Login bleibt: Kundenkonto, Sitzungen, Passkeys, Push-Geräte, Partner-Zugang.
app.post("/admin/test-purge", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const email = String(b.email || "").trim().toLowerCase();
  if (!email || !isTestEmail(email)) return reply.code(400).send({ ok: false, error: "nur für Test-Konten" });
  if (!pool) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const apply = b.apply === true && String(b.confirm || "") === "TESTKONTO-LEEREN";
  const ids = (await pool.query(`SELECT id FROM orders WHERE lower(email)=$1`, [email])).rows.map((x) => x.id as string);
  const steps: [string, string, unknown[]][] = [
    ["partner_tasks", `DELETE FROM partner_tasks WHERE order_id = ANY($1::text[])`, [ids]],
    ["cust_notify", `DELETE FROM cust_notify WHERE order_id = ANY($1::text[])`, [ids]],
    ["sw_pay_reminders", `DELETE FROM sw_pay_reminders WHERE order_id = ANY($1::text[])`, [ids]],
    ["reconciled_payments", `DELETE FROM reconciled_payments WHERE order_id = ANY($1::text[])`, [ids]],
    ["events", `DELETE FROM events WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["customer_events", `DELETE FROM customer_events WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["cust_followups", `DELETE FROM cust_followups WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["cust_verify_docs", `DELETE FROM cust_verify_docs WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["monitor_profiles", `DELETE FROM monitor_profiles WHERE order_id = ANY($1::text[]) OR lower(cust_email)=$2`, [ids, email]],
    ["site_chat_links", `DELETE FROM site_chat_links WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["checks", `DELETE FROM checks WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["admin_impersonations", `DELETE FROM admin_impersonations WHERE order_id = ANY($1::text[]) OR lower(email)=$2`, [ids, email]],
    ["upsell_jobs", `DELETE FROM upsell_jobs WHERE lower(email)=$1`, [email]],
    ["chat_messages", `DELETE FROM chat_messages WHERE lower(email)=$1`, [email]],
    ["cust_invites", `DELETE FROM cust_invites WHERE lower(email)=$1`, [email]],
    ["cust_autopay", `DELETE FROM cust_autopay WHERE lower(email)=$1`, [email]],
    ["orders", `DELETE FROM orders WHERE id = ANY($1::text[])`, [ids]],
  ];
  const counts: Record<string, number | string> = {};
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    for (const [t, sql, args] of steps) {
      await c.query(`SAVEPOINT s`);
      try { counts[t] = (await c.query(sql, args)).rowCount ?? 0; await c.query(`RELEASE SAVEPOINT s`); }
      catch (e) { await c.query(`ROLLBACK TO SAVEPOINT s`); counts[t] = "–"; } // Tabelle gibt es (noch) nicht
    }
    await c.query(apply ? "COMMIT" : "ROLLBACK");
  } catch (e) { await c.query("ROLLBACK").catch(() => {}); throw e; } finally { c.release(); }
  if (apply) app.log.warn({ email, counts }, "Admin: Test-Konto geleert");
  return { ok: true, applied: apply, orders: ids, counts };
});

// Admin: NUR die Profil-Prüfungen zurücksetzen (Bestellungen/Zahlungen/Verlauf bleiben).
// Doppelt abgesichert: Admin-Token + Bestätigungswort.
app.post("/admin/reset-checks", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (String(b.confirm || "") !== "PRUEFUNGEN-LOESCHEN") return reply.code(400).send({ ok: false, error: "Bestätigung fehlt: confirm muss 'PRUEFUNGEN-LOESCHEN' sein" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  try {
    const r = await wipeChecks();
    app.log.warn({ wiped: r }, "Admin: Prüfungen zurückgesetzt");
    return { ok: true, ...r };
  } catch (e) {
    return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin: recherchierte/nachgetragene Lead-E-Mail an einer Prüfung speichern (leer = entfernen).
app.post("/admin/check-email", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = clip(b.checkId, 40);
  if (!id) return reply.code(400).send({ ok: false, error: "checkId erforderlich" });
  const email = clip(b.email, 160);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "ungültige E-Mail" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const ok = await setCheckEmail(id, email);
  if (!ok) return reply.code(404).send({ ok: false, error: "Prüfung nicht gefunden" });
  return { ok: true };
});

/* Lead-Recherche: Unternehmens-Website nach Kontakt-E-Mails durchsuchen (Scan-Logik in
   leadEnrich.ts). Die Website ermittelt der Admin clientseitig über Google Places
   (websiteUri, Browser-Key); dieses Backend lädt nur die Seite(n) und extrahiert
   Adressen — der Browser kann fremde Websites wegen CORS nicht selbst lesen.
   Mit checkId + autosave speichert der Server den besten Treffer direkt am Check und
   markiert die Prüfung als recherchiert (Basis der automatischen Recherche im Admin). */
app.post("/admin/check-enrich", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const u = normalizeWebsite(String(b.website || ""));
  if (!u) return reply.code(400).send({ ok: false, error: "ungültige/unzulässige Website" });
  const emails = await scanWebsiteEmails(u);
  const checkId = clip(b.checkId, 40);
  const autosave = b.autosave === true || b.autosave === "true";
  let saved = "";
  if (checkId && autosave && dbReady()) {
    saved = pickBestEmail(emails, u.hostname);
    await markCheckEnriched(checkId, saved || null); // auch ohne Fund markieren (kein Endlos-Retry)
  }
  return { ok: true, website: u.href, emails, saved };
});

// Auto-Recherche ohne Website (z. B. Google kennt keine): nur als recherchiert markieren,
// damit die automatische Suche dieselbe Prüfung nicht bei jedem Öffnen erneut anfasst.
app.post("/admin/check-enrich-mark", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = clip(b.checkId, 40);
  if (!id) return reply.code(400).send({ ok: false, error: "checkId erforderlich" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  await markCheckEnriched(id, null);
  return { ok: true };
});

// Admin: Bestellung einem Bearbeiter zuweisen (max | matthias | null).
app.post("/admin/order-assign", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = String(b.orderId || "");
  const who = b.assignee == null || b.assignee === "" ? null : String(b.assignee);
  const force = b.force === true || b.force === "true"; // Übernahme trotz bestehender Zuweisung wurde bestätigt
  if (!id) return reply.code(400).send({ ok: false, error: "orderId fehlt" });
  if (who && !["max", "matthias"].includes(who)) return reply.code(400).send({ ok: false, error: "ungültige Zuweisung" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  try {
    const prev = (await getOrderBasic(id))?.assignee || null;
    // Übernahme-Schutz (server-autoritativ, frischer prev aus der DB): Ist der Auftrag BEREITS
    // einem ANDEREN Betreuer zugewiesen und wurde die Übernahme nicht bestätigt (force), NICHT
    // überschreiben — Konflikt melden, damit der Client das Übernahme-Pop-up zeigt. Greift auch,
    // wenn der Client noch nicht wusste, dass schon jemand zugewiesen war. Erstzuweisung (kein
    // prev) und Entfernen (who=null) laufen ohne Rückfrage durch.
    if (who && prev && prev !== who && !force) {
      return reply.code(409).send({ ok: false, conflict: true, current: prev });
    }
    const ok = await setOrderAssignee(id, who);
    // Betreuer-Aktivität protokollieren: Hinzufügen, Wechsel oder Entfernen.
    if (ok && prev !== who) {
      const NAME: Record<string, string> = { max: "Max", matthias: "Matthias" };
      const nm = (x: string | null) => (x ? (NAME[x] || x) : null);
      const title = who && !prev ? `${nm(who)} als Betreuer hinzugefügt`
        : who && prev ? `Betreuerwechsel: ${nm(prev)} → ${nm(who)}`
        : "Betreuer entfernt";
      const detail = who && !prev ? "im Dashboard zugewiesen"
        : who && prev ? `${nm(who)} hat den Auftrag übernommen`
        : `${nm(prev)} ist nicht mehr zugewiesen`;
      await insertEvent({ orderId: id, type: "assign", title, detail });
    }
    return { ok, assignee: who };
  } catch (e) { return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) }); }
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
    return { key, label: t.label, group: t.group, subject, editable: !!t.texts };
  });
  return { ok: true, templates };
});

// Admin: Detail einer Vorlage zum Bearbeiten – editierbare Felder, Default-Texte je Sprache
// und die bereits gespeicherten Overrides. Nur Vorlagen mit `texts` sind bearbeitbar.
app.post("/admin/template-detail", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const key = clip(b.key, 60);
  const t = TEMPLATES[key];
  if (!t) return reply.code(404).send({ ok: false, error: "unknown template" });
  if (!t.texts) return { ok: true, key, editable: false, langs: [], fields: [], defaults: {}, overrides: {} };
  const langs = Object.keys(t.texts);
  const fields = editableFields(t.texts, "en");
  const defaults: Record<string, Record<string, string>> = {};
  for (const l of langs) {
    const row = (t.texts[l] || {}) as Record<string, unknown>;
    const d: Record<string, string> = {};
    for (const f of fields) if (typeof row[f] === "string") d[f] = row[f] as string;
    defaults[l] = d;
  }
  let overrides: Record<string, Record<string, string>> = {};
  try { overrides = await getTemplateOverrides(key); } catch { /* DB weg → nur Defaults */ }
  return { ok: true, key, editable: true, label: t.label, langs, fields, defaults, overrides };
});

// Admin: bearbeitete Texte einer Vorlage für EINE Sprache speichern. Nur editierbare
// String-Felder werden übernommen (schützt Funktionsfelder wie greeting vor Überschreiben).
app.post("/admin/template-save", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const key = clip(b.key, 60);
  const t = TEMPLATES[key];
  if (!t || !t.texts) return reply.code(400).send({ ok: false, error: "Vorlage nicht bearbeitbar" });
  const lang = clip(b.lang, 5);
  if (!lang || !t.texts[lang]) return reply.code(400).send({ ok: false, error: "Sprache unbekannt" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const allowed = new Set(editableFields(t.texts, lang));
  const incoming = (b.fields && typeof b.fields === "object") ? (b.fields as Record<string, unknown>) : {};
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(incoming)) if (allowed.has(k) && typeof v === "string") fields[k] = clip(v, 4000);
  const ok = await saveTemplateOverride(key, lang, fields);
  if (!ok) return reply.code(500).send({ ok: false, error: "Speichern fehlgeschlagen" });
  await insertEvent({ type: "mail", title: `Vorlage „${t.label}" bearbeitet (${lang})`, detail: "Text im Admin geändert", auto: false });
  return { ok: true };
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

// Admin-Dashboard: Zahlungslinks fürs Bewertungs-Produkt anlegen (1–10 Stück, EUR+USD).
// apply=false → Trockenlauf. Gleiche Mechanik wie /admin/setup-express.
app.post("/admin/setup-reviews", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!hasSecretKey()) return reply.code(400).send({ ok: false, error: "STRIPE_SECRET_KEY nicht gesetzt" });
  const apply = b.apply === true || b.apply === "true";
  try {
    const report = await runReviewsSetup({ apply });
    return { ok: true, ...report };
  } catch (e) {
    app.log.error({ err: e }, "Reviews-Setup fehlgeschlagen");
    return reply.code(400).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 300) });
  }
});

// Admin-Dashboard: Löschbestätigung + Rechnung fürs Bewertungs-Produkt senden.
// Abgerechnet werden NUR die als gelöscht markierten Links (Anzahl × 179),
// fällig am Löschtag (= heute). Zahlungslink: Tabelle → Betrag-Match.
// Admin-Dashboard: „Bearbeitung gestartet"-Bestätigung für Bewertungs-Aufträge.
// Sprache = die, über die der Kunde gekommen ist (Sprache der Bestellung).
// Das Produkt gibt es nicht auf Deutsch → "de" fällt auf Englisch zurück.
app.post("/admin/reviews-start", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  type StartItem = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean };
  const items: StartItem[] = (Array.isArray(b.items) ? (b.items as unknown[]) : []).slice(0, 40).map((raw) => {
    if (typeof raw === "string") { const u = httpUrl(raw, 400); return u ? { url: u } : null; }
    const o = (raw || {}) as Record<string, unknown>;
    const url = httpUrl(o.url, 400);
    const nm = clip(o.name, 80);
    const tx = clip(o.text, 400);
    const flags = o.nt === true ? { nt: true } : o.sw === true ? { old: true, sw: true } : o.old === true ? { old: true } : {}; // nt/sw: Software (Vorauszahlung) · old: älter als 4 Wochen
    if (url) return { url, ...flags };
    if (nm && tx) return { name: nm, text: tx, ...flags };
    if (nm && flags.nt) return { name: nm, ...flags };
    return null;
  }).filter(Boolean) as StartItem[];
  const currency = (clip(b.currency, 8) || "eur").toLowerCase() === "usd" ? "usd" : "eur";
  // Abgelehnte, aber per Spezial-Software löschbare Bewertungen (im Admin markiert).
  const swItems: StartItem[] = (Array.isArray(b.softwareItems) ? (b.softwareItems as unknown[]) : []).slice(0, 40).map((raw) => {
    const o = (raw || {}) as Record<string, unknown>;
    const url = httpUrl(o.url, 400); const nm = clip(o.name, 80); const tx = clip(o.text, 400);
    if (url) return { url, ...(nm ? { name: nm } : {}), ...(tx ? { text: tx } : {}), nt: true };
    if (nm) return { name: nm, ...(tx ? { text: tx } : {}), nt: true };
    return null;
  }).filter(Boolean) as StartItem[];
  // Exakte Preise der Bestellung (Alter je Bewertung, Mengenrabatt) — wie Wizard/Rechnung.
  // Mengenrabatt richtet sich nach den ANGENOMMENEN Bewertungen (= items).
  const startChatPct = await chatPctForOrder(b.orderId);
  const startQuote = quoteReviews(items, currency, undefined, "full", startChatPct);
  const per = startQuote.per;
  // Bewertungen ohne Text / Spezial-Software: KEINE Vorauszahlung mehr (10/2026) – Button führt ins Dashboard
  // (Zahlungsart hinterlegen bzw. Software bestätigen), abgebucht wird erst bei erfolgreicher Löschung.
  const swDash = async () => { const u = await dashLink(String(b.email || "").trim().toLowerCase(), mailLang(b.lang)); return u + (u.includes("?") ? "&" : "?") + "open=software"; };
  let prepay: { n: number; amount: string; url: string } | undefined;
  if (startQuote.nNt > 0) prepay = { n: startQuote.nNt, amount: startQuote.ntDepositStr, url: await swDash() };
  let software: { items: StartItem[]; amount: string; url: string; price: string; amountNum: number } | undefined;
  if (swItems.length) {
    const swQ = quoteReviews([...items, ...swItems], currency, undefined, "full", startChatPct);
    const amountNum = Math.round((swItems.length * 300 * (100 - swQ.pct)) / 100); // Betrag bei Erfolg
    software = { items: swItems, amount: fmtReviewMoney(amountNum, currency), url: await swDash(), price: fmtReviewMoney(300, currency), amountNum };
  }
  // Nicht angenommene Bewertungen (im Admin abgewählt): nur die Anzahl, für den Hinweis in der Mail.
  const declined = Math.max(0, Math.min(40, Number(b.declinedCount) || 0));
  // Sprache der Bestellung (Deutsch ist enthalten, Sie-Form).
  const raw = mailLang(b.lang);
  const tlang = raw;
  const orderId = clip(b.orderId, 40);
  try {
    const t = TEMPLATES["bearbeitung-gestartet-reviews"];
    const props = { lang: tlang, name: clip(b.name, 120), items, per, currency, orderId, declined, prepay, software, dashUrl: await dashLink(to, tlang) };
    const { html, subject } = await renderTemplate("bearbeitung-gestartet-reviews", props as any);
    await sendMail({ to, subject, html, replyTo: process.env.MAIL_REPLY_TO });
    await insertEvent({
      orderId: orderId || undefined, email: to, type: "mail",
      title: t.label + " gesendet",
      detail: `${items.length || 1} Bewertung(en) angenommen${declined ? ` · ${declined} abgelehnt` : ""}${prepay ? ` · ${prepay.n} ohne Text: ${prepay.amount} bei Erfolg (Dashboard-Link)` : ""}${software ? ` · ${software.items.length} per Spezial-Software angeboten: ${software.amount} bei Erfolg` : ""} · Sprache ${tlang.toUpperCase()} · an ${to}`,
      html, subject,
    });
    // Angenommene Bewertungen merken → Basis für Mengenrabatt, Rechnung und Mahnung.
    if (orderId && items.length) await setOrderRawField(orderId, "reviewsAccepted", items).catch(() => {});
    if (orderId && prepay) await setOrderRawField(orderId, "reviewsPrepay", { ...prepay, at: new Date().toISOString() }).catch(() => {});
    if (orderId && software) await setOrderRawField(orderId, "reviewsSoftware", software.items).catch(() => {});
    // Keine offenen Vorauszahlungen mehr anlegen (10/2026): Software/ohne Text wird im Dashboard bestätigt, abgebucht erst bei Erfolg.
    return { ok: true, lang: tlang, count: items.length };
  } catch (e) {
    app.log.error({ err: e }, "Reviews-Startbestätigung fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin-Dashboard: Storno eines Bewertungs-Auftrags — genau zwei Gründe:
// "age" (älter als 4 Wochen) oder "text" (reine Sternebewertung ohne Text).
// Sprache = die, über die der Kunde gekommen ist ("de" → Englisch).
app.post("/admin/reviews-storno", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  // "impossible" = ganze Bestellung storniert, Löschung nicht möglich (kurze Mail, Rest über den Partner-Workflow).
  const reason = b.reason === "text" ? "text" : b.reason === "age" ? "age" : b.reason === "impossible" ? "impossible" : null;
  if (!reason) return reply.code(400).send({ ok: false, error: "Grund fehlt (age | text | impossible)" });
  type StornoItem = { url?: string; name?: string; text?: string };
  const items: StornoItem[] = (Array.isArray(b.items) ? (b.items as unknown[]) : []).slice(0, 40).map((raw) => {
    if (typeof raw === "string") { const u = httpUrl(raw, 400); return u ? { url: u } : null; }
    const o = (raw || {}) as Record<string, unknown>;
    const url = httpUrl(o.url, 400);
    const nm = clip(o.name, 80);
    const tx = clip(o.text, 400);
    if (url) return { url };
    if (nm && tx) return { name: nm, text: tx };
    return null;
  }).filter(Boolean) as StornoItem[];
  const raw = mailLang(b.lang);
  const tlang = raw;
  const orderId = clip(b.orderId, 40);
  try {
    const key = reason === "impossible" ? "storno-reviews-all" : "storno-reviews";
    const t = TEMPLATES[key];
    const props = reason === "impossible"
      ? { lang: tlang, name: clip(b.name, 120), orderId, dashUrl: await dashLink(to, tlang) }
      : { lang: tlang, name: clip(b.name, 120), reason, items, orderId, dashUrl: await dashLink(to, tlang) };
    const { html, subject } = await renderTemplate(key, props as any);
    await sendMail({ to, subject, html, replyTo: process.env.MAIL_REPLY_TO });
    await insertEvent({
      orderId: orderId || undefined, email: to, type: "mail",
      title: t.label + " gesendet",
      detail: `Grund: ${reason === "age" ? "älter als 4 Wochen" : reason === "text" ? "kein Text" : "Löschung nicht möglich (ganze Bestellung)"} · ${items.length || 1} Bewertung(en) · Sprache ${tlang.toUpperCase()} · an ${to}`,
      html, subject,
    });
    return { ok: true, lang: tlang, reason, count: items.length };
  } catch (e) {
    app.log.error({ err: e }, "Reviews-Storno fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin: Screenshots einer Bestellung — Bewertungen (idx 0…) bzw. Unternehmensprofil
// (idx -1) — Liste + Neu aufnehmen.
// Body: { token, orderId, retake?: true }. retake nimmt fehlende/fehlgeschlagene
// neu auf (auch für Bestellungen von vor der Einführung).
app.post("/admin/review-shots", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const orderId = clip(b.orderId, 40);
  if (!orderId) return reply.code(400).send({ ok: false, error: "orderId fehlt" });
  if (!shotKey()) return { ok: true, enabled: false, shots: [] };
  try {
    if (b.retake === true) {
      await retakeShots(orderId, (x, m) => app.log.info(x, m));
    }
    const shots = await listShots(orderId);
    return { ok: true, enabled: true, running: shotsRunning(orderId), shots };
  } catch (e) {
    return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
  }
});
// Admin: Screenshots für die Bewertungs-Bestellungen der letzten N Tage nachholen.
// Body: { token, days? = 14 }. Läuft im Hintergrund; Antwort sofort.
app.post("/admin/review-shots-backfill", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!shotKey()) return { ok: false, error: "SCREENSHOTONE_KEY fehlt" };
  if (backfillActive()) return { ok: true, started: false, running: true };
  void backfillReviewShots(Number(b.days) || 14, (o, m) => app.log.info(o, m), true); // manuell im Admin: immer
  return { ok: true, started: true };
});
// Admin: einzelnes Screenshot-Bild (Token als Query, damit <img src> funktioniert).
app.get("/admin/review-shot/:id", async (req, reply) => {
  const q = (req.query || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(q.token || "") !== ADMIN_TOKEN) return reply.code(401).send("unauthorized");
  const id = Number((req.params as { id?: string }).id);
  if (!Number.isInteger(id) || id <= 0) return reply.code(400).send("bad id");
  const shot = await getShot(id).catch(() => null);
  if (!shot) return reply.code(404).send("not found");
  reply.header("Content-Type", shot.mime);
  reply.header("Cache-Control", "private, max-age=86400");
  if (String(q.dl || "") === "1") reply.header("Content-Disposition", `attachment; filename="bewertung-${id}.jpg"`);
  return reply.send(shot.img);
});

/** Individuelle Preise (cp) kommen IMMER aus dem Auftrag (nicht aus dem Browser): je Bewertung per Schlüssel übernehmen. */
async function withOrderCp<T extends { url?: string; name?: string; text?: string; cp?: number }>(orderId: unknown, items: T[]): Promise<T[]> {
  const id = clip(orderId, 40);
  if (!id || !pool) return items;
  const r = await pool.query(`SELECT raw->'reviewItems' AS a FROM orders WHERE id=$1`, [id]).catch(() => null);
  const all = (Array.isArray(r?.rows[0]?.a) ? r!.rows[0].a : []) as { url?: string; name?: string; text?: string; cp?: number }[];
  const key = (it: { url?: string; name?: string; text?: string }) => it.url || `${it.name || ""}|${it.text || ""}`;
  const by = new Map(all.filter((x) => cpOf(x) > 0).map((x) => [key(x), cpOf(x)]));
  return items.map((it) => (by.has(key(it)) ? { ...it, cp: by.get(key(it)) } : it));
}
/** Software-Fälle, die NICHT vorab bezahlt wurden (Standard seit 10/2026: Abbuchung erst bei Erfolg) → due:true, damit sie in der
 *  Abrechnung nach der Löschung („rest") voll zählen. Gleiche Regel wie orderView/prepaidFor (customers.ts). */
async function markSwDue<T extends { url?: string; name?: string; text?: string; nt?: boolean; sw?: boolean; due?: boolean }>(orderId: unknown, items: T[]): Promise<T[]> {
  const id = clip(orderId, 40);
  if (!id || !pool) return items;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [id]).catch(() => null);
  const raw = (r?.rows[0]?.raw || {}) as Record<string, unknown>;
  const pays = (Array.isArray(raw.reviewsPayments) ? raw.reviewsPayments : []) as { kind?: string; paid?: string | null; keys?: string[] }[];
  const dec = (raw.reviewsSwDecision || {}) as Record<string, { d?: string; def?: boolean }>;
  const key = (it: { url?: string; name?: string; text?: string }) => it.url || `${it.name || ""}|${it.text || ""}`;
  const prepaid = (k: string) => (dec[k]?.d === "accepted" && !dec[k]?.def) || pays.some((p) => (p.kind === "software" || p.kind === "deposit") && p.paid && (p.keys && p.keys.length ? p.keys.includes(k) : true));
  return items.map((it) => ((it.nt || it.sw) && !prepaid(key(it)) ? { ...it, due: true } : it));
}

app.post("/admin/reviews-invoice", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  type RemovedItem = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean; cp?: number; due?: boolean };
  const rawRemoved: unknown[] = Array.isArray(b.removedItems) ? (b.removedItems as unknown[])
    : Array.isArray(b.removedUrls) ? (b.removedUrls as unknown[]) : [];
  const removedItems: RemovedItem[] = rawRemoved.slice(0, 40).map((raw) => {
    if (typeof raw === "string") { const u = httpUrl(raw, 400); return u ? { url: u } : null; }
    const o = (raw || {}) as Record<string, unknown>;
    const url = httpUrl(o.url, 400);
    const nm = clip(o.name, 80);
    const tx = clip(o.text, 400);
    const old = o.nt === true ? { nt: true } : o.sw === true ? { old: true, sw: true } : o.old === true ? { old: true } : {}; // nt/sw: Software, schon vorab bezahlt → hier 0
    if (url) return { url, ...old };
    if (nm && tx) return { name: nm, text: tx, ...old };
    return null;
  }).filter(Boolean) as RemovedItem[];
  if (!removedItems.length) return reply.code(400).send({ ok: false, error: "keine gelöschten Bewertungen markiert" });
  removedItems.splice(0, removedItems.length, ...(await withOrderCp(b.orderId, removedItems)));
  removedItems.splice(0, removedItems.length, ...(await markSwDue(b.orderId, removedItems)));
  const submittedCount = Math.max(Number(b.submittedCount) || 0, removedItems.length);
  const currency = (clip(b.currency, 8) || "eur").toLowerCase();
  const count = removedItems.length;
  // Mengenrabatt nach der Gesamtzahl der beauftragten Bewertungen (Einzelabrechnung: anteilig).
  const quote = quoteReviews(removedItems, currency, submittedCount, "rest", await chatPctForOrder(b.orderId));
  const totalNum = quote.total;
  // Kunde hat beim Absenden PayPal/Wise (−10 %) gewählt → Löschbestätigung OHNE
  // Stripe-Link: rabattierter Betrag + PayPal-Hinweis (Link folgt, „Freunde & Familie")
  // bzw. Wise-Kontodaten (Railway-Variable WISE_BANK_DETAILS, Zeilen mit „|" oder
  // Zeilenumbruch getrennt — nie im Repo).
  const method = b.method === "paypal" || b.method === "wise" ? (b.method as "paypal" | "wise") : undefined;
  const bankLines = wiseBankFor(to); // Konto 1/2 je Kunde (Rotation) – gleiches Konto für alle Aufträge des Kunden
  if (method === "wise" && !bankLines.length) return reply.code(400).send({ ok: false, error: "Wise-Kontodaten fehlen (Railway-Variable WISE_BANK_DETAILS) — Mail nicht gesendet." });
  const payTotal = method ? fmtReviewMoney(Math.round(totalNum * 0.9), currency === "usd" ? "usd" : "eur") : "";
  // PayPal: Button „Jetzt mit PayPal senden" (PayPal.me mit Betrag + Währung, Freunde & Familie).
  const ppUrl = method === "paypal" ? `https://www.paypal.me/${(process.env.PAYPAL_ME || "rapidmax1").replace(/^.*paypal\.me\//i, "")}/${Math.round(totalNum * 0.9)}${currency === "usd" ? "USD" : "EUR"}` : "";

  // Zahlungslink auflösen: 1) hinterlegte Stückzahl-Tabelle, 2) bei Bedarf direkt
  // in Stripe anlegen (find-or-create über metadata-Marker — kein Setup-Lauf nötig),
  // 3) Notnagel Betrag-Match über bestehende Links.
  const curSafe = currency === "usd" ? "usd" as const : "eur" as const;
  let url = method ? "" : (quote.simple ? reviewsLinkFor(count, currency) : "");
  if (!method && !url && hasSecretKey()) {
    try { url = quote.simple ? await ensureReviewsLink(count, curSafe) : await ensureReviewsAmountLink(totalNum, curSafe); }
    catch (e) { app.log.error({ err: e }, "Reviews-Link anlegen fehlgeschlagen"); }
  }
  if (!method && !url && hasSecretKey()) {
    try { const m = await matchPaymentLink([{ amount: totalNum * 100, interval: "once" }]); url = m.url; }
    catch (e) { app.log.error({ err: e }, "Reviews-Link-Suche fehlgeschlagen"); }
  }
  if (!method && !url) return reply.code(400).send({ ok: false, error: hasSecretKey()
    ? `Zahlungslink für ${count} Bewertung(en) (${curSafe}) konnte nicht angelegt werden — ops-Log prüfen.`
    : "STRIPE_SECRET_KEY fehlt auf dem ops-Server — es kann kein Zahlungslink angelegt werden." });

  const orderId = clip(b.orderId, 40);
  const tlang = mailLang(b.lang);
  const per = quote.per;
  // Link mit client_reference_id → Zahlung landet im Kunden-Dashboard exakt bei diesen Bewertungen.
  const invPid = newPayId();
  const invUrl: string = url && orderId ? withRef(url, invPid) : (url || "");
  const total = quote.totalStr;
  try {
    const t = TEMPLATES["loeschbestaetigung-reviews"];
    const props = { lang: tlang, name: clip(b.name, 120), removedItems, submittedCount, per, total, payUrl: invUrl, method, payTotal, bankLines, ppUrl, orderId, dashUrl: await dashLink(to, tlang) };
    const html = await render(React.createElement(t.component, props as any));
    await sendMail({ to, subject: t.subject(props as any), html, replyTo: process.env.MAIL_REPLY_TO });
    const viaName = method === "wise" ? "Wise" : "PayPal";
    await insertEvent({ orderId: orderId || undefined, email: to, type: "pay",
      title: method ? `Löschbestätigung (Bewertungen, ${viaName}) gesendet` : "Löschbestätigung + Rechnung (Bewertungen) gesendet",
      detail: method
        ? `${count} von ${submittedCount} gelöscht · ${total} − 10 % = ${payTotal} via ${viaName}${method === "paypal" ? " · PayPal-Button (paypal.me) in der Mail" : " · Kontodaten in der Mail (" + (bankLines[0] || "") + ")"} · an ${to}`
        : `${count} von ${submittedCount} gelöscht · ${total} · fällig heute · an ${to}`,
      html, subject: t.subject(props as any) });
    // Welche Bewertungen abgerechnet wurden → Grundlage für die Mahnungen im Admin.
    if (orderId) await setOrderRawField(orderId, "reviewsRemoved", removedItems).catch(() => {});
    // Alle bisher gelöschten Bewertungen (fürs Kunden-Dashboard, über mehrere Teilrechnungen).
    if (orderId) {
      try {
        const prevR = await pool?.query(`SELECT raw->'reviewsRemovedAll' AS a FROM orders WHERE id=$1`, [orderId]);
        const prev: RemovedItem[] = Array.isArray(prevR?.rows[0]?.a) ? prevR!.rows[0].a : [];
        const k = (it: RemovedItem) => it.url || `${it.name || ""}|${it.text || ""}`;
        const seen = new Set(prev.map(k));
        await setOrderRawField(orderId, "reviewsRemovedAll", [...prev, ...removedItems.filter((it) => !seen.has(k(it)))]);
      } catch { /* ignore */ }
      if (url) await addOrderPayment(orderId, { id: invPid, kind: "invoice", amount: totalNum, cur: curSafe, url: invUrl, n: count, keys: removedItems.map(keyOf), via: "admin" }).catch(() => {});
    }
    // Die Löschbestätigung ist der Erledigt-Moment → GLÖSCHT-Hype-Push ans Team
    // (analog zum Profil-Zahlungslink). Den „gelöscht"-Status setzt der Admin direkt danach.
    if (orderId) await fireDeletionHypePush(orderId, clip(b.name, 120), to);
    return { ok: true, url, count, total, payTotal, method: method || null };
  } catch (e) {
    app.log.error({ err: e }, "Reviews-Rechnung fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin-Dashboard: Mahnung für einen Bewertungs-Auftrag (offene Löschbestätigungs-Rechnung).
// 3-stufig, Zahlung jeweils binnen 48 h; bei Stufe 3 drohen wir die Wiederveröffentlichung
// der gelöschten Bewertungen an (+ Inkasso). Event-Titel startet mit "Mahnung" → fließt in
// die mahnung_count-Zählung (LIKE 'Mahnung%'), genau wie bei Profil-Mahnungen.
app.post("/admin/reviews-mahnung", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  type RemovedItem = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean; cp?: number; due?: boolean };
  const rawRemoved: unknown[] = Array.isArray(b.removedItems) ? (b.removedItems as unknown[])
    : Array.isArray(b.removedUrls) ? (b.removedUrls as unknown[]) : [];
  const removedItems: RemovedItem[] = rawRemoved.slice(0, 40).map((raw) => {
    if (typeof raw === "string") { const u = httpUrl(raw, 400); return u ? { url: u } : null; }
    const o = (raw || {}) as Record<string, unknown>;
    const url = httpUrl(o.url, 400);
    const nm = clip(o.name, 80);
    const tx = clip(o.text, 400);
    const old = o.nt === true ? { nt: true } : o.sw === true ? { old: true, sw: true } : o.old === true ? { old: true } : {}; // nt/sw: Software, schon vorab bezahlt → hier 0
    if (url) return { url, ...old };
    if (nm && tx) return { name: nm, text: tx, ...old };
    return null;
  }).filter(Boolean) as RemovedItem[];
  if (!removedItems.length) return reply.code(400).send({ ok: false, error: "keine offenen Bewertungen ausgewählt" });
  removedItems.splice(0, removedItems.length, ...(await withOrderCp(b.orderId, removedItems)));
  removedItems.splice(0, removedItems.length, ...(await markSwDue(b.orderId, removedItems)));
  const stage = [1, 2, 3].includes(Number(b.stage)) ? Number(b.stage) : 1;
  const currency = (clip(b.currency, 8) || "eur").toLowerCase();
  const curSafe = currency === "usd" ? "usd" as const : "eur" as const;
  const count = removedItems.length;
  const quote = quoteReviews(removedItems, currency, Math.max(Number(b.submittedCount) || 0, count), "rest", await chatPctForOrder(b.orderId));
  const totalNum = quote.total;

  // PayPal/Wise-Kunde (10 % Rabatt): kein Stripe-Link, Mahnung verweist auf die gesendeten Zahlungsdaten.
  const method = b.method === "wise" ? "wise" : b.method === "paypal" ? "paypal" : undefined;
  const payTotal = method ? (currency === "usd" ? `$${Math.round(totalNum * 0.9).toLocaleString("en-US")}` : `${Math.round(totalNum * 0.9).toLocaleString("de-DE")} €`) : "";
  // Zahlungslink wie bei der Rechnung auflösen (Stückzahl-Tabelle → Stripe anlegen → Betrag-Match).
  let url = method ? "-" : quote.simple ? reviewsLinkFor(count, currency) : "";
  const isPreview = b.preview === true;
  if (!url && isPreview) url = "https://buy.stripe.com/"; // Vorschau: keinen Stripe-Link anlegen
  if (!url && hasSecretKey()) {
    try { url = quote.simple ? await ensureReviewsLink(count, curSafe) : await ensureReviewsAmountLink(totalNum, curSafe); }
    catch (e) { app.log.error({ err: e }, "Reviews-Mahnung-Link anlegen fehlgeschlagen"); }
  }
  if (!url && hasSecretKey()) {
    try { const m = await matchPaymentLink([{ amount: totalNum * 100, interval: "once" }]); url = m.url; }
    catch (e) { app.log.error({ err: e }, "Reviews-Mahnung-Link-Suche fehlgeschlagen"); }
  }
  if (!url) return reply.code(400).send({ ok: false, error: hasSecretKey()
    ? `Zahlungslink für ${count} Bewertung(en) (${curSafe}) konnte nicht angelegt werden — ops-Log prüfen.`
    : "STRIPE_SECRET_KEY fehlt auf dem ops-Server — es kann kein Zahlungslink angelegt werden." });

  const orderId = clip(b.orderId, 40);
  // Sprache der Bestellung (Deutsch ist enthalten, Sie-Form).
  const rawLang = mailLang(b.lang);
  const tlang = rawLang;
  const per = quote.per;
  const total = quote.totalStr;
  const STAGE_LABEL: Record<number, string> = { 1: "Zahlungserinnerung", 2: "2. Mahnung", 3: "Letzte Mahnung" };
  try {
    const t = TEMPLATES["mahnung-reviews"];
    const props = { lang: tlang, name: clip(b.name, 120), removedItems, per, total, payUrl: method ? "" : url, orderId, stage, method, payTotal };
    const html = await render(React.createElement(t.component, props as any));
    if (isPreview) return { ok: true, preview: true, html, subject: t.subject(props as any), url, count, total, stage };
    await sendMail({ to, subject: t.subject(props as any), html, replyTo: process.env.MAIL_REPLY_TO });
    await insertEvent({ orderId: orderId || undefined, email: to, type: "pay", title: `Mahnung (Bewertungen) gesendet · Stufe ${stage} (${STAGE_LABEL[stage]}${method ? ", " + (method === "wise" ? "Wise" : "PayPal") : ""})`, detail: `${count} Bewertung(en) · ${total} · Zahlung binnen 48 h · Sprache ${tlang.toUpperCase()} · an ${to}`, html, subject: t.subject(props as any) });
    return { ok: true, url, count, total, stage, lang: tlang };
  } catch (e) {
    app.log.error({ err: e }, "Reviews-Mahnung fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin-Dashboard: bezahlte Einmalzahlungen (Löschung/Reset, ohne Abos) aus Stripe
// den Bestellungen zuordnen → pay = "bezahlt". Per E-Mail ODER Name/Firma.
app.post("/admin/reconcile-payments", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!hasSecretKey()) return reply.code(400).send({ ok: false, error: "STRIPE_SECRET_KEY nicht gesetzt" });
  if (!dbReady()) return reply.code(400).send({ ok: false, error: "keine DB verbunden" });
  try {
    return await reconcilePaymentsOnce(app.log);
  } catch (e) {
    app.log.error({ err: e }, "Zahlungs-Abgleich fehlgeschlagen");
    return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
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
    // Mahnstufe 1–4 (nur für die Mahnung). Default 1 (freundliche Zahlungserinnerung).
    const stage = tplKey === "mahnung" ? ([1, 2, 3, 4].includes(Number(b.stage)) ? Number(b.stage) : 1) : undefined;
    const dueDate = tplKey === "mahnung" ? clip(b.dueDate, 40) || undefined : undefined; // Zahlungsziel abgelaufen (automatisch)
    const props = { lang: tlang, total: money, due, payUrl: url, protectionLabel: clip(b.protectionLabel, 160) || undefined, expressLabel: clip(b.expressLabel, 160) || undefined, service: service || undefined, stage, dueDate };
    const html = await render(React.createElement(t.component, props as any));
    // Vorschau (Admin neu): genau die Mail, wie sie der Kunde bekäme – ohne Versand/Protokoll.
    if (b.preview === true) return { ok: true, preview: true, html, subject: t.subject(props as any), url };
    await sendMail({ to, subject: t.subject(props as any), html, replyTo: process.env.MAIL_REPLY_TO });
    // Titel startet IMMER mit "Mahnung" (für die mahnung_count-Zählung via LIKE 'Mahnung%').
    const STAGE_LABEL: Record<number, string> = { 1: "Zahlungserinnerung", 2: "2. Erinnerung", 3: "Mahnung", 4: "Letzte Mahnung" };
    const title = tplKey === "mahnung" ? (dueDate ? `Mahnung gesendet · Zahlungsziel ${dueDateText(dueDate, "de")} abgelaufen (automatisch)` : `Mahnung gesendet · Stufe ${stage} (${STAGE_LABEL[stage as number] || ""})${b.auto === true ? " · automatisch" : ""}`) : "Zahlungslink gesendet";
    // Immer protokollieren – mit E-Mail UND (falls vorhanden) Order-ID. So bleibt der
    // Eintrag auch dann auffindbar, wenn keine orderId mitkam (E-Mail-Verknüpfung) und
    // erscheint im Kunden-Verlauf (der per E-Mail lädt) zuverlässig mit „Vorschau".
    await insertEvent({ orderId: orderId || undefined, email: to, type: "pay", title, detail: `${money} · ${service}${express ? "+express" : ""}|${protection} · an ${to}`, html, subject: t.subject(props as any) });

    // 🤑 Hype-Push fürs Team, wenn ein ECHTER Zahlungslink rausgeht (NICHT bei Mahnung/Storno).
    // `celebrate` kommt nur vom normalen "Zahlungslink senden"; Storno sendet celebrate=false.
    if (tplKey !== "mahnung" && (b.celebrate === true || b.celebrate === "true")) {
      await fireDeletionHypePush(orderId, String(b.name || ""), to);
    }

    return { ok: true, url };
  } catch (e) {
    app.log.error({ err: e }, "Zahlungslink-Mail fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 240) });
  }
});

// Admin: Zahlungsziel für Profil-Aufträge setzen/ändern/entfernen. Läuft es ohne Zahlung ab, geht SOFORT eine Mail
// mit Bezug auf das Zahlungsziel raus (Worker unten). Danach geht der normale Mahnverlauf (Admin „Mahnung senden") weiter.
// Neues Datum = neue Mail beim nächsten Ablauf.
app.post("/admin/pay-due", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!pool) return reply.code(503).send({ ok: false, error: "keine DB" });
  const id = clip(b.orderId, 40);
  const raw = String(b.due || "").trim();
  const at = raw ? new Date(raw) : null;
  if (at && isNaN(at.getTime())) return reply.code(400).send({ ok: false, error: "Datum ungültig" });
  // Nur Zukunft, max. 1 Jahr (Schutz vor Tippfehlern wie Jahr „0002" – sonst ginge sofort die Ablauf-Mail raus).
  if (at && (at.getTime() < Date.now() + 5 * 60e3 || at.getTime() > Date.now() + 366 * 864e5)) return reply.code(400).send({ ok: false, error: "Zahlungsziel muss in der Zukunft liegen (max. 1 Jahr)" });
  const r = await pool.query(`SELECT raw->'payDue' AS pd FROM orders WHERE id=$1 AND COALESCE(service,'') <> 'reviews'`, [id]);
  if (!r.rows[0]) return reply.code(404).send({ ok: false, error: "Profil-Auftrag nicht gefunden" });
  const prev = r.rows[0].pd as { at?: string } | null;
  const pd = at ? { at: at.toISOString(), set: new Date().toISOString(), sent: null, tries: 0 } : null;
  await setOrderRawField(id, "payDue", pd);
  const fmt = (iso: string) => new Date(iso).toLocaleString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vienna" });
  await insertEvent({ orderId: id, type: "pay", title: at ? (prev?.at ? `Zahlungsziel geändert → ${fmt(at.toISOString())}` : `Zahlungsziel gesetzt: ${fmt(at.toISOString())}`) : "Zahlungsziel entfernt", detail: prev?.at ? `vorher ${fmt(prev.at)}` : "im Admin gesetzt" }).catch(() => {});
  return { ok: true, payDue: pd };
});

/** Zahlungsziel abgelaufen → Mail (Stripe-Mahnung bzw. PayPal-/Wise-Mahnung mit Bezug aufs Zahlungsziel). Alle 2 Min. */
async function payDueTick(): Promise<void> {
  if (!pool) return;
  const r = await pool.query(`SELECT id, email, name, lang, country, service, amount, prot_amount, protection, form, raw FROM orders
     WHERE COALESCE(service,'') <> 'reviews' AND raw->'payDue'->>'at' IS NOT NULL AND raw->'payDue'->>'sent' IS NULL
       AND (raw->'payDue'->>'at')::timestamptz <= now() AND COALESCE(pay,'') <> 'paid' AND COALESCE(status,'') <> 'storniert'
       AND COALESCE((raw->'payDue'->>'tries')::int, 0) < 3 LIMIT 20`);
  for (const o of r.rows as Record<string, any>[]) {
    const raw = (o.raw || {}) as Record<string, any>;
    const pd = { ...(raw.payDue || {}) } as { at: string; tries?: number; sent?: string | null };
    const lang = mailLang(o.lang);
    const usd = o.country === "US";
    const amount = Number(o.amount) || 0, prot = o.protection && o.protection !== "none" ? Number(o.prot_amount) || 0 : 0;
    const express = raw.express === true || raw.express === "true";
    const paypal = String((o.form || {}).paypal || "").trim();
    const method = lang === "de" ? null : raw.payPref === "wise" ? "wise" : paypal || raw.payPref === "paypal" ? "paypal" : null;
    const c = usd ? "$" : "€";
    const payload = method
      ? { url: "/admin/send-template", body: { token: ADMIN_TOKEN, key: method === "wise" ? "wise-mahnung" : "paypal-mahnung", to: o.email, orderId: o.id, lang, name: o.name || "", service: o.service, stage: 1, dueDate: pd.at } }
      : { url: "/admin/paylink", body: { token: ADMIN_TOKEN, email: o.email, name: o.name, orderId: o.id, currency: usd ? "usd" : "eur", service: o.service, protection: o.protection || "none",
          serviceAmount: amount, protAmount: prot, protType: prot ? o.protection : "", total: amount + prot, express,
          expressLabel: express ? `Express-Bearbeitung (≤6 h)${raw.expressAmount ? " · +" + raw.expressAmount + " " + c : ""}` : undefined,
          lang, template: "mahnung", stage: 1, dueDate: pd.at } };
    try {
      const res = await app.inject({ method: "POST", url: payload.url, payload: payload.body, headers: { "content-type": "application/json" } });
      const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as { ok?: boolean; error?: string };
      if (res.statusCode >= 400 || !j.ok) throw new Error(j.error || "HTTP " + res.statusCode);
      await setOrderRawField(o.id, "payDue", { ...pd, sent: new Date().toISOString() });
      void notifyTeam(`Zahlungsziel abgelaufen · ${o.name || o.email}`, `Mail an den Kunden gesendet · Auftrag ${o.id} · danach normaler Mahnverlauf`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "pay" });
    } catch (e) {
      const tries = (pd.tries || 0) + 1;
      await setOrderRawField(o.id, "payDue", { ...pd, tries });
      app.log.error({ err: e, orderId: o.id }, "Zahlungsziel-Mail fehlgeschlagen");
      if (tries >= 3) {
        await insertEvent({ orderId: o.id, type: "note", title: "Zahlungsziel abgelaufen – Mail konnte nicht gesendet werden", detail: String((e as Error).message).slice(0, 200), auto: true }).catch(() => {});
        void notifyTeam(`Zahlungsziel-Mail fehlgeschlagen · ${o.name || o.email}`, `Auftrag ${o.id}: bitte Mahnung manuell senden`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "pay" });
      }
    }
  }
}

/* Automatische Mahnungen bei Profil-Aufträgen (Maximilian 08.10.2026: „die Auto-Mahnungen will ich haben").
 * Ablauf ab dem Zahlungslink: alle 48 h die nächste Stufe – 1 Zahlungserinnerung · 2 2. Erinnerung · 3 Mahnung.
 * Stufe 4 (Letzte Mahnung) und „An Inkasso übergeben" bleiben beim Team (Admin: Hauptbutton).
 * Zahlungsziel gesetzt → erst dessen Mail abwarten, danach geht es 48 h später weiter. Nur 8–20 Uhr Ortszeit.
 * Nur Aufträge, deren Zahlungslink ab 08.10.2026 rausging (kein Nachversand an den Bestand). Abschalten: AUTO_DUNNING=off. */
const DUN_GAP = 48 * 3600e3; // Zahlungsziel bei Profil-Löschungen: 48 h (Maximilian 08.10.2026)
const DUN_SINCE = () => new Date(process.env.AUTO_DUNNING_SINCE || "2026-10-08T00:00:00Z").getTime();
/** Admin (Mail-Verlauf): geplante automatische Mails eines Auftrags – Zahlungsziel, Auto-Mahnung (Profile),
 *  „Zahlungsart fehlt" und Nachfassen (Bewertungen). Mit Zeitpunkt (Versandfenster 8–20 Uhr Ortszeit berücksichtigt). */
app.post("/admin/next-mails", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
  const id = String(b.orderId || "").slice(0, 40);
  const r = await pool.query(`SELECT id, email, service, status, pay, country, raw, created_at FROM orders WHERE id=$1`, [id]);
  const o = r.rows[0] as Record<string, any> | undefined;
  if (!o) return reply.code(404).send({ ok: false, error: "nicht gefunden" });
  const raw = (o.raw || {}) as Record<string, any>;
  const out: { at?: string; title: string; note?: string; stopped?: boolean }[] = [];
  const tz = tzOf(o.country, raw.addr);
  if (o.status === "storniert") return { ok: true, items: [], info: "Auftrag storniert – keine automatischen Mails" };
  if (isTestEmail(o.email)) out.push({ title: "Testkonto", note: "Erinnerungen laufen im Minutentakt (Test)", stopped: true });
  if (o.service !== "reviews") {
    const pd = raw.payDue as { at?: string; sent?: string | null } | null;
    if (["paid", "refunded"].includes(String(o.pay || ""))) return { ok: true, items: [], info: "Bezahlt – keine Zahlungs-Mails mehr" };
    if (pd && pd.at && !pd.sent) out.push({ at: pd.at, title: "Zahlungsziel abgelaufen → Erinnerung mit Zahlungslink" });
    else if (o.status === "done" && (process.env.AUTO_DUNNING || "on").toLowerCase() !== "off" && o.pay !== "inkasso") {
      const ev = await pool.query(`SELECT title, created_at FROM events WHERE order_id=$1 AND (title LIKE 'Mahnung%' OR title LIKE 'Zahlungslink gesendet%' OR title LIKE 'PayPal%gesendet%' OR title LIKE 'Wise%gesendet%')`, [id]);
      const t = (x: { created_at: string }) => new Date(x.created_at).getTime();
      const link = ev.rows.filter((x) => !/^Mahnung/i.test(x.title)), mahn = ev.rows.filter((x) => /^Mahnung/i.test(x.title));
      const start = Math.min(...link.map(t), Infinity);
      if (Number.isFinite(start) && start >= DUN_SINCE()) {
        const level = Math.max(0, ...mahn.map((x) => Number((String(x.title).match(/Stufe\s*(\d)/) || [])[1] || 0))) || (mahn.length ? 1 : 0);
        const next = level + 1;
        if (next <= 3) out.push({ at: new Date(Math.max(Date.now(), nextDaytime(Math.max(start, ...mahn.map(t)) + DUN_GAP, tz))).toISOString(), title: ["", "Zahlungserinnerung", "2. Zahlungserinnerung", "Mahnung"][next] + ` (Stufe ${next})` });
        else out.push({ title: "Letzte Mahnung / Inkasso", note: "geht nicht automatisch – Hauptbutton im Auftrag", stopped: true });
      } else if (Number.isFinite(start)) out.push({ title: "Keine Auto-Mahnung", note: "Zahlungslink vor dem 08.10.2026 – Mahnungen manuell", stopped: true });
    }
  } else {
    const pg = await pgNextFor(String(o.email || "")).catch(() => null);
    if (pg) out.push(pg);
    for (const x of await followupNextFor(String(o.email || "")).catch(() => [])) out.push(x);
  }
  out.sort((a, b2) => (a.at ? new Date(a.at).getTime() : Infinity) - (b2.at ? new Date(b2.at).getTime() : Infinity));
  return { ok: true, items: out, tz };
});

async function payDunTick(): Promise<void> {
  if (!pool || (process.env.AUTO_DUNNING || "on").toLowerCase() === "off") return;
  const r = await pool.query(`SELECT id, email, name, lang, country, service, amount, prot_amount, protection, form, raw FROM orders
     WHERE COALESCE(service,'') NOT IN ('reviews','deindex') AND status='done' AND COALESCE(pay,'') NOT IN ('paid','refunded','inkasso')
       AND COALESCE(email,'') <> '' AND created_at > now() - interval '120 days' LIMIT 300`);
  for (const o of r.rows as Record<string, any>[]) {
    try {
      if (isTestEmail(o.email)) continue;
      const raw = (o.raw || {}) as Record<string, any>;
      const ev = await pool.query(`SELECT title, created_at FROM events WHERE order_id=$1 AND (title LIKE 'Mahnung%' OR title LIKE 'Zahlungslink gesendet%' OR title LIKE 'PayPal%gesendet%' OR title LIKE 'Wise%gesendet%')`, [o.id]);
      const ts = (x: { created_at: string }) => new Date(x.created_at).getTime();
      const link = ev.rows.filter((x) => !/^Mahnung/i.test(x.title));
      const mahn = ev.rows.filter((x) => /^Mahnung/i.test(x.title));
      const start = Math.min(...link.map(ts), Infinity);
      if (!Number.isFinite(start) || start < DUN_SINCE()) continue;           // kein Zahlungslink oder Altbestand
      const pd = raw.payDue as { at?: string; sent?: string | null } | null;
      if (pd && pd.at && !pd.sent) continue;                                  // Zahlungsziel läuft noch → dessen Mail zuerst
      const level = Math.max(0, ...mahn.map((x) => Number((String(x.title).match(/Stufe\s*(\d)/) || [])[1] || 0))) || (mahn.length ? 1 : 0);
      const next = level + 1;
      if (next > 3) continue;                                                 // Stufe 4 + Inkasso: Team
      const last = Math.max(start, ...mahn.map(ts));
      if (Date.now() < last + DUN_GAP) continue;
      if (!quietOk(tzOf(o.country, raw.addr))) continue;
      const lang = mailLang(o.lang);
      const usd = o.country === "US";
      const amount = Number(o.amount) || 0, prot = o.protection && o.protection !== "none" ? Number(o.prot_amount) || 0 : 0;
      const express = raw.express === true || raw.express === "true";
      const paypal = String((o.form || {}).paypal || "").trim();
      const method = lang === "de" ? null : raw.payPref === "wise" ? "wise" : paypal || raw.payPref === "paypal" ? "paypal" : null;
      const payload = method
        ? { url: "/admin/send-template", body: { token: ADMIN_TOKEN, key: method === "wise" ? "wise-mahnung" : "paypal-mahnung", to: o.email, orderId: o.id, lang, name: o.name || "", service: o.service, stage: next, auto: true } }
        : { url: "/admin/paylink", body: { token: ADMIN_TOKEN, email: o.email, name: o.name, orderId: o.id, currency: usd ? "usd" : "eur", service: o.service, protection: o.protection || "none",
            serviceAmount: amount, protAmount: prot, protType: prot ? o.protection : "", total: amount + prot, express,
            expressLabel: express ? `Express-Bearbeitung (≤6 h)${raw.expressAmount ? " · +" + raw.expressAmount + " " + (usd ? "$" : "€") : ""}` : undefined,
            lang, template: "mahnung", stage: next, auto: true } };
      const res = await app.inject({ method: "POST", url: payload.url, payload: payload.body, headers: { "content-type": "application/json" } });
      const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as { ok?: boolean; error?: string };
      if (res.statusCode >= 400 || !j.ok) throw new Error(j.error || "HTTP " + res.statusCode);
      await pool.query(`UPDATE orders SET pay='mahnung' WHERE id=$1 AND COALESCE(pay,'') NOT IN ('paid','refunded','inkasso')`, [o.id]);
      app.log.info({ orderId: o.id, stage: next }, "Auto-Mahnung gesendet");
      if (next === 3) void notifyTeam(`Auto-Mahnung Stufe 3 · ${o.name || o.email}`, `Auftrag ${o.id} · als Nächstes: Letzte Mahnung (von euch)`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "pay" });
    } catch (e) { app.log.error({ err: e, orderId: o.id }, "Auto-Mahnung fehlgeschlagen"); }
  }
}

// Admin-Dashboard: Gamification-Leaderboard (Lösch-Counter, Ränge, Achievements).
// Wird live aus den Bestellungen (status=done, echte Löschung) abgeleitet – Vergangenheit inklusive.
app.post("/admin/gamification", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!dbReady()) return { ok: true, db: false, board: null };
  try {
    // Lösch-Liga + eigener Reviews-Reiter (vergebene Bewertungs-Aufträge, Netto −50 je Bestellung).
    return { ok: true, db: true, board: buildBoard(await deletionsForGamification()), reviews: buildReviewsBoard(await reviewsForGamification()) };
  } catch (e) {
    app.log.error({ err: e }, "Gamification-Abruf fehlgeschlagen");
    return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
  }
});

// Admin-Dashboard: eine echte (gebrandete) Vorlage an den Kunden senden
app.post("/admin/send-template", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const to = String(b.to || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return reply.code(400).send({ ok: false, error: "invalid recipient" });
  const key = clip(b.key, 60);
  const t = TEMPLATES[key];
  if (!t) return reply.code(400).send({ ok: false, error: "unknown template" });
  const orderId = clip(b.orderId, 40);
  try {
    const tlang = mailLang(b.lang);
    // „PayPal-Vorteil" ist NUR außerhalb DACH vorgesehen – serverseitige Sperre (der
    // Admin blendet die Vorlage für DE-Bestellungen ohnehin aus).
    if ((key === "paypal-angebot" || key === "paypal-erinnerung" || key === "paypal-zahlung-bestaetigt" || key === "paypal-mahnung" || key === "wise-mahnung") && tlang === "de")
      return reply.code(400).send({ ok: false, error: "Diese Vorlage ist nur außerhalb DACH vorgesehen." });
    // Mahnstufe 1–4 (nur PayPal-Mahnung). Default 1 (freundliche Zahlungserinnerung).
    const isPayMahnung = key === "paypal-mahnung" || key === "wise-mahnung";
    const stage = isPayMahnung ? ([1, 2, 3, 4].includes(Number(b.stage)) ? Number(b.stage) : 1) : undefined;
    const props = {
      ...(t.sample as object), lang: tlang,
      name: clip(b.name, 120) || undefined,            // persönliche Anrede (z. B. „Hallo Alex,")
      company: clip(b.company, 160) || undefined,      // Unternehmens-/Profilname (z. B. Rückgewinnung)
      hasSub: b.hasSub === true || b.hasSub === "true", // laufender Schutz (Abo) → Bündel-Angebot
      hasProtection: b.hasProtection === true || b.hasProtection === "true", // Schutz gebucht → „Schutz aktiv"
      offer: (b.offer && typeof b.offer === "object") ? b.offer : undefined, // berechnete Ersparnis (Beträge)
      service: clip(b.service, 40) || undefined,       // „reset" → Mahnung droht mit Wiederherstellung der Bewertungen
      stage,                                            // PayPal-Mahnstufe (1–4)
      dueDate: isPayMahnung ? clip(b.dueDate, 40) || undefined : undefined, // Zahlungsziel abgelaufen (automatisch)
      formUrl: orderId ? SITE_URL + "/auftrag/" + orderId : undefined,
    };
    const { html, subject } = await renderTemplate(key, props as any);
    if (b.preview === true) return { ok: true, preview: true, html, subject };
    await sendMail({ to, subject, html, replyTo: process.env.MAIL_REPLY_TO });
    // Titel der PayPal-Mahnung startet mit „Mahnung" (für die Mahnstufen-Zählung via /mahnung/i).
    const PP_STAGE_LABEL: Record<number, string> = { 1: "Zahlungserinnerung", 2: "2. Erinnerung", 3: "Mahnung", 4: "Letzte Mahnung" };
    const evtTitle = isPayMahnung && b.dueDate
      ? `Mahnung gesendet · Zahlungsziel ${dueDateText(clip(b.dueDate, 40), "de")} abgelaufen (${key === "wise-mahnung" ? "Wise" : "PayPal"}, automatisch)`
      : isPayMahnung
      ? `Mahnung gesendet · Stufe ${stage} (${key === "wise-mahnung" ? "Wise" : "PayPal"}, ${PP_STAGE_LABEL[stage as number] || ""})${b.auto === true ? " · automatisch" : ""}`
      : t.label + " gesendet";
    // Auch ohne orderId protokollieren (z. B. Rückgewinnung an einen Prüfungs-Lead):
    // der Eintrag bleibt über die E-Mail auffindbar (Kunden-Verlauf lädt per E-Mail).
    await insertEvent({ orderId: orderId || undefined, email: to, type: "mail", title: evtTitle, detail: "an " + to, html, subject });
    // Rückgewinnung an einen Prüfungs-Lead: Sende-Zeitpunkt am Check vermerken, damit im
    // Admin dauerhaft „Angebot gesandt am …" erscheint (überlebt Reload/Neu-Laden).
    if (key === "rueckgewinnung") { const cid = clip(b.checkId, 40); if (cid) await markCheckRueckgewinnung(cid); }
    // PayPal-Angebot ist der „Profil gelöscht + Zahlung angestoßen"-Schritt (außerhalb DACH)
    // → dieselbe Team-Hype-Push wie beim Zahlungslink-Versand.
    if (key === "paypal-angebot") await fireDeletionHypePush(orderId, clip(b.name, 120), to);
    return { ok: true };
  } catch (e) {
    app.log.error({ err: e }, "send-template fehlgeschlagen");
    return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) });
  }
});

// Admin-Dashboard: Aktivitäts-Verlauf einer Bestellung
// Datenreport: nur aggregierte Kennzahlen (Sterne, Bewertungsanzahl, Branchen) – keine Personendaten.
app.post("/admin/report-stats", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  if (!dbReady()) return { ok: false, error: "Keine Datenbank verbunden." };
  const stats = await reportStats();
  return { ok: true, generatedAt: new Date().toISOString(), ...stats };
});

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

// Sammel-Zahlungsbestätigung: 25 s warten, alle in der Zeit bezahlt markierten Aufträge des Kunden (gleiche Methode) bündeln.
const paidQueue = new Map<string, { ids: Set<string>; t: ReturnType<typeof setTimeout> }>();
function queuePaidConfirm(id: string) {
  if (!pool) return;
  void (async () => {
    const r = await pool!.query(`SELECT email, raw->>'payPref' AS pp FROM orders WHERE id=$1 AND service='reviews'`, [id]);
    const o = r.rows[0];
    if (!o || !o.email || !["wise", "paypal"].includes(String(o.pp))) return;
    const key = String(o.email).toLowerCase() + "|" + o.pp;
    const q = paidQueue.get(key);
    if (q) { q.ids.add(id); clearTimeout(q.t); q.t = setTimeout(() => void flushPaidConfirm(key), 25000); return; }
    paidQueue.set(key, { ids: new Set([id]), t: setTimeout(() => void flushPaidConfirm(key), 25000) });
  })().catch((e) => app.log.error({ err: e }, "Zahlungsbestätigung: Vormerken fehlgeschlagen"));
}
async function flushPaidConfirm(key: string) {
  const q = paidQueue.get(key);
  paidQueue.delete(key);
  if (!q || !pool) return;
  try {
    const ids: string[] = [];
    for (const id of q.ids) {
      const done = await pool.query(`SELECT 1 FROM events WHERE order_id=$1 AND title LIKE 'Zahlungsbestätigung (%' LIMIT 1`, [id]);
      const still = await pool.query(`SELECT 1 FROM orders WHERE id=$1 AND pay='paid'`, [id]).catch(() => ({ rowCount: 1 }));
      if (!done.rowCount && still.rowCount) ids.push(id);
    }
    if (!ids.length) return;
    ids.sort();
    const r = await pool.query(`SELECT email, name, lang, raw->>'payPref' AS pp FROM orders WHERE id=$1`, [ids[0]]);
    const o = r.rows[0];
    if (!o) return;
    const via = o.pp === "wise" ? "Wise" : "PayPal";
    const props = { lang: mailLang(o.lang), name: o.name || "", via: via as "Wise" | "PayPal", orderId: ids[0], orderIds: ids, dashUrl: await dashLink(o.email, o.lang) };
    const html = await render(React.createElement(ZahlungErhaltenReviews, props));
    const subject = zahlungErhaltenSubject(props);
    await sendMail({ to: o.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
    for (const id of ids) await insertEvent({ orderId: id, email: o.email, type: "mail", title: `Zahlungsbestätigung (${via}) gesendet`, detail: `automatisch nach „bezahlt"${ids.length > 1 ? ` · Sammelbestätigung für ${ids.join(", ")}` : ""} · an ${o.email}`, html, subject, auto: true });
  } catch (e) { app.log.error({ err: e }, "Zahlungsbestätigung Wise/PayPal fehlgeschlagen"); }
}

/** Chat-Rabatt einer Bestellung (0 bei PayPal/Wise – der höhere Rabatt gilt). */
async function chatPctForOrder(orderId: unknown): Promise<number> {
  const id = clip(orderId, 40);
  if (!id || !pool) return 0;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [id]).catch(() => ({ rows: [] as { raw: unknown }[] }));
  return chatPctOf(r.rows[0]?.raw);
}

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
  void sendPurchaseForOrder(id, app.log); // Löschung bestätigt + bezahlt → Meta melden
  void partnerOrderStatus(id, status).catch((e) => app.log.error({ err: e }, "Partner-Board: Storno-Abgleich fehlgeschlagen"));
  if (pay === "paid") void markOrderReviewsPaidManual(id).catch(() => {});
  // Profil gelöscht + Kunde zahlt automatisch → sofort von der hinterlegten Zahlungsart abbuchen (Rechnung per Mail).
  if (status === "done" && pay !== "paid") void chargeProfileOrder(id).then((r) => { if (r?.ok) { void sendPurchaseForOrder(id, app.log); void scheduleProtectionUpsell(id, app.log).catch(() => {}); } }).catch((e) => app.log.error({ err: e }, "Profil-Abbuchung fehlgeschlagen"));
  // Wise-/PayPal-Zahler (Einzelbewertungen): Zahlungsbestätigung automatisch, sobald „bezahlt" gesetzt wird (je Auftrag nur 1×).
  // Mehrere Aufträge desselben Kunden, die kurz hintereinander auf bezahlt gehen (eine Sammelüberweisung) → EINE Mail.
  if (pay === "paid") queuePaidConfirm(id);
  if (pay === "paid") void scheduleProtectionUpsell(id, app.log).catch(() => {}); // Profil-Löschung bezahlt (z. B. PayPal/Wise) → Schutz-Hinweis in 2 Tagen
  const label = clip(b.label, 80) || status;
  // noEvent=true → nur Status/Zahlung persistieren, KEIN „Status → …"-Eintrag (z. B. wenn
  // beim Zahlungslink-/Mahnung-Versand der Auftrag bereits „done" ist → kein erneutes
  // „Profil gelöscht" pro Sendung; der Status wird nur einmal protokolliert).
  if (b.noEvent !== true && b.noEvent !== "true")
    await insertEvent({ orderId: id, type: "status", title: `Status → ${label}`, detail: pay ? `Zahlung: ${pay} · im Dashboard gesetzt` : "im Dashboard gesetzt" });
  return { ok: true };
});

// Admin: fälschlich (automatisch) erfasste Zahlung korrigieren → pay zurück auf 'pending'
// und Auto-Zuordnung für diesen Auftrag sperren, damit Webhook/Reconciler ihn nicht erneut
// als bezahlt markieren. Danach lässt sich wieder ein Zahlungslink senden.
app.post("/admin/order-correct-pay", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = clip(b.orderId, 40);
  if (!id) return reply.code(400).send({ ok: false, error: "orderId erforderlich" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const ok = await correctOrderPayment(id);
  if (!ok) return reply.code(404).send({ ok: false, error: "Bestellung nicht gefunden" });
  await insertEvent({ orderId: id, type: "pay", title: "Zahlung als unbezahlt markiert (Korrektur)", detail: "Fälschlich erfasste Zahlung zurückgesetzt · automatische Zuordnung für diesen Auftrag deaktiviert" });
  return { ok: true };
});

// Admin: Zahlung MANUELL als eingegangen erfassen (z. B. PayPal/Überweisung außerhalb
// Stripe) → pay = 'paid', Status bleibt unverändert. Sonst bliebe der Auftrag ewig „offen",
// weil der automatische Stripe-Abgleich diese Zahlung nie sieht.
app.post("/admin/order-mark-paid", async (req, reply) => {
  const b = (req.body || {}) as Record<string, unknown>;
  if (!ADMIN_TOKEN || String(b.token || "") !== ADMIN_TOKEN) return reply.code(401).send({ ok: false, error: "unauthorized" });
  const id = clip(b.orderId, 40);
  if (!id) return reply.code(400).send({ ok: false, error: "orderId erforderlich" });
  if (!dbReady()) return reply.code(503).send({ ok: false, error: "keine DB verbunden" });
  const method = clip(b.method, 40); // optionaler Hinweis, z. B. „PayPal"
  const ok = await markOrderPaidById(id);
  if (!ok) return reply.code(404).send({ ok: false, error: "Bestellung nicht gefunden" });
  void markOrderReviewsPaidManual(id).catch(() => {}); // Kunden-Dashboard: abgerechnete Bewertungen → „Paid"
  void sendPurchaseForOrder(id, app.log);
  await insertEvent({ orderId: id, type: "pay", title: "Zahlung eingegangen (manuell erfasst)", detail: method ? `Manuell im Dashboard als bezahlt markiert · ${method}` : "Manuell im Dashboard als bezahlt markiert" });
  return { ok: true };
});

// Monitor: Überwachung gelöschter Profile (Admin → Monitor), eigene Routen in monitor.ts.
registerMonitor(app, (t) => !!ADMIN_TOKEN && String(t || "") === ADMIN_TOKEN);

const port = Number(process.env.PORT) || 3000;
async function start() {
  try { await initDb(); await initPartnerTables(); await initPartnerStats().catch((e) => app.log.error({ err: e }, "Partner-Statistik: Init fehlgeschlagen")); await initCustomerTables(); await initPartnerAuth(); await initPartnerPush(); await initPartnerRegistry().catch((e) => app.log.error({ err: e }, "Partner-Registrierung: Init fehlgeschlagen")); await initPasskeys(); await initCustPush();
    if (dbReady()) void seedPartnerAccount((m) => app.log.info(m)).catch((e) => app.log.error({ err: e }, "Partner-Login anlegen fehlgeschlagen"));
    // Bestehende Zahlungslinks: Rechnung + Firmenname/Adresse/UID (idempotent, im Hintergrund).
    void upgradeReviewLinks((m) => app.log.warn(m)).then((r) => app.log.info(r, "Zahlungslinks: Rechnung + Firmendaten")).catch((e) => app.log.error({ err: e }, "Zahlungslinks umstellen fehlgeschlagen"))
      .then(() => enableInvoicesAllLinks((m) => app.log.warn(m))).then((r) => r && app.log.info(r, "Alle Zahlungslinks: Rechnung an")).catch((e) => app.log.error({ err: e }, "Rechnung für alle Zahlungslinks fehlgeschlagen"));
    if (dbReady()) void runRv60BackfillOnce((m) => app.log.info(m)).catch((e) => app.log.error({ err: e }, "Partner-Nachtrag 60 USD fehlgeschlagen")); if (dbReady()) app.log.info("DB verbunden, Tabellen bereit"); }
  catch (e) { app.log.error({ err: e }, "DB-Init fehlgeschlagen – Backend läuft ohne DB weiter"); }
  try {
    const addr = await app.listen({ host: "0.0.0.0", port });
    app.log.info(`ops läuft auf ${addr}`);
    startUpsellWorker(app);
    // Kunden-Dashboard: Sammel-Mails („Neuigkeiten im Dashboard") 5 Min. nach der letzten Partner-Änderung.
    setInterval(async () => {
      try {
        // Gegen Mail-Flut: je Kunde EINE Sammel-Mail (alle Aufträge zusammen), und nur bei Wichtigem
        // (gelöscht → zahlen, nicht löschbar, Entscheidung nötig). Alles andere (in Prüfung → in Arbeit …)
        // sieht der Kunde im Dashboard + per Push, falls die App am Home-Bildschirm ist.
        const MAIL_WORTHY = new Set(["removed", "notpossible", "software"]);
        const byEmail = new Map<string, Awaited<ReturnType<typeof takeDueNotifications>>>();
        for (const n of await takeDueNotifications()) {
          if (!n.changed.length) continue;
          const k = n.email.toLowerCase();
          byEmail.set(k, [...(byEmail.get(k) || []), n]);
        }
        for (const group of byEmail.values()) {
          const n = group[0];
          const changed = group.flatMap((g) => g.changed);
          const lang = n.lang;
          // Push ging schon sofort bei der Änderung raus (partner.ts → pushCustomerNow).
          // Bestätigte Software-Fälle (Kunde hat bei der Bestellung zugestimmt) → eigene Zahlungsaufforderung mit 5-Std.-Frist.
          const prePay = group.flatMap((g) => g.changed.filter((c) => c.status === "software" && c.pre).map((c) => ({ ...c, g })));
          if (prePay.length) {
            try {
              const cur = prePay[0].g.cur;
              const same = prePay.filter((x) => x.g.cur === cur);
              const amount = fmtReviewMoney(same.reduce((s0, x) => s0 + (Number(x.g.swDeposit) || 0), 0), cur);
              const url = await dashLink(n.email, n.lang);
              const props = { lang, name: n.name, dashUrl: url + (url.includes("?") ? "&" : "?") + "open=software", orderId: new Set(same.map((x) => x.g.orderId)).size === 1 ? same[0].g.orderId : undefined, n: same.length, amount };
              const html = await render(React.createElement(KundenSoftwarePayReviews as any, props as any));
              const subject = kundenSoftwarePaySubject(props as any);
              await sendMail({ to: n.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
              for (const oid of new Set(same.map((x) => x.g.orderId))) await insertEvent({ orderId: oid, email: n.email, type: "mail", title: "Software bestätigt – Zahlungsaufforderung (5 Std.) gesendet", detail: same.map((x) => x.name || x.url).join(" · "), html, subject, auto: true }).catch(() => {});
            } catch (e) { app.log.error({ err: e }, "Software-Zahlungsaufforderung fehlgeschlagen"); }
          }
          const important = changed.filter((c) => MAIL_WORTHY.has(c.status) && !(c.status === "software" && c.pre));
          if (!important.length) {
            for (const g of group) await insertEvent({ orderId: g.orderId, email: g.email, type: "note", title: "Statusänderung nur im Dashboard/Push (keine Mail)", detail: g.changed.map((c) => `${c.name || c.url}: ${c.status}`).join(" · "), auto: true }).catch(() => {});
            continue;
          }
          try {
            // Fortschritt (Balken, offener Betrag, ggf. Zwischenzahlung) nur bei einem Auftrag je Mail.
            const props = { lang, name: n.name, dashUrl: await dashLink(n.email, n.lang), orderId: group.length === 1 ? n.orderId : undefined, changed: important, cur: n.cur, swPrice: n.swPrice, swDeposit: n.swDeposit, progress: group.length === 1 ? n.progress : null };
            // „Nur mit Spezial-Software löschbar" → kurze Mail ohne Details („gute Nachricht, Update") – entschieden wird im Dashboard.
            const swMail = important.some((c) => c.status === "software");
            // Software-Mail: Link öffnet im Dashboard direkt die Schritt-für-Schritt-Entscheidung (?open=software).
            if (swMail) props.dashUrl += (props.dashUrl.includes("?") ? "&" : "?") + "open=software";
            const html = await render(React.createElement((swMail ? KundenSoftwareReviews : KundenUpdateReviews) as any, props as any));
            const subject = swMail ? kundenSoftwareSubject(props as any) : kundenUpdateSubject(props as any);
            await sendMail({ to: n.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
            // Nachweis: diese Bewertungen sind jetzt zur Zahlung aufgefordert (Admin: kein „Rechnung senden" mehr; Sicherheitsnetz).
            for (const g of group) { const ks = g.changed.filter((c) => c.status === "removed").map((c) => c.key); if (ks.length) await markPayRequested(g.orderId, ks).catch((e) => app.log.error({ err: e }, "Zahlungsaufforderung vermerken fehlgeschlagen")); }
            for (const g of group) await insertEvent({ orderId: g.orderId, email: g.email, type: "mail", title: "Dashboard-Update an Kunden gesendet (automatisch)", detail: important.map((c) => `${c.name || c.url}: ${c.status}`).join(" · "), html, subject, auto: true });
          } catch (e) {
            app.log.error({ err: e }, "Dashboard-Sammelmail fehlgeschlagen – neuer Versuch in 15 Min.");
            for (const g of group) await requeueNotify(g.orderId, g.keys, 15).catch(() => {});
          }
        }
      } catch (e) { app.log.error({ err: e }, "Dashboard-Sammelmail fehlgeschlagen"); }
    }, 60_000);
    startPaymentReconciler(app);
    // Profil-Aufträge: automatische Mahnungen (Stufe 1–3, alle 48 h) – Prüfung alle 15 Min.
    setInterval(() => void payDunTick().catch((e) => app.log.error({ err: e }, "Auto-Mahnungen fehlgeschlagen")), 15 * 60_000);
    // Zahlungsziel (Profil-Aufträge) abgelaufen → Mail sofort (Prüfung alle 2 Min.).
    setInterval(() => void payDueTick().catch((e) => app.log.error({ err: e }, "Zahlungsziel-Prüfung fehlgeschlagen")), 2 * 60_000);
    // Dashboard-Zahlungen (Rechnung / Software-Vorauszahlung) direkt bei Stripe abgleichen – falls der Webhook nichts zuordnet.
    const payPoll = () => void pollReviewPayments((o, m) => app.log.info(o as object, m)).catch((e) => app.log.error({ err: e }, "Stripe-Abgleich Dashboard-Zahlungen fehlgeschlagen"));
    setTimeout(payPoll, 30_000); setInterval(payPoll, 2 * 60_000);
    startFollowupWorker(app);
    startPgRemindWorker(app); // „Zahlungsart fehlt noch" – mehrmals täglich (8–20 Uhr Ortszeit), max. 9×, dann Team-Push
    // Sicherheitsnetz: gelöscht, aber keine Zahlungsaufforderung raus → nachholen (alle 10 Min., erster Lauf nach 2 Min.).
    const guard = () => void payRequestGuard((o, m) => app.log.info(o as object, m)).catch((e) => app.log.error({ err: e }, "Sicherheitsnetz Zahlungsaufforderung fehlgeschlagen"));
    setTimeout(guard, 2 * 60_000); setInterval(guard, 10 * 60_000);
    // Zwischenzahlung: pausierte Aufträge freigeben, sobald bezahlt (alle 10 Min.; Stripe/Admin lösen es meist schon direkt aus).
    setInterval(() => void payHoldSweep().catch((e) => app.log.error({ err: e }, "Zwischenzahlung-Prüfung fehlgeschlagen")), 10 * 60_000);
    // Partner-Auszahlungen: 1× täglich (Payoneer) + Status gesendeter Auszahlungen nachziehen.
    setInterval(() => void payoutTick((m) => app.log.info(m)).catch((e) => app.log.error({ err: e }, "Partner-Auszahlung fehlgeschlagen")), 10 * 60_000);
    // Datenschutz: hochgeladene Inhaber-Nachweise 30 Tage nach dem Upload automatisch löschen (Ergebnis/Vermerk bleibt im Verlauf).
    const purgeDocs = () => void pool?.query(`DELETE FROM cust_verify_docs WHERE created_at < now() - interval '30 days'`)
      .then((r) => { if (r.rowCount) app.log.info({ n: r.rowCount }, "Inhaber-Nachweise gelöscht (älter als 30 Tage)"); }).catch(() => {});
    setTimeout(purgeDocs, 5 * 60_000); setInterval(purgeDocs, 6 * 3600_000);
    // Automatisch bezahlen: fehlgeschlagene Abbuchung nach 24 h / 48 h nochmal versuchen (Prüfung alle 30 Min.).
    setInterval(() => void retryTick((o, m) => app.log.info(o as object, m)).catch((e) => app.log.error({ err: e }, "Abbuchung-Wiederholung fehlgeschlagen")), 30 * 60_000);
    // Bestätigte Software-Fälle: ca. 1 Std. vor Ablauf der 5-Std.-Frist einmal erinnern (je Bewertung nur 1×).
    setInterval(() => void (async () => {
      if (!pool) return;
      try {
        await pool.query(`CREATE TABLE IF NOT EXISTS sw_pay_reminders (order_id text NOT NULL, item_key text NOT NULL, sent_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (order_id, item_key))`);
        const r = await pool.query(`SELECT DISTINCT lower(email) AS email FROM orders WHERE service='reviews' AND raw ? 'reviewsSwConfirmed' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '60 days'`);
        const now = Date.now();
        for (const row of r.rows as { email: string }[]) {
          const d = await loadCustomerOrders(row.email);
          const due = d.orders.flatMap((o) => (o.items || []).filter((i) => i.status === "software" && i.swDue).map((i) => ({ o, i, t: new Date(String(i.swDue)).getTime() })))
            .filter((x) => now >= x.t - 3600e3 && now < x.t);
          if (!due.length) continue;
          const fresh = [];
          for (const x of due) {
            const ins = await pool.query(`INSERT INTO sw_pay_reminders (order_id, item_key) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING order_id`, [x.o.id, x.i.key]);
            if (ins.rowCount) fresh.push(x);
          }
          if (!fresh.length) continue;
          const cur = fresh[0].o.cur;
          const same = fresh.filter((x) => x.o.cur === cur);
          const amount = fmtReviewMoney(same.reduce((s0, x) => s0 + (Number(x.o.swDeposit) || 0), 0), cur);
          const url = await dashLink(row.email, d.lang);
          const props = { lang: mailLang(d.lang), name: d.name, dashUrl: url + (url.includes("?") ? "&" : "?") + "open=software", n: same.length, amount, reminder: true };
          const html = await render(React.createElement(KundenSoftwarePayReviews as any, props as any));
          const subject = kundenSoftwarePaySubject(props as any);
          await sendMail({ to: row.email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
          for (const oid of new Set(same.map((x) => x.o.id))) await insertEvent({ orderId: oid, email: row.email, type: "mail", title: "Software-Zahlung: Erinnerung 1 Std. vor Fristende gesendet", detail: same.map((x) => x.i.name || x.i.url).join(" · "), html, subject, auto: true }).catch(() => {});
        }
      } catch (e) { app.log.error({ err: e }, "Software-Zahlungs-Erinnerung fehlgeschlagen"); }
    })(), 5 * 60_000);
    startPartnerReminders((o, m) => app.log.info(o, m)); // stündlich: „Customer waiting for order confirmation"
    // Einmalige Team-Push: neues Admin-Dashboard ist live (nur 1×, Merker in ops_flags; 3 Min. Verzögerung, bis die Website deployt ist).
    setTimeout(() => void (async () => {
      try {
        if (!pool) return;
        await pool.query(`CREATE TABLE IF NOT EXISTS ops_flags (key text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now())`);
        const r = await pool.query(`INSERT INTO ops_flags (key) VALUES ('announce-admin-v2') ON CONFLICT DO NOTHING RETURNING key`);
        if (r.rowCount) await notifyTeam("Das neue Dashboard ist da! 🚀", "Schau es dir jetzt an", `${process.env.SITE_URL || "https://www.rapid-remove.com"}/admin`, { tag: "rr-admin-v2", kind: "info" });
      } catch (e) { app.log.error({ err: e }, "Ankündigungs-Push fehlgeschlagen"); }
    })(), 3 * 60_000);     // Nachfassen: alle 10 Min., Versand nur 8–20 Uhr Ortszeit des Kunden
    startLeadEnrichWorker(app);   // Auto-E-Mail-Recherche (aktiv nur mit GOOGLE_MAPS_API_KEY)
    // Bewertungs-Screenshots der letzten 14 Tage nachholen (nur mit SCREENSHOTONE_KEY;
    // fehlende werden ergänzt, vorhandene übersprungen). 20 s Verzögerung nach dem Start.
    if (shotKey()) setTimeout(() => { void backfillReviewShots(14, (o, m) => app.log.info(o, m)); }, 20_000);
    startMonitorScheduler(app);   // Monitor: täglicher Scan 05:00 (Wien)
  } catch (err) { app.log.error(err); process.exit(1); }
}
start();
