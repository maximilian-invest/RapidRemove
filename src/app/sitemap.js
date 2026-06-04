import { ARTICLE_META, SITE_URL } from "@/lib/article-google-profil";
import { LOCALES, localeUrl } from "@/lib/locales-meta";
import { CLUSTER_SLUGS } from "@/lib/articles/registry";

export default function sitemap() {
  const homes = LOCALES.map((l) => ({
    url: localeUrl(l),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: l === "de" ? 1 : 0.9,
  }));
  const cluster = CLUSTER_SLUGS.map((s) => ({
    url: `${SITE_URL}/${s}`,
    lastModified: new Date("2026-06-04"),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [
    ...homes,
    { url: `${SITE_URL}/ueber-uns`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: ARTICLE_META.url, lastModified: ARTICLE_META.dateModified, changeFrequency: "monthly", priority: 0.8 },
    ...cluster,
  ];
}
