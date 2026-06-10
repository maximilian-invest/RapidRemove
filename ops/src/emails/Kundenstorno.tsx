/* Template: Kundenstorno – auf Kundenwunsch storniert / Canceled as requested (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface KundenstornoProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Ihr Auftrag wurde wie gewünscht storniert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. ",
    p1Bold: "Ihr Auftrag wurde wie gewünscht storniert.",
    accessBold: "Wie erhalte ich wieder Zugriff auf mein Profil?",
    access: " Bitte suchen Sie nach Ihrem Unternehmen in Google, klicken Sie auf „Inhaber dieses Profils?“ und folgen Sie den Anweisungen.",
    p3: "Falls Sie weitere Fragen haben oder wir Ihnen anderweitig behilflich sein können, so kontaktieren Sie uns gerne jederzeit!",
    p4: "Vielen Dank und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "We have cancelled your order as requested.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you once again for placing your trust in us and for your recent order. ",
    p1Bold: "We have cancelled your order as requested.",
    accessBold: "How do I regain access to my profile?",
    access: " Please search for your business on Google, click on “Own this business?” and follow the instructions.",
    p3: "Please don’t hesitate to reach out if you have any further questions or if there’s anything else we can assist you with.",
    p4: "We wish you continued success in your business.",
    subject: "Your order has been canceled",
  },
  es: {
    title: "¡Su pedido ha sido cancelado!",
    preview: "Hemos cancelado su pedido tal y como nos solicitó.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su confianza y por su reciente pedido. ",
    p1Bold: "Hemos cancelado su pedido tal y como nos solicitó.",
    accessBold: "¿Cómo recupero el acceso a mi perfil?",
    access: " Busque su empresa en Google, haga clic en «¿Es el propietario de este perfil?» y siga las instrucciones.",
    p3: "Si tiene alguna otra pregunta o si podemos ayudarle en cualquier otra cosa, no dude en ponerse en contacto con nosotros en cualquier momento.",
    p4: "¡Muchas gracias y le deseamos lo mejor!",
    subject: "Su pedido ha sido cancelado",
  },
  fr: {
    title: "Votre commande a été annulée !",
    preview: "Nous avons annulé votre commande comme vous l'aviez demandé.",
    greeting: "Madame, Monsieur,",
    p1a: "nous vous remercions de votre confiance et de votre récente commande. ",
    p1Bold: "Nous avons annulé votre commande comme vous l'aviez demandé.",
    accessBold: "Comment retrouver l'accès à ma fiche ?",
    access: " Recherchez votre établissement sur Google, cliquez sur « Vous êtes le propriétaire de cette fiche ? » et suivez les instructions.",
    p3: "Si vous avez d'autres questions ou si nous pouvons vous aider d'une quelconque manière, n'hésitez pas à nous contacter à tout moment !",
    p4: "Merci beaucoup et nous vous souhaitons une bonne continuation !",
    subject: "Votre commande a été annulée",
  },
  it: {
    title: "Il suo ordine è stato annullato!",
    preview: "Abbiamo annullato il suo ordine come richiesto.",
    greeting: "Gentili Signore e Signori,",
    p1a: "la ringraziamo per la sua fiducia e per il suo recente ordine. ",
    p1Bold: "Abbiamo annullato il suo ordine come richiesto.",
    accessBold: "Come posso riottenere l'accesso al mio profilo?",
    access: " Cerchi la sua attività su Google, faccia clic su «Sei il proprietario di questo profilo?» e segua le istruzioni.",
    p3: "Se ha altre domande o se possiamo esserle utili in qualche altro modo, non esiti a contattarci in qualsiasi momento!",
    p4: "Grazie mille e le auguriamo ogni bene!",
    subject: "Il suo ordine è stato annullato",
  },
  nl: {
    title: "Uw bestelling is geannuleerd!",
    preview: "We hebben uw bestelling zoals gewenst geannuleerd.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw vertrouwen en uw recente bestelling. ",
    p1Bold: "We hebben uw bestelling zoals gewenst geannuleerd.",
    accessBold: "Hoe krijg ik weer toegang tot mijn profiel?",
    access: " Zoek uw bedrijf op Google, klik op ‘Bent u de eigenaar van dit profiel?’ en volg de instructies.",
    p3: "Als u nog vragen heeft of als we u op een andere manier van dienst kunnen zijn, neem dan gerust altijd contact met ons op!",
    p4: "Hartelijk dank en nog veel succes!",
    subject: "Uw bestelling is geannuleerd",
  },
  pt: {
    title: "O seu pedido foi cancelado!",
    preview: "Cancelámos o seu pedido conforme solicitado.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pela sua confiança e pelo seu recente pedido. ",
    p1Bold: "Cancelámos o seu pedido conforme solicitado.",
    accessBold: "Como posso recuperar o acesso ao meu perfil?",
    access: " Procure a sua empresa no Google, clique em «É o proprietário deste perfil?» e siga as instruções.",
    p3: "Se tiver outras questões ou se pudermos ajudá-lo de alguma outra forma, não hesite em contactar-nos a qualquer momento!",
    p4: "Muito obrigado e votos de continuação de sucesso!",
    subject: "O seu pedido foi cancelado",
  },
  ja: {
    title: "ご注文をキャンセルいたしました!",
    preview: "ご要望どおり、ご注文をキャンセルいたしました。",
    greeting: "ご担当者様",
    p1a: "このたびはご信頼を賜り、またご注文をいただき、誠にありがとうございます。",
    p1Bold: "ご要望どおり、ご注文をキャンセルいたしました。",
    accessBold: "プロフィールへのアクセスを再び取得するには?",
    access: " Googleでお客様のビジネスを検索し、「このプロフィールのオーナーですか?」をクリックして、表示される手順に従ってください。",
    p3: "その他ご不明な点がございましたら、またその他の面でお力になれることがございましたら、いつでもお気軽にお問い合わせください。",
    p4: "ありがとうございました。今後のますますのご発展をお祈り申し上げます。",
    subject: "ご注文をキャンセルいたしました",
  },
  sv: {
    title: "Din beställning har annullerats!",
    preview: "Vi har annullerat din beställning enligt önskemål.",
    greeting: "Hej,",
    p1a: "tack för ditt förtroende och för din nyligen gjorda beställning. ",
    p1Bold: "Vi har annullerat din beställning enligt önskemål.",
    accessBold: "Hur återfår jag åtkomst till min profil?",
    access: " Sök efter ditt företag på Google, klicka på ”Äger du det här företaget?” och följ anvisningarna.",
    p3: "Om du har fler frågor eller om vi kan hjälpa dig med något annat är du varmt välkommen att kontakta oss när som helst!",
    p4: "Tack så mycket och fortsatt lycka till!",
    subject: "Din beställning har annullerats",
  },
  da: {
    title: "Din ordre er blevet annulleret!",
    preview: "Vi har annulleret din ordre som ønsket.",
    greeting: "Kære kunde,",
    p1a: "tak for din tillid og for din nylige bestilling. ",
    p1Bold: "Vi har annulleret din ordre som ønsket.",
    accessBold: "Hvordan får jeg adgang til min profil igen?",
    access: " Søg efter din virksomhed på Google, klik på »Ejer du denne profil?« og følg vejledningen.",
    p3: "Hvis du har yderligere spørgsmål, eller hvis vi på anden måde kan være dig behjælpelige, er du altid velkommen til at kontakte os!",
    p4: "Mange tak og fortsat held og lykke!",
    subject: "Din ordre er blevet annulleret",
  },
  no: {
    title: "Bestillingen din er kansellert!",
    preview: "Vi har kansellert bestillingen din som ønsket.",
    greeting: "Hei,",
    p1a: "takk for tilliten og for din nylige bestilling. ",
    p1Bold: "Vi har kansellert bestillingen din som ønsket.",
    accessBold: "Hvordan får jeg tilgang til profilen min igjen?",
    access: " Søk etter bedriften din på Google, klikk på «Eier du denne profilen?» og følg instruksjonene.",
    p3: "Hvis du har flere spørsmål, eller hvis vi kan hjelpe deg med noe annet, er du alltid velkommen til å kontakte oss!",
    p4: "Tusen takk, og fortsatt lykke til!",
    subject: "Bestillingen din er kansellert",
  },
};

export function subject(p: KundenstornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Kundenstorno({ lang = "de" }: KundenstornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <P><strong><u>{t.accessBold}</u></strong>{t.access}</P>
      <P>{t.p3}</P>
      <P>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
