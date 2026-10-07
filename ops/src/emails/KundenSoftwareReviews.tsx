/* Mail bei „nur mit Spezial-Software löschbar" (Einzelbewertungen): bewusst OHNE Details –
   nur „gute Nachricht, es gibt ein Update" + Button ins Dashboard. Alles Weitere (welche Bewertungen,
   Preis, zahlen oder ablehnen) sieht und entscheidet der Kunde im Dashboard (→ Login-/Klick-Daten). */
import * as React from "react";
import { EmailShell, P, CtaButton, brand, type MailLang } from "./components";

interface L { subject: string; title: string; hi: (n: string) => string; p: (order: string) => string; p2: string; btn: string; close: string; signoff: string }

const T: Record<string, L> = {
  en: { subject: "Good news – there's an update on your order", title: "Good news!", hi: (n) => (n ? `Hi ${n},` : "Hi there,"), p: (o) => `there's an update on your order${o}.`, p2: "Log in to your dashboard to see the details.", btn: "Open my dashboard", close: "Questions? Just reply to this email.", signoff: "Warm regards," },
  de: { subject: "Gute Nachrichten – es gibt ein Update zu Ihrem Auftrag", title: "Gute Nachrichten!", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"), p: (o) => `es gibt ein Update zu Ihrem Auftrag${o}.`, p2: "Alle Details finden Sie in Ihrem Dashboard.", btn: "Mein Dashboard öffnen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen," },
  es: { subject: "Buenas noticias: hay novedades sobre tu pedido", title: "¡Buenas noticias!", hi: (n) => (n ? `Hola ${n}:` : "Hola:"), p: (o) => `hay novedades sobre tu pedido${o}.`, p2: "Entra en tu panel para ver los detalles.", btn: "Abrir mi panel", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo," },
  fr: { subject: "Bonne nouvelle – il y a du nouveau sur ta commande", title: "Bonne nouvelle !", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"), p: (o) => `il y a du nouveau sur ta commande${o}.`, p2: "Connecte-toi à ton tableau de bord pour voir les détails.", btn: "Ouvrir mon tableau de bord", close: "Une question ? Réponds simplement à cet e-mail.", signoff: "Bien à toi," },
  it: { subject: "Buone notizie – c'è un aggiornamento sul tuo ordine", title: "Buone notizie!", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"), p: (o) => `c'è un aggiornamento sul tuo ordine${o}.`, p2: "Accedi alla tua dashboard per vedere i dettagli.", btn: "Apri la mia dashboard", close: "Domande? Rispondi a questa e-mail.", signoff: "Un caro saluto," },
  nl: { subject: "Goed nieuws – er is een update over uw bestelling", title: "Goed nieuws!", hi: (n) => (n ? `Beste ${n},` : "Hallo,"), p: (o) => `er is een update over uw bestelling${o}.`, p2: "Log in op uw dashboard om de details te bekijken.", btn: "Mijn dashboard openen", close: "Vragen? Antwoord gewoon op deze e-mail.", signoff: "Met vriendelijke groet," },
  pt: { subject: "Boas notícias – há novidades sobre a tua encomenda", title: "Boas notícias!", hi: (n) => (n ? `Olá ${n},` : "Olá,"), p: (o) => `há novidades sobre a tua encomenda${o}.`, p2: "Entra no teu painel para ver os detalhes.", btn: "Abrir o meu painel", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos," },
  ja: { subject: "朗報です – ご注文に更新があります", title: "朗報です！", hi: (n) => (n ? `${n} 様` : "こんにちは。"), p: (o) => `ご注文${o}に更新があります。`, p2: "詳細はダッシュボードにログインしてご確認ください。", btn: "ダッシュボードを開く", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。" },
  sv: { subject: "Goda nyheter – det finns en uppdatering om din beställning", title: "Goda nyheter!", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: (o) => `det finns en uppdatering om din beställning${o}.`, p2: "Logga in i din dashboard för att se detaljerna.", btn: "Öppna min dashboard", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar," },
  da: { subject: "Gode nyheder – der er en opdatering på din ordre", title: "Gode nyheder!", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: (o) => `der er en opdatering på din ordre${o}.`, p2: "Log ind på dit dashboard for at se detaljerne.", btn: "Åbn mit dashboard", close: "Spørgsmål? Svar bare på denne mail.", signoff: "Venlig hilsen," },
  no: { subject: "Gode nyheter – det er en oppdatering på bestillingen din", title: "Gode nyheter!", hi: (n) => (n ? `Hei ${n},` : "Hei,"), p: (o) => `det er en oppdatering på bestillingen din${o}.`, p2: "Logg inn på dashbordet ditt for å se detaljene.", btn: "Åpne dashbordet mitt", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen," },
};

export interface KundenSoftwareProps { lang?: string; name?: string; dashUrl: string; orderId?: string }
const tOf = (lang?: string) => T[lang && T[lang] ? lang : "en"];
export const kundenSoftwareSubject = (p: KundenSoftwareProps) => tOf(p.lang).subject;

export default function KundenSoftwareReviews({ lang = "en", name = "", dashUrl, orderId }: KundenSoftwareProps) {
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const order = orderId ? ` #${orderId}` : "";
  return (
    <EmailShell preview={t.subject} title={t.title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      <P>{t.p(order)}</P>
      <P>{t.p2}</P>
      <div style={{ textAlign: "center", margin: "14px 0 22px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <P><span style={{ color: brand.muted }}>{t.close}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
