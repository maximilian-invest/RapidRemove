/* DA — google-maps-eintrag-loeschen */
const article = {
  category: "Googles politik",
  meta: {
    slug: "fjern-google-maps-virksomhed",
    title: "Fjern en Google Maps-placering: egen, andres og dublet (2026)",
    h1: "Fjern en Google Maps-placering: egen, andres og dublet",
    description: "Fjern en Google Maps-placering – egen, andres, forkert eller dublet. Trin-for-trin-guide, hvorfor placeringen ofte bliver stående, og hvordan du får den fjernet varigt.",
    keywords: ["fjern google maps placering", "fjern virksomhed google maps", "fjern andres google maps placering", "fjern forkert google maps placering", "fjern virksomhed fra google maps", "fjern dublet google"],
    author: "Matthias Lang",
    authorRole: "Google-ekspert",
    date: "2026-06-04",
  },
  dek: "En forældet, forkert eller dubleret placering på Google Maps kan forvirre kunder og skade dit omdømme. Men at fjerne den er mere lumsk, end mange tror: selv hvis du sletter alt fra din konto, **bliver placeringen ofte stående synlig i Maps og i søgningen.** Denne guide viser, hvordan du fjerner egne, andres, forkerte og dublerede Google Maps-placeringer – og hvordan en varig fjernelse virkelig fungerer.",
  blocks: [
    { t: "note", title: "Bemærk", text: "Denne artikel er en praktisk guide og udgør ikke juridisk rådgivning." },

    { t: "h2", id: "eigener", text: "Fjern din egen Google Maps-placering", toc: "Egen placering" },
    { t: "p", text: "Hvis du er ejer af placeringen, kan du frakoble den fra din konto:" },
    { t: "ol", items: [
      "Søg på Google efter **»Din virksomhedsprofil«** og åbn profilindstillingerne.",
      "Gå via **tre-prikker-menuen** til **»Fjern virksomhedsprofilen«**.",
      "Vælg **»Fjern profilindhold og administratorer«** og bekræft.",
    ] },

    { t: "h2", id: "sichtbar", text: "Hvorfor placeringen alligevel bliver stående synlig", toc: "Hvorfor bliver den" },
    { t: "p", text: "Dette er det afgørende punkt, som Google bevidst slører: at fjerne den fra din konto betyder **ikke**, at virksomheden forsvinder fra Maps og søgningen. Den frakobles kun din konto og markeres som regel som **»Permanent lukket«**. Placeringen og anmeldelserne **bliver stående**. I sine vilkår tager Google udtrykkeligt stilling imod fuldstændig fjernelse af virksomhedsprofiler, hvorfor en fuldstændig fjernelse alene via egen konto i praksis er umulig." },

    { t: "h2", id: "fremder", text: "Anmeld en andens eller forkert placering", toc: "Andres placering" },
    { t: "p", text: "For placeringer, der ikke er dine (f.eks. en forkert eller forældet), bruger du anmeldelsesfunktionen:" },
    { t: "ol", items: [
      "Åbn placeringen i **Google Maps**.",
      "Klik på **»Foreslå en ændring«**.",
      "Vælg **»Rapportér som lukket eller fjern«**.",
      "Angiv begrundelsen, f.eks. **»Findes ikke her«** eller **»Stødende, skadeligt eller vildledende«**.",
      "Gem og afvent Googles gennemgang.",
    ] },
    { t: "p", text: "Godkendes forslaget, kan placeringen fjernes fra søgningen og Maps. Behandlingen er dog ikke garanteret og kan tage tid." },

    { t: "h2", id: "doppelt", text: "Fjern en dubleret Google-placering", toc: "Dublet" },
    { t: "p", text: "Dubletter opstår ofte ved flytning, navneændring eller utilsigtet flerfoldig oprettelse. Gør sådan:" },
    { t: "ol", items: [
      "Åbn den **dublerede** profil i Google Maps.",
      "Klik på **»Foreslå en ændring«** → **»Rapportér som lukket eller fjern«**.",
      "Vælg som begrundelse **»Dublet af et andet sted«** og gem.",
    ] },
    { t: "warn", title: "Vigtigt", text: "Fjern ikke ved en fejl den **verificerede** placering – ellers skal du bekræfte den på ny. Har begge placeringer allerede anmeldelser, så fjern dem ikke; lad dem hellere **sammenlægge** via Googles support, så anmeldelserne bevares." },

    { t: "h2", id: "dauerhaft", text: "Varig og fuldstændig fjernelse", toc: "Fjern varigt" },
    { t: "p", text: "Vil du fjerne en profil **fuldstændigt og varigt** – inklusive alle anmeldelser – fra Google Maps og søgningen, er det ikke muligt via egen konto. Her hjælper et specialiseret bureau med teknisk fjernelse:" },
    { t: "ul", items: [
      "**Effektivitet:** fjernelse ofte inden for højst 24 timer",
      "**Fuldstændigt:** profil og anmeldelser fjernes helt",
      "**SEO-venligt:** dit websted og din placering forbliver uberørte",
      "**Garanteret:** dukker profilen op igen via tredjepart, fjernes den uden beregning",
    ] },
    { t: "cta", title: "Tjek gratis, om din Maps-placering kan fjernes.", text: "Indtast virksomhedsnavnet – vi tjekker på sekunder, om og hvor hurtigt din profil inklusive alle anmeldelser kan fjernes.", btn: "Tjek mulighed for fjernelse", href: "https://www.rapid-remove.com/", trust: ["Gratis analyse", "Garanti", "Uden risiko"] },
  ],
  faq: [
    { q: "Hvordan fjerner jeg min egen Google Maps-placering?", a: "Via »Din virksomhedsprofil« → indstillinger → tre-prikker-menuen → »Fjern virksomhedsprofilen« → »Fjern profilindhold og administratorer«. Bemærk: dette frakobler kun placeringen din konto, men fjerner den ikke fra Maps." },
    { q: "Hvorfor bliver min Google Maps-placering stående synlig efter fjernelsen?", a: "Fordi det at fjerne den fra kontoen kun markerer placeringen som »Permanent lukket«. Placeringen og anmeldelserne bliver stående i Maps og søgningen. Google tilbyder ikke selv en vej til dette; i praksis sker en fuldstændig fjernelse normalt via et specialiseret bureau." },
    { q: "Hvordan anmelder jeg en andens eller forkert placering?", a: "Åbn placeringen i Google Maps, »Foreslå en ændring« → »Rapportér som lukket eller fjern«, angiv begrundelsen (f.eks. »Findes ikke her«) og gem. Google gennemgår forslaget." },
    { q: "Hvordan fjerner jeg en dubleret Google-placering?", a: "Åbn dubletten i Maps, »Foreslå en ændring« → »Rapportér som lukket eller fjern« → vælg »Dublet af et andet sted«. Har begge placeringer anmeldelser, så lad dem hellere sammenlægge via Googles support." },
    { q: "Kan jeg få fjernet en Google Maps-placering varigt?", a: "Fuldstændigt og varigt inklusive anmeldelserne sker det normalt via et specialiseret bureau, da Google ikke tilbyder selvfjernelse. Den tekniske fjernelse sker ofte inden for 24 timer — betaling først efter succes." },
  ],
  related: [
    { label: "Fjern Google-virksomhedsprofilen: hvordan gør man?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Fjern Google-anmeldelser: pris og metoder", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Anmeld og fjern en falsk Google-anmeldelse", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Dårlig Google-anmeldelse – hvad gør man?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
