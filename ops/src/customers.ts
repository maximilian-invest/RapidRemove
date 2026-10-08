/* Kunden-Dashboard (vorerst NUR Einzelbewertungen).
 *
 * Nach der Bestellung bekommt jeder Bewertungs-Kunde ein Konto (E-Mail + Passwort,
 * per Auftragsbestätigung). Im Dashboard sieht er je Bewertung den Status
 * (in Prüfung → angenommen/in Arbeit → gelöscht | nicht löschbar | Spezial-Software
 * möglich), offene Zahlungen (Anzahlung, Spezial-Software, Rechnung) als Buttons.
 * Status kommt aus dem raw-JSON der Bestellung, das die Admin-Aktionen ohnehin
 * schreiben (reviewsAccepted, reviewsSoftware, reviewsRemovedAll, reviewsPayments).
 * KEINE Partner-Daten nach außen.
 */
import crypto from "node:crypto";
import { isTestEmail } from "./testAccounts";
import type { FastifyInstance } from "fastify";
import { pool, setOrderRawField, insertEvent } from "./db";
import { notifyTeam } from "./notify";
import { notifyPartner } from "./partnerNotify";
import { ensureReviewsAmountLink } from "./reviewsSetup";
import { hasSecretKey, stripeList } from "./integrations/stripe";
import { wiseAccounts, wiseBankFor } from "./wiseAccounts";
import { quoteReviews, reviewDiscountPct, REVIEW_BASE, REVIEW_OLD_SURCHARGE, REVIEW_NOTEXT_PRICE, chatPctOf } from "./reviewsPricing";
import { logCustEvent, deviceOf } from "./custTrack";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
export const DASH_URL = `${SITE_URL}/my-reviews`;

export async function initCustomerTables(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_accounts (
      email      text PRIMARY KEY,
      pass_hash  text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz
    )
  `);
  // Vorheriger Partner-Status je Bewertung (Kunde sieht „In Bearbeitung → …" in Mail + Dashboard).
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS prev_status text`).catch(() => {});
  // Sammel-Benachrichtigung: 5 Minuten nach der LETZTEN Partner-Änderung eines Auftrags eine Mail.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_notify (
      order_id   text PRIMARY KEY,
      due_at     timestamptz NOT NULL,
      keys       jsonb NOT NULL DEFAULT '[]'::jsonb
    )
  `);
  await pool.query(`ALTER TABLE cust_notify ADD COLUMN IF NOT EXISTS changes jsonb NOT NULL DEFAULT '{}'::jsonb`);
  // Einmalige Einladung ins Dashboard (je E-Mail-Adresse höchstens einmal).
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_invites (email text PRIMARY KEY, sent_at timestamptz NOT NULL DEFAULT now())`);
  // Persönliche Login-Links in den Mails („Dashboard öffnen" → direkt eingeloggt, 30 Tage, mehrfach nutzbar).
  // „Passwort vergessen": einmaliger Link (60 Min.), nur der SHA-256-Hash liegt in der DB.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_reset (
      token_hash text PRIMARY KEY,
      email      text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL,
      used_at    timestamptz
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_magic (
      token_hash text PRIMARY KEY,
      email      text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_sessions (
      token_hash text PRIMARY KEY,
      email      text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )
  `);
  // Admin-Ansicht („Als Kunde ansehen"): Sitzungen ohne Tracking + Audit-Trail (getrennt von customer_events).
  await pool.query(`ALTER TABLE cust_sessions ADD COLUMN IF NOT EXISTS impersonation boolean NOT NULL DEFAULT false`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_impersonations (
      id bigserial PRIMARY KEY, code_hash text UNIQUE NOT NULL, email text NOT NULL, order_id text,
      created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, used_at timestamptz, session_hash text)`);
}

const norm = (e: unknown) => String(e || "").trim().toLowerCase().slice(0, 200);
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32);
  return `s1$${salt.toString("hex")}$${h.toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [v, saltHex, hashHex] = String(stored || "").split("$");
  if (v !== "s1" || !saltHex || !hashHex) return false;
  const h = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 32);
  const want = Buffer.from(hashHex, "hex");
  return want.length === h.length && crypto.timingSafeEqual(want, h);
}
/** Gut lesbares Passwort (ohne 0/O/1/l/I), z. B. "k7mq-Xp4r-9tzd". */
export function newPassword(): string {
  const a = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => Array.from(crypto.randomBytes(4)).map((b) => a[b % a.length]).join("");
  return `${pick()}-${pick()}-${pick()}`;
}

/** Konto anlegen, falls es noch keins gibt. Liefert das Klartext-Passwort NUR beim Anlegen. */
export async function ensureCustomerAccount(email: string): Promise<{ created: boolean; password?: string } | null> {
  if (!pool) return null;
  const e = norm(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return null;
  const pw = newPassword();
  const r = await pool.query(`INSERT INTO cust_accounts (email, pass_hash) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING RETURNING email`, [e, hashPassword(pw)]);
  return r.rowCount ? { created: true, password: pw } : { created: false };
}
/** Neues Passwort setzen (Passwort vergessen). */
export async function resetCustomerPassword(email: string): Promise<string | null> {
  if (!pool) return null;
  const pw = newPassword();
  const r = await pool.query(`UPDATE cust_accounts SET pass_hash=$2 WHERE email=$1 RETURNING email`, [norm(email), hashPassword(pw)]);
  if (!r.rowCount) return null;
  await pool.query(`DELETE FROM cust_sessions WHERE email=$1`, [norm(email)]);
  return pw;
}

async function sessionEmail(token: unknown): Promise<string | null> {
  if (!pool) return null;
  const t = String(token || "");
  if (t.length < 20) return null;
  const r = await pool.query(`SELECT email FROM cust_sessions WHERE token_hash=$1 AND expires_at > now()`, [sha(t)]);
  return r.rows[0]?.email ?? null;
}

/** Persönlicher Dashboard-Link für Mails: legt bei Bedarf das Konto an und hängt einen Login-Code an
 *  (30 Tage gültig) → Kunde ist mit einem Klick eingeloggt, auch ohne Passwort. */
export async function dashLink(email: string, lang?: string | null): Promise<string> {
  const e = norm(email);
  const l = lang && lang !== "de" ? `&lang=${encodeURIComponent(String(lang).slice(0, 2))}` : lang === "de" ? "&lang=de" : "";
  if (!pool || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return DASH_URL;
  try {
    await ensureCustomerAccount(e);
    const k = crypto.randomBytes(24).toString("base64url");
    await pool.query(`INSERT INTO cust_magic (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '30 days')`, [sha(k), e]);
    return `${DASH_URL}?k=${k}${l}`;
  } catch { return DASH_URL; }
}

/** Für Passkeys: E-Mail zur Sitzung bzw. neue Sitzung (wie beim Passwort-Login). */
export const customerSessionEmail = (t: unknown) => sessionEmail(t);
/** Sitzung inkl. Kennzeichen „Admin-Ansicht" (nicht tracken, keine Zahlungen). */
export async function customerSessionInfo(token: unknown): Promise<{ email: string; imp: boolean } | null> {
  if (!pool) return null;
  const t = String(token || "");
  if (t.length < 20) return null;
  const r = await pool.query(`SELECT email, impersonation FROM cust_sessions WHERE token_hash=$1 AND expires_at > now()`, [sha(t)]);
  return r.rows[0] ? { email: r.rows[0].email, imp: !!r.rows[0].impersonation } : null;
}
export async function createCustomerSession(email: string): Promise<string | null> {
  if (!pool) return null;
  const ex = await pool.query(`SELECT 1 FROM cust_accounts WHERE email=$1`, [norm(email)]);
  if (!ex.rowCount) return null;
  const token = crypto.randomBytes(24).toString("base64url");
  await pool.query(`INSERT INTO cust_sessions (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 days')`, [sha(token), norm(email)]);
  await pool.query(`UPDATE cust_accounts SET last_login=now() WHERE email=$1`, [norm(email)]);
  return token;
}

/* ---- Zahlungen (raw.reviewsPayments) ---- */
export type PayRef = { o: string; k: string };
export type CustPayment = {
  id: string; kind: "deposit" | "software" | "invoice"; amount: number; cur: string; url: string; n?: number;
  keys?: string[];      // Bewertungen DIESES Auftrags, die die Zahlung abdeckt
  refs?: PayRef[];      // Bewertungen ANDERER Aufträge desselben Kunden (Dashboard: „alles zahlen")
  via?: "dashboard" | "admin" | "autopay";
  created: string; paid?: string | null;
};
/* Automatisch bezahlen (autopay.ts registriert sich hier – vermeidet zirkuläre Importe). */
export type AutoCharged = { amount: number; cur: string; label: string; invoiceUrl: string };
export const autopayHooks: {
  charge?: (email: string) => Promise<AutoCharged | null>;
  saved?: (email: string) => Promise<boolean>; // gültige Zahlungsart hinterlegt
  info?: (email: string) => Promise<{ available: boolean; test?: boolean; saved: { label: string; mode: string; type: string | null; error: string | null } | null }>;
} = {};
export const newPayId = () => crypto.randomBytes(6).toString("hex");
/** Stripe-Payment-Link mit eindeutiger Zuordnung (client_reference_id landet in checkout.session.completed). */
export const withRef = (url: string, id: string) => (url ? `${url}${url.includes("?") ? "&" : "?"}client_reference_id=rr_${id}` : url);

export async function addOrderPayment(orderId: string, p: Omit<CustPayment, "id" | "created" | "paid"> & { id?: string }): Promise<string | null> {
  if (!pool || !orderId || !p.url) return null;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [orderId]);
  const list: CustPayment[] = Array.isArray(r.rows[0]?.raw?.reviewsPayments) ? r.rows[0].raw.reviewsPayments : [];
  const id = p.id || newPayId();
  list.push({ ...p, id, created: new Date().toISOString(), paid: null });
  await setOrderRawField(orderId, "reviewsPayments", list.slice(-40));
  return id;
}

/** Bestätigter Software-Fall: so lange ist der Platz reserviert (Countdown im Dashboard, Erinnerung 1 Std. vorher). */
export const SW_HOLD_H = 5;
export const SW_NOTE_PAID = "Kunde hat die Software-Vorauszahlung bezahlt (Dashboard) → bitte starten";
export const SW_NOTE_DECLINED = "Kunde hat die Spezial-Software abgelehnt (Dashboard)";
/** Kunde mit hinterlegter Zahlungsart hat zugestimmt – keine Vorauszahlung, Abbuchung erst bei Erfolg. */
export const SW_NOTE_APPROVED = "Kunde hat zugestimmt – zahlt bei Erfolg (hinterlegte Zahlungsart) → bitte starten";
const appendNote = (col: string, i: number) => `${col} = CASE WHEN COALESCE(${col},'')='' THEN $${i} ELSE ${col} || ' · ' || $${i} END`;

async function rawOf(orderId: string): Promise<Record<string, unknown> | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [orderId]);
  return r.rows[0] ? ((r.rows[0].raw || {}) as Record<string, unknown>) : null;
}
type Decision = { d: "accepted" | "declined"; at: string; def?: boolean }; // def = zugestimmt ohne Vorauszahlung (Abbuchung bei Erfolg)
async function setDecisions(orderId: string, keys: string[], d: Decision["d"], def = false): Promise<void> {
  const raw = await rawOf(orderId);
  if (!raw) return;
  const dec = { ...((raw.reviewsSwDecision as Record<string, Decision>) || {}) };
  for (const k of keys) dec[k] = { d, at: new Date().toISOString(), ...(def ? { def: true } : {}) };
  await setOrderRawField(orderId, "reviewsSwDecision", dec);
}
async function addPaidKeys(orderId: string, keys: string[]): Promise<void> {
  const raw = await rawOf(orderId);
  if (!raw || !keys.length) return;
  const prev: string[] = Array.isArray(raw.reviewsPaidKeys) ? (raw.reviewsPaidKeys as string[]) : [];
  await setOrderRawField(orderId, "reviewsPaidKeys", [...new Set([...prev, ...keys])]);
}

/** Bezahlte Dashboard-/Admin-Zahlung umsetzen: Rechnung → Bewertungen bezahlt; Software → angenommen + Partner-Aufgabe auf „Working". */
async function applyPaid(orderId: string, p: CustPayment): Promise<void> {
  if (!pool) return;
  const groups = new Map<string, string[]>();
  const add = (o: string, k: string) => { if (!groups.has(o)) groups.set(o, []); groups.get(o)!.push(k); };
  for (const k of p.keys || []) add(orderId, k);
  for (const r of p.refs || []) add(r.o, r.k);
  if (p.kind === "software" && !groups.size) {
    // Alt-Zahlung (Startbestätigung) ohne Schlüssel → alle Software-Bewertungen des Auftrags.
    const raw = await rawOf(orderId);
    for (const it of (Array.isArray(raw?.reviewsSoftware) ? (raw!.reviewsSoftware as Item[]) : [])) add(orderId, keyOf(it));
  }
  if (p.kind === "invoice") {
    for (const [o, ks] of groups) await addPaidKeys(o, ks);
    for (const o of groups.keys()) void evaluatePayHold(o).catch(() => {}); // Zwischenzahlung da → Partner macht weiter
    if (p.via === "dashboard") void notifyTeam(`Bezahlt · ${p.amount} ${String(p.cur).toUpperCase()}`, `Kunde im Dashboard · ${[...groups.values()].flat().length} gelöschte Bewertung(en) · Auftrag ${orderId}`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
    return;
  }
  if (p.kind !== "software") return;
  let n = 0;
  const paidCodes: string[] = [];
  for (const [o, ks] of groups) {
    await setDecisions(o, ks, "accepted");
    const u = await pool.query(
      `UPDATE partner_tasks SET status='working', working_since=now(), touched_at=COALESCE(touched_at, now()), updated_at=now(), removed_at=NULL, ${appendNote("admin_note", 3)}
        WHERE order_id=$1 AND item_key = ANY($2::text[]) AND status IN ('new','software','not_possible','cancelled')`,
      [o, ks, SW_NOTE_PAID],
    ).catch(() => ({ rowCount: 0 }));
    n += ks.length;
    await insertEvent({ orderId: o, type: "note", title: "Kunde: Software-Vorauszahlung bezahlt", detail: `${ks.length} Bewertung(en) · Partner-Aufgabe(n) → Working (${u.rowCount ?? 0})`, auto: true }).catch(() => {});
  }
  if (n) {
    const test = isTestEmail((await pool.query(`SELECT email FROM orders WHERE id=$1`, [orderId]).catch(() => ({ rows: [] as { email?: string }[] }))).rows[0]?.email);
    for (const [o, ks] of groups) {
      const c = await pool.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND item_key = ANY($2::text[]) ORDER BY id`, [o, ks]).catch(() => ({ rows: [] as { code: string }[] }));
      paidCodes.push(...c.rows.map((x) => x.code).filter(Boolean));
    }
    // Design: „Customer paid" · „{RV-id} · Software approved – start now."
    void notifyPartner(`${test ? "TEST · " : ""}Customer paid`, `${paidCodes.slice(0, 4).join(", ") || `${n} review${n > 1 ? "s" : ""}`} · Software approved – start now.`, undefined, test);
  }
  if (n) void notifyTeam(`Software bezahlt · ${p.amount} ${String(p.cur).toUpperCase()}`, `${n} Bewertung(en) · Auftrag ${orderId} · Partner startet (In Arbeit)`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
}

/** Software-Fall OHNE Vorauszahlung freigeben (Kunde hat Zahlungsart hinterlegt): Partner startet sofort, abgebucht wird bei Erfolg. */
export async function approveSoftwareDeferred(groups: Map<string, string[]>, why: string): Promise<number> {
  if (!pool) return 0;
  let n = 0; const codes: string[] = []; let test = false; let first = "";
  for (const [o, ks] of groups) {
    if (!ks.length) continue;
    first = first || o;
    await setDecisions(o, ks, "accepted", true);
    const u = await pool.query(
      `UPDATE partner_tasks SET status='working', working_since=now(), touched_at=COALESCE(touched_at, now()), updated_at=now(), removed_at=NULL, ${appendNote("admin_note", 3)}
        WHERE order_id=$1 AND item_key = ANY($2::text[]) AND status IN ('new','software','not_possible') RETURNING code, test`,
      [o, ks, SW_NOTE_APPROVED],
    ).catch(() => ({ rows: [] as { code: string; test: boolean }[], rowCount: 0 }));
    u.rows.forEach((x) => { if (x.code) codes.push(x.code); if (x.test) test = true; });
    n += ks.length;
    await insertEvent({ orderId: o, type: "note", title: `Software freigegeben ohne Vorauszahlung (${why})`, detail: `${ks.length} Bewertung(en) · Partner startet · Abbuchung von der hinterlegten Zahlungsart erst bei Erfolg`, auto: true }).catch(() => {});
  }
  if (n) {
    void notifyPartner(`${test ? "TEST · " : ""}Customer approved`, `${codes.slice(0, 4).join(", ") || `${n} review${n > 1 ? "s" : ""}`} · Software approved – start now.`, undefined, test);
    void notifyTeam(`${test ? "TEST · " : ""}Software freigegeben (zahlt bei Erfolg)`, `${n} Bewertung(en) · Auftrag ${first} · Partner startet`, `${SITE_URL}/admin?order=${encodeURIComponent(first)}`, { kind: "customer" });
  }
  return n;
}
/** Zahlungsart neu hinterlegt → bestätigte Software-Fälle mit Zustimmung bei der Bestellung (pre), die noch auf die Vorauszahlung warten, sofort starten. */
export async function approvePendingPre(email: string): Promise<number> {
  const { orders } = await loadCustomerOrders(email.toLowerCase());
  const g = new Map<string, string[]>();
  for (const o of orders) for (const it of o.items) if (it.status === "software" && it.pre) g.set(o.id, [...(g.get(o.id) || []), it.key]);
  return g.size ? approveSoftwareDeferred(g, "Zahlungsart hinterlegt") : 0;
}

/** Stripe-Zahlung der passenden offenen Zahlung zuordnen: zuerst über client_reference_id (rr_<id>), sonst E-Mail + Betrag. */
export async function markReviewPaymentPaid(email: string, amountMajor: number, ref?: string | null): Promise<{ orderId: string; kind: string } | null> {
  if (!pool) return null;
  const m = /^rr_([a-f0-9]{8,16})$/.exec(String(ref || ""));
  let rows: { id: string; raw: Record<string, unknown> }[] = [];
  if (m) {
    const r = await pool.query(`SELECT id, raw FROM orders WHERE raw->'reviewsPayments' @> $1::jsonb LIMIT 1`, [JSON.stringify([{ id: m[1] }])]);
    rows = r.rows;
  }
  if (!rows.length && email && amountMajor) {
    const r = await pool.query(
      `SELECT id, raw FROM orders WHERE lower(email)=lower($1) AND service='reviews' AND raw ? 'reviewsPayments' ORDER BY created_at DESC LIMIT 10`,
      [email],
    );
    rows = r.rows;
  }
  for (const row of rows) {
    const list: CustPayment[] = Array.isArray(row.raw?.reviewsPayments) ? (row.raw.reviewsPayments as CustPayment[]) : [];
    const hit = m && list.some((p) => p.id === m[1])
      ? list.find((p) => p.id === m[1] && !p.paid)
      : list.find((p) => !p.paid && Math.abs(Number(p.amount) - amountMajor) < 0.01);
    if (hit) {
      hit.paid = new Date().toISOString();
      await setOrderRawField(row.id, "reviewsPayments", list);
      await applyPaid(row.id, hit).catch(() => {});
      const em = email || (await pool.query(`SELECT email FROM orders WHERE id=$1`, [row.id]).catch(() => ({ rows: [] as { email?: string }[] }))).rows[0]?.email || "";
      void logCustEvent(em, "payment_success", `${hit.kind === "software" ? "Software-Vorauszahlung" : "Rechnung"} · ${hit.amount} ${String(hit.cur || "").toUpperCase()}`, { amount: hit.amount, cur: hit.cur, kind: hit.kind }, { orderId: row.id });
      return { orderId: row.id, kind: hit.kind };
    }
  }
  return null;
}

/** Stripe-Abgleich der Dashboard-Zahlungen über client_reference_id (rr_<id>) – unabhängig vom Webhook.
 *  Grund (07.10.2026, RR-583155): Zahlung kam nur als invoice.paid an, checkout.session.completed fehlte →
 *  Software-Vorauszahlung blieb offen, Partner bekam kein „Customer paid". Läuft alle 2 Min., nur solange offene Zahlungen existieren. */
export async function pollReviewPayments(log: (o: unknown, m: string) => void = () => {}): Promise<number> {
  if (!pool || !hasSecretKey()) return 0;
  const r = await pool.query(`SELECT id, raw->'reviewsPayments' AS p FROM orders WHERE service='reviews' AND raw ? 'reviewsPayments' AND COALESCE(status,'') <> 'storniert' AND created_at > now() - interval '120 days'`);
  const open = new Map<string, string>();
  let since = Infinity;
  for (const row of r.rows as { id: string; p: CustPayment[] | null }[]) {
    for (const x of Array.isArray(row.p) ? row.p : []) {
      const t = new Date(String((x as { created?: string }).created || "")).getTime();
      if (x.paid || !x.id || !/stripe\.com/.test(String(x.url || "")) || !Number.isFinite(t) || Date.now() - t > 14 * 864e5) continue;
      open.set(x.id, row.id); since = Math.min(since, t);
    }
  }
  if (!open.size) return 0;
  const sessions = await stripeList<{ client_reference_id?: string | null; payment_status?: string; amount_total?: number; currency?: string; customer_details?: { email?: string } | null; customer_email?: string | null }>(
    `checkout/sessions?limit=100&created%5Bgte%5D=${Math.floor(since / 1000) - 120}`, 5);
  let n = 0;
  for (const ses of sessions) {
    const m = /^rr_([a-f0-9]{8,16})$/.exec(String(ses.client_reference_id || ""));
    if (!m || !open.has(m[1]) || (ses.payment_status !== "paid" && ses.payment_status !== "no_payment_required")) continue;
    const email = ses.customer_details?.email || ses.customer_email || "";
    const amt = Number(ses.amount_total || 0) / 100;
    const hit = await markReviewPaymentPaid(email, amt, ses.client_reference_id);
    if (!hit) continue;
    n++;
    const lbl: Record<string, string> = { deposit: "Anzahlung (ohne Text)", software: "Software-Vorauszahlung", invoice: "Rechnung" };
    await insertEvent({ orderId: hit.orderId, type: "pay", title: `Bezahlt: ${lbl[hit.kind] || hit.kind}`, detail: `${amt} ${String(ses.currency || "").toUpperCase()} via Stripe (${email}) · Stripe-Abgleich`, auto: true }).catch(() => {});
    log({ orderId: hit.orderId, kind: hit.kind, amt }, "Dashboard-Zahlung per Stripe-Abgleich zugeordnet");
  }
  return n;
}

/** Admin hat den Auftrag manuell als bezahlt markiert (PayPal/Wise …) → abgerechnete Bewertungen gelten als bezahlt. */
export async function markOrderReviewsPaidManual(orderId: string): Promise<void> {
  const raw = await rawOf(orderId);
  if (!raw || !Array.isArray(raw.reviewItems)) return;
  const list: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
  const keys = new Set<string>();
  for (const p of list) if (p.kind === "invoice" && !p.paid) { p.paid = new Date().toISOString(); (p.keys || []).forEach((k) => keys.add(k)); }
  const rem: Item[] = Array.isArray(raw.reviewsRemovedAll) ? (raw.reviewsRemovedAll as Item[]) : [];
  rem.forEach((it) => keys.add(keyOf(it)));
  // Auch vom Partner gelöschte, aber noch nicht abgerechnete Bewertungen: Admin sagt „bezahlt" →
  // alles, was bis jetzt gelöscht ist, gilt als bezahlt (sonst bleibt es in „Zahlung offen" bzw. im Dashboard offen).
  if (pool) {
    const pr = await pool.query(`SELECT item_key FROM partner_tasks WHERE order_id=$1 AND status='removed' AND item_key IS NOT NULL`, [orderId]).catch(() => ({ rows: [] as { item_key: string }[] }));
    pr.rows.forEach((x) => keys.add(x.item_key));
  }
  await setOrderRawField(orderId, "reviewsPayments", list);
  await addPaidKeys(orderId, [...keys]);
  await evaluatePayHold(orderId).catch(() => null); // Zwischenzahlung erledigt → Partner macht weiter
}

/* ---- Status je Bewertung (für das Dashboard) ---- */
type Item = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean };
export const keyOf = (it: Item) => it.url || `${it.name || ""}|${it.text || ""}`;
/** Kunden-Status (Design-Handoff „Customer Dashboard"). */
export type ItemStatus = "new" | "working" | "removed" | "notpossible" | "software" | "sw_accepted" | "sw_declined" | "cancelled";
type PT = { status: string; since: string | null; removedAt?: string | null; changedAt?: string | null; prev?: string | null };
/** Partner-Status → Kunden-Status (für „vorher → jetzt"). */
export const partnerToDash = (s: string): ItemStatus => (({ new: "new", working: "working", removed: "removed", not_possible: "notpossible", software: "software", cancelled: "cancelled" } as Record<string, ItemStatus>)[s] || "new");
type OrderRow = { id: string; created_at: string; status: string | null; pay: string | null; lang: string | null; country: string | null; profile: string | null; company: string | null; raw: Record<string, unknown> | null };

function orderView(o: OrderRow, partner: Map<string, PT> = new Map()) {
  const raw = (o.raw || {}) as Record<string, unknown>;
  const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
  const accepted: Item[] | null = Array.isArray(raw.reviewsAccepted) ? (raw.reviewsAccepted as Item[]) : null;
  const software: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
  const removed: Item[] = Array.isArray(raw.reviewsRemovedAll) ? (raw.reviewsRemovedAll as Item[]) : Array.isArray(raw.reviewsRemoved) ? (raw.reviewsRemoved as Item[]) : [];
  const payments: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
  const decisions = ((raw.reviewsSwDecision as Record<string, Decision>) || {});
  const swConfirmed = ((raw.reviewsSwConfirmed as Record<string, string>) || {});
  const paidKeys = new Set<string>(Array.isArray(raw.reviewsPaidKeys) ? (raw.reviewsPaidKeys as string[]) : []);
  const acc = new Set((accepted || []).map(keyOf));
  const sw = new Set(software.map(keyOf));
  const rem = new Set(removed.map(keyOf));
  const cur = o.country === "US" ? "usd" : "eur";
  const chatPct = chatPctOf(raw);
  const pct = Math.max(reviewDiscountPct(items.length), chatPct); // Mengen- oder Chat-Rabatt (der höhere)
  const disc = (v: number) => Math.round((v * (100 - pct)) / 100);
  // Software vorab bezahlt (Zustimmung OHNE def = nach Zahlung). Zustimmung mit def (hinterlegte Zahlungsart) = gestartet, aber erst bei Erfolg fällig.
  const swPaidFor = (k: string) => (decisions[k]?.d === "accepted" && !decisions[k]?.def) || payments.some((p) => p.kind === "software" && p.paid && (p.keys && p.keys.length ? p.keys.includes(k) : sw.has(k)));
  // Spezialverfahren wird voll im Voraus bezahlt (Software-Zahlung oder Vorauszahlung „ohne Text" aus der Startbestätigung).
  const prepaidFor = (k: string) => swPaidFor(k) || payments.some((p) => p.kind === "deposit" && p.paid && (p.keys && p.keys.length ? p.keys.includes(k) : true));
  // Bezahlt? 1) Dashboard/Webhook (reviewsPaidKeys) bzw. Zahlung mit Schlüssel, 2) Alt-Rechnungen ohne Schlüssel, 3) Auftrag bezahlt.
  const keyedInv = payments.filter((p) => p.kind === "invoice" && p.keys && p.keys.length);
  const legacyInv = payments.filter((p) => p.kind === "invoice" && !(p.keys && p.keys.length));
  const isPaid = (k: string) => {
    if (paidKeys.has(k) || keyedInv.some((p) => p.paid && p.keys!.includes(k))) return true;
    if (keyedInv.some((p) => !p.paid && p.keys!.includes(k))) return false;
    if (!rem.has(k)) return false; // vom Partner gelöscht, noch nicht abgerechnet
    if (legacyInv.length) return legacyInv.every((p) => !!p.paid);
    return o.pay === "paid";
  };
  const cancelled = o.status === "storniert";
  const view = items.map((it) => {
    const k = keyOf(it);
    const pt = partner.get(k);
    const ps = pt?.status;
    const dec = decisions[k]?.d;
    let status: ItemStatus;
    if (rem.has(k) || ps === "removed") status = "removed";
    else if (cancelled) status = "cancelled";
    else if (dec === "declined") status = "sw_declined";
    else if (swPaidFor(k) || decisions[k]?.d === "accepted") status = "sw_accepted";
    else if (ps === "software" || sw.has(k)) status = "software";
    else if (ps === "not_possible") status = "notpossible";
    else if (ps === "working") status = "working";
    else if (acc.has(k)) status = "working";
    else if (accepted) status = "notpossible";
    else status = "new";
    const special = !!it.nt || !!it.sw || sw.has(k) || swPaidFor(k) || decisions[k]?.d === "accepted";
    const price = special ? disc(REVIEW_NOTEXT_PRICE) : disc(it.old ? REVIEW_BASE + REVIEW_OLD_SURCHARGE : REVIEW_BASE);
    return {
      key: k, url: it.url || null, name: it.name || null, text: it.text || null, noText: !!it.nt || !String(it.text || "").trim(),
      status, since: ps === "working" ? pt?.since || null : null,
      removedAt: status === "removed" ? pt?.removedAt || null : null, changedAt: pt?.changedAt || null,
      prevStatus: pt?.prev && partnerToDash(pt.prev) !== status ? partnerToDash(pt.prev) : null,
      price, paid: status === "removed" ? (special ? prepaidFor(k) || isPaid(k) : isPaid(k)) : false, special, old: !!it.old,
      pre: !!it.nt || !!it.sw, // Software-Fall laut Partner-Regel: Kunde hat bei der Bestellung schon zugestimmt → nur noch zahlen
      // Bestätigter Software-Fall (bei Bestellung zugestimmt): Platz 5 Std. reserviert → Frist fürs Dashboard (Countdown).
      swDue: status === "software" && (it.nt || it.sw) && (swConfirmed[k] || pt?.changedAt) ? new Date(new Date(String(swConfirmed[k] || pt?.changedAt)).getTime() + SW_HOLD_H * 3600e3).toISOString() : null,
      waived: cancelled && status === "removed" && !(special ? prepaidFor(k) || isPaid(k) : isPaid(k)), // storniert → nichts mehr zu zahlen
    };
  });
  // Ganz stornierter Auftrag → keine offenen Zahlungen mehr (auch nicht für vorher gelöschte Bewertungen).
  const unpaid = cancelled ? [] : view.filter((v) => v.status === "removed" && !v.paid);
  // Normale Bewertungen wie die Rechnung (Mengenrabatt), Spezialverfahren (falls ausnahmsweise nicht vorausbezahlt) voll.
  const unpaidN = unpaid.filter((v) => !v.special);
  const toPay = (unpaidN.length ? quoteReviews(unpaidN.map((v) => ({ old: v.old })), cur, items.length, "rest", chatPct).total : 0)
    + unpaid.filter((v) => v.special).reduce((s, v) => s + v.price, 0);
  return {
    id: o.id, created: o.created_at, lang: o.lang, country: o.country, cur, business: o.company || o.profile || "", cancelled,
    payPref: raw.payPref === "wise" || raw.payPref === "paypal" ? (raw.payPref as string) : null, // Rabatt-Wunsch −10 %
    // Inhaber-Nachweis (4–5-Sterne-Bewertungen): pending/checking/rejected → Dashboard fordert den Upload an.
    hold: !!raw.payHold && !cancelled, // Zwischenzahlung nötig (Partner pausiert)
    holdCard: !!raw.payHold && !cancelled && (raw.payHold as { reason?: string }).reason === "autopay", // Pause wegen fehlgeschlagener Abbuchung
    payGate: !cancelled && (raw.payGate as { status?: string } | undefined)?.status === "pending", // wartet auf hinterlegte Zahlungsart
    verify: raw.verify && !cancelled ? { status: String((raw.verify as Record<string, unknown>).status || ""), reason: String((raw.verify as Record<string, unknown>).reason || ""), uploaded: !!(raw.verify as Record<string, unknown>).doc } : null,
    pct, swPrice: disc(REVIEW_NOTEXT_PRICE), swDeposit: disc(REVIEW_NOTEXT_PRICE), toPay, // swDeposit = Vorauszahlung = voller Preis
    items: view.map(({ special, old, ...v }) => v),
    // Bezahlte Zahlungen (Verlauf im Tab „Payments").
    history: payments.filter((p) => p.paid).map((p) => ({
      id: p.id, kind: p.kind, amount: p.amount, cur: p.cur, paid: p.paid, auto: p.via === "autopay", invoiceUrl: p.via === "autopay" ? p.url : null, n: p.n || (p.keys || []).length + (p.refs || []).length || null,
      names: (p.keys || []).map((k) => items.find((it) => keyOf(it) === k)?.name || "").filter(Boolean).slice(0, 3),
    })),
    // Offene Anzahlungen für bestellte Bewertungen ohne Text (Startbestätigung).
    deposits: payments.filter((p) => !cancelled && p.kind === "deposit" && !p.paid && p.url).map((p) => ({ id: p.id, amount: p.amount, cur: p.cur, url: p.url, n: p.n || null })),
  };
}
type OrderView = ReturnType<typeof orderView> & { kind?: "reviews" | "profile"; profileOrder?: ProfileInfo };
/** Profil-Löschung (und andere Nicht-Bewertungs-Aufträge) im Kunden-Dashboard. */
type ProfileInfo = {
  service: string; status: "new" | "working" | "removed" | "cancelled"; paid: boolean; open: number;
  amount: number; protAmount: number; protection: string | null; express: boolean; doneAt: string | null; addr: string | null;
};
type ProfileRow = OrderRow & { service: string | null; amount: number | string | null; prot_amount: number | string | null; protection: string | null; done_at: string | null };
function profileView(o: ProfileRow): OrderView {
  const raw = (o.raw || {}) as Record<string, unknown>;
  const cur = o.country === "US" ? "usd" : "eur";
  const st: ProfileInfo["status"] = o.status === "storniert" ? "cancelled" : o.status === "done" ? "removed" : o.status === "progress" ? "working" : "new";
  const amount = Number(o.amount) || 0;
  const protAmount = Number(o.prot_amount) || 0;
  const express = raw.express === true || raw.express === "true";
  const expressAmount = express ? Number(raw.expressAmount) || 0 : 0;
  const oneTime = amount + expressAmount + (o.protection === "lifetime" ? protAmount : 0);
  const paid = o.pay === "paid";
  const info: ProfileInfo = {
    service: o.service || "remove", status: st, paid, open: st === "removed" && !paid ? oneTime : 0,
    amount: oneTime, protAmount, protection: o.protection || null, express, doneAt: o.done_at || null, addr: (raw.addr as string) || null,
  };
  return {
    id: o.id, created: o.created_at, lang: o.lang, country: o.country, cur, business: o.profile || o.company || "", cancelled: st === "cancelled",
    pct: 0, swPrice: 0, swDeposit: 0, toPay: 0, items: [],
    history: paid && oneTime ? [{ id: "p-" + o.id, kind: "profile" as never, amount: oneTime, cur, paid: (o.done_at || o.created_at) as string, n: null as unknown as number, names: [] as string[] }] : [],
    deposits: [], kind: "profile", profileOrder: info,
  } as unknown as OrderView;
}

export async function loadCustomerOrders(email: string): Promise<{ name: string; lang: string; orders: OrderView[] }> {
  if (!pool) return { name: "", lang: "en", orders: [] };
  // Alle Aufträge des Kunden: Einzelbewertungen + Profil-Löschungen (Presse-Prüfungen „deindex" nicht).
  const all = await pool.query(
    `SELECT id, created_at, status, pay, lang, country, profile, company, name, raw, service, amount, prot_amount, protection, done_at FROM orders
      WHERE lower(email)=$1 AND COALESCE(service,'') <> 'deindex' ORDER BY created_at DESC LIMIT 60`,
    [email],
  );
  const r = { rows: all.rows.filter((x) => x.service === "reviews") };
  const ids = r.rows.map((x) => x.id);
  type PRow = { order_id: string; item_key: string; status: string; working_since: string | null; removed_at: string | null; updated_at: string | null; prev_status: string | null };
  const pt = ids.length
    ? await pool.query(`SELECT order_id, item_key, status, working_since, removed_at, updated_at, prev_status FROM partner_tasks WHERE order_id = ANY($1::text[]) AND status <> 'cancelled'`, [ids]).catch(() => ({ rows: [] as PRow[] }))
    : { rows: [] as PRow[] };
  const byOrder = new Map<string, Map<string, PT>>();
  for (const t of pt.rows as PRow[]) {
    if (!byOrder.has(t.order_id)) byOrder.set(t.order_id, new Map());
    byOrder.get(t.order_id)!.set(t.item_key, { status: t.status, since: t.working_since, removedAt: t.removed_at, changedAt: t.updated_at, prev: t.prev_status });
  }
  const views = all.rows.map((o) => (o.service === "reviews" ? ({ ...orderView(o, byOrder.get(o.id)), kind: "reviews" } as OrderView) : profileView(o as ProfileRow)));
  return { name: all.rows[0]?.name || "", lang: all.rows[0]?.lang || "en", orders: views };
}

/** Laufen noch Aufträge (in Bearbeitung, wartend, offen zu zahlen)? → hinterlegte Zahlungsart darf nicht entfernt werden, nur getauscht. */
export function ordersRunning(orders: OrderView[]): boolean {
  return orders.some((o) => !o.cancelled && ((Number(o.toPay) || 0) > 0 || !!(o as { payGate?: boolean }).payGate
    || o.items.some((i) => ["new", "working", "software", "sw_accepted"].includes(i.status))));
}

/* ---- Routen ---- */
export function registerCustomerRoutes(app: FastifyInstance, hooks: { sendResetLink: (email: string, url: string, lang: string) => Promise<void> }): void {
  const hits = new Map<string, number[]>();
  const hourHits = new Map<string, number[]>();
  const limitedHour = (k: string, n: number) => {
    const now = Date.now(); const a = (hourHits.get(k) || []).filter((t) => now - t < 60 * 60_000);
    if (a.length >= n) { hourHits.set(k, a); return true; }
    a.push(now); hourHits.set(k, a); return false;
  };
  const limited = (ip: string, n: number) => {
    const now = Date.now(); const a = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
    if (a.length >= n) { hits.set(ip, a); return true; }
    a.push(now); hits.set(ip, a); return false;
  };

  app.post("/cust/login", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("login:" + req.ip, 20)) return reply.code(429).send({ ok: false, error: "too_many" });
    const email = norm(b.email);
    const r = await pool.query(`SELECT pass_hash FROM cust_accounts WHERE email=$1`, [email]);
    if (!r.rows[0] || !verifyPassword(String(b.password || "").trim(), r.rows[0].pass_hash)) return reply.code(401).send({ ok: false, error: "invalid" });
    const token = crypto.randomBytes(24).toString("base64url");
    await pool.query(`INSERT INTO cust_sessions (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 days')`, [sha(token), email]);
    await pool.query(`UPDATE cust_accounts SET last_login=now() WHERE email=$1`, [email]);
    void logCustEvent(email, "login", "Mit Passwort", { device: deviceOf(String(req.headers["user-agent"] || "")) });
    return { ok: true, token };
  });

  // Login über den persönlichen Link aus der Mail.
  app.post("/cust/magic", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("magic:" + req.ip, 30)) return reply.code(429).send({ ok: false, error: "too_many" });
    const k = String(b.k || "");
    if (k.length < 20) return reply.code(401).send({ ok: false, error: "invalid" });
    const r = await pool.query(`SELECT email FROM cust_magic WHERE token_hash=$1 AND expires_at > now()`, [sha(k)]);
    if (!r.rows[0]) return reply.code(401).send({ ok: false, error: "invalid" });
    const token = await createCustomerSession(r.rows[0].email);
    if (!token) return reply.code(401).send({ ok: false, error: "invalid" });
    void pool.query(`UPDATE cust_accounts SET last_login=now() WHERE email=$1`, [r.rows[0].email]).catch(() => {});
    void logCustEvent(r.rows[0].email, "login", "Über den Link aus der E-Mail", { device: deviceOf(String(req.headers["user-agent"] || "")) });
    return { ok: true, token };
  });

  // Admin-Ansicht einlösen: einmaliger Code (5 Min.) → Sitzung (2 Std.) mit impersonation=true. KEIN Login-Event.
  app.post("/cust/impersonate", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const k = String(b.k || "");
    if (k.length < 20) return reply.code(401).send({ ok: false, error: "invalid" });
    const r = await pool.query(`UPDATE admin_impersonations SET used_at=now() WHERE code_hash=$1 AND used_at IS NULL AND expires_at > now() RETURNING id, email`, [sha(k)]);
    if (!r.rows[0]) return reply.code(401).send({ ok: false, error: "invalid" });
    const token = crypto.randomBytes(24).toString("base64url");
    await pool.query(`INSERT INTO cust_sessions (token_hash, email, expires_at, impersonation) VALUES ($1,$2, now() + interval '2 hours', true)`, [sha(token), r.rows[0].email]);
    await pool.query(`UPDATE admin_impersonations SET session_hash=$2 WHERE id=$1`, [r.rows[0].id, sha(token)]);
    return { ok: true, token };
  });

  app.post("/cust/logout", async (req) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (pool && b.token) { const si = await customerSessionInfo(b.token); if (si && !si.imp) void logCustEvent(si.email, "logout", "Abgemeldet"); }
    if (pool && b.token) await pool.query(`DELETE FROM cust_sessions WHERE token_hash=$1`, [sha(String(b.token))]);
    return { ok: true };
  });

  app.post("/cust/me", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    const d = await loadCustomerOrders(email);
    const imp = !!(await customerSessionInfo(b.token))?.imp;
    // Wise-Zahler: Kontodaten (Railway WISE_BANK_DETAILS) nur an Kunden, die Wise gewählt haben.
    const hasWise = d.orders.some((o) => (o as { payPref?: string | null }).payPref === "wise");
    const wiseBank = hasWise ? wiseBankFor(email) : []; // gleiches Konto wie in der Löschbestätigung (Rotation je Kunde)
    const ap = autopayHooks.info ? await autopayHooks.info(email).catch(() => null) : null;
    return { ok: true, email, name: d.name, lang: d.lang, orders: d.orders, adminView: imp, wiseBank, autopay: ap?.saved || null, autopayAvailable: !!ap?.available, autopayTest: !!ap?.test, autopayLocked: ordersRunning(d.orders) };
  });

  /** Offene Zahlung wiederverwenden (gleiche Bewertungen + Betrag), sonst neuen Stripe-Link mit Referenz anlegen. */
  async function payLink(kind: "software" | "invoice", picks: PayRef[], amount: number, cur: "usd" | "eur", orders: OrderView[]): Promise<string> {
    if (!pool || !picks.length || !(amount > 0)) return "";
    const sig = (refs: PayRef[]) => refs.map((r) => r.o + "\u0001" + r.k).sort().join("\u0002");
    const want = sig(picks);
    for (const o of orders) {
      const raw = await rawOf(o.id);
      const list: CustPayment[] = Array.isArray(raw?.reviewsPayments) ? (raw!.reviewsPayments as CustPayment[]) : [];
      const hit = list.find((p) => p.kind === kind && !p.paid && p.url && Math.abs(Number(p.amount) - amount) < 0.01
        && sig([...(p.keys || []).map((k) => ({ o: o.id, k })), ...(p.refs || [])]) === want);
      if (hit) return hit.url;
    }
    if (!hasSecretKey()) return "";
    const link = await ensureReviewsAmountLink(amount, cur).catch((e) => { app.log.error({ err: e }, "Dashboard-Zahlungslink fehlgeschlagen"); return ""; });
    if (!link) return "";
    const primary = picks[0].o;
    const id = newPayId();
    const url = withRef(link, id);
    await addOrderPayment(primary, {
      id, kind, amount, cur, url, n: picks.length, via: "dashboard",
      keys: picks.filter((r) => r.o === primary).map((r) => r.k),
      refs: picks.filter((r) => r.o !== primary),
    });
    return url;
  }

  // Spezial-Software: Kunde entscheidet je Bewertung (oder alle): voll im Voraus zahlen oder ablehnen (kostenlos).
  app.post("/cust/software", async (req, reply) => {
    if ((await customerSessionInfo(((req.body || {}) as Record<string, unknown>).token))?.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (limited("sw:" + email, 40)) return reply.code(429).send({ ok: false, error: "too_many" });
    const decision = b.decision === "decline" ? "decline" : b.decision === "accept" ? "accept" : "";
    if (!decision) return reply.code(400).send({ ok: false, error: "decision" });
    const want = (Array.isArray(b.items) ? b.items : []).slice(0, 100).map((x) => (x || {}) as Record<string, unknown>).map((x) => ({ o: String(x.orderId || ""), k: String(x.key || "") }));
    const { orders } = await loadCustomerOrders(email);
    const byId = new Map(orders.map((o) => [o.id, o]));
    // Nur eigene Bewertungen, die gerade auf „Needs software" stehen.
    let picks = want.filter((w) => byId.get(w.o)?.items.some((it) => it.key === w.k && it.status === "software"));
    picks = picks.filter((p, i) => picks.findIndex((q) => q.o === p.o && q.k === p.k) === i);
    if (!picks.length) return reply.code(400).send({ ok: false, error: "nothing" });
    if (decision === "decline") {
      const groups = new Map<string, string[]>();
      for (const p of picks) { if (!groups.has(p.o)) groups.set(p.o, []); groups.get(p.o)!.push(p.k); }
      for (const [o, ks] of groups) {
        await setDecisions(o, ks, "declined");
        await pool.query(
          // Bleibt beim Partner unter „Software" sichtbar, mit dem Zusatz „Customer declined deletion".
          `UPDATE partner_tasks SET status='software', updated_at=now(), ${appendNote("admin_note", 3)}
            WHERE order_id=$1 AND item_key = ANY($2::text[]) AND status IN ('new','working','software','not_possible') AND paid_at IS NULL`,
          [o, ks, SW_NOTE_DECLINED],
        ).catch(() => {});
        await insertEvent({ orderId: o, email, type: "note", title: "Kunde: Spezial-Software abgelehnt (Dashboard)", detail: `${ks.length} Bewertung(en) · Partner-Aufgabe(n) storniert`, auto: true }).catch(() => {});
      }
      const dc: string[] = [];
      for (const [o, ks] of groups) {
        const c = await pool.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND item_key = ANY($2::text[]) ORDER BY id`, [o, ks]).catch(() => ({ rows: [] as { code: string }[] }));
        dc.push(...c.rows.map((x) => x.code).filter(Boolean));
      }
      void logCustEvent(email, "software_decline", `Spezial-Software abgelehnt · ${picks.length} Bewertung(en)`, null, { orderId: picks[0].o });
      void notifyPartner(`${isTestEmail(email) ? "TEST · " : ""}Customer declined`, `${dc.slice(0, 4).join(", ") || `${picks.length} review${picks.length > 1 ? "s" : ""}`} · Keeps the review – nothing to do.`, undefined, isTestEmail(email));
      void notifyTeam(`Software abgelehnt · ${picks.length} Bewertung(en)`, `Kunde · ${[...groups.keys()].join(", ")} · nichts zu zahlen`, `${SITE_URL}/admin`, { kind: "customer" });
      return { ok: true, declined: picks.length };
    }
    const cur = byId.get(picks[0].o)!.cur as "usd" | "eur";
    // Zahlungsart hinterlegt → keine Vorauszahlung: zustimmen, Partner startet, Abbuchung erst bei Erfolg.
    if (autopayHooks.saved && await autopayHooks.saved(email).catch(() => false)) {
      const g = new Map<string, string[]>();
      for (const p of picks) g.set(p.o, [...(g.get(p.o) || []), p.k]);
      const n = await approveSoftwareDeferred(g, "Kunde im Dashboard");
      const amt = picks.reduce((s, p) => s + byId.get(p.o)!.swPrice, 0);
      void logCustEvent(email, "software_accept", `Spezial-Software zugestimmt · ${picks.length} Bewertung(en) · zahlt bei Erfolg`, { amount: amt, cur, n: picks.length, deferred: true }, { orderId: picks[0].o });
      return { ok: true, deferred: true, n, amount: amt, cur };
    }
    picks = picks.filter((p) => byId.get(p.o)!.cur === cur);
    const amount = picks.reduce((s, p) => s + byId.get(p.o)!.swDeposit, 0);
    const url = await payLink("software", picks, amount, cur, orders);
    if (!url) return reply.code(503).send({ ok: false, error: "payment_unavailable" });
    void notifyTeam(`Software-Zahlung geöffnet · ${amount} ${cur.toUpperCase()}`, `${[...new Set(picks.map((p) => byId.get(p.o)!.business || p.o))].join(", ")} · ${picks.length} Bewertung(en)`, `${SITE_URL}/admin`, { kind: "customer" });
    void logCustEvent(email, "payment_open", `Software-Vorauszahlung · ${amount} ${cur.toUpperCase()}`, { amount, cur, kind: "software", n: picks.length }, { orderId: picks[0].o });
    await insertEvent({ orderId: picks[0].o, email, type: "note", title: "Kunde: Software-Vorauszahlung geöffnet (Dashboard)", detail: `${picks.length} Bewertung(en) · ${amount} ${cur.toUpperCase()}`, auto: true }).catch(() => {});
    return { ok: true, url, amount, cur, n: picks.length };
  });

  // „Pay": ein Checkout für alle gelöschten, noch unbezahlten Bewertungen.
  app.post("/cust/pay", async (req, reply) => {
    if ((await customerSessionInfo(((req.body || {}) as Record<string, unknown>).token))?.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (limited("pay:" + email, 40)) return reply.code(429).send({ ok: false, error: "too_many" });
    const { orders } = await loadCustomerOrders(email);
    const due = orders.filter((o) => o.toPay > 0);
    if (!due.length) return reply.code(400).send({ ok: false, error: "nothing" });
    // only:"card" → nur Aufträge OHNE Wise-/PayPal-Wunsch (die zahlt der Kunde separat mit −10 %).
    const viaOf = (o: { payPref?: string | null }) => (o.payPref === "wise" && wiseAccounts().length ? "wise" : o.payPref === "paypal" ? "paypal" : "card");
    const pool0 = b.only === "card" ? due.filter((o) => viaOf(o as { payPref?: string | null }) === "card") : due;
    if (!pool0.length) return reply.code(400).send({ ok: false, error: "nothing" });
    const cur = pool0[0].cur as "usd" | "eur";
    const use = pool0.filter((o) => o.cur === cur);
    const picks: PayRef[] = use.flatMap((o) => o.items.filter((it) => it.status === "removed" && !it.paid).map((it) => ({ o: o.id, k: it.key })));
    const amount = use.reduce((s, o) => s + o.toPay, 0);
    const url = await payLink("invoice", picks, amount, cur, orders);
    if (!url) return reply.code(503).send({ ok: false, error: "payment_unavailable" });
    void notifyTeam(`Zahlung geöffnet · ${amount} ${cur.toUpperCase()}`, `${email} · ${picks.length} gelöschte Bewertung(en)`, `${SITE_URL}/admin`, { kind: "customer" });
    void logCustEvent(email, "payment_open", `Rechnung · ${amount} ${cur.toUpperCase()}`, { amount, cur, kind: "invoice", n: picks.length }, { orderId: use[0].id });
    return { ok: true, url, amount, cur, n: picks.length };
  });

  // Passwort vergessen: neues Passwort per Mail (Antwort immer gleich → keine Konto-Erkennung).
  // „Passwort vergessen": Mail mit einmaligem Link (60 Min.). Das alte Passwort bleibt gültig, bis ein neues
  // gesetzt wird (niemand kann einen Kunden durch Anfordern aussperren). Antwort immer gleich und sofort →
  // keine Konto-Erkennung. Limits: 5/10 Min. je IP, 3/Std. je E-Mail.
  app.post("/cust/reset", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (limited("reset:" + req.ip, 5)) return reply.code(429).send({ ok: false, error: "too_many" });
    const email = norm(b.email);
    const lang = String(b.lang || "").slice(0, 2);
    if (pool && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !limitedHour("reset-mail:" + email, 3)) {
      void (async () => {
        // Bestandskunde ohne Konto (Link bekommen, aber nie Zugangsdaten) → Konto jetzt anlegen.
        const has = await pool!.query(`SELECT lang FROM orders WHERE lower(email)=$1 AND COALESCE(service,'') <> 'deindex' ORDER BY created_at DESC LIMIT 1`, [email]);
        if (has.rowCount) await ensureCustomerAccount(email);
        const acc = await pool!.query(`SELECT 1 FROM cust_accounts WHERE email=$1`, [email]);
        if (!acc.rowCount) return;
        const k = crypto.randomBytes(32).toString("base64url");
        await pool!.query(`INSERT INTO cust_reset (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 minutes')`, [sha(k), email]);
        const l = String(has.rows[0]?.lang || lang || "en");
        await hooks.sendResetLink(email, `${DASH_URL}?reset=${k}&lang=${encodeURIComponent(l)}`, l);
      })().catch((e) => app.log.error({ err: e }, "Passwort-Link-Mail fehlgeschlagen"));
    }
    return { ok: true };
  });

  // Link prüfen (vor dem Formular): gültig? (keine weiteren Daten)
  app.post("/cust/reset-check", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("rcheck:" + req.ip, 30)) return reply.code(429).send({ ok: false, error: "too_many" });
    const r = await pool.query(`SELECT 1 FROM cust_reset WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now()`, [sha(String(b.k || ""))]);
    return r.rowCount ? { ok: true } : reply.code(400).send({ ok: false, error: "invalid" });
  });

  // Neues Passwort setzen: Link einmalig, alle anderen Sitzungen + offenen Links ungültig, danach eingeloggt.
  app.post("/cust/reset-confirm", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("rconf:" + req.ip, 10)) return reply.code(429).send({ ok: false, error: "too_many" });
    const pw = String(b.password || "");
    if (pw.length < 8 || pw.length > 200) return reply.code(400).send({ ok: false, error: "password" });
    const r = await pool.query(
      `UPDATE cust_reset SET used_at=now() WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now() RETURNING email`,
      [sha(String(b.k || ""))],
    );
    const email = r.rows[0]?.email;
    if (!email) return reply.code(400).send({ ok: false, error: "invalid" });
    await pool.query(`UPDATE cust_accounts SET pass_hash=$2 WHERE email=$1`, [email, hashPassword(pw)]);
    await pool.query(`DELETE FROM cust_sessions WHERE email=$1`, [email]);
    await pool.query(`UPDATE cust_reset SET used_at=now() WHERE email=$1 AND used_at IS NULL`, [email]);
    await pool.query(`DELETE FROM cust_magic WHERE email=$1`, [email]); // alte Login-Links aus Mails ebenfalls ungültig
    const token = await createCustomerSession(email);
    return { ok: true, token };
  });

  // Eingeloggt: „Passwort ändern" → sicherer Link an die eigene Adresse (gleicher Ablauf).
  app.post("/cust/password-link", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (limitedHour("reset-mail:" + email, 3)) return reply.code(429).send({ ok: false, error: "too_many" });
    const k = crypto.randomBytes(32).toString("base64url");
    await pool.query(`INSERT INTO cust_reset (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 minutes')`, [sha(k), email]);
    const l = String(b.lang || "en").slice(0, 2);
    await hooks.sendResetLink(email, `${DASH_URL}?reset=${k}&lang=${encodeURIComponent(l)}`, l).catch((e) => app.log.error({ err: e }, "Passwort-Link-Mail fehlgeschlagen"));
    return { ok: true };
  });
}


/* ---- Partner-Änderungen → Kunden-Dashboard + Sammel-Mail (5 Min. nach der letzten Änderung) ---- */
export const NOTIFY_DELAY_MIN = 15; // bündelt, wenn der Partner mehrere Bewertungen hintereinander bearbeitet

/** Vom Partner-Board aufgerufen, wenn der Partner einen Status ändert.
 *  „software" → Bewertung erscheint im Dashboard als „Needs software"; der Kunde entscheidet dort
 *  (Anzahlung zahlen → Aufgabe geht auf Working, oder ablehnen → Aufgabe storniert).
 *  Zieht der Partner „software" zurück (bevor der Kunde entschieden/bezahlt hat), verschwindet das Angebot wieder. */
export async function partnerStatusChanged(
  orderId: string, itemKey: string | null, status: string,
  _deps?: { makeLink?: (amount: number, cur: "usd" | "eur") => Promise<string>; prev?: string | null },
): Promise<void> {
  if (!pool || !orderId) return;
  const r = await pool.query(`SELECT raw, email FROM orders WHERE id=$1 AND service='reviews'`, [orderId]);
  if (!r.rows[0]) return; // nur Einzelbewertungen
  const delayMin = isTestEmail(r.rows[0].email) ? 1 : NOTIFY_DELAY_MIN; // Testbestellung: Kunden-Update nach 1 Min. statt 15
  const raw = (r.rows[0].raw || {}) as Record<string, unknown>;
  const sw: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
  let fast = false;
  if (status === "software" && itemKey) {
    const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
    const it = items.find((x) => keyOf(x) === itemKey) || { url: /^https?:/.test(itemKey) ? itemKey : undefined };
    if (!sw.some((x) => keyOf(x) === itemKey)) await setOrderRawField(orderId, "reviewsSoftware", [...sw, { ...it, nt: true, sw: true }]);
    // Software-Fall, dem der Kunde bei der Bestellung schon zugestimmt hat: Partner hat bestätigt → 5-Stunden-Frist startet,
    // Zahlungsaufforderung geht gleich (1 Min.) raus statt erst nach 15 Min.
    const savedPm = it && (it.nt || it.sw) && autopayHooks.saved ? await autopayHooks.saved(String(r.rows[0].email || "")).catch(() => false) : false;
    if (savedPm) {
      // Zahlungsart hinterlegt + bei der Bestellung zugestimmt → keine 5-Std.-Vorauszahlung: sofort starten, Abbuchung bei Erfolg.
      await approveSoftwareDeferred(new Map([[orderId, [itemKey]]]), "bei Bestellung zugestimmt + Zahlungsart hinterlegt");
    } else if (it && (it.nt || it.sw)) {
      const conf = { ...((raw.reviewsSwConfirmed as Record<string, string>) || {}) };
      if (!conf[itemKey]) { conf[itemKey] = new Date().toISOString(); await setOrderRawField(orderId, "reviewsSwConfirmed", conf); }
      fast = true;
    }
  } else if (itemKey && ["new", "working", "not_possible"].includes(status) && sw.some((x) => keyOf(x) === itemKey)) {
    const dec = ((raw.reviewsSwDecision as Record<string, Decision>) || {})[itemKey];
    const pays: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
    const paid = pays.some((p) => p.kind === "software" && p.paid && (!p.keys?.length || p.keys.includes(itemKey)));
    if (!dec && !paid) await setOrderRawField(orderId, "reviewsSoftware", sw.filter((x) => keyOf(x) !== itemKey));
  }
  const prev = _deps?.prev || null;
  if (itemKey && prev) await pool.query(`UPDATE partner_tasks SET prev_status=$3 WHERE order_id=$1 AND item_key=$2`, [orderId, itemKey, prev]).catch(() => {});
  // Änderungen dieser Sammel-Mail: erstes „von", letztes „nach" je Bewertung.
  const ex = await pool.query(`SELECT changes FROM cust_notify WHERE order_id=$1`, [orderId]);
  const changes = { ...((ex.rows[0]?.changes as Record<string, { from: string | null; to: string }>) || {}) };
  if (itemKey) changes[itemKey] = { from: changes[itemKey]?.from ?? prev, to: status };
  // Sammel-Mail planen bzw. verschieben (Debounce).
  await pool.query(
    `INSERT INTO cust_notify (order_id, due_at, keys, changes) VALUES ($1, now() + ($2 || ' minutes')::interval, $3::jsonb, $4::jsonb)
     ON CONFLICT (order_id) DO UPDATE SET due_at = EXCLUDED.due_at, changes = EXCLUDED.changes,
       keys = (SELECT jsonb_agg(DISTINCT k) FROM jsonb_array_elements(cust_notify.keys || EXCLUDED.keys) k)`,
    [orderId, String(fast ? 1 : delayMin), JSON.stringify(itemKey ? [itemKey] : []), JSON.stringify(changes)],
  );
}

/* ---- Fortschritt + Zwischenzahlung (08.10.2026) ----
 * Bewertungen werden pro Löschung fällig. Erreicht der offene Betrag eines Auftrags PAY_HOLD_AMOUNT (Standard 400, in der
 * Währung des Auftrags) und liegt noch etwas beim Partner, pausiert der Auftrag: Partner bekommt „Order on hold" (kann nichts
 * Neues starten), Kunde sieht „Zwischenzahlung nötig". Nach der Zahlung (Betrag < Schwelle) geht es automatisch weiter. */
export const PAY_HOLD = () => Math.max(1, Number(process.env.PAY_HOLD_AMOUNT) || 400);
export type OrderProgress = { total: number; removed: number; inProgress: number; waiting: number; due: number; cur: string; hold: boolean; charged?: AutoCharged | null; cardFail?: string | null };
function progressOfView(view: ReturnType<typeof orderView>, raw: Record<string, unknown>): OrderProgress {
  const it = view.items.filter((i) => i.status !== "cancelled");
  return {
    total: it.length, removed: it.filter((i) => i.status === "removed").length,
    inProgress: it.filter((i) => ["new", "working", "sw_accepted"].includes(i.status)).length,
    waiting: it.filter((i) => i.status === "software").length,
    due: Number(view.toPay) || 0, cur: view.cur, hold: !!raw.payHold,
    // Pause wegen fehlgeschlagener automatischer Abbuchung → Mail zeigt „Zahlung fehlgeschlagen" statt „Zwischenzahlung".
    cardFail: raw.payHold && (raw.payHold as { reason?: string }).reason === "autopay" ? String((raw.payHold as { label?: string }).label || "") || "—" : null,
  };
}
async function loadView(orderId: string): Promise<{ row: OrderRow & { email: string; name: string | null; lang: string | null; country: string | null }; view: ReturnType<typeof orderView>; raw: Record<string, unknown> } | null> {
  if (!pool) return null;
  const o = await pool.query(`SELECT id, created_at, status, pay, lang, country, profile, company, name, email, raw FROM orders WHERE id=$1 AND service='reviews'`, [orderId]);
  const row = o.rows[0]; if (!row) return null;
  const pt = await pool.query(`SELECT item_key, status, working_since FROM partner_tasks WHERE order_id=$1 AND status <> 'cancelled'`, [orderId]);
  return { row, view: orderView(row, new Map(pt.rows.map((x) => [x.item_key, { status: x.status, since: x.working_since }]))), raw: (row.raw || {}) as Record<string, unknown> };
}
export async function orderProgress(orderId: string): Promise<OrderProgress | null> {
  const v = await loadView(orderId); return v ? progressOfView(v.view, v.raw) : null;
}
/** Zwischenzahlung prüfen: pausieren bzw. freigeben. Gibt den (neuen) Fortschritt zurück. */
export async function evaluatePayHold(orderId: string): Promise<OrderProgress | null> {
  const v = await loadView(orderId);
  if (!v || !pool) return null;
  const p = progressOfView(v.view, v.raw);
  if (v.row.status === "storniert" || v.view.cancelled) return p;
  const held = !!v.raw.payHold;
  const codes = async () => (await pool!.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND status IN ('new','working') ORDER BY id`, [orderId]).catch(() => ({ rows: [] as { code: string }[] }))).rows.map((x) => x.code).filter(Boolean);
  const test = isTestEmail(v.row.email);
  const money = `${Math.round(p.due)} ${String(p.cur).toUpperCase()}`;
  if (!held && p.due >= PAY_HOLD() && p.inProgress > 0) {
    await setOrderRawField(orderId, "payHold", { at: new Date().toISOString(), amount: p.due, cur: p.cur });
    const c = await codes();
    await insertEvent({ orderId, email: v.row.email, type: "pay", title: `Zwischenzahlung nötig – Auftrag pausiert (${money} offen)`, detail: `${p.inProgress} Bewertung(en) beim Partner pausiert bis zur Zahlung${c.length ? " · " + c.join(", ") : ""}`, auto: true }).catch(() => {});
    void notifyPartner(`${test ? "TEST · " : ""}Order on hold`, `${c.slice(0, 4).join(", ") || orderId} · customer payment pending – please pause until “Customer paid”.`, undefined, test);
    void notifyTeam(`Zwischenzahlung nötig · ${v.row.name || v.row.email}`, `${money} offen · ${p.inProgress} Bewertung(en) pausiert · Auftrag ${orderId}`, `${SITE_URL}/admin?order=${encodeURIComponent(orderId)}`, { kind: "pay" });
    return { ...p, hold: true };
  }
  const cardHold = held && (v.raw.payHold as { reason?: string }).reason === "autopay"; // fehlgeschlagene Abbuchung: erst frei, wenn alles bezahlt
  if (held && (cardHold ? p.due <= 0 || p.inProgress === 0 : p.due < PAY_HOLD() || p.inProgress === 0)) {
    await setOrderRawField(orderId, "payHold", null);
    const c = await codes();
    await insertEvent({ orderId, email: v.row.email, type: "pay", title: cardHold && p.due <= 0 ? "Zahlung eingegangen – Pause aufgehoben (Abbuchung)" : p.due < PAY_HOLD() ? "Zwischenzahlung eingegangen – Auftrag läuft weiter" : "Pause aufgehoben (nichts mehr beim Partner offen)", detail: `${p.inProgress} Bewertung(en) beim Partner`, auto: true }).catch(() => {});
    if (p.inProgress && (cardHold ? p.due <= 0 : p.due < PAY_HOLD())) void notifyPartner(`${test ? "TEST · " : ""}Customer paid`, `${c.slice(0, 4).join(", ") || orderId} · hold lifted – continue now.`, undefined, test);
    return { ...p, hold: false };
  }
  return p;
}
/** Alle 10 Min.: pausierte Aufträge prüfen (Zahlung über andere Wege, Admin „bezahlt" …). */
export async function payHoldSweep(): Promise<void> {
  if (!pool) return;
  const r = await pool.query(`SELECT id FROM orders WHERE service='reviews' AND raw->'payHold' IS NOT NULL AND jsonb_typeof(raw->'payHold')='object'`);
  for (const x of r.rows as { id: string }[]) await evaluatePayHold(x.id).catch(() => {});
}

/** Fällige Sammel-Mails holen (und aus der Warteschlange nehmen). */
export async function takeDueNotifications(): Promise<{ orderId: string; email: string; name: string; lang: string; country: string | null; cur: string; swPrice: number; swDeposit: number; keys: string[]; changed: { key: string; url: string | null; name: string | null; status: ItemStatus; from?: ItemStatus | null; pre?: boolean; swDue?: string | null }[]; progress: OrderProgress | null; charged: AutoCharged | null }[]> {
  if (!pool) return [];
  const due = await pool.query(`DELETE FROM cust_notify WHERE due_at <= now() RETURNING order_id, keys, changes`);
  const out = [];
  for (const d of due.rows) {
    const o = await pool.query(`SELECT id, created_at, status, pay, lang, country, profile, company, name, email, raw FROM orders WHERE id=$1`, [d.order_id]);
    const row = o.rows[0];
    if (!row || !row.email) continue;
    // Zahlungsart hinterlegt → offenen Betrag sofort abbuchen (dann gibt es weder Aufforderung noch Zwischenzahlung).
    const ks0: string[] = Array.isArray(d.keys) ? d.keys : [];
    const charged = autopayHooks.charge && ks0.length ? await autopayHooks.charge(String(row.email)).catch(() => null) : null;
    // Gelöscht → offener Betrag gestiegen: Zwischenzahlung prüfen, bevor die Mail rausgeht (Mail zeigt dann den Hinweis).
    const progress = await evaluatePayHold(d.order_id).catch(() => null);
    const pt = await pool.query(`SELECT item_key, status, working_since FROM partner_tasks WHERE order_id=$1 AND status <> 'cancelled'`, [d.order_id]);
    const view = orderView(row, new Map(pt.rows.map((x) => [x.item_key, { status: x.status, since: x.working_since }])));
    const keys: string[] = Array.isArray(d.keys) ? d.keys : [];
    const ch = (d.changes || {}) as Record<string, { from: string | null; to: string }>;
    const changed = view.items.filter((v) => keys.includes(v.key)).map((v) => {
      const from = ch[v.key]?.from ? partnerToDash(ch[v.key].from as string) : null;
      return { key: v.key, url: v.url, name: v.name, status: v.status, from: from && from !== v.status ? from : null, pre: !!v.pre, swDue: v.swDue || null };
    });
    out.push({ orderId: row.id, email: row.email, name: row.name || "", lang: row.lang || "en", country: row.country, cur: view.cur, swPrice: view.swPrice, swDeposit: view.swDeposit, changed, keys, progress: progress && charged ? { ...progress, charged } : progress, charged });
  }
  return out;
}

/* ---- Zahlungsaufforderung nach der Löschung: Nachweis + Sicherheitsnetz ----
 * Gelöscht (Partner) → Sammel-Mail „Neuigkeiten" mit Zahlungsaufforderung (Dashboard). Nach erfolgreichem Versand merken wir je
 * Bewertung, wann der Kunde zur Zahlung aufgefordert wurde (raw.reviewsPayReq) → Admin zeigt dann nicht mehr „Rechnung senden".
 * Sicherheitsnetz (alle 10 Min.): gelöscht seit > 30 Min., unbezahlt, weder aufgefordert noch per Löschbestätigung abgerechnet
 * und nichts in der Warteschlange → Aufforderung nachholen (max. 2×, danach Push ans Team). */
export async function markPayRequested(orderId: string, keys: string[]): Promise<void> {
  if (!pool || !keys.length) return;
  const r = await pool.query(`SELECT raw->'reviewsPayReq' AS m FROM orders WHERE id=$1`, [orderId]);
  const m = { ...((r.rows[0]?.m || {}) as Record<string, string>) };
  const at = new Date().toISOString();
  let ch = false;
  for (const k of keys) if (k && !m[k]) { m[k] = at; ch = true; }
  if (ch) await setOrderRawField(orderId, "reviewsPayReq", m);
}

async function payReqBackfillOnce(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS ops_flags (key text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now())`);
  const f = await pool.query(`INSERT INTO ops_flags (key) VALUES ('payreq-backfill-1') ON CONFLICT DO NOTHING RETURNING key`);
  if (!f.rowCount) return;
  // Bestand: Aufforderungen, die schon per Sammel-Mail rausgingen (Detail „Name: removed"), nachträglich vermerken.
  const r = await pool.query(`SELECT t.order_id, t.item_key, t.removed_at, o.raw->'reviewItems' AS items FROM partner_tasks t JOIN orders o ON o.id=t.order_id
     WHERE t.status='removed' AND t.removed_at > now() - interval '90 days' AND o.service='reviews'`);
  const byOrder = new Map<string, { key: string; at: number; label: string }[]>();
  for (const x of r.rows) {
    const it = (Array.isArray(x.items) ? x.items : [] as Item[]).find((i: Item) => keyOf(i) === x.item_key) as Item | undefined;
    const label = it ? (it.name || it.url || "") : "";
    if (!label) continue;
    byOrder.set(x.order_id, [...(byOrder.get(x.order_id) || []), { key: x.item_key, at: new Date(x.removed_at).getTime(), label }]);
  }
  for (const [oid, list] of byOrder) {
    const ev = await pool.query(`SELECT detail, created_at FROM events WHERE order_id=$1 AND title LIKE 'Dashboard-Update an Kunden gesendet%'`, [oid]);
    const done = list.filter((x) => ev.rows.some((e) => new Date(e.created_at).getTime() >= x.at - 120_000 && String(e.detail || "").includes(`${x.label}: removed`)));
    if (done.length) await markPayRequested(oid, done.map((x) => x.key)).catch(() => {});
  }
}

export async function payRequestGuard(log: (o: unknown, m: string) => void = () => {}): Promise<void> {
  if (!pool) return;
  await payReqBackfillOnce().catch((e) => log({ err: e }, "Zahlungsaufforderung: Nachtrag fehlgeschlagen"));
  const since = process.env.FOLLOWUP_SINCE || "2026-10-04T00:00:00Z";
  const r = await pool.query(
    `SELECT t.order_id, array_agg(t.item_key) AS keys FROM partner_tasks t JOIN orders o ON o.id=t.order_id
      WHERE t.status='removed' AND t.removed_at < now() - interval '30 minutes' AND t.removed_at > GREATEST($1::timestamptz, now() - interval '30 days')
        AND o.service='reviews' AND COALESCE(o.status,'') <> 'storniert' AND COALESCE(o.pay,'') <> 'paid' AND COALESCE(o.email,'') <> ''
        AND NOT EXISTS (SELECT 1 FROM cust_notify n WHERE n.order_id=t.order_id)
      GROUP BY t.order_id`, [since]);
  for (const row of r.rows as { order_id: string; keys: string[] }[]) {
    const o = await pool.query(`SELECT id, email, name, profile, company, raw FROM orders WHERE id=$1`, [row.order_id]);
    const x = o.rows[0]; if (!x) continue;
    const raw = (x.raw || {}) as Record<string, unknown>;
    const req = (raw.reviewsPayReq || {}) as Record<string, string>;
    const billed = new Set([...(Array.isArray(raw.reviewsRemovedAll) ? raw.reviewsRemovedAll as Item[] : []), ...(Array.isArray(raw.reviewsRemoved) ? raw.reviewsRemoved as Item[] : [])].map(keyOf));
    let missing = row.keys.filter((k) => !req[k] && !billed.has(k));
    if (!missing.length) continue;
    // Nur unbezahlte (Software-Vorauszahlung / einzeln bezahlt / erlassen → keine Aufforderung nötig).
    const d = await loadCustomerOrders(String(x.email).toLowerCase());
    const ov = d.orders.find((v) => v.id === x.id);
    const open = new Set((ov?.items || []).filter((i) => i.status === "removed" && !i.paid && !(i as { waived?: boolean }).waived).map((i) => i.key));
    missing = missing.filter((k) => open.has(k));
    if (!missing.length) continue;
    const g = (raw.reviewsPayGuard || {}) as { n?: number; at?: string };
    if (g.at && Date.now() - new Date(g.at).getTime() < 6 * 3600e3) continue;
    const n = (g.n || 0) + 1;
    await setOrderRawField(x.id, "reviewsPayGuard", { n, at: new Date().toISOString() });
    if (n > 2) {
      if (n === 3) void notifyTeam(`Zahlungsaufforderung fehlt · ${x.profile || x.company || x.email}`, `Auftrag ${x.id}: ${missing.length} gelöschte Bewertung(en) – Aufforderung ging 2× nicht raus, bitte Rechnung manuell senden`, `${process.env.SITE_URL || "https://www.rapid-remove.com"}/admin?order=${encodeURIComponent(x.id)}`, { kind: "customer" });
      continue;
    }
    await requeueNotify(x.id, missing, 0);
    await insertEvent({ orderId: x.id, email: x.email, type: "note", title: "Sicherheitsnetz: Zahlungsaufforderung fehlte – wird jetzt nachgeholt", detail: `${missing.length} gelöschte Bewertung(en) ohne Aufforderung · Versuch ${n}/2`, auto: true }).catch(() => {});
    log({ orderId: x.id, n: missing.length }, "Sicherheitsnetz: Zahlungsaufforderung nachgeholt");
  }
}

/** Fehlgeschlagene Sammel-Mail später nochmal versuchen. */
export async function requeueNotify(orderId: string, keys: string[], minutes = 15): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO cust_notify (order_id, due_at, keys) VALUES ($1, now() + ($2 || ' minutes')::interval, $3::jsonb)
     ON CONFLICT (order_id) DO UPDATE SET keys = (SELECT jsonb_agg(DISTINCT k) FROM jsonb_array_elements(cust_notify.keys || EXCLUDED.keys) k)`,
    [orderId, String(minutes), JSON.stringify(keys)],
  );
}

/* ---- Admin: Dashboard-Zugänge für alle offenen Einzelbewertungs-Aufträge anlegen (OHNE Mail) ---- */
export function registerCustomerAdminRoutes(app: FastifyInstance, adminToken: string, hooks: { sendInvite: (email: string, name: string, url: string, lang: string) => Promise<void> }): void {
  // Einladung ins Dashboard an alle Bewertungs-Kunden: ohne apply = nur Liste, mit apply = senden.
  // Je Adresse eine Mail (Sprache + Name der letzten Bestellung), nie doppelt.
  let inviting = false;
  // Admin (neu) · „Kundendashboard öffnen": einmaliger 5-Minuten-Code für die Admin-Ansicht (ohne Tracking).
  app.post("/admin/cust/impersonate", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const email = norm(b.email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    await ensureCustomerAccount(email); // Konto ohne Mail anlegen, falls noch keins existiert
    const k = crypto.randomBytes(24).toString("base64url");
    await pool.query(`INSERT INTO admin_impersonations (code_hash, email, order_id, expires_at) VALUES ($1,$2,$3, now() + interval '5 minutes')`, [sha(k), email, String(b.orderId || "").slice(0, 40) || null]);
    const order = String(b.orderId || "").slice(0, 40);
    return { ok: true, url: `${DASH_URL}?imp=${encodeURIComponent(k)}${order ? "&order=" + encodeURIComponent(order) : ""}` };
  });

  // Admin (neu) · Dashboard-Aktivität: einem Kunden den persönlichen Login-Link (erneut) senden.
  app.post("/admin/cust/invite-one", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const email = norm(b.email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    const lang = String(b.lang || "en").slice(0, 5);
    await ensureCustomerAccount(email);
    await hooks.sendInvite(email, String(b.name || "").slice(0, 120), await dashLink(email, lang), lang);
    await insertEvent({ orderId: String(b.orderId || "").slice(0, 40) || undefined, email, type: "mail", title: "Dashboard-Login-Link gesendet", detail: "an " + email }).catch(() => {});
    return { ok: true };
  });

  app.post("/admin/cust/invite", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const r = await pool.query(
      `SELECT DISTINCT ON (lower(o.email)) lower(o.email) AS email, o.name, o.lang, o.company, o.profile
         FROM orders o
        WHERE o.service='reviews' AND o.email IS NOT NULL AND o.email <> '' AND COALESCE(o.status,'') <> 'storniert'
          AND NOT EXISTS (SELECT 1 FROM cust_invites i WHERE i.email = lower(o.email))
        ORDER BY lower(o.email), o.created_at DESC`,
    );
    const sent = (await pool.query(`SELECT count(*)::int AS n FROM cust_invites`)).rows[0].n as number;
    const list = (r.rows as Record<string, string>[])
      .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email))
      .map((x) => ({ email: x.email, name: String(x.name || "").trim().split(/\s+/)[0] || "", lang: String(x.lang || "en").slice(0, 2), business: x.company || x.profile || "" }));
    if (b.apply !== true) return { ok: true, pending: list, alreadySent: sent };
    if (inviting) return reply.code(409).send({ ok: false, error: "Versand läuft bereits" });
    inviting = true;
    const done: string[] = [], failed: { email: string; error: string }[] = [];
    try {
      for (const c of list) {
        // Erst reservieren (verhindert Doppelversand bei parallelen Klicks), bei Fehler wieder freigeben.
        const ins = await pool.query(`INSERT INTO cust_invites (email) VALUES ($1) ON CONFLICT DO NOTHING`, [c.email]);
        if (!ins.rowCount) continue;
        try {
          await hooks.sendInvite(c.email, c.name, await dashLink(c.email, c.lang), c.lang);
          done.push(c.email);
        } catch (e) {
          await pool.query(`DELETE FROM cust_invites WHERE email=$1`, [c.email]).catch(() => {});
          failed.push({ email: c.email, error: String((e as Error)?.message || e).slice(0, 160) });
        }
        await new Promise((res) => setTimeout(res, 400)); // Mailserver schonen
      }
    } finally { inviting = false; }
    return { ok: true, sent: done.length, failed };
  });

  app.post("/admin/cust/accounts-open", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    // Offen = Einzelbewertungs-Auftrag nicht erledigt/storniert ODER mit offenen Partner-Aufgaben.
    const open = await pool.query(
      `SELECT id, email, name, company, profile FROM orders
        WHERE service='reviews' AND COALESCE(status,'') NOT IN ('done','storniert') AND email IS NOT NULL`,
    );
    const fromTasks = await pool.query(
      `SELECT DISTINCT o.id, o.email, o.name, o.company, o.profile FROM partner_tasks t JOIN orders o ON o.id = t.order_id
        WHERE t.status NOT IN ('removed','cancelled') AND o.email IS NOT NULL`,
    ).catch(() => ({ rows: [] as Record<string, string>[] }));
    // Partner-Aufgaben ohne Auftrag (manuell übergeben): über den Profilnamen zuordnen.
    const loose = await pool.query(
      `SELECT DISTINCT customer FROM partner_tasks WHERE order_id IS NULL AND customer IS NOT NULL AND status NOT IN ('removed','cancelled')`,
    ).catch(() => ({ rows: [] as { customer: string }[] }));
    const matched: Record<string, string>[] = [] as Record<string, string>[];
    const unmatched: string[] = [];
    for (const l of loose.rows) {
      const m = await pool.query(
        `SELECT id, email, name, company, profile FROM orders WHERE email IS NOT NULL AND (lower(company)=lower($1) OR lower(profile)=lower($1) OR lower(raw->>'profileName')=lower($1)) ORDER BY created_at DESC LIMIT 1`,
        [l.customer],
      );
      if (m.rows[0]) matched.push(m.rows[0]); else unmatched.push(l.customer);
    }
    const byEmail = new Map<string, { email: string; name: string; business: string; orders: string[] }>();
    for (const o of [...(open.rows as Record<string, string>[]), ...(fromTasks.rows as Record<string, string>[]), ...matched]) {
      const e = norm(o.email);
      if (!e) continue;
      const cur = byEmail.get(e) || { email: e, name: o.name || "", business: o.company || o.profile || "", orders: [] as string[] };
      if (!cur.orders.includes(o.id)) cur.orders.push(o.id);
      byEmail.set(e, cur);
    }
    const accounts = [];
    for (const a of byEmail.values()) {
      const acc = await ensureCustomerAccount(a.email);
      accounts.push({ ...a, password: acc && acc.created ? acc.password : null, existed: !!(acc && !acc.created) });
    }
    return { ok: true, url: DASH_URL, accounts, unmatched };
  });
}
