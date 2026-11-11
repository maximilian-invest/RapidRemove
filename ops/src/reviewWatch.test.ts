/* Tests für den Bewertungs-Wächter (nur Entscheidungslogik, ohne Netz/Datenbank).  Start: npx tsx src/reviewWatch.test.ts */
import assert from "node:assert/strict";
import { pickCandidates } from "./reviewWatch";
import { takeUntilOld, type FetchedReview } from "./reviewsFetch";

let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("✓", name); };
const R = (id: string, rating: number, days: number, o: Partial<FetchedReview> = {}): FetchedReview => ({
  id, name: "Name " + id, photo: "", rating, text: "Schlechter Service " + id, date: new Date(Date.now() - days * 86_400_000).toISOString(),
  days, rel: days < 7 ? `${days} days ago` : days < 28 ? `${Math.floor(days / 7) || 1} weeks ago` : "a month ago", link: `https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1s${id}!2m1!1s0x0:0x1`, ...o,
});
const none = { ids: new Set<string>(), nameText: new Set<string>() };
const ids = (x: { r: FetchedReview }[]) => x.map((c) => c.r.id);

// ---- Stopp bei „vor 4 Wochen" ----
ok("liest nur bis zur ersten Bewertung mit „vor 4 Wochen“", () => {
  const list = [R("Ca1", 1, 2), R("Ca2", 5, 10), R("Ca3", 1, 28, { rel: "4 weeks ago" }), R("Ca4", 1, 3)];
  const t = takeUntilOld(list);
  assert.deepEqual(t.keep.map((r) => r.id), ["Ca1", "Ca2"]); assert.equal(t.reachedOld, true);
});
ok("„vor 4 Wochen“ zählt auch, wenn das Datum erst 26 Tage her ist", () => {
  assert.equal(takeUntilOld([R("Cb1", 1, 26, { rel: "4 weeks ago" })]).keep.length, 0);
});
ok("„a month ago“ / „vor einem Monat“ = zu alt", () => {
  assert.equal(takeUntilOld([R("Cc1", 1, 20, { rel: "a month ago" })]).keep.length, 0);
  assert.equal(takeUntilOld([R("Cc2", 1, 20, { rel: "vor einem Monat" })]).keep.length, 0);
});

// ---- Sterne: nur 1 und 2 ----
ok("1★ und 2★ werden gemeldet, 3★ / 4★ / 5★ nicht", () => {
  const list = [R("Cd1", 1, 2), R("Cd2", 2, 2), R("Cd3", 3, 2), R("Cd4", 4, 2), R("Cd5", 5, 2)];
  assert.deepEqual(ids(pickCandidates(list, new Map(), none, 2)), ["Cd1", "Cd2"]);
});

// ---- schon gesehen / geändert ----
ok("schon beim letzten Scan gesehen → keine zweite Meldung", () => {
  assert.equal(pickCandidates([R("Ce1", 1, 3)], new Map([["Ce1", 1]]), none, 2).length, 0);
});
ok("von 5★ auf 1★ geändert („Edited“) → wird gemeldet", () => {
  const c = pickCandidates([R("Cf1", 1, 5, { rel: "Edited a week ago" })], new Map([["Cf1", 5]]), none, 2);
  assert.deepEqual(ids(c), ["Cf1"]); assert.equal(c[0].edited, true);
});
ok("von 2★ auf 1★ geändert → keine neue Meldung (war schon schlecht)", () => {
  assert.equal(pickCandidates([R("Cg1", 1, 5)], new Map([["Cg1", 2]]), none, 2).length, 0);
});

// ---- nur was wir löschen können ----
ok("ohne Text → keine Meldung", () => assert.equal(pickCandidates([R("Ch1", 1, 2, { text: "  " })], new Map(), none, 2).length, 0));
ok("weniger als 2 Tage bis Tag 28 → keine Meldung", () => {
  assert.equal(pickCandidates([R("Ci1", 1, 26)], new Map(), none, 2).length, 0);
  assert.equal(pickCandidates([R("Ci2", 1, 25)], new Map(), none, 2).length, 1);
});

// ---- schon beauftragt ----
ok("schon beauftragt (gleiche Review-ID im Auftrag) → keine Meldung", () => {
  assert.equal(pickCandidates([R("Cj1", 1, 2)], new Map(), { ids: new Set(["Cj1"]), nameText: new Set() }, 2).length, 0);
});
ok("schon beauftragt (Name + Text gleich, Link ohne ID) → keine Meldung", () => {
  const r = R("Ck1", 1, 2);
  assert.equal(pickCandidates([r], new Map(), { ids: new Set(), nameText: new Set([`${r.name.toLowerCase()}|${r.text.toLowerCase().slice(0, 80)}`]) }, 2).length, 0);
});

// ---- Miami-Fall (11.11.2026): Daniella + Michelle sind im Auftrag RR-212867 ----
ok("Miami: beide neuen 1★ schon beauftragt → keine Mail", () => {
  const d = R("CDaniella", 1, 12), m = R("CMichelle", 1, 8, { rel: "Edited a week ago" });
  assert.equal(pickCandidates([m, d, R("Cx5", 5, 7)], new Map([["CMichelle", 5]]), { ids: new Set(["CDaniella", "CMichelle"]), nameText: new Set() }, 2).length, 0);
});

console.log(`\n${n} Tests ok`);
