/* Route: /angebot?id=<Angebotsnummer>&t=<token> — schriftliches Angebot öffnen (alle Sprachen, Sprache kommt aus dem Angebot).
   Bewusst ohne dynamisches Segment ([id]): dessen Chunk wurde im Browser teils nicht ausgeliefert (09.11.2026). */
import OfferPage from "@/components/OfferPage";

export const metadata = {
  title: "Ihr Angebot — RapidRemove",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OfferPage />;
}
