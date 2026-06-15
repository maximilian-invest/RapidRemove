/* NL hub: "Google-bedrijfsprofiel verwijderen" (lead article, MagArticle format) */
const article = {
  meta: {
    slug: "google-bedrijfsprofiel-verwijderen",
    title: "Google-bedrijfsprofiel verwijderen: handleiding (zo doet u het)",
    h1: "Google-bedrijfsprofiel verwijderen – hoe werkt dat écht?",
    description: "Google laat u uw bedrijfsprofiel niet zomaar verwijderen. Deze handleiding legt uit waarom „permanent gesloten” geen verwijdering is – en hoe het wél werkt.",
    author: "Maximilian Hölzl",
    authorRole: "Google-expert en oprichter",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Google-beleid",
  iconKey: "trash",
  readingMin: 11,
  dek: "Google laat u uw bedrijfsprofiel niet zomaar verwijderen. Deze handleiding legt uit waarom „permanent gesloten” geen verwijdering is – en hoe het wél werkt.",
  blocks: [
    { t: "h2", id: "kurz", text: "In het kort", toc: "In het kort" },
    { t: "ul", items: [
      "**Zelf verwijderen lukt nauwelijks:** Google biedt geen echte knop „profiel verwijderen” – alleen de status „permanent gesloten”.",
      "**„Gesloten” ≠ verwijderd:** de vermelding, naam, adres en **alle reviews blijven openbaar zichtbaar.**",
      "**De enige betrouwbare weg** is de volledige verwijdering van het profiel via de officiële procedures – legaal en definitief.",
      "**RapidRemove** verwijdert het profiel inclusief alle reviews doorgaans binnen **24–48 uur** – **betaling pas na succes**.",
    ] },
    { t: "p", text: "U googelt uw bedrijf – en ziet een profiel dat u zo niet langer wilt: vol met oude nep- of wraakreviews, met onjuiste gegevens, of simpelweg een vermelding waaruit u voorgoed wilt verdwijnen. De logische vraag: **Hoe kan ik mijn Google-bedrijfsprofiel verwijderen?** Het eerlijke antwoord is helaas ingewikkelder dan Google u wil doen geloven. Deze gids laat u zien wat écht werkt – stap voor stap, zonder marketingpraat." },

    { t: "h2", id: "herkunft", text: "Wie heeft dit profiel eigenlijk aangemaakt?", toc: "Wie maakte het aan?" },
    { t: "p", text: "De meeste ondernemers die ons benaderen, hebben hun profiel nooit zelf aangemaakt — en zijn oprecht verbaasd dat het bestaat. Dat is niet de uitzondering, maar de regel. Een Google-bedrijfsprofiel wordt zelden actief door de eigenaar opgezet. Veel vaker voegt iemand anders het toe, of genereert Google het volledig automatisch. Om te begrijpen waarom zo'n vermelding later zo lastig weg te krijgen is, helpt het eerst te weten hoe ze er gekomen is. In wezen zijn er drie manieren." },
    { t: "anim", caption: "Drie manieren waarop een bedrijfsprofiel ontstaat — meestal zonder dat de eigenaar er iets voor doet." },
    { t: "h3", text: "Manier 1: iemand voegt de plek handmatig toe" },
    { t: "p", text: "Elke Google-gebruiker kan in de Maps-app op een adres of een lege plek tikken en „Een ontbrekende plaats toevoegen” kiezen. Zo kan een bedrijf worden vermeld zonder er enige band mee te hebben — door klanten, oud-medewerkers, concurrenten of zeer actieve Maps-gebruikers (Local Guides)." },
    { t: "p", text: "Helemaal ongecontroleerd gaat het echter niet. Voordat een gemelde plek zichtbaar wordt, loopt op de achtergrond een automatische controle:" },
    { t: "ul", items: [
      "**Locatie:** bevindt de gebruiker zich echt in de buurt van de plek die hij wil toevoegen? Dat voorkomt dat iemand in Berlijn voor de grap een café in München verzint.",
      "**Dubbelcheck:** bestaat er al een vergelijkbare naam of dezelfde categorie op die coördinaat of er vlak naast?",
      "**Vergelijking met het web:** Google zoekt parallel op de naam om te zien of het bedrijf ergens online opduikt.",
    ] },
    { t: "p", text: "Klopt het plaatje, dan gaat het punt live — voor iedereen zichtbaar als **niet-geclaimd profiel**." },
    { t: "h3", text: "Manier 2: Google maakt het profiel zelf op basis van webdata" },
    { t: "p", text: "Dit is de manier waar de meesten niet op rekenen: Google maakt op grote schaal zelf profielen aan — zonder toedoen of toestemming van de eigenaar. De reden is simpel: Google wil de echte wereld zo volledig mogelijk in kaart brengen en wacht niet tot een nieuw bedrijf zich meldt." },
    { t: "p", text: "Daarvoor doorzoeken Googles crawlers het web voortdurend op zogenoemde **NAP-gegevens** — naam, adres, telefoon (*Name, Address, Phone*). Uit deze fragmenten stelt het systeem een profiel samen, bijvoorbeeld geactiveerd door:" },
    { t: "ul", items: [
      "**Gestructureerde data op de website:** zet de site van een bedrijf in de broncode de gestandaardiseerde `LocalBusiness`-markup (machineleesbare gegevens volgens Schema.org), dan leest Google het adres, telefoonnummer en de openingstijden direct en netjes uit.",
      "**Digitale sporen op het web:** Google combineert gegevens van Facebook-pagina's, Instagram-profielen, vermeldingen in lokale media en vermeldingen in online telefoongidsen.",
      "**Consistentiecheck:** duikt hetzelfde bedrijf met hetzelfde adres meermaals consistent op — op de eigen site, op Facebook en in een lokale blog — dan maakt Google daar automatisch een nieuwe Maps-vermelding van.",
    ] },
    { t: "p", text: "De meeste eigenaren merken het pas wanneer ze plots de knop „Dit bedrijf claimen” op de kaart zien." },
    { t: "h3", text: "Manier 3: bulkimport uit officiële registers" },
    { t: "p", text: "De derde manier wordt vaak onderschat: Google neemt op grote schaal gegevens over, uit officiële bronnen en van data-aggregators waarmee afspraken bestaan." },
    { t: "ul", items: [
      "**Handelsregisters:** zodra een bedrijf is ingeschreven bij de instantie of in het handelsregister, stromen die gegevens met regelmaat naar Google — meestal via tussenliggende databases.",
      "**Bedrijvengidsen:** Google legt zijn kaarten naast de Gouden Gids en de telefoonregisters van elk land. Een nieuwe vermelding daar kan automatisch een nieuw punt op Maps activeren.",
    ] },
    { t: "p", text: "Zo kan een profiel verschijnen kort nadat u uw bedrijf hebt ingeschreven — zonder dat u ooit zelf bij Google bent geweest." },
    { t: "p", text: "**Waarom dit belangrijk is** Hoe het profiel ook is ontstaan, het gevolg is hetzelfde: zodra het bestaat, verzamelt het reviews en verschijnt het in Zoeken en Maps. U hoeft het niet te hebben aangemaakt of te beheren om er last van te hebben — en juist daarom volstaat het niet om het te negeren. U moet het toch actief laten verwijderen." },

    { t: "h2", id: "selbst", text: "Kan men een Google-bedrijfsprofiel zelf verwijderen?", toc: "Zelf verwijderen?" },
    { t: "p", text: "Kort antwoord: **niet op de manier die u zou verwachten.** Google maakt een strikt onderscheid tussen uw persoonlijke Google-account en het publieke bedrijfsprofiel (vroeger „Google Mijn Bedrijf”, tegenwoordig „Google-bedrijfsprofiel”). U kunt het eigenaarschap opeisen en bepaalde gegevens bewerken – maar een duidelijke knop „deze vermelding en alle reviews definitief verwijderen” bestaat voor ondernemers schlicht niet." },
    { t: "p", text: "Dat is geen vergissing, maar opzet: het profiel met zijn reviews maakt deel uit van Google Zoeken en Google Maps. Google beschouwt die informatie als nuttig voor gebruikers – en geeft de controle erover node uit handen. Precies daarom lopen de meeste ondernemers bij een poging hun profiel zelf te verwijderen snel tegen een muur aan." },

    { t: "h2", id: "geschlossen", text: "„Permanent gesloten” is *geen* verwijdering", toc: "„Gesloten” ≠ verwijderd" },
    { t: "p", text: "De optie die Google u biedt, heet „Als permanent gesloten markeren”. Velen beschouwen dat als verwijdering – maar dat is het niet. Het is slechts een **statuslabel**." },
    { t: "warn", title: "Wat er bij „gesloten” écht gebeurt", text: "Uw profiel blijft zichtbaar in Google Zoeken en Google Maps – inclusief naam, adres, foto's en **alle reviews**. Daarboven prijkt enkel een doorgestreept „Permanent gesloten”. Voor potentiële klanten ziet dat er vaak *slechter* uit dan daarvoor." },
    { t: "p", text: "Met andere woorden: wie „sluit”, raakt de vermelding en de reviews niet kwijt – en maakt het probleem in sommige gevallen zelfs zichtbaarder. Een **echte verwijdering** daarentegen verwijdert de volledige [Google Maps-vermelding](/nl/google-maps-vermelding-verwijderen/) inclusief alle reviews volledig uit het zicht." },

    { t: "h2", id: "optionen", text: "Welke opties u echt heeft", toc: "Welke opties u heeft" },
    { t: "p", text: "Realistisch gezien zijn er drie manieren om een ongewenst profiel kwijt te raken – met sterk uiteenlopende resultaten:" },
    { t: "table", rrCol: 3, head: ["Criterium", "Zelf (DIY)", "Advocaat", "RapidRemove"], rows: [
      ["Volledige verwijdering mogelijk?", "Praktisch nee", "Onzeker", "Ja"],
      ["Doorlooptijd", "—", "3–9 maanden", "24–48 uur"],
      ["Kosten", "—", "300 €+ / uur", "Vaste prijs vanaf 450 €"],
      ["Alle reviews weg", "Nee", "Stuk voor stuk, moeizaam", "Alle tegelijk"],
      ["Succes", "Nee", "Ongewis", "Gegarandeerd (No Cure, No Pay)"],
      ["Uw inspanning", "Hoog", "Hoog", "Praktisch nul"],
    ] },
    { t: "p", text: "De doe-het-zelf-weg eindigt bijna altijd bij „permanent gesloten”. De advocatenweg is duur, traag en onzeker – en leidt niet zelden tot het [Streisand-effect](/nl/negatieve-google-review-verwijderen-advocaat/), waarbij de aandacht juist toeneemt. Blijft de derde weg over: de professionele, volledige verwijdering." },

    { t: "h2", id: "anleitung", text: "Handleiding: profiel via Google zelf bewerken", toc: "Stap voor stap" },
    { t: "p", text: "Als u het eerst zelf wilt proberen, hier het werkelijke verloop. Reken erop dat het resultaat in het beste geval „gesloten” is – niet „verwijderd”." },
    { t: "ol", items: [
      "**Eigenaarschap opeisen:** zoek uw bedrijf op bij Google en kies „Bent u de eigenaar van dit bedrijf?”. Google eist een verificatie (ansichtkaart, telefoon, e-mail of video) – dat kan dagen tot weken duren.",
      "**Inloggen in het bedrijfsprofiel:** beheer het profiel vervolgens rechtstreeks vanuit Google Zoeken, zodra het eigenaarschap is bevestigd.",
      "**„Profiel verwijderen” zoeken:** onder de instellingen vindt u opties zoals „Bedrijf als permanent gesloten markeren” of „Profiel verwijderen”. Dat laatste verwijdert alleen de beheerders-koppeling, niet de publieke vermelding.",
      "**Het resultaat controleren:** doorgaans blijft de vermelding met alle reviews zichtbaar – nu met het label „Permanent gesloten”. Het eigenlijke probleem is daarmee niet opgelost.",
    ] },
    { t: "note", title: "Belangrijk om te weten", text: "Zonder bevestigd eigenaarschap kunt u nauwelijks iets wijzigen. En zelfs mét eigenaarschap is de volledige verwijdering van de publieke vermelding via het standaard-interface niet voorzien." },
    { t: "cta", title: "Liever direct controleren of uw profiel verwijderbaar is?", text: "Voer uw bedrijfsnaam in – wij vinden uw echte Google-profiel en controleren in seconden of en hoe snel het kan worden verwijderd. Vrijblijvend en gratis.", btn: "Gratis check starten", href: "/nl/?start=1", trust: ["Betaling pas na succesvolle verwijdering"] },

    { t: "h2", id: "einzeln", text: "Afzonderlijke reviews verwijderen of het hele profiel laten verwijderen?", toc: "Reviews of profiel?" },
    { t: "p", text: "Velen beginnen met de poging om afzonderlijke slechte reviews bij Google te [melden](/nl/valse-google-reviews-verwijderen/). Dat is moeizaam en onzeker: Google wijst meldingen regelmatig af, elke review moet afzonderlijk worden onderbouwd – en voor elke verwijderde review duiken er snel nieuwe op. U bestrijdt de symptomen." },
    { t: "p", text: "De duurzame aanpak pakt de oorzaak aan: **wordt het volledige profiel verwijderd, verdwijnen alle reviews in één klap** – inclusief nep-reviews. Definitief in plaats van stukjeswerk. Precies daarom verwijderen wij bewust geen afzonderlijke reviews, maar het complete profiel. Wie eerst alleen [afzonderlijke Google-reviews wil laten verwijderen](/nl/google-reviews-verwijderen/), vindt daar de methodes en kosten in vergelijking." },
    { t: "tip", title: "Het doorslaggevende voordeel", text: "Een verwijderd profiel kan geen oude én geen nieuwe reviews meer tonen. Het probleem is daarmee niet verschoven, maar opgelost." },

    { t: "h2", id: "legal", text: "Is verwijdering legaal?", toc: "Is het legaal?" },
    { t: "p", text: "Ja. Een professionele verwijdering werkt uitsluitend via de **officiële, door Google voorziene procedures** en is juridisch getoetst. Er wordt niets gehackt, niets omzeild en er wordt geen onbevoegde toegang verschaft. Uw Google-account, Gmail en eventuele Google Ads-accounts blijven daarbij volledig ongemoeid – evenals uw website, uw organische ranking en uw campagnes." },
    { t: "p", text: "Een betrouwbare aanbieder herkent u eraan dat hij een echte onderneming met adres en KVK-nummer vermeldt, transparant over de methode spreekt en **pas na succes factureert** – niet aan vage beloftes over „geheime toegangen bij Google”." },

    { t: "h2", id: "kosten", text: "Hoe lang duurt het – en wat kost het?", toc: "Duur en kosten" },
    { t: "p", text: "Een professionele verwijdering is doorgaans **binnen 24–48 uur** gereed – in plaats van de maanden die de advocatenweg kost. Wat de kosten betreft: een advocaat rekent per uur (vaak 300 € en meer) zonder succesgarantie. RapidRemove werkt met een **transparante vaste prijs vanaf 450 €** – en u betaalt **uitsluitend na succesvolle verwijdering**." },
    { t: "p", text: "Lijkt de prijs hoog? Reken het na: één zichtbare nep-review kan de klikfrequentie aanzienlijk verlagen en kost u over meerdere maanden een veelvoud daarvan." },

    { t: "h2", id: "ablauf", text: "Zo verloopt de verwijdering met RapidRemove", toc: "Hoe het verloopt" },
    { t: "ol", items: [
      "**Gratis check:** voer uw bedrijfsnaam in. Wij vinden uw profiel en controleren direct of verwijdering mogelijk is – vrijblijvend en gratis.",
      "**Bevestigen en vrijgeven:** u bevestigt het juiste profiel en geeft de verwerkingsopdracht. Geen toegang tot Gmail, Ads of persoonlijke gegevens.",
      "**Verwijdering in 24–48 uur:** ons team verwijdert het profiel inclusief alle reviews – definitief. Betaling pas daarna.",
    ] },

    { t: "h2", id: "fazit", text: "Conclusie: de snelste, veiligste weg naar een schoon zoekresultaat", toc: "Conclusie" },
    { t: "p", text: "Een Google-bedrijfsprofiel zelf verwijderen mislukt in de praktijk bijna altijd door Googles eigen systeem – „permanent gesloten” lost het probleem niet op. De betrouwbare weg is de volledige, legale verwijdering van het complete profiel inclusief alle reviews. Snel, definitief, planbaar – en met betaling pas na succes zonder enig risico." },

    { t: "cta", title: "Controleer nu gratis of uw profiel verwijderbaar is", text: "In enkele seconden ziet u uw echte profiel en weet u of en hoe snel wij het kunnen verwijderen. Geen vooruitbetaling, geen verplichting.", btn: "Gratis check starten", href: "/nl/?start=1", trust: ["Nul risico", "Betaling pas na succesvolle verwijdering"] },
  ],
  faq: [
    { q: "Kan ik mijn Google-bedrijfsprofiel zelf verwijderen?", a: "Slechts beperkt. Google biedt geen eenvoudige knop „profiel verwijderen”. U kunt het eigenaarschap opeisen en het profiel als „permanent gesloten” markeren – maar de vermelding inclusief alle reviews blijft dan gewoon openbaar zichtbaar." },
    { q: "Wat is het verschil tussen „permanent gesloten” en „verwijderd”?", a: "„Permanent gesloten” is slechts een status. Het profiel blijft zichtbaar in Zoeken en Maps, inclusief naam, adres en alle reviews. Een echte verwijdering verwijdert de vermelding en alle reviews volledig." },
    { q: "Is het legaal om een Google-bedrijfsprofiel te laten verwijderen?", a: "Ja. De verwijdering verloopt via de officiële, door Google voorziene procedures en is juridisch getoetst. Uw Google-account, Gmail en eventuele Ads-accounts blijven volledig ongemoeid." },
    { q: "Worden ook alle reviews verwijderd?", a: "Ja. Wordt het volledige bedrijfsprofiel verwijderd, dan verdwijnen alle daarmee verbonden reviews in één klap – ook nep- en wraakreviews." },
    { q: "Hoe lang duurt de verwijdering?", a: "Doorgaans is het profiel binnen circa 24 uur verwijderd. De exacte status volgt u op elk moment in het klantenportaal." },
    { q: "Heeft de verwijdering invloed op mijn SEO, mijn website of Google Ads?", a: "Nee. Er wordt uitsluitend het bedrijfsprofiel (Google Maps / Google-bedrijfsprofiel) verwijderd. Uw website, uw ranking en uw campagnes blijven ongewijzigd." },
    { q: "Wat kost het om een Google-bedrijfsprofiel te laten verwijderen?", a: "Bij RapidRemove geldt een transparante vaste prijs vanaf 450 € – en u betaalt uitsluitend na succesvolle verwijdering (No Cure, No Pay)." },
    { q: "Kan het profiel daarna opnieuw verschijnen?", a: "Derden kunnen theoretisch een nieuw profiel aanmaken. Met de optionele bewaking houden wij uw vermelding in de gaten en verwijderen wij een opnieuw verschijnend profiel binnen de beschermingsperiode kosteloos." },
  ],
};
export default article;
