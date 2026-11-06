/* Tests Profil-Preise nach Branche + Zahlungslinks (06.11.2026).  Start: npx tsx src/profilePricing.test.ts */
import assert from "node:assert/strict";
import { profilePriceFor, profileOneTime, PROFILE_LIST_PRICES, PROFILE_EXPRESS_FEE } from "./reviewsPricing";

let n = 0;
const ok = async (name: string, fn: () => unknown) => { await fn(); n++; console.log("✓", name); };

await ok("Profil-Preise Standard/Premium", () => {
  assert.equal(profilePriceFor("remove", "eur", false), 450); assert.equal(profilePriceFor("remove", "usd", false), 495);
  assert.equal(profilePriceFor("remove", "eur", true), 559); assert.equal(profilePriceFor("remove", "usd", true), 619);
  assert.equal(profilePriceFor("reset", "eur", false), 850); assert.equal(profilePriceFor("reset", "usd", false), 950);
  assert.equal(profilePriceFor("reset", "eur", true), 1059); assert.equal(profilePriceFor("reset", "usd", true), 1189);
  assert.deepEqual([...PROFILE_LIST_PRICES].sort((a, b) => a - b), [450, 495, 559, 619, 850, 950, 1059, 1189]);
});
await ok("Einmalbetrag: Express nie doppelt (Altbestand amount inkl. Express)", () => {
  assert.equal(profileOneTime(450, true, 149), 599);   // neu: amount ohne Express
  assert.equal(profileOneTime(599, true, 149), 599);   // alt: amount schon inkl. Express
  assert.equal(profileOneTime(559, true, 149), 708);
  assert.equal(profileOneTime(708, true, 149), 708);
  assert.equal(profileOneTime(450, false, 149), 450);
  assert.equal(profileOneTime(405, true, 149), 554);   // Chat-Rabatt: kein Listenpreis → normal addieren
});

// ---- ensureProfileLink mit nachgebautem Stripe ----
process.env.STRIPE_SECRET_KEY = "sk_test_x";
const calls: { method: string; path: string; body: string }[] = [];
const P = (id: string, amt: number, cur: string, key: string, rec?: string, product = "prod_" + key + "_" + cur) => ({ id, unit_amount: amt, currency: cur, recurring: rec ? { interval: rec } : null, product, tax_behavior: "exclusive", metadata: { product_key: key } });
const links: Record<string, { link: any; items: any[] }> = {
  plA: { link: { id: "plA", url: "https://buy/A", active: true, metadata: {}, allow_promotion_codes: true, invoice_creation: { enabled: true, invoice_data: { footer: "UID Leistender / Supplier VAT ID: ATU72401536" } }, after_completion: { type: "hosted_confirmation" } }, items: [P("p450", 45000, "eur", "removal")] },
  plB: { link: { id: "plB", url: "https://buy/B", active: true, metadata: {}, allow_promotion_codes: true }, items: [P("p450", 45000, "eur", "removal"), P("pMon", 2490, "eur", "protection", "month")] },
  plC: { link: { id: "plC", url: "https://buy/C", active: true, metadata: {}, allow_promotion_codes: true }, items: [P("p495", 49500, "usd", "removal"), P("pLifeU", 99000, "usd", "protection")] },
  plD: { link: { id: "plD", url: "https://buy/D", active: true, metadata: { affiliate_partner: "x" } }, items: [P("p450", 45000, "eur", "removal")] },
  plR: { link: { id: "plR", url: "https://buy/R", active: true, metadata: {} }, items: [P("p350", 35000, "eur", "reset", undefined, "prod_reset_eur"), P("pMon", 2490, "eur", "protection", "month")] },
};
(globalThis as any).fetch = async (url: string, init: any = {}) => {
  const path = url.replace("https://api.stripe.com/v1/", "").split("?")[0];
  calls.push({ method: init.method || "GET", path, body: String(init.body || "") });
  const j = (o: unknown) => ({ ok: true, status: 200, text: async () => JSON.stringify(o) });
  if (path === "payment_links" && (init.method || "GET") === "GET") return j({ data: Object.values(links).map((x) => x.link), has_more: false });
  const m = path.match(/^payment_links\/(\w+)\/line_items$/); if (m) return j({ data: links[m[1]].items.map((price) => ({ price })) });
  if (path === "prices") return j({ id: "price_new" });
  if (path === "payment_links") return j({ id: "plNew", url: "https://buy/NEW" });
  throw new Error("unerwartet " + path);
};
const { ensureProfileLink, clearProfileLinkCache } = await import("./profileLinks");
const body = (i: number) => decodeURIComponent(calls.filter((c) => c.method === "POST")[i].body);

await ok("Premium 559 € ohne Schutz: Preis netto auf Lösch-Produkt, Link mit Rechnung + UID + Stripe Tax", async () => {
  calls.length = 0; clearProfileLinkCache();
  const r = await ensureProfileLink({ service: "remove", currency: "eur", protection: "none", oneTime: 559, express: false });
  assert.equal(r.url, "https://buy/NEW");
  const pb = body(0), lb = body(1);
  assert.ok(pb.includes("unit_amount=55900") && pb.includes("tax_behavior=exclusive") && pb.includes("product=prod_removal_eur") && pb.includes("currency=eur"));
  assert.ok(lb.includes("line_items[0][price]=price_new") && !lb.includes("line_items[1]"));
  assert.ok(lb.includes("automatic_tax[enabled]=true") && lb.includes("tax_id_collection[enabled]=true") && lb.includes("billing_address_collection=required"));
  assert.ok(lb.includes("invoice_creation[enabled]=true") && lb.includes("ATU72401536") && lb.includes("customer_creation=if_required"));
  assert.ok(lb.includes("metadata[rapidremove_profile]=remove|55900|none|eur"));
});
await ok("Premium Express 708 € + Monatsschutz: Schutz-Preis aus Vorlage, ohne Rechnungs-Flag (Abo)", async () => {
  calls.length = 0; clearProfileLinkCache();
  await ensureProfileLink({ service: "remove", currency: "eur", protection: "monthly", oneTime: 708, express: true });
  const lb = body(1);
  assert.ok(body(0).includes("unit_amount=70800"));
  assert.ok(lb.includes("line_items[1][price]=pMon") && !lb.includes("invoice_creation") && !lb.includes("customer_creation"));
  assert.ok(lb.includes("remove+x|70800|monthly|eur"));
});
await ok("$619 + Lifetime (Einmalzahlung) und Neustart 1.059 € auf Neustart-Produkt", async () => {
  calls.length = 0; clearProfileLinkCache();
  await ensureProfileLink({ service: "remove", currency: "usd", protection: "lifetime", oneTime: 619, express: false });
  assert.ok(body(1).includes("line_items[1][price]=pLifeU") && body(1).includes("invoice_creation[enabled]=true"));
  calls.length = 0; clearProfileLinkCache();
  await ensureProfileLink({ service: "reset", currency: "eur", protection: "monthly", oneTime: 1059, express: false });
  assert.ok(body(0).includes("product=prod_reset_eur") && body(0).includes("unit_amount=105900"));
});
await ok("Kein Listenpreis → kein Link (z. B. 500 €), Express auf Neustart → kein Link", async () => {
  clearProfileLinkCache();
  assert.ok((await ensureProfileLink({ service: "remove", currency: "eur", protection: "none", oneTime: 500, express: false })).error);
  assert.ok((await ensureProfileLink({ service: "reset", currency: "eur", protection: "none", oneTime: 850 + PROFILE_EXPRESS_FEE, express: true })).error);
});
await ok("Vorhandener Link mit Marker wird wiederverwendet (nichts angelegt)", async () => {
  links.plM = { link: { id: "plM", url: "https://buy/M", active: true, metadata: { rapidremove_profile: "remove|61900|none|usd" } }, items: [P("p619", 61900, "usd", "removal")] };
  calls.length = 0; clearProfileLinkCache();
  const r = await ensureProfileLink({ service: "remove", currency: "usd", protection: "none", oneTime: 619, express: false });
  assert.equal(r.url, "https://buy/M"); assert.equal(calls.filter((c) => c.method === "POST").length, 0);
});
console.log(`\n${n} Tests ok`);
