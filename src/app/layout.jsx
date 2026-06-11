/* RapidRemove — root layout: design tokens + global styles, metadata */
import Script from "next/script";
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
  metadataBase: new URL("https://rapid-remove.com"),
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
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KQH66GNX');`}</Script>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KQH66GNX" height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" /></noscript>

        {/* Structured data — Organization, Service, ratings, product (site-wide) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org","@type":"Organization","url":"https://www.rapid-remove.com","logo":"https://assets.simplesolution.at/logo-rapid-remove.png","name":"RapidRemove","description":"RapidRemove is an Austrian company specializing in online reputation management services. Based in Hallein, Salzburg, it is the largest provider in Europe for issues related to Google Business Profiles.","email":"helpdesk@rapid-remove.com","telephone":"+4362459305300","address":{"@type":"PostalAddress","streetAddress":"Salzgasse 2","addressLocality":"Hallein","addressRegion":"Salzburg","postalCode":"5400","addressCountry":"AT"},"vatID":"ATU72401536","image":"https://assets.simplesolution.at/rapid-remove-product-image.jpg"}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"Service","name":"Google Business Profile Removal Service","description":"Complete and permanent removal of a Google Business Profile. Market leader in online reputation management services with Google.","provider":{"@type":"Organization","name":"RapidRemove","logo":"https://assets.simplesolution.at/rapid-remove-logo.jpg","url":"https://www.rapid-remove.com","contactPoint":{"@type":"ContactPoint","contactType":"Customer Service","email":"helpdesk@rapid-remove.com","telephone":"+4362459305300","hoursAvailable":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"17:00","address":{"@type":"PostalAddress","addressLocality":"Hallein","addressCountry":"AT","streetAddress":"Salzgasse 2","postalCode":"5400"}}]}},"areaServed":{"@type":"Place","name":"Worldwide"},"serviceType":"Online Reputation Management","offers":{"@type":"Offer","url":"https://www.rapid-remove.com/order","priceCurrency":"USD","price":"350","itemCondition":"https://schema.org/NewCondition","availability":"https://schema.org/InStock"}}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"AggregateRating","ratingValue":"4.9","reviewCount":"262","itemReviewed":{"@type":"Organization","name":"RapidRemove","url":"https://www.rapid-remove.com"}}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"Review","author":{"@type":"Organization","name":"Trustpilot"},"reviewRating":{"@type":"Rating","ratingValue":"4.9"},"reviewBody":"Ratings are sourced from Trustpilot.","itemReviewed":{"@type":"Organization","name":"RapidRemove","url":"https://www.rapid-remove.com"},"url":"https://www.trustpilot.com/review/rapid-remove.com"}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{"@context":"https://schema.org/","@type":"Product","name":"RapidRemove","image":"https://assets.simplesolution.at/logo-rapid-remove.png","aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":262,"bestRating":5}}` }} />

        {/* FirstPromoter (affiliate tracking) */}
        <Script id="fpr-init" strategy="afterInteractive">{`(function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window); fpr("init", {cid:"2ykmmr9o"}); fpr("click");`}</Script>
        <Script src="https://cdn.firstpromoter.com/fpr.js" strategy="afterInteractive" />

        {/* Referrer / src attribution -> cookie + ?src= (+ friend/tid for FirstPromoter) */}
        <Script id="rr-src-attribution" strategy="afterInteractive">{`
          let params = new URLSearchParams(window.location.search);
          let referrer = "direct";
          if (!document.referrer.includes("rapid-remove.com")) {
            if (params.get("gclid")) { referrer = "g_ads"; }
            else if (params.get("utm") == "reddit_ads") { referrer = "reddit_ads"; }
            else if (document.referrer) {
              if (document.referrer.includes("google")) referrer = "organic_google";
              else if (document.referrer.includes("bing")) referrer = "organic_bing";
              else if (document.referrer.includes("trustpilot")) referrer = "trustpilot";
              else if (document.referrer.includes("chatgpt")) referrer = "chatgpt";
              else if (document.referrer.includes("youtube")) referrer = "youtube";
              else if (document.referrer.includes("reddit")) referrer = "reddit";
              else referrer = document.referrer;
            }
            document.cookie = "referrer=" + referrer + "; path=/; max-age=3600";
          }
          const url = new URL(window.location.href);
          let src = getCookie("referrer") ? getCookie("referrer") : false;
          if (src) { url.searchParams.set("src", src); window.history.replaceState(null, null, url); }
          if (params.get("friend")) {
            document.cookie = "friend=" + params.get("friend") + "; path=/; max-age=2592000";
          } else {
            let friend = getCookie("friend") ? getCookie("friend") : false;
            if (friend) { url.searchParams.set("friend", friend); window.history.replaceState(null, null, url); }
          }
          let tid = getCookie("_fprom_tid") ? getCookie("_fprom_tid") : false;
          if (tid) { url.searchParams.set("tid", tid); window.history.replaceState(null, null, url); }
          function getCookie(name) { return (document.cookie.match('(^|;) *' + name + '=([^;]*)') || [])[2]; }
        `}</Script>
        {children}
      </body>
    </html>
  );
}
