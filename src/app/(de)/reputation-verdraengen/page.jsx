/* Route: /reputation-verdraengen — eigene crawlbare Landingpage „Negative
   Google-Treffer verdrängen" (vorher nur eine In-App-Ansicht ohne URL). */
import { OrmRoute } from "@/components/ServicePages";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/reputation-verdraengen`;

export const metadata = {
  title: "Negative Google-Treffer verdrängen — RapidRemove",
  description:
    "Negative Suchergebnisse gezielt verdrängen und Ihre Online-Reputation auf Seite 1 zurückerobern. Strategie, positive Inhalte und Monitoring von der spezialisierten Reputations-Agentur.",
  alternates: { canonical: URL, languages: pageHreflang("orm") },
  openGraph: {
    type: "website",
    title: "Negative Google-Treffer verdrängen — RapidRemove",
    description:
      "Reputation schützen & negative Treffer verdrängen — Seite 1 von Google zurückerobern. Persönlich, diskret, messbar.",
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
      name: "Reputation schützen & verdrängen",
      serviceType: "Online-Reputationsmanagement / Verdrängung negativer Suchergebnisse",
      provider: { "@type": "Organization", name: "RapidRemove", legalName: "Simple Solution. OG", url: SITE_URL },
      areaServed: "Worldwide",
      url: URL,
      description:
        "Verdrängung negativer Google-Treffer durch positive Inhalte und gezielte Reputationsstrategie.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Reputation verdrängen", item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <OrmRoute initialLang="de" />
    </>
  );
}
