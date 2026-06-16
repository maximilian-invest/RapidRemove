/* RapidRemove — article catalog: German sources + translations + i18n helpers.
   Server-side only (heavy). Used by the article route pages, not the renderer. */
import { SITE_URL } from "@/lib/article-google-profil";
import { magazineUrl, magazineSlug } from "@/lib/locales-meta";
import { TRANSLATIONS } from "@/lib/articles/translations";
import { CLUSTER_CARDS } from "@/lib/articles/registry";
import { authorFor, authorPersonLd } from "@/lib/authors";
import { HUB_PATH, HUB_CARD } from "@/lib/articles/hubs";

import a1 from "@/lib/articles/google-bewertung-loeschen-lassen";
import a2 from "@/lib/articles/fake-google-bewertung-melden-loeschen";
import a3 from "@/lib/articles/negative-google-bewertung-anwalt-oder-technische-loeschung";
import a4 from "@/lib/articles/schlechte-google-bewertungen-was-tun";
import a5 from "@/lib/articles/1-stern-bewertung-ohne-text-loeschen";
import a6 from "@/lib/articles/google-rezension-loeschen-lassen";
import a7 from "@/lib/articles/google-maps-eintrag-loeschen";
import a8 from "@/lib/articles/firma-bei-google-loeschen";

const DE_LIST = [a1, a2, a3, a4, a5, a6, a7, a8];
export const DE_ARTICLES = Object.fromEntries(DE_LIST.map((a) => [a.meta.slug, a]));
export { TRANSLATIONS };

const FLAGSHIP_SLUG = "google-unternehmensprofil-loeschen-wie-geht-das";

// EINHEITLICH: jeder Artikel liegt unter dem Magazin-Slug.
//   DE:     /magazin/<slug>/
//   andere: /<lang>/<magazineSlug>/<slug>/   (magazine | revista | rivista | magasin)
export const articlePath = (lang, slug) =>
  lang === "de" ? `/${magazineSlug("de")}/${slug}/` : `/${lang}/${magazineSlug(lang)}/${slug}/`;
export const articleUrl = (lang, slug) => SITE_URL + articlePath(lang, slug).replace(/\/$/, "");

// Gestaffelte, plausible Veröffentlichungsdaten je Spoke (deutscher Slug) — damit
// nicht alle Artikel dasselbe Datum tragen. Sprachübergreifend stabil (über den
// deutschen Slug). Hub & Unbekanntes fallen auf das alte Default-Datum zurück.
const PUBLISH_DATES = {
  "google-bewertung-loeschen-lassen": "2025-09-15",
  "fake-google-bewertung-melden-loeschen": "2025-11-03",
  "negative-google-bewertung-anwalt-oder-technische-loeschung": "2026-01-20",
  "schlechte-google-bewertungen-was-tun": "2025-10-08",
  "1-stern-bewertung-ohne-text-loeschen": "2026-02-12",
  "google-rezension-loeschen-lassen": "2025-12-09",
  "google-maps-eintrag-loeschen": "2026-03-18",
  "firma-bei-google-loeschen": "2026-04-22",
};
export const dateFor = (deSlug) => PUBLISH_DATES[deSlug] || "2026-06-04";

// Markdown (Links/Fettung) aus Text entfernen — für strukturierte Daten (JSON-LD),
// die reinen Text erwarten, während die sichtbaren Blöcke via inline() rendern.
const stripMd = (s) => String(s || "")
  .replace(/\[([^\]]+)\]\((?:https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, "$1")
  .replace(/\*\*(.+?)\*\*/g, "$1");

// Lightweight magazine "Titelgeschichte" card for a localized hub, built from the
// shared HUB_CARD/HUB_PATH registry (the heavy article body lives in its route).
function hubCardFor(lang) {
  const h = HUB_CARD[lang];
  if (!h) return null;
  return {
    slug: h.slug, href: HUB_PATH[lang], cat: h.cat, thm: "thm-orange", icon: "trash",
    title: h.title, excerpt: h.excerpt,
    author: authorFor("google-unternehmensprofil-loeschen").name, read: 11,
    date: monthYear("2026-06-04", lang) || "2026",
  };
}

export const homeBase = (lang) => (lang === "de" ? "/" : `/${lang}/`);
export const tFor = (lang, deSlug) => (TRANSLATIONS[lang] || {})[deSlug];

// On-site path for an article in a given language (null if not translated).
export function localizedPath(lang, deSlug) {
  if (lang === "de") return articlePath("de", deSlug);
  const t = tFor(lang, deSlug);
  return t ? articlePath(lang, t.meta.slug) : null;
}

// Lightweight, client-safe magazine cards for a language (no article bodies):
// German shows the real SEO cluster; other locales reuse the localized article
// meta (title/description/slug/category/date) so the grid links to /<lang>/<slug>/.
const monthYear = (iso, lang) => {
  try { return new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(new Date(iso + "T12:00:00")); }
  catch (e) { return ""; }
};
export function magCardsFor(lang) {
  if (lang === "de") return CLUSTER_CARDS.map((c) => ({ ...c, href: articlePath("de", c.slug), author: authorFor(c.slug).name, date: monthYear(dateFor(c.slug), "de") || c.date }));
  const cards = CLUSTER_CARDS.map((c) => {
    const t = tFor(lang, c.slug);
    if (!t) return null;
    return {
      slug: t.meta.slug, href: articlePath(lang, t.meta.slug),
      cat: t.category || c.cat, thm: c.thm, icon: c.icon,
      title: t.meta.title, excerpt: t.meta.description,
      author: authorFor(c.slug).name, read: c.read,
      date: monthYear(dateFor(c.slug), lang) || c.date,
    };
  }).filter(Boolean);
  // Lokalisierter Hub als erste (Titel-)Story einreihen, wo vorhanden.
  const hub = hubCardFor(lang);
  return hub ? [hub, ...cards] : cards;
}

// [lang]/[aslug]/[aslug2] params for every translated article (aslug = magazine slug).
export function nestedArticleParams() {
  const out = [];
  for (const lang of Object.keys(TRANSLATIONS)) {
    const aslug = magazineSlug(lang);
    for (const deSlug of Object.keys(TRANSLATIONS[lang])) {
      out.push({ lang, aslug, aslug2: TRANSLATIONS[lang][deSlug].meta.slug });
    }
  }
  return out;
}

// Resolve a (lang, localized-slug) pair back to its data.
export function resolveLocalized(lang, aslug) {
  const map = TRANSLATIONS[lang] || {};
  for (const deSlug of Object.keys(map)) {
    if (map[deSlug].meta.slug === aslug) return { deSlug, t: map[deSlug], de: DE_ARTICLES[deSlug] };
  }
  return null;
}

// hreflang alternates (absolute URLs) for all language versions of an article.
export function hreflangForArticle(deSlug) {
  const m = { de: articleUrl("de", deSlug) };
  for (const lang of Object.keys(TRANSLATIONS)) {
    const t = TRANSLATIONS[lang][deSlug];
    if (t) m[lang] = articleUrl(lang, t.meta.slug);
  }
  m["x-default"] = articleUrl("de", deSlug);
  return m;
}

// Root-relative URLs per language for the in-page language switcher.
export function langUrlsForArticle(deSlug) {
  const m = { de: articlePath("de", deSlug) };
  for (const lang of Object.keys(TRANSLATIONS)) {
    const t = TRANSLATIONS[lang][deSlug];
    if (t) m[lang] = articlePath(lang, t.meta.slug);
  }
  return m;
}

// Resolve an article's "related" list to same-language on-site links (de fallback).
export function resolveRelated(lang, relatedList) {
  return (relatedList || []).map((r) => {
    const slug = r.url.replace(/^https?:\/\/(www\.)?rapid-remove\.com\//, "").replace(/\/$/, "");
    let href = null;
    // Flagship-Hub gibt es bislang nur auf Deutsch → in Fremdsprachen NICHT auf den
    // deutschen Artikel verlinken (P0.4). localizedPath liefert für nicht übersetzte
    // Artikel null → kein Cross-Language-Link, der Eintrag entfällt.
    if (slug === FLAGSHIP_SLUG) href = HUB_PATH[lang] || null;
    else if (DE_ARTICLES[slug]) href = localizedPath(lang, slug);
    return href ? { label: r.label, href } : null;
  }).filter(Boolean);
}

// Localized "read next" links for the hub: the cluster articles in `lang`
// (label = the localized article title, href = its on-site path).
export function relatedHubLinks(lang, deSlugs) {
  return (deSlugs || []).map((s) => {
    const href = localizedPath(lang, s);
    const t = lang === "de" ? DE_ARTICLES[s] : tFor(lang, s);
    return href && t ? { label: t.meta.title, href } : null;
  }).filter(Boolean);
}

// Artikel eines Autors in der Zielsprache: lokalisierter Titel + Pfad + die
// Karten-Optik (thm/icon) fürs Thumbnail. Hub + Cluster, deterministisch zugeordnet.
const HUB_DE_TITLE = "Google-Unternehmensprofil löschen lassen";
export function articlesForAuthor(lang, authorSlug) {
  const out = [];
  if (authorFor("google-unternehmensprofil-loeschen").slug === authorSlug && HUB_PATH[lang]) {
    const title = lang === "de" ? HUB_DE_TITLE : ((HUB_CARD[lang] && HUB_CARD[lang].title) || HUB_DE_TITLE);
    out.push({ slug: "google-unternehmensprofil-loeschen", title, href: HUB_PATH[lang], thm: "thm-orange", icon: "trash" });
  }
  for (const c of CLUSTER_CARDS) {
    if (authorFor(c.slug).slug !== authorSlug) continue;
    const href = localizedPath(lang, c.slug);
    if (!href) continue; // in dieser Sprache nicht übersetzt → überspringen
    const t = lang === "de" ? null : tFor(lang, c.slug);
    const title = lang === "de" ? c.title : ((t && t.meta.title) || c.title);
    out.push({ slug: c.slug, title, href, thm: c.thm, icon: c.icon });
  }
  return out;
}

// Localized Article + BreadcrumbList + FAQPage JSON-LD.
export function buildArticleJsonLd(meta, faq, lang, ui, url, deSlug) {
  const date = dateFor(deSlug || meta.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: meta.h1 || meta.title,
        description: meta.description,
        image: "https://assets.simplesolution.at/rapid-remove-product-image.jpg",
        datePublished: date,
        dateModified: date,
        inLanguage: lang,
        author: authorPersonLd(authorFor(deSlug || meta.slug)),
        publisher: { "@type": "Organization", name: "RapidRemove", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/rapidremove-logo-full.png` } },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        keywords: (meta.keywords || []).join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.bcStart, item: `${SITE_URL}${homeBase(lang)}` },
          { "@type": "ListItem", position: 2, name: ui.bcMagazin, item: magazineUrl(lang) },
          { "@type": "ListItem", position: 3, name: meta.h1 || meta.title, item: url },
        ],
      },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: stripMd(f.q), acceptedAnswer: { "@type": "Answer", text: stripMd(f.a) } })) },
    ],
  };
}
