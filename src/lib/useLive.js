"use client";
/* Live-Aktualisierung ohne App-Neustart: alle 4 s (nur sichtbar) ein winziges „/ping" ans Backend.
   Hat sich seit dem letzten Laden etwas geändert (neue Bestellung, Partner-Status, Zahlung …) → onChange().
   Beim Zurückkommen in die App (Home-Bildschirm, Tab-Wechsel) wird sofort geprüft. */
import React from "react";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const ping = () => fetch(OPS + "/ping", { cache: "no-store" }).then((r) => r.json()).then((j) => String(j.v || "")).catch(() => "");

export default function useLive(onChange, enabled = true, ms = 4000) {
  const cb = React.useRef(onChange);
  cb.current = onChange;
  React.useEffect(() => {
    if (!enabled || !OPS) return undefined;
    let seen = "", busy = false, off = false;
    const check = async (force) => {
      if (busy || off || document.visibilityState !== "visible") return;
      busy = true;
      try {
        const v = await ping();
        if (v && (force || (seen && v !== seen))) {
          await Promise.resolve(cb.current && cb.current());
          seen = (await ping()) || v; // eigene Änderungen beim Laden „schlucken"
        } else if (v) seen = v;
      } finally { busy = false; }
    };
    check(false);
    const iv = setInterval(() => check(false), ms);
    const vis = () => { if (document.visibilityState === "visible") check(true); };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("focus", vis);
    window.addEventListener("pageshow", vis);
    return () => { off = true; clearInterval(iv); document.removeEventListener("visibilitychange", vis); window.removeEventListener("focus", vis); window.removeEventListener("pageshow", vis); };
  }, [enabled, ms]);
}
