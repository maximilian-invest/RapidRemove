/* Route: /impressum — eigenes Impressum (ersetzt die Weiterleitung auf rapid-remove.com). */
import { Impressum } from "@/components/Legal";
import { SITE_URL } from "@/lib/article-google-profil";

const URL = `${SITE_URL}/impressum`;

export const metadata = {
  title: "Impressum — RapidRemove",
  description: "Impressum und Anbieterkennzeichnung von RapidRemove (Simple Solution OG, Hallein, Österreich).",
  alternates: { canonical: URL },
  openGraph: { type: "website", title: "Impressum — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Impressum />;
}
