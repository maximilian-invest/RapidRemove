"use client";
/* Auto-Scan einer Bestellung: alle offenen Bewertungen werden auf Google geprüft (Google-Link + Bewertungsliste).
   Nur doppelt bestätigte Löschungen werden als „Removed" markiert (→ Kunde wird belastet). Alles andere bleibt unverändert. */
import React from "react";
import { CheckCircle2, Eye, HelpCircle, Search, ArrowUpRight, X } from "lucide-react";

export default function OrderScan({ state, onClose, onOpen }) {
  if (!state) return null;
  const res = state.results || [];
  const gone = res.filter((r) => r.result === "gone");
  const vis = res.filter((r) => r.result === "visible");
  const unk = res.filter((r) => r.result === "unknown");
  const skip = res.filter((r) => r.result === "skipped");
  const checking = state.phase === "checking";
  const pct = state.total ? Math.round((state.done / state.total) * 100) : 0;
  return (
    <div className="rck-bg" role="dialog" aria-live="polite">
      <div className="rck">
        {checking ? (
          <>
            <div className="rck-scan" aria-hidden="true">
              <div className="rck-card"><i /><i /><i /><b /></div>
              <span className="rck-lens"><Search /></span>
              <span className="rck-beam" />
            </div>
            <h3>Checking {state.cust}</h3>
            <p className="rck-step">{state.done} of {state.total} reviews checked</p>
            <div className="osc-bar"><span style={{ width: pct + "%" }} /></div>
            {gone.length ? <p className="rck-codes">{gone.length} removed so far</p> : null}
            <p className="rck-hint">Each review is checked twice on Google. Only reviews that are clearly gone are marked as removed. Please keep this screen open.</p>
          </>
        ) : (
          <>
            <button type="button" className="rck-x" onClick={onClose} aria-label="Close"><X /></button>
            <h3>Scan finished</h3>
            <p className="rck-step">{state.cust} · {state.total} review{state.total === 1 ? "" : "s"} checked</p>
            {gone.length ? <div className="rck-row ok"><CheckCircle2 /><span><b>{gone.length} removed</b> – {gone.map((r) => r.code).join(", ")}. Marked automatically.</span></div> : null}
            {vis.length ? (
              <div className="rck-item vis">
                <div className="rck-row"><Eye /><span><b>{vis.length} still online</b> – nothing changed.</span></div>
                {vis.map((r) => <button key={r.id} type="button" className="rck-open" onClick={() => onOpen && onOpen(r.id)}><ArrowUpRight />{r.code}</button>)}
              </div>
            ) : null}
            {unk.map((r) => (
              <div key={r.id} className="rck-item unk">
                <div className="rck-row"><HelpCircle /><span><b>{r.code}</b> – {r.reason}</span></div>
                <button type="button" className="rck-open" onClick={() => onOpen && onOpen(r.id)}><ArrowUpRight />Open review on Google</button>
              </div>
            ))}
            {skip.length ? <p className="rck-why">{skip.map((r) => `${r.code}: ${r.reason}`).join(" · ")}</p> : null}
            {!gone.length && !vis.length && !unk.length ? <p className="rck-why">Nothing to check.</p> : null}
            <div className="rck-acts"><button type="button" className="rck-btn" onClick={onClose}>Done</button></div>
          </>
        )}
      </div>
    </div>
  );
}
