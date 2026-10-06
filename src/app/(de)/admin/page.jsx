import AdminNextClient from "@/components/admin2/AdminNextClient";

/* Admin-Dashboard (neu, seit 06.10.2026). Das bisherige Admin bleibt als Fallback unter /admin/alt. */
export const metadata = {
  title: "RapidRemove — Admin",
  robots: { index: false, follow: false },
  // Vom Home-Screen als eigenständige App öffnen (Icon-Tap → /admin, Vollbild).
  appleWebApp: { capable: true, title: "RR Admin", statusBarStyle: "default" },
  manifest: "/admin.webmanifest",
  icons: { apple: "/assets/app-icon-180.png" },
};

export default function Page() {
  return <AdminNextClient />;
}
