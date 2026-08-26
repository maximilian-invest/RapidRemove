/*
 * Gamification-Engine: Lösch-Counter, Ränge & Achievements für Max & Matthias.
 *
 * EINE Quelle der Wahrheit für die Push (Server) und das Admin-Panel
 * (über /admin/gamification). Alles wird LIVE aus den Bestellungen abgeleitet
 * (Status "done" + echte Löschung remove/reset/express), daher sind vergangene
 * Löschungen automatisch enthalten – kein zusätzliches Tracking nötig.
 *
 * Reine Rechenlogik, keine DB-/Server-Abhängigkeit (gut testbar).
 */

export type Assignee = "max" | "matthias";

export const PEOPLE: Record<Assignee, { id: Assignee; name: string; full: string; img: string }> = {
  max:      { id: "max",      name: "Max",      full: "Maximilian Hölzl", img: "/assets/maximilian-hoelzl.jpg" },
  matthias: { id: "matthias", name: "Matthias", full: "Matthias Lang",    img: "/assets/matthias-lang.webp" },
};

/** „Echte Löschung": nur diese Leistungen zählen (Presse-Auslistung & ORM nicht). */
export const DELETION_SERVICES = new Set(["remove", "reset", "express"]);

export interface DeletionRow {
  id: string;
  assignee: Assignee | string | null;
  service: string | null;
  country: string | null;
  amount: number | null;
  company: string | null;
  doneAt: string; // ISO-Zeitstempel der Löschung (done_at, ersatzweise created_at)
  express: boolean;
  paid: boolean;  // echt bezahlt (pay='paid') – zählt für den Umsatz, NICHT für den Rang
}

export interface Rank { key: string; name: string; emoji: string; min: number; }

/** Rang-Leiter (Schwellen = Anzahl Löschungen). Frei justierbar. */
export const RANKS: Rank[] = [
  { key: "frischling",   name: "Frischling",         emoji: "🥚",  min: 0 },
  { key: "putzkraft",    name: "Putzkraft",          emoji: "🧹",  min: 5 },
  { key: "saeuberer",    name: "Säuberer",           emoji: "🗑️", min: 15 },
  { key: "sternejaeger", name: "Sternejäger",        emoji: "⭐",  min: 30 },
  { key: "ritter",       name: "Reputations-Ritter", emoji: "🛡️", min: 50 },
  { key: "profi",        name: "Lösch-Profi",        emoji: "🔥",  min: 75 },
  { key: "meister",      name: "Lösch-Meister",      emoji: "👑",  min: 100 },
  { key: "grossmeister", name: "Großmeister",        emoji: "💎",  min: 175 },
  { key: "legende",      name: "Legende",            emoji: "🏆",  min: 300 },
  { key: "guldenkoenig", name: "Gulden-König",       emoji: "🪙",  min: 500 },
];

/** Aktueller Rang + nächster + Fortschritt (0..1) für eine Lösch-Anzahl. */
export function rankInfo(count: number) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (count >= RANKS[i].min) idx = i;
  const rank = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const span = next ? next.min - rank.min : 1;
  const toNext = next ? Math.max(0, next.min - count) : 0;
  const progress = next ? Math.min(1, Math.max(0, (count - rank.min) / span)) : 1;
  return { rank, next, toNext, progress, level: idx + 1 };
}

// ── Zeit-Helfer in Europe/Vienna (Railway läuft i. d. R. in UTC) ──
const TZ = "Europe/Vienna";
const vDay  = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso)); // YYYY-MM-DD
const vHour = (iso: string) => (Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(new Date(iso)).replace(/\D/g, "")) || 0) % 24;
const vDow  = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date(iso)); // Mon..Sun

export interface AchievementDef { key: string; name: string; emoji: string; desc: string; }
export interface AchievementResult extends AchievementDef { unlocked: boolean; unlockedAt: string | null; have: number; need: number; }

/** Achievement-Katalog. Alle Bedingungen sind aus den Auftragsdaten ableitbar. */
export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first",       name: "Erstes Blut",        emoji: "🩸", desc: "Erste Löschung" },
  { key: "ten",         name: "Zweistellig",        emoji: "🔟", desc: "10 Löschungen" },
  { key: "fifty",       name: "Halbhundert",        emoji: "🎯", desc: "50 Löschungen" },
  { key: "hundred",     name: "Hunderter-Club",     emoji: "💯", desc: "100 Löschungen" },
  { key: "fivehundred", name: "Gulden-Regen",       emoji: "🪙", desc: "500 Löschungen" },
  { key: "express10",   name: "Blitz-Löscher",      emoji: "⚡", desc: "10 Express-Löschungen" },
  { key: "reset10",     name: "Neustart-Architekt", emoji: "♻️", desc: "10 Reset-Aufträge (Löschen + Neuaufsetzen)" },
  { key: "world3",      name: "Weltenbummler",      emoji: "🌍", desc: "Löschungen in 3 verschiedenen Ländern" },
  { key: "bigfish",     name: "Großwild",           emoji: "💰", desc: "Auftrag ab 800 €" },
  { key: "early",       name: "Frühschicht",        emoji: "🌅", desc: "Löschung vor 08:00 Uhr" },
  { key: "night",       name: "Nachteule",          emoji: "🦉", desc: "Löschung nach 22:00 Uhr" },
  { key: "weekend",     name: "Wochenend-Krieger",  emoji: "📅", desc: "Löschung am Wochenende" },
  { key: "day5",        name: "Tages-Highscore",    emoji: "🚀", desc: "5 Löschungen an einem Tag" },
  { key: "streak5",     name: "Serien-Täter",       emoji: "🔥", desc: "5 Tage in Folge gelöscht" },
];

/** Wertet alle Achievements für die (aufsteigend sortierten) Löschungen einer Person aus. */
function evaluate(sorted: DeletionRow[]): AchievementResult[] {
  const count = sorted.length;
  const nthAt = (arr: DeletionRow[], n: number) => (arr.length >= n ? arr[n - 1].doneAt : null);
  const firstAt = (pred: (r: DeletionRow) => boolean) => sorted.find(pred)?.doneAt ?? null;
  const isWeekend = (r: DeletionRow) => vDow(r.doneAt) === "Sat" || vDow(r.doneAt) === "Sun";
  const express = sorted.filter((r) => r.express || r.service === "express");
  const reset = sorted.filter((r) => r.service === "reset");

  // 3. verschiedenes Land → Zeitpunkt
  const cset = new Set<string>(); let world3At: string | null = null;
  for (const r of sorted) if (r.country) { cset.add(r.country.toUpperCase()); if (cset.size >= 3 && !world3At) world3At = r.doneAt; }

  // Tages-Buckets (Vienna) für Tages-Highscore & Streak
  const byDay = new Map<string, DeletionRow[]>();
  for (const r of sorted) { const k = vDay(r.doneAt); const a = byDay.get(k); if (a) a.push(r); else byDay.set(k, [r]); }
  let dayMax = 0, day5At: string | null = null;
  for (const rs of byDay.values()) { if (rs.length > dayMax) dayMax = rs.length; if (rs.length >= 5 && !day5At) day5At = rs[4].doneAt; }
  const days = [...byDay.keys()].sort();
  let bestStreak = days.length ? 1 : 0, run = 1, streak5At: string | null = null;
  for (let i = 1; i < days.length; i++) {
    const diff = (Date.parse(days[i]) - Date.parse(days[i - 1])) / 86400000;
    run = diff === 1 ? run + 1 : 1;
    if (run > bestStreak) bestStreak = run;
    if (run >= 5 && !streak5At) { const rs = byDay.get(days[i])!; streak5At = rs[rs.length - 1].doneAt; }
  }

  const m: Record<string, { unlocked: boolean; unlockedAt: string | null; have: number; need: number }> = {
    first:       { need: 1,   have: count,          unlocked: count >= 1,           unlockedAt: nthAt(sorted, 1) },
    ten:         { need: 10,  have: count,          unlocked: count >= 10,          unlockedAt: nthAt(sorted, 10) },
    fifty:       { need: 50,  have: count,          unlocked: count >= 50,          unlockedAt: nthAt(sorted, 50) },
    hundred:     { need: 100, have: count,          unlocked: count >= 100,         unlockedAt: nthAt(sorted, 100) },
    fivehundred: { need: 500, have: count,          unlocked: count >= 500,         unlockedAt: nthAt(sorted, 500) },
    express10:   { need: 10,  have: express.length, unlocked: express.length >= 10, unlockedAt: nthAt(express, 10) },
    reset10:     { need: 10,  have: reset.length,   unlocked: reset.length >= 10,   unlockedAt: nthAt(reset, 10) },
    world3:      { need: 3,   have: cset.size,      unlocked: cset.size >= 3,       unlockedAt: world3At },
    bigfish:     { need: 1,   have: sorted.filter((r) => (r.amount ?? 0) >= 800).length, unlocked: sorted.some((r) => (r.amount ?? 0) >= 800), unlockedAt: firstAt((r) => (r.amount ?? 0) >= 800) },
    early:       { need: 1,   have: sorted.filter((r) => vHour(r.doneAt) < 8).length,    unlocked: sorted.some((r) => vHour(r.doneAt) < 8),    unlockedAt: firstAt((r) => vHour(r.doneAt) < 8) },
    night:       { need: 1,   have: sorted.filter((r) => vHour(r.doneAt) >= 22).length,  unlocked: sorted.some((r) => vHour(r.doneAt) >= 22),  unlockedAt: firstAt((r) => vHour(r.doneAt) >= 22) },
    weekend:     { need: 1,   have: sorted.filter(isWeekend).length,                     unlocked: sorted.some(isWeekend),                     unlockedAt: firstAt(isWeekend) },
    day5:        { need: 5,   have: dayMax,         unlocked: !!day5At,             unlockedAt: day5At },
    streak5:     { need: 5,   have: bestStreak,     unlocked: !!streak5At,          unlockedAt: streak5At },
  };

  return ACHIEVEMENTS.map((a) => ({ ...a, ...m[a.key] }));
}

export interface BoardPerson {
  id: Assignee; name: string; full: string; img: string;
  count: number;       // Löschungen gesamt – treibt Rang/Level
  paidCount: number;   // davon echt bezahlt (pay='paid')
  rank: Rank; next: Rank | null; toNext: number; progress: number; level: number;
  today: number; week: number; month: number;
  paidToday: number; paidWeek: number; paidMonth: number;
  /** Umsatz – NUR aus echt bezahlten Aufträgen (pay='paid'), gesamt + Zeiträume. */
  volume: number; volumeToday: number; volumeWeek: number; volumeMonth: number;
  achievements: AchievementResult[]; unlockedCount: number;
  recent: { id: string; company: string | null; service: string | null; at: string; paid: boolean }[];
}

/** Vollständige Statistik einer Person aus ALLEN Lösch-Zeilen. */
export function personStats(person: Assignee, rows: DeletionRow[]): BoardPerson {
  const mine = rows.filter((r) => r.assignee === person).sort((a, b) => (a.doneAt < b.doneAt ? -1 : 1));
  const count = mine.length;
  const ri = rankInfo(count);
  const ach = evaluate(mine);
  const todayKey = vDay(new Date().toISOString());
  const monthKey = todayKey.slice(0, 7);
  const weekAgo = Date.now() - 7 * 86400000;
  const inToday = mine.filter((r) => vDay(r.doneAt) === todayKey);
  const inWeek = mine.filter((r) => Date.parse(r.doneAt) >= weekAgo);
  const inMonth = mine.filter((r) => vDay(r.doneAt).slice(0, 7) === monthKey);
  const paidIn = (arr: DeletionRow[]) => arr.filter((r) => r.paid);
  // Umsatz NUR aus echt bezahlten Aufträgen (pay='paid').
  const sum = (arr: DeletionRow[]) => Math.round(paidIn(arr).reduce((s, r) => s + (r.amount || 0), 0));
  return {
    ...PEOPLE[person],
    count,
    paidCount: paidIn(mine).length,
    rank: ri.rank, next: ri.next, toNext: ri.toNext, progress: ri.progress, level: ri.level,
    today: inToday.length, week: inWeek.length, month: inMonth.length,
    paidToday: paidIn(inToday).length, paidWeek: paidIn(inWeek).length, paidMonth: paidIn(inMonth).length,
    volume: sum(mine), volumeToday: sum(inToday), volumeWeek: sum(inWeek), volumeMonth: sum(inMonth),
    achievements: ach,
    unlockedCount: ach.filter((a) => a.unlocked).length,
    recent: [...mine].reverse().slice(0, 6).map((r) => ({ id: r.id, company: r.company, service: r.service, at: r.doneAt, paid: r.paid })),
  };
}

export interface Board {
  people: BoardPerson[];
  headToHead: {
    allTime: Record<Assignee, number>;
    week: Record<Assignee, number>;
    month: Record<Assignee, number>;
    /** Umsatzvergleich (€) je Zeitraum. */
    volume: { allTime: Record<Assignee, number>; week: Record<Assignee, number>; month: Record<Assignee, number> };
    leader: Assignee | "tie";
  };
  updatedAt: string;
}

/* ══════════════════════════════════════════════════════════════════
   Bewertungs-Produkt („Einzelne Bewertungen löschen") — eigener
   Liga-Reiter. Diese Aufträge werden VERGEBEN (extern ausgeführt):
   je Bestellung gehen 50 (USD bzw. EUR der Bestellung) an die Vergabe.
   Die Liga zählt deshalb je Auftrag amount − 50 als Netto-Erlös —
   der Kundenpreis (179 je Bewertung) bleibt davon unberührt.
   ══════════════════════════════════════════════════════════════════ */
export const REVIEWS_FEE = 50;

export interface ReviewsRow {
  id: string;
  assignee: Assignee | string | null;
  amount: number | null;   // Bestellwert (eingereichte Bewertungen × 179)
  company: string | null;
  country: string | null;
  createdAt: string;       // Bestell-Eingang
  doneAt: string | null;   // gesetzt, sobald der Auftrag erledigt (status=done) ist
  paid: boolean;           // echt bezahlt (pay='paid') – treibt den Netto-Erlös
  reviewCount: number;     // Anzahl eingereichter Bewertungen
}

/** Netto je Bestellung: Bestellwert minus Vergabe-Abzug, nie negativ. */
export const reviewsNet = (amount: number | null | undefined) =>
  Math.max(0, (amount || 0) - REVIEWS_FEE);

export interface ReviewsPerson {
  id: Assignee; name: string; full: string; img: string;
  orders: number;      // eingegangene Bewertungs-Bestellungen
  done: number;        // davon erledigt (status=done)
  paidCount: number;   // davon echt bezahlt
  reviews: number;     // eingereichte Bewertungen gesamt
  /** Netto-Erlös (amount − 50 je Bestellung), NUR echt bezahlte Aufträge. */
  net: number; netToday: number; netWeek: number; netMonth: number;
  today: number; week: number; month: number; // erledigte im Zeitraum
  recent: { id: string; company: string | null; at: string; done: boolean; paid: boolean; reviewCount: number; net: number }[];
}

export function reviewsPersonStats(person: Assignee, rows: ReviewsRow[]): ReviewsPerson {
  const at = (r: ReviewsRow) => r.doneAt || r.createdAt;
  const mine = rows.filter((r) => r.assignee === person).sort((a, b) => (at(a) < at(b) ? -1 : 1));
  const doneRows = mine.filter((r) => !!r.doneAt);
  const todayKey = vDay(new Date().toISOString());
  const monthKey = todayKey.slice(0, 7);
  const weekAgo = Date.now() - 7 * 86400000;
  const dToday = doneRows.filter((r) => vDay(r.doneAt as string) === todayKey);
  const dWeek = doneRows.filter((r) => Date.parse(r.doneAt as string) >= weekAgo);
  const dMonth = doneRows.filter((r) => vDay(r.doneAt as string).slice(0, 7) === monthKey);
  // Netto NUR aus echt bezahlten Aufträgen — analog zum Umsatz der Lösch-Liga.
  const netSum = (arr: ReviewsRow[]) => Math.round(arr.filter((r) => r.paid).reduce((s, r) => s + reviewsNet(r.amount), 0));
  return {
    ...PEOPLE[person],
    orders: mine.length,
    done: doneRows.length,
    paidCount: mine.filter((r) => r.paid).length,
    reviews: mine.reduce((s, r) => s + (r.reviewCount || 0), 0),
    net: netSum(mine), netToday: netSum(dToday), netWeek: netSum(dWeek), netMonth: netSum(dMonth),
    today: dToday.length, week: dWeek.length, month: dMonth.length,
    recent: [...mine].reverse().slice(0, 6).map((r) => ({
      id: r.id, company: r.company, at: at(r), done: !!r.doneAt, paid: r.paid,
      reviewCount: r.reviewCount || 0, net: reviewsNet(r.amount),
    })),
  };
}

export interface ReviewsBoard {
  fee: number;
  people: ReviewsPerson[];
  headToHead: {
    allTime: Record<Assignee, number>;   // erledigte Aufträge
    week: Record<Assignee, number>;
    month: Record<Assignee, number>;
    net: { allTime: Record<Assignee, number>; week: Record<Assignee, number>; month: Record<Assignee, number> };
    leader: Assignee | "tie";
  };
  updatedAt: string;
}

/** Reviews-Leaderboard (Max + Matthias) für den eigenen Liga-Reiter. */
export function buildReviewsBoard(rows: ReviewsRow[]): ReviewsBoard {
  const max = reviewsPersonStats("max", rows);
  const matthias = reviewsPersonStats("matthias", rows);
  const leader: Assignee | "tie" = max.done === matthias.done ? "tie" : max.done > matthias.done ? "max" : "matthias";
  return {
    fee: REVIEWS_FEE,
    people: [max, matthias],
    headToHead: {
      allTime: { max: max.done, matthias: matthias.done },
      week: { max: max.week, matthias: matthias.week },
      month: { max: max.month, matthias: matthias.month },
      net: {
        allTime: { max: max.net, matthias: matthias.net },
        week: { max: max.netWeek, matthias: matthias.netWeek },
        month: { max: max.netMonth, matthias: matthias.netMonth },
      },
      leader,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Komplettes Leaderboard (Max + Matthias) für das Admin-Panel. */
export function buildBoard(rows: DeletionRow[]): Board {
  const max = personStats("max", rows);
  const matthias = personStats("matthias", rows);
  const leader: Assignee | "tie" = max.count === matthias.count ? "tie" : max.count > matthias.count ? "max" : "matthias";
  return {
    people: [max, matthias],
    headToHead: {
      allTime: { max: max.count, matthias: matthias.count },
      week: { max: max.week, matthias: matthias.week },
      month: { max: max.month, matthias: matthias.month },
      volume: {
        allTime: { max: max.volume, matthias: matthias.volume },
        week: { max: max.volumeWeek, matthias: matthias.volumeWeek },
        month: { max: max.volumeMonth, matthias: matthias.volumeMonth },
      },
      leader,
    },
    updatedAt: new Date().toISOString(),
  };
}
