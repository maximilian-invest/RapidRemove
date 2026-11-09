/* Route: /angebot/<Angebotsnummer>?t=<token> — schriftliches Angebot öffnen (alle Sprachen, Sprache kommt aus dem Angebot). */
import OfferPage from "@/components/OfferPage";

export const metadata = {
  title: "Ihr Angebot — RapidRemove",
  robots: { index: false, follow: false },
};

export default function Page({ params }) {
  return <OfferPage id={decodeURIComponent(String((params && params.id) || ""))} />;
}
