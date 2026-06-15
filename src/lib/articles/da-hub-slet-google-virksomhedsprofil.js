/* DA hub: "Slet Google-virksomhedsprofil" (lead article, MagArticle format) */
const article = {
  meta: {
    slug: "slet-google-virksomhedsprofil",
    title: "Slet Google-virksomhedsprofil: Sådan gør du det rigtigt",
    h1: "Slet Google-virksomhedsprofil – hvad virker egentlig?",
    description: "Google lader dig ikke bare slette din virksomhedsprofil. Guiden forklarer, hvorfor »permanent lukket« ikke er en sletning — og hvad der rent faktisk virker.",
    author: "Maximilian Hölzl",
    authorRole: "Google-ekspert og grundlægger",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Googles politik",
  iconKey: "trash",
  readingMin: 11,
  dek: "Google lader dig ikke bare slette din virksomhedsprofil. Guiden forklarer, hvorfor »permanent lukket« ikke er en sletning — og hvad der rent faktisk virker.",
  blocks: [
    { t: "h2", id: "kurz", text: "Kort fortalt", toc: "Kort fortalt" },
    { t: "ul", items: [
      "**Du kan næsten ikke slette profilen selv:** Google tilbyder ingen rigtig »slet profil«-knap — kun statussen »permanent lukket«.",
      "**»Lukket« ≠ slettet:** Opslaget, navnet, adressen og **alle anmeldelser forbliver offentligt synlige.**",
      "**Den eneste pålidelige vej** er en fuldstændig fjernelse af profilen via de officielle procedurer — lovlig og permanent.",
      "**RapidRemove** fjerner profilen med alle anmeldelser typisk inden for **24–48 timer** — **betaling først efter succes**.",
    ] },
    { t: "p", text: "Du googler din virksomhed — og ser en profil, du ikke længere ønsker: fuld af gamle falske anmeldelser eller hævnanmeldelser, med forkerte oplysninger, eller simpelthen et opslag, du vil have fjernet for altid. Det naturlige spørgsmål er: **Hvordan sletter jeg min Google-virksomhedsprofil?** Det ærlige svar er desværre mere kompliceret, end Google lader det se ud til. Denne guide viser dig, hvad der rent faktisk virker — trin for trin, uden omsvøb." },

    { t: "h2", id: "herkunft", text: "Hvem oprettede egentlig denne profil?", toc: "Hvem oprettede den?" },
    { t: "p", text: "De fleste virksomhedsejere, der kontakter os, har aldrig selv oprettet deres profil — og er oprigtigt overraskede over, at den findes. Det er ikke undtagelsen, men reglen. En Google-virksomhedsprofil bliver sjældent oprettet aktivt af ejeren. Langt oftere er det en anden, der tilføjer den, eller Google, der genererer den helt automatisk. For at forstå, hvorfor en sådan profil bagefter er så svær at slippe af med, hjælper det først at vide, hvordan den er havnet der. Der er grundlæggende tre veje." },
    { t: "anim", caption: "Tre måder, hvorpå en virksomhedsprofil opstår — næsten altid uden at ejeren foretager sig noget." },
    { t: "h3", text: "Vej 1: nogen tilføjer stedet manuelt" },
    { t: "p", text: "Enhver Google-bruger kan i Maps-appen trykke på en adresse eller et tomt sted og vælge »Tilføj et manglende sted«. På den måde kan en virksomhed registreres, uden at man har noget med den at gøre — det gør kunder, tidligere medarbejdere, konkurrenter eller meget aktive Maps-brugere (Local Guides)." },
    { t: "p", text: "Det sker dog ikke helt uden kontrol. Før et indberettet sted bliver synligt, kører en automatisk kontrol i baggrunden:" },
    { t: "ul", items: [
      "**Placering:** befinder brugeren sig faktisk i nærheden af det sted, han vil tilføje? Det forhindrer, at nogen i Berlin for sjov opfinder en café i München.",
      "**Dubletkontrol:** findes der allerede et lignende navn eller den samme kategori på den koordinat eller lige ved siden af?",
      "**Sammenligning med nettet:** Google søger parallelt på navnet for at se, om virksomheden overhovedet dukker op online.",
    ] },
    { t: "p", text: "Hænger billedet sammen, bliver punktet offentliggjort — synligt for alle som en **ikke-gjort-krav-på-profil** (unclaimed)." },
    { t: "h3", text: "Vej 2: Google opretter selv profilen ud fra webdata" },
    { t: "p", text: "Det er den vej, færrest regner med: Google opretter profiler i stort antal på eget initiativ — uden ejerens medvirken eller samtykke. Grunden er enkel: Google vil kortlægge den virkelige verden så fuldstændigt som muligt og venter ikke på, at en ny virksomhed melder sig." },
    { t: "p", text: "Til det gennemsøger Googles crawlere løbende nettet for såkaldte **NAP-data** — navn, adresse, telefon (*Name, Address, Phone*). Ud fra disse fragmenter samler systemet en profil, udløst for eksempel af:" },
    { t: "ul", items: [
      "**Strukturerede data på websitet:** indlejrer en virksomheds side den standardiserede `LocalBusiness`-markup i kildekoden (maskinlæsbare oplysninger ifølge Schema.org), læser Google adresse, telefon og åbningstider direkte og rent.",
      "**Digitale fodspor på nettet:** Google kombinerer oplysninger fra Facebook-sider, Instagram-profiler, omtaler i lokale medier og opslag i online telefonbøger.",
      "**Konsistenstjek:** dukker den samme virksomhed med samme adresse op flere gange på samme måde — på eget website, på Facebook og i en lokal blog — opretter Google automatisk en ny Maps-profil ud fra det.",
    ] },
    { t: "p", text: "De fleste ejere opdager det først, når de pludselig ser knappen »Gør krav på denne virksomhed« på kortet." },
    { t: "h3", text: "Vej 3: masseimport fra officielle registre" },
    { t: "p", text: "Den tredje vej undervurderes ofte: Google indlæser data i stor skala fra officielle kilder og fra dataaggregatorer, som man har aftaler med." },
    { t: "ul", items: [
      "**Virksomhedsregistre:** så snart en virksomhed registreres hos myndigheden eller i virksomhedsregistret, strømmer disse data til Google med jævne mellemrum — som regel via mellemliggende databaser.",
      "**Branchekataloger:** Google sammenholder sine kort med De Gule Sider og telefonregistrene i hvert land. En ny post dér kan automatisk udløse et nyt punkt på Maps.",
    ] },
    { t: "p", text: "Sådan kan en profil dukke op kort efter, at du har registreret din virksomhed — uden at du nogensinde selv har været hos Google." },
    { t: "p", text: "**Derfor er det vigtigt** Uanset hvordan profilen er opstået, er konsekvensen den samme: så snart den findes, samler den anmeldelser og dukker op i Søgning og Maps. Du behøver hverken at have oprettet den eller administrere den for at være berørt — og netop derfor er det ikke nok bare at ignorere den. Den skal stadig fjernes aktivt." },

    { t: "h2", id: "selbst", text: "Kan man selv slette en Google-virksomhedsprofil?", toc: "Slette den selv?" },
    { t: "p", text: "Kort sagt: **ikke på den måde, du forventer.** Google skelner skarpt mellem din personlige Google-konto og den offentlige virksomhedsprofil (tidligere »Google My Business«, i dag »Google virksomhedsprofil«). Du kan ansøge om ejerskab og redigere nogle oplysninger — men der findes simpelthen ingen klar knap med teksten »Slet dette opslag og alle anmeldelser permanent« til virksomhedsejere." },
    { t: "p", text: "Det er ikke en fejl, men et bevidst valg: Profilen med dens anmeldelser er en del af Google Søgning og Google Maps. Google betragter disse oplysninger som nyttige for brugerne — og giver ikke ejeren kontrollen tilbage af sig selv. Netop derfor støder de fleste virksomhedsejere hurtigt ind i en mur, når de forsøger at slette profilen selv." },

    { t: "h2", id: "geschlossen", text: "»Permanent lukket« er ikke en sletning", toc: "»Lukket« ≠ slettet" },
    { t: "p", text: "Den mulighed, Google tilbyder, hedder »Markér som permanent lukket«. Mange opfatter det som en sletning — men det er det ikke. Det er kun et **statusmærkat**." },
    { t: "warn", title: "Hvad »lukket« rent faktisk betyder", text: "Din profil forbliver synlig i Google Søgning og Google Maps — inklusive navn, adresse, billeder og **alle anmeldelser**. Ovenpå sidder blot et overstreget »Permanent lukket«. For potentielle kunder ser det ofte *værre* ud end før." },
    { t: "p", text: "Med andre ord: den, der »lukker«, slipper hverken af med opslaget eller anmeldelserne — i visse tilfælde gøres problemet endda mere synligt. En **ægte sletning** fjerner derimod hele [Google Maps-opslaget](/da/fjern-google-maps-virksomhed/) inkl. alle anmeldelser." },

    { t: "h2", id: "optionen", text: "De muligheder du reelt har", toc: "Dine muligheder" },
    { t: "p", text: "Der er realistisk set tre veje til at komme af med en uønsket profil — med meget forskelligt resultat:" },
    { t: "table", rrCol: 3, head: ["Kriterium", "Selv (DIY)", "Advokat", "RapidRemove"], rows: [
      ["Fuldstændig sletning mulig?", "Praktisk talt nej", "Usikkert", "Ja"],
      ["Varighed", "—", "3–9 måneder", "24–48 timer"],
      ["Omkostninger", "—", "2.500 kr.+/time", "Fastpris fra 3.350 kr."],
      ["Alle anmeldelser væk", "Nej", "Enkeltvis, besværligt", "Alle på én gang"],
      ["Succes", "Nej", "Usikker", "Garanteret (No Cure, No Pay)"],
      ["Dit tidsforbrug", "Højt", "Højt", "Praktisk talt nul"],
    ] },
    { t: "p", text: "DIY-vejen ender næsten altid ved »permanent lukket«. Advokatvejen er dyr, langsom og usikker — og udløser ikke sjældent [Streisand-effekten](/da/negativ-google-anmeldelse-advokat/), hvor opmærksomheden tværtimod stiger. Tilbage er den tredje vej: den professionelle, fuldstændige fjernelse." },

    { t: "h2", id: "anleitung", text: "Vejledning: Rediger profilen direkte via Google", toc: "Vejledning trin for trin" },
    { t: "p", text: "Vil du prøve det selv først, er her det reelle forløb. Regn med, at resultatet i bedste fald bliver »lukket« — ikke »slettet«." },
    { t: "ol", items: [
      "**Gør krav på ejerskab:** Søg din virksomhed på Google og vælg »Er du ejer af denne virksomhed?«. Google kræver verifikation (postkort, telefon, e-mail eller video) — det kan tage dage til uger.",
      "**Log ind på virksomhedsprofilen:** Administrér herefter profilen direkte fra Google Søgning, når ejerskabet er bekræftet.",
      "**Find »Fjern profil«:** Under indstillingerne finder du muligheder som »Markér virksomhed som permanent lukket« eller »Fjern profil«. Sidstnævnte fjerner kun administrationstilknytningen, ikke det offentlige opslag.",
      "**Tjek resultatet:** Som regel forbliver opslaget med alle anmeldelser synligt — nu blot med mærkatet »Permanent lukket«. Det egentlige problem er dermed ikke løst.",
    ] },
    { t: "note", title: "Vigtigt at vide", text: "Uden bekræftet ejerskab kan du næsten ikke ændre noget. Og selv med ejerskab er en fuldstændig fjernelse af det offentlige opslag ikke mulig via standardgrænsefladen." },
    { t: "cta", title: "Vil du hellere have tjekket, om din profil kan slettes?", text: "Indtast dit firmanavn — vi finder din rigtige Google-profil og tjekker på sekunder, om og hvor hurtigt den kan fjernes. Uforpligtende og gratis.", btn: "Start gratis tjek", href: "/da/?start=1", trust: ["Betaling kun efter vellykket sletning"] },

    { t: "h2", id: "einzeln", text: "Enkeltanmeldelser eller hele profilen?", toc: "Anmeldelser eller profil?" },
    { t: "p", text: "Mange starter med at forsøge at [anmelde](/da/fjern-falske-google-anmeldelser/) individuelle dårlige anmeldelser til Google. Det er besværligt og usikkert: Google afviser anmeldelser hyppigt, hver enkelt anmeldelse skal begrundes separat — og for hver fjernet anmeldelse dukker der hurtigt nye op. Du bekæmper symptomerne." },
    { t: "p", text: "Den holdbare tilgang rammer ved roden: **Fjernes hele profilen, forsvinder alle anmeldelser på én gang** — inkl. falske anmeldelser. Endeligt frem for stykkevis. Netop derfor fjerner vi bevidst ikke enkeltanmeldelser, men den komplette profil. Den, der foreløbig kun vil have [enkeltanmeldelser fjernet fra Google](/da/fjern-google-anmeldelser/), finder metoderne og priserne sammenlignet der." },
    { t: "tip", title: "Den afgørende fordel", text: "En fjernet profil kan hverken vise gamle *eller* nye anmeldelser. Problemet er dermed ikke skubbet videre — det er løst." },

    { t: "h2", id: "legal", text: "Er det lovligt at slette profilen?", toc: "Er det lovligt?" },
    { t: "p", text: "Ja. En professionel fjernelse arbejder udelukkende via de **officielle, af Google godkendte procedurer** og er juridisk gennemgået. Der hackes intet, omgås intet, og der skaffes ingen uautoriseret adgang. Din Google-konto, Gmail og eventuelle Google Ads-konti forbliver helt uberørte — ligesom din hjemmeside, din organiske placering og dine kampagner." },
    { t: "p", text: "En seriøs udbyder kendes på, at han opgiver en reel virksomhed med adresse og CVR-nummer, er transparent om metoden og **afregner først efter succes** — ikke på vage løfter om »hemmelige adgange til Google«." },

    { t: "h2", id: "kosten", text: "Hvor lang tid tager det — og hvad koster det?", toc: "Varighed og pris" },
    { t: "p", text: "En professionel sletning er typisk gennemført **inden for 24–48 timer** — frem for de måneder, advokatvejen sluger. Hvad angår pris: en advokat fakturerer pr. time (ofte 2.500 kr. og derover) uden successgaranti. RapidRemove arbejder med en **transparent fastpris fra 3.350 kr.** — og du betaler **udelukkende efter vellykket sletning**." },
    { t: "p", text: "Lyder prisen høj? Regn efter: Én enkelt synlig falsk anmeldelse kan sænke klikraten mærkbart og koster dig et mangefold over måneder." },

    { t: "h2", id: "ablauf", text: "Sådan foregår sletningen med RapidRemove", toc: "Sådan foregår det" },
    { t: "ol", items: [
      "**Gratis tjek:** Indtast firmanavnet. Vi finder din profil og tjekker omgående, om sletningen er mulig — uforpligtende og gratis.",
      "**Bekræft og godkend:** Du bekræfter den rigtige profil og giver os bearbejdningsgodkendelse. Ingen adgang til Gmail, Ads eller personlige data.",
      "**Sletning inden for 24–48 timer:** Vores team fjerner profilen med alle anmeldelser — permanent. Betaling sker først derefter.",
    ] },

    { t: "h2", id: "fazit", text: "Konklusion: den hurtigste, sikreste vej til et rent søgeresultat", toc: "Konklusion" },
    { t: "p", text: "At slette en Google-virksomhedsprofil selv mislykkes i praksis næsten altid på grund af Googles eget system — »permanent lukket« løser ikke problemet. Den pålidelige vej er den fuldstændige, lovlige fjernelse af hele profilen inkl. alle anmeldelser. Hurtigt, permanent, forudsigeligt — og med betaling først efter succes, helt uden risiko." },

    { t: "cta", title: "Tjek nu gratis, om din profil kan slettes", text: "På få sekunder ser du din rigtige profil og får at vide, om og hvor hurtigt vi kan fjerne den. Ingen forudbetaling, ingen forpligtelse.", btn: "Start gratis tjek", href: "/da/?start=1", trust: ["Nul risiko", "Betaling kun efter vellykket sletning"] },
  ],
  faq: [
    { q: "Kan jeg selv slette min Google-virksomhedsprofil?", a: "Kun i begrænset omfang. Google tilbyder ingen enkel »slet profil«-knap. Du kan ansøge om ejerskab og markere profilen som »permanent lukket« — men opslaget med alle anmeldelser forbliver offentligt synligt." },
    { q: "Hvad er forskellen på »permanent lukket« og »slettet«?", a: "»Permanent lukket« er kun en status. Profilen forbliver synlig i Søgning og Maps, inkl. navn, adresse og alle anmeldelser. En ægte sletning fjerner opslaget og alle anmeldelser fuldstændigt." },
    { q: "Er det lovligt at få slettet en Google-virksomhedsprofil?", a: "Ja. Fjernelsen sker via de officielle, af Google godkendte procedurer og er juridisk gennemgået. Din Google-konto, Gmail og eventuelle Ads-konti forbliver fuldstændig uberørte." },
    { q: "Forsvinder alle anmeldelser også?", a: "Ja. Fjernes hele virksomhedsprofilen, forsvinder alle tilknyttede anmeldelser på én gang — inkl. falske anmeldelser og hævnanmeldelser." },
    { q: "Hvor lang tid tager sletningen?", a: "Profilen er typisk fjernet inden for ca. 24 timer. Den præcise status kan du til enhver tid følge i kundeportalen." },
    { q: "Påvirker sletningen mit SEO, min hjemmeside eller Google Ads?", a: "Nej. Det, der fjernes, er udelukkende virksomhedsprofilen (Google Maps / Google virksomhedsprofil). Din hjemmeside, din placering i søgeresultaterne og dine kampagner forbliver uændrede." },
    { q: "Hvad koster det at få slettet en Google-virksomhedsprofil?", a: "RapidRemove arbejder med en transparent fastpris fra 3.350 kr. — og du betaler udelukkende efter vellykket sletning (No Cure, No Pay)." },
    { q: "Kan profilen dukke op igen bagefter?", a: "Tredjeparter kan teoretisk oprette en ny profil. Med den valgfrie overvågning holder vi øje med dit opslag og fjerner en eventuel ny profil i beskyttelsesperioden uden beregning." },
  ],
};
export default article;
