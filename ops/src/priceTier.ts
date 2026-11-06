/* Preis nach Land × Branche + Branchen-Erfassung (06.11.2026, Maximilian).
 *
 *  - resolveTier(): welcher Frisch-Preis gilt für diese Bestellung (199 / 249 / 309)?
 *      Land + Branche kommen aus Google (Place-Details per placeId, serverseitig – nicht vom Browser übernommen).
 *      Bestandskunden (E-Mail hat schon einen Auftrag oder ein Kundenkonto) zahlen weiter 199.
 *  - POST /price-quote: der Wizard/Chat fragt damit den Preis ab, sobald Profil (und E-Mail) bekannt sind.
 *  - industryInfo(): Branche jeder Bestellung (raw.ind, raw.ptype) → Statistik.
 *  - Admin: /admin/industry-stats (Auswertung über ALLE Aufträge), /admin/industry-backfill (Altaufträge nachtragen).
 */
import type { FastifyInstance } from "fastify";
import { pool, dbReady } from "./db";
import { industryOf, industryFromDisplay, isPremiumIndustry, INDUSTRY_LABEL, type IndustryKey } from "./industry";
import { freshPriceFor, PRICE_V2_FRESH } from "./reviewsPricing";
import { isTestEmail } from "./testAccounts";
import { resolveReviewLink } from "./monitor";

const gkey = () => (process.env.GOOGLE_MAPS_API_KEY || "").trim();
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export type PlaceKind = { ptype: string; types: string[]; cc: string };
const kindCache = new Map<string, { at: number; v: PlaceKind | null }>();

/** Google-Kategorie + Land eines Profils (Place-Details, nur 3 Felder). Cache 24 Std., Timeout 3,5 s, Fehler → null. */
export async function placeKind(placeId: string): Promise<PlaceKind | null> {
  const id = clip(placeId, 200);
  if (!id || !gkey() || !/^[A-Za-z0-9_-]{10,200}$/.test(id)) return null;
  const c = kindCache.get(id);
  if (c && Date.now() - c.at < 24 * 3600_000) return c.v;
  let v: PlaceKind | null = null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
      headers: { "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": "primaryType,types,addressComponents" },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const p = (await res.json().catch(() => ({}))) as { primaryType?: string; types?: string[]; addressComponents?: { types?: string[]; shortText?: string }[] };
      const cc = (Array.isArray(p.addressComponents) ? p.addressComponents : []).find((x) => (x.types || []).includes("country"))?.shortText || "";
      v = { ptype: String(p.primaryType || ""), types: Array.isArray(p.types) ? p.types.slice(0, 12).map(String) : [], cc: String(cc).toUpperCase() };
    }
  } catch { v = null; }
  if (kindCache.size > 5000) kindCache.clear();
  kindCache.set(id, { at: Date.now(), v });
  return v;
}

/** Bestandskunde = E-Mail hat schon einen (echten) Auftrag oder ein Kundenkonto. Test-Adressen gelten als Neukunde (zum Testen). */
export async function isExistingCustomer(email: string): Promise<boolean> {
  const e = clip(email, 200).toLowerCase();
  if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) || isTestEmail(e) || !pool || !dbReady()) return false;
  try {
    const r = await pool.query(
      `SELECT 1 FROM orders WHERE lower(trim(email))=$1
        UNION ALL SELECT 1 FROM cust_accounts WHERE email=$1 LIMIT 1`, [e]);
    return (r.rowCount || 0) > 0;
  } catch { return false; }
}

export type IndustryInfo = { ind: IndustryKey; ptype: string; types: string[]; cc: string; src: "google" | "client" | "display" | "none" };

/** Branche einer Bestellung: Google (placeId) → sonst vom Browser mitgeschickter Code → sonst übersetzter Name. */
export async function industryInfo(o: { placeId?: unknown; placeType?: unknown; placeTypes?: unknown; category?: unknown; country?: unknown }): Promise<IndustryInfo> {
  const k = o.placeId ? await placeKind(String(o.placeId)) : null;
  if (k && (k.ptype || k.types.length)) return { ind: industryOf(k.ptype, k.types), ptype: k.ptype, types: k.types, cc: k.cc, src: "google" };
  const pt = clip(o.placeType, 60).toLowerCase().replace(/[^a-z_]/g, "");
  const pts = (Array.isArray(o.placeTypes) ? o.placeTypes : []).slice(0, 12).map((t) => clip(t, 60).toLowerCase().replace(/[^a-z_]/g, "")).filter(Boolean);
  const cc = (k && k.cc) || "";
  if (pt || pts.length) return { ind: industryOf(pt, pts), ptype: pt, types: pts, cc, src: "client" };
  const d = industryFromDisplay(clip(o.category, 120));
  return { ind: d, ptype: "", types: [], cc, src: d === "unknown" ? "none" : "display" };
}

export type Tier = { fresh: number; prem: boolean; ind: IndustryKey; ptype: string; cc: string; legacy: boolean; src: string };

/** Frisch-Preis je Bewertung für diese Bestellung. country = Land des Profils laut Bestellung (Fallback, wenn Google nichts liefert). */
export async function resolveTier(o: { email?: unknown; placeId?: unknown; placeType?: unknown; placeTypes?: unknown; category?: unknown; country?: unknown }): Promise<Tier> {
  const [legacy, info] = await Promise.all([isExistingCustomer(String(o.email || "")), industryInfo(o)]);
  const cc = info.cc || (/^[A-Z]{2}$/.test(String(o.country || "").toUpperCase()) ? String(o.country).toUpperCase() : "");
  // Premium nur nach Google-/Browser-Code – nicht nach dem übersetzten Namen (zu ungenau für einen Preis).
  const prem = info.src !== "display" && isPremiumIndustry(info.ind);
  const fresh = legacy ? PRICE_V2_FRESH : freshPriceFor(cc, prem);
  return { fresh, prem, ind: info.ind, ptype: info.ptype, cc, legacy, src: info.src };
}

const hits = new Map<string, number[]>();
function limited(key: string, max: number, ms = 3600_000) {
  const now = Date.now();
  const a = (hits.get(key) || []).filter((t) => now - t < ms);
  if (a.length >= max) { hits.set(key, a); return true; }
  a.push(now); hits.set(key, a);
  if (hits.size > 20000) hits.clear();
  return false;
}

export function registerPriceTier(app: FastifyInstance, adminToken: string) {
  /* Wizard/Chat: Preis je Bewertung für dieses Profil (+ E-Mail, sobald bekannt). Antwort enthält bewusst nur den Preis. */
  app.post("/price-quote", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    if (limited("pq:" + ip, 60)) return reply.code(429).send({ ok: false, error: "rate limited" });
    // Website-Chat (Profil-Löschung): nur der Profil-Link ist bekannt → zu placeId auflösen (wie /chat/site/order).
    let placeId = clip(b.placeId, 200);
    const link = clip(b.link, 500);
    if (!placeId && /^https?:\/\/\S+$/i.test(link)) placeId = await resolveReviewLink(link).then((r) => r.place?.placeId || "").catch(() => "");
    const t = await resolveTier({ email: b.email, placeId, placeType: b.placeType, placeTypes: b.placeTypes, country: b.country });
    // pp = Profil-Löschung zum Premium-Preis (Premium-Branche, Neukunde) – der Browser rechnet daraus 559/619/1.059/1.189.
    return { ok: true, fresh: t.fresh, cc: t.cc, pp: t.prem && !t.legacy };
  });

  const auth = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  /* Admin: Branchen-Auswertung über ALLE echten Aufträge (ohne Test-Adressen). */
  app.post("/admin/industry-stats", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!auth(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool || !dbReady()) return reply.code(503).send({ ok: false, error: "keine DB" });
    const days = Math.max(0, Math.min(3650, Math.round(Number(b.days) || 0))); // 0 = alle Aufträge
    const r = await pool.query(
      `SELECT id, created_at, email, service, status, pay, amount, country, category, raw->>'ind' AS ind, raw->>'ptype' AS ptype,
              COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(raw->'reviewItems')='array' THEN raw->'reviewItems' END),0) AS n_rev,
              COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(raw->'reviewsRemoved')='array' THEN raw->'reviewsRemoved' END),0) AS n_removed
         FROM orders ${days ? `WHERE created_at > now() - ($1::int * interval '1 day')` : ""}`, days ? [days] : []);
    type Row = { id: string; created_at: string; email: string; service: string; status: string; pay: string; amount: string; country: string; category: string; ind: string | null; ptype: string | null; n_rev: number; n_removed: number };
    type Agg = { ind: string; label: string; orders: number; profile: number; reviews: number; press: number; done: number; storno: number; paid: number; revenue: number; reviewsOrdered: number; reviewsRemoved: number; countries: Record<string, number>; ptypes: Record<string, number> };
    const by = new Map<string, Agg>();
    let total = 0, fromCode = 0;
    for (const o of r.rows as Row[]) {
      if (isTestEmail(o.email)) continue;
      total++;
      const ind = (o.ind as IndustryKey) || industryFromDisplay(o.category);
      if (o.ind) fromCode++;
      const a = by.get(ind) || { ind, label: INDUSTRY_LABEL[ind as IndustryKey] || ind, orders: 0, profile: 0, reviews: 0, press: 0, done: 0, storno: 0, paid: 0, revenue: 0, reviewsOrdered: 0, reviewsRemoved: 0, countries: {}, ptypes: {} };
      a.orders++;
      if (o.service === "reviews") a.reviews++; else if (o.service === "deindex" || o.service === "orm") a.press++; else a.profile++;
      if (o.status === "done") a.done++;
      if (o.status === "storniert") a.storno++;
      if (o.pay === "paid") { a.paid++; a.revenue += Number(o.amount) || 0; }
      a.reviewsOrdered += Number(o.n_rev) || 0; a.reviewsRemoved += Number(o.n_removed) || 0;
      const cc = String(o.country || "?").toUpperCase(); a.countries[cc] = (a.countries[cc] || 0) + 1;
      if (o.ptype) a.ptypes[o.ptype] = (a.ptypes[o.ptype] || 0) + 1;
      by.set(ind, a);
    }
    const rows = [...by.values()].map((a) => ({ ...a, revenue: Math.round(a.revenue), premium: isPremiumIndustry(a.ind) })).sort((x, y) => y.orders - x.orders);
    return { ok: true, total, fromCode, rows };
  });

  /* Admin: Altaufträge nachtragen (raw.ind/ptype). Mit placeId → Google, sonst übersetzter Kategorie-Name. Läuft in Etappen. */
  app.post("/admin/industry-backfill", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!auth(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool || !dbReady()) return reply.code(503).send({ ok: false, error: "keine DB" });
    const limit = Math.max(1, Math.min(300, Math.round(Number(b.limit) || 100)));
    const r = await pool.query(`SELECT id, category, country, raw->>'placeId' AS pid FROM orders WHERE raw->>'ind' IS NULL ORDER BY created_at DESC LIMIT $1`, [limit]);
    let google = 0, display = 0, none = 0;
    for (const o of r.rows as { id: string; category: string; country: string; pid: string | null }[]) {
      const info = await industryInfo({ placeId: o.pid || "", category: o.category, country: o.country });
      if (info.src === "google") google++; else if (info.src === "display") display++; else none++;
      await pool.query(`UPDATE orders SET raw = COALESCE(raw,'{}'::jsonb) || jsonb_build_object('ind',$2::text,'ptype',$3::text,'indSrc',$4::text) WHERE id=$1`,
        [o.id, info.ind, info.ptype || "", info.src + "-backfill"]);
    }
    const left = await pool.query(`SELECT count(*)::int AS n FROM orders WHERE raw->>'ind' IS NULL`);
    return { ok: true, done: r.rows.length, google, display, none, left: Number(left.rows[0]?.n || 0) };
  });
}
