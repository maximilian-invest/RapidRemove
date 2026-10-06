/* Push-Texte für Kunden (Design-Handoff „App-Icon & Push"): Titel 2–4 Wörter, Text max. eine Zeile,
 * kein Emoji, Kunde gesiezt (bzw. wie im Dashboard der jeweiligen Sprache). */

type L = {
  removedT: string; removedB: (name: string) => string;
  doneT: (n: number) => string; doneB: (id: string) => string;
  problemT: (n: number) => string; problemB: string;
  workingT: string; workingB: (name: string) => string;
  notPossT: string; notPossB: (name: string) => string;
  checkT: string; checkB: (name: string) => string;
  review: string;
};

const T: Record<string, L> = {
  de: {
    removedT: "Bewertung entfernt", removedB: (n) => `Die Bewertung von ${n} ist nicht mehr auf Google zu finden.`,
    doneT: (n) => (n === 1 ? "1 Bewertung entfernt" : `${n} Bewertungen entfernt`), doneB: (id) => `Ihre Bestellung ${id} ist abgeschlossen.`,
    problemT: (n) => (n === 1 ? "Problem mit 1 Bestellung" : `Problem mit ${n} Bestellungen`), problemB: "Tippen Sie, um die Lösung zu sehen.",
    workingT: "In Bearbeitung", workingB: (n) => `Wir arbeiten an der Bewertung von ${n}.`,
    notPossT: "Nicht löschbar", notPossB: (n) => `Die Bewertung von ${n} bleibt online – keine Kosten.`,
    checkT: "Wird geprüft", checkB: (n) => `Wir prüfen die Bewertung von ${n}.`, review: "einer Person",
  },
  en: {
    removedT: "Review removed", removedB: (n) => `The review by ${n} is no longer on Google.`,
    doneT: (n) => (n === 1 ? "1 review removed" : `${n} reviews removed`), doneB: (id) => `Your order ${id} is complete.`,
    problemT: (n) => (n === 1 ? "Problem with 1 order" : `Problem with ${n} orders`), problemB: "Tap to see the solution.",
    workingT: "In progress", workingB: (n) => `We’re working on the review by ${n}.`,
    notPossT: "Not removable", notPossB: (n) => `The review by ${n} stays online – no charge.`,
    checkT: "Being checked", checkB: (n) => `We’re checking the review by ${n}.`, review: "a reviewer",
  },
  es: {
    removedT: "Reseña eliminada", removedB: (n) => `La reseña de ${n} ya no está en Google.`,
    doneT: (n) => (n === 1 ? "1 reseña eliminada" : `${n} reseñas eliminadas`), doneB: (id) => `Tu pedido ${id} está completado.`,
    problemT: (n) => (n === 1 ? "Problema con 1 pedido" : `Problema con ${n} pedidos`), problemB: "Toca para ver la solución.",
    workingT: "En curso", workingB: (n) => `Estamos trabajando en la reseña de ${n}.`,
    notPossT: "No se puede eliminar", notPossB: (n) => `La reseña de ${n} sigue en línea, sin coste.`,
    checkT: "En revisión", checkB: (n) => `Estamos revisando la reseña de ${n}.`, review: "un cliente",
  },
  fr: {
    removedT: "Avis supprimé", removedB: (n) => `L’avis de ${n} n’est plus sur Google.`,
    doneT: (n) => (n === 1 ? "1 avis supprimé" : `${n} avis supprimés`), doneB: (id) => `Ta commande ${id} est terminée.`,
    problemT: (n) => (n === 1 ? "Problème avec 1 commande" : `Problème avec ${n} commandes`), problemB: "Touche pour voir la solution.",
    workingT: "En cours", workingB: (n) => `Nous travaillons sur l’avis de ${n}.`,
    notPossT: "Non supprimable", notPossB: (n) => `L’avis de ${n} reste en ligne – sans frais.`,
    checkT: "En vérification", checkB: (n) => `Nous vérifions l’avis de ${n}.`, review: "un client",
  },
  it: {
    removedT: "Recensione rimossa", removedB: (n) => `La recensione di ${n} non è più su Google.`,
    doneT: (n) => (n === 1 ? "1 recensione rimossa" : `${n} recensioni rimosse`), doneB: (id) => `Il tuo ordine ${id} è completato.`,
    problemT: (n) => (n === 1 ? "Problema con 1 ordine" : `Problema con ${n} ordini`), problemB: "Tocca per vedere la soluzione.",
    workingT: "In lavorazione", workingB: (n) => `Stiamo lavorando alla recensione di ${n}.`,
    notPossT: "Non rimovibile", notPossB: (n) => `La recensione di ${n} resta online, senza costi.`,
    checkT: "In verifica", checkB: (n) => `Stiamo verificando la recensione di ${n}.`, review: "un cliente",
  },
  nl: {
    removedT: "Review verwijderd", removedB: (n) => `De review van ${n} staat niet meer op Google.`,
    doneT: (n) => (n === 1 ? "1 review verwijderd" : `${n} reviews verwijderd`), doneB: (id) => `Uw bestelling ${id} is afgerond.`,
    problemT: (n) => (n === 1 ? "Probleem met 1 bestelling" : `Probleem met ${n} bestellingen`), problemB: "Tik om de oplossing te zien.",
    workingT: "In behandeling", workingB: (n) => `We werken aan de review van ${n}.`,
    notPossT: "Niet verwijderbaar", notPossB: (n) => `De review van ${n} blijft online – geen kosten.`,
    checkT: "Wordt gecontroleerd", checkB: (n) => `We controleren de review van ${n}.`, review: "een klant",
  },
  pt: {
    removedT: "Avaliação removida", removedB: (n) => `A avaliação de ${n} já não está no Google.`,
    doneT: (n) => (n === 1 ? "1 avaliação removida" : `${n} avaliações removidas`), doneB: (id) => `A tua encomenda ${id} está concluída.`,
    problemT: (n) => (n === 1 ? "Problema com 1 encomenda" : `Problema com ${n} encomendas`), problemB: "Toca para ver a solução.",
    workingT: "Em curso", workingB: (n) => `Estamos a tratar da avaliação de ${n}.`,
    notPossT: "Não removível", notPossB: (n) => `A avaliação de ${n} fica online – sem custos.`,
    checkT: "Em análise", checkB: (n) => `Estamos a analisar a avaliação de ${n}.`, review: "um cliente",
  },
  ja: {
    removedT: "口コミを削除しました", removedB: (n) => `${n} さんの口コミは Google から削除されました。`,
    doneT: (n) => `${n}件の口コミを削除しました`, doneB: (id) => `ご注文 ${id} は完了しました。`,
    problemT: (n) => `${n}件のご注文に問題があります`, problemB: "タップして解決方法をご確認ください。",
    workingT: "対応中", workingB: (n) => `${n} さんの口コミに対応しています。`,
    notPossT: "削除できません", notPossB: (n) => `${n} さんの口コミは残ります（料金なし）。`,
    checkT: "確認中", checkB: (n) => `${n} さんの口コミを確認しています。`, review: "投稿者",
  },
  sv: {
    removedT: "Omdöme borttaget", removedB: (n) => `Omdömet från ${n} finns inte längre på Google.`,
    doneT: (n) => (n === 1 ? "1 omdöme borttaget" : `${n} omdömen borttagna`), doneB: (id) => `Din beställning ${id} är klar.`,
    problemT: (n) => (n === 1 ? "Problem med 1 beställning" : `Problem med ${n} beställningar`), problemB: "Tryck för att se lösningen.",
    workingT: "Pågår", workingB: (n) => `Vi arbetar med omdömet från ${n}.`,
    notPossT: "Kan inte tas bort", notPossB: (n) => `Omdömet från ${n} ligger kvar – ingen kostnad.`,
    checkT: "Granskas", checkB: (n) => `Vi granskar omdömet från ${n}.`, review: "en kund",
  },
  da: {
    removedT: "Anmeldelse fjernet", removedB: (n) => `Anmeldelsen fra ${n} er ikke længere på Google.`,
    doneT: (n) => (n === 1 ? "1 anmeldelse fjernet" : `${n} anmeldelser fjernet`), doneB: (id) => `Din ordre ${id} er afsluttet.`,
    problemT: (n) => (n === 1 ? "Problem med 1 ordre" : `Problem med ${n} ordrer`), problemB: "Tryk for at se løsningen.",
    workingT: "I gang", workingB: (n) => `Vi arbejder på anmeldelsen fra ${n}.`,
    notPossT: "Kan ikke fjernes", notPossB: (n) => `Anmeldelsen fra ${n} bliver online – ingen betaling.`,
    checkT: "Bliver tjekket", checkB: (n) => `Vi tjekker anmeldelsen fra ${n}.`, review: "en kunde",
  },
  no: {
    removedT: "Omtale fjernet", removedB: (n) => `Omtalen fra ${n} er ikke lenger på Google.`,
    doneT: (n) => (n === 1 ? "1 omtale fjernet" : `${n} omtaler fjernet`), doneB: (id) => `Bestillingen din ${id} er fullført.`,
    problemT: (n) => (n === 1 ? "Problem med 1 bestilling" : `Problem med ${n} bestillinger`), problemB: "Trykk for å se løsningen.",
    workingT: "Pågår", workingB: (n) => `Vi jobber med omtalen fra ${n}.`,
    notPossT: "Kan ikke fjernes", notPossB: (n) => `Omtalen fra ${n} blir liggende – ingen kostnad.`,
    checkT: "Sjekkes", checkB: (n) => `Vi sjekker omtalen fra ${n}.`, review: "en kunde",
  },
};

/** Push zu einer Statusänderung (Partner-Status: new | working | removed | not_possible | software). */
export function customerPush(lang: string | null | undefined, status: string, ctx: { name?: string | null; orderId: string; orderDone?: number; problemOrders?: number }): { title: string; body: string } {
  const t = T[String(lang || "en").slice(0, 2)] || T.en;
  const who = (ctx.name || "").trim().replace(/\.+$/, "") || t.review; // „Laura K." → kein doppelter Punkt
  if (status === "software") return { title: t.problemT(Math.max(1, ctx.problemOrders || 1)), body: t.problemB };
  if (status === "removed") return ctx.orderDone ? { title: t.doneT(ctx.orderDone), body: t.doneB(ctx.orderId) } : { title: t.removedT, body: t.removedB(who) };
  if (status === "not_possible") return { title: t.notPossT, body: t.notPossB(who) };
  if (status === "working") return { title: t.workingT, body: t.workingB(who) };
  return { title: t.checkT, body: t.checkB(who) };
}
