/* Route: /agb — Allgemeine Geschäftsbedingungen (DE an der Wurzel; lokalisierte
   Fassungen unter /<lang>/<slug> via [lang]/[aslug]. Vertragssprache ist Deutsch,
   die Übersetzungen sind als unverbindliche Lesefassungen ausgewiesen). */
import { Agb } from "@/components/Terms";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/agb`;

export const metadata = {
  title: "AGB — RapidRemove",
  description: "Allgemeine Geschäftsbedingungen der Simple Solution. OG (RapidRemove) für die Entfernung von Google-Unternehmensprofilen und Reputationsdienstleistungen.",
  alternates: { canonical: URL, languages: pageHreflang("agb") },
  openGraph: { type: "website", title: "AGB — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Agb initialLang="de" />;
}
