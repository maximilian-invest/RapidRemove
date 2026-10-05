/* RapidRemove — Google Business Profile Removal Report (Datenstudie).
   Plain data (kein "use client"): wird von der Seite, den JSON-LD-Blöcken und
   der CSV unter public/data/ gemeinsam genutzt. NUR aggregierte, gerundete
   Kennzahlen — keine Umsätze, keine Stornoquoten, keine Jahres-Volumina.
   Quelle/Herleitung: Project-Doc claude/datenstudie-plan.md. */

export const REPORT = {
  published: "2026-10-05",
  updated: "2026-10-05",
  coverage: "2022-07/2026-09",
  csv: "/data/rapidremove-gbp-removal-report-2026.csv",
  totals: { removals: "1,600+", checks: "20,000+", countries: "50+", enShare2025: 55, protection: [23, 27] },
  // Sprache der Profil-Checks (Formular DE vs. EN), Anteil in %
  language: [
    { year: "2024", partial: "mar", en: 40, de: 60 },
    { year: "2025", en: 55, de: 45 },
    { year: "2026", partial: "h1", en: 55, de: 45 },
  ],
  // Englischsprachige Bestellungen, Anteil in %
  ordersEn: [{ year: "2024", v: 35 }, { year: "2025", v: 52 }, { year: "2026", v: 54 }],
  // Bezahlte Löschungen außerhalb DACH, Anteil in %
  outsideDach: [
    { year: "2024", partial: "subset", v: 41 },
    { year: "2025", v: 41 },
    { year: "2026", partial: "h1", v: 49 },
  ],
  // Länder der bezahlten Löschungen 2024 – Juni 2026 (n = 826 mit erfasstem Land), Anteil in %
  countriesN: 826,
  countries: [
    { code: "DE", v: 40.6 }, { code: "US", v: 11.9 }, { code: "CH", v: 9.0 }, { code: "AT", v: 8.2 },
    { code: "GB", v: 5.1 }, { code: "NL", v: 3.9 }, { code: "AU", v: 3.3 }, { code: "CA", v: 2.2 },
    { code: "JP", v: 1.9 }, { code: "BE", v: 1.3 }, { code: "AE", v: 1.2 }, { code: "OTHER", v: 11.5 },
  ],
};

export const COUNTRY_NAME = {
  en: { DE: "Germany", US: "United States", CH: "Switzerland", AT: "Austria", GB: "United Kingdom", NL: "Netherlands", AU: "Australia", CA: "Canada", JP: "Japan", BE: "Belgium", AE: "UAE", OTHER: "Other countries" },
  de: { DE: "Deutschland", US: "USA", CH: "Schweiz", AT: "Österreich", GB: "Großbritannien", NL: "Niederlande", AU: "Australien", CA: "Kanada", JP: "Japan", BE: "Belgien", AE: "VAE", OTHER: "Andere Länder" },
};

export const REPORT_META = {
  en: {
    title: "Google Business Profile Removal Report 2026",
    description: "Data from 1,600+ Google Business Profile removals and 20,000+ profile checks since 2022: more than half of all requests now come in English, the US is the #2 country.",
  },
  de: {
    title: "Google-Profil-Löschungen: Report 2026",
    description: "Daten aus über 1.600 Löschungen von Google-Unternehmensprofilen und 20.000+ Profil-Checks seit 2022: Jede zweite Anfrage kommt inzwischen auf Englisch, die USA sind Land Nr. 2.",
  },
};

/* JSON-LD: Article + Dataset (Google Dataset Search) + Breadcrumb. */
export function reportJsonLd(lang, { url, siteUrl, csvUrl }) {
  const m = REPORT_META[lang] || REPORT_META.en;
  const org = { "@type": "Organization", name: "RapidRemove", url: siteUrl };
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: m.title, description: m.description, url, inLanguage: lang,
        datePublished: REPORT.published, dateModified: REPORT.updated, author: org, publisher: org,
        mainEntityOfPage: url, about: { "@id": `${url}#dataset` } },
      { "@type": "Dataset", "@id": `${url}#dataset`, name: m.title, description: m.description, url,
        creator: org, publisher: org, license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true, temporalCoverage: REPORT.coverage, datePublished: REPORT.published,
        keywords: ["Google Business Profile", "Google Maps", "profile removal", "local SEO", "online reputation"],
        variableMeasured: ["Share of profile checks by language", "Share of removals outside DACH", "Removals by country", "Share of clients adding protection"],
        distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: csvUrl }] },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: lang === "de" ? `${siteUrl}/` : `${siteUrl}/${lang}/` },
        { "@type": "ListItem", position: 2, name: m.title, item: url },
      ] },
    ],
  };
}
