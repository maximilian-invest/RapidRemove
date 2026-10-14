/* Tests für die Seiten-Erkennung (gelöscht / sichtbar / unklar).  Start: npx tsx src/reviewPage.test.ts */
import assert from "node:assert/strict";
import { classify, snapFromHtml, reviewIdOf, type Snap } from "./reviewPage";

let n = 0;
const ok = (name: string, fn: () => void) => { fn(); n++; console.log("✓", name); };
const S = (text: string, reviewIds: string[] = [], stars = false): Snap => ({ text, reviewIds, stars });
const ID = "ChdDSUhNMG9nS0VJQ0FnSUQ7emFDdUpnEAE";

ok("„no longer available“ ohne Bewertung → gone", () => assert.equal(classify(S("Dr. X PLACE DETAILS This review is no longer available."), "", ""), "gone"));
ok("deutsch „nicht mehr verfügbar“ → gone", () => assert.equal(classify(S("ORTSDETAILS Diese Rezension ist nicht mehr verfügbar."), "", ""), "gone"));
ok("„no longer available“ UND Bewertung angezeigt → nie gone", () => assert.equal(classify(S("This review is no longer available", ["Cabc"], true), "", ""), "unknown"));
ok("Bewertung mit Sternen, ohne Namen → visible", () => assert.equal(classify(S("Hotel · Reviews aren't verified · Xenia · a year ago", ["Cxyz"], true), "", ""), "visible"));
ok("genau diese Review-ID angezeigt → visible (auch ohne Sterne)", () => assert.equal(classify(S("…", [ID], false), "", ID), "visible"));
ok("Verfassername auf der Seite → visible (wie bisher)", () => assert.equal(classify(S("Kumori · Nico · a month ago"), "nico", ""), "visible"));
ok("Verfasser-Profilseite ohne Bewertung (RV-0005) → unknown", () => assert.equal(classify(S("The Village Seafood · Reviews aren't verified · ghaddah"), "", ""), "unknown"));
ok("leere/ladende Seite → unknown", () => assert.equal(classify(S(" "), "", ""), "unknown"));
ok("Consent-Seite → unknown", () => assert.equal(classify(S("Before you continue to Google"), "", ""), "unknown"));
ok("Bewertungs-Element ohne Sterne und fremde ID → unknown", () => assert.equal(classify(S("…", ["Cother"], false), "", ID), "unknown"));
ok("null → unknown", () => assert.equal(classify(null, "", ""), "unknown"));

ok("HTML: sichtbare Bewertung erkannt", () => {
  const h = `<div data-review-id="${ID}" class="jftiEf"><span class="kvMYJc" role="img" aria-label="1 star"></span><span class="rsqaWe">2 years ago</span><span class="wiI7pd">Absolut unprofessionell</span></div>`;
  const s = snapFromHtml(h);
  assert.deepEqual(s.reviewIds, [ID]); assert.equal(s.stars, true); assert.equal(classify(s, "", ID), "visible");
});
ok("HTML: Attribut-Reihenfolge egal (aria-label vor role)", () => assert.equal(snapFromHtml(`<span aria-label="5 stars" role="img"></span>`).stars, true));
ok("HTML: gelöschte Bewertung", () => assert.equal(classify(snapFromHtml(`<div>PLACE DETAILS</div><div class="x">This review is no longer available.</div><script>var a="data-review"</script>`), "", ID), "gone"));
ok("HTML: Text in <script> zählt nicht als Hinweis", () => assert.equal(classify(snapFromHtml(`<script>"This review is no longer available"</script><div>Hotel</div>`), "", ""), "unknown"));
ok("HTML: „4.5 stars“-Bild ohne Bewertungs-Element → unknown", () => assert.equal(classify(snapFromHtml(`<span role="img" aria-label="4.5 stars"></span>`), "", ""), "unknown"));
ok("Review-ID aus Link", () => assert.equal(reviewIdOf(`https://www.google.com/maps/reviews/@0,0,600m/data=!3m2!1e3!4b1!4m6!14m5!1m4!2m3!1s${ID}!2m1!1s0x0:0x31df`), ID));

console.log(`\n${n} Tests bestanden`);
