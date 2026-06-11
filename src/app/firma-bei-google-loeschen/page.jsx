/* Route: /firma-bei-google-loeschen (German SEO article — layman entry to the
   core service; links to the flagship hub for the full guide). */
import MagArticle from "@/components/MagArticle";
import data from "@/lib/articles/firma-bei-google-loeschen";
import { SITE_URL, uiFor } from "@/lib/articles/registry";
import { resolveRelated, buildArticleJsonLd } from "@/lib/articles/catalog";
import { OG_IMAGE } from "@/lib/locales-meta";

const url = `${SITE_URL}/${data.meta.slug}`;
const ui = uiFor("de");
const related = resolveRelated("de", data.related);
const jsonLd = buildArticleJsonLd(data.meta, data.faq, "de", ui, url);

export const metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: url },
  openGraph: {
    type: "article", title: data.meta.title, description: data.meta.description, url,
    siteName: "RapidRemove", locale: "de_DE", images: [OG_IMAGE],
    publishedTime: data.meta.date, modifiedTime: data.meta.date, authors: [data.meta.author],
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang="de" ui={ui} langUrls={{ de: `/${data.meta.slug}/` }} related={related} />
    </>
  );
}
