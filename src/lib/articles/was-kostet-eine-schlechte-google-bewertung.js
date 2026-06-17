/* DE article: "Was kostet eine schlechte Google-Bewertung wirklich?" — MOFU.
   Quantifiziert den Umsatzschaden negativer Bewertungen (Harvard/Luca, BrightLocal)
   und leitet auf die Lösungs-Artikel + den Hub. */
const article = {
  meta: {
    slug: "was-kostet-eine-schlechte-google-bewertung",
    title: "Was kostet eine schlechte Google-Bewertung wirklich?",
    h1: "Was kostet eine schlechte Google-Bewertung wirklich?",
    description:
      "Eine schlechte Google-Bewertung kostet messbar Umsatz. Was Studien zeigen, wie sich der Schaden berechnen lässt – und ab wann sich Handeln lohnt.",
    author: "Maximilian Hölzl",
    authorRole: "Google-Experte",
    date: "2026-05-20",
    keywords: [],
  },
  category: "Reputation",
  iconKey: "card",
  readingMin: 6,
  dek: "Eine einzige schlechte Bewertung fühlt sich teuer an – aber wie teuer ist sie wirklich? Kurz gesagt: messbar. Studien zeigen, dass schon ein Stern weniger den Umsatz spürbar drückt, weil die meisten Kunden vor dem Kauf auf die Sterne schauen. Dieser Artikel rechnet den Schaden nach und zeigt, ab wann sich Gegensteuern lohnt.",
  blocks: [
    { t: "h2", id: "kurz", text: "Das Wichtigste in Kürze", toc: "In Kürze" },
    { t: "ul", items: [
      "**Ein Stern mehr oder weniger ist Umsatz:** Eine Harvard-Studie beziffert den Effekt eines zusätzlichen Sterns auf **+5 bis +9 % Umsatz** (bei unabhängigen Betrieben).",
      "**Die meisten Kunden lesen mit:** **83 %** der Verbraucher informieren sich auf Google, bevor sie ein lokales Unternehmen wählen.",
      "**Unter 3 Sternen wird es kritisch:** Nur **3 %** der Kunden würden ein Unternehmen mit zwei oder weniger Sternen überhaupt in Betracht ziehen.",
      "**Der Schaden ist dauerhaft:** Eine sichtbare Bewertung wirkt Monate bis Jahre – der kumulierte Verlust übersteigt die Kosten einer Lösung meist um ein Vielfaches.",
    ] },

    { t: "h2", id: "warum", text: "Warum eine Bewertung überhaupt Geld kostet", toc: "Warum es kostet" },
    { t: "p", text: "Bewertungen sind heute die Eintrittskarte zur Kaufentscheidung. Laut der **BrightLocal Local Consumer Review Survey 2025** lesen rund **83 %** der Verbraucher Bewertungen auf Google, bevor sie sich für ein lokales Unternehmen entscheiden. Die Sterne erscheinen direkt im Suchergebnis und auf der Karte – noch bevor jemand Ihre Website sieht. Eine niedrige Wertung filtert Sie also aus, lange bevor das Gespräch beginnt." },
    { t: "p", text: "Besonders deutlich wird das am unteren Ende: Nur **3 %** der Befragten würden ein Unternehmen mit **zwei oder weniger Sternen** überhaupt erwägen. Eine Handvoll schlechter Bewertungen, die Ihren Schnitt unter diese Schwelle zieht, schließt damit praktisch den Großteil Ihrer potenziellen Kunden aus." },

    { t: "h2", id: "forschung", text: "Was die Forschung sagt: ein Stern = 5–9 % Umsatz", toc: "Was die Forschung sagt" },
    { t: "p", text: "Die bekannteste Zahl stammt von **Michael Luca (Harvard Business School)**. Seine Untersuchung „Reviews, Reputation, and Revenue“ zeigte: Ein **Anstieg um einen Stern** führte zu **5 bis 9 % mehr Umsatz** – und zwar bei unabhängigen Betrieben, nicht bei großen Ketten mit gefestigtem Ruf. Umgekehrt heißt das: Ein Stern *weniger* kostet in derselben Größenordnung." },
    { t: "p", text: "Für ein Unternehmen mit 30.000 € Monatsumsatz sind 5–9 % rund **1.500 bis 2.700 € pro Monat** – Monat für Monat, solange die Bewertung sichtbar bleibt." },

    { t: "h2", id: "rechnen", text: "So überschlagen Sie Ihren eigenen Schaden", toc: "Schaden berechnen" },
    { t: "p", text: "Eine grobe Rechnung genügt, um die Größenordnung zu sehen:" },
    { t: "ol", items: [
      "**Monatsumsatz** ansetzen (z. B. 30.000 €).",
      "**Konservativen Effekt** von 5 % annehmen → 1.500 € pro Monat.",
      "**Sichtbarkeitsdauer** multiplizieren: Eine Bewertung bleibt oft 12+ Monate sichtbar → 18.000 € über ein Jahr.",
    ] },
    { t: "p", text: "Selbst mit vorsichtigen Annahmen liegt der kumulierte Verlust meist weit über den Kosten einer professionellen Lösung. Genau diese Rechnung übersehen viele, weil der Schaden schleichend und unsichtbar entsteht – als entgangener Umsatz, nicht als Rechnung." },

    { t: "h2", id: "indirekt", text: "Die indirekten Kosten – oft größer als der direkte Verlust", toc: "Indirekte Kosten" },
    { t: "ul", items: [
      "**Klickrate:** Niedrigere Sterne bedeuten weniger Klicks aus Suche und Maps – Sie zahlen für Sichtbarkeit, die schlechter konvertiert.",
      "**Anzeigen-Effizienz:** Wer Google Ads schaltet, schickt Klicks auf ein Profil mit schwachen Sternen – teurer Traffic, der schlechter abschließt.",
      "**Vertrauen & Preis:** Ein schwacher Schnitt zwingt oft zu Rabatten, um überhaupt Aufträge zu gewinnen.",
      "**Mitarbeitende:** Schlechte öffentliche Bewertungen erschweren auch das Recruiting.",
    ] },

    { t: "h2", id: "lohnt", text: "Was sich lohnt – und was nicht", toc: "Was sich lohnt" },
    { t: "p", text: "Nicht jede Bewertung muss bekämpft werden. Eine ehrliche, sachliche Kritik beantwortet man am besten souverän – das zeigt anderen Lesern Haltung. Anders sieht es bei **unberechtigten, gefälschten oder rechtswidrigen** Bewertungen aus: Hier lohnt sich Handeln fast immer, weil der laufende Umsatzverlust die Lösung übersteigt." },
    { t: "p", text: "Welcher Weg der richtige ist, hängt vom Fall ab – die Optionen vergleichen wir im Detail unter [Negative Bewertung: ignorieren, antworten oder löschen?](/magazin/negative-bewertung-ignorieren-antworten-loeschen/) und [Google Bewertung löschen lassen](/magazin/google-bewertung-loeschen-lassen/). Ist das Profil insgesamt beschädigt, kann die vollständige [Profil-Löschung](/magazin/google-unternehmensprofil-loeschen/) der sauberste Schnitt sein." },

    { t: "cta", title: "Prüfen, was sich an Ihrem Profil machen lässt – kostenlos.", text: "Firmennamen eingeben – wir prüfen in Sekunden, ob und wie schnell sich problematische Bewertungen bzw. das Profil entfernen lassen.", btn: "Gratis-Check starten", href: "https://www.rapid-remove.com/", trust: ["Kostenlose Analyse", "Inkl. Garantie", "Ohne Risiko"] },

    { t: "p", text: "**Quellen:** Michael Luca, „Reviews, Reputation, and Revenue: The Case of Yelp.com“ (Harvard Business School) · BrightLocal, Local Consumer Review Survey 2025." },
  ],
  faq: [
    { q: "Wie viel Umsatz kostet eine schlechte Google-Bewertung?", a: "Eine Harvard-Studie (Michael Luca) beziffert den Effekt eines ganzen Sterns auf 5–9 % Umsatz bei unabhängigen Betrieben. Eine einzelne Bewertung wirkt je nach Gesamtzahl unterschiedlich stark – je weniger Bewertungen Sie haben, desto stärker zieht eine schlechte den Schnitt nach unten." },
    { q: "Ab wann wird ein schlechter Schnitt geschäftsschädigend?", a: "Kritisch wird es unter rund 4,0 Sternen; unter 3 Sternen schließen Sie laut BrightLocal praktisch den Großteil der Kunden aus, da nur 3 % ein Unternehmen mit zwei oder weniger Sternen erwägen." },
    { q: "Lohnt es sich, gegen eine einzelne Bewertung vorzugehen?", a: "Bei unberechtigten, gefälschten oder rechtswidrigen Bewertungen meist ja – der laufende Umsatzverlust übersteigt die Kosten der Entfernung in der Regel deutlich. Sachliche, echte Kritik beantwortet man besser, statt sie zu bekämpfen." },
    { q: "Wie berechne ich meinen konkreten Schaden?", a: "Monatsumsatz × konservativ 5 % × Sichtbarkeitsdauer in Monaten. Schon mit vorsichtigen Annahmen liegt der Jahreswert meist deutlich über den Lösungskosten." },
  ],
  related: [
    { label: "Wie stark beeinflussen Google-Sterne Klickrate & Conversion?", url: "https://www.rapid-remove.com/google-sterne-conversion" },
    { label: "Negative Bewertung: ignorieren, antworten oder löschen?", url: "https://www.rapid-remove.com/negative-bewertung-ignorieren-antworten-loeschen" },
    { label: "Google Bewertung löschen lassen: Kosten & Methoden", url: "https://www.rapid-remove.com/google-bewertung-loeschen-lassen" },
  ],
};
export default article;
