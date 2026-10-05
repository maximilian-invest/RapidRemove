"use client";
/* Admin → Partner: Partner-Zugang mit voller Kontrolle — E-Mail + Passwort sichtbar, neues Passwort
   setzen/erzeugen, E-Mail ändern, Board als Partner öffnen (persönlicher Link). */
import React from "react";
import { partnerAccounts, partnerAccountSet, partnerLink, partnerTestLink } from "@/lib/admin-api";

export default function AdminPartnerAccess({ toast }) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try { setData(await partnerAccounts()); setErr(""); } catch (e) { setErr(e.message); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const copy = async (txt, msg) => { try { await navigator.clipboard.writeText(txt); toast && toast(msg || "Kopiert ✓"); } catch (e) { toast && toast("Kopieren nicht möglich"); } };
  const setPw = async (a, generate) => {
    const pw = generate ? "" : window.prompt(`Neues Passwort für ${a.email} (mind. 8 Zeichen)`, "");
    if (!generate && pw == null) return;
    if (generate && !window.confirm(`Neues Passwort für ${a.email} erzeugen? Das alte gilt dann nicht mehr.`)) return;
    setBusy(true);
    try { const r = await partnerAccountSet({ email: a.email, password: pw || "" }); setShow(true); toast && toast("Passwort gesetzt ✓"); await load(); copy(r.password, "Passwort gesetzt und kopiert ✓"); }
    catch (e) { toast && toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const setMail = async (a) => {
    const email = window.prompt("Neue Login-E-Mail des Partners", a ? a.email : "");
    if (!email) return;
    setBusy(true);
    try { await partnerAccountSet({ email, oldEmail: a ? a.email : "", password: a && a.password ? a.password : "" }); toast && toast("E-Mail gespeichert ✓"); await load(); }
    catch (e) { toast && toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const openTest = async () => {
    const w = window.open("about:blank", "_blank"); // sofort öffnen (sonst blockt iOS das Fenster)
    try { const r = await partnerTestLink(); if (w) w.location.href = r.url; else window.location.href = r.url; }
    catch (e) { if (w) w.close(); toast && toast("Fehler: " + e.message); }
  };
  const openAsPartner = async () => {
    try { const r = await partnerLink(false); window.open(r.url, "_blank", "noopener"); } catch (e) { toast && toast("Fehler: " + e.message); }
  };

  const accs = (data && data.accounts) || [];
  return (
    <div className="pb-panel">
      <div className="pb-row">
        <b>Partner-Zugang</b>
        <span className="muted">Login unter rapid-remove.com/partner{data ? ` · ${data.pushDevices || 0} Gerät(e) mit Push` : ""}</span>
        <button className="btn btn-sec btn-sm" style={{ marginLeft: "auto" }} onClick={openAsPartner}>Als Partner öffnen</button>
        <button className="btn btn-sec btn-sm" onClick={openTest} title="Nur Testaufträge (Bestell-E-Mail mit +test). Der Partner sieht davon nichts.">Test-Board</button>
      </div>
      <p className="muted pb-hint" style={{ margin: "0 0 6px" }}>Testen: Bestellung mit „+test“ in der E-Mail aufgeben (z. B. name+test@domain.com) → landet nur im Test-Board, nicht beim Partner, zählt nicht in Earnings.</p>
      {err ? <div className="pb-err">{err}</div> : null}
      {!data ? <p className="muted">Lädt …</p> : !accs.length ? (
        <div className="pb-row"><span className="muted">Noch kein Login angelegt.</span><button className="btn btn-pri btn-sm" disabled={busy} onClick={() => setMail(null)}>Login anlegen</button></div>
      ) : accs.map((a) => (
        <div key={a.email} className="pb-row" style={{ flexWrap: "wrap", gap: 8 }}>
          <span>E-Mail <b>{a.email}</b>{a.test ? <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 800, color: "#fff", background: "#ff8000", borderRadius: 999, padding: "1px 7px" }}>TEST-ZUGANG · nur Testaufträge</span> : null}</span>
          <button className="btn btn-sec btn-sm" onClick={() => copy(a.email, "E-Mail kopiert ✓")}>kopieren</button>
          <span style={{ marginLeft: 8 }}>Passwort <b style={{ fontFamily: "ui-monospace,monospace" }}>{a.password ? (show ? a.password : "••••••••••••") : "—"}</b></span>
          {a.password ? <button className="btn btn-sec btn-sm" onClick={() => setShow(!show)}>{show ? "verbergen" : "anzeigen"}</button> : null}
          {a.password ? <button className="btn btn-sec btn-sm" onClick={() => copy(a.password, "Passwort kopiert ✓")}>kopieren</button> : null}
          <button className="btn btn-sec btn-sm" disabled={busy} onClick={() => setPw(a, true)}>Neues Passwort erzeugen</button>
          <button className="btn btn-sec btn-sm" disabled={busy} onClick={() => setPw(a, false)}>Passwort festlegen</button>
          <button className="btn btn-sec btn-sm" disabled={busy} onClick={() => setMail(a)}>E-Mail ändern</button>
          <span className="muted" style={{ width: "100%" }}>{a.lastLogin ? `Zuletzt eingeloggt: ${new Date(a.lastLogin).toLocaleString("de-AT")}` : "Noch nie eingeloggt"}{!a.password ? " · Passwort wird nach dem nächsten Login des Partners hier sichtbar (oder „Neues Passwort erzeugen“)" : ""}</span>
        </div>
      ))}
    </div>
  );
}
