/* Template: Scamstorno – unlautere Geschäftspraktiken / Order canceled, objection (DE/EN). */
import * as React from "react";
import { EmailShell, P, NoteBox, Support } from "./components";

export interface ScamstornoProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Nach Prüfung können wir Ihr Profil leider nicht löschen.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Nach sorgfältiger Überprüfung Ihres Google-Unternehmensprofils müssen wir Ihnen leider mitteilen, dass eine Löschung nicht möglich ist.",
    reasonBold: "Grund:",
    reason: " Ihr Unternehmensprofil deutet auf unlautere Geschäftspraktiken hin.",
    objBold: "Einspruch:",
    obj: " Falls Sie der Meinung sind, dass unsere Einschätzung nicht korrekt ist, so ",
    objBold2: "antworten Sie bitte mit Informationen und möglichst detaillierter Problembeschreibung",
    objRest: " auf diese E-Mail.",
    p3: "Als verantwortungsvolles Unternehmen handeln wir nach rechtlichen und ethischen Prinzipien. Wir entschuldigen uns für etwaige Unannehmlichkeiten. Falls Sie weitere Fragen haben oder wir Ihnen anderweitig behilflich sein können, so kontaktieren Sie uns gerne jederzeit!",
    p4: "Vielen Dank für Ihr Verständnis und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "After reviewing your profile, deletion is unfortunately not possible.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. After carefully reviewing your Google Business Profile, we regret to inform you that we are unable to proceed with the deletion.",
    reasonBold: "Reason:",
    reason: " Your company profile indicates potential unfair business practices.",
    objBold: "Objection:",
    obj: " If you believe our assessment is incorrect, please ",
    objBold2: "respond to this email with relevant information and a detailed description",
    objRest: " of the issue.",
    p3: "As a responsible company, we operate in accordance with legal and ethical principles. Please don’t hesitate to reach out if you have any further questions or if there’s anything else we can assist you with.",
    p4: "Thank you for your understanding, and we wish you continued success in your business.",
    subject: "Your order has been canceled",
  },
};

export function subject(p: ScamstornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Scamstorno({ lang = "de" }: ScamstornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong><u>{t.reasonBold}</u></strong>{t.reason}</P>
      <NoteBox>
        <strong>{t.objBold}</strong>{t.obj}<strong>{t.objBold2}</strong>{t.objRest}
      </NoteBox>
      <P>{t.p3}</P>
      <P>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
