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

/* Erfolgs-Ton (Web Audio, kein Asset): „Whoosh" beim Reinfliegen der Karte, dann Glocken-Arpeggio beim Landen.
   Browser spielen Ton nur nach einer Berührung: klappt es nicht sofort (Rückkehr aus Stripe = neue Seite),
   spielt er beim ersten Tippen. */
function chime() {
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return () => {};
  let ctx; try { ctx = new AC(); } catch (e) { return () => {}; }
  let played = false;
  const play = () => {
    if (played || ctx.state !== "running") return;
    played = true;
    const t0 = ctx.currentTime + 0.03;
    const out = ctx.createGain(); out.gain.value = 0.28; out.connect(ctx.destination);
    // Whoosh: gefiltertes Rauschen, Frequenz steigt
    const len = 0.5, buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(3200, t0 + len);
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, t0); ng.gain.exponentialRampToValueAtTime(0.35, t0 + 0.18); ng.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    ns.connect(bp); bp.connect(ng); ng.connect(out); ns.start(t0);
    // Landung: weicher „Thump"
    const th = ctx.createOscillator(), tg = ctx.createGain(); th.type = "sine";
    th.frequency.setValueAtTime(180, t0 + 0.48); th.frequency.exponentialRampToValueAtTime(60, t0 + 0.7);
    tg.gain.setValueAtTime(0.0001, t0 + 0.48); tg.gain.exponentialRampToValueAtTime(0.6, t0 + 0.5); tg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.75);
    th.connect(tg); tg.connect(out); th.start(t0 + 0.47); th.stop(t0 + 0.8);
    // Glocken-Arpeggio C6 E6 G6 C7 (+ Oberton), letzter Ton klingt lange
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => {
      const t = t0 + 0.62 + i * 0.085, last = i === 3;
      [[f, "sine", last ? 0.5 : 0.38], [f * 2, "triangle", 0.07], [f * 3.01, "sine", 0.04]].forEach(([fr, type, v]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = fr;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + (last ? 1.6 : 0.45));
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.7);
      });
    });
    // Glitzer: zufällige hohe Pings
    for (let i = 0; i < 7; i++) {
      const t = t0 + 1.0 + i * 0.06 + Math.random() * 0.05, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 3000 + Math.random() * 2500;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2);
    }
    setTimeout(() => { try { ctx.close(); } catch (e) { /* */ } }, 3200);
  };
  const tryPlay = () => { (ctx.state === "running" ? Promise.resolve() : ctx.resume()).then(play).catch(() => {}); };
  tryPlay();
  const onTap = () => { tryPlay(); off(); };
  const off = () => { window.removeEventListener("pointerdown", onTap, true); window.removeEventListener("keydown", onTap, true); };
  window.addEventListener("pointerdown", onTap, true); window.addEventListener("keydown", onTap, true);
  return () => { off(); if (!played) { try { ctx.close(); } catch (e) { /* */ } } };
}

/* Zahlungsart gespeichert: Karte fliegt rein, Glanz, Häkchen-Badge, Konfetti. */
function CardArt({ label, bits }) {
  return (
    <div className="ce-card-wrap" aria-hidden="true">
      <span className="ce-glow" />
      <div className="ce-conf">
        {bits.map((b, i) => (
          <i key={i} style={{ "--x": Math.round(b.x * 1.5) + "px", "--y": Math.round(b.y * 1.4) + "px", "--r": b.r + "deg", "--dl": b.dl + "ms", background: b.c, width: b.w, height: b.round ? b.w : b.h, borderRadius: b.round ? "50%" : 2 }} />
        ))}
      </div>
      <div className="ce-card">
        <span className="cc-shine" />
        <div className="cc-top"><span className="cc-chip"><i /><i /><i /></span><span className="cc-nfc"><i /><i /><i /></span></div>
        <div className="cc-num">{label || "•••• •••• •••• ••••"}</div>
        <div className="cc-bot"><span className="cc-brand">RapidRemove</span><span className="cc-auto">AUTO-PAY</span></div>
        <span className="cc-badge"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" /><path d="M12 20.5 L17.5 26 L28 14.5" /></svg></span>
      </div>
      <span className="ce-ring r1" /><span className="ce-ring r2" />
    </div>
  );
}

export default function Celebrate({ data, onClose, T }) {
  const open = !!data;
  const bits = useConfetti(open ? data.id : 0);
  React.useEffect(() => {
    if (!open) return undefined;
    try { if (navigator.vibrate) navigator.vibrate(data.kind === "card" ? [10, 460, 30, 60, 20, 60, 40] : [18, 40, 28]); } catch (e) { /* */ }
    const stopSound = data.kind === "card" ? chime() : null;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); if (stopSound) setTimeout(stopSound, 4000); };
  }, [open, onClose]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  return (
    <div className={"cele k-" + data.kind} role="dialog" aria-live="polite" aria-label={data.title} onClick={onClose}>
      <div className="ce-box" onClick={(e) => e.stopPropagation()}>
        {data.kind === "card" ? <CardArt label={data.label} bits={bits} /> : (
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
        )}
        <h3 className="ce-t">{data.title}</h3>
        {data.sub ? <p className="ce-s">{data.sub}</p> : null}
        {data.items && data.items.length ? (
          <div className="ce-items">
            {data.items.slice(0, 4).map((x, i) => <span key={i} style={{ "--i": i }}>{x}</span>)}
            {data.items.length > 4 ? <span style={{ "--i": 4 }}>+{data.items.length - 4}</span> : null}
          </div>
        ) : null}
        <button type="button" className="ce-btn" onClick={onClose}>{data.kind === "card" ? T("ceGo") : T("cOk")}</button>
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
