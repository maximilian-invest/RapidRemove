/* Template: Rechte benötigt – Zugriffsrechte bestätigen / Please grant access rights (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface RechteBenoetigtProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Bitte erteilen Sie uns die Zugriffsrechte!",
    preview: "Google hat Ihnen eine Anfrage zur Rechteübertragung geschickt – bitte bestätigen.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil, welche uns bis dato nicht erteilt wurden.",
    p2Bold: "Bitte sehen Sie in Ihrem Postfach nach:",
    p2a: " Google hat eine E-Mail mit der Anfrage zur Rechteübertragung an Sie geschickt, ",
    p2Bold2: "welche von Ihnen zu bestätigen ist.",
    p2Rest: " Vielen Dank!",
    p3Bold: "Wo finde ich diese E-Mail?",
    p3: " Die E-Mail erging an die Adresse, mit welcher Ihr Google-Unternehmensprofil erstellt wurde (ggf. auch an Ihren Webmaster oder Ihre Werbeagentur).",
    subject: "Bitte erteilen Sie uns die Zugriffsrechte",
  },
  en: {
    title: "Please Grant Us Access Rights!",
    preview: "Google has sent you a request to transfer access rights – please confirm it.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you very much for your trust and your recent order. In order to proceed with the removal, we urgently require editing rights to your Google Business Profile, which have not yet been granted to us.",
    p2Bold: "Please check your inbox:",
    p2a: " Google has sent you an email requesting the transfer of access rights, ",
    p2Bold2: "which you need to confirm.",
    p2Rest: "",
    p3Bold: "Where can I find this email?",
    p3: " The email was sent to the address used to create your Google Business Profile (possibly also to your webmaster or advertising agency).",
    subject: "Please grant us access rights",
  },
};

export function subject(p: RechteBenoetigtProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function RechteBenoetigt({ lang = "de" }: RechteBenoetigtProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong>{t.p2Bold}</strong>{t.p2a}<strong>{t.p2Bold2}</strong>{t.p2Rest}</P>
      <P><strong>{t.p3Bold}</strong>{t.p3}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
