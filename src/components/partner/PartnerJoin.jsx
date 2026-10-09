"use client";
/* Partner-Registrierung (/partner?join=1, optional mit Einladung #inv_…) und Warteseite „Application under review".
   Ablauf: Partner meldet sich mit Kontakt, Land, angebotenen Leistungen (+ Preisvorstellung) an → Status „pending"
   → RapidRemove gibt im Admin frei (Leistungen + Preise) → Partner richtet die Auszahlung ein → bekommt Aufträge. */
import React from "react";
import { Loader, Check, AlertCircle, Clock, LogOut, Eye, EyeOff, XCircle } from "lucide-react";
import { call, BASE } from "./shared";
import { COUNTRIES, NAMES } from "./PartnerPayouts";

/** Partner-Vereinbarung (Text + Version kommen vom Server, partnerTerms.ts) – auch als eigene Seite /partner?terms. */
export function AgreementText({ terms }) {
  if (!terms) return null;
  return (
    <div className="po-terms" style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--ink)" }}>
      <b style={{ display: "block", fontSize: 15 }}>{terms.title}</b>
      <span style={{ display: "block", color: "var(--g5, #667)", margin: "2px 0 8px" }}>Version {terms.version}</span>
      <p style={{ margin: "0 0 8px" }}>{terms.parties}</p>
      {(terms.sections || []).map((s) => (
        <div key={s.h} style={{ marginBottom: 8 }}>
          <b>{s.h}.</b> {s.text}
          {s.items ? <ol type="a" style={{ margin: "4px 0 0", paddingLeft: 22 }}>{s.items.map((it) => <li key={it}>{it}</li>)}</ol> : null}
        </div>
      ))}
    </div>
  );
}

/** Eigene Seite zum Nachlesen der Vereinbarung (Link in der Bestätigungsmail / App). */
export function PartnerTerms({ onBack }) {
  const [t, setT] = React.useState(null);
  const [err, setErr] = React.useState("");
  React.useEffect(() => { call("join-info", {}).then((j) => setT(j.terms)).catch((e) => setErr("Could not load: " + e.message)); }, []);
  return (
    <div className="pra"><main className="screen" style={{ bottom: 0 }}>
      <div className="po-form">
        <div className="po-top"><img src={`${BASE}/assets/rapidremove-icon.png`} alt="" style={{ width: 40, height: 40, borderRadius: 11 }} /><span /></div>
        {err ? <div className="po-err"><AlertCircle />{err}</div> : t ? <AgreementText terms={t} /> : <div className="po-card"><Loader className="spin" /> Loading …</div>}
        {onBack ? <button type="button" className="cta gh" style={{ marginTop: 16 }} onClick={onBack}>Back</button> : null}
      </div>
    </main></div>
  );
}

const RATE_L = { std: "Reviews up to 4 weeks old", old: "Reviews older than 4 weeks", sw: "Rating-only / special cases", profile: "Whole profile" };

export function PartnerJoin({ invite = "", onToken, onLogin }) {
  const [info, setInfo] = React.useState(null);
  const [f, setF] = React.useState({ name: "", company: "", email: "", whatsapp: "", country: "PK", addr1: "", zip: "", city: "", about: "", capacity: "", password: "" });
  const [svc, setSvc] = React.useState({}); // { id: { on, price } }
  const [terms, setTerms] = React.useState(false);
  const [full, setFull] = React.useState(false); // volle Vereinbarung aufgeklappt
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  React.useEffect(() => {
    call("join-info", { invite }).then((j) => {
      setInfo(j);
      if (j.invite) {
        setF((x) => ({ ...x, name: j.invite.name || x.name, email: j.invite.email || x.email }));
        setSvc(Object.fromEntries((j.invite.services || []).map((id) => [id, { on: true, price: "" }])));
        if (!(j.invite.services || []).length) setSvc({});
      }
    }).catch((e) => setErr("Could not load: " + e.message));
  }, [invite]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const chosen = Object.entries(svc).filter(([, v]) => v.on);
  const inv = info && info.invite; // eingeladen → keine Bewerbung, Leistungen + Preise stehen fest
  const fixed = !!(inv && inv.rates && Object.keys(inv.rates).length);
  const ok = f.name.trim() && /\S+@\S+\.\S+/.test(f.email) && f.whatsapp.trim().length >= 7 && f.addr1.trim() && f.city.trim() && f.password.length >= 8 && chosen.length && terms;
  const submit = async (e) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true); setErr("");
    try {
      const j = await call("register", {
        invite, ...f, capacity: f.capacity ? Number(f.capacity) : null, terms, termsVersion: info && info.terms ? info.terms.version : "",
        services: chosen.map(([id, v]) => ({ id, price: v.price ? Number(v.price) : null })),
      });
      onToken(j.token);
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  return (
    <div className="pra"><main className="screen" style={{ bottom: 0 }}>
      <form className="po-form" onSubmit={submit}>
        <div className="po-top"><img src={`${BASE}/assets/rapidremove-icon.png`} alt="" style={{ width: 40, height: 40, borderRadius: 11 }} /><span /></div>
        {inv ? <div className="po-hero"><b>You're invited{inv.name ? ", " + inv.name.split(" ")[0] : ""}!</b><span>Create your partner account – no application needed. Right after registering you set up your payouts once and get tasks in this app, paid automatically for every verified removal.</span></div>
          : <div className="po-hero"><b>Become a RapidRemove partner</b><span>Register once – after we approve you, you get tasks in this app and are paid automatically for every verified removal.</span></div>}
        <div className="ttl" style={{ paddingTop: 6 }}>About you</div>
        <label className="po-f"><span>Full name</span><input value={f.name} onChange={set("name")} autoComplete="name" required /></label>
        <label className="po-f"><span>Company / agency (optional)</span><input value={f.company} onChange={set("company")} autoComplete="organization" /></label>
        <label className="po-f"><span>Email (your login)</span><input type="email" value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" required /></label>
        <div className="po-2">
          <label className="po-f"><span>WhatsApp</span><input value={f.whatsapp} onChange={set("whatsapp")} placeholder="+92 300 1234567" inputMode="tel" autoComplete="tel" required /></label>
          <label className="po-f"><span>Country</span><select value={f.country} onChange={set("country")}>{COUNTRIES.map((c) => <option key={c} value={c}>{NAMES[c]}</option>)}</select></label>
        </div>
        <label className="po-f"><span>Street and number</span><input value={f.addr1} onChange={set("addr1")} autoComplete="address-line1" required /></label>
        <div className="po-2">
          <label className="po-f"><span>Postal code</span><input value={f.zip} onChange={set("zip")} autoComplete="postal-code" /></label>
          <label className="po-f"><span>City</span><input value={f.city} onChange={set("city")} autoComplete="address-level2" required /></label>
        </div>

        <div className="ttl" style={{ paddingTop: 14 }}>{fixed ? "Your services" : "What can you do?"}</div>
        {fixed ? (
          <div className="po-opts">
            {(info.services || []).filter((s) => inv.rates[s.id]).map((s) => (
              <div key={s.id} className="po-opt on" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <b style={{ fontSize: 15 }}>{s.label}</b>
                {inv.rates[s.id].map((r) => <span key={r.id} className="ps" style={{ margin: 0 }}>{RATE_L[r.id] || r.id}: <b style={{ color: "var(--ink)" }}>{r.usd} USD</b> per removal</span>)}
              </div>
            ))}
          </div>
        ) : <p className="ps">Choose every service you offer. Your price per successful removal is optional – we confirm the final price when we approve you.</p>}
        <div className="po-opts" style={fixed ? { display: "none" } : null}>
          {(info ? info.services : []).map((s) => {
            const v = svc[s.id] || { on: false, price: "" };
            return (
              <div key={s.id} className={"po-opt" + (v.on ? " on" : "")} style={{ flexDirection: "column", gap: 10, cursor: "pointer" }} onClick={(e) => { if (e.target.tagName !== "INPUT") setSvc((m) => ({ ...m, [s.id]: { ...v, on: !v.on } })); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <span className="t"><b style={{ fontSize: 15 }}>{s.label}</b></span>
                  <span className="rd" style={{ marginTop: 0 }}>{v.on ? <Check /> : null}</span>
                </div>
                {v.on ? (
                  <label className="po-f" style={{ marginBottom: 0, width: "100%" }}><span>{s.id === "reviews" ? "Your price per removed review (USD, optional)" : "Your price per removed profile (USD, optional)"}</span>
                    <input type="number" min="1" step="1" inputMode="decimal" value={v.price} onChange={(e) => setSvc((m) => ({ ...m, [s.id]: { ...v, price: e.target.value } }))} /></label>
                ) : null}
              </div>
            );
          })}
          {!info ? <div className="po-card"><Loader className="spin" /> Loading …</div> : null}
        </div>
        <label className="po-f" style={{ marginTop: 14 }}><span>How many removals can you handle per week? (optional)</span><input type="number" min="1" inputMode="numeric" value={f.capacity} onChange={set("capacity")} /></label>
        <label className="po-f"><span>Experience / how you work (optional)</span><textarea value={f.about} onChange={set("about")} rows={4} style={{ border: "1.5px solid var(--g2)", borderRadius: 14, padding: 12, font: "inherit", fontSize: 16, resize: "vertical" }} /></label>

        <div className="ttl" style={{ paddingTop: 14 }}>Your login</div>
        <label className="po-f"><span>Password (min. 8 characters)</span>
          <div style={{ position: "relative" }}><input type={show ? "text" : "password"} value={f.password} onChange={set("password")} autoComplete="new-password" required style={{ paddingRight: 48 }} />
            <button type="button" onClick={() => setShow((x) => !x)} aria-label="Show password" style={{ position: "absolute", right: 8, top: 8, width: 34, height: 34, display: "grid", placeItems: "center", background: "none" }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>

        <div className="ttl" style={{ paddingTop: 14 }}>Partner agreement</div>
        {info && info.terms ? (
          <div className="po-card" style={{ display: "block", padding: 14 }}>
            {(info.terms.summary || []).map((t) => <span key={t} style={{ display: "block", marginTop: 4, fontSize: 14 }}>• {t}</span>)}
            <button type="button" className="cta gh" style={{ marginTop: 10, minHeight: 40 }} onClick={() => setFull((x) => !x)}>{full ? "Hide full agreement" : "Read the full agreement"}</button>
            {full ? <div style={{ marginTop: 12, maxHeight: 360, overflowY: "auto" }}><AgreementText terms={info.terms} /></div> : null}
          </div>
        ) : null}
        <button type="button" className={"po-agree" + (terms ? " on" : "")} onClick={() => setTerms((x) => !x)} aria-pressed={terms} style={{ marginTop: 10 }}>
          <span className="bx">{terms ? <Check /> : null}</span>
          <span>I have read and accept the RapidRemove Partner Agreement{info && info.terms ? ` (version ${info.terms.version})` : ""}. A copy is sent to my email.</span>
        </button>
        {err ? <div className="po-err"><AlertCircle />{err}</div> : null}
        <button className="cta" disabled={!ok || busy} style={{ marginTop: 16 }}>{busy ? <Loader className="spin" /> : <Check />}Register</button>
        <button type="button" className="cta gh" style={{ marginTop: 10 }} onClick={onLogin}>I already have an account – log in</button>
      </form>
    </main></div>
  );
}

/** Nach der Registrierung: Bewerbung wird geprüft (bzw. abgelehnt). */
export function PartnerPending({ token, status, onLogout }) {
  const [me, setMe] = React.useState(null);
  React.useEffect(() => { call("me", { t: token }).then(setMe).catch(() => {}); }, [token]);
  const rejected = status === "rejected";
  return (
    <div className="pra"><main className="screen" style={{ bottom: 0 }}>
      <div className="po-top"><img src={`${BASE}/assets/rapidremove-icon.png`} alt="" style={{ width: 40, height: 40, borderRadius: 11 }} /><span /></div>
      <div className={"po-card" + (rejected ? " warn" : " ok")} style={{ marginTop: 10 }}>
        <span className="po-ic">{rejected ? <XCircle /> : <Clock />}</span>
        <span className="t"><b>{rejected ? "Application not approved" : "Application received"}</b>
          <span>{rejected ? "Unfortunately we can't work with you at the moment. We'll get in touch if this changes."
            : "Thanks! We're reviewing your application – usually within 1–2 working days. You'll get an email as soon as you're approved, then your tasks appear here."}</span></span>
      </div>
      {me && me.applied && me.applied.length && !rejected ? (
        <>
          <div className="sec"><h2>Your services</h2></div>
          {me.applied.filter((s) => s.id === "std" || s.id === "profile" || (s.id !== "old" && s.id !== "sw")).map((s) => <div key={s.id} className="er"><span className="ico"><Check /></span><span className="t"><b>{s.id === "profile" ? "Remove whole Google Business Profiles" : "Remove Google reviews"}</b><span>{s.price ? `Your price: ${s.price} USD` : "Price to be confirmed"}</span></span></div>)}
        </>
      ) : null}
      <div style={{ marginTop: 22 }}><button type="button" className="cta gh" onClick={onLogout}><LogOut />Log out</button></div>
    </main></div>
  );
}
