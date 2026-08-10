/* RapidRemove — Meta-Pixel (Datensatz 1985417835506997).
 *
 * Kapselt alles rund um fbq. NICHTS anderes im Projekt spricht direkt mit
 * window.fbq — wer ein Event braucht, ruft track() / trackPageView() /
 * trackContact() hier auf.
 *
 * Einwilligung: fail-closed. Ohne ausdrückliche Zustimmung wird fbevents.js
 * gar nicht erst geladen und jedes Event läuft still ins Leere. Ein
 * falsch-negatives Tracking kostet Daten, ein falsch-positives ein Bußgeld.
 *
 * NIEMALS mitgeben: Firmenname, E-Mail, Telefon, Adresse, Kundennummer —
 * auch nicht gehasht. Bei einem Einzelunternehmer ist der Firmenname ein
 * Personenbezug, und zusammen mit dem Ereignis „will sein Google-Profil
 * löschen lassen" ist das genau die Information, die unsere Kunden ganz
 * sicher nicht bei Meta hinterlegt haben wollen. Advanced Matching bleibt aus.
 */

export const META_PIXEL_ID = "1985417835506997";

/* Der Consent liegt in localStorage["rr_consent"] und wird ausschließlich von
   <Consent /> geschrieben — dort sind exakt zwei Werte möglich: "granted" und
   "denied" (siehe components/Consent.jsx). Alles andere gilt als Ablehnung. */
const CONSENT_KEY = "rr_consent";
const GRANTED_VALUES = ["granted"];

let initialised = false;

export function hasMarketingConsent() {
  if (typeof window === "undefined") return false;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return !!v && GRANTED_VALUES.indexOf(v.trim().toLowerCase()) !== -1;
  } catch (e) {
    return false; // localStorage gesperrt (Safari Private Mode o. ä.)
  }
}

/* Lädt fbevents.js und feuert den ersten PageView. Mehrfachaufruf ist
   unschädlich. Rückgabe: true, wenn JETZT initialisiert wurde (und damit auch
   der erste PageView gezählt ist) — daran erkennt <MetaPixel />, dass es für
   diese Seite keinen zweiten PageView mehr schicken darf. */
export function initMetaPixel() {
  if (initialised || typeof window === "undefined") return false;
  if (!hasMarketingConsent()) return false;
  initialised = true;
  try {
    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    if (!window.fbq) return false;
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
    return true;
  } catch (e) {
    // Ein Marketing-Skript darf die Seite unter keinen Umständen zerlegen.
    return false;
  }
}

function eventId() {
  return typeof crypto !== "undefined" && crypto && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Date.now() + "-" + Math.random().toString(36).slice(2);
}

/** Standard-Event. Läuft still ins Leere, wenn keine Einwilligung vorliegt. */
export function track(event, params) {
  if (typeof window === "undefined" || !hasMarketingConsent()) return false;
  initMetaPixel();
  if (!window.fbq) return false;
  window.fbq("track", event, params || {}, { eventID: eventId() });
  return true;
}

export function trackPageView() {
  if (typeof window === "undefined" || !hasMarketingConsent()) return false;
  // Beim allerersten Aufruf feuert initMetaPixel() den PageView bereits selbst.
  if (initMetaPixel()) return true;
  if (!window.fbq) return false;
  window.fbq("track", "PageView");
  return true;
}

/** Klick auf einen direkten Kontaktweg. channel: "whatsapp" | "phone" | "chat". */
export function trackContact(channel) {
  return track("Contact", { content_category: channel });
}
