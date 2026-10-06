"use client";
/* Neues Admin — Übersicht, Monitor, Konto (Einstellungen, Partner). Echte Daten. */
import React from "react";
import {
  RefreshCw, Euro, TrendingUp, TrendingDown, ChevronRight, Plus, ExternalLink, Mail, Image as ImageIcon, Maximize2, Store,
  ArrowLeft, Search, Handshake, Settings, Users, LogOut, Zap, Copy, StarOff, Check, Activity as ActIcon,
} from "lucide-react";
import { IMG, bucket, ageMin, fmtAge, orderMoney, money, ST } from "./model";
import { Avatar, KTag } from "./OrdersScreens";
import { ChecksScreen } from "./Checks";
import { GlobalActivityScreen } from "./Activity";
import { monitorShotUrl } from "@/lib/admin-api";

/* ---------------- Übersicht ---------------- */
export function Overview({ ctx }) {
  const { orders, checks, now, stripe, goOrders, openOrder, refresh, spin } = ctx;
  const b = orders.map((o) => bucket(o, now));
  const nNew = b.filter((x) => x === "new").length, nWork = b.filter((x) => x === "work").length;
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
      <div className="sec3"><h2>Pipeline heute</h2></div>
      <div className="card pipe">{pipe.map(([l, n, c]) => <div key={l} className="pr"><div className="t"><span>{l}</span><b>{n}</b></div><span className="bar"><i style={{ "--w": (n / pm) * 100 + "%", background: c }} /></span></div>)}</div>
      <div className="sec3"><h2>Neueste Aufträge</h2><button type="button" className="lk" onClick={() => goOrders(null)}>Alle<ChevronRight /></button></div>
      <div className="card ls">{recent.map((o) => { const bb = bucket(o, now); return (
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
  if (moreSub === "partner") return <PartnerScreen ctx={ctx} />;
  if (moreSub === "checked") return <ChecksScreen ctx={ctx} />;
  if (moreSub === "activity") return <GlobalActivityScreen ctx={ctx} />;
  const tiles = [
    [Search, "Geprüfte Profile", () => setMoreSub("checked")],
    [Handshake, "Partner", () => setMoreSub("partner")],
    [ActIcon, "Aktivitäten", () => setMoreSub("activity")],
    [Mail, "Vorlagen", () => { try { localStorage.setItem("rr_admin_view", "templates"); } catch (e) {} window.location.href = "/admin"; }],
    [Users, "Kunden", () => { try { localStorage.setItem("rr_admin_view", "customers"); } catch (e) {} window.location.href = "/admin"; }],
    [Settings, "Einstellungen", () => setMoreSub("settings")],
    [LogOut, "Abmelden", logout],
  ];
  return (
    <>
      <div className="ttl">Konto</div>
      <div className="mgrid">{tiles.map(([I, l, fn]) => <button key={l} type="button" className="mg" onClick={fn}><span className="ico"><I /></span>{l}</button>)}</div>
      <p className="sh" style={{ marginTop: 16 }}>Vorlagen und Kunden öffnen vorerst noch im bisherigen Admin.</p>
      <a className="cta gh" style={{ marginTop: 8 }} href="/admin">Zum bisherigen Admin</a>
    </>
  );
}

function SettingsScreen({ ctx }) {
  const { setMoreSub, auto, setAuto, partners } = ctx;
  const p = (partners && partners.partners || []).find((x) => x.active) || null;
  const pn = p ? p.name : "Partner";
  return (
    <>
      <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Einstellungen</div>
      <div className="sec3"><h2>Automatische Weiterleitung</h2></div>
      <p className="sh">Neue Aufträge gehen direkt an {pn}, ohne manuelle Prüfung.</p>
      <div className="info">
        {[["autoReviews", StarOff, "Bewertungen"], ["autoProfiles", Store, "Profile"]].map(([k, I, l]) => (
          <button key={k} type="button" className="ir" disabled={!auto} onClick={() => setAuto(k, !auto[k])}>
            <span className="ico"><I /></span><span className="t"><b>{l}</b><span>{!auto ? "…" : auto[k] ? "An " + pn : "Aus"}</span></span>
            <span className={"tg" + (auto && auto[k] ? " on" : "")}><i /></span>
          </button>
        ))}
      </div>
    </>
  );
}

function PartnerScreen({ ctx }) {
  const { setMoreSub, partners, auto, toast } = ctx;
  const list = (partners && partners.partners || []).filter((p) => p.active);
  const b = (partners && partners.board) || {};
  return (
    <>
      <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Partner</div>
      {!partners ? <div className="aempty"><b>Lädt …</b></div> : null}
      {list.map((p) => (
        <div key={p.id} className="apcard">
          <div className="ph1"><span className="pav"><Handshake /></span><div><b>{p.name}</b><span>{p.email || "keine E-Mail"}</span></div><span className="pst">Aktiv</span></div>
          <div className="pst3"><div><b>{b.open || 0}</b><span>In Arbeit</span></div><div><b>{b.removed || 0}</b><span>Gelöscht</span></div></div>
          <button type="button" className="ir ar" onClick={() => setMoreSub("settings")}><span className="ico"><Zap /></span><span className="t"><b>Auto-Weiterleitung</b><span>{auto ? [auto.autoReviews && "Bewertungen", auto.autoProfiles && "Profile"].filter(Boolean).join(" · ") || "Aus" : "…"}</span></span><ChevronRight /></button>
          <div className="ctas2">
            <a className="cta gh" href={p.email ? "mailto:" + p.email : undefined}><Mail />E-Mail</a>
            <button type="button" className="cta gh" onClick={() => { try { navigator.clipboard.writeText(p.email || ""); toast("E-Mail kopiert"); } catch (e) {} }}><Copy />Kopieren</button>
          </div>
        </div>
      ))}
      {partners && !list.length ? <div className="aempty"><b>Keine aktiven Partner</b></div> : null}
    </>
  );
}
void money; void Check;
