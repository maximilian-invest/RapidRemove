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
import { fmtReviewMoney, REVIEW_NOTEXT_PRICE, quoteReviews, isSwItem } from "../reviewsPricing";

/** Eine eingereichte Bewertung: Teilen-Link ODER Name + Bewertungstext
   (Wizard-Alternative, wenn der Kunde den Link nicht findet). */
export interface ReviewRef { url?: string; name?: string; text?: string; old?: boolean; nt?: boolean; sw?: boolean }

export interface AuftragsbestaetigungReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Chat-Rabatt in % (der höhere aus Mengen- und Chat-Rabatt gilt). */
  chatPct?: number;
  /** Inhaber-Nachweis nötig (Bewertung mit 4–5 Sternen beauftragt) → Hinweis + Upload im Dashboard. */
  verify?: boolean;
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
  p1sw: (n: number) => string; swH: string; swWhy: string; sw1: string; sw2: string; sw3: string;
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
    p1sw: (n) => `vielen Dank für Ihren Auftrag! Wir haben ${n === 1 ? "die untenstehende Bewertung" : `die ${n} untenstehenden Bewertungen`} erhalten und prüfen jetzt, ob die Software-Löschung möglich ist.`,
    swH: "Software-Löschung – vorab bezahlt, aber erst nach unserer Prüfung", swWhy: "Ältere Bewertungen aus den USA und reine Sternebewertungen ohne Text entfernt Google in der Regel nicht von Hand – sie lassen sich nur per Spezial-Software löschen.",
    sw1: "Wir prüfen zuerst, ob die Software-Löschung bei Ihrer Bewertung möglich ist. Jetzt zahlen Sie noch nichts.", sw2: "Ist sie möglich, bekommen Sie eine Zahlungsaufforderung über {nt} je Bewertung (Mengenrabatt schon abgezogen) – sobald bezahlt ist, starten wir.", sw3: "Erfolgsquote 99 %: Ist eine Bewertung nach spätestens 14 Tagen nicht gelöscht, erhalten Sie den vollen Betrag zurück. Ist keine Software-Löschung möglich, zahlen Sie nichts.",
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
    p1sw: (n) => `thanks for your order! We've received ${n === 1 ? "the review" : `the ${n} reviews`} below and are now checking whether software removal is possible.`,
    swH: "Software removal – paid upfront, but only after our check", swWhy: "Google usually doesn't remove older reviews from the USA or star-only ratings without text by hand – they can only be removed with special software.",
    sw1: "We first check whether software removal is possible for your review. You don't pay anything yet.", sw2: "If it is, you'll get a payment request for {nt} per review (volume discount already applied) – we start as soon as it's paid.", sw3: "99 % success rate: if a review isn't removed within 14 days at the latest, you get a full refund. If software removal isn't possible, you pay nothing.",
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
    p1sw: (n) => `¡gracias por tu pedido! Hemos recibido ${n === 1 ? "la reseña" : `las ${n} reseñas`} de abajo y ahora comprobamos si es posible la eliminación por software.`,
    swH: "Eliminación por software: pago por adelantado, pero solo tras nuestra revisión", swWhy: "Google normalmente no elimina a mano las reseñas antiguas de EE. UU. ni las valoraciones solo con estrellas sin texto: solo se pueden eliminar con un software especial.",
    sw1: "Primero comprobamos si la eliminación por software es posible para tu reseña. De momento no pagas nada.", sw2: "Si es posible, recibirás una solicitud de pago de {nt} por reseña (descuento por volumen ya aplicado); empezamos en cuanto esté pagada.", sw3: "99 % de éxito: si una reseña no se elimina en un máximo de 14 días, te devolvemos el importe íntegro. Si la eliminación por software no es posible, no pagas nada.",
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
    p1sw: (n) => `merci pour ta commande ! Nous avons bien reçu ${n === 1 ? "l'avis" : `les ${n} avis`} ci-dessous et vérifions maintenant si la suppression par logiciel est possible.`,
    swH: "Suppression par logiciel – payée d'avance, mais seulement après notre vérification", swWhy: "Google ne supprime généralement pas à la main les avis anciens des États-Unis ni les notes sans texte : ils ne peuvent être supprimés qu'avec un logiciel spécial.",
    sw1: "Nous vérifions d'abord si la suppression par logiciel est possible pour ton avis. Tu ne paies rien pour l'instant.", sw2: "Si c'est possible, tu recevras une demande de paiement de {nt} par avis (remise sur quantité déjà déduite) – nous commençons dès que c'est payé.", sw3: "99 % de réussite : si un avis n'est pas supprimé sous 14 jours au plus tard, nous te remboursons l'intégralité. Si la suppression par logiciel n'est pas possible, tu ne paies rien.",
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
    p1sw: (n) => `grazie per il tuo ordine! Abbiamo ricevuto ${n === 1 ? "la recensione" : `le ${n} recensioni`} qui sotto e ora verifichiamo se la rimozione via software è possibile.`,
    swH: "Rimozione via software – pagata in anticipo, ma solo dopo la nostra verifica", swWhy: "Di solito Google non rimuove a mano le recensioni vecchie dagli USA né le valutazioni solo a stelle senza testo: si possono rimuovere solo con un software speciale.",
    sw1: "Prima verifichiamo se la rimozione via software è possibile per la tua recensione. Per ora non paghi nulla.", sw2: "Se è possibile, riceverai una richiesta di pagamento di {nt} per recensione (sconto quantità già applicato): iniziamo appena è pagata.", sw3: "99 % di successo: se una recensione non viene rimossa entro 14 giorni al massimo, ti rimborsiamo l'intero importo. Se la rimozione via software non è possibile, non paghi nulla.",
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
    p1sw: (n) => `bedankt voor je bestelling! We hebben ${n === 1 ? "de review" : `de ${n} reviews`} hieronder ontvangen en controleren nu of verwijdering via software mogelijk is.`,
    swH: "Verwijdering via software – vooraf betaald, maar pas na onze controle", swWhy: "Google verwijdert oudere reviews uit de VS en beoordelingen met alleen sterren zonder tekst meestal niet handmatig – die kunnen alleen met speciale software worden verwijderd.",
    sw1: "We controleren eerst of verwijdering via software mogelijk is voor je review. Je betaalt nu nog niets.", sw2: "Is het mogelijk, dan krijg je een betaalverzoek van {nt} per review (volumekorting al verrekend) – we starten zodra het betaald is.", sw3: "99 % succes: is een review na uiterlijk 14 dagen niet verwijderd, dan krijg je het volledige bedrag terug. Is verwijdering via software niet mogelijk, dan betaal je niets.",
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
    p1sw: (n) => `obrigado pela tua encomenda! Recebemos ${n === 1 ? "a avaliação" : `as ${n} avaliações`} abaixo e estamos agora a verificar se a remoção por software é possível.`,
    swH: "Remoção por software – paga antecipadamente, mas só depois da nossa verificação", swWhy: "Normalmente, o Google não remove manualmente avaliações antigas dos EUA nem classificações só com estrelas sem texto – só podem ser removidas com software especial.",
    sw1: "Primeiro verificamos se a remoção por software é possível para a tua avaliação. Para já não pagas nada.", sw2: "Se for possível, recebes um pedido de pagamento de {nt} por avaliação (desconto de volume já aplicado) – começamos assim que estiver pago.", sw3: "99 % de sucesso: se uma avaliação não for removida no prazo máximo de 14 dias, devolvemos-te o valor total. Se a remoção por software não for possível, não pagas nada.",
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
    p1sw: (n) => `ご注文ありがとうございます。以下の口コミ${n}件を受領し、ソフトウェアによる削除が可能かを確認しています。`,
    swH: "ソフトウェア削除 – 前払い（ただし当社の確認後）", swWhy: "米国の古い口コミや本文のない星だけの評価は、通常Googleが手動で削除しないため、専用ソフトウェアでのみ削除できます。",
    sw1: "まず、お客様の口コミがソフトウェアで削除可能かを確認します。現時点でのお支払いは不要です。", sw2: "削除可能な場合、口コミ1件あたり{nt}（まとめ割引適用済み）のお支払いのご案内をお送りします。お支払い確認後すぐに開始します。", sw3: "成功率99 %：遅くとも14日以内に削除されない場合は全額返金します。ソフトウェア削除ができない場合、お支払いは発生しません。",
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
    p1sw: (n) => `tack för din beställning! Vi har tagit emot ${n === 1 ? "omdömet" : `de ${n} omdömena`} nedan och kontrollerar nu om borttagning med mjukvara är möjlig.`,
    swH: "Borttagning med mjukvara – betalas i förskott, men först efter vår kontroll", swWhy: "Google tar oftast inte bort äldre omdömen från USA eller betyg med bara stjärnor utan text manuellt – de kan bara tas bort med specialmjukvara.",
    sw1: "Vi kontrollerar först om borttagning med mjukvara är möjlig för ditt omdöme. Du betalar ingenting nu.", sw2: "Om det går får du en betalningsbegäran på {nt} per omdöme (mängdrabatt redan avdragen) – vi börjar så fort det är betalt.", sw3: "99 % lyckandegrad: tas ett omdöme inte bort inom senast 14 dagar får du hela beloppet tillbaka. Är borttagning med mjukvara inte möjlig betalar du ingenting.",
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
    p1sw: (n) => `tak for din bestilling! Vi har modtaget ${n === 1 ? "anmeldelsen" : `de ${n} anmeldelser`} nedenfor og tjekker nu, om fjernelse med software er mulig.`,
    swH: "Fjernelse med software – betales forud, men først efter vores tjek", swWhy: "Google fjerner som regel ikke ældre anmeldelser fra USA eller bedømmelser med kun stjerner uden tekst manuelt – de kan kun fjernes med specialsoftware.",
    sw1: "Vi tjekker først, om fjernelse med software er mulig for din anmeldelse. Du betaler ikke noget endnu.", sw2: "Hvis det er muligt, får du en betalingsanmodning på {nt} pr. anmeldelse (mængderabat allerede fratrukket) – vi går i gang, så snart der er betalt.", sw3: "99 % succesrate: bliver en anmeldelse ikke fjernet senest inden for 14 dage, får du hele beløbet tilbage. Er fjernelse med software ikke mulig, betaler du intet.",
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
    p1sw: (n) => `takk for bestillingen! Vi har mottatt ${n === 1 ? "omtalen" : `de ${n} omtalene`} nedenfor og sjekker nå om fjerning med programvare er mulig.`,
    swH: "Fjerning med programvare – betales på forskudd, men først etter vår sjekk", swWhy: "Google fjerner som regel ikke eldre omtaler fra USA eller vurderinger med bare stjerner uten tekst manuelt – de kan bare fjernes med spesialprogramvare.",
    sw1: "Vi sjekker først om fjerning med programvare er mulig for omtalen din. Du betaler ingenting ennå.", sw2: "Er det mulig, får du en betalingsforespørsel på {nt} per omtale (mengderabatt allerede trukket fra) – vi starter så snart det er betalt.", sw3: "99 % suksessrate: blir en omtale ikke fjernet senest innen 14 dager, får du hele beløpet tilbake. Er fjerning med programvare ikke mulig, betaler du ingenting.",
    close: "Vi går nå gjennom omtalene dine og gir beskjed så snart vi har startet. Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

const fill = (s: string, per: string) => (s || "").replace(/\{per\}/g, per || "");

/** Inhaber-Nachweis (4–5-Sterne-Bewertungen): Hinweis in der Auftragsbestätigung. */
const VF: Record<string, [string, string]> = {
  de: ["Bitte kurz bestätigen, dass das Unternehmen Ihnen gehört", "Weil Sie Bewertungen mit 4 oder 5 Sternen beauftragt haben, brauchen wir einmalig einen Nachweis (z. B. Gewerbeschein, Firmenbuch-/Handelsregisterauszug oder Steuerbescheid) – damit niemand die guten Bewertungen fremder Unternehmen löschen lassen kann. Laden Sie ihn im Dashboard hoch: Die Prüfung dauert nur Sekunden, danach starten wir sofort."],
  en: ["Please confirm the business is yours", "Because you ordered the removal of reviews with 4 or 5 stars, we need a one-time proof (e.g. business licence, company register extract or tax document) – so nobody can have another company's good reviews removed. Upload it in your dashboard: the check takes seconds, then we start right away."],
  es: ["Confirma que la empresa es tuya", "Como has encargado eliminar reseñas de 4 o 5 estrellas, necesitamos una prueba única (p. ej. licencia de actividad, extracto del registro mercantil o documento fiscal), para que nadie pueda eliminar las buenas reseñas de otra empresa. Súbela en tu panel: la comprobación tarda segundos y después empezamos enseguida."],
  fr: ["Merci de confirmer que l’entreprise t’appartient", "Comme tu as demandé la suppression d’avis à 4 ou 5 étoiles, nous avons besoin une seule fois d’un justificatif (p. ex. Kbis, extrait du registre ou document fiscal), pour que personne ne puisse faire supprimer les bons avis d’une autre entreprise. Envoie-le dans ton espace client : la vérification prend quelques secondes, puis nous commençons tout de suite."],
  it: ["Conferma che l’attività è tua", "Poiché hai ordinato la rimozione di recensioni a 4 o 5 stelle, ci serve una prova una tantum (es. visura camerale o documento fiscale), così nessuno può far rimuovere le buone recensioni di un’altra attività. Caricala nella dashboard: la verifica richiede pochi secondi, poi iniziamo subito."],
  nl: ["Bevestig dat het bedrijf van u is", "Omdat u de verwijdering van reviews met 4 of 5 sterren hebt besteld, hebben we eenmalig een bewijs nodig (bijv. KvK-uittreksel of belastingdocument), zodat niemand de goede reviews van een ander bedrijf kan laten verwijderen. Upload het in uw dashboard: de controle duurt seconden, daarna starten we meteen."],
  pt: ["Confirma que a empresa é tua", "Como encomendaste a remoção de avaliações de 4 ou 5 estrelas, precisamos uma única vez de uma prova (p. ex. certidão permanente ou documento fiscal), para que ninguém possa mandar remover as boas avaliações de outra empresa. Envia-a no painel: a verificação demora segundos e depois começamos de imediato."],
  ja: ["ビジネスのオーナーであることをご確認ください", "星4〜5の口コミの削除をご依頼いただいたため、一度だけオーナー証明（営業許可証、登記事項証明書、税務書類など）が必要です。他社の良い口コミを第三者が削除できないようにするためです。ダッシュボードからアップロードしてください。確認は数秒で終わり、すぐに開始します。"],
  sv: ["Bekräfta att företaget är ditt", "Eftersom du har beställt borttagning av omdömen med 4 eller 5 stjärnor behöver vi ett engångsbevis (t.ex. registreringsbevis eller skattedokument) – så att ingen kan få ett annat företags bra omdömen borttagna. Ladda upp det i din översikt: kontrollen tar sekunder, sedan börjar vi direkt."],
  da: ["Bekræft, at virksomheden er din", "Da du har bestilt fjernelse af anmeldelser med 4 eller 5 stjerner, har vi én gang brug for et bevis (fx CVR-udskrift eller skattedokument) – så ingen kan få en anden virksomheds gode anmeldelser fjernet. Upload det i dit dashboard: kontrollen tager sekunder, derefter går vi straks i gang."],
  no: ["Bekreft at bedriften er din", "Siden du har bestilt fjerning av anmeldelser med 4 eller 5 stjerner, trenger vi ett bevis én gang (f.eks. firmaattest eller skattedokument) – slik at ingen kan få et annet firmas gode anmeldelser fjernet. Last det opp i dashbordet: kontrollen tar sekunder, deretter starter vi med en gang."],
};

export function subject(p: AuftragsbestaetigungReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject((p.items || []).length || (p.urls || []).length || 1);
}

export default function AuftragsbestaetigungReviews({ lang = "en", name = "", items = [], urls = [], per = "", total = "", currency = "", orderId = "", chatPct = 0, verify = false, dash, _overrides }: AuftragsbestaetigungReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const list: ReviewRef[] = items.length ? items : urls.map((u) => ({ url: u }));
  const n = list.length || 1;
  const cur = reviewCurrency(currency, per);
  // Zwei Verfahren: „Zahlung nach Löschung" (Standard / rechtliche Meldung) und Software-Fälle (vorab, erst nach unserer Prüfung).
  const sw = list.filter(isSwItem), rest = list.filter((it) => !isSwItem(it));
  const all = quoteReviews(list, cur, undefined, "full", chatPct);
  const perRest = rest.length ? quoteReviews(rest, cur, list.length, "full", chatPct).per : per;
  const swUnit = fmtReviewMoney(Math.round((REVIEW_NOTEXT_PRICE * (100 - all.pct)) / 100), cur);
  const prices = <ReviewPriceLines lang={lang} items={list} currency={cur} minPct={chatPct} />;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{sw.length && !rest.length ? t.p1sw(n) : t.p1(n)}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      <P><strong>{t.listH}</strong></P>
      <Bullets items={list.map((it, i) => it.url
        ? <a key={i} href={it.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{it.url}</a>
        : <span key={i}><strong>{it.name}</strong>{it.text ? <> — “{it.text}”</> : null}</span>
      )} />

      {rest.length || !sw.length ? (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.termsH}</span><br />
          1. {t.term1}<br />
          2. {fill(t.term2, perRest)}{total && !list.length ? <span style={{ color: brand.muted }}> ({total} max.)</span> : null}<br />
          3. {t.term3}
          {!sw.length ? prices : null}
        </NoteBox>
      ) : null}

      {sw.length ? (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.swH}</span><br />
          <span style={{ display: "block", margin: "4px 0 6px" }}>{t.swWhy}</span>
          1. {t.sw1}<br />
          2. {(t.sw2 || "").replace("{nt}", swUnit)}<br />
          3. {t.sw3}
          {prices}
        </NoteBox>
      ) : null}

      {rest.length || !sw.length ? <P><strong>{t.condH}:</strong> {t.cond1} {!sw.length ? (t.cond2 || "").replace("{nt}", fmtReviewMoney(REVIEW_NOTEXT_PRICE, cur)) : ""}</P> : null}

      {verify ? (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>{(VF[lang] || VF.en)[0]}</span><br />
          {(VF[lang] || VF.en)[1]}
        </NoteBox>
      ) : null}

      <DashBox lang={lang} dash={dash} />
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
