"use client";
/* Partner board (rapid-remove.com/partner#<secret>) — work queue for our review-removal partner.
   Designs: Claude Design handoffs „Partner Review Tasks – Mobile" (priority) and the desktop
   master–detail view. Tasks are grouped by customer (= public business-profile name); no buyer
   contact data is ever shown. Status changes are committed after the undo window, one after the
   other, so an accidental „Software only" never reaches the customer dashboard. */
import React from "react";
import "@/styles/partner.css";
import { OPS, BASE, TABS, STATUS, canRemove, toApi, norm, call } from "./shared";
import PartnerDesktop from "./PartnerDesktop";
import PartnerApp from "./PartnerApp";
import PartnerLogin from "./PartnerLogin";

const SKIP_KEY = "rr_partner_setup_skip";

const KEY = "rr_partner_t";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
const MOBILE_Q = "(max-width: 860px)";

export default function PartnerBoard() {
  const [token, setToken] = React.useState(null);
  const [setup, setSetup] = React.useState(null); // { account } → Login über den persönlichen Link einrichten
  const [isMobile, setIsMobile] = React.useState(null);
  const [tasks, setTasks] = React.useState(null);
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
  const undoMs = isMobile ? 3500 : 4000;

  React.useEffect(() => {
    let t = "";
    try { t = (window.location.hash || "").replace(/^#/, ""); } catch (e) {}
    const fromLink = !!t;
    if (t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
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
      setTasks((j.tasks || []).map(norm)); setErr("");
    } catch (e) {
      if (e.message === "invalid link" && String(token).startsWith("ps_")) { try { localStorage.removeItem(KEY); } catch (x) {} setToken(""); return; } // Sitzung abgelaufen → Login
      setErr(e.message === "invalid link" ? "This link is not valid (anymore). Please ask RapidRemove for the current link." : "Could not load: " + e.message);
    }
  }, [token]);
  React.useEffect(() => { load(true); const i = setInterval(() => load(false), 60000); return () => clearInterval(i); }, [load]);

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
    const prev = ids.map((id) => { const t = ts.find((x) => x.id === id); return [id, { status: t.status, touched: t.touched, workingSince: t.workingSince }]; });
    const now = Date.now();
    patch(ids, (t) => ({ status, touched: true, workingSince: status === "working" && t.status !== "working" ? now : t.workingSince }));
    const run = (keepalive) => enqueue(() =>
      (ids.length === 1 ? call("update", { t: token, id: ids[0], status: toApi(status) }, keepalive) : call("bulk", { t: token, ids, status: toApi(status) }, keepalive))
        .catch((e) => { showToast("Could not save: " + e.message); load(true); }));
    const mine = { run, timer: null };
    mine.timer = setTimeout(() => { if (pending.current === mine) flush(); }, undoMs);
    pending.current = mine;
    const code = ids.length === 1 ? ts.find((x) => x.id === ids[0]).code : ids.length + (isMobile ? " reviews" : " tasks");
    showToast(`${code} → ${STATUS[status].l}`, () => {
      if (pending.current !== mine) return; // already committed
      clearTimeout(mine.timer); pending.current = null;
      const m = new Map(prev);
      setTasks((xs) => (xs || []).map((t) => (m.has(t.id) ? { ...t, ...m.get(t.id) } : t)));
    }, undoMs);
    return ids;
  }, [patch, flush, enqueue, token, showToast, load, undoMs, isMobile]);

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
    if (t.status === "new") setMany([t.id], "working"); else touch([t.id]);
  }, [setMany, touch]);

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
  const touchedC = React.useMemo(() => new Set(all.filter((t) => t.touched).map((t) => t.cust)), [all]);
  const isNewC = React.useCallback((c) => !touchedC.has(c), [touchedC]);
  const sortAsc = isMobile ? true : sortOld;
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

  if (!OPS) return <div className="prt"><div className="pmsg">Not configured.</div></div>;
  if (token === null || isMobile === null) return <div className="prt" />;
  const onLogin = (t) => {
    try { localStorage.setItem(KEY, t); } catch (e) {}
    try { if (window.location.hash || window.location.search) window.history.replaceState(null, "", window.location.pathname); } catch (e) {}
    setSetup(null); setToken(t);
  };
  if (!token) return <PartnerLogin mode="login" onToken={onLogin} />;
  if (setup) return <PartnerLogin mode="setup" linkToken={token} account={setup.account} onToken={onLogin} onSkip={() => { try { localStorage.setItem(SKIP_KEY, "1"); } catch (e) {} setSetup(null); }} />;

  const api = {
    tasks, all, err, visible, groups, isNewC, tab, setTab, q, setQ, sortOld, setSortOld, expanded, setExpanded, sel, setSel,
    toast, closeToast, showToast, setMany, markPaid, copyLinks, openReview, setNoteLive, saveNote, touch, load, flush, token,
  };
  return isMobile ? <PartnerApp api={api} /> : <PartnerDesktop api={api} />;
}
