/* Rendert ein Template als HTML-Datei zur Vorschau (ohne Versand).
   Aufruf:  npm run email:render   →  out/auftragsbestaetigung.html */
import { render } from "@react-email/render";
import * as React from "react";
import { writeFile, mkdir } from "node:fs/promises";
import Auftragsbestaetigung from "./emails/Auftragsbestaetigung";

const html = await render(React.createElement(Auftragsbestaetigung, {}));
await mkdir("out", { recursive: true });
await writeFile("out/auftragsbestaetigung.html", html, "utf8");
console.log("→ out/auftragsbestaetigung.html");
