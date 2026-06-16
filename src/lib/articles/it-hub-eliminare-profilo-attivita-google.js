/* IT hub: "Eliminare il profilo dell'attività su Google" (lead article, MagArticle format) */
const article = {
  meta: {
    slug: "eliminare-profilo-attivita-google",
    title: "Eliminare il profilo dell'attività su Google: guida completa (come si fa davvero)",
    h1: "Eliminare il profilo dell'attività su Google — come funziona davvero?",
    description: "Google non permette di eliminare semplicemente il profilo della tua attività. Questa guida spiega perché «definitivamente chiusa» non è un'eliminazione — e come rimuoverlo davvero.",
    author: "Maximilian Hölzl",
    authorRole: "Esperto Google e fondatore",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Norme di Google",
  iconKey: "trash",
  readingMin: 11,
  dek: "Google non ti permette di eliminare il profilo della tua attività con un semplice clic. Questa guida spiega perché «definitivamente chiusa» non è un'eliminazione — e come rimuoverlo davvero.",
  blocks: [
    { t: "h2", id: "kurz", text: "In breve", toc: "In breve" },
    { t: "ul", items: [
      "**Farlo da soli è quasi impossibile:** Google non offre un vero pulsante «elimina profilo» — solo l'opzione «definitivamente chiusa».",
      "**«Chiusa» ≠ eliminata:** la scheda, il nome, l'indirizzo e **tutte le recensioni restano visibili al pubblico.**",
      "**L'unico modo affidabile** è la rimozione completa del profilo tramite le procedure ufficiali — legale e definitiva.",
      "**RapidRemove** rimuove il profilo insieme a tutte le recensioni di norma in **24–48 ore** — **pagamento solo dopo il successo**.",
    ] },

    { t: "p", text: "Cerchi la tua attività su Google e vedi un profilo che non vuoi più: pieno di recensioni false o di ritorsione, con dati errati, oppure semplicemente una scheda dalla quale vuoi uscire definitivamente. La domanda logica è: **Come posso eliminare il profilo della mia attività su Google?** La risposta onesta è più complicata di quanto Google voglia farti credere. Questa guida ti mostra cosa funziona davvero — passo dopo passo, senza giri di parole." },

    { t: "h2", id: "herkunft", text: "Chi ha creato questo profilo, in realtà?", toc: "Chi l'ha creato?" },
    { t: "p", text: "La maggior parte degli imprenditori che ci contattano non ha mai creato il proprio profilo — e si stupisce sinceramente che esista. Non è l'eccezione, è la regola. Un profilo dell'attività su Google viene raramente creato attivamente dal titolare. Molto più spesso lo aggiunge qualcun altro, oppure Google lo genera in modo completamente automatico. Per capire perché poi una scheda del genere è così difficile da eliminare, conviene sapere prima come è arrivata lì. Le strade, in sostanza, sono tre." },
    { t: "anim", caption: "Tre modi in cui nasce un profilo dell'attività — quasi sempre senza alcun intervento del titolare." },

    { t: "h3", text: "Via 1: qualcuno aggiunge il luogo a mano" },
    { t: "p", text: "Qualsiasi utente di Google può, nell'app Maps, toccare un indirizzo o un punto vuoto e scegliere «Aggiungi un luogo mancante». In questo modo è possibile inserire un'attività senza averci nulla a che fare — lo fanno clienti, ex dipendenti, concorrenti o utenti molto attivi di Maps (i Local Guide)." },
    { t: "p", text: "Non avviene però del tutto senza controlli. Prima che un luogo segnalato venga pubblicato, in background parte una verifica automatica:" },
    { t: "ul", items: [
      "**Posizione:** l'utente si trova davvero vicino al luogo che vuole aggiungere? Questo impedisce a qualcuno di Berlino di inventarsi per scherzo un bar a Monaco.",
      "**Controllo dei duplicati:** esiste già un nome simile o la stessa categoria a quelle coordinate o lì accanto?",
      "**Confronto con il web:** Google cerca il nome in parallelo per vedere se l'attività compare da qualche parte online.",
    ] },
    { t: "p", text: "Se il quadro è coerente, il punto viene pubblicato — visibile a tutti come **profilo non rivendicato**." },

    { t: "h3", text: "Via 2: Google crea il profilo da sé a partire dai dati del web" },
    { t: "p", text: "È la via a cui si pensa di meno: Google crea profili in gran numero per conto proprio — senza l'intervento né il consenso del titolare. Il motivo è semplice: Google vuole rappresentare il mondo reale nel modo più completo possibile e non aspetta che una nuova attività si faccia avanti." },
    { t: "p", text: "Per farlo, i crawler di Google scandagliano di continuo il web alla ricerca dei cosiddetti **dati NAP** — nome, indirizzo, telefono (*Name, Address, Phone*). Da questi frammenti il sistema assembla un profilo, attivato per esempio da:" },
    { t: "ul", items: [
      "**Dati strutturati sul sito:** se il sito di un'azienda inserisce nel codice il markup standardizzato `LocalBusiness` (informazioni leggibili dalle macchine secondo Schema.org), Google legge indirizzo, telefono e orari in modo diretto e pulito.",
      "**Tracce digitali in rete:** Google combina informazioni da pagine Facebook, profili Instagram, citazioni nei media locali ed elenchi telefonici online.",
      "**Verifica di coerenza:** quando la stessa attività con lo stesso indirizzo compare più volte in modo concorde — sul proprio sito, su Facebook e in un blog locale — Google ne crea automaticamente una nuova scheda su Maps.",
    ] },
    { t: "p", text: "La maggior parte dei titolari se ne accorge solo quando, all'improvviso, vede sulla mappa il pulsante «Rivendica questa attività»." },

    { t: "h3", text: "Via 3: importazione di massa da registri ufficiali" },
    { t: "p", text: "La terza via è spesso sottovalutata: Google acquisisce dati su larga scala da fonti ufficiali e da aggregatori con cui ha accordi." },
    { t: "ul", items: [
      "**Registri delle imprese:** non appena un'azienda viene registrata presso l'ufficio competente o nel registro delle imprese, questi dati arrivano a Google a intervalli regolari — di solito tramite banche dati intermedie.",
      "**Elenchi di categoria:** Google confronta le sue mappe con le Pagine Gialle e gli elenchi telefonici di ciascun Paese. Una nuova voce lì può generare automaticamente un nuovo punto su Maps.",
    ] },
    { t: "p", text: "È così che un profilo può comparire poco dopo l'apertura della tua attività — senza che tu sia mai stato su Google." },

    { t: "p", text: "**Perché è importante** Comunque sia nato il profilo, la conseguenza è la stessa: una volta che esiste, raccoglie recensioni e compare nella Ricerca e su Maps. Non occorre averlo creato né gestirlo per esserne coinvolti — ed è proprio per questo che ignorarlo non basta. Va comunque rimosso attivamente." },

    { t: "h2", id: "selbst", text: "È possibile eliminare da soli la scheda dell'attività su Google?", toc: "Si può fare da soli?" },
    { t: "p", text: "In breve: **non come ti aspetteresti.** Google distingue nettamente tra il tuo account Google personale e il profilo pubblico dell'attività (un tempo «Google My Business», oggi «Profilo dell'attività su Google»). Puoi richiedere la titolarità e modificare alcuni dati — ma un pulsante chiaro «Rimuovi definitivamente questa scheda e tutte le recensioni» semplicemente non esiste per i titolari." },
    { t: "p", text: "Non è una svista, è una scelta deliberata: il profilo con le sue recensioni fa parte della Ricerca Google e di Google Maps. Google considera queste informazioni utili per gli utenti — e cede malvolentieri il controllo. È esattamente per questo che la maggior parte dei titolari, nel tentativo di eliminare da soli il proprio profilo, si trova presto di fronte a un muro." },

    { t: "h2", id: "geschlossen", text: "«Definitivamente chiusa» non è un'eliminazione", toc: "«Chiusa» ≠ eliminata" },
    { t: "p", text: "L'opzione che Google ti offre si chiama «Contrassegna come definitivamente chiusa». Molti la scambiano per un'eliminazione — ma non lo è. È solo un'**etichetta di stato**." },
    { t: "warn", title: "Cosa succede davvero con «chiusa»", text: "Il tuo profilo rimane visibile nella Ricerca Google e in Google Maps — compresi nome, indirizzo, foto e **tutte le recensioni**. Sopra campeggia soltanto un «Definitivamente chiusa» barrato. Per i potenziali clienti questo aspetto è spesso *peggiore* di prima." },
    { t: "p", text: "In altre parole: chi «chiude» non si libera della scheda né delle recensioni — anzi, in certi casi rende il problema ancora più visibile. Una **vera eliminazione**, invece, rimuove completamente la [scheda su Google Maps](/it/rivista/eliminare-scheda-google-maps/) insieme a tutte le recensioni." },

    { t: "h2", id: "optionen", text: "Quali sono le opzioni reali", toc: "Le opzioni reali" },
    { t: "p", text: "Concretamente esistono tre strade per liberarsi di un profilo indesiderato — con risultati molto diversi:" },
    { t: "table", rrCol: 3, head: ["Criterio", "Da soli (DIY)", "Avvocato", "RapidRemove"], rows: [
      ["Eliminazione completa possibile?", "Praticamente no", "Incerta", "Sì"],
      ["Tempi", "—", "3–9 mesi", "24–48 ore"],
      ["Costi", "—", "300 €+ / ora", "Prezzo fisso da 450 €"],
      ["Tutte le recensioni rimosse", "No", "Singolarmente, con fatica", "Tutte in una volta"],
      ["Risultato garantito", "No", "Incerto", "Garantito (No Cure, No Pay)"],
      ["Impegno richiesto", "Alto", "Alto", "Praticamente zero"],
    ] },
    { t: "p", text: "La strada fai-da-te si conclude quasi sempre con «definitivamente chiusa». Quella dell'avvocato è costosa, lenta e incerta — e non di rado scatena il [cosiddetto effetto Streisand](/it/rivista/eliminare-recensione-negativa-google-avvocato-o-tecnica/), aumentando l'attenzione proprio su ciò che si voleva far sparire. Resta la terza strada: la rimozione professionale e completa." },

    { t: "h2", id: "anleitung", text: "Guida: modificare il profilo tramite Google", toc: "Guida via Google" },
    { t: "p", text: "Se vuoi provare prima da solo, ecco il flusso reale. Aspettati che il risultato migliore raggiungibile sia «chiusa» — non «eliminata»." },
    { t: "ol", items: [
      "**Richiedere la titolarità:** cerca la tua attività su Google e seleziona «Sei il titolare di questa attività?». Google richiede una verifica (cartolina, telefono, email o video) — che può richiedere giorni o settimane.",
      "**Accedere al profilo dell'attività:** una volta confermata la titolarità, gestisci il profilo direttamente dalla Ricerca Google.",
      "**Cercare «Rimuovi profilo»:** tra le impostazioni troverai opzioni come «Contrassegna l'attività come definitivamente chiusa» o «Rimuovi profilo». Quest'ultima rimuove solo il collegamento di gestione, non la scheda pubblica.",
      "**Verificare il risultato:** di norma la scheda rimane visibile con tutte le recensioni — con l'etichetta «Definitivamente chiusa». Il problema di fondo non è risolto.",
    ] },
    { t: "note", title: "Importante", text: "Senza una titolarità confermata puoi fare ben poco. E anche con la titolarità, la rimozione completa della scheda pubblica attraverso l'interfaccia standard non è prevista." },

    { t: "cta", title: "Preferisci verificare subito se il tuo profilo è eliminabile?", text: "Inserisci il nome della tua attività — troviamo il tuo profilo Google reale e verifichiamo in pochi secondi se e con quale rapidità può essere rimosso. Senza impegno e gratuitamente.", btn: "Avvia il check gratuito", href: "/it/?start=1", trust: ["Pagamento solo dopo l'eliminazione avvenuta"] },

    { t: "h2", id: "einzeln", text: "Eliminare le singole recensioni o rimuovere l'intero profilo?", toc: "Singole o intero?" },
    { t: "p", text: "In molti iniziano cercando di [segnalare](/it/rivista/eliminare-recensioni-false-google/) le singole recensioni negative a Google. È un percorso faticoso e dall'esito incerto: Google rigetta spesso le segnalazioni, ogni recensione va motivata singolarmente — e per ogni recensione rimossa ne spuntano subito di nuove. Si combattono i sintomi, non la causa." },
    { t: "p", text: "L'approccio sostenibile agisce alla radice: **rimuovendo l'intero profilo, tutte le recensioni scompaiono in un colpo solo** — comprese quelle false e quelle di ritorsione. Un risultato definitivo, non un rattoppo. È esattamente per questo che noi non eliminiamo le singole recensioni, ma il profilo completo. Chi per ora desidera far [eliminare singole recensioni Google](/it/rivista/eliminare-recensioni-google/) trova lì i metodi e i costi a confronto." },
    { t: "tip", title: "Il vantaggio decisivo", text: "Un profilo rimosso non può più mostrare né le vecchie né le nuove recensioni. Il problema non è rimandato — è risolto." },

    { t: "h2", id: "legal", text: "È legale farlo eliminare?", toc: "È legale?" },
    { t: "p", text: "Sì. Una rimozione professionale opera esclusivamente tramite le **procedure ufficiali previste da Google** ed è stata verificata sul piano legale. Non viene violato nulla, non si aggira nessun sistema e non si ottiene alcun accesso non autorizzato. Il tuo account Google, Gmail e gli eventuali account Google Ads rimangono completamente intatti — così come il tuo sito, il tuo posizionamento organico e le tue campagne." },
    { t: "p", text: "Un fornitore serio si riconosce dal fatto che indica un'azienda reale con indirizzo e partita IVA, parla in modo trasparente del metodo e **addebita solo dopo il successo** — non da vaghe promesse su «accessi segreti a Google»." },

    { t: "h2", id: "kosten", text: "Quanto tempo ci vuole — e quanto costa?", toc: "Tempi e costi" },
    { t: "p", text: "Una rimozione professionale è di norma completata **entro 24–48 ore** — invece dei mesi che assorbe la strada dell'avvocato. Sul fronte dei costi: un avvocato fattura a ore (spesso 300 € o più) senza garanzia di risultato. RapidRemove lavora con un **prezzo fisso trasparente a partire da 450 €** — e paghi **solo dopo l'eliminazione avvenuta**." },
    { t: "p", text: "Il prezzo sembra alto? Fai un calcolo: una singola recensione falsa visibile può ridurre sensibilmente la percentuale di clic e costarti molto di più nel corso dei mesi." },

    { t: "h2", id: "ablauf", text: "Come funziona la rimozione con RapidRemove", toc: "Come funziona" },
    { t: "ol", items: [
      "**Check gratuito:** inserisci il nome dell'attività. Troviamo il tuo profilo e verifichiamo subito se la rimozione è possibile — senza impegno e gratuitamente.",
      "**Conferma e autorizzazione:** confermi il profilo corretto e ci autorizzi a procedere. Nessun accesso a Gmail, Ads o dati personali.",
      "**Rimozione in 24–48 ore:** il nostro team rimuove il profilo insieme a tutte le recensioni — definitivamente. Il pagamento avviene solo dopo.",
    ] },

    { t: "h2", id: "fazit", text: "Conclusione: il modo più rapido e sicuro per un risultato pulito", toc: "Conclusione" },
    { t: "p", text: "Eliminare da soli un profilo dell'attività su Google fallisce nella quasi totalità dei casi a causa del sistema di Google stesso — «definitivamente chiusa» non risolve il problema. La strada affidabile è la rimozione completa e legale dell'intero profilo insieme a tutte le recensioni. Rapida, definitiva, prevedibile — e senza alcun rischio grazie al pagamento solo dopo il successo." },

    { t: "cta", title: "Verifica ora gratuitamente se il tuo profilo è eliminabile", text: "In pochi secondi vedi il tuo profilo reale e scopri se e con quale rapidità possiamo rimuoverlo. Nessun pagamento anticipato, nessun impegno.", btn: "Avvia il check gratuito", href: "/it/?start=1", trust: ["Zero rischi", "Pagamento solo dopo l'eliminazione avvenuta"] },
  ],
  faq: [
    { q: "Posso eliminare da solo il profilo della mia attività su Google?", a: "Solo in misura limitata. Google non offre un semplice pulsante «elimina profilo». Puoi richiedere la titolarità e contrassegnare il profilo come «definitivamente chiusa» — ma la scheda con tutte le recensioni rimane comunque visibile al pubblico." },
    { q: "Qual è la differenza tra «definitivamente chiusa» ed «eliminata»?", a: "«Definitivamente chiusa» è solo uno stato. Il profilo rimane visibile nella Ricerca e su Maps, inclusi nome, indirizzo e tutte le recensioni. Una vera eliminazione rimuove completamente la scheda e tutte le recensioni." },
    { q: "È legale far eliminare un profilo dell'attività su Google?", a: "Sì. La rimozione avviene tramite le procedure ufficiali previste da Google ed è stata verificata sul piano legale. Il tuo account Google, Gmail e gli eventuali account Ads rimangono completamente intatti." },
    { q: "Vengono rimosse anche tutte le recensioni?", a: "Sì. Quando viene rimosso l'intero profilo dell'attività, tutte le recensioni collegate scompaiono in un colpo solo — comprese quelle false e quelle di ritorsione." },
    { q: "Quanto tempo richiede la rimozione?", a: "Di norma il profilo viene rimosso entro circa 24 ore. Puoi seguire lo stato in qualsiasi momento nel portale clienti." },
    { q: "La rimozione influisce sulla SEO, sul mio sito o su Google Ads?", a: "No. Viene rimosso esclusivamente il profilo dell'attività (Google Maps / Profilo dell'attività su Google). Il tuo sito, il tuo posizionamento e le tue campagne rimangono invariati." },
    { q: "Quanto costa far eliminare un profilo dell'attività su Google?", a: "Con RapidRemove si applica un prezzo fisso trasparente a partire da 450 € — e paghi solo dopo l'eliminazione avvenuta (No Cure, No Pay)." },
    { q: "Il profilo potrebbe ricomparire in seguito?", a: "Terze parti potrebbero in teoria creare un nuovo profilo. Con la protezione opzionale monitoriamo la tua scheda e rimuoviamo gratuitamente un profilo che dovesse ricomparire durante il periodo di protezione." },
  ],
};
export default article;
