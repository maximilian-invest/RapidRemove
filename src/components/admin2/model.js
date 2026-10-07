/* Neues Admin — Datenmodell-Helfer über den bestehenden echten Bestellungen (fetchAdminData).
   Status-Buckets wie im alten Admin: Neu · In Bearbeitung · Zahlung offen · Inkasso · Gelöscht · Storniert. */
import { ASSIGNEES } from "@/components/admin/AdminAssign";
import { asset } from "@/lib/base";

export const OPEN = ["new", "work", "pay", "inkasso"];
export const CLOSED = ["deleted", "cancel"];
export const ST = {
  new: { l: "Neu", img: "new" },
  work: { l: "In Bearbeitung", img: "work" },
  pay: { l: "Zahlung offen", img: "pay" },
  inkasso: { l: "Inkasso", img: "inkasso" },
  deleted: { l: "Gelöscht" },
  cancel: { l: "Storniert" },
};
export const IMG = (k) => asset(`/assets/admin/${k}.webp`);

const INKASSO_MS = 30 * 24 * 3600 * 1000;
const OFFEN_PAY = ["pending", "sent", "mahnung", "failed"];

/** Bucket eines Auftrags (deckungsgleich mit den Reitern im alten Admin). */
export function bucket(o, now = Date.now()) {
  if (o.status === "storniert") return "cancel";
  // Bezahlt = abgeschlossen, auch wenn der Status nie von „Neu"/„In Bearbeitung" umgestellt wurde (07.10.2026).
  // Bewertungen mit noch offenen Partner-Aufgaben holt bucketsOf trotzdem zurück nach „In Bearbeitung".
  if (["paid", "refunded"].includes(o.pay)) return "deleted";
  if (o.status === "new") return "new";
  if (o.status === "done") {
    if (["paid", "refunded"].includes(o.pay)) return "deleted";
    if (o.doneAt && now - new Date(o.doneAt).getTime() > INKASSO_MS) return "inkasso";
    if (OFFEN_PAY.includes(o.pay)) return "pay";
    return "deleted";
  }
  return "work"; // progress & alles Übrige, was noch läuft
}
/** „Offen" exakt wie im bisherigen Admin: nicht storniert und nicht bezahlt. */
export const isOffen = (o) => o.status !== "storniert" && o.pay !== "paid";
/** Status-Kachel ↔ Auftrag, Zählweise wie im bisherigen Admin („Zahlung offen" enthält auch Inkasso-Fälle).
 *  `b` darf ein einzelner Bucket oder eine Liste sein (Bewertungs-Aufträge stehen u. U. in zwei Kacheln). */
export const inTile = (k, b) => (Array.isArray(b) ? b.some((x) => inTile(k, x)) : k === "pay" ? b === "pay" || b === "inkasso" : b === k);

/* ---- Einzelbewertungen: Status je Bewertung aus den Partner-Aufgaben ----
 * Der Auftrags-Status allein (new/progress/done) sagt bei Bewertungen wenig: der Partner arbeitet
 * jede Bewertung einzeln ab, gelöschte Bewertungen werden einzeln fällig. Deshalb leiten wir die
 * Kacheln aus den Partner-Aufgaben + raw-Feldern ab – dieselbe Logik wie das Kunden-Dashboard
 * (ops/src/customers.ts › orderView), damit Admin und Kunde dieselben Zahlen sehen. */
const REVIEW_BASE = 179, REVIEW_OLD_SURCHARGE = 50, REVIEW_NOTEXT_PRICE = 300;
const reviewDiscountPct = (n) => (n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0);
export const rvKey = (it) => it.url || ((it.name || "") + "|" + (it.text || ""));

/** null bei Profil-Aufträgen bzw. wenn (noch) nichts beim Partner liegt. */
export function revState(o, tasks) {
  if (!o || o.service !== "reviews") return null;
  const items = o.reviewItems || [];
  const pt = (tasks || []).filter((t) => t.status !== "cancelled");
  const billed = new Set([...(o.reviewsRemovedAll || []), ...(o.reviewsRemoved || [])].map(rvKey));
  const asked = o.reviewsPayReq || {}; // per Sammel-Mail automatisch zur Zahlung aufgefordert → zählt wie abgerechnet
  if (!pt.length && !billed.size) return null;
  const byKey = new Map(pt.map((t) => [t.itemKey, t]));
  const pays = o.reviewsPayments || [];
  const paidKeys = new Set(o.reviewsPaidKeys || []);
  const keyedInv = pays.filter((p) => p.kind === "invoice" && p.keys && p.keys.length);
  const legacyInv = pays.filter((p) => p.kind === "invoice" && !(p.keys && p.keys.length));
  const dec = o.reviewsSwDecision || {};
  const swSet = new Set((o.reviewsSoftware || []).map(rvKey));
  const isPaid = (k) => {
    if (paidKeys.has(k) || keyedInv.some((p) => p.paid && p.keys.includes(k))) return true;
    if (keyedInv.some((p) => !p.paid && p.keys.includes(k))) return false;
    if (!billed.has(k)) return false; // vom Partner gelöscht, noch nicht abgerechnet
    if (legacyInv.length) return legacyInv.every((p) => !!p.paid);
    return o.pay === "paid";
  };
  const prepaid = (k) => (dec[k] && dec[k].d === "accepted") || pays.some((p) => (p.kind === "software" || p.kind === "deposit") && p.paid && (!(p.keys && p.keys.length) || p.keys.includes(k)));
  const pct = reviewDiscountPct(items.length);
  const c = { removed: 0, open: 0, working: 0, waiting: 0, software: 0, notPossible: 0 };
  const unpaid = [];
  let started = o.status !== "new";
  for (const it of items) {
    const k = rvKey(it); const t = byKey.get(k); const s = t ? t.status : null;
    if (s && s !== "new") started = true;
    if (billed.has(k) || s === "removed") {
      c.removed++;
      const special = !!it.nt || swSet.has(k);
      if (!(special && prepaid(k)) && !isPaid(k)) {
        unpaid.push({ k, special, old: !!it.old && !it.nt, billed: billed.has(k) || !!asked[k] || keyedInv.some((p) => p.keys.includes(k)), asked: asked[k] || null, at: t && t.removed ? new Date(t.removed).getTime() : null });
      }
    } else if (s === "working") { c.open++; c.working++; }
    else if (s === "new") { c.open++; c.waiting++; }
    else if (s === "software") c.software++;
    else if (s === "not_possible") c.notPossible++;
  }
  // Rechnung wie im Backend (quoteReviews „rest"): Mengenrabatt nach Gesamtanzahl, Spezialverfahren voll (rabattiert).
  const normal = unpaid.filter((u) => !u.special);
  const sub = normal.reduce((s, u) => s + (u.old ? REVIEW_BASE + REVIEW_OLD_SURCHARGE : REVIEW_BASE), 0);
  const unpaidAmt = Math.round((sub * (100 - pct)) / 100) + unpaid.filter((u) => u.special).length * Math.round((REVIEW_NOTEXT_PRICE * (100 - pct)) / 100);
  const ats = unpaid.map((u) => u.at).filter(Boolean);
  return {
    // Nenner für „x/y gelöscht": was beim Partner liegt (bzw. abgerechnet wurde) – nicht reviewsAccepted,
    // das kann bei später nachgereichten Bewertungen kleiner sein als die tatsächlich bearbeiteten.
    total: Math.max(pt.length, c.removed) || items.length,
    ...c, started, pct,
    unpaidN: unpaid.length, unpaidAmt, unbilledN: unpaid.filter((u) => !u.billed).length, unpaidKeys: unpaid.map((u) => u.k),
    unpaidSince: ats.length ? Math.min(...ats) : null,
    askedAt: unpaid.map((u) => u.asked).filter(Boolean).sort()[0] || null, // erste automatische Zahlungsaufforderung
  };
}

/** Alle Kacheln, in denen ein Auftrag steht. Bewertungen: „In Bearbeitung", solange beim Partner noch etwas offen ist,
 *  und zusätzlich „Zahlung offen", sobald eine gelöschte Bewertung noch nicht bezahlt ist. */
export function bucketsOf(o, now = Date.now(), tasks) {
  const base = bucket(o, now);
  if (base === "cancel") return [base];
  const r = revState(o, tasks);
  if (!r) return [base];
  if (!r.started && base === "new") return ["new"];
  const out = [];
  if (r.open || r.software) out.push("work");
  if (r.unpaidN) out.push(r.unpaidSince && now - r.unpaidSince > INKASSO_MS ? "inkasso" : "pay");
  if (out.length) return out;
  if (r.removed) return ["deleted"]; // alles gelöscht und bezahlt
  return [base === "new" ? "work" : base];
}
/** Haupt-Bucket für Detail/Aktionen: offene Zahlung vor laufender Arbeit. */
export const mainBucket = (bs) => bs.find((b) => b === "inkasso" || b === "pay") || bs[0];
export const isOpenB = (bs) => bs.some((b) => OPEN.includes(b));
export const typeOf = (o) => (o.service === "reviews" ? "reviews" : "profile");

/** Laufzeit in Minuten: Neu/In Bearbeitung seit Eingang, Zahlung/Inkasso seit Löschung. */
export function ageMin(o, b, now = Date.now()) {
  const from = (b === "pay" || b === "inkasso" || b === "deleted") && o.doneAt ? o.doneAt : o.createdAt;
  const t = from ? new Date(from).getTime() : now;
  return Math.max(0, Math.round((now - t) / 60000));
}
export const fmtAge = (m) => (m < 60 ? `${m} Min` : m < 1440 ? `${Math.floor(m / 60)} Std${m % 60 ? " " + (m % 60) + " Min" : ""}` : `${Math.floor(m / 1440)} T ${Math.floor((m % 1440) / 60)} Std`);
export const isLate = (b, m) => (b === "new" || b === "work") && m >= 2880;

export const cur = (o) => (o.country === "US" ? "$" : "€");
export function money(n, c = "€") {
  const v = Number(n) || 0;
  const d = Number.isInteger(v) ? 0 : 2; // 809.1 → 809.10
  return c === "$" ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: 2 }) : v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: 2 }) + " €";
}
export const orderMoney = (o) => (o.amount ? money(o.amount, cur(o)) : "—");

const COLORS = ["#7c3aed", "#db2777", "#16a34a", "#c2410c", "#0891b2", "#be123c", "#9333ea", "#ca8a04"];
export function avatarOf(o) {
  const n = (o.name || o.company || o.email || "?").trim();
  const ini = n.split(/\s+/).slice(0, 2).map((x) => x[0] || "").join("").toUpperCase() || "?";
  let h = 0; for (const ch of String(o.id || n)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { ini, color: COLORS[h % COLORS.length] };
}

export const STAFF = Object.values(ASSIGNEES).map((a) => ({ ...a, src: asset(a.img) }));
export const staffOf = (id) => STAFF.find((s) => s.id === id) || null;

export const SERVICE_L = {
  remove: "Profil entfernen", reset: "Profil + Neustart", express: "Express-Löschung",
  deindex: "Presse auslisten", orm: "Reputations-Audit", reviews: "Einzelne Bewertungen löschen",
};

/** PayPal-Angebot für Vorlagen (wie im alten Admin). */
export function computeOffer(o) {
  const c = cur(o);
  const oneTimeReg = (Number(o.amount) || 0) + (o.express && o.expressAmount ? Number(o.expressAmount) : 0) + (o.protection === "lifetime" && o.protAmount ? Number(o.protAmount) : 0);
  const oneTimePP = Math.round(oneTimeReg * 90) / 100;
  const isSub = o.protection === "monthly" || o.protection === "monitor";
  const monthly = isSub && o.protAmount ? Number(o.protAmount) : 0;
  const subReg = Math.round(monthly * 12 * 100) / 100, subPP = Math.round(monthly * 10 * 100) / 100;
  const regTotal = Math.round((oneTimeReg + subReg) * 100) / 100, ppTotal = Math.round((oneTimePP + subPP) * 100) / 100;
  const m = (n) => money(n, c);
  return { regular: m(regTotal), paypal: m(ppTotal), savings: m(Math.round((regTotal - ppTotal) * 100) / 100), sub: isSub ? { monthly: m(monthly), regular: m(subReg), paypal: m(subPP) } : null };
}

/** Vorlagen-Nutzung (gleicher Speicher wie das alte Admin → „Am häufigsten“ bleibt konsistent). */
const TPL_USAGE_KEY = "rr_tpl_usage";
export function readTplUsage() { try { return JSON.parse(localStorage.getItem(TPL_USAGE_KEY) || "{}") || {}; } catch (e) { return {}; } }
export function bumpTplUsage(key) { try { const u = readTplUsage(); u[key] = (u[key] || 0) + 1; localStorage.setItem(TPL_USAGE_KEY, JSON.stringify(u)); } catch (e) {} }
export const STORNO_KEYS = ["storno", "kundenstorno", "rechtestorno", "scamstorno"];
/* Vorlagen, die das System automatisch verschickt (⚡ im Sheet). */
export const AUTO_KEYS = ["auftragsbestaetigung", "auftragsbestaetigung-reviews", "zahlungsbestaetigung", "neues-abo", "abo-deaktiviert", "paypal-erinnerung", "profil-wiedererschienen", "presse-eingang"];

/** Schutz-Abo des Auftrags (gebucht bei der Bestellung): monatlich/Überwachung = laufendes Abo, lifetime = einmalig. */
export function aboOf(o) {
  const p = o && o.protection;
  if (!p || p === "none") return null;
  const c = cur(o), amt = Number(o.protAmount) || 0;
  if (p === "lifetime") return { kind: p, short: "Lifetime", label: "Lebenslanger Schutz", price: amt ? money(amt, c) + " einmalig" : "", recurring: false };
  return { kind: p, short: "Abo", label: p === "monitor" ? "Schutz-Abo + tägliche Überwachung" : "Schutz-Abo", price: amt ? money(amt, c) + " / Monat" : "", recurring: true };
}

/** Kunde will mit Wise/PayPal zahlen (Rabatt-Abfrage bzw. Fragebogen) → 10 % Rabatt. Wie payPrefName im alten Admin. */
export function payPrefOf(o) {
  if (!o) return null;
  if (o.payPref === "wise") return "Wise";
  if (o.payPref === "paypal" || o.paypal) return "PayPal";
  return null;
}
