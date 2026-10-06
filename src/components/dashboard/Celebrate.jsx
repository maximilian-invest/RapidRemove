"use client";
/* Erfolgs-Moment (wie „Order Confirmed" in Shop-Apps): Bewertung/Profil gelöscht oder Zahlung eingegangen.
   Vollbild, Häkchen wird gezeichnet, Ringe + Konfetti, Text kommt gestaffelt. Schließt per Button oder Tipp. */
import React from "react";

const COLORS = ["#16a34a", "#22c55e", "#111111", "#f59e0b", "#3b82f6", "#ef4444", "#a3e635"];

function useConfetti(open) {
  return React.useMemo(() => {
    if (!open) return [];
    return Array.from({ length: 34 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 34 + (Math.random() - 0.5) * 0.4;
      const d = 120 + Math.random() * 120;
      return {
        x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d * 0.85 - 30),
        r: Math.round((Math.random() - 0.5) * 540), c: COLORS[i % COLORS.length],
        w: 6 + Math.round(Math.random() * 5), h: 9 + Math.round(Math.random() * 7),
        dl: Math.round(Math.random() * 120), round: Math.random() < 0.3,
      };
    });
  }, [open]);
}

export default function Celebrate({ data, onClose, T }) {
  const open = !!data;
  const bits = useConfetti(open ? data.id : 0);
  React.useEffect(() => {
    if (!open) return undefined;
    try { if (navigator.vibrate) navigator.vibrate([18, 40, 28]); } catch (e) { /* */ }
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={"cele k-" + data.kind} role="dialog" aria-live="polite" aria-label={data.title} onClick={onClose}>
      <div className="ce-box" onClick={(e) => e.stopPropagation()}>
        <div className="ce-art" aria-hidden="true">
          <span className="ce-ring r1" /><span className="ce-ring r2" /><span className="ce-ring r3" />
          <div className="ce-conf">
            {bits.map((b, i) => (
              <i key={i} style={{ "--x": b.x + "px", "--y": b.y + "px", "--r": b.r + "deg", "--dl": b.dl + "ms", background: b.c, width: b.w, height: b.round ? b.w : b.h, borderRadius: b.round ? "50%" : 2 }} />
            ))}
          </div>
          <svg className="ce-check" viewBox="0 0 120 120">
            <circle className="ce-c" cx="60" cy="60" r="46" pathLength="100" />
            <path className="ce-p" d="M40 62 L54 76 L82 46" pathLength="100" />
          </svg>
        </div>
        <h3 className="ce-t">{data.title}</h3>
        {data.sub ? <p className="ce-s">{data.sub}</p> : null}
        {data.items && data.items.length ? (
          <div className="ce-items">
            {data.items.slice(0, 4).map((x, i) => <span key={i} style={{ "--i": i }}>{x}</span>)}
            {data.items.length > 4 ? <span style={{ "--i": 4 }}>+{data.items.length - 4}</span> : null}
          </div>
        ) : null}
        <button type="button" className="ce-btn" onClick={onClose}>{T("cOk")}</button>
      </div>
    </div>
  );
}

/* Betrag zählt beim ersten Anzeigen / bei Änderung hoch (merkt sich den letzten Wert über Re-Mounts hinweg). */
const shown = new Map();
export function CountUp({ id, value, fmt }) {
  const from = shown.has(id) ? shown.get(id) : Math.round(value * 0.6);
  const [v, setV] = React.useState(from);
  React.useEffect(() => {
    if (from === value) { setV(value); return undefined; }
    let raf; const t0 = performance.now();
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setV(value); shown.set(id, value); return undefined; }
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 900); const e = 1 - Math.pow(1 - k, 3);
      const cur = Math.round(from + (value - from) * e);
      setV(cur);
      if (k < 1) raf = requestAnimationFrame(tick); else shown.set(id, value);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); shown.set(id, value); };
  }, [id, value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <>{fmt(v)}</>;
}
