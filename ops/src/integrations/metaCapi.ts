/* Meta Conversions API — serverseitige Ereignisse an Datensatz 1985417835506997.
 *
 * Warum serverseitig: Der Kauf passiert Tage später und AUSSERHALB des Browsers
 * — die Löschung wird hier bestätigt, die Zahlung läuft über einen per Mail
 * versandten Payment-Link. Zu dem Zeitpunkt ist der Kunde nicht mehr auf der
 * Seite; ein Browser-Pixel kann dort prinzipiell nichts melden. Nur ein
 * Server-Ereignis verbindet den Auftrag mit dem ursprünglichen Anzeigenklick.
 *
 * EINWILLIGUNG: Die Conversions API ist KEIN Umweg um den Cookie-Hinweis.
 * Serverseitig gesendete Daten sind dieselbe Übermittlung an Meta wie im
 * Browser und brauchen dieselbe Einwilligung. sendEvent() sendet ausschließlich,
 * wenn consentMarketing am Datensatz wahr ist — ohne Ausnahme, ohne Schalter.
 *
 * Ohne META_CAPI_TOKEN ist alles hier ein No-op; das Backend läuft normal weiter.
 */
import { createHash } from "node:crypto";
import { getOrderForCapi, claimCapiSend, releaseCapiSend } from "../db";

type Log = { info: (o: unknown, m?: string) => void; warn: (o: unknown, m?: string) => void };

const TOKEN = (process.env.META_CAPI_TOKEN || "").trim();
const PIXEL_ID = (process.env.META_PIXEL_ID || "1985417835506997").trim();
const API_VERSION = (process.env.META_CAPI_VERSION || "v21.0").trim();
// Optional: Ereignisse im Events Manager unter „Events testen" sichtbar machen.
const TEST_CODE = (process.env.META_CAPI_TEST_CODE || "").trim();

export function capiEnabled(): boolean {
  return !!TOKEN && !!PIXEL_ID;
}

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

/** E-Mail: trimmen, komplett kleinschreiben, dann SHA-256 (hex). */
export function hashEmail(raw?: string | null): string | null {
  const v = String(raw || "").trim().toLowerCase();
  if (!v || v.indexOf("@") < 1) return null;
  return sha256(v);
}

/** Telefon: nur Ziffern, mit Ländervorwahl, OHNE führendes Plus, dann SHA-256.
 *  `country` liefert die Vorwahl, wenn die Nummer national notiert ist (0…). */
export function hashPhone(raw?: string | null, country?: string | null): string | null {
  let v = String(raw || "").replace(/[^\d+]/g, "");
  if (!v) return null;
  if (v.startsWith("+")) v = v.slice(1);
  else if (v.startsWith("00")) v = v.slice(2);
  else if (v.startsWith("0")) {
    // Nationale Schreibweise → Ländervorwahl aus dem Land der Bestellung.
    const cc: Record<string, string> = { DE: "49", AT: "43", CH: "41", US: "1", GB: "44", IT: "39", FR: "33", ES: "34", NL: "31", PT: "351", SE: "46", DK: "45", NO: "47", JP: "81" };
    const pre = cc[String(country || "DE").toUpperCase()];
    if (!pre) return null; // lieber nichts senden als eine falsche Nummer
    v = pre + v.slice(1);
  }
  v = v.replace(/\D/g, "");
  if (v.length < 8 || v.length > 15) return null;
  return sha256(v);
}

export type CapiUser = {
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  clientIp?: string | null;
  clientUa?: string | null;
};

export type CapiEvent = {
  eventName: "Lead" | "InitiateCheckout" | "Purchase";
  eventTime?: number;          // Unix-Sekunden; Standard: jetzt
  eventId: string;             // MUSS mit dem Browser-Ereignis übereinstimmen
  eventSourceUrl?: string | null;
  consentMarketing: boolean;   // ohne true wird NICHT gesendet
  user: CapiUser;
  customData?: Record<string, unknown>;
};

export type CapiResult =
  | { ok: true; skipped: true; reason: "no-consent" | "not-configured" }
  | { ok: true; skipped: false; received: number; fbtraceId: string; matchKeys: string[] }
  | { ok: false; error: string };

/** Baut die user_data. Rohwerte verlassen den Server NIE — nur Hashes bzw.
 *  die von Meta vorgesehenen Klick-/Browser-Kennungen. */
function buildUserData(u: CapiUser): { data: Record<string, unknown>; keys: string[] } {
  const d: Record<string, unknown> = {};
  const keys: string[] = [];
  const em = hashEmail(u.email);
  if (em) { d.em = [em]; keys.push("em"); }
  const ph = hashPhone(u.phone, u.country);
  if (ph) { d.ph = [ph]; keys.push("ph"); }
  if (u.fbc) { d.fbc = u.fbc; keys.push("fbc"); }
  if (u.fbp) { d.fbp = u.fbp; keys.push("fbp"); }
  if (u.clientIp) { d.client_ip_address = u.clientIp; keys.push("ip"); }
  if (u.clientUa) { d.client_user_agent = u.clientUa; keys.push("ua"); }
  return { data: d, keys };
}

/**
 * Sendet ein Ereignis. Gibt IMMER ein Ergebnis zurück und wirft nicht — ein
 * Marketing-Aufruf darf weder eine Bestellung noch eine Prüfung scheitern lassen.
 */
export async function sendEvent(ev: CapiEvent): Promise<CapiResult> {
  if (!ev.consentMarketing) return { ok: true, skipped: true, reason: "no-consent" };
  if (!capiEnabled()) return { ok: true, skipped: true, reason: "not-configured" };

  const { data: userData, keys } = buildUserData(ev.user);
  const payload: Record<string, unknown> = {
    data: [{
      event_name: ev.eventName,
      event_time: ev.eventTime || Math.floor(Date.now() / 1000),
      event_id: ev.eventId,
      action_source: "website",
      ...(ev.eventSourceUrl ? { event_source_url: ev.eventSourceUrl } : {}),
      user_data: userData,
      ...(ev.customData ? { custom_data: ev.customData } : {}),
    }],
  };
  if (TEST_CODE) payload.test_event_code = TEST_CODE;

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = (body && (body as { error?: { message?: string } }).error) || {};
      return { ok: false, error: `HTTP ${res.status}: ${err.message || JSON.stringify(body).slice(0, 300)}` };
    }
    return {
      ok: true, skipped: false,
      received: Number((body as { events_received?: number }).events_received) || 0,
      fbtraceId: String((body as { fbtrace_id?: string }).fbtrace_id || ""),
      matchKeys: keys,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Purchase für eine Bestellung — NUR wenn die Löschung bestätigt (status=done)
 * UND die Zahlung eingegangen ist (pay=paid) UND eine Einwilligung vorliegt.
 *
 * Wird von jeder Stelle aufgerufen, die Status oder Zahlung ändert: Admin-
 * Statuswechsel, manuelle Zahlungsbuchung und der automatische Stripe-Abgleich.
 * claimCapiSend() vergibt das Senderecht atomar, damit bei gleichzeitigen
 * Aufrufen höchstens einer sendet. Wirft nie — ein Marketing-Aufruf darf weder
 * eine Zahlung noch einen Statuswechsel scheitern lassen.
 */
export async function sendPurchaseForOrder(orderId: string, log?: Log): Promise<void> {
  try {
    if (!capiEnabled() || !orderId) return;
    const o = await getOrderForCapi(orderId);
    if (!o) return;
    if (o.status !== "done" || o.pay !== "paid") return;
    if (!o.consent_marketing) return;
    if (o.capi_purchase_at) return;
    if (!(await claimCapiSend("orders", "capi_purchase_at", orderId))) return;
    const value = Number(o.amount || 0) + Number(o.prot_amount || 0);
    const r = await sendEvent({
      eventName: "Purchase",
      // Kein Browser-Gegenstück → eine stabile eigene ID genügt. Die Order-ID
      // ist eindeutig und verhindert Doppelzählung bei einem erneuten Versuch.
      eventId: orderId,
      eventSourceUrl: o.event_source_url,
      consentMarketing: true,
      user: {
        email: o.email, phone: o.phone, country: o.country,
        fbc: o.fbc, fbp: o.fbp, clientIp: o.client_ip, clientUa: o.client_ua,
      },
      customData: { value: value > 0 ? value : 450, currency: o.country === "US" ? "USD" : "EUR" },
    });
    if (!r.ok) {
      await releaseCapiSend("orders", "capi_purchase_at", orderId); // erneuter Versuch möglich
      log?.warn({ orderId, error: r.error }, "CAPI Purchase fehlgeschlagen");
    } else if (!r.skipped) {
      log?.info({ orderId, received: r.received, match: r.matchKeys }, "CAPI Purchase gesendet");
    }
  } catch (e) {
    log?.warn({ orderId, err: (e as Error).message }, "CAPI Purchase Ausnahme");
  }
}
