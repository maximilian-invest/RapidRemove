"use client";
/* Kunden-App „My reviews" (rapid-remove.com/my-reviews) — vorerst NUR Einzelbewertungen.
   Design: Claude-Design-Handoff „Customer App" (Uber/Revolut-Stil; Mobil mit Tab-Leiste,
   Desktop mit Sidebar). Daten: ops /cust/me (Status live vom Partner-Board).
   Aktionen: /cust/software (Spezialisten-Löschung: Anzahlung zahlen oder ablehnen) und
   /cust/pay (alle gelöschten, unbezahlten Bewertungen). Bezahlt wird im Stripe-Checkout
   (neuer Tab); beim Zurückkommen lädt die App neu und zeigt den bezahlten Stand.
   Wortwahl laut Handoff: externer Spezialist — nie „unsere Software". */
import React from "react";
import {
  Home, List, Wallet, User, AlertTriangle, ArrowRight, ArrowLeft, X, Check, CheckCircle2, Search, Loader, Ban,
  XCircle, AlertCircle, Cpu, Receipt, MessageCircle, FileText, ShieldCheck, LogOut, ChevronRight, ExternalLink, ScanFace,
  BadgeCheck, Timer, Lock, CreditCard, Smartphone,
} from "lucide-react";
import "@/styles/dashboard.css";
import PasskeyOffer, { PasskeyLoginButton } from "@/components/PasskeyOffer";
import { passkeySupported, passkeyOnDevice, passkeyDismissed, passkeyRegister, passkeyName, passkeyError } from "@/lib/passkey";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const KEY = "rr_cust_session";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
const HELP_MAIL = "helpdesk@rapid-remove.com";
const IMG = { wallet: "/assets/app/wallet.webp", shield: "/assets/app/shield.webp", rocket: "/assets/app/rocket.webp" };

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
const shortDate = (iso) => { try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); } catch (e) { return ""; } };
function dur(iso) {
  if (!iso) return "";
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return m + " min";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " h" + (m % 60 ? " " + (m % 60) + " min" : "");
  const d = Math.floor(h / 24);
  return d + " d" + (h % 24 ? " " + (h % 24) + " h" : "");
}
function ago(iso) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 2) return "Now";
  if (m < 60) return m + " min ago";
  if (m < 24 * 60) return Math.round(m / 60) + " h ago";
  if (m < 48 * 60) return "Yesterday";
  return shortDate(iso);
}
const plural = (n, one, many) => (n === 1 ? one : many || one + "s");
const initials = (name, email) => {
  const p = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (p.length) return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  return String(email || "?").slice(0, 2).toUpperCase();
};

/* ---- Status (intern → Kunde) ---- */
const ST = {
  new: { l: "Being checked", I: Search, ico: "in", why: "We’re checking whether this review can be removed." },
  working: { l: "In progress", I: Loader, ico: "wk", why: "We’re working on the removal right now." },
  removed: { l: "Removed", I: CheckCircle2, ico: "ok", why: "This review is gone from Google." },
  notpossible: { l: "Not removable", I: Ban, ico: "no", why: "This review can’t be removed. You won’t be charged." },
  software: { l: "Needs your decision", I: AlertCircle, ico: "pr", why: "This one needs our specialist partner." },
  sw_accepted: { l: "Specialist removal running", I: Cpu, ico: "wk", why: "Commissioned – our specialist partner is on it." },
  sw_declined: { l: "Declined", I: XCircle, ico: "", why: "You declined. Nothing to pay." },
  cancelled: { l: "Cancelled", I: XCircle, ico: "", why: "This review was cancelled." },
};
const OPEN = ["new", "working", "software", "sw_accepted"];
const statusLine = (r, cur) => (ST[r.status] || ST.new).l
  + (r.status === "working" && r.since ? " · " + dur(r.since) : "")
  + (r.status === "removed" ? (r.paid ? " · Paid" : " · " + money(r.price, cur) + " to pay") : "");

function Ring({ r, n }) {
  const R = 24, C = 2 * Math.PI * R, p = n ? r / n : 0;
  return (
    <div className="ring">
      <svg viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={R} fill="none" stroke="#e2e2e2" strokeWidth="6" />
        {p ? <circle cx="28" cy="28" r={R} fill="none" stroke={p === 1 ? "var(--success)" : "#111"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${C * p} ${C}`} /> : null}
      </svg>
      <b>{r}/{n}</b>
    </div>
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
        <div className="lg-art"><img src={IMG.rocket} alt="" /></div>
        <div>
          <h1>{forgot ? "New password" : "Your reviews"}</h1>
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
        <button className="cta" disabled={busy}>{busy ? <Loader className="spin" /> : null}{forgot ? "Send new password" : "Log in"}</button>
        {!forgot ? <PasskeyLoginButton role="customer" onToken={onToken} onError={setErr} /> : null}
        <button type="button" className="lnk" onClick={() => { setForgot(!forgot); setErr(""); setInfo(""); }}>{forgot ? "Back to log in" : "Forgot password?"}</button>
      </form>
    </div>
  );
}

/* ---- App ---- */
export default function CustomerDashboard() {
  const [token, setToken] = React.useState(null); // null = noch nicht gelesen
  const [data, setData] = React.useState(null);
  const [loadErr, setLoadErr] = React.useState("");
  const [tab, setTab] = React.useState("home");
  const [ofilter, setOfilter] = React.useState("all");
  const [detailId, setDetailId] = React.useState(null);
  const [sheet, setSheet] = React.useState(null); // { orderId, key }
  const [flow, setFlow] = React.useState(null); // { step, items, pick:Set, mode, total, n, url }
  const [toast, setToast] = React.useState(null); // { m, bad }
  const [busy, setBusy] = React.useState("");
  const [, tick] = React.useState(0);
  const prev = React.useRef(null);
  const toastT = React.useRef(0);
  const mainRef = React.useRef(null);

  const showToast = React.useCallback((m, bad) => {
    setToast({ m, bad: !!bad }); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 3200);
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
      const p = prev.current;
      if (p) { // Zahlung eingegangen? (Rückkehr aus dem Stripe-Tab)
        const was = new Map(p.orders.flatMap((o) => o.items.map((i) => [o.id + "\u0001" + i.key, i])));
        let swOk = 0, paid = 0;
        for (const o of d.orders) for (const i of o.items) {
          const w = was.get(o.id + "\u0001" + i.key);
          if (!w) continue;
          if (w.status === "software" && i.status === "sw_accepted") swOk++;
          if (w.status === "removed" && !w.paid && i.paid) paid++;
        }
        if (swOk) showToast(`Payment received – our specialist is on it`);
        else if (paid) showToast("Paid – thank you");
      }
      prev.current = d;
      setData(d); setLoadErr("");
    } catch (e) {
      if (e.code === "session") { store.set(""); setToken(""); setData(null); prev.current = null; }
      else setLoadErr("Couldn’t load your reviews. Please try again in a moment.");
    }
  }, [showToast]);

  React.useEffect(() => { if (token) load(token); }, [token, load]);
  // Live: alle 30 s (sichtbar) + beim Zurückkommen in den Tab; Dauer „In progress · 12 min" jede Minute.
  React.useEffect(() => {
    if (!token) return undefined;
    const refresh = () => { if (document.visibilityState === "visible") load(token); };
    const iv = setInterval(refresh, flow && flow.mode === "waiting" ? 8000 : 30000);
    const iv2 = setInterval(() => tick((x) => x + 1), 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(iv); clearInterval(iv2); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [token, load, flow]);
  React.useEffect(() => {
    const k = (e) => {
      if (e.key !== "Escape") return;
      if (flow) setFlow(null); else if (sheet) setSheet(null); else if (detailId) setDetailId(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [flow, sheet, detailId]);

  // Flow wartet auf die Zahlung → sobald alle gewählten Bewertungen „angenommen" sind: fertig.
  React.useEffect(() => {
    if (!flow || flow.mode !== "waiting" || !data) return;
    const st = new Map(data.orders.flatMap((o) => o.items.map((i) => [o.id + "\u0001" + i.key, i.status])));
    const keys = flow.items.filter((it) => flow.pick.has(it.id)).map((it) => it.id);
    if (keys.length && keys.every((k) => st.get(k) === "sw_accepted")) setFlow((f) => (f ? { ...f, mode: "paid" } : f));
  }, [data, flow]);

  const [offerPk, setOfferPk] = React.useState(false);
  const onToken = (t, viaPasskey) => {
    store.set(t); prev.current = null; setToken(t);
    // Nach dem Passwort-Login einmal Face ID anbieten.
    if (!viaPasskey && passkeySupported() && !passkeyOnDevice("customer") && !passkeyDismissed("customer")) setOfferPk(true);
  };
  const logout = async () => {
    const t = token; store.set(""); setToken(""); setData(null); prev.current = null; setTab("home");
    try { await call("logout", { token: t }); } catch (e) { /* egal */ }
  };
  const goTab = (t) => { setTab(t); setDetailId(null); try { window.scrollTo(0, 0); } catch (e) { /* */ } };

  if (token === null) return <div className="rra" />;
  if (!token) return <div className="rra"><Login onToken={onToken} /></div>;
  if (offerPk) return <PasskeyOffer role="customer" token={token} onDone={(on) => { setOfferPk(false); if (on) showToast(`${passkeyName() === "passkey" ? "Passkey" : passkeyName()} login is on`); }} />;
  if (!data) {
    return (
      <div className="rra"><div className="lg-wrap">
        {loadErr ? <div className="lg"><div className="note bad">{loadErr}</div><button className="cta" onClick={() => load(token)}>Try again</button></div> : <Loader className="spin" />}
      </div></div>
    );
  }

  /* ---- Abgeleitete Daten ---- */
  const orders = data.orders || [];
  const all = orders.flatMap((o) => o.items.map((r) => ({ ...r, o, id: o.id + "\u0001" + r.key })));
  const removedN = all.filter((r) => r.status === "removed").length;
  const remaining = all.filter((r) => OPEN.includes(r.status)).length;
  const firstName = String(data.name || "").trim().split(/\s+/)[0] || "";
  const ini = initials(data.name, data.email);
  const sw = all.filter((r) => r.status === "software");
  const swOrders = new Set(sw.map((r) => r.o.id)).size;

  const dueOrders = orders.filter((o) => o.toPay > 0);
  const payCur = dueOrders[0]?.cur || orders[0]?.cur || "eur";
  const due = all.filter((r) => r.status === "removed" && !r.paid && r.o.cur === payCur);
  const toPay = dueOrders.filter((o) => o.cur === payCur).reduce((s, o) => s + o.toPay, 0);
  const prices = [...new Set(due.map((r) => r.price))];
  const deposits = orders.flatMap((o) => (o.deposits || []).map((d) => ({ ...d, o })));
  const history = orders.flatMap((o) => (o.history || []).map((h) => ({ ...h, o }))).sort((a, b) => String(b.paid).localeCompare(String(a.paid)));

  const acts = [
    ...sw.map((r) => ({ k: "d" + r.id, I: AlertCircle, c: "pr", t: "Decision needed", s: r, tm: r.changedAt ? ago(r.changedAt) : "Today", at: Date.now() + 1 })),
    ...all.filter((r) => r.status === "working").map((r) => ({ k: "w" + r.id, I: Loader, c: "wk", t: "Working on it" + (r.since ? " · " + dur(r.since) : ""), s: r, tm: "Now", at: Date.now() })),
    ...all.filter((r) => r.status === "sw_accepted").map((r) => ({ k: "a" + r.id, I: Cpu, c: "wk", t: "Specialist on it", s: r, tm: ago(r.changedAt), at: r.changedAt ? new Date(r.changedAt).getTime() : 0 })),
    ...all.filter((r) => r.status === "removed").map((r) => ({ k: "r" + r.id, I: Check, c: "ok", t: "Review removed", s: r, tm: ago(r.removedAt), at: r.removedAt ? new Date(r.removedAt).getTime() : 0 })),
  ].sort((a, b) => b.at - a.at).slice(0, 6);

  /* ---- Zahlungen ---- */
  const checkout = async (path, body, label) => {
    if (busy) return null;
    setBusy(label);
    let w = null;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    try {
      const r = await call(path, { token, ...body });
      if (w && !w.closed) w.location.href = r.url; else window.location.href = r.url;
      setBusy("");
      return r.url;
    } catch (e) {
      if (w && !w.closed) w.close();
      showToast(e.code === "payment_unavailable" ? "Payment isn’t available right now – please contact us." : e.code === "nothing" ? "Nothing to pay here anymore." : "Something went wrong – please try again.", true);
      load(token);
      setBusy("");
      return null;
    }
  };
  const payAll = async () => { if (await checkout("pay", {}, "pay")) showToast("Checkout opened in a new tab"); };

  /* ---- Problem-Flow (Spezialist) ---- */
  const openFlow = () => {
    setSheet(null);
    const items = sw.map((r) => ({ id: r.id, orderId: r.o.id, key: r.key, name: r.name || "Google review", text: r.text, business: r.o.business, cur: r.o.cur, price: r.o.swPrice, dep: r.o.swDeposit }));
    if (!items.length) return;
    setFlow({ step: 0, items, pick: new Set(items.map((i) => i.id)), mode: "", url: "" });
  };
  const flowRefs = (list) => list.map((i) => ({ orderId: i.orderId, key: i.key }));
  const flowNext = async () => {
    const f = flow; if (!f) return;
    const sel = f.items.filter((i) => f.pick.has(i.id));
    const des = f.items.filter((i) => !f.pick.has(i.id));
    if (f.step === 4) { setFlow(null); load(token); return; }
    if (f.step === 2 && !sel.length) { // alles ablehnen → kostenlos
      setBusy("flow");
      try { await call("software", { token, decision: "decline", items: flowRefs(des) }); setFlow({ ...f, step: 4, mode: "declined" }); load(token); }
      catch (e) { showToast("Something went wrong – please try again.", true); }
      setBusy("");
      return;
    }
    if (f.step === 3) { // nicht gewählte ablehnen, gewählte bezahlen
      if (busy) return;
      setBusy("flow");
      let w = null;
      try { w = window.open("", "_blank"); } catch (e) { w = null; }
      try {
        if (des.length) await call("software", { token, decision: "decline", items: flowRefs(des) });
        const r = await call("software", { token, decision: "accept", items: flowRefs(sel) });
        if (w && !w.closed) w.location.href = r.url; else window.location.href = r.url;
        setFlow({ ...f, step: 4, mode: "waiting", url: r.url, items: sel, pick: new Set(sel.map((i) => i.id)) });
        load(token);
      } catch (e) {
        if (w && !w.closed) w.close();
        showToast(e.code === "payment_unavailable" ? "Payment isn’t available right now – please contact us." : "Something went wrong – please try again.", true);
        load(token);
      }
      setBusy("");
      return;
    }
    setFlow({ ...f, step: f.step + 1 });
  };

  /* ---- Bausteine ---- */
  const AlertBtn = ({ title, sub }) => (
    <button className="alert" onClick={openFlow}>
      <span className="ai"><AlertTriangle /></span>
      <span><b>{title}</b><span>{sub}</span></span>
      <span className="ar"><ArrowRight /></span>
    </button>
  );
  const Hero = ({ payments }) => (due.length ? (
    <div className="hero">
      <span className="hero-img"><img src={IMG.wallet} alt="" /></span>
      <div className="k">To pay</div>
      <div className="v">{money(toPay, payCur)}</div>
      <div className="s">{payments ? `${due.length} removed ${plural(due.length, "review")}` : `${due.length} ${plural(due.length, "review")} removed${prices.length === 1 ? " · " + money(prices[0], payCur) + " each" : ""}`}</div>
      <div className="row">
        {payments ? <span /> : <span className="rem"><i />Remaining {remaining} {plural(remaining, "review")}</span>}
        <button className="pill-btn" disabled={!!busy} onClick={payAll}>{busy === "pay" ? <Loader className="spin" /> : null}{payments ? "Pay now" : "Pay"}</button>
      </div>
    </div>
  ) : payments ? null : (
    <div className="hero ok">
      <span className="hero-img"><img src={IMG.rocket} alt="" /></span>
      <div className="k">All paid</div>
      <div className="v" style={{ fontSize: 30, letterSpacing: -1 }}>{money(0, payCur)} due</div>
      <div className="s">{remaining ? `Remaining ${remaining} ${plural(remaining, "review")} in progress` : "Nothing open right now"}</div>
    </div>
  ));
  const DepositCards = () => deposits.map((d) => (
    <div key={d.id} className="paycard due">
      <span className="ico pr"><Lock /></span>
      <span><b>Prepayment · {d.n || ""} {plural(d.n || 2, "review")} without text</b><span>{d.o.business} · 99 % success · full refund if not removed within 14 days</span></span>
      <a className="mini" href={d.url} target="_blank" rel="noopener noreferrer"><Lock />Pay {money(d.amount, d.cur)}</a>
    </div>
  ));

  /* ---- Screens ---- */
  const HomeV = () => (
    <>
      <div className="hhead">
        <div><h1>Hi{firstName ? " " + firstName : ""}</h1><p className="hsub">{removedN} of {all.length} {plural(all.length, "review")} removed so far</p></div>
        <span className="av">{ini}</span>
      </div>
      <div className="hg">
        <div className="hl">
          {sw.length ? <AlertBtn title={`Problem with ${swOrders} ${plural(swOrders, "order")}`} sub={`${sw.length} ${plural(sw.length, "review")} ${sw.length > 1 ? "need" : "needs"} your decision`} /> : null}
          {all.length ? <Hero /> : null}
          {deposits.length ? <div style={{ marginBottom: 24 }}><DepositCards /></div> : null}
          <div className="sec" style={{ marginTop: 4 }}><h2>Your orders</h2>{orders.length ? <button onClick={() => goTab("orders")}>See all</button> : null}</div>
          {orders.length ? (
            <div className="carousel">
              {orders.map((o) => {
                const n = o.items.length, r = o.items.filter((x) => x.status === "removed").length;
                const act = o.items.some((x) => x.status === "software");
                return (
                  <button key={o.id} className="oc" onClick={() => setDetailId(o.id)}>
                    <Ring r={r} n={n} />
                    <span className="n">{o.business || "Order " + o.id}</span>
                    <span className="m">{act ? <b>Action needed</b> : o.items.filter((x) => OPEN.includes(x.status)).length + " in progress"}</span>
                  </button>
                );
              })}
            </div>
          ) : <div className="empty"><img src={IMG.rocket} alt="" />No orders yet.</div>}
        </div>
        <aside className="hr">
          <div className="sec"><h2>Activity</h2></div>
          <div className="act">
            {acts.length ? acts.map((a) => (
              <button key={a.k} className="ai-row" onClick={() => setSheet({ orderId: a.s.o.id, key: a.s.key })}>
                <span className={"ico " + a.c}><a.I /></span>
                <span className="t"><b>{a.t}</b><span>{(a.s.name || "Google review") + " · " + a.s.o.business}</span></span>
                <span className="tm">{a.tm}</span>
              </button>
            )) : <div className="empty" style={{ padding: "16px 0" }}>Updates show up here.</div>}
          </div>
        </aside>
      </div>
    </>
  );

  const OrdersV = () => {
    const F = { all: () => true, open: (o) => o.items.some((x) => OPEN.includes(x.status)), done: (o) => !o.items.some((x) => OPEN.includes(x.status)) };
    const l = orders.filter(F[ofilter]);
    return (
      <>
        <div className="ttl">Orders</div>
        <div className="chips">
          {[["all", "All"], ["open", "Active"], ["done", "Completed"]].map(([k, t]) => (
            <button key={k} className={"chip" + (ofilter === k ? " on" : "")} onClick={() => setOfilter(k)}>{t}</button>
          ))}
        </div>
        {l.length ? l.map((o) => {
          const n = o.items.length, r = o.items.filter((x) => x.status === "removed").length, act = o.items.some((x) => x.status === "software");
          return (
            <button key={o.id} className="orow" onClick={() => setDetailId(o.id)}>
              <Ring r={r} n={n} />
              <span className="t">
                <b>{o.business || "Order " + o.id}</b>
                <span>#{o.id} · {shortDate(o.created)}</span>
                {act ? <><br /><span className="tag pr"><AlertCircle />Action needed</span></> : null}
              </span>
              <ChevronRight />
            </button>
          );
        }) : <div className="empty">No orders here.</div>}
      </>
    );
  };

  const PayV = () => (
    <>
      <div className="ttl">Payments</div>
      <Hero payments />
      <DepositCards />
      <div className="sec" style={{ marginTop: due.length || deposits.length ? 8 : 0 }}><h2>History</h2></div>
      {history.length ? history.map((h) => (
        <div key={h.id} className="paycard">
          <span className="ico"><Receipt /></span>
          <span>
            <b>{h.kind === "software" ? "Specialist removal" : h.kind === "deposit" ? "Prepayment" : "Removal"}{h.n > 1 ? ` · ${h.n} reviews` : ""}</b>
            <span>{(h.names.length ? h.names.join(", ") : h.o.business) + " · " + shortDate(h.paid)}</span>
          </span>
          <span className="amt">{money(h.amount, h.cur)}</span>
        </div>
      )) : <div className="empty"><img src={IMG.wallet} alt="" />No payments yet.</div>}
    </>
  );

  const AccV = () => (
    <>
      <div className="ttl">Account</div>
      <div className="paycard"><span className="av">{ini}</span><span><b>{data.name || data.email}</b><span>{data.email}</span></span></div>
      <div className="acc-rows">
        {passkeySupported() ? (
          <button className="ai-row" onClick={async () => {
            if (passkeyOnDevice("customer")) { showToast(`${passkeyName() === "passkey" ? "Passkey" : passkeyName()} login is already on`); return; }
            try { await passkeyRegister("customer", token); showToast(`${passkeyName() === "passkey" ? "Passkey" : passkeyName()} login is on`); } catch (e) { const m = passkeyError(e); if (m) showToast(m, true); }
          }}><span className="ico"><ScanFace /></span><span className="t"><b>{passkeyName() === "passkey" ? "Passkey" : passkeyName() === "fingerprint" ? "Fingerprint" : passkeyName()} login</b><span>{passkeyOnDevice("customer") ? "On for this device" : "Log in without a password"}</span></span><ChevronRight /></button>
        ) : null}
        <a className="ai-row" href={`mailto:${HELP_MAIL}`}><span className="ico"><MessageCircle /></span><span className="t"><b>Help &amp; contact</b><span>We usually reply within a few hours</span></span><ChevronRight /></a>
        <button className="ai-row" onClick={() => goTab("pay")}><span className="ico"><FileText /></span><span className="t"><b>Invoices</b><span>Sent by email after each payment</span></span><ChevronRight /></button>
        <a className="ai-row" href="/en/privacy-policy" target="_blank" rel="noopener noreferrer"><span className="ico"><ShieldCheck /></span><span className="t"><b>Privacy</b></span><ChevronRight /></a>
        <button className="ai-row" onClick={logout}><span className="ico"><LogOut /></span><span className="t"><b>Log out</b></span><ChevronRight /></button>
      </div>
    </>
  );

  const detail = detailId ? orders.find((o) => o.id === detailId) : null;
  const DetailV = () => {
    const o = detail; if (!o) return null;
    const n = o.items.length, r = o.items.filter((x) => x.status === "removed").length;
    const op = o.items.filter((x) => OPEN.includes(x.status)).length, s = o.items.filter((x) => x.status === "software").length;
    return (
      <>
        <button className="back" onClick={() => setDetailId(null)} aria-label="Close"><ArrowLeft className="li" /><X className="xi" /></button>
        <div className="dh"><h1>{o.business || "Order " + o.id}</h1><p>#{o.id} · Ordered {shortDate(o.created)}</p></div>
        <div className="bigprog"><Ring r={r} n={n} /><span><b>{r} of {n} removed</b><span>{op ? op + " still in progress" : o.cancelled ? "Cancelled" : "Completed"}</span></span></div>
        {s ? <div style={{ marginBottom: 18 }}><AlertBtn title={`${s} ${plural(s, "review")} ${s > 1 ? "need" : "needs"} you`} sub="Tap to see what’s going on" /></div> : null}
        <div className="sec"><h2>Reviews</h2></div>
        {o.items.map((x) => {
          const st = ST[x.status] || ST.new;
          return (
            <button key={x.key} className="rrow" onClick={() => setSheet({ orderId: o.id, key: x.key })}>
              <span className={"ico " + st.ico}><st.I /></span>
              <span className="t">
                <span className="a">{x.name || "Google review"}</span>
                <span className={"x" + (x.text ? "" : " none")}>{x.text || "No review text"}</span>
                <span className={"st c-" + x.status}>{statusLine(x, o.cur)}</span>
              </span>
            </button>
          );
        })}
      </>
    );
  };

  const sheetData = sheet ? (() => {
    const o = orders.find((x) => x.id === sheet.orderId);
    const r = o && o.items.find((x) => x.key === sheet.key);
    return o && r ? { o, r } : null;
  })() : null;

  /* ---- Flow-Inhalt ---- */
  const FlowV = () => {
    const f = flow; if (!f) return null;
    const S = f.step, it = f.items, sel = it.filter((i) => f.pick.has(i.id)), n = sel.length;
    const cur = it[0]?.cur || payCur;
    const full = sel.reduce((s, i) => s + i.price, 0), dep = sel.reduce((s, i) => s + i.dep, 0);
    const unit = Math.max(...it.map((i) => i.price)), unitDep = Math.max(...it.map((i) => i.dep));
    const steps = n ? 4 : 3;
    let body = null, btn = "Continue", cls = "";
    if (S === 0) body = (
      <>
        <div className="fl-art"><img src={IMG.shield} alt="" /></div>
        <div className="fl-k">What happened</div>
        <h2>Google is protecting {it.length} of your {plural(it.length, "review")}</h2>
        <p>We tried our standard removal, but Google declined it. This happens when a review is worded carefully enough that it doesn’t break Google’s rules on its own.</p>
        <p className="strong">There’s still a way – and you decide if you want it.</p>
      </>
    );
    if (S === 1) body = (
      <>
        <div className="fl-k">Your options</div>
        <h2>A specialist can still remove {it.length > 1 ? "them" : "it"}</h2>
        <p>For cases like this we work with a vetted external partner who specialises in hard-to-remove reviews and uses dedicated tools we don’t run ourselves.</p>
        <div className="fl-feat">
          <div className="ff"><span className="ico"><BadgeCheck /></span><span><b>Vetted specialist</b><span>A partner we’ve worked with on many cases – we stay your contact throughout.</span></span></div>
          <div className="ff"><span className="ico"><Receipt /></span><span><b>Transparent price</b><span>The price mainly covers the specialist’s work. It’s paid upfront because we commission them right away.</span></span></div>
          <div className="ff"><span className="ico"><ShieldCheck /></span><span><b>99 % success rate</b><span>If a review isn’t removed within 14 days at the latest, you get a full refund.</span></span></div>
          <div className="ff"><span className="ico"><Timer /></span><span><b>Usually within a few days</b><span>Takes a bit longer than our standard removal.</span></span></div>
        </div>
        <div className="optc">
          <div className="oc2 hl"><div className="h"><b>Specialist removal</b><span className="p">{money(unit, cur)}</span></div><span>per review · paid upfront · invoice included</span></div>
          <div className="oc2"><div className="h"><b>No thanks</b><span className="p">{money(0, cur)}</span></div><span>The review stays online – no cost, no obligation</span></div>
        </div>
      </>
    );
    if (S === 2) {
      body = (
        <>
          <div className="fl-k">Choose</div>
          <h2>Which ones should we remove?</h2>
          <p>You decide per review. Tap to deselect any you’d rather leave.</p>
          <div className="pick">
            {it.map((i) => (
              <button key={i.id} className={"pk" + (f.pick.has(i.id) ? " on" : "")} onClick={() => { const p = new Set(f.pick); p.has(i.id) ? p.delete(i.id) : p.add(i.id); setFlow({ ...f, pick: p }); }}>
                <span className="tog"><Check /></span>
                <span className="t"><b>{i.name}</b><span>{i.business}{i.text ? " · “" + i.text + "”" : ""}</span></span>
                <span className="p">{money(i.price, i.cur)}</span>
              </button>
            ))}
          </div>
          <div className="totl"><span>Total</span><b>{money(full, cur)}</b></div>
          
        </>
      );
      btn = n ? "Continue to payment" : "Decline all · " + money(0, cur);
    }
    if (S === 3) {
      body = (
        <>
          <div className="fl-k">Payment</div>
          <h2>Pay {money(dep, cur)} and we commission the specialist today</h2>
          <p>{n} specialist {plural(n, "removal")}{it.length - n ? ` · ${it.length - n} declined` : ""} </p>
          <div className="pms">
            <div className="pm"><span className="ico"><CreditCard /></span>Card<CheckCircle2 className="ok" /></div>
            <div className="pm"><span className="ico"><Smartphone /></span>Apple Pay · Google Pay<CheckCircle2 className="ok" /></div>
          </div>
          <div className="totl"><span>Total today</span><b>{money(dep, cur)}</b></div>
          <div className="secure"><Lock />Secure payment · Invoice by email · Full refund if not removed within 14 days</div>
        </>
      );
      btn = "Pay " + money(dep, cur); cls = "or";
    }
    if (S === 4) {
      const paid = f.mode === "paid", waiting = f.mode === "waiting";
      body = (
        <>
          <div className="fl-art"><img src={IMG.rocket} alt="" /></div>
          <h2>{f.mode === "declined" ? "Done – nothing to pay" : paid ? "You’re all set" : "Almost done"}</h2>
          <p>{f.mode === "declined" ? "The reviews stay online and you won’t be charged."
            : paid ? `We received ${money(dep, cur)} and have commissioned our specialist for ${n} ${plural(n, "review")}. You’ll see every update in Activity.`
              : "Finish the payment in the new tab. This page updates by itself once we’ve received it."}</p>
          {waiting && f.url ? <a className="fl-again" href={f.url} target="_blank" rel="noopener noreferrer">Open payment again</a> : null}
        </>
      );
      btn = "Done";
    }
    return (
      <div className="fl-card">
        <div className="fl-top">
          <button className="x" onClick={() => { setFlow(null); load(token); }} aria-label="Close"><X /></button>
          <div className="fl-bar">{S < 4 ? Array.from({ length: steps }, (_, i) => <i key={i} className={i <= S ? "on" : ""} />) : null}</div>
        </div>
        <div className="fl-body">{body}</div>
        <div className="fl-foot">
          {S > 0 && S < 4 ? <button className="bk" onClick={() => setFlow({ ...f, step: S - 1 })} aria-label="Back"><ArrowLeft /></button> : null}
          <button className={"cta " + cls} disabled={busy === "flow"} onClick={flowNext}>{busy === "flow" ? <Loader className="spin" /> : S === 3 ? <Lock /> : null}{btn}</button>
        </div>
      </div>
    );
  };

  const TABS = [["home", Home, "Home"], ["orders", List, "Orders"], ["pay", Wallet, "Payments"], ["acc", User, "Account"]];
  return (
    <div className="rra">
      <div className="app">
        <main className="screen" ref={mainRef}>
          {tab === "home" ? HomeV() : tab === "orders" ? OrdersV() : tab === "pay" ? PayV() : AccV()}
        </main>
        <nav className="tabbar">
          <div className="brand"><img src="/assets/rapidremove-icon.png" alt="" />RapidRemove</div>
          {TABS.map(([k, I, l]) => (
            <button key={k} className={"tb" + (tab === k ? " on" : "")} onClick={() => goTab(k)}>
              <I /><span>{l}</span>{k === "home" && sw.length ? <span className="bd">{sw.length}</span> : null}
            </button>
          ))}
          <div className="side-user"><span className="av">{ini}</span><span><b>{data.name || data.email}</b><span>{data.email}</span></span></div>
        </nav>
      </div>

      <div className={"dbg" + (detail ? " show" : "")} onClick={() => setDetailId(null)} />
      <section className={"push" + (detail ? " show" : "")} aria-hidden={!detail}>{DetailV()}</section>

      <div className={"bg" + (sheetData ? " show" : "")} onClick={() => setSheet(null)} />
      <div className={"rv-sheet" + (sheetData ? " show" : "")} aria-hidden={!sheetData}>
        {sheetData ? (() => {
          const { o, r } = sheetData; const st = ST[r.status] || ST.new; const isSw = r.status === "software";
          return (
            <>
              <div className="grab" />
              <h3>{r.name || "Google review"}</h3>
              <div className="meta">{o.business} · #{o.id}</div>
              <div className="q">{r.text ? "“" + r.text + "”" : <i>No review text</i>}</div>
              <div className="why"><span className={"ico " + st.ico}><st.I /></span><span><b>{statusLine(r, o.cur)}</b><span>{st.why}</span></span></div>
              {isSw ? <button className="cta or" onClick={openFlow}>Show problem<ArrowRight /></button> : null}
              {r.url ? <a className={"cta" + (isSw ? " gh" : "")} href={r.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Open on Google</a>
                : <button className={"cta" + (isSw ? " gh" : "")} onClick={() => setSheet(null)}>Close</button>}
            </>
          );
        })() : null}
      </div>

      <section className={"flow" + (flow ? " show" : "")} aria-hidden={!flow} onClick={(e) => { if (e.target === e.currentTarget) { setFlow(null); load(token); } }}>{FlowV()}</section>

      <div className={"toast" + (toast ? " show" : "") + (toast && toast.bad ? " bad" : "")} role="status">{toast && toast.bad ? <AlertCircle /> : <CheckCircle2 />}{toast ? toast.m : ""}</div>
    </div>
  );
}
