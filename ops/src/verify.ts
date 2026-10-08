/* Inhaber-Nachweis bei Bewertungs-Aufträgen mit 4–5-Sterne-Bewertungen (Schutz vor Sabotage durch Konkurrenten:
 * jemand lässt die GUTEN Bewertungen eines anderen Unternehmens löschen).
 *
 * Ablauf: Bestellung enthält eine Bewertung mit ≥ 4 Sternen → raw.verify = { status: "pending" }, der Auftrag geht
 * NICHT aufs Partner-Board. Der Kunde lädt im Dashboard einen Nachweis hoch (Gewerbeschein, Firmenbuch-/Handels-
 * registerauszug, Steuer-/USt-Bescheid …). Claude (Sonnet) prüft sofort, ob Dokument und Google-Profil zusammenpassen:
 *   passt  → status "ok", Auftrag geht aufs Partner-Board (normaler Ablauf)
 *   passt nicht → status "rejected" + Grund, Kunde kann einen anderen Nachweis hochladen; Team bekommt einen Push.
 * Admin kann jederzeit selbst freigeben/ablehnen und das Dokument ansehen. */
import type { FastifyInstance } from "fastify";
import { pool, setOrderRawField, insertEvent } from "./db";
import { notifyTeam } from "./notify";
import { customerSessionInfo } from "./customers";
import { startOrderIfReady } from "./orderStart";

export type VerifyState = { status: "pending" | "checking" | "ok" | "rejected"; reason?: string; at?: string; by?: "ai" | "admin"; doc?: number; tries?: number };

/** Braucht der Auftrag einen Inhaber-Nachweis? (mind. eine Bewertung mit 4 oder 5 Sternen) */
export const needsVerify = (items: { rating?: number }[]) => items.some((it) => Number(it.rating) >= 4);

const SITE_URL = process.env.SITE_URL || "https://www.rapid-remove.com";
const MODEL = () => process.env.VERIFY_MODEL || process.env.CHAT_MODEL || "claude-sonnet-5-5";
const IMG = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const LANG_NAME: Record<string, string> = { de: "German", en: "English", es: "Spanish", fr: "French", it: "Italian", nl: "Dutch", pt: "Portuguese", ja: "Japanese", sv: "Swedish", da: "Danish", no: "Norwegian" };

async function init(): Promise<void> {
  if (!pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS cust_verify_docs (
    id bigserial PRIMARY KEY, order_id text NOT NULL, email text, mime text NOT NULL, doc bytea NOT NULL,
    result jsonb, created_at timestamptz NOT NULL DEFAULT now())`);
}

type Check = { approve: boolean; confidence: number; doc_type?: string; name_on_doc?: string; reason?: string };

/** Claude prüft das Dokument gegen die Profildaten. Gibt null zurück, wenn die KI nicht erreichbar ist. */
async function aiCheck(doc: Buffer, mime: string, ctx: { business: string; addr: string; company: string; name: string; email: string; lang: string }): Promise<Check | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const lang = LANG_NAME[ctx.lang] || "English";
  const system = `You verify that a customer who ordered the removal of Google reviews really owns or runs the business. Someone could otherwise order the removal of a competitor's GOOD reviews.
You get the Google Business Profile data and one uploaded document. Decide whether the document proves a connection between the customer and THIS business.
Accept: official business documents such as a trade licence, business/commercial register extract, company registration certificate, tax or VAT registration, an official letter or invoice/utility bill addressed to the business, or a screenshot of the Google Business Profile MANAGER view (not the public listing) for this business.
The business or legal entity name on the document must clearly match the profile name (allow legal suffixes like GmbH, LLC, S.L., Ltd, trading names vs. legal names, different spelling or language). A matching address strengthens the match. If the document names a person, it may match the customer's name.
Reject: screenshots of the public Google listing or of reviews, documents of a different business, unreadable/blank images, random photos, documents that are obviously edited.
Answer ONLY with JSON: {"approve": true|false, "confidence": 0.0-1.0, "doc_type": "...", "name_on_doc": "...", "reason": "one short, friendly sentence for the customer in ${lang} explaining the decision (if rejected: what to upload instead)"}`;
  const info = `Google Business Profile: "${ctx.business}"${ctx.addr ? `, address: ${ctx.addr}` : ""}
Company entered by the customer: ${ctx.company || "-"}
Customer name: ${ctx.name || "-"} · e-mail: ${ctx.email}`;
  const block = mime === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: doc.toString("base64") } }
    : { type: "image", source: { type: "base64", media_type: mime, data: doc.toString("base64") } };
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 60_000);
  try {
    const res = await fetch(`${(process.env.VERIFY_AI_URL || "https://api.anthropic.com").replace(/\/+$/, "")}/v1/messages`, {
      method: "POST", signal: ctl.signal,
      headers: {
        "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01",
        ...(process.env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID.trim() } : {}),
      },
      body: JSON.stringify({ model: MODEL(), max_tokens: 400, system, messages: [{ role: "user", content: [block, { type: "text", text: info }] }] }),
    });
    const j = await res.json().catch(() => ({})) as { content?: { type: string; text?: string }[]; error?: { message?: string } };
    if (!res.ok) throw new Error(j.error?.message || "HTTP " + res.status);
    const txt = (j.content || []).filter((c) => c.type === "text").map((c) => c.text || "").join("");
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as Check;
    return { approve: !!o.approve, confidence: Math.max(0, Math.min(1, Number(o.confidence) || 0)), doc_type: String(o.doc_type || "").slice(0, 80), name_on_doc: String(o.name_on_doc || "").slice(0, 120), reason: String(o.reason || "").slice(0, 300) };
  } catch (e) {
    console.error("Inhaber-Nachweis: KI-Prüfung fehlgeschlagen", e);
    return null;
  } finally { clearTimeout(t); }
}

type OrderRow = { id: string; email: string; name: string | null; company: string | null; profile: string | null; lang: string | null; raw: Record<string, unknown> | null };
async function orderOf(id: string): Promise<OrderRow | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT id, email, name, company, profile, lang, raw FROM orders WHERE id=$1 AND service='reviews'`, [id]);
  return (r.rows[0] as OrderRow) || null;
}

/** Freigabe: Status setzen und den Auftrag aufs Partner-Board schicken (normaler Ablauf ab hier). */
async function approve(o: OrderRow, by: "ai" | "admin", extra: Partial<VerifyState> = {}): Promise<void> {
  const prev = (o.raw?.verify || {}) as VerifyState;
  await setOrderRawField(o.id, "verify", { ...prev, ...extra, status: "ok", by, at: new Date().toISOString() });
  await insertEvent({ orderId: o.id, email: o.email, type: "note", title: `Inhaber-Nachweis freigegeben (${by === "ai" ? "KI" : "Admin"})`, detail: extra.reason || "", auto: by === "ai" }).catch(() => {});
  // Partner-Board erst, wenn auch die Zahlungsart hinterlegt ist (falls verlangt).
  await startOrderIfReady(o.id).catch((e) => console.error("Partner-Board nach Freigabe fehlgeschlagen", e));
}

export function registerVerifyRoutes(app: FastifyInstance, adminToken: string): void {
  void init().catch(() => {});
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Kunde lädt den Nachweis hoch (Bild oder PDF, base64) → KI prüft sofort.
  app.post("/cust/verify-upload", { bodyLimit: 14 * 1024 * 1024 }, async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s || !pool) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "admin_view" });
    const o = await orderOf(String(b.orderId || ""));
    if (!o || String(o.email || "").toLowerCase() !== s.email.toLowerCase()) return reply.code(404).send({ ok: false, error: "order" });
    const v = (o.raw?.verify || null) as VerifyState | null;
    if (!v || v.status === "ok") return { ok: true, status: v?.status || "ok" };
    if ((v.tries || 0) >= 8) return reply.code(429).send({ ok: false, error: "too_many" });
    const mime = String(b.mime || "").toLowerCase();
    if (!IMG.has(mime) && mime !== "application/pdf") return reply.code(400).send({ ok: false, error: "type" });
    const doc = Buffer.from(String(b.data || "").replace(/^data:[^,]+,/, ""), "base64");
    if (doc.length < 1000 || doc.length > 10 * 1024 * 1024) return reply.code(400).send({ ok: false, error: "size" });
    const ins = await pool.query(`INSERT INTO cust_verify_docs (order_id, email, mime, doc) VALUES ($1,$2,$3,$4) RETURNING id`, [o.id, s.email, mime, doc]);
    const docId = Number(ins.rows[0].id);
    const tries = (v.tries || 0) + 1;
    await setOrderRawField(o.id, "verify", { ...v, status: "checking", doc: docId, tries });
    const ctx = { business: String(o.raw?.placeName || "") || o.profile || o.company || "", addr: String(o.raw?.placeAddr || o.raw?.addr || ""), company: o.company || "", name: o.name || "", email: s.email, lang: String(o.lang || "en").slice(0, 2) };
    const res = await aiCheck(doc, mime, ctx);
    await pool.query(`UPDATE cust_verify_docs SET result=$2 WHERE id=$1`, [docId, JSON.stringify(res)]).catch(() => {});
    if (res && res.approve && res.confidence >= 0.7) {
      await approve(o, "ai", { doc: docId, tries, reason: `${res.doc_type || "Dokument"} · ${res.name_on_doc || ""}`.trim() });
      void notifyTeam(`Nachweis geprüft ✓ · ${o.profile || o.company || o.email}`, `KI hat freigegeben (${res.doc_type || "Dokument"}) · Auftrag ${o.id} läuft jetzt normal`, `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "customer" });
      return { ok: true, status: "ok" };
    }
    // Abgelehnt oder KI nicht erreichbar → Kunde sieht den Grund, Team prüft notfalls selbst.
    const reason = res ? res.reason || "" : "";
    await setOrderRawField(o.id, "verify", { ...v, status: res ? "rejected" : "pending", reason, doc: docId, tries, at: new Date().toISOString(), by: "ai" });
    await insertEvent({ orderId: o.id, email: s.email, type: "note", title: res ? "Inhaber-Nachweis abgelehnt (KI)" : "Inhaber-Nachweis hochgeladen – KI nicht erreichbar, bitte selbst prüfen", detail: res ? `${res.doc_type || ""} · ${res.name_on_doc || ""} · ${reason}` : "", auto: true }).catch(() => {});
    void notifyTeam(`Nachweis ${res ? "abgelehnt" : "prüfen"} · ${o.profile || o.company || o.email}`, res ? reason : "KI nicht erreichbar – bitte im Admin selbst freigeben", `${SITE_URL}/admin?order=${encodeURIComponent(o.id)}`, { kind: "customer" });
    return { ok: true, status: res ? "rejected" : "pending", reason, manual: !res };
  });

  // Admin: Dokument ansehen.
  app.post("/admin/verify-doc", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b) || !pool) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const r = await pool.query(`SELECT id, mime, doc, result, created_at FROM cust_verify_docs WHERE order_id=$1 ORDER BY id DESC LIMIT 1`, [String(b.orderId || "")]);
    if (!r.rows[0]) return reply.code(404).send({ ok: false, error: "kein Dokument" });
    const x = r.rows[0];
    return { ok: true, mime: x.mime, data: Buffer.from(x.doc).toString("base64"), result: x.result, created: x.created_at };
  });

  // Admin: selbst freigeben oder ablehnen.
  app.post("/admin/verify-set", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const o = await orderOf(String(b.orderId || ""));
    if (!o) return reply.code(404).send({ ok: false, error: "Auftrag nicht gefunden" });
    if (b.action === "approve") { await approve(o, "admin"); return { ok: true, status: "ok" }; }
    const reason = String(b.reason || "").slice(0, 300);
    await setOrderRawField(o.id, "verify", { ...((o.raw?.verify || {}) as VerifyState), status: "rejected", reason, by: "admin", at: new Date().toISOString() });
    await insertEvent({ orderId: o.id, type: "note", title: "Inhaber-Nachweis abgelehnt (Admin)", detail: reason }).catch(() => {});
    return { ok: true, status: "rejected" };
  });
}
