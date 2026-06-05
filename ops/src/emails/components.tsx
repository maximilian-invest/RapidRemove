/* Gemeinsame Bausteine + Markentokens für alle RapidRemove-E-Mails.
   Design an die neue Website angelehnt: warmes Off-White, Orange-Akzent,
   runde Ecken, Wortmarke im Header, Pill-Buttons. Alle Templates nutzen
   <EmailShell> + diese Tokens → Re-Skin passiert an EINER Stelle. */
import * as React from "react";
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button as REButton,
} from "@react-email/components";

export const brand = {
  page: "#f6f3f0",        // warmes Canvas
  card: "#ffffff",
  ink: "#1c1916",         // warm near-black (Headlines)
  text: "#2a2622",
  muted: "#6b6259",
  accent: "#ff8000",      // RapidRemove-Orange (Buttons, Links, Zahlen)
  accentDark: "#e67300",
  tint: "#fff4e8",        // orange-50 (Callouts/Boxen)
  tintBorder: "#ffd9b0",
  tintText: "#8a4b00",
  hr: "#ece7e1",          // Hairline
  font: "'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

export function EmailShell({
  preview, title, children,
}: { preview: string; title: string; children: React.ReactNode }) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, background: brand.page, fontFamily: brand.font, color: brand.text, padding: "24px 12px" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", background: brand.card, borderRadius: 18, overflow: "hidden", border: `1px solid ${brand.hr}`, borderTop: `4px solid ${brand.accent}` }}>
          {/* Header: Wortmarke */}
          <Section style={{ padding: "22px 32px 16px" }}>
            <Text style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: brand.accent }}>
              RapidRemove
            </Text>
          </Section>
          <Hr style={{ borderColor: brand.hr, margin: 0 }} />
          {/* Inhalt */}
          <Section style={{ padding: "28px 32px" }}>
            <Heading as="h1" style={{ margin: "0 0 16px", fontSize: 23, lineHeight: "1.25", fontWeight: 800, letterSpacing: "-0.02em", color: brand.ink }}>
              {title}
            </Heading>
            {children}
          </Section>
          {/* Footer */}
          <Section style={{ padding: "18px 32px 24px", background: brand.page, borderTop: `1px solid ${brand.hr}` }}>
            <Text style={{ margin: 0, fontSize: 12, lineHeight: "1.6", color: brand.muted }}>
              <strong style={{ color: brand.text }}>RapidRemove</strong> · Simple Solution OG<br />
              Salzgasse 2, 5400 Hallein, Österreich · info@rapid-remove.com · rapid-remove.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function P({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <Text style={{ fontSize: 15, lineHeight: "1.6", margin: "0 0 12px", color: muted ? brand.muted : brand.text }}>
      {children}
    </Text>
  );
}

export function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ background: brand.tint, border: `1px solid ${brand.tintBorder}`, borderRadius: 14, padding: "14px 18px", margin: "6px 0 16px" }}>
      <Text style={{ margin: 0, fontSize: 14, lineHeight: "1.55", color: brand.text }}>{children}</Text>
    </Section>
  );
}

export function CtaButton({ href, children, full = false }: { href: string; children: React.ReactNode; full?: boolean }) {
  return (
    <REButton
      href={href}
      style={{ background: brand.accent, color: "#ffffff", fontWeight: 800, fontSize: 15, padding: "14px 28px", borderRadius: 999, textDecoration: "none", display: "inline-block", textAlign: "center", ...(full ? { width: "100%" } : {}) }}
    >
      {children}
    </REButton>
  );
}
