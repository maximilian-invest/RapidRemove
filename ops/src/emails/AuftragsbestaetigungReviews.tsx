/* Template: Auftragsbestätigung „Einzelne Bewertungen löschen".
   Geht SOFORT nach der Bestellung an den Kunden (wie bei allen Produkten).
   Hält die Abrechnungsregeln fest:
   bezahlt wird NUR je tatsächlich gelöschter Bewertung (auch Software-Fälle),
   automatisch abgebucht am Tag der Löschung. Fremdsprachen im „du"-Ton; deutsche Fassung (Sie-Form) für
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
  /** Anzahl der Bewertungen, die auf den Nachweis warten (nur 4–5 ★); die übrigen starten ohne Nachweis. */
  verifyN?: number;
  payGate?: boolean;
  /** Gründe je Bewertung im Dashboard angeben (10/2026) → ein gemeinsamer „Auftrag starten"-Block statt einzelner Hinweise. */
  reasons?: boolean;
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
  /** Nachbestellung: Bewertung(en) zu einem bestehenden Auftrag hinzugefügt. */
  added?: boolean;
  /** Zeitpunkt der Zusicherung „Bewertungen verstoßen gegen die Google-Richtlinien" (ISO) → Bestätigungszeile in der Mail. */
  policyAt?: string;
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
    term3: "Abgebucht wird automatisch von Ihrer hinterlegten Zahlungsart, sobald eine Bewertung gelöscht ist. Die Rechnung kommt am selben Tag per E-Mail.",
    condH: "Gut zu wissen",
    cond1: "Bewertungen bis 4 Wochen alt haben eine Erfolgsquote von ca. 90 %. Bei älteren Bewertungen außerhalb der USA gehen wir zuerst mit rechtlichen Meldungen vor, damit verschwinden über 90 % (der Aufpreis ist im Preis oben schon enthalten).",
    cond2: "Ältere Bewertungen aus den USA und Bewertungen ohne Text (reine Sternebewertungen) lassen sich meist nur per Spezial-Software löschen, weil Google sie nicht von Hand entfernt. Dasselbe gilt für ältere Bewertungen aus anderen Ländern, die nach unserer rechtlichen Meldung stehen bleiben. Die Software-Löschung kostet {nt} je Bewertung. Wir prüfen zuerst, ob sie bei Ihrer Bewertung möglich ist, und auch hier wird erst abgebucht, wenn die Bewertung gelöscht ist. Klappt es nicht, zahlen Sie nichts.",
    p1sw: (n) => `vielen Dank für Ihren Auftrag! Wir haben ${n === 1 ? "die untenstehende Bewertung" : `die ${n} untenstehenden Bewertungen`} erhalten und prüfen jetzt, ob die Software-Löschung möglich ist.`,
    swH: "Software-Löschung – bezahlt wird nur bei Erfolg", swWhy: "Ältere Bewertungen aus den USA und reine Sternebewertungen ohne Text entfernt Google in der Regel nicht von Hand – sie lassen sich nur per Spezial-Software löschen.",
    sw1: "Wir prüfen zuerst, ob die Software-Löschung bei Ihrer Bewertung möglich ist. Bis dahin zahlen Sie nichts.", sw2: "Ist sie möglich, starten wir sofort – Voraussetzung ist eine hinterlegte Zahlungsart in Ihrem Dashboard. Abgebucht werden {nt} je Bewertung (Mengenrabatt schon abgezogen), aber erst, wenn die Bewertung gelöscht ist.", sw3: "Die Erfolgsquote ist sehr hoch. Klappt es trotzdem nicht oder ist keine Software-Löschung möglich, zahlen Sie nichts.",
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
    term3: "You're charged automatically to your saved payment method once a review has been removed. The invoice arrives by email the same day.",
    condH: "Good to know",
    cond1: "Reviews up to 4 weeks old have a success rate of about 90 %. For older reviews outside the USA we first file legal notices, which removes over 90 % of them (the surcharge is already included in the price above).",
    cond2: "Older reviews from the USA and reviews without text (star ratings only) can usually only be removed with special software, because Google doesn't remove them by hand. The same applies to older reviews from other countries that remain after our legal notice. Software removal costs {nt} per review. We first check whether it's possible for your review, and here too you're only charged once the review has been removed. If it doesn't work, you pay nothing.",
    p1sw: (n) => `thanks for your order! We've received ${n === 1 ? "the review" : `the ${n} reviews`} below and are now checking whether software removal is possible.`,
    swH: "Software removal – charged only on success", swWhy: "Google usually doesn't remove older reviews from the USA or star-only ratings without text by hand – they can only be removed with special software.",
    sw1: "We first check whether software removal is possible for your review. You don't pay anything until then.", sw2: "If it is, we start right away – all you need is a saved payment method in your dashboard. {nt} per review (volume discount already applied) is only charged once the review has been removed.", sw3: "The success rate is very high. If it still doesn't work, or software removal isn't possible, you pay nothing.",
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
    term3: "Se cobra automáticamente a tu método de pago guardado en cuanto se elimina una reseña. La factura te llega por correo el mismo día.",
    condH: "A tener en cuenta",
    cond1: "Las reseñas de hasta 4 semanas tienen una tasa de éxito de aprox. el 90 %. Para las reseñas antiguas de fuera de EE. UU., primero presentamos avisos legales, con los que se elimina más del 90 % (el recargo ya está incluido en el precio de arriba).",
    cond2: "Las reseñas antiguas de EE. UU. y las reseñas sin texto (solo estrellas) normalmente solo se pueden eliminar con un software especial, porque Google no las elimina a mano. Lo mismo vale para las reseñas antiguas de otros países que siguen ahí tras nuestro aviso legal. La eliminación por software cuesta {nt} por reseña. Primero comprobamos si es posible en tu reseña y, también aquí, solo se cobra cuando la reseña se ha eliminado. Si no funciona, no pagas nada.",
    p1sw: (n) => `¡gracias por tu pedido! Hemos recibido ${n === 1 ? "la reseña" : `las ${n} reseñas`} de abajo y ahora comprobamos si es posible la eliminación por software.`,
    swH: "Eliminación por software: solo pagas si funciona", swWhy: "Google normalmente no elimina a mano las reseñas antiguas de EE. UU. ni las valoraciones solo con estrellas sin texto: solo se pueden eliminar con un software especial.",
    sw1: "Primero comprobamos si la eliminación por software es posible para tu reseña. Hasta entonces no pagas nada.", sw2: "Si es posible, empezamos enseguida; solo necesitas un método de pago guardado en tu panel. Los {nt} por reseña (descuento por volumen ya aplicado) se cobran solo cuando la reseña se ha eliminado.", sw3: "La tasa de éxito es muy alta. Si aun así no funciona o la eliminación por software no es posible, no pagas nada.",
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
    term3: "Le montant est débité automatiquement sur ton moyen de paiement enregistré dès qu'un avis est supprimé. La facture t'arrive par e-mail le jour même.",
    condH: "Bon à savoir",
    cond1: "Les avis de moins de 4 semaines ont un taux de réussite d'environ 90 %. Pour les avis plus anciens hors des États-Unis, nous passons d'abord par des signalements juridiques, qui en font disparaître plus de 90 % (le supplément est déjà inclus dans le prix ci-dessus).",
    cond2: "Les avis anciens provenant des États-Unis et les avis sans texte (étoiles uniquement) ne peuvent généralement être supprimés qu'avec un logiciel spécial, car Google ne les supprime pas manuellement. Il en va de même pour les avis anciens d'autres pays qui restent en ligne après notre signalement juridique. La suppression par logiciel coûte {nt} par avis. Nous vérifions d'abord qu'elle est possible pour ton avis et, là aussi, le débit n'a lieu qu'une fois l'avis supprimé. Si ça ne marche pas, tu ne paies rien.",
    p1sw: (n) => `merci pour ta commande ! Nous avons bien reçu ${n === 1 ? "l'avis" : `les ${n} avis`} ci-dessous et vérifions maintenant si la suppression par logiciel est possible.`,
    swH: "Suppression par logiciel – payée seulement en cas de succès", swWhy: "Google ne supprime généralement pas à la main les avis anciens des États-Unis ni les notes sans texte : ils ne peuvent être supprimés qu'avec un logiciel spécial.",
    sw1: "Nous vérifions d'abord si la suppression par logiciel est possible pour ton avis. Jusque-là, tu ne paies rien.", sw2: "Si c'est possible, nous commençons tout de suite – il suffit d'un moyen de paiement enregistré dans ton espace client. Les {nt} par avis (remise sur quantité déjà déduite) ne sont débités qu'une fois l'avis supprimé.", sw3: "Le taux de réussite est très élevé. Si ça ne marche quand même pas, ou si la suppression par logiciel n'est pas possible, tu ne paies rien.",
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
    term3: "L'addebito avviene automaticamente sul metodo di pagamento salvato appena una recensione viene rimossa. La fattura ti arriva via e-mail lo stesso giorno.",
    condH: "Buono a sapersi",
    cond1: "Le recensioni fino a 4 settimane hanno una probabilità di successo di circa il 90 %. Per le recensioni più vecchie fuori dagli USA presentiamo prima delle segnalazioni legali, che ne rimuovono oltre il 90 % (il supplemento è già incluso nel prezzo sopra).",
    cond2: "Le recensioni più vecchie dagli USA e le recensioni senza testo (solo stelle) di solito si possono rimuovere solo con un software speciale, perché Google non le rimuove a mano. Lo stesso vale per le recensioni più vecchie di altri Paesi che restano online dopo la nostra segnalazione legale. La rimozione tramite software costa {nt} a recensione. Prima verifichiamo che sia possibile per la tua recensione e, anche qui, l'addebito avviene solo quando la recensione è stata rimossa. Se non funziona, non paghi nulla.",
    p1sw: (n) => `grazie per il tuo ordine! Abbiamo ricevuto ${n === 1 ? "la recensione" : `le ${n} recensioni`} qui sotto e ora verifichiamo se la rimozione via software è possibile.`,
    swH: "Rimozione via software – paghi solo se riesce", swWhy: "Di solito Google non rimuove a mano le recensioni vecchie dagli USA né le valutazioni solo a stelle senza testo: si possono rimuovere solo con un software speciale.",
    sw1: "Prima verifichiamo se la rimozione via software è possibile per la tua recensione. Fino ad allora non paghi nulla.", sw2: "Se è possibile, iniziamo subito: basta un metodo di pagamento salvato nella dashboard. I {nt} a recensione (sconto quantità già applicato) vengono addebitati solo quando la recensione è stata rimossa.", sw3: "La percentuale di successo è molto alta. Se comunque non funziona o la rimozione via software non è possibile, non paghi nulla.",
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
    term3: "Het bedrag wordt automatisch afgeschreven van je opgeslagen betaalmethode zodra een review is verwijderd. De factuur krijg je diezelfde dag per e-mail.",
    condH: "Goed om te weten",
    cond1: "Reviews tot 4 weken oud hebben een slagingskans van ongeveer 90 %. Bij oudere reviews van buiten de VS dienen we eerst juridische meldingen in, waarmee meer dan 90 % verdwijnt (de toeslag is al inbegrepen in de prijs hierboven).",
    cond2: "Oudere reviews uit de VS en reviews zonder tekst (alleen sterren) kunnen meestal alleen met speciale software worden verwijderd, omdat Google ze niet handmatig verwijdert. Hetzelfde geldt voor oudere reviews uit andere landen die na onze juridische melding blijven staan. Verwijdering met software kost {nt} per review. We controleren eerst of het bij uw review mogelijk is, en ook hier wordt pas afgeschreven als de review verwijderd is. Lukt het niet, dan betaalt u niets.",
    p1sw: (n) => `bedankt voor je bestelling! We hebben ${n === 1 ? "de review" : `de ${n} reviews`} hieronder ontvangen en controleren nu of verwijdering via software mogelijk is.`,
    swH: "Verwijdering via software – je betaalt alleen bij succes", swWhy: "Google verwijdert oudere reviews uit de VS en beoordelingen met alleen sterren zonder tekst meestal niet handmatig – die kunnen alleen met speciale software worden verwijderd.",
    sw1: "We controleren eerst of verwijdering via software mogelijk is voor je review. Tot dan betaal je niets.", sw2: "Is het mogelijk, dan starten we meteen – je hebt alleen een opgeslagen betaalmethode in je dashboard nodig. De {nt} per review (volumekorting al verrekend) wordt pas afgeschreven als de review verwijderd is.", sw3: "De slagingskans is zeer hoog. Lukt het toch niet of is verwijdering via software niet mogelijk, dan betaal je niets.",
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
    term3: "O valor é cobrado automaticamente no método de pagamento guardado assim que uma avaliação é removida. A fatura chega-te por e-mail no mesmo dia.",
    condH: "Bom saber",
    cond1: "As avaliações com até 4 semanas têm uma taxa de sucesso de cerca de 90 %. Nas avaliações mais antigas de fora dos EUA, começamos por apresentar denúncias legais, que removem mais de 90 % (o suplemento já está incluído no preço acima).",
    cond2: "As avaliações antigas dos EUA e as avaliações sem texto (só estrelas) normalmente só podem ser removidas com um software especial, porque o Google não as remove manualmente. O mesmo se aplica às avaliações antigas de outros países que ficam online depois da nossa denúncia legal. A remoção por software custa {nt} por avaliação. Primeiro verificamos se é possível na tua avaliação e, também aqui, só é cobrada quando a avaliação for removida. Se não resultar, não pagas nada.",
    p1sw: (n) => `obrigado pela tua encomenda! Recebemos ${n === 1 ? "a avaliação" : `as ${n} avaliações`} abaixo e estamos agora a verificar se a remoção por software é possível.`,
    swH: "Remoção por software – só pagas se resultar", swWhy: "Normalmente, o Google não remove manualmente avaliações antigas dos EUA nem classificações só com estrelas sem texto – só podem ser removidas com software especial.",
    sw1: "Primeiro verificamos se a remoção por software é possível para a tua avaliação. Até lá não pagas nada.", sw2: "Se for possível, começamos logo – basta um método de pagamento guardado no teu painel. Os {nt} por avaliação (desconto de volume já aplicado) só são cobrados quando a avaliação for removida.", sw3: "A taxa de sucesso é muito alta. Se mesmo assim não resultar, ou se a remoção por software não for possível, não pagas nada.",
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
    term3: "口コミが削除されると、ご登録のお支払い方法に自動で請求されます。請求書は同日にメールでお届けします。",
    condH: "ご参考までに",
    cond1: "投稿から4週間以内の口コミの成功率は約90%です。米国以外の古い口コミについては、まず法的な申し立てを行い、90%以上が削除されます（追加料金は上記の料金に含まれています）。",
    cond2: "米国の古い口コミと本文のない口コミ（星のみの評価）は、Googleが手作業で削除しないため、通常は専用ソフトウェアでしか削除できません。その他の国の古い口コミで、法的な申し立ての後も残ったものも同様です。ソフトウェアによる削除は1件{nt}です。まずお客様の口コミで削除が可能かを当社が確認し、こちらも口コミが削除された場合にのみ請求されます。削除できなかった場合、お支払いは発生しません。",
    p1sw: (n) => `ご注文ありがとうございます。以下の口コミ${n}件を受領し、ソフトウェアによる削除が可能かを確認しています。`,
    swH: "ソフトウェア削除 – 成功した場合のみ請求", swWhy: "米国の古い口コミや本文のない星だけの評価は、通常Googleが手動で削除しないため、専用ソフトウェアでのみ削除できます。",
    sw1: "まず、お客様の口コミがソフトウェアで削除可能かを確認します。それまでお支払いは発生しません。", sw2: "削除可能な場合、ダッシュボードにお支払い方法が登録されていればすぐに開始します。口コミ1件あたり{nt}（まとめ割引適用済み）は、口コミが削除された時点で初めて請求されます。", sw3: "成功率は非常に高いですが、万一削除できなかった場合やソフトウェア削除ができない場合、お支払いは発生しません。",
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
    term3: "Beloppet dras automatiskt från din sparade betalningsmetod så snart ett omdöme har tagits bort. Fakturan kommer via mejl samma dag.",
    condH: "Bra att veta",
    cond1: "Omdömen upp till 4 veckor gamla har en framgångsgrad på cirka 90 %. För äldre omdömen utanför USA gör vi först juridiska anmälningar, som tar bort över 90 % (tillägget ingår redan i priset ovan).",
    cond2: "Äldre omdömen från USA och omdömen utan text (bara stjärnor) kan oftast bara tas bort med specialprogramvara, eftersom Google inte tar bort dem manuellt. Detsamma gäller äldre omdömen från andra länder som ligger kvar efter vår juridiska anmälan. Borttagning med programvara kostar {nt} per omdöme. Vi kontrollerar först att det är möjligt för ditt omdöme, och även här dras pengarna först när omdömet har tagits bort. Lyckas det inte betalar du ingenting.",
    p1sw: (n) => `tack för din beställning! Vi har tagit emot ${n === 1 ? "omdömet" : `de ${n} omdömena`} nedan och kontrollerar nu om borttagning med mjukvara är möjlig.`,
    swH: "Borttagning med mjukvara – du betalar bara om det lyckas", swWhy: "Google tar oftast inte bort äldre omdömen från USA eller betyg med bara stjärnor utan text manuellt – de kan bara tas bort med specialmjukvara.",
    sw1: "Vi kontrollerar först om borttagning med mjukvara är möjlig för ditt omdöme. Fram till dess betalar du ingenting.", sw2: "Om det går börjar vi direkt – du behöver bara en sparad betalningsmetod i din översikt. {nt} per omdöme (mängdrabatt redan avdragen) dras först när omdömet har tagits bort.", sw3: "Lyckandegraden är mycket hög. Går det ändå inte, eller är borttagning med mjukvara inte möjlig, betalar du ingenting.",
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
    term3: "Beløbet trækkes automatisk fra din gemte betalingsmetode, så snart en anmeldelse er fjernet. Fakturaen kommer på mail samme dag.",
    condH: "Godt at vide",
    cond1: "Anmeldelser op til 4 uger gamle har en succesrate på ca. 90 %. Ved ældre anmeldelser uden for USA sender vi først juridiske indberetninger, som fjerner over 90 % (tillægget er allerede med i prisen ovenfor).",
    cond2: "Ældre anmeldelser fra USA og anmeldelser uden tekst (kun stjerner) kan som regel kun fjernes med speciel software, fordi Google ikke fjerner dem manuelt. Det samme gælder ældre anmeldelser fra andre lande, der stadig står der efter vores juridiske indberetning. Fjernelse med software koster {nt} pr. anmeldelse. Vi tjekker først, om det er muligt for din anmeldelse, og også her trækkes beløbet først, når anmeldelsen er fjernet. Lykkes det ikke, betaler du intet.",
    p1sw: (n) => `tak for din bestilling! Vi har modtaget ${n === 1 ? "anmeldelsen" : `de ${n} anmeldelser`} nedenfor og tjekker nu, om fjernelse med software er mulig.`,
    swH: "Fjernelse med software – du betaler kun, hvis det lykkes", swWhy: "Google fjerner som regel ikke ældre anmeldelser fra USA eller bedømmelser med kun stjerner uden tekst manuelt – de kan kun fjernes med specialsoftware.",
    sw1: "Vi tjekker først, om fjernelse med software er mulig for din anmeldelse. Indtil da betaler du ikke noget.", sw2: "Hvis det er muligt, går vi i gang med det samme – du skal blot have en gemt betalingsmetode i dit dashboard. {nt} pr. anmeldelse (mængderabat allerede fratrukket) trækkes først, når anmeldelsen er fjernet.", sw3: "Succesraten er meget høj. Lykkes det alligevel ikke, eller er fjernelse med software ikke mulig, betaler du intet.",
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
    term3: "Beløpet trekkes automatisk fra den lagrede betalingsmetoden din så snart en omtale er fjernet. Fakturaen kommer på e-post samme dag.",
    condH: "Greit å vite",
    cond1: "Omtaler som er opptil 4 uker gamle har en suksessrate på rundt 90 %. For eldre omtaler utenfor USA sender vi først juridiske varsler, som fjerner over 90 % (tillegget er allerede inkludert i prisen over).",
    cond2: "Eldre omtaler fra USA og omtaler uten tekst (bare stjerner) kan som regel bare fjernes med spesialprogramvare, fordi Google ikke fjerner dem manuelt. Det samme gjelder eldre omtaler fra andre land som blir stående etter vårt juridiske varsel. Fjerning med programvare koster {nt} per omtale. Vi sjekker først at det er mulig for omtalen din, og også her trekkes beløpet først når omtalen er fjernet. Lykkes det ikke, betaler du ingenting.",
    p1sw: (n) => `takk for bestillingen! Vi har mottatt ${n === 1 ? "omtalen" : `de ${n} omtalene`} nedenfor og sjekker nå om fjerning med programvare er mulig.`,
    swH: "Fjerning med programvare – du betaler bare hvis det lykkes", swWhy: "Google fjerner som regel ikke eldre omtaler fra USA eller vurderinger med bare stjerner uten tekst manuelt – de kan bare fjernes med spesialprogramvare.",
    sw1: "Vi sjekker først om fjerning med programvare er mulig for omtalen din. Frem til da betaler du ingenting.", sw2: "Er det mulig, starter vi med en gang – du trenger bare en lagret betalingsmetode i dashbordet. {nt} per omtale (mengderabatt allerede trukket fra) trekkes først når omtalen er fjernet.", sw3: "Suksessraten er svært høy. Lykkes det likevel ikke, eller er fjerning med programvare ikke mulig, betaler du ingenting.",
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

/** Zahlungsart hinterlegen („Automatisch bezahlen"): Auftrag startet erst danach. */
/* Schritt-Überschriften, wenn Zahlungsart UND Nachweis fehlen: [Titel Schritt 1 (ersetzt „Letzter Schritt"), Präfix Schritt 2]. */
const STEP: Record<string, [string, string]> = {
  de: ["Schritt 1: Zahlungsart hinterlegen", "Schritt 2: "], en: ["Step 1: add a payment method", "Step 2: "], es: ["Paso 1: añade un método de pago", "Paso 2: "],
  fr: ["Étape 1 : ajoute un moyen de paiement", "Étape 2 : "], it: ["Passo 1: aggiungi un metodo di pagamento", "Passo 2: "], nl: ["Stap 1: voeg een betaalmethode toe", "Stap 2: "],
  pt: ["Passo 1: adiciona um método de pagamento", "Passo 2: "], ja: ["ステップ1：お支払い方法の登録", "ステップ2："], sv: ["Steg 1: lägg till en betalningsmetod", "Steg 2: "],
  da: ["Trin 1: tilføj en betalingsmetode", "Trin 2: "], no: ["Steg 1: legg til en betalingsmetode", "Steg 2: "],
};
/* Nachweis nur für einen Teil: „Nur für k Bewertung(en) mit 4–5 Sternen – die übrigen r starten ohne Nachweis." */
const VFP: Record<string, (k: number, r: number) => string> = {
  de: (k, r) => `Nur für ${k === 1 ? "1 Bewertung" : k + " Bewertungen"} mit 4–5 Sternen – ${r === 1 ? "die andere startet" : "die übrigen " + r + " starten"} ohne Nachweis.`,
  en: (k, r) => `Only for ${k === 1 ? "1 review" : k + " reviews"} with 4–5 stars – ${r === 1 ? "the other one starts" : "the other " + r + " start"} without proof.`,
  es: (k, r) => `Solo para ${k === 1 ? "1 reseña" : k + " reseñas"} de 4–5 estrellas; ${r === 1 ? "la otra empieza" : "las otras " + r + " empiezan"} sin prueba.`,
  fr: (k, r) => `Seulement pour ${k === 1 ? "1 avis" : k + " avis"} à 4–5 étoiles – ${r === 1 ? "l’autre démarre" : "les " + r + " autres démarrent"} sans justificatif.`,
  it: (k, r) => `Solo per ${k === 1 ? "1 recensione" : k + " recensioni"} a 4–5 stelle: ${r === 1 ? "l’altra parte" : "le altre " + r + " partono"} senza prova.`,
  nl: (k, r) => `Alleen voor ${k === 1 ? "1 review" : k + " reviews"} met 4–5 sterren – ${r === 1 ? "de andere start" : "de andere " + r + " starten"} zonder bewijs.`,
  pt: (k, r) => `Só para ${k === 1 ? "1 avaliação" : k + " avaliações"} de 4–5 estrelas – ${r === 1 ? "a outra começa" : "as outras " + r + " começam"} sem prova.`,
  ja: (k, r) => `星4〜5の口コミ${k}件のみが対象です。その他の${r}件は証明なしで開始します。`,
  sv: (k, r) => `Bara för ${k === 1 ? "1 omdöme" : k + " omdömen"} med 4–5 stjärnor – ${r === 1 ? "det andra startar" : "de andra " + r + " startar"} utan bevis.`,
  da: (k, r) => `Kun for ${k === 1 ? "1 anmeldelse" : k + " anmeldelser"} med 4–5 stjerner – ${r === 1 ? "den anden starter" : "de andre " + r + " starter"} uden bevis.`,
  no: (k, r) => `Bare for ${k === 1 ? "1 omtale" : k + " omtaler"} med 4–5 stjerner – ${r === 1 ? "den andre starter" : "de andre " + r + " starter"} uten bevis.`,
};
const PG: Record<string, [string, string]> = {
  de: ["Letzter Schritt: Zahlungsart hinterlegen", "Bitte hinterlegen Sie in Ihrem Dashboard eine Zahlungsart (Karte, PayPal …). Abgebucht wird nur, wenn eine Bewertung tatsächlich gelöscht ist – vorher zahlen Sie nichts. Sobald die Zahlungsart hinterlegt ist, starten wir mit der Löschung."],
  en: ["Last step: add a payment method", "Please add a payment method (card, PayPal …) in your dashboard. You're only charged when a review has actually been removed – nothing before that. As soon as it's saved, we start the removal."],
  es: ["Último paso: añade un método de pago", "Añade un método de pago (tarjeta, PayPal…) en tu panel. Solo se cobra cuando una reseña se ha eliminado de verdad; antes no pagas nada. En cuanto esté guardado, empezamos con la eliminación."],
  fr: ["Dernière étape : ajoute un moyen de paiement", "Ajoute un moyen de paiement (carte, PayPal…) dans ton espace client. Tu n'es débité que lorsqu'un avis a réellement été supprimé – rien avant. Dès qu'il est enregistré, nous lançons la suppression."],
  it: ["Ultimo passo: aggiungi un metodo di pagamento", "Aggiungi un metodo di pagamento (carta, PayPal…) nella dashboard. L'addebito avviene solo quando una recensione è stata davvero rimossa – prima non paghi nulla. Appena è salvato, iniziamo la rimozione."],
  nl: ["Laatste stap: voeg een betaalmethode toe", "Voeg in uw dashboard een betaalmethode toe (kaart, PayPal …). Er wordt alleen afgeschreven als een review echt is verwijderd – daarvoor betaalt u niets. Zodra die is opgeslagen, starten we met verwijderen."],
  pt: ["Último passo: adiciona um método de pagamento", "Adiciona um método de pagamento (cartão, PayPal…) no teu painel. Só é cobrado quando uma avaliação é realmente removida – antes disso não pagas nada. Assim que estiver guardado, começamos a remoção."],
  ja: ["最後のステップ：お支払い方法の登録", "ダッシュボードでお支払い方法（カード、PayPalなど）をご登録ください。請求は口コミが実際に削除された場合のみで、それまでは一切かかりません。登録が完了次第、削除を開始します。"],
  sv: ["Sista steget: lägg till en betalningsmetod", "Lägg till en betalningsmetod (kort, PayPal …) i din översikt. Du debiteras bara när ett omdöme faktiskt har tagits bort – inget innan dess. Så snart den är sparad börjar vi med borttagningen."],
  da: ["Sidste trin: tilføj en betalingsmetode", "Tilføj en betalingsmetode (kort, PayPal …) i dit dashboard. Der trækkes kun, når en anmeldelse faktisk er fjernet – intet før. Så snart den er gemt, går vi i gang med fjernelsen."],
  no: ["Siste steg: legg til en betalingsmetode", "Legg til en betalingsmetode (kort, PayPal …) i dashbordet. Du belastes bare når en anmeldelse faktisk er fjernet – ingenting før det. Så snart den er lagret, starter vi fjerningen."],
};

/** Auftrag im Dashboard starten (Gründe → ggf. Nachweis → ggf. Zahlungsart): [Titel, Einleitung, Gründe, Nachweis, Zahlungsart, Schluss]. */
const START: Record<string, [string, string, string, string, string, string]> = {
  de: ["Nächster Schritt: Auftrag im Dashboard starten", "Dauert ca. 2 Minuten – dann legen wir sofort los:", "Je Bewertung kurz antippen, warum sie gegen die Google-Richtlinien verstößt", "Kurzer Nachweis, dass das Unternehmen Ihnen gehört (nur bei 4–5 Sternen)", "Zahlungsart hinterlegen – abgebucht wird erst, wenn eine Bewertung gelöscht ist", "Solange das fehlt, können wir mit der Bearbeitung nicht beginnen."],
  en: ["Next step: start your order in your dashboard", "Takes about 2 minutes – then we start right away:", "Tap why each review violates Google's policies", "Quick proof that the business is yours (only for 4–5 stars)", "Add a payment method – you're only charged once a review is removed", "Until this is done, we can't start working on your reviews."],
  es: ["Siguiente paso: inicia tu pedido en tu panel", "Tarda unos 2 minutos y empezamos enseguida:", "Indica con un toque por qué cada reseña infringe las políticas de Google", "Breve prueba de que la empresa es tuya (solo con 4–5 estrellas)", "Añade un método de pago: solo se cobra cuando se elimina una reseña", "Mientras falte esto, no podemos empezar."],
  fr: ["Prochaine étape : lance ta commande dans ton espace", "Environ 2 minutes – ensuite nous commençons tout de suite :", "Indique d’un geste pourquoi chaque avis enfreint les règles de Google", "Court justificatif que l’entreprise est bien la tienne (seulement pour 4–5 étoiles)", "Ajoute un moyen de paiement – tu n’es débité que lorsqu’un avis est supprimé", "Tant que ce n’est pas fait, nous ne pouvons pas commencer."],
  it: ["Prossimo passo: avvia l’ordine nella tua dashboard", "Ci vogliono circa 2 minuti, poi iniziamo subito:", "Indica con un tocco perché ogni recensione viola le norme di Google", "Breve prova che l’attività è tua (solo per 4–5 stelle)", "Aggiungi un metodo di pagamento: l’addebito avviene solo quando una recensione viene rimossa", "Finché manca, non possiamo iniziare."],
  nl: ["Volgende stap: start uw opdracht in uw dashboard", "Duurt ongeveer 2 minuten – daarna starten we meteen:", "Tik per review aan waarom die in strijd is met het Google-beleid", "Kort bewijs dat het bedrijf van u is (alleen bij 4–5 sterren)", "Voeg een betaalmethode toe – er wordt pas afgeschreven als een review is verwijderd", "Zolang dit ontbreekt, kunnen we niet beginnen."],
  pt: ["Próximo passo: inicia a tua encomenda no painel", "Demora cerca de 2 minutos – depois começamos logo:", "Indica com um toque porque cada avaliação viola as políticas da Google", "Breve prova de que a empresa é tua (só para 4–5 estrelas)", "Adiciona um método de pagamento – só é cobrado quando uma avaliação é removida", "Enquanto isto faltar, não podemos começar."],
  ja: ["次のステップ：ダッシュボードでご依頼を開始", "約2分で完了し、すぐに作業を開始します：", "各口コミがGoogleのポリシーに違反する理由をタップで選択", "事業者ご本人であることの簡単な証明（星4〜5の場合のみ）", "お支払い方法の登録（口コミが削除された場合のみ請求）", "これが完了するまで作業を開始できません。"],
  sv: ["Nästa steg: starta din beställning i din dashboard", "Tar ungefär 2 minuter – sedan börjar vi direkt:", "Tryck på varför varje omdöme bryter mot Googles riktlinjer", "Kort bevis på att företaget är ditt (bara vid 4–5 stjärnor)", "Lägg till en betalningsmetod – du debiteras först när ett omdöme har tagits bort", "Tills detta är gjort kan vi inte börja."],
  da: ["Næste trin: start din ordre i dit dashboard", "Tager ca. 2 minutter – så går vi straks i gang:", "Tryk på, hvorfor hver anmeldelse overtræder Googles retningslinjer", "Kort bevis for, at virksomheden er din (kun ved 4–5 stjerner)", "Tilføj en betalingsmetode – der trækkes først, når en anmeldelse er fjernet", "Indtil det er gjort, kan vi ikke gå i gang."],
  no: ["Neste steg: start bestillingen i dashbordet", "Tar ca. 2 minutter – så starter vi med en gang:", "Trykk på hvorfor hver omtale bryter med Googles retningslinjer", "Kort bevis på at bedriften er din (bare ved 4–5 stjerner)", "Legg til en betalingsmetode – du belastes først når en omtale er fjernet", "Til dette er gjort, kan vi ikke starte."],
};

/** Nachbestellung: [Betreff, Titel, Einleitung] – n = Anzahl, id = Bestell-Nr. */
type AddT = [(n: number, id: string) => string, string, (n: number, id: string) => string];
const ADD: Record<string, AddT> = {
  de: [(n, id) => `${n === 1 ? "Bewertung" : `${n} Bewertungen`} zu Ihrem Auftrag ${id} hinzugefügt`, "Bewertung hinzugefügt ✓", (n, id) => `wir haben ${n === 1 ? "die untenstehende Bewertung" : `die ${n} untenstehenden Bewertungen`} zu Ihrem Auftrag ${id} hinzugefügt. Es gelten dieselben Bedingungen wie bisher.`],
  en: [(n, id) => `${n === 1 ? "Review" : `${n} reviews`} added to your order ${id}`, "Review added ✓", (n, id) => `we've added ${n === 1 ? "the review below" : `the ${n} reviews below`} to your order ${id}. Same terms as before.`],
  es: [(n, id) => `${n === 1 ? "Reseña añadida" : `${n} reseñas añadidas`} a tu pedido ${id}`, "Reseña añadida ✓", (n, id) => `hemos añadido ${n === 1 ? "la reseña de abajo" : `las ${n} reseñas de abajo`} a tu pedido ${id}. Se aplican las mismas condiciones que hasta ahora.`],
  fr: [(n, id) => `${n === 1 ? "Avis ajouté" : `${n} avis ajoutés`} à ta commande ${id}`, "Avis ajouté ✓", (n, id) => `nous avons ajouté ${n === 1 ? "l’avis ci-dessous" : `les ${n} avis ci-dessous`} à ta commande ${id}. Les conditions restent les mêmes.`],
  it: [(n, id) => `${n === 1 ? "Recensione aggiunta" : `${n} recensioni aggiunte`} al tuo ordine ${id}`, "Recensione aggiunta ✓", (n, id) => `abbiamo aggiunto ${n === 1 ? "la recensione qui sotto" : `le ${n} recensioni qui sotto`} al tuo ordine ${id}. Valgono le stesse condizioni di prima.`],
  nl: [(n, id) => `${n === 1 ? "Review" : `${n} reviews`} toegevoegd aan uw opdracht ${id}`, "Review toegevoegd ✓", (n, id) => `we hebben ${n === 1 ? "de onderstaande review" : `de ${n} onderstaande reviews`} toegevoegd aan uw opdracht ${id}. Dezelfde voorwaarden als voorheen.`],
  pt: [(n, id) => `${n === 1 ? "Avaliação adicionada" : `${n} avaliações adicionadas`} à tua encomenda ${id}`, "Avaliação adicionada ✓", (n, id) => `adicionámos ${n === 1 ? "a avaliação abaixo" : `as ${n} avaliações abaixo`} à tua encomenda ${id}. Mantêm-se as mesmas condições.`],
  ja: [(n, id) => `ご注文${id}に口コミ${n}件を追加しました`, "口コミを追加しました ✓", (n, id) => `以下の口コミ${n}件をご注文${id}に追加しました。条件はこれまでと同じです。`],
  sv: [(n, id) => `${n === 1 ? "Omdöme" : `${n} omdömen`} tillagt i din beställning ${id}`, "Omdöme tillagt ✓", (n, id) => `vi har lagt till ${n === 1 ? "omdömet nedan" : `de ${n} omdömena nedan`} i din beställning ${id}. Samma villkor som tidigare.`],
  da: [(n, id) => `${n === 1 ? "Anmeldelse" : `${n} anmeldelser`} tilføjet til din ordre ${id}`, "Anmeldelse tilføjet ✓", (n, id) => `vi har tilføjet ${n === 1 ? "anmeldelsen nedenfor" : `de ${n} anmeldelser nedenfor`} til din ordre ${id}. Samme betingelser som hidtil.`],
  no: [(n, id) => `${n === 1 ? "Anmeldelse" : `${n} anmeldelser`} lagt til i bestillingen din ${id}`, "Anmeldelse lagt til ✓", (n, id) => `vi har lagt til ${n === 1 ? "anmeldelsen nedenfor" : `de ${n} anmeldelsene nedenfor`} i bestillingen din ${id}. Samme vilkår som før.`],
};

/* Bestätigungszeile: Zusicherung „Bewertungen verstoßen gegen die Google-Richtlinien" (Nachweis, Zeitpunkt in UTC). */
const POL: Record<string, (w: string) => string> = {
  de: (w) => `Sie haben am ${w} bestätigt, dass die beauftragten Bewertungen nach Ihrem besten Wissen gegen die Google-Richtlinien verstoßen.`,
  en: (w) => `On ${w} you confirmed that, to the best of your knowledge, the ordered reviews violate Google's policies.`,
  es: (w) => `El ${w} confirmaste que, según tu leal saber y entender, las reseñas encargadas infringen las políticas de Google.`,
  fr: (w) => `Le ${w}, tu as confirmé qu'à ta connaissance, les avis commandés enfreignent les règles de Google.`,
  it: (w) => `Il ${w} hai confermato che, per quanto a tua conoscenza, le recensioni ordinate violano le norme di Google.`,
  nl: (w) => `Op ${w} heeft u bevestigd dat de bestelde reviews naar uw beste weten in strijd zijn met het Google-beleid.`,
  pt: (w) => `Em ${w} confirmaste que, tanto quanto sabes, as avaliações encomendadas violam as políticas da Google.`,
  ja: (w) => `${w}に、ご依頼の口コミがお客様の知る限りGoogleのポリシーに違反していることをご確認いただきました。`,
  sv: (w) => `Den ${w} intygade du att de beställda omdömena såvitt du vet bryter mot Googles riktlinjer.`,
  da: (w) => `Den ${w} bekræftede du, at de bestilte anmeldelser efter din bedste overbevisning overtræder Googles retningslinjer.`,
  no: (w) => `${w} bekreftet du at de bestilte omtalene etter din beste overbevisning bryter med Googles retningslinjer.`,
};
const polWhen = (iso: string, lang: string) => {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  try { return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(d) + " UTC"; } catch { return d.toISOString().slice(0, 16).replace("T", " ") + " UTC"; }
};

export function subject(p: AuftragsbestaetigungReviewsProps): string {
  const n = (p.items || []).length || (p.urls || []).length || 1;
  if (p.added) return (ADD[p.lang || "en"] || ADD.en)[0](n, p.orderId || "");
  const t = T[p.lang || "en"] || T.en;
  return t.subject(n);
}

export default function AuftragsbestaetigungReviews({ lang = "en", name = "", items = [], urls = [], per = "", total = "", currency = "", orderId = "", chatPct = 0, verify = false, verifyN = 0, payGate = false, reasons = false, dash, added = false, policyAt = "", _overrides }: AuftragsbestaetigungReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const ad = added ? ADD[lang] || ADD.en : null;
  const list: ReviewRef[] = items.length ? items : urls.map((u) => ({ url: u }));
  const n = list.length || 1;
  const cur = reviewCurrency(currency, per);
  // Zwei Verfahren: „Zahlung nach Löschung" (Standard / rechtliche Meldung) und Software-Fälle (erst nach unserer Prüfung; abgebucht ebenfalls erst bei Erfolg).
  const sw = list.filter(isSwItem), rest = list.filter((it) => !isSwItem(it));
  const all = quoteReviews(list, cur, undefined, "full", chatPct);
  const perRest = rest.length ? quoteReviews(rest, cur, list.length, "full", chatPct).per : per;
  const swUnit = fmtReviewMoney(Math.round((REVIEW_NOTEXT_PRICE * (100 - all.pct)) / 100), cur);
  const prices = <ReviewPriceLines lang={lang} items={list} currency={cur} minPct={chatPct} />;
  return (
    <EmailShell preview={ad ? ad[0](list.length || 1, orderId) : t.preview} title={ad ? ad[1] : t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{ad ? ad[2](n, orderId) : sw.length && !rest.length ? t.p1sw(n) : t.p1(n)}{orderId && !ad ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      {/* Wichtigstes zuerst: Nachweis / Zahlungsart / Dashboard-Button – nicht erst ganz unten. */}
      {/* Reihenfolge: 1) Zahlungsart, 2) Inhaber-Nachweis (nur für die 4–5-Sterne-Bewertungen). */}
      {reasons ? (() => {
        const S = START[lang] || START.en;
        const steps = [S[2], ...(verify ? [S[3]] : []), ...(payGate ? [S[4]] : [])];
        return (
          <NoteBox>
            <span style={{ color: brand.tintText, fontWeight: 700 }}>{S[0]}</span><br />
            {S[1]}<br />
            {steps.map((x, i) => <React.Fragment key={i}>{i + 1}. {x}<br /></React.Fragment>)}
            {verify && verifyN && verifyN < n ? <>{(VFP[lang] || VFP.en)(verifyN, n - verifyN)}<br /></> : null}
            <span style={{ color: brand.muted }}>{S[5]}</span>
          </NoteBox>
        );
      })() : null}

      {payGate && !reasons ? (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>{verify ? (STEP[lang] || STEP.en)[0] : (PG[lang] || PG.en)[0]}</span><br />
          {(PG[lang] || PG.en)[1]}
        </NoteBox>
      ) : null}

      {verify && !reasons ? (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>{payGate ? (STEP[lang] || STEP.en)[1] : ""}{(VF[lang] || VF.en)[0]}</span><br />
          {verifyN && verifyN < n ? <><strong>{(VFP[lang] || VFP.en)(verifyN, n - verifyN)}</strong><br /></> : null}
          {(VF[lang] || VF.en)[1]}
        </NoteBox>
      ) : null}

      <DashBox lang={lang} dash={dash} />

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

      {policyAt ? <P><span style={{ color: brand.muted, fontSize: 13 }}>✓ {(POL[lang] || POL.en)(polWhen(policyAt, lang))}</span></P> : null}

      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
