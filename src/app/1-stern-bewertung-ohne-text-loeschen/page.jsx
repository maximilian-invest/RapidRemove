/* Route: /1-stern-bewertung-ohne-text-loeschen (German SEO article) */
import MagArticle from "@/components/MagArticle";
import data from "@/lib/articles/1-stern-bewertung-ohne-text-loeschen";
import { buildJsonLd, SITE_URL } from "@/lib/articles/registry";

const url = `${SITE_URL}/${data.meta.slug}`;

export const metadata = {
  title: data.meta.title,
  description: data.meta.description,
  keywords: data.meta.keywords,
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    title: data.meta.title,
    description: data.meta.description,
    url,
    siteName: "RapidRemove",
    locale: "de_DE",
    publishedTime: data.meta.date,
    modifiedTime: data.meta.date,
    authors: [data.meta.author],
  },
};

const jsonLd = buildJsonLd(data.meta, data.faq);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} />
    </>
  );
}
