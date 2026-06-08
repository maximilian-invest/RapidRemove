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
export async function sendAdminEmail({ to, subject, text }) {
  if (!OPS) throw new Error("Kein ops-Backend konfiguriert.");
  const res = await fetch(OPS + "/admin/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: TOKEN, to, subject, text }),
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
    amount: Number(r.amount) || 0, protAmount: Number(r.prot_amount) || 0, country: r.country || "DE", note: r.note || "",
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
