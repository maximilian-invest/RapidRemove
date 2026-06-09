/*
 * setupExpressLinks.ts — legt die Stripe-Zahlungslinks für die EXPRESS-Bearbeitung an,
 * für ALLE Kombinationen (Leistung × Schutz × Währung) — genau nach dem Muster der
 * bestehenden Links: gleiche Steuer-Einstellung (automatic_tax / tax_behavior), gleiche
 * Abo-Intervalle, gleiche Link-Optionen. Express ist der bestehende Leistungspreis + Aufschlag.
 *
 * Es wird NICHTS erraten: Steuer-Konfiguration und Link-Optionen werden LIVE aus einem
 * bestehenden Link gelesen ("schau einfach nach") und 1:1 übernommen. Bestehende Schutz-
 * Preise werden wiederverwendet (gleiches Abo-Produkt wie ohne Express).
 *
 * NUTZUNG (in einer Umgebung MIT Stripe-Zugriff, z. B. lokal oder Railway-Shell):
 *   STRIPE_SECRET_KEY=sk_live_… npx tsx src/setupExpressLinks.ts            # Trockenlauf (zeigt nur den Plan)
 *   STRIPE_SECRET_KEY=sk_live_… npx tsx src/setupExpressLinks.ts --apply    # legt wirklich an
 *   …  --currency=eur            # nur eine Währung
 *   …  --service=remove          # nur eine Leistung
 *   …  --write-registry          # schreibt die URLs zusätzlich in src/paymentLinks.ts
 *
 * Idempotent: bereits angelegte Express-Links (per metadata erkannt) werden übersprungen.
 */
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.STRIPE_SECRET_KEY || "";
if (!KEY) {
  console.error("✗ STRIPE_SECRET_KEY fehlt. Beispiel:\n  STRIPE_SECRET_KEY=sk_live_… npx tsx src/setupExpressLinks.ts --apply");
  process.exit(1);
}

const ARGS = new Set(process.argv.slice(2));
const APPLY = ARGS.has("--apply");
const WRITE_REGISTRY = ARGS.has("--write-registry");
const onlyCurrency = [...ARGS].find((a) => a.startsWith("--currency="))?.split("=")[1];
const onlyService = [...ARGS].find((a) => a.startsWith("--service="))?.split("=")[1];

/* ─────────────────────────── Konfiguration (entspricht src/lib/pricing.js) ─────────────────────────── */

type Cur = "eur" | "usd";
const CURRENCIES: Cur[] = (onlyCurrency ? [onlyCurrency as Cur] : ["eur", "usd"]).filter((c) => c === "eur" || c === "usd") as Cur[];

// Einmalige Leistungs-Grundpreise (ohne Express). Express = Grundpreis + Aufschlag.
// Express gilt NUR für die Löschung ("remove"). "reset" ist bewusst nicht dabei.
const SERVICES = [
  { key: "remove", label: "Profil-Löschung", base: { eur: 450, usd: 495 } },
  // { key: "reset", label: "Profil-Löschung + Neustart", base: { eur: 850, usd: 950 } }, // Express nicht für Reset
].filter((s) => !onlyService || s.key === onlyService);

const EXPRESS_SURCHARGE: Record<Cur, number> = { eur: 149, usd: 149 };

// Schutz-Stufen (zweite Position auf dem Link). "none" = ohne Schutz.
const PROTECTION = [
  { key: "none",     label: "",                                  amount: { eur: 0,     usd: 0 },     interval: "once" as const },
  { key: "monthly",  label: "Reputations-Schutz",                amount: { eur: 24.90, usd: 24.90 }, interval: "month" as const },
  { key: "monitor",  label: "Reputations-Schutz + Monitoring",   amount: { eur: 69.90, usd: 69.90 }, interval: "month" as const },
  { key: "lifetime", label: "Reputations-Schutz (lebenslang)",   amount: { eur: 990,   usd: 990 },   interval: "once" as const },
];

const cents = (major: number) => Math.round(major * 100);
const MARK = "rapidremove_express"; // metadata-Schlüssel zur Wiedererkennung

/* ─────────────────────────── Stripe-API (fetch, wie integrations/stripe.ts) ─────────────────────────── */

const API = "https://api.stripe.com/v1/";
const HEAD = { Authorization: `Bearer ${KEY}`, "Stripe-Version": "2024-06-20" };

// Flacht ein Objekt in Stripes Bracket-Notation ab: {a:{b:1}} → "a[b]=1"
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

async function api<T = any>(method: "GET" | "POST", pathName: string, params?: Record<string, any>): Promise<T> {
  const isGet = method === "GET";
  const body = params ? encode(params).join("&") : undefined;
  const url = API + pathName.replace(/^\//, "") + (isGet && body ? `?${body}` : "");
  const res = await fetch(url, {
    method,
    headers: { ...HEAD, ...(isGet ? {} : { "Content-Type": "application/x-www-form-urlencoded" }) },
    body: isGet ? undefined : body,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Stripe ${method} ${pathName} (${res.status}): ${txt.slice(0, 400)}`);
  return JSON.parse(txt) as T;
}

async function listAll<T = any>(pathName: string, maxPages = 5): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < maxPages; i++) {
    const last = out.length ? (out[out.length - 1] as any).id : null;
    const sep = pathName.includes("?") ? "&" : "?";
    const page = await api<{ data: T[]; has_more: boolean }>("GET", last ? `${pathName}${sep}starting_after=${last}` : pathName);
    out.push(...(page.data || []));
    if (!page.has_more || !(page.data || []).length) break;
  }
  return out;
}

/* ─────────────────────────── Bestehende Konfiguration auslesen ("schau nach") ─────────────────────────── */

type PriceObj = { id: string; unit_amount: number | null; currency: string; recurring?: { interval?: string } | null; product?: any; tax_behavior?: string; active?: boolean };

interface HouseStyle {
  automatic_tax: boolean;
  tax_id_collection: boolean;
  billing_address_collection?: string;
  allow_promotion_codes?: boolean;
  customer_creation?: string;
  locale?: string;
  after_completion?: any;
  sampleLink?: string;
}

let PRICES_CACHE: PriceObj[] | null = null;
async function allPrices(): Promise<PriceObj[]> {
  if (!PRICES_CACHE) PRICES_CACHE = await listAll<PriceObj>("prices?active=true&limit=100&expand[]=data.product", 6);
  return PRICES_CACHE;
}

// Findet einen bestehenden Preis mit exakt diesem Betrag/Währung/Intervall (zur Wiederverwendung der Abos).
async function findPrice(amountMajor: number, currency: Cur, interval: "once" | "month"): Promise<PriceObj | undefined> {
  const want = cents(amountMajor);
  return (await allPrices()).find((p) =>
    p.unit_amount === want &&
    (p.currency || "").toLowerCase() === currency &&
    ((p.recurring?.interval || "once") === interval),
  );
}

// Liest die "Hausordnung" (Steuer + Link-Optionen) aus einem bestehenden Zahlungslink.
async function readHouseStyle(): Promise<HouseStyle> {
  const links = await listAll<any>("payment_links?active=true&limit=100", 3);
  // bevorzugt einen Link, der zu unseren Leistungsbeträgen passt; sonst irgendeinen aktiven Link
  const serviceCents = new Set<number>();
  for (const s of SERVICES) for (const c of CURRENCIES) serviceCents.add(cents(s.base[c]));
  let chosen: any | undefined;
  for (const pl of links) {
    try {
      const li = await api<{ data: any[] }>("GET", `payment_links/${pl.id}/line_items?limit=20&expand[]=data.price`);
      const oneTime = (li.data || []).find((x) => !x.price?.recurring);
      if (oneTime && serviceCents.has(oneTime.price?.unit_amount ?? -1)) { chosen = pl; break; }
      if (!chosen) chosen = pl; // Fallback merken
    } catch { /* ignore */ }
  }
  const hs: HouseStyle = {
    automatic_tax: !!chosen?.automatic_tax?.enabled,
    tax_id_collection: !!chosen?.tax_id_collection?.enabled,
    billing_address_collection: chosen?.billing_address_collection || undefined,
    allow_promotion_codes: chosen?.allow_promotion_codes,
    customer_creation: chosen?.customer_creation || undefined,
    locale: chosen?.locale && chosen.locale !== "auto" ? chosen.locale : undefined,
    after_completion: chosen?.after_completion || undefined,
    sampleLink: chosen?.url,
  };
  return hs;
}

// tax_behavior eines bestehenden Leistungspreises (für die neuen Express-Preise identisch übernehmen).
async function serviceTaxBehavior(amountMajor: number, currency: Cur): Promise<{ taxBehavior?: string; productId?: string }> {
  const p = await findPrice(amountMajor, currency, "once");
  const productId = typeof p?.product === "object" ? p?.product?.id : (p?.product as string | undefined);
  return { taxBehavior: p?.tax_behavior && p.tax_behavior !== "unspecified" ? p.tax_behavior : undefined, productId };
}

/* ─────────────────────────── Anlegen (idempotent) ─────────────────────────── */

let EXISTING_EXPRESS: any[] | null = null;
async function existingExpressLink(combo: string): Promise<string | undefined> {
  if (!EXISTING_EXPRESS) EXISTING_EXPRESS = await listAll<any>("payment_links?active=true&limit=100", 3);
  const hit = EXISTING_EXPRESS.find((pl) => pl.metadata && pl.metadata[MARK] === combo);
  return hit?.url;
}

async function ensureExpressServicePrice(svc: typeof SERVICES[number], currency: Cur, taxBehavior: string | undefined, productId: string | undefined): Promise<string> {
  const amount = svc.base[currency] + EXPRESS_SURCHARGE[currency];
  // schon mal angelegt? (Express-Preis mit unserem Marker)
  const existing = (await allPrices()).find((p) =>
    p.unit_amount === cents(amount) && (p.currency || "").toLowerCase() === currency && !p.recurring &&
    (p as any).metadata?.[MARK] === `${svc.key}|${currency}`,
  );
  if (existing) return existing.id;

  const params: Record<string, any> = {
    currency,
    unit_amount: cents(amount),
    nickname: `${svc.label} inkl. Express (${currency.toUpperCase()})`,
    metadata: { [MARK]: `${svc.key}|${currency}`, rapidremove_service: svc.key },
  };
  if (taxBehavior) params.tax_behavior = taxBehavior;
  if (productId) params.product = productId;
  else params.product_data = { name: `${svc.label} inkl. Express-Bearbeitung (≤6 h)` };

  if (!APPLY) { console.log(`    · würde Express-Preis anlegen: ${amount} ${currency.toUpperCase()} (einmalig)${taxBehavior ? ", tax_behavior=" + taxBehavior : ""}`); return "price_DRYRUN"; }
  const price = await api<{ id: string }>("POST", "prices", params);
  return price.id;
}

// Schutz-Preis: bestehenden wiederverwenden; nur falls keiner existiert, neu anlegen.
async function ensureProtectionPrice(prot: typeof PROTECTION[number], currency: Cur): Promise<string | null> {
  if (prot.key === "none") return null;
  const found = await findPrice(prot.amount[currency], currency, prot.interval);
  if (found) return found.id;

  const params: Record<string, any> = {
    currency,
    unit_amount: cents(prot.amount[currency]),
    nickname: `${prot.label} (${currency.toUpperCase()})`,
    product_data: { name: prot.label },
    metadata: { rapidremove_protection: prot.key },
  };
  if (prot.interval === "month") params.recurring = { interval: "month" };
  if (!APPLY) { console.log(`    · würde Schutz-Preis anlegen: ${prot.amount[currency]} ${currency.toUpperCase()}/${prot.interval} (${prot.label})`); return "price_DRYRUN"; }
  const price = await api<{ id: string }>("POST", "prices", params);
  return price.id;
}

async function createPaymentLink(combo: string, lineItemPrices: string[], hs: HouseStyle): Promise<string> {
  const params: Record<string, any> = {
    line_items: lineItemPrices.map((price) => ({ price, quantity: 1 })),
    automatic_tax: { enabled: hs.automatic_tax },
    metadata: { [MARK]: combo },
  };
  if (hs.tax_id_collection) params.tax_id_collection = { enabled: true };
  if (hs.billing_address_collection) params.billing_address_collection = hs.billing_address_collection;
  if (hs.allow_promotion_codes !== undefined) params.allow_promotion_codes = hs.allow_promotion_codes;
  if (hs.customer_creation) params.customer_creation = hs.customer_creation;
  if (hs.locale) params.locale = hs.locale;
  if (hs.after_completion?.type) {
    params.after_completion = hs.after_completion.type === "redirect" && hs.after_completion.redirect?.url
      ? { type: "redirect", redirect: { url: hs.after_completion.redirect.url } }
      : { type: hs.after_completion.type };
  }
  if (!APPLY) { console.log(`    · würde Zahlungslink anlegen: [${lineItemPrices.join(", ")}]  automatic_tax=${hs.automatic_tax}`); return "https://buy.stripe.com/DRYRUN_" + combo.replace(/\|/g, "_"); }
  const link = await api<{ url: string }>("POST", "payment_links", params);
  return link.url;
}

/* ─────────────────────────── Hauptlauf ─────────────────────────── */

async function main() {
  console.log(`\n=== RapidRemove · Express-Zahlungslinks ${APPLY ? "ANLEGEN" : "(Trockenlauf — nichts wird verändert)"} ===`);
  console.log(`Währungen: ${CURRENCIES.join(", ")} · Leistungen: ${SERVICES.map((s) => s.key).join(", ")} · Schutz: ${PROTECTION.map((p) => p.key).join(", ")}\n`);

  const hs = await readHouseStyle();
  console.log("Übernommene Hausordnung aus bestehendem Link:");
  console.log(`  automatic_tax=${hs.automatic_tax}, tax_id_collection=${hs.tax_id_collection}, billing_address_collection=${hs.billing_address_collection ?? "(default)"}, promo=${hs.allow_promotion_codes ?? "(default)"}, locale=${hs.locale ?? "auto"}`);
  console.log(`  Beispiel-Link: ${hs.sampleLink ?? "— keiner gefunden —"}\n`);
  if (!hs.sampleLink) console.log("⚠ Kein bestehender Link gefunden — Steuer-Einstellungen ggf. vor --apply prüfen.\n");

  const registry: Record<string, string> = {};
  let created = 0, skipped = 0;

  for (const currency of CURRENCIES) {
    for (const svc of SERVICES) {
      const { taxBehavior, productId } = await serviceTaxBehavior(svc.base[currency], currency);
      for (const prot of PROTECTION) {
        const combo = `${svc.key}|express|${prot.key}|${currency}`;
        const already = await existingExpressLink(combo);
        if (already) { console.log(`= ${combo}  →  bereits vorhanden: ${already}`); registry[combo] = already; skipped++; continue; }

        console.log(`+ ${combo}`);
        const servicePrice = await ensureExpressServicePrice(svc, currency, taxBehavior, productId);
        const protPrice = await ensureProtectionPrice(prot, currency);
        const items = protPrice ? [servicePrice, protPrice] : [servicePrice];
        const url = await createPaymentLink(combo, items, hs);
        registry[combo] = url;
        console.log(`    →  ${url}`);
        created++;
      }
    }
  }

  console.log(`\nFertig. ${APPLY ? `${created} angelegt, ${skipped} übersprungen.` : `${created} würden angelegt, ${skipped} existieren bereits.`}`);

  console.log("\n── Für ops/src/paymentLinks.ts (Schlüssel = service|express|protection|currency) ──");
  console.log("export const EXPRESS_PAYMENT_LINKS: Record<string, string> = {");
  for (const [k, v] of Object.entries(registry)) console.log(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  console.log("};");

  if (WRITE_REGISTRY && APPLY) {
    const file = path.join(__dirname, "paymentLinks.express.json");
    fs.writeFileSync(file, JSON.stringify(registry, null, 2));
    console.log(`\n✓ URLs zusätzlich gespeichert: ${file}`);
  }
}

main().catch((e) => { console.error("\n✗ Fehler:", e?.message || e); process.exit(1); });
