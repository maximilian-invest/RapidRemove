/* Zahlungsbestätigung (Einzelbewertungen) für Wise-/PayPal-Zahler – geht automatisch raus, sobald der Auftrag
   im Admin „Als bezahlt markieren" wurde (Stripe-Zahler bekommen ihre Bestätigung von Stripe). */
import * as React from "react";
import { EmailShell, P, NoteBox, CtaButton, type MailLang } from "./components";

interface L { subject: string; title: string; hi: (n: string) => string; p: (via: string, id: string) => string; pm: (via: string, ids: string) => string; note: string; btn: string; close: string; signoff: string }
const T: Record<MailLang, L> = {
  en: { pm: (v, id) => `we've received your ${v} payment for orders ${id}. Thank you!`, subject: "Payment received – thank you!", title: "Payment received", hi: (n) => (n ? `Hi ${n},` : "Hi there,"), p: (v, id) => `we've received your ${v} payment for order ${id}. Thank you!`, note: "Your removed reviews are now fully paid. You can see everything in your dashboard at any time.", btn: "Open my dashboard", close: "Questions? Just reply to this email.", signoff: "Warm regards," },
  de: { pm: (v, id) => `wir haben Ihre Zahlung per ${v} für die Aufträge ${id} erhalten. Vielen Dank!`, subject: "Zahlung erhalten – vielen Dank!", title: "Zahlung erhalten", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"), p: (v, id) => `wir haben Ihre Zahlung per ${v} für den Auftrag ${id} erhalten. Vielen Dank!`, note: "Ihre gelöschten Bewertungen sind damit vollständig bezahlt. Alles sehen Sie jederzeit in Ihrem Dashboard.", btn: "Mein Dashboard öffnen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen," },
  es: { pm: (v, id) => `hemos recibido tu pago por ${v} de los pedidos ${id}. ¡Gracias!`, subject: "Pago recibido: ¡gracias!", title: "Pago recibido", hi: (n) => (n ? `Hola ${n}:` : "Hola:"), p: (v, id) => `hemos recibido tu pago por ${v} del pedido ${id}. ¡Gracias!`, note: "Tus reseñas eliminadas ya están pagadas por completo. Puedes verlo todo en tu panel en cualquier momento.", btn: "Abrir mi panel", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo," },
  fr: { pm: (v, id) => `nous avons bien reçu ton paiement ${v} pour les commandes ${id}. Merci !`, subject: "Paiement reçu – merci !", title: "Paiement reçu", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"), p: (v, id) => `nous avons bien reçu ton paiement ${v} pour la commande ${id}. Merci !`, note: "Tes avis supprimés sont maintenant entièrement payés. Tu retrouves tout à tout moment dans ton tableau de bord.", btn: "Ouvrir mon tableau de bord", close: "Une question ? Réponds simplement à cet e-mail.", signoff: "Bien à toi," },
  it: { pm: (v, id) => `abbiamo ricevuto il tuo pagamento ${v} per gli ordini ${id}. Grazie!`, subject: "Pagamento ricevuto – grazie!", title: "Pagamento ricevuto", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"), p: (v, id) => `abbiamo ricevuto il tuo pagamento ${v} per l’ordine ${id}. Grazie!`, note: "Le recensioni rimosse sono ora interamente pagate. Puoi vedere tutto nella tua dashboard in qualsiasi momento.", btn: "Apri la mia dashboard", close: "Domande? Rispondi a questa e-mail.", signoff: "Un caro saluto," },
  nl: { pm: (v, id) => `we hebben uw ${v}-betaling voor de bestellingen ${id} ontvangen. Bedankt!`, subject: "Betaling ontvangen – bedankt!", title: "Betaling ontvangen", hi: (n) => (n ? `Beste ${n},` : "Hallo,"), p: (v, id) => `we hebben uw ${v}-betaling voor bestelling ${id} ontvangen. Bedankt!`, note: "Uw verwijderde reviews zijn nu volledig betaald. U ziet alles altijd in uw dashboard.", btn: "Mijn dashboard openen", close: "Vragen? Antwoord gewoon op deze e-mail.", signoff: "Met vriendelijke groet," },
  pt: { pm: (v, id) => `recebemos o teu pagamento por ${v} das encomendas ${id}. Obrigado!`, subject: "Pagamento recebido – obrigado!", title: "Pagamento recebido", hi: (n) => (n ? `Olá ${n},` : "Olá,"), p: (v, id) => `recebemos o teu pagamento por ${v} da encomenda ${id}. Obrigado!`, note: "As tuas avaliações removidas estão agora totalmente pagas. Vês tudo no teu painel a qualquer momento.", btn: "Abrir o meu painel", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos," },
  ja: { pm: (v, id) => `ご注文 ${id} の${v}でのお支払いを確認いたしました。ありがとうございます。`, subject: "お支払いを確認しました – ありがとうございます", title: "お支払いを確認しました", hi: (n) => (n ? `${n} 様` : "こんにちは。"), p: (v, id) => `ご注文 ${id} の${v}でのお支払いを確認いたしました。ありがとうございます。`, note: "削除済みの口コミのお支払いはすべて完了しました。ダッシュボードでいつでもご確認いただけます。", btn: "ダッシュボードを開く", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。" },
  sv: { pm: (v, id) => `vi har fått din betalning via ${v} för beställningarna ${id}. Tack!`, subject: "Betalning mottagen – tack!", title: "Betalning mottagen", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: (v, id) => `vi har fått din betalning via ${v} för beställning ${id}. Tack!`, note: "Dina borttagna omdömen är nu helt betalda. Du ser allt i din dashboard när som helst.", btn: "Öppna min dashboard", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar," },
  da: { pm: (v, id) => `vi har modtaget din betaling via ${v} for ordrerne ${id}. Tak!`, subject: "Betaling modtaget – tak!", title: "Betaling modtaget", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: (v, id) => `vi har modtaget din betaling via ${v} for ordre ${id}. Tak!`, note: "Dine fjernede anmeldelser er nu fuldt betalt. Du kan altid se det hele i dit dashboard.", btn: "Åbn mit dashboard", close: "Spørgsmål? Svar bare på denne mail.", signoff: "Venlig hilsen," },
  no: { pm: (v, id) => `vi har mottatt betalingen din via ${v} for bestillingene ${id}. Takk!`, subject: "Betaling mottatt – takk!", title: "Betaling mottatt", hi: (n) => (n ? `Hei ${n},` : "Hei,"), p: (v, id) => `vi har mottatt betalingen din via ${v} for bestilling ${id}. Takk!`, note: "De fjernede omtalene dine er nå fullt betalt. Du ser alt i dashbordet når som helst.", btn: "Åpne dashbordet mitt", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen," },
};
export interface ZahlungErhaltenProps { lang?: string; name?: string; via: "Wise" | "PayPal"; orderId: string; orderIds?: string[]; dashUrl: string }
const tOf = (l?: string) => T[(l && (T as Record<string, L>)[l] ? l : "en") as MailLang];
export const zahlungErhaltenSubject = (p: ZahlungErhaltenProps) => tOf(p.lang).subject;
export default function ZahlungErhaltenReviews(p: ZahlungErhaltenProps) {
  const l = (p.lang && (T as Record<string, L>)[p.lang] ? p.lang : "en") as MailLang;
  const t = T[l];
  return (
    <EmailShell preview={t.subject} title={t.title} lang={l}>
      <P><strong>{t.hi((p.name || "").trim())}</strong></P>
      <P>{p.orderIds && p.orderIds.length > 1 ? t.pm(p.via, p.orderIds.join(", ")) : t.p(p.via, p.orderId)}</P>
      <NoteBox>{t.note}</NoteBox>
      <div style={{ textAlign: "center", margin: "10px 0 20px" }}><CtaButton href={p.dashUrl}>{t.btn}</CtaButton></div>
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
