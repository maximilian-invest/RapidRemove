/* Dashboard-Aktivität (Kunden-Dashboard → ops /cust/track).
   Erfasst Seitenaufrufe und JEDEN Klick; Versand gesammelt alle 10 s und beim Verlassen/Verstecken
   (sendBeacon, text/plain → kein CORS-Preflight). Sitzung = Tab-Sitzung; beim Ende wird die Dauer gemeldet. */
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
let token = "";
let sid = "";
let queue = [];
let timer = null;
let started = 0;
let lastAct = 0;
let ended = false;
let wired = false;
let lastView = "";

const send = (beacon) => {
  if (!OPS || !token || !queue.length) return;
  const body = JSON.stringify({ token, sid, events: queue.splice(0, 100) });
  try {
    if (beacon && navigator.sendBeacon && navigator.sendBeacon(OPS + "/cust/track", new Blob([body], { type: "text/plain" }))) return;
  } catch (e) { /* weiter mit fetch */ }
  try { fetch(OPS + "/cust/track", { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {}); } catch (e) { /* egal */ }
};
export function flush(beacon) { clearTimeout(timer); timer = null; send(beacon); }

export function track(type, target, meta, orderId) {
  if (!token) return;
  lastAct = Date.now();
  queue.push({ type, target: target ? String(target).slice(0, 200) : "", meta: meta || undefined, orderId: orderId || undefined, ts: Date.now() });
  if (queue.length >= 40) flush(false);
  else if (!timer) timer = setTimeout(() => flush(false), 10000);
}
/** Seitenaufruf (doppelte direkt hintereinander werden ignoriert). */
export function view(name, orderId) {
  if (!name || name === lastView) return;
  lastView = name;
  track("page_view", name, null, orderId);
}

const labelOf = (el) => {
  const t = el.getAttribute("data-track") || el.getAttribute("aria-label") || el.getAttribute("title") || (el.textContent || "").replace(/\s+/g, " ").trim();
  return t.slice(0, 80) || el.tagName.toLowerCase();
};
const endSession = () => {
  if (!token || ended || !started) return;
  ended = true;
  const sec = Math.round(((lastAct || Date.now()) - started) / 1000);
  track("session_end", `Sitzung ${sec < 60 ? sec + " s" : Math.round(sec / 60) + " Min."}`, { sec });
  flush(true);
};

/** Start nach dem Login bzw. beim Öffnen mit gespeicherter Sitzung. */
export function startTracking(t, info) {
  if (!t || !OPS) return;
  const fresh = token !== t;
  token = t;
  if (!sid) {
    try { sid = sessionStorage.getItem("rr_dash_sid") || ""; } catch (e) { /* */ }
    if (!sid) { sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { sessionStorage.setItem("rr_dash_sid", sid); } catch (e) { /* */ } }
  }
  if (fresh) { started = Date.now(); ended = false; lastView = ""; track("dash_open", info || ""); }
  if (wired) return;
  wired = true;
  // Jeder Klick auf Buttons/Links (bzw. Elemente mit data-track) im Dashboard
  document.addEventListener("click", (e) => {
    const el = e.target && e.target.closest ? e.target.closest("button, a, [role=button], [data-track], input[type=checkbox], label") : null;
    if (!el || !el.closest(".rra")) return;
    track("click", labelOf(el), el.tagName === "A" && el.href ? { href: String(el.href).slice(0, 160) } : null);
  }, true);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });
  window.addEventListener("pagehide", endSession);
}
export function stopTracking() { endSession(); token = ""; started = 0; }
