/* Auto-Scan (Admin) für Bewertungen OHNE Partner-Aufgabe (06.11.2026 – Weiterleitung an den Partner ist abgedreht).
 * Doppelt bestätigt gelöscht → genau wie „Gelöschte abrechnen" im Admin (/admin/reviews/bill, orderAdd.ts):
 * als gelöscht vermerken (raw.reviewsRemovedAll) und von der hinterlegten Zahlungsart abbuchen. Kein Partner, keine Auszahlung.
 * Ohne hinterlegte Zahlungsart wird NICHTS vermerkt (das Team rechnet dann per Rechnung ab). */
import crypto from "node:crypto";
import { pool, insertEvent, setOrderRawField, bumpChange } from "./db";
import { autopayAvailable, hasSavedMethod, chargeDue } from "./autopay";
import { keyOf } from "./customers";

type Item = { url?: string; name?: string; text?: string; rating?: number; days?: number };

/** Stabile, negative Prüf-ID je Bewertung (removal_checks.task_id) – kollidiert nie mit echten Partner-Aufgaben. */
export function itemCheckId(orderId: string, key: string): number {
  const h = crypto.createHash("sha1").update(orderId + "|" + key).digest("hex").slice(0, 12);
  return -parseInt(h, 16);
}

/** Bewertung eines Auftrags laden (Index in raw.reviewItems) + ob dafür noch eine aktive Partner-Aufgabe existiert. */
export async function loadScanItem(orderId: string, idx: number): Promise<{ order: { id: string; email: string; status: string; service: string; raw: Record<string, unknown> }; it: Item; key: string; taskId: number | null } | null> {
  if (!pool || !orderId || !Number.isInteger(idx) || idx < 0) return null;
  const r = await pool.query(`SELECT id, email, status, service, raw FROM orders WHERE id=$1`, [orderId]);
  const o = r.rows[0] as { id: string; email: string; status: string; service: string; raw: Record<string, unknown> } | undefined;
  if (!o || o.service !== "reviews") return null;
  const items = (Array.isArray(o.raw?.reviewItems) ? o.raw.reviewItems : []) as Item[];
  const it = items[idx];
  if (!it) return null;
  const key = keyOf(it);
  const t = await pool.query(`SELECT id FROM partner_tasks WHERE order_id=$1 AND item_key=$2 AND status<>'cancelled' ORDER BY id DESC LIMIT 1`, [orderId, key]).catch(() => ({ rows: [] as { id: string }[] }));
  return { order: { ...o, raw: o.raw || {} }, it, key, taskId: t.rows[0] ? Number(t.rows[0].id) : null };
}

/** Als gelöscht vermerken + abbuchen (wie Admin „Gelöschte abrechnen" mit hinterlegter Zahlungsart). */
export async function markRemovedAndCharge(orderId: string, key: string, via: string): Promise<{ mode: "autopay" | "nopm" | "already" | "error"; error?: string }> {
  if (!pool) return { mode: "error", error: "db" };
  const r = await pool.query(`SELECT id, email, status, raw FROM orders WHERE id=$1 AND service='reviews'`, [orderId]);
  const o = r.rows[0] as { id: string; email: string; status: string; raw: Record<string, unknown> } | undefined;
  if (!o || o.status === "storniert") return { mode: "error", error: "Auftrag storniert oder nicht gefunden" };
  const raw = o.raw || {};
  const items = (Array.isArray(raw.reviewItems) ? raw.reviewItems : []) as Item[];
  const it = items.find((x) => keyOf(x) === key);
  if (!it) return { mode: "error", error: "Bewertung nicht gefunden" };
  const billed = new Set([...(Array.isArray(raw.reviewsRemovedAll) ? raw.reviewsRemovedAll : []), ...(Array.isArray(raw.reviewsRemoved) ? raw.reviewsRemoved : [])].map((x) => keyOf(x as Item)));
  const paid = new Set(Array.isArray(raw.reviewsPaidKeys) ? (raw.reviewsPaidKeys as string[]) : []);
  if (billed.has(key) || paid.has(key)) return { mode: "already" };
  const savedPm = autopayAvailable(o.email) ? await hasSavedMethod(o.email).catch(() => false) : false;
  if (!savedPm) return { mode: "nopm" };
  const prev = (Array.isArray(raw.reviewsRemovedAll) ? raw.reviewsRemovedAll : []) as Item[];
  await setOrderRawField(o.id, "reviewsRemovedAll", [...prev, it]);
  await insertEvent({ orderId: o.id, email: o.email, type: "status", title: `Bewertung als gelöscht vermerkt (${via})`, detail: (it.name || it.url || "Bewertung") + " · Abbuchung von der hinterlegten Zahlungsart" }).catch(() => {});
  bumpChange();
  await chargeDue(o.email, "Löschung (Auto-Scan)").catch(() => null);
  return { mode: "autopay" };
}
