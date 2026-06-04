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
];

// Magazine grid cards (DE) for the SEO cluster — link to the full article routes.
export const CLUSTER_CARDS = [
  { slug: "google-bewertung-loeschen-lassen", cat: "Reputation", thm: "thm-orange", icon: "trash", title: "Google Bewertung löschen lassen: Kosten & Methoden", excerpt: "Alle Methoden, Kosten und Erfolgsaussichten im Vergleich – was 2026 wirklich funktioniert.", author: "Matthias Lang", read: 9, date: "Juni 2026" },
  { slug: "fake-google-bewertung-melden-loeschen", cat: "Reputation", thm: "thm-amber", icon: "starOff", title: "Fake Google-Bewertung erkennen, melden & löschen", excerpt: "7 Warnsignale, die Meldung Schritt für Schritt – und was hilft, wenn Google nicht reagiert.", author: "Matthias Lang", read: 8, date: "Juni 2026" },
  { slug: "google-maps-eintrag-loeschen", cat: "Google-Policy", thm: "thm-ink", icon: "mapPin", title: "Google Maps Eintrag löschen", excerpt: "Eigene, fremde, falsche & doppelte Einträge entfernen – und warum der Eintrag oft bleibt.", author: "Matthias Lang", read: 6, date: "Juni 2026" },
  { slug: "schlechte-google-bewertungen-was-tun", cat: "Reputation", thm: "thm-orange", icon: "star", title: "Schlechte Google-Bewertung – was tun?", excerpt: "Richtig reagieren, melden, löschen – und was negative Bewertungen wirklich kosten.", author: "Matthias Lang", read: 8, date: "Juni 2026" },
  { slug: "negative-google-bewertung-anwalt-oder-technische-loeschung", cat: "Recht", thm: "thm-teal", icon: "gavel", title: "Negative Bewertung: Anwalt oder technische Löschung?", excerpt: "Kosten, Dauer und Erfolg im direkten Vergleich – welcher Weg sich wirklich lohnt.", author: "Matthias Lang", read: 8, date: "Juni 2026" },
  { slug: "1-stern-bewertung-ohne-text-loeschen", cat: "Recht", thm: "thm-plum", icon: "gavel", title: "1-Stern-Bewertung ohne Text löschen lassen", excerpt: "Warum wortlose 1-Stern-Bewertungen oft löschbar sind – Rechtslage (LG Lübeck, OLG Köln) & Anleitung.", author: "Matthias Lang", read: 7, date: "Juni 2026" },
  { slug: "google-rezension-loeschen-lassen", cat: "Anleitung", thm: "thm-blue", icon: "edit", title: "Google Rezension löschen lassen: Formular & Kosten", excerpt: "Eigene und fremde Rezensionen entfernen – kostenlos melden oder dauerhaft löschen lassen.", author: "Matthias Lang", read: 7, date: "Juni 2026" },
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
          { "@type": "ListItem", position: 2, name: "Magazin", item: `${SITE_URL}/?view=magazin` },
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
