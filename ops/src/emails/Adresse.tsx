/* Template: Adresse hinterlegen / Please add your address (DE/EN). */
import * as React from "react";
import { EmailShell, P, Steps, Support } from "./components";

export interface AdresseProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Bitte hinterlegen Sie eine Adresse!",
    preview: "Wir können die Bearbeitungsrechte nur anfordern, wenn eine Adresse hinterlegt ist.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil. Diese können wir nur anfordern, ",
    p1Bold: "wenn eine gültige Adresse im Profil hinterlegt ist.",
    howBold: "Wie hinterlege ich eine Adresse?",
    steps: [
      <>Öffnen Sie Ihr Profil oder suchen Sie nach „mein Unternehmen“ in Google</>,
      <>Klicken Sie auf „Profil bearbeiten“</>,
      <>Hier können Sie eine Adresse hinterlegen</>,
    ],
    p2: "Sollten Fragen auftauchen, so antworten Sie bitte auf diese E-Mail. Vielen Dank!",
    subject: "Bitte hinterlegen Sie eine Adresse",
  },
  en: {
    title: "Please Add Your Address!",
    preview: "We can only request the editing rights if a valid address is stored in the profile.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you very much for your trust and your recent order. In order to proceed with the removal, we require editing rights for the Google Business Profile. These rights can only be requested if a ",
    p1Bold: "valid address is stored in the profile.",
    howBold: "How do I add an address?",
    steps: [
      <>Open your profile or search for “my business” in Google</>,
      <>Click on “Edit profile”</>,
      <>Here you can add an address</>,
    ],
    p2: "If you have any questions, please reply to this email. Thank you!",
    subject: "Please add your address",
  },
  es: {
    title: "¡Añada una dirección, por favor!",
    preview: "Solo podemos solicitar los derechos de edición si hay una dirección registrada en el perfil.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su confianza y por su reciente pedido. Para llevar a cabo la eliminación necesitamos imprescindiblemente derechos de edición sobre el perfil de empresa de Google. Solo podemos solicitarlos ",
    p1Bold: "si hay una dirección válida registrada en el perfil.",
    howBold: "¿Cómo añado una dirección?",
    steps: [
      <>Abra su perfil o busque «mi empresa» en Google</>,
      <>Haga clic en «Editar perfil»</>,
      <>Aquí puede añadir una dirección</>,
    ],
    p2: "Si le surge alguna duda, responda a este correo. ¡Muchas gracias!",
    subject: "Añada una dirección, por favor",
  },
  fr: {
    title: "Veuillez ajouter une adresse !",
    preview: "Nous ne pouvons demander les droits de modification que si une adresse est enregistrée dans la fiche.",
    greeting: "Madame, Monsieur,",
    p1a: "merci beaucoup pour votre confiance et votre récente commande. Pour procéder à la suppression, nous avons impérativement besoin de droits de modification sur la fiche d'établissement Google. Nous ne pouvons les demander ",
    p1Bold: "que si une adresse valide est enregistrée dans la fiche.",
    howBold: "Comment ajouter une adresse ?",
    steps: [
      <>Ouvrez votre fiche ou recherchez « mon établissement » dans Google</>,
      <>Cliquez sur « Modifier la fiche »</>,
      <>Vous pouvez y ajouter une adresse</>,
    ],
    p2: "Si vous avez des questions, répondez à cet e-mail. Merci beaucoup !",
    subject: "Veuillez ajouter une adresse",
  },
  it: {
    title: "Aggiunga un indirizzo, per favore!",
    preview: "Possiamo richiedere i diritti di modifica solo se è presente un indirizzo nel profilo.",
    greeting: "Gentili Signore e Signori,",
    p1a: "grazie mille per la sua fiducia e per il suo recente ordine. Per procedere con la rimozione abbiamo assolutamente bisogno dei diritti di modifica sul profilo dell'attività su Google. Possiamo richiederli solo ",
    p1Bold: "se nel profilo è presente un indirizzo valido.",
    howBold: "Come aggiungo un indirizzo?",
    steps: [
      <>Apra il suo profilo oppure cerchi «la mia attività» su Google</>,
      <>Clicchi su «Modifica profilo»</>,
      <>Qui può aggiungere un indirizzo</>,
    ],
    p2: "Se ha domande, risponda a questa e-mail. Grazie mille!",
    subject: "Aggiunga un indirizzo, per favore",
  },
  nl: {
    title: "Voeg een adres toe, alstublieft!",
    preview: "We kunnen de bewerkingsrechten alleen aanvragen als er een adres in het profiel staat.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Voor de verwijdering hebben we beslist bewerkingsrechten op het Google-bedrijfsprofiel nodig. Die kunnen we alleen aanvragen ",
    p1Bold: "als er een geldig adres in het profiel staat.",
    howBold: "Hoe voeg ik een adres toe?",
    steps: [
      <>Open uw profiel of zoek naar ‘mijn bedrijf’ in Google</>,
      <>Klik op ‘Profiel bewerken’</>,
      <>Hier kunt u een adres toevoegen</>,
    ],
    p2: "Als u vragen heeft, antwoord dan op deze e-mail. Hartelijk dank!",
    subject: "Voeg een adres toe, alstublieft",
  },
  pt: {
    title: "Adicione uma morada, por favor!",
    preview: "Só podemos solicitar os direitos de edição se houver uma morada registada no perfil.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pela sua confiança e pela sua recente encomenda. Para procedermos com a eliminação, necessitamos obrigatoriamente de direitos de edição sobre o perfil de empresa do Google. Só os podemos solicitar ",
    p1Bold: "se houver uma morada válida registada no perfil.",
    howBold: "Como adiciono uma morada?",
    steps: [
      <>Abra o seu perfil ou pesquise «a minha empresa» no Google</>,
      <>Clique em «Editar perfil»</>,
      <>Aqui pode adicionar uma morada</>,
    ],
    p2: "Se tiver alguma dúvida, responda a este e-mail. Muito obrigado!",
    subject: "Adicione uma morada, por favor",
  },
  ja: {
    title: "住所をご登録ください!",
    preview: "プロフィールに住所が登録されている場合のみ、編集権限を申請できます。",
    greeting: "ご担当者様",
    p1a: "このたびはご信頼とご注文を賜り、誠にありがとうございます。削除を進めるにあたり、Googleビジネスプロフィールの編集権限が必ず必要となります。これは、",
    p1Bold: "プロフィールに有効な住所が登録されている場合のみ申請できます。",
    howBold: "住所はどのように登録しますか?",
    steps: [
      <>プロフィールを開くか、Googleで「マイビジネス」と検索します</>,
      <>「プロフィールを編集」をクリックします</>,
      <>ここで住所を登録できます</>,
    ],
    p2: "ご不明な点がございましたら、このメールにご返信ください。よろしくお願いいたします。",
    subject: "住所をご登録ください",
  },
  sv: {
    title: "Lägg till en adress!",
    preview: "Vi kan bara begära redigeringsrättigheterna om det finns en adress angiven i profilen.",
    greeting: "Hej,",
    p1a: "tack så mycket för ditt förtroende och din nyligen gjorda beställning. För att kunna genomföra borttagningen behöver vi nödvändigtvis redigeringsrättigheter till Google-företagsprofilen. Vi kan endast begära dessa ",
    p1Bold: "om en giltig adress är angiven i profilen.",
    howBold: "Hur lägger jag till en adress?",
    steps: [
      <>Öppna din profil eller sök efter ”mitt företag” i Google</>,
      <>Klicka på ”Redigera profil”</>,
      <>Här kan du lägga till en adress</>,
    ],
    p2: "Om du har några frågor, svara på det här e-postmeddelandet. Tack så mycket!",
    subject: "Lägg till en adress",
  },
  da: {
    title: "Tilføj venligst en adresse!",
    preview: "Vi kan kun anmode om redigeringsrettighederne, hvis der er angivet en adresse i profilen.",
    greeting: "Kære kunde,",
    p1a: "mange tak for din tillid og din nylige bestilling. For at gennemføre fjernelsen har vi ubetinget brug for redigeringsrettigheder til Google-virksomhedsprofilen. Dem kan vi kun anmode om, ",
    p1Bold: "hvis der er angivet en gyldig adresse i profilen.",
    howBold: "Hvordan tilføjer jeg en adresse?",
    steps: [
      <>Åbn din profil, eller søg efter „min virksomhed“ i Google</>,
      <>Klik på „Rediger profil“</>,
      <>Her kan du tilføje en adresse</>,
    ],
    p2: "Hvis du har spørgsmål, så svar på denne e-mail. Mange tak!",
    subject: "Tilføj venligst en adresse",
  },
  no: {
    title: "Legg til en adresse!",
    preview: "Vi kan bare be om redigeringsrettighetene hvis det er angitt en adresse i profilen.",
    greeting: "Hei,",
    p1a: "tusen takk for tilliten og den nylige bestillingen din. For å gjennomføre fjerningen trenger vi absolutt redigeringsrettigheter til Google-bedriftsprofilen. Disse kan vi bare be om ",
    p1Bold: "hvis det er angitt en gyldig adresse i profilen.",
    howBold: "Hvordan legger jeg til en adresse?",
    steps: [
      <>Åpne profilen din, eller søk etter «min bedrift» i Google</>,
      <>Klikk på «Rediger profil»</>,
      <>Her kan du legge til en adresse</>,
    ],
    p2: "Hvis du har spørsmål, svar på denne e-posten. Tusen takk!",
    subject: "Legg til en adresse",
  },
};

export function subject(p: AdresseProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Adresse({ lang = "de" }: AdresseProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <P><strong>{t.howBold}</strong></P>
      <Steps items={t.steps} />
      <P>{t.p2}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
