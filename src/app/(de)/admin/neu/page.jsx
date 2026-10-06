"use client";
/* Alte Adresse des neuen Admins → /admin (Parameter wie ?order= bleiben erhalten). */
import React from "react";

export default function Page() {
  React.useEffect(() => { try { window.location.replace("/admin" + window.location.search + window.location.hash); } catch (e) { /* */ } }, []);
  return <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", color: "#6b6b6b" }}>Weiterleitung…</div>;
}
