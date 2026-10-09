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
  ]) await pool.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS ${c}`);
  for (const c of [
    "partner_id bigint", "status text NOT NULL DEFAULT 'manual'", "method text", "provider_ref text", "provider_status text", "error text",
    "gs_no text", "currency text NOT NULL DEFAULT 'USD'", "sent_at timestamptz", "period_from timestamptz", "period_to timestamptz",
    "party jsonb", "items jsonb", "gs_mailed_at timestamptz",
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
};
/** Partner zu einer Partner-Sitzung (E-Mail) – sonst der (einzige) aktive Partner. */
export async function partnerFor(email: string | null): Promise<PartnerRow | null> {
  if (!pool) return null;
  if (email) {
    const r = await pool.query(`SELECT * FROM partners WHERE active AND lower(email)=lower($1) ORDER BY id LIMIT 1`, [email]);
    if (r.rows[0]) return r.rows[0] as PartnerRow;
  }
  const r = await pool.query(`SELECT * FROM partners WHERE active ORDER BY id LIMIT 1`);
  return (r.rows[0] as PartnerRow) || null;
}
const profileDone = (p: PartnerRow | null) => !!p && !!p.legal_name && !!p.addr1 && !!p.city && !!p.country;
const sbOk = (p: PartnerRow | null) => !!p && !!p.sb_at;
const payeeActive = (p: PartnerRow | null) => !!p && !!p.payee_id && /^(active|approved)$/i.test(String(p.payee_status || ""));

export function profileView(p: PartnerRow | null) {
  if (!p) return null;
  return {
    id: Number(p.id), name: p.name, legalName: p.legal_name || "", addr1: p.addr1 || "", addr2: p.addr2 || "", city: p.city || "", zip: p.zip || "",
    country: p.country || "", taxId: p.tax_id || "", payoutEmail: p.payout_email || p.email || "",
    payee: p.payee_id ? { id: p.payee_id, status: p.payee_status || "pending", checked: p.payee_checked_at } : null,
    sb: p.sb_at ? { at: p.sb_at, v: p.sb_v } : null,
    complete: profileDone(p), ready: profileDone(p) && sbOk(p) && payeeActive(p),
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
async function payoneerConnectLink(p: PartnerRow): Promise<string> {
  const payee_id = p.payee_id || payeeIdOf(p);
  const [first, ...rest] = String(p.legal_name || p.name || "").split(/\s+/);
  const r = await py("POST", "/payees/registration-link", {
    payee_id, already_have_an_account: true, redirect_url: `${SITE_URL}/partner?payoneer=done`,
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
  const party = p ? { name: p.legal_name || p.name, addr1: p.addr1, addr2: p.addr2, city: p.city, zip: p.zip, country: p.country, taxId: p.tax_id, email: p.payout_email || p.email, sbAt: p.sb_at, sbV: p.sb_v } : null;
  await pool.query(
    `UPDATE partner_payouts SET gs_no=$2, party=$3, items=$4, partner_id=$5, period_from=$6, period_to=$7 WHERE id=$1`,
    [payoutId, gs, party ? JSON.stringify(party) : null, JSON.stringify(items), p ? p.id : null,
      dates.length ? new Date(Math.min(...dates)) : null, dates.length ? new Date(Math.max(...dates)) : null],
  );
  return gs;
}

/** Manuelle Auszahlung (Admin „bezahlt" bzw. Partner „Mark paid"): Sammelposten + Gutschrift (wenn vereinbart) + Mail. */
export async function recordManualPayout(taskIds: (string | number)[], note: string | null, by: "admin" | "partner", partnerEmail: string | null = null): Promise<{ payoutId: number; amount: number; tasks: number; gs: string | null } | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT id, code, kind, price_usd, customer, removed_at, order_id, url, name, text, rating FROM partner_tasks WHERE id = ANY($1::bigint[]) AND status='removed' AND paid_at IS NULL AND payout_id IS NULL AND NOT test`, [taskIds.map(String)]);
  const rows = r.rows as TaskLite[];
  if (!rows.length) return null;
  const amount = num(rows.reduce((s, x) => s + Number(x.price_usd || 0), 0));
  const p = await partnerFor(partnerEmail);
  const ins = await pool.query(`INSERT INTO partner_payouts (amount_usd, tasks, note, status, method, sent_at) VALUES ($1,$2,$3,'manual',$4, now()) RETURNING id`,
    [amount, rows.length, note, by === "partner" ? "manual (confirmed by partner)" : "manual"]);
  const id = Number(ins.rows[0].id);
  await pool.query(`UPDATE partner_tasks SET paid_at=now(), payout_id=$1, updated_at=now() WHERE id = ANY($2::bigint[])`, [id, rows.map((x) => x.id)]);
  const gs = await finalize(id, p, rows);
  if (gs) void mailGutschrift(id).catch(() => {});
  bumpChange();
  return { payoutId: id, amount, tasks: rows.length, gs };
}

/* ---------------- Automatischer Lauf ---------------- */
let running = false;
export type RunResult = { ok: boolean; skipped?: string; payoutId?: number; amount?: number; tasks?: number; held?: string[]; error?: string; gs?: string | null };

/** Fällige Löschungen prüfen und per Payoneer auszahlen. `manual` = vom Admin ausgelöst (ignoriert Tageszeit, nicht die Haltefrist). */
export async function runPayouts(log: (m: string) => void = () => {}, manual = false): Promise<RunResult> {
  if (!pool) return { ok: false, skipped: "keine Datenbank" };
  if (running) return { ok: false, skipped: "läuft bereits" };
  running = true;
  try {
    const s = await payoutSettings();
    if (!manual && !s.auto) return { ok: true, skipped: "automatische Auszahlung aus" };
    if (!payoneerConfigured()) return { ok: true, skipped: "Payoneer-Zugang fehlt (Railway-Variablen)" };
    let p = await partnerFor(null);
    if (!p) return { ok: true, skipped: "kein aktiver Partner" };
    p = await refreshPayee(p, true);
    if (!profileDone(p)) return { ok: true, skipped: "Partner-Auszahlungsdaten unvollständig" };
    if (!sbOk(p)) return { ok: true, skipped: "Gutschrift-Vereinbarung fehlt" };
    if (!payeeActive(p)) return { ok: true, skipped: `Payoneer-Konto des Partners nicht verbunden (${p.payee_status || "nicht verknüpft"})` };
    const due = (await pool.query(
      `SELECT id, code, kind, price_usd, customer, removed_at, order_id, url, name, text, rating FROM partner_tasks
        WHERE status='removed' AND paid_at IS NULL AND payout_id IS NULL AND NOT test AND removed_at <= now() - make_interval(days => $1::int)
        ORDER BY removed_at, id LIMIT 400`, [s.holdDays])).rows as TaskLite[];
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
    const amount = num(ok.reduce((x, t) => x + Number(t.price_usd || 0), 0));
    if (!ok.length) return { ok: true, skipped: "alle fälligen wieder sichtbar", held };
    if (amount < s.minUsd) return { ok: true, skipped: `Summe $${amount} unter Mindestbetrag $${s.minUsd}`, held };

    // Reservieren (payout_id gesetzt, paid_at erst nach Annahme durch Payoneer) → kein doppeltes Auszahlen.
    const ins = await pool.query(`INSERT INTO partner_payouts (amount_usd, tasks, note, status, method, partner_id) VALUES ($1,$2,$3,'pending','payoneer',$4) RETURNING id`,
      [amount, ok.length, manual ? "Payoneer (manuell gestartet)" : "Payoneer (automatisch)", p.id]);
    const id = Number(ins.rows[0].id);
    const ref = `RRP-${id}`;
    const taken = await pool.query(`UPDATE partner_tasks SET payout_id=$1 WHERE id = ANY($2::bigint[]) AND payout_id IS NULL AND paid_at IS NULL RETURNING id`, [id, ok.map((t) => t.id)]);
    if (taken.rowCount !== ok.length) {
      await pool.query(`UPDATE partner_tasks SET payout_id=NULL WHERE payout_id=$1`, [id]);
      await pool.query(`UPDATE partner_payouts SET status='failed', error='Aufgaben gleichzeitig verändert – nächster Lauf' WHERE id=$1`, [id]);
      return { ok: false, error: "Aufgaben gleichzeitig verändert" };
    }
    let r: { status: number; json: Record<string, unknown> };
    try {
      r = await py("POST", "/masspayouts", { Payments: [{ client_reference_id: ref, payee_id: p.payee_id, description: `RapidRemove payout ${ref} · ${ok.length} removal${ok.length > 1 ? "s" : ""}`, currency: "USD", amount: amount.toFixed(2) }] });
    } catch (e) { r = { status: 0, json: { error: (e as Error).message } }; }
    if (r.status < 200 || r.status >= 300) {
      const err = pyErr(r.json) || `HTTP ${r.status}`;
      await pool.query(`UPDATE partner_tasks SET payout_id=NULL WHERE payout_id=$1 AND paid_at IS NULL`, [id]);
      await pool.query(`UPDATE partner_payouts SET status='failed', error=$2, provider_ref=$3 WHERE id=$1`, [id, err, ref]);
      void notifyTeam(`Auszahlung fehlgeschlagen · $${amount}`, `Payoneer: ${err}`.slice(0, 180), `${SITE_URL}/admin`, { kind: "payout" });
      log(`Auszahlung ${ref} fehlgeschlagen: ${err}`);
      return { ok: false, error: err, held };
    }
    await pool.query(`UPDATE partner_payouts SET status='sent', sent_at=now(), provider_ref=$2, provider_status=$3 WHERE id=$1`, [id, ref, findStatus(r.json) || "submitted"]);
    await pool.query(`UPDATE partner_tasks SET paid_at=now(), updated_at=now() WHERE payout_id=$1`, [id]);
    const gs = await finalize(id, p, ok);
    if (gs) void mailGutschrift(id).catch((e) => log(`Gutschrift-Mail ${gs} fehlgeschlagen: ${(e as Error).message}`));
    void notifyTeam(`Partner ausgezahlt · $${amount}`, `Payoneer · ${ok.length} Löschungen · ${gs || ref}`, `${SITE_URL}/admin`, { kind: "payout" });
    bumpChange();
    log(`Auszahlung ${ref}: $${amount} für ${ok.length} Löschungen (${gs || "ohne Gutschrift"})`);
    return { ok: true, payoutId: id, amount, tasks: ok.length, held, gs };
  } finally { running = false; }
}

/** Status gesendeter Payoneer-Auszahlungen nachziehen (z. B. „Transferred"). */
async function pollSent(): Promise<void> {
  if (!pool || !payoneerConfigured()) return;
  const r = await pool.query(`SELECT id, provider_ref FROM partner_payouts WHERE status='sent' AND provider_ref IS NOT NULL AND sent_at > now() - interval '14 days' ORDER BY id DESC LIMIT 20`);
  for (const x of r.rows as { id: number; provider_ref: string }[]) {
    const s = await py("GET", `/payouts/${encodeURIComponent(x.provider_ref)}/status`).catch(() => null);
    const st = s && s.status < 300 ? findStatus(s.json) : "";
    if (!st) continue;
    const failed = /cancel|fail|reject|declin/i.test(st);
    await pool.query(`UPDATE partner_payouts SET provider_status=$2${failed ? ", status='failed', error=$2" : ""} WHERE id=$1`, [x.id, st]);
    if (failed) void notifyTeam(`Payoneer-Auszahlung ${x.provider_ref}: ${st}`, "Bitte im Payoneer-Konto prüfen – Aufgaben bleiben als bezahlt markiert.", `${SITE_URL}/admin`, { kind: "payout" });
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
  if (!s.auto || !payoneerConfigured()) return;
  const v = viennaNow();
  if (v.hour < s.hour || (await getSetting("payout_last_day")) === v.day) return;
  await setSetting("payout_last_day", v.day);
  const r = await runPayouts(log, false);
  await setSetting("payout_last_result", JSON.stringify({ at: new Date().toISOString(), ...r })).catch(() => {});
}

/* ---------------- Gutschrift (PDF) ---------------- */
type PayoutRow = { id: string; amount_usd: string; tasks: number; status: string; method: string | null; provider_ref: string | null; gs_no: string | null; currency: string; sent_at: string | null; created_at: string; period_from: string | null; period_to: string | null; party: Record<string, string | null> | null; items: { code: string; desc: string; customer: string; removed: string | null; usd: number }[] | null; note: string | null; partner_id: string | null };
async function payoutRow(id: number): Promise<PayoutRow | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT * FROM partner_payouts WHERE id=$1`, [id]);
  return (r.rows[0] as PayoutRow) || null;
}
// Standard-PDF-Schriften kennen nur WinAnsi → alles andere ersetzen.
const win = (s: unknown) => String(s ?? "").normalize("NFC").replace(/[\u2013\u2014]/g, "-").replace(/[\u201c\u201d\u201e]/g, '"').replace(/[\u2018\u2019]/g, "'")
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
  const left = [p.name, p.addr1, p.addr2, [p.zip, p.city].filter(Boolean).join(" "), COUNTRY[String(p.country || "").toUpperCase()] || p.country, p.taxId ? `Tax ID: ${p.taxId}` : "", p.email].filter(Boolean) as string[];
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
  t("Nettobetrag / Net amount", cols[2] - 60, y); t(`USD ${tot}`, R, y, { right: true }); y -= 14;
  t("USt / VAT 0 % (Reverse Charge)", cols[2] - 60, y); t("USD 0.00", R, y, { right: true }); y -= 16;
  t("Gutschriftsbetrag / Total", cols[2] - 60, y, { f: B, size: 11 }); t(`USD ${tot}`, R, y, { f: B, size: 11, right: true });
  y -= 30;
  const paid = x.method === "payoneer" ? `Ausgezahlt über Payoneer am ${dmy(x.sent_at)} (Referenz ${x.provider_ref || "RRP-" + x.id}). / Paid via Payoneer on ${dmy(x.sent_at)} (reference ${x.provider_ref || "RRP-" + x.id}).`
    : `Ausgezahlt am ${dmy(x.sent_at || x.created_at)}${x.note ? " (" + x.note + ")" : ""}. / Paid on ${dmy(x.sent_at || x.created_at)}.`;
  para(paid, 8.5, ink); y -= 6;
  para(`Übergang der Steuerschuld auf den Leistungsempfänger (Reverse Charge, § 19 Abs. 1 UStG / Art. 196 MwSt-RL). Der Leistende ist im Inland nicht ansässig; Ort der Leistung ist Österreich (§ 3a Abs. 6 UStG). UID des Leistungsempfängers: ${US.uid}. / VAT reverse charge: the recipient is liable for VAT.`);
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
async function balance(holdDays: number) {
  if (!pool) return { owedUsd: 0, owedCount: 0, dueUsd: 0, dueCount: 0, processingUsd: 0 };
  const r = await pool.query(`SELECT
      COALESCE(sum(price_usd) FILTER (WHERE payout_id IS NULL),0) AS owed, count(*) FILTER (WHERE payout_id IS NULL) AS owed_n,
      COALESCE(sum(price_usd) FILTER (WHERE payout_id IS NULL AND removed_at <= now() - make_interval(days => $1::int)),0) AS due,
      count(*) FILTER (WHERE payout_id IS NULL AND removed_at <= now() - make_interval(days => $1::int)) AS due_n,
      COALESCE(sum(price_usd) FILTER (WHERE payout_id IS NOT NULL),0) AS proc
    FROM partner_tasks WHERE status='removed' AND paid_at IS NULL AND NOT test`, [holdDays]);
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
  const partnerOf = async (t: unknown) => partnerFor(String(t || "").startsWith("ps_") ? await auth.email(t) : null);

  // Partner: Auszahlungsdaten, Guthaben, Auszahlungen (mit Gutschrift).
  app.post("/partner/payouts", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const s = await payoutSettings();
    if (await auth.preview(b.t)) return { ok: true, preview: true, profile: null, sbText: SB_TEXT, sbVersion: SB_VERSION, payoneer: payoneerConfigured(), auto: false, balance: { owedUsd: 0, owedCount: 0, dueUsd: 0, dueCount: 0, processingUsd: 0 }, payouts: [], holdDays: s.holdDays, minUsd: s.minUsd };
    let p = await partnerOf(b.t);
    if (p) p = await refreshPayee(p);
    const pr = await pool.query(`SELECT * FROM partner_payouts ORDER BY id DESC LIMIT 40`);
    return {
      ok: true, profile: profileView(p), sbText: SB_TEXT, sbVersion: SB_VERSION, payoneer: payoneerConfigured(),
      auto: s.auto && payoneerConfigured() && !!profileView(p)?.ready, holdDays: s.holdDays, minUsd: s.minUsd, next: nextRunText(s),
      balance: await balance(s.holdDays), payouts: (pr.rows as PayoutRow[]).filter((x) => x.status !== "failed" && x.status !== "pending").map(payoutView).map((x) => ({ ...x, error: null })),
    };
  });

  // Partner: Auszahlungsdaten speichern + Gutschrift-Vereinbarung.
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
    };
    if (!v.legal || !v.a1 || !v.city || !ISO2.test(v.country)) return reply.code(400).send({ ok: false, error: "Please fill in name, address, city and country." });
    if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) return reply.code(400).send({ ok: false, error: "Payoneer email is not valid." });
    if (!p.sb_at && b.agree !== true) return reply.code(400).send({ ok: false, error: "Please accept the self-billing agreement." });
    const agree = b.agree === true && (!p.sb_at || p.sb_v !== SB_VERSION);
    const u = await pool.query(
      `UPDATE partners SET legal_name=$2, addr1=$3, addr2=$4, city=$5, zip=$6, country=$7, tax_id=$8, payout_email=$9
         ${agree ? ", sb_at=now(), sb_ip=$10, sb_ua=$11, sb_v=$12" : ""} WHERE id=$1 RETURNING *`,
      [p.id, v.legal, v.a1, v.a2 || null, v.city, v.zip || null, v.country, v.tax || null, v.email || null, ...(agree ? [ipOf(req), clip(req.headers["user-agent"], 300), SB_VERSION] : [])],
    );
    if (agree) void notifyTeam("Partner: Gutschrift-Vereinbarung angenommen", `${v.legal} · ${v.country}`, `${SITE_URL}/admin`, { kind: "payout" });
    return { ok: true, profile: profileView(u.rows[0] as PartnerRow) };
  });

  // Partner: Payoneer-Konto verbinden → Link zu Payoneer (dort einloggen + bestätigen).
  app.post("/partner/payouts/connect", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (await auth.preview(b.t)) return reply.code(400).send({ ok: false, error: "test mode" });
    if (!payoneerConfigured()) return reply.code(409).send({ ok: false, error: "Payoneer connection is being activated – we'll let you know." });
    const p = await partnerOf(b.t);
    if (!p || !profileDone(p) || !sbOk(p)) return reply.code(400).send({ ok: false, error: "Please save your payout details first." });
    try { return { ok: true, url: await payoneerConnectLink(p) }; }
    catch (e) { app.log.error({ err: e }, "Payoneer-Link fehlgeschlagen"); return reply.code(502).send({ ok: false, error: "Payoneer is not reachable right now – please try again later." }); }
  });

  // Partner/Admin: Gutschrift als PDF.
  app.post("/partner/payouts/pdf", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await auth.check(b.t)) || (await auth.preview(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
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
    let p = await partnerFor(null);
    if (p) p = await refreshPayee(p);
    const pr = await pool.query(`SELECT * FROM partner_payouts ORDER BY id DESC LIMIT 60`);
    const last = await getSetting("payout_last_result");
    const c = PY();
    return {
      ok: true, settings: s, payoneer: { configured: payoneerConfigured(), sandbox: c.sandbox }, partner: p ? { ...profileView(p), email: p.email, sbIp: p.sb_ip } : null,
      balance: await balance(s.holdDays), next: nextRunText(s), last: last ? JSON.parse(last) : null, payouts: (pr.rows as PayoutRow[]).map(payoutView),
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
