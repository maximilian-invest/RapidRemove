/* DE article: "Negative Google-Suchergebnisse verdrängen oder entfernen" — BOFU-nah.
   Feeder zum ORM-Pillar/Service: entfernen vs. verdrängen, mit Zuordnungstabelle. */
const article = {
  meta: {
    slug: "negative-google-suchergebnisse-verdraengen",
    title: "Negative Google-Suchergebnisse verdrängen & entfernen",
    h1: "Negative Google-Suchergebnisse verdrängen oder entfernen",
    description:
      "Negative Google-Treffer entfernen oder von Seite 1 verdrängen? Was wirklich geht, wie lange es dauert und welcher Weg sich für welchen Fall eignet.",
    author: "Maximilian Hölzl",
    authorRole: "Google-Experte",
    date: "2026-06-23",
    keywords: [],
  },
  category: "Reputation",
  iconKey: "search",
  readingMin: 7,
  dek: "Ein negativer Treffer zu Ihrem Namen auf Seite 1 kostet Vertrauen, Kunden und Bewerber. Zwei Wege führen heraus: das Ergebnis **entfernen** (wenn es rechtswidrig oder löschbar ist) oder es **von Seite 1 verdrängen** (wenn es bleibt, aber niemand mehr finden soll). Dieser Artikel zeigt, welcher Weg für welchen Fall passt – und was realistisch erreichbar ist.",
  blocks: [
    { t: "h2", id: "kurz", text: "Das Wichtigste in Kürze", toc: "In Kürze" },
    { t: "ul", items: [
      "**Entfernen** geht bei rechtswidrigen/gefälschten Inhalten und beim eigenen Unternehmensprofil – dauerhaft.",
      "**Verdrängen** ist der Weg, wenn ein Treffer rechtmäßig ist, aber nicht mehr sichtbar sein soll.",
      "**Seite 1 ist alles:** Kaum jemand klickt auf Seite 2 – „verdrängt“ wirkt in der Praxis fast wie „weg“.",
      "**Verdrängen dauert** Wochen bis Monate; Entfernen oft nur Tage.",
    ] },

    { t: "h2", id: "warum", text: "Warum Seite 1 über alles entscheidet", toc: "Warum Seite 1" },
    { t: "p", text: "Wenn jemand Ihren Namen googelt, zählt fast nur, was auf **Seite 1** steht. Die Klicks konzentrieren sich extrem stark auf die obersten Treffer; Seite 2 sieht praktisch niemand. Ein negativer Artikel oder Eintrag auf Position 3 prägt damit Ihr Bild bei Kunden, Partnern und Bewerbern – jeden Tag aufs Neue. Genau deshalb ist das Ziel nicht „irgendwo gelöscht“, sondern „nicht mehr auf Seite 1“." },

    { t: "h2", id: "entfernen", text: "Weg 1: Entfernen – wenn der Treffer löschbar ist", toc: "Weg 1: Entfernen" },
    { t: "p", text: "Manche Treffer lassen sich vollständig aus der Anzeige entfernen:" },
    { t: "ul", items: [
      "**Das eigene Google-Unternehmensprofil** samt Bewertungen – über die offiziellen Verfahren (siehe [Profil löschen](/magazin/google-unternehmensprofil-loeschen/)).",
      "**Rechtswidrige Inhalte** – Beleidigungen, falsche Tatsachenbehauptungen, Persönlichkeitsrechtsverletzungen.",
      "**Personenbezogene Daten** – unter Umständen über das „Recht auf Vergessenwerden“ (DSGVO).",
    ] },
    { t: "p", text: "Entfernen ist der direkteste Weg, weil das Problem verschwindet statt nur verschoben zu werden – und es geht oft in Tagen statt Monaten." },

    { t: "h2", id: "verdraengen", text: "Weg 2: Verdrängen – wenn der Treffer bleibt", toc: "Weg 2: Verdrängen" },
    { t: "p", text: "Nicht alles ist löschbar. Ein rechtmäßiger Presseartikel, ein altes Forenposting, ein Eintrag eines Dritten – das lässt sich juristisch oft nicht erzwingen. Hier hilft **Verdrängen**: Man baut und stärkt gezielt hochwertige, positive Inhalte (eigene Seiten, Profile, Beiträge, Erwähnungen), die Google als relevanter einstuft. Mit der Zeit rücken diese nach oben – und der unerwünschte Treffer rutscht auf Seite 2 oder tiefer, wo ihn kaum noch jemand sieht." },
    { t: "p", text: "Verdrängen ist Ausdauerarbeit: Es dauert in der Regel **Wochen bis Monate** und wirkt dafür nachhaltig. Wie wir dabei vorgehen, sehen Sie auf der Service-Seite [Reputation verdrängen](/reputation-verdraengen/)." },

    { t: "h2", id: "zuordnung", text: "Entfernen oder verdrängen? Die Zuordnung", toc: "Zuordnung" },
    { t: "table", head: ["Art des Treffers", "Empfohlener Weg"], rows: [
      ["Eigenes Unternehmensprofil / Bewertungen", "Entfernen"],
      ["Fake, Beleidigung, falsche Tatsachen", "Entfernen"],
      ["Personenbezogene Daten (DSGVO)", "Entfernen (Löschantrag)"],
      ["Rechtmäßiger Presseartikel", "Verdrängen (oder Presse auslisten)"],
      ["Altes Forum/Blog eines Dritten", "Verdrängen"],
    ] },
    { t: "p", text: "Bei Presseartikeln gibt es zusätzlich den Spezialweg [Presse aus Google auslisten](/presse-auslisten/)." },

    { t: "h2", id: "selbst", text: "Was Sie selbst tun können", toc: "Selbst tun" },
    { t: "p", text: "Eigene Profile (Website, Branchen- und Social-Profile) konsequent pflegen und mit gutem Inhalt füllen – das ist die Basis jeder Verdrängung. Für die schnelleren Hebel (Profil-Entfernung, rechtswidrige Inhalte, hartnäckige Treffer) sind spezialisierte Verfahren nötig, weil die Google-Bordmittel hier nicht greifen." },

    { t: "cta", title: "Welcher Treffer stört – und lässt er sich entfernen?", text: "Firmennamen oder Treffer nennen – wir prüfen kostenlos, ob sich das Ergebnis entfernen oder verdrängen lässt.", btn: "Gratis-Check starten", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Analyse", "Inkl. Garantie", "Ohne Risiko"] },

    { t: "p", text: "Dieser Beitrag ist eine praktische Orientierung und keine Rechtsberatung." },
  ],
  faq: [
    { q: "Kann man negative Google-Suchergebnisse löschen?", a: "Manche ja: das eigene Unternehmensprofil, rechtswidrige Inhalte und unter Umständen personenbezogene Daten. Rechtmäßige Inhalte Dritter lassen sich meist nicht löschen – hier hilft das Verdrängen von Seite 1." },
    { q: "Was bedeutet „verdrängen“?", a: "Gezielt positive, starke Inhalte aufbauen, sodass unerwünschte (aber nicht löschbare) Treffer von Seite 1 auf hintere Seiten rutschen, wo sie praktisch niemand mehr sieht." },
    { q: "Wie lange dauert das Verdrängen?", a: "In der Regel Wochen bis Monate, je nach Wettbewerb und Stärke des unerwünschten Treffers. Entfernen löschbarer Inhalte geht dagegen oft in Tagen." },
    { q: "Reicht es, einen Treffer von Seite 1 zu verdrängen?", a: "In der Praxis meistens ja: Da kaum jemand auf Seite 2 klickt, ist ein verdrängter Treffer fast so unsichtbar wie ein gelöschter." },
  ],
  related: [
    { label: "Online-Reputationsmanagement für Unternehmen – der Leitfaden", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "Google-Unternehmensprofil löschen – wie geht das?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Negative Bewertung: ignorieren, antworten oder löschen?", url: "https://www.rapid-remove.com/negative-bewertung-ignorieren-antworten-loeschen" },
  ],
};
export default article;
