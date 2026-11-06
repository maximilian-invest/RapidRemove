"use client";
/* Neues Admin — Übersicht, Monitor, Konto (Einstellungen, Partner). Echte Daten. */
import React from "react";
import {
  RefreshCw, Euro, TrendingUp, TrendingDown, ChevronRight, FlaskConical, Plus, ExternalLink, Mail, Image as ImageIcon, Maximize2, Store,
  ArrowLeft, Search, Handshake, Settings, Users, LogOut, Zap, Copy, StarOff, Check, Activity as ActIcon, BarChart3, MessageCircle, Banknote, Timer,
} from "lucide-react";
import { IMG, ageMin, fmtAge, orderMoney, money, ST, bucketsOf, mainBucket, SERVICE_L } from "./model";
import { Avatar, KTag } from "./OrdersScreens";
import { ChecksScreen } from "./Checks";
import { GlobalActivityScreen } from "./Activity";
import { monitorShotUrl, testPurgeApi, expressStatus, expressSet, durationsSet, industryStatsApi } from "@/lib/admin-api";
import { normDur, normTier, fmtTier, fillDur, durKey, DUR_DEFAULT, DUR_MAX } from "@/lib/durations";
import PartnerStatsScreen from "./PartnerStats";
import SiteChatsScreen from "./SiteChats";
import PayoutsScreen from "./Payouts";
import { PartnersScreen, RoutesBlock } from "./Partners";
import PricingScreen from "./Pricing";

/* ---------------- Übersicht ---------------- */
export function Overview({ ctx }) {
  const { orders: allOrders, checks: allChecks, now, stripe, goOrders, openOrder, refresh, spin, ptasks } = ctx;
  // Statistiken ohne Testbestellungen/-prüfungen (Inhaber-Adresse, „+test").
  const orders = allOrders.filter((o) => !o.test), checks = allChecks.filter((c) => !c.test);
  const bsOf = (o) => bucketsOf(o, now, (ptasks || {})[o.id]); // Bewertungen: Status aus den Partner-Aufgaben
  const b = orders.map(bsOf);
  const nNew = b.filter((x) => x.includes("new")).length, nWork = b.filter((x) => x.includes("work")).length;
  const nDone = orders.filter((o) => o.status === "done").length, nCancel = orders.filter((o) => o.status === "storniert").length;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = (iso) => iso && new Date(iso).getTime() >= today.getTime();
  const newToday = orders.filter((o) => isToday(o.createdAt)).length;
  const doneToday = orders.filter((o) => o.status === "done" && isToday(o.doneAt)).length;
  const conv = checks.length ? Math.round((checks.filter((c) => c.orderId).length / checks.length) * 100) : 0;
  const succ = nDone + nCancel ? Math.round((nDone / (nDone + nCancel)) * 100) : 0;
  const workAvgH = (() => {
    const w = orders.filter((o) => o.status === "progress" && o.createdAt);
    if (!w.length) return null;
    return Math.round(w.reduce((s, o) => s + (now - new Date(o.createdAt).getTime()) / 3600000, 0) / w.length);
  })();
  // Stripe: Umsatz dieses Monats, Trend Woche ggü. Vorwoche, Sparkline der letzten 7 Tage
  const rev = stripe && stripe.connected ? stripe.rev : null;
  const monthV = rev && rev.month.length ? rev.month[rev.month.length - 1].v : null;
  const wk = rev ? rev.week : [];
  const trend = wk.length >= 2 && wk[wk.length - 2].v ? ((wk[wk.length - 1].v - wk[wk.length - 2].v) / wk[wk.length - 2].v) * 100 : null;
  const spark = rev ? (rev.day.length >= 4 ? rev.day.slice(-7) : wk.slice(-7)).map((p) => p.v) : [];
  const mx = Math.max(...spark, 1), mn = Math.min(...spark, 0);
  const pts = spark.map((v, j) => `${(j * 100) / Math.max(1, spark.length - 1)},${36 - ((v - mn) / Math.max(1, mx - mn)) * 30}`).join(" ");
  const recent = [...orders].sort((a, c) => new Date(c.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);
  const pipe = [["Eingegangen heute", newToday, "var(--primary)"], ["In Bearbeitung", nWork, "var(--warning)"], ["Gelöscht heute", doneToday, "var(--success)"]];
  const pm = Math.max(...pipe.map((p) => p[1]), 1);
  const hr = new Date().getHours();
  const monthName = new Date().toLocaleDateString("de-AT", { month: "long" });
  return (
    <>
      <div className="hd"><div><span>{hr < 11 ? "Guten Morgen" : hr < 18 ? "Hallo" : "Guten Abend"}</span><h1>Übersicht</h1></div>
        <button type="button" className={"circ" + (spin ? " spin" : "")} aria-label="Aktualisieren" onClick={refresh}><RefreshCw /></button></div>
      <div className="ovh">
        <span className="hpill"><Euro />Umsatz bezahlt · {monthName}</span>
        <div className="amtl"><b>{monthV == null ? "–" : monthV.toLocaleString("de-DE")}</b><i className="eur">€</i></div>
        {trend != null ? <span className={"dl" + (trend >= 0 ? " up" : " dn")}>{trend >= 0 ? <TrendingUp /> : <TrendingDown />}{(trend >= 0 ? "+" : "") + trend.toFixed(1).replace(".", ",")} % ggü. Vorwoche</span> : <span className="dl">Noch kein Vergleich</span>}
        {spark.length > 1 ? <svg className="spk" viewBox="0 -2 100 40" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg> : null}
        <span className="stripe"><span className={"dt " + (rev ? "d-deleted" : "d-cancel")} />{rev ? "Stripe live verbunden" : stripe ? "Stripe nicht verbunden" : "Stripe wird geladen …"}</span>
      </div>
      <button type="button" className="newb" onClick={() => goOrders("new")}><span className="gi"><img src={IMG("new")} alt="" /></span><span className="t"><b>{nNew} neue Aufträge</b><span>+{newToday} heute · jetzt bearbeiten</span></span><ChevronRight /></button>
      <div className="kgrid">
        <div className="kc"><span className="kl">Erfolgsquote</span><div className="kr"><b>{succ} %</b><span className="ring" style={{ "--p": succ }} /></div><span className="ks">{nDone} gelöscht · {nCancel} storniert</span></div>
        <div className="kc"><span className="kl">Prüfung → Auftrag</span><div className="kr"><b>{conv} %</b><span className="ring" style={{ "--p": conv }} /></div><span className="ks">Konversionsrate</span></div>
        <div className="kc"><span className="kl">Profile geprüft</span><b>{checks.length}</b><span className="ks">{checks.filter((c) => c.status === "neu" && !c.orderId).length} neu, unbearbeitet</span></div>
        <div className="kc"><span className="kl">In Bearbeitung</span><b>{nWork}</b><span className="ks">{workAvgH != null ? `Ø ${workAvgH} Std. Laufzeit` : "—"}</span></div>
      </div>
      <RemovalRates ptAll={ctx.ptAll} />
      <IndustryStats />
      <div className="sec3"><h2>Pipeline heute</h2></div>
      <div className="card pipe">{pipe.map(([l, n, c]) => <div key={l} className="pr"><div className="t"><span>{l}</span><b>{n}</b></div><span className="bar"><i style={{ "--w": (n / pm) * 100 + "%", background: c }} /></span></div>)}</div>
      <div className="sec3"><h2>Neueste Aufträge</h2><button type="button" className="lk" onClick={() => goOrders(null)}>Alle<ChevronRight /></button></div>
      <div className="card ls">{recent.map((o) => { const bb = mainBucket(bsOf(o)); return (
        <button key={o.id} type="button" className="ord" onClick={() => openOrder(o.id, true)}><Avatar o={o} /><span className="t"><span className="l1"><b>{o.name || o.email}</b><span className="p">{orderMoney(o)}</span></span><span className="l2"><KTag o={o} /><span className={"dt d-" + bb} />{ST[bb].l} · {fmtAge(ageMin(o, bb, now))}</span></span></button>
      ); })}</div>
    </>
  );
}

/* Löschquote je Kategorie (Partner-Aufgaben): gelöscht ÷ entschieden (gelöscht + nicht möglich + nur per Software).
   Offene (neu/in Arbeit) zählen nicht in die Quote, werden aber angezeigt. */
const RR_CATS = [["normal", "Bis 4 Wochen", "Bewertungen mit Text, jünger als 4 Wochen"], ["old", "Älter als 4 Wochen", "Bewertungen mit Text, älter als 4 Wochen"], ["nt", "Ohne Text", "Reine Sternebewertungen (Spezialverfahren)"], ["profile", "Ganze Profile", "Profil-Löschungen über den Partner"]];
function RemovalRates({ ptAll }) {
  const rows = (ptAll || []).filter((t) => t.status !== "cancelled");
  const calc = (list) => {
    const rem = list.filter((t) => t.status === "removed").length;
    const no = list.filter((t) => t.status === "not_possible").length;
    const sw = list.filter((t) => t.status === "software").length;
    const open = list.filter((t) => t.status === "new" || t.status === "working").length;
    const dec = rem + no + sw;
    return { rem, no, sw, open, dec, q: dec ? Math.round((rem / dec) * 100) : null, n: list.length };
  };
  const cats = RR_CATS.map(([k, l, d]) => [k, l, d, calc(rows.filter((t) => (t.kind || "normal") === k))]).filter(([k, , , c]) => c.n || k !== "profile");
  const all = calc(rows.filter((t) => t.kind !== "profile"));
  const col = (q) => (q == null ? "#d4d4d8" : q >= 70 ? "var(--success)" : q >= 40 ? "var(--warning)" : "var(--danger)");
  const sub = (c) => [c.rem + " gelöscht", c.no ? c.no + " nicht möglich" : "", c.sw ? c.sw + " nur Software" : "", c.open ? c.open + " offen" : ""].filter(Boolean).join(" · ") || "Noch keine Bewertungen";
  return (
    <>
      <div className="sec3"><h2>Löschquote Einzelbewertungen</h2></div>
      <div className="card rrq">
        {ptAll == null ? <div className="rq"><span className="t"><span>Lädt …</span></span></div> : null}
        {ptAll != null ? (
          <div className="rq tot">
            <div className="t"><span>Gesamt (ohne Profile)</span><b>{all.q == null ? "–" : all.q + " %"}</b></div>
            <span className="bar"><i style={{ "--w": (all.q || 0) + "%", background: col(all.q) }} /></span>
            <span className="s">{sub(all)}</span>
          </div>
        ) : null}
        {ptAll != null ? cats.map(([k, l, d, c]) => (
          <div key={k} className="rq" title={d}>
            <div className="t"><span>{l}</span><b style={{ color: c.q == null ? "var(--g3)" : "var(--ink)" }}>{c.q == null ? "–" : c.q + " %"}</b></div>
            <span className="bar"><i style={{ "--w": (c.q || 0) + "%", background: col(c.q) }} /></span>
            <span className="s">{sub(c)}</span>
          </div>
        )) : null}
      </div>
      <p className="sh rqn">Quote = gelöscht ÷ entschieden (gelöscht, nicht möglich, nur per Software). Offene Bewertungen beim Partner zählen erst, wenn sie entschieden sind.</p>
    </>
  );
}

/* Branchen (06.11.2026): welche Branchen bestellen, zahlen, stornieren. Branche = Google-Kategorie des Profils (raw.ind),
   Altaufträge über den Kategorie-Namen nachgetragen. P = Premium-Branche (+25 % Preis). Ohne Testaufträge. */
function IndustryStats() {
  const [days, setDays] = React.useState(0);
  const [st, setSt] = React.useState(null);
  const [err, setErr] = React.useState("");
  React.useEffect(() => {
    let live = true; setErr("");
    industryStatsApi(days).then((j) => { if (live) setSt(j); }).catch((e) => { if (live) setErr(e.message || "Fehler"); });
    return () => { live = false; };
  }, [days]);
  const rows = (st && st.rows) || [];
  const mx = Math.max(1, ...rows.map((r) => r.orders));
  const prem = rows.filter((r) => r.premium).reduce((a, r) => a + r.orders, 0);
  const col = (r) => { const q = r.orders ? r.storno / r.orders : 0; return q >= 0.5 ? "var(--danger)" : q >= 0.3 ? "var(--warning)" : "var(--success)"; };
  const eur = (v) => Math.round(v || 0).toLocaleString("de-DE") + " €";
  return (
    <>
      <div className="sec3"><h2>Branchen</h2>
        <span className="indsw">{[[0, "Gesamt"], [30, "30 Tage"], [90, "90 Tage"]].map(([d, l]) => <button key={d} type="button" className={days === d ? "on" : ""} onClick={() => setDays(d)}>{l}</button>)}</span></div>
      <div className="card rrq">
        {err ? <div className="rq"><span className="s">Konnte nicht laden: {err}</span></div> : !st ? <div className="rq"><span className="s">Lädt …</span></div> : (
          <>
            <div className="rq tot"><div className="t"><span>{st.total} Aufträge</span><b>{st.total ? Math.round((prem / st.total) * 100) : 0} % Premium</b></div>
              <span className="s">Balken = Anzahl Aufträge · Farbe = Storno-Quote (grün &lt; 30 %, gelb &lt; 50 %, rot ab 50 %)</span></div>
            {rows.map((r) => (
              <div key={r.ind} className="rq">
                <div className="t"><span>{r.label}{r.premium ? <em className="indp">Premium</em> : null}</span><b>{r.orders}</b></div>
                <span className="bar"><i style={{ "--w": (r.orders / mx) * 100 + "%", background: col(r) }} /></span>
                <span className="s">{[r.profile ? r.profile + " Profil" : "", r.reviews ? r.reviews + " Bewertungen" : "", r.paid + " bezahlt · " + eur(r.revenue), r.storno ? r.storno + " storniert (" + Math.round((r.storno / r.orders) * 100) + " %)" : ""].filter(Boolean).join(" · ")}</span>
              </div>
            ))}
          </>
        )}
      </div>
      <p className="sh rqn">Branche aus der Google-Kategorie des Profils. Ältere Aufträge ohne Google-Daten über den Kategorie-Namen zugeordnet; „Unbekannt“ = kein Profil erkannt. Umsatz = bezahlte Aufträge (Leistung).</p>
    </>
  );
}

/* ---------------- Monitor ---------------- */
const MS = { found: ["Wieder aufgetaucht", "var(--danger)"], ok: ["Gelöscht", "var(--success)"], re: ["Erneut gelöscht", "var(--info)"], fail: ["Prüfung fehlgeschlagen", "var(--warning)"], paused: ["Pausiert", "#bbb"], exp: ["Abgelaufen", "#bbb"] };
const fmtDT = (iso) => { if (!iso) return "—"; const d = new Date(iso); return isNaN(d) ? "—" : d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) + " · " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); };
const cityOf = (a) => { const s = String(a || "").split(",").map((x) => x.trim()).filter(Boolean); return s.length > 1 ? s[s.length - 2].replace(/^\d{4,5}\s*/, "") + (s.length ? ", " + s[s.length - 1] : "") : a || "—"; };

export function MonitorScreen({ ctx }) {
  const { mon, monLoad, monScan, openSheet, openViewer } = ctx;
  const [mf, setMf] = React.useState("all");
  React.useEffect(() => { monLoad(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const list = (mon && mon.profiles) || [];
  const back = list.filter((p) => p.status === "found");
  const F = { all: () => true, ok: (p) => p.status === "ok" || p.status === "re", fail: (p) => ["fail", "paused", "exp"].includes(p.status) };
  const l = list.filter((p) => p.status !== "found").filter(F[mf]);
  const running = !!(mon && (mon.run || (mon.checking || []).length));
  const active = list.filter((p) => p.status !== "paused" && p.status !== "exp").length;
  return (
    <>
      <div className="hd"><div><span>{mon ? `${active} Profile überwacht` : "Lädt …"}</span><h1>Monitor</h1></div><button type="button" className="circ" aria-label="Profil hinzufügen" onClick={() => openSheet({ kind: "madd" })}><Plus /></button></div>
      <div className={"mhero" + (back.length ? " alert" : "")}>
        <span className="mi"><img src={IMG(back.length ? "inkasso" : "hero")} alt="" /></span>
        <b>{back.length ? `${back.length} wieder aufgetaucht` : "Alles sauber"}</b>
        <span>{back.length ? "Diese Profile sind wieder online." : "Kein gelöschtes Profil ist zurück."}</span>
        <button type="button" className={"scan" + (running ? " spin" : "")} disabled={running} onClick={() => monScan()}><span><RefreshCw />{running ? (mon.run && mon.run.current ? "Prüft: " + mon.run.current : "Prüfung läuft …") : "Scan täglich 05:00"}</span><b>{running ? "Läuft" : "Jetzt prüfen"}</b></button>
      </div>
      {back.length ? <div className="mbacks">
      {back.map((p) => (
        <div key={p.id} className="mback">
          <button type="button" className="mshot" onClick={() => p.lastShotId && openViewer({ src: monitorShotUrl(p.lastShotId), dl: monitorShotUrl(p.lastShotId, true), title: p.name, sub: "Screenshot · " + fmtDT(p.foundAt) })}>
            {p.lastShotId ? <img src={monitorShotUrl(p.lastShotId)} alt="" loading="lazy" /> : <span className="noshot"><Store /></span>}
            <span className="tm"><ImageIcon />{fmtDT(p.foundAt).split(" · ")[1] || ""}</span><span className="zm"><Maximize2 /></span>
          </button>
          <div className="mh"><span className="dt" style={{ background: "var(--danger)" }} /><div><b>{p.name}</b><span>{cityOf(p.address)}{p.custName ? " · " + p.custName : ""} · gefunden {fmtDT(p.foundAt)}</span></div></div>
          <div className="ctas2">
            <a className="cta" href={p.foundUrl || p.mapsUrl || "#"} target="_blank" rel="noopener noreferrer"><ExternalLink />Ansehen</a>
            <button type="button" className="cta gh" onClick={() => openSheet({ kind: "mon", id: p.id, inform: true })}><Mail />Informieren</button>
          </div>
        </div>
      ))}
      </div> : null}
      <div className="sec3" style={{ marginTop: 14 }}><h2>Profile</h2><div className="seg2">{[["all", "Alle"], ["ok", "Gelöscht"], ["fail", "Fehler"]].map(([k, lb]) => <button key={k} type="button" className={mf === k ? "on" : ""} onClick={() => setMf(k)}>{lb}</button>)}</div></div>
      <div className="card ls">
        {l.map((p) => { const s = MS[p.status] || MS.ok; return (
          <button key={p.id} type="button" className="ord" onClick={() => openSheet({ kind: "mon", id: p.id })}>
            <span className="mav"><Store /></span>
            <span className="t"><span className="l1"><b>{p.name}</b></span><span className="l2"><span className="dt" style={{ background: s[1] }} />{s[0]}{p.custName ? " · " + p.custName : ""}</span></span><ChevronRight />
          </button>
        ); })}
        {mon && !l.length ? <div className="aempty"><b>Nichts hier</b></div> : null}
        {!mon ? <div className="aempty"><b>Lädt …</b></div> : null}
      </div>
    </>
  );
}
export { MS, fmtDT };

/* ---------------- Konto ---------------- */
export function Account({ ctx }) {
  const { moreSub, setMoreSub, logout } = ctx;
  if (moreSub === "settings") return <SettingsScreen ctx={ctx} />;
  if (moreSub === "express") return <ExpressDurScreen ctx={ctx} />;
  if (moreSub === "tests") return <TestsScreen ctx={ctx} />;
  if (moreSub === "partner") return <PartnersScreen ctx={ctx} />;
  if (moreSub === "pstats") return <PartnerStatsScreen ctx={ctx} />;
  if (moreSub === "payouts") return <PayoutsScreen ctx={ctx} />;
  if (moreSub === "checked") return <ChecksScreen ctx={ctx} />;
  if (moreSub === "activity") return <GlobalActivityScreen ctx={ctx} />;
  if (moreSub === "chats") return <SiteChatsScreen ctx={ctx} />;
  if (moreSub === "pricing") return <PricingScreen ctx={ctx} />;
  const tiles = [
    [Search, "Geprüfte Profile", () => setMoreSub("checked")],
    [Handshake, "Partner", () => setMoreSub("partner")],
    [Banknote, "Kunden & Preise", () => setMoreSub("pricing")],
    [ActIcon, "Aktivitäten", () => setMoreSub("activity")],
    [MessageCircle, "Website-Chats", () => setMoreSub("chats")],
    [Mail, "Vorlagen", () => { try { localStorage.setItem("rr_admin_view", "templates"); } catch (e) {} window.location.href = "/admin/alt"; }],
    [Users, "Kunden", () => { try { localStorage.setItem("rr_admin_view", "customers"); } catch (e) {} window.location.href = "/admin/alt"; }],
    [Settings, "Einstellungen", () => setMoreSub("settings")],
    [FlaskConical, "Tests", () => setMoreSub("tests")],
    [LogOut, "Abmelden", logout],
  ];
  return (
    <>
      <div className="ttl">Konto</div>
      <div className="mgrid">{tiles.map(([I, l, fn]) => <button key={l} type="button" className="mg" onClick={fn}><span className="ico"><I /></span>{l}</button>)}</div>
      <p className="sh" style={{ marginTop: 16 }}>Vorlagen und Kunden öffnen vorerst noch im bisherigen Admin.</p>
      <a className="cta gh" style={{ marginTop: 8 }} href="/admin/alt">Zum bisherigen Admin</a>
    </>
  );
}

function SettingsScreen({ ctx }) {
  const { setMoreSub, auto, setAuto, partners } = ctx;
  const p = (partners && partners.partners || []).find((x) => x.active) || null;
  const pn = p ? p.name : "Partner";
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Einstellungen</div>
      <ExpressDurRow ctx={ctx} />
      <AutoMaster ctx={ctx} />
      <RoutesBlock ctx={ctx} />
      <div className="sec3"><h2>PayPal / Wise −10 %</h2></div>
      <p className="sh">Rabatt-Angebot am Ende des Checkouts (nur außerhalb DACH), im Website-Chat und vom Chatbot. Aus = Kunden zahlen normal per Karte/Zahlungsart.</p>
      <div className="info">
        {[["discProfiles", Store, "Profil-Löschungen"], ["discReviews", StarOff, "Bewertungen"]].map(([k, I, l]) => (
          <button key={k} type="button" className="ir" disabled={!auto} onClick={() => setAuto(k, !auto[k])}>
            <span className="ico"><I /></span><span className="t"><b>{l}</b><span>{!auto ? "…" : auto[k] ? "−10 % wird angeboten" : "Aus"}</span></span>
            <span className={"tg" + (auto && auto[k] ? " on" : "")}><i /></span>
          </button>
        ))}
      </div>
      <TestPurge ctx={ctx} />
    </>
  );
}

/* Hauptschalter „Bewertungen automatisch an Partner" (auto_reviews, 26.10.2026). Aus = neue Bewertungs-Aufträge (Website, Admin,
   Nachbestellung, verzögerter Start) gehen an KEINEN Partner – auch nicht an feste Partner aus „Kunden & Preise". Zuweisen dann
   je Auftrag mit „Dem Partner zuweisen". Ausschalten nur mit zweitem Tippen. Der Wert wird nur hier geändert, nie beim Laden. */
function AutoMaster({ ctx }) {
  const { auto, setAuto } = ctx;
  const [arm, setArm] = React.useState(false);
  React.useEffect(() => { if (!arm) return undefined; const x = setTimeout(() => setArm(false), 4000); return () => clearTimeout(x); }, [arm]);
  const on = auto ? auto.autoReviews !== false : null;
  const tap = () => {
    if (on === null) return;
    if (on && !arm) { setArm(true); return; }
    setArm(false); setAuto("autoReviews", !on);
  };
  return (
    <>
      <div className="sec3"><h2>Bewertungen automatisch an Partner</h2></div>
      <p className="sh">Hauptschalter für alle neuen Bewertungs-Aufträge (Website, Admin, Nachbestellungen). Aus = nichts geht automatisch an einen Partner, auch nicht an feste Partner aus „Kunden & Preise“ – du weist im Auftrag mit „Dem Partner zuweisen“ zu. Laufende Jobs bleiben unverändert.</p>
      <div className="info">
        <button type="button" className="ir" disabled={on === null} onClick={tap}>
          <span className="ico"><Zap /></span>
          <span className="t"><b>Hauptschalter</b><span style={arm ? { color: "var(--danger)", fontWeight: 600 } : undefined}>{on === null ? "…" : arm ? "Nochmal tippen: ausschalten" : on ? "An · neue Aufträge gehen laut Zuteilung an den Partner" : "Aus · neue Aufträge bleiben bei dir"}</span></span>
          <span className={"tg" + (on ? " on" : "")}><i /></span>
        </button>
      </div>
    </>
  );
}

/* Menüpunkt „Express & Löschdauer" in den Einstellungen (02.11.2026) – Zusammenfassung, Tippen öffnet die Seite. */
function ExpressDurRow({ ctx }) {
  const { setMoreSub } = ctx;
  const [st, setSt] = React.useState(null);
  React.useEffect(() => { expressStatus().then((j) => setSt({ on: j.on !== false, dur: normDur(j.dur) })).catch(() => setSt(null)); }, []);
  const sum = st ? `Express ${st.on ? "an" : "aus"} · Standard ${fmtTier(st.dur.fresh, "de")} / ${fmtTier(st.dur.other, "de")}` : "…";
  return (
    <>
      <div className="info" style={{ marginTop: 4 }}>
        <button type="button" className="ir" onClick={() => setMoreSub("express")}>
          <span className="ico"><Timer /></span><span className="t"><b>Express & Löschdauer</b><span>{sum}</span></span>
          <ChevronRight />
        </button>
      </div>
    </>
  );
}

/* Seite „Express & Löschdauer": Express an/aus + Löschdauer Standard je Preisstufe. Die Dauer steht überall, wo Kunden sie sehen:
   Website (Startseite, Landingpage inkl. FAQ/JSON-LD, Ratgeber-Hinweis), Bestellprozess, Kunden-Dashboard, Mails, Chatbot.
   Express-Frist (30 Std. / Wochenend-Regel) bleibt fest – sie hängt an Abrechnung und Partner-Timer. */
const DUR_TIERS = [
  ["fresh", "199 · bis 4 Wochen, mit Text", "Meist in {DF} gelöscht"],
  ["other", "250 · alle anderen (für Kunden pausiert bis Jänner 2027)", "Meist in {DO} gelöscht"],
];
const DUR_PRESETS = [{ min: 1, max: 2, unit: "w" }, { min: 7, max: 14, unit: "d" }, { min: 7, max: 21, unit: "d" }, { min: 2, max: 4, unit: "w" }];
function ExpressDurScreen({ ctx }) {
  const { setMoreSub, toast } = ctx;
  const [saved, setSaved] = React.useState(null); // normDur vom Server
  const [f, setF] = React.useState(null); // Formular: { fresh: { min, max, unit }, other: … } – min/max als Text
  const [busy, setBusy] = React.useState(false);
  const toForm = (d) => ({ fresh: { ...d.fresh, min: String(d.fresh.min), max: String(d.fresh.max) }, other: { ...d.other, min: String(d.other.min), max: String(d.other.max) } });
  React.useEffect(() => { expressStatus().then((j) => { const d = normDur(j.dur); setSaved(d); setF(toForm(d)); }).catch(() => { setSaved(null); setF(null); }); }, []);
  const set = (k, patch) => setF((x) => ({ ...x, [k]: { ...x[k], ...patch } }));
  const tier = (k) => (f ? normTier(f[k]) : null);
  const valid = !!(f && tier("fresh") && tier("other"));
  const next = valid ? { fresh: tier("fresh"), other: tier("other") } : null;
  const dirty = !!(next && saved && durKey(next) !== durKey(saved));
  const save = async () => {
    if (!next) return;
    setBusy(true);
    try { const j = await durationsSet(next); const d = normDur(j.dur); setSaved(d); setF(toForm(d)); toast(`Gespeichert · ${fmtTier(d.fresh, "de")} / ${fmtTier(d.other, "de")}`); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const isDefault = saved && durKey(saved) === durKey(normDur(DUR_DEFAULT));
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub("settings")}><ArrowLeft /></button></div>
      <div className="ttl">Express & Löschdauer</div>
      <ExpressToggle ctx={ctx} />
      <div className="sec3"><h2>Löschdauer Standard</h2></div>
      <p className="sh">So lange steht es für Kunden überall: Website, Bestellprozess, Kunden-Dashboard, Mails und Chatbot – in allen Sprachen. Laufende Aufträge und Express (30 Std.) ändern sich dadurch nicht. Die Website zeigt Änderungen nach spätestens 1 Minute.</p>
      {!f ? <div className="aempty"><b>{saved === null ? "Lädt …" : "Konnte nicht laden"}</b></div> : DUR_TIERS.map(([k, label, sample]) => {
        const t = tier(k);
        const bad = !t;
        return (
          <div key={k} className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              <b style={{ fontSize: 15 }}>{label}</b>
              <div className="seg2">{[["d", "Tage"], ["w", "Wochen"]].map(([u, l]) => <button key={u} type="button" className={f[k].unit === u ? "on" : ""} onClick={() => set(k, { unit: u })}>{l}</button>)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label className="pfld" style={{ margin: 0 }}><span>von</span><input type="number" inputMode="numeric" min={1} max={DUR_MAX} value={f[k].min} onChange={(e) => set(k, { min: e.target.value })} /></label>
              <label className="pfld" style={{ margin: 0 }}><span>bis</span><input type="number" inputMode="numeric" min={1} max={DUR_MAX} value={f[k].max} onChange={(e) => set(k, { max: e.target.value })} /></label>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {DUR_PRESETS.map((p) => {
                const on = t && durKey({ fresh: t, other: t }) === durKey({ fresh: p, other: p });
                return <button key={durKey({ fresh: p, other: p })} type="button" onClick={() => set(k, { min: String(p.min), max: String(p.max), unit: p.unit })}
                  style={{ height: 30, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: on ? "var(--ink,#111)" : "#f0f0f2", color: on ? "#fff" : "var(--g3)" }}>{fmtTier(p, "de")}</button>;
              })}
            </div>
            <p style={{ fontSize: 13, margin: "12px 0 0", color: bad ? "var(--danger)" : "var(--g3)" }}>
              {bad ? `Bitte ganze Zahlen 1–${DUR_MAX}, „bis“ mindestens so groß wie „von“.` : <>Kunden sehen: <b style={{ color: "var(--ink,#111)" }}>„{fillDur(sample, "de", { fresh: t, other: t })}“</b> · EN „{fmtTier(t, "en")}“</>}
            </p>
          </div>
        );
      })}
      {f ? (
        <div className="ctas2">
          <button type="button" className="cta gh" disabled={busy || isDefault} onClick={() => setF(toForm(normDur(DUR_DEFAULT)))}>Standard (1–2 Wochen)</button>
          <button type="button" className="cta" disabled={busy || !dirty} onClick={save}><Check />{busy ? "Speichert …" : dirty ? "Speichern" : "Gespeichert"}</button>
        </div>
      ) : null}
    </>
  );
}

/* Express-Löschung an/aus (20.10.2026): aus = Website, Dashboard-Bestellung und Chat zeigen „Gerade nicht verfügbar – schauen Sie
   zu einem späteren Zeitpunkt nochmal vorbei." Laufende Express-Aufträge bleiben unverändert. */
function ExpressToggle({ ctx }) {
  const { toast } = ctx;
  const [on, setOn] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { expressStatus().then((j) => setOn(j.on !== false)).catch(() => setOn(null)); }, []);
  const flip = async () => {
    if (on === null) return;
    setBusy(true);
    try { const j = await expressSet(!on); setOn(j.on !== false); toast(j.on ? "Express ist wieder buchbar" : "Express ausgeschaltet – Kunden sehen „Gerade nicht verfügbar\""); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  return (
    <>
      <div className="sec3"><h2>Express-Löschung</h2></div>
      <p className="sh">Aus = Kunden können Express nicht buchen (Website, Dashboard-Bestellung, Chat). Dort steht dann „Gerade nicht verfügbar – schauen Sie zu einem späteren Zeitpunkt nochmal vorbei.“ Laufende Express-Aufträge laufen normal weiter.</p>
      <div className="info">
        <button type="button" className="ir" disabled={on === null || busy} onClick={flip}>
          <span className="ico"><Zap /></span><span className="t"><b>Express buchbar</b><span>{on === null ? "…" : on ? "An – Kunden können Express (+100 je 250er) wählen" : "Aus – „Gerade nicht verfügbar“"}</span></span>
          <span className={"tg" + (on ? " on" : "")}><i /></span>
        </button>
      </div>
    </>
  );
}

/* Test-Konto leeren: Aufträge + alles daran löschen (Login, Passkeys, Push bleiben). Nur Test-Adressen (Server prüft). */
function TestPurge({ ctx }) {
  const { toast } = ctx;
  const [email, setEmail] = React.useState(() => { try { return localStorage.getItem("rr_test_purge_email") || "maximilian@hoelzl.investments"; } catch (e) { return "maximilian@hoelzl.investments"; } });
  const [st, setSt] = React.useState(null); // { orders, counts } nach Prüfen
  const [busy, setBusy] = React.useState(false);
  const total = (c) => Object.values(c || {}).reduce((x, v) => x + (Number(v) || 0), 0);
  const check = async () => {
    setBusy(true); setSt(null);
    try { const j = await testPurgeApi(email.trim(), false); setSt(j); try { localStorage.setItem("rr_test_purge_email", email.trim()); } catch (e) { /* */ } }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const run = async () => {
    setBusy(true);
    try { const j = await testPurgeApi(email.trim(), true); toast(`Test-Konto geleert · ${j.orders.length} Aufträge, ${total(j.counts)} Einträge`); setSt(null); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  return (
    <>
      <div className="sec3"><h2>Test-Konto leeren</h2></div>
      <p className="sh">Löscht alle Aufträge eines Test-Kontos inkl. Partner-Aufgaben, Verlauf, Mails, Zahlungs- und Mahndaten. Login, Passkeys und Push bleiben. Funktioniert nur für Test-Adressen.</p>
      <label className="pfld"><span>E-Mail des Test-Kontos</span><input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSt(null); }} /></label>
      {!st ? <button type="button" className="cta gh" disabled={busy || !email.includes("@")} onClick={check}>{busy ? "Prüfe …" : "Prüfen, was gelöscht wird"}</button> : (
        <>
          <div className="card" style={{ padding: 14, fontSize: 14, marginBottom: 12 }}>
            {st.orders.length ? <><b>{st.orders.length} Auftr{st.orders.length === 1 ? "ag" : "äge"}</b> ({st.orders.slice(0, 6).join(", ")}{st.orders.length > 6 ? " …" : ""}) · {total(st.counts)} Einträge insgesamt</> : <b>Nichts zu löschen – das Konto ist schon leer.</b>}
          </div>
          <div className="ctas2">
            <button type="button" className="cta gh" disabled={busy} onClick={() => setSt(null)}>Abbrechen</button>
            <button type="button" className="cta or" disabled={busy || !total(st.counts)} onClick={run}>{busy ? "Lösche …" : "Endgültig leeren"}</button>
          </div>
        </>
      )}
    </>
  );
}

/* Tests: Bestellungen und Prüfungen von Test-Adressen (Inhaber, helpdesk@, „+test") – zählen in keine Statistik
   und stehen nicht in Aufträgen / Geprüften Profilen. Hier bleiben sie zum Testen erreichbar. */
function TestsScreen({ ctx }) {
  const { orders, checks, setMoreSub, openOrder } = ctx;
  const to = (orders || []).filter((o) => o.test).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const tc = (checks || []).filter((c) => c.test).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const dt = (d) => (d ? new Date(d).toLocaleString("de-AT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Tests</div>
      <p className="sh">Bestellungen und Prüfungen von Test-Adressen (deine Adresse, helpdesk@, alle mit „+test“). Sie zählen in keine Statistik und erscheinen nicht unter Aufträge oder Geprüfte Profile.</p>
      <div className="sec3"><h2>Testbestellungen</h2><span className="px-cnt">{to.length}</span></div>
      {to.length ? (
        <div className="info">
          {to.slice(0, 100).map((o) => (
            <button key={o.id} type="button" className="ir" onClick={() => openOrder(o.id, true)}>
              <span className="t"><b>{o.company || o.profile || o.name || o.id}</b><span>{o.id} · {SERVICE_L[o.service] || o.service || "—"} · {o.email} · {dt(o.createdAt)}{o.status === "storniert" ? " · storniert" : ""}</span></span>
              <ChevronRight />
            </button>
          ))}
        </div>
      ) : <div className="aempty"><b>Keine Testbestellungen</b></div>}
      <div className="sec3"><h2>Test-Prüfungen</h2><span className="px-cnt">{tc.length}</span></div>
      {tc.length ? (
        <div className="info">
          {tc.slice(0, 100).map((c) => (
            <div key={c.id} className="ir">
              <span className="t"><b>{c.profile || c.name || c.id}</b><span>{c.email || "—"} · {dt(c.createdAt)}{c.orderId ? " · Auftrag " + c.orderId : ""}</span></span>
            </div>
          ))}
        </div>
      ) : <div className="aempty"><b>Keine Test-Prüfungen</b></div>}
    </>
  );
}

void money; void Check;
