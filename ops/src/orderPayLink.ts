/* Admin: Zahlungslink eines Profil-Auftrags ändern (06.11.2026).
 * Anlass: Kunde stockt nach der Bestellung auf (z. B. Löschung → Löschung + Lebenslanger Schutz).
 * Im Admin wird ein aktiver Stripe-Zahlungslink gewählt →
 *   1. der Auftrag übernimmt Leistung / Schutz / Express aus den Positionen des Links (Bestellwert, Abbuchung,
 *      Mahnungen und Schutz-Erkennung stimmen damit wieder),
 *   2. raw.payLink merkt sich den Link – resolvePayLink() nimmt ihn für ALLE weiteren Mails (Zahlungslink,
 *      Erinnerungen, Mahnungen, Zahlungsziel), solange er in Stripe aktiv ist.
 * url = "" → Override entfernen, Link wird wieder automatisch zur Bestellung gesucht. */
import type { FastifyInstance } from "fastify";
import { pool, insertEvent, setOrderRawField, bumpChange } from "./db";
import { hasSecretKey, listPaymentLinks } from "./integrations/stripe";
import { PROFILE_LIST_PRICES, PROFILE_EXPRESS_FEE, PROTECTION_PRICES } from "./reviewsPricing";

export type LinkItem = { amount: number; currency?: string; interval: string };
export type LinkApply = { currency: "eur" | "usd"; amount: number; protection: string; protAmount: number; express: boolean; expressAmount: number };

const r2 = (v: number) => Math.round(v * 100) / 100;
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const PROT_LABEL: Record<string, string> = { none: "ohne Schutz", monthly: "Monatlicher Schutz", yearly: "Jährlicher Schutz", lifetime: "Lebenslanger Schutz", monitor: "Schutz + Überwachung" };

/** Positionen eines Stripe-Links → Felder des Auftrags. Mehrere Abo-Positionen werden nicht unterstützt. */
export function orderFromLink(items: LinkItem[]): LinkApply | { error: string } {
  if (!items.length) return { error: "Link hat keine Positionen" };
  const currency = (items[0].currency || "eur").toLowerCase() === "usd" ? "usd" : "eur";
  const rec = items.filter((i) => i.interval !== "once");
  let once = items.filter((i) => i.interval === "once").map((i) => r2(i.amount / 100));
  if (rec.length > 1) return { error: "Link mit mehreren Abo-Positionen wird nicht unterstützt" };
  if (!once.length) return { error: "Link enthält keine Leistung (nur Abo)" };
  let protection = "none", protAmount = 0;
  if (rec.length) {
    protAmount = r2(rec[0].amount / 100);
    protection = rec[0].interval === "year" ? "yearly" : rec[0].interval === "month" ? (protAmount === PROTECTION_PRICES.monitor ? "monitor" : "monthly") : "";
    if (!protection) return { error: `Abo-Intervall „${rec[0].interval}“ wird nicht unterstützt` };
  } else if (once.length >= 2) {
    const i = once.indexOf(PROTECTION_PRICES.lifetime);
    if (i >= 0) { protection = "lifetime"; protAmount = PROTECTION_PRICES.lifetime; once = once.filter((_, k) => k !== i); }
  }
  const oneTime = r2(once.reduce((s, v) => s + v, 0));
  // Express steckt im Einmalbetrag (Listenpreis + 149) → wie bei neuen Bestellungen getrennt speichern.
  const base = r2(oneTime - PROFILE_EXPRESS_FEE);
  if (PROFILE_LIST_PRICES.includes(base)) return { currency, amount: base, protection, protAmount, express: true, expressAmount: PROFILE_EXPRESS_FEE };
  return { currency, amount: oneTime, protection, protAmount, express: false, expressAmount: 0 };
}

export function applyLabel(a: LinkApply): string {
  const m = (v: number) => (a.currency === "usd" ? `$${v.toLocaleString("en-US")}` : `${v.toLocaleString("de-DE", { minimumFractionDigits: v % 1 ? 2 : 0 })} €`);
  const iv = a.protection === "yearly" ? " / Jahr" : a.protection === "monthly" || a.protection === "monitor" ? " / Monat" : "";
  return `Leistung ${m(a.amount)}${a.express ? ` + Express ${m(a.expressAmount)}` : ""} · ${PROT_LABEL[a.protection] || a.protection}${a.protAmount ? ` ${m(a.protAmount)}${iv}` : ""}`;
}

/** Override-Link des Auftrags, falls gesetzt UND in Stripe noch aktiv (sonst undefined → automatische Suche). */
export async function orderPayLinkOverride(orderId: string): Promise<string | undefined> {
  if (!pool || !orderId || !hasSecretKey()) return undefined;
  try {
    const r = await pool.query(`SELECT raw->'payLink'->>'url' AS u FROM orders WHERE id=$1`, [orderId]);
    const u = r.rows[0]?.u as string | undefined;
    if (!u) return undefined;
    const links = await listPaymentLinks();
    return links.some((l) => l.url === u) ? u : undefined;
  } catch { return undefined; }
}

export function registerOrderPayLinkRoute(app: FastifyInstance, adminToken: string): void {
  app.post("/admin/order-paylink", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine DB" });
    const id = clip(b.orderId, 40);
    const r = await pool.query(`SELECT id, service, country, pay, amount, protection, prot_amount, raw FROM orders WHERE id=$1`, [id]);
    const o = r.rows[0] as { id: string; service: string | null; country: string | null; pay: string | null; amount: string | null; protection: string | null; prot_amount: string | null; raw: Record<string, unknown> | null } | undefined;
    if (!o) return reply.code(404).send({ ok: false, error: "Auftrag nicht gefunden" });
    if (o.service === "reviews") return reply.code(400).send({ ok: false, error: "Nur für Profil-Aufträge" });
    if (o.pay === "paid") return reply.code(400).send({ ok: false, error: "Auftrag ist schon bezahlt" });
    const raw = o.raw || {};
    const url = clip(b.url, 300);

    // Zurück auf automatisch: nur den Override entfernen, Auftragsfelder bleiben.
    if (!url) {
      if (b.preview === true) return { ok: true, preview: true, auto: true };
      await setOrderRawField(id, "payLink", null);
      await insertEvent({ orderId: id, type: "pay", title: "Zahlungslink: wieder automatisch passend zur Bestellung" });
      bumpChange();
      return { ok: true, auto: true };
    }

    if (!hasSecretKey()) return reply.code(400).send({ ok: false, error: "STRIPE_SECRET_KEY nicht gesetzt" });
    const links = await listPaymentLinks().catch(() => []);
    const link = links.find((l) => l.url === url);
    if (!link) return reply.code(400).send({ ok: false, error: "Unbekannter oder inaktiver Zahlungslink" });
    const a = orderFromLink(link.items);
    if ("error" in a) return reply.code(400).send({ ok: false, error: a.error });
    const orderCur = String(o.country || "").toUpperCase() === "US" ? "usd" : "eur";
    if (a.currency !== orderCur) return reply.code(400).send({ ok: false, error: `Link ist in ${a.currency.toUpperCase()}, der Auftrag in ${orderCur.toUpperCase()}` });
    const label = applyLabel(a);
    if (b.preview === true) return { ok: true, preview: true, apply: a, label };

    const before = applyLabel({ currency: orderCur, amount: Number(o.amount) || 0, protection: o.protection || "none", protAmount: Number(o.prot_amount) || 0, express: raw.express === true, expressAmount: Number(raw.expressAmount) || 0 });
    await pool.query(`UPDATE orders SET amount=$2, protection=$3, prot_amount=$4 WHERE id=$1`, [id, a.amount, a.protection === "none" ? null : a.protection, a.protAmount || null]);
    await setOrderRawField(id, "amount", a.amount);
    await setOrderRawField(id, "protection", a.protection === "none" ? "" : a.protection);
    await setOrderRawField(id, "protAmount", a.protAmount);
    await setOrderRawField(id, "express", a.express);
    await setOrderRawField(id, "expressAmount", a.expressAmount);
    await setOrderRawField(id, "saleTotal", r2(a.amount + a.expressAmount + a.protAmount));
    await setOrderRawField(id, "payLink", { url: link.url, id: link.id, set: new Date().toISOString() });
    await insertEvent({ orderId: id, type: "pay", title: `Zahlungslink geändert → ${label}`, detail: `vorher: ${before} · ${link.url}` });
    bumpChange();
    return { ok: true, apply: a, label, url: link.url };
  });
}
