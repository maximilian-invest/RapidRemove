/* RapidRemove — magazine article registry: link resolution + JSON-LD + listing.
   The new SEO cluster lives at root-level slugs (slug = primary keyword). */
import { SITE_URL } from "@/lib/article-google-profil";

export { SITE_URL };

// Slug (as referenced inside the article copy) -> on-site route path (no basePath).
export const ROUTE_BY_SLUG = {
  "google-unternehmensprofil-loeschen-wie-geht-das": "/magazin/google-unternehmensprofil-loeschen/",
  "schlechte-google-bewertungen-was-tun": "/schlechte-google-bewertungen-was-tun/",
  "1-stern-bewertung-ohne-text-loeschen": "/1-stern-bewertung-ohne-text-loeschen/",
  "google-rezension-loeschen-lassen": "/google-rezension-loeschen-lassen/",
  "negative-google-bewertung-anwalt-oder-technische-loeschung": "/negative-google-bewertung-anwalt-oder-technische-loeschung/",
  "google-bewertung-loeschen-lassen": "/google-bewertung-loeschen-lassen/",
  "fake-google-bewertung-melden-loeschen": "/fake-google-bewertung-melden-loeschen/",
  "google-maps-eintrag-loeschen": "/google-maps-eintrag-loeschen/",
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
];

// Magazine grid cards (DE) for the SEO cluster — link to the full article routes.
export const CLUSTER_CARDS = [
  { slug: "google-bewertung-loeschen-lassen", cat: "Reputation", thm: "thm-orange", icon: "trash", title: "Google Bewertung löschen lassen: Kosten & Methoden", excerpt: "Alle Methoden, Kosten und Erfolgsaussichten im Vergleich – was 2026 wirklich funktioniert.", author: "Matthias Lang", read: 9, date: "Juni 2026" },
  { slug: "fake-google-bewertung-melden-loeschen", cat: "Reputation", thm: "thm-amber", icon: "starOff", title: "Fake Google-Bewertung erkennen, melden & löschen", excerpt: "7 Warnsignale, die Meldung Schritt für Schritt – und was hilft, wenn Google nicht reagiert.", author: "Matthias Lang", read: 8, date: "Juni 2026" },
  { slug: "google-maps-eintrag-loeschen", cat: "Google-Policy", thm: "thm-ink", icon: "mapPin", title: "Google Maps Eintrag löschen", excerpt: "Eigene, fremde, falsche & doppelte Einträge entfernen – und warum der Eintrag oft bleibt.", author: "Matthias Lang", read: 6, date: "Juni 2026" },
  { slug: "schlechte-google-bewertungen-was-tun", cat: "Reputation", thm: "thm-orange", icon: "star", title: "Schlechte Google-Bewertung – was tun?", excerpt: "Richtig reagieren, melden, löschen – und was negative Bewertungen wirklich kosten.", author: "Matthias Lang", read: 8, date: "Juni 2026" },
  { slug: "negative-google-bewertung-anwalt-oder-technische-loeschung", cat: "Recht", thm: "thm-teal", icon: "gavel", title: "Negative Bewertung: Anwalt oder technische Löschung?", excerpt: "Kosten, Dauer und Erfolg im direkten Vergleich – welcher Weg sich wirklich lohnt.", author: "Matthias Lang", read: 8, date: "Juni 2026" },
  { slug: "1-stern-bewertung-ohne-text-loeschen", cat: "Recht", thm: "thm-plum", icon: "gavel", title: "1-Stern-Bewertung ohne Text löschen lassen", excerpt: "Warum wortlose 1-Stern-Bewertungen oft löschbar sind – Rechtslage (LG Lübeck, BGH) & Anleitung.", author: "Matthias Lang", read: 7, date: "Juni 2026" },
  { slug: "google-rezension-loeschen-lassen", cat: "Anleitung", thm: "thm-blue", icon: "edit", title: "Google Rezension löschen lassen: Formular & Kosten", excerpt: "Eigene und fremde Rezensionen entfernen – kostenlos melden oder dauerhaft löschen lassen.", author: "Matthias Lang", read: 7, date: "Juni 2026" },
  { slug: "firma-bei-google-loeschen", cat: "Google-Policy", thm: "thm-ink", icon: "building", title: "Firma bei Google löschen: so entfernen Sie den Eintrag", excerpt: "Warum „als geschlossen markieren“ den Eintrag nicht löscht – und wie Sie ihn samt aller Bewertungen wirklich entfernen.", author: "Matthias Lang", read: 7, date: "Juni 2026" },
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
        author: { "@type": "Person", name: meta.author },
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
