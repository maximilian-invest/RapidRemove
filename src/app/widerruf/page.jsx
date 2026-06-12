/* Route: /widerruf — Widerrufsbelehrung + Muster-Widerrufsformular (deutsche Fassung;
   lokalisierte Fassungen folgen nach anwaltlicher Freigabe). Bewusst nicht in der
   Sitemap (wie mit der Umsetzungs-Checkliste vereinbart), aber crawlbar. */
import { Widerruf } from "@/components/Terms";
import { SITE_URL } from "@/lib/article-google-profil";

const URL = `${SITE_URL}/widerruf`;

export const metadata = {
  title: "Widerrufsbelehrung — RapidRemove",
  description: "Widerrufsbelehrung und Muster-Widerrufsformular für Verbraucher (FAGG) der Simple Solution. OG (RapidRemove).",
  alternates: { canonical: URL },
  openGraph: { type: "website", title: "Widerrufsbelehrung — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Widerruf initialLang="de" />;
}
