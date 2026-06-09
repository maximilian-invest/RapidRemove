import OrderFormStandalone from "@/components/OrderFormStandalone";

export const metadata = {
  title: "Kurzer Fragebogen — RapidRemove",
  robots: { index: false, follow: false },
};

export default function Page({ params }) {
  return <OrderFormStandalone orderId={params.id} />;
}
