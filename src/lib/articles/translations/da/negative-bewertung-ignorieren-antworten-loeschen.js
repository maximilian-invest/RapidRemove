/* DA — negative-bewertung-ignorieren-antworten-loeschen (Ignorere, svare eller fjerne) */
const article = {
  category: "Omdømme",
  meta: {
    slug: "negativ-anmeldelse-ignorere-svare-fjerne",
    title: "Negativ anmeldelse: ignorere, svare eller fjerne?",
    h1: "Negativ Google-anmeldelse: ignorere, svare eller fjerne?",
    description:
      "Negativ Google-anmeldelse: ignorere, svare eller få den fjernet? En klar beslutningsvejledning efter anmeldelsestype – med de næste skridt.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google-ekspert",
    date: "2026-06-09",
  },
  dek: "Den rigtige reaktion afhænger af **ét** spørgsmål: Er anmeldelsen berettiget eller ej? Ægte, saglig kritik besvarer man suverænt. Uberettigede, falske eller retsstridige anmeldelser lader man fjerne. Og nogle anmeldelser ignorerer man bevidst. Denne vejledning sætter de tre veje klart i system – så I ikke reagerer på mavefornemmelse.",
  blocks: [
    { t: "h2", id: "kurz", text: "Det vigtigste kort fortalt", toc: "Kort fortalt" },
    { t: "ul", items: [
      "**Ignorere:** ved harmløs, enkeltstående kritik, der forsvinder i et godt samlet gennemsnit.",
      "**Svare:** ved ægte, saglig kritik – svaret er for de *andre læsere*, ikke for forfatteren.",
      "**Få fjernet:** ved falske anmeldelser, fornærmelser, usande påstande eller manglende forretningskontakt – her er der ofte krav på fjernelse.",
      "**Aldrig:** reagere i affekt, true eller offentligt hænge kunder ud – det udløser Streisand-effekten.",
    ] },

    { t: "h2", id: "grundfrage", text: "Grundspørgsmålet: berettiget eller ej?", toc: "Berettiget?" },
    { t: "p", text: "Inden I reagerer, afklar ét spørgsmål: Beskriver anmeldelsen en **reel oplevelse** – eller ikke? Alt afgøres langs den linje. En ærlig, om end hård mening om et virkeligt besøg er beskyttet af ytringsfrihed og næsten umulig at få fjernet. En anmeldelse uden reel baggrund (falsk, konkurrent, forveksling, ren hån) kan derimod ofte anfægtes." },

    { t: "h2", id: "ignorieren", text: "Vej 1: Ignorere – hvornår er det rigtigt at gøre ingenting?", toc: "1 · Ignorere" },
    { t: "p", text: "Ikke enhver kritisk stemme kræver en reaktion. Har I et solidt gennemsnit over 4,0 og en enkelt, saglig 3- eller 4-stjerne-anmeldelse imellem, skader den næppe – den gør faktisk det samlede billede mere troværdigt. Den, der reagerer på *enhver* bagatel, virker hurtigt overfølsom." },
    { t: "p", text: "**Ignorere er rigtigt, når:** anmeldelsen er enkeltstående, saglig og usynlig i et godt gennemsnit." },

    { t: "h2", id: "antworten", text: "Vej 2: Svare – suverænt, for medlæserne", toc: "2 · Svare" },
    { t: "p", text: "En ægte, kritisk anmeldelse er en scene – ikke til strid med forfatteren, men til at vise **andre læsere**, hvordan I håndterer kritik. Et godt svar er kort, venligt, løsningsorienteret og uden trang til at retfærdiggøre sig." },
    { t: "p", text: "Tommelfingerregler: svar hurtigt, tak for tilbagemeldingen, tag anliggendet seriøst, tilbyd en løsning eller en samtale – og del aldrig kundedata eller interne forhold offentligt. Det, I skal undgå her, er **Streisand-effekten**: Den, der svarer aggressivt eller truer, provokerer ofte en bølge af yderligere negative anmeldelser." },
    { t: "p", text: "**Svare er rigtigt, når:** kritikken er ægte og saglig, og et suverænt svar forbedrer helhedsindtrykket." },

    { t: "h2", id: "loeschen", text: "Vej 3: Få fjernet – hvornår er der krav på det?", toc: "3 · Fjerne" },
    { t: "p", text: "Ved **uberettigede** anmeldelser er fjernelse den bedre vej. Der er gode chancer bl.a. ved:" },
    { t: "ul", items: [
      "**Falske anmeldelser** uden reel forretningskontakt (f.eks. fra konkurrenter),",
      "**fornærmelser, hånende kritik, usande kendsgerningspåstande,**",
      "**1-stjerne-anmeldelser uden tekst** uden tydelig tilknytning,",
      "**irrelevante eller forvekslede** indlæg.",
    ] },
    { t: "p", text: "At det kræver en **reel forretningskontakt**, er fastslået retspraksis – Landgericht Lübeck (sagsnr. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) og Bundesgerichtshof (sagsnr. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) har bekræftet dette som tysk/EU-retspraksis. I EU gælder desuden retten til at blive glemt efter GDPR art. 17." },
    { t: "p", text: "Der er to veje til at komme videre, som vi sammenligner i detaljer: **indberetning/advokatvej** for den enkelte anmeldelse og **teknisk profil-sletning**, når profilen som helhed er beskadiget. Den direkte sammenligning finder I under [Advokat eller teknisk fjernelse?](/da/magasin/negativ-google-anmeldelse-advokat/) og metoderne under [Fjern Google-anmeldelser](/da/magasin/fjern-google-anmeldelser/)." },
    { t: "p", text: "**Fjernelse er rigtigt, når:** anmeldelsen er uberettiget, falsk eller retsstridig – eller profilen som helhed ikke kan reddes." },

    { t: "h2", id: "schnell", text: "Hurtig-beslutning", toc: "Beslutning" },
    { t: "table", head: ["Situation", "Anbefaling"], rows: [
      ["Enkeltstående, saglig kritik, godt gennemsnit", "Ignorere"],
      ["Ægte negativ oplevelse, kan løses", "Svare"],
      ["Falsk / konkurrent / ingen reel kontakt", "Få fjernet"],
      ["Fornærmelse, usand påstand, hån", "Få fjernet"],
      ["Mange negative anmeldelser, gennemsnit i bund", "Overvej profil-sletning"],
    ] },

    { t: "cta", title: "Usikker på, om jeres anmeldelse kan fjernes?", text: "Skriv virksomhedens navn – vi tjekker på sekunder gratis, om og hvor hurtigt anmeldelsen eller profilen kan fjernes.", btn: "Start gratis tjek", href: "https://www.rapid-remove.com/", trust: ["Gratis analyse", "Inkl. garanti", "Uden risiko"] },

    { t: "p", text: "Dette indlæg er en praktisk vejledning og ikke juridisk rådgivning." },
  ],
  faq: [
    { q: "Skal jeg svare på enhver negativ anmeldelse?", a: "Nej. Ægte, saglig kritik fortjener et suverænt svar (for medlæserne). Harmløse enkeltstemmer i et godt gennemsnit kan man ignorere; uberettigede eller retsstridige anmeldelser bør man hellere have fjernet." },
    { q: "Hvornår kan en Google-anmeldelse fjernes?", a: "Når den overtræder Googles retningslinjer eller er retsstridig – f.eks. falske anmeldelser, fornærmelser, usande påstande eller manglende forretningskontakt. Rent saglige meninger om ægte oplevelser er til gengæld næsten umulige at få fjernet." },
    { q: "Hvad er Streisand-effekten?", a: "Når en aggressiv reaktion eller juridisk trussel provokerer forfatteren til at poste flere negative anmeldelser. Derfor reagerer man aldrig i affekt – og vælger diskrete, tekniske veje til fjernelse." },
    { q: "Hvad gør man, hvis der allerede er mange dårlige anmeldelser?", a: "Så er kampen om hver enkelt ofte udsigtsløs. Det kan være mere fornuftigt at slette hele profilen og begynde frisk." },
  ],
  related: [
    { label: "Hvad koster en dårlig Google-anmeldelse egentlig?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Advokat eller teknisk fjernelse?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Fjern Google-anmeldelser", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
