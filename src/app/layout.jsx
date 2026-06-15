/* RapidRemove — root layout: design tokens + global styles, metadata */
import Consent from "@/components/Consent";
import "@/styles/colors_and_type.css";
import "@/styles/app.css";
import "@/styles/wizard.css";
import "@/styles/blog.css";
import "@/styles/article.css";
import "@/styles/about.css";
import "@/styles/kontakt.css";
import "@/styles/demo.css";
import "@/styles/services.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  metadataBase: new URL("https://www.rapid-remove.com"),
  title: "RapidRemove — Google-Unternehmensprofil löschen lassen",
  description:
    "Google lässt Sie Ihr Profil nicht selbst löschen. Wir schon — dauerhaft, legal, in 24 Stunden. Inklusive aller Bewertungen. Bezahlung erst nach erfolgreicher Löschung.",
  applicationName: "RapidRemove",
  verification: { google: "jDn8mNDtMGNL9qXRdvYXZJE_6Ar7c2Q-Fp-D4B5aSFM" },
  icons: { icon: `${BASE}/assets/rapidremove-icon.png`, apple: `${BASE}/assets/rapidremove-icon.png` },
  openGraph: {
    title: "RapidRemove — Google-Unternehmensprofil löschen lassen",
    description:
      "Dauerhaft, legal, in 24 Stunden. Bezahlung erst nach erfolgreicher Löschung.",
    type: "website",
    url: "/",
    siteName: "RapidRemove",
    locale: "de_DE",
    images: [{ url: "https://assets.simplesolution.at/rapid-remove-product-image.jpg" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Pinch-zoom is intentionally left enabled (accessibility) — no maximumScale.
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        {/* Tracking (GTM, FirstPromoter, Attribution) lädt consent-gated über <Consent /> am Ende des Body. */}

        {/* Structured data (site-wide): Organization + Service + Rich-Snippets
           (AggregateRating/Review/Product). Bewertungen stammen von Trustpilot
           (Drittquelle, deshalb als Review mit author=Trustpilot ausgewiesen).
           Hinweis: Google zeigt self-serving Rating-Markup ggf. nicht an. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org","@type":"Organization","url":"https://www.rapid-remove.com","logo":"https://assets.simplesolution.at/logo-rapid-remove.png","name":"RapidRemove","description":"RapidRemove is an Austrian company specializing in the removal of Google Business Profiles and online reputation management. Based in Hallein, Salzburg.","email":"helpdesk@rapid-remove.com","telephone":"+4362459305300","address":{"@type":"PostalAddress","streetAddress":"Salzgasse 2","addressLocality":"Hallein","addressRegion":"Salzburg","postalCode":"5400","addressCountry":"AT"},"vatID":"ATU72401536","image":"https://assets.simplesolution.at/rapid-remove-product-image.jpg","sameAs":["https://www.trustpilot.com/review/rapid-remove.com"]}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"Service","name":"Google Business Profile Removal Service","description":"Complete and permanent removal of a Google Business Profile, including all reviews. Specialized online reputation management via Google's official channels.","provider":{"@type":"Organization","name":"RapidRemove","logo":"https://assets.simplesolution.at/rapid-remove-logo.jpg","url":"https://www.rapid-remove.com","contactPoint":{"@type":"ContactPoint","contactType":"Customer Service","email":"helpdesk@rapid-remove.com","telephone":"+4362459305300","hoursAvailable":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"17:00","address":{"@type":"PostalAddress","addressLocality":"Hallein","addressCountry":"AT","streetAddress":"Salzgasse 2","postalCode":"5400"}}]}},"areaServed":{"@type":"Place","name":"Worldwide"},"serviceType":"Online Reputation Management","offers":{"@type":"Offer","url":"https://www.rapid-remove.com/profil-pruefen/","priceCurrency":"EUR","price":"450","itemCondition":"https://schema.org/NewCondition","availability":"https://schema.org/InStock"}}` }} />

        {/* Rich snippet: Organisation-Rating (Quelle: Trustpilot) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"AggregateRating","ratingValue":"4.9","reviewCount":"266","itemReviewed":{"@type":"Organization","name":"RapidRemove","url":"https://www.rapid-remove.com"}}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"Review","author":{"@type":"Organization","name":"Trustpilot"},"reviewRating":{"@type":"Rating","ratingValue":"4.9"},"reviewBody":"Ratings are sourced from Trustpilot.","itemReviewed":{"@type":"Organization","name":"RapidRemove","url":"https://www.rapid-remove.com"},"url":"https://www.trustpilot.com/review/rapid-remove.com"}` }} />
        {/* Rich snippet: Produkt-Bewertungen */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"Product","name":"RapidRemove","image":"https://assets.simplesolution.at/logo-rapid-remove.png","aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":266,"bestRating":5}}` }} />

        {children}
        <Consent />
      </body>
    </html>
  );
}
