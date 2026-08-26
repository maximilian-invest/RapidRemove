/* Sprach-Labels für Kundenmails aus dem Admin.
   Welche Sprache eine Mail bekommt, entscheidet die Sprache der Bestellung
   (die, über die der Kunde gekommen ist) — hier stehen nur die Klartext-Namen
   für die Anzeige im Panel. */

export const MAIL_LANGS = [
  { code: "en", label: "Englisch" },
  { code: "es", label: "Spanisch" },
  { code: "fr", label: "Französisch" },
  { code: "it", label: "Italienisch" },
  { code: "nl", label: "Niederländisch" },
  { code: "pt", label: "Portugiesisch" },
  { code: "ja", label: "Japanisch" },
  { code: "sv", label: "Schwedisch" },
  { code: "da", label: "Dänisch" },
  { code: "no", label: "Norwegisch" },
  { code: "de", label: "Deutsch" },
];

export const langLabel = (code) => (MAIL_LANGS.find((l) => l.code === code) || {}).label || String(code || "").toUpperCase();
