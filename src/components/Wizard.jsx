"use client";
import React from "react";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { money, profileFor } from "@/lib/pricing";
import { searchProfiles, placesEnabled, manualCandidate } from "@/lib/places";
import { submitOrder, submitCheck } from "@/lib/order";

/* ---- mandatory privacy / terms consent label, per locale ---- */
const AGB_CONSENT = {
  de: { pre: "Ich habe die ", link: "Datenschutzerklärung & AGB", post: " gelesen und stimme zu.", err: "Bitte bestätigen Sie die Datenschutzerklärung." },
  en: { pre: "I have read and agree to the ", link: "Privacy Policy & Terms", post: ".", err: "Please confirm the privacy policy." },
  es: { pre: "He leído y acepto la ", link: "Política de Privacidad y los Términos", post: ".", err: "Confirme la política de privacidad." },
  fr: { pre: "J'ai lu et j'accepte la ", link: "politique de confidentialité et les CGV", post: ".", err: "Veuillez confirmer la politique de confidentialité." },
  it: { pre: "Ho letto e accetto l'", link: "Informativa sulla privacy e i Termini", post: ".", err: "Conferma l'informativa sulla privacy." },
  nl: { pre: "Ik heb het ", link: "privacybeleid & de voorwaarden", post: " gelezen en ga akkoord.", err: "Bevestig het privacybeleid." },
  pt: { pre: "Li e aceito a ", link: "Política de Privacidade e os Termos", post: ".", err: "Confirme a política de privacidade." },
  ja: { pre: "", link: "プライバシーポリシーと利用規約", post: "を読み、同意します。", err: "プライバシーポリシーに同意してください。" },
  sv: { pre: "Jag har läst och godkänner ", link: "integritetspolicyn och villkoren", post: ".", err: "Bekräfta integritetspolicyn." },
  da: { pre: "Jeg har læst og accepterer ", link: "privatlivspolitikken og vilkårene", post: ".", err: "Bekræft privatlivspolitikken." },
  no: { pre: "Jeg har lest og godtar ", link: "personvernerklæringen og vilkårene", post: ".", err: "Bekreft personvernerklæringen." },
};
// Deutsche AGB/Datenschutz lokal; alle anderen Sprachen → englische GTC.
const GTC_EN = "https://onecdn.io/media/rapidremovegtc-7e48fe7f-35be-4849-861a-e10de91526fd.pdf";


/* ---- plausible profile candidates from a typed business name ---- */
function makeCandidates(rawName, lang) {
  const name = (rawName || "").trim() || (lang === "de" ? "Ihr Unternehmen" : "Your Business");
  const base = name.replace(/,.*$/, "").trim();
  const dePool = [
    { street: "Hauptstraße 24", city: "10178 Berlin", cat: lang === "de" ? "Dienstleister" : "Service" },
    { street: "Bahnhofstraße 8", city: "80335 München", cat: lang === "de" ? "Geschäft" : "Shop" },
    { street: "Ringstraße 5", city: "1010 Wien", cat: lang === "de" ? "Filiale" : "Branch" },
  ];
  return [
    { id: "p1", name: base, cat: dePool[0].cat, rating: "2,4", reviews: 47, addr: `${dePool[0].street}, ${dePool[0].city}`, primary: true },
    { id: "p2", name: `${base} – Zweigstelle`, cat: dePool[1].cat, rating: "3,1", reviews: 12, addr: `${dePool[1].street}, ${dePool[1].city}` },
    { id: "p3", name: `${base} GmbH`, cat: dePool[2].cat, rating: "4,0", reviews: 8, addr: `${dePool[2].street}, ${dePool[2].city}` },
  ];
}

/* ---- Step indicator ---- */
function Stepper({ step }) {
  const { t } = useLang();
  const labels = t.wizard.steps;
  return (
    <div className="stepper">
      <div className="stepper-track">
        {labels.map((label, i) => (
          <React.Fragment key={i}>
            <div className={"stepper-node" + (i < step ? " done" : i === step ? " active" : "")}>
              <div className="stepper-dot">{i < step ? <Icon.check /> : i + 1}</div>
              <div className="stepper-label">{label}</div>
            </div>
            {i < labels.length - 1 && (
              <div className={"stepper-bar" + (i < step ? " filled" : "")}><div className="fill"></div></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="stepper-count">{t.wizard.stepCount(step + 1, labels.length)}</div>
    </div>
  );
}

/* ---- Stylized animated map ---- */
function FauxMap({ phase, multi, selectedId, candidates, onPick }) {
  const zoomed = phase === "found";
  const PIN_SPOTS = [
    { left: "50%", top: "46%" }, { left: "34%", top: "62%" }, { left: "68%", top: "34%" },
    { left: "61%", top: "65%" }, { left: "39%", top: "33%" },
  ];
  return (
    <div className="mapwrap">
      <div className={"map-canvas" + (zoomed ? " zoomed" : "")}>
        <div className="map-bg"></div>
        <div className="map-blob park b1"></div>
        <div className="map-blob water b2"></div>
        <div className="map-blob park b3"></div>
        <div className="map-road r1"></div>
        <div className="map-road r2"></div>
        {phase === "searching" && <React.Fragment>
          <div className="map-grid-pulse run"></div>
          <div className="map-scan run"></div>
        </React.Fragment>}
        {zoomed && candidates.map((c, i) => {
          const isMain = c.id === selectedId || (!multi && c.primary);
          if (!multi && !c.primary) return null;
          return (
            <div key={c.id} className={"map-pin drop" + (isMain ? "" : " alt")} style={{ ...PIN_SPOTS[i % PIN_SPOTS.length], animationDelay: `${i * 0.12}s` }} onClick={() => onPick && onPick(c.id)}>
              <div className="pin-ring"></div>
              <div className="pin-body"><Icon.mapPin /></div>
              <div className="pin-shadow"></div>
            </div>
          );
        })}
      </div>
      {phase === "searching"
        ? <div className="map-badge"><span className="spin" style={{ width: 14, height: 14, border: "2px solid var(--orange-200)", borderTopColor: "var(--primary)", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }}></span> Google Maps</div>
        : <div className="map-badge"><Icon.checkCircle /> Google Maps</div>}
      <div className="map-attr">Map data · demo</div>
    </div>
  );
}

/* ---- rating assessment (worse rating = more reputation-damaging) ---- */
const ASSESS = {
  de: { vbad: "sehr schlecht – stark rufschädigend", bad: "schlecht und rufschädigend", mixed: "durchwachsen – schadet dem Ruf", ok: "noch okay – Eintrag bleibt sichtbar" },
  en: { vbad: "very poor – highly damaging", bad: "poor and reputation-damaging", mixed: "mixed – hurts your reputation", ok: "okay – but the listing stays visible" },
  es: { vbad: "muy mala – muy da\u00f1ina", bad: "mala y da\u00f1ina para la reputaci\u00f3n", mixed: "irregular – da\u00f1a tu reputaci\u00f3n", ok: "aceptable – pero la ficha sigue visible" },
  fr: { vbad: "tr\u00e8s mauvaise – tr\u00e8s pr\u00e9judiciable", bad: "mauvaise et pr\u00e9judiciable", mixed: "mitig\u00e9e – nuit \u00e0 votre r\u00e9putation", ok: "correcte – mais la fiche reste visible" },
  it: { vbad: "pessima – molto dannosa", bad: "scarsa e dannosa per la reputazione", mixed: "altalenante – danneggia la reputazione", ok: "accettabile – ma la scheda resta visibile" },
  nl: { vbad: "zeer slecht – zeer schadelijk", bad: "slecht en reputatieschadelijk", mixed: "wisselend – schaadt uw reputatie", ok: "ok\u00e9 – maar de vermelding blijft zichtbaar" },
  pt: { vbad: "muito m\u00e1 – muito prejudicial", bad: "m\u00e1 e prejudicial \u00e0 reputa\u00e7\u00e3o", mixed: "irregular – prejudica a sua reputa\u00e7\u00e3o", ok: "aceit\u00e1vel – mas a ficha continua vis\u00edvel" },
};
/* ---- protection nudge copy (protection is the default everyone keeps) ---- */
const PROT_NUDGE = {
  de: { rec: "Empfohlen", social: "9 von 10 Kunden behalten den Schutz", keep: "Ja, Schutz behalten", remove: "Schutz trotzdem entfernen" },
  en: { rec: "Recommended", social: "9 in 10 customers keep protection", keep: "Yes, keep protection", remove: "Remove protection anyway" },
  es: { rec: "Recomendado", social: "9 de cada 10 clientes mantienen la protección", keep: "Sí, mantener la protección", remove: "Quitar la protección igualmente" },
  fr: { rec: "Recommandé", social: "9 clients sur 10 gardent la protection", keep: "Oui, garder la protection", remove: "Retirer quand même la protection" },
  it: { rec: "Consigliato", social: "9 clienti su 10 mantengono la protezione", keep: "Sì, mantieni la protezione", remove: "Rimuovi comunque la protezione" },
  nl: { rec: "Aanbevolen", social: "9 van de 10 klanten houden de bescherming", keep: "Ja, bescherming houden", remove: "Bescherming toch verwijderen" },
  pt: { rec: "Recomendado", social: "9 em cada 10 clientes mantêm a proteção", keep: "Sim, manter a proteção", remove: "Remover a proteção mesmo assim" },
};

function ratingAssessment(ratingStr, lang) {
  const r = parseFloat(String(ratingStr).replace(",", ".")) || 0;
  const m = ASSESS[lang] || ASSESS.en;
  let key, tone;
  if (r < 2.0) { key = "vbad"; tone = "bad"; }
  else if (r < 3.0) { key = "bad"; tone = "bad"; }
  else if (r < 3.8) { key = "mixed"; tone = "warn"; }
  else { key = "ok"; tone = "warn"; }
  return { label: m[key], tone };
}

/* ---- Profile card ---- */
function ProfileCard({ c, selected, onClick, selectable = true, reviewsLabel }) {
  const { lang } = useLang();
  const a = c.rating != null ? ratingAssessment(c.rating, lang) : null;
  return (
    <div className={"profile-card reveal-in" + (selected ? " sel" : "")} onClick={selectable ? onClick : undefined} style={!selectable ? { cursor: "default" } : null}>
      <div className="profile-thumb"><Icon.building /></div>
      <div className="profile-main">
        <div className="pn">{c.name}</div>
        {c.cat && <div className="pcat">{c.cat}</div>}
        {c.rating != null && (
          <React.Fragment>
            <div className="profile-rating">
              <span className="stars sm" style={{ color: "var(--primary)" }}>{[0,1,2,3,4].map(i => <Icon.star key={i} size={14} />)}</span>
              <span className="rv">{c.rating}</span>
              <span className="rc">· {c.reviews} {reviewsLabel}</span>
            </div>
            <div className={"rate-assess " + a.tone}><Icon.alert /> {a.label}</div>
          </React.Fragment>
        )}
        {c.addr && <div className="profile-addr"><Icon.mapPin /> {c.addr}</div>}
      </div>
      {selectable && <div className="profile-radio"><Icon.check /></div>}
    </div>
  );
}

/* ============ WIZARD ROOT ============ */
function Wizard({ initialName, onExit }) {
  const { t, lang } = useLang();
  const w = t.wizard;
  const p = profileFor(lang);
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState(initialName || "");
  const [candidates, setCandidates] = React.useState(() => makeCandidates(initialName, lang));
  const [phase, setPhase] = React.useState("searching"); // searching | found
  const [multi, setMulti] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState("p1");
  const [service, setService] = React.useState("remove");
  const [protection, setProtection] = React.useState("monthly"); // null | monthly | monitor | lifetime — default ON
  const [showSkip, setShowSkip] = React.useState(false);
  const [contact, setContact] = React.useState({ name: "", email: "", phone: "", company: initialName || "", url: "" });
  const [errors, setErrors] = React.useState({});
  const [processing, setProcessing] = React.useState(false);
  const [agbOk, setAgbOk] = React.useState(false);
  const [orderId] = React.useState(() => "RR-" + Math.floor(100000 + Math.random() * 899999));
  const [checkId] = React.useState(() => "CHK-" + Math.floor(100000 + Math.random() * 899999));
  const checkSent = React.useRef(false);
  const bodyRef = React.useRef(null);

  React.useEffect(() => { if (bodyRef.current) window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // If we arrived with a name, auto-jump into the search step
  React.useEffect(() => {
    if (initialName && initialName.trim()) { startSearch(initialName); }
    // eslint-disable-next-line
  }, []);

  const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

  const startSearch = (n) => {
    const nm = (n != null ? n : name);
    if (!nm.trim()) return;
    setName(nm);
    setContact((c) => ({ ...c, company: nm }));
    setPhase("searching");
    setStep(1);
    runSearch(nm);
  };

  // Echte Google-Places-Suche; Mindest-Anzeigezeit für die Karten-Animation,
  // mit sauberen Fallbacks (kein Key → Demo, Key aber kein Treffer → manuell).
  const runSearch = async (nm) => {
    const minDelay = new Promise((r) => setTimeout(r, 900));
    let results = null;
    if (placesEnabled()) {
      try { results = await searchProfiles(nm, lang); }
      catch (e) { if (typeof console !== "undefined") console.warn("Places-Suche fehlgeschlagen:", e.message); }
    }
    await minDelay;
    let list;
    if (results && results.length) list = results;          // echte Treffer
    else if (placesEnabled()) list = manualCandidate(nm, lang); // Key gesetzt, aber nichts gefunden
    else list = makeCandidates(nm, lang);                    // Demo-Modus (kein Key)
    setCandidates(list);
    setSelectedId(list[0].id);
    setMulti(list.length > 1);
    setPhase("found");
  };

  const go = (n) => setStep(n);

  // pricing
  const servicePrice = service === "remove" ? p.deletion : p.reset;
  const protLabel = protection === "monthly" ? w.s4.planMonthly : protection === "monitor" ? w.s4.planMonitor : protection === "lifetime" ? w.s4.planLifetime : null;
  const protPriceVal = protection === "monthly" ? p.protMonthly : protection === "monitor" ? p.protMonitor : protection === "lifetime" ? p.protLifetime : null;
  const protCadence = protection === "lifetime" ? w.s4.once : w.s4.per;

  const num = (v) => parseFloat(String(v).replace(/\s/g, "").replace(",", ".")) || 0;
  const country = lang === "en" ? "US" : "DE";
  const persistCheck = () => {
    if (checkSent.current) return;
    checkSent.current = true;
    submitCheck({
      checkId, profile: selected ? selected.name : name, category: selected ? selected.cat : "",
      rating: selected ? selected.rating : "", reviews: selected ? selected.reviews : 0,
      recommend: service, name, country, lang,
    }).catch((e) => { if (typeof console !== "undefined") console.warn("Prüfung senden fehlgeschlagen:", e.message); });
  };
  const proceedFromSearch = () => { persistCheck(); go(2); };

  const submit = () => {
    const er = {};
    if (!contact.name.trim()) er.name = w.s5.errName;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) er.email = w.s5.errEmail;
    if (!agbOk) er.agb = (AGB_CONSENT[t.code] || AGB_CONSENT.en).err;
    setErrors(er);
    if (Object.keys(er).length) return;
    setProcessing(true);
    persistCheck();
    // Bestellung im Hintergrund ans ops-Backend (Auftragsbestätigung + interne Notiz).
    // Stört die Danke-Animation nicht; ohne NEXT_PUBLIC_OPS_URL ein No-op (Demo).
    submitOrder({
      email: contact.email, name: contact.name, phone: contact.phone,
      company: contact.company, service, protection: protection || "",
      profile: selected ? selected.name : "", orderId, lang,
      category: selected ? selected.cat : "", rating: selected ? selected.rating : "",
      reviews: selected ? selected.reviews : 0,
      amount: num(servicePrice), protAmount: protPriceVal ? num(protPriceVal) : 0,
      country, checkId,
    }).catch((e) => { if (typeof console !== "undefined") console.warn("Bestellung senden fehlgeschlagen:", e.message); });
    setTimeout(() => { setProcessing(false); setStep(5); }, 2400);
  };

  /* ---------- step bodies ---------- */
  function StepName() {
    return (
      <div className="wz-card pad-lg">
        <div className="wz-eyebrow"><Icon.search size={14} /> {w.s1.eyebrow}</div>
        <h1 className="wz-h">{w.s1.h}</h1>
        <p className="wz-sub">{w.s1.sub}</p>
        <div className="wz-bigfield">
          <Icon.building size={22} />
          <input className="wz-biginput" autoFocus placeholder={w.s1.placeholder} value={name}
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startSearch(name)} />
        </div>
        {w.s1.hint && (
          <p className="wz-hint"><Icon.info size={17} /> {w.s1.hint}</p>
        )}
        <div className="wz-actions">
          <button className="btn btn-primary lg grow" onClick={() => startSearch(name)} disabled={!name.trim()}>
            <Icon.search size={19} /> {w.s1.button} <Icon.arrowRight size={18} />
          </button>
        </div>
        <div className="wz-mini-assure">
          {w.s1.assure.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
        </div>
        <div className="risk-banner" style={{ marginTop: 18 }}><Icon.shieldCheck /> {t.riskReversal}</div>
      </div>
    );
  }

  function StepSearch() {
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.mapPin size={14} /> {w.s2.eyebrow}</div>
        {phase === "searching"
          ? <div className="search-status"><span className="spin"></span> {w.s2.searching}</div>
          : (multi
              ? <React.Fragment><h1 className="wz-h" style={{ fontSize: 26 }}>{w.s2.multiH}</h1><p className="wz-sub" style={{ marginBottom: 18 }}>{w.s2.multiSub}</p></React.Fragment>
              : <React.Fragment><h1 className="wz-h" style={{ fontSize: 26 }}>{w.s2.h}</h1><p className="wz-sub" style={{ marginBottom: 18 }}>{w.s2.sub}</p></React.Fragment>)
        }
        <FauxMap phase={phase} multi={multi} selectedId={selectedId} candidates={candidates} onPick={setSelectedId} />
        {phase === "found" && (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {(multi ? candidates : candidates.filter((c) => c.primary)).map((c) => (
              <ProfileCard key={c.id} c={c} selected={selectedId === c.id} onClick={() => setSelectedId(c.id)} reviewsLabel={w.s2.reviews} />
            ))}
            <div className="wz-actions" style={{ marginTop: 6 }}>
              <button className="btn btn-secondary" onClick={() => go(0)}><Icon.arrowLeft size={17} /> {w.back}</button>
              <button className="btn btn-primary grow" onClick={proceedFromSearch}>{w.s2.button} <Icon.arrowRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function StepConfirm() {
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.shieldCheck size={14} /> {w.s3.eyebrow}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{w.s3.h}</h1>
        <p className="wz-sub" style={{ marginBottom: 20 }}>{w.s3.sub}</p>
        <ProfileCard c={selected} selectable={false} reviewsLabel={w.s2.reviews} />
        <div className="feasible">
          <div className="feasible-head"><Icon.checkCircle /> {w.s3.checkTitle}</div>
          <div className="feasible-rows">
            {w.s3.rows.map((r, i) => (
              <div className="feasible-row" key={i}>
                <Icon.check /> <span className="lbl">{r.l}</span> <span className="val">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="wz-sub" style={{ fontSize: 14, margin: "18px 0 8px" }}>{w.s3.reassure}</p>
        <div className="wz-actions">
          <button className="btn btn-secondary" onClick={() => go(1)}><Icon.arrowLeft size={17} /> {w.back}</button>
          <button className="btn btn-primary grow" onClick={() => go(3)}>{w.s3.button} <Icon.arrowRight size={18} /></button>
        </div>
        <div className="wz-trust-strip">
          {w.trustStrip.slice(0, 4).map((x, i) => <span className="t" key={i}><Icon.check /> {x}</span>)}
        </div>
      </div>
    );
  }

  function StepService() {
    const nudge = PROT_NUDGE[t.code] || PROT_NUDGE.en;
    const opts = [
      { id: "remove", t: w.s4.opt1.t, d: w.s4.opt1.d, price: p.deletion, badge: w.s4.opt1.badge },
      { id: "reset", t: w.s4.opt2.t, d: w.s4.opt2.d, price: p.reset, badge: w.s4.opt2.badge },
    ];
    const toggleProt = () => {
      if (protection) { setShowSkip(true); }       // ask before removing the default protection
      else { setProtection("monthly"); setShowSkip(false); }
    };
    const proceed = () => go(4);
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.trash size={14} /> {w.s4.eyebrow}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{w.s4.h}</h1>
        <p className="wz-sub" style={{ marginBottom: 22 }}>{w.s4.sub}</p>
        <div className="opt-list">
          {opts.map((o) => (
            <div className={"opt" + (service === o.id ? " sel" : "")} key={o.id} onClick={() => setService(o.id)}>
              <div className="opt-radio"></div>
              <div className="opt-main">
                <div className="ot">{o.t} {o.badge && <span className="obadge">{o.badge}</span>}</div>
                <div className="od">{o.d}</div>
              </div>
              <div className="opt-price">{money(lang, o.price)}<small>{w.s5.sumNote ? (t.code === "de" ? "nach Erfolg" : "after success") : ""}</small></div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div className={"addon" + (protection ? " on" : "")}>
            <div className="ash"><Icon.shield size={24} /></div>
            <div className="addon-main">
              <h4>{w.s4.addonTitle} <span className="rec-badge">{nudge.rec}</span></h4>
              <p>{w.s4.addonDesc}</p>
              <div className="addon-social"><Icon.shieldCheck /> {nudge.social}</div>
            </div>
            <button className={"switch" + (protection ? " on" : "")} onClick={toggleProt} aria-label="toggle"></button>
          </div>
          {protection && (
            <div className="seg">
              {[["monthly", w.s4.planMonthly, money(lang, p.protMonthly) + " " + w.s4.per],
                ["monitor", w.s4.planMonitor, money(lang, p.protMonitor) + " " + w.s4.per],
                ["lifetime", w.s4.planLifetime, money(lang, p.protLifetime)]].map(([id, label, price]) => (
                <button key={id} className={protection === id ? "on" : ""} onClick={() => setProtection(id)}>
                  {label}<span className="sp">{price}</span>
                </button>
              ))}
            </div>
          )}
          {showSkip && (
            <div className="mini-dialog">
              <Icon.alert />
              <div>
                <b>{w.s4.skipTitle}</b>
                <div style={{ marginTop: 4 }}>{w.s4.skipBody}</div>
                <div className="md-actions">
                  <button className="keep" onClick={() => { if (!protection) setProtection("monthly"); setShowSkip(false); }}>{nudge.keep}</button>
                  <button className="skip" onClick={() => { setProtection(null); setShowSkip(false); }}>{nudge.remove}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="wz-actions" style={{ marginTop: 24 }}>
          <button className="btn btn-secondary" onClick={() => go(2)}><Icon.arrowLeft size={17} /> {w.back}</button>
          <button className="btn btn-primary grow" onClick={proceed}>{w.s4.button} <Icon.arrowRight size={18} /></button>
        </div>
      </div>
    );
  }

  function Summary() {
    return (
      <div className="summary">
        <h3><Icon.cart size={20} /> {w.s5.sumTitle}</h3>
        <div className="sum-row"><span className="sl">{w.s5.sumProfile}</span><span className="sv" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</span></div>
        <div className="sum-row"><span className="sl">{w.s5.sumService}: {service === "remove" ? w.s4.opt1.t : w.s4.opt2.t}</span><span className="sv">{money(lang, servicePrice)}</span></div>
        <div className={"sum-row" + (protection ? "" : " muted")}><span className="sl">{w.s5.sumProtect}{protLabel ? `: ${protLabel}` : ""}</span><span className="sv">{protection ? `${money(lang, protPriceVal)} ${protCadence}` : w.s5.noneProtect}</span></div>
        <div className="sum-row muted"><span className="sl">{w.s5.sumDueNow}</span><span className="sv">{money(lang, w.s5.dueNow)}</span></div>
        <div className="sum-total"><span className="sl">{w.s5.sumTotal}</span><span className="sv">{money(lang, servicePrice)}</span></div>
        <div className="sum-note"><Icon.shieldCheck /> {w.s5.sumNote}</div>
      </div>
    );
  }

  function StepCheckout() {
    const set = (k) => (e) => setContact((c) => ({ ...c, [k]: e.target.value }));
    const ag = AGB_CONSENT[t.code] || AGB_CONSENT.en;
    if (processing) {
      return (
        <div className="wz-card">
          <div className="del-demo removing removed">
            <ProfileCard c={selected} selectable={false} reviewsLabel={w.s2.reviews} />
            <div className="del-stamp"><div className="ok"><div className="ring"><Icon.check /></div></div></div>
          </div>
          <div className="processing">
            <div className="ring"></div>
            <b>{w.s5.processing}</b>
            <span>{w.s5.payNote}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="wz-split">
        <div className="wz-card">
          <div className="wz-eyebrow"><Icon.lock size={14} /> {w.s5.eyebrow}</div>
          <h1 className="wz-h" style={{ fontSize: 26 }}>{w.s5.h}</h1>
          <p className="wz-sub" style={{ marginBottom: 22 }}>{w.s5.sub}</p>
          <div className="form-grid">
            <div className={"fld full" + (errors.name ? " err" : "")}>
              <label>{w.s5.f.name}</label>
              <input value={contact.name} onChange={set("name")} placeholder={w.s5.f.name} />
              {errors.name && <div className="emsg">{errors.name}</div>}
            </div>
            <div className={"fld" + (errors.email ? " err" : "")}>
              <label>{w.s5.f.email}</label>
              <input value={contact.email} onChange={set("email")} placeholder="name@firma.com" />
              {errors.email && <div className="emsg">{errors.email}</div>}
            </div>
            <div className="fld">
              <label>{w.s5.f.phone}</label>
              <input value={contact.phone} onChange={set("phone")} placeholder="+43 …" />
            </div>
            <div className="fld full">
              <label>{w.s5.f.company}</label>
              <input value={contact.company} onChange={set("company")} placeholder={w.s5.f.company} />
            </div>
          </div>
          <label className={"agb-consent" + (errors.agb ? " err" : "")} style={{ display: "flex", gap: 11, alignItems: "flex-start", marginTop: 22, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
            <input type="checkbox" checked={agbOk}
              onChange={(e) => { setAgbOk(e.target.checked); if (e.target.checked) setErrors((x) => { const { agb, ...r } = x; return r; }); }}
              style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: "var(--primary)", cursor: "pointer" }} />
            <span style={{ color: errors.agb ? "var(--danger)" : "inherit" }}>
              {ag.pre}
              <a href={t.code === "de" ? asset("/rapidremove-agb-datenschutz.pdf") : GTC_EN} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 700 }}
                onClick={(e) => e.stopPropagation()}>{ag.link}</a>
              {ag.post}
            </span>
          </label>
          {errors.agb && <div className="emsg" style={{ marginTop: 7, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>{errors.agb}</div>}
          <button className="btn btn-primary btn-block lg" style={{ marginTop: 16 }} onClick={submit}>
            <Icon.lock size={18} /> {w.s5.button}
          </button>
          <div className="risk-banner lg" style={{ marginTop: 14 }}><Icon.shieldCheck /> {t.riskReversal}</div>
          <div className="wz-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={() => go(3)}><Icon.arrowLeft size={17} /> {w.back}</button>
          </div>
        </div>
        <Summary />
      </div>
    );
  }

  function StepDone() {
    return (
      <div className="wz-card pad-lg">
        <div className="ty-hero">
          <div className="ty-check"><div className="core"><Icon.check /></div></div>
          <div className="wz-eyebrow" style={{ justifyContent: "center", color: "var(--success)" }}><Icon.checkCircle size={14} /> {w.s6.badge}</div>
          <h1 className="wz-h" style={{ fontSize: 30 }}>{w.s6.h}</h1>
          <p className="wz-sub" style={{ margin: "0 auto 0", textAlign: "center" }}>{w.s6.sub}</p>
          <div className="ty-order">{w.s6.order} <b>#{orderId}</b></div>
        </div>

        <div style={{ marginTop: 30 }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, margin: "0 0 6px" }}>{w.s6.pipeTitle}</h4>
          <div className="pipeline">
            {w.s6.pipe.map((s, i) => (
              <div className={"pl-step" + (s.done ? " done" : s.now ? " active" : "")} key={i}>
                {i < w.s6.pipe.length - 1 && <div className="pl-rail"></div>}
                <div className="pl-dot">{s.done ? <Icon.check /> : s.now ? <Icon.clock /> : <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", display: "block" }}></span>}</div>
                <div className="pl-body">
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                  {s.now && <span className="tnow"><Icon.clock size={13} /> {t.code === "de" ? "Jetzt" : "Now"}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ty-next">
          <h4>{w.s6.nextTitle}</h4>
          <p>{w.s6.nextBody}</p>
        </div>
        <div className="ty-next" style={{ background: "var(--orange-50)", borderColor: "var(--orange-200)" }}>
          <p style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><Icon.star size={18} style={{ color: "var(--primary)", flex: "none", marginTop: 1 }} /> {w.s6.reviewHint}</p>
        </div>

        <div className="ty-cta-row">
          <button className="btn btn-primary lg" onClick={() => window.open("#", "_self")}>{w.s6.portal} <Icon.arrowRight size={18} /></button>
          <button className="btn btn-secondary lg" onClick={onExit}>{w.s6.home}</button>
        </div>
      </div>
    );
  }

  const bodies = [StepName, StepSearch, StepConfirm, StepService, StepCheckout, StepDone];
  const Body = bodies[step];
  const wideStep = step === 4 && !processing;

  return (
    <div className="wz">
      <div className="wz-top">
        <div className="wz-top-inner">
          <img className="logo" src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" onClick={onExit} />
          <div className="wz-secure"><Icon.lock /> {w.secure}</div>
          <button className="back" onClick={onExit}><Icon.x size={16} /> {w.backHome}</button>
        </div>
      </div>
      <Stepper step={step} />
      <div className={"wz-body" + (wideStep ? " wide" : "")} ref={bodyRef}>
        <div className="step-panel" key={step + (processing ? "p" : "") + phase}>
          {Body()}
        </div>
      </div>
    </div>
  );
}

export { Wizard };
