/* Route: /datenschutzerklaerung — eigene Datenschutzerklärung (ersetzt die Weiterleitung auf rapid-remove.com). */
import { Datenschutz } from "@/components/Legal";
import { SITE_URL } from "@/lib/article-google-profil";
import { pageHreflang } from "@/lib/page-routes";

const URL = `${SITE_URL}/datenschutzerklaerung`;

export const metadata = {
  title: "Datenschutzerklärung — RapidRemove",
  description: "Informationen zum Datenschutz bei RapidRemove: Verantwortlicher, Verarbeitungen, eingesetzte Dienste und Ihre Rechte.",
  alternates: { canonical: URL, languages: pageHreflang("datenschutz") },
  openGraph: { type: "website", title: "Datenschutzerklärung — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Datenschutz initialLang="de" />;
}
