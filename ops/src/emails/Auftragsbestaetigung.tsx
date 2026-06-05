/* Template: Auftragsbestätigung / Order Confirmation (DE/EN). */
import * as React from "react";
import { EmailShell, P, NoteBox } from "./components";

export interface AuftragsbestaetigungProps {
  lang?: "de" | "en";
  /** optionale persönliche Anrede, sonst formell */
  anrede?: string;
}

const T = {
  de: {
    title: "Auftragsbestätigung ✓",
    preview: "Vielen Dank für Ihren Auftrag – wir beginnen umgehend mit der Bearbeitung.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "vielen Dank für Ihren Auftrag. Wir ",
    introBold: "beginnen umgehend",
    introRest: " mit der Bearbeitung.",
    noteBold: "Wichtig — Anfrage zur Inhaberschaft:",
    note: " Unter Umständen erhalten Sie eine E-Mail von Google, in welcher wir die Bearbeitungsrechte des Profils anfordern. Bitte klicken Sie in dieser E-Mail auf „Antworten“ und übertragen Sie die Rechte. Wir erhalten dadurch keinen Zugriff auf persönliche Daten oder andere Google-Dienste.",
    outro: "Sie hören in Kürze wieder von uns. Bei Fragen antworten Sie einfach auf diese E-Mail – wir sind schnell für Sie da.",
    subject: "Auftragsbestätigung – RapidRemove",
  },
  en: {
    title: "Order Confirmed ✓",
    preview: "Thank you for your order – we will begin processing it immediately.",
    greeting: "Dear Sir or Madam,",
    intro: "thank you for your order. We will begin processing it ",
    introBold: "immediately",
    introRest: ".",
    noteBold: "Important — Request for Ownership:",
    note: " You may receive an email from Google requesting profile editing rights. Please click “Respond” in this email and transfer the rights. We will not gain access to personal data or other Google services.",
    outro: "You will hear from us again shortly. If you have any questions, simply reply to this email – we are quick to assist you.",
    subject: "Order confirmation – RapidRemove",
  },
};

export function subject(p: AuftragsbestaetigungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Auftragsbestaetigung({ lang = "de", anrede }: AuftragsbestaetigungProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{anrede || t.greeting}</strong></P>
      <P>{t.intro}<strong>{t.introBold}</strong>{t.introRest}</P>
      <NoteBox>
        <strong>{t.noteBold}</strong>{t.note}
      </NoteBox>
      <P muted>{t.outro}</P>
    </EmailShell>
  );
}
