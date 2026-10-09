/* Nachbestellung: Bewertungen zu einem bestehenden Bewertungs-Auftrag hinzufügen.
 *   Admin  – POST /admin/orders/add-reviews (Liste des Profils oder Links; Zahlungsart-Pflicht wählbar)
 *   Kunde  – POST /cust/orders/reviews (Bewertungen seines Profils, 1–3 ★) + POST /cust/orders/add (nur IDs aus dieser Liste)
 * Ablauf: neue Bewertungen an reviewItems anhängen (Duplikate raus) → ggf. Zahlungsart-Pflicht NUR für die neuen
 * (payGate.keys; laufende Bewertungen laufen weiter) → sonst sofort aufs Partner-Board („Review added") →
 * Bestätigung an den Kunden („Bewertung hinzugefügt", gleiche Bedingungen) + Team-Info. */
import React from "react";
import type { FastifyInstance } from "fastify";
import { render } from "@react-email/render";
import { pool, insertEvent, setOrderRawField, bumpChange } from "./db";
import { partnerAutoSend, partnerAutoEnabled } from "./partner";
import { autopayAvailable, hasSavedMethod, chargeDue } from "./autopay";
import { customerSessionInfo, dashLink, keyOf } from "./customers";
import { gatesOpen } from "./orderStart";
import { fetchPlaceReviews, serpKey } from "./reviewsFetch";
import { quoteReviews, reviewMethod, cpOf } from "./reviewsPricing";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";
import { notifyTeam } from "./notify";
import { isTestEmail } from "./testAccounts";
import KundenPreisKorrektur, { preisKorrekturSubject } from "./emails/KundenPreisKorrektur";

const SITE_URL = (process.env.SITE_URL || "https://rapid-remove.com").replace(/\/+$/, "");
const MAIL_LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const httpUrl = (v: unknown) => { const s = clip(v, 600); return /^https?:\/\/\S+$/i.test(s) ? s : ""; };
const normU = (u?: string) => String(u || "").trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "");
const normT = (t?: string) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();

export type AddItem = { url?: string; name?: string; text?: string; rating?: number; days?: number; old?: boolean; nt?: boolean; sw?: boolean; cp?: number };
type OrderRow = { id: string; email: string; name: string | null; lang: string | null; country: string | null; company: string | null; profile: string | null; status: string | null; service: string | null; raw: Record<string, unknown> | null };
export type AddResult =
  | { ok: true; added: number; skipped: string[]; gate: boolean; partner: number; mailed: boolean; keys: string[] }
  | { ok: false; error: string; skipped?: string[] };

async function loadOrder(orderId: string): Promise<OrderRow | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT id, email, name, lang, country, company, profile, status, service, raw FROM orders WHERE id=$1`, [orderId]);
  return (r.rows[0] as OrderRow) || null;
}

/** Bereits beauftragte Bewertungen des Kunden (alle offenen Aufträge, gleiche E-Mail oder gleiches Profil, 365 Tage). */
async function seenOf(email: string, profile: string): Promise<{ u: string; nt: string }[]> {
  if (!pool) return [];
  const prev = await pool.query(
    `SELECT raw->'reviewItems' AS items FROM orders
      WHERE service='reviews' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '365 days'
        AND (lower(email)=lower($1) OR ($2 <> '' AND lower(COALESCE(profile,''))=lower($2)))`,
    [email, profile || ""],
  );
  const out: { u: string; nt: string }[] = [];
  for (const r of prev.rows) for (const it of (Array.isArray(r.items) ? r.items : []) as AddItem[]) {
    out.push({ u: normU(it.url), nt: it.name && it.text ? normT(it.name) + "|" + normT(it.text).slice(0, 80) : "" });
  }
  return out;
}
const isSeen = (seen: { u: string; nt: string }[], it: AddItem) =>
  seen.some((x) => (it.url && x.u && x.u === normU(it.url)) || (it.name && it.text && x.nt && x.nt === normT(it.name) + "|" + normT(it.text).slice(0, 80)));

/** Bewertungen anhängen. gate: "auto" = Zahlungsart nötig, wenn Abbuchung verfügbar und noch keine hinterlegt; "off" = nie. */
export async function addReviewsToOrder(orderId: string, input: AddItem[], opts: { by: "admin" | "customer"; gate?: "auto" | "off"; mail?: boolean }): Promise<AddResult> {
  if (!pool) return { ok: false, error: "db" };
  const o = await loadOrder(orderId);
  if (!o || o.service !== "reviews") return { ok: false, error: "order" };
  if (o.status === "storniert") return { ok: false, error: "cancelled" };
  const raw = (o.raw || {}) as Record<string, unknown>;
  const email = String(o.email || "").toLowerCase();
  const country = String(o.country || raw.profileCountry || "").toUpperCase();

  // 1) säubern
  const clean: AddItem[] = [];
  for (const x of input.slice(0, 30)) {
    const url = httpUrl(x.url), name = clip(x.name, 80), text = clip(x.text, 400);
    if (!url && !(name && text)) continue;
    const it: AddItem = { ...(url ? { url } : {}), ...(name ? { name } : {}), ...(text ? { text } : {}) };
    const rt = Math.round(Number(x.rating)), dy = Math.round(Number(x.days));
    if (rt >= 1 && rt <= 5) it.rating = rt;
    if (x.days !== undefined && x.days !== null && Number.isFinite(dy) && dy >= 0 && dy < 20000) it.days = dy;
    if (x.old === true || (it.days !== undefined && it.days > 28)) it.old = true;
    if (x.nt === true) it.nt = true;
    if (opts.by === "admin" && cpOf(x as { cp?: unknown })) it.cp = cpOf(x as { cp?: unknown }); // individueller Preis nur vom Admin
    if (!it.nt && reviewMethod(it, country) === "sw") { it.sw = true; it.old = true; } // Partner-Regel wie bei Website-Bestellungen
    clean.push(it);
  }
  if (!clean.length) return { ok: false, error: "empty" };

  // 2) Duplikate (schon in diesem oder einem anderen offenen Auftrag)
  const seen = await seenOf(email, String(o.profile || ""));
  const skipped: string[] = [];
  const fresh: AddItem[] = [];
  for (const it of clean) {
    if (isSeen(seen, it) || fresh.some((f) => keyOf(f) === keyOf(it))) skipped.push(it.name || it.url || "");
    else fresh.push(it);
  }
  if (!fresh.length) return { ok: false, error: "already_ordered", skipped };

  // 3) Zahlungsart-Pflicht nur für die neuen Bewertungen (laufende laufen weiter)
  const prefNoGate = ["wise", "paypal"].includes(String(raw.payPref || ""));
  const gate = opts.gate !== "off" && !prefNoGate && autopayAvailable(email) && !(await hasSavedMethod(email).catch(() => false));
  const newKeys = fresh.map((it) => keyOf(it));
  const items = [...(Array.isArray(raw.reviewItems) ? (raw.reviewItems as AddItem[]) : []), ...fresh];
  const cur = country === "US" ? "usd" : "eur";
  const total = quoteReviews(items, cur).total;
  await setOrderRawField(orderId, "reviewItems", items);
  await setOrderRawField(orderId, "amount", total);
  const adds = Array.isArray(raw.reviewsAdded) ? (raw.reviewsAdded as unknown[]) : [];
  await setOrderRawField(orderId, "reviewsAdded", [...adds, { at: new Date().toISOString(), by: opts.by, keys: newKeys }].slice(-40));
  await pool.query(`UPDATE orders SET reviews=$2, amount=$3 WHERE id=$1`, [orderId, items.length, total]).catch(() => {});
  if (gate) {
    const g = raw.payGate as { status?: string; keys?: string[] } | undefined;
    const prevKeys = g && g.status === "pending" && Array.isArray(g.keys) ? g.keys : null;
    // Bestehender, noch offener Gate ohne Schlüssel (ganzer Auftrag wartet) bleibt ganz; sonst nur die neuen Bewertungen.
    const keys = g && g.status === "pending" && !prevKeys ? undefined : [...(prevKeys || []), ...newKeys];
    await setOrderRawField(orderId, "payGate", { status: "pending", at: new Date().toISOString(), ...(keys ? { keys } : {}) });
    await setOrderRawField(orderId, "payMethod", "auto");
  }
  const who = opts.by === "admin" ? "Admin" : "Kunde im Dashboard";
  const list = fresh.map((it) => (it.name ? `${it.name}${it.rating ? ` (${it.rating}★)` : ""}` : it.url)).join(" · ");
  await insertEvent({ orderId, email, type: "order", title: `${fresh.length === 1 ? "Bewertung" : fresh.length + " Bewertungen"} nachbestellt (${who})`, detail: list + (gate ? " · wartet auf Zahlungsart" : "") + (skipped.length ? ` · schon beauftragt: ${skipped.join(", ")}` : "") });

  // 4) Partner-Board – sofort, außer die Neuen (bzw. der Auftrag) warten noch
  let partner = 0;
  const raw2 = { ...raw, ...(gate ? { payGate: { status: "pending" } } : {}) };
  if (!gate && gatesOpen(raw2) && await partnerAutoEnabled("reviews").catch(() => true)) {
    partner = await partnerAutoSend(orderId, o.profile || o.company || o.name || "", fresh as Record<string, unknown>[]).catch(() => 0);
  } else if (gate) {
    await insertEvent({ orderId, email, type: "note", title: "Nachbestellung wartet auf Zahlungsart", detail: "Startet automatisch, sobald der Kunde im Dashboard eine Zahlungsart hinterlegt hat – laufende Bewertungen laufen weiter", auto: true }).catch(() => {});
  }

  // 5) Bestätigung an den Kunden
  let mailed = false;
  if (opts.mail !== false && email) {
    try {
      const lang = MAIL_LANGS.includes(String(o.lang || "")) ? String(o.lang) : "en";
      const t = TEMPLATES["auftragsbestaetigung-reviews"];
      const q = quoteReviews(fresh, cur);
      const props = { lang, name: o.name || "", items: fresh, per: q.per, total: q.totalStr, currency: cur, orderId, payGate: gate, added: true, dash: { url: await dashLink(email, lang), existing: true } };
      const html = await render(React.createElement(t.component, props as never));
      const subj = t.subject(props as never);
      await sendMail({ to: email, subject: subj, html, replyTo: process.env.MAIL_REPLY_TO });
      mailed = true;
      await insertEvent({ orderId, email, type: "mail", title: "Bestätigung Nachbestellung gesendet", detail: "an " + email, html, subject: subj }).catch(() => {});
    } catch (e) { console.error("Nachbestellung: Mail fehlgeschlagen", e); }
  }
  if (opts.by === "customer") {
    const test = isTestEmail(email);
    void notifyTeam(`${test ? "TEST · " : ""}Nachbestellung · ${o.profile || o.company || o.name || orderId}`, `${fresh.length} ${fresh.length === 1 ? "Bewertung" : "Bewertungen"} selbst im Dashboard hinzugefügt${gate ? " · wartet auf Zahlungsart" : partner ? " · ans Partner-Board" : ""}`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "order" });
  }
  bumpChange();
  return { ok: true, added: fresh.length, skipped, gate, partner, mailed, keys: newKeys };
}

/* ---------- Kunde: Liste seines Profils + selbst hinzufügen ---------- */
const listHits = new Map<string, number[]>();
function listAllowed(email: string): boolean {
  const now = Date.now(), arr = (listHits.get(email) || []).filter((t) => now - t < 3600e3);
  if (arr.length >= 20) return false;
  arr.push(now); listHits.set(email, arr); return true;
}

async function custOrder(token: unknown, orderId: unknown): Promise<{ email: string; imp: boolean; o: OrderRow } | null> {
  const s = await customerSessionInfo(token);
  if (!s) return null;
  const o = await loadOrder(clip(orderId, 40));
  if (!o || String(o.email || "").toLowerCase() !== s.email.toLowerCase() || o.service !== "reviews") return null;
  return { email: s.email.toLowerCase(), imp: s.imp, o };
}

/** Bewertungen des Profils dieses Auftrags (SerpApi, 6 h Cache) – nur 1–3 ★; schon beauftragte markiert. */
async function profileReviews(o: OrderRow, email: string) {
  const raw = (o.raw || {}) as Record<string, unknown>;
  const placeId = clip(raw.placeId, 200);
  if (!placeId || !serpKey()) return null;
  const lang = MAIL_LANGS.includes(String(o.lang || "")) ? String(o.lang) : "en";
  const list = await fetchPlaceReviews(placeId, lang);
  const seen = await seenOf(email, String(o.profile || ""));
  return list.filter((r) => r.rating >= 1 && r.rating <= 3).map((r) => {
    const it: AddItem = { ...(r.link ? { url: r.link } : {}), name: r.name, ...(r.text ? { text: r.text } : {}) };
    return { id: r.id, name: r.name, photo: r.photo, rating: r.rating, days: r.days, text: (r.text || "").slice(0, 400), link: r.link, ordered: isSeen(seen, it) || isSeen(seen, { ...it, url: undefined }) };
  });
}

export function registerOrderAddRoutes(app: FastifyInstance, adminToken: string): void {
  app.post("/admin/orders/add-reviews", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const items = Array.isArray(b.reviewItems) ? (b.reviewItems as AddItem[]) : [];
    const r = await addReviewsToOrder(clip(b.orderId, 40), items, { by: "admin", gate: b.gate === false || b.gate === "off" ? "off" : "auto", mail: b.sendMail !== false });
    return r.ok ? r : reply.code(r.error === "already_ordered" ? 409 : 400).send(r);
  });

  app.post("/cust/orders/reviews", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const c = await custOrder(b.token, b.orderId);
    if (!c) return reply.code(401).send({ ok: false, error: "session" });
    if (c.o.status === "storniert") return { ok: true, enabled: false, reviews: [] };
    if (!listAllowed(c.email)) return reply.code(429).send({ ok: false, error: "rate" });
    try {
      const list = await profileReviews(c.o, c.email);
      return list ? { ok: true, enabled: true, reviews: list } : { ok: true, enabled: false, reviews: [] };
    } catch (e) { return reply.code(502).send({ ok: false, error: "fetch" }); }
  });

  app.post("/cust/orders/add", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const c = await custOrder(b.token, b.orderId);
    if (!c) return reply.code(401).send({ ok: false, error: "session" });
    if (c.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const ids = Array.isArray(b.ids) ? (b.ids as unknown[]).map((x) => clip(x, 200)).filter(Boolean).slice(0, 20) : [];
    if (!ids.length) return reply.code(400).send({ ok: false, error: "empty" });
    let list: Awaited<ReturnType<typeof profileReviews>> = null;
    try { list = await profileReviews(c.o, c.email); } catch { return reply.code(502).send({ ok: false, error: "fetch" }); }
    // Nur Bewertungen aus der Liste des eigenen Profils (Server-Daten, nicht vom Browser), 1–3 ★, noch nicht beauftragt.
    const picks = (list || []).filter((r) => ids.includes(r.id) && !r.ordered);
    if (!picks.length) return reply.code(409).send({ ok: false, error: "already_ordered" });
    const r = await addReviewsToOrder(c.o.id, picks.map((p) => ({ ...(p.link ? { url: p.link } : {}), name: p.name, text: p.text || "", rating: p.rating, days: p.days >= 0 ? p.days : undefined, ...(p.text ? {} : { nt: true }) })), { by: "customer", gate: "auto", mail: true });
    return r.ok ? { ok: true, added: r.added, gate: r.gate } : reply.code(r.error === "already_ordered" ? 409 : 400).send({ ok: false, error: r.error });
  });
}

/* ---------- Admin: Preise eines bestehenden Auftrags anpassen (individueller Preis je Bewertung bzw. Profil-Preis) ---------- */
/* Mail „Preis korrigiert" an den Kunden: Gesamtwert (+ Preis je Bewertung, wenn alle gleich). */
async function sendPriceMail(o: OrderRow, items: { cp?: number }[], total: number): Promise<void> {
  const lang = MAIL_LANGS.includes(String(o.lang || "")) ? String(o.lang) : "en";
  const usd = String(o.country || "").toUpperCase() === "US";
  const fmt = (v: number) => new Intl.NumberFormat(lang === "en" && !usd ? "en-IE" : lang, { style: "currency", currency: usd ? "USD" : "EUR", minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v);
  const cps = items.map((it) => Number(it.cp) || 0);
  const per = cps.length && cps.every((v) => v > 0 && v === cps[0]) ? fmt(cps[0]) : undefined;
  const props = { lang, name: o.name || "", orderId: o.id, per, n: items.length, total: fmt(total), dashUrl: await dashLink(o.email, lang) };
  const html = await render(React.createElement(KundenPreisKorrektur, props));
  await sendMail({ to: o.email, subject: preisKorrekturSubject(props), html, replyTo: process.env.MAIL_REPLY_TO });
  await insertEvent({ orderId: o.id, type: "mail", title: `Mail an Kunden: Preis korrigiert · Gesamtwert ${fmt(total)}` });
}

/* Einmalig (08.10.2026): RR-670348 – Preis wurde im Admin bereits auf 500 € korrigiert, Kunde bekommt die Korrektur-Mail. */
async function oneOffPriceMails(): Promise<void> {
  if (!pool) return;
  for (const id of ["RR-670348"]) {
    try {
      const o = await loadOrder(id);
      if (!o) continue;
      const amt = Number((o.raw || {}).amount);
      if (!(amt >= 499 && amt <= 501)) { console.warn(`[price-mail] ${id}: Betrag ${amt} ≠ 500 – nicht gesendet`); continue; }
      await pool.query(`CREATE TABLE IF NOT EXISTS ops_flags (key text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now())`);
      const f = await pool.query(`INSERT INTO ops_flags (key) VALUES ($1) ON CONFLICT DO NOTHING RETURNING key`, ["price-mail-" + id]);
      if (!f.rowCount) continue;
      const items = (Array.isArray((o.raw || {}).reviewItems) ? (o.raw || {}).reviewItems : []) as { cp?: number }[];
      await sendPriceMail(o, items, amt);
      console.log(`[price-mail] ${id}: Korrektur-Mail gesendet`);
    } catch (e) { console.error("[price-mail]", id, e); }
  }
}

export function registerPriceEditRoute(app: FastifyInstance, adminToken: string): void {
  setTimeout(() => { void oneOffPriceMails(); }, 60_000);
  /* Abrechnung aus dem Admin – auch für Bewertungen, die NICHT beim Partner sind (selbst gelöscht).
   *   POST /admin/reviews/bill-info { orderId }       → { savedPm }
   *   POST /admin/reviews/bill { orderId, keys[] }     → hinterlegte Zahlungsart: als gelöscht vermerken + sofort abbuchen
   *                                                       (Rechnung per Mail) → { mode: "autopay", charged }
   *                                                       sonst { mode: "invoice" } → Admin sendet Löschbestätigung + Rechnung
   *                                                       (/admin/reviews-invoice, vermerkt die Bewertungen dort). */
  app.post("/admin/reviews/bill-info", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const o = await loadOrder(clip(b.orderId, 40));
    if (!o) return reply.code(404).send({ ok: false, error: "order" });
    const savedPm = autopayAvailable(o.email) ? await hasSavedMethod(o.email).catch(() => false) : false;
    return { ok: true, savedPm };
  });
  app.post("/admin/reviews/bill", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "db" });
    const o = await loadOrder(clip(b.orderId, 40));
    if (!o || o.service !== "reviews") return reply.code(404).send({ ok: false, error: "order" });
    if (o.status === "storniert") return reply.code(400).send({ ok: false, error: "Auftrag ist storniert" });
    const raw = (o.raw || {}) as Record<string, unknown>;
    const want = new Set((Array.isArray(b.keys) ? b.keys : []).map((k) => String(k)).slice(0, 60));
    const items = ((Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as AddItem[]).filter((it) => want.has(keyOf(it)));
    if (!items.length) return reply.code(400).send({ ok: false, error: "keine Bewertung ausgewählt" });
    const billedArr = [...(Array.isArray(raw.reviewsRemovedAll) ? raw.reviewsRemovedAll : []), ...(Array.isArray(raw.reviewsRemoved) ? raw.reviewsRemoved : [])] as AddItem[];
    const billed = new Set(billedArr.map(keyOf));
    const paid = new Set(Array.isArray(raw.reviewsPaidKeys) ? (raw.reviewsPaidKeys as string[]) : []);
    const fresh = items.filter((it) => !billed.has(keyOf(it)) && !paid.has(keyOf(it)));
    if (!fresh.length) return reply.code(400).send({ ok: false, error: "schon abgerechnet" });
    const savedPm = autopayAvailable(o.email) ? await hasSavedMethod(o.email).catch(() => false) : false;
    if (!savedPm || b.forceInvoice === true) return { ok: true, mode: "invoice", n: fresh.length };
    const prev = (Array.isArray(raw.reviewsRemovedAll) ? raw.reviewsRemovedAll : []) as AddItem[];
    await setOrderRawField(o.id, "reviewsRemovedAll", [...prev, ...fresh]);
    await insertEvent({ orderId: o.id, email: o.email, type: "status", title: `${fresh.length === 1 ? "Bewertung" : fresh.length + " Bewertungen"} als gelöscht vermerkt (Admin)`, detail: fresh.map((it) => it.name || it.url || "Bewertung").join(" · ") + " · Abbuchung von der hinterlegten Zahlungsart" });
    bumpChange();
    const charged = await chargeDue(o.email, "Löschung (Admin)").catch(() => null);
    return { ok: true, mode: "autopay", n: fresh.length, charged };
  });
  app.post("/admin/orders/prices", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "db" });
    const o = await loadOrder(clip(b.orderId, 40));
    if (!o) return reply.code(404).send({ ok: false, error: "order" });
    const raw = (o.raw || {}) as Record<string, unknown>;
    const cur = String(o.country || "").toUpperCase() === "US" ? "usd" : "eur";
    if (o.service !== "reviews") {
      const amt = Number(b.amount);
      if (!(amt > 0 && amt < 100000)) return reply.code(400).send({ ok: false, error: "amount" });
      const v = Math.round(amt * 100) / 100;
      await pool.query(`UPDATE orders SET amount=$2 WHERE id=$1`, [o.id, v]);
      await setOrderRawField(o.id, "amount", v);
      await insertEvent({ orderId: o.id, type: "note", title: `Preis angepasst (Admin): ${v} ${cur.toUpperCase()}` });
      bumpChange();
      return { ok: true, amount: v };
    }
    const prices = (b.prices && typeof b.prices === "object" ? b.prices : {}) as Record<string, unknown>;
    const paidKeys = new Set<string>(Array.isArray(raw.reviewsPaidKeys) ? (raw.reviewsPaidKeys as string[]) : []);
    const items = (Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as (AddItem & { cp?: number })[];
    const changes: string[] = [];
    const next = items.map((it) => {
      const k = keyOf(it);
      if (!(k in prices) || paidKeys.has(k)) return it; // bezahlte Bewertungen nicht mehr ändern
      const v = cpOf({ cp: prices[k] });
      const { cp: _old, ...rest } = it;
      changes.push(`${it.name || it.url || k}: ${v ? v : "Preisliste"}`);
      return v ? { ...rest, cp: v } : rest;
    });
    const total = quoteReviews(next, cur).total;
    await setOrderRawField(o.id, "reviewItems", next);
    await setOrderRawField(o.id, "amount", total);
    await pool.query(`UPDATE orders SET amount=$2 WHERE id=$1`, [o.id, total]);
    if (changes.length) await insertEvent({ orderId: o.id, type: "note", title: `Preise angepasst (Admin) · Bestellwert ${total} ${cur.toUpperCase()}`, detail: changes.join(" · ") });
    if (b.notify === true) await sendPriceMail(o, next as { cp?: number }[], total).catch((e) => console.error("[price-mail]", e));
    bumpChange();
    return { ok: true, amount: total };
  });
}
