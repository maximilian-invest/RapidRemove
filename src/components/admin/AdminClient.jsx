"use client";
import React from "react";
import "@/styles/admin.css";
import { AdminGate } from "./AdminGate";

/* Das Dashboard ist rein client-seitig (nutzt window/document, Animationen).
   Wir rendern es erst nach dem Mount, um SSR-/Hydration-Probleme zu vermeiden. */
export default function AdminClient() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", color: "#6b6259" }}>Lädt…</div>;
  return <AdminGate />;
}
