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
/** Reine Sternebewertungen ohne Text: Spezialverfahren, Festpreis (€ und $), Vorauszahlung, kein Altersaufschlag. */
export const REVIEW_NOTEXT_PRICE = 300;
/** items: [{ old?: boolean, nt?: boolean }] → { n, nOld, nNew, nNt, base, oldPrice, ntPrice, subtotal, pct, discount, total, ntTotal } */
/** cp = individueller Endpreis je Bewertung (Admin): ohne Altersaufschlag und Mengenrabatt – synchron mit ops/src/reviewsPricing.ts. */
export const cpOf = (it) => { const v = Number(it && it.cp); return Number.isFinite(v) && v > 0 && v < 100000 ? Math.round(v * 100) / 100 : 0; };
export function reviewQuote(items, lang) {
  const base = Number(String(profileFor(lang).review).replace(",", ".")) || 179;
  const list = Array.isArray(items) ? items : [];
  const n = list.length;
  const std = list.filter((it) => !cpOf(it)), fixed = list.filter((it) => cpOf(it));
  const nNt = std.filter((it) => it && (it.nt || it.sw)).length; // Software-Fälle (ohne Text + alte US-Bewertungen)
  const nOld = std.filter((it) => it && it.old && !it.nt && !it.sw).length;
  const nNew = std.length - nOld - nNt;
  const cpTotal = Math.round(fixed.reduce((s, it) => s + cpOf(it), 0) * 100) / 100;
  const subStd = nNew * base + nOld * (base + REVIEW_OLD_SURCHARGE) + nNt * REVIEW_NOTEXT_PRICE;
  const pct = std.length ? reviewDiscountPct(n) : 0;
  const total = Math.round(subStd * (100 - pct) / 100) + cpTotal;
  const subtotal = subStd + cpTotal;
  const ntTotal = Math.round(nNt * REVIEW_NOTEXT_PRICE * (100 - pct) / 100) + fixed.filter((it) => it.nt || it.sw).reduce((s, it) => s + cpOf(it), 0);
  return { n, nOld, nNew, nNt, nCp: fixed.length, cpTotal, base, oldPrice: base + REVIEW_OLD_SURCHARGE, ntPrice: REVIEW_NOTEXT_PRICE, subtotal, pct, discount: subtotal - total, total, ntTotal };
}

/* Verfahren je Bewertung (Partner-Regel 10/2026, synchron mit ops/src/reviewsPricing.ts):
   "sw"    Software: ohne Text (alle Länder) oder älter als 4 Wochen mit Text aus den USA → 300, vorab,
           aber erst nach unserer Prüfung (Zahlungsaufforderung, wenn der Partner Software bestätigt).
   "legal" älter als 4 Wochen, andere Länder → erst rechtliche Meldung (90 %+), Zahlung nach Löschung.
   "std"   bis 4 Wochen → Zahlung nach Löschung. */
export function reviewMethod({ hasText, days }, country) {
  if (!hasText) return "sw";
  if (!(days > REVIEW_OLD_DAYS)) return "std";
  return country === "US" ? "sw" : "legal";
}
const COUNTRY_RE = [[/vereinigte staaten|united states|\busa\b|états-unis|estados unidos|stati uniti|verenigde staten|förenta staterna|forenede stater|アメリカ/i, "US"],
  [/deutschland|germany|allemagne|alemania|germania|duitsland|tyskland|ドイツ/i, "DE"], [/österreich|austria|autriche|oostenrijk|østrig|österrike/i, "AT"],
  [/schweiz|switzerland|suisse|svizzera|suiza|zwitserland/i, "CH"], [/vereinigtes königreich|united kingdom|\buk\b|royaume-uni|reino unido|regno unito|england|scotland|wales/i, "GB"],
  [/kanada|canada/i, "CA"], [/australien|australia/i, "AU"],
  [/italien|italy|italia|italie/i, "IT"], [/frankreich|france|francia|frankrijk/i, "FR"], [/spanien|spain|españa|espagne|spagna/i, "ES"],
  [/niederlande|netherlands|nederland|pays-bas|países bajos/i, "NL"], [/belgien|belgium|belgique|belgië|bélgica/i, "BE"], [/luxemburg|luxembourg/i, "LU"],
  [/portugal/i, "PT"], [/irland|ireland|irlande|éire/i, "IE"], [/schweden|sweden|sverige|suède/i, "SE"], [/dänemark|denmark|danmark|danemark/i, "DK"],
  [/norwegen|norway|norge|norvège/i, "NO"], [/finnland|finland|suomi/i, "FI"], [/polen|poland|polska|pologne/i, "PL"],
  [/tschechien|czechia|czech republic|česko/i, "CZ"], [/ungarn|hungary|magyarország/i, "HU"], [/slowenien|slovenia|slovenija/i, "SI"],
  [/kroatien|croatia|hrvatska/i, "HR"], [/griechenland|greece|ελλάδα/i, "GR"], [/liechtenstein/i, "LI"], [/neuseeland|new zealand/i, "NZ"],
  [/arabische emirate|arab emirates|\buae\b/i, "AE"], [/japan|日本/i, "JP"]];
/** Land eines Google-Profils aus der Adresse („…, Austin, TX 78701, USA" → "US"). Unbekannt → "". */
export function addrCountry(addr) {
  const a = String(addr || "").trim(); if (!a) return "";
  const last = a.split(",").pop() || "";
  for (const [re, c] of COUNTRY_RE) if (re.test(last)) return c;
  // US-Adresse ohne Ländernamen: „Austin, TX 78701"
  if (/,\s*[A-Z]{2}\s+\d{5}(-\d{4})?\s*$/.test(a)) return "US";
  return "";
}
