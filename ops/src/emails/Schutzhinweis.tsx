/* Template: Hinweis zum Schutzmodell – Upsell nach Einmal-Löschung (DE/EN).
   3 Varianten für eine Serie über ~2 Wochen (Tag 0 / 7 / 14):
     variant 1 = Erstansprache (Wortlaut 1:1 aus make.com Module 43/44),
     variant 2 = freundliches Nachfassen,
     variant 3 = letzte Erinnerung.
   Wird nach einer Einmalzahlung ohne Abo verschickt und bewirbt den
   monatlichen Schutz. */
import * as React from "react";
import { EmailShell, P, A, NoteBox, CtaButton } from "./components";
import { Section } from "@react-email/components";

export interface SchutzhinweisProps { lang?: "de" | "en"; variant?: 1 | 2 | 3; protectionUrl?: string; }

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

interface Copy {
  title: string; preview: string; greeting: string; p1: string; p2: string;
  noteA: string; noteB: string; noteLink: string; noteC: string;
  offer: string; cta: string; price: string;
  questionsA: string; questionsB: string; signoff1: string; signoff2: string; subject: string;
}

const QUESTIONS_DE = { questionsA: "Wenn es noch Fragen gibt, bitte jederzeit gerne antworten oder telefonisch unter ", questionsB: " 😉", signoff1: "Liebe Grüße aus Salzburg", signoff2: "Maximilian Hölzl" };
const QUESTIONS_EN = { questionsA: "If you have any further questions, please feel free to reply", questionsB: " 😉", signoff1: "Best regards from Salzburg,", signoff2: "Max from RapidRemove" };

const T: Record<"de" | "en", Copy[]> = {
  de: [
    {
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
      ...QUESTIONS_DE,
      subject: "Hinweis zum Schutzmodell",
    },
    {
      title: "Schon an den Schutz gedacht?",
      preview: "Kurze Erinnerung – so verhindern Sie, dass Ihr Profil erneut auftaucht.",
      greeting: "Guten Tag,",
      p1: "ich wollte mich kurz noch einmal melden. Ihre Löschung ist erledigt – das Profil ist aktuell verschwunden.",
      p2: "Erfahrungsgemäß werden gelöschte Einträge aber oft innerhalb weniger Wochen erneut angelegt: durch Mitbewerber, ehemalige Mitarbeiter oder automatisch durch Google.",
      noteA: "Wichtig: ",
      noteB: "Taucht das Profil ohne Schutz wieder auf, fällt erneut die volle Löschgebühr an. Mit unserem Schutzmodell übernehmen wir jede weitere Entfernung für Sie – das liegt an der Offenheit des Google-Systems (",
      noteLink: "siehe hier",
      noteC: ").",
      offer: "Mit dem monatlichen Schutz sind Sie ab sofort auf der sicheren Seite:",
      cta: "Schutz aktivieren",
      price: "Der Schutz kostet 24,90 € pro Monat, ist jederzeit kündbar – und Sie zahlen nie wieder für eine erneute Löschung.",
      ...QUESTIONS_DE,
      subject: "Ist Ihr Profil schon geschützt?",
    },
    {
      title: "Letzte Erinnerung zum Profilschutz",
      preview: "Ihr Eintrag ist aktuell ohne Schutz – danach lasse ich Sie damit in Ruhe.",
      greeting: "Guten Tag,",
      p1: "das ist meine letzte Erinnerung zum Thema Schutz – danach lasse ich Sie damit in Ruhe 😊.",
      p2: "Ihr Profil wurde erfolgreich entfernt, ist momentan aber nicht gegen ein erneutes Auftauchen abgesichert.",
      noteA: "Zur Erinnerung: ",
      noteB: "Sollte der Eintrag wieder erscheinen, müssten Sie die Löschung erneut beauftragen und bezahlen. Genau das nimmt Ihnen das Schutzmodell ab – Hintergrund zum Google-System (",
      noteLink: "hier",
      noteC: ").",
      offer: "Wenn Sie dauerhaft Ruhe haben möchten, aktivieren Sie den Schutz hier:",
      cta: "Jetzt absichern",
      price: "24,90 € pro Monat, jederzeit kündbar. Bei erneutem Auftauchen übernehmen wir die Löschung für Sie kostenlos.",
      ...QUESTIONS_DE,
      subject: "Letzte Erinnerung: Profil noch ungeschützt",
    },
  ],
  en: [
    {
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
      ...QUESTIONS_EN,
      subject: "Important: No protection plan booked",
    },
    {
      title: "Have you considered protection yet?",
      preview: "A quick reminder – here's how to stop your profile from reappearing.",
      greeting: "Hello again,",
      p1: "I just wanted to follow up briefly. Your deletion is complete – the profile is currently gone.",
      p2: "In our experience, however, deleted entries are often re-created within a few weeks: by competitors, former employees, or automatically by Google.",
      noteA: "Important: ",
      noteB: "If the profile reappears without protection, the full deletion fee applies again. With our protection plan we take care of every further removal for you – this is due to the openness of the Google system (",
      noteLink: "see here",
      noteC: ").",
      offer: "With the monthly protection you're on the safe side from now on:",
      cta: "Activate protection",
      price: "Protection costs $24.90 per month, can be canceled at any time – and you'll never pay for another deletion again.",
      ...QUESTIONS_EN,
      subject: "Is your profile protected yet?",
    },
    {
      title: "Last reminder about protecting your profile",
      preview: "Your listing is currently unprotected – then I'll leave you in peace.",
      greeting: "Hello again,",
      p1: "this is my last reminder about protection – after this I'll leave you in peace 😊.",
      p2: "Your profile has been removed successfully, but it is currently not protected against reappearing.",
      noteA: "As a reminder: ",
      noteB: "Should the entry show up again, you would have to order and pay for the deletion once more. That's exactly what the protection plan takes off your plate – background on the Google system (",
      noteLink: "here",
      noteC: ").",
      offer: "If you'd like lasting peace of mind, activate protection here:",
      cta: "Protect my profile",
      price: "$24.90 per month, cancel anytime. If the profile reappears, we'll remove it again free of charge.",
      ...QUESTIONS_EN,
      subject: "Last reminder: your profile is still unprotected",
    },
  ],
};

const pick = (lang?: string, variant?: number) => {
  const l = lang === "en" ? "en" : "de";
  const v = Math.min(3, Math.max(1, Number(variant) || 1)) - 1;
  return { l: l as "de" | "en", t: T[l as "de" | "en"][v] };
};

export function subject(p: SchutzhinweisProps = {}): string {
  return pick(p.lang, p.variant).t.subject;
}

export default function Schutzhinweis({ lang = "de", variant = 1, protectionUrl }: SchutzhinweisProps = {}) {
  const { l, t } = pick(lang, variant);
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
