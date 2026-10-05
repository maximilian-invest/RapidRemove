/* Einzelbewertungs-Produkt: Preislogik (synchron mit src/lib/pricing.js der Website).
 * 179 je Bewertung (€ und $), +50 für Bewertungen älter als 4 Wochen,
 * Mengenrabatt: ab 3 −10 %, ab 5 −15 %, ab 10 −30 %. */
export const REVIEW_BASE = 179;
export const REVIEW_OLD_SURCHARGE = 50;
export const reviewDiscountPct = (n: number) => (n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0);

export type PricedItem = { old?: boolean };

/** Betrag in der Währung der Bestellung ("$179" / "179 €", Cent nur wenn nötig). */
export const fmtReviewMoney = (v: number, cur: string) => {
  const o = { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 };
  return cur === "usd" ? `$${v.toLocaleString("en-US", o)}` : `${v.toLocaleString("de-DE", o)} €`;
};

/** rateBasis: Anzahl, nach der sich der Mengenrabatt richtet (Standard: items.length).
 *  Bei Einzelabrechnung pro Bewertung = Anzahl der beauftragten Bewertungen → der
 *  Rabatt wird anteilig auf jede einzeln abgerechnete Bewertung verteilt. */
export function quoteReviews(items: PricedItem[], cur: string, rateBasis?: number) {
  const fmt = (v: number) => fmtReviewMoney(v, cur);
  const n = items.length;
  const nOld = items.filter((it) => it && it.old).length;
  const subtotal = n * REVIEW_BASE + nOld * REVIEW_OLD_SURCHARGE;
  const pct = reviewDiscountPct(Math.max(n, rateBasis || 0));
  const total = Math.round((subtotal * (100 - pct)) / 100);
  let per = nOld === 0 ? fmt(REVIEW_BASE) : nOld === n ? fmt(REVIEW_BASE + REVIEW_OLD_SURCHARGE) : `${fmt(REVIEW_BASE)} / ${fmt(REVIEW_BASE + REVIEW_OLD_SURCHARGE)}`;
  if (pct) per += ` (−${pct} %)`;
  return { n, nOld, nNew: n - nOld, base: REVIEW_BASE, oldPrice: REVIEW_BASE + REVIEW_OLD_SURCHARGE, subtotal, pct, total, discount: subtotal - total, per, totalStr: fmt(total), simple: nOld === 0 && pct === 0 };
}
