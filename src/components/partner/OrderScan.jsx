"use client";
/* Auto-Scan einer Bestellung: alle offenen Bewertungen werden auf Google geprüft (Google-Link + Bewertungsliste).
   Nur doppelt bestätigte Löschungen werden als „Removed" markiert (→ Kunde wird belastet). Alles andere bleibt unverändert. */
import React from "react";
import { CheckCircle2, Eye, HelpCircle, Search, ArrowUpRight, ExternalLink, X } from "lucide-react";

/* Eine Bewertung in der Ergebnisliste: Code + Grund, Button „Open“ öffnet sie auf Google. */
function Row({ r, onOpen, reason }) {
  return (
    <div className="osc-row">
      <span className="osc-t"><b>{r.code}</b>{reason && r.reason ? <em>{r.reason}</em> : null}</span>
      <button type="button" className="osc-open" onClick={() => onOpen && onOpen(r.id)}><ArrowUpRight />Open</button>
    </div>
  );
}

export default function OrderScan({ state, onClose, onOpen, onOpenAll }) {
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
            {gone.length ? <p className="rck-codes">{gone.length} deleted so far</p> : null}
            <p className="rck-hint">Each review is checked twice on Google. Only reviews that are clearly gone are marked as removed. Please keep this screen open.</p>
          </>
        ) : (
          <>
            <button type="button" className="rck-x" onClick={onClose} aria-label="Close"><X /></button>
            <h3>Scan finished</h3>
            <p className="rck-step">{state.cust} · {state.total} review{state.total === 1 ? "" : "s"} checked</p>
            {gone.length ? (
              <div className="osc-sec ok">
                <div className="rck-row"><CheckCircle2 /><span><b>{gone.length} deleted</b> – marked as removed automatically</span></div>
                {gone.map((r) => <Row key={r.id} r={r} onOpen={onOpen} />)}
              </div>
            ) : null}
            {unk.length ? (
              <div className="osc-sec unk">
                <div className="rck-row"><HelpCircle /><span><b>{unk.length} unclear</b> – nothing changed, please check</span></div>
                {unk.map((r) => <Row key={r.id} r={r} onOpen={onOpen} reason />)}
              </div>
            ) : null}
            {vis.length ? <div className="rck-row osc-vis"><Eye /><span><b>{vis.length} still online</b> – nothing changed</span></div> : null}
            {skip.length ? <p className="rck-why">{skip.map((r) => `${r.code}: ${r.reason}`).join(" · ")}</p> : null}
            {!gone.length && !vis.length && !unk.length ? <p className="rck-why">Nothing to check.</p> : null}
            <div className="rck-acts">
              {gone.length + unk.length > 0 ? <button type="button" className="rck-btn gh" onClick={() => onOpenAll && onOpenAll([...gone, ...unk].map((r) => r.id))}><ExternalLink />Open all ({gone.length + unk.length})</button> : null}
              <button type="button" className="rck-btn" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
