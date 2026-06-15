/* Template: Neues Abo – Schutz aktiviert / Protection activated (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface NeuesAboProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; portalUrl?: string; }

const T = {
  de: {
    title: "Schutz aktiviert ✓",
    preview: "Der Schutz Ihres Google-Unternehmensprofils ist nun aktiviert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre Zahlung. Der ",
    p1Bold: "Schutz",
    p1b: " Ihres Google-Unternehmensprofils ist nun ",
    p1Bold2: "aktiviert.",
    p1c: " Sie können Ihre Rechnungsdaten jederzeit im Kundenportal bearbeiten oder den Schutz auf Wunsch deaktivieren.",
    cta: "Zum Kundenportal",
    subject: "Schutz aktiviert",
  },
  en: {
    title: "Protection Activated ✓",
    preview: "The protection for your Google Business Profile is now activated.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your payment. The ",
    p1Bold: "protection",
    p1b: " for your Google Business Profile is ",
    p1Bold2: "now activated.",
    p1c: " You can edit your billing information at any time through the customer portal or deactivate the protection if desired.",
    cta: "Go to Customer Portal",
    subject: "Protection activated",
  },
  es: {
    title: "Protección activada ✓",
    preview: "La protección de su perfil de empresa de Google ya está activada.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su pago. La ",
    p1Bold: "protección",
    p1b: " de su perfil de empresa de Google ya está ",
    p1Bold2: "activada.",
    p1c: " Puede modificar sus datos de facturación en cualquier momento desde el portal de clientes o desactivar la protección si lo desea.",
    cta: "Ir al portal de clientes",
    subject: "Protección activada",
  },
  fr: {
    title: "Protection activée ✓",
    preview: "La protection de votre fiche d'établissement Google est désormais activée.",
    greeting: "Madame, Monsieur,",
    p1a: "merci beaucoup pour votre paiement. La ",
    p1Bold: "protection",
    p1b: " de votre fiche d'établissement Google est désormais ",
    p1Bold2: "activée.",
    p1c: " Vous pouvez modifier vos informations de facturation à tout moment depuis l'espace client ou désactiver la protection si vous le souhaitez.",
    cta: "Accéder à l'espace client",
    subject: "Protection activée",
  },
  it: {
    title: "Protezione attivata ✓",
    preview: "La protezione del suo profilo dell'attività su Google è ora attiva.",
    greeting: "Gentili Signore e Signori,",
    p1a: "grazie per il suo pagamento. La ",
    p1Bold: "protezione",
    p1b: " del suo profilo dell'attività su Google è ora ",
    p1Bold2: "attiva.",
    p1c: " Può modificare i suoi dati di fatturazione in qualsiasi momento dall'area clienti oppure disattivare la protezione, se lo desidera.",
    cta: "Vai all'area clienti",
    subject: "Protezione attivata",
  },
  nl: {
    title: "Bescherming geactiveerd ✓",
    preview: "De bescherming van uw Google-bedrijfsprofiel is nu geactiveerd.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw betaling. De ",
    p1Bold: "bescherming",
    p1b: " van uw Google-bedrijfsprofiel is nu ",
    p1Bold2: "geactiveerd.",
    p1c: " U kunt uw factuurgegevens op elk moment in het klantenportaal aanpassen of de bescherming desgewenst deactiveren.",
    cta: "Naar het klantenportaal",
    subject: "Bescherming geactiveerd",
  },
  pt: {
    title: "Proteção ativada ✓",
    preview: "A proteção do seu perfil de empresa do Google está agora ativada.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pelo seu pagamento. A ",
    p1Bold: "proteção",
    p1b: " do seu perfil de empresa do Google está agora ",
    p1Bold2: "ativada.",
    p1c: " Pode editar os seus dados de faturação a qualquer momento no portal do cliente ou desativar a proteção, se assim o desejar.",
    cta: "Ir para o portal do cliente",
    subject: "Proteção ativada",
  },
  ja: {
    title: "保護を有効化しました ✓",
    preview: "お客様のGoogleビジネスプロフィールの保護が有効になりました。",
    greeting: "ご担当者様",
    p1a: "お支払いいただきありがとうございます。お客様のGoogleビジネスプロフィールの",
    p1Bold: "保護",
    p1b: "が",
    p1Bold2: "有効になりました。",
    p1c: " お客様はカスタマーポータルからいつでもご請求情報を編集でき、ご希望に応じて保護を無効にすることもできます。",
    cta: "カスタマーポータルへ",
    subject: "保護を有効化しました",
  },
  sv: {
    title: "Skydd aktiverat ✓",
    preview: "Skyddet för din Google-företagsprofil är nu aktiverat.",
    greeting: "Hej,",
    p1a: "tack för din betalning. ",
    p1Bold: "Skyddet",
    p1b: " för din Google-företagsprofil är nu ",
    p1Bold2: "aktiverat.",
    p1c: " Du kan när som helst ändra dina faktureringsuppgifter i kundportalen eller avaktivera skyddet om du vill.",
    cta: "Till kundportalen",
    subject: "Skydd aktiverat",
  },
  da: {
    title: "Beskyttelse aktiveret ✓",
    preview: "Beskyttelsen af din Google-virksomhedsprofil er nu aktiveret.",
    greeting: "Kære kunde,",
    p1a: "mange tak for din betaling. ",
    p1Bold: "Beskyttelsen",
    p1b: " af din Google-virksomhedsprofil er nu ",
    p1Bold2: "aktiveret.",
    p1c: " Du kan til enhver tid redigere dine faktureringsoplysninger i kundeportalen eller deaktivere beskyttelsen, hvis du ønsker det.",
    cta: "Til kundeportalen",
    subject: "Beskyttelse aktiveret",
  },
  no: {
    title: "Beskyttelse aktivert ✓",
    preview: "Beskyttelsen av Google-bedriftsprofilen din er nå aktivert.",
    greeting: "Hei,",
    p1a: "tusen takk for betalingen din. ",
    p1Bold: "Beskyttelsen",
    p1b: " av Google-bedriftsprofilen din er nå ",
    p1Bold2: "aktivert.",
    p1c: " Du kan når som helst redigere faktureringsopplysningene dine i kundeportalen eller deaktivere beskyttelsen om du ønsker det.",
    cta: "Til kundeportalen",
    subject: "Beskyttelse aktivert",
  },
};

export function subject(p: NeuesAboProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function NeuesAbo({ lang = "de", portalUrl = "https://www.rapid-remove.com" }: NeuesAboProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong>{t.p1b}<strong>{t.p1Bold2}</strong>{t.p1c}</P>
      <Section style={{ margin: "18px 0 6px" }}>
        <CtaButton href={portalUrl} full>{t.cta}</CtaButton>
      </Section>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
