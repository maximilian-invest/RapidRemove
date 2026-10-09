/* Start eines Bewertungs-Auftrags (Übergabe ans Partner-Board) erst, wenn alle Vorbedingungen erfüllt sind:
 *   verify  – Inhaber-Nachweis bei 4–5-Sterne-Bewertungen (verify.ts)
 *   payGate – Zahlungsart hinterlegt („Automatisch bezahlen", autopay.ts)
 * Beide setzen ihren Status und rufen dann startOrderIfReady() – wer zuletzt fertig ist, startet den Auftrag. */
import { pool, insertEvent } from "./db";
import { partnerAutoSend, partnerAutoSendProfile, partnerAutoEnabled } from "./partner";

type Gate = { status?: string; keys?: string[] } | null | undefined;
const kOf = (it: Record<string, unknown>) => String(it.url || "") || `${it.name || ""}|${it.text || ""}`;
/** Was wartet noch? Reihenfolge für den Kunden: 1) Zahlungsart (ganzer Auftrag), 2) Inhaber-Nachweis (nur die 4–5-Sterne-Bewertungen).
 *  all = ganzer Auftrag wartet; keys = nur diese Bewertungen warten (die übrigen dürfen schon zum Partner). */
export function blockedOf(raw: Record<string, unknown> | null | undefined): { all: boolean; keys: Set<string>; why: string[] } {
  const v = raw?.verify as Gate, g = raw?.payGate as Gate;
  const keys = new Set<string>(); const why: string[] = [];
  let all = false;
  if (g && g.status === "pending") { why.push("Zahlungsart"); if (Array.isArray(g.keys)) g.keys.forEach((k) => keys.add(k)); else all = true; }
  if (v && v.status !== "ok") { why.push("Inhaber-Nachweis"); if (Array.isArray(v.keys)) v.keys.forEach((k) => keys.add(k)); else all = true; }
  return { all, keys, why };
}
/** Alles frei (nichts wartet mehr)? */
export function gatesOpen(raw: Record<string, unknown> | null | undefined): boolean {
  const b = blockedOf(raw); return !b.all && !b.keys.size;
}
export function waitingFor(raw: Record<string, unknown> | null | undefined): string[] {
  return blockedOf(raw).why;
}

/** Auftrag aufs Partner-Board, falls nichts mehr fehlt. Gibt die Anzahl neuer Aufgaben zurück (0 = wartet/schon da). */
export async function startOrderIfReady(orderId: string): Promise<number> {
  if (!pool) return 0;
  const r = await pool.query(`SELECT id, email, name, company, profile, status, service, raw FROM orders WHERE id=$1`, [orderId]);
  const o = r.rows[0];
  if (!o || o.status === "storniert") return 0;
  const raw = (o.raw || {}) as Record<string, unknown>;
  const bl = blockedOf(raw);
  if (bl.all) {
    await insertEvent({ orderId, email: o.email, type: "note", title: `Auftrag wartet noch auf: ${bl.why.join(" + ")}`, detail: "Start (Partner-Board) erst, wenn alles da ist", auto: true }).catch(() => {});
    return 0;
  }
  // Profil-Löschung (remove/reset/express): Profil als Partner-Aufgabe, falls in den Einstellungen aktiv.
  if (o.service !== "reviews") {
    if (!["remove", "reset", "express"].includes(String(o.service)) || !(await partnerAutoEnabled("profiles").catch(() => false))) return 0;
    const purl = String(raw.mapsUri || "") || (/^https?:\/\//i.test(String(o.profile || "")) ? String(o.profile) : "");
    return partnerAutoSendProfile(orderId, o.profile || o.company || o.name || "", purl).then(() => 1).catch((e) => { console.error("Partner-Board (Profil): Start fehlgeschlagen", e); return 0; });
  }
  const all = Array.isArray(raw.reviewItems) ? (raw.reviewItems as Record<string, unknown>[]) : [];
  if (!all.length || !(await partnerAutoEnabled("reviews").catch(() => true))) return 0;
  // Teilstart: Bewertungen, die noch auf etwas warten (z. B. Inhaber-Nachweis für 4–5 ★), bleiben zurück; schon übergebene nicht nochmal.
  const on = new Set((await pool.query(`SELECT item_key FROM partner_tasks WHERE order_id=$1`, [orderId]).catch(() => ({ rows: [] as { item_key: string }[] }))).rows.map((x) => x.item_key));
  const items = all.filter((it) => !bl.keys.has(kOf(it)) && !on.has(kOf(it)));
  if (bl.keys.size) {
    const waitN = all.filter((it) => bl.keys.has(kOf(it)) && !on.has(kOf(it))).length;
    if (waitN) await insertEvent({ orderId, email: o.email, type: "note", title: `${waitN} Bewertung(en) warten noch auf: ${bl.why.join(" + ")}`, detail: items.length ? `${items.length} weitere gehen jetzt ans Partner-Board` : "Rest läuft bereits", auto: true }).catch(() => {});
  }
  if (!items.length) return 0;
  return partnerAutoSend(orderId, o.profile || o.company || o.name || "", items).catch((e) => { console.error("Partner-Board: Start fehlgeschlagen", e); return 0; });
}
