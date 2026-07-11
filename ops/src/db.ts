/* RapidRemove ops — Postgres-Anbindung (Railway).
 *
 * Speichert Bestellungen (orders) und Profil-Prüfungen (checks). Ist
 * DATABASE_URL nicht gesetzt, läuft das Backend ohne DB weiter (E-Mail-
 * Versand funktioniert trotzdem) und alle DB-Funktionen sind No-ops –
 * das Dashboard zeigt dann weiter die Demo-Daten (db:false).
 */
import { Pool } from "pg";
import type { DeletionRow } from "./gamification";

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
      done_at     timestamptz,
      note        text,
      check_id    text,
      raw         jsonb,
      form        jsonb,
      assignee    text
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
      ADD COLUMN IF NOT EXISTS raw jsonb, ADD COLUMN IF NOT EXISTS form jsonb,
      ADD COLUMN IF NOT EXISTS assignee text, ADD COLUMN IF NOT EXISTS done_at timestamptz,
      ADD COLUMN IF NOT EXISTS pay_locked boolean DEFAULT false
  `);
  // Backfill: bereits abgeschlossene Löschungen bekommen einen done_at-Zeitstempel
  // (Näherung über das Erstelldatum), damit die Gamification rückwirkend greift.
  await pool.query(`UPDATE orders SET done_at = created_at WHERE status='done' AND done_at IS NULL`);
  await pool.query(`
    ALTER TABLE checks
      ADD COLUMN IF NOT EXISTS profile text, ADD COLUMN IF NOT EXISTS category text, ADD COLUMN IF NOT EXISTS rating text,
      ADD COLUMN IF NOT EXISTS reviews integer, ADD COLUMN IF NOT EXISTS flagged integer, ADD COLUMN IF NOT EXISTS recommend text,
      ADD COLUMN IF NOT EXISTS name text, ADD COLUMN IF NOT EXISTS email text, ADD COLUMN IF NOT EXISTS country text,
      ADD COLUMN IF NOT EXISTS lang text, ADD COLUMN IF NOT EXISTS status text, ADD COLUMN IF NOT EXISTS order_id text,
      ADD COLUMN IF NOT EXISTS step integer, ADD COLUMN IF NOT EXISTS amount numeric, ADD COLUMN IF NOT EXISTS source text,
      ADD COLUMN IF NOT EXISTS place_id text, ADD COLUMN IF NOT EXISTS maps_uri text, ADD COLUMN IF NOT EXISTS addr text,
      ADD COLUMN IF NOT EXISTS enriched_at timestamptz
  `);
  // Verarbeitete Stripe-Zahlungen: jede Rechnung wird höchstens EINMAL einer Bestellung
  // gutgeschrieben (Schutz gegen wiederholte/fälschliche Auto-Zuordnung beim 10-Min-Abgleich).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reconciled_payments (
      invoice_id  text PRIMARY KEY,
      order_id    text,
      created_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
  // Bearbeitbare E-Mail-Vorlagen: pro Vorlage × Sprache die im Admin überschriebenen
  // Textfelder. Fehlt ein Feld/eine Sprache, greift der Default aus dem Code (emails/*.tsx).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS template_overrides (
      tkey        text NOT NULL,
      lang        text NOT NULL,
      fields      jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at  timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (tkey, lang)
    )
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
  // Für die 1:1-Mail-Vorschau im Admin: exakt versendetes HTML + Betreff am Event ablegen.
  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS html text`);
  await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS subject text`);
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint   text PRIMARY KEY,
      p256dh     text NOT NULL,
      auth       text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  // 301/302-Weiterleitungen, im Admin-Portal pflegbar; die Middleware der
  // Marketing-Site liest die aktiven Regeln über /redirects.json (gecacht).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS redirects (
      id          bigserial PRIMARY KEY,
      source      text NOT NULL UNIQUE,
      destination text NOT NULL,
      code        integer NOT NULL DEFAULT 301,
      enabled     boolean NOT NULL DEFAULT true,
      hits        bigint NOT NULL DEFAULT 0,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function savePushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<void> {
  if (!pool || !sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) return;
  await pool.query(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES ($1,$2,$3)
     ON CONFLICT (endpoint) DO UPDATE SET p256dh=$2, auth=$3`,
    [sub.endpoint, sub.keys.p256dh, sub.keys.auth],
  );
}

export async function listPushSubscriptions(): Promise<{ endpoint: string; keys: { p256dh: string; auth: string } }[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT endpoint, p256dh, auth FROM push_subscriptions`);
  return r.rows.map((x: { endpoint: string; p256dh: string; auth: string }) => ({ endpoint: x.endpoint, keys: { p256dh: x.p256dh, auth: x.auth } }));
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  if (!pool || !endpoint) return;
  await pool.query(`DELETE FROM push_subscriptions WHERE endpoint=$1`, [endpoint]);
}

/* ---- 301/302-Weiterleitungen (Admin-pflegbar) ---- */
export type RedirectRow = {
  id: number; source: string; destination: string; code: number;
  enabled: boolean; hits: number; created_at: string; updated_at: string;
};

/** Alle Weiterleitungen (inkl. deaktivierte) – für die Admin-Verwaltung. */
export async function listRedirects(): Promise<RedirectRow[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, source, destination, code, enabled, hits, created_at, updated_at
       FROM redirects ORDER BY created_at DESC`,
  );
  return r.rows as RedirectRow[];
}

/** Nur AKTIVE Regeln (schlank) – für die öffentliche /redirects.json der Middleware. */
export async function listEnabledRedirects(): Promise<{ source: string; destination: string; code: number }[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT source, destination, code FROM redirects WHERE enabled = true`);
  return r.rows as { source: string; destination: string; code: number }[];
}

const REDIRECT_CODES = [301, 302, 307, 308];

/** Anlegen (per source) oder aktualisieren (per id). Liefert die gespeicherte Zeile. */
export async function upsertRedirect(x: { id?: number | null; source: string; destination: string; code?: number; enabled?: boolean }): Promise<RedirectRow | null> {
  if (!pool) return null;
  const code = x.code && REDIRECT_CODES.includes(x.code) ? x.code : 301;
  const enabled = x.enabled !== false;
  if (x.id) {
    const r = await pool.query(
      `UPDATE redirects SET source=$2, destination=$3, code=$4, enabled=$5, updated_at=now() WHERE id=$1
       RETURNING id, source, destination, code, enabled, hits, created_at, updated_at`,
      [x.id, x.source, x.destination, code, enabled],
    );
    return (r.rows[0] as RedirectRow) || null;
  }
  const r = await pool.query(
    `INSERT INTO redirects (source, destination, code, enabled) VALUES ($1,$2,$3,$4)
     ON CONFLICT (source) DO UPDATE SET destination=EXCLUDED.destination, code=EXCLUDED.code,
       enabled=EXCLUDED.enabled, updated_at=now()
     RETURNING id, source, destination, code, enabled, hits, created_at, updated_at`,
    [x.source, x.destination, code, enabled],
  );
  return (r.rows[0] as RedirectRow) || null;
}

export async function deleteRedirect(id: number): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(`DELETE FROM redirects WHERE id=$1`, [id]);
  return (r.rowCount ?? 0) > 0;
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

/** Live-Go: ALLE Test-Bestelldaten löschen (orders/checks/events/upsell_jobs).
 *  Push-Abos (Admin-Geräte) bleiben erhalten. Einmalig vor dem echten Start. */
export async function wipeOrderData(): Promise<{ orders: number; checks: number; events: number; upsell: number }> {
  if (!pool) return { orders: 0, checks: 0, events: 0, upsell: 0 };
  const o = await pool.query(`DELETE FROM orders`);
  const c = await pool.query(`DELETE FROM checks`);
  const e = await pool.query(`DELETE FROM events`);
  const u = await pool.query(`DELETE FROM upsell_jobs`);
  return { orders: o.rowCount || 0, checks: c.rowCount || 0, events: e.rowCount || 0, upsell: u.rowCount || 0 };
}

/** Setzt NUR die Profil-Prüfungen zurück (Funnel/Leads). Bestellungen, Zahlungen
 *  und der Aktivitäts-Verlauf bleiben unberührt. Nicht umkehrbar. */
export async function wipeChecks(): Promise<{ checks: number }> {
  if (!pool) return { checks: 0 };
  const c = await pool.query(`DELETE FROM checks`);
  return { checks: c.rowCount || 0 };
}

export type CheckInput = {
  id: string; profile?: string; category?: string; rating?: string; reviews?: number;
  flagged?: number; recommend?: string; name?: string; email?: string; country?: string; lang?: string;
  step?: number; amount?: number; source?: string; placeId?: string; mapsUri?: string; addr?: string;
};

export async function upsertCheck(c: CheckInput): Promise<void> {
  if (!pool) return;
  // Partielles Upsert: leere Felder eines Folge-Updates (z. B. reines Schritt-Update
  // aus dem Funnel) überschreiben bestehende Werte NICHT (COALESCE). `step` wandert
  // nur nach oben (GREATEST) – so bleibt die erreichte Trichter-Tiefe erhalten.
  await pool.query(
    `INSERT INTO checks (id,profile,category,rating,reviews,flagged,recommend,name,email,country,lang,step,amount,source,place_id,maps_uri,addr)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (id) DO UPDATE SET
       profile=COALESCE(EXCLUDED.profile, checks.profile), category=COALESCE(EXCLUDED.category, checks.category),
       rating=COALESCE(EXCLUDED.rating, checks.rating), reviews=COALESCE(EXCLUDED.reviews, checks.reviews),
       flagged=COALESCE(EXCLUDED.flagged, checks.flagged), recommend=COALESCE(EXCLUDED.recommend, checks.recommend),
       name=COALESCE(EXCLUDED.name, checks.name), email=COALESCE(EXCLUDED.email, checks.email),
       amount=COALESCE(EXCLUDED.amount, checks.amount), source=COALESCE(EXCLUDED.source, checks.source),
       place_id=COALESCE(EXCLUDED.place_id, checks.place_id), maps_uri=COALESCE(EXCLUDED.maps_uri, checks.maps_uri),
       addr=COALESCE(EXCLUDED.addr, checks.addr),
       step=GREATEST(COALESCE(checks.step,0), COALESCE(EXCLUDED.step,0))`,
    [c.id, c.profile || null, c.category || null, c.rating || null, c.reviews ?? null, c.flagged ?? null,
     c.recommend || null, c.name || null, c.email || null, c.country || null, c.lang || null,
     c.step ?? null, c.amount ?? null, c.source || null, c.placeId || null, c.mapsUri || null, c.addr || null],
  );
}

/** Recherchierte/nachgetragene Lead-E-Mail an einer Prüfung speichern (leer = entfernen). */
export async function setCheckEmail(id: string, email: string): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(`UPDATE checks SET email=$2 WHERE id=$1`, [id, email || null]);
  return (r.rowCount ?? 0) > 0;
}

/** Offene Prüfungen ohne E-Mail, die noch nicht automatisch recherchiert wurden. */
export async function listChecksToEnrich(limit = 8): Promise<{ id: string; place_id: string }[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, place_id FROM checks
      WHERE COALESCE(email,'') = '' AND enriched_at IS NULL AND COALESCE(place_id,'') <> ''
        AND COALESCE(status,'') <> 'konvertiert'
      ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return r.rows as { id: string; place_id: string }[];
}

/** Auto-Recherche-Ergebnis vermerken: enriched_at setzen; E-Mail nur ergänzen, nie überschreiben. */
export async function markCheckEnriched(id: string, email: string | null): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(
    `UPDATE checks SET enriched_at = now(), email = COALESCE(NULLIF(email,''), $2) WHERE id=$1`,
    [id, email || null],
  );
  return (r.rowCount ?? 0) > 0;
}

/** Verknüpft eine Prüfung mit der daraus entstandenen Bestellung. */
export async function linkCheck(checkId: string, orderId: string): Promise<void> {
  if (!pool || !checkId) return;
  await pool.query(`UPDATE checks SET order_id=$2, status='konvertiert' WHERE id=$1`, [checkId, orderId || null]);
}

/** Status (und optional Zahlungsstatus) einer Bestellung dauerhaft setzen.
 *  Gibt true zurück, wenn eine Bestellung mit dieser ID aktualisiert wurde. */
export async function updateOrderStatus(id: string, status: string, pay?: string): Promise<boolean> {
  if (!pool || !id || !status) return false;
  // done_at wird beim ERSTEN Wechsel auf "done" gesetzt (für zeitbasierte Gamification).
  const doneClause = `, done_at = CASE WHEN $2 = 'done' THEN COALESCE(done_at, now()) ELSE done_at END`;
  const r = pay
    ? await pool.query(`UPDATE orders SET status=$2, pay=$3${doneClause} WHERE id=$1`, [id, status, pay])
    : await pool.query(`UPDATE orders SET status=$2${doneClause} WHERE id=$1`, [id, status]);
  return (r.rowCount ?? 0) > 0;
}

/**
 * Markiert die jüngste noch OFFENE Bestellung zu einer E-Mail als bezahlt
 * (für die automatische Zahlungszuordnung aus dem Stripe-Webhook).
 * Trifft genau eine Bestellung (die neueste mit pay≠'paid') und gibt deren ID
 * zurück – oder null, wenn keine offene Bestellung zu dieser E-Mail existiert.
 * Idempotent: bei erneutem Aufruf (Stripe-Retry) gibt es nichts Offenes mehr → null.
 */
export async function markOrderPaidByEmail(email: string): Promise<string | null> {
  if (!pool || !email) return null;
  const r = await pool.query(
    `UPDATE orders SET pay='paid'
       WHERE id = (
         SELECT id FROM orders
          WHERE lower(email) = lower($1) AND pay IS DISTINCT FROM 'paid' AND pay_locked IS NOT TRUE
          ORDER BY created_at DESC LIMIT 1
       )
     RETURNING id`,
    [email],
  );
  return (r.rows[0]?.id as string) ?? null;
}

/** Korrigiert eine FÄLSCHLICH erfasste Zahlung: setzt pay zurück auf 'pending' UND sperrt
 *  die automatische Zuordnung (pay_locked) für diesen Auftrag – sonst würde der Stripe-
 *  Webhook/Reconciler ihn binnen Minuten erneut als bezahlt markieren. Manuelles Setzen
 *  (z. B. Status → „Profil gelöscht" oder echter späterer Zahlungseingang im Dashboard)
 *  bleibt möglich, da updateOrderStatus den Lock NICHT prüft. */
export async function correctOrderPayment(id: string): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(`UPDATE orders SET pay='pending', pay_locked=true WHERE id=$1`, [id]);
  return (r.rowCount ?? 0) > 0;
}

/** Manuell als bezahlt markieren (z. B. PayPal/Überweisung außerhalb Stripe) – OHNE
 *  Statuswechsel. Für Zahlungen, die der automatische Stripe-Abgleich nie sieht, damit
 *  der Auftrag nicht ewig auf „offen" bleibt. */
export async function markOrderPaidById(id: string): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(`UPDATE orders SET pay='paid' WHERE id=$1`, [id]);
  return (r.rowCount ?? 0) > 0;
}

/** Alle im Admin gespeicherten Text-Overrides einer Vorlage → { [lang]: { feld: text } }. */
export async function getTemplateOverrides(tkey: string): Promise<Record<string, Record<string, string>>> {
  if (!pool || !tkey) return {};
  const r = await pool.query(`SELECT lang, fields FROM template_overrides WHERE tkey=$1`, [tkey]);
  const out: Record<string, Record<string, string>> = {};
  for (const row of r.rows) out[row.lang] = (row.fields || {}) as Record<string, string>;
  return out;
}

/** Text-Overrides einer Vorlage für EINE Sprache speichern. Leere Felder werden entfernt,
 *  damit wieder der Code-Default greift (statt eines leeren Textes). */
export async function saveTemplateOverride(tkey: string, lang: string, fields: Record<string, string>): Promise<boolean> {
  if (!pool || !tkey || !lang) return false;
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields || {})) { if (typeof v === "string" && v.trim() !== "") clean[k] = v; }
  if (Object.keys(clean).length === 0) {
    await pool.query(`DELETE FROM template_overrides WHERE tkey=$1 AND lang=$2`, [tkey, lang]);
    return true;
  }
  await pool.query(
    `INSERT INTO template_overrides (tkey, lang, fields, updated_at) VALUES ($1,$2,$3,now())
     ON CONFLICT (tkey, lang) DO UPDATE SET fields=$3, updated_at=now()`,
    [tkey, lang, JSON.stringify(clean)],
  );
  return true;
}

/**
 * Ordnet eine Stripe-Zahlung einer Bestellung zu (für den Zahlungs-Abgleich).
 * Matcht per E-Mail ODER Name/Firma (case-insensitiv, getrimmt) – z. B. „Michelle
 * Buffin" oder „Vimagos Digital Solutions GmbH". Markiert die JÜNGSTE offene,
 * nicht stornierte Treffer-Bestellung als bezahlt. Liefert den Status:
 *   marked  – eine offene Bestellung wurde auf „bezahlt" gesetzt
 *   already – es gibt zwar eine passende Bestellung, sie ist aber schon bezahlt
 *   none    – keine passende Bestellung gefunden
 */
export async function reconcileOrderForPayment(email: string, name: string, createdTs = 0): Promise<{ status: "marked" | "already" | "none"; id?: string; orderName?: string | null }> {
  if (!pool) return { status: "none" };
  const em = (email || "").trim();
  const nm = (name || "").trim();
  if (!em && !nm) return { status: "none" };
  const cond = `(($1 <> '' AND lower(email) = lower($1))
             OR ($2 <> '' AND lower(btrim(name)) = lower(btrim($2)))
             OR ($2 <> '' AND lower(btrim(company)) = lower(btrim($2))))`;
  // Zeitgrenze: eine Zahlung kann nur eine Bestellung betreffen, die es zum Zahlungszeitpunkt
  // schon gab. Bestellungen, die deutlich NACH der Zahlung erstellt wurden ($3 = Stripe-
  // Zeitstempel der Zahlung, Unix-Sek.), werden ausgeschlossen – so markiert eine alte/fremde
  // Zahlung keine NEUE Bestellung fälschlich als bezahlt. $3 = 0 → keine Grenze.
  const timeCond = `($3 = 0 OR created_at <= to_timestamp($3) + interval '7 days')`;
  const upd = await pool.query(
    `UPDATE orders SET pay='paid'
       WHERE id = (
         SELECT id FROM orders
          WHERE pay IS DISTINCT FROM 'paid' AND pay_locked IS NOT TRUE AND COALESCE(status,'') <> 'storniert' AND ${cond} AND ${timeCond}
          ORDER BY created_at DESC LIMIT 1
       )
     RETURNING id, name`,
    [em, nm, createdTs],
  );
  if (upd.rows[0]) return { status: "marked", id: upd.rows[0].id as string, orderName: (upd.rows[0].name as string) ?? null };
  const any = await pool.query(`SELECT 1 FROM orders WHERE ${cond} AND ${timeCond} LIMIT 1`, [em, nm, createdTs]);
  return { status: any.rows[0] ? "already" : "none" };
}

/** Schon verarbeitete Stripe-Zahlung? Jede Rechnung darf HÖCHSTENS EINE Bestellung als
 *  bezahlt markieren – sonst würde dieselbe echte Zahlung bei jedem Lauf erneut der jeweils
 *  neuesten offenen Treffer-Bestellung gutgeschrieben (falsche „bezahlt" + Push). */
export async function isPaymentReconciled(invoiceId: string): Promise<boolean> {
  if (!pool || !invoiceId) return false;
  const r = await pool.query(`SELECT 1 FROM reconciled_payments WHERE invoice_id=$1`, [invoiceId]);
  return !!r.rows[0];
}
/** Merkt eine Stripe-Zahlung als verarbeitet vor (einmalig, idempotent). */
export async function recordReconciledPayment(invoiceId: string, orderId: string | null): Promise<void> {
  if (!pool || !invoiceId) return;
  await pool.query(
    `INSERT INTO reconciled_payments (invoice_id, order_id) VALUES ($1,$2) ON CONFLICT (invoice_id) DO NOTHING`,
    [invoiceId, orderId || null],
  );
}

/** Bestellung einem Bearbeiter zuweisen ("max" | "matthias" | null = entfernen). */
export async function setOrderAssignee(id: string, assignee: string | null): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(`UPDATE orders SET assignee=$2 WHERE id=$1`, [id, assignee || null]);
  return (r.rowCount ?? 0) > 0;
}

/** Fragebogen-Antworten (5 Ja/Nein + filledAt) zu einer Bestellung speichern. */
export async function setOrderForm(id: string, form: unknown): Promise<boolean> {
  if (!pool || !id) return false;
  const r = await pool.query(`UPDATE orders SET form=$2 WHERE id=$1`, [id, form ? JSON.stringify(form) : null]);
  return (r.rowCount ?? 0) > 0;
}

/** Minimal-Infos zu einer Bestellung (für die öffentliche Fragebogen-Seite + Push-Texte). */
export async function getOrderBasic(id: string): Promise<{ id: string; name: string | null; company: string | null; assignee: string | null; status: string | null; service: string | null; lang: string | null; form: unknown } | null> {
  if (!pool || !id) return null;
  const r = await pool.query(`SELECT id, name, company, assignee, status, service, lang, form FROM orders WHERE id=$1`, [id]);
  return r.rows[0] || null;
}

/** Alle „echten" abgeschlossenen Löschungen (status=done, remove/reset/express)
 *  mit Betreuer – Rohdaten für die Gamification-Engine. Backfill inklusive. */
export async function deletionsForGamification(): Promise<DeletionRow[]> {
  if (!pool) return [];
  const r = await pool.query(
    `SELECT id, assignee, service, country, amount, company, pay,
            COALESCE(done_at, created_at) AS done_at,
            COALESCE(raw->>'express','') = 'true' AS express
       FROM orders
      WHERE status = 'done'
        AND assignee IN ('max','matthias')
        AND service = ANY($1::text[])
      ORDER BY COALESCE(done_at, created_at) ASC`,
    [["remove", "reset", "express"]],
  );
  return r.rows.map((x: any) => ({
    id: String(x.id),
    assignee: x.assignee ?? null,
    service: x.service ?? null,
    country: x.country ?? null,
    amount: x.amount == null ? null : Number(x.amount),
    company: x.company ?? null,
    doneAt: x.done_at instanceof Date ? x.done_at.toISOString() : String(x.done_at),
    express: x.express === true,
    paid: x.pay === "paid", // echte Zahlung (Reconciler/Stripe) – treibt den Umsatz, NICHT den Rang
  }));
}

export async function listOrders(limit = 200): Promise<Record<string, unknown>[]> {
  if (!pool) return [];
  // Mit Zahlungs-Aktivität pro Bestellung: Anzahl gesendeter Mahnungen + ob ein
  // Zahlungslink rausging (für den granularen Zahlungsstatus in der Übersicht).
  const r = await pool.query(
    `SELECT o.*,
            (SELECT count(*) FROM events e WHERE e.order_id = o.id AND e.type = 'pay' AND e.title LIKE 'Mahnung%')      AS mahnung_count,
            (SELECT count(*) FROM events e WHERE e.order_id = o.id AND ((e.type = 'pay' AND e.title LIKE 'Zahlungslink%') OR (e.type = 'sms' AND e.detail ILIKE '%stripe.com%'))) AS paylink_count
       FROM orders o ORDER BY o.created_at DESC LIMIT $1`,
    [limit],
  );
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
export async function insertEvent(e: { orderId?: string; email?: string; type?: string; title?: string; detail?: string; auto?: boolean; html?: string; subject?: string }): Promise<void> {
  if (!pool) return;
  try {
    let orderId = e.orderId || null;
    if (!orderId && e.email) orderId = await latestOrderId(e.email);
    if (!orderId && !e.email) return; // nichts, woran sich der Eintrag hängen ließe
    await pool.query(
      `INSERT INTO events (order_id, email, type, title, detail, auto, html, subject) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [orderId, e.email || null, e.type || "info", e.title || "", e.detail || "", e.auto === true, e.html || null, e.subject || null],
    );
  } catch { /* Logging darf den Hauptablauf nie stören */ }
}

/** Aktivitäts-Verlauf einer Bestellung (neueste zuerst). */
export async function listEvents(orderId: string, limit = 100): Promise<Record<string, unknown>[]> {
  if (!pool || !orderId) return [];
  const r = await pool.query(`SELECT id, created_at, order_id, email, type, title, detail, auto, (html IS NOT NULL) AS has_html FROM events WHERE order_id=$1 ORDER BY created_at DESC LIMIT $2`, [orderId, limit]);
  return r.rows;
}

/** Aktivitäts-Verlauf zu einer Kunden-E-Mail: direkt getaggte Events ODER über deren Bestellungen. */
export async function listEventsByEmail(email: string, limit = 100): Promise<Record<string, unknown>[]> {
  if (!pool || !email) return [];
  const r = await pool.query(
    `SELECT e.id, e.created_at, e.order_id, e.email, e.type, e.title, e.detail, e.auto, (e.html IS NOT NULL) AS has_html
       FROM events e
       LEFT JOIN orders o ON o.id = e.order_id
      WHERE lower(e.email) = lower($1) OR lower(o.email) = lower($1)
      ORDER BY e.created_at DESC LIMIT $2`,
    [email, limit],
  );
  return r.rows;
}

/** Liefert die exakt versendete Mail (1:1 gespeichertes HTML + Betreff) zu einem Event-Eintrag. */
export async function getEventEmail(id: string | number): Promise<{ html: string; subject: string | null; title: string | null; created_at: string } | null> {
  if (!pool || !id) return null;
  const r = await pool.query(`SELECT html, subject, title, created_at FROM events WHERE id=$1`, [id]);
  const row = r.rows[0];
  if (!row || !row.html) return null;
  return { html: row.html as string, subject: (row.subject as string) ?? null, title: (row.title as string) ?? null, created_at: String(row.created_at) };
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
