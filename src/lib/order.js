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

/** Sendet eine Kontaktformular-Nachricht ans ops-Backend (mailt an das Team). */
export async function submitContact(payload) {
  if (!OPS) return { ok: false, skipped: true };
  const res = await fetch(OPS + "/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) throw new Error("contact " + res.status);
  return res.json().catch(() => ({ ok: true }));
}

/** Protokolliert eine Profil-Prüfung (Lead) im ops-Backend. No-op ohne URL. */
export async function submitCheck(payload) {
  if (!OPS) return { ok: false, skipped: true };
  const res = await fetch(OPS + "/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  if (!res.ok) throw new Error("check " + res.status);
  return res.json().catch(() => ({ ok: true }));
}

/** Speichert die Fragebogen-Antworten (5 Ja/Nein) zu einer Bestellung. No-op ohne URL. */
export async function submitOrderForm(orderId, form) {
  if (!OPS || !orderId) return { ok: false, skipped: true };
  const res = await fetch(OPS + "/order-form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, form: form || {} }),
  });
  if (!res.ok) throw new Error("order-form " + res.status);
  return res.json().catch(() => ({ ok: true }));
}

/** Minimal-Infos zur Bestellung für die öffentliche Fragebogen-Seite (Firma, ob schon ausgefüllt). */
export async function fetchOrderFormInfo(orderId) {
  if (!OPS || !orderId) return null;
  try {
    const res = await fetch(OPS + "/order-form-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}
