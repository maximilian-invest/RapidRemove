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
import { sendMail } from "./mailer";
import { dbReady, dueUpsellJobs, markUpsellSent, bumpUpsellAttempt } from "./db";

const TICK_MS = Number(process.env.UPSELL_TICK_MS) || 60_000;

async function runDue(log: FastifyInstance["log"]): Promise<void> {
  const jobs = await dueUpsellJobs(25);
  if (!jobs.length) return;
  const t = TEMPLATES["schutzhinweis"];
  for (const j of jobs) {
    const lang = j.lang === "en" ? "en" : "de";
    const variant = Math.min(3, Math.max(1, Number(j.step) || 1)) as 1 | 2 | 3;
    const props = { lang, variant };
    try {
      const html = await render(React.createElement(t.component, props));
      await sendMail({ to: j.email, subject: t.subject(props), html, replyTo: process.env.MAIL_REPLY_TO });
      await markUpsellSent(j.id);
      log.info(`Upsell: Schutzhinweis #${variant} (${lang}) an ${j.email} gesendet`);
    } catch (e) {
      await bumpUpsellAttempt(j.id);
      log.error(`Upsell: Versand an ${j.email} (#${variant}) fehlgeschlagen: ${(e as Error).message}`);
    }
  }
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
