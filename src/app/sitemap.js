import { ARTICLE_META, SITE_URL } from "@/lib/article-google-profil";
import { LOCALES, localeUrl } from "@/lib/locales-meta";

export default function sitemap() {
  const homes = LOCALES.map((l) => ({
    url: localeUrl(l),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: l === "de" ? 1 : 0.9,
  }));
  return [
    ...homes,
    { url: `${SITE_URL}/ueber-uns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: ARTICLE_META.url, lastModified: ARTICLE_META.dateModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
