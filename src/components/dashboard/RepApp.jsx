"use client";
/* Reputations-Score im Kundenportal (Vorschau, nur Konten in REP_PREVIEW).
   Daten: ops /cust/rep/* (Scan läuft im Hintergrund, hier wird gepollt). */
import React from "react";
import { ArrowRight, ArrowLeft, ChevronRight, ChevronUp, ChevronDown, Search, Loader, Plus, Flag, MessageCircle, Sparkles, Globe, Users, Newspaper, Star, ExternalLink, RefreshCw, X } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const monthOf = (iso) => { try { return MONTHS[new Date(iso).getMonth()]; } catch (e) { return ""; } };
const dateOf = (iso) => { try { const d = new Date(iso); return d.getDate() + ". " + MONTHS[d.getMonth()]; } catch (e) { return ""; } };
/* Überall: Negatives zuerst, Positives zuletzt (innerhalb einer Gruppe bleibt die Reihenfolge, z. B. Google-Platz) */
const RANK = { neg: 0, none: 1, neu: 2, other: 3, pos: 4 };
const worstFirst = (list, f = (x) => x.sent) => list.map((x, i) => [x, i]).sort((a, b) => (RANK[f(a[0])] ?? 2) - (RANK[f(b[0])] ?? 2) || a[1] - b[1]).map((x) => x[0]);
const COLORS = { Gut: "#16a34a", Mittel: "#d97706", Achtung: "#e23b3b" };
const BAR = (v) => (v >= 7.5 ? "#16a34a" : v >= 5 ? "#f59e0b" : "#e23b3b");

/* ---------------- Daten ---------------- */
export function useRep(token, enabled, call) {
  const [st, setSt] = React.useState({ loading: true, enabled: false, locations: [] });
  const load = React.useCallback(async () => {
    if (!token || !enabled) return;
    try { const r = await call("rep/state", { token }); setSt({ loading: false, enabled: !!r.enabled, locations: r.locations || [], keys: r.keys || {} }); }
    catch (e) { setSt((s) => ({ ...s, loading: false })); }
  }, [token, enabled, call]);
  React.useEffect(() => { load(); }, [load]);
  const running = st.locations.some((l) => l.scan && l.scan.status === "running");
  const kiPending = st.locations.some((l) => l.latest && l.latest.kiPending);
  React.useEffect(() => {
    if (!running && !kiPending) return undefined;
    const t = setInterval(load, running ? 2000 : 4000);
    return () => clearInterval(t);
  }, [running, kiPending, load]);
  const scan = React.useCallback(async (body) => { const r = await call("rep/scan", { token, ...body }); await load(); return r; }, [token, call, load]);
  const request = React.useCallback((locationId, action) => call("rep/request", { token, locationId, action }), [token, call]);
  const search = React.useCallback((q) => call("rep/search", { token, q }), [token, call]);
  return { ...st, running, reload: load, scan, request, search };
}

/* ---------------- Bausteine ---------------- */
function Ring({ score, potential, size = 200, stroke = 4.5, uid = "rr" }) {
  return (
    <div className="rp-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <defs><linearGradient id={uid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb547" /><stop offset="1" stopColor="#ff4d2e" /></linearGradient></defs>
        <circle cx="28" cy="28" r="24" fill="none" stroke="#ffe7d1" strokeWidth={stroke} />
        {potential > score ? <circle cx="28" cy="28" r="24" fill="none" stroke="#ffc48f" strokeWidth={stroke} pathLength="100" strokeDasharray={`0 ${score} ${potential - score} 100`} strokeLinecap="round" opacity=".7" /> : null}
        <circle className="rp-fill" cx="28" cy="28" r="24" fill="none" stroke={`url(#${uid})`} strokeWidth={stroke} strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.max(0.5, score)} 100`} style={{ "--s": score }} />
      </svg>
    </div>
  );
}
function Delta({ now, prev, prevAt, light }) {
  if (prev == null) return <span className={"rp-delta n" + (light ? " l" : "")}>Erster Scan</span>;
  const d = now - prev;
  if (!d) return <span className={"rp-delta n" + (light ? " l" : "")}>unverändert seit {monthOf(prevAt)}</span>;
  return <span className={"rp-delta " + (d > 0 ? "up" : "dn") + (light ? " l" : "")}>{d > 0 ? <ChevronUp /> : <ChevronDown />}{Math.abs(d)} {Math.abs(d) === 1 ? "Punkt" : "Punkte"} seit {monthOf(prevAt)}</span>;
}

/* Startseite: Score-Karte (Variante B) */
export function RepScoreCard({ loc, onOpen }) {
  const r = loc.latest;
  return (
    <button type="button" className="rp-card" onClick={onOpen}>
      <div className="rp-card-ring">
        <span className="rp-k rp-k-m">Ihr Reputations-Score</span>
        <div className="rp-ringwrap">
          <Ring score={r.score} potential={r.potential} uid={"rc" + loc.id} />
          <div className="rp-ringc"><b>{r.score}</b><span>{r.tier}</span></div>
        </div>
      </div>
      <div className="rp-card-txt">
        <span className="rp-k rp-k-d">Ihr Reputations-Score</span>
        <b className="rp-card-h">{r.tier}{r.potential > r.score ? " – mit Luft nach oben" : ""}</b>
        <Delta now={r.score} prev={loc.prevScore} prevAt={loc.prevAt} />
        {r.potential > r.score ? <span className="rp-card-p">Noch <b>{r.potential - r.score} Punkte</b> Potenzial – wir zeigen Ihnen, wie.</span> : <span className="rp-card-p">Sehr stark – wir passen auf, dass es so bleibt.</span>}
        <span className="rp-btn">{r.potential > r.score ? `So kommen Sie auf ${r.potential}` : "Details ansehen"}<ArrowRight /></span>
      </div>
    </button>
  );
}

/* Scan läuft – lebendige Animation: Ring mit Komet + Radar, Prozent zählt weich, Schritte haken sich ab */
const STEPS = [
  { at: 50, t: "Google-Suche, Seite 1–5", I: Search },
  { at: 60, t: "Google-Vorschläge & Bing", I: Globe },
  { at: 64, t: "Presse & News", I: Newspaper },
  { at: 70, t: "Bewertungen", I: Star },
  { at: 78, t: "Website & Social Media", I: Users },
  { at: 86, t: "ChatGPT & Co.", I: Sparkles },
  { at: 100, t: "Auswertung & Score", I: Flag },
];
const FLOAT = ["google.at", "bing.com", "herold.at", "facebook.com", "news", "instagram.com", "jameda", "reddit", "ChatGPT", "trustpilot"];
function useSmooth(target) {
  const [v, setV] = React.useState(target);
  const cur = React.useRef(target);
  React.useEffect(() => {
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      let c = cur.current;
      if (c < target) c = Math.min(target, c + Math.max(4 * dt, (target - c) * 2.5 * dt));
      else c = Math.min(c + 0.4 * dt, target + 7, 99); // zwischen zwei Abfragen langsam weiterkriechen
      cur.current = c; setV(c);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
export function RepFailed({ loc, rep, showToast }) {
  const [busy, setBusy] = React.useState(false);
  return (
    <div className="rp-mini-scan rp-failed" role="status">
      <span className="rp-fail-i">!</span>
      <div className="rp-ms-t">
        <span className="rp-ms-k">{loc.name}</span>
        <b className="rp-fail-t">Scan wurde unterbrochen</b>
        <span className="rp-fail-s">{/Suchdienst/.test(String(loc.scan && loc.scan.error || "")) ? "Gerade nicht möglich – bitte später noch einmal." : "Bitte einfach neu starten – dauert 3–5 Minuten."}</span>
      </div>
      <button type="button" className="rp-mini" disabled={busy} onClick={async () => { setBusy(true); try { await rep.scan({ locationId: loc.id }); } catch (e) { showToast("Scan konnte nicht gestartet werden", true); } setBusy(false); }}>{busy ? <Loader className="spin" /> : "Neu starten"}</button>
    </div>
  );
}
export function RepRunning({ loc }) {
  const target = Math.max(2, Math.min(99, loc.scan.progress || 0));
  const p = useSmooth(target);
  const active = STEPS.findIndex((x) => target < x.at);
  const cur = STEPS[active === -1 ? STEPS.length - 1 : active];
  return (
    <div className="rp-mini-scan" role="status" aria-live="polite">
      <div className="rp-ms-ring" aria-hidden="true">
        <svg viewBox="0 0 56 56" className="rp-ms-p">
          <defs><linearGradient id={"msg" + loc.id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb547" /><stop offset="1" stopColor="#ff4d2e" /></linearGradient></defs>
          <circle cx="28" cy="28" r="23" fill="none" stroke="#ffe7d1" strokeWidth="6" />
          <circle cx="28" cy="28" r="23" fill="none" stroke={`url(#msg${loc.id})`} strokeWidth="6" strokeLinecap="round" pathLength="100" strokeDasharray={`${p} 100`} />
        </svg>
        <svg viewBox="0 0 56 56" className="rp-ms-dot"><circle cx="51" cy="28" r="2.4" fill="#fff" /><circle cx="51" cy="28" r="1.2" fill="#ff8000" /></svg>
        <b><span>{Math.floor(p)}<small>%</small></span></b>
      </div>
      <div className="rp-ms-t">
        <span className="rp-ms-k">Wir prüfen · {loc.name}</span>
        <b className="rp-ms-step" key={loc.scan.step || cur.t}>{loc.scan.step || cur.t + " …"}</b>
        <div className="rp-ms-icons">
          {STEPS.map((x, i) => {
            const st = active === -1 || i < active ? "done" : i === active ? "run" : "wait";
            return <span key={x.t} title={x.t} className={"rp-ms-i " + st}>{st === "done" ? "✓" : st === "run" ? <i /> : <x.I />}</span>;
          })}
        </div>
      </div>
    </div>
  );
}

/* Unternehmen suchen (Google-Profil) */
export function RepSearchSheet({ open, initial, rep, onClose, onPicked, showToast }) {
  const [q, setQ] = React.useState(initial || "");
  const [res, setRes] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [pick, setPick] = React.useState("");
  const search = rep.search;
  React.useEffect(() => { if (open) { setQ(initial || ""); setRes([]); } }, [open, initial]);
  React.useEffect(() => {
    if (!open || q.trim().length < 3) { setRes([]); return undefined; }
    const t = setTimeout(async () => {
      setBusy(true);
      try { const r = await search(q.trim()); setRes(r.results || []); } catch (e) { setRes([]); }
      setBusy(false);
    }, 450);
    return () => clearTimeout(t);
  }, [q, open, search]);
  const go = async (p) => {
    if (pick) return;
    setPick(p.placeId);
    try { await rep.scan({ placeId: p.placeId }); onPicked(); }
    catch (e) { showToast(e.code === "keys" ? "Scan ist gerade nicht verfügbar (Schlüssel fehlt)" : "Scan konnte nicht gestartet werden", true); }
    setPick("");
  };
  if (!open) return null;
  return (
    <div className="rp-sheet-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rp-sheet" role="dialog" aria-label="Unternehmen wählen">
        <div className="rp-sheet-h"><b>Welches Unternehmen?</b><button type="button" onClick={onClose} aria-label="Schließen"><X /></button></div>
        <label className="rp-search"><Search /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Firmenname und Ort" /></label>
        <div className="rp-res">
          {busy && !res.length ? <div className="rp-empty"><Loader className="spin" /></div> : null}
          {res.map((p) => (
            <button key={p.placeId} type="button" className="rp-row" onClick={() => go(p)} disabled={!!pick}>
              <span className="rp-ico"><Globe /></span>
              <span className="rp-t"><b>{p.name}</b><span>{p.address}</span></span>
              {pick === p.placeId ? <Loader className="spin" /> : p.rating ? <span className="rp-rt">{String(p.rating).replace(".", ",")} ★ · {p.reviews}</span> : <ChevronRight />}
            </button>
          ))}
          {!busy && q.trim().length >= 3 && !res.length ? <div className="rp-empty">Nichts gefunden – anders schreiben?</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Detail (Dashboard) ---------------- */
function Chart({ history }) {
  const pts = history.slice(-6);
  if (pts.length < 2) {
    return <div className="rp-chart-one"><b>{pts[0] ? pts[0].score : "–"}</b><span>Der Verlauf erscheint ab dem 2. Scan.</span></div>;
  }
  const vals = pts.map((p) => p.score);
  const lo = Math.max(0, Math.floor((Math.min(...vals) - 6) / 10) * 10), hi = Math.min(100, Math.ceil((Math.max(...vals) + 6) / 10) * 10);
  const X = (i) => 4 + (i * 92) / (pts.length - 1), Y = (v) => 6 + ((hi - v) / (hi - lo || 1)) * 88; // Prozent
  const xy = pts.map((p, i) => [X(i), Y(p.score)]);
  const line = xy.map(([x, y]) => x.toFixed(2) + "," + y.toFixed(2)).join(" ");
  const area = `M${xy[0][0]},100 L` + xy.map(([x, y]) => x.toFixed(2) + "," + y.toFixed(2)).join(" L") + ` L${xy[xy.length - 1][0]},100 Z`;
  const [lx, ly] = xy[xy.length - 1];
  return (
    <div className="rp-chart" role="img" aria-label={"Score-Verlauf: " + vals.join(", ")}>
      <div className="rp-chart-plot">
        {[0, 50, 100].map((g) => <i key={g} className="rp-grid-l" style={{ top: 6 + g * 0.88 + "%" }}><span>{Math.round(hi - (g / 100) * (hi - lo))}</span></i>)}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="rpcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8000" stopOpacity=".22" /><stop offset="1" stopColor="#ff8000" stopOpacity="0" /></linearGradient></defs>
          <path d={area} fill="url(#rpcg)" />
          <polyline points={line} fill="none" stroke="#ff8000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {xy.map(([x, y], i) => <b key={i} className={"rp-dot" + (i === xy.length - 1 ? " last" : "")} style={{ left: x + "%", top: y + "%" }} />)}
        <em className="rp-val" style={{ left: lx + "%", top: ly + "%" }}>{vals[vals.length - 1]}</em>
      </div>
      <div className="rp-chart-x">{pts.map((p, i) => <span key={i} style={{ left: X(i) + "%" }} className={i === pts.length - 1 ? "on" : ""}>{dateOf(p.at)}</span>)}</div>
    </div>
  );
}
const TODO_ICON = { rank: Search, gbp: Star, neg: Flag, suggest: Search, answer: MessageCircle, ki: Sparkles, social: Users, glink: Users, web: Globe };
const TODO_COL = { rank: ["#2b7fff", "#eaf2ff"], gbp: ["#d97706", "#fff4e0"], neg: ["#e23b3b", "#fdecec"], suggest: ["#e23b3b", "#fdecec"], answer: ["#d97706", "#fff4e0"], ki: ["#2b7fff", "#eaf2ff"], social: ["#7c3aed", "#f1eafe"], glink: ["#7c3aed", "#f1eafe"], web: ["#0ea5e9", "#e6f6fd"] };

export function RepDetail({ loc, rep, multi, onBack, showToast, imp, onAdd }) {
  const r = loc.latest;
  const [area, setArea] = React.useState(null);
  React.useEffect(() => { setArea(null); }, [loc.id]);
  const running = loc.scan && loc.scan.status === "running";
  const ask = async (action) => {
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    try { await rep.request(loc.id, action); showToast("Danke! Wir melden uns innerhalb von 24 Stunden."); } catch (e) { showToast("Das hat nicht geklappt", true); }
  };
  const rescan = async () => {
    if (running) return;
    try { await rep.scan({ locationId: loc.id }); showToast("Neuer Scan läuft"); } catch (e) { showToast("Scan konnte nicht gestartet werden", true); }
  };
  if (area) {
    const a = r.areas.find((x) => x.key === area);
    return <RepArea a={a} r={r} onBack={() => setArea(null)} onAsk={ask} />;
  }
  const k = r.kpis || {};
  return (
    <div className="rp-detail">
      <div className="rp-dh">
        {multi ? <button type="button" className="rp-back" onClick={onBack} aria-label="Alle Standorte"><ArrowLeft /></button> : null}
        <div><h1>Reputation</h1><p>{loc.name}{loc.city ? " · " + loc.city : ""}</p></div>
        {onAdd ? <button type="button" className="rp-add" onClick={onAdd}><Plus />Standort</button> : null}
      </div>
      {running ? <RepRunning loc={loc} /> : loc.scan && loc.scan.status === "error" && (!loc.latest || new Date(loc.scan.at) > new Date(loc.latest.scannedAt || 0)) ? <RepFailed loc={loc} rep={rep} showToast={showToast} /> : null}
      <div className="rp-kpis">
        <div className="rp-kpi dark">
          <span className="rp-kpi-l">Reputations-Score</span>
          <b className="rp-kpi-v">{r.score}<small> /100</small></b>
          <span className="rp-kpi-s"><Delta now={r.score} prev={loc.prevScore} prevAt={loc.prevAt} light /></span>
        </div>
        <div className="rp-kpi"><span className="rp-kpi-l">Rote Flaggen</span><b className="rp-kpi-v" style={{ color: k.flags ? "#e23b3b" : "#16a34a" }}>{k.flags || 0}</b><span className="rp-kpi-s">{k.flags ? "bitte ansehen" : "alles sauber"}</span></div>
        <div className="rp-kpi"><span className="rp-kpi-l">Google-Sterne</span><b className="rp-kpi-v">{k.rating ? String(k.rating).replace(".", ",") : "–"}</b><span className="rp-kpi-s">{k.reviews || 0} Bewertungen</span></div>
        <div className="rp-kpi"><span className="rp-kpi-l">Seite 1 positiv</span><b className="rp-kpi-v">{k.page1Pos || 0}/{k.page1Total || 10}</b><span className="rp-kpi-s">Google-Treffer</span></div>
      </div>
      <div className="rp-grid">
        <div className="rp-main">
          <section className="rp-box">
            <div className="rp-box-h"><b>Score-Verlauf</b><span>{loc.history.length} {loc.history.length === 1 ? "Scan" : "Scans"}</span></div>
            <Chart history={loc.history} />
          </section>
          <div className="rp-two">
            <section className="rp-box">
              <div className="rp-box-h"><b>Bereiche</b><span>antippen für Details</span></div>
              {r.areas.map((a) => (
                <button key={a.key} type="button" className="rp-bar" onClick={() => setArea(a.key)}>
                  <span className="rp-bar-n">{a.name}</span>
                  <span className="rp-bar-t"><i style={{ width: Math.max(4, a.score10 * 10) + "%", background: COLORS[a.status] === "#d97706" ? "#f59e0b" : COLORS[a.status] }} /></span>
                  <span className="rp-bar-v" style={{ color: COLORS[a.status] }}>{a.score10}/10</span>
                </button>
              ))}
            </section>
            <section className="rp-box">
              <div className="rp-box-h"><b>Google Seite 1</b><span>„{r.query}“</span></div>
              <div className="rp-sq">
                {Array.from({ length: 10 }).map((_, i) => {
                  const x = (r.serp1 || []).find((s) => s.pos === i + 1);
                  const c = !x ? "#ececec" : x.sent === "pos" ? "#16a34a" : x.sent === "neg" ? "#e23b3b" : x.sent === "other" ? "#fff" : "#d4d4d4";
                  return <a key={i} href={x ? x.link : undefined} target="_blank" rel="noopener noreferrer" title={x ? x.title : ""} style={{ background: c, color: x && (x.sent === "pos" || x.sent === "neg") ? "#fff" : "#6b6b6b", boxShadow: x && x.sent === "other" ? "inset 0 0 0 2px #d4d4d4" : "none" }}>{i + 1}</a>;
                })}
              </div>
              <div className="rp-leg">
                <span><i style={{ background: "#16a34a" }} />{(r.serp1 || []).filter((s) => s.sent === "pos").length} positiv</span>
                <span><i style={{ background: "#d4d4d4" }} />{(r.serp1 || []).filter((s) => s.sent === "neu").length} neutral</span>
                <span><i style={{ background: "#e23b3b" }} />{(r.serp1 || []).filter((s) => s.sent === "neg").length} negativ</span>
                {(r.serp1 || []).some((s) => s.sent === "other") ? <span><i style={{ background: "#fff", boxShadow: "inset 0 0 0 2px #d4d4d4" }} />andere Firma</span> : null}
              </div>
              {(r.serp1 || []).find((s) => s.sent === "neg") ? <button type="button" className="rp-redlink" onClick={() => setArea("search")}>Platz {(r.serp1 || []).find((s) => s.sent === "neg").pos} ist negativ · ansehen<ChevronRight /></button> : null}
            </section>
          </div>
        </div>
        <aside className="rp-side">
          <section className="rp-box">
            <div className="rp-box-h"><b>Das sollten Sie tun</b></div>
            {r.todos.length ? r.todos.map((t) => {
              const I = TODO_ICON[t.key] || Flag; const [c, bg] = TODO_COL[t.key] || ["#111", "#f4f4f4"];
              return (
                <button key={t.key} type="button" className="rp-row" onClick={() => (t.who === "wir" ? ask(t.action) : setArea(t.area))}>
                  <span className="rp-ico" style={{ color: c, background: bg }}><I /></span>
                  <span className="rp-t"><b>{t.title}</b><span>+{t.points} Punkte · {t.who === "wir" ? "wir erledigen das" : "selbst erledigt"}</span></span>
                  <ChevronRight />
                </button>
              );
            }) : <div className="rp-empty">Nichts Dringendes – sehr gut!</div>}
          </section>
          {r.ki && r.ki.length ? (
            <section className="rp-box">
              <div className="rp-box-h"><b>Was KIs sagen</b></div>
              {r.kiSummary ? <p className="rp-ki-q" style={{ marginBottom: 10 }}>{r.kiSummary}</p> : null}
              {[...kiDimsOf(r)].sort((p, q) => p.score - q.score).slice(0, 4).map((d) => (
                <div key={d.key} className="rp-dim sm">
                  <div className="rp-dim-h"><b>{d.name}</b><em style={{ color: dimCol(d.score) }}>{d.score}<small>/10</small></em></div>
                  <div className="rp-dim-bar"><i style={{ width: d.score * 10 + "%", background: dimCol(d.score) }} /></div>
                </div>
              ))}
            </section>
          ) : null}
        </aside>
      </div>
      <div className="rp-foot">
        <span>Scan vom {dateOf(r.scannedAt || r.at)} · {r.sources} Quellen geprüft</span>
        <button type="button" onClick={rescan} disabled={running}>{running ? <Loader className="spin" /> : <RefreshCw />}Neu scannen</button>
      </div>
    </div>
  );
}

/* KI-Antworten: Ampel-Tabelle (Fragen × KIs) mit Einzelscore je KI; Feld antippen → ganze Antwort */
const AI_COL = { ChatGPT: "#10a37f", Claude: "#d97757", Perplexity: "#20808d" };
const AI_INI = { ChatGPT: "G", Claude: "C", Perplexity: "P" };
const KI_LBL = { kennen: ["Kennen", "Kennst du die Firma?"], serioes: ["Seriös?", "Ist die Firma seriös?"], erfahrungen: ["Erfahrungen", "Welche Erfahrungen haben Kunden gemacht?"], beauftragen: ["Beauftragen?", "Soll ich die Firma beauftragen?"], besser: ["Bessere?", "Gibt es in der Region bessere Anbieter?"] };
const kiSent = (x) => (!x || x.sent === "none" ? "none" : !x.known ? "neu" : x.sent);
const kiVal = (x) => (!x.known ? 4 : x.sent === "pos" ? 9 : x.sent === "neg" ? 3 : 6.5);
const DIM_DEF = [
  ["kennen", "Bekanntheit", "Kennen KIs Ihr Unternehmen?"], ["angebot", "Leistungen", "Wissen KIs, was Sie anbieten?"], ["serioes", "Seriosität", "Halten KIs Sie für seriös?"],
  ["erfahrungen", "Kundenerfahrungen", "Was KIs über Erfahrungen von Kunden wissen"], ["kritik", "Kritik & Warnungen", "Nennen KIs Kritik oder Beschwerden?"],
  ["beauftragen", "Empfehlung", "Würden KIs Sie empfehlen?"], ["besser", "Vergleich mit Mitbewerbern", "Schicken KIs Kunden zur Konkurrenz?"],
];
function kiDimsOf(r) {
  if (Array.isArray(r.kiDims) && r.kiDims.length) return r.kiDims;
  const ais = (r.ki || []).filter((x) => x.answers && x.answers.length);
  return DIM_DEF.map(([key, name, hint]) => {
    const ans = ais.flatMap((ai) => ai.answers.filter((x) => x.key === key && x.sent !== "none"));
    if (!ans.length) return null;
    const v = (x) => (!x.known ? (key === "kennen" ? 2 : 4) : x.sent === "pos" ? 9 : x.sent === "neg" ? 3 : 6.5);
    return { key, name, hint, score: Math.round(ans.reduce((s2, x) => s2 + v(x), 0) / ans.length), n: ans.length, neg: ans.filter((x) => x.known && x.sent === "neg").length, sum: "" };
  }).filter(Boolean);
}
const dimCol = (v) => (v >= 8 ? "#15803d" : v >= 5 ? "#b45309" : "#b91c1c");
function KiTable({ r }) {
  const ais = (r.ki || []).filter((x) => x.answers && x.answers.length);
  const [sel, setSel] = React.useState(null); // { qi, ai }
  const ansRef = React.useRef(null);
  React.useEffect(() => { if (sel && ansRef.current) { try { ansRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) { /* */ } } }, [sel]);
  if (!ais.length) return <div className="rp-empty"><Sparkles />Keine KI-Antworten in diesem Scan.</div>;
  const all = ais.flatMap((ai) => ai.answers.filter((x) => x.sent !== "none"));
  const nPos = all.filter((x) => kiSent(x) === "pos").length, nNeg = all.filter((x) => kiSent(x) === "neg").length;
  const score = (ai) => { const a = ai.answers.filter((x) => x.sent !== "none"); return a.length ? Math.round(a.reduce((s2, x) => s2 + kiVal(x), 0) / a.length) : null; };
  const sc = (v) => (v == null ? "#9a9a9a" : v >= 8 ? "#15803d" : v >= 5 ? "#b45309" : "#b91c1c");
  const qOrder = ais[0].answers.map((_, qi) => [qi, Math.min(...ais.map((ai) => RANK[kiSent(ai.answers[qi])] ?? 2))]).sort((a, b) => a[1] - b[1] || a[0] - b[0]).map((x) => x[0]);
  const lab = (s) => (s === "pos" ? "positiv" : s === "neg" ? "kritisch" : s === "none" ? "keine Antwort" : "neutral");
  const cur = sel ? { ai: ais.find((x) => x.name === sel.ai), qi: sel.qi } : null;
  const ans = cur && cur.ai ? cur.ai.answers[cur.qi] : null;
  return (
    <section className="rp-kt">
      <div className="rp-kt-sum"><span><b>{nPos}</b> von {all.length} Antworten positiv{nNeg ? <> · <b className="neg">{nNeg}</b> kritisch</> : null}</span><em>{ais.length} KIs · je {ais[0].answers.length} Kundenfragen</em></div>
      <div className="rp-kt-grid" style={{ "--n": ais.length }}>
        <span />
        {ais.map((ai) => { const v = score(ai); return (
          <div key={ai.name} className="rp-kt-ai">
            <i style={{ background: AI_COL[ai.name] || "#111" }}>{AI_INI[ai.name] || ai.name[0]}</i>
            <b>{ai.name}</b>
            <em style={{ color: sc(v) }}>{v == null ? "–" : v + "/10"}</em>
          </div>
        ); })}
        {qOrder.map((qi) => {
          const q0 = ais[0].answers[qi];
          const L = KI_LBL[q0.key] || [q0.q, q0.q];
          return (
            <React.Fragment key={q0.key}>
              <b className="rp-kt-q"><span className="m">{L[0]}</span><span className="d">{L[1]}</span></b>
              {ais.map((ai) => { const x = ai.answers[qi]; const st = kiSent(x); const on = sel && sel.qi === qi && sel.ai === ai.name; return (
                <button key={ai.name} type="button" className={"rp-kt-c s-" + st + (on ? " on" : "")} onClick={() => setSel(on ? null : { qi, ai: ai.name })} aria-label={`${ai.name}: ${L[1]} – ${lab(st)}`}>
                  <i className="dot" />
                  <span className="d"><em>{lab(st)}</em>{x.quote ? <span>„{x.quote}“</span> : null}</span>
                </button>
              ); })}
            </React.Fragment>
          );
        })}
      </div>
      <div className="rp-kt-leg"><span><i className="s-pos" />positiv</span><span><i className="s-neu" />neutral</span><span><i className="s-neg" />kritisch</span><em>Feld antippen → ganze Antwort</em></div>
      {ans ? (
        <div className="rp-kt-ans" ref={ansRef}>
          <div className="rp-kt-ask">{ans.q}</div>
          <div className="rp-kt-reply" style={{ borderLeftColor: kiSent(ans) === "pos" ? "#16a34a" : kiSent(ans) === "neg" ? "#e23b3b" : "#bdbdbd" }}>
            <span className="h"><i style={{ background: AI_COL[cur.ai.name] || "#111" }}>{AI_INI[cur.ai.name] || cur.ai.name[0]}</i><b>{cur.ai.name}</b><em className={"s-" + kiSent(ans)}>{lab(kiSent(ans))}</em></span>
            <p>{ans.text || ans.quote || "Keine Antwort."}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
/* KI-Antworten, einfach: 1) EIN Satz + Score + das Wichtigste, 2) je KI eine Zeile, 3) Details erst auf Tippen */
function KiDim({ d }) {
  const [on, setOn] = React.useState(false);
  const refs = d.refs || [];
  return (
    <div className={"rp-dim" + (refs.length ? " has" : "") + (on ? " on" : "")}>
      <button type="button" className="rp-dim-btn" onClick={() => refs.length && setOn(!on)} disabled={!refs.length}>
        <div className="rp-dim-h"><b>{d.name}</b><em style={{ color: dimCol(d.score) }}>{d.score}<small>/10</small></em></div>
        <div className="rp-dim-bar"><i style={{ width: d.score * 10 + "%", background: dimCol(d.score) }} /></div>
        {d.sum ? <p>{d.sum}</p> : null}
        {refs.length ? <span className="rp-dim-more">{refs.length} {refs.length === 1 ? "Quelle" : "Quellen"}<ChevronDown /></span> : null}
      </button>
      {on ? (
        <div className="rp-dim-refs">
          {refs.map((x) => (
            <a key={x.url} className="rp-li" href={x.url} target="_blank" rel="noopener noreferrer">
              <i style={{ background: x.sent === "neg" ? "#e23b3b" : x.sent === "pos" ? "#16a34a" : "#bdbdbd" }} />
              <span className="rp-t"><b>{x.about || x.title}</b><span>{x.about ? x.title + " · " : ""}{x.host}</span></span>
              <ExternalLink />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
function KiSimple({ r, a, pending }) {
  const ais = (r.ki || []).filter((x) => x.answers && x.answers.length);
  if (!ais.length) return <div className="rp-empty"><Sparkles />Keine KI-Antworten in diesem Scan.</div>;
  const dims = [...kiDimsOf(r)].sort((p, q) => p.score - q.score);
  return (
    <>
      <section className="rp-dims">
        {dims.map((d) => <KiDim key={d.key} d={d} />)}
      </section>
    </>
  );
}
/* Bewertungen: jedes Portal eine eigene ausklappbare Kachel (Google zuerst) */
const PORTAL_NAME = { trustpilot: "Trustpilot", provenexpert: "ProvenExpert", kununu: "kununu", immobilienscout24: "ImmoScout24", immowelt: "immowelt", jameda: "jameda", yelp: "Yelp", tripadvisor: "Tripadvisor", herold: "Herold", gelbeseiten: "Gelbe Seiten", "11880": "11880", golocal: "golocal", werkenntdenbesten: "WerkenntdenBESTEN", ausgezeichnet: "ausgezeichnet.org", reviews: "Reviews.io", facebook: "Facebook", google: "Google", firmenabc: "FirmenABC", wlw: "wlw", glassdoor: "Glassdoor", anwalt: "anwalt.de", check24: "CHECK24", myhammer: "MyHammer", houzz: "Houzz", local: "local.ch", search: "search.ch", moneyhouse: "Moneyhouse" };
const portalOf = (h) => { const p = String(h || "").replace(/^www\./, "").split("."); const core = p.length > 2 && p[0].length <= 3 ? p[1] : p[0]; return PORTAL_NAME[core] || core.charAt(0).toUpperCase() + core.slice(1); };
const stars = (v) => String(Math.round(v * 10) / 10).replace(".", ",") + " ★";
const ratingCol = (v) => (v == null ? "#9a9a9a" : v >= 4.3 ? "#15803d" : v >= 3.8 ? "#b45309" : "#b91c1c");
function ReviewPortals({ r, items }) {
  const [open, setOpen] = React.useState(null);
  const groups = [...items.reduce((m, x) => { const k = portalOf(x.host); if (!m.has(k)) m.set(k, []); m.get(k).push(x); return m; }, new Map()).entries()].map(([name, list]) => {
    const rated = list.find((x) => x.rating);
    const m = !rated && list.map((x) => x.note || "").join(" ").match(/(\d[.,]\d)\s*von\s*5/);
    const rating = rated ? Number(rated.rating) : m ? Number(m[1].replace(",", ".")) : null;
    const votes = rated && rated.votes ? Number(rated.votes) : (list.map((x) => x.note || "").join(" ").match(/(\d+)\s*Bewertung/) || [])[1] || null;
    return { name, list, rating, votes, neg: list.some((x) => x.sent === "neg"), url: list[0].link };
  }).sort((p, q) => (q.neg ? 1 : 0) - (p.neg ? 1 : 0) || (p.rating ?? 9) - (q.rating ?? 9));
  const g = r.gbp;
  const ck = g ? g.checks || [] : [];
  const gRating = g ? g.rating : r.kpis && r.kpis.rating;
  const gVotes = g ? g.reviews : r.kpis && r.kpis.reviews;
  const tile = (key, name, sub, right, rightCol, body, ini, col) => {
    const on = open === key;
    return (
      <div key={key} className={"rp-pt" + (on ? " open" : "")}>
        <button type="button" className="rp-pt-h" onClick={() => setOpen(on ? null : key)}>
          <span className="rp-pt-i" style={{ background: col }}>{ini}</span>
          <span className="rp-t"><b>{name}</b><span>{sub}</span></span>
          {right ? <em style={{ color: rightCol }}>{right}</em> : null}
          <ChevronDown className="rp-pt-chev" />
        </button>
        {on ? <div className="rp-pt-b">{body}</div> : null}
      </div>
    );
  };
  return (
    <div className="rp-pts">
      <div className="rp-box-h"><b>Bewertungsportale</b><span>{groups.length + 1} gefunden</span></div>
      {tile("google", "Google", (gRating ? stars(gRating) + " · " + (gVotes || 0) + " Bewertungen" : "noch keine Bewertungen") + (g && g.type ? " · " + g.type : ""),
        gRating ? stars(gRating) : null, ratingCol(gRating), (
        <>
          {ck.length ? <div className="rp-pt-sub">Google-Unternehmensprofil · {ck.filter((c) => c.ok).length} von {ck.length} erfüllt</div> : null}
          {[...ck.filter((c) => !c.ok), ...ck.filter((c) => c.ok)].map((c) => (
            <CheckRow key={c.key} c={c} detail={false} />
          ))}
          {(g && g.url) || (r.location && r.location.mapsUrl) ? <a className="rp-pt-open" href={(g && g.url) || r.location.mapsUrl} target="_blank" rel="noopener noreferrer">Google-Profil öffnen<ExternalLink /></a> : null}
        </>
      ), "G", "#4285f4")}
      {groups.map((p) => tile(p.name, p.name, (p.rating ? stars(p.rating) + (p.votes ? " · " + p.votes + " Bewertungen" : "") : p.list.length === 1 ? "1 Eintrag gefunden" : p.list.length + " Einträge gefunden") + (p.neg ? " · kritisch" : ""),
        p.rating ? stars(p.rating) : null, ratingCol(p.rating), (
        <>
          {p.list.map((x, i) => (
            <a key={i} className="rp-li" href={x.link} target="_blank" rel="noopener noreferrer">
              <i style={{ background: x.sent === "pos" ? "#16a34a" : x.sent === "neg" ? "#e23b3b" : "#bdbdbd" }} />
              <span className="rp-t"><b>{x.title}</b><span>{x.note || x.snippet || x.host}{x.src === "google" && x.pos ? ` · Google Seite ${Math.ceil(x.pos / 10)}, Platz ${x.pos}` : ""}{x.date ? " · " + x.date : ""}</span></span>
              <ExternalLink />
            </a>
          ))}
        </>
      ), p.name.charAt(0).toUpperCase(), p.neg ? "#e23b3b" : "#9a9a9a"))}
    </div>
  );
}
/* Ranking & Website: Suchbegriffe oben, Ladezeit und SEO klein als Kacheln */
const rankCol = (v) => (v == null ? "#b91c1c" : v <= 3 ? "#15803d" : v <= 10 ? "#b45309" : "#b91c1c");
function WebArea({ r }) {
  const [open, setOpen] = React.useState(null);
  const kws = [...(r.kws || [])].map((k) => ({ ...k, best: Math.min(k.g ?? 99, k.pack ?? (k.maps ?? 99)) })).sort((p, q) => q.best - p.best);
  const w = r.website || {}, m = w.metrics || {};
  const sec = (ms) => (ms == null ? "–" : (ms / 1000).toFixed(1).replace(".", ",") + " s");
  const mb = m.kb == null ? "–" : m.kb >= 1024 ? (m.kb / 1024).toFixed(1).replace(".", ",") + " MB" : m.kb + " KB";
  const ok = w.checks || [];
  const tile = (key, name, sub, right, rightCol, body, ini, col) => {
    const on = open === key;
    return (
      <div key={key} className={"rp-pt" + (on ? " open" : "")}>
        <button type="button" className="rp-pt-h" onClick={() => setOpen(on ? null : key)}>
          <span className="rp-pt-i" style={{ background: col }}>{ini}</span>
          <span className="rp-t"><b>{name}</b><span>{sub}</span></span>
          {right ? <em style={{ color: rightCol }}>{right}</em> : null}
          <ChevronDown className="rp-pt-chev" />
        </button>
        {on ? <div className="rp-pt-b">{body}</div> : null}
      </div>
    );
  };
  return (
    <section className="rp-list">
      {kws.length ? (
        <>
          <div className="rp-box-h"><b>Suchbegriffe</b><span>{kws.length}</span></div>
          <div className="rp-kws">
            {kws.map((k) => (
              <div key={k.q} className="rp-kw">
                <b>{k.q}</b>
                <span className="rp-kw-c" style={{ color: rankCol(k.g) }}><small>Google</small>{k.g ? "#" + k.g : "–"}</span>
                <span className="rp-kw-c" style={{ color: rankCol(k.pack ?? k.maps) }}><small>Maps</small>{k.pack ? "#" + k.pack : k.maps ? "#" + k.maps : "–"}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      {w.url ? (
        <div className="rp-pts" style={{ marginTop: kws.length ? 22 : 0 }}>
          {tile("speed", "Ladezeit am Handy", w.perf == null ? "nicht messbar" : sec(m.lcp) + " bis fertig · " + mb, w.perf == null ? null : w.perf + "/100", w.perf >= 90 ? "#15803d" : w.perf >= 50 ? "#b45309" : "#b91c1c", (
            <div className="rp-metrics">
              <div><b style={{ color: m.fcp > 3000 ? "#e23b3b" : m.fcp > 1800 ? "#d97706" : "#16a34a" }}>{sec(m.fcp)}</b><span>bis etwas zu sehen ist</span></div>
              <div><b style={{ color: m.lcp > 4000 ? "#e23b3b" : m.lcp > 2500 ? "#d97706" : "#16a34a" }}>{sec(m.lcp)}</b><span>bis die Seite fertig aussieht</span></div>
              <div><b style={{ color: m.kb > 4096 ? "#e23b3b" : m.kb > 1640 ? "#d97706" : "#16a34a" }}>{mb}</b><span>Datenmenge{m.requests ? ` · ${m.requests} Dateien` : ""}</span></div>
            </div>
          ), "⚡", "#9a9a9a")}
          {tile("seo", "SEO-Grundlagen", `${ok.filter((c) => c.ok).length} von ${ok.length} erfüllt`, null, null, (
            <>
              {[...ok.filter((c) => !c.ok), ...ok.filter((c) => c.ok)].map((c) => (
                <CheckRow key={c.key} c={c} />
              ))}
              <a className="rp-pt-open" href={w.url} target="_blank" rel="noopener noreferrer">Website öffnen<ExternalLink /></a>
            </>
          ), "S", ok.some((c) => !c.ok) ? "#d97706" : "#16a34a")}
        </div>
      ) : <div className="rp-empty">Im Google-Profil ist keine Website hinterlegt.</div>}
    </section>
  );
}
/* Erklärungen zum Antippen – in einfachen Worten: was ist das, warum wichtig, was tun */
const HELP = {
  https: ["Das Schloss-Symbol in der Adresszeile. Die Verbindung zur Website ist verschlüsselt.", "Ohne https zeigt der Browser „Nicht sicher“ an – das schreckt Kunden ab und Google stuft die Seite herunter.", "Ihr Webhoster aktiviert ein kostenloses SSL-Zertifikat (meist ein Klick im Hosting-Menü)."],
  title: ["Der Titel ist die blaue Überschrift, die bei Google über Ihrem Eintrag steht.", "Er entscheidet mit, ob jemand klickt. Ideal: 30–65 Zeichen mit Leistung und Ort, z. B. „Immobilienmakler in Zürich | Firmenname“.", "Im Website-Baukasten bzw. SEO-Plugin den Seitentitel anpassen."],
  desc: ["Der graue Text unter dem Titel in den Google-Ergebnissen.", "Ein guter Text (50–170 Zeichen) erklärt in einem Satz, was Sie bieten – mehr Klicks von den gleichen Suchenden.", "Im Website-Baukasten bzw. SEO-Plugin die „Meta-Beschreibung“ ausfüllen."],
  h1: ["Die große Hauptüberschrift auf Ihrer Startseite.", "Google liest daran ab, worum es auf der Seite geht.", "Eine klare Überschrift mit Ihrer Leistung und dem Ort setzen, z. B. „Immobilien kaufen & verkaufen in Zürich“."],
  viewport: ["Eine technische Angabe, damit die Seite auf dem Handy richtig skaliert.", "Über die Hälfte Ihrer Besucher kommt mit dem Handy – ohne diese Angabe ist alles winzig und Google wertet die Seite ab.", "Ihr Webdesigner ergänzt eine Zeile im Code (bei modernen Baukästen automatisch)."],
  lang: ["Die Website sagt Google, in welcher Sprache sie geschrieben ist.", "So wird sie Menschen angezeigt, die auf Deutsch suchen.", "Ihr Webdesigner ergänzt die Sprachangabe (z. B. „de“) im Code."],
  index: ["Ob Google die Website überhaupt in die Suchergebnisse aufnehmen darf.", "Steht sie auf „noindex“, ist sie bei Google unsichtbar – das passiert oft versehentlich nach einem Relaunch.", "Sofort im Baukasten/SEO-Plugin die Sichtbarkeit für Suchmaschinen einschalten."],
  canonical: ["Ein unsichtbarer Hinweis im Code, welche Adresse die „echte“ Ihrer Seite ist (z. B. mit oder ohne www).", "Ohne ihn sieht Google manchmal mehrere Versionen derselben Seite und teilt die Bewertung auf – Sie ranken schlechter.", "Ihr Webdesigner oder das SEO-Plugin (z. B. Yoast) setzt ihn automatisch – meist eine Einstellung."],
  alt: ["Ein kurzer Text zu jedem Bild, den Besucher nicht sehen, Google aber liest (z. B. „Wohnung mit Seeblick in Zürich“).", "Google versteht Bilder nur über diese Texte. Mit Beschreibung erscheinen Ihre Bilder auch in der Google-Bildersuche und die Seite wirkt barrierefrei.", "Im Baukasten bei jedem Bild das Feld „Alt-Text“ oder „Bildbeschreibung“ ausfüllen."],
  schema: ["Ein unsichtbarer Steckbrief im Code: Name, Adresse, Telefon, Öffnungszeiten, Branche.", "Google und KI-Systeme lesen Ihre Firmendaten daraus sicher ab – das hilft bei Maps, im Firmenkasten rechts und in KI-Antworten.", "Ihr Webdesigner oder ein SEO-Plugin ergänzt die Firmendaten („LocalBusiness“-Schema)."],
  sitemap: ["Die Sitemap ist ein Inhaltsverzeichnis Ihrer Website für Google, robots.txt eine Hausordnung für Suchmaschinen.", "Mit Sitemap findet Google alle Ihre Seiten schneller und vollständiger.", "Die meisten Baukästen und SEO-Plugins erstellen sie mit einem Klick; danach in der Google Search Console einreichen."],
  status: ["Wie Google Ihr Unternehmen anzeigt: geöffnet, vorübergehend oder dauerhaft geschlossen.", "Steht dort „geschlossen“, rufen Kunden gar nicht erst an.", "Im Google-Unternehmensprofil den Status korrigieren."],
  website: ["Der Link zu Ihrer Website in Ihrem Google-Eintrag.", "Ohne Link landen Interessenten nicht bei Ihnen, sondern bei der Konkurrenz.", "Im Google-Unternehmensprofil unter „Kontakt“ die Website eintragen."],
  phone: ["Die Telefonnummer in Ihrem Google-Eintrag.", "Viele Kunden rufen direkt aus Google oder Maps an.", "Im Google-Unternehmensprofil unter „Kontakt“ die Nummer eintragen."],
  hours: ["Ihre Öffnungs- bzw. Bürozeiten im Google-Eintrag.", "Fehlen sie, wirkt das Profil unvollständig und Google zeigt Sie seltener an.", "Im Google-Unternehmensprofil die Zeiten hinterlegen."],
  photos: ["Fotos in Ihrem Google-Eintrag: Team, Büro, Projekte, Logo.", "Profile mit vielen Fotos bekommen deutlich mehr Klicks und Anfragen.", "Mindestens 10 gute Fotos im Google-Unternehmensprofil hochladen."],
  count: ["Wie viele Google-Bewertungen Sie haben.", "Unter 30 Bewertungen wirkt der Schnitt wenig belastbar – einzelne schlechte Bewertungen ziehen stark nach unten.", "Zufriedene Kunden aktiv um eine Bewertung bitten, z. B. per Link oder QR-Code."],
  answers: ["Ob Sie auf Ihre neuesten Google-Bewertungen geantwortet haben.", "Antworten zeigt Interessenten, dass Sie sich kümmern – gerade bei Kritik.", "Im Google-Unternehmensprofil auf jede Bewertung kurz und freundlich antworten."],
};
function CheckRow({ c, detail = true }) {
  const [on, setOn] = React.useState(false);
  const h = HELP[c.key];
  return (
    <div className={"rp-ck" + (on ? " on" : "")}>
      <button type="button" className="rp-li rp-ck-h" onClick={() => h && setOn(!on)} disabled={!h}>
        <span className={"rp-chk " + (c.ok ? "y" : "n")}>{c.ok ? "✓" : "✕"}</span>
        <span className="rp-t"><b>{c.label}</b>{detail && c.detail ? <span>{c.detail}</span> : null}</span>
        {h ? <span className="rp-ck-q">?</span> : null}
      </button>
      {on && h ? (
        <div className="rp-ck-b">
          <p><b>Was ist das?</b> {h[0]}</p>
          <p><b>Warum wichtig?</b> {h[1]}</p>
          {!c.ok ? <p><b>So beheben:</b> {h[2]}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
const AREA_ICON = { press: Newspaper, search: Search, ki: Sparkles, reviews: Star, social: Users, web: Globe };
function RepArea({ a, r, onBack, onAsk }) {
  if (!a) return null;
  const neg = [...new Map(a.items.filter((x) => x.sent === "neg").map((x) => [x.title.toLowerCase(), x])).values()];
  const st = a.status;
  const bg = st === "Achtung" ? "#fdecec" : st === "Mittel" ? "#fff4e0" : "#e8f7ee";
  const fg = st === "Achtung" ? "#7f1d1d" : st === "Mittel" ? "#7c4a03" : "#14532d";
  const I = AREA_ICON[a.key] || Search;
  return (
    <div className="rp-detail rp-area">
      <div className="rp-dh">
        <button type="button" className="rp-back" onClick={onBack} aria-label="Zurück"><ArrowLeft /></button>
        <div><h1>{a.name}</h1></div>
      </div>
      <section className="rp-status" style={{ background: bg }}>
        <span className="rp-pill" style={{ background: COLORS[st] }}>{st} · {a.score10}/10</span>
        {(a.key === "ki" ? r.kiSummary : r.areaSums && r.areaSums[a.key]) ? <p style={{ color: fg }}>{a.key === "ki" ? r.kiSummary : r.areaSums[a.key]}</p> : null}
      </section>
      {a.facts && a.facts.length && a.key !== "ki" && !(a.key === "reviews" && r.gbp) ? (
        <section className="rp-facts">
          {a.facts.map((f) => <div key={f.label}><span>{f.label}</span><b className={f.tone ? "t-" + f.tone : ""}>{f.value}</b></div>)}
        </section>
      ) : null}
      {a.key === "ki" ? <KiSimple r={r} a={a} pending={!!r.kiPending} /> : a.key === "social" ? (
        <section className="rp-list">
          <div className="rp-box-h"><b>Ihre Profile</b><span>{a.items.length} gefunden</span></div>
          {a.items.length ? [...a.items].sort((p, q) => (p.inGoogle === false ? 0 : p.inGoogle == null ? 1 : 2) - (q.inGoogle === false ? 0 : q.inGoogle == null ? 1 : 2)).map((x, i) => (
            <a key={i} className="rp-li" href={x.link} target="_blank" rel="noopener noreferrer">
              <i style={{ background: "#16a34a" }} />
              <span className="rp-t"><b>{x.title}</b><span>{x.host}{x.followers ? " · " + x.followers : ""}</span>
                <span className={"rp-gl " + (x.inGoogle === true ? "y" : x.inGoogle === false ? "n" : "u")}>{x.inGoogle === true ? "✓ im Google-Profil sichtbar" : x.inGoogle === false ? "✕ nicht im Google-Profil verlinkt" : "Google-Profil: nicht feststellbar"}</span>
              </span>
              <ExternalLink />
            </a>
          )) : <div className="rp-empty"><Users />Keine Social-Media-Profile gefunden.</div>}
        </section>
      ) : a.key === "web" ? <WebArea r={r} /> : null}
      {a.key === "web" || a.key === "ki" || a.key === "social" ? null : (
        <section className="rp-list">
          {a.key === "reviews" ? <ReviewPortals r={r} items={a.items} /> : null}
          {a.key === "reviews" ? null : <>
          <div className="rp-box-h"><b>Was Kunden finden</b><span>{a.items.length} Treffer</span></div>
          {a.key === "search" && r.suggestions && r.suggestions.length ? (
            <div className="rp-sugg">{r.suggestions.slice(0, 8).map((s) => <span key={s.q} className={s.neg ? "neg" : ""}>{s.q}</span>)}</div>
          ) : null}
          {a.items.length ? worstFirst(a.items).map((x, i) => (
            <a key={i} className="rp-li" href={x.link} target="_blank" rel="noopener noreferrer">
              <i style={{ background: x.sent === "pos" ? "#16a34a" : x.sent === "neg" ? "#e23b3b" : x.sent === "other" ? "#fff" : "#bdbdbd", boxShadow: x.sent === "other" ? "inset 0 0 0 2px #d4d4d4" : "none" }} />
              <span className="rp-t"><b>{x.title}</b><span>{x.sent === "other" ? "andere Firma · " : ""}{x.host}{x.src === "google" && x.pos ? ` · Google Seite ${Math.ceil(x.pos / 10)}, Platz ${x.pos}` : x.src === "bing" ? ` · Bing Platz ${x.pos}` : x.src === "news" ? " · News" : ""}{x.date ? " · " + x.date : ""}{x.note ? " · " + x.note : ""}</span></span>
              <ExternalLink />
            </a>
          )) : <div className="rp-empty"><I />{a.key === "press" ? "Keine Artikel oder Forenbeiträge gefunden." : "Keine Treffer."}</div>}
          </>}
        </section>
      )}
      {neg.length && (a.key === "press" || a.key === "search") ? (
        <section className="hero rp-reco">
          <div className="k">Unsere Empfehlung</div>
          <div className="v rp-reco-v">{neg.length > 1 ? `${neg.length} negative Treffer verdrängen` : "Negativen Treffer von Seite 1 verdrängen"}</div>
          <div className="s">Oft in 3–4 Monaten machbar · keine Garantie</div>
          <button type="button" className="pill-btn" onClick={() => onAsk("verdraengen")}>Angebot anfragen</button>
        </section>
      ) : null}
    </div>
  );
}

/* ---------------- Menüpunkt „Reputation“ ---------------- */
export function RepTab({ rep, showToast, imp, openSearch }) {
  const locs = rep.locations || [];
  const [sel, setSel] = React.useState(null);
  const scanned = locs.filter((l) => l.latest);
  const cur = sel ? locs.find((l) => l.id === sel) : locs.length === 1 && scanned.length === 1 ? scanned[0] : null;
  if (rep.loading) return <div className="rp-empty" style={{ padding: 60 }}><Loader className="spin" /></div>;
  if (cur && cur.latest) return <RepDetail loc={cur} rep={rep} multi={locs.length > 1} onBack={() => setSel(null)} showToast={showToast} imp={imp} onAdd={openSearch} />;
  return (
    <div className="rp-detail">
      <div className="rp-dh"><div><h1>Reputation</h1><p>{locs.length ? `${locs.length} ${locs.length === 1 ? "Standort" : "Standorte"}` : "Noch kein Standort geprüft"}</p></div></div>
      {locs.map((l) => (
        l.latest ? (
          <button key={l.id} type="button" className="rp-loc" onClick={() => setSel(l.id)}>
            <span className="rp-loc-r"><Ring score={l.latest.score} potential={0} size={64} stroke={6} uid={"lr" + l.id} /><b>{l.latest.score}</b></span>
            <span className="rp-t"><b>{l.name}</b><span>{l.address || l.city}</span><span className="rp-loc-s"><em>{l.latest.tier}</em><Delta now={l.latest.score} prev={l.prevScore} prevAt={l.prevAt} /></span></span>
            <ChevronRight />
          </button>
        ) : l.scan && l.scan.status === "running" ? <RepRunning key={l.id} loc={l} /> : (
          <div key={l.id} className="rp-loc"><span className="rp-t"><b>{l.name}</b><span>{l.scan && l.scan.status === "error" ? "Scan fehlgeschlagen – bitte erneut versuchen" : "Noch nicht gescannt"}</span></span><button type="button" className="rp-mini" onClick={() => rep.scan({ locationId: l.id }).catch(() => showToast("Scan konnte nicht gestartet werden", true))}>Scannen</button></div>
        )
      ))}
      <button type="button" className="rp-loc add" onClick={openSearch}>
        <span className="rp-loc-r"><span className="rp-plus"><Plus /></span></span>
        <span className="rp-t"><b>{locs.length ? "Weiteren Standort prüfen" : "Erstes Unternehmen prüfen"}</b><span>Filiale, neue Firma oder Konkurrent</span></span>
        <ChevronRight />
      </button>
    </div>
  );
}
