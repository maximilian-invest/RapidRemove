/* Herkunfts-Attribution (First-Touch) — rein first-party, fürs interne Reporting.
 *
 * Erfasst beim ersten Besuch mit Signal (utm_*, gclid/gbraid/wbraid = Google Ads,
 * fbclid = Meta, msclkid = Microsoft, sonst Referrer) und hält es im localStorage.
 * Beim Bestellen wird es mitgeschickt (landet in orders.raw.attribution) und im
 * Admin als „Quelle" angezeigt (Google Ads / Affiliate / Direkt / …).
 */
const KEY = "rr_src";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "gbraid", "wbraid", "fbclid", "msclkid"];

/** Einmalig (first-touch) die Herkunft festhalten. Idempotent, überschreibt nicht. */
export function captureFirstTouch() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(KEY)) return; // First-Touch: bestehenden Wert behalten
    const sp = new URLSearchParams(window.location.search || "");
    const data = {};
    for (const p of PARAMS) { const v = sp.get(p); if (v) data[p] = String(v).slice(0, 200); }
    let refHost = "";
    try { if (document.referrer) refHost = new URL(document.referrer).hostname.replace(/^www\./, ""); } catch (e) { /* ignore */ }
    const self = (window.location.hostname || "").replace(/^www\./, "");
    if (refHost && refHost !== self) data.referrer = refHost;
    // Nur speichern, wenn es ein echtes Signal gibt – sonst bleibt es „direkt"
    // und ein späterer Besuch mit Signal kann noch zum First-Touch werden.
    if (Object.keys(data).length) {
      data.landing = (window.location.pathname || "").slice(0, 120);
      data.ts = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(data));
    }
  } catch (e) { /* localStorage blockiert → ignorieren */ }
}

/** Gespeicherte Attribution lesen (oder {}). */
export function readAttribution() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
}

const cap = (s) => { s = String(s || ""); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };

/** Leitet aus orders.raw (+ Affiliate) eine lesbare Quelle ab: { kind, label }. */
export function deriveSource(raw) {
  const r = raw || {};
  const a = r.attribution || {};
  if (r.affiliate || r.fprRef) return { kind: "affiliate", label: "Affiliate" };
  const us = (a.utm_source || "").toLowerCase();
  const um = (a.utm_medium || "").toLowerCase();
  const paid = ["cpc", "ppc", "paid", "paidsearch", "sea"].includes(um);
  if (a.gclid || a.gbraid || a.wbraid || (us.includes("google") && paid)) return { kind: "google_ads", label: "Google Ads" };
  if (a.msclkid || (us.includes("bing") && paid)) return { kind: "ms_ads", label: "Microsoft Ads" };
  if (a.fbclid || us.includes("facebook") || us.includes("instagram") || us.includes("meta")) return { kind: "meta_ads", label: "Meta Ads" };
  if (a.utm_source) return { kind: "utm", label: cap(a.utm_source) + (a.utm_medium ? " / " + a.utm_medium : "") };
  const ref = (a.referrer || "").toLowerCase();
  if (ref) {
    if (ref.includes("google.")) return { kind: "organic", label: "Google (organisch)" };
    if (/(bing|duckduckgo|ecosia|yahoo|qwant)\./.test(ref)) return { kind: "organic", label: "Suchmaschine (organisch)" };
    return { kind: "referral", label: "Verweis: " + a.referrer };
  }
  return { kind: "direct", label: "Direkt" };
}
