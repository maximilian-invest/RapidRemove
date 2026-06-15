/* IT — google-maps-eintrag-loeschen */
const article = {
  category: "Norme di Google",
  meta: {
    slug: "eliminare-scheda-google-maps",
    title: "Eliminare una scheda Google Maps: propria, altrui e duplicata (2026)",
    h1: "Eliminare una scheda Google Maps: propria, altrui e duplicata",
    description: "Eliminare una scheda Google Maps – sia propria, altrui, errata o duplicata. Guida passo passo, perché la scheda spesso resta e come farla eliminare in modo permanente.",
    keywords: ["eliminare scheda google maps", "rimuovere scheda google maps", "eliminare scheda altrui google maps", "eliminare scheda errata google maps", "rimuovere azienda da google maps", "eliminare scheda duplicata google"],
    author: "Matthias Lang",
    authorRole: "Esperto Google",
    date: "2026-06-04",
  },
  dek: "Una scheda obsoleta, errata o duplicata su Google Maps può confondere i clienti e danneggiare la tua reputazione. Ma eliminarla è più insidioso di quanto molti credano: anche se cancelli tutto dal tuo account, **la scheda spesso resta visibile in Maps e nella ricerca.** Questa guida mostra come eliminare schede Google Maps proprie, altrui, errate e duplicate, e come funziona davvero una rimozione permanente.",
  blocks: [
    { t: "note", title: "Avviso", text: "Questo articolo è una guida pratica e non consulenza legale." },

    { t: "h2", id: "eigener", text: "Eliminare la tua scheda Google Maps", toc: "La tua scheda" },
    { t: "p", text: "Se sei il proprietario della scheda, puoi scollegarla dal tuo account:" },
    { t: "ol", items: [
      "Cerca su Google **«Il tuo profilo dell'attività»** e apri le impostazioni del profilo.",
      "Vai, tramite il **menu a tre puntini**, a **«Rimuovi il profilo dell'attività»**.",
      "Scegli **«Rimuovi i contenuti del profilo e gli amministratori»** e conferma.",
    ] },

    { t: "h2", id: "sichtbar", text: "Perché la scheda resta comunque visibile", toc: "Perché resta" },
    { t: "p", text: "Questo è il punto decisivo che Google occulta deliberatamente: rimuoverla dal tuo account **non** significa che l'azienda sparisca da Maps e dalla ricerca. Viene solo scollegata dal tuo account e di norma contrassegnata come **«Chiusa definitivamente»**. La scheda e le recensioni **restano**. Nelle sue condizioni d'uso, Google si schiera espressamente contro l'eliminazione completa dei profili delle attività, per cui una rimozione totale con il solo account è praticamente impossibile." },

    { t: "h2", id: "fremder", text: "Segnalare una scheda altrui o errata", toc: "Scheda altrui" },
    { t: "p", text: "Per le schede che non sono tue (es. una errata o obsoleta), usa la funzione di segnalazione:" },
    { t: "ol", items: [
      "Apri la scheda in **Google Maps**.",
      "Fai clic su **«Suggerisci una modifica»**.",
      "Scegli **«Segnala come chiuso o rimuovi»**.",
      "Indica il motivo, es. **«Non esiste»** o **«Offensivo, dannoso o ingannevole»**.",
      "Salva e attendi la verifica di Google.",
    ] },
    { t: "p", text: "Se il suggerimento viene approvato, la scheda può essere rimossa dalla ricerca e da Maps. L'elaborazione, però, non è garantita e può richiedere tempo." },

    { t: "h2", id: "doppelt", text: "Eliminare una scheda Google duplicata", toc: "Scheda duplicata" },
    { t: "p", text: "Le schede duplicate nascono spesso da traslochi, cambi di nome o creazioni multiple per errore. Procedi così:" },
    { t: "ol", items: [
      "Apri il profilo **duplicato** in Google Maps.",
      "Fai clic su **«Suggerisci una modifica»** → **«Segnala come chiuso o rimuovi»**.",
      "Scegli come motivo **«Duplicato di un altro luogo»** e salva.",
    ] },
    { t: "warn", title: "Importante", text: "Non eliminare per errore la scheda **verificata**, altrimenti dovrai confermarla di nuovo. Se entrambe le schede hanno già recensioni, non eliminarle; falle piuttosto **unire** tramite l'assistenza Google per conservare le recensioni." },

    { t: "h2", id: "dauerhaft", text: "Rimozione permanente e completa", toc: "Rimozione permanente" },
    { t: "p", text: "Se vuoi rimuovere un profilo **del tutto e in modo permanente** – incluse tutte le recensioni – da Google Maps e dalla ricerca, non è possibile con il tuo account. Qui aiuta un'agenzia specializzata con rimozione tecnica:" },
    { t: "ul", items: [
      "**Efficienza:** rimozione spesso in massimo 24 ore",
      "**Integrale:** profilo e recensioni vengono rimossi del tutto",
      "**Compatibile con la SEO:** il tuo sito e il tuo posizionamento restano intatti",
      "**Garantito:** se il profilo riappare tramite terzi, viene rimosso gratis",
    ] },
    { t: "cta", title: "Verifica gratis se la tua scheda Maps si può eliminare.", text: "Inserisci il nome della tua azienda: verifichiamo in pochi secondi se il tuo profilo e tutte le sue recensioni si possono eliminare, e con quanta rapidità.", btn: "Verifica la fattibilità", href: "https://www.rapid-remove.com/", trust: ["Analisi gratis", "Garanzia", "Senza rischio"] },
  ],
  faq: [
    { q: "Come elimino la mia scheda Google Maps?", a: "Tramite «Il tuo profilo dell'attività» → impostazioni → menu a tre puntini → «Rimuovi il profilo dell'attività» → «Rimuovi i contenuti del profilo e gli amministratori». Attenzione: questo scollega solo la scheda dal tuo account, non la rimuove da Maps." },
    { q: "Perché la mia scheda Google Maps resta visibile dopo l'eliminazione?", a: "Perché rimuoverla dall'account contrassegna solo la scheda come «Chiusa definitivamente». La scheda e le recensioni restano in Maps e nella ricerca. Google non offre una via diretta; nella pratica una rimozione completa riesce di norma tramite un'agenzia specializzata." },
    { q: "Come segnalo una scheda altrui o errata?", a: "In Google Maps apri la scheda, «Suggerisci una modifica» → «Segnala come chiuso o rimuovi», indica il motivo (es. «Non esiste») e salva. Google verifica il suggerimento." },
    { q: "Come elimino una scheda Google duplicata?", a: "Apri il duplicato in Maps, «Suggerisci una modifica» → «Segnala come chiuso o rimuovi» → scegli «Duplicato di un altro luogo». Se entrambe le schede hanno recensioni, falle piuttosto unire tramite l'assistenza Google." },
    { q: "Posso far eliminare una scheda Google Maps in modo permanente?", a: "Del tutto e in modo permanente, incluse le recensioni, riesce di norma tramite un'agenzia specializzata, poiché Google non prevede l'auto-eliminazione. La rimozione tecnica avviene spesso in 24 ore — si paga solo dopo il successo." },
  ],
  related: [
    { label: "Eliminare il profilo dell'attività su Google: come si fa?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Eliminare recensioni Google: costi e metodi", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Segnalare ed eliminare una recensione Google falsa", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Recensione negativa su Google: cosa fare?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
