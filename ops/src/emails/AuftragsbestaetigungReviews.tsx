/* Template: Auftragsbestätigung „Einzelne Bewertungen löschen".
   Geht SOFORT nach der Bestellung an den Kunden (wie bei allen Produkten).
   Hält die Abrechnungsregeln fest:
   bezahlt wird NUR je tatsächlich gelöschter Bewertung, fällig am Tag der
   Löschung. Fremdsprachen im „du"-Ton; deutsche Fassung (Sie-Form) für
   manuell angelegte Aufträge aus DACH ist enthalten. */
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
  de: {
    subject: (n) => `Auftrag erhalten – Löschung von ${n} Bewertung${n === 1 ? "" : "en"}`,
    preview: "Wir haben Ihre Bewertungen erhalten – so funktioniert die Abrechnung.",
    title: "Auftrag erhalten ✓",
    greeting: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (n) => `vielen Dank für Ihren Auftrag! Wir haben ${n === 1 ? "die untenstehende Bewertung" : `die ${n} untenstehenden Bewertungen`} erhalten und beginnen umgehend mit der Bearbeitung.`,
    listH: "Ihre eingereichten Bewertungen",
    termsH: "So funktioniert die Abrechnung – zu Ihrem Vorteil",
    term1: "Sie bezahlen nur für Bewertungen, die wir tatsächlich löschen.",
    term2: "{per} je gelöschter Bewertung – löschen wir nur eine von fünf, bezahlen Sie auch nur diese eine.",
    term3: "Die Zahlung ist am Tag der Löschung fällig. Am selben Tag erhalten Sie die Bestätigung samt Rechnung.",
    condH: "Gut zu wissen",
    cond1: "Bewertungen bis 4 Wochen alt haben eine Erfolgsquote von ca. 90 %. Bei älteren Bewertungen außerhalb der USA gehen wir zuerst mit rechtlichen Meldungen vor, damit verschwinden über 90 % (der Aufpreis ist im Preis oben schon enthalten).",
    cond2: "Ältere Bewertungen aus den USA und Bewertungen ohne Text (reine Sternebewertungen) lassen sich meist nur per Spezial-Software löschen, weil Google sie nicht von Hand entfernt. Dasselbe gilt für ältere Bewertungen aus anderen Ländern, die nach unserer rechtlichen Meldung stehen bleiben. Die Software-Löschung kostet {nt} je Bewertung und wird vorab bezahlt, aber erst, wenn wir geprüft haben, dass sie bei Ihrer Bewertung möglich ist. Erfolgsquote 99 %: Ist die Bewertung nach spätestens 14 Tagen nicht gelöscht, erhalten Sie den vollen Betrag zurück.",
    close: "Wir prüfen nun Ihre Bewertungen und melden uns, sobald wir begonnen haben. Bei Fragen antworten Sie einfach auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen",
  },
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
    cond1: "Reviews up to 4 weeks old have a success rate of about 90 %. For older reviews outside the USA we first file legal notices, which removes over 90 % of them (the surcharge is already included in the price above).",
    cond2: "Older reviews from the USA and reviews without text (star ratings only) can usually only be removed with special software, because Google doesn't remove them by hand. The same applies to older reviews from other countries that remain after our legal notice. Software removal costs {nt} per review, paid in full upfront, but only once we have checked that it is possible for your review. 99 % success rate: if a review isn't removed within 14 days at the latest, you get a full refund.",
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
    cond1: "Las reseñas de hasta 4 semanas tienen una tasa de éxito de aprox. el 90 %. Para las reseñas antiguas de fuera de EE. UU., primero presentamos avisos legales, con los que se elimina más del 90 % (el recargo ya está incluido en el precio de arriba).",
    cond2: "Las reseñas antiguas de EE. UU. y las reseñas sin texto (solo estrellas) normalmente solo se pueden eliminar con un software especial, porque Google no las elimina a mano. Lo mismo vale para las reseñas antiguas de otros países que siguen ahí tras nuestro aviso legal. La eliminación por software cuesta {nt} por reseña y se paga íntegramente por adelantado, pero solo después de comprobar que es posible en tu reseña. Tasa de éxito del 99 %: si una reseña no se elimina en un plazo máximo de 14 días, te devolvemos el importe íntegro.",
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
    cond1: "Les avis de moins de 4 semaines ont un taux de réussite d'environ 90 %. Pour les avis plus anciens hors des États-Unis, nous passons d'abord par des signalements juridiques, qui en font disparaître plus de 90 % (le supplément est déjà inclus dans le prix ci-dessus).",
    cond2: "Les avis anciens provenant des États-Unis et les avis sans texte (étoiles uniquement) ne peuvent généralement être supprimés qu'avec un logiciel spécial, car Google ne les supprime pas manuellement. Il en va de même pour les avis anciens d'autres pays qui restent en ligne après notre signalement juridique. La suppression par logiciel coûte {nt} par avis, payé intégralement d'avance, mais seulement une fois que nous avons vérifié qu'elle est possible pour ton avis. 99 % de réussite : si un avis n'est pas supprimé sous 14 jours au plus tard, nous te remboursons l'intégralité du montant.",
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
    cond1: "Le recensioni fino a 4 settimane hanno una probabilità di successo di circa il 90 %. Per le recensioni più vecchie fuori dagli USA presentiamo prima delle segnalazioni legali, che ne rimuovono oltre il 90 % (il supplemento è già incluso nel prezzo sopra).",
    cond2: "Le recensioni più vecchie dagli USA e le recensioni senza testo (solo stelle) di solito si possono rimuovere solo con un software speciale, perché Google non le rimuove a mano. Lo stesso vale per le recensioni più vecchie di altri Paesi che restano online dopo la nostra segnalazione legale. La rimozione tramite software costa {nt} a recensione e si paga per intero in anticipo, ma solo dopo che abbiamo verificato che è possibile per la tua recensione. 99 % di successo: se una recensione non viene rimossa entro massimo 14 giorni, ti rimborsiamo l'intero importo.",
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
    cond1: "Reviews tot 4 weken oud hebben een slagingskans van ongeveer 90 %. Bij oudere reviews van buiten de VS dienen we eerst juridische meldingen in, waarmee meer dan 90 % verdwijnt (de toeslag is al inbegrepen in de prijs hierboven).",
    cond2: "Oudere reviews uit de VS en reviews zonder tekst (alleen sterren) kunnen meestal alleen met speciale software worden verwijderd, omdat Google ze niet handmatig verwijdert. Hetzelfde geldt voor oudere reviews uit andere landen die na onze juridische melding blijven staan. Verwijdering met software kost {nt} per review en wordt volledig vooraf betaald, maar pas nadat we hebben gecontroleerd dat het bij uw review mogelijk is. 99 % slagingskans: is een review niet uiterlijk binnen 14 dagen verwijderd, dan krijgt u het volledige bedrag terug.",
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
    cond1: "As avaliações com até 4 semanas têm uma taxa de sucesso de cerca de 90 %. Nas avaliações mais antigas de fora dos EUA, começamos por apresentar denúncias legais, que removem mais de 90 % (o suplemento já está incluído no preço acima).",
    cond2: "As avaliações antigas dos EUA e as avaliações sem texto (só estrelas) normalmente só podem ser removidas com um software especial, porque o Google não as remove manualmente. O mesmo se aplica às avaliações antigas de outros países que ficam online depois da nossa denúncia legal. A remoção por software custa {nt} por avaliação e é paga na totalidade antecipadamente, mas só depois de verificarmos que é possível na tua avaliação. 99 % de sucesso: se uma avaliação não for removida no prazo máximo de 14 dias, devolvemos-te o valor total.",
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
    cond1: "投稿から4週間以内の口コミの成功率は約90%です。米国以外の古い口コミについては、まず法的な申し立てを行い、90%以上が削除されます（追加料金は上記の料金に含まれています）。",
    cond2: "米国の古い口コミと本文のない口コミ（星のみの評価）は、Googleが手作業で削除しないため、通常は専用ソフトウェアでしか削除できません。その他の国の古い口コミで、法的な申し立ての後も残ったものも同様です。ソフトウェアによる削除は1件{nt}で、全額前払いとなりますが、お支払いはお客様の口コミで削除が可能であることを当社が確認した後です。成功率99%：遅くとも14日以内に削除されなかった場合は、全額返金いたします。",
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
    cond1: "Omdömen upp till 4 veckor gamla har en framgångsgrad på cirka 90 %. För äldre omdömen utanför USA gör vi först juridiska anmälningar, som tar bort över 90 % (tillägget ingår redan i priset ovan).",
    cond2: "Äldre omdömen från USA och omdömen utan text (bara stjärnor) kan oftast bara tas bort med specialprogramvara, eftersom Google inte tar bort dem manuellt. Detsamma gäller äldre omdömen från andra länder som ligger kvar efter vår juridiska anmälan. Borttagning med programvara kostar {nt} per omdöme och betalas i sin helhet i förskott, men först när vi har kontrollerat att det är möjligt för ditt omdöme. 99 % chans att lyckas: tas ett omdöme inte bort inom senast 14 dagar får du hela beloppet tillbaka.",
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
    cond1: "Anmeldelser op til 4 uger gamle har en succesrate på ca. 90 %. Ved ældre anmeldelser uden for USA sender vi først juridiske indberetninger, som fjerner over 90 % (tillægget er allerede med i prisen ovenfor).",
    cond2: "Ældre anmeldelser fra USA og anmeldelser uden tekst (kun stjerner) kan som regel kun fjernes med speciel software, fordi Google ikke fjerner dem manuelt. Det samme gælder ældre anmeldelser fra andre lande, der stadig står der efter vores juridiske indberetning. Fjernelse med software koster {nt} pr. anmeldelse og betales fuldt ud forud, men først når vi har tjekket, at det er muligt for din anmeldelse. 99 % succesrate: bliver en anmeldelse ikke fjernet senest efter 14 dage, får du hele beløbet tilbage.",
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
    cond1: "Omtaler som er opptil 4 uker gamle har en suksessrate på rundt 90 %. For eldre omtaler utenfor USA sender vi først juridiske varsler, som fjerner over 90 % (tillegget er allerede inkludert i prisen over).",
    cond2: "Eldre omtaler fra USA og omtaler uten tekst (bare stjerner) kan som regel bare fjernes med spesialprogramvare, fordi Google ikke fjerner dem manuelt. Det samme gjelder eldre omtaler fra andre land som blir stående etter vårt juridiske varsel. Fjerning med programvare koster {nt} per omtale og betales i sin helhet på forskudd, men først når vi har sjekket at det er mulig for omtalen din. 99 % suksessrate: blir en omtale ikke fjernet senest innen 14 dager, får du hele beløpet tilbake.",
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
        : <span key={i}><strong>{it.name}</strong>{it.text ? <> — “{it.text}”</> : null}</span>
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
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
