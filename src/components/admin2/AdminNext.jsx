"use client";
/* RapidRemove Admin (neu) — Claude-Design-Handoff „Admin-App · Aufträge & Navigation".
   Läuft unter /admin/neu parallel zum alten /admin: gleicher Login, gleiche echte Daten, gleiche Backend-Aktionen.
   Mobil: schwebende Tab-Pille, Push-Screens, Bottom-Sheets. Desktop (≥ 900 px): Sidebar, Drawer von rechts, Modals. */
import React from "react";
import {
  Inbox, LayoutGrid, Radar, User, Check, CheckCircle2, Users, UserX, Mail, Zap, ChevronRight, Image as ImageIcon, ExternalLink, Download, X,
  RefreshCw, MapPin, Pause, Play, Link as LinkIcon, Plus, Store,
} from "lucide-react";
import {
  fetchAdminData, fetchStripe, fetchTemplates, sendTemplate, setOrderStatus, setOrderAssignee, partnerTasks, partnerSettings, partnersList,
  fetchReviewShots, reviewShotUrl, monitorList, monitorScan, monitorAction, monitorInform, monitorLookup, monitorAdd, monitorShotUrl,
} from "@/lib/admin-api";
import { FORM_QUESTIONS } from "@/lib/order-form";
import { asset } from "@/lib/base";
import { STAFF, staffOf, bucket, computeOffer, readTplUsage, bumpTplUsage, STORNO_KEYS, AUTO_KEYS, OPEN } from "./model";
import { OrdersList, OrderDetail, ReviewsScreen, keyOf } from "./OrdersScreens";
import { Overview, MonitorScreen, Account, MS, fmtDT } from "./MoreScreens";

const DESK_Q = "(min-width: 900px)";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";

export default function AdminNext() {
  const [isDesk, setIsDesk] = React.useState(() => typeof window !== "undefined" && window.matchMedia(DESK_Q).matches);
  const [orders, setOrders] = React.useState([]);
  const [checks, setChecks] = React.useState([]);
  const [loaded, setLoaded] = React.useState(false);
  const [stripe, setStripe] = React.useState(null);
  const [tpls, setTpls] = React.useState(null);
  const [ptasks, setPtasks] = React.useState({});      // orderId → partner tasks
  const [shots, setShots] = React.useState({});        // orderId → review-shots response
  const [mon, setMon] = React.useState(null);
  const [auto, setAutoS] = React.useState(null);
  const [partners, setPartners] = React.useState(null);
  const [now, setNow] = React.useState(() => Date.now());
  const [spin, setSpin] = React.useState(false);

  const [tab, setTab] = React.useState(() => { try { return localStorage.getItem("rr_admin2_tab") || "orders"; } catch (e) { return "orders"; } });
  const [stack, setStack] = React.useState([{ v: "list" }]); // Aufträge: list → detail → reviews
  const [moreSub, setMoreSub] = React.useState(null);
  const [f, setFState] = React.useState({ scope: "open", tile: null, type: "all", staff: "all", q: "" });
  const [sheet, setSheet] = React.useState(null);
  const [viewer, setViewer] = React.useState(null);
  const [toastS, setToastS] = React.useState(null);
  const toastT = React.useRef(null);
  const paneRefs = React.useRef({});

  const toast = React.useCallback((m) => { setToastS({ m, k: Date.now() }); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastS(null), 2600); }, []);
  const setF = (patch) => setFState((s) => ({ ...s, ...patch }));

  /* ---- Daten ---- */
  const reload = React.useCallback(async (silent) => {
    try {
      const d = await fetchAdminData();
      if (d) { setOrders(d.orders || []); setChecks(d.checks || []); }
      setLoaded(true); setNow(Date.now());
      if (!silent) toast("Aktualisiert");
    } catch (e) { setLoaded(true); toast("Laden fehlgeschlagen: " + e.message); }
  }, [toast]);
  React.useEffect(() => {
    reload(true);
    fetchStripe().then(setStripe).catch(() => setStripe({ connected: false }));
    fetchTemplates().then(setTpls).catch(() => setTpls([]));
    partnerTasks().then((r) => {
      const m = {}; (r.tasks || []).forEach((t) => { if (t.orderId) (m[t.orderId] = m[t.orderId] || []).push(t); }); setPtasks(m);
    }).catch(() => {});
    partnerSettings().then(setAutoS).catch(() => {});
    partnersList().then(setPartners).catch(() => {});
    monitorList().then(setMon).catch(() => {});
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = FONT_HREF; document.head.appendChild(l); }
    const mq = window.matchMedia(DESK_Q); const on = () => setIsDesk(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    const iv = setInterval(() => reload(true), 90000);
    const tick = setInterval(() => setNow(Date.now()), 60000);
    // Deep-Link ?order=RR-… öffnet direkt den Auftrag
    try { const id = new URLSearchParams(window.location.search).get("order"); if (id) { setTab("orders"); setStack([{ v: "list" }, { v: "detail", id }]); } } catch (e) {}
    return () => { clearInterval(iv); clearInterval(tick); mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on); };
  }, [reload]);
  React.useEffect(() => { try { localStorage.setItem("rr_admin2_tab", tab); } catch (e) {} }, [tab]);

  const refresh = async () => { setSpin(false); requestAnimationFrame(() => setSpin(true)); setTimeout(() => setSpin(false), 800); await reload(false); };
  const monLoad = React.useCallback(() => monitorList().then(setMon).catch((e) => toast("Monitor: " + e.message)), [toast]);
  const monScan = async (id) => { try { await monitorScan(id); toast(id ? "Prüfung gestartet" : "Scan gestartet"); setTimeout(monLoad, 1500); } catch (e) { toast("Scan: " + e.message); } };
  React.useEffect(() => { if (!mon || !(mon.run || (mon.checking || []).length)) return; const t = setTimeout(monLoad, 4000); return () => clearTimeout(t); }, [mon, monLoad]);
  const loadShots = React.useCallback((id) => fetchReviewShots(id).then((r) => setShots((s) => ({ ...s, [id]: r }))).catch(() => {}), []);

  /* ---- Navigation ---- */
  const scrollTop = (k) => { const p = paneRefs.current[k]; if (p) p.scrollTop = 0; };
  const openOrder = (id, fromOtherTab) => {
    setTab("orders"); setStack([{ v: "list" }, { v: "detail", id }]);
    if (!isDesk) requestAnimationFrame(() => scrollTop("push"));
    void fromOtherTab;
  };
  const pushReviews = (id) => { setStack((s) => [...s.filter((x) => x.v !== "reviews"), { v: "reviews", id }]); requestAnimationFrame(() => scrollTop("push")); };
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const closeDrawer = () => setStack([{ v: "list" }]);
  const goOrders = (tile) => { setTab("orders"); setStack([{ v: "list" }]); setF({ scope: "open", tile }); };
  const switchTab = (k) => {
    if (k === tab) {
      if (k === "orders" && stack.length > 1) { setStack([{ v: "list" }]); return; }
      if (k === "more" && moreSub) { setMoreSub(null); return; }
      const p = paneRefs.current[k]; if (p) p.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTab(k);
  };
  const openSheet = (s) => setSheet(s);
  const closeSheet = () => setSheet(null);
  const openViewer = (v) => { setSheet(null); setViewer(v); };

  /* Esc + Edge-Swipe zurück */
  React.useEffect(() => {
    const k = (e) => {
      if (e.key !== "Escape") return;
      if (viewer) { setViewer(null); return; }
      if (sheet) { setSheet(null); return; }
      if (tab === "orders" && stack.length > 1) { isDesk && stack.length === 2 ? closeDrawer() : back(); return; }
      if (tab === "more" && moreSub) setMoreSub(null);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const sx = React.useRef(null);
  const onDown = (e) => { if (!isDesk && e.clientX < 24 && ((tab === "orders" && stack.length > 1) || (tab === "more" && moreSub))) sx.current = e.clientX; };
  const onUp = (e) => { if (sx.current !== null && e.clientX - sx.current > 70) { if (tab === "orders") back(); else setMoreSub(null); } sx.current = null; };

  /* ---- Aktionen (echte Backend-Calls wie im alten Admin) ---- */
  const patchOrder = (id, patch) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const doStatus = async (o, status, extra = {}) => {
    await setOrderStatus({ orderId: o.id, status, label: extra.label, pay: extra.pay });
    patchOrder(o.id, { status, ...(extra.pay ? { pay: extra.pay } : {}), ...(status === "done" ? { doneAt: o.doneAt || new Date().toISOString() } : {}) });
  };
  const assign = async (o, who) => {
    await setOrderAssignee({ orderId: o.id, assignee: who === "none" ? null : who, force: true });
    patchOrder(o.id, { assignee: who === "none" ? null : who });
  };
  const act = {
    start: async (o, who) => {
      if (!o.assignee && !who) { openSheet({ kind: "staff", forId: o.id, start: true }); return; }
      try { if (who) await assign(o, who); await doStatus(o, "progress", { label: "In Bearbeitung" }); toast("Bearbeitung gestartet"); }
      catch (e) { toast("Fehler: " + e.message); }
    },
    done: async (o) => {
      try { await doStatus(o, "done", { label: "Gelöscht", pay: o.pay === "paid" ? "paid" : o.pay || "pending" }); toast("Als erledigt markiert"); }
      catch (e) { toast("Fehler: " + e.message); }
    },
    remind: (o) => openSheet({ kind: "tplsend", forId: o.id, key: "mahnung", label: "Mahnung / Zahlungserinnerung" }),
  };
  const sendTpl = async (o, key, label) => {
    try {
      await sendTemplate({ key, to: o.email, orderId: o.id, lang: o.lang || "de", name: o.name || "", service: o.service, hasSub: o.protection === "monthly" || o.protection === "monitor", hasProtection: !!(o.protection && o.protection !== "none"), offer: computeOffer(o) });
      bumpTplUsage(key);
      let note = "";
      if (STORNO_KEYS.includes(key)) { await doStatus(o, "storniert", { label: "Storniert" }); note = " · storniert"; }
      else if (key === "reaktivierung") { await doStatus(o, "progress", { label: "Reaktiviert" }); note = " · reaktiviert"; }
      else if (key === "mahnung" && o.status === "done") { await doStatus(o, "done", { pay: "mahnung", label: "Mahnung" }); }
      toast(`„${label}“ gesendet${note}`);
    } catch (e) { toast("Senden fehlgeschlagen: " + e.message); }
  };
  const setAuto = async (k, v) => {
    setAutoS((a) => ({ ...a, [k]: v }));
    try { const r = await partnerSettings({ [k]: v }); setAutoS(r); toast(`${k === "autoReviews" ? "Bewertungen" : "Profile"}: Weiterleitung ${v ? "an" : "aus"}`); }
    catch (e) { toast("Fehler: " + e.message); partnerSettings().then(setAutoS).catch(() => {}); }
  };
  const logout = () => { try { localStorage.removeItem("rr_admin_token"); sessionStorage.removeItem("rr_admin_token"); localStorage.removeItem("rr_admin_faceid"); } catch (e) {} window.location.reload(); };

  const ctx = {
    orders, checks, loaded, now, stripe, ptasks, shots, loadShots, mon, monLoad, monScan, auto, setAuto, partners, isDesk, spin,
    f, setF, openOrder, pushReviews, back: isDesk && stack.length === 2 ? closeDrawer : back, openSheet, openViewer, act, refresh, goOrders,
    moreSub, setMoreSub, logout, toast, tplCount: tpls ? tpls.length : 0, selId: stack.length > 1 ? stack[1].id : null,
  };

  const top = stack[stack.length - 1];
  const pushBody = top.v === "detail" ? <OrderDetail ctx={ctx} id={top.id} /> : top.v === "reviews" ? <ReviewsScreen ctx={{ ...ctx, back }} id={top.id} /> : null;
  const nNew = orders.filter((o) => o.status === "new").length;
  const nFound = mon ? (mon.profiles || []).filter((p) => p.status === "found").length : 0;
  const tabs = [["orders", Inbox, "Aufträge", nNew, ""], ["home", LayoutGrid, "Übersicht"], ["monitor", Radar, "Monitor", nFound, "red"], ["more", User, "Konto"]];
  const pane = (k, body, extra = "") => (
    <main key={k} className={"scr" + extra} ref={(el) => { paneRefs.current[k] = el; }} style={{ display: tab === k ? undefined : "none" }}
      onPointerDown={onDown} onPointerUp={onUp}>{body}</main>
  );

  return (
    <div className={"an" + (isDesk ? " desk" : " mob")}>
      <nav className="tabbar">
        {isDesk ? <img className="logo" src={asset("/assets/admin/logo-full.webp")} alt="RapidRemove" /> : null}
        {tabs.map(([k, I, l, n, c]) => (
          <button key={k} type="button" className={"tb" + (tab === k ? " on" : "")} onClick={() => switchTab(k)} aria-label={l}>
            <I /><span>{l}</span>{n ? <span className={"bd " + (c || "")}>{isDesk ? n : ""}</span> : null}
          </button>
        ))}
        {isDesk ? <a className="tb old" href="/admin"><ExternalLink /><span>Bisheriges Admin</span></a> : null}
      </nav>

      {pane("orders", <OrdersList ctx={ctx} />, " list" + (!isDesk && stack.length > 1 ? " hidden" : ""))}
      {pane("home", <Overview ctx={ctx} />, " col")}
      {pane("monitor", <MonitorScreen ctx={ctx} />, " col")}
      {pane("more", <Account ctx={ctx} />, " col" + (moreSub ? " anim" : ""))}

      {/* Auftrag / Bewertungen: mobil als Push-Screen, Desktop als Drawer */}
      {isDesk ? (
        <>
          <div className={"dscrim" + (tab === "orders" && pushBody ? " open" : "")} onClick={closeDrawer} />
          <main className={"scr dpane" + (tab === "orders" && pushBody ? " open" : "")} ref={(el) => { paneRefs.current.push = el; }}>{tab === "orders" ? pushBody : null}</main>
        </>
      ) : tab === "orders" && pushBody ? (
        <main key={top.v + top.id} className="scr push anim" ref={(el) => { paneRefs.current.push = el; }} onPointerDown={onDown} onPointerUp={onUp}>{pushBody}</main>
      ) : null}

      <Sheet ctx={ctx} sheet={sheet} close={closeSheet} tpls={tpls} sendTpl={sendTpl} assign={assign} isDesk={isDesk} orders={orders} />
      <div className={"vw" + (viewer ? " show" : "")}>
        {viewer ? (
          <>
            <div className="vt"><button type="button" className="circ" aria-label="Schließen" onClick={() => setViewer(null)}><X /></button><div><b>{viewer.title}</b><span>{viewer.sub}</span></div>
              {viewer.dl ? <a className="circ" href={viewer.dl} aria-label="Herunterladen"><Download /></a> : <span />}</div>
            <div className="vi"><img src={viewer.src} alt="" /></div>
            {viewer.open ? <div className="va"><a className="cta gh" href={viewer.open} target="_blank" rel="noopener noreferrer"><ExternalLink />Bewertung öffnen</a></div> : null}
          </>
        ) : null}
      </div>
      <div className={"atoast" + (toastS ? " show" : "")}><CheckCircle2 /><span>{toastS ? toastS.m : ""}</span></div>
    </div>
  );
}

/* ---------------- Bottom-Sheets / Modals ---------------- */
function Sheet({ ctx, sheet, close, tpls, sendTpl, assign, isDesk, orders }) {
  const { f, setF, act, toast, ptasks, shots, openViewer, mon, monLoad, monScan, now } = ctx;
  const [cat, setCat] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [link, setLink] = React.useState("");
  const [place, setPlace] = React.useState(null);
  React.useEffect(() => { setCat(null); setConfirm(null); setBusy(false); setLink(""); setPlace(null); }, [sheet]);
  const o = sheet && sheet.forId ? orders.find((x) => x.id === sheet.forId) : null;
  let body = null;
  const Opt = ({ children, onClick, on, right }) => <button type="button" className="aopt" onClick={onClick}>{children}{right || null}{on ? <span className="ck"><Check /></span> : null}</button>;

  if (sheet && sheet.kind === "scope") {
    const cnt = (k) => orders.filter((x) => { const b = bucket(x, now); return k === "open" ? OPEN.includes(b) : k === "closed" ? !OPEN.includes(b) : true; }).length;
    body = <><h3>Anzeigen</h3><div className="opts">{[["open", "Offen"], ["closed", "Abgeschlossen"], ["all", "Alle"]].map(([k, l]) => <Opt key={k} on={f.scope === k} onClick={() => { setF({ scope: k, tile: null }); close(); }} right={<span className="c">{cnt(k)}</span>}>{l}</Opt>)}</div></>;
  } else if (sheet && sheet.kind === "staff") {
    const curS = o ? (o.assignee || "none") : f.staff;
    const opts = [...(o ? [] : [["all", "Alle Betreuer", null, orders.length]]), ...STAFF.map((s) => [s.id, s.name, s.src, orders.filter((x) => x.assignee === s.id).length]), ["none", o ? "Niemand" : "Nicht zugewiesen", null, orders.filter((x) => !x.assignee).length]];
    const pick = async (k) => {
      close();
      if (!o) { setF({ staff: k }); return; }
      if (sheet.start) { await act.start(o, k === "none" ? null : k); return; }
      try { await assign(o, k); toast(k === "none" ? "Zuweisung entfernt" : "Zugewiesen an " + staffOf(k).name); } catch (e) { toast("Fehler: " + e.message); }
    };
    body = (
      <><h3>{o ? (sheet.start ? "Wer übernimmt?" : "Betreuer zuweisen") : "Betreuer filtern"}</h3>
        <div className="opts">{opts.filter(([k]) => !(sheet.start && k === "none")).map(([k, l, img, n]) => (
          <Opt key={k} on={curS === k} onClick={() => pick(k)} right={o ? null : <span className="c">{n}</span>}>{img ? <img src={img} alt="" /> : <span className="ico">{k === "all" ? <Users /> : <UserX />}</span>}{l}</Opt>
        ))}</div></>
    );
  } else if (sheet && (sheet.kind === "tpl" || sheet.kind === "tplsend") && o) {
    const sendNow = async (key, label) => { setBusy(true); await sendTpl(o, key, label); setBusy(false); close(); };
    const c = confirm || (sheet.kind === "tplsend" ? { key: sheet.key, label: sheet.label } : null);
    if (c) {
      body = (
        <><h3>Vorlage senden?</h3><p className="shp">„{c.label}“ an <b>{o.name || o.email}</b> ({o.email}){STORNO_KEYS.includes(c.key) ? " · der Auftrag wird dabei storniert" : ""}.</p>
          <div className="ctas2"><button type="button" className="cta gh" onClick={() => (sheet.kind === "tplsend" ? close() : setConfirm(null))}>Abbrechen</button><button type="button" className="cta" disabled={busy || !o.email} onClick={() => sendNow(c.key, c.label)}><Mail />{busy ? "Sendet …" : "Senden"}</button></div></>
      );
    } else {
      const usage = readTplUsage();
      const list = tpls || [];
      const top = [...list].sort((a, b) => (usage[b.key] || 0) - (usage[a.key] || 0)).slice(0, 5);
      const groups = ["Mitwirkung", "Storno", "Schutz", "Bestellung"].map((g) => [g, list.filter((t) => t.group === g)]).filter(([, l]) => l.length);
      const row = (t) => <Opt key={t.key} onClick={() => setConfirm({ key: t.key, label: t.label })} right={AUTO_KEYS.includes(t.key) ? <span className="zp" title="Wird sonst automatisch versendet"><Zap /></span> : null}><span className="ico"><Mail /></span><span className="ol">{t.label}</span></Opt>;
      body = (
        <><h3>Vorlage senden</h3>
          {!tpls ? <p className="shp">Lädt …</p> : (
            <>
              {!cat ? <><p className="shl">Am häufigsten</p><div className="opts">{top.map(row)}</div></> : <><p className="shl">{cat}</p><div className="opts">{list.filter((t) => t.group === cat).map(row)}</div></>}
              <p className="shl" style={{ paddingTop: 16 }}>Alle Vorlagen</p>
              <div className="cats">{groups.map(([g, l]) => <button key={g} type="button" className={"achip" + (cat === g ? " on" : "")} onClick={() => setCat(cat === g ? null : g)}>{g}<span className="n">{l.length}</span></button>)}</div>
            </>
          )}</>
      );
    }
  } else if (sheet && sheet.kind === "fb" && o) {
    const fo = o.form || {};
    const filled = !!fo.filledAt;
    body = (
      <><h3 style={{ paddingBottom: 2 }}>Fragebogen</h3><p className="shp" style={{ color: filled ? "var(--success)" : "var(--g3)", fontWeight: 600 }}>{filled ? "Ausgefüllt" : "Nicht ausgefüllt"}</p>
        <div className="opts">{FORM_QUESTIONS.map((q) => { const v = fo[q.key]; return <div key={q.key} className="fbr"><span>{q.short}</span><b style={{ color: v === "ja" ? "var(--success)" : v === "nein" ? "var(--danger)" : "#bbb" }}>{v === "ja" ? "Ja" : v === "nein" ? "Nein" : "—"}</b></div>; })}
          {o.lang !== "de" ? <div className="fbr"><span>PayPal-Zahlung (10 % Rabatt)</span><b style={{ color: fo.paypal ? "var(--info)" : "#bbb" }}>{fo.paypal || "—"}</b></div> : null}</div>
        {!filled ? <div className="ctas" style={{ marginTop: 12 }}><button type="button" className="cta" onClick={() => ctx.openSheet({ kind: "tplsend", forId: o.id, key: "fragebogen", label: "Fragebogen anfordern" })}><Mail />Per Mail anfordern</button></div> : null}</>
    );
  } else if (sheet && sheet.kind === "rv" && o) {
    const items = o.reviewItems || [];
    const it = sheet.idx >= 0 ? items[sheet.idx] : null;
    const t = it ? (ptasks[o.id] || []).find((x) => x.itemKey === keyOf(it)) : null;
    const sh = (shots[o.id] && shots[o.id].shots || []).find((s) => s.idx === sheet.idx && s.status === "ok");
    const acc = o.reviewsAccepted ? new Set(o.reviewsAccepted.map(keyOf)) : null;
    const dec = it && acc ? (acc.has(keyOf(it)) ? (it.old ? "Angenommen · älter 4 Wo." : "Angenommen") : "Abgelehnt") : null;
    const title = it ? (t ? t.code + " · " : "#" + (sheet.idx + 1) + " · ") + (it.name || "Bewertung") : "Profil";
    body = (
      <><h3 style={{ paddingBottom: 2 }}>{title}</h3>
        <p className="shp" style={{ fontWeight: 600 }}>{it ? [t ? ({ new: "Partner: noch offen", working: "Partner arbeitet", removed: "Gelöscht", not_possible: "Partner: nicht möglich", software: "Software · wartet auf Kunde", cancelled: "Storniert" })[t.status] : "Nicht beim Partner", dec].filter(Boolean).join(" · ") : (o.profile || o.company || "Google-Profil")}</p>
        {it && it.text ? <p className="shq">„{it.text}“</p> : null}
        <div className="opts" style={{ marginTop: 12 }}>
          <Opt onClick={() => (sh ? openViewer({ src: reviewShotUrl(sh.id), dl: reviewShotUrl(sh.id, true), title, sub: "Screenshot", open: it && it.url }) : toast("Noch kein Screenshot vorhanden"))} right={<ChevronRight className="chev" />}><span className="ico"><ImageIcon /></span>Screenshot ansehen</Opt>
          {it && it.url ? <a className="aopt" href={it.url} target="_blank" rel="noopener noreferrer"><span className="ico"><ExternalLink /></span>Bewertung öffnen<ChevronRight className="chev" /></a> : null}
          {!it && (o.mapsUri) ? <a className="aopt" href={o.mapsUri} target="_blank" rel="noopener noreferrer"><span className="ico"><MapPin /></span>In Google Maps öffnen<ChevronRight className="chev" /></a> : null}
          {sh ? <a className="aopt" href={reviewShotUrl(sh.id, true)}><span className="ico"><Download /></span>Herunterladen<ChevronRight className="chev" /></a> : null}
        </div>
        {it ? <p className="shp" style={{ marginTop: 12 }}>Annehmen / Ablehnen und Abrechnung laufen vorerst noch im bisherigen Admin.</p> : null}</>
    );
  } else if (sheet && sheet.kind === "mon") {
    const p = mon && (mon.profiles || []).find((x) => x.id === sheet.id);
    if (p) {
      const s = MS[p.status] || MS.ok;
      const paused = p.status === "paused" || p.status === "exp";
      const run = async (fn, okMsg) => { setBusy(true); try { await fn(); toast(okMsg); monLoad(); } catch (e) { toast("Fehler: " + e.message); } setBusy(false); close(); };
      body = (
        <><h3 style={{ paddingBottom: 2 }}>{p.name}</h3><p className="shp" style={{ color: s[1], fontWeight: 600 }}>{s[0]} · zuletzt {fmtDT(p.lastCheckAt || p.foundAt)}</p>
          {sheet.inform ? (
            <><p className="shp">Kunde {p.custName || ""} {p.custEmail ? `(${p.custEmail})` : ""} per Mail informieren, dass das Profil wieder online ist?</p>
              <div className="ctas2"><button type="button" className="cta gh" onClick={close}>Abbrechen</button><button type="button" className="cta" disabled={busy || !p.custEmail} onClick={() => run(() => monitorInform(p.id), "Kunde informiert")}><Mail />Informieren</button></div></>
          ) : (
            <div className="opts">
              <Opt onClick={() => (p.lastShotId ? openViewer({ src: monitorShotUrl(p.lastShotId), dl: monitorShotUrl(p.lastShotId, true), title: p.name, sub: "Screenshot · " + fmtDT(p.foundAt || p.lastCheckAt) }) : toast("Kein Screenshot vorhanden"))}><span className="ico"><ImageIcon /></span>Screenshot ansehen</Opt>
              <Opt onClick={() => { close(); monScan(p.id); }}><span className="ico"><RefreshCw /></span>Jetzt prüfen</Opt>
              {p.mapsUrl || p.foundUrl ? <a className="aopt" href={p.foundUrl || p.mapsUrl} target="_blank" rel="noopener noreferrer"><span className="ico"><MapPin /></span>In Google Maps öffnen</a> : null}
              {p.custEmail ? <Opt onClick={() => ctx.openSheet({ kind: "mon", id: p.id, inform: true })}><span className="ico"><Mail /></span>Kunde informieren</Opt> : null}
              <Opt onClick={() => run(() => monitorAction(p.id, paused ? "resume" : "pause"), paused ? "Fortgesetzt" : "Pausiert")}><span className="ico">{paused ? <Play /> : <Pause />}</span>{paused ? "Fortsetzen" : "Pausieren"}</Opt>
            </div>
          )}</>
      );
    }
  } else if (sheet && sheet.kind === "madd") {
    const look = async () => { setBusy(true); setPlace(null); try { const r = await monitorLookup({ link: link.trim() }); if (r.place) setPlace(r.place); else toast("Kein Profil gefunden"); } catch (e) { toast("Suche: " + e.message); } setBusy(false); };
    const add = async () => { setBusy(true); try { await monitorAdd({ name: place.name, address: place.address, placeId: place.placeId, mapsUrl: place.mapsUrl, type: "monthly" }); toast("Profil wird überwacht"); monLoad(); close(); } catch (e) { toast("Hinzufügen: " + e.message); setBusy(false); } };
    body = (
      <><h3>Profil überwachen</h3>
        <div className="usrch in-sheet"><LinkIcon /><input autoFocus placeholder="Google-Maps-Link einfügen" value={link} onChange={(e) => { setLink(e.target.value); setPlace(null); }} onKeyDown={(e) => e.key === "Enter" && link.trim().length > 6 && look()} /></div>
        {place ? <div className="opts" style={{ marginBottom: 12 }}><div className="aopt"><span className="ico"><Store /></span><span className="ol"><b>{place.name}</b><br /><small>{place.address}</small></span></div></div> : null}
        <div className="ctas">{place ? <button type="button" className="cta" disabled={busy} onClick={add}><Plus />Hinzufügen</button> : <button type="button" className="cta" disabled={busy || link.trim().length < 7} onClick={look}>{busy ? "Sucht …" : "Profil suchen"}</button>}</div></>
    );
  }
  return (
    <>
      <div className={"bg" + (sheet ? " show" : "")} onClick={close} />
      <div className={"asheet" + (sheet && body ? " show" : "")} role="dialog">{!isDesk ? <div className="grab" /> : <button type="button" className="sx" onClick={close} aria-label="Schließen"><X /></button>}{body}</div>
    </>
  );
}
