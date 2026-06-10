/* Template: Eingangsbestätigung Presse-/Suchergebnis-Auslistung (DE/EN/…).
   Geht an den Kunden, nachdem er im Wizard das Auslisten eines Presseartikels
   oder Suchergebnisses angefragt hat. Kernbotschaft: Anfrage erhalten, wir prüfen
   den Fall (kostenlos & unverbindlich), wir melden uns mit einer Einschätzung. */
import * as React from "react";
import { EmailShell, P, Steps, NoteBox, Support } from "./components";

export interface PresseEingangProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** optionale persönliche Anrede, sonst formell */
  anrede?: string;
}

interface Copy {
  title: string; preview: string; greeting: string;
  intro: string; introBold: string; introRest: string;
  lead: string; steps: string[];
  noteBold: string; note: string; outro: string; subject: string;
}

const T: Record<string, Copy> = {
  de: {
    title: "Anfrage erhalten – wir prüfen Ihren Fall ✓",
    preview: "Wir haben Ihre Anfrage erhalten und prüfen, was sich auslisten oder entfernen lässt.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "vielen Dank für Ihre Anfrage. Wir haben die von Ihnen genannten Inhalte erhalten und ",
    introBold: "prüfen Ihren Fall",
    introRest: " sorgfältig.",
    lead: "So geht es jetzt weiter:",
    steps: [
      "Unsere Spezialisten und unsere Partnerkanzlei sichten die Links und bewerten die rechtliche Ausgangslage.",
      "Wir prüfen, ob eine Auslistung aus den Google-Ergebnissen oder eine Entfernung direkt an der Quelle realistisch ist.",
      "Sie erhalten innerhalb von 1–2 Werktagen unsere Einschätzung – mit klarer Empfehlung und, falls möglich, einem Festpreis-Angebot.",
    ],
    noteBold: "Kostenlos & unverbindlich:",
    note: " Die Erstprüfung ist für Sie kostenfrei. Es entstehen keine Kosten, solange Sie kein Angebot ausdrücklich beauftragen.",
    outro: "Haben Sie weitere Links, Screenshots oder Hintergründe? Antworten Sie einfach auf diese E-Mail – das hilft uns bei der Einschätzung.",
    subject: "Ihre Anfrage zur Auslistung – wir prüfen Ihren Fall",
  },
  en: {
    title: "Request received – we're reviewing your case ✓",
    preview: "We've received your request and are reviewing what can be delisted or removed.",
    greeting: "Dear Sir or Madam,",
    intro: "thank you for your request. We've received the content you sent us and are ",
    introBold: "carefully reviewing your case",
    introRest: ".",
    lead: "Here's what happens next:",
    steps: [
      "Our specialists and partner law firm examine the links and assess the legal situation.",
      "We check whether delisting from Google's results or removal at the source is realistic.",
      "Within 1–2 business days you'll receive our assessment – with a clear recommendation and, where feasible, a fixed-price offer.",
    ],
    noteBold: "Free & no obligation:",
    note: " The initial review is free of charge. No costs arise unless you expressly commission an offer.",
    outro: "Have more links, screenshots or background? Just reply to this email – it helps us assess your case.",
    subject: "Your delisting request – we're reviewing your case",
  },
  es: {
    title: "Solicitud recibida: estamos revisando su caso ✓",
    preview: "Hemos recibido su solicitud y estamos comprobando qué se puede desindexar o eliminar.",
    greeting: "Estimados señores:",
    intro: "muchas gracias por su solicitud. Hemos recibido el contenido que nos indicó y estamos ",
    introBold: "revisando su caso con atención",
    introRest: ".",
    lead: "Esto es lo que ocurre ahora:",
    steps: [
      "Nuestros especialistas y nuestro despacho asociado examinan los enlaces y evalúan la situación jurídica.",
      "Comprobamos si es realista la desindexación de los resultados de Google o la eliminación directamente en la fuente.",
      "En un plazo de 1 a 2 días laborables recibirá nuestra valoración, con una recomendación clara y, si es posible, una oferta a precio cerrado.",
    ],
    noteBold: "Gratis y sin compromiso:",
    note: " La revisión inicial es gratuita. No se genera ningún coste mientras no encargue expresamente una oferta.",
    outro: "¿Tiene más enlaces, capturas o información de contexto? Basta con responder a este correo: nos ayuda con la valoración.",
    subject: "Su solicitud de desindexación: estamos revisando su caso",
  },
  fr: {
    title: "Demande reçue – nous examinons votre dossier ✓",
    preview: "Nous avons bien reçu votre demande et examinons ce qui peut être déréférencé ou supprimé.",
    greeting: "Madame, Monsieur,",
    intro: "merci beaucoup pour votre demande. Nous avons bien reçu les contenus que vous nous avez indiqués et nous ",
    introBold: "examinons attentivement votre dossier",
    introRest: ".",
    lead: "Voici la suite :",
    steps: [
      "Nos spécialistes et notre cabinet partenaire analysent les liens et évaluent la situation juridique.",
      "Nous vérifions si un déréférencement des résultats Google ou une suppression directement à la source est réaliste.",
      "Sous 1 à 2 jours ouvrés, vous recevrez notre évaluation, avec une recommandation claire et, si possible, une offre à prix fixe.",
    ],
    noteBold: "Gratuit et sans engagement :",
    note: " La première analyse est gratuite. Aucun frais n'est engagé tant que vous ne commandez pas expressément une offre.",
    outro: "Vous avez d'autres liens, captures d'écran ou éléments de contexte ? Répondez simplement à cet e-mail – cela nous aide pour l'évaluation.",
    subject: "Votre demande de déréférencement – nous examinons votre dossier",
  },
  it: {
    title: "Richiesta ricevuta – stiamo esaminando il suo caso ✓",
    preview: "Abbiamo ricevuto la sua richiesta e stiamo verificando cosa è possibile deindicizzare o rimuovere.",
    greeting: "Gentili Signore e Signori,",
    intro: "grazie mille per la sua richiesta. Abbiamo ricevuto i contenuti che ci ha segnalato e stiamo ",
    introBold: "esaminando con attenzione il suo caso",
    introRest: ".",
    lead: "Ecco come si procede:",
    steps: [
      "I nostri specialisti e il nostro studio legale partner esaminano i link e valutano la situazione giuridica.",
      "Verifichiamo se è realistica una deindicizzazione dai risultati di Google o una rimozione direttamente alla fonte.",
      "Entro 1–2 giorni lavorativi riceverà la nostra valutazione, con una raccomandazione chiara e, se possibile, un'offerta a prezzo fisso.",
    ],
    noteBold: "Gratuito e senza impegno:",
    note: " La prima verifica è gratuita. Non sorge alcun costo finché non incarica espressamente un'offerta.",
    outro: "Ha altri link, screenshot o informazioni di contesto? Risponda semplicemente a questa e-mail: ci aiuta nella valutazione.",
    subject: "La sua richiesta di deindicizzazione – stiamo esaminando il suo caso",
  },
  nl: {
    title: "Aanvraag ontvangen – we beoordelen uw zaak ✓",
    preview: "We hebben uw aanvraag ontvangen en bekijken wat er gede-indexeerd of verwijderd kan worden.",
    greeting: "Geachte heer/mevrouw,",
    intro: "hartelijk dank voor uw aanvraag. We hebben de door u genoemde inhoud ontvangen en ",
    introBold: "beoordelen uw zaak zorgvuldig",
    introRest: ".",
    lead: "Zo gaat het nu verder:",
    steps: [
      "Onze specialisten en ons partneradvocatenkantoor bekijken de links en beoordelen de juridische situatie.",
      "We controleren of de-indexering uit de Google-resultaten of verwijdering bij de bron realistisch is.",
      "Binnen 1–2 werkdagen ontvangt u onze beoordeling – met een duidelijk advies en, indien mogelijk, een vastprijsaanbod.",
    ],
    noteBold: "Gratis en vrijblijvend:",
    note: " De eerste beoordeling is kosteloos. Er ontstaan geen kosten zolang u niet uitdrukkelijk een aanbod opdracht geeft.",
    outro: "Heeft u meer links, screenshots of achtergrond? Beantwoord gewoon deze e-mail – dat helpt ons bij de beoordeling.",
    subject: "Uw verzoek tot de-indexering – we beoordelen uw zaak",
  },
  pt: {
    title: "Pedido recebido – estamos a analisar o seu caso ✓",
    preview: "Recebemos o seu pedido e estamos a verificar o que pode ser desindexado ou removido.",
    greeting: "Exmos. Senhores,",
    intro: "muito obrigado pelo seu pedido. Recebemos os conteúdos que indicou e estamos a ",
    introBold: "analisar o seu caso com atenção",
    introRest: ".",
    lead: "Eis o que acontece agora:",
    steps: [
      "Os nossos especialistas e o nosso escritório de advogados parceiro analisam as ligações e avaliam a situação jurídica.",
      "Verificamos se é realista a desindexação dos resultados do Google ou a remoção diretamente na fonte.",
      "No prazo de 1 a 2 dias úteis receberá a nossa avaliação, com uma recomendação clara e, se possível, uma proposta a preço fixo.",
    ],
    noteBold: "Gratuito e sem compromisso:",
    note: " A análise inicial é gratuita. Não há quaisquer custos enquanto não adjudicar expressamente uma proposta.",
    outro: "Tem mais ligações, capturas de ecrã ou contexto? Basta responder a este e-mail – ajuda-nos na avaliação.",
    subject: "O seu pedido de desindexação – estamos a analisar o seu caso",
  },
  ja: {
    title: "ご依頼を受け付けました — 内容を確認中です ✓",
    preview: "ご依頼を受け付けました。検索結果からの削除（デインデックス）や元記事の削除が可能か確認しています。",
    greeting: "ご担当者様",
    intro: "このたびはご依頼いただきありがとうございます。お知らせいただいた内容を受け取り、",
    introBold: "慎重に確認しております",
    introRest: "。",
    lead: "今後の流れは次のとおりです:",
    steps: [
      "当社の専門スタッフおよび提携法律事務所が、リンクを精査し法的状況を評価します。",
      "Google検索結果からの削除（デインデックス）、または掲載元での削除が現実的かどうかを確認します。",
      "1〜2営業日以内に、明確なご提案と、可能な場合は定額のお見積もりを添えて評価結果をお送りします。",
    ],
    noteBold: "無料・お申し込み義務なし:",
    note: " 初回の確認は無料です。お客様が正式にお申し込みをされない限り、費用は一切発生しません。",
    outro: "追加のリンク、スクリーンショット、経緯などがございましたら、このメールにご返信ください。評価の参考になります。",
    subject: "デインデックスのご依頼 — 内容を確認しています",
  },
  sv: {
    title: "Förfrågan mottagen – vi granskar ditt ärende ✓",
    preview: "Vi har tagit emot din förfrågan och undersöker vad som kan avindexeras eller tas bort.",
    greeting: "Hej,",
    intro: "tack så mycket för din förfrågan. Vi har tagit emot innehållet du angav och ",
    introBold: "granskar ditt ärende noggrant",
    introRest: ".",
    lead: "Så här går vi vidare:",
    steps: [
      "Våra specialister och vår samarbetande advokatbyrå granskar länkarna och bedömer det rättsliga läget.",
      "Vi kontrollerar om avindexering från Googles resultat eller borttagning direkt vid källan är realistiskt.",
      "Inom 1–2 arbetsdagar får du vår bedömning – med en tydlig rekommendation och, om möjligt, en offert till fast pris.",
    ],
    noteBold: "Gratis och utan förpliktelser:",
    note: " Den första granskningen är kostnadsfri. Inga kostnader uppstår så länge du inte uttryckligen beställer en offert.",
    outro: "Har du fler länkar, skärmbilder eller bakgrund? Svara bara på det här e-postmeddelandet – det hjälper oss i bedömningen.",
    subject: "Din begäran om avindexering – vi granskar ditt ärende",
  },
  da: {
    title: "Forespørgsel modtaget – vi vurderer din sag ✓",
    preview: "Vi har modtaget din forespørgsel og undersøger, hvad der kan afindekseres eller fjernes.",
    greeting: "Kære kunde,",
    intro: "mange tak for din forespørgsel. Vi har modtaget det indhold, du oplyste, og ",
    introBold: "vurderer din sag grundigt",
    introRest: ".",
    lead: "Sådan går vi videre:",
    steps: [
      "Vores specialister og vores partneradvokatfirma gennemgår linkene og vurderer den juridiske situation.",
      "Vi undersøger, om afindeksering fra Googles resultater eller fjernelse direkte ved kilden er realistisk.",
      "Inden for 1–2 hverdage modtager du vores vurdering – med en klar anbefaling og, hvis muligt, et tilbud til fast pris.",
    ],
    noteBold: "Gratis og uforpligtende:",
    note: " Den første vurdering er gratis. Der opstår ingen omkostninger, så længe du ikke udtrykkeligt bestiller et tilbud.",
    outro: "Har du flere links, skærmbilleder eller baggrund? Svar blot på denne e-mail – det hjælper os med vurderingen.",
    subject: "Din anmodning om afindeksering – vi vurderer din sag",
  },
  no: {
    title: "Forespørsel mottatt – vi vurderer saken din ✓",
    preview: "Vi har mottatt forespørselen din og undersøker hva som kan avindekseres eller fjernes.",
    greeting: "Hei,",
    intro: "tusen takk for forespørselen din. Vi har mottatt innholdet du oppga, og ",
    introBold: "vurderer saken din grundig",
    introRest: ".",
    lead: "Slik går vi videre:",
    steps: [
      "Våre spesialister og vårt samarbeidende advokatfirma gjennomgår lenkene og vurderer den juridiske situasjonen.",
      "Vi undersøker om avindeksering fra Googles resultater eller fjerning direkte ved kilden er realistisk.",
      "Innen 1–2 virkedager mottar du vår vurdering – med en klar anbefaling og, om mulig, et tilbud til fast pris.",
    ],
    noteBold: "Gratis og uforpliktende:",
    note: " Den første vurderingen er gratis. Det påløper ingen kostnader så lenge du ikke uttrykkelig bestiller et tilbud.",
    outro: "Har du flere lenker, skjermbilder eller bakgrunn? Bare svar på denne e-posten – det hjelper oss med vurderingen.",
    subject: "Din forespørsel om avindeksering – vi vurderer saken din",
  },
};

export function subject(p: PresseEingangProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function PresseEingang({ lang = "de", anrede }: PresseEingangProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{anrede || t.greeting}</strong></P>
      <P>{t.intro}<strong>{t.introBold}</strong>{t.introRest}</P>
      <P>{t.lead}</P>
      <Steps items={t.steps} />
      <NoteBox><strong>{t.noteBold}</strong>{t.note}</NoteBox>
      <P muted>{t.outro}</P>
      <Support lang={lang} phone />
    </EmailShell>
  );
}
