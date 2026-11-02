/* Tests Löschdauer (Admin → Express & Löschdauer).  Start: npx tsx src/durations.test.ts */
import assert from "node:assert/strict";
import React from "react";
import { render } from "@react-email/render";
import * as B from "./durations";
// @ts-expect-error – Website-Variante (plain JS), muss exakt gleich formatieren
import * as W0 from "../../src/lib/durations.js";
const W = ((W0 as { default?: unknown }).default || W0) as typeof B;
import AuftragsbestaetigungReviews, { T as TA } from "./emails/AuftragsbestaetigungReviews";
import BearbeitungGestartetReviews, { T as TB } from "./emails/BearbeitungGestartetReviews";
import { KNOWLEDGE } from "./chat/knowledge";

let n = 0;
const ok = async (name: string, fn: () => unknown) => { await fn(); n++; console.log("✓", name); };
const D721: B.Durations = { fresh: { min: 7, max: 21, unit: "d" }, other: { min: 2, max: 4, unit: "w" } };
const LANGS = ["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"];

await ok("Standard = 1–2 Wochen für beide Stufen", () => {
  assert.equal(B.fmtTier(B.DUR_DEFAULT.fresh, "de"), "1–2 Wochen");
  assert.equal(B.fmtTier(B.DUR_DEFAULT.other, "en"), "1–2 weeks");
});
await ok("Formate je Sprache", () => {
  assert.equal(B.fmtTier({ min: 7, max: 21, unit: "d" }, "de"), "7–21 Tage");
  assert.equal(B.fmtTier({ min: 7, max: 21, unit: "d" }, "en"), "7–21 days");
  assert.equal(B.fmtTier({ min: 7, max: 21, unit: "d" }, "ja"), "7〜21日");
  assert.equal(B.fmtTier({ min: 1, max: 2, unit: "w" }, "ja"), "1〜2週間");
  assert.equal(B.fmtTier({ min: 1, max: 1, unit: "w" }, "en"), "1 week");
  assert.equal(B.fmtTier({ min: 5, max: 5, unit: "d" }, "fr"), "5 jours");
  assert.equal(B.fmtTier({ min: 7, max: 21, unit: "d" }, "xx"), "7–21 days");
});
await ok("Deutsch: Dativ nach „in“/„von“, sonst Nominativ", () => {
  assert.equal(B.fillDur("Meist in {DF} gelöscht", "de", D721), "Meist in 7–21 Tagen gelöscht");
  assert.equal(B.fillDur("Meist innerhalb von {DF} gelöscht", "de", D721), "Meist innerhalb von 7–21 Tagen gelöscht");
  assert.equal(B.fillDur("dauert meist {DF}", "de", D721), "dauert meist 7–21 Tage");
  assert.equal(B.fillDur("{DO}", "de", D721), "2–4 Wochen");
});
await ok("{DA} = Spanne über beide Stufen (gemischte Einheiten in Tagen)", () => {
  assert.equal(B.fillDur("{DA}", "en", D721), "7–28 days");
  assert.equal(B.fillDur("{DA}", "en", B.DUR_DEFAULT), "1–2 weeks");
});
await ok("{DF:de} = feste Sprache im englischen Prompt", () => assert.equal(B.fillDur("x {DF:de} / {DO}", "en", D721), "x 7–21 Tage / 2–4 weeks"));
await ok("Ungültige Werte → Standard", () => {
  assert.equal(B.normTier({ min: 0, max: 2, unit: "w" }), null);
  assert.equal(B.normTier({ min: 5, max: 3, unit: "d" }), null);
  assert.equal(B.normTier({ min: 1, max: 400, unit: "d" }), null);
  assert.equal(B.normTier({ min: 1, max: 2, unit: "m" }), null);
  assert.deepEqual(B.normDur({ fresh: { min: "7", max: "21", unit: "d" } }), { fresh: { min: 7, max: 21, unit: "d" }, other: { min: 1, max: 2, unit: "w" } });
});
await ok("Website und Backend formatieren identisch", () => {
  const texts = ["Meist in {DF} gelöscht", "innerhalb von {DO}", "{DA}", "{DF:de} {DO}"];
  for (const d of [B.DUR_DEFAULT, D721, { fresh: { min: 1, max: 1, unit: "w" }, other: { min: 3, max: 3, unit: "d" } }] as B.Durations[])
    for (const l of LANGS) for (const t of texts) assert.equal(W.fillDur(t, l, d), B.fillDur(t, l, d), `${l} ${t}`);
});
await ok("Mail-Texte: alle Sprachen mit Platzhaltern, keine feste Dauer mehr", () => {
  for (const l of LANGS) {
    assert.match(String(TA[l].durV2), /\{DF\}.*\{DO\}/, "Auftragsbestätigung " + l);
    assert.match(String(TB[l].next1v2), /\{DF\}.*\{DO\}/, "Bearbeitung gestartet " + l);
    assert.match(String(TB[l].next1), /\{DA\}/, "Bearbeitung gestartet next1 " + l);
  }
});
await ok("Mails rendern mit eingestellter Dauer (de + en), keine Platzhalter übrig", async () => {
  // curDur() setzen wie nach dem Speichern im Admin – ohne Datenbank direkt über fillDur geprüft
  const items = [{ url: "https://maps.google.com/?cid=1", lp: 179 }, { url: "https://maps.google.com/?cid=2", lp: 250, old: true }];
  const prev = B.curDur();
  Object.assign(prev.fresh, D721.fresh); Object.assign(prev.other, D721.other);
  try {
    for (const [lang, a, b] of [["de", "in 7–21 Tagen", "in 2–4 Wochen"], ["en", "within 7–21 days", "within 2–4 weeks"]]) {
      const h1 = await render(React.createElement(AuftragsbestaetigungReviews, { lang, name: "Max", items, per: "€", currency: "eur", orderId: "T1" } as never));
      const h2 = await render(React.createElement(BearbeitungGestartetReviews, { lang, name: "Max", items, per: "€", currency: "eur", orderId: "T1" } as never));
      for (const h of [h1, h2]) { assert.ok(!/\{D[FOA]/.test(h), "Platzhalter übrig " + lang); assert.ok(h.includes(a) && h.includes(b), `Dauer fehlt (${lang}): ${a} / ${b}`); }
    }
  } finally { Object.assign(prev.fresh, B.DUR_DEFAULT.fresh); Object.assign(prev.other, B.DUR_DEFAULT.other); }
});
await ok("Chat-Wissensbasis: deutsche Platzhalter", () => {
  assert.equal((KNOWLEDGE.match(/\{D[FO]:de\}/g) || []).length, 6);
  assert.ok(!/\{D[FOA]:de\}/.test(B.fillDur(KNOWLEDGE, "en", D721)));
  assert.ok(B.fillDur(KNOWLEDGE, "en", D721).includes("meist 7–21 Tage"));
});
console.log(`\n${n} Tests ok`);
