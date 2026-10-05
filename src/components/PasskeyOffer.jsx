"use client";
/* Nach dem Passwort-Login einmal anbieten: „Nächstes Mal mit Face ID einloggen" (Kunde + Partner).
   Gleiches Design wie die Logins (Klassen aus dashboard.css unter .rra). */
import React from "react";
import { Loader, ScanFace } from "lucide-react";
import "@/styles/dashboard.css";
import { passkeyRegister, passkeyName, dismissPasskey, passkeyError, passkeySupported, passkeyOnDevice, passkeyLogin } from "@/lib/passkey";

/** Button „Log in with Face ID" für die Login-Seiten. primary = schon auf diesem Gerät aktiviert. */
export function PasskeyLoginButton({ role, onToken, onError, T }) {
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => { setOk(passkeySupported()); }, []);
  if (!ok) return null;
  const name = passkeyName();
  const primary = passkeyOnDevice(role);
  const go = async () => {
    setBusy(true); onError && onError("");
    try { const t = await passkeyLogin(role); onToken(t, true); }
    catch (e) { const m = passkeyError(e, T); if (m && onError) onError(m); }
    setBusy(false);
  };
  const nm = T ? (name === "fingerprint" ? T("nameFingerprint") : name === "passkey" ? T("namePasskey") : name) : (name === "fingerprint" ? "fingerprint" : name);
  return (
    <button type="button" className={"cta" + (primary ? "" : " gh")} disabled={busy} onClick={go} style={primary ? undefined : { marginTop: -4 }}>
      {busy ? <Loader className="spin" /> : <ScanFace />}{T ? T("pkLoginBtn", { name: nm }) : "Log in with " + nm}
    </button>
  );
}

export default function PasskeyOffer({ role, token, onDone, T }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const raw = passkeyName();
  // Kunde: übersetzt (T), Partner: Englisch.
  const t = T || ((k, v = {}) => ({
    pkTitle: `Log in faster with ${v.name}`,
    pkText: `Next time just tap “Log in with ${v.name}” – no password needed. You can still use your password anytime.`,
    pkTurnOn: `Turn on ${v.name}`, notNow: "Not now", nameFingerprint: "fingerprint", namePasskey: "passkey",
  }[k] || k));
  const name = raw === "fingerprint" ? t("nameFingerprint") : raw === "passkey" ? t("namePasskey") : raw;
  const on = async () => {
    setBusy(true); setErr("");
    try { await passkeyRegister(role, token); onDone(true); }
    catch (e) { const m = passkeyError(e, T); if (m) setErr(m); }
    setBusy(false);
  };
  return (
    <div className="rra">
      <div className="lg-wrap">
        <div className="lg">
          <div style={{ width: 96, height: 96, borderRadius: 28, background: "var(--g1)", display: "grid", placeItems: "center", marginBottom: 4 }}>
            <ScanFace style={{ width: 48, height: 48, strokeWidth: 1.8 }} />
          </div>
          <div>
            <h1>{t("pkTitle", { name })}</h1>
            <p>{t("pkText", { name })}</p>
          </div>
          {err ? <div className="note bad">{err}</div> : null}
          <button className="cta" disabled={busy} onClick={on}>{busy ? <Loader className="spin" /> : <ScanFace />}{t("pkTurnOn", { name })}</button>
          <button type="button" className="lnk" onClick={() => { dismissPasskey(role); onDone(false); }}>{t("notNow")}</button>
        </div>
      </div>
    </div>
  );
}
