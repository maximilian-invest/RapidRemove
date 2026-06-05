/* Vorschau-/Test-Server: zeigt alle Templates im Browser und kann
   Test-Mails per Link versenden. Auf Railway: Start-Command "npm start". */
import "dotenv/config";
import Fastify from "fastify";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";

const app = Fastify({ logger: true });
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

app.get("/health", async () => ({ ok: true }));

// Übersicht aller Templates
app.get("/", async (_req, reply) => {
  const items = Object.entries(TEMPLATES)
    .map(([k, t]) =>
      `<li style="margin:8px 0"><a href="/preview/${k}">${t.label}</a> ` +
      `&nbsp;<small><a href="/preview/${k}?lang=de">de</a> · <a href="/preview/${k}?lang=en">en</a></small></li>`)
    .join("");
  return reply.type("text/html").send(
    `<!doctype html><meta charset="utf-8"><title>RapidRemove Ops</title>` +
    `<div style="font-family:system-ui;max-width:680px;margin:40px auto;padding:0 20px">` +
    `<h1>RapidRemove · E-Mail-Vorschau</h1>` +
    `<p style="color:#666">Klick auf ein Template zeigt die fertige Mail. Test-Versand: ` +
    `<code>/send-test?key=…&amp;to=du@mail.de&amp;token=…</code></p>` +
    `<ul style="font-size:18px">${items}</ul></div>`);
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
