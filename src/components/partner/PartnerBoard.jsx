"use client";
/* Partner board (rapid-remove.com/partner#<secret>) — work queue for our review-removal partner.
   Design: Claude Design handoff „Partner Review Tasks" (master–detail, grouped by customer =
   public business-profile name, keyboard triage, bulk actions, instant tooltips, undo).
   No buyer contact data is ever shown. Status changes are committed after the 4 s undo window
   (so an accidental „Software only" never reaches the customer dashboard). */
import React from "react";
import {
  RefreshCw, Keyboard, Search, ArrowDownUp, ChevronsDownUp, ChevronDown, ChevronUp, X, CircleDashed, Loader,
  CheckCircle2, Ban, Cpu, Link as LinkIcon, ArrowUpRight, StickyNote, Store, Clock, Wallet, Banknote,
} from "lucide-react";
import "@/styles/partner.css";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const KEY = "rr_partner_t";
const AUTO_KEY = "rr_partner_autonext";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap";
const UNDO_MS = 4000;

const STATUS = {
  new: { l: "Not started", I: CircleDashed, d: "Not started yet" },
  working: { l: "Working", I: Loader, d: "You started on it" },
  removed: { l: "Removed", I: CheckCircle2, d: "Review is gone" },
  notpossible: { l: "Not possible", I: Ban, d: "Can’t be removed" },
  software: { l: "Software only", I: Cpu, d: "Needs the software" },
};
const MARKS = ["working", "removed", "notpossible", "software"];
const TABS = [
  ["todo", "To do", (t) => t.status === "new" || t.status === "working"],
  ["removed", "Removed", (t) => t.status === "removed"],
  ["closed", "Not possible", (t) => t.status === "notpossible" || t.status === "software"],
  ["all", "All", () => true],
];
const toUi = (s) => (s === "not_possible" ? "notpossible" : s || "new");
const toApi = (s) => (s === "notpossible" ? "not_possible" : s);
const usd = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const ago = (ms) => {
  if (!ms) return "";
  const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
};
const hostOf = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch (e) { return ""; } };

function norm(t) {
  const who = (t.reviewer || "").trim();
  const text = (t.text || "").trim();
  return {
    id: t.id, code: t.code, cust: (t.customer || "").trim() || "Other", url: t.url || "",
    who: who || (text ? "Reviewer" : "Review link"), text: text || (t.url ? (hostOf(t.url) + " · no preview, open the link") : ""),
    price: Number(t.price || 0), old: t.kind === "old", nt: t.kind === "nt", status: toUi(t.status), paid: !!t.paid,
    note: t.note || "", created: t.created ? new Date(t.created).getTime() : 0, touched: !!t.touched,
  };
}

async function call(path, body, keepalive) {
  const res = await fetch(OPS + "/partner/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: !!keepalive });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || "HTTP " + res.status);
  return j;
}

/* ---------- small pieces ---------- */
function Pill({ status, paid, style }) {
  const s = STATUS[status] || STATUS.new;
  return <span className={"pill s-" + status} data-tip={s.d} style={style}><s.I />{status === "removed" && paid ? "Paid" : s.l}</span>;
}
function Check({ checked, indeterminate, onClick, tip, k, label }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <label className="cb" data-tip={tip} data-k={k} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(e); }}>
      <input ref={ref} type="checkbox" checked={!!checked} readOnly aria-label={label || tip} />
    </label>
  );
}

const Row = React.memo(function Row({ t, isCur, isSel, onRow, onCheck, onSet, onOpen }) {
  const [hydrated, setHydrated] = React.useState(false); // quick actions are rendered lazily on first hover
  const s = STATUS[t.status] || STATUS.new;
  return (
    <div className={"row cols" + (isCur ? " cur" : "") + (isSel ? " sel" : "")} data-id={t.id} onMouseEnter={() => { if (!hydrated) setHydrated(true); }} onClick={(e) => onRow(t, e)}>
      <Check checked={isSel} onClick={(e) => onCheck(t.id, e.shiftKey)} tip="Select" k="X" label={"Select " + t.code} />
      <span className="rv">{t.code}</span>
      <div className="r2">
        {t.note ? <span className="noteic" data-tip="Has a note"><StickyNote /></span> : null}
        <span className="who">{t.who}</span>{t.text}
      </div>
      <span className={"agec" + (t.old || t.nt ? " o" : "")} data-tip={t.old ? "Review is older than 4 weeks" : t.nt ? "Review has no text" : undefined}>{t.old ? "4+ weeks" : t.nt ? "No text" : ago(t.created)}</span>
      <div className="rend">
        <span className={"pill s-" + t.status} data-tip={s.d}><s.I />{t.status === "removed" && t.paid ? "Paid" : s.l}</span>
        {hydrated ? (
          <div className="quick" onClick={(e) => e.stopPropagation()}>
            {!t.paid ? MARKS.map((k, i) => {
              const M = STATUS[k];
              return <button key={k} type="button" className={"qb " + k + (t.status === k ? " on" : "")} data-tip={"Mark as " + M.l} data-k={String(i + 1)} onClick={() => onSet(t.id, k)}><M.I /></button>;
            }) : null}
            <button type="button" className="qb go" data-tip="Open review on Google" data-k="O" onClick={() => onOpen(t)}><ArrowUpRight /></button>
          </div>
        ) : null}
      </div>
    </div>
  );
});

function GroupRow({ c, list, all, isNew, collapsed, tab, onToggle, onSelAll, nSel }) {
  const removed = all.filter((t) => t.status === "removed").length;
  const amt = list.reduce((s, t) => s + t.price, 0);
  return (
    <div className={"grp" + (collapsed ? " col" : "") + (isNew ? " isnew" : "")}>
      <Check checked={nSel > 0 && nSel === list.length} indeterminate={nSel > 0 && nSel < list.length} onClick={onSelAll} tip="Select all of this customer" />
      <button type="button" className="gt" data-tip={(collapsed ? "Expand" : "Collapse") + " customer"} onClick={onToggle}>
        <ChevronDown />
        <span className="gn">{c}</span>
        {isNew ? <span className="gnew" data-tip="New order – no action taken yet">New</span> : null}
        <span className="gm">{list.length} {tab === "todo" ? "open" : "review" + (list.length === 1 ? "" : "s")} · {removed} removed · {usd(amt)}</span>
      </button>
    </div>
  );
}

/* ---------- board ---------- */
export default function PartnerBoard() {
  const [token, setToken] = React.useState(null);
  const [tasks, setTasks] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [tab, setTab] = React.useState("todo");
  const [q, setQ] = React.useState("");
  const [sortOld, setSortOld] = React.useState(true);
  const [expanded, setExpanded] = React.useState(() => new Set()); // default: all customers collapsed
  const [sel, setSel] = React.useState(() => new Set());
  const [cur, setCur] = React.useState(null);
  const [anchor, setAnchor] = React.useState(null);
  const [autoNext, setAutoNext] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null); // { msg, undo }
  const [spin, setSpin] = React.useState(false);

  const tasksRef = React.useRef(null); tasksRef.current = tasks;
  const pending = React.useRef(null);   // { timer, run, revert } — status change waiting out the undo window
  const noteTimers = React.useRef({});
  const toastTimer = React.useRef(null);
  const listRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const noteRef = React.useRef(null);
  const tipRef = React.useRef(null);

  /* token + font + persisted settings */
  React.useEffect(() => {
    let t = "";
    try { t = (window.location.hash || "").replace(/^#/, ""); } catch (e) {}
    if (t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    else { try { t = localStorage.getItem(KEY) || ""; } catch (e) {} }
    setToken(t);
    try { const a = localStorage.getItem(AUTO_KEY); if (a != null) setAutoNext(a === "1"); } catch (e) {}
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_HREF; document.head.appendChild(l);
    }
  }, []);

  const load = React.useCallback(async (manual) => {
    if (!token) return;
    if (!manual && (pending.current || Object.keys(noteTimers.current).length)) return; // don't clobber unsaved local changes
    try {
      const j = await call("tasks", { t: token });
      setTasks((j.tasks || []).map(norm)); setErr("");
    } catch (e) {
      setErr(e.message === "invalid link" ? "This link is not valid (anymore). Please ask RapidRemove for the current link." : "Could not load: " + e.message);
    }
  }, [token]);
  React.useEffect(() => { load(true); const i = setInterval(() => load(false), 60000); return () => clearInterval(i); }, [load]);

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
    window.addEventListener("pagehide", onHide);
    const onVis = () => { if (document.visibilityState === "hidden") onHide(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { window.removeEventListener("pagehide", onHide); document.removeEventListener("visibilitychange", onVis); };
  }, [flush]);

  const showToast = React.useCallback((msg, undo) => {
    setToast({ msg, undo: undo || null, k: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), UNDO_MS);
  }, []);

  const patch = React.useCallback((ids, fn) => {
    const set = new Set(ids);
    setTasks((ts) => (ts || []).map((t) => (set.has(t.id) ? { ...t, ...fn(t) } : t)));
  }, []);

  const touch = React.useCallback((ids) => {
    const ts = tasksRef.current || [];
    const fresh = ids.filter((id) => { const t = ts.find((x) => x.id === id); return t && !t.touched; });
    if (!fresh.length) return;
    patch(fresh, () => ({ touched: true }));
    call("touch", { t: token, ids: fresh }).catch(() => {});
  }, [patch, token]);

  /* ---- derived lists ---- */
  const all = tasks || [];
  const touchedC = React.useMemo(() => new Set(all.filter((t) => t.touched).map((t) => t.cust)), [all]);
  const isNewC = React.useCallback((c) => !touchedC.has(c), [touchedC]);
  const visible = React.useMemo(() => {
    const f = TABS.find((x) => x[0] === tab)[2];
    const ql = q.trim().toLowerCase();
    const r = all.filter(f).filter((t) => !ql || `${t.code} ${t.cust} ${t.who} ${t.text}`.toLowerCase().includes(ql));
    const by = (a, b) => (sortOld ? (a.created - b.created) || (a.id - b.id) : (b.created - a.created) || (b.id - a.id));
    r.sort(by);
    const order = []; r.forEach((t) => { if (!order.includes(t.cust)) order.push(t.cust); });
    return r.sort((a, b) => (isNewC(b.cust) - isNewC(a.cust)) || (order.indexOf(a.cust) - order.indexOf(b.cust)) || by(a, b));
  }, [all, tab, q, sortOld, isNewC]);
  const groups = React.useMemo(() => {
    const m = new Map(); visible.forEach((t) => { if (!m.has(t.cust)) m.set(t.cust, []); m.get(t.cust).push(t); });
    return [...m];
  }, [visible]);
  const navList = React.useMemo(() => visible.filter((t) => expanded.has(t.cust)), [visible, expanded]);
  const byId = (id) => all.find((t) => t.id === id);
  const curT = cur != null ? byId(cur) : null;

  /* ---- actions ---- */
  const scrollCur = React.useCallback((id) => {
    requestAnimationFrame(() => {
      const el = document.querySelector(`.prt .row[data-id="${id}"]`), p = listRef.current;
      if (!el || !p) return;
      const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
      if (r.top < pr.top + 86) p.scrollTop -= pr.top + 86 - r.top; else if (r.bottom > pr.bottom) p.scrollTop += r.bottom - pr.bottom;
    });
  }, []);

  const setMany = React.useCallback((idsIn, status) => {
    const ts = tasksRef.current || [];
    const ids = idsIn.filter((id) => { const t = ts.find((x) => x.id === id); return t && (!t.paid || status === "removed"); });
    if (!ids.length) { showToast("Paid tasks can’t be changed"); return; }
    flush(); // commit whatever was waiting
    const prev = ids.map((id) => { const t = ts.find((x) => x.id === id); return [id, t.status, t.touched]; });
    const wasSel = sel.size > 0;
    // auto-advance: next task in the navigable list (computed before the status change)
    let nextCur = cur;
    if (!wasSel && autoNext && ids.length === 1 && ids[0] === cur) {
      const v = navList.map((t) => t.id); const i = v.indexOf(cur);
      const f = TABS.find((x) => x[0] === tab)[2];
      const stays = f({ ...ts.find((x) => x.id === cur), status });
      nextCur = stays ? (v[i + 1] ?? cur) : (v[i + 1] ?? v[i - 1] ?? null);
    }
    patch(ids, () => ({ status, touched: true }));
    if (wasSel) setSel(new Set());
    if (nextCur !== cur) { setCur(nextCur); if (nextCur != null) scrollCur(nextCur); }
    const run = (keepalive) => {
      const p = ids.length === 1 ? call("update", { t: token, id: ids[0], status: toApi(status) }, keepalive) : call("bulk", { t: token, ids, status: toApi(status) }, keepalive);
      p.catch((e) => { showToast("Could not save: " + e.message); load(true); });
    };
    const revert = () => {
      const m = new Map(prev.map(([id, s, tc]) => [id, { status: s, touched: tc }]));
      setTasks((xs) => (xs || []).map((t) => (m.has(t.id) ? { ...t, ...m.get(t.id) } : t)));
    };
    const mine = { run, revert, timer: setTimeout(() => { if (pending.current === mine) flush(); }, UNDO_MS) };
    pending.current = mine;
    const code = ids.length === 1 ? ts.find((x) => x.id === ids[0]).code : ids.length + " tasks";
    showToast(`${code} → ${STATUS[status].l}`, () => {
      if (pending.current !== mine) return; // already committed
      clearTimeout(mine.timer); pending.current = null; mine.revert();
    });
  }, [sel, cur, autoNext, navList, tab, patch, flush, token, showToast, load, scrollCur]);

  const copyLinks = React.useCallback((ids) => {
    const ts = tasksRef.current || [];
    const lines = ids.map((id) => ts.find((x) => x.id === id)).filter(Boolean).map((t) => `${t.code}: ${t.url || "(no link)"}`);
    try { navigator.clipboard.writeText(lines.join("\n")); } catch (e) {}
    touch(ids);
    showToast(`${ids.length} link${ids.length > 1 ? "s" : ""} copied`);
  }, [touch, showToast]);

  const openReview = React.useCallback((t) => {
    if (!t) return;
    if (t.url) window.open(t.url, "_blank", "noopener,noreferrer");
    if (t.status === "new") setMany([t.id], "working"); else touch([t.id]);
  }, [setMany, touch]);

  const setNote = (t, val) => {
    patch([t.id], () => ({ note: val, touched: true }));
    const prevT = noteTimers.current[t.id]; if (prevT) clearTimeout(prevT.timer);
    const run = (keepalive) => { delete noteTimers.current[t.id]; call("update", { t: token, id: t.id, note: val }, keepalive).catch((e) => showToast("Note not saved: " + e.message)); };
    noteTimers.current[t.id] = { run, timer: setTimeout(() => run(false), 700) };
  };

  const toggleSel = React.useCallback((id, shift) => {
    const v = navList.map((t) => t.id);
    setSel((s0) => {
      const s = new Set(s0);
      if (shift && anchor != null && v.includes(anchor) && v.includes(id)) {
        const [a, b] = [v.indexOf(anchor), v.indexOf(id)].sort((x, y) => x - y);
        const on = !s.has(id); v.slice(a, b + 1).forEach((x) => (on ? s.add(x) : s.delete(x)));
      } else { s.has(id) ? s.delete(id) : s.add(id); }
      return s;
    });
    if (!shift) setAnchor(id);
  }, [navList, anchor]);

  const move = React.useCallback((d, ext) => {
    const v = navList.map((t) => t.id); if (!v.length) return;
    let i = v.indexOf(cur); i = i < 0 ? 0 : Math.max(0, Math.min(v.length - 1, i + d));
    const id = v[i]; setCur(id); if (ext) setSel((s) => new Set(s).add(id)); scrollCur(id);
  }, [navList, cur, scrollCur]);

  const onRow = React.useCallback((t, e) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) { toggleSel(t.id, e.shiftKey); return; }
    setCur(t.id); setMobileOpen(true);
  }, [toggleSel]);
  const onSetOne = React.useCallback((id, k) => { setMany(sel.has(id) && sel.size > 1 ? [...sel] : [id], k); }, [sel, setMany]);

  /* ---- keyboard ---- */
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches && e.target.matches("input:not([type=checkbox]),textarea")) { if (e.key === "Escape") e.target.blur(); return; }
      const k = (e.key || "").toLowerCase();
      if (k === "/") { e.preventDefault(); searchRef.current && searchRef.current.focus(); return; }
      if (k === "arrowdown" || k === "j") { e.preventDefault(); move(1, e.shiftKey); return; }
      if (k === "arrowup" || k === "k") { e.preventDefault(); move(-1, e.shiftKey); return; }
      if (k === "escape") { if (sel.size) setSel(new Set()); else setMobileOpen(false); return; }
      if ((e.metaKey || e.ctrlKey) && k === "a") { e.preventDefault(); setSel(new Set(navList.map((t) => t.id))); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (k === "x" && cur != null) { toggleSel(cur, e.shiftKey); return; }
      if (["1", "2", "3", "4"].includes(k) && (sel.size || cur != null)) { setMany(sel.size ? [...sel] : [cur], MARKS[+k - 1]); return; }
      if (k === "o" && curT) { openReview(curT); return; }
      if (k === "c" && (cur != null || sel.size)) { copyLinks(sel.size ? [...sel] : [cur]); return; }
      if (k === "n" && cur != null) { e.preventDefault(); noteRef.current && noteRef.current.focus(); return; }
      if (k === "?") { showToast(SHORTCUTS); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [move, sel, navList, cur, curT, toggleSel, setMany, openReview, copyLinks, showToast]);

  /* ---- instant tooltip (no delay) ---- */
  React.useEffect(() => {
    const tip = tipRef.current; if (!tip) return;
    let el = null;
    const hide = () => { tip.style.display = "none"; el = null; };
    const show = (t) => {
      el = t;
      tip.textContent = t.dataset.tip;
      if (t.dataset.k) { const kb = document.createElement("kbd"); kb.textContent = t.dataset.k; tip.appendChild(document.createTextNode(" ")); tip.appendChild(kb); }
      tip.style.display = "flex";
      const r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      let top = r.top - h - 8, below = false;
      if (top < 6) { top = r.bottom + 8; below = true; }
      tip.classList.toggle("below", below);
      tip.style.top = top + "px";
      tip.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, r.left + r.width / 2 - w / 2)) + "px";
    };
    const over = (e) => { const t = e.target.closest && e.target.closest(".prt [data-tip]"); if (t === el) return; t ? show(t) : hide(); };
    document.addEventListener("mouseover", over);
    document.addEventListener("scroll", hide, true);
    document.addEventListener("click", hide, true);
    return () => { document.removeEventListener("mouseover", over); document.removeEventListener("scroll", hide, true); document.removeEventListener("click", hide, true); };
  }, [token]); // the tooltip element only exists once the board itself renders

  /* ---- render ---- */
  if (!OPS) return <div className="prt"><div className="pmsg">Not configured.</div></div>;
  if (token === null) return <div className="prt" />;
  if (!token) return <div className="prt"><div className="pmsg"><img src={`${BASE}/assets/rapidremove-icon.png`} alt="" /><b>Partner Board</b>Please open the personal link you received from RapidRemove.</div></div>;

  const rem = all.filter((t) => t.status === "removed");
  const due = rem.filter((t) => !t.paid), paid = rem.filter((t) => t.paid);
  const sum = (a) => a.reduce((s, t) => s + t.price, 0);
  const vSel = navList.filter((t) => sel.has(t.id)).length;
  const allCollapsed = groups.every(([c]) => !expanded.has(c));
  const v = visible.map((t) => t.id), ci = curT ? v.indexOf(curT.id) : -1;

  return (
    <div className="prt">
      <div className="app">
        <header className="top">
          <div className="brand"><img src={`${BASE}/assets/rapidremove-icon.png`} alt="" />Review tasks<span className="p">Partner</span></div>
          <div className="kpis">
            <div className="kpi"><b>{all.filter((t) => t.status === "new" || t.status === "working").length}</b><span>Open</span></div>
            <div className="kpi"><b>{rem.length}</b><span>Removed</span></div>
            <div className="kpi pay"><b>{usd(sum(due))}</b><span>To be paid</span></div>
            <div className="kpi"><b>{usd(sum(paid))}</b><span>Paid</span></div>
          </div>
          <span className="vsep" />
          <button type="button" className={"ib" + (spin ? " spin" : "")} data-tip="Refresh list" onClick={() => { setSpin(false); requestAnimationFrame(() => setSpin(true)); setTimeout(() => setSpin(false), 700); flush(); load(true).then(() => showToast("List is up to date")); }}><RefreshCw /></button>
          <button type="button" className="ib" data-tip="Keyboard shortcuts" data-k="?" onClick={() => showToast(SHORTCUTS)}><Keyboard /></button>
        </header>

        <div className={"bar" + (sel.size ? " bulk" : "")}>
          {!sel.size ? (
            <>
              <div className="tabs">
                {TABS.map(([k, l, f]) => (
                  <button key={k} type="button" className={"tab" + (tab === k ? " on" : "")} onClick={() => { setTab(k); setSel(new Set()); setCur(null); if (listRef.current) listRef.current.scrollTop = 0; }}>
                    {l}<span className="n">{all.filter(f).length}</span>
                  </button>
                ))}
              </div>
              <label className="search"><Search /><input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search RV number, customer or text" /><kbd>/</kbd></label>
              <button type="button" className="sort" data-tip="Change sort order" onClick={() => setSortOld((x) => !x)}><ArrowDownUp />{sortOld ? "Oldest first" : "Newest first"}</button>
              <button type="button" className="sort sort2" data-tip="Collapse / expand all customers" onClick={() => setExpanded(allCollapsed ? new Set(groups.map(([c]) => c)) : new Set())}><ChevronsDownUp />{allCollapsed ? "Expand all" : "Collapse all"}</button>
            </>
          ) : (
            <div className="bulkbar">
              <span className="cnt"><b>{sel.size}</b> selected</span>
              {MARKS.map((k, i) => { const M = STATUS[k]; return <button key={k} type="button" className="bk" data-tip={"Mark all as " + M.l} data-k={String(i + 1)} onClick={() => setMany([...sel], k)}><M.I /><span className="t">{M.l}</span></button>; })}
              <button type="button" className="bk" data-tip="Copy all review links" onClick={() => copyLinks([...sel])}><LinkIcon /><span className="t">Copy links</span></button>
              <button type="button" className="bk x" data-tip="Clear selection" data-k="Esc" onClick={() => setSel(new Set())}><X /><span className="t">Clear</span></button>
            </div>
          )}
        </div>

        <div className="main">
          <section className="listpane" ref={listRef}>
            <div className="lhead cols">
              <Check checked={vSel > 0 && vSel === navList.length} indeterminate={vSel > 0 && vSel < navList.length} tip="Select all on screen"
                onClick={() => setSel((s) => { const n = new Set(s); const on = !(vSel > 0 && vSel === navList.length); navList.forEach((t) => (on ? n.add(t.id) : n.delete(t.id))); return n; })} />
              <span>Task</span>
              <span>{sel.size ? `Review · ${sel.size} of ${visible.length} selected` : `Review · ${visible.length}`}</span>
              <span className="hage">Age</span>
              <span>Status</span>
            </div>
            {err ? <div className="perr">{err}</div> : null}
            {!tasks && !err ? <div className="empty"><b>Loading …</b></div> : null}
            {tasks && !visible.length ? (
              <div className="empty"><img src={`${BASE}/assets/rapidremove-rocket-orange.png`} alt="" /><b>{q ? "No matching task" : "All done here"}</b>{q ? "Check the RV number." : "Nothing in this list right now."}</div>
            ) : null}
            {groups.map(([c, list]) => {
              const col = !expanded.has(c);
              const nSel = list.filter((t) => sel.has(t.id)).length;
              return (
                <React.Fragment key={c}>
                  <GroupRow c={c} list={list} all={all.filter((t) => t.cust === c)} isNew={isNewC(c)} collapsed={col} tab={tab} nSel={nSel}
                    onToggle={() => setExpanded((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; })}
                    onSelAll={() => setSel((s) => { const n = new Set(s); const on = !list.every((t) => n.has(t.id)); list.forEach((t) => (on ? n.add(t.id) : n.delete(t.id))); return n; })} />
                  {col ? null : list.map((t) => (
                    <Row key={t.id} t={t} isCur={cur === t.id} isSel={sel.has(t.id)} onRow={onRow} onCheck={toggleSel} onSet={onSetOne} onOpen={openReview} />
                  ))}
                </React.Fragment>
              );
            })}
          </section>

          <aside className={"detail" + (mobileOpen && curT ? " show" : "")}>
            {!curT ? (
              <div className="dempty"><b>Select a task</b>Expand a customer and click a review to start.</div>
            ) : (
              <>
                <div className="dh">
                  <div>
                    <div className="sub cust"><Store />{curT.cust}</div>
                    <div className="rvbig">{curT.code}</div>
                    <div className="sub">
                      <Pill status={curT.status} paid={curT.paid} style={{ minWidth: 0 }} />
                      {curT.old ? <span className="old"><Clock />Older than 4 weeks</span> : null}
                      {curT.nt ? <span className="old"><Clock />No text</span> : null}
                      <span>Sent {ago(curT.created)}</span>
                    </div>
                  </div>
                  <div className="dright">
                    <div className="navs">
                      <button type="button" className="ib closeD" data-tip="Close" onClick={() => setMobileOpen(false)}><X /></button>
                      <button type="button" className="ib" data-tip="Previous task" data-k="↑" disabled={ci <= 0} onClick={() => move(-1)}><ChevronUp /></button>
                      <button type="button" className="ib" data-tip="Next task" data-k="↓" disabled={ci >= v.length - 1} onClick={() => move(1)}><ChevronDown /></button>
                    </div>
                    <span className="amt">{usd(curT.price)}</span>
                  </div>
                </div>
                <div className="dbody">
                  <div className="card quote"><b>{curT.who}</b>{curT.text ? `“${curT.text}”` : null}</div>
                  <div className="openrow">
                    <button type="button" className="btn btn-primary" disabled={!curT.url} onClick={() => openReview(curT)}><ArrowUpRight />Open review on Google<kbd>O</kbd></button>
                    <button type="button" className="btn btn-line" data-tip="Copy review link" data-k="C" onClick={() => copyLinks([curT.id])}><LinkIcon /></button>
                  </div>
                  <div>
                    {curT.status === "removed" ? (
                      <>
                        <div className="lbl">Result</div>
                        <div className="card paybox">
                          {curT.paid ? <Banknote /> : <Wallet />}{curT.paid ? "Paid out" : usd(curT.price) + " to be paid"}
                          {!curT.paid ? <button type="button" className="btn btn-line reopen" onClick={() => setMany([curT.id], "working")}>Reopen</button> : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="lbl"><span>Mark as</span></div>
                        <div className="marks">
                          {MARKS.map((k, i) => { const M = STATUS[k]; return <button key={k} type="button" className={"mk " + k + (curT.status === k ? " on" : "")} data-tip={M.d} onClick={() => setMany([curT.id], k)}><M.I />{M.l}<kbd>{i + 1}</kbd></button>; })}
                        </div>
                        <label className="auto"><input type="checkbox" checked={autoNext} onChange={(e) => { setAutoNext(e.target.checked); try { localStorage.setItem(AUTO_KEY, e.target.checked ? "1" : "0"); } catch (x) {} }} />Jump to next task after marking</label>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="lbl"><span>Note</span><span className="saved">Saved automatically</span></div>
                    <textarea ref={noteRef} value={curT.note} onChange={(e) => setNote(curT, e.target.value)} placeholder="e.g. reason it’s not possible, or ETA" maxLength={500} />
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
      <div className="ptip" ref={tipRef} />
      <div className={"toast" + (toast ? " show" : "")}>
        <span>{toast ? toast.msg : ""}</span>
        {toast && toast.undo ? <button type="button" onClick={() => { toast.undo(); setToast(null); }}>Undo</button> : null}
      </div>
    </div>
  );
}

const SHORTCUTS = "↑↓ move · X select · Shift+click range · 1–4 mark · O open · C copy · / search · Esc clear";
