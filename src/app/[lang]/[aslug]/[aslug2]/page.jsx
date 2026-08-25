/* Route: /<lang>/<magazineSlug>/<article-slug> — ALLE übersetzten Artikel unter dem
   lokalisierten Magazin-Slug: Cluster (datengetrieben) + lokalisierte Hubs. */
import MagArticle from "@/components/MagArticle";
import { uiFor, SITE_URL, CLUSTER_SLUGS } from "@/lib/articles/registry";
import { OG_LOCALE, OG_IMAGE, magazineSlug } from "@/lib/locales-meta";
import {
  nestedArticleParams, resolveLocalized, hreflangForArticle, langUrlsForArticle, resolveRelated,
  buildArticleJsonLd, relatedHubLinks, articleUrl, dateFor,
} from "@/lib/articles/catalog";
import { authorFor, roleFor, authorPathFor } from "@/lib/authors";
import { withReviewsPromo } from "@/lib/articles/reviews-promo";
import { HUB_SLUG, hubHreflang, hubLangUrls } from "@/lib/articles/hubs";
import { HUBS } from "@/lib/articles/hub-data";

export const dynamicParams = false;

export function generateStaticParams() {
  const hubs = Object.keys(HUBS).map((lang) => ({ lang, aslug: magazineSlug(lang), aslug2: HUB_SLUG[lang] }));
  return [...nestedArticleParams(), ...hubs];
}

const isHub = (lang, aslug2) => HUB_SLUG[lang] === aslug2;

export function generateMetadata({ params }) {
  const { lang, aslug2 } = params;
  if (isHub(lang, aslug2)) {
    const data = HUBS[lang];
    if (!data) return {};
    const url = articleUrl(lang, aslug2);
    return {
      title: data.meta.title,
      description: data.meta.description,
      alternates: { canonical: url, languages: hubHreflang() },
      openGraph: { type: "article", title: data.meta.title, description: data.meta.description, url, siteName: "RapidRemove", locale: OG_LOCALE[lang] || "en_US", images: [OG_IMAGE], publishedTime: data.meta.date, modifiedTime: data.meta.date, authors: [data.meta.author] },
    };
  }
  const r = resolveLocalized(lang, aslug2);
  if (!r) return {};
  const m = r.t.meta;
  const url = articleUrl(lang, m.slug);
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: hreflangForArticle(r.deSlug) },
    openGraph: { type: "article", title: m.title, description: m.description, url, siteName: "RapidRemove", locale: OG_LOCALE[lang] || "en_US", images: [OG_IMAGE], publishedTime: dateFor(r.deSlug), modifiedTime: dateFor(r.deSlug), authors: [authorFor(r.deSlug).name] },
  };
}

export default function Page({ params }) {
  const { lang, aslug2 } = params;
  const ui = uiFor(lang);
  if (isHub(lang, aslug2)) {
    const hub = HUBS[lang];
    const hubAuthor = authorFor("google-unternehmensprofil-loeschen");
    // Hub-Byline ebenfalls auf die Autorenseite verlinken (statt /ueber-uns).
    const data = { ...hub, meta: { ...hub.meta, author: hubAuthor.name, authorRole: roleFor(hubAuthor, lang), authorHref: authorPathFor(hubAuthor, lang) } };
    const url = articleUrl(lang, aslug2);
    const related = relatedHubLinks(lang, CLUSTER_SLUGS);
    const jsonLd = buildArticleJsonLd(hub.meta, hub.faq, lang, ui, url, "google-unternehmensprofil-loeschen");
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <MagArticle data={data} lang={lang} ui={ui} langUrls={hubLangUrls()} related={related} />
      </>
    );
  }
  const r = resolveLocalized(lang, aslug2);
  const author = authorFor(r.deSlug);
  const data = {
    meta: { ...r.t.meta, date: dateFor(r.deSlug), author: author.name, authorRole: roleFor(author, lang), authorHref: authorPathFor(author, lang) },
    dek: r.t.dek,
    // Bewertungs-Ratgeber (nicht de): Service-Hinweis aufs neue Produkt einfügen.
    blocks: withReviewsPromo(r.deSlug, lang, r.t.blocks),
    faq: r.t.faq,
    category: r.t.category || r.de.category,
    iconKey: r.de.iconKey,
    readingMin: r.de.readingMin,
  };
  const related = resolveRelated(lang, r.t.related);
  const url = articleUrl(lang, r.t.meta.slug);
  const jsonLd = buildArticleJsonLd(r.t.meta, r.t.faq, lang, ui, url, r.deSlug);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang={lang} ui={ui} langUrls={langUrlsForArticle(r.deSlug)} related={related} />
    </>
  );
}
