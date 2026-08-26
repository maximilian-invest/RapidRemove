/* Land → Mail-Sprache (Admin-Seite).
 *
 * Bestimmt, in welcher Sprache eine Kundenmail aus dem Admin rausgeht: nach dem
 * LAND des Kunden, nicht nach der Sprache, in der er die Website zufällig
 * geöffnet hat. Der Admin kann die Vorauswahl je Versand überschreiben.
 *
 * ACHTUNG: Spiegelbild von ops/src/mailLangByCountry.ts (getrennte Deployments,
 * daher bewusst dupliziert wie die Rang-Leiter der Liga) — beide pflegen. */

export const MAIL_LANG_BY_COUNTRY = {
  DE: "de", AT: "de", CH: "de", LI: "de",
  ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", UY: "es",
  EC: "es", BO: "es", PY: "es", VE: "es", CR: "es", PA: "es", GT: "es",
  DO: "es", HN: "es", SV: "es", NI: "es", CU: "es", PR: "es",
  FR: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr", MA: "fr", TN: "fr", DZ: "fr",
  IT: "it", SM: "it", VA: "it",
  NL: "nl", BE: "nl", SR: "nl", AW: "nl", CW: "nl",
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt",
  JP: "ja",
  SE: "sv", DK: "da", NO: "no",
  US: "en", GB: "en", IE: "en", CA: "en", AU: "en", NZ: "en", ZA: "en",
  IN: "en", SG: "en", HK: "en", AE: "en", MT: "en", CY: "en", PH: "en",
  NG: "en", KE: "en",
};

/** Sprachen, für die es Mailvorlagen gibt (Reihenfolge = Anzeige im Admin). */
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

/** Mail-Sprache für ein Land (ISO-2). Unbekannt/leer → null (Aufrufer entscheidet). */
export function mailLangForCountry(country) {
  const cc = String(country || "").trim().toUpperCase().slice(0, 2);
  return MAIL_LANG_BY_COUNTRY[cc] || null;
}
