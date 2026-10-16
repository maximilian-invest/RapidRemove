/* Einzelbewertungs-Produkt: Preislogik (synchron mit src/lib/pricing.js der Website).
 * 179 je Bewertung (€ und $), +50 für Bewertungen älter als 4 Wochen,
 * Mengenrabatt: ab 3 −10 %, ab 5 −15 %, ab 10 −30 %. */
export const REVIEW_BASE = 179;
export const REVIEW_OLD_SURCHARGE = 50;
export const reviewDiscountPct = (n: number) => (n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0);

/** Reine Sternebewertungen ohne Text: Spezialverfahren (Software), Festpreis, kein Altersaufschlag.
 *  Zahlung: voller Betrag im Voraus bei Annahme (99 % Erfolg, sonst Erstattung nach spätestens 14 Tagen)
 *  → in der Abrechnung nach der Löschung (mode "rest") kostet sie nichts mehr. */
export const REVIEW_NOTEXT_PRICE = 300;
export const REVIEW_NOTEXT_HALF = REVIEW_NOTEXT_PRICE / 2; // alt (50/50), nur noch für Bestandsfälle

/* ---- Preismodell 2 (16.10.2026, Maximilian): nur noch ZWEI Preise je Bewertung, gleicher Zahlenwert in € und $ ----
 *  99  = frisch: höchstens 28 Tage alt UND mit Text
 *  250 = alles andere (älter, ohne Text, Software) – der Kunde sieht keinen eigenen Software-Preis mehr.
 *  Intern bleibt die Einstufung std/legal/sw (Partnerpreis!). Neue Bewertungen bekommen bei der Bestellung lp (Listenpreis)
 *  festgeschrieben; Bestandsaufträge ohne lp laufen unverändert nach Preismodell 1 (179/+50/300).
 *  Mengenrabatt gilt auf lp wie bisher. Express (+100 je Bewertung, nur 250er): x = bestellt; abgerechnet nur, wenn die
 *  Bewertung innerhalb von EXPRESS_CUSTOMER_H Stunden ab Express-Start gelöscht wurde (xOk) – sonst entfällt der Aufschlag. */
export const PRICE_V2_FRESH = 99;
export const PRICE_V2_OTHER = 250;
export const EXPRESS_FEE = 100;
export const EXPRESS_CUSTOMER_H = 30; // Zusage an den Kunden
export const EXPRESS_PARTNER_H = 24;  // Timer beim Partner (6 Std. Puffer)
/** Listenpreis (Modell 2) aus den Bestell-Flags: frisch (≤ 28 Tage, mit Text) → 99, sonst 250. */
export const listPriceV2 = (it: { old?: boolean; nt?: boolean; sw?: boolean; text?: string | null; rating?: number | null; days?: number | null }): number => {
  const days = Number(it.days);
  const old = it.old === true || (Number.isFinite(days) && it.days !== null && it.days !== undefined && days > 28);
  return it.nt || it.sw || old ? PRICE_V2_OTHER : PRICE_V2_FRESH;
};
/** Listenpreis einer gespeicherten Bewertung (0 = Bestandsauftrag, Preismodell 1). */
export const lpOf = (it: { lp?: unknown } | null | undefined): number => { const v = Number(it?.lp); return v === PRICE_V2_FRESH || v === PRICE_V2_OTHER ? v : 0; };
/** Express-Zusage eingehalten? (gelöscht ≤ 30 Std. nach Express-Start) */
export function expressMet(startIso: string | null | undefined, removedIso: string | null | undefined): boolean {
  const a = Date.parse(String(startIso || "")), b = Date.parse(String(removedIso || ""));
  return Number.isFinite(a) && Number.isFinite(b) && b >= a - 60_000 && b - a <= EXPRESS_CUSTOMER_H * 3600_000;
}

/** cp = individueller Nettopreis je Bewertung (im Admin festgelegt): ersetzt Grundpreis, Altersaufschlag und Mengenrabatt.
 *  Genau dieser Betrag wird bei Löschung in Rechnung gestellt (netto, allfällige USt obendrauf – AGB 6.1). */
/** due = Software-Fall NICHT vorab bezahlt (seit 10/2026 Standard: Abbuchung erst bei Erfolg) → zählt auch in „rest" voll. */
export type PricedItem = { old?: boolean; nt?: boolean; sw?: boolean; cp?: number; due?: boolean; lp?: number; x?: boolean; xOk?: boolean };
export const cpOf = (it: { cp?: unknown } | null | undefined): number => { const v = Number(it?.cp); return Number.isFinite(v) && v > 0 && v < 100000 ? Math.round(v * 100) / 100 : 0; };

/** Verfahren je Bewertung (Partner-Regel, 10/2026):
 *  - "sw"    Software, voller Betrag im Voraus: ohne Text (alle Länder) und älter als 4 Wochen mit Text aus den USA
 *            → Google entfernt die in der Regel nicht von Hand.
 *  - "legal" Rechtliche Meldung: älter als 4 Wochen mit Text, andere Länder → 90 %+ Erfolg, Zahlung nach Löschung;
 *            was danach bleibt, geht nur noch per Software (Partner setzt „software" → Angebot im Dashboard).
 *  - "std"   bis 4 Wochen alt, mit Text → Zahlung nach Löschung. */
export type ReviewMethod = "sw" | "legal" | "std";
export const isSwItem = (it: PricedItem | null | undefined) => !!it && (!!it.nt || !!it.sw);
export function reviewMethod(it: { old?: boolean; nt?: boolean; sw?: boolean; text?: string; days?: number }, country: string): ReviewMethod {
  if (it.nt || it.sw) return "sw";
  const old = it.old === true || (Number.isFinite(Number(it.days)) && Number(it.days) > 28);
  if (!old) return "std";
  return String(country || "").toUpperCase() === "US" ? "sw" : "legal";
}

/** Betrag in der Währung der Bestellung ("$179" / "179 €", Cent nur wenn nötig). */
export const fmtReviewMoney = (v: number, cur: string) => {
  const o = { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 };
  return cur === "usd" ? `$${v.toLocaleString("en-US", o)}` : `${v.toLocaleString("de-DE", o)} €`;
};

/** rateBasis: Anzahl, nach der sich der Mengenrabatt richtet (Standard: items.length).
 *  Bei Einzelabrechnung pro Bewertung = Anzahl der beauftragten Bewertungen → der
 *  Rabatt wird anteilig auf jede einzeln abgerechnete Bewertung verteilt. */
/** mode "rest": Abrechnung nach der Löschung → Bewertungen ohne Text sind schon voll bezahlt (0). */
/** Chat-Rabatt (Website-Chat, max. 10 %) – gilt NICHT zusätzlich zu PayPal/Wise: dann zählt nur PayPal/Wise (payPctOf).
 *  Zum Mengenrabatt: der höhere zählt (minPct in quoteReviews). */
export function chatPctOf(raw: unknown): number {
  const r = (raw || {}) as Record<string, unknown>;
  if (r.payPref === "wise" || r.payPref === "paypal") return 0;
  return Math.max(0, Math.min(10, Math.round(Number(r.chatPct) || 0)));
}
/** PayPal/Wise gewählt → −10 % ZUSÄTZLICH zum Mengenrabatt (09.10.2026, mit Maximilian: Rabatte addieren). */
export function payPctOf(raw: unknown): number {
  const r = (raw || {}) as Record<string, unknown>;
  return r.payPref === "wise" || r.payPref === "paypal" ? 10 : 0;
}
export function quoteReviews(items: PricedItem[], cur: string, rateBasis?: number, mode: "full" | "rest" = "full", minPct = 0, payPct = 0) {
  const fmt = (v: number) => fmtReviewMoney(v, cur);
  const n = items.length;
  // Individuelle Preise (cp) zählen fest – ohne Aufschlag/Rabatt; der Rest nach Preisliste.
  const fixed = items.filter((it) => cpOf(it) > 0), std = items.filter((it) => !cpOf(it));
  // Preismodell 2: Bewertungen mit Listenpreis (lp) – wie normale Bewertungen abgerechnet (nach der Löschung, rabattiert).
  const v2 = std.filter((it) => lpOf(it) > 0), v1 = std.filter((it) => !lpOf(it));
  const nNt = v1.filter(isSwItem).length; // Software-Fälle (ohne Text + alte US-Bewertungen), Name historisch
  const nOld = v1.filter((it) => it && it.old && !isSwItem(it)).length;
  const nNew = v1.length - nOld - nNt;
  const n99 = v2.filter((it) => lpOf(it) === PRICE_V2_FRESH).length, n250 = v2.length - n99;
  // Express: „full" = bestellt (Maximalbetrag), „rest" = nur eingehaltene (xOk). Ohne Rabatt.
  const nX = v2.filter((it) => lpOf(it) === PRICE_V2_OTHER && it.x && (mode === "full" || it.xOk)).length;
  const xTotal = nX * EXPRESS_FEE;
  const ntUnit = mode === "rest" ? 0 : REVIEW_NOTEXT_PRICE;
  const nNtDue = mode === "rest" ? std.filter((it) => isSwItem(it) && it.due).length : 0; // nicht vorab bezahlt → jetzt fällig
  const subStd = nNew * REVIEW_BASE + nOld * (REVIEW_BASE + REVIEW_OLD_SURCHARGE) + nNt * ntUnit + nNtDue * REVIEW_NOTEXT_PRICE + n99 * PRICE_V2_FRESH + n250 * PRICE_V2_OTHER;
  const pct = std.length ? Math.max(reviewDiscountPct(Math.max(n, rateBasis || 0)), Math.max(0, Math.min(10, minPct || 0))) : 0; // Mengen- oder Chat-Rabatt, der höhere
  // Software-Fälle mit eigenem Preis sind (wie alle Software-Fälle) vorab bezahlt → in „rest" 0.
  const cpLines = new Map<number, number>();
  let cpTotal = 0, cpSw = 0;
  for (const it of fixed) {
    const v = mode === "rest" && isSwItem(it) && !it.due ? 0 : cpOf(it);
    cpTotal += v; if (isSwItem(it)) cpSw += cpOf(it);
    if (v) cpLines.set(v, (cpLines.get(v) || 0) + 1);
  }
  cpTotal = Math.round(cpTotal * 100) / 100;
  const subtotal = subStd + cpTotal + xTotal;
  const pay = Math.max(0, Math.min(10, payPct || 0)); // PayPal/Wise: auf den Betrag nach Mengen-/Chat-Rabatt
  const total = (pay ? Math.round(((Math.round((subStd * (100 - pct)) / 100) + cpTotal) * (100 - pay)) / 100) : Math.round((subStd * (100 - pct)) / 100) + cpTotal) + xTotal;
  // Vorauszahlung (voller Betrag) für Bewertungen ohne Text, bereits rabattiert. (Name „Deposit“ historisch.)
  const ntDeposit = Math.round(((Math.round((nNt * REVIEW_NOTEXT_PRICE * (100 - pct)) / 100) + cpSw) * (100 - pay)) / 100);
  const prices = [nNew ? fmt(REVIEW_BASE) : "", nOld ? fmt(REVIEW_BASE + REVIEW_OLD_SURCHARGE) : "", nNt && (ntUnit || nNtDue) ? fmt(REVIEW_NOTEXT_PRICE) : "", n99 ? fmt(PRICE_V2_FRESH) : "", n250 ? fmt(PRICE_V2_OTHER) : "", ...[...cpLines.keys()].map(fmt)].filter(Boolean);
  let per = prices.length ? [...new Set(prices)].join(" / ") : fmt(v2.length || !v1.length ? PRICE_V2_FRESH : REVIEW_BASE);
  if (pct) per += ` (−${pct} %)`;
  if (pay) per += ` (−${pay} %)`;
  return { n, nOld, nNew, nNt, n99, n250, nX, xTotal, xFee: EXPRESS_FEE, nCp: fixed.length, cpLines: [...cpLines.entries()].map(([price, k]) => ({ price, n: k })), cpTotal, base: REVIEW_BASE, oldPrice: REVIEW_BASE + REVIEW_OLD_SURCHARGE, ntPrice: ntUnit, subtotal, pct, total, discount: Math.round((subtotal - total) * 100) / 100, ntDeposit, ntDepositStr: fmt(ntDeposit), per, totalStr: fmt(total), simple: new Set(prices).size <= 1 && pct === 0 && !pay && !v2.length && !xTotal, payPct: pay };
}
