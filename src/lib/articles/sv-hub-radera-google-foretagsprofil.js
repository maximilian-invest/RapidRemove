/* SV hub: "Radera Google-företagsprofil" (lead article, MagArticle format)

   SEO-Ausbau 21.10.2026 nach EN-Muster (en-hub-delete-google-business-profile.js):
   Kurzantwort, Googles offizielle Schritte mit exakten schwedischen Menübezeichnungen
   (Quelle: support.google.com/business/answer/4669092?hl=sv), Vergleichstabelle der
   Optionen, eigene Abschnitte je Suchintention (vad händer / börja om / Google Maps /
   inget alternativ) + erweiterte FAQ. Herkunft der Profile ans Ende verschoben.
   KERNBOTSCHAFT UNVERÄNDERT: „permanent stängt" bzw. „Ta bort företagsprofil" ist kein
   Löschen — Profil und alle Bewertungen bleiben öffentlich; die vollständige Entfernung
   läuft über die von Google bereitgestellten Verfahren, im Auftrag des Inhabers. */
const article = {
  meta: {
    slug: "radera-google-foretagsprofil",
    title: "Radera Google-företagsprofil: 4 alternativ förklarade (2026)",
    h1: "Radera Google-företagsprofil – så tar du bort företaget från Google på riktigt",
    description: "Googles steg tar bara bort din åtkomst – profilen och alla recensioner finns kvar på Maps. Vad de 4 alternativen gör och hur du tar bort den för gott.",
    author: "Maximilian Hölzl",
    authorRole: "Google-expert och grundare",
    authorHref: "/autor/maximilian-hoelzl/",
    date: "2026-06-04",
    updated: "2026-10-21",
    keywords: [
      "radera google företagsprofil",
      "ta bort google företagsprofil",
      "ta bort företag från google",
      "ta bort företag på google maps",
      "ta bort google my business",
      "radera google my business",
      "radera google företagsprofil permanent",
      "google företagsprofil permanent stängt",
    ],
  },
  category: "Googles policy",
  iconKey: "trash",
  readingMin: 14,
  dek: "»Permanent stängt» är inte detsamma som raderat – och inte heller att ta bort profilen från ditt konto: posten, namnet, adressen och varenda recension syns kvar på Google. Den här guiden visar Googles officiella alternativ, vad vart och ett faktiskt gör och vad som verkligen fungerar för att radera en Google-företagsprofil helt.",
  blocks: [
    { t: "note", title: "Observera", text: "Den här guiden är en praktisk översikt och ingen juridisk rådgivning. För bindande råd om just din situation, kontakta en kvalificerad rådgivare." },

    { t: "lead", text: "Du vill **radera din Google-företagsprofil** eller helt enkelt **ta bort ditt företag från Google** – kanske på grund av gamla falska recensioner, hämndrecensioner, felaktiga uppgifter eller för att verksamheten inte finns längre. Problemet: det Google själv erbjuder som »ta bort» gör något helt annat än de flesta tror. Här ser du exakt vad Googles egna steg gör, vilka alternativ som finns och hur profilen faktiskt försvinner – steg för steg, utan marknadsföringsfloskler." },

    { t: "tip", title: "Kort svar", text: "Du kan inte bara radera en Google-företagsprofil. Som ägare låter Google dig bara **ta bort profilen från ditt konto** (Inställningar för företagsprofil → Ta bort företagsprofil) eller **markera företaget som permanent stängt**. I båda fallen ligger den offentliga posten och **alla recensioner kvar i Google Sök och på Google Maps**. En fullständig borttagning av posten – inklusive varenda recension – går bara via de förfaranden Google tillhandahåller. Det är precis det RapidRemove sköter, på uppdrag av ägaren och med betalning först efter borttagning." },

    { t: "h2", id: "why", text: "Varför det inte finns någon enkel »radera»-knapp", toc: "Ingen raderaknapp" },
    { t: "p", text: "Den som försöker ta bort sin Google-företagsprofil stöter snabbt på en vägg. Du kan markera företaget som **»permanent stängt»** eller ta bort profilen från ditt eget konto – men en tydlig knapp som säger **»radera den här posten och alla recensioner»** finns inte för företagare. Det är inget förbiseende: Google betraktar profilen och recensionerna som värdefull information för användarna och behåller kontrollen själv. Profilen beskriver en verklig plats i världen – därför tillhör den i Googles ögon inte dig, även om du hanterar den." },
    { t: "warn", title: "»Permanent stängt» ≠ raderat", text: "Att markera företaget som stängt tar **inte** bort det. Posten, namnet, adressen, fotona och **alla recensioner syns kvar** i Google Sök och på Google Maps – nu med etiketten »Permanent stängt» ovanpå. Google skriver själv att ett stängt företag *inte tas bort omedelbart* från Maps. För potentiella kunder ser det ofta **sämre** ut än tidigare." },

    { t: "h2", id: "official-steps", text: "Ta bort Google-företagsprofil: Googles officiella steg", toc: "Googles officiella steg" },
    { t: "p", text: "I Googles egen terminologi heter ägaralternativet **»Ta bort företagsprofil»**. Det finns – men det tar bort profilen från *ditt konto*, inte posten från Google. Så här går det till, så att du vet exakt vad du gör (och inte gör)." },
    { t: "h3", text: "På datorn (business.google.com / Google Sök)" },
    { t: "ol", items: [
      "Gå till din företagsprofil och logga in med det Google-konto som är kopplat till profilen (till exempel via business.google.com eller genom att söka på ditt företagsnamn).",
      "Välj **Mer** och sedan **Inställningar för företagsprofil**.",
      "Välj **Ta bort företagsprofil** och sedan **Ta bort profilens innehåll och ansvariga**.",
      "Vill du visa att företaget har stängt kan du slå på **»Ange att ditt företag har stängt permanent»**.",
      "Bekräfta med **Fortsätt** → **Ta bort** → **Klart**.",
    ] },
    { t: "h3", text: "I Google Maps-appen" },
    { t: "p", text: "Googles hjälpsida beskriver borttagningen via företagsprofilen och hänvisar till business.google.com. I praktiken öppnar du din företagsprofil med ägarkontot och letar upp samma alternativ: **Mer** → **Inställningar för företagsprofil** → **Ta bort företagsprofil**. Stegen och resultatet är desamma som på datorn – profilen försvinner ur ditt konto, inte från kartan." },
    { t: "h3", text: "Flera profiler på en gång" },
    { t: "p", text: "Hanterar du flera platser öppnar du **Hanterare för Företagsprofil** på business.google.com, markerar profilerna och väljer **Åtgärder** uppe till höger → **Ta bort företag** → **Ta bort**. Ska de visas som stängda måste du först märka dem som permanent stängda. Får du ett felmeddelande måste du ta bort innehåll och ansvariga separat för varje profil." },
    { t: "warn", title: "Det här säger Google själv händer efteråt", text: "Enligt Googles egen hjälpsida **finns användargenererat innehåll och recensioner kvar**, och företaget **kan fortfarande synas i Sök och Maps**. Det som raderas permanent är ägarnas och de ansvarigas inlägg, foton, videor och svar på recensioner. Bara de **primära ägarna** kan göra det, och nya ägare och ansvariga måste vänta **sju dagar**. Kort sagt: det officiella alternativet avslutar *din* hantering av profilen – det raderar inte profilen." },

    { t: "h2", id: "options", text: "Radera, stänga, ta bort ägare eller föreslå borttagning: vad varje alternativ gör", toc: "Alla alternativ jämförda" },
    { t: "p", text: "Folk söker på »ta bort google my business», »stänga företagsprofil», »radera företag på google» eller »ta bort företag på google maps» – men hos Google är det helt olika åtgärder. Så här påverkar varje alternativ den offentliga posten och recensionerna:" },
    { t: "table", head: ["Alternativ", "Vad det gör", "Syns profilen?", "Syns recensionerna?"], rows: [
      ["Radera (»Ta bort företagsprofil» i inställningarna)", "Tar bort ditt innehåll och alla ansvariga ur ditt konto", "Ja, nu utan ägare", "Ja"],
      ["Markera som permanent stängt", "Lägger till statusen »Permanent stängt»", "Ja, med stängt-etikett", "Ja"],
      ["Ta bort ägare/ansvariga (eller dig själv)", "Du lämnar profilen, innehållet påverkas inte", "Ja, oförändrad", "Ja"],
      ["Föreslå en ändring → »Stäng eller ta bort» på Maps (vem som helst)", "Skickar ett förslag som Google prövar själv", "Oftast ja – avslås ofta", "Ja, om posten inte tas bort"],
      ["Fullständig borttagning (RapidRemove)", "Borttagning via de förfaranden Google tillhandahåller, på uppdrag av ägaren", "Nej, borta från Sök och Maps", "Nej, alla försvinner med profilen"],
    ] },
    { t: "p", text: "En sak till som skapar förvirring: **Google My Business** är helt enkelt det gamla namnet på **Google Företagsprofil**. Oavsett om du kallar det Google-företagskonto, företagssida, Maps-post eller företagsprofil – det är samma post, och samma regler gäller." },

    { t: "h2", id: "what-happens", text: "Vad händer om du tar bort din Google-företagsprofil?", toc: "Vad händer efteråt" },
    { t: "p", text: "Många räknar med att posten försvinner när de tar bort den från sitt konto. Så här ser det faktiskt ut:" },
    { t: "ul", items: [
      "**Din åtkomst upphör:** du och alla ansvariga förlorar kontrollen över profilen. Vill du hantera den igen måste den göras anspråk på och verifieras på nytt.",
      "**Ditt innehåll är borta:** inlägg, foton och videor du laddat upp samt dina svar på recensioner raderas permanent och kan inte återställas.",
      "**Posten ligger kvar:** namn, adress, kategori och öppettider syns som regel fortfarande i Google Sök och på Google Maps.",
      "**Recensionerna ligger kvar:** varenda kundrecension – även falska eller orättvisa – är fortsatt offentlig, nu **utan dina svar** bredvid.",
      "**Vem som helst kan ändra den:** en profil utan ägare kan redigeras av användare och av Google själv, och du får inga aviseringar längre.",
    ] },
    { t: "p", text: "Därför gör det ofta saken värre att ta bort profilen från kontot: de negativa recensionerna finns kvar, men din sida av saken är borta." },

    { t: "h2", id: "start-over", text: "Kan jag radera min företagsprofil och börja om?", toc: "Börja om med ny profil" },
    { t: "p", text: "Inte genom att bara skapa en ny. Finns den gamla posten kvar – och det gör den efter »Ta bort företagsprofil» – ser Google en **andra profil för samma företag på samma adress**. Dubbletter slås oftast ihop med den gamla posten igen (recensionerna inräknade), eller så stängs den nya profilen av. Hur som helst kommer de gamla recensionerna tillbaka." },
    { t: "p", text: "En riktig nystart sker i två steg: först **tas den gamla profilen bort helt**, inklusive alla recensioner; sedan skapar och verifierar du en **ren ny profil** om du vill ha en. RapidRemove sköter det första steget – fast pris, betalning först efter borttagning – och din webbplats och din ranking i sökresultaten påverkas inte." },

    { t: "h2", id: "google-maps", text: "Så tar du bort ett företag på Google Maps", toc: "Ta bort från Google Maps" },
    { t: "p", text: "På Google Maps kan vem som helst – ägare eller inte – be Google att stänga eller ta bort en plats:" },
    { t: "ol", items: [
      "Öppna platsen i Google Maps eller i Google Sök.",
      "Välj **Föreslå en ändring** → **Stäng eller ta bort**.",
      "Välj ett skäl, till exempel permanent stängt, finns inte, dubblett eller spam.",
      "Skicka – Google granskar förslaget och beslutar på egen hand.",
    ] },
    { t: "p", text: "För verkliga, existerande företag avslås sådana förslag oftast eller blir bara till etiketten »Permanent stängt» – posten och recensionerna ligger kvar. Mer om egna poster, poster som andra skapat och dubbletter: [ta bort ett företag från Google Maps](/sv/magasin/ta-bort-google-maps-foretag/)." },

    { t: "h2", id: "no-delete-option", text: "Varför ser jag inget alternativ för att ta bort profilen?", toc: "Inget borttagningsalternativ?" },
    { t: "p", text: "Saknas »Ta bort företagsprofil» i dina inställningar beror det nästan alltid på något av följande:" },
    { t: "ul", items: [
      "**Du är ansvarig, inte primär ägare.** Bara de primära ägarna kan ta bort innehåll och ansvariga från profilen.",
      "**Du blev ägare nyligen.** Nya ägare och ansvariga måste vänta sju dagar innan alternativet blir tillgängligt.",
      "**Profilen är inte verifierad eller inte gjord anspråk på av dig.** Då tillhör den ingen – eller ett annat Google-konto.",
      "**Du är inloggad med fel Google-konto.** Många företag har flera; kontrollera vilket som äger profilen.",
    ] },
    { t: "p", text: "Och även när du hittar knappen: tänk på resultatet. Den tar bort profilen från ditt konto, inte från Google." },

    { t: "h2", id: "ablauf", text: "Så går en fullständig borttagning till med RapidRemove", toc: "Så går det till" },
    { t: "p", text: "Det enda tillförlitliga sättet att få en profil och dess recensioner att försvinna är en **fullständig borttagning av hela företagsprofilen** via de förfaranden Google tillhandahåller, på uppdrag av ägaren – inte att ta bort recensioner en och en. När hela profilen tas bort **försvinner varenda recension med den**, även de falska. Det är skillnaden mellan att behandla symtomen och att ta bort orsaken." },
    { t: "ol", items: [
      "**Gratis kontroll:** Ange företagsnamnet. Vi hittar din profil och kontrollerar direkt om borttagningen är möjlig – utan förbehåll och gratis.",
      "**Bekräfta och godkänn:** Du bekräftar rätt profil och ger ditt godkännande för handläggning. Ingen åtkomst till Gmail, Ads eller personliga uppgifter.",
      "**Borttagning på 24–48 timmar:** Vårt team tar bort profilen tillsammans med alla recensioner – permanent. Betalning sker först därefter.",
    ] },
    { t: "p", text: "Fördelarna i korthet:" },
    { t: "ul", items: [
      "**Snabbt:** profilborttagning normalt inom 24–48 timmar i stället för månader",
      "**Fullständigt:** hela profilen inklusive **alla** recensioner på en gång",
      "**Förutsägbart:** fast pris, betalning **först efter borttagning** – inga öppna timarvoden",
      "**Skydd:** med det valfria skyddet övervakar vi din post och tar bort en profil som dyker upp på nytt kostnadsfritt under skyddsperioden",
      "**SEO-vänligt:** din webbplats och din ranking förblir orörda; en ren ny profil är valfri",
      "**Diskret:** ingen kontakt med recensenterna, ingen Streisand-risk",
    ] },
    { t: "cta", title: "Vill du direkt kolla om din profil kan raderas?", text: "Ange ditt företagsnamn – vi hittar din riktiga Google-profil och kontrollerar på sekunder om och hur snabbt den kan tas bort. Utan förbehåll och gratis.", btn: "Starta gratis kontroll", href: "/sv/?start=1", trust: ["Gratis analys", "Betalning först efter borttagning"] },

    { t: "h2", id: "einzeln", text: "Ta bort enstaka recensioner eller hela profilen?", toc: "Recensioner eller profil?" },
    { t: "p", text: "Många börjar med att försöka [anmäla](/sv/magasin/ta-bort-falska-google-recensioner/) enstaka dåliga recensioner till Google. Det är mödosamt och osäkert: Google avslår anmälningar ofta, varje recension måste motiveras separat – och för varje borttagen recension dyker snabbt nya upp. Du bekämpar symtomen." },
    { t: "p", text: "Det hållbara angreppssättet tar tag i roten: **tas hela profilen bort försvinner alla recensioner på en gång** – falska recensioner inkluderade. Permanent i stället för styckevis. Därför går profilborttagningen inte recension för recension, utan tar bort hela profilen. Är din profil däremot i grunden sund och det bara är en eller några recensioner som stör, erbjuder RapidRemove även [borttagning av enskilda recensioner](/sv/ta-bort-omdome/): du väljer recensionerna, profilen och dina bra recensioner blir kvar, och du betalar bara för de recensioner som faktiskt tas bort (99 € per recension med text upp till 4 veckor gammal, 250 € för alla andra, t.ex. äldre eller enbart stjärnor). Metoderna och kostnaderna i jämförelse hittar du under [ta bort enstaka Google-recensioner](/sv/magasin/ta-bort-google-recensioner/)." },
    { t: "tip", title: "Den avgörande fördelen", text: "En borttagen profil kan varken visa gamla *eller* nya recensioner. Problemet är inte förflyttat – det är löst." },

    { t: "h2", id: "legal", text: "Är det tillåtet att låta ta bort profilen?", toc: "Är det tillåtet?" },
    { t: "p", text: "Ja. En professionell borttagning sker uteslutande via de **förfaranden Google tillhandahåller, på uppdrag av ägaren** – utan obehörig åtkomst. Ditt Google-konto, Gmail och eventuella Google Ads-konton förblir helt opåverkade – liksom din webbplats, din organiska ranking och dina kampanjer." },
    { t: "p", text: "Du känner igen en seriös aktör på att de anger ett riktigt företag med adress och organisationsnummer, är öppna med hur de arbetar och **fakturerar först efter ett lyckat resultat** – inte på vaga löften om »hemliga kontakter hos Google»." },

    { t: "h2", id: "kosten", text: "Hur lång tid tar det – och vad kostar det?", toc: "Tid och kostnad" },
    { t: "p", text: "En professionell borttagning är normalt klar **inom 24–48 timmar** – i stället för de månader som advokatvägen tar. Vad gäller kostnaden: en advokat fakturerar per timme (ofta 3 000 kr och mer) utan att kunna lova ett resultat. RapidRemove arbetar med ett **transparent fast pris från 4 500 kr** – och du betalar **uteslutande efter lyckad borttagning**." },
    { t: "table", rrCol: 3, head: ["Kriterium", "Själv (DIY)", "Advokat", "RapidRemove"], rows: [
      ["Fullständig borttagning möjlig?", "Praktiskt taget nej", "Osäkert", "Ja"],
      ["Tid", "—", "3–9 månader", "24–48 timmar"],
      ["Kostnad", "—", "3 000 kr+/timme", "Fast pris från 4 500 kr"],
      ["Alla recensioner borta", "Nej", "Enstaka, mödosamt", "Alla på en gång"],
      ["Betalning", "—", "Per timme, oavsett resultat", "Först efter borttagning (No Cure, No Pay)"],
      ["Din arbetsinsats", "Hög", "Hög", "Praktiskt taget noll"],
    ] },
    { t: "p", text: "DIY-vägen slutar nästan alltid med »permanent stängt». Advokatvägen är dyr, långsam och osäker – och utlöser inte sällan [Streisand-effekten](/sv/magasin/negativ-google-recension-advokat/) där uppmärksamheten i stället ökar. Låter det fasta priset högt? Räkna i stället: en enda synlig falsk recension kan sänka klickfrekvensen märkbart och kosta dig ett mångfalt under flera månader." },

    { t: "h2", id: "herkunft", text: "Vem skapade egentligen den här profilen?", toc: "Vem skapade den?" },
    { t: "p", text: "De flesta företagare som kontaktar oss har aldrig skapat sin profil själva – och blir uppriktigt förvånade över att den finns. Det är inte undantaget, utan regeln. En Google-företagsprofil skapas sällan aktivt av ägaren. Mycket oftare är det någon annan som lägger till den, eller Google som genererar den helt automatiskt. För att förstå varför en sådan post sedan är så svår att bli av med hjälper det att först veta hur den hamnade där. I huvudsak finns det tre vägar." },
    { t: "anim", caption: "Tre sätt som en företagsprofil uppstår på – nästan alltid utan att ägaren gör något." },
    { t: "h3", text: "Väg 1: någon lägger till platsen för hand" },
    { t: "p", text: "Vilken Google-användare som helst kan i Maps-appen trycka på en adress eller en tom yta och välja »Lägg till en plats som saknas». På så vis kan ett företag läggas in utan att man har något med det att göra – det gör kunder, tidigare anställda, konkurrenter eller mycket aktiva Maps-användare (Local Guides)." },
    { t: "p", text: "Det sker dock inte helt utan kontroll. Innan en anmäld plats blir synlig körs en automatisk kontroll i bakgrunden:" },
    { t: "ul", items: [
      "**Plats:** befinner sig användaren verkligen nära platsen som ska läggas till? Det hindrar att någon i Berlin på skämt hittar på ett kafé i München.",
      "**Dubblettkontroll:** finns det redan ett liknande namn eller samma kategori på den koordinaten eller alldeles intill?",
      "**Avstämning mot webben:** Google söker parallellt på namnet för att se om företaget alls dyker upp online.",
    ] },
    { t: "p", text: "Stämmer bilden publiceras punkten – synlig för alla som en **profil som ingen gjort anspråk på** (unclaimed)." },
    { t: "h3", text: "Väg 2: Google skapar profilen själv utifrån webbdata" },
    { t: "p", text: "Det är vägen som de flesta inte räknar med: Google skapar profiler i stor mängd på eget initiativ – utan ägarens medverkan eller samtycke. Skälet är enkelt: Google vill kartlägga den verkliga världen så heltäckande som möjligt och väntar inte på att ett nytt företag ska höra av sig." },
    { t: "p", text: "För det genomsöker Googles crawlrar ständigt webben efter så kallade **NAP-data** – namn, adress, telefon (*Name, Address, Phone*). Av dessa fragment sätter systemet ihop en profil, utlöst till exempel av:" },
    { t: "ul", items: [
      "**Strukturerad data på webbplatsen:** lägger ett företags sida in den standardiserade `LocalBusiness`-uppmärkningen i källkoden (maskinläsbara uppgifter enligt Schema.org), läser Google av adress, telefon och öppettider direkt och rent.",
      "**Digitala spår på nätet:** Google kombinerar uppgifter från Facebook-sidor, Instagram-profiler, omnämnanden i lokala medier och poster i kataloger online.",
      "**Konsistenskontroll:** dyker samma företag med samma adress upp flera gånger samstämmigt – på den egna webbplatsen, på Facebook och i en lokal blogg – skapar Google automatiskt en ny Maps-post av det.",
    ] },
    { t: "p", text: "De flesta ägare märker det först när de plötsligt ser knappen »Gör anspråk på det här företaget» på kartan." },
    { t: "h3", text: "Väg 3: massimport från officiella register" },
    { t: "p", text: "Den tredje vägen underskattas ofta: Google hämtar in data i stor skala från officiella källor och från dataaggregatorer som man har avtal med." },
    { t: "ul", items: [
      "**Bolags- och handelsregister:** så snart ett företag registreras hos myndigheten eller i handelsregistret strömmar dessa uppgifter till Google med jämna mellanrum – oftast via mellanliggande databaser.",
      "**Branschkataloger:** Google stämmer av sina kartor mot Gula Sidorna och telefonkatalogerna i respektive land. En ny post där kan automatiskt utlösa en ny punkt på Maps.",
    ] },
    { t: "p", text: "Så kan en profil dyka upp kort efter att du har registrerat ditt företag – utan att du någonsin själv varit hos Google." },
    { t: "p", text: "**Varför det spelar roll:** Hur profilen än uppstått blir följden densamma: så snart den finns samlar den recensioner och syns i Sök och Maps. Du behöver varken ha skapat den eller hantera den för att påverkas – och just därför räcker det inte att bara strunta i den. Den måste ändå tas bort aktivt." },

    { t: "h2", id: "fazit", text: "Slutsats: så tar du bort ditt företag från Google för gott", toc: "Slutsats" },
    { t: "p", text: "Att radera en Google-företagsprofil på egen hand slutar i praktiken nästan alltid vid »Ta bort företagsprofil» eller »permanent stängt» – och inget av dem tar bort posten eller recensionerna. Den tillförlitliga vägen är en fullständig borttagning av hela profilen tillsammans med alla recensioner, via de förfaranden Google tillhandahåller, på uppdrag av ägaren. Snabbt, permanent, förutsägbart – och med betalning först efter lyckat resultat." },

    { t: "cta", title: "Kontrollera nu gratis om din profil kan raderas", text: "På några sekunder ser du din riktiga profil och får veta om och hur snabbt vi kan ta bort den. Ingen förskottsbetalning, ingen förpliktelse.", btn: "Starta gratis kontroll", href: "/sv/?start=1", trust: ["Gratis analys", "Betalning först efter borttagning"] },
  ],
  faq: [
    { q: "Hur raderar jag min Google-företagsprofil?", a: "I din företagsprofil väljer du Mer → Inställningar för företagsprofil → Ta bort företagsprofil → Ta bort profilens innehåll och ansvariga, och bekräftar med Fortsätt → Ta bort → Klart. Det avslutar din hantering och raderar dina inlägg, foton och svar på recensioner – men den offentliga posten och recensionerna ligger som regel kvar på Google. Ska själva posten bort måste den tas bort via de förfaranden Google tillhandahåller." },
    { q: "Hur tar jag bort mitt företag från Google helt?", a: "Varken »Ta bort företagsprofil» eller »permanent stängt» tar bort posten från Google Sök och Maps. En fullständig borttagning av profilen inklusive alla recensioner sker via de förfaranden Google tillhandahåller, på uppdrag av ägaren – det är vad RapidRemove sköter, med betalning först efter borttagning." },
    { q: "Kan jag radera min Google-företagsprofil själv?", a: "Bara i begränsad utsträckning. Du kan ta bort profilen från ditt konto eller markera den som »permanent stängd» – men posten och alla recensioner förblir synliga för allmänheten." },
    { q: "Vad är skillnaden mellan »permanent stängt» och raderat?", a: "»Permanent stängt» är bara en status. Profilen visas fortsatt i Sök och Maps, inklusive namn, adress och alla recensioner – bara med en stängt-etikett. En riktig borttagning tar bort posten och alla recensioner helt." },
    { q: "Vad händer om jag tar bort min företagsprofil?", a: "Du förlorar åtkomsten, och dina inlägg, foton och svar på recensioner raderas. Själva posten, recensionerna och uppgifterna syns som regel kvar i Google Sök och på Maps – och vem som helst kan nu föreslå ändringar." },
    { q: "Hur tar jag bort ett företag på Google Maps?", a: "Vem som helst kan välja »Föreslå en ändring» → »Stäng eller ta bort» på platsen i Google Maps. Google beslutar själv och behåller för verkliga företag oftast posten eller markerar den bara som stängd. En fullständig borttagning av posten och recensionerna går via de förfaranden Google tillhandahåller." },
    { q: "Hur tar jag bort Google My Business?", a: "Google My Business heter numera Google Företagsprofil – stegen är desamma: Inställningar för företagsprofil → Ta bort företagsprofil. Tänk på att det bara tar bort profilen från ditt konto, inte posten från Google." },
    { q: "Kan jag radera min företagsprofil och börja om?", a: "Bara om den gamla profilen först tas bort helt. En ny profil för samma företag på samma adress räknas som dubblett och slås oftast ihop med den gamla – recensionerna inräknade – eller stängs av." },
    { q: "Varför ser jag inget alternativ för att ta bort profilen?", a: "Oftast för att du är ansvarig och inte primär ägare, för att du blev ägare för mindre än sju dagar sedan, för att profilen inte är verifierad under ditt konto eller för att du är inloggad med ett annat Google-konto." },
    { q: "Tas även alla recensioner bort?", a: "Ja, vid en fullständig borttagning. När hela företagsprofilen tas bort försvinner alla kopplade recensioner på en gång – även falska recensioner och hämndrecensioner. Med »Ta bort företagsprofil» eller »permanent stängt» ligger de däremot kvar." },
    { q: "Hur lång tid tar borttagningen?", a: "Normalt är profilen borttagen inom 24–48 timmar. Du kan följa aktuell status när som helst i kundportalen." },
    { q: "Påverkar borttagningen min SEO, min webbplats eller Google Ads?", a: "Nej. Det som tas bort är uteslutande företagsprofilen (Google Maps / Google Företagsprofil). Din webbplats, ditt Google-konto, din ranking och dina kampanjer förblir oförändrade." },
    { q: "Är det tillåtet att låta ta bort en Google-företagsprofil?", a: "Ja. Borttagningen sker via de förfaranden Google tillhandahåller, på uppdrag av ägaren, utan obehörig åtkomst. Ditt Google-konto, Gmail och eventuella Ads-konton förblir helt opåverkade." },
    { q: "Vad kostar det att låta ta bort en Google-företagsprofil?", a: "RapidRemove tillämpar ett transparent fast pris från 4 500 kr – och du betalar uteslutande efter lyckad borttagning (No Cure, No Pay). Vill du bara bli av med enstaka recensioner kostar [borttagning av enskilda recensioner](/sv/ta-bort-omdome/) 99 € per recension med text upp till 4 veckor gammal och 250 € för alla andra – bara för de recensioner som faktiskt tas bort." },
    { q: "Kan profilen dyka upp igen?", a: "Tredje parter kan i teorin skapa en ny profil. Med det valfria skyddet övervakar vi din post och tar bort en profil som dyker upp på nytt kostnadsfritt under skyddsperioden." },
  ],
};
export default article;
