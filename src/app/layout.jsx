/* RapidRemove — root layout: design tokens + global styles, metadata */
import Script from "next/script";
import "@/styles/colors_and_type.css";
import "@/styles/app.css";
import "@/styles/wizard.css";
import "@/styles/blog.css";
import "@/styles/article.css";
import "@/styles/about.css";
import "@/styles/demo.css";
import "@/styles/services.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  metadataBase: new URL("https://rapid-remove.com"),
  title: "RapidRemove — Google-Unternehmensprofil löschen lassen",
  description:
    "Google lässt Sie Ihr Profil nicht selbst löschen. Wir schon — dauerhaft, legal, in 24 Stunden. Inklusive aller Bewertungen. Bezahlung erst nach erfolgreicher Löschung.",
  applicationName: "RapidRemove",
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
        {children}
      </body>
    </html>
  );
}
