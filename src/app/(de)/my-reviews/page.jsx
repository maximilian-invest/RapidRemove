import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export const metadata = {
  title: "My reviews — RapidRemove",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CustomerDashboard />;
}
