/* Template: Zahlungserinnerung / Mahnung — offene Rechnung mit großer,
   deutlicher Warnung ("Profil wird wieder auf Google eingestellt") und
   erneutem Stripe-Zahlungslink. Gleiches Marken-Design wie PaymentLink. */
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
};

export function subject(p: MahnungProps): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Mahnung({ lang = "de", total, due, payUrl }: MahnungProps) {
  const t = T[lang] || T.de;
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
