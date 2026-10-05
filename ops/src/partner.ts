/* Partner-Board: Übergabe einzelner Bewertungen an den Lösch-Partner.
 *
 * Statt WhatsApp-Listen bekommt jede Bewertung eine Kurznummer (RV-0001), einen
 * Typ (normal / alt / ohne Text) und einen Partnerpreis. Der Partner sieht über
 * einen geheimen Link (ohne Account) NUR Nummer, Link, Typ, Preis und Status —
 * keine Kundennamen, keine E-Mail-Adressen. Er setzt den Status selbst; „Gelöscht"
 * landet als Event beim Auftrag + Team-Push. Abrechnung: offene Beträge je
 * gelöschter Aufgabe, im Admin als bezahlt markierbar (Auszahlungs-Sammelposten).
 */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool, insertEvent } from "./db";
import { notifyTeam } from "./notify";

export const PARTNER_PRICES = { normal: 50, old: 40, nt: 150 } as const; // USD, Stand 5.10.2026 (Chat)
export type TaskKind = keyof typeof PARTNER_PRICES;
export const PARTNER_STATUSES = ["new", "working", "removed", "not_possible", "software", "cancelled"] as const;
export type TaskStatus = (typeof PARTNER_STATUSES)[number];

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

export async function initPartnerTables(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_tasks (
      id           bigserial PRIMARY KEY,
      code         text UNIQUE,
      order_id     text,
      item_key     text,
      url          text,
      name         text,
      text         text,
      kind         text NOT NULL DEFAULT 'normal',
      price_usd    numeric NOT NULL DEFAULT 0,
      status       text NOT NULL DEFAULT 'new',
      partner_note text,
      admin_note   text,
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now(),
      removed_at   timestamptz,
      paid_at      timestamptz,
      payout_id    bigint
    )
  `);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS partner_tasks_order_item ON partner_tasks (order_id, item_key)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_payouts (
      id         bigserial PRIMARY KEY,
      amount_usd numeric NOT NULL,
      tasks      integer NOT NULL,
      note       text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_settings (
      key   text PRIMARY KEY,
      value text NOT NULL
    )
  `);
}

/* ---- Token (geheimer Partner-Link) — in der DB, nie im Repo ---- */
async function getSetting(key: string): Promise<string | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]);
  return r.rows[0]?.value ?? null;
}
async function setSetting(key: string, value: string): Promise<void> {
  if (!pool) return;
  await pool.query(`INSERT INTO partner_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2`, [key, value]);
}
const newToken = () => crypto.randomBytes(18).toString("base64url");
export async function partnerToken(rotate = false): Promise<string | null> {
  if (!pool) return null;
  let t = rotate ? null : await getSetting("token");
  if (!t) { t = newToken(); await setSetting("token", t); }
  return t;
}
async function checkPartnerToken(t: unknown): Promise<boolean> {
  const s = String(t || "");
  if (s.length < 16) return false;
  const real = await getSetting("token");
  if (!real || real.length !== s.length) return false;
  return crypto.timingSafeEqual(Buffer.from(real), Buffer.from(s));
}

/* ---- Datenzugriff ---- */
type Row = {
  id: string; code: string; order_id: string | null; item_key: string | null; url: string | null; name: string | null; text: string | null;
  kind: TaskKind; price_usd: string; status: TaskStatus; partner_note: string | null; admin_note: string | null;
  created_at: string; updated_at: string; removed_at: string | null; paid_at: string | null; payout_id: string | null;
};
const num = (v: unknown) => Math.round(Number(v || 0) * 100) / 100;

/** Für den Partner: KEINE Kundendaten (kein Auftrag, kein Name des Kunden). */
function partnerView(r: Row) {
  return {
    id: Number(r.id), code: r.code, url: r.url, reviewer: r.name, text: r.text, // öffentliche Bewertungsdaten, keine Kundendaten
    kind: r.kind, price: num(r.price_usd), status: r.status, note: r.partner_note || "",
    created: r.created_at, updated: r.updated_at, removed: r.removed_at, paid: r.paid_at,
  };
}
function adminView(r: Row) {
  return { ...partnerView(r), orderId: r.order_id, itemKey: r.item_key, name: r.name, text: r.text, adminNote: r.admin_note || "", payoutId: r.payout_id ? Number(r.payout_id) : null };
}

async function listTasks(where = "", args: unknown[] = []): Promise<Row[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT * FROM partner_tasks ${where} ORDER BY created_at DESC, id DESC LIMIT 1000`, args);
  return r.rows as Row[];
}

function totals(rows: Row[]) {
  const removed = rows.filter((r) => r.status === "removed");
  const open = removed.filter((r) => !r.paid_at);
  return {
    open: rows.filter((r) => ["new", "working", "software"].includes(r.status)).length,
    removed: removed.length,
    owedUsd: num(open.reduce((s, r) => s + Number(r.price_usd || 0), 0)),
    owedCount: open.length,
    paidUsd: num(removed.filter((r) => r.paid_at).reduce((s, r) => s + Number(r.price_usd || 0), 0)),
  };
}

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const httpUrl = (v: unknown) => { const s = clip(v, 600); return /^https?:\/\/\S+$/i.test(s) ? s : ""; };

/* ---- Routen ---- */
export function registerPartnerRoutes(app: FastifyInstance, adminToken: string): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Admin: Bewertungen eines Auftrags an den Partner übergeben (idempotent je Auftrag + Bewertung).
  app.post("/admin/partner/send", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const orderId = clip(b.orderId, 40) || null;
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60) as Record<string, unknown>[];
    const created: ReturnType<typeof adminView>[] = [];
    for (const it of items) {
      const url = httpUrl(it.url);
      const name = clip(it.name, 120);
      const text = clip(it.text, 600);
      if (!url && !name) continue;
      const kind: TaskKind = it.nt === true ? "nt" : it.old === true ? "old" : "normal";
      const key = url || `${name}|${text}`;
      const price = Number.isFinite(Number(it.price)) && Number(it.price) > 0 ? Number(it.price) : PARTNER_PRICES[kind];
      const r = await pool.query(
        `INSERT INTO partner_tasks (order_id, item_key, url, name, text, kind, price_usd)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (order_id, item_key) DO UPDATE SET updated_at = partner_tasks.updated_at
         RETURNING *`,
        [orderId, key, url || null, name || null, text || null, kind, price],
      );
      let row = r.rows[0] as Row;
      if (!row.code) {
        const u = await pool.query(`UPDATE partner_tasks SET code = 'RV-' || lpad(id::text, 4, '0') WHERE id=$1 RETURNING *`, [row.id]);
        row = u.rows[0] as Row;
      }
      created.push(adminView(row));
    }
    if (orderId && created.length) {
      await insertEvent({ orderId, type: "note", title: "An Partner übergeben", detail: created.map((t) => `${t.code} (${t.kind}, $${t.price})`).join(" · ") }).catch(() => {});
    }
    return { ok: true, tasks: created };
  });

  // Admin: alle Aufgaben (optional nur eines Auftrags) + Summen + Auszahlungen.
  app.post("/admin/partner/tasks", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return { ok: true, db: false, tasks: [], totals: totals([]), payouts: [] };
    const orderId = clip(b.orderId, 40);
    const rows = orderId ? await listTasks("WHERE order_id=$1", [orderId]) : await listTasks();
    const all = orderId ? await listTasks() : rows;
    const p = await pool.query(`SELECT id, amount_usd, tasks, note, created_at FROM partner_payouts ORDER BY id DESC LIMIT 50`);
    return { ok: true, tasks: rows.map(adminView), totals: totals(all), payouts: p.rows.map((x) => ({ id: Number(x.id), amount: num(x.amount_usd), tasks: x.tasks, note: x.note, created: x.created_at })) };
  });

  // Admin: Preis / Notiz / Status korrigieren (z. B. Storno).
  app.post("/admin/partner/update", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const id = Number(b.id);
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id fehlt" });
    const sets: string[] = []; const args: unknown[] = [];
    if (b.price != null && Number.isFinite(Number(b.price))) { args.push(Number(b.price)); sets.push(`price_usd=$${args.length}`); }
    if (b.adminNote != null) { args.push(clip(b.adminNote, 400)); sets.push(`admin_note=$${args.length}`); }
    if (b.status && (PARTNER_STATUSES as readonly string[]).includes(String(b.status))) {
      args.push(String(b.status)); sets.push(`status=$${args.length}`);
      sets.push(String(b.status) === "removed" ? "removed_at=COALESCE(removed_at, now())" : "removed_at=NULL");
    }
    if (!sets.length) return reply.code(400).send({ ok: false, error: "nichts zu ändern" });
    args.push(id);
    const r = await pool.query(`UPDATE partner_tasks SET ${sets.join(", ")}, updated_at=now() WHERE id=$${args.length} RETURNING *`, args);
    if (!r.rows[0]) return reply.code(404).send({ ok: false, error: "nicht gefunden" });
    return { ok: true, task: adminView(r.rows[0] as Row) };
  });

  // Admin: gelöschte, unbezahlte Aufgaben als bezahlt markieren (Sammelposten).
  app.post("/admin/partner/pay", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
    if (!ids.length) return reply.code(400).send({ ok: false, error: "keine Aufgaben gewählt" });
    const r = await pool.query(`SELECT id, price_usd FROM partner_tasks WHERE id = ANY($1::bigint[]) AND status='removed' AND paid_at IS NULL`, [ids]);
    if (!r.rows.length) return reply.code(400).send({ ok: false, error: "keine offenen gelöschten Aufgaben unter der Auswahl" });
    const amount = num(r.rows.reduce((s, x) => s + Number(x.price_usd || 0), 0));
    const p = await pool.query(`INSERT INTO partner_payouts (amount_usd, tasks, note) VALUES ($1,$2,$3) RETURNING id`, [amount, r.rows.length, clip(b.note, 200) || null]);
    await pool.query(`UPDATE partner_tasks SET paid_at=now(), payout_id=$1, updated_at=now() WHERE id = ANY($2::bigint[])`, [p.rows[0].id, r.rows.map((x) => x.id)]);
    return { ok: true, payoutId: Number(p.rows[0].id), amount, tasks: r.rows.length };
  });

  // Admin: geheimen Partner-Link holen (oder neu erzeugen → alter Link ungültig).
  app.post("/admin/partner/link", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const t = await partnerToken(b.rotate === true);
    if (!t) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    return { ok: true, url: `${SITE_URL}/partner#${t}` };
  });

  /* ---- Partner (geheimer Link) ---- */
  app.post("/partner/tasks", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const rows = await listTasks("WHERE status <> 'cancelled'");
    const p = pool ? await pool.query(`SELECT id, amount_usd, tasks, note, created_at FROM partner_payouts ORDER BY id DESC LIMIT 20`) : { rows: [] as Record<string, unknown>[] };
    return { ok: true, tasks: rows.map(partnerView), totals: totals(rows), payouts: p.rows.map((x) => ({ id: Number(x.id), amount: num(x.amount_usd), tasks: x.tasks, created: x.created_at })) };
  });

  app.post("/partner/update", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const id = Number(b.id);
    const status = String(b.status || "");
    const allowed = ["working", "removed", "not_possible", "software"];
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id missing" });
    if (status && !allowed.includes(status)) return reply.code(400).send({ ok: false, error: "invalid status" });
    const prev = await pool.query(`SELECT * FROM partner_tasks WHERE id=$1`, [id]);
    const old = prev.rows[0] as Row | undefined;
    if (!old || old.status === "cancelled") return reply.code(404).send({ ok: false, error: "not found" });
    if (old.paid_at && status && status !== "removed") return reply.code(400).send({ ok: false, error: "already paid" });
    const note = b.note != null ? clip(b.note, 500) : old.partner_note;
    const st = status || old.status;
    const r = await pool.query(
      `UPDATE partner_tasks SET status=$1, partner_note=$2, updated_at=now(),
         removed_at = CASE WHEN $1='removed' THEN COALESCE(removed_at, now()) ELSE NULL END
       WHERE id=$3 RETURNING *`,
      [st, note || null, id],
    );
    const row = r.rows[0] as Row;
    if (status && status !== old.status) {
      const label: Record<string, string> = { working: "arbeitet dran", removed: "GELÖSCHT ✓", not_possible: "nicht möglich", software: "nur per Software" };
      if (row.order_id) {
        await insertEvent({ orderId: row.order_id, type: "note", title: `Partner: ${row.code} ${label[status] || status}`, detail: [row.url || row.name, note].filter(Boolean).join(" · ") }).catch(() => {});
      }
      if (status === "removed" || status === "not_possible" || status === "software") {
        void notifyTeam(`Partner: ${row.code} ${label[status]}`, [row.order_id ? `Auftrag ${row.order_id}` : "", note || ""].filter(Boolean).join(" · ") || "Status geändert", `${SITE_URL}/admin`);
      }
    }
    return { ok: true, task: partnerView(row) };
  });
}
