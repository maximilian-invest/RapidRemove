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

/** cp = individueller Endpreis je Bewertung (im Admin festgelegt): ersetzt Grundpreis, Altersaufschlag und Mengenrabatt.
 *  Genau dieser Betrag wird bei Löschung abgebucht und in Rechnung gestellt (Endpreis inkl. allfälliger USt). */
/** due = Software-Fall NICHT vorab bezahlt (seit 10/2026 Standard: Abbuchung erst bei Erfolg) → zählt auch in „rest" voll. */
export type PricedItem = { old?: boolean; nt?: boolean; sw?: boolean; cp?: number; due?: boolean };
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
/** Chat-Rabatt (Website-Chat, max. 10 %) – gilt NICHT zusätzlich zu PayPal/Wise (−10 %): der höhere zählt. */
export function chatPctOf(raw: unknown): number {
  const r = (raw || {}) as Record<string, unknown>;
  if (r.payPref === "wise" || r.payPref === "paypal") return 0;
  return Math.max(0, Math.min(10, Math.round(Number(r.chatPct) || 0)));
}
export function quoteReviews(items: PricedItem[], cur: string, rateBasis?: number, mode: "full" | "rest" = "full", minPct = 0) {
  const fmt = (v: number) => fmtReviewMoney(v, cur);
  const n = items.length;
  // Individuelle Preise (cp) zählen fest – ohne Aufschlag/Rabatt; der Rest nach Preisliste.
  const fixed = items.filter((it) => cpOf(it) > 0), std = items.filter((it) => !cpOf(it));
  const nNt = std.filter(isSwItem).length; // Software-Fälle (ohne Text + alte US-Bewertungen), Name historisch
  const nOld = std.filter((it) => it && it.old && !isSwItem(it)).length;
  const nNew = std.length - nOld - nNt;
  const ntUnit = mode === "rest" ? 0 : REVIEW_NOTEXT_PRICE;
  const nNtDue = mode === "rest" ? std.filter((it) => isSwItem(it) && it.due).length : 0; // nicht vorab bezahlt → jetzt fällig
  const subStd = nNew * REVIEW_BASE + nOld * (REVIEW_BASE + REVIEW_OLD_SURCHARGE) + nNt * ntUnit + nNtDue * REVIEW_NOTEXT_PRICE;
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
  const subtotal = subStd + cpTotal;
  const total = Math.round((subStd * (100 - pct)) / 100) + cpTotal;
  // Vorauszahlung (voller Betrag) für Bewertungen ohne Text, bereits rabattiert. (Name „Deposit“ historisch.)
  const ntDeposit = Math.round((nNt * REVIEW_NOTEXT_PRICE * (100 - pct)) / 100) + cpSw;
  const prices = [nNew ? fmt(REVIEW_BASE) : "", nOld ? fmt(REVIEW_BASE + REVIEW_OLD_SURCHARGE) : "", nNt && (ntUnit || nNtDue) ? fmt(REVIEW_NOTEXT_PRICE) : "", ...[...cpLines.keys()].map(fmt)].filter(Boolean);
  let per = prices.length ? [...new Set(prices)].join(" / ") : fmt(REVIEW_BASE);
  if (pct) per += ` (−${pct} %)`;
  return { n, nOld, nNew, nNt, nCp: fixed.length, cpLines: [...cpLines.entries()].map(([price, k]) => ({ price, n: k })), cpTotal, base: REVIEW_BASE, oldPrice: REVIEW_BASE + REVIEW_OLD_SURCHARGE, ntPrice: ntUnit, subtotal, pct, total, discount: Math.round((subtotal - total) * 100) / 100, ntDeposit, ntDepositStr: fmt(ntDeposit), per, totalStr: fmt(total), simple: new Set(prices).size <= 1 && pct === 0 };
}
