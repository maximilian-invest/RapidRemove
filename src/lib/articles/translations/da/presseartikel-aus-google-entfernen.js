/* DA — presseartikel-aus-google-entfernen (Fjerne/afindeksere presse · pillar) */
const article = {
  category: "Ret",
  meta: {
    slug: "fjern-presseartikler-fra-google",
    title: "Negative presseartikler fjerne fra Google / afindeksere",
    h1: "Negative presseartikler fjerne fra Google og afindeksere",
    description:
      "Negative presseartikler på Google: hvornår de kan afindekseres eller fortrænges, hvilke rettigheder (GDPR) der gælder – og hvordan man undgår Streisand-effekten.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google-ekspert",
    date: "2026-06-30",
  },
  dek: "En gammel pressartikel på side 1 – en indstillet sag, en for længst afklaret sag, en artikel der aldrig burde have stået der – forfølger virksomhedsejere ofte i årevis. Selve artiklen lader sig sjældent slette, men den behøver ikke stå øverst på Google for evigt. Denne guide viser, hvilke veje der findes: **afindeksere** (fjerne fra Googles indeks), **fortrænge** eller gå via **retten til at blive glemt**.",
  blocks: [
    { t: "h2", id: "kurz", text: "Det vigtigste kort fortalt", toc: "Kort fortalt" },
    { t: "ul", items: [
      "**Slet artiklen ≠ realistisk:** At få mediet til at fjerne indlægget lykkes sjældent – pressefriheden beskytter det.",
      "**Afindeksering er løftestangen:** Artiklen kan fjernes fra Google-søgeresultaterne, uden at mediet sletter den.",
      "**Retten til at blive glemt:** Ved personhenførbare, forældede eller uforholdsmæssigt belastende indholdselementer gælder GDPR art. 17 – EU-dækkende.",
      "**Diskretion tæller:** Den forkerte vej (trusler, pres på mediet) udløser Streisand-effekten og gør alt værre.",
    ] },

    { t: "h2", id: "unterschied", text: "Slette, afindeksere, fortrænge – hvad er forskellen?", toc: "Forskellen" },
    { t: "p", text: "Tre begreber, der ofte blandes sammen:" },
    { t: "ul", items: [
      "**Slette** vil sige at fjerne artiklen **hos mediet selv**. Det lykkes sjældent, fordi presse- og ytringsfrihed beskytter den.",
      "**Afindeksere (deindeksering)** vil sige at fjerne artiklen fra **Google-søgeresultaterne**. Artiklen findes stadig på mediets side, men dukker ikke op, når nogen søger på jeres navn på Google.",
      "**Fortrænge** vil sige at skubbe den bagud via stærkere, positive indholdselementer fra **side 1**.",
    ] },
    { t: "p", text: "For de fleste berørte er afindeksering eller fortrænging det egentlige mål: Det, der ikke dukker op på Google, eksisterer praktisk talt ikke for størstedelen af mennesker." },

    { t: "h2", id: "wann", text: "Hvornår en pressartikel kan afindekseres", toc: "Hvornår muligt" },
    { t: "p", text: "Chancerne afhænger af indholdet. Gode ansatspunkter er bl.a.:" },
    { t: "ul", items: [
      "**Forældet information** – f.eks. en artikel om en sag, der for længst er indstillet eller afgjort til fordel for den berørte.",
      "**Personoplysninger**, hvis fortsatte visning er uforholdsmæssig belastende (grundlag: **retten til at blive glemt**, GDPR art. 17, EU-dækkende).",
      "**Usande kendsgerningspåstande** eller krænkelse af personlighedsrettigheder.",
    ] },
    { t: "p", text: "Ren, lovlig reportage om aktuelle, sande og offentligt relevante forhold kan derimod næppe afindekseres – her er fortrænging det tilgængelige alternativ." },

    { t: "h2", id: "recht", text: "Retten til at blive glemt", toc: "Retten til at blive glemt" },
    { t: "p", text: "EU-Domstolen har fastslået, at søgemaskiner under bestemte betingelser skal fjerne resultater om en person fra navnesøgning, når hensynet til at blive glemt opvejer informationsinteressen. Afgørende er bl.a. oplysningernes alder og aktualitet, deres rigtighed og personens rolle i offentligheden. Det er det juridiske løftestang, som kan få personhenførbare resultater fjernet fra Google-søgning – uden at mediet behøver at slette artiklen. Grundlaget er GDPR art. 17, der gælder i hele EU." },

    { t: "h2", id: "streisand", text: "Den forkerte vej: Streisand-effekten", toc: "Streisand-effekten" },
    { t: "p", text: "Den, der offentligt presser et medie eller truer med advokatpost, risikerer det modsatte: netop øget opmærksomhed, ny dækning, delte screenshots. Dette fænomen kaldes **Streisand-effekten**. Derfor foregår en seriøs afindeksering **stille og diskret** – via de rette procedurer hos Google og, hvor nødvendigt, med juridisk fundament, frem for konfrontation." },

    { t: "h2", id: "vorgehen", text: "Sådan griber I det an", toc: "Fremgangsmåde" },
    { t: "ol", items: [
      "**Kortlæg resultaterne:** Hvilke artikler dukker op ved Google-søgning på jeres navn/virksomhed?",
      "**Kategorisér:** Forældet, personhenførbar, falsk → afindeksering mulig. Aktuel, sand, offentligt relevant → hellere fortrænge.",
      "**Ansøg om afindeksering** og/eller lad det juridisk vurdere.",
      "**Fortræng parallelt:** Styrk positive indholdselementer, så side 1 forbliver ren på lang sigt.",
    ] },
    { t: "p", text: "Servicen hertil finder I under [afindeksere presse](/da/afindeksere-presse/); for resultater, der ikke kan afindekseres, gælder [fortrænging fra side 1](/da/magasin/fjern-negative-google-resultater/)." },

    { t: "cta", title: "Hvilken artikel belaster – og kan den afindekseres?", text: "Nævn resultatet – vi tjekker gratis og uforpligtende, om afindeksering eller fortrænging er mulig.", btn: "Tjek gratis", href: "https://www.rapid-remove.com/", trust: ["Gratis analyse", "Diskret", "Uden risiko"] },

    { t: "p", text: "Dette indlæg er en praktisk vejledning og ikke juridisk rådgivning." },
  ],
  faq: [
    { q: "Kan man slette en pressartikel fra Google?", a: "At slette artiklen hos mediet lykkes sjældent pga. pressefriheden. Til gengæld er afindeksering fra Google-søgeresultaterne ofte mulig – artiklen forbliver online, men dukker ikke op ved navnesøgning." },
    { q: "Hvad er forskellen på sletning og afindeksering?", a: "Sletning fjerner artiklen ved kilden (mediets side). Afindeksering (deindeksering) fjerner den kun fra Googles indeks – for de fleste mennesker er den dermed praktisk talt usynlig." },
    { q: "Hvad er retten til at blive glemt?", a: "Et krav afledt af GDPR (art. 17), hvormed personhenførbare, forældede eller uforholdsmæssigt belastende resultater i visse tilfælde kan fjernes fra Googles navnesøgning. Det gælder i hele EU." },
    { q: "Hvordan undgår jeg, at alt bliver værre?", a: "Ved ikke offentligt at lægge pres på mediet. En diskret afindeksering via de officielle procedurer undgår Streisand-effekten." },
  ],
  related: [
    { label: "Online omdømmestyring for virksomheder – den komplette guide", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "Fjern og fortræng negative Google-resultater", url: "https://www.rapid-remove.com/negative-google-suchergebnisse-verdraengen" },
    { label: "Slet Google-virksomhedsprofil", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
