/* Face ID / Touch ID / Fingerabdruck-Login (Passkeys, WebAuthn) für Kunden-Dashboard und Partner-App.
 * Aktivieren nur mit gültiger Sitzung (nach normalem Login), danach Login per Passkey ohne Passwort.
 * Discoverable Credentials → kein E-Mail-Feld nötig. Challenges nur im Speicher (5 Min.). */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import {
  generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { pool } from "./db";
import { customerSessionEmail, createCustomerSession } from "./customers";
import { logCustEvent, deviceOf } from "./custTrack";
import { partnerSessionEmail, createPartnerSession } from "./partnerAuth";

type Role = "customer" | "partner";
const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
const ORIGINS = (process.env.PASSKEY_ORIGINS || `${SITE_URL},${SITE_URL.replace("://www.", "://")}`).split(",").map((s) => s.trim()).filter(Boolean);
const RP_ID = process.env.PASSKEY_RP_ID || new URL(SITE_URL).hostname.replace(/^www\./, "");
const RP_NAME = "RapidRemove";

export async function initPasskeys(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS passkeys (
      id          text PRIMARY KEY,
      role        text NOT NULL,
      email       text NOT NULL,
      public_key  text NOT NULL,
      counter     bigint NOT NULL DEFAULT 0,
      transports  jsonb,
      created_at  timestamptz NOT NULL DEFAULT now(),
      last_used   timestamptz
    )`);
}

const challenges = new Map<string, { challenge: string; role: Role; email?: string; at: number }>();
const putChallenge = (v: { challenge: string; role: Role; email?: string }) => {
  const now = Date.now();
  for (const [k, x] of challenges) if (now - x.at > 5 * 60_000) challenges.delete(k);
  const id = crypto.randomBytes(16).toString("base64url");
  challenges.set(id, { ...v, at: now });
  return id;
};
const takeChallenge = (id: unknown) => {
  const v = challenges.get(String(id || ""));
  if (v) challenges.delete(String(id));
  return v && Date.now() - v.at < 5 * 60_000 ? v : null;
};
const roleOf = (r: unknown): Role | null => (r === "customer" || r === "partner" ? r : null);
const emailFor = (role: Role, token: unknown) => (role === "customer" ? customerSessionEmail(token) : partnerSessionEmail(token));

export function registerPasskeyRoutes(app: FastifyInstance): void {
  // Aktivieren (eingeloggt): Optionen holen.
  app.post("/passkey/register-options", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const role = roleOf(b.role);
    if (!role || !pool) return reply.code(400).send({ ok: false, error: "role" });
    const email = await emailFor(role, b.token);
    if (!email) return reply.code(401).send({ ok: false, error: "session" });
    const ex = await pool.query(`SELECT id, transports FROM passkeys WHERE role=$1 AND email=$2`, [role, email]);
    const options = await generateRegistrationOptions({
      rpName: RP_NAME, rpID: RP_ID, userName: email, userDisplayName: role === "partner" ? `${email} (Partner)` : email,
      userID: new TextEncoder().encode(`${role}:${email}`),
      attestationType: "none",
      excludeCredentials: ex.rows.map((x) => ({ id: x.id, transports: x.transports || undefined })),
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
    });
    return { ok: true, options, cid: putChallenge({ challenge: options.challenge, role, email }) };
  });

  // Aktivieren: Antwort des Geräts prüfen und speichern.
  app.post("/passkey/register-verify", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const ch = takeChallenge(b.cid);
    if (!ch || !ch.email || !pool) return reply.code(400).send({ ok: false, error: "expired" });
    const email = await emailFor(ch.role, b.token);
    if (email !== ch.email) return reply.code(401).send({ ok: false, error: "session" });
    try {
      const v = await verifyRegistrationResponse({ response: b.response as never, expectedChallenge: ch.challenge, expectedOrigin: ORIGINS, expectedRPID: RP_ID, requireUserVerification: false });
      if (!v.verified || !v.registrationInfo) return reply.code(400).send({ ok: false, error: "not_verified" });
      const c = v.registrationInfo.credential;
      await pool.query(
        `INSERT INTO passkeys (id, role, email, public_key, counter, transports) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET email=$3, public_key=$4, counter=$5, transports=$6`,
        [c.id, ch.role, email, Buffer.from(c.publicKey).toString("base64url"), c.counter || 0, JSON.stringify(c.transports || [])],
      );
      return { ok: true };
    } catch (e) {
      return reply.code(400).send({ ok: false, error: "not_verified", detail: String((e as Error).message).slice(0, 160) });
    }
  });

  // Login: Optionen (ohne E-Mail, das Gerät bietet den passenden Passkey an).
  app.post("/passkey/login-options", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const role = roleOf(b.role);
    if (!role) return reply.code(400).send({ ok: false, error: "role" });
    const options = await generateAuthenticationOptions({ rpID: RP_ID, userVerification: "preferred" });
    return { ok: true, options, cid: putChallenge({ challenge: options.challenge, role }) };
  });

  // Login: Antwort prüfen → normale Sitzung wie beim Passwort-Login.
  app.post("/passkey/login-verify", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const ch = takeChallenge(b.cid);
    if (!ch || !pool) return reply.code(400).send({ ok: false, error: "expired" });
    const resp = (b.response || {}) as { id?: string };
    const r = await pool.query(`SELECT * FROM passkeys WHERE id=$1 AND role=$2`, [String(resp.id || ""), ch.role]);
    const row = r.rows[0];
    if (!row) return reply.code(401).send({ ok: false, error: "unknown_passkey" });
    try {
      const v = await verifyAuthenticationResponse({
        response: b.response as never, expectedChallenge: ch.challenge, expectedOrigin: ORIGINS, expectedRPID: RP_ID, requireUserVerification: false,
        credential: { id: row.id, publicKey: new Uint8Array(Buffer.from(row.public_key, "base64url")), counter: Number(row.counter || 0), transports: row.transports || undefined },
      });
      if (!v.verified) return reply.code(401).send({ ok: false, error: "not_verified" });
      await pool.query(`UPDATE passkeys SET counter=$2, last_used=now() WHERE id=$1`, [row.id, v.authenticationInfo.newCounter || 0]);
      const token = ch.role === "customer" ? await createCustomerSession(row.email) : await createPartnerSession(row.email);
      if (!token) return reply.code(401).send({ ok: false, error: "account" });
      if (ch.role === "customer") void logCustEvent(row.email, "login", "Mit Face ID / Passkey", { device: deviceOf(String(req.headers["user-agent"] || "")) });
      return { ok: true, token };
    } catch (e) {
      return reply.code(401).send({ ok: false, error: "not_verified", detail: String((e as Error).message).slice(0, 160) });
    }
  });
}
