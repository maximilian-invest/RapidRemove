/* SV — presseartikel-aus-google-entfernen (Ta bort/avindexera press · pillar) */
const article = {
  category: "Rätt",
  meta: {
    slug: "ta-bort-pressartiklar-fran-google",
    title: "Ta bort negativa pressartiklar från Google",
    h1: "Ta bort och avindexera negativa pressartiklar från Google",
    description:
      "Negativa pressartiklar i Google: när de kan avindexeras eller trängas undan, vilka rättigheter (GDPR) som gäller och hur du går tillväga utan Streisand-effekten.",
    keywords: [],
    author: "Maximilian Hölzl",
    authorRole: "Google-expert",
    date: "2026-06-30",
  },
  dek: "En gammal pressartikel på sida 1 – ett nedlagt ärende, en sak som är klarad sedan länge, en rapport som aldrig borde ha stannat kvar – kan följa företagare i flera år. Artikeln själv går sällan att ta bort, men den behöver inte stå kvar högst upp i Google för alltid. Den här guiden visar vilka vägar som finns: **avindexera** (ta bort ur Google-indexet), **tränga undan** eller agera via **rätten att bli bortglömd**.",
  blocks: [
    { t: "h2", id: "kurz", text: "Det viktigaste kort och gott", toc: "I korthet" },
    { t: "ul", items: [
      "**Ta bort artikeln hos mediet – nästan orealistiskt:** Att få mediet att radera bidraget lyckas sällan – pressfriheten skyddar det.",
      "**Avindexering är verktyget:** Artikeln kan tas ur Googles sökresultat utan att mediet raderar den.",
      "**Rätten att bli bortglömd:** Vid personuppgifter som är inaktuella eller oproportionerligt belastande kan GDPR Art. 17 vara tillämplig.",
      "**Diskretion är avgörande:** Fel väg (hot, påtryckning mot mediet) utlöser Streisand-effekten och förvärrar allt.",
    ] },

    { t: "h2", id: "unterschied", text: "Ta bort, avindexera, tränga undan – vad är skillnaden?", toc: "Skillnaden" },
    { t: "p", text: "Tre begrepp som ofta blandas ihop:" },
    { t: "ul", items: [
      "**Ta bort** innebär att radera artikeln **hos mediet**. Det lyckas sällan, eftersom press- och yttrandefriheten skyddar den.",
      "**Avindexera (deindexering)** innebär att ta bort artikeln ur **Googles sökresultat**. Artikeln finns kvar på mediets webbplats, men dyker inte upp vid en Google-sökning på ert namn.",
      "**Tränga undan** innebär att med hjälp av starkare positivt innehåll skjuta den från **sida 1** bakåt.",
    ] },
    { t: "p", text: "För de flesta drabbade är avindexering eller undanträngning det verkliga målet: det som inte syns i Google existerar i praktiken inte för de flesta människor." },

    { t: "h2", id: "wann", text: "När en pressartikel kan avindexeras", toc: "När det är möjligt" },
    { t: "p", text: "Chanserna beror på innehållet. Goda utgångspunkter är bland annat:" },
    { t: "ul", items: [
      "**Inaktuell information** – t.ex. en rapport om ett ärende som sedan länge är nedlagt eller avgjort till den drabbades fördel.",
      "**Personuppgifter** vars fortsatta visning är oproportionerlig (grund: **rätten att bli bortglömd**, GDPR Art. 17).",
      "**Falska faktapåståenden** eller kränkningar av personlighetsskyddet.",
    ] },
    { t: "p", text: "Ren, legitim journalistik om aktuella, sanna och allmänt relevanta händelser är däremot nästan omöjlig att avindexera – här återstår undanträngning." },

    { t: "h2", id: "recht", text: "Rätten att bli bortglömd", toc: "Rätten att bli bortglömd" },
    { t: "p", text: "EU-domstolen har fastslaget att sökmotorer under vissa förutsättningar måste ta bort resultat kopplade till en persons namn när intresset av att bli glömd väger tyngre än informationsintresset. Avgörande faktorer är bland annat informationens ålder och aktualitet, dess riktighet och personens roll i offentligheten. GDPR Art. 17 – med EU-täckning – är det rättsliga instrumentet för att ta bort personrelaterade träffar ur Google-sökningen, utan att mediet behöver radera artikeln. Tyska domstolsbeslut som Bundesgerichtshofs avgöranden bekräftar hur detta tillämpas i praktiken i EU-domstolarna." },

    { t: "h2", id: "streisand", text: "Fel väg: Streisand-effekten", toc: "Streisand-effekten" },
    { t: "p", text: "Den som sätter ett medium under offentlig press eller skickar advokatbrev riskerar motsatsen: ännu mer uppmärksamhet, nya rapporter, delade skärmbilder. Det fenomenet kallas **Streisand-effekten**. Därför sker en seriös avindexering **i det tysta** – via de föreskrivna rutinerna hos Google och, där det behövs, med rättslig grund – i stället för konfrontation." },

    { t: "h2", id: "vorgehen", text: "Så går du tillväga", toc: "Tillvägagångssätt" },
    { t: "ol", items: [
      "**Kartlägg träffarna:** Vilka artiklar dyker upp vid en Google-sökning på ert namn/företag?",
      "**Klassificera:** Inaktuell, personuppgiftsrelaterad, felaktig → avindexering möjlig. Aktuell, sann, allmänt relevant → snarare undanträngning.",
      "**Ansök om avindexering** eller låt det rättsligt utredas.",
      "**Träng undan parallellt:** Stärk positivt innehåll så att sida 1 också är ren på sikt.",
    ] },
    { t: "p", text: "Tjänsten hittar du under [avindexera press](/sv/avindexera-press/); för träffar som inte kan avindexeras gäller [undanträngning från sida 1](/sv/magasin/ta-bort-negativa-google-resultat/)." },

    { t: "cta", title: "Vilken artikel belastar er – och kan den avindexeras?", text: "Ange träffen – vi kontrollerar kostnadsfritt och utan förbindelser om avindexering eller undanträngning är möjlig.", btn: "Kontrollera kostnadsfritt", href: "https://www.rapid-remove.com/", trust: ["Kostnadsfri analys", "Diskret", "Utan risk"] },

    { t: "p", text: "Den här artikeln är praktisk vägledning och utgör inte juridisk rådgivning." },
  ],
  faq: [
    { q: "Kan man ta bort en pressartikel från Google?", a: "Att få mediet att ta bort artikeln lyckas sällan på grund av pressfriheten. Däremot är avindexering ur Googles sökresultat ofta möjlig – artikeln finns kvar online, men dyker inte upp vid namnsökning." },
    { q: "Vad är skillnaden mellan att ta bort och att avindexera?", a: "Ta bort raderar artikeln vid källan (mediets webbplats). Avindexering (deindexering) tar bort den enbart ur Googles index – för de flesta är den därmed praktiskt osynlig." },
    { q: "Vad är rätten att bli bortglömd?", a: "En rättighet som följer av GDPR (Art. 17) och som under vissa förutsättningar ger rätt att få personuppgiftsrelaterade, inaktuella eller oproportionerligt belastande träffar borttagna ur Googles namnsökning." },
    { q: "Hur undviker jag att det förvärras?", a: "Genom att inte sätta mediet under offentlig press. En diskret avindexering via de officiella rutinerna undviker Streisand-effekten." },
  ],
  related: [
    { label: "Online-rykteshantering för företag – den kompletta guiden", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "Negativa Google-sökresultat – ta bort eller tränga undan", url: "https://www.rapid-remove.com/negative-google-suchergebnisse-verdraengen" },
    { label: "Radera Google-företagsprofil – hur går det till?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
