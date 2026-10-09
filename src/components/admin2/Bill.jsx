"use client";
/* Admin · Auftrag → „Gelöschte Bewertungen abrechnen" – auch für Bewertungen, die NICHT beim Partner sind (selbst gelöscht).
   Hinterlegte Zahlungsart → als gelöscht vermerken + sofort abbuchen (Rechnung per Mail).
   Sonst → Löschbestätigung + Rechnung mit Zahlungslink (bzw. PayPal/Wise-Text, wenn der Kunde das wollte). */
import React from "react";
import { Receipt, Loader, Check, CreditCard, Mail } from "lucide-react";
import { reviewsBillInfoApi, reviewsBillApi, sendReviewsInvoice, setOrderStatus } from "@/lib/admin-api";
import { reviewDiscountPct, REVIEW_NOTEXT_PRICE, REVIEW_OLD_SURCHARGE } from "@/lib/pricing";
import { Nav, keyOf, RStars, rvStars } from "./OrdersScreens";
import { money, payPrefOf } from "./model";

const BASE = 179;
const PT_L = { new: "Beim Partner · nicht gestartet", working: "Partner arbeitet", removed: "Partner: gelöscht", not_possible: "Partner: nicht möglich", software: "Software · wartet auf Kunde" };

export default function Bill({ ctx, id }) {
  const { orders, back, isDesk, toast, refresh, ptasks } = ctx;
  const o = orders.find((x) => x.id === id);
  const items = (o && o.reviewItems) || [];
  const pt = (o && ptasks[o.id]) || [];
  const ptBy = Object.fromEntries(pt.filter((t) => t.status !== "cancelled").map((t) => [t.itemKey, t]));
  const billed = new Set([...((o && o.reviewsRemovedAll) || []), ...((o && o.reviewsRemoved) || [])].map(keyOf));
  const paid = new Set((o && o.reviewsPaidKeys) || []);
  // Abrechenbar: nicht beim Partner oder vom Partner gelöscht/„nicht möglich" – und noch nicht abgerechnet.
  const rows = items.map((it) => {
    const k = keyOf(it); const t = ptBy[k];
    const done = billed.has(k) || paid.has(k);
    const busyAtPartner = t && ["new", "working", "software"].includes(t.status);
    return { it, k, t, done, ok: !done && !busyAtPartner };
  });
  const [sel, setSel] = React.useState(() => Object.fromEntries(rows.filter((r) => r.ok && r.t && r.t.status === "removed").map((r) => [r.k, true])));
  const [info, setInfo] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { if (o) reviewsBillInfoApi(o.id).then(setInfo).catch(() => setInfo({ savedPm: false })); }, [o && o.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return <Nav back={back} isDesk={isDesk} />;
  const c = o.country === "US" ? "$" : "€";
  const pct = reviewDiscountPct(items.length);
  const priceOf = (it) => (Number(it.cp) > 0 ? Number(it.cp) : Math.round(((it.nt || it.sw ? REVIEW_NOTEXT_PRICE : it.old ? BASE + REVIEW_OLD_SURCHARGE : BASE) * (100 - pct)) / 100));
  const chosen = rows.filter((r) => r.ok && sel[r.k]);
  const total = chosen.reduce((s, r) => s + priceOf(r.it), 0);
  const pref = payPrefOf(o);
  const auto = info && info.savedPm;
  const send = async () => {
    if (!chosen.length || busy) return;
    setBusy(true);
    try {
      const r = await reviewsBillApi({ orderId: o.id, keys: chosen.map((x) => x.k) });
      if (r.mode === "autopay") {
        toast(r.charged ? `Abgebucht · ${money(r.charged.amount, c)} · Rechnung per Mail an ${o.email}` : "Als gelöscht vermerkt – Abbuchung fehlgeschlagen, Kunde wird zur Aktualisierung aufgefordert");
      } else {
        const method = pref === "Wise" ? "wise" : pref ? "paypal" : undefined;
        const j = await sendReviewsInvoice({ orderId: o.id, email: o.email, name: o.name, lang: o.lang, currency: o.country === "US" ? "usd" : "eur", removedItems: chosen.map((x) => x.it), submittedCount: items.length, ...(method ? { method } : {}) });
        await setOrderStatus({ orderId: o.id, status: "done", pay: o.pay === "paid" ? "paid" : "sent", label: "Löschbestätigung + Rechnung gesendet", noEvent: o.status === "done" }).catch(() => {});
        toast(method ? `Löschbestätigung (${pref}, ${j.payTotal}) an ${o.email} gesendet` : `Löschbestätigung + Rechnung über ${j.total} an ${o.email} gesendet`);
      }
      if (refresh) refresh(true);
      if (ctx.loadPtasks) ctx.loadPtasks();
      back();
    } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  return (
    <div className="naflow">
      <Nav back={back} isDesk={isDesk} />
      <div className="nah"><h1>Gelöschte abrechnen</h1></div>
      <p className="nasub">{o.id} · {o.profile || o.company || o.name} · Anhaken, was gelöscht ist – auch Bewertungen, die nicht beim Partner liegen. Abgerechnet wird genau der Preis je Bewertung.</p>
      <div className="card ls narl">
        {rows.map(({ it, k, t, done, ok }) => (
          <button key={k} type="button" className="rlr cpr" disabled={!ok} style={{ width: "100%", textAlign: "left", opacity: ok ? 1 : 0.5, background: "none", border: 0, cursor: ok ? "pointer" : "default" }}
            onClick={() => ok && setSel((m) => ({ ...m, [k]: !m[k] }))}>
            <span style={{ flex: "0 0 22px", width: 22, height: 22, borderRadius: 7, border: "2px solid " + (sel[k] && ok ? "var(--orange, #f97316)" : "#cfc8bf"), background: sel[k] && ok ? "var(--orange, #f97316)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 10 }}>{sel[k] && ok ? <Check style={{ width: 15, height: 15, color: "#fff" }} /> : null}</span>
            <div className="t"><b>{t && t.code ? t.code + " · " : ""}{it.name || it.url || "Bewertung"} <RStars n={rvStars(it, t)} /></b>
              <span>{done ? "Schon abgerechnet" : t ? PT_L[t.status] || t.status : "Nicht beim Partner"}{!done ? ` · ${money(priceOf(it), c)}` : ""}</span></div>
          </button>
        ))}
        {!items.length ? <div className="aempty"><b>Keine Bewertungen</b>Am Auftrag ist nichts gespeichert.</div> : null}
      </div>
      <div className="natot"><span>{chosen.length} gelöscht · Betrag</span><b>{money(total, c)}</b></div>
      <p className="nasub" style={{ marginTop: 8 }}>
        {!info ? "Prüfe Zahlungsart …" : auto ? <><CreditCard style={{ width: 14, height: 14, verticalAlign: -2 }} /> Kunde hat eine Zahlungsart hinterlegt → wird sofort abgebucht, Rechnung geht automatisch per Mail.</>
          : <><Mail style={{ width: 14, height: 14, verticalAlign: -2 }} /> Keine Zahlungsart hinterlegt → Löschbestätigung + Rechnung {pref ? `(${pref}, −10 %)` : "mit Zahlungslink"} per Mail.</>}
      </p>
      <div className="nastick">
        <button type="button" className="cta or" disabled={busy || !chosen.length || !info} onClick={send}>{busy ? <Loader className="spin" /> : <Receipt />}{busy ? "Sendet …" : !chosen.length ? "Bewertung anhaken" : auto ? `Abbuchen · ${money(total, c)}` : `Rechnung senden · ${money(total, c)}`}</button>
      </div>
      {isDesk ? null : <div style={{ height: 8 }} />}
    </div>
  );
}
