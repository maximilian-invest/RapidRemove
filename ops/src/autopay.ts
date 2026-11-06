/* Automatisch bezahlen („Zahlungsart hinterlegen", 08.10.2026 – Prototyp im Stripe-Testmodus).
 *
 * Kunde hinterlegt im Dashboard einmal Karte/PayPal/… (Stripe Checkout, mode=setup). Danach wird nach jeder
 * Löschung der offene Betrag sofort abgebucht – mit echter Stripe-Rechnung (Invoice, charge_automatically) –,
 * statt Zahlungsaufforderung, Mahnungen und Zwischenzahlung. Klappt die Abbuchung nicht, läuft alles wie bisher
 * (Zahlungsaufforderung per Mail).
 *
 * Schlüssel:
 *   Test-Konten (isTestEmail)  → STRIPE_TEST_SECRET_KEY (sk_test_… / rk_test_…)
 *   alle anderen               → nur wenn AUTOPAY_LIVE=on, dann STRIPE_SECRET_KEY
 * Damit ist es live für echte Kunden AUS, bis es freigeschaltet wird.
 */
import type { FastifyInstance } from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { sendMail } from "./mailer";
import { fmtReviewMoney, profileOneTime } from "./reviewsPricing";
import RechnungAuto, { rechnungAutoSubject } from "./emails/RechnungAuto";
import ZahlungFehlgeschlagenReviews, { zahlungFehlgeschlagenSubject } from "./emails/ZahlungFehlgeschlagenReviews";
import { getDunPause } from "./dunPause";
import { checkAddress, checkVat } from "./billingCheck";
import { pool, insertEvent, setOrderRawField } from "./db";
import { startOrderIfReady } from "./orderStart";
import { isTestEmail } from "./testAccounts";
import { notifyTeam } from "./notify";
import { logCustEvent } from "./custTrack";
import { notifyPartner } from "./partnerNotify";
import { notifyCustomer } from "./custPush";
import { isDashReturnUrl } from "./dashUrl";
import { orderProgress, ordersRunning, approvePendingPre, customerSessionInfo, loadCustomerOrders, addOrderPayment, markReviewPaymentPaid, newPayId, autopayHooks, dashLink, DASH_URL, type PayRef, type AutoCharged } from "./customers";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

type Mode = "test" | "live";
/** Inhaber-Test „wie ein echter Kunde": diese Adressen nutzen den LIVE-Schlüssel (echte Abbuchung!), obwohl sie Test-Konten sind.
 *  Railway: AUTOPAY_LIVE_EMAILS=adresse1,adresse2 (leer = aus). */
const liveTesters = () => String(process.env.AUTOPAY_LIVE_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
function keyFor(email: string): { key: string; mode: Mode } | null {
  if (liveTesters().includes(String(email || "").trim().toLowerCase())) {
    const k = process.env.STRIPE_SECRET_KEY || "";
    return k ? { key: k, mode: "live" } : null;
  }
  if (isTestEmail(email)) {
    const k = process.env.STRIPE_TEST_SECRET_KEY || "";
    return /^(sk|rk)_test_/.test(k) ? { key: k, mode: "test" } : null;
  }
  if (String(process.env.AUTOPAY_LIVE || "").toLowerCase() !== "on") return null;
  const k = process.env.STRIPE_SECRET_KEY || "";
  return k ? { key: k, mode: "live" } : null;
}
export const autopayAvailable = (email: string) => !!keyFor(email);
/** Bezeichnung der hinterlegten Zahlungsart (z. B. „Visa •• 4242") – null, wenn keine (gleicher Modus). */
export async function savedMethodLabel(email: string): Promise<string | null> {
  const k = keyFor(email); if (!k) return null;
  const r = await rowOf(email).catch(() => null);
  return r && r.pm && r.mode === k.mode ? (r.label || "") : null;
}
/** Hat der Kunde schon eine gültige Zahlungsart hinterlegt (gleicher Modus)? */
export async function hasSavedMethod(email: string): Promise<boolean> {
  const k = keyFor(email); if (!k) return false;
  const r = await rowOf(email).catch(() => null);
  return !!(r && r.pm && r.mode === k.mode);
}
/** Neue Bestellung: Zahlungsart verlangen, bevor der Auftrag startet? (Funktion freigeschaltet + noch keine hinterlegt) */
export async function payGateNeeded(email: string): Promise<boolean> {
  return autopayAvailable(email) && !(await hasSavedMethod(email));
}
/** Zahlungsart ist da → wartende Aufträge freigeben und (falls sonst nichts fehlt) starten. */
async function releasePayGates(email: string, label: string): Promise<number> {
  if (!pool) return 0;
  const r = await pool.query(`SELECT id, service, profile, company, raw->'payGate'->>'rights' AS rg FROM orders WHERE lower(email)=$1 AND raw->'payGate'->>'status'='pending' AND COALESCE(status,'') <> 'storniert'`, [email.toLowerCase()]);
  for (const o of r.rows as { id: string; service: string | null; profile: string | null; company: string | null; rg: string | null }[]) {
    await setOrderRawField(o.id, "payGate", { status: "ok", at: new Date().toISOString(), label, ...(o.rg ? { rights: true } : {}) });
    if (o.rg) {
      // „Keine Rechte": Auftrag läuft schon (Partner/Team) – nicht neu starten, nur Bescheid geben: jetzt Zugriff beantragen + verifizieren.
      await insertEvent({ orderId: o.id, email, type: "note", title: "Zahlungsart hinterlegt – Keine Rechte: weitermachen (Zugriff beantragen + verifizieren)", detail: label, auto: true }).catch(() => {});
      void notifyTeam(`${isTestEmail(email) ? "TEST · " : ""}Keine Rechte: Zahlungsart hinterlegt`, `${email} · ${o.id} · Zugriff beantragen + Profil verifizieren`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "customer" });
      continue;
    }
    await insertEvent({ orderId: o.id, email, type: "note", title: "Zahlungsart hinterlegt – Auftrag kann starten", detail: label, auto: true }).catch(() => {});
    // Profil-Löschung: löschen wir selbst → Team Bescheid geben (abgebucht wird bei „Löschung abgeschlossen").
    if (o.service !== "reviews") void notifyTeam(`${isTestEmail(email) ? "TEST · " : ""}Zahlungsart hinterlegt · Profil löschen`, `${o.profile || o.company || email} · ${o.id} · abgebucht wird bei „Löschung abgeschlossen"`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "customer" });
    await startOrderIfReady(o.id).catch(() => 0);
  }
  return r.rows.length;
}

/* ---- Stripe (fetch, form-encoded) ---- */
function form(obj: Record<string, unknown>, prefix = "", out: string[] = []): string[] {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) form(v as Record<string, unknown>, key, out);
    else if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "object" ? form(x as Record<string, unknown>, `${key}[${i}]`, out) : out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(x))}`)));
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}
class StripeErr extends Error { code?: string; decline?: string; advice?: string; constructor(m: string, code?: string, decline?: string, advice?: string) { super(m); this.code = code; this.decline = decline; this.advice = advice; } }
const API = () => (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, ""); // Tests: Mock-Server
async function sx<T = any>(key: string, method: "GET" | "POST" | "DELETE", path: string, params: Record<string, unknown> = {}, idem?: string): Promise<T> {
  const body = form(params).join("&");
  const url = `${API()}/v1/${path}${method === "GET" && body ? (path.includes("?") ? "&" : "?") + body : ""}`;
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, "Stripe-Version": "2024-06-20" };
  if (method === "POST") headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idem && method === "POST") headers["Idempotency-Key"] = idem;
  const res = await fetch(url, { method, headers, body: method === "POST" ? body : undefined });
  const j = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new StripeErr(j?.error?.message || `Stripe ${res.status}`, j?.error?.code, j?.error?.decline_code, j?.error?.advice_code || j?.error?.payment_intent?.last_payment_error?.advice_code);
  return j as T;
}

/* ---- Tabelle ---- */
let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_autopay (
    email text PRIMARY KEY, mode text NOT NULL, customer text NOT NULL, pm text, label text, pm_type text,
    last_error text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_billing (
    email text PRIMARY KEY, company text, name text, line1 text, postal text, city text, country text, vat text,
    updated_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`ALTER TABLE cust_billing ADD COLUMN IF NOT EXISTS vat_status text, ADD COLUMN IF NOT EXISTS vat_name text, ADD COLUMN IF NOT EXISTS addr_checked boolean`);
  // Fehlgeschlagene Abbuchung (Einzelbewertungen): Stripe-Rechnung bleibt offen und wird nach Plan erneut belastet (06.11.2026).
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_autopay_retry (
    id bigserial PRIMARY KEY, email text NOT NULL, mode text NOT NULL, cur text NOT NULL, inv text NOT NULL, pay_id text NOT NULL,
    amount numeric NOT NULL, n int NOT NULL, picks jsonb NOT NULL, orders jsonb NOT NULL, label text,
    tries int NOT NULL DEFAULT 1, hard boolean NOT NULL DEFAULT false, next_at timestamptz, last_error text,
    status text NOT NULL DEFAULT 'open', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE INDEX IF NOT EXISTS cust_autopay_retry_open ON cust_autopay_retry (email) WHERE status='open'`);
  await pool.query(`ALTER TABLE cust_autopay_retry ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'reviews', ADD COLUMN IF NOT EXISTS order_id text`);
  ready = true;
}
type Row = { email: string; mode: Mode; customer: string; pm: string | null; label: string | null; pm_type: string | null; last_error: string | null; updated_at: string };
async function rowOf(email: string): Promise<Row | null> {
  if (!pool) return null;
  await init();
  const r = await pool.query(`SELECT * FROM cust_autopay WHERE email=$1`, [email.toLowerCase()]);
  return (r.rows[0] as Row) || null;
}

function pmLabel(pm: any): string {
  const t = String(pm?.type || "");
  if (t === "card") return `${String(pm.card?.brand || "Karte").replace(/^\w/, (c: string) => c.toUpperCase())} •• ${pm.card?.last4 || ""}`.trim();
  if (t === "paypal") return `PayPal${pm.paypal?.payer_email ? " · " + pm.paypal.payer_email : ""}`;
  if (t === "sepa_debit") return `SEPA •• ${pm.sepa_debit?.last4 || ""}`;
  if (t === "link") return "Link";
  if (t === "us_bank_account") return `${pm.us_bank_account?.bank_name || "Bank"} •• ${pm.us_bank_account?.last4 || ""}`;
  return t || "Zahlungsart";
}

/** Info fürs Dashboard (/cust/me). */
async function info(email: string): Promise<{ available: boolean; test?: boolean; saved: { label: string; mode: Mode; type: string | null; error: string | null } | null; billing: Billing }> {
  const k = keyFor(email);
  const r = await rowOf(email).catch(() => null);
  const saved = r && r.pm && k && r.mode === k.mode ? { label: r.label || "", mode: r.mode, type: r.pm_type, error: r.last_error } : null;
  return { available: !!k, test: k?.mode === "test", saved, billing: await billingOf(email).catch(() => emptyBilling) };
}

/* ---- Rechnungsdetails (erscheinen auf allen künftigen Stripe-Rechnungen) ---- */
type Billing = { company: string; name: string; line1: string; postal: string; city: string; country: string; vat: string; saved: boolean; vatStatus?: string; vatName?: string; addrChecked?: boolean };
const emptyBilling: Billing = { company: "", name: "", line1: "", postal: "", city: "", country: "", vat: "", saved: false };
async function billingOf(email: string): Promise<Billing> {
  if (!pool) return emptyBilling;
  await init();
  const r = await pool.query(`SELECT * FROM cust_billing WHERE email=$1`, [email.toLowerCase()]);
  const b = r.rows[0];
  if (b) return { company: b.company || "", name: b.name || "", line1: b.line1 || "", postal: b.postal || "", city: b.city || "", country: b.country || "", vat: b.vat || "", saved: true, vatStatus: b.vat_status || "", vatName: b.vat_name || "", addrChecked: !!b.addr_checked };
  // Noch nichts gespeichert → aus der letzten Bestellung vorbefüllen.
  const o = (await pool.query(`SELECT name, company, country FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [email.toLowerCase()])).rows[0];
  return { ...emptyBilling, name: o?.name || "", company: o?.company || "", country: /^[A-Z]{2}$/.test(String(o?.country || "")) ? o.country : "" };
}
/** Keine Rechnungsdetails gespeichert → aus der hinterlegten Zahlungsart übernehmen (Rechnungsadresse aus Stripe Checkout),
 *  damit keine Rechnung ohne Empfänger-Adresse/Land rausgeht. Kunde kann sie im Dashboard jederzeit ändern (UID → Reverse Charge). */
async function ensureBilling(email: string, key: string, pmOrId: any): Promise<void> {
  if (!pool || !pmOrId) return;
  const cur = await billingOf(email);
  if (cur.saved) return;
  const pm = typeof pmOrId === "string" ? await sx(key, "GET", `payment_methods/${pmOrId}`).catch(() => null) : pmOrId;
  const bd = (pm && pm.billing_details) || {};
  const a = bd.address || {};
  const cc = String(a.country || "").toUpperCase();
  const country = /^[A-Z]{2}$/.test(cc) ? cc : cur.country;
  const c = (v: unknown, n: number) => String(v ?? "").replace(/[\r\n<>]/g, " ").trim().slice(0, n);
  const name = c(cur.name || bd.name, 120);
  if (!country || (!name && !cur.company)) return;
  const line1 = c([a.line1, a.line2].filter(Boolean).join(", "), 160);
  await pool.query(`INSERT INTO cust_billing (email, company, name, line1, postal, city, country, addr_checked) VALUES ($1,$2,$3,$4,$5,$6,$7,false) ON CONFLICT (email) DO NOTHING`,
    [email.toLowerCase(), c(cur.company, 120), name, line1, c(a.postal_code, 20), c(a.city, 80), country]);
}
/** Rechnungsdetails an den Stripe-Kunden übertragen (Name/Firma + Adresse). Mit pm: fehlende Details vorher aus der Zahlungsart übernehmen. */
async function pushBillingToStripe(email: string, key: string, customer: string, pm?: any): Promise<void> {
  if (pm) await ensureBilling(email, key, pm).catch(() => {});
  const b = await billingOf(email);
  if (!b.saved) return;
  await sx(key, "POST", `customers/${customer}`, {
    name: b.company || b.name || undefined,
    address: b.line1 || b.city || b.postal || b.country ? { line1: b.line1 || undefined, postal_code: b.postal || undefined, city: b.city || undefined, country: b.country || undefined } : undefined,
    metadata: { rr_contact: b.company && b.name ? b.name : "" },
  });
}

/* ---- Umsatzsteuer auf unseren Rechnungen (Simple Solution OG, Österreich, UID ATU72401536) ----
 * Seit 12.10.2026 genau wie die Profil-/Abo-Zahlungslinks: alle Preise NETTO, USt kommt obendrauf,
 * Leistung = elektronisch erbrachte Dienstleistung (Stripe-Steuercode txcd_10000000). Je Kunde (Rechnungsland + geprüfte UID):
 *   "std"    Österreich (immer 20 %) und EU ohne gültige UID → Stripe Tax: Satz des Kundenlandes (OSS)
 *   "rc"     EU-Ausland mit gültiger UID (VIES geprüft): Reverse Charge, keine USt, beide UIDs + Hinweis auf der Rechnung
 *   "export" Drittland (z. B. USA, Schweiz, UK): Leistungsort beim Empfänger → in Österreich nicht steuerbar, 0 %
 * Steuerbefreiung (Reverse Charge) also NUR mit gültiger UID. Kann Stripe Tax den Standort nicht bestimmen (kein Land),
 * wird ersatzweise mit 20 % österreichischer USt (obendrauf) abgerechnet. */
const OUR_UID = (process.env.COMPANY_UID || "ATU72401536").trim();
const EU_TAX = new Set(["BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "EL", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"]);
export type TaxMode = "std" | "rc" | "export";
export function taxModeFor(country: string, vatStatus: string): TaxMode {
  const c = String(country || "").toUpperCase();
  if (!c || c === "AT") return "std";
  if (EU_TAX.has(c)) return vatStatus === "valid" ? "rc" : "std";
  return "export";
}
/** Rechnungssprache für Stripe (PDF + Rechnungsseite): Sprache der letzten Bestellung, sonst Englisch (12.10.2026 –
 *  ohne preferred_locales nahm Stripe die Kontosprache Deutsch, z. B. Kumori/London bekam eine deutsche Rechnung). */
const STRIPE_LOCALES: Record<string, string> = { de: "de", en: "en", es: "es", fr: "fr", it: "it", nl: "nl", pt: "pt", ja: "ja", sv: "sv", da: "da", no: "nb", nb: "nb", fi: "fi", pl: "pl", cs: "cs" };
export const stripeLocale = (lang?: string | null) => STRIPE_LOCALES[String(lang || "").slice(0, 2).toLowerCase()] || "en";
async function localeOf(email: string): Promise<string> {
  if (!pool) return "en";
  const r = await pool.query(`SELECT lang FROM orders WHERE lower(email)=$1 AND lang IS NOT NULL ORDER BY created_at DESC LIMIT 1`, [email.toLowerCase()]).catch(() => ({ rows: [] as { lang?: string }[] }));
  return stripeLocale(r.rows[0]?.lang);
}
type Tax = { mode: TaxMode; auto: boolean; rates: string[]; footer: string };
const taxRateIds = new Map<string, string>();
/** Ersatz-Steuersatz 20 % AT, NETTO (obendrauf) – nur wenn Stripe Tax den Kundenstandort nicht kennt. */
async function atTaxRate(key: string): Promise<string> {
  if (taxRateIds.has(key)) return taxRateIds.get(key)!;
  const list = await sx(key, "GET", "tax_rates", { active: "true", limit: 100 }).catch(() => ({ data: [] as any[] }));
  let tr = ((list as { data?: any[] }).data || []).find((x: any) => x.metadata?.rr === "at20x" && !x.inclusive && Number(x.percentage) === 20);
  if (!tr) tr = await sx(key, "POST", "tax_rates", { display_name: "USt", description: "Umsatzsteuer Österreich 20 %", percentage: 20, inclusive: false, country: "AT", jurisdiction: "AT", tax_type: "vat", metadata: { rr: "at20x" } }, "rr-taxrate-at20x");
  taxRateIds.set(key, tr.id);
  return tr.id;
}
const FOOTER_STD = `UID Leistender / Supplier VAT ID: ${OUR_UID}`;
/** Ersatz ohne Stripe Tax: 20 % AT obendrauf. */
async function taxFallback(key: string): Promise<Tax> {
  return { mode: "std", auto: false, rates: [await atTaxRate(key)], footer: `zzgl. 20 % USt. ${FOOTER_STD}` };
}
/** Steuer für die nächste Rechnung festlegen: Stripe-Kunde (tax_exempt + UID) aktualisieren, Modus/Fußzeile zurückgeben. */
async function taxFor(email: string, key: string, customer: string): Promise<Tax> {
  let b = await billingOf(email).catch(() => emptyBilling);
  // UID gespeichert, aber (VIES war down) noch nicht bestätigt → jetzt nochmal prüfen.
  if (b.vat && b.vatStatus !== "valid" && b.vatStatus !== "invalid" && b.country) {
    const v = await checkVat(b.vat, b.country).catch(() => null);
    if (v && v.status !== "unchecked" && pool) {
      await pool.query(`UPDATE cust_billing SET vat_status=$2, vat_name=COALESCE($3, vat_name), updated_at=now() WHERE email=$1`, [email.toLowerCase(), v.status, v.name || null]).catch(() => {});
      b = { ...b, vatStatus: v.status };
    }
  }
  const mode = taxModeFor(b.country, b.vatStatus || "");
  const cus = await sx(key, "POST", `customers/${customer}`, { tax_exempt: mode === "rc" ? "reverse" : "none", preferred_locales: [await localeOf(email)], expand: ["tax"] }).catch(() => null);
  if (b.vat && (mode === "rc" || mode === "export")) {
    const type = b.country === "GB" ? "gb_vat" : b.country === "CH" ? "ch_vat" : EU_TAX.has(b.country) ? "eu_vat" : "";
    if (type) {
      const ids = await sx(key, "GET", `customers/${customer}/tax_ids`, { limit: 20 }).catch(() => ({ data: [] as any[] }));
      const val = b.vat.replace(/[\s.\-]/g, "").toUpperCase();
      if (!((ids as { data?: any[] }).data || []).some((x: any) => String(x.value || "").replace(/[\s.\-]/g, "").toUpperCase() === val)) {
        await sx(key, "POST", `customers/${customer}/tax_ids`, { type, value: b.vat }).catch(() => {});
      }
    }
  }
  if (mode === "rc") return { mode, auto: false, rates: [], footer: `Reverse Charge – Steuerschuldnerschaft des Leistungsempfängers (Art. 196 MwSt-Richtlinie) / VAT reverse charge. UID Leistungsempfänger: ${b.vat} · UID Leistender: ${OUR_UID}` };
  if (mode === "export") return { mode, auto: false, rates: [], footer: `Leistungsort beim Leistungsempfänger – in Österreich nicht steuerbar (§ 3a Abs. 6 UStG) / Place of supply: recipient's country, not subject to Austrian VAT.${b.vat ? ` VAT ID recipient: ${b.vat} ·` : ""} UID: ${OUR_UID}` };
  // AT / EU ohne gültige UID → Stripe Tax, sofern Stripe den Standort des Kunden kennt.
  const loc = String(cus?.tax?.automatic_tax || "");
  if (loc === "supported") return { mode, auto: true, rates: [], footer: FOOTER_STD };
  return taxFallback(key);
}
/** Tatsächlich bezahlter Betrag (brutto, inkl. USt) einer Stripe-Rechnung in Währungseinheiten. */
const grossOf = (inv: any, fallback: number) => { const c = Number(inv?.amount_paid ?? inv?.total); return c > 0 ? Math.round(c) / 100 : fallback; };
/** Rechnung samt Posten anlegen (Netto-Betrag, USt obendrauf). Lehnt Stripe Tax ab (z. B. im Testmodus nicht aktiv), Ersatz mit 20 % AT. */
async function buildInvoice(key: string, base: Record<string, unknown>, tax: Tax, item: { customer: string; amount: number; currency: string; description: string }, idem: string): Promise<{ inv: any; tax: Tax }> {
  let t = tax;
  let inv: any;
  try {
    inv = await sx(key, "POST", "invoices", { ...base, footer: t.footer, automatic_tax: { enabled: t.auto }, metadata: { ...(base.metadata as object), rr_tax: t.mode } }, `rr-inv-${idem}`);
  } catch (e) {
    if (!t.auto) throw e;
    console.warn("Stripe Tax nicht verfügbar – Ersatz 20 % AT", (e as Error).message);
    t = await taxFallback(key);
    inv = await sx(key, "POST", "invoices", { ...base, footer: t.footer, automatic_tax: { enabled: false }, metadata: { ...(base.metadata as object), rr_tax: t.mode } }, `rr-inv-${idem}-m`);
  }
  await sx(key, "POST", "invoiceitems", { ...item, invoice: inv.id, ...(t.auto ? { tax_behavior: "exclusive" } : t.rates.length ? { tax_rates: t.rates } : {}) }, `rr-ii-${idem}${t === tax ? "" : "-m"}`);
  return { inv, tax: t };
}

/* ---- Fehlgeschlagene Abbuchung → Auftrag sofort pausieren ----
 * Partner: „Order on hold" (startet nichts Neues). Kunde: Hinweis in Mail/Dashboard „Zahlungsart aktualisieren".
 * Frei erst, wenn alles bezahlt ist (customers.ts evaluatePayHold, reason=autopay). Wiederholung nach 24 h und 48 h (retryTick). */
async function holdForCard(orderIds: string[], email: string, label: string, msg: string, money: string, test: boolean): Promise<void> {
  if (!pool) return;
  const r = await pool.query(`SELECT id, raw->'payHold' AS h FROM orders WHERE id = ANY($1::text[])`, [orderIds]);
  for (const o of r.rows as { id: string; h: Record<string, unknown> | null }[]) {
    const prog = await orderProgress(o.id).catch(() => null);
    if (!prog || prog.inProgress <= 0) continue; // nichts mehr beim Partner → keine Pause nötig (normale Zahlungsaufforderung reicht)
    if (o.h && o.h.reason === "autopay") { await setOrderRawField(o.id, "payHold", { ...o.h, msg, last: new Date().toISOString() }); continue; } // schon pausiert: Versuche/Zeit behalten
    await setOrderRawField(o.id, "payHold", { at: new Date().toISOString(), amount: prog.due, cur: prog.cur, reason: "autopay", label, msg, tries: 2, v: 2 }); // v2: Wiederholungen über cust_autopay_retry
    const c = (await pool.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND status IN ('new','working') ORDER BY id`, [o.id]).catch(() => ({ rows: [] as { code: string }[] }))).rows.map((x) => x.code).filter(Boolean);
    await insertEvent({ orderId: o.id, email, type: "pay", title: `Auftrag pausiert – Abbuchung fehlgeschlagen (${money})`, detail: `${prog.inProgress} Bewertung(en) beim Partner pausiert, bis bezahlt ist · neuer Versuch in 24 Std.${c.length ? " · " + c.join(", ") : ""}`, auto: true }).catch(() => {});
    void notifyPartner(`${test ? "TEST · " : ""}Order on hold`, `${c.slice(0, 4).join(", ") || o.id} · customer payment pending – please pause until “Customer paid”.`, undefined, test);
  }
  const lang = String((await pool.query(`SELECT lang FROM orders WHERE id = ANY($1::text[]) LIMIT 1`, [orderIds]).catch(() => ({ rows: [] as { lang?: string }[] }))).rows[0]?.lang || "en").slice(0, 2);
  const pf = PUSH_FAIL[lang] || PUSH_FAIL.en;
  void notifyCustomer(email, pf.t, pf.b, `rrc-apfail`, { url: "/my-reviews" }).catch(() => false);
}
const PUSH_FAIL: Record<string, { t: string; b: string }> = { en: { t: "Payment failed", b: "Please update your payment method – we continue right after." }, de: { t: "Zahlung fehlgeschlagen", b: "Bitte aktualisieren Sie Ihre Zahlungsart – danach geht es sofort weiter." }, es: { t: "Pago fallido", b: "Actualiza tu método de pago y seguimos enseguida." }, fr: { t: "Paiement échoué", b: "Mets à jour ton moyen de paiement – on reprend aussitôt." }, it: { t: "Pagamento non riuscito", b: "Aggiorna il metodo di pagamento: riprendiamo subito dopo." }, nl: { t: "Betaling mislukt", b: "Werk uw betaalmethode bij – daarna gaan we meteen verder." }, pt: { t: "Pagamento falhou", b: "Atualiza o teu método de pagamento – continuamos logo a seguir." }, ja: { t: "お支払いに失敗しました", b: "お支払い方法を更新してください。更新後すぐに再開します。" }, sv: { t: "Betalningen misslyckades", b: "Uppdatera din betalningsmetod – sedan fortsätter vi direkt." }, da: { t: "Betalingen mislykkedes", b: "Opdater din betalingsmetode – så fortsætter vi straks." }, no: { t: "Betalingen mislyktes", b: "Oppdater betalingsmetoden din – så fortsetter vi med en gang." } };

/** Alle 30 Min.: offene Fehlschlag-Rechnungen prüfen (bezahlt? anders bezahlt? fällig?) und nach Plan neu belasten (RETRY_DAYS).
 *  Altfälle (vor 06.11.2026, payHold ohne v2): wie bisher nach 24 h bzw. 48 h nochmal abbuchen. */
export async function retryTick(log: (o: unknown, m: string) => void = () => {}): Promise<void> {
  if (!pool) return;
  await init();
  const open = (await pool.query(`SELECT DISTINCT email FROM cust_autopay_retry WHERE status='open'`)).rows as { email: string }[];
  for (const x of open) {
    const res = await chargeDue(x.email, "Wiederholung (Plan)").catch((e) => { log({ err: String(e), email: x.email }, "Abbuchung-Wiederholung Fehler"); return null; });
    if (res) log({ email: x.email, amount: res.amount }, "Automatisch bezahlen: offene Rechnung beglichen");
  }
  const openSet = new Set(open.map((x) => x.email));
  const r = await pool.query(`SELECT id, lower(email) AS email, raw->'payHold' AS h FROM orders WHERE service='reviews' AND raw->'payHold'->>'reason'='autopay' AND COALESCE(status,'') <> 'storniert'`);
  const done = new Set<string>(openSet);
  for (const o of r.rows as { id: string; email: string; h: { at?: string; tries?: number } }[]) {
    const tries = Number(o.h?.tries) || 0;
    if (tries >= 2 || done.has(o.email)) continue;
    if (Date.now() < new Date(String(o.h?.at || 0)).getTime() + (tries + 1) * 24 * 3600e3) continue;
    done.add(o.email);
    for (const x of r.rows as { id: string; email: string; h: Record<string, unknown> }[]) if (x.email === o.email) await setOrderRawField(x.id, "payHold", { ...x.h, tries: tries + 1 });
    const res = await chargeDue(o.email, `Wiederholung ${tries + 1}/2`).catch(() => null);
    log({ email: o.email, try: tries + 1, ok: !!res }, "Automatisch bezahlen: neuer Abbuchungsversuch");
    if (!res && tries + 1 >= 2) void notifyTeam("Abbuchung 3× fehlgeschlagen", `${o.email} · Auftrag ${o.id} bleibt pausiert · Mahnungen laufen normal`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "pay" });
  }
}

/** Rechnung als PDF holen (Stripe invoice_pdf) und per Mail an den Kunden; landet im Mail-Verlauf der Aufträge. */
async function sendInvoiceMail(email: string, inv: { id: string; number?: string; invoice_pdf?: string; hosted_invoice_url?: string }, amount: number, cur: string, label: string, n: number, orderIds: string[], kind: "reviews" | "profile" = "reviews"): Promise<void> {
  if (!pool) return;
  const o = (await pool.query(`SELECT name, lang FROM orders WHERE id = ANY($1::text[]) ORDER BY created_at DESC LIMIT 1`, [orderIds])).rows[0] || {};
  const props = { lang: String(o.lang || "en").slice(0, 2), name: o.name || "", nr: inv.number || inv.id, amount: fmtReviewMoney(amount, cur), pm: label, n, url: inv.hosted_invoice_url || "", kind };
  const html = await render(React.createElement(RechnungAuto, props));
  const subject = rechnungAutoSubject(props);
  let attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  if (inv.invoice_pdf) {
    const r = await fetch(inv.invoice_pdf).catch(() => null);
    if (r && r.ok) attachments = [{ filename: `Rechnung-${props.nr}.pdf`, content: Buffer.from(await r.arrayBuffer()), contentType: "application/pdf" }];
  }
  await sendMail({ to: email, subject, html, attachments, replyTo: process.env.MAIL_REPLY_TO });
  for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "mail", title: `Rechnung ${props.nr} gesendet (automatisch)`, detail: `${props.amount} · ${label}${attachments.length ? " · PDF im Anhang" : " · ohne PDF (nur Link)"}`, html, subject, auto: true }).catch(() => {});
}

/* ---- Profil-Löschung: bei „Profil gelöscht" automatisch abbuchen (Auftrag mit Zahlungsart „automatisch") ----
 * Steuer exakt wie bei allen Abbuchungs-Rechnungen (taxFor): AT/EU ohne gültige UID → Stripe Tax (Leistungsort Empfängerland),
 * EU mit gültiger UID → Reverse Charge, außerhalb EU → nicht steuerbar; Fußzeile/UID wie gehabt.
 * Mit monatlichem Schutz (monthly/monitor): echtes Stripe-Abo mit demselben Abo-Preis wie bei den Zahlungslinks; die Löschung
 * steht als Einmalposten auf der ERSTEN Abo-Rechnung (eine Rechnung – wie beim Zahlungslink), danach monatlich nur der Schutz. */
const PROT_LABEL: Record<string, string> = { monthly: "Reputations-Schutz", monitor: "Reputations-Schutz + Monitoring" };
const protPriceCache = new Map<string, string>();
/** Monatlicher Abo-Preis: bestehender Stripe-Preis (gleicher Betrag/Währung/monatlich, bevorzugt rapidremove_protection), sonst neu anlegen. */
async function protectionPrice(key: string, prot: string, amount: number, cur: string): Promise<string> {
  const cents = Math.round(amount * 100);
  const ck = `${key.slice(-6)}|${prot}|${cents}|${cur}`;
  const hit = protPriceCache.get(ck); if (hit) return hit;
  let found: any = null;
  let after = "";
  for (let i = 0; i < 6 && !found; i++) {
    const page = await sx(key, "GET", "prices", { active: true, type: "recurring", currency: cur, limit: 100, ...(after ? { starting_after: after } : {}) });
    const list = ((page as any).data || []) as any[];
    const ok = list.filter((p) => p.unit_amount === cents && p.recurring?.interval === "month" && (p.recurring?.interval_count || 1) === 1);
    found = ok.find((p) => p.metadata?.rapidremove_protection === prot) || ok[0] || null;
    if (!(page as any).has_more || !list.length) break;
    after = list[list.length - 1].id;
  }
  if (!found) {
    const label = PROT_LABEL[prot] || "Reputations-Schutz";
    found = await sx(key, "POST", "prices", { currency: cur, unit_amount: cents, recurring: { interval: "month" }, tax_behavior: "exclusive", nickname: `${label} (${cur.toUpperCase()})`, product_data: { name: label }, metadata: { rapidremove_protection: prot } }, `rr-protprice-${ck}`);
  }
  protPriceCache.set(ck, found.id);
  return found.id;
}

export async function chargeProfileOrder(orderId: string): Promise<{ ok: boolean; amount?: number; cur?: string; error?: string; retry?: boolean } | null> {
  if (!pool) return null;
  const o = (await pool.query(`SELECT id, email, name, lang, country, status, pay, service, amount, prot_amount, protection, raw FROM orders WHERE id=$1`, [orderId])).rows[0];
  if (!o || o.service === "reviews" || o.service === "deindex" || o.pay === "paid" || o.status === "storniert") return null;
  const raw = (o.raw || {}) as Record<string, unknown>;
  if (raw.payMethod !== "auto" && !(raw.payGate as { status?: string } | undefined)) return null; // nur Aufträge mit „automatisch abbuchen"
  const email = String(o.email || "").toLowerCase();
  const k = keyFor(email);
  const row = await rowOf(email);
  if (!k || !row || !row.pm || row.mode !== k.mode) return null; // keine Zahlungsart → normaler Weg (Zahlungslink)
  const cur = o.country === "US" ? "usd" : "eur";
  const express = raw.express === true || raw.express === "true";
  // Leistung + Express (profileOneTime: Altbestand mit amount inkl. Express nicht doppelt) + ggf. lebenslanger Schutz.
  const amount = Math.round((profileOneTime(Number(o.amount) || 0, express, Number(raw.expressAmount) || 0) + (o.protection === "lifetime" ? Number(o.prot_amount) || 0 : 0)) * 100) / 100;
  if (!(amount > 0)) return null;
  const protMonthly = (o.protection === "monthly" || o.protection === "monitor") && Number(o.prot_amount) > 0 ? Math.round(Number(o.prot_amount) * 100) / 100 : 0;
  const id = newPayId();
  const desc = `Google-Profil gelöscht · ${orderId}`;
  let inv: any = null;
  let subId = "";
  try {
    await pushBillingToStripe(email, k.key, row.customer, row.pm).catch(() => {});
    const bill = await billingOf(email).catch(() => emptyBilling);
    const tax = await taxFor(email, k.key, row.customer);
    if (!protMonthly) {
      ({ inv } = await buildInvoice(k.key, {
        ...(bill.vat ? { custom_fields: [{ name: "UID / VAT", value: bill.vat.slice(0, 30) }] } : {}),
        customer: row.customer, collection_method: "charge_automatically", auto_advance: false, currency: cur,
        default_payment_method: row.pm, pending_invoice_items_behavior: "exclude", description: desc,
        metadata: { rr_pay: id, rr_email: email, rr_orders: orderId },
      }, tax, { customer: row.customer, amount: Math.round(amount * 100), currency: cur, description: desc }, id));
      inv = await sx(k.key, "POST", `invoices/${inv.id}/finalize`, {}, `rr-fin-${id}`);
      inv = await sx(k.key, "POST", `invoices/${inv.id}/pay`, { payment_method: row.pm, off_session: true }, `rr-pay-${id}`);
      if (inv.status !== "paid") throw new StripeErr(`Rechnung ${inv.status}`);
    } else {
      // Abo: Fußzeile + UID auf Kundenebene → stehen auf der ersten UND jeder Folgerechnung (Abo-Rechnungen haben keine eigene Fußzeile).
      const priceId = await protectionPrice(k.key, String(o.protection), protMonthly, cur);
      const startSub = async (t: Tax, sfx: string) => {
        await sx(k.key, "POST", `customers/${row.customer}`, { invoice_settings: { footer: t.footer, custom_fields: bill.vat ? [{ name: "UID / VAT", value: bill.vat.slice(0, 30) }] : "" } }).catch(() => {});
        // Löschung als offener Posten → Stripe nimmt ihn in die erste Abo-Rechnung auf (gleiche Steuer wie das Abo).
        const ii = await sx(k.key, "POST", "invoiceitems", { customer: row.customer, amount: Math.round(amount * 100), currency: cur, description: desc, ...(t.auto ? { tax_behavior: "exclusive" } : t.rates.length ? { tax_rates: t.rates } : {}), metadata: { rr_pay: id, rr_orders: orderId } }, `rr-ii-sub-${id}${sfx}`);
        try {
          return await sx(k.key, "POST", "subscriptions", {
            customer: row.customer, default_payment_method: row.pm, collection_method: "charge_automatically",
            items: [{ price: priceId, quantity: 1 }], off_session: true, payment_behavior: "error_if_incomplete",
            automatic_tax: { enabled: t.auto }, ...(!t.auto && t.rates.length ? { default_tax_rates: t.rates } : {}),
            description: `${PROT_LABEL[String(o.protection)] || "Reputations-Schutz"} · ${orderId}`,
            metadata: { rr_pay: id, rr_email: email, rr_orders: orderId, rr_protection: String(o.protection), rr_tax: t.mode },
            expand: ["latest_invoice"],
          }, `rr-sub-${id}${sfx}`);
        } catch (e) {
          await sx(k.key, "DELETE", `invoiceitems/${ii.id}`).catch(() => {}); // nicht verbraucht → wieder weg
          throw e;
        }
      };
      let sub: any;
      try { sub = await startSub(tax, ""); }
      catch (e) {
        if (!tax.auto || (e as StripeErr).decline) throw e;
        console.warn("Stripe Tax (Abo) nicht verfügbar – Ersatz 20 % AT", (e as Error).message);
        sub = await startSub(await taxFallback(k.key), "-m");
      }
      subId = sub.id;
      inv = sub.latest_invoice;
      if (!inv || inv.status !== "paid") { await sx(k.key, "DELETE", `subscriptions/${sub.id}`).catch(() => {}); throw new StripeErr(`Rechnung ${inv?.status || "offen"}`); }
    }
  } catch (e) {
    const err = e as StripeErr;
    const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 300);
    await pool.query(`UPDATE cust_autopay SET last_error=$2, updated_at=now() WHERE email=$1`, [email, msg]).catch(() => {});
    // Ohne Abo: finalisierte Rechnung bleibt OFFEN → Mail „Zahlung fehlgeschlagen" + 7 Versuche (wie Einzelbewertungen).
    let fin: any = null;
    if (inv?.id && !subId && !protMonthly) fin = inv.status === "open" ? inv : await sx(k.key, "GET", `invoices/${inv.id}`).catch(() => null);
    if (fin && fin.status === "open") {
      await insertEvent({ orderId, email, type: "pay", title: `Automatische Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, detail: `${row.label || ""} · ${msg}`, auto: true }).catch(() => {});
      await openProfileRetry(email, k, fin, id, orderId, amount, cur, row.label || "", err, msg);
      void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Abbuchung fehlgeschlagen (Profil) · ${amount} ${cur.toUpperCase()}`, `${email} · ${msg} · Kunde hat Mail bekommen, neue Versuche laufen automatisch`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
      return { ok: false, error: msg, retry: true };
    }
    if (inv?.id && !subId) void sx(k.key, "POST", `invoices/${inv.id}/void`, {}).catch(() => {});
    await insertEvent({ orderId, email, type: "pay", title: `Automatische Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}${protMonthly ? ` + Abo ${protMonthly}/Monat` : ""}`, detail: `${row.label || ""} · ${msg} → Zahlungslink geht automatisch an den Kunden`, auto: true }).catch(() => {});
    void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Abbuchung fehlgeschlagen (Profil) · ${amount} ${cur.toUpperCase()}`, `${email} · ${msg} · Zahlungslink geht automatisch raus`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
    return { ok: false, error: msg };
  }
  await pool.query(`UPDATE orders SET pay='paid' WHERE id=$1`, [orderId]);
  if (subId) await setOrderRawField(orderId, "autoSub", { id: subId, mode: k.mode, at: new Date().toISOString(), monthly: protMonthly, protection: o.protection }).catch(() => false);
  await pool.query(`UPDATE cust_autopay SET last_error=NULL, updated_at=now() WHERE email=$1`, [email]).catch(() => {});
  const subTxt = protMonthly ? ` · Abo ${fmtReviewMoney(protMonthly, cur)}/Monat gestartet (${subId})` : "";
  await insertEvent({ orderId, email, type: "pay", title: `Bezahlt: automatisch abgebucht · ${amount} ${cur.toUpperCase()}${protMonthly ? " + Abo" : ""}${k.mode === "test" ? " (TEST)" : ""}`, detail: `${row.label || ""} · Stripe-Rechnung ${inv.number || inv.id} · Profil gelöscht${subTxt}`, auto: true }).catch(() => {});
  void logCustEvent(email, "payment_success", `Automatisch abgebucht (Profil) · ${amount} ${cur.toUpperCase()}${protMonthly ? ` + Abo ${protMonthly}/Monat` : ""}`, { amount, cur, auto: true, sub: !!subId }, { orderId });
  void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Automatisch bezahlt (Profil) · ${amount} ${cur.toUpperCase()}${protMonthly ? " + Abo" : ""}`, `${email} · ${row.label || ""}`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
  await sendInvoiceMail(email, inv, grossOf(inv, amount + protMonthly), cur, row.label || "", 1, [orderId], "profile").catch((e) => console.error("Rechnungs-Mail (Profil) fehlgeschlagen", e));
  return { ok: true, amount, cur };
}

/* ---- Abbuchen ---- */
const busy = new Set<string>();

/* ---- Fehlgeschlagene Abbuchung: Rechnung offen lassen + erneut versuchen (Maximilian 06.11.2026) ----
 * Statt die Rechnung sofort zu stornieren, bleibt sie offen und wird nach diesem Plan erneut belastet (Tage nach dem 1. Fehlschlag):
 * insgesamt 7 Versuche in 7 Tagen. Kunde bekommt EINMAL sofort die Mail „Zahlung fehlgeschlagen" (Dashboard + Rechnungslink).
 * Hinterlegt er eine neue Zahlungsart, wird die offene Rechnung sofort damit belastet. Wird anders bezahlt (Admin „bezahlt",
 * PayPal …) oder storniert, wird die offene Rechnung storniert. Harte Ablehnungen (Karte gesperrt/gestohlen, „do_not_try_again")
 * → keine automatischen Versuche, Rechnung bleibt 7 Tage zum Selbstzahlen offen. Danach: Rechnung storniert, Mahnungen laufen normal. */
export const RETRY_DAYS = [1, 2, 3, 4, 5, 7];
export const ADMIN_RETRY = "Admin: erneut abbuchen"; // Admin-Knopf → offene Rechnung sofort belasten bzw. neue anlegen
const MAX_TRIES = RETRY_DAYS.length + 1;
const DAY = 24 * 3600e3;
const HARD = new Set(["lost_card", "stolen_card", "pickup_card", "fraudulent", "restricted_card", "security_violation", "revocation_of_authorization", "revocation_of_all_authorizations", "stop_payment_order", "invalid_account", "new_account_information_available", "card_not_supported"]);
const isHard = (e: StripeErr) => e.advice === "do_not_try_again" || HARD.has(String(e.decline || ""));
type RetryRow = { id: string; email: string; mode: Mode; cur: string; inv: string; pay_id: string; amount: string | number; n: number; picks: PayRef[]; orders: string[]; label: string | null; tries: number; hard: boolean; next_at: string | null; created_at: string; kind?: string; order_id?: string | null };
async function openRetries(email: string): Promise<RetryRow[]> {
  if (!pool) return [];
  await init();
  return (await pool.query(`SELECT * FROM cust_autopay_retry WHERE email=$1 AND status='open' ORDER BY id`, [email.toLowerCase()])).rows as RetryRow[];
}
async function closeRetry(id: string, status: string, err?: string | null): Promise<void> {
  await pool?.query(`UPDATE cust_autopay_retry SET status=$2, last_error=COALESCE($3, last_error), updated_at=now() WHERE id=$1`, [id, status, err || null]).catch(() => {});
}
const fmtAt = (d: Date) => d.toLocaleString("de-AT", { timeZone: "Europe/Vienna", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Bezahlte Abbuchungs-Rechnung verbuchen (Erfolg direkt oder später bei einem neuen Versuch / Zahlung über den Rechnungslink). */
async function settleReviewsPaid(email: string, k: { mode: Mode }, label: string, inv: any, id: string, picks: PayRef[], orderIds: string[], amount: number, cur: string, why: string): Promise<AutoCharged> {
  const primary = picks[0].o;
  const url = String(inv.hosted_invoice_url || `https://dashboard.stripe.com/${k.mode === "test" ? "test/" : ""}invoices/${inv.id}`);
  await addOrderPayment(primary, { id, kind: "invoice", amount, cur, url, n: picks.length, via: "autopay", keys: picks.filter((r) => r.o === primary).map((r) => r.k), refs: picks.filter((r) => r.o !== primary) });
  await markReviewPaymentPaid(email, amount, `rr_${id}`);
  await pool?.query(`UPDATE cust_autopay SET last_error=NULL, updated_at=now() WHERE email=$1`, [email]).catch(() => {});
  for (const oid of new Set(picks.map((p) => p.o))) {
    await insertEvent({ orderId: oid, email, type: "pay", title: `Bezahlt: automatisch abgebucht · ${amount} ${cur.toUpperCase()}${k.mode === "test" ? " (TEST)" : ""}`, detail: `${label} · ${picks.length} Bewertung(en) · Stripe-Rechnung ${inv.number || inv.id} · Anlass: ${why}`, auto: true }).catch(() => {});
  }
  // Rechnung an den Kunden (PDF im Anhang) – nach JEDER Abbuchung, wie bei den Zahlungslinks.
  await sendInvoiceMail(email, inv, grossOf(inv, amount), cur, label, picks.length, orderIds).catch((e) => console.error("Rechnungs-Mail (Autopay) fehlgeschlagen", e));
  void logCustEvent(email, "payment_success", `Automatisch abgebucht · ${amount} ${cur.toUpperCase()}`, { amount, cur, kind: "invoice", auto: true }, { orderId: primary });
  void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Automatisch bezahlt · ${amount} ${cur.toUpperCase()}`, `${email} · ${label} · ${picks.length} gelöschte Bewertung(en) · ${why}`, `${SITE_URL}/admin?order=${encodeURIComponent(primary)}`, { kind: "pay" });
  return { amount, cur, label, invoiceUrl: url };
}

/** Mail „Zahlung fehlgeschlagen – bitte Zahlungsart aktualisieren" (einmal je fehlgeschlagener Rechnung). */
async function sendFailMail(email: string, inv: any, amount: number, cur: string, label: string, n: number, orderIds: string[], kind: "reviews" | "profile" = "reviews"): Promise<void> {
  if (!pool) return;
  if (await getDunPause(email).catch(() => null)) { // Admin hat Auto-Mahnungen für diesen Kunden pausiert
    for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "note", title: "Mail „Zahlung fehlgeschlagen“ NICHT gesendet – Auto-Mahnungen pausiert", auto: true }).catch(() => {});
    return;
  }
  const o = (await pool.query(`SELECT name, lang, profile, company FROM orders WHERE id = ANY($1::text[]) ORDER BY created_at DESC LIMIT 1`, [orderIds])).rows[0] || {};
  const lang = String(o.lang || "en").slice(0, 2);
  const props = { lang, name: o.name || "", amount: fmtReviewMoney(grossOf(inv, amount), cur), pm: label, n, dashUrl: await dashLink(email, lang), invoiceUrl: inv?.hosted_invoice_url || "", kind, business: o.profile || o.company || "" };
  const html = await render(React.createElement(ZahlungFehlgeschlagenReviews, props));
  const subject = zahlungFehlgeschlagenSubject(props);
  await sendMail({ to: email, subject, html, replyTo: process.env.MAIL_REPLY_TO });
  for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "mail", title: "Zahlungsaufforderung „Abbuchung nicht durchgegangen – Zahlungsart aktualisieren“ gesendet (automatisch)", detail: `${props.amount} · ${label} · neue Versuche nach ${RETRY_DAYS.join("/")} Tagen`, html, subject, auto: true }).catch(() => {});
}

/** Offene Fehlschlag-Rechnung prüfen und ggf. erneut belasten. state "open" = steht noch offen → KEINE neue Rechnung anlegen. */
async function settleOpen(email: string, k: { key: string; mode: Mode }, row: Row, r: RetryRow, force: boolean): Promise<{ state: "open" | "done"; paid?: AutoCharged }> {
  if (r.kind === "profile") return settleOpenProfile(email, k, row, r, force);
  const amount = Number(r.amount); const cur = r.cur; const label = row.label || r.label || "";
  const picks = (Array.isArray(r.picks) ? r.picks : []) as PayRef[]; const orderIds = (Array.isArray(r.orders) ? r.orders : []) as string[];
  if (r.mode !== k.mode || !picks.length) { await closeRetry(r.id, "void"); return { state: "done" }; }
  let inv: any = await sx(k.key, "GET", `invoices/${r.inv}`).catch(() => null);
  if (!inv) return { state: "open" }; // Stripe gerade nicht erreichbar → später
  if (inv.status === "paid") { // z. B. Kunde hat über den Rechnungslink bezahlt
    const paid = await settleReviewsPaid(email, k, label, inv, r.pay_id, picks, orderIds, amount, cur, "offene Rechnung bezahlt");
    await closeRetry(r.id, "paid"); return { state: "done", paid };
  }
  if (inv.status !== "open") { await closeRetry(r.id, String(inv.status || "void")); return { state: "done" }; }
  // Sind alle Bewertungen der Rechnung noch unbezahlt? Sonst (anders bezahlt / storniert) Rechnung stornieren.
  const { orders } = await loadCustomerOrders(email);
  const unpaid = new Set(orders.flatMap((o) => (o.cancelled ? [] : o.items.filter((it) => it.status === "removed" && !it.paid).map((it) => o.id + "\u0001" + it.key))));
  if (!picks.every((p) => unpaid.has(p.o + "\u0001" + p.k))) {
    await sx(k.key, "POST", `invoices/${r.inv}/void`, {}).catch(() => {});
    await closeRetry(r.id, "void");
    for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "pay", title: `Offene Abbuchungs-Rechnung storniert (${amount} ${cur.toUpperCase()})`, detail: `Stripe-Rechnung ${inv.number || inv.id} · Bewertungen inzwischen anders bezahlt oder storniert`, auto: true }).catch(() => {});
    return { state: "done" };
  }
  const age = Date.now() - new Date(r.created_at).getTime();
  if (r.hard && !force) {
    if (age < 7 * DAY) return { state: "open" };
    await sx(k.key, "POST", `invoices/${r.inv}/void`, {}).catch(() => {});
    await closeRetry(r.id, "failed");
    for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "pay", title: `Abbuchung endgültig fehlgeschlagen – Rechnung nach 7 Tagen storniert (${amount} ${cur.toUpperCase()})`, detail: "Harte Ablehnung, Kunde hat nichts geändert · Mahnungen laufen normal", auto: true }).catch(() => {});
    void notifyTeam("Abbuchung endgültig fehlgeschlagen", `${email} · ${amount} ${cur.toUpperCase()} · Karte abgelehnt (keine Wiederholung möglich) · Mahnungen laufen normal`, `${SITE_URL}/admin?order=${encodeURIComponent(orderIds[0] || "")}`, { kind: "pay" });
    return { state: "open" }; // in diesem Lauf keine neue Rechnung mehr anlegen
  }
  if (!force && (!r.next_at || Date.now() < new Date(r.next_at).getTime())) return { state: "open" };
  const tries = (Number(r.tries) || 1) + 1;
  try {
    inv = await sx(k.key, "POST", `invoices/${r.inv}/pay`, { payment_method: row.pm, off_session: true }, `rr-pay-${r.pay_id}-${tries}`);
    if (inv.status !== "paid") throw new StripeErr(`Rechnung ${inv.status}`);
    await pool?.query(`UPDATE cust_autopay_retry SET tries=$2 WHERE id=$1`, [r.id, tries]).catch(() => {});
    const paid = await settleReviewsPaid(email, k, label, inv, r.pay_id, picks, orderIds, amount, cur, `${force ? "neue Zahlungsart / manuell" : "automatischer Versuch"} ${tries}/${MAX_TRIES}`);
    await closeRetry(r.id, "paid");
    return { state: "done", paid };
  } catch (e) {
    const err = e as StripeErr;
    const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 300);
    await pool?.query(`UPDATE cust_autopay SET last_error=$2, updated_at=now() WHERE email=$1`, [email, msg]).catch(() => {});
    const hard = isHard(err);
    const last = !hard && tries >= MAX_TRIES;
    if (last) {
      await sx(k.key, "POST", `invoices/${r.inv}/void`, {}).catch(() => {});
      await pool?.query(`UPDATE cust_autopay_retry SET tries=$2, status='failed', last_error=$3, updated_at=now() WHERE id=$1`, [r.id, tries, msg]).catch(() => {});
      for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "pay", title: `Abbuchung ${tries}× fehlgeschlagen – Rechnung storniert (${amount} ${cur.toUpperCase()})`, detail: `${label} · ${msg} · Mahnungen laufen normal`, auto: true }).catch(() => {});
      void notifyTeam(`Abbuchung ${tries}× fehlgeschlagen`, `${email} · ${amount} ${cur.toUpperCase()} · ${msg} · Rechnung storniert, Mahnungen laufen normal`, `${SITE_URL}/admin?order=${encodeURIComponent(orderIds[0] || "")}`, { kind: "pay" });
      return { state: "open" }; // in diesem Lauf keine neue Rechnung mehr anlegen
    }
    const next = hard ? null : new Date(new Date(r.created_at).getTime() + RETRY_DAYS[Math.min(tries - 1, RETRY_DAYS.length - 1)] * DAY);
    await pool?.query(`UPDATE cust_autopay_retry SET tries=$2, hard=$3, next_at=$4, last_error=$5, updated_at=now() WHERE id=$1`, [r.id, tries, hard || r.hard, next, msg]).catch(() => {});
    for (const oid of orderIds) await insertEvent({ orderId: oid, email, type: "pay", title: `Abbuchung Versuch ${tries}/${MAX_TRIES} fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, detail: `${label} · ${msg}${next ? ` · nächster Versuch ${fmtAt(next)}` : " · harte Ablehnung: keine weiteren automatischen Versuche"}`, auto: true }).catch(() => {});
    await holdForCard(orderIds, email, label, msg, `${amount} ${cur.toUpperCase()}`, k.mode === "test").catch(() => {});
    return { state: "open" };
  }
}

/* ---- Profil-Löschung: dieselbe Logik (06.11.2026, Maximilian: „bei Weaver gilt das gleiche wie für Miami") ----
 * Offene Rechnung + Mail + 7 Versuche. Endgültig fehlgeschlagen → Rechnung storniert, dann wie bisher Zahlungslink + Auto-Mahnungen. */
async function settleProfilePaid(email: string, k: { mode: Mode }, label: string, inv: any, orderId: string, amount: number, cur: string, why: string): Promise<AutoCharged> {
  await pool?.query(`UPDATE orders SET pay='paid' WHERE id=$1`, [orderId]);
  await pool?.query(`UPDATE cust_autopay SET last_error=NULL, updated_at=now() WHERE email=$1`, [email]).catch(() => {});
  await insertEvent({ orderId, email, type: "pay", title: `Bezahlt: automatisch abgebucht · ${amount} ${cur.toUpperCase()}${k.mode === "test" ? " (TEST)" : ""}`, detail: `${label} · Stripe-Rechnung ${inv.number || inv.id} · Profil gelöscht · Anlass: ${why}`, auto: true }).catch(() => {});
  void logCustEvent(email, "payment_success", `Automatisch abgebucht (Profil) · ${amount} ${cur.toUpperCase()}`, { amount, cur, auto: true }, { orderId });
  void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Automatisch bezahlt (Profil) · ${amount} ${cur.toUpperCase()}`, `${email} · ${label} · ${why}`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
  await sendInvoiceMail(email, inv, grossOf(inv, amount), cur, label, 1, [orderId], "profile").catch((e) => console.error("Rechnungs-Mail (Profil) fehlgeschlagen", e));
  if (autopayHooks.profilePaid) void autopayHooks.profilePaid(orderId);
  const url = String(inv.hosted_invoice_url || "");
  return { amount, cur, label, invoiceUrl: url };
}
async function settleOpenProfile(email: string, k: { key: string; mode: Mode }, row: Row, r: RetryRow, force: boolean): Promise<{ state: "open" | "done"; paid?: AutoCharged }> {
  const amount = Number(r.amount); const cur = r.cur; const label = row.label || r.label || ""; const orderId = String(r.order_id || (r.orders || [])[0] || "");
  if (r.mode !== k.mode || !orderId) { await closeRetry(r.id, "void"); return { state: "done" }; }
  let inv: any = await sx(k.key, "GET", `invoices/${r.inv}`).catch(() => null);
  if (!inv) return { state: "open" };
  if (inv.status === "paid") {
    const o0 = (await pool?.query(`SELECT pay FROM orders WHERE id=$1`, [orderId]))?.rows[0];
    const paid = o0?.pay === "paid" ? undefined : await settleProfilePaid(email, k, label, inv, orderId, amount, cur, "offene Rechnung bezahlt");
    await closeRetry(r.id, "paid"); return { state: "done", paid };
  }
  if (inv.status !== "open") { await closeRetry(r.id, String(inv.status || "void")); return { state: "done" }; }
  const o = (await pool?.query(`SELECT pay, status FROM orders WHERE id=$1`, [orderId]))?.rows[0] as { pay?: string; status?: string } | undefined;
  if (!o || o.pay === "paid" || o.status === "storniert" || o.pay === "refunded") {
    await sx(k.key, "POST", `invoices/${r.inv}/void`, {}).catch(() => {});
    await closeRetry(r.id, "void");
    await insertEvent({ orderId, email, type: "pay", title: `Offene Abbuchungs-Rechnung storniert (${amount} ${cur.toUpperCase()})`, detail: `Stripe-Rechnung ${inv.number || inv.id} · Auftrag inzwischen anders bezahlt oder storniert`, auto: true }).catch(() => {});
    return { state: "done" };
  }
  const giveUp = async (msg: string, tries: number) => {
    await sx(k.key, "POST", `invoices/${r.inv}/void`, {}).catch(() => {});
    await pool?.query(`UPDATE cust_autopay_retry SET tries=$2, status='failed', last_error=$3, updated_at=now() WHERE id=$1`, [r.id, tries, msg]).catch(() => {});
    await insertEvent({ orderId, email, type: "pay", title: `Abbuchung endgültig fehlgeschlagen – Rechnung storniert (${amount} ${cur.toUpperCase()})`, detail: `${label} · ${msg} · jetzt Zahlungslink + Auto-Mahnungen wie bisher`, auto: true }).catch(() => {});
    void notifyTeam(`Abbuchung endgültig fehlgeschlagen (Profil)`, `${email} · ${amount} ${cur.toUpperCase()} · ${msg} · Zahlungslink + Mahnungen laufen`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
    if (autopayHooks.profileFallback) await autopayHooks.profileFallback(orderId, msg).catch(() => {});
  };
  const age = Date.now() - new Date(r.created_at).getTime();
  if (r.hard && !force) { if (age < 7 * DAY) return { state: "open" }; await giveUp("harte Ablehnung, Kunde hat nichts geändert", Number(r.tries) || 1); return { state: "open" }; }
  if (!force && (!r.next_at || Date.now() < new Date(r.next_at).getTime())) return { state: "open" };
  const tries = (Number(r.tries) || 1) + 1;
  try {
    inv = await sx(k.key, "POST", `invoices/${r.inv}/pay`, { payment_method: row.pm, off_session: true }, `rr-pay-${r.pay_id}-${tries}`);
    if (inv.status !== "paid") throw new StripeErr(`Rechnung ${inv.status}`);
    await pool?.query(`UPDATE cust_autopay_retry SET tries=$2 WHERE id=$1`, [r.id, tries]).catch(() => {});
    const paid = await settleProfilePaid(email, k, label, inv, orderId, amount, cur, `${force ? "neue Zahlungsart / manuell" : "automatischer Versuch"} ${tries}/${MAX_TRIES}`);
    await closeRetry(r.id, "paid");
    return { state: "done", paid };
  } catch (e) {
    const err = e as StripeErr;
    const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 300);
    await pool?.query(`UPDATE cust_autopay SET last_error=$2, updated_at=now() WHERE email=$1`, [email, msg]).catch(() => {});
    const hard = isHard(err);
    if (!hard && tries >= MAX_TRIES) { await giveUp(msg, tries); return { state: "open" }; }
    const next = hard ? null : new Date(new Date(r.created_at).getTime() + RETRY_DAYS[Math.min(tries - 1, RETRY_DAYS.length - 1)] * DAY);
    await pool?.query(`UPDATE cust_autopay_retry SET tries=$2, hard=$3, next_at=$4, last_error=$5, updated_at=now() WHERE id=$1`, [r.id, tries, hard || r.hard, next, msg]).catch(() => {});
    await insertEvent({ orderId, email, type: "pay", title: `Abbuchung Versuch ${tries}/${MAX_TRIES} fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, detail: `${label} · ${msg}${next ? ` · nächster Versuch ${fmtAt(next)}` : " · harte Ablehnung: keine weiteren automatischen Versuche"}`, auto: true }).catch(() => {});
    return { state: "open" };
  }
}
/** Neue Retry-Zeile für eine offene Profil-Rechnung anlegen (nach fehlgeschlagener Abbuchung oder Übernahme einer offenen Rechnung). */
async function openProfileRetry(email: string, k: { mode: Mode }, inv: any, payId: string, orderId: string, amount: number, cur: string, label: string, err: StripeErr | null, msg: string): Promise<void> {
  const hard = err ? isHard(err) : false;
  const next = hard ? null : new Date(Date.now() + RETRY_DAYS[0] * DAY);
  await pool?.query(`INSERT INTO cust_autopay_retry (email, mode, cur, inv, pay_id, amount, n, picks, orders, label, tries, hard, next_at, last_error, kind, order_id) VALUES ($1,$2,$3,$4,$5,$6,1,'[]'::jsonb,$7,$8,1,$9,$10,$11,'profile',$12)`,
    [email, k.mode, cur, inv.id, payId, amount, JSON.stringify([orderId]), label || null, hard, next, msg, orderId]);
  await insertEvent({ orderId, email, type: "pay", title: `Rechnung ${inv.number || inv.id} bleibt offen – neue Abbuchungsversuche laufen`, detail: next ? `nach ${RETRY_DAYS.join("/")} Tagen (nächster ${fmtAt(next)})` : "harte Ablehnung: keine automatischen Versuche, Kunde muss Zahlungsart ändern", auto: true }).catch(() => {});
  await sendFailMail(email, inv, amount, cur, label, 1, [orderId], "profile").catch((e) => console.error("Mail „Zahlung fehlgeschlagen“ (Profil) fehlgeschlagen", e));
}

/** Admin „Abbuchung erneut versuchen" für Profil-Aufträge: offene Retry-Rechnung sofort belasten; sonst offene Stripe-Rechnung
 *  dieses Auftrags übernehmen (z. B. im Stripe-Dashboard dupliziert); sonst neue Abbuchung. */
export async function retryProfileCharge(orderId: string): Promise<{ ok: boolean; paid?: boolean; error?: string; adopted?: string }> {
  if (!pool) return { ok: false, error: "db" };
  const o = (await pool.query(`SELECT id, email, country, pay, status, service FROM orders WHERE id=$1`, [orderId])).rows[0];
  if (!o || o.service === "reviews") return { ok: false, error: "kein Profil-Auftrag" };
  if (o.pay === "paid") return { ok: true, paid: true };
  const email = String(o.email || "").toLowerCase();
  const k = keyFor(email); const row = await rowOf(email);
  if (!k || !row || !row.pm || row.mode !== k.mode) return { ok: false, error: "Keine Zahlungsart hinterlegt" };
  const open = (await openRetries(email)).find((r) => r.kind === "profile" && r.order_id === orderId);
  if (open) { const res = await chargeDue(email, ADMIN_RETRY); const p = (await pool.query(`SELECT pay FROM orders WHERE id=$1`, [orderId])).rows[0]; return { ok: true, paid: p?.pay === "paid" || !!res }; }
  // Offene Stripe-Rechnung zu diesem Auftrag übernehmen statt eine zweite anzulegen.
  const list: any = await sx(k.key, "GET", "invoices", { customer: row.customer, status: "open", limit: 20 }).catch(() => null);
  const cand = (list?.data || []).find((i: any) => String(i?.metadata?.rr_orders || "").split(",").includes(orderId));
  if (cand) {
    if (cand.auto_advance) await sx(k.key, "POST", `invoices/${cand.id}`, { auto_advance: false }).catch(() => {}); // Stripe soll nicht parallel selbst versuchen
    const cur = String(cand.currency || (o.country === "US" ? "usd" : "eur"));
    const amount = Number(cand.subtotal ?? cand.amount_due ?? 0) / 100;
    const payId = String(cand.metadata?.rr_pay || newPayId());
    let inv: any = cand; let err: StripeErr | null = null;
    try { inv = await sx(k.key, "POST", `invoices/${cand.id}/pay`, { payment_method: row.pm, off_session: true }, `rr-pay-${payId}-adopt-${Date.now()}`); if (inv.status !== "paid") throw new StripeErr(`Rechnung ${inv.status}`); }
    catch (e) { err = e as StripeErr; }
    if (!err) { await settleProfilePaid(email, k, row.label || "", inv, orderId, amount, cur, `Admin: offene Rechnung ${cand.number || cand.id} erneut belastet`); return { ok: true, paid: true, adopted: cand.number || cand.id }; }
    const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 300);
    await pool.query(`UPDATE cust_autopay SET last_error=$2, updated_at=now() WHERE email=$1`, [email, msg]).catch(() => {});
    await insertEvent({ orderId, email, type: "pay", title: `Automatische Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()} (Admin, Rechnung ${cand.number || cand.id})`, detail: `${row.label || ""} · ${msg}`, auto: true }).catch(() => {});
    await openProfileRetry(email, k, cand, payId, orderId, amount, cur, row.label || "", err, msg);
    return { ok: true, paid: false, adopted: cand.number || cand.id };
  }
  const r = await chargeProfileOrder(orderId);
  if (!r) return { ok: false, error: "nicht abbuchbar (kein Autopay-Auftrag?)" };
  return { ok: true, paid: !!r.ok, error: r.ok ? undefined : r.error };
}

/** Für das Dashboard („Zahlen"): offene Fehlschlag-Rechnung statt eines zweiten Zahlungslinks (keine Doppelzahlung). */
export async function openFailedInvoice(email0: string, cur: string): Promise<{ url: string; amount: number; n: number } | null> {
  const email = String(email0 || "").toLowerCase();
  const k = keyFor(email); if (!k) return null;
  const r = (await openRetries(email)).find((x) => x.cur === cur && x.mode === k.mode && x.kind !== "profile");
  if (!r) return null;
  const inv: any = await sx(k.key, "GET", `invoices/${r.inv}`).catch(() => null);
  if (!inv || inv.status !== "open" || !inv.hosted_invoice_url) return null;
  return { url: String(inv.hosted_invoice_url), amount: Number(r.amount), n: Number(r.n) || 1 };
}

/** Offene Beträge (gelöschte, unbezahlte Bewertungen) aller Aufträge des Kunden abbuchen – je Währung eine Rechnung. */
export async function chargeDue(email0: string, why = "Löschung"): Promise<AutoCharged | null> {
  const email = String(email0 || "").toLowerCase();
  const k = keyFor(email);
  if (!k || !pool) return null;
  const row = await rowOf(email);
  if (!row || !row.pm || row.mode !== k.mode) return null;
  if (busy.has(email)) return null;
  busy.add(email);
  // Kunde hat aktiv etwas getan (neue Zahlungsart) → offene Fehlschlag-Rechnung sofort neu belasten; sonst nur nach Plan.
  const force = why === "Zahlungsart hinterlegt" || why === ADMIN_RETRY;
  const planOnly = why === "Wiederholung (Plan)"; // retryTick: nur offene Rechnungen prüfen/belasten, nie eine neue anlegen
  try {
    const openAll = (await openRetries(email)).filter((r) => r.mode === k.mode);
    let res: AutoCharged | null = null;
    const add = (p: AutoCharged) => { res = { amount: Math.round((((res as AutoCharged | null)?.amount || 0) + p.amount) * 100) / 100, cur: p.cur, label: p.label, invoiceUrl: p.invoiceUrl }; };
    for (const r of openAll.filter((x) => x.kind === "profile")) { const s0 = await settleOpen(email, k, row, r, force); if (s0.paid) add(s0.paid); }
    const open0 = openAll.filter((r) => r.kind !== "profile");
    const first = await loadCustomerOrders(email);
    const curs = [...new Set([...first.orders.filter((o) => o.toPay > 0 && !o.cancelled).map((o) => o.cur as string), ...open0.map((r) => r.cur)])];
    for (const cur of curs) {
      const open = open0.find((r) => r.cur === cur);
      let paidThis = false;
      if (open) {
        const s0 = await settleOpen(email, k, row, open, force);
        if (s0.paid) { add(s0.paid); paidThis = true; }
        if (s0.state === "open") continue; // offene Rechnung läuft noch → keine zweite Rechnung (neue Löschungen kommen danach dazu)
      }
      // Geplante Wiederholung legt nie eine neue Rechnung an – außer die offene wurde gerade bezahlt: dann weitere
      // inzwischen gelöschte Bewertungen gleich mit der (jetzt funktionierenden) Zahlungsart abbuchen.
      if (planOnly && !paidThis) continue;
      const { orders } = open ? await loadCustomerOrders(email) : first;
      const use = orders.filter((o) => o.toPay > 0 && !o.cancelled && o.cur === cur);
      const picks: PayRef[] = use.flatMap((o) => o.items.filter((it) => it.status === "removed" && !it.paid).map((it) => ({ o: o.id, k: it.key })));
      const amount = Math.round(use.reduce((s, o) => s + o.toPay, 0) * 100) / 100;
      if (!picks.length || !(amount > 0)) continue;
      const id = newPayId();
      const primary = picks[0].o;
      const orderIds = [...new Set(use.map((o) => o.id))];
      // Preismodell 2: Express-Aufschlag nur für rechtzeitig gelöschte Bewertungen (xOk) – auf der Rechnung ausgewiesen.
      const nXok = use.reduce((s2, o) => s2 + o.items.filter((it) => it.status === "removed" && !it.paid && (it as { xOk?: boolean }).xOk).length, 0);
      const desc = `Entfernte Google-Bewertungen · ${picks.length} ×${nXok ? ` · inkl. Express-Löschung ${nXok} ×` : ""} · ${orderIds.join(", ")}`;
      let inv: any = null;
      try {
        await pushBillingToStripe(email, k.key, row.customer, row.pm).catch(() => {});
        const bill = await billingOf(email).catch(() => emptyBilling);
        const tax = await taxFor(email, k.key, row.customer);
        ({ inv } = await buildInvoice(k.key, {
          ...(bill.vat ? { custom_fields: [{ name: "UID / VAT", value: bill.vat.slice(0, 30) }] } : {}),
          customer: row.customer, collection_method: "charge_automatically", auto_advance: false, currency: cur,
          default_payment_method: row.pm, pending_invoice_items_behavior: "exclude", description: desc,
          metadata: { rr_pay: id, rr_email: email, rr_orders: orderIds.join(",") },
        }, tax, { customer: row.customer, amount: Math.round(amount * 100), currency: cur, description: desc }, id));
        inv = await sx(k.key, "POST", `invoices/${inv.id}/finalize`, {}, `rr-fin-${id}`);
        inv = await sx(k.key, "POST", `invoices/${inv.id}/pay`, { payment_method: row.pm, off_session: true }, `rr-pay-${id}`);
        if (inv.status !== "paid") throw new StripeErr(`Rechnung ${inv.status}`);
      } catch (e) {
        const err = e as StripeErr;
        const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 300);
        await pool.query(`UPDATE cust_autopay SET last_error=$2, updated_at=now() WHERE email=$1`, [email, msg]).catch(() => {});
        // Ist die Rechnung finalisiert (Zahlung abgelehnt), bleibt sie OFFEN und wird nach Plan erneut belastet. Sonst (Fehler vor
        // dem Finalisieren, z. B. Stripe nicht erreichbar) wie bisher: Entwurf weg, beim nächsten Anlass neu.
        let fin: any = null;
        if (inv?.id) fin = inv.status === "open" ? inv : await sx(k.key, "GET", `invoices/${inv.id}`).catch(() => null);
        if (fin && fin.status === "open") {
          const hard = isHard(err);
          const next = hard ? null : new Date(Date.now() + RETRY_DAYS[0] * DAY);
          await pool.query(`INSERT INTO cust_autopay_retry (email, mode, cur, inv, pay_id, amount, n, picks, orders, label, tries, hard, next_at, last_error) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,$11,$12,$13)`,
            [email, k.mode, cur, fin.id, id, amount, picks.length, JSON.stringify(picks), JSON.stringify(orderIds), row.label || null, hard, next, msg]);
          await insertEvent({ orderId: primary, email, type: "pay", title: `Automatische Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, detail: `${row.label || "Zahlungsart"} · ${msg} → Rechnung ${fin.number || fin.id} bleibt offen · ${next ? `neue Versuche nach ${RETRY_DAYS.join("/")} Tagen (nächster ${fmtAt(next)})` : "harte Ablehnung: keine automatischen Versuche, Kunde muss Zahlungsart ändern"}`, auto: true }).catch(() => {});
          await sendFailMail(email, fin, amount, cur, row.label || "", picks.length, orderIds).catch((e2) => console.error("Mail „Zahlung fehlgeschlagen“ fehlgeschlagen", e2));
        } else {
          if (inv?.id) void sx(k.key, "POST", `invoices/${inv.id}/void`, {}).catch(() => {}); // Entwurf nicht stehen lassen
          await insertEvent({ orderId: primary, email, type: "pay", title: `Automatische Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, detail: `${row.label || "Zahlungsart"} · ${msg} → keine Rechnung angelegt, nächster Anlass versucht es neu`, auto: true }).catch(() => {});
        }
        await holdForCard(orderIds, email, row.label || "", msg, `${amount} ${cur.toUpperCase()}`, k.mode === "test").catch(() => {});
        void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, `${email} · ${row.label || ""} · ${msg}${fin?.status === "open" ? " · Rechnung bleibt offen, neue Versuche laufen automatisch" : ""}`, `${SITE_URL}/admin?order=${encodeURIComponent(primary)}`, { kind: "pay" });
        continue;
      }
      add(await settleReviewsPaid(email, k, row.label || "", inv, id, picks, orderIds, amount, cur, why));
    }
    return res;
  } finally { busy.delete(email); }
}

/* ---- Deckungsprüfung beim Hinterlegen (Maximilian 06.11.2026: „unbedingt, in Auftragshöhe") ----
 * Neue Zahlungsart → Autorisierung (manual capture) über den offenen Auftragswert, sofort wieder storniert (nichts abgebucht).
 * Abgelehnt → Zahlungsart wird NICHT gespeichert, Kunde muss eine andere nehmen. Nicht prüfbar (3-D-Secure nötig, Zahlungsart
 * kann keine Reservierung, Stripe-Fehler) → durchlassen, Vermerk im Verlauf. Abschalten: AUTOPAY_COVERAGE=off. */
type Coverage = { result: "ok" | "declined" | "skipped"; amount: number; cur: string; why?: string };
/** Offener Auftragswert (netto) je Währung: unbezahlte, nicht stornierte/abgelehnte Bewertungen + unbezahlte Profil-Aufträge mit Autopay. */
async function openOrderValue(email: string): Promise<{ amount: number; cur: string; orderIds: string[] }> {
  const { orders } = await loadCustomerOrders(email);
  const by = new Map<string, { amount: number; ids: Set<string> }>();
  const addTo = (cur: string, v: number, id: string) => { if (!(v > 0)) return; const x = by.get(cur) || { amount: 0, ids: new Set<string>() }; x.amount += v; x.ids.add(id); by.set(cur, x); };
  for (const o of orders as (typeof orders[number] & { kind?: string; autoPay?: boolean; profileOrder?: { paid?: boolean; amount?: number; status?: string } })[]) {
    if (o.cancelled) continue;
    if (o.kind === "profile") { const p = o.profileOrder; if (o.autoPay && p && !p.paid && p.status !== "cancelled") addTo(String(o.cur), Number(p.amount) || 0, o.id); continue; }
    const v = (o.items || []).filter((it) => !it.paid && !["cancelled", "sw_declined", "notpossible"].includes(String(it.status)) && !(it as { waived?: boolean }).waived)
      .reduce((s, it) => s + (Number((it as { price?: number }).price) || 0) + ((it as { x?: boolean; xFee?: number }).x ? Number((it as { xFee?: number }).xFee) || 0 : 0), 0);
    addTo(String(o.cur), v, o.id);
  }
  let best = { amount: 0, cur: "eur", orderIds: [] as string[] };
  for (const [cur, x] of by) if (x.amount > best.amount) best = { amount: Math.round(x.amount * 100) / 100, cur, orderIds: [...x.ids] };
  return best;
}
export async function coverageCheck(email: string, k: { key: string; mode: Mode }, customer: string, pm: any): Promise<Coverage> {
  const { amount, cur } = await openOrderValue(email).catch(() => ({ amount: 0, cur: "eur", orderIds: [] as string[] }));
  if (String(process.env.AUTOPAY_COVERAGE || "").toLowerCase() === "off") return { result: "skipped", amount, cur, why: "abgeschaltet" };
  if (!(amount > 0)) return { result: "skipped", amount, cur, why: "kein offener Auftragswert" };
  const cents = Math.round(amount * 100);
  let pi: any = null;
  try {
    pi = await sx(k.key, "POST", "payment_intents", {
      amount: cents, currency: cur, customer, payment_method: pm.id, payment_method_types: [pm.type], capture_method: "manual",
      confirm: true, off_session: true, description: "Deckungsprüfung – wird sofort freigegeben, nichts abgebucht",
      metadata: { rr_check: "coverage", rr_email: email },
    }, `rr-cov-${pm.id}-${cents}`);
  } catch (e) {
    const err = e as StripeErr;
    const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 200);
    if (err.code === "authentication_required" || err.decline === "authentication_required") return { result: "skipped", amount, cur, why: "3-D-Secure nötig – nicht prüfbar" };
    if (err.code === "card_declined" || err.code === "payment_method_provider_decline" || err.code === "expired_card" || err.code === "insufficient_funds" || err.decline) return { result: "declined", amount, cur, why: msg };
    return { result: "skipped", amount, cur, why: `nicht prüfbar: ${msg}` };
  }
  if (pi?.id && pi.status !== "succeeded") await sx(k.key, "POST", `payment_intents/${pi.id}/cancel`, {}).catch(() => {}); // Reservierung sofort freigeben
  if (pi?.status === "requires_capture") return { result: "ok", amount, cur };
  if (pi?.status === "succeeded") { // darf bei manual capture nicht passieren – sicherheitshalber sofort erstatten
    await sx(k.key, "POST", "refunds", { payment_intent: pi.id }).catch(() => {});
    return { result: "ok", amount, cur, why: "sofort erstattet" };
  }
  return { result: "skipped", amount, cur, why: `Status ${pi?.status || "?"}` };
}

/** Hinweis auf der Stripe-Seite (über dem Bestätigen-Knopf): beim Hinterlegen wird nichts abgebucht. */
const NO_CHARGE: Record<string, string> = {
  de: "Jetzt: {z} – abgebucht wird erst bei Löschung. Sie hinterlegen nur Ihre Zahlungsart; bezahlt wird nur für Bewertungen, die tatsächlich gelöscht sind.",
  en: "Now: {z} – charged only on removal. You're only saving your payment method; you pay only for reviews that are actually removed.",
  es: "Ahora: {z} – solo se cobra al eliminar. Solo guardas tu método de pago; pagas únicamente por las reseñas que se eliminan de verdad.",
  fr: "Maintenant : {z} – débité seulement à la suppression. Tu enregistres seulement ton moyen de paiement ; tu ne paies que les avis réellement supprimés.",
  it: "Ora: {z} – addebito solo alla rimozione. Salvi solo il metodo di pagamento; paghi solo per le recensioni davvero rimosse.",
  nl: "Nu: {z} – pas afgeschreven bij verwijdering. U slaat alleen uw betaalmethode op; u betaalt alleen voor reviews die echt zijn verwijderd.",
  pt: "Agora: {z} – cobrado só na remoção. Só guardas o método de pagamento; pagas apenas pelas avaliações realmente removidas.",
  ja: "現在のお支払い：{z}（削除時のみ請求）。お支払い方法を登録するだけで、実際に削除された口コミの分だけお支払いいただきます。",
  sv: "Nu: {z} – dras först vid borttagning. Du sparar bara din betalningsmetod; du betalar bara för omdömen som faktiskt tas bort.",
  da: "Nu: {z} – trækkes først ved fjernelse. Du gemmer kun din betalingsmetode; du betaler kun for anmeldelser, der faktisk fjernes.",
  no: "Nå: {z} – belastes først ved fjerning. Du lagrer bare betalingsmetoden; du betaler bare for anmeldelser som faktisk fjernes.",
};

/* ---- Routen ---- */
let lastErr: { at: string; where: string; msg: string } | null = null; // letzte Stripe-Fehlermeldung (Diagnose, ohne Schlüssel)
export function registerAutopayRoutes(app: FastifyInstance): void {
  autopayHooks.charge = (email) => chargeDue(email).catch((e) => { app.log.error({ err: e }, "Automatisch bezahlen: Abbuchung fehlgeschlagen"); return null; });
  autopayHooks.openInvoice = (email, cur) => openFailedInvoice(email, cur).catch(() => null);
  // Stripe-Webhook invoice.paid (eigene Abbuchungs-Rechnung): offene Fehlschlag-Rechnung sofort verbuchen statt erst beim nächsten Tick.
  autopayHooks.settle = (email) => chargeDue(email, "Wiederholung (Plan)").then(() => undefined).catch((e) => { app.log.error({ err: e }, "Offene Rechnung verbuchen fehlgeschlagen"); });
  autopayHooks.info = info;
  autopayHooks.saved = (email) => hasSavedMethod(String(email || "").toLowerCase());
  void init().catch((e) => app.log.error({ err: e }, "cust_autopay anlegen fehlgeschlagen"));

  const auth = async (b: Record<string, unknown>) => {
    const si = await customerSessionInfo(b.token);
    return si ? si : null;
  };

  // Schritt 1: Stripe Checkout (mode=setup) öffnen.
  app.post("/cust/autopay/start", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const k = keyFor(si.email);
    if (!k) return reply.code(400).send({ ok: false, error: "unavailable" });
    const { orders, name, lang } = await loadCustomerOrders(si.email);
    const cur = (orders[0]?.cur as string) || "eur";
    let row = await rowOf(si.email);
    try {
      if (!row || row.mode !== k.mode) {
        const c = await sx(k.key, "POST", "customers", { email: si.email, name: name || undefined, preferred_locales: [stripeLocale(lang)], metadata: { rr_email: si.email } }, `rr-cus-${k.mode}-${si.email}`);
        await pool.query(`INSERT INTO cust_autopay (email, mode, customer) VALUES ($1,$2,$3)
          ON CONFLICT (email) DO UPDATE SET mode=EXCLUDED.mode, customer=EXCLUDED.customer, pm=NULL, label=NULL, pm_type=NULL, last_error=NULL, updated_at=now()`, [si.email, k.mode, c.id]);
        row = await rowOf(si.email);
      }
      const base = isDashReturnUrl(String(b.returnUrl || "")) ? String(b.returnUrl).split("?")[0] : DASH_URL;
      const params: Record<string, unknown> = {
        mode: "setup", customer: row!.customer, currency: cur, locale: "auto",
        billing_address_collection: "required", // vollständige Rechnungsadresse → landet auf jeder Abbuchungs-Rechnung
        success_url: `${base}?autopay=done&cs={CHECKOUT_SESSION_ID}`, cancel_url: `${base}?autopay=cancel`,
        setup_intent_data: { metadata: { rr_email: si.email } }, metadata: { rr_email: si.email },
        custom_text: { submit: { message: (NO_CHARGE[String(lang || "en").slice(0, 2)] || NO_CHARGE.en).replace("{z}", cur === "usd" ? "$0" : "0 €") } },
      };
      let ses: any;
      // Sicherheitsnetz: lehnt Stripe die Adressabfrage im Setup-Modus je ab, ohne sie weiter (ensureBilling holt dann, was da ist).
      const mk = async (p: Record<string, unknown>) => {
        try { return await sx(k.key, "POST", "checkout/sessions", p); }
        catch (e) { if (!/billing_address_collection/i.test(String((e as Error)?.message))) throw e; app.log.warn({ err: e }, "Setup-Checkout: Adressabfrage nicht erlaubt – ohne"); const { billing_address_collection: _b, ...p2 } = p; return sx(k.key, "POST", "checkout/sessions", p2); }
      };
      // Nur Zahlungsarten, die sofort und sicher abbuchen: Karte (inkl. Apple/Google Pay), PayPal.
      // KEINE Lastschrift/Bankkonto (US-Bankkonto, SEPA) und seit 06.11.2026 KEIN Link: Link hängt oft an einem Bankkonto,
      // 14 von 36 Link-Abbuchungen sind fehlgeschlagen (Karten 3 von 34). Bestehende Link-Kunden bleiben, bis sie wechseln.
      for (const types of [["card", "paypal"], ["card"]]) {
        try { ses = await mk({ ...params, payment_method_types: types }); break; }
        catch (e) { if (!/custom_text/i.test(String((e as Error)?.message))) { if (types.length === 1) throw e; continue; } app.log.warn({ err: e }, "Setup-Checkout: Hinweistext nicht erlaubt – ohne"); }
        try { const { custom_text: _ct, ...p2 } = params; ses = await mk({ ...p2, payment_method_types: types }); break; }
        catch (e) { app.log.warn({ err: e, types }, "Setup-Checkout: Zahlungsarten nicht verfügbar – nächster Versuch"); if (types.length === 1) throw e; }
      }
      void logCustEvent(si.email, "autopay_open", "Zahlungsart hinterlegen geöffnet", { mode: k.mode });
      return { ok: true, url: ses.url, mode: k.mode };
    } catch (e) {
      app.log.error({ err: e }, "Automatisch bezahlen: Start fehlgeschlagen");
      lastErr = { at: new Date().toISOString(), where: "start", msg: String((e as Error)?.message || e).slice(0, 300) };
      return reply.code(503).send({ ok: false, error: "payment_unavailable", ...(k.mode === "test" ? { detail: lastErr.msg } : {}) });
    }
  });

  // Schritt 2: Rückkehr aus Stripe → Zahlungsart speichern + offene Beträge gleich abbuchen.
  app.post("/cust/autopay/confirm", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const k = keyFor(si.email);
    const row = await rowOf(si.email);
    const cs = String(b.cs || "");
    if (!k || !row || row.mode !== k.mode || !/^cs_[A-Za-z0-9_]+$/.test(cs)) return reply.code(400).send({ ok: false, error: "invalid" });
    try {
      const ses = await sx(k.key, "GET", `checkout/sessions/${cs}`, { expand: ["setup_intent.payment_method"] });
      if (ses.customer !== row.customer || ses.mode !== "setup") return reply.code(400).send({ ok: false, error: "invalid" });
      const si2 = ses.setup_intent;
      if (!si2 || si2.status !== "succeeded" || !si2.payment_method) return reply.code(400).send({ ok: false, error: "not_completed" });
      const pm = si2.payment_method;
      // Prepaid-Karten: oft leer bis zur nächsten Aufladung → nicht annehmen (06.11.2026).
      if (pm.type === "card" && pm.card?.funding === "prepaid") {
        void sx(k.key, "POST", `payment_methods/${pm.id}/detach`, {}).catch(() => {});
        void logCustEvent(si.email, "autopay_rejected", "Prepaid-Karte abgelehnt", { mode: k.mode });
        return reply.code(400).send({ ok: false, error: "prepaid" });
      }
      // Deckungsprüfung über den offenen Auftragswert (nur bei neuer Zahlungsart).
      if (row.pm !== pm.id) {
        const cov = await coverageCheck(si.email, k, row.customer, pm).catch((e) => ({ result: "skipped", amount: 0, cur: "eur", why: String((e as Error)?.message || e).slice(0, 120) }) as Coverage);
        const covMoney = fmtReviewMoney(cov.amount, cov.cur);
        const firstOrder = (await loadCustomerOrders(si.email)).orders.find((x) => !x.cancelled);
        if (cov.result === "declined") {
          void sx(k.key, "POST", `payment_methods/${pm.id}/detach`, {}).catch(() => {});
          void logCustEvent(si.email, "autopay_rejected", `Deckungsprüfung abgelehnt · ${covMoney}`, { mode: k.mode, amount: cov.amount, cur: cov.cur });
          if (firstOrder) await insertEvent({ orderId: firstOrder.id, email: si.email, type: "note", title: `Deckungsprüfung abgelehnt (${covMoney}) – Zahlungsart nicht gespeichert`, detail: `${pmLabel(pm)} · ${cov.why || ""}`, auto: true }).catch(() => {});
          void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Deckungsprüfung abgelehnt`, `${si.email} · ${pmLabel(pm)} · ${covMoney} · Kunde muss andere Zahlungsart nehmen`, `${SITE_URL}/admin`, { kind: "customer" });
          return reply.code(400).send({ ok: false, error: "coverage", amount: cov.amount, cur: cov.cur });
        }
        if (firstOrder) await insertEvent({ orderId: firstOrder.id, email: si.email, type: "note", title: cov.result === "ok" ? `Deckungsprüfung bestanden (${covMoney} reserviert und sofort freigegeben)` : `Deckungsprüfung übersprungen${cov.amount > 0 ? ` (${covMoney})` : ""}`, detail: `${pmLabel(pm)}${cov.why ? " · " + cov.why : ""}`, auto: true }).catch(() => {});
      }
      const label = pmLabel(pm);
      if (row.pm === pm.id) { await releasePayGates(si.email, label).catch(() => 0); return { ok: true, label, charged: null }; } // schon gespeichert (Neuladen)
      if (row.pm && row.pm !== pm.id) void sx(k.key, "POST", `payment_methods/${row.pm}/detach`, {}).catch(() => {});
      await sx(k.key, "POST", `customers/${row.customer}`, { invoice_settings: { default_payment_method: pm.id } }).catch(() => {});
      await pushBillingToStripe(si.email, k.key, row.customer, pm).catch(() => {});
      await pool.query(`UPDATE cust_autopay SET pm=$2, label=$3, pm_type=$4, last_error=NULL, updated_at=now() WHERE email=$1`, [si.email, pm.id, label, pm.type || null]);
      const { orders } = await loadCustomerOrders(si.email);
      for (const o of orders.filter((x) => !x.cancelled).slice(0, 5)) {
        await insertEvent({ orderId: o.id, email: si.email, type: "note", title: `Kunde: Zahlungsart hinterlegt – zahlt automatisch${k.mode === "test" ? " (TEST)" : ""}`, detail: `${label} · wird nach jeder Löschung abgebucht`, auto: true }).catch(() => {});
      }
      void logCustEvent(si.email, "autopay_on", `Automatisch bezahlen aktiviert · ${label}`, { mode: k.mode });
      void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Zahlungsart hinterlegt`, `${si.email} · ${label} · zahlt ab jetzt automatisch`, `${SITE_URL}/admin`, { kind: "customer" });
      await approvePendingPre(si.email).catch((e) => app.log.error({ err: e }, "Software-Fälle freigeben fehlgeschlagen"));
      const started = await releasePayGates(si.email, label).catch((e) => { app.log.error({ err: e }, "Aufträge freigeben fehlgeschlagen"); return 0; });
      const charged = await chargeDue(si.email, "Zahlungsart hinterlegt").catch(() => null);
      return { ok: true, label, charged, started };
    } catch (e) {
      app.log.error({ err: e }, "Automatisch bezahlen: Bestätigung fehlgeschlagen");
      return reply.code(503).send({ ok: false, error: "payment_unavailable" });
    }
  });

  // Rechnungsdetails speichern (Dashboard → Konto → Zahlung & Abrechnung).
  app.post("/cust/billing", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    await init();
    const c = (v: unknown, n: number) => String(v ?? "").replace(/[\r\n<>]/g, " ").trim().slice(0, n);
    const country = c(b.country, 2).toUpperCase();
    const v = { company: c(b.company, 120), name: c(b.name, 120), line1: c(b.line1, 160), postal: c(b.postal, 20), city: c(b.city, 80), country: /^[A-Z]{2}$/.test(country) ? country : "", vat: c(b.vat, 30).replace(/\s+/g, "") };
    if (!v.company && !v.name) return reply.code(400).send({ ok: false, error: "name" });
    // Adresse muss existieren und zum Land passen; UID wird beim Register geprüft (EU: VIES, GB: HMRC).
    const ad = await checkAddress(v);
    if (!ad.ok) return reply.code(400).send({ ok: false, error: "addr_" + (ad.reason || "invalid") });
    const vt = await checkVat(v.vat, v.country);
    if (!vt.ok) return reply.code(400).send({ ok: false, error: vt.reason || "vat_invalid" });
    v.vat = vt.vat;
    await pool.query(`INSERT INTO cust_billing (email, company, name, line1, postal, city, country, vat, vat_status, vat_name, addr_checked) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (email) DO UPDATE SET company=$2, name=$3, line1=$4, postal=$5, city=$6, country=$7, vat=$8, vat_status=$9, vat_name=$10, addr_checked=$11, updated_at=now()`,
      [si.email, v.company, v.name, v.line1, v.postal, v.city, v.country, v.vat, v.vat ? vt.status : null, vt.name || null, ad.checked]);
    const k = keyFor(si.email); const row = await rowOf(si.email);
    if (k && row && row.mode === k.mode) await pushBillingToStripe(si.email, k.key, row.customer).catch((e) => app.log.warn({ err: e }, "Rechnungsdetails an Stripe fehlgeschlagen"));
    void logCustEvent(si.email, "billing_saved", `Rechnungsdetails gespeichert · ${v.company || v.name}`);
    return { ok: true, billing: { ...v, saved: true, vatStatus: v.vat ? vt.status : "", vatName: vt.name || "", addrChecked: ad.checked } };
  });

  app.post("/cust/autopay/remove", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    // Laufende Aufträge → nur „Ändern" erlaubt (sonst könnte man nach den ersten Löschungen die Abbuchung abdrehen).
    if (ordersRunning((await loadCustomerOrders(si.email)).orders)) return reply.code(409).send({ ok: false, error: "orders_running" });
    const row = await rowOf(si.email);
    const k = keyFor(si.email);
    if (row?.pm && k && row.mode === k.mode) await sx(k.key, "POST", `payment_methods/${row.pm}/detach`, {}).catch((e) => app.log.warn({ err: e }, "PM lösen fehlgeschlagen"));
    await pool.query(`UPDATE cust_autopay SET pm=NULL, label=NULL, pm_type=NULL, updated_at=now() WHERE email=$1`, [si.email]);
    void logCustEvent(si.email, "autopay_off", `Automatisch bezahlen entfernt${row?.label ? " · " + row.label : ""}`);
    const { orders } = await loadCustomerOrders(si.email);
    if (orders[0]) await insertEvent({ orderId: orders[0].id, email: si.email, type: "note", title: "Kunde: hinterlegte Zahlungsart entfernt", detail: row?.label || "", auto: true }).catch(() => {});
    return { ok: true };
  });

  // Admin: Status je Kunde (für Tests/Support).
  app.get("/health/autopay", async () => ({ ok: true, testKey: /^(sk|rk)_test_/.test(process.env.STRIPE_TEST_SECRET_KEY || ""), live: String(process.env.AUTOPAY_LIVE || "").toLowerCase() === "on", liveTesters: liveTesters().length, lastError: lastErr }));
}
