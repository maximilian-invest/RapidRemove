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

export interface StripeDashboard {
  subs: Record<string, number>;
  plans: { label: string; count: number; mrr: number; cur: string }[];
  dailyRev: { d: string; v: number }[];
  payments: { name: string; date: string; plan: string; price: string; amount: number; cur: string; status: string }[];
}

/** Reine Berechnung (testbar) – formt Roh-Stripe-Daten in die Dashboard-Form. */
export function buildStripeDashboard(raw: {
  subs: any[]; invoices: any[]; customersThisMonth: number; monthStart: number;
}): StripeDashboard {
  const { subs, invoices, customersThisMonth, monthStart } = raw;
  const active = new Set(["active", "trialing"]);
  const overdueSet = new Set(["past_due", "unpaid", "incomplete"]);

  let mrr = 0, activeCount = 0, trialing = 0, overdue = 0, churned = 0;
  const planMap = new Map<string, { label: string; count: number; mrr: number; cur: string }>();

  for (const s of subs) {
    if (s.status === "canceled") { if ((s.canceled_at || 0) >= monthStart) churned++; continue; }
    if (overdueSet.has(s.status)) overdue++;
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

  let monthRevenue = 0;
  const byDay = new Map<string, number>();
  for (const inv of invoices) {
    const major = (inv.amount_paid || 0) / 100;
    monthRevenue += major;
    byDay.set(dmy(inv.created), (byDay.get(dmy(inv.created)) || 0) + major);
  }
  const now = new Date();
  const dailyRev: { d: string; v: number }[] = [];
  for (let day = 1; day <= now.getDate(); day++) {
    const key = dmy(Math.floor(new Date(now.getFullYear(), now.getMonth(), day).getTime() / 1000));
    dailyRev.push({ d: key, v: Math.round(byDay.get(key) || 0) });
  }

  const payStatus = (s: string) => (s === "paid" ? "bezahlt" : s === "open" ? "offen" : "fehlgeschlagen");
  const payments = invoices
    .slice().sort((a, b) => (b.created || 0) - (a.created || 0)).slice(0, 8)
    .map((inv) => {
      const line = inv.lines?.data?.[0];
      return {
        name: inv.customer_name || inv.customer_email || "Kunde",
        date: dmy(inv.created),
        plan: line?.description || line?.price?.nickname || "Abo",
        price: fmtAmount((line?.price?.unit_amount || inv.amount_paid || 0) / 100, inv.currency),
        amount: Math.round((inv.amount_paid || 0)) / 100,
        cur: (inv.currency || "eur").toUpperCase(),
        status: payStatus(inv.status),
      };
    });

  const plans = [...planMap.values()].map((p) => ({ ...p, mrr: Math.round(p.mrr) })).sort((a, b) => b.count - a.count);
  return {
    subs: {
      mrr: Math.round(mrr), arr: Math.round(mrr * 12), active: activeCount, trialing, overdue,
      monthRevenue: Math.round(monthRevenue), paidInvoices: invoices.length,
      newCustomers: customersThisMonth, churned, reactivatable: overdue,
    },
    plans, dailyRev, payments,
  };
}

/** Holt die Kennzahlen live aus Stripe (read-only). */
export async function getStripeMetrics(): Promise<StripeDashboard> {
  const d = new Date();
  const monthStart = Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
  const [subs, invoices, customers] = await Promise.all([
    stripeList<any>(`subscriptions?status=all&limit=100`),
    stripeList<any>(`invoices?status=paid&created[gte]=${monthStart}&limit=100`),
    stripeList<any>(`customers?created[gte]=${monthStart}&limit=100`),
  ]);
  return buildStripeDashboard({ subs, invoices, customersThisMonth: customers.length, monthStart });
}
