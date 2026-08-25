/* Template: Auftragsbestätigung „Einzelne Bewertungen löschen".
   Geht SOFORT nach der Bestellung an den Kunden — anders als beim Profil-Produkt
   (dort bewusst abgeschaltet), weil diese Mail die Abrechnungsregeln festhält:
   bezahlt wird NUR je tatsächlich gelöschter Bewertung, fällig am Tag der
   Löschung. Produkt nur außerhalb DACH → KEINE deutsche Fassung, „du"-Ton. */
import * as React from "react";
import { EmailShell, P, NoteBox, Bullets, brand, type MailLang } from "./components";

/** Eine eingereichte Bewertung: Teilen-Link ODER Name + Bewertungstext
   (Wizard-Alternative, wenn der Kunde den Link nicht findet). */
export interface ReviewRef { url?: string; name?: string; text?: string }

export interface AuftragsbestaetigungReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Die zu löschenden Bewertungen (wie im Wizard eingereicht). */
  items?: ReviewRef[];
  /** Veraltet: nur Links (ältere Bestellungen) — wird zu items normalisiert. */
  urls?: string[];
  /** Formatierter Stückpreis, z. B. "$179" / "179 €". */
  per?: string;
  /** Formatierter Maximalbetrag (alle eingereichten Bewertungen). */
  total?: string;
  orderId?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: (n: number) => string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: (n: number) => string;
  listH: string;
  termsH: string; term1: string; term2: string; term3: string;
  condH: string; cond1: string; cond2: string;
  close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: (n) => `Order received – removal of ${n} review${n === 1 ? "" : "s"}`,
    preview: "We've got your reviews — here's how billing works.",
    title: "Order received ✓",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n) => `thanks for your order! We've received ${n === 1 ? "the review" : `the ${n} reviews`} below and are getting started right away.`,
    listH: "Reviews you submitted",
    termsH: "How billing works — in your favour",
    term1: "You only pay for reviews we actually remove.",
    term2: "{per} per removed review — if we remove just one out of five, you pay for that one only.",
    term3: "Payment is due on the day of removal. You'll receive a confirmation with the invoice the same day.",
    condH: "Please double-check",
    cond1: "Each review must be no older than 4 weeks.",
    cond2: "Each review must contain text — star-only ratings can't be removed this way.",
    close: "We'll get back to you as soon as the first review is gone. Questions? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: (n) => `Pedido recibido – eliminación de ${n} reseña${n === 1 ? "" : "s"}`,
    preview: "Tenemos tus reseñas — así funciona la facturación.",
    title: "Pedido recibido ✓",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: (n) => `¡gracias por tu pedido! Hemos recibido ${n === 1 ? "la reseña" : `las ${n} reseñas`} de abajo y nos ponemos manos a la obra.`,
    listH: "Reseñas enviadas",
    termsH: "Así funciona la facturación — a tu favor",
    term1: "Solo pagas por las reseñas que realmente eliminamos.",
    term2: "{per} por reseña eliminada: si de cinco solo quitamos una, pagas solo esa.",
    term3: "El pago vence el día de la eliminación. Ese mismo día recibirás la confirmación con la factura.",
    condH: "Comprueba, por favor",
    cond1: "Cada reseña debe tener como máximo 4 semanas.",
    cond2: "Cada reseña debe contener texto: las valoraciones solo con estrellas no se pueden eliminar así.",
    close: "Te avisaremos en cuanto caiga la primera reseña. ¿Dudas? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: (n) => `Commande reçue – suppression de ${n} avis`,
    preview: "Nous avons tes avis — voici comment fonctionne la facturation.",
    title: "Commande reçue ✓",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: (n) => `merci pour ta commande ! Nous avons bien reçu ${n === 1 ? "l'avis" : `les ${n} avis`} ci-dessous et nous nous y mettons tout de suite.`,
    listH: "Avis transmis",
    termsH: "Comment fonctionne la facturation — en ta faveur",
    term1: "Tu ne paies que les avis que nous supprimons réellement.",
    term2: "{per} par avis supprimé — si nous n'en retirons qu'un sur cinq, tu ne paies que celui-là.",
    term3: "Le paiement est dû le jour de la suppression. Tu recevras la confirmation avec la facture le jour même.",
    condH: "À vérifier",
    cond1: "Chaque avis doit dater de 4 semaines au maximum.",
    cond2: "Chaque avis doit contenir du texte — les notes composées uniquement d'étoiles ne peuvent pas être retirées ainsi.",
    close: "Nous te tiendrons informé dès que le premier avis aura disparu. Des questions ? Réponds à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: (n) => `Ordine ricevuto – rimozione di ${n} recension${n === 1 ? "e" : "i"}`,
    preview: "Abbiamo le tue recensioni — ecco come funziona la fatturazione.",
    title: "Ordine ricevuto ✓",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n) => `grazie per il tuo ordine! Abbiamo ricevuto ${n === 1 ? "la recensione" : `le ${n} recensioni`} qui sotto e ci mettiamo subito al lavoro.`,
    listH: "Recensioni inviate",
    termsH: "Come funziona la fatturazione — a tuo favore",
    term1: "Paghi solo le recensioni che rimuoviamo davvero.",
    term2: "{per} per recensione rimossa — se su cinque ne togliamo una sola, paghi solo quella.",
    term3: "Il pagamento è dovuto il giorno della rimozione. Lo stesso giorno riceverai la conferma con la fattura.",
    condH: "Da verificare",
    cond1: "Ogni recensione non deve avere più di 4 settimane.",
    cond2: "Ogni recensione deve contenere testo — le valutazioni con sole stelle non si possono rimuovere così.",
    close: "Ti avvisiamo appena sparisce la prima recensione. Domande? Rispondi a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: (n) => `Bestelling ontvangen – verwijdering van ${n} review${n === 1 ? "" : "s"}`,
    preview: "We hebben je reviews — zo werkt de facturering.",
    title: "Bestelling ontvangen ✓",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: (n) => `bedankt voor je bestelling! We hebben ${n === 1 ? "de review" : `de ${n} reviews`} hieronder ontvangen en gaan meteen aan de slag.`,
    listH: "Ingediende reviews",
    termsH: "Zo werkt de facturering — in jouw voordeel",
    term1: "Je betaalt alleen voor reviews die we daadwerkelijk verwijderen.",
    term2: "{per} per verwijderde review — halen we er van vijf maar één weg, dan betaal je alleen die ene.",
    term3: "Betaling is verschuldigd op de dag van verwijdering. Je ontvangt diezelfde dag de bevestiging met de factuur.",
    condH: "Controleer even",
    cond1: "Elke review mag maximaal 4 weken oud zijn.",
    cond2: "Elke review moet tekst bevatten — beoordelingen met alleen sterren kunnen zo niet worden verwijderd.",
    close: "We laten van ons horen zodra de eerste review weg is. Vragen? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: (n) => `Encomenda recebida – remoção de ${n} avaliaç${n === 1 ? "ão" : "ões"}`,
    preview: "Temos as tuas avaliações — eis como funciona a faturação.",
    title: "Encomenda recebida ✓",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n) => `obrigado pela tua encomenda! Recebemos ${n === 1 ? "a avaliação" : `as ${n} avaliações`} abaixo e vamos começar já.`,
    listH: "Avaliações enviadas",
    termsH: "Como funciona a faturação — a teu favor",
    term1: "Só pagas pelas avaliações que removemos de facto.",
    term2: "{per} por avaliação removida — se de cinco removermos só uma, pagas apenas essa.",
    term3: "O pagamento vence no dia da remoção. Nesse mesmo dia recebes a confirmação com a fatura.",
    condH: "Verifica, por favor",
    cond1: "Cada avaliação não pode ter mais de 4 semanas.",
    cond2: "Cada avaliação tem de conter texto — classificações só com estrelas não podem ser removidas assim.",
    close: "Avisamos-te assim que a primeira avaliação desaparecer. Dúvidas? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: (n) => `ご注文を受け付けました – 口コミ${n}件の削除`,
    preview: "口コミを受領しました。お支払いの仕組みをご案内します。",
    title: "ご注文を受け付けました ✓",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: (n) => `ご注文ありがとうございます。以下の口コミ${n}件を受領し、すぐに作業を開始します。`,
    listH: "お送りいただいた口コミ",
    termsH: "お支払いの仕組み — お客様に有利な形です",
    term1: "実際に削除できた口コミの分だけお支払いいただきます。",
    term2: "削除1件につき{per}。5件中1件のみ削除できた場合は、その1件分だけのお支払いです。",
    term3: "お支払いは削除当日が期日です。同日に削除確認と請求書をお送りします。",
    condH: "ご確認ください",
    cond1: "各口コミは投稿から4週間以内である必要があります。",
    cond2: "各口コミには本文が必要です。星のみの評価はこの方法では削除できません。",
    close: "最初の口コミが消え次第ご連絡します。ご不明な点はこのメールにご返信ください。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: (n) => `Beställning mottagen – borttagning av ${n} omdöme${n === 1 ? "" : "n"}`,
    preview: "Vi har dina omdömen — så fungerar faktureringen.",
    title: "Beställning mottagen ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `tack för din beställning! Vi har tagit emot ${n === 1 ? "omdömet" : `de ${n} omdömena`} nedan och sätter igång direkt.`,
    listH: "Inskickade omdömen",
    termsH: "Så fungerar faktureringen — till din fördel",
    term1: "Du betalar bara för omdömen som vi faktiskt tar bort.",
    term2: "{per} per borttaget omdöme — tar vi bara bort ett av fem betalar du bara för det.",
    term3: "Betalningen förfaller samma dag som borttagningen. Samma dag får du bekräftelsen med fakturan.",
    condH: "Kontrollera gärna",
    cond1: "Varje omdöme får vara högst 4 veckor gammalt.",
    cond2: "Varje omdöme måste innehålla text — betyg med enbart stjärnor kan inte tas bort på detta sätt.",
    close: "Vi hör av oss så fort det första omdömet är borta. Frågor? Svara bara på det här mejlet.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: (n) => `Bestilling modtaget – fjernelse af ${n} anmeldelse${n === 1 ? "" : "r"}`,
    preview: "Vi har dine anmeldelser — sådan fungerer faktureringen.",
    title: "Bestilling modtaget ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `tak for din bestilling! Vi har modtaget ${n === 1 ? "anmeldelsen" : `de ${n} anmeldelser`} nedenfor og går i gang med det samme.`,
    listH: "Indsendte anmeldelser",
    termsH: "Sådan fungerer faktureringen — til din fordel",
    term1: "Du betaler kun for anmeldelser, vi faktisk fjerner.",
    term2: "{per} pr. fjernet anmeldelse — fjerner vi kun én ud af fem, betaler du kun for den ene.",
    term3: "Betalingen forfalder på fjernelsesdagen. Samme dag modtager du bekræftelsen med fakturaen.",
    condH: "Tjek venligst",
    cond1: "Hver anmeldelse må højst være 4 uger gammel.",
    cond2: "Hver anmeldelse skal indeholde tekst — bedømmelser med kun stjerner kan ikke fjernes på denne måde.",
    close: "Du hører fra os, så snart den første anmeldelse er væk. Spørgsmål? Svar blot på denne mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: (n) => `Bestilling mottatt – fjerning av ${n} omtale${n === 1 ? "" : "r"}`,
    preview: "Vi har omtalene dine — slik fungerer faktureringen.",
    title: "Bestilling mottatt ✓",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n) => `takk for bestillingen! Vi har mottatt ${n === 1 ? "omtalen" : `de ${n} omtalene`} nedenfor og setter i gang med en gang.`,
    listH: "Innsendte omtaler",
    termsH: "Slik fungerer faktureringen — til din fordel",
    term1: "Du betaler kun for omtaler vi faktisk fjerner.",
    term2: "{per} per fjernet omtale — fjerner vi bare én av fem, betaler du kun for den ene.",
    term3: "Betalingen forfaller samme dag som fjerningen. Samme dag får du bekreftelsen med fakturaen.",
    condH: "Vennligst sjekk",
    cond1: "Hver omtale kan maks være 4 uker gammel.",
    cond2: "Hver omtale må inneholde tekst — vurderinger med bare stjerner kan ikke fjernes på denne måten.",
    close: "Du hører fra oss så snart den første omtalen er borte. Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

const fill = (s: string, per: string) => (s || "").replace(/\{per\}/g, per || "");

export function subject(p: AuftragsbestaetigungReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject((p.items || []).length || (p.urls || []).length || 1);
}

export default function AuftragsbestaetigungReviews({ lang = "en", name = "", items = [], urls = [], per = "", total = "", orderId = "", _overrides }: AuftragsbestaetigungReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const list: ReviewRef[] = items.length ? items : urls.map((u) => ({ url: u }));
  const n = list.length || 1;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1(n)}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      <P><strong>{t.listH}</strong></P>
      <Bullets items={list.map((it, i) => it.url
        ? <a key={i} href={it.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{it.url}</a>
        : <span key={i}><strong>{it.name}</strong> — “{it.text}”</span>
      )} />

      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.termsH}</span><br />
        1. {t.term1}<br />
        2. {fill(t.term2, per)}{total ? <span style={{ color: brand.muted }}> ({n} × {per} = {total} max.)</span> : null}<br />
        3. {t.term3}
      </NoteBox>

      <P><strong>{t.condH}:</strong> {t.cond1} {t.cond2}</P>

      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
