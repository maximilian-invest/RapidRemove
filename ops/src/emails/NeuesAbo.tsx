/* Template: Neues Abo – Schutz aktiviert / Protection activated (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface NeuesAboProps { lang?: "de" | "en"; portalUrl?: string; }

const T = {
  de: {
    title: "Schutz aktiviert ✓",
    preview: "Der Schutz Ihres Google-Unternehmensprofils ist nun aktiviert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre Zahlung. Der ",
    p1Bold: "Schutz",
    p1b: " Ihres Google-Unternehmensprofils ist nun ",
    p1Bold2: "aktiviert.",
    p1c: " Sie können Ihre Rechnungsdaten jederzeit im Kundenportal bearbeiten oder den Schutz auf Wunsch deaktivieren.",
    cta: "Zum Kundenportal",
    subject: "Schutz aktiviert",
  },
  en: {
    title: "Protection Activated ✓",
    preview: "The protection for your Google Business Profile is now activated.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your payment. The ",
    p1Bold: "protection",
    p1b: " for your Google Business Profile is ",
    p1Bold2: "now activated.",
    p1c: " You can edit your billing information at any time through the customer portal or deactivate the protection if desired.",
    cta: "Go to Customer Portal",
    subject: "Protection activated",
  },
};

export function subject(p: NeuesAboProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function NeuesAbo({ lang = "de", portalUrl = "https://rapid-remove.com" }: NeuesAboProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong>{t.p1b}<strong>{t.p1Bold2}</strong>{t.p1c}</P>
      <Section style={{ margin: "18px 0 6px" }}>
        <CtaButton href={portalUrl} full>{t.cta}</CtaButton>
      </Section>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
