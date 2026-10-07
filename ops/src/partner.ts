/* Partner-Board: Übergabe einzelner Bewertungen an den Lösch-Partner.
 *
 * Statt WhatsApp-Listen bekommt jede Bewertung eine Kurznummer (RV-0001), einen
 * Typ (normal / alt / ohne Text) und einen Partnerpreis. Der Partner sieht über
 * einen geheimen Link (ohne Account) Nummer, Link, Typ, Preis, Status und den
 * Namen des Unternehmensprofils (öffentlich, zum Gliedern nach Kunde) — keine
 * Namen/E-Mails/Telefonnummern der Besteller. Er setzt den Status selbst; „Gelöscht"
 * landet als Event beim Auftrag + Team-Push. Abrechnung: offene Beträge je
 * gelöschter Aufgabe, im Admin als bezahlt markierbar (Auszahlungs-Sammelposten).
 */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool, insertEvent } from "./db";
import { notifyTeam } from "./notify";
import { partnerStatusChanged, SW_NOTE_PAID, SW_NOTE_DECLINED, partnerToDash } from "./customers";
import { ensureReviewsAmountLink } from "./reviewsSetup";
import { hasSecretKey } from "./integrations/stripe";
import { isPartnerSession, partnerSessionEmail, createPreviewSession } from "./partnerAuth";
import { isTestEmail } from "./testAccounts";
import { notifyCustomer } from "./custPush";
import { customerPush } from "./pushTexts";
import { partnerNewOrder } from "./partnerNotify";

export const PARTNER_PRICES = { normal: 10, old: 40, nt: 150, profile: 50 } as const; // profile = ganzes Google-Profil (Platzhalter, im Admin je Aufgabe änderbar)
// USD, Stand 5.10.2026 (Rechnung RVA-001: $10/Link; alt $40; ohne Text $150)
export type TaskKind = keyof typeof PARTNER_PRICES;
export const PARTNER_STATUSES = ["new", "working", "removed", "not_possible", "software", "cancelled"] as const;
export type TaskStatus = (typeof PARTNER_STATUSES)[number];

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

/** Verfahren (sw/legal/std) für alte, noch nicht begonnene Aufgaben nachtragen – nur status 'new', nur einmal (method danach gesetzt). */
async function backfillMethods(): Promise<void> {
  if (!pool) return;
  const r = await pool.query(
    `SELECT t.id, t.item_key, t.kind, o.country, o.raw->>'profileCountry' AS pc, o.raw->>'addr' AS addr, o.raw->'reviewItems' AS items
       FROM partner_tasks t JOIN orders o ON o.id = t.order_id
      WHERE t.method IS NULL AND t.status = 'new' AND t.kind <> 'profile'`,
  ).catch(() => ({ rows: [] as Record<string, unknown>[] }));
  for (const x of r.rows as { id: number; item_key: string; kind: string; country: string | null; pc: string | null; addr: string | null; items: Record<string, unknown>[] | null }[]) {
    const it = (Array.isArray(x.items) ? x.items : []).find((i) => (String(i.url || "") || `${i.name || ""}|${i.text || ""}`) === x.item_key) || {};
    const addr = String(x.addr || "");
    const us = (x.pc || "").toUpperCase() === "US" || /(\busa\b|united states)\s*$/i.test(addr) || /,\s*[A-Z]{2}\s+\d{5}(-\d{4})?(,\s*(usa|united states))?\s*$/i.test(addr) || (!x.pc && !addr && x.country === "US");
    const nt = it.nt === true || x.kind === "nt";
    const old = it.old === true || x.kind === "old";
    const m = nt || it.sw === true || (old && us) ? "sw" : old ? "legal" : "std";
    await pool.query(`UPDATE partner_tasks SET method=$2 WHERE id=$1 AND method IS NULL`, [x.id, m]).catch(() => {});
  }
}

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
  // Kunde = Name des Unternehmensprofils (Gliederung im Board).
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS customer text`);
  // Erste Partner-Aktion (Status, Notiz, Öffnen, Link kopieren) → Kunde gilt nicht mehr als „NEW".
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS touched_at timestamptz`);
  // Früher abgelehnte Software-Aufgaben (storniert) wieder unter „Software" zeigen – mit „Customer declined deletion".
  await pool.query(`UPDATE partner_tasks SET status='software' WHERE status='cancelled' AND paid_at IS NULL AND admin_note LIKE '%Spezial-Software abgelehnt (Dashboard)%'`).catch(() => {});
  // Testbestellungen (E-Mail mit „+test"): nur im Test-Board des Admins, nie beim Partner.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS test boolean NOT NULL DEFAULT false`);
  // Verfahren laut Partner-Regel (10/2026): sw = Software nötig (alt + USA mit Text, oder ohne Text), legal = erst rechtliche Meldung.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS method text`);
  // Einmalig: noch nicht begonnene Aufgaben aus Bestellungen VOR der Regel einordnen (Land aus Profil-Adresse bzw. Bestellung).
  await backfillMethods().catch((e) => console.error("Partner: Verfahren nachtragen fehlgeschlagen", e));
  // Software-Fälle bekommt der Partner mit dem Software-Preis bezahlt (offene, noch nicht ausgezahlte Aufgaben).
  await pool.query(`UPDATE partner_tasks SET price_usd=$1 WHERE method='sw' AND status IN ('new','software','working') AND paid_at IS NULL AND price_usd < $1`, [PARTNER_PRICES.nt]).catch(() => {});
  // Seit wann „Working" (Mobil-Board zeigt „Working · 3 h 20 min").
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS working_since timestamptz`);
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
    CREATE TABLE IF NOT EXISTS partners (
      id         bigserial PRIMARY KEY,
      name       text NOT NULL,
      email      text,
      phone      text,
      note       text,
      active     boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  // Aktueller (einziger) Lösch-Partner — einmalig anlegen.
  await pool.query(`INSERT INTO partners (name, email, phone, note)
    SELECT 'Reputation Vault Agency', 'reputationvaultagency@gmail.com', '+92 305 6352192', 'Lahore, Pakistan · Google-Bewertungen & -Profile'
    WHERE NOT EXISTS (SELECT 1 FROM partners)`);
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
/** Test-Board des Admins: eigene Sitzung, sieht und bearbeitet NUR Testaufträge. */
export const PREVIEW_EMAIL = "admin-preview";
async function isPreview(t: unknown): Promise<boolean> {
  const s = String(t || "");
  if (!s.startsWith("ps_")) return false;
  const e = await partnerSessionEmail(s);
  return e === PREVIEW_EMAIL || isTestEmail(e); // Admin-Test-Board oder Test-Login (Inhaber)
}


async function checkPartnerToken(t: unknown): Promise<boolean> {
  const s = String(t || "");
  if (s.startsWith("ps_")) return isPartnerSession(s); // Partner-Login (partnerAuth.ts)
  if (s.length < 16) return false;
  const real = await getSetting("token");
  if (!real || real.length !== s.length) return false;
  return crypto.timingSafeEqual(Buffer.from(real), Buffer.from(s));
}

/* ---- Datenzugriff ---- */
type Row = {
  id: string; code: string; order_id: string | null; item_key: string | null; customer: string | null; url: string | null; name: string | null; text: string | null;
  kind: TaskKind; price_usd: string; status: TaskStatus; partner_note: string | null; admin_note: string | null;
  created_at: string; updated_at: string; removed_at: string | null; paid_at: string | null; payout_id: string | null;
  touched_at: string | null; working_since: string | null; test?: boolean; method?: string | null;
};
const num = (v: unknown) => Math.round(Number(v || 0) * 100) / 100;

/** Für den Partner: keine Besteller-Daten (kein Auftrag, keine Kontaktdaten) — nur der öffentliche Profilname. */
function partnerView(r: Row) {
  return {
    id: Number(r.id), code: r.code, customer: r.customer || "", url: r.url, reviewer: r.name, text: r.text, // öffentliche Bewertungsdaten, keine Kundendaten
    kind: r.kind, price: num(r.price_usd), status: r.status, note: r.partner_note || "",
    created: r.created_at, updated: r.updated_at, removed: r.removed_at, paid: r.paid_at, touched: !!r.touched_at, workingSince: r.working_since,
    // Software-Fluss: „software" = wartet auf die Entscheidung des Kunden; bezahlt → Aufgabe steht wieder auf „working".
    method: r.method || null, // sw | legal | null (Hinweis beim Partner: Software prüfen bzw. erst rechtliche Meldung)
    sw: r.status === "software" ? ((r.admin_note || "").includes(SW_NOTE_DECLINED) ? "declined" : "pending") : (r.status === "working" && (r.admin_note || "").includes(SW_NOTE_PAID) ? "paid" : null),
  };
}
function adminView(r: Row) {
  return { ...partnerView(r), orderId: r.order_id, itemKey: r.item_key, name: r.name, text: r.text, adminNote: r.admin_note || "", payoutId: r.payout_id ? Number(r.payout_id) : null, test: !!r.test };
}

async function listTasks(where = "", args: unknown[] = []): Promise<Row[]> {
  if (!pool) return [];
  const r = await pool.query(`SELECT * FROM partner_tasks ${where} ORDER BY created_at DESC, id DESC LIMIT 1000`, args);
  return r.rows as Row[];
}

function totals(rows: Row[]) {
  const removed = rows.filter((r) => r.status === "removed" && !r.test); // Testaufträge zählen nie
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

/** Bewertungen als Partner-Aufgaben anlegen (idempotent je Auftrag + Bewertung). */
async function insertPartnerTasks(orderId: string | null, customer: string | null, items: Record<string, unknown>[]): Promise<Row[]> {
  if (!pool) return [];
  const out: Row[] = [];
  const fresh: { code: string; kind: string; price: number }[] = [];
  const test = orderId ? isTestEmail((await pool.query(`SELECT email FROM orders WHERE id=$1`, [orderId]).catch(() => ({ rows: [] as { email?: string }[] }))).rows[0]?.email) : false;
  for (const it of items.slice(0, 60)) {
    const url = httpUrl(it.url);
    const name = clip(it.name, 120);
    // Kunde hat statt eines Links den Bewertungstext ins Link-Feld kopiert → als Text übernehmen.
    const text = clip(it.text, 600) || (!url && !name ? clip(it.url, 600) : "");
    if (!url && !name && !text) continue;
    const kind: TaskKind = it.kind === "profile" ? "profile" : it.nt === true ? "nt" : it.old === true ? "old" : "normal";
    const key = url || `${name}|${text}`;
    // Software-Fall (ohne Text bzw. alte US-Bewertung mit Text) → Software-Preis für den Partner.
    const price = Number.isFinite(Number(it.price)) && Number(it.price) > 0 ? Number(it.price) : it.sw === true ? PARTNER_PRICES.nt : PARTNER_PRICES[kind];
    // Ohne Auftrag (manuell, z. B. aus WhatsApp) greift der Unique-Index nicht (NULL) → selbst prüfen.
    if (!orderId) {
      const ex = await pool.query(`SELECT * FROM partner_tasks WHERE order_id IS NULL AND item_key=$1 LIMIT 1`, [key]);
      if (ex.rows[0]) { out.push(ex.rows[0] as Row); continue; }
    }
    const r = await pool.query(
      `INSERT INTO partner_tasks (order_id, item_key, url, name, text, kind, price_usd, customer, test, rating, age_days, method)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (order_id, item_key) DO UPDATE SET customer = COALESCE(partner_tasks.customer, EXCLUDED.customer)
       RETURNING *`,
      [orderId, key, url || null, name || null, text || null, kind, price, customer, test,
        Number(it.rating) >= 1 && Number(it.rating) <= 5 ? Math.round(Number(it.rating)) : null, Number.isFinite(Number(it.days)) && it.days !== null && it.days !== undefined && Number(it.days) >= 0 ? Math.round(Number(it.days)) : null,
        it.kind === "profile" ? null : it.nt === true || it.sw === true ? "sw" : it.old === true ? "legal" : null],
    );
    let row = r.rows[0] as Row;
    if (!row.code) {
      const u = await pool.query(`UPDATE partner_tasks SET code = 'RV-' || lpad(id::text, 4, '0') WHERE id=$1 RETURNING *`, [row.id]);
      row = u.rows[0] as Row;
      fresh.push({ code: row.code, kind: row.kind, price: num(row.price_usd) }); // neu angelegt → Partner benachrichtigen
    }
    out.push(row);
  }
  if (fresh.length) void partnerNewOrder(customer || "", fresh, test); // Testauftrag → nur an den Test-Login
  return out;
}

/* ---- Automatische Weiterleitung (Admin → Einstellungen) ---- */
export type AutoKind = "reviews" | "profiles";
const AUTO_DEFAULT: Record<AutoKind, boolean> = { reviews: true, profiles: false };
export async function partnerAutoEnabled(kind: AutoKind): Promise<boolean> {
  const v = await getSetting("auto_" + kind).catch(() => null);
  return v == null ? AUTO_DEFAULT[kind] : v === "1";
}

/** Neue Profil-Bestellung → das Google-Profil als eine Partner-Aufgabe (nur wenn in den Einstellungen aktiv). */
export async function partnerAutoSendProfile(orderId: string, customer: string, url: string): Promise<number> {
  if (!pool || !orderId) return 0;
  const name = clip(customer, 120);
  const rows = await insertPartnerTasks(orderId, name || null, [{ url, name: name || "Google profile", text: "Remove the whole Google Business Profile", kind: "profile" }]);
  if (rows.length) await insertEvent({ orderId, type: "note", title: "Automatisch ans Partner-Board (Profil)", detail: rows.map((t) => `${t.code} ($${num(t.price_usd)})`).join(" · ") }).catch(() => {});
  return rows.length;
}

/** Neue Bewertungs-Bestellung → ALLE Bewertungen automatisch aufs Partner-Board (kein Button mehr). */
export async function partnerAutoSend(orderId: string, customer: string, items: Record<string, unknown>[]): Promise<number> {
  if (!pool || !orderId || !items.length) return 0;
  const rows = await insertPartnerTasks(orderId, clip(customer, 160) || null, items);
  if (rows.length) await insertEvent({ orderId, type: "note", title: "Automatisch ans Partner-Board", detail: rows.map((t) => `${t.code} (${t.kind}, $${num(t.price_usd)})`).join(" · ") }).catch(() => {});
  return rows.length;
}

/** Auftrag storniert → offene Aufgaben vom Board nehmen; reaktiviert → wieder einstellen. Gelöschte/bezahlte bleiben. */
export async function partnerOrderStatus(orderId: string, status: string): Promise<void> {
  if (!pool || !orderId) return;
  if (status === "storniert") {
    await pool.query(`UPDATE partner_tasks SET status='cancelled', updated_at=now() WHERE order_id=$1 AND status IN ('new','working','not_possible','software') AND paid_at IS NULL`, [orderId]);
  } else if (status === "progress" || status === "new") { // Reaktivierung eines stornierten Auftrags
    await pool.query(`UPDATE partner_tasks SET status='new', updated_at=now() WHERE order_id=$1 AND status='cancelled'`, [orderId]);
  }
}

/** Sofort-Push an den Kunden (Sprache + Bewertungsname aus der Bestellung). */
async function pushCustomerNow(row: Row, from: string, to: string): Promise<void> {
  if (!pool || !row.order_id) return;
  const o = await pool.query(`SELECT email, lang FROM orders WHERE id=$1 AND service='reviews'`, [row.order_id]);
  const email = o.rows[0]?.email;
  if (!email) return;
  // Bestellung fertig (nichts mehr offen)? → „3 Bewertungen entfernt · Ihre Bestellung … ist abgeschlossen."
  const st = await pool.query(`SELECT status, count(*)::int AS n FROM partner_tasks WHERE order_id=$1 AND status <> 'cancelled' GROUP BY status`, [row.order_id]);
  const cnt = Object.fromEntries(st.rows.map((x) => [x.status, x.n])) as Record<string, number>;
  const open = (cnt.new || 0) + (cnt.working || 0) + (cnt.software || 0);
  // Offene Entscheidungen (Software) über alle Bestellungen des Kunden = Problem-Zähler + App-Badge.
  const pr = await pool.query(
    `SELECT count(DISTINCT t.order_id)::int AS n FROM partner_tasks t JOIN orders o ON o.id = t.order_id
      WHERE lower(o.email) = lower($1) AND t.status = 'software' AND COALESCE(t.admin_note,'') NOT LIKE $2`,
    [email, `%${SW_NOTE_DECLINED}%`],
  ).catch(() => ({ rows: [{ n: 0 }] }));
  const problems = Number(pr.rows[0]?.n || 0);
  const p = customerPush(o.rows[0].lang, to, { name: row.name, orderId: row.order_id, orderDone: to === "removed" && !open ? cnt.removed || 0 : 0, problemOrders: problems, pre: row.method === "sw" });
  void from;
  await notifyCustomer(email, p.title, p.body, `rrc-${row.order_id}-${row.id}`, { url: `/my-reviews?order=${encodeURIComponent(row.order_id)}`, badge: problems });
}

/* ---- Routen ---- */
export function registerPartnerRoutes(app: FastifyInstance, adminToken: string): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Admin: Bewertungen eines Auftrags an den Partner übergeben (idempotent je Auftrag + Bewertung).
  app.post("/admin/partner/send", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const orderId = clip(b.orderId, 40) || null;
    const customer = clip(b.customer, 160) || null;
    const items = (Array.isArray(b.items) ? b.items : []).slice(0, 60) as Record<string, unknown>[];
    const created = (await insertPartnerTasks(orderId, customer, items)).map(adminView);
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
    if (b.customer != null) { args.push(clip(b.customer, 160) || null); sets.push(`customer=$${args.length}`); }
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

  // Admin → Einstellungen: automatische Weiterleitung an den Partner (Bewertungen / Profile).
  app.post("/admin/partner/settings", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    for (const k of ["reviews", "profiles"] as AutoKind[]) {
      const key = "auto" + k[0].toUpperCase() + k.slice(1);
      if (typeof b[key] === "boolean") await setSetting("auto_" + k, b[key] ? "1" : "0");
    }
    return { ok: true, autoReviews: await partnerAutoEnabled("reviews"), autoProfiles: await partnerAutoEnabled("profiles") };
  });

  // Admin → Partner: Liste der Lösch-Partner (anlegen / bearbeiten).
  app.post("/admin/partners", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return { ok: true, partners: [] };
    const r = await pool.query(`SELECT id, name, email, phone, note, active, created_at FROM partners ORDER BY active DESC, id`);
    const t = totals(await listTasks("WHERE status <> 'cancelled'"));
    return { ok: true, partners: r.rows.map((x) => ({ id: Number(x.id), name: x.name, email: x.email || "", phone: x.phone || "", note: x.note || "", active: !!x.active, created: x.created_at })), board: t };
  });
  app.post("/admin/partners/save", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const name = clip(b.name, 120), email = clip(b.email, 160), phone = clip(b.phone, 60), note = clip(b.note, 300);
    const active = b.active !== false;
    if (!name) return reply.code(400).send({ ok: false, error: "Name fehlt" });
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    const id = Number(b.id);
    if (Number.isInteger(id) && id > 0) await pool.query(`UPDATE partners SET name=$1, email=$2, phone=$3, note=$4, active=$5 WHERE id=$6`, [name, email || null, phone || null, note || null, active, id]);
    else await pool.query(`INSERT INTO partners (name, email, phone, note, active) VALUES ($1,$2,$3,$4,$5)`, [name, email || null, phone || null, note || null, active]);
    return { ok: true };
  });

  // Admin: geheimen Partner-Link holen (oder neu erzeugen → alter Link ungültig).
  app.post("/admin/partner/link", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const t = await partnerToken(b.rotate === true);
    if (!t) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    return { ok: true, url: `${SITE_URL}/partner#${t}` };
  });

  // Test-Board: zeigt nur Testaufträge (Bestell-E-Mail mit „+test"), der Partner sieht davon nichts.
  app.post("/admin/partner/test-link", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const t = await createPreviewSession(PREVIEW_EMAIL);
    if (!t) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    return { ok: true, url: `${SITE_URL}/partner?preview=1#${t}` };
  });

  /* ---- Partner (geheimer Link) ---- */
  app.post("/partner/tasks", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const preview = await isPreview(b.t);
    const rows = await listTasks(preview ? "WHERE status <> 'cancelled' AND test" : "WHERE status <> 'cancelled' AND NOT test");
    const p = preview ? { rows: [] as Record<string, unknown>[] } : pool ? await pool.query(`SELECT id, amount_usd, tasks, note, created_at FROM partner_payouts ORDER BY id DESC LIMIT 20`) : { rows: [] as Record<string, unknown>[] };
    // Screenshot der Bewertung (automatisch bei der Bestellung aufgenommen) → Vorschau statt nur Link.
    const shots = new Map<string, number>();
    const oids = [...new Set(rows.map((r) => r.order_id).filter(Boolean))];
    if (pool && oids.length) {
      const sr = await pool.query(`SELECT DISTINCT ON (order_id, url) id, order_id, url FROM review_shots WHERE status='ok' AND order_id = ANY($1::text[]) ORDER BY order_id, url, id DESC`, [oids]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
      for (const x of sr.rows as { id: number; order_id: string; url: string }[]) shots.set(`${x.order_id}|${x.url}`, Number(x.id));
    }
    return { ok: true, preview, tasks: rows.map((r) => ({ ...partnerView(r), shot: r.order_id && r.url ? shots.get(`${r.order_id}|${r.url}`) || null : null })), totals: totals(rows), payouts: p.rows.map((x) => ({ id: Number(x.id), amount: num(x.amount_usd), tasks: x.tasks, created: x.created_at })) };
  });

  // Screenshot einer Bewertung für den Partner (nur wenn er zu einer Aufgabe am Board gehört).
  app.post("/partner/shot", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const id = Number(b.id);
    if (!pool || !Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id" });
    const r = await pool.query(
      `SELECT s.mime, s.img FROM review_shots s JOIN partner_tasks t ON t.order_id = s.order_id AND t.url = s.url
        WHERE s.id=$1 AND s.status='ok' AND t.status <> 'cancelled' LIMIT 1`, [id],
    ).catch(() => ({ rows: [] as Record<string, unknown>[] }));
    const row = r.rows[0] as { mime?: string; img?: Buffer } | undefined;
    if (!row || !row.img) return reply.code(404).send({ ok: false, error: "not found" });
    return reply.header("content-type", row.mime || "image/jpeg").header("cache-control", "private, max-age=86400").send(row.img);
  });

  const PARTNER_SETTABLE = ["new", "working", "removed", "not_possible", "software"];
  const LABEL: Record<string, string> = { new: "zurückgesetzt", working: "arbeitet dran", removed: "GELÖSCHT ✓", not_possible: "nicht möglich", software: "nur per Software" };
  // Push-Titel (Uber-Stil: kurz, was passiert ist).
  const PT: Record<string, string> = { new: "Zurückgesetzt", working: "In Arbeit", removed: "Gelöscht ✓", not_possible: "Nicht möglich", software: "Nur per Software" };

  /** Status/Notiz einer Aufgabe durch den Partner setzen (gemeinsam für Einzel- und Sammel-Update). */
  async function partnerApply(id: number, status: string, noteIn: unknown, opts: { quiet?: boolean; preview?: boolean; admin?: boolean } = {}): Promise<{ row?: Row; changed?: boolean; error?: string; code?: number }> {
    if (!pool) return { error: "unavailable", code: 503 };
    const prev = await pool.query(`SELECT * FROM partner_tasks WHERE id=$1`, [id]);
    const old = prev.rows[0] as Row | undefined;
    if (!old || old.status === "cancelled") return { error: "not found", code: 404 };
    if (opts.preview !== undefined && !!old.test !== opts.preview) return { error: "not found", code: 404 }; // Test ↔ echt strikt getrennt
    if (old.paid_at && status && status !== "removed") return { error: "already paid", code: 400 };
    // Software-Fall (Partner-Regel): erst „Software deletion confirmed" → Kunde zahlt → dann starten. Vorher kein Working/Removed.
    const swPaid = String(old.admin_note || "").includes(SW_NOTE_PAID);
    if (!opts.admin && old.method === "sw" && !swPaid && (status === "working" || status === "removed")) return { error: "confirm software first – start after customer paid", code: 400 };
    // „Removed" nur aus „Working" (Partner muss die Bewertung erst als in Arbeit markieren).
    if (status === "removed" && old.status !== "removed" && old.status !== "working") return { error: "set to Working first", code: 400 };
    const note = noteIn != null ? clip(noteIn, 500) : old.partner_note;
    const st = status || old.status;
    const r = await pool.query(
      `UPDATE partner_tasks SET status=$1, partner_note=$2, updated_at=now(), touched_at=COALESCE(touched_at, now()),
         working_since = CASE WHEN $1='working' AND status<>'working' THEN now() ELSE working_since END,
         removed_at = CASE WHEN $1='removed' THEN COALESCE(removed_at, now()) ELSE NULL END
       WHERE id=$3 RETURNING *`,
      [st, note || null, id],
    );
    const row = r.rows[0] as Row;
    const changed = !!status && status !== old.status;
    // Kunde: Push SOFORT bei jeder Änderung (Mail kommt gebündelt später, nur bei Wichtigem).
    if (changed && row.order_id) void pushCustomerNow(row, old.status, status).catch(() => {});
    // Kunden-Dashboard: Status sofort sichtbar; Sammel-Mail an den Kunden nach der letzten Änderung.
    if (changed && row.order_id) {
      void partnerStatusChanged(row.order_id, row.item_key, status, {
        prev: old.status, // vorheriger Status → Kunde sieht „In Bearbeitung → Entfernt"
        makeLink: async (amount, cur) => (hasSecretKey() ? ensureReviewsAmountLink(amount, cur) : ""),
      }).catch((e) => app.log.error({ err: e }, "Kunden-Dashboard-Update fehlgeschlagen"));
    }
    if (changed && row.order_id) {
      await insertEvent({ orderId: row.order_id, type: "note", title: `Partner: ${row.code} ${LABEL[status] || status}`, detail: [row.url || row.name, note].filter(Boolean).join(" · ") }).catch(() => {});
    }
    // Push bei JEDER Statusänderung des Partners (Working, Software, Removed, Impossible, zurückgesetzt).
    if (changed && !opts.quiet) {
      void notifyTeam(`${row.test ? "TEST · " : ""}${PT[status] || status} · ${row.customer || row.code}`, ["Partner", row.code, row.order_id ? `Auftrag ${row.order_id}` : "", note || ""].filter(Boolean).join(" · "), `${SITE_URL}/admin${row.order_id ? "?order=" + encodeURIComponent(row.order_id) : ""}`, { kind: "partner" });
    }
    return { row, changed };
  }

  // Admin (neu): Status ALLER offenen Bewertungen eines Auftrags setzen — wie der Partner selbst
  // (Kunden-Dashboard, Kunden-Mail/Push, Software-Zahlungslink, Verlauf). „removed“ bleibt dem Partner vorbehalten.
  app.post("/admin/partner/order-status", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const orderId = clip(b.orderId, 40);
    const status = String(b.status || "");
    if (!orderId || !["working", "software", "not_possible"].includes(status)) return reply.code(400).send({ ok: false, error: "orderId/status fehlt" });
    const r = await pool.query(`SELECT id FROM partner_tasks WHERE order_id=$1 AND status NOT IN ('cancelled','removed') AND paid_at IS NULL ORDER BY id`, [orderId]);
    let changed = 0;
    for (const row of r.rows as { id: number }[]) {
      const x = await partnerApply(Number(row.id), status, null, { quiet: true, admin: true });
      if (x.changed) changed++;
    }
    await insertEvent({ orderId, type: "note", title: `Admin: alle Bewertungen → ${LABEL[status] || status}`, detail: `${changed} von ${r.rows.length} Partner-Aufgabe(n) geändert` }).catch(() => {});
    return { ok: true, total: r.rows.length, changed };
  });

  app.post("/partner/update", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const id = Number(b.id);
    const status = String(b.status || "");
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id missing" });
    if (status && !PARTNER_SETTABLE.includes(status)) return reply.code(400).send({ ok: false, error: "invalid status" });
    const r = await partnerApply(id, status, b.note, { preview: await isPreview(b.t) });
    if (r.error) return reply.code(r.code || 400).send({ ok: false, error: r.error });
    return { ok: true, task: partnerView(r.row as Row) };
  });

  // Sammel-Update (Mehrfachauswahl): ein Status für viele Aufgaben, EINE Team-Benachrichtigung.
  app.post("/partner/bulk", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const status = String(b.status || "");
    if (!PARTNER_SETTABLE.includes(status)) return reply.code(400).send({ ok: false, error: "invalid status" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
    if (!ids.length) return reply.code(400).send({ ok: false, error: "no tasks" });
    const tasks: ReturnType<typeof partnerView>[] = []; const skipped: number[] = []; const changedCodes: string[] = [];
    const preview = await isPreview(b.t);
    for (const id of ids) {
      const r = await partnerApply(id, status, undefined, { quiet: true, preview });
      if (r.error || !r.row) { skipped.push(id); continue; }
      tasks.push(partnerView(r.row));
      if (r.changed) changedCodes.push(r.row.code);
    }
    if (changedCodes.length) {
      void notifyTeam(`${preview ? "TEST · " : ""}${PT[status] || status} · ${changedCodes.length} Bewertungen`, "Partner · " + changedCodes.slice(0, 30).join(", "), `${SITE_URL}/admin`, { kind: "partner" });
    }
    return { ok: true, tasks, skipped };
  });

  // Partner bestätigt den Zahlungseingang (einzeln oder „Mark all paid") → Sammelposten wie im Admin.
  app.post("/partner/mark-paid", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (await isPreview(b.t)) return reply.code(400).send({ ok: false, error: "test mode" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 1000);
    const r = b.all === true
      ? await pool.query(`SELECT id, price_usd FROM partner_tasks WHERE status='removed' AND paid_at IS NULL AND NOT test`)
      : ids.length ? await pool.query(`SELECT id, price_usd FROM partner_tasks WHERE id = ANY($1::bigint[]) AND status='removed' AND paid_at IS NULL AND NOT test`, [ids]) : { rows: [] as { id: string; price_usd: string }[] };
    if (!r.rows.length) return reply.code(400).send({ ok: false, error: "nothing to mark" });
    const amount = num(r.rows.reduce((s, x) => s + Number(x.price_usd || 0), 0));
    const p = await pool.query(`INSERT INTO partner_payouts (amount_usd, tasks, note) VALUES ($1,$2,$3) RETURNING id`, [amount, r.rows.length, "vom Partner als bezahlt bestätigt"]);
    await pool.query(`UPDATE partner_tasks SET paid_at=now(), payout_id=$1, updated_at=now() WHERE id = ANY($2::bigint[])`, [p.rows[0].id, r.rows.map((x) => x.id)]);
    void notifyTeam(`Auszahlung bestätigt · $${amount}`, `Partner · ${r.rows.length} Löschungen`, `${SITE_URL}/admin`, { kind: "payout" });
    return { ok: true, payoutId: Number(p.rows[0].id), amount, tasks: r.rows.length };
  });

  // Erste Aktion ohne Statuswechsel (Bewertung geöffnet, Link kopiert) → Kunde nicht mehr „NEW".
  app.post("/partner/touch", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
    if (ids.length) await pool.query(`UPDATE partner_tasks SET touched_at=COALESCE(touched_at, now()) WHERE id = ANY($1::bigint[])`, [ids]);
    return { ok: true };
  });
}
