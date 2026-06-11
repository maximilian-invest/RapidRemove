/* Route: /presse-auslisten — eigene crawlbare Landingpage „Negative Presse &
   Google-Treffer auslisten lassen" (vorher nur eine In-App-Ansicht ohne URL). */
import { DeindexRoute } from "@/components/ServicePages";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/presse-auslisten`;

export const metadata = {
  title: "Negative Presse & Google-Treffer auslisten lassen — RapidRemove",
  description:
    "Negative Presseartikel und unerwünschte Suchergebnisse aus Google auslisten lassen — kostenlose Erstprüfung durch unsere Partnerkanzlei. Bewertung nur, wenn eine Auslistung realistisch ist.",
  alternates: { canonical: URL, languages: pageHreflang("deindex") },
  openGraph: {
    type: "website",
    title: "Negative Presse & Google-Treffer auslisten lassen — RapidRemove",
    description:
      "Negative Presse und Suchergebnisse aus Google entfernen lassen. Kostenlose Erstprüfung, klare Empfehlung, Festpreis nur bei realistischer Auslistung.",
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
      name: "Presse & Suchergebnisse auslisten",
      serviceType: "De-Indexierung / Auslistung negativer Suchergebnisse",
      provider: { "@type": "Organization", name: "RapidRemove", legalName: "Simple Solution. OG", url: SITE_URL },
      areaServed: "Worldwide",
      url: URL,
      description:
        "Auslistung negativer Presseartikel und Suchergebnisse aus Google — kostenlose rechtliche Erstprüfung.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Presse auslisten", item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DeindexRoute initialLang="de" />
    </>
  );
}
