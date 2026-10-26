/* Software-Tarif für Partner (18.10.2026, Vorgabe Maximilian):
 * Sobald ein Software-Fall freigegeben ist (Kunde stimmt zu / bezahlt, 250er „im Preis", oder schon als Software bestellt),
 * bekommt der Partner für diese Bewertung 150 USD gesamt (statt z. B. 10). Ab dem 11. Software-Fall derselben Woche
 * (Mo–So, Wien) nur noch 110 USD. Gilt nur für noch nicht ausbezahlte Aufgaben. Ein ausdrücklich im Admin festgelegter
 * Partner-Software-Preis des Kunden (sw_price_usd) hat Vorrang. Jede Aufgabe wird nur einmal gezählt (sw_at). */
import { pool, insertEvent } from "./db";

export const SW_TARIFF = { base: 150, reduced: 110, weeklyFull: 10 } as const;
const WEEK_START = `(date_trunc('week', now() AT TIME ZONE 'Europe/Vienna') AT TIME ZONE 'Europe/Vienna')`;

let chain: Promise<unknown> = Promise.resolve();

/** Tarif auf diese Aufgaben anwenden (der Reihe nach → der 11. Fall der Woche bekommt richtig 110). Gibt die gesetzten Preise zurück. */
export function applySwTariff(ids: (number | string)[]): Promise<{ id: number; code: string; price: number; n: number }[]> {
  const list = [...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  const run = async () => {
    const out: { id: number; code: string; price: number; n: number }[] = [];
    if (!pool || !list.length) return out;
    for (const id of list) {
      const t = (await pool.query(`SELECT id, code, order_id, partner_id, test, kind, sw_price_usd, paid_at, sw_at FROM partner_tasks WHERE id=$1`, [id]).catch(() => ({ rows: [] as Record<string, any>[] }))).rows[0];
      if (!t || t.sw_at || t.paid_at || t.kind === "profile") continue;
      const c = await pool.query(
        `SELECT count(*)::int AS n FROM partner_tasks WHERE sw_at >= ${WEEK_START} AND test = $2 AND id <> $3 AND withdrawn_at IS NULL AND ${t.partner_id ? "partner_id = $1" : "partner_id IS NULL AND $1::bigint IS NULL"}`,
        [t.partner_id, !!t.test, id],
      ).catch(() => ({ rows: [{ n: 0 }] }));
      const n = Number(c.rows[0]?.n || 0) + 1; // dieser Fall ist der n-te der Woche
      const fixed = Number(t.sw_price_usd) > 0 ? Number(t.sw_price_usd) : 0;
      const price = fixed || (n > SW_TARIFF.weeklyFull ? SW_TARIFF.reduced : SW_TARIFF.base);
      const u = await pool.query(`UPDATE partner_tasks SET price_usd=$2, sw_at=now() WHERE id=$1 AND sw_at IS NULL AND paid_at IS NULL RETURNING id`, [id, price]).catch(() => ({ rows: [] }));
      if (!u.rows.length) continue;
      out.push({ id, code: t.code, price, n });
      await insertEvent({ orderId: t.order_id || undefined, type: "note", title: `Partner: ${t.code} Software-Fall → ${price} USD`, detail: fixed ? "fester Partner-Software-Preis des Kunden" : `${n}. Software-Fall dieser Woche${n > SW_TARIFF.weeklyFull ? " (ab dem 11. nur 110 USD)" : ""}`, auto: true }).catch(() => {});
    }
    return out;
  };
  const p = chain.then(run, run);
  chain = p.catch(() => {});
  return p;
}
