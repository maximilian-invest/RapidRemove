/* Web-Push an Kunden (Dashboard-App am Home-Bildschirm, Scope /my-reviews).
 * Kleine Statuswechsel gehen NUR per Push + Dashboard raus, Mails nur bei Wichtigem (siehe server.ts). */
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { hasWebPush, sendWebPushAll, type PushSub } from "./integrations/webpush";
import { customerSessionEmail, dashLink } from "./customers";

export async function initCustPush(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_push_subs (
    endpoint text PRIMARY KEY, email text NOT NULL, p256dh text NOT NULL, auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE INDEX IF NOT EXISTS cust_push_subs_email ON cust_push_subs (email)`);
}

/** Push an alle Geräte eines Kunden. Gibt zurück, ob mindestens ein Gerät registriert war. */
export async function notifyCustomer(email: string, title: string, body: string, tag?: string): Promise<boolean> {
  try {
    if (!pool || !hasWebPush() || !email) return false;
    const r = await pool.query(`SELECT endpoint, p256dh, auth FROM cust_push_subs WHERE email=$1`, [email.toLowerCase()]);
    if (!r.rows.length) return false;
    const subs: PushSub[] = r.rows.map((x) => ({ endpoint: x.endpoint, keys: { p256dh: x.p256dh, auth: x.auth } }));
    const expired = await sendWebPushAll(subs, { title, body, url: "/my-reviews", tag: tag || `rrc-${Date.now().toString(36)}` });
    for (const ep of expired) await pool.query(`DELETE FROM cust_push_subs WHERE endpoint=$1`, [ep]).catch(() => {});
    return subs.length > expired.length;
  } catch { return false; }
}

export function registerCustPushRoutes(app: FastifyInstance): void {
  // Persönlicher Start-Link für die App am Home-Bildschirm (iPhone hat dort einen eigenen Speicher →
  // ohne Code müsste sich der Kunde in der App neu einloggen). Max. 10 je Stunde und Kunde.
  const appHits = new Map<string, number[]>();
  app.post("/cust/app-link", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await customerSessionEmail(b.token);
    if (!email) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const now = Date.now();
    const hits = (appHits.get(email) || []).filter((t) => now - t < 3600_000);
    if (hits.length >= 10) return reply.code(429).send({ ok: false, error: "too_many" });
    appHits.set(email, [...hits, now]);
    const url = await dashLink(email, String(b.lang || "").slice(0, 2) || null);
    const k = new URL(url).searchParams.get("k");
    return k ? { ok: true, k } : reply.code(503).send({ ok: false, error: "unavailable" });
  });

  app.post("/cust/push-subscribe", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await customerSessionEmail(b.token);
    if (!email) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const sub = (b.sub || {}) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    if (!sub.endpoint || !/^https:\/\//.test(String(sub.endpoint)) || !sub.keys?.p256dh || !sub.keys?.auth) return reply.code(400).send({ ok: false, error: "subscription" });
    await pool.query(
      `INSERT INTO cust_push_subs (endpoint, email, p256dh, auth) VALUES ($1,$2,$3,$4)
       ON CONFLICT (endpoint) DO UPDATE SET email=$2, p256dh=$3, auth=$4`,
      [String(sub.endpoint).slice(0, 1000), email.toLowerCase(), String(sub.keys.p256dh).slice(0, 200), String(sub.keys.auth).slice(0, 100)],
    );
    return { ok: true };
  });
}
