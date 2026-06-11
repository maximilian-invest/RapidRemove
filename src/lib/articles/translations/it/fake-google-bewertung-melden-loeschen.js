/* IT — fake-google-bewertung-melden-loeschen */
const article = {
  category: "Reputazione",
  meta: {
    slug: "eliminare-recensioni-false-google",
    title: "Recensioni false su Google: riconoscere, segnalare ed eliminare (guida 2026)",
    h1: "Recensioni false su Google: riconoscere, segnalare ed eliminare",
    description: "Riconosci, segnala ed elimina le recensioni false di Google: guida passo passo, situazione legale, se le recensioni false sono perseguibili e cosa funziona davvero quando Google non risponde.",
    keywords: ["eliminare recensioni false google", "segnalare recensioni false google", "riconoscere recensioni false google", "recensioni false google reato", "cosa fare contro recensioni false google", "segnalare recensione falsa google"],
    author: "Matthias Lang",
    authorRole: "Esperto Google",
    date: "2026-06-04",
  },
  dek: "Una recensione falsa a 1 stella da qualcuno che non è mai stato cliente? Non sei solo. Le recensioni false sono un fenomeno di massa: solo in Germania il danno all'economia è stimato in circa **3,8 miliardi di euro all'anno**. In questa guida scoprirai **come riconoscere le recensioni false, segnalarle a Google e – se Google non risponde – farle eliminare definitivamente.**",
  blocks: [
    { t: "note", title: "Avviso", text: "Questo articolo offre un orientamento pratico e non costituisce consulenza legale. Per una valutazione legale del caso, consulta un avvocato." },

    { t: "h2", id: "was-ist", text: "Cos'è una recensione falsa?", toc: "Cos'è?" },
    { t: "p", text: "Una recensione falsa è una recensione che **non riflette un'esperienza reale di un cliente**. Le fonti tipiche sono concorrenti che vogliono sabotare la tua reputazione, ex dipendenti scontenti, tentativi di estorsione («Paga, altrimenti arriva la recensione a 1 stella») o semplici casi di confusione con un'altra attività. Tali recensioni violano le linee guida di Google e sono quindi in linea di principio contestabili." },

    { t: "h2", id: "erkennen", text: "Riconoscere le recensioni false su Google: 7 segnali d'allarme", toc: "7 segnali" },
    { t: "p", text: "Prima di agire, documenta la recensione (screenshot con data). Questi segni indicano una falsificazione:" },
    { t: "ol", items: [
      "**Nessun collegamento al servizio**: la recensione non descrive nulla di pertinente alla tua offerta.",
      "**1 stella senza testo**: nessuna motivazione comprensibile.",
      "**Profilo senza storico**: l'account ha poche recensioni o solo negative.",
      "**Tempistica sospetta**: più recensioni negative in poco tempo (attacco coordinato).",
      "**Nessun cliente rintracciabile**: il nome non compare in nessun ordine o prenotazione.",
      "**Contenuti estranei**: pubblicità, insulti o confusione tra attività.",
      "**Formulazioni identiche**: testi ricorrenti che compaiono presso più aziende.",
    ] },

    { t: "h2", id: "strafbar", text: "Le recensioni false sono perseguibili?", toc: "Perseguibili?" },
    { t: "p", text: "Le affermazioni di fatti deliberatamente false e le recensioni contraffatte possono avere conseguenze legali: dalle diffide al risarcimento e, in certi casi, aspetti penali o di concorrenza. Il problema nella pratica: l'autore è spesso **anonimo**, e la via legale contro un ignoto è lunga. Per questo la leva pragmatica di solito non è la denuncia penale, ma la **rimozione della recensione** su Google stesso." },

    { t: "h2", id: "melden", text: "Come segnalare una recensione falsa a Google", toc: "Segnalare (guida)" },
    { t: "p", text: "Il primo passo gratuito è la segnalazione tramite il profilo dell'attività:" },
    { t: "ol", items: [
      "Apri il tuo **profilo dell'attività su Google** e vai alle recensioni.",
      "Trova la recensione in questione e fai clic sul **menu a tre puntini**.",
      "Scegli **«Segnala recensione»**.",
      "Indica la violazione adatta (es. «Informazioni false», «Fuori tema», «Conflitto di interessi»).",
      "Invia la segnalazione.",
    ] },
    { t: "p", text: "Inoltre puoi seguire lo stato e segnalare più recensioni insieme tramite lo **strumento Google per la gestione delle recensioni**." },

    { t: "h2", id: "google-reagiert", text: "Quando Google non risponde: cosa fare?", toc: "Google non risponde" },
    { t: "p", text: "Qui inizia la frustrazione di molti imprenditori. Google verifica le segnalazioni **in gran parte in modo automatizzato** e spesso le rifiuta con testi standard, anche di fronte a falsi evidenti. A quel punto non hai una vera possibilità di escalation e torni al punto di partenza." },
    { t: "p", text: "Due vie portano avanti:" },
    { t: "ul", items: [
      "**Via dell'avvocato:** una richiesta di rimozione motivata può avere successo con recensioni chiaramente illecite, ma spesso richiede settimane o mesi, si fattura per recensione e può provocare «recensioni di vendetta» (effetto Streisand).",
      "**Rimozione del profilo:** invece di attaccare ogni recensione falsa singolarmente, si rimuove l'intero profilo; tutte le recensioni spariscono con esso.",
    ] },

    { t: "h2", id: "loeschen", text: "Liberarsi delle recensioni false: la soluzione definitiva", toc: "Soluzione definitiva" },
    { t: "p", text: "Di fronte a un **attacco coordinato di recensioni false** con molte recensioni, segnalarle una a una è una corsa senza fine. Per questo RapidRemove segue un'altra strada: **non eliminiamo singole recensioni, ma l'intero profilo dell'attività su Google.** Tutte le recensioni false spariscono nel corso della rimozione: riparti con una nuova partenza." },
    { t: "table", rrCol: 3, head: ["Criterio", "Segnalare da soli", "Avvocato", "RapidRemove (rimozione profilo)"], rows: [
      ["Cosa viene rimosso", "singola recensione", "singola recensione", "tutto il profilo + tutte le recensioni"],
      ["Velocità", "incerto", "3 – 9 mesi", "24 – 48 h"],
      ["Successo", "raro", "incerto", "garantito"],
      ["Costo", "gratis", "a recensione, anticipato", "prezzo fisso dopo il successo"],
      ["Tutte le false via", "una a una", "casi singoli", "sì (con il profilo)"],
      ["Impegno", "medio", "alto", "nullo"],
    ] },
    { t: "p", text: "Il vantaggio decisivo: paghi solo **dopo la rimozione riuscita** e, se il profilo riappare tramite terzi, viene rimosso di nuovo gratis nell'ambito della garanzia." },
    { t: "warn", title: "Importante", text: "La rimozione del profilo elimina il **profilo dell'attività completo**, non una singola recensione falsa. Se vuoi solo eliminare una recensione e mantenere il profilo, la segnalazione a Google o la via dell'avvocato sono le opzioni giuste." },
    { t: "cta", title: "Attacco di recensioni false? Verifica gratis la fattibilità.", text: "Inserisci il nome della tua azienda: verifichiamo in pochi secondi se il tuo profilo e tutte le sue recensioni false si possono eliminare, e con quanta rapidità.", btn: "Verifica la fattibilità", href: "https://rapid-remove.com/", trust: ["Analisi gratis", "Garanzia", "Senza rischio"] },
  ],
  faq: [
    { q: "Come riconosco una recensione falsa su Google?", a: "Segni tipici sono la mancanza di collegamento al servizio, 1 stella senza testo, un profilo senza storico di recensioni, una tempistica sospetta di più recensioni negative e contenuti estranei o offensivi." },
    { q: "Come segnalo una recensione falsa a Google?", a: "Tramite il menu a tre puntini accanto alla recensione, premi «Segnala recensione», seleziona la violazione e invia. Puoi seguire lo stato con lo strumento Google per la gestione delle recensioni." },
    { q: "Le recensioni false sono perseguibili?", a: "Le recensioni deliberatamente false possono avere conseguenze civili, di concorrenza e in parte penali. Nella pratica l'autore è spesso anonimo, perciò rimuovere la recensione è di solito la leva più rapida di una denuncia. Questa non è consulenza legale." },
    { q: "Cosa posso fare se Google non rimuove la recensione falsa?", a: "Se la segnalazione viene respinta, resta la via dell'avvocato per una singola recensione. Se il profilo è danneggiato da molte false, la rimozione del profilo con RapidRemove è la più affidabile: l'intero profilo viene rimosso, tutte le recensioni spariscono con esso." },
    { q: "RapidRemove elimina singole recensioni false?", a: "No. RapidRemove rimuove l'intero profilo dell'attività; tutte le recensioni spariscono con esso. Per rimuovere una singola recensione mantenendo il profilo, sono competenti la segnalazione o un avvocato." },
    { q: "In quanto tempo si eliminano le recensioni false?", a: "Tramite la rimozione del profilo, spesso in 24–48 ore, molto più rapidamente della via legale di diversi mesi." },
  ],
  related: [
    { label: "Eliminare recensioni Google: costi e metodi a confronto", url: "https://rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Eliminare una recensione a 1 stella senza testo", url: "https://rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
    { label: "Recensione negativa su Google: cosa fare?", url: "https://rapid-remove.com/schlechte-google-bewertungen-was-tun" },
    { label: "Eliminare il profilo dell'attività su Google: come si fa?", url: "https://rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
