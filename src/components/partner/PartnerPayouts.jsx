"use client";
/* Partner App · Earnings → automatische Auszahlung (Payoneer) + Gutschriften.
   1) Auszahlungsdaten + Gutschrift-Vereinbarung  2) Payoneer-Konto verbinden  3) läuft automatisch.
   Jede Auszahlung hat eine Gutschrift (Self-billing invoice) als PDF. */
import React from "react";
import { Loader, Check, ChevronRight, FileText, Zap, Link as LinkIcon, Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { OPS, call, usd } from "./shared";

const COUNTRIES = [["PK", "Pakistan"], ["IN", "India"], ["BD", "Bangladesh"], ["LK", "Sri Lanka"], ["NP", "Nepal"], ["PH", "Philippines"], ["AE", "United Arab Emirates"], ["EG", "Egypt"], ["NG", "Nigeria"], ["KE", "Kenya"], ["ID", "Indonesia"], ["VN", "Vietnam"], ["TR", "Turkey"], ["GB", "United Kingdom"], ["US", "United States"]];
const dt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

/** Auszahlungsdaten laden (Earnings-Tab). */
export function usePayouts(token) {
  const [d, setD] = React.useState(null);
  const load = React.useCallback(() => (token ? call("payouts", { t: token }).then(setD).catch((e) => setD({ ok: false, error: e.message })) : Promise.resolve()), [token]);
  React.useEffect(() => { load(); }, [load]);
  return [d, load, setD];
}

async function openPdf(token, id, showToast) {
  // Fenster sofort öffnen (Popup-Blocker), dann PDF hineinladen.
  const w = typeof window !== "undefined" ? window.open("", "_blank") : null;
  try {
    const res = await fetch(OPS + "/partner/payouts/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, id }) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const url = URL.createObjectURL(await res.blob());
    if (w) w.location.href = url; else window.location.href = url;
  } catch (e) { if (w) w.close(); showToast("Could not open the PDF: " + e.message); }
}

function Form({ d, token, onDone, onBack, showToast }) {
  const p = d.profile || {};
  const [f, setF] = React.useState({ legalName: p.legalName || "", addr1: p.addr1 || "", addr2: p.addr2 || "", city: p.city || "", zip: p.zip || "", country: p.country || "PK", taxId: p.taxId || "", payoutEmail: p.payoutEmail || "" });
  const needAgree = !p.sb || p.sb.v !== d.sbVersion;
  const [agree, setAgree] = React.useState(!needAgree);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const ok = f.legalName.trim() && f.addr1.trim() && f.city.trim() && f.country && agree;
  const save = async (e) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true); setErr("");
    try { await call("payouts/profile", { t: token, ...f, agree: needAgree ? agree : undefined }); showToast("Payout details saved"); onDone(); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return (
    <form className="po-form" onSubmit={save}>
      <div className="po-back"><button type="button" className="circ" aria-label="Back" onClick={onBack}><ArrowLeft /></button></div>
      <div className="ttl" style={{ paddingTop: 4 }}>Payout details</div>
      <p className="ps">Used for your payouts and for the self-billing invoice (Gutschrift) we create for every payout. Use the same name as on your Payoneer account.</p>
      <label className="po-f"><span>Full legal name or company name</span><input value={f.legalName} onChange={set("legalName")} autoComplete="name" required /></label>
      <label className="po-f"><span>Address</span><input value={f.addr1} onChange={set("addr1")} autoComplete="address-line1" placeholder="Street and number" required /></label>
      <label className="po-f"><span>Address line 2 (optional)</span><input value={f.addr2} onChange={set("addr2")} autoComplete="address-line2" /></label>
      <div className="po-2">
        <label className="po-f"><span>City</span><input value={f.city} onChange={set("city")} autoComplete="address-level2" required /></label>
        <label className="po-f"><span>Postal code</span><input value={f.zip} onChange={set("zip")} autoComplete="postal-code" /></label>
      </div>
      <label className="po-f"><span>Country</span><select value={f.country} onChange={set("country")}>{COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
      <label className="po-f"><span>Tax number (optional · e.g. NTN, PAN)</span><input value={f.taxId} onChange={set("taxId")} /></label>
      <label className="po-f"><span>Email of your Payoneer account</span><input type="email" value={f.payoutEmail} onChange={set("payoutEmail")} autoComplete="email" inputMode="email" /></label>
      {needAgree ? (
        <button type="button" className={"po-agree" + (agree ? " on" : "")} onClick={() => setAgree((a) => !a)} aria-pressed={agree}>
          <span className="bx">{agree ? <Check /> : null}</span><span>{d.sbText}</span>
        </button>
      ) : <p className="po-sbok"><Check />Self-billing agreement accepted on {dt(p.sb.at)}</p>}
      {err ? <div className="po-err"><AlertCircle />{err}</div> : null}
      <button className="cta" disabled={!ok || busy} style={{ marginTop: 16 }}>{busy ? <Loader className="spin" /> : <Check />}Save</button>
    </form>
  );
}

/** Karte „Automatic payouts" + Liste der Auszahlungen mit Gutschrift. `editing` steuert der Earnings-Tab (eigener Screen). */
export default function PartnerPayouts({ d, reload, token, showToast, editing, setEditing }) {
  const [busy, setBusy] = React.useState(false);
  if (!d) return <div className="po-card"><Loader className="spin" /> Loading payouts …</div>;
  if (d.ok === false) return <div className="po-card"><AlertCircle />{d.error || "Could not load payouts"}</div>;
  if (editing) return <Form d={d} token={token} showToast={showToast} onBack={() => setEditing(false)} onDone={() => { setEditing(false); reload(); }} />;
  const p = d.profile;
  const step = d.preview ? "preview" : !p || !p.complete || !p.sb ? "details" : !p.ready ? "connect" : "on";
  const connect = async () => {
    setBusy(true);
    try { const j = await call("payouts/connect", { t: token }); window.location.href = j.url; }
    catch (e) { showToast(e.message); setBusy(false); }
  };
  const b = d.balance || {};
  return (
    <>
      {step === "preview" ? <div className="po-card"><b>Test mode</b><span>Payout setup is only shown to the real partner.</span></div> : null}
      {step === "details" ? (
        <button type="button" className="po-card act" onClick={() => setEditing(true)}>
          <span className="po-ic"><Zap /></span>
          <span className="t"><b>Get paid automatically</b><span>Add your payout details once – after that every verified removal is paid to your Payoneer account automatically.</span></span><ChevronRight />
        </button>
      ) : null}
      {step === "connect" ? (
        <div className="po-card">
          <span className="po-ic"><LinkIcon /></span>
          <span className="t"><b>{d.payoneer ? "Connect your Payoneer account" : "Payoneer connection is being activated"}</b>
            <span>{d.payoneer
              ? (p.payee && /pending/i.test(p.payee.status) ? "Waiting for Payoneer to confirm the connection. If you didn't finish it, tap again." : "Log in to Payoneer and confirm – takes 1 minute. Then payouts run automatically.")
              : "Your details are saved. Until the connection is live, payouts are made manually as before."}</span></span>
          {d.payoneer ? <button type="button" className="cta" style={{ marginTop: 12 }} disabled={busy} onClick={connect}>{busy ? <Loader className="spin" /> : <LinkIcon />}Connect Payoneer</button> : null}
        </div>
      ) : null}
      {step === "on" ? (
        <div className="po-card ok">
          <span className="po-ic"><Check /></span>
          <span className="t"><b>Automatic payouts are on</b>
            <span>Every day, removals verified at least {d.holdDays} day{d.holdDays === 1 ? "" : "s"} ago are paid to your Payoneer account{d.minUsd ? ` (from ${usd(d.minUsd)})` : ""}. Next run: {d.next}.</span></span>
        </div>
      ) : null}
      {step === "on" || step === "connect" ? (
        <div className="po-mini">
          {b.dueUsd ? <span><Clock />{usd(b.dueUsd)} in the next payout</span> : null}
          {b.processingUsd ? <span><Loader />{usd(b.processingUsd)} on the way</span> : null}
          <button type="button" className="lnk" onClick={() => setEditing(true)}>Edit payout details</button>
        </div>
      ) : null}
      {(d.payouts || []).length ? (
        <>
          <div className="sec"><h2>Payouts</h2><span>{d.payouts.length}</span></div>
          {d.payouts.map((x) => (
            <div key={x.id} className="er">
              <span className="ico"><FileText /></span>
              <span className="t"><b>{usd(x.amount)} · {x.tasks} removal{x.tasks === 1 ? "" : "s"}</b>
                <span>{dt(x.sent || x.created)} · {x.method === "payoneer" ? "Payoneer" + (x.providerStatus && !/submit|created/i.test(x.providerStatus) ? " · " + x.providerStatus : "") : "Manual"}{x.gs ? " · " + x.gs : ""}</span></span>
              {x.gs ? <button type="button" className="mp" onClick={() => openPdf(token, x.id, showToast)}>PDF</button> : null}
            </div>
          ))}
        </>
      ) : null}
    </>
  );
}
