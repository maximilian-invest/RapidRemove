/* Template: Storno – Löschung nicht möglich / Order canceled (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface StornoProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Nach Prüfung Ihres Profils ist eine Löschung leider nicht möglich.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Nach sorgfältiger Überprüfung Ihres Google-Unternehmensprofils müssen wir Ihnen leider mitteilen, dass eine Löschung nicht möglich ist.",
    reasonBold: "Grund:",
    reason: " Google verweigert die Entfernung, Unternehmensprofile dieser Art nicht löschbar, in Konflikt mit den Richtlinien.",
    accessBold: "Wie erhalte ich wieder Zugriff auf mein Profil?",
    access: " Bitte suchen Sie nach Ihrem Unternehmen in Google, klicken Sie auf „Inhaber dieses Profils?“ und folgen Sie den Anweisungen.",
    p4: "Wir entschuldigen uns für etwaige Unannehmlichkeiten. Falls Sie weitere Fragen haben oder wir Ihnen anderweitig behilflich sein können, so kontaktieren Sie uns gerne jederzeit!",
    p5: "Vielen Dank für Ihr Verständnis und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "After reviewing your profile, deletion is unfortunately not possible.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. After carefully reviewing your Google Business Profile, we regret to inform you that we are unable to proceed with the deletion.",
    reasonBold: "Reason:",
    reason: " Google blocks the removal, Google Business Profiles of this kind not removable, restricted by guidelines.",
    accessBold: "How do I regain access to my profile?",
    access: " Please search for your business on Google, click on “Own this business?” and follow the instructions.",
    p4: "We understand that this may not be the outcome you were hoping for, and we sincerely apologize for any inconvenience. Please don’t hesitate to reach out if you have any further questions or if there’s anything else we can assist you with.",
    p5: "Thank you for your understanding, and we wish you continued success in your business.",
    subject: "Your order has been canceled",
  },
};

export function subject(p: StornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Storno({ lang = "de" }: StornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong><u>{t.reasonBold}</u></strong>{t.reason}</P>
      <P><strong><u>{t.accessBold}</u></strong>{t.access}</P>
      <P>{t.p4}</P>
      <P>{t.p5}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
