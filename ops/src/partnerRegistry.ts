/* Partner-Ökosystem: Registrierung, Freigabe, Leistungen, automatische Zuteilung.
 *
 *  1. Partner meldet sich (Einladungslink oder /partner?join) mit Kontaktdaten + angebotenen Leistungen + Preisvorstellung an
 *     → Status „pending", Team-Push. Er kann sich einloggen, sieht aber nur „Application under review".
 *  2. Admin (Konto → Partner) prüft: Leistungen freigeben, Partnerpreis je Leistung festlegen, „Freigeben" (active),
 *     „Pausieren" (keine neuen Aufträge, laufende weiter) oder „Ablehnen".
 *  3. Einstellungen → Automatische Weiterleitung: je Leistung (neue / alte Bewertungen, Software-Fälle, Profile)
 *     der Partner, der neue Aufträge automatisch bekommt – oder „Aus" (manuell übergeben).
 *  4. Partner sieht nur SEINE Aufgaben und Auszahlungen; Auszahlung/Gutschrift je Partner (payouts.ts).
 *
 * Leistungen (service) einer Aufgabe: profile = ganzes Profil · sw = Software-Fall (ohne Text bzw. alt + USA)
 * · old = älter als 4 Wochen · std = Bewertung bis 4 Wochen.
 * Bestand: der bisherige (einzige) Partner bleibt aktiv, ist für alle Leistungen zu den bisherigen Preisen freigegeben
 * und bekommt die Weiterleitung entsprechend den bisherigen Schaltern (Bewertungen / Profile).
 */
import crypto from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { pool } from "./db";
import { notifyTeam } from "./notify";
import { hashPassword } from "./customers";
import { createPartnerSession, partnerSessionEmail, isPartnerSession } from "./partnerAuth";
import { isTestEmail } from "./testAccounts";
import { sendMail } from "./mailer";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
export const TERMS_VERSION = "2026-10-09";

export const SERVICES = [
  { id: "std", de: "Google-Bewertungen (bis 4 Wochen)", en: "Google reviews (up to 4 weeks old)", price: 10 },
  { id: "old", de: "Google-Bewertungen (älter als 4 Wochen)", en: "Google reviews (older than 4 weeks)", price: 40 },
  { id: "sw", de: "Software-Fälle (ohne Text / alte US-Bewertungen)", en: "Rating-only / special cases (software)", price: 150 },
  { id: "profile", de: "Ganze Google-Profile löschen", en: "Remove whole Google Business Profiles", price: 50 },
] as const;
export type ServiceId = (typeof SERVICES)[number]["id"];
const SIDS = SERVICES.map((s) => s.id) as string[];
export const isService = (v: unknown): v is ServiceId => SIDS.includes(String(v));

/** Leistung einer Aufgabe bzw. eines Bestell-Items. */
export function serviceOf(x: { kind?: unknown; method?: unknown; nt?: unknown; sw?: unknown; old?: unknown }): ServiceId {
  if (x.kind === "profile") return "profile";
  if (x.method === "sw" || x.kind === "nt" || x.nt === true || x.sw === true) return "sw";
  if (x.kind === "old" || x.old === true) return "old";
  return "std";
}

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const norm = (e: unknown) => String(e || "").trim().toLowerCase().slice(0, 200);
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const ipOf = (req: FastifyRequest) => String((req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] || req.ip || "").trim().slice(0, 80);

async function getSetting(key: string): Promise<string | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [key]).catch(() => ({ rows: [] as { value: string }[] }));
  return r.rows[0]?.value ?? null;
}
async function setSetting(key: string, value: string): Promise<void> {
  if (!pool) return;
  await pool.query(`INSERT INTO partner_settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2`, [key, value]);
}

/* ---------------- Tabellen ---------------- */
export async function initPartnerRegistry(): Promise<void> {
  if (!pool) return;
  for (const c of [
    "status text NOT NULL DEFAULT 'active'", "company text", "whatsapp text", "about text", "capacity integer",
    "services jsonb", "approved jsonb", "applied_at timestamptz", "approved_at timestamptz", "invite_id bigint",
    "terms_at timestamptz", "terms_ip text", "terms_v text", "admin_note text",
  ]) await pool.query(`ALTER TABLE partners ADD COLUMN IF NOT EXISTS ${c}`);
  await pool.query(`ALTER TABLE partner_accounts ADD COLUMN IF NOT EXISTS partner_id bigint`);
  await pool.query(`ALTER TABLE partner_push_subs ADD COLUMN IF NOT EXISTS partner_id bigint`).catch(() => {});
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_invites (
    id bigserial PRIMARY KEY, token_hash text UNIQUE NOT NULL, name text, email text, services jsonb, note text,
    created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, used_at timestamptz, partner_id bigint)`);
  // Bestand: erster Partner = bisheriger Partner → für alle Leistungen zu den bisherigen Preisen freigegeben.
  const first = await firstPartnerId();
  if (first) {
    const def = Object.fromEntries(SERVICES.map((s) => [s.id, s.price]));
    await pool.query(`UPDATE partners SET approved=$2, services=COALESCE(services, $3), approved_at=COALESCE(approved_at, created_at) WHERE id=$1 AND approved IS NULL`,
      [first, JSON.stringify(def), JSON.stringify(SERVICES.map((s) => ({ id: s.id, price: s.price })))]);
    // Logins ohne Partner (außer Test-Logins) gehören zum bisherigen Partner.
    const acc = await pool.query(`SELECT email FROM partner_accounts WHERE partner_id IS NULL`);
    for (const a of acc.rows as { email: string }[]) if (!isTestEmail(a.email)) await pool.query(`UPDATE partner_accounts SET partner_id=$2 WHERE email=$1`, [a.email, first]);
    await pool.query(`UPDATE partner_push_subs SET partner_id=$1 WHERE partner_id IS NULL AND NOT test`, [first]).catch(() => {});
    // Weiterleitung: bisherige Schalter (Bewertungen / Profile) → Partner je Leistung (einmalig).
    if ((await getSetting("routes_v1")) === null) {
      const ar = await getSetting("auto_reviews"), ap = await getSetting("auto_profiles");
      const rev = ar == null ? true : ar === "1", prof = ap === "1";
      for (const s of ["std", "old", "sw"]) await setSetting(`route_${s}`, rev ? String(first) : "");
      await setSetting("route_profile", prof ? String(first) : "");
      await setSetting("routes_v1", new Date().toISOString());
    }
  }
}

export async function firstPartnerId(): Promise<number | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT id FROM partners WHERE active ORDER BY id LIMIT 1`).catch(() => ({ rows: [] as { id: string }[] }));
  return r.rows[0] ? Number(r.rows[0].id) : null;
}

/** Partner zur Partner-Sitzung (Login) bzw. zum alten geheimen Link (= bisheriger Partner). Test-/Vorschau-Sitzungen → null. */
export async function partnerIdOf(t: unknown): Promise<number | null> {
  if (!pool) return null;
  const s = String(t || "");
  if (s.startsWith("ps_")) {
    const email = await partnerSessionEmail(s);
    if (!email || email === "admin-preview" || isTestEmail(email)) return null;
    const r = await pool.query(`SELECT partner_id FROM partner_accounts WHERE email=$1`, [email]);
    if (r.rows[0]?.partner_id) return Number(r.rows[0].partner_id);
    const p = await pool.query(`SELECT id FROM partners WHERE lower(email)=$1 ORDER BY id LIMIT 1`, [email]);
    return p.rows[0] ? Number(p.rows[0].id) : await firstPartnerId();
  }
  return firstPartnerId(); // geheimer Link (Altbestand)
}
export async function partnerStatus(id: number | null): Promise<string | null> {
  if (!pool || !id) return null;
  const r = await pool.query(`SELECT status, active FROM partners WHERE id=$1`, [id]);
  if (!r.rows[0]) return null;
  return r.rows[0].active === false && r.rows[0].status === "active" ? "paused" : String(r.rows[0].status || "active");
}

/* ---------------- Zuteilung + Preise ---------------- */
export async function getRoutes(): Promise<Record<ServiceId, number | null>> {
  const out = {} as Record<ServiceId, number | null>;
  for (const s of SERVICES) { const v = await getSetting(`route_${s.id}`); out[s.id] = v && /^\d+$/.test(v) ? Number(v) : null; }
  return out;
}
/** Partner, der Aufgaben dieser Leistung automatisch bekommt (nur aktiv + für die Leistung freigegeben), sonst null. */
export async function routeFor(service: ServiceId): Promise<number | null> {
  if (!pool) return null;
  const v = await getSetting(`route_${service}`);
  if (!v || !/^\d+$/.test(v)) return null;
  const r = await pool.query(`SELECT id, approved FROM partners WHERE id=$1 AND status='active' AND active`, [Number(v)]);
  const p = r.rows[0] as { id: string; approved: Record<string, number> | null } | undefined;
  return p && p.approved && p.approved[service] != null ? Number(p.id) : null;
}
/** Partnerpreis (USD) je Leistung – aus der Freigabe des Partners, sonst Standardpreis. */
export async function partnerPrice(partnerId: number | null, service: ServiceId): Promise<number> {
  const def = SERVICES.find((s) => s.id === service)!.price;
  if (!pool || !partnerId) return def;
  const r = await pool.query(`SELECT approved FROM partners WHERE id=$1`, [partnerId]).catch(() => ({ rows: [] as { approved: Record<string, number> | null }[] }));
  const v = Number(r.rows[0]?.approved?.[service]);
  return Number.isFinite(v) && v > 0 ? v : def;
}
/** Partner für eine manuelle Übergabe: Zuteilung der Leistung, sonst erster aktiver Partner. */
export async function defaultPartnerFor(service: ServiceId): Promise<number | null> {
  return (await routeFor(service)) ?? firstPartnerId();
}

/* ---------------- Ansichten ---------------- */
type PRow = {
  id: string; name: string; email: string | null; phone: string | null; note: string | null; active: boolean; created_at: string;
  status: string; company: string | null; whatsapp: string | null; about: string | null; capacity: number | null; country: string | null;
  services: { id: string; price?: number | null; note?: string }[] | null; approved: Record<string, number> | null;
  applied_at: string | null; approved_at: string | null; terms_at: string | null; admin_note: string | null; invite_id: string | null;
  payout_method: string | null; legal_name: string | null;
};
function adminPartnerView(p: PRow, stats?: Record<string, number>, login?: string | null) {
  return {
    id: Number(p.id), name: p.name, company: p.company || "", email: p.email || "", phone: p.phone || "", whatsapp: p.whatsapp || p.phone || "",
    country: p.country || "", about: p.about || "", capacity: p.capacity ?? null, note: p.note || "", adminNote: p.admin_note || "",
    status: p.active === false && p.status === "active" ? "paused" : p.status || "active", active: !!p.active,
    services: Array.isArray(p.services) ? p.services : [], approved: p.approved || {}, applied: p.applied_at, approvedAt: p.approved_at, created: p.created_at,
    terms: !!p.terms_at, invited: !!p.invite_id, login: login || null, payoutMethod: p.payout_method || null, legalName: p.legal_name || "",
    stats: stats || { open: 0, removed: 0, owedUsd: 0 },
  };
}

/* ---------------- Mails ---------------- */
async function mailPartner(to: string, subject: string, lines: string[], cta?: { href: string; label: string }): Promise<void> {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || isTestEmail(to)) return;
  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:560px">
    ${lines.map((l) => `<p>${esc(l)}</p>`).join("")}
    ${cta ? `<p style="margin:22px 0"><a href="${cta.href}" style="background:#ff8000;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px;display:inline-block">${esc(cta.label)}</a></p>` : ""}
    <p>RapidRemove · Simple Solution. OG</p></div>`;
  await sendMail({ to, subject, html, replyTo: process.env.MAIL_REPLY_TO }).catch(() => {});
}

/* ---------------- Routen ---------------- */
export function registerPartnerRegistry(app: FastifyInstance, adminToken: string): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;
  const hits = new Map<string, number[]>();
  const limited = (k: string, n: number) => {
    const now = Date.now(); const a = (hits.get(k) || []).filter((x) => now - x < 60 * 60_000);
    if (a.length >= n) { hits.set(k, a); return true; }
    a.push(now); hits.set(k, a); return false;
  };
  const inviteRow = async (tok: unknown) => {
    const s = String(tok || "");
    if (!pool || !s.startsWith("inv_")) return null;
    const r = await pool.query(`SELECT * FROM partner_invites WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now()`, [sha(s)]);
    return (r.rows[0] as { id: string; name: string | null; email: string | null; services: string[] | null; note: string | null } | undefined) || null;
  };

  // Öffentlich: Leistungen (für das Registrierungsformular) + Einladung (Name/E-Mail vorbefüllen).
  app.post("/partner/join-info", async (req) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const inv = await inviteRow(b.invite);
    return { ok: true, services: SERVICES.map((s) => ({ id: s.id, label: s.en })), termsVersion: TERMS_VERSION, invite: inv ? { name: inv.name || "", email: inv.email || "", services: inv.services || [] } : null };
  });

  // Öffentlich: Registrierung → Status „pending" + Login (Sitzung) → Partner sieht „Application under review".
  app.post("/partner/register", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    if (limited("reg:" + ipOf(req), 8)) return reply.code(429).send({ ok: false, error: "Too many attempts – please try again later." });
    const inv = await inviteRow(b.invite);
    const v = {
      name: clip(b.name, 120), company: clip(b.company, 160), email: norm(b.email), pw: String(b.password || ""),
      whatsapp: clip(b.whatsapp, 40), country: clip(b.country, 2).toUpperCase(), about: clip(b.about, 1500),
      capacity: Number.isFinite(Number(b.capacity)) && Number(b.capacity) > 0 ? Math.min(10000, Math.round(Number(b.capacity))) : null,
    };
    if (!v.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) || !/^[A-Z]{2}$/.test(v.country)) return reply.code(400).send({ ok: false, error: "Please fill in your name, email and country." });
    if (v.pw.length < 8) return reply.code(400).send({ ok: false, error: "Password: at least 8 characters." });
    if (!/^\+?[\d\s()-]{7,}$/.test(v.whatsapp)) return reply.code(400).send({ ok: false, error: "Please enter your WhatsApp number with country code." });
    const svc = (Array.isArray(b.services) ? b.services : []).map((x) => x as Record<string, unknown>).filter((x) => isService(x.id))
      .map((x) => ({ id: String(x.id), price: Number.isFinite(Number(x.price)) && Number(x.price) > 0 ? Math.round(Number(x.price) * 100) / 100 : null, note: clip(x.note, 200) }));
    if (!svc.length) return reply.code(400).send({ ok: false, error: "Please choose at least one service you offer." });
    if (b.terms !== true) return reply.code(400).send({ ok: false, error: "Please accept the partner terms." });
    const ex = await pool.query(`SELECT 1 FROM partner_accounts WHERE email=$1`, [v.email]);
    if (ex.rowCount) return reply.code(409).send({ ok: false, error: "This email is already registered – please log in." });
    const p = await pool.query(
      `INSERT INTO partners (name, email, phone, whatsapp, company, country, about, capacity, services, status, active, applied_at, invite_id, terms_at, terms_ip, terms_v)
       VALUES ($1,$2,$3,$3,$4,$5,$6,$7,$8,'pending',true,now(),$9,now(),$10,$11) RETURNING id`,
      [v.name, v.email, v.whatsapp, v.company || null, v.country, v.about || null, v.capacity, JSON.stringify(svc), inv ? inv.id : null, ipOf(req), TERMS_VERSION]);
    const pid = Number(p.rows[0].id);
    await pool.query(`INSERT INTO partner_accounts (email, pass_hash, partner_id) VALUES ($1,$2,$3)`, [v.email, hashPassword(v.pw), pid]);
    if (inv) await pool.query(`UPDATE partner_invites SET used_at=now(), partner_id=$2 WHERE id=$1`, [inv.id, pid]);
    const token = await createPartnerSession(v.email);
    const sl = svc.map((s) => (SERVICES.find((x) => x.id === s.id)?.de || s.id) + (s.price ? ` ($${s.price})` : "")).join(", ");
    void notifyTeam("Neue Partner-Bewerbung", `${v.name}${v.company ? " · " + v.company : ""} · ${v.country} · ${sl}`.slice(0, 180), `${SITE_URL}/admin?partner=${pid}`, { kind: "partner" });
    void mailPartner(v.email, "Your RapidRemove partner application", [
      `Hi ${v.name},`, "thanks for registering as a RapidRemove partner. We're reviewing your application and will get back to you shortly – usually within 1–2 working days.",
      "As soon as you're approved, you'll see your tasks in the partner app and can set up automatic payouts.",
    ], { href: `${SITE_URL}/partner`, label: "Open the partner app" });
    return { ok: true, token, status: "pending" };
  });

  // Partner: eigener Status (Freigabe) + Profil.
  app.post("/partner/me", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const t = String(b.t || "");
    if (!pool) return reply.code(503).send({ ok: false, error: "unavailable" });
    const okTok = t.startsWith("ps_") ? await isPartnerSession(t) : !!(await getSetting("token")) && (await getSetting("token")) === t;
    if (!okTok) return reply.code(401).send({ ok: false, error: "invalid link" });
    const id = await partnerIdOf(t);
    if (!id) return { ok: true, preview: true, status: "active" };
    const r = await pool.query(`SELECT * FROM partners WHERE id=$1`, [id]);
    const p = r.rows[0] as PRow | undefined;
    if (!p) return { ok: true, status: "active" };
    const st = p.active === false && p.status === "active" ? "paused" : p.status || "active";
    return { ok: true, status: st, name: p.name, services: SERVICES.filter((s) => p.approved && p.approved[s.id] != null).map((s) => ({ id: s.id, label: s.en, price: Number(p.approved![s.id]) })), applied: Array.isArray(p.services) ? p.services : [] };
  });

  /* ---- Admin ---- */
  // Liste aller Partner (inkl. Bewerbungen) + Kennzahlen je Partner + Zuteilung.
  app.post("/admin/partners", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return { ok: true, partners: [], routes: {}, services: SERVICES };
    const first = await firstPartnerId();
    const r = await pool.query(`SELECT * FROM partners ORDER BY (status='pending') DESC, active DESC, id`);
    const st = await pool.query(`SELECT COALESCE(partner_id, $1) AS pid,
        count(*) FILTER (WHERE status IN ('new','working','software'))::int AS open,
        count(*) FILTER (WHERE status='removed')::int AS removed,
        COALESCE(sum(price_usd) FILTER (WHERE status='removed' AND paid_at IS NULL),0)::float AS owed
      FROM partner_tasks WHERE NOT test GROUP BY 1`, [first]);
    const by = new Map((st.rows as { pid: string; open: number; removed: number; owed: number }[]).map((x) => [String(x.pid), x]));
    const acc = await pool.query(`SELECT email, partner_id FROM partner_accounts WHERE partner_id IS NOT NULL ORDER BY created_at`);
    const login = new Map<string, string>(); for (const a of acc.rows as { email: string; partner_id: string }[]) if (!login.has(String(a.partner_id))) login.set(String(a.partner_id), a.email);
    const all = { open: 0, removed: 0 };
    const partners = (r.rows as PRow[]).map((p) => {
      const s = by.get(String(p.id)); if (s) { all.open += s.open; all.removed += s.removed; }
      return adminPartnerView(p, { open: s?.open || 0, removed: s?.removed || 0, owedUsd: Math.round((s?.owed || 0) * 100) / 100 }, login.get(String(p.id)));
    });
    return { ok: true, partners, board: all, routes: await getRoutes(), services: SERVICES.map((s) => ({ id: s.id, label: s.de, price: s.price })) };
  });

  // Partner anlegen / bearbeiten (Kontakt, Notiz, Leistungen + Preise, Status).
  app.post("/admin/partners/save", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const id = Number(b.id);
    const name = clip(b.name, 120), email = norm(b.email), phone = clip(b.whatsapp ?? b.phone, 40), note = clip(b.note, 300), company = clip(b.company, 160), country = clip(b.country, 2).toUpperCase();
    if (!name) return reply.code(400).send({ ok: false, error: "Name fehlt" });
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply.code(400).send({ ok: false, error: "E-Mail ungültig" });
    let approved: Record<string, number> | null = null;
    if (b.approved && typeof b.approved === "object") {
      approved = {};
      for (const [k, v] of Object.entries(b.approved as Record<string, unknown>)) if (isService(k) && v != null && Number(v) > 0) approved[k] = Math.round(Number(v) * 100) / 100;
    }
    if (Number.isInteger(id) && id > 0) {
      await pool.query(`UPDATE partners SET name=$2, email=$3, phone=$4, whatsapp=$4, note=$5, company=$6, country=COALESCE(NULLIF($7,''), country)${approved ? ", approved=$8" : ""}${b.adminNote != null ? `, admin_note=$${approved ? 9 : 8}` : ""} WHERE id=$1`,
        [id, name, email || null, phone || null, note || null, company || null, country, ...(approved ? [JSON.stringify(approved)] : []), ...(b.adminNote != null ? [clip(b.adminNote, 1000)] : [])]);
      return { ok: true, id };
    }
    // Neu (vom Admin angelegt) → gleich aktiv; Login per Einladung/Passwort separat.
    const r = await pool.query(`INSERT INTO partners (name, email, phone, whatsapp, note, company, country, status, active, approved, approved_at) VALUES ($1,$2,$3,$3,$4,$5,$6,'active',true,$7,now()) RETURNING id`,
      [name, email || null, phone || null, note || null, company || null, country || null, JSON.stringify(approved || {})]);
    return { ok: true, id: Number(r.rows[0].id) };
  });

  // Status: approve (aktiv) · pause (keine neuen Aufträge) · reject · resume.
  app.post("/admin/partners/status", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const id = Number(b.id), action = String(b.action || "");
    const r = await pool.query(`SELECT * FROM partners WHERE id=$1`, [id]);
    const p = r.rows[0] as PRow | undefined;
    if (!p) return reply.code(404).send({ ok: false, error: "nicht gefunden" });
    if (action === "approve") {
      // Freigabe: Leistungen aus der Bewerbung übernehmen (Preisvorstellung oder Standardpreis), falls nicht schon festgelegt.
      let approved = p.approved && Object.keys(p.approved).length ? p.approved : null;
      if (b.approved && typeof b.approved === "object") {
        approved = {}; for (const [k, v] of Object.entries(b.approved as Record<string, unknown>)) if (isService(k) && Number(v) > 0) approved[k] = Math.round(Number(v) * 100) / 100;
      }
      if (!approved) { approved = {}; for (const s of p.services || []) if (isService(s.id)) approved[s.id] = s.price && s.price > 0 ? s.price : SERVICES.find((x) => x.id === s.id)!.price; }
      await pool.query(`UPDATE partners SET status='active', active=true, approved=$2, approved_at=now() WHERE id=$1`, [id, JSON.stringify(approved)]);
      if (p.status === "pending" && p.email) void mailPartner(p.email, "You're approved – welcome to RapidRemove", [
        `Hi ${p.name},`, "your partner account has been approved. 🎉",
        `Approved services: ${SERVICES.filter((s) => approved![s.id] != null).map((s) => `${s.en} – ${approved![s.id]} USD`).join("; ")}.`,
        "Open the partner app, set up your automatic payouts once (2 minutes) and you'll receive new tasks right away.",
      ], { href: `${SITE_URL}/partner`, label: "Open the partner app" });
    } else if (action === "pause") await pool.query(`UPDATE partners SET status='active', active=false WHERE id=$1`, [id]);
    else if (action === "resume") await pool.query(`UPDATE partners SET status='active', active=true WHERE id=$1`, [id]);
    else if (action === "reject") {
      await pool.query(`UPDATE partners SET status='rejected', active=false WHERE id=$1`, [id]);
      if (p.status === "pending" && p.email && b.notify !== false) void mailPartner(p.email, "Your RapidRemove partner application", [
        `Hi ${p.name},`, "thank you for your interest. Unfortunately we can't work with you at the moment. We'll keep your details and get in touch if this changes.",
      ]);
    } else return reply.code(400).send({ ok: false, error: "Aktion unbekannt" });
    // Zuteilungen auf nicht (mehr) aktive Partner bleiben gespeichert, greifen aber nicht (routeFor prüft Status).
    return { ok: true };
  });

  // Einladungslink (14 Tage gültig, einmalig): /partner?join#inv_…
  app.post("/admin/partners/invite", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const tok = "inv_" + crypto.randomBytes(18).toString("base64url");
    const svc = (Array.isArray(b.services) ? b.services : []).filter(isService);
    await pool.query(`INSERT INTO partner_invites (token_hash, name, email, services, note, expires_at) VALUES ($1,$2,$3,$4,$5, now() + interval '14 days')`,
      [sha(tok), clip(b.name, 120) || null, norm(b.email) || null, JSON.stringify(svc), clip(b.note, 300) || null]);
    return { ok: true, url: `${SITE_URL}/partner?join=1#${tok}` };
  });

  // Zuteilung: welcher Partner bekommt welche Leistung automatisch.
  app.post("/admin/partner/routes", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const set = (b.routes && typeof b.routes === "object" ? b.routes : {}) as Record<string, unknown>;
    for (const [k, v] of Object.entries(set)) {
      if (!isService(k)) continue;
      if (v === null || v === "" || v === 0) { await setSetting(`route_${k}`, ""); continue; }
      const id = Number(v);
      const r = await pool.query(`SELECT approved, status, active FROM partners WHERE id=$1`, [id]);
      const p = r.rows[0] as { approved: Record<string, number> | null; status: string; active: boolean } | undefined;
      if (!p || p.status !== "active" || !p.active) return reply.code(400).send({ ok: false, error: "Partner ist nicht aktiv" });
      if (!p.approved || p.approved[k] == null) return reply.code(400).send({ ok: false, error: "Partner ist für diese Leistung nicht freigegeben" });
      await setSetting(`route_${k}`, String(id));
    }
    // Alte Schalter mitführen (andere Stellen fragen sie noch ab): an, sobald eine Leistung der Kategorie zugeteilt ist.
    const rt = await getRoutes();
    await setSetting("auto_reviews", rt.std || rt.old || rt.sw ? "1" : "0");
    await setSetting("auto_profiles", rt.profile ? "1" : "0");
    return { ok: true, routes: rt };
  });
}
