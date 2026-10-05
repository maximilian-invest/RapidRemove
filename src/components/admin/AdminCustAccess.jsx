"use client";
/* Admin → Kunden: Dashboard-Zugänge für alle offenen Einzelbewertungs-Aufträge anlegen.
   Es geht KEINE Mail raus — die Zugangsdaten werden nur hier angezeigt (einmalig, Passwort
   wird nur gehasht gespeichert). */
import React from "react";
import { createOpenCustAccounts } from "@/lib/admin-api";

export function AdminCustAccess({ toast }) {
  const [res, setRes] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const run = async () => {
    if (busy) return;
    setBusy(true);
    try { const r = await createOpenCustAccounts(); setRes(r); toast(`${r.accounts.filter((a) => a.password).length} Zugänge angelegt`); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const text = res ? res.accounts.map((a) => `${a.business || a.name} (${a.orders.join(", ")})\nLogin: ${a.email}\nPasswort: ${a.password || "— bestand schon (Passwort wurde per Mail geschickt)"}`).join("\n\n") : "";
  return (
    <div className="pb-panel" id="cust-access" style={{ marginBottom: 14 }}>
      <div className="pb-row">
        <b>Kunden-Dashboard (Einzelbewertungen)</b>
        <button className="btn btn-pri btn-sm" id="cust-access-run" disabled={busy} onClick={run}>{busy ? "Legt an…" : "Zugänge für alle offenen Aufträge anlegen (ohne Mail)"}</button>
        {res ? <button className="btn btn-sec btn-sm" onClick={() => navigator.clipboard.writeText(text).then(() => toast("Kopiert ✓"))}>Alle kopieren</button> : null}
      </div>
      <p className="muted pb-hint">Login-Seite: {res ? res.url : "rapid-remove.com/my-reviews"}. Passwörter werden nur jetzt angezeigt (gespeichert wird nur ein Hash).</p>
      {res ? <pre id="cust-access-out" style={{ whiteSpace: "pre-wrap", fontSize: 12.5, background: "#faf8f4", borderRadius: 10, padding: 10, margin: 0 }}>{text || "Keine offenen Aufträge."}{res.unmatched && res.unmatched.length ? `\n\nOhne zuordenbaren Auftrag (keine E-Mail bekannt): ${res.unmatched.join(", ")}` : ""}</pre> : null}
    </div>
  );
}
