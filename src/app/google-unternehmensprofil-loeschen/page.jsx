/* Route: /google-unternehmensprofil-loeschen  (DE-Hub, flach an der Wurzel)
   URL-Vereinheitlichung: früher /magazin/google-unternehmensprofil-loeschen → 301.
   Statically generated, SEO-first: rich metadata + JSON-LD structured data. */
import Article from "@/components/Article";
import { ARTICLE_META, FAQ, SITE_URL } from "@/lib/article-google-profil";
import { OG_IMAGE } from "@/lib/locales-meta";
import { authorFor, authorPersonLd } from "@/lib/authors";
import { hubHreflang } from "@/lib/articles/hubs";

export const metadata = {
  title: ARTICLE_META.title,
  description: ARTICLE_META.description,
  alternates: { canonical: ARTICLE_META.url, languages: hubHreflang() },
  openGraph: {
    type: "article",
    title: ARTICLE_META.title,
    description: ARTICLE_META.description,
    url: ARTICLE_META.url,
    siteName: "RapidRemove",
    locale: "de_DE",
    images: [OG_IMAGE],
    publishedTime: ARTICLE_META.datePublished,
    modifiedTime: ARTICLE_META.dateModified,
    authors: [ARTICLE_META.author],
  },
  twitter: {
    card: "summary_large_image",
    title: ARTICLE_META.title,
    description: ARTICLE_META.description,
  },
};

const jsonLd = {
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
      publisher: {
        "@type": "Organization",
        name: "RapidRemove",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/rapidremove-logo-full.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": ARTICLE_META.url },
      keywords: ARTICLE_META.keywords.join(", "),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
        // Kategorie-Breadcrumb „Magazin" zeigt weiter auf den Magazin-Index …
        { "@type": "ListItem", position: 2, name: "Magazin", item: `${SITE_URL}/magazin` },
        // … der Artikel selbst liegt jetzt flach an der Wurzel.
        { "@type": "ListItem", position: 3, name: "Google-Unternehmensprofil löschen", item: ARTICLE_META.url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Article />
    </>
  );
}
