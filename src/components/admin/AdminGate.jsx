"use client";
import React from "react";
import { asset } from "@/lib/base";
import { verifyAdmin, setAdminToken, opsConfigured } from "@/lib/admin-api";
import { AdminApp } from "./AdminApp";

const KEY = "rr_admin_token";        // Token — sessionStorage (nur Sitzung) ODER localStorage (dauerhaft, hinter Face ID)
const FACE_KEY = "rr_admin_faceid";  // "1" wenn Face ID auf diesem Gerät aktiviert ist
const CRED_KEY = "rr_admin_cred";    // base64 der Passkey-Credential-ID

/* ── WebAuthn als lokales Face-ID-Entsperr-Gate ─────────────────────────────
   Hinweis: Das ist ein Komfort-Gate auf DIESEM Gerät (Face ID gibt den lokal
   gespeicherten Token frei) — kein server-geprüfter Passkey. Schutz im Alltag
   ja, aber der Token liegt lokal im Browserspeicher. */
const webauthnAvailable = () => typeof window !== "undefined" && !!window.PublicKeyCredential;
const rand = (n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function registerFaceId() {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: rand(32),
      rp: { id: location.hostname, name: "RapidRemove Admin" },
      user: { id: rand(16), name: "admin", displayName: "RapidRemove Admin" },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
      timeout: 60000,
      attestation: "none",
    },
  });
  if (!cred) throw new Error("Kein Passkey erstellt.");
  return toB64(cred.rawId);
}

async function unlockFaceId(credId) {
  await navigator.credentials.get({
    publicKey: {
      challenge: rand(32),
      rpId: location.hostname,
      allowCredentials: credId ? [{ type: "public-key", id: fromB64(credId) }] : [],
      userVerification: "required",
      timeout: 60000,
    },
  });
  // Wenn das Promise auflöst, hat das Gerät den Nutzer per Face ID verifiziert.
}

/* Stabile Hülle (außerhalb der Komponente → Eingabefeld verliert den Fokus nicht). */
function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f3f0", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360, background: "#fff", border: "1px solid #ece7e1", borderTop: "4px solid #ff8000", borderRadius: 18, padding: "32px 28px", boxShadow: "0 12px 40px rgba(0,0,0,.08)" }}>
        <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" style={{ height: 30, marginBottom: 18 }} />
        {children}
      </div>
    </div>
  );
}

const primaryBtn = (busy) => ({ width: "100%", height: 46, border: "none", borderRadius: 10, background: "#ff8000", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: busy ? 0.7 : 1, marginBottom: 8 });
const linkBtn = { width: "100%", background: "none", border: "none", color: "#6b6259", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "8px 0", textAlign: "center" };
const title = { fontSize: 19, margin: "0 0 4px", fontWeight: 800, color: "#1c1916" };
const sub = { fontSize: 13.5, color: "#6b6259", margin: "0 0 18px", lineHeight: 1.5 };
const errStyle = { color: "#e23b3b", fontSize: 13, fontWeight: 700, marginBottom: 12 };

export function AdminGate() {
  const [mode, setMode] = React.useState("loading"); // loading | password | enroll | faceid | authed
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [canFace, setCanFace] = React.useState(false);
  const [faceReason, setFaceReason] = React.useState("");

  React.useEffect(() => {
    (async () => {
      let face = "", session = "";
      try { face = localStorage.getItem(FACE_KEY) || ""; } catch (e) {}
      try { session = sessionStorage.getItem(KEY) || ""; } catch (e) {}
      // Face-ID-Verfügbarkeit prüfen – und falls nicht, den Grund in Klartext festhalten.
      let avail = false, reason = "";
      const secure = typeof window !== "undefined" && (window.isSecureContext || location.hostname === "localhost");
      if (!secure) {
        reason = "Kein sicherer Kontext – die Seite muss über https:// geöffnet sein.";
      } else if (!webauthnAvailable()) {
        reason = "Dieser Browser bietet keine Passkeys. Auf dem iPhone bitte in Safari öffnen.";
      } else if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        try {
          avail = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (!avail) reason = "Face ID hier nicht nutzbar. Bitte prüfen: iCloud-Schlüsselbund AN (Einstellungen → [Name] → iCloud → Passwörter & Schlüsselbund), in Safari öffnen (nicht Chrome), kein privater Tab.";
        } catch (e) { reason = "Face ID konnte nicht geprüft werden."; }
      } else {
        avail = true; // API vorhanden, aber Verfügbarkeitsprüfung fehlt → optimistisch erlauben
      }
      setCanFace(avail);
      setFaceReason(avail ? "" : reason);
      if (face === "1") { setMode("faceid"); return; }                 // Face ID aktiv → per Face ID entsperren
      // Dauerhaft eingeloggt bleiben: gespeicherten Token (localStorage, sonst alte Sitzung)
      // gegen den Server prüfen und übernehmen. Veralteter Token (Passwort geändert) ODER
      // Netzfehler werden sauber behandelt (Login bzw. „wie bisher").
      let saved = "";
      try { saved = localStorage.getItem(KEY) || ""; } catch (e) {}
      if (!saved) saved = session;
      if (saved) {
        let ok = false, reachable = true;
        try { ok = await verifyAdmin(saved); } catch (e) { reachable = false; }
        if (ok || !reachable) { setAdminToken(saved); setMode("authed"); return; }
        try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
      }
      setMode("password");
    })();
  }, []);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!pw.trim()) return;
    setBusy(true); setErr("");
    try {
      const ok = await verifyAdmin(pw.trim());
      if (!ok) { setErr("Falsches Passwort."); return; }
      setAdminToken(pw.trim());
      // Dauerhaft angemeldet bleiben — überlebt App-/Tab-Schließen (kein erneutes Passwort).
      try { localStorage.setItem(KEY, pw.trim()); } catch (e) {}
      try { sessionStorage.setItem(KEY, pw.trim()); } catch (e) {}
      setMode("authed");
    } catch (e) {
      setErr(e.message || "Anmeldung fehlgeschlagen.");
    } finally { setBusy(false); }
  };

  const enableFaceId = async () => {
    setBusy(true); setErr("");
    try {
      const credId = await registerFaceId();
      let tok = pw.trim();
      try { if (!tok) tok = sessionStorage.getItem(KEY) || ""; } catch (e) {}
      try {
        localStorage.setItem(CRED_KEY, credId);
        localStorage.setItem(KEY, tok);   // Token dauerhaft hinterlegen (Freigabe nur per Face ID)
        localStorage.setItem(FACE_KEY, "1");
      } catch (e) {}
      setMode("authed");
    } catch (e) {
      setErr("Face ID konnte nicht aktiviert werden: " + (e.message || e));
    } finally { setBusy(false); }
  };

  const unlock = async () => {
    setBusy(true); setErr("");
    try {
      let credId = "";
      try { credId = localStorage.getItem(CRED_KEY) || ""; } catch (e) {}
      await unlockFaceId(credId);
      let t = "";
      try { t = localStorage.getItem(KEY) || ""; } catch (e) {}
      if (!t) throw new Error("Kein gespeicherter Zugang — bitte Passwort verwenden.");
      // Hinterlegten Token gegen den Server prüfen: wurde das Passwort geändert,
      // sauber zurück zum Login statt mit veraltetem Token in 401 zu laufen.
      let ok = false, reachable = true;
      try { ok = await verifyAdmin(t); } catch (e) { reachable = false; }
      if (reachable && !ok) {
        try { localStorage.removeItem(FACE_KEY); localStorage.removeItem(CRED_KEY); localStorage.removeItem(KEY); } catch (e) {}
        setErr("Zugang abgelaufen (Passwort wurde geändert). Bitte neu anmelden.");
        setPw(""); setMode("password");
        return;
      }
      setAdminToken(t); setMode("authed");
    } catch (e) {
      setErr(e.message || "Face ID fehlgeschlagen.");
    } finally { setBusy(false); }
  };

  const resetFaceId = () => {
    try { localStorage.removeItem(FACE_KEY); localStorage.removeItem(CRED_KEY); localStorage.removeItem(KEY); } catch (e) {}
    setErr(""); setPw(""); setMode("password");
  };

  if (mode === "loading") return <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", color: "#6b6259" }}>Lädt…</div>;
  if (mode === "authed") return <AdminApp />;

  if (mode === "faceid") {
    return (
      <Shell>
        <h1 style={title}>Anmelden</h1>
        <p style={sub}>Mit Face ID entsperren.</p>
        {err ? <div style={errStyle}>{err}</div> : null}
        <button onClick={unlock} disabled={busy} style={primaryBtn(busy)}>{busy ? "Prüfe…" : "Mit Face ID anmelden"}</button>
        <button onClick={() => { setErr(""); setMode("password"); }} style={linkBtn}>Passwort verwenden</button>
        <button onClick={resetFaceId} style={{ ...linkBtn, color: "#b45309" }}>Face ID auf diesem Gerät zurücksetzen</button>
      </Shell>
    );
  }

  if (mode === "enroll") {
    return (
      <Shell>
        <h1 style={title}>Face ID aktivieren?</h1>
        <p style={sub}>Künftig direkt per Face ID anmelden — ohne Passwort. Du bleibst auf diesem Gerät angemeldet.</p>
        {err ? <div style={errStyle}>{err}</div> : null}
        <button onClick={enableFaceId} disabled={busy} style={primaryBtn(busy)}>{busy ? "Aktiviere…" : "Face ID aktivieren"}</button>
        <button onClick={() => setMode("authed")} style={linkBtn}>Später</button>
      </Shell>
    );
  }

  // mode === "password"
  return (
    <Shell>
      <h1 style={title}>Admin-Anmeldung</h1>
      <p style={sub}>Bitte mit dem Admin-Passwort anmelden.</p>
      <form onSubmit={submit}>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Passwort" autoFocus
          style={{ width: "100%", height: 46, border: "1.5px solid #e2dcd5", borderRadius: 10, padding: "0 14px", fontSize: 15, marginBottom: 12, boxSizing: "border-box" }} />
        {err ? <div style={errStyle}>{err}</div> : null}
        <button type="submit" disabled={busy} style={primaryBtn(busy)}>{busy ? "Prüfe…" : "Anmelden"}</button>
      </form>
      {canFace ? <button onClick={() => { setErr(""); setMode("faceid"); }} style={linkBtn}>Mit Face ID anmelden</button> : null}
      {!canFace && faceReason ? <div style={{ color: "#8a8079", fontSize: 12, fontWeight: 600, marginTop: 10, lineHeight: 1.45 }}>Face ID hier nicht verfügbar: {faceReason}</div> : null}
      {!opsConfigured() ? <div style={{ color: "#b45309", fontSize: 12, fontWeight: 700, marginTop: 12, lineHeight: 1.4 }}>Hinweis: <code>NEXT_PUBLIC_OPS_URL</code> ist nicht gesetzt — Anmeldung &amp; Versand brauchen das ops-Backend.</div> : null}
    </Shell>
  );
}
