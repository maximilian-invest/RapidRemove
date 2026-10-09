"use client";
/* „Removed" → zuerst: Mit welchem Grund wurde gemeldet? (Pflicht, je Bewertung)
   Oben steht der Grund des Kunden (Richtlinien-Verstoß, im Dashboard angegeben) – vorausgewählt.
   Danach startet die Prüfung (RemovalCheck). Nachweis je Bewertung im Admin. */
import React from "react";
import { X, ShieldCheck, Check, ArrowRight } from "lucide-react";

export const FALLBACK_REASONS = [
  { id: "fake", label: "Fake engagement – not a real customer" },
  { id: "conflict", label: "Conflict of interest – competitor or (ex-)employee" },
  { id: "false", label: "False or misleading claims" },
  { id: "insult", label: "Harassment / insults" },
  { id: "offtopic", label: "Off-topic – not about the business" },
  { id: "hate", label: "Hate speech / discrimination" },
  { id: "personal", label: "Personal information of others" },
  { id: "offensive", label: "Offensive or illegal content" },
  { id: "impersonation", label: "Impersonation" },
  { id: "legal", label: "Legal removal request (e.g. defamation)" },
  { id: "other", label: "Other (describe)" },
];
export const reasonLabel = (list, id) => ((list || FALLBACK_REASONS).find((r) => r.id === id) || {}).label || id || "";

/** Grund des Kunden als Hinweis-Box (Bewertungs-Detail). */
export function CustReason({ t, list }) {
  if (!t || !t.custReason) return null;
  return (
    <div className="rp-cust"><ShieldCheck /><span><b>Customer’s reason (Google policy)</b>{reasonLabel(list, t.custReason)}{t.custNote ? <i>“{t.custNote}”</i> : null}{t.reportReason ? <em>You reported: {reasonLabel(list, t.reportReason)}</em> : null}</span></div>
  );
}

export default function ReasonPick({ state, tasks, list, onCancel, onGo }) {
  const L = list && list.length ? list : FALLBACK_REASONS;
  const ts = React.useMemo(() => (state ? state.ids.map((id) => (tasks || []).find((x) => x.id === id)).filter(Boolean) : []), [state, tasks]);
  const [sel, setSel] = React.useState({}); // id → { r, note }
  React.useEffect(() => {
    if (!state) return;
    setSel(Object.fromEntries(ts.map((t) => [t.id, { r: t.reportReason || t.custReason || "", note: t.reportNote || "" }])));
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!state) return null;
  const ok = ts.length && ts.every((t) => { const v = sel[t.id]; return v && v.r && (v.r !== "other" || (v.note || "").trim().length >= 3); });
  const one = ts.length === 1;
  const set = (id, patch) => setSel((m) => ({ ...m, [id]: { ...(m[id] || { r: "", note: "" }), ...patch } }));
  const order = (t) => (t.custReason ? [L.find((r) => r.id === t.custReason), ...L.filter((r) => r.id !== t.custReason)].filter(Boolean) : L);
  return (
    <div className="rck-bg" onClick={onCancel}>
      <div className="rck rp" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="rck-x" onClick={onCancel} aria-label="Close"><X /></button>
        <h3>How did you report {one ? "it" : "them"}?</h3>
        <p>Choose the Google policy reason you used. This is saved as proof for every removal.</p>
        <div className="rp-list">
          {ts.map((t) => {
            const v = sel[t.id] || { r: "", note: "" };
            return (
              <div key={t.id} className="rp-item">
                {!one ? <div className="rp-h"><b>{t.code}</b><span>{t.who}{t.cust ? " · " + t.cust : ""}</span></div> : null}
                {t.custReason ? <div className="rp-cust sm"><ShieldCheck /><span><b>Customer’s reason</b>{reasonLabel(L, t.custReason)}{t.custNote ? <i>“{t.custNote}”</i> : null}</span></div> : null}
                {one ? (
                  <div className="rp-opts">
                    {order(t).map((r) => (
                      <button key={r.id} type="button" className={"rp-o" + (v.r === r.id ? " on" : "")} onClick={() => set(t.id, { r: r.id })}>
                        <span className="rd">{v.r === r.id ? <Check /> : null}</span><span>{r.label}{r.id === t.custReason ? <small>Customer’s reason</small> : null}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <select className="rp-sel" value={v.r} onChange={(e) => set(t.id, { r: e.target.value })}>
                    <option value="">Choose the reason …</option>
                    {order(t).map((r) => <option key={r.id} value={r.id}>{r.label}{r.id === t.custReason ? " (customer’s reason)" : ""}</option>)}
                  </select>
                )}
                {v.r === "other" ? <input className="rp-note" placeholder="Describe the reason you reported" value={v.note} maxLength={300} onChange={(e) => set(t.id, { note: e.target.value })} /> : null}
              </div>
            );
          })}
        </div>
        <div className="rck-acts">
          <button type="button" className="rck-btn gh" onClick={onCancel}>Cancel</button>
          <button type="button" className="rck-btn" disabled={!ok} style={!ok ? { opacity: 0.4 } : null} onClick={() => onGo(state.ids, sel)}>Check removal<ArrowRight /></button>
        </div>
      </div>
    </div>
  );
}
