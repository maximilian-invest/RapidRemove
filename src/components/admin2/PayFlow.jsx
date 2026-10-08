"use client";
/* Neues Admin — „Zahlung offen" im Auftrag (Design-Handoff Okt 2026, rapid_new_launch_13):
   - EIN schwarzer Hauptbutton, eskaliert nach Stufe (Zahlungslink → Erinnerung → … → Mahnung → An Inkasso übergeben)
   - Textlink „Zahlung bereits erhalten?" (2× tippen)
   - Info-Zeilen „Zahlungsziel" und „Mail-Verlauf · n gesendet" mit eigenen Sheets.
   Versand läuft über das bestehende Mahnungs-Sheet (Vorschau + „Jetzt senden"), Zahlungsziel über /admin/pay-due:
   läuft es ohne Zahlung ab, geht automatisch die Zahlungsziel-Mail raus. Weitere Mahnungen sendet ihr selbst. */
import React from "react";
import { ArrowLeft, Bell, Send, Gavel, CircleCheck, CheckCircle2, CalendarClock, Mail, ChevronRight, Clock, Check, Eye, Loader, Receipt, CreditCard } from "lucide-react";
import { fetchEvents, fetchEmailPreview, setPayDue, setOrderStatus } from "@/lib/admin-api";
import { PROFILE_STAGES, REVIEW_STAGES } from "./Mahnung";
import { revState } from "./model";

const stageOf = (t) => { const m = String(t || "").match(/Stufe\s*(\d)/i); return m ? Number(m[1]) : null; };
const dShort = (iso) => new Date(iso).toLocaleDateString("de-AT", { weekday: "short", day: "2-digit", month: "2-digit" });
const dTime = (iso) => { const d = new Date(iso); return d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) + ", " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); };

/** Nächster Schritt im Mahnverlauf. Bewertungen (nicht PayPal/Wise): Stufe 1 + 2 gehen automatisch raus
 *  (followup.ts: 24 h nach der Löschung, Stufe 2 48 h danach, nur 8–20 Uhr Ortszeit) – danach manuell.
 *  Profil: nur die Zahlungsziel-Mail ist automatisch. */
export function nextStep(o, pm, ptasks) {
  if (!pm) return null;
  if (o.pay === "inkasso") return { label: "An Inkasso übergeben", sub: "", auto: false };
  const isRev = o.service === "reviews";
  const pd = o.payDue && o.payDue.at ? o.payDue : null;
  if (!isRev && pd && !pd.sent) return { label: "Zahlungsziel-Mail", sub: dShort(pd.at), auto: true };
  if (pm.level >= pm.stages.length) return { label: "Übergabe an Inkasso", sub: "", auto: false };
  const label = pm.stages[pm.level][1];
  const ppw = o.payPref === "wise" || o.payPref === "paypal" || !!o.paypal;
  if (isRev && !ppw && pm.level < 2) {
    const r = revState(o, (ptasks || {})[o.id]);
    const lastMahn = pm.sent.filter((x) => x.kind === "mahn").map((x) => new Date(x.ts).getTime()).sort((a, b) => b - a)[0];
    const at = pm.level === 0 ? (r && r.unpaidSince ? r.unpaidSince + 24 * 3600e3 : null) : lastMahn ? lastMahn + 48 * 3600e3 : null;
    if (at) return { label, sub: at <= Date.now() ? "in Kürze (8–20 Uhr Ortszeit)" : dShort(new Date(at).toISOString()), auto: true };
  }
  // Profil: Stufe 1–3 automatisch alle 48 h ab dem Zahlungslink (ab 08.10.2026), Stufe 4 + Inkasso von euch.
  if (!isRev && pm.level < 3) {
    const pays = pm.sent.filter((x) => x.kind === "link" || x.kind === "mahn" || x.kind === "due").map((x) => new Date(x.ts).getTime());
    const firstLink = Math.min(...pm.sent.filter((x) => x.kind === "link").map((x) => new Date(x.ts).getTime()), Infinity);
    if (pays.length && Number.isFinite(firstLink) && firstLink >= Date.parse("2026-10-08T00:00:00Z")) {
      const at = Math.max(...pays) + 2 * 864e5; // 48 h
      return { label, sub: at <= Date.now() ? "in Kürze (8–20 Uhr Ortszeit)" : dShort(new Date(at).toISOString()), auto: true };
    }
  }
  return { label, sub: "", auto: false };
}

/** Zahlungs-Mails aus dem Verlauf des Auftrags. */
export function payMailsOf(events, o) {
  const isRev = o.service === "reviews";
  const ST = isRev ? REVIEW_STAGES : PROFILE_STAGES;
  const sent = [];
  for (const e of events || []) {
    const t = String(e.t || "");
    let label = null, stage = null, kind = "mail";
    if (/zahlungsziel .* abgelaufen/i.test(t)) { label = "Zahlungsziel abgelaufen"; kind = "due"; }
    else if (/^mahnung/i.test(t)) { stage = stageOf(t); label = stage && ST[stage - 1] ? ST[stage - 1][1] : "Mahnung"; kind = "mahn"; }
    else if (/zahlungslink gesendet/i.test(t)) { label = "Zahlungslink"; kind = "link"; }
    else if (/löschbestätigung/i.test(t)) { label = "Löschbestätigung + Rechnung"; kind = "link"; }
    else if (/^Dashboard-Update an Kunden gesendet/i.test(t) && /: removed/.test(String(e.d || ""))) { label = "Zahlungsaufforderung"; kind = "link"; }
    else if (/^Software bestätigt – Zahlungsaufforderung/i.test(t)) { label = "Zahlungsaufforderung (Software)"; kind = "link"; }
    if (!label) continue;
    sent.push({ id: e.id, label: label + (e.auto || /automatisch/i.test(t) ? " · automatisch" : ""), ts: e.ts, hasHtml: e.hasHtml, stage, kind });
  }
  sent.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  // ALLE Mails an den Kunden (automatisch + von euch), damit man sieht, was überhaupt bei ihm ankommt.
  const mails = [];
  for (const e of events || []) {
    const t = String(e.t || ""), d = String(e.d || "");
    const isMail = (e.hasHtml || /gesendet|versendet|verschickt/i.test(t)) && !/nicht gesendet|fehlgeschlagen|keine mail|eingeplant|^partner|^kunde:/i.test(t);
    if (!isMail) continue;
    const pay = sent.find((x) => x.id === e.id);
    let label = pay ? pay.label.replace(/ · automatisch$/, "") : t.replace(/\s*\((automatisch[^)]*)\)/i, "").replace(/ (gesendet|versendet|verschickt)\b/i, "").trim();
    if (/^Dashboard-Update an Kunden/i.test(t) && !pay) label = "Status-Update" + (d ? ": " + d.replace(/https?:\/\/\S+/g, "Bewertung").slice(0, 60) : "");
    const auto = !!e.auto || /automatisch|Schutzmodell|Bestellbestätigung|Zahlung erfolgreich|Zahlungsaufforderung|Erinnerung gesendet \(/i.test(t);
    mails.push({ id: e.id, label, ts: e.ts, hasHtml: e.hasHtml, auto });
  }
  mails.sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  const mahn = sent.filter((x) => x.kind === "mahn" || x.kind === "due");
  const level = Math.max(0, ...mahn.map((x) => x.stage || 0)) || (mahn.length ? 1 : 0);
  return { sent, mails, level, linkSent: sent.some((x) => x.kind === "link") || !!o.paylinkSent, stages: ST };
}

export function usePayMails(o) {
  const [ev, setEv] = React.useState(null);
  const key = `${o.id}|${o.mahnungCount || 0}|${o.paylinkSent ? 1 : 0}|${JSON.stringify(o.payDue || null)}|${o.pay}`;
  React.useEffect(() => {
    let off = false;
    const load = () => fetchEvents(o.id, o.email).then((x) => { if (!off) setEv(x || []); }).catch(() => { if (!off) setEv([]); });
    load();
    const t = setTimeout(load, 4000); // Versand braucht einen Moment, bis er im Verlauf steht
    window.addEventListener("focus", load);
    return () => { off = true; clearTimeout(t); window.removeEventListener("focus", load); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return ev === null ? null : payMailsOf(ev, o);
}

/** Hauptaktion + „Zahlung bereits erhalten?" (Status Zahlung offen / Inkasso). */
export function PayActions({ o, ctx, r, pm, group = [], altHref }) {
  const isRev = o.service === "reviews";
  const [armed, setArmed] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { if (!armed) return undefined; const t = setTimeout(() => setArmed(""), 3500); return () => clearTimeout(t); }, [armed]);
  const paid = async (list) => {
    const k = list.length > 1 ? "all" : "one";
    if (armed !== k) { setArmed(k); return; }
    setBusy(true);
    await ctx.markPaid(list, list.length > 1 ? `Zahlung eingegangen (manuell · Sammelzahlung ${list.map((y) => y.id).join(", ")})` : "Zahlung eingegangen (manuell)");
    setBusy(false); setArmed("");
  };
  const inkasso = async () => {
    if (armed !== "ink") { setArmed("ink"); return; }
    setBusy(true);
    try {
      await setOrderStatus({ orderId: o.id, status: o.status || "done", pay: "inkasso", label: "An Inkasso übergeben" });
      ctx.patchOrder(o.id, { pay: "inkasso" });
      ctx.toast("An Inkasso übergeben");
    } catch (e) { ctx.toast("Fehler: " + e.message); }
    setBusy(false); setArmed("");
  };

  let cta = null;
  if (o.pay === "inkasso") {
    cta = <button type="button" className="cta" onClick={() => ctx.openSheet({ kind: "mailhist", forId: o.id })}><Gavel />Bei Inkasso · Verlauf ansehen</button>;
  } else if (!pm) {
    cta = <button type="button" className="cta" disabled><Loader className="spin" />Lädt …</button>;
  } else if (isRev && r && r.unbilledN) {
    cta = <a className="cta" href={altHref}><Receipt />Rechnung senden · {r.unbilledN} gelöscht</a>;
  } else if (!isRev && !pm.linkSent && pm.level === 0) {
    cta = <button type="button" className="cta" onClick={() => ctx.openSheet({ kind: "paylink", forId: o.id })}><CreditCard />Zahlungslink senden</button>;
  } else if (pm.level < pm.stages.length) {
    const nx = pm.level + 1;
    const I = nx === 1 ? Bell : Send;
    cta = <button type="button" className="cta" onClick={() => ctx.openSheet({ kind: "mahn", forId: o.id, stage: nx, direct: true })}><I />{pm.stages[nx - 1][1]} senden</button>;
  } else {
    cta = <button type="button" className={"cta" + (armed === "ink" ? " red" : "")} disabled={busy} onClick={inkasso}><Gavel />{armed === "ink" ? "Sicher? Nochmal tippen – an Inkasso übergeben" : "An Inkasso übergeben"}</button>;
  }
  return (
    <div className="ctas pact">
      {cta}
      {group.length ? (
        <button type="button" className={"paylk" + (armed === "all" ? " cf" : "")} disabled={busy} onClick={() => paid([o, ...group])}>
          {armed === "all" ? <CheckCircle2 /> : <CircleCheck />}{armed === "all" ? `Tippen zum Bestätigen: alle ${group.length + 1} bezahlt` : `Sammelzahlung erhalten? (alle ${group.length + 1})`}
        </button>
      ) : null}
      <button type="button" className={"paylk" + (armed === "one" ? " cf" : "")} disabled={busy} onClick={() => paid([o])}>
        {busy && armed === "one" ? <Loader className="spin" /> : armed === "one" ? <CheckCircle2 /> : <CircleCheck />}{armed === "one" ? "Tippen zum Bestätigen: bezahlt" : "Zahlung bereits erhalten?"}
      </button>
    </div>
  );
}

/** Info-Zeilen „Zahlungsziel" (nur Profil) und „Mail-Verlauf". */
export function PayRows({ o, ctx, pm }) {
  const isRev = o.service === "reviews";
  const pd = o.payDue && o.payDue.at ? o.payDue : null;
  const over = pd && new Date(pd.at).getTime() <= Date.now();
  return (
    <>
      {!isRev ? (
        <button type="button" className="ir" onClick={() => ctx.openSheet({ kind: "due", forId: o.id })}>
          <span className="ico"><CalendarClock /></span>
          <span className="t"><span>Zahlungsziel</span>
            {pd ? <b style={over ? { color: "var(--danger)" } : undefined}>{dShort(pd.at)}{pd.sent ? " · abgelaufen, Mail gesendet" : over ? " · abgelaufen" : ""}</b> : <b style={{ color: "var(--primary)" }}>Setzen</b>}</span>
          <ChevronRight />
        </button>
      ) : null}
    </>
  );
}

/** Zeile „Mail-Verlauf" (jeder Auftrag): alle Mails an den Kunden; bei offener Zahlung zusätzlich der nächste Schritt. */
export function MailRow({ o, ctx, payOpen }) {
  const pm = usePayMails(o);
  const ns = payOpen ? nextStep(o, pm, ctx.ptasks) : null;
  const next = !pm ? "…" : ns ? (o.pay === "inkasso" ? "bei Inkasso" : `Nächste: ${ns.label}${ns.auto ? ` · automatisch${ns.sub ? " " + (/^\D/.test(ns.sub) ? ns.sub : "am " + ns.sub) : ""}` : " · manuell"}`)
    : pm.mails.length ? `Zuletzt: ${pm.mails[0].label} · ${dShort(pm.mails[0].ts)}` : "Noch keine Mail";
  return (
    <button type="button" className="ir" onClick={() => ctx.pushSub("mails", o.id)}>
      <span className="ico"><Mail /></span>
      <span className="t"><span>Mail-Verlauf · {pm ? pm.mails.length : "…"} {pm && pm.mails.length === 1 ? "Mail" : "Mails"}</span><b>{next}</b></span>
      <ChevronRight />
    </button>
  );
}

/** Sheet „Zahlungsziel": 3/7/14/30 Tage, eigenes Datum, entfernen. Ablauf = Ende des gewählten Tages. */
export function DueSheet({ o, ctx, close }) {
  const pd = o.payDue && o.payDue.at ? o.payDue : null;
  const [busy, setBusy] = React.useState(false);
  const endOf = (d) => { const x = new Date(d); x.setHours(23, 59, 0, 0); return x; };
  const inDays = (n) => endOf(Date.now() + n * 864e5);
  const ymd = (d) => { const x = new Date(d); const p = (n) => String(n).padStart(2, "0"); return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`; };
  const curYmd = pd ? ymd(pd.at) : "";
  const first = (o.name || o.email || "").split(/\s+/)[0];
  const save = async (date) => {
    setBusy(true);
    try {
      const r = await setPayDue(o.id, date ? date.toISOString() : "");
      ctx.patchOrder(o.id, { payDue: r.payDue || null });
      ctx.toast(date ? "Zahlungsziel: " + dShort(date.toISOString()) : "Zahlungsziel entfernt");
      close();
    } catch (e) { ctx.toast("Fehler: " + e.message); setBusy(false); }
  };
  return (
    <>
      <h3 style={{ paddingBottom: 2 }}>Zahlungsziel</h3>
      <p className="shp">Bis wann soll {first} bezahlen? Läuft es ohne Zahlung ab, geht sofort automatisch eine Mail raus.</p>
      <div className="opts">
        {[3, 7, 14, 30].map((n) => {
          const d = inDays(n);
          return (
            <button key={n} type="button" className="aopt" disabled={busy} onClick={() => save(d)}>
              {n} Tage<span className="c">{dShort(d.toISOString())}</span>{curYmd === ymd(d) ? <span className="ck"><Check /></span> : null}
            </button>
          );
        })}
        <label className="aopt">Eigenes Datum
          <input type="date" className="duein" min={ymd(Date.now() + 864e5)} defaultValue={curYmd && ![3, 7, 14, 30].some((n) => ymd(inDays(n)) === curYmd) ? curYmd : ""} disabled={busy}
            onChange={(e) => { if (e.target.value) save(endOf(e.target.value + "T12:00")); }} />
        </label>
        {pd ? <button type="button" className="aopt red" disabled={busy} onClick={() => save(null)} style={{ color: "var(--danger)" }}>Zahlungsziel entfernen</button> : null}
      </div>
    </>
  );
}

/** Sheet „Mail-Verlauf": geplant (Zahlungsziel) bzw. nächster Schritt, dann alle gesendeten Mails (neueste zuerst, Vorschau). */
export function MailHistSheet({ o, ctx, payOpen }) {
  const pm = usePayMails(o);
  const [busy, setBusy] = React.useState("");
  const pd = o.payDue && o.payDue.at ? o.payDue : null;
  const show = async (x) => {
    setBusy(String(x.id));
    try {
      const r = await fetchEmailPreview(x.id);
      if (r && r.ok && r.html) ctx.openViewer({ keep: true, html: r.html, title: r.subject || x.label, sub: "Gesendet " + dTime(x.ts) + " · an " + o.email });
      else ctx.toast((r && r.error) || "Keine Kopie gespeichert");
    } catch (e) { ctx.toast("Vorschau: " + e.message); }
    setBusy("");
  };
  const ns = payOpen ? nextStep(o, pm, ctx.ptasks) : null;
  const plan = !ns ? null : o.pay === "inkasso" ? [ns.label, ""] : [ns.label, ns.auto ? "automatisch · " + (ns.sub || "geplant") : "als Nächstes · manuell"];
  return (
    <>
      <h3 style={{ paddingBottom: 2 }}>Mail-Verlauf</h3>
      <p className="shp">Alle Mails an {o.email} – automatische und von euch gesendete.</p>
      <div className="opts">
        {!pm ? <div className="aopt"><Loader className="spin" />Lädt …</div> : (
          <>
            {plan ? <div className="aopt"><span className="ico" style={{ color: "var(--primary)" }}><Clock /></span><span className="ol">{plan[0]}</span><span className="c">{plan[1]}</span></div> : null}
            {pm.mails.length ? pm.mails.map((x) => (
              React.createElement(x.hasHtml ? "button" : "div", { key: x.id, type: x.hasHtml ? "button" : undefined, className: "aopt", disabled: x.hasHtml ? busy === String(x.id) : undefined, onClick: x.hasHtml ? () => show(x) : undefined },
                <span className="ico">{busy === String(x.id) ? <Loader className="spin" /> : <Check />}</span>,
                <span className="ol">{x.label}<br /><small>{x.auto ? "automatisch" : "von euch gesendet"}</small></span>,
                <span className="c">{Date.now() - new Date(x.ts).getTime() < 120000 ? "gerade eben" : dTime(x.ts)}</span>,
                x.hasHtml ? <Eye className="chev" style={{ width: 16, height: 16, marginLeft: 8 }} /> : null)
            )) : <div className="aopt"><span className="ol" style={{ color: "var(--g3)" }}>Noch keine Mail an den Kunden.</span></div>}
          </>
        )}
      </div>
    </>
  );
}


/** Eigener Bereich „Mail-Verlauf" (wie Dashboard-Aktivität): alle Mails an den Kunden, nach Tag gruppiert. */
const dayLbl = (iso) => { const d = new Date(iso), t = new Date(); const n = Math.round((new Date(t.toDateString()) - new Date(d.toDateString())) / 864e5); return n === 0 ? "Heute" : n === 1 ? "Gestern" : n < 7 ? `Vor ${n} Tagen` : d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }); };
const hhmm = (iso) => new Date(iso).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
export function MailsScreen({ ctx, id, payOpen }) {
  const { orders, back, isDesk } = ctx;
  const o = orders.find((x) => x.id === id);
  const pm = usePayMails(o || { id });
  const [busy, setBusy] = React.useState("");
  if (!o) return null;
  const isOpen = payOpen ? payOpen(o) : false;
  const ns = isOpen ? nextStep(o, pm, ctx.ptasks) : null;
  const show = async (x) => {
    if (!x.hasHtml) return;
    setBusy(String(x.id));
    try {
      const r = await fetchEmailPreview(x.id);
      if (r && r.ok && r.html) ctx.openViewer({ keep: true, html: r.html, title: r.subject || x.label, sub: "Gesendet " + dTime(x.ts) + " · an " + o.email });
      else ctx.toast((r && r.error) || "Keine Kopie gespeichert");
    } catch (e) { ctx.toast("Vorschau: " + e.message); }
    setBusy("");
  };
  const mails = pm ? pm.mails : [];
  const days = [];
  for (const m of mails) { const l = dayLbl(m.ts); if (!days.length || days[days.length - 1][0] !== l) days.push([l, []]); days[days.length - 1][1].push(m); }
  const nAuto = mails.filter((m) => m.auto).length;
  return (
    <>
      <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={back}><ArrowLeft /></button></div>
      <div className="dh"><div><h1>Mail-Verlauf</h1><p>{o.id} · {o.name || o.email} · {o.email}</p></div></div>
      <div className="rsum">
        <div><b>{pm ? mails.length : "–"}</b><span>Mails</span></div>
        <div><b>{pm ? nAuto : "–"}</b><span>Automatisch</span></div>
        <div><b style={{ fontSize: 18, lineHeight: 1.6 }}>{mails[0] ? dShort(mails[0].ts) : "—"}</b><span>Zuletzt</span></div>
      </div>
      {ns ? (
        <>
          <div className="lbl" style={{ marginTop: 18 }}>Als Nächstes</div>
          <div className="card atl">
            <div className="ae"><span className="ad" style={{ color: "var(--primary)" }}><Clock /></span>
              <div className="t"><b>{ns.label}</b><span>{o.pay === "inkasso" ? "" : ns.auto ? "automatisch" + (ns.sub ? " · " + ns.sub : "") : "von euch (Hauptbutton im Auftrag)"}</span></div></div>
          </div>
        </>
      ) : null}
      {!pm ? <p className="sh" style={{ marginTop: 18 }}><Loader className="spin" /> Lädt …</p> : !mails.length ? <p className="sh" style={{ marginTop: 18 }}>Noch keine Mail an den Kunden.</p> : null}
      {days.map(([l, list]) => (
        <React.Fragment key={l}>
          <div className="lbl" style={{ marginTop: 18 }}>{l}</div>
          <div className="card atl">
            {list.map((m) => (
              <button key={m.id} type="button" className="ae" disabled={!m.hasHtml} onClick={() => show(m)} style={{ width: "100%", textAlign: "left" }}>
                <span className="ad" style={{ color: m.auto ? "var(--info)" : "var(--ink)" }}>{busy === String(m.id) ? <Loader className="spin" /> : <Mail />}</span>
                <div className="t"><b>{m.label}</b><span>{m.auto ? "automatisch" : "von euch gesendet"}{m.hasHtml ? " · tippen zum Ansehen" : ""}</span></div>
                <span className="ah">{hhmm(m.ts)}</span>
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
      {isDesk ? null : <div style={{ height: 8 }} />}
    </>
  );
}
