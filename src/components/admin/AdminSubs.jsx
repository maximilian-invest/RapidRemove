"use client";
import React from "react";
import { Icon as BaseIcon } from "@/components/Icons";
import { AdminIcon } from "./AdminIcons";
import { SUBS as SUBS_SAMPLE, PLANS as PLANS_SAMPLE, DAILY_REV as DAILY_REV_SAMPLE, WEEKLY_REV as WEEKLY_REV_SAMPLE, MONTHLY_REV as MONTHLY_REV_SAMPLE, PAYMENTS as PAYMENTS_SAMPLE } from "@/lib/admin-data";
import { fetchStripe, setupExpressLinks } from "@/lib/admin-api";
const AI = AdminIcon;
const Icon = { ...BaseIcon, ...AdminIcon };
/* RapidRemove Admin — Abos & Umsatz (Reputations-Schutz Abonnements über Stripe) */


const eur = (n) => "€ " + Number(n).toLocaleString("de-DE");
const planAmt = (p) => (p.cur === "USD" ? "$ " : "€ ") + Number(p.mrr).toLocaleString("de-DE");
const payAmt = (p) => (p.cur === "USD" ? "$ " : "€ ") + p.amount;
const subInitials = (n) => n.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
const AVA_COLORS = ["#ff8000", "#3b82f6", "#10b981", "#a855f7", "#ec4899", "#f59e0b", "#14b8a6"];
const PAY_STATUS = {
  bezahlt: ["pay-ok", "Bezahlt"], offen: ["pay-pend", "Offen"], fehlgeschlagen: ["pay-fail", "Fehlgeschlagen"],
};

/* 12-Wochen-Trends für die Sparklines */
const SPARK = {
  mrr: [2480, 2510, 2555, 2540, 2620, 2705, 2760, 2815, 2900, 2985, 3060, 3140],
  arr: [29760, 30120, 30660, 30480, 31440, 32460, 33120, 33780, 34800, 35820, 36720, 37674],
  active: [112, 115, 118, 120, 123, 125, 127, 128, 130, 131, 133, 134],
  overdue: [2, 3, 2, 4, 3, 5, 4, 3, 5, 4, 5, 4],
};

const prefersReduced = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useCountUp(target, dur = 950) {
  const [v, setV] = React.useState((prefersReduced() || document.hidden) ? target : 0);
  React.useEffect(() => {
    if (prefersReduced() || document.hidden) { setV(target); return; }
    let raf, start, done = false;
    const finish = () => { if (!done) { done = true; setV(target); } };
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick); else finish();
    };
    raf = requestAnimationFrame(tick);
    const safety = setTimeout(finish, dur + 400);
    const onVis = () => { if (document.hidden) finish(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); document.removeEventListener("visibilitychange", onVis); };
  }, [target]);
  return v;
}

function Sparkline({ data, color, w = 132, h = 40 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((d, i) => [i / (data.length - 1) * w, h - ((d - min) / (max - min || 1)) * (h - 8) - 4]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L ${w} ${h} L 0 ${h} Z`;
  const id = React.useMemo(() => "sg" + Math.random().toString(36).slice(2, 7), []);
  const last = pts[pts.length - 1];
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.26" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path className="spark-line" d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#fff" stroke={color} strokeWidth="2.2" />
    </svg>
  );
}

function Donut({ plans, total }) {
  const r = 54, c = 2 * Math.PI * r, sw = 17;
  let off = 0;
  const segs = plans.map((p, i) => {
    const len = (p.count / total) * c;
    const seg = (
      <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth={sw}
        strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off}
        transform="rotate(-90 70 70)" className="donut-seg" style={{ animationDelay: 0.15 + i * 0.12 + "s" }} />
    );
    off += len;
    return seg;
  });
  const animTotal = Math.round(useCountUp(total, 900));
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" className="donut">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--neutral-100)" strokeWidth={sw} />
        {segs}
      </svg>
      <div className="donut-center">
        <div className="dc-num">{animTotal}</div>
        <div className="dc-lbl">Aktive Abos</div>
      </div>
    </div>
  );
}

function SubKpi({ label, value, format, color, tone, delta, sub, spark, sparkColor, details, onLink, idx }) {
  const v = useCountUp(value);
  const display = format ? format(v) : Math.round(v).toLocaleString("de-DE");
  return (
    <div className="kpi sub-kpi rise" style={{ animationDelay: 0.04 * idx + "s" }}>
      <div className="sk-top">
        <span className="sk-label">{label}</span>
        {delta ? <span className={"sk-delta " + (tone || "up")}>{tone === "down" ? <AI.trendDown /> : <AI.trendUp />}{delta}</span> : null}
      </div>
      <div className={"sk-val " + (color || "")}>{display}</div>
      {spark ? <Sparkline data={spark} color={sparkColor || "var(--primary)"} /> : null}
      {sub ? <div className="sk-sub">{sub}</div> : null}
      {details ? <a className="sk-link" href="#" onClick={(e) => { e.preventDefault(); onLink && onLink(); }}>Details <Icon.arrowRight /></a> : null}
    </div>
  );
}

function SubsDetail({ detail, plans, payments, live, onClose }) {
  const k = detail.kind;
  const fmt = (n, cur) => (cur === "USD" ? "$ " : "€ ") + Number(n || 0).toLocaleString("de-DE", { minimumFractionDigits: n % 1 ? 2 : 0 });
  const totalMrr = plans.reduce((s, p) => s + (p.mrr || 0), 0);
  const totalAbos = plans.reduce((s, p) => s + (p.count || 0), 0);
  let inner = null;
  if (k === "plans") {
    inner = (
      <table className="tbl" style={{ width: "100%" }}>
        <thead><tr><th>Plan</th><th>Abos</th><th>MRR</th><th>ARR</th><th>Anteil</th></tr></thead>
        <tbody>
          {plans.map((p, i) => (
            <tr key={i}>
              <td><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: p.color, marginRight: 8 }}></span>{p.label}</td>
              <td>{p.count}</td>
              <td>{fmt(p.mrr, p.cur)}</td>
              <td>{fmt(p.mrr * 12, p.cur)}</td>
              <td>{totalMrr ? Math.round((p.mrr / totalMrr) * 100) : 0} %</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr style={{ fontWeight: 800 }}>
          <td>Gesamt</td><td>{totalAbos}</td><td>{fmt(Math.round(totalMrr), "EUR")}</td><td>{fmt(Math.round(totalMrr * 12), "EUR")}</td><td>100 %</td>
        </tr></tfoot>
      </table>
    );
  } else if (k === "payments") {
    inner = payments.length ? (
      <table className="tbl" style={{ width: "100%" }}>
        <thead><tr><th>Kunde</th><th>Datum</th><th>Plan</th><th>Betrag</th><th>Status</th></tr></thead>
        <tbody>{payments.map((p, i) => (<tr key={i}><td>{p.name}</td><td>{p.date}</td><td>{p.plan}</td><td>{fmt(p.amount, p.cur)}</td><td>{p.status}</td></tr>))}</tbody>
      </table>
    ) : <div style={{ padding: 10, color: "var(--fg-muted)", fontWeight: 600 }}>Keine Zahlungen im Zeitraum.</div>;
  } else if (k === "bucket") {
    const all = (live && live.paymentsAll) || [];
    const rows = detail.start != null ? all.filter((p) => p.created >= detail.start && p.created < detail.end) : [];
    const sum = rows.reduce((acc, p) => acc + (p.amount || 0), 0);
    inner = rows.length ? (
      <table className="tbl" style={{ width: "100%" }}>
        <thead><tr><th>Kunde</th><th>Datum</th><th>Plan</th><th>Betrag</th><th>Status</th></tr></thead>
        <tbody>{rows.map((p, i) => (<tr key={i}><td>{p.name}</td><td>{p.date}</td><td>{p.plan}</td><td>{fmt(p.amount, p.cur)}</td><td>{p.status}</td></tr>))}</tbody>
        <tfoot><tr style={{ fontWeight: 800 }}><td colSpan={3}>Summe ({rows.length})</td><td>{fmt(Math.round(sum), "EUR")}</td><td></td></tr></tfoot>
      </table>
    ) : <div style={{ padding: 10, color: "var(--fg-muted)", fontWeight: 600, fontSize: 13.5, lineHeight: 1.5 }}>Keine echten Zahlungen in diesem Zeitraum{live ? "" : " (nur mit Live-Daten aus Stripe)"}.</div>;
  } else {
    const rows = (live && (k === "overdue" ? live.overdueList : k === "newCustomers" ? live.newCustomersList : live.churnList)) || [];
    if (!rows.length) {
      inner = <div style={{ padding: 10, color: "var(--fg-muted)", fontWeight: 600, fontSize: 13.5, lineHeight: 1.5 }}>Die Detailliste erscheint mit <b>Live-Daten aus Stripe</b> (im Demo-Modus nicht verfügbar).</div>;
    } else if (k === "overdue") {
      inner = <table className="tbl" style={{ width: "100%" }}><thead><tr><th>Kunde</th><th>Betrag/Mo</th><th>Status</th></tr></thead><tbody>{rows.map((r, i) => (<tr key={i}><td>{r.name}</td><td>{fmt(r.amount, r.cur)}</td><td>{r.status}</td></tr>))}</tbody></table>;
    } else if (k === "newCustomers") {
      inner = <table className="tbl" style={{ width: "100%" }}><thead><tr><th>Kunde</th><th>E-Mail</th><th>Datum</th></tr></thead><tbody>{rows.map((r, i) => (<tr key={i}><td>{r.name}</td><td>{r.email || "—"}</td><td>{r.date}</td></tr>))}</tbody></table>;
    } else {
      inner = <table className="tbl" style={{ width: "100%" }}><thead><tr><th>Kunde</th><th>Gekündigt am</th></tr></thead><tbody>{rows.map((r, i) => (<tr key={i}><td>{r.name}</td><td>{r.date}</td></tr>))}</tbody></table>;
    }
  }
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><AI.euro size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>{detail.title}</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{live ? "Live aus Stripe" : "Demo-Daten"}</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">{inner}</div>
      </div>
    </div>
  );
}

/* Express-Zahlungslinks anlegen — direkt aus dem Admin (ops-Dienst hat Key + Stripe-Zugriff). */
function ExpressSetupCard({ connected, toast }) {
  const [report, setReport] = React.useState(null);
  const [applied, setApplied] = React.useState(null);
  const [busy, setBusy] = React.useState("");
  const [err, setErr] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const run = async (apply) => {
    setBusy(apply ? "apply" : "plan"); setErr("");
    try {
      const j = await setupExpressLinks({ apply });
      if (apply) { setApplied(j); if (toast) toast(`Express-Links: ${j.created} angelegt, ${j.skipped} vorhanden ✓`); }
      else { setReport(j); setApplied(null); }
    } catch (e) { setErr(e.message || "Fehlgeschlagen"); }
    finally { setBusy(""); }
  };

  const result = applied || report;
  const isReal = (v) => typeof v === "string" && v.startsWith("https://buy.stripe.com");
  const realLinks = result ? Object.entries(result.links).filter(([, v]) => isReal(v)) : [];
  const hasPlaceholders = result ? Object.values(result.links).some((v) => !isReal(v)) : false;
  const registryBlock = realLinks.length
    ? "export const EXPRESS_PAYMENT_LINKS: Record<string, string> = {\n" + realLinks.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n") + "\n};"
    : "";

  return (
    <div className="panel rise" style={{ marginBottom: 18 }}>
      <div className="panel-head">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon.zap /> Express-Zahlungslinks</h2>
          <div className="ph-sub">Legt die Stripe-Links für die Express-Löschung an (alle Schutz- & Währungs-Kombinationen) — Steuer & Abo genau wie bei den bestehenden Links.</div>
        </div>
        <button className="btn btn-sec" onClick={() => setOpen(!open)}>{open ? "Schließen" : "Öffnen"}</button>
      </div>
      {open && (
        <div style={{ padding: "6px 2px 2px" }}>
          {!connected ? (
            <div style={{ background: "var(--orange-50)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "var(--fg-2)" }}>
              Stripe ist nicht verbunden. Am ops-Dienst (Railway) einen <b>STRIPE_SECRET_KEY mit Schreibrechten</b> für Produkte, Preise &amp; Payment Links setzen, dann hier erneut öffnen.
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <button className="btn btn-sec" disabled={!!busy} onClick={() => run(false)}>{busy === "plan" ? "Prüfe…" : "1) Plan prüfen (Trockenlauf)"}</button>
                <button className="btn btn-pri" disabled={!!busy || !report || !!applied} onClick={() => run(true)}>{busy === "apply" ? "Lege an…" : "2) Jetzt anlegen"}</button>
              </div>
              {err && <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{err}</div>}
              {result && (
                <div style={{ fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 5 }}>
                    {applied ? `✓ ${applied.created} angelegt, ${applied.skipped} bereits vorhanden.` : `Trockenlauf: ${report.created} würden neu angelegt, ${report.skipped} existieren bereits.`}
                  </div>
                  <div style={{ color: "var(--fg-2)", marginBottom: 10 }}>
                    Steuer übernommen: automatic_tax={String(result.houseStyle.automatic_tax)} · tax_id_collection={String(result.houseStyle.tax_id_collection)}
                    {result.houseStyle.sampleLink ? "" : " · ⚠ kein Vorlage-Link gefunden — Steuer bitte prüfen"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {Object.entries(result.links).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", gap: 8, fontFamily: "monospace", fontSize: 12, flexWrap: "wrap" }}>
                        <span style={{ color: "var(--fg-2)", minWidth: 200 }}>{k}</span>
                        {isReal(v) ? <a href={v} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{v}</a> : <span style={{ color: "var(--fg-muted)" }}>{v}</span>}
                      </div>
                    ))}
                  </div>
                  {!applied && hasPlaceholders && <div style={{ marginTop: 10, color: "var(--fg-2)" }}>Sieht gut aus? Dann auf <b>„2) Jetzt anlegen"</b>.</div>}
                  {realLinks.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{applied ? "Fertig. (Greift sofort.) " : "Vorhandene Express-Links. "}Für <code>paymentLinks.ts</code> — oder kopier den Block Claude hier rein:</div>
                      <textarea readOnly value={registryBlock} onFocus={(e) => e.target.select()} style={{ width: "100%", minHeight: 110, fontFamily: "monospace", fontSize: 12, padding: 10, borderRadius: 8, border: "1px solid var(--hairline)", resize: "vertical" }} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SubsDashboard({ toast }) {
  const [liveData, setLiveData] = React.useState(null);
  const [stripeErr, setStripeErr] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [detail, setDetail] = React.useState(null);
  const [range, setRange] = React.useState("day");
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const d = await fetchStripe();
        if (!alive) return;
        if (d && d.connected) setLiveData(d);
        else setStripeErr((d && d.error) || "Kein STRIPE_SECRET_KEY gesetzt.");
      } catch (e) { if (alive) setStripeErr(e.message || "Stripe-Aufruf fehlgeschlagen."); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);
  const SUBS = (liveData && liveData.subs) || SUBS_SAMPLE;
  const PLANS = (liveData && liveData.plans) || PLANS_SAMPLE;
  const PAYMENTS = (liveData && liveData.payments) || PAYMENTS_SAMPLE;
  const REV = (liveData && liveData.rev) || { day: DAILY_REV_SAMPLE, week: WEEKLY_REV_SAMPLE, month: MONTHLY_REV_SAMPLE };
  const series = REV[range] || [];
  const maxDay = Math.max(1, ...series.map((d) => d.v));
  const avgDay = series.length ? series.reduce((s, d) => s + d.v, 0) / series.length : 0;
  const totalRev = series.reduce((s, d) => s + d.v, 0);
  const totalAbos = PLANS.reduce((s, p) => s + p.count, 0);
  const note = (m) => toast ? toast(m) : null;
  return (
    <div className="content subs-page">{detail ? <SubsDetail detail={detail} plans={PLANS} payments={PAYMENTS} live={liveData} onClose={() => setDetail(null)} /> : null}
      {!loading && !liveData ? (
        <div style={{ background: "var(--orange-50)", border: "1px solid var(--hairline)", borderRadius: 12, padding: "11px 15px", marginBottom: 16, fontSize: 13, fontWeight: 600, color: "var(--fg-2)", lineHeight: 1.5 }}>
          <b>Demo-Daten</b> — Stripe nicht verbunden{stripeErr ? <span>: <span style={{ color: "var(--danger)", fontWeight: 700 }}>{stripeErr}</span></span> : <span>. STRIPE_SECRET_KEY (read-only) am ops-Dienst in Railway setzen.</span>}
        </div>
      ) : null}
      <ExpressSetupCard connected={!!liveData} toast={toast} />
      <div className="sec-eyebrow rise" style={{ animationDelay: "0s" }}>Subscription KPIs <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 800, padding: "2px 9px", borderRadius: 999, background: liveData ? "rgba(16,185,129,.14)" : "rgba(148,140,130,.16)", color: liveData ? "#0a8f5b" : "#6b6259", textTransform: "none", letterSpacing: 0 }}>{loading ? "● lädt…" : liveData ? "● Live aus Stripe" : "● Demo-Daten"}</span></div>
      <div className="kpis sub-kpis">
        <SubKpi idx={0} label="MRR" value={SUBS.mrr} format={(n) => eur(Math.round(n))} color="orange" delta="+8,2 %" tone="up" spark={SPARK.mrr} sparkColor="var(--primary)" details onLink={() => setDetail({ kind: "plans", title: "MRR — Zusammensetzung nach Plan" })} />
        <SubKpi idx={1} label="ARR" value={SUBS.arr} format={(n) => eur(Math.round(n))} color="orange" delta="+8,2 %" tone="up" spark={SPARK.arr} sparkColor="var(--primary)" details onLink={() => setDetail({ kind: "plans", title: "ARR — Zusammensetzung nach Plan" })} />
        <SubKpi idx={2} label="Aktive Abos" value={SUBS.active} color="green" delta="+6" tone="up" spark={SPARK.active} sparkColor="var(--success)" sub={SUBS.trialing + " in Testphase"} details onLink={() => setDetail({ kind: "plans", title: "Aktive Abos — nach Plan" })} />
        <SubKpi idx={3} label="Überfällig" value={SUBS.overdue} color="red" delta="−1" tone="down" spark={SPARK.overdue} sparkColor="var(--danger)" sub="Zahlungsverzug" details onLink={() => setDetail({ kind: "overdue", title: "Überfällige Abos" })} />
      </div>

      <div className="sec-eyebrow rise" style={{ animationDelay: "0.05s" }}>Monat — Übersicht</div>
      <div className="kpis sub-kpis">
        <SubKpi idx={4} label="Umsatz" value={SUBS.monthRevenue} format={(n) => eur(Math.round(n))} delta="+12,4 %" tone="up" sub="Monat" />
        <SubKpi idx={5} label="Rechnungen" value={SUBS.paidInvoices} delta="+3" tone="up" sub="bezahlte Rg." details onLink={() => setDetail({ kind: "payments", title: "Bezahlte Rechnungen (Monat)" })} />
        <SubKpi idx={6} label="Neue Kunden" value={SUBS.newCustomers} color="green" delta="+2" tone="up" details onLink={() => setDetail({ kind: "newCustomers", title: "Neue Kunden (Monat)" })} />
        <SubKpi idx={7} label="Gekündigt" value={SUBS.churned} color="red" delta="+1" tone="down" details onLink={() => setDetail({ kind: "churn", title: "Kündigungen (Monat)" })} />
      </div>

      <div className="grid-2">
        <div className="panel rise" style={{ animationDelay: "0.1s" }}>
          <div className="panel-head">
            <div><h2>Umsatz</h2><div className="ph-sub">{range === "day" ? "Täglich · aktueller Monat" : range === "week" ? "Wöchentlich · letzte 12 Wochen" : "Monatlich · letzte 12 Monate"}</div></div>
            <div className="ph-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="chips">
                {[["day", "Tag"], ["week", "Woche"], ["month", "Monat"]].map(([id, lbl]) => (
                  <button key={id} className={"chipf" + (range === id ? " on" : "")} onClick={() => setRange(id)}>{lbl}</button>
                ))}
              </div>
              <span className="chart-total">{eur(Math.round(totalRev))}</span>
            </div>
          </div>
          <div className="rev-chart">
            <div className="rev-avg" style={{ bottom: (maxDay ? avgDay / maxDay * 100 : 0) + "%" }}><span className="rev-avg-lbl">Ø {eur(Math.round(avgDay))}</span></div>
            {series.map((d, i) => (
              <div className="rev-col" key={i} style={{ cursor: "pointer" }} onClick={() => setDetail({ kind: "bucket", title: "Zahlungen · " + d.d, start: d.start, end: d.end })}>
                <div className="rev-bar" style={{ height: Math.max(2, Math.round(d.v / maxDay * 100)) + "%", animationDelay: 0.12 + i * 0.05 + "s" }}>
                  <span className="rev-val">{eur(d.v)}</span>
                </div>
                <div className="rev-x">{d.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel rise" style={{ animationDelay: "0.16s" }}>
          <div className="panel-head"><div><h2>Abo-Mix</h2><div className="ph-sub">Plan anklicken → Abonnenten anzeigen</div></div></div>
          <div className="mix-body">
            <Donut plans={PLANS} total={totalAbos} />
            <div className="planlist">
              {PLANS.map((p, i) => (
                <div className="planrow" key={i} onClick={() => note(p.count + " Abonnenten · " + p.label)}>
                  <div className="pr-top">
                    <span className="pr-label"><span className="pr-dot" style={{ background: p.color }}></span>{p.label}</span>
                    <span className="pr-meta" style={{ whiteSpace: "nowrap" }}>{p.count} Abos · {planAmt(p)}/Mo <Icon.arrowRight /></span>
                  </div>
                  <div className="planbar"><div className="planbar-fill" style={{ width: Math.max(2, Math.round(p.count / totalAbos * 100)) + "%", background: p.color, animationDelay: 0.2 + i * 0.08 + "s" }}></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sec-eyebrow rise" style={{ marginTop: 26, animationDelay: "0.2s" }}>Reaktivierungspotenzial</div>
      <div className="reactiv rise" style={{ animationDelay: "0.22s" }} onClick={() => note("KI-Mail an reaktivierbare Kunden vorbereiten")}>
        <span className="re-tile"><span className="re-pulse"></span><Icon.refresh /></span>
        <div className="re-body">
          <div className="re-h"><b>{SUBS.reactivatable}</b> reaktivierbare Kunden</div>
          <div className="re-sub">Zahlung fehlgeschlagen (past_due + incomplete)</div>
        </div>
        <span className="re-cta"><Icon.sparkle /> KI-Mail senden</span>
        <Icon.arrowRight className="re-arrow" />
      </div>

      <div className="panel rise" style={{ marginTop: 22, animationDelay: "0.26s" }}>
        <div className="panel-head">
          <div><h2>Letzte Zahlungen</h2><div className="ph-sub">Monat · Zeile anklicken für Details</div></div>
          <div className="ph-right"><span className="rg-badge">{SUBS.paidInvoices} Rg.</span></div>
        </div>
        <div className="paylist">
          {PAYMENTS.map((p, i) => {
            const [cls, label] = PAY_STATUS[p.status] || ["pay-pend", p.status];
            return (
              <div className="payrow" key={i} onClick={() => note(p.name + " · " + p.plan)}>
                <span className="py-ava" style={{ background: AVA_COLORS[i % AVA_COLORS.length] }}>{subInitials(p.name)}</span>
                <div className="py-main">
                  <div className="py-name">{p.name}</div>
                  <div className="py-meta">{p.date} · {p.plan} <span className="py-price">(at {p.price})</span></div>
                </div>
                <div className="py-right">
                  <div className="py-amt">{payAmt(p)}</div>
                  <span className={"py-chip " + cls}><span className="py-cd"></span>{label}</span>
                </div>
                <Icon.arrowRight className="py-chev" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export { SubsDashboard };
