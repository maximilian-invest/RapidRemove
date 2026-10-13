/* Template: Keine Rechte — Kunde hat keine Zugriffsrechte (mehr) auf sein Google-Unternehmensprofil.
   Die Löschung ist trotzdem möglich, aber aufwändiger: Zugriff über das offizielle Google-Verfahren
   beantragen + Profil verifizieren → bis zu 5 Tage länger, bei Erfolg Aufpreis (Standard 290 €).
   Der Kunde entscheidet per Antwort auf die Mail, ob wir diesen Weg gehen. Ton: sehr professionell, freundlich. */
import * as React from "react";
import { EmailShell, P, NoteBox, Support } from "./components";

type Lang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";

export interface KeineRechteProps {
  lang?: Lang;
  /** persönliche Anrede mit Namen, sonst formell */
  name?: string;
  /** Aufpreis bei Erfolg, bereits formatiert (z. B. „290 €" / „$290") */
  extra?: string;
  /** true → Netto-Hinweis anhängen (EU-Preise; bei USD-Aufträgen ohne) */
  net?: boolean;
}

interface Copy {
  title: string; preview: string; greeting: string; hello: (n: string) => string;
  intro: string;
  wayBold: string; way: string; delayBold: string; delayRest: string;
  costA: string; costB: string; netLabel: string;
  askBold: string; ask: string;
  outro: string; subject: string;
}

const T: Record<Lang, Copy> = {
  de: {
    title: "Ihr Auftrag: Ein zusätzlicher Schritt ist nötig",
    preview: "Ihre Löschung ist weiterhin möglich – wir bitten Sie kurz um Ihre Zustimmung zum weiteren Vorgehen.",
    greeting: "Sehr geehrte Damen und Herren,",
    hello: (n) => `Guten Tag ${n},`,
    intro: "vielen Dank für Ihren Auftrag und Ihr Vertrauen. Bei der Bearbeitung haben wir festgestellt, dass Sie aktuell keine Zugriffsrechte mehr auf Ihr Google-Unternehmensprofil haben. Die Rechte können uns daher nicht auf dem üblichen Weg übertragen werden.",
    wayBold: "Die gute Nachricht:",
    way: " Die Löschung ist trotzdem möglich – der Weg ist allerdings aufwändiger. Wir beantragen den Zugriff zunächst über das offizielle Verfahren bei Google und verifizieren anschließend das Profil. ",
    delayBold: "Dadurch verlängert sich die Bearbeitung um bis zu 5 Tage",
    delayRest: ".",
    costA: "Für diesen Mehraufwand berechnen wir zusätzlich ",
    costB: " – und zwar ausschließlich dann, wenn die Löschung erfolgreich ist.",
    netLabel: " (netto)",
    askBold: "Wie möchten Sie fortfahren?",
    ask: " Antworten Sie einfach kurz auf diese E-Mail. Mit Ihrer Zustimmung setzen wir die Bearbeitung umgehend fort. Möchten Sie diesen Weg nicht gehen, ist das selbstverständlich in Ordnung – dann führen wir den zusätzlichen Schritt nicht durch.",
    outro: "Vielen Dank für Ihr Verständnis. Wir freuen uns, Ihren Auftrag für Sie zum Erfolg zu bringen.",
    subject: "Ihr Auftrag – kurze Rückfrage zum weiteren Vorgehen",
  },
  en: {
    title: "Your order: one additional step is needed",
    preview: "Your removal is still possible – we just need your approval on how to proceed.",
    greeting: "Dear Sir or Madam,",
    hello: (n) => `Hello ${n},`,
    intro: "thank you for your order and the trust you have placed in us. While processing it, we noticed that you currently no longer have access rights to your Google Business Profile. This means the rights cannot be transferred to us in the usual way.",
    wayBold: "The good news:",
    way: " The removal is still possible – the process is simply more involved. We first request access through Google's official procedure and then verify the profile. ",
    delayBold: "This extends processing by up to 5 days",
    delayRest: ".",
    costA: "For this additional effort we charge an extra ",
    costB: " – and only if the removal is successful.",
    netLabel: " (excl. VAT)",
    askBold: "How would you like to proceed?",
    ask: " Simply reply briefly to this email. Once we have your approval, we will continue right away. If you prefer not to go this route, that is of course perfectly fine – in that case we will not carry out the additional step.",
    outro: "Thank you for your understanding. We look forward to completing your order successfully.",
    subject: "Your order – a quick question on how to proceed",
  },
  es: {
    title: "Su pedido: es necesario un paso adicional",
    preview: "La eliminación sigue siendo posible: solo necesitamos su conformidad para continuar.",
    greeting: "Estimados señores:",
    hello: (n) => `Hola ${n}:`,
    intro: "muchas gracias por su pedido y por su confianza. Durante la tramitación hemos comprobado que actualmente ya no dispone de permisos de acceso a su perfil de empresa de Google. Por ello, no es posible transferirnos los permisos por la vía habitual.",
    wayBold: "La buena noticia:",
    way: " La eliminación sigue siendo posible, aunque el proceso es más laborioso. Primero solicitamos el acceso a través del procedimiento oficial de Google y, a continuación, verificamos el perfil. ",
    delayBold: "Esto prolonga la tramitación hasta 5 días",
    delayRest: ".",
    costA: "Por este trabajo adicional cobramos un suplemento de ",
    costB: ", y únicamente si la eliminación se realiza con éxito.",
    netLabel: " (IVA no incluido)",
    askBold: "¿Cómo desea continuar?",
    ask: " Basta con que responda brevemente a este correo. Con su conformidad, continuaremos de inmediato. Si prefiere no seguir esta vía, por supuesto no hay ningún problema: en ese caso no realizaremos el paso adicional.",
    outro: "Muchas gracias por su comprensión. Será un placer llevar su pedido a buen término.",
    subject: "Su pedido: una breve consulta sobre cómo continuar",
  },
  fr: {
    title: "Votre commande : une étape supplémentaire est nécessaire",
    preview: "La suppression reste possible – nous avons simplement besoin de votre accord pour la suite.",
    greeting: "Madame, Monsieur,",
    hello: (n) => `Bonjour ${n},`,
    intro: "merci beaucoup pour votre commande et pour votre confiance. Lors du traitement, nous avons constaté que vous ne disposez actuellement plus de droits d'accès à votre fiche d'établissement Google. Les droits ne peuvent donc pas nous être transférés de la manière habituelle.",
    wayBold: "La bonne nouvelle :",
    way: " la suppression reste possible – la procédure est simplement plus complexe. Nous demandons d'abord l'accès via la procédure officielle de Google, puis nous vérifions la fiche. ",
    delayBold: "Le traitement est ainsi prolongé de 5 jours au maximum",
    delayRest: ".",
    costA: "Pour ce travail supplémentaire, nous facturons ",
    costB: " de plus – uniquement si la suppression aboutit.",
    netLabel: " (HT)",
    askBold: "Comment souhaitez-vous procéder ?",
    ask: " Il vous suffit de répondre brièvement à cet e-mail. Dès réception de votre accord, nous poursuivons le traitement sans délai. Si vous préférez ne pas suivre cette voie, c'est bien entendu tout à fait possible – nous n'effectuerons alors pas cette étape supplémentaire.",
    outro: "Merci de votre compréhension. Nous serons ravis de mener votre commande à bien.",
    subject: "Votre commande – une brève question sur la suite",
  },
  it: {
    title: "Il vostro ordine: è necessario un passaggio aggiuntivo",
    preview: "La rimozione resta possibile: ci serve solo il vostro consenso per procedere.",
    greeting: "Gentili Signore e Signori,",
    hello: (n) => `Gentile ${n},`,
    intro: "grazie per il vostro ordine e per la fiducia accordataci. Durante l'elaborazione abbiamo constatato che attualmente non disponete più dei diritti di accesso al vostro profilo dell'attività su Google. I diritti non possono quindi esserci trasferiti nel modo consueto.",
    wayBold: "La buona notizia:",
    way: " la rimozione resta comunque possibile, ma il procedimento è più impegnativo. Per prima cosa richiediamo l'accesso tramite la procedura ufficiale di Google e successivamente verifichiamo il profilo. ",
    delayBold: "In questo modo l'elaborazione si prolunga fino a 5 giorni",
    delayRest: ".",
    costA: "Per questo lavoro aggiuntivo addebitiamo un supplemento di ",
    costB: ", esclusivamente in caso di rimozione andata a buon fine.",
    netLabel: " (IVA esclusa)",
    askBold: "Come desiderate procedere?",
    ask: " Vi basta rispondere brevemente a questa e-mail. Con il vostro consenso riprendiamo subito l'elaborazione. Se preferite non seguire questa strada, va naturalmente benissimo: in tal caso non eseguiremo il passaggio aggiuntivo.",
    outro: "Grazie per la vostra comprensione. Saremo lieti di portare a termine con successo il vostro ordine.",
    subject: "Il vostro ordine – una breve domanda su come procedere",
  },
  nl: {
    title: "Uw bestelling: er is een extra stap nodig",
    preview: "De verwijdering is nog steeds mogelijk – we hebben alleen uw akkoord nodig om verder te gaan.",
    greeting: "Geachte heer/mevrouw,",
    hello: (n) => `Beste ${n},`,
    intro: "hartelijk dank voor uw bestelling en uw vertrouwen. Bij de verwerking hebben we vastgesteld dat u momenteel geen toegangsrechten meer heeft tot uw Google-bedrijfsprofiel. De rechten kunnen daarom niet op de gebruikelijke manier aan ons worden overgedragen.",
    wayBold: "Het goede nieuws:",
    way: " de verwijdering is toch mogelijk – de werkwijze is alleen bewerkelijker. We vragen eerst toegang aan via de officiële procedure van Google en verifiëren daarna het profiel. ",
    delayBold: "Hierdoor duurt de verwerking tot 5 dagen langer",
    delayRest: ".",
    costA: "Voor dit extra werk rekenen we aanvullend ",
    costB: " – en uitsluitend als de verwijdering slaagt.",
    netLabel: " (excl. btw)",
    askBold: "Hoe wilt u verdergaan?",
    ask: " Beantwoord deze e-mail gewoon kort. Met uw akkoord zetten we de verwerking direct voort. Wilt u deze weg liever niet gaan, dan is dat uiteraard geen probleem – in dat geval voeren we de extra stap niet uit.",
    outro: "Hartelijk dank voor uw begrip. We zetten ons graag in om uw bestelling tot een goed einde te brengen.",
    subject: "Uw bestelling – een korte vraag over het vervolg",
  },
  pt: {
    title: "A sua encomenda: é necessário um passo adicional",
    preview: "A eliminação continua a ser possível – precisamos apenas da sua autorização para avançar.",
    greeting: "Exmos. Senhores,",
    hello: (n) => `Olá ${n},`,
    intro: "muito obrigado pela sua encomenda e pela sua confiança. Durante o processamento, verificámos que atualmente já não dispõe de permissões de acesso ao seu perfil de empresa do Google. Por isso, as permissões não nos podem ser transferidas da forma habitual.",
    wayBold: "A boa notícia:",
    way: " a eliminação continua a ser possível – o processo é apenas mais trabalhoso. Primeiro solicitamos o acesso através do procedimento oficial da Google e, em seguida, verificamos o perfil. ",
    delayBold: "Isto prolonga o processamento até 5 dias",
    delayRest: ".",
    costA: "Por este trabalho adicional cobramos um valor extra de ",
    costB: " – e apenas se a eliminação for bem-sucedida.",
    netLabel: " (IVA não incluído)",
    askBold: "Como pretende avançar?",
    ask: " Basta responder brevemente a este e-mail. Com a sua autorização, retomamos o processamento de imediato. Se preferir não seguir este caminho, não há qualquer problema – nesse caso, não realizaremos o passo adicional.",
    outro: "Muito obrigado pela sua compreensão. Teremos todo o gosto em concluir a sua encomenda com sucesso.",
    subject: "A sua encomenda – uma breve questão sobre como avançar",
  },
  ja: {
    title: "ご注文について:追加の手続きが必要です",
    preview: "削除は引き続き可能です。今後の進め方についてご了承をお願いいたします。",
    greeting: "ご担当者様",
    hello: (n) => `${n} 様`,
    intro: "このたびはご注文ならびにご信頼を賜り、誠にありがとうございます。作業を進める中で、現在お客様がGoogleビジネスプロフィールへのアクセス権限をお持ちでないことが判明いたしました。そのため、通常の方法で当社に権限を移譲していただくことができません。",
    wayBold: "ご安心ください。",
    way: "削除は引き続き可能ですが、手続きがより複雑になります。まずGoogleの正式な手続きを通じてアクセス権を申請し、その後プロフィールの確認(認証)を行います。",
    delayBold: "このため、作業期間が最大5日間延長されます",
    delayRest: "。",
    costA: "この追加作業につきましては、",
    costB: "を追加で申し受けます。なお、追加料金は削除が成功した場合にのみ発生いたします。",
    netLabel: "(税抜)",
    askBold: "今後の進め方について",
    ask: "本メールにご返信いただくだけで結構です。ご了承をいただき次第、直ちに作業を再開いたします。この方法をご希望されない場合も、もちろん問題ございません。その際は追加の手続きは行いません。",
    outro: "ご理解のほど、よろしくお願い申し上げます。ご注文を無事に完了できるよう、全力で対応いたします。",
    subject: "ご注文について:今後の進め方のご確認",
  },
  sv: {
    title: "Din beställning: ett extra steg behövs",
    preview: "Borttagningen är fortfarande möjlig – vi behöver bara ditt godkännande för att gå vidare.",
    greeting: "Hej,",
    hello: (n) => `Hej ${n},`,
    intro: "tack för din beställning och för ditt förtroende. Under handläggningen har vi konstaterat att du för närvarande inte längre har åtkomstbehörighet till din Google-företagsprofil. Behörigheten kan därför inte överlåtas till oss på det vanliga sättet.",
    wayBold: "Den goda nyheten:",
    way: " borttagningen är ändå möjlig – processen är bara mer omfattande. Vi ansöker först om åtkomst via Googles officiella förfarande och verifierar sedan profilen. ",
    delayBold: "Detta förlänger handläggningen med upp till 5 dagar",
    delayRest: ".",
    costA: "För detta extra arbete debiterar vi ytterligare ",
    costB: " – och endast om borttagningen lyckas.",
    netLabel: " (exkl. moms)",
    askBold: "Hur vill du gå vidare?",
    ask: " Svara bara kort på det här mejlet. Med ditt godkännande fortsätter vi direkt. Vill du inte gå den här vägen är det naturligtvis helt i sin ordning – då genomför vi inte det extra steget.",
    outro: "Tack för din förståelse. Vi ser fram emot att slutföra din beställning med framgång.",
    subject: "Din beställning – en kort fråga om hur vi går vidare",
  },
  da: {
    title: "Din bestilling: der er behov for et ekstra trin",
    preview: "Fjernelsen er stadig mulig – vi har blot brug for dit samtykke til at fortsætte.",
    greeting: "Kære kunde,",
    hello: (n) => `Hej ${n},`,
    intro: "tak for din bestilling og din tillid. Under behandlingen har vi konstateret, at du i øjeblikket ikke længere har adgangsrettigheder til din Google-virksomhedsprofil. Rettighederne kan derfor ikke overdrages til os på den sædvanlige måde.",
    wayBold: "Den gode nyhed:",
    way: " fjernelsen er stadig mulig – processen er blot mere omfattende. Vi anmoder først om adgang via Googles officielle procedure og verificerer derefter profilen. ",
    delayBold: "Det forlænger behandlingen med op til 5 dage",
    delayRest: ".",
    costA: "For dette ekstra arbejde opkræver vi yderligere ",
    costB: " – og kun hvis fjernelsen lykkes.",
    netLabel: " (ekskl. moms)",
    askBold: "Hvordan vil du gerne fortsætte?",
    ask: " Svar blot kort på denne e-mail. Med dit samtykke fortsætter vi med det samme. Ønsker du ikke at gå denne vej, er det naturligvis helt i orden – så udfører vi ikke det ekstra trin.",
    outro: "Tak for din forståelse. Vi ser frem til at gennemføre din bestilling med succes.",
    subject: "Din bestilling – et kort spørgsmål om det videre forløb",
  },
  no: {
    title: "Bestillingen din: et ekstra steg er nødvendig",
    preview: "Fjerningen er fortsatt mulig – vi trenger bare ditt samtykke for å gå videre.",
    greeting: "Hei,",
    hello: (n) => `Hei ${n},`,
    intro: "takk for bestillingen og tilliten din. Under behandlingen har vi oppdaget at du for øyeblikket ikke lenger har tilgangsrettigheter til Google-bedriftsprofilen din. Rettighetene kan derfor ikke overføres til oss på vanlig måte.",
    wayBold: "Den gode nyheten:",
    way: " fjerningen er likevel mulig – prosessen er bare mer omfattende. Vi søker først om tilgang via Googles offisielle prosedyre og verifiserer deretter profilen. ",
    delayBold: "Dette forlenger behandlingen med opptil 5 dager",
    delayRest: ".",
    costA: "For dette ekstra arbeidet belaster vi i tillegg ",
    costB: " – og kun dersom fjerningen lykkes.",
    netLabel: " (ekskl. mva.)",
    askBold: "Hvordan ønsker du å gå videre?",
    ask: " Svar bare kort på denne e-posten. Med ditt samtykke fortsetter vi umiddelbart. Ønsker du ikke å gå denne veien, er det selvsagt helt i orden – da gjennomfører vi ikke det ekstra steget.",
    outro: "Takk for forståelsen. Vi ser frem til å fullføre bestillingen din med suksess.",
    subject: "Bestillingen din – et kort spørsmål om veien videre",
  },
};

export default function KeineRechte({ lang = "de", name, extra = "290 €", net = true }: KeineRechteProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{name ? t.hello(name) : t.greeting}</strong></P>
      <P>{t.intro}</P>
      <NoteBox><strong>{t.wayBold}</strong>{t.way}<strong>{t.delayBold}</strong>{t.delayRest}</NoteBox>
      <P>{t.costA}<strong>{extra}{net ? t.netLabel : ""}</strong>{t.costB}</P>
      <P><strong>{t.askBold}</strong>{t.ask}</P>
      <P muted>{t.outro}</P>
      <Support lang={lang} phone />
    </EmailShell>
  );
}

export function subject(p: KeineRechteProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}
