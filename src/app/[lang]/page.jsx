/* Per-language homepage: /en, /es, /fr, /it, /nl, /pt (+ more in wave 2).
   Statically generated, localized metadata + hreflang alternates for SEO. */
import App from "@/components/App";
import { I18N } from "@/lib/i18n";
import { NON_DEFAULT_LOCALES, localeUrl, hreflangMap, OG_LOCALE, OG_IMAGE } from "@/lib/locales-meta";
import { magCardsFor } from "@/lib/articles/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((lang) => ({ lang }));
}

export function generateMetadata({ params }) {
  const { lang } = params;
  const t = I18N[lang] || I18N.en;
  const title = `${(t.hero.h1a + " " + t.hero.h1b).replace(/–/g, "").replace(/\s+/g, " ").trim()} — RapidRemove`;
  const desc = t.seoHomeDesc || t.hero.lead;
  return {
    title,
    description: desc,
    alternates: { canonical: localeUrl(lang), languages: hreflangMap() },
    openGraph: { type: "website", title, description: desc, url: localeUrl(lang), siteName: "RapidRemove", locale: OG_LOCALE[lang] || "en_US", images: [OG_IMAGE] },
  };
}

export default function Page({ params }) {
  return <App initialLang={params.lang} magCards={magCardsFor(params.lang)} />;
}
