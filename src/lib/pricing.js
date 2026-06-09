/* ============================================================
   RapidRemove — pricing + currency + language registry
   Currency-aware prices. DE/EU -> EUR, EN/non-EU -> USD.
   ============================================================ */

export const PRICES = {
  de: {
    cur: "€", sym: "€", suffix: true, // "450 €"
    deletion: "450", reset: "850", express: "149",
    protMonthly: "24,90", protMonitor: "69,90", protLifetime: "990",
  },
  en: {
    cur: "$", sym: "$", suffix: false, // "$495"
    deletion: "495", reset: "950", express: "149",
    protMonthly: "24.90", protMonitor: "69.90", protLifetime: "990",
  },
};

export function profileFor(lang) {
  return lang === "en" ? PRICES.en : PRICES.de;
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
