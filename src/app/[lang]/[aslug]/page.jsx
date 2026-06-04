/* Route: /<lang>/<localized-slug> — translated cluster articles, statically exported. */
import MagArticle from "@/components/MagArticle";
import { uiFor, SITE_URL } from "@/lib/articles/registry";
import {
  articleParams, resolveLocalized, hreflangForArticle, langUrlsForArticle, resolveRelated, buildArticleJsonLd,
} from "@/lib/articles/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return articleParams();
}

export function generateMetadata({ params }) {
  const r = resolveLocalized(params.lang, params.aslug);
  if (!r) return {};
  const m = r.t.meta;
  const url = `${SITE_URL}/${params.lang}/${m.slug}`;
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    alternates: { canonical: url, languages: hreflangForArticle(r.deSlug) },
    openGraph: { type: "article", title: m.title, description: m.description, url, siteName: "RapidRemove", publishedTime: m.date, modifiedTime: m.date, authors: [m.author] },
  };
}

export default function Page({ params }) {
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
