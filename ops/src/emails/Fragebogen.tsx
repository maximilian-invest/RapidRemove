/* Template: Kurzer Fragebogen zur Bestellung / Short order questionnaire (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface FragebogenProps { lang?: "de" | "en"; formUrl?: string; }

const T = {
  de: {
    title: "Kurzer Fragebogen – hilft uns bei Ihrer Löschung",
    preview: "Optional, ca. 2 Minuten – beantworten Sie kurz 5 Fragen zu Ihrer Bestellung.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "um Ihre Löschung schneller und reibungslos zu bearbeiten, hilft uns ein kurzer Fragebogen – 5 kurze Ja/Nein-Fragen, etwa 2 Minuten. Die Beantwortung ist freiwillig, beschleunigt aber die Bearbeitung spürbar.",
    cta: "Fragebogen ausfüllen",
    p2: "Vielen Dank für Ihre Unterstützung!",
    subject: "Kurzer Fragebogen zu Ihrer Bestellung",
  },
  en: {
    title: "A quick questionnaire – helps us with your removal",
    preview: "Optional, about 2 minutes – please answer 5 quick yes/no questions about your order.",
    greeting: "Dear Sir or Madam,",
    p1: "to process your removal faster and smoothly, a short questionnaire helps us – 5 quick yes/no questions, about 2 minutes. Answering is optional, but it noticeably speeds up processing.",
    cta: "Open questionnaire",
    p2: "Thank you for your support!",
    subject: "A quick questionnaire about your order",
  },
};

export function subject(p: FragebogenProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Fragebogen({ lang = "de", formUrl = "https://rapid-remove.com" }: FragebogenProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <Section style={{ margin: "18px 0 6px" }}>
        <CtaButton href={formUrl} full>{t.cta}</CtaButton>
      </Section>
      <P>{t.p2}</P>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
