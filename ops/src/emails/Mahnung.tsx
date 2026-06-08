/* Template: Zahlungserinnerung / Mahnung — freundliche Erinnerung an eine
   offene Rechnung, mit erneutem Stripe-Zahlungslink. Gleiches Design wie
   PaymentLink. Betrag, Fälligkeit und Link kommen als Parameter rein. */
import * as React from "react";
import { Column, Hr, Row, Section, Text } from "@react-email/components";
import { EmailShell, P, CtaButton, brand } from "./components";

export interface MahnungProps {
  lang?: "de" | "en";
  /** Offener Betrag, vorformatiert – z. B. "519,90 €" */
  total: string;
  /** Fälligkeit – z. B. "umgehend", "innerhalb 7 Tagen" */
  due: string;
  /** Stripe-Zahlungslink für den Button */
  payUrl: string;
}

const T = {
  de: {
    title: "Zahlungserinnerung",
    preview: "Ihre Rechnung ist noch offen – bitte begleichen Sie sie zeitnah.",
    greeting: "Sehr geehrte Damen und Herren,",
    intro: "wir möchten Sie freundlich daran erinnern, dass die folgende Rechnung noch ",
    introBold: "offen ist.",
    total: "Offener Betrag",
    due: "Fällig:",
    cta: "Offene Rechnung jetzt bezahlen",
    importantBold: "Hinweis:",
    important:
      " Sollte die Zahlung zwischenzeitlich erfolgt sein, betrachten Sie diese Erinnerung bitte als gegenstandslos. Bei weiterhin ausbleibender Zahlung behalten wir uns vor, das gelöschte Profil wiederherzustellen.",
    subject: "Zahlungserinnerung – Ihre offene Rechnung",
  },
  en: {
    title: "Payment Reminder",
    preview: "Your invoice is still open – please settle it soon.",
    greeting: "Dear Sir or Madam,",
    intro: "this is a friendly reminder that the following invoice is still ",
    introBold: "outstanding.",
    total: "Amount due",
    due: "Due:",
    cta: "Pay Invoice Now",
    importantBold: "Note:",
    important:
      " If payment has already been made, please disregard this reminder. In case of continued non-payment, we reserve the right to restore the deleted profile.",
    subject: "Payment reminder – your open invoice",
  },
};

export function subject(p: MahnungProps): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Mahnung({ lang = "de", total, due, payUrl }: MahnungProps) {
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
