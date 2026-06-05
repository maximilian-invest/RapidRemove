/* Template: Profil verifizieren / Verify profile (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface VerifizierenProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Bitte verifizieren Sie Ihr Profil!",
    preview: "Für die Entfernung müssen wir Ihr Google-Profil verifizieren.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil. Dazu muss Ihr Profil verifiziert werden.",
    howBold: "Wie geht das?",
    how: " Bitte suchen Sie in Google nach Ihrem Unternehmen und klicken Sie auf ",
    howQuote: "„Inhaber dieses Unternehmens?“",
    howRest: " und folgen Sie den Anweisungen.",
    p3: "Sollten Probleme bei der Verifizierung auftauchen, so antworten Sie bitte auf diese E-Mail. Vielen Dank!",
    subject: "Bitte verifizieren Sie Ihr Profil",
  },
  en: {
    title: "Please Verify Your Profile!",
    preview: "To proceed with the removal we need to verify your Google profile.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you very much for your trust and your recent order. In order to proceed with the removal, we urgently require editing rights to your Google Business Profile. To grant these, your profile must be verified.",
    howBold: "How does it work?",
    how: " Please search for your company on Google and click on ",
    howQuote: "“Own this business?”",
    howRest: ", then follow the instructions provided.",
    p3: "If you encounter any issues during the verification process, please reply to this email. Thank you!",
    subject: "Please verify your profile",
  },
};

export function subject(p: VerifizierenProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Verifizieren({ lang = "de" }: VerifizierenProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong>{t.howBold}</strong>{t.how}<strong>{t.howQuote}</strong>{t.howRest}</P>
      <P>{t.p3}</P>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
