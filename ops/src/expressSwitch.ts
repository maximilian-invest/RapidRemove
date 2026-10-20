/* Express-Löschung an/aus (Admin → Einstellungen, 20.10.2026).
 * partner_settings „express_on" = "1" (Standard) | "0". Aus = Website, Dashboard-Bestellung und Chat bieten Express nicht an
 * („Gerade nicht verfügbar …"); /order und Nachbestellungen ignorieren einen Express-Wunsch dann serverseitig.
 *   GET  /express-status            → { ok, on }            (öffentlich, für Website + Dashboard)
 *   POST /admin/express { token, on } → { ok, on }          (Admin) */
import type { FastifyInstance } from "fastify";
import { pool } from "./db";

let cache: { on: boolean; ts: number } | null = null;
export async function expressOn(): Promise<boolean> {
  if (cache && Date.now() - cache.ts < 15_000) return cache.on;
  let on = true;
  if (pool) {
    const r = await pool.query(`SELECT value FROM partner_settings WHERE key='express_on'`).catch(() => ({ rows: [] as { value: string }[] }));
    on = (r.rows[0]?.value ?? "1") !== "0";
  }
  cache = { on, ts: Date.now() };
  return on;
}

export function registerExpressSwitch(app: FastifyInstance, adminToken: string): void {
  app.get("/express-status", async (_req, reply) => {
    reply.header("cache-control", "no-store");
    return { ok: true, on: await expressOn() };
  });
  app.post("/admin/express", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const on = b.on !== false;
    await pool.query(`INSERT INTO partner_settings (key, value) VALUES ('express_on',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [on ? "1" : "0"]);
    cache = { on, ts: Date.now() };
    app.log.info({ on }, "Express-Löschung umgeschaltet");
    return { ok: true, on };
  });
}
