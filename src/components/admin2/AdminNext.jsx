"use client";
/* RapidRemove Admin (neu) — Claude-Design-Handoff „Admin-App · Aufträge & Navigation".
   Läuft unter /admin (seit 06.10.2026); das alte Admin liegt unter /admin/alt: gleicher Login, gleiche echte Daten, gleiche Backend-Aktionen.
   Mobil: schwebende Tab-Pille, Push-Screens, Bottom-Sheets. Desktop (≥ 900 px): Sidebar, Drawer von rechts, Modals. */
import React from "react";
import useLive from "@/lib/useLive";
import {
  Inbox, LayoutGrid, Radar, User, Check, CheckCircle2, Users, UserX, Mail, Zap, ChevronRight, Image as ImageIcon, ExternalLink, Download, X,
  RefreshCw, MapPin, Pause, Play, Link as LinkIcon, Plus, Store, Ban, RotateCcw, MailX, CalendarClock, MessageSquareOff, Handshake,
  Search, Settings, LogOut, Activity as ActIcon,
  MessageCircle as MsgCircle,
} from "lucide-react";
import {
  fetchAdminData, fetchStripe, fetchTemplates, sendTemplate, setOrderStatus, setOrderAssignee, partnerTasks, partnerSettings, partnersList,
  fetchReviewShots, reviewShotUrl, sendReviewsStorno, partnerOrderStatus, monitorList, monitorScan, monitorAction, monitorInform, monitorLookup, monitorAdd, monitorShotUrl,
} from "@/lib/admin-api";
import { FORM_QUESTIONS } from "@/lib/order-form";
import { asset } from "@/lib/base";
import { STAFF, staffOf, computeOffer, readTplUsage, bumpTplUsage, STORNO_KEYS, AUTO_KEYS, isOffen, revState, cur, payPrefOf, bucketsOf } from "./model";
import PaidCelebration from "./Celebrate";
import { OrdersList, OrderDetail, ReviewsScreen, keyOf, OrderInfoScreen, isPayOpen, RStars, rvStars } from "./OrdersScreens";
import NewOrder from "./NewOrder";
import AddReviews from "./AddReviews";
import PriceEdit from "./PriceEdit";
import Bill from "./Bill";
import { CheckSheet } from "./Checks";
import { MahnSheet } from "./Mahnung";
import { DueSheet, MailHistSheet, MailsScreen } from "./PayFlow";
import { PayLinkSheet } from "./Paylink";
import { ActivityScreen } from "./Activity";
import { AlertTriangle, Loader as LoaderIcon } from "lucide-react";
import { Overview, MonitorScreen, Account, MS, fmtDT } from "./MoreScreens";

const DESK_Q = "(min-width: 900px)";
/* Storno-Gründe (Vorlagen aus dem Backend, wie „Auftrag stornieren“ im bisherigen Admin). */
const STORNO_OPTS = [
  ["storno", "Löschung nicht möglich", "Storno-Mail · keine Kosten"],
  ["kundenstorno", "Auf Kundenwunsch", "Kunde hat storniert"],
  ["rechtestorno", "Keine Rechte am Profil", "Kunde ist nicht berechtigt"],
  ["scamstorno", "Unlautere Praktiken", "Verdacht auf Missbrauch"],
];
const RV_STORNO = [
  ["impossible", "Löschung nicht möglich", "Ganze Bestellung storniert", Ban],
  ["age", "Älter als 4 Wochen", "Bewertung zu alt", CalendarClock],
  ["text", "Kein Bewertungstext", "Nur Sterne, kein Text", MessageSquareOff],
];
const LANG_L = { de: "Deutsch", en: "Englisch", fr: "Französisch", es: "Spanisch", it: "Italienisch", nl: "Niederländisch", pt: "Portugiesisch", sv: "Schwedisch", no: "Norwegisch", ja: "Japanisch" };
/* Bewertungs-Storno: Sprache der Bestellung (Deutsch inkl.). */
const rvLang = (o) => o.lang || "en";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap";

/* Fehler in einer Ansicht (z. B. ein Auftrag mit unerwarteten Daten) → kein weißer Bildschirm, sondern Fehlermeldung + Zurück. */
class ViewGuard extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { try { console.error("Admin-Ansicht abgestürzt", err, info && info.componentStack); } catch (e) { /* */ } }
  render() {
    if (!this.state.err) return this.props.children;
    const e = this.state.err;
    return (
      <div style={{ padding: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Diese Ansicht hat einen Fehler</h2>
        <p style={{ color: "var(--g3)", marginBottom: 12 }}>Bitte Screenshot an den Support – die App läuft normal weiter.</p>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, background: "#fff", borderRadius: 14, padding: 14, maxHeight: 260, overflow: "auto" }}>{String((e && e.message) || e)}{"\n"}{String((e && e.stack) || "").split("\n").slice(0, 6).join("\n")}</pre>
        <button type="button" className="cta" style={{ marginTop: 14 }} onClick={this.props.back}>Zurück</button>
      </div>
    );
  }
}

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
  const [chk, setChk] = React.useState({ q: "", f: "open", src: "all", type: "all", saved: {}, sent: {}, prog: null }); // Geprüfte Profile (bleibt beim Tab-Wechsel erhalten)
  const [now, setNow] = React.useState(() => Date.now());
  const [spin, setSpin] = React.useState(false);

  const [tab, setTab] = React.useState("orders"); // Start immer: Aufträge › Neu
  const [stack, setStack] = React.useState([{ v: "list" }]); // Aufträge: list → detail → reviews
  const [moreSub, setMoreSub] = React.useState(null);
  const [f, setFState] = React.useState({ scope: "open", tile: "new", type: "all", staff: "all", q: "" });
  const [sheet, setSheet] = React.useState(null);
  const [viewer, setViewer] = React.useState(null);
  const [toastS, setToastS] = React.useState(null);
  const toastT = React.useRef(null);
  const paneRefs = React.useRef({});

  const toast = React.useCallback((m) => { setToastS({ m, k: Date.now() }); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastS(null), 2600); }, []);
  const setF = (patch) => setFState((s) => ({ ...s, ...patch }));

  /* ---- Daten ---- */
  const [ptAll, setPtAll] = React.useState(null); // alle Partner-Aufgaben (Löschquote in der Übersicht)
  const loadPtasks = React.useCallback(() => partnerTasks().then((r) => {
    const m = {}; (r.tasks || []).forEach((t) => { if (t.orderId) (m[t.orderId] = m[t.orderId] || []).push(t); }); setPtasks(m);
    setPtAll((r.tasks || []).filter((t) => !t.test));
  }).catch(() => {}), []);
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
    loadPtasks();
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

  // „Aktualisieren": Aufträge + Partner-Status + Monitor neu laden; dreht, bis alles da ist.
  const [refreshing, setRefreshing] = React.useState(false);
  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true); setSpin(false); requestAnimationFrame(() => setSpin(true));
    try { await Promise.all([reload(true), loadPtasks(), monitorList().then(setMon).catch(() => {})]); toast("Aktualisiert · " + new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })); }
    finally { setRefreshing(false); setSpin(false); }
  };
  // Live: neue Bestellung, Partner-Status, Zahlung … → still neu laden (ohne App-Neustart).
  useLive(() => Promise.all([reload(true), loadPtasks()]));
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
  const pushSub = (v, id) => { setStack((s) => [...s.filter((x) => !["reviews", "act", "mails", "info", "addrev", "prices", "bill"].includes(x.v)), { v, id }]); requestAnimationFrame(() => scrollTop("push")); };
  const pushAct = (id) => { setStack((s) => [...s.filter((x) => x.v !== "reviews" && x.v !== "act"), { v: "act", id }]); requestAnimationFrame(() => scrollTop("push")); };
  const pushReviews = (id) => { setStack((s) => [...s.filter((x) => x.v !== "reviews"), { v: "reviews", id }]); requestAnimationFrame(() => scrollTop("push")); };
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const newOrder = () => { setTab("orders"); setStack([{ v: "list" }, { v: "new", id: "n" + Date.now() }]); requestAnimationFrame(() => scrollTop("push")); };
  const closeDrawer = () => setStack([{ v: "list" }]);
  const goOrders = (tile) => { setTab("orders"); setStack([{ v: "list" }]); setF({ scope: "open", tile }); };
  // Desktop: Konto-Unterpunkte direkt in der Seitenleiste ("more:<sub>")
  // Desktop hat keine Konto-Kachelseite → nie „leer“ auf "more" landen
  React.useEffect(() => { if (isDesk && tab === "more" && !moreSub) setMoreSub("checked"); }, [isDesk, tab, moreSub]);
  const switchTab = (k) => {
    if (k.startsWith("more:")) { const sub = k.slice(5); setTab("more"); setMoreSub(sub); const p = paneRefs.current.more; if (p) p.scrollTo({ top: 0 }); return; }
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
  const openViewer = (v) => { if (!v.keep) setSheet(null); setViewer(v); }; // keep: Sheet bleibt dahinter offen (z. B. Mahnung → Vorschau)

  /* Esc + Edge-Swipe zurück */
  React.useEffect(() => {
    const k = (e) => {
      if (e.key !== "Escape") return;
      if (viewer) { setViewer(null); return; }
      if (sheet) { setSheet(null); return; }
      if (tab === "orders" && stack.length > 1) { isDesk && stack.length === 2 ? closeDrawer() : back(); return; }
      if (tab === "more" && moreSub && !isDesk) setMoreSub(null);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const sx = React.useRef(null);
  const onDown = (e) => { if (!isDesk && e.clientX < 24 && ((tab === "orders" && stack.length > 1) || (tab === "more" && moreSub))) sx.current = e.clientX; };
  const onUp = (e) => { if (sx.current !== null && e.clientX - sx.current > 70) { if (tab === "orders") back(); else setMoreSub(null); } sx.current = null; };

  /* ---- Aktionen (echte Backend-Calls wie im alten Admin) ---- */
  const patchOrder = (id, patch) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  /* „Als bezahlt markieren": erst speichern, dann Feier, dann gleitet der Auftrag aus „Zahlung offen".
     Lokal sofort wie nach dem nächsten Laden: Auftrag bezahlt, bei Bewertungen alle bis jetzt gelöschten als bezahlt
     (das Backend macht dasselbe in markOrderReviewsPaidManual). */
  const [cel, setCel] = React.useState(null);
  const [leaving, setLeaving] = React.useState({});
  const paidPatch = (o) => {
    const r = revState(o, ptasks[o.id]);
    return { status: "done", pay: "paid", doneAt: o.doneAt || new Date().toISOString(), ...(r && r.unpaidKeys ? { reviewsPaidKeys: [...new Set([...(o.reviewsPaidKeys || []), ...r.unpaidKeys])] } : {}) };
  };
  const dueOf = (o) => {
    const r = revState(o, ptasks[o.id]);
    if (r) return payPrefOf(o) ? Math.round(r.unpaidAmt * 90) / 100 : r.unpaidAmt; // PayPal/Wise: 10 % Rabatt
    const oneTime = (Number(o.amount) || 0) + (o.express ? Number(o.expressAmount) || 0 : 0) + (o.protection === "lifetime" ? Number(o.protAmount) || 0 : 0);
    if (!payPrefOf(o)) return oneTime; // Karte: Abo läuft separat über Stripe
    // PayPal/Wise wie im Angebot (computeOffer): Einmalbetrag −10 % + Schutz-Abo als Jahr zum Preis von 10 Monaten.
    const sub = (o.protection === "monthly" || o.protection === "monitor") ? (Number(o.protAmount) || 0) * 10 : 0;
    return Math.round((oneTime * 0.9 + sub) * 100) / 100;
  };
  const markPaid = async (list, label) => {
    const ok = [];
    for (const x of list) {
      try { await setOrderStatus({ orderId: x.id, status: "done", pay: "paid", label }); ok.push(x); }
      catch (e) { toast(`${x.id}: ${e.message}`); }
    }
    if (!ok.length) return 0;
    const first = ok[0];
    setCel({ k: Date.now(), ids: ok.map((x) => x.id), amt: ok.filter((x) => cur(x) === cur(first)).reduce((s, x) => s + dueOf(x), 0), c: cur(first), name: first.name || first.company || first.email || first.id, n: ok.length, patches: ok.map((x) => [x.id, paidPatch(x)]) });
    return ok.length;
  };
  const celRef = React.useRef(null); celRef.current = cel;
  const celDone = React.useCallback(() => {
    const c = celRef.current; if (!c) return;
    setCel(null);
    setStack([{ v: "list" }]); // Auftrag schließen …
    setLeaving(Object.fromEntries(c.ids.map((id) => [id, true]))); // … Zeile gleitet raus …
    setTimeout(() => { c.patches.forEach(([id, p]) => patchOrder(id, p)); setLeaving({}); }, 450); // … und verschwindet aus der Kachel
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const doStatus = async (o, status, extra = {}) => {
    await setOrderStatus({ orderId: o.id, status, label: extra.label, pay: extra.pay });
    patchOrder(o.id, { status, ...(extra.pay ? { pay: extra.pay } : {}), ...(status === "done" ? { doneAt: o.doneAt || new Date().toISOString() } : {}) });
  };
  const assign = async (o, who) => {
    await setOrderAssignee({ orderId: o.id, assignee: who === "none" ? null : who, force: true });
    patchOrder(o.id, { assignee: who === "none" ? null : who });
  };
  const act = {
    start: async (o, who, force) => {
      // Bewertungen beim Partner → erst warnen und den neuen Status wählen lassen
      if (!force && o.service === "reviews" && (ptasks[o.id] || []).some((t) => t.status !== "cancelled")) { openSheet({ kind: "rvstart", forId: o.id }); return; }
      if (!o.assignee && !who) { openSheet({ kind: "staff", forId: o.id, start: true }); return; }
      try { if (who) await assign(o, who); await doStatus(o, "progress", { label: "In Bearbeitung" }); toast("Bearbeitung gestartet"); }
      catch (e) { toast("Fehler: " + e.message); }
    },
    done: async (o) => {
      try { await doStatus(o, "done", { label: "Gelöscht", pay: o.pay === "paid" ? "paid" : o.pay || "pending" }); toast("Als erledigt markiert"); }
      catch (e) { toast("Fehler: " + e.message); }
    },
    remind: (o) => openSheet({ kind: "mahn", forId: o.id }),
    storno: (o) => openSheet({ kind: "storno", forId: o.id }),
    reactivate: (o) => openSheet({ kind: "react", forId: o.id }),
  };
  /* Stornieren wie im bisherigen Admin: Storno-Mail (Vorlage bzw. Bewertungs-Storno) + Status „storniert".
     Der Server zieht dabei offene Partner-Aufgaben des Auftrags automatisch zurück. */
  const doStorno = async (o, c) => {
    try {
      if (c.type === "rv") {
        await sendReviewsStorno({ orderId: o.id, email: o.email, name: o.name, lang: rvLang(o), reason: c.reason, items: o.reviewItems || [] });
        await doStatus(o, "storniert", { label: "Storniert" });
        closeDrawer(); // nach dem Stornieren Auftrag schließen
        toast(`Storno (${c.label}) gesendet · storniert`);
      } else if (c.type === "tpl") {
        await sendTpl(o, c.key, c.label);
      } else {
        await doStatus(o, "storniert", { label: "Storniert" });
        closeDrawer();
        toast("Auftrag storniert");
      }
    } catch (e) { toast("Storno fehlgeschlagen: " + e.message); }
  };
  const doReactivate = async (o, withMail) => {
    if (withMail) { await sendTpl(o, "reaktivierung", "Auftrag wieder aktiviert"); return; }
    try { await doStatus(o, "progress", { label: "Reaktiviert" }); toast("Auftrag reaktiviert"); } catch (e) { toast("Fehler: " + e.message); }
  };
  const sendTpl = async (o, key, label) => {
    try {
      await sendTemplate({ key, to: o.email, orderId: o.id, lang: o.lang || "de", name: o.name || "", service: o.service, hasSub: o.protection === "monthly" || o.protection === "monitor", hasProtection: !!(o.protection && o.protection !== "none"), offer: computeOffer(o) });
      bumpTplUsage(key);
      let note = "";
      if (STORNO_KEYS.includes(key)) { await doStatus(o, "storniert", { label: "Storniert" }); note = " · storniert"; closeDrawer(); }
      else if (key === "reaktivierung") { await doStatus(o, "progress", { label: "Reaktiviert" }); note = " · reaktiviert"; }
      else if (key === "mahnung" && o.status === "done") { await doStatus(o, "done", { pay: "mahnung", label: "Mahnung" }); }
      toast(`„${label}“ gesendet${note}`);
    } catch (e) { toast("Senden fehlgeschlagen: " + e.message); }
  };
  const setAuto = async (k, v) => {
    setAutoS((a) => ({ ...a, [k]: v }));
    try { const r = await partnerSettings({ [k]: v }); setAutoS(r); toast(k.startsWith("disc") ? `PayPal/Wise −10 % · ${k === "discReviews" ? "Bewertungen" : "Profil-Löschungen"}: ${v ? "an" : "aus"}` : `${k === "autoReviews" ? "Bewertungen" : "Profile"}: Weiterleitung ${v ? "an" : "aus"}`); }
    catch (e) { toast("Fehler: " + e.message); partnerSettings().then(setAutoS).catch(() => {}); }
  };
  const logout = () => { try { localStorage.removeItem("rr_admin_token"); sessionStorage.removeItem("rr_admin_token"); localStorage.removeItem("rr_admin_faceid"); } catch (e) {} window.location.reload(); };

  const ctx = {
    orders, checks, loaded, now, stripe, ptasks, shots, loadShots, mon, monLoad, monScan, auto, setAuto, partners, isDesk, spin, refreshing,
    f, setF, openOrder, pushReviews, back: isDesk && stack.length === 2 ? closeDrawer : back, openSheet, openViewer, act, refresh, goOrders,
    moreSub, setMoreSub, logout, toast, tplCount: tpls ? tpls.length : 0, selId: stack.length > 1 ? stack[1].id : null,
    newOrder, scrollPush: () => scrollTop("push"), chk, setChk, patchOrder, pushAct, pushSub, loadPtasks, doStatus, ptAll, markPaid, leaving,
  };

  const top = stack[stack.length - 1];
  const pushBody = top.v === "detail" ? <OrderDetail ctx={ctx} id={top.id} /> : top.v === "reviews" ? <ReviewsScreen ctx={{ ...ctx, back }} id={top.id} />
    : top.v === "act" ? <ActivityScreen ctx={{ ...ctx, back }} id={top.id} />
    : top.v === "mails" ? <MailsScreen ctx={{ ...ctx, back }} id={top.id} payOpen={(x) => isPayOpen(x, now, ptasks)} />
    : top.v === "info" ? <OrderInfoScreen ctx={{ ...ctx, back }} id={top.id} />
    : top.v === "addrev" ? <AddReviews ctx={{ ...ctx, back }} id={top.id} />
    : top.v === "prices" ? <PriceEdit ctx={{ ...ctx, back }} id={top.id} />
    : top.v === "bill" ? <Bill ctx={{ ...ctx, back }} id={top.id} />
    : top.v === "new" ? <NewOrder key={top.id} ctx={{ ...ctx, back: isDesk ? closeDrawer : back }} /> : null;
  const inFlow = tab === "orders" && (top.v === "new" || top.v === "addrev" || top.v === "prices" || top.v === "bill");
  const nNew = orders.filter((o) => !o.test && bucketsOf(o, now, ptasks[o.id]).includes("new")).length; // wie die Kachel „Neu", ohne Tests
  const nFound = mon ? (mon.profiles || []).filter((p) => p.status === "found").length : 0;
  const tabs = [["orders", Inbox, "Aufträge", nNew, ""], ["home", LayoutGrid, "Übersicht"], ["monitor", Radar, "Monitor", nFound, "red"], ["more", User, "Konto"]];
  // Desktop: keine Konto-Kachelseite – alle Punkte direkt in der Seitenleiste
  const deskTabs = [["orders", Inbox, "Aufträge", nNew, ""], ["home", LayoutGrid, "Übersicht"], ["monitor", Radar, "Monitor", nFound, "red"],
    ["more:checked", Search, "Geprüfte Profile"], ["more:activity", ActIcon, "Aktivitäten"], ["more:chats", MsgCircle, "Website-Chats"], ["more:partner", Handshake, "Partner"], ["more:settings", Settings, "Einstellungen"]];
  const isOn = (k) => (k.startsWith("more:") ? tab === "more" && moreSub === k.slice(5) : tab === k);
  const toOld = (view) => { try { localStorage.setItem("rr_admin_view", view); } catch (e) { /* */ } window.location.href = "/admin/alt"; };
  const pane = (k, body, extra = "") => (
    <main key={k} className={"scr" + extra} ref={(el) => { paneRefs.current[k] = el; }} style={{ display: tab === k ? undefined : "none" }}
      onPointerDown={onDown} onPointerUp={onUp}>{body}</main>
  );

  return (
    <div className={"an" + (isDesk ? " desk" : " mob") + (inFlow ? " flow" : "")}>
      <nav className="tabbar">
        {isDesk ? <img className="logo" src={asset("/assets/admin/logo-full.webp")} alt="RapidRemove" /> : null}
        {(isDesk ? deskTabs : tabs).map(([k, I, l, n, c], i) => (
          <React.Fragment key={k}>
            {isDesk && i === 3 ? <div className="tsec">Verwaltung</div> : null}
            <button type="button" className={"tb" + (isOn(k) ? " on" : "")} onClick={() => switchTab(k)} aria-label={l} title={l}>
              <I /><span>{l}</span>{n ? <span className={"bd " + (c || "")}>{isDesk ? n : ""}</span> : null}
            </button>
          </React.Fragment>
        ))}
        {isDesk ? (
          <>
            <button type="button" className="tb" onClick={() => toOld("templates")} aria-label="Vorlagen" title="Vorlagen (bisheriges Admin)"><Mail /><span>Vorlagen</span><ExternalLink className="ext" /></button>
            <button type="button" className="tb" onClick={() => toOld("customers")} aria-label="Kunden" title="Kunden (bisheriges Admin)"><Users /><span>Kunden</span><ExternalLink className="ext" /></button>
            <button type="button" className="tb rf" onClick={refresh} aria-label="Aktualisieren" title="Aktualisieren"><RefreshCw className={refreshing ? "spin" : ""} /><span>Aktualisieren</span></button>
            <a className="tb old" href="/admin/alt" title="Bisheriges Admin"><ExternalLink /><span>Bisheriges Admin</span></a>
            <button type="button" className="tb" onClick={logout} aria-label="Abmelden" title="Abmelden"><LogOut /><span>Abmelden</span></button>
          </>
        ) : null}
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
        <main key={top.v + top.id} className="scr push anim" ref={(el) => { paneRefs.current.push = el; }} onPointerDown={onDown} onPointerUp={onUp}><ViewGuard key={top.v + top.id} back={back}>{pushBody}</ViewGuard></main>
      ) : null}

      <Sheet ctx={ctx} sheet={sheet} close={closeSheet} tpls={tpls} sendTpl={sendTpl} assign={assign} isDesk={isDesk} orders={orders} doStorno={doStorno} doReactivate={doReactivate} />
      <div className={"vw" + (viewer ? " show" : "")}>
        {viewer ? (
          <>
            <div className="vt"><button type="button" className="circ" aria-label="Schließen" onClick={() => setViewer(null)}><X /></button><div><b>{viewer.title}</b><span>{viewer.sub}</span></div>
              {viewer.dl ? <a className="circ" href={viewer.dl} aria-label="Herunterladen"><Download /></a> : <span />}</div>
            <div className={"vi" + (viewer.html ? " mail" : "")}>{viewer.html ? <iframe title="E-Mail" srcDoc={viewer.html} sandbox="allow-popups allow-popups-to-escape-sandbox" /> : <img src={viewer.src} alt="" />}</div>
            {viewer.open ? <div className="va"><a className="cta gh" href={viewer.open} target="_blank" rel="noopener noreferrer"><ExternalLink />Bewertung öffnen</a></div> : null}
          </>
        ) : null}
      </div>
      <div className={"atoast" + (toastS ? " show" : "")}><CheckCircle2 /><span>{toastS ? toastS.m : ""}</span></div>
      <PaidCelebration data={cel} onDone={celDone} />
    </div>
  );
}

/* ---------------- Bottom-Sheets / Modals ---------------- */
function Sheet({ ctx, sheet, close, tpls, sendTpl, assign, isDesk, orders, doStorno, doReactivate }) {
  const { f, setF, act, toast, ptasks, shots, openViewer, mon, monLoad, monScan, now } = ctx;
  const [cat, setCat] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [link, setLink] = React.useState("");
  const [place, setPlace] = React.useState(null);
  React.useEffect(() => { setCat(null); setConfirm(null); setBusy(false); setLink(""); setPlace(null); }, [sheet]);
  const o = sheet && sheet.forId ? orders.find((x) => x.id === sheet.forId) : null;
  let body = null;
  const Opt = ({ children, onClick, on, right, red, disabled }) => <button type="button" className={"aopt" + (red ? " red" : "")} disabled={disabled} onClick={onClick}>{children}{right || null}{on ? <span className="ck"><Check /></span> : null}</button>;

  if (sheet && sheet.kind === "scope") {
    const cnt = (k) => orders.filter((x) => (k === "open" ? isOffen(x) : k === "closed" ? !isOffen(x) : true)).length;
    body = <><h3>Anzeigen</h3><div className="opts">{[["open", "Offen"], ["closed", "Abgeschlossen"], ["all", "Alle"]].map(([k, l]) => <Opt key={k} on={f.scope === k} onClick={() => { setF({ scope: k, tile: null }); close(); }} right={<span className="c">{cnt(k)}</span>}>{l}</Opt>)}</div></>;
  } else if (sheet && sheet.kind === "staff") {
    const curS = o ? (o.assignee || "none") : f.staff;
    const opts = [...(o ? [] : [["all", "Alle Betreuer", null, orders.length]]), ...STAFF.map((s) => [s.id, s.name, s.src, orders.filter((x) => x.assignee === s.id).length]), ["none", o ? "Niemand" : "Nicht zugewiesen", null, orders.filter((x) => !x.assignee).length]];
    const pick = async (k) => {
      close();
      if (!o) { setF({ staff: k }); return; }
      if (sheet.start) { await act.start(o, k === "none" ? null : k, true); return; }
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
      const list = (tpls || []).filter((t) => !["storno-reviews", "storno-reviews-all", "mahnung", "mahnung-reviews"].includes(t.key)); // Mahnungen: eigener Ablauf (Mahnung senden)
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
  } else if (sheet && sheet.kind === "pick") {
    body = (
      <><h3>{sheet.title}</h3>
        <div className="opts">{sheet.opts.map(([k, l, img, n]) => <Opt key={k} on={sheet.cur === k} onClick={() => { sheet.onPick(k); close(); }} right={n != null ? <span className="c">{n}</span> : null}>{img ? <img src={img} alt="" /> : null}{l}</Opt>)}</div></>
    );
  } else if (sheet && sheet.kind === "rvstart" && o) {
    const pt = (ptasks[o.id] || []).filter((t) => t.status !== "cancelled");
    const open = pt.filter((t) => t.status !== "removed" && !t.paid);
    const sym = o.country === "US" ? "$" : "€";
    const OPTS = [
      ["working", "Löschbar, in Bearbeitung", "Kunde sieht „In Bearbeitung“"],
      ["software", `Nur mit Spezialsoftware · 300 ${sym}`, "Kunde bekommt das Software-Angebot (Vorauszahlung)"],
      ["not_possible", "Nicht löschbar", "Kunde wird informiert: Löschung nicht möglich"],
    ];
    const pick = confirm && confirm.rv;
    const run = async () => {
      setBusy(true);
      try {
        const r = await partnerOrderStatus(o.id, pick);
        if (o.status === "new") await ctx.doStatus(o, "progress", { label: "In Bearbeitung" });
        await ctx.loadPtasks();
        toast(`${OPTS.find((x) => x[0] === pick)[1]} · ${r.changed} von ${r.total} Bewertung(en) geändert`);
        close();
      } catch (e) { toast("Fehler: " + e.message); }
      setBusy(false);
    };
    body = (
      <><span className="shx"><AlertTriangle /></span>
        <h3 style={{ paddingBottom: 6 }}>Achtung, Partner bearbeitet diese Bestellung</h3>
        <p className="shp">{pt.length} {pt.length === 1 ? "Bewertung liegt" : "Bewertungen liegen"} beim Partner{open.length !== pt.length ? ` (${open.length} noch offen)` : ""}. Sicher den Status ändern? Der neue Status gilt für alle offenen Bewertungen – wie wenn der Partner ihn setzt.</p>
        <div className="opts">
          {OPTS.map(([k, l, d]) => <Opt key={k} on={pick === k} onClick={() => setConfirm({ rv: k })}><span className="ol">{l}<br /><small>{d}</small></span></Opt>)}
        </div>
        <div className="ctas2" style={{ marginTop: 14 }}><button type="button" className="cta gh" onClick={close}>Abbrechen</button>
          <button type="button" className={"cta" + (pick === "not_possible" ? " red" : " or")} disabled={!pick || busy || !open.length} onClick={run}>{busy ? <LoaderIcon className="spin" /> : null}Status ändern</button></div>
        {!open.length ? <p className="shp" style={{ marginTop: 10 }}>Alle Bewertungen sind bereits erledigt (gelöscht oder bezahlt).</p> : null}
        <button type="button" className="lnkb" onClick={() => act.start(o, null, true)}>Nur den Auftrag auf „In Bearbeitung“ setzen</button></>
    );
  } else if (sheet && sheet.kind === "mahn" && o) {
    body = <MahnSheet key={o.id + "|" + (sheet.stage || "")} o={o} ctx={ctx} close={close} initialStage={sheet.stage} direct={sheet.direct} />;
  } else if (sheet && sheet.kind === "due" && o) {
    body = <DueSheet key={o.id} o={o} ctx={ctx} close={close} />;
  } else if (sheet && sheet.kind === "mailhist" && o) {
    body = <MailHistSheet key={o.id} o={o} ctx={ctx} close={close} payOpen={!!sheet.payOpen} />;

  } else if (sheet && sheet.kind === "paylink" && o) {
    body = <PayLinkSheet key={o.id} o={o} ctx={ctx} close={close} />;
  } else if (sheet && sheet.kind === "chk" && sheet.c) {
    body = <CheckSheet key={sheet.c.id} c={sheet.c} ctx={ctx} close={close} />;
  } else if (sheet && sheet.kind === "storno" && o) {
    const isRev = o.service === "reviews";
    const openPt = (ptasks[o.id] || []).filter((t) => t.status === "new" || t.status === "working").length;
    const run = async () => { setBusy(true); await doStorno(o, confirm); setBusy(false); close(); };
    if (confirm) {
      const lang = confirm.type === "rv" ? rvLang(o) : (o.lang || "de");
      body = (
        <><span className="shx"><Ban /></span><h3 style={{ paddingBottom: 6 }}>Auftrag stornieren?</h3>
          <p className="shp">{confirm.type === "none"
            ? <>Der Auftrag <b>{o.id}</b> wird ohne E-Mail auf „Storniert“ gesetzt. {o.name || o.email} erfährt davon nichts.</>
            : <>„{confirm.label}“ geht an <b>{o.name || o.email}</b> ({o.email}) auf {LANG_L[lang] || lang.toUpperCase()}. Der Auftrag wird storniert, dem Kunden entstehen keine Kosten.</>}</p>
          {isRev && openPt ? <p className="shn"><Handshake />{openPt === 1 ? "1 offene Bewertung wird" : openPt + " offene Bewertungen werden"} beim Partner automatisch zurückgezogen.</p> : null}
          <div className="ctas2"><button type="button" className="cta gh" onClick={() => setConfirm(null)}>Zurück</button><button type="button" className="cta red" disabled={busy || (confirm.type !== "none" && !o.email)} onClick={run}><Ban />{busy ? "Storniert …" : confirm.type === "none" ? "Stornieren" : "Storno senden"}</button></div></>
      );
    } else {
      const stTpl = STORNO_OPTS.map(([key, l, sub]) => { const t = (tpls || []).find((x) => x.key === key); return t || !tpls ? { key, label: l, sub } : null; }).filter(Boolean);
      body = (
        <><h3 style={{ paddingBottom: 2 }}>Auftrag stornieren</h3>
          <p className="shp">{o.name || o.email} · {o.id} — Grund wählen, der Kunde bekommt die passende Storno-Mail.</p>
          <p className="shl">Grund</p>
          <div className="opts" style={{ marginBottom: 16 }}>
            {isRev
              ? RV_STORNO.map(([reason, l, sub, I]) => <Opt key={reason} red disabled={!o.email} onClick={() => setConfirm({ type: "rv", reason, label: l })} right={<ChevronRight className="chev" />}><span className="ico"><I /></span><span className="ol">{l}<br /><small>{sub} · Mail auf {LANG_L[rvLang(o)]}</small></span></Opt>)
              : stTpl.map((t) => <Opt key={t.key} red disabled={!o.email} onClick={() => setConfirm({ type: "tpl", key: t.key, label: t.label })} right={<ChevronRight className="chev" />}><span className="ico"><Mail /></span><span className="ol">{t.label}<br /><small>{t.sub}</small></span></Opt>)}
          </div>
          <div className="opts"><Opt onClick={() => setConfirm({ type: "none" })} right={<ChevronRight className="chev" />}><span className="ico"><MailX /></span><span className="ol">Ohne E-Mail stornieren<br /><small>z. B. Test- oder Doppelbestellung</small></span></Opt></div></>
      );
    }
  } else if (sheet && sheet.kind === "react" && o) {
    const run = async (withMail) => { setBusy(true); await doReactivate(o, withMail); setBusy(false); close(); };
    body = (
      <><h3 style={{ paddingBottom: 2 }}>Auftrag reaktivieren</h3>
        <p className="shp">{o.name || o.email} · {o.id} — der Auftrag geht zurück auf „In Bearbeitung“.</p>
        <div className="opts">
          <Opt disabled={busy || !o.email} onClick={() => run(true)}><span className="ico"><Mail /></span><span className="ol">Mit E-Mail an Kunde<br /><small>„Auftrag wieder aktiviert“ an {o.email || "—"}</small></span></Opt>
          <Opt disabled={busy} onClick={() => run(false)}><span className="ico"><RotateCcw /></span><span className="ol">Ohne E-Mail<br /><small>Nur den Status zurücksetzen</small></span></Opt>
        </div></>
    );
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
      <><h3 style={{ paddingBottom: 2 }}>{title} <RStars n={rvStars(it, t)} /></h3>
        <p className="shp" style={{ fontWeight: 600 }}>{it ? [t ? ({ new: "Beim Partner · noch nicht gestartet", working: "Partner arbeitet", removed: "Gelöscht", not_possible: "Partner: nicht möglich", software: "Software · wartet auf Kunde", cancelled: "Storniert" })[t.status] : "Nicht beim Partner", dec].filter(Boolean).join(" · ") : (o.profile || o.company || "Google-Profil")}</p>
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
          {p.status === "fail" && p.lastNote ? <p className="shp" style={{ fontSize: 13, wordBreak: "break-word" }}>{p.lastNote}</p> : null}
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
        {place ? <div className="opts" style={{ marginBottom: 12 }}><div className="aopt"><span className="ico"><Store /></span><span className="ol"><b>{place.name}</b><br /><small>{place.hidden ? "Aktuell nicht öffentlich bei Google (z. B. schon gelöscht) – wird trotzdem überwacht" : place.address}</small></span></div></div> : null}
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
