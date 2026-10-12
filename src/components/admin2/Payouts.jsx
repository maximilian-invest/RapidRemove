"use client";
/* Admin · Konto → Partner → Auszahlungen: automatische Partner-Auszahlung (Payoneer) + Gutschriften.
   Ablauf: Partner „Removed" → Lena prüft → nach der Haltefrist nochmal geprüft → Payoneer → Gutschrift-PDF an den Partner. */
import React from "react";
import { ArrowLeft, Loader, Zap, ShieldCheck, Clock, DollarSign, FileText, Send, AlertTriangle, CheckCircle2, Link as LinkIcon, User, RefreshCw, Landmark, FlaskConical, Repeat } from "lucide-react";
import { payoutsInfo, payoutsSettings, payoutsRun, payoutsRemail, payoutPdfOpen, payoutsPartner, payoutsAwTest, payoutsAwSim } from "@/lib/admin-api";

const usd = (n) => "$" + Number(n || 0).toLocaleString("de-AT", { maximumFractionDigits: 2 });
const dt = (d) => (d ? new Date(d).toLocaleString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");
const EVERY = { daily: "täglich", weekly: "wöchentlich", monthly: "monatlich" };
const AW_CC = ["IN", "PK"];
const ST = { sent: ["Gesendet", "var(--success)"], manual: ["Manuell", "var(--g3)"], pending: ["Läuft …", "#b26b00"], failed: ["Fehlgeschlagen", "var(--danger)"] };

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
  const s = d && d.settings, b = (d && d.balance) || {};
  const steps = d ? [
    [d.payoneer.configured, "Payoneer-Zugang", d.payoneer.configured ? (d.payoneer.sandbox ? "Sandbox (Test)" : "Live") : "Fehlt – PAYONEER_CLIENT_ID, PAYONEER_CLIENT_SECRET, PAYONEER_PROGRAM_ID in Railway (kommt von Payoneer nach der Freischaltung)"],
    [d.stripe.configured, "Stripe Connect (Bankkonto EU/UK/CH/USA/CA)", d.stripe.configured ? `${d.stripe.test ? "Testmodus" : "Live"} · ~2 €/Monat je ausgezahltem Partner + 0,25 % je Auszahlung` : "STRIPE_SECRET_KEY fehlt"],
    [d.airwallex.configured, "Airwallex (Bankkonto Indien/Pakistan · optional)", d.airwallex.configured
      ? `${d.airwallex.sandbox ? "Sandbox (Test) – echte Löschungen werden darüber nicht ausgezahlt, nur Testüberweisungen" : "Live · 19 €/Monat (gratis ab 10.000 € Einzahlung/Guthaben)"} · nur für Partner, die du unten freischaltest${d.airwallex.balances ? " · Guthaben " + d.airwallex.balances.map((x) => `${x.currency} ${Number(x.available).toLocaleString("de-AT")}`).join(", ") : d.airwallex.balanceError ? " · Guthaben nicht abrufbar: " + d.airwallex.balanceError : ""}`
      : "Nicht verbunden – zum Testen: AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY und AIRWALLEX_ENV=sandbox in Railway (Service „ops“)"],
  ] : [];
  /** Einrichtungsstand eines Partners (Weg + Daten, Gutschrift-Vereinbarung, Konto beim Anbieter). */
  const pSteps = (p) => {
    const bankM = p.method === "bank";
    return [
      [!!p.setupDone, "Auszahlungsweg + Daten", p.complete ? `${bankM ? "Bankkonto Airwallex " + ((p.bank && (p.bank.ibanMasked || p.bank.accountMasked)) || "") + " (" + ((p.bank && p.bank.currency) || "") + (p.bank && p.bank.entity === "COMPANY" ? ", Firma" : "") + (p.bank && p.bank.via === "SWIFT" ? ", SWIFT" : "") + ")" : p.method === "stripe" ? "Bankkonto über Stripe" : p.method === "payoneer" ? "Payoneer · " + p.payoutEmail : "kein Weg gewählt"} · ${p.legalName} · ${p.city}, ${p.country}${p.vatId ? " · UID " + p.vatId : ""}${p.country === "AT" ? (p.smallBiz ? " · Kleinunternehmer" : " · 20 % USt") : ""}` : "Partner richtet es beim nächsten Login ein (Pflicht, bevor er Aufträge sieht)"],
      [!!p.sb, "Gutschrift-Vereinbarung", p.sb ? `angenommen ${dt(p.sb.at)} · Version ${p.sb.v}${p.sbIp ? " · IP " + p.sbIp : ""}` : "Partner stimmt bei der Einrichtung zu"],
      [!!p.ready, bankM ? "Bankkonto bei Airwallex" : p.method === "stripe" ? "Stripe-Konto" : "Payoneer-Konto",
        bankM ? (p.bankError ? "Abgelehnt: " + p.bankError : p.ready ? "angelegt" : "wird angelegt, sobald der Airwallex-Zugang da ist")
          : p.method === "stripe" ? (p.stripe ? ({ active: "freigeschaltet", review: "Stripe prüft die Angaben", pending: "Partner hat das Stripe-Formular noch nicht abgeschlossen" }[p.stripe.status] || p.stripe.status) : "wird angelegt")
          : p.payee ? `${p.payee.id} · ${p.payee.status}` : "Partner verbindet Payoneer in der App"],
    ];
  };
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk keep" aria-label="Zurück" onClick={() => setMoreSub("partner")}><ArrowLeft /></button></div>
      <div className="ttl">Auszahlungen</div>
      {err ? <div className="aempty"><b>Fehler</b>{err}</div> : null}
      {!d && !err ? <div className="aempty"><b>Lädt …</b></div> : null}
      {d ? (
        <>
          <div className="info">
            <button type="button" className="ir" onClick={() => { if (s.live || window.confirm("Auszahlungen live schalten? Partner sehen dann die Auszahlungs-Einrichtung (Pflicht beim nächsten Login) und werden automatisch bezahlt, sobald ein Anbieter-Zugang da ist.")) save({ live: !s.live }); }}>
              <span className="ico" style={s.live ? { background: "var(--success)", color: "#fff" } : null}><Zap /></span>
              <span className="t"><b>Auszahlungen {s.live ? "live" : "noch nicht live"}</b><span>{s.live ? "Partner richten die Auszahlung ein und werden automatisch bezahlt" : "Partner sehen nichts davon · bezahlt wird wie bisher manuell"}</span></span>
              <span className={"tg" + (s.live ? " on" : "")}><i /></span>
            </button>
          </div>
          <p className="sh">Gelöscht → von Lena geprüft → nach {s.holdDays} Tag{s.holdDays === 1 ? "" : "en"} nochmal geprüft → automatisch ausgezahlt (Payoneer oder Bankkonto über Stripe – der Partner wählt) → Gutschrift (PDF) an den Partner.</p>
          <div className="pst3 po-k">
            <div><b>{usd(b.owedUsd)}</b><span>Offen · {b.owedCount}</span></div>
            <div><b>{usd(b.dueUsd)}</b><span>Fällig im nächsten Lauf</span></div>
            {b.processingUsd ? <div><b>{usd(b.processingUsd)}</b><span>Unterwegs</span></div> : null}
          </div>

          <div className="sec3" style={{ marginTop: 18 }}><h2>Anbieter</h2></div>
          <div className="info">
            {steps.map(([ok, l, sub]) => (
              <div key={l} className="ir">
                <span className="ico" style={ok ? { background: "var(--success)", color: "#fff" } : null}>{ok ? <CheckCircle2 /> : <ShieldCheck />}</span>
                <span className="t"><b>{l}</b><span style={{ whiteSpace: "normal" }}>{sub}</span></span>
              </div>
            ))}
          </div>
          {(d.partners || []).map((p) => (
            <React.Fragment key={p.id}>
              <div className="sec3"><h2>{p.name}{p.paused ? " (pausiert)" : ""}</h2><span className="px-cnt">{usd(p.balance && p.balance.owedUsd)} offen</span></div>
              <div className="info">
                {pSteps(p).map(([ok, l, sub], i) => (
                  <div key={l} className="ir">
                    <span className="ico" style={ok ? { background: "var(--success)", color: "#fff" } : null}>{ok ? <CheckCircle2 /> : [<User key="0" />, <FileText key="1" />, <LinkIcon key="2" />][i]}</span>
                    <span className="t"><b>{l}</b><span style={{ whiteSpace: "normal" }}>{sub}</span></span>
                  </div>
                ))}
                <AwPartner p={p} d={d} toast={toast} reload={load} />
              </div>
            </React.Fragment>
          ))}

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
          <button type="button" className="cta or" disabled={busy || !(d.payoneer.configured || d.airwallex.configured || d.stripe.configured)} onClick={run} style={{ marginBottom: 6 }}>{busy ? <Loader className="spin" /> : <Send />}{busy ? "Prüft und zahlt aus …" : "Jetzt auszahlen"}</button>
          <p className="sh">Zahlt alle fälligen Löschungen sofort (Haltefrist, Prüfung und Mindestbetrag gelten). Ohne Zugang beim gewählten Anbieter: wie bisher manuell als bezahlt markieren – die Gutschrift entsteht trotzdem automatisch.</p>

          <div className="sec3" style={{ marginTop: 18 }}><h2>Verlauf</h2><button type="button" className="lk" onClick={load}><RefreshCw />Aktualisieren</button></div>
          <div className="info">
            {d.payouts.map((x) => {
              const st = ST[x.status] || ST.manual;
              return (
                <div key={x.id} className="ir po-row">
                  <span className="ico" style={{ color: st[1] }}>{x.status === "failed" ? <AlertTriangle /> : x.status === "sent" ? <Send /> : <FileText />}</span>
                  <span className="t"><b>{usd(x.amount)} · {x.tasks} Löschungen{x.gs ? " · " + x.gs : ""}</b>
                    <span style={{ whiteSpace: "normal" }}>{x.partner ? x.partner + " · " : ""}<em style={{ color: st[1], fontStyle: "normal" }}>{st[0]}{x.method === "payoneer" ? " · Payoneer" : x.method === "airwallex" ? " · Bank (Airwallex)" : x.method === "stripe" ? " · Bank (Stripe)" : ""}</em> · {dt(x.sent || x.created)}{x.ref ? " · " + x.ref : ""}{x.providerStatus && x.status === "sent" ? " · " + x.providerStatus : ""}{x.error ? " · " + x.error : ""}{!x.gs && x.status !== "failed" ? " · keine Gutschrift (vor der Vereinbarung)" : ""}</span></span>
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

/** Je Partner: Airwallex freischalten (nur Indien/Pakistan), Rhythmus + Mindestbetrag, Sandbox-Testüberweisung.
    Bestandspartner bleiben unverändert, solange hier nichts umgestellt wird. */
function AwPartner({ p, d, toast, reload }) {
  const [busy, setBusy] = React.useState("");
  const [minX, setMinX] = React.useState(p.payMinUsd == null ? "" : String(p.payMinUsd));
  React.useEffect(() => { setMinX(p.payMinUsd == null ? "" : String(p.payMinUsd)); }, [p.payMinUsd]);
  const cc = String(p.country || "").toUpperCase();
  const custom = p.awEnabled || (p.payEvery && p.payEvery !== "daily") || p.payMinUsd != null;
  if (!AW_CC.includes(cc) && !custom) return null;
  const go = async (k, fn, msg) => { setBusy(k); try { const j = await fn(); if (msg) toast(typeof msg === "function" ? msg(j) : msg); await reload(); } catch (e) { toast("Fehler: " + e.message); } setBusy(""); };
  const t = p.awTest;
  return (
    <>
      {AW_CC.includes(cc) || p.awEnabled ? (
        <button type="button" className="ir" disabled={!!busy} onClick={() => {
          if (!p.awEnabled && !window.confirm(`Airwallex für ${p.name} freischalten?\n\nDer Partner muss dann beim nächsten Login die Auszahlung einrichten (Pflicht, bevor er Aufträge sieht) und kann sein Bankkonto wählen. ${d.airwallex.sandbox ? "Sandbox: es fließt kein echtes Geld, echte Löschungen werden darüber nicht ausgezahlt." : "LIVE: er wird automatisch über Airwallex ausgezahlt."}`)) return;
          go("aw", () => payoutsPartner(p.id, { awEnabled: !p.awEnabled }), p.awEnabled ? "Airwallex für " + p.name + " aus" : "Airwallex für " + p.name + " freigeschaltet");
        }}>
          <span className="ico" style={p.awEnabled ? { background: "var(--success)", color: "#fff" } : null}><Landmark /></span>
          <span className="t"><b>Airwallex (Bankkonto {cc === "IN" ? "Indien" : cc === "PK" ? "Pakistan" : cc})</b><span style={{ whiteSpace: "normal" }}>{p.awEnabled ? (d.airwallex.configured ? (d.airwallex.sandbox ? "Freigeschaltet · Sandbox" : "Freigeschaltet · Live") : "Freigeschaltet – wirkt erst mit Airwallex-Zugang") : "Aus – Partner sieht nur Payoneer, wie bisher"}</span></span>
          <span className={"tg" + (p.awEnabled ? " on" : "")}><i /></span>
        </button>
      ) : null}
      {custom ? (
        <>
          <label className="ir">
            <span className="ico"><Repeat /></span><span className="t"><b>Auszahlungsrhythmus</b><span style={{ whiteSpace: "normal" }}>{p.bank && p.bank.via === "SWIFT" ? "SWIFT kostet 10–20 € je Überweisung – monatlich empfohlen" : "automatischer Lauf · „Jetzt auszahlen“ ignoriert den Rhythmus"}</span></span>
            <select className="po-sel" value={p.payEvery || "daily"} disabled={!!busy} onChange={(e) => go("ev", () => payoutsPartner(p.id, { payEvery: e.target.value }), "Rhythmus: " + EVERY[e.target.value])}>
              {Object.entries(EVERY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="ir">
            <span className="ico"><DollarSign /></span><span className="t"><b>Mindestbetrag (dieser Partner)</b><span>leer = allgemeiner Wert ({usd(d.settings.minUsd)})</span></span>
            <input className="po-num" type="number" inputMode="numeric" min={0} max={5000} placeholder={String(d.settings.minUsd)} value={minX} onChange={(e) => setMinX(e.target.value)}
              onBlur={() => { const v = minX.trim() === "" ? null : Number(minX); if (v === p.payMinUsd || (v != null && !Number.isFinite(v))) return; go("min", () => payoutsPartner(p.id, { payMinUsd: v }), v == null ? "Mindestbetrag: allgemein" : "Mindestbetrag: " + usd(v)); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
          </label>
        </>
      ) : null}
      {p.awEnabled && d.airwallex.configured && d.airwallex.sandbox ? (
        <div className="ir" style={{ flexWrap: "wrap" }}>
          <span className="ico"><FlaskConical /></span>
          <span className="t"><b>Sandbox-Test</b><span style={{ whiteSpace: "normal" }}>{t ? `Letzte Testüberweisung ${dt(t.at)} · ${usd(t.usd)} → ${t.currency} per ${t.via} · Status ${t.status || "–"}` : p.method === "bank" ? "Schickt 10 $ Spielgeld an das eingetragene Bankkonto – ohne Aufgaben, ohne Gutschrift" : "Zuerst in der Partner-App ein Bankkonto eintragen"}</span></span>
          <span className="po-acts" style={{ flexWrap: "wrap", flex: "1 1 100%", marginTop: 8, paddingLeft: 52 }}>
            <button type="button" className="achip" disabled={!!busy || p.method !== "bank"} onClick={() => go("t", () => payoutsAwTest(p.id, 10), (j) => `Testüberweisung angelegt · ${j.transfer.status || "ok"}`)}>{busy === "t" ? <Loader className="spin" /> : null}Testüberweisung</button>
            {t ? <button type="button" className="achip" disabled={!!busy} onClick={() => go("s", () => payoutsAwSim(p.id), (j) => "Status: " + j.status + (j.trail && j.trail.length ? " (" + j.trail.join(", ") + ")" : ""))}>Als bezahlt simulieren</button> : null}
            {t ? <button type="button" className="achip" disabled={!!busy} onClick={() => go("f", () => payoutsAwSim(p.id, { fail: true }), (j) => "Status: " + j.status)}>Fehlschlag</button> : null}
            {t ? <button type="button" className="achip" disabled={!!busy} onClick={() => go("c", () => payoutsAwSim(p.id, { check: true }), (j) => "Status: " + j.status)}>Status</button> : null}
          </span>
        </div>
      ) : null}
    </>
  );
}
