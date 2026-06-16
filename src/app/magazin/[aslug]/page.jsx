/* Route: /magazin/<article-slug> — ALLE deutschen Artikel unter dem Magazin-Slug:
   der Hub (bespoke Article.jsx) sowie die Cluster + firma (datengetrieben MagArticle).
   Der Magazin-Index liegt unter /magazin (eigene page.jsx). */
import Article from "@/components/Article";
import MagArticle from "@/components/MagArticle";
import { ARTICLE_META, FAQ, SITE_URL } from "@/lib/article-google-profil";
import { uiFor } from "@/lib/articles/registry";
import { DE_ARTICLES, resolveRelated, buildArticleJsonLd, hreflangForArticle, langUrlsForArticle, articleUrl, dateFor } from "@/lib/articles/catalog";
import { hubHreflang } from "@/lib/articles/hubs";
import { OG_IMAGE } from "@/lib/locales-meta";
import { authorFor, authorPersonLd, roleFor, authorPath } from "@/lib/authors";

export const dynamicParams = false;
const HUB = "google-unternehmensprofil-loeschen";

export function generateStaticParams() {
  return [{ aslug: HUB }, ...Object.keys(DE_ARTICLES).map((aslug) => ({ aslug }))];
}

export function generateMetadata({ params }) {
  if (params.aslug === HUB) {
    return {
      title: ARTICLE_META.title,
      description: ARTICLE_META.description,
      alternates: { canonical: ARTICLE_META.url, languages: hubHreflang() },
      openGraph: { type: "article", title: ARTICLE_META.title, description: ARTICLE_META.description, url: ARTICLE_META.url, siteName: "RapidRemove", locale: "de_DE", images: [OG_IMAGE], publishedTime: ARTICLE_META.datePublished, modifiedTime: ARTICLE_META.dateModified, authors: [ARTICLE_META.author] },
      twitter: { card: "summary_large_image", title: ARTICLE_META.title, description: ARTICLE_META.description },
    };
  }
  const data = DE_ARTICLES[params.aslug];
  if (!data) return {};
  const url = articleUrl("de", params.aslug);
  const date = dateFor(params.aslug);
  return {
    title: data.meta.title,
    description: data.meta.description,
    alternates: { canonical: url, languages: hreflangForArticle(params.aslug) },
    openGraph: { type: "article", title: data.meta.title, description: data.meta.description, url, siteName: "RapidRemove", locale: "de_DE", images: [OG_IMAGE], publishedTime: date, modifiedTime: date, authors: [authorFor(params.aslug).name] },
  };
}

function hubJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: ARTICLE_META.h1,
        description: ARTICLE_META.description,
        image: "https://assets.simplesolution.at/rapid-remove-product-image.jpg",
        datePublished: ARTICLE_META.datePublished,
        dateModified: ARTICLE_META.dateModified,
        inLanguage: "de-DE",
        author: authorPersonLd(authorFor("google-unternehmensprofil-loeschen")),
        publisher: { "@type": "Organization", name: "RapidRemove", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/rapidremove-logo-full.png` } },
        mainEntityOfPage: { "@type": "WebPage", "@id": ARTICLE_META.url },
        keywords: ARTICLE_META.keywords.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Magazin", item: `${SITE_URL}/magazin` },
          { "@type": "ListItem", position: 3, name: "Google-Unternehmensprofil löschen", item: ARTICLE_META.url },
        ],
      },
      { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
}

export default function Page({ params }) {
  if (params.aslug === HUB) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd()) }} />
        <Article />
      </>
    );
  }
  const base = DE_ARTICLES[params.aslug];
  const author = authorFor(params.aslug);
  // Byline DETERMINISTISCH aus authorFor (deckungsgleich mit der Autorenseite,
  // verlinkt auf /autor/<slug>/ statt /ueber-uns) + gestaffeltes Datum.
  const meta = { ...base.meta, date: dateFor(params.aslug), author: author.name, authorRole: roleFor(author, "de"), authorHref: authorPath(author) };
  const data = { ...base, meta };
  const ui = uiFor("de");
  const url = articleUrl("de", params.aslug);
  const related = resolveRelated("de", base.related);
  const jsonLd = buildArticleJsonLd(meta, base.faq, "de", ui, url, params.aslug);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang="de" ui={ui} langUrls={langUrlsForArticle(params.aslug)} related={related} />
    </>
  );
}
