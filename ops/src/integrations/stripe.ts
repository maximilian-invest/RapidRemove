/*
 * Stripe-Anbindung – ohne SDK, nur fetch + node:crypto (wie mailer.ts).
 * Zugangsdaten werden LAZY gelesen, damit der Server auch ohne Stripe-Vars
 * startet (Vorschau/Health brauchen sie nicht).
 *
 *   STRIPE_SECRET_KEY     sk_live_… (Dashboard → Entwickler → API-Schlüssel)
 *   STRIPE_WEBHOOK_SECRET whsec_…   (beim Anlegen des Webhook-Endpoints)
 */
import crypto from "node:crypto";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Umgebungsvariable ${name} fehlt (siehe .env.example)`);
  return v;
}

export function hasSecretKey(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Minimaler Stripe-API-Aufruf (GET) – z. B. Customer/PaymentIntent nachladen. */
export async function stripeGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path.replace(/^\//, "")}`, {
    headers: { Authorization: `Bearer ${req("STRIPE_SECRET_KEY")}`, "Stripe-Version": "2024-06-20" },
  });
  if (!res.ok) throw new Error(`Stripe GET ${path} fehlgeschlagen (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

export interface StripeCustomer {
  id: string;
  email?: string | null;
  name?: string | null;
  preferred_locales?: string[] | null;
}

export async function retrieveCustomer(id: string): Promise<StripeCustomer> {
  return stripeGet<StripeCustomer>(`customers/${id}`);
}

/* ── Webhook-Signaturprüfung (Stripe-Schema „t=…,v1=…“) ───────────────── */

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export interface VerifyResult {
  ok: boolean;
  event?: any;
  reason?: string;
}

/**
 * Prüft die `Stripe-Signature` gegen den RAW-Body und liefert das Event zurück.
 * @param payload   exakter Roh-Body (String/Buffer), NICHT der geparste JSON.
 * @param header    Wert des `Stripe-Signature`-Headers.
 * @param secret    Webhook-Signing-Secret (whsec_…).
 * @param toleranceSec  maximale Abweichung des Zeitstempels (Default 300 s).
 */
export function verifyStripeSignature(
  payload: string | Buffer,
  header: string | undefined,
  secret: string,
  toleranceSec = 300,
): VerifyResult {
  if (!header) return { ok: false, reason: "kein Stripe-Signature-Header" };
  const body = typeof payload === "string" ? payload : payload.toString("utf8");

  const parts: Record<string, string[]> = {};
  for (const kv of header.split(",")) {
    const i = kv.indexOf("=");
    if (i === -1) continue;
    const k = kv.slice(0, i).trim();
    const v = kv.slice(i + 1).trim();
    (parts[k] ||= []).push(v);
  }
  const t = parts.t?.[0];
  const sigs = parts.v1 ?? [];
  if (!t || sigs.length === 0) return { ok: false, reason: "Signaturformat ungültig" };

  const expected = crypto.createHmac("sha256", secret).update(`${t}.${body}`, "utf8").digest("hex");
  if (!sigs.some((s) => timingSafeEqualHex(s, expected))) {
    return { ok: false, reason: "Signatur stimmt nicht" };
  }
  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (Number.isFinite(toleranceSec) && ageSec > toleranceSec) {
    return { ok: false, reason: `Zeitstempel zu alt (${ageSec}s)` };
  }
  try {
    return { ok: true, event: JSON.parse(body) };
  } catch {
    return { ok: false, reason: "Body ist kein gültiges JSON" };
  }
}

/** "de…" → "de", sonst "en" (für preferred_locales/Currency-Heuristik). */
export function langFromLocale(locale?: string | null): "de" | "en" {
  return (locale || "").toLowerCase().startsWith("de") ? "de" : "en";
}

/* ── Read-only Dashboard-Kennzahlen (Abos & Umsatz) ───────────────────── */

/** Listet eine Stripe-Collection seitenweise (bis maxPages × 100). */
export async function stripeList<T = any>(path: string, maxPages = 5): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < maxPages; i++) {
    const last = out.length ? (out[out.length - 1] as any).id : null;
    const sep = path.includes("?") ? "&" : "?";
    const url = last ? `${path}${sep}starting_after=${last}` : path;
    const page = await stripeGet<{ data: T[]; has_more: boolean }>(url);
    out.push(...(page.data || []));
    if (!page.has_more || !(page.data || []).length) break;
  }
  return out;
}

function fmtAmount(major: number, cur?: string): string {
  return (cur || "eur").toLowerCase() === "usd"
    ? "$ " + major.toLocaleString("en-US")
    : "€ " + major.toLocaleString("de-DE", { minimumFractionDigits: major % 1 ? 2 : 0 });
}
function dmy(ts: number): string {
  const d = new Date(ts * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.`;
}
/** Normalisiert einen Preis auf einen Monatsbetrag (Jahr/Woche/Tag → Monat). */
function monthlyAmount(price: any, quantity = 1): number {
  if (!price || price.unit_amount == null) return 0;
  const amt = (price.unit_amount / 100) * (quantity || 1);
  const iv = price.recurring?.interval;
  const cnt = price.recurring?.interval_count || 1;
  if (iv === "year") return amt / (12 * cnt);
  if (iv === "week") return (amt * 52) / 12 / cnt;
  if (iv === "day") return (amt * 365) / 12 / cnt;
  return amt / cnt;
}

type RevPt = { d: string; v: number; start: number; end: number };
type Payment = { name: string; date: string; plan: string; price: string; amount: number; cur: string; status: string; created: number };

export interface StripeDashboard {
  subs: Record<string, number>;
  plans: { label: string; count: number; mrr: number; cur: string }[];
  rev: { day: RevPt[]; week: RevPt[]; month: RevPt[] };
  payments: Payment[];
  paymentsAll: Payment[];
  customersList: { id: string; name: string; email: string; created: number; date: string }[];
  overdueList: { name: string; amount: number; cur: string; status: string }[];
  newCustomersList: { name: string; email: string; date: string }[];
  churnList: { name: string; date: string }[];
}

const MONTHS_DE = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/** Baut Tages-/Wochen-/Monats-Umsatzreihen aus bezahlten Rechnungen. */
function buildSeries(invoices: any[], now: Date) {
  const paid = (i: any) => (i.amount_paid || 0) / 100;
  const inRange = (a: number, b: number) => invoices.filter((i) => i.created >= a && i.created < b).reduce((s, i) => s + paid(i), 0);
  const p2 = (n: number) => String(n).padStart(2, "0");

  type Pt = { d: string; v: number; start: number; end: number };
  const day: Pt[] = [];
  for (let dd = 1; dd <= now.getDate(); dd++) {
    const a = new Date(now.getFullYear(), now.getMonth(), dd).getTime() / 1000;
    day.push({ d: String(dd), v: Math.round(inRange(a, a + 86400)), start: a, end: a + 86400 });
  }

  const week: Pt[] = [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  for (let i = 11; i >= 0; i--) {
    const ws = new Date(weekStart); ws.setDate(weekStart.getDate() - i * 7);
    const a = ws.getTime() / 1000;
    week.push({ d: `${p2(ws.getDate())}.${p2(ws.getMonth() + 1)}.`, v: Math.round(inRange(a, a + 7 * 86400)), start: a, end: a + 7 * 86400 });
  }

  const month: Pt[] = [];
  for (let i = 11; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const a = m.getTime() / 1000;
    const b = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime() / 1000;
    month.push({ d: MONTHS_DE[m.getMonth()], v: Math.round(inRange(a, b)), start: a, end: b });
  }

  return { day, week, month };
}

/** Reine Berechnung (testbar) – formt Roh-Stripe-Daten in die Dashboard-Form. */
export function buildStripeDashboard(raw: {
  subs: any[]; invoices: any[]; customers: any[]; monthStart: number;
}): StripeDashboard {
  const { subs, invoices, customers, monthStart } = raw;
  const active = new Set(["active", "trialing"]);
  const overdueSet = new Set(["past_due", "unpaid", "incomplete"]);
  const custName = (s: any) => s.customer?.name || s.customer?.email || "Kunde";

  let mrr = 0, activeCount = 0, trialing = 0, overdue = 0, churned = 0;
  const planMap = new Map<string, { label: string; count: number; mrr: number; cur: string }>();
  const overdueList: { name: string; amount: number; cur: string; status: string }[] = [];
  const churnList: { name: string; date: string }[] = [];

  for (const s of subs) {
    if (s.status === "canceled") {
      if ((s.canceled_at || 0) >= monthStart) { churned++; churnList.push({ name: custName(s), date: dmy(s.canceled_at) }); }
      continue;
    }
    if (overdueSet.has(s.status)) {
      overdue++;
      const amt = (s.items?.data || []).reduce((a: number, it: any) => a + monthlyAmount(it.price, it.quantity), 0);
      overdueList.push({ name: custName(s), amount: Math.round(amt * 100) / 100, cur: (s.items?.data?.[0]?.price?.currency || "eur").toUpperCase(), status: s.status });
    }
    if (!active.has(s.status)) continue;
    activeCount++;
    if (s.status === "trialing") trialing++;
    const items = s.items?.data || [];
    let subMonthly = 0;
    for (const it of items) subMonthly += monthlyAmount(it.price, it.quantity);
    mrr += subMonthly;
    const primary = items[0]?.price;
    if (primary) {
      const e = planMap.get(primary.id) || {
        label: fmtAmount((primary.unit_amount || 0) / 100, primary.currency) + "/Mo",
        count: 0, mrr: 0, cur: (primary.currency || "eur").toUpperCase(),
      };
      e.count += 1; e.mrr += subMonthly; planMap.set(primary.id, e);
    }
  }

  const now = new Date();
  const monthInvoices = invoices.filter((inv) => (inv.created || 0) >= monthStart);
  const monthRevenue = monthInvoices.reduce((s, inv) => s + (inv.amount_paid || 0) / 100, 0);
  const rev = buildSeries(invoices, now);

  const payStatus = (s: string) => (s === "paid" ? "bezahlt" : s === "open" ? "offen" : "fehlgeschlagen");
  const toPayment = (inv: any): Payment => {
    const line = inv.lines?.data?.[0];
    return {
      name: inv.customer_name || inv.customer_email || "Kunde",
      date: dmy(inv.created),
      plan: line?.description || line?.price?.nickname || "Abo",
      price: fmtAmount((line?.price?.unit_amount || inv.amount_paid || 0) / 100, inv.currency),
      amount: Math.round((inv.amount_paid || 0)) / 100,
      cur: (inv.currency || "eur").toUpperCase(),
      status: payStatus(inv.status),
      created: inv.created || 0,
    };
  };
  const sortedInv = invoices.slice().sort((a, b) => (b.created || 0) - (a.created || 0));
  const payments = sortedInv.slice(0, 8).map(toPayment);
  const paymentsAll = sortedInv.map(toPayment);

  const plans = [...planMap.values()].map((p) => ({ ...p, mrr: Math.round(p.mrr) })).sort((a, b) => b.count - a.count);
  const monthCustomers = customers.filter((c: any) => (c.created || 0) >= monthStart);
  const newCustomersList = monthCustomers.map((c: any) => ({ name: c.name || c.email || "Kunde", email: c.email || "", date: dmy(c.created) }));
  const customersList = customers
    .slice().sort((a: any, b: any) => (b.created || 0) - (a.created || 0))
    .map((c: any) => ({ id: c.id || "", name: c.name || c.email || "—", email: c.email || "", created: c.created || 0, date: dmy(c.created) }));
  return {
    subs: {
      mrr: Math.round(mrr), arr: Math.round(mrr * 12), active: activeCount, trialing, overdue,
      monthRevenue: Math.round(monthRevenue), paidInvoices: monthInvoices.length,
      newCustomers: monthCustomers.length, churned, reactivatable: overdue,
    },
    plans, rev, payments, paymentsAll, customersList, overdueList, newCustomersList, churnList,
  };
}

/** Holt die Kennzahlen live aus Stripe (read-only). */
export async function getStripeMetrics(): Promise<StripeDashboard> {
  const d = new Date();
  const monthStart = Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
  const yearStart = Math.floor(new Date(d.getFullYear(), d.getMonth() - 11, 1).getTime() / 1000);
  const [subs, invoices, customers] = await Promise.all([
    stripeList<any>(`subscriptions?status=all&limit=100&expand[]=data.customer`),
    stripeList<any>(`invoices?status=paid&created[gte]=${yearStart}&limit=100`, 6),
    stripeList<any>(`customers?limit=100`, 3),
  ]);
  return buildStripeDashboard({ subs, invoices, customers, monthStart });
}

/* ── Bestehende Zahlungslinks LESEN + zum Szenario matchen (read-only) ──
   Es wird NICHTS in Stripe erstellt. Wir lesen nur die vorhandenen
   Payment-Links und ihre Positionen und wählen den passenden aus. */

type PLItem = { amount: number; currency: string; interval: string };
let plCache: { ts: number; data: { id: string; url: string; items: PLItem[] }[] } | null = null;

/** Liest aktive Stripe-Payment-Links inkl. ihrer Positionen (gecacht 5 Min). */
export async function listPaymentLinks(): Promise<{ id: string; url: string; items: PLItem[] }[]> {
  if (plCache && Date.now() - plCache.ts < 300_000) return plCache.data;
  const links = await stripeList<any>("payment_links?active=true&limit=100", 3);
  const out: { id: string; url: string; items: PLItem[] }[] = [];
  for (const pl of links) {
    try {
      const li = await stripeGet<{ data: any[] }>(`payment_links/${pl.id}/line_items?limit=20&expand[]=data.price`);
      const items: PLItem[] = (li.data || []).map((x) => ({
        amount: x.price?.unit_amount ?? 0,
        currency: (x.price?.currency || "eur").toLowerCase(),
        interval: x.price?.recurring?.interval || "once",
      }));
      out.push({ id: pl.id, url: pl.url, items });
    } catch { /* Link ohne lesbare Positionen → überspringen */ }
  }
  plCache = { ts: Date.now(), data: out };
  return out;
}

function sigOf(items: { amount: number; interval: string }[]): string {
  return items.map((i) => `${i.amount}@${i.interval}`).sort().join("+");
}

/** Sucht einen bestehenden Payment-Link, dessen Positionen exakt zum Szenario passen. */
export async function matchPaymentLink(targetItems: { amount: number; interval: string }[]): Promise<{ url?: string; available: string[] }> {
  const links = await listPaymentLinks();
  const want = sigOf(targetItems);
  const hit = links.find((l) => sigOf(l.items) === want);
  return { url: hit?.url, available: links.map((l) => `${sigOf(l.items) || "(leer)"} → ${l.url}`) };
}
