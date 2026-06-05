/* Template: Kundenstorno – auf Kundenwunsch storniert / Canceled as requested (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface KundenstornoProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Ihr Auftrag wurde wie gewünscht storniert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. ",
    p1Bold: "Ihr Auftrag wurde wie gewünscht storniert.",
    accessBold: "Wie erhalte ich wieder Zugriff auf mein Profil?",
    access: " Bitte suchen Sie nach Ihrem Unternehmen in Google, klicken Sie auf „Inhaber dieses Profils?“ und folgen Sie den Anweisungen.",
    p3: "Falls Sie weitere Fragen haben oder wir Ihnen anderweitig behilflich sein können, so kontaktieren Sie uns gerne jederzeit!",
    p4: "Vielen Dank und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "We have cancelled your order as requested.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you once again for placing your trust in us and for your recent order. ",
    p1Bold: "We have cancelled your order as requested.",
    accessBold: "How do I regain access to my profile?",
    access: " Please search for your business on Google, click on “Own this business?” and follow the instructions.",
    p3: "Please don’t hesitate to reach out if you have any further questions or if there’s anything else we can assist you with.",
    p4: "We wish you continued success in your business.",
    subject: "Your order has been canceled",
  },
};

export function subject(p: KundenstornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Kundenstorno({ lang = "de" }: KundenstornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <P><strong><u>{t.accessBold}</u></strong>{t.access}</P>
      <P>{t.p3}</P>
      <P>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
