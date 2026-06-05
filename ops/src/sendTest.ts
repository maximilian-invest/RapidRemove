/* Rendert die Auftragsbestätigung und sendet sie als echte Test-Mail über M365.
   Aufruf:  npm run email:test -- du@example.com
   (oder TEST_TO in .env setzen:  npm run email:test) */
import "dotenv/config";
import { render } from "@react-email/render";
import * as React from "react";
import Auftragsbestaetigung, { subject } from "./emails/Auftragsbestaetigung";
import { sendMail } from "./mailer";

const to = process.argv[2] || process.env.TEST_TO;
if (!to) {
  console.error("Empfänger fehlt.  Aufruf:  npm run email:test -- du@example.com");
  process.exit(1);
}

const html = await render(React.createElement(Auftragsbestaetigung, {}));
await sendMail({ to, subject: subject(), html });
console.log("✓ Auftragsbestätigung gesendet an", to);
