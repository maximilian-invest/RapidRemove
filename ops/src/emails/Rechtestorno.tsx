/* Template: Rechtestorno – mangels Zugriffsrechte storniert / Missing access rights (DE/EN). */
import * as React from "react";
import { EmailShell, P, A, Support } from "./components";

export interface RechtestornoProps { lang?: "de" | "en"; resumeUrl?: string; }

const T = {
  de: {
    title: "Ihr Auftrag wurde mangels Zugriffsrechte storniert!",
    preview: "Uns wurden keine Bearbeitungsrechte erteilt – Ihr Auftrag wurde storniert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil, welche uns bis dato nicht erteilt wurden. Ihr Auftrag wurde daher storniert. ",
    link: "Falls Sie den Auftrag wiederaufnehmen wollen, so kontaktieren Sie uns bitte.",
    p2: "Vielen Dank für Ihr Verständnis.",
    subject: "Ihr Auftrag wurde storniert (fehlende Zugriffsrechte)",
  },
  en: {
    title: "Missing Access Rights: Your Order Has Been Canceled!",
    preview: "We were not granted management access – your order has been cancelled.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. To complete the removal process, we require management access to the Google Business Profile, which has not yet been granted. Therefore, your order has been cancelled. ",
    link: "Should you wish to resume the process, please contact us.",
    p2: "Thank you for your understanding.",
    subject: "Your order has been canceled (missing access rights)",
  },
};

export function subject(p: RechtestornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Rechtestorno({ lang = "de", resumeUrl = "mailto:helpdesk@rapid-remove.com" }: RechtestornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}<A href={resumeUrl}>{t.link}</A></P>
      <P>{t.p2}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
