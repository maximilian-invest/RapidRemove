"use client";
/* Bestellen direkt im Website-Chat: Angebotskarte (Preis, Rabatt-Badge) + Bestellformular mit AGB/Datenschutz.
   Der Rabatt wird NUR serverseitig aus dem Chat-Angebot übernommen (/chat/site/order) – hier nur angezeigt. */
import React from "react";
import { ShieldCheck, Sparkles, Check, Plus, X, Store, Star, ArrowRight, Loader2, Lock, Trash2 } from "lucide-react";
import { CO, COUNTRIES } from "@/components/sitechat-co-i18n";
import { pagePath } from "@/lib/page-routes";
import { fetchPayDiscount } from "@/lib/order";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const volPct = (n) => (n >= 10 ? 30 : n >= 5 ? 15 : n >= 3 ? 10 : 0);
const fmt = (v, usd) => { const n = Math.round(v * 100) / 100; const s = Number.isInteger(n) ? String(n) : n.toFixed(2); return usd ? "$" + s : s.replace(".", ",") + " €"; };

/** Preisrechnung wie am Server (Profil: Festpreis; Bewertungen: 179/229, Mengen- oder Chat-Rabatt, der höhere; PayPal/Wise −10 % statt Chat-Rabatt). */
export function priceOf({ service, country, pct = 0, reviews = [], payPref = "none" }) {
  const usd = country === "US";
  const pp = payPref === "wise" || payPref === "paypal";
  if (service === "reviews") {
    const n = Math.max(1, reviews.length);
    const nSw = reviews.filter((r) => r.sw).length; // Software-Fälle: 300, nach Prüfung durch den Partner – abgebucht erst bei erfolgreicher Löschung
    const nOld = reviews.filter((r) => r.age === "old" && !r.sw).length;
    const sub = (n - nOld - nSw) * 179 + nOld * 229 + nSw * 300;
    const vp = volPct(n), cp = pp ? 0 : pct;
    const d = Math.max(vp, cp);
    let total = Math.round((sub * (100 - d)) / 100);
    const payD = pp ? Math.round(total * 0.1) : 0;
    total -= payD;
    return { usd, sub, d, dKind: d === 0 ? "" : cp >= vp ? "chat" : "vol", payD, total, unit: 179, unitOld: 229, nSw };
  }
  const base = service === "reset" ? (usd ? 950 : 850) : (usd ? 495 : 450);
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
          ? <><s className={co.pct ? "" : "hide"}>{fmt(179, p.usd)}</s><b>{fmt(Math.round(179 * (100 - (co.pct || 0)) / 100), p.usd)}</b><span>{c.perRev}</span></>
          : <>{co.pct ? <s>{fmt(p.sub, p.usd)}</s> : null}<b>{fmt(p.total, p.usd)}</b></>}
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
    ? co.items.map((r) => ({ url: r.link || r.url || "", age: r.days > 28 ? "old" : "new", name: r.name || "", text: r.text || "", rating: r.rating || 0, days: r.days, fixed: true }))
    : [{ url: "", age: "new" }]));
  const [bad, setBad] = React.useState({});
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState(null);
  const set = (k) => (e) => { const v = e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e; setF((x) => ({ ...x, [k]: v })); setBad((b) => ({ ...b, [k]: false })); setErr(""); };
  const isRev = co.service === "reviews";
  // Alte Bewertungen mit Text aus einem US-Profil → Software (Partner-Regel); Land kommt aus dem Profil-Link.
  const swOf = (r) => co.placeCountry === "US" && r.age === "old" && !!String(r.text || "").trim();
  // Bewertungen: Währung nach Land des Profils (aus dem Link), sonst nach dem angegebenen Land.
  // PayPal/Wise −10 % nur außerhalb von DACH (DE/AT/CH) – dort gibt es die Auswahl gar nicht.
  const [disc, setDisc] = React.useState({ reviews: true, profiles: true }); // Admin → Einstellungen: PayPal/Wise −10 % je Kategorie
  React.useEffect(() => { fetchPayDiscount().then(setDisc).catch(() => {}); }, []);
  const discOff = !(isRev ? disc.reviews : disc.profiles);
  const dach = discOff || ["DE", "AT", "CH"].includes(f.country) || ["DE", "AT", "CH"].includes(co.placeCountry || ""); // dach = keine PayPal/Wise-Auswahl
  const payPref = dach ? "none" : f.payPref;
  const p = priceOf({ service: co.service, country: (isRev && co.placeCountry) || f.country, pct: co.pct, reviews: revs.map((r) => ({ ...r, sw: swOf(r) })), payPref });
  const legal = (k) => pagePath(k, lang);
  const submit = async () => {
    const b = {};
    if (f.name.trim().length < 2) b.name = 1;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) b.email = 1;
    if (!f.country) b.country = 1;
    if (isRev) { if (!revs.some((r) => /^https?:\/\//i.test(r.url.trim()))) b.revs = 1; if (f.country === "DE" || f.country === "AT") { setErr(c.errDach); setBad({ ...b, country: 1 }); return; } }
    else if (!/^https?:\/\//i.test(f.profileLink.trim()) && f.company.trim().length < 2) b.profileLink = 1;
    if (!f.agb) b.agb = 1;
    setBad(b);
    if (Object.keys(b).length) { setErr(c.errFill); return; }
    setErr(""); setBusy(true);
    try {
      const res = await fetch(OPS + "/chat/site/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        sid, service: co.service, name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), company: f.company.trim(), profileLink: f.profileLink.trim(),
        country: f.country === "OTHER" ? "XX" : f.country, lang, payPref, agb: true, page: window.location.pathname, placeCountry: co.placeCountry || "",
        reviews: isRev ? revs.filter((r) => r.url.trim()).map((r) => ({ url: r.url.trim(), age: r.age, name: r.name || "", text: r.text || "", rating: r.rating || 0, days: r.days })) : [],
      }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) { setErr(j.error === "already_ordered" ? c.errDup : j.error === "reviews_dach" ? c.errDach : c.errGen); setBusy(false); return; }
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
          {isRev ? <div className="cs-r"><span>{revs.length} × {fmt(179, p.usd)}{revs.some((r) => r.age === "old" && !swOf(r)) ? ` / ${fmt(229, p.usd)}` : ""}{p.nSw ? ` / ${fmt(300, p.usd)}` : ""}</span><span>{fmt(p.sub, p.usd)}</span></div> : <div className="cs-r"><span>{c.svc[co.service]}</span><span>{fmt(p.sub, p.usd)}</span></div>}
          {isRev && p.nSw ? <div className="cs-sw">{p.nSw} × {fmt(300, p.usd)} · {c.sw}</div> : null}
          {p.d ? <div className="cs-r dc"><span>{p.dKind === "vol" ? c.volDisc : c.chatDisc} −{p.d} %</span><span>−{fmt(p.sub - (isRev ? Math.round((p.sub * (100 - p.d)) / 100) : Math.round(p.sub * (100 - p.d)) / 100), p.usd)}</span></div> : null}
          {p.payD ? <div className="cs-r dc"><span>{c.payDisc} −10 %</span><span>−{fmt(p.payD, p.usd)}</span></div> : null}
          <div className="cs-t"><span>{isRev ? c.maxTotal : c.total}</span><b key={p.total}>{fmt(p.total, p.usd)}</b></div>
          <div className="cs-n"><ShieldCheck />{c.note}</div>
        </div>

        {isRev ? (
          <div className={"co-revs" + (bad.revs ? " bad" : "")}>
            <span className="co-l">{c.reviews}</span>
            {revs.map((r, i) => (
              <div key={i} className="co-rev">
                {r.fixed ? <div className="co-rv"><b>{r.name || "Google"}</b><Stars n={r.rating} />{swOf(r) ? <i className="co-swt">{c.sw}</i> : null}{r.text ? <span>„{r.text.slice(0, 90)}{r.text.length > 90 ? "…" : ""}“</span> : null}</div> : <input value={r.url} placeholder={c.phReview} inputMode="url" onChange={(e) => { const v = e.target.value; setRevs((l) => l.map((x, k) => (k === i ? { ...x, url: v } : x))); setBad((b) => ({ ...b, revs: false })); }} />}
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
          <button key={r.id} type="button" className={"pk-r" + (sel.has(r.id) ? " on" : "")} onClick={() => !done && tog(r.id)}>
            <span className="pk-c">{sel.has(r.id) ? <Check /> : null}</span>
            <span className="pk-t"><span className="l1"><b>{r.name}</b><Stars n={r.rating} /></span><span className="l2">{r.text || "—"}</span><span className="l3">{ago(r.days, lang)}</span></span>
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
