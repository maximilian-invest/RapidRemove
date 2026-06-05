/* Gemeinsame Bausteine + Markentokens für alle RapidRemove-E-Mails.
   Stil hält sich an die bestehenden Vorlagen (heller Kopfbalken, gelbe
   Hinweis-Box, Footer mit Firmendaten). Re-Skin später an einer Stelle. */
import * as React from "react";
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button as REButton,
} from "@react-email/components";

export const brand = {
  page: "#f3f4f6",
  card: "#ffffff",
  headerBg: "#e8f0fe",
  headerFg: "#1f2d3d",
  text: "#1f2d3d",
  muted: "#5f6b7a",
  accent: "#1a73e8",
  noteBg: "#fdf3d3",
  noteBorder: "#f0d98a",
  hr: "#eaecef",
  font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};

export function EmailShell({
  preview, title, children,
}: { preview: string; title: string; children: React.ReactNode }) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, background: brand.page, fontFamily: brand.font, color: brand.text }}>
        <Container style={{ maxWidth: 600, margin: "0 auto", background: brand.card }}>
          <Section style={{ background: brand.headerBg, padding: "28px 32px" }}>
            <Heading as="h1" style={{ margin: 0, fontSize: 24, fontWeight: 700, color: brand.headerFg }}>
              {title}
            </Heading>
          </Section>
          <Section style={{ padding: "26px 32px" }}>{children}</Section>
          <Hr style={{ borderColor: brand.hr, margin: 0 }} />
          <Section style={{ padding: "18px 32px" }}>
            <Text style={{ margin: 0, fontSize: 12, lineHeight: "1.6", color: brand.muted }}>
              Simple Solution OG · Salzgasse 2, 5400 Hallein, Österreich<br />
              info@rapid-remove.com · rapid-remove.com
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
    <Section style={{ background: brand.noteBg, border: `1px solid ${brand.noteBorder}`, borderRadius: 10, padding: "14px 18px", margin: "8px 0 16px" }}>
      <Text style={{ margin: 0, fontSize: 14, lineHeight: "1.55", color: brand.text }}>{children}</Text>
    </Section>
  );
}

export function CtaButton({ href, children, full = false }: { href: string; children: React.ReactNode; full?: boolean }) {
  return (
    <REButton
      href={href}
      style={{ background: brand.accent, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 8, textDecoration: "none", display: "inline-block", textAlign: "center", ...(full ? { width: "100%" } : {}) }}
    >
      {children}
    </REButton>
  );
}
