/* Bulk-Upload (14.10.2026): Hinweise an den Kunden.
 *   kind "sw"    – Bewertungen brauchen Spezial-Software → aus der Bulk-Bestellung storniert, bitte einzeln beauftragen (regulärer Preis)
 *   kind "price" – durch Stornos fällt die Bestellung in eine andere Stufe → neuer Preis, Kunde muss im Dashboard zustimmen (Auftrag pausiert)
 * Englisch + Deutsch; andere Sprachen bekommen Englisch. */
import * as React from "react";
import { EmailShell, P, CtaButton, NoteBox, type MailLang } from "./components";

type Props = { lang?: string; name?: string; url: string; kind: "sw" | "price"; n?: number; reviews?: string[]; nOrig?: number; nNow?: number; from?: string; to?: string; orderId?: string };

const T = {
  en: {
    swSubj: (n: number) => (n === 1 ? "1 review from your bulk order needs special software" : `${n} reviews from your bulk order need special software`),
    swTitle: "Special software needed",
    swP: (n: number) => `Our specialist found that ${n === 1 ? "this review" : "these reviews"} can only be removed with special software. That's not part of the bulk flat price, so we've cancelled ${n === 1 ? "it" : "them"} from your bulk order – you won't be charged.`,
    swP2: "If you'd still like to have them removed, simply order them as individual reviews in your dashboard at the regular price.",
    swBtn: "Order individually",
    prSubj: "Please confirm the new price for your bulk order",
    prTitle: "Your tier has changed",
    prP: (a: number, b: number) => `Your bulk order now contains ${b} instead of ${a} reviews (reviews that need special software were cancelled). This moves it into a different price tier.`,
    prBox: (f: string, t: string) => `Price per removed review: ${f} → ${t}`,
    prP2: "We've paused your order until you confirm the new price in your dashboard. Reviews that have already been removed keep their price.",
    prBtn: "Review and confirm",
    sign: "Your RapidRemove team", hi: (n: string) => (n ? `Hi ${n},` : "Hi there,"),
  },
  de: {
    swSubj: (n: number) => (n === 1 ? "1 Bewertung aus Ihrer Bulk-Bestellung braucht Spezial-Software" : `${n} Bewertungen aus Ihrer Bulk-Bestellung brauchen Spezial-Software`),
    swTitle: "Spezial-Software nötig",
    swP: (n: number) => `Unser Spezialist hat festgestellt, dass ${n === 1 ? "diese Bewertung" : "diese Bewertungen"} nur per Spezial-Software gelöscht werden ${n === 1 ? "kann" : "können"}. Das ist nicht Teil des Bulk-Pauschalpreises – wir haben ${n === 1 ? "sie" : "sie"} deshalb aus Ihrer Bulk-Bestellung storniert. Es wird nichts verrechnet.`,
    swP2: "Wenn Sie sie trotzdem löschen lassen möchten, beauftragen Sie sie einfach als Einzelbewertung im Dashboard – zum regulären Preis.",
    swBtn: "Einzeln beauftragen",
    prSubj: "Bitte bestätigen Sie den neuen Preis Ihrer Bulk-Bestellung",
    prTitle: "Ihre Preisstufe hat sich geändert",
    prP: (a: number, b: number) => `Ihre Bulk-Bestellung umfasst jetzt ${b} statt ${a} Bewertungen (Bewertungen, die Spezial-Software brauchen, wurden storniert). Dadurch fällt sie in eine andere Preisstufe.`,
    prBox: (f: string, t: string) => `Preis je gelöschter Bewertung: ${f} → ${t}`,
    prP2: "Wir haben Ihre Bestellung pausiert, bis Sie den neuen Preis im Dashboard bestätigen. Bereits gelöschte Bewertungen behalten ihren Preis.",
    prBtn: "Ansehen und bestätigen",
    sign: "Ihr RapidRemove-Team", hi: (n: string) => (n ? `Hallo ${n},` : "Hallo,"),
  },
};
const tx = (lang?: string) => (lang === "de" ? T.de : T.en);

export function bulkHinweisSubject(p: Props): string {
  const t = tx(p.lang);
  return p.kind === "sw" ? t.swSubj(p.n || 1) : t.prSubj;
}

export default function BulkHinweis(p: Props) {
  const t = tx(p.lang);
  const l = (p.lang === "de" ? "de" : "en") as MailLang;
  const first = String(p.name || "").trim().split(/\s+/)[0] || "";
  if (p.kind === "sw") {
    return (
      <EmailShell preview={t.swP(p.n || 1).slice(0, 110)} title={t.swTitle} lang={l}>
        <P>{t.hi(first)}</P>
        <P>{t.swP(p.n || 1)}</P>
        {p.reviews && p.reviews.length ? <NoteBox>{p.reviews.slice(0, 10).join(" · ")}{p.reviews.length > 10 ? ` · +${p.reviews.length - 10}` : ""}</NoteBox> : null}
        <P>{t.swP2}</P>
        <CtaButton href={p.url} full>{t.swBtn}</CtaButton>
        <P>{t.sign}</P>
      </EmailShell>
    );
  }
  return (
    <EmailShell preview={t.prP(p.nOrig || 0, p.nNow || 0).slice(0, 110)} title={t.prTitle} lang={l}>
      <P>{t.hi(first)}</P>
      <P>{t.prP(p.nOrig || 0, p.nNow || 0)}</P>
      <NoteBox>{t.prBox(p.from || "", p.to || "")}</NoteBox>
      <P>{t.prP2}</P>
      <CtaButton href={p.url} full>{t.prBtn}</CtaButton>
      <P>{t.sign}</P>
    </EmailShell>
  );
}
