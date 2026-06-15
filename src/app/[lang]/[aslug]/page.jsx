/* Route: /<lang>/<localized-slug> — statically exported. Serves BOTH:
   - translated cluster articles (magazine), and
   - the localized secondary pages (about · impressum · datenschutz · orm ·
     deindex · kontakt), each rendered in the route's language. */
import MagArticle from "@/components/MagArticle";
import MagazinStandalone from "@/components/MagazinStandalone";
import About from "@/components/About";
import { Impressum, Datenschutz } from "@/components/Legal";
import { Agb, Widerruf } from "@/components/Terms";
import { OrmRoute, DeindexRoute } from "@/components/ServicePages";
import Kontakt from "@/components/Kontakt";
import { uiFor, SITE_URL } from "@/lib/articles/registry";
import { OG_LOCALE, OG_IMAGE, NON_DEFAULT_LOCALES, magazineSlug, magazineUrl, magazineHreflangMap } from "@/lib/locales-meta";
import { I18N } from "@/lib/i18n";
import {
  articleParams, resolveLocalized, hreflangForArticle, langUrlsForArticle, resolveRelated, buildArticleJsonLd, magCardsFor,
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
  // Magazin-Übersicht je Sprache (lokalisierter Slug) zusätzlich zu Artikeln + Sekundärseiten.
  const mags = NON_DEFAULT_LOCALES.map((lang) => ({ lang, aslug: magazineSlug(lang) }));
  return [...articleParams(), ...pageParams(), ...mags];
}

export function generateMetadata({ params }) {
  if (params.aslug === magazineSlug(params.lang)) {
    const t = I18N[params.lang] || I18N.en;
    const b = t.blog || {};
    const url = magazineUrl(params.lang);
    const title = `${b.h1 || "Magazine"} — RapidRemove`;
    const description = b.lead || b.h1 || "RapidRemove Magazine.";
    return {
      title, description,
      alternates: { canonical: url, languages: magazineHreflangMap() },
      openGraph: { type: "website", title, description, url, siteName: "RapidRemove", locale: OG_LOCALE[params.lang] || "en_US", images: [OG_IMAGE] },
    };
  }
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
  if (params.aslug === magazineSlug(params.lang)) {
    const cards = magCardsFor(params.lang);
    const url = magazineUrl(params.lang);
    const t = I18N[params.lang] || I18N.en;
    const magName = (t.blog && t.blog.h1) || "Magazine";
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "CollectionPage", name: `RapidRemove Magazine (${params.lang})`, url, inLanguage: params.lang, isPartOf: { "@type": "WebSite", name: "RapidRemove", url: SITE_URL }, hasPart: cards.map((c) => ({ "@type": "WebPage", url: `${SITE_URL}${c.href}` })) },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/${params.lang}/` },
          { "@type": "ListItem", position: 2, name: magName, item: url },
        ] },
      ],
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <MagazinStandalone lang={params.lang} magCards={cards} />
      </>
    );
  }
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
