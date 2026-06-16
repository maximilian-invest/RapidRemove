/*
 * FirstPromoter – Affiliate-Referrals/Sales serverseitig erfassen (ohne SDK, nur fetch).
 * Unterstützt BEIDE API-Generationen, automatisch gewählt anhand der Account-ID:
 *
 *   v1 (legacy):  https://firstpromoter.com/api/v1/track/...
 *                 Header  x-api-key: <KEY>          Body: form-urlencoded
 *   v2 (aktuell): https://api.firstpromoter.com/api/v2/track/...
 *                 Header  Authorization: Bearer <KEY> + Account-ID: <ID>   Body: JSON
 *
 * Liegt eine Account-ID vor (FPR_ACCOUNT_ID oder opts.accountId), wird v2 benutzt,
 * sonst v1. Zugangsdaten LAZY aus der Umgebung (Server startet auch ohne):
 *
 *   FPR_API_KEY      v1-API-Key ODER v2-Bearer-Token. NICHT im Code/Repo!
 *   FPR_ACCOUNT_ID   nur v2: Account-ID aus FirstPromoter → Settings → Integrations.
 *
 * Hinweis: Der öffentliche `cid` (Frontend/fpr.js) ist NICHT der API-Key. Die Zuordnung
 * Klick → Sale läuft über die Tracking-ID `tid` (Cookie _fprom_tid) oder die Promoter-
 * Ref-ID `ref_id` aus dem Link (?via=matthew → ref_id "matthew").
 */

const V1_BASE = "https://firstpromoter.com/api/v1";
const V2_BASE = "https://api.firstpromoter.com/api/v2";

export function hasFirstPromoter(): boolean {
  return !!process.env.FPR_API_KEY;
}

export type FprSaleResult = { ok: boolean; status?: number; error?: string; skipped?: boolean; promoter?: string; raw?: string; api?: "v1" | "v2" };

/** Liest – defensiv, da das Response-Schema variiert – den Promoter-/Affiliate-Namen. */
function extractPromoter(obj: any): string {
  if (!obj || typeof obj !== "object") return "";
  const o = obj.data || obj;
  const pick = (x: any) =>
    x ? String(x.name || x.full_name || x.email || x.cust_id || x.username || x.default_ref_id || x.ref_id || "").trim() : "";
  const p = o.promoter || (o.lead && o.lead.promoter) || (o.referral && o.referral.promoter) || (o.sale && o.sale.promoter);
  const s = pick(p);
  if (s) return s;
  return String(o.ref_id || o.promoter_name || "").trim();
}

/** Ein Tracking-Call gegen v1 (x-api-key/form) oder v2 (Bearer + Account-ID/JSON). */
async function fprPost(path: string, params: Record<string, unknown>, key: string, accountId?: string): Promise<{ status: number; txt: string }> {
  let res: Response;
  if (accountId) {
    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") body[k] = v;
    res = await fetch(V2_BASE + path, {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Account-ID": accountId, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") form.set(k, String(v));
    res = await fetch(V1_BASE + path, {
      method: "POST",
      headers: { "x-api-key": key, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
  }
  const txt = await res.text().catch(() => "");
  return { status: res.status, txt };
}

function done(status: number, txt: string, accountId?: string): FprSaleResult {
  const api = accountId ? "v2" : "v1";
  if (status < 200 || status >= 300) return { ok: false, status, error: `HTTP ${status}: ${txt.slice(0, 200)}`.trim(), raw: txt.slice(0, 600), api };
  let promoter = "";
  try { promoter = extractPromoter(JSON.parse(txt)); } catch (e) { /* Antwort kein JSON – egal */ }
  return { ok: true, status, promoter, raw: txt.slice(0, 600), api };
}

/**
 * Meldet einen Sale an FirstPromoter (bucht ihn auf das Referral).
 * @param amount Bruttobetrag in der Hauptwährungseinheit (z. B. Euro) – wird in Cent umgerechnet.
 */
export async function trackSale(opts: {
  email: string;
  eventId: string;
  amount: number;
  currency?: string;
  tid?: string;
  refId?: string;
  uid?: string;
  plan?: string;
  key?: string;
  accountId?: string;
}): Promise<FprSaleResult> {
  const key = opts.key || process.env.FPR_API_KEY;
  const accountId = opts.accountId || process.env.FPR_ACCOUNT_ID || undefined;
  if (!key) return { ok: false, skipped: true, error: "FirstPromoter nicht konfiguriert (FPR_API_KEY)" };
  const amountCents = Math.round((Number(opts.amount) || 0) * 100);
  if (!opts.email || amountCents <= 0) return { ok: false, skipped: true, error: "kein Betrag oder keine E-Mail" };
  if (!opts.tid && !opts.refId) return { ok: false, skipped: true, error: "weder Tracking-ID (tid) noch Affiliate-Ref (ref_id) – kein Affiliate" };

  const params: Record<string, unknown> = { email: opts.email, event_id: opts.eventId, amount: amountCents };
  if (opts.currency) params.currency = opts.currency;
  if (opts.tid) params.tid = opts.tid;
  if (opts.refId) params.ref_id = opts.refId;
  if (opts.uid) params.uid = opts.uid;
  if (opts.plan) params.plan = opts.plan;

  try {
    const { status, txt } = await fprPost("/track/sale", params, key, accountId);
    return done(status, txt, accountId);
  } catch (e: any) {
    return { ok: false, error: "Netzwerkfehler: " + (e?.message || "unbekannt") };
  }
}

/**
 * Legt in FirstPromoter ein Referral an: ordnet die Kunden-E-Mail dem Promoter zu.
 * Zuordnung über `tid` (Cookie _fprom_tid) bevorzugt, sonst `ref_id` (?via=…).
 */
export async function trackSignup(opts: {
  email: string;
  refId?: string;
  tid?: string;
  uid?: string;
  key?: string;
  accountId?: string;
}): Promise<FprSaleResult> {
  const key = opts.key || process.env.FPR_API_KEY;
  const accountId = opts.accountId || process.env.FPR_ACCOUNT_ID || undefined;
  if (!key) return { ok: false, skipped: true, error: "FirstPromoter nicht konfiguriert (FPR_API_KEY)" };
  if (!opts.email && !opts.uid) return { ok: false, skipped: true, error: "keine E-Mail/uid" };
  if (!opts.tid && !opts.refId) return { ok: false, skipped: true, error: "weder Tracking-ID (tid) noch Affiliate-Ref (ref_id)" };

  const params: Record<string, unknown> = {};
  if (opts.email) params.email = opts.email;
  if (opts.tid) params.tid = opts.tid;
  if (opts.refId) params.ref_id = opts.refId;
  if (opts.uid) params.uid = opts.uid;

  try {
    const { status, txt } = await fprPost("/track/signup", params, key, accountId);
    return done(status, txt, accountId);
  } catch (e: any) {
    return { ok: false, error: "Netzwerkfehler: " + (e?.message || "unbekannt") };
  }
}
