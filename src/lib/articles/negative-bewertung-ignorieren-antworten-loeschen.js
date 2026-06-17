/* DE article: "Negative Google-Bewertung: ignorieren, antworten oder löschen?" — MOFU.
   Entscheidungs-Leitfaden: ordnet die drei Reaktionswege nach Art der Bewertung zu
   und verlinkt auf die Lösungs-Artikel + den Hub. */
const article = {
  meta: {
    slug: "negative-bewertung-ignorieren-antworten-loeschen",
    title: "Negative Bewertung: ignorieren, antworten oder löschen?",
    h1: "Negative Google-Bewertung: ignorieren, antworten oder löschen?",
    description:
      "Bei einer negativen Google-Bewertung: ignorieren, antworten oder löschen lassen? Eine klare Entscheidungshilfe nach Art der Bewertung – mit den nächsten Schritten.",
    author: "Maximilian Hölzl",
    authorRole: "Google-Experte",
    date: "2026-06-09",
    keywords: [],
  },
  category: "Reputation",
  iconKey: "eye",
  readingMin: 7,
  dek: "Die richtige Reaktion hängt von **einer** Frage ab: Ist die Bewertung berechtigt oder nicht? Echte, sachliche Kritik beantwortet man souverän. Unberechtigte, gefälschte oder rechtswidrige Bewertungen lässt man entfernen. Und manche Bewertungen ignoriert man bewusst. Dieser Leitfaden ordnet die drei Wege klar zu – damit Sie nicht aus dem Bauch heraus reagieren.",
  blocks: [
    { t: "h2", id: "kurz", text: "Das Wichtigste in Kürze", toc: "In Kürze" },
    { t: "ul", items: [
      "**Ignorieren:** bei harmloser, vereinzelter Kritik, die im guten Gesamtschnitt untergeht.",
      "**Antworten:** bei echter, sachlicher Kritik – die Antwort ist für die *anderen* Leser, nicht für den Verfasser.",
      "**Löschen lassen:** bei Fakes, Beleidigungen, falschen Tatsachen oder fehlendem Geschäftskontakt – hier besteht oft ein Anspruch.",
      "**Nie:** im Affekt streiten, drohen oder Kunden öffentlich bloßstellen – das löst den Streisand-Effekt aus.",
    ] },

    { t: "h2", id: "grundfrage", text: "Die Grundfrage: berechtigt oder nicht?", toc: "Berechtigt?" },
    { t: "p", text: "Bevor Sie reagieren, klären Sie eine Sache: Beschreibt die Bewertung eine **echte Erfahrung** – oder nicht? An dieser Linie entscheidet sich alles. Eine ehrliche, auch harsche Meinung zu einem realen Besuch ist durch die Meinungsfreiheit gedeckt und kaum löschbar. Eine Bewertung ohne realen Hintergrund (Fake, Wettbewerber, Verwechslung, reine Schmähung) ist dagegen häufig angreifbar." },

    { t: "h2", id: "ignorieren", text: "Weg 1: Ignorieren – wann Nichtstun richtig ist", toc: "1 · Ignorieren" },
    { t: "p", text: "Nicht jede kritische Stimme braucht eine Reaktion. Wenn Sie einen soliden Schnitt über 4,0 haben und eine einzelne, sachliche 3- oder 4-Sterne-Bewertung dazwischensteht, schadet sie kaum – sie macht das Gesamtbild sogar glaubwürdiger. Wer auf *jede* Kleinigkeit reagiert, wirkt schnell dünnhäutig." },
    { t: "p", text: "**Ignorieren ist richtig, wenn:** die Bewertung vereinzelt, sachlich und im guten Schnitt unauffällig ist." },

    { t: "h2", id: "antworten", text: "Weg 2: Antworten – souverän, für die Mitleser", toc: "2 · Antworten" },
    { t: "p", text: "Eine echte, kritische Bewertung ist eine Bühne – nicht für den Streit mit dem Verfasser, sondern um **anderen Lesern** zu zeigen, wie Sie mit Kritik umgehen. Eine gute Antwort ist knapp, freundlich, lösungsorientiert und ohne Rechtfertigungsdrang." },
    { t: "p", text: "Faustregeln: zeitnah reagieren, sich für das Feedback bedanken, das Anliegen ernst nehmen, eine Lösung oder ein Gespräch anbieten – und niemals Kundendaten oder Interna öffentlich machen. Was Sie hier vermeiden müssen, ist der **Streisand-Effekt**: Wer aggressiv kontert oder droht, provoziert oft eine Welle weiterer Negativbewertungen." },
    { t: "p", text: "**Antworten ist richtig, wenn:** die Kritik echt und sachlich ist und eine souveräne Reaktion das Bild verbessert." },

    { t: "h2", id: "loeschen", text: "Weg 3: Löschen lassen – wann ein Anspruch besteht", toc: "3 · Löschen" },
    { t: "p", text: "Bei **unberechtigten** Bewertungen ist Entfernen der bessere Weg. Gute Chancen bestehen unter anderem bei:" },
    { t: "ul", items: [
      "**Fake-Bewertungen** ohne realen Geschäftskontakt (z. B. von Wettbewerbern),",
      "**Beleidigungen, Schmähkritik, falschen Tatsachenbehauptungen,**",
      "**1-Stern-Bewertungen ohne Text** ohne erkennbaren Bezug,",
      "**themenfremden oder verwechselten** Einträgen.",
    ] },
    { t: "p", text: "Dass es auf einen **tatsächlichen Geschäftskontakt** ankommt, ist gefestigte Rechtsprechung – das Landgericht Lübeck (Az. [9 O 59/17](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=9+O+59/17)) und der BGH (Az. [VI ZR 34/15](https://dejure.org/dienste/vernetzung/rechtsprechung?Text=VI+ZR+34/15)) haben das bestätigt." },
    { t: "p", text: "Für die Umsetzung gibt es zwei Wege, die wir im Detail vergleichen: das **Melden/den Anwaltsweg** für die einzelne Bewertung und die **technische Profil-Löschung**, wenn das Profil insgesamt beschädigt ist. Den direkten Vergleich finden Sie unter [Anwalt oder technische Löschung?](/magazin/negative-google-bewertung-anwalt-oder-technische-loeschung/), die Methoden und Kosten unter [Google Bewertung löschen lassen](/magazin/google-bewertung-loeschen-lassen/)." },
    { t: "p", text: "**Löschen ist richtig, wenn:** die Bewertung unberechtigt, gefälscht oder rechtswidrig ist – oder das Profil als Ganzes nicht mehr zu retten ist." },

    { t: "h2", id: "schnell", text: "Schnell-Entscheidung", toc: "Entscheidung" },
    { t: "table", head: ["Situation", "Empfehlung"], rows: [
      ["Vereinzelte, sachliche Kritik, guter Schnitt", "Ignorieren"],
      ["Echte negative Erfahrung, lösbar", "Antworten"],
      ["Fake / Wettbewerber / kein realer Kontakt", "Löschen lassen"],
      ["Beleidigung, falsche Tatsachen, Schmähung", "Löschen lassen"],
      ["Mehrere/viele Negativbewertungen, Schnitt im Keller", "Profil-Löschung erwägen"],
    ] },

    { t: "cta", title: "Unsicher, ob Ihre Bewertung löschbar ist?", text: "Firmennamen eingeben – wir prüfen in Sekunden kostenlos, ob und wie schnell sich die Bewertung bzw. das Profil entfernen lässt.", btn: "Gratis-Check starten", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Analyse", "Inkl. Garantie", "Ohne Risiko"] },

    { t: "p", text: "Dieser Beitrag ist eine praktische Orientierung und keine Rechtsberatung." },
  ],
  faq: [
    { q: "Soll ich auf jede negative Bewertung antworten?", a: "Nein. Auf echte, sachliche Kritik lohnt sich eine souveräne Antwort (für die Mitleser). Harmlose Einzelstimmen im guten Schnitt kann man ignorieren; unberechtigte oder rechtswidrige besser entfernen lassen." },
    { q: "Wann lässt sich eine Google-Bewertung löschen?", a: "Wenn sie gegen Googles Richtlinien verstößt oder rechtswidrig ist – etwa Fakes, Beleidigungen, falsche Tatsachen oder fehlender Geschäftskontakt. Rein sachliche Meinungen zu echten Erfahrungen sind dagegen kaum löschbar." },
    { q: "Was ist der Streisand-Effekt?", a: "Wenn eine aggressive Reaktion oder rechtliche Drohung den Verfasser provoziert und weitere Negativbewertungen auslöst. Deshalb antwortet man nie im Affekt – und wählt bei der Löschung diskrete, technische Wege." },
    { q: "Was, wenn schon viele schlechte Bewertungen da sind?", a: "Dann ist der Kampf um jede einzelne oft aussichtslos. Sinnvoller kann die vollständige Profil-Löschung mit anschließendem sauberen Neustart sein." },
  ],
  related: [
    { label: "Was kostet eine schlechte Google-Bewertung wirklich?", url: "https://www.rapid-remove.com/was-kostet-eine-schlechte-google-bewertung" },
    { label: "Anwalt oder technische Löschung?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Google Bewertung löschen lassen: Kosten & Methoden", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
