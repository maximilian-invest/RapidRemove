/* Land → Mail-Sprache.
 *
 * Für Kundenmails, die wir aus dem Admin verschicken: die Sprache soll zum
 * LAND des Kunden passen, nicht bloß zu der Sprache, in der er die Website
 * zufällig geöffnet hat. Nur Sprachen, für die es Mailvorlagen gibt;
 * alles Unbekannte fällt auf Englisch zurück.
 *
 * Zweisprachige Länder sind mit der wirtschaftlich größeren Gruppe belegt
 * (BE → nl, CA → en, CH → de). Im Admin lässt sich die Sprache je Versand
 * überschreiben — die Tabelle liefert nur die Vorauswahl.
 *
 * ACHTUNG: Dieselbe Tabelle steht (bewusst dupliziert, wie die Rang-Leiter der
 * Liga) im Frontend unter src/lib/mail-lang.js — bei Änderungen beide pflegen.
 */

export const MAIL_LANG_BY_COUNTRY: Record<string, string> = {
  // Deutsch (DACH — das Bewertungs-Produkt gibt es dort nicht, die Tabelle
  // gilt aber allgemein für Kundenmails)
  DE: "de", AT: "de", CH: "de", LI: "de",
  // Spanisch
  ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es", UY: "es",
  EC: "es", BO: "es", PY: "es", VE: "es", CR: "es", PA: "es", GT: "es",
  DO: "es", HN: "es", SV: "es", NI: "es", CU: "es", PR: "es",
  // Französisch
  FR: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr", MA: "fr", TN: "fr", DZ: "fr",
  // Italienisch
  IT: "it", SM: "it", VA: "it",
  // Niederländisch (BE: Flandern ist die größere Gruppe — im Admin umstellbar)
  NL: "nl", BE: "nl", SR: "nl", AW: "nl", CW: "nl",
  // Portugiesisch
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt",
  // Japanisch
  JP: "ja",
  // Skandinavisch
  SE: "sv", DK: "da", NO: "no",
  // Englisch (ausdrücklich gelistet, damit sichtbar ist, was abgedeckt ist)
  US: "en", GB: "en", IE: "en", CA: "en", AU: "en", NZ: "en", ZA: "en",
  IN: "en", SG: "en", HK: "en", AE: "en", MT: "en", CY: "en", PH: "en",
  NG: "en", KE: "en",
};

/** Mail-Sprache für ein Land (ISO-2). Unbekannt/leer → Englisch. */
export function mailLangForCountry(country: unknown): string {
  const cc = String(country || "").trim().toUpperCase().slice(0, 2);
  return MAIL_LANG_BY_COUNTRY[cc] || "en";
}
