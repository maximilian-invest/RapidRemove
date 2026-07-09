/* Zentrales Rendern von E-Mail-Templates MIT den im Admin gespeicherten Text-Overrides.
   Jede (dafür vorbereitete) Vorlage bekommt die Sprach-Overrides als `_overrides`-Prop und
   legt sie über ihre Default-Texte. Ohne DB / ohne gespeicherten Override rendert exakt wie
   zuvor – deshalb ist der Umstieg auf renderTemplate() an allen Sendewegen unkritisch.
   Liefert HTML UND den (ggf. überschriebenen) Betreff zurück. */
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./emails/index";
import { getTemplateOverrides } from "./db";

/** Nur String-Felder einer Sprach-Textmap sind editierbar (Funktionen wie greeting bleiben im Code). */
export function editableFields(texts: Record<string, Record<string, unknown>> | undefined, lang: string): string[] {
  const row = (texts && (texts[lang] || texts.en || texts.de)) || {};
  return Object.keys(row).filter((k) => typeof (row as Record<string, unknown>)[k] === "string");
}

export async function renderTemplate(key: string, props: Record<string, unknown>): Promise<{ html: string; subject: string }> {
  const t = TEMPLATES[key];
  if (!t) throw new Error(`Unbekanntes Template "${key}"`);
  const lang = String((props.lang as string) || "de");
  let _overrides: Record<string, string> | undefined;
  try {
    const all = await getTemplateOverrides(key);
    _overrides = all[lang];
  } catch { /* DB nicht verfügbar → Code-Defaults */ }
  const html = await render(React.createElement(t.component, { ...props, _overrides } as Record<string, unknown>));
  const subject = (_overrides && typeof _overrides.subject === "string" && _overrides.subject.trim())
    ? _overrides.subject
    : t.subject(props);
  return { html, subject };
}
