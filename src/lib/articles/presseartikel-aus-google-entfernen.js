/* DE PILLAR: "Negative Presseartikel aus Google entfernen und auslisten" — Service-3.
   Presse-Deindexierung / Recht auf Vergessenwerden; verlinkt auf den Presse-Auslist-
   Service, den #10-Verdrängen-Artikel und den ORM-Pillar + Hub. */
const article = {
  meta: {
    slug: "presseartikel-aus-google-entfernen",
    title: "Negative Presseartikel aus Google entfernen / auslisten",
    h1: "Negative Presseartikel aus Google entfernen und auslisten",
    description:
      "Negative Presseartikel bei Google: Wann sie sich auslisten oder verdrängen lassen, welche Rechte (DSGVO) greifen und wie der Weg ohne Streisand-Effekt aussieht.",
    author: "Maximilian Hölzl",
    authorRole: "Google-Experte",
    date: "2026-06-30",
    keywords: [],
  },
  category: "Recht",
  iconKey: "gavel",
  readingMin: 7,
  dek: "Ein alter Presseartikel auf Seite 1 – ein eingestelltes Verfahren, eine längst geklärte Sache, ein Bericht, der nie hätte bleiben sollen – verfolgt Unternehmer oft jahrelang. Der Artikel selbst lässt sich selten löschen, aber er muss nicht für immer ganz oben bei Google stehen. Dieser Leitfaden zeigt, welche Wege es gibt: **auslisten** (aus dem Google-Index nehmen), **verdrängen** oder über das **Recht auf Vergessenwerden** vorgehen.",
  blocks: [
    { t: "h2", id: "kurz", text: "Das Wichtigste in Kürze", toc: "In Kürze" },
    { t: "ul", items: [
      "**Artikel löschen ≠ realistisch:** Den Beitrag beim Medium selbst entfernen zu lassen, gelingt selten – die Pressefreiheit schützt ihn.",
      "**Auslisten ist der Hebel:** Der Artikel kann aus den Google-Suchergebnissen genommen werden, ohne dass das Medium ihn löscht.",
      "**Recht auf Vergessenwerden:** Bei personenbezogenen, veralteten oder übermäßig belastenden Inhalten greift unter Umständen die DSGVO.",
      "**Diskretion zählt:** Der falsche Weg (Drohungen, Druck aufs Medium) löst den Streisand-Effekt aus und macht alles schlimmer.",
    ] },

    { t: "h2", id: "unterschied", text: "Löschen, auslisten, verdrängen – der Unterschied", toc: "Die Unterschiede" },
    { t: "p", text: "Drei Begriffe, die oft verwechselt werden:" },
    { t: "ul", items: [
      "**Löschen** heißt, den Artikel **beim Medium selbst** zu entfernen. Das gelingt selten, weil die Presse- und Meinungsfreiheit ihn schützt.",
      "**Auslisten (Deindexierung)** heißt, den Artikel aus den **Google-Suchergebnissen** zu nehmen. Der Artikel existiert weiter auf der Medienseite, taucht aber bei der Google-Suche nach Ihrem Namen nicht mehr auf.",
      "**Verdrängen** heißt, ihn durch stärkere positive Inhalte von **Seite 1** zu schieben.",
    ] },
    { t: "p", text: "Für die meisten Betroffenen ist Auslisten oder Verdrängen das eigentliche Ziel: Was bei Google nicht auftaucht, existiert für die meisten Menschen praktisch nicht." },

    { t: "h2", id: "wann", text: "Wann sich ein Presseartikel auslisten lässt", toc: "Wann auslisten" },
    { t: "p", text: "Die Chancen hängen vom Inhalt ab. Gute Ansatzpunkte sind unter anderem:" },
    { t: "ul", items: [
      "**Veraltete Informationen** – z. B. ein Bericht über ein Verfahren, das längst eingestellt oder zugunsten des Betroffenen ausgegangen ist.",
      "**Personenbezogene Daten**, deren fortgesetzte Anzeige unverhältnismäßig belastet (Grundlage: **Recht auf Vergessenwerden**, Art. 17 DSGVO).",
      "**Falsche Tatsachenbehauptungen** oder Persönlichkeitsrechtsverletzungen.",
    ] },
    { t: "p", text: "Reine, rechtmäßige Berichterstattung über aktuelle, wahre und öffentlich relevante Vorgänge lässt sich dagegen kaum auslisten – hier bleibt das Verdrängen." },

    { t: "h2", id: "recht", text: "Das Recht auf Vergessenwerden", toc: "Recht auf Vergessen" },
    { t: "p", text: "Der Europäische Gerichtshof hat klargestellt, dass Suchmaschinen unter bestimmten Voraussetzungen Ergebnisse zu einer Person aus der Namens-Suche entfernen müssen, wenn das Interesse an Vergessen das Informationsinteresse überwiegt. Maßgeblich sind u. a. Alter und Aktualität der Information, ihre Richtigkeit und die Rolle der Person in der Öffentlichkeit. Das ist der rechtliche Hebel, mit dem sich personenbezogene Treffer aus der Google-Suche nehmen lassen – ohne dass das Medium den Artikel löschen muss." },

    { t: "h2", id: "streisand", text: "Der falsche Weg: Streisand-Effekt", toc: "Streisand-Effekt" },
    { t: "p", text: "Wer ein Medium öffentlich unter Druck setzt oder mit Anwaltspost droht, riskiert das Gegenteil: erst recht Aufmerksamkeit, neue Berichterstattung, geteilte Screenshots. Dieses Phänomen heißt **Streisand-Effekt**. Deshalb arbeitet eine seriöse Auslistung **leise** – über die vorgesehenen Verfahren bei Google und, wo nötig, rechtlich fundiert, statt über Konfrontation." },

    { t: "h2", id: "vorgehen", text: "So gehen Sie vor", toc: "Vorgehen" },
    { t: "ol", items: [
      "**Treffer erfassen:** Welche Artikel erscheinen bei der Google-Suche nach Ihrem Namen / Unternehmen?",
      "**Einordnen:** veraltet, personenbezogen, falsch → auslisten möglich. Aktuell, wahr, öffentlich relevant → eher verdrängen.",
      "**Auslisten beantragen** bzw. rechtlich prüfen lassen.",
      "**Parallel verdrängen:** positive Inhalte stärken, damit Seite 1 auch dauerhaft sauber bleibt.",
    ] },
    { t: "p", text: "Den Service dazu finden Sie unter [Presse auslisten](/presse-auslisten/); für nicht auslistbare Treffer greift das [Verdrängen von Seite 1](/magazin/negative-google-suchergebnisse-verdraengen/)." },

    { t: "cta", title: "Welcher Artikel belastet Sie – und lässt er sich auslisten?", text: "Nennen Sie den Treffer – wir prüfen kostenlos und unverbindlich, ob eine Auslistung oder Verdrängung möglich ist.", btn: "Kostenlos prüfen", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Analyse", "Diskret", "Ohne Risiko"] },

    { t: "p", text: "Dieser Beitrag ist eine praktische Orientierung und keine Rechtsberatung." },
  ],
  faq: [
    { q: "Kann man einen Presseartikel aus Google löschen?", a: "Den Artikel beim Medium selbst zu löschen, gelingt wegen der Pressefreiheit selten. Möglich ist dagegen oft das Auslisten aus den Google-Suchergebnissen – der Artikel bleibt online, taucht aber bei der Namens-Suche nicht mehr auf." },
    { q: "Was ist der Unterschied zwischen Löschen und Auslisten?", a: "Löschen entfernt den Artikel an der Quelle (Medienseite). Auslisten (Deindexierung) entfernt ihn nur aus dem Google-Index – für die meisten Menschen ist er damit praktisch unsichtbar." },
    { q: "Was ist das Recht auf Vergessenwerden?", a: "Ein aus der DSGVO (Art. 17) abgeleiteter Anspruch, mit dem personenbezogene, veraltete oder übermäßig belastende Treffer unter Umständen aus der Google-Namenssuche genommen werden können." },
    { q: "Wie vermeide ich, dass alles schlimmer wird?", a: "Indem Sie nicht öffentlich Druck aufs Medium ausüben. Eine diskrete, über die offiziellen Verfahren laufende Auslistung vermeidet den Streisand-Effekt." },
  ],
  related: [
    { label: "Online-Reputationsmanagement für Unternehmen – der Leitfaden", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
    { label: "Negative Google-Suchergebnisse verdrängen oder entfernen", url: "https://www.rapid-remove.com/negative-google-suchergebnisse-verdraengen" },
    { label: "Google-Unternehmensprofil löschen – wie geht das?", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
