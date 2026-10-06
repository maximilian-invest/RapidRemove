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
  XCircle, AlertCircle, Cpu, Receipt, MessageCircle, FileText, ShieldCheck, LogOut, ChevronRight, ExternalLink, ScanFace, KeyRound, Eye, EyeOff, Info,
  BadgeCheck, Timer, Lock, CreditCard, Smartphone, Store, Copy,
} from "lucide-react";
import "@/styles/dashboard.css";
import PasskeyOffer, { PasskeyLoginButton } from "@/components/PasskeyOffer";
import CustApp, { injectAppManifest } from "./CustApp";
import SupportChat from "./Chat";
import PushGate, { pushState, enablePush } from "@/components/PushGate";
import { passkeySupported, passkeyOnDevice, passkeyDismissed, passkeyRegister, passkeyName, passkeyError } from "@/lib/passkey";
import { makeT, pickLang, localeOf } from "./dash-i18n";

const LANG_KEY = "rr_cust_lang";
/* Aktive Sprache (Modul-weit, wird pro Render gesetzt) → Format-Helfer ohne Prop-Drilling. */
let T = makeT("en"), LOC = "en-US", LANG = "en";
const setLang = (l) => { T = makeT(l); LOC = localeOf(l); LANG = l; };
const SEEN_KEY = "rr_cust_seen";
const seenGet = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch (e) { return []; } };
const seenAdd = (ids) => { try { localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenGet(), ...ids])].slice(-300))); } catch (e) { /* */ } };
const pkName = () => { const n = passkeyName(); return n === "fingerprint" ? T("nameFingerprint") : n === "passkey" ? T("namePasskey") : n; };

import { startTracking, stopTracking, track, view } from "./tracker";
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const KEY = "rr_cust_session";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";
const PAYPAL_ME = (process.env.NEXT_PUBLIC_PAYPAL_ME || "rapidmax1").replace(/^.*paypal\.me\//i, "").replace(/\/+$/, "");
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
const money = (v, cur) => { try { return new Intl.NumberFormat(LOC, { style: "currency", currency: cur === "usd" ? "USD" : "EUR", maximumFractionDigits: Number(v) % 1 ? 2 : 0 }).format(Number(v || 0)); } catch (e) { return (cur === "usd" ? "$" : "€") + Number(v || 0); } };
const shortDate = (iso) => { try { return new Date(iso).toLocaleDateString(LOC, { month: "short", day: "numeric" }); } catch (e) { return ""; } };
function dur(iso) {
  if (!iso) return "";
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return T("durM", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return T("durH", { n: h }) + (m % 60 ? " " + T("durM", { n: m % 60 }) : "");
  const d = Math.floor(h / 24);
  return T("durD", { n: d }) + (h % 24 ? " " + T("durH", { n: h % 24 }) : "");
}
function ago(iso) {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 2) return T("now");
  if (m < 60) return T("minAgo", { n: m });
  if (m < 24 * 60) return T("hAgo", { n: Math.round(m / 60) });
  if (m < 48 * 60) return T("yesterday");
  return shortDate(iso);
}
const initials = (name, email) => {
  const p = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (p.length) return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  return String(email || "?").slice(0, 2).toUpperCase();
};

/* ---- Status (intern → Kunde) ---- */
const ST_ = {
  new: { I: Search, ico: "in" }, working: { I: Loader, ico: "wk" }, removed: { I: CheckCircle2, ico: "ok" }, notpossible: { I: Ban, ico: "no" },
  software: { I: AlertCircle, ico: "pr" }, sw_accepted: { I: Cpu, ico: "wk" }, sw_declined: { I: XCircle, ico: "" }, cancelled: { I: XCircle, ico: "" },
};
const stOf = (status) => { const k = ST_[status] ? status : "new"; return { ...ST_[k], l: T("st_" + k), why: T("why_" + k) }; };
const OPEN = ["new", "working", "software", "sw_accepted"];
const statusLine = (r, cur) => stOf(r.status).l
  + (r.status === "working" && r.since ? " · " + dur(r.since) : "")
  + (r.status === "removed" ? (r.paid ? " · " + T("paidSuffix") : " · " + T("toPaySuffix", { amount: money(r.price, cur) })) : "");

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

/* Profil-Löschung: Symbol statt Fortschrittsring (grün = gelöscht, grau = storniert). */
function ProfRing({ st }) {
  return <div className={"ring prof p-" + st}><Store /></div>;
}
const isProf = (o) => o && o.kind === "profile" && o.profileOrder;
const profOpen = (o) => isProf(o) && (["new", "working"].includes(o.profileOrder.status) || o.profileOrder.open > 0);

/* ---- Login / Passwort vergessen ---- */
function Login({ onToken, notice }) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [forgot, setForgot] = React.useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setInfo(""); setBusy(true);
    try {
      if (forgot) { await call("reset", { email, lang: LANG }); setInfo(T("resetSent")); setForgot(false); }
      else { const r = await call("login", { email, password: pw }); onToken(r.token); }
    } catch (x) { setErr(x.code === "too_many" ? T("tooMany") : forgot ? T("genericErr") : T("wrongLogin")); }
    setBusy(false);
  };
  return (
    <div className="lg-wrap">
      <form className="lg" onSubmit={submit}>
        <div className="lg-art"><img src={IMG.rocket} alt="" /></div>
        <div>
          <h1>{forgot ? T("newPwTitle") : T("loginTitle")}</h1>
          <p>{forgot ? T("newPwSub") : T("loginSub")}</p>
        </div>
        <label className="fld"><span>{T("email")}</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </label>
        {!forgot ? (
          <label className="fld"><span>{T("password")}</span>
            <input type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
          </label>
        ) : null}
        {notice && !err && !info ? <div className="note bad">{notice}</div> : null}
        {err ? <div className="note bad">{err}</div> : null}
        {info ? <div className="note good">{info}</div> : null}
        <button className="cta" disabled={busy}>{busy ? <Loader className="spin" /> : null}{forgot ? T("sendNewPw") : T("login")}</button>
        {!forgot ? <PasskeyLoginButton role="customer" onToken={onToken} onError={setErr} T={T} /> : null}
        <button type="button" className="lnk" onClick={() => { setForgot(!forgot); setErr(""); setInfo(""); }}>{forgot ? T("backToLogin") : T("forgot")}</button>
        {!forgot ? <p className="lnk" style={{ height: "auto", fontSize: 14, fontWeight: 500, lineHeight: 1.45, marginTop: -6 }}>{T("firstTime")}</p> : null}
      </form>
    </div>
  );
}

/* ---- Neues Passwort festlegen (Link aus der Mail, einmalig, 60 Min.) ---- */
function SetPassword({ k, onToken, onCancel }) {
  const [ok, setOk] = React.useState(null); // null = prüfe, true = gültig, false = ungültig
  const [pw, setPw] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { call("reset-check", { k }).then(() => setOk(true)).catch(() => setOk(false)); }, [k]);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (pw.length < 8) { setErr(T("pwTooShort")); return; }
    setBusy(true);
    try { const r = await call("reset-confirm", { k, password: pw }); onToken(r.token); }
    catch (x) { if (x.code === "invalid") setOk(false); else setErr(x.code === "too_many" ? T("tooMany") : T("genericErr")); }
    setBusy(false);
  };
  return (
    <div className="lg-wrap">
      <form className="lg" onSubmit={submit}>
        <div className="lg-art"><img src={IMG.rocket} alt="" /></div>
        <div><h1>{T("setPwTitle")}</h1>{ok !== false ? <p>{T("setPwSub")}</p> : null}</div>
        {ok === null ? <Loader className="spin" /> : ok === false ? (
          <>
            <div className="note bad">{T("resetInvalid")}</div>
            <button type="button" className="cta" onClick={onCancel}>{T("backToLogin")}</button>
          </>
        ) : (
          <>
            <label className="fld"><span>{T("newPassword")}</span>
              <span style={{ position: "relative", display: "block" }}>
                <input type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: "100%", paddingRight: 52 }} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? T("hidePw") : T("showPw")} style={{ position: "absolute", right: 6, top: 6, width: 44, height: 44, display: "grid", placeItems: "center", color: "var(--g3)" }}>{show ? <EyeOff /> : <Eye />}</button>
              </span>
            </label>
            {err ? <div className="note bad">{err}</div> : null}
            <button className="cta" disabled={busy}>{busy ? <Loader className="spin" /> : null}{T("savePw")}</button>
            <button type="button" className="lnk" onClick={onCancel}>{T("backToLogin")}</button>
          </>
        )}
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
  const [magicErr, setMagicErr] = React.useState(false);
  const [resetK, setResetK] = React.useState("");
  const [gate, setGate] = React.useState(null); // Push noch nicht an → Vollbild-Aufforderung
  const [, tick] = React.useState(0);
  const prev = React.useRef(null);
  const toastT = React.useRef(0);
  const mainRef = React.useRef(null);
  const [imp, setImp] = React.useState(false); // Admin-Ansicht („Kundendashboard öffnen"): nichts tracken, keine Zahlungen
  const payOpen = React.useRef(null); // { at, label } → Rückkehr ohne Zahlung = „Zahlung abgebrochen"

  const showToast = React.useCallback((m, bad) => {
    setToast({ m, bad: !!bad }); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 3200);
  }, []);

  React.useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_HREF; document.head.appendChild(l);
    }
    // Persönlicher Link aus der Mail (?k=…) → direkt einloggen, Code aus der Adresse entfernen.
    let k = "", rk = "";
    try { const sp = new URLSearchParams(window.location.search); k = sp.get("k") || ""; rk = sp.get("reset") || ""; } catch (e) { /* */ }
    if (rk) { // Passwort-Link: Code aus der Adresse entfernen, Formular zeigen
      try { const u = new URL(window.location.href); u.searchParams.delete("reset"); window.history.replaceState(null, "", u.pathname + (u.search || "")); } catch (e) { /* */ }
      setResetK(rk);
    }
    // Admin-Ansicht: einmaliger Code (?imp=…) → eigene Sitzung NUR im Speicher (überschreibt keine echte Kunden-Sitzung)
    let ik = ""; try { ik = new URLSearchParams(window.location.search).get("imp") || ""; } catch (e) { /* */ }
    if (ik) {
      try { window.__NO_TRACK = true; const u = new URL(window.location.href); u.searchParams.delete("imp"); window.history.replaceState(null, "", u.pathname + (u.search || "")); } catch (e) { /* */ }
      setImp(true);
      call("impersonate", { k: ik }).then((r) => setToken(r.token)).catch(() => { setImp(false); window.__NO_TRACK = false; setMagicErr(true); setToken(store.get()); });
      return;
    }
    // Start aus der Home-Bildschirm-App: schon eingeloggt → Code nicht jedes Mal neu einlösen.
    let fromApp = false;
    try { fromApp = new URLSearchParams(window.location.search).get("app") === "1"; } catch (e) { /* */ }
    if (k && fromApp && store.get()) k = "";
    if (k) {
      try { const u = new URL(window.location.href); u.searchParams.delete("k"); window.history.replaceState(null, "", u.pathname + (u.search || "")); } catch (e) { /* */ }
      call("magic", { k }).then((r) => { store.set(r.token); setToken(r.token); })
        .catch(() => { setMagicErr(true); setToken(store.get()); });
    } else setToken(store.get());
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
        if (swOk) showToast(T("tPaymentSw"));
        else if (paid) showToast(T("tPaid"));
        // Dashboard-Aktivität: aus dem Zahlungs-Tab zurück, aber (noch) nicht bezahlt → abgebrochen
        const po = payOpen.current;
        if (po && (swOk || paid)) payOpen.current = null;
        else if (po && document.visibilityState === "visible" && Date.now() - po.at > 5000) {
          const sec = Math.round((Date.now() - po.at) / 1000);
          track("payment_abort", `${po.label} · nach ${sec < 120 ? sec + " s" : Math.round(sec / 60) + " Min."}`, { sec });
          payOpen.current = null;
        }
      }
      prev.current = d;
      setData(d); setLoadErr("");
    } catch (e) {
      if (e.code === "session") { store.set(""); setToken(""); setData(null); prev.current = null; }
      else setLoadErr(T("loadErr"));
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
  const [chatOpen, setChatOpen] = React.useState(false);
  const [wiseOpen, setWiseOpen] = React.useState(false);
  // Sprache: Bestellung (nach dem Login) → zuletzt genutzte → Browser → Englisch.
  const [lang, setLangState] = React.useState("en");
  React.useEffect(() => {
    let saved = ""; try { saved = localStorage.getItem(LANG_KEY) || ""; } catch (e) { /* */ }
    let q = ""; try { q = new URLSearchParams(window.location.search).get("lang") || ""; } catch (e) { /* */ }
    setLangState(pickLang(q, saved, navigator.language));
  }, []);
  React.useEffect(() => {
    if (!data || !data.lang) return;
    const l = pickLang(data.lang === "de" ? "de" : data.lang);
    setLangState(l); try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* */ }
  }, [data]);
  setLang(lang);
  React.useEffect(() => { try { document.documentElement.lang = lang; } catch (e) { /* */ } }, [lang]);
  const onToken = (t, viaPasskey) => {
    store.set(t); prev.current = null; setToken(t);
    // Nach dem Passwort-Login einmal Face ID anbieten.
    if (!viaPasskey && passkeySupported() && !passkeyOnDevice("customer") && !passkeyDismissed("customer")) setOfferPk(true);
  };
  const endAdminView = async () => {
    try { await call("logout", { token }); } catch (e) { /* egal */ }
    try { window.close(); } catch (e) { /* */ }
    setToken(""); setData(null); setImp(false); window.__NO_TRACK = false; setToken(store.get());
  };
  const logout = async () => {
    if (imp) { endAdminView(); return; }
    stopTracking();
    const t = token; store.set(""); setToken(""); setData(null); prev.current = null; setTab("home");
    try { await call("logout", { token: t }); } catch (e) { /* egal */ }
  };
  const goTab = (t) => { setTab(t); setDetailId(null); try { window.scrollTo(0, 0); if (mainRef.current) mainRef.current.scrollTop = 0; } catch (e) { /* */ } };
  // Tap auf einen Push (?order=RR-…) → direkt diese Bestellung öffnen; App-Badge = offene Entscheidungen.
  React.useEffect(() => {
    if (!data) return;
    try {
      const u = new URL(window.location.href);
      const oid = u.searchParams.get("order");
      if (oid) {
        if ((data.orders || []).some((o) => o.id === oid)) setDetailId(oid);
        u.searchParams.delete("order"); window.history.replaceState(null, "", u.pathname + (u.search || ""));
      }
    } catch (e) { /* */ }
    try {
      const n = (data.orders || []).reduce((s, o) => s + o.items.filter((i) => i.status === "software").length, 0);
      if (navigator.setAppBadge) (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {});
    } catch (e) { /* */ }
  }, [data]);
  // Dashboard-Aktivität: Sitzung starten, sobald die Daten da sind; Seitenaufrufe je Ansicht.
  React.useEffect(() => { if (token && data && !imp && !data.adminView) startTracking(token); }, [token, !!data, imp]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!token || !data || imp || data.adminView) return;
    const sh = sheet ? (data.orders || []).find((o) => o.id === sheet.orderId) : null;
    const it = sh ? sh.items.find((i) => i.key === sheet.key) : null;
    const name = flow ? `Spezial-Software · Schritt ${(flow.step || 0) + 1}`
      : sheet ? `Bewertung ansehen${it && (it.name || it.url) ? ": " + String(it.name || it.url).slice(0, 60) : ""}`
      : detailId ? `Bestellung ${detailId}`
      : ({ home: "Übersicht", orders: "Bestellungen", pay: "Zahlungen", acc: "Konto" })[tab] || tab;
    view(name, sheet ? sheet.orderId : detailId || undefined);
  }, [token, !!data, tab, detailId, sheet, flow && flow.step]); // eslint-disable-line react-hooks/exhaustive-deps
  // Push aufdrängen: nach dem Öffnen, solange nicht eingeschaltet („Nicht jetzt" gilt nur für diese Sitzung).
  const hasData = !!data;
  React.useEffect(() => {
    if (!token || !hasData || offerPk || imp) return;
    injectAppManifest(token, lang);
    let off = false;
    pushState("customer").then((st) => {
      if (off) return;
      if (st === "on") enablePush("customer", token, true).catch(() => {}); // Gerät am Server (neu) eintragen
      else if (["ask", "install", "blocked"].includes(st)) setGate(st);
    }).catch(() => {});
    return () => { off = true; };
  }, [token, hasData, offerPk]); // eslint-disable-line react-hooks/exhaustive-deps

  if (token === null) return <div className="rra" />;
  if (resetK) return <div className="rra"><SetPassword k={resetK} onCancel={() => { setResetK(""); store.set(""); setToken(""); }} onToken={(t) => { setResetK(""); onToken(t); showToast(T("pwSaved")); }} /></div>;
  if (!token) return <div className="rra"><Login onToken={onToken} notice={magicErr ? T("magicExpired") : ""} /></div>;
  if (offerPk) return <PasskeyOffer role="customer" token={token} onDone={(on) => { setOfferPk(false); if (on) showToast(T("pkIsOn", { name: pkName() })); }} T={T} />;
  if (gate && data) return <PushGate role="customer" token={token} state={gate} T={T} onDone={(on) => { setGate(null); if (on) showToast(T("pushOn")); }} />;
  if (!data) {
    return (
      <div className="rra"><div className="lg-wrap">
        {loadErr ? <div className="lg"><div className="note bad">{loadErr}</div><button className="cta" onClick={() => load(token)}>{T("tryAgain")}</button></div> : <Loader className="spin" />}
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
  // Kunde hat Wise (−10 %) gewählt → „Bezahlen" zeigt unsere Wise-Kontodaten statt Stripe.
  const wiseBank = (data.wiseBank || []).filter(Boolean);
  const viaWise = !!(wiseBank.length && dueOrders.some((o) => o.cur === payCur && o.payPref === "wise"));
  // PayPal (−10 %): PayPal.me-Link mit Betrag + Währung → Kunde sendet selbst (Freunde & Familie).
  const viaPaypal = !viaWise && dueOrders.some((o) => o.cur === payCur && o.payPref === "paypal");
  const wiseAmount = Math.round(toPay * 0.9);
  const ppUrl = `https://www.paypal.me/${PAYPAL_ME}/${wiseAmount}${String(payCur).toUpperCase()}`;
  const wiseRef = dueOrders.filter((o) => o.cur === payCur).map((o) => o.id).join(" ");
  const deposits = orders.flatMap((o) => (o.deposits || []).map((d) => ({ ...d, o })));
  const history = orders.flatMap((o) => (o.history || []).map((h) => ({ ...h, o }))).sort((a, b) => String(b.paid).localeCompare(String(a.paid)));

  const acts = [
    ...sw.map((r) => ({ k: "d" + r.id, I: AlertCircle, c: "pr", t: T("act_decision"), s: r, tm: r.changedAt ? ago(r.changedAt) : T("today"), at: Date.now() + 1 })),
    ...all.filter((r) => r.status === "working").map((r) => ({ k: "w" + r.id, I: Loader, c: "wk", t: T("act_working") + (r.since ? " · " + dur(r.since) : ""), s: r, tm: T("now"), at: Date.now() })),
    ...all.filter((r) => r.status === "sw_accepted").map((r) => ({ k: "a" + r.id, I: Cpu, c: "wk", t: T("act_specialist"), s: r, tm: ago(r.changedAt), at: r.changedAt ? new Date(r.changedAt).getTime() : 0 })),
    ...all.filter((r) => r.prevStatus && !["removed", "working"].includes(r.status)).map((r) => ({ k: "c" + r.id, I: Info, c: "in", t: T("statusChanged"), s: r, sub: `${stOf(r.prevStatus).l} → ${stOf(r.status).l}`, tm: ago(r.changedAt), at: r.changedAt ? new Date(r.changedAt).getTime() : 0 })),
    ...all.filter((r) => r.status === "removed").map((r) => ({ k: "r" + r.id, I: Check, c: "ok", t: T("act_removed"), s: r, tm: ago(r.removedAt), at: r.removedAt ? new Date(r.removedAt).getTime() : 0 })),
  ].sort((a, b) => b.at - a.at).slice(0, 6);

  // „Status geändert": letzte 14 Tage, noch nicht weggeklickt (je Gerät).
  const seen = new Set(seenGet());
  const changedNew = all.filter((r) => r.prevStatus && r.changedAt && Date.now() - new Date(r.changedAt).getTime() < 14 * 864e5 && !seen.has(r.id + "|" + r.changedAt));
  const ChangedCard = () => (changedNew.length ? (
    <div className="paycard" style={{ flexDirection: "column", alignItems: "stretch", gap: 10, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="ico in"><Info /></span>
        <span style={{ minWidth: 0 }}><b>{T("statusChanged")}</b><span style={{ fontSize: 13, color: "var(--g3)", display: "block" }}>{T("statusChangedSub", { n: changedNew.length })}</span></span>
      </div>
      {changedNew.slice(0, 4).map((r) => (
        <button key={r.id} className="ai-row" style={{ padding: "6px 0", borderTop: "1px solid var(--g2)" }} onClick={() => setSheet({ orderId: r.o.id, key: r.key })}>
          <span className="t"><b style={{ fontSize: 14 }}>{r.name || T("googleReview")} · {r.o.business}</b><span>{stOf(r.prevStatus).l} → <b style={{ display: "inline", color: "var(--ink)" }}>{stOf(r.status).l}</b></span></span>
          <ChevronRight />
        </button>
      ))}
      <button className="cta gh" style={{ height: 44, fontSize: 15 }} onClick={() => { seenAdd(changedNew.map((r) => r.id + "|" + r.changedAt)); tick((x) => x + 1); }}>{T("gotIt")}</button>
    </div>
  ) : null);

  /* ---- Zahlungen ---- */
  const checkout = async (path, body, label) => {
    if (busy) return null;
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return null; }
    setBusy(label);
    let w = null;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    try {
      const r = await call(path, { token, ...body });
      payOpen.current = { at: Date.now(), label: "Rechnung" };
      if (w && !w.closed) w.location.href = r.url; else window.location.href = r.url;
      setBusy("");
      return r.url;
    } catch (e) {
      if (w && !w.closed) w.close();
      showToast(e.code === "payment_unavailable" ? T("payUnavailable") : e.code === "nothing" ? T("nothingToPay") : T("genericErr"), true);
      load(token);
      setBusy("");
      return null;
    }
  };
  const payAll = async () => {
    if (viaWise || viaPaypal) { track("payment_open", `${viaWise ? "Wise" : "PayPal"} · ${wiseAmount} ${String(payCur).toUpperCase()}`, { via: viaWise ? "wise" : "paypal" }); setWiseOpen(true); return; }
    if (await checkout("pay", {}, "pay")) showToast(T("checkoutOpened"));
  };

  /* ---- Problem-Flow (Spezialist) ---- */
  const openFlow = () => {
    setSheet(null);
    const items = sw.map((r) => ({ id: r.id, orderId: r.o.id, key: r.key, name: r.name || T("googleReview"), text: r.text, business: r.o.business, cur: r.o.cur, price: r.o.swPrice, dep: r.o.swDeposit }));
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
      if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
      setBusy("flow");
      try { await call("software", { token, decision: "decline", items: flowRefs(des) }); setFlow({ ...f, step: 4, mode: "declined" }); load(token); }
      catch (e) { showToast(T("genericErr"), true); }
      setBusy("");
      return;
    }
    if (f.step === 3) { // nicht gewählte ablehnen, gewählte bezahlen
      if (busy) return;
      if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
      setBusy("flow");
      let w = null;
      try { w = window.open("", "_blank"); } catch (e) { w = null; }
      try {
        if (des.length) await call("software", { token, decision: "decline", items: flowRefs(des) });
        const r = await call("software", { token, decision: "accept", items: flowRefs(sel) });
        payOpen.current = { at: Date.now(), label: "Software-Vorauszahlung" };
        if (w && !w.closed) w.location.href = r.url; else window.location.href = r.url;
        setFlow({ ...f, step: 4, mode: "waiting", url: r.url, items: sel, pick: new Set(sel.map((i) => i.id)) });
        load(token);
      } catch (e) {
        if (w && !w.closed) w.close();
        showToast(e.code === "payment_unavailable" ? T("payUnavailable") : T("genericErr"), true);
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
      <div className="k">{T("toPay")}</div>
      <div className="v">{money(viaWise || viaPaypal ? wiseAmount : toPay, payCur)}</div>
      <div className="s">{viaWise || viaPaypal ? `${T(viaWise ? "wDisc" : "ppDisc")} · ${T("wInstead", { amount: money(toPay, payCur) })}` : payments || prices.length !== 1 ? T("removedCount", { n: due.length }) : T("removedEach", { n: due.length, price: money(prices[0], payCur) })}</div>
      <div className="row">
        {payments ? <span /> : <span className="rem"><i />{T("remaining", { n: remaining })}</span>}
        <button className="pill-btn" disabled={!!busy} onClick={payAll}>{busy === "pay" ? <Loader className="spin" /> : null}{payments ? T("payNow") : T("pay")}</button>
      </div>
    </div>
  ) : payments ? null : (
    <div className="hero ok">
      <span className="hero-img"><img src={IMG.rocket} alt="" /></span>
      <div className="k">{T("allPaid")}</div>
      <div className="v" style={{ fontSize: 30, letterSpacing: -1 }}>{T("due", { amount: money(0, payCur) })}</div>
      <div className="s">{remaining ? T("remainingInProgress", { n: remaining }) : T("nothingOpen")}</div>
    </div>
  ));
  const DepositCards = () => deposits.map((d) => (
    <div key={d.id} className="paycard due">
      <span className="ico pr"><Lock /></span>
      <span><b>{T("prepayTitle", { n: d.n || 1 })}</b><span>{d.o.business} · {T("prepaySub")}</span></span>
      <a className="mini" href={d.url} target="_blank" rel="noopener noreferrer"><Lock />{T("payAmount", { amount: money(d.amount, d.cur) })}</a>
    </div>
  ));

  /* ---- Screens ---- */
  const HomeV = () => (
    <>
      <div className="hhead">
        <div><h1>{firstName ? T("hi", { name: firstName }) : T("hiNoName")}</h1><p className="hsub">{all.length ? T("removedSoFar", { r: removedN, n: all.length }) : T("ordersCount", { n: orders.length })}</p></div>
        <span className="av">{ini}</span>
      </div>
      <div className="hg">
        <div className="hl">
          {sw.length ? <AlertBtn title={T("problemOrders", { n: swOrders })} sub={T("needDecision", { n: sw.length })} /> : null}
          <ChangedCard />
          <CustApp token={token} lang={LANG} T={T} showToast={showToast} />
          {all.length ? <Hero /> : null}
          {deposits.length ? <div style={{ marginBottom: 24 }}><DepositCards /></div> : null}
          <div className="sec" style={{ marginTop: 4 }}><h2>{T("yourOrders")}</h2>{orders.length ? <button onClick={() => goTab("orders")}>{T("seeAll")}</button> : null}</div>
          {orders.length ? (
            <div className="carousel">
              {orders.map((o) => {
                if (isProf(o)) {
                  const p = o.profileOrder;
                  return (
                    <button key={o.id} className="oc" onClick={() => setDetailId(o.id)}>
                      <ProfRing st={p.status} />
                      <span className="n">{o.business || T("orderN", { id: o.id })}</span>
                      <span className="m">{p.open > 0 ? <b>{T("pOpen", { amount: money(p.open, o.cur) })}</b> : T("pst_" + p.status)}</span>
                    </button>
                  );
                }
                const n = o.items.length, r = o.items.filter((x) => x.status === "removed").length;
                const act = o.items.some((x) => x.status === "software");
                return (
                  <button key={o.id} className="oc" onClick={() => setDetailId(o.id)}>
                    <Ring r={r} n={n} />
                    <span className="n">{o.business || T("orderN", { id: o.id })}</span>
                    <span className="m">{act ? <b>{T("actionNeeded")}</b> : T("inProgressN", { n: o.items.filter((x) => OPEN.includes(x.status)).length })}</span>
                  </button>
                );
              })}
            </div>
          ) : <div className="empty"><img src={IMG.rocket} alt="" />{T("noOrders")}</div>}
        </div>
        <aside className="hr">
          <div className="sec"><h2>{T("activity")}</h2></div>
          <div className="act">
            {acts.length ? acts.map((a) => (
              <button key={a.k} className="ai-row" onClick={() => setSheet({ orderId: a.s.o.id, key: a.s.key })}>
                <span className={"ico " + a.c}><a.I /></span>
                <span className="t"><b>{a.t}</b><span>{(a.sub ? a.sub + " · " : "") + (a.s.name || T("googleReview")) + " · " + a.s.o.business}</span></span>
                <span className="tm">{a.tm}</span>
              </button>
            )) : <div className="empty" style={{ padding: "16px 0" }}>{T("activityEmpty")}</div>}
          </div>
        </aside>
      </div>
    </>
  );

  const OrdersV = () => {
    const F = { all: () => true, open: (o) => (isProf(o) ? profOpen(o) : o.items.some((x) => OPEN.includes(x.status))), done: (o) => (isProf(o) ? !profOpen(o) : !o.items.some((x) => OPEN.includes(x.status))) };
    const l = orders.filter(F[ofilter]);
    return (
      <>
        <div className="ttl">{T("orders")}</div>
        <div className="chips">
          {[["all", T("f_all")], ["open", T("f_open")], ["done", T("f_done")]].map(([k, t]) => (
            <button key={k} className={"chip" + (ofilter === k ? " on" : "")} onClick={() => setOfilter(k)}>{t}</button>
          ))}
        </div>
        {l.length ? l.map((o) => {
          if (isProf(o)) {
            const p = o.profileOrder;
            return (
              <button key={o.id} className="orow" onClick={() => setDetailId(o.id)}>
                <ProfRing st={p.status} />
                <span className="t">
                  <b>{o.business || T("orderN", { id: o.id })}</b>
                  <span>{T("svc_" + p.service) !== "svc_" + p.service ? T("svc_" + p.service) : T("pTag")} · #{o.id} · {shortDate(o.created)}</span>
                  {p.open > 0 ? <><br /><span className="tag pr"><AlertCircle />{T("pOpen", { amount: money(p.open, o.cur) })}</span></> : null}
                </span>
                <ChevronRight />
              </button>
            );
          }
          const n = o.items.length, r = o.items.filter((x) => x.status === "removed").length, act = o.items.some((x) => x.status === "software");
          return (
            <button key={o.id} className="orow" onClick={() => setDetailId(o.id)}>
              <Ring r={r} n={n} />
              <span className="t">
                <b>{o.business || T("orderN", { id: o.id })}</b>
                <span>#{o.id} · {shortDate(o.created)}</span>
                {act ? <><br /><span className="tag pr"><AlertCircle />{T("actionNeeded")}</span></> : null}
              </span>
              <ChevronRight />
            </button>
          );
        }) : <div className="empty">{T("noOrdersHere")}</div>}
      </>
    );
  };

  const PayV = () => (
    <>
      <div className="ttl">{T("payments")}</div>
      <Hero payments />
      <DepositCards />
      <div className="sec" style={{ marginTop: due.length || deposits.length ? 8 : 0 }}><h2>{T("history")}</h2></div>
      {history.length ? history.map((h) => (
        <div key={h.id} className="paycard">
          <span className="ico"><Receipt /></span>
          <span>
            <b>{h.kind === "profile" ? (isProf(h.o) && T("svc_" + h.o.profileOrder.service) !== "svc_" + h.o.profileOrder.service ? T("svc_" + h.o.profileOrder.service) : T("pTag")) : h.kind === "software" ? T("h_software") : h.kind === "deposit" ? T("h_deposit") : T("h_invoice")}{h.n > 1 ? " · " + T("hReviews", { n: h.n }) : ""}</b>
            <span>{(h.names.length ? h.names.join(", ") : h.o.business) + " · " + shortDate(h.paid)}</span>
          </span>
          <span className="amt">{money(h.amount, h.cur)}</span>
        </div>
      )) : <div className="empty"><img src={IMG.wallet} alt="" />{T("noPayments")}</div>}
    </>
  );

  const AccV = () => (
    <>
      <div className="ttl">{T("account")}</div>
      <div className="paycard"><span className="av">{ini}</span><span><b>{data.name || data.email}</b><span>{data.email}</span></span></div>
      <div className="acc-rows">
        {passkeySupported() ? (
          <button className="ai-row" onClick={async () => {
            if (passkeyOnDevice("customer")) { showToast(T("pkAlready", { name: pkName() })); return; }
            try { await passkeyRegister("customer", token); showToast(T("pkIsOn", { name: pkName() })); } catch (e) { const m = passkeyError(e, T); if (m) showToast(m, true); }
          }}><span className="ico"><ScanFace /></span><span className="t"><b>{T("pkLogin", { name: pkName() })}</b><span>{passkeyOnDevice("customer") ? T("pkOn") : T("pkOff")}</span></span><ChevronRight /></button>
        ) : null}
        <button className="ai-row" onClick={async () => {
          try { await call("password-link", { token, lang: LANG }); showToast(T("linkSent")); } catch (e) { showToast(e.code === "too_many" ? T("tooMany") : T("genericErr"), true); }
        }}><span className="ico"><KeyRound /></span><span className="t"><b>{T("changePw")}</b><span>{T("changePwSub")}</span></span><ChevronRight /></button>
        <button className="ai-row" onClick={() => setChatOpen(true)}><span className="ico"><MessageCircle /></span><span className="t"><b>{T("help")}</b><span>{T("helpSub")}</span></span><ChevronRight /></button>
        <button className="ai-row" onClick={() => goTab("pay")}><span className="ico"><FileText /></span><span className="t"><b>{T("invoices")}</b><span>{T("invoicesSub")}</span></span><ChevronRight /></button>
        <a className="ai-row" href="/en/privacy-policy" target="_blank" rel="noopener noreferrer"><span className="ico"><ShieldCheck /></span><span className="t"><b>{T("privacy")}</b></span><ChevronRight /></a>
        <button className="ai-row" onClick={logout}><span className="ico"><LogOut /></span><span className="t"><b>{T("logout")}</b></span><ChevronRight /></button>
      </div>
    </>
  );

  const detail = detailId ? orders.find((o) => o.id === detailId) : null;
  const DetailV = () => {
    const o = detail; if (!o) return null;
    if (isProf(o)) {
      const p = o.profileOrder;
      const rank = p.status === "cancelled" ? -1 : p.paid ? 4 : p.status === "removed" ? 3 : p.status === "working" ? 1 : 0;
      const svc = T("svc_" + p.service) !== "svc_" + p.service ? T("svc_" + p.service) : T("pTag");
      return (
        <>
          <button className="back" onClick={() => setDetailId(null)} aria-label="Close"><ArrowLeft className="li" /><X className="xi" /></button>
          <div className="dh"><h1>{o.business || T("orderN", { id: o.id })}</h1><p>{svc} · #{o.id} · {T("ordered", { date: shortDate(o.created) })}</p></div>
          <div className="bigprog"><ProfRing st={p.status} /><span><b>{T("pst_" + p.status)}</b><span>{p.paid ? T("pPaid") : p.open > 0 ? T("pOpen", { amount: money(p.open, o.cur) }) : p.addr || ""}</span></span></div>
          {p.open > 0 ? <div className="paycard due pwrap" style={{ marginBottom: 18 }}><span className="ico pr"><Wallet /></span><span><b>{T("pOpen", { amount: money(p.open, o.cur) })}</b><span>{T("pPayNote")}</span></span></div> : null}
          {rank >= 0 ? (
            <div className="psteps">
              {[T("pStep1"), T("pStep2"), T("pStep3"), T("pStep4")].map((lb, i) => (
                <div key={i} className={"pstep" + (i < rank || (i === 3 && p.paid) ? " done" : i === rank ? " cur" : "")}><i>{i < rank || (i === 3 && p.paid) ? <Check /> : null}</i><b>{lb}</b></div>
              ))}
            </div>
          ) : null}
          <div className="sec" style={{ marginTop: 18 }}><h2>{T("pAmount")}</h2></div>
          <div className="paycard"><span className="ico"><Receipt /></span><span><b>{svc}</b><span>{p.protection ? T("pProt_" + p.protection) : "#" + o.id}</span></span><span className="amt">{money(p.amount, o.cur)}</span></div>
        </>
      );
    }
    const n = o.items.length, r = o.items.filter((x) => x.status === "removed").length;
    const op = o.items.filter((x) => OPEN.includes(x.status)).length, s = o.items.filter((x) => x.status === "software").length;
    return (
      <>
        <button className="back" onClick={() => setDetailId(null)} aria-label="Close"><ArrowLeft className="li" /><X className="xi" /></button>
        <div className="dh"><h1>{o.business || T("orderN", { id: o.id })}</h1><p>#{o.id} · {T("ordered", { date: shortDate(o.created) })}</p></div>
        <div className="bigprog"><Ring r={r} n={n} /><span><b>{T("removedOf", { r, n })}</b><span>{op ? T("stillInProgress", { n: op }) : o.cancelled ? T("cancelled") : T("completed")}</span></span></div>
        {s ? <div style={{ marginBottom: 18 }}><AlertBtn title={T("needYou", { n: s })} sub={T("tapToSee")} /></div> : null}
        <div className="sec"><h2>{T("reviews")}</h2></div>
        {o.items.map((x) => {
          const st = stOf(x.status);
          return (
            <button key={x.key} className="rrow" onClick={() => setSheet({ orderId: o.id, key: x.key })}>
              <span className={"ico " + st.ico}><st.I /></span>
              <span className="t">
                <span className="a">{x.name || T("googleReview")}</span>
                <span className={"x" + (x.text ? "" : " none")}>{x.text || T("noText")}</span>
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
    let body = null, btn = T("cont"), cls = "";
    if (S === 0) body = (
      <>
        <div className="fl-art"><img src={IMG.shield} alt="" /></div>
        <div className="fl-k">{T("f0k")}</div>
        <h2>{T("f0h", { n: it.length })}</h2>
        <p>{T("f0p1")}</p>
        <p className="strong">{T("f0p2")}</p>
      </>
    );
    if (S === 1) body = (
      <>
        <div className="fl-k">{T("f1k")}</div>
        <h2>{T("f1h", { n: it.length })}</h2>
        <p>{T("f1p")}</p>
        <div className="fl-feat">
          <div className="ff"><span className="ico"><BadgeCheck /></span><span><b>{T("feat1t")}</b><span>{T("feat1s")}</span></span></div>
          <div className="ff"><span className="ico"><Receipt /></span><span><b>{T("feat2t")}</b><span>{T("feat2s")}</span></span></div>
          <div className="ff"><span className="ico"><ShieldCheck /></span><span><b>{T("feat3t")}</b><span>{T("feat3s")}</span></span></div>
          <div className="ff"><span className="ico"><Timer /></span><span><b>{T("feat4t")}</b><span>{T("feat4s")}</span></span></div>
        </div>
        <div className="optc">
          <div className="oc2 hl"><div className="h"><b>{T("optSw")}</b><span className="p">{money(unit, cur)}</span></div><span>{T("optSwSub")}</span></div>
          <div className="oc2"><div className="h"><b>{T("optNo")}</b><span className="p">{money(0, cur)}</span></div><span>{T("optNoSub")}</span></div>
        </div>
      </>
    );
    if (S === 2) {
      body = (
        <>
          <div className="fl-k">{T("f2k")}</div>
          <h2>{T("f2h")}</h2>
          <p>{T("f2p")}</p>
          <div className="pick">
            {it.map((i) => (
              <button key={i.id} className={"pk" + (f.pick.has(i.id) ? " on" : "")} onClick={() => { const p = new Set(f.pick); p.has(i.id) ? p.delete(i.id) : p.add(i.id); setFlow({ ...f, pick: p }); }}>
                <span className="tog"><Check /></span>
                <span className="t"><b>{i.name}</b><span>{i.business}{i.text ? " · “" + i.text + "”" : ""}</span></span>
                <span className="p">{money(i.price, i.cur)}</span>
              </button>
            ))}
          </div>
          <div className="totl"><span>{T("total")}</span><b>{money(full, cur)}</b></div>
          
        </>
      );
      btn = n ? T("contPay") : T("declineAll", { amount: money(0, cur) });
    }
    if (S === 3) {
      body = (
        <>
          <div className="fl-k">{T("f3k")}</div>
          <h2>{T("f3h", { amount: money(dep, cur) })}</h2>
          <p>{T("f3p", { n })}{it.length - n ? " · " + T("declinedN", { n: it.length - n }) : ""}</p>
          <div className="pms">
            <div className="pm"><span className="ico"><CreditCard /></span>{T("card")}<CheckCircle2 className="ok" /></div>
            <div className="pm"><span className="ico"><Smartphone /></span>Apple Pay · Google Pay<CheckCircle2 className="ok" /></div>
          </div>
          <div className="totl"><span>{T("totalToday")}</span><b>{money(dep, cur)}</b></div>
          <div className="secure"><Lock />{T("secure")}</div>
        </>
      );
      btn = T("payBtn", { amount: money(dep, cur) }); cls = "or";
    }
    if (S === 4) {
      const paid = f.mode === "paid", waiting = f.mode === "waiting";
      body = (
        <>
          <div className="fl-art"><img src={IMG.rocket} alt="" /></div>
          <h2>{f.mode === "declined" ? T("f4hDeclined") : paid ? T("f4hPaid") : T("f4hWait")}</h2>
          <p>{f.mode === "declined" ? T("f4pDeclined") : paid ? T("f4pPaid", { amount: money(dep, cur), n }) : T("f4pWait")}</p>
          {waiting && f.url ? <a className="fl-again" href={f.url} target="_blank" rel="noopener noreferrer">{T("openAgain")}</a> : null}
        </>
      );
      btn = T("done");
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

  const TABS = [["home", Home, T("tabHome")], ["orders", List, T("tabOrders")], ["pay", Wallet, T("tabPay")], ["acc", User, T("tabAcc")]];
  const adminView = imp || (data && data.adminView);
  return (
    <div className={"rra" + (adminView ? " impv" : "")}>
      {adminView ? <div className="impbar"><span><b>Admin-Ansicht</b> · {data.name || data.email} · nicht getrackt</span><button type="button" onClick={endAdminView}>Beenden</button></div> : null}
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
          const { o, r } = sheetData; const st = stOf(r.status); const isSw = r.status === "software";
          return (
            <>
              <div className="grab" />
              <h3>{r.name || T("googleReview")}</h3>
              <div className="meta">{o.business} · #{o.id}</div>
              <div className="q">{r.text ? "“" + r.text + "”" : <i>{T("noText")}</i>}</div>
              <div className="why"><span className={"ico " + st.ico}><st.I /></span><span><b>{statusLine(r, o.cur)}</b><span>{st.why}</span></span></div>
              {isSw ? <button className="cta or" onClick={openFlow}>{T("showProblem")}<ArrowRight /></button> : null}
              {r.url ? <a className={"cta" + (isSw ? " gh" : "")} href={r.url} target="_blank" rel="noopener noreferrer"><ExternalLink />{T("openGoogle")}</a>
                : <button className={"cta" + (isSw ? " gh" : "")} onClick={() => setSheet(null)}>{T("close")}</button>}
            </>
          );
        })() : null}
      </div>

      <section className={"flow" + (flow ? " show" : "")} aria-hidden={!flow} onClick={(e) => { if (e.target === e.currentTarget) { setFlow(null); load(token); } }}>{FlowV()}</section>

      <div className={"bg" + (wiseOpen ? " show" : "")} onClick={() => setWiseOpen(false)} />
      <div className={"rv-sheet wsheet" + (wiseOpen ? " show" : "")} aria-hidden={!wiseOpen}>
        {wiseOpen ? (() => {
          const copy = (v) => { try { navigator.clipboard.writeText(v); showToast(T("wCopied")); } catch (e) { /* */ } };
          const rows = wiseBank.map((l) => { const i = l.indexOf(":"); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ["", l]; });
          if (viaPaypal) return (
            <>
              <div className="grab" />
              <h3>{T("ppTitle")}</h3>
              <div className="meta">{T("ppSub")}</div>
              <div className="wbig"><span>{T("wAmount")}</span><b>{money(wiseAmount, payCur)}</b></div>
              <div className="wrow hl"><span><small>{T("ppRef")}</small><b>{wiseRef}</b></span><button type="button" onClick={() => copy(wiseRef)} aria-label={T("wCopy")}><Copy /></button></div>
              <div className="wff"><AlertCircle />{T("ppFF")}</div>
              <a className="cta pp" href={ppUrl} target="_blank" rel="noopener noreferrer" data-track="PayPal öffnen"><ExternalLink />{T("ppBtn", { amount: money(wiseAmount, payCur) })}</a>
              <p className="wnote">{T("ppNote")}</p>
            </>
          );
          return (
            <>
              <div className="grab" />
              <h3>{T("wTitle")}</h3>
              <div className="meta">{T("wSub")}</div>
              <div className="wbig"><span>{T("wAmount")}</span><b>{money(wiseAmount, payCur)}</b><button type="button" onClick={() => copy(String(wiseAmount))} aria-label={T("wCopy")}><Copy /></button></div>
              <div className="sec" style={{ marginTop: 14 }}><h2 style={{ fontSize: 17 }}>{T("wAcct")}</h2></div>
              {rows.map(([k, v], i) => (
                <div key={i} className="wrow"><span>{k ? <small>{k}</small> : null}<b>{v}</b></span><button type="button" onClick={() => copy(v)} aria-label={T("wCopy")}><Copy /></button></div>
              ))}
              <a className="cta" style={{ marginTop: 16 }} href="https://wise.com/send" target="_blank" rel="noopener noreferrer"><ExternalLink />{T("wOpen")}</a>
              <p className="wnote">{T("wNote")}</p>
            </>
          );
        })() : null}
      </div>

      <SupportChat token={token} T={T} lang={LANG} imp={!!adminView} showToast={showToast} open={chatOpen} setOpen={setChatOpen} hidden={wiseOpen || !!sheetData || !!flow}
        sit={{ orders: orders.length, open: all.filter((r) => ["new", "working", "sw_accepted"].includes(r.status)).length, sw: sw.length, due: due.length, deposit: deposits.length, notpossible: all.some((r) => r.status === "notpossible") }} />

      <div className={"toast" + (toast ? " show" : "") + (toast && toast.bad ? " bad" : "")} role="status">{toast && toast.bad ? <AlertCircle /> : <CheckCircle2 />}{toast ? toast.m : ""}</div>
    </div>
  );
}
