"use client";
/* Konto → Preise & Bulk (10/2026)
   - „Neue Bestellung" im Kunden-Dashboard für alle an/aus
   - Standard-Staffel: gilt für Bulk-Uploads aller Kunden ohne eigene Preise (Preis je gelöschter Bewertung, nach Anzahl je Upload)
   - Eigene Preise je Kunde (E-Mail): eigene Staffel (gilt auch für Bestellungen von Hand) + Partnerpreis je gelöschter Bewertung (USD)
   Software-Löschungen (ohne Text / alte US-Bewertungen) sind nie in der Pauschale – dafür gilt der Spezialpreis. */
import React from "react";
import { ArrowLeft, Plus, Trash2, ChevronRight, X } from "lucide-react";
import { pricingInfo, pricingDefault, pricingCustomer, pricingNewOrder } from "@/lib/admin-api";

const sym = (cur) => (cur === "usd" ? "$" : "€");
const toRows = (tiers) => (tiers && tiers.length ? tiers.map((t) => ({ upTo: t.upTo == null ? "" : String(t.upTo), price: String(t.price) })) : [{ upTo: "50", price: "" }, { upTo: "", price: "" }]);
const fromRows = (rows) => rows.map((r, i) => ({ upTo: i === rows.length - 1 ? null : r.upTo, price: r.price }));
export const tierSummary = (tiers, cur) => (tiers || []).map((t, i, a) => `${t.upTo == null ? `ab ${(a[i - 1] ? a[i - 1].upTo + 1 : 1)}` : `bis ${t.upTo}`}: ${sym(cur)}${t.price}`).join(" · ");

/* Staffel-Editor: Zeilen „bis N Bewertungen → Preis", letzte Zeile = „darüber". */
function TierEditor({ rows, setRows, cur }) {
  const set = (i, k, v) => setRows((x) => x.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="pr-tiers">
      {rows.map((r, i) => {
        const last = i === rows.length - 1;
        const prevTo = i > 0 ? Number(rows[i - 1].upTo) : 0;
        return (
          <div key={i} className="pr-row">
            {last ? <span className="pr-lab">{rows.length > 1 ? `ab ${Number.isFinite(prevTo) && prevTo ? prevTo + 1 : "…"}` : "alle Mengen"}</span>
              : <span className="pr-lab">bis <input className="po-num" inputMode="numeric" value={r.upTo} onChange={(e) => set(i, "upTo", e.target.value.replace(/[^\d]/g, ""))} /></span>}
            <span className="pr-p">{sym(cur)} <input className="po-num" inputMode="decimal" placeholder="Preis" value={r.price} onChange={(e) => set(i, "price", e.target.value.replace(/[^\d.,]/g, ""))} /></span>
            {!last && rows.length > 2 ? <button type="button" className="circ" aria-label="Stufe entfernen" onClick={() => setRows((x) => x.filter((_, j) => j !== i))}><Trash2 /></button> : <span className="pr-sp" />}
          </div>
        );
      })}
      {rows.length < 10 ? <button type="button" className="pr-add" onClick={() => setRows((x) => [...x.slice(0, -1), { upTo: "", price: "" }, x[x.length - 1]])}><Plus />Stufe hinzufügen</button> : null}
    </div>
  );
}
function CurSeg({ cur, setCur }) {
  return <div className="pr-seg">{[["eur", "€ Euro"], ["usd", "$ Dollar"]].map(([k, l]) => <button key={k} type="button" className={cur === k ? "on" : ""} onClick={() => setCur(k)}>{l}</button>)}</div>;
}

function CustomerEdit({ init, def, onClose, onSaved, toast }) {
  const [email, setEmail] = React.useState(init ? init.email : "");
  const [own, setOwn] = React.useState(!!(init && init.tiers));
  const [cur, setCur] = React.useState((init && init.cur) || (def && def.cur) || "usd");
  const [rows, setRows] = React.useState(toRows((init && init.tiers) || (def && def.tiers)));
  const [pu, setPu] = React.useState(init && init.partnerUsd != null ? String(init.partnerUsd) : "");
  const [note, setNote] = React.useState((init && init.note) || "");
  const [busy, setBusy] = React.useState(false);
  const save = async () => {
    setBusy(true);
    try { await pricingCustomer({ email: email.trim(), tiers: own ? fromRows(rows) : null, cur: own ? cur : null, partnerUsd: pu.trim() ? pu.trim() : null, note }); toast("Gespeichert"); onSaved(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try { await pricingCustomer({ email: init.email, remove: true }); toast("Eigene Preise entfernt – es gilt wieder die Standard-Staffel"); onSaved(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  return (
    <div className="card pr-card">
      <div className="pr-hd"><b>{init ? init.email : "Kunde hinzufügen"}</b><button type="button" className="circ" aria-label="Schließen" onClick={onClose}><X /></button></div>
      {!init ? <label className="pfld"><span>E-Mail des Kunden (Dashboard-Konto)</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kunde@firma.com" /></label> : null}
      <button type="button" className="ir pr-tg" onClick={() => setOwn(!own)}>
        <span className="t"><b>Eigene Staffel</b><span>{own ? "Gilt für Bulk-Uploads und Bestellungen von Hand" : "Aus – es gilt die Standard-Staffel"}</span></span>
        <span className={"tg" + (own ? " on" : "")}><i /></span>
      </button>
      {own ? <><CurSeg cur={cur} setCur={setCur} /><TierEditor rows={rows} setRows={setRows} cur={cur} /></> : null}
      <label className="pfld" style={{ marginTop: 12 }}><span>Partnerpreis je gelöschter Bewertung (USD) – leer = normaler Partnerpreis</span><input inputMode="decimal" value={pu} onChange={(e) => setPu(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="z. B. 25" /></label>
      <label className="pfld"><span>Notiz (nur intern)</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Reseller, Vereinbarung vom …" /></label>
      <p className="sh">Software-Löschungen (reine Sternebewertungen, alte US-Bewertungen) sind nicht in der Pauschale – dort gilt der Spezialpreis.</p>
      <div className="ctas2">
        {init ? <button type="button" className="cta gh" disabled={busy} onClick={remove}>Entfernen</button> : <button type="button" className="cta gh" disabled={busy} onClick={onClose}>Abbrechen</button>}
        <button type="button" className="cta" disabled={busy || !email.includes("@")} onClick={save}>{busy ? "Speichere …" : "Speichern"}</button>
      </div>
    </div>
  );
}

export default function PricingScreen({ ctx }) {
  const { setMoreSub, toast } = ctx;
  const [d, setD] = React.useState(null);
  const [cur, setCur] = React.useState("usd");
  const [rows, setRows] = React.useState(toRows(null));
  const [busy, setBusy] = React.useState(false);
  const [edit, setEdit] = React.useState(null); // null | "new" | customer
  const [q, setQ] = React.useState("");
  const load = React.useCallback(() => pricingInfo().then((j) => { setD(j); if (j.def) { setCur(j.def.cur); setRows(toRows(j.def.tiers)); } }).catch((e) => toast("Fehler: " + e.message)), [toast]);
  React.useEffect(() => { load(); }, [load]);
  const saveDef = async () => {
    setBusy(true);
    try { await pricingDefault(cur, fromRows(rows)); toast("Standard-Staffel gespeichert"); load(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const toggleNo = async () => { try { const j = await pricingNewOrder(!d.newOrder); setD((x) => ({ ...x, newOrder: j.newOrder })); } catch (e) { toast("Fehler: " + e.message); } };
  const list = ((d && d.customers) || []).filter((c) => !q.trim() || c.email.includes(q.trim().toLowerCase()));
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Preise & Bulk</div>
      {!d ? <div className="aempty"><b>Lädt …</b></div> : (
        <>
          <div className="info">
            <button type="button" className="ir" onClick={toggleNo}>
              <span className="t"><b>„Neue Bestellung" im Kunden-Dashboard</b><span>{d.newOrder ? "An – alle Kunden können von Hand oder per Bulk-Upload bestellen" : "Aus – nur Test-Konten"}</span></span>
              <span className={"tg" + (d.newOrder ? " on" : "")}><i /></span>
            </button>
          </div>

          <div className="sec3"><h2>Standard-Staffel</h2></div>
          <p className="sh">Gilt für Bulk-Uploads aller Kunden ohne eigene Preise. Preis je gelöschter Bewertung – die Stufe richtet sich nach der Anzahl im Upload. Der Kunde sieht die Staffel und seine Stufe beim Hochladen.{!d.def ? " Noch nicht festgelegt – bis dahin gelten die normalen Preise." : ""}</p>
          <div className="card pr-card">
            <CurSeg cur={cur} setCur={setCur} />
            <TierEditor rows={rows} setRows={setRows} cur={cur} />
            <button type="button" className="cta" style={{ marginTop: 12 }} disabled={busy} onClick={saveDef}>{busy ? "Speichere …" : "Standard-Staffel speichern"}</button>
          </div>

          <div className="sec3"><h2>Eigene Preise je Kunde</h2><button type="button" className="lk" onClick={() => setEdit("new")}><Plus />Kunde</button></div>
          <p className="sh">Eigene Staffel (gilt auch für Bestellungen von Hand) und/oder eigener Partnerpreis – damit du siehst, was du dem Partner für diesen Kunden schuldest.</p>
          {edit === "new" ? <CustomerEdit def={d.def} toast={toast} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /> : null}
          {(d.customers || []).length > 6 ? <label className="pfld"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kunde suchen (E-Mail)" /></label> : null}
          {list.length ? (
            <div className="info">
              {list.map((c) => (edit && edit.email === c.email ? (
                <div key={c.email} style={{ padding: 8 }}><CustomerEdit init={c} def={d.def} toast={toast} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /></div>
              ) : (
                <button key={c.email} type="button" className="ir" onClick={() => setEdit(c)}>
                  <span className="t"><b>{c.email}</b><span>{c.tiers ? tierSummary(c.tiers, c.cur) : "Standard-Staffel"}{c.partnerUsd != null ? ` · Partner $${c.partnerUsd}` : ""}{c.note ? ` · ${c.note}` : ""}</span></span>
                  <ChevronRight />
                </button>
              )))}
            </div>
          ) : edit !== "new" ? <div className="aempty"><b>Noch keine Kunden mit eigenen Preisen</b></div> : null}
        </>
      )}
    </>
  );
}
