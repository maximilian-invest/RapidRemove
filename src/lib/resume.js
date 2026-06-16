/* „Weitermachen": merkt sich das zuletzt im Wizard GEPRÜFTE Profil (placeId +
   Name) lokal im Browser. Damit zeigt der Haupt-CTA für Rückkehrer
   „Weitermachen"/„Mit Löschung fortfahren" statt „Gratis-Check" und führt
   direkt zurück ins geprüfte Profil. */
const KEY = "rr_resume";
const MAX_AGE = 30 * 86400000; // 30 Tage gültig

export function setResumeProfile(p) {
  try {
    if (!p || !p.placeId) return;
    localStorage.setItem(KEY, JSON.stringify({ placeId: String(p.placeId), name: String(p.name || ""), ts: Date.now() }));
  } catch (e) {}
}

export function getResumeProfile() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null");
    if (o && o.placeId && (!o.ts || Date.now() - o.ts < MAX_AGE)) return { placeId: o.placeId, name: o.name || "" };
  } catch (e) {}
  return null;
}

export function clearResumeProfile() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}
