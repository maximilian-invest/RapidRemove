/* Template: Garantiefall – Profil erneut aufgetaucht, kostenfrei entfernt / Profile deleted (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface GarantiefallProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Profil gelöscht ✓",
    preview: "Ihr Profil ist erneut aufgetaucht – wir haben es kostenfrei entfernt.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre Treue und das aktivierte Schutzmodell. Ihr Unternehmensprofil ist innerhalb der letzten 24 Stunden erneut aufgetaucht. Der genaue Grund dafür lässt sich leider nicht nachverfolgen – in den meisten Fällen geschieht dies durch Dritte (z. B. Kunden oder Mitarbeiter) oder durch Google selbst. ",
    p1Bold: "Wir haben dieses soeben für Sie kostenfrei entfernt.",
    subject: "Profil gelöscht – Garantiefall erledigt",
  },
  en: {
    title: "Profile Deleted ✓",
    preview: "Your profile reappeared – we have removed it again free of charge.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your loyalty and for having activated the protection plan. Your business profile reappeared within the last 24 hours. Unfortunately, the exact reason cannot be traced – in most cases this occurs due to third parties (such as customers or employees) or by Google itself. ",
    p1Bold: "We have just removed the profile for you free of charge.",
    subject: "Profile deleted",
  },
};

export function subject(p: GarantiefallProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Garantiefall({ lang = "de" }: GarantiefallProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
