/* Tests für den Bewertungs-Wächter (nur Entscheidungslogik, ohne Netz/Datenbank).  Start: npx tsx src/reviewWatch.test.ts */
import assert from "node:assert/strict";
import { pickCandidates, isDue, scanWeekday, checkOriginalDates } from "./reviewWatch";
import { parseReviewDates } from "./reviewShots";
import { tooOldAtOrder } from "./reviewDateCheck";
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

// ---- 1× pro Woche je Profil ----
ok("neues Profil (kein Ausgangsstand) → sofort fällig", () => assert.equal(isDue("P1", null, null, new Date()), true));
ok("jedes Profil genau an 1 Tag der Woche fällig, alle Wochentage genutzt", () => {
  const base = new Date("2026-11-16T09:00:00+01:00"); // Montag
  const days = new Set<number>();
  for (let i = 0; i < 70; i++) {
    const pid = "Place" + i; days.add(scanWeekday(pid));
    let due = 0;
    for (let d = 0; d < 7; d++) {
      const now = new Date(base.getTime() + d * 86_400_000);
      if (isDue(pid, new Date("2026-11-01"), new Date(now.getTime() - 24 * 3_600_000), now)) due++;
    }
    assert.equal(due, 1, pid);
  }
  assert.equal(days.size, 7);
});
ok("letzter Scan > 7 Tage her (z. B. Ausfall) → sofort fällig", () => {
  const now = new Date("2026-11-16T09:00:00+01:00");
  assert.equal(isDue("PlaceX", new Date("2026-11-01"), new Date(now.getTime() - 7 * 86_400_000), now), true);
});
ok("am eigenen Wochentag schon gescannt → nicht nochmal", () => {
  const now = new Date("2026-11-16T15:00:00+01:00");
  const pid = Array.from({ length: 50 }, (_, i) => "Q" + i).find((p) => scanWeekday(p) === 1)!;
  assert.equal(isDue(pid, new Date("2026-11-01"), new Date(now.getTime() - 5 * 3_600_000), now), false);
});

// ---- Ursprüngliches Datum bei geänderten Bewertungen (Maximilian 12.11.) ----
const okA = async (name: string, fn: () => Promise<void>) => { await fn(); n++; console.log("✓", name); };
(async () => {
  const now = Date.parse("2026-11-12T10:00:00Z");
  const michelle = { r: R("CMich", 1, 9, { rel: "Edited a week ago", name: "Michelle Rodriguez" }), edited: false };
  const daniella = { r: R("CDan", 1, 13, { rel: "a week ago", name: "Daniella Rocha" }), edited: false };
  await okA("Miami: Michelle (geändert, ursprünglich 23.08.) fliegt raus, Daniella bleibt", async () => {
    const res = await checkOriginalDates([michelle, daniella], async (_l, id) => id === "CMich" ? { created: "2026-08-23T03:24:23Z", edited: "2026-11-02T18:17:54Z" } : null, now);
    assert.deepEqual(res.keep.map((c) => c.r.name), ["Daniella Rocha"]);
    assert.match(res.dropped[0].why, /2026-08-23/);
  });
  await okA("geändert, aber ursprünglich erst 10 Tage alt → bleibt (Alter = Erstelldatum)", async () => {
    const res = await checkOriginalDates([michelle], async () => ({ created: "2026-11-02T10:00:00Z", edited: "2026-11-05T10:00:00Z" }), now);
    assert.equal(res.keep.length, 1); assert.equal(res.keep[0].r.days, 10);
  });
  await okA("geändert, Erstelldatum nicht ermittelbar → sicherheitshalber raus", async () => {
    const res = await checkOriginalDates([michelle], async () => null, now);
    assert.equal(res.keep.length, 0);
  });
  await okA("nicht geändert → keine Google-Abfrage nötig", async () => {
    let calls = 0;
    await checkOriginalDates([daniella], async () => { calls++; return null; }, now);
    assert.equal(calls, 0);
  });
  await okA("Zeitstempel aus dem Seiten-HTML lesen (µs → Datum)", async () => {
    const d = parseReviewDates('<head><meta name="rr-dates" content="1787455463064922,1793643474194970"></head>');
    assert.equal(d?.created.slice(0, 10), "2026-08-23"); assert.equal(d?.edited.slice(0, 10), "2026-11-02");
    assert.equal(parseReviewDates('<meta name="rr-dates" content="none">'), null);
  });
  await okA("Bestellung: ursprünglich 23.08., bestellt 05.11. → zu alt (Michelle im Miami-Auftrag)", async () => {
    assert.equal(tooOldAtOrder("2026-08-23T03:24:23Z", "2026-11-05T01:47:49Z"), true);
  });
  await okA("Bestellung: ursprünglich 30.10., bestellt 05.11. → nicht zu alt (Daniella)", async () => {
    assert.equal(tooOldAtOrder("2026-10-30T01:18:00Z", "2026-11-05T01:47:49Z"), false);
  });
  await okA("Bestellung: genau 28 Tage → zu alt (Google zeigt „vor 4 Wochen“)", async () => {
    assert.equal(tooOldAtOrder("2026-10-08T10:00:00Z", "2026-11-05T10:00:00Z"), true);
    assert.equal(tooOldAtOrder("2026-10-09T10:00:00Z", "2026-11-05T10:00:00Z"), false);
  });
  console.log(`\n${n} Tests ok`);
})();
