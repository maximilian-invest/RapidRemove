/*
 * Stripe-Webhook → E-Mails (+ später sevDesk/SMS/Affiliate).
 * Logik 1:1 aus den make.com-Blueprints abgeleitet:
 *
 *   invoice.paid                  → Rechnungs-Mail mit PDF-Anhang + Rechnungslink
 *                                     (DE bei EUR, sonst EN); BCC an Trustpilot nur
 *                                     bei billing_reason = "manual" (Review-Einladung)
 *                                   + Upsell „Hinweis zum Schutzmodell", falls die
 *                                     Zahlung eine Einmal-Löschung ohne Abo war
 *                                     (keine Abo-Zeile & Betrag < 990)
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
import { sendMail, type MailAttachment } from "../mailer.js";
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
  opts: { bcc?: string[]; attachments?: MailAttachment[] } = {},
): Promise<void> {
  const t = TEMPLATES[key];
  if (!t) { log.error(`Webhook: unbekanntes Template "${key}"`); return; }
  if (!to) { log.warn(`Webhook: kein Empfänger für "${key}" – übersprungen`); return; }
  const props = { ...t.sample, lang, ...extra };
  const html = await render(React.createElement(t.component, props));
  await sendMail({ to, subject: t.subject(props), html, bcc: opts.bcc, attachments: opts.attachments });
  log.info(`Webhook: "${t.label}" (${lang}) an ${to} gesendet${opts.bcc?.length ? " (+BCC)" : ""}`);
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

/** Trustpilot-Einladungs-BCC (Review-Invite-Alias) – wie in den make.com-Mails. */
const TRUSTPILOT_BCC = "rapid-remove.com+371c063a01@invite.trustpilot.com";

/** Lädt eine Datei (z. B. das Rechnungs-PDF) als Buffer; wirft bei HTTP-Fehler. */
async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Rechnungs-/Zahlungsbestätigungs-Mail wie make.com (Module 32/34/49/50):
 *   – immer mit angehängtem Rechnungs-PDF ({number}.pdf) und dem
 *     hosted_invoice_url als Download-Link in der Mail,
 *   – BCC an Trustpilot NUR bei billing_reason = "manual" (Review-Einladung),
 *   – Sprache nach Rechnungswährung (EUR → de, sonst → en).
 * Das PDF wird best-effort geladen (make.com „Ignore" auf dem Datei-Download):
 *   schlägt der Download fehl, geht die Mail trotzdem – nur ohne Anhang.
 */
async function sendInvoiceMail(
  log: FastifyInstance["log"], obj: any, lang: Lang,
): Promise<void> {
  let attachments: MailAttachment[] | undefined;
  if (obj?.invoice_pdf) {
    try {
      const pdf = await fetchBuffer(obj.invoice_pdf);
      attachments = [{ filename: `${obj?.number || "Rechnung"}.pdf`, content: pdf, contentType: "application/pdf" }];
    } catch (e) {
      log.error(`Webhook: Rechnungs-PDF nicht ladbar (Mail ohne Anhang): ${(e as Error).message}`);
    }
  }
  const bcc = obj?.billing_reason === "manual" ? [TRUSTPILOT_BCC] : undefined;
  await sendTemplate(
    log, "zahlungsbestaetigung", lang, obj?.customer_email,
    { invoiceUrl: obj?.hosted_invoice_url || undefined },
    { bcc, attachments },
  );
}

/** make.com: Upsell nur bei Gesamtbetrag < 990,00 (in Minor Units → < 99000). */
const UPSELL_MAX_TOTAL = 99000;

/**
 * Upsell „Hinweis zum Schutzmodell" nach einer Einmalzahlung ohne Abo
 * (make.com „Payment Stripe to sevDesk", Module 43 DE / 44 EN).
 *   Bedingungen: keine Abo-Zeile in der Rechnung UND Gesamtbetrag < 99000.
 *   Sprache wie die Rechnung (EUR → de, sonst → en).
 * Hinweis: make.com wartete 300 s vor dem Versand; ein Webhook muss aber schnell
 *   antworten und es gibt (M1) keinen Scheduler – daher sofortiger Versand.
 * Fehler werden geschluckt (make.com-Module hatten „Ignore"), damit ein
 *   misslungener Upsell den Webhook nicht kippt und keine Stripe-Retries auslöst.
 */
async function maybeSendSchutzhinweis(
  log: FastifyInstance["log"], obj: any, lang: Lang,
): Promise<void> {
  const lines: any[] = obj?.lines?.data ?? [];
  const hasSubscription = !!obj?.subscription || lines.some((l) => !!l?.subscription);
  const total = Number(obj?.total);
  if (hasSubscription || !Number.isFinite(total) || total >= UPSELL_MAX_TOTAL) {
    log.info(`Webhook: Schutzhinweis übersprungen (Abo=${hasSubscription}, total=${obj?.total})`);
    return;
  }
  try {
    await sendTemplate(log, "schutzhinweis", lang, obj?.customer_email);
  } catch (e) {
    log.error(`Webhook: Schutzhinweis-Versand fehlgeschlagen (ignoriert): ${(e as Error).message}`);
  }
}

async function handleEvent(app: FastifyInstance, event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  switch (event?.type) {
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const lang: Lang = (obj.currency || "").toLowerCase() === "eur" ? "de" : "en";
      await sendInvoiceMail(app.log, obj, lang);
      await maybeSendSchutzhinweis(app.log, obj, lang);
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
