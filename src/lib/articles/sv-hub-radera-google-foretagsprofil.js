/* SV hub: "Radera Google-företagsprofil" (lead article, MagArticle format) */
const article = {
  meta: {
    slug: "radera-google-foretagsprofil",
    title: "Radera Google-företagsprofil: guide (så här gör du)",
    h1: "Radera Google-företagsprofil – hur går det till egentligen?",
    description: "Google låter dig inte bara radera din företagsprofil. Den här guiden visar varför »permanent stängd» inte är detsamma som raderad — och hur det faktiskt går till.",
    author: "Maximilian Hölzl",
    authorRole: "Google-expert och grundare",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Googles policy",
  iconKey: "trash",
  readingMin: 11,
  dek: "Google låter dig inte bara radera din företagsprofil. Den här guiden visar varför »permanent stängd» inte är detsamma som raderad — och hur det faktiskt går till.",
  blocks: [
    { t: "h2", id: "kurz", text: "Kort sammanfattning", toc: "Kort sammanfattning" },
    { t: "ul", items: [
      "**Att radera själv är nästan omöjligt:** Google erbjuder ingen riktig »ta bort profil»-knapp — bara statusen »permanent stängd».",
      "**»Stängd» ≠ raderad:** Uppgifterna, namnet, adressen och **alla recensioner förblir synliga för allmänheten.**",
      "**Den enda tillförlitliga vägen** är att ta bort profilen helt via de officiella förfarandena — lagligt och permanent.",
      "**RapidRemove** tar bort profilen tillsammans med alla recensioner på **24–48 timmar** — **betalning sker först efter att det lyckats**.",
    ] },
    { t: "p", text: "Du söker på ditt företag på Google — och ser en profil du inte längre vill ha: full av gamla falska recensioner eller hämndrecensioner, med felaktiga uppgifter, eller helt enkelt en post du vill bli av med en gång för alla. Den självklara frågan: **Hur raderar jag min Google-företagsprofil?** Det ärliga svaret är tyvärr mer komplicerat än vad Google låter det verka. Den här guiden visar vad som faktiskt fungerar — steg för steg, utan marknadsföringsfloskler." },

    { t: "h2", id: "herkunft", text: "Vem skapade egentligen den här profilen?", toc: "Vem skapade den?" },
    { t: "p", text: "De flesta företagare som kontaktar oss har aldrig skapat sin profil själva — och blir uppriktigt förvånade över att den finns. Det är inte undantaget, utan regeln. En Google-företagsprofil skapas sällan aktivt av ägaren. Mycket oftare är det någon annan som lägger till den, eller Google som genererar den helt automatiskt. För att förstå varför en sådan post sedan är så svår att bli av med hjälper det att först veta hur den hamnade där. I huvudsak finns det tre vägar." },
    { t: "anim", caption: "Tre sätt som en företagsprofil uppstår på — nästan alltid utan att ägaren gör något." },
    { t: "h3", text: "Väg 1: någon lägger till platsen för hand" },
    { t: "p", text: "Vilken Google-användare som helst kan i Maps-appen trycka på en adress eller en tom yta och välja »Lägg till en plats som saknas». På så vis kan ett företag läggas in utan att man har något med det att göra — det gör kunder, tidigare anställda, konkurrenter eller mycket aktiva Maps-användare (Local Guides)." },
    { t: "p", text: "Det sker dock inte helt utan kontroll. Innan en anmäld plats blir synlig körs en automatisk kontroll i bakgrunden:" },
    { t: "ul", items: [
      "**Plats:** befinner sig användaren verkligen nära platsen som ska läggas till? Det hindrar att någon i Berlin på skämt hittar på ett kafé i München.",
      "**Dubblettkontroll:** finns det redan ett liknande namn eller samma kategori på den koordinaten eller alldeles intill?",
      "**Avstämning mot webben:** Google söker parallellt på namnet för att se om företaget alls dyker upp online.",
    ] },
    { t: "p", text: "Stämmer bilden publiceras punkten — synlig för alla som en **ej gjord anspråk på profil** (unclaimed)." },
    { t: "h3", text: "Väg 2: Google skapar profilen själv utifrån webbdata" },
    { t: "p", text: "Det är vägen som de flesta inte räknar med: Google skapar profiler i stor mängd på eget initiativ — utan ägarens medverkan eller samtycke. Skälet är enkelt: Google vill kartlägga den verkliga världen så heltäckande som möjligt och väntar inte på att ett nytt företag ska höra av sig." },
    { t: "p", text: "För det genomsöker Googles crawlrar ständigt webben efter så kallade **NAP-data** — namn, adress, telefon (*Name, Address, Phone*). Av dessa fragment sätter systemet ihop en profil, utlöst till exempel av:" },
    { t: "ul", items: [
      "**Strukturerad data på webbplatsen:** lägger ett företags sida in den standardiserade `LocalBusiness`-uppmärkningen i källkoden (maskinläsbara uppgifter enligt Schema.org), läser Google av adress, telefon och öppettider direkt och rent.",
      "**Digitala spår på nätet:** Google kombinerar uppgifter från Facebook-sidor, Instagram-profiler, omnämnanden i lokala medier och poster i kataloger online.",
      "**Konsistenskontroll:** dyker samma företag med samma adress upp flera gånger samstämmigt — på den egna webbplatsen, på Facebook och i en lokal blogg — skapar Google automatiskt en ny Maps-post av det.",
    ] },
    { t: "p", text: "De flesta ägare märker det först när de plötsligt ser knappen »Gör anspråk på det här företaget» på kartan." },
    { t: "h3", text: "Väg 3: massimport från officiella register" },
    { t: "p", text: "Den tredje vägen underskattas ofta: Google hämtar in data i stor skala från officiella källor och från dataaggregatorer som man har avtal med." },
    { t: "ul", items: [
      "**Bolags- och handelsregister:** så snart ett företag registreras hos myndigheten eller i handelsregistret strömmar dessa uppgifter till Google med jämna mellanrum — oftast via mellanliggande databaser.",
      "**Branschkataloger:** Google stämmer av sina kartor mot Gula Sidorna och telefonkatalogerna i respektive land. En ny post där kan automatiskt utlösa en ny punkt på Maps.",
    ] },
    { t: "p", text: "Så kan en profil dyka upp kort efter att du har registrerat ditt företag — utan att du någonsin själv varit hos Google." },
    { t: "p", text: "**Varför det spelar roll** Hur profilen än uppstått blir följden densamma: så snart den finns samlar den recensioner och syns i Sök och Maps. Du behöver varken ha skapat den eller hantera den för att påverkas — och just därför räcker det inte att bara strunta i den. Den måste ändå tas bort aktivt." },

    { t: "h2", id: "selbst", text: "Kan man radera en Google-företagsprofil själv?", toc: "Radera själv?" },
    { t: "p", text: "Kort svar: **inte på det sätt du förväntar dig.** Google gör en tydlig åtskillnad mellan ditt personliga Google-konto och den offentliga företagsprofilen (tidigare »Google My Business», numera »Google företagsprofil»). Du kan begära ägarskap och redigera en del uppgifter — men en tydlig knapp som heter »Ta bort den här uppgiften och alla recensioner permanent» finns helt enkelt inte för företagare." },
    { t: "p", text: "Det är ingen tillfällighet, utan ett medvetet val: profilen med sina recensioner är en del av Google Sök och Google Maps. Google betraktar den informationen som värdefull för användarna — och ger nödigt ogärna upp kontrollen över den. Det är precis därför de flesta företagare snabbt stöter på en vägg när de försöker radera sin profil på egen hand." },

    { t: "h2", id: "geschlossen", text: "»Permanent stängd» är *inte* detsamma som raderad", toc: "»Stängd» ≠ raderad" },
    { t: "p", text: "Det alternativ Google erbjuder dig heter »Markera som permanent stängt». Många tror att det innebär att profilen raderas — men det gör det inte. Det är bara en **statusetikett**." },
    { t: "warn", title: "Det här händer faktiskt när du väljer »stängd»", text: "Din profil fortsätter att visas i Google Sök och Google Maps — med namn, adress, foton och **samtliga recensioner**. Det enda som tillkommer är en överkryssad text som säger »Permanent stängd». För potentiella kunder ser det ofta *sämre* ut än tidigare." },
    { t: "p", text: "Med andra ord: den som »stänger» sin profil blir inte av med uppgifterna och recensionerna — i värsta fall gör det problemet ännu synligare. En **riktig radering** tar däremot bort hela [Google Maps-posten](/sv/magasin/ta-bort-google-maps-foretag/) inklusive alla recensioner." },

    { t: "h2", id: "optionen", text: "Vilka alternativ du faktiskt har", toc: "Vilka alternativ" },
    { t: "p", text: "Realistiskt sett finns det tre vägar för att bli av med en oönskad profil — med mycket olika resultat:" },
    { t: "table", rrCol: 3, head: ["Kriterium", "Själv (DIY)", "Advokat", "RapidRemove"], rows: [
      ["Fullständig radering möjlig?", "Praktiskt taget nej", "Osäkert", "Ja"],
      ["Tid", "—", "3–9 månader", "24–48 timmar"],
      ["Kostnad", "—", "3 000 kr+/timme", "Fast pris från 4 500 kr"],
      ["Alla recensioner borta", "Nej", "Enstaka, mödosamt", "Alla på en gång"],
      ["Framgång", "Nej", "Oviss", "Garanterad (No Cure, No Pay)"],
      ["Din arbetsinsats", "Hög", "Hög", "Praktiskt taget noll"],
    ] },
    { t: "p", text: "DIY-vägen slutar nästan alltid med »permanent stängd». Advokatvägen är dyr, långsam och osäker — och utlöser inte sällan [Streisand-effekten](/sv/magasin/negativ-google-recension-advokat/) där uppmärksamheten i stället ökar. Kvar finns den tredje vägen: professionell och fullständig borttagning." },

    { t: "h2", id: "anleitung", text: "Guide: redigera profilen via Google själv", toc: "Steg för steg" },
    { t: "p", text: "Om du vill försöka på egen hand, här är hur det faktiskt ser ut. Räkna med att bästa möjliga resultat är »stängd» — inte »raderad»." },
    { t: "ol", items: [
      "**Begär ägarskap:** Sök på ditt företag på Google och välj »Är du ägare till det här företaget?». Google kräver en verifiering (vykort, telefon, e-post eller video) — det kan ta dagar till veckor.",
      "**Logga in på företagsprofilen:** Hantera profilen direkt från Google Sök när ägarskapet är bekräftat.",
      "**Leta efter »Ta bort profil»:** Under inställningarna hittar du alternativ som »Markera företaget som permanent stängt» eller »Ta bort profil». Det sistnämnda tar bara bort kopplingen till ditt konto — inte den offentliga uppgiften.",
      "**Kontrollera resultatet:** Som regel förblir uppgiften med alla recensioner synlig — nu med etiketten »Permanent stängt». Det egentliga problemet är därmed inte löst.",
    ] },
    { t: "note", title: "Viktigt att känna till", text: "Utan bekräftat ägarskap kan du knappt ändra något alls. Och även med ägarskap är en fullständig borttagning av den offentliga uppgiften inte möjlig via standardgränssnittet." },
    { t: "cta", title: "Vill du hellre direkt kolla om din profil kan raderas?", text: "Ange ditt företagsnamn — vi hittar din riktiga Google-profil och kontrollerar på sekunder om och hur snabbt den kan tas bort. Utan förbehåll och gratis.", btn: "Starta gratis kontroll", href: "/sv/?start=1", trust: ["Betalning sker först efter lyckad radering"] },

    { t: "h2", id: "einzeln", text: "Radera enstaka recensioner eller ta bort hela profilen?", toc: "Recensioner eller profil?" },
    { t: "p", text: "Många börjar med att försöka [anmäla](/sv/magasin/ta-bort-falska-google-recensioner/) enstaka dåliga recensioner till Google. Det är mödosamt och osäkert: Google avslår anmälningar ofta, varje recension måste motiveras separat — och för varje borttagen recension dyker snabbt nya upp. Du bekämpar symtomen." },
    { t: "p", text: "Det hållbara angreppssättet tar tag i roten: **tas hela profilen bort försvinner alla recensioner på en gång** — falska recensioner inkluderade. Permanent i stället för styckevis. Det är just därför vi medvetet inte tar bort enstaka recensioner, utan hela profilen. Den som i ett första steg vill [ta bort enstaka Google-recensioner](/sv/magasin/ta-bort-google-recensioner/) hittar där metoderna och kostnaderna i jämförelse." },
    { t: "tip", title: "Den avgörande fördelen", text: "En borttagen profil kan varken visa gamla *eller* nya recensioner. Problemet är inte förflyttat — det är löst." },

    { t: "h2", id: "legal", text: "Är det lagligt att radera profilen?", toc: "Är det lagligt?" },
    { t: "p", text: "Ja. En professionell borttagning sker uteslutande via de **officiella förfaranden som Google föreskriver** och har genomgått juridisk granskning. Ingenting hackas, ingenting kringgås och ingen obehörig åtkomst skapas. Ditt Google-konto, Gmail och eventuella Google Ads-konton förblir helt opåverkade — liksom din webbplats, din organiska ranking och dina kampanjer." },
    { t: "p", text: "Du känner igen en seriös aktör på att de anger ett riktigt företag med adress och organisationsnummer, är öppna med sin metod och **fakturerar först efter ett lyckat resultat** — inte på vaga löften om »hemliga kontakter hos Google»." },

    { t: "h2", id: "kosten", text: "Hur lång tid tar det — och vad kostar det?", toc: "Tid och kostnad" },
    { t: "p", text: "En professionell radering är normalt klar **inom 24–48 timmar** — i stället för de månader som advokatvägen tar. Vad gäller kostnaden: en advokat fakturerar per timme (ofta 3 000 kr och mer) utan framgångsgaranti. RapidRemove arbetar med ett **transparent fast pris från 4 500 kr** — och du betalar **uteslutande efter lyckad radering**." },
    { t: "p", text: "Låter priset högt? Räkna i stället: en enda synlig falsk recension kan sänka klickfrekvensen märkbart och kosta dig ett mångfalt under flera månader." },

    { t: "h2", id: "ablauf", text: "Så här går raderingen till med RapidRemove", toc: "Så går det till" },
    { t: "ol", items: [
      "**Gratis kontroll:** Ange företagsnamnet. Vi hittar din profil och kontrollerar direkt om raderingen är möjlig — utan förbehåll och gratis.",
      "**Bekräfta och godkänn:** Du bekräftar rätt profil och ger din godkännande för handläggning. Ingen åtkomst till Gmail, Ads eller personliga uppgifter.",
      "**Radering på 24–48 timmar:** Vårt team tar bort profilen tillsammans med alla recensioner — permanent. Betalning sker först därefter.",
    ] },

    { t: "h2", id: "fazit", text: "Slutsats: den snabbaste, säkraste vägen till ett rent sökresultat", toc: "Slutsats" },
    { t: "p", text: "Att radera en Google-företagsprofil på egen hand misslyckas i praktiken nästan alltid på grund av Googles eget system — »permanent stängd» löser inte problemet. Den tillförlitliga vägen är fullständig, laglig borttagning av hela profilen tillsammans med alla recensioner. Snabbt, permanent, förutsägbart — och med betalning först efter lyckat resultat, utan minsta risk." },

    { t: "cta", title: "Kontrollera nu gratis om din profil kan raderas", text: "På några sekunder ser du din riktiga profil och får veta om och hur snabbt vi kan ta bort den. Ingen förskottsbetalning, ingen förpliktelse.", btn: "Starta gratis kontroll", href: "/sv/?start=1", trust: ["Noll risk", "Betalning sker först efter lyckad radering"] },
  ],
  faq: [
    { q: "Kan jag radera min Google-företagsprofil själv?", a: "Bara i begränsad utsträckning. Google erbjuder ingen enkel »ta bort profil»-knapp. Du kan begära ägarskap och markera profilen som »permanent stängd» — men uppgifterna och alla recensioner förblir synliga för allmänheten." },
    { q: "Vad är skillnaden mellan »permanent stängd» och »raderad»?", a: "»Permanent stängd» är bara en status. Profilen visas fortsatt i Sök och Maps, inklusive namn, adress och alla recensioner. En riktig radering tar bort uppgifterna och alla recensioner helt." },
    { q: "Är det lagligt att låta radera en Google-företagsprofil?", a: "Ja. Borttagningen sker via de officiella förfaranden som Google föreskriver och har genomgått juridisk granskning. Ditt Google-konto, Gmail och eventuella Ads-konton förblir helt opåverkade." },
    { q: "Tas även alla recensioner bort?", a: "Ja. När hela företagsprofilen tas bort försvinner alla kopplade recensioner på en gång — även falska recensioner och hämndrecensioner." },
    { q: "Hur lång tid tar raderingen?", a: "Normalt är profilen borttagen inom ungefär 24 timmar. Du kan följa aktuell status när som helst i kundportalen." },
    { q: "Påverkar raderingen min SEO, min webbplats eller Google Ads?", a: "Nej. Det som tas bort är uteslutande företagsprofilen (Google Maps / Google företagsprofil). Din webbplats, din ranking och dina kampanjer förblir oförändrade." },
    { q: "Vad kostar det att låta radera en Google-företagsprofil?", a: "RapidRemove tillämpar ett transparent fast pris från 4 500 kr — och du betalar uteslutande efter lyckad radering (No Cure, No Pay)." },
    { q: "Kan profilen dyka upp igen?", a: "Tredje parter kan i teorin skapa en ny profil. Med det valfria skyddet övervakar vi din post och tar bort en profil som dyker upp på nytt kostnadsfritt under skyddsperioden." },
  ],
};
export default article;
