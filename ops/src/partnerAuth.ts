/* Partner-Login (rapid-remove.com/partner): E-Mail + Passwort wie im Kunden-Dashboard.
 * Einrichten: der Partner öffnet einmal seinen persönlichen Link (#token) und legt dort
 * E-Mail + Passwort fest. Danach reicht /partner + Login. Der Link funktioniert weiterhin
 * (und dient auch als „Passwort vergessen": darüber neues Passwort setzen).
 * Sitzungen: "ps_<zufall>" (nur der Hash liegt in der DB), 60 Tage gültig. */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { hashPassword, verifyPassword } from "./customers";

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const norm = (e: unknown) => String(e || "").trim().toLowerCase().slice(0, 200);

export async function initPartnerAuth(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_accounts (email text PRIMARY KEY, pass_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), last_login timestamptz)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_sessions (token_hash text PRIMARY KEY, email text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL)`);
}

/** Gültige Partner-Sitzung? (wird in checkPartnerToken zusätzlich zum geheimen Link akzeptiert) */
export async function isPartnerSession(t: string): Promise<boolean> {
  if (!pool || !t.startsWith("ps_") || t.length < 30) return false;
  const r = await pool.query(`SELECT 1 FROM partner_sessions WHERE token_hash=$1 AND expires_at > now()`, [sha(t)]).catch(() => ({ rowCount: 0 }));
  return !!r.rowCount;
}
async function isLinkToken(t: string): Promise<boolean> {
  if (!pool || t.length < 16 || t.startsWith("ps_")) return false;
  const r = await pool.query(`SELECT value FROM partner_settings WHERE key='token'`);
  const real = String(r.rows[0]?.value || "");
  return !!real && real.length === t.length && crypto.timingSafeEqual(Buffer.from(real), Buffer.from(t));
}
async function newSession(email: string): Promise<string> {
  const token = "ps_" + crypto.randomBytes(24).toString("base64url");
  await pool!.query(`INSERT INTO partner_sessions (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 days')`, [sha(token), email]);
  await pool!.query(`UPDATE partner_accounts SET last_login=now() WHERE email=$1`, [email]);
  return token;
}

export function registerPartnerAuth(app: FastifyInstance): void {
  const hits = new Map<string, number[]>();
  const limited = (k: string, n: number) => {
    const now = Date.now(); const a = (hits.get(k) || []).filter((x) => now - x < 10 * 60_000);
    if (a.length >= n) { hits.set(k, a); return true; }
    a.push(now); hits.set(k, a); return false;
  };

  app.post("/partner/login", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("pl:" + req.ip, 20)) return reply.code(429).send({ ok: false, error: "too_many" });
    const email = norm(b.email);
    const r = await pool.query(`SELECT pass_hash FROM partner_accounts WHERE email=$1`, [email]);
    if (!r.rows[0] || !verifyPassword(String(b.password || ""), r.rows[0].pass_hash)) return reply.code(401).send({ ok: false, error: "invalid" });
    return { ok: true, token: await newSession(email) };
  });

  app.post("/partner/logout", async (req) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (pool && String(b.t || "").startsWith("ps_")) await pool.query(`DELETE FROM partner_sessions WHERE token_hash=$1`, [sha(String(b.t))]);
    return { ok: true };
  });

  // Mit dem persönlichen Link: gibt es schon einen Login?
  app.post("/partner/auth-status", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const t = String(b.t || "");
    if (await isPartnerSession(t)) return { ok: true, via: "session" };
    if (!(await isLinkToken(t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const r = await pool!.query(`SELECT email FROM partner_accounts ORDER BY created_at LIMIT 1`);
    return { ok: true, via: "link", account: r.rows[0]?.email || null };
  });

  // Login einrichten bzw. neues Passwort setzen — nur mit dem persönlichen Link.
  app.post("/partner/setup", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("ps:" + req.ip, 10)) return reply.code(429).send({ ok: false, error: "too_many" });
    if (!(await isLinkToken(String(b.t || "")))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const email = norm(b.email);
    const pw = String(b.password || "");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "email" });
    if (pw.length < 8) return reply.code(400).send({ ok: false, error: "password" });
    await pool.query(`INSERT INTO partner_accounts (email, pass_hash) VALUES ($1,$2) ON CONFLICT (email) DO UPDATE SET pass_hash=$2`, [email, hashPassword(pw)]);
    await pool.query(`DELETE FROM partner_sessions WHERE email=$1`, [email]);
    return { ok: true, token: await newSession(email) };
  });
}
