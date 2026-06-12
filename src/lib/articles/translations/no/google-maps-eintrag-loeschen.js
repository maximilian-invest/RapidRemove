/* NO — google-maps-eintrag-loeschen */
const article = {
  category: "Googles retningslinjer",
  meta: {
    slug: "fjern-google-maps-oppforing",
    title: "Fjerne en Google Maps-oppføring: egen, andres og duplikat (2026)",
    h1: "Fjerne en Google Maps-oppføring: egen, andres og duplikat",
    description: "Fjerne en Google Maps-oppføring – egen, andres, feil eller duplikat. Trinn-for-trinn-guide, hvorfor oppføringen ofte blir stående, og hvordan du får den fjernet varig.",
    keywords: ["fjerne google maps oppføring", "fjerne bedrift google maps", "fjerne andres google maps oppføring", "fjerne feil google maps oppføring", "fjerne bedrift fra google maps", "fjerne duplikat google"],
    author: "Matthias Lang",
    authorRole: "Google-ekspert",
    date: "2026-06-04",
  },
  dek: "En utdatert, feil eller duplisert oppføring på Google Maps kan forvirre kunder og skade omdømmet ditt. Men å fjerne den er mer lumsk enn mange tror: selv om du sletter alt fra kontoen din, **blir oppføringen ofte stående synlig i Maps og i søket.** Denne guiden viser hvordan du fjerner egne, andres, feil og dupliserte Google Maps-oppføringer – og hvordan en varig fjerning virkelig fungerer.",
  blocks: [
    { t: "note", title: "Merk", text: "Denne artikkelen er en praktisk guide og utgjør ikke juridisk rådgivning." },

    { t: "h2", id: "eigener", text: "Fjern din egen Google Maps-oppføring", toc: "Egen oppføring" },
    { t: "p", text: "Hvis du er eier av oppføringen, kan du koble den fra kontoen din:" },
    { t: "ol", items: [
      "Søk på Google etter **«Din bedriftsprofil»** og åpne profilinnstillingene.",
      "Gå via **tre-prikker-menyen** til **«Fjern bedriftsprofilen»**.",
      "Velg **«Fjern profilinnhold og administratorer»** og bekreft.",
    ] },

    { t: "h2", id: "sichtbar", text: "Hvorfor oppføringen likevel blir stående synlig", toc: "Hvorfor blir den" },
    { t: "p", text: "Dette er det avgjørende punktet som Google bevisst tilslører: å fjerne den fra kontoen din betyr **ikke** at bedriften forsvinner fra Maps og søket. Den kobles bare fra kontoen din og merkes som regel som **«Permanent stengt»**. Oppføringen og anmeldelsene **blir stående**. I vilkårene sine tar Google uttrykkelig stilling mot fullstendig fjerning av bedriftsprofiler, og derfor er en fullstendig fjerning alene via egen konto i praksis umulig." },

    { t: "h2", id: "fremder", text: "Rapporter en annens eller feil oppføring", toc: "Andres oppføring" },
    { t: "p", text: "For oppføringer som ikke er dine (f.eks. en feil eller utdatert), bruker du rapporteringsfunksjonen:" },
    { t: "ol", items: [
      "Åpne oppføringen i **Google Maps**.",
      "Klikk på **«Foreslå en endring»**.",
      "Velg **«Rapporter som stengt eller fjern»**.",
      "Angi grunnen, f.eks. **«Finnes ikke her»** eller **«Støtende, skadelig eller villedende»**.",
      "Lagre og vent på Googles gjennomgang.",
    ] },
    { t: "p", text: "Godkjennes forslaget, kan oppføringen fjernes fra søket og Maps. Behandlingen er imidlertid ikke garantert og kan ta tid." },

    { t: "h2", id: "doppelt", text: "Fjern en duplisert Google-oppføring", toc: "Duplikat" },
    { t: "p", text: "Duplikater oppstår ofte ved flytting, navneendring eller utilsiktet flerfoldig opprettelse. Gjør slik:" },
    { t: "ol", items: [
      "Åpne den **dupliserte** profilen i Google Maps.",
      "Klikk på **«Foreslå en endring»** → **«Rapporter som stengt eller fjern»**.",
      "Velg som grunn **«Duplikat av et annet sted»** og lagre.",
    ] },
    { t: "warn", title: "Viktig", text: "Ikke fjern ved en feil den **verifiserte** oppføringen – ellers må du bekrefte den på nytt. Har begge oppføringene allerede anmeldelser, så fjern dem ikke; la dem heller **slås sammen** via Googles support, slik at anmeldelsene bevares." },

    { t: "h2", id: "dauerhaft", text: "Varig og fullstendig fjerning", toc: "Fjern varig" },
    { t: "p", text: "Vil du fjerne en profil **fullstendig og varig** – inkludert alle anmeldelser – fra Google Maps og søket, er det ikke mulig via egen konto. Her hjelper et spesialisert byrå med teknisk fjerning:" },
    { t: "ul", items: [
      "**Effektivitet:** fjerning ofte innen høyst 24 timer",
      "**Fullstendig:** profil og anmeldelser fjernes helt",
      "**SEO-vennlig:** nettstedet og rangeringen din forblir uberørt",
      "**Garantert:** dukker profilen opp igjen via tredjepart, fjernes den uten kostnad",
    ] },
    { t: "cta", title: "Sjekk gratis om din Maps-oppføring kan fjernes.", text: "Skriv inn bedriftsnavnet – vi sjekker på sekunder om og hvor raskt profilen din inkludert alle anmeldelser kan fjernes.", btn: "Sjekk muligheten for fjerning", href: "https://rapid-remove.com/", trust: ["Gratis analyse", "Garanti", "Uten risiko"] },
  ],
  faq: [
    { q: "Hvordan fjerner jeg min egen Google Maps-oppføring?", a: "Via «Din bedriftsprofil» → innstillinger → tre-prikker-menyen → «Fjern bedriftsprofilen» → «Fjern profilinnhold og administratorer». Merk: dette kobler bare oppføringen fra kontoen din, men fjerner den ikke fra Maps." },
    { q: "Hvorfor blir min Google Maps-oppføring stående synlig etter fjerningen?", a: "Fordi det å fjerne den fra kontoen bare merker oppføringen som «Permanent stengt». Oppføringen og anmeldelsene blir stående i Maps og søket. Google tilbyr ingen egen vei for dette; i praksis skjer en fullstendig fjerning normalt via et spesialisert byrå." },
    { q: "Hvordan rapporterer jeg en annens eller feil oppføring?", a: "Åpne oppføringen i Google Maps, «Foreslå en endring» → «Rapporter som stengt eller fjern», angi grunnen (f.eks. «Finnes ikke her») og lagre. Google gjennomgår forslaget." },
    { q: "Hvordan fjerner jeg en duplisert Google-oppføring?", a: "Åpne duplikatet i Maps, «Foreslå en endring» → «Rapporter som stengt eller fjern» → velg «Duplikat av et annet sted». Har begge oppføringene anmeldelser, så la dem heller slås sammen via Googles support." },
    { q: "Kan jeg få fjernet en Google Maps-oppføring varig?", a: "Fullstendig og varig inkludert anmeldelsene skjer det normalt via et spesialisert byrå, siden Google ikke tilbyr selvfjerning. Den tekniske fjerningen skjer ofte innen 24 timer — betaling først etter suksess." },
  ],
  related: [
    { label: "Fjerne Google-bedriftsprofilen: hvordan gjør man det?", url: "https://rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Fjerne Google-anmeldelser: pris og metoder", url: "https://rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Rapporter og fjern en falsk Google-anmeldelse", url: "https://rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Dårlig Google-anmeldelse – hva gjør man?", url: "https://rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
