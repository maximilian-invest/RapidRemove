/* 404 für Pfade, die nicht vorab generiert wurden. Ersetzt `dynamicParams = false`:
   Mit je Sprache eigenem Root-Layout (<html lang>) gibt es keine globale
   app/not-found mehr — so landen unbekannte Pfade trotzdem auf der gebrandeten
   not-found-Seite ihres Bereichs (app/(de)/not-found bzw. app/[lang]/not-found). */
import { notFound } from "next/navigation";

const dec = (v) => { try { return decodeURIComponent(v); } catch { return v; } };

/** Bricht mit notFound() ab, wenn params keinem Eintrag aus generateStaticParams entspricht. */
export function requireKnownParams(list, params) {
  const p = params || {};
  const ok = (list || []).some((e) => Object.entries(e).every(([k, v]) => p[k] === v || dec(p[k]) === v));
  if (!ok) notFound();
}
