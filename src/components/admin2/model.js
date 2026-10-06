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
/** Status-Kachel ↔ Auftrag, Zählweise wie im bisherigen Admin („Zahlung offen" enthält auch Inkasso-Fälle). */
export const inTile = (k, b) => (k === "pay" ? b === "pay" || b === "inkasso" : b === k);
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

/** Kunde will mit Wise/PayPal zahlen (Rabatt-Abfrage bzw. Fragebogen) → 10 % Rabatt. Wie payPrefName im alten Admin. */
export function payPrefOf(o) {
  if (!o) return null;
  if (o.payPref === "wise") return "Wise";
  if (o.payPref === "paypal" || o.paypal) return "PayPal";
  return null;
}
