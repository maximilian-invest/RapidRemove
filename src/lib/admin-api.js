/* Admin-Dashboard ↔ ops-Backend: Login-Prüfung + echter E-Mail-Versand.
 * Die ops-URL kommt aus NEXT_PUBLIC_OPS_URL (gleiches Backend wie der Wizard). */
import { deriveSource } from "@/lib/attribution";
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");

let TOKEN = "";
export function setAdminToken(t) { TOKEN = t || ""; }
export function getAdminToken() { return TOKEN; }
export function opsConfigured() { return !!OPS; }

/** Prüft das eingegebene Admin-Passwort gegen das ops-Backend (ADMIN_TOKEN). */
export async function verifyAdmin(token) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const j = await res.json().catch(() => ({}));
  return !!j.ok;
}

/** Versendet eine vom Admin verfasste E-Mail (Betreff + Text) über das ops-Backend. */
export async function sendAdminEmail({ to, subject, text, orderId, label }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, to, subject, text, orderId: orderId || "", label: label || "" }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error("HTTP " + res.status + (t ? " · " + t.slice(0, 120) : ""));
  }
  return res.json().catch(() => ({ ok: true }));
}

/** Löst den passenden Zahlungslink für eine Bestellung auf (ohne Versand) – für die SMS-Vorlage. */
export async function fetchPayLinkUrl({ service, protection, currency, serviceAmount, protAmount, protType, express, url }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/paylink-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, service, protection, currency, serviceAmount, protAmount, protType, express, url: url || "" }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j.url;
}

/** Holt den öffentlichen VAPID-Schlüssel fürs Web-Push-Abo (ohne Auth). */
export async function fetchVapidKey() {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/push/vapid");
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok || !j.publicKey) throw new Error(j.error || "Web-Push im Backend nicht konfiguriert (VAPID-Schlüssel fehlen).");
  return j.publicKey;
}

/** Speichert die Web-Push-Subscription der installierten Admin-App im Backend. */
export async function savePushSub(subscription) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/push-subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, subscription }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return true;
}

/** Sendet eine SMS an die Kunden-Telefonnummer über das ops-Backend (ClickSend). */
export async function sendSms({ to, message, orderId, country }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, to, message, orderId: orderId || "", country: country || "" }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    let msg = "HTTP " + res.status;
    try { const j = JSON.parse(t); if (j && j.error) msg = j.error; } catch (e) { if (t) msg += " · " + t.slice(0, 120); }
    throw new Error(msg);
  }
  return res.json().catch(() => ({ ok: true }));
}

/* ---- Live-Daten fürs Dashboard (DB-Zeilen → Admin-Anzeigeform) ---- */
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function mapOrder(r) {
  return {
    id: r.id, created: fmtDate(r.created_at), createdAt: r.created_at || null, name: r.name || "", email: r.email || "", phone: r.phone || "",
    company: r.company || "", profile: r.profile || "", reviews: Number(r.reviews) || 0, rating: r.rating || "—",
    service: r.service || "remove", protection: r.protection || null, status: r.status || "new", pay: r.pay || "pending",
    amount: Number(r.amount) || 0, protAmount: Number(r.prot_amount) || 0, country: r.country || "DE", lang: r.lang || "de", note: r.note || "",
    express: !!(r.raw && r.raw.express), expressAmount: (r.raw && Number(r.raw.expressAmount)) || 0,
    paypal: (r.form && typeof r.form.paypal === "string") ? r.form.paypal : "", // PayPal-Wunsch (10 % Rabatt) aus dem Fragebogen – nur außerhalb DACH abgefragt
    form: r.form || null,
    addr: (r.raw && r.raw.addr) || "", mapsUri: (r.raw && r.raw.mapsUri) || "", placeId: (r.raw && r.raw.placeId) || "", businessStatus: (r.raw && r.raw.businessStatus) || "", category: r.category || "",
    affiliate: (r.raw && (r.raw.affiliate || r.raw.fprRef)) || "",
    assignee: r.assignee || null,
    mahnungCount: Number(r.mahnung_count) || 0,
    paylinkSent: (Number(r.paylink_count) || 0) > 0,
    source: deriveSource(r.raw || {}), // { kind, label } – Herkunft (Google Ads/Affiliate/Direkt …)
  };
}
function mapCheck(r) {
  return {
    id: r.id, created: fmtDate(r.created_at), createdAt: r.created_at || null, profile: r.profile || "", name: r.name || "—", email: r.email || "",
    rating: r.rating || "—", reviews: Number(r.reviews) || 0, flagged: Number(r.flagged) || 0,
    recommend: r.recommend || "remove", status: r.status || "neu", orderId: r.order_id || null,
    // Funnel-Insights: erreichte Stufe (1–4) – null = keine Funnel-Daten (Alt-Prüfung); Preis; Herkunft.
    step: r.step != null ? Number(r.step) : null, amount: r.amount != null ? Number(r.amount) : null, source: r.source || null,
  };
}

/** Holt Live-Bestellungen & -Prüfungen. Gibt null zurück, wenn kein ops-Backend gesetzt ist. */
export async function fetchAdminData() {
  if (!OPS) return null;
  const res = await fetch(OPS + "/admin/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  return { db: !!j.db, orders: (j.orders || []).map(mapOrder), checks: (j.checks || []).map(mapCheck) };
}

/* ---- Abos & Umsatz live aus Stripe ---- */
const PLAN_COLORS = ["var(--primary)", "#3b82f6", "#10b981", "#a855f7", "#ec4899", "#f59e0b", "#14b8a6"];

/** Holt die Stripe-Kennzahlen. Gibt { connected:false } zurück, wenn kein Key/Backend. */
export async function fetchStripe() {
  if (!OPS) return { connected: false };
  const res = await fetch(OPS + "/admin/stripe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  if (!j || !j.connected) return { connected: false, error: (j && j.error) || "" };
  return {
    connected: true,
    subs: j.subs || {},
    plans: (j.plans || []).map((p, i) => ({ ...p, color: PLAN_COLORS[i % PLAN_COLORS.length] })),
    rev: j.rev || { day: [], week: [], month: [] },
    payments: j.payments || [],
    paymentsAll: j.paymentsAll || [],
    customersList: j.customersList || [],
    overdueList: j.overdueList || [],
    newCustomersList: j.newCustomersList || [],
    churnList: j.churnList || [],
  };
}

/** Gamification-Leaderboard (Lösch-Counter, Ränge, Achievements je Betreuer).
 *  Gibt null zurück, wenn kein ops-Backend / keine DB. */
export async function fetchGamification() {
  if (!OPS) return null;
  const res = await fetch(OPS + "/admin/gamification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  return j && j.db ? j.board : null;
}

/** Echte E-Mail-Vorlagen aus dem ops-Backend (key, label, group, subject). */
export async function fetchTemplates() {
  if (!OPS) return [];
  const res = await fetch(OPS + "/admin/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  return j.templates || [];
}

/** Detail einer Vorlage zum Bearbeiten: editierbare Felder, Default-Texte + gespeicherte Overrides. */
export async function fetchTemplateDetail(key) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/template-detail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, key }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Bearbeitete Texte einer Vorlage für EINE Sprache speichern. */
export async function saveTemplateText({ key, lang, fields }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/template-save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, key, lang, fields }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Liste der AKTIVEN Stripe-Zahlungslinks (id, url, items[]) zum Auswählen. */
export async function fetchPayLinks() {
  if (!OPS) return [];
  const res = await fetch(OPS + "/admin/paylinks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  if (j && j.error && !(j.links || []).length) throw new Error(j.error);
  return (j && j.links) || [];
}

/** Verschickt einen BESTEHENDEN Stripe-Zahlungslink an den Kunden.
 *  Entweder direkt per `url` (aus der Liste) oder per Szenario (Betrag-Match). */
export async function sendPayLink({ to, name, orderId, currency, service, protection, serviceAmount, protAmount, protType, total, protectionLabel, express, expressLabel, template, lang, url, celebrate, stage }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/paylink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, email: to, name, orderId, currency, service, protection, serviceAmount, protAmount, protType, total, protectionLabel, express: !!express, expressLabel, template, lang, url, celebrate: !!celebrate, stage: stage || undefined }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Gleicht bezahlte Einmalzahlungen (Löschung/Reset, ohne Abos) aus Stripe mit den
 *  Bestellungen ab und setzt Treffer auf „bezahlt". Liefert den Abgleich-Report. */
export async function reconcilePayments() {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/reconcile-payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j; // { ok, scanned, matched:[{name,orderId}], alreadyAssigned, unmatched:[name] }
}

/** Legt die Express-Zahlungslinks in Stripe an (alle Kombinationen). apply=false → Trockenlauf. */
export async function setupExpressLinks({ apply } = {}) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/setup-express", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, apply: !!apply }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Sendet eine echte, gebrandete Vorlage (z. B. Rechte benötigt, Adresse) an den Kunden. */
export async function sendTemplate({ key, to, orderId, lang, name, hasSub, hasProtection }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, key, to, orderId, lang, name, hasSub, hasProtection }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Aktivitäts-Verlauf – standardmäßig STRIKT pro Bestellung (orderId), damit der
 *  Verlauf bei Mehrfachbestellern mit derselben E-Mail nicht endlos wird. Der
 *  optionale email-Parameter würde alle Bestellungen dieser Adresse bündeln. */
export async function fetchEvents(orderId, email) {
  if (!OPS || (!orderId && !email)) return [];
  const res = await fetch(OPS + "/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, email }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  return (j.events || []).map((e) => ({ id: e.id, ic: e.type || "order", t: e.title || "", d: e.detail || "", time: fmtDate(e.created_at), ts: e.created_at || null, auto: !!e.auto, hasHtml: !!e.has_html }));
}

/** Holt die EXAKT versendete Mail (1:1 gespeichertes HTML + Betreff) zu einem Aktivitäts-Eintrag. */
export async function fetchEmailPreview(eventId) {
  if (!OPS || !eventId) return { ok: false, error: "Kein ops-Backend." };
  const res = await fetch(OPS + "/admin/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, id: eventId }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/** Bestellung einem Bearbeiter zuweisen ("max" | "matthias" | null).
 *  `force` = bereits bestätigte Übernahme eines fremd zugewiesenen Auftrags.
 *  Liefert bei Konflikt { ok:false, conflict:true, current } statt zu werfen. */
export async function setOrderAssignee({ orderId, assignee, force }) {
  if (!OPS || !orderId) return { ok: false };
  const res = await fetch(OPS + "/admin/order-assign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, assignee: assignee || null, force: !!force }),
  });
  const j = await res.json().catch(() => ({}));
  // 409 = bereits einem anderen Betreuer zugewiesen → kein Fehler, sondern Konflikt zur Rückfrage.
  if (res.status === 409 && j && j.conflict) return { ok: false, conflict: true, current: j.current || null };
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Live-Go: ALLE Test-Bestelldaten löschen (orders/checks/events/upsell_jobs).
 *  Installierte Admin-Geräte (Web-Push) bleiben erhalten. */
export async function resetTestData() {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/reset-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, confirm: "ALLE-TESTDATEN-LOESCHEN" }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j; // { ok, orders, checks, events, upsell }
}

/** Setzt NUR die Profil-Prüfungen (Funnel/Leads) zurück. Bestellungen, Zahlungen
 *  und der Verlauf bleiben unberührt. */
export async function resetChecks() {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/reset-checks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, confirm: "PRUEFUNGEN-LOESCHEN" }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j; // { ok, checks }
}

/* ---- 301-Weiterleitungen (im Admin pflegbar) ---- */
/** Alle Weiterleitungen laden (inkl. deaktivierte). */
export async function fetchRedirects() {
  if (!OPS) return { db: false, redirects: [] };
  const res = await fetch(OPS + "/admin/redirects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  return { db: !!j.db, redirects: j.redirects || [] };
}

/** Weiterleitung anlegen (ohne id) oder aktualisieren (mit id). */
export async function saveRedirect({ id, source, destination, code, enabled }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/redirects/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, id: id || null, source, destination, code: code || 301, enabled: enabled !== false }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j.redirect;
}

/** Weiterleitung löschen. */
export async function deleteRedirect(id) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/redirects/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, id }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return true;
}

/** Bestell-Status dauerhaft im Backend setzen (bleibt bis zur nächsten Änderung). */
export async function setOrderStatus({ orderId, status, pay, label, noEvent }) {
  if (!OPS || !orderId || !status) return { ok: false };
  const res = await fetch(OPS + "/admin/order-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, status, pay, label, noEvent: !!noEvent }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Korrigiert eine FÄLSCHLICH erfasste Zahlung: setzt sie zurück auf „ausstehend" und
 *  sperrt die automatische Zuordnung für diesen Auftrag (sonst wird er erneut als bezahlt
 *  markiert). Danach lässt sich wieder ein Zahlungslink senden. */
export async function correctOrderPayment({ orderId }) {
  if (!OPS || !orderId) return { ok: false };
  const res = await fetch(OPS + "/admin/order-correct-pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Zahlung manuell als eingegangen erfassen (z. B. PayPal/Überweisung außerhalb Stripe). */
export async function markOrderPaid({ orderId, method }) {
  if (!OPS || !orderId) return { ok: false };
  const res = await fetch(OPS + "/admin/order-mark-paid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, method }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}
