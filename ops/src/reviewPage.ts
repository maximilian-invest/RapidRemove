/* Erkennung „Bewertung gelöscht / noch sichtbar" auf einer Google-Bewertungsseite – reine Funktionen (Browser + ScreenshotOne + Tests). */
export const GONE = /(this review is no longer available|review is no longer available|diese rezension ist nicht mehr verfügbar|rezension ist nicht mehr verfügbar|unsupported link|link not supported|link wird nicht unterstützt|nicht unterstützter link)/i;

export const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* 14.10.2026: „noch sichtbar" auch OHNE Verfassernamen erkennen (viele Aufgaben haben keinen Namen).
 * Google zeigt eine sichtbare Bewertung als Element mit „data-review-id" + Sterne-Bild (role=img, aria-label „1 star"/„1 Stern"…).
 * Gelöschte Bewertung: „This review is no longer available" und KEIN Bewertungs-Element. Profil-/Verfasser-Seiten ohne die
 * Bewertung (z. B. /maps/contrib/…) haben weder das eine noch das andere → „unknown" (nie „gone").
 * „gone" bleibt ausschließlich am ausdrücklichen Google-Text hängen – daran ändert sich nichts. */
export type Snap = { text: string; reviewIds: string[]; stars: boolean };
/** Läuft IM Browser. Bewusst als Text (nicht als Funktion): tsx/esbuild fügt sonst Hilfsfunktionen ein, die es im Browser nicht gibt. */
export const PAGE_SNAPSHOT = `(() => {
  const text = document.body ? document.body.innerText : "";
  const reviewIds = Array.from(document.querySelectorAll("[data-review-id]")).map((e) => e.getAttribute("data-review-id") || "").filter(Boolean);
  const stars = Array.from(document.querySelectorAll('[role="img"][aria-label]')).some((e) => /^\\s*[1-5]([.,]\\d)?\\s*\\S/.test(e.getAttribute("aria-label") || ""));
  return { text, reviewIds: Array.from(new Set(reviewIds)), stars };
})()`;
/** Review-ID aus einem (langen) Google-Bewertungslink. */
export function reviewIdOf(url: string): string {
  const dec = (() => { try { return decodeURIComponent(url); } catch { return url; } })();
  return (dec.match(/!1s(C[A-Za-z0-9_-]{16,})/) || [])[1] || "";
}
/** Entscheidung aus dem Seiten-Schnappschuss (getestet in linkProbe.test.ts). */
export function classify(s: Snap | null, nameNorm: string, wantId: string): "gone" | "visible" | "unknown" {
  if (!s) return "unknown";
  const hasCard = s.reviewIds.length > 0;
  if (GONE.test(s.text) && !hasCard) return "gone";
  if (GONE.test(s.text)) return "unknown"; // widersprüchlich (Hinweis UND Bewertung) → nie „gone"
  if (wantId && s.reviewIds.includes(wantId)) return "visible";          // genau diese Bewertung wird angezeigt
  // 18.10.2026 (RV-0154): Link enthält eine Review-ID, angezeigt werden aber nur ANDERE Bewertungen (gelöschte Bewertung →
  // Google zeigt Profil/Verfasser mit fremden Bewertungen) → das ist KEIN Beweis für „sichtbar".
  if (hasCard && s.stars && !wantId) return "visible";                     // eine Bewertung mit Sternen wird angezeigt (Link ohne Review-ID)
  if (nameNorm.length >= 3 && norm(s.text).includes(nameNorm)) return "visible"; // Verfassername auf der Seite (wie bisher)
  return "unknown";
}


/** Dieselbe Erkennung auf fertigem HTML (ScreenshotOne format=html – zweiter, unabhängiger Browser). */
export function snapFromHtml(html: string): Snap {
  const h = String(html || "");
  const reviewIds = Array.from(new Set(Array.from(h.matchAll(/data-review-id="([^"]+)"/g)).map((m) => m[1])));
  const stars = Array.from(h.matchAll(/<[a-z]+\b[^>]*>/gi)).some((m) => /\brole="img"/.test(m[0]) && /\baria-label="\s*[1-5]([.,]\d)?\s*[^"\s]/.test(m[0]));
  const text = h.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/\s+/g, " ");
  return { text, reviewIds, stars };
}
