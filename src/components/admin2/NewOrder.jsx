"use client";
/* Neues Admin — Flow „Neuer Auftrag" (Claude-Design-Handoff, README „Flow · Neuer Auftrag").
   Bewertungen: Kategorie → Bewertungen (Profil-Link mit Auswahl ODER Bewertungs-Links) → Kunde → Abschluss.
   Profil:      Kategorie → Profil (Maps-Link) → Grund → Kunde → Abschluss.
   Echte Daten: Profil über /admin/monitor/lookup, Bewertungen über SerpApi, Anlegen über /admin/orders/create
   (gleiche Preise, Auftragsbestätigung, Partner-Auto-Weiterleitung und Screenshots wie Website-Bestellungen). */
import React from "react";
import {
  X, ArrowLeft, ArrowRight, Link as LinkIcon, Clipboard, Store, Check, Info, CheckCheck, User, Mail, Phone, Send, Wallet,
  FileText, Zap, ChevronRight, Plus, UserX, Copy, MapPin, MoreHorizontal, StarOff, Loader, Bell,
} from "lucide-react";
import { monitorLookup, placeReviews, createAdminOrder } from "@/lib/admin-api";
import { reviewQuote } from "@/lib/pricing";
import { IMG, money, staffOf } from "./model";

const CTRY = [["AT", "Österreich", "€"], ["DE", "Deutschland", "€"], ["CH", "Schweiz", "€"], ["US", "USA", "$"], ["UK", "UK", "$"], ["XX", "Andere", "$"]];
const REASONS = [["closed", "Dauerhaft geschlossen", Store], ["fake", "Fake / nicht meins", UserX], ["dup", "Doppeltes Profil", Copy], ["moved", "Umgezogen", MapPin], ["other", "Sonstiges", MoreHorizontal]];
const PAYS = [["link", "Zahlungslink per E-Mail", Send], ["paypal", "PayPal (−10 %)", Wallet], ["invoice", "Rechnung", FileText]];
const PROFILE_PRICE = { "€": 450, $: 495 };
const MAPS_RE = /(maps|goo\.gl|g\.page|google\.)/i;
const isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s || "").trim());
const ago = (d) => (d < 0 ? "Datum unbekannt" : d < 1 ? "heute" : d < 7 ? `vor ${d} ${d === 1 ? "Tag" : "Tagen"}` : d < 31 ? `vor ${Math.round(d / 7)} ${Math.round(d / 7) === 1 ? "Woche" : "Wochen"}` : d < 365 ? `vor ${Math.round(d / 30)} ${Math.round(d / 30) === 1 ? "Monat" : "Monaten"}` : `vor ${Math.round(d / 365)} J.`);
const Stars = ({ n }) => <i className="st">{"★".repeat(Math.max(0, Math.min(5, n)))}<s>{"★".repeat(Math.max(0, 5 - n))}</s></i>;

const NA0 = () => ({ step: 0, type: null, mode: "profile", url: "", biz: null, bizBusy: false, bizErr: "", revs: null, revErr: "", rsf: "neg", sel: [], rl: [], rlin: "", reason: null, name: "", email: "", phone: "", country: "AT", pay: "link", staff: "max", confirm: true, busy: false, done: null });

export default function NewOrder({ ctx }) {
  const { back, auto, partners, openSheet, openOrder, toast, refresh, isDesk, scrollPush } = ctx;
  const [s, setS] = React.useState(NA0);
  const set = (p) => setS((x) => ({ ...x, ...(typeof p === "function" ? p(x) : p) }));
  const cur = CTRY.find((c) => c[0] === s.country)[2];
  const steps = s.type === "profile" ? ["Kategorie", "Profil", "Grund", "Kunde", "Abschluss"] : ["Kategorie", "Bewertungen", "Kunde", "Abschluss"];
  // Ansicht je Schritt: reviews 0 cat · 1 revs · 2 cust · 3 sum — profile 0 cat · 1 prof · 2 reason · 3 cust · 4 sum
  const view = s.type === "profile" ? ["cat", "prof", "reason", "cust", "sum"][s.step] : ["cat", "revs", "cust", "sum"][s.step];

  /* ---- Profil erkennen (Maps-Link) + Bewertungen laden ---- */
  const lookupSeq = React.useRef(0);
  const lookup = React.useCallback(async (link, withReviews) => {
    const seq = ++lookupSeq.current;
    set({ bizBusy: true, bizErr: "", ...(withReviews ? { revs: null, revErr: "", sel: [] } : {}) });
    try {
      const r = await monitorLookup({ link: link.trim() });
      if (seq !== lookupSeq.current) return;
      if (!r.place) { set({ bizBusy: false, biz: null, bizErr: "Kein Profil gefunden – Link prüfen." }); return; }
      set({ bizBusy: false, biz: r.place });
      if (withReviews && r.place.placeId) {
        try {
          const rv = await placeReviews(r.place.placeId, "de");
          if (seq !== lookupSeq.current) return;
          set(rv.enabled === false ? { revs: [], revErr: "Bewertungsliste nicht verfügbar – bitte „Bewertungs-Links“ nutzen." } : { revs: rv.reviews || [] });
        } catch (e) { if (seq === lookupSeq.current) set({ revs: [], revErr: "Bewertungen konnten nicht geladen werden: " + e.message }); }
      }
    } catch (e) { if (seq === lookupSeq.current) set({ bizBusy: false, biz: null, bizErr: "Profil-Suche fehlgeschlagen: " + e.message }); }
  }, []);
  React.useEffect(() => {
    if (view !== "revs" && view !== "prof") return;
    if (view === "revs" && s.mode !== "profile") return;
    const u = s.url.trim();
    if (!isUrl(u) || !MAPS_RE.test(u)) return;
    if (s.biz && s.biz._src === u) return;
    const t = setTimeout(() => lookup(u, s.type === "reviews").then(() => set((x) => (x.biz ? { biz: { ...x.biz, _src: u } } : {}))), 450);
    return () => clearTimeout(t);
  }, [s.url, view, s.mode, s.type]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- abgeleitete Werte ---- */
  const revList = (s.revs || []).filter((r) => s.rsf === "all" || (r.rating && r.rating <= 2));
  const items = s.type !== "reviews" ? [] : s.mode === "links"
    ? s.rl.map((r) => ({ url: r.url, old: !!r.old }))
    : (s.revs || []).filter((r) => s.sel.includes(r.id)).map((r) => ({ ...(r.link ? { url: r.link } : {}), name: r.name, text: r.text || "★".repeat(r.rating || 0), old: r.days > 28 }));
  const q = s.type === "reviews" ? reviewQuote(items, "de") : null;
  const amount = s.type === "reviews" ? q.total : PROFILE_PRICE[cur];
  const fmt = (v) => money(v, cur);
  const valid = [
    !!s.type,
    s.type === "reviews" ? items.length > 0 : !!s.biz,
    s.type === "profile" ? !!s.reason : s.name.trim().length > 1 && /.+@.+\..+/.test(s.email.trim()),
    s.type === "profile" ? s.name.trim().length > 1 && /.+@.+\..+/.test(s.email.trim()) : true,
    true,
  ][s.step];
  const last = s.step === steps.length - 1;

  const scrollUp = () => requestAnimationFrame(() => scrollPush && scrollPush());
  const goStep = (n) => { set({ step: n }); scrollUp(); };
  const doBack = () => (s.step ? goStep(s.step - 1) : back());
  const pickType = (t) => {
    set((x) => (x.type === t ? {} : { type: t, url: "", biz: null, revs: null, sel: [], rl: [], rlin: "", reason: null }));
    setTimeout(() => goStep(1), 220);
  };
  const paste = async (k) => {
    try { const t = await navigator.clipboard.readText(); if (t) set({ [k]: t.trim() }); } catch (e) { toast("Einfügen nicht erlaubt – bitte manuell einfügen"); }
  };
  const addLink = () => {
    const u = s.rlin.trim();
    if (!isUrl(u)) { toast("Bitte einen gültigen Link einfügen"); return; }
    if (s.rl.some((r) => r.url === u)) { toast("Link ist schon in der Liste"); set({ rlin: "" }); return; }
    const first = !s.rl.length;
    set((x) => ({ rl: [...x.rl, { url: u, old: false }], rlin: "" }));
    if (first && !s.biz) lookup(u, false);
  };
  const create = async () => {
    set({ busy: true });
    try {
      const r = await createAdminOrder({
        type: s.type, reviewItems: items, reason: s.reason, payment: s.pay, staff: s.staff, sendConfirm: s.confirm,
        place: s.biz ? { name: s.biz.name, address: s.biz.address, placeId: s.biz.placeId, mapsUrl: s.biz.mapsUrl || s.url } : { mapsUrl: s.url },
        customer: { name: s.name.trim(), email: s.email.trim(), phone: s.phone.trim(), country: s.country },
      });
      set({ busy: false, done: r });
      refresh && refresh(true);
      scrollUp();
    } catch (e) { set({ busy: false }); toast("Anlegen fehlgeschlagen: " + e.message); }
  };

  /* ---- Erfolg ---- */
  if (s.done) {
    const d = s.done;
    return (
      <div className="nadone">
        <span className="okc"><Check /></span>
        <h1>Auftrag angelegt</h1>
        <p>{d.id} · {(s.biz && s.biz.name) || s.name}</p>
        <p className="m">{d.mailed ? <>Auftragsbestätigung an {s.email.trim()} gesendet.</> : s.confirm ? "Bestätigung konnte nicht gesendet werden – bitte im Auftrag prüfen." : "Keine E-Mail an den Kunden gesendet."}</p>
        {d.partner ? <p>{d.partner === 1 ? "1 Aufgabe" : d.partner + " Aufgaben"} automatisch ans Partner-Board.</p> : null}
        <div className="ctas" style={{ width: "100%", marginTop: 28 }}>
          <button type="button" className="cta" onClick={() => openOrder(d.id)}><ArrowRight />Auftrag öffnen</button>
          <button type="button" className="cta gh" onClick={back}>Fertig</button>
        </div>
      </div>
    );
  }

  /* ---- Schritte ---- */
  const H1 = { cat: "Was soll gelöscht werden?", revs: "Profil oder Bewertungen?", prof: "Welches Profil?", reason: "Warum löschen?", cust: "Wer ist der Kunde?", sum: "Alles korrekt?" }[view];
  const bizCard = (sm) => s.biz ? (
    <div className={"nabiz" + (sm ? " sm" : "")}><span className="mav"><Store /></span><div className="t"><b>{s.biz.name}</b><span>{s.biz.address}</span>{!sm && s.revs && s.revs.length ? <span className="rt">{s.revs.length} Bewertungen geladen</span> : null}</div><span className="ok"><Check /></span></div>
  ) : s.bizBusy ? <div className="nahint"><Loader className="spin" />Profil wird gesucht …</div>
    : s.bizErr ? <div className="nahint err"><Info />{s.bizErr}</div> : null;

  let body = null;
  if (view === "cat") {
    body = (
      <div className="nacat">
        {[["reviews", IMG("rev"), "Bewertungen", "Negative Bewertungen entfernen"], ["profile", IMG("hero"), "Profil", "Ganzes Google-Profil löschen"]].map(([t, im, l, sub]) => (
          <button key={t} type="button" className={"nac" + (s.type === t ? " on" : "")} onClick={() => pickType(t)}>
            <span className="ni"><img src={im} alt="" /></span><span className="t"><b>{l}</b><span>{sub}</span></span><span className="rd"><Check /></span>
          </button>
        ))}
      </div>
    );
  } else if (view === "revs" || view === "prof") {
    const links = view === "revs" && s.mode === "links";
    const urlField = (
      <>
        <p className="nasub">Google-Maps-Link des Unternehmens einfügen.</p>
        <div className="usrch nain"><LinkIcon /><input placeholder="https://maps.google.com/…" value={s.url} onChange={(e) => set({ url: e.target.value })} inputMode="url" autoComplete="off" />
          <button type="button" className="bt" onClick={() => paste("url")}><Clipboard />Einfügen</button></div>
        {bizCard(false) || <div className="nahint"><Info />Profil wird automatisch erkannt.</div>}
      </>
    );
    body = (
      <>
        {view === "revs" ? <div className="seg2 naseg">{[["profile", "Profil-Link"], ["links", "Bewertungs-Links"]].map(([k, l]) => <button key={k} type="button" className={s.mode === k ? "on" : ""} onClick={() => set({ mode: k })}>{l}</button>)}</div> : null}
        {links ? (
          <>
            <p className="nasub">Link zu jeder Bewertung einfügen – eine nach der anderen.</p>
            <div className="usrch nain"><LinkIcon /><input placeholder="Link zur Bewertung" value={s.rlin} onChange={(e) => set({ rlin: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addLink()} inputMode="url" autoComplete="off" />
              <button type="button" className="bt" onClick={() => (s.rlin.trim() ? addLink() : paste("rlin"))}>{s.rlin.trim() ? <><Plus />Hinzufügen</> : <><Clipboard />Einfügen</>}</button></div>
            {bizCard(true)}
            {s.rl.length ? (
              <div className="card ls narl">
                {s.rl.map((r, i) => (
                  <div key={r.url} className="rlr">
                    <span className="n">{i + 1}</span>
                    <div className="t"><b className="lnk">{r.url.replace(/^https?:\/\//, "")}</b>
                      <button type="button" className={"oldt" + (r.old ? " on" : "")} onClick={() => set((x) => ({ rl: x.rl.map((y, j) => (j === i ? { ...y, old: !y.old } : y)) }))}>{r.old ? <Check /> : null}älter 4 Wo.</button></div>
                    <button type="button" className="circ sm" aria-label="Entfernen" onClick={() => set((x) => ({ rl: x.rl.filter((_, j) => j !== i) }))}><X /></button>
                  </div>
                ))}
              </div>
            ) : (!s.biz ? <div className="nahint"><Info />Unternehmen wird aus dem ersten Link erkannt.</div> : null)}
          </>
        ) : urlField}
        {view === "revs" && !links && s.biz ? (
          <>
            <div className="sec3" style={{ marginTop: 20 }}><h2>Bewertungen wählen</h2>
              <div className="seg2">{[["neg", "1–2 ★"], ["all", "Alle"]].map(([k, l]) => <button key={k} type="button" className={s.rsf === k ? "on" : ""} onClick={() => set({ rsf: k })}>{l}</button>)}</div></div>
            {s.revs === null ? <div className="nahint"><Loader className="spin" />Bewertungen werden geladen …</div>
              : s.revErr ? <div className="nahint err"><Info />{s.revErr}</div>
              : !revList.length ? <div className="nahint"><Info />{s.rsf === "neg" ? "Keine 1–2-Sterne-Bewertungen gefunden – „Alle“ zeigen." : "Keine Bewertungen gefunden."}</div>
              : (
                <>
                  <div className="card ls narl">
                    {revList.map((r) => {
                      const on = s.sel.includes(r.id);
                      return (
                        <button key={r.id} type="button" className={"rlr pk" + (on ? " on" : "")} onClick={() => set((x) => ({ sel: on ? x.sel.filter((y) => y !== r.id) : [...x.sel, r.id] }))}>
                          <span className="cb2"><Check /></span>
                          <div className="t"><b>{r.name} <Stars n={r.rating} /></b><span className="q">{r.text || "Nur Sterne, kein Text"}</span><span>{ago(r.days)}{r.days > 28 ? " · älter 4 Wo." : ""}</span></div>
                        </button>
                      );
                    })}
                  </div>
                  <button type="button" className="nasel" onClick={() => set((x) => ({ sel: x.sel.length ? [] : revList.map((r) => r.id) }))}>
                    {s.sel.length ? <><X />Auswahl aufheben</> : <><CheckCheck />{s.rsf === "neg" ? "Alle negativen wählen" : "Alle wählen"}</>}</button>
                </>
              )}
          </>
        ) : null}
        {view === "revs" && items.length ? <div className="natot"><span>{items.length} {items.length === 1 ? "Bewertung" : "Bewertungen"}{q.nOld ? ` · ${q.nOld} älter` : ""}{q.pct ? ` · −${q.pct} %` : ""}</span><b>{fmt(amount)}</b></div> : null}
      </>
    );
  } else if (view === "reason") {
    body = (
      <div className="naopts">
        {REASONS.map(([k, l, I]) => (
          <button key={k} type="button" className={"aopt" + (s.reason === k ? " sel" : "")} onClick={() => set({ reason: k })}><span className="ico"><I /></span>{l}{s.reason === k ? <span className="ck"><Check /></span> : null}</button>
        ))}
      </div>
    );
  } else if (view === "cust") {
    const f = (k, l, type, ph, I) => (
      <label className="naf"><span>{l}</span><div className="usrch nain"><I /><input type={type} placeholder={ph} value={s[k]} onChange={(e) => set({ [k]: e.target.value })} autoComplete="off" /></div></label>
    );
    body = (
      <>
        {f("name", "Name *", "text", "Vor- und Nachname", User)}
        {f("email", "E-Mail *", "email", "name@firma.at", Mail)}
        {f("phone", "Telefon", "tel", "+43 …", Phone)}
        <div className="naf"><span>Land · bestimmt Währung</span>
          <div className="nachips">{CTRY.map(([c, l]) => <button key={c} type="button" className={"achip" + (s.country === c ? " on" : "")} onClick={() => set({ country: c })}>{l}</button>)}</div></div>
      </>
    );
  } else if (view === "sum") {
    const st = staffOf(s.staff);
    const autoOn = auto ? (s.type === "profile" ? auto.autoProfiles : auto.autoReviews) : s.type !== "profile";
    const pl = ((partners && partners.partners) || []).filter((x) => x.active !== false);
    const pName = pl[0] ? pl[0].name : "Partner";
    const shown = s.pay === "paypal" ? Math.round(amount * 0.9) : amount;
    body = (
      <>
        <div className="nasum">
          <div className="nsh"><span className="mav">{s.type === "profile" ? <Store /> : <StarOff />}</span><div><b>{(s.biz && s.biz.name) || "Google-Profil"}</b><span>{s.type === "profile" ? "Profil löschen" + (s.reason ? " · " + REASONS.find((r) => r[0] === s.reason)[1] : "") : items.length + (items.length === 1 ? " Bewertung" : " Bewertungen") + (q.nOld ? " · " + q.nOld + " älter" : "")}</span></div></div>
          <div className="nsr"><span>Kunde</span><b>{s.name.trim()}</b></div>
          <div className="nsr"><span>E-Mail</span><b>{s.email.trim()}</b></div>
          {s.phone.trim() ? <div className="nsr"><span>Telefon</span><b>{s.phone.trim()}</b></div> : null}
          <div className="nsr tot"><span>{s.type === "reviews" ? "Betrag (max.)" : "Betrag"}</span><b>{fmt(shown)}</b></div>
        </div>
        <div className="sec3" style={{ marginTop: 20 }}><h2>Zahlung</h2></div>
        <div className="naopts">
          {PAYS.map(([k, l, I]) => <button key={k} type="button" className={"aopt" + (s.pay === k ? " sel" : "")} onClick={() => set({ pay: k })}><span className="ico"><I /></span>{l}{s.pay === k ? <span className="ck"><Check /></span> : null}</button>)}
        </div>
        <div className="info" style={{ marginTop: 14 }}>
          <button type="button" className="ir" onClick={() => openSheet({ kind: "pick", title: "Betreuer", cur: s.staff, opts: [["max", "Max", staffOf("max").src], ["matthias", "Matthias", staffOf("matthias").src]], onPick: (k) => set({ staff: k }) })}>
            {st ? <img src={st.src} alt="" /> : <span className="ico"><User /></span>}<span className="t"><span>Betreuer</span><b>{st ? st.name : "Niemand"}</b></span><ChevronRight /></button>
          <div className="ir"><span className="ico"><Zap /></span><span className="t"><span>Partner</span><b>{autoOn ? "Automatisch an " + pName : "Manuell zuweisen"}</b></span></div>
          <button type="button" className="ir" onClick={() => set((x) => ({ confirm: !x.confirm }))}>
            <span className="ico"><Bell /></span><span className="t"><span>Kunde</span><b>Auftragsbestätigung per E-Mail</b></span><span className={"tg" + (s.confirm ? " on" : "")}><i /></span></button>
        </div>
        <p className="nasub" style={{ marginTop: 4 }}>{s.type === "reviews" ? "Bezahlt werden nur gelöschte Bewertungen – der Zahlungslink geht wie gewohnt nach der Löschung raus." : "Der Zahlungslink geht wie gewohnt nach der Löschung raus."}</p>
      </>
    );
  }

  return (
    <div className="naflow">
      <div className="anav"><button type="button" className="circ" aria-label={s.step ? "Zurück" : "Abbrechen"} onClick={doBack}>{s.step ? <ArrowLeft /> : <X />}</button><span className="nastep">Schritt {s.step + 1} von {steps.length}</span><span style={{ width: 49 }} /></div>
      <div className="naprog" style={{ gridTemplateColumns: `repeat(${steps.length},1fr)` }}>{steps.map((_, i) => <i key={i} className={i <= s.step ? "on" : ""} />)}</div>
      <div className="nah"><h1>{H1}</h1></div>
      {body}
      {view !== "cat" ? (
        <div className="nastick">
          <button type="button" className={"cta" + (last ? " or" : "")} disabled={!valid || s.busy} onClick={() => (last ? create() : goStep(s.step + 1))}>
            {last ? <><Check />{s.busy ? "Wird angelegt …" : "Auftrag anlegen"}</>
              : <>{view === "revs" && items.length ? `${items.length} ${items.length === 1 ? "Bewertung" : "Bewertungen"} · Weiter` : "Weiter"}<ArrowRight /></>}
          </button>
        </div>
      ) : null}
      {isDesk ? null : <div style={{ height: 8 }} />}
    </div>
  );
}
