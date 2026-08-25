/* NL — google-rezension-loeschen-lassen */
const article = {
  category: "Gids",
  meta: {
    slug: "google-review-verwijderen-hoe",
    title: "Een Google review verwijderen: formulier, kosten en gids (2026)",
    h1: "Een Google review verwijderen: formulier, kosten en gids",
    description: "Een Google review laten verwijderen – met of zonder formulier, gratis of via een bureau? Zo verwijdert u eigen en andermans reviews, en zo ziet u welke review is verwijderd.",
    keywords: ["google review verwijderen", "google review laten verwijderen", "google review verwijderen kosten", "google review verwijderen formulier", "eigen google review verwijderen", "google review gratis verwijderen"],
    author: "Matthias Lang",
    authorRole: "Google-expert",
    date: "2026-06-04",
  },
  dek: "Of het nu gaat om een eigen review die u wilt intrekken, of om andermans review die uw bedrijf schaadt: in deze gids leert u **hoe u een Google review laat verwijderen** – gratis via het rapportageformulier, als bedrijf via het officiële beheer en, indien nodig, blijvend via een bureau. Plus: hoe u ziet of een review echt is verwijderd.",
  blocks: [
    { t: "note", title: "Opmerking", text: "Dit artikel is een praktische gids en geen juridisch advies." },

    { t: "h2", id: "eigene", text: "Een eigen Google review verwijderen", toc: "Eigen verwijderen" },
    { t: "p", text: "Een review die u **zelf hebt geschreven**, kunt u op elk moment gratis verwijderen:" },
    { t: "ol", items: [
      "Open Google Maps op de computer of in de app en meld u aan.",
      "Klik op het menu en daarna op **„Je bijdragen”** of „Reviews”.",
      "Zoek de review, klik op het **menu met drie puntjes** en kies **„Review verwijderen”**.",
      "Bevestig de handeling.",
    ] },
    { t: "p", text: "Dit werkt alleen voor **eigen** reviews. Andermans reviews over uw bedrijf kunt u niet rechtstreeks verwijderen – alleen rapporteren." },

    { t: "h2", id: "formular", text: "Andermans review laten verwijderen: het formulier", toc: "Het formulier" },
    { t: "p", text: "Schaadt een review van iemand anders uw bedrijf, ga dan als volgt te werk:" },
    { t: "ol", items: [
      "Open uw **Google-bedrijfsprofiel** en ga naar de reviews.",
      "Klik naast de betreffende review op het **menu met drie puntjes** en daarna op **„Review rapporteren”**.",
      "Kies in het **formulier** de passende overtreding (bv. onjuiste informatie, off-topic, belangenconflict).",
      "Via de **Google-tool voor het beheer van reviews** kunt u de verwerkingsstatus volgen en meerdere meldingen bundelen.",
    ] },
    { t: "p", text: "Belangrijk: verwijdering vindt alleen plaats als Google een **richtlijnschending** vaststelt. Zuivere meningsuitingen over echte ervaringen worden doorgaans niet verwijderd." },

    { t: "h2", id: "kosten", text: "Wat kost het om een review te laten verwijderen?", toc: "Wat het kost" },
    { t: "table", head: ["Weg", "Kosten", "Succes"], rows: [
      ["Zelf rapporteren (formulier)", "gratis", "vaak gering"],
      ["Goedkope aanbieders", "ca. 19 – 49 € / review", "sterk wisselend"],
      ["Gespecialiseerde advocaten (losse review)", "ca. 100 – 159 € / review", "ca. 90 %, traag"],
      ["Profielverwijdering (RapidRemove)", "vaste prijs, betaalbaar na succes", "gegarandeerd (alle reviews weg)"],
    ] },

    { t: "h2", id: "kostenlos-vs", text: "Gratis vs. betaald: wat levert wat op?", toc: "Gratis vs. betaald" },
    { t: "p", text: "De gratis weg via het formulier loont altijd als **eerste poging** – vooral bij overduidelijke spam. De realiteit is echter ontnuchterend: Google beoordeelt grotendeels geautomatiseerd en wijst veel meldingen af met standaardteksten. Blijft succes uit, dan is een **professionele verwijdering** de volgende stap. Let daarbij op een **succesfee** – zo draagt u geen kostenrisico als de verwijdering niet lukt." },

    { t: "h2", id: "geloescht-sehen", text: "Waaraan zie ik dat een review is verwijderd?", toc: "Is ze verwijderd?" },
    { t: "p", text: "Een verwijderde review verdwijnt uit uw profiel, en uw **gemiddelde beoordeling** en het **aantal reviews** passen zich aan. Een directe „verwijderd”-status wordt u niet getoond; de betrouwbaarste indicator is dat de review inclusief sterbeoordeling niet meer zichtbaar is en het gemiddelde overeenkomstig verandert. Documenteer vooraf de uitgangssituatie met een screenshot, zodat u de voor-en-na-vergelijking hebt." },

    { t: "h2", id: "profil-loeschen", text: "Blijvende oplossing: het hele profiel laten verwijderen", toc: "Heel profiel verwijderen" },
    { t: "p", text: "Als het formulier geen effect heeft en meerdere reviews uw profiel blijvend beschadigen, is de **profielverwijdering** de meest directe weg. Het belangrijke verschil: RapidRemove verwijdert **geen losse reviews, maar het hele Google-bedrijfsprofiel** – alle reviews verdwijnen daarbij mee. Het resultaat is een schone lei in plaats van een gevecht om elke ster." },
    { t: "ul", items: [
      "**24 – 48 uur** in plaats van weken of maanden",
      "**het hele profiel inclusief alle reviews** in één keer",
      "**Garantie:** verschijnt het profiel via derden weer, dan wordt het gratis verwijderd",
      "**geen inspanning** voor u, geen Streisand-risico",
      "**optionele nieuwe start** met een schoon profiel",
    ] },
    { t: "warn", title: "Belangrijk", text: "De profielverwijdering verwijdert het **hele profiel**, niet één review. Wie alleen één review wil verwijderen en het profiel wil behouden, gebruikt rapporteren of de advocatenweg. Sinds kort biedt RapidRemove precies dat ook aan: [losse reviews verwijderen](https://www.rapid-remove.com/nl/review-laten-verwijderen/) – u betaalt per daadwerkelijk verwijderde review, alleen bij succes." },
    { t: "cta", title: "Profiel blijvend beschadigd? Controleer gratis de verwijderbaarheid.", text: "Binnen seconden ziet u of en hoe snel uw profiel inclusief alle reviews verwijderd kan worden.", btn: "Verwijderbaarheid checken", href: "https://www.rapid-remove.com/", trust: ["Gratis analyse", "Met garantie", "Zonder risico"] },
  ],
  faq: [
    { q: "Kan ik een eigen Google review weer verwijderen?", a: "Ja. Open in Google Maps „Je bijdragen”, kies de review en klik in het menu met drie puntjes op „Review verwijderen”. Dat is gratis en op elk moment mogelijk." },
    { q: "Bestaat er een formulier om een Google review te laten verwijderen?", a: "Ja. Via het menu met drie puntjes naast de review komt u bij „Review rapporteren” en daarmee bij het rapportageformulier. De status volgt u via de Google-tool voor het beheer van reviews." },
    { q: "Kan ik een Google review gratis laten verwijderen?", a: "Eigen reviews ja. Andermans reviews kunt u gratis rapporteren – of Google ze verwijdert, is echter niet gegarandeerd. Voor een zekere verwijdering bestaan betaalde diensten met succesfee." },
    { q: "Hoe zie ik of mijn gerapporteerde review is verwijderd?", a: "De review verdwijnt uit het profiel en het beoordelingsgemiddelde en het aantal reviews veranderen. Een expliciete status wordt niet getoond – een screenshot vooraf helpt bij het vergelijken." },
    { q: "Wat kost het verwijderen van een Google review?", a: "Van gratis (zelf rapporteren) via 19–49 € (goedkope diensten) tot 100–159 € per review bij de advocaat. Bij profielverwijdering geldt een vaste prijs, betaalbaar na succes." },
    { q: "Verwijdert RapidRemove losse reviews?", a: "Ja, inmiddels wel: [één Google-review verwijderen](https://www.rapid-remove.com/nl/review-laten-verwijderen/) – € 179 per verwijderde review, betalen alleen bij succes; de review mag maximaal 4 weken oud zijn en moet tekst bevatten. Is het profiel als geheel beschadigd, dan blijft het verwijderen van het volledige profiel met alle reviews de grondigste weg." },
  ],
  related: [
    { label: "Negatieve review: advocaat of technische verwijdering?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Een 1-sterreview zonder tekst verwijderen", url: "https://www.rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
    { label: "Slechte Google review – wat te doen?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
    { label: "Google-bedrijfsprofiel verwijderen: hoe werkt dat?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
