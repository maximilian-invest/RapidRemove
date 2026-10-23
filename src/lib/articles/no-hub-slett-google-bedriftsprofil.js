/* NO hub: "Slette Google-bedriftsprofil" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile.js):
   Kurzantwort, Googles offizielle Schritte (Computer / Maps-App / mehrere Profile),
   Vergleichstabelle der Optionen, eigene Abschnitte je Suchintention
   (what happens / start over / Google Maps / no delete option), „Wer hat das Profil
   angelegt?" ans Ende verschoben, FAQ auf 15 erweitert.
   KERNBOTSCHAFT UNVERÄNDERT: „permanent stengt" bzw. „Fjern bedriftsprofil" ist kein
   Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige Entfernung
   läuft über die von Google angebotenen Verfahren, im Auftrag des Inhabers.
   Preise unverändert (ab 450 € Profil; Einzelbewertung 179 € / 250 €). */
const article = {
  meta: {
    slug: "slett-google-bedriftsprofil",
    title: "Slette Google-bedriftsprofil: 4 alternativer (2026)",
    h1: "Slette Google-bedriftsprofil – slik fjerner du bedriften fra Google for godt",
    description: "Googles steg fjerner bare tilgangen din – oppføringen og alle anmeldelser blir på Maps. Hva de 4 alternativene gjør, og hvordan du fjerner den for godt.",
    author: "Maximilian Hölzl",
    authorRole: "Google-ekspert og grunnlegger",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "slette google bedriftsprofil",
      "slette google-bedriftsprofil permanent",
      "fjerne google bedriftsprofil",
      "fjerne bedrift fra google",
      "slette bedrift på google maps",
      "fjerne bedrift fra google maps",
      "slette google my business",
      "fjerne bedriftsprofil google",
    ],
  },
  category: "Googles retningslinjer",
  iconKey: "trash",
  readingMin: 14,
  dek: "«Permanent stengt» er ikke det samme som slettet – og det er heller ikke å fjerne profilen fra kontoen din: oppføringen, navnet, adressen og alle anmeldelser blir liggende synlig på Google. Her ser du Googles offisielle alternativer, hva hvert av dem faktisk gjør, og hva som virker når du vil slette Google-bedriftsprofilen helt.",
  blocks: [
    { t: "note", title: "Merk", text: "Denne veiledningen er en praktisk oversikt og ikke juridisk rådgivning. Trenger du en bindende vurdering av din situasjon, bør du kontakte en fagperson." },

    { t: "lead", text: "Vil du **slette Google-bedriftsprofilen** din eller **fjerne bedriften fra Google** helt? Da møter du raskt en overraskelse: Google lar deg som eier bare avslutte *din egen* administrasjon av profilen – selve oppføringen på Google Søk og Google Maps blir som regel liggende, med alle anmeldelser. Denne veiledningen viser deg hvert alternativ steg for steg, hva det faktisk gjør, og hvilken vei som fjerner profilen for godt." },

    { t: "tip", title: "Kort svar", text: "Du kan ikke bare slette en Google-bedriftsprofil. Som eier lar Google deg bare **fjerne profilen fra kontoen din** (Innstillinger for bedriftsprofil → Fjern bedriftsprofil) eller **merke bedriften som permanent stengt**. I begge tilfeller blir den offentlige oppføringen og **alle anmeldelser liggende på Google Søk og Google Maps**. En fullstendig fjerning av oppføringen – inkludert hver eneste anmeldelse – skjer bare via prosedyrene Google tilbyr, på vegne av eieren. Det er nettopp det RapidRemove tar seg av, og du betaler først etter at profilen er fjernet." },

    { t: "h2", id: "why", text: "Hvorfor det ikke finnes en enkel «slett»-knapp", toc: "Ingen slett-knapp" },
    { t: "p", text: "Søker du etter hvordan du sletter en Google-bedriftsprofil, støter du fort på en vegg. Du kan merke bedriften som **«permanent stengt»** eller fjerne den fra din egen konto – men en tydelig knapp for **«slett denne oppføringen og alle anmeldelser»** finnes ikke for eiere. Det er ingen glipp: Google skiller strengt mellom din personlige Google-konto og den offentlige bedriftsprofilen (tidligere «Google My Business»). Profilen beskriver et virkelig sted i verden, og Google betrakter den og anmeldelsene som nyttig informasjon for brukerne. Derfor tilhører den i Googles øyne ikke deg – selv om du administrerer den." },
    { t: "warn", title: "«Permanent stengt» ≠ slettet", text: "Å merke bedriften som stengt fjerner den **ikke**. Oppføringen, navnet, adressen, bildene og **alle anmeldelser forblir offentlig synlige** i Google Søk og Google Maps – nå med en tydelig etikett «Permanent stengt» over det hele. For potensielle kunder ser det ofte **verre** ut enn før." },
    { t: "p", text: "En **ekte sletting** derimot fjerner hele [Google Maps-oppføringen](/no/magasin/fjern-google-maps-oppforing/) inkludert alle anmeldelser – den finnes da verken i Søk eller på Maps." },

    { t: "h2", id: "official-steps", text: "Slette Google-bedriftsprofil: Googles offisielle steg", toc: "Googles offisielle steg" },
    { t: "p", text: "I Googles egen ordlyd heter eieralternativet **«Fjern bedriftsprofilen»**. Det finnes – men det fjerner profilen fra *kontoen din*, ikke oppføringen fra Google. Slik fungerer det, så du vet nøyaktig hva du gjør (og ikke gjør)." },
    { t: "h3", text: "På datamaskinen (Google Søk)" },
    { t: "ol", items: [
      "Logg inn med Google-kontoen som eier profilen, og søk etter bedriftsnavnet ditt (eller «min bedrift»).",
      "Åpne **Mer** (⋮) i bedriftsprofilen → **Innstillinger for bedriftsprofil**.",
      "Velg **Fjern bedriftsprofilen** → **Fjern innholdet og administratorene fra profilen**.",
      "Valgfritt: huk av for **«Merk bedriften din som nedlagt»**.",
      "Bekreft med **Fortsett** → **Fjern** → **Ferdig**.",
    ] },
    { t: "h3", text: "I Google Maps-appen" },
    { t: "p", text: "Åpne Google Maps-appen med eierkontoen, gå til bedriftsprofilen din og velg **Mer** → **Innstillinger for bedriftsprofil** → **Fjern bedriftsprofilen**. Stegene og resultatet er de samme som på datamaskinen." },
    { t: "h3", text: "Flere profiler samtidig" },
    { t: "p", text: "Administrerer du flere lokasjoner, åpner du **Administrering av Bedriftsprofil**, huker av profilene og velger **Handlinger** → **Fjern bedrifter** → **Fjern**." },
    { t: "warn", title: "Hva Google selv sier skjer etterpå", text: "Ifølge Googles egne hjelpesider **forblir kundeanmeldelsene synlige**, og bedriften **kan fortsatt vises i Søk og Maps**. Bare *ditt* innhold slettes: innlegg, bilder du har lastet opp og svarene dine på anmeldelser. Bare **primæreieren** kan gjøre dette, og nye eiere må vente **7 dager**. Kort sagt: det offisielle alternativet avslutter *din* administrasjon av profilen – det sletter ikke profilen." },

    { t: "h2", id: "options", text: "Slette, stenge eller fjerne: hva hvert alternativ faktisk gjør", toc: "Alle alternativer sammenlignet" },
    { t: "p", text: "Folk søker etter «slette Google My Business», «fjerne Google-bedriftsprofil», «stenge bedriften på Google» eller «slette bedrift på Google Maps» – men hos Google er dette svært ulike handlinger. Slik påvirker hvert alternativ den offentlige oppføringen og anmeldelsene:" },
    { t: "table", head: ["Alternativ", "Hva det gjør", "Profil synlig?", "Anmeldelser synlige?"], rows: [
      ["Slett / «Fjern bedriftsprofilen»", "Avslutter administrasjonen din, sletter innleggene, bildene og svarene dine", "Ja, nå uten administrator", "Ja"],
      ["Merk som permanent stengt", "Setter statusen «Permanent stengt» på oppføringen", "Ja, med etiketten «Permanent stengt»", "Ja"],
      ["Fjern eiere/administratorer", "Tar bort enkeltpersoners tilgang til profilen", "Ja, uendret", "Ja"],
      ["Foreslå «fjern» på Maps (alle)", "Sender et endringsforslag som Google vurderer selv", "Google avgjør – avvises ofte", "Ja, med mindre oppføringen fjernes"],
      ["Full fjerning via RapidRemove", "Fjerner hele profilen via prosedyrene Google tilbyr, på vegne av eieren", "Nei – borte fra Søk og Maps", "Nei – alle fjernes samtidig"],
    ] },
    { t: "p", text: "Én kilde til forvirring til: **Google My Business** er rett og slett det gamle navnet på **Google-bedriftsprofil**. Om du kaller det bedriftskonto, bedriftsside, oppføring eller profil – det er den samme oppføringen, og de samme reglene gjelder." },

    { t: "h2", id: "what-happens", text: "Hva skjer hvis du sletter Google-bedriftsprofilen?", toc: "Hva skjer etter sletting" },
    { t: "p", text: "Mange eiere forventer at oppføringen forsvinner så snart de har fjernet den fra kontoen. Dette er hva som faktisk skjer:" },
    { t: "ul", items: [
      "**Tilgangen din opphører:** du og alle administratorer mister kontrollen over profilen. For å administrere den igjen må den gjøres krav på og verifiseres på nytt.",
      "**Innholdet ditt er borte:** innlegg, bildene du har lastet opp og svarene dine på anmeldelser slettes permanent og kan ikke gjenopprettes.",
      "**Oppføringen blir liggende:** navn, adresse, kategori og åpningstider forblir som regel synlige i Google Søk og Google Maps.",
      "**Anmeldelsene blir liggende:** hver eneste kundeanmeldelse – også falske eller urettferdige – forblir offentlig, nå **uten svarene dine** ved siden av.",
      "**Alle kan endre den:** en profil uten administrator kan endres av brukere og av Google selv, og du blir ikke lenger varslet.",
    ] },
    { t: "p", text: "Derfor gjør det ofte vondt verre å fjerne profilen fra kontoen: de negative anmeldelsene står der fortsatt, men din side av saken er borte." },

    { t: "h2", id: "start-over", text: "Kan jeg slette Google-bedriftsprofilen og starte på nytt?", toc: "Starte på nytt" },
    { t: "p", text: "Ikke ved å bare opprette en ny. Finnes den gamle oppføringen fortsatt – og det gjør den etter «Fjern bedriftsprofilen» – ser Google en **ny profil for samme bedrift på samme adresse**. Slike duplikater slås som regel sammen med den gamle oppføringen igjen (anmeldelsene inkludert), eller den nye profilen blir suspendert. Uansett kommer de gamle anmeldelsene tilbake." },
    { t: "p", text: "En ekte ny start skjer i to steg: først **fjernes den gamle profilen fullstendig**, inkludert alle anmeldelser; deretter oppretter og verifiserer du en **ren ny profil**, hvis du ønsker det. RapidRemove tar seg av det første steget – til fastpris, betalt først etter fjerning – og nettstedet ditt og rangeringen din i søket forblir urørt." },

    { t: "h2", id: "google-maps", text: "Slette bedrift på Google Maps: slik fungerer det", toc: "Slette på Google Maps" },
    { t: "p", text: "På Google Maps kan hvem som helst – eier eller ikke – be Google om å stenge eller fjerne et sted:" },
    { t: "ol", items: [
      "Åpne stedet i Google Maps eller Google Søk.",
      "Velg **Foreslå en endring** → **Steng eller fjern** (i enkelte versjoner heter det **Rapporter som stengt eller fjern**).",
      "Velg en årsak, for eksempel permanent stengt, finnes ikke, duplikat eller spam.",
      "Send inn – Google vurderer forslaget og avgjør på egen hånd.",
    ] },
    { t: "p", text: "For virkelige, eksisterende bedrifter blir slike forslag som regel avvist eller omgjort til etiketten «Permanent stengt» – oppføringen og anmeldelsene blir liggende. Mer om egne, fremmede og doble oppføringer: [fjern en Google Maps-oppføring](/no/magasin/fjern-google-maps-oppforing/) og [slett bedriften fra Google](/no/magasin/slett-bedrift-fra-google/)." },

    { t: "h2", id: "no-delete-option", text: "Hvorfor du ikke ser noe alternativ for å slette", toc: "Ser ikke slett-valget?" },
    { t: "p", text: "Mangler «Fjern bedriftsprofilen» i innstillingene dine, skyldes det nesten alltid én av disse grunnene:" },
    { t: "ul", items: [
      "**Du er administrator, ikke primæreier.** Bare primæreieren kan fjerne profilinnhold og administratorer.",
      "**Du ble eier nylig.** Nye eiere må vente 7 dager før alternativet blir tilgjengelig.",
      "**Profilen er ikke verifisert eller gjort krav på av deg.** Da tilhører den ingen – eller en annen Google-konto.",
      "**Du er logget inn med feil Google-konto.** Mange bedrifter har flere; sjekk hvilken som eier profilen.",
    ] },
    { t: "p", text: "Og selv om du finner knappen: husk resultatet. Den fjerner profilen fra kontoen din, ikke fra Google." },
    { t: "cta", title: "Vil du heller sjekke direkte om profilen din kan fjernes?", text: "Skriv inn firmanavnet – vi finner den faktiske Google-profilen din og sjekker på sekunder om og hvor raskt den kan fjernes. Uforpliktende og gratis.", btn: "Start gratis sjekk", href: "/no/?start=1", trust: ["Gratis sjekk", "Betaling først etter fjerning"] },

    { t: "h2", id: "how", text: "Slik fungerer en fullstendig fjerning med RapidRemove", toc: "Slik fungerer fjerningen" },
    { t: "p", text: "Den eneste pålitelige måten å få en profil og anmeldelsene til å forsvinne på, er en **fullstendig fjerning av bedriftsprofilen** – ikke å slette anmeldelser én og én. Når hele profilen fjernes, **forsvinner alle anmeldelser samtidig**, også de falske. Det er forskjellen på å behandle symptomene og å fjerne årsaken." },
    { t: "ol", items: [
      "**Gratis sjekk:** Skriv inn firmanavnet. Vi finner profilen din og sjekker umiddelbart om fjerningen er mulig – uforpliktende og gratis.",
      "**Bekreft og gi tillatelse:** Du bekrefter riktig profil og gir oss oppdraget som eier. Vi får ingen tilgang til Gmail, Google Ads eller personlige data.",
      "**Fjerning innen 24–48 timer:** Vi gjennomfører fjerningen via prosedyrene Google tilbyr, på vegne av eieren – profilen forsvinner med alle anmeldelser. Du betaler først etterpå.",
    ] },
    { t: "p", text: "De viktigste fordelene:" },
    { t: "ul", items: [
      "**Raskt:** profilfjerning normalt på 24–48 timer i stedet for måneder",
      "**Fullstendig:** hele profilen, inkludert **alle** anmeldelser, på én gang",
      "**Forutsigbart:** fastpris, betalt **først etter fjerning** – ingen åpne timepriser",
      "**Overvåking (valgfritt):** dukker profilen opp igjen via tredjeparter, fjerner vi den uten tilleggskostnad i beskyttelsesperioden",
      "**SEO-vennlig:** nettstedet og rangeringen din forblir uendret; en ren ny profil er valgfri",
      "**Diskret:** ingen kontakt med anmelderne, ingen Streisand-risiko",
    ] },
    { t: "p", text: "Din Google-konto, Gmail og eventuelle Google Ads-kontoer forblir helt upåvirket – det samme gjelder nettstedet ditt, den organiske rangeringen din og kampanjene dine. En seriøs leverandør kjenner du igjen på at de oppgir et reelt firma med adresse og organisasjonsnummer, er åpne om fremgangsmåten og **fakturerer først etter resultat** – ikke på vage løfter om «hemmelig tilgang til Google»." },

    { t: "h2", id: "single-vs-profile", text: "Slette enkeltanmeldelser eller fjerne hele profilen?", toc: "Anmeldelser eller profil?" },
    { t: "p", text: "Mange starter med å forsøke å [melde inn](/no/magasin/fjern-falske-google-anmeldelser/) enkeltanmeldelser til Google. Det er møysommelig og usikkert: Google avviser innmeldinger ofte, hver anmeldelse må begrunnes separat – og for hver anmeldelse som fjernes, kan det raskt dukke opp nye. Du kjemper mot symptomene." },
    { t: "p", text: "Den bærekraftige tilnærmingen går til roten av problemet: **Fjernes hele profilen, forsvinner alle anmeldelser på én gang** – inkludert falske anmeldelser. Ved profilfjerning går vi derfor bevisst ikke anmeldelse for anmeldelse, men fjerner hele profilen." },
    { t: "warn", title: "Viktig", text: "Full fjerning sletter **hele profilen**, ikke én enkelt anmeldelse. Er profilen din ellers sunn, og det bare er én eller noen få urettferdige anmeldelser som plager deg, tilbyr RapidRemove også [fjerning av enkeltomtaler](/no/fjern-omtale/): fra 179 € per fjernet anmeldelse (med tekst, maks. 4 uker gammel; ellers 250 €), betaling kun ved suksess ([pris og sjanser forklart](/no/magasin/fjern-google-anmeldelse-tjeneste/)). Alle metoder og kostnader for å [fjerne Google-anmeldelser](/no/magasin/fjern-google-anmeldelser/) finner du sammenlignet her." },
    { t: "tip", title: "Den avgjørende fordelen", text: "En fjernet profil kan ikke vise frem gamle eller nye anmeldelser. Problemet er dermed ikke utsatt, men løst." },

    { t: "h2", id: "kosten", text: "Hvor lang tid tar det – og hva koster det?", toc: "Tid og kostnad" },
    { t: "p", text: "Realistisk sett finnes det tre veier til å bli kvitt en uønsket profil – med svært ulike resultater:" },
    { t: "table", rrCol: 3, head: ["Kriterium", "Selv (DIY)", "Advokat", "RapidRemove"], rows: [
      ["Fullstendig fjerning mulig?", "Praktisk talt nei", "Usikkert", "Ja"],
      ["Tidsbruk", "—", "3–9 måneder", "24–48 timer"],
      ["Kostnad", "—", "300 €+ / time", "Fastpris fra 450 €"],
      ["Alle anmeldelser fjernet", "Nei", "Enkeltvis, møysommelig", "Alle på én gang"],
      ["Betaling", "—", "Per time, uavhengig av resultat", "Først etter fjerning"],
      ["Din innsats", "Høy", "Høy", "Praktisk talt null"],
    ] },
    { t: "p", text: "DIY-veien ender nesten alltid med «permanent stengt». Advokatveien er dyr, treg og usikker – og utløser ikke sjelden [Streisand-effekten](/no/magasin/negativ-google-anmeldelse-advokat/), der oppmerksomheten rundt saken øker ytterligere. En profesjonell fjerning er som regel ferdig **innen 24–48 timer**. RapidRemove opererer med en **transparent fastpris fra 450 €** – og du betaler **først etter fjerning**." },
    { t: "p", text: "Virker prisen høy? Regnestykket er enkelt: Én synlig falsk anmeldelse kan senke klikkraten merkbart og koste deg et mangedobbelt beløp over tid." },

    { t: "h2", id: "herkunft", text: "Hvem opprettet egentlig denne profilen?", toc: "Hvem opprettet den?" },
    { t: "p", text: "De fleste bedriftseierne som kontakter oss, har aldri opprettet profilen selv – og er oppriktig overrasket over at den finnes. Det er ikke unntaket, men regelen. En Google-bedriftsprofil opprettes sjelden aktivt av eieren. Langt oftere er det noen andre som legger den til, eller Google som genererer den helt automatisk. For å forstå hvorfor en slik oppføring senere er så vanskelig å bli kvitt, hjelper det å først vite hvordan den havnet der. I hovedsak finnes det tre veier." },
    { t: "anim", caption: "Tre måter en bedriftsprofil oppstår på – nesten alltid uten at eieren gjør noe." },
    { t: "h3", text: "Vei 1: noen legger til stedet for hånd" },
    { t: "p", text: "Enhver Google-bruker kan i Maps-appen trykke på en adresse eller et tomt område og velge «Legg til et sted som mangler». På den måten kan en bedrift registreres uten at man har noe med den å gjøre – det gjør kunder, tidligere ansatte, konkurrenter eller svært aktive Maps-brukere (Local Guides)." },
    { t: "p", text: "Det skjer likevel ikke helt uten kontroll. Før et innmeldt sted blir synlig, kjører en automatisk kontroll i bakgrunnen:" },
    { t: "ul", items: [
      "**Posisjon:** befinner brukeren seg faktisk i nærheten av stedet som skal legges til? Det hindrer at noen i Bergen på spøk finner opp en kafé i Oslo.",
      "**Dublettsjekk:** finnes det allerede et lignende navn eller samme kategori på den koordinaten eller rett ved siden av?",
      "**Sammenligning med nettet:** Google søker parallelt på navnet for å se om bedriften i det hele tatt dukker opp på nett.",
    ] },
    { t: "p", text: "Henger bildet sammen, blir punktet publisert – synlig for alle som en **profil det ikke er gjort krav på** (unclaimed)." },
    { t: "h3", text: "Vei 2: Google oppretter profilen selv ut fra nettdata" },
    { t: "p", text: "Det er veien de færreste regner med: Google oppretter profiler i stort antall på eget initiativ – uten eierens medvirkning eller samtykke. Grunnen er enkel: Google vil kartlegge den virkelige verden så fullstendig som mulig og venter ikke på at en ny bedrift skal melde seg." },
    { t: "p", text: "For å klare det gjennomsøker Googles crawlere stadig nettet etter såkalte **NAP-data** – navn, adresse, telefon (*Name, Address, Phone*). Av disse fragmentene setter systemet sammen en profil, utløst for eksempel av:" },
    { t: "ul", items: [
      "**Strukturerte data på nettstedet:** legger en bedrifts side inn den standardiserte `LocalBusiness`-markeringen i kildekoden (maskinlesbare opplysninger ifølge Schema.org, den internasjonale standarden for strukturerte data), leser Google av adresse, telefon og åpningstider direkte og rent.",
      "**Digitale spor på nettet:** Google kombinerer opplysninger fra Facebook-sider, Instagram-profiler, omtaler i lokale medier og oppføringer i nettkataloger.",
      "**Konsistenssjekk:** dukker den samme bedriften med samme adresse opp flere ganger samstemt – på eget nettsted, på Facebook og i en lokal blogg – oppretter Google automatisk en ny Maps-oppføring av det.",
    ] },
    { t: "p", text: "De fleste eiere oppdager det først når de plutselig ser knappen «Gjør krav på denne bedriften» på kartet." },
    { t: "h3", text: "Vei 3: masseimport fra offentlige registre" },
    { t: "p", text: "Den tredje veien undervurderes ofte: Google henter inn data i stor skala fra offisielle kilder og fra dataaggregatorer man har avtaler med." },
    { t: "ul", items: [
      "**Foretaks- og handelsregistre:** så snart en bedrift registreres hos myndigheten eller i foretaksregistret, strømmer disse dataene til Google med jevne mellomrom – som regel via mellomliggende databaser.",
      "**Bransjekataloger:** Google sammenstiller kartene sine med Gule Sider og telefonregistrene i hvert land. En ny oppføring der kan automatisk utløse et nytt punkt på Maps.",
    ] },
    { t: "p", text: "Slik kan en profil dukke opp kort etter at du har registrert bedriften din – uten at du noen gang selv har vært hos Google." },
    { t: "p", text: "**Hvorfor dette er viktig:** Uansett hvordan profilen oppsto, blir følgen den samme: så snart den finnes, samler den anmeldelser og vises i Søk og Maps. Du trenger verken å ha opprettet den eller å administrere den for å bli berørt – og nettopp derfor holder det ikke å bare overse den. Den må likevel fjernes aktivt." },

    { t: "h2", id: "fazit", text: "Konklusjon: den raskeste veien til et rent søkeresultat", toc: "Konklusjon" },
    { t: "p", text: "Å slette en Google-bedriftsprofil selv mislykkes i praksis nesten alltid på grunn av Googles eget system: «Fjern bedriftsprofilen» avslutter bare din tilgang, og «permanent stengt» er bare en etikett – oppføringen og anmeldelsene blir liggende. Den pålitelige veien er en fullstendig fjerning av hele profilen inkludert alle anmeldelser, via prosedyrene Google tilbyr, på vegne av eieren. Raskt, varig og forutsigbart – og du betaler først etter fjerning." },

    { t: "cta", title: "Sjekk gratis nå om profilen din kan fjernes", text: "På noen sekunder ser du den faktiske profilen din og får vite om og hvor raskt vi kan fjerne den. Ingen forskuddsbetaling, ingen forpliktelse.", btn: "Start gratis sjekk", href: "/no/?start=1", trust: ["Gratis sjekk", "Betaling først etter fjerning"] },
  ],
  faq: [
    { q: "Hvordan sletter jeg Google-bedriftsprofilen min?", a: "I bedriftsprofilen går du til Mer → Innstillinger for bedriftsprofil → Fjern bedriftsprofil → Fjern innholdet og administratorene fra profilen. Det avslutter administrasjonen din og sletter innleggene, bildene og svarene dine – men den offentlige oppføringen og anmeldelsene blir som regel liggende på Google. Skal selve oppføringen bort, må den fjernes via prosedyrene Google tilbyr, på vegne av eieren." },
    { q: "Kan jeg slette Google-bedriftsprofilen selv?", a: "Bare i begrenset grad. Du kan merke den som «permanent stengt» eller fjerne den fra kontoen din, men ingen av delene sletter den offentlige oppføringen – den forblir synlig i Søk og Maps med alle anmeldelser." },
    { q: "Hvordan sletter jeg Google My Business permanent?", a: "Google My Business er det gamle navnet på Google-bedriftsprofil, så stegene er de samme: Fjern bedriftsprofil i innstillingene. Det sletter din tilgang og ditt innhold permanent, men ikke oppføringen. En permanent fjerning av selve oppføringen og alle anmeldelser skjer via prosedyrene Google tilbyr, på vegne av eieren." },
    { q: "Er «permanent stengt» det samme som slettet?", a: "Nei. Oppføringen, navnet, adressen og alle anmeldelser forblir offentlige; det legges bare til en etikett «Permanent stengt». Det ser ofte verre ut enn før." },
    { q: "Hva skjer hvis jeg sletter Google-bedriftsprofilen?", a: "Du mister tilgangen, og innleggene, bildene og svarene dine på anmeldelser slettes. Selve oppføringen, anmeldelsene og opplysningene blir som regel liggende synlig i Google Søk og Maps – og nå kan hvem som helst foreslå endringer." },
    { q: "Hvordan fjerner jeg bedriften min fra Google Maps?", a: "Hvem som helst kan velge «Foreslå en endring» → «Steng eller fjern» på stedet i Google Maps. Google avgjør selv og beholder som regel oppføringen for virkelige bedrifter, eller merker den bare som stengt. En fullstendig fjerning av oppføringen og anmeldelsene skjer via prosedyrene Google tilbyr, på vegne av eieren." },
    { q: "Kan jeg slette Google-bedriftsprofilen og starte på nytt?", a: "Bare hvis den gamle profilen først fjernes fullstendig. En ny profil for samme bedrift på samme adresse behandles som et duplikat og slås som regel sammen med den gamle igjen – anmeldelsene inkludert – eller suspenderes." },
    { q: "Hvorfor ser jeg ikke «Fjern bedriftsprofilen» i innstillingene?", a: "Som regel fordi du er administrator og ikke primæreier, fordi du ble eier for mindre enn 7 dager siden, fordi profilen ikke er verifisert under kontoen din, eller fordi du er logget inn med en annen Google-konto." },
    { q: "Er Google My Business det samme som Google-bedriftsprofil?", a: "Ja. Google My Business er det gamle navnet på Google-bedriftsprofil. Bedriftskonto, bedriftsside, oppføring og profil viser alle til den samme oppføringen." },
    { q: "Kan jeg fjerne en bedrift fra Google som ikke er min?", a: "Som utenforstående kan du bare sende et forslag via «Foreslå en endring» – for eksempel hvis stedet ikke finnes, er et duplikat eller er spam. Google avgjør selv. En fullstendig profilfjerning gjennomfører RapidRemove bare på vegne av eieren." },
    { q: "Blir alle anmeldelser fjernet også?", a: "Ja. Når hele bedriftsprofilen fjernes, forsvinner alle tilknyttede anmeldelser på én gang – inkludert falske anmeldelser og hevnanmeldelser." },
    { q: "Hvor lang tid tar det å fjerne profilen?", a: "Normalt 24–48 timer ved profesjonell fjerning, mot månedene advokatveien kan ta. Du kan følge statusen løpende i kundeportalen." },
    { q: "Påvirker fjerningen nettstedet mitt, SEO eller Google Ads?", a: "Nei. Det som fjernes, er utelukkende bedriftsprofilen (Google Maps / Google-bedriftsprofil). Nettstedet ditt, Google-kontoen din, rangeringen og kampanjene dine forblir uendret. En ren ny profil kan opprettes etterpå om du ønsker det." },
    { q: "Hva koster det å fjerne en Google-bedriftsprofil?", a: "RapidRemove opererer med en transparent fastpris fra 450 € – og du betaler først etter fjerning. Trenger du bare å få fjernet enkelte anmeldelser, koster [fjerning av enkeltomtaler](/no/fjern-omtale/) fra 179 € per fjernet anmeldelse (med tekst, maks. 4 uker gammel; ellers 250 €), betaling kun ved suksess." },
    { q: "Kan profilen dukke opp igjen etterpå?", a: "Tredjeparter kan i teorien opprette en ny profil. Med den valgfrie overvåkingstjenesten holder vi øye med oppføringen din og fjerner en ny profil uten tilleggskostnad i beskyttelsesperioden, dersom den skulle dukke opp igjen." },
  ],
};
export default article;
