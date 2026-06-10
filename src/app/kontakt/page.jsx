/* Route: /kontakt — eigene Kontaktseite (Formular + direkte Kanäle + Standort). */
import Kontakt from "@/components/Kontakt";
import { SITE_URL } from "@/lib/article-google-profil";

const URL = `${SITE_URL}/kontakt`;

export const metadata = {
  title: "Kontakt — RapidRemove",
  description: "Sprechen Sie mit dem RapidRemove-Team: Frage zur Löschung, laufender Auftrag oder Partnerschaft. Antwort meist innerhalb weniger Stunden.",
  alternates: { canonical: URL },
  openGraph: { type: "website", title: "Kontakt — RapidRemove", description: "Sprechen Sie persönlich mit unserem Team.", url: URL, siteName: "RapidRemove", locale: "de_DE" },
};

export default function Page() {
  return <Kontakt />;
}
