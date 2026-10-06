import AdminClient from "@/components/admin/AdminClient";

/* Bisheriges Admin (Fallback) — seit 06.10.2026 läuft unter /admin das neue Admin. */
export const metadata = {
  title: "RapidRemove — Admin (alt)",
  robots: { index: false, follow: false },
  icons: { apple: "/assets/app-icon-180.png" },
};

export default function Page() {
  return <AdminClient />;
}
