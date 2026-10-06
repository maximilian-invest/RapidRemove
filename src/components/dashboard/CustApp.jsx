"use client";
/* Kunden-App: nur am Handy.
   1) Im Browser → Karte „Zum Home-Bildschirm" (Android: Installations-Dialog, iPhone: 2 kurze Schritte).
   2) In der App vom Home-Bildschirm → „Benachrichtigungen einschalten" (Web-Push, Scope /my-reviews).
   Das Manifest bekommt einen persönlichen Login-Code, damit die App gleich eingeloggt startet. */
import React from "react";
import { BellRing, Share, PlusSquare, X, Loader, Smartphone } from "lucide-react";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const HIDE_KEY = "rr_cust_app_hide";
const ua = () => (typeof navigator !== "undefined" ? navigator.userAgent || "" : "");
const isIOS = () => /iphone|ipad|ipod/i.test(ua()) || (/macintosh/i.test(ua()) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);
const isMobile = () => isIOS() || /android/i.test(ua());
const isStandalone = () => { try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; } catch (e) { return false; } };
const pushOk = () => typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const hiddenUntil = () => { try { return Number(localStorage.getItem(HIDE_KEY) || 0); } catch (e) { return 0; } };
function b64(b) {
  const pad = "=".repeat((4 - (b.length % 4)) % 4);
  const raw = atob((b + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
async function post(path, body) {
  const r = await fetch(OPS + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.ok) throw new Error(j.error || "HTTP " + r.status);
  return j;
}

/** Handy im Browser: Manifest mit persönlichem Start-Link + iOS-Meta (einmal je Seitenaufruf). */
export function injectAppManifest(token, lang) {
  if (typeof document === "undefined" || !token || !isMobile() || isStandalone()) return;
  if (!document.querySelector('link[rel="manifest"]')) {
    const add = (k) => { const l = document.createElement("link"); l.rel = "manifest"; l.href = "/api/app-manifest" + (k ? "?k=" + encodeURIComponent(k) : ""); document.head.appendChild(l); };
    post("/cust/app-link", { token, lang }).then((r) => add(r.k)).catch(() => add(""));
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    for (const [n, c] of [["apple-mobile-web-app-capable", "yes"], ["apple-mobile-web-app-title", "RapidRemove"], ["mobile-web-app-capable", "yes"]]) {
      const m = document.createElement("meta"); m.name = n; m.content = c; document.head.appendChild(m);
    }
    const ic = document.createElement("link"); ic.rel = "apple-touch-icon"; ic.href = "/assets/app-icon-180.png"; document.head.appendChild(ic);
  }
}

let deferred = null; // Android: beforeinstallprompt
if (typeof window !== "undefined") window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; });

export default function CustApp({ token, lang, T, showToast }) {
  const [mode, setMode] = React.useState(null); // null | install | push | busy
  const [steps, setSteps] = React.useState(false);

  React.useEffect(() => {
    if (!token || !isMobile()) return;
    if (isStandalone()) {
      if (!pushOk() || Notification.permission === "denied") return;
      navigator.serviceWorker.getRegistration("/my-reviews").then((r) => (r ? r.pushManager.getSubscription() : null))
        .then((s) => {
          if (s) return; // schon an
          if (Notification.permission === "granted") void subscribe(true); // erlaubt, aber noch nicht gespeichert
          else setMode("push");
        }).catch(() => setMode("push"));
      return;
    }
    if (hiddenUntil() > Date.now()) return;
    // Push im Browser schon an (Android/Desktop) → keine Karte.
    const show = () => setMode("install");
    if (pushOk() && Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration("/my-reviews").then((r) => (r ? r.pushManager.getSubscription() : null)).then((sb) => { if (!sb) show(); }).catch(show);
    } else show();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function subscribe(silent) {
    setMode("busy");
    try {
      const reg = await navigator.serviceWorker.register("/cust-sw.js", { scope: "/my-reviews" });
      if (!silent) {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") { setMode(null); if (perm === "denied") showToast(T("pushBlocked"), true); return; }
      }
      const k = await fetch(OPS + "/push/vapid").then((r) => r.json());
      if (!k || !k.publicKey) throw new Error("push");
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(k.publicKey) });
      await post("/cust/push-subscribe", { token, sub: sub.toJSON ? sub.toJSON() : sub });
      setMode(null);
      if (!silent) showToast(T("pushOn"));
    } catch (e) {
      setMode(silent ? null : "push");
      if (!silent) showToast(T("genericErr"), true);
    }
  }

  const hide = () => { try { localStorage.setItem(HIDE_KEY, String(Date.now() + 14 * 864e5)); } catch (e) { /* */ } setMode(null); };
  const install = async () => {
    if (deferred) { try { deferred.prompt(); await deferred.userChoice; } catch (e) { /* */ } deferred = null; setMode(null); return; }
    setSteps(true);
  };

  if (!mode) return null;
  const card = { flexDirection: "column", alignItems: "stretch", gap: 12, marginBottom: 24 };
  const ico = { background: "#fff" };
  if (mode === "push" || mode === "busy") {
    return (
      <div className="paycard" style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="ico" style={ico}><BellRing /></span>
          <span style={{ minWidth: 0 }}><b>{T("pushTitle")}</b><span style={{ fontSize: 13, color: "var(--g3)", display: "block" }}>{T("pushSub")}</span></span>
        </div>
        <button className="cta" style={{ height: 48, fontSize: 15 }} disabled={mode === "busy"} onClick={() => subscribe(false)}>
          {mode === "busy" ? <Loader className="spin" /> : null}{T("pushBtn")}
        </button>
      </div>
    );
  }
  return (
    <div className="paycard" style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="ico" style={ico}><Smartphone /></span>
        <span style={{ minWidth: 0, flex: 1 }}><b>{T("appTitle")}</b><span style={{ fontSize: 13, color: "var(--g3)", display: "block" }}>{T("appSub")}</span></span>
        <button onClick={hide} aria-label={T("close")} style={{ alignSelf: "flex-start", color: "var(--g3)", width: 32, height: 32, display: "grid", placeItems: "center" }}><X size={18} /></button>
      </div>
      {steps ? (
        isIOS() ? (
          <div style={{ display: "grid", gap: 10, fontSize: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="ico" style={{ ...ico, width: 36, height: 36 }}><Share size={18} /></span><span><b>{T("appIos1t")}</b><span style={{ fontSize: 13, color: "var(--g3)", display: "block" }}>{T("appIos1s")}</span></span></div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="ico" style={{ ...ico, width: 36, height: 36 }}><PlusSquare size={18} /></span><span><b>{T("appIos2t")}</b><span style={{ fontSize: 13, color: "var(--g3)", display: "block" }}>{T("appIos2s")}</span></span></div>
          </div>
        ) : <div style={{ fontSize: 14 }}>{T("appAndroid")}</div>
      ) : (
        <button className="cta" style={{ height: 48, fontSize: 15 }} onClick={install}>{T("appBtn")}</button>
      )}
    </div>
  );
}
