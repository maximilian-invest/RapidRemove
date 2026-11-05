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
  React.useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [running, load]);
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
        <span className="rp-fail-s">Bitte einfach neu starten – dauert 3–5 Minuten.</span>
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
        <span className="rp-hint">Wie bei Google – wir prüfen dann alles rund um dieses Unternehmen.</span>
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
const TODO_ICON = { neg: Flag, suggest: Search, answer: MessageCircle, ki: Sparkles, social: Users, glink: Users, web: Globe };
const TODO_COL = { neg: ["#e23b3b", "#fdecec"], suggest: ["#e23b3b", "#fdecec"], answer: ["#d97706", "#fff4e0"], ki: ["#2b7fff", "#eaf2ff"], social: ["#7c3aed", "#f1eafe"], glink: ["#7c3aed", "#f1eafe"], web: ["#0ea5e9", "#e6f6fd"] };

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
              {worstFirst(r.ki, (x) => (!x.known ? "neu" : x.sent)).map((x) => (
                <div key={x.name} className="rp-ki">
                  <span className="rp-ki-h"><b>{x.name}</b><em className={"s-" + x.sent}>{!x.known ? "kennt Sie kaum" : x.sent === "pos" ? "positiv" : x.sent === "neg" ? "kritisch" : "neutral"}</em></span>
                  {x.answers ? <span className="rp-ki-sum">{x.answers.filter((a) => a.sent === "pos").length} von {x.answers.filter((a) => a.sent !== "none").length} Antworten positiv{x.answers.some((a) => a.sent === "neg") ? ` · ${x.answers.filter((a) => a.sent === "neg").length} kritisch` : ""}</span> : null}
                  {x.quote ? <span className="rp-ki-q">„{x.quote}“</span> : null}
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
        <p style={{ color: fg }}>{a.text}</p>
      </section>
      {a.facts && a.facts.length ? (
        <section className="rp-facts">
          {a.facts.map((f) => <div key={f.label}><span>{f.label}</span><b className={f.tone ? "t-" + f.tone : ""}>{f.value}</b></div>)}
        </section>
      ) : null}
      {a.key === "ki" ? <KiTable r={r} /> : a.key === "social" ? (
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
          <p className="rp-note">„Im Google-Profil sichtbar“ heißt: Das Profil steht rechts in Ihrem Google-Firmeneintrag unter „Profile“.</p>
        </section>
      ) : a.key === "web" ? (
        <section className="rp-list">
          {r.website && r.website.url ? (
            <>
              {(() => {
                const w = r.website, m = w.metrics || {};
                const sec = (ms) => (ms == null ? "–" : (ms / 1000).toFixed(1).replace(".", ",") + " s");
                const mb = m.kb == null ? "–" : m.kb >= 1024 ? (m.kb / 1024).toFixed(1).replace(".", ",") + " MB" : m.kb + " KB";
                const ok = w.checks || [];
                return (
                  <>
                    <div className="rp-box-h"><b>Ladezeit am Handy</b><span>{w.perf == null ? "nicht messbar" : w.perf + "/100"}</span></div>
                    {w.perf == null ? <div className="rp-empty">Die Website hat beim Laden nicht geantwortet.</div> : (
                      <div className="rp-metrics">
                        <div><b style={{ color: m.fcp > 3000 ? "#e23b3b" : m.fcp > 1800 ? "#d97706" : "#16a34a" }}>{sec(m.fcp)}</b><span>bis etwas zu sehen ist</span></div>
                        <div><b style={{ color: m.lcp > 4000 ? "#e23b3b" : m.lcp > 2500 ? "#d97706" : "#16a34a" }}>{sec(m.lcp)}</b><span>bis die Seite fertig aussieht</span></div>
                        <div><b style={{ color: m.kb > 4096 ? "#e23b3b" : m.kb > 1640 ? "#d97706" : "#16a34a" }}>{mb}</b><span>Datenmenge{m.requests ? ` · ${m.requests} Dateien` : ""}</span></div>
                      </div>
                    )}
                    <p className="rp-note">Gemessen wie bei Google: Handy mit mittelguter mobiler Verbindung. Ziel: unter 2,5 s bis fertig.</p>
                    <div className="rp-box-h" style={{ marginTop: 20 }}><b>SEO-Grundlagen</b><span>{ok.filter((c) => c.ok).length} von {ok.length} erfüllt</span></div>
                    {[...ok.filter((c) => !c.ok), ...ok.filter((c) => c.ok)].map((c) => (
                      <div key={c.key} className="rp-li"><span className={"rp-chk " + (c.ok ? "y" : "n")}>{c.ok ? "✓" : "✕"}</span><span className="rp-t"><b>{c.label}</b><span>{c.detail}</span></span></div>
                    ))}
                    <a className="rp-li" href={w.url} target="_blank" rel="noopener noreferrer"><i style={{ background: "#d4d4d4" }} /><span className="rp-t"><b>{String(w.title || w.url).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, "&")}</b><span>{w.url}</span></span><ExternalLink /></a>
                  </>
                );
              })()}
            </>
          ) : <div className="rp-empty">Im Google-Profil ist keine Website hinterlegt.</div>}
        </section>
      ) : (
        <section className="rp-list">
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
          )) : <div className="rp-empty"><I />{a.key === "press" ? "Keine Artikel oder Forenbeiträge über Sie gefunden – kein Risiko, aber auch keine Pluspunkte." : a.key === "reviews" ? "Außer Google keine weiteren Bewertungsportale mit Ihrem Namen gefunden." : "In diesem Bereich ist nichts Auffälliges aufgetaucht."}</div>}
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
