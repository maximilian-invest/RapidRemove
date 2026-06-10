/* Template: Profil verifizieren / Verify profile (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface VerifizierenProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Bitte verifizieren Sie Ihr Profil!",
    preview: "Für die Entfernung müssen wir Ihr Google-Profil verifizieren.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil. Dazu muss Ihr Profil verifiziert werden.",
    howBold: "Wie geht das?",
    how: " Bitte suchen Sie in Google nach Ihrem Unternehmen und klicken Sie auf ",
    howQuote: "„Inhaber dieses Unternehmens?“",
    howRest: " und folgen Sie den Anweisungen.",
    p3: "Sollten Probleme bei der Verifizierung auftauchen, so antworten Sie bitte auf diese E-Mail. Vielen Dank!",
    subject: "Bitte verifizieren Sie Ihr Profil",
  },
  en: {
    title: "Please Verify Your Profile!",
    preview: "To proceed with the removal we need to verify your Google profile.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you very much for your trust and your recent order. In order to proceed with the removal, we urgently require editing rights to your Google Business Profile. To grant these, your profile must be verified.",
    howBold: "How does it work?",
    how: " Please search for your company on Google and click on ",
    howQuote: "“Own this business?”",
    howRest: ", then follow the instructions provided.",
    p3: "If you encounter any issues during the verification process, please reply to this email. Thank you!",
    subject: "Please verify your profile",
  },
  es: {
    title: "¡Verifique su perfil, por favor!",
    preview: "Para llevar a cabo la eliminación, debemos verificar su perfil de Google.",
    greeting: "Estimados señores:",
    p1: "muchas gracias por su confianza y por su reciente pedido. Para llevar a cabo la eliminación, necesitamos imprescindiblemente permisos de edición sobre el perfil de empresa de Google. Para ello, es necesario verificar su perfil.",
    howBold: "¿Cómo se hace?",
    how: " Busque su empresa en Google y haga clic en ",
    howQuote: "«¿Es el propietario de esta empresa?»",
    howRest: " y siga las instrucciones.",
    p3: "Si surge algún problema durante la verificación, responda a este correo electrónico. ¡Muchas gracias!",
    subject: "Verifique su perfil, por favor",
  },
  fr: {
    title: "Veuillez vérifier votre profil !",
    preview: "Pour procéder à la suppression, nous devons vérifier votre profil Google.",
    greeting: "Madame, Monsieur,",
    p1: "merci beaucoup pour votre confiance et votre récente commande. Pour procéder à la suppression, nous avons impérativement besoin de droits de modification sur la fiche d'établissement Google. Pour cela, votre profil doit être vérifié.",
    howBold: "Comment faire ?",
    how: " Recherchez votre établissement sur Google et cliquez sur ",
    howQuote: "« Vous êtes le propriétaire de cet établissement ? »",
    howRest: " puis suivez les instructions.",
    p3: "Si vous rencontrez des problèmes lors de la vérification, veuillez répondre à cet e-mail. Merci !",
    subject: "Veuillez vérifier votre profil",
  },
  it: {
    title: "La preghiamo di verificare il suo profilo!",
    preview: "Per procedere alla rimozione, dobbiamo verificare il suo profilo Google.",
    greeting: "Gentili Signore e Signori,",
    p1: "la ringraziamo per la fiducia accordataci e per il suo recente ordine. Per procedere alla rimozione, abbiamo assolutamente bisogno dei diritti di modifica sul profilo dell'attività su Google. A tal fine, il suo profilo deve essere verificato.",
    howBold: "Come si fa?",
    how: " Cerchi la sua attività su Google e faccia clic su ",
    howQuote: "«Sei il proprietario di questa attività?»",
    howRest: " e segua le istruzioni.",
    p3: "Se dovessero verificarsi problemi durante la verifica, la preghiamo di rispondere a questa e-mail. Grazie!",
    subject: "La preghiamo di verificare il suo profilo",
  },
  nl: {
    title: "Verifieer uw profiel!",
    preview: "Om de verwijdering uit te voeren, moeten wij uw Google-profiel verifiëren.",
    greeting: "Geachte heer/mevrouw,",
    p1: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Om de verwijdering uit te voeren, hebben wij absoluut bewerkingsrechten voor het Google-bedrijfsprofiel nodig. Daarvoor moet uw profiel worden geverifieerd.",
    howBold: "Hoe werkt dat?",
    how: " Zoek uw bedrijf op in Google en klik op ",
    howQuote: "‘Bent u de eigenaar van dit bedrijf?’",
    howRest: " en volg de instructies.",
    p3: "Mochten er problemen optreden bij de verificatie, beantwoord dan deze e-mail. Hartelijk dank!",
    subject: "Verifieer uw profiel",
  },
  pt: {
    title: "Verifique o seu perfil, por favor!",
    preview: "Para procedermos à remoção, precisamos de verificar o seu perfil do Google.",
    greeting: "Exmos. Senhores,",
    p1: "muito obrigado pela sua confiança e pelo seu recente pedido. Para procedermos à remoção, necessitamos imprescindivelmente de permissões de edição no perfil de empresa do Google. Para tal, o seu perfil tem de ser verificado.",
    howBold: "Como se faz?",
    how: " Procure a sua empresa no Google e clique em ",
    howQuote: "«É o proprietário desta empresa?»",
    howRest: " e siga as instruções.",
    p3: "Caso surjam problemas durante a verificação, responda a este e-mail. Muito obrigado!",
    subject: "Verifique o seu perfil",
  },
  ja: {
    title: "プロフィールを認証してください。",
    preview: "削除を進めるには、お客様のGoogleプロフィールを認証する必要があります。",
    greeting: "ご担当者様",
    p1: "このたびはご信頼いただき、またご注文を賜り、誠にありがとうございます。削除を進めるにあたり、Googleビジネスプロフィールの編集権限が必ず必要となります。そのためには、お客様のプロフィールを認証していただく必要があります。",
    howBold: "手順は？",
    how: " Googleでお客様のビジネスを検索し、",
    howQuote: "「このビジネスのオーナーですか？」",
    howRest: " をクリックして、表示される手順に従ってください。",
    p3: "認証の際に問題が発生した場合は、このメールにご返信ください。よろしくお願いいたします。",
    subject: "プロフィールを認証してください",
  },
  sv: {
    title: "Verifiera din profil!",
    preview: "För att kunna genomföra borttagningen behöver vi verifiera din Google-profil.",
    greeting: "Hej,",
    p1: "tack för ditt förtroende och för din nyligen gjorda beställning. För att kunna genomföra borttagningen behöver vi ovillkorligen redigeringsbehörighet till Google-företagsprofilen. För detta måste din profil verifieras.",
    howBold: "Hur går det till?",
    how: " Sök efter ditt företag på Google och klicka på ",
    howQuote: "”Äger du det här företaget?”",
    howRest: " och följ anvisningarna.",
    p3: "Om det uppstår problem under verifieringen, vänligen svara på det här mejlet. Tack!",
    subject: "Verifiera din profil",
  },
  da: {
    title: "Bekræft din profil!",
    preview: "For at gennemføre fjernelsen skal vi bekræfte din Google-profil.",
    greeting: "Kære kunde,",
    p1: "mange tak for din tillid og din nylige bestilling. For at gennemføre fjernelsen har vi ubetinget brug for redigeringsrettigheder til Google-virksomhedsprofilen. Til det skal din profil bekræftes.",
    howBold: "Hvordan gør jeg det?",
    how: " Søg efter din virksomhed på Google, og klik på ",
    howQuote: "”Ejer du denne virksomhed?”",
    howRest: ", og følg vejledningen.",
    p3: "Hvis der opstår problemer under bekræftelsen, bedes du svare på denne e-mail. Mange tak!",
    subject: "Bekræft din profil",
  },
  no: {
    title: "Bekreft profilen din!",
    preview: "For å gjennomføre fjerningen må vi bekrefte Google-profilen din.",
    greeting: "Hei,",
    p1: "tusen takk for tilliten og for din nylige bestilling. For å gjennomføre fjerningen trenger vi ubetinget redigeringsrettigheter til Google-bedriftsprofilen. For å få dette må profilen din bekreftes.",
    howBold: "Hvordan gjør jeg det?",
    how: " Søk etter bedriften din på Google, og klikk på ",
    howQuote: "«Eier du denne bedriften?»",
    howRest: ", og følg instruksjonene.",
    p3: "Hvis det oppstår problemer under bekreftelsen, vennligst svar på denne e-posten. Tusen takk!",
    subject: "Bekreft profilen din",
  },
};

export function subject(p: VerifizierenProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Verifizieren({ lang = "de" }: VerifizierenProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong>{t.howBold}</strong>{t.how}<strong>{t.howQuote}</strong>{t.howRest}</P>
      <P>{t.p3}</P>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
