"use client";
/* Reputations-Dashboard (Vorschau) — Startseite „Home“ ohne Score.
   Nur Design, noch ohne Funktion; sichtbar nur für Konten in REP_PREVIEW. */
import React from "react";
import { ChevronDown, ArrowRight, ArrowDown, Trash2, Lock } from "lucide-react";

export const REP_PREVIEW = ["maximilian@hoelzl.investments"];
export const isRepPreview = (email) => REP_PREVIEW.includes(String(email || "").trim().toLowerCase());

export function RepSwitch({ name, onClick }) {
  return (
    <button type="button" className="rep-sw" onClick={onClick}>
      <span className="rep-sw-q">?</span>
      <span className="rep-sw-n">{name}</span>
      <ChevronDown />
    </button>
  );
}

export function RepHero({ onScan }) {
  return (
    <div className="hero rep-hero">
      <span className="hero-img rep-ring" aria-hidden="true">
        <svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="23" fill="none" stroke="#3a3a3a" strokeWidth="4.5" strokeDasharray="3 4" /></svg>
        <i>?</i>
      </span>
      <div className="k">Reputations-Score</div>
      <div className="v rep-v">Erfahren Sie mehr über Ihre Online-Reputation</div>
      <div className="s">In 2 Minuten sehen Sie, was Kunden über Sie finden: bei Google, in KIs, Foren und Presse.</div>
      <div className="row rep-row">
        <button type="button" className="pill-btn" onClick={onScan}>Jetzt kostenlos scannen<ArrowRight /></button>
        <span className="rep-note">Erster Scan gratis · nur öffentliche Infos</span>
      </div>
    </div>
  );
}

/* Analytischer Hintergrund (unscharf) + Schloss — reiner Teaser, kein Button */
const PTS = [0.62, 0.55, 0.58, 0.47, 0.5, 0.38, 0.42, 0.3, 0.33, 0.22];
function TeaserChart() {
  const w = 600, h = 260, top = 78, ch = h - top - 44, left = 34, cw = w - left - 12;
  const xy = PTS.map((v, i) => [left + (i * cw) / 9, top + v * ch]);
  const xy2 = PTS.map((v, i) => [left + (i * cw) / 9, top + Math.min(v + 0.12, 0.95) * ch]);
  const pl = (a) => a.map(([x, y]) => x.toFixed(1) + "," + y.toFixed(1)).join(" ");
  const area = `M${xy[0][0]},${top + ch} L` + xy.map(([x, y]) => x.toFixed(1) + "," + y.toFixed(1)).join(" L") + ` L${xy[9][0]},${top + ch} Z`;
  const kw = (w - 24 - 16) / 3;
  return (
    <svg className="rep-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="repg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8000" stopOpacity=".28" /><stop offset="1" stopColor="#ff8000" stopOpacity="0" /></linearGradient><filter id="repb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.5" /></filter></defs>
      <g filter="url(#repb)">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={12 + i * (kw + 8)} y="10" width={kw} height="54" rx="12" fill="#fff" />
          <rect x={24 + i * (kw + 8)} y="20" width={kw * 0.45} height="7" rx="3.5" fill="#d9d9d9" />
          <rect x={24 + i * (kw + 8)} y="34" width={kw * 0.6} height="16" rx="5" fill={["#111", "#16a34a", "#e23b3b"][i]} opacity=".55" />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <line x1={left} x2={w - 12} y1={top + (k * ch) / 4} y2={top + (k * ch) / 4} stroke="#e2e2e2" />
          <rect x="8" y={top + (k * ch) / 4 - 4} width="18" height="7" rx="3.5" fill="#dadada" />
        </g>
      ))}
      <path d={area} fill="url(#repg)" />
      <polyline points={pl(xy2)} fill="none" stroke="#bdbdbd" strokeWidth="2" strokeDasharray="5 5" />
      <polyline points={pl(xy)} fill="none" stroke="#ff8000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 3, 6, 9].map((i) => <circle key={i} cx={xy[i][0]} cy={xy[i][1]} r="3.5" fill="#fff" stroke="#ff8000" strokeWidth="2.5" />)}
      {[0, 3, 6, 9].map((i) => <rect key={"x" + i} x={left + (i * cw) / 9 - 9} y={top + ch + 12} width="18" height="7" rx="3.5" fill="#dadada" />)}
      </g>
    </svg>
  );
}

export function RepTeaser() {
  return (
    <div className="rep-teaser">
      <TeaserChart />
      <div className="rep-ov">
        <div>
          <span className="rep-lock"><Lock /></span>
          <b>Noch kein Scan erfolgt</b>
          <span>Score-Verlauf, Rote Flaggen und Vergleich zum Vormonat erscheinen nach dem ersten Scan.</span>
        </div>
      </div>
    </div>
  );
}

const SVC = [
  { I: ArrowDown, c: "#2b7fff", t: "Suchergebnisse verdrängen", s: "Negative Artikel und Einträge von Seite 1 nach hinten schieben.", p: "Auf Anfrage" },
  { I: Trash2, c: "#ff8000", t: "Google Business Profil löschen", s: "Altes oder falsches Profil komplett entfernen.", p: "Festpreis" },
];
export function RepServices({ onClick }) {
  return (
    <div className="rep-svc">
      {SVC.map((x) => (
        <button key={x.t} type="button" className="rep-svc-c" onClick={onClick}>
          <span className="rep-svc-i" style={{ color: x.c }}><x.I /></span>
          <b>{x.t}</b>
          <span>{x.s}</span>
          <em>{x.p}</em>
        </button>
      ))}
    </div>
  );
}
