"use client";
/* Neues Admin — Herkunft eines Auftrags (wie „Quelle: …" im bisherigen Admin).
   `source` = Last-Touch (die Quelle, die zählt), `sourceFirst` = First-Touch als Zusatz,
   `utmContent` = Anzeigenmotiv. Alles kommt schon aus mapOrder (admin-api.js). */
import React from "react";
import { Compass } from "lucide-react";

const KIND_COLOR = {
  google_ads: "#1a73e8", ms_ads: "#0067b8", meta_ads: "#4456c7", tiktok_ads: "#111",
  affiliate: "var(--primary)", organic: "#15803d", referral: "#7c3aed", utm: "#b45309", direct: "var(--g3)",
};

export function SourceTag({ o }) {
  const s = o && o.source;
  if (!s) return null;
  const first = o.sourceFirst && o.sourceFirst.label !== s.label ? o.sourceFirst : null;
  const extra = [first ? "Erstkontakt: " + first.label : "", o.utmContent ? "Motiv: " + o.utmContent : "", o.affiliate && s.kind === "affiliate" ? "Ref: " + o.affiliate : ""].filter(Boolean).join(" · ");
  return (
    <div className="ir">
      <span className="ico"><Compass /></span>
      <span className="t"><span>Quelle</span>
        <b><span className="srcd" style={{ background: KIND_COLOR[s.kind] || KIND_COLOR.direct }} />{s.label}</b>
        {extra ? <span className="srcx">{extra}</span> : null}
      </span>
    </div>
  );
}
