/* Template: Auftrag wieder aktiviert / Order reactivated (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface ReaktivierungProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; portalUrl?: string; }

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
  es: {
    title: "Pedido reactivado ✓",
    preview: "Su pedido se ha reactivado: retomamos su tramitación.",
    greeting: "Estimados señores:",
    p1a: "buenas noticias: su pedido se ha ",
    p1Bold: "reactivado",
    p1b: ". Retomamos su tramitación de inmediato y le informaremos con la próxima actualización de estado.",
    p2: "No tiene que hacer nada más. Si tiene cualquier duda, estamos siempre a su disposición.",
    cta: "Ir al portal de clientes",
    subject: "Su pedido se ha reactivado",
  },
  fr: {
    title: "Commande réactivée ✓",
    preview: "Votre commande a été réactivée : nous reprenons son traitement.",
    greeting: "Madame, Monsieur,",
    p1a: "bonne nouvelle : votre commande a été ",
    p1Bold: "réactivée",
    p1b: ". Nous reprenons son traitement dès à présent et reviendrons vers vous avec la prochaine mise à jour de statut.",
    p2: "Vous n'avez rien d'autre à faire. Pour toute question, nous restons à votre entière disposition.",
    cta: "Accéder à l'espace client",
    subject: "Votre commande a été réactivée",
  },
  it: {
    title: "Ordine riattivato ✓",
    preview: "Il suo ordine è stato riattivato: riprendiamo la lavorazione.",
    greeting: "Gentili Signore e Signori,",
    p1a: "buone notizie: il suo ordine è stato ",
    p1Bold: "riattivato",
    p1b: ". Riprendiamo subito la lavorazione e la ricontatteremo con il prossimo aggiornamento di stato.",
    p2: "Non deve fare nient'altro. Per qualsiasi domanda siamo sempre a sua disposizione.",
    cta: "Vai all'area clienti",
    subject: "Il suo ordine è stato riattivato",
  },
  nl: {
    title: "Opdracht opnieuw geactiveerd ✓",
    preview: "Uw opdracht is opnieuw geactiveerd – wij hervatten de verwerking.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "goed nieuws: uw opdracht is ",
    p1Bold: "opnieuw geactiveerd",
    p1b: ". Wij hervatten de verwerking direct en nemen contact met u op zodra er een statusupdate is.",
    p2: "U hoeft verder niets te doen. Heeft u vragen, dan staan wij altijd voor u klaar.",
    cta: "Naar het klantenportaal",
    subject: "Uw opdracht is opnieuw geactiveerd",
  },
  pt: {
    title: "Encomenda reativada ✓",
    preview: "A sua encomenda foi reativada – retomamos o respetivo processamento.",
    greeting: "Exmos. Senhores,",
    p1a: "boas notícias: a sua encomenda foi ",
    p1Bold: "reativada",
    p1b: ". Retomamos o processamento de imediato e entraremos em contacto com a próxima atualização de estado.",
    p2: "Não precisa de fazer mais nada. Em caso de dúvidas, estamos sempre ao seu dispor.",
    cta: "Ir para o portal do cliente",
    subject: "A sua encomenda foi reativada",
  },
  ja: {
    title: "注文を再開しました ✓",
    preview: "お客様の注文が再開されました。処理を再開いたします。",
    greeting: "ご担当者様",
    p1a: "よいお知らせです。お客様の注文が",
    p1Bold: "再開されました",
    p1b: "。直ちに処理を再開し、次のステータス更新の際にあらためてご連絡いたします。",
    p2: "お客様に追加でご対応いただくことはございません。ご不明な点がございましたら、いつでもお気軽にお問い合わせください。",
    cta: "カスタマーポータルへ",
    subject: "お客様の注文が再開されました",
  },
  sv: {
    title: "Beställningen återaktiverad ✓",
    preview: "Din beställning har återaktiverats – vi återupptar handläggningen.",
    greeting: "Hej,",
    p1a: "goda nyheter: din beställning har ",
    p1Bold: "återaktiverats",
    p1b: ". Vi återupptar handläggningen omgående och hör av oss med nästa statusuppdatering.",
    p2: "Du behöver inte göra något mer. Har du några frågor finns vi alltid här för dig.",
    cta: "Till kundportalen",
    subject: "Din beställning har återaktiverats",
  },
  da: {
    title: "Ordren er genaktiveret ✓",
    preview: "Din ordre er blevet genaktiveret – vi genoptager behandlingen.",
    greeting: "Kære kunde,",
    p1a: "godt nyt: din ordre er blevet ",
    p1Bold: "genaktiveret",
    p1b: ". Vi genoptager behandlingen med det samme og vender tilbage med den næste statusopdatering.",
    p2: "Du skal ikke foretage dig yderligere. Har du spørgsmål, står vi altid til rådighed.",
    cta: "Til kundeportalen",
    subject: "Din ordre er blevet genaktiveret",
  },
  no: {
    title: "Bestillingen er reaktivert ✓",
    preview: "Bestillingen din er reaktivert – vi gjenopptar behandlingen.",
    greeting: "Hei,",
    p1a: "gode nyheter: bestillingen din er blitt ",
    p1Bold: "reaktivert",
    p1b: ". Vi gjenopptar behandlingen umiddelbart og tar kontakt med neste statusoppdatering.",
    p2: "Du trenger ikke å gjøre noe mer. Har du spørsmål, er vi alltid her for deg.",
    cta: "Til kundeportalen",
    subject: "Bestillingen din er blitt reaktivert",
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
