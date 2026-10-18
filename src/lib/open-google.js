/* Google-Bewertungslinks (/maps/reviews/…, /maps/contrib/…) öffnen.
   iPhone/iPad: Solche Links springen per Universal Link in die Google-Maps-App – die kann sie nicht anzeigen
   („Nicht unterstützter Link"). Deshalb dort erzwungen in Safari öffnen (x-safari-https://, ab iOS 17).
   Klappt das nicht (Seite bleibt sichtbar), wird der Link kopiert und onFallback aufgerufen. */
export function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1);
}

const MAPS_ONLY = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/(reviews|contrib)\//i;
// Kurzlinks (maps.app.goo.gl, share.google, goo.gl/maps, g.co) springen auf dem iPhone ebenfalls in die Maps-App → auch in Safari öffnen.
const SHORT = /^https:\/\/(maps\.app\.goo\.gl|share\.google|goo\.gl\/maps|g\.co\/kgs)\//i;

export function needsSafari(url) {
  const u = String(url || "").replace(/^http:/i, "https:");
  return isIOS() && (MAPS_ONLY.test(u) || SHORT.test(u));
}

export function openGoogleLink(url, onFallback) {
  if (!url) return;
  const u = String(url).replace(/^http:/i, "https:");
  if (!needsSafari(u)) { window.open(u, "_blank", "noopener,noreferrer"); return; }
  let left = false;
  const onHide = () => { if (document.visibilityState === "hidden") left = true; };
  document.addEventListener("visibilitychange", onHide);
  try { window.location.href = "x-safari-" + u; } catch (e) { /* */ }
  setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    if (left || document.visibilityState === "hidden") return;
    try { navigator.clipboard && navigator.clipboard.writeText(u); } catch (e) { /* */ }
    if (onFallback) onFallback(u);
  }, 1500);
}
