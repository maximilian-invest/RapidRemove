"use client";
/* Bestellen direkt im Website-Chat: Angebotskarte (Preis, Rabatt-Badge) + Bestellformular mit AGB/Datenschutz.
   Der Rabatt wird NUR serverseitig aus dem Chat-Angebot übernommen (/chat/site/order) – hier nur angezeigt. */
import React from "react";
import { ShieldCheck, Sparkles, Check, Plus, X, Store, Star, ArrowRight, Loader2, Lock, Trash2 } from "lucide-react";
import { CO, COUNTRIES } from "@/components/sitechat-co-i18n";
import { pagePath } from "@/lib/page-routes";
import { vatNote, PRICE_V2_FRESH, fromPrice, profilePriceFor, reviewPauseText, reviewPauseErr } from "@/lib/pricing";
import { fetchPayDiscount, findReviewByLink, fetchFreshPrice, fetchPriceQuote } from "@/lib/order";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const volPct = (n) => (n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0);
const fmt = (v, usd) => { const n = Math.round(v * 100) / 100; const s = Number.isInteger(n) ? String(n) : n.toFixed(2); return usd ? "$" + s : s.replace(".", ",") + " €"; };

/** Preisrechnung wie am Server (Profil: Festpreis; Bewertungen – 199 bis 4 Wochen mit Text; ältere/ohne Text seit 05.11.2026 pausiert, zählen nicht),
 *  Mengen- oder Chat-Rabatt, der höhere; PayPal/Wise −10 % statt Chat-Rabatt). */
/** unit = Frisch-Preis je Bewertung für dieses Profil/diesen Kunden (Land × Branche, vom Server via /price-quote), Standard 199. */
export function priceOf({ service, country, pct = 0, reviews = [], payPref = "none", unit = PRICE_V2_FRESH, prem = false }) {
  const usd = country === "US";
  const pp = payPref === "wise" || payPref === "paypal";
  if (service === "reviews") {
    const nPaused = reviews.filter((r) => r.sw || r.age === "old").length; // älter als 4 Wochen oder ohne Text → pausiert (Januar 2027)
    const n250 = 0, nSw = 0;
    const n = Math.max(1, reviews.length - nPaused);
    const sub = n * unit;
    const vp = volPct(n), cp = pp ? 0 : pct;
    const d = Math.max(vp, cp);
    let total = Math.round((sub * (100 - d)) / 100);
    const payD = pp ? Math.round(total * 0.1) : 0;
    total -= payD;
    return { usd, sub, d, dKind: d === 0 ? "" : cp >= vp ? "chat" : "vol", payD, total, unit, nSw, n250, nPaused };
  }
  const base = profilePriceFor(service, usd ? "usd" : "eur", prem); // Premium-Branche (06.11.2026): Server bestätigt über /price-quote
  const cp = pp ? 0 : pct;
  let total = Math.round(base * (100 - cp)) / 100;
  const payD = pp ? Math.round(base * 0.1 * 100) / 100 : 0;
  total = Math.round((total - payD) * 100) / 100;
  return { usd, sub: base, d: cp, dKind: cp ? "chat" : "", payD, total };
}

export function OfferCard({ co, lang, onOrder, ordered }) {
  const c = CO[lang] || CO.en;
  const p = priceOf({ ...co, reviews: co.service === "reviews" ? [{ age: "new" }] : [] });
  const Icon = co.service === "reviews" ? Star : Store;
  return (
    <div className={"sc-offer" + (ordered ? " done" : "")}>
      {co.pct ? <span className="so-badge"><Sparkles />−{co.pct} %</span> : null}
      <div className="so-h"><span className="so-ic"><Icon /></span><b>{c.svc[co.service]}</b></div>
      <div className="so-p">
        {co.service === "reviews"
          ? <><s className={co.pct ? "" : "hide"}>{fmt(PRICE_V2_FRESH, p.usd)}</s><b>{co.pct ? fmt(Math.round(PRICE_V2_FRESH * (100 - (co.pct || 0)) / 100), p.usd) : fromPrice(lang, fmt(PRICE_V2_FRESH, p.usd))}</b><span>{c.perRev} · {vatNote(lang)}</span></>
          : <>{co.pct ? <s>{fmt(p.sub, p.usd)}</s> : null}<b>{co.pct ? fmt(p.total, p.usd) : fromPrice(lang, fmt(p.total, p.usd))}</b><span>{vatNote(lang)}</span></>}
      </div>
      <div className="so-f"><ShieldCheck />{c.after}</div>
      {ordered
        ? <div className="so-ok"><Check />#{ordered}</div>
        : <button type="button" className="so-btn" onClick={onOrder}>{c.order}<ArrowRight /></button>}
    </div>
  );
}

export function Checkout({ co, lang, sid, onClose, onDone }) {
  const c = CO[lang] || CO.en;
  const [f, setF] = React.useState({ name: "", email: "", phone: "", company: co.company || "", profileLink: "", country: co.country || "", payPref: "none", agb: false, pol: false });
  const [revs, setRevs] = React.useState(() => (co.items && co.items.length
    ? co.items.map((r) => ({ url: r.link || r.url || "", age: r.days >= 28 ? "old" : "new", name: r.name || "", text: r.text || "", rating: r.rating || 0, days: r.days, fixed: true }))
    : [{ url: "", age: "new" }]));
  const [bad, setBad] = React.useState({});
  // Per Hand eingefügte Links auflösen → Sterne/Text/Alter bekannt → richtiger Preis (ohne Text = Software 300) schon vor dem Bestellen
  React.useEffect(() => {
    revs.forEach((r, i) => {
      const u = String(r.url || "").trim();
      if (r.fixed || r.chk === u || !/^https?:\/\/\S{8,}$/i.test(u)) return;
      setRevs((l) => l.map((x, k) => (k === i ? { ...x, chk: u, busy: true } : x)));
      findReviewByLink("", u, lang).then((rv) => {
        setRevs((l) => l.map((x) => (String(x.url || "").trim() === u && !x.fixed ? { ...x, busy: false, fixed: true, name: rv.name || "", text: rv.text || "", rating: rv.rating || 0, days: rv.days, age: rv.days >= 28 ? "old" : "new" } : x)));
      }).catch(() => setRevs((l) => l.map((x) => (String(x.url || "").trim() === u ? { ...x, busy: false } : x))));
    });
  }, [revs.map((r) => (r.fixed ? "" : String(r.url || "").trim())).join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState(null);
  const set = (k) => (e) => { const v = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e; setF((x) => ({ ...x, [k]: v })); setBad((b) => ({ ...b, [k]: false })); setErr(""); };
  const isRev = co.service === "reviews";
  // Alte Bewertungen mit Text aus einem US-Profil → Software (Partner-Regel); Land kommt aus dem Profil-Link.
  // Ohne Text (aufgelöste Bewertung mit Sternen, aber leerem Text) = immer Software (300).
  const swOf = (r) => (r.fixed && Number(r.rating) >= 1 && !String(r.text || "").trim()) || (co.placeCountry === "US" && r.age === "old" && !!String(r.text || "").trim());
  // Bewertungen: Währung nach Land des Profils (aus dem Link), sonst nach dem angegebenen Land.
  // PayPal/Wise −10 % nur außerhalb von DACH (DE/AT/CH) – dort gibt es die Auswahl gar nicht.
  const [disc, setDisc] = React.useState({ reviews: true, profiles: true }); // Admin → Einstellungen: PayPal/Wise −10 % je Kategorie
  React.useEffect(() => { fetchPayDiscount().then(setDisc).catch(() => {}); }, []);
  const discOff = !(isRev ? disc.reviews : disc.profiles);
  const dach = discOff || ["DE", "AT", "CH"].includes(f.country) || ["DE", "AT", "CH"].includes(co.placeCountry || ""); // dach = keine PayPal/Wise-Auswahl
  const payPref = dach ? "none" : f.payPref;
  // Preis nach Land × Branche: der Server nennt den Frisch-Preis für dieses Profil (+ E-Mail: Bestandskunden 199).
  const [unit, setUnit] = React.useState(PRICE_V2_FRESH);
  const emOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()) ? f.email.trim().toLowerCase() : "";
  React.useEffect(() => {
    if (!isRev) return undefined;
    let live = true;
    const t = setTimeout(() => { fetchFreshPrice({ placeId: co.placeId || "", country: co.placeCountry || "", email: emOk }).then((v) => { if (live && v) setUnit(v); }); }, emOk ? 500 : 0);
    return () => { live = false; clearTimeout(t); };
  }, [isRev, co.placeId, co.placeCountry, emOk]);
  // Profil-Löschung: Preis nach Branche über den eingefügten Profil-Link (Server löst ihn auf; ohne Link = Standardpreis, wie am Server).
  const [prem, setPrem] = React.useState(false);
  const linkOk = !isRev && /^https?:\/\/\S+$/i.test(f.profileLink.trim()) ? f.profileLink.trim() : "";
  React.useEffect(() => {
    if (isRev) return undefined;
    if (!linkOk) { setPrem(false); return undefined; }
    let live = true;
    const t = setTimeout(() => { fetchPriceQuote({ link: linkOk, email: emOk }).then((q) => { if (live) setPrem(!!(q && q.pp)); }); }, 600);
    return () => { live = false; clearTimeout(t); };
  }, [isRev, linkOk, emOk]);
  const p = priceOf({ service: co.service, country: (isRev && co.placeCountry) || f.country, pct: co.pct, reviews: revs.map((r) => ({ ...r, sw: swOf(r) })), payPref, unit, prem });
  const legal = (k) => pagePath(k, lang);
  const submit = async () => {
    const b = {};
    if (f.name.trim().length < 2) b.name = 1;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) b.email = 1;
    if (!f.country) b.country = 1;
    if (isRev) { if (!revs.some((r) => /^https?:\/\//i.test(r.url.trim()))) b.revs = 1; if (f.country === "DE" || f.country === "AT") { setErr(c.errDach); setBad({ ...b, country: 1 }); return; } if (p.nPaused) { setErr(reviewPauseErr(lang)); setBad({ ...b, revs: 1 }); return; } }
    else if (!/^https?:\/\//i.test(f.profileLink.trim()) && f.company.trim().length < 2) b.profileLink = 1;
    if (!f.agb) b.agb = 1;
    setBad(b);
    if (Object.keys(b).length) { setErr(c.errFill); return; }
    setErr(""); setBusy(true);
    try {
      const res = await fetch(OPS + "/chat/site/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        sid, service: co.service, name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), company: f.company.trim(), profileLink: f.profileLink.trim(),
        country: f.country === "OTHER" ? "XX" : f.country, lang, payPref, agb: true, page: window.location.pathname, placeCountry: co.placeCountry || "", placeId: co.placeId || "",
        reviews: isRev ? revs.filter((r) => r.url.trim()).map((r) => ({ url: r.url.trim(), age: r.age, name: r.name || "", text: r.text || "", rating: r.rating || 0, days: r.days })) : [],
      }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) { setErr(j.error === "already_ordered" ? c.errDup : j.error === "reviews_dach" ? c.errDach : j.error === "reviews_paused" ? reviewPauseErr(lang) : c.errGen); setBusy(false); return; }
      setOk({ id: j.orderId, email: f.email.trim() });
      try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "order", transaction_id: j.orderId, value: p.total, currency: p.usd ? "USD" : "EUR", source: "chat" }); } catch (e) { /* */ }
      setTimeout(() => onDone(j.orderId, f.email.trim()), 2600);
    } catch (e) { setErr(c.errGen); }
    setBusy(false);
  };
  if (ok) {
    return (
      <div className="sc-co ok">
        <div className="co-ok">
          <svg className="ce-check" viewBox="0 0 120 120"><circle className="ce-c" cx="60" cy="60" r="46" pathLength="100" /><path className="ce-p" d="M40 62 L54 76 L82 46" pathLength="100" /></svg>
          <b>{c.okT}</b><span>#{ok.id}</span><p>{c.okS.replace("{email}", ok.email)}</p>
        </div>
      </div>
    );
  }
  const F = (k, label, props = {}) => (
    <label className={"co-f" + (bad[k] ? " bad" : "")}><span>{label}</span><input value={f[k]} onChange={set(k)} {...props} /></label>
  );
  return (
    <div className="sc-co">
      <div className="co-top"><b>{c.title}</b><button type="button" onClick={onClose} aria-label={c.back}><X /></button></div>
      <div className="co-body">
        <div className="co-sum">
          <div className="cs-h"><span>{c.svc[co.service]}</span>{co.pct && payPref === "none" ? <em><Sparkles />−{co.pct} %</em> : null}</div>
          {isRev ? <div className="cs-r"><span>{`${revs.length - p.nPaused} × ${fmt(p.unit, p.usd)}`}</span><span>{fmt(revs.length - p.nPaused ? p.sub : 0, p.usd)}</span></div> : <div className="cs-r"><span>{c.svc[co.service]}</span><span>{fmt(p.sub, p.usd)}</span></div>}
          {p.d ? <div className="cs-r dc"><span>{p.dKind === "vol" ? c.volDisc : c.chatDisc} −{p.d} %</span><span>−{fmt(p.sub - (isRev ? Math.round((p.sub * (100 - p.d)) / 100) : Math.round(p.sub * (100 - p.d)) / 100), p.usd)}</span></div> : null}
          {p.payD ? <div className="cs-r dc"><span>{c.payDisc} −10 %</span><span>−{fmt(p.payD, p.usd)}</span></div> : null}
          <div className="cs-t"><span>{isRev ? c.maxTotal : c.total} · {vatNote(lang)}</span><b key={p.total}>{fmt(p.total, p.usd)}</b></div>
          <div className="cs-n"><ShieldCheck />{c.note}</div>
        </div>

        {isRev ? (
          <div className={"co-revs" + (bad.revs ? " bad" : "")}>
            <span className="co-l">{c.reviews}</span>
            {revs.map((r, i) => (
              <div key={i} className="co-rev">
                {r.fixed ? <div className="co-rv"><b>{r.name || "Google"}</b><Stars n={r.rating} />{swOf(r) || r.age === "old" ? <i className="co-swt pz">{reviewPauseText(lang)}</i> : null}{r.text ? <span>„{r.text.slice(0, 90)}{r.text.length > 90 ? "…" : ""}“</span> : null}</div> : <input value={r.url} placeholder={c.phReview} inputMode="url" onChange={(e) => { const v = e.target.value; setRevs((l) => l.map((x, k) => (k === i ? { ...x, url: v } : x))); setBad((b) => ({ ...b, revs: false })); }} />}
                {!r.fixed && r.busy ? <div className="co-busy"><Loader2 className="spin" />{lang === "de" ? "Bewertung wird geprüft …" : "Checking the review …"}</div> : null}
                <div className="co-age">
                  {[["new", c.ageNew], ["old", c.ageOld]].map(([k, l]) => <button key={k} type="button" className={r.age === k ? "on" : ""} onClick={() => setRevs((x) => x.map((y, n) => (n === i ? { ...y, age: k } : y)))}>{l}</button>)}
                  {revs.length > 1 ? <button type="button" className="rm" aria-label="−" onClick={() => setRevs((x) => x.filter((_, n) => n !== i))}><Trash2 /></button> : null}
                </div>
              </div>
            ))}
            {revs.length < 20 ? <button type="button" className="co-add" onClick={() => setRevs((x) => [...x, { url: "", age: "new" }])}><Plus />{c.addRev}</button> : null}
            {F("company", c.company, { autoComplete: "organization" })}
          </div>
        ) : (
          <>
            {F("profileLink", c.profile, { placeholder: c.phProfile, inputMode: "url" })}
            {F("company", c.company, { autoComplete: "organization" })}
          </>
        )}
        <label className={"co-f" + (bad.country ? " bad" : "")}><span>Land / Country</span>
          <select value={f.country} onChange={set("country")}>
            <option value="">—</option>
            {COUNTRIES.map((k) => <option key={k} value={k}>{k === "OTHER" ? "…" : (() => { try { return new Intl.DisplayNames([lang], { type: "region" }).of(k); } catch (e) { return k; } })()}</option>)}
          </select>
        </label>
        {F("name", c.name, { autoComplete: "name" })}
        {F("email", c.email, { type: "email", autoComplete: "email", inputMode: "email" })}
        {F("phone", c.phone, { type: "tel", autoComplete: "tel" })}
        {dach ? null : (<>
        <span className="co-l">{c.pay}</span>
        <div className="co-pay">
          {[["none", c.card], ["paypal", "PayPal −10 %"], ["wise", "Wise −10 %"]].map(([k, l]) => <button key={k} type="button" className={f.payPref === k ? "on" : ""} onClick={() => set("payPref")(k)}>{l}</button>)}
        </div>
        </>)}
        <label className={"co-agb" + (bad.agb ? " bad" : "")}>
          <input type="checkbox" checked={f.agb} onChange={set("agb")} />
          <span>{c.agb1} <a href={legal("agb")} target="_blank" rel="noopener noreferrer">{c.agbL}</a> {c.agb2} <a href={legal("datenschutz")} target="_blank" rel="noopener noreferrer">{c.dsL}</a> {c.agb3}</span>
        </label>
        {err ? <div className="co-err">{err}</div> : null}
      </div>
      <div className="co-foot">
        <button type="button" className="co-buy" disabled={busy} onClick={submit}>{busy ? <><Loader2 className="spin" />{c.sending}</> : <><Lock />{c.buy} · {fmt(p.total, p.usd)}</>}</button>
        <button type="button" className="co-back" onClick={onClose}>{c.back}</button>
      </div>
    </div>
  );
}

/* ---------- Bewertungen aus einem Google-Profil auswählen ---------- */
const ago = (days, lang) => {
  if (days == null || days < 0) return "";
  try {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    return days < 1 ? rtf.format(0, "day") : days < 30 ? rtf.format(-days, "day") : days < 365 ? rtf.format(-Math.round(days / 30), "month") : rtf.format(-Math.round(days / 365), "year");
  } catch (e) { return days + " d"; }
};
export const Stars = ({ n }) => (n ? <span className="pk-st">{"★".repeat(n)}<i>{"★".repeat(5 - n)}</i></span> : null);

/** Pause 05.11.2026: älter als 4 Wochen oder ohne Text → nicht wählbar. */
const pausedR = (r) => !String(r.text || "").trim() || Number(r.days) >= 28;
export function ReviewPicker({ pick, lang, P, onNext, done }) {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(() => new Set());
  const list = pick.reviews.filter((r) => !q.trim() || `${r.name} ${r.text}`.toLowerCase().includes(q.trim().toLowerCase()));
  const tog = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div className={"sc-pick" + (done ? " done" : "")}>
      <div className="pk-h"><span className="so-ic"><Store /></span><span><b>{pick.place.name}</b><small>{pick.place.address}</small></span></div>
      <input className="pk-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={P.search} disabled={done} />
      <div className="pk-l">
        {list.length ? list.map((r) => (
          <button key={r.id} type="button" className={"pk-r" + (sel.has(r.id) ? " on" : "") + (pausedR(r) ? " paused" : "")} onClick={() => !done && !pausedR(r) && tog(r.id)} aria-disabled={pausedR(r) || undefined}>
            <span className="pk-c">{sel.has(r.id) ? <Check /> : null}</span>
            <span className="pk-t"><span className="l1"><b>{r.name}</b><Stars n={r.rating} /></span><span className="l2">{r.text || "—"}</span><span className="l3">{ago(r.days, lang)}</span>{pausedR(r) ? <span className="pk-pz">{reviewPauseText(lang)}</span> : null}</span>
          </button>
        )) : <div className="pk-none">{P.none}</div>}
      </div>
      <div className="pk-f"><small>{P.notIn}</small>
        <button type="button" className="so-btn" disabled={!sel.size || done} onClick={() => onNext(pick.reviews.filter((r) => sel.has(r.id)))}>{sel.size ? P.sel.replace("{n}", sel.size) + " · " : ""}{P.next}<ArrowRight /></button>
      </div>
    </div>
  );
}

export function ConfirmCard({ conf, lang, P, onYes, onNo, done }) {
  return (
    <div className={"sc-conf" + (done ? " done" : "")}>
      <b>{P.conf.replace("{n}", conf.items.length)}</b>
      <div className="cf-l">{conf.items.map((r, i) => (
        <div key={i} className="cf-r"><span className="l1"><b>{r.name || P.unk + " " + (i + 1)}</b><Stars n={r.rating} /><em>{ago(r.days, lang)}</em></span>{r.text ? <span className="l2">„{r.text}“</span> : null}</div>
      ))}</div>
      {conf.nt ? <p className="cf-nt">{P.nt.replace("{n}", conf.nt)}</p> : null}
      {done ? null : <div className="cf-b"><button type="button" className="so-btn" onClick={onYes}><Check />{P.yes}</button><button type="button" className="cf-no" onClick={onNo}>{P.no}</button></div>}
    </div>
  );
}
