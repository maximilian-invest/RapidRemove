/* NL — einzelbewertung-loeschen-service (artikel zonder Duits origineel:
   het product voor losse reviews bestaat niet in DACH). Doel: bestelling
   van losse reviewverwijderingen via de wizard (?start=reviews). */
const article = {
    category: "Reputatie",
    meta: {
      slug: "google-review-verwijderen-service",
      title: "Google review verwijderen: prijzen, slagingskans en zo bestelt u (2026)",
      h1: "Eén Google review laten verwijderen: prijzen, kansen en hoe het bestellen werkt",
      description: "Wat kost het om een Google review te laten verwijderen? € 179 per verwijderde review (€ 229 na 4 weken), alleen bij succes. Kansen, korting en bestellen.",
      keywords: ["wat kost google review verwijderen", "google review verwijderen kosten", "google review verwijderen prijs", "betalen om google review te laten verwijderen", "google review verwijderen bestellen", "slagingskans google review verwijderen"],
      author: "Maximilian Hölzl",
      authorRole: "Google-expert en oprichter",
      date: "2026-10-03",
    },
    dek: "Met uw profiel is niets mis – het is **die ene review** die pijn doet: een nepreview, een belediging, iemand die nooit klant was. Daarvoor hoeft u niet uw hele profiel te laten verwijderen, en ook niet maanden op een advocaat te wachten. Bij RapidRemove kiest u zelf welke reviews weg moeten, ziet u direct de prijs en **betaalt u alleen voor reviews die echt verwijderd zijn**. Het aanbod zelf vindt u kort samengevat op onze pagina [Google review laten verwijderen](/nl/review-laten-verwijderen/); deze gids gaat de details in: wat het kost, hoe groot de kansen zijn en hoe het bestellen stap voor stap werkt.",
    blocks: [
      { t: "h2", id: "wann", text: "Wanneer het verwijderen van één review de juiste keuze is", toc: "Wanneer zinvol" },
      { t: "p", text: "De meeste bedrijven hebben geen profielprobleem – ze hebben een **reviewprobleem**. Een nette 4,6 zakt door twee 1-sterren-aanvallen naar 4,3, en ineens klikken geïnteresseerden op de concurrent. Het hele profiel verwijderen zou dan overdreven zijn: u raakt ook al uw goede reviews kwijt." },
      { t: "ul", items: [
        "**Losse reviews verwijderen** past wanneer uw profiel in de basis gezond is en één of enkele reviews oneerlijk, nep of beledigend zijn.",
        "**[Het hele profiel verwijderen](/nl/magazine/google-bedrijfsprofiel-verwijderen/)** past wanneer het profiel over de hele linie beschadigd is en u echt opnieuw wilt beginnen.",
        "**Openbaar reageren** past bij eerlijke kritiek van echte klanten – dat is feedback, geen verwijderzaak ([wanneer negeren, reageren of verwijderen](/nl/magazine/negatieve-review-negeren-reageren-verwijderen/)).",
      ] },

      { t: "h2", id: "was", text: "Welke reviews verwijderd kunnen worden – en welke niet", toc: "Wat is verwijderbaar?" },
      { t: "p", text: "Dat zeggen we u eerlijk, voordat u iets betaalt. **Goede kansen** zijn er bij reviews die de [reviewrichtlijnen van Google](/nl/magazine/google-review-richtlijnen-schendingen/) of de wet schenden:" },
      { t: "ul", items: [
        "**Nepreviews** en aanvallen van concurrenten ([zo herkent u valse reviews](/nl/magazine/valse-google-reviews-verwijderen/))",
        "Reviews van mensen die **nooit klant** waren",
        "**Beledigingen**, persoonlijke aanvallen en **onware feitelijke beweringen**",
        "Inhoud die nergens over gaat, spam of reviews die voor **een ander bedrijf** bedoeld waren",
        "**Beoordelingen met alleen sterren, zonder tekst** – via een uitgebreidere procedure (€ 300 per verwijderde review; [achtergrond](/nl/magazine/1-ster-review-zonder-tekst-verwijderen/))",
      ] },
      { t: "warn", title: "Wat we niet beloven", text: "Eerlijke, zakelijke kritiek van echte klanten is meestal beschermd – en niemand kan serieus garanderen dat elke review verdwijnt. Juist daarom **betaalt u alleen als een review echt weg is** – ook bij beoordelingen met alleen sterren, zonder tekst." },

      { t: "h2", id: "preis", text: "Wat kost het om een Google review te laten verwijderen?", toc: "Prijs" },
      { t: "p", text: "De prijs hangt vooral af van één ding: **hoe oud de review is**. Verse reviews zijn veel makkelijker te verwijderen dan reviews die al maanden online staan. Hoe deze prijzen zich verhouden tot een advocaat en andere aanbieders, leest u in [de kosten van een Google review verwijderen](/nl/magazine/kosten-google-review-verwijderen/). Complexe gevallen kosten **€ 300**: beoordelingen zonder tekst, en reviews uit de VS die ouder zijn dan 4 weken ($ 300), omdat ze een uitgebreidere procedure vereisen. In enkele gevallen kan een oudere review die na de standaardprocedure nog online staat, een complex geval worden – we gaan alleen verder met uw toestemming." },
      { t: "table", rrCol: 2, head: ["Leeftijd van de review", "Slagingskans", "Prijs per verwijderde review"], rows: [
        ["Tot 4 weken oud", "ca. 90 %", "**€ 179**"],
        ["Ouder dan 4 weken", "ca. 50 %", "**€ 229**"],
      ] },
      { t: "p", text: "Moeten er meerdere reviews weg, dan geldt automatisch de **staffelkorting**:" },
      { t: "table", head: ["Aantal reviews", "Korting"], rows: [
        ["1 – 2", "–"],
        ["3 – 4", "**−10 %**"],
        ["5 – 9", "**−15 %**"],
        ["10 of meer", "**−30 %**"],
      ] },
      { t: "p", text: "**Rekenvoorbeelden:** 3 recente reviews kosten € 537, min 10 % = **€ 483**. 2 recente en 3 oudere reviews kosten € 1.045, min 15 % = **€ 888**. De kortingstrap hangt af van het aantal reviews **dat wij na de gratis beoordeling accepteren**, en geldt voor elke review daarvan die verwijderd wordt. U betaalt nog steeds alleen voor reviews die echt weg zijn: accepteren we er 3 en verdwijnen er 2, dan betaalt u 2 × € 179 min 10 % = **€ 322,20**." },
      { t: "p", text: "**Beoordelingen met alleen sterren, zonder tekst:** dat zijn **complexe gevallen**, die een uitgebreidere procedure vereisen. Prijs: **€ 300 per verwijderde review**, zonder toeslag voor oudere reviews. Zoals bij alle reviews legt u bij het bestellen een kaart of PayPal vast; er wordt pas automatisch afgeschreven nadat de review verwijderd is. De staffelkorting geldt ook hier en telt mee met alle geaccepteerde reviews van de bestelling. Voorbeeld: 2 beoordelingen met alleen sterren + 1 recente review met tekst = 3 geaccepteerde reviews, −10 %: na de verwijdering wordt automatisch € 270 afgeschreven per beoordeling met alleen sterren (€ 300 − 10 %) en € 161,10 (€ 179 − 10 %) voor de review met tekst – telkens alleen voor wat echt verwijderd is." },
      { t: "p", text: "**Betalen per review:** de doorlooptijd kan per review verschillen – meestal 1–2 weken, soms sneller, in enkele gevallen iets langer. Daarom wordt er per review afgeschreven, automatisch nadat die review verwijderd is. Reviews waar we nog mee bezig zijn, kosten u op dat moment nog niets." },
      { t: "tip", title: "Wacht niet te lang", text: "De slagingskans daalt van zo'n 90 % naar zo'n 50 % zodra een review ouder is dan vier weken – en de prijs stijgt naar € 229. Een verse nepreview is dus het goedkoopst en het zekerst te verwijderen. Ter vergelijking: advocaten rekenen meestal per review **vooraf** af, en het duurt vaak maanden ([advocaat of technische verwijdering?](/nl/magazine/negatieve-google-review-verwijderen-advocaat/))." },

      { t: "h2", id: "bestellen", text: "Zo bestelt u – in ongeveer twee minuten", toc: "Bestellen" },
      { t: "ol", items: [
        "**Zoek uw bedrijf** – voer uw bedrijfsnaam in en kies uw Google-profiel.",
        "Kies **„Losse reviews verwijderen”** – wij laden automatisch uw nieuwste Google-reviews.",
        "**Filter** op 1–3 sterren (of toon alle) en **vink aan** welke reviews weg moeten. Bij elke review ziet u de leeftijd en de slagingskans; beoordelingen met alleen sterren en geen tekst kunt u ook selecteren – ze krijgen een eigen prijsregel (€ 300 per verwijderde review).",
        "De **prijsbalk** toont steeds uw totaalbedrag – inclusief de volgende kortingstrap („Nog één voor 10 % korting!”).",
        "Controleer het overzicht en **plaats uw bestelling**. U legt een kaart of PayPal vast, maar er wordt niets vooraf afgeschreven – pas automatisch nadat een review verwijderd is.",
        "Wij gaan aan de slag en houden u op de hoogte. **U betaalt alleen voor reviews die echt verwijderd zijn.**",
      ] },
      { t: "p", text: "Staat een review niet in de lijst? Dan kunt u in dezelfde stap ook de link naar de review handmatig plakken." },
      { t: "cta", title: "Selecteer de reviews die weg moeten", text: "Zoek uw bedrijf, vink de reviews aan – en zie direct de exacte prijs. **Reviews met tekst vanaf € 179 per verwijderde review**, niets vooraf.", btn: "Reviews selecteren", href: "/nl/profiel-checken/?start=reviews", trust: ["Niets vooraf", "Betalen per verwijderde review", "Eerst een eerlijke inschatting"] },

      { t: "h2", id: "dauer", text: "Hoe lang duurt het?", toc: "Duur" },
      { t: "p", text: "Meestal **1–2 weken**, soms sneller, in enkele gevallen iets langer – afhankelijk van de review en de reden voor verwijdering. U hoeft in de tussentijd niets te doen; wij houden u op de hoogte. Wat er intussen aan de kant van Google gebeurt – de status van de melding, de tool voor reviewbeheer en bezwaar maken – leest u in [hoe lang het duurt voordat Google een review verwijdert](/nl/magazine/hoe-lang-duurt-google-review-verwijderen/)." },

      { t: "h2", id: "vergleich", text: "Losse reviews, heel profiel, advocaat of zelf melden – vergeleken", toc: "Vergelijking" },
      { t: "table", rrCol: 1, head: ["Criterium", "Losse reviews verwijderen", "Profielverwijdering", "Advocaat", "Zelf melden"], rows: [
        ["Wat wordt verwijderd", "Geselecteerde reviews (ook alleen sterren)", "Heel profiel + alle reviews", "Losse review", "Losse review"],
        ["Goede reviews blijven", "Ja", "Nee", "Ja", "Ja"],
        ["Duur", "Meestal 1–2 weken", "Meestal 24 – 48 uur", "3 – 9 maanden", "Onzeker"],
        ["Kosten", "Vanaf € 179, alleen bij succes (alleen sterren: € 300)", "Vaste prijs, na succes", "Per review, vooraf", "Gratis"],
        ["Inspanning voor u", "2 minuten", "Minimaal", "Hoog", "Gemiddeld"],
      ] },
      { t: "p", text: "Wilt u eerst de gratis weg begrijpen? Lees dan [hoe u een Google review zelf meldt](/nl/magazine/google-review-verwijderen-hoe/) – en waarom Google meldingen vaak met een standaardantwoord afwijst. En twijfelt u of ingrijpen überhaupt loont: [wat een slechte Google review echt kost](/nl/magazine/wat-kost-slechte-google-review/)." },

      { t: "h2", id: "warum", text: "Waarom RapidRemove", toc: "Waarom wij" },
      { t: "ul", items: [
        "**Gespecialiseerd sinds 2021:** ons team verwijdert al jaren dagelijks Google-profielen – en nu ook losse reviews.",
        "**Geen risico:** niets vooraf – u betaalt per verwijderde review, niet voor pogingen.",
        "**Discreet:** de schrijver krijgt niet te horen wie om verwijdering heeft gevraagd.",
        "**Eerlijke inschatting:** zien we weinig kans voor een review, dan zeggen we dat voordat u bestelt.",
        "**Een echt bedrijf:** Simple Solution OG uit Hallein (Salzburg, Oostenrijk), in samenwerking met partners en advocatenkantoren.",
      ] },
    ],
    faq: [
      { q: "Wat kost het om een Google review te laten verwijderen?", a: "€ 179 per verwijderde review als de review tot 4 weken oud is, € 229 als hij ouder is. Vanaf 3 geaccepteerde reviews krijgt u 10 % korting, vanaf 5 15 % en vanaf 10 30 %, toegepast op elke review die verwijderd wordt. U betaalt alleen voor reviews die echt verwijderd zijn. Beoordelingen met alleen sterren, zonder tekst: € 300 per verwijderde review." },
      { q: "Wat gebeurt er als een review niet verwijderd kan worden?", a: "Dan betaalt u daar niets voor – geen vooruitbetaling en geen vergoeding voor pogingen, ook niet bij beoordelingen met alleen sterren." },
      { q: "Kunnen reviews ouder dan 4 weken verwijderd worden?", a: "Ja. De slagingskans is lager (ca. 50 % in plaats van ca. 90 %) en de prijs is € 229 per review. Daarom loont het om snel te handelen bij verse nepreviews." },
      { q: "Kunnen 1-sterreviews zonder tekst verwijderd worden?", a: "Ja, als complex geval met een uitgebreidere procedure. U kunt ze in het bestelformulier selecteren (met een eigen prijsregel): **€ 300 per verwijderde review**, zonder toeslag voor oudere reviews. Zoals bij alle reviews legt u bij het bestellen een kaart of PayPal vast; er wordt pas automatisch afgeschreven nadat de review verwijderd is. De staffelkorting geldt ook hier, samen met uw andere geaccepteerde reviews." },
      { q: "Komt de schrijver te weten dat ik het was?", a: "Nee. De schrijver krijgt niet te horen wie om verwijdering heeft gevraagd." },
      { q: "Moet ik mijn hele profiel verwijderen?", a: "Nee. Bij het verwijderen van losse reviews blijven uw profiel en al uw goede reviews staan. Het [hele profiel verwijderen](/nl/magazine/google-bedrijfsprofiel-verwijderen/) is alleen zinvol als het over de hele linie beschadigd is." },
      { q: "Hoeveel reviews kan ik tegelijk bestellen?", a: "Zoveel u wilt. De staffelkorting stijgt bij 3, 5 en 10 reviews die we na de gratis beoordeling accepteren, en wordt automatisch toegepast." },
    ],
    related: [
      { label: "Google review laten verwijderen", url: "/nl/review-laten-verwijderen/" },
      { label: "Google reviews verwijderen: kosten en methoden", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
      { label: "Valse Google reviews herkennen, melden en verwijderen", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
      { label: "Een 1-sterreview zonder tekst verwijderen", url: "https://www.rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
      { label: "Advocaat of technische verwijdering?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    ],
};
export default article;
