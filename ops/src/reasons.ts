/* Gründe je Bewertung (10/2026, mit Maximilian abgestimmt).
 *
 * Bei jedem Bewertungs-Auftrag (Website, Chat, Admin, Nachbestellung) gibt der Kunde im Dashboard für JEDE Bewertung an,
 * warum sie gegen die Google-Richtlinien verstößt (ein Tipp je Bewertung, „Anderer Grund" mit kurzem Text), und bestätigt
 * die Angaben inkl. Freistellung (AGB 3.4). Erst dann geht die Bewertung aufs Partner-Board.
 *
 *   raw.reasons = { status: "pending", at, keys? }   → wartet (keys = nur diese Bewertungen, sonst der ganze Auftrag)
 *   raw.reasons = { status: "ok", at, by, … }          → erledigt; Nachweis (Zeit, IP, Gerät, Sprache, Textversion) in raw.reasonsLog
 *   reviewItems[i].reason / reasonNote / reasonAt      → der Grund je Bewertung (Admin + Partner-Info)
 *
 * Reihenfolge im Dashboard: 1) Gründe, 2) Inhaber-Nachweis (nur 4–5 ★), 3) Zahlungsart. Der Server startet, sobald nichts mehr
 * fehlt (orderStart.ts). Admin kann den Schritt überspringen (z. B. Gründe per Mail erhalten) oder bei alten Aufträgen anfordern. */
import type { FastifyInstance } from "fastify";
import { pool, setOrderRawField, insertEvent } from "./db";
import { customerSessionInfo, keyOf } from "./customers";
import { startOrderIfReady } from "./orderStart";
import { notifyTeam } from "./notify";
import { isTestEmail } from "./testAccounts";

export const REASON_CODES = ["fake", "conflict", "false", "insult", "offtopic", "hate", "personal", "offensive", "impersonation", "other"] as const;
export type ReasonCode = typeof REASON_CODES[number];
/** Deutsche Bezeichnung (Admin, Ereignisse). */
export const REASON_DE: Record<ReasonCode, string> = {
  fake: "Kein echter Kunde / Fake", conflict: "Mitbewerber oder (Ex-)Mitarbeiter", false: "Falsche Behauptungen", insult: "Beleidigung / Belästigung",
  offtopic: "Themenfremd", hate: "Hassrede / Diskriminierung", personal: "Persönliche Daten anderer", offensive: "Anstößig / illegal",
  impersonation: "Identitätsbetrug", other: "Anderer Grund",
};
export const POLICY_V_DEFAULT = "2026-10-09b";

type Gate = { status?: string; at?: string; keys?: string[]; by?: string } | null | undefined;
type Item = { url?: string; name?: string; text?: string; rating?: number; reason?: string; reasonNote?: string; reasonAt?: string } & Record<string, unknown>;
type OrderRow = { id: string; email: string; name: string | null; lang: string | null; status: string | null; service: string | null; profile: string | null; company: string | null; raw: Record<string, unknown> | null };
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

/** Gate für einen NEUEN Auftrag (ganzer Auftrag wartet). */
export const reasonsGateNew = () => ({ status: "pending", at: new Date().toISOString() });

/** Gate für eine Nachbestellung: nur die neuen Bewertungen warten (läuft der ganze Auftrag noch nicht, bleibt er ganz). */
export function reasonsGateAdd(raw: Record<string, unknown>, newKeys: string[]): Record<string, unknown> {
  const g = raw.reasons as Gate;
  if (g && g.status === "pending" && !Array.isArray(g.keys)) return { ...g }; // ganzer Auftrag wartet noch → bleibt
  const prev = g && g.status === "pending" && Array.isArray(g.keys) ? g.keys : [];
  return { status: "pending", at: new Date().toISOString(), keys: [...new Set([...prev, ...newKeys])] };
}

/** Welche Bewertungen warten auf einen Grund? (null = keine) */
export function reasonsPendingKeys(raw: Record<string, unknown> | null | undefined): string[] | null {
  const g = raw?.reasons as Gate;
  if (!g || g.status !== "pending") return null;
  const items = (Array.isArray(raw?.reviewItems) ? raw!.reviewItems : []) as Item[];
  const all = items.map((it) => keyOf(it));
  return Array.isArray(g.keys) ? g.keys.filter((k) => all.includes(k)) : all;
}

async function loadOrder(orderId: string): Promise<OrderRow | null> {
  if (!pool) return null;
  const r = await pool.query(`SELECT id, email, name, lang, status, service, profile, company, raw FROM orders WHERE id=$1`, [orderId]);
  return (r.rows[0] as OrderRow) || null;
}

export function registerReasonsRoutes(app: FastifyInstance, adminToken: string): void {
  const isAdmin = (b: Record<string, unknown>) => !!adminToken && String(b.token || "") === adminToken;

  // Kunde: Gründe je Bewertung + Bestätigung (Checkbox) → speichern, Nachweis festhalten, Auftrag starten (falls sonst nichts fehlt).
  app.post("/cust/reasons", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    const s = await customerSessionInfo(b.token);
    if (!s) return reply.code(401).send({ ok: false, error: "session" });
    if (s.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const o = await loadOrder(clip(b.orderId, 40));
    if (!o || String(o.email || "").toLowerCase() !== s.email.toLowerCase() || o.service !== "reviews") return reply.code(404).send({ ok: false, error: "order" });
    if (o.status === "storniert") return reply.code(409).send({ ok: false, error: "cancelled" });
    const raw = (o.raw || {}) as Record<string, unknown>;
    const pending = reasonsPendingKeys(raw);
    if (!pending) return { ok: true, done: true }; // schon erledigt (z. B. zweiter Tab)
    if (b.policyConsent !== true) return reply.code(400).send({ ok: false, error: "consent" });
    const inList = (Array.isArray(b.reasons) ? b.reasons : []).slice(0, 80) as Record<string, unknown>[];
    const given = new Map<string, { r: ReasonCode; note: string }>();
    for (const x of inList) {
      const k = clip(x.key, 600), r = String(x.r || "") as ReasonCode, note = clip(x.note, 300);
      if (!k || !REASON_CODES.includes(r)) continue;
      if (r === "other" && note.length < 3) continue;
      given.set(k, { r, note });
    }
    const missing = pending.filter((k) => !given.has(k));
    if (missing.length) return reply.code(400).send({ ok: false, error: "missing", keys: missing });
    const at = new Date().toISOString();
    const items = ((Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as Item[]).map((it) => {
      const g = given.get(keyOf(it));
      if (!g || !pending.includes(keyOf(it))) return it;
      const out: Item = { ...it, reason: g.r, reasonAt: at };
      if (g.note) out.reasonNote = g.note; else delete out.reasonNote;
      return out;
    });
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim().slice(0, 60);
    const proof = { at, ip, ua: clip(req.headers["user-agent"], 240), lang: clip(b.lang, 5), v: clip(b.policyV, 20) || POLICY_V_DEFAULT, n: pending.length, via: "dashboard" };
    await setOrderRawField(o.id, "reviewItems", items);
    await setOrderRawField(o.id, "reasons", { status: "ok", at, by: "customer", n: pending.length });
    const log = Array.isArray(raw.reasonsLog) ? (raw.reasonsLog as unknown[]) : [];
    await setOrderRawField(o.id, "reasonsLog", [...log, { ...proof, keys: pending }].slice(-30));
    // Im Admin angelegt (keine Checkbox im Bestellprozess) → diese Bestätigung ist die Zusicherung des Kunden.
    if (!raw.policyConsent) await setOrderRawField(o.id, "policyConsent", proof);
    const named = items.filter((it) => pending.includes(keyOf(it)));
    await insertEvent({
      orderId: o.id, email: s.email, type: "note", title: `Gründe je Bewertung angegeben (${pending.length}) + Zusicherung bestätigt`,
      detail: named.map((it) => `${it.name || it.url || "Bewertung"}: ${REASON_DE[it.reason as ReasonCode] || it.reason}${it.reasonNote ? ` („${it.reasonNote}")` : ""}`).join(" · ").slice(0, 1500),
      auto: true,
    }).catch(() => {});
    const started = await startOrderIfReady(o.id).catch((e) => { app.log.error({ err: e, orderId: o.id }, "Start nach Gründen fehlgeschlagen"); return 0; });
    if (started) void notifyTeam(`${isTestEmail(s.email) ? "TEST · " : ""}Gründe angegeben · ${o.profile || o.company || o.name || o.id}`, `${pending.length} Bewertung(en) · ${started} jetzt aufs Partner-Board`, undefined, { kind: "order" }).catch(() => {});
    return { ok: true, started };
  });

  // Admin: Schritt überspringen (Gründe liegen anders vor) bzw. bei einem bestehenden Auftrag nachträglich anfordern.
  app.post("/admin/reasons-set", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!isAdmin(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const o = await loadOrder(clip(b.orderId, 40));
    if (!o || o.service !== "reviews") return reply.code(404).send({ ok: false, error: "Auftrag nicht gefunden" });
    const raw = (o.raw || {}) as Record<string, unknown>;
    if (b.action === "skip") {
      await setOrderRawField(o.id, "reasons", { status: "ok", at: new Date().toISOString(), by: "admin" });
      await insertEvent({ orderId: o.id, type: "note", title: "Gründe-Schritt übersprungen (Admin)", detail: clip(b.note, 300) || "Kunde muss im Dashboard keine Gründe mehr angeben" }).catch(() => {});
      const started = await startOrderIfReady(o.id).catch(() => 0);
      return { ok: true, status: "ok", started };
    }
    if (b.action === "request") {
      // Bewertungen ohne Grund, die noch nicht auf dem Partner-Board sind, warten ab jetzt; laufende laufen weiter.
      const items = (Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as Item[];
      const keys = items.filter((it) => !it.reason).map((it) => keyOf(it));
      if (!keys.length) return reply.code(400).send({ ok: false, error: "Alle Bewertungen haben schon einen Grund" });
      await setOrderRawField(o.id, "reasons", { status: "pending", at: new Date().toISOString(), keys, by: "admin" });
      await insertEvent({ orderId: o.id, type: "note", title: `Gründe beim Kunden angefordert (${keys.length} Bewertung(en))`, detail: "Kunde gibt sie im Dashboard an; noch nicht gestartete Bewertungen warten so lange", auto: true }).catch(() => {});
      return { ok: true, status: "pending", n: keys.length };
    }
    return reply.code(400).send({ ok: false, error: "action" });
  });
}
