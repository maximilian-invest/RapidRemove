/* Tests Bulk-Upload + Preisstaffeln.  Start: npx tsx src/bulk.test.ts */
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { classifyLink, linksIn, parseBulk, parseCsv } from "./bulkParse";
import { normTiers, tierFor } from "./bulkPricing";

let n = 0;
const ok = async (name: string, fn: () => unknown) => { await fn(); n++; console.log("✓", name); };
const RID = "ChZDSUhNMG9nS0VJQ0FnSUNZcF83MVFBEAE";
const LONG = `https://www.google.com/maps/reviews/@40.76,-73.96,614m/data=!3m2!1e3!4b1!4m6!14m5!1m4!2m3!1s${RID}!2m1!1s0x0:0x31df?hl=en`;

(async () => {
  // ---- Links ----
  await ok("langer Bewertungslink → review (Schlüssel = Review-ID)", () => { const c = classifyLink(LONG); assert.equal(c.kind, "review"); assert.equal(c.key, "rid:" + RID); });
  await ok("Kurzlinks → short", () => { for (const u of ["https://maps.app.goo.gl/AbCdEf123", "https://share.google/XyZ123", "https://goo.gl/maps/AbC123", "https://g.co/kgs/AbC123"]) assert.equal(classifyLink(u).kind, "short", u); });
  await ok("Profil-/Ortslink → kein Bewertungslink", () => { assert.equal(classifyLink("https://www.google.com/maps/place/Shop/@1,2,17z").kind, "notReview"); assert.equal(classifyLink("https://search.google.com/local/reviews?placeid=X").kind, "notReview"); });
  await ok("fremde Websites ignoriert", () => assert.equal(classifyLink("https://example.com/maps/x").kind, "other"));
  await ok("Links im Fließtext, ohne https, mit Satzzeichen", () => assert.deepEqual(linksIn("Bitte löschen: maps.app.goo.gl/Abc123. Und (https://share.google/Xy9)!"), ["https://maps.app.goo.gl/Abc123", "https://share.google/Xy9"]));
  await ok("&amp; im Link (HTML) wird zu &", () => assert.equal(linksIn(`<a href="${LONG.replace("?", "?a=1&amp;")}">`)[0].includes("&amp;"), false));

  // ---- CSV ----
  await ok("CSV mit ; und Anführungszeichen", () => assert.deepEqual(parseCsv('a;"b;c";"d ""x"""\n1;2;3'), [["a", "b;c", 'd "x"'], ["1", "2", "3"]]));
  await ok("Tabelle: Link-Zeilen + Zeilen ohne Link (Name+Text) + Kopfzeile", async () => {
    const csv = "Business,Reviewer,Review,Link\nShop A,Ann,Bad,https://maps.app.goo.gl/A1b2C3d4\nShop B,Bob,Awful service,\n,,,\nShop C,,just note,";
    const r = await parseBulk([{ name: "x.csv", data: Buffer.from(csv) }]);
    assert.equal(r.items.length, 2);
    assert.deepEqual(r.items.map((x) => x.business), ["Shop A", "Shop B"]);
    assert.equal(r.items[1].url, undefined); assert.equal(r.items[1].text, "Awful service");
    assert.equal(r.noLinkRows, 1);
  });
  await ok("doppelte Links (auch quer über Dateien) zusammengefasst", async () => {
    const r = await parseBulk([{ name: "a.txt", data: Buffer.from(LONG + "\n" + LONG) }, { name: "b.txt", data: Buffer.from(LONG.replace("hl=en", "hl=de")) }]);
    assert.equal(r.items.length, 1); assert.equal(r.dupInFile, 2);
  });
  await ok("Word (docx): Link als Hyperlink-Ziel hinter „hier klicken“ + über Formatwechsel zerteilter Link", async () => {
    const doc = `<w:document><w:body><w:p><w:hyperlink r:id="rId5"><w:r><w:t>hier klicken</w:t></w:r></w:hyperlink></w:p><w:p><w:r><w:t>https://maps.app.goo.gl/Sp</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>lit42</w:t></w:r></w:p></w:body></w:document>`;
    const rels = `<Relationships><Relationship Id="rId5" Type="hyperlink" Target="https://share.google/Hidden77" TargetMode="External"/></Relationships>`;
    const z = Buffer.from(zipSync({ "word/document.xml": strToU8(doc), "word/_rels/document.xml.rels": strToU8(rels) }));
    const r = await parseBulk([{ name: "x.docx", data: z }]);
    assert.deepEqual(r.items.map((x) => x.url).sort(), ["https://maps.app.goo.gl/Split42", "https://share.google/Hidden77"]);
  });
  await ok("Excel-XML: Zellen werden NICHT zusammengeklebt", async () => {
    const sh = `<sst><si><t>https://maps.app.goo.gl/Cell1</t></si><si><t>Name</t></si></sst>`;
    const z = Buffer.from(zipSync({ "xl/sharedStrings.xml": strToU8(sh), "xl/worksheets/sheet1.xml": strToU8(`<sheetData><row><c><v>0</v></c><c><v>1</v></c></row></sheetData>`) }));
    const r = await parseBulk([{ name: "x.ods", data: z }]);
    assert.deepEqual(r.items.map((x) => x.url), ["https://maps.app.goo.gl/Cell1"]);
  });
  await ok("altes Binärformat (UTF-16) – auch ungerade ausgerichtet", async () => {
    const u = Buffer.from("https://maps.app.goo.gl/Bin77", "utf16le");
    const r = await parseBulk([{ name: "x.doc", data: Buffer.concat([Buffer.from([0, 1, 2]), u, Buffer.from([0, 0])]) }]);
    assert.deepEqual(r.items.map((x) => x.url), ["https://maps.app.goo.gl/Bin77"]);
  });
  await ok("Bild → Fehler „image“, Rest läuft weiter", async () => {
    const r = await parseBulk([{ name: "s.png", data: Buffer.from("x") }, { name: "a.txt", data: Buffer.from("https://share.google/Ok12345") }]);
    assert.equal(r.files[0].error, "image"); assert.equal(r.items.length, 1);
  });
  await ok("über 5.000 → abgeschnitten + markiert", async () => {
    const t = Array.from({ length: 5200 }, (_, i) => `https://share.google/T${i}`).join("\n");
    const r = await parseBulk([], t);
    assert.equal(r.items.length, 5000); assert.equal(r.truncated, true);
  });

  // ---- Staffeln ----
  const T = normTiers([{ upTo: 200, price: 79 }, { upTo: 50, price: 99 }, { upTo: null, price: 59 }])!;
  await ok("Staffel wird sortiert, letzte Stufe offen", () => assert.deepEqual(T, [{ upTo: 50, price: 99 }, { upTo: 200, price: 79 }, { upTo: null, price: 59 }]));
  await ok("Stufen: 1→99, 50→99, 51→79, 200→79, 201→59, 5000→59", () => {
    assert.deepEqual([1, 50, 51, 200, 201, 5000].map((k) => tierFor(T, k).price), [99, 99, 79, 79, 59, 59]);
    assert.deepEqual(tierFor(T, 51), { idx: 1, price: 79, from: 51, to: 200 });
  });
  await ok("ohne offene Stufe: letzte Grenze gilt darüber weiter", () => { const t = normTiers([{ upTo: 100, price: 50 }])!; assert.equal(tierFor(t, 1000).price, 50); assert.equal(t[1].upTo, null); });
  await ok("ungültige Staffeln abgelehnt", () => {
    assert.equal(normTiers([]), null);
    assert.equal(normTiers([{ upTo: 50, price: 0 }]), null);
    assert.equal(normTiers([{ upTo: 50, price: 10 }, { upTo: 50, price: 9 }]), null);
    assert.equal(normTiers([{ upTo: null, price: 10 }, { upTo: null, price: 9 }]), null);
    assert.equal(normTiers([{ upTo: -1, price: 10 }]), null);
  });
  await ok("Komma-Preise (99,50) werden verstanden", () => assert.equal(normTiers([{ upTo: null, price: "99,50" }])![0].price, 99.5));

  console.log(`\n${n} Tests bestanden`);
  process.exit(0);
})().catch((e) => { console.error("✗", e); process.exit(1); });
