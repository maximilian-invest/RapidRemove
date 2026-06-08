import AdminClient from "@/components/admin/AdminClient";

export const metadata = {
  title: "RapidRemove — Admin",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminClient />;
}
