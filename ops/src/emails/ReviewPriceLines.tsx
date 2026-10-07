/* Preisaufstellung für Bewertungs-Mails (Auftragsbestätigung, Startbestätigung):
   die exakten Preise der Bestellung — Anzahl × Stückpreis je Alter, Mengenrabatt,
   Gesamtbetrag falls alle gelöscht werden. Rechnet mit derselben Logik wie
   Wizard und Rechnung (reviewsPricing.ts). Wird in eine NoteBox eingesetzt. */
import * as React from "react";
import { brand } from "./components";
import { quoteReviews, fmtReviewMoney, type PricedItem } from "../reviewsPricing";

interface Labels { h: string; newL: string; oldL: string; ntL: string; subA: string; subS: string; disc: string; total: string; note: string }

const L: Record<string, Labels> = {
  de: { ntL: "Software-Löschung – vorab, erst nach unserer Prüfung", subA: "Zahlung nach Löschung (max.)", subS: "Software – vorab nach unserer Prüfung", h: "Ihre Preise", newL: "bis 4 Wochen alt", oldL: "älter als 4 Wochen", disc: "Mengenrabatt", total: "Gesamt, falls alle gelöscht werden", note: "Der Mengenrabatt gilt für jede einzelne Bewertung – rechnen wir die Bewertungen einzeln ab, wird jede zum rabattierten Preis berechnet." },
  en: { ntL: "software removal – upfront, only after our check", subA: "Paid after removal (max.)", subS: "Software – upfront after our check", h: "Your prices", newL: "up to 4 weeks old", oldL: "older than 4 weeks", disc: "Volume discount", total: "Total if all are removed", note: "The volume discount applies to every single review – if we bill reviews one by one, each is charged at its discounted price." },
  es: { ntL: "eliminación por software – por adelantado, solo tras nuestra revisión", subA: "Pago tras la eliminación (máx.)", subS: "Software – por adelantado tras nuestra revisión", h: "Tus precios", newL: "hasta 4 semanas", oldL: "más de 4 semanas", disc: "Descuento por volumen", total: "Total si se eliminan todas", note: "El descuento por volumen se aplica a cada reseña: si facturamos las reseñas una por una, cada una se cobra con su precio rebajado." },
  fr: { ntL: "suppression par logiciel – d'avance, seulement après notre vérification", subA: "Payé après suppression (max.)", subS: "Logiciel – d'avance après notre vérification", h: "Tes prix", newL: "jusqu'à 4 semaines", oldL: "plus de 4 semaines", disc: "Remise sur quantité", total: "Total si tous sont supprimés", note: "La remise sur quantité s'applique à chaque avis : si nous facturons les avis un par un, chacun est facturé à son prix remisé." },
  it: { ntL: "rimozione via software – in anticipo, solo dopo la nostra verifica", subA: "Pagamento dopo la rimozione (max.)", subS: "Software – in anticipo dopo la nostra verifica", h: "I tuoi prezzi", newL: "fino a 4 settimane", oldL: "più di 4 settimane", disc: "Sconto quantità", total: "Totale se vengono rimosse tutte", note: "Lo sconto quantità vale per ogni singola recensione: se fatturiamo le recensioni una alla volta, ciascuna viene addebitata al prezzo scontato." },
  nl: { ntL: "verwijdering via software – vooraf, pas na onze controle", subA: "Betaling na verwijdering (max.)", subS: "Software – vooraf na onze controle", h: "Prijsoverzicht", newL: "tot 4 weken oud", oldL: "ouder dan 4 weken", disc: "Volumekorting", total: "Totaal als alle reviews verwijderd worden", note: "De volumekorting geldt voor elke review afzonderlijk – factureren we reviews één voor één, dan wordt elke review tegen de afgeprijsde prijs berekend." },
  pt: { ntL: "remoção por software – antecipado, só após a nossa verificação", subA: "Pago após a remoção (máx.)", subS: "Software – antecipado após a nossa verificação", h: "Os teus preços", newL: "até 4 semanas", oldL: "mais de 4 semanas", disc: "Desconto de volume", total: "Total se todas forem removidas", note: "O desconto de volume aplica-se a cada avaliação: se faturarmos as avaliações uma a uma, cada uma é cobrada ao preço com desconto." },
  ja: { ntL: "ソフトウェア削除 – 当社確認後に前払い", subA: "削除後のお支払い（上限）", subS: "ソフトウェア – 確認後に前払い", h: "料金の内訳", newL: "投稿4週間以内", oldL: "投稿4週間超", disc: "まとめ割引", total: "すべて削除された場合の合計", note: "まとめ割引は口コミ1件ごとに適用されます。1件ずつご請求する場合も、それぞれ割引後の価格でのご請求となります。" },
  sv: { ntL: "borttagning med mjukvara – i förskott, först efter vår kontroll", subA: "Betalas efter borttagning (max.)", subS: "Mjukvara – i förskott efter vår kontroll", h: "Dina priser", newL: "upp till 4 veckor", oldL: "äldre än 4 veckor", disc: "Mängdrabatt", total: "Totalt om alla tas bort", note: "Mängdrabatten gäller för varje enskilt omdöme – fakturerar vi omdömena ett i taget debiteras vart och ett till rabatterat pris." },
  da: { ntL: "fjernelse med software – forud, først efter vores tjek", subA: "Betales efter fjernelse (maks.)", subS: "Software – forud efter vores tjek", h: "Dine priser", newL: "op til 4 uger", oldL: "ældre end 4 uger", disc: "Mængderabat", total: "I alt, hvis alle fjernes", note: "Mængderabatten gælder for hver enkelt anmeldelse – fakturerer vi anmeldelserne én ad gangen, opkræves hver til den nedsatte pris." },
  no: { ntL: "fjerning med programvare – på forskudd, først etter vår sjekk", subA: "Betales etter fjerning (maks.)", subS: "Programvare – på forskudd etter vår sjekk", h: "Dine priser", newL: "opptil 4 uker", oldL: "eldre enn 4 uker", disc: "Mengderabatt", total: "Totalt hvis alle fjernes", note: "Mengderabatten gjelder for hver enkelt omtale – fakturerer vi omtalene én om gangen, belastes hver til rabattert pris." },
};

/** Währung: explizit ("usd"/"eur") oder aus dem formatierten Stückpreis abgeleitet. */
export const reviewCurrency = (currency?: string, per?: string) =>
  currency ? (currency.toLowerCase() === "usd" ? "usd" : "eur") : ((per || "").includes("$") ? "usd" : "eur");

export function ReviewPriceLines({ lang = "en", items, currency, minPct = 0 }: { lang?: string; items: PricedItem[]; currency: string; minPct?: number }) {
  if (!items.length) return null;
  const l = L[lang] || L.en;
  const q = quoteReviews(items, currency, undefined, "full", minPct);
  // Gemischt (Software + Zahlung nach Löschung): beide Teilsummen zeigen, weil sie zu verschiedenen Zeitpunkten fällig werden.
  const swSub = q.ntDeposit, mixed = q.nNt > 0 && q.nNt < q.n;
  const f = (v: number) => fmtReviewMoney(v, currency);
  const row: React.CSSProperties = { display: "block", paddingLeft: 2 };
  return (
    <React.Fragment>
      <span style={{ display: "block", borderTop: `1px solid ${brand.tintBorder}`, margin: "10px 0 8px" }} />
      <span style={{ color: brand.tintText, fontWeight: 700 }}>{l.h}</span><br />
      {q.nNew ? <span style={row}>{q.nNew} × {f(q.base)} ({l.newL}) = {f(q.nNew * q.base)}</span> : null}
      {q.nOld ? <span style={row}>{q.nOld} × {f(q.oldPrice)} ({l.oldL}) = {f(q.nOld * q.oldPrice)}</span> : null}
      {q.nNt ? <span style={row}>{q.nNt} × {f(q.ntPrice)} ({l.ntL}) = {f(q.nNt * q.ntPrice)}</span> : null}
      {q.pct ? <span style={row}>{l.disc} −{q.pct} %: −{f(q.discount)}</span> : null}
      {mixed ? <span style={row}>{l.subA}: {f(q.total - swSub)}</span> : null}
      {mixed ? <span style={row}>{l.subS}: {f(swSub)}</span> : null}
      <span style={row}><strong>{l.total}: {f(q.total)}</strong></span>
      {q.pct ? <span style={{ ...row, color: brand.muted, fontSize: 12.5, marginTop: 4 }}>{l.note}</span> : null}
    </React.Fragment>
  );
}
