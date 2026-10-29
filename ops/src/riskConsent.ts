/* Zustimmung „Bestellung auf eigenes Risiko" (29.10.2026, Vorgabe Maximilian).
 * Pflicht-Checkbox vor dem Bestell-Button (Website, Website-Chat, Kunden-Dashboard: neue Bestellung, Links, Bulk,
 * „Weitere Bewertung hinzufügen"): Google kann eine Löschung nachträglich rückgängig machen; das entscheidet allein Google,
 * RapidRemove hat keinen Einfluss, Bestellung auf eigenes Risiko. Nachweis je Auftrag in orders.raw.riskConsent
 * (Zeitpunkt, Textversion, IP, Gerät, Sprache, Weg) bzw. raw.riskConsentAdds je Nachbestellung.
 * Fehlt die Zustimmung (z. B. alter Browser-Stand während eines Deploys), wird die Bestellung NICHT abgelehnt
 * (sonst ginge sie stillschweigend verloren), sondern als „fehlt" vermerkt – im Admin sichtbar.
 * Manuelle Admin-Aufträge: keine Checkbox, der Hinweis steht in der Auftragsbestätigung. */
import type { FastifyRequest } from "fastify";

/** Textversion der Checkbox – bei jeder inhaltlichen Änderung des Checkbox-Texts hochzählen (auch im Frontend: src/lib/consents.js RISK_V). */
export const RISK_V = "2026-10-29";
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

export type RiskProof = { at: string; v: string; ip: string; ua: string; lang: string; via: string; n?: number } | { at: string; missing: true; via: string; n?: number };

/** Nachweis aus dem Request bauen. given = Kunde hat das Häkchen gesetzt (b.riskConsent === true). */
export function riskProof(req: FastifyRequest, b: Record<string, unknown>, via: string, n?: number): RiskProof {
  const at = new Date().toISOString();
  if (b.riskConsent !== true) return { at, missing: true, via, ...(n ? { n } : {}) };
  const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim().slice(0, 60);
  return { at, v: clip(b.riskV, 20) || RISK_V, ip, ua: clip(req.headers["user-agent"], 240), lang: clip(b.lang, 5), via, ...(n ? { n } : {}) };
}
/** Felder, die interne Aufrufer (Chat, Dashboard → POST /order) durchreichen. */
export const riskPass = (b: Record<string, unknown>) => (b.riskConsent === true ? { riskConsent: true, riskV: clip(b.riskV, 20) || RISK_V } : {});
