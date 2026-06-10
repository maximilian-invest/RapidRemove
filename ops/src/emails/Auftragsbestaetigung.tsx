/* Template: Auftragsbestätigung / Order Confirmation (DE/EN). */
import * as React from "react";
import { EmailShell, P, NoteBox } from "./components";

export interface AuftragsbestaetigungProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** optionale persönliche Anrede, sonst formell */
  anrede?: string;
}

const T = {
  de: {
    title: "Auftragsbestätigung ✓",
    preview: "Vielen Dank für Ihren Auftrag – wir beginnen umgehend mit der Bearbeitung.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "vielen Dank für Ihren Auftrag. Wir ",
    introBold: "beginnen umgehend",
    introRest: " mit der Bearbeitung.",
    noteBold: "Wichtig — Anfrage zur Inhaberschaft:",
    note: " Unter Umständen erhalten Sie eine E-Mail von Google, in welcher wir die Bearbeitungsrechte des Profils anfordern. Bitte klicken Sie in dieser E-Mail auf „Antworten“ und übertragen Sie die Rechte. Wir erhalten dadurch keinen Zugriff auf persönliche Daten oder andere Google-Dienste.",
    outro: "Sie hören in Kürze wieder von uns. Bei Fragen antworten Sie einfach auf diese E-Mail – wir sind schnell für Sie da.",
    subject: "Auftragsbestätigung – RapidRemove",
  },
  en: {
    title: "Order Confirmed ✓",
    preview: "Thank you for your order – we will begin processing it immediately.",
    greeting: "Dear Sir or Madam,",
    intro: "thank you for your order. We will begin processing it ",
    introBold: "immediately",
    introRest: ".",
    noteBold: "Important — Request for Ownership:",
    note: " You may receive an email from Google requesting profile editing rights. Please click “Respond” in this email and transfer the rights. We will not gain access to personal data or other Google services.",
    outro: "You will hear from us again shortly. If you have any questions, simply reply to this email – we are quick to assist you.",
    subject: "Order confirmation – RapidRemove",
  },
  es: {
    title: "Confirmación del pedido ✓",
    preview: "Muchas gracias por su pedido: comenzaremos a tramitarlo de inmediato.",
    greeting: "Estimados señores:",
    intro: "muchas gracias por su pedido. ",
    introBold: "Comenzaremos de inmediato",
    introRest: " con la tramitación.",
    noteBold: "Importante: solicitud de titularidad:",
    note: " Es posible que reciba un correo de Google en el que solicitamos los derechos de edición del perfil. Haga clic en «Responder» en ese correo y transfiéranos los derechos. De este modo no obtenemos acceso a datos personales ni a otros servicios de Google.",
    outro: "Volveremos a ponernos en contacto con usted en breve. Si tiene alguna duda, basta con que responda a este correo: le atenderemos con rapidez.",
    subject: "Confirmación del pedido – RapidRemove",
  },
  fr: {
    title: "Confirmation de commande ✓",
    preview: "Merci beaucoup pour votre commande – nous commençons le traitement sans délai.",
    greeting: "Madame, Monsieur,",
    intro: "merci beaucoup pour votre commande. Nous ",
    introBold: "commençons sans délai",
    introRest: " le traitement.",
    noteBold: "Important — demande de propriété :",
    note: " Il se peut que vous receviez un e-mail de Google par lequel nous demandons les droits de modification de la fiche. Veuillez cliquer sur « Répondre » dans cet e-mail et nous transférer les droits. Nous n'obtenons ainsi aucun accès à vos données personnelles ni à d'autres services Google.",
    outro: "Vous aurez bientôt de nos nouvelles. Pour toute question, répondez simplement à cet e-mail – nous sommes là pour vous répondre rapidement.",
    subject: "Confirmation de commande – RapidRemove",
  },
  it: {
    title: "Conferma dell'ordine ✓",
    preview: "Grazie mille per il suo ordine: iniziamo subito la lavorazione.",
    greeting: "Gentili Signore e Signori,",
    intro: "grazie mille per il suo ordine. ",
    introBold: "Iniziamo subito",
    introRest: " la lavorazione.",
    noteBold: "Importante — richiesta di titolarità:",
    note: " Potrebbe ricevere un'e-mail da Google con cui richiediamo i diritti di modifica del profilo. La preghiamo di cliccare su «Rispondi» in questa e-mail e di trasferirci i diritti. In questo modo non otteniamo alcun accesso a dati personali o ad altri servizi Google.",
    outro: "Avrà presto nostre notizie. Per qualsiasi domanda, risponda semplicemente a questa e-mail: siamo a sua disposizione in tempi rapidi.",
    subject: "Conferma dell'ordine – RapidRemove",
  },
  nl: {
    title: "Orderbevestiging ✓",
    preview: "Hartelijk dank voor uw bestelling – we beginnen direct met de verwerking.",
    greeting: "Geachte heer/mevrouw,",
    intro: "hartelijk dank voor uw bestelling. We ",
    introBold: "beginnen direct",
    introRest: " met de verwerking.",
    noteBold: "Belangrijk — verzoek om eigenaarschap:",
    note: " Mogelijk ontvangt u een e-mail van Google waarin wij de bewerkingsrechten van het profiel aanvragen. Klik in die e-mail op ‘Beantwoorden’ en draag de rechten over. Wij krijgen daardoor geen toegang tot persoonlijke gegevens of andere Google-diensten.",
    outro: "U hoort binnenkort weer van ons. Heeft u vragen, antwoord dan gewoon op deze e-mail – we staan snel voor u klaar.",
    subject: "Orderbevestiging – RapidRemove",
  },
  pt: {
    title: "Confirmação da encomenda ✓",
    preview: "Muito obrigado pela sua encomenda – iniciamos o processamento de imediato.",
    greeting: "Exmos. Senhores,",
    intro: "muito obrigado pela sua encomenda. ",
    introBold: "Iniciamos de imediato",
    introRest: " o processamento.",
    noteBold: "Importante — pedido de titularidade:",
    note: " Poderá receber um e-mail da Google no qual solicitamos os direitos de edição do perfil. Clique em «Responder» nesse e-mail e transfira-nos os direitos. Desta forma não obtemos acesso a dados pessoais nem a outros serviços Google.",
    outro: "Voltaremos a contactá-lo em breve. Em caso de dúvidas, basta responder a este e-mail – estamos rapidamente ao seu dispor.",
    subject: "Confirmação da encomenda – RapidRemove",
  },
  ja: {
    title: "注文確認 ✓",
    preview: "ご注文ありがとうございます。直ちに処理を開始いたします。",
    greeting: "ご担当者様",
    intro: "ご注文いただき誠にありがとうございます。",
    introBold: "直ちに",
    introRest: "処理を開始いたします。",
    noteBold: "重要 — 所有権の確認依頼:",
    note: " Googleから、プロフィールの編集権限を求めるメールが届く場合があります。そのメール内の「返信」をクリックし、権限を移譲してください。これにより、当社が個人データやその他のGoogleサービスにアクセスすることはありません。",
    outro: "近日中に改めてご連絡いたします。ご不明な点がございましたら、このメールにご返信ください。迅速に対応いたします。",
    subject: "注文確認 – RapidRemove",
  },
  sv: {
    title: "Orderbekräftelse ✓",
    preview: "Tack så mycket för din beställning – vi börjar handlägga den omgående.",
    greeting: "Hej,",
    intro: "tack så mycket för din beställning. Vi ",
    introBold: "börjar omgående",
    introRest: " med handläggningen.",
    noteBold: "Viktigt — begäran om ägarskap:",
    note: " Du kan komma att få ett e-postmeddelande från Google där vi begär redigeringsrättigheter till profilen. Klicka på ”Svara” i det e-postmeddelandet och överför rättigheterna till oss. På så sätt får vi ingen åtkomst till personuppgifter eller andra Google-tjänster.",
    outro: "Du hör snart från oss igen. Om du har några frågor svarar du bara på det här e-postmeddelandet – vi hjälper dig snabbt.",
    subject: "Orderbekräftelse – RapidRemove",
  },
  da: {
    title: "Ordrebekræftelse ✓",
    preview: "Mange tak for din bestilling – vi går i gang med behandlingen med det samme.",
    greeting: "Kære kunde,",
    intro: "mange tak for din bestilling. Vi ",
    introBold: "går i gang med det samme",
    introRest: " med behandlingen.",
    noteBold: "Vigtigt — anmodning om ejerskab:",
    note: " Du modtager muligvis en e-mail fra Google, hvori vi anmoder om redigeringsrettighederne til profilen. Klik på „Besvar“ i denne e-mail, og overfør rettighederne til os. På den måde får vi ikke adgang til personlige data eller andre Google-tjenester.",
    outro: "Du hører snart fra os igen. Har du spørgsmål, så svar blot på denne e-mail – vi er hurtigt klar til at hjælpe dig.",
    subject: "Ordrebekræftelse – RapidRemove",
  },
  no: {
    title: "Ordrebekreftelse ✓",
    preview: "Tusen takk for bestillingen din – vi starter behandlingen umiddelbart.",
    greeting: "Hei,",
    intro: "tusen takk for bestillingen din. Vi ",
    introBold: "starter umiddelbart",
    introRest: " med behandlingen.",
    noteBold: "Viktig — forespørsel om eierskap:",
    note: " Det kan hende du mottar en e-post fra Google der vi ber om redigeringsrettighetene til profilen. Klikk på «Svar» i denne e-posten, og overfør rettighetene til oss. På denne måten får vi ikke tilgang til personopplysninger eller andre Google-tjenester.",
    outro: "Du hører snart fra oss igjen. Har du spørsmål, kan du bare svare på denne e-posten – vi er raskt klare til å hjelpe deg.",
    subject: "Ordrebekreftelse – RapidRemove",
  },
};

export function subject(p: AuftragsbestaetigungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Auftragsbestaetigung({ lang = "de", anrede }: AuftragsbestaetigungProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{anrede || t.greeting}</strong></P>
      <P>{t.intro}<strong>{t.introBold}</strong>{t.introRest}</P>
      <NoteBox>
        <strong>{t.noteBold}</strong>{t.note}
      </NoteBox>
      <P muted>{t.outro}</P>
    </EmailShell>
  );
}
