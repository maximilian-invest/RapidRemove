/* Template: Storno – Löschung nicht möglich / Order canceled (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface StornoProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Nach Prüfung Ihres Profils ist eine Löschung leider nicht möglich.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Nach sorgfältiger Überprüfung Ihres Google-Unternehmensprofils müssen wir Ihnen leider mitteilen, dass eine Löschung nicht möglich ist.",
    reasonBold: "Grund:",
    reason: " Google verweigert die Entfernung, Unternehmensprofile dieser Art nicht löschbar, in Konflikt mit den Richtlinien.",
    accessBold: "Wie erhalte ich wieder Zugriff auf mein Profil?",
    access: " Bitte suchen Sie nach Ihrem Unternehmen in Google, klicken Sie auf „Inhaber dieses Profils?“ und folgen Sie den Anweisungen.",
    p4: "Wir entschuldigen uns für etwaige Unannehmlichkeiten. Falls Sie weitere Fragen haben oder wir Ihnen anderweitig behilflich sein können, so kontaktieren Sie uns gerne jederzeit!",
    p5: "Vielen Dank für Ihr Verständnis und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "After reviewing your profile, deletion is unfortunately not possible.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. After carefully reviewing your Google Business Profile, we regret to inform you that we are unable to proceed with the deletion.",
    reasonBold: "Reason:",
    reason: " Google blocks the removal, Google Business Profiles of this kind not removable, restricted by guidelines.",
    accessBold: "How do I regain access to my profile?",
    access: " Please search for your business on Google, click on “Own this business?” and follow the instructions.",
    p4: "We understand that this may not be the outcome you were hoping for, and we sincerely apologize for any inconvenience. Please don’t hesitate to reach out if you have any further questions or if there’s anything else we can assist you with.",
    p5: "Thank you for your understanding, and we wish you continued success in your business.",
    subject: "Your order has been canceled",
  },
  es: {
    title: "¡Su pedido ha sido cancelado!",
    preview: "Tras revisar su perfil, lamentablemente no es posible eliminarlo.",
    greeting: "Estimados señores:",
    p1: "muchas gracias por su confianza y por su reciente pedido. Tras revisar minuciosamente su perfil de empresa de Google, lamentamos comunicarle que no es posible proceder con la eliminación.",
    reasonBold: "Motivo:",
    reason: " Google rechaza la eliminación; los perfiles de empresa de este tipo no se pueden eliminar, ya que entran en conflicto con sus directrices.",
    accessBold: "¿Cómo recupero el acceso a mi perfil?",
    access: " Busque su empresa en Google, haga clic en «¿Es el propietario de este perfil?» y siga las instrucciones.",
    p4: "Le pedimos disculpas por cualquier inconveniente que esto pueda ocasionar. Si tiene más preguntas o podemos ayudarle de cualquier otra forma, no dude en ponerse en contacto con nosotros en cualquier momento.",
    p5: "Muchas gracias por su comprensión y le deseamos mucho éxito en el futuro.",
    subject: "Su pedido ha sido cancelado",
  },
  fr: {
    title: "Votre commande a été annulée !",
    preview: "Après vérification de votre profil, la suppression n'est malheureusement pas possible.",
    greeting: "Madame, Monsieur,",
    p1: "merci beaucoup pour votre confiance et votre récente commande. Après un examen attentif de votre fiche d'établissement Google, nous sommes au regret de vous informer que la suppression n'est pas possible.",
    reasonBold: "Motif :",
    reason: " Google refuse la suppression ; les fiches d'établissement de ce type ne peuvent pas être supprimées, car elles sont contraires à ses règles.",
    accessBold: "Comment puis-je récupérer l'accès à mon profil ?",
    access: " Recherchez votre établissement sur Google, cliquez sur « Vous êtes le propriétaire de cet établissement ? » et suivez les instructions.",
    p4: "Nous vous prions de nous excuser pour la gêne occasionnée. Si vous avez d'autres questions ou si nous pouvons vous aider d'une autre manière, n'hésitez pas à nous contacter à tout moment !",
    p5: "Merci de votre compréhension et nous vous souhaitons une bonne continuation !",
    subject: "Votre commande a été annulée",
  },
  it: {
    title: "Il suo ordine è stato annullato!",
    preview: "Dopo aver verificato il suo profilo, purtroppo la rimozione non è possibile.",
    greeting: "Gentili Signore e Signori,",
    p1: "la ringraziamo per la fiducia accordataci e per il suo recente ordine. Dopo un'attenta verifica del suo profilo dell'attività su Google, siamo spiacenti di doverle comunicare che la rimozione non è possibile.",
    reasonBold: "Motivo:",
    reason: " Google rifiuta la rimozione; i profili dell'attività di questo tipo non sono rimovibili, in quanto in conflitto con le sue norme.",
    accessBold: "Come posso riottenere l'accesso al mio profilo?",
    access: " Cerchi la sua attività su Google, faccia clic su «Sei il proprietario di questa attività?» e segua le istruzioni.",
    p4: "Ci scusiamo per gli eventuali disagi. Se ha altre domande o se possiamo esserle utili in altro modo, non esiti a contattarci in qualsiasi momento!",
    p5: "La ringraziamo per la comprensione e le auguriamo ogni bene!",
    subject: "Il suo ordine è stato annullato",
  },
  nl: {
    title: "Uw bestelling is geannuleerd!",
    preview: "Na controle van uw profiel is verwijdering helaas niet mogelijk.",
    greeting: "Geachte heer/mevrouw,",
    p1: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Na een zorgvuldige controle van uw Google-bedrijfsprofiel moeten wij u helaas meedelen dat verwijdering niet mogelijk is.",
    reasonBold: "Reden:",
    reason: " Google weigert de verwijdering; bedrijfsprofielen van dit type kunnen niet worden verwijderd, omdat dit in strijd is met de richtlijnen.",
    accessBold: "Hoe krijg ik weer toegang tot mijn profiel?",
    access: " Zoek uw bedrijf op in Google, klik op ‘Bent u de eigenaar van dit bedrijf?’ en volg de instructies.",
    p4: "Onze excuses voor het eventuele ongemak. Mocht u nog vragen hebben of kunnen wij u op een andere manier van dienst zijn, neem dan gerust op elk moment contact met ons op!",
    p5: "Hartelijk dank voor uw begrip en het allerbeste gewenst!",
    subject: "Uw bestelling is geannuleerd",
  },
  pt: {
    title: "O seu pedido foi cancelado!",
    preview: "Após a análise do seu perfil, infelizmente não é possível eliminá-lo.",
    greeting: "Exmos. Senhores,",
    p1: "muito obrigado pela sua confiança e pelo seu recente pedido. Após uma análise cuidadosa do seu perfil de empresa do Google, lamentamos informar que não é possível proceder à eliminação.",
    reasonBold: "Motivo:",
    reason: " O Google recusa a remoção; os perfis de empresa deste tipo não podem ser eliminados, por estarem em conflito com as suas diretrizes.",
    accessBold: "Como recupero o acesso ao meu perfil?",
    access: " Procure a sua empresa no Google, clique em «É o proprietário deste perfil?» e siga as instruções.",
    p4: "Pedimos desculpa por qualquer inconveniente. Caso tenha outras questões ou possamos ajudá-lo de outra forma, não hesite em contactar-nos a qualquer momento!",
    p5: "Muito obrigado pela sua compreensão e desejamos-lhe as maiores felicidades!",
    subject: "O seu pedido foi cancelado",
  },
  ja: {
    title: "ご注文はキャンセルされました。",
    preview: "プロフィールを確認した結果、誠に恐れ入りますが削除はできません。",
    greeting: "ご担当者様",
    p1: "このたびはご信頼いただき、またご注文を賜り、誠にありがとうございます。お客様のGoogleビジネスプロフィールを慎重に確認いたしましたが、誠に恐れ入りますが、削除を行うことができないことをお知らせいたします。",
    reasonBold: "理由：",
    reason: " Googleが削除を拒否しているためです。この種のビジネスプロフィールは、ポリシーに抵触するため削除できません。",
    accessBold: "プロフィールへのアクセスを再び取得するには？",
    access: " Googleでお客様のビジネスを検索し、「このビジネスのオーナーですか？」をクリックして、表示される手順に従ってください。",
    p4: "ご不便をおかけしましたことを心よりお詫び申し上げます。その他ご不明な点やお手伝いできることがございましたら、いつでもお気軽にお問い合わせください。",
    p5: "ご理解いただき誠にありがとうございます。今後のますますのご発展をお祈り申し上げます。",
    subject: "ご注文はキャンセルされました",
  },
  sv: {
    title: "Din beställning har annullerats!",
    preview: "Efter granskning av din profil är borttagning tyvärr inte möjlig.",
    greeting: "Hej,",
    p1: "tack för ditt förtroende och för din nyligen gjorda beställning. Efter en noggrann granskning av din Google-företagsprofil måste vi tyvärr meddela att en borttagning inte är möjlig.",
    reasonBold: "Anledning:",
    reason: " Google nekar borttagningen; företagsprofiler av det här slaget går inte att ta bort, eftersom det strider mot deras riktlinjer.",
    accessBold: "Hur får jag tillbaka åtkomsten till min profil?",
    access: " Sök efter ditt företag på Google, klicka på ”Äger du det här företaget?” och följ anvisningarna.",
    p4: "Vi ber om ursäkt för eventuella besvär. Om du har fler frågor eller om vi kan hjälpa dig på något annat sätt är du välkommen att kontakta oss när som helst!",
    p5: "Tack för din förståelse och lycka till framöver!",
    subject: "Din beställning har annullerats",
  },
  da: {
    title: "Din ordre er blevet annulleret!",
    preview: "Efter en gennemgang af din profil er sletning desværre ikke mulig.",
    greeting: "Kære kunde,",
    p1: "mange tak for din tillid og din nylige bestilling. Efter en grundig gennemgang af din Google-virksomhedsprofil må vi desværre meddele dig, at en sletning ikke er mulig.",
    reasonBold: "Årsag:",
    reason: " Google afviser fjernelsen; virksomhedsprofiler af denne type kan ikke slettes, da det er i strid med deres retningslinjer.",
    accessBold: "Hvordan får jeg adgang til min profil igen?",
    access: " Søg efter din virksomhed på Google, klik på ”Ejer du denne virksomhed?”, og følg vejledningen.",
    p4: "Vi beklager eventuelle ulemper. Hvis du har yderligere spørgsmål, eller hvis vi kan hjælpe dig på anden vis, er du altid velkommen til at kontakte os!",
    p5: "Mange tak for din forståelse, og fortsat alt det bedste!",
    subject: "Din ordre er blevet annulleret",
  },
  no: {
    title: "Bestillingen din er kansellert!",
    preview: "Etter en gjennomgang av profilen din er sletting dessverre ikke mulig.",
    greeting: "Hei,",
    p1: "tusen takk for tilliten og for din nylige bestilling. Etter en grundig gjennomgang av Google-bedriftsprofilen din må vi dessverre meddele at en sletting ikke er mulig.",
    reasonBold: "Årsak:",
    reason: " Google avslår fjerningen; bedriftsprofiler av denne typen kan ikke slettes, da det er i strid med retningslinjene deres.",
    accessBold: "Hvordan får jeg tilgang til profilen min igjen?",
    access: " Søk etter bedriften din på Google, klikk på «Eier du denne bedriften?», og følg instruksjonene.",
    p4: "Vi beklager eventuelle ulemper. Hvis du har flere spørsmål, eller hvis vi kan hjelpe deg på andre måter, er du alltid velkommen til å kontakte oss!",
    p5: "Tusen takk for forståelsen, og fortsatt alt godt!",
    subject: "Bestillingen din er kansellert",
  },
};

export function subject(p: StornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Storno({ lang = "de" }: StornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong><u>{t.reasonBold}</u></strong>{t.reason}</P>
      <P><strong><u>{t.accessBold}</u></strong>{t.access}</P>
      <P>{t.p4}</P>
      <P>{t.p5}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
