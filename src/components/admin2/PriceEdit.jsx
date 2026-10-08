"use client";
/* Admin · Auftrag → „Preise anpassen": individueller Preis je Bewertung (leer = Preisliste) bzw. Profil-Preis.
   Genau dieser Betrag wird bei Löschung abgebucht und verrechnet. Bezahlte Bewertungen bleiben unverändert. */
import React from "react";
import { Tag, Loader, Check } from "lucide-react";
import { setOrderPricesApi } from "@/lib/admin-api";
import { reviewQuote } from "@/lib/pricing";
import { Nav, keyOf, RStars, rvStars } from "./OrdersScreens";
import { money } from "./model";

const num = (v) => { const n = Number(String(v || "").replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n * 100) / 100 : 0; };

export default function PriceEdit({ ctx, id }) {
  const { orders, back, isDesk, toast, refresh, ptasks } = ctx;
  const o = orders.find((x) => x.id === id);
  const isRev = o && o.service === "reviews";
  const items = (o && o.reviewItems) || [];
  const [all, setAll] = React.useState("");
  const [map, setMap] = React.useState(() => Object.fromEntries(items.filter((it) => Number(it.cp) > 0).map((it) => [keyOf(it), String(it.cp)])));
  const [prof, setProf] = React.useState(o ? String(o.amount || "") : "");
  const [busy, setBusy] = React.useState(false);
  if (!o) return <Nav back={back} isDesk={isDesk} />;
  const c = o.country === "US" ? "$" : "€";
  const ptBy = Object.fromEntries((ptasks[o.id] || []).map((t) => [t.itemKey, t]));
  const priced = items.map((it) => { const v = num(map[keyOf(it)]) || num(all); const { cp, ...rest } = it; return v ? { ...rest, cp: v } : rest; });
  const total = isRev ? reviewQuote(priced, "de").total : num(prof);
  const save = async () => {
    setBusy(true);
    try {
      const r = isRev
        ? await setOrderPricesApi({ orderId: o.id, prices: Object.fromEntries(items.map((it) => [keyOf(it), num(map[keyOf(it)]) || num(all) || null])) })
        : await setOrderPricesApi({ orderId: o.id, amount: num(prof) });
      toast(`Gespeichert · Bestellwert ${money(r.amount, c)}`);
      if (refresh) refresh(true);
      back();
    } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  return (
    <div className="naflow">
      <Nav back={back} isDesk={isDesk} />
      <div className="nah"><h1>Preise anpassen</h1></div>
      <p className="nasub">{o.id} · {o.profile || o.company || o.name} · Genau dieser Betrag wird bei Löschung abgebucht und verrechnet. Leer = Preisliste. Schon bezahlte Bewertungen bleiben unverändert.</p>
      {isRev ? (
        <>
          <label className="naf"><span>Preis für alle Bewertungen</span>
            <div className="usrch nain"><Tag /><input inputMode="decimal" placeholder="z. B. 149" value={all} onChange={(e) => { setAll(e.target.value); setMap({}); }} /><b className="curx">{c}</b></div></label>
          <div className="card ls narl">
            {items.map((it) => {
              const k = keyOf(it); const t = ptBy[k];
              return (
                <div key={k} className="rlr cpr">
                  <div className="t"><b>{t ? t.code + " · " : ""}{it.name || it.url || "Bewertung"} <RStars n={rvStars(it, t)} /></b><span>{it.nt || it.sw ? "Software · Preisliste 300" : it.old ? "älter 4 Wo. · Preisliste 229" : "Preisliste 179"}</span></div>
                  <div className="cpin"><input inputMode="decimal" placeholder={all || (it.nt || it.sw ? "300" : it.old ? "229" : "179")} value={map[k] || ""} onChange={(e) => { const v = e.target.value; setMap((m) => ({ ...m, [k]: v })); }} /><span>{c}</span></div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <label className="naf"><span>Preis des Auftrags</span>
          <div className="usrch nain"><Tag /><input inputMode="decimal" value={prof} onChange={(e) => setProf(e.target.value)} /><b className="curx">{c}</b></div></label>
      )}
      <div className="natot"><span>{isRev ? `${items.length} Bewertungen · Bestellwert` : "Bestellwert"}</span><b>{money(total || 0, c)}</b></div>
      <div className="nastick">
        <button type="button" className="cta or" disabled={busy || (!isRev && !num(prof))} onClick={save}>{busy ? <Loader className="spin" /> : <Check />}{busy ? "Speichert …" : "Preise speichern"}</button>
      </div>
      {isDesk ? null : <div style={{ height: 8 }} />}
    </div>
  );
}
