/* Bulk-Upload im Kunden-Dashboard (10/2026): „New order" → „Bulk upload" → Dateien (Word, Excel, CSV, PDF …) oder Text →
 * Vorschau (gefundene Bewertungen, schon beauftragte, Preisstufe) → bestellen.
 *
 *   POST /cust/bulk/info   { token }                              → Preisstaffel des Kontos (transparent für den Kunden)
 *   POST /cust/bulk/parse  { token, files:[{name,b64}], text }    → Vorschau (nichts wird gespeichert)
 *   POST /cust/bulk/order  { token, items, agb, fagg, policy }    → Auftrag über POST /order (interner Aufruf, BULK_INTERNAL)
 *
 * Gemischte Profile erlaubt. Keine Gründe je Bewertung; der Kunde sichert per Häkchen zu, dass die Bewertungen gegen die
 * Google-Richtlinien verstoßen (policyConsent, mit Zeitpunkt/IP). Abgebucht wird wie immer erst je gelöschter Bewertung. */
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { pool } from "./db";
import { customerSessionInfo } from "./customers";
import { parseBulk, classifyLink, cleanUrl, MAX_ITEMS, MAX_FILE_BYTES, type BulkItem } from "./bulkParse";
import { pricingFor, tierFor, dashNewOrderOn, orderPricing, custSetup, type CustPricing } from "./bulkPricing";
import { isTestEmail } from "./testAccounts";

/** Geheim-Header für interne Aufrufe von /order (Bulk + feste Kundenpreise) – wird nie an den Browser gegeben. */
export const BULK_INTERNAL = crypto.randomBytes(24).toString("hex");

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const hits = new Map<string, number[]>();
const limited = (k: string, n: number) => { const now = Date.now(); const a = (hits.get(k) || []).filter((x) => now - x < 3600_000); if (a.length >= n) { hits.set(k, a); return true; } a.push(now); hits.set(k, a); return false; };

/** Was der Kunde sehen darf: seine Staffel + Software-Preis. NIE die Partner-Konditionen. */
const custView = (p: CustPricing) => (p.source === "list" ? null : { cur: p.cur, tiers: p.tiers, sw: p.sw || null, custom: p.source === "custom" });

export async function bulkEnabled(email: string): Promise<boolean> { return isTestEmail(email) || (await dashNewOrderOn()); }

/** Schon beauftragte Bewertungen (120 Tage, wie die Doppel-Prüfung in /order). */
const normU = (u?: string) => String(u || "").trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "");
const normT = (t?: string) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();
async function orderedSet(email: string): Promise<Set<string>> {
  const s = new Set<string>();
  if (!pool) return s;
  const r = await pool.query(`SELECT raw->'reviewItems' AS items FROM orders WHERE lower(email)=$1 AND service='reviews' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '120 days'`, [email]).catch(() => ({ rows: [] as { items: unknown }[] }));
  for (const row of r.rows as { items: unknown }[]) for (const it of (Array.isArray(row.items) ? row.items : []) as Record<string, string>[]) {
    if (it.url) s.add("u:" + normU(it.url));
    if (it.name && it.text) s.add("t:" + normT(it.name) + "|" + normT(it.text).slice(0, 80));
  }
  return s;
}
const isOrdered = (seen: Set<string>, it: { url?: string; name?: string; text?: string }) =>
  (!!it.url && seen.has("u:" + normU(it.url))) || (!!it.name && !!it.text && seen.has("t:" + normT(it.name) + "|" + normT(it.text).slice(0, 80)));

/** Vom Browser zurückgeschickte Einträge erneut prüfen (nie blind übernehmen). */
function sanitize(input: unknown): BulkItem[] {
  const out: BulkItem[] = []; const keys = new Set<string>();
  for (const raw of (Array.isArray(input) ? input : []).slice(0, MAX_ITEMS)) {
    const o = (raw || {}) as Record<string, unknown>;
    const name = clip(o.name, 120), text = clip(o.text, 2000), business = clip(o.business, 200);
    const rt = Math.round(Number(o.rating)); const rating = rt >= 1 && rt <= 5 ? rt : undefined;
    let key = "", url: string | undefined;
    if (o.url) {
      url = cleanUrl(String(o.url)).slice(0, 600);
      const c = classifyLink(url);
      if (c.kind !== "review" && c.kind !== "short") continue;
      key = c.key;
    } else if (name && text) key = "nt:" + `${name}|${text}`.toLowerCase().replace(/\s+/g, " ").slice(0, 300);
    else continue;
    if (keys.has(key)) continue;
    keys.add(key);
    out.push({ key, ...(url ? { url } : {}), ...(name ? { name } : {}), ...(text ? { text } : {}), ...(business ? { business } : {}), ...(rating ? { rating } : {}) });
  }
  return out;
}

export function registerCustBulk(app: FastifyInstance): void {
  // Preisstaffel des Kontos – der Kunde sieht, in welche Stufe er fällt.
  app.post("/cust/bulk/info", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    const email = s.email.toLowerCase();
    const p = await pricingFor(email);
    return { ok: true, enabled: await bulkEnabled(email), maxItems: MAX_ITEMS, maxFileMb: Math.round(MAX_FILE_BYTES / 1048576),
      pricing: custView(p) };
  });

  // Dateien lesen → Vorschau. Speichert nichts.
  app.post("/cust/bulk/parse", { bodyLimit: 80 * 1024 * 1024 }, async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    const email = s.email.toLowerCase();
    if (!(await bulkEnabled(email))) return reply.code(403).send({ ok: false, error: "disabled" });
    if (limited("bp:" + email, 60)) return reply.code(429).send({ ok: false, error: "rate" });
    const files = (Array.isArray(b.files) ? b.files : []).slice(0, 10).map((f) => {
      const o = (f || {}) as Record<string, unknown>;
      return { name: clip(o.name, 200) || "file", data: Buffer.from(String(o.b64 || ""), "base64") };
    }).filter((f) => f.data.length);
    const text = clip(b.text, 2_000_000);
    if (!files.length && !text.trim()) return reply.code(400).send({ ok: false, error: "empty" });
    let r;
    try { r = await parseBulk(files, text); }
    catch (e) { app.log.error({ err: e }, "Bulk-Upload: Lesen fehlgeschlagen"); return reply.code(422).send({ ok: false, error: "unreadable" }); }
    const seen = await orderedSet(email);
    const fresh = r.items.filter((it) => !isOrdered(seen, it));
    const already = r.items.length - fresh.length;
    const p = await pricingFor(email);
    const tier = p.source !== "list" && fresh.length ? tierFor(p.tiers, fresh.length) : null;
    return {
      ok: true, items: fresh.map(({ key: _k, ...x }) => x), n: fresh.length, already, dupInFile: r.dupInFile,
      notReview: r.notReview, notReviewN: r.notReviewN, noLinkRows: r.noLinkRows, truncated: r.truncated, files: r.files,
      shortN: fresh.filter((x) => x.url && classifyLink(x.url).kind === "short").length,
      pricing: custView(p), tier,
    };
  });

  // Bestellen: alle neuen Bewertungen als EIN Auftrag (gemischte Profile), Preis = Stufe nach Anzahl.
  app.post("/cust/bulk/order", { bodyLimit: 20 * 1024 * 1024 }, async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const email = s.email.toLowerCase();
    if (!(await bulkEnabled(email))) return reply.code(403).send({ ok: false, error: "disabled" });
    if (b.agb !== true || b.fagg !== true || b.policy !== true) return reply.code(400).send({ ok: false, error: "agb" });
    if (limited("bo:" + email, 10)) return reply.code(429).send({ ok: false, error: "rate" });
    const seen = await orderedSet(email);
    const items = sanitize(b.items).filter((it) => !isOrdered(seen, it));
    if (!items.length) return reply.code(409).send({ ok: false, error: "already_ordered" });
    const lang = LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : "en";
    const p = await pricingFor(email);
    const tier = p.source !== "list" ? tierFor(p.tiers, items.length) : null;
    const op = orderPricing(p, items.length, { flat: true });
    const setup = await custSetup(email); // vom Admin angelegt: Name/Firma/Sprache für Kunden ohne frühere Bestellung
    const last = pool ? (await pool.query(`SELECT name, phone, company, country, raw->>'payPref' AS pp FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [email]).catch(() => ({ rows: [] as Record<string, string | null>[] }))).rows[0] || {} : {};
    const orderId = "RR-" + (100000 + crypto.randomInt(900000));
    const label = `Bulk upload · ${items.length} review${items.length === 1 ? "" : "s"}`;
    const payload: Record<string, unknown> = {
      email, name: last.name || setup?.name || "", phone: last.phone || "", company: last.company || setup?.company || "",
      service: "reviews", protection: "", orderId, lang, country: last.country && last.country !== "XX" ? last.country : "XX",
      profile: label, placeName: label,
      bulk: true,
      ...(op ? { pricing: op } : {}),
      reviewItems: items.map(({ key: _k, ...x }) => x), reviewUrls: items.map((x) => x.url).filter(Boolean), reviewCount: items.length,
      note: `Bulk-Upload im Kunden-Dashboard: ${items.length} Bewertung(en)${tier ? ` · Stufe ${tier.from}${tier.to ? "–" + tier.to : "+"} → ${tier.price} ${p.cur.toUpperCase()} je gelöschter Bewertung (${p.source === "custom" ? "eigene Staffel" : "Standard-Staffel"})` : ""}`,
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(), policyConsent: true, policyV: clip(b.policyV, 20) || "bulk-2026-10-14",
      ...(last.pp === "paypal" || last.pp === "wise" ? { payPref: last.pp } : {}),
      source: "dashboard", sourceFirst: "dashboard", referrer: "Kunden-Dashboard (Bulk)", landing: "/my-reviews",
    };
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    const res = await app.inject({ method: "POST", url: "/order", payload, headers: { "content-type": "application/json", "x-rr-bulk": BULK_INTERNAL, "x-forwarded-for": ip, "user-agent": String(req.headers["user-agent"] || "").slice(0, 240) } });
    const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as Record<string, unknown>;
    if (res.statusCode >= 400 || j.ok === false) return reply.code(res.statusCode >= 400 ? res.statusCode : 400).send({ ok: false, error: String(j.error || "order") });
    if (j.saved === false) return reply.code(503).send({ ok: false, error: "save" });
    return { ok: true, orderId, n: items.length, tier, cur: tier ? p.cur : null };
  });
}
