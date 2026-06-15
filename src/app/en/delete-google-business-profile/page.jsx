/* Route: /en/delete-google-business-profile — English flagship/hub article
   (the main English money keyword; German flagship lives at /magazin/...). */
import MagArticle from "@/components/MagArticle";
import data from "@/lib/articles/en-hub-delete-google-business-profile";
import { uiFor, SITE_URL } from "@/lib/articles/registry";
import { buildArticleJsonLd } from "@/lib/articles/catalog";
import { hubHreflang, hubLangUrls } from "@/lib/articles/hubs";
import { OG_LOCALE, OG_IMAGE } from "@/lib/locales-meta";

const url = `${SITE_URL}/en/delete-google-business-profile`;
const ui = uiFor("en");
const related = [
  { label: "Have a Google review removed: cost & methods", href: "/en/remove-google-reviews/" },
  { label: "Delete a Google Maps listing", href: "/en/delete-google-maps-listing/" },
  { label: "Negative review: lawyer or technical removal?", href: "/en/negative-google-review-lawyer-or-removal/" },
];
const jsonLd = buildArticleJsonLd(data.meta, data.faq, "en", ui, url);

export const metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: url, languages: hubHreflang() },
  openGraph: {
    type: "article", title: data.meta.title, description: data.meta.description, url,
    siteName: "RapidRemove", locale: OG_LOCALE.en, images: [OG_IMAGE],
    publishedTime: data.meta.date, modifiedTime: data.meta.date, authors: [data.meta.author],
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagArticle data={data} lang="en" ui={ui} langUrls={hubLangUrls()} related={related} />
    </>
  );
}
