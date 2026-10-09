/* Partner-Auszahlungen: gelöscht → geprüft → automatisch bezahlt (+ Gutschrift).
 *
 * Ablauf
 *  1. Partner markiert „Removed" → Lena prüft (partner.ts /partner/verify-removed) → Aufgabe steht auf „removed".
 *  2. Täglicher Lauf (Standard 10:00 Wien): alle geprüften, noch nicht ausgezahlten Löschungen, die mindestens
 *     `hold` Tage alt sind, werden von Lena NOCHMAL geprüft (wieder sichtbar → nicht auszahlen, Team-Push).
 *  3. Summe ≥ Mindestbetrag → Payoneer Mass Payout (API) an das Payoneer-Konto des Partners.
 *  4. Angenommen → Aufgaben „paid", Gutschrift (Self-billing invoice, GS-JJJJ-NNNN) als PDF per Mail an den Partner.
 *
 * Gutschriftverfahren (§ 11 Abs. 7 UStG): der Partner stimmt im Partner-Portal einmal zu (Zeit, IP, Browser, Version
 * werden gespeichert). Erst danach werden Gutschriften ausgestellt – auch bei manuellen Auszahlungen.
 * Leistender sitzt im Drittland (PK/IN) → Reverse Charge (§ 19 Abs. 1 UStG), Gutschrift netto ohne USt.
 *
 * Auszahlungswege (nur vollautomatische, ohne Fixkosten), der Partner wählt beim ersten Login:
 *  - Payoneer (alle Länder)
 *  - Bankkonto über Stripe Connect (EWR, UK, CH, USA, Kanada) – bezahlt aus dem Stripe-Guthaben, in EUR (Kurs EZB);
 *    Stripe sammelt Identität + Bankdaten (Express-Konto), braucht nur „Connect" im Stripe-Dashboard.
 *  - Bankkonto über Airwallex (Indien INR, Pakistan PKR) – nur angeboten, wenn AIRWALLEX_* gesetzt ist (19 €/Monat Fixkosten).
 *
 * Airwallex: AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY, optional AIRWALLEX_ENV=sandbox, AIRWALLEX_SOURCE_CURRENCY (Standard USD),
 *   AIRWALLEX_REASON (Standard professional_business_services).
 * Payoneer: Zugangsdaten nur als Railway-Variablen (nie im Repo):
 *   PAYONEER_CLIENT_ID, PAYONEER_CLIENT_SECRET, PAYONEER_PROGRAM_ID, optional PAYONEER_ENV=sandbox
 *   (bzw. PAYONEER_API_BASE / PAYONEER_TOKEN_URL, falls Payoneer andere Adressen nennt).
 * Ohne Zugangsdaten läuft alles außer der Überweisung selbst (Profil, Zustimmung, Guthaben, manuelle Auszahlung + Gutschrift).
 *
 * Derzeit gibt es nur EINEN Lösch-Partner (partner_tasks haben keine partner_id) → alle Aufgaben gehören dem
 * ersten aktiven Partner. Kommt ein zweiter dazu, braucht partner_tasks eine partner_id.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { pool, insertEvent, bumpChange } from "./db";
import { checkRemoval } from "./removalCheck";
import { notifyTeam } from "./notify";
import { sendMail } from "./mailer";
import { checkVat } from "./billingCheck";
import { partnerIdOf, firstPartnerId } from "./partnerRegistry";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
export const SB_VERSION = "2026-10-09";
const US = {
  name: "Simple Solution. OG (RapidRemove)",
  lines: ["Salzgasse 2", "5400 Hallein", "Austria / Österreich"],
  uid: (process.env.COMPANY_UID || "ATU72401536").trim(),
  fn: "FN 470700g, Landesgericht Salzburg",
  mail: "office@simplesolution.at",
};

/** Text der Gutschrift-Vereinbarung (Partner-Portal, englisch). Bei Änderungen SB_VERSION erhöhen. */
export const SB_TEXT =
  "Self-billing agreement: I agree that RapidRemove (Simple Solution. OG, Austria) issues self-billing invoices (“Gutschrift”) " +
  "in my name for every payout of verified removals. I will not send separate invoices for these. I confirm that the details above " +
  "are correct, that I work as an independent contractor and that I am responsible for my own taxes in my country. " +
  "I can object to a single self-billing invoice within 30 days, or end this agreement at any time by email.";

const num = (v: unknown) => Math.round(Number(v || 0) * 100) / 100;
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

/* ---------------- Tabellen / Einstellungen ---------------- */
export async function initPayoutTables(): Promise<void> {
  if (!pool) return;
  for (const c of [
    "legal_name text", "addr1 text", "addr2 text", "city text", "zip text", "country text", "tax_id text",
    "payout_email text", "payee_id text", "payee_status text", "payee_checked_at timestamptz",
    "sb_at timestamptz", "sb_ip text", "sb_ua text", "sb_v text",
    "payout_method text", "bank jsonb", "vat_id text", "vat_status text", "small_biz boolean NOT NULL DEFAULT false",
    "aw_beneficiary_id text", "aw_error text", "stripe_acct text", "stripe_status text", "stripe_checked_at timestamptz",
  ]) await pool.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS ${c}`);
  for (const c of [
    "partner_id bigint", "status text NOT NULL DEFAULT 'manual'", "method text", "provider_ref text", "provider_status text", "error text",
    "gs_no text", "currency text NOT NULL DEFAULT 'USD'", "sent_at timestamptz", "period_from timestamptz", "period_to timestamptz",
    "party jsonb", "items jsonb", "gs_mailed_at timestamptz", "net_usd numeric", "vat_usd numeric NOT NULL DEFAULT 0",
    "paid_amount numeric", "paid_currency text", "fx_rate numeric", "fx_date text",
  ]) await pool.query(`ALTER TABLE partner_payouts ADD COLUMN IF NOT EXISTS ${c}`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS partner_payouts_gs ON partner_payouts (gs_no) WHERE gs_no IS NOT NULL`);
}

async function getSetting(key: string): Promise<string | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]).catch(() => ({ rows: [] as { value: string }[] }));
  return r.rows[0]?.value ?? null;
}
async function setSetting(key: string, value: string): Promise<void> {
  if (!pool) return;
  await pool.query(`INSERT INTO partner_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2`, [key, value]);
}
export type PayoutSettings = { auto: boolean; holdDays: number; minUsd: number; hour: number; recheck: boolean };
export async function payoutSettings(): Promise<PayoutSettings> {
  const n = async (k: string, d: number) => { const v = Number(await getSetting(k)); return Number.isFinite(v) && (await getSetting(k)) !== null ? v : d; };
  return {
    auto: (await getSetting("payout_auto")) !== "0", // Standard: an (läuft aber erst mit Payoneer-Zugang)
    holdDays: Math.max(0, Math.min(30, await n("payout_hold_days", 2))),
    minUsd: Math.max(0, Math.min(5000, await n("payout_min_usd", 10))),
    hour: Math.max(0, Math.min(23, await n("payout_hour", 10))),
    recheck: (await getSetting("payout_recheck")) !== "0",
  };
}

/* ---------------- Partner ---------------- */
export type PartnerRow = {
  id: string; name: string; email: string | null; active: boolean;
  legal_name: string | null; addr1: string | null; addr2: string | null; city: string | null; zip: string | null; country: string | null; tax_id: string | null;
  payout_email: string | null; payee_id: string | null; payee_status: string | null; payee_checked_at: string | null;
  sb_at: string | null; sb_ip: string | null; sb_ua: string | null; sb_v: string | null;
  payout_method: "payoneer" | "bank" | "stripe" | null; stripe_acct: string | null; stripe_status: string | null; stripe_checked_at: string | null; bank: Bank | null; vat_id: string | null; vat_status: string | null; small_biz: boolean;
  aw_beneficiary_id: string | null; aw_error: string | null;
};
export type Bank = { holder: string; iban?: string; bic?: string; account?: string; ifsc?: string; bankName?: string; currency: string };

/* ---------------- Länder ---------------- */
const EU = new Set(["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "GR", "ES", "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"]);
/** Stripe Connect (grenzüberschreitend ab Österreich): EWR, UK, Schweiz, USA, Kanada. */
export const STRIPE_CC = new Set([...EU, "IS", "LI", "NO", "GB", "CH", "US", "CA"]);
const EEA = new Set([...EU, "IS", "LI", "NO"]);
/** Bankkonto über Airwallex (nur Länder ohne Stripe): Währung; sonst null. */
export function bankCurrency(cc: string): string | null { return cc === "IN" ? "INR" : cc === "PK" ? "PKR" : null; }
const ibanOk = (v: string) => {
  const s = v.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let m = 0; for (const d of r) m = (m * 10 + Number(d)) % 97;
  return m === 1;
};
const mask = (v?: string) => (v ? v.replace(/\s+/g, "").replace(/^(.{4}).*(.{4})$/, "$1 •••• $2") : "");
/** Bankdaten prüfen + normalisieren (Fehlertext englisch für den Partner). */
function bankFrom(cc: string, b: Record<string, unknown>, fallbackHolder: string): { bank?: Bank; error?: string } {
  const cur = bankCurrency(cc);
  if (!cur) return { error: "Bank payouts are not available in your country – please choose Payoneer." };
  const holder = clip(b.holder, 120) || fallbackHolder;
  if (!holder) return { error: "Please enter the account holder name." };
  if (cur === "INR") {
    const account = clip(b.account, 34).replace(/\s+/g, ""), ifsc = clip(b.ifsc, 11).toUpperCase().replace(/\s+/g, "");
    if (!/^\d{6,18}$/.test(account)) return { error: "Please check the account number (6–18 digits)." };
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return { error: "Please check the IFSC code (e.g. HDFC0001234)." };
    return { bank: { holder, account, ifsc, bankName: clip(b.bankName, 80) || undefined, currency: cur } };
  }
  const iban = clip(b.iban, 42).replace(/\s+/g, "").toUpperCase(), bic = clip(b.bic, 11).replace(/\s+/g, "").toUpperCase();
  if (!ibanOk(iban)) return { error: "Please check the IBAN." };
  if (cur === "PKR" && !iban.startsWith("PK")) return { error: "Please enter a Pakistani IBAN (starts with PK)." };
  if (bic && !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) return { error: "Please check the BIC / SWIFT code." };
  return { bank: { holder, iban, bic: bic || undefined, bankName: clip(b.bankName, 80) || undefined, currency: cur } };
}
/** USt-Behandlung der Gutschrift: AT ohne Kleinunternehmer → 20 % USt; EU/Drittland → Reverse Charge. */
function vatRule(p: { country: string | null; small_biz: boolean }): "at20" | "atklein" | "rc" {
  if (String(p.country || "").toUpperCase() !== "AT") return "rc";
  return p.small_biz ? "atklein" : "at20";
}
/** Partner nach ID (null → bisheriger, erster aktiver Partner). */
export async function partnerById(id: number | null): Promise<PartnerRow | null> {
  if (!pool) return null;
  const pid = id ?? (await firstPartnerId());
  if (!pid) return null;
  const r = await pool.query(`SELECT * FROM partners WHERE id=$1`, [pid]);
  return (r.rows[0] as PartnerRow) || null;
}
const profileDone = (p: PartnerRow | null) => !!p && !!p.legal_name && !!p.addr1 && !!p.city && !!p.country;
const sbOk = (p: PartnerRow | null) => !!p && !!p.sb_at;
const payeeActive = (p: PartnerRow | null) => !!p && !!p.payee_id && /^(active|approved)$/i.test(String(p.payee_status || ""));
const bankDone = (p: PartnerRow | null) => !!p && p.payout_method === "bank" && !!p.bank && bankCurrency(String(p.country || "")) === p.bank.currency && !p.aw_error; // von der Bank abgelehnt → nochmal eingeben
const vatDone = (p: PartnerRow | null) => !!p && (vatRule(p) !== "at20" || !!p.vat_id);
/** Pflicht-Einrichtung beim ersten Login erledigt? (Payoneer: Verknüpfung gestartet, sobald Payoneer freigeschaltet ist.) */
const setupDone = (p: PartnerRow | null) => profileDone(p) && sbOk(p) && vatDone(p) && (
  p!.payout_method === "bank" ? bankDone(p)
    : p!.payout_method === "stripe" ? STRIPE_CC.has(String(p!.country || "")) && !!p!.stripe_acct && p!.stripe_status !== "pending" // Stripe-Formular abgeschickt
    : p!.payout_method === "payoneer" ? (!payoneerConfigured() || !!p!.payee_id) : false);
/** Automatische Auszahlung möglich? */
const payReady = (p: PartnerRow | null) => setupDone(p) && (
  p!.payout_method === "bank" ? airwallexConfigured() && !!p!.aw_beneficiary_id
    : p!.payout_method === "stripe" ? p!.stripe_status === "active"
    : payoneerConfigured() && payeeActive(p));

export function profileView(p: PartnerRow | null) {
  if (!p) return null;
  return {
    id: Number(p.id), name: p.name, legalName: p.legal_name || "", addr1: p.addr1 || "", addr2: p.addr2 || "", city: p.city || "", zip: p.zip || "",
    country: p.country || "", taxId: p.tax_id || "", payoutEmail: p.payout_email || p.email || "",
    payee: p.payee_id ? { id: p.payee_id, status: p.payee_status || "pending", checked: p.payee_checked_at } : null,
    sb: p.sb_at ? { at: p.sb_at, v: p.sb_v } : null,
    method: p.payout_method || null, vatId: p.vat_id || "", vatStatus: p.vat_status || null, smallBiz: !!p.small_biz,
    bank: p.bank ? { holder: p.bank.holder, currency: p.bank.currency, bankName: p.bank.bankName || "", ibanMasked: mask(p.bank.iban), accountMasked: mask(p.bank.account), ifsc: p.bank.ifsc || "", bic: p.bank.bic || "" } : null,
    bankError: p.payout_method === "bank" ? p.aw_error || null : null,
    stripe: p.stripe_acct ? { status: p.stripe_status || "pending" } : null,
    complete: profileDone(p), setupDone: setupDone(p), ready: payReady(p),
  };
}

/* ---------------- Payoneer (Mass Payouts API v4) ---------------- */
const PY = () => {
  const sandbox = String(process.env.PAYONEER_ENV || "").toLowerCase() === "sandbox";
  return {
    id: process.env.PAYONEER_CLIENT_ID || "", secret: process.env.PAYONEER_CLIENT_SECRET || "", program: process.env.PAYONEER_PROGRAM_ID || "",
    api: (process.env.PAYONEER_API_BASE || (sandbox ? "https://api.sandbox.payoneer.com" : "https://api.payoneer.com")).replace(/\/+$/, ""),
    tokenUrl: process.env.PAYONEER_TOKEN_URL || (sandbox ? "https://login.sandbox.payoneer.com/api/v2/oauth2/token" : "https://login.payoneer.com/api/v2/oauth2/token"),
    sandbox,
  };
};
export const payoneerConfigured = () => { const c = PY(); return !!(c.id && c.secret && c.program); };
let tok: { v: string; exp: number } | null = null;
async function pyToken(): Promise<string> {
  if (tok && tok.exp > Date.now() + 60_000) return tok.v;
  const c = PY();
  const res = await fetch(c.tokenUrl, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${c.id}:${c.secret}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: "grant_type=client_credentials&scope=read%20write",
  });
  const j = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!res.ok || !j.access_token) throw new Error(`Payoneer-Login fehlgeschlagen (${res.status}${j.error_description || j.error ? ": " + (j.error_description || j.error) : ""})`);
  tok = { v: j.access_token, exp: Date.now() + Math.max(300, Number(j.expires_in) || 3600) * 1000 };
  return tok.v;
}
async function py(method: "GET" | "POST", path: string, body?: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  const c = PY();
  const res = await fetch(`${c.api}/v4/programs/${encodeURIComponent(c.program)}${path}`, {
    method, headers: { Authorization: `Bearer ${await pyToken()}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, json };
}
/** Fehlertext aus einer Payoneer-Antwort (Felder sind je Endpunkt verschieden). */
function pyErr(j: Record<string, unknown>): string {
  const pick = (o: unknown): string => {
    if (!o || typeof o !== "object") return typeof o === "string" ? o : "";
    const x = o as Record<string, unknown>;
    return String(x.error_description || x.description || x.error_details && pick(x.error_details) || x.error || x.message || x.audit_id && `audit ${x.audit_id}` || "");
  };
  return pick(j).slice(0, 300) || JSON.stringify(j).slice(0, 300);
}
/** Status-Text irgendwo in der Antwort finden ({status:"Active"} | {result:{status:{description:"ACTIVE"}}} …). */
function findStatus(j: unknown, depth = 0): string {
  if (!j || typeof j !== "object" || depth > 4) return "";
  const o = j as Record<string, unknown>;
  for (const k of ["status", "payee_status", "status_description", "description"]) {
    const v = o[k];
    if (typeof v === "string" && v) return v;
    if (v && typeof v === "object") { const s = findStatus(v, depth + 1); if (s) return s; }
  }
  for (const v of Object.values(o)) if (v && typeof v === "object") { const s = findStatus(v, depth + 1); if (s) return s; }
  return "";
}
const payeeIdOf = (p: PartnerRow) => `rr-partner-${p.id}`;

/** Registrierungs-/Verknüpfungslink: Partner meldet sich bei Payoneer an (bestehendes Konto) und verbindet es mit uns. */
async function payoneerConnectLink(p: PartnerRow, hasAccount = true): Promise<string> {
  const payee_id = p.payee_id || payeeIdOf(p);
  const [first, ...rest] = String(p.legal_name || p.name || "").split(/\s+/);
  const r = await py("POST", "/payees/registration-link", {
    payee_id, already_have_an_account: hasAccount, redirect_url: `${SITE_URL}/partner?payoneer=done`,
    payee: {
      contact: { first_name: first || p.name, last_name: rest.join(" ") || first || p.name, email: p.payout_email || p.email || undefined },
      address: { address_line_1: p.addr1 || undefined, address_line_2: p.addr2 || undefined, city: p.city || undefined, zip_code: p.zip || undefined, country: p.country || undefined },
    },
  });
  const link = String((r.json.result as Record<string, unknown> | undefined)?.registration_link || r.json.registration_link || (r.json.result as string) || r.json.link || "");
  if (r.status >= 300 || !/^https:\/\//.test(link)) throw new Error(`Payoneer: ${pyErr(r.json)}`);
  await pool!.query(`UPDATE partners SET payee_id=$1, payee_status=COALESCE(payee_status,'pending') WHERE id=$2`, [payee_id, p.id]);
  return link;
}
/** Payee-Status bei Payoneer abfragen (höchstens 1× pro Minute je Partner). */
async function refreshPayee(p: PartnerRow, force = false): Promise<PartnerRow> {
  if (!pool || !p.payee_id || !payoneerConfigured()) return p;
  if (!force && p.payee_checked_at && Date.now() - new Date(p.payee_checked_at).getTime() < 60_000) return p;
  try {
    const r = await py("GET", `/payees/${encodeURIComponent(p.payee_id)}/status`);
    const st = r.status === 404 ? "pending" : r.status < 300 ? findStatus(r.json) || "pending" : p.payee_status || "pending";
    const u = await pool.query(`UPDATE partners SET payee_status=$1, payee_checked_at=now() WHERE id=$2 RETURNING *`, [st, p.id]);
    return u.rows[0] as PartnerRow;
  } catch { return p; }
}

/* ---------------- Airwallex (Bankkonto: SEPA / INR / PKR) ---------------- */
const AW = () => {
  const sandbox = String(process.env.AIRWALLEX_ENV || "").toLowerCase() === "sandbox";
  return {
    id: process.env.AIRWALLEX_CLIENT_ID || "", key: process.env.AIRWALLEX_API_KEY || "",
    api: (process.env.AIRWALLEX_API_BASE || (sandbox ? "https://api-demo.airwallex.com" : "https://api.airwallex.com")).replace(/\/+$/, ""),
    source: (process.env.AIRWALLEX_SOURCE_CURRENCY || "USD").toUpperCase(), reason: process.env.AIRWALLEX_REASON || "professional_business_services", sandbox,
  };
};
export const airwallexConfigured = () => { const c = AW(); return !!(c.id && c.key); };
let awTok: { v: string; exp: number } | null = null;
async function awToken(): Promise<string> {
  if (awTok && awTok.exp > Date.now() + 60_000) return awTok.v;
  const c = AW();
  const res = await fetch(`${c.api}/api/v1/authentication/login`, { method: "POST", headers: { "x-client-id": c.id, "x-api-key": c.key, "Content-Type": "application/json" }, body: "{}" });
  const j = (await res.json().catch(() => ({}))) as { token?: string; expires_at?: string; message?: string };
  if (!res.ok || !j.token) throw new Error(`Airwallex-Login fehlgeschlagen (${res.status}${j.message ? ": " + j.message : ""})`);
  awTok = { v: j.token, exp: j.expires_at ? new Date(j.expires_at).getTime() : Date.now() + 25 * 60_000 };
  return awTok.v;
}
async function aw(method: "GET" | "POST", path: string, body?: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${AW().api}${path}`, {
    method, headers: { Authorization: `Bearer ${await awToken()}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}
/** Airwallex-Fehler lesbar machen ({message, details:[{field, message}]} …). */
function awErr(j: Record<string, unknown>): string {
  const fld = (v: unknown) => String(v || "").replace(/^beneficiary\.(bank_details\.)?/, "").replace(/_/g, " ");
  const det = Array.isArray(j.details) ? (j.details as Record<string, unknown>[]).map((d) => [fld(d.field || d.source), d.message].filter(Boolean).join(": ")).filter(Boolean) : [];
  const errs = Array.isArray(j.errors) ? (j.errors as Record<string, unknown>[]).map((d) => [d.source || d.field, d.message || d.code].filter(Boolean).join(": ")) : [];
  return [j.message, ...det, ...errs].filter(Boolean).join(" · ").slice(0, 300) || JSON.stringify(j).slice(0, 300);
}
function awBeneficiary(p: PartnerRow) {
  const b = p.bank!;
  const cc = String(p.country || "").toUpperCase();
  const [first, ...rest] = String(b.holder).trim().split(/\s+/);
  const bank_details: Record<string, unknown> = { account_currency: b.currency, account_name: b.holder, bank_country_code: b.currency === "EUR" ? (b.iban || "").slice(0, 2) || cc : cc, ...(b.bankName ? { bank_name: b.bankName } : {}) };
  if (b.currency === "INR") Object.assign(bank_details, { account_number: b.account, account_routing_type1: "ifsc", account_routing_value1: b.ifsc });
  else Object.assign(bank_details, { iban: b.iban, ...(b.bic ? { swift_code: b.bic } : {}) });
  return {
    nickname: `RapidRemove partner ${p.id}`, payer_entity_type: "COMPANY", payment_methods: ["LOCAL"],
    beneficiary: {
      entity_type: "PERSONAL", first_name: first, last_name: rest.join(" ") || first, bank_details,
      address: { street_address: [p.addr1, p.addr2].filter(Boolean).join(", "), city: p.city, postcode: p.zip || undefined, country_code: cc },
      additional_info: p.payout_email || p.email ? { personal_email: p.payout_email || p.email } : undefined,
    },
  };
}
/** Empfänger bei Airwallex anlegen (bei geänderten Bankdaten neu). Fehler → aw_error (Partner sieht ihn in der App). */
async function ensureBeneficiary(p: PartnerRow, force = false): Promise<PartnerRow> {
  if (!pool || !airwallexConfigured() || p.payout_method !== "bank" || !p.bank) return p;
  if (p.aw_beneficiary_id && !force) return p;
  const r = await aw("POST", "/api/v1/beneficiaries/create", awBeneficiary(p)).catch((e) => ({ status: 0, json: { message: (e as Error).message } as Record<string, unknown> }));
  const id = String(r.json.beneficiary_id || r.json.id || "");
  if (r.status === 0 || r.status >= 500 || r.status === 401) return p; // Airwallex nicht erreichbar / Zugang falsch → später nochmal, keine Ablehnung
  const u = r.status >= 200 && r.status < 300 && id
    ? await pool.query(`UPDATE partners SET aw_beneficiary_id=$2, aw_error=NULL WHERE id=$1 RETURNING *`, [p.id, id])
    : await pool.query(`UPDATE partners SET aw_beneficiary_id=NULL, aw_error=$2 WHERE id=$1 RETURNING *`, [p.id, awErr(r.json) || `HTTP ${r.status}`]);
  return u.rows[0] as PartnerRow;
}

/* ---------------- Stripe Connect (Bankkonto: EWR, UK, CH, USA, Kanada) ---------------- */
export const stripeConfigured = () => !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_CONNECT_PAYOUTS !== "0";
const STRIPE_API = () => (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
const PAY_CUR = () => (process.env.STRIPE_PAYOUT_CURRENCY || "eur").toLowerCase();
function sform(o: Record<string, unknown>, prefix = "", out: string[] = []): string[] {
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(x))}`));
    else if (typeof v === "object") sform(v as Record<string, unknown>, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}
async function st(method: "GET" | "POST", path: string, params: Record<string, unknown> = {}, idem?: string): Promise<{ status: number; json: Record<string, any> }> {
  const body = sform(params).join("&");
  const headers: Record<string, string> = { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Stripe-Version": "2024-06-20" };
  if (method === "POST") headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idem) headers["Idempotency-Key"] = idem;
  const res = await fetch(`${STRIPE_API()}/v1/${path}${method === "GET" && body ? "?" + body : ""}`, { method, headers, body: method === "POST" ? body : undefined });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as Record<string, any> };
}
const stErr = (j: Record<string, any>) => String(j?.error?.message || j?.error?.code || JSON.stringify(j).slice(0, 200));

/** Express-Konto für den Partner anlegen (einmal) – Stripe fragt Identität + Bankkonto selbst ab. */
async function ensureStripeAccount(p: PartnerRow): Promise<PartnerRow> {
  if (!pool || p.stripe_acct) return p;
  const cc = String(p.country || "").toUpperCase();
  const r = await st("POST", "accounts", {
    type: "express", country: cc, email: p.payout_email || p.email || undefined,
    capabilities: { transfers: { requested: true } },
    // Außerhalb des EWR: „recipient"-Vereinbarung (nur Empfang von Auszahlungen) – nötig für grenzüberschreitende Auszahlungen.
    ...(EEA.has(cc) ? {} : { tos_acceptance: { service_agreement: "recipient" } }),
    business_profile: { product_description: "Freelance review removal services for RapidRemove", mcc: "7392" },
    metadata: { partner_id: String(p.id), app: "rapidremove-partner" },
  }, `rr-partner-acct-${p.id}-${cc}`);
  if (r.status >= 300 || !r.json.id) throw new Error(stErr(r.json));
  const u = await pool.query(`UPDATE partners SET stripe_acct=$2, stripe_status='pending', stripe_checked_at=now() WHERE id=$1 RETURNING *`, [p.id, r.json.id]);
  return u.rows[0] as PartnerRow;
}
async function stripeOnboardLink(p: PartnerRow): Promise<string> {
  const r = await st("POST", "account_links", { account: p.stripe_acct, type: "account_onboarding", refresh_url: `${SITE_URL}/partner?stripe=retry`, return_url: `${SITE_URL}/partner?stripe=done` });
  if (r.status >= 300 || !r.json.url) throw new Error(stErr(r.json));
  return String(r.json.url);
}
/** Konto-Status bei Stripe (höchstens 1× pro Minute): active = Auszahlungen + Transfers freigeschaltet. */
async function refreshStripe(p: PartnerRow, force = false): Promise<PartnerRow> {
  if (!pool || !p.stripe_acct || !stripeConfigured()) return p;
  if (!force && p.stripe_checked_at && Date.now() - new Date(p.stripe_checked_at).getTime() < 60_000) return p;
  const r = await st("GET", `accounts/${encodeURIComponent(p.stripe_acct)}`).catch(() => null);
  if (!r || r.status >= 300) return p;
  const a = r.json;
  const stt = a.payouts_enabled && a.capabilities?.transfers === "active" ? "active" : (a.requirements?.disabled_reason ? `restricted: ${a.requirements.disabled_reason}` : a.details_submitted ? "review" : "pending");
  const u = await pool.query(`UPDATE partners SET stripe_status=$2, stripe_checked_at=now() WHERE id=$1 RETURNING *`, [p.id, stt]);
  return u.rows[0] as PartnerRow;
}
/** USD → EUR (EZB-Referenzkurs; Fallback Stripe). Liefert EUR je 1 USD. */
async function usdToEur(): Promise<{ rate: number; date: string; src: string }> {
  try {
    const x = await (await fetch("https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", { signal: AbortSignal.timeout(8000) })).text();
    const usd = Number(/currency=["']USD["']\s+rate=["']([\d.]+)["']/.exec(x)?.[1]);
    const d = /time=["'](\d{4}-\d{2}-\d{2})["']/.exec(x)?.[1] || "";
    if (usd > 0) return { rate: 1 / usd, date: d, src: "EZB" };
  } catch { /* EZB nicht erreichbar */ }
  const r = await st("GET", "exchange_rates/usd").catch(() => null);
  const e = Number(r?.json?.rates?.eur);
  if (e > 0) return { rate: e, date: new Date().toISOString().slice(0, 10), src: "Stripe" };
  throw new Error("Wechselkurs USD→EUR nicht verfügbar");
}

/* ---------------- Gutschrift-Nummer + Auszahlung festhalten ---------------- */
async function nextGsNo(): Promise<string> {
  const y = new Date().toLocaleString("en-CA", { timeZone: "Europe/Vienna", year: "numeric" });
  const r = await pool!.query(
    `INSERT INTO partner_settings (key, value) VALUES ($1,'1') ON CONFLICT (key) DO UPDATE SET value = (partner_settings.value::int + 1)::text RETURNING value`, [`gs_seq_${y}`]);
  return `GS-${y}-${String(r.rows[0].value).padStart(4, "0")}`;
}
type TaskLite = { id: string; code: string; kind: string; price_usd: string; customer: string | null; removed_at: string | null; order_id: string | null; url: string | null; name: string | null; text: string | null; rating: number | null };
const KIND_L: Record<string, string> = { normal: "Google review removal", old: "Google review removal (older than 4 weeks)", nt: "Google rating removal (no text / special procedure)", profile: "Google business profile removal" };

/** Bezahlte Auszahlung abschließen: Gutschrift-Nummer + Momentaufnahme Partner/Positionen (nur mit Gutschrift-Zustimmung). */
async function finalize(payoutId: number, p: PartnerRow | null, tasks: TaskLite[]): Promise<string | null> {
  if (!pool) return null;
  const dates = tasks.map((t) => (t.removed_at ? new Date(t.removed_at).getTime() : 0)).filter(Boolean);
  const items = tasks.map((t) => ({ code: t.code || `#${t.id}`, kind: t.kind, desc: KIND_L[t.kind] || KIND_L.normal, customer: t.customer || "", removed: t.removed_at, usd: num(t.price_usd) }));
  const gs = sbOk(p) && profileDone(p) ? await nextGsNo() : null;
  const party = p ? {
    name: p.legal_name || p.name, addr1: p.addr1, addr2: p.addr2, city: p.city, zip: p.zip, country: p.country, taxId: p.tax_id, vatId: p.vat_id, vat: vatRule(p),
    email: p.payout_email || p.email, sbAt: p.sb_at, sbV: p.sb_v, method: p.payout_method, bank: p.bank ? mask(p.bank.iban || p.bank.account) + (p.bank.ifsc ? " · IFSC " + p.bank.ifsc : "") : null,
  } : null;
  await pool.query(
    `UPDATE partner_payouts SET gs_no=$2, party=$3, items=$4, partner_id=$5, period_from=$6, period_to=$7 WHERE id=$1`,
    [payoutId, gs, party ? JSON.stringify(party) : null, JSON.stringify(items), p ? p.id : null,
      dates.length ? new Date(Math.min(...dates)) : null, dates.length ? new Date(Math.max(...dates)) : null],
  );
  return gs;
}

/** Netto/USt/Brutto je Auszahlung (Partnerpreise sind netto; österr. Partner ohne Kleinunternehmer: + 20 % USt). */
function amounts(net: number, p: PartnerRow | null) {
  const vat = p && vatRule(p) === "at20" ? num(net * 0.2) : 0;
  return { net: num(net), vat, gross: num(net + vat) };
}

/** Manuelle Auszahlung (Admin „bezahlt" bzw. Partner „Mark paid"): je Partner ein Sammelposten + Gutschrift (wenn vereinbart) + Mail. */
export async function recordManualPayout(taskIds: (string | number)[], note: string | null, by: "admin" | "partner", partnerId: number | null = null): Promise<{ payoutId: number; amount: number; tasks: number; gs: string | null } | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT id, code, kind, price_usd, customer, removed_at, order_id, url, name, text, rating, partner_id FROM partner_tasks
     WHERE id = ANY($1::bigint[]) AND status='removed' AND paid_at IS NULL AND payout_id IS NULL AND NOT test ${partnerId ? "AND partner_id=$2" : ""}`, partnerId ? [taskIds.map(String), partnerId] : [taskIds.map(String)]);
  const all = r.rows as (TaskLite & { partner_id: string | null })[];
  if (!all.length) return null;
  const groups = new Map<string, typeof all>();
  for (const t of all) { const k = String(t.partner_id ?? ""); if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(t); }
  let first = 0, total = 0, n = 0; const gsList: string[] = [];
  for (const [k, rows] of groups) {
    const p = await partnerById(k ? Number(k) : null);
    const a = amounts(rows.reduce((s, x) => s + Number(x.price_usd || 0), 0), p);
    const ins = await pool.query(`INSERT INTO partner_payouts (amount_usd, net_usd, vat_usd, tasks, note, status, method, sent_at, partner_id) VALUES ($1,$2,$3,$4,$5,'manual',$6, now(), $7) RETURNING id`,
      [a.gross, a.net, a.vat, rows.length, note, by === "partner" ? "manual (confirmed by partner)" : "manual", p ? p.id : null]);
    const id = Number(ins.rows[0].id);
    await pool.query(`UPDATE partner_tasks SET paid_at=now(), payout_id=$1, updated_at=now() WHERE id = ANY($2::bigint[])`, [id, rows.map((x) => x.id)]);
    const gs = await finalize(id, p, rows);
    if (gs) { gsList.push(gs); void mailGutschrift(id).catch(() => {}); }
    if (!first) first = id; total += a.gross; n += rows.length;
  }
  bumpChange();
  return { payoutId: first, amount: num(total), tasks: n, gs: gsList.join(", ") || null };
}

/* ---------------- Automatischer Lauf ---------------- */
let running = false;
export type RunResult = { ok: boolean; skipped?: string; payoutId?: number; amount?: number; tasks?: number; held?: string[]; error?: string; gs?: string | null; partners?: unknown[] };

/** Fällige Löschungen prüfen und auszahlen (Payoneer oder Bankkonto/Airwallex – je nach Wahl des Partners).
 *  `manual` = vom Admin ausgelöst (ignoriert Tageszeit und Automatik-Schalter, nicht die Haltefrist). */
export async function runPayouts(log: (m: string) => void = () => {}, manual = false): Promise<RunResult> {
  if (!pool) return { ok: false, skipped: "keine Datenbank" };
  if (running) return { ok: false, skipped: "läuft bereits" };
  running = true;
  try {
    const s = await payoutSettings();
    if (!manual && !s.auto) return { ok: true, skipped: "automatische Auszahlung aus" };
    // Alle freigegebenen Partner (auch pausierte – erledigte Arbeit wird bezahlt).
    const ps = (await pool.query(`SELECT * FROM partners WHERE status='active' ORDER BY id`)).rows as PartnerRow[];
    if (!ps.length) return { ok: true, skipped: "kein aktiver Partner" };
    const res: (RunResult & { partner: string })[] = [];
    for (const p of ps) res.push({ partner: p.name, ...(await runFor(p, s, log, manual).catch((e) => ({ ok: false, error: (e as Error).message } as RunResult))) });
    const paid = res.filter((r) => r.payoutId);
    return {
      ok: res.every((r) => r.ok), payoutId: paid[0]?.payoutId, amount: paid.length ? num(paid.reduce((x, r) => x + Number(r.amount || 0), 0)) : undefined,
      tasks: paid.length ? paid.reduce((x, r) => x + Number(r.tasks || 0), 0) : undefined, held: res.flatMap((r) => r.held || []),
      gs: paid.map((r) => r.gs).filter(Boolean).join(", ") || null,
      error: res.filter((r) => r.error).map((r) => `${r.partner}: ${r.error}`).join(" · ") || undefined,
      skipped: paid.length ? undefined : res.map((r) => `${r.partner}: ${r.skipped || r.error || "–"}`).join(" · "),
      partners: res,
    };
  } finally { running = false; }
}

/** Auszahlung für EINEN Partner. */
async function runFor(pIn: PartnerRow, s: PayoutSettings, log: (m: string) => void, manual: boolean): Promise<RunResult> {
    if (!pool) return { ok: false, skipped: "keine Datenbank" };
    let p = pIn;
    if (!setupDone(p)) return { ok: true, skipped: "Partner hat die Auszahlung noch nicht eingerichtet" };
    const via = p.payout_method === "bank" ? "bank" : p.payout_method === "stripe" ? "stripe" : "payoneer";
    const L = via === "bank" ? "Bank (Airwallex)" : via === "stripe" ? "Bank (Stripe)" : "Payoneer";
    if (via === "stripe") {
      if (!stripeConfigured()) return { ok: true, skipped: "Stripe-Zugang fehlt" };
      p = await refreshStripe(p, true);
      if (p.stripe_status !== "active") return { ok: true, skipped: `Stripe-Konto des Partners noch nicht freigeschaltet (${p.stripe_status || "nicht angelegt"})` };
    } else if (via === "payoneer") {
      if (!payoneerConfigured()) return { ok: true, skipped: "Payoneer-Zugang fehlt (Railway-Variablen)" };
      p = await refreshPayee(p, true);
      if (!payeeActive(p)) return { ok: true, skipped: `Payoneer-Konto des Partners nicht verbunden (${p.payee_status || "nicht verknüpft"})` };
    } else {
      if (!airwallexConfigured()) return { ok: true, skipped: "Airwallex-Zugang fehlt (Railway-Variablen)" };
      p = await ensureBeneficiary(p);
      if (!p.aw_beneficiary_id) return { ok: true, skipped: `Bankdaten bei Airwallex abgelehnt: ${p.aw_error || "unbekannt"}` };
    }
    const due = (await pool.query(
      `SELECT id, code, kind, price_usd, customer, removed_at, order_id, url, name, text, rating FROM partner_tasks
        WHERE status='removed' AND paid_at IS NULL AND payout_id IS NULL AND NOT test AND partner_id = $2 AND removed_at <= now() - make_interval(days => $1::int)
        ORDER BY removed_at, id LIMIT 400`, [s.holdDays, p.id])).rows as TaskLite[];
    if (!due.length) return { ok: true, skipped: "nichts fällig" };
    // Vor dem Geld: Lena prüft nochmal, ob die Bewertung wirklich noch weg ist.
    const ok: TaskLite[] = []; const held: string[] = [];
    if (s.recheck) {
      const q = [...due];
      const w = async () => { for (let t = q.shift(); t; t = q.shift()) {
        const c = await checkRemoval(t).catch(() => ({ result: "unknown" as const, reason: "" }));
        if (c.result === "visible") {
          held.push(t.code);
          await pool!.query(`UPDATE partner_tasks SET admin_note = trim(both ' ' from COALESCE(admin_note,'') || ' · Vor Auszahlung wieder sichtbar (' || to_char(now() AT TIME ZONE 'Europe/Vienna','DD.MM. HH24:MI') || ')') WHERE id=$1`, [t.id]).catch(() => {});
          if (t.order_id) await insertEvent({ orderId: t.order_id, type: "note", title: `Auszahlung angehalten: ${t.code} wieder sichtbar`, detail: c.reason || "", auto: true }).catch(() => {});
        } else ok.push(t);
      } };
      await Promise.all([w(), w()]);
    } else ok.push(...due);
    if (held.length) void notifyTeam(`Auszahlung angehalten · ${held.length} wieder sichtbar`, `Partner wird dafür nicht bezahlt: ${held.join(", ")} · bitte prüfen`, `${SITE_URL}/admin`, { kind: "payout" });
    if (!ok.length) return { ok: true, skipped: "alle fälligen wieder sichtbar", held };
    const a = amounts(ok.reduce((x, t) => x + Number(t.price_usd || 0), 0), p);
    const amount = a.gross;
    if (a.net < s.minUsd) return { ok: true, skipped: `Summe $${a.net} unter Mindestbetrag $${s.minUsd}`, held };

    // Reservieren (payout_id gesetzt, paid_at erst nach Annahme durch den Anbieter) → kein doppeltes Auszahlen.
    const ins = await pool.query(`INSERT INTO partner_payouts (amount_usd, net_usd, vat_usd, tasks, note, status, method, partner_id) VALUES ($1,$2,$3,$4,$5,'pending',$6,$7) RETURNING id`,
      [a.gross, a.net, a.vat, ok.length, `${L} (${manual ? "manuell gestartet" : "automatisch"})`, via === "bank" ? "airwallex" : via, p.id]);
    const id = Number(ins.rows[0].id);
    const ref = `RRP-${id}`;
    const taken = await pool.query(`UPDATE partner_tasks SET payout_id=$1 WHERE id = ANY($2::bigint[]) AND payout_id IS NULL AND paid_at IS NULL RETURNING id`, [id, ok.map((t) => t.id)]);
    if (taken.rowCount !== ok.length) {
      await pool.query(`UPDATE partner_tasks SET payout_id=NULL WHERE payout_id=$1`, [id]);
      await pool.query(`UPDATE partner_payouts SET status='failed', error='Aufgaben gleichzeitig verändert – nächster Lauf' WHERE id=$1`, [id]);
      return { ok: false, error: "Aufgaben gleichzeitig verändert" };
    }
    const desc = `RapidRemove payout ${ref} · ${ok.length} removal${ok.length > 1 ? "s" : ""}`;
    let r: { status: number; json: Record<string, unknown> };
    let fx: { rate: number; date: string; src: string } | null = null, paid: { amount: number; cur: string } | null = null;
    try {
      if (via === "stripe") {
        const cur = PAY_CUR();
        fx = cur === "usd" ? null : await usdToEur();
        const amt = cur === "usd" ? amount : num(amount * fx!.rate);
        paid = { amount: amt, cur: cur.toUpperCase() };
        r = await st("POST", "transfers", {
          amount: Math.round(amt * 100), currency: cur, destination: p.stripe_acct, transfer_group: ref, description: desc,
          metadata: { payout: ref, usd: amount.toFixed(2), ...(fx ? { fx_eur_per_usd: fx.rate.toFixed(6), fx_date: fx.date, fx_src: fx.src } : {}) },
        }, `rr-${ref}`);
      } else r = via === "payoneer"
        ? await py("POST", "/masspayouts", { Payments: [{ client_reference_id: ref, payee_id: p.payee_id, description: desc, currency: "USD", amount: amount.toFixed(2) }] })
        : await aw("POST", "/api/v1/transfers/create", {
          request_id: ref, beneficiary_id: p.aw_beneficiary_id, transfer_method: "LOCAL", source_currency: AW().source, transfer_currency: p.bank!.currency,
          ...(AW().source === p.bank!.currency ? { transfer_amount: amount.toFixed(2) } : { source_amount: amount.toFixed(2) }),
          reason: AW().reason, reference: `RapidRemove ${ref}`.slice(0, 35), fee_paid_by: "PAYER",
        });
    } catch (e) { r = { status: 0, json: { error: (e as Error).message, message: (e as Error).message } }; }
    if (r.status < 200 || r.status >= 300) {
      const err = (via === "payoneer" ? pyErr(r.json) : via === "stripe" ? stErr(r.json) : awErr(r.json)) || `HTTP ${r.status}`;
      await pool.query(`UPDATE partner_tasks SET payout_id=NULL WHERE payout_id=$1 AND paid_at IS NULL`, [id]);
      await pool.query(`UPDATE partner_payouts SET status='failed', error=$2, provider_ref=$3 WHERE id=$1`, [id, err, ref]);
      void notifyTeam(`Auszahlung fehlgeschlagen · $${amount}`, `${L}: ${err}`.slice(0, 180), `${SITE_URL}/admin`, { kind: "payout" });
      log(`Auszahlung ${ref} fehlgeschlagen: ${err}`);
      return { ok: false, error: err, held };
    }
    const pref = via === "payoneer" ? ref : String(r.json.id || r.json.transfer_id || ref);
    await pool.query(`UPDATE partner_payouts SET status='sent', sent_at=now(), provider_ref=$2, provider_status=$3, paid_amount=$4, paid_currency=$5, fx_rate=$6, fx_date=$7 WHERE id=$1`,
      [id, pref, via === "stripe" ? "transferred" : String(r.json.status || "") || findStatus(r.json) || "submitted", paid ? paid.amount : amount, paid ? paid.cur : "USD", fx ? fx.rate : null, fx ? `${fx.date} (${fx.src})` : null]);
    await pool.query(`UPDATE partner_tasks SET paid_at=now(), updated_at=now() WHERE payout_id=$1`, [id]);
    const gs = await finalize(id, p, ok);
    if (gs) void mailGutschrift(id).catch((e) => log(`Gutschrift-Mail ${gs} fehlgeschlagen: ${(e as Error).message}`));
    void notifyTeam(`Partner ausgezahlt · $${amount}`, `${L} · ${ok.length} Löschungen · ${gs || ref}`, `${SITE_URL}/admin`, { kind: "payout" });
    bumpChange();
    log(`Auszahlung ${ref} (${L}): $${amount} für ${ok.length} Löschungen (${gs || "ohne Gutschrift"})`);
    return { ok: true, payoutId: id, amount, tasks: ok.length, held, gs };
}


/** Status gesendeter Auszahlungen nachziehen (Payoneer „Transferred", Airwallex „PAID"/„FAILED" …). */
async function pollSent(): Promise<void> {
  if (!pool) return;
  const r = await pool.query(`SELECT id, method, provider_ref FROM partner_payouts WHERE status='sent' AND provider_ref IS NOT NULL AND sent_at > now() - interval '14 days' ORDER BY id DESC LIMIT 20`);
  for (const x of r.rows as { id: number; method: string; provider_ref: string }[]) {
    let st = "";
    if (x.method === "payoneer" && payoneerConfigured()) {
      const s = await py("GET", `/payouts/${encodeURIComponent(x.provider_ref)}/status`).catch(() => null);
      st = s && s.status < 300 ? findStatus(s.json) : "";
    } else if (x.method === "airwallex" && airwallexConfigured()) {
      const s = await aw("GET", `/api/v1/transfers/${encodeURIComponent(x.provider_ref)}`).catch(() => null);
      st = s && s.status < 300 ? String(s.json.status || "") : "";
    }
    if (!st) continue;
    const failed = /cancel|fail|reject|declin|return/i.test(st);
    await pool.query(`UPDATE partner_payouts SET provider_status=$2${failed ? ", status='failed', error=$2" : ""} WHERE id=$1`, [x.id, st]);
    if (failed) void notifyTeam(`Auszahlung ${x.provider_ref}: ${st}`, "Bitte beim Anbieter prüfen – Aufgaben bleiben als bezahlt markiert.", `${SITE_URL}/admin`, { kind: "payout" });
  }
}

const viennaNow = () => {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t: string) => f.find((x) => x.type === t)?.value || "";
  return { day: `${g("year")}-${g("month")}-${g("day")}`, hour: Number(g("hour")) };
};
/** Einmal am Tag (ab der eingestellten Stunde, Wiener Zeit) auszahlen; Status gesendeter Auszahlungen nachziehen. */
export async function payoutTick(log: (m: string) => void): Promise<void> {
  if (!pool) return;
  await pollSent().catch(() => {});
  const s = await payoutSettings();
  if (!s.auto || !(payoneerConfigured() || airwallexConfigured() || stripeConfigured())) return;
  const v = viennaNow();
  if (v.hour < s.hour || (await getSetting("payout_last_day")) === v.day) return;
  await setSetting("payout_last_day", v.day);
  const r = await runPayouts(log, false);
  await setSetting("payout_last_result", JSON.stringify({ at: new Date().toISOString(), ...r })).catch(() => {});
}

/* ---------------- Gutschrift (PDF) ---------------- */
type PayoutRow = { id: string; amount_usd: string; net_usd: string | null; vat_usd: string | null; paid_amount: string | null; paid_currency: string | null; fx_rate: string | null; fx_date: string | null; tasks: number; status: string; method: string | null; provider_ref: string | null; gs_no: string | null; currency: string; sent_at: string | null; created_at: string; period_from: string | null; period_to: string | null; party: Record<string, string | null> | null; items: { code: string; desc: string; customer: string; removed: string | null; usd: number }[] | null; note: string | null; partner_id: string | null };
async function payoutRow(id: number): Promise<PayoutRow | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT * FROM partner_payouts WHERE id=$1`, [id]);
  return (r.rows[0] as PayoutRow) || null;
}
// Standard-PDF-Schriften kennen nur WinAnsi → alles andere ersetzen.
const win = (s: unknown) => String(s ?? "").normalize("NFC").replace(/\u2022/g, "*").replace(/[\u2013\u2014]/g, "-").replace(/[\u201c\u201d\u201e]/g, '"').replace(/[\u2018\u2019]/g, "'")
  .replace(/[^\x20-\x7e\xa0-\xff\u20ac]/g, (ch) => ch.normalize("NFKD").replace(/[^\x20-\x7e]/g, "") || "?");
const dmy = (d: unknown) => (d ? new Date(String(d)).toLocaleDateString("de-AT", { timeZone: "Europe/Vienna", day: "2-digit", month: "2-digit", year: "numeric" }) : "");
const COUNTRY: Record<string, string> = { PK: "Pakistan", IN: "India", BD: "Bangladesh", LK: "Sri Lanka", NP: "Nepal", PH: "Philippines", AE: "United Arab Emirates", EG: "Egypt", NG: "Nigeria", KE: "Kenya", TR: "Turkey", ID: "Indonesia", VN: "Vietnam", US: "United States", GB: "United Kingdom", DE: "Germany", AT: "Austria" };

export async function gutschriftPdf(id: number): Promise<{ buf: Buffer; name: string } | null> {
  const x = await payoutRow(id);
  if (!x || !x.gs_no) return null;
  const doc = await PDFDocument.create();
  doc.setTitle(`Gutschrift ${x.gs_no}`); doc.setAuthor(US.name); doc.setCreator("RapidRemove");
  const F = await doc.embedFont(StandardFonts.Helvetica), B = await doc.embedFont(StandardFonts.HelveticaBold);
  let page: PDFPage = doc.addPage([595.28, 841.89]);
  const L = 56, R = 595.28 - 56; let y = 841.89 - 64;
  const ink = rgb(0.07, 0.07, 0.07), grey = rgb(0.42, 0.42, 0.42), line = rgb(0.86, 0.86, 0.86);
  const t = (s: unknown, xx: number, yy: number, o: { f?: PDFFont; size?: number; c?: typeof ink; right?: boolean } = {}) => {
    const f = o.f || F, size = o.size || 9.5, str = win(s);
    page.drawText(str, { x: o.right ? xx - f.widthOfTextAtSize(str, size) : xx, y: yy, size, font: f, color: o.c || ink });
  };
  const wrap = (s: string, w: number, f: PDFFont, size: number) => {
    const out: string[] = []; let cur = "";
    for (const word of win(s).split(/\s+/)) { const n = cur ? cur + " " + word : word; if (f.widthOfTextAtSize(n, size) > w && cur) { out.push(cur); cur = word; } else cur = n; }
    if (cur) out.push(cur); return out;
  };
  const para = (s: string, size = 8, c = grey) => { for (const l of wrap(s, R - L, F, size)) { t(l, L, y, { size, c }); y -= size + 3.2; } };
  const hr = () => { page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.6, color: line }); };

  t("GUTSCHRIFT", L, y, { f: B, size: 22 }); t(x.gs_no, R, y + 4, { f: B, size: 12, right: true });
  y -= 16; t("Self-billing invoice", L, y, { size: 11, c: grey }); t(`Datum / Date: ${dmy(x.sent_at || x.created_at)}`, R, y, { size: 9.5, right: true, c: grey });
  y -= 30;
  const p = x.party || {};
  const colW = (R - L) / 2;
  t("Leistender / Supplier", L, y, { f: B, size: 8.5, c: grey }); t("Leistungsempfänger / Recipient (Aussteller)", L + colW, y, { f: B, size: 8.5, c: grey });
  y -= 14;
  const left = [p.name, p.addr1, p.addr2, [p.zip, p.city].filter(Boolean).join(" "), COUNTRY[String(p.country || "").toUpperCase()] || p.country, p.vatId ? `UID / VAT ID: ${p.vatId}` : "", p.taxId ? `Tax ID: ${p.taxId}` : "", p.email].filter(Boolean) as string[];
  const right = [US.name, ...US.lines, `UID: ${US.uid}`, US.fn, US.mail];
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (left[i]) t(left[i], L, y, { f: i === 0 ? B : F, size: 9.5 });
    if (right[i]) t(right[i], L + colW, y, { f: i === 0 ? B : F, size: 9.5 });
    y -= 13;
  }
  y -= 10;
  t(`Leistungszeitraum / Service period: ${dmy(x.period_from)}${x.period_to && dmy(x.period_to) !== dmy(x.period_from) ? " – " + dmy(x.period_to) : ""}`, L, y, { size: 9.5 });
  y -= 22;
  // Tabelle
  const cols = [L, L + 62, R - 150, R];
  const head = () => {
    t("Nr. / Ref", cols[0], y, { f: B, size: 8.5, c: grey }); t("Leistung / Service", cols[1], y, { f: B, size: 8.5, c: grey });
    t("Gelöscht / Removed", cols[2], y, { f: B, size: 8.5, c: grey }); t("USD", cols[3], y, { f: B, size: 8.5, c: grey, right: true });
    y -= 6; hr(); y -= 13;
  };
  head();
  for (const it of x.items || []) {
    if (y < 150) { page = doc.addPage([595.28, 841.89]); y = 841.89 - 64; head(); }
    t(it.code, cols[0], y);
    const d = wrap(`${it.desc}${it.customer ? " – " + it.customer : ""}`, cols[2] - cols[1] - 10, F, 9);
    t(d[0], cols[1], y, { size: 9 }); t(dmy(it.removed), cols[2], y); t(num(it.usd).toFixed(2), cols[3], y, { right: true });
    for (const more of d.slice(1, 2)) { y -= 11; t(more, cols[1], y, { size: 9, c: grey }); }
    y -= 15;
  }
  hr(); y -= 16;
  const tot = num(x.amount_usd).toFixed(2);
  const vatAmt = num(x.vat_usd), netAmt = x.net_usd != null ? num(x.net_usd) : num(x.amount_usd) - vatAmt;
  const rule = String(p.vat || "rc");
  t("Nettobetrag / Net amount", cols[2] - 60, y); t(`USD ${netAmt.toFixed(2)}`, R, y, { right: true }); y -= 14;
  t(rule === "at20" ? "USt / VAT 20 %" : rule === "atklein" ? "USt / VAT 0 % (Kleinunternehmer)" : "USt / VAT 0 % (Reverse Charge)", cols[2] - 60, y); t(`USD ${vatAmt.toFixed(2)}`, R, y, { right: true }); y -= 16;
  t("Gutschriftsbetrag / Total", cols[2] - 60, y, { f: B, size: 11 }); t(`USD ${tot}`, R, y, { f: B, size: 11, right: true });
  y -= 30;
  const fxTxt = x.paid_currency && x.paid_currency !== "USD" && x.fx_rate ? ` Ausgezahlter Betrag: ${x.paid_currency} ${num(x.paid_amount).toFixed(2)} (1 USD = ${Number(x.fx_rate).toFixed(4)} ${x.paid_currency}, ${x.fx_date || ""}). / Amount paid: ${x.paid_currency} ${num(x.paid_amount).toFixed(2)}.` : "";
  const paid = x.method === "stripe" ? `Ausgezahlt per Banküberweisung (Stripe) am ${dmy(x.sent_at)} (Referenz RRP-${x.id}). / Paid by bank transfer via Stripe on ${dmy(x.sent_at)} (reference RRP-${x.id}).${fxTxt}`
    : x.method === "airwallex" ? `Ausgezahlt per Banküberweisung am ${dmy(x.sent_at)}${p.bank ? " auf " + p.bank : ""} (Referenz RRP-${x.id}). / Paid by bank transfer on ${dmy(x.sent_at)} (reference RRP-${x.id}).`
    : x.method === "payoneer" ? `Ausgezahlt über Payoneer am ${dmy(x.sent_at)} (Referenz ${x.provider_ref || "RRP-" + x.id}). / Paid via Payoneer on ${dmy(x.sent_at)} (reference ${x.provider_ref || "RRP-" + x.id}).`
    : `Ausgezahlt am ${dmy(x.sent_at || x.created_at)}${x.note ? " (" + x.note + ")" : ""}. / Paid on ${dmy(x.sent_at || x.created_at)}.`;
  para(paid, 8.5, ink); y -= 6;
  const euP = EU.has(String(p.country || "").toUpperCase());
  if (rule === "at20") para(`Die Umsatzsteuer (20 %) ist im Gutschriftsbetrag enthalten. UID des Leistenden: ${p.vatId || "–"} · UID des Leistungsempfängers: ${US.uid}. / Austrian VAT 20 % included.`);
  else if (rule === "atklein") para(`Umsatzsteuerbefreit – Kleinunternehmer gem. § 6 Abs. 1 Z 27 UStG (laut Angabe des Leistenden). / VAT exempt small business (as declared by the supplier).`);
  else para(`Übergang der Steuerschuld auf den Leistungsempfänger (Reverse Charge, ${euP ? "Art. 196 MwSt-RL / § 19 Abs. 1 UStG" : "§ 19 Abs. 1 UStG"}). Der Leistende ist im Inland nicht ansässig; Ort der Leistung ist Österreich (§ 3a Abs. 6 UStG). UID des Leistungsempfängers: ${US.uid}${euP && p.vatId ? ` · UID des Leistenden: ${p.vatId}` : ""}. / VAT reverse charge: the recipient is liable for VAT.`);
  y -= 4;
  para(`Diese Gutschrift wurde vom Leistungsempfänger im Namen und für Rechnung des Leistenden ausgestellt (Gutschriftverfahren gem. § 11 Abs. 7 UStG, vereinbart am ${dmy(p.sbAt)}, Version ${p.sbV || SB_VERSION}). Der Leistende kann ihr innerhalb von 30 Tagen widersprechen. / This self-billing invoice was issued by the recipient in the name and on behalf of the supplier under the self-billing agreement accepted on ${dmy(p.sbAt)}. The supplier may object within 30 days.`);
  const buf = Buffer.from(await doc.save());
  return { buf, name: `Gutschrift-${x.gs_no}.pdf` };
}

export async function mailGutschrift(id: number): Promise<void> {
  if (!pool) return;
  const x = await payoutRow(id);
  if (!x || !x.gs_no) return;
  const to = String((x.party && x.party.email) || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return;
  const pdf = await gutschriftPdf(id);
  if (!pdf) return;
  const amt = num(x.amount_usd).toFixed(2);
  const how = x.method === "payoneer" ? "has been sent to your Payoneer account" : "has been recorded as paid";
  await sendMail({
    to, subject: `RapidRemove payout USD ${amt} · ${x.gs_no}`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:560px">
      <p>Hi${x.party?.name ? " " + String(x.party.name).replace(/[<>&]/g, "") : ""},</p>
      <p>your payout of <b>USD ${amt}</b> for <b>${x.tasks}</b> verified removal${x.tasks > 1 ? "s" : ""} ${how}${x.provider_ref ? ` (reference ${x.provider_ref})` : ""}.</p>
      <p>Attached is the self-billing invoice <b>${x.gs_no}</b> (Gutschrift). You don't need to send us an invoice for these removals.</p>
      <p>You can see all payouts in the partner app under <b>Earnings</b>: <a href="${SITE_URL}/partner">${SITE_URL.replace(/^https?:\/\//, "")}/partner</a></p>
      <p>Thank you!<br/>RapidRemove · Simple Solution. OG</p></div>`,
    attachments: [{ filename: pdf.name, content: pdf.buf, contentType: "application/pdf" }],
  });
  await pool.query(`UPDATE partner_payouts SET gs_mailed_at=now() WHERE id=$1`, [id]);
}

/* ---------------- Ansichten ---------------- */
function payoutView(x: PayoutRow) {
  return {
    id: Number(x.id), amount: num(x.amount_usd), tasks: x.tasks, status: x.status, method: x.method || "manual", ref: x.provider_ref || null,
    providerStatus: (x as PayoutRow & { provider_status?: string | null }).provider_status || null, error: (x as PayoutRow & { error?: string | null }).error || null,
    gs: x.gs_no, created: x.created_at, sent: x.sent_at, note: x.note,
  };
}
async function balance(holdDays: number, pid: number | null = null) {
  if (!pool) return { owedUsd: 0, owedCount: 0, dueUsd: 0, dueCount: 0, processingUsd: 0 };
  const r = await pool.query(`SELECT
      COALESCE(sum(price_usd) FILTER (WHERE payout_id IS NULL),0) AS owed, count(*) FILTER (WHERE payout_id IS NULL) AS owed_n,
      COALESCE(sum(price_usd) FILTER (WHERE payout_id IS NULL AND removed_at <= now() - make_interval(days => $1::int)),0) AS due,
      count(*) FILTER (WHERE payout_id IS NULL AND removed_at <= now() - make_interval(days => $1::int)) AS due_n,
      COALESCE(sum(price_usd) FILTER (WHERE payout_id IS NOT NULL),0) AS proc
    FROM partner_tasks WHERE status='removed' AND paid_at IS NULL AND NOT test AND ($2::bigint IS NULL OR partner_id = $2)`, [holdDays, pid]);
  const x = r.rows[0] || {};
  return { owedUsd: num(x.owed), owedCount: Number(x.owed_n || 0), dueUsd: num(x.due), dueCount: Number(x.due_n || 0), processingUsd: num(x.proc) };
}
function nextRunText(s: PayoutSettings): string {
  const v = viennaNow();
  return v.hour < s.hour ? `today ${s.hour}:00 (Vienna time)` : `tomorrow ${s.hour}:00 (Vienna time)`;
}

/* ---------------- Routen ---------------- */
const ipOf = (req: FastifyRequest) => String((req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] || req.ip || "").trim().slice(0, 80);
const ISO2 = /^[A-Z]{2}$/;

export function registerPayoutRoutes(
  app: FastifyInstance, adminToken: string,
  auth: { check: (t: unknown) => Promise<boolean>; preview: (t: unknown) => Promise<boolean>; email: (t: unknown) => Promise<string | null> },
): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;
  const partnerOf = async (t: unknown) => partnerById(await partnerIdOf(t));
  /** Auszahlungen eines Partners (Altbestand ohne partner_id gehört dem ersten Partner). */
  const payoutsOf = async (pid: number, limit: number) => (await pool!.query(
    `SELECT * FROM partner_payouts WHERE partner_id=$1 OR (partner_id IS NULL AND $1 = (SELECT min(id) FROM partners)) ORDER BY id DESC LIMIT ${limit}`, [pid])).rows as PayoutRow[];

  // Partner: Auszahlungsdaten, Guthaben, Auszahlungen (mit Gutschrift). `setupDone=false` → Pflicht-Einrichtung vor den Aufträgen.
  app.post("/partner/payouts", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const s = await payoutSettings();
    const base = { sbText: SB_TEXT, sbVersion: SB_VERSION, payoneer: payoneerConfigured(), bank: airwallexConfigured(), stripe: stripeConfigured(), holdDays: s.holdDays, minUsd: s.minUsd, next: nextRunText(s) };
    if (await auth.preview(b.t)) return { ok: true, preview: true, ...base, profile: null, auto: false, balance: { owedUsd: 0, owedCount: 0, dueUsd: 0, dueCount: 0, processingUsd: 0 }, payouts: [] };
    let p = await partnerOf(b.t);
    if (p) p = await refreshStripe(await refreshPayee(p), String(b.fresh || "") === "stripe");
    const prs = p ? await payoutsOf(Number(p.id), 40) : [];
    return {
      ok: true, ...base, profile: profileView(p), auto: s.auto && payReady(p),
      balance: await balance(s.holdDays, p ? Number(p.id) : -1), payouts: prs.filter((x) => x.status !== "failed" && x.status !== "pending").map(payoutView).map((x) => ({ ...x, error: null })),
    };
  });

  // Partner: Auszahlungsweg + Daten speichern + Gutschrift-Vereinbarung.
  app.post("/partner/payouts/profile", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (await auth.preview(b.t)) return reply.code(400).send({ ok: false, error: "test mode" });
    const p = await partnerOf(b.t);
    if (!p) return reply.code(404).send({ ok: false, error: "partner not found" });
    const v = {
      legal: clip(b.legalName, 120), a1: clip(b.addr1, 160), a2: clip(b.addr2, 160), city: clip(b.city, 80), zip: clip(b.zip, 20),
      country: clip(b.country, 2).toUpperCase(), tax: clip(b.taxId, 40), email: clip(b.payoutEmail, 160).toLowerCase(),
      method: b.method === "bank" ? "bank" as const : b.method === "stripe" ? "stripe" as const : b.method === "payoneer" ? "payoneer" as const : null, vat: clip(b.vatId, 20), small: b.smallBiz === true,
    };
    if (!v.legal || !v.a1 || !v.city || !ISO2.test(v.country)) return reply.code(400).send({ ok: false, error: "Please fill in name, address, city and country." });
    if (!v.method) return reply.code(400).send({ ok: false, error: "Please choose how you want to get paid." });
    if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return reply.code(400).send({ ok: false, error: "Email is not valid." });
    if (v.method === "payoneer" && !v.email) return reply.code(400).send({ ok: false, error: "Please enter the email of your Payoneer account." });
    if (v.method === "stripe" && (!STRIPE_CC.has(v.country) || !stripeConfigured())) return reply.code(400).send({ ok: false, error: "Bank payouts are not available in your country – please choose Payoneer." });
    // Bankkonto: neue Daten prüfen – oder die gespeicherten behalten (Formular zeigt sie nur maskiert).
    let bank: Bank | null = null;
    if (v.method === "bank") {
      const nb = (b.bank || {}) as Record<string, unknown>;
      const fresh = !!clip(nb.iban, 42) || !!clip(nb.account, 34);
      if (fresh) { const x = bankFrom(v.country, nb, v.legal); if (x.error) return reply.code(400).send({ ok: false, error: x.error }); bank = x.bank!; }
      else if (p.bank && p.bank.currency === bankCurrency(v.country)) bank = { ...p.bank, holder: clip(nb.holder, 120) || p.bank.holder };
      else return reply.code(400).send({ ok: false, error: bankCurrency(v.country) ? "Please enter your bank account." : "Bank payouts are not available in your country – please choose Payoneer." });
    }
    // Steuer: EU → UID (freiwillig, wird geprüft); Österreich ohne Kleinunternehmer → UID Pflicht.
    let vatId: string | null = null, vatStatus: string | null = null;
    if (EU.has(v.country) && v.vat) {
      const c = await checkVat(v.vat, v.country === "GR" ? "EL" : v.country);
      if (!c.ok) return reply.code(400).send({ ok: false, error: "Your VAT ID is not valid in the EU VIES database – please check it." });
      vatId = c.vat; vatStatus = c.status;
    }
    if (v.country === "AT" && !v.small && !vatId) return reply.code(400).send({ ok: false, error: "Bitte UID-Nummer angeben – oder „Kleinunternehmer“ wählen." });
    if (!p.sb_at && b.agree !== true) return reply.code(400).send({ ok: false, error: "Please accept the self-billing agreement." });
    const agree = b.agree === true && (!p.sb_at || p.sb_v !== SB_VERSION);
    const bankChanged = v.method === "bank" && JSON.stringify(bank) !== JSON.stringify(p.bank);
    const stripeReset = !!p.stripe_acct && p.country !== v.country; // Stripe-Konten können das Land nicht wechseln → neues Konto
    const u = await pool.query(
      `UPDATE partners SET legal_name=$2, addr1=$3, addr2=$4, city=$5, zip=$6, country=$7, tax_id=$8, payout_email=$9, payout_method=$10, bank=$11, vat_id=$12, vat_status=$13, small_biz=$14
         ${bankChanged ? ", aw_beneficiary_id=NULL, aw_error=NULL" : ""}${stripeReset ? ", stripe_acct=NULL, stripe_status=NULL" : ""}
         ${agree ? ", sb_at=now(), sb_ip=$15, sb_ua=$16, sb_v=$17" : ""} WHERE id=$1 RETURNING *`,
      [p.id, v.legal, v.a1, v.a2 || null, v.city, v.zip || null, v.country, v.tax || null, v.email || null, v.method, v.method === "bank" ? JSON.stringify(bank) : p.bank ? JSON.stringify(p.bank) : null,
        vatId, vatStatus, v.country === "AT" && v.small, ...(agree ? [ipOf(req), clip(req.headers["user-agent"], 300), SB_VERSION] : [])],
    );
    let row = u.rows[0] as PartnerRow;
    // Bankkonto sofort bei Airwallex anlegen → Fehler (z. B. falsche Kontonummer) sieht der Partner direkt.
    if (row.payout_method === "bank" && airwallexConfigured() && !row.aw_beneficiary_id) {
      row = await ensureBeneficiary(row, true);
      if (!row.aw_beneficiary_id && row.aw_error) return reply.code(400).send({ ok: false, error: `Your bank rejected these details: ${row.aw_error}`, profile: profileView(row) });
    }
    // Stripe: Express-Konto anlegen → danach „Continue to Stripe" (Identität + Bankkonto bei Stripe).
    if (row.payout_method === "stripe" && !row.stripe_acct) {
      try { row = await ensureStripeAccount(row); }
      catch (e) {
        app.log.error({ err: e }, "Stripe-Connect-Konto anlegen fehlgeschlagen");
        void notifyTeam("Stripe Connect: Partner-Konto fehlgeschlagen", String((e as Error).message).slice(0, 180) + " – ist Connect im Stripe-Dashboard aktiviert?", `${SITE_URL}/admin`, { kind: "payout" });
        return reply.code(400).send({ ok: false, error: "Bank payouts are being activated – please choose Payoneer for now or try again later.", profile: profileView(row) });
      }
    }
    if (agree) void notifyTeam("Partner: Auszahlung eingerichtet", `${v.legal} · ${v.country} · ${v.method === "bank" ? "Bankkonto (" + bank!.currency + ")" : v.method === "stripe" ? "Bankkonto (Stripe)" : "Payoneer"}`, `${SITE_URL}/admin`, { kind: "payout" });
    return { ok: true, profile: profileView(row) };
  });

  // Partner: Payoneer-Konto verbinden → Link zu Payoneer (dort einloggen + bestätigen).
  app.post("/partner/payouts/connect", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (await auth.preview(b.t)) return reply.code(400).send({ ok: false, error: "test mode" });
    const p = await partnerOf(b.t);
    if (p && p.payout_method === "stripe" && p.stripe_acct) {
      try { return { ok: true, url: await stripeOnboardLink(p) }; }
      catch (e) { app.log.error({ err: e }, "Stripe-Onboarding-Link fehlgeschlagen"); return reply.code(502).send({ ok: false, error: "Stripe is not reachable right now – please try again later." }); }
    }
    if (!payoneerConfigured()) return reply.code(409).send({ ok: false, error: "Payoneer connection is being activated – we'll let you know." });
    if (!p || !profileDone(p) || !sbOk(p) || p.payout_method !== "payoneer") return reply.code(400).send({ ok: false, error: "Please save your payout details first." });
    try { return { ok: true, url: await payoneerConnectLink(p, b.hasAccount !== false) }; }
    catch (e) { app.log.error({ err: e }, "Payoneer-Link fehlgeschlagen"); return reply.code(502).send({ ok: false, error: "Payoneer is not reachable right now – please try again later." }); }
  });

  // Partner/Admin: Gutschrift als PDF.
  app.post("/partner/payouts/pdf", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t)) || (await auth.preview(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const me = await partnerOf(b.t);
    if (!me || !(await payoutsOf(Number(me.id), 1000)).some((x) => Number(x.id) === Number(b.id))) return reply.code(404).send({ ok: false, error: "not found" });
    const pdf = await gutschriftPdf(Number(b.id));
    if (!pdf) return reply.code(404).send({ ok: false, error: "not found" });
    return reply.header("content-type", "application/pdf").header("content-disposition", `inline; filename="${pdf.name}"`).send(pdf.buf);
  });
  app.post("/admin/payouts/pdf", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const pdf = await gutschriftPdf(Number(b.id));
    if (!pdf) return reply.code(404).send({ ok: false, error: "keine Gutschrift" });
    return reply.header("content-type", "application/pdf").header("content-disposition", `inline; filename="${pdf.name}"`).send(pdf.buf);
  });

  // Admin: Übersicht.
  app.post("/admin/payouts", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const s = await payoutSettings();
    const ps = (await pool.query(`SELECT * FROM partners WHERE status='active' ORDER BY id`)).rows as PartnerRow[];
    const partners = [] as unknown[];
    for (let p of ps) {
      p = await refreshStripe(await refreshPayee(p));
      partners.push({ ...profileView(p), email: p.email, sbIp: p.sb_ip, paused: !p.active, balance: await balance(s.holdDays, Number(p.id)) });
    }
    const first = ps[0] ? Number(ps[0].id) : null;
    const names = new Map(ps.map((p) => [String(p.id), p.name]));
    const pr = await pool.query(`SELECT * FROM partner_payouts ORDER BY id DESC LIMIT 60`);
    const last = await getSetting("payout_last_result");
    const c = PY();
    return {
      ok: true, settings: s, payoneer: { configured: payoneerConfigured(), sandbox: c.sandbox }, stripe: { configured: stripeConfigured(), test: String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test") }, airwallex: { configured: airwallexConfigured(), sandbox: AW().sandbox }, partners, partner: partners[0] || null,
      balance: await balance(s.holdDays), next: nextRunText(s), last: last ? JSON.parse(last) : null,
      payouts: (pr.rows as PayoutRow[]).map((x) => ({ ...payoutView(x), partner: names.get(String(x.partner_id ?? first)) || "" })),
    };
  });
  app.post("/admin/payouts/settings", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (typeof b.auto === "boolean") await setSetting("payout_auto", b.auto ? "1" : "0");
    if (typeof b.recheck === "boolean") await setSetting("payout_recheck", b.recheck ? "1" : "0");
    for (const [k, key, lo, hi] of [["holdDays", "payout_hold_days", 0, 30], ["minUsd", "payout_min_usd", 0, 5000], ["hour", "payout_hour", 0, 23]] as const) {
      const n = Number(b[k]);
      if (b[k] != null && Number.isFinite(n)) await setSetting(key, String(Math.max(lo, Math.min(hi, Math.round(n)))));
    }
    return { ok: true, settings: await payoutSettings() };
  });
  app.post("/admin/payouts/run", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const r = await runPayouts((m) => app.log.info(m), true);
    await setSetting("payout_last_result", JSON.stringify({ at: new Date().toISOString(), ...r })).catch(() => {});
    return { ...r, ok: true, success: r.ok };
  });
  app.post("/admin/payouts/remail", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    try { await mailGutschrift(Number(b.id)); return { ok: true }; } catch (e) { return reply.code(502).send({ ok: false, error: (e as Error).message }); }
  });
}
