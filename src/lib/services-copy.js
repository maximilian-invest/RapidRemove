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
      { id: "core", tag: "Unser Kernservice", ic: "trash", t: "Google-Profil löschen", d: "Unternehmensprofil samt aller Bewertungen dauerhaft entfernen — Zahlung erst nach Erfolg.", dNav: "Profil und Bewertungen dauerhaft entfernen", link: "Zum Gratis-Check" },
      { id: "orm", tag: "Add-on", ic: "eye", t: "Reputation verdrängen", d: "Negative Treffer, die nicht löschbar sind, von Seite 1 der Google-Suche verdrängen.", dNav: "Negative Treffer von Seite 1 entfernen", link: "Mehr erfahren" },
      { id: "deindex", tag: "Vermittlung", ic: "fileText", t: "Presse auslisten", d: "Negative Presse aus der Google-Suche auslisten lassen — kostenlose Prüfung.", dNav: "Presse aus Google auslisten", link: "Mehr erfahren" },
    ],
  },
  en: {
    trioEyebrow: "More than profile removal",
    trioTitle: "Your reputation — protected from every angle.",
    trioSub: "Profile removal is our core service. If a result can't be deleted, we suppress or de-index it.",
    cards: [
      { id: "core", tag: "Our core service", ic: "trash", t: "Delete Google profile", d: "Permanently remove the business profile and all its reviews — pay only after success.", dNav: "Profile & reviews — gone for good", link: "To the free check" },
      { id: "orm", tag: "Add-on", ic: "eye", t: "Suppress reputation", d: "Push negative results that can't be deleted off page 1 of Google search.", dNav: "Negative results off page 1", link: "Learn more" },
      { id: "deindex", tag: "Brokered", ic: "fileText", t: "De-list press", d: "Have negative press de-indexed from Google search — free assessment.", dNav: "De-list press from Google", link: "Learn more" },
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
      { name: "Reputation audit", price: "$290", per: "one-off", desc: "SERP analysis + action plan. Credited toward the retainer.", feats: ["Full page-1 analysis", "Assessment of each result", "Concrete action plan", "Personal consultation"], cta: "Start audit", feat: false },
      { name: "Suppression retainer", price: "from $990", per: "/ month", desc: "Active build + suppression, goal- and term-based.", feats: ["Everything in the audit", "Active content build", "Ongoing suppression", "Monthly reporting"], cta: "Request audit", feat: true, tag: "Recommended" },
      { name: "Monitoring protection", price: "from $49", per: "/ month", desc: "Page-1 monitoring + alerts, once the goal is reached.", feats: ["Daily SERP monitoring", "Instant alerts", "Quarterly report", "Fast response"], cta: "Request protection", feat: false },
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
    whatH: "Auslistung (De-Indexierung) — einfach erklärt.",
    whatSub: "Bei einer Auslistung bleibt der Artikel online auf der Website des Herausgebers — er verschwindet aber aus den Google-Suchergebnissen zu Ihrem Namen. So findet ihn praktisch niemand mehr, ohne dass in die Pressefreiheit eingegriffen wird.",
    stepsEyebrow: "Ablauf",
    stepsH: "So läuft die Auslistung.",
    steps: [
      { t: "Kostenlose Prüfung", d: "Sie schicken uns den Link. Wir prüfen kostenlos, ob eine Auslistung in Frage kommt." },
      { t: "Rechtliche Prüfung", d: "Die rechtliche Einzelfallprüfung erfolgt durch unsere Partnerkanzlei." },
      { t: "Antragstellung", d: "Wir übernehmen die Antragstellung bei Google und begleiten das Verfahren." },
      { t: "Ergebnis", d: "Sie erhalten das Ergebnis. Der Erfolg hängt von Googles Abwägung ab." },
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

/* SEO & visibility landing page (DE + EN authored; other locales fall back to EN
   via SEO[t.code] || SEO.en in the component). */
export const SEO = {
  de: {
    metaTitle: "SEO-Agentur: bei Google gefunden werden | RapidRemove",
    eyebrow: "SEO & Sichtbarkeit",
    h1: "Bei Google gefunden werden – von den richtigen Kunden.",
    lead: "Wir bringen Ihr Unternehmen nach oben: lokal, organisch und messbar. Transparentes monatliches Reporting, keine leeren Versprechen.",
    cta: "Kostenlose SEO-Analyse",
    secondary: "Pakete ansehen",
    trust: ["Über 1.000 Projekte", "Transparentes Reporting", "Keine Knebelverträge"],
    problemEyebrow: "Das Problem",
    problemH: "Wer auf Seite 2 steht, existiert für Google-Nutzer nicht.",
    problemSub: "Die allermeisten Klicks bleiben auf Seite 1. Wenn Ihre Wettbewerber dort oben stehen und Sie nicht, verlieren Sie Kunden – jeden Tag, ohne es zu merken. Gute Leistung allein reicht nicht, wenn niemand Sie findet.",
    leversEyebrow: "Unsere Lösung",
    leversH: "Vier Hebel, ein Ziel: mehr sichtbare, kaufbereite Besucher.",
    levers: [
      { ic: "mapPin", t: "Local SEO", d: "Ganz oben in Ihrer Region: Google-Profil, Maps & lokale Suchbegriffe." },
      { ic: "gauge", t: "OnPage & Technik", d: "Schnelle, saubere Seiten, die Google und Nutzer lieben." },
      { ic: "fileText", t: "Content", d: "Inhalte, nach denen Ihre Kunden wirklich suchen (und die ranken)." },
      { ic: "link2", t: "Autorität & Backlinks", d: "Vertrauenssignale, die Sie über die Konkurrenz heben." },
    ],
    stepsEyebrow: "So funktioniert's",
    stepsH: "Transparent in vier Schritten.",
    steps: [
      { t: "Analyse", d: "Wir prüfen Rankings, Technik und Wettbewerb – kostenlos." },
      { t: "Strategie", d: "Klarer Maßnahmenplan mit Prioritäten und Zielen." },
      { t: "Umsetzung", d: "Wir setzen um: Technik, Content, lokal, Backlinks." },
      { t: "Reporting", d: "Monatlich nachvollziehbar, welche Zahlen sich bewegen." },
    ],
    pricingEyebrow: "Pakete",
    pricingH: "Klare monatliche Pakete. Keine Knebelverträge.",
    pricingSub: "Einstieg über die kostenlose Analyse – danach das passende Paket. Mindestlaufzeit 3 Monate (SEO braucht etwas Anlauf), danach monatlich kündbar.",
    planNames: ["Local", "Wachstum", "Performance"],
    planIdeal: ["lokale Betriebe", "wachsende Unternehmen", "Marktführerschaft"],
    planRec: "Empfohlen",
    rows: [
      { label: "Local SEO / Google-Profil", vals: ["✓", "✓", "✓"] },
      { label: "OnPage & Technik", vals: ["Basis", "erweitert", "umfassend"] },
      { label: "Content / Monat", vals: ["1 Artikel", "4 Artikel", "8+ Artikel"] },
      { label: "Backlinks / Autorität", vals: ["–", "✓", "✓ (Digital PR)"] },
      { label: "Reporting", vals: ["monatlich", "monatlich + Call", "monatlich + Strategie"] },
    ],
    prices: ["ab 490 €", "ab 990 €", "ab 1.900 €"],
    pricePer: "/ Monat",
    pricingCta: "Kostenlose SEO-Analyse starten",
    riskReversal: "Erst die Analyse, dann entscheiden Sie. Keine Vorkasse für das Erstgespräch.",
    trustEyebrow: "Vertrauen",
    trustH: "Ergebnisse statt Versprechen.",
    trustPoints: [
      { ic: "barChart", t: "Transparentes Reporting", d: "Sie sehen monatlich, was sich bewegt." },
      { ic: "refresh", t: "Keine Knebelverträge", d: "Nach 3 Monaten monatlich kündbar." },
      { ic: "users", t: "Spezialisten-Team", d: "Über 1.000 Projekte in 30+ Ländern." },
    ],
    xsEyebrow: "Mehr als SEO",
    xsH: "Sichtbar werden – und sichtbar gut dastehen.",
    xsSub: "SEO bringt Besucher. Ob sie zu Kunden werden, entscheidet Ihr Ruf. Wir decken beides ab:",
    crossSell: [
      { id: "core", ic: "trash", t: "Google-Profil löschen", d: "Unerwünschte Profile & Bewertungen dauerhaft entfernen." },
      { id: "orm", ic: "eye", t: "Reputation verdrängen", d: "Negative Treffer von Seite 1 schieben." },
      { id: "deindex", ic: "fileText", t: "Presse auslisten", d: "Negative Presse aus Google nehmen." },
      { id: "kontakt", ic: "sparkle", t: "Komplettpaket Online-Präsenz", d: "Website + Profil + SEO + Content + Bewertungen aus einer Hand." },
    ],
    faqEyebrow: "Häufige Fragen",
    faqH: "Gut zu wissen.",
    faq: [
      { q: "Wie schnell sehe ich Ergebnisse?", a: "Erste Bewegungen oft nach 4–8 Wochen, spürbare Effekte meist nach 3–6 Monaten. SEO ist nachhaltig, nicht sofort." },
      { q: "Garantiert ihr Platz 1?", a: "Nein – seriös ist das niemand. Wir maximieren Ihre Chancen mit der besten Strategie und zeigen den Fortschritt transparent." },
      { q: "Gibt es eine Mindestlaufzeit?", a: "3 Monate, damit Maßnahmen greifen. Danach monatlich kündbar." },
      { q: "Was kostet es genau?", a: "Die Pakete starten bei 490 €/Monat. Den finalen Plan legen wir nach der kostenlosen Analyse fest." },
      { q: "Macht ihr auch nur Local SEO?", a: "Ja – das „Local“-Paket ist genau dafür." },
      { q: "Übernehmt ihr auch Content & Website?", a: "Ja, im Wachstum-/Performance-Paket bzw. über das Komplettpaket." },
    ],
    finalH: "Finden Sie heraus, wo Sie stehen – kostenlos.",
    finalSub: "In der kostenlosen SEO-Analyse sehen Sie Ihre Rankings, die größten Hebel und was realistisch möglich ist. Unverbindlich.",
    finalCta: "Kostenlose SEO-Analyse anfordern",
    serpQuery: "ihre leistung + ihre stadt",
    serpYou: "Ihr Unternehmen",
    serpBefore: "Platz 8",
    serpAfter: "Platz 1",
  },
  en: {
    metaTitle: "SEO agency: get found on Google | RapidRemove",
    eyebrow: "SEO & visibility",
    h1: "Get found on Google – by the right customers.",
    lead: "We move your business up: local, organic and measurable. Transparent monthly reporting, no empty promises.",
    cta: "Free SEO analysis",
    secondary: "See packages",
    trust: ["Over 1,000 projects", "Transparent reporting", "No lock-in contracts"],
    problemEyebrow: "The problem",
    problemH: "If you're on page 2, you don't exist to Google users.",
    problemSub: "The vast majority of clicks stay on page 1. If your competitors are up there and you're not, you lose customers – every day, without noticing. Doing great work isn't enough if no one finds you.",
    leversEyebrow: "Our solution",
    leversH: "Four levers, one goal: more visible, ready-to-buy visitors.",
    levers: [
      { ic: "mapPin", t: "Local SEO", d: "Right at the top in your region: Google profile, Maps & local search terms." },
      { ic: "gauge", t: "OnPage & technical", d: "Fast, clean pages that Google and users love." },
      { ic: "fileText", t: "Content", d: "Content your customers actually search for (and that ranks)." },
      { ic: "link2", t: "Authority & backlinks", d: "Trust signals that lift you above the competition." },
    ],
    stepsEyebrow: "How it works",
    stepsH: "Transparent in four steps.",
    steps: [
      { t: "Analysis", d: "We review rankings, technical health and competition – free of charge." },
      { t: "Strategy", d: "A clear action plan with priorities and goals." },
      { t: "Execution", d: "We deliver: technical, content, local, backlinks." },
      { t: "Reporting", d: "Monthly, transparent on which numbers are moving." },
    ],
    pricingEyebrow: "Packages",
    pricingH: "Clear monthly packages. No lock-in contracts.",
    pricingSub: "Start with the free analysis – then the right package. Minimum term 3 months (SEO needs a runway), cancellable monthly after that.",
    planNames: ["Local", "Growth", "Performance"],
    planIdeal: ["local businesses", "growing companies", "market leadership"],
    planRec: "Recommended",
    rows: [
      { label: "Local SEO / Google profile", vals: ["✓", "✓", "✓"] },
      { label: "OnPage & technical", vals: ["basic", "extended", "comprehensive"] },
      { label: "Content / month", vals: ["1 article", "4 articles", "8+ articles"] },
      { label: "Backlinks / authority", vals: ["–", "✓", "✓ (Digital PR)"] },
      { label: "Reporting", vals: ["monthly", "monthly + call", "monthly + strategy"] },
    ],
    prices: ["from €490", "from €990", "from €1,900"],
    pricePer: "/ month",
    pricingCta: "Start the free SEO analysis",
    riskReversal: "First the analysis, then you decide. No upfront payment for the initial call.",
    trustEyebrow: "Trust",
    trustH: "Results, not promises.",
    trustPoints: [
      { ic: "barChart", t: "Transparent reporting", d: "You see monthly what's moving." },
      { ic: "refresh", t: "No lock-in contracts", d: "Cancellable monthly after 3 months." },
      { ic: "users", t: "Specialist team", d: "Over 1,000 projects in 30+ countries." },
    ],
    xsEyebrow: "More than SEO",
    xsH: "Get visible – and look good while you're at it.",
    xsSub: "SEO brings visitors. Whether they become customers is decided by your reputation. We cover both:",
    crossSell: [
      { id: "core", ic: "trash", t: "Delete Google profile", d: "Permanently remove unwanted profiles & reviews." },
      { id: "orm", ic: "eye", t: "Suppress reputation", d: "Push negative results off page 1." },
      { id: "deindex", ic: "fileText", t: "De-list press", d: "Remove negative press from Google." },
      { id: "kontakt", ic: "sparkle", t: "Complete online presence", d: "Website + profile + SEO + content + reviews from one source." },
    ],
    faqEyebrow: "FAQ",
    faqH: "Good to know.",
    faq: [
      { q: "How fast will I see results?", a: "First movements often after 4–8 weeks, noticeable effects usually after 3–6 months. SEO is sustainable, not instant." },
      { q: "Do you guarantee position 1?", a: "No – no reputable agency does. We maximise your chances with the best strategy and show progress transparently." },
      { q: "Is there a minimum term?", a: "3 months, so measures can take effect. Cancellable monthly after that." },
      { q: "What exactly does it cost?", a: "Packages start at €490/month. We set the final plan after the free analysis." },
      { q: "Do you do local SEO only?", a: "Yes – the “Local” package is exactly for that." },
      { q: "Do you handle content & website too?", a: "Yes, in the Growth/Performance package or via the complete package." },
    ],
    finalH: "Find out where you stand – for free.",
    finalSub: "In the free SEO analysis you'll see your rankings, the biggest levers and what's realistically possible. No obligation.",
    finalCta: "Request the free SEO analysis",
    serpQuery: "your service + your city",
    serpYou: "Your business",
    serpBefore: "Position 8",
    serpAfter: "Position 1",
  },
};

/* Merge in the other 9 locales (full translations; EN as last-resort safety). */
const EXTRA = { es, fr, it, nl, pt, ja, sv, da, no };
for (const [k, m] of Object.entries(EXTRA)) {
  SVC[k] = (m && m.svc) || SVC.en;
  ORM[k] = (m && m.orm) || ORM.en;
  DEIDX[k] = (m && m.deidx) || DEIDX.en;
}

/* The SEO service card — surfaced in the homepage trio + the Leistungen nav of
   every locale (DE/EN authored; other locales fall back to the EN card). */
const SEO_CARD = {
  de: { id: "seo", tag: "Sichtbarkeit", ic: "trendUp", t: "SEO & Sichtbarkeit", d: "Bei Google nach oben — lokal, organisch und messbar. Kostenlose SEO-Analyse.", dNav: "Bei Google nach oben — lokal & organisch", link: "Mehr erfahren" },
  en: { id: "seo", tag: "Visibility", ic: "trendUp", t: "SEO & visibility", d: "Climb in Google — local, organic and measurable. Free SEO analysis.", dNav: "Climb in Google — local & organic", link: "Learn more" },
};
for (const k of Object.keys(SVC)) {
  if (SVC[k] && Array.isArray(SVC[k].cards) && !SVC[k].cards.some((c) => c.id === "seo")) {
    SVC[k] = { ...SVC[k], cards: [...SVC[k].cards, SEO_CARD[k] || SEO_CARD.en] };
  }
}

/* Localized "Services" nav label. */
export const SVC_NAV_LABEL = {
  de: "Leistungen", en: "Services", es: "Servicios", fr: "Services", it: "Servizi",
  nl: "Diensten", pt: "Serviços", ja: "サービス", sv: "Tjänster", da: "Ydelser", no: "Tjenester",
};
