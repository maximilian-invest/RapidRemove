/* Express-Löschung an/aus + Löschdauer Standard (Admin → Einstellungen → Express & Löschdauer).
   null = lädt noch (wie „an" behandelt, Server prüft beim Bestellen ohnehin). Dauer: Standardwerte, bis geladen. */
import React from "react";
import { setCurDur, curDur, normDur } from "@/lib/durations";
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
let memo = null; // { on, dur, ts }
let inflight = null;
async function fetchStatus() {
  if (memo && Date.now() - memo.ts < 30_000) return memo;
  if (!OPS) return { on: true, dur: curDur() };
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await fetch(OPS + "/express-status", { cache: "no-store" });
      const j = await r.json();
      const dur = j && j.dur ? setCurDur(j.dur) : curDur();
      memo = { on: !(j && j.on === false), dur, ts: Date.now() };
      return memo;
    } catch (e) { return { on: true, dur: curDur() }; }
    finally { inflight = null; }
  })();
  return inflight;
}
export async function fetchExpressOn() { return (await fetchStatus()).on; }
export function useExpressOn() {
  const [on, setOn] = React.useState(() => (memo ? memo.on : null));
  React.useEffect(() => { let alive = true; fetchStatus().then((s) => { if (alive) setOn(s.on); }); return () => { alive = false; }; }, []);
  return on;
}
/** Löschdauer je Preisstufe. initial = vom Server mitgegeben (verhindert Springen beim Laden). Re-rendert nach dem Laden. */
export function useDurations(initial) {
  if (initial) setCurDur(initial);
  const [dur, setDur] = React.useState(() => (initial ? normDur(initial) : curDur()));
  React.useEffect(() => { let alive = true; fetchStatus().then((s) => { if (alive) setDur(s.dur); }); return () => { alive = false; }; }, []);
  return dur;
}
