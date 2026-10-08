"use client";
/* Neues Admin — „Zahlung offen" im Auftrag (Design-Handoff Okt 2026, rapid_new_launch_13):
   - EIN schwarzer Hauptbutton, eskaliert nach Stufe (Zahlungslink → Erinnerung → … → Mahnung → An Inkasso übergeben)
   - Textlink „Zahlung bereits erhalten?" (2× tippen)
   - Info-Zeilen „Zahlungsziel" und „Mail-Verlauf · n gesendet" mit eigenen Sheets.
   Versand läuft über das bestehende Mahnungs-Sheet (Vorschau + „Jetzt senden"), Zahlungsziel über /admin/pay-due:
   läuft es ohne Zahlung ab, geht automatisch die Zahlungsziel-Mail raus. Weitere Mahnungen sendet ihr selbst. */
import React from "react";
import { Bell, Send, Gavel, CircleCheck, CheckCircle2, CalendarClock, Mail, ChevronRight, Clock, Check, Eye, Loader, Receipt, CreditCard } from "lucide-react";
import { fetchEvents, fetchEmailPreview, setPayDue, setOrderStatus } from "@/lib/admin-api";
import { PROFILE_STAGES, REVIEW_STAGES } from "./Mahnung";

const stageOf = (t) => { const m = String(t || "").match(/Stufe\s*(\d)/i); return m ? Number(m[1]) : null; };
const dShort = (iso) => new Date(iso).toLocaleDateString("de-AT", { weekday: "short", day: "2-digit", month: "2-digit" });
const dTime = (iso) => { const d = new Date(iso); return d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) + ", " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); };

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
  const mahn = sent.filter((x) => x.kind === "mahn" || x.kind === "due");
  const level = Math.max(0, ...mahn.map((x) => x.stage || 0)) || (mahn.length ? 1 : 0);
  return { sent, level, linkSent: sent.some((x) => x.kind === "link") || !!o.paylinkSent, stages: ST };
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
  const next = !pm ? "" : o.pay === "inkasso" ? "bei Inkasso"
    : pd && !pd.sent ? `Zahlungsziel-Mail am ${dShort(pd.at)}`
    : pm.level < pm.stages.length ? `Nächste: ${pm.stages[pm.level][1]} · manuell` : "Nächste: Inkasso-Übergabe";
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
      <button type="button" className="ir" onClick={() => ctx.openSheet({ kind: "mailhist", forId: o.id })}>
        <span className="ico"><Mail /></span>
        <span className="t"><span>Mail-Verlauf · {pm ? pm.sent.length : "…"} gesendet</span><b>{next || "…"}</b></span>
        <ChevronRight />
      </button>
    </>
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
export function MailHistSheet({ o, ctx }) {
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
  const plan = !pm ? null : o.pay === "inkasso" ? ["An Inkasso übergeben", ""]
    : pd && !pd.sent ? ["Zahlungsziel-Mail", "geplant · " + dShort(pd.at)]
    : pm.level < pm.stages.length ? [pm.stages[pm.level][1], "als Nächstes · manuell"] : ["Übergabe an Inkasso", "als Nächstes"];
  return (
    <>
      <h3 style={{ paddingBottom: 2 }}>Mail-Verlauf</h3>
      <p className="shp">An {o.email}</p>
      <div className="opts">
        {!pm ? <div className="aopt"><Loader className="spin" />Lädt …</div> : (
          <>
            {plan ? <div className="aopt"><span className="ico" style={{ color: "var(--primary)" }}><Clock /></span><span className="ol">{plan[0]}</span><span className="c">{plan[1]}</span></div> : null}
            {pm.sent.length ? pm.sent.map((x) => (
              React.createElement(x.hasHtml ? "button" : "div", { key: x.id, type: x.hasHtml ? "button" : undefined, className: "aopt", disabled: x.hasHtml ? busy === String(x.id) : undefined, onClick: x.hasHtml ? () => show(x) : undefined },
                <span className="ico">{busy === String(x.id) ? <Loader className="spin" /> : <Check />}</span>,
                <span className="ol">{x.label}</span>,
                <span className="c">{Date.now() - new Date(x.ts).getTime() < 120000 ? "gerade eben" : dTime(x.ts)}</span>,
                x.hasHtml ? <Eye className="chev" style={{ width: 16, height: 16, marginLeft: 8 }} /> : null)
            )) : <div className="aopt"><span className="ol" style={{ color: "var(--g3)" }}>Noch keine Zahlungs-Mail gesendet.</span></div>}
          </>
        )}
      </div>
    </>
  );
}
