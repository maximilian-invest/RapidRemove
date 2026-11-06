/* Zahlungslinks für Profil-Löschungen zu Preisen ohne eigenen Stripe-Link (06.11.2026).
 *
 * Bisher: Admin/Mahnlauf sucht einen BESTEHENDEN Link, dessen Positionen exakt passen (matchPaymentLink). Mit den
 * Branchen-Preisen (559/619, 1.059/1.189, Express 708/768) kommen neue Beträge dazu. Die Haupt-Kombinationen sind in Stripe
 * vorab angelegt (metadata rapidremove_profile). Fehlt trotzdem einer (z. B. Neustart 850 €), legt ensureProfileLink() ihn an:
 *
 *  - NUR für Listenpreise (PROFILE_LIST_PRICES, ± Express 149) – keine frei erfundenen Beträge.
 *  - Vorlage = bestehender Link mit derselben Schutz-Position (gleicher Schutz-Preis, gleiche Währung). Von dort werden
 *    Schutz-Preis, Produkt und alle Einstellungen 1:1 übernommen: Stripe Tax (automatic_tax), UID-Abfrage (tax_id_collection),
 *    Rechnungsadresse Pflicht, Rechnung mit unserer UID in der Fußzeile (nur Einmalzahlung – Abos erstellen eigene Rechnungen).
 *  - Leistungs-Preis netto (tax_behavior "exclusive") auf dem Produkt der Vorlage (Löschung bzw. Neustart, € bzw. $).
 *  - Idempotent über metadata rapidremove_profile = "<service>[+x]|<cent>|<schutz>|<währung>".
 */
import { PROFILE_LIST_PRICES, PROFILE_EXPRESS_FEE } from "./reviewsPricing";

const API = "https://api.stripe.com/v1/";
const MARK = "rapidremove_profile";
const OUR_UID = (process.env.COMPANY_UID || "ATU72401536").trim();
const UID_FOOTER = `UID Leistender / Supplier VAT ID: ${OUR_UID}`;

function encode(obj: Record<string, any>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => { if (item && typeof item === "object") out.push(...encode(item, `${key}[${i}]`)); else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`); });
    else if (v && typeof v === "object") out.push(...encode(v, key));
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}
async function sapi<T = any>(method: "GET" | "POST", path: string, params?: Record<string, any>, idem?: string): Promise<T> {
  const KEY = process.env.STRIPE_SECRET_KEY || "";
  if (!KEY) throw new Error("STRIPE_SECRET_KEY fehlt");
  const isGet = method === "GET";
  const body = params ? encode(params).join("&") : undefined;
  const res = await fetch(API + path.replace(/^\//, "") + (isGet && body ? `?${body}` : ""), {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Stripe-Version": "2024-06-20", ...(isGet ? {} : { "Content-Type": "application/x-www-form-urlencoded" }), ...(idem ? { "Idempotency-Key": idem } : {}) },
    body: isGet ? undefined : body,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Stripe ${method} ${path} (${res.status}): ${txt.slice(0, 300)}`);
  return JSON.parse(txt) as T;
}

type Price = { id: string; unit_amount: number | null; currency: string; recurring?: { interval?: string } | null; product: string; tax_behavior?: string; metadata?: Record<string, string> };
type Link = { id: string; url: string; active: boolean; metadata?: Record<string, string>; automatic_tax?: any; tax_id_collection?: any; billing_address_collection?: string; allow_promotion_codes?: boolean; customer_creation?: string; after_completion?: any; invoice_creation?: any; locale?: string | null };
type LinkWithItems = Link & { items: Price[] };

let cache: { at: number; links: LinkWithItems[] } | null = null;
async function allLinks(): Promise<LinkWithItems[]> {
  if (cache && Date.now() - cache.at < 300_000) return cache.links;
  const links: Link[] = [];
  for (let i = 0, last = ""; i < 5; i++) {
    const page = await sapi<{ data: Link[]; has_more: boolean }>("GET", `payment_links?active=true&limit=100${last ? `&starting_after=${last}` : ""}`);
    links.push(...(page.data || []));
    if (!page.has_more || !page.data?.length) break;
    last = page.data[page.data.length - 1].id;
  }
  const out: LinkWithItems[] = [];
  for (const l of links) {
    if (l.metadata?.affiliate_partner || l.metadata?.rapidremove_reviews) continue; // Partner-Sonderlinks + Bewertungs-Links nie als Vorlage
    try {
      const li = await sapi<{ data: { price: Price }[] }>("GET", `payment_links/${l.id}/line_items?limit=20`);
      out.push({ ...l, items: (li.data || []).map((x) => x.price).filter(Boolean) });
    } catch { /* ohne Positionen überspringen */ }
  }
  cache = { at: Date.now(), links: out };
  return out;
}
export const clearProfileLinkCache = () => { cache = null; };

/** Schutz-Position je Art. Monatlich/jährlich: Betrag aus dem Auftrag (Bestand 24,90, neu 29,90 bzw. 299). */
const PROT_IV: Record<string, string> = { monthly: "month", monitor: "month", yearly: "year", lifetime: "once" };
const PROT_DEFAULT: Record<string, number> = { monthly: 2490, monitor: 6990, yearly: 29900, lifetime: 99000 };
const isProtItem = (p: Price) => p.metadata?.product_key === "protection" || p.metadata?.product_key === "monitoring";

/** Liefert (oder legt an) den Zahlungslink für eine Profil-Bestellung. oneTime = Leistung inkl. Express (Hauptwährung, z. B. 708). */
export async function ensureProfileLink(o: { service: string; currency: string; protection: string; oneTime: number; express: boolean; protAmount?: number }): Promise<{ url?: string; error?: string }> {
  const cur = o.currency === "usd" ? "usd" : "eur";
  const svc = o.service === "reset" ? "reset" : o.service === "remove" ? "remove" : "";
  const prot = PROT_IV[o.protection || ""] ? o.protection : "none";
  const protCents = prot === "none" ? 0 : (Number(o.protAmount) > 0 ? Math.round(Number(o.protAmount) * 100) : PROT_DEFAULT[prot]);
  const ps = prot === "none" ? null : { cents: protCents, interval: PROT_IV[prot] };
  const base = Math.round((o.oneTime - (o.express ? PROFILE_EXPRESS_FEE : 0)) * 100) / 100;
  if (!svc || !PROFILE_LIST_PRICES.includes(base) || (o.express && svc !== "remove")) return { error: `kein Listenpreis (${svc || o.service} ${o.oneTime} ${cur})` };
  const cents = Math.round(o.oneTime * 100);
  // Marker wie die vorab angelegten Links: alte Schutz-Preise „monthly", neue „monthly2990" / „yearly29900".
  const protTag = prot === "none" ? "none" : protCents === PROT_DEFAULT[prot] && prot !== "yearly" ? prot : `${prot}${protCents}`;
  const combo = `${svc}${o.express ? "+x" : ""}|${cents}|${protTag}|${cur}`;
  const links = await allLinks();
  const have = links.find((l) => l.metadata?.[MARK] === combo);
  if (have) return { url: have.url };
  // Vorlage: Link mit derselben Schutz-Position + einer einmaligen Leistungs-Position derselben Leistung/Währung.
  const wantKey = svc === "reset" ? "reset" : "removal";
  const fits = (l: LinkWithItems) => {
    const protItems = l.items.filter(isProtItem), svcItems = l.items.filter((p) => !isProtItem(p));
    if (svcItems.length !== 1 || (svcItems[0].currency || "").toLowerCase() !== cur || svcItems[0].recurring) return false;
    if (!ps) return protItems.length === 0;
    return protItems.length === 1 && protItems[0].unit_amount === ps.cents && (protItems[0].recurring?.interval || "once") === ps.interval && (protItems[0].currency || "").toLowerCase() === cur;
  };
  const cands = links.filter(fits);
  const tpl = cands.find((l) => l.items.some((p) => !isProtItem(p) && p.metadata?.product_key === wantKey)) || cands[0];
  if (!tpl) return { error: `keine Vorlage für ${combo}` };
  const svcProduct = links.flatMap((l) => l.items).find((p) => !isProtItem(p) && p.metadata?.product_key === wantKey && (p.currency || "").toLowerCase() === cur)?.product
    || tpl.items.find((p) => !isProtItem(p))!.product;
  const protPrice = ps ? tpl.items.find(isProtItem)!.id : null;
  const recurring = !!(ps && ps.interval !== "once");
  const price = await sapi<{ id: string }>("POST", "prices", {
    currency: cur, unit_amount: cents, tax_behavior: "exclusive", product: svcProduct,
    nickname: `${svc === "reset" ? "Löschen + Neustart" : "Profil-Löschung"}${o.express ? " inkl. Express" : ""} – ${o.oneTime} ${cur.toUpperCase()}`,
    metadata: { product_key: wantKey, [MARK]: `${svc}${o.express ? "+x" : ""}|${cents}|${cur}` },
  }, `rr-pp-${svc}${o.express ? "x" : ""}-${cents}-${cur}`);
  const params: Record<string, any> = {
    line_items: [{ price: price.id, quantity: 1 }, ...(protPrice ? [{ price: protPrice, quantity: 1 }] : [])],
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: tpl.allow_promotion_codes ?? true,
    metadata: { [MARK]: combo },
  };
  if (!recurring) {
    params.customer_creation = "if_required";
    const f = String(tpl.invoice_creation?.invoice_data?.footer || "").trim();
    params.invoice_creation = { enabled: true, invoice_data: { footer: f && f.includes(OUR_UID) ? f : UID_FOOTER } };
  }
  if (tpl.after_completion?.type === "redirect" && tpl.after_completion.redirect?.url) params.after_completion = { type: "redirect", redirect: { url: tpl.after_completion.redirect.url } };
  if (tpl.locale && tpl.locale !== "auto") params.locale = tpl.locale;
  const pl = await sapi<{ url: string; id: string }>("POST", "payment_links", params, `rr-pl-${combo}`);
  cache = null;
  return { url: pl.url };
}
