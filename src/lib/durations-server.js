/* Löschdauer für server-gerenderte Seiten (Landingpage Einzelbewertungen, JSON-LD, Ratgeber-Hinweis).
   Holt den Admin-Stand vom ops-Backend; Seiten werden höchstens alle 60 s neu erzeugt. Fehler → Standardwerte. */
import { normDur, DUR_DEFAULT } from "@/lib/durations";
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");

export async function getDurationsServer() {
  if (!OPS) return normDur(DUR_DEFAULT);
  try {
    const r = await fetch(OPS + "/express-status", { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    const j = await r.json();
    return normDur(j && j.dur);
  } catch (e) { return normDur(DUR_DEFAULT); }
}
