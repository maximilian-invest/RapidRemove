"use client";
/* „Removed" mit Prüfung: Lena (KI) öffnet die Bewertung jetzt auf Google und vergleicht mit dem Screenshot von der Bestellung.
   Phasen: checking (Animation) → done (pro Bewertung: gone ✓ / still visible / couldn't verify → ausdrücklich bestätigen). */
import React from "react";
import { CheckCircle2, Eye, HelpCircle, RotateCw, X, Search, ShieldCheck } from "lucide-react";
import { OPS } from "./shared";

/* Aktueller Google-Screenshot der Prüfung (per POST geladen – Token nicht in der Adresse). */
function Shot({ id, token }) {
  const [src, setSrc] = React.useState("");
  React.useEffect(() => {
    let url = "", off = false;
    fetch(OPS + "/partner/removal-shot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, id }) })
      .then((r) => (r.ok ? r.blob() : null)).then((b) => { if (b && !off) { url = URL.createObjectURL(b); setSrc(url); } }).catch(() => {});
    return () => { off = true; if (url) URL.revokeObjectURL(url); };
  }, [id, token]);
  return src ? <a href={src} target="_blank" rel="noopener noreferrer"><img className="rck-shot" src={src} alt="Google right now" /></a> : <div className="rck-shot ph" />;
}

const STEPS = ["Opening the review on Google…", "Lena compares before & after…", "Checking reviewer and text…", "Almost done…"];

export default function RemovalCheck({ state, token, onClose, onAgain, onConfirm }) {
  const [step, setStep] = React.useState(0);
  const checking = state && state.phase === "checking";
  React.useEffect(() => {
    if (!checking) return undefined;
    setStep(0);
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4500);
    return () => clearInterval(iv);
  }, [checking, state && state.run]);
  const res = (state && state.results) || [];
  const gone = res.filter((r) => r.result === "gone");
  const vis = res.filter((r) => r.result === "visible");
  const unk = res.filter((r) => r.result === "unknown");
  const skip = res.filter((r) => r.result === "skipped");
  const allGone = state && state.phase === "done" && gone.length && !vis.length && !unk.length;
  React.useEffect(() => {
    if (!allGone) return undefined;
    try { if (navigator.vibrate) navigator.vibrate([12, 60, 24]); } catch (e) { /* */ }
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [allGone]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!state) return null;
  return (
    <div className="rck-bg" role="dialog" aria-live="polite">
      <div className={"rck" + (allGone ? " ok" : "")}>
        {checking ? (
          <>
            <div className="rck-scan" aria-hidden="true">
              <div className="rck-card"><i /><i /><i /><b /></div>
              <span className="rck-lens"><Search /></span>
              <span className="rck-beam" />
            </div>
            <h3>Lena is checking Google</h3>
            <p className="rck-step" key={step}>{STEPS[step]}</p>
            <p className="rck-codes">{state.codes.slice(0, 6).join(" · ")}{state.codes.length > 6 ? ` +${state.codes.length - 6}` : ""}</p>
            <p className="rck-hint">The customer is only charged if the review is really gone.</p>
          </>
        ) : allGone ? (
          <>
            <div className="rck-done" aria-hidden="true">
              <span className="r1" /><span className="r2" />
              <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" /><path d="M40 62 L54 76 L82 46" /></svg>
              {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ "--a": (i * 360) / 14 + "deg", "--d": 70 + (i % 3) * 18 + "px", "--dl": (i % 4) * 40 + "ms" }} />)}
            </div>
            <h3>Verified – removed ✓</h3>
            <p>{gone.length === 1 ? `${gone[0].code} is gone from Google.` : `${gone.length} reviews are gone from Google.`} The customer is charged automatically.</p>
            <button type="button" className="rck-btn" onClick={onClose}>Done</button>
          </>
        ) : (
          <>
            <button type="button" className="rck-x" onClick={onClose} aria-label="Close"><X /></button>
            <h3>{vis.length ? "Still visible on Google" : unk.length ? "Check not possible right now" : "Check finished"}</h3>
            {gone.length ? <div className="rck-row ok"><CheckCircle2 /><span><b>{gone.map((r) => r.code).join(", ")}</b> verified – removed</span></div> : null}
            {vis.map((r) => (
              <div key={r.id} className="rck-item vis">
                <div className="rck-row"><Eye /><span><b>{r.code}</b> is still online – not marked as removed.</span></div>
                {r.reason ? <p className="rck-why">{r.reason}</p> : null}
                {r.checkId ? <Shot id={r.checkId} token={token} /> : null}
              </div>
            ))}
            {unk.map((r) => (
              <div key={r.id} className="rck-item unk">
                <div className="rck-row"><HelpCircle /><span><b>{r.code}</b> – {r.reason || "the check was not conclusive."}</span></div>
                <p className="rck-why">Nothing was changed and the customer is not charged. Please try again in a few minutes – RapidRemove has been notified.</p>
              </div>
            ))}
            {skip.length ? <p className="rck-why">{skip.map((r) => `${r.code}: ${r.reason}`).join(" · ")}</p> : null}
            <div className="rck-acts">
              {vis.length || unk.length ? <button type="button" className="rck-btn gh" onClick={() => onAgain([...vis, ...unk].map((r) => r.id))}><RotateCw />Check again</button> : null}
              <button type="button" className="rck-btn" onClick={onClose}>Close</button>
            </div>
            {vis.length ? <p className="rck-hint">Google sometimes needs a few minutes – check again later.</p> : null}
          </>
        )}
      </div>
    </div>
  );
}
