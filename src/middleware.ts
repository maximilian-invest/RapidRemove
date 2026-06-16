/* Laufzeit-301/302-Weiterleitungen (im Admin-Portal pflegbar).
 *
 * Läuft nur im Node-/Server-Betrieb (Railway `next start`) – im statischen
 * GitHub-Pages-Export gibt es keine Middleware (Datei wird dort vorm Build
 * entfernt, siehe deploy-pages.yml). Die Regeln kommen aus dem ops-Backend
 * (/redirects.json) und werden im Speicher kurz gecacht, damit Admin-Änderungen
 * ohne Deploy greifen (≤ ~1 Min). Es wird ausschließlich auf exakte, vom Admin
 * angelegte Pfade umgeleitet – alles andere läuft unverändert weiter. */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const TTL_MS = 60_000;

type Rule = { destination: string; code: number };
let cache: { ts: number; rules: Map<string, Rule> } | null = null;
let inflight: Promise<void> | null = null;

function normalizePath(p: string): string {
  let s = String(p || "").split("#")[0].split("?")[0];
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s;
}

async function refresh(): Promise<void> {
  if (!OPS) return;
  try {
    const res = await fetch(OPS + "/redirects.json", { headers: { accept: "application/json" } });
    if (!res.ok) return;
    const arr = (await res.json()) as Array<{ source?: string; destination?: string; code?: number }>;
    const rules = new Map<string, Rule>();
    for (const r of Array.isArray(arr) ? arr : []) {
      if (!r || !r.source || !r.destination) continue;
      const code = [301, 302, 307, 308].includes(Number(r.code)) ? Number(r.code) : 301;
      rules.set(normalizePath(r.source), { destination: String(r.destination), code });
    }
    cache = { ts: Date.now(), rules };
  } catch {
    /* Backend nicht erreichbar → Seite läuft ohne Weiterleitungen weiter. */
  }
}

function kickRefresh(): Promise<void> {
  if (!inflight) inflight = refresh().finally(() => { inflight = null; });
  return inflight;
}

// Kritische Pfade NIE umleiten – schützt vor versehentlicher Selbst-Aussperrung,
// falls eine Regel mit so einer Quelle angelegt würde.
const PROTECTED = /^\/(admin|auftrag|api)(\/|$)/i;

export async function middleware(req: NextRequest) {
  if (!OPS) return NextResponse.next();
  if (PROTECTED.test(req.nextUrl.pathname)) return NextResponse.next();

  // Regeln laden: beim Kaltstart blockierend (eine Anfrage), danach nur noch
  // im Hintergrund auffrischen, wenn der Cache abgelaufen ist.
  if (!cache) await kickRefresh();
  else if (Date.now() - cache.ts > TTL_MS) kickRefresh();

  const rule = cache?.rules.get(normalizePath(req.nextUrl.pathname));
  if (!rule) return NextResponse.next();

  let dest = rule.destination;
  if (!/^https?:\/\//i.test(dest)) {
    if (!dest.startsWith("/")) dest = "/" + dest;
    dest = req.nextUrl.origin + dest;
  }
  // Query-String der Anfrage ans Ziel anhängen, sofern dort keiner gesetzt ist.
  const search = req.nextUrl.search;
  if (search && !dest.includes("?")) dest += search;

  return NextResponse.redirect(dest, rule.code);
}

export const config = {
  matcher: ["/((?!_next/|assets/|api/).*)"],
};
