"use client";
import React from "react";
import { asset } from "@/lib/base";
import { fetchGamification } from "@/lib/admin-api";

/* ============================================================
   RapidRemove — Gamification "Löschungs-Liga"
   Portiert aus dem Claude-Design-Handoff (GamifyView/Parts/Data).
   Daten kommen live aus /admin/gamification (fetchGamification);
   ohne Backend wird auf Demo-Daten zurückgefallen.
   Styles: src/styles/gamify.css
   ============================================================ */

/* ---- Rang-Leiter: 10 Stufen (identisch zur Backend-Engine) ---- */
const RANKS = [
  { key: "frischling",   name: "Frischling",         emoji: "🥚",  min: 0 },
  { key: "putzkraft",    name: "Putzkraft",          emoji: "🧹",  min: 5 },
  { key: "saeuberer",    name: "Säuberer",           emoji: "🗑️", min: 15 },
  { key: "sternejaeger", name: "Sternejäger",        emoji: "⭐",  min: 30 },
  { key: "ritter",       name: "Reputations-Ritter", emoji: "🛡️", min: 50 },
  { key: "profi",        name: "Lösch-Profi",        emoji: "🔥",  min: 75 },
  { key: "meister",      name: "Lösch-Meister",      emoji: "👑",  min: 100 },
  { key: "grossmeister", name: "Großmeister",        emoji: "💎",  min: 175 },
  { key: "legende",      name: "Legende",            emoji: "🏆",  min: 300 },
  { key: "guldenkoenig", name: "Gulden-König",       emoji: "🪙",  min: 500 },
];
const rankByKey = (k) => RANKS.find((r) => r.key === k);

/* ---- Achievement-Katalog (nur für die Feier-Demo nötig) ---- */
const ACH = {
  fuenfzig: { emoji: "🎯", name: "Halbhundert", desc: "50 Löschungen erreicht" },
};

const SERVICE_LABEL = {
  remove:  { name: "Löschung", emoji: "🗑️" },
  reset:   { name: "Neustart", emoji: "♻️" },
  express: { name: "Express",  emoji: "⚡" },
  reviews: { name: "Review",   emoji: "⭐" },
};

/* ---- Helfer ---- */
function relTime(iso) {
  const then = new Date(iso), now = new Date();
  const mins = Math.round((now - then) / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return "vor " + mins + " Min.";
  const h = Math.round(mins / 60);
  if (h < 24) return "vor " + h + " Std.";
  const d = Math.round(h / 24);
  return d === 1 ? "gestern" : "vor " + d + " Tagen";
}
function clock(iso) {
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
/* unlockedAt kann ISO (Backend) oder schon "TT.MM.JJJJ" (Demo) sein. */
function fmtDate(v) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
    const d = new Date(v);
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
  }
  return v;
}
/* Umsatz/Volumen in € (de-DE, ohne Nachkommastellen). */
const money = (n) => Math.round(n || 0).toLocaleString("de-DE") + " €";

/* ---- Mini-Icon-Set (Lucide-Stil) ---- */
const GS = ({ size = 20, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);
const GIcon = {
  arrowLeft: (p) => <GS {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></GS>,
  x:       (p) => <GS {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></GS>,
  check:   (p) => <GS {...p}><polyline points="20 6 9 17 4 12" /></GS>,
  chevR:   (p) => <GS {...p}><polyline points="9 18 15 12 9 6" /></GS>,
  trophy:  (p) => <GS {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></GS>,
  swords:  (p) => <GS {...p}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" y1="19" x2="19" y2="13" /><line x1="16" y1="16" x2="20" y2="20" /><line x1="19" y1="21" x2="21" y2="19" /><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" /><line x1="5" y1="14" x2="9" y2="18" /><line x1="7" y1="17" x2="4" y2="20" /><line x1="3" y1="19" x2="5" y2="21" /></GS>,
  medal:   (p) => <GS {...p}><path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" /><path d="M11 12 5.12 2.2" /><path d="m13 12 5.88-9.8" /><path d="M8 7h8" /><circle cx="12" cy="17" r="5" /><path d="M12 18v-2h-.5" /></GS>,
};

/* ---- Fortschrittsbalken ---- */
function ProgressBar({ pct, who }) {
  return (
    <div className="progbar">
      <div className={"progbar-fill " + (who || "")} style={{ width: Math.max(3, Math.round(pct * 100)) + "%" }}></div>
    </div>
  );
}

/* ---- Achievement-Grid (kompakt oder groß) ---- */
function AchievementGrid({ achievements, large }) {
  return (
    <div className={"ach-grid" + (large ? " lg" : "")}>
      {achievements.map((a) => {
        const pct = Math.min(100, Math.round((a.have / a.need) * 100));
        return (
          <div key={a.key} className={"ach" + (large ? " lg" : "") + (a.unlocked ? " on" : " off")}
            title={a.unlocked ? a.name + " — freigeschaltet" : a.name + " — " + a.have + "/" + a.need}>
            {a.unlocked
              ? <span className="lock" style={{ color: "var(--gold)" }}><GIcon.check size={13} /></span>
              : <span className="lock">🔒</span>}
            <div className="em">{a.emoji}</div>
            <div className="an">{a.name}</div>
            <div className="ad">{a.desc}</div>
            {a.unlocked
              ? <div className="a-at">★ {fmtDate(a.unlockedAt)}</div>
              : (
                <div className="a-prog">
                  <div className="pbar"><i style={{ width: pct + "%" }}></i></div>
                  <div className="pn">{a.have}/{a.need}</div>
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- Head-to-Head ---- */
function HeadToHead({ h2h, people }) {
  const [scope, setScope] = React.useState("allTime");
  const [metric, setMetric] = React.useState("count"); // count | volume
  const scopes = [["allTime", "Allzeit"], ["month", "Monat"], ["week", "Woche"]];
  const isVol = metric === "volume";
  const data = (isVol && h2h.volume ? h2h.volume[scope] : h2h[scope]) || { max: 0, matthias: 0 };
  const max = Math.max(data.max, data.matthias, 1);
  const leader = data.max === data.matthias ? "tie" : (data.max > data.matthias ? "max" : "matthias");
  const lead = leader === "tie" ? null : people[leader];
  const diff = Math.abs(data.max - data.matthias);
  const fmt = (v) => (isVol ? money(v) : v);
  return (
    <div className={"h2h gm-rise" + (isVol ? " vol" : "")} style={{ animationDelay: ".12s" }}>
      <div className="h2h-head">
        <h2><GIcon.swords size={20} style={{ color: "var(--primary)" }} /> Head-to-Head</h2>
        <div className="h2h-ctrls">
          <div className="h2h-seg">
            <button className={metric === "count" ? "on" : ""} onClick={() => setMetric("count")}>Löschungen</button>
            <button className={metric === "volume" ? "on" : ""} onClick={() => setMetric("volume")}>Zahlungseingänge</button>
          </div>
          <div className="h2h-seg">
            {scopes.map(([id, lbl]) => (
              <button key={id} className={scope === id ? "on" : ""} onClick={() => setScope(id)}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="h2h-body">
        <div className={"h2h-winner" + (leader === "tie" ? " tie" : "")}>
          {leader === "tie"
            ? <span className="pill"><GIcon.swords size={15} /> Gleichstand — {fmt(data.max)} : {fmt(data.matthias)}</span>
            : <span className="pill"><span style={{ fontSize: 15 }}>👑</span> {lead.name} führt mit +{fmt(diff)}{isVol ? "" : (diff === 1 ? " Löschung" : " Löschungen")}</span>}
        </div>
        <div className="h2h-bars">
          {["max", "matthias"].map((id) => (
            <div key={id} className={"h2h-row " + id}>
              <div className="who"><img src={asset(people[id].img)} alt={people[id].name} />{people[id].name}</div>
              <div className="h2h-track"><div className={"h2h-fill " + id} style={{ width: Math.max(8, Math.round((data[id] / max) * 100)) + "%" }}></div></div>
              <div className="val">{fmt(data[id])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Reviews-Reiter: Head-to-Head (Erledigt / Netto-Erlös) ---- */
function ReviewsH2H({ h2h, people }) {
  const [scope, setScope] = React.useState("allTime");
  const [metric, setMetric] = React.useState("done"); // done | net
  const scopes = [["allTime", "Allzeit"], ["month", "Monat"], ["week", "Woche"]];
  const isNet = metric === "net";
  const data = (isNet && h2h.net ? h2h.net[scope] : h2h[scope]) || { max: 0, matthias: 0 };
  const max = Math.max(data.max, data.matthias, 1);
  const leader = data.max === data.matthias ? "tie" : (data.max > data.matthias ? "max" : "matthias");
  const lead = leader === "tie" ? null : people[leader];
  const diff = Math.abs(data.max - data.matthias);
  const fmt = (v) => (isNet ? money(v) : v);
  return (
    <div className={"h2h gm-rise" + (isNet ? " vol" : "")} style={{ animationDelay: ".12s" }}>
      <div className="h2h-head">
        <h2><GIcon.swords size={20} style={{ color: "var(--primary)" }} /> Head-to-Head · Reviews</h2>
        <div className="h2h-ctrls">
          <div className="h2h-seg">
            <button className={metric === "done" ? "on" : ""} onClick={() => setMetric("done")}>Erledigt</button>
            <button className={metric === "net" ? "on" : ""} onClick={() => setMetric("net")}>Netto-Erlös</button>
          </div>
          <div className="h2h-seg">
            {scopes.map(([id, lbl]) => (
              <button key={id} className={scope === id ? "on" : ""} onClick={() => setScope(id)}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="h2h-body">
        <div className={"h2h-winner" + (leader === "tie" ? " tie" : "")}>
          {leader === "tie"
            ? <span className="pill"><GIcon.swords size={15} /> Gleichstand — {fmt(data.max)} : {fmt(data.matthias)}</span>
            : <span className="pill"><span style={{ fontSize: 15 }}>👑</span> {lead.name} führt mit +{fmt(diff)}{isNet ? "" : (diff === 1 ? " Auftrag" : " Aufträge")}</span>}
        </div>
        <div className="h2h-bars">
          {["max", "matthias"].map((id) => (
            <div key={id} className={"h2h-row " + id}>
              <div className="who"><img src={asset(people[id].img)} alt={people[id].name} />{people[id].name}</div>
              <div className="h2h-track"><div className={"h2h-fill " + id} style={{ width: Math.max(8, Math.round((data[id] / max) * 100)) + "%" }}></div></div>
              <div className="val">{fmt(data[id])}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- Reviews-Reiter: letzte Bewertungs-Aufträge ---- */
function RvRecent({ recent }) {
  return (
    <div className="recent">
      {recent.map((r) => (
        <div key={r.id} className="rrow">
          <div className="ric">⭐</div>
          <div className="rmain">
            <div className="rco">{r.company || r.id}</div>
            <div className="rmeta">
              <span className="rsvc remove">{r.reviewCount} {r.reviewCount === 1 ? "Bewertung" : "Bewertungen"}</span>
              <span className={"rpay " + (r.paid ? "yes" : "no")}>{r.paid ? "✅ bezahlt" : (r.done ? "🗑️ erledigt" : "⏳ offen")}</span>
              <span>Netto {money(r.net)}</span>
              <span>· {r.id}</span>
            </div>
          </div>
          <div className="rtime">{relTime(r.at)}</div>
        </div>
      ))}
      {!recent.length && <div style={{ padding: "14px 4px", color: "var(--fg-muted)", fontWeight: 700, fontSize: 13.5 }}>Noch keine Bewertungs-Aufträge.</div>}
    </div>
  );
}

/* ---- Reviews-Reiter: Spieler-Karte ---- */
function ReviewsCard({ person: p, fee, isLeader, delay }) {
  const cls = p.id === "matthias" ? "mat" : "max";
  return (
    <div className={"pcard gm-rise " + cls} style={{ animationDelay: delay, cursor: "default" }}>
      <div className="pc-banner">
        {isLeader && <span className="pc-leader"><span className="crown">👑</span> Review-Führung</span>}
      </div>
      <div className="pc-ava-wrap">
        <img className="pc-ava" src={asset(p.img)} alt={p.name} />
        <span className="pc-count">{p.done}<span className="lbl">ERLEDIGT</span></span>
      </div>
      <div className="pc-body">
        <div className="pc-name">{p.name}</div>
        <div className="pc-full">{p.full}</div>

        {/* Netto: Bestellwert − Vergabe-Abzug, NUR echt bezahlte Aufträge */}
        <div className={"pc-vol " + cls}>
          <span className="pv-ic">💰</span>
          <span className="pv-val">{money(p.net)}</span>
          <span className="pv-lbl">Netto (−{fee} $/€ je Auftrag)</span>
        </div>

        <div className="pc-split">
          <div className="psp geloescht"><div className="psp-v">{p.orders}</div><div className="psp-l">⭐ Bestellungen</div></div>
          <div className="psp bezahlt"><div className="psp-v">{p.paidCount}</div><div className="psp-l">✅ Bezahlt</div></div>
        </div>

        <div className="pc-full" style={{ marginTop: 10, fontWeight: 700 }}>📝 {p.reviews} {p.reviews === 1 ? "Bewertung" : "Bewertungen"} eingereicht</div>

        <div className="pc-mini">
          <div className="mini"><div className="mv">{p.today}</div><div className="ml">Heute</div></div>
          <div className="mini"><div className="mv">{p.week}</div><div className="ml">Woche</div></div>
          <div className="mini"><div className="mv">{p.month}</div><div className="ml">Monat</div></div>
        </div>

        <div className="pc-vitrine">
          <div className="vit-head">
            <span className="vt">Letzte Aufträge</span>
            <span className="vc">{p.recent.length} zuletzt</span>
          </div>
          <RvRecent recent={p.recent} />
        </div>
      </div>
    </div>
  );
}

/* ---- Reviews-Reiter (eigener Tab): vergebene Bewertungs-Aufträge ---- */
function ReviewsLiga({ rv }) {
  if (!rv) {
    return <div className="gm-wrap"><div style={{ padding: 40, color: "var(--fg-muted)", fontWeight: 700 }}>Reviews-Daten kommen mit dem nächsten ops-Deploy.</div></div>;
  }
  const people = rv.people;
  return (
    <div className="gm-wrap">
      <div className="rvl-note">
        ⭐ <b>Bewertungs-Aufträge</b> — wir vergeben die Aufträge: je Bestellung gehen <b>{rv.fee} $/€</b> an die Vergabe.
        Die Liga zählt deshalb den <b>Netto-Erlös</b> (Bestellwert − {rv.fee}); der Kundenpreis bleibt 179 je Bewertung.
      </div>
      <div className="lb-grid">
        <ReviewsCard person={people.max} fee={rv.fee} isLeader={rv.h2h.leader === "max"} delay="0s" />
        <ReviewsCard person={people.matthias} fee={rv.fee} isLeader={rv.h2h.leader === "matthias"} delay=".08s" />
      </div>
      <ReviewsH2H h2h={rv.h2h} people={people} />
    </div>
  );
}

/* ---- Konfetti (CSS-Animation) ---- */
function Confetti({ run, count = 90 }) {
  const colors = ["#ff8000", "#ffba5e", "#2b7fff", "#16a34a", "#e8a13a", "#9b6dff", "#ff5d8f"];
  const pieces = React.useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      left: Math.random() * 100,
      bg: colors[i % colors.length],
      delay: Math.random() * 0.5,
      dur: 2.4 + Math.random() * 1.8,
      w: 6 + Math.random() * 7,
      h: 8 + Math.random() * 10,
      round: Math.random() > 0.7,
    })), [run]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!run) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{
          left: p.left + "%", background: p.bg, width: p.w + "px", height: p.h + "px",
          borderRadius: p.round ? "50%" : "2px", animationDelay: p.delay + "s", animationDuration: p.dur + "s",
        }}></i>
      ))}
    </div>
  );
}

/* ---- Feier-Overlay ---- */
function CelebrationOverlay({ data, onClose }) {
  const open = !!data;
  const [shown, setShown] = React.useState(0);
  React.useEffect(() => {
    if (!data) return;
    const target = data.count;
    setShown(Math.max(0, target - 1));
    const t = setTimeout(() => setShown(target), 420);
    return () => clearTimeout(t);
  }, [data]);

  if (!data) return <div className="cel-scrim"><div className="cel-card"></div></div>;
  const p = data.person;
  const svc = SERVICE_LABEL[data.service] || SERVICE_LABEL.remove;
  const rank = data.rankUp ? data.rankUp.to : p.rank;
  const idx = RANKS.findIndex((r) => r.key === rank.key);
  const nextRank = RANKS[idx + 1] || null;
  const span = nextRank ? nextRank.min - rank.min : 1;
  const into = data.count - rank.min;
  const prog = nextRank ? Math.max(0, Math.min(1, into / span)) : 1;
  const toNext = nextRank ? Math.max(0, nextRank.min - data.count) : 0;

  return (
    <div className={"cel-scrim" + (open ? " open" : "")} onClick={onClose}>
      <Confetti run={open} />
      <div className={"cel-card" + (p.id === "matthias" ? " mat" : "")} onClick={(e) => e.stopPropagation()}>
        <button className="cel-close" onClick={onClose} aria-label="Schließen"><GIcon.x /></button>
        <div className="cel-top"></div>
        <div className="cel-ava-wrap"><img className="cel-ava" src={asset(p.img)} alt={p.name} /></div>

        <div className="cel-glscht">🎉 Glöscht!</div>
        <div className="cel-title">GLÖSCHT von <b>{p.name}</b></div>
        <div className="cel-co">
          <span className="svc">{svc.emoji} {svc.name}</span> · {data.company}
        </div>

        <div className="cel-counter">
          <span className="hash">#</span>
          <span className="num">{shown}</span>
          <span className="lbl">Löschungen<br />gesamt</span>
        </div>

        <div className="cel-rank">
          <div className="cr-top">
            <span className="em">{rank.emoji}</span>
            <span>{rank.name}</span>
            <span className="lvl">Level {p.level + (data.rankUp ? 1 : 0)}</span>
          </div>
          <div className="cr-bar">
            <ProgressBar pct={prog} who={p.id === "matthias" ? "mat" : "max"} />
          </div>
          <div className="cr-meta">
            {nextRank ? <>Noch {toNext} bis {nextRank.emoji} {nextRank.name}</> : "Maximalrang erreicht 🪙"}
          </div>
        </div>

        {(data.rankUp || data.newAch) && (
          <div className="cel-bonus">
            {data.rankUp && (
              <div className="bonus rank">
                <span className="be">{data.rankUp.to.emoji}</span>
                <div className="bt">
                  <div className="b1">🏆 Neuer Rang!</div>
                  <div className="b2">{data.rankUp.to.name}</div>
                  <div className="b3">Aufgestiegen von {data.rankUp.from.emoji} {data.rankUp.from.name}</div>
                </div>
              </div>
            )}
            {data.newAch && (
              <div className="bonus ach">
                <span className="be">{data.newAch.emoji}</span>
                <div className="bt">
                  <div className="b1">🎖 Achievement freigeschaltet</div>
                  <div className="b2">{data.newAch.name}</div>
                  <div className="b3">{data.newAch.desc}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Spieler-Karte (Leaderboard) ---- */
function PersonCard({ person: p, isLeader, onOpen, delay }) {
  const cls = p.id === "matthias" ? "mat" : "max";
  const showcase = [...p.achievements].sort((a, b) => (b.unlocked - a.unlocked)).slice(0, 8);
  return (
    <div className={"pcard gm-rise " + cls} style={{ animationDelay: delay }} onClick={() => onOpen(p)}>
      <div className="pc-banner">
        {isLeader && <span className="pc-leader"><span className="crown">👑</span> Tabellenführer</span>}
      </div>
      <div className="pc-ava-wrap">
        <img className="pc-ava" src={asset(p.img)} alt={p.name} />
        <span className="pc-count">{p.count}<span className="lbl">GLÖSCHT</span></span>
      </div>
      <div className="pc-body">
        <div className="pc-name">{p.name}</div>
        <div className="pc-full">{p.full}</div>

        <div className="pc-rank">
          <span className="re">{p.rank.emoji}</span>
          <span className="rn">{p.rank.name}</span>
          <span className="lvl">Level {p.level}</span>
        </div>

        {/* Umsatz / Volumen — NUR echt bezahlte Aufträge */}
        <div className={"pc-vol " + cls}>
          <span className="pv-ic">💰</span>
          <span className="pv-val">{money(p.volume)}</span>
          <span className="pv-lbl">Zahlungseingänge</span>
        </div>

        {/* Aufteilung: gelöscht (treibt Level) vs. echt bezahlt (treibt Umsatz) */}
        <div className="pc-split">
          <div className="psp geloescht"><div className="psp-v">{p.count}</div><div className="psp-l">🗑️ Gelöscht</div></div>
          <div className="psp bezahlt"><div className="psp-v">{p.paidCount ?? 0}</div><div className="psp-l">✅ Bezahlt</div></div>
        </div>

        <div className="pc-prog">
          <div className="pp-top">
            <b>{p.count} Löschungen</b>
            {p.next
              ? <span className="nx">noch <b style={{ margin: "0 3px" }}>{p.toNext}</b> bis {p.next.emoji} {p.next.name}</span>
              : <span className="nx">Maximalrang 🪙</span>}
          </div>
          <ProgressBar pct={p.progress} who={cls} />
        </div>

        <div className="pc-mini">
          <div className="mini"><div className="mv">{p.today}</div><div className="ml">Heute</div></div>
          <div className="mini"><div className="mv">{p.week}</div><div className="ml">Woche</div></div>
          <div className="mini"><div className="mv">{p.month}</div><div className="ml">Monat</div></div>
        </div>

        <div className="pc-vitrine">
          <div className="vit-head">
            <span className="vt">Achievements</span>
            <span className="vc">{p.unlockedCount}/{p.achievements.length} freigeschaltet</span>
          </div>
          <AchievementGrid achievements={showcase} />
        </div>

        <button className="btn btn-sec btn-sm" style={{ marginTop: 18, width: "100%", justifyContent: "center" }}
          onClick={(e) => { e.stopPropagation(); onOpen(p); }}>
          Profil ansehen <GIcon.chevR size={15} />
        </button>
      </div>
    </div>
  );
}

/* ---- Leaderboard / Team-Ansicht ---- */
function Leaderboard({ people, h2h, onOpen }) {
  return (
    <div className="gm-wrap">
      <div className="lb-grid">
        <PersonCard person={people.max} isLeader={h2h.leader === "max"} onOpen={onOpen} delay="0s" />
        <PersonCard person={people.matthias} isLeader={h2h.leader === "matthias"} onOpen={onOpen} delay=".08s" />
      </div>
      <HeadToHead h2h={h2h} people={people} />
    </div>
  );
}

/* ---- Rang-Leiter (alle 10 Stufen) ---- */
function RankLadder({ person: p }) {
  return (
    <div className="ladder">
      {RANKS.map((r) => {
        const current = r.key === p.rank.key;
        const cls = current ? "current" : (p.count >= r.min ? "done" : "future");
        return (
          <div key={r.key} className={"lstep " + cls}>
            <div className="lrail"></div>
            <div className="lbadge">{r.emoji}</div>
            <div className="lbody">
              <div className="ln">{r.name}{current && <span className="now">Aktuell</span>}</div>
              <div className="lm">ab {r.min} Löschungen</div>
            </div>
            {p.count >= r.min && !current && <span className="lcheck"><GIcon.check size={20} /></span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---- Letzte Löschungen ---- */
function RecentList({ recent }) {
  return (
    <div className="recent">
      {recent.map((r) => {
        const svc = SERVICE_LABEL[r.service] || SERVICE_LABEL.remove;
        return (
          <div key={r.id} className="rrow">
            <div className="ric">{svc.emoji}</div>
            <div className="rmain">
              <div className="rco">{r.company}</div>
              <div className="rmeta">
                <span className={"rsvc " + r.service}>{svc.name}</span>
                <span className={"rpay " + (r.paid ? "yes" : "no")}>{r.paid ? "✅ bezahlt" : "⏳ offen"}</span>
                <span>{r.id}</span>
                <span>· {clock(r.at)} Uhr</span>
              </div>
            </div>
            <div className="rtime">{relTime(r.at)}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Person-Profil ---- */
function PersonProfile({ person: p, onBack }) {
  const cls = p.id === "matthias" ? "mat" : "max";
  return (
    <div className="gm-wrap">
      <button className="pp-back" onClick={onBack}><GIcon.arrowLeft /> Zurück zur Liga</button>

      <div className={"pp-hero gm-rise " + cls}>
        <div className="pp-banner"></div>
        <div className="pp-hero-body">
          <div className="pp-ava-wrap">
            <img className="pp-ava" src={asset(p.img)} alt={p.name} />
            <span className="pp-count">{p.count}</span>
          </div>
          <div className="pp-id">
            <div className="nm">{p.name}</div>
            <div className="fl">{p.full}</div>
            <div className="rk"><span className="em">{p.rank.emoji}</span> {p.rank.name} <span className="lvl">Level {p.level}</span></div>
            <div className="pp-vol">💰 {money(p.volume)} <span>Zahlungseingänge</span></div>
            <div className="pp-split">
              <span className="pps geloescht">🗑️ {p.count} Gelöscht</span>
              <span className="pps bezahlt">✅ {p.paidCount ?? 0} Bezahlt</span>
            </div>
          </div>
          <div className="pp-hero-prog">
            <div className="pp-top" style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "var(--fg-2)", marginBottom: 8 }}>
              <span><b style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>{p.count}</b> Löschungen</span>
              {p.next
                ? <span>noch <b style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}>{p.toNext}</b> bis {p.next.emoji} {p.next.name}</span>
                : <span>Maximalrang 🪙</span>}
            </div>
            <ProgressBar pct={p.progress} who={cls} />
          </div>
        </div>
      </div>

      <div className="pp-grid">
        <div className="pp-col">
          <div className="pp-card">
            <div className="pp-h">
              <GIcon.medal size={18} style={{ color: "var(--primary)" }} />
              <h3>Achievements</h3>
              <span className="cnt">{p.unlockedCount}/{p.achievements.length} freigeschaltet</span>
            </div>
            <div className="pp-in"><AchievementGrid achievements={p.achievements} large /></div>
          </div>

          <div className="pp-card">
            <div className="pp-h">
              <span style={{ fontSize: 18 }}>🗑️</span>
              <h3>Letzte Löschungen</h3>
              <span className="cnt">{p.recent.length} zuletzt</span>
            </div>
            <div className="pp-in" style={{ paddingTop: 4, paddingBottom: 6 }}><RecentList recent={p.recent} /></div>
          </div>
        </div>

        <div className="pp-col">
          <div className="pp-card">
            <div className="pp-h">
              <GIcon.trophy size={18} style={{ color: "var(--primary)" }} />
              <h3>Rang-Leiter</h3>
              <span className="cnt">{RANKS.findIndex((r) => r.key === p.rank.key) + 1}/10</span>
            </div>
            <div className="pp-in"><RankLadder person={p} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Demo-Daten (Fallback, falls kein ops-Backend / keine DB)
   ============================================================ */
function mkAch(key, name, emoji, desc, o = {}) {
  return { key, name, emoji, desc, unlocked: !!o.unlocked, unlockedAt: o.unlockedAt || null, have: o.have || 0, need: o.need || 1 };
}
const DEMO = {
  people: {
    max: {
      id: "max", name: "Max", full: "Maximilian Hölzl", img: "/assets/maximilian-hoelzl.jpg",
      count: 52, paidCount: 47, rank: rankByKey("ritter"), next: rankByKey("profi"), toNext: 23, progress: 0.08, level: 5,
      today: 2, week: 9, month: 21, paidToday: 1, paidWeek: 7, paidMonth: 18, unlockedCount: 10,
      volume: 24180, volumeToday: 900, volumeWeek: 4150, volumeMonth: 9870,
      achievements: [
        mkAch("blut", "Erstes Blut", "🩸", "Erste abgeschlossene Löschung", { unlocked: true, unlockedAt: "12.02.2026", have: 52, need: 1 }),
        mkAch("zehn", "Zweistellig", "🔟", "10 Löschungen erreicht", { unlocked: true, unlockedAt: "03.03.2026", have: 52, need: 10 }),
        mkAch("fuenfzig", "Halbhundert", "🎯", "50 Löschungen erreicht", { unlocked: true, unlockedAt: "19.06.2026", have: 52, need: 50 }),
        mkAch("blitz", "Blitz-Löscher", "⚡", "10 Express-Aufträge erledigt", { unlocked: true, unlockedAt: "28.05.2026", have: 12, need: 10 }),
        mkAch("welt", "Weltenbummler", "🌍", "Löschungen in 3 Ländern", { unlocked: true, unlockedAt: "14.04.2026", have: 5, need: 3 }),
        mkAch("grosswild", "Großwild", "💰", "Auftrag ab 800 €", { unlocked: true, unlockedAt: "21.05.2026", have: 4, need: 1 }),
        mkAch("frueh", "Frühschicht", "🌅", "Löschung vor 08:00 Uhr", { unlocked: true, unlockedAt: "07.05.2026", have: 1, need: 1 }),
        mkAch("nacht", "Nachteule", "🦉", "Löschung nach 22:00 Uhr", { unlocked: true, unlockedAt: "02.06.2026", have: 1, need: 1 }),
        mkAch("wochenend", "Wochenend-Krieger", "📅", "Löschung am Wochenende", { unlocked: true, unlockedAt: "10.05.2026", have: 1, need: 1 }),
        mkAch("highscore", "Tages-Highscore", "🚀", "5 Löschungen an einem Tag", { unlocked: true, unlockedAt: "16.06.2026", have: 6, need: 5 }),
        mkAch("hundert", "Hunderter-Club", "💯", "100 Löschungen erreicht", { have: 52, need: 100 }),
        mkAch("gulden", "Gulden-Regen", "🪙", "500 Löschungen erreicht", { have: 52, need: 500 }),
        mkAch("neustart", "Neustart-Architekt", "♻️", "10 Reset-Aufträge erledigt", { have: 7, need: 10 }),
        mkAch("serie", "Serien-Täter", "🔥", "5 Tage in Folge gelöscht", { have: 4, need: 5 }),
      ],
      recent: [
        { id: "RR-2041", company: "Zahnarztpraxis Dr. Berger", service: "reset", at: "2026-06-22T14:10:00Z", paid: true },
        { id: "RR-2038", company: "Autohaus Wagner GmbH", service: "express", at: "2026-06-22T09:02:00Z", paid: true },
        { id: "RR-2034", company: "Salon Schmidt", service: "remove", at: "2026-06-21T18:40:00Z", paid: false },
        { id: "RR-2029", company: "Café Morgentau", service: "remove", at: "2026-06-20T11:25:00Z", paid: true },
        { id: "RR-2024", company: "Fitness Forum Linz", service: "express", at: "2026-06-19T07:48:00Z", paid: true },
        { id: "RR-2019", company: "Immobilien Gruber KG", service: "remove", at: "2026-06-18T16:05:00Z", paid: true },
      ],
    },
    matthias: {
      id: "matthias", name: "Matthias", full: "Matthias Lang", img: "/assets/matthias-lang.webp",
      count: 38, paidCount: 33, rank: rankByKey("sternejaeger"), next: rankByKey("ritter"), toNext: 12, progress: 0.40, level: 4,
      today: 1, week: 6, month: 15, paidToday: 1, paidWeek: 5, paidMonth: 12, unlockedCount: 7,
      volume: 16740, volumeToday: 450, volumeWeek: 2640, volumeMonth: 6480,
      achievements: [
        mkAch("blut", "Erstes Blut", "🩸", "Erste abgeschlossene Löschung", { unlocked: true, unlockedAt: "28.02.2026", have: 38, need: 1 }),
        mkAch("zehn", "Zweistellig", "🔟", "10 Löschungen erreicht", { unlocked: true, unlockedAt: "21.03.2026", have: 38, need: 10 }),
        mkAch("welt", "Weltenbummler", "🌍", "Löschungen in 3 Ländern", { unlocked: true, unlockedAt: "30.04.2026", have: 3, need: 3 }),
        mkAch("grosswild", "Großwild", "💰", "Auftrag ab 800 €", { unlocked: true, unlockedAt: "11.05.2026", have: 2, need: 1 }),
        mkAch("nacht", "Nachteule", "🦉", "Löschung nach 22:00 Uhr", { unlocked: true, unlockedAt: "18.05.2026", have: 1, need: 1 }),
        mkAch("wochenend", "Wochenend-Krieger", "📅", "Löschung am Wochenende", { unlocked: true, unlockedAt: "24.05.2026", have: 1, need: 1 }),
        mkAch("serie", "Serien-Täter", "🔥", "5 Tage in Folge gelöscht", { unlocked: true, unlockedAt: "12.06.2026", have: 6, need: 5 }),
        mkAch("fuenfzig", "Halbhundert", "🎯", "50 Löschungen erreicht", { have: 38, need: 50 }),
        mkAch("hundert", "Hunderter-Club", "💯", "100 Löschungen erreicht", { have: 38, need: 100 }),
        mkAch("gulden", "Gulden-Regen", "🪙", "500 Löschungen erreicht", { have: 38, need: 500 }),
        mkAch("blitz", "Blitz-Löscher", "⚡", "10 Express-Aufträge erledigt", { have: 6, need: 10 }),
        mkAch("neustart", "Neustart-Architekt", "♻️", "10 Reset-Aufträge erledigt", { have: 4, need: 10 }),
        mkAch("frueh", "Frühschicht", "🌅", "Löschung vor 08:00 Uhr", { have: 0, need: 1 }),
        mkAch("highscore", "Tages-Highscore", "🚀", "5 Löschungen an einem Tag", { have: 3, need: 5 }),
      ],
      recent: [
        { id: "RR-2040", company: "Pizzeria Bella Vita", service: "remove", at: "2026-06-22T13:20:00Z", paid: true },
        { id: "RR-2035", company: "Kanzlei Hofer & Partner", service: "reset", at: "2026-06-21T15:55:00Z", paid: true },
        { id: "RR-2031", company: "Elektro Steiner GmbH", service: "remove", at: "2026-06-20T10:12:00Z", paid: false },
        { id: "RR-2027", company: "Hotel Alpenblick", service: "express", at: "2026-06-19T22:30:00Z", paid: true },
        { id: "RR-2022", company: "Bäckerei Sonnberg", service: "remove", at: "2026-06-17T09:40:00Z", paid: true },
        { id: "RR-2016", company: "Tierarztpraxis Dr. Reiter", service: "reset", at: "2026-06-15T14:00:00Z", paid: true },
      ],
    },
  },
  h2h: {
    allTime: { max: 52, matthias: 38 }, week: { max: 9, matthias: 6 }, month: { max: 21, matthias: 15 },
    volume: { allTime: { max: 24180, matthias: 16740 }, week: { max: 4150, matthias: 2640 }, month: { max: 9870, matthias: 6480 } },
    leader: "max",
  },
  /* Reviews-Reiter: vergebene Bewertungs-Aufträge, Netto = Bestellwert − 50. */
  reviews: {
    fee: 50,
    people: {
      max: {
        id: "max", name: "Max", full: "Maximilian Hölzl", img: "/assets/maximilian-hoelzl.jpg",
        orders: 6, done: 4, paidCount: 3, reviews: 11, net: 1287, today: 1, week: 3, month: 4,
        recent: [
          { id: "RR-2044", company: "Town & Country Landscaping", at: "2026-08-25T15:20:00Z", done: true, paid: true, reviewCount: 3, net: 487 },
          { id: "RR-2042", company: "Miller's Diner", at: "2026-08-24T10:05:00Z", done: true, paid: true, reviewCount: 1, net: 129 },
          { id: "RR-2039", company: "Sunrise Dental", at: "2026-08-22T09:15:00Z", done: false, paid: false, reviewCount: 2, net: 308 },
        ],
      },
      matthias: {
        id: "matthias", name: "Matthias", full: "Matthias Lang", img: "/assets/matthias-lang.webp",
        orders: 3, done: 2, paidCount: 2, reviews: 5, net: 616, today: 0, week: 1, month: 2,
        recent: [
          { id: "RR-2043", company: "Bella Vita Ristorante", at: "2026-08-25T11:40:00Z", done: true, paid: true, reviewCount: 2, net: 308 },
          { id: "RR-2036", company: "Nordic Bikes AB", at: "2026-08-21T14:00:00Z", done: true, paid: true, reviewCount: 2, net: 308 },
        ],
      },
    },
    h2h: {
      allTime: { max: 4, matthias: 2 }, week: { max: 3, matthias: 1 }, month: { max: 4, matthias: 2 },
      net: { allTime: { max: 1287, matthias: 616 }, week: { max: 616, matthias: 308 }, month: { max: 1287, matthias: 616 } },
      leader: "max",
    },
  },
};

/* ============================================================
   GamifyLiga — Liga-Ansicht fürs Admin-Portal.
   Lädt Live-Daten via fetchGamification(); Fallback = Demo-Daten.
   ============================================================ */
export function GamifyLiga() {
  const [data, setData] = React.useState(null);   // { people:{max,matthias}, h2h }
  const [live, setLive] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState("leaderboard"); // leaderboard | profile
  const [activeId, setActiveId] = React.useState(null);
  const [cel, setCel] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    // Live-ReviewsBoard (people als Array) auf die Ansichts-Form {fee, people:{max,matthias}, h2h} bringen.
    const normReviews = (b) => {
      if (!b) return null;
      if (!Array.isArray(b.people)) return b; // schon in Demo-/Ansichts-Form
      const byId = {};
      b.people.forEach((p) => { byId[p.id] = p; });
      return byId.max && byId.matthias ? { fee: b.fee, people: byId, h2h: b.headToHead } : null;
    };
    fetchGamification()
      .then((board) => {
        if (!alive) return;
        const byId = {};
        (board && board.people ? board.people : []).forEach((p) => { byId[p.id] = p; });
        if (byId.max && byId.matthias) {
          setData({ people: { max: byId.max, matthias: byId.matthias }, h2h: board.headToHead, reviews: normReviews(board.reviews) });
          setLive(true);
        } else {
          setData(DEMO);
        }
      })
      .catch(() => { if (alive) setData(DEMO); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading || !data) {
    return <div className="gm-wrap"><div style={{ padding: 40, color: "var(--fg-muted)", fontWeight: 700 }}>Löschungs-Liga lädt…</div></div>;
  }

  const people = data.people;
  const openProfile = (p) => { setActiveId(p.id); setView("profile"); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); };
  const backToLeague = () => { setView("leaderboard"); setActiveId(null); };

  // Feier-Demos
  const demoNormal = () => setCel({ person: people.max, count: people.max.count + 1, service: "remove", company: "Blumen Hofer e.U.", rankUp: null, newAch: null });
  const demoBig = () => setCel({
    person: people.matthias, count: 50, service: "express", company: "Hotel Alpenblick GmbH",
    rankUp: { from: rankByKey("sternejaeger"), to: rankByKey("ritter") },
    newAch: { emoji: ACH.fuenfzig.emoji, name: ACH.fuenfzig.name, desc: ACH.fuenfzig.desc },
  });

  return (
    <React.Fragment>
      <div className="gm-wrap" style={{ paddingBottom: 0 }}>
        <div className="gm-toolbar">
          <div className="gm-tabs">
            <button className={"gm-tab" + (view === "leaderboard" ? " on" : "")} onClick={backToLeague}>
              <GIcon.trophy size={17} /> Team-Liga
            </button>
            <button className={"gm-tab" + (view === "reviews" ? " on" : "")}
              onClick={() => { setView("reviews"); setActiveId(null); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); }}>
              <span style={{ fontSize: 15, lineHeight: 1 }}>⭐</span> Reviews
            </button>
            {["max", "matthias"].map((id) => (
              <button key={id} className={"gm-tab" + (view === "profile" && activeId === id ? " on" : "")}
                onClick={() => openProfile(people[id])}>
                <img className="av" src={asset(people[id].img)} alt="" /> {people[id].name}
              </button>
            ))}
          </div>
          <div className="gm-demo">
            {!live && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--fg-muted)", alignSelf: "center" }}>Demo-Daten</span>}
            <button className="btn-feier" onClick={demoNormal}>🎉 Feier-Demo</button>
            <button className="btn-feier alt" onClick={demoBig}>🏆 Demo: Rang-Aufstieg</button>
          </div>
        </div>
      </div>

      {view === "leaderboard"
        ? <Leaderboard people={people} h2h={data.h2h} onOpen={openProfile} />
        : view === "reviews"
          ? <ReviewsLiga rv={data.reviews} />
          : <PersonProfile person={people[activeId]} onBack={backToLeague} />}

      <CelebrationOverlay data={cel} onClose={() => setCel(null)} />
    </React.Fragment>
  );
}

export default GamifyLiga;
