/* Express-Löschung an/aus + Löschdauer Standard (Admin → Einstellungen → Express & Löschdauer).
 * partner_settings „express_on" = "1" (Standard) | "0". Aus = Website, Dashboard-Bestellung und Chat bieten Express nicht an
 * („Gerade nicht verfügbar …"); /order und Nachbestellungen ignorieren einen Express-Wunsch dann serverseitig.
 * partner_settings „dur_v2" = { fresh, other } je { min, max, unit "d"|"w" } (02.11.2026) – Website, Kunden-Dashboard,
 * Mails und Chatbot zeigen diese Dauer (siehe durations.ts).
 *   GET  /express-status               → { ok, on, dur }   (öffentlich, für Website + Dashboard)
 *   POST /admin/express   { token, on } → { ok, on }        (Admin)
 *   POST /admin/durations { token, dur } → { ok, dur }      (Admin) */
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { loadDurations, saveDurations, normTier } from "./durations";

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
  // Mails lesen die Dauer synchron (curDur) – darum beim Start laden und jede Minute auffrischen.
  void loadDurations().catch(() => undefined);
  setInterval(() => { void loadDurations().catch(() => undefined); }, 60_000).unref?.();
  app.get("/express-status", async (_req, reply) => {
    reply.header("cache-control", "no-store");
    const [on, dur] = await Promise.all([expressOn(), loadDurations()]);
    return { ok: true, on, dur };
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
  app.post("/admin/durations", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const d = (b.dur || {}) as Record<string, unknown>;
    const fresh = normTier(d.fresh), other = normTier(d.other);
    if (!fresh || !other) return reply.code(400).send({ ok: false, error: "Ungültige Dauer: von/bis ganze Zahlen 1–365, bis ≥ von, Einheit Tage oder Wochen" });
    const dur = await saveDurations({ fresh, other });
    app.log.info({ dur }, "Löschdauer geändert");
    return { ok: true, dur };
  });
}
