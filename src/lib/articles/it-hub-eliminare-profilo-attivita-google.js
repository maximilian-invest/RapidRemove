/* IT hub: "Eliminare il profilo dell'attività su Google" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile.js):
   Kurzantwort, Googles offizielle Schritte mit den exakten italienischen Menübezeichnungen
   (support.google.com/business/answer/4669092?hl=it, 16043467, 15300196), Vergleichstabelle,
   eigene Abschnitte je Suchintention (cosa succede / ricominciare / Google Maps / nessuna
   opzione) + erweiterte FAQ. Herkunft-Abschnitt nach hinten verschoben wie im EN-Hub.
   KERNBOTSCHAFT UNVERÄNDERT: „chiusa definitivamente" bzw. „rimuovere dall'account" ist kein
   Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige Entfernung läuft
   über die von Google vorgesehenen Verfahren, im Auftrag des Inhabers (RapidRemove). */
const article = {
  meta: {
    slug: "eliminare-profilo-attivita-google",
    title: "Eliminare il profilo dell'attività Google: 4 opzioni (2026)",
    h1: "Come eliminare il profilo dell'attività su Google (definitivamente)",
    description: "I passaggi di Google rimuovono solo il tuo accesso: scheda e recensioni restano su Maps. Cosa fanno davvero le 4 opzioni e come eliminarla per sempre.",
    author: "Maximilian Hölzl",
    authorRole: "Esperto Google e fondatore",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "eliminare profilo attività google",
      "eliminare scheda google my business",
      "come eliminare la mia attività da google",
      "cancellare attività da google maps",
      "chiudere scheda google",
      "rimuovere profilo dell'attività google",
      "cancellare google my business",
      "eliminare scheda google definitivamente",
    ],
  },
  category: "Norme di Google",
  iconKey: "trash",
  readingMin: 14,
  dek: "«Chiusa definitivamente» non significa eliminata — e nemmeno rimuovere il profilo dal tuo account: scheda, nome, indirizzo e tutte le recensioni restano visibili su Google. Questa guida mostra le opzioni ufficiali di Google, cosa fa davvero ciascuna e cosa funziona per eliminare del tutto il profilo dell'attività.",
  blocks: [
    { t: "note", title: "Nota", text: "Questa guida è una panoramica pratica e non costituisce consulenza legale. Per una valutazione vincolante del tuo caso rivolgiti a un professionista qualificato." },

    { t: "lead", text: "Vuoi **eliminare il profilo dell'attività su Google** — la vecchia **scheda Google My Business** — perché è piena di recensioni false, ha dati sbagliati o semplicemente non la vuoi più? Allora devi sapere una cosa prima di cliccare qualsiasi pulsante: ciò che Google chiama «rimuovere» non è ciò che intendi tu." },

    { t: "tip", title: "In breve", text: "Un profilo dell'attività su Google non si può semplicemente eliminare. Come titolare, Google ti permette solo di **rimuovere il profilo dal tuo account** (Impostazioni del profilo dell'attività → Rimuovi il profilo dell'attività) oppure di **contrassegnare l'attività come chiusa definitivamente**. In entrambi i casi la scheda pubblica e **tutte le recensioni restano nella Ricerca Google e su Google Maps** — termina solo il *tuo* accesso. La rimozione completa della scheda, recensioni incluse, passa esclusivamente attraverso le procedure che Google mette a disposizione. È esattamente ciò di cui si occupa RapidRemove, per conto del titolare — con **pagamento solo dopo la rimozione**." },

    { t: "h2", id: "why", text: "Perché non esiste un semplice pulsante «elimina»", toc: "Nessun pulsante «elimina»" },
    { t: "p", text: "Chi cerca come **eliminare una scheda Google My Business** si scontra presto con un muro. Puoi contrassegnare l'attività come **«chiusa definitivamente»** oppure rimuoverla dal tuo account — ma un pulsante chiaro con scritto **«elimina questa scheda e tutte le sue recensioni»** per i titolari non esiste. Non è una svista: Google considera il profilo e le sue recensioni un'informazione utile per chi cerca e tiene il controllo dalla sua parte. Il profilo descrive un luogo reale nel mondo — quindi, dal punto di vista di Google, non ti appartiene, anche se sei tu a gestirlo." },
    { t: "p", text: "Google distingue nettamente tra il tuo **Account Google** e il **profilo pubblico dell'attività** (un tempo «Google My Business», oggi «Profilo dell'attività su Google»). Sul primo decidi tu; sul secondo decide Google. Per questo la maggior parte dei titolari, nel tentativo di cancellare da soli la propria scheda, ottiene al massimo un'etichetta — non un'eliminazione." },
    { t: "warn", title: "«Definitivamente chiusa» ≠ eliminata", text: "Contrassegnare l'attività come chiusa **non** la rimuove. Scheda, nome, indirizzo, foto e **tutte le recensioni restano visibili al pubblico** nella Ricerca Google e su Google Maps — con in più l'etichetta «Chiuso definitivamente». Google stessa scrive che il profilo «potrebbe comunque essere visualizzato nella Ricerca e su Maps» e che non scompare «immediatamente». Per i potenziali clienti spesso l'effetto è **peggiore** di prima." },

    { t: "h2", id: "official-steps", text: "Come eliminare il profilo dell'attività su Google: i passaggi ufficiali", toc: "I passaggi ufficiali" },
    { t: "p", text: "Nella terminologia di Google, l'opzione per i titolari si chiama **«Rimuovi il profilo dell'attività»**. Esiste — ma rimuove il profilo dal *tuo Account Google*, non la scheda da Google. Ecco come funziona, con le voci di menu esatte, così sai precisamente cosa stai facendo (e cosa no)." },
    { t: "h3", text: "Dal computer (Ricerca Google)" },
    { t: "ol", items: [
      "Accedi con l'Account Google associato al profilo e vai al profilo della tua attività (ad es. cercando su Google il nome dell'attività).",
      "Seleziona **Altro** (⋮) → **Impostazioni del profilo dell'attività**.",
      "Seleziona **Rimuovi il profilo dell'attività** → **Rimuovi i contenuti dei profili e i gestori**.",
      "Se vuoi, attiva anche l'opzione **«Contrassegna la tua attività come chiusa definitivamente»**.",
      "Conferma con **Continua** → **Rimuovi** → **Fine**.",
    ] },
    { t: "h3", text: "Nell'app Google Maps" },
    { t: "p", text: "Apri l'app Google Maps con l'account del titolare, vai al profilo della tua attività e scegli **Altro** → **Impostazioni del profilo dell'attività** → **Rimuovi il profilo dell'attività**. Passaggi e risultato sono gli stessi che dal computer." },
    { t: "h3", text: "Più profili contemporaneamente" },
    { t: "p", text: "Se gestisci più sedi, apri **Gestione dei profili delle attività**, seleziona i profili da rimuovere e in alto a destra scegli **Azioni** → **Rimuovi attività** → **Rimuovi**. Se la rimozione multipla dà errore, secondo Google devi rimuovere contenuti e gestori profilo per profilo." },
    { t: "h3", text: "Solo chiudere la scheda (senza rimuoverla dall'account)" },
    { t: "p", text: "Per **chiudere la scheda Google** senza rinunciare alla gestione: vai al profilo della tua attività → **Modifica profilo** → **Orario** → nella sezione «Orario di apertura», accanto a «Orario», seleziona **Modifica** → **Chiuso definitivamente** → **Salva**. Per una pausa esiste anche **Chiuso temporaneamente**. In entrambi i casi la scheda resta online." },
    { t: "warn", title: "Cosa dice Google stessa che succede dopo", text: "Secondo le pagine di assistenza di Google, dopo la rimozione **l'attività potrebbe comunque essere visualizzata nella Ricerca e su Maps** e **«le recensioni e i contenuti generati dagli utenti rimangono invariati»**. Vengono eliminati definitivamente solo i *tuoi* contenuti: post, foto, video e risposte alle recensioni di proprietari e gestori. Possono farlo solo i **proprietari principali**, e i nuovi proprietari e gestori devono attendere **7 giorni**. Google avverte inoltre che, anche togliendo proprietà e contenuti, l'attività può continuare a comparire su Maps. In sintesi: l'opzione ufficiale mette fine alla *tua* gestione del profilo — non elimina il profilo." },

    { t: "h2", id: "options", text: "Eliminare, chiudere o rimuovere: cosa fa davvero ogni opzione", toc: "Tutte le opzioni a confronto" },
    { t: "p", text: "Si cerca «eliminare scheda Google My Business», «chiudere scheda Google», «cancellare l'attività da Google Maps» o «disattivare il profilo» — ma per Google si tratta di azioni molto diverse. Ecco cosa fa ciascuna alla scheda pubblica e alle sue recensioni:" },
    { t: "table", head: ["Opzione", "Cosa fa", "Scheda visibile?", "Recensioni visibili?"], rows: [
      ["Rimuovi il profilo dell'attività (dal tuo account)", "Elimina post, foto e risposte; tu e tutti i gestori perdete l'accesso", "Sì, ora senza gestore", "Sì"],
      ["Contrassegna come chiusa definitivamente", "Aggiunge l'etichetta «Chiuso definitivamente»", "Sì, con l'etichetta", "Sì"],
      ["Chiuso temporaneamente", "Aggiunge l'etichetta «Chiuso temporaneamente»", "Sì", "Sì"],
      ["Rimuoverti dal profilo / trasferire la proprietà", "Solo il tuo account perde l'accesso; contenuti e altri gestori restano", "Sì, invariata", "Sì"],
      ["Eliminare il tuo Account Google", "Il profilo perde il proprietario", "Sì, diventa non rivendicata", "Sì"],
      ["Suggerisci una modifica → «Questo luogo è chiuso o non si trova in questa posizione» (chiunque)", "Richiesta a Google, che decide da sé", "Di solito sì — per attività reali spesso respinta", "Sì, salvo rimozione"],
      ["Rimozione completa del profilo (RapidRemove)", "Rimozione tramite le procedure previste da Google, per conto del titolare", "No, rimossa da Ricerca e Maps", "No, tutte rimosse"],
    ] },
    { t: "p", text: "Un'altra fonte di confusione: **Google My Business** è semplicemente il vecchio nome del **Profilo dell'attività su Google**. Che tu la chiami scheda Google, pagina, account aziendale o profilo — è la stessa voce, e valgono le stesse regole." },

    { t: "h2", id: "what-happens", text: "Cosa succede se elimini il profilo dell'attività su Google?", toc: "Cosa succede dopo" },
    { t: "p", text: "Molti titolari si aspettano che la scheda sparisca appena la rimuovono dal proprio account. Ecco cosa succede davvero:" },
    { t: "ul", items: [
      "**Il tuo accesso finisce:** tu e tutti i gestori perdete il controllo del profilo. Per gestirlo di nuovo bisogna rivendicarlo e verificarlo da capo.",
      "**I tuoi contenuti spariscono:** post, foto e video caricati da te e le tue risposte alle recensioni vengono eliminati definitivamente e non si possono recuperare.",
      "**La scheda resta:** nome, indirizzo, categoria e orari di norma rimangono visibili nella Ricerca Google e su Google Maps.",
      "**Le recensioni restano:** ogni recensione dei clienti — anche quelle false o ingiuste — rimane pubblica, ora **senza le tue risposte** accanto.",
      "**Chiunque può modificarla:** un profilo senza gestore può essere modificato dagli utenti e da Google stessa, e tu non ricevi più notifiche.",
    ] },
    { t: "p", text: "Ecco perché rimuovere il profilo dal proprio account spesso peggiora la situazione: le recensioni negative sono ancora lì, ma la tua versione dei fatti è sparita." },

    { t: "h2", id: "start-over", text: "Posso eliminare la scheda Google e ricominciare da capo?", toc: "Ricominciare con un nuovo profilo" },
    { t: "p", text: "Non semplicemente creandone una nuova. Se la vecchia scheda esiste ancora — e dopo «Rimuovi il profilo dell'attività» esiste — Google vede un **secondo profilo per la stessa attività allo stesso indirizzo**. I duplicati vengono di solito riuniti alla vecchia scheda (recensioni comprese) oppure il nuovo profilo viene sospeso. In entrambi i casi, le vecchie recensioni tornano a perseguitarti." },
    { t: "p", text: "Un vero nuovo inizio funziona in due passaggi: prima il **vecchio profilo viene rimosso completamente**, insieme a tutte le recensioni; poi, se lo desideri, crei e verifichi un **nuovo profilo pulito**. RapidRemove si occupa del primo passaggio — a prezzo fisso, pagabile solo dopo la rimozione — e il tuo sito e il tuo posizionamento nella Ricerca restano intatti." },

    { t: "h2", id: "google-maps", text: "Come cancellare un'attività da Google Maps", toc: "Cancellare da Google Maps" },
    { t: "p", text: "Su Google Maps chiunque — titolare o no — può chiedere a Google di rimuovere un luogo. Questi sono i passaggi ufficiali:" },
    { t: "ol", items: [
      "Accedi al tuo Account Google, vai su Google Maps o apri l'app Google Maps.",
      "Sulla mappa, seleziona l'attività da rimuovere.",
      "Fai clic su **Suggerisci una modifica** → **Questo luogo è chiuso o non si trova in questa posizione**.",
      "Seleziona l'opzione appropriata, ad esempio **«Non si trova qui»** o **«Offensivo, pericoloso o ingannevole»**.",
      "Fai clic su **Invia** — Google esamina la richiesta, a volte ti scrive per email con domande aggiuntive, e decide da sé.",
    ] },
    { t: "p", text: "Google rimuove un'attività soprattutto se non è mai esistita o non è idonea a comparire su Google. Per attività reali ed esistenti, queste segnalazioni vengono di solito respinte o trasformate in un'etichetta «Chiuso definitivamente» — la scheda e le recensioni restano. Più dettagli su schede proprie, di terzi e duplicate: [eliminare una scheda su Google Maps](/it/rivista/eliminare-scheda-google-maps/)." },

    { t: "h2", id: "no-delete-option", text: "Perché non vedi l'opzione per eliminare il profilo", toc: "Nessuna opzione «Rimuovi»?" },
    { t: "p", text: "Se nelle impostazioni manca «Rimuovi il profilo dell'attività», quasi sempre il motivo è uno di questi:" },
    { t: "ul", items: [
      "**Sei un gestore, non il proprietario principale.** Solo i proprietari principali possono rimuovere i contenuti e i gestori del profilo.",
      "**Sei diventato proprietario da poco.** I nuovi proprietari e gestori devono attendere 7 giorni prima che l'opzione sia disponibile.",
      "**Il profilo non è verificato o rivendicato da te.** Allora non appartiene a nessuno — oppure a un altro Account Google.",
      "**Hai effettuato l'accesso con l'account sbagliato.** Molte attività ne hanno più di uno: controlla quale è proprietario del profilo.",
    ] },
    { t: "p", text: "E anche quando trovi il pulsante, ricorda il risultato: rimuove il profilo dal tuo account, non da Google." },

    { t: "h2", id: "how", text: "Come funziona la rimozione completa con RapidRemove", toc: "Come funziona" },
    { t: "p", text: "L'unico modo affidabile per far sparire un profilo e le sue recensioni è la **rimozione completa del profilo dell'attività** tramite le procedure che Google mette a disposizione — non la cancellazione delle recensioni una per una. Quando viene rimosso l'intero profilo, **tutte le recensioni scompaiono con lui**, comprese quelle false. È la differenza tra curare i sintomi ed eliminare la causa." },
    { t: "ol", items: [
      "**Check gratuito:** inserisci il nome dell'attività. Troviamo il tuo profilo e verifichiamo subito se la rimozione è possibile — senza impegno e gratuitamente.",
      "**Conferma e autorizzazione:** confermi il profilo corretto e ci autorizzi a procedere per tuo conto. Nessun accesso a Gmail, Ads o dati personali.",
      "**Rimozione in 24–48 ore:** il nostro team avvia la rimozione del profilo insieme a tutte le recensioni tramite le procedure previste da Google. Il pagamento avviene solo dopo.",
    ] },
    { t: "p", text: "I vantaggi in sintesi:" },
    { t: "ul", items: [
      "**Rapidità:** rimozione del profilo di norma in 24–48 ore invece che in mesi",
      "**Completezza:** l'intero profilo, comprese **tutte** le recensioni, in un colpo solo",
      "**Prevedibilità:** prezzo fisso, pagabile **solo dopo la rimozione** — niente tariffe orarie aperte",
      "**Nessun impatto SEO:** il tuo sito e il tuo posizionamento restano intatti; un nuovo profilo pulito è facoltativo",
      "**Discrezione:** nessun contatto con gli autori delle recensioni, nessun rischio di [effetto Streisand](/it/rivista/eliminare-recensione-negativa-google-avvocato-o-tecnica/)",
    ] },

    { t: "cta", title: "Preferisci verificare subito se il tuo profilo è eliminabile?", text: "Inserisci il nome della tua attività — troviamo il tuo profilo Google reale e verifichiamo in pochi secondi se e con quale rapidità può essere rimosso. Senza impegno e gratuitamente.", btn: "Avvia il check gratuito", href: "/it/?start=1", trust: ["Analisi gratuita", "Pagamento solo dopo la rimozione"] },

    { t: "h2", id: "single-vs-profile", text: "Eliminare le singole recensioni o rimuovere l'intero profilo?", toc: "Singole o intero?" },
    { t: "p", text: "In molti iniziano cercando di [segnalare](/it/rivista/eliminare-recensioni-false-google/) le singole recensioni negative a Google. È un percorso faticoso e dall'esito incerto: Google rigetta spesso le segnalazioni, ogni recensione va motivata singolarmente — e per ogni recensione rimossa ne possono spuntare di nuove. Si combattono i sintomi, non la causa." },
    { t: "p", text: "L'approccio sostenibile agisce alla radice: **rimuovendo l'intero profilo, tutte le recensioni scompaiono in un colpo solo** — comprese quelle false e quelle di ritorsione. Se invece il profilo nel complesso è sano e a darti fastidio sono solo una o poche recensioni, non serve eliminarlo: RapidRemove offre anche la [rimozione di singole recensioni](/it/rimuovere-una-recensione/) — scegli tu le recensioni, paghi solo quelle effettivamente eliminate (99 € per recensione con testo fino a 4 settimane, con ca. 90 % di successo; 250 € per tutte le altre, ad es. più vecchie – ca. 50 % – o con sole stelle). Prezzi, probabilità e procedura nel dettaglio: [servizio di rimozione recensioni Google](/it/rivista/servizio-rimozione-recensioni-google/). Tutti i metodi e i costi a confronto li trovi invece nella guida per [eliminare recensioni Google](/it/rivista/eliminare-recensioni-google/)." },
    { t: "tip", title: "Il vantaggio decisivo", text: "Un profilo rimosso non può più mostrare né le vecchie né le nuove recensioni. Il problema non è rimandato — è risolto." },

    { t: "h2", id: "legal", text: "È legale far rimuovere il profilo?", toc: "È legale?" },
    { t: "p", text: "Sì. Una rimozione professionale passa esclusivamente attraverso le **procedure che Google mette a disposizione**, sempre per conto del titolare. Il tuo Account Google, Gmail e gli eventuali account Google Ads rimangono completamente intatti — così come il tuo sito, il tuo posizionamento organico e le tue campagne." },
    { t: "p", text: "Un fornitore serio si riconosce dal fatto che indica un'azienda reale con indirizzo e partita IVA, spiega in modo trasparente come lavora e **addebita solo dopo la rimozione** — non da vaghe promesse su «accessi segreti a Google»." },

    { t: "h2", id: "cost", text: "Quanto tempo ci vuole — e quanto costa?", toc: "Tempi e costi" },
    { t: "p", text: "Una rimozione professionale è di norma completata **entro 24–48 ore** — invece dei mesi che assorbe la strada dell'avvocato. Sul fronte dei costi: un avvocato fattura a ore (spesso 300 € o più) senza certezza di risultato. RapidRemove lavora con un **prezzo fisso trasparente a partire da 450 €** — e paghi **solo dopo l'eliminazione avvenuta**." },
    { t: "table", rrCol: 3, head: ["Criterio", "Da soli (DIY)", "Avvocato", "RapidRemove"], rows: [
      ["Eliminazione completa possibile?", "Praticamente no", "Incerta", "Sì"],
      ["Tempi", "—", "3–9 mesi", "24–48 ore"],
      ["Costi", "—", "300 €+ / ora", "Prezzo fisso da 450 €"],
      ["Tutte le recensioni rimosse", "No", "Singolarmente, con fatica", "Tutte in una volta"],
      ["Quando paghi", "—", "A ore, anche senza risultato", "Solo dopo la rimozione"],
      ["Impegno richiesto", "Alto", "Alto", "Praticamente zero"],
    ] },
    { t: "p", text: "Il prezzo sembra alto? Fai un calcolo: una singola recensione falsa visibile può ridurre sensibilmente la percentuale di clic e costarti molto di più nel corso dei mesi." },

    { t: "h2", id: "herkunft", text: "Chi ha creato questo profilo, in realtà?", toc: "Chi l'ha creato?" },
    { t: "p", text: "La maggior parte degli imprenditori che ci contattano non ha mai creato il proprio profilo — e si stupisce sinceramente che esista. Non è l'eccezione, è la regola. Un profilo dell'attività su Google viene raramente creato attivamente dal titolare. Molto più spesso lo aggiunge qualcun altro, oppure Google lo genera in modo completamente automatico. Per capire perché poi una scheda del genere è così difficile da eliminare, conviene sapere come è arrivata lì. Le strade, in sostanza, sono tre." },
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
    { t: "p", text: "**Perché è importante:** comunque sia nato il profilo, la conseguenza è la stessa: una volta che esiste, raccoglie recensioni e compare nella Ricerca e su Maps. Non occorre averlo creato né gestirlo per esserne coinvolti — ed è proprio per questo che ignorarlo non basta. Va comunque rimosso attivamente." },

    { t: "h2", id: "fazit", text: "Conclusione: il modo più rapido per un risultato pulito", toc: "Conclusione" },
    { t: "p", text: "Le opzioni che Google offre ai titolari — «Rimuovi il profilo dell'attività», «Chiuso definitivamente», rimuoversi dal profilo — mettono fine alla tua gestione, ma lasciano online la scheda e tutte le recensioni. La strada affidabile è la rimozione completa dell'intero profilo tramite le procedure previste da Google, per conto del titolare: rapida, definitiva, prevedibile — e con pagamento solo dopo la rimozione." },

    { t: "cta", title: "Verifica ora gratuitamente se il tuo profilo è eliminabile", text: "In pochi secondi vedi il tuo profilo reale e scopri se e con quale rapidità possiamo rimuoverlo. Nessun pagamento anticipato, nessun impegno.", btn: "Avvia il check gratuito", href: "/it/?start=1", trust: ["Analisi gratuita", "Pagamento solo dopo la rimozione"] },
  ],
  faq: [
    { q: "Posso eliminare da solo il profilo della mia attività su Google?", a: "Solo in misura limitata. Puoi rimuovere il profilo dal tuo account o contrassegnarlo come «Chiuso definitivamente» — ma in nessuno dei due casi la scheda pubblica sparisce: resta visibile nella Ricerca e su Maps con tutte le recensioni. La rimozione completa passa attraverso le procedure che Google mette a disposizione." },
    { q: "Come si elimina una scheda Google My Business?", a: "Dal profilo dell'attività: Altro → Impostazioni del profilo dell'attività → Rimuovi il profilo dell'attività → Rimuovi i contenuti dei profili e i gestori → Continua → Rimuovi → Fine. Così termina definitivamente la tua gestione e vengono eliminati post, foto e risposte alle recensioni — ma la scheda pubblica e le recensioni di norma restano su Google." },
    { q: "Come eliminare la mia attività da Google definitivamente?", a: "Con gli strumenti per i titolari non è possibile: rimuovono solo il tuo accesso. Per far sparire la scheda dalla Ricerca e da Maps, recensioni incluse, il profilo deve essere rimosso tramite le procedure previste da Google — è ciò che fa RapidRemove per conto del titolare, con pagamento solo dopo la rimozione." },
    { q: "«Chiusa definitivamente» è la stessa cosa di eliminata?", a: "No. Scheda, nome, indirizzo e tutte le recensioni restano pubblici; si aggiunge solo l'etichetta «Chiuso definitivamente». Google stessa scrive che il profilo potrebbe comunque essere visualizzato nella Ricerca e su Maps. Spesso l'effetto è peggiore di prima." },
    { q: "Come chiudere la scheda Google della mia attività?", a: "Vai al profilo dell'attività → Modifica profilo → Orario → accanto a «Orario» seleziona Modifica → Chiuso definitivamente (oppure Chiuso temporaneamente) → Salva. La scheda resta però online con tutte le recensioni: chiudere non significa eliminare." },
    { q: "Cosa succede se elimino il profilo dell'attività su Google?", a: "Perdi l'accesso e vengono eliminati i tuoi post, foto, video e risposte alle recensioni. La scheda, le recensioni e i dati di norma restano visibili nella Ricerca Google e su Maps — e chiunque può ora suggerire modifiche." },
    { q: "Posso eliminare il profilo e crearne uno nuovo?", a: "Solo se il vecchio profilo viene prima rimosso completamente. Un nuovo profilo per la stessa attività allo stesso indirizzo viene trattato come duplicato e di solito riunito a quello vecchio — recensioni comprese — oppure sospeso." },
    { q: "Come cancellare un'attività da Google Maps?", a: "Su Google Maps seleziona l'attività → Suggerisci una modifica → «Questo luogo è chiuso o non si trova in questa posizione» → scegli il motivo (ad es. «Non si trova qui») → Invia. Google decide da sé e, per attività reali, di solito mantiene la scheda o la segna solo come chiusa." },
    { q: "Posso far eliminare una scheda Google creata da qualcun altro?", a: "Puoi chiederne la rimozione anche senza esserne proprietario, tramite «Suggerisci una modifica» su Google Maps. Google rimuove però soprattutto attività mai esistite o non idonee. Se la scheda riguarda la tua attività, la strada più diretta è la rimozione completa tramite le procedure previste da Google, per conto del titolare." },
    { q: "Perché non vedo l'opzione per rimuovere il profilo?", a: "Di solito perché sei un gestore e non il proprietario principale, perché sei diventato proprietario o gestore da meno di 7 giorni, perché il profilo non è verificato con il tuo account oppure perché hai effettuato l'accesso con un altro Account Google." },
    { q: "Google My Business e Profilo dell'attività su Google sono la stessa cosa?", a: "Sì. Google My Business è il vecchio nome del Profilo dell'attività su Google. Scheda Google, pagina, account aziendale o profilo indicano tutti la stessa voce." },
    { q: "Vengono rimosse anche tutte le recensioni?", a: "Sì. Quando viene rimosso l'intero profilo dell'attività, tutte le recensioni collegate scompaiono in un colpo solo — comprese quelle false e quelle di ritorsione." },
    { q: "Quanto tempo richiede la rimozione?", a: "Di norma il profilo viene rimosso entro 24–48 ore. Puoi seguire lo stato in qualsiasi momento nel portale clienti." },
    { q: "La rimozione influisce sulla SEO, sul mio sito o su Google Ads?", a: "No. Viene rimosso esclusivamente il profilo dell'attività (Google Maps / Profilo dell'attività su Google). Il tuo sito, il tuo posizionamento, il tuo Account Google e le tue campagne rimangono invariati." },
    { q: "Quanto costa far eliminare un profilo dell'attività su Google?", a: "Con RapidRemove si applica un prezzo fisso trasparente a partire da 450 € — e paghi solo dopo l'eliminazione avvenuta (No Cure, No Pay). Se ti servono solo singole recensioni rimosse: 99 € per recensione con testo fino a 4 settimane, 250 € per tutte le altre, solo per quelle effettivamente eliminate." },
    { q: "È legale far rimuovere un profilo dell'attività su Google?", a: "Sì. La rimozione avviene tramite le procedure che Google mette a disposizione, per conto del titolare. Il tuo Account Google, Gmail e gli eventuali account Ads rimangono completamente intatti." },
    { q: "Il profilo potrebbe ricomparire in seguito?", a: "Terze parti potrebbero in teoria creare un nuovo profilo. Con la protezione opzionale monitoriamo la tua scheda e rimuoviamo gratuitamente un profilo che dovesse ricomparire durante il periodo di protezione." },
  ],
};
export default article;
