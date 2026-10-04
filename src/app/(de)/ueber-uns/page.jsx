/* Route: /ueber-uns — statically generated About page with Organization JSON-LD. */
import About from "@/components/About";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/ueber-uns`;

export const metadata = {
  title: "Über uns — RapidRemove · Spezialisten für Google-Profil-Löschung",
  description:
    "RapidRemove ist die spezialisierte Reputations-Agentur für die Löschung von Google-Unternehmensprofilen — eine eingetragene Firma aus Hallein, Österreich (Simple Solution. OG). Unsere Mission, unser Team und echte Firmendaten.",
  alternates: { canonical: URL, languages: pageHreflang("about") },
  openGraph: {
    type: "website",
    title: "Über uns — RapidRemove · Spezialisten für Google-Profil-Löschung",
    description:
      "Spezialisierte Reputations-Agentur für die Löschung von Google-Profilen. Echte Firma aus Österreich, Bezahlung erst nach Erfolg.",
    url: URL,
    siteName: "RapidRemove",
    locale: "de_DE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "RapidRemove",
      legalName: "Simple Solution. OG",
      url: SITE_URL,
      logo: `${SITE_URL}/assets/rapidremove-logo-full.png`,
      email: "helpdesk@rapid-remove.com",
      vatID: "ATU72401536",
      foundingDate: "2021",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Salzgasse 2",
        postalCode: "5400",
        addressLocality: "Hallein",
        addressCountry: "AT",
      },
      founder: [
        { "@type": "Person", name: "Matthias" },
        { "@type": "Person", name: "Maximilian Hölzl" },
      ],
      areaServed: "Worldwide",
      sameAs: ["https://www.trustpilot.com/review/rapid-remove.com"],
      aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "267" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Über uns", item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <About initialLang="de" />
    </>
  );
}
