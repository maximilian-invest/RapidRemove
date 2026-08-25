import { ARTICLE_META, SITE_URL } from "@/lib/article-google-profil";
import { LOCALES, localeUrl, magazineUrl } from "@/lib/locales-meta";
import { CLUSTER_SLUGS } from "@/lib/articles/registry";
import { nestedArticleParams, articleUrl } from "@/lib/articles/catalog";
import { PAGE_KEYS, pageUrl, pageHasLocale } from "@/lib/page-routes";
import { HUB_PATH } from "@/lib/articles/hubs";

export default function sitemap() {
  const homes = LOCALES.map((l) => ({
    url: localeUrl(l),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: l === "de" ? 1 : 0.9,
  }));
  const cluster = CLUSTER_SLUGS.map((s) => ({
    url: articleUrl("de", s),
    lastModified: new Date("2026-06-04"),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const translated = nestedArticleParams().map(({ lang, aslug2 }) => ({
    url: articleUrl(lang, aslug2),
    lastModified: new Date("2026-06-04"),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  // Magazin-Übersicht je Sprache (DE: /magazin separat unten; hier die 10 Lokalisierungen).
  const magazines = LOCALES.filter((l) => l !== "de").map((l) => ({
    url: magazineUrl(l),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  // Sekundärseiten (about · impressum · datenschutz · orm · deindex · kontakt)
  // in allen Sprachen — DE an der Wurzel, sonst lokalisierter Slug unter /<lang>/.
  const prio = { orm: 0.8, deindex: 0.8, about: 0.7, reviews: 0.8 };
  const secondary = [];
  for (const key of PAGE_KEYS) {
    for (const l of LOCALES) {
      // Sprachen ohne eigene Fassung überspringen (reviews existiert nicht auf de)
      if (!pageHasLocale(key, l)) continue;
      secondary.push({ url: pageUrl(key, l), lastModified: new Date(), changeFrequency: "monthly", priority: prio[key] || 0.5 });
    }
  }
  // Lead/Hub article ("Delete Google Business Profile") in every non-DE language
  // (DE is added below via ARTICLE_META.url).
  const hubs = Object.keys(HUB_PATH).filter((l) => l !== "de").map((l) => ({
    url: `${SITE_URL}${HUB_PATH[l].replace(/\/$/, "")}`,
    lastModified: new Date("2026-06-04"), changeFrequency: "monthly", priority: 0.8,
  }));
  return [
    ...homes,
    ...hubs,
    { url: `${SITE_URL}/magazin`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...magazines,
    ...secondary,
    { url: ARTICLE_META.url, lastModified: ARTICLE_META.dateModified, changeFrequency: "monthly", priority: 0.8 },
    ...cluster,
    ...translated,
  ];
}
