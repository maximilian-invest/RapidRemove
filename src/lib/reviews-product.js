/* Produkt „Einzelne Bewertungen löschen" — Verfügbarkeits-Regel.
 *
 * Das Produkt gibt es NICHT in DACH. Verlässliches Signal ist die Sprache
 * (Deutsch = DACH, wie bei den nur-außerhalb-DACH-Mailvorlagen). Ist zusätzlich
 * ein Land bekannt (rr_geo — wird nur mit Geo-Einwilligung gesetzt), sperren
 * auch DE/AT/CH auf nicht-deutschen Seiten.
 *
 * Liegt hier statt im Wizard, weil auch Chrome (Announcement-Banner) die Regel
 * braucht — ein Import des 2300-Zeilen-Wizards würde jede Seite aufblähen. */
export function reviewsBlocked(langCode) {
  if (langCode === "de") return true;
  try {
    const g = JSON.parse(localStorage.getItem("rr_geo") || "null");
    if (g && ["DE", "AT", "CH"].includes(String(g.cc || "").toUpperCase())) return true;
  } catch (e) { /* kein localStorage (SSR/Privatmodus) → nur Sprachregel */ }
  return false;
}
