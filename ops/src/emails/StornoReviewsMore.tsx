/* Template: Storno „Einzelne Bewertungen löschen" — auf Kundenwunsch bzw. keine Rückmeldung.
   Aus dem Admin (Auftrag stornieren). Gleicher Aufbau wie StornoReviewsAll: deutsche Fassung
   in Sie-Form, übrige Sprachen im „du"-Ton. Bereits bezahlte Löschungen bleiben bezahlt –
   deshalb „keine weiteren Kosten". 11 Sprachen, im Admin bearbeitbar (zwei Schlüssel). */
import * as React from "react";
import { DashButton } from "./DashBox";
import { EmailShell, P, NoteBox, brand, type MailLang } from "./components";

export interface StornoReviewsMoreProps {
  lang?: MailLang;
  name?: string;
  orderId?: string;
  dashUrl?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: string;
  freeH: string; free: string;
  againH: string; again: string;
  close: string; signoff: string;
}

const G: Record<MailLang, (n: string) => string> = {
  de: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
  en: (n) => (n ? `Hi ${n},` : "Hi there,"),
  es: (n) => (n ? `Hola ${n},` : "Hola,"),
  fr: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
  it: (n) => (n ? `Ciao ${n},` : "Ciao,"),
  nl: (n) => (n ? `Hoi ${n},` : "Hoi,"),
  pt: (n) => (n ? `Olá ${n},` : "Olá,"),
  ja: (n) => (n ? `${n} 様` : "お客様"),
  sv: (n) => (n ? `Hej ${n},` : "Hej,"),
  da: (n) => (n ? `Hej ${n},` : "Hej,"),
  no: (n) => (n ? `Hei ${n},` : "Hei,"),
};

/* ── Auf Kundenwunsch ─────────────────────────────────────────── */
export const TC: Record<string, Entry> = {
  de: {
    subject: "Ihr Auftrag zur Bewertungslöschung wurde storniert",
    preview: "Ihre Bestellung wurde wie gewünscht storniert.",
    title: "Bestellung storniert",
    greeting: G.de,
    p1: "vielen Dank für Ihr Vertrauen und Ihren Auftrag. Wie gewünscht haben wir Ihre Bestellung storniert.",
    freeH: "Keine weiteren Kosten",
    free: "Für die stornierte Bestellung entstehen Ihnen keine weiteren Kosten.",
    againH: "Später doch löschen lassen?",
    again: "Antworten Sie einfach auf diese E-Mail oder geben Sie im Dashboard eine neue Bestellung auf – wir prüfen Ihre Bewertungen gerne kostenlos.",
    close: "Bei Fragen antworten Sie einfach auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen",
  },
  en: {
    subject: "Your review removal order has been cancelled",
    preview: "We've cancelled your order as requested.",
    title: "Order cancelled",
    greeting: G.en,
    p1: "thank you for your trust and your order. As requested, we've cancelled your order.",
    freeH: "No further costs",
    free: "There are no further costs for you for the cancelled order.",
    againH: "Want to get them removed later?",
    again: "Just reply to this email or place a new order in your dashboard – we're happy to check your reviews for free.",
    close: "Questions? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Tu pedido de eliminación de reseñas ha sido cancelado",
    preview: "Hemos cancelado tu pedido tal y como pediste.",
    title: "Pedido cancelado",
    greeting: G.es,
    p1: "gracias por tu confianza y por tu pedido. Tal y como nos pediste, hemos cancelado tu pedido.",
    freeH: "Sin más costes",
    free: "El pedido cancelado no te supone ningún coste adicional.",
    againH: "¿Quieres eliminarlas más adelante?",
    again: "Responde a este correo o haz un nuevo pedido en tu panel: revisamos tus reseñas gratis.",
    close: "¿Dudas? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Ta commande de suppression d'avis a été annulée",
    preview: "Nous avons annulé ta commande comme demandé.",
    title: "Commande annulée",
    greeting: G.fr,
    p1: "merci pour ta confiance et ta commande. Comme demandé, nous avons annulé ta commande.",
    freeH: "Aucun frais supplémentaire",
    free: "La commande annulée n'entraîne aucun frais supplémentaire pour toi.",
    againH: "Tu veux les faire supprimer plus tard ?",
    again: "Réponds simplement à cet e-mail ou passe une nouvelle commande depuis ton tableau de bord – nous vérifions tes avis gratuitement.",
    close: "Des questions ? Réponds simplement à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Il tuo ordine di rimozione recensioni è stato annullato",
    preview: "Abbiamo annullato il tuo ordine come richiesto.",
    title: "Ordine annullato",
    greeting: G.it,
    p1: "grazie per la fiducia e per il tuo ordine. Come richiesto, abbiamo annullato il tuo ordine.",
    freeH: "Nessun costo aggiuntivo",
    free: "L'ordine annullato non comporta per te alcun costo aggiuntivo.",
    againH: "Vuoi farle rimuovere più avanti?",
    again: "Rispondi a questa e-mail o fai un nuovo ordine dalla tua dashboard: controlliamo le tue recensioni gratis.",
    close: "Domande? Rispondi pure a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Je bestelling voor het verwijderen van reviews is geannuleerd",
    preview: "We hebben je bestelling zoals gevraagd geannuleerd.",
    title: "Bestelling geannuleerd",
    greeting: G.nl,
    p1: "bedankt voor je vertrouwen en je bestelling. Zoals gevraagd hebben we je bestelling geannuleerd.",
    freeH: "Geen verdere kosten",
    free: "Voor de geannuleerde bestelling betaal je niets meer.",
    againH: "Later toch laten verwijderen?",
    again: "Beantwoord gewoon deze e-mail of plaats een nieuwe bestelling in je dashboard – we controleren je reviews gratis.",
    close: "Vragen? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "O teu pedido de remoção de avaliações foi cancelado",
    preview: "Cancelámos o teu pedido, tal como pediste.",
    title: "Pedido cancelado",
    greeting: G.pt,
    p1: "obrigado pela confiança e pelo teu pedido. Tal como pediste, cancelámos o teu pedido.",
    freeH: "Sem mais custos",
    free: "O pedido cancelado não te traz qualquer custo adicional.",
    againH: "Queres removê-las mais tarde?",
    again: "Responde a este e-mail ou faz um novo pedido no teu painel – verificamos as tuas avaliações gratuitamente.",
    close: "Dúvidas? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "口コミ削除のご注文をキャンセルいたしました",
    preview: "ご希望どおり、ご注文をキャンセルいたしました。",
    title: "ご注文キャンセル",
    greeting: G.ja,
    p1: "このたびはご注文いただきありがとうございます。ご希望どおり、ご注文をキャンセルいたしました。",
    freeH: "追加費用はかかりません",
    free: "キャンセルしたご注文について、追加の費用は発生しません。",
    againH: "後から削除をご希望の場合",
    again: "このメールにご返信いただくか、ダッシュボードから新しくご注文ください。口コミは無料で確認いたします。",
    close: "ご不明な点がございましたら、このメールにご返信ください。",
    signoff: "よろしくお願いいたします。",
  },
  sv: {
    subject: "Din beställning av borttagning av recensioner har annullerats",
    preview: "Vi har annullerat din beställning enligt önskemål.",
    title: "Beställning annullerad",
    greeting: G.sv,
    p1: "tack för ditt förtroende och din beställning. Enligt ditt önskemål har vi annullerat beställningen.",
    freeH: "Inga ytterligare kostnader",
    free: "Den annullerade beställningen kostar dig inget mer.",
    againH: "Vill du ta bort dem senare?",
    again: "Svara bara på detta mejl eller lägg en ny beställning i din instrumentpanel – vi granskar dina recensioner gratis.",
    close: "Frågor? Svara bara på detta mejl.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Din bestilling af sletning af anmeldelser er annulleret",
    preview: "Vi har annulleret din bestilling som ønsket.",
    title: "Bestilling annulleret",
    greeting: G.da,
    p1: "tak for din tillid og din bestilling. Som ønsket har vi annulleret din bestilling.",
    freeH: "Ingen yderligere omkostninger",
    free: "Den annullerede bestilling koster dig ikke mere.",
    againH: "Vil du have dem slettet senere?",
    again: "Svar blot på denne e-mail, eller afgiv en ny bestilling i dit dashboard – vi tjekker dine anmeldelser gratis.",
    close: "Spørgsmål? Svar blot på denne e-mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Bestillingen din på fjerning av omtaler er annullert",
    preview: "Vi har annullert bestillingen din som ønsket.",
    title: "Bestilling annullert",
    greeting: G.no,
    p1: "takk for tilliten og bestillingen din. Som ønsket har vi annullert bestillingen din.",
    freeH: "Ingen ytterligere kostnader",
    free: "Den annullerte bestillingen koster deg ikke noe mer.",
    againH: "Vil du få dem fjernet senere?",
    again: "Bare svar på denne e-posten eller legg inn en ny bestilling i dashbordet – vi sjekker omtalene dine gratis.",
    close: "Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

/* ── Keine Rückmeldung ────────────────────────────────────────── */
export const TN: Record<string, Entry> = {
  de: {
    subject: "Ihr Auftrag zur Bewertungslöschung wurde storniert (keine Rückmeldung)",
    preview: "Wir haben leider keine Rückmeldung von Ihnen erhalten – für Sie entstehen keine Kosten.",
    title: "Bestellung storniert",
    greeting: G.de,
    p1: "vielen Dank für Ihr Vertrauen und Ihren Auftrag. Für die Bearbeitung haben wir noch eine Rückmeldung von Ihnen gebraucht (z. B. eine hinterlegte Zahlungsart oder Ihre Freigabe im Dashboard). Leider haben wir nichts von Ihnen gehört – deshalb haben wir Ihre Bestellung storniert.",
    freeH: "Keine weiteren Kosten",
    free: "Für die stornierte Bestellung entstehen Ihnen keine weiteren Kosten.",
    againH: "Doch weitermachen?",
    again: "Antworten Sie einfach auf diese E-Mail – am besten rasch, denn wir können nur Bewertungen löschen, die höchstens 28 Tage alt sind.",
    close: "Bei Fragen antworten Sie einfach auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen",
  },
  en: {
    subject: "Your review removal order has been cancelled (no reply)",
    preview: "Unfortunately we haven't heard back from you – there are no costs for you.",
    title: "Order cancelled",
    greeting: G.en,
    p1: "thank you for your trust and your order. To get started, we still needed something from you (e.g. a saved payment method or your approval in the dashboard). Unfortunately we haven't heard back, so we've cancelled your order.",
    freeH: "No further costs",
    free: "There are no further costs for you for the cancelled order.",
    againH: "Still want to go ahead?",
    again: "Just reply to this email – ideally soon, as we can only remove reviews that are no more than 28 days old.",
    close: "Questions? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Tu pedido de eliminación de reseñas ha sido cancelado (sin respuesta)",
    preview: "No hemos recibido respuesta tuya: no tienes ningún coste.",
    title: "Pedido cancelado",
    greeting: G.es,
    p1: "gracias por tu confianza y por tu pedido. Para empezar necesitábamos algo de tu parte (p. ej., un método de pago guardado o tu aprobación en el panel). Por desgracia no hemos sabido nada de ti, así que hemos cancelado tu pedido.",
    freeH: "Sin más costes",
    free: "El pedido cancelado no te supone ningún coste adicional.",
    againH: "¿Quieres seguir adelante?",
    again: "Responde a este correo, mejor pronto: solo podemos eliminar reseñas con un máximo de 28 días de antigüedad.",
    close: "¿Dudas? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Ta commande de suppression d'avis a été annulée (sans réponse)",
    preview: "Nous n'avons pas eu de réponse de ta part – aucun frais pour toi.",
    title: "Commande annulée",
    greeting: G.fr,
    p1: "merci pour ta confiance et ta commande. Pour démarrer, nous avions encore besoin de quelque chose de ta part (p. ex. un moyen de paiement enregistré ou ta validation dans le tableau de bord). Sans nouvelles de toi, nous avons annulé ta commande.",
    freeH: "Aucun frais supplémentaire",
    free: "La commande annulée n'entraîne aucun frais supplémentaire pour toi.",
    againH: "Tu veux quand même continuer ?",
    again: "Réponds simplement à cet e-mail – idéalement rapidement, car nous ne pouvons supprimer que des avis de 28 jours maximum.",
    close: "Des questions ? Réponds simplement à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Il tuo ordine di rimozione recensioni è stato annullato (nessuna risposta)",
    preview: "Non abbiamo ricevuto risposta da te: nessun costo per te.",
    title: "Ordine annullato",
    greeting: G.it,
    p1: "grazie per la fiducia e per il tuo ordine. Per iniziare ci serviva ancora qualcosa da te (ad es. un metodo di pagamento salvato o la tua approvazione nella dashboard). Purtroppo non abbiamo avuto tue notizie, quindi abbiamo annullato il tuo ordine.",
    freeH: "Nessun costo aggiuntivo",
    free: "L'ordine annullato non comporta per te alcun costo aggiuntivo.",
    againH: "Vuoi comunque procedere?",
    again: "Rispondi a questa e-mail, meglio se presto: possiamo rimuovere solo recensioni di al massimo 28 giorni.",
    close: "Domande? Rispondi pure a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Je bestelling voor het verwijderen van reviews is geannuleerd (geen reactie)",
    preview: "We hebben niets van je gehoord – je betaalt niets.",
    title: "Bestelling geannuleerd",
    greeting: G.nl,
    p1: "bedankt voor je vertrouwen en je bestelling. Om te starten hadden we nog iets van je nodig (bijv. een opgeslagen betaalmethode of je akkoord in het dashboard). Helaas hebben we niets van je gehoord, daarom hebben we je bestelling geannuleerd.",
    freeH: "Geen verdere kosten",
    free: "Voor de geannuleerde bestelling betaal je niets meer.",
    againH: "Toch verder?",
    again: "Beantwoord gewoon deze e-mail – liefst snel, want we kunnen alleen reviews verwijderen die maximaal 28 dagen oud zijn.",
    close: "Vragen? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "O teu pedido de remoção de avaliações foi cancelado (sem resposta)",
    preview: "Não recebemos resposta tua – não tens qualquer custo.",
    title: "Pedido cancelado",
    greeting: G.pt,
    p1: "obrigado pela confiança e pelo teu pedido. Para começar, ainda precisávamos de algo da tua parte (p. ex., um método de pagamento guardado ou a tua aprovação no painel). Infelizmente não tivemos notícias tuas, por isso cancelámos o teu pedido.",
    freeH: "Sem mais custos",
    free: "O pedido cancelado não te traz qualquer custo adicional.",
    againH: "Queres continuar?",
    again: "Responde a este e-mail, de preferência em breve: só conseguimos remover avaliações com, no máximo, 28 dias.",
    close: "Dúvidas? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "口コミ削除のご注文をキャンセルいたしました（ご返信なし）",
    preview: "ご返信をいただけなかったため、ご注文をキャンセルいたしました。費用は発生しません。",
    title: "ご注文キャンセル",
    greeting: G.ja,
    p1: "このたびはご注文いただきありがとうございます。作業開始にあたり、お客様からのご対応（お支払い方法の登録、ダッシュボードでの承認など）が必要でしたが、ご返信をいただけなかったため、ご注文をキャンセルいたしました。",
    freeH: "追加費用はかかりません",
    free: "キャンセルしたご注文について、追加の費用は発生しません。",
    againH: "引き続きご希望の場合",
    again: "このメールにご返信ください。削除できるのは投稿から28日以内の口コミのみのため、お早めのご連絡をおすすめします。",
    close: "ご不明な点がございましたら、このメールにご返信ください。",
    signoff: "よろしくお願いいたします。",
  },
  sv: {
    subject: "Din beställning av borttagning av recensioner har annullerats (inget svar)",
    preview: "Vi har inte hört något från dig – inga kostnader för dig.",
    title: "Beställning annullerad",
    greeting: G.sv,
    p1: "tack för ditt förtroende och din beställning. För att komma igång behövde vi något från dig (t.ex. en sparad betalningsmetod eller ditt godkännande i instrumentpanelen). Tyvärr har vi inte hört något, så vi har annullerat beställningen.",
    freeH: "Inga ytterligare kostnader",
    free: "Den annullerade beställningen kostar dig inget mer.",
    againH: "Vill du ändå fortsätta?",
    again: "Svara bara på detta mejl – gärna snart, eftersom vi bara kan ta bort recensioner som är högst 28 dagar gamla.",
    close: "Frågor? Svara bara på detta mejl.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Din bestilling af sletning af anmeldelser er annulleret (intet svar)",
    preview: "Vi har ikke hørt fra dig – ingen omkostninger for dig.",
    title: "Bestilling annulleret",
    greeting: G.da,
    p1: "tak for din tillid og din bestilling. For at komme i gang havde vi brug for noget fra dig (f.eks. en gemt betalingsmetode eller din godkendelse i dashboardet). Desværre har vi ikke hørt fra dig, så vi har annulleret din bestilling.",
    freeH: "Ingen yderligere omkostninger",
    free: "Den annullerede bestilling koster dig ikke mere.",
    againH: "Vil du alligevel fortsætte?",
    again: "Svar blot på denne e-mail – gerne snart, da vi kun kan slette anmeldelser, der højst er 28 dage gamle.",
    close: "Spørgsmål? Svar blot på denne e-mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Bestillingen din på fjerning av omtaler er annullert (ingen svar)",
    preview: "Vi har ikke hørt fra deg – ingen kostnader for deg.",
    title: "Bestilling annullert",
    greeting: G.no,
    p1: "takk for tilliten og bestillingen din. For å komme i gang trengte vi noe fra deg (f.eks. en lagret betalingsmetode eller godkjenningen din i dashbordet). Dessverre har vi ikke hørt fra deg, så vi har annullert bestillingen din.",
    freeH: "Ingen ytterligere kostnader",
    free: "Den annullerte bestillingen koster deg ikke noe mer.",
    againH: "Vil du likevel fortsette?",
    again: "Bare svar på denne e-posten – helst snart, siden vi bare kan fjerne omtaler som er maks 28 dager gamle.",
    close: "Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

function Body({ t, lang, name, orderId, dashUrl }: { t: Entry; lang: MailLang; name: string; orderId: string; dashUrl?: string }) {
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.freeH}</span><br />
        {t.free}
      </NoteBox>
      <P><strong>{t.againH}</strong> {t.again}</P>
      {dashUrl ? <DashButton lang={lang} url={dashUrl} /> : null}
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}

const ent = (map: Record<string, Entry>, lang: MailLang, ov?: Record<string, string>) =>
  ({ ...(map[lang] || map.en), ...(ov || {}) } as Entry);

export function subjectCustomer(p: StornoReviewsMoreProps): string { return (TC[p.lang || "en"] || TC.en).subject; }
export function subjectNoreply(p: StornoReviewsMoreProps): string { return (TN[p.lang || "en"] || TN.en).subject; }

export function StornoReviewsCustomer({ lang = "en", name = "", orderId = "", dashUrl, _overrides }: StornoReviewsMoreProps = {}) {
  return <Body t={ent(TC, lang, _overrides)} lang={lang} name={name} orderId={orderId} dashUrl={dashUrl} />;
}
export function StornoReviewsNoreply({ lang = "en", name = "", orderId = "", dashUrl, _overrides }: StornoReviewsMoreProps = {}) {
  return <Body t={ent(TN, lang, _overrides)} lang={lang} name={name} orderId={orderId} dashUrl={dashUrl} />;
}
