/* Route: /en/check-profile — lokalisierte Wizard-Einstiegs-URL (öffnet den Lösch-Check). */
import App from "@/components/App";
import { magCardsFor } from "@/lib/articles/catalog";
import { pageUrl, pageHreflang } from "@/lib/page-routes";
import { pageMeta } from "@/lib/page-meta";
import { OG_LOCALE, OG_IMAGE } from "@/lib/locales-meta";

const LANG = "en";
const META = pageMeta("wizard", LANG);
const URL = pageUrl("wizard", LANG);

export const metadata = {
  title: META.title,
  description: META.description,
  alternates: { canonical: URL, languages: pageHreflang("wizard") },
  openGraph: { type: "website", title: META.title, description: META.description, url: URL, siteName: "RapidRemove", locale: OG_LOCALE[LANG] || "en_US", images: [OG_IMAGE] },
};

export default function Page() {
  return <App initialLang="en" initialView="wizard" magCards={magCardsFor("en")} />;
}
