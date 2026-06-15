/* Template: Kurzer Fragebogen zur Bestellung / Short order questionnaire (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface FragebogenProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; formUrl?: string; }

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
  es: {
    title: "Un breve cuestionario: nos ayuda con su eliminación",
    preview: "Opcional, unos 2 minutos: responda brevemente a 5 preguntas sobre su pedido.",
    greeting: "Estimados señores:",
    p1: "para tramitar su eliminación de forma más rápida y sin contratiempos, nos resulta de gran ayuda un breve cuestionario: 5 preguntas rápidas de sí/no, unos 2 minutos. Responder es voluntario, pero agiliza notablemente la tramitación.",
    cta: "Rellenar el cuestionario",
    p2: "¡Muchas gracias por su colaboración!",
    subject: "Un breve cuestionario sobre su pedido",
  },
  fr: {
    title: "Un court questionnaire – nous aide pour votre suppression",
    preview: "Facultatif, environ 2 minutes – répondez brièvement à 5 questions sur votre commande.",
    greeting: "Madame, Monsieur,",
    p1: "pour traiter votre suppression plus rapidement et sans accroc, un court questionnaire nous est utile – 5 questions rapides par oui/non, environ 2 minutes. Y répondre est facultatif, mais cela accélère sensiblement le traitement.",
    cta: "Remplir le questionnaire",
    p2: "Merci beaucoup pour votre aide !",
    subject: "Un court questionnaire sur votre commande",
  },
  it: {
    title: "Un breve questionario – ci aiuta con la sua rimozione",
    preview: "Facoltativo, circa 2 minuti – risponda brevemente a 5 domande sul suo ordine.",
    greeting: "Gentili Signore e Signori,",
    p1: "per elaborare la sua rimozione più rapidamente e senza intoppi, un breve questionario ci è di aiuto – 5 rapide domande sì/no, circa 2 minuti. Rispondere è facoltativo, ma velocizza sensibilmente la lavorazione.",
    cta: "Compilare il questionario",
    p2: "Grazie mille per il suo supporto!",
    subject: "Un breve questionario sul suo ordine",
  },
  nl: {
    title: "Een korte vragenlijst – helpt ons bij uw verwijdering",
    preview: "Optioneel, ongeveer 2 minuten – beantwoord kort 5 vragen over uw bestelling.",
    greeting: "Geachte heer/mevrouw,",
    p1: "om uw verwijdering sneller en soepeler af te handelen, helpt een korte vragenlijst ons – 5 korte ja/nee-vragen, ongeveer 2 minuten. Het beantwoorden is vrijwillig, maar versnelt de afhandeling merkbaar.",
    cta: "Vragenlijst invullen",
    p2: "Hartelijk dank voor uw medewerking!",
    subject: "Een korte vragenlijst over uw bestelling",
  },
  pt: {
    title: "Um breve questionário – ajuda-nos com a sua eliminação",
    preview: "Opcional, cerca de 2 minutos – responda brevemente a 5 perguntas sobre a sua encomenda.",
    greeting: "Exmos. Senhores,",
    p1: "para processar a sua eliminação de forma mais rápida e sem contratempos, um breve questionário ajuda-nos – 5 perguntas rápidas de sim/não, cerca de 2 minutos. Responder é facultativo, mas acelera consideravelmente o processamento.",
    cta: "Preencher o questionário",
    p2: "Muito obrigado pela sua colaboração!",
    subject: "Um breve questionário sobre a sua encomenda",
  },
  ja: {
    title: "簡単なアンケート – 削除のお手伝いに役立ちます",
    preview: "任意、約2分 – ご注文に関する5つの質問に簡単にお答えください。",
    greeting: "ご担当者様",
    p1: "お客様の削除をより迅速かつスムーズに処理するため、簡単なアンケートが役立ちます。はい/いいえで答える5つの質問で、約2分です。ご回答は任意ですが、処理を目に見えて早めることができます。",
    cta: "アンケートに回答する",
    p2: "ご協力ありがとうございます。",
    subject: "ご注文に関する簡単なアンケート",
  },
  sv: {
    title: "Ett kort frågeformulär – hjälper oss med din borttagning",
    preview: "Valfritt, cirka 2 minuter – svara kort på 5 frågor om din beställning.",
    greeting: "Hej,",
    p1: "för att handlägga din borttagning snabbare och smidigare hjälper ett kort frågeformulär oss – 5 snabba ja/nej-frågor, cirka 2 minuter. Att svara är frivilligt, men det snabbar märkbart upp handläggningen.",
    cta: "Fyll i frågeformuläret",
    p2: "Tack så mycket för din hjälp!",
    subject: "Ett kort frågeformulär om din beställning",
  },
  da: {
    title: "Et kort spørgeskema – hjælper os med din fjernelse",
    preview: "Valgfrit, cirka 2 minutter – besvar kort 5 spørgsmål om din bestilling.",
    greeting: "Kære kunde,",
    p1: "for at behandle din fjernelse hurtigere og smidigere er et kort spørgeskema en hjælp for os – 5 hurtige ja/nej-spørgsmål, cirka 2 minutter. Det er frivilligt at svare, men det fremskynder behandlingen mærkbart.",
    cta: "Udfyld spørgeskemaet",
    p2: "Mange tak for din hjælp!",
    subject: "Et kort spørgeskema om din bestilling",
  },
  no: {
    title: "Et kort spørreskjema – hjelper oss med fjerningen din",
    preview: "Valgfritt, cirka 2 minutter – svar kort på 5 spørsmål om bestillingen din.",
    greeting: "Hei,",
    p1: "for å behandle fjerningen din raskere og smidigere er et kort spørreskjema til hjelp for oss – 5 raske ja/nei-spørsmål, cirka 2 minutter. Det er frivillig å svare, men det fremskynder behandlingen merkbart.",
    cta: "Fyll ut spørreskjemaet",
    p2: "Tusen takk for hjelpen!",
    subject: "Et kort spørreskjema om bestillingen din",
  },
};

export function subject(p: FragebogenProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Fragebogen({ lang = "de", formUrl = "https://www.rapid-remove.com" }: FragebogenProps = {}) {
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
