/* Kunden-Dashboard (vorerst NUR Einzelbewertungen).
 *
 * Nach der Bestellung bekommt jeder Bewertungs-Kunde ein Konto (E-Mail + Passwort,
 * per Auftragsbestätigung). Im Dashboard sieht er je Bewertung den Status
 * (in Prüfung → angenommen/in Arbeit → gelöscht | nicht löschbar | Spezial-Software
 * möglich), offene Zahlungen (Anzahlung, Spezial-Software, Rechnung) als Buttons.
 * Status kommt aus dem raw-JSON der Bestellung, das die Admin-Aktionen ohnehin
 * schreiben (reviewsAccepted, reviewsSoftware, reviewsRemovedAll, reviewsPayments).
 * KEINE Partner-Daten nach außen.
 */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool, setOrderRawField } from "./db";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
export const DASH_URL = `${SITE_URL}/my-reviews`;

export async function initCustomerTables(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_accounts (
      email      text PRIMARY KEY,
      pass_hash  text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz
    )
  `);
  // Sammel-Benachrichtigung: 5 Minuten nach der LETZTEN Partner-Änderung eines Auftrags eine Mail.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_notify (
      order_id   text PRIMARY KEY,
      due_at     timestamptz NOT NULL,
      keys       jsonb NOT NULL DEFAULT '[]'::jsonb
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cust_sessions (
      token_hash text PRIMARY KEY,
      email      text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    )
  `);
}

const norm = (e: unknown) => String(e || "").trim().toLowerCase().slice(0, 200);
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32);
  return `s1$${salt.toString("hex")}$${h.toString("hex")}`;
}
function verifyPassword(pw: string, stored: string): boolean {
  const [v, saltHex, hashHex] = String(stored || "").split("$");
  if (v !== "s1" || !saltHex || !hashHex) return false;
  const h = crypto.scryptSync(pw, Buffer.from(saltHex, "hex"), 32);
  const want = Buffer.from(hashHex, "hex");
  return want.length === h.length && crypto.timingSafeEqual(want, h);
}
/** Gut lesbares Passwort (ohne 0/O/1/l/I), z. B. "k7mq-Xp4r-9tzd". */
export function newPassword(): string {
  const a = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => Array.from(crypto.randomBytes(4)).map((b) => a[b % a.length]).join("");
  return `${pick()}-${pick()}-${pick()}`;
}

/** Konto anlegen, falls es noch keins gibt. Liefert das Klartext-Passwort NUR beim Anlegen. */
export async function ensureCustomerAccount(email: string): Promise<{ created: boolean; password?: string } | null> {
  if (!pool) return null;
  const e = norm(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return null;
  const pw = newPassword();
  const r = await pool.query(`INSERT INTO cust_accounts (email, pass_hash) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING RETURNING email`, [e, hashPassword(pw)]);
  return r.rowCount ? { created: true, password: pw } : { created: false };
}
/** Neues Passwort setzen (Passwort vergessen). */
export async function resetCustomerPassword(email: string): Promise<string | null> {
  if (!pool) return null;
  const pw = newPassword();
  const r = await pool.query(`UPDATE cust_accounts SET pass_hash=$2 WHERE email=$1 RETURNING email`, [norm(email), hashPassword(pw)]);
  if (!r.rowCount) return null;
  await pool.query(`DELETE FROM cust_sessions WHERE email=$1`, [norm(email)]);
  return pw;
}

async function sessionEmail(token: unknown): Promise<string | null> {
  if (!pool) return null;
  const t = String(token || "");
  if (t.length < 20) return null;
  const r = await pool.query(`SELECT email FROM cust_sessions WHERE token_hash=$1 AND expires_at > now()`, [sha(t)]);
  return r.rows[0]?.email ?? null;
}

/* ---- Zahlungen (raw.reviewsPayments) ---- */
export type CustPayment = { id: string; kind: "deposit" | "software" | "invoice"; amount: number; cur: string; url: string; n?: number; keys?: string[]; created: string; paid?: string | null };
export async function addOrderPayment(orderId: string, p: Omit<CustPayment, "id" | "created" | "paid">): Promise<void> {
  if (!pool || !orderId || !p.url) return;
  const r = await pool.query(`SELECT raw FROM orders WHERE id=$1`, [orderId]);
  const list: CustPayment[] = Array.isArray(r.rows[0]?.raw?.reviewsPayments) ? r.rows[0].raw.reviewsPayments : [];
  list.push({ ...p, id: crypto.randomBytes(5).toString("hex"), created: new Date().toISOString(), paid: null });
  await setOrderRawField(orderId, "reviewsPayments", list.slice(-30));
}
/** Stripe-Zahlung (E-Mail + Betrag) der passenden offenen Zahlung eines Bewertungs-Auftrags zuordnen. */
export async function markReviewPaymentPaid(email: string, amountMajor: number): Promise<{ orderId: string; kind: string } | null> {
  if (!pool || !email || !amountMajor) return null;
  const r = await pool.query(
    `SELECT id, raw FROM orders WHERE lower(email)=lower($1) AND service='reviews' AND raw ? 'reviewsPayments' ORDER BY created_at DESC LIMIT 10`,
    [email],
  );
  for (const row of r.rows) {
    const list: CustPayment[] = Array.isArray(row.raw?.reviewsPayments) ? row.raw.reviewsPayments : [];
    const hit = list.find((p) => !p.paid && Math.abs(Number(p.amount) - amountMajor) < 0.01);
    if (hit) {
      hit.paid = new Date().toISOString();
      await setOrderRawField(row.id, "reviewsPayments", list);
      return { orderId: row.id, kind: hit.kind };
    }
  }
  return null;
}

/* ---- Status je Bewertung (für das Dashboard) ---- */
type Item = { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean };
const keyOf = (it: Item) => it.url || `${it.name || ""}|${it.text || ""}`;
export type ItemStatus = "checking" | "in_progress" | "removed" | "not_removable" | "software_offer" | "software_in_progress" | "cancelled";

function orderView(o: { id: string; created_at: string; status: string | null; pay: string | null; lang: string | null; country: string | null; profile: string | null; company: string | null; raw: Record<string, unknown> | null }, partner: Map<string, string> = new Map()) {
  const raw = (o.raw || {}) as Record<string, unknown>;
  const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
  const accepted: Item[] | null = Array.isArray(raw.reviewsAccepted) ? (raw.reviewsAccepted as Item[]) : null;
  const software: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
  const removed: Item[] = Array.isArray(raw.reviewsRemovedAll) ? (raw.reviewsRemovedAll as Item[]) : Array.isArray(raw.reviewsRemoved) ? (raw.reviewsRemoved as Item[]) : [];
  const payments: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
  const acc = new Set((accepted || []).map(keyOf));
  const sw = new Set(software.map(keyOf));
  const rem = new Set(removed.map(keyOf));
  // Software-Anzahlung bezahlt? Je Bewertung (keys) bzw. alt: irgendeine Software-Zahlung.
  const swPaidFor = (k: string) => payments.some((p) => p.kind === "software" && p.paid && (!p.keys || !p.keys.length || p.keys.includes(k)));
  const cancelled = o.status === "storniert";
  const view = items.map((it) => {
    const k = keyOf(it);
    let status: ItemStatus = "checking";
    const ps = partner.get(k); // Status vom Partner-Board (working | removed | not_possible | software)
    if (rem.has(k)) status = "removed";
    else if (cancelled) status = "cancelled";
    else if (ps === "removed") status = "removed";
    else if (ps === "software" || sw.has(k)) status = swPaidFor(k) ? "software_in_progress" : "software_offer";
    else if (ps === "not_possible") status = "not_removable";
    else if (ps === "working" || acc.has(k)) status = "in_progress";
    else if (accepted) status = "not_removable";
    return { url: it.url || null, name: it.name || null, text: it.text || null, noText: !!it.nt, status };
  });
  return {
    id: o.id, created: o.created_at, lang: o.lang, cur: o.country === "US" ? "usd" : "eur",
    business: o.company || o.profile || "", cancelled, items: view,
    payments: payments.map((p) => ({ id: p.id, kind: p.kind, amount: p.amount, cur: p.cur, url: p.paid ? null : p.url, n: p.n || null, created: p.created, paid: p.paid || null })),
  };
}

/* ---- Routen ---- */
export function registerCustomerRoutes(app: FastifyInstance, hooks: { sendReset: (email: string, password: string, lang: string) => Promise<void> }): void {
  const hits = new Map<string, number[]>();
  const limited = (ip: string, n: number) => {
    const now = Date.now(); const a = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
    if (a.length >= n) { hits.set(ip, a); return true; }
    a.push(now); hits.set(ip, a); return false;
  };

  app.post("/cust/login", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("login:" + req.ip, 20)) return reply.code(429).send({ ok: false, error: "too_many" });
    const email = norm(b.email);
    const r = await pool.query(`SELECT pass_hash FROM cust_accounts WHERE email=$1`, [email]);
    if (!r.rows[0] || !verifyPassword(String(b.password || "").trim(), r.rows[0].pass_hash)) return reply.code(401).send({ ok: false, error: "invalid" });
    const token = crypto.randomBytes(24).toString("base64url");
    await pool.query(`INSERT INTO cust_sessions (token_hash, email, expires_at) VALUES ($1,$2, now() + interval '60 days')`, [sha(token), email]);
    await pool.query(`UPDATE cust_accounts SET last_login=now() WHERE email=$1`, [email]);
    return { ok: true, token };
  });

  app.post("/cust/logout", async (req) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (pool && b.token) await pool.query(`DELETE FROM cust_sessions WHERE token_hash=$1`, [sha(String(b.token))]);
    return { ok: true };
  });

  app.post("/cust/me", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const email = await sessionEmail(b.token);
    if (!email || !pool) return reply.code(401).send({ ok: false, error: "session" });
    const r = await pool.query(
      `SELECT id, created_at, status, pay, lang, country, profile, company, name, raw FROM orders
        WHERE lower(email)=$1 AND service='reviews' ORDER BY created_at DESC LIMIT 20`,
      [email],
    );
    const ids = r.rows.map((x) => x.id);
    const pt = ids.length ? await pool.query(`SELECT order_id, item_key, status FROM partner_tasks WHERE order_id = ANY($1::text[]) AND status <> 'cancelled'`, [ids]).catch(() => ({ rows: [] as { order_id: string; item_key: string; status: string }[] })) : { rows: [] as { order_id: string; item_key: string; status: string }[] };
    const byOrder = new Map<string, Map<string, string>>();
    for (const t of pt.rows) { if (!byOrder.has(t.order_id)) byOrder.set(t.order_id, new Map()); byOrder.get(t.order_id)!.set(t.item_key, t.status); }
    return { ok: true, email, name: r.rows[0]?.name || "", lang: r.rows[0]?.lang || "en", orders: r.rows.map((o) => orderView(o, byOrder.get(o.id))) };
  });

  // Passwort vergessen: neues Passwort per Mail (Antwort immer gleich → keine Konto-Erkennung).
  app.post("/cust/reset", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (limited("reset:" + req.ip, 5)) return reply.code(429).send({ ok: false, error: "too_many" });
    const email = norm(b.email);
    if (pool && email) {
      const pw = await resetCustomerPassword(email);
      if (pw) {
        const l = await pool.query(`SELECT lang FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [email]);
        await hooks.sendReset(email, pw, String(l.rows[0]?.lang || "en")).catch((e) => app.log.error({ err: e }, "Passwort-Mail fehlgeschlagen"));
      }
    }
    return { ok: true };
  });
}


/* ---- Partner-Änderungen → Kunden-Dashboard + Sammel-Mail (5 Min. nach der letzten Änderung) ---- */
export const NOTIFY_DELAY_MIN = 5;

/** Vom Partner-Board aufgerufen, wenn der Partner einen Status ändert.
 *  „software" → Bewertung wird Spezial-Software-Angebot mit eigenem Anzahlungs-Link (50 % von 300). */
export async function partnerStatusChanged(
  orderId: string, itemKey: string | null, status: string,
  deps: { makeLink: (amount: number, cur: "usd" | "eur") => Promise<string> },
): Promise<void> {
  if (!pool || !orderId) return;
  const r = await pool.query(`SELECT raw, country FROM orders WHERE id=$1 AND service='reviews'`, [orderId]);
  if (!r.rows[0]) return; // nur Einzelbewertungen
  const raw = (r.rows[0].raw || {}) as Record<string, unknown>;
  const cur: "usd" | "eur" = r.rows[0].country === "US" ? "usd" : "eur";
  if (status === "software" && itemKey) {
    const items: Item[] = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Item[]) : [];
    const it = items.find((x) => keyOf(x) === itemKey) || { url: /^https?:/.test(itemKey) ? itemKey : undefined };
    const sw: Item[] = Array.isArray(raw.reviewsSoftware) ? (raw.reviewsSoftware as Item[]) : [];
    if (!sw.some((x) => keyOf(x) === itemKey)) await setOrderRawField(orderId, "reviewsSoftware", [...sw, { ...it, nt: true, sw: true }]);
    const pays: CustPayment[] = Array.isArray(raw.reviewsPayments) ? (raw.reviewsPayments as CustPayment[]) : [];
    if (!pays.some((p) => p.kind === "software" && (p.keys || []).includes(itemKey))) {
      // Rabattstufe nach Anzahl der Bewertungen im Auftrag (wie überall: 3+ −10 %, 5+ −15 %, 10+ −30 %).
      const n = items.length || 1;
      const pct = n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0;
      const amount = Math.round((150 * (100 - pct)) / 100);
      const url = await deps.makeLink(amount, cur).catch(() => "");
      if (url) await addOrderPayment(orderId, { kind: "software", amount, cur, url, n: 1, keys: [itemKey] });
    }
  }
  // Sammel-Mail planen bzw. verschieben (Debounce).
  await pool.query(
    `INSERT INTO cust_notify (order_id, due_at, keys) VALUES ($1, now() + ($2 || ' minutes')::interval, $3::jsonb)
     ON CONFLICT (order_id) DO UPDATE SET due_at = EXCLUDED.due_at,
       keys = (SELECT jsonb_agg(DISTINCT k) FROM jsonb_array_elements(cust_notify.keys || EXCLUDED.keys) k)`,
    [orderId, String(NOTIFY_DELAY_MIN), JSON.stringify(itemKey ? [itemKey] : [])],
  );
}

/** Fällige Sammel-Mails holen (und aus der Warteschlange nehmen). */
export async function takeDueNotifications(): Promise<{ orderId: string; email: string; name: string; lang: string; country: string | null; keys: string[]; changed: { url: string | null; name: string | null; status: ItemStatus }[] }[]> {
  if (!pool) return [];
  const due = await pool.query(`DELETE FROM cust_notify WHERE due_at <= now() RETURNING order_id, keys`);
  const out = [];
  for (const d of due.rows) {
    const o = await pool.query(`SELECT id, created_at, status, pay, lang, country, profile, company, name, email, raw FROM orders WHERE id=$1`, [d.order_id]);
    const row = o.rows[0];
    if (!row || !row.email) continue;
    const pt = await pool.query(`SELECT item_key, status FROM partner_tasks WHERE order_id=$1 AND status <> 'cancelled'`, [d.order_id]);
    const view = orderView(row, new Map(pt.rows.map((x) => [x.item_key, x.status])));
    const items: Item[] = Array.isArray(row.raw?.reviewItems) ? row.raw.reviewItems : [];
    const keys: string[] = Array.isArray(d.keys) ? d.keys : [];
    const changed = items.map((it, i) => ({ k: keyOf(it), v: view.items[i] })).filter((x) => keys.includes(x.k)).map((x) => ({ url: x.v.url, name: x.v.name, status: x.v.status }));
    out.push({ orderId: row.id, email: row.email, name: row.name || "", lang: row.lang || "en", country: row.country, changed, keys });
  }
  return out;
}

/** Fehlgeschlagene Sammel-Mail später nochmal versuchen. */
export async function requeueNotify(orderId: string, keys: string[], minutes = 15): Promise<void> {
  if (!pool) return;
  await pool.query(
    `INSERT INTO cust_notify (order_id, due_at, keys) VALUES ($1, now() + ($2 || ' minutes')::interval, $3::jsonb)
     ON CONFLICT (order_id) DO UPDATE SET keys = (SELECT jsonb_agg(DISTINCT k) FROM jsonb_array_elements(cust_notify.keys || EXCLUDED.keys) k)`,
    [orderId, String(minutes), JSON.stringify(keys)],
  );
}

/* ---- Admin: Dashboard-Zugänge für alle offenen Einzelbewertungs-Aufträge anlegen (OHNE Mail) ---- */
export function registerCustomerAdminRoutes(app: FastifyInstance, adminToken: string): void {
  app.post("/admin/cust/accounts-open", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    // Offen = Einzelbewertungs-Auftrag nicht erledigt/storniert ODER mit offenen Partner-Aufgaben.
    const open = await pool.query(
      `SELECT id, email, name, company, profile FROM orders
        WHERE service='reviews' AND COALESCE(status,'') NOT IN ('done','storniert') AND email IS NOT NULL`,
    );
    const fromTasks = await pool.query(
      `SELECT DISTINCT o.id, o.email, o.name, o.company, o.profile FROM partner_tasks t JOIN orders o ON o.id = t.order_id
        WHERE t.status NOT IN ('removed','cancelled') AND o.email IS NOT NULL`,
    ).catch(() => ({ rows: [] as Record<string, string>[] }));
    // Partner-Aufgaben ohne Auftrag (manuell übergeben): über den Profilnamen zuordnen.
    const loose = await pool.query(
      `SELECT DISTINCT customer FROM partner_tasks WHERE order_id IS NULL AND customer IS NOT NULL AND status NOT IN ('removed','cancelled')`,
    ).catch(() => ({ rows: [] as { customer: string }[] }));
    const matched: Record<string, string>[] = [] as Record<string, string>[];
    const unmatched: string[] = [];
    for (const l of loose.rows) {
      const m = await pool.query(
        `SELECT id, email, name, company, profile FROM orders WHERE email IS NOT NULL AND (lower(company)=lower($1) OR lower(profile)=lower($1) OR lower(raw->>'profileName')=lower($1)) ORDER BY created_at DESC LIMIT 1`,
        [l.customer],
      );
      if (m.rows[0]) matched.push(m.rows[0]); else unmatched.push(l.customer);
    }
    const byEmail = new Map<string, { email: string; name: string; business: string; orders: string[] }>();
    for (const o of [...(open.rows as Record<string, string>[]), ...(fromTasks.rows as Record<string, string>[]), ...matched]) {
      const e = norm(o.email);
      if (!e) continue;
      const cur = byEmail.get(e) || { email: e, name: o.name || "", business: o.company || o.profile || "", orders: [] as string[] };
      if (!cur.orders.includes(o.id)) cur.orders.push(o.id);
      byEmail.set(e, cur);
    }
    const accounts = [];
    for (const a of byEmail.values()) {
      const acc = await ensureCustomerAccount(a.email);
      accounts.push({ ...a, password: acc && acc.created ? acc.password : null, existed: !!(acc && !acc.created) });
    }
    return { ok: true, url: DASH_URL, accounts, unmatched };
  });
}
