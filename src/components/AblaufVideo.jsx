"use client";
/* RapidRemove — „So funktioniert's"-Ablauf als selbstlaufende React-Animation (63 s, 7 Schritte).
   Portiert aus dem Design-Handoff video/RapidRemove Ablauf.html (Stage/Sprite-Framework +
   Szenen 1–7 mit Intro/Outro). Ersetzt das frühere YouTube-Embed in der „Im Video"-Sektion.
   Anpassungen fürs Produkt: skaliert in den 16:9-Rahmen der Sektion statt Fullscreen,
   spielt nur im Viewport (IntersectionObserver), respektiert prefers-reduced-motion,
   Outro-CTA startet den Gratis-Check. */
import React from "react";
import { asset } from "@/lib/base";

/* ── Design-Konstanten (aus ablauf-parts.jsx; Fonts auf die Site-Fonts gemappt) ── */
const ORANGE = "#ff8000", ORANGE6 = "#e67000", INK = "#1a1512";
const GREEN = "#16a34a", GREEN7 = "#15803d", RED = "#e23b3b", AMBER = "#d97706";
const N50 = "#faf8f6", N100 = "#f4f0ec", N200 = "#e9e3dd", N300 = "#d6cec6";
const N500 = "#8a817a", N600 = "#6b635c", N900 = "#1c1916", WHITE = "#fff";
const DISP = "var(--font-display)";
const BODY = "var(--font-body)";
const CX = 640; // Canvas-Mitte (1280×720)

/* ── Easing / Tween-Helfer ── */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const Easing = {
  linear: (t) => t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    return from + (to - from) * ease((t - start) / (end - start));
  };
}

/* ── Timeline / Sprite ── */
const TimelineContext = React.createContext({ time: 0, duration: 63, playing: false });
const useTimeline = () => React.useContext(TimelineContext);
const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children }) {
  const { time } = useTimeline();
  if (time < start || time > end) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  return <SpriteContext.Provider value={{ localTime, progress, duration }}>{children}</SpriteContext.Provider>;
}

function ImageSprite({ src, x = 0, y = 0, width = 400, height = 300, entryDur = 0.6, exitDur = 0.4, fit = "cover", radius = 12 }) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1, scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t; scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t; scale = 1 + 0.02 * t;
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, width, height, opacity, transform: `scale(${scale})`, transformOrigin: "center", borderRadius: radius, overflow: "hidden", willChange: "transform,opacity" }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }} />
    </div>
  );
}

/* ── Bausteine (icons, reveal, header, rail, cursor, rows) ── */
const Ic = {
  check: ({ size = 24, color = WHITE, sw = 3 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>),
  search: ({ size = 22, color = N500 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>),
  pin: ({ size = 22, color = WHITE }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>),
  zap: ({ size = 18, color = ORANGE6 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>),
  shield: ({ size = 20, color = GREEN7 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>),
  clock: ({ size = 18, color = AMBER }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>),
  mail: ({ size = 18, color = N600 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m2 7 10 7L22 7" /></svg>),
  fileText: ({ size = 20, color = N600 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5" /><path d="M9 13h6M9 17h4" /></svg>),
  star: ({ size = 16, color = ORANGE }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>),
};

function AbStars({ filled = 1, total = 5, size = 15, color = RED, empty = N300, gap = 2 }) {
  return (
    <span style={{ display: "inline-flex", gap }}>
      {Array.from({ length: total }).map((_, i) => <Ic.star key={i} size={size} color={i < filled ? color : empty} />)}
    </span>
  );
}

function AbPanel({ color, fade = 0.5 }) {
  const { localTime, duration } = useSprite();
  let o = 1;
  if (localTime < fade) o = localTime / fade;
  else if (localTime > duration - fade) o = Math.max(0, (duration - localTime) / fade);
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: o }} />;
}

function AbReveal({ children, delay = 0, dur = 0.5, rise = 22, holdExit = true, x, y, style }) {
  const { localTime, duration } = useSprite();
  const t = clamp((localTime - delay) / dur, 0, 1);
  const e = Easing.easeOutCubic(t);
  let opacity = e, ty = (1 - e) * rise;
  if (holdExit) {
    const ex = clamp((localTime - (duration - 0.45)) / 0.45, 0, 1);
    opacity *= 1 - ex; ty -= ex * 12;
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, transform: `translateY(${ty}px)`, willChange: "transform,opacity", ...style }}>
      {children}
    </div>
  );
}

function StepHeader({ n, title }) {
  return (
    <>
      <AbReveal delay={0.05} x={0} y={74} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ display: "inline-block", whiteSpace: "nowrap", background: "#fff4e8", color: ORANGE6, border: "1px solid #ffd9b3", borderRadius: 999, padding: "7px 16px", fontFamily: BODY, fontWeight: 800, fontSize: 13.5, letterSpacing: ".09em" }}>
        {`SCHRITT ${n} VON 7`}
        </div>
      </AbReveal>
      <AbReveal delay={0.18} x={0} y={120} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 42, color: N900, letterSpacing: "-.5px" }}>{title}</div>
      </AbReveal>
    </>
  );
}

const STEP_BOUNDS = [4, 12, 20, 27, 34, 42, 49, 56];
function ProgressRail() {
  const { time } = useTimeline();
  if (time < STEP_BOUNDS[0] - 0.4 || time > STEP_BOUNDS[7]) return null;
  let cur = 0;
  for (let i = 0; i < 7; i++) if (time >= STEP_BOUNDS[i]) cur = i;
  const o = Math.min(clamp((time - 3.7) / 0.5, 0, 1), 1 - clamp((time - 55.4) / 0.5, 0, 1));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 668, display: "flex", justifyContent: "center", alignItems: "center", gap: 9, opacity: o }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ width: i === cur ? 32 : 10, height: 10, borderRadius: 999, background: i === cur ? ORANGE : i < cur ? "#ffd9b3" : N200 }} />
      ))}
    </div>
  );
}

/* Cursor mit gedämpftem Pfad + Klick-Ripples */
function abPathPos(path, t) {
  if (t <= path[0].t) return path[0];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    if (t <= b.t) {
      const k = Easing.easeInOutCubic((t - a.t) / Math.max(0.0001, b.t - a.t));
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
  }
  return path[path.length - 1];
}

function AbCursor({ path, clicks = [], fadeOut }) {
  const { localTime: t } = useSprite();
  const p = abPathPos(path, t);
  let o = clamp((t - path[0].t + 0.25) / 0.3, 0, 1);
  if (fadeOut != null) o *= 1 - clamp((t - fadeOut) / 0.35, 0, 1);
  if (o <= 0) return null;
  const pressed = clicks.some((c) => Math.abs(t - c) < 0.09);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      {clicks.map((c, i) => {
        const k = (t - c) / 0.45;
        if (k <= 0 || k >= 1) return null;
        const cp = abPathPos(path, c);
        const r = 12 + k * 32;
        return <div key={i} style={{ position: "absolute", left: cp.x - r, top: cp.y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `3px solid ${ORANGE}`, opacity: (1 - k) * 0.7 }}></div>;
      })}
      <div style={{ position: "absolute", left: p.x, top: p.y, transform: `scale(${pressed ? 0.82 : 1})`, transformOrigin: "4px 4px", filter: "drop-shadow(0 4px 10px rgba(28,25,22,.35))" }}>
        <svg width="26" height="28" viewBox="0 0 24 26"><path d="M3 1l16 12-7 1 4 8-4 2-4-8-5 5z" fill="#fff" stroke="#1c1916" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
}

function ResultRow({ name, addr, rating, reviews, filled, danger, width = 552, selected, dim, style }) {
  return (
    <div style={{ width, background: WHITE, border: `1.5px solid ${selected ? ORANGE : N200}`, boxShadow: selected ? "0 0 0 4px rgba(255,128,0,.14)" : "none", borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 14, opacity: dim ? 0.45 : 1, fontFamily: BODY, boxSizing: "border-box", ...style }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: N100, border: `1px solid ${N200}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Ic.pin size={20} color={N500} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17, color: N900, whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3, fontSize: 13, color: N500 }}>
          <AbStars filled={filled} size={13} color={danger ? RED : ORANGE} />
          <b style={{ color: danger ? RED : N900 }}>{rating}</b>
          <span>· {reviews} Bew. · {addr}</span>
        </div>
      </div>
      {selected && (
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <Ic.check size={14} color={WHITE} />
        </div>
      )}
    </div>
  );
}

/* ════════ Szenen ════════ */

/* S0 — Intro (0–4) */
function AbIntro() {
  return (
    <Sprite start={0} end={4}>
      <ImageSprite src={asset("/assets/rapidremove-logo-full.png")} x={CX - 240} y={230} width={480} height={106} fit="contain" entryDur={0.7} exitDur={0.4} />
      <AbReveal delay={0.7} x={0} y={360} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 40, color: N900, letterSpacing: "-.5px" }}>So funktioniert&apos;s</div>
      </AbReveal>
      <AbReveal delay={1.1} x={0} y={425} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 21, color: N600 }}>Von der Profil-Suche bis zur Zahlung — in 7 Schritten.</div>
      </AbReveal>
    </Sprite>
  );
}

/* S1 — Profil auf der Website suchen (4–12) */
function AbS1Suche() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const full = "Müller Zahnarztpraxis";
    const n = Math.round(clamp((lt - 0.9) / 1.4, 0, 1) * full.length);
    const typed = full.slice(0, n);
    const caret = lt > 0.9 && n < full.length && Math.floor(lt * 2.4) % 2 === 0;
    const results = lt > 2.5;
    const picked = lt > 4.05;
    const row = (i) => {
      const e = Easing.easeOutCubic(clamp((lt - 2.5 - i * 0.16) / 0.4, 0, 1));
      return { opacity: e, transform: `translateY(${(1 - e) * 16}px)`, marginTop: i === 0 ? 16 : 10 };
    };
    return (
      <div style={{ width: 600, background: WHITE, borderRadius: 24, boxShadow: "0 26px 64px rgba(28,25,22,.16)", border: `1px solid ${N200}`, padding: 24, boxSizing: "border-box" }}>
        <div style={{ height: 56, border: `1.5px solid ${n > 0 ? ORANGE : N300}`, borderRadius: 14, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, boxShadow: n > 0 ? "0 0 0 4px rgba(255,128,0,.13)" : "none", boxSizing: "border-box" }}>
          <Ic.search size={21} color={n > 0 ? ORANGE : N500} />
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 17, color: typed ? N900 : N500 }}>
            {typed || "Name Ihres Unternehmens"}<span style={{ opacity: caret ? 1 : 0, color: ORANGE }}>|</span>
          </span>
        </div>
        {results && (
          <>
            <div style={row(0)}><ResultRow name="Müller Zahnarzt MVZ" addr="Hamburg" rating="4,6" reviews={112} filled={5} dim={picked} /></div>
            <div style={row(1)}><ResultRow name="Müller Zahnarztpraxis" addr="Hauptstraße 24, Berlin" rating="2,4" reviews={47} filled={1} danger selected={picked} /></div>
            <div style={row(2)}><ResultRow name="Praxis Dr. Müller & Kollegen" addr="Berlin" rating="4,8" reviews={89} filled={5} dim={picked} /></div>
          </>
        )}
      </div>
    );
  };
  return (
    <Sprite start={4} end={12}>
      <StepHeader n={1} title={<span>Profil auf der Website <span style={{ color: ORANGE }}>suchen</span></span>} />
      <AbReveal delay={0.4} x={CX - 300} y={200}><Inner /></AbReveal>
      <AbReveal delay={4.5} x={0} y={602} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 17, color: N600 }}>Eintippen, echtes Google-Profil auswählen — fertig.</div>
      </AbReveal>
      <AbCursor
        path={[{ t: 2.7, x: 1010, y: 630 }, { t: 3.9, x: CX + 130, y: 408 }, { t: 4.6, x: CX + 138, y: 414 }]}
        clicks={[4.05]} fadeOut={5.6}
      />
    </Sprite>
  );
}

/* S2 — Leistungen auswählen / Wizard (12–20) */
function AbS2Wizard() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const sel = lt > 1.78;
    const express = lt > 3.28;
    const prot = lt > 4.88;
    const total = !sel ? null : Math.round(animate({ from: 450, to: express ? 649 : 450, start: 3.32, end: 3.72 })(lt));
    const opt = (active, dimmed) => ({
      display: "flex", alignItems: "center", gap: 16, padding: "0 18px", height: 74, borderRadius: 16, boxSizing: "border-box",
      border: `1.5px solid ${active ? ORANGE : N200}`, background: active ? "#fff9f2" : WHITE,
      boxShadow: active ? "0 0 0 4px rgba(255,128,0,.13)" : "none", opacity: dimmed ? 0.55 : 1,
    });
    const radio = (active) => (
      <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${active ? ORANGE : N300}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", boxSizing: "border-box" }}>
        {active && <span style={{ width: 11, height: 11, borderRadius: "50%", background: ORANGE }}></span>}
      </span>
    );
    return (
      <div style={{ width: 600, background: WHITE, borderRadius: 24, boxShadow: "0 26px 64px rgba(28,25,22,.16)", border: `1px solid ${N200}`, padding: 24, boxSizing: "border-box", fontFamily: BODY }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 21, color: N900, marginBottom: 10 }}>Leistung auswählen</div>
        <div style={opt(sel)}>
          {radio(sel)}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17.5, color: N900 }}>Google-Profil löschen</div>
            <div style={{ fontSize: 13.5, color: N600, marginTop: 2 }}>Profil samt aller Bewertungen dauerhaft entfernen</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, color: N900 }}>450&nbsp;€</div>
            <div style={{ fontSize: 12, color: N500 }}>nach Erfolg</div>
          </div>
        </div>
        <div style={{ ...opt(false, sel), marginTop: 10 }}>
          {radio(false)}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17.5, color: N900 }}>Bewertungen zurücksetzen</div>
            <div style={{ fontSize: 13.5, color: N600, marginTop: 2 }}>Profil behalten, alle Bewertungen auf null</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, color: N900 }}>850&nbsp;€</div>
            <div style={{ fontSize: 12, color: N500 }}>nach Erfolg</div>
          </div>
        </div>
        <div style={{ marginTop: 10, height: 50, borderRadius: 14, border: `1.5px dashed ${express ? ORANGE : N300}`, background: express ? "#fff4e8" : WHITE, display: "flex", alignItems: "center", gap: 11, padding: "0 18px", opacity: sel ? 1 : 0.45, boxSizing: "border-box" }}>
          <Ic.zap size={18} color={ORANGE6} />
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: N900 }}>Express-Löschung <span style={{ color: N500, fontWeight: 600 }}>· {express ? "~6 h" : "~24 h"} Bearbeitung</span></span>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, color: ORANGE6 }}>+199&nbsp;€</span>
          <span style={{ width: 44, height: 25, borderRadius: 999, background: express ? ORANGE : N300, position: "relative", flex: "none" }}>
            <span style={{ position: "absolute", top: 3, left: express ? 22 : 3, width: 19, height: 19, borderRadius: "50%", background: WHITE, boxShadow: "0 1px 4px rgba(28,25,22,.3)" }}></span>
          </span>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: N500, letterSpacing: ".07em" }}>SCHUTZ VOR ERNEUTER EINTRAGUNG</div>
        <div style={{ marginTop: 7, display: "flex", gap: 10, opacity: sel ? 1 : 0.45 }}>
          <div style={{ flex: 1, height: 56, borderRadius: 14, border: `1.5px solid ${prot ? ORANGE : N200}`, background: prot ? "#fff9f2" : WHITE, boxShadow: prot ? "0 0 0 4px rgba(255,128,0,.13)" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxSizing: "border-box" }}>
            <span style={{ fontWeight: 800, fontSize: 13.5, color: N900 }}>Monatlicher Schutz</span>
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14.5, color: prot ? ORANGE6 : N600 }}>24,90 € <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 11.5, color: N500 }}>/ Mon.</span></span>
          </div>
          <div style={{ flex: 1, height: 56, borderRadius: 14, border: `1.5px solid ${N200}`, background: WHITE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxSizing: "border-box" }}>
            <span style={{ fontWeight: 800, fontSize: 13.5, color: N900 }}>Lebenslanger Schutz</span>
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14.5, color: N600 }}>990 € <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 11.5, color: N500 }}>einmalig</span></span>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 54, borderRadius: 14, background: N100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", boxSizing: "border-box" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: N600 }}>Gesamt nach Erfolg</span>
          <span style={{ textAlign: "right" }}>
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 23, color: total ? N900 : N300, display: "block", lineHeight: 1.05 }}>{total ? `${total} €` : "— €"}</span>
            {prot && <span style={{ fontSize: 12, fontWeight: 800, color: ORANGE6, display: "block" }}>+ 24,90 € / Mon. Schutz</span>}
          </span>
        </div>
      </div>
    );
  };
  return (
    <Sprite start={12} end={20}>
      <StepHeader n={2} title={<span>Leistungen <span style={{ color: ORANGE }}>auswählen</span></span>} />
      <AbReveal delay={0.4} x={CX - 300} y={170}><Inner /></AbReveal>
      <AbCursor
        path={[{ t: 1.0, x: 1030, y: 630 }, { t: 1.75, x: 393, y: 267 }, { t: 2.6, x: 440, y: 305 }, { t: 3.25, x: 876, y: 423 }, { t: 4.1, x: 850, y: 455 }, { t: 4.85, x: 499, y: 510 }, { t: 5.6, x: 540, y: 600 }]}
        clicks={[1.8, 3.3, 4.9]} fadeOut={5.9}
      />
    </Sprite>
  );
}

/* S3 — Auftrag erteilen → Rechte übertragen (20–27) */
function AbS3Rechte() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const ordered = lt > 1.88;
    const pop = Easing.easeOutBack(clamp((lt - 1.88) / 0.45, 0, 1));
    const arrowE = Easing.easeOutCubic(clamp((lt - 2.5) / 0.6, 0, 1));
    const badgeT = Easing.easeOutBack(clamp((lt - 3.2) / 0.5, 0, 1));
    const row = (l, v) => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", fontSize: 14 }}>
        <span style={{ fontWeight: 700, color: N500, whiteSpace: "nowrap" }}>{l}</span>
        <span style={{ fontWeight: 800, color: N900, whiteSpace: "nowrap" }}>{v}</span>
      </div>
    );
    return (
      <>
        <div style={{ position: "absolute", left: 230, top: 198, width: 420, background: WHITE, borderRadius: 20, border: `1px solid ${N200}`, boxShadow: "0 24px 60px rgba(28,25,22,.14)", padding: 24, boxSizing: "border-box", fontFamily: BODY }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Ic.fileText size={22} color={ORANGE6} />
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, color: N900 }}>Ihr Auftrag</span>
          </div>
          {row("Profil", "Müller Zahnarztpraxis")}
          {row("Leistung", "Profil löschen · Express")}
          {row("Schutz", "Monatlich · 24,90 € / Mon.")}
          <div style={{ borderTop: `1px solid ${N200}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 14.5, fontWeight: 800, color: N600 }}>Gesamt nach Erfolg</span>
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 21, color: N900 }}>649&nbsp;€</span>
          </div>
          <div style={{ marginTop: 14, height: 52, borderRadius: 999, background: ordered ? GREEN : ORANGE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontWeight: 800, fontSize: 16, boxShadow: ordered ? "0 12px 30px rgba(22,163,74,.32)" : "0 12px 30px rgba(255,128,0,.32)", transform: ordered ? `scale(${0.92 + pop * 0.08})` : "none", fontFamily: BODY }}>
            {ordered ? <><Ic.check size={19} color={WHITE} /> Auftrag erteilt</> : "Auftrag verbindlich erteilen"}
          </div>
        </div>
        <svg width="150" height="40" viewBox="0 0 150 40" style={{ position: "absolute", left: 672, top: 330, opacity: arrowE }}>
          <path d={`M5 20 H${5 + arrowE * 110}`} stroke={ORANGE} strokeWidth="5" strokeLinecap="round" strokeDasharray="2 14" />
          <path d="M118 6 L140 20 L118 34" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={arrowE > 0.85 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", left: 850, top: 250 }}>
          <img src={asset("/assets/rapidremove-icon.png")} width="130" height="130" style={{ borderRadius: 32, boxShadow: "0 18px 44px rgba(255,128,0,.35)", display: "block" }} alt="RapidRemove" />
          <div style={{ position: "absolute", left: -20, top: 116, transform: `scale(${badgeT})`, transformOrigin: "50% 0", background: "#e9f7ee", border: "1.5px solid #bfe6cc", borderRadius: 999, padding: "9px 16px", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <Ic.shield size={18} color={GREEN7} />
            <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 14.5, color: GREEN7 }}>Rechte übertragen</span>
          </div>
        </div>
      </>
    );
  };
  return (
    <Sprite start={20} end={27}>
      <StepHeader n={3} title={<span>Auftrag erteilen — <span style={{ color: ORANGE }}>Rechte übertragen</span></span>} />
      <AbReveal delay={0.4} x={0} y={0} style={{ width: 1280, height: 720 }}><Inner /></AbReveal>
      <AbReveal delay={4.0} x={0} y={600} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 17, color: N600 }}>Mit Ihrem Auftrag übertragen Sie uns alle nötigen Rechte — wir übernehmen den Rest.</div>
      </AbReveal>
      <AbCursor
        path={[{ t: 0.9, x: 1000, y: 630 }, { t: 1.8, x: 452, y: 446 }, { t: 2.4, x: 466, y: 458 }]}
        clicks={[1.9]} fadeOut={3.4}
      />
    </Sprite>
  );
}

/* S4 — Löschung in Bearbeitung (27–34) */
function AbS4Bearbeitung() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const fill = animate({ from: 0, to: 0.5, start: 0.8, end: 2.4, ease: Easing.easeInOutCubic })(lt) + animate({ from: 0, to: 0.07, start: 2.4, end: 6.2, ease: Easing.linear })(lt);
    const n1done = lt > 0.8;
    const n2on = lt > 2.4;
    const pulse = n2on ? 1 + 0.5 * (0.5 + 0.5 * Math.sin((lt - 2.4) * 4.2)) : 0;
    const chipE = Easing.easeOutCubic(clamp((lt - 2.7) / 0.5, 0, 1));
    const X0 = 310, X1 = 970, Y = 386;
    const nodes = [
      { x: X0, label: "Antrag eingereicht", done: n1done },
      { x: CX, label: "In Bearbeitung", active: n2on },
      { x: X1, label: "Profil gelöscht" },
    ];
    const tipX = X0 + fill * (X1 - X0);
    return (
      <>
        <div style={{ position: "absolute", left: X0, top: Y - 3, width: X1 - X0, height: 6, borderRadius: 3, background: N200 }}></div>
        <div style={{ position: "absolute", left: X0, top: Y - 3, width: fill * (X1 - X0), height: 6, borderRadius: 3, background: `linear-gradient(90deg,${ORANGE6},${ORANGE})` }}></div>
        <img src={asset("/assets/rapidremove-rocket-orange.png")} width="46" height="46" alt=""
          style={{ position: "absolute", left: tipX - 38, top: Y - 58, opacity: clamp((lt - 0.25) / 0.4, 0, 1), transform: `rotate(45deg) translateY(${Math.sin(lt * 3) * 2.5}px)`, filter: "drop-shadow(0 6px 14px rgba(255,128,0,.4))" }} />
        {nodes.map((nd, i) => (
          <div key={i} style={{ position: "absolute", left: nd.x - 110, top: Y - 21, width: 220, textAlign: "center" }}>
            {nd.active && <div style={{ position: "absolute", left: 110 - 21 - pulse * 8, top: -pulse * 8, width: 42 + pulse * 16, height: 42 + pulse * 16, borderRadius: "50%", border: `2px solid ${AMBER}`, opacity: 0.5 - pulse * 0.22 }}></div>}
            <div style={{ width: 42, height: 42, borderRadius: "50%", margin: "0 auto", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", background: nd.done ? GREEN : nd.active ? "#fdf1e0" : WHITE, border: nd.done ? "none" : `2px solid ${nd.active ? AMBER : N300}` }}>
              {nd.done ? <Ic.check size={20} color={WHITE} /> : nd.active ? <Ic.clock size={19} color={AMBER} /> : <span style={{ width: 10, height: 10, borderRadius: "50%", background: N300 }}></span>}
            </div>
            <div style={{ marginTop: 12, fontFamily: BODY, fontWeight: 800, fontSize: 15.5, color: nd.done ? GREEN7 : nd.active ? N900 : N500 }}>{nd.label}</div>
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, top: 268, width: 1280, textAlign: "center", opacity: chipE, transform: `translateY(${(1 - chipE) * 14}px)` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#fdf1e0", border: "1.5px solid #f3ddb8", borderRadius: 999, padding: "10px 20px", fontFamily: BODY, fontWeight: 800, fontSize: 16, color: "#92600a" }}>
            <Ic.clock size={17} color={AMBER} /> In Bearbeitung · Ø 24 Stunden
          </span>
        </div>
      </>
    );
  };
  return (
    <Sprite start={27} end={34}>
      <StepHeader n={4} title={<span>Löschung <span style={{ color: ORANGE }}>in Bearbeitung</span></span>} />
      <AbReveal delay={0.4} x={0} y={0} style={{ width: 1280, height: 720 }}><Inner /></AbReveal>
      <AbReveal delay={3.4} x={0} y={580} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 17, color: N600 }}>Sie müssen nichts weiter tun — wir übernehmen den gesamten Prozess.</div>
      </AbReveal>
    </Sprite>
  );
}

/* S5 — Aus Suche & Google Maps gelöscht (34–42) */
function AbS5Geloescht() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const diss = Easing.easeInOutCubic(clamp((lt - 1.8) / 0.8, 0, 1));
    const pinT = clamp((lt - 2.3) / 0.5, 0, 1);
    const pinS = 1 + pinT * 0.3 - Easing.easeInCubic(pinT) * 1.3;
    const chk = Easing.easeOutBack(clamp((lt - 3.1) / 0.5, 0, 1));
    const panel = { position: "absolute", top: 196, width: 500, height: 350, background: WHITE, borderRadius: 22, border: `1px solid ${N200}`, boxShadow: "0 24px 60px rgba(28,25,22,.14)", overflow: "hidden", boxSizing: "border-box" };
    const head = (label, icon) => (
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 9, padding: "0 18px", borderBottom: `1px solid ${N200}`, background: N50, fontFamily: BODY, fontWeight: 800, fontSize: 14.5, color: N600 }}>
        {icon}{label}
      </div>
    );
    const ghostRow = (w1, w2) => (
      <div style={{ padding: "16px 20px" }}>
        <div style={{ height: 12, width: w1, background: N100, borderRadius: 6 }}></div>
        <div style={{ height: 9, width: w2, background: N100, borderRadius: 5, marginTop: 8 }}></div>
      </div>
    );
    const doneChip = (
      <div style={{ position: "absolute", right: 14, top: 60, transform: `scale(${chk})`, transformOrigin: "100% 0", background: "#e9f7ee", border: "1.5px solid #bfe6cc", borderRadius: 999, padding: "7px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        <Ic.check size={14} color={GREEN7} sw={3.4} />
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 13.5, color: GREEN7 }}>Entfernt</span>
      </div>
    );
    return (
      <>
        <div style={{ ...panel, left: 116 }}>
          {head("Google Suche", <Ic.search size={17} color={N500} />)}
          {ghostRow(240, 320)}
          <div style={{ height: (1 - diss) * 86, opacity: 1 - diss, filter: `blur(${diss * 8}px)`, transform: `scale(${1 - diss * 0.05})`, overflow: "hidden" }}>
            <div style={{ padding: "10px 20px 0" }}>
              <ResultRow name="Müller Zahnarztpraxis" addr="Berlin" rating="2,4" reviews={47} filled={1} danger width={460} />
            </div>
          </div>
          {ghostRow(280, 300)}
          {ghostRow(210, 330)}
          {doneChip}
        </div>
        <div style={{ ...panel, left: 664 }}>
          {head("Google Maps", <Ic.pin size={17} color={N500} />)}
          <div style={{ position: "absolute", inset: "48px 0 0 0", background: "#eef3f5" }}>
            <div style={{ position: "absolute", left: "10%", top: "14%", width: 120, height: 86, borderRadius: 14, background: "#d6ead0" }}></div>
            <div style={{ position: "absolute", right: "10%", bottom: "12%", width: 100, height: 110, borderRadius: 14, background: "#c4dce8" }}></div>
            <div style={{ position: "absolute", left: "-8%", right: "-8%", top: "46%", height: 11, background: "#cdd8dd", transform: "rotate(-4deg)" }}></div>
            <div style={{ position: "absolute", top: "-8%", bottom: "-8%", left: "52%", width: 12, background: "#fff", boxShadow: "0 0 0 1px #e2e9ec", transform: "rotate(3deg)" }}></div>
            {pinS > 0.02 && (
              <div style={{ position: "absolute", left: "50%", top: "48%", transform: `translate(-50%,-100%) scale(${Math.max(0, pinS)})`, transformOrigin: "50% 100%" }}>
                <div style={{ width: 44, height: 44, background: RED, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #fff", boxShadow: "0 8px 20px rgba(226,59,59,.4)" }}>
                  <div style={{ transform: "rotate(45deg)", display: "flex" }}><Ic.pin size={17} color={WHITE} /></div>
                </div>
              </div>
            )}
          </div>
          {doneChip}
        </div>
      </>
    );
  };
  return (
    <Sprite start={34} end={42}>
      <StepHeader n={5} title={<span>Aus Suche & Maps <span style={{ color: GREEN7 }}>gelöscht</span></span>} />
      <AbReveal delay={0.4} x={0} y={0} style={{ width: 1280, height: 720 }}><Inner /></AbReveal>
      <AbReveal delay={3.8} x={0} y={590} style={{ width: 1280, textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#e9f7ee", border: "1.5px solid #bfe6cc", borderRadius: 999, padding: "11px 22px", fontFamily: BODY, fontWeight: 800, fontSize: 17, color: GREEN7 }}>
          <Ic.check size={17} color={GREEN7} sw={3.4} /> Dauerhaft entfernt — samt aller Bewertungen
        </span>
      </AbReveal>
    </Sprite>
  );
}

/* S6 — Kunde bekommt Rechnung (42–49) */
function AbS6Rechnung() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const mailE = Easing.easeOutCubic(clamp((lt - 1.6) / 0.5, 0, 1));
    const line = (l, v, bold) => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", fontFamily: BODY }}>
        <span style={{ fontSize: bold ? 16 : 15, fontWeight: bold ? 800 : 600, color: bold ? N900 : N600, whiteSpace: "nowrap" }}>{l}</span>
        <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: bold ? 24 : 16.5, color: N900, whiteSpace: "nowrap" }}>{v}</span>
      </div>
    );
    return (
      <div style={{ width: 540, background: WHITE, borderRadius: 24, border: `1px solid ${N200}`, boxShadow: "0 26px 64px rgba(28,25,22,.16)", padding: 28, boxSizing: "border-box", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <img src={asset("/assets/rapidremove-icon.png")} width="38" height="38" style={{ borderRadius: 10, display: "block" }} alt="" />
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, color: N900 }}>Rechnung</span>
          </div>
          <div style={{ textAlign: "right", fontFamily: BODY, fontSize: 13, color: N500, fontWeight: 700 }}>
            Nr. RR-2026-0418<br />nach erfolgter Löschung
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${N200}` }}>
          {line("Google-Profil löschen", "450,00 €")}
          {line("Express-Löschung", "199,00 €")}
        </div>
        <div style={{ borderTop: `1px solid ${N200}`, marginTop: 4, paddingTop: 4 }}>
          {line("Gesamtbetrag", "649,00 €", true)}
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 9, background: "#e9f7ee", border: "1.5px solid #bfe6cc", borderRadius: 12, padding: "11px 14px" }}>
          <Ic.shield size={18} color={GREEN7} />
          <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: GREEN7 }}>Gestellt erst nach erfolgreicher Löschung — keine Vorkasse.</span>
        </div>
        <div style={{ position: "absolute", right: -26, top: -24, opacity: mailE, transform: `translateY(${(1 - mailE) * -16}px) rotate(4deg)`, background: WHITE, border: `1.5px solid ${N200}`, borderRadius: 999, boxShadow: "0 12px 30px rgba(28,25,22,.14)", padding: "10px 17px", display: "flex", alignItems: "center", gap: 9 }}>
          <Ic.mail size={17} color={ORANGE6} />
          <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 14, color: N900 }}>Per E-Mail an Sie</span>
        </div>
      </div>
    );
  };
  return (
    <Sprite start={42} end={49}>
      <StepHeader n={6} title={<span>Sie erhalten die <span style={{ color: ORANGE }}>Rechnung</span></span>} />
      <AbReveal delay={0.4} x={CX - 270} y={208}><Inner /></AbReveal>
    </Sprite>
  );
}

/* S7 — Kunde zahlt (49–56) */
function AbS7Zahlung() {
  const Inner = () => {
    const { localTime: lt } = useSprite();
    const paid = lt > 2.25;
    const pop = Easing.easeOutBack(clamp((lt - 2.25) / 0.45, 0, 1));
    return (
      <div style={{ width: 460, background: WHITE, borderRadius: 24, border: `1px solid ${N200}`, boxShadow: "0 26px 64px rgba(28,25,22,.16)", padding: 28, boxSizing: "border-box", textAlign: "center", fontFamily: BODY }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: N500, letterSpacing: ".07em" }}>OFFENER BETRAG</div>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 56, color: N900, letterSpacing: "-1px", margin: "8px 0 2px" }}>649&nbsp;€</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: N500, marginBottom: 20 }}>Rechnung RR-2026-0418</div>
        <div style={{ height: 58, borderRadius: 999, background: paid ? GREEN : ORANGE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 800, fontSize: 18, boxShadow: paid ? "0 14px 34px rgba(22,163,74,.35)" : "0 14px 34px rgba(255,128,0,.35)", transform: paid ? `scale(${0.92 + pop * 0.08})` : "none" }}>
          {paid ? <><Ic.check size={21} color={WHITE} /> Bezahlt</> : "Jetzt bezahlen"}
        </div>
      </div>
    );
  };
  return (
    <Sprite start={49} end={56}>
      <StepHeader n={7} title={<span>Sie zahlen — <span style={{ color: GREEN7 }}>erst jetzt</span></span>} />
      <AbReveal delay={0.4} x={CX - 230} y={222}><Inner /></AbReveal>
      <AbReveal delay={3.2} x={0} y={566} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 17, color: N600 }}>Kein Erfolg, keine Rechnung — null Risiko für Sie.</div>
      </AbReveal>
      <AbCursor
        path={[{ t: 1.0, x: 1000, y: 630 }, { t: 2.1, x: CX + 14, y: 462 }, { t: 2.7, x: CX + 22, y: 468 }]}
        clicks={[2.25]} fadeOut={3.4}
      />
    </Sprite>
  );
}

/* S8 — Outro / Recap (56–63) */
function AbOutro({ onStart }) {
  const labels = ["Suchen", "Auswählen", "Auftrag", "Bearbeitung", "Gelöscht", "Rechnung", "Zahlung"];
  const Chips = () => {
    const { localTime: lt } = useSprite();
    return (
      <div style={{ position: "absolute", left: 0, top: 318, width: 1280, display: "flex", justifyContent: "center", gap: 14 }}>
        {labels.map((l, i) => {
          const e = Easing.easeOutBack(clamp((lt - 0.7 - i * 0.16) / 0.45, 0, 1));
          return (
            <div key={i} style={{ opacity: clamp(e * 1.6, 0, 1), transform: `scale(${0.6 + e * 0.4})`, display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 999, padding: "10px 16px 10px 10px" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: ORANGE, color: WHITE, fontFamily: DISP, fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 15, color: WHITE }}>{l}</span>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <Sprite start={56} end={63}>
      <AbPanel color={INK} />
      <div style={{ position: "absolute", left: CX - 320, top: 330, width: 640, height: 340, background: "radial-gradient(circle, rgba(255,128,0,.25), transparent 60%)", pointerEvents: "none" }}></div>
      <ImageSprite src={asset("/assets/rapidremove-logo-white.png")} x={CX - 215} y={150} width={430} height={98} fit="contain" entryDur={0.6} exitDur={0.4} />
      <Chips />
      <AbReveal delay={1.9} x={0} y={420} style={{ width: 1280, textAlign: "center" }}>
        <div role="button" tabIndex={-1} onClick={onStart}
          style={{ display: "inline-flex", alignItems: "center", gap: 11, background: ORANGE, color: WHITE, fontFamily: BODY, fontWeight: 800, fontSize: 21, padding: "16px 30px", borderRadius: 999, boxShadow: "0 16px 40px rgba(255,128,0,.4)", cursor: "pointer" }}>
          <Ic.search size={20} color={WHITE} /> Jetzt Gratis-Check starten
        </div>
      </AbReveal>
      <AbReveal delay={2.3} x={0} y={518} style={{ width: 1280, textAlign: "center" }}>
        <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 22, color: ORANGE, letterSpacing: ".02em" }}>rapid-remove.com</div>
      </AbReveal>
    </Sprite>
  );
}

/* ── Abspielleiste (unter dem Canvas, wie im Design) ── */
function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" onClick={onClick} title={title} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#f6f4ef", cursor: "pointer", padding: 0, transition: "background 120ms", flex: "none" }}>
      {children}
    </button>
  );
}

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => { if (trackRef.current) onSeek(timeFromEvent(e)); };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);
    return () => { window.removeEventListener("pointerup", onUp); window.removeEventListener("pointermove", onMove); };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60), s = Math.floor(total % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  const mono = "ui-monospace, SFMono-Regular, monospace";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: "rgba(20,20,20,0.92)", border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: 680, margin: "10px auto 0", borderRadius: 10, color: "#f6f4ef", userSelect: "none", boxSizing: "border-box" }}>
      <IconButton onClick={onReset} title="Zum Anfang">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /></svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Abspielen/Pause">
        {playing
          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="2" width="3" height="10" fill="currentColor" /><rect x="8" y="2" width="3" height="10" fill="currentColor" /></svg>
          : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2l9 5-9 5V2z" fill="currentColor" /></svg>}
      </IconButton>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: "tabular-nums", width: 38, textAlign: "right" }}>{fmt(time)}</div>
      <div
        ref={trackRef}
        onPointerMove={(e) => { if (!trackRef.current) return; if (dragging) onSeek(timeFromEvent(e)); }}
        onPointerLeave={() => { if (!dragging) onHover(null); }}
        onPointerDown={(e) => { setDragging(true); onSeek(timeFromEvent(e)); onHover(null); }}
        style={{ flex: 1, height: 22, position: "relative", cursor: "pointer", display: "flex", alignItems: "center", touchAction: "none" }}
      >
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 0, width: `${pct}%`, height: 4, background: ORANGE, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: `${pct}%`, top: "50%", width: 12, height: 12, marginLeft: -6, marginTop: -6, background: "#fff", borderRadius: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.4)" }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 12, fontVariantNumeric: "tabular-nums", width: 38, textAlign: "left", color: "rgba(246,244,239,0.55)" }}>{fmt(duration)}</div>
    </div>
  );
}

/* ── Eingebettete Bühne: 1280×720-Canvas, skaliert in den 16:9-Rahmen der Sektion ── */
const DURATION = 63;

export function AblaufVideo({ onStart }) {
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(0);
  const [inView, setInView] = React.useState(false);
  const frameRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Reduced motion: nicht automatisch abspielen.
  React.useEffect(() => {
    try { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false); } catch (e) {}
  }, []);

  // Canvas auf die Rahmenbreite skalieren.
  React.useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / 1280);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Nur im Viewport laufen lassen (spart Akku, kein unsichtbares Rendern).
  React.useEffect(() => {
    const el = frameRef.current;
    if (!el || !("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => setInView(e.isIntersecting)), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Animations-Loop (Loop am Ende; dt gekappt, damit Tab-Wechsel nicht springt).
  const running = playing && inView;
  React.useEffect(() => {
    if (!running) { lastTsRef.current = null; return; }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.1, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      setTime((t) => (t + dt) % DURATION);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); lastTsRef.current = null; };
  }, [running]);

  const displayTime = time;
  const ctx = React.useMemo(() => ({ time: displayTime, duration: DURATION, playing: running }), [displayTime, running]);

  return (
    <div>
      <div ref={frameRef} className="video-frame" style={{ background: N50 }}>
        <div style={{ width: 1280, height: 720, position: "absolute", left: 0, top: 0, transform: `scale(${scale})`, transformOrigin: "0 0", background: N50, overflow: "hidden" }}>
          {scale > 0 && (
            <TimelineContext.Provider value={ctx}>
              <AbIntro />
              <AbS1Suche />
              <AbS2Wizard />
              <AbS3Rechte />
              <AbS4Bearbeitung />
              <AbS5Geloescht />
              <AbS6Rechnung />
              <AbS7Zahlung />
              <AbOutro onStart={onStart} />
              <ProgressRail />
            </TimelineContext.Provider>
          )}
        </div>
      </div>
      <PlaybackBar
        time={displayTime}
        duration={DURATION}
        playing={running}
        onPlayPause={() => setPlaying((p) => !p)}
        onReset={() => setTime(0)}
        onSeek={(t) => setTime(clamp(t, 0, DURATION))}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}
