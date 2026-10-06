"use client";
/* /admin/neu — gleiches Login-Gate wie /admin (Passwort / Face ID, Token im Browser), danach die neue App. */
import React from "react";
import "@/styles/admin.css";
import "@/styles/admin2.css";
import { AdminGate } from "@/components/admin/AdminGate";
import AdminNext from "./AdminNext";

export default function AdminNextClient() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", color: "#6b6b6b" }}>Lädt…</div>;
  return <AdminGate App={AdminNext} />;
}
