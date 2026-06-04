/* Route: /schlechte-google-bewertungen-was-tun (German SEO article, with hreflang to translations) */
import MagArticle from "@/components/MagArticle";
import data from "@/lib/articles/schlechte-google-bewertungen-was-tun";
import { SITE_URL, uiFor } from "@/lib/articles/registry";
import { hreflangForArticle, langUrlsForArticle, resolveRelated, buildArticleJsonLd } from "@/lib/articles/catalog";

const url = `${SITE_URL}/${data.meta.slug}`;
const ui = uiFor("de");
const related = resolveRelated("de", data.related);
const jsonLd = buildArticleJsonLd(data.meta, data.faq, "de", ui, url);

export const metadata = {
  title: data.meta.title,
  description: data.meta.description,
  keywords: data.meta.keywords,
  alternates: { canonical: url, languages: hreflangForArticle(data.meta.slug) },
  openGraph: { type: "article", title: data.meta.title, description: data.meta.description, url, siteName: "RapidRemove", locale: "de_DE", publishedTime: data.meta.date, modifiedTime: data.meta.date, authors: [data.meta.author] },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang="de" ui={ui} langUrls={langUrlsForArticle(data.meta.slug)} related={related} />
    </>
  );
}
