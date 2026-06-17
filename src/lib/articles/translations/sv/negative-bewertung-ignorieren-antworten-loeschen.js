/* SV — negative-bewertung-ignorieren-antworten-loeschen (Ignorera, svara eller ta bort) */
const article = {
  category: "Rykte",
  meta: {
    slug: "negativ-recension-ignorera-svara-ta-bort",
    title: "Negativ recension: ignorera, svara eller ta bort?",
    h1: "Negativ Google-recension: ignorera, svara eller ta bort?",
    description:
      "Negativ Google-recension – ignorera, svara eller begära borttagning? En tydlig beslutsguide utifrån recensionens karaktär, med konkreta nästa steg.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google-expert",
    date: "2026-06-09",
  },
  dek: "Rätt reaktion beror på **en** fråga: är recensionen befogad eller inte? Genuin, saklig kritik bemöter man med omdöme. Obefogade, fabricerade eller rättsstridiga recensioner låter man ta bort. Och vissa recensioner ignorerar man medvetet. Den här guiden sorterar de tre vägarna klart – så att du inte reagerar ur magkänslan.",
  blocks: [
    { t: "h2", id: "kurz", text: "Det viktigaste kort och gott", toc: "I korthet" },
    { t: "ul", items: [
      "**Ignorera:** vid harmlös, enstaka kritik som försvinner i ett bra totalsnitt.",
      "**Svara:** vid genuin, saklig kritik – svaret är till för de *övriga läsarna*, inte recensenten.",
      "**Begär borttagning:** vid fejk, förolämpningar, falska påståenden eller avsaknad av affärskontakt – här finns ofta en rättslig grund.",
      "**Aldrig:** bråka i affekt, hota eller hänga ut kunder offentligt – det utlöser Streisand-effekten.",
    ] },

    { t: "h2", id: "grundfrage", text: "Grundfrågan: befogad eller inte?", toc: "Befogad?" },
    { t: "p", text: "Innan du reagerar, klargör en sak: beskriver recensionen en **genuin upplevelse** – eller inte? Den distinktionen avgör allt. En ärlig, om än hård åsikt om ett verkligt besök skyddas av yttrandefriheten och är nästan omöjlig att ta bort. En recension utan verklig bakgrund (fejk, konkurrent, förväxling, ren smädelse) är däremot ofta angripbar." },

    { t: "h2", id: "ignorieren", text: "Väg 1: Ignorera – när att inte göra något är rätt", toc: "1 · Ignorera" },
    { t: "p", text: "Inte varje kritisk röst kräver ett svar. Om ni har ett stabilt snitt över 4,0 och en enstaka, saklig 3- eller 4-stjärnig recension dyker upp emellan skadar den knappt – den gör snarare helhetsbilden mer trovärdig. Den som reagerar på *varje* liten sak uppfattas snabbt som överkänslig." },
    { t: "p", text: "**Ignorera är rätt när:** recensionen är enstaka, saklig och knappt märkbar i ett bra snitt." },

    { t: "h2", id: "antworten", text: "Väg 2: Svara – samlat, för de som läser med", toc: "2 · Svara" },
    { t: "p", text: "En genuin, kritisk recension är en scen – inte för gräl med recensenten, utan för att visa **övriga läsare** hur ni hanterar kritik. Ett bra svar är kort, vänligt, lösningsorienterat och fritt från försvarsinställning." },
    { t: "p", text: "Tumregler: svara snabbt, tacka för feedbacken, ta synpunkten på allvar, erbjud en lösning eller ett samtal – och röj aldrig kunduppgifter eller interna detaljer offentligt. Det ni måste undvika är **Streisand-effekten**: den som kontrerar aggressivt eller hotar provocerar ofta en våg av nya negativa recensioner." },
    { t: "p", text: "**Svara är rätt när:** kritiken är genuin och saklig, och ett samlat svar förbättrar helhetsintrycket." },

    { t: "h2", id: "loeschen", text: "Väg 3: Begär borttagning – när det finns en rättslig grund", toc: "3 · Ta bort" },
    { t: "p", text: "Vid **obefogade** recensioner är borttagning den bättre vägen. Goda chanser finns bland annat vid:" },
    { t: "ul", items: [
      "**Fejkrecensioner** utan verklig affärskontakt (t.ex. från konkurrenter),",
      "**Förolämpningar, smädekritik, falska faktapåståenden,**",
      "**1-stjärniga recensioner utan text** utan igenkännbar koppling,",
      "**irrelevanta eller förväxlade** inlägg.",
    ] },
    { t: "p", text: "Att det krävs en **faktisk affärskontakt** är etablerad rättspraxis – Landgericht Lübeck (mål [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) och Bundesgerichtshof (mål [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) har bekräftat detta. Dessa tyska domstolsavgöranden återspeglar EU:s breda rättsliga ram för personlighetsskydd och rätten att bli glömd (GDPR Art. 17), som gäller i hela EU." },
    { t: "p", text: "För genomförandet finns två vägar som vi jämför i detalj: **anmälan/juridisk väg** för den enskilda recensionen och **teknisk profilradering** när profilen som helhet är skadad. Den direkta jämförelsen hittar du under [Advokat eller teknisk borttagning?](/sv/magasin/negativ-google-recension-advokat/), och metoderna och kostnaderna under [Ta bort Google-recensioner](/sv/magasin/ta-bort-google-recensioner/)." },
    { t: "p", text: "**Borttagning är rätt när:** recensionen är obefogad, fabricerad eller rättsstridig – eller när profilen i sin helhet inte längre går att rädda." },

    { t: "h2", id: "schnell", text: "Snabbguide", toc: "Snabbguide" },
    { t: "table", head: ["Situation", "Rekommendation"], rows: [
      ["Enstaka, saklig kritik, bra snitt", "Ignorera"],
      ["Genuin negativ upplevelse, åtgärdbar", "Svara"],
      ["Fejk / konkurrent / ingen verklig kontakt", "Begär borttagning"],
      ["Förolämpning, falskt påstående, smädelse", "Begär borttagning"],
      ["Många negativa recensioner, snittet i botten", "Överväg profilradering"],
    ] },

    { t: "cta", title: "Osäker på om er recension kan tas bort?", text: "Ange företagsnamnet – vi kontrollerar kostnadsfritt på sekunder om och hur snabbt recensionen eller profilen kan tas bort.", btn: "Starta gratis analys", href: "https://www.rapid-remove.com/", trust: ["Kostnadsfri analys", "Inkl. garanti", "Utan risk"] },

    { t: "p", text: "Den här artikeln är praktisk vägledning och utgör inte juridisk rådgivning." },
  ],
  faq: [
    { q: "Ska jag svara på varje negativ recension?", a: "Nej. På genuin, saklig kritik lönar sig ett samlat svar (för de som läser med). Harmlösa enstaka röster i ett bra snitt kan man ignorera; obefogade eller rättsstridiga bör man hellre låta ta bort." },
    { q: "När kan en Google-recension tas bort?", a: "När den bryter mot Googles riktlinjer eller är rättsstridig – till exempel fejk, förolämpningar, falska påståenden eller avsaknad av affärskontakt. Rent sakliga åsikter om genuina upplevelser är däremot nästan omöjliga att ta bort." },
    { q: "Vad är Streisand-effekten?", a: "Fenomenet att ett aggressivt bemötande eller rättsligt hot provocerar recensenten och utlöser ännu fler negativa recensioner. Därför svarar man aldrig i affekt – och väljer vid borttagning diskreta, tekniska vägar." },
    { q: "Vad gör man om det redan finns många dåliga recensioner?", a: "Då är kampen om varje enskild ofta utsiktslös. Mer meningsfullt kan vara den fullständiga profilraderingen med efterföljande ren nystart." },
  ],
  related: [
    { label: "Vad kostar en dålig Google-recension egentligen?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Advokat eller teknisk borttagning?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Ta bort Google-recensioner: kostnader och metoder", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
