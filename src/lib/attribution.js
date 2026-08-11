/* Herkunfts-Attribution — rein first-party, fürs interne Reporting.
 *
 * Zwei Perspektiven, getrennt gehalten:
 *   First-Touch (rr_src)      — der erste Besuch mit Signal, unveränderlich.
 *   Last-Touch  (rr_src_last) — der Besuch, der die Anfrage ausgelöst hat.
 *
 * Warum getrennt: Vorher gab es nur den First-Touch, und der wurde beim ersten
 * Besuch mit Signal festgenagelt — für immer. Wer 2026-06 über eine Google-Suche
 * kam und Wochen später auf eine bezahlte Anzeige klickte, wurde weiterhin als
 * „organisch" gezählt. Die Werbeleistung landete beim falschen Kanal. Auf einer
 * Seite mit viel Wiederkehr-Traffic (organisch, Google Ads, Affiliate) betrifft
 * das einen großen Teil aller bezahlten Klicks.
 *
 * Vorrang bei der Erkennung: UTM-Parameter → Klick-IDs → Referrer → direkt.
 *
 * Regel für den Last-Touch:
 *   - Besuch MIT Kampagnenkennung (utm_source oder Klick-ID) überschreibt immer.
 *   - Besuch OHNE überschreibt einen vorhandenen Kampagnen-Last-Touch NICHT,
 *     solange dieser jünger als 30 Tage ist. So frisst ein späterer Direktaufruf
 *     die Zuordnung der Anzeige nicht auf, die den Besucher gebracht hat.
 *   - Sonst wird überschrieben (organisch/Verweis/direkt bleibt aktuell).
 */
const KEY = "rr_src";            // First-Touch (Bestand: bestehende Werte bleiben gültig)
const KEY_LAST = "rr_src_last";  // Last-Touch
const CAMPAIGN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const CLICK_IDS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid", "ttclid"];
const PARAMS = UTM.concat(CLICK_IDS);

/** Kampagnenkennung vorhanden? (utm_source ODER irgendeine Klick-ID) */
export function isCampaignTouch(t) {
  const a = t || {};
  if (a.utm_source) return true;
  return CLICK_IDS.some((k) => !!a[k]);
}

/** Den aktuellen Seitenaufruf als Touch-Objekt beschreiben. */
function currentTouch() {
  const data = {};
  try {
    const sp = new URLSearchParams(window.location.search || "");
    for (const p of PARAMS) { const v = sp.get(p); if (v) data[p] = String(v).slice(0, 200); }
    let refHost = "";
    try { if (document.referrer) refHost = new URL(document.referrer).hostname.replace(/^www\./, ""); } catch (e) { /* ignore */ }
    const self = (window.location.hostname || "").replace(/^www\./, "");
    if (refHost && refHost !== self) data.referrer = refHost;
    data.landing = (window.location.pathname || "").slice(0, 120);
    data.ts = new Date().toISOString();
  } catch (e) { /* ignore */ }
  return data;
}

const read = (k) => {
  try { return JSON.parse(localStorage.getItem(k) || "null") || null; } catch (e) { return null; }
};
const write = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* localStorage blockiert */ }
};

/** Hat der Touch überhaupt ein Signal (Kampagne oder Referrer)? Sonst: direkt. */
const hasSignal = (t) => isCampaignTouch(t) || !!(t && t.referrer);

/**
 * Bei JEDEM Seiteneintritt aufrufen. Setzt den First-Touch, sofern noch keiner
 * existiert, und schreibt den Last-Touch nach der Vorrangregel fort.
 */
export function captureTouch() {
  if (typeof window === "undefined") return;
  const touch = currentTouch();

  // First-Touch: nur beim ersten Besuch MIT Signal — und danach nie wieder.
  // Ohne die Signal-Bedingung würde ein direkter Erstaufruf den First-Touch
  // dauerhaft auf „direkt" nageln und jede spätere Quelle unsichtbar machen.
  if (!read(KEY) && hasSignal(touch)) write(KEY, touch);

  const prev = read(KEY_LAST);
  if (!prev) { write(KEY_LAST, touch); return; }
  if (isCampaignTouch(touch)) { write(KEY_LAST, touch); return; } // Kampagne gewinnt immer
  // Kein Kampagnen-Besuch: einen frischen Kampagnen-Last-Touch stehen lassen.
  if (isCampaignTouch(prev)) {
    const age = Date.now() - Date.parse(prev.ts || "");
    if (!(age >= 0) || age < CAMPAIGN_TTL_MS) return; // ungültiger/frischer Zeitstempel → behalten
  }
  write(KEY_LAST, touch);
}

/** Rückwärtskompatibel: der First-Touch. */
export function readAttribution() {
  if (typeof window === "undefined") return {};
  return read(KEY) || {};
}

/** Der Last-Touch — die Quelle, die für die Anfrage zählt. */
export function readLastTouch() {
  if (typeof window === "undefined") return {};
  // Bestandsbesucher haben nur rr_src; bis zum nächsten Eintritt gilt der als beides.
  return read(KEY_LAST) || read(KEY) || {};
}

/** Beide Perspektiven auf einmal. */
export function readTouches() {
  return { last: readLastTouch(), first: readAttribution() };
}

const cap = (s) => { s = String(s || ""); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };

/** Leitet aus orders.raw (+ Affiliate) eine lesbare Quelle ab: { kind, label }. */
export function deriveSource(raw) {
  const r = raw || {};
  const a = r.attribution || {};
  if (r.affiliate || r.fprRef) return { kind: "affiliate", label: "Affiliate" };
  const us = (a.utm_source || "").toLowerCase();
  const um = (a.utm_medium || "").toLowerCase();
  const paid = ["cpc", "ppc", "paid", "paidsearch", "sea", "paid_social", "social_paid"].includes(um);
  if (a.gclid || a.gbraid || a.wbraid || (us.includes("google") && paid)) return { kind: "google_ads", label: "Google Ads" };
  if (a.msclkid || (us.includes("bing") && paid)) return { kind: "ms_ads", label: "Microsoft Ads" };
  if (a.fbclid || us.includes("facebook") || us.includes("instagram") || us.includes("meta")) return { kind: "meta_ads", label: "Meta Ads" };
  if (a.ttclid || us.includes("tiktok")) return { kind: "tiktok_ads", label: "TikTok Ads" };
  if (a.utm_source) return { kind: "utm", label: cap(a.utm_source) + (a.utm_medium ? " / " + a.utm_medium : "") };
  const ref = (a.referrer || "").toLowerCase();
  if (ref) {
    if (ref.includes("google.")) return { kind: "organic", label: "Google (organisch)" };
    if (/(bing|duckduckgo|ecosia|yahoo|qwant)\./.test(ref)) return { kind: "organic", label: "Suchmaschine (organisch)" };
    return { kind: "referral", label: "Verweis: " + a.referrer };
  }
  return { kind: "direct", label: "Direkt" };
}

/** Die erste gefundene Klick-ID (Wert), fürs serverseitige Feld click_id. */
export function clickIdOf(t) {
  const a = t || {};
  for (const k of CLICK_IDS) if (a[k]) return k + ":" + a[k];
  return "";
}

/** Kompakte Herkunfts-Felder für die Übergabe ans ops-Backend. */
export function attributionPayload() {
  const { last, first } = readTouches();
  return {
    source: deriveSource({ attribution: last }).kind,
    sourceFirst: deriveSource({ attribution: first }).kind,
    utmSource: last.utm_source || "",
    utmMedium: last.utm_medium || "",
    utmCampaign: last.utm_campaign || "",
    utmContent: last.utm_content || "",
    clickId: clickIdOf(last),
    referrer: last.referrer || "",
    landing: last.landing || "",
    attribution: last,
    attributionFirst: first,
  };
}
