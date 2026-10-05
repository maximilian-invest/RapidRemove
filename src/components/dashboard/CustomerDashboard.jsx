"use client";
/* Kunden-Dashboard (rapid-remove.com/my-reviews) — vorerst NUR Einzelbewertungen.
   Login mit E-Mail + Passwort (kommt mit der Auftragsbestätigung), danach je
   Bestellung: Bewertungen mit Status + offene Zahlungen als Buttons. */
import React from "react";
import "@/styles/dashboard.css";
import { DASH_TXT, dashLang } from "@/components/dashboard/dash-copy";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const KEY = "rr_cust_session";

async function call(path, body) {
  const res = await fetch(OPS + "/cust/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) { const e = new Error(j.error || "HTTP " + res.status); e.code = j.error; throw e; }
  return j;
}
const money = (v, cur) => (cur === "usd" ? "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }) : Number(v).toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " €");
const fmtDate = (iso, l) => { try { return new Date(iso).toLocaleDateString(l === "no" ? "nb" : l); } catch (e) { return ""; } };

function Login({ t, onToken }) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [forgot, setForgot] = React.useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setInfo(""); setBusy(true);
    try {
      if (forgot) { await call("reset", { email }); setInfo(t.sentNew); setForgot(false); }
      else { const r = await call("login", { email, password: pw }); onToken(r.token); }
    } catch (x) { setErr(x.code === "too_many" ? t.tooMany : t.wrong); }
    setBusy(false);
  };
  return (
    <form className="cd-login" onSubmit={submit}>
      <div className="cd-brand">RapidRemove</div>
      <h1>{t.title}</h1>
      <p className="cd-muted">{t.sub}</p>
      <label>{t.email}<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {!forgot ? <label>{t.password}<input type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></label> : null}
      {err ? <div className="cd-err">{err}</div> : null}
      {info ? <div className="cd-info">{info}</div> : null}
      <button className="cd-btn" disabled={busy}>{forgot ? t.sendNew : t.login}</button>
      <button type="button" className="cd-link" onClick={() => { setForgot(!forgot); setErr(""); setInfo(""); }}>{forgot ? "← " + t.login : t.forgot}</button>
    </form>
  );
}

function Order({ o, t, lang }) {
  const removed = o.items.filter((i) => i.status === "removed").length;
  const open = o.payments.filter((p) => !p.paid);
  const done = o.payments.filter((p) => p.paid);
  return (
    <section className="cd-order">
      <div className="cd-ohead">
        <div><b>{o.business || t.order}</b><span className="cd-muted"> · #{o.id} · {fmtDate(o.created, lang)}</span></div>
        <span className="cd-sum">{t.sum(removed, o.items.length)}</span>
      </div>
      <div className="cd-bar"><span style={{ width: (o.items.length ? (removed / o.items.length) * 100 : 0) + "%" }} /></div>

      {open.length ? (
        <div className="cd-pays">
          {open.map((p) => (
            <div key={p.id} className="cd-pay">
              <span>{t.kinds[p.kind] || p.kind}{p.n ? ` (${p.n})` : ""} · <b>{money(p.amount, p.cur)}</b></span>
              {p.url ? <a className="cd-btn sm" href={p.url} target="_blank" rel="noopener noreferrer">{t.pay}</a> : null}
            </div>
          ))}
        </div>
      ) : null}

      <ul className="cd-items">
        {o.items.map((it, i) => (
          <li key={i} className={"cd-item s-" + it.status}>
            <div className="cd-imain">
              <span className={"cd-st s-" + it.status}>{t.st[it.status] || it.status}</span>
              {it.name ? <b className="cd-rname">{it.name}</b> : null}
              {it.text ? <span className="cd-rtext">“{it.text.length > 160 ? it.text.slice(0, 160) + " …" : it.text}”</span> : it.noText ? <span className="cd-muted"> ({t.noText})</span> : null}
              {t.hint[it.status] ? <div className="cd-hint">{t.hint[it.status]}</div> : null}
            </div>
            {it.url ? <a className="cd-open" href={it.url} target="_blank" rel="noopener noreferrer">{t.open} ↗</a> : null}
          </li>
        ))}
      </ul>

      {done.length ? (
        <div className="cd-paid">
          {done.map((p) => <span key={p.id}>{t.kinds[p.kind] || p.kind}: {money(p.amount, p.cur)} · {t.paid}</span>)}
        </div>
      ) : null}
    </section>
  );
}

export default function CustomerDashboard() {
  const [token, setToken] = React.useState(null);
  const [data, setData] = React.useState(null);
  const [lang, setLang] = React.useState("en");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let tk = null;
    try { tk = localStorage.getItem(KEY); } catch (e) {}
    try { const nl = (navigator.language || "en").slice(0, 2).toLowerCase(); setLang(dashLang(nl === "nb" || nl === "nn" ? "no" : nl)); } catch (e) {}
    setToken(tk); setReady(true);
  }, []);

  const load = React.useCallback(async () => {
    if (!token) return;
    try { const d = await call("me", { token }); setData(d); setLang(dashLang(d.lang)); }
    catch (e) { if (e.code === "session") { try { localStorage.removeItem(KEY); } catch (x) {} setToken(null); setData(null); } }
  }, [token]);
  React.useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

  const t = DASH_TXT[lang] || DASH_TXT.en;
  if (!OPS) return <div className="cd-wrap"><p>Not configured.</p></div>;
  if (!ready) return <div className="cd-wrap" />;
  if (!token) {
    return <div className="cd-wrap"><Login t={t} onToken={(tk) => { try { localStorage.setItem(KEY, tk); } catch (e) {} setToken(tk); }} /></div>;
  }
  const logout = async () => { try { await call("logout", { token }); } catch (e) {} try { localStorage.removeItem(KEY); } catch (e) {} setToken(null); setData(null); };
  return (
    <div className="cd-wrap">
      <header className="cd-top">
        <div>
          <div className="cd-brand">RapidRemove</div>
          <h1>{t.title}</h1>
          {data ? <p className="cd-muted">{data.name ? data.name + " · " : ""}{data.email}</p> : null}
        </div>
        <button type="button" className="cd-out" onClick={logout}>{t.logout}</button>
      </header>
      {!data ? <p className="cd-muted">…</p> : !data.orders.length ? <p className="cd-muted">{t.noOrders}</p> : data.orders.map((o) => <Order key={o.id} o={o} t={t} lang={lang} />)}
      <p className="cd-foot">{t.help}</p>
    </div>
  );
}
