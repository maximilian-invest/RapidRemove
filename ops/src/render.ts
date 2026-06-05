/* Rendert ein Template als HTML-Datei zur Vorschau (ohne Versand).
   Aufruf:  npm run email:render -- [templateKey]   (Standard: auftragsbestaetigung) */
import { render } from "@react-email/render";
import * as React from "react";
import { writeFile, mkdir } from "node:fs/promises";
import { TEMPLATES } from "./emails/index";

const key = process.argv[2] || "auftragsbestaetigung";
const t = TEMPLATES[key];
if (!t) {
  console.error(`Unbekanntes Template "${key}". Verfügbar: ${Object.keys(TEMPLATES).join(", ")}`);
  process.exit(1);
}
const html = await render(React.createElement(t.component, t.sample));
await mkdir("out", { recursive: true });
await writeFile(`out/${key}.html`, html, "utf8");
console.log(`→ out/${key}.html`);
