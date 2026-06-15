/* NL — google-maps-eintrag-loeschen */
const article = {
  category: "Google-beleid",
  meta: {
    slug: "google-maps-vermelding-verwijderen",
    title: "Google Maps-vermelding verwijderen: eigen, vreemd & definitief",
    h1: "Google Maps-vermelding verwijderen: eigen, vreemde, onjuiste en dubbele vermeldingen",
    description: "Google Maps-vermelding verwijderen – eigen, vreemde, onjuiste of dubbele vermeldingen aanpakken. Stappenplan, waarom „gesloten” niet volstaat en hoe definitieve verwijdering écht werkt.",
    keywords: ["google maps vermelding verwijderen", "google maps vermelding laten verwijderen", "andermans google maps vermelding verwijderen", "onjuiste google maps vermelding verwijderen", "bedrijf uit google maps verwijderen", "dubbele google vermelding verwijderen"],
    author: "Matthias Lang",
    authorRole: "Google-expert",
    date: "2026-06-04",
  },
  dek: "Een verouderde, onjuiste of dubbele vermelding op Google Maps verwarrt klanten, stuurt ze naar het verkeerde adres — en kan uw reputatie ernstige schade toebrengen. Het verraderlijke: zelfs als u alles uit uw account verwijdert, **blijft de vermelding inclusief alle reviews zichtbaar in Maps en in de Google-zoekresultaten.** Deze gids legt u eerlijk en stap voor stap uit hoe u eigen, vreemde, onjuiste en dubbele Maps-vermeldingen verwijdert — waar de grenzen van de standaard Google-tools liggen, en hoe een werkelijk definitieve verwijdering tot stand komt.",
  blocks: [
    { t: "note", title: "Opmerking", text: "Dit artikel is een praktische handleiding en geen juridisch advies." },

    { t: "h2", id: "kurz", text: "In het kort", toc: "In het kort" },
    { t: "ul", items: [
      "**„Uit account verwijderen” ≠ verwijderd.** In de meeste gevallen wordt de vermelding slechts op „definitief gesloten” gezet — naam, adres en alle reviews blijven zichtbaar.",
      "**Vreemde en onjuiste vermeldingen** kunnen alleen worden **gemeld**, niet rechtstreeks verwijderd — en Google wijst meldingen regelmatig af.",
      "**Dubbele vermeldingen** kunt u beter laten samenvoegen dan overhaast verwijderen — anders verliest u opgebouwde reviews.",
      "**Volledig en definitief** (inclusief alle reviews) lukt verwijdering in de praktijk vrijwel uitsluitend via de **volledige profielverwijdering** — bij RapidRemove doorgaans binnen 24–48 uur, **betaling pas na succes**.",
    ] },

    { t: "h2", id: "herkunft", text: "Eerst begrijpen: hoe ontstaat de vermelding überhaupt?", toc: "Hoe ontstaat ze?" },
    { t: "p", text: "Veel ondernemers staan ervan te kijken dat hun Maps-vermelding er al is — ze hebben hem nooit zelf aangemaakt. Dat is heel normaal: vermeldingen worden aangemaakt door andere gebruikers, door Googles geautomatiseerde dataverzameling op het web of door imports uit officiële registers. Belangrijk hier: omdat de vermelding zelden door u zelf is aangemaakt, heeft u via het gewone accountmenu slechts beperkte zeggenschap." },
    { t: "p", text: "Welke aanpak voor u de juiste is, hangt af van het type vermelding. Er zijn vier veelvoorkomende situaties." },

    { t: "h2", id: "eigener", text: "Situatie 1: Uw eigen Google Maps-vermelding verwijderen", toc: "Situatie 1: Eigen vermelding" },
    { t: "p", text: "Als u als eigenaar geverifieerd bent, kunt u de vermelding uit uw beheer losmaken:" },
    { t: "ol", items: [
      "Zoek bij Google naar **„Mijn bedrijf”** en open de profielinstellingen.",
      "Ga via het **druppelmenu** (drie puntjes) naar **„Bedrijfsprofiel verwijderen”**.",
      "Kies **„Profielinhoud en beheerders verwijderen”** en bevestig.",
    ] },
    { t: "p", text: "Klinkt als verwijderen — maar dat is het niet. Wat er werkelijk gebeurt, leggen we zo uit. Reken erop dat de openbare vermelding gewoon blijft staan." },

    { t: "cta", title: "Uw Maps-vermelding definitief kwijt?", text: "Wij controleren gratis of uw Google Maps-vermelding daadwerkelijk verwijderd kan worden.", btn: "Gratis controleren", href: "/nl/?start=1", trust: ["Gratis analyse", "Inclusief garantie", "Zonder risico"] },

    { t: "h2", id: "sichtbar", text: "Waarom de vermelding na het „verwijderen” zichtbaar blijft", toc: "Waarom blijft ze?" },
    { t: "p", text: "Dit is het punt waarop de meeste ondernemers vastlopen — en dat Google bewust niet duidelijk communiceert: het verwijderen uit uw account betekent **niet** dat het bedrijf uit Maps en de zoekresultaten verdwijnt. De vermelding wordt alleen losgekoppeld van uw beheer en als **„Definitief gesloten”** gemarkeerd. Naam, adres, foto's en **alle reviews blijven openbaar** zichtbaar — nu met een doorgestreepte toevoeging die voor potentiële klanten er vaak slechter uitziet dan voorheen." },
    { t: "p", text: "De reden ligt in Googles verdienmodel: Google Maps bestaat bij de gratie van zo volledig mogelijke locatiedata. In zijn [inhoudsbeleid](https://support.google.com/contributionpolicy/answer/7400114) stelt Google zich nadrukkelijk op tegen de volledige verwijdering van bedrijfsprofielen. Een restloze verwijdering via uw eigen account is dan ook praktisch niet voorzien." },

    { t: "h2", id: "fremder", text: "Situatie 2: Een vreemde of onjuiste vermelding melden", toc: "Situatie 2: Vreemde vermelding" },
    { t: "p", text: "Voor vermeldingen die niet van u zijn — een onjuiste, verouderde of door derden aangemaakte vermelding — rest alleen de meldfunctie:" },
    { t: "ol", items: [
      "Open de vermelding in **Google Maps**.",
      "Klik op **„Wijziging voorstellen”**.",
      "Kies **„Als gesloten melden of verwijderen”**.",
      "Geef de reden op, bijvoorbeeld **„Bestaat hier niet”** of **„Aanstootgevend, schadelijk of misleidend”**.",
      "Sla op en wacht op de beoordeling door Google.",
    ] },
    { t: "p", text: "Eerlijk gezegd: dit vergt geduld. Google beoordeelt meldingen grotendeels geautomatiseerd, de behandeling kan weken in beslag nemen en meldingen worden vaak zonder nadere toelichting afgewezen. Het helpt wanneer meerdere onafhankelijke personen dezelfde feitelijk onderbouwde opmerking indienen — valse meldingen herkent Google snel en worden genegeerd." },

    { t: "h2", id: "doppelt", text: "Situatie 3: Een dubbele vermelding (duplicaat) opruimen", toc: "Situatie 3: Duplicaat" },
    { t: "p", text: "Dubbele vermeldingen ontstaan regelmatig door verhuizingen, naamswijzigingen of per abuis meervoudig aangemaakt profielen. Zo pakt u het aan:" },
    { t: "ol", items: [
      "Open het **dubbele** profiel in Google Maps.",
      "Klik op **„Wijziging voorstellen”** → **„Als gesloten melden of verwijderen”**.",
      "Kies als reden **„Duplicaat van een andere locatie”** en sla op.",
    ] },
    { t: "warn", title: "Belangrijk", text: "Verwijder niet per ongeluk de **geverifieerde** vermelding — anders moet u het eigenaarschap opnieuw bevestigen. Hebben beide vermeldingen al reviews, verwijder ze dan **niet** maar laat ze via de Google-support **samenvoegen**. Alleen zo blijven uw echte recensies behouden." },

    { t: "h2", id: "sonderfaelle", text: "Situatie 4: Bedrijf gesloten, verhuisd of hernoemd", toc: "Situatie 4: Speciale gevallen" },
    { t: "p", text: "Deze speciale gevallen worden vaak verkeerd aangepakt:" },
    { t: "ul", items: [
      "**Bedrijf definitief gesloten:** „Definitief gesloten” is hier de juiste keuze — maar bedenk dat oude negatieve reviews zichtbaar blijven en hun impact houden.",
      "**Verhuisd:** Pas het adres aan in de bestaande vermelding in plaats van een nieuwe aan te maken — anders ontstaat een duplicaat en worden reviews verspreid.",
      "**Hernoemd:** Wijzig de naam in hetzelfde profiel. Een nieuwe vermelding doet afstand van uw opgebouwde reviewgeschiedenis.",
    ] },
    { t: "p", text: "Als de vermelding echter structureel beschadigd is — door nep-reviews, een reputatieaanval of gegevens die niet te corrigeren zijn — heeft bijsturen geen zin. Dan is volledige verwijdering de schone oplossing." },

    { t: "h2", id: "vergleich", text: "De methoden vergeleken", toc: "Methoden vergeleken" },
    { t: "table", head: ["Aanpak", "Wat het oplevert", "Doorlooptijd", "Slagingskans"], rows: [
      ["Zelf melden (formulier)", "Individuele vreemde/onjuiste vermeldingen", "Weken, onzeker", "Vaak beperkt, regelmatige afwijzing"],
      ["Uit account verwijderen", "Alleen status „gesloten”", "Direct", "Vermelding blijft zichtbaar"],
      ["Advocaat", "Individuele onrechtmatige inhoud", "3–9 maanden", "Onzeker, duur (uurtarieven)"],
      ["**RapidRemove (profielverwijdering)**", "**Volledige vermelding + alle reviews**", "**24–48 uur**", "**Betaling alleen bij succes**"],
    ] },

    { t: "h2", id: "dauerhaft", text: "Definitieve oplossing: het volledige profiel laten verwijderen", toc: "Definitief verwijderen" },
    { t: "p", text: "Als u een vermelding **volledig en definitief** — inclusief alle reviews — uit Google Maps en de zoekresultaten wilt laten verdwijnen, stuit u op de grenzen van de standaard tools. Precies daar komt RapidRemove in beeld: wij bestrijden geen afzonderlijke reviews of statuslabels, maar verwijderen het **volledige Google-bedrijfsprofiel** via de officiële Google-procedures. Daarmee verdwijnt de vermelding inclusief alle reviews in één beweging — nep-reviews inbegrepen." },
    { t: "p", text: "Wat dit voor u betekent:" },
    { t: "ul", items: [
      "**Snelheid:** verwijdering doorgaans binnen 24–48 uur in plaats van maandenlang heen-en-weer.",
      "**Volledig:** profiel en alle reviews worden volledig uit weergave en zoekopdrachten verwijderd — geen „gesloten”, geen restanten.",
      "**SEO-vriendelijk:** uw website, organische ranking en Google Ads blijven onaangetast. Uitsluitend de Maps-/bedrijfsvermelding wordt verwijderd.",
      "**Transparant:** vaste prijs, **betaalbaar pas na succes** (No Cure, No Pay).",
      "**Met garantie:** als het profiel door derden opnieuw wordt aangemaakt, verwijderen wij het binnen de garantieperiode kosteloos opnieuw.",
      "**Discreet:** geen briefwisseling, geen rechtstreeks conflict met reviewers — en dus geen Streisand-effect.",
    ] },
    { t: "h3", text: "Zo verloopt de verwijdering met RapidRemove" },
    { t: "ol", items: [
      "**Gratis check:** voer uw bedrijfsnaam in. Wij vinden uw daadwerkelijke Maps-vermelding en controleren in seconden of en hoe snel deze verwijderd kan worden.",
      "**Bevestigen en vrijgeven:** u bevestigt het juiste profiel en geeft toestemming voor de verwerking. Geen toegang tot Gmail, Google Ads of persoonlijke gegevens.",
      "**Verwijdering binnen 24–48 uur:** ons team verwijdert de vermelding inclusief alle reviews — definitief. Betaling vindt pas daarna plaats.",
    ] },

    { t: "cta", title: "Controleer gratis of uw Maps-vermelding verwijderd kan worden.", text: "Voer uw bedrijfsnaam in — wij controleren in seconden of en hoe snel uw profiel inclusief alle reviews verwijderd kan worden.", btn: "Verwijderbaarheid controleren", href: "/nl/?start=1", trust: ["Analyse gratis", "Garantie", "Geen risico"] },

    { t: "h2", id: "fazit", text: "Conclusie", toc: "Conclusie" },
    { t: "p", text: "Een Google Maps-vermelding is met de standaard Google-tools slechts beperkt te beïnvloeden: „uit het account verwijderen” betekent doorgaans alleen „gesloten”, vreemde vermeldingen kunnen alleen worden gemeld en duplicaten worden beter samengevoegd dan verwijderd. Gaat het om een **volledige, definitieve** verwijdering inclusief alle reviews, dan is profielverwijdering de betrouwbare route — snel, transparant en met betaling pas na succes." },

    { t: "cta", title: "Controleer nu gratis of uw vermelding verwijderd kan worden.", text: "In enkele seconden ziet u uw daadwerkelijke profiel en hoort u of en hoe snel wij het kunnen verwijderen. Geen vooruitbetaling, geen verplichting.", btn: "Gratis check starten", href: "/nl/?start=1", trust: ["Nul risico", "Betaling alleen na succesvolle verwijdering"] },
  ],
  faq: [
    { q: "Hoe verwijder ik mijn eigen Google Maps-vermelding?", a: "Via „Mijn bedrijf” → Profielinstellingen → Druppelmenu → „Bedrijfsprofiel verwijderen” → „Profielinhoud en beheerders verwijderen”. Let op: dit koppelt de vermelding alleen los van uw account, maar verwijdert deze niet uit Maps en de zoekresultaten." },
    { q: "Waarom blijft mijn Google Maps-vermelding zichtbaar na het verwijderen?", a: "Omdat het verwijderen uit het account de vermelding doorgaans alleen als „Definitief gesloten” markeert. Profiel en reviews blijven in Maps en de zoekresultaten staan. Volledige verwijdering is door Google zelf niet voorzien; in de praktijk lukt dit vrijwel uitsluitend via een gespecialiseerd bureau." },
    { q: "Hoe meld ik een vreemde of onjuiste vermelding?", a: "Open de vermelding in Google Maps, klik op „Wijziging voorstellen” → „Als gesloten melden of verwijderen”, geef de reden op (bijv. „Bestaat hier niet”) en sla op. Google beoordeelt het verzoek — dat kan enige tijd duren en wordt regelmatig afgewezen." },
    { q: "Hoe verwijder ik een dubbele Google-vermelding?", a: "Open het duplicaat in Maps, klik op „Wijziging voorstellen” → „Als gesloten melden of verwijderen” → „Duplicaat van een andere locatie”. Hebben beide vermeldingen al reviews, laat ze dan via de Google-support samenvoegen zodat er geen recensies verloren gaan." },
    { q: "Heeft verwijdering invloed op mijn SEO of website?", a: "Nee. Uitsluitend de Maps-/bedrijfsvermelding wordt verwijderd. Uw website, organische ranking en Google Ads blijven ongewijzigd." },
    { q: "Kan ik een Google Maps-vermelding definitief laten verwijderen?", a: "Volledig en definitief, inclusief alle reviews, lukt dat in de praktijk via een gespecialiseerd bureau, omdat Google zelfverwijdering niet voorziet. De technische verwijdering vindt vaak plaats binnen 24–48 uur — betaling pas na succes." },
    { q: "Wat kost de verwijdering van een Maps-vermelding?", a: "Bij RapidRemove geldt een transparante vaste prijs, uitsluitend betaalbaar na succesvolle verwijdering. U loopt dus geen financieel risico." },
  ],
  related: [
    { label: "Google-bedrijfsprofiel verwijderen: hoe werkt dat?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Google reviews verwijderen: kosten en methoden", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Een valse Google review rapporteren en verwijderen", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Slechte Google review – wat te doen?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
