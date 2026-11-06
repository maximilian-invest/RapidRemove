/* Auto-Scan (Admin) für Bewertungen OHNE Partner-Aufgabe (06.11.2026 – Weiterleitung an den Partner ist abgedreht).
 * Nur Hilfen zum Laden/Prüfen – der Scan verrechnet NICHTS (Team prüft per Link und rechnet händisch ab). */
import crypto from "node:crypto";
import { pool } from "./db";
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
