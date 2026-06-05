/* Template: Zahlungslink / Payment link — EINE Komponente für alle 24 Varianten.
   Betrag, Schutz-Label, Fälligkeit und Stripe-Link kommen als Parameter rein. */
import * as React from "react";
import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailShell, P, CtaButton, brand } from "./components";

export interface PaymentLinkProps {
  lang?: "de" | "en";
  /** Gesamtbetrag, vorformatiert – z. B. "519,90 € (netto)" / "€474.90" */
  total: string;
  /** Text rechts neben "Schutz?/Protection?" – z. B. "Enthält monatlichen Schutz + Überwachung" */
  protectionLabel?: string;
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
    protection: "Protection?",
    noProtection: "No protection selected",
    upgrade: "Upgrade?",
    due: "Due:",
    cta: "Pay Invoice Now",
    importantBold: "Important:",
    important: " Please note that we will withhold your profile until full payment is made and restore it in case of non-payment.",
    subject: "Order completed – your invoice",
  },
};

export function subject(p: PaymentLinkProps): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function PaymentLink({ lang = "de", total, protectionLabel, upgradeUrl, due, payUrl }: PaymentLinkProps) {
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
