"use client";
/* Reputations-Score im Kundenportal (Vorschau, nur Konten in REP_PREVIEW).
   Daten: ops /cust/rep/* (Scan läuft im Hintergrund, hier wird gepollt). */
import React from "react";
import { ArrowRight, ArrowLeft, ChevronRight, ChevronUp, ChevronDown, Search, Loader, Plus, Flag, MessageCircle, Sparkles, Globe, Users, Newspaper, Star, ExternalLink, RefreshCw, X } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const monthOf = (iso) => { try { return MONTHS[new Date(iso).getMonth()]; } catch (e) { return ""; } };
const dateOf = (iso) => { try { const d = new Date(iso); return d.getDate() + ". " + MONTHS[d.getMonth()]; } catch (e) { return ""; } };
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
    const t = setInterval(load, 3000);
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

/* Scan läuft */
export function RepRunning({ loc }) {
  const p = Math.max(3, Math.min(99, loc.scan.progress || 0));
  return (
    <div className="hero rp-run">
      <span className="hero-img rp-run-ring" aria-hidden="true">
        <svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="23" fill="none" stroke="#2c2c2c" strokeWidth="5" /><circle cx="28" cy="28" r="23" fill="none" stroke="#ff8000" strokeWidth="5" strokeLinecap="round" pathLength="100" strokeDasharray={`${p} 100`} style={{ transition: "stroke-dasharray .6s" }} /></svg>
        <i>{p} %</i>
      </span>
      <div className="k">Scan läuft · {loc.name}</div>
      <div className="v rp-run-v">{loc.scan.step || "Start"} …</div>
      <div className="s">Dauert 1–3 Minuten. Sie können die App schließen – das Ergebnis steht danach hier.</div>
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
const TODO_ICON = { neg: Flag, suggest: Search, answer: MessageCircle, ki: Sparkles, social: Users, web: Globe };
const TODO_COL = { neg: ["#e23b3b", "#fdecec"], suggest: ["#e23b3b", "#fdecec"], answer: ["#d97706", "#fff4e0"], ki: ["#2b7fff", "#eaf2ff"], social: ["#7c3aed", "#f1eafe"], web: ["#0ea5e9", "#e6f6fd"] };

export function RepDetail({ loc, rep, multi, onBack, showToast, imp }) {
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
      </div>
      {running ? <RepRunning loc={loc} /> : null}
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
              {r.ki.map((x) => (
                <div key={x.name} className="rp-ki">
                  <span className="rp-ki-h"><b>{x.name}</b><em className={"s-" + x.sent}>{!x.known ? "kennt Sie kaum" : x.sent === "pos" ? "positiv" : x.sent === "neg" ? "kritisch" : "neutral"}</em></span>
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
      {a.key === "ki" ? (
        <section className="rp-list">
          {(r.ki || []).map((x) => <div key={x.name} className="rp-ki big"><span className="rp-ki-h"><b>{x.name}</b><em className={"s-" + x.sent}>{!x.known ? "kennt Sie kaum" : x.sent === "pos" ? "positiv" : x.sent === "neg" ? "kritisch" : "neutral"}</em></span>{x.quote ? <span className="rp-ki-q">„{x.quote}“</span> : null}</div>)}
          <p className="rp-note">ChatGPT, Gemini und Perplexity kommen als Nächstes dazu.</p>
        </section>
      ) : a.key === "web" ? (
        <section className="rp-list">
          {r.website && r.website.url ? (
            <>
              <div className="rp-li"><i style={{ background: BAR((r.website.perf ?? 0) / 10) }} /><span className="rp-t"><b>Ladezeit (Handy)</b><span>{r.website.perf ?? "–"}/100 · Google PageSpeed</span></span></div>
              <div className="rp-li"><i style={{ background: BAR((r.website.seo ?? 0) / 10) }} /><span className="rp-t"><b>Technisches SEO</b><span>{r.website.seo ?? "–"}/100</span></span></div>
              <div className="rp-li"><i style={{ background: r.website.https ? "#16a34a" : "#e23b3b" }} /><span className="rp-t"><b>Sichere Verbindung (https)</b><span>{r.website.https ? "ja" : "nein"}</span></span></div>
              <a className="rp-li" href={r.website.url} target="_blank" rel="noopener noreferrer"><i style={{ background: "#d4d4d4" }} /><span className="rp-t"><b>{r.website.title || r.website.url}</b><span>{r.website.url}</span></span><ExternalLink /></a>
            </>
          ) : <div className="rp-empty">Im Google-Profil ist keine Website hinterlegt.</div>}
        </section>
      ) : (
        <section className="rp-list">
          <div className="rp-box-h"><b>Was Kunden finden</b><span>{a.items.length} Treffer</span></div>
          {a.key === "search" && r.suggestions && r.suggestions.length ? (
            <div className="rp-sugg">{r.suggestions.slice(0, 8).map((s) => <span key={s.q} className={s.neg ? "neg" : ""}>{s.q}</span>)}</div>
          ) : null}
          {a.items.length ? a.items.map((x, i) => (
            <a key={i} className="rp-li" href={x.link} target="_blank" rel="noopener noreferrer">
              <i style={{ background: x.sent === "pos" ? "#16a34a" : x.sent === "neg" ? "#e23b3b" : "#bdbdbd" }} />
              <span className="rp-t"><b>{x.title}</b><span>{x.host}{x.src === "google" && x.pos ? ` · Google Seite ${Math.ceil(x.pos / 10)}, Platz ${x.pos}` : x.src === "bing" ? ` · Bing Platz ${x.pos}` : x.src === "news" ? " · News" : ""}{x.date ? " · " + x.date : ""}{x.note ? " · " + x.note : ""}</span></span>
              <ExternalLink />
            </a>
          )) : <div className="rp-empty"><I />Keine Treffer in diesem Bereich.</div>}
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
  const cur = sel ? locs.find((l) => l.id === sel) : scanned.length === 1 ? scanned[0] : null;
  if (rep.loading) return <div className="rp-empty" style={{ padding: 60 }}><Loader className="spin" /></div>;
  if (cur && cur.latest) return <RepDetail loc={cur} rep={rep} multi={locs.length > 1} onBack={() => setSel(null)} showToast={showToast} imp={imp} />;
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
