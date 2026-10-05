/* Partner-Login (rapid-remove.com/partner): E-Mail + Passwort wie im Kunden-Dashboard.
 * Einrichten: der Partner öffnet einmal seinen persönlichen Link (#token) und legt dort
 * E-Mail + Passwort fest. Danach reicht /partner + Login. Der Link funktioniert weiterhin
 * (und dient auch als „Passwort vergessen": darüber neues Passwort setzen).
 * Sitzungen: "ps_<zufall>" (nur der Hash liegt in der DB), 60 Tage gültig. */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { hashPassword, verifyPassword, newPassword } from "./customers";
import { savePartnerSub } from "./partnerNotify";

/* Passwort zusätzlich verschlüsselt ablegen, damit der Admin es jederzeit sehen kann
   (AES-256-GCM, Schlüssel aus ADMIN_TOKEN abgeleitet – liegt nur auf dem Server). */
const encKey = () => crypto.createHash("sha256").update("partner-pw|" + (process.env.ADMIN_TOKEN || "")).digest();
function encPw(pw: string): string | null {
  if (!process.env.ADMIN_TOKEN) return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", encKey(), iv);
  const data = Buffer.concat([c.update(pw, "utf8"), c.final()]);
  return [iv.toString("base64url"), c.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}
function decPw(v: string | null): string | null {
  try {
    if (!v) return null;
    const [iv, tag, data] = v.split(".").map((x) => Buffer.from(x, "base64url"));
    const d = crypto.createDecipheriv("aes-256-gcm", encKey(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString("utf8");
  } catch { return null; }
}

/** Login-Adresse des Partners (vom Inhaber freigegeben) – wird beim Start einmal mit Passwort angelegt. */
const SEED_PARTNER_EMAIL = "reputationvaultagency@gmail.com";
const SEED_PW_HASH = "s1$62143114aa9a2ba0766acc3e909667ed$6d7db903ddf790a9a1270dead3dbb9697396bde3a2af2afa26d65f3f2d9505e4";

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const norm = (e: unknown) => String(e || "").trim().toLowerCase().slice(0, 200);

export async function initPartnerAuth(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_accounts (email text PRIMARY KEY, pass_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), last_login timestamptz)`);
  await pool.query(`ALTER TABLE partner_accounts ADD COLUMN IF NOT EXISTS pw_enc text`);
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
/** Für Passkeys: E-Mail zur Partner-Sitzung bzw. neue Sitzung. */
export async function partnerSessionEmail(t: unknown): Promise<string | null> {
  const s = String(t || "");
  if (!pool || !s.startsWith("ps_")) return null;
  const r = await pool.query(`SELECT email FROM partner_sessions WHERE token_hash=$1 AND expires_at > now()`, [sha(s)]);
  return r.rows[0]?.email ?? null;
}
export async function createPartnerSession(email: string): Promise<string | null> {
  if (!pool) return null;
  const ex = await pool.query(`SELECT 1 FROM partner_accounts WHERE email=$1`, [email]);
  return ex.rowCount ? newSession(email) : null;
}
async function newSession(email: string): Promise<string> {
  const token = "ps_" + crypto.randomBytes(24).toString("base64url");
  await pool!.query(`INSERT INTO partner_sessions (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 days')`, [sha(token), email]);
  await pool!.query(`UPDATE partner_accounts SET last_login=now() WHERE email=$1`, [email]);
  return token;
}

/** Einmal beim Start: Partner-Login anlegen (falls noch nicht vorhanden), Passwort für den Admin sichtbar. */
export async function seedPartnerAccount(log: (m: string) => void): Promise<void> {
  if (!pool) return;
  const ex = await pool.query(`SELECT 1 FROM partner_accounts WHERE email=$1`, [SEED_PARTNER_EMAIL]);
  if (!ex.rowCount) {
    const pw = newPassword();
    await pool.query(`INSERT INTO partner_accounts (email, pass_hash, pw_enc) VALUES ($1,$2,$3)`, [SEED_PARTNER_EMAIL, hashPassword(pw), encPw(pw)]);
    log("Partner-Login angelegt (Passwort im Admin → Partner sichtbar)");
  }
  // Einmalig: Passwort, das dem Inhaber im Chat übergeben wurde (hier nur der scrypt-Hash, nie das Passwort).
  // Im Admin sichtbar ab dem ersten Login des Partners (dann wird es verschlüsselt mitgespeichert).
  const flag = await pool.query(`SELECT 1 FROM partner_settings WHERE key='seed_pw_v2'`);
  if (!flag.rowCount) {
    await pool.query(`UPDATE partner_accounts SET pass_hash=$2, pw_enc=NULL WHERE email=$1`, [SEED_PARTNER_EMAIL, SEED_PW_HASH]);
    await pool.query(`INSERT INTO partner_settings (key, value) VALUES ('seed_pw_v2', $1) ON CONFLICT (key) DO NOTHING`, [new Date().toISOString()]);
    log("Partner-Passwort (übergeben) gesetzt");
  }
}

export function registerPartnerAuth(app: FastifyInstance, adminToken = ""): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Admin: Partner-Logins inkl. Passwort (volle Kontrolle für den Inhaber).
  app.post("/admin/partner/accounts", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const r = await pool.query(`SELECT email, pw_enc, created_at, last_login FROM partner_accounts ORDER BY created_at`);
    const subs = await pool.query(`SELECT count(*)::int AS n FROM partner_push_subs`).catch(() => ({ rows: [{ n: 0 }] }));
    return { ok: true, pushDevices: subs.rows[0].n, accounts: r.rows.map((x) => ({ email: x.email, password: decPw(x.pw_enc), created: x.created_at, lastLogin: x.last_login })) };
  });

  // Admin: Login anlegen/ändern (E-Mail umbenennen, Passwort setzen oder neu erzeugen).
  app.post("/admin/partner/account-set", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const email = norm(b.email); const old = norm(b.oldEmail);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    const pw = String(b.password || "").trim() || newPassword();
    if (pw.length < 8) return reply.code(400).send({ ok: false, error: "Passwort mind. 8 Zeichen" });
    if (old && old !== email) {
      await pool.query(`UPDATE partner_accounts SET email=$2 WHERE email=$1`, [old, email]);
      await pool.query(`UPDATE partner_sessions SET email=$2 WHERE email=$1`, [old, email]);
    }
    await pool.query(`INSERT INTO partner_accounts (email, pass_hash, pw_enc) VALUES ($1,$2,$3) ON CONFLICT (email) DO UPDATE SET pass_hash=$2, pw_enc=$3`, [email, hashPassword(pw), encPw(pw)]);
    return { ok: true, email, password: pw };
  });

  // Partner-App: Push-Abo des Geräts speichern (Home-Bildschirm-App).
  app.post("/partner/push-subscribe", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const t = String(b.t || "");
    if (!(await isPartnerSession(t)) && !(await isLinkToken(t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const sub = (b.sub || {}) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return reply.code(400).send({ ok: false, error: "subscription" });
    await savePartnerSub({ endpoint: String(sub.endpoint), keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } });
    return { ok: true };
  });

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
    const r = await pool.query(`SELECT pass_hash, pw_enc FROM partner_accounts WHERE email=$1`, [email]);
    if (!r.rows[0] || !verifyPassword(String(b.password || ""), r.rows[0].pass_hash)) return reply.code(401).send({ ok: false, error: "invalid" });
    // Admin soll das Passwort jederzeit sehen: beim Login verschlüsselt mitspeichern, falls noch nicht vorhanden.
    if (!r.rows[0].pw_enc) await pool.query(`UPDATE partner_accounts SET pw_enc=$2 WHERE email=$1`, [email, encPw(String(b.password || ""))]).catch(() => {});
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
    await pool.query(`INSERT INTO partner_accounts (email, pass_hash, pw_enc) VALUES ($1,$2,$3) ON CONFLICT (email) DO UPDATE SET pass_hash=$2, pw_enc=$3`, [email, hashPassword(pw), encPw(pw)]);
    await pool.query(`DELETE FROM partner_sessions WHERE email=$1`, [email]);
    return { ok: true, token: await newSession(email) };
  });
}
