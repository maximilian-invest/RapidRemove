"use client";
/* Partner board — mobile view (Claude Design handoff „Partner Review Tasks – Mobile", priority).
   One screen: customer cards → review rows; actions in a bottom sheet; bulk via checkboxes,
   drag-select along the boxes, long-press, customer box or quick-select chips. */
import React from "react";
import {
  Search, X, ChevronDown, MoreHorizontal, Copy, Link as LinkIcon, ArrowUpRight, StickyNote, Check, Info, Plus,
} from "lucide-react";
import { BASE, STATUS, MARKS, TABS, canRemove, usd, ago, since, pillLabel } from "./shared";

const HINT_KEY = "rr_partner_draghint";

function Box({ on, part, onPointerDown, onClick }) {
  return <span className={"cb" + (on ? " on" : part ? " part" : "")} onPointerDown={onPointerDown} onClick={onClick} role="checkbox" aria-checked={on ? "true" : part ? "mixed" : "false"} />;
}

export default function PartnerMobile({ api }) {
  const { tasks, all, err, visible, groups, isNewC, tab, setTab, q, setQ, expanded, setExpanded, sel, setSel,
    toast, closeToast, setMany, copyLinks, openReview, saveNote } = api;
  const [searching, setSearching] = React.useState(false);
  const [sheet, setSheet] = React.useState(null); // { ids:[...], view:'actions'|'note', title? }
  const [noteDraft, setNoteDraft] = React.useState("");
  const [hint, setHint] = React.useState(false);
  const scrollRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const noteRef = React.useRef(null);
  const drag = React.useRef(null);       // { add, last }
  const suppress = React.useRef(false);  // swallow the click that ends a drag / long-press
  const lp = React.useRef(null);         // long-press timer

  const selMode = sel.size > 0;
  const qActive = !!q.trim();
  const byId = (id) => all.find((t) => t.id === id);

  const hintDrag = React.useCallback(() => {
    let seen = false; try { seen = localStorage.getItem(HINT_KEY) === "1"; } catch (e) {}
    if (seen) return;
    try { localStorage.setItem(HINT_KEY, "1"); } catch (e) {}
    setHint(true); setTimeout(() => setHint(false), 2600);
  }, []);

  const toggleOne = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const expand = (custs) => setExpanded((s) => { const n = new Set(s); custs.forEach((c) => n.add(c)); return n; });

  /* ---- drag along the checkboxes ---- */
  const onBoxDown = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    const add = !sel.has(id);
    drag.current = { add, last: id };
    setSel((s) => { const n = new Set(s); add ? n.add(id) : n.delete(id); return n; });
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (x) {}
  };
  React.useEffect(() => {
    const move = (e) => {
      const d = drag.current; if (!d) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const r = el && el.closest && el.closest(".prm .task");
      if (!r) return;
      const id = Number(r.dataset.id);
      if (id === d.last) return;
      d.last = id;
      setSel((s) => { const n = new Set(s); d.add ? n.add(id) : n.delete(id); return n; });
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null; hintDrag();
      suppress.current = true; setTimeout(() => { suppress.current = false; }, 60);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, [setSel, hintDrag]);

  /* ---- long-press a row ---- */
  const lpStart = (e, id) => {
    if (selMode || e.target.closest(".more,.cb")) return;
    const x = e.clientX, y = e.clientY;
    clearTimeout(lp.current && lp.current.t);
    lp.current = { x, y, t: setTimeout(() => {
      lp.current = null; suppress.current = true; setTimeout(() => { suppress.current = false; }, 400);
      setSel((s) => new Set(s).add(id));
      try { navigator.vibrate && navigator.vibrate(10); } catch (x2) {}
      hintDrag();
    }, 450) };
  };
  const lpMove = (e) => { const c = lp.current; if (c && (Math.abs(e.clientX - c.x) > 8 || Math.abs(e.clientY - c.y) > 8)) { clearTimeout(c.t); lp.current = null; } };
  const lpEnd = () => { const c = lp.current; if (c) { clearTimeout(c.t); lp.current = null; } };

  const onRowClick = (id) => {
    if (suppress.current) return;
    if (selMode) { toggleOne(id); return; }
    setSheet({ ids: [id], view: "actions" });
  };

  /* ---- sheet actions ---- */
  const closeSheet = () => { if (document.activeElement) document.activeElement.blur(); setSheet(null); };
  const sheetT = sheet && sheet.ids.length === 1 ? byId(sheet.ids[0]) : null;
  const pick = (k) => {
    const ids = sheet.ids; closeSheet();
    setMany(ids, k);
  };
  React.useEffect(() => {
    if (sheet && sheet.view === "note") { const t = setTimeout(() => { const a = noteRef.current; if (a) { a.focus(); a.setSelectionRange(9e9, 9e9); } }, 250); return () => clearTimeout(t); }
  }, [sheet]);

  /* ---- bulk ---- */
  const selIds = [...sel];
  const nWorking = selIds.filter((id) => canRemove(byId(id))).length;
  const bulk = (k) => {
    if (!selIds.length) return;
    const ids = k === "removed" ? selIds.filter((id) => canRemove(byId(id))) : selIds;
    if (!ids.length) return;
    setSel(new Set());
    setMany(ids, k);
  };
  const allSel = visible.length > 0 && visible.every((t) => sel.has(t.id));
  const chips = [
    ["working", "All working", visible.filter((t) => t.status === "working")],
    ["new", "All not started", visible.filter((t) => t.status === "new")],
    ["old", "All older than 4 weeks", visible.filter((t) => t.old)],
  ].filter((x) => x[2].length);

  const rem = all.filter((t) => t.status === "removed");
  const sum = (a) => a.reduce((s, t) => s + t.price, 0);

  return (
    <div className="prm">
      <div className="scroll" ref={scrollRef}>
        <header className={"hd" + (selMode ? " selm" : "") + (searching ? " searching" : "")}>
          {selMode ? (
            <>
              <div className="selhd">
                <button type="button" className="txtb" onClick={() => setSel(new Set())}>Cancel</button>
                <b>{sel.size} selected</b>
                <button type="button" className="txtb" onClick={() => {
                  if (allSel) setSel(new Set());
                  else { setSel(new Set(visible.map((t) => t.id))); expand(visible.map((t) => t.cust)); }
                }}>{allSel ? "Deselect all" : "Select all"}</button>
              </div>
              <div className="qchips">
                {chips.map(([k, l, list]) => (
                  <button key={k} type="button" className="qc" onClick={() => { setSel((s) => { const n = new Set(s); list.forEach((t) => n.add(t.id)); return n; }); expand(list.map((t) => t.cust)); }}>
                    <Plus />{l} <span className="n">{list.length}</span>
                  </button>
                ))}
                <button type="button" className="qc" onClick={() => setSel(new Set())}><X />Clear</button>
              </div>
            </>
          ) : (
            <>
              {searching ? (
                <div className="srch">
                  <input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="RV number, customer, text" autoFocus />
                  <button type="button" className="ib" aria-label="Close search" onClick={() => { setQ(""); setSearching(false); }}><X /></button>
                </div>
              ) : (
                <div className="hrow">
                  <img src={`${BASE}/assets/rapidremove-icon.png`} alt="" />
                  <h1>Review tasks</h1>
                  <button type="button" className="ib" aria-label="Search" onClick={() => setSearching(true)}><Search /></button>
                </div>
              )}
              <div className="kpis">
                <div className="kpi"><b>{all.filter((t) => t.status === "new" || t.status === "working").length}</b><span>Open</span></div>
                <div className="kpi pay"><b>{usd(sum(rem.filter((t) => !t.paid)))}</b><span>To be paid</span></div>
                <div className="kpi"><b>{usd(sum(rem.filter((t) => t.paid)))}</b><span>Paid</span></div>
              </div>
              <div className="tabs">
                {TABS.map(([k, l, f]) => (
                  <button key={k} type="button" className={"tab" + (tab === k ? " on" : "")} onClick={() => { setTab(k); setSel(new Set()); if (scrollRef.current) scrollRef.current.scrollTop = 0; }}>
                    {l}<span className="n">{all.filter(f).length}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </header>

        <div className={"list" + (selMode ? " selmode" : "")}>
          {err ? <div className="perr">{err}</div> : null}
          {!tasks && !err ? <div className="empty"><b>Loading …</b></div> : null}
          {tasks && !groups.length ? (
            <div className="empty"><img src={`${BASE}/assets/rapidremove-rocket-orange.png`} alt="" /><b>{qActive ? "No matching task" : "All done here"}</b>{qActive ? "Check the RV number." : "Nothing in this list right now."}</div>
          ) : null}
          {groups.map(([c, list]) => {
            const isNew = isNewC(c);
            const open = expanded.has(c) || qActive;
            const ns = list.filter((t) => sel.has(t.id)).length;
            const removed = all.filter((t) => t.cust === c && t.status === "removed").length;
            return (
              <div key={c} className={"cust" + (isNew ? " isnew" : "") + (open ? " open" : "")}>
                <div className="ch" role="button" tabIndex={0} onClick={() => setExpanded((s) => { const n = new Set(s); n.has(c) ? n.delete(c) : n.add(c); return n; })}>
                  <Box on={ns > 0 && ns === list.length} part={ns > 0 && ns < list.length} onClick={(e) => {
                    e.stopPropagation();
                    const on = !list.every((t) => sel.has(t.id));
                    setSel((s) => { const n = new Set(s); list.forEach((t) => (on ? n.add(t.id) : n.delete(t.id))); return n; });
                    expand([c]); if (on) hintDrag();
                  }} />
                  <span className="cn">
                    <span className="t"><span className="nm">{c}</span>{isNew ? <span className="newb">New</span> : null}</span>
                    <span className="mt">{removed} removed · {usd(list.reduce((s, t) => s + t.price, 0))}</span>
                  </span>
                  <span className="cnt">{list.length}</span>
                  <span className="chev"><ChevronDown /></span>
                </div>
                {open ? (
                  <div className="tasks">
                    <button type="button" className="cpall" onClick={() => copyLinks(list.map((t) => t.id), c)}><Copy /><span>Copy all links</span><span className="n">{list.length}</span></button>
                    {list.map((t) => {
                      const S = STATUS[t.status] || STATUS.new;
                      const on = sel.has(t.id);
                      return (
                        <div key={t.id} className={"task" + (on ? " sel" : "")} data-id={t.id} role="button"
                          onPointerDown={(e) => lpStart(e, t.id)} onPointerMove={lpMove} onPointerUp={lpEnd} onPointerLeave={lpEnd} onPointerCancel={lpEnd}
                          onContextMenu={(e) => e.preventDefault()} onClick={() => onRowClick(t.id)}>
                          <Box on={on} onPointerDown={(e) => onBoxDown(e, t.id)} onClick={(e) => e.stopPropagation()} />
                          <div className="tb">
                            <div className="t1">
                              <span className="rv">{t.code}</span>
                              {t.note ? <span className="noteic"><StickyNote /></span> : null}
                              <span className={"ago" + (t.old || t.nt ? " o" : "")}>{t.old ? "4+ weeks" : t.nt ? "No text" : ago(t.created)}</span>
                              <button type="button" className="more" aria-label={"Actions for " + t.code} onClick={(e) => { e.stopPropagation(); setSheet({ ids: [t.id], view: "actions" }); }}><MoreHorizontal /></button>
                            </div>
                            <div className="ex"><b>{t.who}:</b> {t.text}</div>
                            <div className="t3">
                              <span className={"pill s-" + t.status}><S.I />{pillLabel(t)}</span>
                              <span className="price">{usd(t.price)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* bulk bar */}
      <div className={"bulk" + (selMode ? " show" : "")}>
        <div className="bt"><span>Set status for <b>{sel.size}</b></span><button type="button" onClick={() => copyLinks(selIds)}>Copy links</button></div>
        <div className="bgrid">
          <button type="button" className="bb" onClick={() => bulk("working")}><STATUS.working.I />Working</button>
          <button type="button" className="bb removed" disabled={!nWorking} onClick={() => bulk("removed")}><STATUS.removed.I />Removed<span className="c">{nWorking} working</span></button>
          <button type="button" className="bb" onClick={() => bulk("notpossible")}><STATUS.notpossible.I />Not possible</button>
          <button type="button" className="bb" onClick={() => bulk("software")}><STATUS.software.I />Software</button>
        </div>
      </div>

      {/* action sheet */}
      <div className={"as-bg" + (sheet ? " show" : "")} onClick={closeSheet} />
      <div className={"as" + (sheet ? " show" : "")}>
        {sheet && sheet.view === "note" && sheetT ? (
          <>
            <div className="as-card">
              <div className="as-h"><b>Note · {sheetT.code}</b><span>{sheetT.cust}</span></div>
              <div className="as-nb">
                <textarea ref={noteRef} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="e.g. reason it’s not possible, or ETA" maxLength={500} />
                <button type="button" className="btn btn-primary" onClick={() => { saveNote(sheetT, noteDraft); closeSheet(); }}>Save note</button>
              </div>
            </div>
            <button type="button" className="as-x" onClick={() => setSheet({ ...sheet, view: "actions" })}>Back</button>
          </>
        ) : sheet && sheetT ? (
          <>
            <div className="as-card">
              <div className="as-h">
                <b>{sheetT.code} · {usd(sheetT.price)}</b>
                <span>{sheetT.cust} · {sheetT.status === "working" && sheetT.workingSince ? (since(sheetT.workingSince) === "just now" ? "Working · just started" : "Working for " + since(sheetT.workingSince)) : pillLabel(sheetT)}</span>
                <p className="as-q"><b>{sheetT.who}:</b> {sheetT.text ? `“${sheetT.text}”` : null}</p>
                {sheetT.note ? <p className="as-n"><StickyNote />{sheetT.note}</p> : null}
              </div>
              <div className="as-top">
                <button type="button" className="btn btn-primary" disabled={!sheetT.url} onClick={() => openReview(sheetT)}><ArrowUpRight />Open review</button>
                <button type="button" className="btn btn-line" aria-label="Copy link" onClick={() => copyLinks([sheetT.id])}><LinkIcon /></button>
              </div>
              {!sheetT.paid ? MARKS.filter((k) => k !== "removed" || canRemove(sheetT) || sheetT.status === "removed").map((k) => {
                const M = STATUS[k];
                return (
                  <button key={k} type="button" className={"as-o " + k} onClick={() => (sheetT.status === k ? closeSheet() : pick(k))}>
                    <M.I />{M.l}{sheetT.status === k ? <span className="ck"><Check /></span> : null}
                  </button>
                );
              }) : <div className="as-hint"><Info />Paid out – this review is closed.</div>}
              <button type="button" className="as-o note" onClick={() => { setNoteDraft(sheetT.note || ""); setSheet({ ...sheet, view: "note" }); }}><StickyNote />{sheetT.note ? "Edit note" : "Note"}</button>
              {!sheetT.paid && !canRemove(sheetT) && sheetT.status !== "removed" ? <div className="as-hint"><Info />“Removed” appears once a review is set to Working.</div> : null}
            </div>
            <button type="button" className="as-x" onClick={closeSheet}>Cancel</button>
          </>
        ) : null}
      </div>

      <div className={"dragtip" + (hint ? " show" : "")}>Tip: drag along the boxes to select many</div>
      <div className={"toast" + (toast ? " show" : "") + (selMode ? " up" : "")}>
        <span>{toast ? toast.msg : ""}</span>
        {toast && toast.undo ? <button type="button" onClick={() => { toast.undo(); closeToast(); }}>Undo</button> : null}
      </div>
    </div>
  );
}
