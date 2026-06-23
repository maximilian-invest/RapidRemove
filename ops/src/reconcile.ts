/*
 * Zahlungs-Abgleich: gleicht bezahlte EINMAL-Zahlungen (Löschung/Reset/Express)
 * aus Stripe mit den Bestellungen ab und markiert Treffer als „bezahlt".
 *
 *  - Quelle = dieselben Stripe-Rechnungen wie unter „Abos & Umsatz".
 *  - Abos (wiederkehrende Positionen / Verlängerungen) werden ausgenommen.
 *  - Zuordnung per E-Mail ODER Name/Firma (z. B. „Michelle Buffin",
 *    „Vimagos Digital Solutions GmbH").
 *
 * Wird genutzt von:
 *   1) POST /admin/reconcile-payments  (Button „Zahlungen zuordnen")
 *   2) periodischer Worker (alle 10 Min) → neue Zahlungen automatisch zuordnen
 */
import type { FastifyInstance } from "fastify";
import { hasSecretKey, listDeletionPayments } from "./integrations/stripe";
import { dbReady, reconcileOrderForPayment, insertEvent } from "./db";
import { notifyPaymentReceived } from "./notify";

export interface ReconcileReport {
  ok: true;
  scanned: number;
  matched: { name: string; orderId: string }[];
  alreadyAssigned: number;
  unmatched: string[];
}

/** Einmal abgleichen. Best effort – einzelne Fehler kippen den Lauf nicht. */
export async function reconcilePaymentsOnce(log?: FastifyInstance["log"]): Promise<ReconcileReport> {
  const empty: ReconcileReport = { ok: true, scanned: 0, matched: [], alreadyAssigned: 0, unmatched: [] };
  if (!hasSecretKey() || !dbReady()) return empty;
  const pays = await listDeletionPayments();
  const matched: { name: string; orderId: string }[] = [];
  const unmatched: string[] = [];
  let alreadyAssigned = 0;
  for (const p of pays) {
    const label = p.name || p.email || p.id;
    try {
      const r = await reconcileOrderForPayment(p.email, p.name);
      if (r.status === "marked") {
        matched.push({ name: label, orderId: r.id! });
        await insertEvent({ orderId: r.id, type: "pay", title: "Zahlung eingegangen", detail: `Stripe-Abgleich: ${label}${p.amount ? ` · ${p.amount} ${p.cur}` : ""}`, auto: true });
        // 💰 Team-Push „Zahlung eingegangen" für neu zugeordnete Zahlungen.
        await notifyPaymentReceived({ who: label, amount: p.amount, cur: p.cur, orderId: r.id }).catch(() => {});
      } else if (r.status === "already") {
        alreadyAssigned++;
      } else {
        unmatched.push(label);
      }
    } catch (e) { log?.error?.(`Reconcile: ${p.id} fehlgeschlagen: ${(e as Error).message}`); }
  }
  if (matched.length) log?.info?.(`Reconcile: ${matched.length} Zahlung(en) zugeordnet (${pays.length} geprüft)`);
  return { ok: true, scanned: pays.length, matched, alreadyAssigned, unmatched };
}

/** Periodischer Abgleich (Standard: alle 10 Min) – neue Zahlungen automatisch zuordnen. */
export function startPaymentReconciler(app: FastifyInstance, everyMs = 10 * 60 * 1000): void {
  if (!hasSecretKey()) { app.log.info("Reconciler: kein STRIPE_SECRET_KEY – Auto-Zuordnung inaktiv"); return; }
  const tick = () => reconcilePaymentsOnce(app.log).catch((e) => app.log.error({ err: e }, "Reconcile-Tick fehlgeschlagen"));
  setTimeout(tick, 20_000);     // kurz nach Start
  setInterval(tick, everyMs);   // dann regelmäßig
  app.log.info(`Reconciler aktiv: Zahlungs-Abgleich alle ${Math.round(everyMs / 60000)} Min`);
}
