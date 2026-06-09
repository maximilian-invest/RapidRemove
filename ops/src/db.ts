/* RapidRemove ops — Postgres-Anbindung (Railway).
 *
 * Speichert Bestellungen (orders) und Profil-Prüfungen (checks). Ist
 * DATABASE_URL nicht gesetzt, läuft das Backend ohne DB weiter (E-Mail-
 * Versand funktioniert trotzdem) und alle DB-Funktionen sind No-ops –
 * das Dashboard zeigt dann weiter die Demo-Daten (db:false).
 */
import { Pool } from "pg";

const url = process.env.DATABASE_URL || "";
// Railway-intern (.railway.internal) und localhost brauchen kein SSL; öffentliche Proxy-URLs schon.
const needSSL = !!url && !/localhost|127\.0\.0\.1|\.railway\.internal/.test(url);
export const pool = url
  ? new Pool({ connectionString: url, ssl: needSSL ? { rejectUnauthorized: false } : undefined, max: 5 })
  : null;

export function dbReady(): boolean {
  return !!pool;
}

/** Legt die Tabellen an, falls sie fehlen (idempotent). */
export async function initDb(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS checks (
      id          text PRIMARY KEY,
      created_at  timestamptz NOT NULL DEFAULT now(),
      profile     text,
      category    text,
      rating      text,
      reviews     integer,
      flagged     integer,
      recommend   text,
      name        text,
      email       text,
      country     text,
      lang        text,
      status      text NOT NULL DEFAULT 'neu',
      order_id    text
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id          text PRIMARY KEY,
      created_at  timestamptz NOT NULL DEFAULT now(),
      name        text,
      email       text,
      phone       text,
      company     text,
      country     text,
      lang        text,
      profile     text,
      category    text,
      rating      text,
      reviews     integer,
      service     text,
      protection  text,
      amount      numeric,
      prot_amount numeric,
      status      text NOT NULL DEFAULT 'new',
      pay         text NOT NULL DEFAULT 'pending',
      note        text,
      check_id    text,
      raw         jsonb
    )
  `);
  // Selbstheilung: fehlende Spalten ergänzen, falls die Tabelle aus einer älteren Version stammt.
  await pool.query(`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS name text, ADD COLUMN IF NOT EXISTS email text, ADD COLUMN IF NOT EXISTS phone text,
      ADD COLUMN IF NOT EXISTS company text, ADD COLUMN IF NOT EXISTS country text, ADD COLUMN IF NOT EXISTS lang text,
      ADD COLUMN IF NOT EXISTS profile text, ADD COLUMN IF NOT EXISTS category text, ADD COLUMN IF NOT EXISTS rating text,
      ADD COLUMN IF NOT EXISTS reviews integer, ADD COLUMN IF NOT EXISTS service text, ADD COLUMN IF NOT EXISTS protection text,
      ADD COLUMN IF NOT EXISTS amount numeric, ADD COLUMN IF NOT EXISTS prot_amount numeric, ADD COLUMN IF NOT EXISTS status text,
      ADD COLUMN IF NOT EXISTS pay text, ADD COLUMN IF NOT EXISTS note text, ADD COLUMN IF NOT EXISTS check_id text,
      ADD COLUMN IF NOT EXISTS raw jsonb
  `);
  await pool.query(`
    ALTER TABLE checks
      ADD COLUMN IF NOT EXISTS profile text, ADD COLUMN IF NOT EXISTS category text, ADD COLUMN IF NOT EXISTS rating text,
      ADD COLUMN IF NOT EXISTS reviews integer, ADD COLUMN IF NOT EXISTS flagged integer, ADD COLUMN IF NOT EXISTS recommend text,
      ADD COLUMN IF NOT EXISTS name text, ADD COLUMN IF NOT EXISTS email text, ADD COLUMN IF NOT EXISTS country text,
      ADD COLUMN IF NOT EXISTS lang text, ADD COLUMN IF NOT EXISTS status text, ADD COLUMN IF NOT EXISTS order_id text
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id          bigserial PRIMARY KEY,
      created_at  timestamptz NOT NULL DEFAULT now(),
      order_id    text,
      email       text,
      type        text,
      title       text,
      detail      text,
      auto        boolean NOT NULL DEFAULT false
    )
  `);
  // Selbstheilung: Spalten ergänzen, falls events aus einer älteren Version stammt.
  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS email text`);
  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS auto boolean NOT NULL DEFAULT false`);
  // Geplante Upsell-Mails (Serie „Hinweis zum Schutzmodell" über ~2 Wochen).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS upsell_jobs (
      id          bigserial PRIMARY KEY,
      created_at  timestamptz NOT NULL DEFAULT now(),
      email       text NOT NULL,
      lang        text NOT NULL DEFAULT 'de',
      step        integer NOT NULL,
      send_at     timestamptz NOT NULL,
      sent_at     timestamptz,
      attempts    integer NOT NULL DEFAULT 0,
      canceled    boolean NOT NULL DEFAULT false,
      dedup_key   text NOT NULL,
      UNIQUE (dedup_key, step)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS upsell_jobs_due
      ON upsell_jobs (send_at) WHERE sent_at IS NULL AND canceled = false
  `);
}

export type OrderInput = {
  id: string; name?: string; email?: string; phone?: string; company?: string;
  country?: string; lang?: string; profile?: string; category?: string; rating?: string;
  reviews?: number; service?: string; protection?: string; amount?: number; protAmount?: number;
  note?: string; checkId?: string; raw?: unknown;
};

export async function insertOrder(o: OrderInput): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO orders
       (id,name,email,phone,company,country,lang,profile,category,rating,reviews,service,protection,amount,prot_amount,note,check_id,raw)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     ON CONFLICT (id) DO NOTHING`,
    [o.id, o.name || null, o.email || null, o.phone || null, o.company || null, o.country || null,
     o.lang || null, o.profile || null, o.category || null, o.rating || null, o.reviews ?? null,
     o.service || null, o.protection || null, o.amount ?? null, o.protAmount ?? null, o.note || null,
     o.checkId || null, o.raw ? JSON.stringify(o.raw) : null],
  );
}

export type CheckInput = {
  id: string; profile?: string; category?: string; rating?: string; reviews?: number;
  flagged?: number; recommend?: string; name?: string; email?: string; country?: string; lang?: string;
};

export async function upsertCheck(c: CheckInput): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO checks (id,profile,category,rating,reviews,flagged,recommend,name,email,country,lang)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       profile=EXCLUDED.profile, category=EXCLUDED.category, rating=EXCLUDED.rating,
       reviews=EXCLUDED.reviews, recommend=EXCLUDED.recommend, name=EXCLUDED.name,
       email=COALESCE(EXCLUDED.email, checks.email)`,
    [c.id, c.profile || null, c.category || null, c.rating || null, c.reviews ?? null, c.flagged ?? null,
     c.recommend || null, c.name || null, c.email || null, c.country || null, c.lang || null],
  );
}

/** Verknüpft eine Prüfung mit der daraus entstandenen Bestellung. */
export async function linkCheck(checkId: string, orderId: string): Promise<void> {
  if (!pool || !checkId) return;
  await pool.query(`UPDATE checks SET order_id=$2, status='konvertiert' WHERE id=$1`, [checkId, orderId || null]);
}

export async function listOrders(limit = 200): Promise<Record<string, unknown>[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT $1`, [limit]);
  return r.rows;
}

export async function listChecks(limit = 200): Promise<Record<string, unknown>[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT * FROM checks ORDER BY created_at DESC LIMIT $1`, [limit]);
  return r.rows;
}

/**
 * Aktivität protokollieren (best effort – wirft nie). Verknüpft über orderId
 * oder – bei automatisierten Mails – über die Kunden-E-Mail (orderId wird dann
 * aus der jüngsten Bestellung aufgelöst; ohne Treffer wird die E-Mail getaggt).
 */
export async function insertEvent(e: { orderId?: string; email?: string; type?: string; title?: string; detail?: string; auto?: boolean }): Promise<void> {
  if (!pool) return;
  try {
    let orderId = e.orderId || null;
    if (!orderId && e.email) orderId = await latestOrderId(e.email);
    if (!orderId && !e.email) return; // nichts, woran sich der Eintrag hängen ließe
    await pool.query(
      `INSERT INTO events (order_id, email, type, title, detail, auto) VALUES ($1,$2,$3,$4,$5,$6)`,
      [orderId, e.email || null, e.type || "info", e.title || "", e.detail || "", e.auto === true],
    );
  } catch { /* Logging darf den Hauptablauf nie stören */ }
}

/** Aktivitäts-Verlauf einer Bestellung (neueste zuerst). */
export async function listEvents(orderId: string, limit = 100): Promise<Record<string, unknown>[]> {
  if (!pool || !orderId) return [];
  const r = await pool.query(`SELECT * FROM events WHERE order_id=$1 ORDER BY created_at DESC LIMIT $2`, [orderId, limit]);
  return r.rows;
}

/** Aktivitäts-Verlauf zu einer Kunden-E-Mail: direkt getaggte Events ODER über deren Bestellungen. */
export async function listEventsByEmail(email: string, limit = 100): Promise<Record<string, unknown>[]> {
  if (!pool || !email) return [];
  const r = await pool.query(
    `SELECT e.* FROM events e
       LEFT JOIN orders o ON o.id = e.order_id
      WHERE lower(e.email) = lower($1) OR lower(o.email) = lower($1)
      ORDER BY e.created_at DESC LIMIT $2`,
    [email, limit],
  );
  return r.rows;
}

/** Jüngste Bestellung zu einer E-Mail (ID + Service-Key, z. B. "remove" | "reset"). */
export async function latestOrder(email: string): Promise<{ id: string; service: string | null } | null> {
  if (!pool || !email) return null;
  const r = await pool.query(
    `SELECT id, service FROM orders WHERE lower(email) = lower($1) ORDER BY created_at DESC LIMIT 1`,
    [email],
  );
  const row = r.rows[0];
  return row ? { id: row.id as string, service: (row.service as string) ?? null } : null;
}

/** ID der jüngsten Bestellung zu einer E-Mail (für Aktivitäts-Verknüpfung). */
export async function latestOrderId(email: string): Promise<string | null> {
  return (await latestOrder(email))?.id ?? null;
}

/**
 * Plant die Upsell-Serie ein: je eine Mail pro Versatz (Default Tag 0/7/14).
 * Idempotent über (dedup_key, step) – mehrfache Webhook-Events legen nichts doppelt an.
 * Liefert die Anzahl neu eingeplanter Mails.
 */
export async function enqueueUpsellSeries(opts: {
  email: string; lang: string; dedupKey: string; offsetsDays?: number[];
}): Promise<number> {
  if (!pool) return 0;
  const offsets = opts.offsetsDays?.length ? opts.offsetsDays : [0, 7, 14];
  const now = Date.now();
  let inserted = 0;
  for (let i = 0; i < offsets.length; i++) {
    const sendAt = new Date(now + offsets[i] * 86_400_000);
    const r = await pool.query(
      `INSERT INTO upsell_jobs (email, lang, step, send_at, dedup_key)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (dedup_key, step) DO NOTHING`,
      [opts.email, opts.lang === "en" ? "en" : "de", i + 1, sendAt, opts.dedupKey],
    );
    inserted += r.rowCount || 0;
  }
  return inserted;
}

/** Fällige, noch nicht versandte Upsell-Mails (älteste zuerst). */
export async function dueUpsellJobs(limit = 25): Promise<{ id: string; email: string; lang: string; step: number }[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, email, lang, step FROM upsell_jobs
     WHERE sent_at IS NULL AND canceled = false AND send_at <= now()
     ORDER BY send_at ASC LIMIT $1`,
    [limit],
  );
  return r.rows as { id: string; email: string; lang: string; step: number }[];
}

/** Markiert eine Upsell-Mail als versandt. */
export async function markUpsellSent(id: string | number): Promise<void> {
  if (!pool) return;
  await pool.query(`UPDATE upsell_jobs SET sent_at = now() WHERE id = $1`, [id]);
}

/** Zählt einen Fehlversuch; ab `max` Versuchen wird aufgegeben (als versandt markiert). */
export async function bumpUpsellAttempt(id: string | number, max = 3): Promise<void> {
  if (!pool) return;
  await pool.query(
    `UPDATE upsell_jobs
       SET attempts = attempts + 1,
           sent_at = CASE WHEN attempts + 1 >= $2 THEN now() ELSE sent_at END
     WHERE id = $1`,
    [id, max],
  );
}

/** Stoppt alle noch offenen Upsell-Mails einer E-Mail (z. B. wenn der Schutz gebucht wurde). */
export async function cancelUpsellForEmail(email: string): Promise<number> {
  if (!pool || !email) return 0;
  const r = await pool.query(
    `UPDATE upsell_jobs SET canceled = true
     WHERE lower(email) = lower($1) AND sent_at IS NULL AND canceled = false`,
    [email],
  );
  return r.rowCount || 0;
}

/** Zeilen-Zähler für Diagnose (z. B. /health). */
export async function dbCounts(): Promise<{ orders: number; checks: number }> {
  if (!pool) return { orders: 0, checks: 0 };
  const r = await pool.query(
    `SELECT (SELECT count(*) FROM orders)::int AS orders, (SELECT count(*) FROM checks)::int AS checks`,
  );
  return { orders: r.rows[0]?.orders || 0, checks: r.rows[0]?.checks || 0 };
}
