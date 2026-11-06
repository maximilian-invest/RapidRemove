/* Tests Preismodell 2 (199/250 + Express; Bestand 179 bzw. 99 bleibt).  Start: npx tsx src/pricingV2.test.ts */
import assert from "node:assert/strict";
import { quoteReviews, listPriceV2, lpOf, isFreshLp, isPausedReview, PRICE_V2_FRESH_LEGACY2, expressMet, expressCustomerDue, expressPartnerDue, PRICE_V2_FRESH, PRICE_V2_FRESH_LEGACY, PRICE_V2_OTHER, EXPRESS_FEE } from "./reviewsPricing";

let n = 0;
const ok = (name: string, fn: () => unknown) => { fn(); n++; console.log("✓", name); };

ok("Neuer Frisch-Preis = 199, alte = 179 und 99", () => { assert.equal(PRICE_V2_FRESH, 199); assert.equal(PRICE_V2_FRESH_LEGACY2, 179); assert.equal(PRICE_V2_FRESH_LEGACY, 99); });
ok("Listenpreis: frisch mit Text = 199", () => assert.equal(listPriceV2({ days: 3 }), 199));
ok("Listenpreis: 28 Tage = noch frisch", () => assert.equal(listPriceV2({ days: 28 }), PRICE_V2_FRESH));
ok("Listenpreis: 29 Tage = 250", () => assert.equal(listPriceV2({ days: 29 }), PRICE_V2_OTHER));
ok("Listenpreis: old-Flag = 250", () => assert.equal(listPriceV2({ old: true }), PRICE_V2_OTHER));
ok("Listenpreis: ohne Text (nt) = 250", () => assert.equal(listPriceV2({ nt: true, days: 2 }), PRICE_V2_OTHER));
ok("Listenpreis: Software (sw) = 250", () => assert.equal(listPriceV2({ sw: true }), PRICE_V2_OTHER));
ok("lpOf: 199 (neu), 179 + 99 (Bestand) und 250 gelten", () => { assert.equal(lpOf({ lp: 199 }), 199); assert.equal(lpOf({ lp: 179 }), 179); assert.equal(lpOf({ lp: 99 }), 99); assert.equal(lpOf({ lp: 250 }), 250); assert.equal(lpOf({ lp: 100 }), 0); assert.equal(lpOf({}), 0); assert.ok(isFreshLp(99) && isFreshLp(179) && isFreshLp(199) && !isFreshLp(250)); });

ok("Bestandsauftrag (ohne lp) unverändert: 179 / 229 / 300", () => {
  const q = quoteReviews([{}, { old: true }, { nt: true }], "eur");
  assert.equal(q.subtotal, 179 + 229 + 300);
  assert.equal(q.total, Math.round((179 + 229 + 300) * 0.9)); // 3 Bewertungen −10 %
});
ok("Modell 2 neu: 2 × 199 ohne Rabatt", () => { const q = quoteReviews([{ lp: 199 }, { lp: 199 }], "usd"); assert.equal(q.total, 398); assert.equal(q.per, "$199"); });
ok("Bestand: 2 × 179 bleibt 179", () => { const q = quoteReviews([{ lp: 179 }, { lp: 179 }], "usd"); assert.equal(q.total, 358); assert.equal(q.per, "$179"); assert.equal(q.nFreshOld, 2); });
ok("Gemischt: 99 + 179 (Bestand) + 199 (neu)", () => { const q = quoteReviews([{ lp: 99 }, { lp: 179 }, { lp: 199 }], "eur"); assert.equal(q.subtotal, 477); assert.equal(q.total, Math.round(477 * 0.9)); assert.equal(q.per, "99 € / 179 € / 199 € (−10 %)"); assert.equal(q.freshOldLines.length, 2); });
ok("Pause: älter 28 Tage / ohne Text / sw / old nicht bestellbar, frisch schon", () => { assert.equal(isPausedReview({ days: 29 }), true); assert.equal(isPausedReview({ nt: true, days: 1 }), true); assert.equal(isPausedReview({ old: true }), true); assert.equal(isPausedReview({ sw: true }), true); assert.equal(isPausedReview({ days: 28 }), false); assert.equal(isPausedReview({}), false); });
ok("Bestand: 2 × 99 bleibt 99 (Einzug autopay/Ersatzlink)", () => { const q = quoteReviews([{ lp: 99 }, { lp: 99 }], "usd"); assert.equal(q.total, 198); assert.equal(q.per, "$99"); });
ok("Bestand: 99er in Abrechnung „rest\" bleibt 99", () => assert.equal(quoteReviews([{ lp: 99 }], "eur", 1, "rest").total, 99));
ok("Gemischt: 99 (Bestand) + 179 (neu) → beide Stückpreise", () => { const q = quoteReviews([{ lp: 99 }, { lp: 179 }], "eur"); assert.equal(q.total, 278); assert.equal(q.n99, 2); assert.equal(q.per, "99 € / 179 €"); });
ok("Modell 2: 179 + 250 + 250 → −10 %", () => { const q = quoteReviews([{ lp: 179 }, { lp: 250, old: true }, { lp: 250, nt: true }], "eur"); assert.equal(q.total, Math.round(679 * 0.9)); assert.equal(q.nNt, 0); });
ok("Bestand: 99 + 250 + 250 → −10 %", () => { const q = quoteReviews([{ lp: 99 }, { lp: 250, old: true }, { lp: 250, nt: true }], "eur"); assert.equal(q.total, Math.round(599 * 0.9)); });
ok("Modell 2: Software-Flags zählen nicht als 300", () => { const q = quoteReviews([{ lp: 250, nt: true }], "eur"); assert.equal(q.total, 250); assert.equal(q.ntDeposit, 0); });
ok("Express voll (Maximalbetrag): +100 je 250er, ohne Rabatt", () => {
  const q = quoteReviews([{ lp: 250, x: true }, { lp: 250, x: true }, { lp: 179 }], "eur");
  assert.equal(q.nX, 2); assert.equal(q.xTotal, 2 * EXPRESS_FEE);
  assert.equal(q.total, Math.round(679 * 0.9) + 200);
});
ok("Express auf Frische wird ignoriert", () => { assert.equal(quoteReviews([{ lp: 179, x: true }], "eur").total, 179); assert.equal(quoteReviews([{ lp: 99, x: true }], "eur").total, 99); });
ok("Abrechnung (rest): Express nur wenn eingehalten", () => {
  assert.equal(quoteReviews([{ lp: 250, x: true, xOk: true }], "eur", 1, "rest").total, 350);
  assert.equal(quoteReviews([{ lp: 250, x: true, xOk: false }], "eur", 1, "rest").total, 250);
});
ok("Abrechnung (rest) mit Mengenrabatt-Basis aus dem ganzen Auftrag", () => assert.equal(quoteReviews([{ lp: 250 }], "eur", 5, "rest").total, Math.round(250 * 0.85)));
ok("PayPal/Wise −10 % nicht auf Express", () => assert.equal(quoteReviews([{ lp: 250, x: true }], "eur", undefined, "full", 0, 10).total, 225 + 100));
ok("Fixer Mengen-Link (simple) nie bei Modell 2 – auch nicht bei 179 oder Bestand 99", () => { assert.equal(quoteReviews([{ lp: 99 }], "eur", 1, "rest").simple, false); assert.equal(quoteReviews([{ lp: 179 }], "eur", 1, "rest").simple, false); });
ok("Mengen-Link (179 je Stück) nur bei reinen 179er-Bewertungen aus Preismodell 1", () => { assert.equal(quoteReviews([{}, {}], "eur", 2, "rest").simple, true); assert.equal(quoteReviews([{ old: true }], "eur", 1, "rest").simple, false); assert.equal(quoteReviews([{ cp: 120 }], "eur", 1, "rest").simple, false); });
ok("expressMet: 29 Std. = ja, 31 Std. = nein", () => {
  const a = "2026-10-14T10:00:00.000Z"; // Mi 12:00 Wien
  assert.equal(expressMet(a, "2026-10-15T15:00:00.000Z"), true);
  assert.equal(expressMet(a, "2026-10-15T16:00:00.000Z"), true); // genau 30 Std.
  assert.equal(expressMet(a, "2026-10-15T17:00:00.000Z"), false);
  assert.equal(expressMet(null, "2026-10-15T15:00:00.000Z"), false);
  assert.equal(expressMet(a, null), false);
});
ok("Express-Frist: Mo–Fr 12:00 → 30 Std.", () => {
  // Do 15.10.2026 10:00 Wien (CEST, UTC+2) = 08:00Z → +30 Std.
  assert.equal(expressCustomerDue("2026-10-15T08:00:00.000Z"), "2026-10-16T14:00:00.000Z");
  // Fr 16.10. 11:59 Wien = 09:59Z → noch 30 Std. (endet Sa)
  assert.equal(expressCustomerDue("2026-10-16T09:59:00.000Z"), "2026-10-17T15:59:00.000Z");
  assert.equal(expressPartnerDue("2026-10-15T08:00:00.000Z"), "2026-10-16T08:00:00.000Z");
});
ok("Express-Frist: Fr ab 12:00 / Sa / So → Di 24:00 Wien", () => {
  // Fr 16.10. 12:00 Wien = 10:00Z → Mi 21.10. 0:00 Wien = 20.10. 22:00Z
  assert.equal(expressCustomerDue("2026-10-16T10:00:00.000Z"), "2026-10-20T22:00:00.000Z");
  assert.equal(expressCustomerDue("2026-10-17T20:00:00.000Z"), "2026-10-20T22:00:00.000Z"); // Sa
  assert.equal(expressCustomerDue("2026-10-18T21:59:00.000Z"), "2026-10-20T22:00:00.000Z"); // So 23:59
  assert.equal(expressPartnerDue("2026-10-17T20:00:00.000Z"), "2026-10-20T16:00:00.000Z"); // Partner Di 18:00
  // Mo 19.10. 0:00 Wien = 18.10. 22:00Z → wieder 30 Std.
  assert.equal(expressCustomerDue("2026-10-18T22:00:00.000Z"), "2026-10-20T04:00:00.000Z");
});
ok("Express-Frist über Zeitumstellung (Sa 24.10. → Winterzeit 25.10.)", () => {
  // Sa 24.10. 10:00 Wien (CEST) → Mi 28.10. 0:00 Wien (CET, UTC+1) = 27.10. 23:00Z
  assert.equal(expressCustomerDue("2026-10-24T08:00:00.000Z"), "2026-10-27T23:00:00.000Z");
});
ok("expressMet am Wochenende: bis Di 24:00 ja, danach nein", () => {
  const a = "2026-10-17T08:00:00.000Z"; // Sa
  assert.equal(expressMet(a, "2026-10-20T21:59:00.000Z"), true);
  assert.equal(expressMet(a, "2026-10-20T22:01:00.000Z"), false);
});
console.log(`\n${n} Tests ok`);

// ---- Preis nach Land × Branche (06.11.2026) ----
import { freshPriceFor, round9, PRICE_V2_FRESH_TIERS } from "./reviewsPricing";
import { industryOf, isPremiumIndustry, industryFromDisplay } from "./industry";
ok("Land × Branche: 199 / 249 / 249 / 309", () => {
  assert.equal(freshPriceFor("AT", false), 199); assert.equal(freshPriceFor("FR", false), 199);
  assert.equal(freshPriceFor("US", false), 249); assert.equal(freshPriceFor("ch", false), 249); assert.equal(freshPriceFor("JP", false), 249);
  assert.equal(freshPriceFor("IT", true), 249); assert.equal(freshPriceFor("US", true), 309); assert.equal(freshPriceFor("", true), 249);
  assert.deepEqual([...PRICE_V2_FRESH_TIERS].sort(), [199, 249, 309]); assert.equal(round9(248.75), 249); assert.equal(round9(311.25), 309);
});
ok("Listenpreis mit Preisstufe; 250er bleiben 250; unbekannte Stufe → 199", () => {
  assert.equal(listPriceV2({ days: 3 }, 309), 309); assert.equal(listPriceV2({ days: 40 }, 309), PRICE_V2_OTHER);
  assert.equal(listPriceV2({ days: 3 }, 500), 199); assert.equal(lpOf({ lp: 249 }), 249); assert.equal(lpOf({ lp: 309 }), 309); assert.ok(isFreshLp(249) && isFreshLp(309));
});
ok("Quote mit 309 und 249: Summe + Mengenrabatt", () => {
  const q = quoteReviews([{ lp: 309 }, { lp: 309 }, { lp: 309 }], "usd"); assert.equal(q.total, Math.round(927 * 0.9)); assert.equal(q.per, "$309 (−10 %)");
  const q2 = quoteReviews([{ lp: 249 }, { lp: 199 }], "eur"); assert.equal(q2.total, 448);
});
ok("Branche aus Google-Code", () => {
  assert.equal(industryOf("pizza_restaurant", []), "gastro"); assert.equal(industryOf("", ["point_of_interest", "dentist"]), "medical");
  assert.equal(industryOf("car_dealer"), "cardealer"); assert.equal(industryOf("car_repair"), "auto"); assert.equal(industryOf("lawyer"), "legal");
  assert.ok(isPremiumIndustry("gastro") && isPremiumIndustry("hotel") && !isPremiumIndustry("beauty") && !isPremiumIndustry("auto"));
  assert.equal(industryOf(null, null), "unknown"); assert.equal(industryFromDisplay("Ristorante"), "gastro"); assert.equal(industryFromDisplay("Zahnarzt"), "medical");
});
