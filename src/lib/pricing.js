/* ============================================================
   RapidRemove — pricing + currency + language registry
   Currency-aware prices. DE/EU -> EUR, EN/non-EU -> USD.
   ============================================================ */

export const PRICES = {
  de: {
    cur: "€", sym: "€", suffix: true, // "450 €"
    deletion: "450", reset: "850", express: "149",
    // Einzelne Bewertungen löschen — Preis JE Bewertung. Produkt ist außerhalb
    // DACH verfügbar (siehe REVIEW_COPY/Router-Kachel im Wizard).
    review: "179",
    protMonthly: "24,90", protMonitor: "69,90", protLifetime: "990",
  },
  en: {
    cur: "$", sym: "$", suffix: false, // "$495"
    deletion: "495", reset: "950", express: "149",
    // Wie bei „express" bewusst derselbe Zahlenwert in beiden Währungen.
    review: "179",
    protMonthly: "24.90", protMonitor: "69.90", protLifetime: "990",
  },
};

export function profileFor(lang) {
  // EN + JA sind Nicht-EU-Märkte -> USD; alle übrigen Sprachen -> EUR.
  return lang === "en" || lang === "ja" ? PRICES.en : PRICES.de;
}

export function money(lang, amount) {
  const p = profileFor(lang);
  return p.suffix ? `${amount} ${p.sym}` : `${p.sym}${amount}`;
}

// Language registry (native names) — drives the language menu.
export const LANGS = [
  { code: "de", native: "Deutsch",    region: "DACH" },
  { code: "en", native: "English",    region: "International" },
  { code: "es", native: "Español",    region: "España · LatAm" },
  { code: "fr", native: "Français",   region: "France · BE · CH" },
  { code: "it", native: "Italiano",   region: "Italia" },
  { code: "nl", native: "Nederlands", region: "NL · BE" },
  { code: "pt", native: "Português",  region: "PT · Brasil" },
  { code: "ja", native: "日本語",      region: "日本" },
  { code: "sv", native: "Svenska",     region: "Sverige" },
  { code: "da", native: "Dansk",       region: "Danmark" },
  { code: "no", native: "Norsk",       region: "Norge" },
];

/* Einzelbewertungs-Produkt: Aufpreis für Bewertungen älter als 4 Wochen
   (gleicher Zahlenwert in € und $) und Mengenrabatt nach Anzahl. Dieselbe
   Rechnung steht im ops-Backend (ops/src/reviewsPricing.ts) – beide synchron halten. */
export const REVIEW_OLD_DAYS = 28;
export const REVIEW_OLD_SURCHARGE = 50;
export function reviewDiscountPct(n) {
  return n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0;
}
/** items: [{ old?: boolean }] → { n, nOld, nNew, base, oldPrice, subtotal, pct, discount, total } */
export function reviewQuote(items, lang) {
  const base = Number(String(profileFor(lang).review).replace(",", ".")) || 179;
  const list = Array.isArray(items) ? items : [];
  const n = list.length;
  const nOld = list.filter((it) => it && it.old).length;
  const subtotal = n * base + nOld * REVIEW_OLD_SURCHARGE;
  const pct = reviewDiscountPct(n);
  const total = Math.round(subtotal * (100 - pct) / 100);
  return { n, nOld, nNew: n - nOld, base, oldPrice: base + REVIEW_OLD_SURCHARGE, subtotal, pct, discount: subtotal - total, total };
}
