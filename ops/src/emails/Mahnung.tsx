/* Template: Zahlungserinnerung / Mahnung — offene Rechnung mit großer,
   deutlicher Warnung ("Profil wird wieder auf Google eingestellt") und
   erneutem Stripe-Zahlungslink. Gleiches Marken-Design wie PaymentLink. */
import * as React from "react";
import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailShell, P, CtaButton, brand } from "./components";

export interface MahnungProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** Offener Betrag, vorformatiert – z. B. "519,90 €" */
  total: string;
  /** Fälligkeit – z. B. "umgehend", "innerhalb 7 Tagen" */
  due: string;
  /** Stripe-Zahlungslink für den Button */
  payUrl: string;
  /** Leistungs-Key der Bestellung. Bei "reset" (Profil-Löschung + Neuaufsetzen, 850 €)
   *  spricht die Mahnung von „Löschen und Neuaufsetzen" und droht mit der
   *  Wiederherstellung der bisherigen Bewertungen statt des Profils. */
  service?: string;
  /** Mahnstufe im Mahnlauf:
   *  1 = Zahlungserinnerung (Standard, freundlich).
   *  2 = LETZTE Mahnung – schärfer: Übergabe an ein Inkassobüro UND Wiederherstellung
   *      des Profils (bzw. der bisherigen Bewertungen beim Reset). */
  stage?: 1 | 2;
}

const T = {
  de: {
    title: "Zahlungserinnerung – offene Rechnung",
    preview: "Ihre Rechnung ist offen. Ohne Zahlung stellen wir Ihr Profil wieder auf Google ein.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "die Rechnung für die erfolgreiche Löschung Ihres Google-Profils ist noch ",
    introBold: "offen.",
    total: "Offener Betrag",
    due: "Fällig:",
    warn: "Zahlen Sie rechtzeitig, um eine erneute Aktivierung Ihres Unternehmensprofils zu vermeiden.",
    cta: "Offene Rechnung jetzt bezahlen",
    note: "Sollte die Zahlung zwischenzeitlich erfolgt sein, betrachten Sie diese Erinnerung bitte als gegenstandslos.",
    subject: "Zahlungserinnerung – Ihre offene Rechnung",
  },
  en: {
    title: "Payment Reminder – Open Invoice",
    preview: "Your invoice is open. Without payment we will reinstate your profile on Google.",
    greeting: "Dear Sir or Madam,",
    intro: "the invoice for the successful deletion of your Google profile is still ",
    introBold: "outstanding.",
    total: "Amount due",
    due: "Due:",
    warn: "Please pay on time to avoid a renewed activation of your business profile.",
    cta: "Pay Invoice Now",
    note: "If payment has already been made in the meantime, please disregard this reminder.",
    subject: "Payment reminder – your open invoice",
  },
  es: {
    title: "Recordatorio de pago – factura pendiente",
    preview: "Su factura está pendiente. Sin el pago, volveremos a publicar su perfil en Google.",
    greeting: "Estimados señores:",
    intro: "la factura por la eliminación exitosa de su perfil de Google sigue ",
    introBold: "pendiente.",
    total: "Importe pendiente",
    due: "Vencimiento:",
    warn: "Pague a tiempo para evitar una reactivación de su perfil de empresa.",
    cta: "Pagar la factura pendiente ahora",
    note: "Si entretanto ya ha realizado el pago, le rogamos que considere este recordatorio sin efecto.",
    subject: "Recordatorio de pago – su factura pendiente",
  },
  fr: {
    title: "Rappel de paiement – facture en attente",
    preview: "Votre facture est en attente. Sans paiement, nous remettrons votre fiche en ligne sur Google.",
    greeting: "Madame, Monsieur,",
    intro: "la facture relative à la suppression réussie de votre fiche Google est toujours ",
    introBold: "en attente.",
    total: "Montant dû",
    due: "Échéance :",
    warn: "Veuillez payer à temps afin d'éviter une réactivation de votre fiche d'établissement.",
    cta: "Payer la facture en attente maintenant",
    note: "Si le paiement a entre-temps déjà été effectué, veuillez considérer ce rappel comme sans objet.",
    subject: "Rappel de paiement – votre facture en attente",
  },
  it: {
    title: "Sollecito di pagamento – fattura in sospeso",
    preview: "La sua fattura è in sospeso. Senza il pagamento ripubblicheremo il suo profilo su Google.",
    greeting: "Gentili Signore e Signori,",
    intro: "la fattura per la riuscita rimozione del suo profilo Google è ancora ",
    introBold: "in sospeso.",
    total: "Importo dovuto",
    due: "Scadenza:",
    warn: "La preghiamo di pagare per tempo per evitare una riattivazione del suo profilo aziendale.",
    cta: "Paga subito la fattura in sospeso",
    note: "Qualora il pagamento sia già stato effettuato nel frattempo, la preghiamo di considerare questo sollecito come non valido.",
    subject: "Sollecito di pagamento – la sua fattura in sospeso",
  },
  nl: {
    title: "Betalingsherinnering – openstaande factuur",
    preview: "Uw factuur staat open. Zonder betaling plaatsen we uw profiel weer op Google.",
    greeting: "Geachte heer/mevrouw,",
    intro: "de factuur voor de succesvolle verwijdering van uw Google-profiel staat nog ",
    introBold: "open.",
    total: "Openstaand bedrag",
    due: "Vervaldatum:",
    warn: "Betaal op tijd om een heractivering van uw bedrijfsprofiel te voorkomen.",
    cta: "Openstaande factuur nu betalen",
    note: "Mocht de betaling inmiddels al zijn voldaan, beschouw deze herinnering dan als niet verzonden.",
    subject: "Betalingsherinnering – uw openstaande factuur",
  },
  pt: {
    title: "Lembrete de pagamento – fatura pendente",
    preview: "A sua fatura está pendente. Sem o pagamento, voltaremos a publicar o seu perfil no Google.",
    greeting: "Exmos. Senhores,",
    intro: "a fatura pela eliminação bem-sucedida do seu perfil do Google continua ",
    introBold: "pendente.",
    total: "Valor em dívida",
    due: "Vencimento:",
    warn: "Pague atempadamente para evitar uma reativação do seu perfil de empresa.",
    cta: "Pagar a fatura pendente agora",
    note: "Caso o pagamento já tenha sido efetuado entretanto, agradecemos que considere este lembrete sem efeito.",
    subject: "Lembrete de pagamento – a sua fatura pendente",
  },
  ja: {
    title: "お支払いのお願い – 未払いの請求書",
    preview: "請求書が未払いです。お支払いがない場合、お客様のプロフィールを再びGoogleに掲載いたします。",
    greeting: "ご担当者様",
    intro: "お客様のGoogleプロフィールの削除完了に関する請求書が、いまだ",
    introBold: "未払いとなっております。",
    total: "未払い金額",
    due: "お支払い期限:",
    warn: "事業者プロフィールの再公開を避けるため、お早めにお支払いください。",
    cta: "未払いの請求書を今すぐ支払う",
    note: "なお、行き違いですでにお支払いが完了している場合は、本通知を破棄してくださいますようお願いいたします。",
    subject: "お支払いのお願い – 未払いの請求書について",
  },
  sv: {
    title: "Betalningspåminnelse – obetald faktura",
    preview: "Din faktura är obetald. Utan betalning publicerar vi din profil på Google igen.",
    greeting: "Hej,",
    intro: "fakturan för den lyckade borttagningen av din Google-profil är fortfarande ",
    introBold: "obetald.",
    total: "Utestående belopp",
    due: "Förfallodag:",
    warn: "Betala i tid för att undvika att din företagsprofil återaktiveras.",
    cta: "Betala den obetalda fakturan nu",
    note: "Om betalningen under tiden redan har skett ber vi dig bortse från denna påminnelse.",
    subject: "Betalningspåminnelse – din obetalda faktura",
  },
  da: {
    title: "Betalingspåmindelse – ubetalt faktura",
    preview: "Din faktura er ubetalt. Uden betaling genudgiver vi din profil på Google.",
    greeting: "Kære kunde,",
    intro: "fakturaen for den vellykkede fjernelse af din Google-profil er fortsat ",
    introBold: "ubetalt.",
    total: "Skyldigt beløb",
    due: "Forfald:",
    warn: "Betal til tiden for at undgå, at din virksomhedsprofil bliver genaktiveret.",
    cta: "Betal den ubetalte faktura nu",
    note: "Hvis betalingen i mellemtiden allerede er foretaget, bedes du se bort fra denne påmindelse.",
    subject: "Betalingspåmindelse – din ubetalte faktura",
  },
  no: {
    title: "Betalingspåminnelse – ubetalt faktura",
    preview: "Fakturaen din er ubetalt. Uten betaling publiserer vi profilen din på Google igjen.",
    greeting: "Hei,",
    intro: "fakturaen for den vellykkede fjerningen av Google-profilen din er fortsatt ",
    introBold: "ubetalt.",
    total: "Utestående beløp",
    due: "Forfall:",
    warn: "Betal i tide for å unngå at bedriftsprofilen din blir reaktivert.",
    cta: "Betal den ubetalte fakturaen nå",
    note: "Hvis betalingen i mellomtiden allerede er foretatt, ber vi deg se bort fra denne påminnelsen.",
    subject: "Betalingspåminnelse – din ubetalte faktura",
  },
};

/* Überschreibungen für den Reset-Auftrag ("reset", 850 €): Profil wurde gelöscht UND neu
   aufgesetzt; bei Nichtzahlung werden die bisherigen Bewertungen wiederhergestellt (nicht
   "das Profil wieder auf Google eingestellt"). Nur die abweichenden Felder. */
const RESET: Record<string, { intro: string; preview: string; warn: string }> = {
  de: {
    intro: "die Rechnung für das erfolgreiche Löschen und Neuaufsetzen Ihres Google-Profils ist noch ",
    preview: "Ihre Rechnung ist offen. Ohne Zahlung stellen wir die bisherigen Bewertungen wieder her.",
    warn: "Zahlen Sie rechtzeitig, um eine Wiederherstellung der bisherigen Bewertungen zu vermeiden.",
  },
  en: {
    intro: "the invoice for the successful deletion and fresh setup of your Google profile is still ",
    preview: "Your invoice is open. Without payment we will restore the previous reviews.",
    warn: "Please pay on time to avoid the previous reviews being restored.",
  },
  es: {
    intro: "la factura por la eliminación y reconfiguración de su perfil de Google sigue ",
    preview: "Su factura está pendiente. Sin el pago, restableceremos las reseñas anteriores.",
    warn: "Pague a tiempo para evitar que se restablezcan las reseñas anteriores.",
  },
  fr: {
    intro: "la facture relative à la suppression et à la recréation de votre fiche Google est toujours ",
    preview: "Votre facture est en attente. Sans paiement, nous rétablirons les avis précédents.",
    warn: "Veuillez payer à temps afin d'éviter le rétablissement des avis précédents.",
  },
  it: {
    intro: "la fattura per la riuscita rimozione e ricreazione del suo profilo Google è ancora ",
    preview: "La sua fattura è in sospeso. Senza il pagamento ripristineremo le recensioni precedenti.",
    warn: "La preghiamo di pagare per tempo per evitare il ripristino delle recensioni precedenti.",
  },
  nl: {
    intro: "de factuur voor de succesvolle verwijdering en heropbouw van uw Google-profiel staat nog ",
    preview: "Uw factuur staat open. Zonder betaling herstellen we de eerdere beoordelingen.",
    warn: "Betaal op tijd om te voorkomen dat de eerdere beoordelingen worden hersteld.",
  },
  pt: {
    intro: "a fatura pela eliminação e recriação bem-sucedidas do seu perfil do Google continua ",
    preview: "A sua fatura está pendente. Sem o pagamento, reporemos as avaliações anteriores.",
    warn: "Pague atempadamente para evitar a reposição das avaliações anteriores.",
  },
  ja: {
    intro: "お客様のGoogleプロフィールの削除および再作成の完了に関する請求書が、いまだ",
    preview: "請求書が未払いです。お支払いがない場合、以前の口コミを復元いたします。",
    warn: "以前の口コミが復元されるのを避けるため、お早めにお支払いください。",
  },
  sv: {
    intro: "fakturan för den lyckade borttagningen och nyuppsättningen av din Google-profil är fortfarande ",
    preview: "Din faktura är obetald. Utan betalning återställer vi de tidigare omdömena.",
    warn: "Betala i tid för att undvika att de tidigare omdömena återställs.",
  },
  da: {
    intro: "fakturaen for den vellykkede fjernelse og nyoprettelse af din Google-profil er fortsat ",
    preview: "Din faktura er ubetalt. Uden betaling genskaber vi de tidligere anmeldelser.",
    warn: "Betal til tiden for at undgå, at de tidligere anmeldelser genskabes.",
  },
  no: {
    intro: "fakturaen for den vellykkede fjerningen og nyopprettelsen av Google-profilen din er fortsatt ",
    preview: "Fakturaen din er ubetalt. Uten betaling gjenoppretter vi de tidligere anmeldelsene.",
    warn: "Betal i tide for å unngå at de tidligere anmeldelsene gjenopprettes.",
  },
};

/* ── STUFE 2: LETZTE MAHNUNG (Mahnlauf-Eskalation) ──
   Schärfer als Stufe 1: Forderung geht an ein Inkassobüro UND das Profil wird wieder
   hergestellt. Überschreibt nur die abweichenden Felder von T. */
type Stage2 = { title: string; preview: string; intro: string; introBold: string; warn: string; cta: string; note: string; subject: string };
const STAGE2: Record<string, Stage2> = {
  de: {
    title: "Letzte Mahnung – Inkasso angekündigt",
    preview: "Letzte Mahnung: Ohne sofortige Zahlung geben wir die Forderung an ein Inkassobüro ab und stellen Ihr Profil wieder her.",
    intro: "trotz unserer Zahlungserinnerung ist Ihre Rechnung weiterhin ",
    introBold: "unbezahlt.",
    warn: "Letzte Mahnung: Erfolgt die Zahlung nicht umgehend, übergeben wir die Forderung an ein Inkassobüro und stellen Ihr Google-Unternehmensprofil samt aller Bewertungen wieder her.",
    cta: "Jetzt zahlen & Inkasso vermeiden",
    note: "Zusätzliche Mahn- und Inkassokosten gehen zu Ihren Lasten. Sollte die Zahlung bereits erfolgt sein, betrachten Sie diese Mahnung bitte als gegenstandslos.",
    subject: "Letzte Mahnung – Inkasso & Wiederherstellung Ihres Profils",
  },
  en: {
    title: "Final Notice – Debt Collection Pending",
    preview: "Final notice: Without immediate payment we will hand the claim to a debt collection agency and reinstate your profile.",
    intro: "despite our payment reminder, your invoice remains ",
    introBold: "unpaid.",
    warn: "Final notice: If payment is not made immediately, we will hand the claim to a debt collection agency and reinstate your Google Business Profile including all reviews.",
    cta: "Pay now & avoid debt collection",
    note: "Additional reminder and debt-collection fees will be charged to you. If payment has already been made, please disregard this notice.",
    subject: "Final notice – debt collection & restoration of your profile",
  },
  es: {
    title: "Última advertencia – cobro pendiente",
    preview: "Última advertencia: sin pago inmediato, entregaremos la deuda a una agencia de cobros y volveremos a publicar su perfil.",
    intro: "a pesar de nuestro recordatorio de pago, su factura sigue ",
    introBold: "sin pagar.",
    warn: "Última advertencia: si el pago no se realiza de inmediato, entregaremos la deuda a una agencia de cobros y volveremos a publicar su perfil de empresa de Google con todas las reseñas.",
    cta: "Pague ahora y evite el cobro",
    note: "Los gastos adicionales de reclamación y cobro correrán a su cargo. Si ya ha realizado el pago, considere este aviso sin efecto.",
    subject: "Última advertencia – cobro y restablecimiento de su perfil",
  },
  fr: {
    title: "Dernier rappel – recouvrement imminent",
    preview: "Dernier rappel : sans paiement immédiat, nous confions la créance à une société de recouvrement et remettons votre fiche en ligne.",
    intro: "malgré notre rappel de paiement, votre facture reste ",
    introBold: "impayée.",
    warn: "Dernier rappel : à défaut de paiement immédiat, nous confions la créance à une société de recouvrement et remettons votre fiche d'établissement Google en ligne, avec tous les avis.",
    cta: "Payer maintenant & éviter le recouvrement",
    note: "Les frais supplémentaires de rappel et de recouvrement seront à votre charge. Si le paiement a déjà été effectué, veuillez considérer ce rappel comme sans objet.",
    subject: "Dernier rappel – recouvrement et rétablissement de votre fiche",
  },
  it: {
    title: "Ultimo sollecito – recupero crediti imminente",
    preview: "Ultimo sollecito: senza pagamento immediato affideremo il credito a un'agenzia di recupero e ripubblicheremo il suo profilo.",
    intro: "nonostante il nostro sollecito di pagamento, la sua fattura risulta ancora ",
    introBold: "non pagata.",
    warn: "Ultimo sollecito: se il pagamento non avviene immediatamente, affideremo il credito a un'agenzia di recupero crediti e ripubblicheremo il suo profilo aziendale Google con tutte le recensioni.",
    cta: "Paga ora ed evita il recupero crediti",
    note: "Gli ulteriori costi di sollecito e recupero crediti saranno a suo carico. Se il pagamento è già stato effettuato, consideri questo sollecito come non valido.",
    subject: "Ultimo sollecito – recupero crediti e ripristino del suo profilo",
  },
  nl: {
    title: "Laatste aanmaning – incasso aangekondigd",
    preview: "Laatste aanmaning: zonder onmiddellijke betaling dragen we de vordering over aan een incassobureau en plaatsen we uw profiel terug.",
    intro: "ondanks onze betalingsherinnering is uw factuur nog steeds ",
    introBold: "onbetaald.",
    warn: "Laatste aanmaning: vindt de betaling niet onmiddellijk plaats, dan dragen we de vordering over aan een incassobureau en plaatsen we uw Google-bedrijfsprofiel inclusief alle beoordelingen terug.",
    cta: "Betaal nu & voorkom incasso",
    note: "Bijkomende aanmanings- en incassokosten komen voor uw rekening. Mocht de betaling al zijn voldaan, beschouw deze aanmaning dan als niet verzonden.",
    subject: "Laatste aanmaning – incasso en herstel van uw profiel",
  },
  pt: {
    title: "Último aviso – cobrança iminente",
    preview: "Último aviso: sem pagamento imediato, entregaremos a dívida a uma agência de cobrança e voltaremos a publicar o seu perfil.",
    intro: "apesar do nosso lembrete de pagamento, a sua fatura continua ",
    introBold: "por pagar.",
    warn: "Último aviso: se o pagamento não for efetuado de imediato, entregaremos a dívida a uma agência de cobrança e voltaremos a publicar o seu perfil de empresa do Google, incluindo todas as avaliações.",
    cta: "Pague agora e evite a cobrança",
    note: "Os custos adicionais de aviso e cobrança serão da sua responsabilidade. Se o pagamento já tiver sido efetuado, considere este aviso sem efeito.",
    subject: "Último aviso – cobrança e reposição do seu perfil",
  },
  ja: {
    title: "最終通告 – 債権回収の予告",
    preview: "最終通告：直ちにお支払いがない場合、債権を回収業者に引き渡し、お客様のプロフィールを再公開いたします。",
    intro: "お支払いのお願いにもかかわらず、ご請求は依然として",
    introBold: "未払いとなっております。",
    warn: "最終通告：直ちにお支払いいただけない場合、本債権を債権回収業者に引き渡し、お客様のGoogleビジネスプロフィールをすべての口コミとともに再公開いたします。",
    cta: "今すぐ支払い、債権回収を回避する",
    note: "追加の督促費用および回収費用はお客様のご負担となります。すでにお支払い済みの場合は、本通告を破棄してくださいますようお願いいたします。",
    subject: "最終通告 – 債権回収およびプロフィールの再公開について",
  },
  sv: {
    title: "Sista påminnelsen – inkasso aviseras",
    preview: "Sista påminnelsen: utan omedelbar betalning lämnar vi fordran till ett inkassobolag och återpublicerar din profil.",
    intro: "trots vår betalningspåminnelse är din faktura fortfarande ",
    introBold: "obetald.",
    warn: "Sista påminnelsen: sker ingen betalning omgående lämnar vi fordran till ett inkassobolag och återpublicerar din Google-företagsprofil med alla omdömen.",
    cta: "Betala nu & undvik inkasso",
    note: "Ytterligare påminnelse- och inkassokostnader belastar dig. Om betalningen redan har skett, bortse från denna påminnelse.",
    subject: "Sista påminnelsen – inkasso och återställning av din profil",
  },
  da: {
    title: "Sidste rykker – inkasso varslet",
    preview: "Sidste rykker: uden omgående betaling overdrager vi kravet til et inkassobureau og genudgiver din profil.",
    intro: "trods vores betalingspåmindelse er din faktura fortsat ",
    introBold: "ubetalt.",
    warn: "Sidste rykker: sker betalingen ikke omgående, overdrager vi kravet til et inkassobureau og genudgiver din Google-virksomhedsprofil inklusive alle anmeldelser.",
    cta: "Betal nu & undgå inkasso",
    note: "Yderligere rykker- og inkassoomkostninger pålægges dig. Hvis betalingen allerede er foretaget, bedes du se bort fra denne rykker.",
    subject: "Sidste rykker – inkasso og genoprettelse af din profil",
  },
  no: {
    title: "Siste purring – inkasso varslet",
    preview: "Siste purring: uten umiddelbar betaling overfører vi kravet til et inkassobyrå og publiserer profilen din på nytt.",
    intro: "til tross for vår betalingspåminnelse er fakturaen din fortsatt ",
    introBold: "ubetalt.",
    warn: "Siste purring: skjer ikke betaling omgående, overfører vi kravet til et inkassobyrå og publiserer Google-bedriftsprofilen din på nytt med alle anmeldelser.",
    cta: "Betal nå & unngå inkasso",
    note: "Ytterligere purre- og inkassokostnader belastes deg. Hvis betalingen allerede er foretatt, se bort fra denne purringen.",
    subject: "Siste purring – inkasso og gjenoppretting av profilen din",
  },
};

/* Stufe-2-Überschreibung für den Reset-Auftrag: statt „Profil wiederherstellen"
   → „bisherige Bewertungen wiederherstellen". Nur warn + preview weichen ab. */
const STAGE2_RESET: Record<string, { warn: string; preview: string }> = {
  de: { warn: "Letzte Mahnung: Erfolgt die Zahlung nicht umgehend, übergeben wir die Forderung an ein Inkassobüro und stellen die bisherigen Bewertungen Ihres Profils wieder her.", preview: "Letzte Mahnung: Ohne sofortige Zahlung geben wir die Forderung an ein Inkassobüro ab und stellen die bisherigen Bewertungen wieder her." },
  en: { warn: "Final notice: If payment is not made immediately, we will hand the claim to a debt collection agency and restore the previous reviews on your profile.", preview: "Final notice: Without immediate payment we will hand the claim to a debt collection agency and restore the previous reviews." },
  es: { warn: "Última advertencia: si el pago no se realiza de inmediato, entregaremos la deuda a una agencia de cobros y restableceremos las reseñas anteriores de su perfil.", preview: "Última advertencia: sin pago inmediato, entregaremos la deuda a una agencia de cobros y restableceremos las reseñas anteriores." },
  fr: { warn: "Dernier rappel : à défaut de paiement immédiat, nous confions la créance à une société de recouvrement et rétablissons les avis précédents de votre fiche.", preview: "Dernier rappel : sans paiement immédiat, nous confions la créance à une société de recouvrement et rétablissons les avis précédents." },
  it: { warn: "Ultimo sollecito: se il pagamento non avviene immediatamente, affideremo il credito a un'agenzia di recupero crediti e ripristineremo le recensioni precedenti del suo profilo.", preview: "Ultimo sollecito: senza pagamento immediato affideremo il credito a un'agenzia di recupero e ripristineremo le recensioni precedenti." },
  nl: { warn: "Laatste aanmaning: vindt de betaling niet onmiddellijk plaats, dan dragen we de vordering over aan een incassobureau en herstellen we de eerdere beoordelingen op uw profiel.", preview: "Laatste aanmaning: zonder onmiddellijke betaling dragen we de vordering over aan een incassobureau en herstellen we de eerdere beoordelingen." },
  pt: { warn: "Último aviso: se o pagamento não for efetuado de imediato, entregaremos a dívida a uma agência de cobrança e reporemos as avaliações anteriores do seu perfil.", preview: "Último aviso: sem pagamento imediato, entregaremos a dívida a uma agência de cobrança e reporemos as avaliações anteriores." },
  ja: { warn: "最終通告：直ちにお支払いいただけない場合、本債権を債権回収業者に引き渡し、お客様のプロフィールの以前の口コミを復元いたします。", preview: "最終通告：直ちにお支払いがない場合、債権を回収業者に引き渡し、以前の口コミを復元いたします。" },
  sv: { warn: "Sista påminnelsen: sker ingen betalning omgående lämnar vi fordran till ett inkassobolag och återställer de tidigare omdömena på din profil.", preview: "Sista påminnelsen: utan omedelbar betalning lämnar vi fordran till ett inkassobolag och återställer de tidigare omdömena." },
  da: { warn: "Sidste rykker: sker betalingen ikke omgående, overdrager vi kravet til et inkassobureau og genskaber de tidligere anmeldelser på din profil.", preview: "Sidste rykker: uden omgående betaling overdrager vi kravet til et inkassobureau og genskaber de tidligere anmeldelser." },
  no: { warn: "Siste purring: skjer ikke betaling omgående, overfører vi kravet til et inkassobyrå og gjenoppretter de tidligere anmeldelsene på profilen din.", preview: "Siste purring: uten umiddelbar betaling overfører vi kravet til et inkassobyrå og gjenoppretter de tidligere anmeldelsene." },
};

export function subject(p: MahnungProps): string {
  const lang = p.lang || "de";
  if (p.stage === 2) return (STAGE2[lang] || STAGE2.de).subject;
  return (T[lang] || T.de).subject;
}

export default function Mahnung({ lang = "de", total, due, payUrl, service, stage }: MahnungProps) {
  const isReset = service === "reset";
  let t: typeof T.de = T[lang] || T.de;
  if (isReset) t = { ...t, ...(RESET[lang] || RESET.de) };
  if (stage === 2) {
    t = { ...t, ...(STAGE2[lang] || STAGE2.de) };
    if (isReset) t = { ...t, ...(STAGE2_RESET[lang] || STAGE2_RESET.de) };
  }
  const label = { fontSize: 14, fontWeight: 700, color: brand.text, margin: 0 } as const;
  const val = { fontSize: 14, color: brand.text, margin: 0 } as const;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.intro}<strong>{t.introBold}</strong></P>

      <Hr style={{ borderColor: brand.hr, margin: "8px 0 4px" }} />
      <Row>
        <Column><Text style={{ fontSize: 22, fontWeight: 700, color: brand.text, margin: "8px 0" }}>{t.total}</Text></Column>
        <Column style={{ textAlign: "right" }}><Text style={{ fontSize: 22, fontWeight: 700, color: brand.accent, margin: "8px 0" }}>{total}</Text></Column>
      </Row>
      <Hr style={{ borderColor: brand.hr, margin: "4px 0 16px" }} />

      {/* Große, fette Warnung */}
      <Section style={{ background: brand.dangerTint, border: `2px solid ${brand.dangerBorder}`, borderRadius: 14, padding: "22px 20px", margin: "4px 0 18px" }}>
        <Text style={{ margin: 0, fontSize: 22, lineHeight: "1.3", fontWeight: 800, color: brand.dangerText, textAlign: "center" }}>
          {t.warn}
        </Text>
      </Section>

      <Row style={{ marginBottom: 4 }}>
        <Column style={{ width: "42%", verticalAlign: "top" }}><Text style={label}>{t.due}</Text></Column>
        <Column><Text style={val}>{due}</Text></Column>
      </Row>

      <Section style={{ textAlign: "center", margin: "18px 0 12px" }}>
        <CtaButton href={payUrl} full variant="danger">{t.cta}</CtaButton>
      </Section>

      <P muted>{t.note}</P>
    </EmailShell>
  );
}
