/* „Neuer Auftrag" direkt im Kunden-Dashboard (10/2026) – gleicher Ablauf wie auf der Website, nur ohne Formular:
 *   Profil wählen (eigene Profile oder suchen) → Leistung (Bewertungen / Profil) → Bewertungen auswählen → Prüfen & beauftragen
 *   → danach im Dashboard der Start-Ablauf (Gründe je Bewertung → ggf. Nachweis → ggf. Zahlungsart).
 * Kontaktdaten kommen aus dem Konto (letzte Bestellung), die Bewertungen nur aus der Server-Liste des Profils (SerpApi) –
 * der Browser schickt nur IDs. Bestellt wird über denselben /order-Handler wie die Website (app.inject), damit Mails,
 * Doppel-Prüfung, Preise, Gates und Partner-Board identisch laufen.
 *
 *   POST /cust/new/reviews  { token, placeId, lang }       → Bewertungen des Profils (alle Sterne), schon beauftragte markiert
 *   POST /cust/new/order    { token, service, place, ids, agb, fagg, payPref, lang }
 *   POST /cust/new/alerts   { token }                      → neue negative Bewertungen (≤ 3 ★, ≤ 30 Tage, noch nicht beauftragt)
 *                                                           auf den Profilen des Kunden – Karte auf der Startseite */
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { customerSessionInfo } from "./customers";
import { fetchPlaceReviews, serpKey, type FetchedReview } from "./reviewsFetch";
import { payDiscountEnabled } from "./partner";
import { reviewMethod, quoteReviews } from "./reviewsPricing";
import { logCustEvent } from "./custTrack";

const MAIL_LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const normU = (u?: string) => String(u || "").trim().replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
const normT = (s?: string) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const PLACE_RE = /^[A-Za-z0-9_-]{10,200}$/;
const ALERT_DAYS = 30;

type Seen = { u: string; nt: string; n: string };
type Item = { url?: string; name?: string; text?: string };

/** Bewertungen, die der Kunde schon beauftragt hat (offene Aufträge, gleiche E-Mail, 365 Tage). */
async function seenOf(email: string): Promise<Seen[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT raw->'reviewItems' AS items FROM orders
      WHERE service='reviews' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '365 days' AND lower(email)=lower($1)`, [email]);
  const out: Seen[] = [];
  for (const row of r.rows) for (const it of (Array.isArray(row.items) ? row.items : []) as Item[]) {
    out.push({ u: normU(it.url), nt: it.name && it.text ? normT(it.name) + "|" + normT(it.text).slice(0, 80) : "", n: it.name && !it.text ? normT(it.name) : "" });
  }
  return out;
}
const isSeen = (seen: Seen[], r: FetchedReview) => seen.some((x) =>
  (r.link && x.u && x.u === normU(r.link))
  || (r.name && r.text && x.nt && x.nt === normT(r.name) + "|" + normT(r.text).slice(0, 80))
  || (r.name && !r.text && x.n && x.n === normT(r.name)));

/** Pro Kunde höchstens 30 Listen je Stunde (SerpApi-Kosten). */
const hits = new Map<string, number[]>();
function allowed(key: string, max: number): boolean {
  const now = Date.now(), arr = (hits.get(key) || []).filter((t) => now - t < 3600e3);
  if (arr.length >= max) return false;
  arr.push(now); hits.set(key, arr); return true;
}

/** Kontaktdaten des Kunden aus seiner letzten Bestellung. */
async function contactOf(email: string): Promise<{ name: string; phone: string; company: string; lang: string }> {
  if (!pool) return { name: "", phone: "", company: "", lang: "en" };
  const r = await pool.query(`SELECT name, phone, company, lang FROM orders WHERE lower(email)=lower($1) ORDER BY created_at DESC LIMIT 1`, [email]).catch(() => ({ rows: [] as Record<string, string>[] }));
  const o = r.rows[0] || {};
  return { name: String(o.name || ""), phone: String(o.phone || ""), company: String(o.company || ""), lang: String(o.lang || "en") };
}

/** Profile, für die der Kunde schon Bewertungen beauftragt hat (für die Karte „neue negative Bewertung"). */
async function profilesOf(email: string): Promise<{ placeId: string; name: string; lang: string }[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT DISTINCT ON (raw->>'placeId') raw->>'placeId' AS pid, COALESCE(NULLIF(company,''), profile, raw->>'placeName') AS name, lang
       FROM orders WHERE lower(email)=lower($1) AND service='reviews' AND COALESCE(status,'') <> 'storniert' AND COALESCE(raw->>'placeId','') <> ''
      ORDER BY raw->>'placeId', created_at DESC`, [email]).catch(() => ({ rows: [] as Record<string, string>[] }));
  return r.rows.filter((x) => PLACE_RE.test(String(x.pid || ""))).slice(0, 3).map((x) => ({ placeId: String(x.pid), name: String(x.name || ""), lang: MAIL_LANGS.includes(String(x.lang)) ? String(x.lang) : "en" }));
}

export function registerCustNewOrderRoutes(app: FastifyInstance): void {
  // Bewertungen eines Profils (alle Sterne; im Dashboard standardmäßig 1–3 ★ gefiltert wie auf der Website).
  app.post("/cust/new/reviews", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    const placeId = clip(b.placeId, 200);
    if (!PLACE_RE.test(placeId)) return reply.code(400).send({ ok: false, error: "place" });
    if (!serpKey()) return { ok: true, enabled: false, reviews: [] };
    if (!allowed("l:" + s.email.toLowerCase(), 30)) return reply.code(429).send({ ok: false, error: "too_many" });
    const lang = MAIL_LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : "en";
    try {
      const [list, seen] = await Promise.all([fetchPlaceReviews(placeId, lang), seenOf(s.email)]);
      const discOn = await payDiscountEnabled("reviews").catch(() => true);
      return {
        ok: true, enabled: true, payDisc: discOn,
        reviews: list.map((r) => ({ id: r.id, name: r.name, photo: r.photo, rating: r.rating, days: r.days, text: (r.text || "").slice(0, 600), link: r.link, ordered: isSeen(seen, r) })),
      };
    } catch (e) { return reply.code(502).send({ ok: false, error: "fetch" }); }
  });

  // Auftrag anlegen – über denselben /order-Handler wie die Website.
  app.post("/cust/new/order", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "imp" });
    if (b.agb !== true || b.fagg !== true) return reply.code(400).send({ ok: false, error: "consent" });
    if (!allowed("o:" + s.email.toLowerCase(), 6)) return reply.code(429).send({ ok: false, error: "too_many" });
    const service = b.service === "remove" ? "remove" : b.service === "reviews" ? "reviews" : "";
    if (!service) return reply.code(400).send({ ok: false, error: "service" });
    const pl = (b.place || {}) as Record<string, unknown>;
    const placeId = clip(pl.placeId, 200), pname = clip(pl.name, 200), addr = clip(pl.addr, 300);
    const mapsUri = /^https:\/\/\S+$/i.test(clip(pl.mapsUri, 500)) ? clip(pl.mapsUri, 500) : "";
    const cc = /^[A-Z]{2}$/.test(clip(pl.cc, 2).toUpperCase()) ? clip(pl.cc, 2).toUpperCase() : "";
    if (!pname) return reply.code(400).send({ ok: false, error: "place" });
    const email = s.email.toLowerCase();
    const c = await contactOf(email);
    const lang = MAIL_LANGS.includes(clip(b.lang, 5)) ? clip(b.lang, 5) : c.lang;
    const dach = ["DE", "AT", "CH"].includes(cc);
    const discOn = await payDiscountEnabled(service === "reviews" ? "reviews" : "profiles").catch(() => true);
    const payPref = discOn && !dach && ["wise", "paypal"].includes(String(b.payPref)) ? String(b.payPref) : "none";
    const orderId = "RR-" + Math.floor(100000 + Math.random() * 899999);
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    const payload: Record<string, unknown> = {
      email, name: c.name || pname, phone: c.phone, company: pname, service, protection: "", lang, orderId,
      profile: pname, addr, mapsUri, placeId: PLACE_RE.test(placeId) ? placeId : "", placeName: pname, placeAddr: addr,
      country: cc || (lang === "en" ? "US" : "DE"), payPref,
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(),
      source: "dashboard", sourceFirst: "dashboard", referrer: "Kunden-Dashboard", landing: "/my-reviews",
    };
    let n = 0;
    if (service === "reviews") {
      if (cc === "DE" || cc === "AT") return reply.code(400).send({ ok: false, error: "reviews_dach" });
      if (!PLACE_RE.test(placeId)) return reply.code(400).send({ ok: false, error: "place" });
      const ids = Array.isArray(b.ids) ? (b.ids as unknown[]).map((x) => clip(x, 200)).filter(Boolean).slice(0, 40) : [];
      if (!ids.length) return reply.code(400).send({ ok: false, error: "empty" });
      let list: FetchedReview[] = [];
      try { list = await fetchPlaceReviews(placeId, lang); } catch { return reply.code(502).send({ ok: false, error: "fetch" }); }
      const seen = await seenOf(email);
      const picks = list.filter((r) => ids.includes(r.id) && !isSeen(seen, r));
      if (!picks.length) return reply.code(409).send({ ok: false, error: "already_ordered" });
      // Gleiche Regeln wie im Website-Wizard: ohne Text = Spezialverfahren (nt), älter als 4 Wochen = old (US: Software).
      const items = picks.map((r) => {
        const text = String(r.text || "").trim();
        const old = r.days > 28;
        const sw = reviewMethod({ text, days: r.days }, cc) === "sw";
        return {
          ...(r.link ? { url: r.link } : {}), name: clip(r.name, 80), ...(text ? { text: clip(text, 400) } : {}),
          ...(!text ? { nt: true } : old ? (sw ? { old: true, sw: true } : { old: true }) : {}),
          ...(r.rating >= 1 && r.rating <= 5 ? { rating: r.rating } : {}), ...(r.days >= 0 ? { days: r.days } : {}),
        };
      });
      const q = quoteReviews(items as never[], cc === "US" ? "usd" : "eur");
      n = items.length;
      Object.assign(payload, {
        reviewItems: items, reviewUrls: items.map((x) => (x as { url?: string }).url).filter(Boolean), reviewCount: items.length,
        profileCountry: cc || undefined, amount: q.total, saleTotal: q.total,
        note: `Im Kunden-Dashboard beauftragt${payPref !== "none" ? ` · will per ${payPref === "wise" ? "Wise" : "PayPal"} zahlen (−10 %)` : ""}\n${items.map((x) => ((x as Item).url || (x as Item).name) + ((x as { old?: boolean }).old ? "  [älter als 4 Wochen]" : "")).join("\n")}`,
      });
    } else {
      const usd = cc === "US";
      const amount = usd ? 495 : 450;
      Object.assign(payload, { amount, saleTotal: amount, note: `Im Kunden-Dashboard beauftragt (Profil löschen)${payPref !== "none" ? ` · will per ${payPref === "wise" ? "Wise" : "PayPal"} zahlen (−10 %)` : ""}${mapsUri ? "\nProfil-Link: " + mapsUri : ""}` });
    }
    const res = await app.inject({ method: "POST", url: "/order", payload, headers: { "content-type": "application/json", "x-forwarded-for": ip, "user-agent": String(req.headers["user-agent"] || "").slice(0, 240) } });
    const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as Record<string, unknown>;
    if (res.statusCode < 400 && j.ok !== false && j.saved === false) return reply.code(503).send({ ok: false, error: "save" });
    if (res.statusCode >= 400 || j.ok === false) return reply.code(res.statusCode >= 400 ? res.statusCode : 400).send({ ok: false, error: String(j.error || "order"), orders: j.orders });
    void logCustEvent(email, "new_order", `Neuer Auftrag im Dashboard: ${orderId} · ${service === "reviews" ? n + " Bewertung(en)" : "Profil löschen"} · ${pname}`, { service, n }, { orderId });
    return { ok: true, orderId };
  });

  // Neue negative Bewertungen auf den Profilen des Kunden (Startseite: „Neue 1-Stern-Bewertung – jetzt löschen lassen").
  app.post("/cust/new/alerts", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (!serpKey()) return { ok: true, alerts: [] };
    if (!allowed("a:" + s.email.toLowerCase(), 12)) return { ok: true, alerts: [] };
    const profs = await profilesOf(s.email);
    if (!profs.length) return { ok: true, alerts: [] };
    const seen = await seenOf(s.email);
    const out: { placeId: string; business: string; reviews: { id: string; name: string; rating: number; days: number; text: string }[] }[] = [];
    for (const p of profs) {
      const list = await fetchPlaceReviews(p.placeId, p.lang).catch(() => [] as FetchedReview[]);
      const fresh = list.filter((r) => r.rating >= 1 && r.rating <= 3 && r.days >= 0 && r.days <= ALERT_DAYS && !isSeen(seen, r));
      if (fresh.length) out.push({ placeId: p.placeId, business: p.name, reviews: fresh.slice(0, 10).map((r) => ({ id: r.id, name: r.name, rating: r.rating, days: r.days, text: (r.text || "").slice(0, 200) })) });
    }
    return { ok: true, alerts: out };
  });
}
