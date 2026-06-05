/* Vorschau-/Test-Server: zeigt alle Templates im Browser und kann
   Test-Mails per Link versenden. Auf Railway: Start-Command "npm start". */
import "dotenv/config";
import Fastify from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";
import stripeWebhook from "./webhooks/stripe";

const app = Fastify({ logger: true });
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// Stripe-Webhook (eigener Scope mit RAW-Body für die Signaturprüfung)
app.register(stripeWebhook);

app.get("/health", async () => ({ ok: true }));

// Übersicht aller Templates (nach Gruppe sortiert, im Markendesign)
app.get("/", async (_req, reply) => {
  const ORDER = ["Bestellung", "Mitwirkung", "Storno", "Schutz"];
  const groups = new Map<string, string[]>();
  for (const [k, t] of Object.entries(TEMPLATES)) {
    const row =
      `<li style="margin:0;padding:13px 0;border-bottom:1px solid #ece7e1;display:flex;` +
      `justify-content:space-between;align-items:center;gap:12px">` +
      `<a href="/preview/${k}" style="color:#1c1916;text-decoration:none;font-weight:600">${t.label}</a>` +
      `<span style="white-space:nowrap"><a href="/preview/${k}?lang=de" style="color:#ff8000;text-decoration:none;font-weight:700">DE</a>` +
      `<span style="color:#d6cfc7"> · </span>` +
      `<a href="/preview/${k}?lang=en" style="color:#ff8000;text-decoration:none;font-weight:700">EN</a></span></li>`;
    (groups.get(t.group) ?? groups.set(t.group, []).get(t.group)!).push(row);
  }
  const sections = ORDER.filter((g) => groups.has(g)).map((g) =>
    `<h2 style="font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#6b6259;` +
    `margin:28px 0 4px">${g}</h2><ul style="list-style:none;margin:0;padding:0">${groups.get(g)!.join("")}</ul>`,
  ).join("");
  const count = Object.keys(TEMPLATES).length;
  return reply.type("text/html").send(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>RapidRemove · E-Mail-Vorschau</title>` +
    `<div style="font-family:'Manrope',system-ui,sans-serif;max-width:680px;margin:0 auto;` +
    `padding:40px 20px;color:#2a2622;background:#f6f3f0;min-height:100vh">` +
    `<div style="background:#fff;border:1px solid #ece7e1;border-top:4px solid #ff8000;` +
    `border-radius:18px;padding:28px 32px">` +
    `<div style="font-size:21px;font-weight:800;letter-spacing:-.02em;color:#ff8000">RapidRemove</div>` +
    `<h1 style="margin:14px 0 4px;font-size:24px;letter-spacing:-.02em;color:#1c1916">E-Mail-Vorschau</h1>` +
    `<p style="color:#6b6259;margin:0;font-size:14px">${count} Templates · klick öffnet die fertige Mail. ` +
    `Test-Versand: <code style="background:#fff4e8;padding:1px 5px;border-radius:5px">` +
    `/send-test?key=…&amp;to=du@mail.de&amp;token=…</code></p>` +
    `${sections}</div></div>`);
});

// Einzelne Vorschau (HTML im Browser)
app.get("/preview/:key", async (req, reply) => {
  const { key } = req.params as { key: string };
  const { lang } = req.query as { lang?: string };
  const t = TEMPLATES[key];
  if (!t) return reply.code(404).type("text/html").send("Unbekanntes Template");
  const props = { ...t.sample, ...(lang ? { lang } : {}) };
  const html = await render(React.createElement(t.component, props));
  return reply.type("text/html").send(html);
});

// Test-Versand per Link (mit ADMIN_TOKEN geschützt)
app.get("/send-test", async (req, reply) => {
  const { key = "auftragsbestaetigung", to, token, lang } = req.query as Record<string, string>;
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return reply.code(401).send("unauthorized");
  const t = TEMPLATES[key];
  if (!t || !to) return reply.code(400).send("Parameter fehlen: key, to");
  const props = { ...t.sample, ...(lang ? { lang } : {}) };
  const html = await render(React.createElement(t.component, props));
  await sendMail({ to, subject: t.subject(props), html });
  return { sent: to, template: key };
});

const port = Number(process.env.PORT) || 3000;
app.listen({ host: "0.0.0.0", port })
  .then((addr) => app.log.info(`ops läuft auf ${addr}`))
  .catch((err) => { app.log.error(err); process.exit(1); });
