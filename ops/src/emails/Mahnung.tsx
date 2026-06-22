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
    warn: "Zahlen Sie jetzt – sonst stellen wir Ihr Profil wieder auf Google ein.",
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
    warn: "Pay now – otherwise we will reinstate your profile on Google.",
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
    warn: "Pague ahora; de lo contrario, volveremos a publicar su perfil en Google.",
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
    warn: "Payez maintenant, sinon nous remettrons votre fiche en ligne sur Google.",
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
    warn: "Paghi ora, altrimenti ripubblicheremo il suo profilo su Google.",
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
    warn: "Betaal nu – anders plaatsen we uw profiel weer op Google.",
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
    warn: "Pague agora; caso contrário, voltaremos a publicar o seu perfil no Google.",
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
    warn: "今すぐお支払いください。お支払いがない場合、お客様のプロフィールを再びGoogleに掲載いたします。",
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
    warn: "Betala nu – annars publicerar vi din profil på Google igen.",
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
    warn: "Betal nu – ellers genudgiver vi din profil på Google.",
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
    warn: "Betal nå – ellers publiserer vi profilen din på Google igjen.",
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
    warn: "Zahlen Sie jetzt – sonst stellen wir die bisherigen Bewertungen wieder her.",
  },
  en: {
    intro: "the invoice for the successful deletion and fresh setup of your Google profile is still ",
    preview: "Your invoice is open. Without payment we will restore the previous reviews.",
    warn: "Pay now – otherwise we will restore the previous reviews.",
  },
  es: {
    intro: "la factura por la eliminación y reconfiguración de su perfil de Google sigue ",
    preview: "Su factura está pendiente. Sin el pago, restableceremos las reseñas anteriores.",
    warn: "Pague ahora; de lo contrario, restableceremos las reseñas anteriores.",
  },
  fr: {
    intro: "la facture relative à la suppression et à la recréation de votre fiche Google est toujours ",
    preview: "Votre facture est en attente. Sans paiement, nous rétablirons les avis précédents.",
    warn: "Payez maintenant, sinon nous rétablirons les avis précédents.",
  },
  it: {
    intro: "la fattura per la riuscita rimozione e ricreazione del suo profilo Google è ancora ",
    preview: "La sua fattura è in sospeso. Senza il pagamento ripristineremo le recensioni precedenti.",
    warn: "Paghi ora, altrimenti ripristineremo le recensioni precedenti.",
  },
  nl: {
    intro: "de factuur voor de succesvolle verwijdering en heropbouw van uw Google-profiel staat nog ",
    preview: "Uw factuur staat open. Zonder betaling herstellen we de eerdere beoordelingen.",
    warn: "Betaal nu – anders herstellen we de eerdere beoordelingen.",
  },
  pt: {
    intro: "a fatura pela eliminação e recriação bem-sucedidas do seu perfil do Google continua ",
    preview: "A sua fatura está pendente. Sem o pagamento, reporemos as avaliações anteriores.",
    warn: "Pague agora; caso contrário, reporemos as avaliações anteriores.",
  },
  ja: {
    intro: "お客様のGoogleプロフィールの削除および再作成の完了に関する請求書が、いまだ",
    preview: "請求書が未払いです。お支払いがない場合、以前の口コミを復元いたします。",
    warn: "今すぐお支払いください。お支払いがない場合、以前の口コミを復元いたします。",
  },
  sv: {
    intro: "fakturan för den lyckade borttagningen och nyuppsättningen av din Google-profil är fortfarande ",
    preview: "Din faktura är obetald. Utan betalning återställer vi de tidigare omdömena.",
    warn: "Betala nu – annars återställer vi de tidigare omdömena.",
  },
  da: {
    intro: "fakturaen for den vellykkede fjernelse og nyoprettelse af din Google-profil er fortsat ",
    preview: "Din faktura er ubetalt. Uden betaling genskaber vi de tidligere anmeldelser.",
    warn: "Betal nu – ellers genskaber vi de tidligere anmeldelser.",
  },
  no: {
    intro: "fakturaen for den vellykkede fjerningen og nyopprettelsen av Google-profilen din er fortsatt ",
    preview: "Fakturaen din er ubetalt. Uten betaling gjenoppretter vi de tidligere anmeldelsene.",
    warn: "Betal nå – ellers gjenoppretter vi de tidligere anmeldelsene.",
  },
};

export function subject(p: MahnungProps): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Mahnung({ lang = "de", total, due, payUrl, service }: MahnungProps) {
  const base = T[lang] || T.de;
  const t = service === "reset" ? { ...base, ...(RESET[lang] || RESET.de) } : base;
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
