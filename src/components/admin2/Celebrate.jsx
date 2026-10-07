"use client";
/* Neues Admin — „Bezahlt"-Feier: Schockwelle, Haken, Konfetti-Burst, hochzählender Betrag, leiser Kassen-Ton + Vibration.
   Läuft ~2,4 s, Tippen beendet sofort. Danach schließt das Admin den Auftrag und lässt die Zeile aus der Liste gleiten.
   prefers-reduced-motion → nur kurzer Fade, kein Konfetti, kein Ton. */
import React from "react";
import { money } from "./model";

const COLORS = ["#ff8000", "#ffb347", "#16a34a", "#4ade80", "#ffd23f", "#ffffff", "#1c4f9c"];
const DURATION = 2400;

function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const t0 = ac.currentTime;
    // „Ka-tsching": zwei helle Töne, kurz und leise.
    [[1318.5, 0], [1975.5, 0.09]].forEach(([f, d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(0.12, t0 + d + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.45);
      o.connect(g).connect(ac.destination); o.start(t0 + d); o.stop(t0 + d + 0.5);
    });
    setTimeout(() => ac.close().catch(() => {}), 900);
  } catch (e) { /* kein Audio – egal */ }
}

function burst(canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = (canvas.width = window.innerWidth * dpr), H = (canvas.height = window.innerHeight * dpr);
  const cx = W / 2, cy = H * 0.42;
  const parts = Array.from({ length: 150 }, (_, i) => {
    const a = Math.random() * Math.PI * 2, v = (6 + Math.random() * 12) * dpr;
    return {
      x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 7 * dpr,
      w: (5 + Math.random() * 6) * dpr, h: (8 + Math.random() * 10) * dpr,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[i % COLORS.length], circle: Math.random() < 0.25, life: 1,
    };
  });
  let raf = 0, last = performance.now();
  const tick = (now) => {
    const dt = Math.min(2, (now - last) / 16.7); last = now;
    ctx.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of parts) {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.38 * dpr * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      p.life -= 0.007 * dt;
      if (p.life <= 0 || p.y > H + 40) continue;
      alive++;
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
      if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 2);
      ctx.restore();
    }
    if (alive) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** data: { k, amt, c ("$"|"€"), name, n } · onDone: wird genau einmal aufgerufen. */
export default function PaidCelebration({ data, onDone }) {
  const cv = React.useRef(null);
  const doneRef = React.useRef(false);
  const [shown, setShown] = React.useState(0);
  const [leaving, setLeaving] = React.useState(false);
  const finish = React.useCallback(() => {
    if (doneRef.current) return; doneRef.current = true;
    setLeaving(true); setTimeout(onDone, 260);
  }, [onDone]);

  React.useEffect(() => {
    if (!data) return undefined;
    doneRef.current = false; setLeaving(false); setShown(0);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop = () => {};
    if (!reduce) {
      chime();
      try { navigator.vibrate && navigator.vibrate([25, 40, 70]); } catch (e) { /* */ }
      if (cv.current) stop = burst(cv.current);
    }
    // Betrag hochzählen (ease-out)
    const target = Number(data.amt) || 0, t0 = performance.now(), dur = reduce ? 1 : 900;
    let raf = 0;
    const step = (now) => { const p = Math.min(1, (now - t0) / dur); setShown(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    const t = setTimeout(finish, reduce ? 1200 : DURATION);
    return () => { stop(); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [data, finish]);

  if (!data) return null;
  const target = Number(data.amt) || 0;
  const amtStr = money(shown >= target ? target : Math.floor(shown), data.c); // beim Hochzählen ganze Beträge, am Ende exakt
  return (
    <div className={"paidcel" + (leaving ? " out" : "")} onClick={finish} role="status" aria-live="polite">
      <canvas ref={cv} className="pc-cv" />
      <div className="pc-box">
        <div className="pc-halo"><i /><i /><i />
          <svg viewBox="0 0 52 52" className="pc-check" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27.5l7.2 7.2L37.5 19" /></svg>
        </div>
        <div className="pc-amt">+{amtStr}</div>
        <div className="pc-l">Bezahlt</div>
        <div className="pc-s">{data.name}{data.n > 1 ? ` · ${data.n} Aufträge` : ""} · raus aus „Zahlung offen"</div>
      </div>
    </div>
  );
}
