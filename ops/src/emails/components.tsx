/* Gemeinsame Bausteine + Markentokens für alle RapidRemove-E-Mails.
   Design = Kunden-App (Uber/Revolut-Stil): heller grauer Rahmen, weiße Karte mit großen Radien,
   App-Icon + Wortmarke, große fette Headline (Geist), schwarze Buttons; Orange nur für Bezahlen
   und Hinweise auf Probleme. Alle Templates nutzen <EmailShell> + diese Tokens → Re-Skin an EINER Stelle. */
import * as React from "react";
import {
  Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text, Button as REButton,
} from "@react-email/components";

export const brand = {
  page: "#f4f4f4",        // grauer Rahmen (App: --g1)
  card: "#ffffff",
  ink: "#111111",         // App-Ink (Headlines, Buttons)
  text: "#2b2b2b",
  muted: "#6b6b6b",       // App: --g3
  accent: "#ff8000",      // Orange: Bezahlen, Links, Probleme
  accentDark: "#e67300",
  tint: "#f4f4f4",        // graue Karte (Callouts/Boxen)
  tintBorder: "#f4f4f4",
  tintText: "#111111",
  danger: "#e23b3b",      // Storno/Warnung
  dangerTint: "#fdecec",
  dangerBorder: "#fdecec",
  dangerText: "#a12626",
  hr: "#ececec",          // Hairline
  font: "'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};
const SITE = "https://www.rapid-remove.com";

const PHONE = "+4362459305300";
const HELPDESK = "helpdesk@rapid-remove.com";

export type MailLang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";

export function EmailShell({
  preview, title, lang = "de", children,
}: { preview: string; title: string; lang?: MailLang; children: React.ReactNode }) {
  return (
    <Html lang={lang}>
      <Head>
        {/* Immer im hellen Design anzeigen – iOS Mail färbt sonst um (schwarzer Button auf dunkler Karte). */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
        <style>{`:root{color-scheme:light only;supported-color-schemes:light only}`}</style>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, background: brand.page, fontFamily: brand.font, color: brand.text, padding: "28px 12px" }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", background: brand.card, borderRadius: 24, overflow: "hidden" }}>
          {/* Header: App-Icon + Wortmarke */}
          <Section style={{ padding: "26px 32px 0" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}><tbody><tr>
              <td style={{ verticalAlign: "middle", paddingRight: 10 }}>
                <Img src={`${SITE}/assets/rapidremove-icon.png`} width="32" height="32" alt="" style={{ borderRadius: 9, display: "block" }} />
              </td>
              <td style={{ verticalAlign: "middle", fontFamily: brand.font, fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px", color: brand.ink }}>RapidRemove</td>
            </tr></tbody></table>
          </Section>
          {/* Inhalt */}
          <Section style={{ padding: "22px 32px 30px" }}>
            <Heading as="h1" style={{ margin: "0 0 14px", fontSize: 30, lineHeight: "1.12", fontWeight: 800, letterSpacing: "-0.8px", color: brand.ink }}>
              {title}
            </Heading>
            {children}
          </Section>
        </Container>
        {/* Footer unter der Karte */}
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>
          <Section style={{ padding: "18px 32px 6px" }}>
            <Text style={{ margin: 0, fontSize: 12, lineHeight: "1.6", color: brand.muted, textAlign: "center" as const }}>
              <strong style={{ color: brand.text }}>RapidRemove</strong> · Simple Solution. OG<br />
              Salzgasse 2, 5400 Hallein, Österreich · helpdesk@rapid-remove.com · rapid-remove.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function P({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <Text style={{ fontSize: 16, lineHeight: "1.55", margin: "0 0 12px", color: muted ? brand.muted : brand.text }}>
      {children}
    </Text>
  );
}

/** Inline-Link in Markenfarbe. */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: brand.ink, textDecoration: "underline" }}>{children}</a>;
}

/** Orange getönte Hinweis-/Callout-Box (Wichtig, Einspruch …). */
export function NoteBox({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ background: brand.tint, borderRadius: 20, padding: "16px 18px", margin: "6px 0 16px" }}>
      <Text style={{ margin: 0, fontSize: 15, lineHeight: "1.55", color: brand.text }}>{children}</Text>
    </Section>
  );
}

/** Rot getönte Warnbox (Schutz deaktiviert, Profil kann wieder auftauchen …). */
export function DangerBox({ children }: { children: React.ReactNode }) {
  return (
    <Section style={{ background: brand.dangerTint, borderRadius: 20, padding: "16px 18px", margin: "6px 0 16px" }}>
      <Text style={{ margin: 0, fontSize: 15, lineHeight: "1.55", color: brand.dangerText }}>{children}</Text>
    </Section>
  );
}

/** App-Button (56 px, Radius 16). variant: primary (schwarz) · pay (orange, Bezahlen) · secondary (grau) · danger (rot). */
export function CtaButton({
  href, children, full = false, variant = "primary",
}: { href: string; children: React.ReactNode; full?: boolean; variant?: "primary" | "pay" | "secondary" | "danger" }) {
  const v = {
    primary: { background: brand.ink, color: "#ffffff" },
    pay: { background: brand.accent, color: "#ffffff" },
    secondary: { background: brand.page, color: brand.ink },
    danger: { background: brand.danger, color: "#ffffff" },
  }[variant];
  return (
    <REButton
      href={href}
      style={{ ...v, fontWeight: 700, fontSize: 16, padding: "17px 30px", borderRadius: 16, textDecoration: "none", display: "inline-block", textAlign: "center", ...(full ? { width: "100%", boxSizing: "border-box" } : {}) }}
    >
      {children}
    </REButton>
  );
}

/** Aufzählung mit orangefarbenen Punkten. */
export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <Section style={{ margin: "0 0 14px" }}>
      {items.map((it, i) => (
        <Text key={i} style={{ margin: "0 0 7px", fontSize: 15, lineHeight: "1.5", color: brand.text }}>
          <span style={{ color: brand.ink, fontWeight: 800 }}>•</span>&nbsp;&nbsp;{it}
        </Text>
      ))}
    </Section>
  );
}

/** Nummerierte Schritte mit orangefarbener Zahl. */
export function Steps({ items }: { items: React.ReactNode[] }) {
  return (
    <Section style={{ margin: "0 0 14px" }}>
      {items.map((it, i) => (
        <Text key={i} style={{ margin: "0 0 7px", fontSize: 15, lineHeight: "1.5", color: brand.text }}>
          <strong style={{ color: brand.ink }}>{i + 1}.</strong>&nbsp;&nbsp;{it}
        </Text>
      ))}
    </Section>
  );
}

/** Dekorative Gutschein-Karte (kein externes Bild → bricht nie). */
export function GiftCard({ amount }: { amount: string }) {
  return (
    <Section style={{ margin: "8px 0 16px" }}>
      <div style={{ width: 260, margin: "0 auto", background: brand.ink, borderRadius: 14, padding: "26px 22px", textAlign: "center" as const }}>
        <Text style={{ margin: 0, color: "#ffffff", fontSize: 13, letterSpacing: "0.06em" }}>amazon.de · GIFT CARD</Text>
        <Text style={{ margin: "10px 0 0", color: brand.accent, fontSize: 42, fontWeight: 800, lineHeight: 1 }}>{amount}</Text>
      </div>
    </Section>
  );
}

/** Support-Footer im Inhalt: „Fragen? Wir sind für Sie da!“
    phone=true → Telefonzeile · chat=true → Chat-Button. */
export function Support({
  lang = "de", phone = false, chat = false, chatUrl = "https://www.rapid-remove.com",
}: { lang?: MailLang; phone?: boolean; chat?: boolean; chatUrl?: string }) {
  const tel = <A href={`tel:${PHONE}`}>{PHONE}</A>;
  const mailA = <A href={`mailto:${HELPDESK}`}>{HELPDESK}</A>;
  const TS = {
    de: { h: "Fragen? Wir sind für Sie da!", phone: <>Von Montag–Freitag erreichen Sie uns von 08.00–18.00 Uhr telefonisch unter {tel} und jederzeit per E-Mail unter {mailA}.</>, mail: <>Sie erreichen uns jederzeit per E-Mail unter {mailA}.</>, chat: "Mit uns chatten" },
    en: { h: "Questions? We're here for you!", phone: <>Mon–Fri you can reach us by phone from 08:00–18:00 at {tel} and anytime by email at {mailA}.</>, mail: <>You can reach us anytime by email at {mailA}.</>, chat: "Chat with us" },
    es: { h: "¿Preguntas? ¡Estamos aquí para ayudarte!", phone: <>De lunes a viernes puede llamarnos de 08:00 a 18:00 al {tel} y escribirnos en cualquier momento por correo a {mailA}.</>, mail: <>Puede escribirnos en cualquier momento por correo a {mailA}.</>, chat: "Chatea con nosotros" },
    fr: { h: "Des questions ? Nous sommes là pour vous !", phone: <>Du lundi au vendredi, joignez-nous par téléphone de 08h00 à 18h00 au {tel} et à tout moment par e-mail à {mailA}.</>, mail: <>Vous pouvez nous joindre à tout moment par e-mail à {mailA}.</>, chat: "Discuter avec nous" },
    it: { h: "Domande? Siamo qui per te!", phone: <>Dal lunedì al venerdì siamo raggiungibili telefonicamente dalle 08:00 alle 18:00 al {tel} e in qualsiasi momento via e-mail all'indirizzo {mailA}.</>, mail: <>Puoi contattarci in qualsiasi momento via e-mail all'indirizzo {mailA}.</>, chat: "Chatta con noi" },
    nl: { h: "Vragen? We staan voor u klaar!", phone: <>Van maandag t/m vrijdag bereikt u ons telefonisch van 08.00–18.00 uur op {tel} en altijd per e-mail via {mailA}.</>, mail: <>U kunt ons altijd per e-mail bereiken via {mailA}.</>, chat: "Chat met ons" },
    pt: { h: "Dúvidas? Estamos aqui para si!", phone: <>De segunda a sexta pode contactar-nos por telefone das 08:00 às 18:00 através do {tel} e a qualquer momento por e-mail em {mailA}.</>, mail: <>Pode contactar-nos a qualquer momento por e-mail em {mailA}.</>, chat: "Fale connosco no chat" },
    ja: { h: "ご不明な点はありますか?お気軽にどうぞ!", phone: <>月〜金の08:00〜18:00は {tel} までお電話で、メールは {mailA} までいつでもご連絡いただけます。</>, mail: <>メールは {mailA} までいつでもご連絡いただけます。</>, chat: "チャットで相談" },
    sv: { h: "Frågor? Vi finns här för dig!", phone: <>Måndag–fredag når du oss på telefon 08:00–18:00 på {tel} och när som helst via e-post på {mailA}.</>, mail: <>Du når oss när som helst via e-post på {mailA}.</>, chat: "Chatta med oss" },
    da: { h: "Spørgsmål? Vi er her for dig!", phone: <>Mandag–fredag kan du ringe til os fra 08:00–18:00 på {tel} og altid skrive til os på {mailA}.</>, mail: <>Du kan altid skrive til os på {mailA}.</>, chat: "Chat med os" },
    no: { h: "Spørsmål? Vi er her for deg!", phone: <>Mandag–fredag når du oss på telefon 08:00–18:00 på {tel} og når som helst på e-post på {mailA}.</>, mail: <>Du kan alltid nå oss på e-post på {mailA}.</>, chat: "Chat med oss" },
  };
  const t = TS[lang] || TS.de;
  return (
    <>
      <Hr style={{ borderColor: brand.hr, margin: "22px 0 14px" }} />
      <Heading as="h2" style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px", color: brand.ink }}>
        {t.h}
      </Heading>
      <P muted>{phone ? t.phone : t.mail}</P>
      {chat ? (
        <Section style={{ margin: "10px 0 2px" }}>
          <CtaButton href={chatUrl} variant="secondary" full>{t.chat}</CtaButton>
        </Section>
      ) : null}
    </>
  );
}
