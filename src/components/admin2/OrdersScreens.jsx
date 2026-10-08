"use client";
/* Neues Admin — Aufträge (Liste), Auftrag (Detail) und Bewertungen. Echte Daten aus dem alten Admin-Backend. */
import React from "react";
import {
  Bell, Sparkles, ChevronRight, ChevronDown, Search, Users, UserX, ArrowLeft, MoreHorizontal, Hand, Send, Gavel, Check, Clock,
  AlarmClock, UserPlus, Mail, Store, MessageSquareText, MessageCircle, Phone, StarOff, Ban, Receipt,
  CheckCircle2, XCircle, CreditCard, Loader, MapPin, X, RotateCcw, Plus, Star, LayoutDashboard, Percent, RefreshCw, Layers, ShieldCheck, CalendarClock, ClipboardList, Image as ImageIcon, Download,
} from "lucide-react";
import { ST, inTile, IMG, typeOf, ageMin, fmtAge, isLate, orderMoney, avatarOf, staffOf, SERVICE_L, payPrefOf, computeOffer, money, cur, revState, bucketsOf, mainBucket, isOpenB, aboOf } from "./model";
import { SourceTag } from "./Source";
import { usePayMails, PayActions, PayRows, MailRow } from "./PayFlow";

const SCOPE_TILES = { open: ["new", "work", "nopm", "pay", "inkasso"], closed: ["deleted", "cancel"] };
import { ActivityRow } from "./Activity";
import { custImpersonate, verifyDoc, verifySet, reviewShotUrl } from "@/lib/admin-api";
const TILE_ICON = { new: Sparkles, work: Loader, nopm: CalendarClock, pay: CreditCard, inkasso: Gavel, deleted: CheckCircle2, cancel: XCircle };

export function Avatar({ o, big }) {
  const a = avatarOf(o); const s = staffOf(o.assignee);
  return (
    <span className={"av" + (big ? " big" : "")} style={{ background: a.color }}>
      {a.ini}{s && !big ? <img className="as" src={s.src} alt="" /> : null}
    </span>
  );
}

/** „Kundendashboard öffnen": Admin-Ansicht im neuen Tab (einmaliger Link, wird NICHT als Aktivität erfasst). */
async function openCustDash(o, toast) {
  let w = null;
  try { w = window.open("", "_blank"); } catch (e) { w = null; }
  try {
    const r = await custImpersonate(o.email, o.id);
    if (w && !w.closed) w.location.href = r.url; else window.open(r.url, "_blank");
    toast("Kundendashboard geöffnet · nicht getrackt");
  } catch (e) { if (w && !w.closed) w.close(); toast("Öffnen fehlgeschlagen: " + e.message); }
}

/** Kategorie-Tag vor dem Status: Bewertungen (grau, Stern) · Profil (orange, Laden). */
export function KTag({ o }) {
  const p = o.service !== "reviews";
  return <>{o.test ? <span className="ktag ktest" title="Testbestellung – zählt in keine Statistik">Test</span> : null}<span className={"ktag" + (p ? " kp" : "")}>{p ? <Store /> : <Star />}{p ? "Profil" : "Bewertungen"}</span></>;
}

/** Mehrere Kacheln („In Bearbeitung · Zahlung offen") als ein Label. */
export const bsLabel = (bs) => bs.map((x) => ST[x].l).join(" · ");
/** Laufzeit: bei offener Zahlung für Bewertungen seit der ersten unbezahlten Löschung. */
export function ageOf(o, b, r, now) {
  if (r && r.unpaidSince && (b === "pay" || b === "inkasso")) return Math.max(0, Math.round((now - r.unpaidSince) / 60000));
  return ageMin(o, b, now);
}

/* ---------------- Liste ---------------- */
export function OrdersList({ ctx }) {
  const { orders, now, f, setF, openOrder, openSheet, selId, loaded, refresh, ptasks } = ctx;
  const enriched = React.useMemo(() => orders.map((o) => {
    const pt = (ptasks || {})[o.id]; const r = revState(o, pt); const bs = bucketsOf(o, now, pt); const b = mainBucket(bs);
    return { o, r, bs, b, m: ageOf(o, b, r, now), t: typeOf(o) };
  }), [orders, now, ptasks]);
  const base = enriched.filter((x) => f.type === "all" || x.t === f.type).filter((x) => f.staff === "all" || (f.staff === "none" ? !x.o.assignee : x.o.assignee === f.staff));
  // Offen = steht in einer offenen Kachel (Neu/In Bearbeitung/Zahlung offen/Inkasso) – gleiche Regel für Kachel-Zahl und Liste.
  // Auch bereits bezahlte Aufträge, die noch auf „Neu"/„In Bearbeitung" stehen (Vorauszahlung oder Status nie umgestellt).
  const open = (x) => isOpenB(x.bs);
  const inScope = (x) => (f.scope === "open" ? open(x) : f.scope === "closed" ? !open(x) : true);
  const ql = f.q.trim().toLowerCase();
  const list = base.filter(inScope).filter((x) => !f.tile || inTile(f.tile, x.bs))
    .filter((x) => !ql || `${x.o.name} ${x.o.id} ${x.o.email} ${x.o.company} ${x.o.profile}`.toLowerCase().includes(ql))
    // Zahlung offen / Inkasso: zuletzt fällig gewordene zuerst (kürzeste Wartezeit oben); sonst neueste Bestellung zuerst.
    .sort((a, b) => (f.tile === "pay" || f.tile === "inkasso" ? a.m - b.m : (new Date(b.o.createdAt || 0) - new Date(a.o.createdAt || 0))));
  // Zähler ohne Testbestellungen (in der Liste bleiben sie sichtbar, mit „Test"-Tag).
  const real = enriched.filter((x) => !x.o.test);
  const newO = real.filter((x) => x.bs.includes("new"));
  const oldest = newO.reduce((mx, x) => Math.max(mx, x.m), 0);
  const openN = real.filter(open).length;
  const inWork = real.filter((x) => open(x) && !x.bs.includes("new")).length;
  const tiles = SCOPE_TILES[f.scope] || SCOPE_TILES.open;
  const tot = Math.max(1, base.filter((x) => !x.o.test && inScope(x)).length);
  const hr = new Date().getHours();
  const st = staffOf(f.staff);
  const [limit, setLimit] = React.useState(80);
  return (
    <>
      <div className="hd"><div><span>{hr < 11 ? "Guten Morgen" : hr < 18 ? "Hallo" : "Guten Abend"}</span><h1>Aufträge</h1></div>
        <div className="hda">
          <button type="button" className="rfb" aria-label="Aktualisieren" title="Aktualisieren" disabled={ctx.refreshing} onClick={refresh}><RefreshCw className={ctx.refreshing ? "spin" : ""} /><span>{ctx.refreshing ? "Lädt …" : "Aktualisieren"}</span></button>
          <button type="button" className="circ" aria-label="Neue Aufträge" onClick={() => setF({ scope: "open", tile: "new" })}><Bell />{newO.length ? <span className="dot" /> : null}</button>
        </div></div>
      <button type="button" className={"hcard" + (f.tile === "new" ? " on" : "")} onClick={() => setF({ scope: "open", tile: f.tile === "new" ? null : "new" })}>
        <span className="hpill" role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); ctx.newOrder(); }} onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); ctx.newOrder(); } }}><Plus />Neuer Auftrag<ChevronRight /></span>
        <b>{loaded ? newO.length : "–"}</b>
        <span className="ahs">{newO.length ? "Ältester wartet seit " + fmtAge(oldest) : "Alles abgearbeitet"}</span>
        <img className="himg" src={IMG("hero")} alt="" />
        <span className="hbar"><span className="t"><span>{inWork} von {openN} offenen übernommen</span><span>{openN ? Math.round((inWork / openN) * 100) : 0}%</span></span><span className="bar"><i style={{ "--w": (openN ? (inWork / openN) * 100 : 0) + "%" }} /></span></span>
      </button>
      <div className="sec3 stat-h"><h2>Status</h2><button type="button" className="lk" onClick={() => openSheet({ kind: "scope" })}>{{ open: "Offen", closed: "Abgeschlossen", all: "Alle" }[f.scope]}<ChevronDown /></button></div>
      <div className="gcards">
        {tiles.map((k) => {
          const n = base.filter((x) => !x.o.test && inTile(k, x.bs)).length; const I = TILE_ICON[k];
          return (
            <button key={k} type="button" className={"gc" + (f.tile === k ? " on" : "")} onClick={() => setF({ tile: f.tile === k ? null : k })}>
              <span className="gi">{ST[k].img ? <img src={IMG(ST[k].img)} alt="" /> : <I />}</span>
              <b>{ST[k].l}</b><span className="gn">{n} Aufträge</span>
              <span className="bar sm"><i style={{ "--w": (n / tot) * 100 + "%" }} /></span>
            </button>
          );
        })}
      </div>
      <div className="usrch"><Search /><input type="search" placeholder="Suchen" value={f.q} onChange={(e) => setF({ q: e.target.value })} />
        <button type="button" className="bt" onClick={() => openSheet({ kind: "staff" })}>{st ? <><img src={st.src} alt="" />{st.name}</> : f.staff === "none" ? <><UserX />Ohne</> : <><Users />Betreuer</>}</button></div>
      <div className="sec3"><h2>{f.tile ? ST[f.tile].l : "Alle Aufträge"}</h2>
        <div className="seg2">{[["all", "Alle"], ["reviews", "Bewertungen"], ["profile", "Profile"]].map(([k, l]) => <button key={k} type="button" className={f.type === k ? "on" : ""} onClick={() => setF({ type: k })}>{l}</button>)}</div></div>
      <div className="card ls">
        {list.slice(0, limit).map(({ o, r, bs, b, m }, j) => {
          // In „Zahlung offen"/„Inkasso" zählt, was jetzt fällig ist – nicht der ganze Bestellwert.
          const dueView = r && r.unpaidN && (f.tile === "pay" || f.tile === "inkasso");
          return (
          <button key={o.id} type="button" className={"ord" + (selId === o.id ? " sel" : "") + (ctx.leaving && ctx.leaving[o.id] ? " paidout" : "")} style={{ "--pi": Math.min(j, 10) }} onClick={() => openOrder(o.id)}>
            <Avatar o={o} />
            <span className="t"><span className="l1"><b>{o.name || o.company || o.email || o.id}</b><span className="p">{dueView ? <>{money(r.unpaidAmt, cur(o))}<small className="pof"> offen</small></> : orderMoney(o)}</span></span>
              <span className="l2"><KTag o={o} />{o.pay === "paid" && (b === "new" || b === "work") ? <span className="ktag kpaid" title="Bereits bezahlt – Status prüfen">Bezahlt</span> : null}{payPrefOf(o) ? <span className="ktag kd" title={"Will per " + payPrefOf(o) + " zahlen"}>−10 %</span> : null}{aboOf(o) ? <span className="ktag kabo" title={aboOf(o).label + (aboOf(o).price ? " · " + aboOf(o).price : "")}><ShieldCheck />{aboOf(o).short}</span> : null}{bs.map((x) => <span key={x} className={"dt d-" + x} />)}{bsLabel(bs)} · <span className={isLate(b, m) ? "late" : ""}>{fmtAge(m)}</span>
                {r ? <> · <b className="rvp">{r.removed}/{r.total} gelöscht</b>{r.unpaidN && !dueView ? <> · <b className="rvo">{money(r.unpaidAmt, cur(o))} offen</b></> : null}</> : o.service === "reviews" ? <> · {(o.reviewItems || []).length} Bew.</> : null}</span></span>
          </button>
          );
        })}
        {list.length > limit ? <button type="button" className="more-b" onClick={() => setLimit((x) => x + 100)}>Weitere {list.length - limit} anzeigen</button> : null}
        {loaded && !list.length ? <div className="aempty"><b>Alles erledigt</b>Keine Aufträge hier.</div> : null}
        {!loaded ? <div className="aempty"><b>Lädt …</b></div> : null}
      </div>
    </>
  );
}

/* ---------------- Auftrag ---------------- */
export function OrderDetail({ ctx, id }) {
  const { orders, now, back, openSheet, act, pushReviews, ptasks, tplCount, isDesk } = ctx;
  const o = orders.find((x) => x.id === id);
  if (!o) return <><Nav back={back} isDesk={isDesk} /><div className="aempty"><b>Nicht gefunden</b>Dieser Auftrag ist nicht (mehr) in der Liste.</div></>;
  const pt = ptasks[o.id] || [];
  const r = revState(o, pt);
  const bs = bucketsOf(o, now, pt), b = mainBucket(bs), m = ageOf(o, b, r, now), late = isLate(b, m);
  const s = staffOf(o.assignee);
  const isRev = o.service === "reviews";
  const items = o.reviewItems || [];
  const removedN = pt.filter((t) => t.status === "removed").length;
  const accN = o.reviewsAccepted ? o.reviewsAccepted.length : items.length;
  const f = o.form || {};
  // Weitere offene Zahlungen desselben Kunden (gleiche E-Mail) – gleiche Methode = Sammelzahlung möglich.
  const em = String(o.email || "").toLowerCase();
  const sibs = em ? orders.filter((x) => x.id !== o.id && String(x.email || "").toLowerCase() === em && x.status !== "storniert" && payOpen(x, now, ptasks)) : [];
  const same = sibs.filter((x) => (payPrefOf(x) || "") === (payPrefOf(o) || ""));
  const stepIx = b === "new" ? 0 : b === "work" ? 2 : b === "pay" || b === "inkasso" ? 3 : b === "deleted" ? 4 : -1;
  const altHref = `/admin/alt?order=${encodeURIComponent(o.id)}`;
  const doneBtn = (lbl) => <button type="button" className="cta ok" onClick={() => { act.done(o); back(); }}><CheckCircle2 />{lbl}</button>;
  const primary =
    // Schon bezahlt, Status aber noch Neu/In Bearbeitung → einfach abschließen (kein Zahlungslink, keine Mahnung).
    o.pay === "paid" && (b === "new" || b === "work") ? doneBtn("Als erledigt markieren · bereits bezahlt")
    // Gelöscht, aber noch nicht abgerechnet → zuerst Löschbestätigung + Rechnung (sonst würde die Mahnung alle Bewertungen anmahnen).
    // Zahlung offen / Inkasso → eigener Block (PayActions: eskalierender Hauptbutton + „Zahlung bereits erhalten?").
    : payOpen(o, now, ptasks) && (b === "pay" || b === "inkasso") ? null
    // Partner arbeitet schon, wir haben aber noch nicht übernommen → Übernehmen bleibt sichtbar.
    : r && b === "work" ? (o.status === "new" ? <button type="button" className="cta or" onClick={() => act.start(o)}><Hand />Übernehmen · Partner arbeitet schon</button> : null)
    : b === "new" ? <button type="button" className="cta or" onClick={() => act.start(o)}><Hand />{o.assignee ? "Bearbeitung starten" : "Übernehmen & starten"}</button>
    : b === "pay" || b === "inkasso" ? <button type="button" className={"cta" + (b === "inkasso" ? " red" : "")} onClick={() => act.remind(o)}>{b === "inkasso" ? <Gavel /> : <Send />}Mahnung senden{o.mahnungCount ? ` · ${o.mahnungCount} bisher` : ""}</button>
    // Profil gelöscht → Zahlungslink senden (Link vorher ansehen/ändern); „ohne Link erledigt" steckt im Sheet.
    : b === "work" && !isRev ? <button type="button" className="cta or" onClick={() => openSheet({ kind: "paylink", forId: o.id })}><CreditCard />Zahlungslink senden</button>
    // Bewertungen ohne Partner-Aufgaben (manuell bearbeitet) → wie früher abschließen.
    : b === "work" ? doneBtn("Als erledigt markieren")
    : b === "cancel" ? <button type="button" className="cta" onClick={() => act.reactivate(o)}><RotateCcw />Auftrag reaktivieren</button>
    : null;
  return (
    <>
      <Nav back={back} isDesk={isDesk} right={<a className="circ" href={`/admin/alt?order=${encodeURIComponent(o.id)}`} aria-label="Im alten Admin öffnen" title="Im alten Admin öffnen"><MoreHorizontal /></a>} />
      <div className="dh"><Avatar o={o} big /><div><h1>{o.name || o.company || o.email}</h1><p>{o.id} · {SERVICE_L[o.service] || o.service}</p></div></div>
      <div className="amt"><div className="k">Bestellwert</div><div className="v">{orderMoney(o)}</div>
        {aboOf(o) ? <div className={"abo" + (aboOf(o).recurring ? "" : " lt")}><ShieldCheck /><b>{aboOf(o).label}</b>{aboOf(o).price ? <span>+ {aboOf(o).price}</span> : null}</div> : null}
        <div className="r">{bs.map((x) => <span key={x} className="st"><span className={"dt d-" + x} />{ST[x].l}</span>)}<span className={"tm" + (late ? " late" : "")}>{late ? <AlarmClock /> : <Clock />}seit {fmtAge(m)}</span></div>
        {r ? (
          <div className="rvst">
            <span><b>{r.removed}/{r.total}</b> gelöscht</span>
            {r.open ? <span><b>{r.open}</b> beim Partner{r.working !== r.open ? ` (${r.working} in Arbeit)` : ""}</span> : null}
            {r.software ? <span><b>{r.software}</b> Software · wartet auf Kunde</span> : null}
            {o.payHold ? <span className="due"><b>Pausiert</b> · Zwischenzahlung offen</span> : null}
            {r.notPossible ? <span><b>{r.notPossible}</b> nicht möglich</span> : null}
            {r.unpaidN ? <span className="due"><b>{money(r.unpaidAmt, cur(o))}</b> offen · {r.unpaidN} Bew.{r.unbilledN ? ` · ${r.unbilledN} noch nicht abgerechnet` : ""}</span> : null}
          </div>
        ) : null}</div>
      {payPrefOf(o) && o.status !== "storniert" ? (
        <div className="disc">
          <span className="di"><Percent /></span>
          <span className="t"><b>Kunde möchte per {payPrefOf(o)} zahlen → 10 % Rabatt gewähren</b>
            <span>{isRev ? "Gilt auf die gelöschten Bewertungen" : <>Statt {computeOffer(o).regular} nur <b>{computeOffer(o).paypal}</b> · spart {computeOffer(o).savings}</>}{o.paypal && o.paypal !== "ja" ? <> · PayPal: {o.paypal}</> : null}</span>
            {isRev || (o.lang || "de") !== "de" ? <span>Mahnungen gehen deshalb als {payPrefOf(o)}-Text ohne Stripe-Link raus.</span> : null}</span>
        </div>
      ) : null}
      {isRev && o.verify && o.status !== "storniert" ? <VerifyBox o={o} ctx={ctx} /> : null}
      {o.pgStale && o.status !== "storniert" ? (
        <div className="disc due">
          <span className="di"><CalendarClock /></span>
          <span className="t"><b>Zahlungsdaten fehlen · Storno am {new Date(o.pgStale.cancelAt).toLocaleDateString("de-AT")}</b>
            <span>Alle Erinnerungen sind raus, der Kunde hat die finale Mail. Hinterlegt er bis dahin keine Zahlungsart, wird {o.pgStale.keys ? "die Nachbestellung" : "der Auftrag"} automatisch storniert (Storno-Mail, keine Kosten).</span></span>
        </div>
      ) : null}
      {o.payGate && o.status !== "storniert" ? (
        <div className="disc">
          <span className="di"><CreditCard /></span>
          <span className="t"><b>Wartet auf Zahlungsart des Kunden</b>
            <span>{o.payGate.keys ? `${o.payGate.keys.length} ${o.payGate.keys.length === 1 ? "nachbestellte Bewertung startet" : "nachbestellte Bewertungen starten"} erst, wenn der Kunde im Dashboard eine Zahlungsart hinterlegt hat. Die übrigen laufen weiter.` : "Der Auftrag startet, sobald der Kunde im Dashboard eine Zahlungsart hinterlegt hat."}</span></span>
        </div>
      ) : null}
      {primary ? <div className="ctas" style={{ margin: "4px 0 14px" }}>{primary}</div> : null}
      {payOpen(o, now, ptasks) && sibs.length ? (
        <div className="disc sib">
          <span className="di"><Layers /></span>
          <span className="t"><b>Kunde hat noch {sibs.length} weitere offene Zahlung{sibs.length > 1 ? "en" : ""}</b>
            {sibs.map((x) => <span key={x.id}>#{x.id} · {payPrefOf(x) || "Karte (Stripe)"}{(payPrefOf(x) || "") === (payPrefOf(o) || "") ? " · gleiche Methode" : ""}</span>)}
            <span>{same.length ? <>Im Kunden-Dashboard sieht er {payPrefOf(o) ? `alle ${payPrefOf(o)}-Aufträge` : "alle Karten-Aufträge"} als eine Summe. Kommt eine Sammelzahlung, unten alle zusammen auf bezahlt setzen – er bekommt dann <b>eine</b> Bestätigung.</> : "Andere Methode – wird separat bezahlt."}</span></span>
        </div>
      ) : null}
      {payOpen(o, now, ptasks) ? <PayBlock o={o} ctx={ctx} r={r} group={same} altHref={altHref} /> : null}
      <div className="info">
        <button type="button" className="ir" onClick={() => openSheet({ kind: "staff", forId: o.id })}>
          {s ? <img src={s.src} alt="" /> : <span className="ico"><UserPlus /></span>}
          <span className="t"><span>Betreuer</span><b>{s ? s.name : "Nicht zugewiesen"}</b></span><ChevronRight /></button>
        <button type="button" className="ir" onClick={() => ctx.pushSub("info", o.id)}>
          <span className="ico"><ClipboardList /></span>
          <span className="t"><span>Bestellinfo</span><b>{[o.email, isRev ? `${items.length} Bewertungen` : (o.profile || o.company), o.source && o.source.label].filter(Boolean).join(" · ") || "—"}</b></span>
          <ChevronRight /></button>
        {payOpen(o, now, ptasks) ? <PayInfoRows o={o} ctx={ctx} /> : null}
        <MailRow o={o} ctx={ctx} payOpen={payOpen(o, now, ptasks)} />
      </div>
      <div className="cact">
        <a href={o.email ? `mailto:${o.email}` : undefined}><span><Mail /></span>E-Mail</a>
        <a href={o.phone ? `sms:${o.phone.replace(/\s+/g, "")}` : undefined} aria-disabled={!o.phone}><span><MessageCircle /></span>SMS</a>
        <a href={o.phone ? `tel:${o.phone.replace(/\s+/g, "")}` : undefined} aria-disabled={!o.phone}><span><Phone /></span>Anrufen</a>
        <button type="button" className="dsh" disabled={!o.email} onClick={() => openCustDash(o, ctx.toast)}><span><LayoutDashboard /></span>Dashboard</button>
      </div>
      <div className="bigs">
        <button type="button" className="big" onClick={() => openSheet({ kind: "tpl", forId: o.id })}><span className="bi"><img src={IMG("tpl")} alt="" /></span><b>Vorlage senden</b><span>{tplCount ? tplCount + " Vorlagen" : "5 beliebte"}</span></button>
        <button type="button" className="big" onClick={() => openSheet({ kind: "fb", forId: o.id })}><span className="bi"><img src={IMG("fb")} alt="" /></span><b>Fragebogen</b><span>{f.filledAt ? "Ausgefüllt" : "Offen"}</span></button>
        <button type="button" className="big" onClick={() => pushReviews(o.id)}><span className="bi"><img src={IMG("rev")} alt="" /></span><b>{isRev ? "Bewertungen" : "Screenshots"}</b><span>{isRev ? `${items.length} · ${removedN} gelöscht` : "Profil"}</span></button>
      </div>
      {isRev ? (
        <div className="info"><button type="button" className="ir" onClick={() => pushReviews(o.id)}><span className="ico"><StarOff /></span><span className="t"><span>Bewertungen</span><b>{items.length} eingereicht · {accN} angenommen · {removedN} gelöscht</b></span><ChevronRight /></button>
          {o.status !== "storniert" ? <button type="button" className="ir" onClick={() => ctx.pushSub("addrev", o.id)}><span className="ico"><Plus /></span><span className="t"><span>Nachbestellung</span><b>Bewertung hinzufügen</b></span><ChevronRight /></button> : null}</div>
      ) : null}
      <ActivityRow o={o} onOpen={() => ctx.pushAct(o.id)} />
      {stepIx >= 0 ? (
        <>
          <div className="lbl">Fortschritt</div>
          <div className="asteps">
            {[["new", "Bestellung eingegangen"], ["work", "Löschung läuft"], ["del", r ? `Gelöscht · ${r.removed}/${r.total}` : "Gelöscht"], ["pay", b === "inkasso" ? "Zahlung (Inkasso)" : "Bezahlt"]].map(([k, lb], i) => {
              // Unser Ablauf: erst löschen, dann bezahlen → Zahlung offen/Inkasso = Schritt 4 aktiv.
              // Bewertungen: solange beim Partner noch etwas läuft, steht der Auftrag bei „Löschung läuft".
              const rank = b === "new" ? 0 : b === "work" || bs.includes("work") ? 1 : b === "pay" || b === "inkasso" ? 3 : 4;
              const done = i < rank, curS = i === rank;
              return <div key={k} className={"stp" + (done ? " done" : curS ? " cur" : "")}><i>{done ? <Check /> : null}</i><b>{lb}</b>{curS ? <span>seit {fmtAge(m)}</span> : null}</div>;
            })}
          </div>
        </>
      ) : <div className="cxl"><Ban /><span><b>Storniert</b>Der Kunde zahlt nichts. Offene Partner-Aufgaben wurden zurückgezogen.</span></div>}
      {o.status !== "storniert" ? <button type="button" className="dz" onClick={() => act.storno(o)}><Ban />Auftrag stornieren</button> : null}
      <div style={{ height: 8 }} />
    </>
  );
}

/** Inhaber-Nachweis (Bewertung mit 4–5 Sternen beauftragt): Status, Dokument ansehen, selbst freigeben/ablehnen.
 *  Freigabe → Auftrag geht aufs Partner-Board (normaler Ablauf). */
function VerifyBox({ o, ctx }) {
  const v = o.verify || {};
  const [busy, setBusy] = React.useState("");
  const [st, setSt] = React.useState(v.status);
  React.useEffect(() => setSt(v.status), [v.status]);
  const ok = st === "ok";
  const L = { pending: v.doc ? "Hochgeladen · KI nicht erreichbar – bitte selbst prüfen" : "Wartet auf Upload des Kunden", checking: "KI prüft gerade …", rejected: "Von " + (v.by === "admin" ? "uns" : "der KI") + " abgelehnt", ok: "Freigegeben" + (v.by === "admin" ? " (Admin)" : " (KI)") };
  const show = async () => {
    setBusy("doc");
    const w = window.open("", "_blank");
    try {
      const r = await verifyDoc(o.id);
      const bin = atob(r.data); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([u8], { type: r.mime }));
      if (w && !w.closed) w.location.href = url; else window.open(url, "_blank");
      if (r.result && ctx.toast) ctx.toast(`KI: ${r.result.approve ? "passt" : "passt nicht"} · ${Math.round((r.result.confidence || 0) * 100)} % · ${r.result.doc_type || ""}`);
    } catch (e) { if (w && !w.closed) w.close(); if (ctx.toast) ctx.toast(e.message || "Kein Dokument"); }
    setBusy("");
  };
  const set = async (action) => {
    let reason = "";
    if (action === "reject") { reason = window.prompt("Grund für den Kunden (wird im Dashboard angezeigt):", "") || ""; if (!reason.trim()) return; }
    setBusy(action);
    try { const r = await verifySet(o.id, action, reason); setSt(r.status); if (ctx.toast) ctx.toast(action === "approve" ? "Freigegeben – Auftrag ist auf dem Partner-Board" : "Abgelehnt"); if (ctx.refresh) ctx.refresh(); if (ctx.loadPtasks) ctx.loadPtasks(); }
    catch (e) { if (ctx.toast) ctx.toast(e.message || "Fehler"); }
    setBusy("");
  };
  return (
    <div className={"disc vfy" + (ok ? " ok" : "")}>
      <span className="di"><ShieldCheck /></span>
      <span className="t"><b>Inhaber-Nachweis · {L[st] || st}</b>
        {v.reason ? <span>{v.reason}</span> : null}
        {!ok ? <span>Bewertung mit 4–5 Sternen beauftragt → Auftrag startet erst nach dem Nachweis.</span> : null}
        <span className="vfy-b">
          {v.doc ? <button type="button" disabled={!!busy} onClick={show}>{busy === "doc" ? "Lädt …" : "Dokument ansehen"}</button> : null}
          {!ok ? <button type="button" className="go" disabled={!!busy} onClick={() => set("approve")}>{busy === "approve" ? "…" : "Freigeben"}</button> : null}
          {!ok ? <button type="button" disabled={!!busy} onClick={() => set("reject")}>{busy === "reject" ? "…" : "Ablehnen"}</button> : null}
        </span>
      </span>
    </div>
  );
}

/** „Als bezahlt markieren" (z. B. Wise/PayPal/Überweisung): 2× tippen zur Bestätigung. Bewertungen → im Kunden-Dashboard „Bezahlt". */
const payOpen = (x, now, ptasks) => {
  if (x.status === "storniert") return false; // ganz storniert → keine offene Zahlung mehr
  const r = revState(x, (ptasks || {})[x.id]);
  if (r) return r.unpaidN > 0; // Bewertungen: offen, sobald eine gelöschte Bewertung unbezahlt ist
  const bx = bucketsOf(x, now); return bx.includes("pay") || bx.includes("inkasso") || (x.status === "done" && x.pay !== "paid");
};
export const isPayOpen = payOpen;

/** Sheet „Bestellinfo": Kontakt, Quelle, Leistung, Adresse, Screenshots – damit der Auftrag oben kompakt bleibt. */
export function OrderInfoScreen({ ctx, id }) {
  const o = ctx.orders.find((x) => x.id === id);
  React.useEffect(() => { if (o && ctx.loadShots) ctx.loadShots(o.id); }, [o && o.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return null;
  const sh = ctx.shots && ctx.shots[o.id] && ctx.shots[o.id].shots ? ctx.shots[o.id].shots.find((x) => x.idx === -1 && x.status === "ok") : null;
  const close = () => {};
  const isRev = o.service === "reviews";
  const items = o.reviewItems || [];
  const created = o.createdAt ? new Date(o.createdAt).toLocaleString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
  const copy = (v, l) => { try { navigator.clipboard.writeText(v); ctx.toast(l + " kopiert"); } catch (e) { /* */ } };
  return (
    <>
      <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={ctx.back}><ArrowLeft /></button></div>
      <div className="dh"><div><h1>Bestellinfo</h1><p>{o.id}{created ? " · bestellt " + created : ""}</p></div></div>
      <div className="info">
        <button type="button" className="ir" onClick={() => o.email && copy(o.email, "E-Mail")}><span className="ico"><Mail /></span><span className="t"><span>E-Mail · tippen zum Kopieren</span><b>{o.email || "—"}</b></span></button>
        {o.phone ? <button type="button" className="ir" onClick={() => copy(o.phone, "Telefon")}><span className="ico"><Phone /></span><span className="t"><span>Telefon · tippen zum Kopieren</span><b>{o.phone}</b></span></button> : null}
        <SourceTag o={o} />
        <div className="ir"><span className="ico">{isRev ? <MessageSquareText /> : <Store />}</span><span className="t"><span>{isRev ? "Leistung" : "Profil"}</span><b>{isRev ? `${SERVICE_L.reviews} · ${items.length} Bewertungen` : (o.profile || o.company || "—")}</b></span></div>
        {o.addr || o.mapsUri ? <a className="ir" href={o.mapsUri || `https://www.google.com/maps/search/${encodeURIComponent((o.profile || "") + " " + o.addr)}`} target="_blank" rel="noopener noreferrer"><span className="ico"><MapPin /></span><span className="t"><span>Adresse</span><b>{o.addr || "In Google Maps öffnen"}</b></span><ChevronRight /></a> : null}
        {isRev ? <button type="button" className="ir" onClick={() => { close(); ctx.pushReviews(o.id); }}><span className="ico"><StarOff /></span><span className="t"><span>Bewertungen & Screenshots</span><b>{items.length} eingereicht</b></span><ChevronRight /></button> : (
          <>
            <button type="button" className="ir" onClick={() => (sh ? ctx.openViewer({ src: reviewShotUrl(sh.id), dl: reviewShotUrl(sh.id, true), title: o.profile || o.company || "Profil", sub: "Screenshot" }) : ctx.toast("Noch kein Screenshot vorhanden"))}>
              <span className="ico"><ImageIcon /></span><span className="t"><span>Screenshot</span><b>{sh ? "Screenshot ansehen" : "Noch kein Screenshot"}</b></span><ChevronRight /></button>
            {sh ? <a className="ir" href={reviewShotUrl(sh.id, true)}><span className="ico"><Download /></span><span className="t"><span>Screenshot</span><b>Herunterladen</b></span><ChevronRight /></a> : null}
          </>
        )}
      </div>
    </>
  );
}

/** „Zahlung offen": Hauptaktion (eskaliert) + „Zahlung bereits erhalten?" – Design Okt 2026. */
function PayBlock({ o, ctx, r, group, altHref }) {
  const pm = usePayMails(o);
  return <PayActions o={o} ctx={ctx} r={r} pm={pm} group={group} altHref={altHref} />;
}
function PayInfoRows({ o, ctx }) {
  const pm = usePayMails(o);
  return <PayRows o={o} ctx={ctx} pm={pm} />;
}

export function Nav({ back, right, isDesk }) {
  return <div className="anav"><button type="button" className="circ" aria-label={isDesk ? "Schließen" : "Zurück"} onClick={back}>{isDesk ? <X /> : <ArrowLeft />}</button>{right || null}</div>;
}

/* ---------------- Bewertungen / Screenshots ---------------- */
const PS = {
  new: ["Beim Partner · noch nicht gestartet", "var(--g3)"], working: ["Partner arbeitet", "var(--orange-800)"], removed: ["Gelöscht", "var(--success)"],
  not_possible: ["Partner: nicht möglich", "var(--danger)"], software: ["Software · wartet auf Kunde", "var(--info)"], cancelled: ["Storniert", "var(--g3)"],
};
const keyOf = (it) => it.url || ((it.name || "") + "|" + (it.text || ""));
/** Sterne einer Bewertung (aus der Bestellung bzw. der Partner-Aufgabe). */
export const rvStars = (it, t) => { const n = Math.round(Number((it && it.rating) || (t && t.rating)) || 0); return n >= 1 && n <= 5 ? n : 0; };
export function RStars({ n }) {
  if (!n) return null;
  return <span className={"rstars s" + n} aria-label={n + " Sterne"}>{"★".repeat(n)}<s>{"★".repeat(5 - n)}</s></span>;
}

export function ReviewsScreen({ ctx, id }) {
  const { orders, back, ptasks, shots, loadShots, openSheet, isDesk } = ctx;
  const o = orders.find((x) => x.id === id);
  const [rf, setRf] = React.useState("all");
  React.useEffect(() => { if (o) loadShots(o.id); }, [o && o.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return <Nav back={back} isDesk={isDesk} />;
  const items = o.reviewItems || [];
  const acc = o.reviewsAccepted ? new Set(o.reviewsAccepted.map(keyOf)) : null;
  const ptBy = Object.fromEntries((ptasks[o.id] || []).map((t) => [t.itemKey, t]));
  const sh = shots[o.id] || null;
  const profShot = sh && sh.shots ? sh.shots.find((s) => s.idx === -1 && s.status === "ok") : null;
  const rows = items.map((it, i) => {
    const k = keyOf(it); const t = ptBy[k];
    const dec = acc ? (acc.has(k) ? (it.old ? "old" : "ok") : "notext") : null;
    return { it, i, k, t, dec };
  });
  const F2 = { all: () => true, open: (r) => !r.dec, acc: (r) => r.dec === "ok" || r.dec === "old", rej: (r) => r.dec === "notext" };
  const accN = rows.filter(F2.acc).length;
  const working = rows.filter((r) => r.t && r.t.status === "working").length;
  const removed = rows.filter((r) => r.t && r.t.status === "removed").length;
  const isRev = o.service === "reviews";
  return (
    <>
      <Nav back={back} isDesk={false} right={sh && sh.shots && sh.shots.length ? <span className="pos">{sh.shots.length} Screenshots</span> : null} />
      <div className="dh"><div><h1>{isRev ? "Bewertungen" : "Screenshots"}</h1><p>{o.id} · {o.name}</p></div></div>
      {isRev ? (
        <>
          <div className="rsum"><div><b>{acc ? accN : items.length}</b><span>{acc ? "Angenommen" : "Eingereicht"}</span></div><div><b>{working}</b><span>In Arbeit</span></div><div><b>{removed}</b><span>Gelöscht</span></div></div>
          {acc ? <div className="achips">{[["all", "Alle"], ["open", "Offen"], ["acc", "Angenommen"], ["rej", "Abgelehnt"]].map(([k, l]) => <button key={k} type="button" className={"achip" + (rf === k ? " on" : "")} onClick={() => setRf(k)}>{l}<span className="n">{rows.filter(F2[k]).length}</span></button>)}</div> : null}
        </>
      ) : null}
      <div className="card ls">
        <button type="button" className="rvr" onClick={() => openSheet({ kind: "rv", forId: o.id, idx: -1 })}><span className="th"><Store /></span><span className="t"><b>Profil</b><span style={{ color: "var(--g3)" }}>{profShot ? "Screenshot vorhanden" : o.profile || o.company || "Google-Profil"}</span></span><ChevronRight /></button>
        {rows.filter(F2[rf]).map((r) => {
          const ps = r.t ? PS[r.t.status] || PS.new : ["Nicht beim Partner", "var(--g3)"];
          return (
            <button key={r.i} type="button" className={"rvr" + (r.dec === "notext" ? " off" : "")} onClick={() => openSheet({ kind: "rv", forId: o.id, idx: r.i })}>
              <span className="th">{r.dec === "notext" ? <Ban /> : r.dec ? <Check /> : <MessageSquareText />}</span>
              <span className="t"><b>{r.t ? r.t.code + " · " : "#" + (r.i + 1) + " · "}{r.it.name || (r.it.url ? "Bewertung" : "—")} <RStars n={rvStars(r.it, r.t)} /></b><span style={{ color: ps[1] }}>{ps[0]}{Number(r.it.cp) > 0 ? ` · ${money(Number(r.it.cp), cur(o))}` : ""}</span></span>
              {r.dec ? <span className="ac" style={{ color: r.dec === "ok" ? "var(--success)" : r.dec === "old" ? "var(--orange-800)" : "var(--g3)" }}>{r.dec === "ok" ? "Angenommen" : r.dec === "old" ? "Älter 4 Wo." : "Abgelehnt"}</span> : null}
              <ChevronRight />
            </button>
          );
        })}
        {isRev && !items.length ? <div className="aempty"><b>Keine Bewertungen</b>Am Auftrag ist nichts gespeichert.</div> : null}
      </div>
      {isRev && removed ? <div className="stick"><a className="cta or" href={`/admin/alt?order=${encodeURIComponent(o.id)}`}><Receipt />Rechnung senden · {removed} gelöscht</a></div> : null}
    </>
  );
}
export { keyOf };
