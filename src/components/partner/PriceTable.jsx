"use client";
/* Bulk-Bestellung: Preistabelle des Partners (15.10.2026). Fährt von unten hoch, Griff zum Wegwischen oder X.
   Zeigt alle Stufen „ab N Bewertungen → $ je gelöschter Bewertung" und markiert, in welche Stufe DIESE Bestellung fällt. */
import React from "react";
import { X, Check } from "lucide-react";
import useSwipeClose from "@/components/dashboard/useSwipeClose";

const usd = (v) => "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
const nf = (v) => Number(v).toLocaleString("en-US");

export default function PriceTable({ info, onClose }) {
  const ref = React.useRef(null);
  const open = !!info;
  useSwipeClose(ref, open, onClose);
  const [shown, setShown] = React.useState(null);
  React.useEffect(() => { if (info) setShown(info); }, [info]);
  React.useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  const d = info || shown;
  const tiers = (d && d.tiers) || [];
  const first = tiers.length ? tiers[0].from : null;
  return (
    <div className={"ptab" + (open ? " show" : "")} aria-hidden={!open}>
      <div className="bg" onClick={onClose} />
      <div className="ptab-sheet" ref={ref} role="dialog" aria-label="Price table">
        <div className="grab" aria-hidden="true" />
        <button type="button" className="ptab-x" aria-label="Close" onClick={onClose}><X /></button>
        {d ? (
          <>
            <h3>Price table</h3>
            <p className="ptab-sub">{d.label}</p>
            <div className="ptab-now">
              <span>This order</span>
              <b>{nf(d.n)} reviews · {d.price != null ? `${usd(d.price)} per removed review` : "your standard prices"}</b>
            </div>
            {tiers.length ? (
              <div className="ptab-list">
                {first > 1 ? <div className="ptab-row muted"><span>Fewer than {nf(first)} reviews</span><b>standard prices</b></div> : null}
                {tiers.map((t, i) => {
                  const nx = tiers[i + 1];
                  const on = i === d.idx;
                  return (
                    <div key={i} className={"ptab-row" + (on ? " on" : "")}>
                      <span>{on ? <Check /> : null}{nx ? `${nf(t.from)}–${nf(nx.from - 1)} reviews` : `${nf(t.from)}+ reviews`}</span>
                      <b>{usd(t.price)}</b>
                    </div>
                  );
                })}
                {d.sw ? <div className="ptab-row sw"><span>Special cases (software)</span><b>{usd(d.sw)}</b></div> : null}
              </div>
            ) : (
              <p className="ptab-note">No bulk price table for this order – your standard prices per review apply (shown on each review).</p>
            )}
            <p className="ptab-note">You're paid per removed review. If reviews are cancelled from the order (e.g. software cases), the tier can change – you'll see it here.</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
