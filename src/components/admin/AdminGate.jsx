"use client";
import React from "react";
import { asset } from "@/lib/base";
import { verifyAdmin, setAdminToken, opsConfigured } from "@/lib/admin-api";
import { AdminApp } from "./AdminApp";

const KEY = "rr_admin_token";

export function AdminGate() {
  const [authed, setAuthed] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let t = "";
    try { t = sessionStorage.getItem(KEY) || ""; } catch (e) {}
    if (t) { setAdminToken(t); setAuthed(true); }
  }, []);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!pw.trim()) return;
    setBusy(true); setErr("");
    try {
      const ok = await verifyAdmin(pw.trim());
      if (ok) {
        setAdminToken(pw.trim());
        try { sessionStorage.setItem(KEY, pw.trim()); } catch (e) {}
        setAuthed(true);
      } else {
        setErr("Falsches Passwort.");
      }
    } catch (e) {
      setErr(e.message || "Anmeldung fehlgeschlagen.");
    } finally { setBusy(false); }
  };

  if (authed) return <AdminApp />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f3f0", padding: 20 }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 360, background: "#fff", border: "1px solid #ece7e1", borderTop: "4px solid #ff8000", borderRadius: 18, padding: "32px 28px", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>
        <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" style={{ height: 30, marginBottom: 18 }} />
        <h1 style={{ fontSize: 19, margin: "0 0 4px", fontWeight: 800, color: "#1c1916" }}>Admin-Anmeldung</h1>
        <p style={{ fontSize: 13.5, color: "#6b6259", margin: "0 0 18px", lineHeight: 1.5 }}>Bitte mit dem Admin-Passwort anmelden.</p>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passwort" autoFocus
          style={{ width: "100%", height: 46, border: "1.5px solid #e2dcd5", borderRadius: 10, padding: "0 14px", fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
        {err ? <div style={{ color: "#e23b3b", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{err}</div> : null}
        <button type="submit" disabled={busy} style={{ width: "100%", height: 46, border: "none", borderRadius: 10, background: "#ff8000", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Prüfe…" : "Anmelden"}
        </button>
        {!opsConfigured() ? <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700, marginTop: 12, lineHeight: 1.4 }}>Hinweis: <code>NEXT_PUBLIC_OPS_URL</code> ist nicht gesetzt — Anmeldung &amp; Versand brauchen das ops-Backend.</div> : null}
      </form>
    </div>
  );
}
