"use client";
/* Kunden-App „My reviews" (rapid-remove.com/my-reviews) — vorerst NUR Einzelbewertungen.
   Design: Claude-Design-Handoff „Customer App" (Uber/Revolut-Stil; Mobil mit Tab-Leiste,
   Desktop mit Sidebar). Daten: ops /cust/me (Status live vom Partner-Board).
   Aktionen: /cust/software (Spezialisten-Löschung: Anzahlung zahlen oder ablehnen) und
   /cust/pay (alle gelöschten, unbezahlten Bewertungen). Bezahlt wird im Stripe-Checkout
   (neuer Tab); beim Zurückkommen lädt die App neu und zeigt den bezahlten Stand.
   Wortwahl laut Handoff: externer Spezialist — nie „unsere Software". */
import React from "react";
import useAutoUpdate from "@/lib/useAutoUpdate";
import useLive from "@/lib/useLive";
import {
  Home, List, Wallet, User, AlertTriangle, ArrowRight, ArrowLeft, X, Check, CheckCircle2, Search, Loader, Ban,
  XCircle, AlertCircle, Cpu, Receipt, MessageCircle, FileText, ShieldCheck, LogOut, ChevronRight, ExternalLink, ScanFace, KeyRound, Eye, EyeOff, Info,
  BadgeCheck, Timer, Lock, CreditCard, Smartphone, Store, Copy, Upload, Building2, Plus, Star, ListChecks, MapPin,
} from "lucide-react";
import { searchProfiles } from "@/lib/places";
import { AGB_CONSENT, FAGG_CONSENT } from "@/lib/consents";
import { pagePath } from "@/lib/page-routes";
import { reviewQuote } from "@/lib/pricing";
import "@/styles/dashboard.css";
import PasskeyOffer, { PasskeyLoginButton } from "@/components/PasskeyOffer";
import CustApp, { injectAppManifest } from "./CustApp";
import SupportChat from "./Chat";
import PolicyConsent, { POLICY_V } from "@/components/PolicyConsent";
import PaySheet from "./PaySheet";
import Celebrate, { CountUp } from "./Celebrate";
import useSwipeClose from "./useSwipeClose";
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

/* EU-Länder außer Österreich: Reverse Charge nur mit gültiger UID (sonst 20 % österr. USt im Preis). */
const EU_RC = ["BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"];
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
  reasons: { I: ListChecks, ico: "pr" }, verify: { I: ShieldCheck, ico: "pr" }, paygate: { I: CreditCard, ico: "pr" }, software: { I: AlertCircle, ico: "pr" }, sw_accepted: { I: Cpu, ico: "wk" }, sw_declined: { I: XCircle, ico: "" }, cancelled: { I: XCircle, ico: "" },
};
// pre = Software-Fall, dem der Kunde schon bei der Bestellung zugestimmt hat → Partner hat bestätigt, jetzt nur noch zahlen.
const stOf = (status, pre) => { const k = ST_[status] ? status : "new"; const p = k === "software" && pre; return { ...ST_[k], l: T(p ? "st_swpay" : "st_" + k), why: T(p ? "why_swpay" : "why_" + k) }; };
const OPEN = ["new", "reasons", "verify", "paygate", "working", "software", "sw_accepted"];
const statusLine = (r, cur) => stOf(r.status, r.pre).l
  + (r.status === "working" && r.since ? " · " + dur(r.since) : "")
  + (r.status === "removed" && !r.waived ? (r.paid ? " · " + T("paidSuffix") : " · " + T("toPaySuffix", { amount: money(r.price, cur) })) : "");

function Ring({ r, n }) {
  const R = 24, p = n ? r / n : 0;
  return (
    <div className="ring">
      <svg viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={R} fill="none" stroke="#e2e2e2" strokeWidth="6" />
        {p ? <circle className="rg" cx="28" cy="28" r={R} fill="none" stroke={p === 1 ? "var(--success)" : "#111"} strokeWidth="6" strokeLinecap="round" pathLength="100" strokeDasharray={`${Math.max(0.01, p * 100)} 100`} style={{ "--p": p * 100 }} /> : null}
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
/* Alles, was schon gelöscht ist (für den Erfolgs-Moment): Bewertungen + Profil-Löschungen. */
const removedKeys = (d) => d.orders.flatMap((o) => (isProf(o)
  ? (o.profileOrder.status === "removed" ? [{ k: o.id + "#p", at: o.profileOrder.doneAt, biz: o.business, prof: true }] : [])
  : o.items.filter((i) => i.status === "removed").map((i) => ({ k: o.id + ":" + i.key, at: i.removedAt, biz: o.business }))));

/* ---- Login / Passwort vergessen ---- */
function Login({ onToken, notice }) {
  // Direkt nach einer Bestellung (bestehendes Konto): E-Mail aus dem Bestellformular vorbefüllen (nur in diesem Tab gemerkt).
  const [email, setEmail] = React.useState(() => { try { return sessionStorage.getItem("rr_login_email") || ""; } catch (e) { return ""; } });
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
        {notice && !err && !info ? <div className={"note" + (notice === T("orderLogin") ? "" : " bad")}>{notice}</div> : null}
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
/* Countdown bis zum Fristende (bestätigter Software-Fall). Danach 0:00:00 + Hinweis „Platz kann jederzeit vergeben werden". */
function Countdown({ to }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(iv); }, []);
  const left = Math.max(0, to - now);
  const h = Math.floor(left / 3600e3), m = Math.floor((left % 3600e3) / 60e3), sec = Math.floor((left % 60e3) / 1000);
  const pad = (x) => String(x).padStart(2, "0");
  return (
    <div className={"cdn" + (left ? "" : " over")}>
      <span className="cdn-l">{T("swLeft")}</span>
      <b className="cdn-t">{h}:{pad(m)}:{pad(sec)}</b>
      {left ? null : <span className="cdn-o">{T("swOver")}</span>}
    </div>
  );
}

/* Inhaber-Nachweis (4–5-Sterne-Bewertungen beauftragt): Kunde lädt ein Dokument hoch → KI prüft sofort →
   passt es, startet der Auftrag ganz normal. Gleicher Aufbau wie der Software-Zahlungsschritt (Vollbild am Handy, Pop-up am Desktop). */
const vNeeds = (o) => !!(o && o.verify && o.verify.status !== "ok");
const pgNeeds = (o) => !!(o && o.payGate); // Auftrag startet erst mit hinterlegter Zahlungsart
// Reihenfolge für den Kunden: 1) Zahlungsart, 2) Inhaber-Nachweis. Solange die Zahlungsart fehlt, kommt der Nachweis noch nicht dran.
const vReady = (o, autopay) => vNeeds(o) && (!pgNeeds(o) || !!autopay); // (alt) – seit 10/2026 läuft alles über den Start-Ablauf
// Nur die 4–5-Sterne-Bewertungen warten auf den Nachweis (verify.keys); ohne keys (ältere Aufträge) alle.
const vWaits = (o, key) => vNeeds(o) && (!Array.isArray(o.verify.keys) || o.verify.keys.includes(key));
const vCount = (o) => (Array.isArray(o.verify && o.verify.keys) ? o.verify.keys.length : (o.items || []).length);
async function fileToUpload(file) {
  const asData = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(blob); });
  if (file.type === "application/pdf") return { mime: "application/pdf", data: await asData(file), size: file.size };
  // Fotos: verkleinern (max. 2200 px) und als JPEG schicken – kleiner, schneller und auch HEIC vom iPhone wird lesbar.
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 2200 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", 0.85);
    return { mime: "image/jpeg", data, size: Math.round(data.length * 0.75) };
  } finally { URL.revokeObjectURL(url); }
}
/* Inhaber-Nachweis als Schritt im Start-Ablauf (Inhalt + Fußleiste). ok/manuell → „Weiter"; sonst Upload + „Später hochladen". */
function VerifyPane({ order, token, imp, onDone, onNext, showToast, kicker, back, runNote = true }) {
  const [up, setUp] = React.useState(false);
  const [res, setRes] = React.useState(null); // Antwort des letzten Uploads in dieser Sitzung
  const fileRef = React.useRef(null);
  React.useEffect(() => { setRes(null); setUp(false); }, [order && order.id]);
  const v = (order && order.verify) || {};
  const ph = up || v.status === "checking" ? "checking" : res ? (res.manual ? "manual" : res.status) : v.status === "rejected" ? "rejected" : v.status === "ok" ? "ok" : v.uploaded ? "manual" : "";
  const reason = (res && res.reason) || v.reason || "";
  const waitIt = order ? order.items.filter((i) => vWaits(order, i.key) && !["removed", "cancelled"].includes(i.status)) : [];
  const others = order ? order.items.filter((i) => !vWaits(order, i.key) && i.status !== "cancelled").length : 0;
  const pick = () => { if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; } if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); } };
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f || !order) return;
    if (!/^image\//.test(f.type) && f.type !== "application/pdf") { showToast(T("vType"), true); return; }
    if (f.size > 25 * 1024 * 1024) { showToast(T("vBig"), true); return; }
    setUp(true);
    try {
      const u = await fileToUpload(f).catch(() => null);
      if (!u) { showToast(T("vType"), true); setUp(false); return; }
      if (u.size > 10 * 1024 * 1024) { showToast(T("vBig"), true); setUp(false); return; }
      const r = await call("verify-upload", { token, orderId: order.id, mime: u.mime, data: u.data });
      setRes(r);
      track("verify_upload", `${order.id} · ${r.status}`, { status: r.status });
      onDone();
    } catch (err) {
      showToast(err.code === "too_many" ? T("vMany") : err.code === "size" ? T("vBig") : err.code === "type" ? T("vType") : T("genericErr"), true);
    }
    setUp(false);
  };
  let body = null, btn = null, later = false;
  if (ph === "checking") body = (
    <div className="vf-chk"><Loader className="spin" /><h2>{T("vChk")}</h2><p>{T("vChkP")}</p></div>
  );
  else if (ph === "ok") { body = (<><div className="fl-art"><img src={IMG.rocket} alt="" /></div><h2>{T("vOkH")}</h2><p>{T("vOkP")}</p></>); btn = <button className="cta" onClick={onNext}>{T("vNext")}<ArrowRight /></button>; }
  else if (ph === "manual") { body = (<><div className="fl-art"><img src={IMG.shield} alt="" /></div><h2>{T("vManH")}</h2><p>{T("vManP")}</p></>); btn = <button className="cta" onClick={onNext}>{T("vNext")}<ArrowRight /></button>; }
  else {
    body = (
      <>
        {ph === "rejected" ? null : <div className="fl-art sf-art"><img src={IMG.shield} alt="" /></div>}
        <div className="fl-k">{kicker || T("vK")}</div>
        <h2>{ph === "rejected" ? T("vNoH") : T("vH", { biz: order ? order.business || "" : "" })}</h2>
        {ph === "rejected" ? <div className="note bad vf-why">{reason || T("vNoP")}</div> : <p>{T("vP")}</p>}
        {waitIt.length && others ? (
          <div className="vf-which">
            <div className="fl-k">{T("vFor", { n: waitIt.length })}</div>
            {waitIt.map((i) => <div key={i.key} className="vf-rv"><b>{i.name || "Google"}</b>{i.rating ? <span className="st">{"★".repeat(Math.min(5, i.rating))}</span> : null}</div>)}
            {runNote ? <p className="vf-run">{T("vRun", { n: others })}</p> : null}
          </div>
        ) : null}
        <div className="fl-k vf-dk">{T("vDocs")}</div>
        <div className="fl-feat vf-docs">
          <div className="ff"><span className="ico"><Building2 /></span><span><b>{T("vD1")}</b></span></div>
          <div className="ff"><span className="ico"><Receipt /></span><span><b>{T("vD2")}</b></span></div>
          <div className="ff"><span className="ico"><Store /></span><span><b>{T("vD3")}</b></span></div>
        </div>
        <div className="secure"><Lock />{T("vSafe")}</div>
      </>
    );
    btn = <button className="cta" onClick={pick}><Upload />{ph === "rejected" ? T("vAgain") : T("vUp")}</button>;
    later = true;
  }
  return (
    <>
      <div className="fl-body vf">{body}</div>
      {btn ? (
        <div className="fl-foot sf-foot">
          <div className="sf-row">{back}{btn}</div>
          {later ? <button className="pg-later" disabled={up} onClick={onNext}>{T("vLater")}</button> : null}
        </div>
      ) : null}
      <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={onFile} />
    </>
  );
}

/* Auftrag starten (10/2026): EIN Ablauf statt einzelner Fenster – im Design des Software-Flows (Vollbild am Handy, Pop-up am Desktop).
   1) Gründe: je Bewertung ein Bildschirm, Grund antippen (springt automatisch weiter), „Anderer Grund" mit kurzem Text
   2) Kurzer Check aller Gründe + Bestätigung (Checkbox inkl. Freistellung AGB 3.4) → /cust/reasons
   3) Inhaber-Nachweis (nur bei 4–5 ★)  4) Zahlungsart (Stripe; nur wenn noch keine hinterlegt) – sonst „Fertig – wir starten".
   Die Schritte werden beim Öffnen festgelegt; jeder Schritt zeigt den Live-Stand des Auftrags. */
const R_MAIN = ["fake", "conflict", "false", "insult", "offtopic"];
const R_MORE = ["hate", "personal", "offensive", "impersonation"];
const rsKeys = (o) => (o && !o.cancelled && o.reasons && Array.isArray(o.reasons.keys) ? o.reasons.keys : []);
const rsNeeds = (o) => rsKeys(o).length > 0;
const vOpen = (o) => vNeeds(o) && o.verify.status !== "checking" && !(o.verify.status === "pending" && o.verify.uploaded);
const startPhases = (o, autopay) => (o && !o.cancelled ? [...(rsNeeds(o) ? ["r"] : []), ...(vOpen(o) ? ["v"] : []), ...(pgNeeds(o) && !autopay ? ["p"] : [])] : []);
function Stars({ n }) {
  if (!n) return null;
  return <span className="stars" aria-label={n + " stars"}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < n ? "f" : ""} />)}</span>;
}
function StartFlow({ order, autopay, token, imp, showToast, onClose, reload, apStart, apBusy, zero }) {
  const [seq, setSeq] = React.useState(null); // [{ k: intro|r|sum|v|p|done, ph, item? }]
  const [ix, setIx] = React.useState(0);
  const [ans, setAns] = React.useState({}); // key → { r, note }
  const [more, setMore] = React.useState(false);
  const [pol, setPol] = React.useState(false);
  const [polErr, setPolErr] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [warn, setWarn] = React.useState(false); // „Später" bei der Zahlungsart → erst Hinweis (wir starten erst danach, null Risiko)
  const adv = React.useRef(0);
  const oid = order && order.id;
  React.useEffect(() => {
    if (!oid) { setSeq(null); return; }
    if (seq && seq.oid === oid) return;
    const phs = startPhases(order, autopay);
    const its = (order.items || []).filter((i) => rsKeys(order).includes(i.key) && !["removed", "cancelled"].includes(i.status));
    const st = [];
    if (its.length) { st.push({ k: "intro", ph: "" }); its.forEach((it) => st.push({ k: "r", ph: "r", item: it })); st.push({ k: "sum", ph: "r" }); }
    if (phs.includes("v")) st.push({ k: "v", ph: "v" });
    if (phs.includes("p")) st.push({ k: "p", ph: "p" }); else st.push({ k: "done", ph: "" });
    const out = Object.assign(st, { oid, phs, n: its.length });
    setSeq(out); setIx(0); setAns({}); setMore(false); setPol(false); setPolErr(false); setBusy(false);
  }, [oid]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => () => clearTimeout(adv.current), []);
  if (!order || !seq) return <section className="flow" aria-hidden="true" />;
  const cur = seq[Math.min(ix, seq.length - 1)];
  const phs = seq.phs;
  const go = (d) => { clearTimeout(adv.current); setMore(false); setIx((x) => Math.max(0, Math.min(seq.length - 1, x + d))); };
  const goTo = (i) => { clearTimeout(adv.current); setMore(false); setIx(i); };
  const rIdx = seq.filter((x) => x.k === "r");
  const ri = cur.k === "r" ? rIdx.indexOf(cur) : -1;
  const phLabel = { r: T("phR"), v: T("phV"), p: T("phP") };
  const kick = cur.ph ? T("stStep", { i: phs.indexOf(cur.ph) + 1, n: phs.length }) + " · " + phLabel[cur.ph] : "";
  // Fortschritt: je Phase ein Balken, innerhalb der Gründe anteilig
  const fill = (p) => {
    const pi = phs.indexOf(p), ci = cur.ph ? phs.indexOf(cur.ph) : cur.k === "done" ? phs.length : -1;
    if (ci > pi) return 100;
    if (ci < pi) return 0;
    if (p === "r") return cur.k === "sum" ? 92 : Math.round(((ri + 1) / (seq.n + 1)) * 100);
    return 50;
  };
  const back = ix > 0 && cur.k !== "done" && !(cur.k === "v" && seq[ix - 1].k === "sum") && !(cur.k === "p" && seq[ix - 1].k === "sum")
    ? <button className="bk" onClick={() => go(-1)} aria-label="Back"><ArrowLeft /></button> : null;
  const pick = (key, r) => {
    setAns((a) => ({ ...a, [key]: { r, note: r === "other" ? (a[key] && a[key].note) || "" : "" } }));
    if (r !== "other") { clearTimeout(adv.current); adv.current = setTimeout(() => go(1), 260); }
  };
  const okAns = (key) => { const a = ans[key]; return !!a && (a.r !== "other" || String(a.note || "").trim().length >= 3); };
  const submit = async () => {
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    if (!pol) { setPolErr(true); showToast(T("rPolErr"), true); return; }
    setBusy(true);
    try {
      await call("reasons", { token, orderId: order.id, lang: LANG, policyConsent: true, policyV: POLICY_V, reasons: rIdx.map((x) => ({ key: x.item.key, r: ans[x.item.key].r, note: ans[x.item.key].note || "" })) });
      track("reasons_done", `${order.id} · ${rIdx.length}`, { n: rIdx.length });
      await reload();
      go(1);
    } catch (e) {
      if (e.code === "missing") { const k = rIdx.findIndex((x) => !okAns(x.item.key)); if (k >= 0) goTo(seq.indexOf(rIdx[k])); }
      showToast(T("genericErr"), true);
    }
    setBusy(false);
  };

  let body = null, foot = null;
  if (cur.k === "intro") {
    body = (
      <>
        <div className="fl-art sf-art"><img src={IMG.rocket} alt="" /></div>
        <div className="fl-k">{T("stIntroK")}</div>
        <h2>{T("stIntroH")}</h2>
        <p>{T("stIntroP")}</p>
        <div className="sf-phs">
          {phs.map((p, i) => (
            <div key={p} className="sf-ph"><span className="n">{i + 1}</span><span><b>{phLabel[p]}</b><span>{p === "r" ? T("phRs", { n: seq.n }) : p === "v" ? T("phVs") : T("phPs")}</span></span></div>
          ))}
        </div>
      </>
    );
    foot = <div className="fl-foot sf-foot"><button className="cta or" onClick={() => go(1)}>{T("stIntroBtn")}<ArrowRight /></button></div>;
  } else if (cur.k === "r") {
    const it = cur.item, a = ans[it.key];
    const showMore = more || (a && R_MORE.includes(a.r));
    body = (
      <>
        <div className="fl-k">{kick}</div>
        <h2 className="sf-q">{T("rQ")}</h2>
        <div className="sf-rv">
          <div className="sf-rv-h"><b>{it.name || T("googleReview")}</b><Stars n={it.rating} /><span className="sf-of">{T("rOf", { i: ri + 1, n: seq.n })}</span></div>
          <div className={"sf-rv-x" + (it.text ? "" : " none")}>{it.text ? "“" + it.text + "”" : T("noText")}</div>
        </div>
        <div className="sf-opts" role="radiogroup" aria-label={T("rQ")}>
          {[...R_MAIN, ...(showMore ? R_MORE : []), "other"].map((r) => (
            <button key={r} type="button" role="radio" aria-checked={!!a && a.r === r} className={"sf-o" + (a && a.r === r ? " on" : "")} onClick={() => pick(it.key, r)}>
              <span className="tog"><Check /></span><b>{T("r_" + r)}</b>
            </button>
          ))}
          {!showMore ? <button type="button" className="sf-more" onClick={() => setMore(true)}>{T("rMore")}<ChevronRight /></button> : null}
          {a && a.r === "other" ? (
            <textarea className="sf-note" autoFocus rows={3} maxLength={300} placeholder={T("rOtherPh")} value={a.note || ""}
              onChange={(e) => { const v = e.target.value; setAns((x) => ({ ...x, [it.key]: { r: "other", note: v } })); }} />
          ) : null}
        </div>
      </>
    );
    foot = <div className="fl-foot sf-foot"><div className="sf-row">{back}<button className="cta" disabled={!okAns(it.key)} onClick={() => go(1)}>{T("rNext")}<ArrowRight /></button></div></div>;
  } else if (cur.k === "sum") {
    body = (
      <>
        <div className="fl-k">{kick}</div>
        <h2>{T("rSumH")}</h2>
        <p className="sf-sub">{T("rSumP")}</p>
        <div className="sf-sum">
          {rIdx.map((x) => {
            const a = ans[x.item.key];
            return (
              <button key={x.item.key} type="button" className={"sf-s" + (okAns(x.item.key) ? "" : " miss")} onClick={() => goTo(seq.indexOf(x))}>
                <span className="t"><span className="a"><b>{x.item.name || T("googleReview")}</b><Stars n={x.item.rating} /></span>
                  <span className="r">{a ? T("r_" + a.r) + (a.r === "other" && a.note ? ": " + a.note : "") : "—"}</span></span>
                <ChevronRight />
              </button>
            );
          })}
        </div>
        <div className="sf-self"><Info />{T("rSelf")}</div>
      </>
    );
    foot = (
      <div className="fl-foot sf-foot pgf">
        <PolicyConsent lang={LANG} checked={pol} error={polErr} className="sf-pol"
          style={{ width: "100%", fontSize: 13, lineHeight: 1.45, margin: "0 0 12px", textAlign: "left", background: polErr ? "#fff5f5" : "var(--g1, #f4f4f4)", borderRadius: 14, padding: 12, boxSizing: "border-box" }}
          onChange={(v) => { setPol(v); if (v) setPolErr(false); }} />
        <div className="sf-row">{back}<button className="cta" disabled={busy || rIdx.some((x) => !okAns(x.item.key))} onClick={submit}>{busy ? <Loader className="spin" /> : <Check />}{T("rConfirm")}</button></div>
      </div>
    );
  } else if (cur.k === "v") {
    return (
      <section className="flow sf show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="fl-card">
          <Top phs={phs} fill={fill} onClose={onClose} />
          <VerifyPane order={order} token={token} imp={imp} showToast={showToast} onDone={reload} onNext={() => go(1)} kicker={kick} back={back} runNote={!phs.includes("p")} />
        </div>
      </section>
    );
  } else if (cur.k === "p" && warn) {
    const prof = order.kind === "profile";
    body = (
      <>
        <div className="fl-art sf-art"><img src={IMG.wallet} alt="" /></div>
        <h2>{T("pgLaterH")}</h2>
        <p>{T(prof ? "pgLaterPprof" : "pgLaterP")}</p>
        <div className="secure"><ShieldCheck />{T("pgSafe")}</div>
      </>
    );
    foot = (
      <div className="fl-foot sf-foot">
        <button className="cta or" disabled={apBusy} onClick={apStart}>{apBusy ? <Loader className="spin" /> : <CreditCard />}{T("pgLaterGo")}</button>
        <button className="pg-later" disabled={apBusy} onClick={onClose}>{T("pgLaterOk")}</button>
      </div>
    );
  } else if (cur.k === "p") {
    const prof = order.kind === "profile";
    body = (
      <>
        <div className="fl-art sf-art"><img src={IMG.wallet} alt="" /></div>
        <div className="fl-k">{kick}</div>
        <h2>{T("pgH")}</h2>
        <p>{T(prof ? "pgPprof" : "pgP")}</p>
        <div className="pgs-f sf-pf">
          <div><span className="ico"><Check /></span><b>{T("pgF1", { zero })}</b></div>
          <div><span className="ico"><Receipt /></span><b>{T(prof ? "pgF2prof" : "pgF2")}</b></div>
          <div><span className="ico"><FileText /></span><b>{T("pgF3")}</b></div>
        </div>
        <div className="secure"><Lock />{T("pgSafe")}</div>
      </>
    );
    foot = (
      <div className="fl-foot sf-foot">
        <div className="sf-row">{back}<button className="cta or" disabled={apBusy} onClick={apStart}>{apBusy ? <Loader className="spin" /> : <CreditCard />}{T("pgAlert")}</button></div>
        <button className="pg-later" disabled={apBusy} onClick={() => setWarn(true)}>{T("pgLater")}</button>
      </div>
    );
  } else {
    body = (
      <>
        <div className="fl-art sf-art"><img src={IMG.rocket} alt="" /></div>
        <h2>{T("stDoneH")}</h2>
        <p>{T("stDoneP")}</p>
      </>
    );
    foot = <div className="fl-foot sf-foot"><button className="cta" onClick={onClose}>{T("done")}</button></div>;
  }
  // Zahlungsart-Schritt: Schließen (X / daneben tippen) zeigt erst den Hinweis, beim zweiten Mal zu.
  const close = cur.k === "p" && !warn ? () => setWarn(true) : onClose;
  return (
    <section className="flow sf show" onClick={(e) => { if (e.target === e.currentTarget && !busy) close(); }}>
      <div className="fl-card" key={ix + (warn ? "w" : "")}>
        <Top phs={phs} fill={fill} onClose={close} hide={cur.k === "intro" || cur.k === "done"} />
        <div className="fl-body sf-in">{body}</div>
        {foot}
      </div>
    </section>
  );
}
function Top({ phs, fill, onClose, hide }) {
  return (
    <div className="fl-top">
      <button className="x" onClick={onClose} aria-label="Close"><X /></button>
      <div className="fl-bar sf-bar" style={hide ? { visibility: "hidden" } : undefined}>{phs.map((p) => <i key={p}><b style={{ width: fill(p) + "%" }} /></i>)}</div>
    </div>
  );
}

/* Nachbestellung: weitere Bewertungen des eigenen Profils (1–3 ★) zum Auftrag hinzufügen. Bezahlt wird wie immer nur bei Löschung.
   Danach öffnet sich der Start-Ablauf (Grund je neuer Bewertung + Bestätigung, ggf. Zahlungsart) – die Zusicherung kommt dort. */
/* Neue Bestellung im Dashboard (10/2026): Profil suchen → Bewertungen (1–3 ★) wählen → AGB/Beginn bestätigen → bestellen.
   Danach öffnet sich der Start-Ablauf (Grund je Bewertung; Zahlungsart nur, wenn noch keine hinterlegt ist). */
function NewOrderFlow({ open, token, imp, autopay, onClose, onDone, showToast, presetQ }) {
  const [step, setStep] = React.useState("search"); // search | pick | done
  const [q, setQ] = React.useState("");
  const [res, setRes] = React.useState(null); // Suchtreffer
  const [busy, setBusy] = React.useState(false);
  const [place, setPlace] = React.useState(null);
  const [list, setList] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [pick, setPick] = React.useState([]);
  const [agb, setAgb] = React.useState(false);
  const [fagg, setFagg] = React.useState(false);
  const [cErr, setCErr] = React.useState(false);
  const [oid, setOid] = React.useState("");
  React.useEffect(() => {
    if (!open) return;
    setStep("search"); setQ(presetQ || ""); setRes(null); setPlace(null); setList(null); setErr(""); setPick([]); setAgb(false); setFagg(false); setCErr(false); setOid(""); setBusy(false);
    if (presetQ) search(presetQ);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const search = async (qq) => {
    const v = String(qq ?? q).trim(); if (!v) return;
    setBusy(true); setRes(null);
    try { setRes(await searchProfiles(v, LANG)); } catch (e) { setRes([]); }
    setBusy(false);
  };
  const dach = (p) => p && (p.cc === "DE" || p.cc === "AT");
  const choose = async (p) => {
    if (dach(p)) return;
    setPlace(p); setStep("pick"); setList(null); setErr(""); setPick([]);
    try { const r = await call("new-order/reviews", { token, placeId: p.placeId, lang: LANG }); setList(r.reviews || []); }
    catch (e) { setList([]); setErr(T("arErr")); }
  };
  const sel = (list || []).filter((r) => pick.includes(r.id));
  const usd = place && place.cc === "US";
  const cur = usd ? "usd" : "eur";
  const q2 = reviewQuote(sel.map((r) => { const old = r.days > 28, nt = !String(r.text || "").trim(); return { old, nt, sw: nt || (usd && old) }; }), LANG);
  const order = async () => {
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    if (!agb || !fagg) { setCErr(true); return; }
    setBusy(true);
    try {
      const r = await call("new-order", { token, lang: LANG, agb: true, ids: pick, place: { placeId: place.placeId, name: place.name, addr: place.addr, cc: place.cc, mapsUri: place.mapsUri } });
      setOid(r.orderId); setStep("done");
    } catch (e) { showToast(e.code === "already_ordered" ? T("arIn") : T("noErr"), true); }
    setBusy(false);
  };
  const ag = AGB_CONSENT[LANG] || AGB_CONSENT.en, fg = FAGG_CONSENT[LANG] || FAGG_CONSENT.en;
  return (
    <section className={"flow vf no" + (open ? " show" : "")} aria-hidden={!open} onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      {open ? (
        <div className="fl-card">
          <div className="fl-top"><button className="x" onClick={onClose} disabled={busy} aria-label="Close"><X /></button>
            <div className="fl-bar sf-bar">{["search", "pick", "done"].map((k, i) => <i key={k}><b style={{ width: ["search", "pick", "done"].indexOf(step) >= i ? "100%" : "0%" }} /></i>)}</div></div>
          {step === "search" ? (
            <>
              <div className="fl-body">
                <div className="fl-k">{T("noK")}</div>
                <h2>{T("noH1")}</h2>
                <p>{T("noP1")}</p>
                <form className="no-srch" onSubmit={(e) => { e.preventDefault(); search(); }}>
                  <Search /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("noPh")} enterKeyHint="search" />
                  <button type="submit" disabled={busy || !q.trim()}>{busy ? <Loader className="spin" /> : T("noSearch")}</button>
                </form>
                {res && !res.length ? <div className="note">{T("noNone")}</div> : null}
                {res && res.length ? (
                  <div className="ar-list">
                    {res.map((p) => (
                      <button key={p.placeId || p.id} type="button" className={"ar-row no-pl" + (dach(p) ? " dis" : "")} disabled={dach(p)} onClick={() => choose(p)}>
                        <span className="ico"><MapPin /></span>
                        <span className="t">
                          <span className="a">{p.name}{p.rating ? <span className="rt"><Star className="f" />{p.rating}{p.reviews ? <em> ({p.reviews})</em> : null}</span> : null}</span>
                          <span className="x">{p.addr}</span>
                          {dach(p) ? <span className="in">{T("noDach")}</span> : null}
                        </span>
                        {!dach(p) ? <ChevronRight className="chev" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          ) : step === "pick" ? (
            <>
              <div className="fl-body">
                <button type="button" className="no-chg" onClick={() => setStep("search")}><MapPin /><span><b>{place.name}</b><span>{place.addr}</span></span><em>{T("noChange")}</em></button>
                <h2>{T("noH2")}</h2>
                <p>{T("noP2")}</p>
                {list === null ? <div className="ar-load"><Loader className="spin" /></div>
                  : err ? <div className="note bad">{err}</div>
                  : !list.length ? <div className="note">{T("noNoRev")}</div>
                  : (
                    <div className="ar-list">
                      {list.map((r) => {
                        const on = pick.includes(r.id);
                        return (
                          <button key={r.id} type="button" disabled={r.ordered || busy} className={"ar-row" + (on ? " on" : "") + (r.ordered ? " dis" : "")} onClick={() => setPick((x) => (on ? x.filter((y) => y !== r.id) : [...x, r.id]))}>
                            <span className="cb">{on || r.ordered ? <Check /> : null}</span>
                            <span className="t">
                              <span className="a">{r.name}<span className="stars" aria-label={r.rating + " stars"}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < r.rating ? "f" : ""} />)}</span></span>
                              <span className={"x" + (r.text ? "" : " none")}>{r.text || T("noText")}</span>
                              {r.ordered ? <span className="in">{T("arIn")}</span> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
              <div className="fl-foot pgf">
                {sel.length ? (
                  <>
                    <div className="ar-max">{T("noMax", { amount: money(q2.total, cur) })}</div>
                    <label className={"no-ck" + (cErr && !agb ? " bad" : "")}><input type="checkbox" checked={agb} onChange={(e) => { setAgb(e.target.checked); setCErr(false); }} />
                      <span>{ag.pre}<a href={pagePath("agb", LANG)} target="_blank" rel="noopener noreferrer">{ag.agb}</a>{ag.mid}<a href={pagePath("widerruf", LANG)} target="_blank" rel="noopener noreferrer">{ag.wid}</a>{ag.post}</span></label>
                    <label className={"no-ck" + (cErr && !fagg ? " bad" : "")}><input type="checkbox" checked={fagg} onChange={(e) => { setFagg(e.target.checked); setCErr(false); }} /><span>{fg.txt}</span></label>
                    {cErr ? <div className="no-err">{T("noAgbErr")}</div> : null}
                    {autopay ? <div className="secure"><Lock />{T("noPay")}</div> : null}
                  </>
                ) : null}
                <button className="cta" disabled={!sel.length || busy} onClick={order}>{busy ? <Loader className="spin" /> : <Check />}{sel.length === 1 ? T("noOrder1") : sel.length ? T("noOrderN", { n: sel.length }) : T("noH2")}</button>
              </div>
            </>
          ) : (
            <>
              <div className="fl-body">
                <div className="fl-art sf-art"><img src={IMG.rocket} alt="" /></div>
                <h2>{T("noDoneH")}</h2>
                <p>{T("noDoneP")}</p>
              </div>
              <div className="fl-foot"><button className="cta" onClick={() => onDone(oid)}>{T("noDoneBtn")}<ArrowRight /></button></div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

function AddRevFlow({ order, token, imp, onClose, onDone, showToast }) {
  const [list, setList] = React.useState(null);
  const [err, setErr] = React.useState(false);
  const [pick, setPick] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const oid = order && order.id;
  React.useEffect(() => {
    if (!oid) return;
    setList(null); setErr(false); setPick([]);
    call("orders/reviews", { token, orderId: oid }).then((r) => setList(r.enabled ? r.reviews || [] : [])).catch(() => { setList([]); setErr(true); });
  }, [oid, token]);
  const sel = (list || []).filter((r) => pick.includes(r.id));
  const us = order && order.country === "US";
  const q = reviewQuote(sel.map((r) => { const old = r.days > 28, nt = !String(r.text || "").trim(); return { old, nt, sw: nt || (us && old) }; }), LANG);
  const add = async () => {
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    setBusy(true);
    try { const r = await call("orders/add", { token, orderId: oid, ids: pick }); showToast(T("arDone")); onDone(!!(r.gate || r.reasons)); }
    catch (e) { showToast(e.code === "already_ordered" ? T("arIn") : T("genericErr"), true); setBusy(false); }
  };
  React.useEffect(() => { if (!oid) setBusy(false); }, [oid]);
  return (
    <section className={"flow vf" + (order ? " show" : "")} aria-hidden={!order} onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      {order ? (
        <div className="fl-card">
          <div className="fl-top"><button className="x" onClick={onClose} disabled={busy} aria-label="Close"><X /></button><div className="fl-bar" /></div>
          <div className="fl-body">
            <div className="fl-k">{order.business || T("orderN", { id: order.id })}</div>
            <h2>{T("arH")}</h2>
            <p>{T("arP")}</p>
            {list === null ? <div className="ar-load"><Loader className="spin" /></div>
              : err ? <div className="note bad">{T("arErr")}</div>
              : !list.length ? <div className="note">{T("arNone")}</div>
              : (
                <div className="ar-list">
                  {list.map((r) => {
                    const on = pick.includes(r.id);
                    return (
                      <button key={r.id} type="button" disabled={r.ordered || busy} className={"ar-row" + (on ? " on" : "") + (r.ordered ? " dis" : "")} onClick={() => setPick((x) => (on ? x.filter((y) => y !== r.id) : [...x, r.id]))}>
                        <span className="cb">{on || r.ordered ? <Check /> : null}</span>
                        <span className="t">
                          <span className="a">{r.name}<span className="stars" aria-label={r.rating + " stars"}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < r.rating ? "f" : ""} />)}</span></span>
                          <span className={"x" + (r.text ? "" : " none")}>{r.text || T("noText")}</span>
                          {r.ordered ? <span className="in">{T("arIn")}</span> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
          <div className="fl-foot pgf">
            {sel.length ? <div className="ar-max">{T("arMax", { amount: money(q.total, order.cur) })}</div> : null}
            <button className="cta" disabled={!sel.length || busy} onClick={add}>{busy ? <Loader className="spin" /> : <Plus />}{sel.length === 1 ? T("arAdd1") : sel.length ? T("arAddN", { n: sel.length }) : T("arH")}</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* Direkt nach der Bestellung: kurz „Ihr Dashboard wird eingerichtet" (Ladebalken ~3 Sek.), dann das Dashboard. */
function SetupOverlay({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [out, setOut] = React.useState(false);
  React.useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000), t2 = setTimeout(() => setStep(2), 2000);
    const t3 = setTimeout(() => setOut(true), 3100), t4 = setTimeout(onDone, 3500);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={"setup" + (out ? " out" : "")} role="status" aria-live="polite">
      <div className="setup-in">
        <div className="setup-art"><img src={IMG.rocket} alt="" /></div>
        <h2>{T("suH")}</h2>
        <div className="setup-bar"><i /></div>
        <p key={step}>{T(["su1", "su2", "su3"][step])}</p>
      </div>
    </div>
  );
}

/* „Status geändert": öffnet sich von selbst – am Handy als Sheet von unten (Griff, wegwischen), am Desktop als Pop-up.
   Erst mit „Verstanden" (oder Wegwischen) gilt es als gelesen und kommt nicht wieder. */
function ChangedSheet({ open, items, onDone, onOpen }) {
  const ref = React.useRef(null);
  useSwipeClose(ref, open, onDone);
  return (
    <>
      <div className={"bg chgbg" + (open ? " show" : "")} onClick={onDone} />
      <div ref={ref} className={"rv-sheet chg" + (open ? " show" : "")} aria-hidden={!open} role="dialog" aria-modal="true">
        {open ? (
          <>
            <div className="grab" />
            <div className="chg-h"><span className="ico in"><Info /></span><span><h3>{T("statusChanged")}</h3><span className="meta">{T("statusChangedSub", { n: items.length })}</span></span></div>
            <div className="chg-l">
              {items.slice(0, 6).map((r) => (
                <button key={r.id} type="button" className="chg-r" onClick={() => onOpen(r)}>
                  <span className="t"><b>{r.name || T("googleReview")} · {r.o.business}</b><span>{stOf(r.prevStatus).l} → <b>{stOf(r.status, r.pre).l}</b></span></span>
                  <ChevronRight />
                </button>
              ))}
            </div>
            <button type="button" className="cta" onClick={onDone}>{T("gotIt")}</button>
          </>
        ) : null}
      </div>
    </>
  );
}

export default function CustomerDashboard() {
  useAutoUpdate(); // nach einem Deploy automatisch die neue Version laden (Home-Bildschirm-App)
  const [token, setToken] = React.useState(null); // null = noch nicht gelesen
  const [data, setData] = React.useState(null);
  const [loadErr, setLoadErr] = React.useState("");
  const [tab, setTab] = React.useState("home");
  const [ofilter, setOfilter] = React.useState("all");
  const [detailId, setDetailId] = React.useState(null);
  const [sheet, setSheet] = React.useState(null); // { orderId, key }
  const rvRef = React.useRef(null);
  useSwipeClose(rvRef, !!sheet, () => setSheet(null));
  const [flow, setFlow] = React.useState(null); // { step, items, pick:Set, mode, total, n, url }
  const [sfId, setSfId] = React.useState(null); // Auftrag starten (Gründe → Nachweis → Zahlungsart): offene Bestellung
  const sfAuto = React.useRef(false); // einmal je Sitzung automatisch öffnen
  const [arId, setArId] = React.useState(null); // Nachbestellung: weitere Bewertung zu diesem Auftrag
  const [noOpen, setNoOpen] = React.useState(false); // Neue Bestellung (anderes/neues Profil)
  const [noQ, setNoQ] = React.useState(""); // vom Chatbot vorbefüllter Suchbegriff
  const [noOn, setNoOn] = React.useState(false); // Neubestellung freigeschaltet (Test-Konten / Admin-Schalter)
  // Direkt nach der Bestellung (#a=… bzw. ?from=order): erst Einrichtungs-Animation, dann Dashboard, 2 Sek. später „Zahlungsart hinterlegen".
  const [postOrder, setPostOrder] = React.useState(() => { try { return /(^|[#&])a=/.test(window.location.hash || "") || new URLSearchParams(window.location.search).get("from") === "order"; } catch (e) { return false; } });
  const [setupOn, setSetupOn] = React.useState(false);
  const setupShown = React.useRef(false);
  const [toast, setToast] = React.useState(null); // { m, bad }
  const [busy, setBusy] = React.useState("");
  const [magicErr, setMagicErr] = React.useState(false);
  const [resetK, setResetK] = React.useState("");
  const [gate, setGate] = React.useState(null); // Push noch nicht an → Vollbild-Aufforderung
  const [, tick] = React.useState(0);
  const prev = React.useRef(null);
  const celeSeen = React.useRef(null); // Set der schon gefeierten Löschungen (zusätzlich im localStorage)
  const [cele, setCele] = React.useState(null);
  const [intro, setIntro] = React.useState(true);
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
    // Direkt nach der Bestellung: einmaliger Code im #-Teil (#a=…) → eigene Sitzung (24 Std.), Code sofort aus der Adresse entfernen.
    let ak = ""; try { const h = new URLSearchParams(String(window.location.hash || "").replace(/^#/, "")); ak = h.get("a") || ""; } catch (e) { /* */ }
    if (ak) {
      try { window.history.replaceState(null, "", window.location.pathname + window.location.search); } catch (e) { /* */ }
      call("autologin", { k: ak }).then((r) => { store.set(r.token); setToken(r.token); }).catch(() => setToken(store.get()));
      return;
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

  React.useEffect(() => { if (token) call("new-order/info", { token }).then((r) => setNoOn(!!r.enabled)).catch(() => setNoOn(false)); }, [token]);
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
        // Software freigegeben = keine Zahlung mehr (10/2026) → eigener Text statt „Zahlung erhalten".
        if ((swOk || paid) && !d.adminView && !window.__NO_TRACK) setCele({ id: Date.now(), kind: "paid", title: paid ? T("cPaidT") : T("dfDoneH"), sub: paid ? T("cPaidS") : T("why_sw_accepted") });
        // Dashboard-Aktivität: aus dem Zahlungs-Tab zurück, aber (noch) nicht bezahlt → abgebrochen
        const po = payOpen.current;
        if (po && (swOk || paid)) payOpen.current = null;
        else if (po && document.visibilityState === "visible" && Date.now() - po.at > 5000) {
          const sec = Math.round((Date.now() - po.at) / 1000);
          track("payment_abort", `${po.label} · nach ${sec < 120 ? sec + " s" : Math.round(sec / 60) + " Min."}`, { sec });
          payOpen.current = null;
        }
      }
      // Erfolgs-Moment: neu gelöschte Bewertungen/Profile seit dem letzten Besuch (auch live, wenn es während des Besuchs passiert).
      if (!d.adminView && !window.__NO_TRACK) {
        const sk = "rr_cele_" + String(d.email || "").toLowerCase();
        const list = removedKeys(d);
        if (!celeSeen.current) {
          let stored = null;
          try { stored = JSON.parse(localStorage.getItem(sk) || "null"); } catch (e) { stored = null; }
          celeSeen.current = Array.isArray(stored) ? new Set(stored) : new Set(list.filter((x) => !x.at || Date.now() - new Date(x.at).getTime() > 48 * 3600e3).map((x) => x.k));
        }
        const fresh = list.filter((x) => !celeSeen.current.has(x.k));
        list.forEach((x) => celeSeen.current.add(x.k));
        try { localStorage.setItem(sk, JSON.stringify([...celeSeen.current])); } catch (e) { /* */ }
        if (fresh.length) {
          const rv = fresh.filter((x) => !x.prof).length;
          setCele({ id: Date.now(), kind: "removed", title: rv ? (rv === 1 ? T("cRemT1") : T("cRemTn", { n: rv })) : T("cProfT"), sub: rv ? T("cRemS") : T("cProfS"), items: [...new Set(fresh.map((x) => x.biz).filter(Boolean))] });
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
  useLive(() => load(token), !!token); // Live: Änderungen (Partner, Zahlung …) sofort, ohne App-Neustart
  // Rückkehr aus Stripe („Zahlungsart hinterlegen"): ?autopay=done&cs=… → speichern (+ offene Beträge abbuchen).
  const apDone = React.useRef(false);
  React.useEffect(() => {
    if (!token || apDone.current) return;
    let ap = "", cs = "";
    try { const sp = new URLSearchParams(window.location.search); ap = sp.get("autopay") || ""; cs = sp.get("cs") || ""; } catch (e) { return; }
    if (!ap) return;
    apDone.current = true;
    try { const u = new URL(window.location.href); u.searchParams.delete("autopay"); u.searchParams.delete("cs"); window.history.replaceState(null, "", u.pathname + (u.search || "")); } catch (e) { /* */ }
    if (ap !== "done" || !cs) { showToast(T("apCancel"), true); return; }
    setBusy("ap"); setSfId(null); sfAuto.current = true;
    call("autopay/confirm", { token, cs })
      .then((r) => {
        // Großer Moment: Karte fliegt rein, Häkchen, Konfetti, Ton (Celebrate kind „card").
        setCele({ id: Date.now(), kind: "card", label: r.label || "", title: T("ceCardT"), sub: r.charged ? T("apSavedPaid", { amount: money(r.charged.amount, r.charged.cur) }) : r.started ? T("ceCardS") : T("ceCardS2") });
      })
      .catch(() => showToast(T("genericErr"), true))
      .finally(() => { setBusy(""); prev.current = null; load(token); }); // kein zweiter „Bezahlt"-Toast aus dem Vergleich
  }, [token, load, showToast]);
  React.useEffect(() => { if (!data || !intro || gate) return undefined; const t = setTimeout(() => setIntro(false), 1600); return () => clearTimeout(t); }, [data, intro, gate]);
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
  const [payVia, setPayVia] = React.useState("");
  const [apArm, setApArm] = React.useState(false); // „Entfernen" zweimal tippen
  const [billOpen, setBillOpen] = React.useState(false); // Konto → Zahlung & Abrechnung
  const [bill, setBill] = React.useState(null); // Formular Rechnungsdetails
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
      // Link aus der Software-Mail (?open=software) → Schritt-für-Schritt-Entscheidung sofort öffnen,
      // genau wie beim Tippen auf „There is a problem" (gleiche Einträge wie openFlow).
      if (u.searchParams.get("open") === "software") {
        u.searchParams.delete("open"); window.history.replaceState(null, "", u.pathname + (u.search || ""));
        const all0 = (data.orders || []).filter((o) => !o.cancelled).flatMap((o) => o.items.filter((i) => i.status === "software").map((i) => ({
          id: o.id + "\u0001" + i.key, orderId: o.id, key: i.key, name: i.name || T("googleReview"), text: i.text, business: o.business, cur: o.cur, price: o.swPrice, dep: o.swDeposit, pre: !!i.pre, dl: i.swDue || null,
        })));
        // wie openFlow: eine Währung je Zahlung; bei der Bestellung schon zugestimmt → direkt zur Zahlung.
        const items = all0.filter((i) => all0.length && i.cur === all0[0].cur);
        const pre = items.length > 0 && items.every((i) => i.pre);
        if (items.length) { setSheet(null); setFlow({ step: pre ? 3 : 0, pre, items, pick: new Set(items.map((i) => i.id)), mode: "", url: "" }); }
      }
    } catch (e) { /* */ }
    try {
      const n = (data.orders || []).reduce((s, o) => s + o.items.filter((i) => i.status === "software").length, 0);
      if (navigator.setAppBadge) (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(() => {});
    } catch (e) { /* */ }
  }, [data]);
  // Etwas fehlt noch zum Start (Gründe / Nachweis / Zahlungsart) → Start-Ablauf einmal je Sitzung von selbst öffnen.
  React.useEffect(() => {
    if (!data || sfAuto.current || imp || data.adminView || sfId || busy === "ap") return;
    try { if (new URLSearchParams(window.location.search).get("autopay")) return; } catch (e) { /* */ } // Rückkehr aus Stripe läuft gerade
    if (postOrder && (setupOn || !setupShown.current)) return; // erst die Einrichtungs-Animation
    const o = (data.orders || []).find((x) => startPhases(x, data.autopay).length);
    if (o) {
      sfAuto.current = true;
      if (postOrder) { const t = setTimeout(() => setSfId(o.id), 700); return () => clearTimeout(t); }
      setSfId(o.id);
    } else if (postOrder) setPostOrder(false);
  }, [data, imp, sfId, busy, setupOn, postOrder]);
  // Einrichtungs-Animation starten, sobald nach der Bestellung die Daten da sind (einmal).
  React.useEffect(() => {
    if (!postOrder || !data || setupShown.current || imp || data.adminView) return;
    setupShown.current = true; setSetupOn(true);
  }, [postOrder, data, imp]);
  // Dashboard-Aktivität: Sitzung starten, sobald die Daten da sind; Seitenaufrufe je Ansicht.
  React.useEffect(() => { if (token && data && !imp && !data.adminView) startTracking(token); }, [token, !!data, imp]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (!token || !data || imp || data.adminView) return;
    const sh = sheet ? (data.orders || []).find((o) => o.id === sheet.orderId) : null;
    const it = sh ? sh.items.find((i) => i.key === sheet.key) : null;
    const name = sfId ? `Auftrag starten · ${sfId}` : flow ? `Spezial-Software · Schritt ${(flow.step || 0) + 1}`
      : sheet ? `Bewertung ansehen${it && (it.name || it.url) ? ": " + String(it.name || it.url).slice(0, 60) : ""}`
      : detailId ? `Bestellung ${detailId}`
      : ({ home: "Übersicht", orders: "Bestellungen", pay: "Zahlungen", acc: "Konto" })[tab] || tab;
    view(name, sheet ? sheet.orderId : detailId || undefined);
  }, [token, !!data, tab, detailId, sheet, flow && flow.step, sfId]); // eslint-disable-line react-hooks/exhaustive-deps
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
  if (!token) {
    let fromOrder = false; try { fromOrder = new URLSearchParams(window.location.search).get("from") === "order"; } catch (e) { /* */ }
    return <div className="rra"><Login onToken={onToken} notice={magicErr ? T("magicExpired") : fromOrder ? T("orderLogin") : ""} /></div>;
  }
  if (setupOn) return <div className="rra"><SetupOverlay onDone={() => setSetupOn(false)} /></div>;
  if (offerPk && !postOrder) return <PasskeyOffer role="customer" token={token} onDone={(on) => { setOfferPk(false); if (on) showToast(T("pkIsOn", { name: pkName() })); }} T={T} />;
  if (gate && data && !postOrder) return <PushGate role="customer" token={token} state={gate} T={T} onDone={(on) => { setGate(null); if (on) showToast(T("pushOn")); }} />;
  if (!data) {
    return (
      <div className="rra"><div className="lg-wrap">
        {loadErr ? <div className="lg"><div className="note bad">{loadErr}</div><button className="cta" onClick={() => load(token)}>{T("tryAgain")}</button></div> : <Loader className="spin" />}
      </div></div>
    );
  }

  /* ---- Abgeleitete Daten ---- */
  // Auftrag wartet auf den Inhaber-Nachweis → seine Bewertungen zeigen „Wartet auf Nachweis" statt „Wird geprüft".
  // Nachbestellung mit Zahlungsart-Pflicht: nur die neuen Bewertungen (payGateKeys) warten, die übrigen laufen weiter.
  // Je Bewertung: erst „Wartet auf Zahlungsart" (falls die fehlt), danach nur die 4–5-Sterne-Bewertungen „Wartet auf Nachweis".
  const orders = (data.orders || []).map((o) => (vNeeds(o) || pgNeeds(o) || rsNeeds(o) ? { ...o, items: o.items.map((i) => {
    if (i.status !== "new") return i;
    if (rsKeys(o).includes(i.key)) return { ...i, status: "reasons" };
    if (pgNeeds(o) && !data.autopay && (!o.payGateKeys || o.payGateKeys.includes(i.key))) return { ...i, status: "paygate" };
    return vWaits(o, i.key) ? { ...i, status: "verify" } : i;
  }) } : o));
  const pgNeed = orders.filter((o) => pgNeeds(o) && !data.autopay);
  const pgZero = money(0, pgNeed[0]?.cur || orders[0]?.cur || "eur"); // „0 €" / „$0" in der Währung des Auftrags – keine Stückpreise (können je Bewertung abweichen)
  const stNeed = (data.orders || []).filter((o) => startPhases(o, data.autopay).length); // Auftrag starten: es fehlt noch etwas
  // Zwischenzahlung: Auftrag pausiert, bis der offene Betrag bezahlt ist → Anzahl der pausierten Bewertungen.
  const holdCard = orders.some((o) => o.holdCard); // Pause wegen fehlgeschlagener Abbuchung → „Zahlungsart aktualisieren"
  const holdN = orders.filter((o) => o.hold && !o.holdCard).reduce((n, o) => n + o.items.filter((i) => ["new", "working", "sw_accepted"].includes(i.status)).length, 0);
  const sfOrder = sfId ? orders.find((o) => o.id === sfId) || null : null;
  const all = orders.flatMap((o) => o.items.map((r) => ({ ...r, o, id: o.id + "\u0001" + r.key })));
  const removedN = all.filter((r) => r.status === "removed").length;
  const remaining = all.filter((r) => OPEN.includes(r.status) && !["verify", "paygate", "reasons"].includes(r.status)).length; // wartende zählen nicht als „in Bearbeitung"
  const firstName = String(data.name || "").trim().split(/\s+/)[0] || "";
  const ini = initials(data.name, data.email);
  const sw = all.filter((r) => r.status === "software");
  const swOrders = new Set(sw.map((r) => r.o.id)).size;

  const dueOrders = orders.filter((o) => o.toPay > 0);
  // Software-Fälle, die der Partner bestätigt hat und denen der Kunde schon bei der Bestellung zugestimmt hat → gehören in „Zu zahlen".
  const swPre = sw.filter((r) => r.pre);
  const payCur = dueOrders[0]?.cur || swPre[0]?.o.cur || orders[0]?.cur || "eur";
  const due = all.filter((r) => r.status === "removed" && !r.paid && !r.o.cancelled && r.o.cur === payCur); // stornierter Auftrag → nichts mehr offen
  const toPay = dueOrders.filter((o) => o.cur === payCur).reduce((s, o) => s + o.toPay, 0);
  const prices = [...new Set(due.map((r) => r.price))];
  // Zahlungsgruppen: jeder Auftrag wird so bezahlt, wie der Kunde ihn bestellt hat.
  // Wise (−10 %, unsere Kontodaten) · PayPal (−10 %, PayPal.me) · Karte (Stripe-Checkout, voller Preis).
  // Mehrere Aufträge mit gleicher Methode → eine Summe; verschiedene Methoden → je eine Zeile im Zahl-Block.
  const wiseBank = (data.wiseBank || []).filter(Boolean);
  const viaOf = (o) => (o.payPref === "wise" && wiseBank.length ? "wise" : o.payPref === "paypal" ? "paypal" : "card");
  const payGroups = ["wise", "paypal", "card"].map((via) => {
    const os = dueOrders.filter((o) => o.cur === payCur && viaOf(o) === via);
    const amount = os.reduce((s, o) => s + o.toPay, 0); // PayPal/Wise −10 % steckt schon im Preis des Auftrags (Server)
    const regular = via === "card" ? amount : os.reduce((s, o) => s + Math.round(o.toPay / 0.9), 0); // Preis ohne Rabatt (nur für „Sie sparen …")
    return { via, orders: os, regular, amount, ref: os.map((o) => o.id).join(" ") };
  }).filter((g) => g.orders.length);
  // Software-Fälle: keine Vorauszahlung mehr (10/2026) → nichts „zu zahlen"; der Hinweis oben führt zum Hinterlegen der Zahlungsart.
  const multiPay = payGroups.length > 1;
  const payTotal = payGroups.reduce((s, g) => s + g.amount, 0);
  const g0 = payGroups[0] || null;
  const viaWise = !multiPay && g0?.via === "wise";
  const viaPaypal = !multiPay && g0?.via === "paypal";
  const wiseAmount = g0 ? g0.amount : 0;
  const sheetG = payGroups.find((g) => g.via === payVia) || payGroups.find((g) => g.via !== "card") || null;
  const ppUrlOf = (g) => `https://www.paypal.me/${PAYPAL_ME}/${g ? g.amount : 0}${String(payCur).toUpperCase()}`;
  const deposits = orders.flatMap((o) => (o.deposits || []).map((d) => ({ ...d, o })));
  const history = orders.flatMap((o) => (o.history || []).map((h) => ({ ...h, o }))).sort((a, b) => String(b.paid).localeCompare(String(a.paid)));

  const acts = [
    ...sw.map((r) => ({ k: "d" + r.id, I: AlertCircle, c: "pr", t: T(r.pre ? "st_swpay" : "act_decision"), s: r, tm: r.changedAt ? ago(r.changedAt) : T("today"), at: Date.now() + 1 })),
    ...all.filter((r) => r.status === "working").map((r) => ({ k: "w" + r.id, I: Loader, c: "wk", t: T("act_working") + (r.since ? " · " + dur(r.since) : ""), s: r, tm: T("now"), at: Date.now() })),
    ...all.filter((r) => r.status === "sw_accepted").map((r) => ({ k: "a" + r.id, I: Cpu, c: "wk", t: T("act_specialist"), s: r, tm: ago(r.changedAt), at: r.changedAt ? new Date(r.changedAt).getTime() : 0 })),
    ...all.filter((r) => r.prevStatus && !["removed", "working"].includes(r.status)).map((r) => ({ k: "c" + r.id, I: Info, c: "in", t: T("statusChanged"), s: r, sub: `${stOf(r.prevStatus).l} → ${stOf(r.status, r.pre).l}`, tm: ago(r.changedAt), at: r.changedAt ? new Date(r.changedAt).getTime() : 0 })),
    ...all.filter((r) => r.status === "removed").map((r) => ({ k: "r" + r.id, I: Check, c: "ok", t: T("act_removed"), s: r, tm: ago(r.removedAt), at: r.removedAt ? new Date(r.removedAt).getTime() : 0 })),
  ].sort((a, b) => b.at - a.at).slice(0, 6);

  // „Status geändert": letzte 14 Tage, noch nicht weggeklickt (je Gerät).
  const seen = new Set(seenGet());
  const changedNew = all.filter((r) => r.prevStatus && r.changedAt && Date.now() - new Date(r.changedAt).getTime() < 14 * 864e5 && !seen.has(r.id + "|" + r.changedAt));
  const chgDone = (list) => { seenAdd((list || changedNew).map((r) => r.id + "|" + r.changedAt)); tick((x) => x + 1); };

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
  const payGroup = async (g) => {
    if (!g) return;
    if (g.via === "sw") { openFlow(); return; } // Software-Vorauszahlung → Zahlungsschritt
    if (g.via !== "card") { track("payment_open", `${g.via === "wise" ? "Wise" : "PayPal"} · ${g.amount} ${String(payCur).toUpperCase()} · ${g.ref}`, { via: g.via }); setPayVia(g.via); setWiseOpen(true); return; }
    if (await checkout("pay", multiPay ? { only: "card" } : {}, "pay")) showToast(T("checkoutOpened"));
  };
  const payAll = () => payGroup(g0);

  /* ---- Problem-Flow (Spezialist) ---- */
  const openFlow = () => {
    setSheet(null);
    const all0 = sw.map((r) => ({ id: r.id, orderId: r.o.id, key: r.key, name: r.name || T("googleReview"), text: r.text, business: r.o.business, cur: r.o.cur, price: r.o.swPrice, dep: r.o.swDeposit, pre: !!r.pre || !!r.swWant, dl: r.swDue || null }));
    if (!all0.length) return;
    // Ein Zahlungslink = eine Währung: Aufträge in € und $ nicht mischen (sonst zeigt die App die Summe beider, Stripe nur eine).
    const items = all0.filter((i) => i.cur === all0[0].cur);
    // Schon bei der Bestellung zugestimmt (Software-Fall) → keine Entscheidung mehr, direkt zur Zahlung.
    const pre = items.every((i) => i.pre);
    setFlow({ step: pre ? 3 : 0, pre, items, pick: new Set(items.map((i) => i.id)), mode: "", url: "" });
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
      if (data && data.autopay) { // Zahlungsart hinterlegt → zustimmen ohne Vorauszahlung (kein Stripe-Tab)
        try {
          if (des.length) await call("software", { token, decision: "decline", items: flowRefs(des) });
          await call("software", { token, decision: "accept", items: flowRefs(sel) });
          setFlow({ ...f, step: 4, mode: "approved", items: sel, pick: new Set(sel.map((i) => i.id)) });
        } catch (e) { showToast(T("genericErr"), true); }
        setBusy(""); load(token);
        return;
      }
      // Keine Zahlungsart → Zustimmung vormerken und Zahlungsart hinterlegen (Stripe); danach startet der Partner automatisch.
      try {
        if (des.length) await call("software", { token, decision: "decline", items: flowRefs(des) });
        await call("software", { token, decision: "accept", items: flowRefs(sel) });
        track("software_accept", "Zahlungsart folgt");
        setBusy(""); setFlow(null);
        await apStart();
      } catch (e) { showToast(T("genericErr"), true); setBusy(""); load(token); }
      return;
    }
    setFlow({ ...f, step: f.step + 1 });
  };

  /* ---- Bausteine ---- */
  const AlertBtn = ({ title, sub, onClick }) => (
    <button className="alert" onClick={onClick || openFlow}>
      <span className="ai"><AlertTriangle /></span>
      <span><b>{title}</b><span>{sub}</span></span>
      <span className="ar"><ArrowRight /></span>
    </button>
  );
  const swOnly = !due.length && g0 && g0.via === "sw";
  // Zahlungsart hinterlegt (ohne Fehler): Gelöschtes wird gleich automatisch abgebucht → kein „Bezahlen"-Knopf.
  const apSoon = !!(data.autopay && !data.autopay.error && due.length && !multiPay && !swOnly);
  const Hero = ({ payments }) => (due.length || swOnly ? (
    <div className="hero">
      <span className="hero-img"><img src={IMG.wallet} alt="" /></span>
      <div className="k">{T("toPay")}</div>
      <div className="v"><CountUp id={"hero-" + payCur} value={multiPay ? payTotal : swOnly ? g0.amount : viaWise || viaPaypal ? wiseAmount : toPay} fmt={(v) => money(v, payCur)} /></div>
      <div className="s">{multiPay ? T("payN", { n: payGroups.length }) : swOnly ? T("st_swpay") : viaWise || viaPaypal ? `${T(viaWise ? "wDisc" : "ppDisc")} · ${T("wInstead", { amount: money(toPay, payCur) })}` : payments || prices.length !== 1 ? T("removedCount", { n: due.length }) : T("removedEach", { n: due.length, price: money(prices[0], payCur) })}</div>
      {multiPay ? (
        <div className="pgrps">
          {payGroups.map((g) => (
            <button key={g.via} type="button" className={"pgrp " + g.via} disabled={!!busy} onClick={() => payGroup(g)} data-track={"Bezahlen · " + g.via}>
              <span className="pg-ic">{g.via === "wise" ? "W" : g.via === "paypal" ? "P" : g.via === "sw" ? <Cpu /> : <CreditCard />}</span>
              <span className="pg-t"><b>{g.via === "wise" ? "Wise" : g.via === "paypal" ? "PayPal" : g.via === "sw" ? T("st_swpay") : T("card")}{g.via === "wise" || g.via === "paypal" ? <em>−10 %</em> : null}</b><small>{g.orders.map((o) => "#" + o.id).join(" · ")}</small></span>
              <span className="pg-a">{busy === "pay" && g.via === "card" ? <Loader className="spin" /> : money(g.amount, payCur)}<ArrowRight /></span>
            </button>
          ))}
          <p className="pg-h">{T("payGrpHint")}</p>
        </div>
      ) : apSoon ? (
        <div className="row ppcol">
          <span className="payprog" role="status" aria-live="polite">
            <span className="pp-card"><CreditCard /><i className="pp-scan" /></span>
            <span className="pp-t">{T("apProg")}<span className="pp-dots"><i /><i /><i /></span></span>
          </span>
          <span className="pp-sub">{T("apSoon", { pm: data.autopay.label })}</span>
        </div>
      ) : (
        <div className="row">
          {payments ? <span /> : <span className="rem"><i />{T("remainingInProgress", { n: remaining })}</span>}
          <button className="pill-btn" disabled={!!busy} onClick={payAll}>{busy === "pay" ? <Loader className="spin" /> : null}{payments ? T("payNow") : T("pay")}</button>
        </div>
      )}
    </div>
  ) : payments ? null : (
    <div className="hero ok">
      <span className="hero-img"><img src={IMG.rocket} alt="" /></span>
      <div className="k">{T("allPaid")}</div>
      <div className="v" style={{ fontSize: 30, letterSpacing: -1 }}>{T("due", { amount: money(0, payCur) })}</div>
      <div className="s">{remaining ? T("remainingInProgress", { n: remaining }) : T("nothingOpen")}</div>
    </div>
  ));
  /* ---- Automatisch bezahlen (hinterlegte Zahlungsart) ---- */
  const ap = data.autopay || null;
  const apStart = async () => {
    if (busy) return;
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    setBusy("ap");
    try {
      const r = await call("autopay/start", { token, returnUrl: window.location.origin + window.location.pathname });
      track("autopay_open", "Zahlungsart hinterlegen");
      window.location.href = r.url; // gleicher Tab: Stripe leitet zurück (?autopay=done)
    } catch (e) { showToast(e.code === "payment_unavailable" ? T("payUnavailable") : T("genericErr"), true); setBusy(""); }
  };
  const apRemove = async () => {
    if (busy) return;
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    if (!apArm) { setApArm(true); setTimeout(() => setApArm(false), 4000); return; }
    setApArm(false); setBusy("ap");
    try { await call("autopay/remove", { token }); showToast(T("apGone")); } catch (e) { showToast(e.code === "orders_running" ? T("apLocked") : T("genericErr"), true); }
    setBusy(""); load(token);
  };
  const AutoPayCard = () => {
    if (!ap && (!data.autopayAvailable || !all.length || pgNeed.length)) return null; // vorerst nur Bewertungs-Kunden mit freigeschalteter Funktion; offener Start-Schritt → Hinweis oben reicht
    if (ap) return (
      <div className={"paycard apc on" + (ap.error ? " err" : "")}>
        <span className="ico"><CreditCard /></span>
        <span><b>{T("apOnT")}{ap.mode === "test" ? <em className="aptest">{T("apTest")}</em> : null}</b><span>{T("apOnS", { pm: ap.label })}</span>{ap.error ? <span className="aperr">{T("apFail")}</span> : null}{data.autopayLocked ? <span className="aplock">{T("apLocked")}</span> : null}</span>
        <span className="apbtns">
          <button className="mini ghost" disabled={!!busy} onClick={apStart}>{T("apChange")}</button>
          {data.autopayLocked ? null : <button className={"mini ghost" + (apArm ? " arm" : "")} disabled={!!busy} onClick={apRemove}>{busy === "ap" ? <Loader className="spin" /> : null}{apArm ? T("apRmQ") : T("apRm")}</button>}
        </span>
      </div>
    );
    return (
      <div className="paycard apc">
        <span className="ico"><CreditCard /></span>
        <span><b>{T("apT")}{data.autopayTest ? <em className="aptest">{T("apTest")}</em> : null}</b><span>{T("apS")}</span></span>
        <button className="mini" disabled={!!busy} onClick={apStart}>{busy === "ap" ? <Loader className="spin" /> : <Lock />}{T("apBtn")}</button>
      </div>
    );
  };
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
          {holdCard ? <AlertBtn title={T("apFailT")} sub={T("apFailS")} onClick={apStart} /> : null}
          {holdN ? <div className="holdn"><span className="ai"><Timer /></span><span><b>{T("holdT")}</b><span>{T("holdS", { n: holdN })}</span></span></div> : null}
          {stNeed.length ? <AlertBtn title={T("stAlertT")} sub={(stNeed.length > 1 || orders.length > 1 ? (stNeed[0].business || "#" + stNeed[0].id) + " · " : "") + T("stAlertS", { n: startPhases(stNeed[0], data.autopay).length })} onClick={() => setSfId(stNeed[0].id)} /> : null}
          {sw.length ? (sw.every((r) => r.pre) ? <AlertBtn title={T("st_swpay")} sub={T("why_swpay")} /> : <AlertBtn title={T("problemOrders", { n: swOrders })} sub={T("needDecision", { n: sw.length })} />) : null}
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
                    <span className="m">{act ? <b>{T("actionNeeded")}</b> : o.items.some((x) => ["paygate", "verify", "reasons"].includes(x.status)) ? <b>{T(o.items.some((x) => x.status === "reasons") ? "st_reasons" : o.items.some((x) => x.status === "verify") ? "st_verify" : "st_paygate")}</b> : T("inProgressN", { n: o.items.filter((x) => OPEN.includes(x.status)).length })}</span>
                  </button>
                );
              })}
            </div>
          ) : <div className="empty"><img src={IMG.rocket} alt="" />{T("noOrders")}</div>}
          {noOn && !adminView ? <button className="ar-btn no-btn" onClick={() => { setNoQ(""); setNoOpen(true); }}><span className="ico"><Plus /></span><span className="t"><b>{T("noBtn")}</b><span>{T("noBtnS")}</span></span><ChevronRight /></button> : null}
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
        {noOn && !adminView ? <button className="ar-btn no-btn" style={{ marginTop: 0, marginBottom: 14 }} onClick={() => { setNoQ(""); setNoOpen(true); }}><span className="ico"><Plus /></span><span className="t"><b>{T("noBtn")}</b><span>{T("noBtnS")}</span></span><ChevronRight /></button> : null}
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
            <span>{(h.names.length ? h.names.join(", ") : h.o.business) + " · " + shortDate(h.paid) + (h.auto ? " · " + T("apAuto") : "")}</span>
          </span>
          <span className="amt">{money(h.amount, h.cur)}{h.invoiceUrl ? <a className="hinv" href={h.invoiceUrl} target="_blank" rel="noopener noreferrer">{T("apInv")}</a> : null}</span>
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
        <button className="ai-row" onClick={() => { setBill(null); setBillOpen(true); }}><span className="ico"><CreditCard /></span><span className="t"><b>{T("billT")}</b><span>{ap ? ap.label : T("billSub")}</span></span><ChevronRight /></button>
        <button className="ai-row" onClick={() => goTab("pay")}><span className="ico"><FileText /></span><span className="t"><b>{T("invoices")}</b><span>{T("invoicesSub")}</span></span><ChevronRight /></button>
        <a className="ai-row" href="/en/privacy-policy" target="_blank" rel="noopener noreferrer"><span className="ico"><ShieldCheck /></span><span className="t"><b>{T("privacy")}</b></span><ChevronRight /></a>
        <button className="ai-row" onClick={logout}><span className="ico"><LogOut /></span><span className="t"><b>{T("logout")}</b></span><ChevronRight /></button>
      </div>
    </>
  );

  /* ---- Konto → Zahlung & Abrechnung ---- */
  const COUNTRIES = ["AT", "DE", "CH", "LI", "IT", "NL", "BE", "LU", "FR", "ES", "PT", "IE", "GB", "DK", "SE", "NO", "FI", "PL", "CZ", "SK", "HU", "SI", "HR", "US", "CA", "AU", "NZ", "AE", "ZA"];
  const cName = (c) => { try { return new Intl.DisplayNames([LOC], { type: "region" }).of(c); } catch (e) { return c; } };
  const BillingV = () => {
    const f = bill || data.billing || {};
    const set = (k) => (e) => setBill({ ...f, [k]: e.target.value });
    const save = async () => {
      if (busy) return;
      if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
      if (!String(f.company || "").trim() && !String(f.name || "").trim()) { showToast(T("bNeedName"), true); return; }
      setBusy("bill");
      try {
        const r = await call("billing", { token, ...f });
        const b = r.billing || {};
        showToast(b.vat && b.vatStatus === "valid" ? T("bVatOk") + (b.vatName ? " · " + b.vatName : "") : b.vat && b.vatStatus === "unchecked" ? T("bVatUnchecked") : T("bSaved"), false);
        setBill(null); load(token);
      } catch (e) {
        const M = { name: "bNeedName", addr_incomplete: "bErrIncomplete", addr_zip: "bErrZip", addr_country: "bErrIncomplete", addr_country_mismatch: "bErrCountry", addr_notfound: "bErrAddr", addr_mismatch: "bErrAddr", vat_invalid: "bErrVat", vat_country: "bErrVatCountry", vat_format: "bErrVatFormat" };
        showToast(M[e.code] ? T(M[e.code]) : T("genericErr"), true);
      }
      setBusy("");
    };
    const inp = (k, label, extra = {}) => (
      <label className="bf"><span>{label}</span><input value={f[k] || ""} onChange={set(k)} {...extra} /></label>
    );
    return (
      <>
        <button className="back" onClick={() => setBillOpen(false)} aria-label="Close"><ArrowLeft className="li" /><X className="xi" /></button>
        <div className="dh"><h1>{T("billT")}</h1></div>
        {ap || data.autopayAvailable ? (
          <>
            <div className="sec" style={{ marginTop: 18 }}><h2>{T("pmH")}</h2></div>
            <AutoPayCard />
          </>
        ) : null}
        <div className="sec" style={{ marginTop: 22 }}><h2>{T("invH")}</h2></div>
        <p className="bsub">{T("invSub")}</p>
        <div className="bform">
          {inp("company", T("fCompany"), { autoComplete: "organization" })}
          {inp("name", T("fName"), { autoComplete: "name" })}
          {inp("line1", T("fStreet"), { autoComplete: "address-line1" })}
          <div className="brow">
            {inp("postal", T("fZip"), { autoComplete: "postal-code", inputMode: "text" })}
            {inp("city", T("fCity"), { autoComplete: "address-level2" })}
          </div>
          <label className="bf"><span>{T("fCountry")}</span>
            <select value={f.country || ""} onChange={set("country")}>
              <option value="">–</option>
              {[...new Set([f.country, ...COUNTRIES].filter(Boolean))].map((c) => <option key={c} value={c}>{cName(c)}</option>)}
            </select>
          </label>
          {inp("vat", T("fVat"), { autoComplete: "off", autoCapitalize: "characters" })}
          {EU_RC.includes(f.country) ? <p className="bsub rc">{data.billing && data.billing.vatStatus === "valid" && data.billing.country === f.country && !bill ? T("bRcOk") : T("bRcHint")}</p> : null}
          {!bill && data.billing && data.billing.saved ? (
            <div className="bstat">
              {data.billing.addrChecked ? <span className="ok"><Check />{T("bAddrOk")}</span> : null}
              {data.billing.vat && data.billing.vatStatus === "valid" ? <span className="ok"><Check />{T("bVatOk")}{data.billing.vatName ? " · " + data.billing.vatName : ""}</span> : null}
              {data.billing.vat && data.billing.vatStatus === "unchecked" ? <span>{T("bVatUnchecked")}</span> : null}
            </div>
          ) : null}
          <button className="cta" disabled={busy === "bill"} onClick={save}>{busy === "bill" ? <Loader className="spin" /> : <Check />}{busy === "bill" ? T("bChecking") : T("bSave")}</button>
        </div>
      </>
    );
  };

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
        {startPhases(o, data.autopay).length ? <div style={{ marginBottom: 18 }}><AlertBtn title={T("stAlertT")} sub={T("stAlertS", { n: startPhases(o, data.autopay).length })} onClick={() => { setDetailId(null); setSfId(o.id); }} /></div> : null}
        {s ? <div style={{ marginBottom: 18 }}><AlertBtn title={T("needYou", { n: s })} sub={T("tapToSee")} /></div> : null}
        <div className="sec"><h2>{T("reviews")}</h2></div>
        {o.items.map((x) => {
          const st = stOf(x.status, x.pre);
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
        {!o.cancelled && o.placeOk ? <button className="ar-btn" onClick={() => setArId(o.id)}><span className="ico"><Plus /></span><b>{T("arBtn")}</b><ChevronRight /></button> : null}
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
      btn = n ? (ap ? T("cont") : T("contPay")) : T("declineAll", { amount: money(0, cur) });
    }
    if (S === 3 && ap) {
      // Zahlungsart hinterlegt → keine Vorauszahlung: zustimmen, wir starten, Abbuchung erst bei Erfolg.
      body = (
        <>
          <div className="fl-k">{T("dfK")}</div>
          <h2>{T("dfH")}</h2>
          <p>{T("dfP", { pm: ap.label })}{it.length - n ? " · " + T("declinedN", { n: it.length - n }) : ""}</p>
          <div className="sw-items">{sel.map((i) => <div key={i.id} className="sw-it"><span><b>{i.name}</b><span>{i.business}</span></span><b>{money(i.price, cur)}</b></div>)}</div>
          <div className="totl"><span>{T("dfTot")}</span><b>{money(full, cur)}</b></div>
          <div className="secure"><CreditCard />{ap.label}</div>
        </>
      );
      btn = T("dfBtn"); cls = "or";
    } else if (S === 3) {
      // Keine Vorauszahlung mehr (10/2026): ohne hinterlegte Zahlungsart → einmal hinterlegen, dann starten wir; abgebucht erst bei Erfolg.
      const dl = f.pre ? Math.min(...sel.map((i) => (i.dl ? new Date(i.dl).getTime() : Infinity))) : Infinity;
      body = (
        <>
          <div className="fl-k">{T("swPmK")}</div>
          <h2>{T("swPmH")}</h2>
          <p>{T("swPmP")}{it.length - n ? " · " + T("declinedN", { n: it.length - n }) : ""}</p>
          {Number.isFinite(dl) ? <Countdown to={dl} /> : null}
          <div className="sw-items">{sel.map((i) => <div key={i.id} className="sw-it"><span><b>{i.name}</b><span>{i.business}</span></span><b>{money(i.price, cur)}</b></div>)}</div>
          <div className="totl"><span>{T("dfTot")}</span><b>{money(full, cur)}</b></div>
          <div className="secure"><Lock />{T("pgSafe")}</div>
        </>
      );
      btn = T("swPmBtn"); cls = "or";
    }
    if (S === 4) {
      const paid = f.mode === "paid", waiting = f.mode === "waiting";
      body = (
        <>
          <div className="fl-art"><img src={IMG.rocket} alt="" /></div>
          <h2>{f.mode === "declined" ? T("f4hDeclined") : f.mode === "approved" ? T("dfDoneH") : paid ? T("f4hPaid") : T("f4hWait")}</h2>
          <p>{f.mode === "declined" ? T("f4pDeclined") : f.mode === "approved" ? T("dfDoneP", { amount: money(full, cur) }) : paid ? T("f4pPaid", { amount: money(dep, cur), n }) : T("f4pWait")}</p>
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
          {S > 0 && S < 4 && !f.pre ? <button className="bk" onClick={() => setFlow({ ...f, step: S - 1 })} aria-label="Back"><ArrowLeft /></button> : null}
          <button className={"cta " + cls} disabled={busy === "flow"} onClick={flowNext}>{busy === "flow" ? <Loader className="spin" /> : S === 3 ? (ap ? <Check /> : <Lock />) : null}{btn}</button>
        </div>
      </div>
    );
  };

  const TABS = [["home", Home, T("tabHome")], ["orders", List, T("tabOrders")], ["pay", Wallet, T("tabPay")], ["acc", User, T("tabAcc")]];
  const adminView = imp || (data && data.adminView);
  return (
    <div className={"rra" + (adminView ? " impv" : "") + (intro ? " intro" : "")}>
      {adminView ? <div className="impbar"><span><b>Admin-Ansicht</b> · {data.name || data.email} · nicht getrackt</span><button type="button" onClick={endAdminView}>Beenden</button></div> : null}
      <div className="app">
        <main className="screen" ref={mainRef}>
          <div className="tabin" key={tab}>{tab === "home" ? HomeV() : tab === "orders" ? OrdersV() : tab === "pay" ? PayV() : AccV()}</div>
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
      <div className={"dbg" + (billOpen ? " show" : "")} onClick={() => setBillOpen(false)} />
      <section className={"push" + (billOpen ? " show" : "")} aria-hidden={!billOpen}>{billOpen ? BillingV() : null}</section>

      <div className={"bg" + (sheetData ? " show" : "")} onClick={() => setSheet(null)} />
      <div ref={rvRef} className={"rv-sheet" + (sheetData ? " show" : "")} aria-hidden={!sheetData}>
        {sheetData ? (() => {
          const { o, r } = sheetData; const st = stOf(r.status, r.pre); const isSw = r.status === "software";
          return (
            <>
              <div className="grab" />
              <h3>{r.name || T("googleReview")}</h3>
              <div className="meta">{o.business} · #{o.id}</div>
              <div className="q">{r.text ? "“" + r.text + "”" : <i>{T("noText")}</i>}</div>
              <div className="why"><span className={"ico " + st.ico}><st.I /></span><span><b>{statusLine(r, o.cur)}</b><span>{st.why}</span></span></div>
              {isSw ? <button className="cta or" onClick={openFlow}>{T(r.pre ? "payNow" : "showProblem")}<ArrowRight /></button> : null}
              {r.url ? <a className={"cta" + (isSw ? " gh" : "")} href={r.url} target="_blank" rel="noopener noreferrer"><ExternalLink />{T("openGoogle")}</a>
                : <button className={"cta" + (isSw ? " gh" : "")} onClick={() => setSheet(null)}>{T("close")}</button>}
            </>
          );
        })() : null}
      </div>

      <section className={"flow" + (flow ? " show" : "")} aria-hidden={!flow} onClick={(e) => { if (e.target === e.currentTarget) { setFlow(null); load(token); } }}>{FlowV()}</section>

      <StartFlow order={sfOrder} autopay={data.autopay} token={token} imp={!!adminView} showToast={showToast} zero={pgZero} apStart={apStart} apBusy={busy === "ap"}
        reload={() => load(token)} onClose={() => { setSfId(null); setPostOrder(false); load(token); }} />
      <NewOrderFlow open={noOpen} presetQ={noQ} token={token} imp={!!adminView} autopay={data.autopay} showToast={showToast} onClose={() => setNoOpen(false)}
        onDone={async (id) => { setNoOpen(false); await load(token); if (id) setSfId(id); }} />
      <AddRevFlow order={arId ? orders.find((o) => o.id === arId) || null : null} token={token} imp={!!adminView} showToast={showToast} onClose={() => setArId(null)}
        onDone={async (start) => { const id = arId; setArId(null); await load(token); if (start) setSfId(id); }} />

      <ChangedSheet open={changedNew.length > 0 && !intro && !sheetData && !flow && !sfOrder && !cele && !wiseOpen && !detail} items={changedNew}
        onDone={() => chgDone()} onOpen={(r) => { chgDone(); setSheet({ orderId: r.o.id, key: r.key }); }} />
      <Celebrate data={cele} onClose={() => setCele(null)} T={T} />
      <PaySheet open={wiseOpen && !!sheetG} onClose={() => setWiseOpen(false)} T={T} via={sheetG?.via === "paypal" ? "paypal" : "wise"} amountNum={sheetG ? sheetG.amount : 0} regular={sheetG ? sheetG.regular : 0}
        fmt={(v) => money(v, payCur)} rows={wiseBank.map((l) => { const i = l.indexOf(":"); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ["", l]; })}
        ppUrl={ppUrlOf(sheetG)} ppHandle={PAYPAL_ME} wiseRef={sheetG ? sheetG.ref : ""} showToast={showToast} />

      <SupportChat token={token} T={T} lang={LANG} imp={!!adminView} showToast={showToast} open={chatOpen} setOpen={setChatOpen} hidden={wiseOpen || !!sheetData || !!flow || !!sfOrder || billOpen || !!arId || noOpen}
        onNewOrder={noOn && !adminView ? (q) => { setNoQ(q || ""); setNoOpen(true); } : undefined}
        sit={{ orders: orders.length, open: all.filter((r) => ["new", "working", "sw_accepted"].includes(r.status)).length, sw: sw.length, due: due.length, deposit: deposits.length, notpossible: all.some((r) => r.status === "notpossible") }} />

      <div className={"toast" + (toast ? " show" : "") + (toast && toast.bad ? " bad" : "")} role="status">{toast && toast.bad ? <AlertCircle /> : <CheckCircle2 />}{toast ? toast.m : ""}</div>
    </div>
  );
}
