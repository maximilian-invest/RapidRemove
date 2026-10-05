import PartnerBoard from "@/components/partner/PartnerBoard";

export const metadata = {
  title: "Partner Board — RapidRemove",
  robots: { index: false, follow: false },
  // Partner-App am Home-Bildschirm (Voraussetzung für Push auf dem iPhone).
  manifest: "/partner.webmanifest",
  appleWebApp: { capable: true, title: "RR Partner", statusBarStyle: "default" },
  icons: { apple: "/assets/rapidremove-icon.png" },
};

export default function Page() {
  return <PartnerBoard />;
}
