/* Admin-Dashboard ↔ ops-Backend: Login-Prüfung + echter E-Mail-Versand.
 * Die ops-URL kommt aus NEXT_PUBLIC_OPS_URL (gleiches Backend wie der Wizard). */
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

/* ---- Live-Daten fürs Dashboard (DB-Zeilen → Admin-Anzeigeform) ---- */
function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function mapOrder(r) {
  return {
    id: r.id, created: fmtDate(r.created_at), name: r.name || "", email: r.email || "", phone: r.phone || "",
    company: r.company || "", profile: r.profile || "", reviews: Number(r.reviews) || 0, rating: r.rating || "—",
    service: r.service || "remove", protection: r.protection || null, status: r.status || "new", pay: r.pay || "pending",
    amount: Number(r.amount) || 0, protAmount: Number(r.prot_amount) || 0, country: r.country || "DE", lang: r.lang || "de", note: r.note || "",
    form: r.form || null,
    addr: (r.raw && r.raw.addr) || "", mapsUri: (r.raw && r.raw.mapsUri) || "", photo: (r.raw && r.raw.photo) || "",
  };
}
function mapCheck(r) {
  return {
    id: r.id, created: fmtDate(r.created_at), profile: r.profile || "", name: r.name || "—", email: r.email || "",
    rating: r.rating || "—", reviews: Number(r.reviews) || 0, flagged: Number(r.flagged) || 0,
    recommend: r.recommend || "remove", status: r.status || "neu", orderId: r.order_id || null,
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
export async function sendPayLink({ to, name, orderId, currency, service, protection, serviceAmount, protAmount, protType, total, protectionLabel, template, lang, url }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/paylink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, email: to, name, orderId, currency, service, protection, serviceAmount, protAmount, protType, total, protectionLabel, template, lang, url }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Sendet eine echte, gebrandete Vorlage (z. B. Rechte benötigt, Adresse) an den Kunden. */
export async function sendTemplate({ key, to, orderId, lang }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, key, to, orderId, lang }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}

/** Aktivitäts-Verlauf einer Kundenakte – per E-Mail (robust, inkl. automatischer
 *  System-Mails wie „Schutz aktiviert"), sonst per Bestell-ID als Fallback. */
export async function fetchEvents(orderId, email) {
  if (!OPS || (!orderId && !email)) return [];
  const res = await fetch(OPS + "/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, email }),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  return (j.events || []).map((e) => ({ ic: e.type || "order", t: e.title || "", d: e.detail || "", time: fmtDate(e.created_at), auto: !!e.auto }));
}

/** Bestell-Status dauerhaft im Backend setzen (bleibt bis zur nächsten Änderung). */
export async function setOrderStatus({ orderId, status, pay, label }) {
  if (!OPS || !orderId || !status) return { ok: false };
  const res = await fetch(OPS + "/admin/order-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, orderId, status, pay, label }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || ("HTTP " + res.status));
  return j;
}
