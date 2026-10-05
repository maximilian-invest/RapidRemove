"use client";
/* Admin → Partner: Einmal-Nachtrag der bereits bezahlten 60 USD an Reputation Vault
   (6 Löschungen à 10 USD laut WhatsApp-Chat, vor dem Partner-Board). Vorschau gleicht
   die Chat-Links mit Board + Aufträgen ab; „Eintragen" legt fehlende Aufgaben als
   gelöscht an und bucht eine Auszahlung → Partner: Orders „Completed", Earnings „Paid out". */
import React from "react";
import { partnerBackfill } from "@/lib/admin-api";

const usd = (v) => "$" + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function AdminPartnerBackfill({ onDone, toast }) {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState(null);
  const [sel, setSel] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [hidden, setHidden] = React.useState(false);

  const preview = async () => {
    setOpen(true); setBusy(true); setErr("");
    try {
      const r = await partnerBackfill(false);
      setData(r);
      setSel(Object.fromEntries(r.items.map((i) => [i.ref, i.preselected && !(i.task && i.task.paid)])));
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const refs = Object.keys(sel).filter((k) => sel[k]);
  const sum = data ? data.items.filter((i) => sel[i.ref]).reduce((s, i) => s + (i.task && i.task.price > 0 ? i.task.price : 10), 0) : 0;
  const apply = async () => {
    if (!refs.length || busy) return;
    if (!window.confirm(`${refs.length} Löschungen als bezahlt eintragen (${usd(sum)})?`)) return;
    setBusy(true); setErr("");
    try {
      const r = await partnerBackfill(true, refs);
      toast && toast(`Eingetragen: ${r.tasks} Löschungen · Auszahlung ${usd(r.amount)}`);
      setHidden(true); onDone && onDone();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (hidden || (data && data.done)) {
    return data && data.done ? <p className="muted pb-hint">Nachtrag 60 USD (WhatsApp) bereits eingetragen.</p> : null;
  }
  return (
    <div className="pb-panel">
      <div className="pb-row">
        <b>Nachtrag: bereits bezahlte 60 USD (WhatsApp, vor dem Board)</b>
        {!open ? <button className="btn btn-sec btn-sm" onClick={preview}>Mit Chat + Aufträgen abgleichen</button> : null}
      </div>
      {open && busy && !data ? <p className="muted">Gleiche ab (Kurzlinks werden aufgelöst) …</p> : null}
      {err ? <div className="pb-err">{err}</div> : null}
      {data ? (
        <>
          <div className="pb-table">
            {data.items.map((i) => (
              <label key={i.ref} className="pb-task" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0" }}>
                <input type="checkbox" checked={!!sel[i.ref]} disabled={!!(i.task && i.task.paid)} onChange={() => setSel((m) => ({ ...m, [i.ref]: !m[i.ref] }))} />
                <span style={{ minWidth: 0 }}>
                  <b>{i.removedAt.slice(8, 10)}.{i.removedAt.slice(5, 7)}.</b> · {i.why}
                  <br />
                  <span className="muted">
                    {i.task ? `Board: ${i.task.code} (${i.task.status}${i.task.paid ? ", schon bezahlt" : ""}) · ` : "nicht auf dem Board → wird angelegt · "}
                    {i.order ? `Auftrag ${i.order.id} · ${i.order.business}` : "kein Auftrag gefunden"}
                    {" · "}<a href={i.url} target="_blank" rel="noopener noreferrer">Bewertung öffnen</a>
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="pb-row">
            <span className={sum === 60 ? "" : "pb-err"}>{refs.length} gewählt · {usd(sum)}{sum === 60 ? " ✓ passt zu den bezahlten 60 USD" : " – bezahlt wurden 60 USD"}</span>
            <button className="btn btn-pri btn-sm" style={{ marginLeft: "auto" }} disabled={busy || !refs.length} onClick={apply}>Als gelöscht + bezahlt eintragen · {usd(sum)}</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
