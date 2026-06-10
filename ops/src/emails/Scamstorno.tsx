/* Template: Scamstorno – unlautere Geschäftspraktiken / Order canceled, objection (DE/EN). */
import * as React from "react";
import { EmailShell, P, NoteBox, Support } from "./components";

export interface ScamstornoProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Nach Prüfung können wir Ihr Profil leider nicht löschen.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Nach sorgfältiger Überprüfung Ihres Google-Unternehmensprofils müssen wir Ihnen leider mitteilen, dass eine Löschung nicht möglich ist.",
    reasonBold: "Grund:",
    reason: " Ihr Unternehmensprofil deutet auf unlautere Geschäftspraktiken hin.",
    objBold: "Einspruch:",
    obj: " Falls Sie der Meinung sind, dass unsere Einschätzung nicht korrekt ist, so ",
    objBold2: "antworten Sie bitte mit Informationen und möglichst detaillierter Problembeschreibung",
    objRest: " auf diese E-Mail.",
    p3: "Als verantwortungsvolles Unternehmen handeln wir nach rechtlichen und ethischen Prinzipien. Wir entschuldigen uns für etwaige Unannehmlichkeiten. Falls Sie weitere Fragen haben oder wir Ihnen anderweitig behilflich sein können, so kontaktieren Sie uns gerne jederzeit!",
    p4: "Vielen Dank für Ihr Verständnis und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "After reviewing your profile, deletion is unfortunately not possible.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. After carefully reviewing your Google Business Profile, we regret to inform you that we are unable to proceed with the deletion.",
    reasonBold: "Reason:",
    reason: " Your company profile indicates potential unfair business practices.",
    objBold: "Objection:",
    obj: " If you believe our assessment is incorrect, please ",
    objBold2: "respond to this email with relevant information and a detailed description",
    objRest: " of the issue.",
    p3: "As a responsible company, we operate in accordance with legal and ethical principles. Please don’t hesitate to reach out if you have any further questions or if there’s anything else we can assist you with.",
    p4: "Thank you for your understanding, and we wish you continued success in your business.",
    subject: "Your order has been canceled",
  },
  es: {
    title: "¡Su pedido se ha cancelado!",
    preview: "Tras la revisión, lamentablemente no podemos eliminar su perfil.",
    greeting: "Estimados señores:",
    p1: "muchas gracias por su confianza y por su reciente pedido. Tras una revisión minuciosa de su perfil de empresa de Google, lamentamos comunicarle que no es posible realizar la eliminación.",
    reasonBold: "Motivo:",
    reason: " Su perfil de empresa apunta a prácticas comerciales desleales.",
    objBold: "Reclamación:",
    obj: " Si considera que nuestra valoración no es correcta, ",
    objBold2: "responda a este correo con información y una descripción del problema lo más detallada posible",
    objRest: ".",
    p3: "Como empresa responsable, actuamos conforme a principios legales y éticos. Le pedimos disculpas por cualquier molestia. Si tiene más preguntas o podemos ayudarle de algún otro modo, no dude en ponerse en contacto con nosotros en cualquier momento.",
    p4: "Muchas gracias por su comprensión y le deseamos lo mejor.",
    subject: "Su pedido se ha cancelado",
  },
  fr: {
    title: "Votre commande a été annulée !",
    preview: "Après vérification, nous ne pouvons malheureusement pas supprimer votre fiche.",
    greeting: "Madame, Monsieur,",
    p1: "merci beaucoup de votre confiance et de votre récente commande. Après un examen attentif de votre fiche d'établissement Google, nous avons le regret de vous informer qu'une suppression n'est pas possible.",
    reasonBold: "Motif :",
    reason: " Votre fiche d'établissement laisse présumer des pratiques commerciales déloyales.",
    objBold: "Contestation :",
    obj: " Si vous estimez que notre appréciation est incorrecte, ",
    objBold2: "veuillez répondre à cet e-mail en fournissant des informations et une description du problème aussi détaillée que possible",
    objRest: ".",
    p3: "En tant qu'entreprise responsable, nous agissons selon des principes juridiques et éthiques. Nous vous prions de nous excuser pour les éventuels désagréments. Si vous avez d'autres questions ou si nous pouvons vous aider de toute autre manière, n'hésitez pas à nous contacter à tout moment !",
    p4: "Merci de votre compréhension et nous vous souhaitons une bonne continuation !",
    subject: "Votre commande a été annulée",
  },
  it: {
    title: "Il vostro ordine è stato annullato!",
    preview: "Dopo la verifica, purtroppo non possiamo eliminare il vostro profilo.",
    greeting: "Gentili Signore e Signori,",
    p1: "grazie di cuore per la vostra fiducia e per il vostro recente ordine. Dopo un'attenta verifica del vostro profilo dell'attività su Google, siamo spiacenti di comunicarvi che la rimozione non è possibile.",
    reasonBold: "Motivo:",
    reason: " Il vostro profilo dell'attività lascia presumere pratiche commerciali scorrette.",
    objBold: "Contestazione:",
    obj: " Se ritenete che la nostra valutazione non sia corretta, ",
    objBold2: "vi preghiamo di rispondere a questa e-mail fornendo informazioni e una descrizione del problema il più dettagliata possibile",
    objRest: ".",
    p3: "In quanto azienda responsabile, agiamo secondo principi legali ed etici. Ci scusiamo per gli eventuali disagi. Se avete ulteriori domande o se possiamo esservi utili in altro modo, non esitate a contattarci in qualsiasi momento!",
    p4: "Grazie per la vostra comprensione e vi auguriamo ogni bene!",
    subject: "Il vostro ordine è stato annullato",
  },
  nl: {
    title: "Uw bestelling is geannuleerd!",
    preview: "Na controle kunnen wij uw profiel helaas niet verwijderen.",
    greeting: "Geachte heer/mevrouw,",
    p1: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Na zorgvuldige controle van uw Google-bedrijfsprofiel moeten wij u helaas meedelen dat verwijdering niet mogelijk is.",
    reasonBold: "Reden:",
    reason: " Uw bedrijfsprofiel wijst op oneerlijke handelspraktijken.",
    objBold: "Bezwaar:",
    obj: " Mocht u van mening zijn dat onze inschatting niet juist is, ",
    objBold2: "reageer dan op deze e-mail met informatie en een zo gedetailleerd mogelijke beschrijving van het probleem",
    objRest: ".",
    p3: "Als verantwoordelijk bedrijf handelen wij volgens juridische en ethische principes. Onze excuses voor het eventuele ongemak. Mocht u nog vragen hebben of kunnen wij u op een andere manier van dienst zijn, neem dan gerust altijd contact met ons op!",
    p4: "Hartelijk dank voor uw begrip en het allerbeste!",
    subject: "Uw bestelling is geannuleerd",
  },
  pt: {
    title: "A sua encomenda foi cancelada!",
    preview: "Após a verificação, lamentavelmente não podemos eliminar o seu perfil.",
    greeting: "Exmos. Senhores,",
    p1: "muito obrigado pela sua confiança e pela sua recente encomenda. Após uma verificação cuidadosa do seu perfil de empresa do Google, lamentamos informar que a eliminação não é possível.",
    reasonBold: "Motivo:",
    reason: " O seu perfil de empresa indicia práticas comerciais desleais.",
    objBold: "Contestação:",
    obj: " Se considerar que a nossa avaliação não está correta, ",
    objBold2: "responda a este e-mail com informações e uma descrição do problema o mais detalhada possível",
    objRest: ".",
    p3: "Enquanto empresa responsável, atuamos de acordo com princípios legais e éticos. Pedimos desculpa por eventuais incómodos. Caso tenha outras questões ou possamos ajudá-lo de qualquer outra forma, não hesite em contactar-nos a qualquer momento!",
    p4: "Muito obrigado pela sua compreensão e desejamos-lhe as maiores felicidades!",
    subject: "A sua encomenda foi cancelada",
  },
  ja: {
    title: "ご注文はキャンセルされました。",
    preview: "確認の結果、誠に恐れ入りますが、お客様のプロフィールを削除することはできません。",
    greeting: "ご担当者様",
    p1: "このたびはご信頼とご注文を賜り、誠にありがとうございます。お客様のGoogleビジネスプロフィールを慎重に確認いたしました結果、誠に恐れ入りますが、削除は不可能であることをお知らせいたします。",
    reasonBold: "理由：",
    reason: " お客様のビジネスプロフィールには、不正な商習慣の兆候が見受けられます。",
    objBold: "異議申し立て：",
    obj: " 当社の判断が正しくないとお考えの場合は、",
    objBold2: "情報およびできるだけ詳しい問題の説明を記載のうえ、このメールにご返信ください",
    objRest: "。",
    p3: "責任ある企業として、当社は法的および倫理的な原則に従って行動しております。ご不便をおかけする場合は、お詫び申し上げます。その他ご質問がございましたら、または当社がほかの形でお力になれることがございましたら、いつでもお気軽にご連絡ください。",
    p4: "ご理解のほど、よろしくお願いいたします。今後ますますのご発展をお祈り申し上げます。",
    subject: "ご注文はキャンセルされました",
  },
  sv: {
    title: "Din beställning har annullerats!",
    preview: "Efter granskning kan vi tyvärr inte radera din profil.",
    greeting: "Hej,",
    p1: "tack så mycket för ditt förtroende och din nyligen gjorda beställning. Efter en noggrann granskning av din Google-företagsprofil måste vi tyvärr meddela att en borttagning inte är möjlig.",
    reasonBold: "Orsak:",
    reason: " Din företagsprofil tyder på otillbörliga affärsmetoder.",
    objBold: "Invändning:",
    obj: " Om du anser att vår bedömning inte är korrekt, ",
    objBold2: "vänligen svara på detta e-postmeddelande med information och en så detaljerad problembeskrivning som möjligt",
    objRest: ".",
    p3: "Som ett ansvarsfullt företag agerar vi enligt juridiska och etiska principer. Vi ber om ursäkt för eventuella olägenheter. Om du har ytterligare frågor eller om vi kan hjälpa dig på något annat sätt är du alltid välkommen att kontakta oss!",
    p4: "Tack för din förståelse och vi önskar dig fortsatt lycka till!",
    subject: "Din beställning har annullerats",
  },
  da: {
    title: "Din bestilling er blevet annulleret!",
    preview: "Efter gennemgang kan vi desværre ikke slette din profil.",
    greeting: "Kære kunde,",
    p1: "mange tak for din tillid og din nylige bestilling. Efter en grundig gennemgang af din Google-virksomhedsprofil må vi desværre meddele dig, at en fjernelse ikke er mulig.",
    reasonBold: "Årsag:",
    reason: " Din virksomhedsprofil tyder på illoyal forretningspraksis.",
    objBold: "Indsigelse:",
    obj: " Hvis du mener, at vores vurdering ikke er korrekt, ",
    objBold2: "bedes du svare på denne e-mail med oplysninger og en så detaljeret beskrivelse af problemet som muligt",
    objRest: ".",
    p3: "Som en ansvarlig virksomhed handler vi efter juridiske og etiske principper. Vi undskylder for eventuelle ulemper. Hvis du har yderligere spørgsmål, eller hvis vi kan være dig behjælpelige på anden vis, er du altid velkommen til at kontakte os!",
    p4: "Mange tak for din forståelse, og vi ønsker dig fortsat alt det bedste!",
    subject: "Din bestilling er blevet annulleret",
  },
  no: {
    title: "Bestillingen din er kansellert!",
    preview: "Etter gjennomgang kan vi dessverre ikke slette profilen din.",
    greeting: "Hei,",
    p1: "tusen takk for tilliten din og din nylige bestilling. Etter en grundig gjennomgang av Google-bedriftsprofilen din må vi dessverre meddele deg at en fjerning ikke er mulig.",
    reasonBold: "Årsak:",
    reason: " Bedriftsprofilen din tyder på illojal forretningspraksis.",
    objBold: "Innsigelse:",
    obj: " Hvis du mener at vår vurdering ikke er korrekt, ",
    objBold2: "vennligst svar på denne e-posten med informasjon og en så detaljert beskrivelse av problemet som mulig",
    objRest: ".",
    p3: "Som en ansvarlig bedrift handler vi etter juridiske og etiske prinsipper. Vi beklager eventuelle ulemper. Hvis du har flere spørsmål, eller hvis vi kan hjelpe deg på annen måte, er du alltid velkommen til å kontakte oss!",
    p4: "Tusen takk for forståelsen, og vi ønsker deg fortsatt alt godt!",
    subject: "Bestillingen din er kansellert",
  },
};

export function subject(p: ScamstornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Scamstorno({ lang = "de" }: ScamstornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong><u>{t.reasonBold}</u></strong>{t.reason}</P>
      <NoteBox>
        <strong>{t.objBold}</strong>{t.obj}<strong>{t.objBold2}</strong>{t.objRest}
      </NoteBox>
      <P>{t.p3}</P>
      <P>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
