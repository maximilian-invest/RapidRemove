/* Auto-Mahnungen pro Kunde pausieren (Maximilian 16.10.2026: „für einzelne Kunden so einen Button").
 * Gilt für die E-Mail des Kunden, also für alle seine Aufträge:
 *   - Profil-Aufträge: automatische Mahnstufen 1–3 (payDunTick) und die Mail „Zahlungsziel abgelaufen" (payDueTick)
 *   - Bewertungen: Zahlungserinnerungen/Mahnstufen und Fortschritts-Updates mit offenem Betrag (followup.ts)
 * Manuelle Mahnungen über den Hauptbutton gehen weiter. until = null → bis auf Weiteres; danach läuft es von selbst weiter. */
import { pool } from "./db";

export type DunPause = { until: string | null; reason: string | null; since: string };

let ready: Promise<void> | null = null;
function ensure(): Promise<void> {
  if (!pool) return Promise.resolve();
  if (!ready) {
    ready = pool
      .query(`CREATE TABLE IF NOT EXISTS dun_pauses (email text PRIMARY KEY, until timestamptz, reason text, created_at timestamptz NOT NULL DEFAULT now())`)
      .then(() => undefined)
      .catch((e) => { ready = null; throw e; });
  }
  return ready;
}
const norm = (email: string) => String(email || "").trim().toLowerCase();

/** Aktive Pause des Kunden (abgelaufene zählen nicht). */
export async function getDunPause(email: string): Promise<DunPause | null> {
  const e = norm(email);
  if (!pool || !e) return null;
  await ensure();
  const r = await pool.query(`SELECT until, reason, created_at FROM dun_pauses WHERE email=$1 AND (until IS NULL OR until > now())`, [e]);
  const x = r.rows[0];
  if (!x) return null;
  return { until: x.until ? new Date(x.until).toISOString() : null, reason: x.reason || null, since: new Date(x.created_at).toISOString() };
}

export async function setDunPause(email: string, until: Date | null, reason: string | null): Promise<DunPause | null> {
  const e = norm(email);
  if (!pool || !e) return null;
  await ensure();
  await pool.query(
    `INSERT INTO dun_pauses (email, until, reason, created_at) VALUES ($1,$2,$3,now())
     ON CONFLICT (email) DO UPDATE SET until=EXCLUDED.until, reason=EXCLUDED.reason, created_at=now()`,
    [e, until ? until.toISOString() : null, reason ? reason.slice(0, 300) : null],
  );
  return getDunPause(e);
}

export async function clearDunPause(email: string): Promise<void> {
  const e = norm(email);
  if (!pool || !e) return;
  await ensure();
  await pool.query(`DELETE FROM dun_pauses WHERE email=$1`, [e]);
}
