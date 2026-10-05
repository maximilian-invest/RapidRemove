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
import { pool, setOrderRawField } from "./db";

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
function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32);
  return `s1$${salt.toString("hex")}$${h.toString("hex")}`;
}
function verifyPassword(pw: string, stored: string): boolean {
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
export type CustPayment = { id: string; kind: "deposit" | "software" | "invoice"; amount: number; cur: string; url: string; n?: number; created: string; paid?: string | null };
export async function addOrderPayment(orderId: string, p: Omit<CustPayment, "id" | "created" | "paid">): Promise<void> {
  if (!pool || !orderId || !p.url) return;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [orderId]);
  const list: CustPayment[] = Array.isArray(r.rows[0]?.raw?.reviewsPayments) ? r.rows[0].raw.reviewsPayments : [];
  list.push({ ...p, id: crypto.randomBytes(5).toString("hex"), created: new Date().toISOString(), paid: null });
  await setOrderRawField(orderId, "reviewsPayments", list.slice(-30));
}
/** Stripe-Zahlung (E-Mail + Betrag) der passenden offenen Zahlung eines Bewertungs-Auftrags zuordnen. */
export async function markReviewPaymentPaid(email: string, amountMajor: number): Promise<{ orderId: string; kind: string } | null> {
  if (!pool || !email || !amountMajor) return null;
  const r = await pool.query(
    `SELECT id, raw FROM orders WHERE lower(email)=lower($1) AND service='reviews' AND raw ? 'reviewsPayments' ORDER BY created_at DESC LIMIT 10`,
    [email],
  );
  for (const row of r.rows) {
    const list: CustPayment[] = Array.isArray(row.raw?.reviewsPayments) ? row.raw.reviewsPayments : [];
    const hit = list.find((p) => !p.paid && Math.abs(Number(p.amount) - amountMajor) < 0.01);
    if (hit) {
      hit.paid = new Date().toISOString();
      await setOrderRawField(row.id, "reviewsPayments", list);
      return { orderId: row.id, kind: hit.kind };
    }
  }
  return null;
}

/* ---- Status je Bewertung (für das Dashboard) ---- */
type Item = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean };
const keyOf = (it: Item) => it.url || `${it.name || ""}|${it.text || ""}`;
export type ItemStatus = "checking" | "in_progress" | "removed" | "not_removable" | "software_offer" | "software_in_progress" | "cancelled";

function orderView(o: { id: string; created_at: string; status: string | null; pay: string | null; lang: string | null; country: string | null; profile: string | null; company: string | null; raw: Record<string, unknown> | null }) {
  const raw = (o.raw || {}) as Record<string, unknown>;
  const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
  const accepted: Item[] | null = Array.isArray(raw.reviewsAccepted) ? (raw.reviewsAccepted as Item[]) : null;
  const software: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
  const removed: Item[] = Array.isArray(raw.reviewsRemovedAll) ? (raw.reviewsRemovedAll as Item[]) : Array.isArray(raw.reviewsRemoved) ? (raw.reviewsRemoved as Item[]) : [];
  const payments: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
  const acc = new Set((accepted || []).map(keyOf));
  const sw = new Set(software.map(keyOf));
  const rem = new Set(removed.map(keyOf));
  const swPaid = payments.some((p) => p.kind === "software" && p.paid);
  const cancelled = o.status === "storniert";
  const view = items.map((it) => {
    const k = keyOf(it);
    let status: ItemStatus = "checking";
    if (rem.has(k)) status = "removed";
    else if (cancelled) status = "cancelled";
    else if (acc.has(k)) status = "in_progress";
    else if (sw.has(k)) status = swPaid ? "software_in_progress" : "software_offer";
    else if (accepted) status = "not_removable";
    return { url: it.url || null, name: it.name || null, text: it.text || null, noText: !!it.nt, status };
  });
  return {
    id: o.id, created: o.created_at, lang: o.lang, cur: o.country === "US" ? "usd" : "eur",
    business: o.company || o.profile || "", cancelled, items: view,
    payments: payments.map((p) => ({ id: p.id, kind: p.kind, amount: p.amount, cur: p.cur, url: p.paid ? null : p.url, n: p.n || null, created: p.created, paid: p.paid || null })),
  };
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
    const r = await pool.query(
      `SELECT id, created_at, status, pay, lang, country, profile, company, name, raw FROM orders
        WHERE lower(email)=$1 AND service='reviews' ORDER BY created_at DESC LIMIT 20`,
      [email],
    );
    return { ok: true, email, name: r.rows[0]?.name || "", lang: r.rows[0]?.lang || "en", orders: r.rows.map(orderView) };
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
