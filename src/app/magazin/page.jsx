/* Route: /magazin — echte, statisch generierte Magazin-Übersicht (SEO),
   ersetzt die frühere SPA-Ansicht ?view=magazin. */
import MagazinStandalone from "@/components/MagazinStandalone";
import { SITE_URL } from "@/lib/article-google-profil";
import { CLUSTER_SLUGS } from "@/lib/articles/registry";
import { OG_IMAGE } from "@/lib/locales-meta";

const URL = `${SITE_URL}/magazin`;

export const metadata = {
  title: "Magazin — Google-Bewertungen & Online-Reputation | RapidRemove",
  description:
    "Der RapidRemove-Ratgeber: Google-Unternehmensprofil löschen, schlechte oder gefälschte Bewertungen entfernen, Rechtslage und Online-Reputation — verständlich erklärt.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    title: "Magazin — RapidRemove",
    description:
      "Ratgeber rund um Google-Bewertungen, Unternehmensprofile und Online-Reputation — Anleitungen, Rechtslage und bewährte Lösungswege.",
    url: URL,
    siteName: "RapidRemove",
    locale: "de_DE",
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "RapidRemove Magazin",
      url: URL,
      description:
        "Ratgeber rund um Google-Bewertungen, Unternehmensprofile und Online-Reputation.",
      isPartOf: { "@type": "WebSite", name: "RapidRemove", url: SITE_URL },
      hasPart: CLUSTER_SLUGS.map((s) => ({ "@type": "WebPage", url: `${SITE_URL}/${s}` })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Magazin", item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MagazinStandalone />
    </>
  );
}
