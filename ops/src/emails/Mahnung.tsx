/* Template: Mahnlauf – 4-stufige Zahlungserinnerung/Mahnung (DE + 10 Sprachen).
 *
 *   Stufe 1: freundliche Zahlungserinnerung (neutrale Box)
 *   Stufe 2: 2. Erinnerung, bestimmter (gelbe Box, 48 h)
 *   Stufe 3: Mahnung, scharf (rote Box) – Inkasso + Wiederherstellung des Profils
 *   Stufe 4: Letzte Mahnung (kräftig rote Box) – HEUTE zahlen, sonst Reaktivierung + Inkasso
 *
 * Reset-Aufträge ("reset"): in Stufe 3/4 wird mit Wiederherstellung der bisherigen
 * Bewertungen gedroht (statt Reaktivierung des Profils).
 */
import * as React from "react";
import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailShell, P, CtaButton, brand } from "./components";

export interface MahnungProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** Offener Betrag, vorformatiert – z. B. "519,90 €" */
  total: string;
  /** (Kompatibilität – wird nicht mehr angezeigt; Frist steht in der Hinweisbox.) */
  due?: string;
  /** Stripe-Zahlungslink für den Button */
  payUrl: string;
  /** Leistungs-Key. Bei "reset" droht Stufe 3/4 mit Wiederherstellung der Bewertungen. */
  service?: string;
  /** Mahnstufe 1–4 (Standard 1). */
  stage?: 1 | 2 | 3 | 4;
}

type Lang = NonNullable<MahnungProps["lang"]>;
const LANGS: Lang[] = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

/** Sprachabhängige, stufenübergreifende Bausteine. */
const COMMON: Record<Lang, { greeting: string; totalLabel: string; notePaid: string }> = {
  de: { greeting: "Sehr geehrte Damen und Herren,", totalLabel: "Offener Betrag", notePaid: "Sollte die Zahlung bereits erfolgt sein, betrachten Sie diese Nachricht bitte als gegenstandslos." },
  en: { greeting: "Dear Sir or Madam,", totalLabel: "Amount due", notePaid: "If payment has already been made, please disregard this notice." },
  es: { greeting: "Estimados señores:", totalLabel: "Importe pendiente", notePaid: "Si ya ha realizado el pago, le rogamos que considere este aviso sin efecto." },
  fr: { greeting: "Madame, Monsieur,", totalLabel: "Montant dû", notePaid: "Si le paiement a déjà été effectué, veuillez considérer ce message comme sans objet." },
  it: { greeting: "Gentili Signore e Signori,", totalLabel: "Importo dovuto", notePaid: "Qualora il pagamento sia già stato effettuato, la preghiamo di considerare questo avviso come non valido." },
  nl: { greeting: "Geachte heer/mevrouw,", totalLabel: "Openstaand bedrag", notePaid: "Mocht de betaling al zijn voldaan, beschouw dit bericht dan als niet verzonden." },
  pt: { greeting: "Exmos. Senhores,", totalLabel: "Valor em dívida", notePaid: "Caso o pagamento já tenha sido efetuado, agradecemos que considere este aviso sem efeito." },
  ja: { greeting: "ご担当者様", totalLabel: "未払い金額", notePaid: "なお、すでにお支払いが完了している場合は、本通知を破棄してくださいますようお願いいたします。" },
  sv: { greeting: "Hej,", totalLabel: "Utestående belopp", notePaid: "Om betalningen redan har skett ber vi dig bortse från detta meddelande." },
  da: { greeting: "Kære kunde,", totalLabel: "Skyldigt beløb", notePaid: "Hvis betalingen allerede er foretaget, bedes du se bort fra denne besked." },
  no: { greeting: "Hei,", totalLabel: "Utestående beløp", notePaid: "Hvis betalingen allerede er foretatt, ber vi deg se bort fra denne meldingen." },
};

interface StageText { subject: string; title: string; preview: string; intro: string; warn: string; cta: string; }

/** STAGES[stufe][sprache] = Texte. */
const STAGES: Record<1 | 2 | 3 | 4, Record<Lang, StageText>> = {
  1: {
    de: { subject: "Zahlungserinnerung – Ihre offene Rechnung", title: "Zahlungserinnerung", preview: "Ihre Rechnung für die Profil-Löschung ist noch offen – eine kurze Erinnerung.", intro: "die Rechnung für die erfolgreiche Löschung Ihres Google-Profils ist noch offen. Vermutlich ist es im Tagesgeschäft untergegangen.", warn: "Die Zahlung war innerhalb von 48 Stunden fällig und ist noch offen – bitte begleichen Sie den offenen Betrag.", cta: "Rechnung jetzt bezahlen" },
    en: { subject: "Payment reminder – your open invoice", title: "Payment reminder", preview: "Your invoice for the profile removal is still open – a friendly reminder.", intro: "the invoice for the successful deletion of your Google profile is still open. It may simply have slipped through in day-to-day business.", warn: "Payment was due within 48 hours and is still outstanding – please settle the open amount.", cta: "Pay invoice now" },
    es: { subject: "Recordatorio de pago – su factura pendiente", title: "Recordatorio de pago", preview: "Su factura por la eliminación del perfil sigue pendiente: un breve recordatorio.", intro: "la factura por la eliminación de su perfil de Google sigue pendiente. Probablemente se haya traspapelado en el día a día.", warn: "El pago vencía en un plazo de 48 horas y sigue pendiente; le rogamos que abone el importe pendiente.", cta: "Pagar la factura ahora" },
    fr: { subject: "Rappel de paiement – votre facture en attente", title: "Rappel de paiement", preview: "Votre facture pour la suppression de la fiche est toujours en attente – un petit rappel.", intro: "la facture relative à la suppression de votre fiche Google est toujours en attente. Elle est probablement passée inaperçue dans le quotidien.", warn: "Le paiement était dû sous 48 heures et reste en attente – merci de régler le montant dû.", cta: "Payer la facture maintenant" },
    it: { subject: "Promemoria di pagamento – la sua fattura in sospeso", title: "Promemoria di pagamento", preview: "La sua fattura per la rimozione del profilo è ancora in sospeso: un breve promemoria.", intro: "la fattura per la riuscita rimozione del suo profilo Google è ancora in sospeso. Probabilmente le è sfuggita nella quotidianità.", warn: "Il pagamento era dovuto entro 48 ore ed è ancora in sospeso: la preghiamo di saldare l'importo dovuto.", cta: "Paga la fattura ora" },
    nl: { subject: "Betalingsherinnering – uw openstaande factuur", title: "Betalingsherinnering", preview: "Uw factuur voor de profielverwijdering staat nog open – een vriendelijke herinnering.", intro: "de factuur voor de succesvolle verwijdering van uw Google-profiel staat nog open. Waarschijnlijk is het in de drukte ondergesneeuwd.", warn: "De betaling was binnen 48 uur verschuldigd en staat nog open – gelieve het openstaande bedrag te voldoen.", cta: "Factuur nu betalen" },
    pt: { subject: "Lembrete de pagamento – a sua fatura pendente", title: "Lembrete de pagamento", preview: "A sua fatura pela remoção do perfil continua pendente – um breve lembrete.", intro: "a fatura pela eliminação bem-sucedida do seu perfil do Google continua pendente. Provavelmente passou despercebida no dia a dia.", warn: "O pagamento vencia no prazo de 48 horas e continua pendente – pedimos que liquide o valor em dívida.", cta: "Pagar a fatura agora" },
    ja: { subject: "お支払いのお願い – 未払いの請求書", title: "お支払いのお願い", preview: "プロフィール削除の請求書が未払いです。念のためのご連絡です。", intro: "お客様のGoogleプロフィールの削除完了に関する請求書が、いまだ未払いとなっております。日々の業務の中で見落とされたのかもしれません。", warn: "お支払いは48時間以内が期限でしたが、いまだ確認できておりません。未払い金額のお支払いをお願いいたします。", cta: "今すぐ請求書を支払う" },
    sv: { subject: "Betalningspåminnelse – din obetalda faktura", title: "Betalningspåminnelse", preview: "Din faktura för borttagningen av profilen är fortfarande obetald – en vänlig påminnelse.", intro: "fakturan för den lyckade borttagningen av din Google-profil är fortfarande obetald. Den har sannolikt fallit mellan stolarna i vardagen.", warn: "Betalningen skulle ske inom 48 timmar och är fortfarande obetald – vänligen betala det utestående beloppet.", cta: "Betala fakturan nu" },
    da: { subject: "Betalingspåmindelse – din ubetalte faktura", title: "Betalingspåmindelse", preview: "Din faktura for fjernelsen af profilen er stadig ubetalt – en venlig påmindelse.", intro: "fakturaen for den vellykkede fjernelse af din Google-profil er stadig ubetalt. Den er sandsynligvis druknet i hverdagen.", warn: "Betalingen forfaldt inden for 48 timer og er stadig ubetalt – betal venligst det skyldige beløb.", cta: "Betal fakturaen nu" },
    no: { subject: "Betalingspåminnelse – din ubetalte faktura", title: "Betalingspåminnelse", preview: "Fakturaen din for fjerningen av profilen er fortsatt ubetalt – en vennlig påminnelse.", intro: "fakturaen for den vellykkede fjerningen av Google-profilen din er fortsatt ubetalt. Den har sannsynligvis druknet i hverdagen.", warn: "Betalingen forfalt innen 48 timer og er fortsatt ubetalt – vennligst betal det utestående beløpet.", cta: "Betal fakturaen nå" },
  },
  2: {
    de: { subject: "2. Zahlungserinnerung – Ihre Rechnung ist überfällig", title: "2. Zahlungserinnerung", preview: "Ihre Rechnung ist überfällig – bitte begleichen Sie den Betrag innerhalb von 48 Stunden.", intro: "trotz unserer Erinnerung ist die Rechnung für die Löschung Ihres Google-Profils weiterhin offen.", warn: "Ihre Rechnung ist mittlerweile überfällig. Bitte begleichen Sie den offenen Betrag jetzt innerhalb von 48 Stunden.", cta: "Offene Rechnung begleichen" },
    en: { subject: "2nd payment reminder – your invoice is overdue", title: "2nd payment reminder", preview: "Your invoice is overdue – please settle the amount within 48 hours.", intro: "despite our reminder, the invoice for the deletion of your Google profile is still outstanding.", warn: "Your invoice is now overdue. Please settle the open amount within 48 hours.", cta: "Settle open invoice" },
    es: { subject: "2.º recordatorio de pago – su factura está vencida", title: "2.º recordatorio de pago", preview: "Su factura está vencida: abone el importe en un plazo de 48 horas.", intro: "a pesar de nuestro recordatorio, la factura por la eliminación de su perfil de Google sigue pendiente.", warn: "Su factura está ahora vencida. Le rogamos que abone el importe pendiente en un plazo de 48 horas.", cta: "Liquidar la factura pendiente" },
    fr: { subject: "2e rappel de paiement – votre facture est en retard", title: "2e rappel de paiement", preview: "Votre facture est en retard – merci de régler le montant sous 48 heures.", intro: "malgré notre rappel, la facture relative à la suppression de votre fiche Google reste en attente.", warn: "Votre facture est désormais en retard. Merci de régler le montant dû sous 48 heures.", cta: "Régler la facture en attente" },
    it: { subject: "2° sollecito di pagamento – la sua fattura è scaduta", title: "2° promemoria di pagamento", preview: "La sua fattura è scaduta: salda l'importo entro 48 ore.", intro: "nonostante il nostro promemoria, la fattura per la rimozione del suo profilo Google è ancora in sospeso.", warn: "La sua fattura è ora scaduta. La preghiamo di saldare l'importo dovuto entro 48 ore.", cta: "Salda la fattura in sospeso" },
    nl: { subject: "2e betalingsherinnering – uw factuur is achterstallig", title: "2e betalingsherinnering", preview: "Uw factuur is achterstallig – voldoe het bedrag binnen 48 uur.", intro: "ondanks onze herinnering staat de factuur voor de verwijdering van uw Google-profiel nog steeds open.", warn: "Uw factuur is inmiddels achterstallig. Voldoe het openstaande bedrag nu binnen 48 uur.", cta: "Openstaande factuur voldoen" },
    pt: { subject: "2.º lembrete de pagamento – a sua fatura está em atraso", title: "2.º lembrete de pagamento", preview: "A sua fatura está em atraso – liquide o valor no prazo de 48 horas.", intro: "apesar do nosso lembrete, a fatura pela remoção do seu perfil do Google continua pendente.", warn: "A sua fatura está agora em atraso. Pedimos que liquide o valor em dívida no prazo de 48 horas.", cta: "Liquidar a fatura pendente" },
    ja: { subject: "お支払いのお願い（2回目）– 請求書が期限超過です", title: "2回目のお支払いのお願い", preview: "請求書が期限超過です。48時間以内にお支払いください。", intro: "お支払いのお願いをお送りしておりますが、Googleプロフィール削除の請求書がいまだ未払いとなっております。", warn: "お客様の請求書は期限を過ぎております。48時間以内に未払い金額をお支払いください。", cta: "未払いの請求書を支払う" },
    sv: { subject: "2:a betalningspåminnelsen – din faktura är förfallen", title: "2:a betalningspåminnelsen", preview: "Din faktura är förfallen – betala beloppet inom 48 timmar.", intro: "trots vår påminnelse är fakturan för borttagningen av din Google-profil fortfarande obetald.", warn: "Din faktura är nu förfallen. Vänligen betala det utestående beloppet inom 48 timmar.", cta: "Betala utestående faktura" },
    da: { subject: "2. betalingspåmindelse – din faktura er forfalden", title: "2. betalingspåmindelse", preview: "Din faktura er forfalden – betal beløbet inden for 48 timer.", intro: "trods vores påmindelse er fakturaen for fjernelsen af din Google-profil fortsat ubetalt.", warn: "Din faktura er nu forfalden. Betal venligst det skyldige beløb inden for 48 timer.", cta: "Betal forfalden faktura" },
    no: { subject: "2. betalingspåminnelse – fakturaen din er forfalt", title: "2. betalingspåminnelse", preview: "Fakturaen din er forfalt – betal beløpet innen 48 timer.", intro: "til tross for påminnelsen vår er fakturaen for fjerningen av Google-profilen din fortsatt ubetalt.", warn: "Fakturaen din er nå forfalt. Vennligst betal det utestående beløpet innen 48 timer.", cta: "Betal forfalt faktura" },
  },
  3: {
    de: { subject: "Mahnung – bitte begleichen Sie Ihre überfällige Rechnung", title: "Mahnung", preview: "Letzte Erinnerung vor weiteren Schritten – bitte zahlen Sie umgehend.", intro: "trotz mehrfacher Erinnerung ist Ihre Rechnung weiterhin offen.", warn: "Erfolgt die Zahlung nicht umgehend, leiten wir weitere Schritte ein – inkl. Übergabe an ein Inkassobüro und Wiederherstellung Ihres Google-Unternehmensprofils samt aller Bewertungen.", cta: "Jetzt bezahlen & weitere Schritte vermeiden" },
    en: { subject: "Notice of default – please settle your overdue invoice", title: "Payment notice", preview: "Final reminder before further steps – please pay immediately.", intro: "despite several reminders, your invoice is still outstanding.", warn: "If payment is not made immediately, we will take further steps – including handover to a debt collection agency and reinstatement of your Google Business Profile, including all reviews.", cta: "Pay now & avoid further steps" },
    es: { subject: "Aviso de impago – liquide su factura vencida", title: "Aviso de impago", preview: "Último recordatorio antes de tomar más medidas: pague de inmediato.", intro: "a pesar de varios recordatorios, su factura sigue pendiente.", warn: "Si el pago no se realiza de inmediato, tomaremos más medidas, incluida la cesión a una agencia de cobros y la reactivación de su perfil de empresa de Google con todas las reseñas.", cta: "Pague ahora y evite más medidas" },
    fr: { subject: "Mise en demeure – réglez votre facture en retard", title: "Mise en demeure", preview: "Dernier rappel avant de nouvelles mesures – merci de payer immédiatement.", intro: "malgré plusieurs rappels, votre facture reste en attente.", warn: "À défaut de paiement immédiat, nous engagerons d'autres mesures – dont la transmission à une société de recouvrement et la remise en ligne de votre fiche d'établissement Google, avec tous les avis.", cta: "Payer maintenant et éviter d'autres mesures" },
    it: { subject: "Costituzione in mora – saldi la fattura scaduta", title: "Costituzione in mora", preview: "Ultimo promemoria prima di ulteriori azioni: paghi immediatamente.", intro: "nonostante diversi solleciti, la sua fattura è ancora in sospeso.", warn: "Se il pagamento non avviene immediatamente, intraprenderemo ulteriori azioni, tra cui l'affidamento a un'agenzia di recupero crediti e la ripubblicazione del suo profilo aziendale Google con tutte le recensioni.", cta: "Paga ora ed evita ulteriori azioni" },
    nl: { subject: "Ingebrekestelling – voldoe uw achterstallige factuur", title: "Ingebrekestelling", preview: "Laatste herinnering vóór verdere stappen – betaal a.u.b. onmiddellijk.", intro: "ondanks meerdere herinneringen staat uw factuur nog steeds open.", warn: "Vindt de betaling niet onmiddellijk plaats, dan ondernemen wij verdere stappen – waaronder overdracht aan een incassobureau en het terugplaatsen van uw Google-bedrijfsprofiel, inclusief alle beoordelingen.", cta: "Nu betalen & verdere stappen voorkomen" },
    pt: { subject: "Interpelação – liquide a sua fatura em atraso", title: "Interpelação de pagamento", preview: "Último lembrete antes de mais medidas – pague de imediato.", intro: "apesar de vários lembretes, a sua fatura continua pendente.", warn: "Se o pagamento não for efetuado de imediato, tomaremos novas medidas, incluindo a entrega a uma agência de cobrança e a reativação do seu perfil de empresa do Google, com todas as avaliações.", cta: "Pague agora e evite mais medidas" },
    ja: { subject: "督促状 – 期限超過の請求書のお支払いについて", title: "督促状", preview: "次の措置の前の最終のご連絡です。直ちにお支払いください。", intro: "再三のご連絡にもかかわらず、ご請求はいまだ未払いとなっております。", warn: "直ちにお支払いいただけない場合、債権回収業者への引き渡し、ならびにお客様のGoogleビジネスプロフィール（すべての口コミを含む）の再公開を含む、次の措置を講じます。", cta: "今すぐ支払い、次の措置を回避する" },
    sv: { subject: "Betalningskrav – betala din förfallna faktura", title: "Betalningskrav", preview: "Sista påminnelsen före vidare åtgärder – betala omgående.", intro: "trots flera påminnelser är din faktura fortfarande obetald.", warn: "Sker ingen betalning omgående vidtar vi ytterligare åtgärder – inklusive överlämning till ett inkassobolag och återpublicering av din Google-företagsprofil med alla omdömen.", cta: "Betala nu & undvik vidare åtgärder" },
    da: { subject: "Rykker – betal din forfaldne faktura", title: "Rykker", preview: "Sidste påmindelse før yderligere skridt – betal omgående.", intro: "trods flere påmindelser er din faktura fortsat ubetalt.", warn: "Sker betalingen ikke omgående, tager vi yderligere skridt – herunder overdragelse til et inkassobureau og genudgivelse af din Google-virksomhedsprofil inklusive alle anmeldelser.", cta: "Betal nu & undgå yderligere skridt" },
    no: { subject: "Inkassovarsel – betal den forfalte fakturaen din", title: "Betalingskrav", preview: "Siste påminnelse før videre tiltak – betal omgående.", intro: "til tross for flere påminnelser er fakturaen din fortsatt ubetalt.", warn: "Skjer ikke betaling omgående, iverksetter vi videre tiltak – inkludert overføring til et inkassobyrå og republisering av Google-bedriftsprofilen din med alle anmeldelser.", cta: "Betal nå & unngå videre tiltak" },
  },
  4: {
    de: { subject: "Letzte Mahnung – Zahlung heute erforderlich", title: "Letzte Mahnung", preview: "Letzte Frist: Bitte zahlen Sie noch heute, sonst wird Ihr Profil wieder aktiviert.", intro: "dies ist unsere letzte Mahnung. Ihre Rechnung ist weiterhin unbezahlt.", warn: "Letzte Frist: Bitte zahlen Sie noch HEUTE. Andernfalls aktivieren wir Ihr Google-Unternehmensprofil samt aller Bewertungen wieder und geben die Forderung an ein Inkassobüro ab.", cta: "Sofort bezahlen" },
    en: { subject: "Final notice – payment required today", title: "Final notice", preview: "Final deadline: please pay today, otherwise your profile will be reinstated.", intro: "this is our final notice. Your invoice remains unpaid.", warn: "Final deadline: please pay TODAY. Otherwise we will reinstate your Google Business Profile including all reviews and hand the claim to a debt collection agency.", cta: "Pay immediately" },
    es: { subject: "Última advertencia – pago requerido hoy", title: "Última advertencia", preview: "Plazo final: pague hoy, de lo contrario se reactivará su perfil.", intro: "esta es nuestra última advertencia. Su factura sigue sin pagarse.", warn: "Plazo final: pague HOY. De lo contrario, reactivaremos su perfil de empresa de Google con todas las reseñas y cederemos la deuda a una agencia de cobros.", cta: "Pagar de inmediato" },
    fr: { subject: "Dernier rappel – paiement requis aujourd'hui", title: "Dernier rappel", preview: "Dernier délai : payez aujourd'hui, sinon votre fiche sera remise en ligne.", intro: "ceci est notre dernier rappel. Votre facture demeure impayée.", warn: "Dernier délai : veuillez payer AUJOURD'HUI. Sinon, nous remettrons en ligne votre fiche d'établissement Google avec tous les avis et confierons la créance à une société de recouvrement.", cta: "Payer immédiatement" },
    it: { subject: "Ultimo sollecito – pagamento richiesto oggi", title: "Ultimo sollecito", preview: "Termine ultimo: paghi oggi, altrimenti il suo profilo verrà ripubblicato.", intro: "questo è il nostro ultimo sollecito. La sua fattura risulta ancora non pagata.", warn: "Termine ultimo: paghi OGGI. In caso contrario ripubblicheremo il suo profilo aziendale Google con tutte le recensioni e affideremo il credito a un'agenzia di recupero crediti.", cta: "Paga immediatamente" },
    nl: { subject: "Laatste aanmaning – betaling vandaag vereist", title: "Laatste aanmaning", preview: "Laatste termijn: betaal vandaag, anders wordt uw profiel teruggeplaatst.", intro: "dit is onze laatste aanmaning. Uw factuur is nog steeds onbetaald.", warn: "Laatste termijn: betaal VANDAAG. Anders plaatsen wij uw Google-bedrijfsprofiel inclusief alle beoordelingen terug en dragen wij de vordering over aan een incassobureau.", cta: "Onmiddellijk betalen" },
    pt: { subject: "Última notificação – pagamento exigido hoje", title: "Última notificação", preview: "Prazo final: pague hoje, caso contrário o seu perfil será reativado.", intro: "esta é a nossa última notificação. A sua fatura continua por pagar.", warn: "Prazo final: pague HOJE. Caso contrário, reativaremos o seu perfil de empresa do Google com todas as avaliações e entregaremos a dívida a uma agência de cobrança.", cta: "Pagar imediatamente" },
    ja: { subject: "最終通告 – 本日中のお支払いが必要です", title: "最終通告", preview: "最終期限：本日中にお支払いください。さもなくばプロフィールを再公開します。", intro: "本書面は最終通告です。ご請求はいまだ未払いのままです。", warn: "最終期限：本日中にお支払いください。さもなければ、お客様のGoogleビジネスプロフィールをすべての口コミとともに再公開し、本債権を債権回収業者に引き渡します。", cta: "今すぐ支払う" },
    sv: { subject: "Sista påminnelsen – betalning krävs i dag", title: "Sista påminnelsen", preview: "Sista fristen: betala i dag, annars återpubliceras din profil.", intro: "detta är vår sista påminnelse. Din faktura är fortfarande obetald.", warn: "Sista fristen: betala I DAG. Annars återpublicerar vi din Google-företagsprofil med alla omdömen och lämnar fordran till ett inkassobolag.", cta: "Betala omedelbart" },
    da: { subject: "Sidste rykker – betaling kræves i dag", title: "Sidste rykker", preview: "Sidste frist: betal i dag, ellers genudgives din profil.", intro: "dette er vores sidste rykker. Din faktura er fortsat ubetalt.", warn: "Sidste frist: betal I DAG. Ellers genudgiver vi din Google-virksomhedsprofil inklusive alle anmeldelser og overdrager kravet til et inkassobureau.", cta: "Betal omgående" },
    no: { subject: "Siste purring – betaling kreves i dag", title: "Siste purring", preview: "Siste frist: betal i dag, ellers republiseres profilen din.", intro: "dette er vår siste purring. Fakturaen din er fortsatt ubetalt.", warn: "Siste frist: betal I DAG. Ellers republiserer vi Google-bedriftsprofilen din med alle anmeldelser og overfører kravet til et inkassobyrå.", cta: "Betal omgående" },
  },
};

/* Reset-Aufträge: in Stufe 3/4 wird mit Wiederherstellung der bisherigen Bewertungen
   gedroht (statt Reaktivierung des gesamten Profils). Nur die warn-Box weicht ab. */
const RESET_WARN: Record<3 | 4, Record<Lang, string>> = {
  3: {
    de: "Erfolgt die Zahlung nicht umgehend, leiten wir weitere Schritte ein – inkl. Übergabe an ein Inkassobüro und Wiederherstellung der bisherigen Bewertungen Ihres Profils.",
    en: "If payment is not made immediately, we will take further steps – including handover to a debt collection agency and restoration of the previous reviews on your profile.",
    es: "Si el pago no se realiza de inmediato, tomaremos más medidas, incluida la cesión a una agencia de cobros y el restablecimiento de las reseñas anteriores de su perfil.",
    fr: "À défaut de paiement immédiat, nous engagerons d'autres mesures – dont la transmission à une société de recouvrement et le rétablissement des avis précédents de votre fiche.",
    it: "Se il pagamento non avviene immediatamente, intraprenderemo ulteriori azioni, tra cui l'affidamento a un'agenzia di recupero crediti e il ripristino delle recensioni precedenti del suo profilo.",
    nl: "Vindt de betaling niet onmiddellijk plaats, dan ondernemen wij verdere stappen – waaronder overdracht aan een incassobureau en het herstellen van de eerdere beoordelingen op uw profiel.",
    pt: "Se o pagamento não for efetuado de imediato, tomaremos novas medidas, incluindo a entrega a uma agência de cobrança e a reposição das avaliações anteriores do seu perfil.",
    ja: "直ちにお支払いいただけない場合、債権回収業者への引き渡し、ならびにお客様のプロフィールの以前の口コミの復元を含む、次の措置を講じます。",
    sv: "Sker ingen betalning omgående vidtar vi ytterligare åtgärder – inklusive överlämning till ett inkassobolag och återställning av de tidigare omdömena på din profil.",
    da: "Sker betalingen ikke omgående, tager vi yderligere skridt – herunder overdragelse til et inkassobureau og genskabelse af de tidligere anmeldelser på din profil.",
    no: "Skjer ikke betaling omgående, iverksetter vi videre tiltak – inkludert overføring til et inkassobyrå og gjenoppretting av de tidligere anmeldelsene på profilen din.",
  },
  4: {
    de: "Letzte Frist: Bitte zahlen Sie noch HEUTE. Andernfalls stellen wir die bisherigen Bewertungen Ihres Profils wieder her und geben die Forderung an ein Inkassobüro ab.",
    en: "Final deadline: please pay TODAY. Otherwise we will restore the previous reviews on your profile and hand the claim to a debt collection agency.",
    es: "Plazo final: pague HOY. De lo contrario, restableceremos las reseñas anteriores de su perfil y cederemos la deuda a una agencia de cobros.",
    fr: "Dernier délai : veuillez payer AUJOURD'HUI. Sinon, nous rétablirons les avis précédents de votre fiche et confierons la créance à une société de recouvrement.",
    it: "Termine ultimo: paghi OGGI. In caso contrario ripristineremo le recensioni precedenti del suo profilo e affideremo il credito a un'agenzia di recupero crediti.",
    nl: "Laatste termijn: betaal VANDAAG. Anders herstellen wij de eerdere beoordelingen op uw profiel en dragen wij de vordering over aan een incassobureau.",
    pt: "Prazo final: pague HOJE. Caso contrário, reporemos as avaliações anteriores do seu perfil e entregaremos a dívida a uma agência de cobrança.",
    ja: "最終期限：本日中にお支払いください。さもなければ、お客様のプロフィールの以前の口コミを復元し、本債権を債権回収業者に引き渡します。",
    sv: "Sista fristen: betala I DAG. Annars återställer vi de tidigare omdömena på din profil och lämnar fordran till ett inkassobolag.",
    da: "Sidste frist: betal I DAG. Ellers genskaber vi de tidligere anmeldelser på din profil og overdrager kravet til et inkassobureau.",
    no: "Siste frist: betal I DAG. Ellers gjenoppretter vi de tidligere anmeldelsene på profilen din og overfører kravet til et inkassobyrå.",
  },
};

/* Zusatznotiz nur in Stufe 4: Mahn-/Inkassokosten. */
const COST_NOTE: Record<Lang, string> = {
  de: "Zusätzliche Mahn- und Inkassokosten gehen zu Ihren Lasten.",
  en: "Additional reminder and debt-collection fees will be charged to you.",
  es: "Los gastos adicionales de reclamación y cobro correrán a su cargo.",
  fr: "Les frais supplémentaires de rappel et de recouvrement seront à votre charge.",
  it: "Gli ulteriori costi di sollecito e recupero crediti saranno a suo carico.",
  nl: "Bijkomende aanmanings- en incassokosten komen voor uw rekening.",
  pt: "Os custos adicionais de aviso e cobrança serão da sua responsabilidade.",
  ja: "追加の督促費用および回収費用はお客様のご負担となります。",
  sv: "Ytterligare påminnelse- och inkassokostnader debiteras dig.",
  da: "Yderligere rykker- og inkassoomkostninger pålægges dig.",
  no: "Ytterligere purre- og inkassokostnader belastes deg.",
};

/* Box-Stil je Stufe: 1 neutral → 2 gelb → 3 rot → 4 kräftig rot. */
const BOX: Record<1 | 2 | 3 | 4, { bg: string; bd: string; bw: string; fg: string; fs: number; fw: number; align: "left" | "center" }> = {
  1: { bg: "#f1f5f9", bd: "#e2e8f0", bw: "1px", fg: "#334155", fs: 15.5, fw: 600, align: "left" },
  2: { bg: "#fff7e6", bd: "#fdba74", bw: "1px", fg: "#b45309", fs: 18, fw: 700, align: "center" },
  3: { bg: brand.dangerTint, bd: brand.dangerBorder, bw: "2px", fg: brand.dangerText, fs: 20, fw: 800, align: "center" },
  4: { bg: brand.dangerTint, bd: brand.dangerBorder, bw: "2px", fg: brand.dangerText, fs: 22, fw: 800, align: "center" },
};

const clampStage = (s: unknown): 1 | 2 | 3 | 4 => {
  const n = Number(s);
  return n === 2 || n === 3 || n === 4 ? (n as 2 | 3 | 4) : 1;
};
const pickLang = (l?: string): Lang => (l && (LANGS as string[]).includes(l) ? (l as Lang) : "de");

export function subject(p: MahnungProps): string {
  return STAGES[clampStage(p.stage)][pickLang(p.lang)].subject;
}

export default function Mahnung({ lang = "de", total, payUrl, service, stage }: MahnungProps) {
  const L = pickLang(lang);
  const st = clampStage(stage);
  const c = COMMON[L];
  const s = STAGES[st][L];
  const warn = (st === 3 || st === 4) && service === "reset" ? RESET_WARN[st][L] : s.warn;
  const b = BOX[st];
  return (
    <EmailShell preview={s.preview} title={s.title} lang={L}>
      <P><strong>{c.greeting}</strong></P>
      <P>{s.intro}</P>

      <Hr style={{ borderColor: brand.hr, margin: "8px 0 4px" }} />
      <Row>
        <Column><Text style={{ fontSize: 22, fontWeight: 700, color: brand.text, margin: "8px 0" }}>{c.totalLabel}</Text></Column>
        <Column style={{ textAlign: "right" }}><Text style={{ fontSize: 22, fontWeight: 700, color: brand.accent, margin: "8px 0" }}>{total}</Text></Column>
      </Row>
      <Hr style={{ borderColor: brand.hr, margin: "4px 0 16px" }} />

      <Section style={{ background: b.bg, border: `${b.bw} solid ${b.bd}`, borderRadius: 14, padding: "20px 20px", margin: "4px 0 18px" }}>
        <Text style={{ margin: 0, fontSize: b.fs, lineHeight: "1.4", fontWeight: b.fw, color: b.fg, textAlign: b.align }}>{warn}</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "18px 0 12px" }}>
        <CtaButton href={payUrl} full variant={st >= 3 ? "danger" : "primary"}>{s.cta}</CtaButton>
      </Section>

      <P muted>{st === 4 ? COST_NOTE[L] + " " : ""}{c.notePaid}</P>
    </EmailShell>
  );
}
