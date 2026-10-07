"use client";
/* RapidRemove Partner App (mobile) — Claude Design handoff „Partner App" (Uber-style drill-down).
   Tabs: Home · Orders · Earnings · Account. Home and Orders keep their own screen stacks.
   Every choice opens its own screen; bulk actions on the customer page; undo toast for everything. */
import React from "react";
import {
  Search, ArrowLeft, Check, ChevronRight, Sparkles, Loader, Copy, CheckCheck, X, StickyNote, ArrowUpRight,
  Link as LinkIcon, Info, Hourglass, CheckCircle2, XCircle, Wallet, Banknote, MessageCircle, LogOut, Home, List, User,
} from "lucide-react";
import { BASE, STATUS, MARKS, canRemove, usd, since } from "./shared";
import PartnerPush from "./PartnerPush";
import ReviewShot from "./ReviewShot";

const IMG = { wallet: `${BASE}/assets/partner/wallet.webp`, rocket: `${BASE}/assets/partner/rocket.webp` };
const isTodo = (t) => t.status === "new" || t.status === "working";
const F = {
  todo: isTodo, open: isTodo,
  removed: (t) => t.status === "removed",
  closed: (t) => t.status === "notpossible",
  sw: (t) => t.status === "software",
  nw: (t) => t.status === "new",
  wk: (t) => t.status === "working",
  all: () => true,
};
const FL = { todo: "To do", removed: "Removed", closed: "Not possible", sw: "Software", nw: "New", wk: "Working", all: "All tasks", pending: "Pending · waiting for customer" };
const CF_OF = { nw: "open", wk: "open", todo: "open", open: "open", removed: "removed", closed: "closed", sw: "sw", all: "open", pending: "sw" };
/** Fortschritt eines Kunden – überall gleich formuliert („2 of 9 done · 1 waiting for customer"). */
const progressOf = (l) => {
  const todo = l.filter(isTodo).length, sw = l.filter(F.sw).length;
  return `${l.length - todo} of ${l.length} done${sw ? ` · ${sw} waiting for customer` : ""}`;
};
const sum = (a) => a.reduce((s, t) => s + t.price, 0);
const byCreated = (a, b) => (a.created - b.created) || (a.id - b.id);

function stLabel(t) {
  if (t.status === "working" && t.sw === "paid") return "Software · customer paid – start now";
  if (t.status === "working" && t.workingSince) return "Working · " + since(t.workingSince);
  if (t.status === "removed" && t.paid) return "Removed · paid";
  if (t.status === "software") return "Software · waiting for payment";
  return (STATUS[t.status] || STATUS.new).l;
}

function Ring({ r, n }) {
  const R = 20, C = 2 * Math.PI * R, p = n ? r / n : 0;
  return (
    <div className="ring">
      <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r={R} fill="none" stroke="#e2e2e2" strokeWidth="5" />
        {p ? <circle cx="24" cy="24" r={R} fill="none" stroke={p === 1 ? "var(--success)" : "#111"} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${C * p} ${C}`} /> : null}
      </svg>
      <b>{r}/{n}</b>
    </div>
  );
}

export default function PartnerApp({ api }) {
  const { tasks, all, err, isNewC, sel, setSel, toast, closeToast, setMany, markPaid, copyLinks, openReview, saveNote, load, flush } = api;
  const [tab0, setTab0] = React.useState("tasks");
  const [stacks, setStacks] = React.useState({ tasks: [{ v: "home" }], orders: [{ v: "orders" }] });
  const [ofl, setOfl] = React.useState("open");
  const [anim, setAnim] = React.useState(0);
  const [noteDraft, setNoteDraft] = React.useState("");
  const mainRef = React.useRef(null);
  const lp = React.useRef(null);
  const lpFired = React.useRef(false);
  const sx = React.useRef(null);

  const stack = stacks[tab0];
  const cur = stack ? stack[stack.length - 1] : null;
  const byId = (id) => all.find((t) => t.id === id);
  // „Pending": Kunden, bei denen nichts mehr zu tun ist, aber Software-Bewertungen auf die Entscheidung des Kunden warten.
  const pendC = new Set();
  { const m = new Map(); all.forEach((t) => { const x = m.get(t.cust) || { todo: 0, sw: 0 }; if (isTodo(t)) x.todo++; if (t.status === "software") x.sw++; m.set(t.cust, x); });
    m.forEach((x, c) => { if (!x.todo && x.sw) pendC.add(c); }); }
  const FX = { ...F, pending: (t) => t.status === "software" && pendC.has(t.cust) };

  const bump = () => { setAnim((x) => x + 1); requestAnimationFrame(() => { if (mainRef.current) mainRef.current.scrollTop = 0; }); };
  const go = (s) => { setStacks((p) => ({ ...p, [tab0]: [...p[tab0], s] })); setSel(new Set()); bump(); };
  const back = () => { setStacks((p) => (p[tab0] && p[tab0].length > 1 ? { ...p, [tab0]: p[tab0].slice(0, -1) } : p)); setSel(new Set()); setAnim((x) => x + 1); };
  const setTop = (patch) => setStacks((p) => { const st = p[tab0]; return { ...p, [tab0]: [...st.slice(0, -1), { ...st[st.length - 1], ...patch }] }; });
  const switchTab = (k) => {
    if (k === tab0 && stacks[k]) setStacks((p) => ({ ...p, [k]: p[k].slice(0, 1) })); // tap active tab → root
    setTab0(k); setSel(new Set()); bump();
  };

  const custsOf = (f) => {
    const m = new Map();
    all.filter(f).forEach((t) => { if (!m.has(t.cust)) m.set(t.cust, []); m.get(t.cust).push(t); });
    return [...m].sort((a, b) => (isNewC(b[0]) - isNewC(a[0])) || (b[1].length - a[1].length));
  };

  /* keyboard Esc + swipe back */
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (e.target.matches && e.target.matches("input,textarea")) { e.target.blur(); return; }
      if (sel.size) setSel(new Set()); else back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  const onMainDown = (e) => {
    const r = mainRef.current && mainRef.current.getBoundingClientRect();
    if (r && e.clientX - r.left < 24 && stack && stack.length > 1) sx.current = e.clientX;
  };
  const onMainUp = (e) => { if (sx.current !== null && e.clientX - sx.current > 70) back(); sx.current = null; };

  /* long-press on a review row → select */
  const rowDown = (e, id) => {
    if (sel.size || e.target.closest(".tog")) return;
    lpFired.current = false;
    const x = e.clientX, y = e.clientY;
    lp.current = { x, y, t: setTimeout(() => { lpFired.current = true; lp.current = null; setSel((s) => new Set(s).add(id)); try { navigator.vibrate && navigator.vibrate(10); } catch (z) {} }, 450) };
  };
  const rowMove = (e) => { const c = lp.current; if (c && (Math.abs(e.clientX - c.x) > 8 || Math.abs(e.clientY - c.y) > 8)) { clearTimeout(c.t); lp.current = null; } };
  const rowEnd = () => { const c = lp.current; if (c) { clearTimeout(c.t); lp.current = null; } };
  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ---------- pieces ---------- */
  const rem = all.filter(F.removed), due = rem.filter((t) => !t.paid), paidL = rem.filter((t) => t.paid);
  const hero = () => (
    <div className="hero">
      <span className="hero-img"><img src={IMG.wallet} alt="" /></span>
      <div className="k">To be paid</div>
      <div className="v">{usd(sum(due))}</div>
      <div className="s">{due.length} removed · not paid out yet</div>
      <div className="row">
        <div><b>{usd(sum(paidL))}</b><span>Paid out</span></div><div />
        {due.length ? <button type="button" className="paybtn" onClick={() => markPaid(due.map((t) => t.id))}><Check />Mark all paid</button> : null}
      </div>
    </div>
  );
  const nav = (right) => (
    <div className="nav"><button type="button" className="circ" aria-label="Back" onClick={back}><ArrowLeft /></button>{right || null}</div>
  );
  const empty = (title, sub, img = true) => (
    <div className="empty">{img ? <img src={IMG.rocket} alt="" /> : null}<b>{title}</b>{sub}</div>
  );

  /* ---------- screens ---------- */
  function HomeV() {
    // „New orders" = Kunden mit Bewertungen, die der Partner noch nicht angefangen hat (Status new). Laufende stehen unter Working/Orders.
    const nc = custsOf(F.nw);
    const tiles = [["nw", "New", "c-new"], ["wk", "Working", "c-working"], ["removed", "Removed", "c-removed"], ["pending", "Pending", "c-software"], ["closed", "Not possible", "c-notpossible"]];
    const icon = { nw: STATUS.new.I, wk: STATUS.working.I, removed: STATUS.removed.I, pending: Hourglass, closed: STATUS.notpossible.I };
    return (
      <>
        <div className="hhead"><h1>Tasks</h1><button type="button" className="circ" aria-label="Search" onClick={() => go({ v: "search", q: "" })}><Search /></button></div>
        {hero()}
        <div className="stats">
          {tiles.map(([k, l, c]) => { const I = icon[k]; return (
            <button key={k} type="button" className="stat" onClick={() => go({ v: "list", k })}>
              <span className={"si " + c}><I /></span><b>{k === "pending" ? pendC.size : all.filter(FX[k]).length}</b><span>{l}<ChevronRight /></span>
            </button>
          ); })}
        </div>
        <div className="sec" style={{ marginTop: 0 }}><h2>New orders</h2><span>{nc.length}</span></div>
        {nc.map(([c, l]) => {
          const allT = all.filter((t) => t.cust === c), nw = isNewC(c);
          return (
            <button key={c} type="button" className={"big" + (nw ? " new" : "")} onClick={() => go({ v: "cust", c, cf: "open" })}>
              <span className="bi">{nw ? <Sparkles /> : <Loader />}</span>
              <span className="t"><b>{c}</b><span>{nw ? `Customer waiting for order confirmation · ${l.length} review${l.length > 1 ? "s" : ""}` : progressOf(allT)}</span></span>
              <span className="n">{l.length}</span><ChevronRight />
            </button>
          );
        })}
        {!nc.length ? empty("All caught up", "No new orders – everything has been started.") : null}
      </>
    );
  }

  function OrdersV() {
    // „Software" = wartet auf die Entscheidung des Kunden → nicht abgeschlossen, bleibt unter „Active".
    const cs = custsOf(() => true).map(([c, l]) => ({ c, l, open: l.filter(isTodo).length, rem: l.filter(F.removed).length, wk: l.filter(F.wk).length, sw: l.filter(F.sw).length }))
      .filter((x) => ofl === "all" || (ofl === "open" ? x.open : ofl === "pending" ? !x.open && x.sw : !x.open && !x.sw))
      .sort((a, b) => (isNewC(b.c) - isNewC(a.c)) || (b.open - a.open));
    return (
      <>
        <div className="hhead"><h1>Orders</h1><button type="button" className="circ" aria-label="Search" onClick={() => go({ v: "search", q: "" })}><Search /></button></div>
        <div className="chips">{[["open", "Active"], ["pending", "Pending"], ["done", "Completed"], ["all", "All"]].map(([k, l]) => <button key={k} type="button" className={"chip" + (ofl === k ? " on" : "")} onClick={() => setOfl(k)}>{l}</button>)}</div>
        {cs.map((x) => (
          <button key={x.c} type="button" className="lrow" onClick={() => go({ v: "cust", c: x.c, cf: "open" })}>
            <Ring r={x.rem} n={x.l.length} />
            <span className="t"><b>{x.c}</b><span>{isNewC(x.c) ? <em className="newin">New · </em> : null}{x.open || x.sw ? progressOf(x.l) : "Completed"}</span></span>
            <ChevronRight />
          </button>
        ))}
        {!cs.length ? empty("No orders", "", false) : null}
      </>
    );
  }

  function ListV({ k }) {
    const cs = custsOf(FX[k]);
    return (
      <>
        {nav()}
        <div className="pt">{FL[k]}</div>
        <div className="ps">{all.filter(FX[k]).length} reviews · {cs.length} customers</div>
        {cs.map(([c, l]) => (
          <button key={c} type="button" className="lrow" onClick={() => go({ v: "cust", c, cf: CF_OF[k] })}>
            <span className="t"><b>{c}</b><span>{k === "pending" ? progressOf(all.filter((t) => t.cust === c)) : usd(sum(l))}{isNewC(c) ? <> · <em className="newin">New</em></> : null}</span></span>
            <span className="n">{l.length}</span><ChevronRight />
          </button>
        ))}
        {!cs.length ? empty("All done", "Nothing here right now.") : null}
      </>
    );
  }

  function CustV({ c, cf = "open" }) {
    const allT = all.filter((t) => t.cust === c);
    const l = allT.filter(F[cf]).sort(byCreated);
    const allSel = l.length > 0 && l.every((t) => sel.has(t.id));
    const dueC = allT.filter((t) => t.status === "removed" && !t.paid);
    const nw = isNewC(c);
    return (
      <>
        {nav(<button type="button" className="circ" aria-label="Copy all links" onClick={() => copyLinks(l.map((t) => t.id), c)}><Copy /></button>)}
        <div className="pt">{c}</div>
        <div className="ps">{allT.length} reviews · {nw ? <b className="newin">New order · customer waiting for confirmation</b> : "In progress"}</div>
        <div className="cstats">
          <div><b>{allT.filter(isTodo).length}</b><span>Open</span></div>
          <div><b>{allT.filter(F.wk).length}</b><span>Working</span></div>
          <div><b>{allT.filter(F.removed).length}</b><span>Removed</span></div>
          <div><b>{usd(sum(dueC))}</b><span>To be paid</span></div>
        </div>
        <div className="acts2">
          <button type="button" className="cta" disabled={!l.length} onClick={() => copyLinks(l.map((t) => t.id), c)}><Copy />Copy all links</button>
          <button type="button" className="cta gh" disabled={!l.length} onClick={() => setSel((s) => { const n = new Set(s); l.forEach((t) => (allSel ? n.delete(t.id) : n.add(t.id))); return n; })}>{allSel ? <X /> : <CheckCheck />}{allSel ? "Clear" : "Select all"}</button>
        </div>
        <div className="chips">
          {[["open", "Open"], ["removed", "Removed"], ["closed", "Not possible"], ["sw", "Software"]].map(([k, lb]) => (
            <button key={k} type="button" className={"chip" + (cf === k ? " on" : "")} onClick={() => { setTop({ cf: k }); setSel(new Set()); }}>{lb}<span className="n">{allT.filter(F[k]).length}</span></button>
          ))}
        </div>
        {l.map((t) => {
          const on = sel.has(t.id);
          return (
            <div key={t.id} role="button" tabIndex={0} className={"lrow" + (on ? " sel" : "")}
              onPointerDown={(e) => rowDown(e, t.id)} onPointerMove={rowMove} onPointerUp={rowEnd} onPointerLeave={rowEnd} onPointerCancel={rowEnd}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => { if (lpFired.current) { lpFired.current = false; return; } if (sel.size) { toggle(t.id); return; } go({ v: "rev", id: t.id, c, k: cf }); }}>
              <span className={"tog" + (on ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggle(t.id); }}><Check /></span>
              <span className="t">
                <b>{t.code} · {t.who}</b>
                <span className={"c-" + t.status} style={{ fontWeight: 700 }}>{stLabel(t)}{t.old ? <em className="old4"> · 4+ weeks</em> : null}{t.nt ? <em className="old4"> · no text</em> : null}</span>
              </span>
              {t.note ? <span className="noteic"><StickyNote /></span> : null}
              <ChevronRight />
            </div>
          );
        })}
        {!l.length ? empty("Nothing here", "No reviews in this list.") : null}
      </>
    );
  }

  function RevV({ id, c, k }) {
    const t = byId(id);
    if (!t) return <>{nav()}{empty("Not found", "This review is no longer on your board.")}</>;
    const f = F[k] || isTodo;
    const l = all.filter((x) => x.cust === c && f(x)).sort(byCreated);
    const i = l.findIndex((x) => x.id === id);
    const opts = t.paid ? [] : MARKS.filter((m) => m !== "removed" || canRemove(t));
    const mark = (m) => {
      const applied = setMany([t.id], m);
      if (!applied.length) return;
      if (f({ ...t, status: m })) return; // still in this list → stay
      const rest = l.filter((x) => x.id !== t.id);
      const nx = rest[Math.min(Math.max(i, 0), rest.length - 1)];
      if (nx) { setTop({ id: nx.id }); bump(); } else back();
    };
    const S = STATUS[t.status] || STATUS.new;
    return (
      <>
        {nav(<span className="pos">{i >= 0 ? `${i + 1} of ${l.length}` : ""}</span>)}
        <div className="ps" style={{ margin: "8px 0 0" }}>{t.cust}</div>
        <div className="rvh"><b>{t.code}</b><span>{usd(t.price)}</span></div>
        <div className={"stl c-" + t.status}><S.I />{stLabel(t)}</div>
        {t.status === "software" && t.sw === "declined" ? (
          <div className="swb"><XCircle /><span><b>Customer declined deletion</b>The customer decided to keep this review online. Nothing to do.</span></div>
        ) : t.status === "software" ? (
          <div className="swb"><Hourglass /><span><b>Waiting for payment</b>The customer got a payment request for the software removal. You’ll see “Customer paid” here before you start.</span></div>
        ) : t.sw === "paid" ? (
          <div className="swb ok"><CheckCircle2 /><span><b>Customer paid</b>Prepayment received – start the software removal now.</span></div>
        ) : (t.status === "new" || t.status === "working") && t.method === "sw" ? (
          <div className="swb"><Info /><span><b>Software case</b>Old review from the USA or rating without text – Google usually won’t remove it manually. Check if software removal is available, then mark “Software”. The customer gets a payment request; start only once you see “Customer paid”.</span></div>
        ) : (t.status === "new" || t.status === "working") && t.method === "legal" ? (
          <div className="swb"><Info /><span><b>Legal notice first</b>Old review outside the USA – use legal reporting first (90 %+ success). If it stays online, mark “Software”.</span></div>
        ) : null}
        {t.shot ? <ReviewShot id={t.shot} token={api.token} url={t.url} /> : null}
        {t.text || !t.shot ? <div className="quote"><b>{t.who}</b>{t.text ? `“${t.text}”` : t.url ? <span style={{ display: "block", fontSize: 14, color: "var(--g3)", fontWeight: 500 }}>Tap “Open review” to see it on Google</span> : null}</div> : null}
        {t.note ? <div className="noteb"><StickyNote />{t.note}</div> : null}
        <div className="acts2">
          <button type="button" className="cta" disabled={!t.url} onClick={() => openReview(t)}><ArrowUpRight />Open review</button>
          <button type="button" className="cta gh" onClick={() => copyLinks([t.id])}><LinkIcon />Copy link</button>
        </div>
        {t.paid ? <div className="hint"><Banknote />Paid out – this review is closed.</div> : (
          <>
            <div className="lbl2">Mark as</div>
            <div className={"mgrid" + (opts.length === 3 ? " three" : "")}>
              {opts.map((m) => { const M = STATUS[m]; return (
                <button key={m} type="button" className={"mk " + m + (t.status === m ? " on" : "") + (m === "removed" ? " hot" : "")} onClick={() => (t.status === m ? null : mark(m))}><M.I />{M.l}</button>
              ); })}
              <button type="button" className="mk note wide" onClick={() => { setNoteDraft(t.note || ""); go({ v: "note", id: t.id }); }}><StickyNote />{t.note ? "Edit note" : "Add note"}</button>
            </div>
            {!canRemove(t) && t.status !== "removed" ? <div className="hint"><Info />“Removed” appears once you set it to Working.</div> : null}
          </>
        )}
      </>
    );
  }

  function NoteV({ id }) {
    const t = byId(id);
    if (!t) return nav();
    return (
      <>
        {nav()}
        <div className="pt">Note</div>
        <div className="ps">{t.code} · {t.cust}</div>
        <textarea className="textarea" autoFocus value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="e.g. reason it’s not possible, or ETA" maxLength={500} />
        <div style={{ marginTop: 12 }}><button type="button" className="cta" onClick={() => { saveNote(t, noteDraft); back(); }}>Save note</button></div>
      </>
    );
  }

  function SearchV({ q = "" }) {
    const ql = q.trim().toLowerCase();
    const r = ql ? all.filter((t) => `${t.code} ${t.cust} ${t.who} ${t.text}`.toLowerCase().includes(ql)).slice(0, 40) : [];
    return (
      <>
        <div className="srch"><button type="button" className="circ" aria-label="Back" onClick={back}><ArrowLeft /></button>
          <input type="search" autoFocus value={q} onChange={(e) => setTop({ q: e.target.value })} placeholder="RV number, customer, text" /></div>
        {r.map((t) => (
          <button key={t.id} type="button" className="lrow" onClick={() => go({ v: "rev", id: t.id, c: t.cust, k: "all" })}>
            <span className="t"><b>{t.code} · {t.who}</b><span>{t.cust} · {stLabel(t)}</span></span><ChevronRight />
          </button>
        ))}
        {ql && !r.length ? empty("No match", "Check the RV number.", false) : null}
      </>
    );
  }

  function EarnV() {
    const row = (t) => (
      <div key={t.id} className="er">
        <span className="ico">{t.paid ? <Banknote /> : <Wallet />}</span>
        <span className="t"><b>{t.code}</b><span>{t.cust}</span></span>
        <span className="a">{usd(t.price)}</span>
        {!t.paid ? <button type="button" className="mp" onClick={() => markPaid([t.id])}>Mark paid</button> : null}
      </div>
    );
    return (
      <>
        <div className="ttl">Earnings</div>
        {hero()}
        <div className="sec"><h2>To be paid</h2><span>{due.length}</span></div>
        {due.length ? due.map(row) : <div className="ps">Nothing open – all paid.</div>}
        <div className="sec"><h2>Paid out</h2><span>{paidL.length}</span></div>
        {paidL.slice(0, 50).map(row)}
      </>
    );
  }

  function AccV() {
    const how = [
      [STATUS.working.I, "working", "Working", "Tap when you start a review"],
      [STATUS.removed.I, "removed", "Removed", "Only after Working – counts toward payout"],
      [STATUS.notpossible.I, "notpossible", "Not possible", "Add the reason as a note"],
      [STATUS.software.I, "software", "Software only", "The customer decides on the specialist"],
      [MessageCircle, "note", "WhatsApp", "Always quote the RV number"],
    ];
    return (
      <>
        <div className="ttl">Account</div>
        <div className="acc"><span className="circ" style={{ background: "#fff" }}>RR</span><span><b>RapidRemove Partner</b><span>Private partner link</span></span></div>
        <div className="sec"><h2>How it works</h2></div>
        <div className="how">{how.map(([I, c, b, s]) => <div key={b} className="er"><span className={"ico " + c}><I /></span><span className="t"><b>{b}</b><span>{s}</span></span></div>)}</div>
        <div className="sec"><h2>Notifications</h2></div>
        <PartnerPush token={api.token} showToast={api.showToast} />
        <div style={{ marginTop: 14 }}><button type="button" className="cta gh" onClick={() => { flush(true); try { localStorage.removeItem("rr_partner_t"); } catch (e) {} window.location.replace(window.location.pathname); }}><LogOut />Log out</button></div>
      </>
    );
  }

  /* ---------- render ---------- */
  let body;
  if (err) body = <><div className="hhead"><h1>Tasks</h1></div><div className="perr">{err}</div></>;
  else if (!tasks) body = <div className="empty" style={{ paddingTop: 120 }}><b>Loading …</b></div>;
  else if (tab0 === "earn") body = EarnV();
  else if (tab0 === "acc") body = AccV();
  else if (cur.v === "home") body = HomeV();
  else if (cur.v === "orders") body = OrdersV();
  else if (cur.v === "list") body = ListV(cur);
  else if (cur.v === "cust") body = CustV(cur);
  else if (cur.v === "rev") body = RevV(cur);
  else if (cur.v === "note") body = NoteV(cur);
  else body = SearchV(cur);

  const newN = new Set(all.filter((t) => isTodo(t) && isNewC(t.cust)).map((t) => t.cust)).size;
  const selIds = [...sel];
  const nWorking = selIds.filter((id) => canRemove(byId(id))).length;
  const bulk = (k) => {
    const ids = k === "removed" ? selIds.filter((id) => canRemove(byId(id))) : selIds;
    if (!ids.length) return;
    setSel(new Set());
    setMany(ids, k);
  };

  return (
    <div className="pra">
      <main className="screen anim" key={anim} ref={mainRef} onPointerDown={onMainDown} onPointerUp={onMainUp}
>
        {body}
      </main>
      <nav className="tabbar">
        {[["tasks", Home, "Home"], ["orders", List, "Orders"], ["earn", Wallet, "Earnings"], ["acc", User, "Account"]].map(([k, I, l]) => (
          <button key={k} type="button" className={"tb" + (tab0 === k ? " on" : "")} onClick={() => switchTab(k)}>
            <I /><span>{l}</span>{k === "tasks" && newN ? <span className="bd">{newN}</span> : null}
          </button>
        ))}
      </nav>
      <div className={"bulk" + (sel.size ? " show" : "")}>
        <div className="bt"><span>Set status for <b>{sel.size}</b></span><button type="button" onClick={() => setSel(new Set())}><X />Cancel</button></div>
        <div className="bgrid">
          {MARKS.map((k) => { const M = STATUS[k]; return (
            <button key={k} type="button" className={"bb " + k} disabled={k === "removed" && !nWorking} onClick={() => bulk(k)}>
              <M.I />{k === "software" ? "Software" : M.l}{k === "removed" ? <span className="c">{nWorking} working</span> : null}
            </button>
          ); })}
        </div>
      </div>
      <div className={"toast" + (toast ? " show" : "") + (sel.size ? " up" : "")}>
        <span>{toast ? toast.msg : ""}</span>
        {toast && toast.undo ? <button type="button" onClick={() => { toast.undo(); closeToast(); }}>Undo</button> : null}
      </div>
    </div>
  );
}
