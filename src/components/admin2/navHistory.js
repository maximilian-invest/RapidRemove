"use client";
/* Browser-Zurück im Admin: Die Admin-Navigation (Tab, Unterseite, Auftrags-Stapel, Partner-Detail …) ist React-State.
   useHistState verhält sich wie useState, legt aber bei jeder Änderung einen Verlaufseintrag an (alle Ebenen als
   Schnappschuss in history.state.rrNav). Browser-Zurück/-Vor stellt den Schnappschuss wieder her, statt die Seite zu
   verlassen. Mehrere Änderungen im selben Klick werden zu EINEM Eintrag zusammengefasst.
   history.pushState wird von Next gepatcht und übernimmt dessen interne Felder (__NA, Baum) – Next bleibt auf /admin. */
import React from "react";

const snap = {};          // aktueller Stand aller registrierten Ebenen
const subs = new Set();   // Popstate-Empfänger der Hooks
let pending = null;       // "push" | "replace" – wird in einem Microtask geschrieben
let restoring = 0;        // > now: Komponenten, die gerade durch Zurück montieren, starten mit dem Verlaufsstand
let installed = false;

const stateNav = () => { try { return (window.history.state && window.history.state.rrNav) || null; } catch (e) { return null; } };
const same = (a, b) => { try { return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; } };

function flush() {
  const mode = pending; pending = null;
  if (!mode) return;
  const next = { ...snap };
  try {
    if (same(stateNav(), next)) return;
    const base = window.history.state && typeof window.history.state === "object" ? window.history.state : {};
    const data = { ...base, rrNav: next };
    if (mode === "replace") window.history.replaceState(data, "");
    else window.history.pushState(data, "");
  } catch (e) { /* Verlauf nicht verfügbar → nur In-App-Navigation */ }
}
function schedule(mode) {
  if (pending === "push") return;          // push gewinnt gegen replace
  pending = mode;
  Promise.resolve().then(flush);
}

function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  // Erst-Eintrag markieren, damit „Zurück“ bis hierher in der App bleibt
  try { const base = window.history.state && typeof window.history.state === "object" ? window.history.state : {}; window.history.replaceState({ ...base, rrNav: { ...snap } }, ""); } catch (e) { /* */ }
  window.addEventListener("popstate", (e) => {
    const nav = e.state && e.state.rrNav;
    if (!nav) return;
    restoring = Date.now() + 800;
    Object.keys(snap).forEach((k) => { if (!(k in nav)) delete snap[k]; });
    Object.assign(snap, nav);
    subs.forEach((fn) => fn(nav));
  });
}

/** Wie React.useState, aber mit Verlaufseintrag. setter(v, { replace: true }) ersetzt den aktuellen Eintrag
    (für automatische Korrekturen, damit kein Zurück-Loop entsteht). */
export function useHistState(key, init) {
  const initial = React.useMemo(() => {
    const nav = restoring > Date.now() ? stateNav() : null;
    if (nav && key in nav) return nav[key];
    return typeof init === "function" ? init() : init;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [val, setVal] = React.useState(initial);
  const ref = React.useRef(initial);
  const initRef = React.useRef(initial);

  React.useEffect(() => {
    snap[key] = ref.current;
    install();
    schedule("replace");
    const on = (nav) => {
      const v = key in nav ? nav[key] : initRef.current;
      ref.current = v; setVal(v);
    };
    subs.add(on);
    return () => { subs.delete(on); delete snap[key]; };
  }, [key]);

  const set = React.useCallback((u, opt) => {
    const v = typeof u === "function" ? u(ref.current) : u;
    if (same(v, ref.current)) return;
    ref.current = v; snap[key] = v;
    setVal(v);
    schedule(opt && opt.replace ? "replace" : "push");
  }, [key]);

  return [val, set];
}

/** Admin verlassen per Zurück (Seite einer anderen Website-Sektion): voll laden statt Next-Wiederherstellung –
    ein Sprung zwischen verschiedenen Root-Layouts kann sonst mit „Application error“ abstürzen. */
export function useHardLeave(prefix) {
  React.useEffect(() => {
    const on = (e) => {
      if (window.location.pathname.startsWith(prefix)) return;
      e.stopImmediatePropagation();
      window.location.reload();
    };
    window.addEventListener("popstate", on, true);
    return () => window.removeEventListener("popstate", on, true);
  }, [prefix]);
}
