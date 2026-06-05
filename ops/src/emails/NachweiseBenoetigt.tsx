/* Template: Nachweise benötigt – Bitte um Auskunft / Request for information, documents (DE/EN). */
import * as React from "react";
import { EmailShell, P, Bullets, Support } from "./components";

export interface NachweiseBenoetigtProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Bitte um Auskunft!",
    preview: "Zum Zurücksetzen Ihres Profils benötigen wir einen Nachweis.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Um Ihr Google-Unternehmensprofil zurückzusetzen, benötigen wir ",
    p1Bold: "zwingend eines oder mehrere der folgenden Dokumente als Nachweis:",
    items: [
      "Handelsregisterauszug / Firmenbuchauszug",
      "Gewerbeberechtigung",
      "Steuerdokument",
      "USt.-ID-Nr.-Dokument",
      "Rechnung von Strom- oder Wasserversorger (nicht älter als 3 Monate)",
    ],
    p2: "Bitte antworten Sie einfach auf diese E-Mail und senden Sie uns die Dokumente im Anhang, danke!",
    subject: "Bitte um Auskunft – Nachweise benötigt",
  },
  en: {
    title: "Request for Information!",
    preview: "To reset your profile we require a proof document.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your trust and your recent order. In order to reset your Google Business Profile, we ",
    p1Bold: "urgently require one or more of the following documents as proof:",
    items: [
      "Excerpt from the commercial register / company register",
      "Trade license",
      "Tax document",
      "VAT ID document",
      "Utility bill (electricity or water, no older than 3 months)",
    ],
    p2: "Please simply reply to this email and attach the relevant documents. Thank you!",
    subject: "Request for information – documents needed",
  },
};

export function subject(p: NachweiseBenoetigtProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function NachweiseBenoetigt({ lang = "de" }: NachweiseBenoetigtProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <Bullets items={t.items} />
      <P>{t.p2}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
