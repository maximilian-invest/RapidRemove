/* DA hub: "Slet Google-virksomhedsprofil" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile.js):
   Kurzantwort, Googles offizielle Schritte mit den exakten dänischen Menübezeichnungen
   (Hilfe-Center 4669092 + 16043467, hl=da), Vergleichstabelle, eigene Abschnitte je
   Suchintention (what happens / start over / Google Maps / no delete option),
   „Hvem oprettede profilen" ans Ende verschoben, FAQ erweitert.
   KERNBOTSCHAFT UNVERÄNDERT: „Fjern virksomhedsprofil" bzw. „permanent lukket" ist kein
   Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige Entfernung
   läuft über die von Google bereitgestellten Verfahren im Auftrag des Inhabers.
   Preise unverändert übernommen. */
const article = {
  meta: {
    slug: "slet-google-virksomhedsprofil",
    title: "Slet Google-virksomhedsprofil: 4 muligheder (2026)",
    h1: "Slet Google-virksomhedsprofil (permanent) – sådan gør du",
    description: "Googles trin fjerner kun din adgang – opslaget og alle anmeldelser bliver på Maps. Hvad de 4 muligheder reelt gør, og hvordan profilen fjernes for altid.",
    author: "Maximilian Hölzl",
    authorRole: "Google-ekspert og grundlægger",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "slet google virksomhedsprofil",
      "fjern google virksomhedsprofil",
      "fjern virksomhed fra google",
      "slet virksomhed på google maps",
      "slet google my business",
      "slet google virksomhedsprofil permanent",
      "fjern virksomhed fra google maps",
      "slet google business profil",
    ],
  },
  category: "Googles politik",
  iconKey: "trash",
  readingMin: 14,
  dek: "»Permanent lukket« er ikke det samme som slettet – og det er det heller ikke at fjerne profilen fra din konto: opslaget, navnet, adressen og alle anmeldelser forbliver synlige på Google. Guiden viser Googles officielle muligheder, hvad hver af dem reelt gør, og hvad der faktisk virker, hvis du vil slette din Google-virksomhedsprofil helt.",
  blocks: [
    { t: "lead", text: "Vil du **slette din Google-virksomhedsprofil** eller **fjerne din virksomhed fra Google** og Google Maps, venter der en overraskelse: Googles egen knap sletter ikke opslaget. Den fjerner kun din adgang. Her får du de officielle trin med Googles præcise danske menunavne, et overblik over hvad hver mulighed gør ved profilen og anmeldelserne – og den vej, der rent faktisk får profilen væk for altid." },

    { t: "tip", title: "Kort svar", text: "Du kan ikke bare slette en Google-virksomhedsprofil. Som ejer lader Google dig kun **fjerne profilen fra din konto** (Indstillinger for virksomhedsprofil → Fjern virksomhedsprofil) eller **markere virksomheden som permanent lukket**. I begge tilfælde bliver det offentlige opslag og **alle anmeldelser liggende i Google Søgning og Google Maps**. En fuldstændig fjernelse af opslaget – inklusive hver eneste anmeldelse – sker kun via de procedurer, Google stiller til rådighed. Det er netop det, RapidRemove håndterer på vegne af ejeren, med betaling først efter fjernelse." },

    { t: "note", title: "Bemærk", text: "Denne guide er et praktisk overblik og udgør ikke juridisk rådgivning. Ønsker du bindende rådgivning om din konkrete situation, så kontakt en kvalificeret rådgiver." },

    { t: "h2", id: "why", text: "Hvorfor der ikke findes en enkel »slet«-knap", toc: "Ingen slet-knap" },
    { t: "p", text: "Søger du på, hvordan du sletter en Google-virksomhedsprofil, rammer du hurtigt en mur. Du kan markere virksomheden som **»permanent lukket«** eller fjerne profilen fra din egen konto – men en tydelig knap med teksten **»slet dette opslag og alle anmeldelser«** findes ikke for virksomhedsejere." },
    { t: "p", text: "Det er ikke en forglemmelse, men et bevidst valg. Google skelner skarpt mellem din personlige Google-konto og den offentlige virksomhedsprofil (tidligere »Google My Business«). Profilen beskriver et virkeligt sted i verden, og Google betragter den og dens anmeldelser som nyttig information for brugerne. Set fra Googles side tilhører profilen derfor ikke dig – heller ikke selv om du administrerer den." },
    { t: "warn", title: "»Permanent lukket« ≠ slettet", text: "At markere virksomheden som lukket fjerner den **ikke**. Opslaget, navnet, adressen, billederne og **alle anmeldelser forbliver offentligt synlige** i Google Søgning og Google Maps – nu blot med et overstreget »Permanent lukket« ovenpå. For potentielle kunder ser det ofte **værre** ud end før." },

    { t: "h2", id: "official-steps", text: "Slet Google-virksomhedsprofil: Googles officielle trin", toc: "Officielle trin" },
    { t: "p", text: "I Googles egen formulering hedder muligheden for ejere **»Fjern virksomhedsprofil«**. Den findes – men den fjerner profilen fra *din konto*, ikke opslaget fra Google. Sådan fungerer den, så du ved præcis, hvad du gør (og ikke gør)." },
    { t: "h3", text: "På computeren" },
    { t: "ol", items: [
      "Log ind med den Google-konto, der ejer profilen, og gå til din virksomhedsprofil – via business.google.com eller ved at søge på dit firmanavn (eller »min virksomhed«) på Google.",
      "Vælg **Mere** (⋮) → **Indstillinger for virksomhedsprofil**.",
      "Vælg **Fjern virksomhedsprofil** → **Fjern profilindhold og administratorer**.",
      "Slå eventuelt **»Markér din virksomhed som permanent lukket«** til.",
      "Bekræft med **Fortsæt** → **Fjern** → **Udfør**.",
    ] },
    { t: "h3", text: "I Google Maps-appen" },
    { t: "p", text: "Åbn Google Maps-appen med ejerkontoen, gå til din virksomhedsprofil, og vælg **Mere** → **Indstillinger for virksomhedsprofil** → **Fjern virksomhedsprofil**. Trinene og resultatet er de samme som på computeren." },
    { t: "h3", text: "Flere profiler på én gang" },
    { t: "p", text: "Administrerer du flere lokationer, så åbn **Profiladministrator** på business.google.com, markér profilerne, og vælg øverst til højre **Handlinger** → **Fjern virksomheder** → **Fjern**. Opstår der en fejl, skal du ifølge Google fjerne indhold og administratorer for hver profil enkeltvis." },
    { t: "warn", title: "Hvad Google selv siger, der sker bagefter", text: "Ifølge Googles hjælpeside vises din virksomhed **muligvis stadig i Søgning og på Maps**, og **brugergenereret indhold og anmeldelser bevares**. Det, der slettes permanent, er kun *dit* indhold: opslag, billeder, videoer og svar på anmeldelser fra ejere og administratorer. Kun den **primære ejer** kan gøre det, og nye ejere og administratorer skal vente **7 dage**. Kort sagt: den officielle mulighed afslutter *din* administration af profilen – den sletter ikke profilen." },

    { t: "h2", id: "options", text: "Slet, luk, fjern ejere eller indberet: hvad hver mulighed reelt gør", toc: "Alle muligheder sammenlignet" },
    { t: "p", text: "Folk søger på »slet Google My Business«, »fjern Google-virksomhedsprofil«, »luk virksomhed på Google« eller »slet virksomhed på Google Maps« – men hos Google er det vidt forskellige handlinger. Sådan påvirker hver af dem det offentlige opslag og anmeldelserne:" },
    { t: "table", head: ["Mulighed", "Hvad det gør", "Profil synlig?", "Anmeldelser synlige?"], rows: [
      ["Fjern virksomhedsprofil (Googles »slet«)", "Fjerner profilen fra din konto; dine opslag, billeder og svar på anmeldelser slettes", "Ja – nu uden ejer", "Ja"],
      ["Markér som permanent lukket", "Sætter statussen »Permanent lukket« på opslaget", "Ja – med mærkatet »Permanent lukket«", "Ja"],
      ["Fjern ejere/administratorer", "Fjerner enkelte personers adgang til profilen", "Ja – uændret", "Ja"],
      ["Foreslå en ændring → »Stedet er lukket eller findes ikke« (Maps)", "Beder Google om at fjerne stedet – Google afgør selv", "Som regel ja – for virkelige virksomheder afvises forslaget ofte", "Ja, medmindre stedet fjernes"],
      ["Fuld fjernelse via RapidRemove", "Hele profilen fjernes via de procedurer, Google stiller til rådighed, på vegne af ejeren", "Nej – fjernet fra Søgning og Maps", "Nej – alle forsvinder med"],
    ] },
    { t: "p", text: "Endnu en kilde til forvirring: **Google My Business** er blot det gamle navn for **Google Virksomhedsprofil**. Om du kalder det din Google-virksomhedskonto, side, opslag eller profil – det er den samme post, og de samme regler gælder." },

    { t: "h2", id: "what-happens", text: "Hvad sker der, når du sletter din Google-virksomhedsprofil?", toc: "Hvad sker der bagefter?" },
    { t: "p", text: "Mange ejere forventer, at opslaget forsvinder, så snart de har fjernet det fra deres konto. Sådan ser virkeligheden ud:" },
    { t: "ul", items: [
      "**Din adgang ophører:** du og alle administratorer mister kontrollen over profilen. Vil du administrere den igen, skal den gøres krav på og verificeres forfra.",
      "**Dit indhold er væk:** opslag, de billeder og videoer, du har uploadet, og dine svar på anmeldelser slettes permanent og kan ikke gendannes.",
      "**Opslaget bliver:** navn, adresse, kategori og åbningstider forbliver som regel synlige i Google Søgning og Google Maps.",
      "**Anmeldelserne bliver:** hver eneste kundeanmeldelse – også falske eller urimelige – forbliver offentlig, nu **uden dine svar** ved siden af.",
      "**Alle kan redigere den:** en profil uden ejer kan ændres af brugere og af Google selv, og du får ikke længere besked om det.",
    ] },
    { t: "p", text: "Derfor gør det ofte tingene værre at fjerne profilen fra din konto: de negative anmeldelser står der stadig, men din side af historien er forsvundet." },

    { t: "h2", id: "start-over", text: "Kan jeg slette min Google-virksomhedsprofil og starte forfra?", toc: "Start forfra med ny profil" },
    { t: "p", text: "Ikke ved blot at oprette en ny. Findes det gamle opslag stadig – og det gør det efter »Fjern virksomhedsprofil« – ser Google en **anden profil for den samme virksomhed på den samme adresse**. Dubletter bliver som regel lagt sammen med det gamle opslag igen (anmeldelserne inklusive), eller den nye profil bliver suspenderet. Uanset hvad dukker de gamle anmeldelser op igen." },
    { t: "p", text: "En reel ny start sker i to trin: Først **fjernes den gamle profil fuldstændigt**, inklusive alle anmeldelser. Derefter opretter og verificerer du en **ren ny profil**, hvis du ønsker det. RapidRemove står for det første trin – til fastpris, som du først betaler efter fjernelse – og din hjemmeside og dine placeringer i søgeresultaterne forbliver uberørte." },

    { t: "h2", id: "google-maps", text: "Slet virksomhed på Google Maps: sådan fjerner du den fra Google", toc: "Slet på Google Maps" },
    { t: "p", text: "På Google Maps kan alle – ejer eller ej – bede Google om at fjerne et sted:" },
    { t: "ol", items: [
      "Log ind på din Google-konto, og åbn Google Maps på nettet eller i appen.",
      "Vælg virksomheden på kortet.",
      "Klik på **Foreslå en ændring** → **Stedet er lukket eller findes ikke**.",
      "Vælg en årsag, f.eks. **Findes ikke her** eller **Stødende, skadeligt eller vildledende**.",
      "Klik på **Send** – Google behandler forslaget og afgør selv sagen. Eventuelt får du en statusmail med opfølgende spørgsmål.",
    ] },
    { t: "p", text: "Ifølge Google fjernes en virksomhed kun, hvis den aldrig har eksisteret, eller hvis den ikke opfylder Googles retningslinjer for virksomhedsprofiler. For virkelige, eksisterende virksomheder bliver forslaget derfor som regel afvist eller ender med mærkatet »Permanent lukket« – opslaget og anmeldelserne bliver. Mere om egne, fremmede og dobbelte opslag: [slet Google Maps-profil](/da/magasin/fjern-google-maps-virksomhed/) og [slet virksomhed fra Google](/da/magasin/slet-virksomhed-fra-google/)." },

    { t: "h2", id: "no-delete-option", text: "Hvorfor du ikke kan se muligheden for at slette", toc: "Ingen slet-mulighed?" },
    { t: "p", text: "Mangler »Fjern virksomhedsprofil« i dine indstillinger, skyldes det næsten altid en af disse årsager:" },
    { t: "ul", items: [
      "**Du er administrator, ikke primær ejer.** Kun den primære ejer kan fjerne profilindhold og administratorer.",
      "**Du er først for nylig blevet ejer.** Nye ejere og administratorer skal vente 7 dage, før muligheden bliver tilgængelig.",
      "**Profilen er ikke verificeret eller gjort krav på af dig.** Så tilhører den ingen – eller en anden Google-konto.",
      "**Du er logget ind med den forkerte Google-konto.** Mange virksomheder har flere; tjek, hvilken der ejer profilen.",
    ] },
    { t: "p", text: "Og selv når du finder knappen, så husk resultatet: den fjerner profilen fra din konto, ikke fra Google." },

    { t: "h2", id: "how", text: "Sådan fungerer en fuld fjernelse af profilen", toc: "Sådan foregår fjernelsen" },
    { t: "p", text: "Den eneste pålidelige måde at få en profil og dens anmeldelser til at forsvinde på er en **fuldstændig fjernelse af hele virksomhedsprofilen** via de procedurer, Google stiller til rådighed – ikke at slette anmeldelser én for én. Når hele profilen fjernes, **forsvinder hver eneste anmeldelse med den**, også de falske. Det er forskellen på at behandle symptomer og at fjerne årsagen." },
    { t: "p", text: "Det er præcis det, RapidRemove gør på vegne af ejeren. Fordelene:" },
    { t: "ul", items: [
      "**Tempo:** profilen fjernes typisk inden for 24–48 timer frem for måneder",
      "**Fuldstændigt:** hele profilen, inklusive **alle** anmeldelser, på én gang",
      "**Forudsigeligt:** transparent fastpris, som du **først betaler efter fjernelse** – ingen åbne timepriser",
      "**Overvågning:** dukker profilen op igen via tredjeparter, fjerner vi den i beskyttelsesperioden uden beregning",
      "**SEO-venligt:** din hjemmeside, dine placeringer og dine Google Ads forbliver uberørte; en ren ny profil er valgfri",
      "**Diskret:** ingen korrespondance med anmelderne, ingen risiko for Streisand-effekten",
    ] },
    { t: "h3", text: "Sådan foregår det med RapidRemove" },
    { t: "ol", items: [
      "**Gratis tjek:** Indtast firmanavnet. Vi finder din profil og tjekker med det samme, om fjernelsen er mulig – uforpligtende og gratis.",
      "**Bekræft og godkend:** Du bekræfter den rigtige profil og giver os bearbejdningsgodkendelse. Ingen adgang til Gmail, Ads eller personlige data.",
      "**Fjernelse inden for 24–48 timer:** Vores team fjerner profilen med alle anmeldelser – permanent. Betaling sker først derefter.",
    ] },
    { t: "warn", title: "Vigtigt", text: "En fuld fjernelse sletter **hele profilen**, ikke en enkelt anmeldelse. Vil du kun af med én eller nogle få anmeldelser og beholde profilen, tilbyder vi også [fjernelse af enkelte anmeldelser](/da/fjern-anmeldelse/) – se næste afsnit." },

    { t: "cta", title: "Tjek gratis, om din profil kan slettes", text: "Indtast dit firmanavn – vi finder din rigtige Google-profil og tjekker på sekunder, om og hvor hurtigt den kan fjernes med alle anmeldelser. Uforpligtende og gratis.", btn: "Start gratis tjek", href: "/da/?start=1", trust: ["Gratis tjek", "Betaling først efter fjernelse"] },

    { t: "h2", id: "einzeln", text: "Enkeltanmeldelser eller hele profilen?", toc: "Anmeldelser eller profil?" },
    { t: "p", text: "Mange starter med at forsøge at [anmelde](/da/magasin/fjern-falske-google-anmeldelser/) individuelle dårlige anmeldelser til Google. Det er besværligt og usikkert: Google afviser anmeldelser hyppigt, hver enkelt anmeldelse skal begrundes separat – og for hver fjernet anmeldelse dukker der hurtigt nye op. Du bekæmper symptomerne." },
    { t: "p", text: "Er profilen beskadiget som helhed, rammer den holdbare tilgang ved roden: **Fjernes hele profilen, forsvinder alle anmeldelser på én gang** – inkl. falske anmeldelser. Endeligt frem for stykkevis. Er profilen derimod sund, og er det kun én eller nogle få anmeldelser, der gør skade, tilbyder vi også [fjernelse af enkelte anmeldelser](/da/fjern-anmeldelse/): Du vælger selv anmeldelserne, profilen og dine gode anmeldelser bliver stående, og du betaler kun for anmeldelser, der faktisk fjernes – 99 € pr. anmeldelse med tekst op til 4 uger gammel, 250 € for alle andre (ældre eller kun stjerner). Priser, succesrater og mængderabat finder du i [Få fjernet en Google-anmeldelse: pris og bestilling](/da/magasin/fjern-google-anmeldelse-service/); alle metoder sammenlignet under [Fjern Google-anmeldelser](/da/magasin/fjern-google-anmeldelser/)." },
    { t: "tip", title: "Den afgørende fordel", text: "En fjernet profil kan hverken vise gamle *eller* nye anmeldelser. Problemet er dermed ikke skubbet videre – det er løst." },

    { t: "h2", id: "kosten", text: "Hvor lang tid tager det – og hvad koster det?", toc: "Varighed og pris" },
    { t: "p", text: "En professionel fjernelse er typisk gennemført **inden for 24–48 timer** – frem for de måneder, advokatvejen sluger. Hvad angår pris: en advokat fakturerer pr. time (ofte 2.500 kr. og derover) uden sikkerhed for resultatet. RapidRemove arbejder med en **transparent fastpris fra 3.350 kr.** – og du betaler **udelukkende efter vellykket fjernelse**." },
    { t: "table", rrCol: 3, head: ["Kriterium", "Selv (DIY)", "Advokat", "RapidRemove"], rows: [
      ["Fuldstændig fjernelse mulig?", "Praktisk talt nej", "Usikkert", "Ja"],
      ["Varighed", "—", "3–9 måneder", "24–48 timer"],
      ["Omkostninger", "—", "2.500 kr.+/time", "Fastpris fra 3.350 kr."],
      ["Alle anmeldelser væk", "Nej", "Enkeltvis, besværligt", "Alle på én gang"],
      ["Betaling", "—", "Pr. time, uanset resultat", "Først efter fjernelse"],
      ["Dit tidsforbrug", "Højt", "Højt", "Praktisk talt nul"],
    ] },
    { t: "p", text: "DIY-vejen ender næsten altid ved »permanent lukket«. Advokatvejen er dyr, langsom og usikker – og udløser ikke sjældent [Streisand-effekten](/da/magasin/negativ-google-anmeldelse-advokat/), hvor opmærksomheden tværtimod stiger. Lyder fastprisen høj? Regn efter: Én enkelt synlig falsk anmeldelse kan sænke klikraten mærkbart og koster dig et mangefold over måneder." },

    { t: "h2", id: "herkunft", text: "Hvem oprettede egentlig denne profil?", toc: "Hvem oprettede den?" },
    { t: "p", text: "De fleste virksomhedsejere, der kontakter os, har aldrig selv oprettet deres profil – og er oprigtigt overraskede over, at den findes. Det er ikke undtagelsen, men reglen. En Google-virksomhedsprofil bliver sjældent oprettet aktivt af ejeren. Langt oftere er det en anden, der tilføjer den, eller Google, der genererer den helt automatisk. For at forstå, hvorfor en sådan profil bagefter er så svær at slippe af med, hjælper det at vide, hvordan den er havnet der. Der er grundlæggende tre veje." },
    { t: "anim", caption: "Tre måder, hvorpå en virksomhedsprofil opstår – næsten altid uden at ejeren foretager sig noget." },
    { t: "h3", text: "Vej 1: nogen tilføjer stedet manuelt" },
    { t: "p", text: "Enhver Google-bruger kan i Maps-appen trykke på en adresse eller et tomt sted og vælge »Tilføj et manglende sted«. På den måde kan en virksomhed registreres, uden at man har noget med den at gøre – det gør kunder, tidligere medarbejdere, konkurrenter eller meget aktive Maps-brugere (Local Guides)." },
    { t: "p", text: "Det sker dog ikke helt uden kontrol. Før et indberettet sted bliver synligt, kører en automatisk kontrol i baggrunden:" },
    { t: "ul", items: [
      "**Placering:** befinder brugeren sig faktisk i nærheden af det sted, han vil tilføje? Det forhindrer, at nogen i København for sjov opfinder en café i Aarhus.",
      "**Dubletkontrol:** findes der allerede et lignende navn eller den samme kategori på den koordinat eller lige ved siden af?",
      "**Sammenligning med nettet:** Google søger parallelt på navnet for at se, om virksomheden overhovedet dukker op online.",
    ] },
    { t: "p", text: "Hænger billedet sammen, bliver punktet offentliggjort – synligt for alle som en **profil, ingen har gjort krav på** (unclaimed)." },
    { t: "h3", text: "Vej 2: Google opretter selv profilen ud fra webdata" },
    { t: "p", text: "Det er den vej, færrest regner med: Google opretter profiler i stort antal på eget initiativ – uden ejerens medvirken eller samtykke. Grunden er enkel: Google vil kortlægge den virkelige verden så fuldstændigt som muligt og venter ikke på, at en ny virksomhed melder sig." },
    { t: "p", text: "Til det gennemsøger Googles crawlere løbende nettet for såkaldte **NAP-data** – navn, adresse, telefon (*Name, Address, Phone*). Ud fra disse fragmenter samler systemet en profil, udløst for eksempel af:" },
    { t: "ul", items: [
      "**Strukturerede data på websitet:** indlejrer en virksomheds side den standardiserede `LocalBusiness`-markup i kildekoden (maskinlæsbare oplysninger ifølge Schema.org), læser Google adresse, telefon og åbningstider direkte og rent.",
      "**Digitale fodspor på nettet:** Google kombinerer oplysninger fra Facebook-sider, Instagram-profiler, omtaler i lokale medier og opslag i online telefonbøger.",
      "**Konsistenstjek:** dukker den samme virksomhed med samme adresse op flere gange på samme måde – på eget website, på Facebook og i en lokal blog – opretter Google automatisk en ny Maps-profil ud fra det.",
    ] },
    { t: "p", text: "De fleste ejere opdager det først, når de pludselig ser knappen »Gør krav på denne virksomhed« på kortet." },
    { t: "h3", text: "Vej 3: masseimport fra officielle registre" },
    { t: "p", text: "Den tredje vej undervurderes ofte: Google indlæser data i stor skala fra officielle kilder og fra dataaggregatorer, som Google har aftaler med." },
    { t: "ul", items: [
      "**Virksomhedsregistre:** så snart en virksomhed registreres hos myndighederne eller i virksomhedsregistret, strømmer disse data til Google med jævne mellemrum – som regel via mellemliggende databaser.",
      "**Branchekataloger:** Google sammenholder sine kort med De Gule Sider og telefonregistrene i hvert land. En ny post dér kan automatisk udløse et nyt punkt på Maps.",
    ] },
    { t: "p", text: "Sådan kan en profil dukke op kort efter, at du har registreret din virksomhed – uden at du nogensinde selv har været hos Google." },
    { t: "p", text: "**Derfor er det vigtigt:** Uanset hvordan profilen er opstået, er konsekvensen den samme: så snart den findes, samler den anmeldelser og dukker op i Søgning og Maps. Du behøver hverken at have oprettet den eller administrere den for at være berørt – og netop derfor er det ikke nok bare at ignorere den. Den skal stadig fjernes aktivt." },

    { t: "cta", title: "Klar til at få profilen fjernet for altid?", text: "På få sekunder ser du din rigtige profil og får at vide, om og hvor hurtigt vi kan fjerne den. Ingen forudbetaling, ingen forpligtelse.", btn: "Start gratis tjek", href: "/da/?start=1", trust: ["Nul risiko", "Betaling først efter fjernelse"] },
  ],
  faq: [
    { q: "Kan jeg selv slette min Google-virksomhedsprofil?", a: "Kun i begrænset omfang. Du kan fjerne profilen fra din konto eller markere den som »permanent lukket«, men ingen af delene sletter det offentlige opslag – det forbliver synligt i Søgning og Maps med alle anmeldelser. En fuldstændig fjernelse sker via de procedurer, Google stiller til rådighed." },
    { q: "Hvordan sletter jeg Google My Business permanent?", a: "Gå i din virksomhedsprofil til Mere → Indstillinger for virksomhedsprofil → Fjern virksomhedsprofil → Fjern profilindhold og administratorer, og bekræft med Fortsæt → Fjern → Udfør. Det afslutter din administration permanent og sletter dine opslag, billeder og svar på anmeldelser – men selve opslaget og anmeldelserne bliver som regel på Google. Skal opslaget væk, skal hele profilen fjernes via Googles officielle procedurer." },
    { q: "Er »permanent lukket« det samme som slettet?", a: "Nej. Opslaget, navnet, adressen og alle anmeldelser forbliver offentlige; der kommer blot et overstreget »Permanent lukket« på. Det ser ofte værre ud end før." },
    { q: "Hvad sker der, hvis jeg sletter min Google-virksomhedsprofil?", a: "Du mister adgangen, og dine opslag, billeder, videoer og svar på anmeldelser slettes. Ifølge Google vises virksomheden muligvis stadig i Søgning og på Maps, og anmeldelserne bevares – og alle kan nu foreslå ændringer til opslaget." },
    { q: "Kan jeg slette min Google-virksomhedsprofil og starte forfra?", a: "Kun hvis den gamle profil først fjernes fuldstændigt. En ny profil for den samme virksomhed på den samme adresse behandles som en dublet og bliver som regel lagt sammen med den gamle igen – anmeldelserne inklusive – eller suspenderet." },
    { q: "Hvordan fjerner jeg min virksomhed fra Google Maps?", a: "Alle kan åbne stedet i Google Maps og vælge »Foreslå en ændring« → »Stedet er lukket eller findes ikke«. Google afgør selv sagen og fjerner kun steder, der ikke findes eller ikke opfylder retningslinjerne; virkelige virksomheder bliver som regel stående eller markeres som lukket. En fuldstændig fjernelse af opslaget og anmeldelserne sker via Googles officielle procedurer." },
    { q: "Hvordan fjerner jeg en virksomhed fra Google, som ikke er min?", a: "Du kan foreslå fjernelse via »Foreslå en ændring« på Google Maps, også selv om du ikke ejer profilen. Google fjerner dog kun stedet, hvis det aldrig har eksisteret eller ikke opfylder Googles retningslinjer. Er det din egen virksomhed, der er oprettet af andre, kan profilen fjernes på vegne af ejeren." },
    { q: "Hvorfor kan jeg ikke se muligheden for at slette i min virksomhedsprofil?", a: "Som regel fordi du er administrator og ikke primær ejer, fordi du er blevet ejer for mindre end 7 dage siden, fordi profilen ikke er verificeret under din konto, eller fordi du er logget ind med en anden Google-konto." },
    { q: "Er Google My Business det samme som Google Virksomhedsprofil?", a: "Ja. Google My Business er det gamle navn for Google Virksomhedsprofil. Google-virksomhedskonto, side, opslag eller profil dækker alle over den samme post." },
    { q: "Forsvinder alle anmeldelser også?", a: "Ja, ved en fuld fjernelse. Fjernes hele virksomhedsprofilen, forsvinder alle tilknyttede anmeldelser på én gang – inkl. falske anmeldelser og hævnanmeldelser. Ved Googles egen »Fjern virksomhedsprofil« bliver anmeldelserne derimod stående." },
    { q: "Hvor lang tid tager det at få fjernet profilen?", a: "Profilen er typisk fjernet inden for 24–48 timer. Den præcise status kan du til enhver tid følge i kundeportalen." },
    { q: "Påvirker fjernelsen mit SEO, min hjemmeside eller Google Ads?", a: "Nej. Det, der fjernes, er udelukkende virksomhedsprofilen (Google Maps / Google Virksomhedsprofil). Din hjemmeside, din Google-konto, din placering i søgeresultaterne og dine kampagner forbliver uændrede. En ren ny profil kan oprettes bagefter, hvis du ønsker det." },
    { q: "Hvad koster det at få fjernet en Google-virksomhedsprofil?", a: "RapidRemove arbejder med en transparent fastpris fra 3.350 kr. – og du betaler udelukkende efter vellykket fjernelse (No Cure, No Pay). Skal kun enkelte anmeldelser væk, koster [fjernelse af enkelte anmeldelser](/da/fjern-anmeldelse/) 99 € pr. anmeldelse med tekst op til 4 uger gammel og 250 € for alle andre (ældre eller kun stjerner) – kun for anmeldelser, der faktisk fjernes." },
    { q: "Kan profilen dukke op igen bagefter?", a: "Tredjeparter kan teoretisk oprette en ny profil. Med den valgfrie overvågning holder vi øje med dit opslag og fjerner en eventuel ny profil i beskyttelsesperioden uden beregning." },
    { q: "Er det tilladt at få fjernet en Google-virksomhedsprofil?", a: "Fjernelsen sker via de procedurer, Google stiller til rådighed, på vegne af ejeren. Din Google-konto, Gmail og eventuelle Ads-konti forbliver fuldstændig uberørte." },
  ],
};
export default article;
