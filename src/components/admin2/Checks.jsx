"use client";
/* Neues Admin — Konto › Geprüfte Profile (Design-Handoff „checkedV").
   Leads aus dem Prüf-Tool: Profil-Prüfungen UND Prüfungen für Einzelbewertungen (recommend = "reviews").
   Gleiche Daten und Aktionen wie im bisherigen Admin: Zusammenfassen von Mehrfach-Prüfungen,
   Auto-Recherche der E-Mail (Website → ops-Scan), E-Mail speichern, Rückgewinnungs-Angebot senden. */
import React from "react";
import { ArrowLeft, Search, Filter, Loader, Send, MailPlus, Mail, RefreshCw, Globe, MapPin, ArrowRight, Check, Star, Store, ChevronRight } from "lucide-react";
import { dedupeChecks, SRC_LABEL, SOCIAL_KINDS, srcLabelOf, CHECK_DROP, checkStepOf, checkMapsUrl, checkWebSearchUrl } from "@/components/admin/AdminApp";
import { saveCheckEmail, enrichCheckEmails, markCheckEnriched, sendTemplate, fetchOffers, resendOffer } from "@/lib/admin-api";
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
/* Abbruch-Frage im Bestellprozess (09.11.2026) – Schlüssel → Text */
export const EXIT_LABEL = { price: "Zu teuer", info: "Braucht mehr Infos", trust: "Unsicher, ob seriös", justprice: "Wollte nur Preis wissen", later: "Muss intern besprechen", other_need: "Braucht etwas anderes", other: "Sonstiges" };
const EXIT_STEP = { 3: "Leistung", 4: "Schutz", 5: "Kasse" };
const EXIT_VIA = { close: "Seite verlassen", back: "Zurück", idle: "60 s inaktiv", intent: "Maus aus Fenster" };

/* Schriftliche Angebote (09.11.2026): Verlauf je Angebot + „heiß" = Link geklickt, nicht bestellt */
const fmtMoneyA = (v, cur) => { try { return new Intl.NumberFormat("de-DE", { style: "currency", currency: cur === "usd" ? "USD" : "EUR", maximumFractionDigits: 0 }).format(Number(v) || 0); } catch (e) { return String(v); } };
const offerHot = (o) => o.status === "sent" && !!o.clicked_at;
export function offerSteps(o) {
  const st = [["Gesendet " + fmtDT(o.created_at), o.mail_ok === false ? "bad" : ""]];
  if (o.mail_ok === false) st.push(["Mail fehlgeschlagen", "bad"]);
  if (o.opened_at) st.push(["Geöffnet" + (o.open_count > 1 ? " " + o.open_count + "×" : ""), ""]);
  if (o.pdf_at) st.push(["PDF geladen", ""]);
  if (o.r1_at) st.push(["Erinnerung 1", ""]);
  if (o.r2_at) st.push(["Erinnerung 2", ""]);
  if (o.r3_at) st.push(["Erinnerung 3", ""]);
  if (o.clicked_at) st.push(["Link geklickt " + fmtDT(o.clicked_at), o.status === "sent" ? "hot" : ""]);
  if (o.status === "accepted") st.push(["Angenommen ✓" + (o.order_id ? " " + o.order_id : ""), "ok"]);
  else if (o.status === "expired") st.push(["Abgelaufen", "off"]);
  if (o.unsub_at) st.push(["Erinnerungen abbestellt", "off"]);
  return st;
}
const ST_COL = { ok: { background: "#ecfdf5", color: "#047857" }, hot: { background: "#fff4e8", color: "#a34f00" }, off: { background: "#fafafa", color: "#aaa" }, bad: { background: "#fdecec", color: "#b42318" }, "": { background: "#f1f1f1", color: "#555" } };
export function OfferTimeline({ o }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
      {offerSteps(o).map(([t, k], i) => <React.Fragment key={i}>{i ? <span style={{ color: "#ccc", fontSize: 11 }}>→</span> : null}<span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap", ...ST_COL[k] }}>{t}</span></React.Fragment>)}
    </div>
  );
}
function ResendRow({ o }) {
  const [st, setSt] = React.useState("");
  return (
    <div style={{ marginTop: 6, fontSize: 12.5, color: "#b42318" }}>
      {o.mail_err ? <div style={{ marginBottom: 4, wordBreak: "break-word" }}>Fehler: {String(o.mail_err).slice(0, 220)}</div> : null}
      <button type="button" className="achip" disabled={st === "…"} onClick={async () => { setSt("…"); try { const r = await resendOffer(o.id); setSt(r.ok ? "Gesendet ✓" : "Wieder fehlgeschlagen: " + String(r.mailErr || "").slice(0, 120)); } catch (e) { setSt("Fehler: " + e.message); } }}>Erneut senden</button>
      {st ? <span style={{ marginLeft: 8 }}>{st}</span> : null}
    </div>
  );
}
function OffersCard({ offers, onHot, hot }) {
  if (!offers || !offers.length) return null;
  const since = Date.now() - 30 * 864e5;
  const recent = offers.filter((o) => new Date(o.created_at).getTime() >= since);
  const n = recent.length, op = recent.filter((o) => o.opened_at).length, acc = recent.filter((o) => o.status === "accepted");
  const days = acc.length ? (acc.reduce((a, o) => a + (new Date(o.accepted_at) - new Date(o.created_at)) / 864e5, 0) / acc.length) : null;
  const hotN = offers.filter(offerHot).length;
  const list = (hot ? offers.filter(offerHot) : offers).slice(0, hot ? 50 : 6);
  const k = (l, v, sub) => <div style={{ background: "#f6f6f5", borderRadius: 12, padding: "10px 12px" }}><span style={{ fontSize: 11.5, color: "#888" }}>{l}</span><b style={{ display: "block", fontSize: 19, fontWeight: 700, marginTop: 2 }}>{v}{sub ? <small style={{ fontSize: 12, color: "#888", fontWeight: 500, marginLeft: 4 }}>{sub}</small> : null}</b></div>;
  return (
    <div className="card" style={{ padding: "14px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <b style={{ fontSize: 15 }}>Angebote <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>· letzte 30 Tage</span></b>
        <button type="button" className={"achip" + (hot ? " on" : "")} onClick={onHot}>Heiß<span className="n">{hotN}</span></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 10 }}>
        {k("Angefordert", n)}{k("Geöffnet", op, n ? Math.round((op / n) * 100) + " %" : "")}{k("Angenommen", acc.length, n ? Math.round((acc.length / n) * 100) + " %" : "")}{k("Ø bis Annahme", days != null ? days.toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Tage" : "–")}
      </div>
      {list.map((o) => (
        <div key={o.id} style={{ padding: "10px 0", borderTop: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13.5 }}>
            <span><b>{o.profile}</b><span style={{ color: "#888" }}> · {o.id} · {o.email}</span></span>
            <b style={{ whiteSpace: "nowrap" }}>{fmtMoneyA(o.amount, o.cur)}</b>
          </div>
          <div style={{ marginTop: 6 }}><OfferTimeline o={o} /></div>
          {offerHot(o) ? <div style={{ marginTop: 6, fontSize: 12.5 }}><a href={"mailto:" + o.email} style={{ fontWeight: 600 }}>Nachfassen per E-Mail</a></div> : null}
          {o.mail_ok === false ? <ResendRow o={o} /> : null}
        </div>
      ))}
    </div>
  );
}

export function ChecksScreen({ ctx }) {
  const { checks: rawChecks, orders, setMoreSub, openSheet, toast, chk, setChk } = ctx;
  // Bewertungs-Kennzeichen VOR dem Zusammenfassen ermitteln (eine Gruppe ist „Bewertungen", sobald eine Prüfung es ist)
  const checks = React.useMemo(() => {
    const flagged = (rawChecks || []).filter((c) => !c.test).map((c) => ({ ...c, isRev: isRevCheck(c, orders) })); // Tests nur unter „Tests"
    const out = dedupeChecks(flagged);
    return out.map((c) => {
      if (c.isRev || c.dupes < 2) return c;
      const n = (s) => (s || "").trim().toLowerCase();
      return { ...c, isRev: flagged.some((x) => x.isRev && ((n(x.profile) && n(x.profile) === n(c.profile)) || (n(x.email) && n(x.email) === n(c.email)))) };
    });
  }, [rawChecks, orders]);
  const eff = (c) => (chk.saved[c.id] !== undefined ? chk.saved[c.id] : (c.email || ""));
  const conv = (c) => c.status === "konvertiert";
  const [offers, setOffers] = React.useState([]);
  const [hotOnly, setHotOnly] = React.useState(false);
  React.useEffect(() => { let a = true; fetchOffers().then((x) => { if (a) setOffers(x); }).catch(() => {}); return () => { a = false; }; }, []);
  const offerByCheck = React.useMemo(() => { const m = {}; offers.forEach((o) => { if (o.check_id && !m[o.check_id]) m[o.check_id] = o; }); return m; }, [offers]);

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
  const openN = checks.filter((c) => !c.test && !conv(c)).length; // ohne Test-Prüfungen
  const srcOpts = [["all", "Alle Quellen", checks.length], ...SRCS.map(([k, l]) => [k, l, checks.filter((c) => srcOk(c, k)).length]).filter(([, , n]) => n > 0)];

  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button>
        {chk.prog ? <span className="arc"><Loader />Recherche {chk.prog.done + 1}/{chk.prog.total}</span> : null}</div>
      <div className="hd" style={{ paddingTop: 4 }}><div><span>{openN} nicht beauftragt</span><h1>Geprüfte Profile</h1></div></div>
      <div className="usrch"><Search /><input type="search" placeholder="Profil, Name, E-Mail" value={chk.q} onChange={(e) => setChk((s) => ({ ...s, q: e.target.value }))} />
        <button type="button" className="bt" onClick={() => openSheet({ kind: "pick", title: "Quelle", cur: chk.src, opts: srcOpts.map(([k, l, n]) => [k, l, null, n]), onPick: (k) => setChk((s) => ({ ...s, src: k })) })}>
          <Filter />{chk.src === "all" ? "Quelle" : (srcOpts.find((x) => x[0] === chk.src) || [0, "Quelle"])[1]}</button></div>
      <OffersCard offers={offers} hot={hotOnly} onHot={() => setHotOnly((v) => !v)} />
      {(() => {
        const since = Date.now() - 30 * 864e5;
        const ex = (rawChecks || []).filter((c) => !c.test && c.exitReason && new Date(c.exitAt || c.createdAt).getTime() >= since);
        if (!ex.length) return null;
        const cnt = {}; ex.forEach((c) => { cnt[c.exitReason] = (cnt[c.exitReason] || 0) + 1; });
        const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
        return (
          <div className="card" style={{ padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "var(--fg-3, #888)", marginBottom: 8 }}>Abbruchgründe · letzte 30 Tage · {ex.length} Antworten</div>
            <div className="achips" style={{ flexWrap: "wrap" }}>{top.map(([k, n]) => <span key={k} className="achip" style={{ cursor: "default" }}>{EXIT_LABEL[k] || k}<span className="n">{n}</span></span>)}</div>
          </div>
        );
      })()}
      <div className="sec3 ckh">
        <div className="achips">{[["open", "Offen"], ["hired", "Beauftragt"], ["all", "Alle"]].map(([k, l]) => <button key={k} type="button" className={"achip" + (chk.f === k ? " on" : "")} onClick={() => setChk((s) => ({ ...s, f: k }))}>{l}<span className="n">{base.filter((c) => !c.test && CF[k](c)).length}</span></button>)}</div>
        <div className="seg2">{[["all", "Alle"], ["profile", "Profile"], ["reviews", "Bewertungen"]].map(([k, l]) => <button key={k} type="button" className={chk.type === k ? "on" : ""} onClick={() => setChk((s) => ({ ...s, type: k }))}>{l}</button>)}</div>
      </div>
      <div className="card ls">
        {list.slice(0, limit).map((c, j) => {
          const em = eff(c);
          const st = conv(c) ? "Beauftragt" : c.step == null ? "Profil-Auswahl" : (CHECK_DROP[checkStepOf(c)] || CHECK_DROP[1]).t;
          return (
            <button key={c.id} type="button" className="ord ckr" style={{ "--pi": Math.min(j, 10) }} onClick={() => openSheet({ kind: "chk", id: c.id, c: offerByCheck[c.id] ? { ...c, offer: offerByCheck[c.id] } : c })}>
              <span className="t"><span className="l1"><b>{c.profile || c.name || "—"}{c.dupes > 1 ? <i className="x2">{c.dupes}×</i> : null}</b></span>
                <span className="l2">{c.test ? <span className="ktag ktest">Test</span> : null}<span className={"ktag" + (c.isRev ? "" : " kp")}>{c.isRev ? <Star /> : <Store />}{c.isRev ? "Bewertungen" : "Profil"}</span>
                  <span className="cdt">{fmtDT(c.createdAt)}</span><span className="rt">{c.rating && c.rating !== "—" ? c.rating + " ★" : "– ★"}</span>&nbsp;{num(c.reviews)} · {st}{c.source ? " · " + srcLabelOf(c) : ""}{c.exitReason ? <> · <b style={{ color: "#b45309", fontWeight: 600 }}>{EXIT_LABEL[c.exitReason] || c.exitReason}</b></> : null}{offerByCheck[c.id] ? <> · <b style={{ color: offerByCheck[c.id].status === "accepted" ? "#047857" : "#a34f00", fontWeight: 600 }}>Angebot {offerByCheck[c.id].status === "accepted" ? "angenommen" : offerHot(offerByCheck[c.id]) ? "· heiß" : "gesendet"}</b></> : null}</span></span>
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
      {c.exitReason ? (
        <div style={{ margin: "12px 0 0", padding: "12px 14px", borderRadius: 14, background: "#fff7e6", color: "#7a3b00", fontSize: 14, lineHeight: 1.5 }}>
          <b style={{ display: "block", color: "#5c2c00" }}>Abbruchgrund: {EXIT_LABEL[c.exitReason] || c.exitReason}</b>
          {c.exitText ? <span style={{ display: "block", margin: "4px 0" }}>„{c.exitText}"</span> : null}
          <span style={{ fontSize: 12, opacity: 0.8 }}>{[EXIT_STEP[c.exitStep], EXIT_VIA[c.exitVia], c.exitAt ? fmtDT(c.exitAt) : ""].filter(Boolean).join(" · ")}</span>
        </div>
      ) : null}
      {c.offer ? (
        <div style={{ margin: "12px 0 0", padding: "12px 14px", borderRadius: 14, background: "#f6f6f5", fontSize: 14 }}>
          <b style={{ display: "block", marginBottom: 6 }}>Angebot {c.offer.id} · {fmtMoneyA(c.offer.amount, c.offer.cur)} · {c.offer.email}</b>
          <OfferTimeline o={c.offer} />
        </div>
      ) : null}
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
