/* Route: /<lang>/magazin — echte, statisch generierte Magazin-Übersicht je Sprache.
   Ersetzt die frühere client-only ?view=magazin-Ansicht und verlinkt die 70
   übersetzten Artikel von einer indexierbaren Seite (behebt die Orphan-Pages). */
import MagazinStandalone from "@/components/MagazinStandalone";
import { SITE_URL } from "@/lib/article-google-profil";
import { NON_DEFAULT_LOCALES, magazineUrl, magazineHreflangMap, OG_LOCALE, OG_IMAGE } from "@/lib/locales-meta";
import { magCardsFor } from "@/lib/articles/catalog";
import { I18N } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((lang) => ({ lang }));
}

export function generateMetadata({ params }) {
  const { lang } = params;
  const t = I18N[lang] || I18N.en;
  const b = t.blog || {};
  const url = magazineUrl(lang);
  const title = `${b.h1 || "Magazine"} — RapidRemove`;
  const description = b.lead || b.h1 || "RapidRemove Magazine.";
  return {
    title,
    description,
    alternates: { canonical: url, languages: magazineHreflangMap() },
    openGraph: { type: "website", title, description, url, siteName: "RapidRemove", locale: OG_LOCALE[lang] || "en_US", images: [OG_IMAGE] },
  };
}

export default function Page({ params }) {
  const { lang } = params;
  const url = magazineUrl(lang);
  const cards = magCardsFor(lang);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `RapidRemove Magazine (${lang})`,
        url,
        inLanguage: lang,
        isPartOf: { "@type": "WebSite", name: "RapidRemove", url: SITE_URL },
        hasPart: cards.map((c) => ({ "@type": "WebPage", url: `${SITE_URL}${c.href}` })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/${lang}/` },
          { "@type": "ListItem", position: 2, name: "Magazin", item: url },
        ],
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagazinStandalone lang={lang} magCards={cards} />
    </>
  );
}
