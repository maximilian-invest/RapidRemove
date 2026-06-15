/* Route: /sv/radera-google-foretagsprofil — localized "Delete Google Business Profile" hub article
   (data-driven MagArticle; the German flagship lives at /magazin/...). */
import MagArticle from "@/components/MagArticle";
import data from "@/lib/articles/sv-hub-radera-google-foretagsprofil";
import { uiFor, SITE_URL, CLUSTER_SLUGS } from "@/lib/articles/registry";
import { buildArticleJsonLd, relatedHubLinks } from "@/lib/articles/catalog";
import { hubUrl, hubHreflang, hubLangUrls } from "@/lib/articles/hubs";
import { OG_LOCALE, OG_IMAGE } from "@/lib/locales-meta";

const LANG = "sv";
const url = hubUrl(LANG);
const ui = uiFor(LANG);
const related = relatedHubLinks(LANG, CLUSTER_SLUGS);
const jsonLd = buildArticleJsonLd(data.meta, data.faq, LANG, ui, url, "google-unternehmensprofil-loeschen");

export const metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: url, languages: hubHreflang() },
  openGraph: {
    type: "article", title: data.meta.title, description: data.meta.description, url,
    siteName: "RapidRemove", locale: OG_LOCALE[LANG] || "en_US", images: [OG_IMAGE],
    publishedTime: data.meta.date, modifiedTime: data.meta.date, authors: [data.meta.author],
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang={LANG} ui={ui} langUrls={hubLangUrls()} related={related} />
    </>
  );
}
