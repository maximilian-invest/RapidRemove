/* Preisaufstellung für Bewertungs-Mails (Auftragsbestätigung, Startbestätigung):
   die exakten Preise der Bestellung — Anzahl × Stückpreis je Alter, Mengenrabatt,
   Gesamtbetrag falls alle gelöscht werden. Rechnet mit derselben Logik wie
   Wizard und Rechnung (reviewsPricing.ts). Wird in eine NoteBox eingesetzt. */
import * as React from "react";
import { brand } from "./components";
import { quoteReviews, fmtReviewMoney, EXPRESS_CUSTOMER_H, PRICE_V2_FRESH, PRICE_V2_OTHER, type PricedItem } from "../reviewsPricing";

/** freshL/otherL/xL/max: Preismodell 2 (99/250 + Express); {h} = Express-Zusage in Stunden. */
interface Labels { freshL: string; otherL: string; xL: string; max: string; cpL: string; h: string; newL: string; oldL: string; ntL: string; subA: string; subS: string; disc: string; total: string; note: string }

const L: Record<string, Labels> = {
  de: { freshL: "bis 4 Wochen alt, mit Text", otherL: "alle anderen Bewertungen", xL: "gelöscht innerhalb von {h} Std. ab Start – sonst entfällt er automatisch", max: "max.", cpL: "vereinbarter Preis", ntL: "Software-Löschung – nur bei Erfolg", subA: "Zahlung nach Löschung (max.)", subS: "Software – nur bei Erfolg", h: "Ihre Preise", newL: "bis 4 Wochen alt", oldL: "älter als 4 Wochen", disc: "Mengenrabatt", total: "Gesamt, falls alle gelöscht werden", note: "Der Mengenrabatt gilt für jede einzelne Bewertung – rechnen wir die Bewertungen einzeln ab, wird jede zum rabattierten Preis berechnet." },
  en: { freshL: "up to 4 weeks old, with text", otherL: "all other reviews", xL: "removed within {h} h from the start – otherwise dropped automatically", max: "max.", cpL: "agreed price", ntL: "software removal – charged only on success", subA: "Paid after removal (max.)", subS: "Software – only on success", h: "Your prices", newL: "up to 4 weeks old", oldL: "older than 4 weeks", disc: "Volume discount", total: "Total if all are removed", note: "The volume discount applies to every single review – if we bill reviews one by one, each is charged at its discounted price." },
  es: { freshL: "hasta 4 semanas, con texto", otherL: "todas las demás reseñas", xL: "eliminada en {h} h desde el inicio; si no, se descuenta automáticamente", max: "máx.", cpL: "precio acordado", ntL: "eliminación por software – solo si funciona", subA: "Pago tras la eliminación (máx.)", subS: "Software – solo si funciona", h: "Tus precios", newL: "hasta 4 semanas", oldL: "más de 4 semanas", disc: "Descuento por volumen", total: "Total si se eliminan todas", note: "El descuento por volumen se aplica a cada reseña: si facturamos las reseñas una por una, cada una se cobra con su precio rebajado." },
  fr: { freshL: "jusqu'à 4 semaines, avec texte", otherL: "tous les autres avis", xL: "supprimé sous {h} h après le démarrage – sinon retiré automatiquement", max: "max.", cpL: "prix convenu", ntL: "suppression par logiciel – payée seulement en cas de succès", subA: "Payé après suppression (max.)", subS: "Logiciel – seulement en cas de succès", h: "Tes prix", newL: "jusqu'à 4 semaines", oldL: "plus de 4 semaines", disc: "Remise sur quantité", total: "Total si tous sont supprimés", note: "La remise sur quantité s'applique à chaque avis : si nous facturons les avis un par un, chacun est facturé à son prix remisé." },
  it: { freshL: "fino a 4 settimane, con testo", otherL: "tutte le altre recensioni", xL: "rimossa entro {h} ore dall'avvio – altrimenti il supplemento decade automaticamente", max: "max.", cpL: "prezzo concordato", ntL: "rimozione via software – solo se riesce", subA: "Pagamento dopo la rimozione (max.)", subS: "Software – solo se riesce", h: "I tuoi prezzi", newL: "fino a 4 settimane", oldL: "più di 4 settimane", disc: "Sconto quantità", total: "Totale se vengono rimosse tutte", note: "Lo sconto quantità vale per ogni singola recensione: se fatturiamo le recensioni una alla volta, ciascuna viene addebitata al prezzo scontato." },
  nl: { freshL: "tot 4 weken oud, met tekst", otherL: "alle andere reviews", xL: "verwijderd binnen {h} uur na de start – anders vervalt de toeslag automatisch", max: "max.", cpL: "afgesproken prijs", ntL: "verwijdering via software – alleen bij succes", subA: "Betaling na verwijdering (max.)", subS: "Software – alleen bij succes", h: "Prijsoverzicht", newL: "tot 4 weken oud", oldL: "ouder dan 4 weken", disc: "Volumekorting", total: "Totaal als alle reviews verwijderd worden", note: "De volumekorting geldt voor elke review afzonderlijk – factureren we reviews één voor één, dan wordt elke review tegen de afgeprijsde prijs berekend." },
  pt: { freshL: "até 4 semanas, com texto", otherL: "todas as outras avaliações", xL: "removida em {h} h desde o início – caso contrário, o suplemento cai automaticamente", max: "máx.", cpL: "preço acordado", ntL: "remoção por software – só se resultar", subA: "Pago após a remoção (máx.)", subS: "Software – só se resultar", h: "Os teus preços", newL: "até 4 semanas", oldL: "mais de 4 semanas", disc: "Desconto de volume", total: "Total se todas forem removidas", note: "O desconto de volume aplica-se a cada avaliação: se faturarmos as avaliações uma a uma, cada uma é cobrada ao preço com desconto." },
  ja: { freshL: "投稿4週間以内・本文あり", otherL: "その他すべての口コミ", xL: "開始から{h}時間以内に削除 – 間に合わなければ自動的に請求なし", max: "上限", cpL: "個別合意価格", ntL: "ソフトウェア削除 – 成功時のみ請求", subA: "削除後のお支払い（上限）", subS: "ソフトウェア – 成功時のみ", h: "料金の内訳", newL: "投稿4週間以内", oldL: "投稿4週間超", disc: "まとめ割引", total: "すべて削除された場合の合計", note: "まとめ割引は口コミ1件ごとに適用されます。1件ずつご請求する場合も、それぞれ割引後の価格でのご請求となります。" },
  sv: { freshL: "upp till 4 veckor, med text", otherL: "alla andra omdömen", xL: "borttaget inom {h} timmar från start – annars stryks tillägget automatiskt", max: "max.", cpL: "överenskommet pris", ntL: "borttagning med mjukvara – bara om det lyckas", subA: "Betalas efter borttagning (max.)", subS: "Mjukvara – bara om det lyckas", h: "Dina priser", newL: "upp till 4 veckor", oldL: "äldre än 4 veckor", disc: "Mängdrabatt", total: "Totalt om alla tas bort", note: "Mängdrabatten gäller för varje enskilt omdöme – fakturerar vi omdömena ett i taget debiteras vart och ett till rabatterat pris." },
  da: { freshL: "op til 4 uger, med tekst", otherL: "alle andre anmeldelser", xL: "fjernet inden for {h} timer fra start – ellers bortfalder tillægget automatisk", max: "maks.", cpL: "aftalt pris", ntL: "fjernelse med software – kun ved succes", subA: "Betales efter fjernelse (maks.)", subS: "Software – kun ved succes", h: "Dine priser", newL: "op til 4 uger", oldL: "ældre end 4 uger", disc: "Mængderabat", total: "I alt, hvis alle fjernes", note: "Mængderabatten gælder for hver enkelt anmeldelse – fakturerer vi anmeldelserne én ad gangen, opkræves hver til den nedsatte pris." },
  no: { freshL: "opptil 4 uker, med tekst", otherL: "alle andre omtaler", xL: "fjernet innen {h} timer fra start – ellers faller tillegget bort automatisk", max: "maks.", cpL: "avtalt pris", ntL: "fjerning med programvare – kun ved suksess", subA: "Betales etter fjerning (maks.)", subS: "Programvare – kun ved suksess", h: "Dine priser", newL: "opptil 4 uker", oldL: "eldre enn 4 uker", disc: "Mengderabatt", total: "Totalt hvis alle fjernes", note: "Mengderabatten gjelder for hver enkelt omtale – fakturerer vi omtalene én om gangen, belastes hver til rabattert pris." },
};

/** Alle Preise sind netto (AGB 6.1) – Hinweis beim Gesamtbetrag. Synchron mit VAT_NOTE in src/lib/pricing.js. */
const VAT_NOTE: Record<string, string> = { de: "zzgl. USt", en: "excl. VAT", es: "+ IVA", fr: "HT", it: "+ IVA", nl: "excl. btw", pt: "+ IVA", ja: "税別", sv: "exkl. moms", da: "ekskl. moms", no: "eks. mva." };

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
      {q.n99 ? <span style={row}>{q.n99} × {f(PRICE_V2_FRESH)} ({l.freshL}) = {f(q.n99 * PRICE_V2_FRESH)}</span> : null}
      {q.n250 ? <span style={row}>{q.n250} × {f(PRICE_V2_OTHER)} ({l.otherL}) = {f(q.n250 * PRICE_V2_OTHER)}</span> : null}
      {q.nX ? <span style={row}>{q.nX} × +{f(q.xFee)} Express ({l.xL.replace("{h}", String(EXPRESS_CUSTOMER_H))}) = {f(q.xTotal)}</span> : null}
      {q.cpLines.map((c) => <span key={c.price} style={row}>{c.n} × {f(c.price)} ({l.cpL}) = {f(c.n * c.price)}</span>)}
      {q.pct ? <span style={row}>{l.disc} −{q.pct} %: −{f(q.discount)}</span> : null}
      {mixed ? <span style={row}>{l.subA}: {f(q.total - swSub)}</span> : null}
      {mixed ? <span style={row}>{l.subS}: {f(swSub)}</span> : null}
      <span style={row}><strong>{l.total}{q.nX ? ` (${l.max})` : ""}: {f(q.total)}</strong> <span style={{ color: brand.muted, fontSize: 12.5 }}>({VAT_NOTE[lang] || VAT_NOTE.en})</span></span>
      {q.pct ? <span style={{ ...row, color: brand.muted, fontSize: 12.5, marginTop: 4 }}>{l.note}</span> : null}
    </React.Fragment>
  );
}
