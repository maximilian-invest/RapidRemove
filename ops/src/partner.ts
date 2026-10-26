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
import { pool, insertEvent, bumpChange } from "./db";
import { checkRemoval, removalShot } from "./removalCheck";
import { checkRemovalStrict } from "./removalScan";
import { probeReviewLink } from "./linkProbe";
import { expandShortLink } from "./monitor";
import { applySwTariff } from "./swTariff";
import { notifyTeam } from "./notify";
import { partnerStatusChanged, SW_NOTE_PAID, SW_NOTE_DECLINED, SW_NOTE_APPROVED, SW_NOTE_COVERED, swStartAllowed, partnerToDash, autopayHooks } from "./customers";
import { lpOf, PRICE_V2_OTHER, expressPartnerDue, expressCustomerDue } from "./reviewsPricing";
import { ensureReviewsAmountLink } from "./reviewsSetup";
import { hasSecretKey } from "./integrations/stripe";
import { isPartnerSession, partnerSessionEmail, createPreviewSession } from "./partnerAuth";
import { isTestEmail } from "./testAccounts";
import { notifyCustomer } from "./custPush";
import { customerPush } from "./pushTexts";
import { partnerNewOrder, notifyPartner, partnerJobsMail } from "./partnerNotify";
import { REPORT_REASONS, REPORT_IDS, reportDe } from "./reportReasons";
import { initPayoutTables, registerPayoutRoutes, recordManualPayout, payoutSetupMissing } from "./payouts";
import { serviceOf, routeFor, partnerPrice, defaultPartnerFor, partnerIdOf, partnerStatus, registerPartnerRegistry, partnerIfApproved, type ServiceId } from "./partnerRegistry";
import { custSetup, tierFor, normTiers, type CustSetup } from "./bulkPricing";
import { isBulkOrder, bulkSoftwareCancelled } from "./bulkRules";

/** Vermerk an der Aufgabe: Bulk-Bewertung braucht Software → aus der Bulk-Bestellung storniert. */
export const BULK_SW_NOTE = "Bulk: nur per Software → storniert (Kunde beauftragt einzeln)";
export const PARTNER_PRICES = { normal: 10, old: 40, nt: 150, profile: 50 } as const; // profile = ganzes Google-Profil (Platzhalter, im Admin je Aufgabe änderbar)
// USD, Stand 5.10.2026 (Rechnung RVA-001: $10/Link; alt $40; ohne Text $150)
export type TaskKind = keyof typeof PARTNER_PRICES;
export const PARTNER_STATUSES = ["new", "working", "removed", "not_possible", "software", "cancelled"] as const;
export type TaskStatus = (typeof PARTNER_STATUSES)[number];

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
/** Push-Link direkt zur Bewertung im Admin (Auftrag → Bewertungen, Bewertung geöffnet/markiert). Mehrere Aufträge → der erste. */
function rvLink(pairs: { order_id?: string | null; code?: string | null }[]): string {
  const first = pairs.find((p) => p.order_id);
  if (!first) return `${SITE_URL}/admin`;
  const codes = pairs.filter((p) => p.order_id === first.order_id && p.code).map((p) => p.code).slice(0, 30);
  return `${SITE_URL}/admin?order=${encodeURIComponent(String(first.order_id))}${codes.length ? "&review=" + encodeURIComponent(codes.join(",")) : ""}`;
}

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
  // 18.10.2026: Kurzlink (maps.app.goo.gl …) aufgelöst → iPhone öffnet die echte Adresse in Safari statt in der Maps-App („Nicht unterstützter Link").
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS long_url text`);
  // Erste Partner-Aktion (Status, Notiz, Öffnen, Link kopieren) → Kunde gilt nicht mehr als „NEW".
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS touched_at timestamptz`);
  // 26.10.2026: Admin zieht Aufgaben vom Partner zurück (withdrawTasks) → Status „cancelled", Kunde unberührt.
  // orig_item_key = ursprünglicher Schlüssel der Bewertung; item_key wird umbenannt, damit die Bewertung wieder frei ist
  // (neu übergeben möglich, Kunden-/Software-Updates und Reaktivierungen treffen die zurückgezogene Aufgabe nicht mehr).
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz`);
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS orig_item_key text`);
  // War für einen entzogenen Job schon an den Partner gezahlt (Board-Auszahlung oder z. B. Software-Vorauszahlung außerhalb) → offene Rückforderung (USD).
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS refund_usd numeric`);
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS refund_settled_at timestamptz`);
  // Früher abgelehnte Software-Aufgaben (storniert) wieder unter „Software" zeigen – mit „Customer declined deletion".
  await pool.query(`UPDATE partner_tasks SET status='software' WHERE status='cancelled' AND paid_at IS NULL AND admin_note LIKE '%Spezial-Software abgelehnt (Dashboard)%' AND withdrawn_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = partner_tasks.order_id AND o.status = 'storniert')`).catch(() => {});
  // Stornierte Aufträge: offene Aufgaben bleiben storniert (auch wenn eine ältere Regel sie zurückgeholt hat).
  await pool.query(`UPDATE partner_tasks SET status='cancelled', updated_at=now() WHERE status IN ('new','working','not_possible','software') AND paid_at IS NULL
    AND order_id IN (SELECT id FROM orders WHERE status = 'storniert')`).catch(() => {});
  // Testbestellungen (E-Mail mit „+test"): nur im Test-Board des Admins, nie beim Partner.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS test boolean NOT NULL DEFAULT false`);
  // Verfahren laut Partner-Regel (10/2026): sw = Software nötig (alt + USA mit Text, oder ohne Text), legal = erst rechtliche Meldung.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS method text`);
  // Einmalig: noch nicht begonnene Aufgaben aus Bestellungen VOR der Regel einordnen (Land aus Profil-Adresse bzw. Bestellung).
  await backfillMethods().catch((e) => console.error("Partner: Verfahren nachtragen fehlgeschlagen", e));
  // Software-Fälle bekommt der Partner mit dem Software-Preis bezahlt (offene, noch nicht ausgezahlte Aufgaben).
  // Kunden mit eigenem Partner-Software-Preis (sw_price_usd, Admin → Kunden & Preise) ausgenommen.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS sw_price_usd numeric`);
  // 18.10.2026: Software-Tarif (swTariff.ts) – sw_at = seit wann freigegeben (Wochenzählung 150/110). Diese Aufgaben nicht mehr anheben.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS sw_at timestamptz`);
  await pool.query(`UPDATE partner_tasks SET price_usd=$1 WHERE method='sw' AND sw_price_usd IS NULL AND status IN ('new','software','working') AND paid_at IS NULL AND price_usd < $1 AND sw_at IS NULL`, [PARTNER_PRICES.nt]).catch(() => {});
  // Seit wann „Working" (Mobil-Board zeigt „Working · 3 h 20 min").
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS working_since timestamptz`);
  // Express (Preismodell 2, nur 250er): Start der Express-Frist (Partner: Kunden-Zusage − 6 Std.). NULL = kein Express.
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS express_at timestamptz`);
  // Meldegrund des Partners beim „Removed" (reportReasons.ts).
  for (const c of ["report_reason text", "report_note text", "report_at timestamptz"]) await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS ${c}`);
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
  await initPayoutTables(); // Auszahlungen: Partner-Auszahlungsdaten, Gutschriften, Payoneer (payouts.ts)
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
  long_url?: string | null;
  touched_at: string | null; working_since: string | null; test?: boolean; method?: string | null; partner_id?: string | null;
  report_reason?: string | null; report_note?: string | null; report_at?: string | null; express_at?: string | null;
  withdrawn_at?: string | null; orig_item_key?: string | null; refund_usd?: string | null; refund_settled_at?: string | null;
};
const num = (v: unknown) => Math.round(Number(v || 0) * 100) / 100;

/** Für den Partner: keine Besteller-Daten (kein Auftrag, keine Kontaktdaten) — nur der öffentliche Profilname. */
function partnerView(r: Row) {
  return {
    id: Number(r.id), code: r.code, customer: r.customer || "", url: r.url, gurl: r.long_url || null, reviewer: r.name, text: r.text, // öffentliche Bewertungsdaten, keine Kundendaten
    kind: r.kind, price: num(r.price_usd), status: r.status, note: r.partner_note || "",
    created: r.created_at, updated: r.updated_at, removed: r.removed_at, paid: r.paid_at, processing: !!r.payout_id && !r.paid_at, touched: !!r.touched_at, workingSince: r.working_since,
    // Software-Fluss: „software" = wartet auf die Entscheidung des Kunden; bezahlt → Aufgabe steht wieder auf „working".
    method: r.method || null, // sw | legal | null (Hinweis beim Partner: Software prüfen bzw. erst rechtliche Meldung)
    reportReason: r.report_reason || null, reportNote: r.report_note || "", // womit der Partner gemeldet hat (beim „Removed")
    // Express (Preismodell 2): Priorität hoch. Frist = Kunden-Zusage − 6 Std. (Mo–Fr 12:00: 24 Std.; Fr 12:00–So: Di 18:00 Wiener Zeit).
    withdrawn: r.withdrawn_at || null, // vom Admin entzogen (steht beim Partner unter „Cancelled")
    refund: Number(r.refund_usd) > 0 ? { usd: num(r.refund_usd), settled: r.refund_settled_at || null } : null, // Rückforderung an den Partner
    express: r.express_at ? { at: r.express_at, due: expressPartnerDue(r.express_at), custDue: expressCustomerDue(r.express_at) } : null,
    sw: r.status === "software" ? ((r.admin_note || "").includes(SW_NOTE_DECLINED) ? "declined" : "pending") : ((r.status === "working" && swStartAllowed(r.admin_note)) || (r.status === "new" && String(r.admin_note || "").includes(SW_NOTE_COVERED)) ? "paid" : null), // 250er: Software freigegeben (im Preis)
  };
}
function adminView(r: Row) {
  return { ...partnerView(r), orderId: r.order_id, itemKey: r.item_key, name: r.name, text: r.text, rating: (r as Row & { rating?: number | null }).rating ? Number((r as Row & { rating?: number | null }).rating) : null, adminNote: r.admin_note || "", origKey: r.orig_item_key || r.item_key, payoutId: r.payout_id ? Number(r.payout_id) : null, test: !!r.test, partnerId: r.partner_id ? Number(r.partner_id) : null };
}

const SHORT_LINK = /^https?:\/\/(share\.google|maps\.app\.goo\.gl|goo\.gl|g\.co)\//i;
let filling = false;
/** Kurzlinks der Aufgaben im Hintergrund auflösen (long_url) – beim nächsten Laden öffnet das iPhone dann direkt die echte Google-Adresse. */
export function fillLongUrls(rows: Row[]): void {
  if (!pool || filling) return;
  const todo = rows.filter((r) => r.url && SHORT_LINK.test(r.url) && !r.long_url).slice(0, 25);
  if (!todo.length) return;
  filling = true;
  (async () => {
    for (const r of todo) {
      const u = await expandShortLink(r.url as string).catch(() => "");
      if (u && !SHORT_LINK.test(u) && /^https:\/\/(www\.)?google\./i.test(u)) await pool!.query(`UPDATE partner_tasks SET long_url=$1 WHERE url=$2 AND long_url IS NULL`, [u, r.url]).catch(() => {});
    }
  })().finally(() => { filling = false; });
}

/** Grund des Kunden je Bewertung (orders.raw.reviewItems[].reason) → Map „orderId|itemKey" → { custReason, custNote }. */
export async function customerReasons(orderIds: string[]): Promise<Map<string, { custReason: string; custNote: string }>> {
  const m = new Map<string, { custReason: string; custNote: string }>();
  if (!pool || !orderIds.length) return m;
  const r = await pool.query(`SELECT id, raw->'reviewItems' AS items FROM orders WHERE id = ANY($1::text[])`, [orderIds]).catch(() => ({ rows: [] as { id: string; items: unknown }[] }));
  for (const o of r.rows as { id: string; items: unknown }[]) {
    for (const it of (Array.isArray(o.items) ? o.items : []) as Record<string, unknown>[]) {
      if (!it.reason) continue;
      const url = httpUrl(it.url), name = clip(it.name, 120), text = clip(it.text, 600) || (!url && !name ? clip(it.url, 600) : "");
      const v = { custReason: String(it.reason), custNote: clip(it.reasonNote, 300) };
      m.set(`${o.id}|${url || `${name}|${text}`}`, v);
      if (it.url) m.set(`${o.id}|${String(it.url)}`, v);
    }
  }
  return m;
}

/** Meldegründe des Partners speichern ({ [taskId]: { r, note } }). Gibt die IDs zurück, denen danach noch ein Grund fehlt. */
async function saveReportReasons(rows: { id: string | number; report_reason?: string | null }[], given: unknown): Promise<number[]> {
  const g = (given && typeof given === "object" ? given : {}) as Record<string, { r?: unknown; note?: unknown }>;
  const missing: number[] = [];
  for (const x of rows) {
    const v = g[String(x.id)];
    const rr = v && REPORT_IDS.includes(String(v.r)) ? String(v.r) : null;
    const note = v ? clip(v.note, 300) : "";
    if (rr && (rr !== "other" || note.length >= 3)) {
      if (pool) await pool.query(`UPDATE partner_tasks SET report_reason=$2, report_note=$3, report_at=now() WHERE id=$1`, [x.id, rr, note || null]);
      x.report_reason = rr;
    } else if (!x.report_reason) missing.push(Number(x.id));
  }
  return missing;
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
    refundUsd: num(rows.filter((r) => !r.test && Number(r.refund_usd) > 0 && !r.refund_settled_at).reduce((s, r) => s + Number(r.refund_usd || 0), 0)), // offene Rückforderungen
  };
}

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const httpUrl = (v: unknown) => { const s = clip(v, 600); return /^https?:\/\/\S+$/i.test(s) ? s : ""; };

/** Bewertungen als Partner-Aufgaben anlegen (idempotent je Auftrag + Bewertung). */
async function insertPartnerTasks(orderId: string | null, customer: string | null, items: Record<string, unknown>[], partnerIdIn: number | null = null): Promise<Row[]> {
  if (!pool) return [];
  const out: Row[] = [];
  const fresh: { code: string; kind: string; price: number; pid: number | null }[] = [];
  const ord = orderId ? (await pool.query(`SELECT email, COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(raw->'reviewItems')='array' THEN raw->'reviewItems' END), 0) AS n FROM orders WHERE id=$1`, [orderId]).catch(() => ({ rows: [] as { email?: string; n?: number }[] }))).rows[0] : undefined;
  const test = orderId ? isTestEmail(ord?.email) : false;
  // Kunden-Dashboard (Admin → Kunden & Preise): fester Partner + Partner-Staffel/Software-Preis dieses Kunden.
  const cs: CustSetup | null = ord?.email ? await custSetup(ord.email).catch(() => null) : null;
  const csT = cs?.partner.tiers?.length ? tierFor(cs.partner.tiers, Math.max(Number(ord?.n) || 0, items.length)) : null;
  const csTier = csT ? csT.price : 0; // unter der ersten Stufe: normaler Partnerpreis
  const csSw = Number(cs?.partner.sw) > 0 && (csT || !cs?.partner.tiers?.length) ? Number(cs!.partner.sw) : 0;
  // Auftrag hat schon Aufgaben → Nachbestellung („Review added" statt „New order").
  const had = orderId ? Number((await pool.query(`SELECT count(*)::int AS n FROM partner_tasks WHERE order_id=$1`, [orderId]).catch(() => ({ rows: [{ n: 0 }] }))).rows[0]?.n || 0) > 0 : false;
  for (const it of items.slice(0, 5000)) { // Bulk-Uploads: bis zu 5.000 Bewertungen je Auftrag
    const url = httpUrl(it.url);
    const name = clip(it.name, 120);
    // Kunde hat statt eines Links den Bewertungstext ins Link-Feld kopiert → als Text übernehmen.
    const text = clip(it.text, 600) || (!url && !name ? clip(it.url, 600) : "");
    if (!url && !name && !text) continue;
    const kind: TaskKind = it.kind === "profile" ? "profile" : it.nt === true ? "nt" : it.old === true ? "old" : "normal";
    const key = url || `${name}|${text}`;
    // Partner: vorgegeben (Admin/Zuteilung) – sonst Zuteilung der Leistung bzw. erster aktiver Partner. Preis = Partnerpreis der Leistung.
    // Preismodell 2: Express (nur 250er) = Anweisung „Software-Löschung" mit Priorität + 24-Std.-Timer.
    const v250 = kind !== "profile" && lpOf(it as { lp?: unknown }) === PRICE_V2_OTHER;
    const xNow = v250 && it.x === true;
    const svc: ServiceId = serviceOf({ kind, sw: it.sw || xNow, nt: it.nt, old: it.old });
    const pid = partnerIdIn ?? (await partnerIfApproved(cs?.partnerId, svc)) ?? (await defaultPartnerFor(svc));
    // Partnerpreis: bei der Bestellung festgeschrieben (pUsd) > vorgegeben (Admin, price) > Kunden-Konditionen > Preis der Leistung beim Partner.
    const swCase = svc === "sw";
    const csPrice = kind === "profile" ? 0 : swCase ? csSw : csTier;
    const price = Number(it.pUsd) > 0 ? Number(it.pUsd) : Number.isFinite(Number(it.price)) && Number(it.price) > 0 ? Number(it.price) : csPrice > 0 ? csPrice : await partnerPrice(pid, svc);
    // Wird eine normale Bewertung später zum Software-Fall, bekommt der Partner dafür diesen Preis (null = wie bisher).
    // Preismodell 2: 250er-Bewertungen decken Software ab → Software-Preis des Partners schon jetzt hinterlegen.
    // 18.10.2026: nur noch AUSDRÜCKLICHE Partner-Software-Preise – sonst entscheidet der Software-Tarif (150 / ab dem 11. Fall der Woche 110).
    const swPrice = kind === "profile" ? null : Number(it.pSw) > 0 ? Number(it.pSw) : csSw > 0 ? csSw : null;
    // 250er: Software-Fall darf sofort starten (kein Warten auf den Kunden). Express: 24-Std.-Timer ab jetzt.
    const covNote = v250 && (it.nt === true || it.sw === true || xNow) ? (xNow ? "EXPRESS · " : "") + SW_NOTE_COVERED : null;
    const cust = clip(it.business, 160) || customer; // Bulk (gemischte Profile): Partner-Board gruppiert nach Profilname der Bewertung
    // Ohne Auftrag (manuell, z. B. aus WhatsApp) greift der Unique-Index nicht (NULL) → selbst prüfen.
    if (!orderId) {
      const ex = await pool.query(`SELECT * FROM partner_tasks WHERE order_id IS NULL AND item_key=$1 LIMIT 1`, [key]);
      if (ex.rows[0]) { out.push(ex.rows[0] as Row); continue; }
    }
    const r = await pool.query(
      `INSERT INTO partner_tasks (order_id, item_key, url, name, text, kind, price_usd, customer, test, rating, age_days, method, partner_id, sw_price_usd, admin_note, express_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, CASE WHEN $16::boolean THEN now() ELSE NULL END)
       ON CONFLICT (order_id, item_key) DO UPDATE SET customer = COALESCE(partner_tasks.customer, EXCLUDED.customer)
       RETURNING *`,
      [orderId, key, url || null, name || null, text || null, kind, price, cust, test,
        Number(it.rating) >= 1 && Number(it.rating) <= 5 ? Math.round(Number(it.rating)) : null, Number.isFinite(Number(it.days)) && it.days !== null && it.days !== undefined && Number(it.days) >= 0 ? Math.round(Number(it.days)) : null,
        it.kind === "profile" ? null : it.nt === true || it.sw === true || xNow ? "sw" : it.old === true ? "legal" : null, pid, swPrice, covNote, xNow],
    );
    let row = r.rows[0] as Row;
    const isNew = !row.code;
    if (!row.code) {
      const u = await pool.query(`UPDATE partner_tasks SET code = 'RV-' || lpad(id::text, 4, '0') WHERE id=$1 RETURNING *`, [row.id]);
      row = u.rows[0] as Row;
      fresh.push({ code: row.code, kind: row.kind, price: num(row.price_usd), pid: row.partner_id ? Number(row.partner_id) : pid }); // neu angelegt → Partner benachrichtigen
    }
    // Schon als Software bestellt (ohne Text / Software / Express / 250er) → Software-Tarif gilt ab jetzt.
    if (isNew && row.code && kind !== "profile" && (it.nt === true || it.sw === true || xNow)) {
      await applySwTariff([row.id]).catch(() => {});
      const re = await pool.query(`SELECT * FROM partner_tasks WHERE id=$1`, [row.id]).catch(() => ({ rows: [] as Row[] }));
      if (re.rows[0]) { row = re.rows[0] as Row; const f = fresh.find((x) => x.code === row.code); if (f) f.price = num(row.price_usd); }
    }
    out.push(row);
  }
  // Je Partner benachrichtigen (Testauftrag → nur an den Test-Login).
  const byPid = new Map<string, typeof fresh>(); for (const f of fresh) { const k = String(f.pid ?? ""); if (!byPid.has(k)) byPid.set(k, []); byPid.get(k)!.push(f); }
  for (const [k, list] of byPid) void partnerNewOrder(customer || "", list, test, had, k ? Number(k) : null);
  return out;
}

/* ---- Automatische Weiterleitung (Admin → Einstellungen) ---- */
export type AutoKind = "reviews" | "profiles";
/** PayPal/Wise −10 % im Checkout je Bestellkategorie (Admin → Einstellungen). Standard: an. */
export async function payDiscountEnabled(kind: AutoKind): Promise<boolean> {
  const v = await getSetting("disc_" + kind).catch(() => null);
  return v == null ? true : v === "1";
}
const AUTO_DEFAULT: Record<AutoKind, boolean> = { reviews: true, profiles: false };
export async function partnerAutoEnabled(kind: AutoKind): Promise<boolean> {
  const v = await getSetting("auto_" + kind).catch(() => null);
  return v == null ? AUTO_DEFAULT[kind] : v === "1";
}

/** Neue Profil-Bestellung → das Google-Profil als eine Partner-Aufgabe (nur wenn in den Einstellungen aktiv). */
export async function partnerAutoSendProfile(orderId: string, customer: string, url: string): Promise<number> {
  if (!pool || !orderId) return 0;
  const name = clip(customer, 120);
  const pid = await routeFor("profile"); // Zuteilung (Einstellungen) – ohne Zuteilung bleibt das Profil beim Admin
  if (!pid) return 0;
  const rows = await insertPartnerTasks(orderId, name || null, [{ url, name: name || "Google profile", text: "Remove the whole Google Business Profile", kind: "profile" }], pid);
  if (rows.length) await insertEvent({ orderId, type: "note", title: "Automatisch ans Partner-Board (Profil)", detail: rows.map((t) => `${t.code} ($${num(t.price_usd)})`).join(" · ") }).catch(() => {});
  return rows.length;
}

/** Neue Bewertungs-Bestellung → Bewertungen automatisch an den Partner, dem die jeweilige Leistung zugeteilt ist
 *  (Einstellungen → Automatische Weiterleitung). Leistungen ohne Zuteilung bleiben beim Admin (manuell übergeben). */
export async function partnerAutoSend(orderId: string, customer: string, items: Record<string, unknown>[]): Promise<number> {
  if (!pool || !orderId || !items.length) return 0;
  const groups = new Map<number, Record<string, unknown>[]>();
  // Fester Partner des Kunden (Admin → Kunden & Preise) – für jede Leistung, die dieser Partner macht; sonst normale Zuteilung.
  const em = (await pool.query(`SELECT email FROM orders WHERE id=$1`, [orderId]).catch(() => ({ rows: [] as { email?: string }[] }))).rows[0]?.email;
  const fixedPid = em ? (await custSetup(em).catch(() => null))?.partnerId ?? null : null;
  for (const it of items) {
    const svc = serviceOf({ kind: it.kind, sw: it.sw, nt: it.nt, old: it.old });
    const pid = (await partnerIfApproved(fixedPid, svc)) ?? (await routeFor(svc));
    if (!pid) continue;
    if (!groups.has(pid)) groups.set(pid, []);
    groups.get(pid)!.push(it);
  }
  const rows: Row[] = [];
  for (const [pid, list] of groups) rows.push(...(await insertPartnerTasks(orderId, clip(customer, 160) || null, list, pid)));
  if (rows.length) await insertEvent({ orderId, type: "note", title: "Automatisch ans Partner-Board", detail: rows.slice(0, 40).map((t) => `${t.code} (${t.kind}, $${num(t.price_usd)})`).join(" · ") + (rows.length > 40 ? ` · … +${rows.length - 40} weitere` : "") }).catch(() => {});
  return rows.length;
}

/** Auftrag storniert → offene Aufgaben vom Board nehmen; reaktiviert → wieder einstellen. Gelöschte/bezahlte bleiben. */
export async function partnerOrderStatus(orderId: string, status: string): Promise<void> {
  if (!pool || !orderId) return;
  if (status === "storniert") {
    const r = await pool.query(`UPDATE partner_tasks SET status='cancelled', updated_at=now() WHERE order_id=$1 AND status IN ('new','working','not_possible','software') AND paid_at IS NULL RETURNING code, customer, test`, [orderId]);
    // Partner sofort informieren: Auftrag ist weg vom Board (steht unter „Cancelled").
    if (r.rows.length) {
      const test = !!r.rows[0].test, cust = r.rows[0].customer || "a customer", n = r.rows.length;
      void notifyPartner(`${test ? "TEST · " : ""}Order cancelled`, `RapidRemove cancelled the order for ${cust} · ${n} review${n > 1 ? "s" : ""} (${r.rows.slice(0, 4).map((x) => x.code).join(", ")}). No need to work on it.`, undefined, test);
    }
  } else if (status === "progress" || status === "new") { // Reaktivierung eines stornierten Auftrags
    await pool.query(`UPDATE partner_tasks SET status='new', updated_at=now() WHERE order_id=$1 AND status='cancelled' AND withdrawn_at IS NULL`, [orderId]); // zurückgezogene bleiben beim Admin
  }
}

/* ---- Dem Partner entziehen / wieder zuweisen (Admin, 26.10.2026 – Umschalter) ----
 * Der Partner gibt die Aufgabe ab: Status „cancelled" (steht bei ihm unter „Cancelled", kein Working/Removed/Software/
 * Not possible mehr möglich, kommt nie in „To be paid"). Der Kunde merkt nichts: keine Belastung, kein Push, keine Mail,
 * der Auftrag bleibt wie er ist (In Bearbeitung). Die Bewertung ist danach im Admin wieder frei (nicht mehr „beim Partner"). */
export const WITHDRAWABLE = ["new", "working", "software", "not_possible"] as const;
const STATUS_DE: Record<string, string> = { new: "nicht gestartet", working: "in Arbeit", software: "Software", not_possible: "nicht möglich", removed: "gelöscht", cancelled: "storniert" };
export async function withdrawTasks(ids: number[], noteIn: unknown, refundsIn: unknown = null): Promise<{ done: Row[]; skipped: { id: number; code: string | null; why: string }[] }> {
  const done: Row[] = []; const skipped: { id: number; code: string | null; why: string }[] = [];
  if (!pool) return { done, skipped };
  const note = clip(noteIn, 300);
  // Rückforderung je Aufgabe (USD): vom Admin angegeben (z. B. Software-Vorauszahlung außerhalb des Boards), sonst = Partnerpreis, wenn schon ausbezahlt.
  const refundsGiven = (refundsIn && typeof refundsIn === "object" ? refundsIn : {}) as Record<string, unknown>;
  for (const id of [...new Set(ids)]) {
    const cur = (await pool.query(`SELECT * FROM partner_tasks WHERE id=$1`, [id])).rows[0] as Row | undefined;
    if (!cur) { skipped.push({ id, code: null, why: "nicht gefunden" }); continue; }
    if (cur.status === "removed") { skipped.push({ id, code: cur.code, why: "schon gelöscht (Kunde wird dafür belastet)" }); continue; }
    if (cur.status === "cancelled") { skipped.push({ id, code: cur.code, why: cur.withdrawn_at ? "schon entzogen" : "schon storniert" }); continue; }
    if (cur.payout_id && !cur.paid_at) { skipped.push({ id, code: cur.code, why: "Auszahlung läuft gerade – kurz warten" }); continue; }
    if (!(WITHDRAWABLE as readonly string[]).includes(cur.status)) { skipped.push({ id, code: cur.code, why: "Status " + cur.status }); continue; }
    const rg = refundsGiven[String(id)];
    const refund = rg != null && rg !== "" && Number.isFinite(Number(rg)) && Number(rg) >= 0 ? Math.round(Number(rg) * 100) / 100 : cur.paid_at ? num(cur.price_usd) : 0;
    // Nur wenn sich der Status seit dem Lesen nicht geändert hat (Partner klickt gleichzeitig „Removed", Auto-Scan …).
    const r = await pool.query(
      `UPDATE partner_tasks SET status='cancelled', withdrawn_at=now(), updated_at=now(),
         refund_usd = CASE WHEN $5::numeric > 0 THEN $5::numeric ELSE NULL END, refund_settled_at = NULL,
         orig_item_key = COALESCE(orig_item_key, item_key),
         item_key = CASE WHEN item_key IS NULL THEN NULL ELSE item_key || '#withdrawn-' || id END,
         admin_note = concat_ws(' · ', NULLIF(trim(COALESCE(admin_note,'')), ''),
           'Dem Partner entzogen ' || to_char(now() AT TIME ZONE 'Europe/Vienna', 'DD.MM.YYYY HH24:MI') || ' (vorher: ' || $3::text || ')' || CASE WHEN $4::text <> '' THEN ' – ' || $4::text ELSE '' END
           || CASE WHEN $5::numeric > 0 THEN ' · Rückforderung ' || $5::text || ' USD' ELSE '' END)
       WHERE id=$1 AND status=$2 AND (payout_id IS NULL OR paid_at IS NOT NULL) RETURNING *`,
      [id, cur.status, STATUS_DE[cur.status] || cur.status, note, refund],
    );
    if (!r.rows[0]) { skipped.push({ id, code: cur.code, why: "inzwischen geändert – neu laden" }); continue; }
    done.push(r.rows[0] as Row);
  }
  if (!done.length) return { done, skipped };
  bumpChange(); // Admin + Partner-Board sofort aktualisieren
  // Verlauf je Auftrag (nur intern).
  const byOrder = new Map<string, Row[]>();
  for (const t of done) if (t.order_id) { if (!byOrder.has(t.order_id)) byOrder.set(t.order_id, []); byOrder.get(t.order_id)!.push(t); }
  for (const [orderId, list] of byOrder) {
    await insertEvent({ orderId, type: "note", title: `Dem Partner entzogen: ${list.map((t) => t.code).join(", ")}`,
      detail: ["Partner-Aufgabe(n) → Cancelled, Bewertung(en) wieder frei", "Kunde unverändert (keine Belastung, keine Nachricht)",
        ...list.filter((t) => Number(t.refund_usd) > 0).map((t) => `Rückforderung ${t.code}: ${num(t.refund_usd)} USD`), note ? `Notiz: ${note}` : ""].filter(Boolean).join(" · ") }).catch(() => {});
  }
  // Partner informieren: Push + E-Mail (Englisch, Job-Nummer + Link, ggf. Rückforderung) – je Partner eine Nachricht.
  const byPartner = new Map<string, Row[]>();
  for (const t of done) { const k = `${t.partner_id ?? ""}|${t.test ? 1 : 0}`; if (!byPartner.has(k)) byPartner.set(k, []); byPartner.get(k)!.push(t); }
  for (const [k, list] of byPartner) {
    const [pid, test] = k.split("|");
    const n = list.length, custs = [...new Set(list.map((t) => t.customer).filter(Boolean))];
    void notifyPartner(`${test === "1" ? "TEST · " : ""}Review${n > 1 ? "s" : ""} withdrawn`,
      `RapidRemove took back ${list.slice(0, 4).map((t) => t.code).join(", ")}${n > 4 ? ` +${n - 4}` : ""}${custs.length === 1 ? ` (${custs[0]})` : ""}. No need to work on ${n > 1 ? "them" : "it"} – thank you!`,
      undefined, test === "1", pid ? [Number(pid)] : null);
    const sent = await partnerJobsMail("withdrawn", list.map((t) => ({ code: t.code, customer: t.customer, url: t.long_url || t.url, refundUsd: Number(t.refund_usd) || 0 })), test === "1", pid ? Number(pid) : null);
    for (const oid of [...new Set(list.map((t) => t.order_id).filter(Boolean))] as string[]) {
      await insertEvent({ orderId: oid, type: "mail", title: sent.length ? "Partner-Mail: Job(s) entzogen" : "Partner-Mail: Job(s) entzogen – NICHT gesendet (keine Adresse/Versand fehlgeschlagen)", detail: sent.length ? `an ${sent.join(", ")} · ${list.filter((t) => t.order_id === oid).map((t) => t.code).join(", ")}` : "", auto: true }).catch(() => {});
    }
  }
  return { done, skipped };
}

/** Bewertungen einem Partner zuweisen: entzogene (Gegenstück zu withdrawTasks) und noch nie übergebene.
 *  Gleicher Partner → dieselbe Aufgabe (gleiche RV-Nummer, gleicher Preis) wird wieder aktiv („new").
 *  Anderer Partner → neue Aufgabe für diesen Partner (seine Preise); die alte bleibt beim alten Partner unter „Cancelled".
 *  keys = ursprüngliche Bewertungs-Schlüssel; ohne keys: alle entzogenen, freien Bewertungen des Auftrags. */
export async function assignWithdrawn(orderId: string, keysIn: string[] | null, partnerId: number): Promise<{ done: Row[]; skipped: { key: string; code: string | null; why: string }[]; error?: string }> {
  const done: Row[] = []; const skipped: { key: string; code: string | null; why: string }[] = [];
  if (!pool) return { done, skipped, error: "keine Datenbank" };
  const pr = (await pool.query(`SELECT id, name FROM partners WHERE id=$1 AND active AND COALESCE(status,'active')='active'`, [partnerId]).catch(() => ({ rows: [] as { id: string; name: string }[] }))).rows[0];
  if (!pr) return { done, skipped, error: "Partner nicht aktiv" };
  const o = (await pool.query(`SELECT id, status, profile, company, name, raw FROM orders WHERE id=$1`, [orderId])).rows[0] as { id: string; status: string | null; profile: string | null; company: string | null; name: string | null; raw: Record<string, unknown> | null } | undefined;
  if (!o) return { done, skipped, error: "Auftrag nicht gefunden" };
  if (o.status === "storniert") return { done, skipped, error: "Auftrag ist storniert" };
  const tasks = (await pool.query(`SELECT * FROM partner_tasks WHERE order_id=$1 ORDER BY id`, [orderId])).rows as Row[];
  const active = new Set(tasks.filter((t) => t.status !== "cancelled").map((t) => t.item_key));
  const lastW = new Map<string, Row>(); // je Bewertung die zuletzt entzogene Aufgabe
  for (const t of tasks) if (t.withdrawn_at && t.orig_item_key) { const c = lastW.get(t.orig_item_key); if (!c || String(t.withdrawn_at) > String(c.withdrawn_at)) lastW.set(t.orig_item_key, t); }
  const items = (Array.isArray(o.raw?.reviewItems) ? o.raw!.reviewItems : []) as Record<string, unknown>[];
  const keyOfIt = (it: Record<string, unknown>) => String(it.url || "") || `${it.name || ""}|${it.text || ""}`;
  // Ohne keys: alle Bewertungen ohne aktive Partner-Aufgabe – entzogene und (z. B. bei ausgeschalteter Weiterleitung) nie übergebene;
  // vom Admin abgelehnte (nicht in reviewsAccepted) nur, wenn ausdrücklich gewählt.
  const accepted = Array.isArray(o.raw?.reviewsAccepted) ? new Set((o.raw!.reviewsAccepted as Record<string, unknown>[]).map(keyOfIt)) : null;
  const keys = keysIn && keysIn.length ? [...new Set(keysIn)]
    : [...new Set([...lastW.keys(), ...items.map(keyOfIt).filter((k) => !accepted || accepted.has(k))])].filter((k) => !active.has(k));
  const customer = clip(o.profile || o.company || o.name, 160) || null;
  const reactivated: Row[] = []; const refundCancelled: Row[] = [];
  for (const k of keys) {
    const w = lastW.get(k) || null;
    if (active.has(k)) { skipped.push({ key: k, code: w?.code || null, why: "liegt schon beim Partner" }); continue; }
    if (!w) {
      // Noch nie beim Partner (Weiterleitung aus / manuell) → neue Aufgabe aus der Bestellung (Mail „New order"/„Review added").
      const it = items.find((x) => keyOfIt(x) === k);
      if (!it) { skipped.push({ key: k, code: null, why: "Bewertung nicht im Auftrag" }); continue; }
      const rows = await insertPartnerTasks(orderId, customer, [it], partnerId);
      if (!rows[0] || rows[0].status === "cancelled") { skipped.push({ key: k, code: null, why: "konnte nicht angelegt werden" }); continue; }
      done.push(rows[0]); active.add(k);
      continue;
    }
    if (w.partner_id && Number(w.partner_id) === partnerId) {
      // Gleicher Partner: dieselbe Aufgabe wieder aktiv (Schlüssel zurück, Status „new"). Offene Rückforderung entfällt
      // (er hat das Geld schon und arbeitet den Job jetzt wieder; eine bezahlte Aufgabe wird nicht nochmal ausgezahlt).
      const openRefund = Number(w.refund_usd) > 0 && !w.refund_settled_at;
      const r = await pool.query(
        `UPDATE partner_tasks SET status='new', item_key=orig_item_key, withdrawn_at=NULL, working_since=NULL, updated_at=now(),
           refund_usd = CASE WHEN refund_settled_at IS NULL THEN NULL ELSE refund_usd END,
           admin_note = concat_ws(' · ', NULLIF(trim(COALESCE(admin_note,'')), ''), 'Wieder dem Partner zugewiesen ' || to_char(now() AT TIME ZONE 'Europe/Vienna', 'DD.MM.YYYY HH24:MI')
             || CASE WHEN $2::boolean THEN ' (Rückforderung aufgehoben)' ELSE '' END)
         WHERE id=$1 AND status='cancelled' AND withdrawn_at IS NOT NULL RETURNING *`, [w.id, openRefund],
      ).catch(() => ({ rows: [] as Row[] }));
      if (!r.rows[0]) { skipped.push({ key: k, code: w.code, why: "inzwischen geändert – neu laden" }); continue; }
      if (openRefund) refundCancelled.push(w);
      reactivated.push(r.rows[0] as Row); done.push(r.rows[0] as Row); active.add(k);
      continue;
    }
    // Anderer Partner: neue Aufgabe aus der Bestellung (Preis/Verfahren wie bei der normalen Übergabe).
    const it = items.find((x) => keyOfIt(x) === k) || { url: w.url, name: w.name, text: w.text, kind: w.kind === "profile" ? "profile" : undefined, nt: w.kind === "nt", old: w.kind === "old" };
    const rows = await insertPartnerTasks(orderId, customer, [it], partnerId);
    if (!rows[0] || rows[0].status === "cancelled") { skipped.push({ key: k, code: w.code, why: "konnte nicht angelegt werden" }); continue; }
    done.push(rows[0]); active.add(k);
  }
  if (!done.length) return { done, skipped };
  bumpChange();
  await insertEvent({ orderId, type: "note", title: `Dem Partner zugewiesen (${pr.name}): ${done.map((t) => t.code).join(", ")}`,
    detail: [reactivated.length ? `${reactivated.length} wieder aktiv (gleiche Nummer)` : "", done.length - reactivated.length ? `${done.length - reactivated.length} neu angelegt` : ""].filter(Boolean).join(" · ") }).catch(() => {});
  if (reactivated.length) {
    const test = !!reactivated[0].test, n = reactivated.length;
    void notifyPartner(`${test ? "TEST · " : ""}Review${n > 1 ? "s" : ""} back on your board`,
      `RapidRemove assigned ${reactivated.slice(0, 4).map((t) => t.code).join(", ")}${n > 4 ? ` +${n - 4}` : ""}${customer ? ` (${customer})` : ""} to you again.`, undefined, test, [partnerId]);
    // E-Mail: „A review that was withdrawn earlier has been assigned to you again" (Job-Nummer + Link). Anderer Partner: normale „Review added"-Mail (insertPartnerTasks).
    const sent = await partnerJobsMail("reassigned", reactivated.map((t) => ({ code: t.code, customer: t.customer, url: t.long_url || t.url })), test, partnerId,
      { refundCancelled: refundCancelled.map((t) => ({ code: t.code, customer: t.customer, url: t.url, refundUsd: num(t.refund_usd) })) });
    await insertEvent({ orderId, type: "mail", title: sent.length ? "Partner-Mail: Job(s) wieder zugewiesen" : "Partner-Mail: Job(s) wieder zugewiesen – NICHT gesendet (keine Adresse/Versand fehlgeschlagen)", detail: sent.length ? `an ${sent.join(", ")} · ${reactivated.map((t) => t.code).join(", ")}` : "", auto: true }).catch(() => {});
  }
  return { done, skipped };
}

/** Sofort-Push an den Kunden (Sprache + Bewertungsname aus der Bestellung). */
/** Preismodell 2: gehört die Aufgabe zu einer 250er-Bewertung (Software im Preis enthalten)? */
async function isCovered250(orderId: string, itemKey: string | null): Promise<boolean> {
  if (!pool || !itemKey) return false;
  const r = await pool.query(`SELECT raw->'reviewItems' AS items FROM orders WHERE id=$1 AND service='reviews'`, [orderId]).catch(() => ({ rows: [] as { items: unknown }[] }));
  const items = (Array.isArray(r.rows[0]?.items) ? r.rows[0].items : []) as Record<string, unknown>[];
  const it = items.find((x) => (String(x.url || "") || `${x.name || ""}|${x.text || ""}`) === itemKey);
  return !!it && lpOf(it as { lp?: unknown }) === PRICE_V2_OTHER;
}

async function pushCustomerNow(row: Row, from: string, to: string): Promise<void> {
  if (!pool || !row.order_id) return;
  const o = await pool.query(`SELECT email, lang FROM orders WHERE id=$1 AND service='reviews'`, [row.order_id]);
  const email = o.rows[0]?.email;
  if (!email) return;
  // Software bestätigt, Kunde hat Zahlungsart hinterlegt → wird ohne Vorauszahlung gestartet: kein „bitte zahlen"-Push.
  if (to === "software" && autopayHooks.saved && await autopayHooks.saved(email).catch(() => false)) return; // startet sofort (keine Kunden-Bestätigung mehr)
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
    const pidIn = Number(b.partnerId);
    const created = (await insertPartnerTasks(orderId, customer, items, Number.isInteger(pidIn) && pidIn > 0 ? pidIn : null)).map(adminView);
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
    fillLongUrls(rows);
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

  // Admin: Aufgaben vom Partner zurückziehen – einzelne (ids) oder alle offenen eines Auftrags (orderId). Siehe withdrawTasks.
  app.post("/admin/partner/withdraw", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const orderId = clip(b.orderId, 40);
    let ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
    if (!ids.length && orderId) {
      const r = await pool.query(`SELECT id FROM partner_tasks WHERE order_id=$1 AND status = ANY($2::text[]) AND paid_at IS NULL AND payout_id IS NULL ORDER BY id`, [orderId, [...WITHDRAWABLE]]);
      ids = r.rows.map((x) => Number(x.id));
    }
    if (!ids.length) return reply.code(400).send({ ok: false, error: "nichts offen beim Partner" });
    const x = await withdrawTasks(ids, b.note, b.refunds);
    return { ok: true, withdrawn: x.done.map(adminView), skipped: x.skipped };
  });

  // Admin: Rückforderung als erstattet markieren (Partner hat das Geld zurückgezahlt) → Job gilt als nicht bezahlt.
  app.post("/admin/partner/refund-settled", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const id = Number(b.id);
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id fehlt" });
    const r = await pool.query(
      `UPDATE partner_tasks SET refund_settled_at=now(), paid_at=NULL, payout_id=NULL, updated_at=now(),
         admin_note = concat_ws(' · ', NULLIF(trim(COALESCE(admin_note,'')), ''), 'Rückforderung ' || refund_usd::text || ' USD erstattet ' || to_char(now() AT TIME ZONE 'Europe/Vienna', 'DD.MM.YYYY'))
       WHERE id=$1 AND refund_usd > 0 AND refund_settled_at IS NULL RETURNING *`, [id]);
    const t = r.rows[0] as Row | undefined;
    if (!t) return reply.code(404).send({ ok: false, error: "keine offene Rückforderung" });
    bumpChange();
    if (t.order_id) await insertEvent({ orderId: t.order_id, type: "note", title: `Rückforderung erstattet: ${t.code} (${num(t.refund_usd)} USD)`, detail: "Vom Admin als erstattet markiert" }).catch(() => {});
    void notifyPartner(`${t.test ? "TEST · " : ""}Refund received`, `${t.code} · ${num(t.refund_usd)} USD – thank you!`, undefined, !!t.test, t.partner_id ? [Number(t.partner_id)] : null);
    return { ok: true, task: adminView(t) };
  });

  // Admin: entzogene Bewertungen wieder einem Partner zuweisen ({ orderId, partnerId, keys? }). Siehe assignWithdrawn.
  app.post("/admin/partner/assign", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const orderId = clip(b.orderId, 40);
    const pid = Number(b.partnerId);
    if (!orderId || !Number.isInteger(pid) || pid <= 0) return reply.code(400).send({ ok: false, error: "orderId/partnerId fehlt" });
    const keys = Array.isArray(b.keys) ? b.keys.map((k) => String(k || "").slice(0, 800)).filter(Boolean).slice(0, 500) : null;
    const x = await assignWithdrawn(orderId, keys, pid);
    if (x.error) return reply.code(400).send({ ok: false, error: x.error });
    if (!x.done.length) return reply.code(400).send({ ok: false, error: x.skipped[0]?.why || "nichts zuzuweisen", skipped: x.skipped });
    return { ok: true, assigned: x.done.map(adminView), skipped: x.skipped };
  });

  // Admin: gelöschte, unbezahlte Aufgaben als bezahlt markieren (Sammelposten).
  app.post("/admin/partner/pay", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
    if (!ids.length) return reply.code(400).send({ ok: false, error: "keine Aufgaben gewählt" });
    // Sammelposten + Gutschrift (wenn der Partner dem Gutschriftverfahren zugestimmt hat) → PDF per Mail an den Partner.
    const x = await recordManualPayout(ids, clip(b.note, 200) || null, "admin");
    if (!x) return reply.code(400).send({ ok: false, error: "keine offenen gelöschten Aufgaben unter der Auswahl" });
    return { ok: true, payoutId: x.payoutId, amount: x.amount, tasks: x.tasks, gs: x.gs };
  });

  // Admin → Einstellungen: automatische Weiterleitung an den Partner (Bewertungen / Profile).
  app.post("/admin/partner/settings", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    for (const k of ["reviews", "profiles"] as AutoKind[]) {
      const key = "auto" + k[0].toUpperCase() + k.slice(1);
      if (typeof b[key] === "boolean") await setSetting("auto_" + k, b[key] ? "1" : "0");
      const dkey = "disc" + k[0].toUpperCase() + k.slice(1);
      if (typeof b[dkey] === "boolean") await setSetting("disc_" + k, b[dkey] ? "1" : "0");
    }
    return { ok: true, autoReviews: await partnerAutoEnabled("reviews"), autoProfiles: await partnerAutoEnabled("profiles"), discReviews: await payDiscountEnabled("reviews"), discProfiles: await payDiscountEnabled("profiles") };
  });

  // Öffentlich (Website/Chat-Checkout): Ist PayPal/Wise −10 % je Kategorie gerade an?
  app.get("/pay-discount", async (_req, reply) => {
    reply.header("Cache-Control", "public, max-age=60");
    return { ok: true, reviews: await payDiscountEnabled("reviews").catch(() => true), profiles: await payDiscountEnabled("profiles").catch(() => true) };
  });

  // Admin → Partner: Liste, Anlegen, Freigabe, Leistungen, Zuteilung – siehe partnerRegistry.ts.
  registerPartnerRegistry(app, adminToken);

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
    // Jeder Partner sieht nur SEINE Aufgaben; Bewerbung noch offen / abgelehnt → kein Board.
    const pid = preview ? null : await partnerIdOf(b.t);
    const pst = preview ? "active" : await partnerStatus(pid);
    if (pst === "pending" || pst === "rejected") return { ok: true, gate: pst, preview: false, tasks: [], totals: totals([]), payouts: [] };
    // Neuer Partner (Stripe-Land): erst Auszahlung einrichten (Stripe Connect), dann Aufträge.
    if (!preview && (await payoutSetupMissing(pid))) return { ok: true, gate: "payout", preview: false, tasks: [], totals: totals([]), payouts: [] };
    // Stornierte der letzten 30 Tage mitschicken → Partner sieht sie unter „Cancelled" (nicht mehr in der Arbeit).
    // Offene Rückforderungen (entzogene, schon bezahlte Jobs) bleiben sichtbar, bis sie erledigt sind.
    const rows = preview ? await listTasks("WHERE (status <> 'cancelled' OR updated_at > now() - interval '30 days' OR (refund_usd > 0 AND refund_settled_at IS NULL)) AND test")
      : await listTasks("WHERE (status <> 'cancelled' OR updated_at > now() - interval '30 days' OR (refund_usd > 0 AND refund_settled_at IS NULL)) AND NOT test AND partner_id = $1", [pid]);
    const p = preview ? { rows: [] as Record<string, unknown>[] } : pool ? await pool.query(`SELECT id, amount_usd, tasks, note, created_at FROM partner_payouts WHERE partner_id = $1 OR (partner_id IS NULL AND $1 = (SELECT min(id) FROM partners)) ORDER BY id DESC LIMIT 20`, [pid]) : { rows: [] as Record<string, unknown>[] };
    // Screenshot der Bewertung (automatisch bei der Bestellung aufgenommen) → Vorschau statt nur Link.
    const shots = new Map<string, number>();
    const oids = [...new Set(rows.map((r) => r.order_id).filter(Boolean))];
    if (pool && oids.length) {
      const sr = await pool.query(`SELECT DISTINCT ON (order_id, url) id, order_id, url FROM review_shots WHERE status='ok' AND order_id = ANY($1::text[]) ORDER BY order_id, url, id DESC`, [oids]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
      for (const x of sr.rows as { id: number; order_id: string; url: string }[]) shots.set(`${x.order_id}|${x.url}`, Number(x.id));
    }
    // Pausierte Aufträge (Zwischenzahlung offen) → Partner sieht „On hold".
    const held = new Set<string>();
    if (pool && oids.length) {
      const hr = await pool.query(`SELECT id FROM orders WHERE id = ANY($1::text[]) AND (jsonb_typeof(raw->'payHold')='object' OR jsonb_typeof(raw->'priceHold')='object')`, [oids]).catch(() => ({ rows: [] as { id: string }[] }));
      for (const x of hr.rows as { id: string }[]) held.add(x.id);
    }
    // Grund des Kunden je Bewertung (Richtlinien-Verstoß, im Dashboard angegeben) → Partner meldet damit.
    const custR = await customerReasons(oids as string[]);
    // 15.10.2026: Bulk-Bestellungen als EINE Bestellung am Board + Preistabelle des Partners (welche Stufe gilt).
    const bulk = new Map<string, { label: string; ref: string; n: number; tiers: { from: number; price: number }[] | null; sw: number | null; idx: number; price: number | null }>();
    if (pool && oids.length) {
      const br = await pool.query(`SELECT id, raw->'pricing' AS pr, jsonb_array_length(CASE WHEN jsonb_typeof(raw->'reviewItems')='array' THEN raw->'reviewItems' ELSE '[]'::jsonb END) AS n,
          (SELECT count(*) FROM jsonb_object_keys(CASE WHEN jsonb_typeof(raw->'bulkSw')='object' THEN raw->'bulkSw' ELSE '{}'::jsonb END))::int AS gone
        FROM orders WHERE id = ANY($1::text[]) AND (raw->>'bulk')='true'`, [oids]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
      for (const x of br.rows as { id: string; pr: Record<string, unknown> | null; n: number; gone: number }[]) {
        const pr = x.pr || {};
        const n = Math.max(0, Number(x.n || 0) - Number(x.gone || 0));
        const tiers = normTiers(pr.partnerTiers);
        const t = tiers ? tierFor(tiers, n) : null;
        const ref = "B-" + String(x.id).replace(/^RR-/, "");
        bulk.set(x.id, { label: `Bulk order ${ref} · ${Number(x.n || 0)} reviews`, ref, n, tiers, sw: Number(pr.partnerSw) > 0 ? Number(pr.partnerSw) : null, idx: t ? t.idx : -1, price: t ? t.price : null });
      }
    }
    fillLongUrls(rows);
    return { ok: true, preview, paused: pst === "paused", reasons: REPORT_REASONS.map((x) => ({ id: x.id, label: x.en })), bulks: Object.fromEntries([...bulk.values()].map((v) => [v.label, v])),
      tasks: rows.map((r) => ({ ...partnerView(r), ...(r.order_id && bulk.has(r.order_id as string) ? { customer: bulk.get(r.order_id as string)!.label, profile: r.customer || "", bulk: bulk.get(r.order_id as string)!.ref } : {}), ...(custR.get(`${r.order_id}|${r.item_key}`) || {}), hold: !!(r.order_id && held.has(r.order_id as string) && (r.status === "new" || r.status === "working")), shot: r.order_id && r.url ? shots.get(`${r.order_id}|${r.url}`) || null : null })), totals: totals(rows), payouts: p.rows.map((x) => ({ id: Number(x.id), amount: num(x.amount_usd), tasks: x.tasks, created: x.created_at })) };
  });

  // Screenshot einer Bewertung für den Partner (nur wenn er zu einer Aufgabe am Board gehört).
  app.post("/partner/shot", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    const id = Number(b.id);
    if (!pool || !Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id" });
    const spid = (await isPreview(b.t)) ? null : await partnerIdOf(b.t);
    const r = await pool.query(
      `SELECT s.mime, s.img FROM review_shots s JOIN partner_tasks t ON t.order_id = s.order_id AND t.url = s.url
        WHERE s.id=$1 AND s.status='ok' AND t.status <> 'cancelled' AND ($2::bigint IS NULL OR t.partner_id = $2) LIMIT 1`, [id, spid],
    ).catch(() => ({ rows: [] as Record<string, unknown>[] }));
    const row = r.rows[0] as { mime?: string; img?: Buffer } | undefined;
    if (!row || !row.img) return reply.code(404).send({ ok: false, error: "not found" });
    return reply.header("content-type", row.mime || "image/jpeg").header("cache-control", "private, max-age=86400").send(row.img);
  });

  /** Partner-Kontext einer Anfrage: Vorschau (Test-Board) oder eigener Partner; Bewerber/Abgelehnte dürfen nichts ändern. */
  const ctxOf = async (t: unknown): Promise<{ preview: boolean; pid: number | null; blocked: boolean }> => {
    const preview = await isPreview(t);
    if (preview) return { preview, pid: null, blocked: false };
    const pid = await partnerIdOf(t);
    const st = await partnerStatus(pid);
    return { preview, pid, blocked: st === "pending" || st === "rejected" };
  };
  const PARTNER_SETTABLE = ["new", "working", "removed", "not_possible", "software"];
  const LABEL: Record<string, string> = { new: "zurückgesetzt", working: "arbeitet dran", removed: "GELÖSCHT ✓", not_possible: "nicht möglich", software: "nur per Software" };
  // Push-Titel (Uber-Stil: kurz, was passiert ist).
  const PT: Record<string, string> = { new: "Zurückgesetzt", working: "In Arbeit", removed: "Gelöscht ✓", not_possible: "Nicht möglich", software: "Nur per Software" };

  /** Status/Notiz einer Aufgabe durch den Partner setzen (gemeinsam für Einzel- und Sammel-Update). */
  async function partnerApply(id: number, status: string, noteIn: unknown, opts: { quiet?: boolean; preview?: boolean; admin?: boolean; verified?: boolean; confirmed?: boolean; pid?: number | null; via?: string } = {}): Promise<{ row?: Row; changed?: boolean; error?: string; code?: number }> {
    if (!pool) return { error: "unavailable", code: 503 };
    const prev = await pool.query(`SELECT * FROM partner_tasks WHERE id=$1`, [id]);
    const old = prev.rows[0] as Row | undefined;
    if (!old || old.status === "cancelled") return { error: "not found", code: 404 };
    if (opts.preview !== undefined && !!old.test !== opts.preview) return { error: "not found", code: 404 }; // Test ↔ echt strikt getrennt
    if (!opts.admin && !opts.preview && opts.pid && old.partner_id && Number(old.partner_id) !== opts.pid) return { error: "not found", code: 404 }; // nur eigene Aufgaben
    // Bezahlte Löschung nicht mehr ändern. (Wieder zugewiesener, schon bezahlter Job – z. B. Vorauszahlung – darf bearbeitet werden; wird nicht nochmal ausgezahlt.)
    if (old.paid_at && old.status === "removed" && status && status !== "removed") return { error: "already paid", code: 400 };
    // Software-Fall (Partner-Regel): erst „Software deletion confirmed" → Kunde zahlt → dann starten. Vorher kein Working/Removed.
    const swPaid = swStartAllowed(old.admin_note); // bezahlt, freigegeben (zahlt bei Erfolg) oder im 250er-Preis enthalten
    if (!opts.admin && old.method === "sw" && !swPaid && (status === "working" || status === "removed")) return { error: "confirm software first – start after customer paid", code: 400 };
    // Zwischenzahlung offen (Auftrag pausiert): nichts Neues starten, bis der Kunde bezahlt hat.
    if (!opts.admin && status === "working" && old.status === "new" && old.order_id) {
      const h = await pool.query(`SELECT jsonb_typeof(raw->'payHold')='object' AS h, jsonb_typeof(raw->'priceHold')='object' AS ph FROM orders WHERE id=$1`, [old.order_id]).catch(() => ({ rows: [] as { h: boolean; ph: boolean }[] }));
      if (h.rows[0]?.h) return { error: "order on hold – wait until “Customer paid”", code: 400 };
      if (h.rows[0]?.ph) return { error: "order on hold – customer has to confirm a price change first", code: 400 };
    }
    // „Removed" nur aus „Working" (Partner muss die Bewertung erst als in Arbeit markieren).
    if (status === "removed" && old.status !== "removed" && old.status !== "working") return { error: "set to Working first", code: 400 };
    // „Removed" belastet den Kunden → nur nach Lenas Prüfung (verified) oder ausdrücklicher Bestätigung, wenn keine Prüfung möglich war.
    if (!opts.admin && status === "removed" && old.status !== "removed" && !opts.verified) return { error: "verify", code: 409 }; // ohne Prüfung KEIN „removed" (auch nicht mit Bestätigung)
    const note = noteIn != null ? clip(noteIn, 500) : old.partner_note;
    // Bulk-Upload (14.10.2026): Software-Fall ist nicht Teil der Pauschale → sofort aus der Bulk-Bestellung storniert,
    // Kunde soll sie einzeln (regulärer Preis) beauftragen. Nur für Bulk – sonst normales Software-Verfahren.
    const bulkSw = status === "software" && old.status !== "software" && !old.paid_at && await isBulkOrder(old.order_id as string | null);
    const st = bulkSw ? "cancelled" : status || old.status;
    const r = await pool.query(
      `UPDATE partner_tasks SET status=$1, partner_note=$2, updated_at=now(), touched_at=COALESCE(touched_at, now()),
         working_since = CASE WHEN $1='working' AND status<>'working' THEN now() ELSE working_since END,
         removed_at = CASE WHEN $1='removed' THEN COALESCE(removed_at, now()) ELSE NULL END
       WHERE id=$3 AND status=$4 RETURNING *`,
      [st, note || null, id, old.status],
    );
    // 14.10.2026: nur ändern, wenn der Status seit dem Lesen gleich geblieben ist – zwei gleichzeitige „Removed"
    // (Scan + Klick, Doppelklick) dürfen den Kunden nie doppelt auslösen.
    if (!r.rows.length) return { error: "changed meanwhile – reload", code: 409 };
    let row = r.rows[0] as Row;
    const changed = !!status && status !== old.status;
    if (bulkSw) {
      const u = await pool.query(`UPDATE partner_tasks SET admin_note = trim(COALESCE(admin_note,'') || ' ' || $2) WHERE id=$1 RETURNING *`, [id, BULK_SW_NOTE]).catch(() => ({ rows: [] as Row[] }));
      if (u.rows[0]) row = u.rows[0] as Row;
      bumpChange();
      if (row.order_id) await bulkSoftwareCancelled(row.order_id, row.item_key as string, row.code, (row.name as string) || (row.url as string) || null).catch((e) => app.log.error({ err: e }, "Bulk: Software-Storno fehlgeschlagen"));
      if (row.order_id) await insertEvent({ orderId: row.order_id, type: "note", title: `Partner: ${row.code} nur per Software → storniert (Bulk)`, detail: [row.url || row.name, note].filter(Boolean).join(" · ") }).catch(() => {});
      return { row, changed: true };
    }
    // Normale Bewertung wird zum Software-Fall → Partner-Software-Preis des Kunden (Admin → Kunden & Preise), falls festgelegt.
    if (changed && status === "software" && !row.paid_at && Number((row as Record<string, unknown>).sw_price_usd) > Number(row.price_usd || 0)) {
      const u = await pool.query(`UPDATE partner_tasks SET price_usd=sw_price_usd WHERE id=$1 AND paid_at IS NULL RETURNING *`, [id]).catch(() => ({ rows: [] as Row[] }));
      if (u.rows[0]) row = u.rows[0] as Row;
    }
    // Preismodell 2: „Software only" bei einer 250er-Bewertung → sofort freigegeben (im Preis enthalten), Kunde merkt nichts.
    if (changed && status === "software" && row.order_id && await isCovered250(row.order_id, row.item_key)) {
      await partnerStatusChanged(row.order_id, row.item_key, status, { prev: old.status }).catch((e) => app.log.error({ err: e }, "250er-Software-Freigabe fehlgeschlagen"));
      const re = await pool.query(`SELECT * FROM partner_tasks WHERE id=$1`, [id]).catch(() => ({ rows: [] as Row[] }));
      if (re.rows[0]) row = re.rows[0] as Row;
      bumpChange();
      await insertEvent({ orderId: row.order_id || undefined, type: "note", title: `Partner: ${row.code} nur per Software → freigegeben (250er)`, detail: [row.url || row.name, note].filter(Boolean).join(" · ") }).catch(() => {});
      if (!opts.quiet) void notifyTeam(`${row.test ? "TEST · " : ""}Software (250er, freigegeben) · ${row.customer || row.code}`, ["Partner", row.code, row.order_id ? `Auftrag ${row.order_id}` : ""].filter(Boolean).join(" · "), rvLink([row]), { kind: "partner" });
      return { row, changed: true };
    }
    bumpChange(); // Live-Aktualisierung (Admin/Kunde/Partner)
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
      await insertEvent({ orderId: row.order_id, type: "note", title: `Partner: ${row.code} ${LABEL[status] || status}${status === "removed" && opts.verified ? (opts.via ? ` (${opts.via})` : opts.admin ? " (vom Team bestätigt)" : " (von Lena geprüft)") : status === "removed" && opts.confirmed ? " (OHNE Prüfung bestätigt)" : ""}`, detail: [row.url || row.name, status === "removed" && row.report_reason ? `Meldegrund: ${reportDe(row.report_reason)}${row.report_note ? ` („${row.report_note}")` : ""}` : "", note].filter(Boolean).join(" · ") }).catch(() => {});
      if (status === "removed" && opts.confirmed && !opts.verified) void notifyTeam(`${row.test ? "TEST · " : ""}Gelöscht ohne Prüfung · ${row.code}`, `Partner hat bestätigt, Lena konnte nicht prüfen · bitte kurz kontrollieren · ${row.customer || ""}`, rvLink([row]), { kind: "partner" });
    }
    // Push bei JEDER Statusänderung des Partners (Working, Software, Removed, Impossible, zurückgesetzt).
    if (changed && !opts.quiet) {
      void notifyTeam(`${row.test ? "TEST · " : ""}${PT[status] || status} · ${row.customer || row.code}`, ["Partner", row.code, row.order_id ? `Auftrag ${row.order_id}` : "", note || ""].filter(Boolean).join(" · "), rvLink([row]), { kind: "partner" });
    }
    return { row, changed };
  }

  // Admin: Bewertung als gelöscht bestätigen (übersteuert Lenas Prüfung, z. B. Liste hinkt Google hinterher).
  // Läuft wie beim Partner (Kunden-Dashboard, Abrechnung, Verlauf) – nur ohne Prüf-Pflicht.
  app.post("/admin/partner/confirm-removed", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const id = Number(b.id);
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send({ ok: false, error: "id fehlt" });
    const cur = (await pool.query(`SELECT status FROM partner_tasks WHERE id=$1`, [id])).rows[0] as { status?: string } | undefined;
    if (!cur || cur.status === "cancelled") return reply.code(404).send({ ok: false, error: "nicht gefunden" });
    if (cur.status === "removed") return { ok: true, already: true };
    if (cur.status !== "working") { const w = await partnerApply(id, "working", null, { quiet: true, admin: true }); if (w.error) return reply.code(w.code || 400).send({ ok: false, error: w.error }); }
    const r = await partnerApply(id, "removed", null, { quiet: true, admin: true, verified: true });
    if (r.error || !r.row) return reply.code(r.code || 400).send({ ok: false, error: r.error || "fehlgeschlagen" });
    if (r.row.order_id) await insertEvent({ orderId: r.row.order_id, type: "note", title: `Admin: ${r.row.code} als gelöscht bestätigt`, detail: "Lena-Prüfung übersteuert – vom Team auf Google kontrolliert" }).catch(() => {});
    return { ok: true, task: adminView(r.row) };
  });

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
    const cx = await ctxOf(b.t);
    if (cx.blocked) return reply.code(403).send({ ok: false, error: "account not approved yet" });
    if (status === "removed" && b.reasons && pool) await saveReportReasons((await pool.query(`SELECT id, report_reason FROM partner_tasks WHERE id=$1 AND ($2::bigint IS NULL OR partner_id IS NULL OR partner_id=$2)`, [id, cx.pid || null])).rows, b.reasons);
    const r = await partnerApply(id, status, b.note, { preview: cx.preview, pid: cx.pid, confirmed: b.confirm === true });
    if (r.error) return reply.code(r.code || 400).send({ ok: false, error: r.error });
    return { ok: true, task: partnerView(r.row as Row) };
  });

  // „Removed" mit Prüfung: Lena öffnet jeden Bewertungs-Link jetzt und vergleicht mit dem Screenshot von der Bestellung.
  // Nur was wirklich weg ist, geht auf „removed" (→ Kunde wird belastet). Max. 3 Prüfungen gleichzeitig.
  app.post("/partner/verify-removed", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const vcx = await ctxOf(b.t);
    if (vcx.blocked) return reply.code(403).send({ ok: false, error: "account not approved yet" });
    const preview = vcx.preview;
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 20);
    if (!ids.length) return reply.code(400).send({ ok: false, error: "no tasks" });
    const rows = (await pool.query(`SELECT id, order_id, url, name, text, rating, status, test, code, partner_id, report_reason FROM partner_tasks WHERE id = ANY($1::bigint[])`, [ids])).rows
      .filter((x) => !!x.test === preview && (preview || !vcx.pid || !x.partner_id || Number(x.partner_id) === vcx.pid));
    // Meldegrund optional (Partner gibt sein Vorgehen nicht preis) – nur speichern, falls mitgeschickt.
    if (b.reasons) await saveReportReasons(rows.filter((x) => x.status === "working"), b.reasons);
    const out: { id: number; code: string; result: string; reason: string; checkId?: number; task?: ReturnType<typeof partnerView>; error?: string }[] = [];
    const queue = [...rows];
    const worker = async () => {
      for (let x = queue.shift(); x; x = queue.shift()) {
        if (x.status !== "working") { out.push({ id: Number(x.id), code: x.code, result: "skipped", reason: x.status === "removed" ? "Already removed." : "Set it to Working first." }); continue; }
        const c = await checkRemoval(x);
        const item: (typeof out)[number] = { id: Number(x.id), code: x.code, ...c };
        if (c.result === "gone") {
          const r = await partnerApply(Number(x.id), "removed", undefined, { quiet: true, preview, verified: true, pid: vcx.pid });
          if (r.row) item.task = partnerView(r.row); else item.error = r.error;
        } else if (x.order_id) {
          await insertEvent({ orderId: x.order_id, type: "note", title: `Lena-Prüfung: ${x.code} ${c.result === "visible" ? "noch sichtbar – nicht als gelöscht übernommen" : "nicht möglich – Status unverändert"}`, detail: [c.reason, (c as { why?: string }).why].filter(Boolean).join(" · "), auto: true }).catch(() => {});
          if (c.result === "unknown") void notifyTeam(`${preview ? "TEST · " : ""}Lena-Prüfung nicht möglich · ${x.code}`, String((c as { why?: string }).why || c.reason).slice(0, 180), rvLink([x]), { kind: "partner" });
        }
        delete (item as { why?: string }).why; // interner Grund nicht an den Partner
        out.push(item);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    const gone = out.filter((x) => x.result === "gone");
    if (gone.length) void notifyTeam(`${preview ? "TEST · " : ""}Gelöscht ✓ (geprüft) · ${gone.length}`, "Partner · " + gone.map((x) => x.code).join(", "), rvLink(gone.map((g) => ({ code: g.code, order_id: (rows.find((x) => Number(x.id) === g.id) || {}).order_id }))), { kind: "partner" });
    return { ok: true, results: out };
  });

  // Auto-Scan einer Bestellung (Partner-Dashboard, Button „Scan all reviews"): jede offene Bewertung wird STRENG geprüft
  // (removalScan.ts – Google-Link UND Bewertungsliste müssen „gelöscht" sagen, plus Nachweis „war online").
  // Nur dann → „removed" (= Kunde wird automatisch belastet). Alles andere bleibt unverändert.
  // Der Browser schafft wenige Prüfungen gleichzeitig → die Seite schickt kleine Pakete nacheinander (Fortschritt).
  const scanBusy = new Set<number>(); // Aufgaben, die gerade gescannt werden (Doppelklick / zwei Geräte)
  const scanRuns = new Map<string, { at: number; pid: number | null; preview: boolean; cust: string; gone: string[]; unk: string[]; vis: string[]; order_id: string | null }>();
  app.post("/partner/scan-order", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const cx = await ctxOf(b.t);
    if (cx.blocked) return reply.code(403).send({ ok: false, error: "account not approved yet" });
    const preview = cx.preview;
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 3);
    const runId = clip(b.run, 40);
    const rows = ids.length ? (await pool.query(`SELECT id, order_id, url, name, text, rating, status, test, code, customer, partner_id, paid_at FROM partner_tasks WHERE id = ANY($1::bigint[]) ORDER BY id`, [ids])).rows
      .filter((x) => !!x.test === preview && (preview || !cx.pid || !x.partner_id || Number(x.partner_id) === cx.pid)) : [];
    const run = runId ? (scanRuns.get(runId) || { at: Date.now(), pid: cx.pid, preview, cust: String(rows[0]?.customer || ""), gone: [], unk: [], vis: [], order_id: (rows[0]?.order_id as string) || null }) : null;
    if (run && runId) scanRuns.set(runId, run);
    for (const [k, v] of scanRuns) if (Date.now() - v.at > 3600_000) scanRuns.delete(k);
    type Out = { id: number; code: string; result: string; reason: string; task?: ReturnType<typeof partnerView> };
    const out: Out[] = [];
    const queue = [...rows];
    const worker = async () => {
      for (let x = queue.shift(); x; x = queue.shift()) {
        const id = Number(x.id);
        if (x.paid_at || !["new", "working"].includes(String(x.status))) { out.push({ id, code: x.code, result: "skipped", reason: x.status === "removed" ? "Already removed." : "Not open." }); continue; }
        if (scanBusy.has(id)) { out.push({ id, code: x.code, result: "skipped", reason: "Already being checked." }); continue; }
        scanBusy.add(id);
        try {
          const d = await checkRemovalStrict(x as Parameters<typeof checkRemovalStrict>[0]);
          const item: Out = { id, code: x.code, result: d.result, reason: d.reason };
          if (d.result === "gone") {
            // „Removed" geht nur aus „Working" → bei „Not started" erst auf Working (blockiert bei Pause/Software ohne Freigabe).
            let err = "";
            if (x.status === "new") { const w = await partnerApply(id, "working", undefined, { quiet: true, preview, pid: cx.pid }); if (w.error) err = w.error; }
            if (!err) {
              const r = await partnerApply(id, "removed", undefined, { quiet: true, preview, verified: true, pid: cx.pid, via: "Auto-Scan · Google-Link + Bewertungsliste" });
              if (r.row) item.task = partnerView(r.row); else err = r.error || "failed";
            }
            if (err) { item.result = "unknown"; item.reason = err.includes("hold") ? "The order is paused until the customer pays – nothing was changed." : err.includes("software") ? "Software case – waiting for the customer, nothing was changed." : "Could not be saved – nothing was changed."; }
          }
          if (item.result !== "gone" && x.order_id) await insertEvent({ orderId: x.order_id, type: "note", title: `Auto-Scan: ${x.code} ${item.result === "visible" ? "noch sichtbar" : "nicht eindeutig – unverändert"}`, detail: d.why, auto: true }).catch(() => {});
          if (run) (item.result === "gone" ? run.gone : item.result === "visible" ? run.vis : run.unk).push(x.code);
          out.push(item);
        } catch (e) {
          out.push({ id, code: x.code, result: "unknown", reason: "The check failed – nothing was changed." });
          if (run) run.unk.push(x.code);
          app.log.error({ err: e, task: id }, "Auto-Scan fehlgeschlagen");
        } finally { scanBusy.delete(id); }
      }
    };
    await Promise.all([worker(), worker()]);
    // Am Ende EINE Team-Nachricht für den ganzen Scan.
    if (run && runId && b.last === true) {
      scanRuns.delete(runId);
      const parts = [run.gone.length ? `${run.gone.length} gelöscht ✓ (verrechnet)` : "", run.vis.length ? `${run.vis.length} noch online` : "", run.unk.length ? `${run.unk.length} unklar – bitte prüfen` : ""].filter(Boolean);
      if (parts.length) void notifyTeam(`${preview ? "TEST · " : ""}Auto-Scan · ${run.cust || "Bestellung"}`, parts.join(" · ") + (run.unk.length ? ` · ${run.unk.slice(0, 10).join(", ")}` : ""), rvLink([...run.gone, ...run.unk].map((code) => ({ code, order_id: run.order_id }))), { kind: "partner" });
    }
    out.sort((a, c) => a.id - c.id);
    return { ok: true, results: out };
  });

  // Aktueller Screenshot einer Prüfung (für „Still visible on Google").
  app.post("/partner/removal-shot", async (req, reply) => {
    const q = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(q.t))) return reply.code(401).send({ ok: false });
    const s = await removalShot(Number(q.id));
    if (!s) return reply.code(404).send({ ok: false });
    reply.header("Content-Type", s.mime).header("Cache-Control", "private, max-age=3600");
    return reply.send(s.img);
  });

  // Admin: Prüfprotokoll einer Aufgabe (Lena) + Screenshot je Prüfung – Nachweis/Fehlersuche.
  app.post("/admin/partner/removal-checks", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false });
    const r = await pool.query(`SELECT id, result, reason, confidence, created_at, (img IS NOT NULL) AS has_img, length(img) AS bytes FROM removal_checks WHERE task_id=$1 ORDER BY id DESC LIMIT 30`, [Number(b.taskId)]).catch(() => ({ rows: [] }));
    return { ok: true, checks: r.rows };
  });
  // Admin-Test: Link im eigenen Browser öffnen (nur lesen, ändert nichts).
  app.post("/admin/partner/link-probe", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false });
    const url = String(b.url || "");
    if (!/^https:\/\/(www\.)?google\.[a-z.]+\/maps\//i.test(url)) return reply.code(400).send({ ok: false, error: "nur Google-Maps-Links" });
    return { ok: true, probe: await probeReviewLink(url, String(b.name || "") || null) };
  });
  app.post("/admin/partner/removal-shot", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false });
    const s = await removalShot(Number(b.id));
    if (!s) return reply.code(404).send({ ok: false });
    reply.header("Content-Type", s.mime).header("Cache-Control", "private, max-age=3600");
    return reply.send(s.img);
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
    const tasks: ReturnType<typeof partnerView>[] = []; const skipped: number[] = []; const changedCodes: string[] = []; const changedPairs: { order_id?: string | null; code?: string | null }[] = [];
    const bcx = await ctxOf(b.t);
    if (bcx.blocked) return reply.code(403).send({ ok: false, error: "account not approved yet" });
    const preview = bcx.preview;
    for (const id of ids) {
      const r = await partnerApply(id, status, undefined, { quiet: true, preview, pid: bcx.pid, confirmed: b.confirm === true });
      if (r.error || !r.row) { skipped.push(id); continue; }
      tasks.push(partnerView(r.row));
      if (r.changed) { changedCodes.push(r.row.code); changedPairs.push({ order_id: r.row.order_id, code: r.row.code }); }
    }
    if (changedCodes.length) {
      void notifyTeam(`${preview ? "TEST · " : ""}${PT[status] || status} · ${changedCodes.length} Bewertungen`, "Partner · " + changedCodes.slice(0, 30).join(", "), rvLink(changedPairs), { kind: "partner" });
    }
    return { ok: true, tasks, skipped };
  });

  // Partner bestätigt den Zahlungseingang (einzeln oder „Mark all paid") → Sammelposten wie im Admin.
  app.post("/partner/mark-paid", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (await isPreview(b.t)) return reply.code(400).send({ ok: false, error: "test mode" });
    const mpid = await partnerIdOf(b.t);
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 1000);
    const r = b.all === true
      ? await pool.query(`SELECT id FROM partner_tasks WHERE status='removed' AND paid_at IS NULL AND payout_id IS NULL AND NOT test AND partner_id=$1`, [mpid])
      : ids.length ? await pool.query(`SELECT id FROM partner_tasks WHERE id = ANY($1::bigint[]) AND status='removed' AND paid_at IS NULL AND payout_id IS NULL AND NOT test AND partner_id=$2`, [ids, mpid]) : { rows: [] as { id: string }[] };
    const x = r.rows.length ? await recordManualPayout(r.rows.map((y) => y.id), "vom Partner als bezahlt bestätigt", "partner", mpid) : null;
    if (!x) return reply.code(400).send({ ok: false, error: "nothing to mark" });
    void notifyTeam(`Auszahlung bestätigt · $${x.amount}`, `Partner · ${x.tasks} Löschungen${x.gs ? " · " + x.gs : ""}`, `${SITE_URL}/admin`, { kind: "payout" });
    return { ok: true, payoutId: x.payoutId, amount: x.amount, tasks: x.tasks, gs: x.gs };
  });

  // Erste Aktion ohne Statuswechsel (Bewertung geöffnet, Link kopiert) → Kunde nicht mehr „NEW".
  app.post("/partner/touch", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!(await checkPartnerToken(b.t))) return reply.code(401).send({ ok: false, error: "invalid link" });
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 500);
    const tpid = (await isPreview(b.t)) ? null : await partnerIdOf(b.t);
    if (ids.length) await pool.query(`UPDATE partner_tasks SET touched_at=COALESCE(touched_at, now()) WHERE id = ANY($1::bigint[]) AND ($2::bigint IS NULL OR partner_id = $2)`, [ids, tpid]);
    return { ok: true };
  });

  // Auszahlungen (Payoneer + Gutschrift) – payouts.ts
  registerPayoutRoutes(app, adminToken, { check: checkPartnerToken, preview: isPreview, email: partnerSessionEmail });
}
