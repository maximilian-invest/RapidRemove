"use client";
/* „Neuer Auftrag" im Kunden-Dashboard (10/2026) – gleicher Verlauf wie die Bestellung auf der Website, nur ohne Formular
   (Name, E-Mail, Telefon kennen wir aus dem Konto):
     1) Profil   – eigene Profile (aus früheren Aufträgen) oder ein anderes über die Google-Suche
     2) Leistung – einzelne Bewertungen (nicht für DE/AT-Profile) oder das ganze Profil
     3) Bewertungen – Liste des Profils (1–3 ★ vorgefiltert, „Alle"), Preis je Bewertung, Mengenrabatt-Hinweis wie im Wizard
     4) Prüfen & beauftragen – Zusammenfassung, ggf. Wise/PayPal −10 % (außerhalb DACH), AGB + FAGG
   Danach öffnet das Dashboard den Start-Ablauf (Gründe → ggf. Nachweis → ggf. Zahlungsart).
   Gestaltung: dasselbe Gerüst wie der Start-Ablauf (.flow.sf) – Vollbild am Handy, Pop-up am Desktop. */
import React from "react";
import { X, ArrowLeft, ArrowRight, Check, Search, Store, Loader, MessageSquareOff, Trash2, Star, ChevronRight, MapPin } from "lucide-react";
import { searchProfiles, placesEnabled } from "@/lib/places";
import { reviewQuote, addrCountry, REVIEW_OLD_DAYS, REVIEW_OLD_SURCHARGE, REVIEW_NOTEXT_PRICE } from "@/lib/pricing";
import { AGB_CONSENT, FAGG_CONSENT } from "@/lib/consents";
import { pagePath } from "@/lib/page-routes";

const BASE = 179;
const ccOf = (p) => String((p && (p.cc || addrCountry(p.addr))) || "").toUpperCase();
const curOf = (p) => (ccOf(p) === "US" ? "usd" : "eur");
const methodOf = (r, cc) => (!String(r.text || "").trim() ? "sw" : !(r.days > REVIEW_OLD_DAYS) ? "std" : cc === "US" ? "sw" : "legal");
const priceOf = (m) => (m === "sw" ? REVIEW_NOTEXT_PRICE : m === "legal" ? BASE + REVIEW_OLD_SURCHARGE : BASE);
const NEXT_TIER = [[3, 10], [5, 15], [10, 30]];

function Stars({ n }) {
  if (!n) return null;
  return <span className="stars" aria-label={n + " stars"}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < n ? "f" : ""} />)}</span>;
}

/** Eigene Profile aus den bisherigen Aufträgen (neueste zuerst, ohne Doppelte). */
export function ownProfiles(orders) {
  const seen = new Set(), out = [];
  for (const o of orders || []) {
    const p = o.place; if (!p || !p.name) continue;
    const k = p.placeId || p.name.toLowerCase();
    if (seen.has(k)) continue; seen.add(k); out.push(p);
  }
  return out;
}

export default function NewOrder({ open, preset, orders, email, token, imp, lang, T, call, fmt, showToast, onClose, onDone }) {
  const [step, setStep] = React.useState("p");
  const [place, setPlace] = React.useState(null);
  const [service, setService] = React.useState(null);
  const [q, setQ] = React.useState("");
  const [res, setRes] = React.useState(null); // Suchergebnisse
  const [searching, setSearching] = React.useState(false);
  const [list, setList] = React.useState(null); // Bewertungen des Profils
  const [listErr, setListErr] = React.useState(false);
  const [payDisc, setPayDisc] = React.useState(false);
  const [filter, setFilter] = React.useState("low");
  const [pick, setPick] = React.useState([]);
  const [agb, setAgb] = React.useState(false);
  const [fagg, setFagg] = React.useState(false);
  const [cErr, setCErr] = React.useState("");
  const [payPref, setPayPref] = React.useState("none");
  const [busy, setBusy] = React.useState(false);
  const loadedFor = React.useRef("");
  const own = React.useMemo(() => ownProfiles(orders), [orders]);

  // Öffnen: zurücksetzen bzw. mit Vorauswahl (Karte „neue negative Bewertung") direkt zu den Bewertungen.
  React.useEffect(() => {
    if (!open) return;
    setQ(""); setRes(null); setSearching(false); setFilter("low"); setAgb(false); setFagg(false); setCErr(""); setPayPref("none"); setBusy(false);
    if (preset && preset.place) { setPlace(preset.place); setService("reviews"); setPick(preset.ids || []); setStep("r"); }
    else { setPlace(own.length === 1 ? own[0] : null); setService(null); setPick([]); setStep("p"); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Google-Suche (wie Schritt „Profilsuche" auf der Website), 300 ms entprellt
  React.useEffect(() => {
    if (!open || step !== "p") return undefined;
    const term = q.trim();
    if (term.length < 3 || !placesEnabled()) { setRes(null); setSearching(false); return undefined; }
    setSearching(true);
    let off = false;
    const t = setTimeout(() => {
      searchProfiles(term, lang).then((r) => { if (!off) setRes((r || []).slice(0, 5)); }).catch(() => { if (!off) setRes([]); }).finally(() => { if (!off) setSearching(false); });
    }, 300);
    return () => { off = true; clearTimeout(t); };
  }, [q, open, step, lang]);

  // Bewertungen des Profils laden (einmal je Profil)
  React.useEffect(() => {
    if (!open || step !== "r" || !place || !place.placeId) return;
    if (loadedFor.current === place.placeId && list) return;
    loadedFor.current = place.placeId; setList(null); setListErr(false);
    call("new/reviews", { token, placeId: place.placeId, lang })
      .then((r) => { setList((r.reviews || []).slice().sort((a, b) => a.rating - b.rating || a.days - b.days)); setPayDisc(!!r.payDisc); })
      .catch(() => { setList([]); setListErr(true); });
  }, [open, step, place, token, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return <section className="flow" aria-hidden="true" />;
  const cc = ccOf(place), cur = curOf(place), dach = ["DE", "AT", "CH"].includes(cc);
  const revOk = !!place && !!place.placeId && cc !== "DE" && cc !== "AT";
  const steps = service === "remove" ? ["p", "s", "c"] : ["p", "s", "r", "c"];
  const si = steps.indexOf(step);
  const label = { p: T("nwPhP"), s: T("nwPhS"), r: T("nwPhR"), c: T("nwPhC") };
  const sel = (list || []).filter((r) => pick.includes(r.id));
  const items = sel.map((r) => { const m = methodOf(r, cc); return { old: r.days > REVIEW_OLD_DAYS && m !== "sw", nt: !String(r.text || "").trim(), sw: m === "sw" }; });
  const quote = reviewQuote(items, cur === "usd" ? "en" : "de");
  const profAmt = cc === "US" ? 495 : 450;
  const nextTier = NEXT_TIER.find(([n]) => sel.length < n);
  const nudge = sel.length >= 2 && nextTier ? T("nwNudge", { n: nextTier[0] - sel.length, pct: nextTier[1] }) : "";
  const go = (s) => setStep(s);
  const back = () => { if (si > 0) go(steps[si - 1]); };
  const choosePlace = (p) => { setPlace(p); setPick([]); setList(null); loadedFor.current = ""; go("s"); };
  const chooseService = (s) => { setService(s); go(s === "reviews" ? "r" : "c"); };
  const ago = (d) => (d == null || d < 0 ? "" : d < 1 ? T("nwToday") : d < 14 ? T("nwDays", { n: d }) : d < 60 ? T("nwWeeks", { n: Math.round(d / 7) }) : T("nwMonths", { n: Math.round(d / 30) }));
  const ag = AGB_CONSENT[lang] || AGB_CONSENT.en, fg = FAGG_CONSENT[lang] || FAGG_CONSENT.en;

  const submit = async () => {
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    if (!agb) { setCErr(ag.err); return; }
    if (!fagg) { setCErr(fg.err); return; }
    setBusy(true); setCErr("");
    try {
      const r = await call("new/order", { token, lang, service, agb: true, fagg: true, payPref: !dach && payDisc ? payPref : "none", ids: service === "reviews" ? pick : [],
        place: { placeId: place.placeId || "", name: place.name, addr: place.addr || "", mapsUri: place.mapsUri || "", cc } });
      onDone(r.orderId, service, service === "reviews" ? pick : []);
    } catch (e) {
      setBusy(false);
      if (e.code === "already_ordered") { showToast(T("nwDup"), true); go("r"); return; }
      showToast(T("genericErr"), true);
    }
  };

  let body = null, foot = null;
  if (step === "p") {
    const Row = ({ p }) => (
      <button type="button" className={"nw-pf" + (place && (place.placeId ? place.placeId === p.placeId : place.name === p.name) ? " on" : "")} onClick={() => choosePlace(p)}>
        <span className="ico"><Store /></span>
        <span className="t"><b>{p.name}</b>{p.addr ? <span>{p.addr}</span> : null}</span>
        <ChevronRight />
      </button>
    );
    body = (
      <>
        <div className="fl-k">{T("stStep", { i: 1, n: steps.length })} · {label.p}</div>
        <h2>{T("nwPH")}</h2>
        {own.length ? <><div className="nw-sec">{T("nwPP")}</div><div className="nw-list">{own.map((p) => <Row key={p.placeId || p.name} p={p} />)}</div></> : null}
        <div className="nw-sec">{own.length ? T("nwSearchK") : T("nwPhP")}</div>
        <label className="nw-search"><Search /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("nwSearchPh")} autoComplete="off" enterKeyHint="search" /></label>
        {searching ? <div className="nw-hint"><Loader className="spin" />{T("nwSearching")}</div> : null}
        {res && !searching ? (res.length ? <div className="nw-list">{res.map((p) => <Row key={p.placeId} p={{ placeId: p.placeId, name: p.name, addr: p.addr, cc: p.cc || "", mapsUri: p.mapsUri || "" }} />)}</div> : <div className="nw-hint">{T("nwNoRes")}</div>) : null}
      </>
    );
  } else if (step === "s") {
    body = (
      <>
        <div className="fl-k">{T("stStep", { i: 2, n: steps.length })} · {label.s}</div>
        <h2>{T("nwSH")}</h2>
        <div className="nw-place"><MapPin /><span><b>{place && place.name}</b>{place && place.addr ? <span>{place.addr}</span> : null}</span></div>
        <div className="nw-svc">
          <button type="button" className={"nw-sv" + (service === "reviews" ? " on" : "")} disabled={!revOk} onClick={() => chooseService("reviews")}>
            <span className="ico"><MessageSquareOff /></span>
            <span className="t"><b>{T("nwRev")}</b><span>{revOk ? T("nwRevS", { price: fmt(BASE, cur) }) : T("nwRevNo")}</span></span>
            <ArrowRight />
          </button>
          <button type="button" className={"nw-sv" + (service === "remove" ? " on" : "")} onClick={() => chooseService("remove")}>
            <span className="ico"><Trash2 /></span>
            <span className="t"><b>{T("nwProf")}</b><span>{T("nwProfS", { price: fmt(profAmt, cur) })}</span></span>
            <ArrowRight />
          </button>
        </div>
      </>
    );
    foot = <div className="fl-foot sf-foot"><div className="sf-row"><button className="bk" onClick={back} aria-label="Back"><ArrowLeft /></button></div></div>;
  } else if (step === "r") {
    const shown = (list || []).filter((r) => filter === "all" || (r.rating >= 1 && r.rating <= 3));
    body = (
      <>
        <div className="fl-k">{T("stStep", { i: 3, n: steps.length })} · {label.r}</div>
        <h2>{T("nwRH")}</h2>
        <div className="nw-place sm"><MapPin /><span><b>{place && place.name}</b></span></div>
        <div className="chips nw-chips">
          {[["low", T("nwF13")], ["all", T("nwFAll")]].map(([k, l]) => <button key={k} type="button" className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>)}
        </div>
        {list === null ? <div className="nw-hint big"><Loader className="spin" />{T("nwLoad")}</div>
          : listErr ? <div className="note bad">{T("nwErr")}</div>
          : !shown.length ? <div className="nw-hint big">{T("nwEmpty")}</div>
          : (
            <div className="ar-list nw-rv">
              {shown.map((r) => {
                const on = pick.includes(r.id), m = methodOf(r, cc);
                return (
                  <button key={r.id} type="button" disabled={r.ordered} className={"ar-row" + (on ? " on" : "") + (r.ordered ? " dis" : "")} onClick={() => setPick((x) => (on ? x.filter((y) => y !== r.id) : [...x, r.id]))}>
                    <span className="cb">{on || r.ordered ? <Check /> : null}</span>
                    <span className="t">
                      <span className="a">{r.name}<Stars n={r.rating} /><span className="nw-age">{ago(r.days)}</span></span>
                      <span className={"x" + (r.text ? "" : " none")}>{r.text || T("noText")}</span>
                      {r.ordered ? <span className="in">{T("nwOrdered")}</span>
                        : <span className={"nw-m m-" + m}>{m === "sw" ? T("nwSw", { price: fmt(REVIEW_NOTEXT_PRICE, cur) }) : m === "legal" ? T("nwOld", { price: fmt(priceOf(m), cur) }) : T("nwStd", { price: fmt(BASE, cur) })}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
      </>
    );
    foot = (
      <div className="fl-foot sf-foot">
        {sel.length ? (
          <div className="nw-bar">
            <span><b>{T("nwSel", { n: sel.length })}</b>{quote.pct ? <em>−{quote.pct} %</em> : null}{nudge ? <small>{nudge}</small> : null}</span>
            <b className="v">{fmt(quote.total, cur)}</b>
          </div>
        ) : null}
        <div className="sf-row"><button className="bk" onClick={back} aria-label="Back"><ArrowLeft /></button>
          <button className="cta" disabled={!sel.length} onClick={() => go("c")}>{T("nwNext")}<ArrowRight /></button></div>
      </div>
    );
  } else if (step === "c") {
    const rows = service === "reviews" ? [
      quote.nNew ? [T("nwSumNew", { n: quote.nNew }), fmt(quote.nNew * BASE, cur)] : null,
      quote.nOld ? [T("nwSumOld", { n: quote.nOld }), fmt(quote.nOld * (BASE + REVIEW_OLD_SURCHARGE), cur)] : null,
      quote.nNt ? [T("nwSumSw", { n: quote.nNt }), fmt(quote.nNt * REVIEW_NOTEXT_PRICE, cur)] : null,
      quote.pct ? [T("nwSumDisc", { pct: quote.pct }), "−" + fmt(quote.discount, cur)] : null,
    ].filter(Boolean) : [[T("nwSumProf"), fmt(profAmt, cur)]];
    const total = service === "reviews" ? quote.total : profAmt;
    body = (
      <>
        <div className="fl-k">{T("stStep", { i: steps.length, n: steps.length })} · {label.c}</div>
        <h2>{T("nwCH")}</h2>
        <div className="nw-sum">
          <div className="nw-place"><MapPin /><span><b>{place && place.name}</b>{place && place.addr ? <span>{place.addr}</span> : null}</span></div>
          {service === "reviews" ? <div className="nw-picked">{sel.map((r) => <div key={r.id}><b>{r.name}</b><Stars n={r.rating} /></div>)}</div> : null}
          <div className="nw-rows">{rows.map(([l, v], i) => <div key={i}><span>{l}</span><span>{v}</span></div>)}</div>
          <div className="totl"><span>{T("nwSumMax")}</span><b>{fmt(total, cur)}</b></div>
          <p className="nw-note">{service === "reviews" ? T("nwSumNote") : T("nwSumProfNote")}</p>
        </div>
        {!dach && payDisc && service === "reviews" ? (
          <>
            <div className="nw-sec">{T("nwPay")}</div>
            <div className="chips nw-pay">{[["none", T("nwPayStd")], ["wise", T("nwPayWise")], ["paypal", T("nwPayPP")]].map(([k, l]) => <button key={k} type="button" className={"chip" + (payPref === k ? " on" : "")} onClick={() => setPayPref(k)}>{l}</button>)}</div>
          </>
        ) : null}
        <p className="nw-for">{T("nwFor", { email })}</p>
        <div className={"nw-cons" + (cErr ? " err" : "")}>
          <label><input type="checkbox" checked={agb} onChange={(e) => { setAgb(e.target.checked); setCErr(""); }} />
            <span>{ag.pre}<a href={pagePath("agb", lang)} target="_blank" rel="noopener noreferrer">{ag.agb}</a>{ag.mid}<a href={pagePath("widerruf", lang)} target="_blank" rel="noopener noreferrer">{ag.wid}</a>{ag.post}</span></label>
          <label><input type="checkbox" checked={fagg} onChange={(e) => { setFagg(e.target.checked); setCErr(""); }} /><span>{fg.txt}</span></label>
          {cErr ? <div className="nw-err">{cErr}</div> : null}
        </div>
      </>
    );
    foot = (
      <div className="fl-foot sf-foot pgf">
        <div className="sf-row"><button className="bk" onClick={back} aria-label="Back"><ArrowLeft /></button>
          <button className="cta or" disabled={busy} onClick={submit}>{busy ? <Loader className="spin" /> : <Check />}{T("nwSubmit")}</button></div>
      </div>
    );
  }
  return (
    <section className="flow sf nw show" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="fl-card" key={step}>
        <div className="fl-top">
          <button className="x" onClick={onClose} disabled={busy} aria-label="Close"><X /></button>
          <div className="fl-bar sf-bar">{steps.map((s, i) => <i key={s}><b style={{ width: i < si ? "100%" : i === si ? "50%" : "0%" }} /></i>)}</div>
        </div>
        <div className="fl-body sf-in">{body}</div>
        {foot}
      </div>
    </section>
  );
}
