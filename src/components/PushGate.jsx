"use client";
/* „Benachrichtigungen einschalten" – Vollbild nach dem Öffnen (Kunde + Partner), solange Push nicht an ist.
   „Nicht jetzt" blendet nur für diese Sitzung aus → beim nächsten Öffnen kommt es wieder.
   iPhone im Browser: Push geht nur aus der App am Home-Bildschirm → dort die 2 Schritte. */
import React from "react";
import { BellRing, Share, PlusSquare, Loader } from "lucide-react";
import "@/styles/dashboard.css";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const CFG = {
  partner: { sw: `${BASE}/partner-sw.js`, scope: `${BASE}/partner`, sub: "/partner/push-subscribe", tokenKey: "t" },
  customer: { sw: `${BASE}/cust-sw.js`, scope: `${BASE}/my-reviews`, sub: "/cust/push-subscribe", tokenKey: "token" },
};
const ua = () => (typeof navigator !== "undefined" ? navigator.userAgent || "" : "");
const isIOS = () => /iphone|ipad|ipod/i.test(ua()) || (/macintosh/i.test(ua()) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);
const isStandalone = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; } };
const supported = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const skipKey = (role) => "rr_push_skip_" + role;
function b64(b) {
  const pad = "=".repeat((4 - (b.length % 4)) % 4);
  const raw = atob((b + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Zustand: "on" | "ask" | "install" | "blocked" | "none" (nicht möglich / diese Sitzung übersprungen). */
export async function pushState(role) {
  if (typeof window === "undefined") return "none";
  try { if (sessionStorage.getItem(skipKey(role))) return "none"; } catch (e) { /* */ }
  if (isIOS() && !isStandalone()) return "install";
  if (!supported()) return "none";
  const c = CFG[role];
  const reg = await navigator.serviceWorker.getRegistration(c.scope).catch(() => null);
  const sub = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
  if (sub && Notification.permission === "granted") return "on";
  if (Notification.permission === "denied") return "blocked";
  return "ask";
}

/** Abo anlegen + am Server speichern. silent = ohne Nachfrage (Erlaubnis liegt schon vor). */
export async function enablePush(role, token, silent) {
  const c = CFG[role];
  const reg = await navigator.serviceWorker.register(c.sw, { scope: c.scope });
  if (!silent) {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return perm;
  }
  const k = await fetch(OPS + "/push/vapid").then((r) => r.json());
  if (!k || !k.publicKey) throw new Error("push not configured");
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(k.publicKey) });
  const r = await fetch(OPS + c.sub, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [c.tokenKey]: token, sub: sub.toJSON ? sub.toJSON() : sub }) });
  if (!r.ok) throw new Error("save");
  return "granted";
}

const EN = {
  pushTitle: "Turn on notifications", pushSub: "Get notified the moment something changes – no need to check your inbox.",
  pushBtn: "Turn on notifications", notNow: "Not now", pushBlocked: "Notifications are blocked – allow them in your phone’s settings.",
  pushIosHint: "On iPhone, notifications only work from the app on your home screen:",
  appIos1t: "1. Tap Share", appIos1s: "The square with the arrow in Safari", appIos2t: "2. “Add to Home Screen”", appIos2s: "Then open the app from your home screen", genericErr: "Something went wrong – please try again.",
};

/** Vollbild-Aufforderung. state aus pushState(); onDone(on:boolean). T optional (Kunde übersetzt). */
export default function PushGate({ role, token, state, onDone, T, texts }) {
  const t = (k) => (texts && texts[k]) || (T ? T(k) : EN[k]) || EN[k] || k;
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const skip = () => { try { sessionStorage.setItem(skipKey(role), "1"); } catch (e) { /* */ } onDone(false); };
  const go = async () => {
    setBusy(true); setErr("");
    try {
      const r = await enablePush(role, token, false);
      if (r === "granted") { onDone(true); return; }
      setErr(t("pushBlocked"));
    } catch (e) { setErr(t("genericErr")); }
    setBusy(false);
  };
  const row = (I, a, b) => (
    <div style={{ display: "flex", gap: 14, alignItems: "center", textAlign: "left" }}>
      <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--g1)", display: "grid", placeItems: "center", flex: "none" }}><I size={20} /></span>
      <span><b style={{ display: "block" }}>{a}</b><span style={{ fontSize: 14, color: "var(--g3)" }}>{b}</span></span>
    </div>
  );
  return (
    <div className="rra">
      <div className="lg-wrap">
        <div className="lg">
          <div style={{ width: 96, height: 96, borderRadius: 28, background: "var(--g1)", display: "grid", placeItems: "center", marginBottom: 4 }}>
            <BellRing style={{ width: 48, height: 48, strokeWidth: 1.8 }} />
          </div>
          <div>
            <h1>{t("pushTitle")}</h1>
            <p>{state === "install" ? t("pushIosHint") : state === "blocked" ? t("pushBlocked") : t("pushSub")}</p>
          </div>
          {state === "install" ? (
            <div style={{ display: "grid", gap: 14 }}>
              {row(Share, t("appIos1t"), t("appIos1s"))}
              {row(PlusSquare, t("appIos2t"), t("appIos2s"))}
            </div>
          ) : state === "ask" ? (
            <>
              {err ? <div className="note bad">{err}</div> : null}
              <button className="cta" disabled={busy} onClick={go}>{busy ? <Loader className="spin" /> : <BellRing />}{t("pushBtn")}</button>
            </>
          ) : null}
          <button type="button" className="lnk" onClick={skip}>{t("notNow")}</button>
        </div>
      </div>
    </div>
  );
}
