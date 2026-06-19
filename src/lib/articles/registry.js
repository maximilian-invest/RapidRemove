/* RapidRemove — magazine article registry: link resolution + JSON-LD + listing.
   The new SEO cluster lives at root-level slugs (slug = primary keyword). */
import { SITE_URL } from "@/lib/article-google-profil";
import { authorFor, authorPersonLd } from "@/lib/authors";

export { SITE_URL };

// Slug (as referenced inside the article copy) -> on-site route path. JEDER Artikel
// liegt unter /magazin/<slug> (der alte „…-wie-geht-das"-Slug zeigt auf den Hub).
export const ROUTE_BY_SLUG = {
  "google-unternehmensprofil-loeschen-wie-geht-das": "/magazin/google-unternehmensprofil-loeschen/",
  "schlechte-google-bewertungen-was-tun": "/magazin/schlechte-google-bewertungen-was-tun/",
  "1-stern-bewertung-ohne-text-loeschen": "/magazin/1-stern-bewertung-ohne-text-loeschen/",
  "google-rezension-loeschen-lassen": "/magazin/google-rezension-loeschen-lassen/",
  "negative-google-bewertung-anwalt-oder-technische-loeschung": "/magazin/negative-google-bewertung-anwalt-oder-technische-loeschung/",
  "google-bewertung-loeschen-lassen": "/magazin/google-bewertung-loeschen-lassen/",
  "fake-google-bewertung-melden-loeschen": "/magazin/fake-google-bewertung-melden-loeschen/",
  "google-maps-eintrag-loeschen": "/magazin/google-maps-eintrag-loeschen/",
  "firma-bei-google-loeschen": "/magazin/firma-bei-google-loeschen/",
  "was-kostet-eine-schlechte-google-bewertung": "/magazin/was-kostet-eine-schlechte-google-bewertung/",
  "google-sterne-conversion": "/magazin/google-sterne-conversion/",
  "negative-bewertung-ignorieren-antworten-loeschen": "/magazin/negative-bewertung-ignorieren-antworten-loeschen/",
  "online-reputationsmanagement": "/magazin/online-reputationsmanagement/",
  "negative-google-suchergebnisse-verdraengen": "/magazin/negative-google-suchergebnisse-verdraengen/",
  "presseartikel-aus-google-entfernen": "/magazin/presseartikel-aus-google-entfernen/",
  "jameda-bewertung-loeschen": "/magazin/jameda-bewertung-loeschen/",
  "kununu-bewertung-loeschen": "/magazin/kununu-bewertung-loeschen/",
  "trustpilot-bewertung-loeschen": "/magazin/trustpilot-bewertung-loeschen/",
};

// The cluster slugs that have their own statically-exported page (for sitemap + magazine).
export const CLUSTER_SLUGS = [
  "google-bewertung-loeschen-lassen",
  "fake-google-bewertung-melden-loeschen",
  "negative-google-bewertung-anwalt-oder-technische-loeschung",
  "schlechte-google-bewertungen-was-tun",
  "1-stern-bewertung-ohne-text-loeschen",
  "google-rezension-loeschen-lassen",
  "google-maps-eintrag-loeschen",
  "firma-bei-google-loeschen",
  "was-kostet-eine-schlechte-google-bewertung",
  "google-sterne-conversion",
  "negative-bewertung-ignorieren-antworten-loeschen",
  "online-reputationsmanagement",
  "negative-google-suchergebnisse-verdraengen",
  "presseartikel-aus-google-entfernen",
  "jameda-bewertung-loeschen",
  "kununu-bewertung-loeschen",
  "trustpilot-bewertung-loeschen",
];

// Magazine grid cards (DE) for the SEO cluster — link to the full article routes.
export const CLUSTER_CARDS = [
  { slug: "google-bewertung-loeschen-lassen", cat: "Reputation", thm: "thm-orange", icon: "trash", title: "Google Bewertung löschen lassen: Kosten & Methoden", excerpt: "Alle Methoden, Kosten und Erfolgsaussichten im Vergleich – was 2026 wirklich funktioniert.", author: "Maximilian Hölzl", read: 9, date: "September 2025" },
  { slug: "fake-google-bewertung-melden-loeschen", cat: "Reputation", thm: "thm-amber", icon: "starOff", title: "Fake Google-Bewertung erkennen, melden & löschen", excerpt: "7 Warnsignale, die Meldung Schritt für Schritt – und was hilft, wenn Google nicht reagiert.", author: "Matthias Lang", read: 8, date: "November 2025" },
  { slug: "google-maps-eintrag-loeschen", cat: "Google-Policy", thm: "thm-ink", icon: "mapPin", title: "Google Maps Eintrag löschen", excerpt: "Eigene, fremde, falsche & doppelte Einträge entfernen – und warum der Eintrag oft bleibt.", author: "Maximilian Hölzl", read: 11, date: "März 2026" },
  { slug: "schlechte-google-bewertungen-was-tun", cat: "Reputation", thm: "thm-orange", icon: "star", title: "Schlechte Google-Bewertung – was tun?", excerpt: "Richtig reagieren, melden, löschen – und was negative Bewertungen wirklich kosten.", author: "Maximilian Hölzl", read: 8, date: "Oktober 2025" },
  { slug: "negative-google-bewertung-anwalt-oder-technische-loeschung", cat: "Recht", thm: "thm-teal", icon: "gavel", title: "Negative Bewertung: Anwalt oder technische Löschung?", excerpt: "Kosten, Dauer und Erfolg im direkten Vergleich – welcher Weg sich wirklich lohnt.", author: "Maximilian Hölzl", read: 8, date: "Januar 2026" },
  { slug: "1-stern-bewertung-ohne-text-loeschen", cat: "Recht", thm: "thm-plum", icon: "gavel", title: "1-Stern-Bewertung ohne Text löschen lassen", excerpt: "Warum wortlose 1-Stern-Bewertungen oft löschbar sind – Rechtslage (LG Lübeck, BGH) & Anleitung.", author: "Matthias Lang", read: 7, date: "Februar 2026" },
  { slug: "google-rezension-loeschen-lassen", cat: "Anleitung", thm: "thm-blue", icon: "edit", title: "Google Rezension löschen lassen: Formular & Kosten", excerpt: "Eigene und fremde Rezensionen entfernen – kostenlos melden oder dauerhaft löschen lassen.", author: "Maximilian Hölzl", read: 7, date: "Dezember 2025" },
  { slug: "firma-bei-google-loeschen", cat: "Google-Policy", thm: "thm-ink", icon: "building", title: "Firma bei Google löschen: so entfernen Sie den Eintrag", excerpt: "Warum „als geschlossen markieren“ den Eintrag nicht löscht – und wie Sie ihn samt aller Bewertungen wirklich entfernen.", author: "Maximilian Hölzl", read: 7, date: "April 2026" },
  { slug: "was-kostet-eine-schlechte-google-bewertung", cat: "Reputation", thm: "thm-amber", icon: "card", title: "Was kostet eine schlechte Google-Bewertung wirklich?", excerpt: "Was eine schlechte Bewertung an Umsatz kostet – Studienzahlen, eine einfache Rechnung und ab wann sich Handeln lohnt.", author: "Maximilian Hölzl", read: 6, date: "Mai 2026" },
  { slug: "google-sterne-conversion", cat: "Reputation", thm: "thm-teal", icon: "zap", title: "Google-Sterne & Conversion: Wie stark Bewertungen wirken", excerpt: "Sterne entscheiden schon im Suchergebnis über den Klick – warum 0,1 Stern den Unterschied macht und wo der Sweet Spot liegt.", author: "Maximilian Hölzl", read: 6, date: "Juni 2026" },
  { slug: "negative-bewertung-ignorieren-antworten-loeschen", cat: "Reputation", thm: "thm-blue", icon: "eye", title: "Negative Bewertung: ignorieren, antworten oder löschen?", excerpt: "Echte Kritik, Fake oder rechtswidrig? Die klare Entscheidungshilfe – wann ignorieren, wann antworten und wann löschen lassen.", author: "Maximilian Hölzl", read: 7, date: "Juni 2026" },
  { slug: "online-reputationsmanagement", cat: "Reputation", thm: "thm-ink", icon: "shieldCheck", title: "Online-Reputationsmanagement für Unternehmen – der Leitfaden", excerpt: "Bewertungen, Seite-1-Treffer und Presse aktiv steuern: die drei Hebel des ORM – entfernen, verdrängen, aufbauen – und wo Bordmittel an Grenzen stoßen.", author: "Maximilian Hölzl", read: 8, date: "Juni 2026" },
  { slug: "negative-google-suchergebnisse-verdraengen", cat: "Reputation", thm: "thm-teal", icon: "search", title: "Negative Google-Suchergebnisse verdrängen oder entfernen", excerpt: "Entfernen oder von Seite 1 verdrängen? Welcher Weg sich für welchen Treffer eignet, was realistisch geht – und wie lange es dauert.", author: "Maximilian Hölzl", read: 7, date: "Juni 2026" },
  { slug: "presseartikel-aus-google-entfernen", cat: "Recht", thm: "thm-plum", icon: "gavel", title: "Negative Presseartikel aus Google entfernen und auslisten", excerpt: "Auslisten, verdrängen oder Recht auf Vergessenwerden: welcher Weg bei welchem Presseartikel greift – und wie man den Streisand-Effekt vermeidet.", author: "Maximilian Hölzl", read: 7, date: "Juni 2026" },
  { slug: "jameda-bewertung-loeschen", cat: "Recht", thm: "thm-teal", icon: "gavel", title: "Jameda-Bewertung löschen lassen: Leitfaden für Ärzte", excerpt: "Welche Arztbewertungen löschbar sind, was die BGH-Urteile bedeuten – und warum der fehlende Behandlungskontakt der stärkste Hebel ist.", author: "Maximilian Hölzl", read: 13, date: "Juli 2026" },
  { slug: "kununu-bewertung-loeschen", cat: "Recht", thm: "thm-blue", icon: "gavel", title: "Kununu-Bewertung löschen lassen: Leitfaden für Arbeitgeber", excerpt: "Welche Arbeitgeber-Bewertungen entfernbar sind: das Prüf-, Abmahn- und Auskunftsverfahren Schritt für Schritt – und was wirklich wirkt.", author: "Maximilian Hölzl", read: 13, date: "Juli 2026" },
  { slug: "trustpilot-bewertung-loeschen", cat: "Recht", thm: "thm-ink", icon: "gavel", title: "Trustpilot-Bewertung löschen lassen: der Leitfaden", excerpt: "Melden, Verfasser oder Rechtsweg: welcher Weg welche Trustpilot-Bewertung entfernt – und warum die 1-Monats-Frist für den Eilantrag zählt.", author: "Maximilian Hölzl", read: 13, date: "Juli 2026" },
];

// Resolve a rapid-remove.com URL (or bare slug) to an on-site path, or null if it
// points at an article we haven't built yet (caller then drops the link).
export function resolveHref(url) {
  if (!url) return null;
  if (/^https?:\/\/rapid-remove\.com\/?$/.test(url)) return "/?start=1";
  const slug = url.replace(/^https?:\/\/rapid-remove\.com\//, "").replace(/\/$/, "");
  return ROUTE_BY_SLUG[slug] || null;
}

// Article + BreadcrumbList + FAQPage structured data for a cluster article.
export function buildJsonLd(meta, faq) {
  const url = `${SITE_URL}/${meta.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: meta.h1 || meta.title,
        description: meta.description,
        image: "https://assets.simplesolution.at/rapid-remove-product-image.jpg",
        datePublished: meta.date,
        dateModified: meta.date,
        inLanguage: "de-DE",
        author: authorPersonLd(authorFor(meta.slug)),
        publisher: {
          "@type": "Organization",
          name: "RapidRemove",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/rapidremove-logo-full.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        keywords: (meta.keywords || []).join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Magazin", item: `${SITE_URL}/magazin` },
          { "@type": "ListItem", position: 3, name: meta.h1 || meta.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

// ---- Article localization ------------------------------------------------
// Locales the cluster is being translated into (German lives at root).
export const ARTICLE_LOCALES = ["en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

// Editorial-chrome strings per language (the bits not covered by the article data).
export const UI = {
  de: { bcStart: "Start", bcMagazin: "Magazin", reading: "Min. Lesezeit", updated: "Aktualisiert: Juni 2026", faqHeading: "Häufig gestellte Fragen", tocTitle: "Inhalt", tocFaq: "Häufige Fragen", tocCta: "Gratis-Check", related: "Weiterlesen", back: "Zurück zum Magazin", lastUpdated: "Zuletzt aktualisiert: Juni 2026 · keine Rechtsberatung", ctaBtn: "Gratis prüfen" },
  en: { bcStart: "Home", bcMagazin: "Magazine", reading: "min read", updated: "Updated: June 2026", faqHeading: "Frequently asked questions", tocTitle: "Contents", tocFaq: "FAQ", tocCta: "Free check", related: "Read more", back: "Back to the magazine", lastUpdated: "Last updated: June 2026 · not legal advice", ctaBtn: "Check for free" },
  es: { bcStart: "Inicio", bcMagazin: "Revista", reading: "min de lectura", updated: "Actualizado: junio de 2026", faqHeading: "Preguntas frecuentes", tocTitle: "Contenido", tocFaq: "Preguntas frecuentes", tocCta: "Análisis gratis", related: "Seguir leyendo", back: "Volver a la revista", lastUpdated: "Última actualización: junio de 2026 · sin asesoramiento jurídico", ctaBtn: "Comprobar gratis" },
  fr: { bcStart: "Accueil", bcMagazin: "Magazine", reading: "min de lecture", updated: "Mis à jour : juin 2026", faqHeading: "Questions fréquentes", tocTitle: "Sommaire", tocFaq: "FAQ", tocCta: "Analyse gratuite", related: "À lire aussi", back: "Retour au magazine", lastUpdated: "Dernière mise à jour : juin 2026 · pas un conseil juridique", ctaBtn: "Analyser gratuitement" },
  it: { bcStart: "Home", bcMagazin: "Magazine", reading: "min di lettura", updated: "Aggiornato: giugno 2026", faqHeading: "Domande frequenti", tocTitle: "Indice", tocFaq: "FAQ", tocCta: "Analisi gratis", related: "Continua a leggere", back: "Torna al magazine", lastUpdated: "Ultimo aggiornamento: giugno 2026 · non è consulenza legale", ctaBtn: "Analizza gratis" },
  nl: { bcStart: "Start", bcMagazin: "Magazine", reading: "min leestijd", updated: "Bijgewerkt: juni 2026", faqHeading: "Veelgestelde vragen", tocTitle: "Inhoud", tocFaq: "FAQ", tocCta: "Gratis check", related: "Verder lezen", back: "Terug naar het magazine", lastUpdated: "Laatst bijgewerkt: juni 2026 · geen juridisch advies", ctaBtn: "Gratis checken" },
  pt: { bcStart: "Início", bcMagazin: "Revista", reading: "min de leitura", updated: "Atualizado: junho de 2026", faqHeading: "Perguntas frequentes", tocTitle: "Índice", tocFaq: "FAQ", tocCta: "Análise grátis", related: "Continue a ler", back: "Voltar à revista", lastUpdated: "Última atualização: junho de 2026 · não é aconselhamento jurídico", ctaBtn: "Verificar grátis" },
  ja: { bcStart: "ホーム", bcMagazin: "マガジン", reading: "分で読めます", updated: "更新：2026年6月", faqHeading: "よくある質問", tocTitle: "目次", tocFaq: "よくある質問", tocCta: "無料チェック", related: "関連記事", back: "マガジンに戻る", lastUpdated: "最終更新：2026年6月・法的助言ではありません", ctaBtn: "無料でチェック" },
  sv: { bcStart: "Hem", bcMagazin: "Magasin", reading: "min läsning", updated: "Uppdaterad: juni 2026", faqHeading: "Vanliga frågor", tocTitle: "Innehåll", tocFaq: "Vanliga frågor", tocCta: "Gratis koll", related: "Läs vidare", back: "Tillbaka till magasinet", lastUpdated: "Senast uppdaterad: juni 2026 · ingen juridisk rådgivning", ctaBtn: "Kolla gratis" },
  da: { bcStart: "Hjem", bcMagazin: "Magasin", reading: "min læsning", updated: "Opdateret: juni 2026", faqHeading: "Ofte stillede spørgsmål", tocTitle: "Indhold", tocFaq: "FAQ", tocCta: "Gratis tjek", related: "Læs videre", back: "Tilbage til magasinet", lastUpdated: "Senest opdateret: juni 2026 · ingen juridisk rådgivning", ctaBtn: "Tjek gratis" },
  no: { bcStart: "Hjem", bcMagazin: "Magasin", reading: "min lesing", updated: "Oppdatert: juni 2026", faqHeading: "Ofte stilte spørsmål", tocTitle: "Innhold", tocFaq: "FAQ", tocCta: "Gratis sjekk", related: "Les videre", back: "Tilbake til magasinet", lastUpdated: "Sist oppdatert: juni 2026 · ingen juridisk rådgivning", ctaBtn: "Sjekk gratis" },
};
export const uiFor = (lang) => UI[lang] || UI.en;
