/* Route: /agb — Allgemeine Geschäftsbedingungen (deutsche Fassung; Vertragssprache ist
   Deutsch, lokalisierte Fassungen folgen nach anwaltlicher Freigabe). Bewusst nicht in
   der Sitemap (wie mit der Umsetzungs-Checkliste vereinbart), aber crawlbar. */
import { Agb } from "@/components/Terms";
import { SITE_URL } from "@/lib/article-google-profil";

const URL = `${SITE_URL}/agb`;

export const metadata = {
  title: "AGB — RapidRemove",
  description: "Allgemeine Geschäftsbedingungen der Simple Solution. OG (RapidRemove) für die Entfernung von Google-Unternehmensprofilen und Reputationsdienstleistungen.",
  alternates: { canonical: URL },
  openGraph: { type: "website", title: "AGB — RapidRemove", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Agb initialLang="de" />;
}
