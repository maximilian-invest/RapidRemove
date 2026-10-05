"use client";
/* Partner-App: Push-Benachrichtigungen (neue Aufträge, Kunde hat bezahlt → starten) + Hinweis
   „Zum Home-Bildschirm hinzufügen" (auf dem iPhone kommt Push nur in der installierten App an).
   Eigener Service Worker /partner-sw.js mit Scope /partner (stört den Admin-Worker nicht). */
import React from "react";
import { Bell, BellRing, Share, PlusSquare, Loader } from "lucide-react";
import { OPS, BASE, call } from "./shared";

function urlB64ToUint8Array(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
const isIOS = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent || "");
const isStandalone = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; } };

export default function PartnerPush({ token, showToast }) {
  const [state, setState] = React.useState("idle"); // idle | on | busy | blocked | unsupported | install
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (isIOS() && !isStandalone()) { setState("install"); return; }
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setState("unsupported"); return; }
    if (Notification.permission === "denied") { setState("blocked"); return; }
    navigator.serviceWorker.getRegistration(`${BASE}/partner`).then((r) => (r ? r.pushManager.getSubscription() : null)).then((s) => { if (s) setState("on"); }).catch(() => {});
  }, []);

  const enable = async () => {
    if (state === "on" || state === "busy") return;
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.register(`${BASE}/partner-sw.js`, { scope: `${BASE}/partner` });
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "blocked" : "idle"); return; }
      const k = await fetch(OPS + "/push/vapid").then((r) => r.json());
      if (!k || !k.publicKey) throw new Error("not configured");
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(k.publicKey) });
      await call("push-subscribe", { t: token, sub: sub.toJSON ? sub.toJSON() : sub });
      setState("on");
      showToast && showToast("Notifications are on");
    } catch (e) {
      setState("idle");
      showToast && showToast("Could not turn on notifications: " + (e.message || e));
    }
  };

  if (state === "install") {
    return (
      <div className="how">
        <div className="er"><span className="ico"><BellRing /></span><span className="t"><b>Get notified about new orders</b><span>On iPhone, notifications only work from the home screen app.</span></span></div>
        <div className="er"><span className="ico"><Share /></span><span className="t"><b>1. Tap Share</b><span>The square with the arrow at the bottom of Safari.</span></span></div>
        <div className="er"><span className="ico"><PlusSquare /></span><span className="t"><b>2. Add to Home Screen</b><span>Then open “RR Partner” from your home screen and turn on notifications here.</span></span></div>
      </div>
    );
  }
  const label = state === "on" ? "Notifications are on" : state === "blocked" ? "Notifications blocked – allow them in your settings" : state === "unsupported" ? "Notifications not supported in this browser" : "Turn on notifications";
  return (
    <div style={{ marginTop: 14 }}>
      <button type="button" className={"cta" + (state === "on" || state === "blocked" || state === "unsupported" ? " gh" : "")} onClick={enable} disabled={state !== "idle"}>
        {state === "busy" ? <Loader /> : state === "on" ? <BellRing /> : <Bell />}{label}
      </button>
    </div>
  );
}
