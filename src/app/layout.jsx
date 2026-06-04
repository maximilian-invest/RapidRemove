/* RapidRemove — root layout: design tokens + global styles, metadata */
import "@/styles/colors_and_type.css";
import "@/styles/app.css";
import "@/styles/wizard.css";
import "@/styles/blog.css";

export const metadata = {
  metadataBase: new URL("https://rapid-remove.com"),
  title: "RapidRemove — Google-Unternehmensprofil löschen lassen",
  description:
    "Google lässt Sie Ihr Profil nicht selbst löschen. Wir schon — dauerhaft, legal, in 24 Stunden. Inklusive aller Bewertungen. Bezahlung erst nach erfolgreicher Löschung.",
  applicationName: "RapidRemove",
  icons: { icon: "/assets/rapidremove-icon.png", apple: "/assets/rapidremove-icon.png" },
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
      <body>{children}</body>
    </html>
  );
}
