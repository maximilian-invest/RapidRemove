"use client";
/* Partner-Statistiken (Admin → Partner → Statistiken): Zeiten, Löschquoten je Merkmal, Auffälligkeiten,
   nicht löschbare Bewertungen, Arbeitszeiten, Wochenverlauf, offene Aufgaben, Kosten. Daten: /admin/partner/stats. */
import React from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, Star, Info } from "lucide-react";
import { partnerStats } from "@/lib/admin-api";

const fmtH = (h) => (h == null ? "–" : h < 1 ? Math.round(h * 60) + " Min." : h < 48 ? String(Math.round(h * 10) / 10).replace(".", ",") + " Std." : String(Math.round((h / 24) * 10) / 10).replace(".", ",") + " Tage");
const rateCol = (q) => (q == null ? "#d4d4d8" : q >= 70 ? "var(--success)" : q >= 40 ? "var(--warning)" : "var(--danger)");
const KIND = { normal: "Bis 4 Wo.", old: "Älter 4 Wo.", nt: "Ohne Text", profile: "Profil" };
const ST = { not_possible: "Nicht möglich", software: "Nur Software", new: "Neu", working: "In Arbeit" };
const fmtD = (iso) => (iso ? new Date(iso).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "");
const DIMS = [["kind", "Kategorie"], ["stars", "Sterne"], ["text", "Textlänge"], ["age", "Alter"], ["country", "Land"], ["lang", "Sprache"], ["business", "Unternehmen"], ["weekday", "Wochentag"]];
const TIMES = [["reaction", "Reaktionszeit", "Gesendet → erste Aktion des Partners"], ["toStart", "Bis „In Arbeit“", "Gesendet → auf Working gesetzt"], ["work", "Bearbeitung", "Working → gelöscht"], ["total", "Gesamt bis gelöscht", "Gesendet → gelöscht"], ["toFail", "Bis „nicht möglich“", "Gesendet → nicht möglich / nur Software"]];

export default function PartnerStatsScreen({ ctx }) {
  const { setMoreSub } = ctx;
  const [days, setDays] = React.useState(0);
  const [d, setD] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [dim, setDim] = React.useState("kind");
  const [pid, setPid] = React.useState(null);
  React.useEffect(() => {
    let live = true;
    setErr("");
    partnerStats(days).then((r) => { if (live) setD(r); }).catch((e) => { if (live) setErr(e.message); });
    return () => { live = false; };
  }, [days]);
  const list = (d && d.partners) || [];
  const p = list.find((x) => x.id === pid) || list[0] || null;
  return (
    <div className="pstx">
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub("partner")}><ArrowLeft /></button></div>
      <div className="ttl">Statistiken</div>
      <div className="px-top">
        {list.length > 1 ? <div className="seg2">{list.map((x) => <button key={x.id} type="button" className={p && p.id === x.id ? "on" : ""} onClick={() => setPid(x.id)}>{x.name}</button>)}</div> : <span className="px-pn">{p ? p.name : ""}</span>}
        <div className="seg2">{[[30, "30 Tage"], [90, "90 Tage"], [0, "Alles"]].map(([v, l]) => <button key={v} type="button" className={days === v ? "on" : ""} onClick={() => setDays(v)}>{l}</button>)}</div>
      </div>
      {err ? <div className="aempty"><b>Fehler</b>{err}</div> : null}
      {!d && !err ? <div className="aempty"><b>Lädt …</b></div> : null}
      {d && !p ? <div className="aempty"><b>Noch keine Daten</b></div> : null}
      {p ? <Body p={p} dim={dim} setDim={setDim} /> : null}
    </div>
  );
}

function Body({ p, dim, setDim }) {
  const c = p.counts, t = p.times;
  if (!c.total) return <div className="aempty"><b>Noch keine Aufgaben</b>Sobald der Partner Bewertungen bearbeitet, erscheinen hier die Zahlen.</div>;
  const maxB = Math.max(1, ...p.durBuckets.map((b) => b.n));
  const maxH = Math.max(1, ...p.hours);
  const maxW = Math.max(1, ...p.weeks.map((w) => Math.max(w.sent, w.removed + w.failed)));
  const peak = p.hours.map((n, h) => [n, h]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, h]) => h).sort((a, b) => a - b);
  const groups = (p.dims[dim] || []);
  return (
    <>
      <div className="kgrid px-k">
        <div className="kc"><span className="kl">Löschquote</span><b style={{ color: rateCol(c.rate) }}>{c.rate == null ? "–" : c.rate + " %"}</b><span className="ks">{c.removed} von {c.removed + c.notPossible + c.software} entschieden</span></div>
        <div className="kc"><span className="kl">Gesamt bis gelöscht</span><b>{fmtH(t.total && t.total.median)}</b><span className="ks">Median · Ø {fmtH(t.total && t.total.avg)}</span></div>
        <div className="kc"><span className="kl">Reaktionszeit</span><b>{fmtH(t.reaction && t.reaction.median)}</b><span className="ks">bis zur ersten Aktion (Median)</span></div>
        <div className="kc"><span className="kl">Nicht löschbar</span><b>{c.notPossible + c.software}</b><span className="ks">{c.notPossible} nicht möglich · {c.software} nur Software</span></div>
        <div className="kc"><span className="kl">Offen</span><b>{c.open}</b><span className="ks">{p.open.untouched48 ? p.open.untouched48 + " > 48 Std. unberührt" : "nichts liegt lange"}{p.open.stuck72 ? " · " + p.open.stuck72 + " > 3 Tage in Arbeit" : ""}</span></div>
        <div className="kc"><span className="kl">Kosten je Löschung</span><b>{p.money.perRemovedUsd == null ? "–" : "$" + p.money.perRemovedUsd}</b><span className="ks">${p.money.paidUsd} bezahlt · ${p.money.owedUsd} offen</span></div>
      </div>

      {p.insights.length ? (
        <>
          <div className="sec3"><h2>Auffälligkeiten</h2></div>
          <div className="card px-ins">
            {p.insights.map((x, i) => (
              <div key={i} className={"px-i " + x.tone}>
                <span className="ic">{x.tone === "bad" ? <AlertTriangle /> : x.tone === "good" ? <CheckCircle2 /> : <Clock />}</span>
                <span>{x.text}</span>
              </div>
            ))}
            <p className="px-note">Gruppen mit mind. 3 entschiedenen Bewertungen, die deutlich (± 15 Prozentpunkte bzw. 60 % Zeit) vom Schnitt abweichen.</p>
          </div>
        </>
      ) : null}

      <div className="sec3"><h2>Zeiten</h2></div>
      <div className="card px-times">
        <div className="px-th"><span /><span>Median</span><span>Ø</span><span>90 %</span></div>
        {TIMES.map(([k, l, s]) => (
          <div key={k} className="px-tr" title={s}>
            <span className="l"><b>{l}</b><small>{s}{t[k] ? ` · ${t[k].n}×` : ""}</small></span>
            <span><b>{fmtH(t[k] && t[k].median)}</b></span><span>{fmtH(t[k] && t[k].avg)}</span><span>{fmtH(t[k] && t[k].p90)}</span>
          </div>
        ))}
        <div className="px-sub">Dauer bis gelöscht – Verteilung</div>
        <div className="px-dist">
          {p.durBuckets.map((b) => (
            <div key={b.label} className="px-db" title={`${b.label}: ${b.n} Bewertungen`}>
              <span className="v">{b.n || ""}</span>
              <span className="col"><i style={{ height: (b.n / maxB) * 100 + "%" }} /></span>
              <span className="x">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sec3"><h2>Löschquote nach Merkmal</h2></div>
      <div className="achips px-chips">{DIMS.map(([k, l]) => <button key={k} type="button" className={"achip" + (dim === k ? " on" : "")} onClick={() => setDim(k)}>{l}</button>)}</div>
      <div className="card px-dim">
        {groups.length ? groups.map((g) => (
          <div key={g.label} className="px-g">
            <div className="t"><span>{g.label}</span><b style={{ color: g.rate == null ? "var(--g3)" : "var(--ink)" }}>{g.rate == null ? "–" : g.rate + " %"}</b></div>
            <span className="bar"><i style={{ "--w": (g.rate || 0) + "%", background: rateCol(g.rate) }} /></span>
            <span className="s">{g.removed} gelöscht{g.notPossible ? ` · ${g.notPossible} nicht möglich` : ""}{g.software ? ` · ${g.software} Software` : ""}{g.open ? ` · ${g.open} offen` : ""}{g.hours ? ` · Median ${fmtH(g.hours.median)}` : ""}</span>
          </div>
        )) : <div className="px-empty">Keine Daten für dieses Merkmal.</div>}
        {dim === "stars" || dim === "age" ? <p className="px-note">Sterne und Alter werden für Bewertungen erfasst, die der Kunde über die Google-Suche im Bestellformular ausgewählt hat (seit 06.10.2026).</p> : null}
      </div>

      <div className="sec3"><h2>Nicht löschbar</h2><span className="px-cnt">{p.failed.length}</span></div>
      {p.noteWords.length ? <div className="px-words"><span>Häufig in den Partner-Notizen:</span>{p.noteWords.map((w) => <i key={w.w}>{w.w} <b>{w.n}</b></i>)}</div> : null}
      <div className="card px-fail">
        {p.failed.length ? p.failed.map((f, i) => (
          <div key={(f.code || "") + i} className="px-f">
            <div className="h"><b>{f.name || "Bewertung"}</b>{f.rating ? <span className="st">{f.rating}<Star /></span> : null}<span className="tg">{KIND[f.kind] || f.kind}</span><span className={"tg " + f.status}>{ST[f.status]}</span></div>
            {f.text ? <p className="q">„{f.text}“</p> : null}
            {f.note ? <p className="n"><Info />{f.note}</p> : null}
            <span className="m">{f.customer || "—"}{f.orderId ? " · #" + f.orderId : ""} · {f.code} · {fmtD(f.at)}{f.ageDays != null ? ` · ${f.ageDays} Tage alt` : ""}</span>
          </div>
        )) : <div className="px-empty">Bisher wurde jede entschiedene Bewertung gelöscht.</div>}
      </div>

      <div className="sec3"><h2>Arbeitszeiten</h2></div>
      <div className="card px-hours">
        <div className="px-hb">
          {p.hours.map((n, h) => <span key={h} className="hcol" title={`${String(h).padStart(2, "0")}:00–${String(h).padStart(2, "0")}:59 · ${n} Aktionen`}><i style={{ height: (n / maxH) * 100 + "%" }} /></span>)}
        </div>
        <div className="px-hx"><span>0</span><span>6</span><span>12</span><span>18</span><span>23 Uhr</span></div>
        <p className="px-note">Wann der Partner startet und löscht (Wiener Zeit). Am aktivsten: {peak.map((h) => h + " Uhr").join(", ")}.</p>
      </div>

      <div className="sec3"><h2>Wochenverlauf</h2></div>
      <div className="card px-weeks">
        <div className="px-wb">
          {p.weeks.map((w) => (
            <div key={w.label} className="wk" title={`Woche ab ${w.label}: ${w.sent} gesendet · ${w.removed} gelöscht · ${w.failed} nicht löschbar${w.median != null ? " · Median " + fmtH(w.median) : ""}`}>
              <span className="pair">
                <i className="sent" style={{ height: (w.sent / maxW) * 100 + "%" }} />
                <span className="stack" style={{ height: ((w.removed + w.failed) / maxW) * 100 + "%" }}>
                  {w.failed ? <i className="fail" style={{ flex: w.failed }} /> : null}{w.removed ? <i className="rem" style={{ flex: w.removed }} /> : null}
                </span>
              </span>
              <span className="x">{w.label}</span>
            </div>
          ))}
        </div>
        <div className="px-leg"><span><i className="sent" />Gesendet</span><span><i className="rem" />Gelöscht</span><span><i className="fail" />Nicht löschbar</span></div>
      </div>

      {p.open.list.length ? (
        <>
          <div className="sec3"><h2>Am längsten offen</h2></div>
          <div className="card px-open">
            {p.open.list.map((o, i) => (
              <div key={(o.code || "") + i} className="px-o">
                <span className={"dot " + o.status} />
                <span className="t"><b>{o.name || o.customer || o.code}</b><small>{o.customer || ""}{o.orderId ? " · #" + o.orderId : ""} · {o.code} · {KIND[o.kind] || o.kind}</small></span>
                <span className="a"><b>{fmtH(o.ageH)}</b><small>{o.status === "working" ? "in Arbeit " + fmtH(o.workingH) : o.touched ? "gesehen" : "unberührt"}</small></span>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <p className="px-note px-foot">Alle Statuswechsel werden ab jetzt automatisch protokolliert. Ältere Aufgaben: Zeiten aus den gespeicherten Zeitstempeln, nachgetragene Altdaten ohne echte Zeiten zählen nicht in die Dauer. Testaufträge zählen nie.{p.since ? " Daten seit " + fmtD(p.since) + "." : ""}</p>
    </>
  );
}
