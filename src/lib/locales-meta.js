/* RapidRemove — locale registry for per-language routing + hreflang SEO. */
import { SITE_URL } from "@/lib/article-google-profil";

export { SITE_URL };
export const DEFAULT_LOCALE = "de";

// Locales that have full translations AND their own statically-exported page.
// German lives at "/"; every other locale at "/<code>".
export const LOCALES = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];
export const NON_DEFAULT_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const localePath = (l) => (l === DEFAULT_LOCALE ? "/" : `/${l}/`);
export const localeUrl = (l) => `${SITE_URL}${l === DEFAULT_LOCALE ? "/" : `/${l}`}`;

// Magazin-Übersicht pro Sprache — echte, crawlbare Route (DE: /magazin, sonst /<code>/magazin).
export const magazinePath = (l) => (l === DEFAULT_LOCALE ? "/magazin/" : `/${l}/magazin/`);
export const magazineUrl = (l) => `${SITE_URL}${l === DEFAULT_LOCALE ? "/magazin" : `/${l}/magazin`}`;

// og:locale je Sprache (für vollständige Social-/SEO-Auszeichnung).
export const OG_LOCALE = {
  de: "de_DE", en: "en_US", es: "es_ES", fr: "fr_FR", it: "it_IT", nl: "nl_NL",
  pt: "pt_PT", ja: "ja_JP", sv: "sv_SE", da: "da_DK", no: "nb_NO",
};
// Standard-OG-Bild (Marke) — bis dedizierte Share-Bilder existieren.
export const OG_IMAGE = `${SITE_URL}/assets/rapidremove-logo-full.png`;

export function hreflangMap() {
  const m = {};
  for (const l of LOCALES) m[l] = localeUrl(l);
  m["x-default"] = localeUrl(DEFAULT_LOCALE);
  return m;
}

// hreflang-Set für die Magazin-Übersicht (alle Sprachen + x-default).
export function magazineHreflangMap() {
  const m = {};
  for (const l of LOCALES) m[l] = magazineUrl(l);
  m["x-default"] = magazineUrl(DEFAULT_LOCALE);
  return m;
}
