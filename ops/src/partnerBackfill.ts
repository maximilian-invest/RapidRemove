/* Nachtrag: Reputation Vault hat bereits 60 USD bekommen (6 Löschungen à 10 USD laut
 * WhatsApp-Chat 30.09.–04.10.2026, vor dem Partner-Board). Diese Aktion gleicht die
 * Chat-Links mit Board + Aufträgen ab (über die Google-Review-ID nach Auflösen der
 * Kurzlinks), legt fehlende Aufgaben als „gelöscht" an und bucht EINE Auszahlung über
 * die gewählten → beim Partner unter Orders „Completed" und Earnings „Paid out".
 * Vorschau (apply=false) ändert nichts. Einmalig (Sperre in partner_settings). */
import type { FastifyInstance } from "fastify";
import { pool, insertEvent } from "./db";

const DONE_KEY = "backfill_rv_60_usd";

/** Kandidaten aus dem Chat (Zeiten = Chat-Zeit Wien). `pre` = vorausgewählt (ergibt 6 × 10 = 60 USD). */
export const RV_CHAT_REMOVALS = [
  { ref: "c1", url: "https://maps.app.goo.gl/jaGm5tVBT9xLqQvz8", at: "2026-09-30T08:49:00+02:00", pre: true, why: "29.09. geschickt · 30.09. „this review has been removed“" },
  { ref: "c2", url: "https://share.google/hrRfpayI1HQvJMoTu", at: "2026-10-01T12:52:00+02:00", pre: true, why: "28.09. geschickt · 01.10. „another review is deleted“" },
  { ref: "c3", url: "https://google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT21SUVptNW9ZbUo2VVhSeFpVUjZTWEU1ZVU5blMzYxAB!2m1!1s0x0:0xf764061c2b995db8!3m1!1s2@1:CAIQACodChtycF9oOmRQZm5oYmJ6UXRxZUR6SXE5eU9nS3c%7C%7C", at: "2026-10-03T15:21:00+02:00", pre: true, why: "03.10. Partner schickt Link + „Removed“" },
  { ref: "c4", url: "https://maps.app.goo.gl/8jKfLaHaDdCqZULGA", at: "2026-10-04T16:42:00+02:00", pre: true, why: "01.10. geschickt · 04.10. „two more reviews removed“ (vermutlich)" },
  { ref: "c5", url: "https://share.google/uLBLoy9t5Q7uXquhn", at: "2026-10-04T16:42:00+02:00", pre: true, why: "01.10. geschickt · 04.10. „two more reviews removed“ (vermutlich)" },
  { ref: "c6", url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2pCeWQxSkRjRWRFVkZNeVgxQnBWV1kzTjNGV1VuYxAB!2m1!1s0x0:0xc2c120280991a83f!3m1!1s2@1:CAIQACodChtycF9oOjByd1JDcEdEVFMyX1BpVWY3N3FWUnc%7C%7C?hl=en-US", at: "2026-10-04T20:04:00+02:00", pre: true, why: "04.10. früh geschickt („today or tomorrow“) · 04.10. 20:04 „Removed“ (vermutlich)" },
  { ref: "c7", url: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChdDSUhNMG9nS0VJQ0FnSURsekt5ZWlRRRAB!2m1!1s0x0:0x3b95627f39914edf!3m1!1s2@1:CIHM0ogKEICAgIDlzKyeiQE%7C%7C?hl=de", at: "2026-10-04T20:04:00+02:00", pre: false, why: "30.09. in der Liste offener Aufträge · Ergebnis im Chat nicht eindeutig (Alternative zu c6)" },
] as const;

/** Google-Review-ID aus einer Maps-URL (…!2m5!1s<ID>!2m1…). */
export function reviewIdOf(url: string): string | null {
  const m = /!2m5!1s([A-Za-z0-9_-]{12,})/.exec(url || "") || /!1s(Ch[A-Za-z0-9_-]{12,})/.exec(url || "");
  return m ? m[1] : null;
}
const isShort = (u: string) => /^https?:\/\/(share\.google|maps\.app\.goo\.gl|goo\.gl)\//i.test(u || "");
async function resolveUrl(u: string): Promise<string> {
  if (!isShort(u)) return u;
  try {
    const r = await fetch(u, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(12000) });
    return r.url || u;
  } catch { return u; }
}

type TaskRow = { id: string; code: string; order_id: string | null; item_key: string | null; url: string | null; status: string; customer: string | null; price_usd: string; paid_at: string | null };

async function analyse() {
  if (!pool) throw new Error("keine Datenbank");
  const tasks = (await pool.query(`SELECT id, code, order_id, item_key, url, status, customer, price_usd, paid_at FROM partner_tasks`)).rows as TaskRow[];
  // Review-ID je Aufgabe (Kurzlinks einmal auflösen).
  const taskIds = new Map<string, TaskRow>();
  for (const t of tasks) {
    const src = t.url || t.item_key || "";
    const id = reviewIdOf(src) || (isShort(src) ? reviewIdOf(await resolveUrl(src)) : null);
    if (id) taskIds.set(id, t);
  }
  const out = [];
  for (const c of RV_CHAT_REMOVALS) {
    const full = await resolveUrl(c.url);
    const rid = reviewIdOf(full);
    const task = rid ? taskIds.get(rid) || null : null;
    let order: { id: string; business: string } | null = null;
    if (task?.order_id) {
      const o = await pool.query(`SELECT id, COALESCE(company, profile, '') AS b FROM orders WHERE id=$1`, [task.order_id]);
      if (o.rows[0]) order = { id: o.rows[0].id, business: o.rows[0].b };
    } else if (rid) {
      const o = await pool.query(`SELECT id, COALESCE(company, profile, '') AS b FROM orders WHERE raw::text LIKE $1 ORDER BY created_at DESC LIMIT 1`, ["%" + rid + "%"]);
      if (o.rows[0]) order = { id: o.rows[0].id, business: o.rows[0].b };
    }
    out.push({
      ref: c.ref, url: full, short: c.url !== full ? c.url : null, reviewId: rid, removedAt: c.at, why: c.why, preselected: c.pre,
      task: task ? { id: Number(task.id), code: task.code, status: task.status, price: Number(task.price_usd), paid: !!task.paid_at, customer: task.customer } : null,
      order,
    });
  }
  return out;
}

/** Eintragen: fehlende Aufgaben als gelöscht anlegen/setzen, eine Auszahlung buchen, Sperre setzen. */
async function applyBackfill(refs: string[], items: Awaited<ReturnType<typeof analyse>>) {
  if (!pool) throw new Error("keine Datenbank");
    const pick = items.filter((i) => refs.includes(i.ref));
  if (!pick.length) throw new Error("nichts gewählt");
  const ids: number[] = [];
  for (const i of pick) {
    if (i.task && i.task.paid) continue; // schon bezahlt → nicht doppelt
    if (i.task) {
      await pool.query(
        `UPDATE partner_tasks SET status='removed', removed_at=COALESCE(removed_at, $2::timestamptz), price_usd=10, touched_at=COALESCE(touched_at, now()), updated_at=now() WHERE id=$1`,
        [i.task.id, i.removedAt],
      );
      ids.push(i.task.id);
    } else {
      const key = i.url;
      const r = await pool.query(
        `INSERT INTO partner_tasks (order_id, item_key, url, kind, price_usd, status, customer, removed_at, touched_at, admin_note, created_at)
         VALUES ($1,$2,$3,'normal',10,'removed',$4,$5::timestamptz,$5::timestamptz,'Nachtrag aus WhatsApp-Chat (vor dem Board)',$5::timestamptz) RETURNING id`,
        [i.order?.id || null, key, i.url, i.order?.business || "WhatsApp (vor dem Board)", i.removedAt],
      );
      const id = r.rows[0].id;
      await pool.query(`UPDATE partner_tasks SET code = 'RV-' || lpad(id::text, 4, '0') WHERE id=$1 AND code IS NULL`, [id]);
      ids.push(Number(id));
    }
  }
  if (!ids.length) throw new Error("alle gewählten sind schon bezahlt");
  const sum = await pool.query(`SELECT COALESCE(sum(price_usd),0) AS s FROM partner_tasks WHERE id = ANY($1::bigint[])`, [ids]);
  const amount = Math.round(Number(sum.rows[0].s) * 100) / 100;
  const p = await pool.query(`INSERT INTO partner_payouts (amount_usd, tasks, note, created_at) VALUES ($1,$2,$3,'2026-10-05T12:00:00+02:00') RETURNING id`,
    [amount, ids.length, "Bereits bezahlt (WhatsApp, vor dem Board) – Nachtrag"]);
  await pool.query(`UPDATE partner_tasks SET paid_at='2026-10-05T12:00:00+02:00', payout_id=$1, updated_at=now() WHERE id = ANY($2::bigint[])`, [p.rows[0].id, ids]);
  await pool.query(`INSERT INTO partner_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value=$2`, [DONE_KEY, new Date().toISOString()]);
  for (const i of pick) if (i.order) await insertEvent({ orderId: i.order.id, type: "note", title: "Partner: Löschung nachgetragen + bezahlt", detail: `Aus WhatsApp-Chat · ${i.removedAt.slice(0, 10)} · 10 USD (Auszahlung #${p.rows[0].id})` }).catch(() => {});
  return { payoutId: Number(p.rows[0].id), amount, tasks: ids.length };
}

let lastRun: Record<string, unknown> | null = null;

/** Einmalig beim Start: die 6 Löschungen aus dem Chat (c1–c6, 6 × 10 USD = 60 USD) eintragen. */
export async function runRv60BackfillOnce(log: (m: string) => void): Promise<void> {
  if (!pool) return;
  const done = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [DONE_KEY]);
  if (done.rows[0]) return;
  const items = await analyse();
  // Board widerspricht (Aufgabe dort noch offen) → nicht nehmen; dann ggf. die Alternative (c7), solange sie nicht widerspricht.
  const contra = (i: (typeof items)[number]) => !!i.task && i.task.status !== "removed";
  let refs = items.filter((i) => i.preselected && !contra(i)).map((i) => i.ref);
  const alt = items.find((i) => !i.preselected && !contra(i));
  if (refs.length < 6 && alt) refs = [...refs, alt.ref];
  const r = await applyBackfill(refs, items);
  lastRun = { done: true, tasks: r.tasks, amount: r.amount, refs, skipped: items.filter((i) => !refs.includes(i.ref)).map((i) => i.ref), matched: items.filter((i) => i.task || i.order).map((i) => i.ref) };
  log(`Partner-Nachtrag 60 USD: ${r.tasks} Löschungen eingetragen, Auszahlung #${r.payoutId} über $${r.amount} · ` + items.filter((i) => i.preselected).map((i) => `${i.ref}:${i.task ? i.task.code : "neu"}${i.order ? "/" + i.order.id : ""}`).join(" "));
}

export function registerPartnerBackfill(app: FastifyInstance, adminToken: string): void {
  // Ergebnis des Einmal-Nachtrags (nur Zahlen/Kürzel, keine Kundendaten).
  app.get("/partner/backfill-status", async () => {
    if (lastRun) return { ok: true, ...lastRun };
    const d = pool ? await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [DONE_KEY]).catch(() => ({ rows: [] as { value: string }[] })) : { rows: [] };
    const p = pool ? await pool.query(`SELECT amount_usd, tasks FROM partner_payouts WHERE note LIKE 'Bereits bezahlt (WhatsApp%' ORDER BY id DESC LIMIT 1`).catch(() => ({ rows: [] as { amount_usd: string; tasks: number }[] })) : { rows: [] };
    return { ok: true, done: !!d.rows[0], amount: p.rows[0] ? Number(p.rows[0].amount_usd) : null, tasks: p.rows[0]?.tasks ?? null };
  });
  app.post("/admin/partner/backfill-rv60", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminToken || String(b.token || "") !== adminToken) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "keine Datenbank" });
    const done = await pool.query(`SELECT value FROM partner_settings WHERE key=$1`, [DONE_KEY]).catch(() => ({ rows: [] as { value: string }[] }));
    const items = await analyse();
    if (b.apply !== true) return { ok: true, done: done.rows[0]?.value || null, items };
    if (done.rows[0]) return reply.code(400).send({ ok: false, error: "Bereits eingetragen am " + done.rows[0].value });

    try {
      const refs = (Array.isArray(b.refs) ? b.refs : []).map(String);
      return { ok: true, ...(await applyBackfill(refs, items)) };
    } catch (e) { return reply.code(400).send({ ok: false, error: (e as Error).message }); }
  });
}
