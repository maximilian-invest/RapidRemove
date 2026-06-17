/* NL — negative-bewertung-ignorieren-antworten-loeschen (Negeren, reageren of verwijderen) */
const article = {
  category: "Reputatie",
  meta: {
    slug: "negatieve-review-negeren-reageren-verwijderen",
    title: "Negatieve review: negeren, reageren of verwijderen?",
    h1: "Negatieve Google-review: negeren, reageren of verwijderen?",
    description:
      "Bij een negatieve Google-review: negeren, reageren of laten verwijderen? Een heldere besliswijzer per type review – met de volgende stappen.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google-expert",
    date: "2026-06-09",
  },
  dek: "De juiste reactie hangt af van **één** vraag: is de review terecht of niet? Echte, zakelijke kritiek beantwoordt u zelfverzekerd. Onterechte, nep- of onrechtmatige reviews laat u verwijderen. En sommige reviews negeert u bewust. Deze gids ordent de drie wegen duidelijk – zodat u niet vanuit uw buikgevoel reageert.",
  blocks: [
    { t: "h2", id: "kurz", text: "Het belangrijkste in een oogopslag", toc: "In het kort" },
    { t: "ul", items: [
      "**Negeren:** bij onschuldige, incidentele kritiek die opgaat in een goed totaalgemiddelde.",
      "**Reageren:** bij echte, zakelijke kritiek – het antwoord is voor de *andere lezers*, niet voor de schrijver.",
      "**Laten verwijderen:** bij nep-reviews, beledigingen, onjuiste feiten of geen reëel zakelijk contact – hier bestaat vaak een aanspraak.",
      "**Nooit:** in de emotie twisten, dreigen of klanten publiekelijk in een kwaad daglicht stellen – dat veroorzaakt het Streisand-effect.",
    ] },

    { t: "h2", id: "grundfrage", text: "De kernvraag: terecht of niet?", toc: "Terecht?" },
    { t: "p", text: "Voordat u reageert, verduidelijkt u één ding: beschrijft de review een **echte ervaring** – of niet? Op die lijn beslist alles. Een eerlijke, ook harde mening over een reëel bezoek valt onder de vrijheid van meningsuiting en is nauwelijks te verwijderen. Een review zonder reële achtergrond (nep, concurrent, verwisseling, pure smaad) is daarentegen vaak aanvechtbaar." },

    { t: "h2", id: "ignorieren", text: "Weg 1: negeren – wanneer niets doen juist is", toc: "1 · Negeren" },
    { t: "p", text: "Niet elke kritische stem heeft een reactie nodig. Hebt u een solide gemiddelde boven 4,0 en staat er een enkel, zakelijk 3- of 4-sterren-review tussen, dan doet het nauwelijks schade – het maakt het totaalbeeld zelfs geloofwaardiger. Wie op *elke* kleinigheid reageert, wekt al snel de indruk overgevoelig te zijn." },
    { t: "p", text: "**Negeren is juist wanneer:** de review incidenteel, zakelijk en onopvallend is in een goed gemiddelde." },

    { t: "h2", id: "antworten", text: "Weg 2: reageren – zelfverzekerd, voor de medelezers", toc: "2 · Reageren" },
    { t: "p", text: "Een echte, kritische review is een podium – niet voor een strijd met de schrijver, maar om **andere lezers** te laten zien hoe u omgaat met kritiek. Een goed antwoord is beknopt, vriendelijk, oplossingsgericht en zonder defensiviteit." },
    { t: "p", text: "Vuistregels: tijdig reageren, de schrijver bedanken voor de feedback, het probleem serieus nemen, een oplossing of een gesprek aanbieden – en nooit klantgegevens of interne zaken openbaar maken. Wat u hier absoluut moet vermijden, is het **Streisand-effect**: wie agressief of dreigend reageert, lokt vaak een golf van nieuwe negatieve reviews uit. De term verwijst naar het bekende fenomeen waarbij een poging iets te verbergen of te onderdrukken juist meer aandacht trekt." },
    { t: "p", text: "**Reageren is juist wanneer:** de kritiek echt en zakelijk is en een zelfverzekerde reactie het beeld verbetert." },

    { t: "h2", id: "loeschen", text: "Weg 3: laten verwijderen – wanneer er een aanspraak bestaat", toc: "3 · Verwijderen" },
    { t: "p", text: "Bij **onterechte** reviews is verwijdering de betere weg. Goede kansen bestaan onder meer bij:" },
    { t: "ul", items: [
      "**Nep-reviews** zonder reëel zakelijk contact (bijv. van concurrenten),",
      "**Beledigingen, smaad, onjuiste feitelijke beweringen,**",
      "**1-ster reviews zonder tekst** zonder herkenbare aanleiding,",
      "**Irrelevante of verward geplaatste** beoordelingen.",
    ] },
    { t: "p", text: "Dat het aankomt op een **daadwerkelijk zakelijk contact** is vaste rechtspraak – het Landgericht Lübeck (Az. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) en het BGH (Az. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) hebben dat bevestigd als Duits/EU-rechtspraak die ook de standaard vormt in het bredere Europese kader. Daarnaast biedt de **AVG (GDPR) Art. 17** – het „recht om vergeten te worden“ – in bepaalde gevallen een extra grondslag voor verwijdering van persoonsgebonden content." },
    { t: "p", text: "Voor de uitvoering zijn er twee wegen die we in detail vergelijken: het **melden/de juridische weg** voor de afzonderlijke review en de **technische profielverwijdering** wanneer het profiel als geheel beschadigd is. De directe vergelijking vindt u onder [Advocaat of technische verwijdering?](/nl/magazine/negatieve-google-review-verwijderen-advocaat/), methoden en kosten onder [Google reviews verwijderen](/nl/magazine/google-reviews-verwijderen/)." },
    { t: "p", text: "**Laten verwijderen is juist wanneer:** de review onterecht, nep of onrechtmatig is – of het profiel als geheel niet meer te redden is." },

    { t: "h2", id: "schnell", text: "Snelbeslisser", toc: "Beslisser" },
    { t: "table", head: ["Situatie", "Aanbeveling"], rows: [
      ["Incidentele, zakelijke kritiek, goed gemiddelde", "Negeren"],
      ["Echte negatieve ervaring, oplosbaar", "Reageren"],
      ["Nep / concurrent / geen reëel contact", "Laten verwijderen"],
      ["Belediging, onjuiste feiten, smaad", "Laten verwijderen"],
      ["Meerdere/veel negatieve reviews, gemiddelde in het dal", "Profielverwijdering overwegen"],
    ] },

    { t: "cta", title: "Twijfelt u of uw review verwijderd kan worden?", text: "Voer uw bedrijfsnaam in – wij controleren binnen seconden gratis of en hoe snel de review of het profiel verwijderd kan worden.", btn: "Gratis check starten", href: "https://www.rapid-remove.com/", trust: ["Gratis analyse", "Inclusief garantie", "Zonder risico"] },

    { t: "p", text: "Dit artikel biedt praktische oriëntatie en is geen juridisch advies." },
  ],
  faq: [
    { q: "Moet ik op elke negatieve review reageren?", a: "Nee. Op echte, zakelijke kritiek loont een zelfverzekerd antwoord (voor de medelezers). Onschuldige enkelvoudige stemmen in een goed gemiddelde kunt u negeren; onterechte of onrechtmatige laat u beter verwijderen." },
    { q: "Wanneer laat een Google-review zich verwijderen?", a: "Wanneer die in strijd is met Googles beleid of onrechtmatig is – zoals nep-reviews, beledigingen, onjuiste feiten of geen zakelijk contact. Puur zakelijke meningen over echte ervaringen zijn daarentegen nauwelijks te verwijderen." },
    { q: "Wat is het Streisand-effect?", a: "Wanneer een agressieve reactie of juridische dreiging de schrijver provoceert en aanleiding geeft tot meer negatieve reviews. Daarom reageert u nooit in de emotie – en kiest u bij verwijdering voor discrete, technische wegen." },
    { q: "Wat als er al veel slechte reviews staan?", a: "Dan is de strijd om elke afzonderlijke review vaak kansloos. Zinvoller kan de volledige profielverwijdering zijn met aansluitend een schone doorstart." },
  ],
  related: [
    { label: "Wat kost een slechte Google-review werkelijk?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Advocaat of technische verwijdering?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Google reviews verwijderen: kosten & methoden", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
