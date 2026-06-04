import { ARTICLE_META, SITE_URL } from "@/lib/article-google-profil";

export default function sitemap() {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: ARTICLE_META.url, lastModified: ARTICLE_META.dateModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}
