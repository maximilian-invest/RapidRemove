"use client";
/* Screenshot der Bewertung (statt „no preview"). Wird per POST mit dem Partner-Token geladen. */
import React from "react";
import { OPS } from "./shared";

const cache = new Map(); // id → objectURL
export default function ReviewShot({ id, token, url }) {
  const [src, setSrc] = React.useState(cache.get(id) || "");
  React.useEffect(() => {
    if (!id || cache.has(id)) return;
    let off = false;
    fetch(OPS + "/partner/shot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, id }) })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => { if (!b || off) return; const u = URL.createObjectURL(b); cache.set(id, u); setSrc(u); })
      .catch(() => {});
    return () => { off = true; };
  }, [id, token]);
  if (!id) return null;
  const img = src
    ? <img src={src} alt="" style={{ display: "block", width: "100%", height: "auto", borderRadius: 16 }} />
    : <div style={{ height: 160, borderRadius: 16, background: "var(--g1, #f4f4f4)" }} />;
  return url ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "block", margin: "0 0 12px" }}>{img}</a> : <div style={{ margin: "0 0 12px" }}>{img}</div>;
}
