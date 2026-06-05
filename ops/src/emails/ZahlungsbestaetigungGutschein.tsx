/* Template: Zahlung erfolgreich + Empfehlungs-Gutschein / Payment successful + referral gift (DE/EN). */
import * as React from "react";
import { EmailShell, P, A, GiftCard, brand } from "./components";
import { Section, Text, Heading } from "@react-email/components";

export interface ZahlungsbestaetigungGutscheinProps {
  lang?: "de" | "en";
  /** Link zum Rechnungs-Download */
  invoiceUrl?: string;
  /** Persönlicher Empfehlungslink (mit der Kunden-E-Mail) */
  friendUrl?: string;
}

const T = {
  de: {
    title: "Zahlung erfolgreich ✓",
    preview: "Vielen Dank für Ihre Zahlung – Ihre Rechnung & 50 € Empfehlungs-Gutschein.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre Zahlung. Die Rechnung finden Sie im Anhang sowie hier als Download (",
    p1Link: "Rechnung herunterladen",
    p1b: ").",
    amount: "€50",
    giftH: "Empfehlen Sie uns und erhalten Sie 50 € Amazon-Gutschein!",
    giftP: "Gerne geben wir Ihnen etwas zurück und schenken Ihnen 50 € Gutschein bei amazon.de für jeden Freund oder Kollegen, der bei uns durch Sie beauftragt.",
    giftBold: "Geben Sie diesen Personen einfach folgenden Link:",
    subject: "Zahlung erfolgreich – Ihre Rechnung",
  },
  en: {
    title: "Payment Successful ✓",
    preview: "Thank you for your payment – your invoice & $50 referral gift card.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your payment. Please find the invoice attached or ",
    p1Link: "download it here",
    p1b: ".",
    amount: "$50",
    giftH: "Recommend us and receive a $50 Amazon gift card!",
    giftP: "We’d love to give back to you! Receive a $50 voucher for amazon.com for every friend who hires us through your referral.",
    giftBold: "Simply share the following link:",
    subject: "Payment successful – your invoice",
  },
};

export function subject(p: ZahlungsbestaetigungGutscheinProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function ZahlungsbestaetigungGutschein({
  lang = "de",
  invoiceUrl = "https://rapid-remove.com",
  friendUrl = "https://www.rapid-remove.com/de?friend={{email}}",
}: ZahlungsbestaetigungGutscheinProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<A href={invoiceUrl}>{t.p1Link}</A>{t.p1b}</P>

      {/* Empfehlungs-Block */}
      <Section style={{ background: brand.tint, border: `1px solid ${brand.tintBorder}`, borderRadius: 16, padding: "20px 22px", margin: "8px 0 4px", textAlign: "center" as const }}>
        <GiftCard amount={t.amount} />
        <Heading as="h2" style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 800, lineHeight: "1.3", color: brand.ink }}>
          {t.giftH}
        </Heading>
        <Text style={{ margin: "0 0 10px", fontSize: 14, lineHeight: "1.6", color: brand.text }}>{t.giftP}</Text>
        <Text style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: brand.text }}>{t.giftBold}</Text>
        <Text style={{ margin: 0, fontSize: 14, wordBreak: "break-all" as const }}>
          <A href={friendUrl}>{friendUrl}</A>
        </Text>
      </Section>
    </EmailShell>
  );
}
