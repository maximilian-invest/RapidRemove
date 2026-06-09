/* Template: Auftrag wieder aktiviert / Order reactivated (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface ReaktivierungProps { lang?: "de" | "en"; portalUrl?: string; }

const T = {
  de: {
    title: "Auftrag wieder aktiviert ✓",
    preview: "Ihr Auftrag wurde wieder aktiviert – wir setzen die Bearbeitung fort.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "gute Nachrichten: Ihr Auftrag wurde ",
    p1Bold: "wieder aktiviert",
    p1b: ". Wir setzen die Bearbeitung ab sofort fort und melden uns mit dem nächsten Status-Update bei Ihnen.",
    p2: "Sie müssen nichts weiter tun. Bei Fragen sind wir jederzeit für Sie da.",
    cta: "Zum Kundenportal",
    subject: "Ihr Auftrag wurde wieder aktiviert",
  },
  en: {
    title: "Order Reactivated ✓",
    preview: "Your order has been reactivated – we are resuming processing.",
    greeting: "Dear Sir or Madam,",
    p1a: "good news: your order has been ",
    p1Bold: "reactivated",
    p1b: ". We are resuming processing right away and will be in touch with the next status update.",
    p2: "There is nothing further you need to do. If you have any questions, we are always here to help.",
    cta: "Go to Customer Portal",
    subject: "Your order has been reactivated",
  },
};

export function subject(p: ReaktivierungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Reaktivierung({ lang = "de", portalUrl = "https://rapid-remove.com" }: ReaktivierungProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong>{t.p1b}</P>
      <P>{t.p2}</P>
      <Section style={{ margin: "18px 0 6px" }}>
        <CtaButton href={portalUrl} full>{t.cta}</CtaButton>
      </Section>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
