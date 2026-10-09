/* Neue Bestellung direkt im Kunden-Dashboard (10/2026).
 *
 * Eingeloggter Kunde bestellt die Löschung von Bewertungen eines (beliebigen eigenen) Google-Profils:
 *   1) Profil suchen (Browser, Places API – wie im Website-Wizard)
 *   2) POST /cust/new-order/reviews { token, placeId } → Bewertungen 1–3 ★ (SerpApi, Cache), schon beauftragte markiert
 *   3) POST /cust/new-order { token, place, ids, agb } → legt den Auftrag über dieselbe Strecke wie die Website an
 *      (POST /order intern): Preise, Mails, Gründe-Schritt, Zahlungsart-Pflicht, Partner-Zuteilung – alles wie gewohnt.
 * Kundendaten (Name, E-Mail, Telefon, Firma) kommen aus dem Konto, nicht aus dem Browser.
 * Sichtbar: Test-Konten immer; alle Kunden, sobald partner_settings „dash_new_order" = "1" (Admin-Freigabe). */
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { pool } from "./db";
import { customerSessionInfo, loadCustomerOrders, keyOf } from "./customers";
import { fetchPlaceReviews, serpKey } from "./reviewsFetch";
import { isTestEmail } from "./testAccounts";

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

async function setting(key: string): Promise<string | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]).catch(() => ({ rows: [] as { value: string }[] }));
  return r.rows[0]?.value ?? null;
}
/** Darf dieser Kunde im Dashboard neu bestellen? */
export async function newOrderEnabled(email: string): Promise<boolean> {
  if (!serpKey()) return false;
  return isTestEmail(email) || (await setting("dash_new_order")) === "1";
}

/** Schon beauftragte Bewertungen dieses Kunden (alle Aufträge) – Schlüssel wie im Auftrag. */
async function orderedKeys(email: string): Promise<Set<string>> {
  const s = new Set<string>();
  if (!pool) return s;
  const r = await pool.query(`SELECT raw->'reviewItems' AS items FROM orders WHERE lower(email)=$1 AND service='reviews' AND COALESCE(status,'') <> 'storniert'`, [email]).catch(() => ({ rows: [] as { items: unknown }[] }));
  for (const row of r.rows as { items: unknown }[]) for (const it of (Array.isArray(row.items) ? row.items : []) as Record<string, string>[]) { s.add(keyOf(it)); if (it.name) s.add(`${it.name}|${it.text || ""}`); }
  return s;
}

const hits = new Map<string, number[]>();
const limited = (k: string, n: number) => { const now = Date.now(); const a = (hits.get(k) || []).filter((x) => now - x < 3600_000); if (a.length >= n) { hits.set(k, a); return true; } a.push(now); hits.set(k, a); return false; };

async function listFor(placeId: string, lang: string, email: string) {
  const list = await fetchPlaceReviews(placeId, lang);
  const seen = await orderedKeys(email);
  return list.filter((r) => r.rating >= 1 && r.rating <= 3).map((r) => {
    const key = r.link || `${r.name}|${r.text || ""}`;
    return { id: r.id, name: r.name, photo: r.photo, rating: r.rating, days: r.days, text: (r.text || "").slice(0, 400), link: r.link, ordered: seen.has(key) || seen.has(`${r.name}|${r.text || ""}`) };
  });
}

export function registerCustNewOrder(app: FastifyInstance): void {
  // Darf der Kunde neu bestellen? (Button im Dashboard, Chatbot)
  app.post("/cust/new-order/info", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    return { ok: true, enabled: await newOrderEnabled(s.email.toLowerCase()) };
  });

  // Bewertungen eines Profils zum Anhaken.
  app.post("/cust/new-order/reviews", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    const email = s.email.toLowerCase();
    if (!(await newOrderEnabled(email))) return reply.code(403).send({ ok: false, error: "disabled" });
    const placeId = clip(b.placeId, 200);
    if (!/^[A-Za-z0-9_-]{10,200}$/.test(placeId)) return reply.code(400).send({ ok: false, error: "place" });
    if (limited("l:" + email, 40)) return reply.code(429).send({ ok: false, error: "rate" });
    const lang = LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : "en";
    try { return { ok: true, reviews: await listFor(placeId, lang, email) }; }
    catch (e) { app.log.error({ err: e }, "Dashboard-Neubestellung: Bewertungen laden fehlgeschlagen"); return reply.code(502).send({ ok: false, error: "fetch" }); }
  });

  // Auftrag anlegen (über POST /order – gleiche Logik wie die Website).
  app.post("/cust/new-order", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const email = s.email.toLowerCase();
    if (!(await newOrderEnabled(email))) return reply.code(403).send({ ok: false, error: "disabled" });
    if (b.agb !== true) return reply.code(400).send({ ok: false, error: "agb" });
    if (limited("o:" + email, 10)) return reply.code(429).send({ ok: false, error: "rate" });
    const p = (b.place && typeof b.place === "object" ? b.place : {}) as Record<string, unknown>;
    const placeId = clip(p.placeId, 200);
    if (!/^[A-Za-z0-9_-]{10,200}$/.test(placeId)) return reply.code(400).send({ ok: false, error: "place" });
    const cc = clip(p.cc, 2).toUpperCase();
    if (cc === "DE" || cc === "AT") return reply.code(400).send({ ok: false, error: "reviews_dach" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map((x) => clip(x, 200)).filter(Boolean).slice(0, 20);
    if (!ids.length) return reply.code(400).send({ ok: false, error: "empty" });
    const lang = LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : "en";
    // Nur Bewertungen aus der Server-Liste des Profils (nicht vom Browser), 1–3 ★, noch nicht beauftragt.
    let list: Awaited<ReturnType<typeof listFor>>;
    try { list = await listFor(placeId, lang, email); } catch { return reply.code(502).send({ ok: false, error: "fetch" }); }
    const picks = list.filter((r) => ids.includes(r.id) && !r.ordered);
    if (!picks.length) return reply.code(409).send({ ok: false, error: "already_ordered" });
    // Kundendaten aus dem Konto (letzter Auftrag).
    const cust = await loadCustomerOrders(email).catch(() => ({ name: "", lang, orders: [] as never[] }));
    const last = pool ? (await pool.query(`SELECT name, phone, company, country, raw->>'payPref' AS pp FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [email]).catch(() => ({ rows: [] as Record<string, string | null>[] }))).rows[0] || {} : {};
    const items = picks.map((r) => {
      const nt = !String(r.text || "").trim(), old = r.days > 28;
      return { ...(r.link ? { url: r.link } : {}), name: r.name, ...(r.text ? { text: r.text } : {}), ...(nt ? { nt: true } : old ? { old: true } : {}), rating: r.rating, ...(r.days >= 0 ? { days: r.days } : {}) };
    });
    const orderId = "RR-" + (100000 + crypto.randomInt(900000));
    const name = clip(p.name, 200);
    const payload: Record<string, unknown> = {
      email, name: cust.name || last.name || "", phone: last.phone || "", company: name || last.company || "",
      service: "reviews", protection: "", orderId, lang, country: cc || last.country || "XX",
      profile: name, addr: clip(p.addr, 300), mapsUri: clip(p.mapsUri, 500), placeId, placeName: name, placeAddr: clip(p.addr, 300), profileCountry: cc,
      reviewItems: items, reviewUrls: items.map((x) => x.url).filter(Boolean), reviewCount: items.length,
      note: `Neue Bestellung im Kunden-Dashboard (${items.length} Bewertung${items.length === 1 ? "" : "en"})\n${items.map((x) => x.url || `${x.name} — "${x.text || ""}"`).join("\n")}`,
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(),
      // Zahlungswunsch aus dem letzten Auftrag übernehmen (PayPal/Wise −10 %), sonst Karte/hinterlegte Zahlungsart.
      ...(last.pp === "paypal" || last.pp === "wise" ? { payPref: last.pp } : {}),
      source: "dashboard", sourceFirst: "dashboard", referrer: "Kunden-Dashboard", landing: "/my-reviews",
    };
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    const res = await app.inject({ method: "POST", url: "/order", payload, headers: { "content-type": "application/json", "x-forwarded-for": ip, "user-agent": String(req.headers["user-agent"] || "").slice(0, 240) } });
    const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as Record<string, unknown>;
    if (res.statusCode >= 400 || j.ok === false) return reply.code(res.statusCode >= 400 ? res.statusCode : 400).send({ ok: false, error: String(j.error || "order") });
    if (j.saved === false) return reply.code(503).send({ ok: false, error: "save" });
    return { ok: true, orderId, n: items.length };
  });
}
