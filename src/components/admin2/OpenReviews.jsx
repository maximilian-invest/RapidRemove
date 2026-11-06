"use client";
/* „In Bearbeitung" (Aufträge → Kachel In Bearbeitung): jede offene Bewertung einzeln – in der Kunden-Ansicht aufklappbar
 * unter dem Kunden, in der Listen-Ansicht untereinander (neueste Bestellung zuerst). Quelle sind die Bewertungen AM AUFTRAG
 * (reviewItems bzw. angenommene), nicht nur die Partner-Aufgaben – auch Bewertungen, die (noch) nicht beim Partner liegen.
 * Je Bewertung: Verfasser als Direktlink zur Bewertung, Sterne, Alter heute, Partner-Status.
 *
 * Auto-Scan wie im Partner-Dashboard („Scan all reviews", ops/src/removalScan.ts): Google-Link UND Bewertungsliste müssen
 * „gelöscht" sagen, plus Nachweis „war bei Bestellung online".
 *   – Mit Partner-Aufgabe (Not started/Working): → „Gelöscht" (= Kunde wird automatisch belastet), sonst unverändert.
 *   – Ohne Partner-Aufgabe (Weiterleitung abgedreht): wie „Gelöschte abrechnen" vermerken + von der hinterlegten Zahlungsart
 *     abbuchen (ops/src/scanBill.ts); ohne Zahlungsart → „Gelöscht · abrechnen" (Team verrechnet per Rechnung).
 * Kleine Pakete nacheinander (Server-Browser schafft 2 gleichzeitig) → Fortschritt. */
import React from "react";
import { ScanSearch, Zap, CheckCircle2, Eye, HelpCircle, Square, ShieldCheck, Store, ExternalLink, ChevronDown } from "lucide-react";
import { fmtAge, SERVICE_L, orderMoney } from "./model";
import { partnerScan } from "@/lib/admin-api";
import { openGoogleLink } from "@/lib/open-google";

const DAY = 864e5;
const fmtD = (v) => (v ? new Date(v).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) : "—");
const fmtT = (v) => (v ? new Date(v).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : "");
const ageL = (d) => (d < 1 ? "heute" : d === 1 ? "1 Tag" : d + " Tage");
const keyOfItem = (it) => it.url || ((it.name || "") + "|" + (it.text || ""));
const RES = {
  gone: ["Gelöscht", "ok", CheckCircle2, " · verrechnet"],
  gone_manual: ["Gelöscht · abrechnen", "ok", CheckCircle2],
  visible: ["Noch online", "vis", Eye],
  unknown: ["Unklar", "unk", HelpCircle],
  skipped: ["Übersprungen", "vis", Eye],
};
/** Prüfbar: Partner-Aufgabe Not started/Working, oder gar keine Aufgabe (dann nur prüfen) – mit Link. */
export const scannable = (r) => r.kind === "review" && !!(r.it && r.it.url || r.t && r.t.url) && (!r.t || r.t.status === "new" || r.t.status === "working");

/** Offene Bewertungen eines Auftrags: jede eingereichte (bzw. angenommene) Bewertung, die weder gelöscht noch abgerechnet ist. */
export function reviewRowsOf(o, tasks, now) {
  if (!o || o.service !== "reviews") return [];
  const created = o.createdAt ? new Date(o.createdAt).getTime() : null;
  const items = o.reviewItems || [];
  const acc = o.reviewsAccepted ? new Set(o.reviewsAccepted.map(keyOfItem)) : null;
  const billed = new Set([...(o.reviewsRemovedAll || []), ...(o.reviewsRemoved || [])].map(keyOfItem));
  const byKey = new Map((tasks || []).filter((t) => t.status !== "cancelled").map((t) => [t.itemKey, t]));
  const out = [];
  items.forEach((it, idx) => {
    const key = keyOfItem(it);
    if (acc && !acc.has(key)) return; // vom Team abgelehnt
    if (billed.has(key)) return;
    const t = byKey.get(key) || null;
    if (t && (t.status === "removed" || t.paid || t.test)) return;
    const days0 = it.days !== null && it.days !== undefined && it.days !== "" && Number.isFinite(Number(it.days)) ? Number(it.days) : null;
    const age = days0 == null || !created ? null : days0 + Math.floor((now - created) / DAY); // Alter der Bewertung heute
    out.push({ k: t ? "t" + t.id : "i" + o.id + "#" + idx, kind: "review", o, it, idx, t, age, created, stars: Math.round(Number(it.rating || (t && t.rating)) || 0) });
  });
  return out;
}

/** Zeilen für die Listenansicht: je offene Bewertung eine Zeile, je Profil-Auftrag eine Zeile. */
export function flatRows(orders, ptasks, now) {
  const out = [];
  for (const o of orders) {
    if (o.service !== "reviews") { out.push({ k: "p" + o.id, kind: "profile", o, created: o.createdAt ? new Date(o.createdAt).getTime() : null, age: null }); continue; }
    out.push(...reviewRowsOf(o, ptasks[o.id], now));
  }
  return out;
}
export const SORTS = { ordered: (a, b) => (b.created || 0) - (a.created || 0) }; // neueste Bestellung zuerst

/** Scan-Zustand (bleibt beim Filter-/Ansichtswechsel erhalten, solange die Auftragsliste offen ist). Ergebnisse je Zeilen-Schlüssel. */
export function useReviewScan(onDone) {
  const [res, setRes] = React.useState({}); // row.k → { result, why, at }
  const [scan, setScan] = React.useState(null); // { total, done, phase, at }
  const stopRef = React.useRef(false);
  const busy = !!(scan && scan.phase === "checking");
  const run = async (rows) => {
    if (!rows.length || busy) return;
    stopRef.current = false;
    setScan({ total: rows.length, done: 0, phase: "checking", at: Date.now() });
    for (let i = 0; i < rows.length; i += 2) {
      if (stopRef.current) { setScan((s) => ({ ...s, phase: "stopped" })); break; }
      const chunk = rows.slice(i, i + 2);
      const ids = chunk.filter((r) => r.t).map((r) => r.t.id);
      const items = chunk.filter((r) => !r.t).map((r) => ({ orderId: r.o.id, idx: r.idx }));
      let out;
      try { out = (await partnerScan(ids, items)).results || []; }
      catch (e) { out = []; }
      setRes((m) => {
        const n = { ...m };
        for (const r of chunk) {
          const x = out.find((y) => (r.t ? Number(y.id) === r.t.id : y.orderId === r.o.id && Number(y.idx) === r.idx));
          n[r.k] = x ? { result: x.result, why: x.why || "", at: Date.now() } : { result: "unknown", why: "Prüfung fehlgeschlagen – nichts geändert.", at: Date.now() };
        }
        return n;
      });
      setScan((s) => ({ ...s, done: Math.min(s.total, s.done + chunk.length) }));
    }
    setScan((s) => (s && s.phase === "checking" ? { ...s, phase: "done" } : s));
    if (onDone) onDone();
  };
  return { res, scan, busy, run, stop: () => { stopRef.current = true; } };
}

export function ScanCard({ sc, rows }) {
  const { scan, busy, res } = sc;
  const vals = Object.values(res);
  const nGone = vals.filter((x) => x.result === "gone").length, nMan = vals.filter((x) => x.result === "gone_manual").length;
  const nVis = vals.filter((x) => x.result === "visible").length, nUnk = vals.filter((x) => x.result === "unknown").length;
  const pct = scan ? Math.round((scan.done / Math.max(1, scan.total)) * 100) : 0;
  const n = rows.length;
  return (
    <div className={"orv-scan" + (scan ? " " + scan.phase : "")}>
      <span className="di">{busy ? <ScanSearch className="pulse" /> : scan ? <CheckCircle2 /> : <ShieldCheck />}</span>
      <span className="t">
        {!scan ? <>
          <b>Auto-Scan · {n} Bewertung{n === 1 ? "" : "en"} prüfbar</b>
          <span>Wie beim Partner: Nur wenn Google-Link <i>und</i> Bewertungsliste „gelöscht“ sagen → <b>Gelöscht</b> + automatische Abbuchung. Gilt für jede Bewertung, egal ob beim Partner.</span>
        </> : busy ? <>
          <b>Scan läuft · {scan.done} / {scan.total}</b>
          <span className="bar"><i style={{ "--w": pct + "%" }} /></span>
          <span>{nGone + nMan} gelöscht · {nVis} noch online · {nUnk} unklar</span>
        </> : <>
          <b>{scan.phase === "stopped" ? "Scan gestoppt" : "Scan fertig"} · {fmtT(scan.at)}</b>
          <span className="orv-sum">{nGone ? <em className="ok">{nGone} gelöscht ✓ verrechnet</em> : null}{nMan ? <em className="ok">{nMan} gelöscht – bitte abrechnen</em> : null}<em className="vis">{nVis} noch online</em>{nUnk ? <em className="unk">{nUnk} unklar – bitte prüfen</em> : null}</span>
        </>}
      </span>
      {busy ? <button type="button" className="orv-stop" onClick={sc.stop}><Square />Stopp</button>
        : n ? <button type="button" className="orv-go" onClick={() => sc.run(rows)}><ScanSearch />{n} scannen</button> : null}
    </div>
  );
}

/** Direktlink zur Bewertung (iPhone: Safari statt Maps-App). */
function RvLink({ r, toast, children }) {
  const url = (r.t && (r.t.gurl || r.t.url)) || (r.it && r.it.url) || "";
  if (!url) return <span className="rv">{children}</span>;
  return (
    <a className="rv rvl" href={url} target="_blank" rel="noopener noreferrer" title="Bewertung auf Google öffnen"
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); openGoogleLink(url, () => toast && toast("Link kopiert – in Safari einfügen")); }}>
      {children}<ExternalLink />
    </a>
  );
}

function statusOf(r, now) {
  const t = r.t;
  if (!t) return ["n", "Nicht beim Partner"];
  if (t.status === "working") { const m = t.workingSince ? Math.round((now - new Date(t.workingSince).getTime()) / 6e4) : null; return ["w", "In Arbeit" + (m != null ? " · " + fmtAge(m) : "")]; }
  if (t.status === "software") return ["s", "Software · wartet auf Kunde"];
  if (t.status === "not_possible") return ["x", "Partner: nicht möglich"];
  return ["n", "Beim Partner · nicht gestartet"];
}

/** Eine Bewertung (compact = unter dem Kunden in der Kunden-Ansicht) oder ein Profil-Auftrag (nur Liste). */
export function FlatRow({ r, j, now, sc, openOrder, Avatar, RStars, compact, toast }) {
  const o = r.o;
  if (r.kind === "profile") {
    const m = r.created ? Math.round((now - r.created) / 6e4) : 0;
    return (
      <div className="orv-r" style={{ "--pi": Math.min(j, 10) }}>
        <button type="button" className="orv-m" onClick={() => openOrder(o.id)} title="Auftrag öffnen">
          <Avatar o={o} />
          <span className="t">
            <span className="l1"><b>{o.profile || o.company || o.name || o.email}</b></span>
            <span className="l2"><span className="ktag kp"><Store />Profil</span><span className="rv">{SERVICE_L[o.service] || o.service}</span></span>
            <span className="l3"><span>{o.name && o.name !== (o.profile || o.company) ? o.name + " · " : ""}bestellt {fmtD(r.created)}</span><span className="ps w"><span className="dt" />In Bearbeitung</span></span>
          </span>
        </button>
        <span className="orv-a"><span className={"orv-age" + (m >= 2880 ? " late" : "")} title="Seit Bestellung">{fmtAge(m)}</span><span className="orv-mon">{orderMoney(o)}</span></span>
      </div>
    );
  }
  const t = r.t;
  const x = sc.res[r.k]; const R = x ? RES[x.result] || RES.unknown : null; const RI = R ? R[2] : null;
  const [sk, sl] = statusOf(r, now);
  const name = (r.it && r.it.name) || (t && (t.name || t.reviewer)) || "Bewertung";
  const meta = (
    <span className="l3">
      {!compact ? <span>{o.name && o.name !== (o.profile || o.company) ? o.name + " · " : ""}bestellt {fmtD(r.created)}</span> : null}
      <span className={"ps " + sk}><span className="dt" />{sl}</span>
      {t && t.express ? <span className="ktag kx"><Zap />Express</span> : null}
    </span>
  );
  return (
    <div className={"orv-r" + (compact ? " cp" : "") + (x && /^gone/.test(x.result) ? " gone" : "")} style={{ "--pi": Math.min(j, 10) }}>
      <div className="orv-m">
        {compact ? null : <button type="button" className="orv-av" onClick={() => openOrder(o.id)} title="Auftrag öffnen"><Avatar o={o} /></button>}
        <span className="t">
          {compact ? null : <button type="button" className="l1 lnk" onClick={() => openOrder(o.id)} title="Auftrag öffnen"><b>{o.profile || o.company || o.name}</b></button>}
          <span className="l2"><RvLink r={r} toast={toast}>{name}</RvLink><RStars n={r.stars} />{t ? <span className="cd">{t.code}</span> : null}</span>
          {meta}
        </span>
      </div>
      <span className="orv-a">
        <span className={"orv-age" + (r.age == null ? " na" : r.age > 28 ? " old" : "")} title="Alter der Bewertung heute">{r.age == null ? "Alter ?" : ageL(r.age)}{r.age != null ? <small>alt</small> : null}</span>
        {x ? <span className={"orv-res " + R[1]} title={x.why}><RI />{R[0]}{R[3] ? <span className="lg">{R[3]}</span> : null}</span>
          : scannable(r) ? <button type="button" className="orv-one" disabled={sc.busy} onClick={() => sc.run([r])} aria-label="Diese Bewertung scannen" title="Nur diese scannen"><ScanSearch /></button> : null}
      </span>
      {x && x.result !== "visible" && x.why ? <span className="orv-why">{x.why}</span> : null}
    </div>
  );
}

/** Kunden-Ansicht: Bewertungen eines Auftrags aufklappbar unter dem Kunden (Standard: offen). */
export function OrderReviews({ rows, open, toggle, sc, now, Avatar, RStars, openOrder, toast }) {
  if (!rows.length) return null;
  const sRows = rows.filter(scannable);
  return (
    <div className={"ordrv" + (open ? " open" : "")}>
      <div className="ordrv-h">
        <button type="button" className="ordrv-t" onClick={toggle} aria-expanded={open}><ChevronDown />{rows.length} Bewertung{rows.length === 1 ? "" : "en"} offen</button>
        {open && sRows.length > 1 ? <button type="button" className="ordrv-s" disabled={sc.busy} onClick={() => sc.run(sRows)}><ScanSearch />Alle {sRows.length} scannen</button> : null}
      </div>
      {open ? rows.map((r, j) => <FlatRow key={r.k} r={r} j={j} now={now} sc={sc} openOrder={openOrder} Avatar={Avatar} RStars={RStars} compact toast={toast} />) : null}
    </div>
  );
}
