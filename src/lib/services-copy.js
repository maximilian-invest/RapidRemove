/* RapidRemove — additional services copy: homepage trio, ORM ("Reputation
   verdrängen") + De-Index ("Presse auslisten") landing pages, nav dropdown.
   DE + EN authored here; the other 9 locales live in ./services-i18n/. */
import es from "@/lib/services-i18n/es";
import fr from "@/lib/services-i18n/fr";
import it from "@/lib/services-i18n/it";
import nl from "@/lib/services-i18n/nl";
import pt from "@/lib/services-i18n/pt";
import ja from "@/lib/services-i18n/ja";
import sv from "@/lib/services-i18n/sv";
import da from "@/lib/services-i18n/da";
import no from "@/lib/services-i18n/no";

export const SVC = {
  de: {
    trioEyebrow: "Mehr als nur Profil-Löschung",
    trioTitle: "Ihr Ruf — von allen Seiten geschützt.",
    trioSub: "Die Profil-Löschung ist unser Kernservice. Lässt sich ein Treffer nicht löschen, verdrängen oder listen wir ihn aus.",
    cards: [
      { id: "core", tag: "Unser Kernservice", ic: "trash", t: "Google-Profil löschen", d: "Unternehmensprofil samt aller Bewertungen dauerhaft entfernen — Zahlung erst nach Erfolg.", link: "Zum Gratis-Check" },
      { id: "orm", tag: "Add-on", ic: "eye", t: "Reputation verdrängen", d: "Negative Treffer, die nicht löschbar sind, von Seite 1 der Google-Suche verdrängen.", link: "Mehr erfahren" },
      { id: "deindex", tag: "Vermittlung", ic: "fileText", t: "Presse auslisten", d: "Negative Presse aus der Google-Suche auslisten lassen — kostenlose Prüfung.", link: "Mehr erfahren" },
    ],
  },
  en: {
    trioEyebrow: "More than profile removal",
    trioTitle: "Your reputation — protected from every angle.",
    trioSub: "Profile removal is our core service. If a result can't be deleted, we suppress or de-index it.",
    cards: [
      { id: "core", tag: "Our core service", ic: "trash", t: "Delete Google profile", d: "Permanently remove the business profile and all its reviews — pay only after success.", link: "To the free check" },
      { id: "orm", tag: "Add-on", ic: "eye", t: "Suppress reputation", d: "Push negative results that can't be deleted off page 1 of Google search.", link: "Learn more" },
      { id: "deindex", tag: "Brokered", ic: "fileText", t: "De-list press", d: "Have negative press de-indexed from Google search — free assessment.", link: "Learn more" },
    ],
  },
};

export const ORM = {
  de: {
    eyebrow: "Reputation schützen & verdrängen",
    h1: "Negative Google-Treffer verdrängen — Seite 1 zurückerobern.",
    lead: "Was tun, wenn der Negativtreffer nicht löschbar ist? Wir bauen positive Inhalte auf und verdrängen das Negative aus dem sichtbaren Bereich.",
    cta: "Kostenlose Erstanalyse",
    assure: ["Kostenlose Erstanalyse", "Messbare Verdrängung", "Laufende Überwachung"],
    problemEyebrow: "Das Problem",
    problemH: "Nicht alles lässt sich löschen.",
    problemSub: "Presseartikel, Foren, fremde Websites — vieles ist durch die Pressefreiheit oder fremde Rechte geschützt. Löschen ist dann nicht möglich. Aber: Was auf Seite 2+ rutscht, sieht praktisch niemand. Die allermeisten Klicks bleiben auf Seite 1.",
    stepsEyebrow: "So funktioniert's",
    stepsH: "In vier Schritten zurück auf Seite 1.",
    steps: [
      { t: "Audit", d: "Wir analysieren Ihre Google-Suchergebnisse und identifizieren die Negativtreffer." },
      { t: "Aufbau", d: "Wir erstellen und stärken hochwertige, positive Inhalte zu Ihrer Person/Marke." },
      { t: "Verdrängung", d: "Diese Inhalte ranken über den Negativtreffern und schieben sie nach unten." },
      { t: "Monitoring", d: "Wir überwachen Seite 1 dauerhaft und reagieren auf neue Treffer." },
    ],
    pricingEyebrow: "Pakete",
    pricingH: "Transparent, zielbasiert.",
    pricingSub: "Startwerte als „ab“-Preise. Den finalen Plan legen wir nach dem Audit fest.",
    packages: [
      { name: "Reputations-Audit", price: "290 €", per: "einmalig", desc: "SERP-Analyse + Maßnahmenplan. Anrechenbar auf den Retainer.", feats: ["Vollständige Seite-1-Analyse", "Bewertung jedes Treffers", "Konkreter Maßnahmenplan", "Persönliches Gespräch"], cta: "Audit starten", feat: false },
      { name: "Verdrängungs-Retainer", price: "ab 990 €", per: "/ Monat", desc: "Aktiver Aufbau + Verdrängung, ziel- und laufzeitbasiert.", feats: ["Alles aus dem Audit", "Aktiver Content-Aufbau", "Laufende Verdrängung", "Monatliches Reporting"], cta: "Audit anfragen", feat: true, tag: "Empfohlen" },
      { name: "Monitoring-Schutz", price: "ab 49 €", per: "/ Monat", desc: "Überwachung Seite 1 + Alerts, nach erreichtem Ziel.", feats: ["Tägliche SERP-Überwachung", "Sofort-Alerts", "Quartals-Report", "Schnelle Reaktion"], cta: "Schutz anfragen", feat: false },
    ],
    trustEyebrow: "Vertrauen",
    trustH: "Kostenlose Erstanalyse — dann entscheiden Sie.",
    trustSub: "Sie sehen vor jeder Beauftragung, was machbar ist. Keine Vorkasse für das Audit-Gespräch.",
    baBefore: "Vorher — Seite 1", baAfter: "Nachher — Seite 1",
  },
  en: {
    eyebrow: "Protect & suppress reputation",
    h1: "Suppress negative Google results — reclaim page 1.",
    lead: "What if the negative result can't be deleted? We build positive content and push the negative out of the visible zone.",
    cta: "Free initial analysis",
    assure: ["Free initial analysis", "Measurable suppression", "Ongoing monitoring"],
    problemEyebrow: "The problem",
    problemH: "Not everything can be deleted.",
    problemSub: "Press articles, forums, third-party sites — much is protected by press freedom or others' rights. Deletion isn't possible then. But: whatever drops to page 2+ is seen by almost no one. The vast majority of clicks stay on page 1.",
    stepsEyebrow: "How it works",
    stepsH: "Back to page 1 in four steps.",
    steps: [
      { t: "Audit", d: "We analyse your Google results and identify the negative hits." },
      { t: "Build", d: "We create and strengthen high-quality, positive content about you/your brand." },
      { t: "Suppress", d: "This content ranks above the negatives and pushes them down." },
      { t: "Monitor", d: "We watch page 1 continuously and react to new results." },
    ],
    pricingEyebrow: "Packages",
    pricingH: "Transparent, goal-based.",
    pricingSub: "Starting values shown as “from” prices. We set the final plan after the audit.",
    packages: [
      { name: "Reputation audit", price: "€290", per: "one-off", desc: "SERP analysis + action plan. Credited toward the retainer.", feats: ["Full page-1 analysis", "Assessment of each result", "Concrete action plan", "Personal consultation"], cta: "Start audit", feat: false },
      { name: "Suppression retainer", price: "from €990", per: "/ month", desc: "Active build + suppression, goal- and term-based.", feats: ["Everything in the audit", "Active content build", "Ongoing suppression", "Monthly reporting"], cta: "Request audit", feat: true, tag: "Recommended" },
      { name: "Monitoring protection", price: "from €49", per: "/ month", desc: "Page-1 monitoring + alerts, once the goal is reached.", feats: ["Daily SERP monitoring", "Instant alerts", "Quarterly report", "Fast response"], cta: "Request protection", feat: false },
    ],
    trustEyebrow: "Trust",
    trustH: "Free initial analysis — then you decide.",
    trustSub: "You see what's feasible before any engagement. No upfront payment for the audit call.",
    baBefore: "Before — page 1", baAfter: "After — page 1",
  },
};

export const DEIDX = {
  de: {
    eyebrow: "Presse & Suchergebnisse auslisten",
    h1: "Negative Presse & Google-Treffer auslisten lassen.",
    lead: "Auslistung statt Löschung — wo die rechtlichen Voraussetzungen vorliegen. Wir prüfen kostenlos und übernehmen die Antragstellung.",
    cta: "Kostenlose Prüfung",
    assure: ["Kostenlose Prüfung", "Über Partnerkanzlei", "Ehrliche Einschätzung"],
    whatEyebrow: "Was bedeutet das?",
    whatH: "Auslistung (De-Indexierung) — ehrlich erklärt.",
    whatSub: "Bei einer Auslistung bleibt der Artikel online auf der Website des Herausgebers — er verschwindet aber aus den Google-Suchergebnissen zu Ihrem Namen. So findet ihn praktisch niemand mehr, ohne dass in die Pressefreiheit eingegriffen wird.",
    stepsEyebrow: "Ablauf",
    stepsH: "So läuft die Auslistung.",
    steps: [
      { t: "Kostenlose Prüfung", d: "Sie schicken uns den Link. Wir prüfen kostenlos, ob eine Auslistung in Frage kommt." },
      { t: "Rechtliche Prüfung", d: "Die rechtliche Einzelfallprüfung erfolgt durch unsere Partnerkanzlei." },
      { t: "Antragstellung", d: "Wir übernehmen die Antragstellung bei Google und begleiten das Verfahren." },
      { t: "Ergebnis", d: "Sie erhalten das Ergebnis. Erfolg hängt von Googles Abwägung ab." },
    ],
    honestyEyebrow: "Ehrlich gesagt",
    honestyH: "Wann es funktioniert — und wann nicht.",
    yesH: "Gute Chancen", noH: "Schwieriger / nicht möglich",
    yes: ["Veraltete Informationen über Sie", "Verletzung Ihrer Persönlichkeitsrechte", "Rechtswidrige oder falsche Inhalte", "Sensible persönliche Daten"],
    no: ["Aktuelle Berichte von öffentlichem Interesse", "Inhalte über Personen des öffentlichen Lebens", "Wahre Tatsachenbehauptungen", "Garantierte Auslistung — die gibt es nicht"],
    priceH: "Preis", priceVal: "Kostenlose Prüfung", priceSub: "Der Aufwand wird individuell nach der rechtlichen Prüfung bestimmt. Kein beworbener Festpreis, keine Erfolgsgarantie.",
    legalNote: "Rechtliche Einzelfallprüfung über unsere Partnerkanzlei. RapidRemove übernimmt die Vermittlung und Antragstellung, keine eigene Rechtsberatung.",
    faqEyebrow: "Häufige Fragen", faqH: "Gut zu wissen.",
    faq: [
      { q: "Wird der Artikel gelöscht?", a: "Nein. Bei einer Auslistung bleibt der Artikel auf der Original-Website online — er wird lediglich aus den Google-Suchergebnissen zu Ihrem Namen entfernt." },
      { q: "Gibt es eine Erfolgsgarantie?", a: "Nein. Ob ausgelistet wird, hängt von Googles Abwägung zwischen Ihrem Interesse und dem öffentlichen Informationsinteresse ab. Eine Garantie ist nicht möglich." },
      { q: "Wer prüft meinen Fall rechtlich?", a: "Die rechtliche Einzelfallprüfung erfolgt durch unsere Partnerkanzlei. RapidRemove übernimmt Vermittlung und Antragstellung." },
      { q: "Was kostet das?", a: "Die Prüfung ist kostenlos. Den Aufwand für eine mögliche Auslistung legen wir erst nach der rechtlichen Prüfung individuell fest." },
    ],
  },
  en: {
    eyebrow: "De-list press & search results",
    h1: "Have negative press & Google results de-indexed.",
    lead: "De-indexing instead of deletion — where the legal conditions are met. We assess for free and handle the application.",
    cta: "Free assessment",
    assure: ["Free assessment", "Via partner law firm", "Honest opinion"],
    whatEyebrow: "What does it mean?",
    whatH: "De-indexing — explained honestly.",
    whatSub: "With de-indexing, the article stays online on the publisher's site — but it disappears from Google search results for your name. So practically no one finds it anymore, without interfering with press freedom.",
    stepsEyebrow: "Process",
    stepsH: "How de-indexing works.",
    steps: [
      { t: "Free assessment", d: "You send us the link. We check for free whether de-indexing is an option." },
      { t: "Legal review", d: "The legal case-by-case review is carried out by our partner law firm." },
      { t: "Application", d: "We handle the application to Google and accompany the process." },
      { t: "Result", d: "You receive the outcome. Success depends on Google's balancing of interests." },
    ],
    honestyEyebrow: "Honestly",
    honestyH: "When it works — and when it doesn't.",
    yesH: "Good chances", noH: "Harder / not possible",
    yes: ["Outdated information about you", "Violation of your personality rights", "Unlawful or false content", "Sensitive personal data"],
    no: ["Current reports of public interest", "Content about public figures", "True factual statements", "A guaranteed de-listing — there is none"],
    priceH: "Price", priceVal: "Free assessment", priceSub: "The effort is determined individually after the legal review. No advertised fixed price, no success guarantee.",
    legalNote: "Legal case-by-case review via our partner law firm. RapidRemove handles brokering and the application, not its own legal advice.",
    faqEyebrow: "FAQ", faqH: "Good to know.",
    faq: [
      { q: "Is the article deleted?", a: "No. With de-indexing the article stays online on the original site — it's only removed from Google search results for your name." },
      { q: "Is there a success guarantee?", a: "No. Whether it's de-listed depends on Google's balancing of your interest against the public's interest in information. A guarantee isn't possible." },
      { q: "Who reviews my case legally?", a: "The legal case-by-case review is done by our partner law firm. RapidRemove handles brokering and the application." },
      { q: "What does it cost?", a: "The assessment is free. The effort for a possible de-listing is set individually only after the legal review." },
    ],
  },
};

/* Merge in the other 9 locales (full translations; EN as last-resort safety). */
const EXTRA = { es, fr, it, nl, pt, ja, sv, da, no };
for (const [k, m] of Object.entries(EXTRA)) {
  SVC[k] = (m && m.svc) || SVC.en;
  ORM[k] = (m && m.orm) || ORM.en;
  DEIDX[k] = (m && m.deidx) || DEIDX.en;
}

/* Localized "Services" nav label. */
export const SVC_NAV_LABEL = {
  de: "Leistungen", en: "Services", es: "Servicios", fr: "Services", it: "Servizi",
  nl: "Diensten", pt: "Serviços", ja: "サービス", sv: "Tjänster", da: "Ydelser", no: "Tjenester",
};
