/* Template: Auftragsbestätigung „Einzelne Bewertungen löschen".
   Geht SOFORT nach der Bestellung an den Kunden (wie bei allen Produkten).
   Hält die Abrechnungsregeln fest:
   bezahlt wird NUR je tatsächlich gelöschter Bewertung, fällig am Tag der
   Löschung. Produkt nur außerhalb DACH → KEINE deutsche Fassung, „du"-Ton. */
import * as React from "react";
import { DashBox, type DashInfo } from "./DashBox";
import { EmailShell, P, NoteBox, Bullets, brand, type MailLang } from "./components";
import { ReviewPriceLines, reviewCurrency } from "./ReviewPriceLines";
import { fmtReviewMoney, REVIEW_NOTEXT_PRICE } from "../reviewsPricing";

/** Eine eingereichte Bewertung: Teilen-Link ODER Name + Bewertungstext
   (Wizard-Alternative, wenn der Kunde den Link nicht findet). */
export interface ReviewRef { url?: string; name?: string; text?: string; old?: boolean }

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
  /** Währung der Bestellung ("usd" | "eur") — für die exakte Preisaufstellung. */
  currency?: string;
  orderId?: string;
  /** Kunden-Dashboard: Link + Zugangsdaten (nur beim Anlegen). */
  dash?: DashInfo;
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
    condH: "Good to know",
    cond1: "Reviews up to 4 weeks old have a success rate of around 90 %, older reviews around 50 % (older ones carry a surcharge, already included in the price above).",
    cond2: "Reviews without text (star ratings only) can be removed too – with a special procedure at {nt} per review (approx. 80 % success chance), 50 % as a deposit once we accept them, 50 % after removal – this only concerns a few special cases.",
    close: "We'll now check your reviews and let you know as soon as we've started. Questions? Just reply to this email.",
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
    condH: "A tener en cuenta",
    cond1: "Las reseñas de hasta 4 semanas tienen una tasa de éxito de aprox. el 90 %; las más antiguas, de aprox. el 50 % (llevan un recargo, ya incluido en el precio de arriba).",
    cond2: "También se pueden eliminar reseñas sin texto (solo estrellas), con un procedimiento especial: {nt} por reseña (aprox. 80 % de éxito), 50 % de anticipo al aceptarlas y 50 % tras la eliminación (solo en pocos casos especiales).",
    close: "Ahora revisamos tus reseñas y te avisamos en cuanto empecemos. ¿Dudas? Responde a este correo.",
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
    condH: "Bon à savoir",
    cond1: "Les avis de moins de 4 semaines ont un taux de réussite d'environ 90 %, les plus anciens d'environ 50 % (avec un supplément, déjà inclus dans le prix ci-dessus).",
    cond2: "Les avis sans texte (étoiles uniquement) peuvent aussi être supprimés, avec une procédure spéciale : {nt} par avis (env. 80 % de réussite), 50 % d'acompte à l'acceptation, 50 % après la suppression (seulement quelques cas particuliers).",
    close: "Nous vérifions maintenant tes avis et te prévenons dès que nous commençons. Des questions ? Réponds à cet e-mail.",
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
    condH: "Buono a sapersi",
    cond1: "Le recensioni fino a 4 settimane hanno una probabilità di successo di circa il 90 %, quelle più vecchie di circa il 50 % (con un supplemento, già incluso nel prezzo sopra).",
    cond2: "Si possono rimuovere anche recensioni senza testo (solo stelle), con una procedura speciale: {nt} a recensione (ca. 80 % di successo), 50 % di acconto all'accettazione, 50 % dopo la rimozione (solo pochi casi particolari).",
    close: "Ora controlliamo le tue recensioni e ti avvisiamo appena iniziamo. Domande? Rispondi a questa e-mail.",
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
    condH: "Goed om te weten",
    cond1: "Reviews tot 4 weken oud hebben een slagingskans van ongeveer 90 %, oudere reviews van ongeveer 50 % (met een toeslag, al inbegrepen in de prijs hierboven).",
    cond2: "Ook reviews zonder tekst (alleen sterren) kunnen worden verwijderd, met een speciale procedure: {nt} per review (ca. 80 % slagingskans), 50 % aanbetaling bij acceptatie, 50 % na verwijdering (alleen in enkele speciale gevallen).",
    close: "We controleren nu je reviews en laten je weten zodra we beginnen. Vragen? Beantwoord gewoon deze e-mail.",
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
    condH: "Bom saber",
    cond1: "As avaliações com até 4 semanas têm uma taxa de sucesso de cerca de 90 %; as mais antigas, de cerca de 50 % (com um suplemento, já incluído no preço acima).",
    cond2: "Também é possível remover avaliações sem texto (só estrelas), com um procedimento especial: {nt} por avaliação (aprox. 80 % de sucesso), 50 % de sinal ao aceitarmos e 50 % após a remoção (apenas em poucos casos especiais).",
    close: "Vamos agora verificar as tuas avaliações e avisamos-te assim que começarmos. Dúvidas? Responde a este e-mail.",
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
    condH: "ご参考までに",
    cond1: "投稿から4週間以内の口コミの成功率は約90%、それより古い口コミは約50%です（古い口コミには追加料金がかかり、上記の料金に含まれています）。",
    cond2: "本文のない口コミ（星のみの評価）も、特別な手続きで削除可能です：1件{nt}（成功率 約80%）、受付時に50%（着手金）、削除後に50%です（ごく一部の特殊なケースのみ）。",
    close: "これから口コミを確認し、作業を開始し次第ご連絡します。ご不明な点はこのメールにご返信ください。",
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
    condH: "Bra att veta",
    cond1: "Omdömen upp till 4 veckor gamla har en framgångsgrad på cirka 90 %, äldre omdömen cirka 50 % (med ett tillägg som redan ingår i priset ovan).",
    cond2: "Även omdömen utan text (bara stjärnor) kan tas bort, med ett särskilt förfarande: {nt} per omdöme (ca. 80 % chans), 50 % i handpenning när vi godkänt dem, 50 % efter borttagning (bara ett fåtal specialfall).",
    close: "Vi går nu igenom dina omdömen och hör av oss så fort vi har börjat. Frågor? Svara bara på det här mejlet.",
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
    condH: "Godt at vide",
    cond1: "Anmeldelser op til 4 uger gamle har en succesrate på ca. 90 %, ældre anmeldelser ca. 50 % (med et tillæg, der allerede er med i prisen ovenfor).",
    cond2: "Anmeldelser uden tekst (kun stjerner) kan også fjernes med en særlig procedure: {nt} pr. anmeldelse (ca. 80 % succesrate), 50 % i depositum ved accept, 50 % efter fjernelsen (kun få særtilfælde).",
    close: "Vi gennemgår nu dine anmeldelser og giver besked, så snart vi er gået i gang. Spørgsmål? Svar blot på denne mail.",
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
    condH: "Greit å vite",
    cond1: "Omtaler som er opptil 4 uker gamle har en suksessrate på rundt 90 %, eldre omtaler rundt 50 % (med et tillegg som allerede er inkludert i prisen over).",
    cond2: "Også omtaler uten tekst (bare stjerner) kan fjernes med en spesiell prosedyre: {nt} per omtale (ca. 80 % sjanse), 50 % i depositum ved aksept, 50 % etter fjerning (bare noen få spesialtilfeller).",
    close: "Vi går nå gjennom omtalene dine og gir beskjed så snart vi har startet. Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

const fill = (s: string, per: string) => (s || "").replace(/\{per\}/g, per || "");

export function subject(p: AuftragsbestaetigungReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject((p.items || []).length || (p.urls || []).length || 1);
}

export default function AuftragsbestaetigungReviews({ lang = "en", name = "", items = [], urls = [], per = "", total = "", currency = "", orderId = "", dash, _overrides }: AuftragsbestaetigungReviewsProps = {}) {
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
        2. {fill(t.term2, per)}{total && !list.length ? <span style={{ color: brand.muted }}> ({total} max.)</span> : null}<br />
        3. {t.term3}
        <ReviewPriceLines lang={lang} items={list} currency={reviewCurrency(currency, per)} />
      </NoteBox>

      <P><strong>{t.condH}:</strong> {t.cond1} {(t.cond2 || "").replace("{nt}", fmtReviewMoney(REVIEW_NOTEXT_PRICE, reviewCurrency(currency, per)))}</P>

      <DashBox lang={lang} dash={dash} />
      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
