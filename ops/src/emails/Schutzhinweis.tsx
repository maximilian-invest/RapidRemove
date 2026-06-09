/* Template: Hinweis zum Schutzmodell – Upsell nach Einmal-Löschung (DE/EN).
   Wortlaut 1:1 aus den make.com-Blueprints (Payment Stripe → sevDesk,
   Module 43 „Hinweis zum Schutzmodell" / 44 „Important: No protection plan
   booked"), reskinnt auf das RapidRemove-Maildesign. Wird nach einer
   Einmalzahlung ohne Abo verschickt und bewirbt den monatlichen Schutz. */
import * as React from "react";
import { EmailShell, P, A, NoteBox, CtaButton } from "./components";
import { Section } from "@react-email/components";

export interface SchutzhinweisProps { lang?: "de" | "en"; protectionUrl?: string; }

/** Bestehende Stripe-Zahlungslinks für den monatlichen Schutz (24,90 €/$24.90). */
const PROTECTION_URL = {
  de: "https://buy.stripe.com/3cs3fN2RS5lE9Z6dRi",
  en: "https://buy.stripe.com/3cs7w3css15o6MU7t5",
};
const GOOGLE_HELP = {
  de: "https://support.google.com/maps/answer/6320846?hl=de&co=GENIE.Platform%3DDesktop",
  en: "https://support.google.com/maps/answer/6320846?hl=en&co=GENIE.Platform%3DDesktop",
};
const PHONE_DISPLAY = "+43 6245 93053 00";
const PHONE_TEL = "+4362459305300";

const T = {
  de: {
    title: "Hinweis zum Schutz Ihres Profils",
    preview: "Das Profil wurde entfernt – so schützen Sie sich vor erneutem Auftauchen.",
    greeting: "Guten Tag,",
    p1: "vielen Dank für die rasche Bezahlung. Ein Hinweis meinerseits noch …",
    p2: "Das Profil wurde vollständig entfernt und kann so auch nicht mehr auftauchen.",
    noteA: "Aber: ",
    noteB: "Dritte, Kunden, Mitarbeiter etc. können theoretisch jederzeit wieder ein neues Profil einstellen – das liegt an der Offenheit des Google-Systems (",
    noteLink: "siehe hier",
    noteC: ").",
    offer: "Falls Sie auch dagegen geschützt sein möchten, bieten wir eine Schutz-Lösung an, die dann sofort aktiv ist:",
    cta: "Schutz jetzt buchen",
    price: "Der Schutz kostet 24,90 € pro Monat und verhindert bei Wiederauftauchen, dass die Löschung erneut bezahlt werden muss. Das Abo ist jederzeit kündbar.",
    questionsA: "Wenn es noch Fragen gibt, bitte jederzeit gerne antworten oder telefonisch unter ",
    questionsB: " 😉",
    signoff1: "Liebe Grüße aus Salzburg",
    signoff2: "Maximilian Hölzl",
    subject: "Hinweis zum Schutzmodell",
  },
  en: {
    title: "A note on protecting your profile",
    preview: "Your profile has been removed – here's how to stay protected.",
    greeting: "Hello again,",
    p1: "thank you very much for the prompt payment. Just one more note from my side …",
    p2: "The profile has been completely removed and cannot reappear in its current form.",
    noteA: "However: ",
    noteB: "Third parties, customers, employees, etc. could theoretically create a new profile at any time, due to the openness of the Google system (",
    noteLink: "see here",
    noteC: ").",
    offer: "If you would like to be protected against this as well, we offer a protection solution that becomes active immediately:",
    cta: "Book protection now",
    price: "This protection costs $24.90 per month and ensures that if the profile reappears, you will not have to pay for deletion again. The subscription can be canceled at any time.",
    questionsA: "If you have any further questions, please feel free to reply",
    questionsB: " 😉",
    signoff1: "Best regards from Salzburg,",
    signoff2: "Max from RapidRemove",
    subject: "Important: No protection plan booked",
  },
};

export function subject(p: SchutzhinweisProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Schutzhinweis({ lang = "de", protectionUrl }: SchutzhinweisProps = {}) {
  const l = lang === "en" ? "en" : "de";
  const t = T[l];
  const payUrl = protectionUrl || PROTECTION_URL[l];
  return (
    <EmailShell preview={t.preview} title={t.title} lang={l}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P>{t.p2}</P>
      <NoteBox>
        <strong>{t.noteA}</strong>{t.noteB}<A href={GOOGLE_HELP[l]}>{t.noteLink}</A>{t.noteC}
      </NoteBox>
      <P>{t.offer}</P>
      <Section style={{ margin: "18px 0 8px" }}>
        <CtaButton href={payUrl} full>{t.cta}</CtaButton>
      </Section>
      <P muted>{t.price}</P>
      <P>
        {l === "de"
          ? <>{t.questionsA}<A href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</A>{t.questionsB}</>
          : <>{t.questionsA}{t.questionsB}</>}
      </P>
      <P>{t.signoff1}<br />{t.signoff2}</P>
    </EmailShell>
  );
}
