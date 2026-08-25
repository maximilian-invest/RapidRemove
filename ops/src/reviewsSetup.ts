/*
 * reviewsSetup.ts — legt die Stripe-Zahlungslinks für das Bewertungs-Produkt an.
 * Gleiche Mechanik wie expressSetup.ts: Admin-Endpoint POST /admin/setup-reviews
 * (apply=false → Trockenlauf). Idempotent über metadata-Marker.
 *
 * EIN eigenes Stripe-Produkt „Removal of an individual Google review" mit
 * Stückpreis 179 (EUR und USD), dazu je Währung ein Zahlungslink pro Stückzahl
 * 1–10 (line_items.quantity fest). Abgerechnet wird nur, was wirklich gelöscht
 * wurde — der Admin wählt beim Versand der Löschbestätigung die Anzahl, der
 * passende Link trägt exakt diesen Betrag.
 *
 * ensureReviewsLink(qty, cur) legt EINEN fehlenden Link bei Bedarf direkt beim
 * Rechnungsversand an (find-or-create über dieselben Marker) — der einmalige
 * Setup-Lauf ist damit optional, nicht mehr Voraussetzung.
 */

export type ReviewsCur = "eur" | "usd";
type Cur = ReviewsCur;

const PRICE_MAJOR: Record<Cur, number> = { eur: 179, usd: 179 };
const MAX_QTY = 10;
const MARK = "rapidremove_reviews";
const PRODUCT_NAME = "Removal of an individual Google review";

const cents = (major: number) => Math.round(major * 100);
const API = "https://api.stripe.com/v1/";

function encode(obj: Record<string, any>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") out.push(...encode(item, `${key}[${i}]`));
        else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (v && typeof v === "object") {
      out.push(...encode(v, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

// Schlüssel wird je Aufruf gelesen (nicht beim Import), wie bisher im Closure.
async function sapi<T = any>(method: "GET" | "POST", pathName: string, params?: Record<string, any>): Promise<T> {
  const KEY = process.env.STRIPE_SECRET_KEY || "";
  if (!KEY) throw new Error("STRIPE_SECRET_KEY fehlt");
  const isGet = method === "GET";
  const body = params ? encode(params).join("&") : undefined;
  const url = API + pathName.replace(/^\//, "") + (isGet && body ? `?${body}` : "");
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`, "Stripe-Version": "2024-06-20",
      ...(isGet ? {} : { "Content-Type": "application/x-www-form-urlencoded" }),
    },
    body: isGet ? undefined : body,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Stripe ${method} ${pathName} (${res.status}): ${txt.slice(0, 300)}`);
  return JSON.parse(txt) as T;
}

async function listAll<T = any>(pathName: string, maxPages = 5): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < maxPages; i++) {
    const last = out.length ? (out[out.length - 1] as any).id : null;
    const sep = pathName.includes("?") ? "&" : "?";
    const page = await sapi<{ data: T[]; has_more: boolean }>("GET", last ? `${pathName}${sep}starting_after=${last}` : pathName);
    out.push(...(page.data || []));
    if (!page.has_more || !(page.data || []).length) break;
  }
  return out;
}

async function findOrCreateProduct(): Promise<string> {
  const products = await listAll<any>("products?active=true&limit=100", 3);
  const existing = products.find((p) => p.metadata && p.metadata[MARK] === "product");
  if (existing) return existing.id;
  const created = await sapi<{ id: string }>("POST", "products", {
    name: PRODUCT_NAME,
    metadata: { [MARK]: "product" },
  });
  return created.id;
}

async function findOrCreatePrice(productId: string, cur: Cur): Promise<string> {
  const prices = await listAll<any>("prices?active=true&limit=100", 6);
  const existing = prices.find((p) =>
    p.unit_amount === cents(PRICE_MAJOR[cur]) && (p.currency || "").toLowerCase() === cur &&
    !p.recurring && p.metadata && p.metadata[MARK] === `price|${cur}`);
  if (existing) return existing.id;
  const created = await sapi<{ id: string }>("POST", "prices", {
    currency: cur, unit_amount: cents(PRICE_MAJOR[cur]),
    nickname: `${PRODUCT_NAME} (${cur.toUpperCase()})`,
    product: productId,
    metadata: { [MARK]: `price|${cur}` },
  });
  return created.id;
}

/* Legt den Zahlungslink für genau diese Stückzahl/Währung an (oder findet ihn).
   Wird beim Rechnungsversand gerufen, wenn die hinterlegte Tabelle nichts hat —
   der Kunde im Admin muss dadurch nie erst ein Setup ausführen. */
const linkCache = new Map<string, string>();

export async function ensureReviewsLink(qty: number, cur: ReviewsCur): Promise<string> {
  const n = Math.max(1, Math.floor(qty));
  const combo = `reviews|${n}|${cur}`;
  const hit = linkCache.get(combo);
  if (hit) return hit;
  const links = await listAll<any>("payment_links?active=true&limit=100", 3);
  const found = links.find((pl) => pl.metadata && pl.metadata[MARK] === combo);
  if (found) { linkCache.set(combo, found.url); return found.url; }
  const productId = await findOrCreateProduct();
  const priceId = await findOrCreatePrice(productId, cur);
  const pl = await sapi<{ url: string }>("POST", "payment_links", {
    line_items: [{ price: priceId, quantity: n }],
    metadata: { [MARK]: combo },
  });
  linkCache.set(combo, pl.url);
  return pl.url;
}

export interface ReviewsSetupReport {
  applied: boolean;
  created: number;
  skipped: number;
  links: Record<string, string>;
  log: string[];
}

export async function runReviewsSetup(opts: { apply: boolean; log?: (line: string) => void } = { apply: false }): Promise<ReviewsSetupReport> {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY fehlt");
  const APPLY = !!opts.apply;
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); opts.log?.(s); };

  // 1) Eigenes Produkt (einmal), idempotent über metadata-Marker.
  async function ensureProduct(): Promise<string> {
    const products = await listAll<any>("products?active=true&limit=100", 3);
    const existing = products.find((p) => p.metadata && p.metadata[MARK] === "product");
    if (existing) { log(`  · Produkt vorhanden: ${existing.id}`); return existing.id; }
    if (!APPLY) { log(`  · Produkt würde angelegt: „${PRODUCT_NAME}"`); return "prod_DRYRUN"; }
    const id = await findOrCreateProduct();
    log(`  · Produkt angelegt: ${id}`);
    return id;
  }

  // 2) Ein Preis je Währung (179 einmalig), idempotent.
  async function ensurePrice(productId: string, cur: Cur): Promise<string> {
    const prices = await listAll<any>("prices?active=true&limit=100", 6);
    const existing = prices.find((p) =>
      p.unit_amount === cents(PRICE_MAJOR[cur]) && (p.currency || "").toLowerCase() === cur &&
      !p.recurring && p.metadata && p.metadata[MARK] === `price|${cur}`);
    if (existing) { log(`  · Preis vorhanden (${cur.toUpperCase()}): ${existing.id}`); return existing.id; }
    if (!APPLY) { log(`  · Preis würde angelegt: ${PRICE_MAJOR[cur]} ${cur.toUpperCase()} einmalig`); return "price_DRYRUN"; }
    const id = await findOrCreatePrice(productId, cur);
    log(`  · Preis angelegt (${cur.toUpperCase()}): ${id}`);
    return id;
  }

  const report: ReviewsSetupReport = { applied: APPLY, created: 0, skipped: 0, links: {}, log: lines };
  const productId = await ensureProduct();
  const existingLinks = await listAll<any>("payment_links?active=true&limit=100", 3);

  for (const cur of ["eur", "usd"] as Cur[]) {
    const priceId = await ensurePrice(productId, cur);
    for (let qty = 1; qty <= MAX_QTY; qty++) {
      const combo = `reviews|${qty}|${cur}`;
      const found = existingLinks.find((pl) => pl.metadata && pl.metadata[MARK] === combo);
      if (found) { report.links[combo] = found.url; report.skipped++; log(`  ✓ ${combo} vorhanden`); continue; }
      if (!APPLY) { log(`  · ${combo}: Link würde angelegt (${qty} × ${PRICE_MAJOR[cur]} ${cur.toUpperCase()})`); continue; }
      const pl = await sapi<{ url: string }>("POST", "payment_links", {
        line_items: [{ price: priceId, quantity: qty }],
        metadata: { [MARK]: combo },
      });
      report.links[combo] = pl.url;
      report.created++;
      log(`  + ${combo} angelegt: ${pl.url}`);
    }
  }
  return report;
}
