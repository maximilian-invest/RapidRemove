/*
 * Stripe-Webhook → E-Mails (+ später sevDesk/SMS/Affiliate).
 * Logik 1:1 aus den make.com-Blueprints abgeleitet:
 *
 *   invoice.paid                  → Rechnung/Gutschein-Mail (DE bei EUR, sonst EN)
 *                                   [TODO M3: sevDesk-Beleg buchen]
 *   customer.subscription.created → „Schutz aktiviert“ (Sprache aus preferred_locales)
 *   customer.subscription.deleted → „Schutz deaktiviert“ – NUR wenn die Kündigung
 *                                   nicht vom Kunden gewünscht war (Zahlungsausfall)
 *   charge.refunded               → [TODO M3: sevDesk-Gutschrift]
 *
 * Signaturprüfung über STRIPE_WEBHOOK_SECRET gegen den RAW-Body.
 */
import type { FastifyInstance, FastifyRequest } from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "../emails/index.js";
import { sendMail } from "../mailer.js";
import {
  verifyStripeSignature, retrieveCustomer, hasSecretKey, langFromLocale,
} from "../integrations/stripe.js";

type Lang = "de" | "en";

async function sendTemplate(
  log: FastifyInstance["log"],
  key: string,
  lang: Lang,
  to: string | undefined | null,
  extra: Record<string, unknown> = {},
): Promise<void> {
  const t = TEMPLATES[key];
  if (!t) { log.error(`Webhook: unbekanntes Template "${key}"`); return; }
  if (!to) { log.warn(`Webhook: kein Empfänger für "${key}" – übersprungen`); return; }
  const props = { ...t.sample, lang, ...extra };
  const html = await render(React.createElement(t.component, props));
  await sendMail({ to, subject: t.subject(props), html });
  log.info(`Webhook: "${t.label}" (${lang}) an ${to} gesendet`);
}

/** Customer-E-Mail + Sprache nachladen (für Subscription-Events). */
async function customerLangAndEmail(
  log: FastifyInstance["log"],
  obj: any,
): Promise<{ to?: string; lang: Lang }> {
  // Falls das Event den Kunden schon eingebettet hat:
  if (obj?.customer && typeof obj.customer === "object") {
    return { to: obj.customer.email, lang: langFromLocale(obj.customer.preferred_locales?.[0]) };
  }
  const id = typeof obj?.customer === "string" ? obj.customer : undefined;
  if (id && hasSecretKey()) {
    try {
      const c = await retrieveCustomer(id);
      return { to: c.email ?? undefined, lang: langFromLocale(c.preferred_locales?.[0]) };
    } catch (e) {
      log.error(`Webhook: Customer ${id} nicht ladbar: ${(e as Error).message}`);
    }
  }
  return { to: obj?.customer_email ?? undefined, lang: "de" };
}

async function handleEvent(app: FastifyInstance, event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  switch (event?.type) {
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const lang: Lang = (obj.currency || "").toLowerCase() === "eur" ? "de" : "en";
      await sendTemplate(app.log, "zahlungsbestaetigung", lang, obj.customer_email);
      // TODO M3: sevDesk-Beleg (createContact → uploadVoucher → createVoucher)
      return;
    }
    case "customer.subscription.created": {
      const { to, lang } = await customerLangAndEmail(app.log, obj);
      await sendTemplate(app.log, "neues-abo", lang, to);
      return;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      // Nur bei unfreiwilliger Kündigung (Zahlungsausfall), nicht auf Kundenwunsch.
      const reason = obj?.cancellation_details?.reason;
      const canceledNow = event.type === "customer.subscription.deleted" ||
        obj?.status === "canceled" || obj?.cancel_at_period_end === true;
      if (!canceledNow || reason === "cancellation_requested") {
        app.log.info(`Webhook: ${event.type} ignoriert (reason=${reason}, status=${obj?.status})`);
        return;
      }
      const { to, lang } = await customerLangAndEmail(app.log, obj);
      await sendTemplate(app.log, "abo-deaktiviert", lang, to);
      return;
    }
    case "charge.refunded":
    case "refund.created":
      // TODO M3: sevDesk-Gutschrift buchen (Refund to sevDesk).
      app.log.info(`Webhook: ${event.type} erkannt – sevDesk-Gutschrift folgt (M3)`);
      return;
    default:
      app.log.info(`Webhook: ${event?.type} ohne Aktion`);
  }
}

export default async function stripeWebhook(app: FastifyInstance): Promise<void> {
  // RAW-Body NUR in diesem Plugin-Scope (für die Signaturprüfung nötig).
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
    done(null, body);
  });

  app.post("/webhooks/stripe", async (req: FastifyRequest, reply) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return reply.code(503).send("STRIPE_WEBHOOK_SECRET fehlt");

    const raw = req.body as Buffer; // dank Content-Type-Parser oben
    const sig = req.headers["stripe-signature"] as string | undefined;
    const v = verifyStripeSignature(raw, sig, secret);
    if (!v.ok) {
      req.log.warn(`Stripe-Webhook abgelehnt: ${v.reason}`);
      return reply.code(400).send(`ungültige Signatur: ${v.reason}`);
    }

    try {
      await handleEvent(app, v.event);
      return reply.code(200).send({ received: true, type: v.event.type });
    } catch (e) {
      req.log.error(`Stripe-Webhook-Verarbeitung fehlgeschlagen: ${(e as Error).message}`);
      return reply.code(500).send("Verarbeitungsfehler");
    }
  });
}
