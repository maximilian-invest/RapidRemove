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
export async function sendAdminEmail({ to, subject, text, orderId, label, plain }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, to, subject, text, orderId: orderId || "", label: label || "", plain: plain === true }),
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
    id: r.id, created: fmtDate(r.created_at), createdAt: r.created_at || null, doneAt: r.done_at || null, name: r.name || "", email: r.email || "", phone: r.phone || "",
    // Testbestellung (Inhaber-Adresse / „+test", vom Backend markiert): im Admin markiert, zählt in keine Statistik.
    test: !!r.test || /\+test@/i.test(r.email || ""),
    company: r.company || "", profile: r.profile || "", reviews: Number(r.reviews) || 0, rating: r.rating || "—",
    service: r.service || "remove", protection: r.protection || null, status: r.status || "new", pay: r.pay || "pending",
    // Bewertungs-Produkt: eingereichte Bewertungen (aus dem raw-JSON der Bestellung).
    // Je Eintrag Teilen-Link ODER Name + Bewertungstext; ältere Bestellungen kennen nur reviewUrls.
    reviewItems: (r.raw && Array.isArray(r.raw.reviewItems) && r.raw.reviewItems.length)
      ? r.raw.reviewItems.filter((it) => it && (it.url || (it.name && it.text)))
      : ((r.raw && Array.isArray(r.raw.reviewUrls)) ? r.raw.reviewUrls.filter(Boolean).map((u) => ({ url: u })) : []),
    // Mit der Löschbestätigung abgerechnete Bewertungen (Basis für die Mahnungen).
    // In der Startbestätigung angenommene Bewertungen (Basis für Mengenrabatt + Rechnung).
    reviewsPayReq: r.raw && r.raw.reviewsPayReq && typeof r.raw.reviewsPayReq === "object" ? r.raw.reviewsPayReq : null, // automatisch zur Zahlung aufgefordert (je Bewertung)
    payHold: r.raw && r.raw.payHold && typeof r.raw.payHold === "object" ? r.raw.payHold : null,
    policyConsent: r.raw && r.raw.policyConsent && typeof r.raw.policyConsent === "object" ? r.raw.policyConsent : null, // Zusicherung „verstößt gegen Google-Richtlinien"
    policyConsentAdds: r.raw && Array.isArray(r.raw.policyConsentAdds) ? r.raw.policyConsentAdds : [], // Zwischenzahlung nötig (Partner pausiert)
    payDue: r.raw && r.raw.payDue && typeof r.raw.payDue === "object" ? r.raw.payDue : null, // Zahlungsziel (Profil-Aufträge)
    verify: r.raw && r.raw.verify && typeof r.raw.verify === "object" ? r.raw.verify : null, // Inhaber-Nachweis (4–5 Sterne)
    reviewsAccepted: (r.raw && Array.isArray(r.raw.reviewsAccepted) && r.raw.reviewsAccepted.length) ? r.raw.reviewsAccepted.filter((it) => it && (it.url || (it.name && it.text))) : null,
    reviewsSoftware: (r.raw && Array.isArray(r.raw.reviewsSoftware)) ? r.raw.reviewsSoftware.filter((it) => it && (it.url || it.name)) : [],
    reviewsPayments: (r.raw && Array.isArray(r.raw.reviewsPayments)) ? r.raw.reviewsPayments : [],
    reviewsRemoved: (r.raw && Array.isArray(r.raw.reviewsRemoved)) ? r.raw.reviewsRemoved.filter((it) => it && (it.url || (it.name && it.text))) : null,
    // Für „Zahlung offen" je Bewertung (gleiche Logik wie das Kunden-Dashboard): alle bisher abgerechneten,
    // einzeln bezahlte Bewertungen und Software-Entscheidungen des Kunden.
    reviewsRemovedAll: (r.raw && Array.isArray(r.raw.reviewsRemovedAll)) ? r.raw.reviewsRemovedAll.filter((it) => it && (it.url || (it.name && it.text))) : [],
    reviewsPaidKeys: (r.raw && Array.isArray(r.raw.reviewsPaidKeys)) ? r.raw.reviewsPaidKeys : [],
    reviewsSwDecision: (r.raw && r.raw.reviewsSwDecision && typeof r.raw.reviewsSwDecision === "object") ? r.raw.reviewsSwDecision : {},
    amount: Number(r.amount) || 0, protAmount: Number(r.prot_amount) || 0, country: r.country || "DE", lang: r.lang || "de", note: r.note || "",
    express: !!(r.raw && r.raw.express), expressAmount: (r.raw && Number(r.raw.expressAmount)) || 0,
    // Rabatt-Wunsch (10 %): neu aus der Abfrage beim Absenden (raw.payPref = wise | paypal | none),
    // früher als PayPal-E-Mail im Fragebogen (form.paypal).
    payPref: (r.raw && typeof r.raw.payPref === "string") ? r.raw.payPref : "",
    paypal: (r.form && typeof r.form.paypal === "string" && r.form.paypal) ? r.form.paypal : ((r.raw && r.raw.payPref === "paypal") ? "ja" : ""),
    form: r.form || null,
    addr: (r.raw && r.raw.addr) || "", mapsUri: (r.raw && r.raw.mapsUri) || "", placeId: (r.raw && r.raw.placeId) || "", businessStatus: (r.raw && r.raw.businessStatus) || "", category: r.category || "",
    affiliate: (r.raw && (r.raw.affiliate || r.raw.fprRef)) || "",
    pgStale: (r.raw && r.raw.pgStale && r.raw.pgStale.at) ? r.raw.pgStale : null, // Zahlungsdaten fehlen (Erinnerungen ausgeschöpft) → Storno am cancelAt
    payGate: (r.raw && r.raw.payGate && r.raw.payGate.status === "pending") ? { keys: Array.isArray(r.raw.payGate.keys) ? r.raw.payGate.keys : null, at: r.raw.payGate.at || null } : null,
    assignee: r.assignee || null,
    mahnungCount: Number(r.mahnung_count) || 0,
    paylinkSent: (Number(r.paylink_count) || 0) > 0,
    // Herkunft: `source` ist der Last-Touch (raw.attribution) – die Quelle, die zählt.
    // `sourceFirst` ist der unveränderliche First-Touch, als zweite Perspektive.
    source: deriveSource(r.raw || {}), // { kind, label } – Google Ads/Meta Ads/Affiliate/Direkt …
    sourceFirst: (r.raw && r.raw.attributionFirst) ? deriveSource({ attribution: r.raw.attributionFirst }) : null,
    utmContent: (r.raw && (r.raw.utmContent || (r.raw.attribution && r.raw.attribution.utm_content))) || "",
  };
}
function mapCheck(r) {
  return {
    id: r.id, created: fmtDate(r.created_at), createdAt: r.created_at || null, profile: r.profile || "", name: r.name || "—", email: r.email || "",
    test: !!r.test || /\+test@/i.test(r.email || ""),
    rating: r.rating || "—", reviews: Number(r.reviews) || 0, flagged: Number(r.flagged) || 0,
    recommend: r.recommend || "remove", status: r.status || "neu", orderId: r.order_id || null,
    // Funnel-Insights: erreichte Stufe (1–4) – null = keine Funnel-Daten (Alt-Prüfung); Preis; Herkunft.
    // `source` = Last-Touch (die Quelle, die zählt), `sourceFirst` = First-Touch (Zusatz).
    step: r.step != null ? Number(r.step) : null, amount: r.amount != null ? Number(r.amount) : null, source: r.source || null,
    sourceFirst: r.source_first || null, utmSource: r.utm_source || "", utmCampaign: r.utm_campaign || "",
    utmContent: r.utm_content || "", utmMedium: r.utm_medium || "", clickId: r.click_id || "",
    refHost: r.referrer || "", landing: r.landing || "",
    // Google-Profil-Bezug (nur bei neueren Prüfungen vorhanden): Maps-Link, Place-ID, Adresse.
    placeId: r.place_id || "", mapsUri: r.maps_uri || "", addr: r.addr || "", lang: r.lang || "de", country: r.country || "DE",
    enrichedAt: r.enriched_at || null, // Auto-E-Mail-Recherche bereits gelaufen (auch ohne Fund)
    rueckgewinnungAt: r.rueckgewinnung_at || null, // Rückgewinnungs-Angebot gesendet am (→ „Angebot gesandt am …")
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
  if (!j || !j.db || !j.board) return null;
  // Reviews-Reiter (vergebene Bewertungs-Aufträge) hängt am selben Endpoint.
  return { ...j.board, reviews: j.reviews || null };
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
export async function sendTemplate({ key, to, orderId, checkId, lang, name, company, hasSub, hasProtection, offer, stage, service }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, key, to, orderId, checkId, lang, name, company, hasSub, hasProtection, offer, stage, service }),
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

/** Recherchierte Lead-E-Mail an einer Prüfung speichern (leer = entfernen). */
export async function saveCheckEmail({ checkId, email }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, checkId, email }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Lead-Recherche: Unternehmens-Website serverseitig nach Kontakt-E-Mails durchsuchen.
 *  Mit checkId + autosave speichert der Server den besten Treffer direkt am Check. */
export async function enrichCheckEmails({ website, checkId, autosave }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/check-enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, website, checkId, autosave }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j; // { ok, website, emails: [...], saved }
}

/** Prüfung als automatisch recherchiert markieren (kein erneuter Auto-Versuch). */
export async function markCheckEnriched({ checkId }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/check-enrich-mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, checkId }),
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

/** Bewertungs-Produkt: „Bearbeitung gestartet"-Bestätigung senden (Sprache nach Land). */
export async function sendReviewsStart(payload) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/reviews-start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, ...(payload || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Bewertungs-Produkt: Storno senden (Grund "age" = älter als 4 Wochen, "text" = kein Text). */
export async function sendReviewsStorno(payload) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/reviews-storno", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, ...(payload || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Bewertungs-Produkt: Löschbestätigung + Rechnung senden (nur markierte Links werden berechnet). */
export async function sendReviewsInvoice(payload) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/reviews-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, ...(payload || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Bewertungs-Produkt: Mahnung senden (Stufe 1–3, Zahlung binnen 48 h; Stufe 3 = letzte Mahnung). */
export async function sendReviewsMahnung(payload) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/reviews-mahnung", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, ...(payload || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Screenshots der bestellten Bewertungen (Bewertungs-Produkt). retake=true nimmt
 *  fehlende/fehlgeschlagene neu auf. Antwort: { enabled, running, shots[] }. */
export async function fetchReviewShots(orderId, retake = false) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/review-shots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, retake: !!retake }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}
/** Bild-URL eines Screenshots (Token als Query, damit <img>/<a> funktionieren). */
export function reviewShotUrl(id, download = false) {
  return OPS + "/admin/review-shot/" + encodeURIComponent(id) + "?token=" + encodeURIComponent(TOKEN) + (download ? "&dl=1" : "");
}

/* ---- Monitor: Überwachung gelöschter Profile (ops/monitor.ts) ---- */
async function monitorPost(path, body) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/monitor/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, ...(body || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}
export const monitorList = () => monitorPost("list");
export const monitorDetail = (id) => monitorPost("detail", { id });
export const monitorScan = (id) => monitorPost("scan", id ? { id } : {});
export const monitorCancel = () => monitorPost("cancel");
export const monitorAction = (id, action, extra) => monitorPost("action", { id, action, ...(extra || {}) });
export const monitorInform = (id) => monitorPost("inform", { id });
export const monitorLookup = (q) => monitorPost("lookup", q);
export const monitorAdd = (data) => monitorPost("add", data);
/** Bild-URL eines Monitor-Screenshots (Token als Query für <img>). */
export function monitorShotUrl(id, download = false) {
  return OPS + "/admin/monitor-shot/" + encodeURIComponent(id) + "?token=" + encodeURIComponent(TOKEN) + (download ? "&dl=1" : "");
}

/* ---- Datenreport: nur aggregierte Kennzahlen (Sterne, Bewertungen, Branchen) ---- */
export async function fetchReportStats() {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/report-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j; // { ok, generatedAt, checks, removals, profileOrders }
}

/* ---- Partner-Board (Übergabe einzelner Bewertungen an den Lösch-Partner) ---- */
async function partnerPost(path, body) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/partner/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, ...(body || {}) }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}
export const partnerSend = (orderId, items, customer) => partnerPost("send", { orderId, items, customer: customer || "" });
export const partnerTasks = (orderId) => partnerPost("tasks", orderId ? { orderId } : {});
export const partnerUpdate = (id, fields) => partnerPost("update", { id, ...(fields || {}) });
export const partnerPay = (ids, note) => partnerPost("pay", { ids, note });
export const siteChats = (days) => adminPost("/admin/chat/site", { days: days || 60 });
export const siteChatThread = (sid) => adminPost("/admin/chat/site/thread", { sid });
export const partnerStats = (days) => partnerPost("stats", { days: days || 0 });
export const partnerLink = (rotate = false) => partnerPost("link", { rotate });
/** Test-Board: nur Testaufträge (Bestell-E-Mail mit „+test"), der Partner sieht davon nichts. */
export const partnerTestLink = () => partnerPost("test-link", {});
/** Einmal-Nachtrag: bereits bezahlte 60 USD (WhatsApp, vor dem Board) — Vorschau bzw. eintragen. */
export const partnerBackfill = (apply = false, refs = []) => partnerPost("backfill-rv60", { apply, refs });
/** Partner-Zugang: Logins inkl. Passwort / anlegen, ändern, neues Passwort. */
export const partnerAccounts = () => partnerPost("accounts", {});
export const partnerAccountSet = (o) => partnerPost("account-set", o || {});

/** Kunden-Dashboard: Zugänge für alle offenen Einzelbewertungs-Aufträge anlegen (ohne Mail). */
export async function createOpenCustAccounts() {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/cust/accounts-open", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: TOKEN }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Einladung ins Kunden-Dashboard: apply=false → nur Empfängerliste, apply=true → senden (je Adresse einmal). */
export async function custInvite(apply = false) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + "/admin/cust/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: TOKEN, apply }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/* ---- Einstellungen: automatische Weiterleitung an den Partner + Partner-Liste ---- */
export const partnerSettings = (patch) => partnerPost("settings", patch || {}); // { autoReviews?, autoProfiles? } → aktuelle Werte
async function adminPost(path, body) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert (NEXT_PUBLIC_OPS_URL fehlt).");
  const res = await fetch(OPS + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: TOKEN, ...(body || {}) }) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}
export const partnersList = () => adminPost("/admin/partners");
/** Geplante automatische Mails eines Auftrags (Mail-Verlauf „Als Nächstes"). */
export const nextMailsApi = (orderId) => adminPost("/admin/next-mails", { orderId });
/* Partner-Auszahlungen (Payoneer + Gutschriften) */
export const payoutsInfo = () => adminPost("/admin/payouts");
export const payoutsSettings = (p) => adminPost("/admin/payouts/settings", p);
export const payoutsRun = () => adminPost("/admin/payouts/run");
export const payoutsRemail = (id) => adminPost("/admin/payouts/remail", { id });
/** Gutschrift-PDF in neuem Tab öffnen. */
export async function payoutPdfOpen(id) {
  const w = window.open("", "_blank");
  try {
    const res = await fetch(OPS + "/admin/payouts/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: TOKEN, id }) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const url = URL.createObjectURL(await res.blob());
    if (w) w.location.href = url; else window.location.href = url;
  } catch (e) { if (w) w.close(); throw e; }
}
export const partnerSave = (p) => adminPost("/admin/partners/save", p);
/* Partner-Ökosystem: Freigabe, Leistungen, Einladung, Zuteilung */
export const partnerStatusApi = (id, action, extra) => adminPost("/admin/partners/status", { id, action, ...(extra || {}) });
export const partnerInviteApi = (p) => adminPost("/admin/partners/invite", p);
export const partnerRoutesApi = (routes) => adminPost("/admin/partner/routes", { routes });
export const partnerAccountsApi = () => adminPost("/admin/partner/accounts");
/** Admin (neu) · „Neuer Auftrag": Auftrag manuell anlegen → { id, amount, currency, mailed, partner }. */
export const createAdminOrder = (p) => adminPost("/admin/orders/create", p);
/** Bewertungen eines Google-Profils (SerpApi) zum Anhaken → { enabled, reviews:[{id,name,rating,text,days,link}] }. */
export const placeReviews = (placeId, lang) => adminPost("/admin/places/reviews", { placeId, lang: lang || "de" });
/** Nachbestellung: Bewertungen zu bestehendem Auftrag (gate: Zahlungsart-Pflicht für die neuen, falls noch keine hinterlegt). */
export const addReviewsToOrderApi = (p) => adminPost("/admin/orders/add-reviews", p);
/** Preise eines bestehenden Auftrags: { orderId, prices: { itemKey: Preis | null } } bzw. { orderId, amount } (Profil). */
export const setOrderPricesApi = (p) => adminPost("/admin/orders/prices", p);
export const reviewsBillInfoApi = (orderId) => adminPost("/admin/reviews/bill-info", { orderId });
export const reviewsBillApi = (p) => adminPost("/admin/reviews/bill", p);
/** Bewertungs-Link auflösen → { place, review:{name,rating,days,text}|null }. */
export const resolveReviewLinkApi = (link) => adminPost("/admin/reviews/resolve", { link, lang: "de" });
/** Admin (neu) · Mahnung: Vorschau/Versand über die bestehenden Endpunkte (preview:true = nur rendern). */
export const payLinkMail = (payload) => adminPost("/admin/paylink", payload);
export const templateMail = (payload) => adminPost("/admin/send-template", payload);
export const reviewsMahnungMail = (payload) => adminPost("/admin/reviews-mahnung", payload);
/** Dashboard-Aktivität eines Kunden (E-Mail des Auftrags) → { loginCount, clickCount, lastSeenAt, lastAction, events[] }. */
export const customerActivity = (email, orderId) => adminPost("/admin/activity", { email, orderId });
/** Persönlichen Dashboard-Login-Link an einen Kunden senden. */
export const custInviteOne = (p) => adminPost("/admin/cust/invite-one", p);
/** Alle offenen Bewertungen eines Auftrags auf einen Status setzen (wie der Partner): working | software | not_possible. */
export const partnerOrderStatus = (orderId, status) => adminPost("/admin/partner/order-status", { orderId, status });
/** „Kundendashboard öffnen": einmaliger Link zur Admin-Ansicht (ohne Tracking) → { url }. */
/** Inhaber-Nachweis: Dokument laden ({ mime, data b64, result }) bzw. selbst freigeben/ablehnen. */
/** Zahlungsziel setzen/ändern (ISO) oder entfernen (due = ""). */
export const setPayDue = (orderId, due) => adminPost("/admin/pay-due", { orderId, due });
export const verifyDoc = (orderId) => adminPost("/admin/verify-doc", { orderId });
export const verifySet = (orderId, action, reason) => adminPost("/admin/verify-set", { orderId, action, reason });
export const custImpersonate = (email, orderId) => adminPost("/admin/cust/impersonate", { email, orderId });
/** Globaler Aktivitäten-Feed aller Kunden → { stats, seen[], items[], nextCursor }. */
export const activityFeed = (p) => adminPost("/admin/activity/feed", p);
/** Nachfassen: Liste (fällig fürs Team), geplante + gesendete automatische Erinnerungen. */
export const followupsList = () => adminPost("/admin/followups", {});
/** Vorschau der automatischen Erinnerungs-Mail. kind: pay | pay2 | sw | never | news | combo */
export const followupPreview = (kind, lang) => adminPost("/admin/followups/preview", { kind, lang });
