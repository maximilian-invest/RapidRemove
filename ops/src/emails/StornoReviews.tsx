/* Template: Storno „Einzelne Bewertungen löschen".
   Wird aus dem Admin gesendet, wenn eine eingereichte Bewertung die
   Voraussetzungen nicht erfüllt — GENAU ZWEI Gründe:
     · "age"  → Bewertung älter als 4 Wochen
     · "text" → Bewertung enthält keinen Text (reine Sternebewertung)
   Kernbotschaft: es entstehen KEINE Kosten (Zahlung ohnehin erst nach Erfolg).
   Produkt nur außerhalb DACH → KEINE deutsche Fassung, „du"-Ton.
   Sprache = die, über die der Kunde gekommen ist. */
import * as React from "react";
import { EmailShell, P, NoteBox, Bullets, brand, type MailLang } from "./components";

export type StornoReviewsReason = "age" | "text";

/** Eine Bewertung: Teilen-Link ODER Name + Bewertungstext. */
export interface ReviewRef { url?: string; name?: string; text?: string }

export interface StornoReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Grund des Stornos. */
  reason?: StornoReviewsReason;
  /** Die betroffenen Bewertungen (wie eingereicht). */
  items?: ReviewRef[];
  orderId?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: string;
  ageH: string; ageWhy: string;
  textH: string; textWhy: string;
  listH: string;
  freeH: string; free: string;
  againH: string; again: string;
  close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: "About your review removal order – we can't take this one on",
    preview: "No costs for you — here's why it doesn't work in this case.",
    title: "We have to cancel this order",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: "thanks for your order — unfortunately we have to cancel it. We'd rather tell you straight away than let you wait for weeks.",
    ageH: "The review is older than 4 weeks",
    ageWhy: "We can only take on reviews posted within the last 4 weeks. After that, the chances of removal drop so far that we won't take your order in good conscience.",
    textH: "The review contains no text",
    textWhy: "Ratings that are stars only, with no written text, can't be removed this way — there's simply nothing to challenge. This route only works for reviews with text.",
    listH: "This concerns",
    freeH: "No costs for you",
    free: "You're not being charged anything. As always with us, payment only ever happens after a successful removal — and there wasn't one here.",
    againH: "What you can do",
    again: "Got another review that's less than 4 weeks old and contains text? Just send it over — we'll take a look right away.",
    close: "Sorry we couldn't help this time. Questions? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Sobre tu pedido de eliminación de reseñas: no podemos aceptarlo",
    preview: "Sin coste para ti: te explicamos por qué no es posible en este caso.",
    title: "Tenemos que cancelar este pedido",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: "gracias por tu pedido, pero lamentablemente tenemos que cancelarlo. Preferimos decírtelo de inmediato antes de hacerte esperar semanas.",
    ageH: "La reseña tiene más de 4 semanas",
    ageWhy: "Solo podemos aceptar reseñas publicadas en las últimas 4 semanas. Pasado ese plazo, las posibilidades de eliminación bajan tanto que no aceptamos el encargo con la conciencia tranquila.",
    textH: "La reseña no contiene texto",
    textWhy: "Las valoraciones que son solo estrellas, sin texto escrito, no se pueden eliminar por esta vía: sencillamente no hay nada que impugnar. Este camino solo funciona con reseñas con texto.",
    listH: "Se trata de",
    freeH: "Sin coste para ti",
    free: "No se te cobra nada. Como siempre con nosotros, solo se paga tras una eliminación con éxito, y aquí no la ha habido.",
    againH: "Qué puedes hacer",
    again: "¿Tienes otra reseña de menos de 4 semanas y con texto? Envíanosla: le echamos un vistazo enseguida.",
    close: "Sentimos no poder ayudarte esta vez. ¿Dudas? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "À propos de ta commande de suppression d'avis : nous ne pouvons pas la prendre",
    preview: "Aucun frais pour toi — voici pourquoi ce n'est pas possible ici.",
    title: "Nous devons annuler cette commande",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: "merci pour ta commande — malheureusement, nous devons l'annuler. Nous préférons te le dire tout de suite plutôt que de te faire attendre des semaines.",
    ageH: "L'avis date de plus de 4 semaines",
    ageWhy: "Nous ne pouvons prendre en charge que les avis publiés au cours des 4 dernières semaines. Au-delà, les chances de suppression chutent au point que nous ne prenons pas la commande en conscience.",
    textH: "L'avis ne contient pas de texte",
    textWhy: "Les notes composées uniquement d'étoiles, sans texte, ne peuvent pas être retirées par cette voie — il n'y a tout simplement rien à contester. Cette méthode ne fonctionne que pour les avis avec texte.",
    listH: "Il s'agit de",
    freeH: "Aucun frais pour toi",
    free: "Rien ne t'est facturé. Comme toujours chez nous, le paiement n'intervient qu'après une suppression réussie — et il n'y en a pas eu ici.",
    againH: "Ce que tu peux faire",
    again: "Tu as un autre avis de moins de 4 semaines et contenant du texte ? Envoie-le-nous, nous y jetons un œil tout de suite.",
    close: "Désolés de ne pas avoir pu aider cette fois. Des questions ? Réponds à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Sul tuo ordine di rimozione recensioni: non possiamo accettarlo",
    preview: "Nessun costo per te — ecco perché in questo caso non è possibile.",
    title: "Dobbiamo annullare questo ordine",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "grazie per il tuo ordine — purtroppo dobbiamo annullarlo. Preferiamo dirtelo subito piuttosto che farti aspettare settimane.",
    ageH: "La recensione ha più di 4 settimane",
    ageWhy: "Possiamo accettare solo recensioni pubblicate nelle ultime 4 settimane. Oltre questo termine le probabilità di rimozione calano al punto che non accettiamo l'incarico in coscienza.",
    textH: "La recensione non contiene testo",
    textWhy: "Le valutazioni con sole stelle, senza testo scritto, non si possono rimuovere per questa via: semplicemente non c'è nulla da contestare. Questo percorso funziona solo con recensioni con testo.",
    listH: "Si tratta di",
    freeH: "Nessun costo per te",
    free: "Non ti viene addebitato nulla. Come sempre da noi, si paga solo dopo una rimozione riuscita — e qui non c'è stata.",
    againH: "Cosa puoi fare",
    again: "Hai un'altra recensione di meno di 4 settimane e con testo? Inviacela: la guardiamo subito.",
    close: "Ci dispiace non aver potuto aiutarti stavolta. Domande? Rispondi a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Over je bestelling voor reviewverwijdering: we kunnen deze niet aannemen",
    preview: "Geen kosten voor u — dit is waarom het hier niet lukt.",
    title: "We moeten deze bestelling annuleren",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: "bedankt voor je bestelling — helaas moeten we die annuleren. We zeggen het liever meteen dan u weken te laten wachten.",
    ageH: "De review is ouder dan 4 weken",
    ageWhy: "We kunnen alleen reviews aannemen die in de afgelopen 4 weken zijn geplaatst. Daarna dalen de kansen op verwijdering zo sterk dat we de opdracht niet met een gerust hart aannemen.",
    textH: "De review bevat geen tekst",
    textWhy: "Beoordelingen met alleen sterren, zonder geschreven tekst, kunnen langs deze weg niet worden verwijderd — er valt eenvoudigweg niets aan te vechten. Deze route werkt alleen bij reviews met tekst.",
    listH: "Het gaat om",
    freeH: "Geen kosten voor u",
    free: "Er wordt niets in rekening gebracht. Zoals altijd bij ons betaalt u pas na een geslaagde verwijdering — en die was er hier niet.",
    againH: "Wat u kunt doen",
    again: "Heeft u een andere review die jonger is dan 4 weken en tekst bevat? Stuur hem gerust — we kijken er meteen naar.",
    close: "Jammer dat we deze keer niet konden helpen. Vragen? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "Sobre a tua encomenda de remoção de avaliações: não podemos aceitá-la",
    preview: "Sem custos para ti — eis porque não é possível neste caso.",
    title: "Temos de cancelar esta encomenda",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: "obrigado pela tua encomenda — infelizmente temos de a cancelar. Preferimos dizer-to já em vez de te deixar semanas à espera.",
    ageH: "A avaliação tem mais de 4 semanas",
    ageWhy: "Só podemos aceitar avaliações publicadas nas últimas 4 semanas. Depois disso, as hipóteses de remoção descem tanto que não aceitamos o trabalho de consciência tranquila.",
    textH: "A avaliação não contém texto",
    textWhy: "Classificações apenas com estrelas, sem texto escrito, não podem ser removidas por esta via — simplesmente não há nada a contestar. Este caminho só funciona com avaliações com texto.",
    listH: "Trata-se de",
    freeH: "Sem custos para ti",
    free: "Não te é cobrado nada. Como sempre connosco, só se paga depois de uma remoção bem-sucedida — e aqui não houve nenhuma.",
    againH: "O que podes fazer",
    again: "Tens outra avaliação com menos de 4 semanas e com texto? Envia-nos: olhamos para ela de imediato.",
    close: "Lamentamos não poder ajudar desta vez. Dúvidas? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "口コミ削除のご依頼について — 今回はお引き受けできません",
    preview: "費用は一切かかりません。理由をご説明します。",
    title: "今回のご依頼はキャンセルとさせてください",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: "ご依頼ありがとうございます。恐れ入りますが、今回はキャンセルとさせてください。何週間もお待たせするより、早めにお伝えするほうが良いと考えました。",
    ageH: "口コミの投稿から4週間以上が経過しています",
    ageWhy: "お引き受けできるのは、投稿から4週間以内の口コミに限られます。それを過ぎると削除できる見込みが大きく下がるため、良心的にお引き受けすることができません。",
    textH: "口コミに本文がありません",
    textWhy: "星だけで本文のない評価は、この方法では削除できません。異議を申し立てる対象となる記述がないためです。この方法は本文のある口コミにのみ有効です。",
    listH: "対象の口コミ",
    freeH: "費用は一切かかりません",
    free: "ご請求は発生しません。当社では常に、削除が成功した場合にのみお支払いをいただいており、今回は成功していないためです。",
    againH: "今後について",
    again: "投稿から4週間以内で本文のある口コミが他にあれば、ぜひお送りください。すぐに確認します。",
    close: "今回はお力になれず申し訳ありません。ご不明な点はこのメールにご返信ください。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: "Om din beställning av omdömesborttagning – vi kan inte ta den",
    preview: "Inga kostnader för dig — här är varför det inte går i det här fallet.",
    title: "Vi måste annullera den här beställningen",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "tack för din beställning — tyvärr måste vi annullera den. Vi säger hellre till direkt än låter dig vänta i veckor.",
    ageH: "Omdömet är äldre än 4 veckor",
    ageWhy: "Vi kan bara ta emot omdömen som publicerats de senaste 4 veckorna. Därefter sjunker chanserna till borttagning så mycket att vi inte tar uppdraget med gott samvete.",
    textH: "Omdömet innehåller ingen text",
    textWhy: "Betyg med enbart stjärnor, utan skriven text, kan inte tas bort den här vägen — det finns helt enkelt inget att bestrida. Metoden fungerar bara för omdömen med text.",
    listH: "Det gäller",
    freeH: "Inga kostnader för dig",
    free: "Du debiteras ingenting. Som alltid hos oss betalar du först efter en lyckad borttagning — och någon sådan blev det inte här.",
    againH: "Vad du kan göra",
    again: "Har du ett annat omdöme som är yngre än 4 veckor och innehåller text? Skicka det gärna — vi tittar på det direkt.",
    close: "Tråkigt att vi inte kunde hjälpa till den här gången. Frågor? Svara bara på det här mejlet.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Om din bestilling på fjernelse af anmeldelser – vi kan ikke tage den",
    preview: "Ingen omkostninger for dig — her er hvorfor det ikke kan lade sig gøre.",
    title: "Vi må annullere denne bestilling",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "tak for din bestilling — desværre må vi annullere den. Vi siger hellere til med det samme end at lade dig vente i ugevis.",
    ageH: "Anmeldelsen er ældre end 4 uger",
    ageWhy: "Vi kan kun tage anmeldelser, der er offentliggjort inden for de seneste 4 uger. Derefter falder chancerne for fjernelse så meget, at vi ikke påtager os opgaven med god samvittighed.",
    textH: "Anmeldelsen indeholder ingen tekst",
    textWhy: "Bedømmelser med kun stjerner, uden skrevet tekst, kan ikke fjernes ad denne vej — der er simpelthen ikke noget at bestride. Metoden virker kun ved anmeldelser med tekst.",
    listH: "Det drejer sig om",
    freeH: "Ingen omkostninger for dig",
    free: "Du bliver ikke opkrævet noget. Som altid hos os betaler du først efter en vellykket fjernelse — og den kom ikke i stand her.",
    againH: "Hvad du kan gøre",
    again: "Har du en anden anmeldelse, der er under 4 uger gammel og indeholder tekst? Send den endelig — vi kigger på den med det samme.",
    close: "Ærgerligt, at vi ikke kunne hjælpe denne gang. Spørgsmål? Svar blot på denne mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Om bestillingen din på fjerning av omtaler – vi kan ikke ta den",
    preview: "Ingen kostnader for deg — her er hvorfor det ikke går denne gangen.",
    title: "Vi må annullere denne bestillingen",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: "takk for bestillingen — dessverre må vi annullere den. Vi sier heller fra med en gang enn å la deg vente i ukevis.",
    ageH: "Omtalen er eldre enn 4 uker",
    ageWhy: "Vi kan bare ta imot omtaler som er publisert de siste 4 ukene. Etter det synker sjansene for fjerning så mye at vi ikke tar oppdraget med god samvittighet.",
    textH: "Omtalen inneholder ingen tekst",
    textWhy: "Vurderinger med bare stjerner, uten skrevet tekst, kan ikke fjernes på denne måten — det finnes rett og slett ingenting å bestride. Metoden fungerer bare for omtaler med tekst.",
    listH: "Det gjelder",
    freeH: "Ingen kostnader for deg",
    free: "Du blir ikke belastet noe. Som alltid hos oss betaler du først etter en vellykket fjerning — og den kom ikke i stand her.",
    againH: "Hva du kan gjøre",
    again: "Har du en annen omtale som er under 4 uker gammel og inneholder tekst? Send den gjerne — vi ser på den med en gang.",
    close: "Synd at vi ikke kunne hjelpe denne gangen. Spørsmål? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: StornoReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject;
}

export default function StornoReviews({ lang = "en", name = "", reason = "age", items = [], orderId = "", _overrides }: StornoReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const isAge = reason !== "text";
  const head = isAge ? t.ageH : t.textH;
  const why = isAge ? t.ageWhy : t.textWhy;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{head}</span><br />
        {why}
      </NoteBox>

      {items.length ? (
        <React.Fragment>
          <P><strong>{t.listH}</strong></P>
          <Bullets items={items.map((it, i) => it.url
            ? <a key={i} href={it.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{it.url}</a>
            : <span key={i}><strong>{it.name}</strong> — “{it.text}”</span>
          )} />
        </React.Fragment>
      ) : null}

      <P><strong>{t.freeH}:</strong> {t.free}</P>
      <P><strong>{t.againH}:</strong> {t.again}</P>

      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
