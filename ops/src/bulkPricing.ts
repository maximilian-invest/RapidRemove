/* Pauschalpreise für Bewertungen (10/2026) – Staffeln nach Anzahl pro Bulk-Upload.
 *
 *   Standard-Staffel (gilt für alle Kunden ohne eigene):   partner_settings „pricing_default" = { cur, tiers }
 *   Eigene Staffel je Kunde (Konto = E-Mail):               Tabelle cust_pricing
 *   Partnerpreis je Kunde (was wir dem Partner schulden):   cust_pricing.partner_usd (USD je gelöschter Bewertung)
 *
 * Staffel: [{ upTo: 50, price: 99 }, { upTo: 200, price: 79 }, { upTo: null, price: 59 }] – „bis 50 → 99", „bis 200 → 79",
 * „darüber → 59". Maßgeblich ist die Anzahl der Bewertungen im jeweiligen Upload. Der Preis gilt pro GELÖSCHTER Bewertung
 * (Abbuchung erst bei Löschung, wie immer) und wird bei der Bestellung je Bewertung festgeschrieben (cp).
 * Software-Löschungen (ohne Text / alte US-Bewertungen) sind NICHT in der Pauschale – Spezialpreis wie bisher.
 * Eigene Staffeln gelten auch für Bestellungen „von Hand" im Dashboard; die Standard-Staffel nur für Bulk-Uploads. */
import type { FastifyInstance } from "fastify";
import { pool } from "./db";

export type Tier = { upTo: number | null; price: number };
export type Pricing = { cur: "usd" | "eur"; tiers: Tier[] };
export type CustPricing = Pricing & { source: "custom" | "default" | "list"; partnerUsd: number | null; note?: string };

const num = (v: unknown) => { const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : NaN; };

/** Staffel prüfen + sortieren: aufsteigende Grenzen, letzte Stufe ohne Grenze („darüber"), Preise > 0. */
export function normTiers(input: unknown): Tier[] | null {
  if (!Array.isArray(input) || !input.length || input.length > 12) return null;
  const t = (input as Record<string, unknown>[]).map((x) => ({ upTo: x.upTo === null || x.upTo === "" || x.upTo === undefined ? null : Math.round(num(x.upTo)), price: Math.round(num(x.price) * 100) / 100 }));
  if (t.some((x) => !(x.price > 0 && x.price < 100000) || (x.upTo !== null && !(x.upTo >= 1 && x.upTo < 10_000_000)))) return null;
  const fixed = t.filter((x) => x.upTo !== null).sort((a, b) => (a.upTo as number) - (b.upTo as number));
  if (new Set(fixed.map((x) => x.upTo)).size !== fixed.length) return null;
  const open = t.filter((x) => x.upTo === null);
  if (open.length > 1) return null;
  const last = open[0] || { upTo: null, price: fixed[fixed.length - 1].price };
  return [...fixed, last];
}
export const normCur = (v: unknown): "usd" | "eur" | null => (v === "usd" || v === "eur" ? v : null);

/** Stufe für n Bewertungen. */
export function tierFor(tiers: Tier[], n: number): { idx: number; price: number; from: number; to: number | null } {
  let from = 1;
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (t.upTo === null || n <= t.upTo) return { idx: i, price: t.price, from, to: t.upTo };
    from = t.upTo + 1;
  }
  const l = tiers[tiers.length - 1];
  return { idx: tiers.length - 1, price: l.price, from, to: null };
}

let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_pricing (
    email text PRIMARY KEY, cur text, tiers jsonb, partner_usd numeric, note text, updated_at timestamptz NOT NULL DEFAULT now())`);
  ready = true;
}
async function getSetting(key: string): Promise<string | null> {
  if (!pool) return null;
  return (await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]).catch(() => ({ rows: [] as { value: string }[] }))).rows[0]?.value ?? null;
}
async function putSetting(key: string, value: string): Promise<void> {
  await pool!.query(`INSERT INTO partner_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [key, value]);
}

export async function defaultPricing(): Promise<Pricing | null> {
  const v = await getSetting("pricing_default");
  if (!v) return null;
  try { const o = JSON.parse(v); const tiers = normTiers(o.tiers), cur = normCur(o.cur); return tiers && cur ? { cur, tiers } : null; } catch { return null; }
}

/** Preise eines Kunden: eigene Staffel → Standard-Staffel → normale Preisliste (source „list", keine Pauschale). */
export async function pricingFor(email: string): Promise<CustPricing> {
  const e = String(email || "").trim().toLowerCase();
  if (pool && e) {
    await init();
    const r = (await pool.query(`SELECT cur, tiers, partner_usd, note FROM cust_pricing WHERE email=$1`, [e]).catch(() => ({ rows: [] as Record<string, unknown>[] }))).rows[0];
    if (r) {
      const tiers = normTiers(r.tiers), cur = normCur(r.cur), pu = Number(r.partner_usd);
      const partnerUsd = Number.isFinite(pu) && pu > 0 ? pu : null;
      if (tiers && cur) return { cur, tiers, source: "custom", partnerUsd, note: String(r.note || "") };
      const d = await defaultPricing();
      if (d) return { ...d, source: "default", partnerUsd, note: String(r.note || "") };
      return { cur: "usd", tiers: [], source: "list", partnerUsd, note: String(r.note || "") };
    }
  }
  const d = await defaultPricing();
  return d ? { ...d, source: "default", partnerUsd: null } : { cur: "usd", tiers: [], source: "list", partnerUsd: null };
}

/** Neue Bestellung im Dashboard für alle Kunden an? (Standard: an; Admin kann ausschalten.) */
export async function dashNewOrderOn(): Promise<boolean> { return (await getSetting("dash_new_order")) !== "0"; }

export function registerPricingRoutes(app: FastifyInstance, adminToken: string): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Admin: Übersicht (Standard-Staffel, Kunden mit eigenen Preisen, Schalter „Neue Bestellung").
  app.post("/admin/pricing", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    await init();
    const rows = (await pool.query(`SELECT email, cur, tiers, partner_usd, note, updated_at FROM cust_pricing ORDER BY updated_at DESC LIMIT 500`)).rows;
    return { ok: true, def: await defaultPricing(), newOrder: await dashNewOrderOn(),
      customers: rows.map((r) => ({ email: r.email, cur: normCur(r.cur), tiers: normTiers(r.tiers), partnerUsd: r.partner_usd === null ? null : Number(r.partner_usd), note: r.note || "", updated: r.updated_at })) };
  });

  // Admin: Standard-Staffel speichern.
  app.post("/admin/pricing/default", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const tiers = normTiers(b.tiers), cur = normCur(b.cur);
    if (!tiers || !cur) return reply.code(400).send({ ok: false, error: "Staffel ungültig (Grenzen aufsteigend, Preise > 0)" });
    await putSetting("pricing_default", JSON.stringify({ cur, tiers }));
    return { ok: true, def: { cur, tiers } };
  });

  // Admin: Preise eines Kunden (Staffel = null → Standard-Staffel; partnerUsd = null → normaler Partnerpreis; remove → löschen).
  app.post("/admin/pricing/customer", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    await init();
    const email = String(b.email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    if (b.remove === true) { await pool.query(`DELETE FROM cust_pricing WHERE email=$1`, [email]); return { ok: true, removed: true }; }
    const useDefault = b.tiers === null || b.tiers === undefined;
    const tiers = useDefault ? null : normTiers(b.tiers);
    const cur = useDefault ? null : normCur(b.cur);
    if (!useDefault && (!tiers || !cur)) return reply.code(400).send({ ok: false, error: "Staffel ungültig (Grenzen aufsteigend, Preise > 0)" });
    const pu = b.partnerUsd === null || b.partnerUsd === "" || b.partnerUsd === undefined ? null : num(b.partnerUsd);
    if (pu !== null && !(pu > 0 && pu < 100000)) return reply.code(400).send({ ok: false, error: "Partnerpreis ungültig" });
    await pool.query(`INSERT INTO cust_pricing (email, cur, tiers, partner_usd, note, updated_at) VALUES ($1,$2,$3,$4,$5,now())
      ON CONFLICT (email) DO UPDATE SET cur=$2, tiers=$3, partner_usd=$4, note=$5, updated_at=now()`,
      [email, cur, tiers ? JSON.stringify(tiers) : null, pu === null ? null : Math.round(pu * 100) / 100, String(b.note || "").slice(0, 300)]);
    return { ok: true, pricing: await pricingFor(email) };
  });

  // Admin: „Neue Bestellung" im Kunden-Dashboard für alle an/aus.
  app.post("/admin/pricing/new-order", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    await putSetting("dash_new_order", b.on === false ? "0" : "1");
    return { ok: true, newOrder: await dashNewOrderOn() };
  });
}
