"use client";
/* Admin → Kunden: einmalige Einladung ins Dashboard an alle Bewertungs-Kunden.
   Erst Empfänger ansehen, dann senden. Jede Adresse bekommt die Mail nur einmal. */
import React from "react";
import { custInvite } from "@/lib/admin-api";

export function AdminCustInvite({ toast }) {
  const [data, setData] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const load = React.useCallback(() => { custInvite(false).then(setData).catch((e) => toast("Fehler: " + e.message)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { load(); }, [load]);
  const list = (data && data.pending) || [];
  const send = async () => {
    if (busy || !list.length) return;
    if (!window.confirm(`Einladung an ${list.length} Kunden senden?`)) return;
    setBusy(true);
    try {
      const r = await custInvite(true);
      toast(`${r.sent} Einladungen gesendet ✓${r.failed.length ? ` · ${r.failed.length} fehlgeschlagen` : ""}`);
      if (r.failed.length) console.warn("Einladung fehlgeschlagen", r.failed);
    } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
    load();
  };
  return (
    <div className="pb-panel" id="cust-invite" style={{ marginBottom: 14 }}>
      <div className="pb-row" style={{ flexWrap: "wrap", gap: 8 }}>
        <b>Dashboard-Einladung</b>
        <span className="muted">{!data ? "Lädt …" : `${list.length} offen · ${data.alreadySent} schon eingeladen`}</span>
        {list.length ? <button className="btn btn-sec btn-sm" onClick={() => setOpen(!open)}>{open ? "Liste schließen" : "Empfänger ansehen"}</button> : null}
        <button className="btn btn-pri btn-sm" style={{ marginLeft: "auto" }} disabled={busy || !list.length} onClick={send}>{busy ? "Sendet…" : `An ${list.length} senden`}</button>
      </div>
      {open && list.length ? (
        <div style={{ fontSize: 12.5, maxHeight: 260, overflow: "auto", marginTop: 6 }}>
          {list.map((c) => <div key={c.email} style={{ padding: "4px 0", borderBottom: "1px solid var(--hairline)" }}><b>{c.business || c.name || "—"}</b> · {c.email} · {c.lang.toUpperCase()}</div>)}
        </div>
      ) : null}
    </div>
  );
}
