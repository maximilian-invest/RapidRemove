/* Automatisch bezahlen („Zahlungsart hinterlegen", 08.10.2026 – Prototyp im Stripe-Testmodus).
 *
 * Kunde hinterlegt im Dashboard einmal Karte/PayPal/… (Stripe Checkout, mode=setup). Danach wird nach jeder
 * Löschung der offene Betrag sofort abgebucht – mit echter Stripe-Rechnung (Invoice, charge_automatically) –,
 * statt Zahlungsaufforderung, Mahnungen und Zwischenzahlung. Klappt die Abbuchung nicht, läuft alles wie bisher
 * (Zahlungsaufforderung per Mail).
 *
 * Schlüssel:
 *   Test-Konten (isTestEmail)  → STRIPE_TEST_SECRET_KEY (sk_test_… / rk_test_…)
 *   alle anderen               → nur wenn AUTOPAY_LIVE=on, dann STRIPE_SECRET_KEY
 * Damit ist es live für echte Kunden AUS, bis es freigeschaltet wird.
 */
import type { FastifyInstance } from "fastify";
import { pool, insertEvent, setOrderRawField } from "./db";
import { startOrderIfReady } from "./orderStart";
import { isTestEmail } from "./testAccounts";
import { notifyTeam } from "./notify";
import { logCustEvent } from "./custTrack";
import { notifyPartner } from "./partnerNotify";
import { notifyCustomer } from "./custPush";
import { orderProgress, ordersRunning, approvePendingPre, customerSessionInfo, loadCustomerOrders, addOrderPayment, markReviewPaymentPaid, newPayId, autopayHooks, DASH_URL, type PayRef, type AutoCharged } from "./customers";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

type Mode = "test" | "live";
function keyFor(email: string): { key: string; mode: Mode } | null {
  if (isTestEmail(email)) {
    const k = process.env.STRIPE_TEST_SECRET_KEY || "";
    return /^(sk|rk)_test_/.test(k) ? { key: k, mode: "test" } : null;
  }
  if (String(process.env.AUTOPAY_LIVE || "").toLowerCase() !== "on") return null;
  const k = process.env.STRIPE_SECRET_KEY || "";
  return k ? { key: k, mode: "live" } : null;
}
export const autopayAvailable = (email: string) => !!keyFor(email);
/** Hat der Kunde schon eine gültige Zahlungsart hinterlegt (gleicher Modus)? */
export async function hasSavedMethod(email: string): Promise<boolean> {
  const k = keyFor(email); if (!k) return false;
  const r = await rowOf(email).catch(() => null);
  return !!(r && r.pm && r.mode === k.mode);
}
/** Neue Bestellung: Zahlungsart verlangen, bevor der Auftrag startet? (Funktion freigeschaltet + noch keine hinterlegt) */
export async function payGateNeeded(email: string): Promise<boolean> {
  return autopayAvailable(email) && !(await hasSavedMethod(email));
}
/** Zahlungsart ist da → wartende Aufträge freigeben und (falls sonst nichts fehlt) starten. */
async function releasePayGates(email: string, label: string): Promise<number> {
  if (!pool) return 0;
  const r = await pool.query(`SELECT id FROM orders WHERE lower(email)=$1 AND service='reviews' AND raw->'payGate'->>'status'='pending' AND COALESCE(status,'') <> 'storniert'`, [email.toLowerCase()]);
  for (const o of r.rows as { id: string }[]) {
    await setOrderRawField(o.id, "payGate", { status: "ok", at: new Date().toISOString(), label });
    await insertEvent({ orderId: o.id, email, type: "note", title: "Zahlungsart hinterlegt – Auftrag kann starten", detail: label, auto: true }).catch(() => {});
    await startOrderIfReady(o.id).catch(() => 0);
  }
  return r.rows.length;
}

/* ---- Stripe (fetch, form-encoded) ---- */
function form(obj: Record<string, unknown>, prefix = "", out: string[] = []): string[] {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object" && !Array.isArray(v)) form(v as Record<string, unknown>, key, out);
    else if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "object" ? form(x as Record<string, unknown>, `${key}[${i}]`, out) : out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(x))}`)));
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out;
}
class StripeErr extends Error { code?: string; decline?: string; constructor(m: string, code?: string, decline?: string) { super(m); this.code = code; this.decline = decline; } }
const API = () => (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, ""); // Tests: Mock-Server
async function sx<T = any>(key: string, method: "GET" | "POST" | "DELETE", path: string, params: Record<string, unknown> = {}, idem?: string): Promise<T> {
  const body = form(params).join("&");
  const url = `${API()}/v1/${path}${method === "GET" && body ? (path.includes("?") ? "&" : "?") + body : ""}`;
  const headers: Record<string, string> = { Authorization: `Bearer ${key}`, "Stripe-Version": "2024-06-20" };
  if (method === "POST") headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idem && method === "POST") headers["Idempotency-Key"] = idem;
  const res = await fetch(url, { method, headers, body: method === "POST" ? body : undefined });
  const j = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new StripeErr(j?.error?.message || `Stripe ${res.status}`, j?.error?.code, j?.error?.decline_code);
  return j as T;
}

/* ---- Tabelle ---- */
let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_autopay (
    email text PRIMARY KEY, mode text NOT NULL, customer text NOT NULL, pm text, label text, pm_type text,
    last_error text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
  ready = true;
}
type Row = { email: string; mode: Mode; customer: string; pm: string | null; label: string | null; pm_type: string | null; last_error: string | null; updated_at: string };
async function rowOf(email: string): Promise<Row | null> {
  if (!pool) return null;
  await init();
  const r = await pool.query(`SELECT * FROM cust_autopay WHERE email=$1`, [email.toLowerCase()]);
  return (r.rows[0] as Row) || null;
}

function pmLabel(pm: any): string {
  const t = String(pm?.type || "");
  if (t === "card") return `${String(pm.card?.brand || "Karte").replace(/^\w/, (c: string) => c.toUpperCase())} •• ${pm.card?.last4 || ""}`.trim();
  if (t === "paypal") return `PayPal${pm.paypal?.payer_email ? " · " + pm.paypal.payer_email : ""}`;
  if (t === "sepa_debit") return `SEPA •• ${pm.sepa_debit?.last4 || ""}`;
  if (t === "link") return "Link";
  if (t === "us_bank_account") return `${pm.us_bank_account?.bank_name || "Bank"} •• ${pm.us_bank_account?.last4 || ""}`;
  return t || "Zahlungsart";
}

/** Info fürs Dashboard (/cust/me). */
async function info(email: string): Promise<{ available: boolean; test?: boolean; saved: { label: string; mode: Mode; type: string | null; error: string | null } | null }> {
  const k = keyFor(email);
  const r = await rowOf(email).catch(() => null);
  const saved = r && r.pm && k && r.mode === k.mode ? { label: r.label || "", mode: r.mode, type: r.pm_type, error: r.last_error } : null;
  return { available: !!k, test: k?.mode === "test", saved };
}

/* ---- Fehlgeschlagene Abbuchung → Auftrag sofort pausieren ----
 * Partner: „Order on hold" (startet nichts Neues). Kunde: Hinweis in Mail/Dashboard „Zahlungsart aktualisieren".
 * Frei erst, wenn alles bezahlt ist (customers.ts evaluatePayHold, reason=autopay). Wiederholung nach 24 h und 48 h (retryTick). */
async function holdForCard(orderIds: string[], email: string, label: string, msg: string, money: string, test: boolean): Promise<void> {
  if (!pool) return;
  const r = await pool.query(`SELECT id, raw->'payHold' AS h FROM orders WHERE id = ANY($1::text[])`, [orderIds]);
  for (const o of r.rows as { id: string; h: Record<string, unknown> | null }[]) {
    const prog = await orderProgress(o.id).catch(() => null);
    if (!prog || prog.inProgress <= 0) continue; // nichts mehr beim Partner → keine Pause nötig (normale Zahlungsaufforderung reicht)
    if (o.h && o.h.reason === "autopay") { await setOrderRawField(o.id, "payHold", { ...o.h, msg, last: new Date().toISOString() }); continue; } // schon pausiert: Versuche/Zeit behalten
    await setOrderRawField(o.id, "payHold", { at: new Date().toISOString(), amount: prog.due, cur: prog.cur, reason: "autopay", label, msg, tries: 0 });
    const c = (await pool.query(`SELECT code FROM partner_tasks WHERE order_id=$1 AND status IN ('new','working') ORDER BY id`, [o.id]).catch(() => ({ rows: [] as { code: string }[] }))).rows.map((x) => x.code).filter(Boolean);
    await insertEvent({ orderId: o.id, email, type: "pay", title: `Auftrag pausiert – Abbuchung fehlgeschlagen (${money})`, detail: `${prog.inProgress} Bewertung(en) beim Partner pausiert, bis bezahlt ist · neuer Versuch in 24 Std.${c.length ? " · " + c.join(", ") : ""}`, auto: true }).catch(() => {});
    void notifyPartner(`${test ? "TEST · " : ""}Order on hold`, `${c.slice(0, 4).join(", ") || o.id} · customer payment pending – please pause until “Customer paid”.`, undefined, test);
  }
  const lang = String((await pool.query(`SELECT lang FROM orders WHERE id = ANY($1::text[]) LIMIT 1`, [orderIds]).catch(() => ({ rows: [] as { lang?: string }[] }))).rows[0]?.lang || "en").slice(0, 2);
  const pf = PUSH_FAIL[lang] || PUSH_FAIL.en;
  void notifyCustomer(email, pf.t, pf.b, `rrc-apfail`, { url: "/my-reviews" }).catch(() => false);
}
const PUSH_FAIL: Record<string, { t: string; b: string }> = { en: { t: "Payment failed", b: "Please update your payment method – we continue right after." }, de: { t: "Zahlung fehlgeschlagen", b: "Bitte aktualisieren Sie Ihre Zahlungsart – danach geht es sofort weiter." }, es: { t: "Pago fallido", b: "Actualiza tu método de pago y seguimos enseguida." }, fr: { t: "Paiement échoué", b: "Mets à jour ton moyen de paiement – on reprend aussitôt." }, it: { t: "Pagamento non riuscito", b: "Aggiorna il metodo di pagamento: riprendiamo subito dopo." }, nl: { t: "Betaling mislukt", b: "Werk uw betaalmethode bij – daarna gaan we meteen verder." }, pt: { t: "Pagamento falhou", b: "Atualiza o teu método de pagamento – continuamos logo a seguir." }, ja: { t: "お支払いに失敗しました", b: "お支払い方法を更新してください。更新後すぐに再開します。" }, sv: { t: "Betalningen misslyckades", b: "Uppdatera din betalningsmetod – sedan fortsätter vi direkt." }, da: { t: "Betalingen mislykkedes", b: "Opdater din betalingsmetode – så fortsætter vi straks." }, no: { t: "Betalingen mislyktes", b: "Oppdater betalingsmetoden din – så fortsetter vi med en gang." } };

/** Alle 30 Min.: pausierte Aufträge (fehlgeschlagene Abbuchung) nach 24 h bzw. 48 h nochmal abbuchen. Danach normale Mahnungen. */
export async function retryTick(log: (o: unknown, m: string) => void = () => {}): Promise<void> {
  if (!pool) return;
  const r = await pool.query(`SELECT id, lower(email) AS email, raw->'payHold' AS h FROM orders WHERE service='reviews' AND raw->'payHold'->>'reason'='autopay' AND COALESCE(status,'') <> 'storniert'`);
  const done = new Set<string>();
  for (const o of r.rows as { id: string; email: string; h: { at?: string; tries?: number } }[]) {
    const tries = Number(o.h?.tries) || 0;
    if (tries >= 2 || done.has(o.email)) continue;
    if (Date.now() < new Date(String(o.h?.at || 0)).getTime() + (tries + 1) * 24 * 3600e3) continue;
    done.add(o.email);
    for (const x of r.rows as { id: string; email: string; h: Record<string, unknown> }[]) if (x.email === o.email) await setOrderRawField(x.id, "payHold", { ...x.h, tries: tries + 1 });
    const res = await chargeDue(o.email, `Wiederholung ${tries + 1}/2`).catch(() => null);
    log({ email: o.email, try: tries + 1, ok: !!res }, "Automatisch bezahlen: neuer Abbuchungsversuch");
    if (!res && tries + 1 >= 2) void notifyTeam("Abbuchung 3× fehlgeschlagen", `${o.email} · Auftrag ${o.id} bleibt pausiert · Mahnungen laufen normal`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "pay" });
  }
}

/* ---- Abbuchen ---- */
const busy = new Set<string>();
/** Offene Beträge (gelöschte, unbezahlte Bewertungen) aller Aufträge des Kunden abbuchen – je Währung eine Rechnung. */
export async function chargeDue(email0: string, why = "Löschung"): Promise<AutoCharged | null> {
  const email = String(email0 || "").toLowerCase();
  const k = keyFor(email);
  if (!k || !pool) return null;
  const row = await rowOf(email);
  if (!row || !row.pm || row.mode !== k.mode) return null;
  if (busy.has(email)) return null;
  busy.add(email);
  try {
    const { orders } = await loadCustomerOrders(email);
    const due = orders.filter((o) => o.toPay > 0 && !o.cancelled);
    if (!due.length) return null;
    let res: AutoCharged | null = null;
    for (const cur of [...new Set(due.map((o) => o.cur))]) {
      const use = due.filter((o) => o.cur === cur);
      const picks: PayRef[] = use.flatMap((o) => o.items.filter((it) => it.status === "removed" && !it.paid).map((it) => ({ o: o.id, k: it.key })));
      const amount = Math.round(use.reduce((s, o) => s + o.toPay, 0) * 100) / 100;
      if (!picks.length || !(amount > 0)) continue;
      const id = newPayId();
      const primary = picks[0].o;
      const desc = `Entfernte Google-Bewertungen · ${picks.length} × · ${[...new Set(use.map((o) => o.id))].join(", ")}`;
      let inv: any = null;
      try {
        inv = await sx(k.key, "POST", "invoices", {
          customer: row.customer, collection_method: "charge_automatically", auto_advance: false, currency: cur,
          default_payment_method: row.pm, pending_invoice_items_behavior: "exclude", description: desc,
          metadata: { rr_pay: id, rr_email: email, rr_orders: [...new Set(use.map((o) => o.id))].join(",") },
        }, `rr-inv-${id}`);
        await sx(k.key, "POST", "invoiceitems", { customer: row.customer, invoice: inv.id, amount: Math.round(amount * 100), currency: cur, description: desc }, `rr-ii-${id}`);
        inv = await sx(k.key, "POST", `invoices/${inv.id}/finalize`, {}, `rr-fin-${id}`);
        inv = await sx(k.key, "POST", `invoices/${inv.id}/pay`, { payment_method: row.pm, off_session: true }, `rr-pay-${id}`);
        if (inv.status !== "paid") throw new StripeErr(`Rechnung ${inv.status}`);
      } catch (e) {
        const err = e as StripeErr;
        const msg = `${err.message}${err.decline ? ` (${err.decline})` : ""}`.slice(0, 300);
        if (inv?.id) void sx(k.key, "POST", `invoices/${inv.id}/void`, {}).catch(() => {}); // keine offene Doppel-Rechnung stehen lassen
        await pool.query(`UPDATE cust_autopay SET last_error=$2, updated_at=now() WHERE email=$1`, [email, msg]).catch(() => {});
        await insertEvent({ orderId: primary, email, type: "pay", title: `Automatische Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, detail: `${row.label || "Zahlungsart"} · ${msg} → Auftrag pausiert, Kunde soll Zahlungsart aktualisieren`, auto: true }).catch(() => {});
        await holdForCard([...new Set(use.map((o) => o.id))], email, row.label || "", msg, `${amount} ${cur.toUpperCase()}`, k.mode === "test").catch(() => {});
        void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Abbuchung fehlgeschlagen · ${amount} ${cur.toUpperCase()}`, `${email} · ${row.label || ""} · ${msg}`, `${SITE_URL}/admin?order=${encodeURIComponent(primary)}`, { kind: "pay" });
        continue;
      }
      const url = String(inv.hosted_invoice_url || `https://dashboard.stripe.com/${k.mode === "test" ? "test/" : ""}invoices/${inv.id}`);
      await addOrderPayment(primary, { id, kind: "invoice", amount, cur, url, n: picks.length, via: "autopay", keys: picks.filter((r) => r.o === primary).map((r) => r.k), refs: picks.filter((r) => r.o !== primary) });
      await markReviewPaymentPaid(email, amount, `rr_${id}`);
      await pool.query(`UPDATE cust_autopay SET last_error=NULL, updated_at=now() WHERE email=$1`, [email]).catch(() => {});
      for (const oid of new Set(picks.map((p) => p.o))) {
        await insertEvent({ orderId: oid, email, type: "pay", title: `Bezahlt: automatisch abgebucht · ${amount} ${cur.toUpperCase()}${k.mode === "test" ? " (TEST)" : ""}`, detail: `${row.label || ""} · ${picks.length} Bewertung(en) · Stripe-Rechnung ${inv.number || inv.id} · Anlass: ${why}`, auto: true }).catch(() => {});
      }
      void logCustEvent(email, "payment_success", `Automatisch abgebucht · ${amount} ${cur.toUpperCase()}`, { amount, cur, kind: "invoice", auto: true }, { orderId: primary });
      void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Automatisch bezahlt · ${amount} ${cur.toUpperCase()}`, `${email} · ${row.label || ""} · ${picks.length} gelöschte Bewertung(en)`, `${SITE_URL}/admin?order=${encodeURIComponent(primary)}`, { kind: "pay" });
      res = { amount: ((res as AutoCharged | null)?.amount || 0) + amount, cur, label: row.label || "", invoiceUrl: url };
    }
    return res;
  } finally { busy.delete(email); }
}

/** Hinweis auf der Stripe-Seite (über dem Bestätigen-Knopf): beim Hinterlegen wird nichts abgebucht. */
const NO_CHARGE: Record<string, string> = {
  de: "ES WIRD JETZT NICHTS ABGEBUCHT. Sie hinterlegen nur Ihre Zahlungsart. Abgebucht wird erst, wenn eine Bewertung tatsächlich gelöscht ist – und nur dafür.",
  en: "NOTHING IS CHARGED NOW. You're only saving your payment method. We charge only when a review has actually been removed – and only for that review.",
  es: "AHORA NO SE COBRA NADA. Solo guardas tu método de pago. Cobramos únicamente cuando una reseña se ha eliminado de verdad, y solo por esa reseña.",
  fr: "RIEN N'EST DÉBITÉ MAINTENANT. Tu enregistres seulement ton moyen de paiement. Nous débitons uniquement quand un avis a réellement été supprimé – et seulement pour cet avis.",
  it: "ORA NON VIENE ADDEBITATO NULLA. Stai solo salvando il metodo di pagamento. Addebitiamo solo quando una recensione è stata davvero rimossa, e solo per quella.",
  nl: "ER WORDT NU NIETS AFGESCHREVEN. U slaat alleen uw betaalmethode op. We schrijven pas af als een review echt is verwijderd – en alleen voor die review.",
  pt: "AGORA NÃO É COBRADO NADA. Só guardas o teu método de pagamento. Cobramos apenas quando uma avaliação for realmente removida – e só por essa avaliação.",
  ja: "現在、料金は一切発生しません。お支払い方法を登録するだけです。口コミが実際に削除された場合にのみ、その分だけ請求します。",
  sv: "INGET DRAS NU. Du sparar bara din betalningsmetod. Vi drar pengar först när ett omdöme verkligen har tagits bort – och bara för det omdömet.",
  da: "DER TRÆKKES INTET NU. Du gemmer kun din betalingsmetode. Vi trækker først, når en anmeldelse faktisk er fjernet – og kun for den anmeldelse.",
  no: "INGENTING BELASTES NÅ. Du lagrer bare betalingsmetoden din. Vi belaster først når en anmeldelse faktisk er fjernet – og bare for den anmeldelsen.",
};

/* ---- Routen ---- */
let lastErr: { at: string; where: string; msg: string } | null = null; // letzte Stripe-Fehlermeldung (Diagnose, ohne Schlüssel)
export function registerAutopayRoutes(app: FastifyInstance): void {
  autopayHooks.charge = (email) => chargeDue(email).catch((e) => { app.log.error({ err: e }, "Automatisch bezahlen: Abbuchung fehlgeschlagen"); return null; });
  autopayHooks.info = info;
  autopayHooks.saved = (email) => hasSavedMethod(String(email || "").toLowerCase());
  void init().catch((e) => app.log.error({ err: e }, "cust_autopay anlegen fehlgeschlagen"));

  const auth = async (b: Record<string, unknown>) => {
    const si = await customerSessionInfo(b.token);
    return si ? si : null;
  };

  // Schritt 1: Stripe Checkout (mode=setup) öffnen.
  app.post("/cust/autopay/start", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const k = keyFor(si.email);
    if (!k) return reply.code(400).send({ ok: false, error: "unavailable" });
    const { orders, name, lang } = await loadCustomerOrders(si.email);
    const cur = (orders[0]?.cur as string) || "eur";
    let row = await rowOf(si.email);
    try {
      if (!row || row.mode !== k.mode) {
        const c = await sx(k.key, "POST", "customers", { email: si.email, name: name || undefined, metadata: { rr_email: si.email } }, `rr-cus-${k.mode}-${si.email}`);
        await pool.query(`INSERT INTO cust_autopay (email, mode, customer) VALUES ($1,$2,$3)
          ON CONFLICT (email) DO UPDATE SET mode=EXCLUDED.mode, customer=EXCLUDED.customer, pm=NULL, label=NULL, pm_type=NULL, last_error=NULL, updated_at=now()`, [si.email, k.mode, c.id]);
        row = await rowOf(si.email);
      }
      const base = String(b.returnUrl || "").startsWith(SITE_URL) || /^http:\/\/localhost:\d+\//.test(String(b.returnUrl || "")) ? String(b.returnUrl).split("?")[0] : DASH_URL;
      const params: Record<string, unknown> = {
        mode: "setup", customer: row!.customer, currency: cur, locale: "auto",
        success_url: `${base}?autopay=done&cs={CHECKOUT_SESSION_ID}`, cancel_url: `${base}?autopay=cancel`,
        setup_intent_data: { metadata: { rr_email: si.email } }, metadata: { rr_email: si.email },
        custom_text: { submit: { message: NO_CHARGE[String(lang || "en").slice(0, 2)] || NO_CHARGE.en } },
      };
      let ses: any;
      // Nur Zahlungsarten, die sofort und sicher abbuchen: Karte (inkl. Apple/Google Pay), PayPal, Link.
      // KEINE Lastschrift/Bankkonto (US-Bankkonto, SEPA): Abbuchung dauert Tage und kann noch platzen.
      for (const types of [["card", "paypal", "link"], ["card", "link"], ["card"]]) {
        try { ses = await sx(k.key, "POST", "checkout/sessions", { ...params, payment_method_types: types }); break; }
        catch (e) { app.log.warn({ err: e, types }, "Setup-Checkout: Zahlungsarten nicht verfügbar – nächster Versuch"); if (types.length === 1) throw e; }
      }
      void logCustEvent(si.email, "autopay_open", "Zahlungsart hinterlegen geöffnet", { mode: k.mode });
      return { ok: true, url: ses.url, mode: k.mode };
    } catch (e) {
      app.log.error({ err: e }, "Automatisch bezahlen: Start fehlgeschlagen");
      lastErr = { at: new Date().toISOString(), where: "start", msg: String((e as Error)?.message || e).slice(0, 300) };
      return reply.code(503).send({ ok: false, error: "payment_unavailable", ...(k.mode === "test" ? { detail: lastErr.msg } : {}) });
    }
  });

  // Schritt 2: Rückkehr aus Stripe → Zahlungsart speichern + offene Beträge gleich abbuchen.
  app.post("/cust/autopay/confirm", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const k = keyFor(si.email);
    const row = await rowOf(si.email);
    const cs = String(b.cs || "");
    if (!k || !row || row.mode !== k.mode || !/^cs_[A-Za-z0-9_]+$/.test(cs)) return reply.code(400).send({ ok: false, error: "invalid" });
    try {
      const ses = await sx(k.key, "GET", `checkout/sessions/${cs}`, { expand: ["setup_intent.payment_method"] });
      if (ses.customer !== row.customer || ses.mode !== "setup") return reply.code(400).send({ ok: false, error: "invalid" });
      const si2 = ses.setup_intent;
      if (!si2 || si2.status !== "succeeded" || !si2.payment_method) return reply.code(400).send({ ok: false, error: "not_completed" });
      const pm = si2.payment_method;
      const label = pmLabel(pm);
      if (row.pm === pm.id) { await releasePayGates(si.email, label).catch(() => 0); return { ok: true, label, charged: null }; } // schon gespeichert (Neuladen)
      if (row.pm && row.pm !== pm.id) void sx(k.key, "POST", `payment_methods/${row.pm}/detach`, {}).catch(() => {});
      await sx(k.key, "POST", `customers/${row.customer}`, { invoice_settings: { default_payment_method: pm.id } }).catch(() => {});
      await pool.query(`UPDATE cust_autopay SET pm=$2, label=$3, pm_type=$4, last_error=NULL, updated_at=now() WHERE email=$1`, [si.email, pm.id, label, pm.type || null]);
      const { orders } = await loadCustomerOrders(si.email);
      for (const o of orders.filter((x) => !x.cancelled).slice(0, 5)) {
        await insertEvent({ orderId: o.id, email: si.email, type: "note", title: `Kunde: Zahlungsart hinterlegt – zahlt automatisch${k.mode === "test" ? " (TEST)" : ""}`, detail: `${label} · wird nach jeder Löschung abgebucht`, auto: true }).catch(() => {});
      }
      void logCustEvent(si.email, "autopay_on", `Automatisch bezahlen aktiviert · ${label}`, { mode: k.mode });
      void notifyTeam(`${k.mode === "test" ? "TEST · " : ""}Zahlungsart hinterlegt`, `${si.email} · ${label} · zahlt ab jetzt automatisch`, `${SITE_URL}/admin`, { kind: "customer" });
      await approvePendingPre(si.email).catch((e) => app.log.error({ err: e }, "Software-Fälle freigeben fehlgeschlagen"));
      const started = await releasePayGates(si.email, label).catch((e) => { app.log.error({ err: e }, "Aufträge freigeben fehlgeschlagen"); return 0; });
      const charged = await chargeDue(si.email, "Zahlungsart hinterlegt").catch(() => null);
      return { ok: true, label, charged, started };
    } catch (e) {
      app.log.error({ err: e }, "Automatisch bezahlen: Bestätigung fehlgeschlagen");
      return reply.code(503).send({ ok: false, error: "payment_unavailable" });
    }
  });

  app.post("/cust/autopay/remove", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const si = await auth(b);
    if (!si || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (si.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    // Laufende Aufträge → nur „Ändern" erlaubt (sonst könnte man nach den ersten Löschungen die Abbuchung abdrehen).
    if (ordersRunning((await loadCustomerOrders(si.email)).orders)) return reply.code(409).send({ ok: false, error: "orders_running" });
    const row = await rowOf(si.email);
    const k = keyFor(si.email);
    if (row?.pm && k && row.mode === k.mode) await sx(k.key, "POST", `payment_methods/${row.pm}/detach`, {}).catch((e) => app.log.warn({ err: e }, "PM lösen fehlgeschlagen"));
    await pool.query(`UPDATE cust_autopay SET pm=NULL, label=NULL, pm_type=NULL, updated_at=now() WHERE email=$1`, [si.email]);
    void logCustEvent(si.email, "autopay_off", `Automatisch bezahlen entfernt${row?.label ? " · " + row.label : ""}`);
    const { orders } = await loadCustomerOrders(si.email);
    if (orders[0]) await insertEvent({ orderId: orders[0].id, email: si.email, type: "note", title: "Kunde: hinterlegte Zahlungsart entfernt", detail: row?.label || "", auto: true }).catch(() => {});
    return { ok: true };
  });

  // Admin: Status je Kunde (für Tests/Support).
  app.get("/health/autopay", async () => ({ ok: true, testKey: /^(sk|rk)_test_/.test(process.env.STRIPE_TEST_SECRET_KEY || ""), live: String(process.env.AUTOPAY_LIVE || "").toLowerCase() === "on", lastError: lastErr }));
}
