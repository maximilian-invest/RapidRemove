"use client";
/* Partner board (rapid-remove.com/partner#<secret>) — work queue for our review-removal partner.
   Designs: Claude Design handoffs „Partner Review Tasks – Mobile" (priority) and the desktop
   master–detail view. Tasks are grouped by customer (= public business-profile name); no buyer
   contact data is ever shown. Status changes are committed after the undo window, one after the
   other, so an accidental „Software only" never reaches the customer dashboard. */
import React from "react";
import useLive from "@/lib/useLive";
import useAutoUpdate from "@/lib/useAutoUpdate";
import "@/styles/partner.css";
import { OPS, BASE, TABS, STATUS, canRemove, toApi, norm, call } from "./shared";
import PartnerDesktop from "./PartnerDesktop";
import PartnerApp from "./PartnerApp";
import PartnerLogin from "./PartnerLogin";
import RemovalCheck from "./RemovalCheck";
import PasskeyOffer from "@/components/PasskeyOffer";
import PushGate, { pushState, enablePush } from "@/components/PushGate";
import { passkeySupported, passkeyOnDevice, passkeyDismissed } from "@/lib/passkey";

const SKIP_KEY = "rr_partner_setup_skip";

const KEY = "rr_partner_t";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
const MOBILE_Q = "(max-width: 860px)";

const isPreviewUrl = () => { try { return new URLSearchParams(window.location.search).get("preview") === "1"; } catch (e) { return false; } };

const fmtWait = (since) => { const m = Math.max(1, Math.round((Date.now() - since) / 60000)); return m < 60 ? m + " min" : m < 2880 ? Math.floor(m / 60) + " h" : Math.floor(m / 1440) + " days"; };

export default function PartnerBoard() {
  useAutoUpdate(); // nach einem Deploy automatisch die neue Version laden (Home-Bildschirm-App)
  const [token, setToken] = React.useState(null);
  const [preview, setPreview] = React.useState(false); // Test-Board des Admins (nur Testaufträge)
  const [setup, setSetup] = React.useState(null);
  const [gate, setGate] = React.useState(null); // Push noch nicht an → Vollbild-Aufforderung
  const [offerPk, setOfferPk] = React.useState(false); // nach dem Login: Face ID anbieten // { account } → Login über den persönlichen Link einrichten
  const [isMobile, setIsMobile] = React.useState(null);
  // App-Design überall; die alte Tabellen-Ansicht gibt es am Desktop nur noch mit ?view=table.
  const tableView = isMobile === false && typeof window !== "undefined" && /[?&]view=table\b/.test(window.location.search);
  const appUi = !tableView;
  const [tasks, setTasks] = React.useState(null);
  const [cancelled, setCancelled] = React.useState([]); // von RapidRemove stornierte Aufgaben (letzte 30 Tage) – nur zur Info
  const [err, setErr] = React.useState("");
  const [tab, setTab] = React.useState("todo");
  const [q, setQ] = React.useState("");
  const [sortOld, setSortOld] = React.useState(true);
  const [expanded, setExpanded] = React.useState(() => new Set()); // default: all customers collapsed
  const [sel, setSel] = React.useState(() => new Set());
  const [toast, setToast] = React.useState(null); // { msg, undo }
  const [, setTick] = React.useState(0);           // re-render every minute („Working · 12 min")

  const tasksRef = React.useRef(null); tasksRef.current = tasks;
  const pending = React.useRef(null);   // status change waiting out the undo window
  const chain = React.useRef(Promise.resolve()); // server writes strictly in order
  const noteTimers = React.useRef({});
  const toastTimer = React.useRef(null);
  const undoMs = appUi ? 3500 : 4000;

  React.useEffect(() => {
    let t = "";
    try { t = (window.location.hash || "").replace(/^#/, ""); } catch (e) {}
    const fromLink = !!t;
    const pv = isPreviewUrl() && t.startsWith("ps_");
    setPreview(pv);
    if (t && !pv) { try { localStorage.setItem(KEY, t); } catch (e) {} } // Test-Board überschreibt keinen echten Login
    else { try { t = localStorage.getItem(KEY) || ""; } catch (e) {} }
    setToken(t);
    // Mit dem persönlichen Link geöffnet und noch kein Login → einmal anbieten (oder per Link neues Passwort setzen).
    if (t && !t.startsWith("ps_")) {
      let skipped = false; try { skipped = localStorage.getItem(SKIP_KEY) === "1"; } catch (e) {}
      call("auth-status", { t }).then((r) => {
        if (r.via === "link" && (!r.account ? !skipped : fromLink && window.location.search.includes("newpw"))) setSetup({ account: r.account || "" });
      }).catch(() => {});
    }
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_HREF; document.head.appendChild(l);
    }
    const mq = window.matchMedia(MOBILE_Q);
    const on = () => setIsMobile(mq.matches);
    on(); mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    const i = setInterval(() => setTick((x) => x + 1), 60000);
    return () => { clearInterval(i); mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on); };
  }, []);

  const enqueue = React.useCallback((fn) => { chain.current = chain.current.then(fn, fn); return chain.current; }, []);

  const load = React.useCallback(async (manual) => {
    if (!token) return;
    if (!manual && (pending.current || Object.keys(noteTimers.current).length)) return; // keep unsaved local changes
    try {
      const j = await call("tasks", { t: token });
      const ts = (j.tasks || []).map(norm);
      setTasks(ts.filter((t) => t.status !== "cancelled")); setCancelled(ts.filter((t) => t.status === "cancelled")); setErr("");
      if (j.preview) setPreview(true); // Test-Login / Test-Board: nur Testaufträge
    } catch (e) {
      if (e.message === "invalid link" && String(token).startsWith("ps_")) { try { localStorage.removeItem(KEY); } catch (x) {} setToken(""); return; } // Sitzung abgelaufen → Login
      setErr(e.message === "invalid link" ? "This link is not valid (anymore). Please ask RapidRemove for the current link." : "Could not load: " + e.message);
    }
  }, [token]);
  React.useEffect(() => { load(true); const i = setInterval(() => load(false), 60000); return () => clearInterval(i); }, [load]);
  useLive(() => load(false), !!token); // Live: neue Aufträge / Kunde hat bezahlt sofort sichtbar

  const showToast = React.useCallback((msg, undo, ms) => {
    setToast({ msg, undo: undo || null, k: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms || 3500);
  }, []);
  const closeToast = React.useCallback(() => { clearTimeout(toastTimer.current); setToast(null); }, []);

  /* ---- commit queue (undo window) ---- */
  const flush = React.useCallback((keepalive) => {
    const p = pending.current; if (!p) return;
    clearTimeout(p.timer); pending.current = null; p.run(keepalive);
  }, []);
  React.useEffect(() => {
    const onHide = () => {
      flush(true);
      for (const [id, fn] of Object.entries(noteTimers.current)) { clearTimeout(fn.timer); fn.run(true); delete noteTimers.current[id]; }
    };
    const onVis = () => { if (document.visibilityState === "hidden") onHide(); };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVis);
    return () => { window.removeEventListener("pagehide", onHide); document.removeEventListener("visibilitychange", onVis); };
  }, [flush]);

  const patch = React.useCallback((ids, fn) => {
    const set = new Set(ids);
    setTasks((ts) => (ts || []).map((t) => (set.has(t.id) ? { ...t, ...fn(t) } : t)));
  }, []);

  const touch = React.useCallback((ids) => {
    const ts = tasksRef.current || [];
    const fresh = ids.filter((id) => { const t = ts.find((x) => x.id === id); return t && !t.touched; });
    if (!fresh.length) return;
    patch(fresh, () => ({ touched: true }));
    enqueue(() => call("touch", { t: token, ids: fresh }).catch(() => {}));
  }, [patch, token, enqueue]);

  /** Set a status on tasks. Returns the ids it actually applied to (Removed only from Working; paid tasks are locked). */
  const setMany = React.useCallback((idsIn, status) => {
    const ts = tasksRef.current || [];
    const ids = idsIn.filter((id) => {
      const t = ts.find((x) => x.id === id);
      if (!t || t.status === status) return false;
      if (t.paid && status !== "removed") return false;
      if (status === "removed" && !canRemove(t)) return false;
      return true;
    });
    if (!ids.length) {
      const one = idsIn.length === 1 ? ts.find((x) => x.id === idsIn[0]) : null;
      if (status === "removed") showToast("Set it to Working first");
      else if (one && one.paid) showToast("Paid tasks can’t be changed");
      return [];
    }
    flush(); // commit whatever was still waiting
    if (status === "removed") { verifyRemoved(ids); return ids; } // „Removed" nur nach Lenas Prüfung (Kunde wird belastet)
    const prev = ids.map((id) => { const t = ts.find((x) => x.id === id); return [id, { status: t.status, touched: t.touched, workingSince: t.workingSince }]; });
    const now = Date.now();
    patch(ids, (t) => ({ status, touched: true, workingSince: status === "working" && t.status !== "working" ? now : t.workingSince }));
    const run = (keepalive) => enqueue(() =>
      (ids.length === 1 ? call("update", { t: token, id: ids[0], status: toApi(status) }, keepalive) : call("bulk", { t: token, ids, status: toApi(status) }, keepalive))
        .catch((e) => { showToast("Could not save: " + e.message); load(true); }));
    const mine = { run, timer: null };
    mine.timer = setTimeout(() => { if (pending.current === mine) flush(); }, undoMs);
    pending.current = mine;
    const code = ids.length === 1 ? ts.find((x) => x.id === ids[0]).code : ids.length + (appUi ? " reviews" : " tasks");
    showToast(`${code} → ${STATUS[status].l}`, () => {
      if (pending.current !== mine) return; // already committed
      clearTimeout(mine.timer); pending.current = null;
      const m = new Map(prev);
      setTasks((xs) => (xs || []).map((t) => (m.has(t.id) ? { ...t, ...m.get(t.id) } : t)));
    }, undoMs);
    return ids;
  }, [patch, flush, enqueue, token, showToast, load, undoMs, appUi]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- „Removed" mit Prüfung (Lena öffnet Google und vergleicht) ---- */
  const [ver, setVer] = React.useState(null); // { ids, codes, phase: "checking"|"done", results, run }
  const applyResults = React.useCallback((results) => {
    const done = new Map(results.filter((r) => r.task).map((r) => [r.id, norm(r.task)]));
    if (done.size) setTasks((xs) => (xs || []).map((t) => (done.has(t.id) ? { ...t, ...done.get(t.id) } : t)));
  }, []);
  const verifyRemoved = React.useCallback(async (ids) => {
    const ts = tasksRef.current || [];
    const codes = ids.map((id) => (ts.find((x) => x.id === id) || {}).code || "#" + id);
    setVer({ ids, codes, phase: "checking", results: [], run: Date.now() });
    try {
      const j = await call("verify-removed", { t: token, ids });
      applyResults(j.results || []);
      setVer((v) => ({ ...(v || { ids, codes }), phase: "done", results: j.results || [] }));
    } catch (e) {
      setVer((v) => ({ ...(v || { ids, codes }), phase: "done", results: ids.map((id, i) => ({ id, code: codes[i], result: "unknown", reason: "The check failed (" + e.message + ")." })) }));
    }
  }, [token, applyResults]);
  const confirmRemoved = React.useCallback(async (ids) => {
    for (const id of ids) {
      try { const j = await call("update", { t: token, id, status: "removed", confirm: true }); if (j.task) applyResults([{ id, task: j.task }]); }
      catch (e) { showToast("Could not save: " + e.message); }
    }
    setVer((v) => (v ? { ...v, results: v.results.map((r) => (ids.includes(r.id) ? { ...r, result: "gone" } : r)) } : v));
  }, [token, applyResults, showToast]);

  /** Partner confirms a payout (per review or all). Committed after the undo window like status changes. */
  const markPaid = React.useCallback((idsIn) => {
    const ts = tasksRef.current || [];
    const ids = idsIn.filter((id) => { const t = ts.find((x) => x.id === id); return t && t.status === "removed" && !t.paid; });
    if (!ids.length) return [];
    flush();
    patch(ids, () => ({ paid: true }));
    const run = (keepalive) => enqueue(() => call("mark-paid", { t: token, ids }, keepalive).catch((e) => { showToast("Could not save: " + e.message); load(true); }));
    const mine = { run, timer: null };
    mine.timer = setTimeout(() => { if (pending.current === mine) flush(); }, undoMs);
    pending.current = mine;
    const sumUsd = ids.reduce((s, id) => s + (ts.find((x) => x.id === id).price || 0), 0);
    showToast(ids.length === 1 ? `${ts.find((x) => x.id === ids[0]).code} marked as paid` : `${ids.length} marked as paid · $${sumUsd.toLocaleString("en-US")}`, () => {
      if (pending.current !== mine) return;
      clearTimeout(mine.timer); pending.current = null;
      patch(ids, () => ({ paid: false }));
    }, undoMs);
    return ids;
  }, [flush, patch, enqueue, token, showToast, load, undoMs]);

  const copyText = (txt) => { try { navigator.clipboard.writeText(txt); } catch (e) {} };
  const copyLinks = React.useCallback((ids, header) => {
    const ts = tasksRef.current || [];
    const lines = ids.map((id) => ts.find((x) => x.id === id)).filter(Boolean).map((t) => `${t.code}: ${t.url || "(no link)"}`);
    copyText((header ? header + "\n" : "") + lines.join("\n"));
    touch(ids);
    showToast(`${ids.length} link${ids.length > 1 ? "s" : ""} copied${header ? " · " + header : ""}`);
  }, [touch, showToast]);

  const openReview = React.useCallback((t) => {
    if (!t) return;
    if (t.url) window.open(t.url, "_blank", "noopener,noreferrer");
    touch([t.id]); // nur ansehen – Status ändert sich ausschließlich per Status-Button
  }, [touch]);

  /** Desktop: autosave while typing. */
  const setNoteLive = React.useCallback((t, val) => {
    patch([t.id], () => ({ note: val, touched: true }));
    const prevT = noteTimers.current[t.id]; if (prevT) clearTimeout(prevT.timer);
    const run = (keepalive) => { delete noteTimers.current[t.id]; enqueue(() => call("update", { t: token, id: t.id, note: val }, keepalive).catch((e) => showToast("Note not saved: " + e.message))); };
    noteTimers.current[t.id] = { run, timer: setTimeout(() => run(false), 700) };
  }, [patch, enqueue, token, showToast]);
  /** Mobile: explicit „Save note". */
  const saveNote = React.useCallback((t, val) => {
    const note = String(val || "").trim();
    patch([t.id], () => ({ note, touched: true }));
    enqueue(() => call("update", { t: token, id: t.id, note }).then(() => showToast("Note saved")).catch((e) => showToast("Note not saved: " + e.message)));
  }, [patch, enqueue, token, showToast]);

  /* ---- derived ---- */
  const all = tasks || [];
  // „New order" = der Partner hat bei KEINER offenen Bewertung dieses Kunden einen Status gesetzt
  // (alles noch „new", nie auf Working). Ansehen/Link kopieren zählt nicht als Start.
  const waiting = React.useMemo(() => {
    const m = new Map();
    for (const t of all) {
      if (t.status !== "new" && t.status !== "working") continue;
      const g = m.get(t.cust) || { c: t.cust, n: 0, since: Infinity, started: false };
      g.n++; g.since = Math.min(g.since, t.created || Date.now());
      if (t.status !== "new" || t.workingSince) g.started = true;
      m.set(t.cust, g);
    }
    return [...m.values()].filter((g) => !g.started).sort((a, b) => a.since - b.since);
  }, [all]);
  const newSet = React.useMemo(() => new Set(waiting.map((g) => g.c)), [waiting]);
  const isNewC = React.useCallback((c) => newSet.has(c), [newSet]);
  // Stündlich aufploppen, solange Kunden auf die Bestätigung warten (auch beim Öffnen der App)
  const [nag, setNag] = React.useState(false);
  const nagAt = React.useRef(0);
  React.useEffect(() => {
    if (!waiting.length) { setNag(false); return undefined; }
    const check = () => { if (Date.now() - nagAt.current >= 60 * 60_000 && document.visibilityState === "visible") { nagAt.current = Date.now(); setNag(true); } };
    const first = setTimeout(check, 1500);
    const iv = setInterval(check, 60_000);
    document.addEventListener("visibilitychange", check);
    return () => { clearTimeout(first); clearInterval(iv); document.removeEventListener("visibilitychange", check); };
  }, [waiting.length]);
  const sortAsc = appUi ? true : sortOld;
  const visible = React.useMemo(() => {
    const f = TABS.find((x) => x[0] === tab)[2];
    const ql = q.trim().toLowerCase();
    const r = all.filter(f).filter((t) => !ql || `${t.code} ${t.cust} ${t.who} ${t.text}`.toLowerCase().includes(ql));
    const by = (a, b) => (sortAsc ? (a.created - b.created) || (a.id - b.id) : (b.created - a.created) || (b.id - a.id));
    r.sort(by);
    const order = []; r.forEach((t) => { if (!order.includes(t.cust)) order.push(t.cust); });
    return r.sort((a, b) => (isNewC(b.cust) - isNewC(a.cust)) || (order.indexOf(a.cust) - order.indexOf(b.cust)) || by(a, b));
  }, [all, tab, q, sortAsc, isNewC]);
  const groups = React.useMemo(() => {
    const m = new Map(); visible.forEach((t) => { if (!m.has(t.cust)) m.set(t.cust, []); m.get(t.cust).push(t); });
    return [...m];
  }, [visible]);

  // App-Badge = offene Aufgaben (Not started + Working).
  React.useEffect(() => {
    if (!tasks) return;
    try {
      const n = tasks.filter((t) => t.status === "new" || t.status === "working").length;
      if (navigator.setAppBadge) (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {});
    } catch (e) { /* */ }
  }, [tasks]);

  // Push aufdrängen: nach jedem Öffnen, solange nicht eingeschaltet („Not now" gilt nur für diese Sitzung).
  React.useEffect(() => {
    if (!token || setup || offerPk || tasks === null) return; // erst nach dem Laden
    let off = false;
    pushState("partner").then((st) => {
      if (off) return;
      if (st === "on") enablePush("partner", token, true).catch(() => {}); // Gerät am Server (neu) eintragen
      else if (["ask", "install", "blocked"].includes(st)) setGate(st);
    }).catch(() => {});
    return () => { off = true; };
  }, [token, setup, offerPk, preview, tasks === null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!OPS) return <div className="prt"><div className="pmsg">Not configured.</div></div>;
  if (token === null || isMobile === null) return <div className="prt" />;
  const onLogin = (t, viaPasskey) => {
    try { localStorage.setItem(KEY, t); } catch (e) {}
    try { if (window.location.hash || window.location.search) window.history.replaceState(null, "", window.location.pathname); } catch (e) {}
    setSetup(null); setToken(t);
    // Nach dem Passwort-Login einmal Face ID anbieten.
    if (!viaPasskey && String(t).startsWith("ps_") && passkeySupported() && !passkeyOnDevice("partner") && !passkeyDismissed("partner")) setOfferPk(true);
  };
  if (offerPk && token) return <PasskeyOffer role="partner" token={token} onDone={() => setOfferPk(false)} />;
  if (gate && token && !setup) return <PushGate role="partner" token={token} state={gate} onDone={(on) => { setGate(null); if (on) showToast("Notifications are on"); }} texts={{ pushSub: "Get a notification for every new order and when a customer has paid – instantly.", appIos2s: "Then open “RR Partner” from your home screen" }} />;
  if (!token) return <PartnerLogin mode="login" onToken={onLogin} />;
  if (setup) return <PartnerLogin mode="setup" linkToken={token} account={setup.account} onToken={onLogin} onSkip={() => { try { localStorage.setItem(SKIP_KEY, "1"); } catch (e) {} setSetup(null); }} />;

  const api = {
    tasks, all, cancelled, err, visible, groups, isNewC, waiting, tab, setTab, q, setQ, sortOld, setSortOld, expanded, setExpanded, sel, setSel,
    toast, closeToast, showToast, setMany, markPaid, copyLinks, openReview, setNoteLive, saveNote, touch, load, flush, token,
  };
  const waitPop = nag && waiting.length ? (
    <div className="pwait-bg" onClick={() => setNag(false)}>
      <div className="pwait" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <span className="pw-ic">⏳</span>
        <b>Customer waiting for order confirmation</b>
        <p>{waiting.length === 1 ? "This order hasn't been started yet:" : `${waiting.length} orders haven't been started yet:`}</p>
        <ul>{waiting.slice(0, 6).map((g) => <li key={g.c}><span>{g.c}</span><em>{g.n} review{g.n > 1 ? "s" : ""} · waiting {fmtWait(g.since)}</em></li>)}</ul>
        <p className="pw-s">Please set the reviews to <b>Working</b> as soon as you start – the customer sees it live.</p>
        <button type="button" onClick={() => setNag(false)}>OK, starting now</button>
      </div>
    </div>
  ) : null;
  // Aktuelles Design = App-Ansicht, auch am Desktop (dort mittig als schmale Spalte). Alte Tabellen-Ansicht nur noch per ?view=table.
  const app = <>{tableView ? <PartnerDesktop api={api} /> : <PartnerApp api={api} />}{waitPop}
    <RemovalCheck state={ver} token={token} onClose={() => { setVer(null); load(false); }} onAgain={(ids) => verifyRemoved(ids)} onConfirm={confirmRemoved} /></>;
  if (!preview) return app;
  return (
    <>
      <div className="prt-testbar">TEST MODE · only test orders · the partner doesn’t see this</div>
      <div className="prt-test">{app}</div>
    </>
  );
}
