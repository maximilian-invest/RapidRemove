/* „Weitermachen": speichert den Fortschritt im Wizard (geprüftes Profil + Schritt
   + alle Auswahlen + Kontaktdaten) lokal im Browser, damit Rückkehrer GENAU dort
   weitermachen, wo sie waren — nicht nur beim geprüften Profil, sondern auf dem
   richtigen Schritt mit denselben Eingaben. Wird nach abgeschickter Bestellung
   wieder gelöscht. */
const KEY = "rr_resume";
const MAX_AGE = 30 * 86400000; // 30 Tage gültig

/** Vollständigen Wizard-Stand speichern (braucht eine placeId = geprüftes Profil). */
export function saveWizardSnapshot(snap) {
  try {
    if (!snap || !snap.placeId) return;
    localStorage.setItem(KEY, JSON.stringify({ ...snap, ts: Date.now() }));
  } catch (e) {}
}

/** Vollständigen Wizard-Stand laden (oder null, wenn keiner/zu alt). */
export function loadWizardSnapshot() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null");
    if (o && o.placeId && (!o.ts || Date.now() - o.ts < MAX_AGE)) return o;
  } catch (e) {}
  return null;
}

/** Schlanke Info fürs CTA-Label (placeId + Name) — aus dem gespeicherten Stand. */
export function getResumeProfile() {
  const o = loadWizardSnapshot();
  return o ? { placeId: o.placeId, name: o.name || "" } : null;
}

export function clearResumeProfile() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}
