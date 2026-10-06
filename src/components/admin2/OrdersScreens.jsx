"use client";
/* Neues Admin — Aufträge (Liste), Auftrag (Detail) und Bewertungen. Echte Daten aus dem alten Admin-Backend. */
import React from "react";
import {
  Bell, Sparkles, ChevronRight, ChevronDown, Search, Users, UserX, ArrowLeft, MoreHorizontal, Hand, Send, Gavel, Check, Clock,
  AlarmClock, UserPlus, Mail, Store, MessageSquareText, MessageCircle, Phone, StarOff, Ban, Receipt,
  CheckCircle2, XCircle, CreditCard, Loader, MapPin, X, RotateCcw, Plus, Star, LayoutDashboard, Percent, RefreshCw,
} from "lucide-react";
import { ST, isOffen, inTile, IMG, bucket, typeOf, ageMin, fmtAge, isLate, orderMoney, avatarOf, staffOf, SERVICE_L, payPrefOf, computeOffer } from "./model";

const SCOPE_TILES = { open: ["new", "work", "pay", "inkasso"], closed: ["deleted", "cancel"] };
import { ActivityRow } from "./Activity";
import { custImpersonate } from "@/lib/admin-api";
const TILE_ICON = { new: Sparkles, work: Loader, pay: CreditCard, inkasso: Gavel, deleted: CheckCircle2, cancel: XCircle };

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
  return <span className={"ktag" + (p ? " kp" : "")}>{p ? <Store /> : <Star />}{p ? "Profil" : "Bewertungen"}</span>;
}

/* ---------------- Liste ---------------- */
export function OrdersList({ ctx }) {
  const { orders, now, f, setF, openOrder, openSheet, selId, loaded, refresh } = ctx;
  const enriched = React.useMemo(() => orders.map((o) => { const b = bucket(o, now); return { o, b, m: ageMin(o, b, now), t: typeOf(o) }; }), [orders, now]);
  const base = enriched.filter((x) => f.type === "all" || x.t === f.type).filter((x) => f.staff === "all" || (f.staff === "none" ? !x.o.assignee : x.o.assignee === f.staff));
  const inScope = (x) => (f.scope === "open" ? isOffen(x.o) : f.scope === "closed" ? !isOffen(x.o) : true);
  const ql = f.q.trim().toLowerCase();
  const list = base.filter(inScope).filter((x) => !f.tile || inTile(f.tile, x.b))
    .filter((x) => !ql || `${x.o.name} ${x.o.id} ${x.o.email} ${x.o.company} ${x.o.profile}`.toLowerCase().includes(ql))
    .sort((a, b) => (new Date(b.o.createdAt || 0) - new Date(a.o.createdAt || 0))); // neueste zuerst (wie im bisherigen Admin)
  const newO = enriched.filter((x) => x.b === "new");
  const oldest = newO.reduce((mx, x) => Math.max(mx, x.m), 0);
  const openN = enriched.filter((x) => isOffen(x.o)).length;
  const inWork = enriched.filter((x) => isOffen(x.o) && x.b !== "new").length;
  const tiles = SCOPE_TILES[f.scope] || SCOPE_TILES.open;
  const tot = Math.max(1, base.filter(inScope).length);
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
          const n = base.filter((x) => inTile(k, x.b)).length; const I = TILE_ICON[k];
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
        {list.slice(0, limit).map(({ o, b, m }, j) => (
          <button key={o.id} type="button" className={"ord" + (selId === o.id ? " sel" : "")} style={{ "--pi": Math.min(j, 10) }} onClick={() => openOrder(o.id)}>
            <Avatar o={o} />
            <span className="t"><span className="l1"><b>{o.name || o.company || o.email || o.id}</b><span className="p">{orderMoney(o)}</span></span>
              <span className="l2"><KTag o={o} />{payPrefOf(o) ? <span className="ktag kd" title={"Will per " + payPrefOf(o) + " zahlen"}>−10 %</span> : null}<span className={"dt d-" + b} />{ST[b].l} · <span className={isLate(b, m) ? "late" : ""}>{fmtAge(m)}</span>{o.service === "reviews" ? <> · {(o.reviewItems || []).length} Bew.</> : null}</span></span>
          </button>
        ))}
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
  const b = bucket(o, now), m = ageMin(o, b, now), late = isLate(b, m);
  const s = staffOf(o.assignee);
  const isRev = o.service === "reviews";
  const items = o.reviewItems || [];
  const pt = ptasks[o.id] || [];
  const removedN = pt.filter((t) => t.status === "removed").length;
  const accN = o.reviewsAccepted ? o.reviewsAccepted.length : items.length;
  const f = o.form || {};
  const stepIx = b === "new" ? 0 : b === "work" ? 2 : b === "pay" || b === "inkasso" ? 3 : b === "deleted" ? 4 : -1;
  const primary =
    b === "new" ? <button type="button" className="cta or" onClick={() => act.start(o)}><Hand />{o.assignee ? "Bearbeitung starten" : "Übernehmen & starten"}</button>
    : b === "pay" || b === "inkasso" ? <button type="button" className={"cta" + (b === "inkasso" ? " red" : "")} onClick={() => act.remind(o)}>{b === "inkasso" ? <Gavel /> : <Send />}Mahnung senden{o.mahnungCount ? ` · ${o.mahnungCount} bisher` : ""}</button>
    : b === "work" ? <button type="button" className="cta" onClick={() => act.done(o)}><Check />Als erledigt markieren</button>
    : b === "cancel" ? <button type="button" className="cta" onClick={() => act.reactivate(o)}><RotateCcw />Auftrag reaktivieren</button>
    : null;
  return (
    <>
      <Nav back={back} isDesk={isDesk} right={<a className="circ" href={`/admin/alt?order=${encodeURIComponent(o.id)}`} aria-label="Im alten Admin öffnen" title="Im alten Admin öffnen"><MoreHorizontal /></a>} />
      <div className="dh"><Avatar o={o} big /><div><h1>{o.name || o.company || o.email}</h1><p>{o.id} · {SERVICE_L[o.service] || o.service}</p></div></div>
      <div className="amt"><div className="k">Bestellwert</div><div className="v">{orderMoney(o)}</div>
        <div className="r"><span className="st"><span className={"dt d-" + b} />{ST[b].l}</span><span className={"tm" + (late ? " late" : "")}>{late ? <AlarmClock /> : <Clock />}seit {fmtAge(m)}</span></div></div>
      {payPrefOf(o) && o.status !== "storniert" ? (
        <div className="disc">
          <span className="di"><Percent /></span>
          <span className="t"><b>Kunde möchte per {payPrefOf(o)} zahlen → 10 % Rabatt gewähren</b>
            <span>{isRev ? "Gilt auf die gelöschten Bewertungen" : <>Statt {computeOffer(o).regular} nur <b>{computeOffer(o).paypal}</b> · spart {computeOffer(o).savings}</>}{o.paypal && o.paypal !== "ja" ? <> · PayPal: {o.paypal}</> : null}</span>
            {isRev || (o.lang || "de") !== "de" ? <span>Mahnungen gehen deshalb als {payPrefOf(o)}-Text ohne Stripe-Link raus.</span> : null}</span>
        </div>
      ) : null}
      {primary ? <div className="ctas" style={{ margin: "4px 0 14px" }}>{primary}</div> : null}
      <div className="info">
        <button type="button" className="ir" onClick={() => openSheet({ kind: "staff", forId: o.id })}>
          {s ? <img src={s.src} alt="" /> : <span className="ico"><UserPlus /></span>}
          <span className="t"><span>Betreuer</span><b>{s ? s.name : "Nicht zugewiesen"}</b></span><ChevronRight /></button>
        <div className="ir"><span className="ico"><Mail /></span><span className="t"><span>E-Mail</span><b>{o.email || "—"}</b></span></div>
        {o.phone ? <div className="ir"><span className="ico"><Phone /></span><span className="t"><span>Telefon</span><b>{o.phone}</b></span></div> : null}
        <div className="ir"><span className="ico">{isRev ? <MessageSquareText /> : <Store />}</span><span className="t"><span>{isRev ? "Leistung" : "Profil"}</span><b>{isRev ? `${SERVICE_L.reviews} · ${items.length} Bewertungen` : (o.profile || o.company || "—")}</b></span></div>
        {o.addr || o.mapsUri ? <a className="ir" href={o.mapsUri || `https://www.google.com/maps/search/${encodeURIComponent((o.profile || "") + " " + o.addr)}`} target="_blank" rel="noopener noreferrer"><span className="ico"><MapPin /></span><span className="t"><span>Adresse</span><b>{o.addr || "In Google Maps öffnen"}</b></span><ChevronRight /></a> : null}
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
        <div className="info"><button type="button" className="ir" onClick={() => pushReviews(o.id)}><span className="ico"><StarOff /></span><span className="t"><span>Bewertungen</span><b>{items.length} eingereicht · {accN} angenommen · {removedN} gelöscht</b></span><ChevronRight /></button></div>
      ) : null}
      <ActivityRow o={o} onOpen={() => ctx.pushAct(o.id)} />
      {stepIx >= 0 ? (
        <>
          <div className="lbl">Fortschritt</div>
          <div className="asteps">
            {[["new", "Bestellung eingegangen"], ["work", "Löschung läuft"], ["del", "Gelöscht"], ["pay", b === "inkasso" ? "Zahlung (Inkasso)" : "Bezahlt"]].map(([k, lb], i) => {
              // Unser Ablauf: erst löschen, dann bezahlen → Zahlung offen/Inkasso = Schritt 4 aktiv.
              const rank = b === "new" ? 0 : b === "work" ? 1 : b === "pay" || b === "inkasso" ? 3 : 4;
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

export function Nav({ back, right, isDesk }) {
  return <div className="anav"><button type="button" className="circ" aria-label={isDesk ? "Schließen" : "Zurück"} onClick={back}>{isDesk ? <X /> : <ArrowLeft />}</button>{right || null}</div>;
}

/* ---------------- Bewertungen / Screenshots ---------------- */
const PS = {
  new: ["Beim Partner · noch nicht gestartet", "var(--g3)"], working: ["Partner arbeitet", "var(--orange-800)"], removed: ["Gelöscht", "var(--success)"],
  not_possible: ["Partner: nicht möglich", "var(--danger)"], software: ["Software · wartet auf Kunde", "var(--info)"], cancelled: ["Storniert", "var(--g3)"],
};
const keyOf = (it) => it.url || ((it.name || "") + "|" + (it.text || ""));

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
              <span className="t"><b>{r.t ? r.t.code + " · " : "#" + (r.i + 1) + " · "}{r.it.name || (r.it.url ? "Bewertung" : "—")}</b><span style={{ color: ps[1] }}>{ps[0]}</span></span>
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
