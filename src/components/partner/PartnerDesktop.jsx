"use client";
/* Partner board — desktop master–detail view (Claude Design handoff „Partner Review Tasks"). */
import React from "react";
import {
  RefreshCw, Keyboard, Search, ArrowDownUp, ChevronsDownUp, ChevronDown, ChevronUp, X,
  Link as LinkIcon, ArrowUpRight, StickyNote, Store, Clock, Wallet, Banknote,
} from "lucide-react";
import { BASE, STATUS, MARKS, TABS, canRemove, usd, ago, pillLabel } from "./shared";
import ReviewShot from "./ReviewShot";

const AUTO_KEY = "rr_partner_autonext";
const SHORTCUTS = "↑↓ move · X select · Shift+click range · 1–4 mark · O open · C copy · / search · Esc clear";

function Pill({ t, style }) {
  const s = STATUS[t.status] || STATUS.new;
  return <span className={"pill s-" + t.status} data-tip={s.d} style={style}><s.I />{pillLabel(t)}</span>;
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
  const [hydrated, setHydrated] = React.useState(false); // quick actions render lazily on first hover
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
        <Pill t={t} />
        {hydrated ? (
          <div className="quick" onClick={(e) => e.stopPropagation()}>
            {!t.paid ? MARKS.map((k, i) => {
              const M = STATUS[k];
              const off = k === "removed" && !canRemove(t) && t.status !== "removed";
              return <button key={k} type="button" disabled={off} className={"qb " + k + (t.status === k ? " on" : "")} data-tip={off ? "Set to Working first" : "Mark as " + M.l} data-k={String(i + 1)} onClick={() => onSet(t.id, k)}><M.I /></button>;
            }) : null}
            <button type="button" className="qb go" data-tip="Open review on Google" data-k="O" onClick={() => onOpen(t)}><ArrowUpRight /></button>
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default function PartnerDesktop({ api }) {
  const { tasks, all, err, visible, groups, isNewC, tab, setTab, q, setQ, sortOld, setSortOld, expanded, setExpanded, sel, setSel,
    toast, closeToast, showToast, setMany, copyLinks, openReview, setNoteLive, load, flush } = api;
  const [cur, setCur] = React.useState(null);
  const [anchor, setAnchor] = React.useState(null);
  const [autoNext, setAutoNext] = React.useState(true);
  const [spin, setSpin] = React.useState(false);
  const listRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const noteRef = React.useRef(null);
  const tipRef = React.useRef(null);

  React.useEffect(() => { try { const a = localStorage.getItem(AUTO_KEY); if (a != null) setAutoNext(a === "1"); } catch (e) {} }, []);

  const navList = React.useMemo(() => visible.filter((t) => expanded.has(t.cust)), [visible, expanded]);
  const curT = cur != null ? all.find((t) => t.id === cur) : null;

  const scrollCur = React.useCallback((id) => {
    requestAnimationFrame(() => {
      const el = document.querySelector(`.prt .row[data-id="${id}"]`), p = listRef.current;
      if (!el || !p) return;
      const r = el.getBoundingClientRect(), pr = p.getBoundingClientRect();
      if (r.top < pr.top + 86) p.scrollTop -= pr.top + 86 - r.top; else if (r.bottom > pr.bottom) p.scrollTop += r.bottom - pr.bottom;
    });
  }, []);

  /** status change incl. auto-advance + selection clearing */
  const mark = React.useCallback((ids, status) => {
    const wasSel = sel.size > 0;
    let nextCur = cur;
    if (!wasSel && autoNext && ids.length === 1 && ids[0] === cur) {
      const v = navList.map((t) => t.id); const i = v.indexOf(cur);
      const f = TABS.find((x) => x[0] === tab)[2];
      const stays = f({ ...all.find((x) => x.id === cur), status });
      nextCur = stays ? (v[i + 1] ?? cur) : (v[i + 1] ?? v[i - 1] ?? null);
    }
    const applied = setMany(ids, status);
    if (!applied.length) return;
    if (wasSel) setSel(new Set());
    if (nextCur !== cur) { setCur(nextCur); if (nextCur != null) scrollCur(nextCur); }
  }, [sel, cur, autoNext, navList, tab, all, setMany, setSel, scrollCur]);

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
  }, [navList, anchor, setSel]);

  const move = React.useCallback((d, ext) => {
    const v = navList.map((t) => t.id); if (!v.length) return;
    let i = v.indexOf(cur); i = i < 0 ? 0 : Math.max(0, Math.min(v.length - 1, i + d));
    const id = v[i]; setCur(id); if (ext) setSel((s) => new Set(s).add(id)); scrollCur(id);
  }, [navList, cur, scrollCur, setSel]);

  const onRow = React.useCallback((t, e) => {
    if (e.shiftKey || e.metaKey || e.ctrlKey) { toggleSel(t.id, e.shiftKey); return; }
    setCur(t.id);
  }, [toggleSel]);
  const onSetOne = React.useCallback((id, k) => { mark(sel.has(id) && sel.size > 1 ? [...sel] : [id], k); }, [sel, mark]);

  /* keyboard */
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches && e.target.matches("input:not([type=checkbox]),textarea")) { if (e.key === "Escape") e.target.blur(); return; }
      const k = (e.key || "").toLowerCase();
      if (k === "/") { e.preventDefault(); searchRef.current && searchRef.current.focus(); return; }
      if (k === "arrowdown" || k === "j") { e.preventDefault(); move(1, e.shiftKey); return; }
      if (k === "arrowup" || k === "k") { e.preventDefault(); move(-1, e.shiftKey); return; }
      if (k === "escape") { if (sel.size) setSel(new Set()); return; }
      if ((e.metaKey || e.ctrlKey) && k === "a") { e.preventDefault(); setSel(new Set(navList.map((t) => t.id))); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (k === "x" && cur != null) { toggleSel(cur, e.shiftKey); return; }
      if (["1", "2", "3", "4"].includes(k) && (sel.size || cur != null)) { mark(sel.size ? [...sel] : [cur], MARKS[+k - 1]); return; }
      if (k === "o" && curT) { openReview(curT); return; }
      if (k === "c" && (cur != null || sel.size)) { copyLinks(sel.size ? [...sel] : [cur]); return; }
      if (k === "n" && cur != null) { e.preventDefault(); noteRef.current && noteRef.current.focus(); return; }
      if (k === "?") showToast(SHORTCUTS, null, 6000);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [move, sel, setSel, navList, cur, curT, toggleSel, mark, openReview, copyLinks, showToast]);

  /* instant tooltip (no delay) */
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
  }, []);

  const rem = all.filter((t) => t.status === "removed");
  const due = rem.filter((t) => !t.paid), paid = rem.filter((t) => t.paid);
  const sum = (a) => a.reduce((s, t) => s + t.price, 0);
  const vSel = navList.filter((t) => sel.has(t.id)).length;
  const allCollapsed = groups.every(([c]) => !expanded.has(c));
  const v = visible.map((t) => t.id), ci = curT ? v.indexOf(curT.id) : -1;
  const selWorking = [...sel].filter((id) => canRemove(all.find((t) => t.id === id))).length;

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
          <button type="button" className="ib" data-tip="Keyboard shortcuts" data-k="?" onClick={() => showToast(SHORTCUTS, null, 6000)}><Keyboard /></button>
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
              {MARKS.map((k, i) => {
                const M = STATUS[k]; const off = k === "removed" && !selWorking;
                return <button key={k} type="button" disabled={off} className="bk" data-tip={k === "removed" ? `Mark ${selWorking} working as Removed` : "Mark all as " + M.l} data-k={String(i + 1)} onClick={() => mark([...sel], k)}><M.I /><span className="t">{M.l}{k === "removed" ? ` (${selWorking})` : ""}</span></button>;
              })}
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
              const removed = all.filter((t) => t.cust === c && t.status === "removed").length;
              const isNew = isNewC(c);
              return (
                <React.Fragment key={c}>
                  <div className={"grp" + (col ? " col" : "") + (isNew ? " isnew" : "")}>
                    <Check checked={nSel > 0 && nSel === list.length} indeterminate={nSel > 0 && nSel < list.length} tip="Select all of this customer"
                      onClick={() => setSel((s) => { const n = new Set(s); const on = !list.every((t) => n.has(t.id)); list.forEach((t) => (on ? n.add(t.id) : n.delete(t.id))); return n; })} />
                    <button type="button" className="gt" data-tip={(col ? "Expand" : "Collapse") + " customer"} onClick={() => setExpanded((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; })}>
                      <ChevronDown />
                      <span className="gn">{c}</span>
                      {isNew ? <span className="gnew" data-tip="Not started yet – set the reviews to Working">New · customer waiting for confirmation</span> : null}
                      <span className="gm">{list.length} {tab === "todo" ? "open" : "review" + (list.length === 1 ? "" : "s")} · {removed} removed · {usd(list.reduce((s, t) => s + t.price, 0))}</span>
                    </button>
                  </div>
                  {col ? null : list.map((t) => (
                    <Row key={t.id} t={t} isCur={cur === t.id} isSel={sel.has(t.id)} onRow={onRow} onCheck={toggleSel} onSet={onSetOne} onOpen={openReview} />
                  ))}
                </React.Fragment>
              );
            })}
          </section>

          <aside className="detail">
            {!curT ? (
              <div className="dempty"><b>Select a task</b>Expand a customer and click a review to start.</div>
            ) : (
              <>
                <div className="dh">
                  <div>
                    <div className="sub cust"><Store />{curT.cust}</div>
                    <div className="rvbig">{curT.code}</div>
                    <div className="sub">
                      <Pill t={curT} style={{ minWidth: 0 }} />
                      {curT.old ? <span className="old"><Clock />Older than 4 weeks</span> : null}
                      {curT.nt ? <span className="old"><Clock />No text</span> : null}
                      <span>Sent {ago(curT.created)}</span>
                    </div>
                  </div>
                  <div className="dright">
                    <div className="navs">
                      <button type="button" className="ib" data-tip="Previous task" data-k="↑" disabled={ci <= 0} onClick={() => move(-1)}><ChevronUp /></button>
                      <button type="button" className="ib" data-tip="Next task" data-k="↓" disabled={ci >= v.length - 1} onClick={() => move(1)}><ChevronDown /></button>
                    </div>
                    <span className="amt">{usd(curT.price)}</span>
                  </div>
                </div>
                <div className="dbody">
                  {curT.shot ? <ReviewShot id={curT.shot} token={api.token} url={curT.url} /> : null}
                  {curT.text || !curT.shot ? <div className="card quote"><b>{curT.who}</b>{curT.text ? `“${curT.text}”` : null}</div> : null}
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
                          {!curT.paid ? <button type="button" className="btn btn-line reopen" onClick={() => mark([curT.id], "working")}>Reopen</button> : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="lbl"><span>Mark as</span></div>
                        <div className="marks">
                          {MARKS.map((k, i) => {
                            const M = STATUS[k]; const off = k === "removed" && !canRemove(curT);
                            return <button key={k} type="button" disabled={off} className={"mk " + k + (curT.status === k ? " on" : "")} data-tip={off ? "Set to Working first" : M.d} onClick={() => mark([curT.id], k)}><M.I />{M.l}<kbd>{i + 1}</kbd></button>;
                          })}
                        </div>
                        <label className="auto"><input type="checkbox" checked={autoNext} onChange={(e) => { setAutoNext(e.target.checked); try { localStorage.setItem(AUTO_KEY, e.target.checked ? "1" : "0"); } catch (x) {} }} />Jump to next task after marking</label>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="lbl"><span>Note</span><span className="saved">Saved automatically</span></div>
                    <textarea ref={noteRef} value={curT.note} onChange={(e) => setNoteLive(curT, e.target.value)} placeholder="e.g. reason it’s not possible, or ETA" maxLength={500} />
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
        {toast && toast.undo ? <button type="button" onClick={() => { toast.undo(); closeToast(); }}>Undo</button> : null}
      </div>
    </div>
  );
}
