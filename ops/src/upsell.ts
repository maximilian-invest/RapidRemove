/* Upsell-Worker: versendet die geplanten „Hinweis zum Schutzmodell"-Mails.
 *
 * Die Webhook-Logik plant pro Einmalzahlung ohne Abo 3 Mails ein (Tag 0/7/14,
 * siehe db.enqueueUpsellSeries). Dieser Worker läuft im selben Fastify-Prozess
 * und schickt fällige Mails los. Ohne DB ist er inaktiv – dann greift der
 * Sofortversand-Fallback im Webhook.
 */
import * as React from "react";
import { render } from "@react-email/render";
import type { FastifyInstance } from "fastify";
import { TEMPLATES } from "./emails/index";
import { sendMail, mailTrace } from "./mailer";
import { dbReady, dueUpsellJobs, markUpsellSent, bumpUpsellAttempt, insertEvent, latestOrder, cancelUpsellForEmail, enqueueUpsellSeries, pool } from "./db";
import { isTestEmail } from "./testAccounts";

const TICK_MS = Number(process.env.UPSELL_TICK_MS) || 60_000;

async function runDue(log: FastifyInstance["log"]): Promise<void> {
  const jobs = await dueUpsellJobs(25);
  if (!jobs.length) return;
  const t = TEMPLATES["schutzhinweis"];
  for (const j of jobs) {
    const lang = (["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"].includes(j.lang) ? j.lang : "en") as "de";
    const variant = Math.min(3, Math.max(1, Number(j.step) || 1)) as 1 | 2 | 3;
    const props = { lang, variant };
    // Nur Profil-Löschungen ohne Schutz: Bewertungs-/Reset-Kunden und wer inzwischen Schutz hat → Serie stoppen.
    const lo = await latestOrder(j.email).catch(() => null);
    const hasProt = pool ? ((await pool.query(`SELECT 1 FROM orders WHERE lower(email)=lower($1) AND COALESCE(protection,'none') NOT IN ('none','') AND COALESCE(status,'') <> 'storniert' LIMIT 1`, [j.email]).catch(() => ({ rowCount: 0 }))).rowCount || 0) > 0 : false;
    if (lo?.service === "reviews" || lo?.service === "reset" || hasProt) {
      const n = await cancelUpsellForEmail(j.email).catch(() => 0);
      log.info(`Upsell: Schutzhinweis für ${j.email} gestoppt (Bewertungs-Auftrag, ${n} Mail(s))`);
      continue;
    }
    try {
      const html = await render(React.createElement(t.component, props));
      const res = await sendMail({ to: j.email, subject: t.subject(props), html, replyTo: process.env.MAIL_REPLY_TO });
      await markUpsellSent(j.id);
      log.info(`Upsell: Schutzhinweis #${variant} (${lang}) an ${j.email} gesendet`);
      await insertEvent({
        email: j.email, type: "mail",
        title: `Hinweis zum Schutzmodell #${variant} gesendet`,
        detail: `an ${j.email} · ${mailTrace(res)}`,
      });
    } catch (e) {
      await bumpUpsellAttempt(j.id);
      log.error(`Upsell: Versand an ${j.email} (#${variant}) fehlgeschlagen: ${(e as Error).message}`);
      await insertEvent({
        email: j.email, type: "mail-error",
        title: `Hinweis zum Schutzmodell #${variant} fehlgeschlagen`,
        detail: String((e as Error).message).slice(0, 200),
      });
    }
  }
}

/** Schutz-Hinweis nach bezahlter PROFIL-LÖSCHUNG (Maximilian 08.10.2026): nur Profil-Löschung (remove/express, kein Reset,
 *  keine Bewertungen), ohne gebuchten Schutz; erste Mail 2 Tage nach der Zahlung, Folge-Mails nach 9 und 16 Tagen.
 *  Auslöser: Stripe-Zahlung (Webhook/Abgleich) oder Admin „bezahlt" (PayPal/Wise). Idempotent je Auftrag. */
export async function scheduleProtectionUpsell(orderId: string, log?: { info: (m: string) => void }): Promise<number> {
  if (!pool || !orderId) return 0;
  const r = await pool.query(`SELECT id, email, lang, service, protection, status FROM orders WHERE id=$1`, [orderId]).catch(() => ({ rows: [] as Record<string, string | null>[] }));
  const o = r.rows[0];
  if (!o || !o.email || isTestEmail(o.email)) return 0;
  if (!["remove", "express"].includes(String(o.service || ""))) return 0;
  if (String(o.protection || "none") !== "none" || o.status === "storniert") return 0;
  const n = await enqueueUpsellSeries({ email: String(o.email), lang: String(o.lang || "en").slice(0, 2), dedupKey: "order:" + o.id, offsetsDays: [2, 9, 16] });
  if (n) {
    log?.info(`Upsell: Schutzhinweis-Serie für ${o.id} eingeplant (Tag 2/9/16)`);
    await insertEvent({ orderId: String(o.id), email: String(o.email), type: "note", title: "Schutz-Hinweis eingeplant (in 2 Tagen)", detail: "Profil-Löschung bezahlt, kein Schutz gebucht · Folge-Mails nach 9 und 16 Tagen", auto: true }).catch(() => {});
  }
  return n;
}

/** Startet den periodischen Versand fälliger Upsell-Mails (no-op ohne DB). */
export function startUpsellWorker(app: FastifyInstance): void {
  if (!dbReady()) {
    app.log.info("Upsell-Worker: keine DB – Serie inaktiv (Sofortversand-Fallback im Webhook)");
    return;
  }
  let busy = false;
  const tick = async () => {
    if (busy) return;
    busy = true;
    try { await runDue(app.log); }
    catch (e) { app.log.error(`Upsell-Worker-Tick fehlgeschlagen: ${(e as Error).message}`); }
    finally { busy = false; }
  };
  const timer = setInterval(tick, TICK_MS);
  timer.unref?.();
  app.log.info(`Upsell-Worker aktiv (alle ${Math.round(TICK_MS / 1000)}s)`);
}
