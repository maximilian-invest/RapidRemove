"use client";
/* Neues Admin — Konto › Geprüfte Profile (Design-Handoff „checkedV").
   Leads aus dem Prüf-Tool: Profil-Prüfungen UND Prüfungen für Einzelbewertungen (recommend = "reviews").
   Gleiche Daten und Aktionen wie im bisherigen Admin: Zusammenfassen von Mehrfach-Prüfungen,
   Auto-Recherche der E-Mail (Website → ops-Scan), E-Mail speichern, Rückgewinnungs-Angebot senden. */
import React from "react";
import { ArrowLeft, Search, Filter, Loader, Send, MailPlus, Mail, RefreshCw, Globe, MapPin, ArrowRight, Check, Star, Store, ChevronRight } from "lucide-react";
import { dedupeChecks, SRC_LABEL, SOCIAL_KINDS, srcLabelOf, CHECK_DROP, checkStepOf, checkMapsUrl, checkWebSearchUrl } from "@/components/admin/AdminApp";
import { saveCheckEmail, enrichCheckEmails, markCheckEnriched, sendTemplate } from "@/lib/admin-api";
import { fetchProfileById } from "@/lib/places";

const SRCS = [["google_ads", "Google Ads"], ["ms_ads", "Microsoft Ads"], ["social", "Social Media"], ["affiliate", "Affiliate"], ["utm", "UTM"], ["organic", "Organisch"], ["referral", "Verweis"], ["direct", "Direkt"], ["none", "Unbekannt"]];
const isRevCheck = (c, orders) => c.recommend === "reviews" || (c.orderId && (orders.find((o) => o.id === c.orderId) || {}).service === "reviews");
/** Datum + Uhrzeit kompakt: „06.10. · 14:02" (heute: „Heute · 14:02"). */
const fmtDT = (iso) => {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  const today = new Date().toDateString() === d.toDateString();
  return `${today ? "Heute" : p(d.getDate()) + "." + p(d.getMonth() + 1) + "."} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
const num = (v) => (Number(v) || 0).toLocaleString("de-DE");

export function ChecksScreen({ ctx }) {
  const { checks: rawChecks, orders, setMoreSub, openSheet, toast, chk, setChk } = ctx;
  // Bewertungs-Kennzeichen VOR dem Zusammenfassen ermitteln (eine Gruppe ist „Bewertungen", sobald eine Prüfung es ist)
  const checks = React.useMemo(() => {
    const flagged = (rawChecks || []).map((c) => ({ ...c, isRev: isRevCheck(c, orders) }));
    const out = dedupeChecks(flagged);
    return out.map((c) => {
      if (c.isRev || c.dupes < 2) return c;
      const n = (s) => (s || "").trim().toLowerCase();
      return { ...c, isRev: flagged.some((x) => x.isRev && ((n(x.profile) && n(x.profile) === n(c.profile)) || (n(x.email) && n(x.email) === n(c.email)))) };
    });
  }, [rawChecks, orders]);
  const eff = (c) => (chk.saved[c.id] !== undefined ? chk.saved[c.id] : (c.email || ""));
  const conv = (c) => c.status === "konvertiert";

  /* Auto-Recherche (wie bisheriges Admin): offene Prüfungen ohne E-Mail mit Place-ID, noch nie recherchiert, max. 10 */
  const ran = React.useRef(false);
  React.useEffect(() => {
    if (ran.current || !checks.length) return;
    const queue = checks.filter((c) => !conv(c) && !eff(c) && c.placeId && !c.enrichedAt).slice(0, 10);
    if (!queue.length) return;
    ran.current = true;
    let alive = true;
    (async () => {
      let found = 0;
      for (let i = 0; i < queue.length; i++) {
        if (!alive) return;
        setChk((s) => ({ ...s, prog: { done: i, total: queue.length } }));
        const c = queue[i];
        try {
          const prof = await withTimeout(fetchProfileById(c.placeId, "de"), 15000);
          if (prof && prof.website) {
            const r = await withTimeout(enrichCheckEmails({ website: prof.website, checkId: c.id, autosave: true }), 30000);
            if (r.saved) { found++; setChk((s) => ({ ...s, saved: { ...s.saved, [c.id]: r.saved } })); }
          } else await markCheckEnriched({ checkId: c.id });
        } catch (e) { /* weiter */ }
      }
      if (!alive) return;
      setChk((s) => ({ ...s, prog: null }));
      if (found) toast(found + " E-Mail(s) automatisch gefunden");
    })();
    return () => { alive = false; };
  }, [checks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const srcOk = (c, k) => (k === "all" ? true : k === "social" ? SOCIAL_KINDS.includes(c.source) : k === "none" ? !c.source : c.source === k);
  const base = checks.filter((c) => srcOk(c, chk.src)).filter((c) => chk.type === "all" || (chk.type === "reviews" ? c.isRev : !c.isRev));
  const CF = { open: (c) => !conv(c), hired: conv, all: () => true };
  const ql = chk.q.trim().toLowerCase();
  const list = base.filter(CF[chk.f]).filter((c) => !ql || `${c.profile} ${c.name} ${eff(c)} ${c.addr || ""} ${c.id} ${srcLabelOf(c)}`.toLowerCase().includes(ql));
  const [limit, setLimit] = React.useState(80);
  const openN = checks.filter((c) => !conv(c)).length;
  const srcOpts = [["all", "Alle Quellen", checks.length], ...SRCS.map(([k, l]) => [k, l, checks.filter((c) => srcOk(c, k)).length]).filter(([, , n]) => n > 0)];

  return (
    <>
      <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button>
        {chk.prog ? <span className="arc"><Loader />Recherche {chk.prog.done + 1}/{chk.prog.total}</span> : null}</div>
      <div className="hd" style={{ paddingTop: 4 }}><div><span>{openN} nicht beauftragt</span><h1>Geprüfte Profile</h1></div></div>
      <div className="usrch"><Search /><input type="search" placeholder="Profil, Name, E-Mail" value={chk.q} onChange={(e) => setChk((s) => ({ ...s, q: e.target.value }))} />
        <button type="button" className="bt" onClick={() => openSheet({ kind: "pick", title: "Quelle", cur: chk.src, opts: srcOpts.map(([k, l, n]) => [k, l, null, n]), onPick: (k) => setChk((s) => ({ ...s, src: k })) })}>
          <Filter />{chk.src === "all" ? "Quelle" : (srcOpts.find((x) => x[0] === chk.src) || [0, "Quelle"])[1]}</button></div>
      <div className="sec3 ckh">
        <div className="achips">{[["open", "Offen"], ["hired", "Beauftragt"], ["all", "Alle"]].map(([k, l]) => <button key={k} type="button" className={"achip" + (chk.f === k ? " on" : "")} onClick={() => setChk((s) => ({ ...s, f: k }))}>{l}<span className="n">{base.filter(CF[k]).length}</span></button>)}</div>
        <div className="seg2">{[["all", "Alle"], ["profile", "Profile"], ["reviews", "Bewertungen"]].map(([k, l]) => <button key={k} type="button" className={chk.type === k ? "on" : ""} onClick={() => setChk((s) => ({ ...s, type: k }))}>{l}</button>)}</div>
      </div>
      <div className="card ls">
        {list.slice(0, limit).map((c, j) => {
          const em = eff(c);
          const st = conv(c) ? "Beauftragt" : c.step == null ? "Profil-Auswahl" : (CHECK_DROP[checkStepOf(c)] || CHECK_DROP[1]).t;
          return (
            <button key={c.id} type="button" className="ord ckr" style={{ "--pi": Math.min(j, 10) }} onClick={() => openSheet({ kind: "chk", id: c.id, c })}>
              <span className="t"><span className="l1"><b>{c.profile || c.name || "—"}{c.dupes > 1 ? <i className="x2">{c.dupes}×</i> : null}</b></span>
                <span className="l2"><span className={"ktag" + (c.isRev ? "" : " kp")}>{c.isRev ? <Star /> : <Store />}{c.isRev ? "Bewertungen" : "Profil"}</span>
                  <span className="cdt">{fmtDT(c.createdAt)}</span><span className="rt">{c.rating && c.rating !== "—" ? c.rating + " ★" : "– ★"}</span>&nbsp;{num(c.reviews)} · {st}{c.source ? " · " + srcLabelOf(c) : ""}</span></span>
              {conv(c) ? <span className="ab ok"><Check /></span> : <span className={"ab" + (em ? " on" : "")}>{em ? <Send /> : <MailPlus />}</span>}
            </button>
          );
        })}
        {list.length > limit ? <button type="button" className="more-b" onClick={() => setLimit((x) => x + 100)}>Weitere {list.length - limit} anzeigen</button> : null}
        {!list.length ? <div className="aempty"><b>Nichts gefunden</b>Keine Prüfungen für diesen Filter.</div> : null}
      </div>
    </>
  );
}

/* Sheet „Prüfung" — Kennzahlen, E-Mail, Angebot senden, Neu prüfen, Website, Maps */
export function CheckSheet({ c, ctx, close }) {
  const { chk, setChk, toast, orders, openOrder } = ctx;
  const saved = chk.saved[c.id];
  const em0 = saved !== undefined ? saved : (c.email || "");
  const [mail, setMail] = React.useState(em0);
  const [busy, setBusy] = React.useState("");
  const [cands, setCands] = React.useState(null);
  const [confirm, setConfirm] = React.useState(false);
  const sentAt = chk.sent[c.id] || c.rueckgewinnungAt;
  const linked = c.orderId ? orders.find((o) => o.id === c.orderId) : null;
  const st = c.status === "konvertiert" ? "Beauftragt" : c.step == null ? "Profil-Auswahl" : (CHECK_DROP[checkStepOf(c)] || CHECK_DROP[1]).t;
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.trim());
  const save = async (v) => {
    const e = (v != null ? v : mail).trim();
    if (e === em0) return true;
    try { await saveCheckEmail({ checkId: c.id, email: e }); setChk((s) => ({ ...s, saved: { ...s.saved, [c.id]: e } })); setMail(e); toast(e ? "E-Mail gespeichert" : "E-Mail entfernt"); return true; }
    catch (err) { toast("Speichern fehlgeschlagen: " + err.message); return false; }
  };
  const send = async () => {
    setBusy("send");
    try {
      if (!(await save())) { setBusy(""); return; }
      await sendTemplate({ key: "rueckgewinnung", to: mail.trim(), checkId: c.id, lang: c.lang || "de", name: c.name !== "—" ? (c.name || "") : "", company: c.profile || "" });
      setChk((s) => ({ ...s, sent: { ...s.sent, [c.id]: new Date().toISOString() } }));
      toast("Angebot an " + mail.trim() + " gesendet"); close();
    } catch (e) { toast("Senden fehlgeschlagen: " + e.message); }
    setBusy("");
  };
  const recheck = async () => {
    setBusy("enrich"); setCands(null);
    try {
      if (!c.placeId) throw new Error("Keine Place-ID gespeichert – bitte Web-Suche nutzen");
      const prof = await fetchProfileById(c.placeId, "de");
      if (!prof || !prof.website) throw new Error("Google kennt keine Website zu diesem Profil");
      const r = await enrichCheckEmails({ website: prof.website });
      setCands((r.emails || []).length ? r.emails : []);
      if (!(r.emails || []).length) toast("Keine E-Mail auf der Website gefunden");
    } catch (e) { toast(e.message); }
    setBusy("");
  };
  const website = async () => {
    try { const prof = c.placeId ? await fetchProfileById(c.placeId, "de") : null; window.open(prof && prof.website ? prof.website : checkWebSearchUrl(c), "_blank", "noopener"); }
    catch (e) { window.open(checkWebSearchUrl(c), "_blank", "noopener"); }
  };
  if (confirm) {
    return (
      <><h3>Angebot senden?</h3>
        <p className="shp">Rückgewinnungs-Mail an <b>{mail.trim()}</b> ({c.profile || c.name}){sentAt ? <> · bereits gesendet {fmtDT(sentAt)}</> : null}.</p>
        <div className="ctas2"><button type="button" className="cta gh" onClick={() => setConfirm(false)}>Zurück</button><button type="button" className="cta or" disabled={!!busy} onClick={send}><Send />{busy ? "Sendet …" : "Senden"}</button></div></>
    );
  }
  return (
    <>
      <h3 style={{ paddingBottom: 2 }}>{c.profile || c.name || "—"}</h3>
      <p className="shp" style={{ fontSize: 13 }}>{[c.addr, c.id, c.created ? "geprüft " + c.created.replace("·", "um") + " Uhr" : ""].filter(Boolean).join(" · ")}</p>
      <div className="cks">
        <div><b>{c.rating && c.rating !== "—" ? c.rating + " ★" : "–"}</b><span>{num(c.reviews)} Bewertungen</span></div>
        <div><b>{st}</b><span>{c.status === "konvertiert" ? "Status" : "Abbruch bei"}</span></div>
        <div><b>{srcLabelOf(c) || "Unbekannt"}</b><span>Quelle</span></div>
      </div>
      <div className="ckt"><span className={"ktag" + (c.isRev ? "" : " kp")}>{c.isRev ? <Star /> : <Store />}{c.isRev ? "Prüfung für Einzelbewertungen" : "Profil-Prüfung"}</span>{c.dupes > 1 ? <span className="ktag">{c.dupes}× geprüft</span> : null}</div>
      {linked ? (
        <div className="ctas" style={{ marginTop: 12 }}><button type="button" className="cta" onClick={() => { close(); openOrder(linked.id, true); }}><ArrowRight />Auftrag {linked.id} öffnen</button></div>
      ) : (
        <>
          <div className="usrch in-sheet" style={{ margin: "14px 0 10px" }}><Mail /><input type="email" placeholder="E-Mail eintragen" value={mail} onChange={(e) => setMail(e.target.value)} onBlur={() => (valid || !mail.trim()) && save()} /></div>
          {cands && cands.length ? <div className="cats" style={{ marginBottom: 10 }}>{cands.map((e) => <button key={e} type="button" className="achip" onClick={() => { setMail(e); save(e); }}>{e}<Check /></button>)}</div> : null}
          <div className="ctas"><button type="button" className="cta or" disabled={!valid || !!busy} onClick={() => setConfirm(true)}><Send />{sentAt ? "Angebot erneut senden" : "Angebot senden"}</button></div>
          {sentAt ? <p className="shp" style={{ padding: "8px 4px 0", color: "var(--success)", fontWeight: 600 }}>Angebot gesendet · {fmtDT(sentAt)}</p> : null}
        </>
      )}
      <div className="opts" style={{ marginTop: 12 }}>
        {!linked ? <button type="button" className="aopt" disabled={!!busy} onClick={recheck}><span className="ico">{busy === "enrich" ? <Loader className="spin" /> : <RefreshCw />}</span>Neu prüfen<ChevronRight className="chev" /></button> : null}
        <button type="button" className="aopt" onClick={website}><span className="ico"><Globe /></span>Website öffnen<ChevronRight className="chev" /></button>
        {checkMapsUrl(c) ? <a className="aopt" href={checkMapsUrl(c)} target="_blank" rel="noopener noreferrer"><span className="ico"><MapPin /></span>In Google Maps öffnen<ChevronRight className="chev" /></a> : null}
      </div>
    </>
  );
}
export { SRC_LABEL };
