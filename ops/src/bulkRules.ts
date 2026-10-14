/* Bulk-Upload – Regeln nach der Bestellung (14.10.2026, Maximilian).
 *
 * 1) Software-Fall in einer Bulk-Bestellung: Setzt der Partner eine Bewertung auf „Software", wird sie aus der Bulk-Bestellung
 *    sofort STORNIERT (nicht Teil der Pauschale). Kunde bekommt den Hinweis, sie als Einzelbewertung zum regulären Preis zu
 *    beauftragen – dann läuft das ganz normale Verfahren. Gilt NUR für Bulk-Uploads.
 * 2) Stufe neu berechnen: Fällt die Anzahl durch Stornos unter die Stufe, gibt es eine Toleranz (Standard 10 % unter der
 *    Stufengrenze: 105 → 95 bleibt in „ab 100"). Darunter → neuer Preis. Kunde muss im Dashboard zustimmen, bis dahin ist der
 *    Auftrag pausiert (Partner sieht „On hold"). Beim Bestellen hat der Kunde das per Häkchen bestätigt (raw.tierAck).
 * 3) Zustimmung: neuer Preis für alle noch nicht gelöschten Bewertungen (Kunde cp + Partner price_usd), Pause aufgehoben.
 *
 * Auftragsfelder (orders.raw): bulk, pricing (Konditionen), bulkSw { key: { at, code } }, priceHold { … } | null, priceChanges [ … ]. */
import * as React from "react";
import type { FastifyInstance } from "fastify";
import { render } from "@react-email/render";
import { pool, insertEvent, setOrderRawField, bumpChange } from "./db";
import { notifyTeam } from "./notify";
import { notifyPartner } from "./partnerNotify";
import { notifyCustomer } from "./custPush";
import { sendMail } from "./mailer";
import { isTestEmail } from "./testAccounts";
import { normTiers, tierFor, tolerancePct, type Tier } from "./bulkPricing";
import { partnerPrice, serviceOf } from "./partnerRegistry";
import BulkHinweis, { bulkHinweisSubject } from "./emails/BulkHinweis";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
type Item = { url?: string; name?: string; text?: string; cp?: number; nt?: boolean; sw?: boolean; old?: boolean; kind?: string; [k: string]: unknown };
const keyOf = (it: Item) => it.url || `${it.name || ""}|${it.text || ""}`;
const fmt = (v: number | null, cur: string) => (v == null ? (cur === "usd" ? "standard prices" : "Standardpreise") : cur === "usd" ? `$${v}` : `${v} €`);
const fmtDe = (v: number | null, cur: string) => (v == null ? "Standardpreise" : cur === "usd" ? `$${v}` : `${v} €`);

export type PriceHold = { status: "pending"; at: string; nOrig: number; nNow: number; cur: "usd" | "eur"; fromPrice: number; toPrice: number | null;
  toFrom: number | null; toTo: number | null; partnerTo: number | null; tol: number };

/** Reine Entscheidung (getestet): bleibt der Preis (Toleranz) – oder welche neue Stufe gilt? */
export function retierDecision(tiers: Tier[], curFrom: number, curPrice: number, nNow: number, tol: number):
  { change: false } | { change: true; price: number | null; from: number | null; to: number | null } {
  if (nNow >= curFrom) return { change: false };                              // noch in der Stufe (oder darüber)
  if (nNow >= Math.ceil(curFrom * (1 - tol / 100))) return { change: false }; // Toleranz
  const t = tierFor(tiers, nNow);
  if (t && t.price === curPrice) return { change: false };
  return { change: true, price: t ? t.price : null, from: t ? t.from : null, to: t ? t.to : null };
}

async function orderRow(orderId: string) {
  if (!pool) return null;
  const r = await pool.query(`SELECT id, email, name, lang, status, raw FROM orders WHERE id=$1 AND service='reviews'`, [orderId]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
  return (r.rows[0] as { id: string; email: string; name: string | null; lang: string | null; status: string | null; raw: Record<string, unknown> } | undefined) || null;
}
export async function isBulkOrder(orderId: string | null | undefined): Promise<boolean> {
  if (!pool || !orderId) return false;
  const r = await pool.query(`SELECT (raw->>'bulk')='true' AS b FROM orders WHERE id=$1`, [orderId]).catch(() => ({ rows: [] as { b: boolean }[] }));
  return !!r.rows[0]?.b;
}

async function mail(o: { email: string; name: string | null; lang: string | null }, props: Omit<React.ComponentProps<typeof BulkHinweis>, "url" | "lang" | "name">): Promise<void> {
  const lang = o.lang === "de" ? "de" : "en";
  const p = { ...props, lang, name: o.name || "", url: `${SITE_URL}/my-reviews${props.orderId ? `?order=${encodeURIComponent(props.orderId)}` : ""}` };
  await sendMail({ to: o.email, subject: bulkHinweisSubject(p), html: await render(React.createElement(BulkHinweis, p)), replyTo: process.env.MAIL_REPLY_TO }).catch(() => {});
}

// Mehrere Software-Stornos kurz hintereinander (Partner geht die Liste durch) → EINE Mail an den Kunden.
const swMailQueue = new Map<string, { t: NodeJS.Timeout; names: string[] }>();

/** Partner hat eine Bulk-Bewertung auf „Software" gesetzt → bereits als „cancelled" gespeichert (partner.ts). Hier: Auftrag + Kunde. */
export async function bulkSoftwareCancelled(orderId: string, itemKey: string, code: string | null, label: string | null): Promise<void> {
  const o = await orderRow(orderId);
  if (!o) return;
  const raw = o.raw || {};
  const sw = { ...((raw.bulkSw as Record<string, unknown>) || {}) };
  if (!sw[itemKey]) sw[itemKey] = { at: new Date().toISOString(), code };
  await setOrderRawField(orderId, "bulkSw", sw);
  await insertEvent({ orderId, email: o.email, type: "note", title: `Bulk: ${code || "Bewertung"} braucht Software → aus der Bulk-Bestellung storniert`, detail: `${label || itemKey} · Kunde wird gebeten, sie als Einzelbewertung zum regulären Preis zu beauftragen`, auto: true }).catch(() => {});
  bumpChange();
  const lang = o.lang === "de" ? "de" : "en";
  void notifyCustomer(o.email, lang === "de" ? "Spezial-Software nötig" : "Special software needed",
    lang === "de" ? `${label || "Eine Bewertung"} ist nicht Teil der Bulk-Pauschale – bitte als Einzelbewertung beauftragen.` : `${label || "A review"} isn't part of the bulk flat price – please order it as an individual review.`,
    `rrb-sw-${orderId}`, { url: `/my-reviews?order=${encodeURIComponent(orderId)}` }).catch(() => {});
  const q = swMailQueue.get(orderId) || { t: undefined as unknown as NodeJS.Timeout, names: [] };
  if (q.t) clearTimeout(q.t);
  q.names.push(label || code || itemKey);
  q.t = setTimeout(() => { swMailQueue.delete(orderId); void mail(o, { kind: "sw", n: q.names.length, reviews: q.names, orderId }); }, isTestEmail(o.email) ? 60_000 : 10 * 60_000);
  swMailQueue.set(orderId, q);
  await bulkRetier(orderId);
}

/** Anzahl hat sich geändert → Stufe prüfen; ggf. Preisänderung anfordern und Auftrag pausieren. */
export async function bulkRetier(orderId: string): Promise<PriceHold | null> {
  const o = await orderRow(orderId);
  if (!o || o.status === "storniert") return null;
  const raw = o.raw || {};
  if (raw.bulk !== true) return null;
  const pr = (raw.pricing || {}) as { cur?: "usd" | "eur"; price?: number; from?: number; tiers?: unknown; partnerTiers?: unknown; tol?: number; n?: number };
  if (!(Number(pr.price) > 0) || !pr.from) return null; // ohne Pauschale (unter der ersten Stufe) ändert sich nichts
  const tiers = normTiers(pr.tiers);
  if (!tiers) return null;
  const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
  const gone = new Set(Object.keys((raw.bulkSw as Record<string, unknown>) || {}));
  const nNow = items.filter((it) => !gone.has(keyOf(it))).length;
  const tol = Number.isFinite(Number(pr.tol)) ? Number(pr.tol) : await tolerancePct();
  const d = retierDecision(tiers, Number(pr.from), Number(pr.price), nNow, tol);
  const prevHold = raw.priceHold as PriceHold | null | undefined;
  if (!d.change) {
    // Pausiert, aber durch spätere Änderung doch wieder in der Stufe? (sollte nicht vorkommen – Anzahl sinkt nur) → nichts tun.
    return null;
  }
  const pt = normTiers(pr.partnerTiers);
  const partnerT = pt ? tierFor(pt, nNow) : null;
  const hold: PriceHold = { status: "pending", at: new Date().toISOString(), nOrig: Number(pr.n) || items.length, nNow, cur: pr.cur === "eur" ? "eur" : "usd",
    fromPrice: Number(pr.price), toPrice: d.price, toFrom: d.from, toTo: d.to, partnerTo: partnerT ? partnerT.price : null, tol };
  // Gleiche Änderung schon angefragt → nur Zahlen aktualisieren, nicht nochmal benachrichtigen.
  const same = prevHold && prevHold.status === "pending" && prevHold.toPrice === hold.toPrice;
  await setOrderRawField(orderId, "priceHold", hold);
  bumpChange();
  if (same) return hold;
  const test = isTestEmail(o.email);
  await insertEvent({ orderId, email: o.email, type: "note", title: `Bulk: Stufe geändert (${hold.nOrig} → ${nNow} Bewertungen) – Auftrag pausiert bis zur Zustimmung des Kunden`,
    detail: `Kunde: ${fmtDe(hold.fromPrice, hold.cur)} → ${fmtDe(hold.toPrice, hold.cur)} je gelöschter Bewertung · Partner: ${hold.partnerTo != null ? "$" + hold.partnerTo : "normaler Partnerpreis"} · Toleranz ${tol} %`, auto: true }).catch(() => {});
  const codes = pool ? (await pool.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND status IN ('new','working') ORDER BY id LIMIT 4`, [orderId]).catch(() => ({ rows: [] as { code: string }[] }))).rows.map((x) => x.code) : [];
  void notifyPartner(`${test ? "TEST · " : ""}Order on hold`, `${codes.join(", ") || orderId} · customer has to confirm a price change – please pause until “hold lifted”.`, undefined, test);
  void notifyTeam(`${test ? "TEST · " : ""}Bulk: Preisänderung wartet auf Kunden`, `${o.name || o.email} · ${hold.nOrig} → ${nNow} Bewertungen · ${fmtDe(hold.fromPrice, hold.cur)} → ${fmtDe(hold.toPrice, hold.cur)}`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "customer" });
  const lang = o.lang === "de" ? "de" : "en";
  void notifyCustomer(o.email, lang === "de" ? "Bitte neuen Preis bestätigen" : "Please confirm the new price",
    lang === "de" ? `Ihre Bulk-Bestellung hat jetzt ${nNow} Bewertungen – ${fmtDe(hold.fromPrice, hold.cur)} → ${fmtDe(hold.toPrice, hold.cur)} je Löschung.` : `Your bulk order now has ${nNow} reviews – ${fmt(hold.fromPrice, hold.cur)} → ${fmt(hold.toPrice, hold.cur)} per removal.`,
    `rrb-pr-${orderId}`, { url: `/my-reviews?order=${encodeURIComponent(orderId)}` }).catch(() => {});
  void mail(o, { kind: "price", nOrig: hold.nOrig, nNow, from: (lang === "de" ? fmtDe : fmt)(hold.fromPrice, hold.cur), to: (lang === "de" ? fmtDe : fmt)(hold.toPrice, hold.cur), orderId });
  return hold;
}

/** Kunde stimmt dem neuen Preis zu → neue Preise für alle noch nicht gelöschten Bewertungen, Pause aufheben. */
export async function acceptPriceChange(email: string, orderId: string): Promise<{ ok: boolean; error?: string }> {
  const o = await orderRow(orderId);
  if (!o || !pool) return { ok: false, error: "not_found" };
  if (String(o.email || "").toLowerCase() !== email.toLowerCase()) return { ok: false, error: "not_found" };
  const raw = o.raw || {};
  const h = raw.priceHold as PriceHold | null | undefined;
  if (!h || h.status !== "pending") return { ok: false, error: "no_change" };
  const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
  const t = await pool.query(`SELECT id, item_key, status, kind, method, paid_at, partner_id FROM partner_tasks WHERE order_id=$1`, [orderId]);
  const removed = new Set((t.rows as { item_key: string; status: string }[]).filter((x) => x.status === "removed").map((x) => x.item_key));
  // Kunde: Pauschale (cp) für alle noch nicht gelöschten, normalen Bewertungen; unter der ersten Stufe → cp weg (normale Preise).
  const gone = new Set(Object.keys((raw.bulkSw as Record<string, unknown>) || {}));
  const next = items.map((it) => {
    const k = keyOf(it);
    if (removed.has(k) || gone.has(k) || it.nt || it.sw) return it;
    if (h.toPrice != null) return { ...it, cp: h.toPrice };
    const { cp: _cp, ...rest } = it; return rest as Item;
  });
  await setOrderRawField(orderId, "reviewItems", next);
  // Partner: neuer Preis für offene, unbezahlte, normale Aufgaben.
  for (const x of t.rows as { id: string; status: string; kind: string; method: string | null; paid_at: string | null; partner_id: string | null }[]) {
    if (x.paid_at || ["removed", "cancelled"].includes(x.status) || x.method === "sw" || x.kind === "nt" || x.kind === "profile") continue;
    const price = h.partnerTo != null ? h.partnerTo : await partnerPrice(x.partner_id ? Number(x.partner_id) : null, serviceOf({ kind: x.kind }));
    await pool.query(`UPDATE partner_tasks SET price_usd=$2 WHERE id=$1 AND paid_at IS NULL`, [x.id, price]).catch(() => {});
  }
  const pr = { ...((raw.pricing as Record<string, unknown>) || {}) };
  const newPricing = h.toPrice != null ? { ...pr, price: h.toPrice, from: h.toFrom, to: h.toTo, n: h.nNow, partnerUsd: h.partnerTo ?? undefined } : { ...pr, price: undefined, from: undefined, to: undefined, n: h.nNow, partnerUsd: h.partnerTo ?? undefined, listFromN: h.nNow };
  await setOrderRawField(orderId, "pricing", newPricing);
  const log = Array.isArray(raw.priceChanges) ? (raw.priceChanges as unknown[]) : [];
  await setOrderRawField(orderId, "priceChanges", [...log, { ...h, status: "accepted", acceptedAt: new Date().toISOString() }]);
  await setOrderRawField(orderId, "priceHold", null);
  bumpChange();
  const test = isTestEmail(o.email);
  await insertEvent({ orderId, email: o.email, type: "note", title: "Kunde hat dem neuen Preis zugestimmt – Auftrag läuft weiter", detail: `${fmtDe(h.fromPrice, h.cur)} → ${fmtDe(h.toPrice, h.cur)} je gelöschter Bewertung (${h.nNow} Bewertungen)` }).catch(() => {});
  const codes = (await pool.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND status IN ('new','working') ORDER BY id LIMIT 4`, [orderId]).catch(() => ({ rows: [] as { code: string }[] }))).rows.map((x) => x.code);
  void notifyPartner(`${test ? "TEST · " : ""}Hold lifted`, `${codes.join(", ") || orderId} · customer confirmed – continue now.`, undefined, test);
  return { ok: true };
}

export function registerBulkRules(app: FastifyInstance, sessionInfo: (t: unknown) => Promise<{ email: string; imp: boolean } | null>): void {
  app.post("/cust/price-change/accept", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await sessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const r = await acceptPriceChange(s.email, String(b.orderId || "").slice(0, 40));
    if (!r.ok) return reply.code(400).send(r);
    return r;
  });
}
