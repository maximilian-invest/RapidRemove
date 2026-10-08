/* Start eines Bewertungs-Auftrags (Übergabe ans Partner-Board) erst, wenn alle Vorbedingungen erfüllt sind:
 *   verify  – Inhaber-Nachweis bei 4–5-Sterne-Bewertungen (verify.ts)
 *   payGate – Zahlungsart hinterlegt („Automatisch bezahlen", autopay.ts)
 * Beide setzen ihren Status und rufen dann startOrderIfReady() – wer zuletzt fertig ist, startet den Auftrag. */
import { pool, insertEvent } from "./db";
import { partnerAutoSend, partnerAutoSendProfile, partnerAutoEnabled } from "./partner";

type Gate = { status?: string } | null | undefined;
export function gatesOpen(raw: Record<string, unknown> | null | undefined): boolean {
  const v = raw?.verify as Gate, g = raw?.payGate as Gate;
  return (!v || v.status === "ok") && (!g || g.status !== "pending");
}
export function waitingFor(raw: Record<string, unknown> | null | undefined): string[] {
  const v = raw?.verify as Gate, g = raw?.payGate as Gate;
  return [v && v.status !== "ok" ? "Inhaber-Nachweis" : "", g && g.status === "pending" ? "Zahlungsart" : ""].filter(Boolean);
}

/** Auftrag aufs Partner-Board, falls nichts mehr fehlt. Gibt die Anzahl neuer Aufgaben zurück (0 = wartet/schon da). */
export async function startOrderIfReady(orderId: string): Promise<number> {
  if (!pool) return 0;
  const r = await pool.query(`SELECT id, email, name, company, profile, status, service, raw FROM orders WHERE id=$1`, [orderId]);
  const o = r.rows[0];
  if (!o || o.status === "storniert") return 0;
  const raw = (o.raw || {}) as Record<string, unknown>;
  if (!gatesOpen(raw)) {
    await insertEvent({ orderId, email: o.email, type: "note", title: `Auftrag wartet noch auf: ${waitingFor(raw).join(" + ")}`, detail: "Start (Partner-Board) erst, wenn alles da ist", auto: true }).catch(() => {});
    return 0;
  }
  // Profil-Löschung (remove/reset/express): Profil als Partner-Aufgabe, falls in den Einstellungen aktiv.
  if (o.service !== "reviews") {
    if (!["remove", "reset", "express"].includes(String(o.service)) || !(await partnerAutoEnabled("profiles").catch(() => false))) return 0;
    const purl = String(raw.mapsUri || "") || (/^https?:\/\//i.test(String(o.profile || "")) ? String(o.profile) : "");
    return partnerAutoSendProfile(orderId, o.profile || o.company || o.name || "", purl).then(() => 1).catch((e) => { console.error("Partner-Board (Profil): Start fehlgeschlagen", e); return 0; });
  }
  const items = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Record<string, unknown>[]) : [];
  if (!items.length || !(await partnerAutoEnabled("reviews").catch(() => true))) return 0;
  return partnerAutoSend(orderId, o.profile || o.company || o.name || "", items).catch((e) => { console.error("Partner-Board: Start fehlgeschlagen", e); return 0; });
}
