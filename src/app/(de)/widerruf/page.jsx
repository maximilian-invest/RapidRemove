/* Route: /widerruf — Widerrufsbelehrung + Muster-Widerrufsformular (DE an der Wurzel;
   lokalisierte Fassungen unter /<lang>/<slug> via [lang]/[aslug]). */
import { Widerruf } from "@/components/Terms";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/widerruf`;

export const metadata = {
  title: "Widerrufsbelehrung — RapidRemove",
  description: "Widerrufsbelehrung und Muster-Widerrufsformular für Verbraucher (FAGG) der Simple Solution. OG (RapidRemove).",
  alternates: { canonical: URL, languages: pageHreflang("widerruf") },
  openGraph: { type: "website", title: "Widerrufsbelehrung — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Widerruf initialLang="de" />;
}
