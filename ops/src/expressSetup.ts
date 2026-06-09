/*
 * expressSetup.ts — Kernlogik zum Anlegen der EXPRESS-Zahlungslinks in Stripe.
 * Wird von zwei Stellen genutzt:
 *   1) CLI-Skript  setupExpressLinks.ts  (lokal/Railway-Shell)
 *   2) Admin-Endpoint POST /admin/setup-express (Button im Dashboard)
 *
 * Legt für ALLE Kombinationen (Leistung × Schutz × Währung) einen Zahlungslink an.
 * Steuer-/Abo-Einstellungen werden LIVE aus einem bestehenden Link gelesen und 1:1
 * übernommen; bestehende Schutz-Preise werden wiederverwendet; nur der Einmalbetrag
 * der Leistung bekommt den Express-Aufschlag. Idempotent (per metadata-Marker).
 */

type Cur = "eur" | "usd";

// Einmalige Leistungs-Grundpreise (ohne Express). Express = Grundpreis + Aufschlag.
// Express gilt NUR für die Löschung ("remove"); "reset" ist bewusst nicht dabei.
const SERVICES_ALL = [
  { key: "remove", label: "Profil-Löschung", base: { eur: 450, usd: 495 } },
  // { key: "reset", label: "Profil-Löschung + Neustart", base: { eur: 850, usd: 950 } },
];
const EXPRESS_SURCHARGE: Record<Cur, number> = { eur: 149, usd: 149 };
const PROTECTION = [
  { key: "none",     label: "",                                amount: { eur: 0,     usd: 0 },     interval: "once" as const },
  { key: "monthly",  label: "Reputations-Schutz",              amount: { eur: 24.90, usd: 24.90 }, interval: "month" as const },
  { key: "monitor",  label: "Reputations-Schutz + Monitoring", amount: { eur: 69.90, usd: 69.90 }, interval: "month" as const },
  { key: "lifetime", label: "Reputations-Schutz (lebenslang)", amount: { eur: 990,   usd: 990 },   interval: "once" as const },
];

const cents = (major: number) => Math.round(major * 100);
const MARK = "rapidremove_express";

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

export interface HouseStyle {
  automatic_tax: boolean;
  tax_id_collection: boolean;
  billing_address_collection?: string;
  allow_promotion_codes?: boolean;
  customer_creation?: string;
  locale?: string;
  after_completion?: any;
  sampleLink?: string;
}

export interface SetupReport {
  applied: boolean;
  created: number;
  skipped: number;
  links: Record<string, string>;
  houseStyle: HouseStyle;
  log: string[];
}

export async function runExpressSetup(opts: {
  apply: boolean;
  currencies?: Cur[];
  services?: string[];
  log?: (line: string) => void;
} = { apply: false }): Promise<SetupReport> {
  const KEY = process.env.STRIPE_SECRET_KEY || "";
  if (!KEY) throw new Error("STRIPE_SECRET_KEY fehlt");
  const APPLY = !!opts.apply;
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); opts.log?.(s); };

  const CURRENCIES: Cur[] = (opts.currencies && opts.currencies.length ? opts.currencies : ["eur", "usd"]).filter((c) => c === "eur" || c === "usd") as Cur[];
  const SERVICES = SERVICES_ALL.filter((s) => !opts.services || opts.services.includes(s.key));
  const HEAD = { Authorization: `Bearer ${KEY}`, "Stripe-Version": "2024-06-20" };

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
    if (!res.ok) throw new Error(`Stripe ${method} ${pathName} (${res.status}): ${txt.slice(0, 300)}`);
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

  type PriceObj = { id: string; unit_amount: number | null; currency: string; recurring?: { interval?: string } | null; product?: any; tax_behavior?: string; metadata?: Record<string, string> };
  let pricesCache: PriceObj[] | null = null;
  const allPrices = async () => (pricesCache ||= await listAll<PriceObj>("prices?active=true&limit=100&expand[]=data.product", 6));

  const findPrice = async (amountMajor: number, currency: Cur, interval: "once" | "month") => {
    const want = cents(amountMajor);
    return (await allPrices()).find((p) =>
      p.unit_amount === want && (p.currency || "").toLowerCase() === currency && ((p.recurring?.interval || "once") === interval));
  };

  async function readHouseStyle(): Promise<HouseStyle> {
    const links = await listAll<any>("payment_links?active=true&limit=100", 3);
    const serviceCents = new Set<number>();
    for (const s of SERVICES) for (const c of CURRENCIES) serviceCents.add(cents(s.base[c]));
    let chosen: any | undefined;
    for (const pl of links) {
      try {
        const li = await api<{ data: any[] }>("GET", `payment_links/${pl.id}/line_items?limit=20&expand[]=data.price`);
        const oneTime = (li.data || []).find((x) => !x.price?.recurring);
        if (oneTime && serviceCents.has(oneTime.price?.unit_amount ?? -1)) { chosen = pl; break; }
        if (!chosen) chosen = pl;
      } catch { /* ignore */ }
    }
    return {
      automatic_tax: !!chosen?.automatic_tax?.enabled,
      tax_id_collection: !!chosen?.tax_id_collection?.enabled,
      billing_address_collection: chosen?.billing_address_collection || undefined,
      allow_promotion_codes: chosen?.allow_promotion_codes,
      customer_creation: chosen?.customer_creation || undefined,
      locale: chosen?.locale && chosen.locale !== "auto" ? chosen.locale : undefined,
      after_completion: chosen?.after_completion || undefined,
      sampleLink: chosen?.url,
    };
  }

  async function serviceTaxBehavior(amountMajor: number, currency: Cur) {
    const p = await findPrice(amountMajor, currency, "once");
    const productId = typeof p?.product === "object" ? p?.product?.id : (p?.product as string | undefined);
    return { taxBehavior: p?.tax_behavior && p.tax_behavior !== "unspecified" ? p.tax_behavior : undefined, productId };
  }

  let existingLinks: any[] | null = null;
  async function existingExpressLink(combo: string): Promise<string | undefined> {
    existingLinks ||= await listAll<any>("payment_links?active=true&limit=100", 3);
    return existingLinks.find((pl) => pl.metadata && pl.metadata[MARK] === combo)?.url;
  }

  async function ensureExpressServicePrice(svc: typeof SERVICES_ALL[number], currency: Cur, taxBehavior?: string, productId?: string): Promise<string> {
    const amount = svc.base[currency] + EXPRESS_SURCHARGE[currency];
    const existing = (await allPrices()).find((p) =>
      p.unit_amount === cents(amount) && (p.currency || "").toLowerCase() === currency && !p.recurring && p.metadata?.[MARK] === `${svc.key}|${currency}`);
    if (existing) return existing.id;
    const params: Record<string, any> = {
      currency, unit_amount: cents(amount),
      nickname: `${svc.label} inkl. Express (${currency.toUpperCase()})`,
      metadata: { [MARK]: `${svc.key}|${currency}`, rapidremove_service: svc.key },
    };
    if (taxBehavior) params.tax_behavior = taxBehavior;
    if (productId) params.product = productId; else params.product_data = { name: `${svc.label} inkl. Express-Bearbeitung (≤6 h)` };
    if (!APPLY) { log(`    · Express-Preis: ${amount} ${currency.toUpperCase()} einmalig${taxBehavior ? ", tax_behavior=" + taxBehavior : ""}`); return "price_DRYRUN"; }
    return (await api<{ id: string }>("POST", "prices", params)).id;
  }

  async function ensureProtectionPrice(prot: typeof PROTECTION[number], currency: Cur): Promise<string | null> {
    if (prot.key === "none") return null;
    const found = await findPrice(prot.amount[currency], currency, prot.interval);
    if (found) return found.id;
    const params: Record<string, any> = {
      currency, unit_amount: cents(prot.amount[currency]),
      nickname: `${prot.label} (${currency.toUpperCase()})`,
      product_data: { name: prot.label }, metadata: { rapidremove_protection: prot.key },
    };
    if (prot.interval === "month") params.recurring = { interval: "month" };
    if (!APPLY) { log(`    · Schutz-Preis: ${prot.amount[currency]} ${currency.toUpperCase()}/${prot.interval} (${prot.label})`); return "price_DRYRUN"; }
    return (await api<{ id: string }>("POST", "prices", params)).id;
  }

  async function createPaymentLink(combo: string, prices: string[], hs: HouseStyle, hasRecurring: boolean): Promise<string> {
    const params: Record<string, any> = {
      line_items: prices.map((price) => ({ price, quantity: 1 })),
      automatic_tax: { enabled: hs.automatic_tax },
      metadata: { [MARK]: combo },
    };
    if (hs.tax_id_collection) params.tax_id_collection = { enabled: true };
    if (hs.billing_address_collection) params.billing_address_collection = hs.billing_address_collection;
    if (hs.allow_promotion_codes !== undefined) params.allow_promotion_codes = hs.allow_promotion_codes;
    // customer_creation ist bei Abo-Positionen nicht erlaubt (Stripe legt dort ohnehin immer einen Kunden an).
    if (hs.customer_creation && !hasRecurring) params.customer_creation = hs.customer_creation;
    if (hs.locale) params.locale = hs.locale;
    if (hs.after_completion?.type) {
      params.after_completion = hs.after_completion.type === "redirect" && hs.after_completion.redirect?.url
        ? { type: "redirect", redirect: { url: hs.after_completion.redirect.url } }
        : { type: hs.after_completion.type };
    }
    if (!APPLY) { log(`    · Zahlungslink: [${prices.join(", ")}] automatic_tax=${hs.automatic_tax}`); return "https://buy.stripe.com/DRYRUN_" + combo.replace(/\|/g, "_"); }
    return (await api<{ url: string }>("POST", "payment_links", params)).url;
  }

  log(`Express-Zahlungslinks ${APPLY ? "ANLEGEN" : "(Trockenlauf)"} · Währungen: ${CURRENCIES.join(", ")} · Leistungen: ${SERVICES.map((s) => s.key).join(", ")}`);
  const houseStyle = await readHouseStyle();
  log(`Hausordnung übernommen: automatic_tax=${houseStyle.automatic_tax}, tax_id_collection=${houseStyle.tax_id_collection}, billing=${houseStyle.billing_address_collection ?? "default"}, locale=${houseStyle.locale ?? "auto"}${houseStyle.sampleLink ? ` (Vorlage: ${houseStyle.sampleLink})` : " — kein Vorlage-Link gefunden, bitte Steuer prüfen!"}`);

  const links: Record<string, string> = {};
  let created = 0, skipped = 0;
  for (const currency of CURRENCIES) {
    for (const svc of SERVICES) {
      const { taxBehavior, productId } = await serviceTaxBehavior(svc.base[currency], currency);
      for (const prot of PROTECTION) {
        const combo = `${svc.key}|express|${prot.key}|${currency}`;
        const already = await existingExpressLink(combo);
        if (already) { log(`= ${combo} → bereits vorhanden`); links[combo] = already; skipped++; continue; }
        log(`+ ${combo}`);
        const servicePrice = await ensureExpressServicePrice(svc, currency, taxBehavior, productId);
        const protPrice = await ensureProtectionPrice(prot, currency);
        links[combo] = await createPaymentLink(combo, protPrice ? [servicePrice, protPrice] : [servicePrice], houseStyle, prot.interval === "month");
        created++;
      }
    }
  }
  log(`Fertig: ${APPLY ? `${created} angelegt, ${skipped} vorhanden.` : `${created} würden angelegt, ${skipped} vorhanden.`}`);
  return { applied: APPLY, created, skipped, links, houseStyle, log: lines };
}
