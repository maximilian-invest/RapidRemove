/* Template: Rechte benötigt – Zugriffsrechte bestätigen / Please grant access rights (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface RechteBenoetigtProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Bitte erteilen Sie uns die Zugriffsrechte!",
    preview: "Google hat Ihnen eine Anfrage zur Rechteübertragung geschickt – bitte bestätigen.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil, welche uns bis dato nicht erteilt wurden.",
    p2Bold: "Bitte sehen Sie in Ihrem Postfach nach:",
    p2a: " Google hat eine E-Mail mit der Anfrage zur Rechteübertragung an Sie geschickt, ",
    p2Bold2: "welche von Ihnen zu bestätigen ist.",
    p2Rest: " Vielen Dank!",
    p3Bold: "Wo finde ich diese E-Mail?",
    p3: " Die E-Mail erging an die Adresse, mit welcher Ihr Google-Unternehmensprofil erstellt wurde (ggf. auch an Ihren Webmaster oder Ihre Werbeagentur).",
    subject: "Bitte erteilen Sie uns die Zugriffsrechte",
  },
  en: {
    title: "Please Grant Us Access Rights!",
    preview: "Google has sent you a request to transfer access rights – please confirm it.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you very much for your trust and your recent order. In order to proceed with the removal, we urgently require editing rights to your Google Business Profile, which have not yet been granted to us.",
    p2Bold: "Please check your inbox:",
    p2a: " Google has sent you an email requesting the transfer of access rights, ",
    p2Bold2: "which you need to confirm.",
    p2Rest: "",
    p3Bold: "Where can I find this email?",
    p3: " The email was sent to the address used to create your Google Business Profile (possibly also to your webmaster or advertising agency).",
    subject: "Please grant us access rights",
  },
  es: {
    title: "¡Concédanos los permisos de acceso, por favor!",
    preview: "Google le ha enviado una solicitud de transferencia de permisos: confírmela, por favor.",
    greeting: "Estimados señores:",
    p1: "muchas gracias por su confianza y por su reciente pedido. Para llevar a cabo la eliminación necesitamos imprescindiblemente permisos de edición sobre el perfil de empresa de Google, que hasta la fecha no se nos han concedido.",
    p2Bold: "Revise su bandeja de entrada, por favor:",
    p2a: " Google le ha enviado un correo con la solicitud de transferencia de permisos, ",
    p2Bold2: "que usted debe confirmar.",
    p2Rest: " ¡Muchas gracias!",
    p3Bold: "¿Dónde encuentro este correo?",
    p3: " El correo se envió a la dirección con la que se creó su perfil de empresa de Google (posiblemente también a su webmaster o a su agencia de publicidad).",
    subject: "Concédanos los permisos de acceso, por favor",
  },
  fr: {
    title: "Veuillez nous accorder les droits d'accès !",
    preview: "Google vous a envoyé une demande de transfert des droits : merci de la confirmer.",
    greeting: "Madame, Monsieur,",
    p1: "merci beaucoup de votre confiance et de votre récente commande. Pour procéder à la suppression, nous avons impérativement besoin des droits de gestion sur la fiche d'établissement Google, qui ne nous ont pas encore été accordés.",
    p2Bold: "Veuillez consulter votre boîte de réception :",
    p2a: " Google vous a envoyé un e-mail contenant la demande de transfert des droits, ",
    p2Bold2: "que vous devez confirmer.",
    p2Rest: " Merci beaucoup !",
    p3Bold: "Où puis-je trouver cet e-mail ?",
    p3: " L'e-mail a été envoyé à l'adresse avec laquelle votre fiche d'établissement Google a été créée (le cas échéant, également à votre webmaster ou à votre agence de publicité).",
    subject: "Veuillez nous accorder les droits d'accès",
  },
  it: {
    title: "Vi preghiamo di concederci i diritti di accesso!",
    preview: "Google vi ha inviato una richiesta di trasferimento dei diritti: vi preghiamo di confermarla.",
    greeting: "Gentili Signore e Signori,",
    p1: "grazie di cuore per la vostra fiducia e per il vostro recente ordine. Per procedere con la rimozione abbiamo assolutamente bisogno dei diritti di gestione sul profilo dell'attività su Google, che finora non ci sono stati concessi.",
    p2Bold: "Vi preghiamo di controllare la vostra casella di posta:",
    p2a: " Google vi ha inviato un'e-mail con la richiesta di trasferimento dei diritti, ",
    p2Bold2: "che dovete confermare.",
    p2Rest: " Grazie mille!",
    p3Bold: "Dove trovo questa e-mail?",
    p3: " L'e-mail è stata inviata all'indirizzo con cui è stato creato il vostro profilo dell'attività su Google (eventualmente anche al vostro webmaster o alla vostra agenzia pubblicitaria).",
    subject: "Vi preghiamo di concederci i diritti di accesso",
  },
  nl: {
    title: "Verleen ons de toegangsrechten!",
    preview: "Google heeft u een verzoek tot overdracht van de rechten gestuurd: bevestig dit a.u.b.",
    greeting: "Geachte heer/mevrouw,",
    p1: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Voor de verwijdering hebben wij absoluut bewerkrechten op het Google-bedrijfsprofiel nodig, die ons tot op heden niet zijn verleend.",
    p2Bold: "Controleer a.u.b. uw postvak:",
    p2a: " Google heeft u een e-mail met het verzoek tot overdracht van de rechten gestuurd, ",
    p2Bold2: "die u dient te bevestigen.",
    p2Rest: " Hartelijk dank!",
    p3Bold: "Waar vind ik deze e-mail?",
    p3: " De e-mail is verzonden naar het adres waarmee uw Google-bedrijfsprofiel is aangemaakt (eventueel ook naar uw webmaster of uw reclamebureau).",
    subject: "Verleen ons de toegangsrechten",
  },
  pt: {
    title: "Por favor, conceda-nos as permissões de acesso!",
    preview: "A Google enviou-lhe um pedido de transferência das permissões: confirme-o, por favor.",
    greeting: "Exmos. Senhores,",
    p1: "muito obrigado pela sua confiança e pela sua recente encomenda. Para procedermos à eliminação, necessitamos imperativamente de permissões de edição sobre o perfil de empresa do Google, que até à data não nos foram concedidas.",
    p2Bold: "Por favor, verifique a sua caixa de entrada:",
    p2a: " A Google enviou-lhe um e-mail com o pedido de transferência das permissões, ",
    p2Bold2: "que tem de confirmar.",
    p2Rest: " Muito obrigado!",
    p3Bold: "Onde encontro este e-mail?",
    p3: " O e-mail foi enviado para o endereço com o qual o seu perfil de empresa do Google foi criado (eventualmente também para o seu webmaster ou para a sua agência de publicidade).",
    subject: "Por favor, conceda-nos as permissões de acesso",
  },
  ja: {
    title: "アクセス権限の付与をお願いいたします。",
    preview: "Googleから権限移譲のリクエストが届いています。ご承認をお願いいたします。",
    greeting: "ご担当者様",
    p1: "このたびはご信頼とご注文を賜り、誠にありがとうございます。削除を進めるにあたり、Googleビジネスプロフィールへの編集権限が必ず必要となりますが、現時点ではまだ付与されておりません。",
    p2Bold: "受信トレイをご確認ください。",
    p2a: " Googleより権限移譲のリクエストを記載したメールがお客様宛てに送信されており、",
    p2Bold2: "お客様による承認が必要です。",
    p2Rest: " よろしくお願いいたします。",
    p3Bold: "このメールはどこで確認できますか？",
    p3: " メールは、お客様のGoogleビジネスプロフィールの作成に使用されたアドレス宛てに送信されています（場合によっては、ウェブマスターや広告代理店宛てに届いていることもあります）。",
    subject: "アクセス権限の付与をお願いいたします",
  },
  sv: {
    title: "Vänligen ge oss åtkomstbehörigheten!",
    preview: "Google har skickat en begäran om överföring av behörigheten till dig – bekräfta den.",
    greeting: "Hej,",
    p1: "tack så mycket för ditt förtroende och din nyligen gjorda beställning. För att kunna genomföra borttagningen behöver vi ovillkorligen redigeringsbehörighet till Google-företagsprofilen, vilken hittills inte har beviljats oss.",
    p2Bold: "Vänligen titta i din inkorg:",
    p2a: " Google har skickat ett e-postmeddelande med begäran om överföring av behörigheten till dig, ",
    p2Bold2: "vilken du behöver bekräfta.",
    p2Rest: " Tack så mycket!",
    p3Bold: "Var hittar jag det här e-postmeddelandet?",
    p3: " E-postmeddelandet skickades till den adress som din Google-företagsprofil skapades med (eventuellt även till din webbansvarige eller din reklambyrå).",
    subject: "Vänligen ge oss åtkomstbehörigheten",
  },
  da: {
    title: "Giv os venligst adgangsrettighederne!",
    preview: "Google har sendt dig en anmodning om overførsel af rettighederne – bekræft den venligst.",
    greeting: "Kære kunde,",
    p1: "mange tak for din tillid og din nylige bestilling. For at gennemføre fjernelsen har vi ubetinget brug for redigeringsrettigheder til Google-virksomhedsprofilen, som hidtil ikke er blevet tildelt os.",
    p2Bold: "Se venligst efter i din indbakke:",
    p2a: " Google har sendt dig en e-mail med anmodningen om overførsel af rettighederne, ",
    p2Bold2: "som du skal bekræfte.",
    p2Rest: " Mange tak!",
    p3Bold: "Hvor finder jeg denne e-mail?",
    p3: " E-mailen blev sendt til den adresse, som din Google-virksomhedsprofil blev oprettet med (eventuelt også til din webmaster eller dit reklamebureau).",
    subject: "Giv os venligst adgangsrettighederne",
  },
  no: {
    title: "Vennligst gi oss tilgangsrettighetene!",
    preview: "Google har sendt deg en forespørsel om overføring av rettighetene – vennligst bekreft den.",
    greeting: "Hei,",
    p1: "tusen takk for tilliten din og din nylige bestilling. For å gjennomføre fjerningen trenger vi ubetinget redigeringsrettigheter til Google-bedriftsprofilen, som hittil ikke har blitt tildelt oss.",
    p2Bold: "Vennligst se i innboksen din:",
    p2a: " Google har sendt deg en e-post med forespørselen om overføring av rettighetene, ",
    p2Bold2: "som du må bekrefte.",
    p2Rest: " Tusen takk!",
    p3Bold: "Hvor finner jeg denne e-posten?",
    p3: " E-posten ble sendt til adressen som Google-bedriftsprofilen din ble opprettet med (eventuelt også til nettansvarlig eller reklamebyrået ditt).",
    subject: "Vennligst gi oss tilgangsrettighetene",
  },
};

export function subject(p: RechteBenoetigtProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function RechteBenoetigt({ lang = "de" }: RechteBenoetigtProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong>{t.p2Bold}</strong>{t.p2a}<strong>{t.p2Bold2}</strong>{t.p2Rest}</P>
      <P><strong>{t.p3Bold}</strong>{t.p3}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
