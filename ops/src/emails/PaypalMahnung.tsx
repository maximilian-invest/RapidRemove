/* Template: PayPal-Mahnlauf – 4-stufige Zahlungserinnerung/Mahnung für PayPal-Kunden.
 *
 *   Stufe 1: freundliche Zahlungserinnerung (neutrale Box)
 *   Stufe 2: 2. Erinnerung, überfällig (neutrale Box, 48 h)
 *   Stufe 3: Mahnung, scharf (rote Box) – Inkasso + Wiederherstellung des Profils
 *   Stufe 4: Letzte Mahnung (rote Box) – HEUTE zahlen, sonst Reaktivierung + Inkasso
 *
 * Gegenstück zum Stripe-Mahnlauf (Mahnung.tsx), aber für die PayPal-Zahlung:
 * KEIN eingebetteter Zahlungs-Button – verweist auf den separat gesendeten
 * PayPal-Link. NUR außerhalb DACH (lockerer „du"-Ton, keine deutsche Fassung;
 * im Admin für lang="de" ausgeblendet + serverseitig abgelehnt).
 *
 * Reset-Aufträge ("reset"): in Stufe 3/4 wird mit Wiederherstellung der bisherigen
 * Bewertungen gedroht (statt Reaktivierung des Profils).
 */
import * as React from "react";
import { EmailShell, P, NoteBox, DangerBox, brand, type MailLang } from "./components";

/** Berechnete Ersparnis – vorformatierte Beträge (erinnert an den PayPal-Vorteil). */
export interface OfferData {
  regular: string; paypal: string; savings: string;
  sub?: { monthly: string; regular: string; paypal: string } | null;
}

export interface PaypalMahnungProps {
  /** Landessprache – KEIN Deutsch (nur außerhalb DACH). */
  lang?: Exclude<MailLang, "de">;
  /** Vorname/Name des Kunden für die persönliche Anrede. */
  name?: string;
  /** Berechnete Ersparnis (konkrete Beträge) – erinnert an den PayPal-Vorteil. */
  offer?: OfferData | null;
  /** Leistungs-Key. Bei "reset" droht Stufe 3/4 mit Wiederherstellung der Bewertungen. */
  service?: string;
  /** Mahnstufe 1–4 (Standard 1). */
  stage?: 1 | 2 | 3 | 4;
  /** Im Admin bearbeitete Text-Overrides (überschreiben Default-Texte pro Feld). */
  _overrides?: Record<string, string>;
}

type Lang = Exclude<MailLang, "de">;
const LANGS: Lang[] = ["en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

/** Sprachabhängige, stufenübergreifende Bausteine (informell, „du"). */
const COMMON: Record<Lang, { greeting: (n: string) => string; payLine: string; notePaid: string; signoff: string }> = {
  en: { greeting: (n) => (n ? `Hi ${n},` : "Hi there,"), payLine: "You can still pay easily via the PayPal link we sent you.", notePaid: "If you’ve already paid, please disregard this message — thank you!", signoff: "Warm regards," },
  es: { greeting: (n) => (n ? `Hola ${n},` : "Hola,"), payLine: "Aún puedes pagar cómodamente a través del enlace de PayPal que te enviamos.", notePaid: "Si ya has pagado, ignora este mensaje. ¡Gracias!", signoff: "Un saludo," },
  fr: { greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"), payLine: "Tu peux toujours payer facilement via le lien PayPal que nous t’avons envoyé.", notePaid: "Si tu as déjà payé, ignore ce message. Merci !", signoff: "Bien à toi," },
  it: { greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"), payLine: "Puoi ancora pagare comodamente tramite il link PayPal che ti abbiamo inviato.", notePaid: "Se hai già pagato, ignora questo messaggio. Grazie!", signoff: "Un caro saluto," },
  nl: { greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"), payLine: "Je kunt nog steeds eenvoudig betalen via de PayPal-link die we je hebben gestuurd.", notePaid: "Heb je al betaald? Beschouw dit bericht dan als niet verzonden. Bedankt!", signoff: "Hartelijke groet," },
  pt: { greeting: (n) => (n ? `Olá ${n},` : "Olá,"), payLine: "Podes pagar comodamente através do link PayPal que te enviámos.", notePaid: "Se já pagaste, ignora esta mensagem. Obrigado!", signoff: "Um abraço," },
  ja: { greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"), payLine: "先ほどお送りしたPayPalのリンクから、引き続き簡単にお支払いいただけます。", notePaid: "すでにお支払い済みの場合は、本メッセージを破棄してください。ありがとうございます。", signoff: "どうぞよろしくお願いいたします。" },
  sv: { greeting: (n) => (n ? `Hej ${n},` : "Hej,"), payLine: "Du kan fortfarande betala enkelt via PayPal-länken vi skickade till dig.", notePaid: "Om du redan har betalat, bortse från detta meddelande. Tack!", signoff: "Vänliga hälsningar," },
  da: { greeting: (n) => (n ? `Hej ${n},` : "Hej,"), payLine: "Du kan stadig nemt betale via det PayPal-link, vi sendte til dig.", notePaid: "Hvis du allerede har betalt, så se bort fra denne besked. Tak!", signoff: "Venlig hilsen," },
  no: { greeting: (n) => (n ? `Hei ${n},` : "Hei,"), payLine: "Du kan fortsatt betale enkelt via PayPal-lenken vi sendte deg.", notePaid: "Hvis du allerede har betalt, se bort fra denne meldingen. Takk!", signoff: "Vennlig hilsen," },
};

interface StageText { subject: string; preview: string; title: string; intro: string; warn: string; }

/** STAGES[stufe][sprache] = Texte (informell, PayPal, ohne Button). */
const STAGES: Record<1 | 2 | 3 | 4, Record<Lang, StageText>> = {
  1: {
    en: { subject: "Reminder: your payment is still open", preview: "A quick reminder – please complete your payment within 48 hours.", title: "A quick reminder about your payment", intro: "just a friendly reminder – we haven’t received your payment yet. It may simply have slipped through in day-to-day business.", warn: "Please complete the payment within the next 48 hours. Otherwise we’ll have to restore your business profile, which means it will appear on Google again." },
    es: { subject: "Recordatorio: tu pago sigue pendiente", preview: "Un recordatorio rápido: completa tu pago en un plazo de 48 horas.", title: "Un recordatorio rápido sobre tu pago", intro: "solo un recordatorio amable: todavía no hemos recibido tu pago. Probablemente se haya traspapelado en el día a día.", warn: "Te pedimos que completes el pago en las próximas 48 horas. De lo contrario, tendremos que restablecer tu perfil de empresa, lo que significa que volverá a aparecer en Google." },
    fr: { subject: "Rappel : ton paiement est toujours en attente", preview: "Un petit rappel : merci d’effectuer ton paiement sous 48 heures.", title: "Un petit rappel concernant ton paiement", intro: "juste un petit rappel amical : nous n’avons pas encore reçu ton paiement. Il est probablement passé inaperçu dans le quotidien.", warn: "Merci d’effectuer le paiement dans les 48 heures à venir. Sinon, nous devrons rétablir ta fiche d’établissement, ce qui signifie qu’elle réapparaîtra sur Google." },
    it: { subject: "Promemoria: il tuo pagamento è ancora in sospeso", preview: "Un rapido promemoria: completa il pagamento entro 48 ore.", title: "Un rapido promemoria sul tuo pagamento", intro: "solo un promemoria gentile: non abbiamo ancora ricevuto il tuo pagamento. Probabilmente ti è sfuggito nella quotidianità.", warn: "Ti chiediamo di completare il pagamento entro le prossime 48 ore. In caso contrario, dovremo ripristinare il tuo profilo aziendale, il che significa che riapparirà su Google." },
    nl: { subject: "Herinnering: je betaling staat nog open", preview: "Een korte herinnering: rond je betaling binnen 48 uur af.", title: "Een korte herinnering over je betaling", intro: "even een vriendelijke herinnering: we hebben je betaling nog niet ontvangen. Waarschijnlijk is het in de drukte ondergesneeuwd.", warn: "Rond de betaling graag binnen de komende 48 uur af. Anders moeten we je bedrijfsprofiel herstellen, wat betekent dat het weer op Google verschijnt." },
    pt: { subject: "Lembrete: o teu pagamento continua pendente", preview: "Um lembrete rápido: conclui o teu pagamento no prazo de 48 horas.", title: "Um lembrete rápido sobre o teu pagamento", intro: "só um lembrete simpático: ainda não recebemos o teu pagamento. Provavelmente passou despercebido no dia a dia.", warn: "Pedimos-te que concluas o pagamento nas próximas 48 horas. Caso contrário, teremos de repor o teu perfil de empresa, o que significa que voltará a aparecer no Google." },
    ja: { subject: "お支払いのお願い", preview: "お支払いをあと48時間以内にお願いいたします。", title: "お支払いについてのご確認", intro: "念のためのご連絡です。まだお支払いを確認できておりません。日々の業務の中で見落とされたのかもしれません。", warn: "お手数ですが、今後48時間以内にお支払いをお願いいたします。そうでない場合、ビジネスプロフィールを元に戻す必要があり、再びGoogleに表示されてしまいます。" },
    sv: { subject: "Påminnelse: din betalning är fortfarande öppen", preview: "En snabb påminnelse – slutför din betalning inom 48 timmar.", title: "En snabb påminnelse om din betalning", intro: "bara en vänlig påminnelse – vi har ännu inte fått din betalning. Den har sannolikt fallit mellan stolarna i vardagen.", warn: "Vänligen slutför betalningen inom de närmaste 48 timmarna. Annars måste vi återställa din företagsprofil, vilket innebär att den visas på Google igen." },
    da: { subject: "Påmindelse: din betaling er stadig åben", preview: "En hurtig påmindelse – gennemfør din betaling inden for 48 timer.", title: "En hurtig påmindelse om din betaling", intro: "bare en venlig påmindelse – vi har endnu ikke modtaget din betaling. Den er sandsynligvis druknet i hverdagen.", warn: "Gennemfør venligst betalingen inden for de næste 48 timer. Ellers bliver vi nødt til at gendanne din virksomhedsprofil, hvilket betyder, at den vises på Google igen." },
    no: { subject: "Påminnelse: betalingen din er fortsatt åpen", preview: "En rask påminnelse – fullfør betalingen din innen 48 timer.", title: "En rask påminnelse om betalingen din", intro: "bare en vennlig påminnelse – vi har ennå ikke mottatt betalingen din. Den har sannsynligvis druknet i hverdagen.", warn: "Vennligst fullfør betalingen innen de neste 48 timene. Ellers må vi gjenopprette bedriftsprofilen din, noe som betyr at den vises på Google igjen." },
  },
  2: {
    en: { subject: "2nd reminder: your payment is overdue", preview: "Your payment is overdue – please pay within 48 hours.", title: "2nd reminder about your payment", intro: "despite our reminder, we still haven’t received your payment.", warn: "Your payment is now overdue. Please pay within the next 48 hours – otherwise we’ll have to restore your business profile and it will reappear on Google." },
    es: { subject: "2.º recordatorio: tu pago está vencido", preview: "Tu pago está vencido: paga en un plazo de 48 horas.", title: "2.º recordatorio sobre tu pago", intro: "a pesar de nuestro recordatorio, todavía no hemos recibido tu pago.", warn: "Tu pago está ahora vencido. Págalo en las próximas 48 horas; de lo contrario, tendremos que restablecer tu perfil de empresa y volverá a aparecer en Google." },
    fr: { subject: "2e rappel : ton paiement est en retard", preview: "Ton paiement est en retard – merci de payer sous 48 heures.", title: "2e rappel concernant ton paiement", intro: "malgré notre rappel, nous n’avons toujours pas reçu ton paiement.", warn: "Ton paiement est désormais en retard. Merci de payer dans les 48 heures à venir – sinon, nous devrons rétablir ta fiche d’établissement et elle réapparaîtra sur Google." },
    it: { subject: "2° promemoria: il tuo pagamento è scaduto", preview: "Il tuo pagamento è scaduto: paga entro 48 ore.", title: "2° promemoria sul tuo pagamento", intro: "nonostante il nostro promemoria, non abbiamo ancora ricevuto il tuo pagamento.", warn: "Il tuo pagamento è ora scaduto. Effettualo entro le prossime 48 ore – in caso contrario, dovremo ripristinare il tuo profilo aziendale e riapparirà su Google." },
    nl: { subject: "2e herinnering: je betaling is achterstallig", preview: "Je betaling is achterstallig – betaal binnen 48 uur.", title: "2e herinnering over je betaling", intro: "ondanks onze herinnering hebben we je betaling nog steeds niet ontvangen.", warn: "Je betaling is inmiddels achterstallig. Betaal binnen de komende 48 uur – anders moeten we je bedrijfsprofiel herstellen en verschijnt het weer op Google." },
    pt: { subject: "2.º lembrete: o teu pagamento está em atraso", preview: "O teu pagamento está em atraso – paga no prazo de 48 horas.", title: "2.º lembrete sobre o teu pagamento", intro: "apesar do nosso lembrete, ainda não recebemos o teu pagamento.", warn: "O teu pagamento está agora em atraso. Paga nas próximas 48 horas – caso contrário, teremos de repor o teu perfil de empresa e voltará a aparecer no Google." },
    ja: { subject: "2回目のお支払いのお願い", preview: "お支払いが期限超過です。48時間以内にお願いいたします。", title: "2回目のお支払いのご確認", intro: "お支払いのお願いをお送りしておりますが、いまだお支払いを確認できておりません。", warn: "お客様のお支払いは期限を過ぎております。今後48時間以内にお支払いください。そうでない場合、ビジネスプロフィールを元に戻す必要があり、再びGoogleに表示されます。" },
    sv: { subject: "2:a påminnelsen: din betalning är förfallen", preview: "Din betalning är förfallen – betala inom 48 timmar.", title: "2:a påminnelsen om din betalning", intro: "trots vår påminnelse har vi fortfarande inte fått din betalning.", warn: "Din betalning är nu förfallen. Betala inom de närmaste 48 timmarna – annars måste vi återställa din företagsprofil och den visas på Google igen." },
    da: { subject: "2. påmindelse: din betaling er forfalden", preview: "Din betaling er forfalden – betal inden for 48 timer.", title: "2. påmindelse om din betaling", intro: "trods vores påmindelse har vi stadig ikke modtaget din betaling.", warn: "Din betaling er nu forfalden. Betal inden for de næste 48 timer – ellers bliver vi nødt til at gendanne din virksomhedsprofil, og den vises på Google igen." },
    no: { subject: "2. påminnelse: betalingen din er forfalt", preview: "Betalingen din er forfalt – betal innen 48 timer.", title: "2. påminnelse om betalingen din", intro: "til tross for påminnelsen vår har vi fortsatt ikke mottatt betalingen din.", warn: "Betalingen din er nå forfalt. Betal innen de neste 48 timene – ellers må vi gjenopprette bedriftsprofilen din, og den vises på Google igjen." },
  },
  3: {
    en: { subject: "Payment notice — please settle immediately", preview: "Final reminder before further steps – please pay immediately.", title: "Payment notice", intro: "despite several reminders, your payment is still outstanding.", warn: "If payment is not made immediately, we will take further steps – including handing the claim to a debt collection agency and restoring your Google Business Profile, including all reviews." },
    es: { subject: "Aviso de impago — paga de inmediato", preview: "Último recordatorio antes de tomar más medidas: paga de inmediato.", title: "Aviso de impago", intro: "a pesar de varios recordatorios, tu pago sigue pendiente.", warn: "Si no pagas de inmediato, tomaremos más medidas, incluida la cesión a una agencia de cobros y la reactivación de tu perfil de empresa de Google con todas las reseñas." },
    fr: { subject: "Mise en demeure — merci de payer immédiatement", preview: "Dernier rappel avant de nouvelles mesures – merci de payer immédiatement.", title: "Mise en demeure", intro: "malgré plusieurs rappels, ton paiement reste en attente.", warn: "À défaut de paiement immédiat, nous engagerons d’autres mesures – dont la transmission à une société de recouvrement et la remise en ligne de ta fiche d’établissement Google, avec tous les avis." },
    it: { subject: "Costituzione in mora — paga immediatamente", preview: "Ultimo promemoria prima di ulteriori azioni: paga immediatamente.", title: "Costituzione in mora", intro: "nonostante diversi solleciti, il tuo pagamento è ancora in sospeso.", warn: "Se il pagamento non avviene immediatamente, intraprenderemo ulteriori azioni, tra cui l’affidamento a un’agenzia di recupero crediti e la ripubblicazione del tuo profilo aziendale Google con tutte le recensioni." },
    nl: { subject: "Ingebrekestelling — betaal onmiddellijk", preview: "Laatste herinnering vóór verdere stappen – betaal a.u.b. onmiddellijk.", title: "Ingebrekestelling", intro: "ondanks meerdere herinneringen staat je betaling nog steeds open.", warn: "Vindt de betaling niet onmiddellijk plaats, dan ondernemen wij verdere stappen – waaronder overdracht aan een incassobureau en het terugplaatsen van je Google-bedrijfsprofiel, inclusief alle beoordelingen." },
    pt: { subject: "Interpelação — paga de imediato", preview: "Último lembrete antes de mais medidas – paga de imediato.", title: "Interpelação de pagamento", intro: "apesar de vários lembretes, o teu pagamento continua pendente.", warn: "Se o pagamento não for efetuado de imediato, tomaremos novas medidas, incluindo a entrega a uma agência de cobrança e a reativação do teu perfil de empresa do Google, com todas as avaliações." },
    ja: { subject: "督促 – 直ちにお支払いください", preview: "次の措置の前の最終のご連絡です。直ちにお支払いください。", title: "督促", intro: "再三のご連絡にもかかわらず、お支払いはいまだ未払いとなっております。", warn: "直ちにお支払いいただけない場合、債権回収業者への引き渡し、ならびにお客様のGoogleビジネスプロフィール（すべての口コミを含む）の再公開を含む、次の措置を講じます。" },
    sv: { subject: "Betalningskrav — betala omgående", preview: "Sista påminnelsen före vidare åtgärder – betala omgående.", title: "Betalningskrav", intro: "trots flera påminnelser är din betalning fortfarande obetald.", warn: "Sker ingen betalning omgående vidtar vi ytterligare åtgärder – inklusive överlämning till ett inkassobolag och återpublicering av din Google-företagsprofil med alla omdömen." },
    da: { subject: "Rykker — betal omgående", preview: "Sidste påmindelse før yderligere skridt – betal omgående.", title: "Rykker", intro: "trods flere påmindelser er din betaling fortsat ubetalt.", warn: "Sker betalingen ikke omgående, tager vi yderligere skridt – herunder overdragelse til et inkassobureau og genudgivelse af din Google-virksomhedsprofil inklusive alle anmeldelser." },
    no: { subject: "Betalingskrav — betal omgående", preview: "Siste påminnelse før videre tiltak – betal omgående.", title: "Betalingskrav", intro: "til tross for flere påminnelser er betalingen din fortsatt ubetalt.", warn: "Skjer ikke betaling omgående, iverksetter vi videre tiltak – inkludert overføring til et inkassobyrå og republisering av Google-bedriftsprofilen din med alle anmeldelser." },
  },
  4: {
    en: { subject: "Final notice — payment required today", preview: "Final deadline: please pay today, otherwise your profile will be restored.", title: "Final notice", intro: "this is our final notice. Your payment remains outstanding.", warn: "Final deadline: please pay TODAY. Otherwise we will restore your Google Business Profile including all reviews and hand the claim to a debt collection agency." },
    es: { subject: "Última advertencia — pago requerido hoy", preview: "Plazo final: paga hoy, de lo contrario se reactivará tu perfil.", title: "Última advertencia", intro: "esta es nuestra última advertencia. Tu pago sigue pendiente.", warn: "Plazo final: paga HOY. De lo contrario, reactivaremos tu perfil de empresa de Google con todas las reseñas y cederemos la deuda a una agencia de cobros." },
    fr: { subject: "Dernier rappel — paiement requis aujourd’hui", preview: "Dernier délai : paie aujourd’hui, sinon ta fiche sera remise en ligne.", title: "Dernier rappel", intro: "ceci est notre dernier rappel. Ton paiement demeure impayé.", warn: "Dernier délai : merci de payer AUJOURD’HUI. Sinon, nous remettrons en ligne ta fiche d’établissement Google avec tous les avis et confierons la créance à une société de recouvrement." },
    it: { subject: "Ultimo sollecito — pagamento richiesto oggi", preview: "Termine ultimo: paga oggi, altrimenti il tuo profilo verrà ripubblicato.", title: "Ultimo sollecito", intro: "questo è il nostro ultimo sollecito. Il tuo pagamento risulta ancora non effettuato.", warn: "Termine ultimo: paga OGGI. In caso contrario ripubblicheremo il tuo profilo aziendale Google con tutte le recensioni e affideremo il credito a un’agenzia di recupero crediti." },
    nl: { subject: "Laatste aanmaning — betaling vandaag vereist", preview: "Laatste termijn: betaal vandaag, anders wordt je profiel teruggeplaatst.", title: "Laatste aanmaning", intro: "dit is onze laatste aanmaning. Je betaling is nog steeds niet ontvangen.", warn: "Laatste termijn: betaal VANDAAG. Anders plaatsen wij je Google-bedrijfsprofiel inclusief alle beoordelingen terug en dragen wij de vordering over aan een incassobureau." },
    pt: { subject: "Última notificação — pagamento exigido hoje", preview: "Prazo final: paga hoje, caso contrário o teu perfil será reativado.", title: "Última notificação", intro: "esta é a nossa última notificação. O teu pagamento continua por efetuar.", warn: "Prazo final: paga HOJE. Caso contrário, reativaremos o teu perfil de empresa do Google com todas as avaliações e entregaremos a dívida a uma agência de cobrança." },
    ja: { subject: "最終通告 – 本日中のお支払いが必要です", preview: "最終期限：本日中にお支払いください。さもなくばプロフィールを再公開します。", title: "最終通告", intro: "本メールは最終通告です。お支払いはいまだ未払いのままです。", warn: "最終期限：本日中にお支払いください。さもなければ、お客様のGoogleビジネスプロフィールをすべての口コミとともに再公開し、本債権を債権回収業者に引き渡します。" },
    sv: { subject: "Sista påminnelsen — betalning krävs i dag", preview: "Sista fristen: betala i dag, annars återpubliceras din profil.", title: "Sista påminnelsen", intro: "detta är vår sista påminnelse. Din betalning är fortfarande obetald.", warn: "Sista fristen: betala I DAG. Annars återpublicerar vi din Google-företagsprofil med alla omdömen och lämnar fordran till ett inkassobolag." },
    da: { subject: "Sidste rykker — betaling kræves i dag", preview: "Sidste frist: betal i dag, ellers genudgives din profil.", title: "Sidste rykker", intro: "dette er vores sidste rykker. Din betaling er fortsat ubetalt.", warn: "Sidste frist: betal I DAG. Ellers genudgiver vi din Google-virksomhedsprofil inklusive alle anmeldelser og overdrager kravet til et inkassobureau." },
    no: { subject: "Siste purring — betaling kreves i dag", preview: "Siste frist: betal i dag, ellers republiseres profilen din.", title: "Siste purring", intro: "dette er vår siste purring. Betalingen din er fortsatt ubetalt.", warn: "Siste frist: betal I DAG. Ellers republiserer vi Google-bedriftsprofilen din med alle anmeldelser og overfører kravet til et inkassobyrå." },
  },
};

/* Reset-Aufträge: in Stufe 3/4 wird mit Wiederherstellung der bisherigen Bewertungen
   gedroht (statt Reaktivierung des gesamten Profils). Nur die warn-Box weicht ab. */
const RESET_WARN: Record<3 | 4, Record<Lang, string>> = {
  3: {
    en: "If payment is not made immediately, we will take further steps – including handing the claim to a debt collection agency and restoring the previous reviews on your profile.",
    es: "Si no pagas de inmediato, tomaremos más medidas, incluida la cesión a una agencia de cobros y el restablecimiento de las reseñas anteriores de tu perfil.",
    fr: "À défaut de paiement immédiat, nous engagerons d’autres mesures – dont la transmission à une société de recouvrement et le rétablissement des avis précédents de ta fiche.",
    it: "Se il pagamento non avviene immediatamente, intraprenderemo ulteriori azioni, tra cui l’affidamento a un’agenzia di recupero crediti e il ripristino delle recensioni precedenti del tuo profilo.",
    nl: "Vindt de betaling niet onmiddellijk plaats, dan ondernemen wij verdere stappen – waaronder overdracht aan een incassobureau en het herstellen van de eerdere beoordelingen op je profiel.",
    pt: "Se o pagamento não for efetuado de imediato, tomaremos novas medidas, incluindo a entrega a uma agência de cobrança e a reposição das avaliações anteriores do teu perfil.",
    ja: "直ちにお支払いいただけない場合、債権回収業者への引き渡し、ならびにお客様のプロフィールの以前の口コミの復元を含む、次の措置を講じます。",
    sv: "Sker ingen betalning omgående vidtar vi ytterligare åtgärder – inklusive överlämning till ett inkassobolag och återställning av de tidigare omdömena på din profil.",
    da: "Sker betalingen ikke omgående, tager vi yderligere skridt – herunder overdragelse til et inkassobureau og genskabelse af de tidligere anmeldelser på din profil.",
    no: "Skjer ikke betaling omgående, iverksetter vi videre tiltak – inkludert overføring til et inkassobyrå og gjenoppretting av de tidligere anmeldelsene på profilen din.",
  },
  4: {
    en: "Final deadline: please pay TODAY. Otherwise we will restore the previous reviews on your profile and hand the claim to a debt collection agency.",
    es: "Plazo final: paga HOY. De lo contrario, restableceremos las reseñas anteriores de tu perfil y cederemos la deuda a una agencia de cobros.",
    fr: "Dernier délai : paie AUJOURD’HUI. Sinon, nous rétablirons les avis précédents de ta fiche et confierons la créance à une société de recouvrement.",
    it: "Termine ultimo: paga OGGI. In caso contrario ripristineremo le recensioni precedenti del tuo profilo e affideremo il credito a un’agenzia di recupero crediti.",
    nl: "Laatste termijn: betaal VANDAAG. Anders herstellen wij de eerdere beoordelingen op je profiel en dragen wij de vordering over aan een incassobureau.",
    pt: "Prazo final: paga HOJE. Caso contrário, reporemos as avaliações anteriores do teu perfil e entregaremos a dívida a uma agência de cobrança.",
    ja: "最終期限：本日中にお支払いください。さもなければ、お客様のプロフィールの以前の口コミを復元し、本債権を債権回収業者に引き渡します。",
    sv: "Sista fristen: betala I DAG. Annars återställer vi de tidigare omdömena på din profil och lämnar fordran till ett inkassobolag.",
    da: "Sidste frist: betal I DAG. Ellers genskaber vi de tidligere anmeldelser på din profil og overdrager kravet til et inkassobureau.",
    no: "Siste frist: betal I DAG. Ellers gjenoppretter vi de tidligere anmeldelsene på profilen din og overfører kravet til et inkassobyrå.",
  },
};

/* Zusatznotiz nur in Stufe 4: Mahn-/Inkassokosten. */
const COST_NOTE: Record<Lang, string> = {
  en: "Additional reminder and debt-collection fees will be charged to you.",
  es: "Los gastos adicionales de reclamación y cobro correrán a tu cargo.",
  fr: "Les frais supplémentaires de rappel et de recouvrement seront à ta charge.",
  it: "Gli ulteriori costi di sollecito e recupero crediti saranno a tuo carico.",
  nl: "Bijkomende aanmanings- en incassokosten komen voor jouw rekening.",
  pt: "Os custos adicionais de aviso e cobrança serão da tua responsabilidade.",
  ja: "追加の督促費用および回収費用はお客様のご負担となります。",
  sv: "Ytterligare påminnelse- och inkassokostnader debiteras dig.",
  da: "Yderligere rykker- og inkassoomkostninger pålægges dig.",
  no: "Ytterligere purre- og inkassokostnader belastes deg.",
};

/** Ersparnis-Erinnerung (Platzhalter {pp}=PayPal-Preis, {reg}=regulär, {save}=Ersparnis). */
const SAVINGS_LINE: Record<Lang, string> = {
  en: "And don’t forget: with PayPal it’s only {pp} instead of {reg} — {save} saved.",
  es: "Y no olvides: con PayPal son solo {pp} en lugar de {reg} — ahorras {save}.",
  fr: "Et n’oublie pas : avec PayPal, c’est seulement {pp} au lieu de {reg} — {save} d’économie.",
  it: "E non dimenticare: con PayPal sono solo {pp} invece di {reg} — risparmi {save}.",
  nl: "En vergeet niet: met PayPal is het maar {pp} in plaats van {reg} — {save} bespaard.",
  pt: "E não te esqueças: com PayPal são apenas {pp} em vez de {reg} — poupas {save}.",
  ja: "お忘れなく:PayPalなら{reg}のところわずか{pp}——{save}お得です。",
  sv: "Och glöm inte: med PayPal är det bara {pp} istället för {reg} — du sparar {save}.",
  da: "Og husk: med PayPal er det kun {pp} i stedet for {reg} — du sparer {save}.",
  no: "Og husk: med PayPal er det bare {pp} i stedet for {reg} — du sparer {save}.",
};
function fillOffer(s: string, o?: OfferData | null): string {
  return (s || "").replace(/\{pp\}/g, (o && o.paypal) || "").replace(/\{reg\}/g, (o && o.regular) || "").replace(/\{save\}/g, (o && o.savings) || "");
}

const clampStage = (s: unknown): 1 | 2 | 3 | 4 => {
  const n = Number(s);
  return n === 2 || n === 3 || n === 4 ? (n as 2 | 3 | 4) : 1;
};
const pickLang = (l?: string): Lang => (l && (LANGS as string[]).includes(l) ? (l as Lang) : "en");

export function subject(p: PaypalMahnungProps = {} as PaypalMahnungProps): string {
  return STAGES[clampStage(p.stage)][pickLang(p.lang)].subject;
}

export default function PaypalMahnung({ lang = "en", name = "", offer, service, stage, _overrides }: PaypalMahnungProps = {}) {
  const L = pickLang(lang);
  const st = clampStage(stage);
  const c = COMMON[L];
  const s = { ...STAGES[st][L], ...(_overrides || {}) } as StageText;
  const warn = (st === 3 || st === 4) && service === "reset" ? RESET_WARN[st][L] : s.warn;
  const who = (name || "").trim();
  const Warn = st >= 3 ? DangerBox : NoteBox;
  return (
    <EmailShell preview={s.preview} title={s.title} lang={L}>
      <P><strong>{c.greeting(who)}</strong></P>
      <P>{s.intro}</P>
      <P>{c.payLine}</P>
      {offer ? <P><strong style={{ color: brand.tintText }}>{fillOffer(SAVINGS_LINE[L], offer)}</strong></P> : null}

      <Warn>
        <strong style={{ fontSize: 15 }}>{warn}</strong>
        {st === 4 ? <><br /><br />{COST_NOTE[L]}</> : null}
      </Warn>

      <P muted>{c.notePaid}</P>
      <P>{c.signoff}</P>
    </EmailShell>
  );
}
