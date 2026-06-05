/* Rendert ein Template und sendet es als echte Test-Mail über M365.
   Aufruf:  npm run email:test -- du@example.com [templateKey]
   (Standard-Template: auftragsbestaetigung) */
import "dotenv/config";
import { render } from "@react-email/render";
import * as React from "react";
import { TEMPLATES } from "./emails/index";
import { sendMail } from "./mailer";

const to = process.argv[2] || process.env.TEST_TO;
const key = process.argv[3] || "auftragsbestaetigung";
if (!to) {
  console.error("Empfänger fehlt.  Aufruf:  npm run email:test -- du@example.com [templateKey]");
  process.exit(1);
}
const t = TEMPLATES[key];
if (!t) {
  console.error(`Unbekanntes Template "${key}". Verfügbar: ${Object.keys(TEMPLATES).join(", ")}`);
  process.exit(1);
}
const html = await render(React.createElement(t.component, t.sample));
await sendMail({ to, subject: t.subject(t.sample), html });
console.log(`✓ "${t.label}" gesendet an ${to}`);
