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
import type { FastifyInstance } from "fastify";
import { pool, setOrderRawField, insertEvent } from "./db";
import { notifyTeam } from "./notify";
import { ensureReviewsAmountLink } from "./reviewsSetup";
import { hasSecretKey } from "./integrations/stripe";
import { quoteReviews, reviewDiscountPct, REVIEW_BASE, REVIEW_OLD_SURCHARGE, REVIEW_NOTEXT_PRICE } from "./reviewsPricing";

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
  // Sammel-Benachrichtigung: 5 Minuten nach der LETZTEN Partner-Änderung eines Auftrags eine Mail.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_notify (
      order_id   text PRIMARY KEY,
      due_at     timestamptz NOT NULL,
      keys       jsonb NOT NULL DEFAULT '[]'::jsonb
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

/* ---- Zahlungen (raw.reviewsPayments) ---- */
export type PayRef = { o: string; k: string };
export type CustPayment = {
  id: string; kind: "deposit" | "software" | "invoice"; amount: number; cur: string; url: string; n?: number;
  keys?: string[];      // Bewertungen DIESES Auftrags, die die Zahlung abdeckt
  refs?: PayRef[];      // Bewertungen ANDERER Aufträge desselben Kunden (Dashboard: „alles zahlen")
  via?: "dashboard" | "admin";
  created: string; paid?: string | null;
};
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

export const SW_NOTE_PAID = "Kunde hat die Software-Vorauszahlung bezahlt (Dashboard) → bitte starten";
const SW_NOTE_DECLINED = "Kunde hat die Spezial-Software abgelehnt (Dashboard)";
const appendNote = (col: string, i: number) => `${col} = CASE WHEN COALESCE(${col},'')='' THEN $${i} ELSE ${col} || ' · ' || $${i} END`;

async function rawOf(orderId: string): Promise<Record<string, unknown> | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [orderId]);
  return r.rows[0] ? ((r.rows[0].raw || {}) as Record<string, unknown>) : null;
}
type Decision = { d: "accepted" | "declined"; at: string };
async function setDecisions(orderId: string, keys: string[], d: Decision["d"]): Promise<void> {
  const raw = await rawOf(orderId);
  if (!raw) return;
  const dec = { ...((raw.reviewsSwDecision as Record<string, Decision>) || {}) };
  for (const k of keys) dec[k] = { d, at: new Date().toISOString() };
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
    if (p.via === "dashboard") void notifyTeam("💳 Kunde hat im Dashboard bezahlt", `${p.amount} ${String(p.cur).toUpperCase()} · ${[...groups.values()].flat().length} gelöschte Bewertung(en) · Auftrag ${orderId}`, `${SITE_URL}/admin`);
    return;
  }
  if (p.kind !== "software") return;
  let n = 0;
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
  if (n) void notifyTeam(`💳 Kunde hat Software-Löschung bezahlt`, `${n} Bewertung(en) · Auftrag ${orderId} · Partner-Aufgabe steht auf Working`, `${SITE_URL}/admin`);
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
      return { orderId: row.id, kind: hit.kind };
    }
  }
  return null;
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
  await setOrderRawField(orderId, "reviewsPayments", list);
  await addPaidKeys(orderId, [...keys]);
}

/* ---- Status je Bewertung (für das Dashboard) ---- */
type Item = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean };
export const keyOf = (it: Item) => it.url || `${it.name || ""}|${it.text || ""}`;
/** Kunden-Status (Design-Handoff „Customer Dashboard"). */
export type ItemStatus = "new" | "working" | "removed" | "notpossible" | "software" | "sw_accepted" | "sw_declined" | "cancelled";
type PT = { status: string; since: string | null; removedAt?: string | null; changedAt?: string | null };
type OrderRow = { id: string; created_at: string; status: string | null; pay: string | null; lang: string | null; country: string | null; profile: string | null; company: string | null; raw: Record<string, unknown> | null };

function orderView(o: OrderRow, partner: Map<string, PT> = new Map()) {
  const raw = (o.raw || {}) as Record<string, unknown>;
  const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
  const accepted: Item[] | null = Array.isArray(raw.reviewsAccepted) ? (raw.reviewsAccepted as Item[]) : null;
  const software: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
  const removed: Item[] = Array.isArray(raw.reviewsRemovedAll) ? (raw.reviewsRemovedAll as Item[]) : Array.isArray(raw.reviewsRemoved) ? (raw.reviewsRemoved as Item[]) : [];
  const payments: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
  const decisions = ((raw.reviewsSwDecision as Record<string, Decision>) || {});
  const paidKeys = new Set<string>(Array.isArray(raw.reviewsPaidKeys) ? (raw.reviewsPaidKeys as string[]) : []);
  const acc = new Set((accepted || []).map(keyOf));
  const sw = new Set(software.map(keyOf));
  const rem = new Set(removed.map(keyOf));
  const cur = o.country === "US" ? "usd" : "eur";
  const pct = reviewDiscountPct(items.length);
  const disc = (v: number) => Math.round((v * (100 - pct)) / 100);
  const swPaidFor = (k: string) => decisions[k]?.d === "accepted" || payments.some((p) => p.kind === "software" && p.paid && (p.keys && p.keys.length ? p.keys.includes(k) : sw.has(k)));
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
    else if (swPaidFor(k)) status = "sw_accepted";
    else if (ps === "software" || sw.has(k)) status = "software";
    else if (ps === "not_possible") status = "notpossible";
    else if (ps === "working") status = "working";
    else if (acc.has(k)) status = "working";
    else if (accepted) status = "notpossible";
    else status = "new";
    const special = !!it.nt || sw.has(k) || swPaidFor(k);
    const price = special ? disc(REVIEW_NOTEXT_PRICE) : disc(it.old ? REVIEW_BASE + REVIEW_OLD_SURCHARGE : REVIEW_BASE);
    return {
      key: k, url: it.url || null, name: it.name || null, text: it.text || null, noText: !!it.nt || !String(it.text || "").trim(),
      status, since: ps === "working" ? pt?.since || null : null,
      removedAt: status === "removed" ? pt?.removedAt || null : null, changedAt: pt?.changedAt || null,
      price, paid: status === "removed" ? (special ? prepaidFor(k) || isPaid(k) : isPaid(k)) : false, special, old: !!it.old,
    };
  });
  const unpaid = view.filter((v) => v.status === "removed" && !v.paid);
  // Normale Bewertungen wie die Rechnung (Mengenrabatt), Spezialverfahren (falls ausnahmsweise nicht vorausbezahlt) voll.
  const unpaidN = unpaid.filter((v) => !v.special);
  const toPay = (unpaidN.length ? quoteReviews(unpaidN.map((v) => ({ old: v.old })), cur, items.length, "rest").total : 0)
    + unpaid.filter((v) => v.special).reduce((s, v) => s + v.price, 0);
  return {
    id: o.id, created: o.created_at, lang: o.lang, cur, business: o.company || o.profile || "", cancelled,
    pct, swPrice: disc(REVIEW_NOTEXT_PRICE), swDeposit: disc(REVIEW_NOTEXT_PRICE), toPay, // swDeposit = Vorauszahlung = voller Preis
    items: view.map(({ special, old, ...v }) => v),
    // Bezahlte Zahlungen (Verlauf im Tab „Payments").
    history: payments.filter((p) => p.paid).map((p) => ({
      id: p.id, kind: p.kind, amount: p.amount, cur: p.cur, paid: p.paid, n: p.n || (p.keys || []).length + (p.refs || []).length || null,
      names: (p.keys || []).map((k) => items.find((it) => keyOf(it) === k)?.name || "").filter(Boolean).slice(0, 3),
    })),
    // Offene Anzahlungen für bestellte Bewertungen ohne Text (Startbestätigung).
    deposits: payments.filter((p) => p.kind === "deposit" && !p.paid && p.url).map((p) => ({ id: p.id, amount: p.amount, cur: p.cur, url: p.url, n: p.n || null })),
  };
}
type OrderView = ReturnType<typeof orderView>;

async function loadCustomerOrders(email: string): Promise<{ name: string; lang: string; orders: OrderView[] }> {
  if (!pool) return { name: "", lang: "en", orders: [] };
  const r = await pool.query(
    `SELECT id, created_at, status, pay, lang, country, profile, company, name, raw FROM orders
      WHERE lower(email)=$1 AND service='reviews' ORDER BY created_at DESC LIMIT 20`,
    [email],
  );
  const ids = r.rows.map((x) => x.id);
  type PRow = { order_id: string; item_key: string; status: string; working_since: string | null; removed_at: string | null; updated_at: string | null };
  const pt = ids.length
    ? await pool.query(`SELECT order_id, item_key, status, working_since, removed_at, updated_at FROM partner_tasks WHERE order_id = ANY($1::text[]) AND status <> 'cancelled'`, [ids]).catch(() => ({ rows: [] as PRow[] }))
    : { rows: [] as PRow[] };
  const byOrder = new Map<string, Map<string, PT>>();
  for (const t of pt.rows as PRow[]) {
    if (!byOrder.has(t.order_id)) byOrder.set(t.order_id, new Map());
    byOrder.get(t.order_id)!.set(t.item_key, { status: t.status, since: t.working_since, removedAt: t.removed_at, changedAt: t.updated_at });
  }
  return { name: r.rows[0]?.name || "", lang: r.rows[0]?.lang || "en", orders: r.rows.map((o) => orderView(o, byOrder.get(o.id))) };
}

/* ---- Routen ---- */
export function registerCustomerRoutes(app: FastifyInstance, hooks: { sendReset: (email: string, password: string, lang: string) => Promise<void> }): void {
  const hits = new Map<string, number[]>();
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
    return { ok: true, token };
  });

  app.post("/cust/logout", async (req) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (pool && b.token) await pool.query(`DELETE FROM cust_sessions WHERE token_hash=$1`, [sha(String(b.token))]);
    return { ok: true };
  });

  app.post("/cust/me", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    const d = await loadCustomerOrders(email);
    return { ok: true, email, name: d.name, lang: d.lang, orders: d.orders };
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
          `UPDATE partner_tasks SET status='cancelled', updated_at=now(), ${appendNote("admin_note", 3)}
            WHERE order_id=$1 AND item_key = ANY($2::text[]) AND status IN ('new','working','software','not_possible') AND paid_at IS NULL`,
          [o, ks, SW_NOTE_DECLINED],
        ).catch(() => {});
        await insertEvent({ orderId: o, email, type: "note", title: "Kunde: Spezial-Software abgelehnt (Dashboard)", detail: `${ks.length} Bewertung(en) · Partner-Aufgabe(n) storniert`, auto: true }).catch(() => {});
      }
      void notifyTeam("🚫 Kunde lehnt Spezial-Software ab", `${picks.length} Bewertung(en) · ${[...groups.keys()].join(", ")}`, `${SITE_URL}/admin`);
      return { ok: true, declined: picks.length };
    }
    const cur = byId.get(picks[0].o)!.cur as "usd" | "eur";
    picks = picks.filter((p) => byId.get(p.o)!.cur === cur);
    const amount = picks.reduce((s, p) => s + byId.get(p.o)!.swDeposit, 0);
    const url = await payLink("software", picks, amount, cur, orders);
    if (!url) return reply.code(503).send({ ok: false, error: "payment_unavailable" });
    void notifyTeam("🛒 Kunde öffnet Software-Zahlung", `${picks.length} Bewertung(en) · ${amount} ${cur.toUpperCase()} · ${[...new Set(picks.map((p) => byId.get(p.o)!.business || p.o))].join(", ")}`, `${SITE_URL}/admin`);
    await insertEvent({ orderId: picks[0].o, email, type: "note", title: "Kunde: Software-Vorauszahlung geöffnet (Dashboard)", detail: `${picks.length} Bewertung(en) · ${amount} ${cur.toUpperCase()}`, auto: true }).catch(() => {});
    return { ok: true, url, amount, cur, n: picks.length };
  });

  // „Pay": ein Checkout für alle gelöschten, noch unbezahlten Bewertungen.
  app.post("/cust/pay", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (limited("pay:" + email, 40)) return reply.code(429).send({ ok: false, error: "too_many" });
    const { orders } = await loadCustomerOrders(email);
    const due = orders.filter((o) => o.toPay > 0);
    if (!due.length) return reply.code(400).send({ ok: false, error: "nothing" });
    const cur = due[0].cur as "usd" | "eur";
    const use = due.filter((o) => o.cur === cur);
    const picks: PayRef[] = use.flatMap((o) => o.items.filter((it) => it.status === "removed" && !it.paid).map((it) => ({ o: o.id, k: it.key })));
    const amount = use.reduce((s, o) => s + o.toPay, 0);
    const url = await payLink("invoice", picks, amount, cur, orders);
    if (!url) return reply.code(503).send({ ok: false, error: "payment_unavailable" });
    void notifyTeam("🛒 Kunde öffnet Zahlung (gelöschte Bewertungen)", `${picks.length} Bewertung(en) · ${amount} ${cur.toUpperCase()} · ${email}`, `${SITE_URL}/admin`);
    return { ok: true, url, amount, cur, n: picks.length };
  });

  // Passwort vergessen: neues Passwort per Mail (Antwort immer gleich → keine Konto-Erkennung).
  app.post("/cust/reset", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (limited("reset:" + req.ip, 5)) return reply.code(429).send({ ok: false, error: "too_many" });
    const email = norm(b.email);
    if (pool && email) {
      const pw = await resetCustomerPassword(email);
      if (pw) {
        const l = await pool.query(`SELECT lang FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [email]);
        await hooks.sendReset(email, pw, String(l.rows[0]?.lang || "en")).catch((e) => app.log.error({ err: e }, "Passwort-Mail fehlgeschlagen"));
      }
    }
    return { ok: true };
  });
}


/* ---- Partner-Änderungen → Kunden-Dashboard + Sammel-Mail (5 Min. nach der letzten Änderung) ---- */
export const NOTIFY_DELAY_MIN = 5;

/** Vom Partner-Board aufgerufen, wenn der Partner einen Status ändert.
 *  „software" → Bewertung erscheint im Dashboard als „Needs software"; der Kunde entscheidet dort
 *  (Anzahlung zahlen → Aufgabe geht auf Working, oder ablehnen → Aufgabe storniert).
 *  Zieht der Partner „software" zurück (bevor der Kunde entschieden/bezahlt hat), verschwindet das Angebot wieder. */
export async function partnerStatusChanged(
  orderId: string, itemKey: string | null, status: string,
  _deps?: { makeLink?: (amount: number, cur: "usd" | "eur") => Promise<string> },
): Promise<void> {
  if (!pool || !orderId) return;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1 AND service='reviews'`, [orderId]);
  if (!r.rows[0]) return; // nur Einzelbewertungen
  const raw = (r.rows[0].raw || {}) as Record<string, unknown>;
  const sw: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
  if (status === "software" && itemKey) {
    const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
    const it = items.find((x) => keyOf(x) === itemKey) || { url: /^https?:/.test(itemKey) ? itemKey : undefined };
    if (!sw.some((x) => keyOf(x) === itemKey)) await setOrderRawField(orderId, "reviewsSoftware", [...sw, { ...it, nt: true, sw: true }]);
  } else if (itemKey && ["new", "working", "not_possible"].includes(status) && sw.some((x) => keyOf(x) === itemKey)) {
    const dec = ((raw.reviewsSwDecision as Record<string, Decision>) || {})[itemKey];
    const pays: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
    const paid = pays.some((p) => p.kind === "software" && p.paid && (!p.keys?.length || p.keys.includes(itemKey)));
    if (!dec && !paid) await setOrderRawField(orderId, "reviewsSoftware", sw.filter((x) => keyOf(x) !== itemKey));
  }
  // Sammel-Mail planen bzw. verschieben (Debounce).
  await pool.query(
    `INSERT INTO cust_notify (order_id, due_at, keys) VALUES ($1, now() + ($2 || ' minutes')::interval, $3::jsonb)
     ON CONFLICT (order_id) DO UPDATE SET due_at = EXCLUDED.due_at,
       keys = (SELECT jsonb_agg(DISTINCT k) FROM jsonb_array_elements(cust_notify.keys || EXCLUDED.keys) k)`,
    [orderId, String(NOTIFY_DELAY_MIN), JSON.stringify(itemKey ? [itemKey] : [])],
  );
}

/** Fällige Sammel-Mails holen (und aus der Warteschlange nehmen). */
export async function takeDueNotifications(): Promise<{ orderId: string; email: string; name: string; lang: string; country: string | null; cur: string; swPrice: number; swDeposit: number; keys: string[]; changed: { url: string | null; name: string | null; status: ItemStatus }[] }[]> {
  if (!pool) return [];
  const due = await pool.query(`DELETE FROM cust_notify WHERE due_at <= now() RETURNING order_id, keys`);
  const out = [];
  for (const d of due.rows) {
    const o = await pool.query(`SELECT id, created_at, status, pay, lang, country, profile, company, name, email, raw FROM orders WHERE id=$1`, [d.order_id]);
    const row = o.rows[0];
    if (!row || !row.email) continue;
    const pt = await pool.query(`SELECT item_key, status, working_since FROM partner_tasks WHERE order_id=$1 AND status <> 'cancelled'`, [d.order_id]);
    const view = orderView(row, new Map(pt.rows.map((x) => [x.item_key, { status: x.status, since: x.working_since }])));
    const keys: string[] = Array.isArray(d.keys) ? d.keys : [];
    const changed = view.items.filter((v) => keys.includes(v.key)).map((v) => ({ url: v.url, name: v.name, status: v.status }));
    out.push({ orderId: row.id, email: row.email, name: row.name || "", lang: row.lang || "en", country: row.country, cur: view.cur, swPrice: view.swPrice, swDeposit: view.swDeposit, changed, keys });
  }
  return out;
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
export function registerCustomerAdminRoutes(app: FastifyInstance, adminToken: string): void {
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
