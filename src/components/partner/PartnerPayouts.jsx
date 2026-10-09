"use client";
/* Partner App · Auszahlung (nur vollautomatische Wege):
   Payoneer (alle Länder) · Bankkonto über Stripe (EWR, UK, CH, USA, Kanada – Bankdaten gibt der Partner bei Stripe ein)
   · Bankkonto über Airwallex (Indien/Pakistan – nur wenn freigeschaltet).
   PayoutSetup = Pflicht-Einrichtung beim ersten Login (Land → Weg → Daten + Gutschrift-Vereinbarung → ggf. Payoneer verbinden)
   und „Edit payout details" im Earnings-Tab. PartnerPayouts = Status-Karte + Auszahlungen mit Gutschrift (PDF). */
import React from "react";
import { Loader, Check, ChevronRight, FileText, Zap, Link as LinkIcon, Clock, ArrowLeft, AlertCircle, Landmark, Wallet, Globe } from "lucide-react";
import { OPS, call, usd } from "./shared";

const EU = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "GR", "ES", "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"];
const STRIPE_CC = new Set([...EU, "IS", "LI", "NO", "GB", "CH", "US", "CA"]);
const bankCur = (cc) => (cc === "IN" ? "INR" : cc === "PK" ? "PKR" : null); // Airwallex
const NAMES = {
  PK: "Pakistan", IN: "India", BD: "Bangladesh", LK: "Sri Lanka", NP: "Nepal", PH: "Philippines", ID: "Indonesia", VN: "Vietnam", MY: "Malaysia", TH: "Thailand",
  AE: "United Arab Emirates", SA: "Saudi Arabia", EG: "Egypt", MA: "Morocco", TN: "Tunisia", NG: "Nigeria", KE: "Kenya", GH: "Ghana", ZA: "South Africa", TR: "Turkey",
  UA: "Ukraine", RS: "Serbia", BA: "Bosnia and Herzegovina", AL: "Albania", MK: "North Macedonia", GE: "Georgia", AM: "Armenia",
  US: "United States", CA: "Canada", MX: "Mexico", BR: "Brazil", AR: "Argentina", CO: "Colombia", AU: "Australia", NZ: "New Zealand",
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", CY: "Cyprus", CZ: "Czechia", DE: "Germany", DK: "Denmark", EE: "Estonia", GR: "Greece", ES: "Spain", FI: "Finland", FR: "France",
  HR: "Croatia", HU: "Hungary", IE: "Ireland", IT: "Italy", LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", MT: "Malta", NL: "Netherlands", PL: "Poland", PT: "Portugal",
  RO: "Romania", SE: "Sweden", SI: "Slovenia", SK: "Slovakia", IS: "Iceland", LI: "Liechtenstein", NO: "Norway", CH: "Switzerland", GB: "United Kingdom",
};
export { NAMES };
const TOP = ["PK", "IN", "BD", "PH"];
export const COUNTRIES = [...TOP, ...Object.keys(NAMES).filter((c) => !TOP.includes(c)).sort((a, b) => NAMES[a].localeCompare(NAMES[b]))];
const dt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
const CUR_L = { EUR: "in EUR (SEPA)", INR: "in Indian rupees (INR)", PKR: "in Pakistani rupees (PKR)" };

/** Auszahlungsdaten laden. */
export function usePayouts(token) {
  const [d, setD] = React.useState(null);
  const load = React.useCallback(() => (token ? call("payouts", { t: token, fresh: typeof window !== "undefined" && /stripe=/.test(window.location.search) ? "stripe" : undefined }).then((j) => { setD(j); return j; }).catch((e) => { const x = { ok: false, error: e.message }; setD(x); return x; }) : Promise.resolve(null)), [token]);
  React.useEffect(() => { load(); }, [load]);
  return [d, load, setD];
}

async function openPdf(token, id, showToast) {
  const w = typeof window !== "undefined" ? window.open("", "_blank") : null; // sofort öffnen (Popup-Blocker)
  try {
    const res = await fetch(OPS + "/partner/payouts/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token, id }) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const url = URL.createObjectURL(await res.blob());
    if (w) w.location.href = url; else window.location.href = url;
  } catch (e) { if (w) w.close(); showToast("Could not open the PDF: " + e.message); }
}

/* ---------------- Einrichtung (Pflicht beim ersten Login · auch „Edit") ---------------- */
export function PayoutSetup({ d, token, onDone, onBack, showToast, gate }) {
  const p = d.profile || {};
  const [step, setStep] = React.useState(() => (gate && p.setupDone === false && p.complete && p.sb && ((p.method === "payoneer" && d.payoneer) || (p.method === "stripe" && p.stripe)) ? "connect" : "country"));
  const [f, setF] = React.useState({
    country: p.country || "PK", method: p.method || "", legalName: p.legalName || "", addr1: p.addr1 || "", addr2: p.addr2 || "", city: p.city || "", zip: p.zip || "",
    payoutEmail: p.payoutEmail || "", taxId: p.taxId || "", vatId: p.vatId || "", smallBiz: !!p.smallBiz,
    holder: (p.bank && p.bank.holder) || "", iban: "", bic: (p.bank && p.bank.bic) || "", account: "", ifsc: (p.bank && p.bank.ifsc) || "", bankName: (p.bank && p.bank.bankName) || "",
  });
  const needAgree = !p.sb || p.sb.v !== d.sbVersion;
  const [agree, setAgree] = React.useState(!needAgree);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e }));
  const cur = d.bank ? bankCur(f.country) : null; // Airwallex nur, wenn freigeschaltet
  const viaStripe = d.stripe && STRIPE_CC.has(f.country);
  const keepBank = p.bank && p.bank.currency === cur; // gespeichertes Konto weiterverwenden (nur maskiert sichtbar)
  const isEU = EU.includes(f.country), isAT = f.country === "AT";
  const steps = ["country", "method", "details", ...((f.method === "payoneer" && d.payoneer) || f.method === "stripe" ? ["connect"] : [])];
  const idx = Math.max(0, steps.indexOf(step));
  const detailsOk = f.legalName.trim() && f.addr1.trim() && f.city.trim() && agree
    && (f.method === "payoneer" || f.method === "stripe" ? /\S+@\S+\.\S+/.test(f.payoutEmail) : f.method === "bank" ? (keepBank && !f.iban && !f.account) || (cur === "INR" ? f.account.trim() && f.ifsc.trim() : f.iban.trim()) : false)
    && (!isAT || f.smallBiz || f.vatId.trim());

  const save = async (e) => {
    e.preventDefault();
    if (!detailsOk || busy) return;
    setBusy(true); setErr("");
    try {
      const j = await call("payouts/profile", {
        t: token, country: f.country, method: f.method, legalName: f.legalName, addr1: f.addr1, addr2: f.addr2, city: f.city, zip: f.zip,
        payoutEmail: f.payoutEmail, taxId: f.taxId, vatId: isEU ? f.vatId : "", smallBiz: isAT && f.smallBiz, agree: needAgree ? agree : undefined,
        bank: f.method === "bank" ? (cur === "INR" ? { holder: f.holder, account: f.account, ifsc: f.ifsc, bankName: f.bankName } : { holder: f.holder, iban: f.iban, bic: f.bic, bankName: f.bankName }) : undefined,
      });
      if (f.method === "payoneer" && d.payoneer && !(j.profile && j.profile.payee)) { setStep("connect"); setBusy(false); return; }
      if (f.method === "stripe" && !(j.profile && j.profile.setupDone)) { setStep("connect"); setBusy(false); return; }
      showToast("Payout details saved"); onDone();
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  const connect = async (hasAccount) => {
    setBusy(true); setErr("");
    try { const j = await call("payouts/connect", { t: token, hasAccount }); window.location.href = j.url; }
    catch (x) { setErr(x.message); setBusy(false); }
  };
  const backTo = () => { setErr(""); if (idx > 0 && step !== "connect") setStep(steps[idx - 1]); else if (step === "connect") setStep("details"); else if (onBack) onBack(); };

  return (
    <div className="po-form">
      <div className="po-top">
        {idx > 0 || onBack ? <button type="button" className="circ" aria-label="Back" onClick={backTo}><ArrowLeft /></button> : <span />}
        <div className="po-dots">{steps.map((s, i) => <i key={s} className={i <= idx ? "on" : ""} />)}</div>
      </div>
      {gate && step === "country" ? <div className="po-hero"><b>Get paid automatically</b><span>One-time setup, about 2 minutes. After that, every verified removal is paid out to you automatically – no invoices, no reminders.</span></div> : null}

      {step === "country" ? (
        <>
          <div className="ttl">Where do you live?</div>
          <p className="ps">This decides which payout options you can use.</p>
          <label className="po-f"><span>Country</span>
            <select value={f.country} onChange={(e) => setF((x) => ({ ...x, country: e.target.value, method: (x.method === "bank" && !bankCur(e.target.value)) || (x.method === "stripe" && !STRIPE_CC.has(e.target.value)) ? "" : x.method }))}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{NAMES[c]}</option>)}
            </select></label>
          <p className="ps" style={{ marginTop: -2 }}>Not in the list? Choose the closest one and message us on WhatsApp.</p>
          <button type="button" className="cta" onClick={() => setStep("method")}>Continue<ChevronRight /></button>
        </>
      ) : null}

      {step === "method" ? (
        <>
          <div className="ttl">How do you want to get paid?</div>
          <p className="ps">{viaStripe || cur ? "Both options pay out automatically." : "Payouts go to your Payoneer account automatically."} You can change this later.</p>
          <div className="po-opts">
            <button type="button" className={"po-opt" + (f.method === "payoneer" ? " on" : "")} onClick={() => setF((x) => ({ ...x, method: "payoneer" }))}>
              <span className="po-ic"><Wallet /></span>
              <span className="t"><b>Payoneer</b><span>Paid in USD to your Payoneer account. Free account, works in {NAMES[f.country] || "your country"}. Withdraw to your local bank anytime.</span></span>
              <span className="rd">{f.method === "payoneer" ? <Check /> : null}</span>
            </button>
            {viaStripe ? (
              <button type="button" className={"po-opt" + (f.method === "stripe" ? " on" : "")} onClick={() => setF((x) => ({ ...x, method: "stripe" }))}>
                <span className="po-ic"><Landmark /></span>
                <span className="t"><b>Bank account</b><span>Paid directly to your bank account{EU.includes(f.country) ? " (SEPA, EUR)" : ""}. You add your bank details securely at Stripe – takes 3 minutes.</span></span>
                <span className="rd">{f.method === "stripe" ? <Check /> : null}</span>
              </button>
            ) : cur ? (
              <button type="button" className={"po-opt" + (f.method === "bank" ? " on" : "")} onClick={() => setF((x) => ({ ...x, method: "bank" }))}>
                <span className="po-ic"><Landmark /></span>
                <span className="t"><b>Bank account</b><span>Paid directly to your bank account {CUR_L[cur]}. No extra account needed.</span></span>
                <span className="rd">{f.method === "bank" ? <Check /> : null}</span>
              </button>
            ) : <p className="po-note"><Globe />Direct bank payouts are not available in {NAMES[f.country]} yet – Payoneer works there and pays out to your local bank.</p>}
          </div>
          <button type="button" className="cta" disabled={!f.method} onClick={() => setStep("details")} style={{ marginTop: 16 }}>Continue<ChevronRight /></button>
        </>
      ) : null}

      {step === "details" ? (
        <form onSubmit={save}>
          <div className="ttl">Your details</div>
          <p className="ps">Needed for the payout and for the self-billing invoice (Gutschrift) we create for you with every payout.</p>
          <label className="po-f"><span>{f.method === "payoneer" ? "Full name (as on your Payoneer account)" : "Full legal name or company name"}</span><input value={f.legalName} onChange={set("legalName")} autoComplete="name" required /></label>
          <label className="po-f"><span>Address</span><input value={f.addr1} onChange={set("addr1")} autoComplete="address-line1" placeholder="Street and number" required /></label>
          <label className="po-f"><span>Address line 2 (optional)</span><input value={f.addr2} onChange={set("addr2")} autoComplete="address-line2" /></label>
          <div className="po-2">
            <label className="po-f"><span>City</span><input value={f.city} onChange={set("city")} autoComplete="address-level2" required /></label>
            <label className="po-f"><span>Postal code</span><input value={f.zip} onChange={set("zip")} autoComplete="postal-code" /></label>
          </div>

          {f.method === "payoneer" || f.method === "stripe" ? (
            <>
              <label className="po-f"><span>{f.method === "payoneer" ? "Email of your Payoneer account" : "Your email"}</span><input type="email" value={f.payoutEmail} onChange={set("payoutEmail")} autoComplete="email" inputMode="email" required /></label>
              {f.method === "stripe" ? <p className="po-note"><Landmark />Next step: you add your bank account at Stripe (our payment provider). We never see your full bank details.</p> : null}
            </>
          ) : (
            <>
              <div className="po-sub"><Landmark />Bank account {CUR_L[cur]}</div>
              <label className="po-f"><span>Account holder</span><input value={f.holder} onChange={set("holder")} placeholder={f.legalName || "Name on the account"} /></label>
              {keepBank ? <p className="po-sbok"><Check />Saved: {p.bank.ibanMasked || p.bank.accountMasked}{p.bank.ifsc ? " · " + p.bank.ifsc : ""} – leave empty to keep it</p> : null}
              {cur === "INR" ? (
                <>
                  <label className="po-f"><span>Account number</span><input value={f.account} onChange={set("account")} inputMode="numeric" autoComplete="off" /></label>
                  <div className="po-2">
                    <label className="po-f"><span>IFSC code</span><input value={f.ifsc} onChange={(e) => setF((x) => ({ ...x, ifsc: e.target.value.toUpperCase() }))} placeholder="HDFC0001234" autoComplete="off" /></label>
                    <label className="po-f"><span>Bank name</span><input value={f.bankName} onChange={set("bankName")} /></label>
                  </div>
                </>
              ) : (
                <>
                  <label className="po-f"><span>IBAN</span><input value={f.iban} onChange={(e) => setF((x) => ({ ...x, iban: e.target.value.toUpperCase() }))} placeholder={cur === "PKR" ? "PK36 SCBL 0000 0011 2345 6702" : "DE89 3704 0044 0532 0130 00"} autoComplete="off" /></label>
                  <div className="po-2">
                    <label className="po-f"><span>BIC / SWIFT (optional)</span><input value={f.bic} onChange={(e) => setF((x) => ({ ...x, bic: e.target.value.toUpperCase() }))} autoComplete="off" /></label>
                    <label className="po-f"><span>Bank name</span><input value={f.bankName} onChange={set("bankName")} /></label>
                  </div>
                </>
              )}
            </>
          )}

          {isAT ? (
            <>
              <button type="button" className={"po-agree sm" + (f.smallBiz ? " on" : "")} onClick={() => setF((x) => ({ ...x, smallBiz: !x.smallBiz }))}>
                <span className="bx">{f.smallBiz ? <Check /> : null}</span><span>Ich bin Kleinunternehmer (keine Umsatzsteuer)</span>
              </button>
              {!f.smallBiz ? <label className="po-f" style={{ marginTop: 12 }}><span>UID-Nummer</span><input value={f.vatId} onChange={set("vatId")} placeholder="ATU12345678" /></label> : null}
            </>
          ) : isEU ? (
            <label className="po-f"><span>VAT ID (if you have one)</span><input value={f.vatId} onChange={set("vatId")} placeholder={f.country + "123456789"} /></label>
          ) : (
            <label className="po-f"><span>Tax number (optional · e.g. NTN, PAN)</span><input value={f.taxId} onChange={set("taxId")} /></label>
          )}

          {needAgree ? (
            <button type="button" className={"po-agree" + (agree ? " on" : "")} onClick={() => setAgree((a) => !a)} aria-pressed={agree}>
              <span className="bx">{agree ? <Check /> : null}</span><span>{d.sbText}</span>
            </button>
          ) : <p className="po-sbok"><Check />Self-billing agreement accepted on {dt(p.sb.at)}</p>}
          {err ? <div className="po-err"><AlertCircle />{err}</div> : null}
          <button className="cta" disabled={!detailsOk || busy} style={{ marginTop: 16 }}>{busy ? <Loader className="spin" /> : <Check />}{(f.method === "payoneer" && d.payoneer && !p.payee) || (f.method === "stripe" && !p.setupDone) ? "Save & continue" : "Save"}</button>
        </form>
      ) : null}

      {step === "connect" && f.method === "stripe" ? (
        <>
          <div className="ttl">Add your bank account</div>
          <p className="ps">Last step: Stripe asks for your ID and your bank account (needed by law for payouts). You’ll come back here automatically.</p>
          {err ? <div className="po-err" style={{ marginBottom: 12 }}><AlertCircle />{err}</div> : null}
          <button type="button" className="cta" disabled={busy} onClick={() => connect(true)}>{busy ? <Loader className="spin" /> : <LinkIcon />}Continue to Stripe</button>
        </>
      ) : null}

      {step === "connect" && f.method !== "stripe" ? (
        <>
          <div className="ttl">Connect Payoneer</div>
          <p className="ps">Last step: confirm the connection on Payoneer. You’ll come back here automatically.</p>
          {err ? <div className="po-err" style={{ marginBottom: 12 }}><AlertCircle />{err}</div> : null}
          <button type="button" className="cta" disabled={busy} onClick={() => connect(true)}>{busy ? <Loader className="spin" /> : <LinkIcon />}I have a Payoneer account</button>
          <button type="button" className="cta gh" disabled={busy} onClick={() => connect(false)} style={{ marginTop: 10 }}>Create a free Payoneer account</button>
        </>
      ) : null}
    </div>
  );
}

/* ---------------- Earnings: Status + Auszahlungen ---------------- */
export default function PartnerPayouts({ d, token, showToast, setEditing }) {
  if (!d) return <div className="po-card"><Loader className="spin" /> Loading payouts …</div>;
  if (d.ok === false) return <div className="po-card"><AlertCircle />{d.error || "Could not load payouts"}</div>;
  const p = d.profile;
  const live = p && (p.method === "bank" ? d.bank : p.method === "stripe" ? d.stripe : d.payoneer);
  const stripeAction = p && p.method === "stripe" && p.stripe && /restricted|pending/.test(p.stripe.status);
  const b = d.balance || {};
  let card = null;
  if (d.preview) card = <div className="po-card"><span className="t"><b>Test mode</b><span>Payout setup is only shown to the real partner.</span></span></div>;
  else if (!p || !p.setupDone) card = (
    <button type="button" className="po-card act" onClick={() => setEditing(true)}>
      <span className="po-ic"><Zap /></span><span className="t"><b>Set up automatic payouts</b><span>Choose Payoneer or your bank account – takes 2 minutes.</span></span><ChevronRight />
    </button>
  );
  else if (p.bankError) card = (
    <button type="button" className="po-card act warn" onClick={() => setEditing(true)}>
      <span className="po-ic"><AlertCircle /></span><span className="t"><b>Please check your bank details</b><span>{p.bankError}</span></span><ChevronRight />
    </button>
  );
  else if (stripeAction) card = (
    <button type="button" className="po-card act warn" onClick={async () => { try { const j = await call("payouts/connect", { t: token }); window.location.href = j.url; } catch (e) { showToast(e.message); } }}>
      <span className="po-ic"><AlertCircle /></span><span className="t"><b>Stripe needs more information</b><span>Please complete your details at Stripe – otherwise we can’t pay you out.</span></span><ChevronRight />
    </button>
  );
  else if (p.ready && d.auto) card = (
    <div className="po-card ok">
      <span className="po-ic"><Check /></span>
      <span className="t"><b>Automatic payouts are on</b>
        <span>{p.method === "bank" ? `To your bank account ${p.bank && (p.bank.ibanMasked || p.bank.accountMasked)}` : p.method === "stripe" ? "To your bank account (via Stripe)" : "To your Payoneer account"} · every day for removals verified at least {d.holdDays} day{d.holdDays === 1 ? "" : "s"} ago{d.minUsd ? ` (from ${usd(d.minUsd)})` : ""}. Next run: {d.next}.</span></span>
    </div>
  );
  else card = (
    <div className="po-card">
      <span className="po-ic"><Clock /></span>
      <span className="t"><b>{(p.method === "payoneer" && live && p.payee) || (p.method === "stripe" && live) ? `Waiting for ${p.method === "stripe" ? "Stripe" : "Payoneer"} to confirm` : "Almost ready"}</b>
        <span>{(p.method === "payoneer" && live && p.payee) || (p.method === "stripe" && live) ? `${p.method === "stripe" ? "Stripe is checking your details" : "Payoneer is checking the connection"} – usually within a day. Payouts start automatically after that.`
          : `Your details are saved (${p.method === "payoneer" ? "Payoneer" : "bank account"}). Automatic payouts start as soon as we switch them on – until then you are paid as before.`}</span></span>
    </div>
  );
  return (
    <>
      {card}
      {p && p.setupDone ? (
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
                <span>{dt(x.sent || x.created)} · {x.method === "payoneer" ? "Payoneer" : x.method === "airwallex" || x.method === "stripe" ? "Bank transfer" : "Manual"}{x.gs ? " · " + x.gs : ""}</span></span>
              {x.gs ? <button type="button" className="mp" onClick={() => openPdf(token, x.id, showToast)}>PDF</button> : null}
            </div>
          ))}
        </>
      ) : null}
    </>
  );
}
