/* ============================================================
   RapidRemove — pricing + currency + language registry
   Currency-aware prices. DE/EU -> EUR, EN/non-EU -> USD.
   ============================================================ */

export const PRICES = {
  de: {
    cur: "€", sym: "€", suffix: true, // "450 €"
    deletion: "450", reset: "850", express: "149",
    // Einzelne Bewertungen löschen — Preis JE Bewertung (seit 05.11.2026: 199 frisch; ältere/ohne Text pausiert bis Januar 2027).
    // Produkt ist außerhalb DACH verfügbar (siehe REVIEW_COPY/Router-Kachel im Wizard).
    review: "199",
    protMonthly: "24,90", protMonitor: "69,90", protLifetime: "990",
  },
  en: {
    cur: "$", sym: "$", suffix: false, // "$495"
    deletion: "495", reset: "950", express: "149",
    // Wie bei „express" bewusst derselbe Zahlenwert in beiden Währungen.
    review: "199",
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

/* Alle Preise sind NETTO (AGB 6.1: zzgl. allfälliger USt). Nur Wording – an der
   Abrechnung (Stripe/autopay) ändert das nichts.
   VAT_NOTE = Kurzhinweis direkt beim Preis, VAT_LINE = ganzer Satz (Footer, Preis-Erklärungen). */
export const VAT_NOTE = {
  de: "zzgl. USt", en: "excl. VAT", es: "+ IVA", fr: "HT", it: "+ IVA", nl: "excl. btw",
  pt: "+ IVA", ja: "税別", sv: "exkl. moms", da: "ekskl. moms", no: "eks. mva.",
};
export const vatNote = (lang) => VAT_NOTE[lang] || VAT_NOTE.en;
export const VAT_LINE = {
  de: "Alle Preise verstehen sich netto zzgl. allfälliger gesetzlicher USt.",
  en: "All prices are net, excl. any applicable VAT.",
  es: "Todos los precios son netos, IVA aplicable no incluido.",
  fr: "Tous les prix sont indiqués HT, TVA applicable en sus.",
  it: "Tutti i prezzi sono netti, IVA di legge esclusa.",
  nl: "Alle prijzen zijn netto, excl. eventuele btw.",
  pt: "Todos os preços são líquidos; acresce o IVA aplicável.",
  ja: "表示価格はすべて税別です（該当する場合、法定の付加価値税が別途かかります）。",
  sv: "Alla priser är nettopriser exkl. eventuell moms.",
  da: "Alle priser er nettopriser ekskl. eventuel moms.",
  no: "Alle priser er nettopriser eks. eventuell mva.",
};
export const vatLine = (lang) => VAT_LINE[lang] || VAT_LINE.en;

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
/** Reine Sternebewertungen ohne Text: Spezialverfahren, Festpreis (€ und $), abgebucht erst nach Löschung, kein Altersaufschlag. */
export const REVIEW_NOTEXT_PRICE = 300;
/** items: [{ old?: boolean, nt?: boolean }] → { n, nOld, nNew, nNt, base, oldPrice, ntPrice, subtotal, pct, discount, total, ntTotal } */
/** cp = individueller Nettopreis je Bewertung (Admin): ohne Altersaufschlag und Mengenrabatt – synchron mit ops/src/reviewsPricing.ts. */
export const cpOf = (it) => { const v = Number(it && it.cp); return Number.isFinite(v) && v > 0 && v < 100000 ? Math.round(v * 100) / 100 : 0; };
/* ---- Preismodell 2 (16.10.2026) – synchron mit ops/src/reviewsPricing.ts ----
   179 = höchstens 28 Tage alt UND mit Text, 250 = alle anderen (älter, ohne Text, Software). Kein eigener Software-Preis.
   23.10.2026: frisch von 99 zurück auf 179. Bestandsaufträge behalten ihr gespeichertes lp = 99 (PRICE_V2_FRESH_LEGACY).
   Express (+100 je Bewertung, nur 250er, nur bei der Bestellung): Ziel gelöscht in 30 Std. ab Start, sonst entfällt er. */
/* 05.11.2026: frisch 179 → 199. Bestellt bis 05.11.2026 behalten ihr lp = 179. */
export const PRICE_V2_FRESH = 199;
/** Alter Frisch-Preis (bestellt 16.–22.10.2026): nur für gespeicherte lp von Bestandsaufträgen, nie für neue Bestellungen. */
export const PRICE_V2_FRESH_LEGACY = 99;
/** Frisch-Preis 23.10.–05.11.2026 (Bestand). */
export const PRICE_V2_FRESH_LEGACY2 = 179;
export const PRICE_V2_FRESH_LEGACIES = [PRICE_V2_FRESH_LEGACY2, PRICE_V2_FRESH_LEGACY];
export const PRICE_V2_OTHER = 250;
/* Preis nach Land × Branche (06.11.2026) – synchron mit ops/src/reviewsPricing.ts. Nur Einzelbewertungen, nur Neukunden:
   Land des Profils US/CA/GB/AU/CH/NO/DK/SE/JP → 249, sonst 199; Premium-Branche (src/lib/industry.js) +25 % auf 9 gerundet
   → 249 bzw. 309. Bestandskunden: 199 (entscheidet der Server, Wizard fragt /price-quote). */
export const REVIEW_HIGH_COUNTRIES = ["US", "CA", "GB", "AU", "CH", "NO", "DK", "SE", "JP"];
export const REVIEW_HIGH_PRICE = 249;
export const PREMIUM_PCT = 25;
export const round9 = (v) => Math.round((v + 1) / 10) * 10 - 1;
export function freshPriceFor(country, premium) {
  const base = REVIEW_HIGH_COUNTRIES.includes(String(country || "").toUpperCase()) ? REVIEW_HIGH_PRICE : PRICE_V2_FRESH;
  return premium ? round9((base * (100 + PREMIUM_PCT)) / 100) : base;
}
export const PRICE_V2_FRESH_TIERS = [...new Set([PRICE_V2_FRESH, freshPriceFor("US", false), freshPriceFor("AT", true), freshPriceFor("US", true)])];
/* Profil-Löschung nach Branche (06.11.2026) – synchron mit ops/src/reviewsPricing.ts: Premium-Branche +25 % auf 9 gerundet
   (450 → 559 €, $495 → $619, 850 → 1.059 €, $950 → $1.189). Kein Länderaufschlag. Bestandskunden: alter Preis. */
export const PROFILE_BASE = { remove: { eur: 450, usd: 495 }, reset: { eur: 850, usd: 950 } };
export function profilePriceFor(service, cur, premium) {
  const b = PROFILE_BASE[service === "reset" ? "reset" : "remove"][cur === "usd" ? "usd" : "eur"];
  return premium ? round9((b * (100 + PREMIUM_PCT)) / 100) : b;
}
/** Preis-Strings wie PRICES (deletion/reset) für die Anzeige: "559" bzw. "1059" – Tausender-Punkt macht money() nicht, wie bisher "850". */
export const profilePricesStr = (lang, premium) => { const cur = lang === "en" || lang === "ja" ? "usd" : "eur"; return { deletion: String(profilePriceFor("remove", cur, premium)), reset: String(profilePriceFor("reset", cur, premium)) }; };
/** „ab 199" je Sprache (Preis steht erst fest, wenn Profil-Land + Branche bekannt sind). */
const FROM_WORD = { de: "ab", en: "from", es: "desde", fr: "à partir de", it: "da", nl: "vanaf", pt: "a partir de", sv: "från", da: "fra", no: "fra" };
export const fromPrice = (lang, priceStr) => (lang === "ja" ? `${priceStr}〜` : `${FROM_WORD[lang] || FROM_WORD.en} ${priceStr}`);
/** Höchster Frisch-Preis (für „199–309"-Angaben, JSON-LD). */
export const PRICE_V2_FRESH_MAX = Math.max(...PRICE_V2_FRESH_TIERS);
/* Pause (05.11.2026, synchron mit ops/src/reviewsPricing.ts): Bewertungen älter als 4 Wochen und ohne Text (alle 250er, damit
   auch Express) sind 2026 nicht mehr bestellbar → „Wieder verfügbar ab Januar 2027". Bestandsaufträge laufen weiter. */
export const REVIEWS_OTHER_PAUSED = true;
/** Neue Bewertung pausiert? r: { old?, nt?, sw?, days? } */
export const isPausedReview = (r) => {
  if (!REVIEWS_OTHER_PAUSED || !r) return false;
  const d = Number(r.days);
  return !!(r.old || r.nt || r.sw) || (r.days != null && Number.isFinite(d) && d > REVIEW_OLD_DAYS);
};
export const REVIEW_PAUSE_COPY = {
  de: "Wieder verfügbar ab Januar 2027", en: "Available again from January 2027", es: "Disponible de nuevo a partir de enero de 2027",
  fr: "De nouveau disponible à partir de janvier 2027", it: "Di nuovo disponibile da gennaio 2027", nl: "Weer beschikbaar vanaf januari 2027",
  pt: "Disponível novamente a partir de janeiro de 2027", ja: "2027年1月から再び受付", sv: "Tillgängligt igen från januari 2027",
  da: "Tilgængelig igen fra januar 2027", no: "Tilgjengelig igjen fra januar 2027",
};
export const reviewPauseText = (lang) => REVIEW_PAUSE_COPY[lang] || REVIEW_PAUSE_COPY.en;
/** Hinweis, wenn der Kunde trotzdem eine pausierte Bewertung im Auftrag hat (Fehlermeldung beim Bestellen). */
export const REVIEW_PAUSE_ERR = {
  de: "Bewertungen älter als 4 Wochen und reine Sternebewertungen ohne Text nehmen wir derzeit nicht an – wieder verfügbar ab Januar 2027. Bitte entfernen Sie sie aus der Auswahl.",
  en: "We currently don't accept reviews older than 4 weeks or star-only ratings without text – available again from January 2027. Please remove them from your selection.",
  es: "Ahora mismo no aceptamos reseñas de más de 4 semanas ni valoraciones sin texto – disponible de nuevo a partir de enero de 2027. Quítalas de tu selección.",
  fr: "Nous n'acceptons pas actuellement les avis de plus de 4 semaines ni les notes sans texte – de nouveau disponible à partir de janvier 2027. Retirez-les de votre sélection.",
  it: "Al momento non accettiamo recensioni più vecchie di 4 settimane né valutazioni senza testo – di nuovo disponibile da gennaio 2027. Rimuovile dalla selezione.",
  nl: "We nemen momenteel geen reviews ouder dan 4 weken of beoordelingen zonder tekst aan – weer beschikbaar vanaf januari 2027. Haal ze uit je selectie.",
  pt: "De momento não aceitamos avaliações com mais de 4 semanas nem classificações sem texto – disponível novamente a partir de janeiro de 2027. Retire-as da seleção.",
  ja: "投稿から4週間を超えた口コミと、本文のない星だけの評価は現在お受けしていません（2027年1月から再び受付）。選択から外してください。",
  sv: "Vi tar just nu inte emot omdömen äldre än 4 veckor eller betyg utan text – tillgängligt igen från januari 2027. Ta bort dem från ditt urval.",
  da: "Vi tager i øjeblikket ikke imod anmeldelser ældre end 4 uger eller bedømmelser uden tekst – tilgængelig igen fra januar 2027. Fjern dem fra dit valg.",
  no: "Vi tar for øyeblikket ikke imot omtaler eldre enn 4 uker eller vurderinger uten tekst – tilgjengelig igjen fra januar 2027. Fjern dem fra utvalget ditt.",
};
export const reviewPauseErr = (lang) => REVIEW_PAUSE_ERR[lang] || REVIEW_PAUSE_ERR.en;
export const EXPRESS_FEE = 100;
export const EXPRESS_HOURS = 30;
/* Express-Frist (17.10.2026, synchron mit ops/src/reviewsPricing.ts): Start Mo 0:00 – Fr 12:00 Wiener Zeit → 30 Std.;
   Start Fr 12:00 – So 24:00 → spätestens Dienstag 24:00 Wiener Zeit (Express am Wochenende nicht verfügbar). */
const VIE_FMT = (() => { try { return new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Vienna", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" }); } catch (e) { return null; } })();
const VIE_WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function vieParts(ms) {
  const o = {};
  if (VIE_FMT) for (const x of VIE_FMT.formatToParts(new Date(ms))) o[x.type] = x.value;
  else { const d = new Date(ms + 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(), wd: d.getUTCDay() }; }
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second, wd: VIE_WD[o.weekday] ?? 0 };
}
const vieOffset = (ms) => { const p = vieParts(ms); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; };
const vieToUtc = (y, m, d, h = 0, mi = 0) => { const g = Date.UTC(y, m - 1, d, h, mi); let t = g - vieOffset(g); return g - vieOffset(t); };
/** Wochenend-Regel (Start Fr ab 12:00 bis So 24:00, Wiener Zeit)? */
export const expressWeekend = (startMs = Date.now()) => { const p = vieParts(startMs); return p.wd === 6 || p.wd === 0 || (p.wd === 5 && p.h >= 12); };
/** Zusage an den Kunden (ms): 30 Std. bzw. Dienstag 24:00 Wiener Zeit. */
export function expressDueMs(startMs = Date.now()) {
  if (!expressWeekend(startMs)) return startMs + EXPRESS_HOURS * 3600e3;
  const p = vieParts(startMs);
  return vieToUtc(p.y, p.m, p.d + ((3 - p.wd + 7) % 7), 0, 0);
}
/** Veraltet – Kundenanzeige kommt aus src/lib/durations.js (Admin → Express & Löschdauer). */
export const STD_DAYS = { fresh: [3, 5], other: [1, 2] };
/** fresh = Frisch-Preis dieses Auftrags (Land × Branche); Standard 199. */
export const listPriceV2 = (it, fresh = PRICE_V2_FRESH) => {
  const d = Number(it && it.days);
  const old = !!(it && it.old) || (it && it.days != null && Number.isFinite(d) && d > REVIEW_OLD_DAYS);
  return it && (it.nt || it.sw || old) ? PRICE_V2_OTHER : (PRICE_V2_FRESH_TIERS.includes(fresh) ? fresh : PRICE_V2_FRESH);
};
export const isFreshLp = (v) => PRICE_V2_FRESH_TIERS.includes(v) || PRICE_V2_FRESH_LEGACIES.includes(v);
export const lpOf = (it) => { const v = Number(it && it.lp); return isFreshLp(v) || v === PRICE_V2_OTHER ? v : 0; };
/** Bestellung (neu): Preismodell 2. items: [{ old?, nt?, sw?, days?, cp?, lp?, x? }]. opts.legacy = Bestandsauftrag:
 *  Bewertungen ohne lp nach Preismodell 1 rechnen (179/+50/300). opts.express = Express für alle 250er (Bestellprozess). */
export function reviewQuote(items, lang, opts = {}) {
  const list0 = Array.isArray(items) ? items : [];
  // opts.fresh = Frisch-Preis für diesen Kunden/dieses Profil (Land × Branche, vom Server bestätigt) – Standard 199.
  const fresh = PRICE_V2_FRESH_TIERS.includes(Number(opts.fresh)) ? Number(opts.fresh) : PRICE_V2_FRESH;
  const list = opts.legacy ? list0 : list0.map((it) => (cpOf(it) || lpOf(it) ? it : { ...it, lp: listPriceV2(it, fresh) }));
  const v2 = list.filter((it) => !cpOf(it) && lpOf(it));
  if (!v2.length) return reviewQuoteV1(list, lang);
  const v1 = reviewQuoteV1(list.filter((it) => cpOf(it) || !lpOf(it)), lang);
  // n99 = frische Bewertungen (Name historisch): 179 neu bzw. 99 aus Bestandsaufträgen – jeweils mit gespeichertem lp.
  const n99 = v2.filter((it) => isFreshLp(lpOf(it))).length, n250 = v2.length - n99;
  const nFreshNew = v2.filter((it) => lpOf(it) === PRICE_V2_FRESH).length, nFreshOld = n99 - nFreshNew;
  const nX = v2.filter((it) => lpOf(it) === PRICE_V2_OTHER && (opts.express || it.x)).length;
  const xTotal = nX * EXPRESS_FEE;
  const n = list.length;
  const pct = reviewDiscountPct(n);
  const subFreshOld = v2.map(lpOf).filter((v) => isFreshLp(v) && v !== PRICE_V2_FRESH).reduce((a, b) => a + b, 0); // Bestand 179/99 je mit IHREM lp
  const subV2 = nFreshNew * PRICE_V2_FRESH + subFreshOld + n250 * PRICE_V2_OTHER;
  const subStd = subV2 + (v1.subtotal - v1.cpTotal);
  const total = Math.round(subStd * (100 - pct) / 100) + v1.cpTotal + xTotal;
  const subtotal = subStd + v1.cpTotal + xTotal;
  return { ...v1, n, pct, subtotal, total, discount: subtotal - total, n99, n250, nFreshNew, nFreshOld, nX, xTotal, xFee: EXPRESS_FEE, p99: fresh, p99Old: PRICE_V2_FRESH_LEGACY, p250: PRICE_V2_OTHER, v2: true,
    base: fresh, ntTotal: v1.ntTotal };
}
function reviewQuoteV1(items, lang) {
  const base = 179; // Preismodell 1 (Bestandsaufträge)
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
  return { n, nOld, nNew, nNt, nCp: fixed.length, cpTotal, base, oldPrice: base + REVIEW_OLD_SURCHARGE, ntPrice: REVIEW_NOTEXT_PRICE, subtotal, pct, discount: subtotal - total, total, ntTotal, n99: 0, n250: 0, nX: 0, xTotal: 0, xFee: EXPRESS_FEE, v2: false };
}

/* Verfahren je Bewertung (Partner-Regel 10/2026, synchron mit ops/src/reviewsPricing.ts):
   "sw"    Software: ohne Text (alle Länder) oder älter als 4 Wochen mit Text aus den USA → 300; nach unserer Prüfung
           bestätigt der Kunde (Zahlungsart hinterlegt), abgebucht wird erst bei erfolgreicher Löschung.
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
