/* Template: Abo deaktiviert – Schutz wegen Zahlungsproblem deaktiviert / Protection canceled (DE/EN). */
import * as React from "react";
import { EmailShell, P, DangerBox, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface AboDeaktiviertProps { lang?: "de" | "en"; reactivateUrl?: string; }

const T = {
  de: {
    title: "Der Schutz wurde deaktiviert!",
    preview: "Ihr Schutz wurde deaktiviert, da die Zahlung wiederholt fehlschlug.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "unser Schutz-Plan hilft gegen das Wiederauftauchen eines ungewünschten Google-Unternehmensprofils.",
    p2Bold: "Der Schutz wurde deaktiviert, da die Zahlung wiederholt fehlschlug",
    p2: " (abgelaufene Karte, mangelnde Deckung, etc.).",
    warnA: "Bitte beachten Sie, dass Ihr Profil ",
    warnBold: "nun jederzeit wiederauftauchen und bewertet werden kann.",
    warnB: " Sollte der Schutz nicht reaktiviert werden, ist eine ",
    warnBold2: "Löschung nur gegen Entgelt möglich.",
    cta: "Problem beheben / Schutz reaktivieren",
    p3: "Bitte aktivieren Sie Ihren Schutz schnellstmöglich manuell oder informieren Sie uns als Antwort auf diese E-Mail, falls Sie Hilfe bei der Aktualisierung Ihrer Zahlungsmethode benötigen.",
    p4: "Sollte der Schutz nicht mehr gewünscht sein, so ignorieren Sie bitte diese E-Mail.",
    subject: "Ihr Schutz wurde deaktiviert",
  },
  en: {
    title: "Protection Has Been Canceled!",
    preview: "Your protection has been canceled because the payment repeatedly failed.",
    greeting: "Dear Sir or Madam,",
    p1: "our protection plan helps prevent the reappearance of an unwanted Google Business Profile.",
    p2Bold: "The protection has been canceled because the payment repeatedly failed",
    p2: " (expired card, insufficient funds, etc.).",
    warnA: "Please note that your profile may ",
    warnBold: "now reappear and receive reviews at any time.",
    warnB: " If the protection is not reactivated, removal can ",
    warnBold2: "only be provided at an additional cost.",
    cta: "Fix the issue / Reactivate protection",
    p3: "Please reactivate your protection manually as soon as possible, or reply to this email if you need assistance updating your payment details.",
    p4: "If you no longer wish to continue with the protection, simply ignore this email. The service will automatically expire.",
    subject: "Your protection has been canceled",
  },
};

export function subject(p: AboDeaktiviertProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function AboDeaktiviert({ lang = "de", reactivateUrl = "https://rapid-remove.com" }: AboDeaktiviertProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong>{t.p2Bold}</strong>{t.p2}</P>
      <DangerBox>
        {t.warnA}<strong>{t.warnBold}</strong>{t.warnB}<strong>{t.warnBold2}</strong>
      </DangerBox>
      <Section style={{ margin: "4px 0 14px" }}>
        <CtaButton href={reactivateUrl} variant="danger" full>{t.cta}</CtaButton>
      </Section>
      <P>{t.p3}</P>
      <P muted>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
