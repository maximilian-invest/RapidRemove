/* RapidRemove — localized routing for the secondary pages
   (about · impressum · datenschutz · orm · deindex · kontakt).

   The default locale (de) lives at the root with its German slug
   (/ueber-uns, /impressum …). Every other locale is language-prefixed
   with a LOCALIZED slug (/it/chi-siamo, /es/sobre-nosotros …) and is
   served by the dynamic /[lang]/[aslug] route. Mirrors the article setup. */
import { SITE_URL } from "@/lib/article-google-profil";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/locales-meta";

// page key -> { lang: slug }. Slugs are ASCII, lowercase, hyphenated (URL-safe).
export const PAGE_SLUGS = {
  about: { de: "ueber-uns", en: "about-us", es: "sobre-nosotros", fr: "a-propos", it: "chi-siamo", nl: "over-ons", pt: "sobre-nos", ja: "about", sv: "om-oss", da: "om-os", no: "om-oss" },
  impressum: { de: "impressum", en: "legal-notice", es: "aviso-legal", fr: "mentions-legales", it: "note-legali", nl: "colofon", pt: "aviso-legal", ja: "legal-notice", sv: "juridisk-information", da: "juridisk-meddelelse", no: "juridisk-informasjon" },
  datenschutz: { de: "datenschutzerklaerung", en: "privacy-policy", es: "politica-de-privacidad", fr: "politique-de-confidentialite", it: "privacy", nl: "privacybeleid", pt: "politica-de-privacidade", ja: "privacy-policy", sv: "integritetspolicy", da: "privatlivspolitik", no: "personvern" },
  orm: { de: "reputation-verdraengen", en: "reputation-management", es: "gestion-de-reputacion", fr: "gestion-de-reputation", it: "gestione-reputazione", nl: "reputatiebeheer", pt: "gestao-de-reputacao", ja: "reputation-management", sv: "rykteshantering", da: "omdoemmestyring", no: "omdoemmehaandtering" },
  deindex: { de: "presse-auslisten", en: "press-deindexing", es: "desindexar-prensa", fr: "desindexation-presse", it: "deindicizzazione-stampa", nl: "pers-deindexeren", pt: "desindexar-imprensa", ja: "press-deindexing", sv: "avindexera-press", da: "afindeksere-presse", no: "avindeksere-presse" },
  kontakt: { de: "kontakt", en: "contact", es: "contacto", fr: "contact", it: "contatti", nl: "contact", pt: "contacto", ja: "contact", sv: "kontakt", da: "kontakt", no: "kontakt" },
  wizard: { de: "profil-pruefen", en: "check-profile", es: "comprobar-perfil", fr: "verifier-profil", it: "verifica-profilo", nl: "profiel-checken", pt: "verificar-perfil", ja: "check", sv: "kontrollera-profil", da: "tjek-profil", no: "sjekk-profil" },
};

export const PAGE_KEYS = Object.keys(PAGE_SLUGS);

const slugFor = (key, lang) => (PAGE_SLUGS[key] && (PAGE_SLUGS[key][lang] || PAGE_SLUGS[key][DEFAULT_LOCALE])) || "";

// Navigation path (wrap with asset()): de at root, otherwise /<lang>/<slug>/.
export const pagePath = (key, lang) => {
  const s = slugFor(key, lang);
  return lang === DEFAULT_LOCALE ? `/${s}/` : `/${lang}/${s}/`;
};

// Absolute URL for canonical / hreflang — no trailing slash, like the articles.
export const pageUrl = (key, lang) => {
  const s = slugFor(key, lang);
  return `${SITE_URL}${lang === DEFAULT_LOCALE ? `/${s}` : `/${lang}/${s}`}`;
};

// hreflang alternates for one page across all locales (+ x-default = de).
export const pageHreflang = (key) => {
  const m = {};
  for (const l of LOCALES) m[l] = pageUrl(key, l);
  m["x-default"] = pageUrl(key, DEFAULT_LOCALE);
  return m;
};

// Static params for the /[lang]/[aslug] route (non-default locales only).
export const pageParams = () => {
  const out = [];
  for (const l of LOCALES) {
    if (l === DEFAULT_LOCALE) continue;
    // wizard hat eigene, explizite Routen (lädt App nur dort, nicht auf Artikelseiten)
    for (const key of PAGE_KEYS) { if (key === "wizard") continue; out.push({ lang: l, aslug: slugFor(key, l) }); }
  }
  return out;
};

// Reverse lookup: which page key (if any) owns /<lang>/<aslug>.
export const pageForSlug = (lang, aslug) => {
  for (const key of PAGE_KEYS) if (slugFor(key, lang) === aslug) return key;
  return null;
};
