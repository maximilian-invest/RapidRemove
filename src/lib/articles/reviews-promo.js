/* RapidRemove — Service-Hinweis „Einzelne Bewertung löschen" in den
   Bewertungs-Ratgeberartikeln (SEO-Cluster). Wird zur Render-Zeit in die
   ÜBERSETZTEN Artikel eingefügt (nie in die deutschen Originale — das Produkt
   gibt es nicht in DACH) und direkt vor dem ersten Abschnitt platziert.
   Die Texte kommen 1:1 aus den freigegebenen Landingpage-Texten (RVW), der
   Link führt auf die Landingpage der jeweiligen Sprache. */
import { RVW } from "@/lib/reviews-copy";
import { pageUrl, pageHasLocale } from "@/lib/page-routes";

/* Deutsche Quell-Slugs der Artikel, in denen der Hinweis erscheint. Bewusst
   NICHT dabei: 1-stern-bewertung-ohne-text-loeschen (das Produkt setzt Text
   voraus) sowie Jameda/Kununu/Trustpilot (keine Google-Bewertungen). */
export const REVIEWS_PROMO_SLUGS = new Set([
  "google-bewertung-loeschen-lassen",
  "google-rezension-loeschen-lassen",
  "fake-google-bewertung-melden-loeschen",
  "schlechte-google-bewertungen-was-tun",
  "negative-google-bewertung-anwalt-oder-technische-loeschung",
  "negative-bewertung-ignorieren-antworten-loeschen",
  "was-kostet-eine-schlechte-google-bewertung",
]);

export function withReviewsPromo(deSlug, lang, blocks) {
  if (lang === "de" || !REVIEWS_PROMO_SLUGS.has(deSlug) || !pageHasLocale("reviews", lang)) return blocks;
  const r = RVW[lang] || RVW.en;
  const block = {
    t: "cta",
    title: `${r.eyebrow}: ${r.h1}`,
    text: `${r.price} ${r.per}. ${r.priceNote} ${r.condNote}`,
    btn: r.cta,
    href: pageUrl("reviews", lang),
    trust: r.assure,
  };
  // Vor dem ersten Abschnitt (h2) — nach Einleitung/Hinweis, prominent im Lesefluss.
  const i = (blocks || []).findIndex((b) => b && b.t === "h2");
  const list = (blocks || []).slice();
  list.splice(i >= 0 ? i : 0, 0, block);
  return list;
}
