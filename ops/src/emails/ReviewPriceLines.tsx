/* Preisaufstellung für Bewertungs-Mails (Auftragsbestätigung, Startbestätigung):
   die exakten Preise der Bestellung — Anzahl × Stückpreis je Alter, Mengenrabatt,
   Gesamtbetrag falls alle gelöscht werden. Rechnet mit derselben Logik wie
   Wizard und Rechnung (reviewsPricing.ts). Wird in eine NoteBox eingesetzt. */
import * as React from "react";
import { brand } from "./components";
import { quoteReviews, fmtReviewMoney, type PricedItem } from "../reviewsPricing";

interface Labels { h: string; newL: string; oldL: string; disc: string; total: string; note: string }

const L: Record<string, Labels> = {
  en: { h: "Your prices", newL: "up to 4 weeks old", oldL: "older than 4 weeks", disc: "Volume discount", total: "Total if all are removed", note: "The volume discount depends on how many reviews are actually removed." },
  es: { h: "Tus precios", newL: "hasta 4 semanas", oldL: "más de 4 semanas", disc: "Descuento por volumen", total: "Total si se eliminan todas", note: "El descuento por volumen depende de cuántas reseñas se eliminen realmente." },
  fr: { h: "Tes prix", newL: "jusqu'à 4 semaines", oldL: "plus de 4 semaines", disc: "Remise sur quantité", total: "Total si tous sont supprimés", note: "La remise sur quantité dépend du nombre d'avis réellement supprimés." },
  it: { h: "I tuoi prezzi", newL: "fino a 4 settimane", oldL: "più di 4 settimane", disc: "Sconto quantità", total: "Totale se vengono rimosse tutte", note: "Lo sconto quantità dipende da quante recensioni vengono effettivamente rimosse." },
  nl: { h: "Prijsoverzicht", newL: "tot 4 weken oud", oldL: "ouder dan 4 weken", disc: "Volumekorting", total: "Totaal als alle reviews verwijderd worden", note: "De volumekorting hangt af van het aantal reviews dat daadwerkelijk wordt verwijderd." },
  pt: { h: "Os teus preços", newL: "até 4 semanas", oldL: "mais de 4 semanas", disc: "Desconto de volume", total: "Total se todas forem removidas", note: "O desconto de volume depende do número de avaliações efetivamente removidas." },
  ja: { h: "料金の内訳", newL: "投稿4週間以内", oldL: "投稿4週間超", disc: "まとめ割引", total: "すべて削除された場合の合計", note: "まとめ割引は実際に削除された件数に応じて適用されます。" },
  sv: { h: "Dina priser", newL: "upp till 4 veckor", oldL: "äldre än 4 veckor", disc: "Mängdrabatt", total: "Totalt om alla tas bort", note: "Mängdrabatten beror på hur många omdömen som faktiskt tas bort." },
  da: { h: "Dine priser", newL: "op til 4 uger", oldL: "ældre end 4 uger", disc: "Mængderabat", total: "I alt, hvis alle fjernes", note: "Mængderabatten afhænger af, hvor mange anmeldelser der faktisk fjernes." },
  no: { h: "Dine priser", newL: "opptil 4 uker", oldL: "eldre enn 4 uker", disc: "Mengderabatt", total: "Totalt hvis alle fjernes", note: "Mengderabatten avhenger av hvor mange omtaler som faktisk fjernes." },
};

/** Währung: explizit ("usd"/"eur") oder aus dem formatierten Stückpreis abgeleitet. */
export const reviewCurrency = (currency?: string, per?: string) =>
  currency ? (currency.toLowerCase() === "usd" ? "usd" : "eur") : ((per || "").includes("$") ? "usd" : "eur");

export function ReviewPriceLines({ lang = "en", items, currency }: { lang?: string; items: PricedItem[]; currency: string }) {
  if (!items.length) return null;
  const l = L[lang] || L.en;
  const q = quoteReviews(items, currency);
  const f = (v: number) => fmtReviewMoney(v, currency);
  const row: React.CSSProperties = { display: "block", paddingLeft: 2 };
  return (
    <React.Fragment>
      <span style={{ display: "block", borderTop: `1px solid ${brand.tintBorder}`, margin: "10px 0 8px" }} />
      <span style={{ color: brand.tintText, fontWeight: 700 }}>{l.h}</span><br />
      {q.nNew ? <span style={row}>{q.nNew} × {f(q.base)} ({l.newL}) = {f(q.nNew * q.base)}</span> : null}
      {q.nOld ? <span style={row}>{q.nOld} × {f(q.oldPrice)} ({l.oldL}) = {f(q.nOld * q.oldPrice)}</span> : null}
      {q.pct ? <span style={row}>{l.disc} −{q.pct} %: −{f(q.discount)}</span> : null}
      <span style={row}><strong>{l.total}: {f(q.total)}</strong></span>
      {q.pct ? <span style={{ ...row, color: brand.muted, fontSize: 12.5, marginTop: 4 }}>{l.note}</span> : null}
    </React.Fragment>
  );
}
