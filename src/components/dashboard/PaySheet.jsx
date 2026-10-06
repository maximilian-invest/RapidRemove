"use client";
/* Zahlung per Wise / PayPal (Kunde hat −10 % gewählt). Design: hell, zentrierter Betrag, Konto als „Karte"
   mit Glanz-Animation, 3 Schritte, Vertrauens-Leiste. Kopieren mit Häkchen-Feedback. */
import React from "react";
import useSwipeClose from "./useSwipeClose";
import { X, Copy, Check, ArrowUpRight, ShieldCheck, Mail, Sparkles, AlertCircle, Lock } from "lucide-react";

function useCountUp(target, run) {
  const [v, setV] = React.useState(target);
  React.useEffect(() => {
    if (!run) return;
    let raf; const t0 = performance.now(); const from = Math.round(target * 1.111);
    const tick = (t) => { const k = Math.min(1, (t - t0) / 700); const e = 1 - Math.pow(1 - k, 3); setV(Math.round(from + (target - from) * e)); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

export default function PaySheet({ open, onClose, T, via, amountNum, fmt, regular, rows, ppUrl, ppHandle, wiseRef, showToast }) {
  const [copied, setCopied] = React.useState("");
  const ref = React.useRef(null);
  useSwipeClose(ref, open, onClose);
  const shown = useCountUp(amountNum, open);
  React.useEffect(() => { if (!open) setCopied(""); }, [open]);
  React.useEffect(() => { if (!copied) return; const t = setTimeout(() => setCopied(""), 1600); return () => clearTimeout(t); }, [copied]);
  const copy = (key, v) => { try { navigator.clipboard.writeText(v); setCopied(key); showToast(T("wCopied")); } catch (e) { /* */ } };
  const isPP = via === "paypal";
  const val = (k) => (rows.find((r) => new RegExp(k, "i").test(r[0])) || [])[1] || "";
  const holder = val("inhaber|holder|empf|beneficiary|^name") || (rows[0] && rows[0][1]) || "";
  const iban = val("^iban") || val("kontonummer|account number|account no");
  const bic = val("bic|swift");
  const bank = val("bank");
  const all = rows.map(([k, v]) => (k ? `${k}: ${v}` : v)).join("\n");
  const save = fmt(Math.max(0, regular - amountNum));
  const CopyBtn = ({ k, v }) => (
    <button type="button" className={"pc-copy" + (copied === k ? " ok" : "")} onClick={(e) => { e.stopPropagation(); copy(k, v); }} aria-label={T("wCopy")}>
      {copied === k ? <Check /> : <Copy />}
    </button>
  );
  return (
    <>
      <div className={"bg" + (open ? " show" : "")} onClick={onClose} />
      <div ref={ref} className={"psheet" + (open ? " show" : "")} aria-hidden={!open} role="dialog" aria-label={isPP ? T("ppTitle") : T("wTitle")}>
        {open ? (
          <>
            <div className="grab" aria-hidden="true" />
            <div className="ps-top">
              <span className="ps-via">{isPP ? "PayPal" : "Wise"}</span>
              <button type="button" className="ps-x" onClick={onClose} aria-label={T("close")}><X /></button>
            </div>
            <div className="ps-head">
              <span className="ps-k">{T("toPay")}</span>
              <b className="ps-amt">{fmt(shown)}</b>
              <span className="ps-chip"><Sparkles />{isPP ? T("ppDisc") : T("wDisc")} · {T("wSave", { amount: save })}</span>
            </div>

            {/* Konto als Karte */}
            <div className={"pcard" + (isPP ? " pp" : "")}>
              <div className="pc-row1"><span className="pc-brand">RapidRemove</span><span className="pc-net">{isPP ? "PayPal.me" : "SEPA · Wise"}</span></div>
              {isPP ? (
                <>
                  <div className="pc-lbl">{T("wRecipient")}</div>
                  <div className="pc-big" onClick={() => copy("pp", `paypal.me/${ppHandle}`)}>paypal.me/{ppHandle}<CopyBtn k="pp" v={`paypal.me/${ppHandle}`} /></div>
                  <div className="pc-row3"><span><small>{T("wAmount")}</small>{fmt(amountNum)}</span><span><small>{T("ppRef")}</small>{wiseRef}<CopyBtn k="ref" v={wiseRef} /></span></div>
                </>
              ) : (
                <>
                  <div className="pc-lbl">{T("wRecipient")}</div>
                  <div className="pc-name" onClick={() => copy("h", holder)}>{holder}<CopyBtn k="h" v={holder} /></div>
                  {iban ? <div className="pc-big mono" onClick={() => copy("i", iban)}>{iban}<CopyBtn k="i" v={iban} /></div> : null}
                  <div className="pc-row3">
                    {bic ? <span onClick={() => copy("b", bic)}><small>BIC</small>{bic}<CopyBtn k="b" v={bic} /></span> : null}
                    {bank ? <span><small>Bank</small>{bank}</span> : null}
                  </div>
                </>
              )}
            </div>
            {!isPP ? <button type="button" className={"ps-all" + (copied === "all" ? " ok" : "")} onClick={() => copy("all", all)}>{copied === "all" ? <Check /> : <Copy />}{T("wCopyAll")}</button> : null}

            {/* Schritte */}
            <ol className="ps-steps">
              <li><i>1</i><span>{isPP ? T("ppStep1") : T("wStep1")}</span></li>
              <li className={isPP ? "warn" : ""}><i>2</i><span>{isPP ? T("ppStep2") : T("wStep2", { amount: fmt(amountNum) })}{isPP ? <small><AlertCircle />{T("ppFF")}</small> : null}</span></li>
              <li><i>3</i><span>{T("wStep3")}</span></li>
            </ol>

            <a className={"ps-cta" + (isPP ? " pp" : "")} href={isPP ? ppUrl : "https://wise.com/send"} target="_blank" rel="noopener noreferrer" data-track={isPP ? "PayPal öffnen" : "Wise öffnen"}>
              {isPP ? T("ppBtn", { amount: fmt(amountNum) }) : T("wOpen")}<ArrowUpRight />
            </a>

            <div className="ps-trust">
              <span><ShieldCheck />{T("tr1")}</span>
              <span><Mail />{T("tr2")}</span>
              {!isPP ? <span><Lock />{T("tr3")}</span> : null}
            </div>
            <p className="ps-legal">RapidRemove · Simple Solution OG · Salzgasse 2, 5400 Hallein, Österreich</p>
          </>
        ) : null}
      </div>
    </>
  );
}
