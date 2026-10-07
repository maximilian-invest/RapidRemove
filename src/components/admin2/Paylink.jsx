"use client";
/* Neues Admin — Sheet „Zahlungslink senden" (Profil-Aufträge).
   Zeigt zuerst, WELCHER Stripe-Link rausgeht (automatisch passend zu Leistung + Schutz + Express + Währung,
   wie im bisherigen Admin), mit „Anderen Link wählen" aus allen aktiven Links. Nach dem Senden:
   Auftrag = gelöscht, Zahlung = „Link gesendet" (→ Zahlung offen). */
import React from "react";
import { CreditCard, Send, Loader, Check, AlertTriangle, ArrowLeft, Lock } from "lucide-react";
import { fetchPayLinkUrl, fetchPayLinks, sendPayLink, setOrderStatus } from "@/lib/admin-api";
import { money, cur, payPrefOf } from "./model";

const fmtMinor = (minor, c) => money((minor || 0) / 100, c === "usd" ? "$" : "€");
const ivSuffix = (iv) => (iv === "month" ? " / Mon." : iv === "year" ? " / Jahr" : iv === "week" ? " / Wo." : "");
const tierName = (it) => {
  const v = (it.amount || 0) / 100;
  if (it.interval === "month" && v === 24.9) return "Monatlicher Schutz";
  if (it.interval === "month" && v === 69.9) return "Schutz + Tägliche Überwachung";
  if (it.interval === "year" && v === 245) return "Jahresschutz";
  if (it.interval === "once" && v === 990) return "Lebenslanger Schutz";
  return null;
};
const itemLabel = (it) => { const n = tierName(it); return (n ? n + " · " : "") + fmtMinor(it.amount, it.currency) + ivSuffix(it.interval); };
const linkLabel = (l) => (l.items || []).map(itemLabel).join(" + ") || "(leerer Link)";
const linkCur = (l) => (l.items && l.items[0] && l.items[0].currency) || "eur";
const linkTotal = (l) => (l.items || []).reduce((s, it) => s + (it.amount || 0), 0) / 100;

const PROT_L = { lifetime: "Lebenslanger Schutz", monitor: "Schutz + Tägliche Überwachung", monthly: "Monatlicher Schutz" };
/** Gleiche Angaben wie sendOrderedPayLink im bisherigen Admin (Backend sucht den passenden Link). */
function autoPayload(o) {
  const c = cur(o);
  return {
    to: o.email, name: o.name, orderId: o.id, currency: o.country === "US" ? "usd" : "eur",
    service: o.service, protection: o.protection || "none", serviceAmount: o.amount || 0,
    protAmount: (o.protection && o.protAmount) ? o.protAmount : 0, protType: o.protection || "",
    total: (o.amount || 0) + (o.protection && o.protAmount ? o.protAmount : 0),
    protectionLabel: o.protection ? (PROT_L[o.protection] || "Schutz") + (o.protAmount ? " – " + money(o.protAmount, c) + (o.protection !== "lifetime" ? "/Mon." : "") : "") : "",
    express: !!o.express, expressLabel: o.express ? "Express-Bearbeitung (≤6 h)" + (o.expressAmount ? " · +" + money(o.expressAmount, c) : "") : undefined,
    lang: o.lang || "de",
  };
}

export function PayLinkSheet({ o, ctx, close }) {
  const { toast, patchOrder, act } = ctx;
  const [links, setLinks] = React.useState(null);
  const [autoUrl, setAutoUrl] = React.useState(undefined); // undefined = lädt, null = kein passender
  const [sel, setSel] = React.useState(null);               // manuell gewählter Link
  const [picking, setPicking] = React.useState(false);
  const [curF, setCurF] = React.useState(o.country === "US" ? "usd" : "eur");
  const [busy, setBusy] = React.useState(false);
  const [armed, setArmed] = React.useState(false);
  const [err, setErr] = React.useState("");
  const pref = payPrefOf(o);

  React.useEffect(() => {
    const p = autoPayload(o);
    fetchPayLinkUrl({ service: p.service, protection: p.protection, currency: p.currency, serviceAmount: p.serviceAmount, protAmount: p.protAmount, protType: p.protType, express: p.express })
      .then((u) => setAutoUrl(u || null)).catch(() => setAutoUrl(null));
    fetchPayLinks().then((l) => setLinks(l || [])).catch((e) => { setLinks([]); setErr(e.message || "Fehler"); });
  }, [o.id]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { if (autoUrl === null && !sel) setPicking(true); }, [autoUrl, sel]); // kein passender → gleich auswählen
  React.useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);

  const autoLink = autoUrl && links ? links.find((l) => l.url === autoUrl) || null : null;
  const chosen = sel || autoLink;
  const ready = !!(sel || autoUrl);

  const send = async () => {
    if (!ready || busy) return;
    if (pref && !armed) { setArmed(true); return; }
    setBusy(true);
    try {
      if (sel) await sendPayLink({ to: o.email, name: o.name, orderId: o.id, currency: linkCur(sel), total: linkTotal(sel), protectionLabel: linkLabel(sel), lang: o.lang || "de", url: sel.url, celebrate: true });
      else await sendPayLink({ ...autoPayload(o), celebrate: true });
      // Zahlungslink erhalten → Profil gilt als gelöscht, Zahlung offen („Profil gelöscht" nur 1× protokollieren).
      try {
        await setOrderStatus({ orderId: o.id, status: "done", pay: "sent", noEvent: o.status === "done" });
        patchOrder(o.id, { status: "done", pay: "sent", doneAt: o.doneAt || new Date().toISOString(), paylinkSent: true });
      } catch (e) { /* Link ist raus */ }
      toast(`Zahlungslink an ${o.name || o.email} gesendet`);
      close();
    } catch (e) { toast("Senden fehlgeschlagen: " + e.message); setBusy(false); setArmed(false); }
  };

  if (picking) {
    const shown = (links || []).filter((l) => curF === "all" || linkCur(l) === curF);
    return (
      <>
        <button type="button" className="lnkb" style={{ marginTop: 0 }} onClick={() => setPicking(false)} disabled={!ready && autoUrl === null && !sel}><ArrowLeft style={{ width: 14, height: 14, verticalAlign: -2 }} /> Zurück</button>
        <h3 style={{ paddingBottom: 2 }}>Anderen Link wählen</h3>
        <p className="shp">{autoUrl === null && !sel ? "Kein automatisch passender Link gefunden – bitte wählen." : "Alle aktiven Stripe-Zahlungslinks."}</p>
        <div className="achips" style={{ margin: "4px 0 10px" }}>{[["eur", "€ EUR"], ["usd", "$ USD"], ["all", "Alle"]].map(([k, l]) => <button key={k} type="button" className={"achip" + (curF === k ? " on" : "")} onClick={() => setCurF(k)}>{l}</button>)}</div>
        {err ? <p className="shn warn"><AlertTriangle />Links nicht ladbar: {err}</p> : null}
        {links === null ? <p className="shp"><Loader className="spin" style={{ width: 16, height: 16, verticalAlign: -3 }} /> Lädt …</p> : null}
        <div className="opts plk">
          {shown.map((l) => {
            const on = chosen && chosen.id === l.id;
            return (
              <button key={l.id} type="button" className={"aopt" + (on ? " sel" : "")} onClick={() => { setSel(l); setPicking(false); }}>
                <span className="ico"><CreditCard /></span>
                <span className="ol">{linkLabel(l)}<br /><small>{money(linkTotal(l), linkCur(l) === "usd" ? "$" : "€")}{l.url === autoUrl ? " · passt automatisch" : ""}</small></span>
                {on ? <span className="ck"><Check /></span> : null}
              </button>
            );
          })}
          {links && !shown.length ? <p className="shp">Keine aktiven Links{curF !== "all" ? " in dieser Währung" : ""}.</p> : null}
        </div>
      </>
    );
  }

  return (
    <>
      <span className="shx soft"><CreditCard /></span>
      <h3 style={{ paddingBottom: 2 }}>Zahlungslink senden</h3>
      <p className="shp">An <b>{o.name || o.email}</b> ({o.email}) · {o.id}</p>
      {pref ? <p className="shn warn"><Lock />Kunde wollte per {pref} zahlen (10 % Rabatt) – trotzdem einen Stripe-Link senden?</p> : null}

      <p className="shl">Dieser Link wird gesendet</p>
      <div className="plk-cur">
        {autoUrl === undefined && !sel ? <span className="t"><Loader className="spin" />Passenden Link suchen …</span>
          : chosen ? (
            <span className="t"><b>{linkLabel(chosen)}</b><span>{money(linkTotal(chosen), linkCur(chosen) === "usd" ? "$" : "€")} gesamt · {sel ? "manuell gewählt" : "automatisch passend zur Bestellung"}</span></span>
          ) : autoUrl ? (
            <span className="t"><b>Automatisch passender Link</b><span>{autoPayload(o).protectionLabel || "Nur Leistung"} · {money(autoPayload(o).total, cur(o))}</span></span>
          ) : <span className="t"><b>Kein Link ausgewählt</b></span>}
        <button type="button" className="chg" onClick={() => setPicking(true)}>Ändern</button>
      </div>

      <div className="ctas2" style={{ marginTop: 16 }}>
        <button type="button" className="cta gh" onClick={close} disabled={busy}>Abbrechen</button>
        <button type="button" className={"cta" + (armed ? " red" : " or")} disabled={!ready || busy || !o.email} onClick={send}>
          {busy ? <Loader className="spin" /> : <Send />}{busy ? "Sendet …" : armed ? "Sicher? Nochmal tippen" : "Jetzt senden"}
        </button>
      </div>
      {o.status !== "done" ? <button type="button" className="lnkb" onClick={() => { close(); act.done(o); }}>Ohne Zahlungslink als gelöscht markieren</button> : null}
    </>
  );
}
