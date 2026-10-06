import AdminNextClient from "@/components/admin2/AdminNextClient";

/* Gleiches neues Admin wie /admin. Bleibt bewusst OHNE Weiterleitung bestehen: Home-Bildschirm-Apps, die von
   /admin/neu aus hinzugefügt wurden, haben diesen Pfad als Bereich – eine Weiterleitung nach /admin würde sie
   aus dem App-Modus werfen (Safari-Leisten oben/unten). */
export const metadata = {
  title: "RapidRemove — Admin",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "RR Admin", statusBarStyle: "default" },
  icons: { apple: "/assets/app-icon-180.png" },
};

export default function Page() {
  return <AdminNextClient />;
}
