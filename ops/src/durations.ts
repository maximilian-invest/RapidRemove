/* Löschdauer Standard je Preisstufe (Admin → Einstellungen → Express & Löschdauer, 02.11.2026).
   fresh = 179er (bis 4 Wochen, mit Text) · other = 250er (alle anderen). unit "d" = Tage, "w" = Wochen.
   Texte tragen Platzhalter: {DF} = Dauer 179er, {DO} = Dauer 250er, {DA} = Spanne über beide (allgemeine Aussagen).
   Gleiche Logik auf der Website: src/lib/durations.js — beide Dateien gemeinsam ändern.
   Gespeichert in partner_settings „dur_v2" (JSON). */
import { pool } from "./db";

export type DurUnit = "d" | "w";
export interface DurTier { min: number; max: number; unit: DurUnit }
export interface Durations { fresh: DurTier; other: DurTier }

export const DUR_DEFAULT: Durations = Object.freeze({
  fresh: Object.freeze({ min: 1, max: 2, unit: "w" as DurUnit }),
  other: Object.freeze({ min: 1, max: 2, unit: "w" as DurUnit }),
});
export const DUR_MAX = 365;

const int = (v: unknown) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : NaN; };
/** Eine Stufe prüfen. Ungültig → null. */
export function normTier(x: unknown): DurTier | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const unit = o.unit === "d" || o.unit === "w" ? (o.unit as DurUnit) : null;
  const min = int(o.min), max = int(o.max);
  if (!unit || !(min >= 1) || !(max >= min) || max > DUR_MAX) return null;
  return { min, max, unit };
}
/** Beide Stufen; fehlende/ungültige fallen auf den Standard zurück. */
export function normDur(x: unknown): Durations {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  return { fresh: normTier(o.fresh) || { ...DUR_DEFAULT.fresh }, other: normTier(o.other) || { ...DUR_DEFAULT.other } };
}
export const durKey = (d: Durations) => [d.fresh.min, d.fresh.max, d.fresh.unit, d.other.min, d.other.max, d.other.unit].join(".");
const toDays = (n: number, u: DurUnit) => (u === "w" ? n * 7 : n);
export const maxDays = (t: DurTier) => toDays(t.max, t.unit);
/** Spanne über beide Stufen (für allgemeine Aussagen „meist …"). */
export function durAll(d: Durations): DurTier {
  const a = d.fresh, b = d.other;
  if (a.unit === b.unit) return { min: Math.min(a.min, b.min), max: Math.max(a.max, b.max), unit: a.unit };
  return { min: Math.min(toDays(a.min, a.unit), toDays(b.min, b.unit)), max: Math.max(toDays(a.max, a.unit), toDays(b.max, b.unit)), unit: "d" };
}

// [Einzahl, Mehrzahl] je Sprache und Einheit; de zusätzlich Dativ Mehrzahl („in 7–21 Tagen").
const UNITS: Record<string, Record<DurUnit, string[]>> = {
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
export function fmtTier(t: DurTier, lang: string, dative = false): string {
  const L = UNITS[lang] ? lang : "en";
  const u = UNITS[L][t.unit] || UNITS[L].w;
  const one = t.min === t.max;
  const word = one && t.min === 1 ? u[0] : (dative && u[2]) || u[1];
  if (L === "ja") return (one ? String(t.min) : `${t.min}〜${t.max}`) + word;
  return (one ? String(t.min) : `${t.min}–${t.max}`) + " " + word;
}
const DATIVE_BEFORE = /(?:^|[\s(])(in|von|nach|binnen|seit|mit)\s$/i;
/** Platzhalter {DF} {DO} {DA} in einem Text ersetzen. Ohne dur = aktueller Stand (curDur). */
export function fillDur(s: string, lang: string, dur?: Durations): string {
  if (typeof s !== "string" || s.indexOf("{D") < 0) return s;
  const d = dur || CUR;
  const T: Record<string, DurTier> = { DF: d.fresh, DO: d.other, DA: durAll(d) };
  // {DF:de} = feste Sprache (z. B. deutsche Wissensbasis in einem englischen Prompt).
  return s.replace(/\{(DF|DO|DA)(?::([a-z]{2}))?\}/g, (_m, k: string, fl: string | undefined, off: number, all: string) => {
    const L = fl || lang;
    const dat = L === "de" && DATIVE_BEFORE.test(all.slice(Math.max(0, off - 12), off));
    return fmtTier(T[k], L, dat);
  });
}
/** Alle Texte eines Objekts füllen (Funktionen bleiben unverändert). */
export function fillDeep<T>(v: T, lang: string, dur?: Durations): T {
  if (typeof v === "string") return fillDur(v, lang, dur) as unknown as T;
  if (Array.isArray(v)) return v.map((x) => fillDeep(x, lang, dur)) as unknown as T;
  if (v && typeof v === "object") { const o: Record<string, unknown> = {}; for (const k of Object.keys(v as object)) o[k] = fillDeep((v as Record<string, unknown>)[k], lang, dur); return o as T; }
  return v;
}

/* ---- Stand aus der Datenbank (15 s Cache). curDur() = zuletzt geladener Stand (synchron, für Mail-Vorlagen). ---- */
let CUR: Durations = normDur(DUR_DEFAULT);
let ts = 0;
export const curDur = (): Durations => CUR;
export async function loadDurations(): Promise<Durations> {
  if (ts && Date.now() - ts < 15_000) return CUR;
  if (pool) {
    const r = await pool.query(`SELECT value FROM partner_settings WHERE key='dur_v2'`).catch(() => ({ rows: [] as { value: string }[] }));
    let raw: unknown = null;
    try { raw = r.rows[0]?.value ? JSON.parse(r.rows[0].value) : null; } catch { raw = null; }
    CUR = normDur(raw);
  }
  ts = Date.now();
  return CUR;
}
export async function saveDurations(d: Durations): Promise<Durations> {
  const n = normDur(d);
  if (!pool) throw new Error("keine Datenbank");
  await pool.query(`INSERT INTO partner_settings (key, value) VALUES ('dur_v2',$1) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`, [JSON.stringify(n)]);
  CUR = n; ts = Date.now();
  return CUR;
}
