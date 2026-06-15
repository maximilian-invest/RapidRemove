/*
 * FirstPromoter – Affiliate-Sales serverseitig erfassen (ohne SDK, nur fetch,
 * wie clicksend.ts/stripe.ts). Wenn eine Bestellung über den Link eines
 * Affiliate-Partners reinkommt, meldet das ops-Backend den Sale an FirstPromoter;
 * der Partner sieht die Bestellung dann in seinem Dashboard.
 *
 * Zugangsdaten LAZY aus der Umgebung (Server startet auch ohne Konfiguration):
 *
 *   FPR_API_KEY   Account-API-Key aus dem FirstPromoter-Dashboard
 *                 (Settings → Integrations → Manage API Keys). NICHT im Code/Repo!
 *
 * Hinweis: Der öffentliche `cid` (im Frontend in fpr.js) ist NICHT der API-Key.
 * Die Zuordnung Klick → Sale läuft über die Tracking-ID `tid` aus dem Cookie
 * `_fprom_tid`, die der Browser beim Checkout mitschickt. Ohne `tid` versucht
 * FirstPromoter, anhand der E-Mail einen bestehenden Referral zu finden.
 */

const ENDPOINT = "https://firstpromoter.com/api/v1/track/sale";

export function hasFirstPromoter(): boolean {
  return !!process.env.FPR_API_KEY;
}

export type FprSaleResult = { ok: boolean; status?: number; error?: string; skipped?: boolean; promoter?: string };

/** Liest – defensiv, da das Response-Schema variieren kann – den lesbaren
 *  Promoter/Affiliate-Namen aus der track/sale-Antwort. Leerstring, wenn nicht da. */
function extractPromoter(obj: any): string {
  if (!obj || typeof obj !== "object") return "";
  const pick = (x: any) =>
    x ? String(x.name || x.full_name || x.email || x.cust_id || x.username || x.default_ref_id || x.ref_id || "").trim() : "";
  const p = obj.promoter || (obj.lead && obj.lead.promoter) || (obj.referral && obj.referral.promoter) || (obj.sale && obj.sale.promoter);
  const s = pick(p);
  if (s) return s;
  return String(obj.ref_id || obj.promoter_name || "").trim();
}

/**
 * Meldet einen Sale an FirstPromoter.
 * @param amount  Bruttobetrag in der Hauptwährungseinheit (z. B. Euro) – wird in Cent umgerechnet.
 * @param eventId Eindeutige ID (Bestell-Nr.) – verhindert doppelte Sales/Provisionen.
 * @param tid     Tracking-ID aus dem _fprom_tid-Cookie (Klick → Partner-Zuordnung).
 */
export async function trackSale(opts: {
  email: string;
  eventId: string;
  amount: number;
  currency?: string;
  tid?: string;
  uid?: string;
  plan?: string;
}): Promise<FprSaleResult> {
  const key = process.env.FPR_API_KEY;
  if (!key) return { ok: false, skipped: true, error: "FirstPromoter nicht konfiguriert (FPR_API_KEY)" };

  const amountCents = Math.round((Number(opts.amount) || 0) * 100);
  if (!opts.email || amountCents <= 0) return { ok: false, skipped: true, error: "kein Betrag oder keine E-Mail" };
  // Ohne tid UND ohne bekannte Referral-E-Mail kann FirstPromoter nichts zuordnen –
  // dann sparen wir uns den Call. (tid fehlt z. B., wenn der Besucher Cookies abgelehnt hat.)
  if (!opts.tid) return { ok: false, skipped: true, error: "keine Tracking-ID (tid) – kein Affiliate-Klick" };

  const params = new URLSearchParams();
  params.set("email", opts.email);
  params.set("event_id", opts.eventId);
  params.set("amount", String(amountCents));
  if (opts.currency) params.set("currency", opts.currency);
  if (opts.tid) params.set("tid", opts.tid);
  if (opts.uid) params.set("uid", opts.uid);
  if (opts.plan) params.set("plan", opts.plan);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "x-api-key": key, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const txt = await res.text().catch(() => "");
    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}: ${txt.slice(0, 200)}`.trim() };
    }
    let promoter = "";
    try { promoter = extractPromoter(JSON.parse(txt)); } catch (e) { /* Antwort kein JSON – egal */ }
    return { ok: true, status: res.status, promoter };
  } catch (e: any) {
    return { ok: false, error: "Netzwerkfehler: " + (e?.message || "unbekannt") };
  }
}
