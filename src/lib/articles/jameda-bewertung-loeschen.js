/* DE (Welle 2): "Jameda-Bewertung löschen lassen" — Recht/Arztbewertungen.
   BGH VI ZR 34/15 (Behandlungskontakt) + VI ZR 30/17 (Neutralität), Schweigepflicht;
   verlinkt 1-Stern, Anwalt-vs-technisch, ORM + Verdrängen. */
const article = {
  meta: {
    slug: "jameda-bewertung-loeschen",
    title: "Jameda-Bewertung löschen lassen: Recht & Anleitung 2026",
    h1: "Jameda-Bewertung löschen lassen: Der vollständige Leitfaden für Ärzte (2026)",
    description:
      "Jameda-Bewertung löschen lassen: welche Arztbewertungen entfernbar sind, was die BGH-Urteile bedeuten, das Verfahren Schritt für Schritt, Dauer & Kosten – speziell für Ärzte und Zahnärzte.",
    author: "Maximilian Hölzl",
    authorRole: "Google-Experte",
    date: "2026-07-07",
    keywords: [],
  },
  category: "Recht",
  iconKey: "gavel",
  readingMin: 13,
  dek: "Für Ärztinnen, Ärzte und Zahnärzte ist jameda Fluch und Segen zugleich: hohe Sichtbarkeit bei der Patientensuche – aber eine einzige unfaire Bewertung kann das Praxisbild über Jahre prägen. Was viele nicht wissen: Gerade bei **Arztbewertungen** gibt es besonders starke rechtliche Hebel, weil der **Bundesgerichtshof** klare Pflichten für das Portal aufgestellt hat.",
  blocks: [
    { t: "lead", text: "Dieser Leitfaden erklärt **im Detail**, welche jameda-Bewertungen löschbar sind, was die zentralen BGH-Urteile konkret für Sie bedeuten, wie das Verfahren Schritt für Schritt abläuft, wie lange es dauert – und worauf Sie als Arzt wegen der **Schweigepflicht** unbedingt achten müssen." },
    { t: "note", title: "Hinweis", text: "Dieser Beitrag ist ein praktischer Überblick und ersetzt keine Rechtsberatung im Einzelfall." },

    { t: "h2", id: "kurz", text: "Das Wichtigste in Kürze", toc: "In Kürze" },
    { t: "ul", items: [
      "**Behandlungskontakt ist der Schlüssel:** Lässt sich nicht plausibel machen, dass überhaupt eine Behandlung stattfand, muss jameda die Bewertung prüfen und ggf. löschen (BGH **VI ZR 34/15**).",
      "**Komplette Profil-Löschung** ist heute in der Regel **nicht** mehr durchsetzbar, seit jameda als „neutraler Informationsmittler“ gilt (Hintergrund: BGH **VI ZR 30/17**).",
      "**Löschbar:** fehlender Behandlungskontakt, unwahre Tatsachenbehauptungen, Beleidigungen/Schmähkritik, Richtlinienverstöße.",
      "**Tempo:** außergerichtlich meist **2–6 Wochen**; bei klaren Fällen seit den Prozessverbesserungen 2025 teils **unter 10 Werktage**.",
      "**Achtung Schweigepflicht:** In öffentlichen Antworten niemals Behandlungsdetails oder Patientendaten nennen.",
    ] },

    { t: "h2", id: "besonders", text: "Warum der Arztfall rechtlich besonders ist", toc: "Warum besonders" },
    { t: "p", text: "Anders als bei vielen anderen Portalen gibt es bei Arztbewertungen einen **gefestigten, ärztefreundlichen Rahmen** durch die BGH-Rechtsprechung – kombiniert mit dem **Datenschutz- und Berufsrecht**. Das macht die Erfolgsaussichten bei *unberechtigten* Bewertungen vergleichsweise gut. Wer hier vorschnell aufgibt, verschenkt einen starken Hebel." },

    { t: "h2", id: "bgh", text: "Was die BGH-Urteile für Ärzte konkret bedeuten", toc: "Die BGH-Urteile" },
    { t: "p", text: "**BGH VI ZR 34/15 (2016) – der Alltags-Hebel:** Beanstandet ein Arzt eine Bewertung, muss das Portal dem **nachgehen** und vom Verfasser einen **Nachweis des tatsächlichen Behandlungskontakts** verlangen. Kann dieser nicht plausibel gemacht werden, ist die Bewertung zu **löschen**. Das ist in der Praxis der wichtigste Ansatzpunkt – denn bei vielen unfairen Bewertungen lässt sich der Behandlungskontakt gerade nicht belegen." },
    { t: "p", text: "**BGH VI ZR 30/17 (2018) – die Neutralitätsfrage:** Hier musste jameda ein Ärztin-Profil löschen, weil das Portal sich **nicht neutral** verhielt (es blendete auf kostenlosen Profilen Werbung für zahlende Premium-Ärzte ein und verschaffte sich so einen Vorteil). jameda hat sein Geschäftsmodell daraufhin angepasst. **Folge:** Eine **komplette Profil-Löschung allein wegen fehlender Neutralität ist heute meist nicht mehr durchsetzbar** – es geht in der Regel um **einzelne** rechtswidrige Bewertungen, nicht um das ganze Profil." },

    { t: "h2", id: "loeschbar", text: "Welche jameda-Bewertungen lassen sich löschen?", toc: "Was ist löschbar?" },
    { t: "p", text: "**Gut löschbar:**" },
    { t: "ul", items: [
      "**Kein (nachweisbarer) Behandlungskontakt** – der häufigste und stärkste Grund (BGH VI ZR 34/15).",
      "**Unwahre Tatsachenbehauptungen** – z. B. erfundene Vorgänge, falsche Abrechnungs-/Diagnosevorwürfe (abzugrenzen von zulässiger Meinung).",
      "**Beleidigungen, Schmähkritik, Diffamierung.**",
      "**Richtlinienverstöße:** themenfremd, Verwechslung mit anderer Praxis, Interessenkonflikt (z. B. Bewertung durch Wettbewerber), Datenschutzverstöße.",
    ] },
    { t: "p", text: "**Schwer bis nicht löschbar:**" },
    { t: "ul", items: [
      "Sachliche, subjektive Schilderung einer **echten** Behandlung („lange Wartezeit“, „fühlte mich nicht gut aufgehoben“). Das ist als Meinung geschützt.",
    ] },

    { t: "h2", id: "vorgehen", text: "So gehen Sie vor – Schritt für Schritt", toc: "Vorgehen" },
    { t: "ol", items: [
      "**Dokumentieren:** Screenshot der Bewertung mit Datum sichern. Prüfen: Gibt es überhaupt Hinweise auf einen echten Behandlungskontakt?",
      "**Beanstandung an jameda:** in der Regel über ein **anwaltliches Schreiben**, das entweder den **Behandlungskontakt bestreitet** oder die konkrete **unwahre Tatsachenbehauptung** benennt.",
      "**Prüfschleife:** jameda fordert den Verfasser auf, den Behandlungskontakt zu belegen (z. B. anonymisierter Nachweis). Bleibt der aus oder ist er unplausibel, wird gelöscht.",
      "**Eskalation:** Bei hartnäckigen, klar rechtswidrigen Fällen Abmahnung des Verfassers bzw. gerichtliches Vorgehen (einschließlich Auskunft).",
    ] },
    { t: "p", text: "**Bearbeitungszeit:** außergerichtlich meist **2–6 Wochen**. Für klar begründete Fälle hat sich die Spanne seit den **Prozessverbesserungen bei jameda im Jahr 2025** teils auf **unter zehn Werktage** verkürzt." },

    { t: "h2", id: "vergleich", text: "Melden vs. Anwalt – Vergleich", toc: "Melden vs. Anwalt" },
    { t: "table", head: ["Kriterium", "Eigene Beanstandung", "Anwaltliche Aufforderung"], rows: [
      ["Geeignet für", "klare Fälle, erster Versuch", "unklare/strittige Fälle, Eskalation"],
      ["Erfolg", "mittel", "gut bei fehlendem Behandlungskontakt/falschen Tatsachen"],
      ["Dauer", "2–6 Wochen", "oft schneller bei klarer Begründung"],
      ["Aufwand", "Sie führen den Schriftverkehr", "Kanzlei übernimmt"],
    ] },

    { t: "h2", id: "schweigepflicht", text: "Achtung: Schweigepflicht bei öffentlichen Antworten", toc: "Schweigepflicht" },
    { t: "warn", title: "Häufigster Fehler von Praxen", text: "In der öffentlichen Antwort auf eine Bewertung Behandlungsdetails nennen („Sie waren am … wegen … bei uns“). Das **verletzt die ärztliche Schweigepflicht** – selbst wenn der Patient zuerst öffentlich wurde." },
    { t: "p", text: "**Regel:** allgemein und sachlich bleiben, keine Bestätigung eines Behandlungsverhältnisses, keine Details. Im Zweifel nur: „Wir nehmen jede Rückmeldung ernst, bitten Sie aber, sich direkt an uns zu wenden.“" },

    { t: "h2", id: "sonderfaelle", text: "Sonderfälle", toc: "Sonderfälle" },
    { t: "ul", items: [
      "**Verwechslung mit anderer Praxis/gleichem Namen:** klarer Löschgrund – Verwechslung belegen.",
      "**Bewertung durch Wettbewerber/Ex-Mitarbeiter:** Interessenkonflikt, zusätzlich wettbewerbsrechtlich relevant.",
      "**1-Stern ohne Text:** ohne erkennbaren Behandlungsbezug oft löschbar (vgl. auch [1-Stern-Bewertung ohne Text](/magazin/1-stern-bewertung-ohne-text-loeschen/)).",
      "**Erpresserische Bewertung:** nicht auf Forderungen eingehen, dokumentieren, rechtlich vorgehen.",
    ] },

    { t: "h2", id: "reputation", text: "Wenn Löschen nicht geht: Praxis-Reputation stärken", toc: "Reputation stärken" },
    { t: "p", text: "Gegen eine zulässige, echte Patientenmeinung hilft kein Löschantrag. Dann zählt das Gesamtbild:" },
    { t: "ul", items: [
      "**Zufriedene Patienten aktiv um Bewertungen bitten** (datenschutzkonform, ohne Druck) – viele echte positive Stimmen relativieren einzelne Ausreißer.",
      "**Professionell und schweigepflichtkonform antworten.**",
      "**Negative Treffer in der Google-Suche verdrängen** – siehe [Online-Reputationsmanagement](/magazin/online-reputationsmanagement/) und [negative Suchergebnisse verdrängen](/magazin/negative-google-suchergebnisse-verdraengen/).",
    ] },

    { t: "cta", title: "Unfaire jameda-Bewertung? Kostenlos prüfen lassen.", text: "Schicken Sie uns den Link – wir prüfen kostenlos und unverbindlich, ob eine Löschung realistisch ist, und sagen Ihnen ehrlich, welcher Weg sich lohnt.", btn: "Kostenlos prüfen", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Einschätzung", "rechtliche Schritte über Partnerkanzlei", "ehrliche Empfehlung"] },
  ],
  faq: [
    { q: "Kann ich mein jameda-Profil komplett löschen lassen?", a: "In der Regel nicht mehr. Seit jameda als neutraler Informationsmittler gilt (Hintergrund BGH VI ZR 30/17), ist eine vollständige Profil-Entfernung meist nicht durchsetzbar. Möglich ist die Löschung einzelner rechtswidriger Bewertungen." },
    { q: "Wann muss jameda eine Bewertung löschen?", a: "Vor allem, wenn sich kein tatsächlicher Behandlungskontakt belegen lässt (BGH VI ZR 34/15), oder wenn die Bewertung unwahre Tatsachen, Beleidigungen oder Richtlinienverstöße enthält." },
    { q: "Wie lange dauert die Löschung?", a: "Außergerichtlich meist 2–6 Wochen; klar begründete Fälle teils unter 10 Werktage." },
    { q: "Was kostet das Löschen einer jameda-Bewertung?", a: "Die eigene Beanstandung ist kostenlos. Anwaltliche Schritte richten sich nach Aufwand. Pauschale „Löschgarantien“ sind unseriös." },
    { q: "Kann ich gegen eine schlechte, aber ehrliche Bewertung vorgehen?", a: "Eine sachliche Meinung zu einer echten Behandlung ist geschützt und kaum löschbar. Hier helfen professionelle (schweigepflichtkonforme) Reaktion und Reputationsaufbau." },
    { q: "Darf ich öffentlich auf eine Patientenbewertung antworten?", a: "Nur sehr vorsichtig: niemals Behandlungsdetails oder die Existenz eines Behandlungsverhältnisses bestätigen – das verletzt die Schweigepflicht. Allgemein und sachlich bleiben." },
    { q: "Was ist der stärkste Löschgrund bei jameda?", a: "Der fehlende Nachweis eines Behandlungskontakts. Kann der Verfasser nicht plausibel machen, dass er behandelt wurde, muss jameda die Bewertung entfernen." },
    { q: "Was tun bei einer 1-Stern-Bewertung ohne Text?", a: "Ohne erkennbaren Behandlungsbezug ist sie oft löschbar – beanstanden und auf den fehlenden Nachweis abstellen." },
    { q: "Hilft das auch bei Zahnärzten/anderen Heilberufen?", a: "Ja, die BGH-Grundsätze zum Behandlungskontakt gelten entsprechend für Zahnärzte und andere bewertbare Heilberufler." },
  ],
  related: [
    { label: "1-Stern-Bewertung ohne Text löschen lassen", url: "https://www.rapid-remove.com/1-stern-bewertung-ohne-text-loeschen" },
    { label: "Negative Bewertung: Anwalt oder technische Löschung?", url: "https://www.rapid-remove.com/negative-google-bewertung-anwalt-oder-technische-loeschung" },
    { label: "Online-Reputationsmanagement – der Leitfaden", url: "https://www.rapid-remove.com/online-reputationsmanagement" },
  ],
};
export default article;
