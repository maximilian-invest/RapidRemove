/* Template: Zurücksetzen statt Löschen – Änderung des Auftrags / Change of order (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton } from "./components";
import { Section } from "@react-email/components";

export interface ResetProps { lang?: "de" | "en"; confirmUrl?: string; cancelUrl?: string; }

const T = {
  de: {
    title: "Änderung Ihres Auftrags",
    preview: "Wir können Ihr Profil nicht löschen, aber vollständig zurücksetzen.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre kürzliche Bestellung. Nach sorgfältiger Überprüfung haben wir festgestellt, dass wir aufgrund von internen, rechtlichen und ethischen Richtlinien ",
    p1Bold: "Ihr Unternehmensprofil nicht gänzlich löschen, sondern nur vollständig zurücksetzen können.",
    p2a: "Dabei werden alle bisherigen Bewertungen – sowohl positive als auch negative – entfernt, Ihre gute Auffindbarkeit auf Google bleibt weiterhin erhalten. ",
    p2Bold: "Wir benötigen lediglich einen Handelsregisterauszug oder Gewerbeschein.",
    confirm: "Bestätigen und Nachweis hochladen",
    cancel: "Auftrag stornieren",
    subject: "Änderung Ihres Auftrags",
  },
  en: {
    title: "Change Of Your Order",
    preview: "We cannot delete your profile, but we can fully reset it instead.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your recent order. After thoroughly reviewing your Google Business Profile, we have determined that due to policy restrictions, ",
    p1Bold: "we are unable to completely delete your profile but can fully reset it instead.",
    p2a: "All previous reviews—both positive and negative—will be removed, while your good visibility on Google remains unaffected. ",
    p2Bold: "We require a commercial register excerpt or a business license.",
    confirm: "Confirm and upload documents",
    cancel: "Cancel order",
    subject: "Change of your order",
  },
};

export function subject(p: ResetProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Reset({
  lang = "de", confirmUrl = "https://rapid-remove.com", cancelUrl = "mailto:helpdesk@rapid-remove.com",
}: ResetProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <P>{t.p2a}<strong>{t.p2Bold}</strong></P>
      <Section style={{ margin: "18px 0 8px" }}>
        <CtaButton href={confirmUrl} full>{t.confirm}</CtaButton>
      </Section>
      <Section style={{ margin: "0 0 6px" }}>
        <CtaButton href={cancelUrl} variant="secondary" full>{t.cancel}</CtaButton>
      </Section>
    </EmailShell>
  );
}
