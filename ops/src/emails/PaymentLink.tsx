/* Template: Zahlungslink / Payment link — EINE Komponente für alle 24 Varianten.
   Betrag, Schutz-Label, Fälligkeit und Stripe-Link kommen als Parameter rein. */
import * as React from "react";
import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailShell, P, CtaButton, brand } from "./components";

export interface PaymentLinkProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** Gesamtbetrag, vorformatiert – z. B. "519,90 € (netto)" / "€474.90" */
  total: string;
  /** Text rechts neben "Schutz?/Protection?" – z. B. "Enthält monatlichen Schutz + Überwachung" */
  protectionLabel?: string;
  /** Text rechts neben "Express?" – nur gesetzt, wenn Express gebucht wurde, z. B. "Beschleunigt (≤6 h) · +149 €" */
  expressLabel?: string;
  /** Link für "(Upgrade?)" – optional */
  upgradeUrl?: string;
  /** Fälligkeit – z. B. "sofort", "innerhalb 7 Tagen" */
  due: string;
  /** Stripe-Zahlungslink für den Button */
  payUrl: string;
}

const T = {
  de: {
    title: "Auftrag erfolgreich abgeschlossen ✓",
    preview: "Ihr Profil wurde gelöscht – bitte begleichen Sie die offene Rechnung.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "wir freuen uns, Ihnen mitteilen zu können, dass Ihr Google-Unternehmensprofil ",
    introBold: "erfolgreich gelöscht wurde.",
    total: "Gesamt",
    express: "Express?",
    protection: "Schutz?",
    noProtection: "Kein Schutz gewählt",
    upgrade: "Upgrade?",
    due: "Fälligkeit:",
    cta: "Jetzt offene Rechnung bezahlen",
    importantBold: "Wichtig:",
    important: " Bitte beachten Sie, dass wir Ihr Profil bis zur vollständigen Zahlung zurückhalten und es im Falle der Nichtzahlung wiederherstellen.",
    subject: "Auftrag abgeschlossen – Ihre Rechnung",
  },
  en: {
    title: "Order Completed ✓",
    preview: "Your profile has been deleted – please settle the open invoice.",
    greeting: "Dear Sir or Madam,",
    intro: "we are pleased to inform you that your Google Business Profile has been ",
    introBold: "successfully deleted.",
    total: "Total",
    express: "Express?",
    protection: "Protection?",
    noProtection: "No protection selected",
    upgrade: "Upgrade?",
    due: "Due:",
    cta: "Pay Invoice Now",
    importantBold: "Important:",
    important: " Please note that we will withhold your profile until full payment is made and restore it in case of non-payment.",
    subject: "Order completed – your invoice",
  },
  es: {
    title: "Pedido finalizado con éxito ✓",
    preview: "Su perfil ha sido eliminado: le rogamos que abone la factura pendiente.",
    greeting: "Estimados señores:",
    intro: "nos complace informarle de que su perfil de empresa de Google ha sido ",
    introBold: "eliminado correctamente.",
    total: "Total",
    express: "¿Express?",
    protection: "¿Protección?",
    noProtection: "Sin protección seleccionada",
    upgrade: "¿Mejorar?",
    due: "Vencimiento:",
    cta: "Pagar ahora la factura pendiente",
    importantBold: "Importante:",
    important: " Tenga en cuenta que mantendremos su perfil retenido hasta el pago íntegro y lo restableceremos en caso de impago.",
    subject: "Pedido finalizado – su factura",
  },
  fr: {
    title: "Commande réalisée avec succès ✓",
    preview: "Votre fiche a été supprimée : merci de régler la facture en attente.",
    greeting: "Madame, Monsieur,",
    intro: "nous avons le plaisir de vous informer que votre fiche d'établissement Google a été ",
    introBold: "supprimée avec succès.",
    total: "Total",
    express: "Express ?",
    protection: "Protection ?",
    noProtection: "Aucune protection sélectionnée",
    upgrade: "Mettre à niveau ?",
    due: "Échéance :",
    cta: "Payer la facture en attente",
    importantBold: "Important :",
    important: " Veuillez noter que nous conserverons votre fiche jusqu'au paiement intégral et la rétablirons en cas de non-paiement.",
    subject: "Commande réalisée – votre facture",
  },
  it: {
    title: "Ordine completato con successo ✓",
    preview: "Il suo profilo è stato eliminato: la preghiamo di saldare la fattura in sospeso.",
    greeting: "Gentili Signore e Signori,",
    intro: "siamo lieti di comunicarle che il suo profilo dell'attività su Google è stato ",
    introBold: "eliminato con successo.",
    total: "Totale",
    express: "Express?",
    protection: "Protezione?",
    noProtection: "Nessuna protezione selezionata",
    upgrade: "Upgrade?",
    due: "Scadenza:",
    cta: "Paga ora la fattura in sospeso",
    importantBold: "Importante:",
    important: " La informiamo che tratterremo il suo profilo fino al pagamento completo e lo ripristineremo in caso di mancato pagamento.",
    subject: "Ordine completato – la sua fattura",
  },
  nl: {
    title: "Opdracht succesvol afgerond ✓",
    preview: "Uw profiel is verwijderd – gelieve de openstaande factuur te voldoen.",
    greeting: "Geachte heer/mevrouw,",
    intro: "wij zijn verheugd u te kunnen meedelen dat uw Google-bedrijfsprofiel ",
    introBold: "succesvol is verwijderd.",
    total: "Totaal",
    express: "Express?",
    protection: "Bescherming?",
    noProtection: "Geen bescherming gekozen",
    upgrade: "Upgraden?",
    due: "Vervaldatum:",
    cta: "Openstaande factuur nu betalen",
    importantBold: "Belangrijk:",
    important: " Houd er rekening mee dat wij uw profiel tot de volledige betaling vasthouden en het bij niet-betaling herstellen.",
    subject: "Opdracht afgerond – uw factuur",
  },
  pt: {
    title: "Encomenda concluída com sucesso ✓",
    preview: "O seu perfil foi eliminado – queira regularizar a fatura em aberto.",
    greeting: "Exmos. Senhores,",
    intro: "temos o prazer de o informar de que o seu perfil de empresa do Google foi ",
    introBold: "eliminado com sucesso.",
    total: "Total",
    express: "Express?",
    protection: "Proteção?",
    noProtection: "Nenhuma proteção selecionada",
    upgrade: "Atualizar?",
    due: "Vencimento:",
    cta: "Pagar agora a fatura em aberto",
    importantBold: "Importante:",
    important: " Tenha em atenção que reteremos o seu perfil até ao pagamento integral e o repomos em caso de não pagamento.",
    subject: "Encomenda concluída – a sua fatura",
  },
  ja: {
    title: "注文が正常に完了しました ✓",
    preview: "お客様のプロフィールは削除されました。未払いの請求書のお支払いをお願いいたします。",
    greeting: "ご担当者様",
    intro: "お客様のGoogleビジネスプロフィールが",
    introBold: "正常に削除されましたことをお知らせいたします。",
    total: "合計",
    express: "エクスプレス？",
    protection: "保護？",
    noProtection: "保護は選択されていません",
    upgrade: "アップグレード？",
    due: "支払期限：",
    cta: "未払いの請求書を今すぐ支払う",
    importantBold: "重要：",
    important: " お支払いが完了するまでお客様のプロフィールは保留され、未払いの場合は復元されますのでご了承ください。",
    subject: "注文完了 – 請求書のご案内",
  },
  sv: {
    title: "Beställningen har slutförts ✓",
    preview: "Din profil har raderats – vänligen betala den utestående fakturan.",
    greeting: "Hej,",
    intro: "vi har nöjet att meddela att din Google-företagsprofil har ",
    introBold: "raderats.",
    total: "Totalt",
    express: "Express?",
    protection: "Skydd?",
    noProtection: "Inget skydd valt",
    upgrade: "Uppgradera?",
    due: "Förfaller:",
    cta: "Betala den utestående fakturan nu",
    importantBold: "Viktigt:",
    important: " Observera att vi håller kvar din profil till dess att full betalning har skett och återställer den vid utebliven betalning.",
    subject: "Beställningen slutförd – din faktura",
  },
  da: {
    title: "Ordren er gennemført ✓",
    preview: "Din profil er blevet slettet – betal venligst den udestående faktura.",
    greeting: "Kære kunde,",
    intro: "vi er glade for at kunne meddele, at din Google-virksomhedsprofil er blevet ",
    introBold: "slettet.",
    total: "I alt",
    express: "Express?",
    protection: "Beskyttelse?",
    noProtection: "Ingen beskyttelse valgt",
    upgrade: "Opgrader?",
    due: "Forfald:",
    cta: "Betal den udestående faktura nu",
    importantBold: "Vigtigt:",
    important: " Bemærk venligst, at vi tilbageholder din profil indtil fuld betaling og genskaber den i tilfælde af manglende betaling.",
    subject: "Ordren gennemført – din faktura",
  },
  no: {
    title: "Bestillingen er fullført ✓",
    preview: "Profilen din er slettet – vennligst gjør opp den utestående fakturaen.",
    greeting: "Hei,",
    intro: "vi er glade for å kunne meddele at Google-bedriftsprofilen din er blitt ",
    introBold: "slettet.",
    total: "Totalt",
    express: "Express?",
    protection: "Beskyttelse?",
    noProtection: "Ingen beskyttelse valgt",
    upgrade: "Oppgrader?",
    due: "Forfall:",
    cta: "Betal den utestående fakturaen nå",
    importantBold: "Viktig:",
    important: " Vær oppmerksom på at vi holder tilbake profilen din til full betaling er mottatt, og gjenoppretter den ved manglende betaling.",
    subject: "Bestillingen fullført – din faktura",
  },
};

export function subject(p: PaymentLinkProps): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function PaymentLink({ lang = "de", total, protectionLabel, expressLabel, upgradeUrl, due, payUrl }: PaymentLinkProps) {
  const t = T[lang] || T.de;
  const label = { fontSize: 14, fontWeight: 700, color: brand.text, margin: 0 } as const;
  const val = { fontSize: 14, color: brand.text, margin: 0 } as const;
  return (
    <EmailShell preview={t.preview} title={t.title}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.intro}<strong>{t.introBold}</strong></P>

      <Hr style={{ borderColor: brand.hr, margin: "8px 0 4px" }} />
      <Row>
        <Column><Text style={{ fontSize: 26, fontWeight: 700, color: brand.text, margin: "8px 0" }}>{t.total}</Text></Column>
        <Column style={{ textAlign: "right" }}><Text style={{ fontSize: 26, fontWeight: 700, color: brand.accent, margin: "8px 0" }}>{total}</Text></Column>
      </Row>
      <Hr style={{ borderColor: brand.hr, margin: "4px 0 14px" }} />

      {expressLabel ? (
        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "42%", verticalAlign: "top" }}><Text style={label}>{t.express}</Text></Column>
          <Column><Text style={val}>{expressLabel}</Text></Column>
        </Row>
      ) : null}
      <Row style={{ marginBottom: 8 }}>
        <Column style={{ width: "42%", verticalAlign: "top" }}><Text style={label}>{t.protection}</Text></Column>
        <Column>
          <Text style={val}>
            {protectionLabel || t.noProtection}
            {upgradeUrl ? <> (<a href={upgradeUrl} style={{ color: brand.accent }}>{t.upgrade}</a>)</> : null}
          </Text>
        </Column>
      </Row>
      <Row>
        <Column style={{ width: "42%", verticalAlign: "top" }}><Text style={label}>{t.due}</Text></Column>
        <Column><Text style={val}>{due}</Text></Column>
      </Row>

      <Section style={{ textAlign: "center", margin: "22px 0 14px" }}>
        <CtaButton href={payUrl} full>{t.cta}</CtaButton>
      </Section>

      <P><strong>{t.importantBold}</strong>{t.important}</P>
    </EmailShell>
  );
}
