"use client";
/* Listenansicht für „In Bearbeitung" (Aufträge → Kachel In Bearbeitung → Umschalter „Liste | Kunden"):
 * jede offene Bewertung bzw. jeder Profil-Auftrag als eigene Zeile, neueste Bestellung zuerst.
 * Bewertungen: Partner-Aufgabe „Not started", „Working" oder „Software" (nicht abgerechnet) – mit Alter der Bewertung heute.
 * Auto-Scan wie im Partner-Dashboard („Scan all reviews", ops/src/removalScan.ts): Google-Link UND Bewertungsliste müssen
 * „gelöscht" sagen, plus Nachweis „war bei Bestellung online" → erst dann „Gelöscht" (= Kunde wird automatisch belastet).
 * Alles andere bleibt unverändert. Kleine Pakete nacheinander (Server-Browser schafft 2 gleichzeitig) → Fortschritt. */
import React from "react";
import { ScanSearch, Zap, CheckCircle2, Eye, HelpCircle, Square, ChevronRight, ShieldCheck, Store } from "lucide-react";
import { fmtAge, SERVICE_L, orderMoney } from "./model";
import { partnerScan } from "@/lib/admin-api";

const DAY = 864e5;
const fmtD = (v) => (v ? new Date(v).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) : "—");
const fmtT = (v) => (v ? new Date(v).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : "");
const ageL = (d) => (d < 1 ? "heute" : d === 1 ? "1 Tag" : d + " Tage");
const keyOfItem = (it) => it.url || ((it.name || "") + "|" + (it.text || ""));
const RES = {
  gone: ["Gelöscht", "ok", CheckCircle2, " · verrechnet"],
  visible: ["Noch online", "vis", Eye],
  unknown: ["Unklar", "unk", HelpCircle],
  skipped: ["Übersprungen", "vis", Eye],
};
export const SCANNABLE = (t) => t.status === "new" || t.status === "working";

/** Zeilen für die Listenansicht: je offene Bewertung eine Zeile, je Profil-Auftrag eine Zeile. */
export function flatRows(orders, ptasks, now) {
  const out = [];
  for (const o of orders) {
    const created = o.createdAt ? new Date(o.createdAt).getTime() : null;
    if (o.service !== "reviews") { out.push({ k: "p" + o.id, kind: "profile", o, created, age: null }); continue; }
    const items = o.reviewItems || [];
    for (const t of ptasks[o.id] || []) {
      if (!(t.status === "new" || t.status === "working" || t.status === "software") || t.paid || t.test) continue;
      const it = items.find((x) => keyOfItem(x) === t.itemKey) || null;
      const days0 = it && it.days !== null && it.days !== undefined && it.days !== "" && Number.isFinite(Number(it.days)) ? Number(it.days) : null;
      const age = days0 == null || !created ? null : days0 + Math.floor((now - created) / DAY); // Alter der Bewertung heute
      out.push({ k: "t" + t.id, kind: "review", t, o, it, age, created, stars: Math.round(Number((it && it.rating) || t.rating) || 0) });
    }
  }
  return out;
}
export const SORTS = { ordered: (a, b) => (b.created || 0) - (a.created || 0) }; // neueste Bestellung zuerst

/** Scan-Zustand (bleibt beim Filter-/Ansichtswechsel erhalten, solange die Auftragsliste offen ist). */
export function useReviewScan(onDone) {
  const [res, setRes] = React.useState({}); // taskId → { result, why, at }
  const [scan, setScan] = React.useState(null); // { total, done, phase, at }
  const stopRef = React.useRef(false);
  const busy = !!(scan && scan.phase === "checking");
  const run = async (ids) => {
    if (!ids.length || busy) return;
    stopRef.current = false;
    setScan({ total: ids.length, done: 0, phase: "checking", at: Date.now() });
    for (let i = 0; i < ids.length; i += 2) {
      if (stopRef.current) { setScan((s) => ({ ...s, phase: "stopped" })); break; }
      const chunk = ids.slice(i, i + 2);
      let out;
      try { out = (await partnerScan(chunk, i + 2 >= ids.length)).results || []; }
      catch (e) { out = chunk.map((id) => ({ id, result: "unknown", why: "Prüfung fehlgeschlagen – nichts geändert." })); }
      setRes((m) => { const n = { ...m }; for (const x of out) n[x.id] = { result: x.result, why: x.why || x.reason || "", at: Date.now() }; return n; });
      setScan((s) => ({ ...s, done: Math.min(s.total, s.done + chunk.length) }));
    }
    setScan((s) => (s && s.phase === "checking" ? { ...s, phase: "done" } : s));
    if (onDone) onDone();
  };
  return { res, scan, busy, run, stop: () => { stopRef.current = true; } };
}

export function ScanCard({ sc, n, ids }) {
  const { scan, busy, res } = sc;
  const vals = Object.values(res);
  const nGone = vals.filter((x) => x.result === "gone").length, nVis = vals.filter((x) => x.result === "visible").length, nUnk = vals.filter((x) => x.result === "unknown").length;
  const pct = scan ? Math.round((scan.done / Math.max(1, scan.total)) * 100) : 0;
  return (
    <div className={"orv-scan" + (scan ? " " + scan.phase : "")}>
      <span className="di">{busy ? <ScanSearch className="pulse" /> : scan ? <CheckCircle2 /> : <ShieldCheck />}</span>
      <span className="t">
        {!scan ? <>
          <b>Auto-Scan · {n} Bewertung{n === 1 ? "" : "en"} prüfbar</b>
          <span>Wie beim Partner: Nur wenn Google-Link <i>und</i> Bewertungsliste „gelöscht“ sagen → <b>Gelöscht</b> + automatische Abbuchung. Sonst bleibt alles, wie es ist.</span>
        </> : busy ? <>
          <b>Scan läuft · {scan.done} / {scan.total}</b>
          <span className="bar"><i style={{ "--w": pct + "%" }} /></span>
          <span>{nGone} gelöscht · {nVis} noch online · {nUnk} unklar</span>
        </> : <>
          <b>{scan.phase === "stopped" ? "Scan gestoppt" : "Scan fertig"} · {fmtT(scan.at)}</b>
          <span className="orv-sum"><em className="ok">{nGone} gelöscht ✓ verrechnet</em><em className="vis">{nVis} noch online</em>{nUnk ? <em className="unk">{nUnk} unklar – bitte prüfen</em> : null}</span>
        </>}
      </span>
      {busy ? <button type="button" className="orv-stop" onClick={sc.stop}><Square />Stopp</button>
        : ids && ids.length ? <button type="button" className="orv-go" onClick={() => sc.run(ids)}><ScanSearch />{ids.length} scannen</button> : null}
    </div>
  );
}

/** Eine Zeile der Listenansicht (Bewertung oder Profil-Auftrag). */
export function FlatRow({ r, j, now, sc, openOrder, Avatar, RStars }) {
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
            <span className="l3"><span>{o.name && o.name !== (o.profile || o.company) ? o.name + " · " : ""}bestellt {fmtD(r.created)}</span>
              <span className="ps w"><span className="dt" />In Bearbeitung</span></span>
          </span>
        </button>
        <span className="orv-a"><span className={"orv-age" + (m >= 2880 ? " late" : "")} title="Seit Bestellung">{fmtAge(m)}</span><span className="orv-mon">{orderMoney(o)}</span></span>
      </div>
    );
  }
  const t = r.t;
  const x = sc.res[t.id]; const R = x ? RES[x.result] || RES.unknown : null; const RI = R ? R[2] : null;
  const wk = t.status === "working", sw = t.status === "software";
  const since = wk && t.workingSince ? Math.round((now - new Date(t.workingSince).getTime()) / 6e4) : null;
  return (
    <div className={"orv-r" + (x && x.result === "gone" ? " gone" : "")} style={{ "--pi": Math.min(j, 10) }}>
      <button type="button" className="orv-m" onClick={() => openOrder(o.id)} title="Auftrag öffnen">
        <Avatar o={o} />
        <span className="t">
          <span className="l1"><b>{o.profile || o.company || o.name}</b></span>
          <span className="l2"><span className="rv">{t.name || t.reviewer || "Bewertung"}</span><RStars n={r.stars} /><span className="cd">{t.code}</span></span>
          <span className="l3">
            <span>{o.name && o.name !== (o.profile || o.company) ? o.name + " · " : ""}bestellt {fmtD(r.created)}</span>
            <span className={"ps " + (wk ? "w" : sw ? "s" : "n")}><span className="dt" />{wk ? "In Arbeit" + (since != null ? " · " + fmtAge(since) : "") : sw ? "Software · wartet auf Kunde" : "Nicht gestartet"}</span>
            {t.express ? <span className="ktag kx"><Zap />Express</span> : null}
          </span>
        </span>
      </button>
      <span className="orv-a">
        <span className={"orv-age" + (r.age == null ? " na" : r.age > 28 ? " old" : "")} title="Alter der Bewertung heute">{r.age == null ? "Alter ?" : ageL(r.age)}{r.age != null ? <small>alt</small> : null}</span>
        {x ? <span className={"orv-res " + R[1]} title={x.why}><RI />{R[0]}{R[3] ? <span className="lg">{R[3]}</span> : null}</span>
          : SCANNABLE(t) ? <button type="button" className="orv-one" disabled={sc.busy} onClick={() => sc.run([t.id])} aria-label="Diese Bewertung scannen" title="Nur diese scannen"><ScanSearch /></button> : null}
      </span>
      {x && x.result !== "visible" && x.why ? <span className="orv-why">{x.why}</span> : null}
    </div>
  );
}
