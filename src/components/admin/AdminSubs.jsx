"use client";
import React from "react";
import { Icon as BaseIcon } from "@/components/Icons";
import { AdminIcon } from "./AdminIcons";
import { SUBS, PLANS, DAILY_REV, PAYMENTS } from "@/lib/admin-data";
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

function SubsDashboard({ toast }) {
  const maxDay = Math.max(...DAILY_REV.map((d) => d.v));
  const totalAbos = PLANS.reduce((s, p) => s + p.count, 0);
  const avgDay = DAILY_REV.reduce((s, d) => s + d.v, 0) / DAILY_REV.length;
  const note = (m) => toast ? toast(m) : null;
  return (
    <div className="content subs-page">
      <div className="sec-eyebrow rise" style={{ animationDelay: "0s" }}>Subscription KPIs</div>
      <div className="kpis sub-kpis">
        <SubKpi idx={0} label="MRR" value={SUBS.mrr} format={(n) => eur(Math.round(n))} color="orange" delta="+8,2 %" tone="up" spark={SPARK.mrr} sparkColor="var(--primary)" details onLink={() => note("MRR-Detailansicht geöffnet")} />
        <SubKpi idx={1} label="ARR" value={SUBS.arr} format={(n) => eur(Math.round(n))} color="orange" delta="+8,2 %" tone="up" spark={SPARK.arr} sparkColor="var(--primary)" details onLink={() => note("ARR-Detailansicht geöffnet")} />
        <SubKpi idx={2} label="Aktive Abos" value={SUBS.active} color="green" delta="+6" tone="up" spark={SPARK.active} sparkColor="var(--success)" sub={SUBS.trialing + " in Testphase"} details onLink={() => note("Aktive Abonnements")} />
        <SubKpi idx={3} label="Überfällig" value={SUBS.overdue} color="red" delta="−1" tone="down" spark={SPARK.overdue} sparkColor="var(--danger)" sub="Zahlungsverzug" details onLink={() => note("Überfällige Zahlungen")} />
      </div>

      <div className="sec-eyebrow rise" style={{ animationDelay: "0.05s" }}>Monat — Übersicht</div>
      <div className="kpis sub-kpis">
        <SubKpi idx={4} label="Umsatz" value={SUBS.monthRevenue} format={(n) => eur(Math.round(n))} delta="+12,4 %" tone="up" sub="Monat" />
        <SubKpi idx={5} label="Rechnungen" value={SUBS.paidInvoices} delta="+3" tone="up" sub="bezahlte Rg." details onLink={() => note("Rechnungsliste")} />
        <SubKpi idx={6} label="Neue Kunden" value={SUBS.newCustomers} color="green" delta="+2" tone="up" details onLink={() => note("Neue Kunden im Monat")} />
        <SubKpi idx={7} label="Gekündigt" value={SUBS.churned} color="red" delta="+1" tone="down" details onLink={() => note("Kündigungen im Monat")} />
      </div>

      <div className="grid-2">
        <div className="panel rise" style={{ animationDelay: "0.1s" }}>
          <div className="panel-head"><div><h2>Umsatz — Monat</h2><div className="ph-sub">Täglich, bezahlte Rechnungen</div></div><div className="ph-right"><span className="chart-total">{eur(SUBS.monthRevenue)}</span></div></div>
          <div className="rev-chart">
            <div className="rev-avg" style={{ bottom: (avgDay / maxDay * 100) + "%" }}><span className="rev-avg-lbl">Ø {eur(Math.round(avgDay))}</span></div>
            {DAILY_REV.map((d, i) => (
              <div className="rev-col" key={i}>
                <div className="rev-bar" style={{ height: Math.max(2, Math.round(d.v / maxDay * 100)) + "%", animationDelay: 0.12 + i * 0.05 + "s" }}>
                  <span className="rev-val">{eur(d.v)}</span>
                </div>
                <div className="rev-x">{d.d.replace(".06.", "")}</div>
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
