/* Tests: Zahlungslink ändern → Auftragsfelder aus den Link-Positionen.  Start: npx tsx src/orderPayLink.test.ts */
import assert from "node:assert/strict";
import { orderFromLink, applyLabel } from "./orderPayLink";

let n = 0;
const ok = (name: string, fn: () => unknown) => { fn(); n++; console.log("✓", name); };
const e = (amount: number, interval = "once", currency = "eur") => ({ amount: Math.round(amount * 100), interval, currency });

ok("Löschung + Lebenslang (alter Preis 450)", () => {
  assert.deepEqual(orderFromLink([e(450), e(990)]), { currency: "eur", amount: 450, protection: "lifetime", protAmount: 990, express: false, expressAmount: 0 });
});
ok("Löschung + Lebenslang (Reihenfolge egal)", () => {
  const a = orderFromLink([e(990), e(559)]);
  assert.ok(!("error" in a) && a.amount === 559 && a.protection === "lifetime");
});
ok("Nur Löschung", () => {
  assert.deepEqual(orderFromLink([e(559)]), { currency: "eur", amount: 559, protection: "none", protAmount: 0, express: false, expressAmount: 0 });
});
ok("Einzelposition 990 ist Leistung, kein Schutz", () => {
  const a = orderFromLink([e(990)]);
  assert.ok(!("error" in a) && a.protection === "none" && a.amount === 990);
});
ok("Monats- und Jahresabo", () => {
  const m = orderFromLink([e(559), e(29.9, "month")]);
  assert.ok(!("error" in m) && m.protection === "monthly" && m.protAmount === 29.9);
  const old = orderFromLink([e(450), e(24.9, "month")]);
  assert.ok(!("error" in old) && old.protection === "monthly" && old.protAmount === 24.9);
  const y = orderFromLink([e(559), e(299, "year")]);
  assert.ok(!("error" in y) && y.protection === "yearly" && y.protAmount === 299);
  const mon = orderFromLink([e(450), e(69.9, "month")]);
  assert.ok(!("error" in mon) && mon.protection === "monitor");
});
ok("Express im Einmalbetrag wird getrennt", () => {
  const a = orderFromLink([e(708), e(990)]);
  assert.ok(!("error" in a) && a.amount === 559 && a.express && a.expressAmount === 149 && a.protection === "lifetime");
  const old = orderFromLink([e(599)]);
  assert.ok(!("error" in old) && old.amount === 450 && old.express);
});
ok("USD", () => {
  const a = orderFromLink([e(619, "once", "usd"), e(990, "once", "usd")]);
  assert.ok(!("error" in a) && a.currency === "usd" && a.protection === "lifetime" && a.amount === 619);
});
ok("Fehlerfälle", () => {
  assert.ok("error" in orderFromLink([]));
  assert.ok("error" in orderFromLink([e(29.9, "month")]));
  assert.ok("error" in orderFromLink([e(450), e(29.9, "month"), e(299, "year")]));
});
ok("Label", () => {
  const a = orderFromLink([e(450), e(990)]);
  assert.ok(!("error" in a));
  assert.equal(applyLabel(a as any), "Leistung 450 € · Lebenslanger Schutz 990 €");
});
console.log(`${n} Tests ok`);
