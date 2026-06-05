/* Template: Nicht gefunden – kein Link zum Profil angehängt / Request for information (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface NichtGefundenProps { lang?: "de" | "en"; }

const T = {
  de: {
    title: "Bitte um Auskunft!",
    preview: "Bei der Bestellung wurde kein Link zum Profil angehängt.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Offenbar wurde bei der Bestellung kein Link zum Profil angehängt. ",
    p1Bold: "Bitte antworten Sie auf diese E-Mail einfach mit dem Namen des Unternehmens oder einem Link",
    p1b: " zum Eintrag, den Sie entfernen / zurücksetzen möchten, vielen Dank!",
    subject: "Bitte um Auskunft",
  },
  en: {
    title: "Request for Information!",
    preview: "It appears that no link to the profile was included in the order.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your trust and your recent order. It appears that no link to the profile was included in the order. ",
    p1Bold: "Please simply reply to this email with the company name or a link",
    p1b: " to the entry you would like to have removed / reset. Thank you very much!",
    subject: "Request for information",
  },
};

export function subject(p: NichtGefundenProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function NichtGefunden({ lang = "de" }: NichtGefundenProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong>{t.p1b}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
