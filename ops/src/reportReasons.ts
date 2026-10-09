/* Meldegrund je Löschung (10/2026): Der Kunde gibt je Bewertung an, gegen welche Google-Richtlinie sie verstößt (reasons.ts).
 * Der Partner sieht diesen Grund bei der Bewertung und wählt beim „Removed" aus, mit welchem Grund er gemeldet hat
 * (Kundengrund vorausgewählt). Gespeichert in partner_tasks.report_reason / report_note / report_at – Nachweis je Bewertung,
 * dass über die offiziellen Meldewege mit einem konkreten Richtlinien-Grund gemeldet wurde.
 * Codes = Kunden-Codes (reasons.ts REASON_CODES) + „legal" (rechtliche Meldung, z. B. Verleumdung). Ohne Imports (kein Zirkelbezug). */
export const REPORT_REASONS = [
  { id: "fake", en: "Fake engagement – not a real customer", de: "Kein echter Kunde / Fake" },
  { id: "conflict", en: "Conflict of interest – competitor or (ex-)employee", de: "Mitbewerber oder (Ex-)Mitarbeiter" },
  { id: "false", en: "False or misleading claims", de: "Falsche Behauptungen" },
  { id: "insult", en: "Harassment / insults", de: "Beleidigung / Belästigung" },
  { id: "offtopic", en: "Off-topic – not about the business", de: "Themenfremd" },
  { id: "hate", en: "Hate speech / discrimination", de: "Hassrede / Diskriminierung" },
  { id: "personal", en: "Personal information of others", de: "Persönliche Daten anderer" },
  { id: "offensive", en: "Offensive or illegal content", de: "Anstößig / illegal" },
  { id: "impersonation", en: "Impersonation", de: "Identitätsbetrug" },
  { id: "legal", en: "Legal removal request (e.g. defamation)", de: "Rechtliche Meldung (z. B. Verleumdung)" },
  { id: "other", en: "Other (describe)", de: "Anderer Grund" },
] as const;
export const REPORT_IDS = REPORT_REASONS.map((r) => r.id) as string[];
export const reportDe = (id: unknown) => REPORT_REASONS.find((r) => r.id === id)?.de || String(id || "");
export const reportEn = (id: unknown) => REPORT_REASONS.find((r) => r.id === id)?.en || String(id || "");
