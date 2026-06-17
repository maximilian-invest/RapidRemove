/* IT — negative-bewertung-ignorieren-antworten-loeschen (Ignorare, rispondere o eliminare) */
const article = {
  category: "Reputazione",
  meta: {
    slug: "recensione-negativa-ignorare-rispondere-eliminare",
    title: "Recensione negativa: ignorare, rispondere o eliminare?",
    h1: "Recensione negativa su Google: ignorare, rispondere o eliminare?",
    description:
      "Di fronte a una recensione negativa su Google: ignorare, rispondere o richiedere la rimozione? Una guida decisionale chiara per tipo di recensione – con i passi successivi.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Esperto Google",
    date: "2026-06-09",
  },
  dek: "La reazione giusta dipende da **una** domanda: la recensione è fondata oppure no? Le critiche reali e circostanziate vanno gestite con compostezza. Le recensioni infondate, false o illegali vanno fatte rimuovere. E alcune recensioni si ignorano deliberatamente. Questa guida assegna chiaramente le tre strade – così da non reagire d'impulso.",
  blocks: [
    { t: "h2", id: "kurz", text: "L'essenziale in breve", toc: "In breve" },
    { t: "ul", items: [
      "**Ignorare:** per critiche isolate e innocue che si perdono in una buona media complessiva.",
      "**Rispondere:** per critiche reali e circostanziate – la risposta è per gli *altri lettori*, non per chi ha scritto.",
      "**Richiedere la rimozione:** per false, offensive, basate su fatti errati o senza contatto commerciale reale – qui spesso esiste un diritto.",
      "**Mai:** rispondere di petto, minacciare o mettere pubblicamente alla berlina i clienti – questo scatena l'effetto Streisand.",
    ] },

    { t: "h2", id: "grundfrage", text: "La domanda di fondo: fondata o no?", toc: "Fondata?" },
    { t: "p", text: "Prima di reagire, chiarite una cosa: la recensione descrive una **esperienza reale** – oppure no? Tutto si decide lungo questa linea. Un'opinione onesta, anche aspra, su una visita reale è tutelata dalla libertà di espressione ed è quasi impossibile da eliminare. Una recensione senza un fondamento reale (falsa, di un concorrente, per confusione, pura denigrazione) è invece spesso contestabile." },

    { t: "h2", id: "ignorieren", text: "Strada 1: ignorare – quando non fare nulla è la scelta giusta", toc: "1 · Ignorare" },
    { t: "p", text: "Non ogni voce critica ha bisogno di una risposta. Se avete una buona media sopra 4,0 e in mezzo c'è una singola recensione circostanziata con 3 o 4 stelle, fa poco danno – anzi rende il quadro complessivo più credibile. Chi reagisce a *ogni* minuzia finisce per sembrare suscettibile." },
    { t: "p", text: "**Ignorare è la scelta giusta quando:** la recensione è isolata, circostanziata e passa inosservata in una buona media complessiva." },

    { t: "h2", id: "antworten", text: "Strada 2: rispondere – con compostezza, per chi legge", toc: "2 · Rispondere" },
    { t: "p", text: "Una recensione reale e critica è una vetrina – non per litigare con chi l'ha scritta, ma per mostrare **agli altri lettori** come gestite le critiche. Una buona risposta è concisa, cordiale, orientata alla soluzione e priva di toni difensivi." },
    { t: "p", text: "Regole pratiche: rispondere in tempi ragionevoli, ringraziare per il feedback, prendere sul serio la questione, offrire una soluzione o un colloquio – e non rendere mai pubblici dati dei clienti o informazioni interne. Quello che dovete assolutamente evitare qui è l'**effetto Streisand**: chi replica in modo aggressivo o minaccia provoca spesso un'ondata di ulteriori recensioni negative." },
    { t: "p", text: "**Rispondere è la scelta giusta quando:** la critica è reale e circostanziata e una reazione composta migliora l'immagine complessiva." },

    { t: "h2", id: "loeschen", text: "Strada 3: richiedere la rimozione – quando esiste un diritto", toc: "3 · Rimuovere" },
    { t: "p", text: "Per le recensioni **infondate**, la rimozione è la strada migliore. Le possibilità sono buone in particolare quando:" },
    { t: "ul", items: [
      "si tratta di **recensioni false** senza un contatto commerciale reale (es. di concorrenti),",
      "contengono **insulti, denigrazioni, affermazioni di fatto errate**,",
      "sono **recensioni con 1 stella senza testo** senza un collegamento riconoscibile,",
      "riguardano **argomenti estranei o casi di omonimia**.",
    ] },
    { t: "p", text: "Il fatto che ci debba essere un **contatto commerciale effettivo** è giurisprudenza consolidata – il Landgericht Lübeck (Az. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) e il BGH (Az. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) lo hanno confermato nell'ambito della giurisprudenza tedesca/EU. In ambito europeo vige il medesimo principio ai sensi del GDPR e della tutela della personalità." },
    { t: "p", text: "Per l'attuazione esistono due strade, che confrontiamo in dettaglio: la **segnalazione/il percorso legale** per la singola recensione e la **cancellazione tecnica del profilo**, quando il profilo è complessivamente compromesso. Il confronto diretto lo trovate in [Avvocato o rimozione tecnica?](/it/rivista/eliminare-recensione-negativa-google-avvocato-o-tecnica/), i metodi e i costi in [Eliminare le recensioni Google](/it/rivista/eliminare-recensioni-google/)." },
    { t: "p", text: "**Richiedere la rimozione è la scelta giusta quando:** la recensione è infondata, falsa o illegale – oppure il profilo nel suo insieme non è più recuperabile." },

    { t: "h2", id: "schnell", text: "Decisione rapida", toc: "Decisione" },
    { t: "table", head: ["Situazione", "Raccomandazione"], rows: [
      ["Critica isolata e circostanziata, buona media", "Ignorare"],
      ["Esperienza negativa reale, risolvibile", "Rispondere"],
      ["Falsa / concorrente / nessun contatto reale", "Richiedere la rimozione"],
      ["Insulto, fatti errati, denigrazione", "Richiedere la rimozione"],
      ["Molte recensioni negative, media a picco", "Valutare la cancellazione del profilo"],
    ] },

    { t: "cta", title: "Non sai se la tua recensione può essere rimossa?", text: "Inserisci il nome dell'attività – verifichiamo gratuitamente in pochi secondi se e con quale rapidità è possibile rimuovere la recensione o il profilo.", btn: "Inizia l'analisi gratuita", href: "https://www.rapid-remove.com/", trust: ["Analisi gratuita", "Con garanzia", "Senza rischi"] },

    { t: "p", text: "Questo articolo è un orientamento pratico e non costituisce consulenza legale." },
  ],
  faq: [
    { q: "Devo rispondere a ogni recensione negativa?", a: "No. A critiche reali e circostanziate vale la pena rispondere con compostezza (per chi legge). Le voci isolate e innocue in una buona media si possono ignorare; quelle infondate o illegali è meglio farle rimuovere." },
    { q: "Quando si può eliminare una recensione Google?", a: "Quando viola le linee guida di Google o è illegale – ad esempio recensioni false, insulti, affermazioni di fatto errate o assenza di contatto commerciale. Le semplici opinioni circostanziate su esperienze reali sono invece quasi impossibili da eliminare." },
    { q: "Cos'è l'effetto Streisand?", a: "Quando una reazione aggressiva o una minaccia legale provoca chi ha scritto la recensione e scatena ulteriori recensioni negative. Per questo non si risponde mai d'impulso – e per la rimozione si scelgono vie discrete e tecniche." },
    { q: "E se ci sono già molte recensioni negative?", a: "In quel caso combattere ogni singola recensione è spesso senza sbocco. Più sensata può essere la cancellazione completa del profilo con successivo nuovo inizio pulito." },
  ],
  related: [
    { label: "Quanto costa davvero una recensione negativa su Google?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Avvocato o rimozione tecnica?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Eliminare le recensioni Google: costi e metodi", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
