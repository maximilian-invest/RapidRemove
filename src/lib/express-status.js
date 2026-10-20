/* Express-Löschung an/aus (Admin → Einstellungen). null = lädt noch (wie „an" behandelt, Server prüft beim Bestellen ohnehin). */
import React from "react";
const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
let memo = null; // { on, ts }
export async function fetchExpressOn() {
  if (memo && Date.now() - memo.ts < 30_000) return memo.on;
  if (!OPS) return true;
  try {
    const r = await fetch(OPS + "/express-status", { cache: "no-store" });
    const j = await r.json();
    const on = j && j.on !== false;
    memo = { on, ts: Date.now() };
    return on;
  } catch (e) { return true; }
}
export function useExpressOn() {
  const [on, setOn] = React.useState(() => (memo ? memo.on : null));
  React.useEffect(() => { let alive = true; fetchExpressOn().then((v) => { if (alive) setOn(v); }); return () => { alive = false; }; }, []);
  return on;
}
