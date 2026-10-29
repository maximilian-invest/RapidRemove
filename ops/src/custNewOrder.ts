/* Neue Bestellung direkt im Kunden-Dashboard (10/2026).
 *
 * 14.10.2026 „Pick reviews by hand" = Bewertungs-Links einzeln einfügen (+ Link), jeder wird geprüft, Preis sofort:
 *   POST /cust/new-order/scan  { token, link }            → Bewertung (Autor, Sterne, Text, Alter), Profil, Land, schon beauftragt?
 *   POST /cust/new-order/links { token, links, agb, fagg } → Auftrag (nur Links, die der Server selbst geprüft hat)
 * Die Profil-Suche unten bleibt als Schnittstelle bestehen, das Dashboard nutzt sie nicht mehr.
 *
 * Eingeloggter Kunde bestellt die Löschung von Bewertungen eines (beliebigen eigenen) Google-Profils:
 *   1) Profil suchen (Browser, Places API – wie im Website-Wizard)
 *   2) POST /cust/new-order/reviews { token, placeId } → Bewertungen 1–3 ★ (SerpApi, Cache), schon beauftragte markiert
 *   3) POST /cust/new-order { token, place, ids, agb } → legt den Auftrag über dieselbe Strecke wie die Website an
 *      (POST /order intern): Preise, Mails, Gründe-Schritt, Zahlungsart-Pflicht, Partner-Zuteilung – alles wie gewohnt.
 * Kundendaten (Name, E-Mail, Telefon, Firma) kommen aus dem Konto, nicht aus dem Browser.
 * Sichtbar: Test-Konten immer; alle Kunden, sobald partner_settings „dash_new_order" = "1" (Admin-Freigabe). */
import { riskPass } from "./riskConsent";
import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { pool } from "./db";
import { customerSessionInfo, loadCustomerOrders, keyOf } from "./customers";
import { fetchPlaceReviews, serpKey } from "./reviewsFetch";
import { isTestEmail } from "./testAccounts";
import { dashNewOrderOn, pricingFor, orderPricing, custSetup } from "./bulkPricing";
import { bulkEnabled, BULK_INTERNAL } from "./custBulk";
import { resolveReviewLink } from "./monitor";
import { findPlaceReview } from "./reviewsFetch";
import { cleanUrl, classifyLink } from "./bulkParse";
import { addrCountry } from "./addrCountry";

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

async function setting(key: string): Promise<string | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]).catch(() => ({ rows: [] as { value: string }[] }));
  return r.rows[0]?.value ?? null;
}
/** Darf dieser Kunde im Dashboard neu bestellen? */
export async function newOrderEnabled(email: string): Promise<boolean> {
  // 14.10.2026: für alle Kunden an (Admin → Preise & Bulk kann es ausschalten). Profil-Suche braucht SerpApi.
  if (!serpKey()) return false;
  return isTestEmail(email) || (await dashNewOrderOn());
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
    const em = s.email.toLowerCase();
    const hand = await newOrderEnabled(em), bulk = await bulkEnabled(em);
    return { ok: true, enabled: hand || bulk, hand, bulk };
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
    const setup = await custSetup(email).catch(() => null); // vom Admin angelegtes Dashboard: Name für den ersten Auftrag
    const items = picks.map((r) => {
      const nt = !String(r.text || "").trim(), old = r.days > 28;
      return { ...(r.link ? { url: r.link } : {}), name: r.name, ...(r.text ? { text: r.text } : {}), ...(nt ? { nt: true } : old ? { old: true } : {}), rating: r.rating, ...(r.days >= 0 ? { days: r.days } : {}) };
    });
    const orderId = "RR-" + (100000 + crypto.randomInt(900000));
    const name = clip(p.name, 200);
    const payload: Record<string, unknown> = {
      email, name: cust.name || last.name || setup?.name || "", phone: last.phone || "", company: name || last.company || "",
      service: "reviews", protection: "", orderId, lang, country: cc || last.country || "XX",
      profile: name, addr: clip(p.addr, 300), mapsUri: clip(p.mapsUri, 500), placeId, placeName: name, placeAddr: clip(p.addr, 300), profileCountry: cc,
      reviewItems: items, reviewUrls: items.map((x) => x.url).filter(Boolean), reviewCount: items.length,
      note: `Neue Bestellung im Kunden-Dashboard (${items.length} Bewertung${items.length === 1 ? "" : "en"})\n${items.map((x) => x.url || `${x.name} — "${x.text || ""}"`).join("\n")}`,
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(),
      ...riskPass(b), // „Bestellung auf eigenes Risiko" – Nachweis baut /order
      // Zahlungswunsch aus dem letzten Auftrag übernehmen (PayPal/Wise −10 %), sonst Karte/hinterlegte Zahlungsart.
      ...(last.pp === "paypal" || last.pp === "wise" ? { payPref: last.pp } : {}),
      source: "dashboard", sourceFirst: "dashboard", referrer: "Kunden-Dashboard", landing: "/my-reviews",
      // Express (+100 je 250er) – Zwischenschritt „Wie schnell?" im Dashboard (17.10.2026), Regeln wie im Website-Bestellprozess.
      ...(b.express === true ? { reviewExpress: true } : {}),
    };
    // Eigene Staffel des Kunden (Admin → Kunden & Preise) gilt auch für Bestellungen von Hand (Standard-Staffel nur für Bulk);
    // Partner-Konditionen des Kunden gelten immer.
    const pr = await pricingFor(email).catch(() => null);
    const op = pr ? orderPricing(pr, items.length, { flat: pr.source === "custom" }) : null;
    if (op) payload.pricing = op;
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    const res = await app.inject({ method: "POST", url: "/order", payload, headers: { "content-type": "application/json", "x-rr-bulk": BULK_INTERNAL, "x-forwarded-for": ip, "user-agent": String(req.headers["user-agent"] || "").slice(0, 240) } });
    const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as Record<string, unknown>;
    if (res.statusCode >= 400 || j.ok === false) return reply.code(res.statusCode >= 400 ? res.statusCode : 400).send({ ok: false, error: String(j.error || "order") });
    if (j.saved === false) return reply.code(503).send({ ok: false, error: "save" });
    return { ok: true, orderId, n: items.length };
  });

  // ---- Bewertungs-Links einzeln (Pick reviews by hand) ----
  // Prüfergebnisse je Kunde + Link (2 Std.) – beim Bestellen wird nur verwendet, was der Server selbst geprüft hat.
  type Scan = { url: string; found: boolean; name?: string; text?: string; rating?: number; days?: number;
    place: { placeId: string; name: string; addr: string; mapsUri: string; cc: string } | null };
  const scans = new Map<string, { ts: number; s: Scan }>();
  const norm = (u: string) => cleanUrl(u).replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
  const orderedUrl = async (email: string, url: string, rid: string) => {
    const seen = await orderedKeys(email);
    const n = norm(url);
    for (const k of seen) { if (!/^https?:/i.test(k)) continue; if (norm(k) === n || (rid && k.includes(rid))) return true; }
    return false;
  };
  async function scanLink(email: string, raw: string, lang: string): Promise<{ s?: Scan; rid?: string; error?: string }> {
    const link = cleanUrl(String(raw || "")).slice(0, 600);
    if (!/^https?:\/\/\S+$/i.test(link)) return { error: "not_review" };
    const c0 = classifyLink(link);
    if (c0.kind === "notReview") return { error: "profile_link" };
    if (c0.kind === "other") return { error: "not_review" };
    const ck = email + "|" + norm(link);
    const hit = scans.get(ck);
    if (hit && Date.now() - hit.ts < 2 * 3600_000) return { s: hit.s, rid: (hit.s.url.match(/!1s(C[A-Za-z0-9_-]{16,})/) || [])[1] || "" };
    const { place, reviewId, url } = await resolveReviewLink(link);
    if (!reviewId) return { error: "not_review" };
    const pl = place && place.placeId ? { placeId: place.placeId, name: place.name || "", addr: place.address || "", mapsUri: place.mapsUrl || "", cc: addrCountry(place.address) } : null;
    const r = pl && serpKey() ? await findPlaceReview(pl.placeId, reviewId, lang).catch(() => null) : null;
    const s: Scan = { url: r?.link || (/^https?:/i.test(url) ? url : link), found: !!r, place: pl,
      ...(r ? { name: r.name, text: (r.text || "").slice(0, 2000), rating: r.rating, days: r.days } : {}) };
    scans.set(ck, { ts: Date.now(), s });
    if (scans.size > 5000) scans.delete(scans.keys().next().value as string);
    return { s, rid: reviewId };
  }
  const flagsOf = (s: Scan) => {
    const nt = s.found && !String(s.text || "").trim();
    const old = s.found && Number(s.days) > 28;
    return { nt, old, sw: nt || (old && s.place?.cc === "US") };
  };

  app.post("/cust/new-order/scan", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    const email = s.email.toLowerCase();
    if (!(await newOrderEnabled(email))) return reply.code(403).send({ ok: false, error: "disabled" });
    if (limited("s:" + email, 200)) return reply.code(429).send({ ok: false, error: "rate" });
    const lang = LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : "en";
    try {
      const r = await scanLink(email, String(b.link || ""), lang);
      if (r.error || !r.s) return reply.code(400).send({ ok: false, error: r.error || "not_review" });
      const x = r.s, cc = x.place?.cc || "";
      if (cc === "DE" || cc === "AT") return reply.code(400).send({ ok: false, error: "reviews_dach", profile: x.place?.name || "" });
      const ordered = await orderedUrl(email, x.url, r.rid || "");
      return { ok: true, url: x.url, found: x.found, ordered, review: x.found ? { name: x.name, text: x.text, rating: x.rating, days: x.days } : null,
        place: x.place ? { name: x.place.name, addr: x.place.addr, cc } : null, ...flagsOf(x) };
    } catch (e) { app.log.error({ err: e }, "Dashboard: Bewertungs-Link prüfen fehlgeschlagen"); return reply.code(502).send({ ok: false, error: "fetch" }); }
  });

  app.post("/cust/new-order/links", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const email = s.email.toLowerCase();
    if (!(await newOrderEnabled(email))) return reply.code(403).send({ ok: false, error: "disabled" });
    if (b.agb !== true || b.fagg !== true) return reply.code(400).send({ ok: false, error: "agb" });
    if (limited("o:" + email, 10)) return reply.code(429).send({ ok: false, error: "rate" });
    const lang = LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : "en";
    const links = [...new Set((Array.isArray(b.links) ? b.links : []).map((x) => String(x || "").trim()).filter(Boolean))].slice(0, 50);
    if (!links.length) return reply.code(400).send({ ok: false, error: "empty" });
    const got: Scan[] = []; const keys = new Set<string>();
    for (const l of links) {
      const r = await scanLink(email, l, lang).catch(() => ({ error: "fetch" } as { s?: Scan; rid?: string; error?: string }));
      if (!r.s) continue;
      const cc = r.s.place?.cc || "";
      if (cc === "DE" || cc === "AT") return reply.code(400).send({ ok: false, error: "reviews_dach" });
      const k = r.rid || norm(r.s.url);
      if (keys.has(k) || await orderedUrl(email, r.s.url, r.rid || "")) continue;
      keys.add(k); got.push(r.s);
    }
    if (!got.length) return reply.code(409).send({ ok: false, error: "already_ordered" });
    const places = [...new Map(got.filter((x) => x.place).map((x) => [x.place!.placeId, x.place!])).values()];
    const one = places.length === 1 && got.every((x) => x.place) ? places[0] : null;
    const items = got.map((x) => {
      const f = flagsOf(x);
      return { url: x.url, ...(x.found ? { name: x.name, ...(x.text ? { text: x.text } : {}), rating: x.rating, ...(Number(x.days) >= 0 ? { days: x.days } : {}) } : {}),
        ...(f.nt ? { nt: true } : f.old ? { old: true } : {}), ...(!one && x.place ? { business: x.place.name } : {}) };
    });
    const cust = await loadCustomerOrders(email).catch(() => ({ name: "", lang, orders: [] as never[] }));
    const last = pool ? (await pool.query(`SELECT name, phone, company, country, raw->>'payPref' AS pp FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [email]).catch(() => ({ rows: [] as Record<string, string | null>[] }))).rows[0] || {} : {};
    const setup = await custSetup(email).catch(() => null);
    const orderId = "RR-" + (100000 + crypto.randomInt(900000));
    const label = one ? one.name : `${items.length} review${items.length === 1 ? "" : "s"} · ${places.length || 1} profile${places.length > 1 ? "s" : ""}`;
    const cc = one ? one.cc : (places.find((x) => x.cc)?.cc || "");
    const payload: Record<string, unknown> = {
      email, name: cust.name || last.name || setup?.name || "", phone: last.phone || "", company: one ? one.name : last.company || setup?.company || "",
      service: "reviews", protection: "", orderId, lang, country: cc || last.country || "XX",
      profile: label, placeName: label,
      ...(one ? { addr: one.addr, mapsUri: one.mapsUri, placeId: one.placeId, placeAddr: one.addr, profileCountry: one.cc } : {}),
      reviewItems: items, reviewUrls: items.map((x) => x.url), reviewCount: items.length,
      note: `Neue Bestellung im Kunden-Dashboard per Link (${items.length} Bewertung${items.length === 1 ? "" : "en"})\n${items.map((x) => x.url).join("\n")}`,
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(),
      ...riskPass(b), // „Bestellung auf eigenes Risiko" – Nachweis baut /order
      ...(last.pp === "paypal" || last.pp === "wise" ? { payPref: last.pp } : {}),
      source: "dashboard", sourceFirst: "dashboard", referrer: "Kunden-Dashboard (Links)", landing: "/my-reviews",
      ...(b.express === true ? { reviewExpress: true } : {}), // Express-Zwischenschritt im Dashboard
    };
    const pr = await pricingFor(email).catch(() => null);
    const op = pr ? orderPricing(pr, items.length, { flat: pr.source === "custom" }) : null;
    if (op) payload.pricing = op;
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    const res = await app.inject({ method: "POST", url: "/order", payload, headers: { "content-type": "application/json", "x-rr-bulk": BULK_INTERNAL, "x-forwarded-for": ip, "user-agent": String(req.headers["user-agent"] || "").slice(0, 240) } });
    const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as Record<string, unknown>;
    if (res.statusCode >= 400 || j.ok === false) return reply.code(res.statusCode >= 400 ? res.statusCode : 400).send({ ok: false, error: String(j.error || "order") });
    if (j.saved === false) return reply.code(503).send({ ok: false, error: "save" });
    return { ok: true, orderId, n: items.length, skipped: links.length - items.length };
  });
}
