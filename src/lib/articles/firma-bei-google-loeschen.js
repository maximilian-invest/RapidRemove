/* DE article: "Firma bei Google löschen" — the most common layman phrasing of the
   core service (biggest single DE keyword gap per the audit). Targets "Firma /
   Firmeneintrag bei Google löschen" and links to the flagship hub for depth. */
const article = {
  meta: {
    slug: "firma-bei-google-loeschen",
    title: "Firma bei Google löschen: so entfernen Sie den Eintrag",
    h1: "Firma bei Google löschen – den Eintrag dauerhaft entfernen",
    description:
      "Firma bei Google löschen: Warum „als geschlossen markieren“ den Eintrag nicht entfernt – und wie Sie Ihren Firmeneintrag samt aller Bewertungen wirklich loswerden.",
    author: "Matthias Lang",
    authorRole: "Google-Experte",
    date: "2026-06-04",
    keywords: [],
  },
  category: "Google-Policy",
  iconKey: "building",
  readingMin: 7,
  dek: "„Firma bei Google löschen“ klingt nach einem Klick – ist es aber nicht. Wer seinen Firmeneintrag nur „als geschlossen markiert“, bleibt mit Name, Adresse und allen Bewertungen sichtbar. Hier erfahren Sie, wie Sie den Eintrag wirklich dauerhaft entfernen.",
  blocks: [
    { t: "note", title: "Hinweis", text: "Dieser Beitrag gibt einen praktischen Überblick und ersetzt keine Rechtsberatung." },

    { t: "h2", id: "was", text: "Was heißt „Firma bei Google löschen“ eigentlich?", toc: "Was heißt das?" },
    { t: "p", text: "Mit „Firma bei Google löschen“ ist fast immer das **Google-Unternehmensprofil** gemeint – der Eintrag mit Name, Adresse, Öffnungszeiten, Fotos und **Bewertungen**, der in der Google-Suche und in Google Maps erscheint. Genau dieser öffentliche Eintrag soll weg. Die ausführliche Schritt-für-Schritt-Anleitung dazu finden Sie in unserem Leitfaden [Google-Unternehmensprofil löschen](/magazin/google-unternehmensprofil-loeschen/)." },

    { t: "h2", id: "kein-button", text: "Warum es keinen einfachen Löschen-Button gibt", toc: "Kein Löschen-Button" },
    { t: "p", text: "Sie können Ihre Firma „als dauerhaft geschlossen markieren“ oder die Verwaltung aus Ihrem Konto entfernen – einen klaren Button „Diesen Eintrag und alle Bewertungen endgültig löschen“ gibt es für Unternehmer aber nicht. Google betrachtet den Eintrag als nützliche Information für Suchende und behält die Kontrolle." },
    { t: "warn", title: "„Geschlossen“ ist nicht „gelöscht“", text: "Wer die Firma nur als geschlossen markiert, entfernt **nichts**: Eintrag, Name, Adresse und **alle Bewertungen bleiben öffentlich sichtbar** – jetzt mit einem durchgestrichenen „Dauerhaft geschlossen“. Für Interessenten sieht das oft schlechter aus als vorher." },

    { t: "h2", id: "so-gehts", text: "So entfernen Sie den Firmeneintrag wirklich", toc: "So geht's wirklich" },
    { t: "p", text: "Zuverlässig verschwindet ein Firmeneintrag nur über die **vollständige Löschung des Profils** auf den offiziellen Google-Wegen – nicht, indem man Bewertung für Bewertung meldet. Wird das gesamte Profil entfernt, verschwinden **alle Bewertungen** mit. Die Vorteile dieses Weges über RapidRemove:" },
    { t: "ul", items: [
      "**Tempo:** Entfernung meist in 24 bis 48 Stunden statt Monaten",
      "**Vollständig:** der komplette Eintrag inkl. **aller** Bewertungen auf einmal",
      "**Planbar:** Fixpreis, zahlbar **erst nach Erfolg** – keine offenen Stundensätze",
      "**Kein Risiko:** Garantie – taucht der Eintrag durch Dritte wieder auf, wird er kostenlos entfernt",
      "**SEO-freundlich:** Ihre Website und Ihr Ranking bleiben erhalten",
    ] },
    { t: "warn", title: "Wichtig", text: "Dieser Weg entfernt den **kompletten Eintrag**, nicht eine einzelne Rezension. Wer nur eine Bewertung loswerden und den Eintrag behalten möchte, nutzt das Melden oder den Anwaltsweg." },

    { t: "cta", title: "Firmeneintrag prüfen lassen – kostenlos.", text: "Geben Sie Ihren Firmennamen ein – wir prüfen in Sekunden, ob und wie schnell sich Ihr Eintrag samt aller Bewertungen entfernen lässt.", btn: "Löschbarkeit prüfen", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Analyse", "Inkl. Garantie", "Ohne Risiko"] },

    { t: "h2", id: "einzeln-vs-ganz", text: "Einzelne Bewertungen oder den ganzen Eintrag?", toc: "Einzeln vs. ganz" },
    { t: "p", text: "Geht es Ihnen nur um eine einzelne ungerechtfertigte Bewertung, ist das **Melden** oder der Anwaltsweg richtig – mehr dazu unter [Google Bewertung löschen lassen](/magazin/google-bewertung-loeschen-lassen/). Ist der Eintrag insgesamt beschädigt und Sie wollen einen echten Neuanfang, ist die vollständige Entfernung der direktere Weg." },

    { t: "h2", id: "kosten", text: "Was kostet das Löschen des Firmeneintrags?", toc: "Was es kostet" },
    { t: "p", text: "Die Preise unterscheiden sich stark je nach Anbieter:" },
    { t: "table", head: ["Anbietertyp", "Preisrahmen", "Erfolg"], rows: [
      ["Günstige Dienstleister", "19 – 49 € pro Bewertung", "Stark schwankend"],
      ["Spezialisierte Anwälte", "100 – 159 € pro Bewertung", "ca. 90 %, aber langsam"],
      ["Eintrag-Löschung (RapidRemove)", "Fixpreis, zahlbar nach Erfolg", "Alle Bewertungen weg – Zahlung nur bei Erfolg"],
    ] },

    { t: "h2", id: "selbst", text: "Selbst versuchen: Schritt für Schritt", toc: "Selbst versuchen" },
    { t: "ol", items: [
      "**Als geschlossen markieren:** ändert nur das Label – der Eintrag samt Bewertungen bleibt sichtbar.",
      "**Profil aus dem Konto entfernen:** löst nur die Verwaltungs-Verknüpfung, nicht den öffentlichen Eintrag.",
      "**Ergebnis prüfen:** In der Regel bleibt der Eintrag in Suche und Maps – jetzt mit „Dauerhaft geschlossen“. Das eigentliche Problem ist nicht gelöst.",
    ] },
    { t: "p", text: "Mit anderen Worten: Über das Standard-Interface lässt sich der öffentliche Firmeneintrag nicht dauerhaft entfernen. Genau dafür gibt es die professionelle, vollständige Löschung." },

    { t: "cta", title: "Firma dauerhaft aus Google entfernen?", text: "Machen Sie den kostenlosen Löschbarkeits-Check – in Sekunden, unverbindlich.", btn: "Jetzt prüfen", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Analyse", "Inkl. Garantie", "Ohne Risiko"] },
  ],
  faq: [
    { q: "Kann ich meine Firma selbst bei Google löschen?", a: "Sie können den Eintrag als „dauerhaft geschlossen“ markieren oder aus Ihrem Konto entfernen – beides löscht aber nicht den öffentlichen Eintrag. Er bleibt mit allen Bewertungen in Suche und Maps sichtbar. Eine vollständige Entfernung läuft über die offiziellen Google-Prozesse." },
    { q: "Ist „dauerhaft geschlossen“ dasselbe wie gelöscht?", a: "Nein. Name, Adresse und alle Bewertungen bleiben öffentlich; ergänzt wird nur ein durchgestrichenes „Dauerhaft geschlossen“. Das wirkt oft schlechter als vorher." },
    { q: "Wie lange dauert die Entfernung?", a: "Über die professionelle Löschung meist 24 bis 48 Stunden – deutlich schneller als der monatelange Rechtsweg für Einzelbewertungen." },
    { q: "Bleiben meine Website und mein Ranking erhalten?", a: "Ja. Das Entfernen des Firmeneintrags betrifft weder Ihre Website noch Ihr Google-Konto oder Ihr Ranking. Ein neues, sauberes Profil ist danach optional möglich." },
    { q: "Verschwinden auch Fake-Bewertungen?", a: "Ja. Da der gesamte Eintrag entfernt wird, verschwinden alle Bewertungen mit – auch gefälschte oder unberechtigte." },
    { q: "Was kostet das Löschen des Firmeneintrags?", a: "RapidRemove arbeitet mit einem Fixpreis, zahlbar erst nach Erfolg. Anbieter für Einzelbewertungen und Anwälte rechnen meist pro Bewertung ab, oft ohne garantiertes Ergebnis." },
  ],
  related: [
    { label: "Google-Unternehmensprofil löschen – die vollständige Anleitung", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Google Bewertung löschen lassen: Kosten & Methoden", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
    { label: "Google Maps Eintrag löschen", url: "https://www.rapid-remove.com/google-maps-eintrag-loeschen" },
  ],
};
export default article;
