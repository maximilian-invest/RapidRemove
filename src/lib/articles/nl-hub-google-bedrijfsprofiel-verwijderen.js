/* NL hub: "Google-bedrijfsprofiel verwijderen" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (GSC 28 Tage: 484 Impressionen, Ø Pos. 12,2, 1 Klick;
   Top-Queries „google mijn bedrijf verwijderen“, „google bedrijfsprofiel verwijderen“,
   „bedrijfsprofiel google verwijderen“, „bedrijfsprofiel verwijderen“, „google bedrijf
   verwijderen“, „google business profile verwijderen“): Kurzantwort, Googles offizielle
   Schritte mit niederländischen Menübezeichnungen, Vergleichstabelle, eigene Abschnitte je
   Suchintention (wat er gebeurt / opnieuw beginnen / Google Maps / geen optie), eigener
   Abschnitt „Google Mijn Bedrijf“ (alter Name) + erweiterte FAQ. „Wie heeft dit profiel
   aangemaakt“ ans Ende verschoben.
   KERNBOTSCHAFT UNVERÄNDERT: „permanent gesloten“ bzw. „Bedrijfsprofiel verwijderen“ ist
   kein Löschen — Vermelding und alle Reviews bleiben öffentlich; die vollständige
   Entfernung läuft über die Verfahren, die Google dafür vorsieht (RapidRemove). */
const article = {
  meta: {
    slug: "google-bedrijfsprofiel-verwijderen",
    title: "Google-bedrijfsprofiel verwijderen (Mijn Bedrijf): 4 opties",
    h1: "Google-bedrijfsprofiel verwijderen (Google Mijn Bedrijf) – zo werkt het écht",
    description: "Googles stappen beëindigen alleen uw toegang – de vermelding en alle reviews blijven op Maps. Wat de 4 opties echt doen en hoe u het profiel kwijtraakt.",
    author: "Maximilian Hölzl",
    authorRole: "Google-expert en oprichter",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "google bedrijfsprofiel verwijderen",
      "google mijn bedrijf verwijderen",
      "bedrijfsprofiel google verwijderen",
      "bedrijfsprofiel verwijderen",
      "google bedrijf verwijderen",
      "google business profile verwijderen",
      "bedrijf verwijderen van google maps",
      "google bedrijfsprofiel permanent verwijderen",
    ],
  },
  category: "Google-beleid",
  iconKey: "trash",
  readingMin: 14,
  dek: "„Permanent gesloten” is geen verwijdering – en „Bedrijfsprofiel verwijderen” in de instellingen ook niet: uw vermelding, naam, adres en alle reviews blijven zichtbaar op Google. Deze gids laat de officiële opties van Google zien, wat elke optie echt doet en wat werkelijk werkt om een Google-bedrijfsprofiel (vroeger Google Mijn Bedrijf) volledig te laten verwijderen.",
  blocks: [
    { t: "note", title: "Let op", text: "Deze gids is een praktisch overzicht en geen juridisch advies. Voor bindend advies over uw situatie raadpleegt u een gekwalificeerde professional." },

    { t: "lead", text: "U googelt uw bedrijf en ziet een profiel dat u zo niet langer wilt: vol oude nep- of wraakreviews, met onjuiste gegevens, of simpelweg een vermelding waaruit u voorgoed wilt verdwijnen. De logische vraag: **hoe kan ik mijn Google-bedrijfsprofiel – of, zoals het vroeger heette, Google Mijn Bedrijf – verwijderen?** Het eerlijke antwoord is ingewikkelder dan Googles menu doet vermoeden." },

    { t: "tip", title: "Kort antwoord", text: "Een Google-bedrijfsprofiel kunt u niet zomaar verwijderen. Als eigenaar laat Google u alleen **het profiel uit uw beheer verwijderen** (Instellingen voor bedrijfsprofiel → Bedrijfsprofiel verwijderen) of **het bedrijf als permanent gesloten markeren**. In beide gevallen blijven de openbare vermelding en **alle reviews zichtbaar in Google Zoeken en Google Maps**. Een volledige verwijdering van de vermelding – inclusief elke review – verloopt alleen via de procedures die Google daarvoor biedt. Precies dat regelt RapidRemove, in opdracht van de eigenaar en met betaling pas na verwijdering." },

    { t: "h2", id: "why", text: "Waarom er geen simpele verwijderknop is", toc: "Geen verwijderknop" },
    { t: "p", text: "Wie zoekt hoe je een Google-bedrijfsprofiel verwijdert, loopt snel tegen een muur aan. U kunt het bedrijf als **„permanent gesloten”** markeren of het profiel uit uw eigen beheer verwijderen – maar een duidelijke knop **„deze vermelding en alle reviews definitief verwijderen”** bestaat voor ondernemers niet. Dat is geen vergissing, maar opzet: Google beschouwt het profiel en de reviews als nuttige informatie voor zoekers en houdt de controle bij zichzelf. Het profiel beschrijft een echte plek in de wereld – in Googles ogen is het dus niet van u, ook al beheert u het." },
    { t: "p", text: "Google maakt bovendien een strikt onderscheid tussen uw persoonlijke Google-account en het publieke bedrijfsprofiel. U kunt het eigenaarschap opeisen en gegevens bewerken, maar over het bestaan van de vermelding zelf beslist u niet met één klik." },
    { t: "warn", title: "„Permanent gesloten” ≠ verwijderd", text: "Uw bedrijf als gesloten markeren verwijdert het **niet**. De vermelding, naam, adres, foto's en **alle reviews blijven openbaar zichtbaar** in Google Zoeken en Google Maps – nu met een doorgestreept label „Permanent gesloten” erboven. Voor potentiële klanten ziet dat er vaak **slechter** uit dan daarvoor." },

    { t: "h2", id: "official-steps", text: "Google-bedrijfsprofiel verwijderen: de officiële stappen van Google", toc: "Officiële stappen" },
    { t: "p", text: "In Googles eigen woorden heet de optie voor eigenaren **„Bedrijfsprofiel verwijderen”**. Die bestaat – maar ze verwijdert het profiel uit *uw beheer*, niet de vermelding van Google. Zo werkt het, zodat u precies weet wat u wel (en niet) doet." },
    { t: "h3", text: "Op een computer (Google Zoeken)" },
    { t: "ol", items: [
      "Log in met het Google-account dat eigenaar is van het profiel en zoek op uw bedrijfsnaam (of op „mijn bedrijf”).",
      "Open in uw bedrijfsprofiel **Meer** (⋮) → **Instellingen voor bedrijfsprofiel**.",
      "Kies **Bedrijfsprofiel verwijderen** → **Profielcontent en -beheerders verwijderen**.",
      "Wilt u laten zien dat het bedrijf niet meer bestaat, zet dan **Je bedrijf als permanent gesloten markeren** aan.",
      "Bevestig met **Doorgaan** → **Verwijderen** → **Klaar**.",
    ] },
    { t: "h3", text: "In de Google Maps-app" },
    { t: "p", text: "Open de Google Maps-app met het eigenaarsaccount en tik rechtsonder op **Bedrijf**. Beheert u meerdere bedrijven, kies dan bovenaan het juiste profiel. Ga vervolgens naar **Meer** → **Instellingen voor bedrijfsprofiel** → **Bedrijfsprofiel verwijderen**. De stappen en het resultaat zijn hetzelfde als op de computer." },
    { t: "h3", text: "Meerdere profielen tegelijk" },
    { t: "p", text: "Beheert u meerdere vestigingen, open dan **Bedrijfsprofielmanager** met het account waaraan alle profielen gekoppeld zijn, vink de profielen aan en kies rechtsboven **Acties** → **Bedrijven verwijderen** → **Verwijderen**. Krijgt u een foutmelding, dan moet u de content en beheerders per profiel afzonderlijk verwijderen." },
    { t: "warn", title: "Wat Google zelf zegt dat er daarna gebeurt", text: "Volgens Googles eigen helppagina's worden **reviews van klanten niet verwijderd**, en het bedrijf **kan nog steeds in Zoeken en Maps verschijnen**. Ook een als gesloten gemarkeerd bedrijf verdwijnt niet meteen van Maps. Alleen *uw* content wordt gewist: posts, foto's en video's die u hebt geüpload en uw reacties op reviews – en dat is definitief. Alleen de **primaire eigenaar** kan dit doen, en nieuwe eigenaren en beheerders moeten **7 dagen** wachten. Kortom: de officiële optie beëindigt *uw* beheer van het profiel – ze verwijdert het profiel niet." },

    { t: "h2", id: "options", text: "Verwijderen, sluiten of beheerders weghalen: wat elke optie echt doet", toc: "Alle opties vergeleken" },
    { t: "p", text: "Mensen zoeken op „google bedrijf verwijderen”, „bedrijfsprofiel google verwijderen”, „google business profile verwijderen” of „bedrijf van Google Maps halen” – maar aan Googles kant zijn dat heel verschillende handelingen. Dit doet elke optie met de openbare vermelding en de reviews:" },
    { t: "table", head: ["Optie", "Wat het doet", "Vermelding zichtbaar?", "Reviews zichtbaar?"], rows: [
      ["Bedrijfsprofiel verwijderen (instellingen)", "Beëindigt het beheer; uw posts, foto's en reacties worden gewist", "Ja, nu zonder beheerder", "Ja"],
      ["Als permanent gesloten markeren", "Zet een statuslabel op het profiel", "Ja, met label „Permanent gesloten”", "Ja"],
      ["Beheerders verwijderen", "Haalt personen uit het beheer van het profiel", "Ja, ongewijzigd", "Ja"],
      ["„Sluiten of verwijderen” voorstellen op Maps (iedereen)", "Stuurt een suggestie naar Google; Google beslist zelf", "Meestal ja – vaak afgewezen", "Ja, tenzij de vermelding verdwijnt"],
      ["Google-account verwijderen", "Wist uw account, niet het bedrijfsprofiel", "Ja, wordt niet-geclaimd", "Ja"],
      ["Volledige verwijdering via RapidRemove", "Verwijdering via de procedures die Google daarvoor biedt, in opdracht van de eigenaar", "Nee – weg uit Zoeken en Maps", "Nee – alle reviews verdwijnen mee"],
    ] },
    { t: "p", text: "De vier opties die Google u zelf biedt – profiel verwijderen, als gesloten markeren, beheerders weghalen en een voorstel op Maps – hebben één ding gemeen: de vermelding en de reviews blijven staan. Ook uw Google-account verwijderen verandert daar niets aan. Alleen de volledige verwijdering haalt het profiel inclusief alle reviews uit het zicht." },

    { t: "h2", id: "google-mijn-bedrijf", text: "Google Mijn Bedrijf verwijderen: geldt hetzelfde?", toc: "Google Mijn Bedrijf" },
    { t: "p", text: "Ja. **Google Mijn Bedrijf** (Engels: *Google My Business*) is simpelweg de oude naam van het **Google-bedrijfsprofiel** (*Google Business Profile*). Google heeft de naam veranderd en het beheer naar Google Zoeken en de Maps-app verplaatst – de vermelding zelf is dezelfde gebleven. Of u het nu uw Google Mijn Bedrijf-account, bedrijfspagina, vermelding of bedrijfsprofiel noemt: het gaat om hetzelfde item, en dezelfde regels gelden." },
    { t: "p", text: "Oude handleidingen die verwijzen naar een „Google Mijn Bedrijf-dashboard” of een aparte app kloppen daarom vaak niet meer. Het resultaat is wel hetzelfde gebleven: ook wie Google Mijn Bedrijf „verwijdert”, beëindigt alleen het eigen beheer – de vermelding en de reviews blijven openbaar." },

    { t: "h2", id: "what-happens", text: "Wat gebeurt er als u uw Google-bedrijfsprofiel verwijdert?", toc: "Wat er daarna gebeurt" },
    { t: "p", text: "Veel eigenaren verwachten dat de vermelding verdwijnt zodra ze het profiel uit hun account verwijderen. Dit gebeurt er in werkelijkheid:" },
    { t: "ul", items: [
      "**Uw toegang stopt:** u en alle beheerders verliezen de controle over het profiel. Wilt u het later weer beheren, dan moet het opnieuw worden geclaimd en geverifieerd.",
      "**Uw content is weg:** posts, de foto's die u hebt geüpload en uw reacties op reviews worden definitief gewist en kunnen niet worden hersteld.",
      "**De vermelding blijft:** naam, adres, categorie en openingstijden blijven doorgaans zichtbaar in Google Zoeken en Google Maps.",
      "**De reviews blijven:** elke klantreview – ook nep- of oneerlijke reviews – blijft openbaar, nu **zonder uw reacties** ernaast.",
      "**Iedereen kan het aanpassen:** een profiel zonder beheerder kan door gebruikers en door Google zelf worden gewijzigd, en u krijgt daar geen melding meer van.",
    ] },
    { t: "p", text: "Daarom maakt het verwijderen van het profiel uit uw account de situatie vaak erger: de negatieve reviews staan er nog, maar uw kant van het verhaal is verdwenen." },

    { t: "h2", id: "start-over", text: "Bedrijfsprofiel verwijderen en opnieuw beginnen?", toc: "Opnieuw beginnen" },
    { t: "p", text: "Niet door simpelweg een nieuw profiel aan te maken. Bestaat de oude vermelding nog – en na „Bedrijfsprofiel verwijderen” is dat zo – dan ziet Google een **tweede profiel voor hetzelfde bedrijf op hetzelfde adres**. Dubbele vermeldingen worden meestal weer samengevoegd met de oude (inclusief de reviews), of het nieuwe profiel wordt opgeschort. Hoe dan ook: de oude reviews komen terug." },
    { t: "p", text: "Een echte nieuwe start gaat in twee stappen: eerst wordt het **oude profiel volledig verwijderd**, inclusief alle reviews; daarna maakt u – als u dat wilt – een **schoon nieuw profiel** aan en laat u het verifiëren. RapidRemove regelt de eerste stap tegen een vaste prijs, te betalen pas na verwijdering. Uw website en uw posities in Google blijven daarbij ongemoeid." },

    { t: "h2", id: "google-maps", text: "Bedrijf verwijderen van Google Maps", toc: "Van Google Maps halen" },
    { t: "p", text: "Op Google Maps kan iedereen – eigenaar of niet – Google vragen een plek te sluiten of te verwijderen:" },
    { t: "ol", items: [
      "Open de plek in Google Maps of Google Zoeken.",
      "Kies **Bewerking voorstellen** → **Sluiten of verwijderen**.",
      "Kies een reden, bijvoorbeeld permanent gesloten, bestaat niet, dubbele vermelding of spam.",
      "Verstuur het voorstel – Google beoordeelt het en beslist zelf.",
    ] },
    { t: "p", text: "Bij echte, bestaande bedrijven worden zulke voorstellen meestal afgewezen of omgezet in het label „Permanent gesloten” – de vermelding en de reviews blijven. Meer over eigen vermeldingen, vermeldingen van derden en dubbele vermeldingen: [Google Maps-vermelding verwijderen](/nl/magazine/google-maps-vermelding-verwijderen/) en [bedrijf uit Google verwijderen](/nl/magazine/bedrijf-uit-google-verwijderen/)." },

    { t: "h2", id: "no-delete-option", text: "Waarom ziet u geen optie om te verwijderen?", toc: "Geen verwijderoptie?" },
    { t: "p", text: "Ontbreekt „Bedrijfsprofiel verwijderen” in uw instellingen, dan is het bijna altijd een van deze redenen:" },
    { t: "ul", items: [
      "**U bent beheerder, geen primaire eigenaar.** Alleen de primaire eigenaar kan profielcontent en beheerders verwijderen. Andere eigenaren en beheerders kunnen alleen zichzelf uit het profiel verwijderen.",
      "**U bent pas kort eigenaar.** Nieuwe eigenaren en beheerders moeten 7 dagen wachten voordat de optie beschikbaar wordt.",
      "**Het profiel is niet door u geverifieerd of geclaimd.** Dan hoort het bij niemand – of bij een ander Google-account.",
      "**U bent ingelogd met het verkeerde Google-account.** Veel bedrijven hebben er meerdere; controleer welk account eigenaar is van het profiel.",
    ] },
    { t: "p", text: "En ook als u de knop vindt, onthoud het resultaat: hij verwijdert het profiel uit uw account, niet van Google." },

    { t: "h2", id: "how", text: "Zo werkt een volledige verwijdering van het profiel", toc: "Zo werkt verwijdering" },
    { t: "p", text: "De enige betrouwbare manier om een profiel met zijn reviews te laten verdwijnen, is de **volledige verwijdering van het bedrijfsprofiel** via de procedures die Google daarvoor biedt – niet het stuk voor stuk melden van reviews. Wordt het hele profiel verwijderd, dan **verdwijnt elke review mee**, ook nep-reviews. Dat is het verschil tussen symptomen bestrijden en de oorzaak wegnemen." },
    { t: "p", text: "Precies dat doet RapidRemove, altijd in opdracht van de eigenaar. De belangrijkste voordelen:" },
    { t: "ul", items: [
      "**Snel:** verwijdering van het profiel doorgaans binnen **24–48 uur** in plaats van maanden",
      "**Volledig:** het complete profiel, inclusief **alle** reviews, in één keer",
      "**Planbaar:** een vaste prijs, te betalen **pas na verwijdering** – geen open uurtarieven",
      "**Bewaking:** met de optionele bewaking houden wij uw vermelding in de gaten; verschijnt het profiel binnen de beschermingsperiode opnieuw via derden, dan verwijderen wij het kosteloos",
      "**SEO-vriendelijk:** uw website en posities blijven intact; een schoon nieuw profiel is optioneel",
      "**Discreet:** geen contact met reviewers, geen risico op het [Streisand-effect](/nl/magazine/negatieve-google-review-verwijderen-advocaat/)",
    ] },
    { t: "h3", text: "Het verloop in drie stappen" },
    { t: "ol", items: [
      "**Gratis check:** voer uw bedrijfsnaam in. Wij vinden uw profiel en controleren direct of verwijdering mogelijk is – vrijblijvend en gratis.",
      "**Bevestigen en opdracht geven:** u bevestigt het juiste profiel en geeft de opdracht. Geen toegang tot Gmail, Ads of persoonlijke gegevens nodig.",
      "**Verwijdering in 24–48 uur:** ons team laat het profiel inclusief alle reviews verwijderen via de procedures die Google daarvoor biedt. Betaling pas daarna.",
    ] },
    { t: "p", text: "Uw Google-account, Gmail en eventuele Google Ads-accounts blijven daarbij volledig ongemoeid – evenals uw website, uw organische posities en uw campagnes. Een betrouwbare aanbieder herkent u eraan dat hij een echte onderneming met adres vermeldt, transparant is over de werkwijze en **pas na verwijdering factureert** – niet aan vage beloftes over „geheime toegang bij Google”." },
    { t: "warn", title: "Belangrijk", text: "Een volledige verwijdering verwijdert het **hele profiel**, niet één review. Wilt u alleen één of enkele reviews kwijt en het profiel behouden, dan kan dat ook: zie hieronder." },

    { t: "cta", title: "Liever direct controleren of uw profiel verwijderbaar is?", text: "Voer uw bedrijfsnaam in – wij vinden uw echte Google-profiel en controleren in seconden of en hoe snel het kan worden verwijderd. Vrijblijvend en gratis.", btn: "Gratis check starten", href: "/nl/?start=1", trust: ["Gratis analyse", "Betaling pas na verwijdering"] },

    { t: "h2", id: "single-vs-profile", text: "Losse reviews verwijderen of het hele profiel?", toc: "Reviews of profiel?" },
    { t: "p", text: "Velen beginnen met het [melden](/nl/magazine/valse-google-reviews-verwijderen/) van afzonderlijke slechte reviews bij Google. Dat is moeizaam en onzeker: Google wijst meldingen regelmatig af, elke review moet afzonderlijk worden onderbouwd – en voor elke verwijderde review duiken er snel nieuwe op. U bestrijdt de symptomen." },
    { t: "p", text: "Is het profiel als geheel beschadigd en wilt u een echte nieuwe start, dan pakt de volledige verwijdering de oorzaak aan: **wordt het profiel verwijderd, dan verdwijnen alle reviews in één keer** – ook nep-reviews." },
    { t: "p", text: "Is uw profiel in principe gezond en storen alleen één of enkele reviews, dan hoeft u niet alles te verwijderen: RapidRemove biedt ook [losse reviews verwijderen](/nl/review-laten-verwijderen/) aan. Reviews met tekst tot 4 weken oud hebben ca. 90 % slagingskans en kosten € 179 per verwijderde review; alle andere (oudere reviews, ca. 50 %, of alleen sterren) € 250 – u betaalt alleen voor reviews die echt weg zijn. Prijzen en rekenvoorbeelden vindt u in het artikel over de [Google-review-verwijderservice](/nl/magazine/google-review-verwijderen-service/), alle methodes en kosten in vergelijking onder [Google-reviews laten verwijderen](/nl/magazine/google-reviews-verwijderen/)." },
    { t: "tip", title: "Het doorslaggevende voordeel", text: "Een verwijderd profiel kan geen oude én geen nieuwe reviews meer tonen. Het probleem is daarmee niet verschoven, maar opgelost." },

    { t: "h2", id: "cost", text: "Hoe lang duurt het – en wat kost het?", toc: "Duur en kosten" },
    { t: "p", text: "Realistisch gezien zijn er drie wegen om een ongewenst profiel kwijt te raken – met sterk uiteenlopende resultaten:" },
    { t: "table", rrCol: 3, head: ["Criterium", "Zelf (DIY)", "Advocaat", "RapidRemove"], rows: [
      ["Volledige verwijdering mogelijk?", "Praktisch nee", "Onzeker", "Ja"],
      ["Doorlooptijd", "—", "3–9 maanden", "24–48 uur"],
      ["Kosten", "—", "300 €+ / uur", "Vaste prijs vanaf 450 €"],
      ["Alle reviews weg", "Nee", "Stuk voor stuk, moeizaam", "Alle tegelijk"],
      ["Betaling", "—", "Per uur, ook zonder resultaat", "Pas na verwijdering"],
      ["Uw inspanning", "Hoog", "Hoog", "Praktisch nul"],
    ] },
    { t: "p", text: "Een professionele verwijdering is doorgaans **binnen 24–48 uur** gereed – in plaats van de maanden die de advocatenweg kost. Een advocaat rekent per uur (vaak 300 € en meer), zonder zekerheid over het resultaat, en de juridische weg leidt niet zelden tot het [Streisand-effect](/nl/magazine/negatieve-google-review-verwijderen-advocaat/), waarbij de aandacht juist toeneemt. RapidRemove werkt met een **transparante vaste prijs vanaf 450 €** – en u betaalt **uitsluitend na succesvolle verwijdering**." },
    { t: "p", text: "Lijkt de prijs hoog? Reken het na: één zichtbare nep-review kan de klikfrequentie aanzienlijk verlagen en kost u over meerdere maanden een veelvoud daarvan." },

    { t: "h2", id: "herkunft", text: "Wie heeft dit profiel eigenlijk aangemaakt?", toc: "Wie maakte het aan?" },
    { t: "p", text: "De meeste ondernemers die ons benaderen, hebben hun profiel nooit zelf aangemaakt — en zijn oprecht verbaasd dat het bestaat. Dat is niet de uitzondering, maar de regel. Een Google-bedrijfsprofiel wordt zelden actief door de eigenaar opgezet. Veel vaker voegt iemand anders het toe, of genereert Google het volledig automatisch. Om te begrijpen waarom zo'n vermelding later zo lastig weg te krijgen is, helpt het te weten hoe ze er gekomen is. In wezen zijn er drie manieren." },
    { t: "anim", caption: "Drie manieren waarop een bedrijfsprofiel ontstaat — meestal zonder dat de eigenaar er iets voor doet." },
    { t: "h3", text: "Manier 1: iemand voegt de plek handmatig toe" },
    { t: "p", text: "Elke Google-gebruiker kan in de Maps-app op een adres of een lege plek tikken en „Een ontbrekende plaats toevoegen” kiezen. Zo kan een bedrijf worden vermeld zonder er enige band mee te hebben — door klanten, oud-medewerkers, concurrenten of zeer actieve Maps-gebruikers (Local Guides)." },
    { t: "p", text: "Helemaal ongecontroleerd gaat het echter niet. Voordat een gemelde plek zichtbaar wordt, loopt op de achtergrond een automatische controle:" },
    { t: "ul", items: [
      "**Locatie:** bevindt de gebruiker zich echt in de buurt van de plek die hij wil toevoegen? Dat voorkomt dat iemand in Amsterdam voor de grap een café in Antwerpen verzint.",
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
      "**Handelsregisters:** zodra een bedrijf is ingeschreven bij de Kamer van Koophandel of in de Kruispuntbank van Ondernemingen, stromen die gegevens met regelmaat naar Google — meestal via tussenliggende databases.",
      "**Bedrijvengidsen:** Google legt zijn kaarten naast de Gouden Gids en de telefoonregisters van elk land. Een nieuwe vermelding daar kan automatisch een nieuw punt op Maps activeren.",
    ] },
    { t: "p", text: "Zo kan een profiel verschijnen kort nadat u uw bedrijf hebt ingeschreven — zonder dat u ooit zelf bij Google bent geweest." },
    { t: "p", text: "**Waarom dit belangrijk is:** hoe het profiel ook is ontstaan, het gevolg is hetzelfde: zodra het bestaat, verzamelt het reviews en verschijnt het in Zoeken en Maps. U hoeft het niet te hebben aangemaakt of te beheren om er last van te hebben — en juist daarom volstaat negeren niet. U moet het actief laten verwijderen." },

    { t: "cta", title: "Klaar om uw profiel voorgoed kwijt te raken?", text: "Start de gratis check – in enkele seconden ziet u uw echte profiel en weet u of en hoe snel het kan worden verwijderd. Geen vooruitbetaling, geen verplichting.", btn: "Gratis check starten", href: "/nl/?start=1", trust: ["Gratis analyse", "Betaling pas na verwijdering"] },
  ],
  faq: [
    { q: "Kan ik mijn Google-bedrijfsprofiel zelf verwijderen?", a: "Slechts beperkt. U kunt het profiel uit uw account verwijderen of het bedrijf als „permanent gesloten” markeren, maar geen van beide verwijdert de openbare vermelding – die blijft met alle reviews zichtbaar in Zoeken en Maps. Een volledige verwijdering verloopt via de procedures die Google daarvoor biedt." },
    { q: "Hoe kan ik Google Mijn Bedrijf verwijderen?", a: "Google Mijn Bedrijf heet tegenwoordig Google-bedrijfsprofiel. Zoek op uw bedrijfsnaam terwijl u bent ingelogd met het eigenaarsaccount, kies Meer → Instellingen voor bedrijfsprofiel → Bedrijfsprofiel verwijderen en bevestig met Doorgaan → Verwijderen. Daarmee stopt uw beheer, maar de vermelding en alle reviews blijven doorgaans gewoon op Google staan." },
    { q: "Is Google Mijn Bedrijf hetzelfde als Google-bedrijfsprofiel?", a: "Ja. Google Mijn Bedrijf (Google My Business) is de oude naam van het Google-bedrijfsprofiel (Google Business Profile). Bedrijfsaccount, bedrijfspagina, vermelding of profiel: het gaat telkens om hetzelfde item." },
    { q: "Hoe verwijder ik mijn Google-bedrijfsprofiel permanent?", a: "Via Instellingen voor bedrijfsprofiel → Bedrijfsprofiel verwijderen beëindigt u uw beheer definitief en wist u uw posts, foto's en reacties op reviews. De openbare vermelding en de reviews blijven daarbij meestal op Google. Om de vermelding zelf te laten verwijderen, moet die via de procedures die Google daarvoor biedt worden verwijderd – in opdracht van de eigenaar." },
    { q: "Wat is het verschil tussen „permanent gesloten” en „verwijderd”?", a: "„Permanent gesloten” is slechts een status. Het profiel blijft zichtbaar in Zoeken en Maps, inclusief naam, adres en alle reviews – alleen met een doorgestreept label erboven. Een echte verwijdering haalt de vermelding en alle reviews volledig weg." },
    { q: "Wat gebeurt er als ik mijn bedrijfsprofiel verwijder?", a: "U verliest de toegang, en uw posts, foto's en reacties op reviews worden gewist. De vermelding zelf, de reviews en de bedrijfsgegevens blijven doorgaans zichtbaar in Google Zoeken en Maps – en iedereen kan er nu wijzigingen voor voorstellen." },
    { q: "Kan ik mijn bedrijfsprofiel verwijderen en opnieuw beginnen?", a: "Alleen als het oude profiel eerst volledig is verwijderd. Een nieuw profiel voor hetzelfde bedrijf op hetzelfde adres wordt als dubbele vermelding gezien en meestal weer met het oude samengevoegd – inclusief de reviews – of opgeschort." },
    { q: "Hoe verwijder ik mijn bedrijf van Google Maps?", a: "Iedereen kan op de plek in Google Maps kiezen voor „Bewerking voorstellen” → „Sluiten of verwijderen”. Google beslist zelf en laat bij echte bedrijven de vermelding meestal staan of markeert die alleen als gesloten. Een volledige verwijdering van de vermelding met alle reviews verloopt via de procedures die Google daarvoor biedt." },
    { q: "Waarom zie ik geen optie om mijn bedrijfsprofiel te verwijderen?", a: "Meestal omdat u beheerder bent in plaats van primaire eigenaar, omdat u minder dan 7 dagen eigenaar bent, omdat het profiel niet onder uw account is geverifieerd, of omdat u met een ander Google-account bent ingelogd." },
    { q: "Kan ik een bedrijfsprofiel laten verwijderen dat ik niet zelf heb aangemaakt?", a: "Ja, als het uw bedrijf betreft. Veel profielen worden door derden of automatisch door Google aangemaakt. U kunt zo'n profiel claimen, maar ook dan blijft de vermelding na „Bedrijfsprofiel verwijderen” staan. Voor een volledige verwijdering geeft u als eigenaar de opdracht; RapidRemove werkt via de procedures die Google daarvoor biedt." },
    { q: "Worden ook alle reviews verwijderd?", a: "Ja, bij een volledige verwijdering. Wordt het complete bedrijfsprofiel verwijderd, dan verdwijnen alle daarmee verbonden reviews in één keer – ook nep- en wraakreviews. Bij Googles eigen optie „Bedrijfsprofiel verwijderen” blijven de reviews daarentegen staan." },
    { q: "Hoe lang duurt de verwijdering?", a: "Een professionele verwijdering van het profiel duurt doorgaans 24–48 uur. De exacte status volgt u op elk moment in het klantenportaal." },
    { q: "Heeft de verwijdering invloed op mijn SEO, mijn website of Google Ads?", a: "Nee. Er wordt uitsluitend het bedrijfsprofiel (Google Maps / Google-bedrijfsprofiel) verwijderd. Uw website, uw Google-account, uw posities en uw campagnes blijven ongewijzigd. Een schoon nieuw profiel kan daarna optioneel worden aangemaakt." },
    { q: "Mag ik mijn Google-bedrijfsprofiel laten verwijderen?", a: "Ja, als eigenaar kunt u daar opdracht voor geven. RapidRemove werkt uitsluitend via de procedures die Google daarvoor biedt, in opdracht van de eigenaar. Uw Google-account, Gmail en eventuele Ads-accounts blijven volledig ongemoeid." },
    { q: "Wat kost het om een Google-bedrijfsprofiel te laten verwijderen?", a: "Bij RapidRemove geldt een transparante vaste prijs vanaf 450 € – en u betaalt uitsluitend na succesvolle verwijdering. Wilt u alleen losse reviews kwijt, dan kost [losse reviews verwijderen](/nl/review-laten-verwijderen/) € 179 per verwijderde review met tekst tot 4 weken oud en € 250 voor alle andere – alleen voor reviews die echt weg zijn." },
    { q: "Kan het profiel daarna opnieuw verschijnen?", a: "Derden kunnen theoretisch een nieuw profiel aanmaken. Met de optionele bewaking houden wij uw vermelding in de gaten en verwijderen wij een opnieuw verschijnend profiel binnen de beschermingsperiode kosteloos." },
  ],
};
export default article;
