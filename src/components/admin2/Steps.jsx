"use client";
/* Schritt-für-Schritt-Abläufe im Admin (16.10.2026) – gleiche Optik wie „Neuer Auftrag":
   oben Zurück + „Schritt X von Y" + Fortschrittsbalken, eine Frage pro Seite, unten ein großer Button.
   Ohne n (z. B. beim Bearbeiten eines einzelnen Punkts) gibt es keinen Fortschritt, nur Zurück + Speichern. */
import React from "react";
import { ArrowLeft, ArrowRight, X, Check, Loader } from "lucide-react";

/** Blendet die Tab-Leiste (mobil) aus, solange ein Ablauf offen ist – wie bei „Neuer Auftrag". */
export function useFlowMode(ctx) {
  const set = ctx && ctx.setMoreFlow;
  React.useEffect(() => {
    if (!set) return undefined;
    set(true);
    return () => set(false);
  }, [set]);
}

export function StepPage({ i = 0, n = 0, onBack, title, sub, children, next, nextLabel, ok = true, busy = false, final = false, closeIcon }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    // Neue Seite → nach oben scrollen (der Scroll-Container ist der Bereich um den Ablauf)
    let el = ref.current && ref.current.parentElement;
    while (el && el.scrollHeight <= el.clientHeight) el = el.parentElement;
    if (el) el.scrollTop = 0;
  }, [title]);
  return (
    <div className="naflow aw" ref={ref}>
      <div className="anav">
        <button type="button" className="circ keep" aria-label={closeIcon ? "Schließen" : "Zurück"} onClick={onBack}>{closeIcon ? <X /> : <ArrowLeft />}</button>
        {n ? <span className="nastep">Schritt {i + 1} von {n}</span> : <span />}
        <span style={{ width: 39 }} />
      </div>
      {n ? <div className="naprog" style={{ gridTemplateColumns: `repeat(${n},1fr)` }}>{Array.from({ length: n }, (_, k) => <i key={k} className={k <= i ? "on" : ""} />)}</div> : <div style={{ height: 8 }} />}
      <div className="nah"><h1>{title}</h1></div>
      {sub ? <p className="nasub">{sub}</p> : null}
      <div className="aw-b" key={title}>{children}</div>
      {next ? (
        <div className="nastick">
          <button type="button" className={"cta" + (final ? " or" : "")} disabled={!ok || busy} onClick={next}>
            {busy ? <Loader className="spin" /> : final ? <Check /> : null}
            {nextLabel || "Weiter"}
            {!busy && !final && !nextLabel ? <ArrowRight /> : null}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Auswahl-Karte (eine Option = eine Karte). multi = Häkchen-Kästchen statt Kreis. */
export function Choice({ on, onClick, title, sub, icon, disabled, multi, children }) {
  return (
    <button type="button" className={"awc" + (on ? " on" : "") + (multi ? " sq" : "")} onClick={onClick} disabled={disabled} aria-pressed={!!on}>
      {icon ? <span className="ic">{icon}</span> : null}
      <span className="t"><b>{title}</b>{sub ? <span>{sub}</span> : null}{children}</span>
      <span className="rd"><Check /></span>
    </button>
  );
}

/** Zusammenfassung: Zeile antippen → zu diesem Schritt springen. */
export function SumRow({ label, value, onClick }) {
  return (
    <button type="button" className="aws" onClick={onClick}>
      <span className="l">{label}</span>
      <span className="v">{value}</span>
      <span className="e">Ändern</span>
    </button>
  );
}
