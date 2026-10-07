"use client";
/* Offene App (v. a. am iPhone-Home-Bildschirm) nach einem Deploy automatisch neu laden:
   beim Öffnen und beim Zurückkehren in die App /api/build prüfen (nie mitten in der Benutzung); anderer Build → reload. */
import React from "react";

const MINE = process.env.NEXT_PUBLIC_BUILD_ID || "";

export default function useAutoUpdate(enabled = true) {
  React.useEffect(() => {
    if (!enabled || !MINE || typeof window === "undefined") return;
    let busy = false;
    const check = async () => {
      if (busy || document.visibilityState !== "visible") return;
      busy = true;
      try {
        const r = await fetch("/api/build?t=" + Date.now(), { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j && j.id && j.id !== MINE) {
            const k = "rr_reload_" + j.id; // höchstens einmal pro neuem Build (keine Reload-Schleife)
            let done = false; try { done = sessionStorage.getItem(k) === "1"; sessionStorage.setItem(k, "1"); } catch (e) { /* */ }
            if (!done) window.location.reload();
          }
        }
      } catch (e) { /* offline – egal */ }
      busy = false;
    };
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    const t = setTimeout(check, 4000);
    return () => { clearTimeout(t); document.removeEventListener("visibilitychange", check); window.removeEventListener("focus", check); };
  }, [enabled]);
}
