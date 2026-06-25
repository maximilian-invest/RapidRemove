import OrderFormStandalone from "@/components/OrderFormStandalone";

export const metadata = {
  title: "Kurzer Fragebogen — RapidRemove",
  robots: { index: false, follow: false },
};

// Bestell-IDs sind dynamisch (Kunden-Link per Mail: www.rapid-remove.com/auftrag/<id>).
// Im Node-Betrieb (Railway, echte Domain) wird die Seite für JEDE id on-demand gerendert.
// Der statische GitHub-Pages-Export (Mirror unter /RapidRemove, NICHT kundenseitig) braucht
// mind. einen vorerzeugten Pfad, sonst bricht `output: export` ab. Ein Platzhalter genügt –
// die Seite ist noindex und holt ihre Daten ohnehin erst clientseitig per id aus der URL.
export function generateStaticParams() {
  return [{ id: "RR-000000" }];
}

export default function Page({ params }) {
  return <OrderFormStandalone orderId={params.id} />;
}
