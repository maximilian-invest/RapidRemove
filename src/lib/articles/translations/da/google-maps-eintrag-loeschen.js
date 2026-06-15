/* DA — google-maps-eintrag-loeschen */
const article = {
  category: "Googles politik",
  meta: {
    slug: "fjern-google-maps-virksomhed",
    title: "Slet Google Maps-profil: din, fremmede og for altid",
    h1: "Slet Google Maps-profil: Din egen, fremmede, falske og dobbelte profiler",
    description: "Slet Google Maps-profil – fjern din egen, en fremmed, en falsk eller en dobbelt profil. Vejledning til, hvorfor »lukket« ikke er nok, og hvordan du faktisk får slettet den.",
    keywords: ["fjern google maps placering", "fjern virksomhed google maps", "fjern andres google maps placering", "fjern forkert google maps placering", "fjern virksomhed fra google maps", "fjern dublet google"],
    author: "Matthias Lang",
    authorRole: "Google-ekspert",
    date: "2026-06-04",
  },
  dek: "En forældet, forkert eller dobbelt profil på Google Maps forvirrer kunder, sender dem til den forkerte adresse – og kan skade dit omdømme alvorligt. Det underfundige er: Selv om du fjerner alt fra din konto, **forbliver profilen med alle anmeldelser synlig i Maps og i Google-søgningen.** Denne guide viser dig ærligt og trin for trin, hvordan du fjerner din egen, fremmede, falske og dobbelte Maps-profiler – hvor Googles egne værktøjer sætter grænser, og hvordan du opnår en virkelig permanent sletning.",
  blocks: [
    { t: "note", title: "Bemærk", text: "Dette indlæg er en praktisk vejledning og udgør ikke juridisk rådgivning." },

    { t: "h2", id: "kurz", text: "Kort fortalt", toc: "Kort fortalt" },
    { t: "ul", items: [
      "**»Fjern fra konto« ≠ slettet.** I de fleste tilfælde markeres profilen blot som »permanent lukket« – den forbliver synlig med navn, adresse og alle anmeldelser.",
      "**Fremmede og falske profiler** kan du kun **indberette**, ikke slette direkte – og Google afviser indberetninger hyppigt.",
      "**Dobbelte profiler** bør du lade sammenlægge, ikke slette på stedet – ellers mister du dine anmeldelser.",
      "**Fuldstændig og permanent** fjernelse (inkl. alle anmeldelser) lykkes i praksis oftest kun via **komplet profilsletning** – hos RapidRemove typisk på 24–48 timer, **betaling kun ved succes**.",
    ] },

    { t: "h2", id: "herkunft", text: "Forstå det først: Hvorfor eksisterer profilen overhovedet?", toc: "Hvorfor findes den?" },
    { t: "p", text: "Mange virksomhedsejere undrer sig over, at der allerede findes en Maps-profil – de har aldrig oprettet den selv. Det er faktisk normalen: Maps-profiler opstår via andre brugere, Googles automatiske dataindsamling fra nettet eller import fra officielle registre. Det vigtige her: Fordi profilen sjældent er oprettet af dig, har du via den normale kontomenu kun begrænset kontrol over den." },
    { t: "p", text: "Hvilken vej der er den rette for dig, afhænger af, hvilken type profil det drejer sig om. Der er fire typiske situationer." },

    { t: "h2", id: "eigener", text: "Situation 1: Fjern din egen Google Maps-profil", toc: "Situation 1: Egen profil" },
    { t: "p", text: "Hvis du er verificeret som ejer, kan du løsrive profilen fra din administration:" },
    { t: "ol", items: [
      "Søg på Google efter **»Min virksomhed«**, og åbn profilindstillingerne.",
      "Gå via **tre-prikke-menuen** til **»Fjern virksomhedsprofil«**.",
      "Vælg **»Fjern profilindhold og administratorer«**, og bekræft.",
    ] },
    { t: "p", text: "Det lyder som en sletning – men det er det ikke. Vi forklarer om et øjeblik, hvad der faktisk sker. Regn med, at den offentlige profil forbliver synlig." },

    { t: "cta", title: "Vil du have Maps-profilen permanent væk?", text: "Vi undersøger gratis, om din Google Maps-profil faktisk kan fjernes.", btn: "Undersøg gratis", href: "/da/?start=1", trust: ["Gratis analyse", "Inkl. garanti", "Uden risiko"] },

    { t: "h2", id: "sichtbar", text: "Derfor forbliver profilen synlig efter »sletningen«", toc: "Hvorfor bliver den?" },
    { t: "p", text: "Det er her, de fleste løber panden mod muren – og det, Google bevidst ikke kommunikerer tydeligt: At fjerne profilen fra din konto betyder **ikke**, at virksomheden forsvinder fra Maps og søgeresultaterne. Profilen løsrives blot fra din administration og markeres typisk som **»Permanent lukket«**. Navn, adresse, billeder og **samtlige anmeldelser forbliver offentlige** – nu blot med en overstregning og en statuslabel, der ofte ser værre ud end før." },
    { t: "p", text: "Årsagen er Googles forretningsmodel: Google Maps lever af at have mest mulige lokationsdata. I sine [indholdspolitikker](https://support.google.com/contributionpolicy/answer/7400114) tager Google udtrykkelig afstand fra fuldstændig sletning af virksomhedsprofiler. En komplet fjernelse alene via din egen konto er i praksis ikke tiltænkt." },

    { t: "h2", id: "fremder", text: "Situation 2: Indberet en fremmed eller falsk profil", toc: "Situation 2: Fremmed profil" },
    { t: "p", text: "For profiler du ikke ejer – f.eks. en forkert, forældet eller af tredjeparter oprettet profil – er din eneste mulighed indberetningsfunktionen:" },
    { t: "ol", items: [
      "Åbn profilen i **Google Maps**.",
      "Klik på **»Foreslå en ændring«**.",
      "Vælg **»Anmeld som lukket eller anmod om fjernelse«**.",
      "Angiv årsag, f.eks. **»Eksisterer ikke her«** eller **»Stødende, skadeligt eller vildledende«**.",
      "Gem – og vent på Googles behandling.",
    ] },
    { t: "p", text: "Ærligt talt: Det er en tålmodighedsprøve. Google behandler primært automatiseret, sagsbehandlingen kan tage uger, og indberetninger afvises ofte uden nærmere begrundelse. Det hjælper, hvis flere uafhængige personer indsender den samme faktuelle oplysning – falske indberetninger gennemskuer Google hurtigt og ignorerer dem." },

    { t: "h2", id: "doppelt", text: "Situation 3: Ryd op i en dobbelt profil (duplikat)", toc: "Situation 3: Duplikat" },
    { t: "p", text: "Dobbelte profiler opstår typisk ved flytning, navneskifte eller utilsigtet dobbeltoprettelse. Sådan gør du:" },
    { t: "ol", items: [
      "Åbn den **dobbelte** profil i Google Maps.",
      "Klik på **»Foreslå en ændring«** → **»Anmeld som lukket eller anmod om fjernelse«**.",
      "Vælg **»Duplikat af et andet sted«** som årsag, og gem.",
    ] },
    { t: "warn", title: "Vigtigt", text: "Slet ikke ved en fejl den **verificerede** profil – så skal du bekræfte ejerskabet på ny. Har begge profiler allerede anmeldelser, bør du **ikke** slette dem, men i stedet bede Google-support om at **sammenlægge** dem. Det er den eneste måde at bevare dine rigtige anmeldelser på." },

    { t: "h2", id: "sonderfaelle", text: "Situation 4: Virksomheden er lukket, flyttet eller omdøbt", toc: "Situation 4: Særtilfælde" },
    { t: "p", text: "Disse særtilfælde håndteres ofte forkert:" },
    { t: "ul", items: [
      "**Virksomheden er permanent lukket:** »Permanent lukket« er her korrekt – men husk, at gamle negative anmeldelser fortsat er synlige og kan have eftervirkninger.",
      "**Flytning:** Opdater adressen i den eksisterende profil i stedet for at oprette en ny – ellers opstår der et duplikat, og anmeldelserne spredes.",
      "**Omdøbning:** Skift navn i den samme profil. En ny profil »spilder« din hidtidige anmeldelseshistorik.",
    ] },
    { t: "p", text: "Er profilen derimod grundlæggende skadet – via falske anmeldelser, en omdømmekampagne eller data der ikke lader sig rette – hjælper korrektioner ikke. Her er fuldstændig fjernelse det rene snit." },

    { t: "h2", id: "vergleich", text: "Metoderne sammenlignet", toc: "Metoder sammenlignet" },
    { t: "table", head: ["Metode", "Hvad den giver", "Varighed", "Succes"], rows: [
      ["Selvindberetning (formular)", "Enkeltvis fremmede/falske profiler", "Uger, uvist", "Ofte begrænset, hyppige afvisninger"],
      ["Fjern fra konto", "Kun status »lukket«", "Øjeblikkeligt", "Profilen forbliver synlig"],
      ["Advokat", "Enkeltvis ulovligt indhold", "3–9 måneder", "Usikkert, dyrt (timepris)"],
      ["**RapidRemove (profilsletning)**", "**Hele profilen + alle anmeldelser**", "**24–48 timer**", "**Betaling kun ved succes**"],
    ] },

    { t: "h2", id: "dauerhaft", text: "Den permanente løsning: lad hele profilen fjerne", toc: "Fjern permanent" },
    { t: "p", text: "Vil du have en profil **fuldstændigt og permanent** – inkl. alle anmeldelser – fjernet fra Google Maps og søgeresultaterne, når Googles egne værktøjer til kort. Det er præcis her, RapidRemove kommer ind: Vi bekæmper ikke enkeltanmeldelser eller statuslabels, men fjerner den **komplette Google-virksomhedsprofil** via Googles officielle procedurer. Dermed forsvinder profilen med samtlige anmeldelser på én gang – herunder falske anmeldelser." },
    { t: "p", text: "Hvad det betyder for dig:" },
    { t: "ul", items: [
      "**Tempo:** Fjernelse typisk på 24–48 timer frem for måneders frem og tilbage.",
      "**Fuldstændigt:** Profil og alle anmeldelser fjernes komplet fra visning og søgning – ingen »lukket«-markering, ingen rester.",
      "**SEO-venligt:** Din hjemmeside, dit organiske søgeranking og dine Google Ads er uberørte. Det er udelukkende Maps-/virksomhedsprofilen, der fjernes.",
      "**Forudsigeligt:** Transparent fastpris, **betales først ved succes** (No Cure, No Pay).",
      "**Med garanti:** Dukker profilen op igen via tredjeparter, fjerner vi den inden for beskyttelsesperioden gratis igen.",
      "**Diskret:** Ingen brevveksling, ingen direkte konfrontation med anmelderne – og dermed ingen risiko for Streisand-effekten.",
    ] },
    { t: "h3", text: "Sådan foregår sletningen med RapidRemove" },
    { t: "ol", items: [
      "**Gratis tjek:** Indtast virksomhedsnavnet. Vi finder din reelle Maps-profil og vurderer på sekunder, om og hvor hurtigt den kan fjernes.",
      "**Bekræft og godkend:** Du bekræfter den korrekte profil og giver behandlingsgodkendelse. Ingen adgang til Gmail, Google Ads eller personlige data.",
      "**Sletning på 24–48 timer:** Vores team fjerner profilen inkl. alle anmeldelser – permanent. Betaling sker først bagefter.",
    ] },

    { t: "cta", title: "Undersøg gratis, om din Maps-profil kan slettes.", text: "Indtast virksomhedsnavnet – vi undersøger på sekunder, om og hvor hurtigt din profil inkl. alle anmeldelser kan fjernes.", btn: "Tjek om sletning er mulig", href: "/da/?start=1", trust: ["Analyse gratis", "Garanti", "Ingen risiko"] },

    { t: "h2", id: "fazit", text: "Konklusion", toc: "Konklusion" },
    { t: "p", text: "En Google Maps-profil lader sig kun begrænset påvirke via Googles egne værktøjer: »Fjern fra konto« betyder oftest blot »lukket«, fremmede profiler kan kun indberettes, og duplikater bør sammenlægges frem for slettes. Handler det om en **fuldstændig, permanent** fjernelse inkl. alle anmeldelser, er komplet profilsletning den pålidelige vej – hurtig, forudsigelig og med betaling først ved succes." },

    { t: "cta", title: "Undersøg nu gratis, om din profil kan fjernes.", text: "På få sekunder ser du din reelle profil og får at vide, om og hvor hurtigt vi kan fjerne den. Ingen forudbetaling, ingen forpligtelse.", btn: "Start gratis tjek", href: "/da/?start=1", trust: ["Nul risiko", "Betaling kun efter vellykket sletning"] },
  ],
  faq: [
    { q: "Hvordan sletter jeg min egen Google Maps-profil?", a: "Via »Min virksomhed« → Profilindstillinger → Tre-prikke-menu → »Fjern virksomhedsprofil« → »Fjern profilindhold og administratorer«. Bemærk: Det løsriver kun profilen fra din konto, men fjerner den ikke fra Maps og søgeresultaterne." },
    { q: "Hvorfor er min Google Maps-profil stadig synlig efter sletningen?", a: "Fordi fjernelse fra kontoen typisk kun markerer profilen som »Permanent lukket«. Profil og anmeldelser forbliver i Maps og søgeresultaterne. En fuldstændig sletning er ikke tiltænkt af Google selv; i praksis lykkes det oftest via et specialiseret bureau." },
    { q: "Hvordan indberetter jeg en fremmed eller falsk profil?", a: "Åbn profilen i Google Maps, klik »Foreslå en ændring« → »Anmeld som lukket eller anmod om fjernelse«, angiv årsag (f.eks. »Eksisterer ikke her«), og gem. Google behandler forslaget – det kan tage tid og afvises ofte." },
    { q: "Hvordan fjerner jeg en dobbelt Google-profil?", a: "Åbn duplikatet i Maps, klik »Foreslå en ændring« → »Anmeld som lukket eller anmod om fjernelse« → »Duplikat af et andet sted«. Har begge profiler anmeldelser, er det bedre at bede Google-support om at sammenlægge dem, så ingen anmeldelser går tabt." },
    { q: "Påvirker fjernelsen mit SEO eller min hjemmeside?", a: "Nej. Det er udelukkende Maps-/virksomhedsprofilen, der fjernes. Din hjemmeside, dit organiske søgeranking og dine Google Ads er uændrede." },
    { q: "Kan jeg få en Google Maps-profil slettet permanent?", a: "Fuldstændigt og permanent – inkl. alle anmeldelser – lykkes det typisk via et specialiseret bureau, da Google ikke understøtter selvstændig sletning. Den tekniske sletning sker ofte på 24–48 timer – betaling først ved succes." },
    { q: "Hvad koster det at fjerne en Maps-profil?", a: "Hos RapidRemove gælder en transparent fastpris, som betales udelukkende efter vellykket sletning. Du løber altså ingen økonomisk risiko." },
  ],
  related: [
    { label: "Fjern Google-virksomhedsprofilen: hvordan gør man?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Fjern Google-anmeldelser: pris og metoder", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Anmeld og fjern en falsk Google-anmeldelse", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Dårlig Google-anmeldelse – hvad gør man?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
