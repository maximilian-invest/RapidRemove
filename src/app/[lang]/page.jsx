/* Per-language homepage: /en, /es, /fr, /it, /nl, /pt (+ more in wave 2).
   Statically generated, localized metadata + hreflang alternates for SEO. */
import App from "@/components/App";
import { I18N } from "@/lib/i18n";
import { NON_DEFAULT_LOCALES, localeUrl, hreflangMap } from "@/lib/locales-meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((lang) => ({ lang }));
}

export function generateMetadata({ params }) {
  const { lang } = params;
  const t = I18N[lang] || I18N.en;
  const title = `${(t.hero.h1a + " " + t.hero.h1b).replace(/–/g, "").replace(/\s+/g, " ").trim()} — RapidRemove`;
  return {
    title,
    description: t.hero.lead,
    alternates: { canonical: localeUrl(lang), languages: hreflangMap() },
    openGraph: { type: "website", title, description: t.hero.lead, url: localeUrl(lang), siteName: "RapidRemove" },
  };
}

export default function Page({ params }) {
  return <App initialLang={params.lang} />;
}
