import AdminClient from "@/components/admin/AdminClient";

export const metadata = {
  title: "RapidRemove — Admin",
  robots: { index: false, follow: false },
  // Vom Home-Screen als eigenständige App öffnen (Icon-Tap → /admin, Vollbild).
  appleWebApp: { capable: true, title: "RR Admin", statusBarStyle: "default" },
  manifest: "/admin.webmanifest", // eigenes Manifest (Partner-App hat ein eigenes unter /partner)
  icons: { apple: "/assets/app-icon-180.png" },
};

export default function Page() {
  return <AdminClient />;
}
