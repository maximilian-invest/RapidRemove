/* Route: /profil-pruefen — lokalisierte Wizard-Einstiegs-URL (öffnet den Lösch-Check).
   Andere Sprachen laufen über /[lang]/<lokalisierter-slug> (siehe page-routes). */
import App from "@/components/App";
import { magCardsFor } from "@/lib/articles/catalog";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/profil-pruefen`;

export const metadata = {
  title: "Profil prüfen — RapidRemove",
  description: "Kostenloser Profil-Check: Firmennamen eingeben und in Sekunden sehen, ob sich Ihr Google-Profil entfernen lässt.",
  alternates: { canonical: URL, languages: pageHreflang("wizard") },
  openGraph: { type: "website", title: "Profil prüfen — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <App initialLang="de" initialView="wizard" magCards={magCardsFor("de")} />;
}
