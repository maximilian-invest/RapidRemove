/* Tests Preismodell 2 (99/250 + Express).  Start: npx tsx src/pricingV2.test.ts */
import assert from "node:assert/strict";
import { quoteReviews, listPriceV2, lpOf, expressMet, expressCustomerDue, expressPartnerDue, PRICE_V2_FRESH, PRICE_V2_OTHER, EXPRESS_FEE } from "./reviewsPricing";

let n = 0;
const ok = (name: string, fn: () => unknown) => { fn(); n++; console.log("✓", name); };

ok("Listenpreis: frisch mit Text = 99", () => assert.equal(listPriceV2({ days: 3 }), PRICE_V2_FRESH));
ok("Listenpreis: 28 Tage = noch frisch", () => assert.equal(listPriceV2({ days: 28 }), PRICE_V2_FRESH));
ok("Listenpreis: 29 Tage = 250", () => assert.equal(listPriceV2({ days: 29 }), PRICE_V2_OTHER));
ok("Listenpreis: old-Flag = 250", () => assert.equal(listPriceV2({ old: true }), PRICE_V2_OTHER));
ok("Listenpreis: ohne Text (nt) = 250", () => assert.equal(listPriceV2({ nt: true, days: 2 }), PRICE_V2_OTHER));
ok("Listenpreis: Software (sw) = 250", () => assert.equal(listPriceV2({ sw: true }), PRICE_V2_OTHER));
ok("lpOf: nur 99/250 gelten", () => { assert.equal(lpOf({ lp: 99 }), 99); assert.equal(lpOf({ lp: 250 }), 250); assert.equal(lpOf({ lp: 179 }), 0); assert.equal(lpOf({}), 0); });

ok("Bestandsauftrag (ohne lp) unverändert: 179 / 229 / 300", () => {
  const q = quoteReviews([{}, { old: true }, { nt: true }], "eur");
  assert.equal(q.subtotal, 179 + 229 + 300);
  assert.equal(q.total, Math.round((179 + 229 + 300) * 0.9)); // 3 Bewertungen −10 %
});
ok("Modell 2: 2 × 99 ohne Rabatt", () => { const q = quoteReviews([{ lp: 99 }, { lp: 99 }], "usd"); assert.equal(q.total, 198); assert.equal(q.per, "$99"); });
ok("Modell 2: 99 + 250 + 250 → −10 %", () => { const q = quoteReviews([{ lp: 99 }, { lp: 250, old: true }, { lp: 250, nt: true }], "eur"); assert.equal(q.total, Math.round(599 * 0.9)); assert.equal(q.nNt, 0); });
ok("Modell 2: Software-Flags zählen nicht als 300", () => { const q = quoteReviews([{ lp: 250, nt: true }], "eur"); assert.equal(q.total, 250); assert.equal(q.ntDeposit, 0); });
ok("Express voll (Maximalbetrag): +100 je 250er, ohne Rabatt", () => {
  const q = quoteReviews([{ lp: 250, x: true }, { lp: 250, x: true }, { lp: 99 }], "eur");
  assert.equal(q.nX, 2); assert.equal(q.xTotal, 2 * EXPRESS_FEE);
  assert.equal(q.total, Math.round(599 * 0.9) + 200);
});
ok("Express auf 99er wird ignoriert", () => assert.equal(quoteReviews([{ lp: 99, x: true }], "eur").total, 99));
ok("Abrechnung (rest): Express nur wenn eingehalten", () => {
  assert.equal(quoteReviews([{ lp: 250, x: true, xOk: true }], "eur", 1, "rest").total, 350);
  assert.equal(quoteReviews([{ lp: 250, x: true, xOk: false }], "eur", 1, "rest").total, 250);
});
ok("Abrechnung (rest) mit Mengenrabatt-Basis aus dem ganzen Auftrag", () => assert.equal(quoteReviews([{ lp: 250 }], "eur", 5, "rest").total, Math.round(250 * 0.85)));
ok("PayPal/Wise −10 % nicht auf Express", () => assert.equal(quoteReviews([{ lp: 250, x: true }], "eur", undefined, "full", 0, 10).total, 225 + 100));
ok("Fixer Zahlungslink (simple) nie bei Modell 2", () => assert.equal(quoteReviews([{ lp: 99 }], "eur").simple, false));
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
