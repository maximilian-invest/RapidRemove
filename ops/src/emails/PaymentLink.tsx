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
  /** Leistungs-Key der Bestellung. Bei "reset" (Profil-Löschung + Neuaufsetzen, 850 €)
   *  wird die reine Lösch-Formulierung durch „gelöscht und neu aufgesetzt – frischer
   *  Start mit 0 Bewertungen" ersetzt. Alle anderen Werte → Standard-Lösch-Text. */
  service?: string;
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

/* Überschreibungen für den Reset-Auftrag ("reset", 850 €): Profil wird NICHT nur gelöscht,
   sondern gelöscht UND neu aufgesetzt – frischer Start mit 0 Bewertungen. Nur die Felder,
   die sich von der reinen Löschung unterscheiden; alles andere kommt aus T. */
const RESET: Record<string, { preview: string; introBold: string; important: string }> = {
  de: {
    preview: "Ihr Profil wurde gelöscht und neu aufgesetzt – bitte begleichen Sie die offene Rechnung.",
    introBold: "erfolgreich gelöscht und neu aufgesetzt wurde – ein frischer Start mit 0 Bewertungen.",
    important: " Bitte beachten Sie, dass wir Ihr neu aufgesetztes Profil bis zur vollständigen Zahlung zurückhalten und im Falle der Nichtzahlung die bisherigen Bewertungen wiederherstellen.",
  },
  en: {
    preview: "Your profile has been deleted and freshly set up – please settle the open invoice.",
    introBold: "successfully deleted and freshly set up – a fresh start with 0 reviews.",
    important: " Please note that we will withhold your newly set-up profile until full payment is made and, in case of non-payment, restore the previous reviews.",
  },
  es: {
    preview: "Su perfil ha sido eliminado y reconfigurado: le rogamos que abone la factura pendiente.",
    introBold: "eliminado y reconfigurado por completo: un nuevo comienzo con 0 reseñas.",
    important: " Tenga en cuenta que mantendremos su perfil recién configurado retenido hasta el pago íntegro y, en caso de impago, restableceremos las reseñas anteriores.",
  },
  fr: {
    preview: "Votre fiche a été supprimée puis recréée : merci de régler la facture en attente.",
    introBold: "supprimée puis entièrement recréée : un nouveau départ avec 0 avis.",
    important: " Veuillez noter que nous conserverons votre fiche nouvellement recréée jusqu'au paiement intégral et, en cas de non-paiement, nous rétablirons les avis précédents.",
  },
  it: {
    preview: "Il suo profilo è stato eliminato e ricreato da zero: la preghiamo di saldare la fattura in sospeso.",
    introBold: "eliminato e ricreato completamente: un nuovo inizio con 0 recensioni.",
    important: " La informiamo che tratterremo il suo profilo appena ricreato fino al pagamento completo e, in caso di mancato pagamento, ripristineremo le recensioni precedenti.",
  },
  nl: {
    preview: "Uw profiel is verwijderd en opnieuw opgezet – gelieve de openstaande factuur te voldoen.",
    introBold: "succesvol is verwijderd en opnieuw opgezet – een frisse start met 0 beoordelingen.",
    important: " Houd er rekening mee dat wij uw opnieuw opgezette profiel tot de volledige betaling vasthouden en bij niet-betaling de eerdere beoordelingen herstellen.",
  },
  pt: {
    preview: "O seu perfil foi eliminado e recriado de raiz – queira regularizar a fatura em aberto.",
    introBold: "eliminado e recriado por completo – um recomeço com 0 avaliações.",
    important: " Tenha em atenção que reteremos o seu perfil recém-criado até ao pagamento integral e, em caso de não pagamento, reporemos as avaliações anteriores.",
  },
  ja: {
    preview: "お客様のプロフィールは削除され、新たに作成されました。未払いの請求書のお支払いをお願いいたします。",
    introBold: "正常に削除され、新たに作成されましたことをお知らせいたします（口コミ0件での新たなスタート）。",
    important: " お支払いが完了するまで新たに作成したプロフィールは保留され、未払いの場合は以前の口コミが復元されますのでご了承ください。",
  },
  sv: {
    preview: "Din profil har raderats och skapats på nytt – vänligen betala den utestående fakturan.",
    introBold: "raderats och skapats helt på nytt – en nystart med 0 omdömen.",
    important: " Observera att vi håller kvar din nyskapade profil till dess att full betalning har skett och, vid utebliven betalning, återställer de tidigare omdömena.",
  },
  da: {
    preview: "Din profil er blevet slettet og oprettet på ny – betal venligst den udestående faktura.",
    introBold: "slettet og oprettet helt på ny – en frisk start med 0 anmeldelser.",
    important: " Bemærk venligst, at vi tilbageholder din nyoprettede profil indtil fuld betaling og, i tilfælde af manglende betaling, genskaber de tidligere anmeldelser.",
  },
  no: {
    preview: "Profilen din er slettet og opprettet på nytt – vennligst gjør opp den utestående fakturaen.",
    introBold: "slettet og opprettet helt på nytt – en frisk start med 0 anmeldelser.",
    important: " Vær oppmerksom på at vi holder tilbake den nyopprettede profilen din til full betaling er mottatt, og ved manglende betaling gjenoppretter de tidligere anmeldelsene.",
  },
};

export function subject(p: PaymentLinkProps): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function PaymentLink({ lang = "de", total, protectionLabel, expressLabel, upgradeUrl, due, payUrl, service }: PaymentLinkProps) {
  const base = T[lang] || T.de;
  const t = service === "reset" ? { ...base, ...(RESET[lang] || RESET.de) } : base;
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
