/* Template: „Wir haben mit der Löschung begonnen" (Bewertungs-Produkt).
   Wird aus dem Admin gesendet, sobald wir den Auftrag tatsächlich angestoßen
   haben — das Gegenstück zur Auftragsbestätigung (Eingang) und zur
   Löschbestätigung (Ergebnis + Rechnung). Hält fest: Bearbeitung läuft,
   Dauer, Abrechnung nur je gelöschter Bewertung, keine Mitwirkung nötig.
   Produkt primär außerhalb DACH („du"-Ton); deutsche Fassung (Sie-Form) ist
   enthalten — für manuell angelegte Aufträge aus DACH.
   Die Sprache wählt der Admin nach dem Land des Kunden. */
import * as React from "react";
import { DashButton } from "./DashBox";
import { EmailShell, P, NoteBox, Bullets, CtaButton, brand, type MailLang } from "./components";
import { ReviewPriceLines, reviewCurrency } from "./ReviewPriceLines";
import { fmtReviewMoney, REVIEW_NOTEXT_PRICE } from "../reviewsPricing";

/** Spezial-Software (ausgelagert) für nicht annehmbare Bewertungen: Preis je Bewertung, abgebucht erst bei Erfolg. */
export const SPECIAL_REVIEW_PRICE = REVIEW_NOTEXT_PRICE;

/** Eine Bewertung: Teilen-Link ODER Name + Bewertungstext (Wizard-Alternative). */
export interface ReviewRef { url?: string; name?: string; text?: string; old?: boolean }

export interface BearbeitungGestartetReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Die beauftragten Bewertungen (wie im Wizard eingereicht). */
  items?: ReviewRef[];
  /** Veraltet: nur Links — wird zu items normalisiert. */
  urls?: string[];
  /** Anzahl eingereichter, aber nicht angenommener Bewertungen (Hinweis in der Mail). */
  declined?: number;
  /** Formatierter Stückpreis, z. B. "$179" / "179 €" (Fallback ohne Bewertungsliste). */
  per?: string;
  /** Währung der Bestellung ("usd" | "eur") — für die exakte Preisaufstellung. */
  currency?: string;
  orderId?: string;
  /** Link zum Kunden-Dashboard. */
  dashUrl?: string;
  /** Angenommene Bewertungen ohne Text (Spezialverfahren): Betrag + Button (abgebucht erst bei Erfolg). */
  prepay?: { n: number; amount: string; url: string };
  /** Abgelehnte, aber per Spezial-Software löschbare Bewertungen: Liste + Bestätigungs-Button (abgebucht erst bei Erfolg). */
  software?: { items: ReviewRef[]; amount: string; url: string; price: string };
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: (n: number) => string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: (n: number) => string;
  listH: string;
  nextH: string; next1: string; next2: string; next3: string; next4: string;
  declined: (n: number) => string;
  /** Angebot für abgelehnte Bewertungen: Spezial-Software (ausgelagert), Preis je Bewertung, abgebucht erst bei Erfolg, Kunde meldet sich aktiv. */
  special?: (n: number, price: string) => string;
  /** Spezial-Software für die abgelehnten Bewertungen, die so löschbar sind ({price} = Stückpreis) + Button. */
  sw?: (n: number) => string;
  swBtn?: string;
  prepayH?: string;
  prepay?: (n: number, amount: string) => string;
  prepayBtn?: string;
  next3nt?: string;
  calm: string;
  close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  de: {
    subject: (n) => `Wir haben begonnen – die Löschung ${n === 1 ? "Ihrer Bewertung" : `Ihrer ${n} Bewertungen`} läuft`,
    preview: "Ihr Auftrag wird nun aktiv bearbeitet.",
    title: "Wir haben begonnen ✓",
    greeting: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (n) => `ein kurzes Update: Wir haben mit der Bearbeitung ${n === 1 ? "der unten angeführten Bewertung" : `der ${n} unten angeführten Bewertungen`} begonnen. Ihr Auftrag ist nun aktiv in Bearbeitung.`,
    listH: "Woran wir arbeiten",
    nextH: "Wie es weitergeht",
    next1: "Eine Löschung dauert meist 1–2 Wochen, manchmal geht es schneller, in Einzelfällen dauert es etwas länger.",
    next2: "Sie müssen nichts weiter tun – wir melden uns, sobald es Neuigkeiten gibt.",
    next3: "Sie bezahlen nur für Bewertungen, die wir tatsächlich löschen – automatisch abgebucht von Ihrer hinterlegten Zahlungsart am Tag der Löschung, die Rechnung kommt per E-Mail.",
    next4: "Jede Bewertung wird einzeln bearbeitet, daher kann die Dauer bis zur Löschung von Bewertung zu Bewertung unterschiedlich sein. Deshalb buchen wir jede gelöschte Bewertung unter Umständen separat ab – wundern Sie sich also nicht, wenn Sie für jede Bewertung eine eigene Rechnung erhalten.",
    declined: (n) => `Wir haben auch ${n === 1 ? "die weitere Bewertung" : `die weiteren ${n} Bewertungen`} geprüft, die Sie uns übermittelt haben: ${n === 1 ? "Diese kann" : "Diese können"} über die Verfahren von Google nicht gelöscht werden. Wir bearbeiten ${n === 1 ? "sie" : "diese"} daher nicht – und selbstverständlich entstehen Ihnen dafür keine Kosten.`,
    sw: (n) => `Gute Nachrichten zu ${n === 1 ? "einer weiteren Bewertung" : `${n} weiteren Bewertungen`}: Eine Löschung auf dem regulären Weg ist zwar nicht möglich, wohl aber mit einer Spezial-Software. Diese betreiben wir nicht selbst – es handelt sich um einen externen Dienstleister, an den wir auslagern, weshalb es leider teurer ist: {price} pro Bewertung. Auch hier gilt: Abgebucht wird erst, wenn die Bewertung tatsächlich gelöscht ist. Klappt es nicht, zahlen Sie nichts. Wenn Sie das wünschen, bestätigen Sie einfach unten (Voraussetzung ist eine hinterlegte Zahlungsart) – dann starten wir sofort.`,
    swBtn: "Bestätigen – Zahlung nur bei Erfolg",
    special: (n, price) => `Für ${n === 1 ? "diese Bewertung" : "diese Bewertungen"} gibt es noch eine weitere Möglichkeit: Eine Löschung ist nur mit einer Spezial-Software möglich. Diese betreiben wir nicht selbst – es handelt sich um einen externen Dienstleister, an den wir auslagern, weshalb es leider kostspielig ist: ${price} pro Bewertung, abgebucht erst, wenn die Bewertung tatsächlich gelöscht ist. Klappt es nicht, zahlen Sie nichts. Wenn Sie diesen Weg gehen möchten, antworten Sie bitte auf diese E-Mail und geben Sie uns Bescheid – wir beginnen erst nach Ihrer ausdrücklichen Bestätigung.`,
    prepayH: "Bewertungen ohne Text – Spezialverfahren",
    prepay: (n, amount) => `${n === 1 ? "Eine der Bewertungen enthält" : `${n} der Bewertungen enthalten`} keinen Text, daher löschen wir diese mit unserem speziellen, softwaregestützten Verfahren. Das betrifft nur wenige Sonderfälle. Der Betrag von bis zu ${amount} (Mengenrabatt bereits berücksichtigt) wird erst abgebucht, wenn die jeweilige Bewertung tatsächlich gelöscht ist. Klappt es nicht, zahlen Sie nichts. Bestätigen Sie einfach unten (Voraussetzung ist eine hinterlegte Zahlungsart), dann starten wir sofort.`,
    prepayBtn: "Bestätigen – Zahlung nur bei Erfolg",
    next3nt: "Sie bezahlen nur für Bewertungen, die wir tatsächlich löschen – das gilt auch für Bewertungen ohne Text. Abgebucht wird automatisch von Ihrer hinterlegten Zahlungsart am Tag der Löschung, die Rechnung kommt per E-Mail.",
    calm: "Wenn Sie ein paar Tage nichts von uns hören, ist das völlig normal – auf Seiten von Google braucht das seine Zeit. Wir bleiben dran.",
    close: "Fragen in der Zwischenzeit? Antworten Sie einfach auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen,",
  },
  en: {
    subject: (n) => `We've started – removal of ${n === 1 ? "your review" : `your ${n} reviews`} is under way`,
    preview: "Your case is now actively being worked on.",
    title: "We've started ✓",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n) => `quick update: we've begun working on ${n === 1 ? "the review" : `the ${n} reviews`} below. Your case is now actively in progress.`,
    listH: "What we're working on",
    nextH: "What happens next",
    next1: "Removals usually take 1–2 weeks – sometimes faster, occasionally a little longer.",
    next2: "You don't have to do anything — we'll get in touch as soon as there's news.",
    next3: "You only pay for reviews we actually remove – charged automatically to your saved payment method on the day of removal, with the invoice sent by email.",
    next4: "Every review is handled individually, so removal times can differ from review to review. That's why we may charge each removed review separately – so don't be surprised if you receive a separate invoice for each one.",
    declined: (n) => `We've also checked the other ${n === 1 ? "review" : `${n} reviews`} you sent us: ${n === 1 ? "it" : "they"} can't be removed through Google's processes, so we won't work on ${n === 1 ? "it" : "them"} – and of course you won't be charged for ${n === 1 ? "it" : "them"}.`,
    sw: (n) => `Good news for ${n === 1 ? "one more review" : `${n} more reviews`}: ${n === 1 ? "it" : "they"} can't be removed the normal way, but with special software. We don't run it ourselves – it's an external service we outsource to, which unfortunately makes it more expensive: {price} per review. Here too, you're only charged once a review has actually been removed. If it doesn't work, you pay nothing. If you'd like this, simply confirm below (you'll need a saved payment method) – then we start right away.`,
    swBtn: "Confirm – pay only on success",
    special: (n, price) => `One more option for ${n === 1 ? "this review" : "these reviews"}: ${n === 1 ? "it" : "they"} can only be removed with special software. We don't run it ourselves – it's an external service we outsource to, which unfortunately makes it expensive: ${price} per review, charged only once the review has actually been removed. If it doesn't work, you pay nothing. If you'd like us to go this route, please reply to this email and let us know – we'll only start once you've actively confirmed.`,
    prepayH: "Reviews without text – special procedure",
    prepay: (n, amount) => `${n === 1 ? "One of the reviews has" : `${n} of the reviews have`} no text, so we remove ${n === 1 ? "it" : "them"} with our special software-supported procedure. This only applies to a few special cases. The amount of up to ${amount} (volume discount already included) is only charged once ${n === 1 ? "the review has" : "each review has"} actually been removed. If it doesn't work, you pay nothing. Simply confirm below (you'll need a saved payment method) and we start right away.`,
    prepayBtn: "Confirm – pay only on success",
    next3nt: "You only pay for reviews we actually remove – this also applies to reviews without text. You're charged automatically to your saved payment method on the day of removal, with the invoice sent by email.",
    calm: "No news for a few days is normal — these things take time on Google's side. We're on it.",
    close: "Questions in the meantime? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: (n) => `Hemos empezado: la eliminación de ${n === 1 ? "tu reseña" : `tus ${n} reseñas`} está en marcha`,
    preview: "Ya estamos trabajando activamente en tu caso.",
    title: "Hemos empezado ✓",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: (n) => `una breve actualización: hemos empezado a trabajar en ${n === 1 ? "la reseña" : `las ${n} reseñas`} de abajo. Tu caso está ya en curso.`,
    listH: "En lo que estamos trabajando",
    nextH: "Qué pasa ahora",
    next1: "Las eliminaciones suelen tardar 1–2 semanas; a veces es más rápido y en casos puntuales algo más.",
    next2: "No tienes que hacer nada: te avisamos en cuanto haya novedades.",
    next3: "Solo pagas por las reseñas que realmente eliminemos: se cobra automáticamente a tu método de pago guardado el día de la eliminación y la factura te llega por correo.",
    next4: "Cada reseña se tramita por separado, así que el tiempo de eliminación puede variar de una a otra. Por eso es posible que cobremos cada reseña eliminada por separado: no te sorprendas si recibes una factura para cada una.",
    declined: (n) => `También hemos revisado ${n === 1 ? "la otra reseña" : `las otras ${n} reseñas`} que nos enviaste: no se ${n === 1 ? "puede" : "pueden"} eliminar mediante los procesos de Google, así que no trabajaremos en ${n === 1 ? "ella" : "ellas"} y, por supuesto, no se te cobrará nada por ${n === 1 ? "ella" : "ellas"}.`,
    sw: (n) => `Buenas noticias para ${n === 1 ? "una reseña más" : `${n} reseñas más`}: no se ${n === 1 ? "puede" : "pueden"} eliminar por la vía normal, pero sí con un software especial. No lo gestionamos nosotros, sino un servicio externo, y por eso por desgracia es más caro: {price} por reseña. También aquí solo se cobra cuando la reseña se ha eliminado de verdad. Si no funciona, no pagas nada. Si lo quieres, confírmalo aquí abajo (necesitas un método de pago guardado) y empezamos enseguida.`,
    swBtn: "Confirmar – solo pagas si funciona",
    special: (n, price) => `Una opción más para ${n === 1 ? "esa reseña" : "esas reseñas"}: solo ${n === 1 ? "se puede" : "se pueden"} eliminar con un software especial. No lo gestionamos nosotros, sino un servicio externo al que lo encargamos, y por eso por desgracia es caro: ${price} por reseña, que solo se cobran cuando la reseña se ha eliminado de verdad. Si no funciona, no pagas nada. Si quieres que lo intentemos así, respóndenos a este correo: solo empezamos cuando nos lo confirmes expresamente.`,
    prepayH: "Reseñas sin texto – procedimiento especial",
    prepay: (n, amount) => `${n === 1 ? "Una de las reseñas no tiene" : `${n} de las reseñas no tienen`} texto, así que ${n === 1 ? "la eliminamos" : "las eliminamos"} con nuestro procedimiento especial apoyado por software. Solo ocurre en pocos casos especiales. El importe de hasta ${amount} (descuento por volumen incluido) solo se cobra cuando la reseña se ha eliminado de verdad. Si no funciona, no pagas nada. Confírmalo aquí abajo (necesitas un método de pago guardado) y empezamos enseguida.`,
    prepayBtn: "Confirmar – solo pagas si funciona",
    next3nt: "Solo pagas por las reseñas que realmente eliminemos, también las que no tienen texto. Se cobra automáticamente a tu método de pago guardado el día de la eliminación y la factura te llega por correo.",
    calm: "Que pasen unos días sin noticias es normal: en el lado de Google estas cosas llevan su tiempo. Estamos en ello.",
    close: "¿Alguna duda mientras tanto? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: (n) => `C'est parti : la suppression ${n === 1 ? "de ton avis" : `de tes ${n} avis`} est en cours`,
    preview: "Ton dossier est désormais traité activement.",
    title: "Nous avons commencé ✓",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: (n) => `petit point : nous avons commencé à travailler sur ${n === 1 ? "l'avis" : `les ${n} avis`} ci-dessous. Ton dossier est maintenant en cours.`,
    listH: "Ce sur quoi nous travaillons",
    nextH: "La suite",
    next1: "Une suppression prend en général 1 à 2 semaines, parfois moins, dans certains cas un peu plus.",
    next2: "Tu n'as rien à faire — nous te recontactons dès qu'il y a du nouveau.",
    next3: "Tu ne paies que les avis réellement supprimés – débités automatiquement sur ton moyen de paiement enregistré le jour de la suppression, avec la facture par e-mail.",
    next4: "Chaque avis est traité individuellement, le délai de suppression peut donc varier d'un avis à l'autre. C'est pourquoi il se peut que nous débitions chaque avis supprimé séparément – ne sois donc pas surpris de recevoir une facture pour chacun.",
    declined: (n) => `Nous avons aussi vérifié ${n === 1 ? "l'autre avis" : `les ${n} autres avis`} que tu nous as envoyé${n === 1 ? "" : "s"} : ${n === 1 ? "il ne peut" : "ils ne peuvent"} pas être supprimé${n === 1 ? "" : "s"} via les procédures de Google, nous ne ${n === 1 ? "le" : "les"} traiterons donc pas – et bien sûr, rien ne te sera facturé pour ${n === 1 ? "cet avis" : "ces avis"}.`,
    sw: (n) => `Bonne nouvelle pour ${n === 1 ? "un avis de plus" : `${n} autres avis`} : ${n === 1 ? "il ne peut" : "ils ne peuvent"} pas être supprimé${n === 1 ? "" : "s"} par la voie normale, mais avec un logiciel spécial. Nous ne le faisons pas nous-mêmes – c'est un service externe, ce qui le rend malheureusement plus cher : {price} par avis. Ici aussi, le débit n'a lieu qu'une fois l'avis réellement supprimé. Si ça ne marche pas, tu ne paies rien. Si tu le souhaites, confirme simplement ci-dessous (un moyen de paiement enregistré est nécessaire) et nous commençons tout de suite.`,
    swBtn: "Confirmer – payé seulement si ça marche",
    special: (n, price) => `Une option de plus pour ${n === 1 ? "cet avis" : "ces avis"} : ${n === 1 ? "il ne peut" : "ils ne peuvent"} être supprimé${n === 1 ? "" : "s"} qu'avec un logiciel spécial. Nous ne le faisons pas nous-mêmes – c'est un service externe que nous sous-traitons, ce qui le rend malheureusement cher : ${price} par avis, débités seulement une fois l'avis réellement supprimé. Si ça ne marche pas, tu ne paies rien. Si tu souhaites passer par là, réponds simplement à cet e-mail – nous ne commençons qu'après ta confirmation expresse.`,
    prepayH: "Avis sans texte – procédure spéciale",
    prepay: (n, amount) => `${n === 1 ? "Un des avis n'a" : `${n} des avis n'ont`} pas de texte : nous ${n === 1 ? "le supprimons" : "les supprimons"} avec notre procédure spéciale assistée par logiciel. Cela ne concerne que quelques cas particuliers. Le montant de ${amount} maximum (remise sur quantité incluse) n'est débité qu'une fois l'avis réellement supprimé. Si ça ne marche pas, tu ne paies rien. Confirme simplement ci-dessous (un moyen de paiement enregistré est nécessaire) et nous commençons tout de suite.`,
    prepayBtn: "Confirmer – payé seulement si ça marche",
    next3nt: "Tu ne paies que les avis réellement supprimés – y compris les avis sans texte. Le débit se fait automatiquement sur ton moyen de paiement enregistré le jour de la suppression, avec la facture par e-mail.",
    calm: "Quelques jours sans nouvelles, c'est normal : côté Google, cela prend du temps. Nous restons dessus.",
    close: "Une question entre-temps ? Réponds simplement à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: (n) => `Abbiamo iniziato: la rimozione ${n === 1 ? "della tua recensione" : `delle tue ${n} recensioni`} è in corso`,
    preview: "Il tuo caso è ora in lavorazione.",
    title: "Abbiamo iniziato ✓",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n) => `un breve aggiornamento: abbiamo iniziato a lavorare su ${n === 1 ? "la recensione" : `le ${n} recensioni`} qui sotto. Il tuo caso è ora in corso.`,
    listH: "Su cosa stiamo lavorando",
    nextH: "Cosa succede ora",
    next1: "Di solito una rimozione richiede 1–2 settimane, a volte meno, in singoli casi un po' di più.",
    next2: "Non devi fare nulla: ti scriviamo appena ci sono novità.",
    next3: "Paghi solo le recensioni che rimuoviamo davvero: l'addebito avviene automaticamente sul metodo di pagamento salvato il giorno della rimozione e la fattura arriva via e-mail.",
    next4: "Ogni recensione viene gestita singolarmente, quindi i tempi di rimozione possono variare dall'una all'altra. Per questo potremmo addebitare ogni recensione rimossa separatamente: non stupirti se ricevi una fattura per ciascuna.",
    declined: (n) => `Abbiamo controllato anche ${n === 1 ? "l'altra recensione" : `le altre ${n} recensioni`} che ci hai inviato: non ${n === 1 ? "può" : "possono"} essere ${n === 1 ? "rimossa" : "rimosse"} tramite le procedure di Google, quindi non ci lavoreremo – e naturalmente non ti verrà addebitato nulla.`,
    sw: (n) => `Buone notizie per ${n === 1 ? "un'altra recensione" : `altre ${n} recensioni`}: non ${n === 1 ? "si può" : "si possono"} rimuovere per la via normale, ma con un software speciale. Non lo gestiamo noi, ma un servizio esterno, e per questo purtroppo è più caro: {price} a recensione. Anche qui l'addebito avviene solo quando la recensione è stata davvero rimossa. Se non funziona, non paghi nulla. Se lo desideri, conferma qui sotto (serve un metodo di pagamento salvato) e iniziamo subito.`,
    swBtn: "Conferma – paghi solo se riesce",
    special: (n, price) => `Un'altra possibilità per ${n === 1 ? "questa recensione" : "queste recensioni"}: ${n === 1 ? "si può" : "si possono"} rimuovere solo con un software speciale. Non lo gestiamo noi, ma un servizio esterno a cui lo affidiamo, e per questo purtroppo è caro: ${price} a recensione, addebitati solo quando la recensione è stata davvero rimossa. Se non funziona, non paghi nulla. Se vuoi procedere così, rispondi a questa e-mail: iniziamo solo dopo la tua conferma esplicita.`,
    prepayH: "Recensioni senza testo – procedura speciale",
    prepay: (n, amount) => `${n === 1 ? "Una delle recensioni non ha" : `${n} delle recensioni non hanno`} testo: ${n === 1 ? "la rimuoviamo" : "le rimuoviamo"} con la nostra procedura speciale supportata da software. Riguarda solo pochi casi particolari. L'importo di massimo ${amount} (sconto quantità incluso) viene addebitato solo quando la recensione è stata davvero rimossa. Se non funziona, non paghi nulla. Conferma qui sotto (serve un metodo di pagamento salvato) e iniziamo subito.`,
    prepayBtn: "Conferma – paghi solo se riesce",
    next3nt: "Paghi solo le recensioni che rimuoviamo davvero, anche quelle senza testo. L'addebito avviene automaticamente sul metodo di pagamento salvato il giorno della rimozione e la fattura arriva via e-mail.",
    calm: "Qualche giorno senza notizie è normale: lato Google questi tempi ci sono. Ci stiamo lavorando.",
    close: "Domande nel frattempo? Rispondi a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: (n) => `We zijn begonnen – ${n === 1 ? "je review" : `je ${n} reviews`} zijn in behandeling`,
    preview: "Er wordt nu actief aan je zaak gewerkt.",
    title: "We zijn begonnen ✓",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: (n) => `een korte update: we zijn gestart met ${n === 1 ? "de review" : `de ${n} reviews`} hieronder. Je zaak is nu in behandeling.`,
    listH: "Waar we aan werken",
    nextH: "Wat er nu gebeurt",
    next1: "Een verwijdering duurt meestal 1–2 weken, soms sneller, in enkele gevallen iets langer.",
    next2: "U hoeft niets te doen — we nemen contact op zodra er nieuws is.",
    next3: "U betaalt alleen voor reviews die we daadwerkelijk verwijderen – automatisch afgeschreven van uw opgeslagen betaalmethode op de dag van verwijdering, met de factuur per e-mail.",
    next4: "Elke review wordt afzonderlijk behandeld, dus de verwijdertijd kan per review verschillen. Daarom kunnen we elke verwijderde review apart afschrijven – het kan dus zijn dat u per review een aparte factuur ontvangt.",
    declined: (n) => `We hebben ook ${n === 1 ? "de andere review" : `de andere ${n} reviews`} bekeken die u ons stuurde: ${n === 1 ? "die kan" : "die kunnen"} niet via de procedures van Google worden verwijderd. Daar gaan we dus niet mee aan de slag – en u betaalt er uiteraard niets voor.`,
    sw: (n) => `Goed nieuws voor ${n === 1 ? "nog één review" : `nog ${n} reviews`}: ${n === 1 ? "die kan" : "die kunnen"} niet via de normale weg worden verwijderd, maar wel met speciale software. Dat doen we niet zelf – het is een externe dienst, en daardoor helaas duurder: {price} per review. Ook hier wordt pas afgeschreven als de review echt verwijderd is. Lukt het niet, dan betaalt u niets. Wilt u dit? Bevestig dan hieronder (u hebt een opgeslagen betaalmethode nodig) – dan starten we meteen.`,
    swBtn: "Bevestigen – alleen betalen bij succes",
    special: (n, price) => `Nog één optie voor ${n === 1 ? "deze review" : "deze reviews"}: ${n === 1 ? "die kan" : "die kunnen"} alleen met speciale software worden verwijderd. Dat doen we niet zelf – het is een externe dienst die we inschakelen, en daardoor helaas duur: ${price} per review, pas afgeschreven als de review echt verwijderd is. Lukt het niet, dan betaalt u niets. Wilt u deze weg proberen? Antwoord dan op deze e-mail – we beginnen pas nadat u het uitdrukkelijk hebt bevestigd.`,
    prepayH: "Reviews zonder tekst – speciale procedure",
    prepay: (n, amount) => `${n === 1 ? "Eén van de reviews heeft" : `${n} van de reviews hebben`} geen tekst. Die verwijderen we met onze speciale, softwarematige procedure. Dit geldt maar voor enkele speciale gevallen. Het bedrag van maximaal ${amount} (volumekorting al verrekend) wordt pas afgeschreven als de review echt verwijderd is. Lukt het niet, dan betaalt u niets. Bevestig hieronder (u hebt een opgeslagen betaalmethode nodig) en we starten meteen.`,
    prepayBtn: "Bevestigen – alleen betalen bij succes",
    next3nt: "U betaalt alleen voor reviews die we daadwerkelijk verwijderen – ook voor reviews zonder tekst. Er wordt automatisch afgeschreven van uw opgeslagen betaalmethode op de dag van verwijdering, met de factuur per e-mail.",
    calm: "Een paar dagen zonder nieuws is normaal: aan de kant van Google kost dit tijd. We blijven erbovenop zitten.",
    close: "Vragen in de tussentijd? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: (n) => `Já começámos: a remoção ${n === 1 ? "da tua avaliação" : `das tuas ${n} avaliações`} está em curso`,
    preview: "O teu caso está agora a ser tratado.",
    title: "Já começámos ✓",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n) => `uma atualização rápida: começámos a trabalhar ${n === 1 ? "na avaliação" : `nas ${n} avaliações`} abaixo. O teu caso está agora em curso.`,
    listH: "No que estamos a trabalhar",
    nextH: "O que acontece agora",
    next1: "Uma remoção demora normalmente 1–2 semanas, por vezes menos, em casos pontuais um pouco mais.",
    next2: "Não precisas de fazer nada — entramos em contacto assim que houver novidades.",
    next3: "Só pagas pelas avaliações que removermos de facto – cobradas automaticamente no método de pagamento guardado no dia da remoção, com a fatura por e-mail.",
    next4: "Cada avaliação é tratada individualmente, por isso o tempo de remoção pode variar de uma para outra. Assim, podemos cobrar cada avaliação removida em separado – não estranhes se receberes uma fatura para cada uma.",
    declined: (n) => `Também verificámos ${n === 1 ? "a outra avaliação" : `as outras ${n} avaliações`} que nos enviaste: não ${n === 1 ? "pode" : "podem"} ser ${n === 1 ? "removida" : "removidas"} através dos processos da Google, por isso não vamos trabalhar ${n === 1 ? "nela" : "nelas"} – e, claro, não pagas nada por ${n === 1 ? "ela" : "elas"}.`,
    sw: (n) => `Boas notícias para ${n === 1 ? "mais uma avaliação" : `mais ${n} avaliações`}: não ${n === 1 ? "pode" : "podem"} ser removida${n === 1 ? "" : "s"} pela via normal, mas sim com um software especial. Não somos nós a fazê-lo – é um serviço externo, o que infelizmente o torna mais caro: {price} por avaliação. Também aqui só é cobrado quando a avaliação for realmente removida. Se não resultar, não pagas nada. Se quiseres, confirma aqui em baixo (precisas de um método de pagamento guardado) e começamos logo.`,
    swBtn: "Confirmar – só pagas se resultar",
    special: (n, price) => `Mais uma opção para ${n === 1 ? "essa avaliação" : "essas avaliações"}: só ${n === 1 ? "pode" : "podem"} ser removida${n === 1 ? "" : "s"} com um software especial. Não somos nós a fazê-lo – é um serviço externo que subcontratamos, o que infelizmente o torna caro: ${price} por avaliação, cobrados só quando a avaliação for realmente removida. Se não resultar, não paga nada. Se quiser seguir por esse caminho, responda a este e-mail – só começamos depois da sua confirmação expressa.`,
    prepayH: "Avaliações sem texto – procedimento especial",
    prepay: (n, amount) => `${n === 1 ? "Uma das avaliações não tem" : `${n} das avaliações não têm`} texto, por isso ${n === 1 ? "removemo-la" : "removemo-las"} com o nosso procedimento especial apoiado por software. Isto só se aplica a poucos casos especiais. O valor de até ${amount} (desconto de volume incluído) só é cobrado quando a avaliação for realmente removida. Se não resultar, não pagas nada. Confirma aqui em baixo (precisas de um método de pagamento guardado) e começamos logo.`,
    prepayBtn: "Confirmar – só pagas se resultar",
    next3nt: "Só pagas pelas avaliações que removermos de facto – também as sem texto. A cobrança é feita automaticamente no método de pagamento guardado no dia da remoção, com a fatura por e-mail.",
    calm: "Alguns dias sem notícias é normal: do lado do Google isto leva tempo. Estamos em cima do assunto.",
    close: "Dúvidas entretanto? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: (n) => `作業を開始しました – 口コミ${n}件の削除を進めています`,
    preview: "お客様の案件の対応を開始しました。",
    title: "作業を開始しました ✓",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: (n) => `進捗のご連絡です。以下の口コミ${n}件について、削除の作業を開始しました。現在対応中です。`,
    listH: "対応中の口コミ",
    nextH: "今後の流れ",
    next1: "削除には通常1〜2週間かかります（早まることも、まれに少し長くなることもあります）。",
    next2: "お客様に必要な手続きはありません。進展があり次第ご連絡します。",
    next3: "お支払いは実際に削除できた口コミの分のみです。削除当日にご登録のお支払い方法へ自動で請求し、請求書をメールでお送りします。",
    next4: "口コミは1件ずつ個別に対応するため、削除までの期間は口コミごとに異なる場合があります。そのため、削除できた口コミごとに個別に請求し、1件ずつ請求書をお送りすることがあります。あらかじめご了承ください。",
    declined: (n) => `お送りいただいた残りの口コミ${n}件も確認しましたが、Googleの手続きでは削除できないため、対応の対象外とさせていただきます。もちろん、これらの口コミについて料金は発生しません。`,
    sw: (n) => `さらに${n}件の口コミについて：通常の方法では削除できませんが、特別なソフトウェアを使えば削除できます。当社では行っておらず外部に委託するため、費用が高くなります：1件{price}。こちらも口コミが実際に削除された場合にのみ請求され、削除できなかった場合はお支払いは発生しません。ご希望の場合は、下のボタンからご確認ください（お支払い方法の登録が必要です）。すぐに着手します。`,
    swBtn: "確認する（成功時のみ請求）",
    special: (n, price) => `${n === 1 ? "この口コミ" : "これらの口コミ"}には、もう一つ方法があります。特別なソフトウェアを使えば削除できる場合があります。ただし当社では行っておらず外部に委託するため、費用が高くなってしまいます：1件あたり${price}。請求は口コミが実際に削除された場合のみで、削除できなかった場合はお支払いは発生しません。この方法をご希望の場合は、このメールにご返信ください。お客様から明確なご依頼をいただいてから着手します。`,
    prepayH: "本文のない口コミ – 特別な手続き",
    prepay: (n, amount) => `口コミのうち${n}件は本文がないため、ソフトウェアを用いた特別な手続きで削除します。これはごく一部の特殊なケースのみです。最大${amount}（まとめ割引適用済み）は、口コミが実際に削除された場合にのみ請求され、削除できなかった場合はお支払いは発生しません。下のボタンからご確認いただければ（お支払い方法の登録が必要です）、すぐに着手します。`,
    prepayBtn: "確認する（成功時のみ請求）",
    next3nt: "本文のない口コミも含め、お支払いは実際に削除できた口コミの分のみです。削除当日にご登録のお支払い方法へ自動で請求し、請求書をメールでお送りします。",
    calm: "数日ご連絡がないこともありますが、Google側の処理には時間がかかるためで、問題ありません。引き続き対応しています。",
    close: "その間にご不明な点があれば、このメールにご返信ください。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: (n) => `Vi har börjat – borttagningen av ${n === 1 ? "ditt omdöme" : `dina ${n} omdömen`} pågår`,
    preview: "Ditt ärende bearbetas nu aktivt.",
    title: "Vi har börjat ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `en kort uppdatering: vi har börjat arbeta med ${n === 1 ? "omdömet" : `de ${n} omdömena`} nedan. Ditt ärende är nu igång.`,
    listH: "Det här arbetar vi med",
    nextH: "Så går det vidare",
    next1: "En borttagning tar oftast 1–2 veckor, ibland snabbare, i enstaka fall något längre.",
    next2: "Du behöver inte göra något — vi hör av oss så snart det finns nyheter.",
    next3: "Du betalar bara för omdömen som vi faktiskt tar bort – beloppet dras automatiskt från din sparade betalningsmetod samma dag som borttagningen, och fakturan kommer via mejl.",
    next4: "Varje omdöme hanteras för sig, så tiden till borttagning kan variera mellan omdömena. Därför kan vi debitera varje borttaget omdöme separat – bli inte förvånad om du får en faktura per omdöme.",
    declined: (n) => `Vi har också gått igenom ${n === 1 ? "det andra omdömet" : `de övriga ${n} omdömena`} du skickade: ${n === 1 ? "det kan" : "de kan"} inte tas bort via Googles processer, så vi arbetar inte med ${n === 1 ? "det" : "dem"} – och du betalar förstås ingenting för ${n === 1 ? "det" : "dem"}.`,
    sw: (n) => `Goda nyheter för ${n === 1 ? "ett omdöme till" : `${n} omdömen till`}: ${n === 1 ? "det kan" : "de kan"} inte tas bort på vanligt sätt, men med en särskild programvara. Det gör vi inte själva – det är en extern tjänst, och därför tyvärr dyrare: {price} per omdöme. Även här dras pengarna först när omdömet faktiskt har tagits bort. Lyckas det inte betalar du ingenting. Vill du det? Bekräfta bara nedan (du behöver en sparad betalningsmetod) så börjar vi direkt.`,
    swBtn: "Bekräfta – betala bara om det lyckas",
    special: (n, price) => `Ett alternativ till för ${n === 1 ? "det omdömet" : "de omdömena"}: ${n === 1 ? "det kan" : "de kan"} bara tas bort med en särskild programvara. Det gör vi inte själva – det är en extern tjänst vi anlitar, och därför tyvärr dyrt: ${price} per omdöme, som dras först när omdömet faktiskt har tagits bort. Lyckas det inte betalar du ingenting. Vill du gå den vägen? Svara bara på det här mejlet – vi börjar först när du uttryckligen har bekräftat.`,
    prepayH: "Omdömen utan text – särskilt förfarande",
    prepay: (n, amount) => `${n === 1 ? "Ett av omdömena saknar" : `${n} av omdömena saknar`} text, så vi tar bort ${n === 1 ? "det" : "dem"} med vårt särskilda, programvarustödda förfarande. Det gäller bara ett fåtal specialfall. Beloppet på högst ${amount} (mängdrabatt inräknad) dras först när omdömet faktiskt har tagits bort. Lyckas det inte betalar du ingenting. Bekräfta bara nedan (du behöver en sparad betalningsmetod) så börjar vi direkt.`,
    prepayBtn: "Bekräfta – betala bara om det lyckas",
    next3nt: "Du betalar bara för omdömen som vi faktiskt tar bort – även omdömen utan text. Beloppet dras automatiskt från din sparade betalningsmetod samma dag som borttagningen, och fakturan kommer via mejl.",
    calm: "Några dagar utan besked är normalt — hos Google tar det här tid. Vi håller i det.",
    close: "Frågor under tiden? Svara bara på det här mejlet.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: (n) => `Vi er gået i gang – fjernelsen af ${n === 1 ? "din anmeldelse" : `dine ${n} anmeldelser`} er i gang`,
    preview: "Din sag er nu under aktiv behandling.",
    title: "Vi er gået i gang ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `en kort opdatering: vi er gået i gang med ${n === 1 ? "anmeldelsen" : `de ${n} anmeldelser`} nedenfor. Din sag er nu i gang.`,
    listH: "Det arbejder vi med",
    nextH: "Sådan går det videre",
    next1: "En fjernelse tager som regel 1–2 uger, nogle gange hurtigere, i enkelte tilfælde lidt længere.",
    next2: "Du skal ikke gøre noget — vi vender tilbage, så snart der er nyt.",
    next3: "Du betaler kun for anmeldelser, vi faktisk fjerner – beløbet trækkes automatisk fra din gemte betalingsmetode på fjernelsesdagen, og fakturaen kommer på mail.",
    next4: "Hver anmeldelse behandles for sig, så tiden til fjernelse kan variere fra anmeldelse til anmeldelse. Derfor kan vi trække betaling for hver fjernet anmeldelse separat – bliv derfor ikke overrasket, hvis du modtager en faktura for hver enkelt.",
    declined: (n) => `Vi har også gennemgået ${n === 1 ? "den anden anmeldelse" : `de øvrige ${n} anmeldelser`}, du sendte: ${n === 1 ? "den kan" : "de kan"} ikke fjernes via Googles processer, så dem arbejder vi ikke med – og du betaler naturligvis ikke noget for ${n === 1 ? "den" : "dem"}.`,
    sw: (n) => `Gode nyheder for ${n === 1 ? "én anmeldelse mere" : `${n} anmeldelser mere`}: ${n === 1 ? "den kan" : "de kan"} ikke fjernes på den normale måde, men med en særlig software. Det gør vi ikke selv – det er en ekstern tjeneste, og derfor desværre dyrere: {price} pr. anmeldelse. Også her trækkes beløbet først, når anmeldelsen faktisk er fjernet. Lykkes det ikke, betaler du intet. Vil du det, så bekræft bare herunder (du skal have en gemt betalingsmetode) – så går vi i gang med det samme.`,
    swBtn: "Bekræft – betal kun ved succes",
    special: (n, price) => `Én mulighed mere for ${n === 1 ? "den anmeldelse" : "de anmeldelser"}: ${n === 1 ? "den kan" : "de kan"} kun fjernes med en særlig software. Det gør vi ikke selv – det er en ekstern tjeneste, vi bruger, og derfor desværre dyrt: ${price} pr. anmeldelse, som først trækkes, når anmeldelsen faktisk er fjernet. Lykkes det ikke, betaler du intet. Vil du gå den vej, så svar bare på denne mail – vi går først i gang, når du udtrykkeligt har bekræftet det.`,
    prepayH: "Anmeldelser uden tekst – særlig procedure",
    prepay: (n, amount) => `${n === 1 ? "En af anmeldelserne har" : `${n} af anmeldelserne har`} ingen tekst, så vi fjerner ${n === 1 ? "den" : "dem"} med vores særlige, softwareunderstøttede procedure. Det gælder kun få særtilfælde. Beløbet på op til ${amount} (mængderabat fratrukket) trækkes først, når anmeldelsen faktisk er fjernet. Lykkes det ikke, betaler du intet. Bekræft bare herunder (du skal have en gemt betalingsmetode), så går vi i gang med det samme.`,
    prepayBtn: "Bekræft – betal kun ved succes",
    next3nt: "Du betaler kun for anmeldelser, vi faktisk fjerner – også anmeldelser uden tekst. Beløbet trækkes automatisk fra din gemte betalingsmetode på fjernelsesdagen, og fakturaen kommer på mail.",
    calm: "Nogle dage uden nyt er normalt — hos Google tager det tid. Vi holder fast i det.",
    close: "Spørgsmål i mellemtiden? Svar blot på denne mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: (n) => `Vi har startet – fjerningen av ${n === 1 ? "omtalen din" : `de ${n} omtalene dine`} er i gang`,
    preview: "Saken din er nå under aktiv behandling.",
    title: "Vi har startet ✓",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n) => `en kort oppdatering: vi har begynt å jobbe med ${n === 1 ? "omtalen" : `de ${n} omtalene`} nedenfor. Saken din er nå i gang.`,
    listH: "Dette jobber vi med",
    nextH: "Slik går det videre",
    next1: "En fjerning tar vanligvis 1–2 uker, noen ganger raskere, i enkelte tilfeller litt lenger.",
    next2: "Du trenger ikke gjøre noe — vi tar kontakt så snart det er nytt.",
    next3: "Du betaler kun for omtaler vi faktisk fjerner – beløpet trekkes automatisk fra den lagrede betalingsmetoden din samme dag som fjerningen, og fakturaen kommer på e-post.",
    next4: "Hver omtale behandles for seg, så tiden til fjerning kan variere fra omtale til omtale. Derfor kan vi trekke betaling for hver fjernede omtale separat – ikke bli overrasket om du får en faktura per omtale.",
    declined: (n) => `Vi har også gått gjennom ${n === 1 ? "den andre omtalen" : `de øvrige ${n} omtalene`} du sendte: ${n === 1 ? "den kan" : "de kan"} ikke fjernes via Googles prosesser, så vi jobber ikke med ${n === 1 ? "den" : "dem"} – og du betaler selvsagt ingenting for ${n === 1 ? "den" : "dem"}.`,
    sw: (n) => `Gode nyheter for ${n === 1 ? "én omtale til" : `${n} omtaler til`}: ${n === 1 ? "den kan" : "de kan"} ikke fjernes på vanlig måte, men med en spesiell programvare. Det gjør vi ikke selv – det er en ekstern tjeneste, og derfor dessverre dyrere: {price} per omtale. Også her trekkes beløpet først når omtalen faktisk er fjernet. Lykkes det ikke, betaler du ingenting. Vil du det, bekrefter du bare nedenfor (du trenger en lagret betalingsmetode) – så starter vi med en gang.`,
    swBtn: "Bekreft – betal kun ved suksess",
    special: (n, price) => `Ett alternativ til for ${n === 1 ? "den omtalen" : "de omtalene"}: ${n === 1 ? "den kan" : "de kan"} bare fjernes med en spesiell programvare. Det gjør vi ikke selv – det er en ekstern tjeneste vi setter ut til, og derfor dessverre dyrt: ${price} per omtale, som først trekkes når omtalen faktisk er fjernet. Lykkes det ikke, betaler du ingenting. Vil du gå den veien, svarer du bare på denne e-posten – vi starter først når du uttrykkelig har bekreftet det.`,
    prepayH: "Omtaler uten tekst – spesiell prosedyre",
    prepay: (n, amount) => `${n === 1 ? "En av omtalene har" : `${n} av omtalene har`} ingen tekst, så vi fjerner ${n === 1 ? "den" : "dem"} med vår spesielle, programvarestøttede prosedyre. Dette gjelder bare noen få spesialtilfeller. Beløpet på inntil ${amount} (mengderabatt trukket fra) trekkes først når omtalen faktisk er fjernet. Lykkes det ikke, betaler du ingenting. Bekreft bare nedenfor (du trenger en lagret betalingsmetode), så starter vi med en gang.`,
    prepayBtn: "Bekreft – betal kun ved suksess",
    next3nt: "Du betaler kun for omtaler vi faktisk fjerner – også omtaler uten tekst. Beløpet trekkes automatisk fra den lagrede betalingsmetoden din samme dag som fjerningen, og fakturaen kommer på e-post.",
    calm: "Noen dager uten nyheter er normalt — hos Google tar dette tid. Vi står på.",
    close: "Spørsmål i mellomtiden? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

const fill = (s: string, per: string) => (s || "").replace(/\{per\}/g, per || "");

export function subject(p: BearbeitungGestartetReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject((p.items || []).length || (p.urls || []).length || 1);
}

export default function BearbeitungGestartetReviews({ lang = "en", name = "", items = [], urls = [], per = "", currency = "", orderId = "", declined = 0, prepay, software, dashUrl, _overrides }: BearbeitungGestartetReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const list: ReviewRef[] = items.length ? items : urls.map((u) => ({ url: u }));
  const n = list.length || 1;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1(n)}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      {list.length ? (
        <React.Fragment>
          <P><strong>{t.listH}</strong></P>
          <Bullets items={list.map((it, i) => it.url
            ? <a key={i} href={it.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{it.url}</a>
            : <span key={i}><strong>{it.name}</strong>{it.text ? <> — “{it.text}”</> : null}</span>
          )} />
        </React.Fragment>
      ) : null}

      {declined > 0 && t.declined ? <P>{t.declined(declined)}</P> : null}
      {software && software.items.length && t.sw ? (
        <React.Fragment>
          <P>{t.sw(software.items.length).replace("{price}", software.price)}</P>
          <Bullets items={software.items.map((it, i) => it.url
            ? <a key={i} href={it.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{it.url}</a>
            : <span key={i}><strong>{it.name}</strong>{it.text ? <> — “{it.text}”</> : null}</span>
          )} />
          {software.url ? <div style={{ textAlign: "center", margin: "6px 0 18px" }}><CtaButton variant="pay" href={software.url}>{t.swBtn} · {software.amount}</CtaButton></div> : null}
        </React.Fragment>
      ) : null}

      {prepay && prepay.n > 0 && t.prepay ? (
        <React.Fragment>
          <P><strong>{t.prepayH}</strong><br />{t.prepay(prepay.n, prepay.amount)}</P>
          {prepay.url ? <div style={{ textAlign: "center", margin: "6px 0 18px" }}><CtaButton variant="pay" href={prepay.url}>{t.prepayBtn} · {prepay.amount}</CtaButton></div> : null}
        </React.Fragment>
      ) : null}

      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.nextH}</span><br />
        1. {t.next1}<br />
        2. {t.next2}<br />
        3. {prepay && prepay.n > 0 && t.next3nt ? t.next3nt : fill(t.next3, per)}{!list.length && per && !t.next3.includes("{per}") ? ` (${per})` : ""}
        {n > 1 && t.next4 ? <React.Fragment><br />4. {t.next4}</React.Fragment> : null}
        <ReviewPriceLines lang={lang} items={list} currency={reviewCurrency(currency, per)} />
      </NoteBox>

      <P muted>{t.calm}</P>

      <DashButton lang={lang} url={dashUrl} />
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
