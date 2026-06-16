/* 301-/302-Weiterleitungen werden ausschließlich im Admin-Portal
 * („Weiterleitungen") gepflegt und greifen zur Laufzeit über die Middleware
 * (Regeln aus dem ops-Backend, ohne Deploy).
 *
 * Es sind BEWUSST KEINE Weiterleitungen mehr fest im Code hinterlegt – diese
 * Liste ist leer. next.config.mjs (redirects()) und das Admin-Portal
 * importieren sie weiterhin; beide kommen mit der leeren Liste klar. */
export const BUILTIN_REDIRECTS = [];
