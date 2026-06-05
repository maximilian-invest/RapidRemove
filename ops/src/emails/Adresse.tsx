/* Template: Adresse hinterlegen / Please add your address (DE/EN). */
import * as React from "react";
import { EmailShell, P, Steps, Support } from "./components";

export interface AdresseProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Bitte hinterlegen Sie eine Adresse!",
    preview: "Wir können die Bearbeitungsrechte nur anfordern, wenn eine Adresse hinterlegt ist.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil. Diese können wir nur anfordern, ",
    p1Bold: "wenn eine gültige Adresse im Profil hinterlegt ist.",
    howBold: "Wie hinterlege ich eine Adresse?",
    steps: [
      <>Öffnen Sie Ihr Profil oder suchen Sie nach „mein Unternehmen“ in Google</>,
      <>Klicken Sie auf „Profil bearbeiten“</>,
      <>Hier können Sie eine Adresse hinterlegen</>,
    ],
    p2: "Sollten Fragen auftauchen, so antworten Sie bitte auf diese E-Mail. Vielen Dank!",
    subject: "Bitte hinterlegen Sie eine Adresse",
  },
  en: {
    title: "Please Add Your Address!",
    preview: "We can only request the editing rights if a valid address is stored in the profile.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you very much for your trust and your recent order. In order to proceed with the removal, we require editing rights for the Google Business Profile. These rights can only be requested if a ",
    p1Bold: "valid address is stored in the profile.",
    howBold: "How do I add an address?",
    steps: [
      <>Open your profile or search for “my business” in Google</>,
      <>Click on “Edit profile”</>,
      <>Here you can add an address</>,
    ],
    p2: "If you have any questions, please reply to this email. Thank you!",
    subject: "Please add your address",
  },
};

export function subject(p: AdresseProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Adresse({ lang = "de" }: AdresseProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <P><strong>{t.howBold}</strong></P>
      <Steps items={t.steps} />
      <P>{t.p2}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
