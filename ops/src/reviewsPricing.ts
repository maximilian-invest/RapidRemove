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

export type PricedItem = { old?: boolean; nt?: boolean };

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
  const nNt = items.filter((it) => it && it.nt).length;
  const nOld = items.filter((it) => it && it.old && !it.nt).length;
  const nNew = n - nOld - nNt;
  const ntUnit = mode === "rest" ? 0 : REVIEW_NOTEXT_PRICE;
  const subtotal = nNew * REVIEW_BASE + nOld * (REVIEW_BASE + REVIEW_OLD_SURCHARGE) + nNt * ntUnit;
  const pct = Math.max(reviewDiscountPct(Math.max(n, rateBasis || 0)), Math.max(0, Math.min(10, minPct || 0))); // Mengen- oder Chat-Rabatt, der höhere
  const total = Math.round((subtotal * (100 - pct)) / 100);
  // Vorauszahlung (voller Betrag) für Bewertungen ohne Text, bereits rabattiert. (Name „Deposit“ historisch.)
  const ntDeposit = Math.round((nNt * REVIEW_NOTEXT_PRICE * (100 - pct)) / 100);
  const prices = [nNew ? fmt(REVIEW_BASE) : "", nOld ? fmt(REVIEW_BASE + REVIEW_OLD_SURCHARGE) : "", nNt && ntUnit ? fmt(ntUnit) : ""].filter(Boolean);
  let per = prices.length ? prices.join(" / ") : fmt(REVIEW_BASE);
  if (pct) per += ` (−${pct} %)`;
  return { n, nOld, nNew, nNt, base: REVIEW_BASE, oldPrice: REVIEW_BASE + REVIEW_OLD_SURCHARGE, ntPrice: ntUnit, subtotal, pct, total, discount: subtotal - total, ntDeposit, ntDepositStr: fmt(ntDeposit), per, totalStr: fmt(total), simple: nOld === 0 && nNt === 0 && pct === 0 };
}
