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
/** sw = Preis je Software-Fall (ohne Text / alte US-Bewertungen) in derselben Währung – null = normale Software-Preise. */
export type Pricing = { cur: "usd" | "eur"; tiers: Tier[]; sw?: number | null };
/** Partner: Staffel in USD nach derselben Anzahl wie beim Kunden + eigener Software-Preis. Der Kunde sieht davon nie etwas. */
export type PartnerPricing = { tiers: Tier[] | null; sw: number | null };
export type CustPricing = Pricing & { source: "custom" | "default" | "list"; partner: PartnerPricing; partnerId: number | null; note?: string;
  /** @deprecated nur noch für Altdaten – Partner-Staffel mit einer Stufe */ partnerUsd: number | null };
/** Stammdaten eines vom Admin angelegten Kunden-Dashboards. */
export type CustSetup = { email: string; name: string; company: string; lang: string; partnerId: number | null; partner: PartnerPricing };

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

const price = (v: unknown): number | null => { if (v === null || v === undefined || v === "") return null; const n = Math.round(num(v) * 100) / 100; return n > 0 && n < 100000 ? n : NaN; };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_pricing (
    email text PRIMARY KEY, cur text, tiers jsonb, partner_usd numeric, note text, updated_at timestamptz NOT NULL DEFAULT now())`);
  // 14.10.2026: Kunden-Dashboards vom Admin anlegen – Stammdaten, fester Partner, Partner-Staffel, Software-Preise.
  for (const c of ["name text", "company text", "lang text", "partner_id bigint", "partner_tiers jsonb", "partner_sw numeric", "sw_price numeric",
    "invited_at timestamptz", "created_at timestamptz DEFAULT now()"]) await pool.query(`ALTER TABLE cust_pricing ADD COLUMN IF NOT EXISTS ${c}`);
  ready = true;
}
async function getSetting(key: string): Promise<string | null> {
  if (!pool) return null;
  return (await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]).catch(() => ({ rows: [] as { value: string }[] }))).rows[0]?.value ?? null;
}
async function putSetting(key: string, value: string): Promise<void> {
  await pool!.query(`INSERT INTO partner_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [key, value]);
}

/** Standard-Staffel (Kunde) + Standard-Partner-Staffel (USD) für alle Kunden ohne eigene Preise. */
export type DefaultPricing = Pricing & { partner: PartnerPricing };
export async function defaultPricing(): Promise<DefaultPricing | null> {
  const v = await getSetting("pricing_default");
  if (!v) return null;
  try {
    const o = JSON.parse(v); const tiers = normTiers(o.tiers), cur = normCur(o.cur); const sw = price(o.sw);
    const pt = normTiers(o.partnerTiers), psw = price(o.partnerSw);
    return tiers && cur ? { cur, tiers, sw: Number.isFinite(sw) ? sw : null, partner: { tiers: pt, sw: Number.isFinite(psw) ? psw : null } } : null;
  } catch { return null; }
}

/** Partner-Konditionen aus einer cust_pricing-Zeile (Altdaten: partner_usd = eine Stufe für alle Mengen). */
function partnerOf(r: Record<string, unknown>): PartnerPricing {
  let tiers = normTiers(r.partner_tiers);
  const pu = Number(r.partner_usd);
  if (!tiers && Number.isFinite(pu) && pu > 0) tiers = [{ upTo: null, price: pu }];
  const sw = Number(r.partner_sw);
  return { tiers, sw: Number.isFinite(sw) && sw > 0 ? sw : null };
}

async function row(email: string): Promise<Record<string, unknown> | null> {
  const e = String(email || "").trim().toLowerCase();
  if (!pool || !e) return null;
  await init();
  return (await pool.query(`SELECT * FROM cust_pricing WHERE email=$1`, [e]).catch(() => ({ rows: [] as Record<string, unknown>[] }))).rows[0] || null;
}

/** Preise eines Kunden: eigene Staffel → Standard-Staffel → normale Preisliste (source „list", keine Pauschale). */
export async function pricingFor(email: string): Promise<CustPricing> {
  const r = await row(email);
  const d = await defaultPricing();
  if (r) {
    const tiers = normTiers(r.tiers), cur = normCur(r.cur), sw = Number(r.sw_price);
    const partner = partnerOf(r), partnerId = r.partner_id ? Number(r.partner_id) : null, note = String(r.note || "");
    const partnerUsd = partner.tiers && partner.tiers.length === 1 ? partner.tiers[0].price : null;
    if (tiers && cur) return { cur, tiers, sw: Number.isFinite(sw) && sw > 0 ? sw : null, source: "custom", partner, partnerId, partnerUsd, note };
    // Standard-Staffel → auch Standard-Partner-Staffel, außer der Kunde hat eigene Partner-Konditionen.
    if (d) return { ...d, source: "default", partner: { tiers: partner.tiers || d.partner.tiers, sw: partner.sw || d.partner.sw }, partnerId, partnerUsd, note };
    return { cur: "usd", tiers: [], sw: null, source: "list", partner, partnerId, partnerUsd, note };
  }
  const none = { partner: { tiers: null, sw: null }, partnerId: null, partnerUsd: null };
  return d ? { ...d, source: "default", partnerId: null, partnerUsd: null } : { cur: "usd", tiers: [], sw: null, source: "list", ...none };
}

/** Stammdaten + Partner des Kunden (für Bestellungen ohne Vorgeschichte und fürs Partner-Board). */
export async function custSetup(email: string): Promise<CustSetup | null> {
  const r = await row(email);
  if (!r) return null;
  return { email: String(r.email), name: String(r.name || ""), company: String(r.company || ""), lang: String(r.lang || ""),
    partnerId: r.partner_id ? Number(r.partner_id) : null, partner: partnerOf(r) };
}

/** Konditionen für eine Bestellung mit n Bewertungen – genau das wird je Bewertung festgeschrieben (cp/swp beim Kunden,
 *  pUsd/pSw beim Partner). Felder fehlen, wenn nichts Eigenes gilt. */
export type OrderPricing = { cur?: "usd" | "eur"; price?: number; sw?: number; partnerUsd?: number; partnerSw?: number;
  tierIdx?: number; from?: number; to?: number | null; n: number; source: CustPricing["source"]; tiers?: Tier[] };
export function orderPricing(p: CustPricing, n: number, opts: { flat: boolean }): OrderPricing | null {
  const o: OrderPricing = { n, source: p.source };
  if (opts.flat && p.source !== "list" && p.tiers.length) {
    const t = tierFor(p.tiers, n);
    Object.assign(o, { cur: p.cur, price: t.price, tierIdx: t.idx, from: t.from, to: t.to, tiers: p.tiers });
    if (p.sw) o.sw = p.sw;
  }
  if (p.partner.tiers && p.partner.tiers.length) o.partnerUsd = tierFor(p.partner.tiers, n).price;
  if (p.partner.sw) o.partnerSw = p.partner.sw;
  return o.price || o.partnerUsd || o.partnerSw ? o : null;
}

/** Neue Bestellung im Dashboard für alle Kunden an? (Standard: an; Admin kann ausschalten.) */
export async function dashNewOrderOn(): Promise<boolean> { return (await getSetting("dash_new_order")) !== "0"; }

type Hooks = {
  ensureAccount: (email: string) => Promise<unknown>;
  sendInvite: (email: string, name: string, lang: string) => Promise<void>;
};

export function registerPricingRoutes(app: FastifyInstance, adminToken: string, hooks: Hooks): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Admin: Übersicht (Standard-Staffel, Kunden-Dashboards, Partner zur Auswahl, Schalter „Neue Bestellung").
  app.post("/admin/pricing", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    await init();
    const rows = (await pool.query(`SELECT p.*, a.created_at AS acc_at, a.last_login,
        (SELECT count(*)::int FROM orders o WHERE lower(o.email)=p.email AND o.service='reviews' AND COALESCE(o.status,'') <> 'storniert') AS orders
      FROM cust_pricing p LEFT JOIN cust_accounts a ON a.email=p.email ORDER BY p.updated_at DESC LIMIT 500`)).rows;
    const partners = (await pool.query(`SELECT id, name, company, status, active, approved FROM partners ORDER BY active DESC, id`).catch(() => ({ rows: [] as Record<string, unknown>[] }))).rows
      .map((x) => ({ id: Number(x.id), name: String(x.company || x.name || "Partner " + x.id), active: x.status === "active" && x.active !== false, services: Object.keys((x.approved as Record<string, number>) || {}) }));
    return { ok: true, def: await defaultPricing(), newOrder: await dashNewOrderOn(), partners,
      customers: rows.map((r) => {
        const sw = Number(r.sw_price);
        return { email: r.email, name: r.name || "", company: r.company || "", lang: r.lang || "", cur: normCur(r.cur), tiers: normTiers(r.tiers), sw: Number.isFinite(sw) && sw > 0 ? sw : null,
          partnerId: r.partner_id ? Number(r.partner_id) : null, partner: partnerOf(r), note: r.note || "", updated: r.updated_at,
          account: !!r.acc_at, lastLogin: r.last_login || null, invitedAt: r.invited_at || null, orders: Number(r.orders || 0) };
      }) };
  });

  // Admin: Standard-Staffel speichern (+ optional Software-Preis).
  app.post("/admin/pricing/default", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const tiers = normTiers(b.tiers), cur = normCur(b.cur), sw = price(b.sw);
    if (!tiers || !cur) return reply.code(400).send({ ok: false, error: "Staffel ungültig (Grenzen aufsteigend, Preise > 0)" });
    if (Number.isNaN(sw)) return reply.code(400).send({ ok: false, error: "Software-Preis ungültig" });
    const pt = b.partnerTiers == null ? null : normTiers(b.partnerTiers), psw = price(b.partnerSw);
    if (b.partnerTiers != null && !pt) return reply.code(400).send({ ok: false, error: "Partner-Staffel ungültig (Grenzen aufsteigend, Preise > 0)" });
    if (Number.isNaN(psw)) return reply.code(400).send({ ok: false, error: "Partner-Software-Preis ungültig" });
    await putSetting("pricing_default", JSON.stringify({ cur, tiers, sw, partnerTiers: pt, partnerSw: psw }));
    return { ok: true, def: await defaultPricing() };
  });

  // Admin: Kunden-Dashboard anlegen/ändern.
  //   tiers = null → Standard-Staffel; partnerTiers = null → normaler Partnerpreis; partnerId = null → normale Zuteilung;
  //   create → Konto anlegen (ohne Mail); invite → Login-Link per Mail; remove → Eintrag löschen (Konto bleibt).
  app.post("/admin/pricing/customer", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    await init();
    const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    if (b.remove === true) { await pool.query(`DELETE FROM cust_pricing WHERE email=$1`, [email]); return { ok: true, removed: true }; }
    const useDefault = b.tiers === null || b.tiers === undefined;
    const tiers = useDefault ? null : normTiers(b.tiers);
    const cur = useDefault ? null : normCur(b.cur);
    if (!useDefault && (!tiers || !cur)) return reply.code(400).send({ ok: false, error: "Kunden-Staffel ungültig (Grenzen aufsteigend, Preise > 0)" });
    const sw = useDefault ? null : price(b.sw);
    if (Number.isNaN(sw)) return reply.code(400).send({ ok: false, error: "Software-Preis (Kunde) ungültig" });
    const pt = b.partnerTiers === null || b.partnerTiers === undefined ? null : normTiers(b.partnerTiers);
    if (b.partnerTiers != null && !pt) return reply.code(400).send({ ok: false, error: "Partner-Staffel ungültig (Grenzen aufsteigend, Preise > 0)" });
    const psw = price(b.partnerSw);
    if (Number.isNaN(psw)) return reply.code(400).send({ ok: false, error: "Software-Preis (Partner) ungültig" });
    let pid: number | null = null;
    if (b.partnerId != null && b.partnerId !== "") {
      pid = Number(b.partnerId);
      const ok = Number.isInteger(pid) && pid > 0 && (await pool.query(`SELECT 1 FROM partners WHERE id=$1`, [pid])).rowCount;
      if (!ok) return reply.code(400).send({ ok: false, error: "Partner unbekannt" });
    }
    const lang = LANGS.includes(String(b.lang || "")) ? String(b.lang) : null;
    const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
    await pool.query(`INSERT INTO cust_pricing (email, cur, tiers, sw_price, partner_usd, partner_tiers, partner_sw, partner_id, name, company, lang, note, updated_at)
        VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8,$9,$10,$11,now())
      ON CONFLICT (email) DO UPDATE SET cur=$2, tiers=$3, sw_price=$4, partner_usd=NULL, partner_tiers=$5, partner_sw=$6, partner_id=$7, name=$8, company=$9, lang=$10, note=$11, updated_at=now()`,
      [email, cur, tiers ? JSON.stringify(tiers) : null, sw, pt ? JSON.stringify(pt) : null, psw, pid, clip(b.name, 120) || null, clip(b.company, 160) || null, lang, clip(b.note, 300)]);
    let account = false, invited = false;
    if (b.create === true || b.invite === true) { await hooks.ensureAccount(email); account = true; }
    if (b.invite === true) {
      try { await hooks.sendInvite(email, clip(b.name, 120), lang || "en"); invited = true; await pool.query(`UPDATE cust_pricing SET invited_at=now() WHERE email=$1`, [email]); }
      catch (e) { return reply.code(502).send({ ok: false, error: "Gespeichert + Konto angelegt, aber Mail fehlgeschlagen: " + String((e as Error)?.message || e).slice(0, 120) }); }
    }
    return { ok: true, account, invited, pricing: await pricingFor(email) };
  });

  // Admin: Login-Link (erneut) senden.
  app.post("/admin/pricing/invite", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const s = await custSetup(String(b.email || ""));
    if (!s) return reply.code(404).send({ ok: false, error: "Kunde nicht gefunden" });
    await hooks.ensureAccount(s.email);
    try { await hooks.sendInvite(s.email, s.name, s.lang || "en"); }
    catch (e) { return reply.code(502).send({ ok: false, error: "Mail fehlgeschlagen: " + String((e as Error)?.message || e).slice(0, 120) }); }
    await pool.query(`UPDATE cust_pricing SET invited_at=now() WHERE email=$1`, [s.email]);
    return { ok: true };
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
