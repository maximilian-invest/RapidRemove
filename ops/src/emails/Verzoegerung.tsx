/* Template: Verzögerung — Profil aktuell von Google blockiert (DE/EN/…).
   Geht an den Kunden, wenn sich die Löschung verzögert, weil Google das Profil
   derzeit blockiert. Häufigste Ursache: die Kategorie des Profils; es kann aber
   auch andere Gründe geben. Ton: ruhig, transparent, beruhigend — kein Alarm. */
import * as React from "react";
import { EmailShell, P, NoteBox, Support } from "./components";

export interface VerzoegerungProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** optionale persönliche Anrede, sonst formell */
  anrede?: string;
}

interface Copy {
  title: string; preview: string; greeting: string;
  intro: string; introBold: string; introRest: string;
  reasonBold: string; reason: string;
  reassure: string;
  actionBold: string; action: string;
  outro: string; subject: string;
}

const T: Record<string, Copy> = {
  de: {
    title: "Kurzes Update zu Ihrem Auftrag",
    preview: "Die Bearbeitung kann sich aktuell etwas verzögern – wir erklären Ihnen, warum.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "vielen Dank für Ihre Geduld. Wir möchten Sie transparent auf dem Laufenden halten: Die Bearbeitung Ihres Auftrags kann sich aktuell ",
    introBold: "etwas verzögern",
    introRest: ".",
    reasonBold: "Woran es liegt:",
    reason: " Ihr Profil wird derzeit von Google blockiert, sodass die Bearbeitung vorübergehend nicht abgeschlossen werden kann. In den meisten Fällen liegt das an der Kategorie, in der das Profil geführt wird – einige Kategorien prüft Google strenger und langsamer. In Einzelfällen kann es auch andere Gründe haben.",
    reassure: "Das ist ein bekannter Teil des Prozesses und kein Grund zur Sorge. Unsere Spezialisten verfolgen Ihren Fall laufend und setzen die Bearbeitung fort, sobald Google sie wieder zulässt.",
    actionBold: "Für Sie ist nichts zu tun.",
    action: " Ihr Auftrag bleibt aktiv, zusätzliche Kosten entstehen dadurch nicht. Sobald es Neuigkeiten gibt, melden wir uns umgehend bei Ihnen.",
    outro: "Vielen Dank für Ihr Vertrauen und Ihre Geduld. Bei Fragen antworten Sie einfach auf diese E-Mail – wir sind gern für Sie da.",
    subject: "Kurzes Update zu Ihrem Auftrag – RapidRemove",
  },
  en: {
    title: "A quick update on your order",
    preview: "Processing may take a little longer right now — here's why.",
    greeting: "Dear Sir or Madam,",
    intro: "thank you for your patience. We want to keep you fully in the loop: processing of your order may currently ",
    introBold: "take a little longer",
    introRest: ".",
    reasonBold: "Why this is happening:",
    reason: " Your profile is currently being blocked by Google, so the process can't be completed for the moment. In most cases this is due to the category the profile is listed under — Google reviews some categories more strictly and slowly. In individual cases there can be other reasons too.",
    reassure: "This is a known part of the process and no cause for concern. Our specialists are monitoring your case continuously and will continue the moment Google allows it again.",
    actionBold: "There's nothing you need to do.",
    action: " Your order stays active and no additional costs arise from this. As soon as there's news, we'll get back to you right away.",
    outro: "Thank you for your trust and your patience. If you have any questions, simply reply to this email — we're happy to help.",
    subject: "A quick update on your order – RapidRemove",
  },
  es: {
    title: "Una breve actualización sobre su pedido",
    preview: "La tramitación puede demorarse un poco ahora mismo: le explicamos por qué.",
    greeting: "Estimados señores:",
    intro: "muchas gracias por su paciencia. Queremos mantenerle plenamente informado: la tramitación de su pedido puede ",
    introBold: "demorarse un poco",
    introRest: " en este momento.",
    reasonBold: "A qué se debe:",
    reason: " Su perfil está siendo bloqueado actualmente por Google, por lo que el proceso no puede completarse de momento. En la mayoría de los casos se debe a la categoría en la que figura el perfil: Google revisa algunas categorías con más rigor y lentitud. En casos concretos también puede haber otros motivos.",
    reassure: "Forma parte conocida del proceso y no es motivo de preocupación. Nuestros especialistas siguen su caso de forma continua y retomarán la tramitación en cuanto Google vuelva a permitirla.",
    actionBold: "Usted no tiene que hacer nada.",
    action: " Su pedido sigue activo y no le supone ningún coste adicional. En cuanto haya novedades, nos pondremos en contacto con usted de inmediato.",
    outro: "Gracias por su confianza y su paciencia. Si tiene alguna duda, basta con responder a este correo: estaremos encantados de ayudarle.",
    subject: "Una breve actualización sobre su pedido – RapidRemove",
  },
  fr: {
    title: "Une brève mise à jour sur votre commande",
    preview: "Le traitement peut prendre un peu plus de temps actuellement — voici pourquoi.",
    greeting: "Madame, Monsieur,",
    intro: "merci beaucoup pour votre patience. Nous tenons à vous informer en toute transparence : le traitement de votre commande peut actuellement ",
    introBold: "prendre un peu plus de temps",
    introRest: ".",
    reasonBold: "La raison :",
    reason: " Votre fiche est actuellement bloquée par Google, de sorte que le traitement ne peut pas être finalisé pour le moment. Dans la plupart des cas, cela est dû à la catégorie sous laquelle la fiche est répertoriée — Google examine certaines catégories de manière plus stricte et plus lente. Dans certains cas, d'autres raisons peuvent aussi être en cause.",
    reassure: "Cela fait partie du processus connu et n'est pas une source d'inquiétude. Nos spécialistes suivent votre dossier en continu et poursuivront le traitement dès que Google le permettra à nouveau.",
    actionBold: "Vous n'avez rien à faire.",
    action: " Votre commande reste active et aucun frais supplémentaire n'en découle. Dès que nous aurons du nouveau, nous reviendrons vers vous sans tarder.",
    outro: "Merci pour votre confiance et votre patience. Pour toute question, répondez simplement à cet e-mail — nous sommes là pour vous aider.",
    subject: "Une brève mise à jour sur votre commande – RapidRemove",
  },
  it: {
    title: "Un breve aggiornamento sul suo ordine",
    preview: "L'elaborazione potrebbe richiedere un po' più di tempo in questo momento: le spieghiamo perché.",
    greeting: "Gentili Signore e Signori,",
    intro: "grazie mille per la sua pazienza. Desideriamo tenerla informata in modo trasparente: l'elaborazione del suo ordine potrebbe attualmente ",
    introBold: "richiedere un po' più di tempo",
    introRest: ".",
    reasonBold: "Il motivo:",
    reason: " Il suo profilo è attualmente bloccato da Google, pertanto l'elaborazione al momento non può essere completata. Nella maggior parte dei casi ciò dipende dalla categoria in cui è inserito il profilo: Google verifica alcune categorie in modo più severo e lento. In casi specifici possono esserci anche altri motivi.",
    reassure: "È una parte nota del processo e non è motivo di preoccupazione. I nostri specialisti seguono il suo caso costantemente e proseguiranno l'elaborazione non appena Google la consentirà di nuovo.",
    actionBold: "Per lei non c'è nulla da fare.",
    action: " Il suo ordine resta attivo e non comporta costi aggiuntivi. Non appena ci saranno novità, la contatteremo immediatamente.",
    outro: "Grazie per la sua fiducia e la sua pazienza. Per qualsiasi domanda, risponda semplicemente a questa e-mail: saremo lieti di aiutarla.",
    subject: "Un breve aggiornamento sul suo ordine – RapidRemove",
  },
  nl: {
    title: "Een korte update over uw bestelling",
    preview: "De verwerking kan momenteel iets langer duren — we leggen uit waarom.",
    greeting: "Geachte heer/mevrouw,",
    intro: "hartelijk dank voor uw geduld. We willen u transparant op de hoogte houden: de verwerking van uw bestelling kan momenteel ",
    introBold: "iets langer duren",
    introRest: ".",
    reasonBold: "Waar het aan ligt:",
    reason: " Uw profiel wordt momenteel door Google geblokkeerd, waardoor de verwerking voorlopig niet kan worden afgerond. In de meeste gevallen ligt dit aan de categorie waarin het profiel staat — Google controleert sommige categorieën strenger en langzamer. In individuele gevallen kunnen er ook andere redenen zijn.",
    reassure: "Dit is een bekend onderdeel van het proces en geen reden tot zorg. Onze specialisten volgen uw zaak voortdurend en zetten de verwerking voort zodra Google dit weer toestaat.",
    actionBold: "U hoeft niets te doen.",
    action: " Uw bestelling blijft actief en er ontstaan geen extra kosten. Zodra er nieuws is, nemen we direct contact met u op.",
    outro: "Bedankt voor uw vertrouwen en uw geduld. Heeft u vragen, beantwoord dan gewoon deze e-mail — we helpen u graag.",
    subject: "Een korte update over uw bestelling – RapidRemove",
  },
  pt: {
    title: "Uma breve atualização sobre o seu pedido",
    preview: "O processamento pode demorar um pouco mais neste momento — explicamos porquê.",
    greeting: "Exmos. Senhores,",
    intro: "muito obrigado pela sua paciência. Queremos mantê-lo informado de forma transparente: o processamento do seu pedido pode atualmente ",
    introBold: "demorar um pouco mais",
    introRest: ".",
    reasonBold: "A razão:",
    reason: " O seu perfil está atualmente a ser bloqueado pela Google, pelo que o processamento não pode ser concluído por agora. Na maioria dos casos, deve-se à categoria em que o perfil está listado — a Google analisa algumas categorias de forma mais rigorosa e lenta. Em casos pontuais, pode haver também outros motivos.",
    reassure: "Faz parte conhecida do processo e não é motivo de preocupação. Os nossos especialistas acompanham o seu caso continuamente e retomarão o processamento assim que a Google o permitir novamente.",
    actionBold: "Não tem de fazer nada.",
    action: " O seu pedido permanece ativo e não há custos adicionais. Assim que houver novidades, entraremos em contacto consigo de imediato.",
    outro: "Obrigado pela sua confiança e paciência. Em caso de dúvidas, basta responder a este e-mail — teremos todo o gosto em ajudar.",
    subject: "Uma breve atualização sobre o seu pedido – RapidRemove",
  },
  ja: {
    title: "ご注文に関するお知らせ",
    preview: "現在、処理に少しお時間がかかる場合があります。その理由をご説明します。",
    greeting: "ご担当者様",
    intro: "いつもご利用いただきありがとうございます。透明性をもってお知らせいたします。現在、ご注文の処理に",
    introBold: "少しお時間がかかる",
    introRest: "場合がございます。",
    reasonBold: "理由について:",
    reason: " お客様のプロフィールは現在Googleによってブロックされており、処理を一時的に完了できない状態です。多くの場合、これはプロフィールが登録されているカテゴリが原因です。Googleは一部のカテゴリをより厳格かつ慎重に審査します。個別のケースでは、その他の理由による場合もあります。",
    reassure: "これはプロセスの一環としてよくあることであり、ご心配には及びません。当社の専門スタッフがお客様のケースを継続的に確認し、Googleが再び処理を許可し次第、作業を続行いたします。",
    actionBold: "お客様に必要なお手続きはございません。",
    action: " ご注文は引き続き有効で、追加費用は発生しません。進展がありましたら、すぐにご連絡いたします。",
    outro: "ご信頼とご辛抱をいただき、誠にありがとうございます。ご不明な点がございましたら、このメールにご返信ください。喜んで対応いたします。",
    subject: "ご注文に関するお知らせ – RapidRemove",
  },
  sv: {
    title: "En kort uppdatering om din beställning",
    preview: "Handläggningen kan ta lite längre tid just nu — vi förklarar varför.",
    greeting: "Hej,",
    intro: "tack så mycket för ditt tålamod. Vi vill hålla dig transparent informerad: handläggningen av din beställning kan just nu ",
    introBold: "ta lite längre tid",
    introRest: ".",
    reasonBold: "Vad det beror på:",
    reason: " Din profil blockeras för närvarande av Google, så handläggningen kan inte slutföras för tillfället. I de flesta fall beror det på kategorin som profilen är listad under — Google granskar vissa kategorier strängare och långsammare. I enskilda fall kan det också finnas andra orsaker.",
    reassure: "Detta är en känd del av processen och ingen anledning till oro. Våra specialister följer ditt ärende löpande och fortsätter handläggningen så snart Google tillåter det igen.",
    actionBold: "Du behöver inte göra något.",
    action: " Din beställning förblir aktiv och inga extra kostnader tillkommer. Så snart det finns nyheter hör vi av oss till dig direkt.",
    outro: "Tack för ditt förtroende och ditt tålamod. Om du har frågor svarar du bara på det här e-postmeddelandet — vi hjälper dig gärna.",
    subject: "En kort uppdatering om din beställning – RapidRemove",
  },
  da: {
    title: "En kort opdatering om din bestilling",
    preview: "Behandlingen kan tage lidt længere tid lige nu — vi forklarer hvorfor.",
    greeting: "Kære kunde,",
    intro: "mange tak for din tålmodighed. Vi vil gerne holde dig transparent informeret: behandlingen af din bestilling kan i øjeblikket ",
    introBold: "tage lidt længere tid",
    introRest: ".",
    reasonBold: "Hvad det skyldes:",
    reason: " Din profil bliver i øjeblikket blokeret af Google, så behandlingen ikke kan afsluttes for nu. I de fleste tilfælde skyldes det kategorien, som profilen er opført under — Google gennemgår nogle kategorier strengere og langsommere. I enkelte tilfælde kan der også være andre årsager.",
    reassure: "Det er en kendt del af processen og ingen grund til bekymring. Vores specialister følger din sag løbende og fortsætter behandlingen, så snart Google tillader det igen.",
    actionBold: "Du skal ikke gøre noget.",
    action: " Din bestilling forbliver aktiv, og der opstår ingen ekstra omkostninger. Så snart der er nyt, kontakter vi dig med det samme.",
    outro: "Tak for din tillid og din tålmodighed. Har du spørgsmål, så svar blot på denne e-mail — vi hjælper dig gerne.",
    subject: "En kort opdatering om din bestilling – RapidRemove",
  },
  no: {
    title: "En kort oppdatering om bestillingen din",
    preview: "Behandlingen kan ta litt lengre tid akkurat nå — vi forklarer hvorfor.",
    greeting: "Hei,",
    intro: "tusen takk for tålmodigheten. Vi vil holde deg transparent informert: behandlingen av bestillingen din kan for øyeblikket ",
    introBold: "ta litt lengre tid",
    introRest: ".",
    reasonBold: "Hva det skyldes:",
    reason: " Profilen din blir for øyeblikket blokkert av Google, slik at behandlingen ikke kan fullføres ennå. I de fleste tilfeller skyldes det kategorien profilen er oppført under — Google gjennomgår enkelte kategorier strengere og langsommere. I enkelte tilfeller kan det også være andre årsaker.",
    reassure: "Dette er en kjent del av prosessen og ingen grunn til bekymring. Spesialistene våre følger saken din løpende og fortsetter behandlingen så snart Google tillater det igjen.",
    actionBold: "Du trenger ikke å gjøre noe.",
    action: " Bestillingen din forblir aktiv, og det påløper ingen ekstra kostnader. Så snart det er nytt, kontakter vi deg umiddelbart.",
    outro: "Takk for tilliten og tålmodigheten. Har du spørsmål, kan du bare svare på denne e-posten — vi hjelper deg gjerne.",
    subject: "En kort oppdatering om bestillingen din – RapidRemove",
  },
};

export function subject(p: VerzoegerungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Verzoegerung({ lang = "de", anrede }: VerzoegerungProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{anrede || t.greeting}</strong></P>
      <P>{t.intro}<strong>{t.introBold}</strong>{t.introRest}</P>
      <NoteBox><strong>{t.reasonBold}</strong>{t.reason}</NoteBox>
      <P>{t.reassure}</P>
      <P><strong>{t.actionBold}</strong>{t.action}</P>
      <P muted>{t.outro}</P>
      <Support lang={lang} phone />
    </EmailShell>
  );
}
