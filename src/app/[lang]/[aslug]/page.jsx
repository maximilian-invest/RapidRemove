/* Route: /<lang>/<localized-slug> — statically exported. Serves BOTH:
   - translated cluster articles (magazine), and
   - the localized secondary pages (about · impressum · datenschutz · orm ·
     deindex · kontakt), each rendered in the route's language. */
import MagArticle from "@/components/MagArticle";
import About from "@/components/About";
import { Impressum, Datenschutz } from "@/components/Legal";
import { Agb, Widerruf } from "@/components/Terms";
import { OrmRoute, DeindexRoute } from "@/components/ServicePages";
import Kontakt from "@/components/Kontakt";
import { uiFor, SITE_URL } from "@/lib/articles/registry";
import { OG_LOCALE, OG_IMAGE } from "@/lib/locales-meta";
import {
  articleParams, resolveLocalized, hreflangForArticle, langUrlsForArticle, resolveRelated, buildArticleJsonLd,
} from "@/lib/articles/catalog";
import { pageParams, pageForSlug, pageUrl, pageHreflang } from "@/lib/page-routes";
import { pageMeta } from "@/lib/page-meta";

export const dynamicParams = false;

// Localized secondary pages share the same single dynamic segment as articles.
const PAGE_COMPONENT = {
  about: About, impressum: Impressum, datenschutz: Datenschutz,
  agb: Agb, widerruf: Widerruf,
  orm: OrmRoute, deindex: DeindexRoute, kontakt: Kontakt,
};

export function generateStaticParams() {
  return [...articleParams(), ...pageParams()];
}

export function generateMetadata({ params }) {
  const key = pageForSlug(params.lang, params.aslug);
  if (key) {
    const m = pageMeta(key, params.lang);
    const url = pageUrl(key, params.lang);
    return {
      title: m.title,
      description: m.description,
      alternates: { canonical: url, languages: pageHreflang(key) },
      openGraph: { type: "website", title: m.title, description: m.description, url, siteName: "RapidRemove", locale: OG_LOCALE[params.lang] || "en_US", images: [OG_IMAGE] },
    };
  }
  const r = resolveLocalized(params.lang, params.aslug);
  if (!r) return {};
  const m = r.t.meta;
  const url = `${SITE_URL}/${params.lang}/${m.slug}`;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: hreflangForArticle(r.deSlug) },
    openGraph: { type: "article", title: m.title, description: m.description, url, siteName: "RapidRemove", locale: OG_LOCALE[params.lang] || "en_US", images: [OG_IMAGE], publishedTime: m.date, modifiedTime: m.date, authors: [m.author] },
  };
}

export default function Page({ params }) {
  const key = pageForSlug(params.lang, params.aslug);
  if (key) {
    const C = PAGE_COMPONENT[key];
    return <C initialLang={params.lang} />;
  }
  const r = resolveLocalized(params.lang, params.aslug);
  const ui = uiFor(params.lang);
  const data = {
    meta: r.t.meta,
    dek: r.t.dek,
    blocks: r.t.blocks,
    faq: r.t.faq,
    category: r.t.category || r.de.category,
    iconKey: r.de.iconKey,
    readingMin: r.de.readingMin,
  };
  const related = resolveRelated(params.lang, r.t.related);
  const url = `${SITE_URL}/${params.lang}/${r.t.meta.slug}`;
  const jsonLd = buildArticleJsonLd(r.t.meta, r.t.faq, params.lang, ui, url);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang={params.lang} ui={ui} langUrls={langUrlsForArticle(r.deSlug)} related={related} />
    </>
  );
}
