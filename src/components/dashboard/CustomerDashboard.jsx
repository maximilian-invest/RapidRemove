"use client";
/* Kunden-Dashboard „My reviews" (rapid-remove.com/my-reviews) — vorerst NUR Einzelbewertungen.
   Design: Claude-Design-Handoff „Customer Dashboard" (Englisch, Geist, Lucide, Mobil zuerst).
   Daten: ops /cust/me (Status kommt live vom Partner-Board), Aktionen: /cust/software
   (Spezial-Software: Anzahlung zahlen oder ablehnen) und /cust/pay (alle gelöschten,
   unbezahlten Bewertungen). Zahlungen laufen über Stripe in einem neuen Tab; nach der
   Rückkehr lädt das Dashboard neu und zeigt den bezahlten Stand. */
import React from "react";
import {
  Cpu, Lock, ChevronDown, ChevronUp, ChevronRight, Wallet, Hourglass, ArrowRight, CheckCircle2, Search,
  Loader, Ban, XCircle, Check, Info, ArrowUpRight, LogOut, MessageCircle,
} from "lucide-react";
import "@/styles/dashboard.css";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const KEY = "rr_cust_session";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap";
const HELP_MAIL = "helpdesk@rapid-remove.com";

async function call(path, body) {
  const res = await fetch(OPS + "/cust/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) { const e = new Error(j.error || "HTTP " + res.status); e.code = j.error; throw e; }
  return j;
}
const store = {
  get: () => { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } },
  set: (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) { /* privat */ } },
};

/* ---- Format ---- */
const money = (v, cur) => (cur === "usd" ? "$" : "€") + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString("en-US"); } catch (e) { return ""; } };
function dur(iso) {
  if (!iso) return "";
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return m + " min";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " h" + (m % 60 ? " " + (m % 60) + " min" : "");
  const d = Math.floor(h / 24);
  return d + " d" + (h % 24 ? " " + (h % 24) + " h" : "");
}
const plural = (n, one, many) => (n === 1 ? one : many || one + "s");
const initials = (name, email) => {
  const p = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (p.length) return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  return String(email || "?").slice(0, 2).toUpperCase();
};

/* ---- Status (intern → Kunde) ---- */
const ST = {
  new: { l: "Being checked", I: Search, c: "s-check", d: "We’re checking whether this review can be removed." },
  working: { l: "In progress", I: Loader, c: "s-work", d: "We’re working on the removal right now." },
  removed: { l: "Removed", I: CheckCircle2, c: "s-removed", d: "This review is gone from Google." },
  notpossible: { l: "Not removable", I: Ban, c: "s-no", d: "This review can’t be removed. You won’t be charged for it." },
  software: { l: "Needs software", I: Cpu, c: "s-software", d: "This review can only be removed with our special software. A 50 % deposit is required." },
  sw_accepted: { l: "Software accepted", I: Cpu, c: "s-sw_ok", d: "Deposit paid – we’re removing this review with our software." },
  sw_declined: { l: "Declined", I: XCircle, c: "s-sw_no", d: "You declined the software removal. Nothing to pay." },
  cancelled: { l: "Cancelled", I: XCircle, c: "s-cancel", d: "This review was cancelled and won’t be processed." },
};
const OPEN = ["new", "working", "software", "sw_accepted"];
const TABS = [
  ["all", "All", () => true],
  ["decide", "Decision needed", (r) => r.status === "software"],
  ["open", "In progress", (r) => ["new", "working", "sw_accepted"].includes(r.status)],
  ["removed", "Removed", (r) => r.status === "removed"],
  ["closed", "Not removed", (r) => ["notpossible", "sw_declined", "cancelled"].includes(r.status)],
];

function Pills({ r, cur }) {
  const s = ST[r.status] || ST.new;
  const I = s.I;
  return (
    <>
      <span className={"pill " + s.c}><I />{s.l}{r.status === "working" && r.since ? " · " + dur(r.since) : ""}</span>
      {r.status === "removed" ? (
        r.paid ? <span className="pill s-paid"><Check />Paid</span> : <span className="pill s-due"><Wallet />To pay {money(r.price, cur)}</span>
      ) : null}
    </>
  );
}

/* ---- Login / Passwort vergessen ---- */
function Login({ onToken }) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [forgot, setForgot] = React.useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setInfo(""); setBusy(true);
    try {
      if (forgot) { await call("reset", { email }); setInfo("If there’s an account for this email, we’ve just sent you a new password."); setForgot(false); }
      else { const r = await call("login", { email, password: pw }); onToken(r.token); }
    } catch (x) { setErr(x.code === "too_many" ? "Too many attempts – please wait a few minutes." : forgot ? "Something went wrong – please try again." : "Email or password is wrong."); }
    setBusy(false);
  };
  return (
    <div className="lg-wrap">
      <form className="lg" onSubmit={submit}>
        <img src="/assets/rapidremove-icon.png" alt="" width={44} height={44} />
        <div>
          <h1>{forgot ? "New password" : "My reviews"}</h1>
          <p>{forgot ? "Enter your email and we’ll send you a new password." : "Log in with the email and password from your order confirmation."}</p>
        </div>
        <label className="fld"><span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </label>
        {!forgot ? (
          <label className="fld"><span>Password</span>
            <input type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
          </label>
        ) : null}
        {err ? <div className="note bad">{err}</div> : null}
        {info ? <div className="note good">{info}</div> : null}
        <button className="btn btn-primary" disabled={busy}>{busy ? <Loader className="spin" /> : null}{forgot ? "Send new password" : "Log in"}</button>
        <button type="button" className="lnk" onClick={() => { setForgot(!forgot); setErr(""); setInfo(""); }}>{forgot ? "← Back to log in" : "Forgot password?"}</button>
      </form>
    </div>
  );
}

/* ---- Dashboard ---- */
export default function CustomerDashboard() {
  const [token, setToken] = React.useState(null); // null = noch nicht gelesen
  const [data, setData] = React.useState(null);
  const [loadErr, setLoadErr] = React.useState("");
  const [tab, setTab] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [openSet, setOpenSet] = React.useState(null);
  const [decOpen, setDecOpen] = React.useState(false);
  const [sheet, setSheet] = React.useState(null); // { o, r }
  const [toast, setToast] = React.useState("");
  const [busy, setBusy] = React.useState("");
  const [confirmKey, setConfirmKey] = React.useState("");
  const [, tick] = React.useState(0);
  const prev = React.useRef(null);
  const toastT = React.useRef(0);
  const confirmT = React.useRef(0);

  const showToast = React.useCallback((m) => {
    setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(""), 3600);
  }, []);

  React.useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_HREF; document.head.appendChild(l);
    }
    setToken(store.get());
  }, []);

  const load = React.useCallback(async (t) => {
    if (!t) return;
    try {
      const d = await call("me", { token: t });
      // Zahlung eingegangen? (Rückkehr aus dem Stripe-Tab)
      const p = prev.current;
      if (p) {
        const was = new Map(p.orders.flatMap((o) => o.items.map((i) => [o.id + "\u0001" + i.key, i])));
        let swOk = 0, paid = 0;
        for (const o of d.orders) for (const i of o.items) {
          const w = was.get(o.id + "\u0001" + i.key);
          if (!w) continue;
          if (w.status === "software" && i.status === "sw_accepted") swOk++;
          if (w.status === "removed" && !w.paid && i.paid) paid++;
        }
        if (swOk) showToast(`Deposit received – we’re on it (${swOk} ${plural(swOk, "review")})`);
        else if (paid) showToast("Payment received – thank you!");
      }
      prev.current = d;
      setData(d); setLoadErr("");
      setOpenSet((s) => s || new Set(d.orders.filter((o) => o.items.some((i) => OPEN.includes(i.status))).map((o) => o.id)));
    } catch (e) {
      if (e.code === "session") { store.set(""); setToken(""); setData(null); prev.current = null; }
      else setLoadErr("Couldn’t load your reviews. Please try again in a moment.");
    }
  }, [showToast]);

  React.useEffect(() => { if (token) load(token); }, [token, load]);
  // Live: alle 30 s (sichtbar) + beim Zurückkommen in den Tab; Dauer-Anzeige „In progress · 12 min" jede Minute.
  React.useEffect(() => {
    if (!token) return undefined;
    const refresh = () => { if (document.visibilityState === "visible") load(token); };
    const iv = setInterval(refresh, 30000);
    const iv2 = setInterval(() => tick((x) => x + 1), 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(iv); clearInterval(iv2); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [token, load]);
  React.useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setSheet(null); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const onToken = (t) => { store.set(t); prev.current = null; setOpenSet(null); setToken(t); };
  const logout = async () => {
    const t = token; store.set(""); setToken(""); setData(null); prev.current = null;
    try { await call("logout", { token: t }); } catch (e) { /* egal */ }
  };

  /* Stripe-Checkout in neuem Tab (Fenster sofort öffnen → kein Popup-Blocker). */
  const checkout = async (path, body, label) => {
    if (busy) return;
    setBusy(label);
    let w = null;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    try {
      const r = await call(path, { token, ...body });
      if (w && !w.closed) { w.location.href = r.url; showToast("Checkout opened in a new tab – this page updates once paid."); }
      else window.location.href = r.url;
    } catch (e) {
      if (w && !w.closed) w.close();
      showToast(e.code === "payment_unavailable" ? "Payment is unavailable right now – please contact us." : e.code === "nothing" ? "Nothing to pay here anymore." : "Something went wrong – please try again.");
      load(token);
    }
    setBusy("");
  };
  const decline = async (items, key) => {
    if (confirmKey !== key) { // zweiter Klick bestätigt
      setConfirmKey(key); clearTimeout(confirmT.current); confirmT.current = setTimeout(() => setConfirmKey(""), 4000);
      return;
    }
    setConfirmKey(""); setBusy(key);
    try {
      await call("software", { token, decision: "decline", items });
      showToast(items.length > 1 ? "Declined – nothing to pay" : "Declined – nothing to pay for this review");
      setSheet(null);
      await load(token);
    } catch (e) { showToast("Something went wrong – please try again."); }
    setBusy("");
  };
  const prepay = (items, key) => checkout("software", { decision: "accept", items }, key);

  if (token === null) return <div className="cdx" />;
  if (!token) return <div className="cdx"><Login onToken={onToken} /></div>;
  if (!data) {
    return (
      <div className="cdx">
        <div className="lg-wrap">{loadErr ? <div className="note bad">{loadErr} <button className="lnk" onClick={() => load(token)}>Retry</button></div> : <Loader className="spin big" />}</div>
      </div>
    );
  }

  const orders = data.orders || [];
  const all = orders.flatMap((o) => o.items.map((r) => ({ ...r, o })));
  const removed = all.filter((r) => r.status === "removed").length;
  const inProg = all.filter(TABS[2][2]).length;
  const remaining = all.filter((r) => OPEN.includes(r.status)).length;
  const firstName = String(data.name || "").trim().split(/\s+/)[0] || "";

  // Spezial-Software-Entscheidung
  const sw = all.filter((r) => r.status === "software");
  const swCur = sw[0]?.o.cur;
  const swSum = sw.reduce((s, r) => s + r.o.swDeposit, 0);
  const swFull = sw.length ? Math.max(...sw.map((r) => r.o.swPrice)) : 0;
  const swDep = sw.length ? Math.max(...sw.map((r) => r.o.swDeposit)) : 0;
  const refs = (list) => list.map((r) => ({ orderId: r.o.id, key: r.key }));

  // „To pay": gelöschte, unbezahlte Bewertungen (Betrag je Auftrag mit Mengenrabatt aus dem Backend)
  const dueOrders = orders.filter((o) => o.toPay > 0);
  const payCur = dueOrders[0]?.cur || orders[0]?.cur || "eur";
  const due = all.filter((r) => r.status === "removed" && !r.paid && r.o.cur === payCur);
  const toPay = dueOrders.filter((o) => o.cur === payCur).reduce((s, o) => s + o.toPay, 0);
  const prices = [...new Set(due.map((r) => r.price))];
  const deposits = orders.flatMap((o) => (o.deposits || []).map((d) => ({ ...d, o })));

  const ql = q.trim().toLowerCase();
  const filt = TABS.find((t) => t[0] === tab)[2];
  const openNow = openSet || new Set();
  const toggle = (id) => setOpenSet((s) => { const n = new Set(s || []); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width:760px)").matches;

  const decButtons = (r, cls = "") => {
    const k = r.o.id + ":" + r.key;
    return (
      <>
        <button className={"db no " + cls} disabled={!!busy} onClick={(e) => { e.stopPropagation(); decline(refs([r]), "no:" + k); }}>
          {confirmKey === "no:" + k ? "Tap again to decline" : "Decline"}
        </button>
        <button className={"db ok " + cls} disabled={!!busy} onClick={(e) => { e.stopPropagation(); prepay(refs([r]), "ok:" + k); }}>
          {busy === "ok:" + k ? <Loader className="spin" /> : <Lock />}Prepay {money(r.o.swDeposit, r.o.cur)}
        </button>
      </>
    );
  };

  const lists = orders.map((o) => {
    const rs = o.items.filter(filt).filter((r) => !ql || `${o.business} ${r.name || ""} ${r.text || ""}`.toLowerCase().includes(ql));
    if (!rs.length) return null;
    const n = o.items.length;
    const rm = o.items.filter((x) => x.status === "removed").length;
    const w = o.items.filter((x) => OPEN.includes(x.status)).length;
    const isO = openNow.has(o.id) || !!ql;
    return (
      <section key={o.id} className={"ord" + (isO ? " open" : "")}>
        <button className="oh" onClick={() => toggle(o.id)} aria-expanded={isO}>
          <div style={{ minWidth: 0 }}>
            <div className="oname">{o.business || "Order " + o.id}</div>
            <div className="om"><span>#{o.id}</span><span>·</span><span>Ordered {fmtDate(o.created)}</span></div>
          </div>
          <div className="prog">
            <div className="pl"><b>{rm} of {n} removed</b><span>{w ? w + " in progress" : o.cancelled ? "Cancelled" : "Completed"}</span></div>
            <div className="track"><i className="r" style={{ width: (n ? (rm / n) * 100 : 0) + "%" }} /><i className="w" style={{ width: (n ? (w / n) * 100 : 0) + "%", opacity: 0.35 }} /></div>
          </div>
          <span className="chev"><ChevronDown /></span>
        </button>
        {isO ? (
          <div className="revs">
            {rs.map((r) => (
              <div key={r.key} className="rev" onClick={() => { if (isMobile()) setSheet({ o, r }); }}>
                <div className="r1"><span className="au">{r.name || "Google review"}</span><Pills r={r} cur={o.cur} /></div>
                <div className={"tx" + (r.text ? "" : " none")}>{r.text ? "“" + r.text + "”" : "No review text"}</div>
                <div className="ex"><Info />{(ST[r.status] || ST.new).d}</div>
                {r.status === "software" ? <div className="rv-dec">{decButtons({ ...r, o })}</div> : null}
                <div className="ra">
                  {r.url ? <a className="openr" href={r.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}><ArrowUpRight />Open review</a> : null}
                  <span className="go"><ChevronRight /></span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    );
  }).filter(Boolean);

  return (
    <div className="cdx">
      <header className="top">
        <img src="/assets/rapidremove-icon.png" alt="" width={28} height={28} /><h1>My reviews</h1>
        <div className="user">
          <div className="who"><b>{data.name || data.email}</b><span>{data.email}</span></div>
          <span className="av">{initials(data.name, data.email)}</span>
          <button className="out" title="Log out" onClick={logout}><LogOut /><span className="t">Log out</span></button>
        </div>
      </header>

      <main className="wrap">
        <div className="hello"><div>
          <h2>Hello{firstName ? " " + firstName : ""}</h2>
          <p>{all.length ? `${removed} of ${all.length} ${plural(all.length, "review")} removed so far${inProg ? ` · ${inProg} in progress` : ""}.` : "Your reviews will show up here after your order."}</p>
        </div></div>

        {sw.length ? (
          <section className="dec">
            <div className="dec-h">
              <span className="dec-ic"><Cpu /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{sw.length} {plural(sw.length, "review")} {sw.length > 1 ? "need" : "needs"} our software</b>
                <p>{money(swFull, swCur)} each · 50 % now ({money(swDep, swCur)}), 50 % after removal · decline = nothing to pay</p>
              </div>
            </div>
            <div className="dec-b dec-all">
              <button className="db no" disabled={!!busy} onClick={() => decline(refs(sw), "no:all")}>{confirmKey === "no:all" ? "Tap again to decline" : sw.length > 1 ? "Decline all" : "Decline"}</button>
              <button className="db ok" disabled={!!busy} onClick={() => prepay(refs(sw), "ok:all")}>{busy === "ok:all" ? <Loader className="spin" /> : <Lock />}Prepay {money(swSum, swCur)}</button>
            </div>
            {sw.length > 1 ? (
              <>
                <button className="dec-tog" onClick={() => setDecOpen(!decOpen)}>{decOpen ? "Hide" : "Decide individually"}{decOpen ? <ChevronUp /> : <ChevronDown />}</button>
                {decOpen ? (
                  <div className="dec-list">
                    {sw.map((r) => (
                      <div key={r.o.id + r.key} className="dec-it">
                        <div style={{ minWidth: 0 }}>
                          <span className="who">{r.name || "Google review"}</span><span className="dord">{r.o.business}</span>
                          <div className="txt">{r.text ? "“" + r.text + "”" : "No review text"}</div>
                        </div>
                        <div className="dec-b">{decButtons(r, "sm")}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}

        {deposits.map((d) => (
          <section key={d.id} className="dec dep">
            <div className="dec-h">
              <span className="dec-ic"><Lock /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>Deposit for {d.n || ""} {plural(d.n || 2, "review")} without text</b>
                <p>{d.o.business} · #{d.o.id} · 50 % now, 50 % after removal</p>
              </div>
              <a className="db ok" href={d.url} target="_blank" rel="noopener noreferrer"><Lock />Pay {money(d.amount, d.cur)}</a>
            </div>
          </section>
        ))}

        {all.length ? (
          due.length ? (
            <section className="pay">
              <div className="pay-l">
                <span className="pay-k"><Wallet />To pay</span>
                <b className="pay-v">{money(toPay, payCur)}</b>
                <span className="pay-s">{due.length} {plural(due.length, "review")} removed{prices.length === 1 ? ` · ${money(prices[0], payCur)} each` : ""}</span>
              </div>
              <div className="pay-r">
                <span className="pay-rem"><Hourglass />Remaining <b>{remaining}</b> {plural(remaining, "review")}</span>
                <button className="pay-btn" disabled={!!busy} onClick={() => checkout("pay", {}, "pay")}>
                  {busy === "pay" ? <Loader className="spin" /> : null}Pay {money(toPay, payCur)}<ArrowRight />
                </button>
              </div>
              <div className="pay-note">You only pay for removed reviews. New removals are added to this amount.</div>
            </section>
          ) : (
            <section className="pay none">
              <div className="pay-l">
                <span className="pay-k"><CheckCircle2 />All paid</span>
                <span className="pay-s">{remaining ? <>Remaining <b>{remaining}</b> {plural(remaining, "review")} in progress. You’ll only pay once they’re removed.</> : "Nothing open right now."}</span>
              </div>
            </section>
          )
        ) : null}

        <div className="kpis">
          <div className="kpi ok"><b>{removed}</b><span>Removed</span></div>
          <div className="kpi"><b>{inProg}</b><span>In progress</span></div>
          <div className="kpi"><b>{all.length}</b><span>Reviews total</span></div>
          <div className="kpi"><b>{orders.length}</b><span>Orders</span></div>
        </div>

        <div className="bar">
          <div className="tabs">
            {TABS.map(([k, l, f]) => (
              <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}<span className="n">{all.filter(f).length}</span></button>
            ))}
          </div>
          <label className="search"><Search /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search business or review" /></label>
        </div>

        <div className="list">
          {lists.length ? lists : (
            <div className="empty">
              <img src="/assets/rapidremove-rocket-orange.png" alt="" />
              <b>Nothing here</b>{orders.length ? "No reviews match this filter." : "You don’t have any review orders yet."}
            </div>
          )}
        </div>

        <div className="help"><MessageCircle /><span>Questions about an order? We usually reply within a few hours.</span><a href={`mailto:${HELP_MAIL}`}>Contact us</a></div>
      </main>

      <div className={"toast" + (toast ? " show" : "")} role="status">{toast}</div>

      <div className={"as-bg" + (sheet ? " show" : "")} onClick={() => setSheet(null)} />
      <div className={"as" + (sheet ? " show" : "")} aria-hidden={!sheet}>
        {sheet ? (() => {
          // Immer den aktuellen Stand zeigen (z. B. nach Ablehnen).
          const o = orders.find((x) => x.id === sheet.o.id) || sheet.o;
          const r = o.items.find((x) => x.key === sheet.r.key) || sheet.r;
          const isSw = r.status === "software";
          return (
            <>
              <div className="as-card">
                <div className="ah"><span className="au">{r.name || "Google review"}</span><span className="pills"><Pills r={r} cur={o.cur} /></span></div>
                <div className="meta">{o.business} · #{o.id}</div>
                <div className={"full" + (r.text ? "" : " none")}>{r.text ? "“" + r.text + "”" : "No review text"}</div>
                <div className="exp"><Info />{(ST[r.status] || ST.new).d}</div>
                {isSw ? <div className="as-dec">{decButtons({ ...r, o })}</div> : null}
                {r.url ? <a className={"btn " + (isSw ? "btn-line" : "btn-primary")} href={r.url} target="_blank" rel="noopener noreferrer"><ArrowUpRight />Open review on Google</a> : null}
              </div>
              <button className="as-x" onClick={() => setSheet(null)}>Close</button>
            </>
          );
        })() : null}
      </div>
    </div>
  );
}
