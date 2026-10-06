import AdminNextClient from "@/components/admin2/AdminNextClient";

/* Neues Admin-Dashboard (Claude-Design-Handoff „Admin-App · Aufträge & Navigation") —
   läuft parallel zum bestehenden /admin mit denselben echten Daten und demselben Login. */
export const metadata = {
  title: "RapidRemove — Admin (neu)",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "RR Admin", statusBarStyle: "default" },
  icons: { apple: "/assets/app-icon-180.png" },
};

export default function Page() {
  return <AdminNextClient />;
}
