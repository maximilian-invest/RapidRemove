/*
 * ClickSend SMS – ohne SDK, nur fetch (wie stripe.ts/mailer.ts).
 * Zugangsdaten werden LAZY aus der Umgebung gelesen, damit der Server auch
 * ohne SMS-Konfiguration startet:
 *
 *   CLICKSEND_USERNAME  ClickSend-Konto-Benutzername (Dashboard → Account → API)
 *   CLICKSEND_API_KEY   API-Key (NICHT im Code/Repo hinterlegen!)
 *   CLICKSEND_FROM      optional: Absender-ID/Nummer (sonst ClickSend-Standard)
 *
 * Auth = HTTP Basic base64(username:api_key).
 */

export function hasClickSend(): boolean {
  return !!(process.env.CLICKSEND_USERNAME && process.env.CLICKSEND_API_KEY);
}

export type SmsResult = { ok: boolean; status?: string; error?: string };

/** Sendet eine SMS über ClickSend. `country` (2-Letter, z. B. "AT") hilft beim
 *  Parsen nationaler Nummern; bei E.164 (+43…) ist es optional. */
export async function sendSms(to: string, body: string, country?: string): Promise<SmsResult> {
  const user = process.env.CLICKSEND_USERNAME;
  const key = process.env.CLICKSEND_API_KEY;
  if (!user || !key) return { ok: false, error: "ClickSend nicht konfiguriert (CLICKSEND_USERNAME/CLICKSEND_API_KEY)" };

  const auth = Buffer.from(`${user}:${key}`).toString("base64");
  const message: Record<string, unknown> = { source: "rapidremove-admin", to, body };
  if (process.env.CLICKSEND_FROM) message.from = process.env.CLICKSEND_FROM;
  if (country) message.country = country;

  try {
    const res = await fetch("https://rest.clicksend.com/v3/sms/send", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [message] }),
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${j?.response_msg || j?.error_text || ""}`.trim() };

    const m = j?.data?.messages?.[0];
    const status = m?.status ? String(m.status) : "";
    // ClickSend akzeptiert eine Nachricht mit status "SUCCESS"; alles andere
    // (z. B. INVALID_RECIPIENT, INSUFFICIENT_CREDIT) ist ein Fehler.
    if (status && status.toUpperCase() !== "SUCCESS") {
      return { ok: false, status, error: m?.error_text || status };
    }
    return { ok: true, status: status || "SUCCESS" };
  } catch (e: any) {
    return { ok: false, error: "Netzwerkfehler: " + (e?.message || "unbekannt") };
  }
}
