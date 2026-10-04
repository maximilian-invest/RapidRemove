/* Route: /seo — eigene crawlbare Leistungsseite „SEO & Sichtbarkeit"
   (bei Google gefunden werden: Local SEO, OnPage, Content & Backlinks). */
import { SeoRoute } from "@/components/ServicePages";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/seo`;

export const metadata = {
  title: "SEO-Agentur: bei Google gefunden werden — RapidRemove",
  description:
    "Bei Google nach oben — lokal, organisch und messbar. SEO mit transparentem monatlichem Reporting, ohne Knebelverträge. Kostenlose SEO-Analyse.",
  alternates: { canonical: URL, languages: pageHreflang("seo") },
  openGraph: {
    type: "website",
    title: "SEO & Sichtbarkeit — RapidRemove",
    description:
      "Bei Google gefunden werden – von den richtigen Kunden. Local SEO, OnPage & Technik, Content und Backlinks. Kostenlose SEO-Analyse.",
    url: URL,
    siteName: "RapidRemove",
    locale: "de_DE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "SEO & Sichtbarkeit",
      serviceType: "Suchmaschinenoptimierung (SEO) / Local SEO",
      provider: { "@type": "Organization", name: "RapidRemove", legalName: "Simple Solution. OG", url: SITE_URL },
      areaServed: "Worldwide",
      url: URL,
      description:
        "Lokale und organische Suchmaschinenoptimierung mit transparentem monatlichem Reporting — Local SEO, OnPage & Technik, Content und Backlinks.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "SEO & Sichtbarkeit", item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoRoute initialLang="de" />
    </>
  );
}
