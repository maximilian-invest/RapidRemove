/* Tests für den Auto-Scan (nur Entscheidungslogik, ohne Netz/Datenbank).  Start: npx tsx src/removalScan.test.ts */
import assert from "node:assert/strict";
import { decide, strictListCheck, type PageFetcher } from "./removalScan";

let n = 0;
const ok = (name: string, fn: () => void | Promise<void>) => Promise.resolve(fn()).then(() => { n++; console.log("✓", name); });

const A = { state: "absent" as const, detail: "x" }, L = { state: "listed" as const, detail: "x" }, U = { state: "unknown" as const, detail: "x" };
const URL0 = "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChdDSUhNMG9nS0VJQ0FnSURtcTlmdmh3RRAB!2m1!1s0x47744b8f:0x1234abcd";
const page = (reviews: any[], next: string | null = null) => ({ reviews, next });
const rev = (name: string, rating: number, id = "Cx" + name) => ({ review_id: id, user: { name }, rating, link: "https://maps/" + id });

(async () => {
  // ---- decide(): nur „gone", wenn ALLES passt ----
  await ok("gelöscht nur bei Link gelöscht + Liste fehlt + Nachweis", () => assert.equal(decide("gone", A, true, "Ann").result, "gone"));
  await ok("Link gelöscht, Liste noch gelistet → unverändert", () => assert.equal(decide("gone", L, true, "Ann").result, "unknown"));
  await ok("Link gelöscht, Liste nicht prüfbar → unverändert", () => assert.equal(decide("gone", U, true, "Ann").result, "unknown"));
  await ok("Link gelöscht + Liste fehlt, aber kein Nachweis 'war online' → unverändert", () => assert.equal(decide("gone", A, false, "Ann").result, "unknown"));
  await ok("Link sichtbar → noch online (egal was die Liste sagt)", () => { for (const l of [A, L, U]) assert.equal(decide("visible", l, true, "Ann").result, "visible"); });
  await ok("Link unklar → nie gelöscht", () => { for (const l of [A, L, U]) for (const e of [true, false]) assert.notEqual(decide("unknown", l, e, "Ann").result, "gone"); });
  await ok("Vollständige Tabelle: 'gone' genau 1× von 18 Kombinationen", () => {
    let g = 0;
    for (const k of ["gone", "visible", "unknown"] as const) for (const l of [A, L, U]) for (const e of [true, false]) if (decide(k, l, e, "x").result === "gone") g++;
    assert.equal(g, 1);
  });

  // ---- strictListCheck(): Bewertungsliste ----
  const one = (pages: ReturnType<typeof page>[]): PageFetcher => { let i = 0; return async () => pages[i++] || page([]); };
  const base = { url: URL0, reviewId: "", name: "Ann Smith", rating: 1, placeId: "pid" };

  await ok("Verfasser in der Liste → listed", async () => assert.equal((await strictListCheck(base, one([page([rev("Bob", 1), rev("Ann Smith", 1)])]))).state, "listed"));
  await ok("Name mit Akzent/Großschreibung → trotzdem erkannt (listed)", async () => assert.equal((await strictListCheck({ ...base, name: "Änn  smith" }, one([page([rev("ann smith", 2)])]))).state, "listed"));
  await ok("Gleicher Name, ANDERER Text → trotzdem listed (streng)", async () => assert.equal((await strictListCheck(base, one([page([{ ...rev("Ann Smith", 1), snippet: "anders" }])]))).state, "listed"));
  await ok("Review-ID in der Liste (anderer Name) → listed", async () => assert.equal((await strictListCheck({ ...base, reviewId: "CidXYZ1234567890abcd" }, one([page([rev("Renamed", 1, "CidXYZ1234567890abcd")])]))).state, "listed"));
  await ok("Liste zu Ende, nicht dabei → absent", async () => assert.equal((await strictListCheck(base, one([page([rev("Bob", 1), rev("Cid", 2)], "t2"), page([rev("Dan", 3)])]))).state, "absent"));
  await ok("Sterne-Band: bei 2★ noch NICHT absent (1 Stern Abstand) – sucht weiter", async () => {
    const r = await strictListCheck(base, one([page([rev("Bob", 1), rev("Eve", 2)], "t2"), page([rev("Ann Smith", 2)])]));
    assert.equal(r.state, "listed"); // Sterne in der Bestellung falsch (1 statt 2) → wird trotzdem gefunden
  });
  await ok("Sterne-Band: erst ab 3★ (bei 1★-Bewertung) absent", async () => assert.equal((await strictListCheck(base, one([page([rev("Bob", 1), rev("Eve", 2), rev("Fay", 3)], "t2")]))).state, "absent"));
  await ok("SerpApi-Fehler → unknown (nie absent)", async () => assert.equal((await strictListCheck(base, async () => ({ reviews: [], next: null, error: "boom" }))).state, "unknown"));
  await ok("Zu viele Seiten, nicht zu Ende → unknown", async () => assert.equal((await strictListCheck({ ...base, rating: null }, async () => page([rev("Zed", 1)], "more"), 3)).state, "unknown"));
  await ok("Weder Review-ID noch Name → unknown", async () => assert.equal((await strictListCheck({ ...base, name: "" }, one([page([])]))).state, "unknown"));
  await ok("Kein Profil (weder Link noch placeId) → unknown", async () => assert.equal((await strictListCheck({ ...base, url: "https://x", placeId: null }, one([page([])]))).state, "unknown"));
  await ok("Positive Bewertung (5★) → sucht von oben, findet sie auch bei 4★", async () => assert.equal((await strictListCheck({ ...base, rating: 5 }, one([page([rev("A", 5), rev("B", 4)], "t"), page([rev("Ann Smith", 4)])]))).state, "listed"));
  await ok("Positive Bewertung (5★) → erst bei 3★ absent", async () => assert.equal((await strictListCheck({ ...base, rating: 5 }, one([page([rev("A", 5), rev("B", 4), rev("C", 3)], "t")]))).state, "absent"));

  console.log(`\n${n} Tests bestanden`);
})().catch((e) => { console.error("✗", e); process.exit(1); });
