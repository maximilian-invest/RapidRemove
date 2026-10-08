"use client";
/* Neues Admin — Sheet „Mahnung senden": Stufe selbst wählen, Verlauf (was der Kunde schon bekommen hat)
   und Vorschau genau so, wie der Kunde die Mail bekommt. Versand über dieselben Endpunkte wie das bisherige Admin:
   Profil  → /admin/paylink (template „mahnung", Stripe-Link, Stufe 1–4) bzw. PayPal/Wise-Mahnung (Text, Stufe 1–4)
   Bewertungen → /admin/reviews-mahnung (gelöschte Bewertungen, Stufe 1–3). */
import React from "react";
import { Send, Eye, Check, Loader, AlertTriangle, Mail } from "lucide-react";
import { fetchEvents, fetchEmailPreview, payLinkMail, templateMail, reviewsMahnungMail, setOrderStatus } from "@/lib/admin-api";
import { computeOffer, money, cur } from "./model";

export const PROFILE_STAGES = [
  [1, "Zahlungserinnerung", "Freundlich, mit Zahlungslink"],
  [2, "2. Erinnerung", "Bestimmter, Frist zur Zahlung"],
  [3, "Mahnung", "Androhung Inkasso + Wiederherstellung"],
  [4, "Letzte Mahnung", "Zahlung heute – sonst Reaktivierung + Inkasso"],
];
export const REVIEW_STAGES = [
  [1, "Zahlungserinnerung", "Freundlich, Zahlung binnen 48 h"],
  [2, "2. Mahnung", "Bestimmter, Zahlung binnen 48 h"],
  [3, "Letzte Mahnung", "Bewertungen gehen wieder online + Inkasso"],
];
const MAHN_RE = /mahnung|zahlungserinnerung/i;
const stageOf = (t) => { const m = String(t || "").match(/Stufe\s*(\d)/i); return m ? Number(m[1]) : null; };
const fmtDT = (iso) => {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Zahlungsweg wie im bisherigen Admin: Wise/PayPal (10 % Rabatt) → Text-Mahnung ohne Stripe-Link. */
function payMethodOf(o) {
  if (o.service === "reviews") return o.payPref === "wise" ? "wise" : o.paypal ? "paypal" : null;
  return (o.lang || "de") === "de" ? null : o.payPref === "wise" ? "wise" : o.paypal ? "paypal" : null;
}
/** Bewertungs-Mahnung: abgerechnete (gelöschte) Bewertungen, sonst alle eingereichten. */
function reviewsPayload(o) {
  const items = (o.reviewsRemoved && o.reviewsRemoved.length) ? o.reviewsRemoved : (o.reviewItems || []);
  const orderedN = (o.reviewsAccepted && o.reviewsAccepted.length) || (o.reviewItems && o.reviewItems.length) || items.length;
  return { orderId: o.id, email: o.email, name: o.name, lang: o.lang, currency: o.country === "US" ? "usd" : "eur", removedItems: items, submittedCount: orderedN, method: payMethodOf(o) || undefined };
}
function profilePayload(o, stage) {
  const c = o.country === "US" ? "$" : "€";
  const label = o.protection ? ((o.protection === "lifetime" ? "Lebenslanger Schutz" : o.protection === "monitor" ? "Schutz + Tägliche Überwachung" : "Monatlicher Schutz") + (o.protAmount ? " – " + money(o.protAmount, c) + (o.protection !== "lifetime" ? "/Mon." : "") : "")) : "";
  return {
    email: o.email, name: o.name, orderId: o.id, currency: o.country === "US" ? "usd" : "eur", service: o.service, protection: o.protection || "none",
    serviceAmount: o.amount || 0, protAmount: (o.protection && o.protAmount) ? o.protAmount : 0, protType: o.protection || "",
    total: (o.amount || 0) + (o.protection && o.protAmount ? o.protAmount : 0), protectionLabel: label, express: !!o.express,
    expressLabel: o.express ? ("Express-Bearbeitung (≤6 h)" + (o.expressAmount ? " · +" + money(o.expressAmount, c) : "")) : undefined,
    lang: o.lang || "de", template: "mahnung", stage,
  };
}
async function mahnRequest(o, stage, preview) {
  const method = payMethodOf(o);
  if (o.service === "reviews") return reviewsMahnungMail({ ...reviewsPayload(o), stage, preview });
  if (method) return templateMail({ key: method === "wise" ? "wise-mahnung" : "paypal-mahnung", to: o.email, orderId: o.id, lang: o.lang || "de", name: o.name || "", service: o.service, offer: computeOffer(o), stage, preview });
  return payLinkMail({ ...profilePayload(o, stage), preview });
}

export function MahnSheet({ o, ctx, close, initialStage, direct }) {
  const { toast, openViewer, patchOrder } = ctx;
  const isRev = o.service === "reviews";
  const STAGES = isRev ? REVIEW_STAGES : PROFILE_STAGES;
  const method = payMethodOf(o);
  const [events, setEvents] = React.useState(null);
  const [stage, setStage] = React.useState(initialStage || null);
  const [busy, setBusy] = React.useState("");
  const [confirm, setConfirm] = React.useState(!!direct); // Hauptbutton im Auftrag → direkt „senden?“ mit Vorschau-Möglichkeit
  const load = React.useCallback(() => fetchEvents(o.id, o.email).then(setEvents).catch(() => setEvents([])), [o.id, o.email]);
  React.useEffect(() => { load(); }, [load]);
  const sent = (events || []).filter((e) => MAHN_RE.test(e.t) || /zahlungslink gesendet/i.test(e.t));
  const mahn = sent.filter((e) => MAHN_RE.test(e.t));
  const maxSent = mahn.reduce((m, e) => Math.max(m, stageOf(e.t) || 0), 0) || mahn.length;
  const next = Math.min(maxSent + 1, STAGES.length);
  const cur0 = stage || next;
  const lastTs = mahn.reduce((m, e) => Math.max(m, e.ts ? new Date(e.ts).getTime() : 0), 0);
  const recent = lastTs && Date.now() - lastTs < 6 * 3600 * 1000;
  const sentAt = (k) => mahn.filter((e) => stageOf(e.t) === k).map((e) => e.ts).sort().pop();
  const st = STAGES.find((s) => s[0] === cur0);
  const amount = isRev ? null : (o.amount || 0) + (o.protection && o.protAmount ? o.protAmount : 0);

  const showSent = async (e) => {
    setBusy("ev" + e.id);
    try {
      const r = await fetchEmailPreview(e.id);
      if (r && r.ok && r.html) openViewer({ keep: true, html: r.html, title: r.subject || e.t, sub: "Gesendet " + fmtDT(e.ts) + " · an " + o.email });
      else toast((r && r.error) || "Keine Kopie gespeichert");
    } catch (err) { toast("Vorschau: " + err.message); }
    setBusy("");
  };
  const preview = async () => {
    setBusy("pv");
    try { const r = await mahnRequest(o, cur0, true); openViewer({ keep: true, html: r.html, title: r.subject, sub: "Vorschau · Stufe " + cur0 + " · so bekommt es " + (o.name || o.email) }); }
    catch (e) { toast("Vorschau fehlgeschlagen: " + e.message); }
    setBusy("");
  };
  const send = async () => {
    setBusy("send");
    try {
      await mahnRequest(o, cur0, false);
      try { await setOrderStatus({ orderId: o.id, status: "done", pay: "mahnung", noEvent: o.status === "done" }); patchOrder(o.id, { status: "done", pay: "mahnung", doneAt: o.doneAt || new Date().toISOString(), mahnungCount: (o.mahnungCount || 0) + 1 }); } catch (e) { /* Mail ist raus */ }
      toast(`${st[1]} an ${o.name || o.email} gesendet`);
      close();
    } catch (e) { toast("Senden fehlgeschlagen: " + e.message); setBusy(""); }
  };

  if (confirm) {
    return (
      <>
        <span className={"shx" + (cur0 >= 3 ? "" : " soft")}>{cur0 >= 3 ? <AlertTriangle /> : <Send />}</span>
        <h3 style={{ paddingBottom: 6 }}>{st[1]} senden?</h3>
        <p className="shp">An <b>{o.name || o.email}</b> ({o.email}) · Stufe {cur0} von {STAGES.length}{method ? ` · ${method === "wise" ? "Wise" : "PayPal"}-Text (ohne Stripe-Link)` : ""}. {st[2]}.</p>
        {recent ? <p className="shn warn"><AlertTriangle />Die letzte Mahnung ging erst {fmtDT(new Date(lastTs).toISOString())} raus – so kurz danach kann den Kunden verärgern.</p> : null}
        <button type="button" className="lnkb" disabled={!!busy} onClick={preview} style={{ marginBottom: 6 }}><Eye />{busy === "pv" ? "Lädt …" : "Vorschau ansehen"}</button>
        <div className="ctas2"><button type="button" className="cta gh" onClick={() => setConfirm(false)}>{direct ? "Andere Stufe" : "Zurück"}</button>
          <button type="button" className={"cta" + (cur0 >= 3 ? " red" : " or")} disabled={!!busy} onClick={send}><Send />{busy === "send" ? "Sendet …" : "Jetzt senden"}</button></div>
      </>
    );
  }
  return (
    <>
      <h3 style={{ paddingBottom: 2 }}>Mahnung senden</h3>
      <p className="shp">{o.name || o.email} · {o.id}{amount ? " · " + money(amount, cur(o)) : ""}{method ? ` · zahlt per ${method === "wise" ? "Wise" : "PayPal"}` : ""}</p>

      <p className="shl">Bisher gesendet</p>
      <div className="mhist">
        {events === null ? <div className="mh-e"><Loader className="spin" />Lädt …</div>
          : !sent.length ? <div className="mh-e">Noch keine Zahlungserinnerung oder Mahnung gesendet.</div>
          : sent.slice().sort((a, b) => String(a.ts).localeCompare(String(b.ts))).map((e) => {
            const k = stageOf(e.t);
            return (
              <div key={e.id} className="mh">
                <span className={"mh-dot" + (k >= 3 ? " hot" : "")}>{k || <Mail />}</span>
                <span className="t"><b>{e.t.replace(/ gesendet/i, "").replace(/^Mahnung( \(Bewertungen\))? · /, "")}</b><span>{fmtDT(e.ts)}</span></span>
                {e.hasHtml ? <button type="button" className="mh-v" disabled={busy === "ev" + e.id} onClick={() => showSent(e)}>{busy === "ev" + e.id ? <Loader className="spin" /> : <Eye />}Ansehen</button> : <span className="mh-n">keine Kopie</span>}
              </div>
            );
          })}
      </div>

      <p className="shl" style={{ paddingTop: 16 }}>Stufe wählen</p>
      <div className="opts">
        {STAGES.map(([k, l, d]) => {
          const at = sentAt(k);
          return (
            <button key={k} type="button" className={"aopt mst" + (cur0 === k ? " sel" : "")} onClick={() => setStage(k)}>
              <span className={"ico stn" + (k >= 3 ? " hot" : "")}>{k}</span>
              <span className="ol">{l}{k === next && !at ? <em className="rec">empfohlen</em> : null}<br /><small>{at ? "✓ gesendet " + fmtDT(at) : d}</small></span>
              {cur0 === k ? <span className="ck"><Check /></span> : null}
            </button>
          );
        })}
      </div>
      <div className="ctas2" style={{ marginTop: 14 }}>
        <button type="button" className="cta gh" disabled={!!busy} onClick={preview}>{busy === "pv" ? <Loader className="spin" /> : <Eye />}Vorschau</button>
        <button type="button" className={"cta" + (cur0 >= 3 ? " red" : " or")} disabled={!!busy || !o.email} onClick={() => setConfirm(true)}><Send />Stufe {cur0} senden</button>
      </div>
    </>
  );
}
