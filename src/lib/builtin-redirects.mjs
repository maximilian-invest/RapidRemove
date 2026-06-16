/* Fest im Code hinterlegte 301-Weiterleitungen.
 *
 * Single Source of Truth: wird von next.config.mjs (Node-Betrieb, redirects())
 * UND vom Admin-Portal („Weiterleitungen") importiert. Im Portal werden diese
 * Einträge READ-ONLY mit angezeigt (nicht editierbar – Änderungen erfolgen hier
 * im Code), zusätzlich zu den in der DB gepflegten Weiterleitungen. */
export const BUILTIN_REDIRECTS = [
  // Magazin: alte deutsche Slugs (/<lang>/magazin) → neue lokalisierte Slugs (301).
  { source: "/en/magazin", destination: "/en/magazine", permanent: true },
  { source: "/es/magazin", destination: "/es/revista", permanent: true },
  { source: "/fr/magazin", destination: "/fr/magazine", permanent: true },
  { source: "/it/magazin", destination: "/it/rivista", permanent: true },
  { source: "/nl/magazin", destination: "/nl/magazine", permanent: true },
  { source: "/pt/magazin", destination: "/pt/revista", permanent: true },
  { source: "/ja/magazin", destination: "/ja/magazine", permanent: true },
  { source: "/sv/magazin", destination: "/sv/magasin", permanent: true },
  { source: "/da/magazin", destination: "/da/magasin", permanent: true },
  { source: "/no/magazin", destination: "/no/magasin", permanent: true },
  { source: "/en/about", destination: "/en/about-us", permanent: true },
  // 301 von den alten (backlink-starken) Blog-URLs auf die neuen Hub-Artikel (SEO-Migration).
  { source: "/how-to-remove-google-business-profile", destination: "/en/delete-google-business-profile", permanent: true },
  { source: "/google-unternehmensprofil-loeschen-wie-geht-das", destination: "/magazin/google-unternehmensprofil-loeschen", permanent: true },
];
