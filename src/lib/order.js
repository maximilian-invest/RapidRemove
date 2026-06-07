/* RapidRemove — Bestellung an das ops-Backend übergeben (Browser-seitig).
 *
 * Schickt die Wizard-Bestellung an den /order-Endpunkt des ops-Servers, der
 * daraufhin die bestehende Auftragsbestätigung an den Kunden sendet und eine
 * interne Benachrichtigung auslöst. Die ops-URL kommt aus der Build-Variable
 * NEXT_PUBLIC_OPS_URL. Ohne diese Variable bleibt der Wizard im Demo-Modus
 * (keine Mail, nur Danke-Screen) – die Seite funktioniert also auch ohne
 * laufendes Backend.
 */
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");

/** true, wenn ein ops-Backend konfiguriert ist. */
export function opsEnabled() {
  return !!OPS;
}

/** Übergibt die Bestellung an das ops-Backend. No-op (skipped), wenn keine URL gesetzt ist. */
export async function submitOrder(payload) {
  if (!OPS) return { ok: false, skipped: true };
  const res = await fetch(OPS + "/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) throw new Error("order " + res.status);
  return res.json().catch(() => ({ ok: true }));
}
