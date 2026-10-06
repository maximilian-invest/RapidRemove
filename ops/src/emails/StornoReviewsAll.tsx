/* Template: Storno „Einzelne Bewertungen löschen" — ganze Bestellung, Löschung nicht möglich.
   Aus dem Admin (Auftrag stornieren › „Löschung nicht möglich"). Erklärt kurz das Warum,
   stellt klar, dass keine Kosten entstehen, und lädt ein, neue Bewertungen zu schicken.
   Deutsche Fassung in Sie-Form; übrige Sprachen im „du"-Ton wie StornoReviews. 11 Sprachen. */
import * as React from "react";
import { DashButton } from "./DashBox";
import { EmailShell, P, NoteBox, brand, type MailLang } from "./components";

export interface StornoReviewsAllProps {
  lang?: MailLang;
  name?: string;
  orderId?: string;
  /** Link zum Kunden-Dashboard (optional). */
  dashUrl?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: string; why: string;
  freeH: string; free: string;
  againH: string; again: string;
  close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  de: {
    subject: "Ihr Auftrag zur Bewertungslöschung wurde storniert",
    preview: "Die Löschung ist in diesem Fall nicht möglich – für Sie entstehen keine Kosten.",
    title: "Bestellung storniert",
    greeting: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: "vielen Dank für Ihr Vertrauen und Ihren Auftrag. Wir haben die eingereichten Bewertungen sorgfältig geprüft – leider ist eine Löschung in diesem Fall nicht möglich. Deshalb haben wir Ihre gesamte Bestellung storniert.",
    why: "Google entfernt nur Bewertungen, die klar gegen die eigenen Richtlinien verstoßen. Bei Ihren Bewertungen sehen wir nach unserer Prüfung keine realistische Chance auf Löschung – und wir nehmen nur Aufträge an, die wir auch erfolgreich abschließen können.",
    freeH: "Keine Kosten für Sie",
    free: "Ihnen wird nichts berechnet. Bei uns bezahlen Sie ausschließlich für Bewertungen, die tatsächlich gelöscht wurden.",
    againH: "Wie es weitergehen kann",
    again: "Erhalten Sie neue negative Bewertungen oder gibt es eine Bewertung, die eindeutig gegen die Google-Richtlinien verstößt? Senden Sie uns diese einfach – wir prüfen sie kostenlos und melden uns rasch bei Ihnen.",
    close: "Es tut uns leid, dass wir Ihnen dieses Mal nicht helfen konnten. Bei Fragen antworten Sie einfach auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen",
  },
  en: {
    subject: "Your review removal order has been cancelled",
    preview: "Removal isn't possible in this case – there are no costs for you.",
    title: "Order cancelled",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: "thank you for your trust and your order. We've carefully reviewed the reviews you submitted – unfortunately removal isn't possible in this case, so we've cancelled your entire order.",
    why: "Google only removes reviews that clearly violate its own policies. After our check, we see no realistic chance of getting your reviews removed – and we only take on orders we can actually complete successfully.",
    freeH: "No costs for you",
    free: "You won't be charged anything. With us, you only ever pay for reviews that were actually removed.",
    againH: "What you can do",
    again: "Got new negative reviews, or one that clearly breaks Google's rules? Just send it over – we'll check it for free and get back to you quickly.",
    close: "We're sorry we couldn't help this time. Questions? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Tu pedido de eliminación de reseñas ha sido cancelado",
    preview: "En este caso no es posible eliminarlas: no tienes ningún coste.",
    title: "Pedido cancelado",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: "gracias por tu confianza y por tu pedido. Hemos revisado con detalle las reseñas que nos enviaste y, por desgracia, en este caso no es posible eliminarlas. Por eso hemos cancelado tu pedido completo.",
    why: "Google solo elimina reseñas que infringen claramente sus propias políticas. Tras nuestra revisión, no vemos una posibilidad realista de eliminar tus reseñas, y solo aceptamos encargos que podemos completar con éxito.",
    freeH: "Sin coste para ti",
    free: "No se te cobra nada. Con nosotros solo pagas por las reseñas que realmente se eliminan.",
    againH: "Qué puedes hacer",
    again: "¿Te han llegado nuevas reseñas negativas o hay alguna que incumple claramente las normas de Google? Envíanosla: la revisamos gratis y te respondemos enseguida.",
    close: "Sentimos no haber podido ayudarte esta vez. ¿Dudas? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Ta commande de suppression d'avis a été annulée",
    preview: "La suppression n'est pas possible dans ce cas – aucun frais pour toi.",
    title: "Commande annulée",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: "merci pour ta confiance et ta commande. Nous avons examiné attentivement les avis que tu nous as transmis – malheureusement, leur suppression n'est pas possible dans ce cas. Nous avons donc annulé l'intégralité de ta commande.",
    why: "Google ne supprime que les avis qui enfreignent clairement ses propres règles. Après notre analyse, nous ne voyons aucune chance réaliste de faire supprimer tes avis – et nous n'acceptons que les commandes que nous pouvons mener à bien.",
    freeH: "Aucun frais pour toi",
    free: "Rien ne t'est facturé. Chez nous, tu ne paies que pour les avis réellement supprimés.",
    againH: "Ce que tu peux faire",
    again: "Tu as reçu de nouveaux avis négatifs, ou un avis qui enfreint clairement les règles de Google ? Envoie-le-nous – nous le vérifions gratuitement et revenons vite vers toi.",
    close: "Désolés de ne pas avoir pu t'aider cette fois. Des questions ? Réponds simplement à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Il tuo ordine di rimozione recensioni è stato annullato",
    preview: "In questo caso la rimozione non è possibile – nessun costo per te.",
    title: "Ordine annullato",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "grazie per la fiducia e per il tuo ordine. Abbiamo esaminato con attenzione le recensioni che ci hai inviato – purtroppo in questo caso la rimozione non è possibile. Per questo abbiamo annullato l'intero ordine.",
    why: "Google rimuove solo le recensioni che violano chiaramente le proprie norme. Dopo la nostra verifica non vediamo una possibilità realistica di far rimuovere le tue recensioni – e accettiamo solo incarichi che possiamo portare a termine con successo.",
    freeH: "Nessun costo per te",
    free: "Non ti viene addebitato nulla. Da noi paghi solo per le recensioni effettivamente rimosse.",
    againH: "Cosa puoi fare",
    again: "Hai ricevuto nuove recensioni negative o ce n'è una che viola chiaramente le regole di Google? Inviacela – la verifichiamo gratis e ti rispondiamo subito.",
    close: "Ci dispiace non averti potuto aiutare questa volta. Domande? Rispondi a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Je bestelling voor reviewverwijdering is geannuleerd",
    preview: "Verwijderen is in dit geval niet mogelijk – er zijn geen kosten voor je.",
    title: "Bestelling geannuleerd",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: "bedankt voor je vertrouwen en je bestelling. We hebben de ingediende reviews zorgvuldig bekeken – helaas is verwijderen in dit geval niet mogelijk. Daarom hebben we je volledige bestelling geannuleerd.",
    why: "Google verwijdert alleen reviews die duidelijk in strijd zijn met de eigen richtlijnen. Na onze controle zien we geen realistische kans om je reviews te laten verwijderen – en we nemen alleen opdrachten aan die we ook echt kunnen afronden.",
    freeH: "Geen kosten voor je",
    free: "Er wordt niets in rekening gebracht. Bij ons betaal je alleen voor reviews die daadwerkelijk zijn verwijderd.",
    againH: "Wat je kunt doen",
    again: "Nieuwe negatieve reviews ontvangen, of een review die duidelijk de regels van Google overtreedt? Stuur hem gerust – we controleren hem gratis en laten snel van ons horen.",
    close: "Jammer dat we je deze keer niet konden helpen. Vragen? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "A tua encomenda de remoção de avaliações foi cancelada",
    preview: "Neste caso a remoção não é possível – não tens qualquer custo.",
    title: "Encomenda cancelada",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: "obrigado pela tua confiança e pela tua encomenda. Analisámos com cuidado as avaliações que nos enviaste – infelizmente, neste caso não é possível removê-las. Por isso cancelámos a tua encomenda completa.",
    why: "A Google só remove avaliações que violam claramente as suas próprias regras. Depois da nossa análise, não vemos uma hipótese realista de remover as tuas avaliações – e só aceitamos trabalhos que conseguimos concluir com sucesso.",
    freeH: "Sem custos para ti",
    free: "Não te é cobrado nada. Connosco só pagas pelas avaliações que forem realmente removidas.",
    againH: "O que podes fazer",
    again: "Recebeste novas avaliações negativas, ou há alguma que viola claramente as regras da Google? Envia-nos – analisamos gratuitamente e respondemos-te rapidamente.",
    close: "Lamentamos não ter conseguido ajudar desta vez. Dúvidas? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "口コミ削除のご依頼はキャンセルとなりました",
    preview: "今回は削除が難しいため、ご依頼をキャンセルいたしました。費用は一切かかりません。",
    title: "ご依頼のキャンセル",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: "このたびはご依頼いただき、誠にありがとうございます。お送りいただいた口コミを慎重に確認いたしましたが、誠に恐れ入りますが今回は削除が難しいため、ご依頼全体をキャンセルいたしました。",
    why: "Googleが削除するのは、ガイドラインに明確に違反している口コミのみです。確認の結果、今回の口コミは削除できる現実的な見込みがないと判断いたしました。当社では、確実に成果を出せるご依頼のみをお引き受けしています。",
    freeH: "費用は一切かかりません",
    free: "ご請求は発生しません。当社では、実際に削除された口コミに対してのみお支払いをいただいています。",
    againH: "今後について",
    again: "新たに否定的な口コミが投稿された場合や、Googleのルールに明らかに違反している口コミがある場合は、ぜひお送りください。無料で確認し、速やかにご連絡いたします。",
    close: "今回はお力になれず申し訳ございません。ご不明な点は、このメールにご返信ください。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: "Din beställning av omdömesborttagning har annullerats",
    preview: "Borttagning är inte möjlig i det här fallet – inga kostnader för dig.",
    title: "Beställning annullerad",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "tack för ditt förtroende och din beställning. Vi har noggrant granskat omdömena du skickade – tyvärr är borttagning inte möjlig i det här fallet. Därför har vi annullerat hela din beställning.",
    why: "Google tar bara bort omdömen som tydligt bryter mot deras egna riktlinjer. Efter vår granskning ser vi ingen realistisk chans att få dina omdömen borttagna – och vi tar bara uppdrag som vi faktiskt kan slutföra.",
    freeH: "Inga kostnader för dig",
    free: "Du debiteras ingenting. Hos oss betalar du bara för omdömen som faktiskt har tagits bort.",
    againH: "Vad du kan göra",
    again: "Har du fått nya negativa omdömen, eller finns det ett som tydligt bryter mot Googles regler? Skicka det till oss – vi granskar det kostnadsfritt och återkommer snabbt.",
    close: "Tråkigt att vi inte kunde hjälpa dig den här gången. Frågor? Svara bara på det här mejlet.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Din bestilling på fjernelse af anmeldelser er annulleret",
    preview: "Fjernelse er ikke mulig i dette tilfælde – ingen omkostninger for dig.",
    title: "Bestilling annulleret",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "tak for din tillid og din bestilling. Vi har gennemgået de indsendte anmeldelser grundigt – desværre er fjernelse ikke mulig i dette tilfælde. Derfor har vi annulleret hele din bestilling.",
    why: "Google fjerner kun anmeldelser, der tydeligt overtræder deres egne retningslinjer. Efter vores gennemgang ser vi ingen realistisk chance for at få dine anmeldelser fjernet – og vi tager kun opgaver, vi rent faktisk kan gennemføre.",
    freeH: "Ingen omkostninger for dig",
    free: "Du bliver ikke opkrævet noget. Hos os betaler du kun for anmeldelser, der faktisk er blevet fjernet.",
    againH: "Hvad du kan gøre",
    again: "Har du fået nye negative anmeldelser, eller er der en, der tydeligt bryder Googles regler? Send den til os – vi tjekker den gratis og vender hurtigt tilbage.",
    close: "Ærgerligt, at vi ikke kunne hjælpe dig denne gang. Spørgsmål? Svar blot på denne mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Bestillingen din på fjerning av omtaler er annullert",
    preview: "Fjerning er ikke mulig i dette tilfellet – ingen kostnader for deg.",
    title: "Bestilling annullert",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: "takk for tilliten og bestillingen din. Vi har gått nøye gjennom omtalene du sendte – dessverre er fjerning ikke mulig i dette tilfellet. Derfor har vi annullert hele bestillingen din.",
    why: "Google fjerner bare omtaler som tydelig bryter med deres egne retningslinjer. Etter vår vurdering ser vi ingen realistisk sjanse for å få omtalene dine fjernet – og vi tar bare oppdrag vi faktisk kan fullføre.",
    freeH: "Ingen kostnader for deg",
    free: "Du blir ikke belastet noe. Hos oss betaler du bare for omtaler som faktisk er fjernet.",
    againH: "Hva du kan gjøre",
    again: "Har du fått nye negative omtaler, eller finnes det en som tydelig bryter Googles regler? Send den til oss – vi sjekker den gratis og gir deg raskt svar.",
    close: "Synd at vi ikke kunne hjelpe deg denne gangen. Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: StornoReviewsAllProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject;
}

export default function StornoReviewsAll({ lang = "en", name = "", orderId = "", dashUrl, _overrides }: StornoReviewsAllProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      <P>{t.why}</P>
      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.freeH}</span><br />
        {t.free}
      </NoteBox>
      <P><strong>{t.againH}:</strong> {t.again}</P>
      {dashUrl ? <DashButton lang={lang} url={dashUrl} /> : null}
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
