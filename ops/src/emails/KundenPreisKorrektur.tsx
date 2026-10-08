/* Mail „Korrektur Ihres Auftrags – richtiger Preis" (Einzelbewertungen). Für Einzelfälle, in denen beim Anlegen ein falscher Preis
   eingegeben wurde: neuer Preis je Bewertung + Gesamtwert, weiterhin nur bei Löschung fällig. */
import * as React from "react";
import { EmailShell, P, NoteBox, CtaButton, brand, type MailLang } from "./components";

type L = { subject: (id: string, total: string) => string; title: string; hi: (n: string) => string; p1: string; p2: (per: string | undefined, n: number, total: string) => string; p3: string; btn: string; sorry: string; signoff: string };
const T: Record<string, L> = {
  it: {
    subject: (id, t) => `Correzione del tuo ordine ${id} – totale ${t}`, title: "Correzione del tuo ordine", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "nella conferma d’ordine che hai ricevuto è stato inserito per errore un prezzo sbagliato. Ti chiediamo scusa.",
    p2: (per, n, t) => `Abbiamo corretto l’ordine: ${per ? `il prezzo è di ${per} per recensione rimossa, quindi ` : ""}il totale – come concordato – è di ${t} se vengono rimosse tutte le ${n} recensioni.`,
    p3: "Come sempre paghi solo le recensioni effettivamente rimosse. Nella tua dashboard vedi già gli importi corretti.",
    btn: "Apri la dashboard", sorry: "Per qualsiasi domanda rispondi pure a questa e-mail.", signoff: "Cordiali saluti,",
  },
  en: {
    subject: (id, t) => `Correction to your order ${id} – total ${t}`, title: "Correction to your order", hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: "the order confirmation you received contained a wrong price by mistake. We apologise for that.",
    p2: (per, n, t) => `We've corrected your order: ${per ? `the price is ${per} per removed review, so ` : ""}the total – as agreed – is ${t} if all ${n} reviews are removed.`,
    p3: "As always, you only pay for reviews that are actually removed. Your dashboard already shows the correct amounts.",
    btn: "Open my dashboard", sorry: "Questions? Just reply to this email.", signoff: "Warm regards,",
  },
  de: {
    subject: (id, t) => `Korrektur Ihres Auftrags ${id} – Gesamtwert ${t}`, title: "Korrektur Ihres Auftrags", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: "in der Auftragsbestätigung, die Sie erhalten haben, wurde versehentlich ein falscher Preis eingetragen. Das bitten wir zu entschuldigen.",
    p2: (per, n, t) => `Wir haben den Auftrag korrigiert: ${per ? `Der Preis beträgt ${per} je gelöschter Bewertung, der Gesamtwert` : "Der Gesamtwert"} liegt – wie besprochen – bei ${t}, wenn alle ${n} Bewertungen gelöscht werden.`,
    p3: "Wie immer zahlen Sie nur für Bewertungen, die tatsächlich gelöscht werden. In Ihrem Dashboard sehen Sie bereits die richtigen Beträge.",
    btn: "Mein Dashboard öffnen", sorry: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen",
  },
};
export interface PreisKorrekturProps { lang?: string; name?: string; orderId: string; per?: string; n: number; total: string; dashUrl: string }
const tOf = (l?: string) => T[l && T[l] ? l : "en"];
export const preisKorrekturSubject = (p: PreisKorrekturProps) => tOf(p.lang).subject(p.orderId, p.total);
export default function KundenPreisKorrektur(p: PreisKorrekturProps) {
  const l = p.lang && T[p.lang] ? p.lang : "en"; const t = T[l];
  return (
    <EmailShell preview={preisKorrekturSubject(p)} title={t.title} lang={l as MailLang}>
      <P><strong>{t.hi((p.name || "").trim())}</strong></P>
      <P>{t.p1}</P>
      <NoteBox><span style={{ color: brand.tintText, fontWeight: 700 }}>{t.p2(p.per, p.n, p.total)}</span></NoteBox>
      <P>{t.p3}</P>
      <div style={{ textAlign: "center", margin: "14px 0 20px" }}><CtaButton href={p.dashUrl}>{t.btn}</CtaButton></div>
      <P><span style={{ color: brand.muted }}>{t.sorry}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
