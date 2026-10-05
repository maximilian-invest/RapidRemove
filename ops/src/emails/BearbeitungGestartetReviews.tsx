/* Template: „Wir haben mit der Löschung begonnen" (Bewertungs-Produkt).
   Wird aus dem Admin gesendet, sobald wir den Auftrag tatsächlich angestoßen
   haben — das Gegenstück zur Auftragsbestätigung (Eingang) und zur
   Löschbestätigung (Ergebnis + Rechnung). Hält fest: Bearbeitung läuft,
   Dauer, Abrechnung nur je gelöschter Bewertung, keine Mitwirkung nötig.
   Produkt nur außerhalb DACH → KEINE deutsche Fassung, „du"-Ton.
   Die Sprache wählt der Admin nach dem Land des Kunden. */
import * as React from "react";
import { DashButton } from "./DashBox";
import { EmailShell, P, NoteBox, Bullets, CtaButton, brand, type MailLang } from "./components";
import { ReviewPriceLines, reviewCurrency } from "./ReviewPriceLines";
import { fmtReviewMoney, REVIEW_NOTEXT_PRICE } from "../reviewsPricing";

/** Spezial-Software (ausgelagert) für nicht annehmbare Bewertungen: Preis je Bewertung, Vorauszahlung. */
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
  /** Vorauszahlung für angenommene Bewertungen ohne Text (Spezialverfahren). */
  prepay?: { n: number; amount: string; url: string };
  /** Abgelehnte, aber per Spezial-Software löschbare Bewertungen: Liste + Vorauszahlungs-Button (voller Betrag). */
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
  /** Angebot für abgelehnte Bewertungen: Spezial-Software (ausgelagert), Preis je Bewertung, Vorauszahlung, Kunde meldet sich aktiv. */
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
  en: {
    subject: (n) => `We've started – removal of ${n === 1 ? "your review" : `your ${n} reviews`} is under way`,
    preview: "Your case is now actively being worked on.",
    title: "We've started ✓",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n) => `quick update: we've begun working on ${n === 1 ? "the review" : `the ${n} reviews`} below. Your case is now actively in progress.`,
    listH: "What we're working on",
    nextH: "What happens next",
    next1: "Removals usually take a few days, sometimes up to three weeks.",
    next2: "You don't have to do anything — we'll get in touch as soon as there's news.",
    next3: "You only pay for reviews we actually remove, due on the day of removal.",
    next4: "Every review is handled individually, so removal times can differ from review to review. To keep things simple for you, we may bill each removed review separately – so don't be surprised if you receive a separate payment link for each one.",
    declined: (n) => `We've also checked the other ${n === 1 ? "review" : `${n} reviews`} you sent us: ${n === 1 ? "it" : "they"} can't be removed through Google's processes, so we won't work on ${n === 1 ? "it" : "them"} – and of course you won't be charged for ${n === 1 ? "it" : "them"}.`,
    sw: (n) => `Good news for ${n === 1 ? "one more review" : `${n} more reviews`}: ${n === 1 ? "it" : "they"} can't be removed the normal way, but with special software. We don't run it ourselves – it's an external service we outsource to, which unfortunately makes it more expensive: {price} per review, paid in full upfront – 99 % success rate. If ${n === 1 ? "the review isn't" : "a review isn't"} removed within 14 days at the latest, you get a full refund${n === 1 ? "" : " for it"}. If you'd like this, simply pay below – we start as soon as your payment has arrived.`,
    swBtn: "Pay in advance",
    special: (n, price) => `One more option for ${n === 1 ? "this review" : "these reviews"}: ${n === 1 ? "it" : "they"} can only be removed with special software. We don't run it ourselves – it's an external service we outsource to, which unfortunately makes it expensive: ${price} per review, paid in full upfront – 99 % success rate. If ${n === 1 ? "the review isn't" : "a review isn't"} removed within 14 days at the latest, you get a full refund${n === 1 ? "" : " for it"}. If you'd like us to go this route, please reply to this email and let us know – we'll only start once you've actively confirmed.`,
    prepayH: "Paid in advance – reviews without text",
    prepay: (n, amount) => `${n === 1 ? "One of the reviews has" : `${n} of the reviews have`} no text, so we remove ${n === 1 ? "it" : "them"} with our special software-supported procedure (99 % success rate). This only applies to a few special cases: the full amount of ${amount} (volume discount already included) is paid upfront. If ${n === 1 ? "the review isn't" : "a review isn't"} removed within 14 days at the latest, you get a full refund${n === 1 ? "" : " for it"}. We start as soon as your payment has arrived.`,
    prepayBtn: "Pay in advance",
    next3nt: "For reviews with text, you only pay once they are actually removed, due on the day of removal. Reviews without text are paid in advance – with a full refund if they aren't removed within 14 days at the latest.",
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
    next1: "Las eliminaciones suelen tardar unos días, a veces hasta tres semanas.",
    next2: "No tienes que hacer nada: te avisamos en cuanto haya novedades.",
    next3: "Solo pagas por las reseñas que realmente eliminemos, con vencimiento el día de la eliminación.",
    next4: "Cada reseña se tramita por separado, así que el tiempo de eliminación puede variar de una a otra. Para ponértelo fácil, es posible que facturemos cada reseña eliminada por separado: no te sorprendas si recibes un enlace de pago para cada una.",
    declined: (n) => `También hemos revisado ${n === 1 ? "la otra reseña" : `las otras ${n} reseñas`} que nos enviaste: no se ${n === 1 ? "puede" : "pueden"} eliminar mediante los procesos de Google, así que no trabajaremos en ${n === 1 ? "ella" : "ellas"} y, por supuesto, no se te cobrará nada por ${n === 1 ? "ella" : "ellas"}.`,
    sw: (n) => `Buenas noticias para ${n === 1 ? "una reseña más" : `${n} reseñas más`}: no se ${n === 1 ? "puede" : "pueden"} eliminar por la vía normal, pero sí con un software especial. No lo gestionamos nosotros, sino un servicio externo, y por eso por desgracia es más caro: {price} por reseña, pago íntegro por adelantado, con un 99 % de éxito. Si una reseña no se elimina en un plazo máximo de 14 días, te devolvemos el importe íntegro. Si lo quieres, paga aquí abajo: empezamos en cuanto recibamos el pago.`,
    swBtn: "Pagar por adelantado",
    special: (n, price) => `Una opción más para ${n === 1 ? "esa reseña" : "esas reseñas"}: solo ${n === 1 ? "se puede" : "se pueden"} eliminar con un software especial. No lo gestionamos nosotros, sino un servicio externo al que lo encargamos, y por eso por desgracia es caro: ${price} por reseña, pago íntegro por adelantado, con un 99 % de éxito. Si una reseña no se elimina en un plazo máximo de 14 días, te devolvemos el importe íntegro. Si quieres que lo intentemos así, respóndenos a este correo: solo empezamos cuando nos lo confirmes expresamente.`,
    prepayH: "Pago por adelantado – reseñas sin texto",
    prepay: (n, amount) => `${n === 1 ? "Una de las reseñas no tiene" : `${n} de las reseñas no tienen`} texto, así que ${n === 1 ? "la eliminamos" : "las eliminamos"} con nuestro procedimiento especial apoyado por software (99 % de éxito). Solo ocurre en pocos casos especiales: el importe íntegro de ${amount} (descuento por volumen incluido) se paga por adelantado. Si una reseña no se elimina en un plazo máximo de 14 días, te devolvemos el importe íntegro. Empezamos en cuanto recibamos el pago.`,
    prepayBtn: "Pagar por adelantado",
    next3nt: "Las reseñas con texto solo las pagas cuando realmente se eliminan, el mismo día de la eliminación. Las reseñas sin texto se pagan por adelantado, con reembolso íntegro si no se eliminan en un plazo máximo de 14 días.",
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
    next1: "Une suppression prend en général quelques jours, parfois jusqu'à trois semaines.",
    next2: "Tu n'as rien à faire — nous te recontactons dès qu'il y a du nouveau.",
    next3: "Tu ne paies que les avis réellement supprimés, dus le jour de la suppression.",
    next4: "Chaque avis est traité individuellement, le délai de suppression peut donc varier d'un avis à l'autre. Pour te simplifier les choses, il se peut que nous facturions chaque avis supprimé séparément – ne sois donc pas surpris de recevoir un lien de paiement pour chacun.",
    declined: (n) => `Nous avons aussi vérifié ${n === 1 ? "l'autre avis" : `les ${n} autres avis`} que tu nous as envoyé${n === 1 ? "" : "s"} : ${n === 1 ? "il ne peut" : "ils ne peuvent"} pas être supprimé${n === 1 ? "" : "s"} via les procédures de Google, nous ne ${n === 1 ? "le" : "les"} traiterons donc pas – et bien sûr, rien ne te sera facturé pour ${n === 1 ? "cet avis" : "ces avis"}.`,
    sw: (n) => `Bonne nouvelle pour ${n === 1 ? "un avis de plus" : `${n} autres avis`} : ${n === 1 ? "il ne peut" : "ils ne peuvent"} pas être supprimé${n === 1 ? "" : "s"} par la voie normale, mais avec un logiciel spécial. Nous ne le faisons pas nous-mêmes – c'est un service externe, ce qui le rend malheureusement plus cher : {price} par avis, payé intégralement d'avance – 99 % de réussite. Si un avis n'est pas supprimé sous 14 jours au plus tard, nous te remboursons l'intégralité du montant. Si tu le souhaites, paie simplement ci-dessous – nous commençons dès réception du paiement.`,
    swBtn: "Payer d'avance",
    special: (n, price) => `Une option de plus pour ${n === 1 ? "cet avis" : "ces avis"} : ${n === 1 ? "il ne peut" : "ils ne peuvent"} être supprimé${n === 1 ? "" : "s"} qu'avec un logiciel spécial. Nous ne le faisons pas nous-mêmes – c'est un service externe que nous sous-traitons, ce qui le rend malheureusement cher : ${price} par avis, payé intégralement d'avance – 99 % de réussite. Si un avis n'est pas supprimé sous 14 jours au plus tard, nous te remboursons l'intégralité du montant. Si tu souhaites passer par là, réponds simplement à cet e-mail – nous ne commençons qu'après ta confirmation expresse.`,
    prepayH: "Paiement d'avance – avis sans texte",
    prepay: (n, amount) => `${n === 1 ? "Un des avis n'a" : `${n} des avis n'ont`} pas de texte : nous ${n === 1 ? "le supprimons" : "les supprimons"} avec notre procédure spéciale assistée par logiciel (99 % de réussite). Cela ne concerne que quelques cas particuliers : le montant total de ${amount} (remise sur quantité incluse) est payé d'avance. Si un avis n'est pas supprimé sous 14 jours au plus tard, nous te remboursons l'intégralité du montant. Nous commençons dès réception du paiement.`,
    prepayBtn: "Payer d'avance",
    next3nt: "Les avis avec texte, tu ne les paies que lorsqu'ils sont réellement supprimés, le jour de la suppression. Les avis sans texte sont payés d'avance – avec remboursement intégral s'ils ne sont pas supprimés sous 14 jours au plus tard.",
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
    next1: "Di solito una rimozione richiede qualche giorno, a volte fino a tre settimane.",
    next2: "Non devi fare nulla: ti scriviamo appena ci sono novità.",
    next3: "Paghi solo le recensioni che rimuoviamo davvero, dovute il giorno della rimozione.",
    next4: "Ogni recensione viene gestita singolarmente, quindi i tempi di rimozione possono variare dall'una all'altra. Per semplificarti le cose, potremmo fatturare ogni recensione rimossa separatamente: non stupirti se ricevi un link di pagamento per ciascuna.",
    declined: (n) => `Abbiamo controllato anche ${n === 1 ? "l'altra recensione" : `le altre ${n} recensioni`} che ci hai inviato: non ${n === 1 ? "può" : "possono"} essere ${n === 1 ? "rimossa" : "rimosse"} tramite le procedure di Google, quindi non ci lavoreremo – e naturalmente non ti verrà addebitato nulla.`,
    sw: (n) => `Buone notizie per ${n === 1 ? "un'altra recensione" : `altre ${n} recensioni`}: non ${n === 1 ? "si può" : "si possono"} rimuovere per la via normale, ma con un software speciale. Non lo gestiamo noi, ma un servizio esterno, e per questo purtroppo è più caro: {price} a recensione, pagamento anticipato per intero – 99 % di successo. Se una recensione non viene rimossa entro massimo 14 giorni, ti rimborsiamo l'intero importo. Se lo desideri, paga qui sotto: iniziamo appena arriva il pagamento.`,
    swBtn: "Paga in anticipo",
    special: (n, price) => `Un'altra possibilità per ${n === 1 ? "questa recensione" : "queste recensioni"}: ${n === 1 ? "si può" : "si possono"} rimuovere solo con un software speciale. Non lo gestiamo noi, ma un servizio esterno a cui lo affidiamo, e per questo purtroppo è caro: ${price} a recensione, pagamento anticipato per intero – 99 % di successo. Se una recensione non viene rimossa entro massimo 14 giorni, ti rimborsiamo l'intero importo. Se vuoi procedere così, rispondi a questa e-mail: iniziamo solo dopo la tua conferma esplicita.`,
    prepayH: "Pagamento anticipato – recensioni senza testo",
    prepay: (n, amount) => `${n === 1 ? "Una delle recensioni non ha" : `${n} delle recensioni non hanno`} testo: ${n === 1 ? "la rimuoviamo" : "le rimuoviamo"} con la nostra procedura speciale supportata da software (99 % di successo). Riguarda solo pochi casi particolari: l'intero importo di ${amount} (sconto quantità incluso) si paga in anticipo. Se una recensione non viene rimossa entro massimo 14 giorni, ti rimborsiamo l'intero importo. Iniziamo appena arriva il pagamento.`,
    prepayBtn: "Paga in anticipo",
    next3nt: "Le recensioni con testo le paghi solo quando vengono effettivamente rimosse, il giorno della rimozione. Quelle senza testo si pagano in anticipo, con rimborso completo se non vengono rimosse entro massimo 14 giorni.",
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
    next1: "Een verwijdering duurt meestal een paar dagen, soms tot drie weken.",
    next2: "U hoeft niets te doen — we nemen contact op zodra er nieuws is.",
    next3: "U betaalt alleen voor reviews die we daadwerkelijk verwijderen, verschuldigd op de dag van verwijdering.",
    next4: "Elke review wordt afzonderlijk behandeld, dus de verwijdertijd kan per review verschillen. Om het u zo makkelijk mogelijk te maken, kunnen we elke verwijderde review apart factureren – het kan dus zijn dat u per review een aparte betaallink ontvangt.",
    declined: (n) => `We hebben ook ${n === 1 ? "de andere review" : `de andere ${n} reviews`} bekeken die u ons stuurde: ${n === 1 ? "die kan" : "die kunnen"} niet via de procedures van Google worden verwijderd. Daar gaan we dus niet mee aan de slag – en u betaalt er uiteraard niets voor.`,
    sw: (n) => `Goed nieuws voor ${n === 1 ? "nog één review" : `nog ${n} reviews`}: ${n === 1 ? "die kan" : "die kunnen"} niet via de normale weg worden verwijderd, maar wel met speciale software. Dat doen we niet zelf – het is een externe dienst, en daardoor helaas duurder: {price} per review, volledig vooraf te betalen – 99 % slagingskans. Is een review niet uiterlijk binnen 14 dagen verwijderd, dan krijgt u het volledige bedrag terug. Wilt u dit? Betaal dan hieronder – we starten zodra uw betaling binnen is.`,
    swBtn: "Vooraf betalen",
    special: (n, price) => `Nog één optie voor ${n === 1 ? "deze review" : "deze reviews"}: ${n === 1 ? "die kan" : "die kunnen"} alleen met speciale software worden verwijderd. Dat doen we niet zelf – het is een externe dienst die we inschakelen, en daardoor helaas duur: ${price} per review, volledig vooraf te betalen – 99 % slagingskans. Is een review niet uiterlijk binnen 14 dagen verwijderd, dan krijgt u het volledige bedrag terug. Wilt u deze weg proberen? Antwoord dan op deze e-mail – we beginnen pas nadat u het uitdrukkelijk hebt bevestigd.`,
    prepayH: "Vooruitbetaling – reviews zonder tekst",
    prepay: (n, amount) => `${n === 1 ? "Eén van de reviews heeft" : `${n} van de reviews hebben`} geen tekst. Die verwijderen we met onze speciale, softwarematige procedure (99 % slagingskans). Dit geldt maar voor enkele speciale gevallen: het volledige bedrag van ${amount} (volumekorting al verrekend) wordt vooraf betaald. Is een review niet uiterlijk binnen 14 dagen verwijderd, dan krijgt u het volledige bedrag terug. We starten zodra uw betaling binnen is.`,
    prepayBtn: "Vooraf betalen",
    next3nt: "Reviews met tekst betaalt u pas als ze echt verwijderd zijn, op de dag van verwijdering. Reviews zonder tekst worden vooraf betaald – met volledige terugbetaling als ze niet uiterlijk binnen 14 dagen verwijderd zijn.",
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
    next1: "Uma remoção demora normalmente alguns dias, às vezes até três semanas.",
    next2: "Não precisas de fazer nada — entramos em contacto assim que houver novidades.",
    next3: "Só pagas pelas avaliações que removermos de facto, com vencimento no dia da remoção.",
    next4: "Cada avaliação é tratada individualmente, por isso o tempo de remoção pode variar de uma para outra. Para te facilitar, podemos faturar cada avaliação removida em separado – não estranhes se receberes um link de pagamento para cada uma.",
    declined: (n) => `Também verificámos ${n === 1 ? "a outra avaliação" : `as outras ${n} avaliações`} que nos enviaste: não ${n === 1 ? "pode" : "podem"} ser ${n === 1 ? "removida" : "removidas"} através dos processos da Google, por isso não vamos trabalhar ${n === 1 ? "nela" : "nelas"} – e, claro, não pagas nada por ${n === 1 ? "ela" : "elas"}.`,
    sw: (n) => `Boas notícias para ${n === 1 ? "mais uma avaliação" : `mais ${n} avaliações`}: não ${n === 1 ? "pode" : "podem"} ser removida${n === 1 ? "" : "s"} pela via normal, mas sim com um software especial. Não somos nós a fazê-lo – é um serviço externo, o que infelizmente o torna mais caro: {price} por avaliação, pago na totalidade antecipadamente – 99 % de sucesso. Se uma avaliação não for removida no prazo máximo de 14 dias, devolvemos-te o valor total. Se quiseres, paga aqui em baixo – começamos assim que o pagamento chegar.`,
    swBtn: "Pagar antecipadamente",
    special: (n, price) => `Mais uma opção para ${n === 1 ? "essa avaliação" : "essas avaliações"}: só ${n === 1 ? "pode" : "podem"} ser removida${n === 1 ? "" : "s"} com um software especial. Não somos nós a fazê-lo – é um serviço externo que subcontratamos, o que infelizmente o torna caro: ${price} por avaliação, pago na totalidade antecipadamente – 99 % de sucesso. Se uma avaliação não for removida no prazo máximo de 14 dias, devolvemos-lhe o valor total. Se quiser seguir por esse caminho, responda a este e-mail – só começamos depois da sua confirmação expressa.`,
    prepayH: "Pagamento antecipado – avaliações sem texto",
    prepay: (n, amount) => `${n === 1 ? "Uma das avaliações não tem" : `${n} das avaliações não têm`} texto, por isso ${n === 1 ? "removemo-la" : "removemo-las"} com o nosso procedimento especial apoiado por software (99 % de sucesso). Isto só se aplica a poucos casos especiais: o valor total de ${amount} (desconto de volume incluído) é pago antecipadamente. Se uma avaliação não for removida no prazo máximo de 14 dias, devolvemos-te o valor total. Começamos assim que o pagamento chegar.`,
    prepayBtn: "Pagar antecipadamente",
    next3nt: "As avaliações com texto só as pagas quando forem realmente removidas, no dia da remoção. As avaliações sem texto são pagas antecipadamente – com reembolso total se não forem removidas no prazo máximo de 14 dias.",
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
    next1: "削除には通常数日、長い場合で3週間ほどかかります。",
    next2: "お客様に必要な手続きはありません。進展があり次第ご連絡します。",
    next3: "お支払いは実際に削除できた口コミの分のみで、削除当日が期日です。",
    next4: "口コミは1件ずつ個別に対応するため、削除までの期間は口コミごとに異なる場合があります。そのため、削除できた口コミごとに個別にご請求し、1件ずつお支払いリンクをお送りすることがあります。あらかじめご了承ください。",
    declined: (n) => `お送りいただいた残りの口コミ${n}件も確認しましたが、Googleの手続きでは削除できないため、対応の対象外とさせていただきます。もちろん、これらの口コミについて料金は発生しません。`,
    sw: (n) => `さらに${n}件の口コミについて：通常の方法では削除できませんが、特別なソフトウェアを使えば削除できます。当社では行っておらず外部に委託するため、費用が高くなります：1件{price}（全額前払い・成功率99%）。遅くとも14日以内に削除されなかった口コミは、全額返金いたします。ご希望の場合は、下のボタンからお支払いください。入金を確認しだい着手します。`,
    swBtn: "前払いで支払う",
    special: (n, price) => `${n === 1 ? "この口コミ" : "これらの口コミ"}には、もう一つ方法があります。特別なソフトウェアを使えば削除できる場合があります。ただし当社では行っておらず外部に委託するため、費用が高くなってしまいます：1件あたり${price}（全額前払い・成功率99%）。遅くとも14日以内に削除されなかった口コミは、全額返金いたします。この方法をご希望の場合は、このメールにご返信ください。お客様から明確なご依頼をいただいてから着手します。`,
    prepayH: "前払い – 本文のない口コミ",
    prepay: (n, amount) => `口コミのうち${n}件は本文がないため、ソフトウェアを用いた特別な手続きで削除します（成功率99%）。これはごく一部の特殊なケースのみです：全額${amount}（まとめ割引適用済み）を前払いでお支払いいただきます。遅くとも14日以内に削除されなかった口コミは、全額返金いたします。入金の確認後に着手します。`,
    prepayBtn: "前払いで支払う",
    next3nt: "本文のある口コミは、実際に削除された場合のみ、削除当日にお支払いいただきます。本文のない口コミは前払いで、遅くとも14日以内に削除されなかった場合は全額返金いたします。",
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
    next1: "En borttagning tar oftast några dagar, ibland upp till tre veckor.",
    next2: "Du behöver inte göra något — vi hör av oss så snart det finns nyheter.",
    next3: "Du betalar bara för omdömen som vi faktiskt tar bort, förfaller samma dag som borttagningen.",
    next4: "Varje omdöme hanteras för sig, så tiden till borttagning kan variera mellan omdömena. För att göra det enkelt för dig kan vi fakturera varje borttaget omdöme separat – bli inte förvånad om du får en betalningslänk per omdöme.",
    declined: (n) => `Vi har också gått igenom ${n === 1 ? "det andra omdömet" : `de övriga ${n} omdömena`} du skickade: ${n === 1 ? "det kan" : "de kan"} inte tas bort via Googles processer, så vi arbetar inte med ${n === 1 ? "det" : "dem"} – och du betalar förstås ingenting för ${n === 1 ? "det" : "dem"}.`,
    sw: (n) => `Goda nyheter för ${n === 1 ? "ett omdöme till" : `${n} omdömen till`}: ${n === 1 ? "det kan" : "de kan"} inte tas bort på vanligt sätt, men med en särskild programvara. Det gör vi inte själva – det är en extern tjänst, och därför tyvärr dyrare: {price} per omdöme, betalas i sin helhet i förskott – 99 % chans att lyckas. Tas ett omdöme inte bort inom senast 14 dagar får du hela beloppet tillbaka. Vill du det? Betala bara nedan – vi börjar så snart betalningen har kommit in.`,
    swBtn: "Betala i förskott",
    special: (n, price) => `Ett alternativ till för ${n === 1 ? "det omdömet" : "de omdömena"}: ${n === 1 ? "det kan" : "de kan"} bara tas bort med en särskild programvara. Det gör vi inte själva – det är en extern tjänst vi anlitar, och därför tyvärr dyrt: ${price} per omdöme, betalas i sin helhet i förskott – 99 % chans att lyckas. Tas ett omdöme inte bort inom senast 14 dagar får du hela beloppet tillbaka. Vill du gå den vägen? Svara bara på det här mejlet – vi börjar först när du uttryckligen har bekräftat.`,
    prepayH: "Förskottsbetalning – omdömen utan text",
    prepay: (n, amount) => `${n === 1 ? "Ett av omdömena saknar" : `${n} av omdömena saknar`} text, så vi tar bort ${n === 1 ? "det" : "dem"} med vårt särskilda, programvarustödda förfarande (99 % chans att lyckas). Det gäller bara ett fåtal specialfall: hela beloppet på ${amount} (mängdrabatt inräknad) betalas i förskott. Tas ett omdöme inte bort inom senast 14 dagar får du hela beloppet tillbaka. Vi börjar så snart betalningen har kommit in.`,
    prepayBtn: "Betala i förskott",
    next3nt: "Omdömen med text betalar du först när de faktiskt har tagits bort, samma dag. Omdömen utan text betalas i förskott – med full återbetalning om de inte har tagits bort inom senast 14 dagar.",
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
    next1: "En fjernelse tager som regel få dage, nogle gange op til tre uger.",
    next2: "Du skal ikke gøre noget — vi vender tilbage, så snart der er nyt.",
    next3: "Du betaler kun for anmeldelser, vi faktisk fjerner, forfalder på fjernelsesdagen.",
    next4: "Hver anmeldelse behandles for sig, så tiden til fjernelse kan variere fra anmeldelse til anmeldelse. For at gøre det nemt for dig kan vi fakturere hver fjernet anmeldelse separat – bliv derfor ikke overrasket, hvis du modtager et betalingslink for hver enkelt.",
    declined: (n) => `Vi har også gennemgået ${n === 1 ? "den anden anmeldelse" : `de øvrige ${n} anmeldelser`}, du sendte: ${n === 1 ? "den kan" : "de kan"} ikke fjernes via Googles processer, så dem arbejder vi ikke med – og du betaler naturligvis ikke noget for ${n === 1 ? "den" : "dem"}.`,
    sw: (n) => `Gode nyheder for ${n === 1 ? "én anmeldelse mere" : `${n} anmeldelser mere`}: ${n === 1 ? "den kan" : "de kan"} ikke fjernes på den normale måde, men med en særlig software. Det gør vi ikke selv – det er en ekstern tjeneste, og derfor desværre dyrere: {price} pr. anmeldelse, betales fuldt ud forud – 99 % succesrate. Bliver en anmeldelse ikke fjernet senest efter 14 dage, får du hele beløbet tilbage. Vil du det, så betal bare herunder – vi går i gang, så snart betalingen er modtaget.`,
    swBtn: "Betal forud",
    special: (n, price) => `Én mulighed mere for ${n === 1 ? "den anmeldelse" : "de anmeldelser"}: ${n === 1 ? "den kan" : "de kan"} kun fjernes med en særlig software. Det gør vi ikke selv – det er en ekstern tjeneste, vi bruger, og derfor desværre dyrt: ${price} pr. anmeldelse, betales fuldt ud forud – 99 % succesrate. Bliver en anmeldelse ikke fjernet senest efter 14 dage, får du hele beløbet tilbage. Vil du gå den vej, så svar bare på denne mail – vi går først i gang, når du udtrykkeligt har bekræftet det.`,
    prepayH: "Forudbetaling – anmeldelser uden tekst",
    prepay: (n, amount) => `${n === 1 ? "En af anmeldelserne har" : `${n} af anmeldelserne har`} ingen tekst, så vi fjerner ${n === 1 ? "den" : "dem"} med vores særlige, softwareunderstøttede procedure (99 % succesrate). Det gælder kun få særtilfælde: hele beløbet på ${amount} (mængderabat fratrukket) betales forud. Bliver en anmeldelse ikke fjernet senest efter 14 dage, får du hele beløbet tilbage. Vi går i gang, så snart betalingen er modtaget.`,
    prepayBtn: "Betal forud",
    next3nt: "Anmeldelser med tekst betaler du først, når de faktisk er fjernet, samme dag. Anmeldelser uden tekst betales forud – med fuld refusion, hvis de ikke er fjernet senest efter 14 dage.",
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
    next1: "En fjerning tar vanligvis noen dager, av og til opptil tre uker.",
    next2: "Du trenger ikke gjøre noe — vi tar kontakt så snart det er nytt.",
    next3: "Du betaler kun for omtaler vi faktisk fjerner, forfaller samme dag som fjerningen.",
    next4: "Hver omtale behandles for seg, så tiden til fjerning kan variere fra omtale til omtale. For å gjøre det enkelt for deg kan vi fakturere hver fjernede omtale separat – ikke bli overrasket om du får en betalingslenke per omtale.",
    declined: (n) => `Vi har også gått gjennom ${n === 1 ? "den andre omtalen" : `de øvrige ${n} omtalene`} du sendte: ${n === 1 ? "den kan" : "de kan"} ikke fjernes via Googles prosesser, så vi jobber ikke med ${n === 1 ? "den" : "dem"} – og du betaler selvsagt ingenting for ${n === 1 ? "den" : "dem"}.`,
    sw: (n) => `Gode nyheter for ${n === 1 ? "én omtale til" : `${n} omtaler til`}: ${n === 1 ? "den kan" : "de kan"} ikke fjernes på vanlig måte, men med en spesiell programvare. Det gjør vi ikke selv – det er en ekstern tjeneste, og derfor dessverre dyrere: {price} per omtale, betales i sin helhet på forskudd – 99 % suksessrate. Blir en omtale ikke fjernet senest innen 14 dager, får du hele beløpet tilbake. Vil du det, betaler du bare nedenfor – vi starter så snart betalingen er mottatt.`,
    swBtn: "Betal på forskudd",
    special: (n, price) => `Ett alternativ til for ${n === 1 ? "den omtalen" : "de omtalene"}: ${n === 1 ? "den kan" : "de kan"} bare fjernes med en spesiell programvare. Det gjør vi ikke selv – det er en ekstern tjeneste vi setter ut til, og derfor dessverre dyrt: ${price} per omtale, betales i sin helhet på forskudd – 99 % suksessrate. Blir en omtale ikke fjernet senest innen 14 dager, får du hele beløpet tilbake. Vil du gå den veien, svarer du bare på denne e-posten – vi starter først når du uttrykkelig har bekreftet det.`,
    prepayH: "Forskuddsbetaling – omtaler uten tekst",
    prepay: (n, amount) => `${n === 1 ? "En av omtalene har" : `${n} av omtalene har`} ingen tekst, så vi fjerner ${n === 1 ? "den" : "dem"} med vår spesielle, programvarestøttede prosedyre (99 % suksessrate). Dette gjelder bare noen få spesialtilfeller: hele beløpet på ${amount} (mengderabatt trukket fra) betales på forskudd. Blir en omtale ikke fjernet senest innen 14 dager, får du hele beløpet tilbake. Vi starter så snart betalingen er mottatt.`,
    prepayBtn: "Betal på forskudd",
    next3nt: "Omtaler med tekst betaler du først når de faktisk er fjernet, samme dag. Omtaler uten tekst betales på forskudd – med full refusjon hvis de ikke er fjernet senest innen 14 dager.",
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
            : <span key={i}><strong>{it.name}</strong> — “{it.text}”</span>
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
          {software.url ? <div style={{ textAlign: "center", margin: "6px 0 18px" }}><CtaButton href={software.url}>{t.swBtn} · {software.amount}</CtaButton></div> : null}
        </React.Fragment>
      ) : null}

      {prepay && prepay.n > 0 && t.prepay ? (
        <React.Fragment>
          <P><strong>{t.prepayH}</strong><br />{t.prepay(prepay.n, prepay.amount)}</P>
          {prepay.url ? <div style={{ textAlign: "center", margin: "6px 0 18px" }}><CtaButton href={prepay.url}>{t.prepayBtn} · {prepay.amount}</CtaButton></div> : null}
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
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
