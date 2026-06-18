/* NO — presseartikel-aus-google-entfernen (Fjerne/avindeksere presse · pillar) */
const article = {
  category: "Rett",
  meta: {
    slug: "fjern-presseartikler-fra-google",
    title: "Negative presseartikler fjerne fra Google / avindeksere",
    h1: "Negative presseartikler fjerne og avindeksere fra Google",
    description:
      "Negative presseartikler på Google: Når de kan avindekseres eller fortrenges, hvilke rettigheter (GDPR) som gjelder og hvordan du går frem uten Streisand-effekten.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google-ekspert",
    date: "2026-06-30",
  },
  dek: "En gammel presseartikkel på side 1 – en henlagt sak, noe som ble avklart for lenge siden, en artikkel som aldri burde ha blitt liggende – forfølger mange bedriftseiere i årevis. Artikkelen i seg selv lar seg sjelden slette, men den trenger ikke stå øverst på Google for alltid. Denne guiden viser hvilke veier som finnes: **avindeksere** (ta den ut av Google-søket), **fortrenge** eller gå veien via **retten til å bli glemt**.",
  blocks: [
    { t: "h2", id: "kurz", text: "Det viktigste kort oppsummert", toc: "Kort oppsummert" },
    { t: "ul", items: [
      "**Slette artikkelen er sjelden realistisk:** Å få mediet selv til å fjerne den lykkes sjelden – pressefriheten beskytter den.",
      "**Avindeksering er det viktigste grepet:** Artikkelen kan tas ut av Google-søkeresultatene uten at mediet sletter den.",
      "**Retten til å bli glemt:** Ved personopplysninger, utdatert eller uforholdsmessig belastende innhold kan GDPR Art. 17 komme til anvendelse.",
      "**Diskresjon er avgjørende:** Feil fremgangsmåte (trusler, press mot mediet) utløser Streisand-effekten og gjør alt verre.",
    ] },

    { t: "h2", id: "unterschied", text: "Slette, avindeksere, fortrenge – hva er forskjellen?", toc: "Forskjellen" },
    { t: "p", text: "Tre begreper som ofte blandes sammen:" },
    { t: "ul", items: [
      "**Slette** betyr å fjerne artikkelen **hos mediet selv**. Det lykkes sjelden, fordi presse- og ytringsfrihet beskytter den.",
      "**Avindeksere (deindeksering)** betyr å ta artikkelen ut av **Google-søkeresultatene**. Artikkelen finnes fortsatt på mediesiden, men dukker ikke opp i Google-søket på navnet ditt.",
      "**Fortrenge** betyr å skyve den fra **side 1** ved hjelp av sterkere, positivt innhold.",
    ] },
    { t: "p", text: "For de fleste berørte er avindeksering eller fortrenging det egentlige målet: Det som ikke dukker opp på Google, eksisterer praktisk talt ikke for de fleste mennesker." },

    { t: "h2", id: "wann", text: "Når en presseartikkel kan avindekseres", toc: "Når det er mulig" },
    { t: "p", text: "Mulighetene avhenger av innholdet. Gode innfallsvinkler er blant annet:" },
    { t: "ul", items: [
      "**Utdatert informasjon** – f.eks. en artikkel om en sak som for lengst er henlagt eller avgjort til fordel for den berørte.",
      "**Personopplysninger** der fortsatt visning er uforholdsmessig belastende (grunnlag: **retten til å bli glemt**, GDPR Art. 17).",
      "**Uriktige faktapåstander** eller krenkelse av personlighetsrettigheter.",
    ] },
    { t: "p", text: "Ren, lovlig rapportering om aktuelle, sanne og offentlig relevante forhold lar seg derimot knapt avindeksere – her gjenstår fortrenging." },

    { t: "h2", id: "recht", text: "Retten til å bli glemt", toc: "Retten til å bli glemt" },
    { t: "p", text: "EU-domstolen har slått fast at søkemotorer under visse forutsetninger plikter å fjerne resultater knyttet til en person fra navnesøket, når interessen i å bli glemt veier tyngre enn informasjonsinteressen. Relevante momenter er blant annet opplysningenes alder og aktualitet, deres riktighet og personens rolle i offentligheten. GDPR Art. 17 er det rettslige grepet som gjør det mulig å fjerne personrelaterte treff fra Google-søket – uten at mediet trenger å slette artikkelen." },

    { t: "h2", id: "streisand", text: "Feil fremgangsmåte: Streisand-effekten", toc: "Streisand-effekten" },
    { t: "p", text: "Den som offentlig presser et medium eller sender advokatbrev med trusler, risikerer det motsatte: enda mer oppmerksomhet, ny omtale, delte skjermdumpbilder. Dette fenomenet heter **Streisand-effekten** – oppkalt etter en sak der forsøket på å skjule informasjon spredte den til millioner. Derfor foregår seriøs avindeksering **stille** – via de etablerte prosedyrene hos Google og, der det er nødvendig, med rettslig forankring, heller enn gjennom konfrontasjon." },

    { t: "h2", id: "vorgehen", text: "Slik går du frem", toc: "Fremgangsmåte" },
    { t: "ol", items: [
      "**Kartlegg treffene:** Hvilke artikler dukker opp i Google-søket på ditt navn / bedrift?",
      "**Klassifiser:** utdatert, personopplysninger, uriktig → avindeksering er mulig. Aktuell, sann, offentlig relevant → heller fortrenge.",
      "**Søk om avindeksering** eller la det vurderes rettslig.",
      "**Fortreng parallelt:** styrk positivt innhold slik at side 1 forblir ren over tid.",
    ] },
    { t: "p", text: "Tjenesten finner du under [avindeksere presse](/no/avindeksere-presse/); for ikke-avindekserbare treff gjelder [fortrenging fra side 1](/no/magasin/fjern-negative-google-resultater/)." },

    { t: "cta", title: "Hvilken artikkel belaster deg – og kan den avindekseres?", text: "Nevn treffet – vi sjekker gratis og uforpliktende om avindeksering eller fortrenging er mulig.", btn: "Sjekk gratis", href: "https://www.rapid-remove.com/", trust: ["Gratis analyse", "Diskret", "Uten risiko"] },

    { t: "p", text: "Dette innlegget er praktisk veiledning og ikke juridisk rådgivning." },
  ],
  faq: [
    { q: "Kan man slette en presseartikkel fra Google?", a: "Å slette artikkelen hos mediet lykkes sjelden på grunn av pressefriheten. Det som derimot ofte er mulig, er å avindeksere den fra Google-søkeresultatene – artikkelen er fortsatt tilgjengelig online, men dukker ikke opp ved søk på navn." },
    { q: "Hva er forskjellen mellom å slette og å avindeksere?", a: "Sletting fjerner artikkelen ved kilden (mediesiden). Avindeksering (deindeksering) fjerner den kun fra Google-indeksen – for de fleste er den dermed praktisk talt usynlig." },
    { q: "Hva er retten til å bli glemt?", a: "En rettighet utledet av GDPR (Art. 17) som under visse vilkår gir adgang til å fjerne personrelaterte, utdaterte eller uforholdsmessig belastende treff fra Googles navnesøk." },
    { q: "Hvordan unngår jeg at alt blir verre?", a: "Ved ikke å utøve offentlig press mot mediet. En diskret avindeksering via offisielle prosedyrer unngår Streisand-effekten." },
  ],
  related: [
    { label: "Online omdømmehåndtering for bedrifter – den komplette guiden", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "Fjern negative Google-søkeresultater", url: "https://www.rapid-remove.com/negative-google-suchergebnisse-verdraengen" },
    { label: "Slett Google-bedriftsprofil – hvordan går du frem?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
