"use client";
/* /admin/neu — gleiches Login-Gate wie /admin (Passwort / Face ID, Token im Browser), danach die neue App. */
import React from "react";
import "@/styles/admin.css";
import "@/styles/admin2.css";
import { AdminGate } from "@/components/admin/AdminGate";
import AdminNext from "./AdminNext";

/* Fängt Render-Fehler ab: statt weißer „Application error“-Seite einmal automatisch neu laden, sonst Knopf. */
class Guard extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) {
    try { console.error("[admin]", err); } catch (e) { /* */ }
    try {
      const last = Number(sessionStorage.getItem("rr_admin_crash") || 0);
      if (Date.now() - last > 15000) { sessionStorage.setItem("rr_admin_crash", String(Date.now())); window.location.reload(); }
    } catch (e) { /* */ }
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", color: "#333" }}>
        <b>Da ist etwas schiefgelaufen.</b>
        <div style={{ margin: "8px 0 16px", color: "#777", fontSize: 13 }}>{String((this.state.err && this.state.err.message) || this.state.err)}</div>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: "10px 18px", borderRadius: 12, border: 0, background: "#111", color: "#fff", fontSize: 14 }}>Neu laden</button>
      </div>
    );
  }
}

export default function AdminNextClient() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", color: "#6b6b6b" }}>Lädt…</div>;
  return <Guard><AdminGate App={AdminNext} /></Guard>;
}
