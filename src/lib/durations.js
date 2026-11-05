import { REVIEWS_OTHER_PAUSED } from "./pricing";
/* Löschdauer Standard je Preisstufe (Admin → Einstellungen → Express & Löschdauer, 02.11.2026).
   fresh = 179er (bis 4 Wochen, mit Text) · other = 250er (alle anderen). unit "d" = Tage, "w" = Wochen.
   Texte tragen Platzhalter: {DF} = Dauer 179er, {DO} = Dauer 250er, {DA} = Spanne über beide (allgemeine Aussagen).
   Gleiche Logik im Backend: ops/src/durations.ts (Mails, Chatbot) — beide Dateien gemeinsam ändern. */

export const DUR_DEFAULT = Object.freeze({
  fresh: Object.freeze({ min: 1, max: 2, unit: "w" }),
  other: Object.freeze({ min: 1, max: 2, unit: "w" }),
});
export const DUR_MAX = 365;

const int = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : NaN; };
/** Eine Stufe prüfen. Ungültig → null. */
export function normTier(x) {
  if (!x || typeof x !== "object") return null;
  const unit = x.unit === "d" || x.unit === "w" ? x.unit : null;
  const min = int(x.min), max = int(x.max);
  if (!unit || !(min >= 1) || !(max >= min) || max > DUR_MAX) return null;
  return { min, max, unit };
}
/** Beide Stufen; fehlende/ungültige fallen auf den Standard zurück. */
export function normDur(x) {
  const o = x && typeof x === "object" ? x : {};
  return { fresh: normTier(o.fresh) || { ...DUR_DEFAULT.fresh }, other: normTier(o.other) || { ...DUR_DEFAULT.other } };
}
export const durKey = (d) => [d.fresh.min, d.fresh.max, d.fresh.unit, d.other.min, d.other.max, d.other.unit].join(".");
const toDays = (n, u) => (u === "w" ? n * 7 : n);
export const maxDays = (t) => toDays(t.max, t.unit);
/** Spanne über beide Stufen (für allgemeine Aussagen „meist …"). */
export function durAll(d) {
  const a = d.fresh, b = d.other;
  if (a.unit === b.unit) return { min: Math.min(a.min, b.min), max: Math.max(a.max, b.max), unit: a.unit };
  return { min: Math.min(toDays(a.min, a.unit), toDays(b.min, b.unit)), max: Math.max(toDays(a.max, a.unit), toDays(b.max, b.unit)), unit: "d" };
}

// [Einzahl, Mehrzahl] je Sprache und Einheit; de zusätzlich Dativ Mehrzahl („in 7–21 Tagen").
const UNITS = {
  de: { d: ["Tag", "Tage", "Tagen"], w: ["Woche", "Wochen", "Wochen"] },
  en: { d: ["day", "days"], w: ["week", "weeks"] },
  es: { d: ["día", "días"], w: ["semana", "semanas"] },
  fr: { d: ["jour", "jours"], w: ["semaine", "semaines"] },
  it: { d: ["giorno", "giorni"], w: ["settimana", "settimane"] },
  nl: { d: ["dag", "dagen"], w: ["week", "weken"] },
  pt: { d: ["dia", "dias"], w: ["semana", "semanas"] },
  ja: { d: ["日", "日"], w: ["週間", "週間"] },
  sv: { d: ["dag", "dagar"], w: ["vecka", "veckor"] },
  da: { d: ["dag", "dage"], w: ["uge", "uger"] },
  no: { d: ["dag", "dager"], w: ["uke", "uker"] },
};
/** „1–2 Wochen", „7–21 Tage", „1〜2週間", „5 days". dative = deutscher Dativ („in 7–21 Tagen"). */
export function fmtTier(t, lang, dative = false) {
  const L = UNITS[lang] ? lang : "en";
  const u = UNITS[L][t.unit] || UNITS[L].w;
  const one = t.min === t.max;
  const word = one && t.min === 1 ? u[0] : (dative && u[2]) || u[1];
  if (L === "ja") return (one ? String(t.min) : `${t.min}〜${t.max}`) + word;
  return (one ? String(t.min) : `${t.min}–${t.max}`) + " " + word;
}
const DATIVE_BEFORE = /(?:^|[\s(])(in|von|nach|binnen|seit|mit)\s$/i;
/** Platzhalter {DF} {DO} {DA} in einem Text ersetzen. */
export function fillDur(s, lang, dur) {
  if (typeof s !== "string" || s.indexOf("{D") < 0) return s;
  const d = dur || DUR_DEFAULT;
  // Pause 05.11.2026: ältere/textlose nicht bestellbar → allgemeine Spanne {DA} = Dauer der frischen Bewertungen.
  const T = { DF: d.fresh, DO: d.other, DA: REVIEWS_OTHER_PAUSED ? d.fresh : durAll(d) };
  // {DF:de} = feste Sprache (z. B. deutsche Wissensbasis in einem englischen Prompt).
  return s.replace(/\{(DF|DO|DA)(?::([a-z]{2}))?\}/g, (m, k, fl, off, all) => {
    const L = fl || lang;
    const dat = L === "de" && DATIVE_BEFORE.test(all.slice(Math.max(0, off - 12), off));
    return fmtTier(T[k], L, dat);
  });
}
/** Alle Texte (auch in Objekten/Arrays) füllen; Funktionen bleiben unverändert. */
export function fillDeep(v, lang, dur) {
  if (typeof v === "string") return fillDur(v, lang, dur);
  if (Array.isArray(v)) return v.map((x) => fillDeep(x, lang, dur));
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = fillDeep(v[k], lang, dur); return o; }
  return v;
}

// Aktueller Stand im Browser (wird von express-status.js nach dem Laden gesetzt).
let CUR = normDur(DUR_DEFAULT);
export const curDur = () => CUR;
export function setCurDur(d) { const n = normDur(d); if (durKey(n) !== durKey(CUR)) CUR = n; return CUR; }
