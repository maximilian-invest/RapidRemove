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

export function hreflangMap() {
  const m = {};
  for (const l of LOCALES) m[l] = localeUrl(l);
  m["x-default"] = localeUrl(DEFAULT_LOCALE);
  return m;
}
