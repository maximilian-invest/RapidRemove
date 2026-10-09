"use client";
/* Admin · Konto → Partner → Auszahlungen: automatische Partner-Auszahlung (Payoneer) + Gutschriften.
   Ablauf: Partner „Removed" → Lena prüft → nach der Haltefrist nochmal geprüft → Payoneer → Gutschrift-PDF an den Partner. */
import React from "react";
import { ArrowLeft, Loader, Zap, ShieldCheck, Clock, DollarSign, FileText, Send, AlertTriangle, CheckCircle2, Link as LinkIcon, User, RefreshCw } from "lucide-react";
import { payoutsInfo, payoutsSettings, payoutsRun, payoutsRemail, payoutPdfOpen } from "@/lib/admin-api";

const usd = (n) => "$" + Number(n || 0).toLocaleString("de-AT", { maximumFractionDigits: 2 });
const dt = (d) => (d ? new Date(d).toLocaleString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");
const ST = { sent: ["Payoneer · gesendet", "var(--success)"], manual: ["Manuell", "var(--g3)"], pending: ["Läuft …", "#b26b00"], failed: ["Fehlgeschlagen", "var(--danger)"] };

export default function PayoutsScreen({ ctx }) {
  const { setMoreSub, toast } = ctx;
  const [d, setD] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const load = React.useCallback(() => payoutsInfo().then((j) => { setD(j); setErr(""); }).catch((e) => setErr(e.message)), []);
  React.useEffect(() => { load(); }, [load]);
  const save = async (patch) => {
    setD((x) => (x ? { ...x, settings: { ...x.settings, ...patch } } : x));
    try { const j = await payoutsSettings(patch); setD((x) => (x ? { ...x, settings: j.settings } : x)); } catch (e) { toast("Fehler: " + e.message); load(); }
  };
  const run = async () => {
    setBusy(true);
    try {
      const r = await payoutsRun();
      toast(r.payoutId ? `Ausgezahlt · ${usd(r.amount)} · ${r.tasks} Löschungen${r.gs ? " · " + r.gs : ""}` : r.error ? "Fehlgeschlagen: " + r.error : "Nichts ausgezahlt: " + (r.skipped || "–"));
      load();
    } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const s = d && d.settings, p = d && d.partner, b = (d && d.balance) || {};
  const steps = d ? [
    [d.payoneer.configured, "Payoneer-Zugang", d.payoneer.configured ? (d.payoneer.sandbox ? "Sandbox (Test)" : "Live") : "Fehlt – PAYONEER_CLIENT_ID, PAYONEER_CLIENT_SECRET, PAYONEER_PROGRAM_ID in Railway setzen (kommt von Payoneer nach der Freischaltung)"],
    [!!(p && p.complete), "Auszahlungsdaten des Partners", p && p.complete ? `${p.legalName} · ${p.city}, ${p.country}${p.taxId ? " · " + p.taxId : ""}` : "Partner trägt sie in der Partner-App unter Earnings ein"],
    [!!(p && p.sb), "Gutschrift-Vereinbarung", p && p.sb ? `angenommen ${dt(p.sb.at)} · Version ${p.sb.v}${p.sbIp ? " · IP " + p.sbIp : ""}` : "Partner stimmt beim Eintragen der Daten zu"],
    [!!(p && p.ready), "Payoneer-Konto des Partners", p && p.payee ? `${p.payee.id} · ${p.payee.status}` : "Partner tippt in der App auf „Connect Payoneer“"],
  ] : [];
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub("partner")}><ArrowLeft /></button></div>
      <div className="ttl">Auszahlungen</div>
      {err ? <div className="aempty"><b>Fehler</b>{err}</div> : null}
      {!d && !err ? <div className="aempty"><b>Lädt …</b></div> : null}
      {d ? (
        <>
          <p className="sh">Gelöscht → von Lena geprüft → nach {s.holdDays} Tag{s.holdDays === 1 ? "" : "en"} nochmal geprüft → automatisch per Payoneer ausgezahlt → Gutschrift (PDF) an den Partner.</p>
          <div className="pst3 po-k">
            <div><b>{usd(b.owedUsd)}</b><span>Offen · {b.owedCount}</span></div>
            <div><b>{usd(b.dueUsd)}</b><span>Fällig im nächsten Lauf</span></div>
            {b.processingUsd ? <div><b>{usd(b.processingUsd)}</b><span>Unterwegs</span></div> : null}
          </div>

          <div className="sec3" style={{ marginTop: 18 }}><h2>Einrichtung</h2></div>
          <div className="info">
            {steps.map(([ok, l, sub], i) => (
              <div key={l} className="ir">
                <span className="ico" style={ok ? { background: "var(--success)", color: "#fff" } : null}>{ok ? <CheckCircle2 /> : [<ShieldCheck key="0" />, <User key="1" />, <FileText key="2" />, <LinkIcon key="3" />][i]}</span>
                <span className="t"><b>{l}</b><span style={{ whiteSpace: "normal" }}>{sub}</span></span>
              </div>
            ))}
          </div>

          <div className="sec3"><h2>Automatik</h2></div>
          <div className="info">
            <button type="button" className="ir" onClick={() => save({ auto: !s.auto })}>
              <span className="ico"><Zap /></span><span className="t"><b>Automatisch auszahlen</b><span>{s.auto ? `täglich ab ${s.hour}:00 (Wien) · nächster Lauf ${String(d.next).replace("today", "heute").replace("tomorrow", "morgen").replace(" (Vienna time)", "")}` : "Aus – nur über „Jetzt auszahlen“"}</span></span>
              <span className={"tg" + (s.auto ? " on" : "")}><i /></span>
            </button>
            <button type="button" className="ir" onClick={() => save({ recheck: !s.recheck })}>
              <span className="ico"><ShieldCheck /></span><span className="t"><b>Vor der Auszahlung nochmal prüfen</b><span>{s.recheck ? "Lena prüft jede Bewertung erneut – wieder sichtbar → nicht bezahlt + Push" : "Aus"}</span></span>
              <span className={"tg" + (s.recheck ? " on" : "")}><i /></span>
            </button>
            <Num icon={Clock} label="Haltefrist nach „gelöscht“" unit="Tage" v={s.holdDays} min={0} max={30} onSave={(v) => save({ holdDays: v })} />
            <Num icon={DollarSign} label="Mindestbetrag je Auszahlung" unit="USD" v={s.minUsd} min={0} max={5000} onSave={(v) => save({ minUsd: v })} />
            <Num icon={Clock} label="Uhrzeit (Wien)" unit="Uhr" v={s.hour} min={0} max={23} onSave={(v) => save({ hour: v })} />
          </div>
          {d.last ? <p className="sh">Letzter Lauf {dt(d.last.at)}: {d.last.payoutId ? `${usd(d.last.amount)} an ${d.last.tasks} Löschungen ausgezahlt${d.last.gs ? " · " + d.last.gs : ""}` : d.last.error ? "Fehler – " + d.last.error : d.last.skipped || "–"}{d.last.held && d.last.held.length ? ` · angehalten (wieder sichtbar): ${d.last.held.join(", ")}` : ""}</p> : null}
          <button type="button" className="cta or" disabled={busy || !d.payoneer.configured} onClick={run} style={{ marginBottom: 6 }}>{busy ? <Loader className="spin" /> : <Send />}{busy ? "Prüft und zahlt aus …" : "Jetzt auszahlen"}</button>
          <p className="sh">Zahlt alle fälligen Löschungen sofort (Haltefrist, Prüfung und Mindestbetrag gelten). Ohne Payoneer-Zugang: wie bisher manuell als bezahlt markieren – die Gutschrift entsteht trotzdem automatisch.</p>

          <div className="sec3" style={{ marginTop: 18 }}><h2>Verlauf</h2><button type="button" className="lk" onClick={load}><RefreshCw />Aktualisieren</button></div>
          <div className="info">
            {d.payouts.map((x) => {
              const st = ST[x.status] || ST.manual;
              return (
                <div key={x.id} className="ir po-row">
                  <span className="ico" style={{ color: st[1] }}>{x.status === "failed" ? <AlertTriangle /> : x.status === "sent" ? <Send /> : <FileText />}</span>
                  <span className="t"><b>{usd(x.amount)} · {x.tasks} Löschungen{x.gs ? " · " + x.gs : ""}</b>
                    <span style={{ whiteSpace: "normal" }}><em style={{ color: st[1], fontStyle: "normal" }}>{st[0]}</em> · {dt(x.sent || x.created)}{x.ref ? " · " + x.ref : ""}{x.providerStatus && x.status === "sent" ? " · " + x.providerStatus : ""}{x.error ? " · " + x.error : ""}{!x.gs && x.status !== "failed" ? " · keine Gutschrift (vor der Vereinbarung)" : ""}</span></span>
                  {x.gs ? <span className="po-acts">
                    <button type="button" className="achip" onClick={() => payoutPdfOpen(x.id).catch((e) => toast("Fehler: " + e.message))}>PDF</button>
                    <button type="button" className="achip" onClick={() => payoutsRemail(x.id).then(() => toast("Gutschrift erneut gesendet")).catch((e) => toast("Fehler: " + e.message))}>Mail</button>
                  </span> : null}
                </div>
              );
            })}
            {!d.payouts.length ? <div className="aempty"><b>Noch keine Auszahlungen</b></div> : null}
          </div>
          <p className="sh">Gutschriften: Nummernkreis GS-Jahr-Nummer, Reverse Charge (Partner im Drittland). Bitte die Gutschriften wie Eingangsrechnungen an die Buchhaltung geben.</p>
        </>
      ) : null}
    </>
  );
}

function Num({ icon: I, label, unit, v, min, max, onSave }) {
  const [x, setX] = React.useState(String(v));
  React.useEffect(() => { setX(String(v)); }, [v]);
  const commit = () => { const n = Math.max(min, Math.min(max, Math.round(Number(x)))); if (Number.isFinite(n) && n !== v) onSave(n); else setX(String(v)); };
  return (
    <label className="ir">
      <span className="ico"><I /></span><span className="t"><b>{label}</b><span>{unit}</span></span>
      <input className="po-num" type="number" inputMode="numeric" min={min} max={max} value={x} onChange={(e) => setX(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
    </label>
  );
}
