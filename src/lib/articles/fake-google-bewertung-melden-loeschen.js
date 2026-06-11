/* Article: Fake Google-Bewertung erkennen, melden & löschen lassen */
const article = {
  meta: {
    slug: "fake-google-bewertung-melden-loeschen",
    title: "Fake Google-Bewertung erkennen, melden & löschen lassen (Anleitung 2026)",
    h1: "Fake Google-Bewertung erkennen, melden & löschen lassen",
    description:
      "Fake Google-Bewertungen erkennen, melden und löschen lassen: Schritt-für-Schritt-Anleitung, Rechtslage, ob Fake-Bewertungen strafbar sind und was wirklich funktioniert, wenn Google nicht reagiert.",
    keywords: ["fake google bewertung löschen", "fake google bewertungen melden", "fake google bewertungen erkennen", "fake bewertungen google strafbar", "was tun gegen fake google bewertungen", "falsche google bewertung melden"],
    author: "Matthias Lang",
    authorRole: "Google-Experte",
    date: "2026-06-04",
  },
  category: "Reputation",
  iconKey: "starOff",
  readingMin: 8,
  dek: "Eine gefälschte 1-Stern-Bewertung von jemandem, der nie Kunde war? Damit sind Sie nicht allein. Fake-Bewertungen sind ein Massenphänomen – der dadurch verursachte Schaden für die deutsche Wirtschaft wird auf rund **3,8 Milliarden Euro pro Jahr** geschätzt. In diesem Leitfaden erfahren Sie, **wie Sie Fake-Bewertungen erkennen, bei Google melden und – wenn Google nicht reagiert – endgültig löschen lassen.**",
  blocks: [
    { t: "note", title: "Hinweis", text: "Dieser Beitrag ist eine praktische Orientierung und keine Rechtsberatung. Für eine rechtliche Einschätzung im Einzelfall konsultieren Sie bitte einen Anwalt." },

    { t: "h2", id: "was-ist", text: "Was ist eine Fake-Bewertung?", toc: "Was ist das?" },
    { t: "p", text: "Eine Fake-Bewertung ist eine Rezension, die **keine echte Kundenerfahrung** widerspiegelt. Typische Quellen sind Wettbewerber, die Ihren Ruf sabotieren wollen, verärgerte Ex-Mitarbeiter, Erpressungsversuche („Zahlen Sie, sonst kommt die 1-Stern-Bewertung“) oder schlicht Verwechslungen mit einem anderen Betrieb. Solche Bewertungen verstoßen gegen Googles Richtlinien und sind damit grundsätzlich angreifbar." },

    { t: "h2", id: "erkennen", text: "Fake Google-Bewertungen erkennen: 7 Warnsignale", toc: "7 Warnsignale" },
    { t: "p", text: "Bevor Sie aktiv werden, sollten Sie die Bewertung dokumentieren (Screenshot mit Datum). Diese Anzeichen sprechen für eine Fälschung:" },
    { t: "ol", items: [
      "**Kein Bezug zur Leistung** – die Bewertung beschreibt nichts, was zu Ihrem Angebot passt.",
      "**1 Stern ohne Text** – keine nachvollziehbare Begründung erkennbar.",
      "**Profil ohne Historie** – der Account hat kaum oder nur negative Bewertungen.",
      "**Auffälliges Timing** – mehrere Negativbewertungen in kurzer Zeit (koordinierte Attacke).",
      "**Kein Kunde auffindbar** – der Name taucht in keinem Auftrag, keiner Buchung auf.",
      "**Sachfremde Inhalte** – Werbung, Beleidigungen oder Verwechslungen.",
      "**Identische Formulierungen** – Textbausteine, die bei mehreren Unternehmen auftauchen.",
    ] },

    { t: "h2", id: "strafbar", text: "Sind Fake-Bewertungen strafbar?", toc: "Strafbar?" },
    { t: "p", text: "Bewusst falsche Tatsachenbehauptungen und gefälschte Bewertungen können rechtliche Konsequenzen haben – von Unterlassungsansprüchen bis hin zu Schadenersatz, in bestimmten Fällen kommen auch straf- oder wettbewerbsrechtliche Aspekte in Betracht. Das Problem in der Praxis: Der Verfasser ist oft **anonym**, und der Rechtsweg gegen eine unbekannte Person ist langwierig. Deshalb ist der pragmatische Hebel meist nicht die Strafanzeige, sondern die **Entfernung der Bewertung** bei Google selbst." },

    { t: "h2", id: "melden", text: "Anleitung: Fake-Bewertung bei Google melden", toc: "Melden (Anleitung)" },
    { t: "p", text: "Der erste, kostenlose Schritt ist die Meldung über das Unternehmensprofil:" },
    { t: "ol", items: [
      "Öffnen Sie Ihr **Google-Unternehmensprofil** und gehen Sie zu den Rezensionen.",
      "Suchen Sie die betreffende Bewertung und klicken Sie auf das **Drei-Punkt-Menü**.",
      "Wählen Sie **„Rezension melden“**.",
      "Geben Sie den passenden Verstoß an (z. B. „Falschinformationen“, „nicht themenbezogen“, „Interessenkonflikt“).",
      "Senden Sie die Meldung ab.",
    ] },
    { t: "p", text: "Zusätzlich können Sie über das **Google-Tool zur Verwaltung von Rezensionen** den Status verfolgen und mehrere Bewertungen gebündelt melden." },

    { t: "h2", id: "google-reagiert", text: "Wenn Google nicht reagiert: was dann?", toc: "Google reagiert nicht" },
    { t: "p", text: "Hier beginnt die Frustration vieler Unternehmer. Google prüft Meldungen **überwiegend automatisiert** und lehnt sie häufig mit standardisierten Textbausteinen ab – selbst bei eindeutigen Fälschungen. Sie haben dann keine echte Eskalationsmöglichkeit und stehen wieder am Anfang." },
    { t: "p", text: "Zwei Wege führen weiter:" },
    { t: "ul", items: [
      "**Anwaltlicher Weg:** Eine juristisch begründete Löschaufforderung kann bei klar rechtswidrigen Bewertungen erfolgreich sein – dauert aber oft Wochen bis Monate, wird pro Bewertung abgerechnet und kann den Verfasser zu „Rache-Bewertungen“ provozieren (Streisand-Effekt).",
      "**Profil-Löschung:** Statt jede Fake-Bewertung einzeln anzugreifen, wird das gesamte Profil entfernt – alle Bewertungen verschwinden mit.",
    ] },

    { t: "h2", id: "loeschen", text: "Fake-Bewertungen loswerden – die endgültige Lösung", toc: "Endgültige Lösung" },
    { t: "p", text: "Bei einer **koordinierten Fake-Attacke** mit vielen Bewertungen ist das Melden einzelner Rezensionen ein aussichtsloses Hase-und-Igel-Spiel. RapidRemove geht deshalb einen anderen Weg: **Wir löschen keine einzelnen Bewertungen, sondern das gesamte Google-Unternehmensprofil.** Alle Fake-Bewertungen verschwinden im Zuge der Löschung mit – Sie starten mit einer weißen Weste." },
    { t: "table", rrCol: 3, head: ["Kriterium", "Selbst melden", "Anwalt", "RapidRemove (Profil-Löschung)"], rows: [
      ["Was wird entfernt", "einzelne Bewertung", "einzelne Bewertung", "ganzes Profil + alle Bewertungen"],
      ["Schnelligkeit", "ungewiss", "3 – 9 Monate", "24 – 48 Std."],
      ["Erfolg", "selten", "ungewiss", "garantiert"],
      ["Kosten", "kostenlos", "pro Bewertung, Vorkasse", "Fixpreis nach Erfolg"],
      ["Alle Fakes weg", "je einzeln", "Einzelverfahren", "ja (mit dem Profil)"],
      ["Aufwand", "mittel", "hoch", "null"],
    ] },
    { t: "p", text: "Der entscheidende Vorteil: Sie zahlen erst **nach erfolgreicher Löschung**, und falls das Profil durch Dritte wieder auftaucht, wird es im Rahmen der Garantie kostenlos entfernt." },
    { t: "warn", title: "Wichtig", text: "Die Profil-Löschung entfernt das **komplette Unternehmensprofil**, nicht eine einzelne Fake-Bewertung. Wenn Sie nur eine einzelne Rezension entfernen und Ihr Profil behalten möchten, sind das Melden bei Google oder der Anwaltsweg die passenden Optionen." },
    { t: "cta", title: "Fake-Attacke? Prüfen Sie die Löschbarkeit – kostenlos.", text: "Firmennamen eingeben – wir prüfen in Sekunden, ob und wie schnell sich Ihr Profil samt aller Fake-Bewertungen entfernen lässt.", btn: "Löschbarkeit prüfen", href: "https://rapid-remove.com/", trust: ["Analyse gratis", "Garantie", "Kein Risiko"] },
  ],
  faq: [
    { q: "Wie erkenne ich eine Fake-Google-Bewertung?", a: "Typische Anzeichen sind fehlender Leistungsbezug, 1 Stern ohne Text, ein Profil ohne Bewertungshistorie, auffälliges Timing mehrerer Negativbewertungen sowie sachfremde oder beleidigende Inhalte." },
    { q: "Wie melde ich eine Fake-Bewertung bei Google?", a: "Über das Drei-Punkt-Menü neben der Rezension auf „Rezension melden“ klicken, den Verstoß auswählen und die Meldung absenden. Den Status können Sie über das Google-Tool zur Verwaltung von Rezensionen verfolgen." },
    { q: "Sind Fake-Bewertungen strafbar?", a: "Bewusst falsche Bewertungen können zivil-, wettbewerbs- und teils strafrechtliche Folgen haben. In der Praxis ist der Verfasser jedoch oft anonym, weshalb die Entfernung der Bewertung meist der schnellere Hebel ist als eine Anzeige. Dies ist keine Rechtsberatung." },
    { q: "Was kann ich tun, wenn Google die Fake-Bewertung nicht löscht?", a: "Wenn die Meldung abgelehnt wird, bleibt für eine einzelne Bewertung der anwaltliche Weg. Ist das Profil durch viele Fakes beschädigt, ist die Profil-Löschung über RapidRemove der zuverlässigste Weg: Das gesamte Profil wird entfernt, alle Bewertungen verschwinden mit." },
    { q: "Löscht RapidRemove einzelne Fake-Bewertungen?", a: "Nein. RapidRemove entfernt das gesamte Unternehmensprofil; alle Bewertungen verschwinden dabei mit. Für die Entfernung einer einzelnen Bewertung bei Erhalt des Profils sind das Melden oder ein Anwalt zuständig." },
    { q: "Wie schnell ist man die Fake-Bewertungen los?", a: "Über die Profil-Löschung sind Ergebnisse häufig innerhalb von 24 bis 48 Stunden möglich – deutlich schneller als der mehrmonatige Rechtsweg." },
  ],
  related: [
    { label: "Google Bewertung löschen lassen: Kosten & Methoden im Vergleich", url: "https://rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "1-Stern-Bewertung ohne Text löschen lassen", url: "https://rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
    { label: "Schlechte Google-Bewertung – was tun?", url: "https://rapid-remove.com/schlechte-google-bewertungen-was-tun" },
    { label: "Google Unternehmensprofil löschen – wie geht das?", url: "https://rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
  ],
};
export default article;
