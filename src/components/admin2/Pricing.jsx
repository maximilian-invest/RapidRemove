"use client";
/* Mehr → Kunden & Preise (10/2026)
   - Kunden-Dashboard anlegen: Konto + Login-Link per Mail (ohne Auftrag), Stammdaten (Name, Firma, Sprache)
   - je Kunde: fester Partner (alle Aufträge dieses Kunden gehen dorthin), eigene Kunden-Staffel + Software-Preis,
     eigene Partner-Staffel (USD) + Partner-Software-Preis. Kunde sieht nur seine Preise, Partner nur seine.
   - Standard-Staffel für Bulk-Uploads aller Kunden ohne eigene Preise, Schalter „Neue Bestellung" im Dashboard. */
import React from "react";
import { ArrowLeft, Plus, Trash2, ChevronRight, X, Send, ExternalLink, UserPlus, Check } from "lucide-react";
import { pricingInfo, pricingDefault, pricingCustomer, pricingNewOrder, pricingInvite, custImpersonate } from "@/lib/admin-api";

const sym = (cur) => (cur === "usd" ? "$" : "€");
const LANGS = [["de", "Deutsch"], ["en", "Englisch"], ["es", "Spanisch"], ["fr", "Französisch"], ["it", "Italienisch"], ["nl", "Niederländisch"], ["pt", "Portugiesisch"], ["sv", "Schwedisch"], ["da", "Dänisch"], ["no", "Norwegisch"], ["ja", "Japanisch"]];
const SVC = { std: "neu", old: "alt", sw: "Software", profile: "Profile" };
const toRows = (tiers) => (tiers && tiers.length ? tiers.map((t) => ({ upTo: t.upTo == null ? "" : String(t.upTo), price: String(t.price) })) : [{ upTo: "50", price: "" }, { upTo: "", price: "" }]);
const fromRows = (rows) => rows.map((r, i) => ({ upTo: i === rows.length - 1 ? null : r.upTo, price: r.price }));
const nOf = (v) => { const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : NaN; };
const tierAt = (tiers, n) => { for (const t of tiers) if (t.upTo == null || n <= t.upTo) return t.price; return tiers[tiers.length - 1].price; };
const rowsTiers = (rows) => { try { const t = fromRows(rows).map((x) => ({ upTo: x.upTo === null || x.upTo === "" ? null : nOf(x.upTo), price: nOf(x.price) })); return t.every((x) => x.price > 0) ? t : null; } catch (e) { return null; } };
const range = (tiers, cur) => { const ps = (tiers || []).map((t) => t.price); return ps.length ? (Math.max(...ps) === Math.min(...ps) ? `${sym(cur)}${ps[0]}` : `${sym(cur)}${Math.max(...ps)}–${Math.min(...ps)}`) : ""; };
export const tierSummary = (tiers, cur) => (tiers || []).map((t, i, a) => `${t.upTo == null ? `ab ${(a[i - 1] ? a[i - 1].upTo + 1 : 1)}` : `bis ${t.upTo}`}: ${sym(cur)}${t.price}`).join(" · ");
const dt = (v) => (v ? new Date(v).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "");

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
function SwRow({ value, set, cur, label }) {
  return (
    <div className="pr-row pr-swr">
      <span className="pr-lab">{label}</span>
      <span className="pr-p">{sym(cur)} <input className="po-num" inputMode="decimal" placeholder="–" value={value} onChange={(e) => set(e.target.value.replace(/[^\d.,]/g, ""))} /></span>
      <span className="pr-sp" />
    </div>
  );
}
function CurSeg({ cur, setCur }) {
  return <div className="pr-seg">{[["eur", "€ Euro"], ["usd", "$ Dollar"]].map(([k, l]) => <button key={k} type="button" className={cur === k ? "on" : ""} onClick={() => setCur(k)}>{l}</button>)}</div>;
}
function Toggle({ on, set, title, sub }) {
  return (
    <button type="button" className="ir pr-tg" onClick={() => set(!on)}>
      <span className="t"><b>{title}</b><span>{sub}</span></span>
      <span className={"tg" + (on ? " on" : "")}><i /></span>
    </button>
  );
}

/* Marge je Stufe (nur wenn Kunde in USD und beide Staffeln gesetzt) – nur für dich im Admin. */
function Margin({ ct, pt, csw, psw }) {
  if (!ct || !pt) return null;
  const pts = [...new Set([...ct.map((t) => t.upTo), ...pt.map((t) => t.upTo)].filter((x) => x != null))].sort((a, b) => a - b);
  const ns = [...pts, (pts[pts.length - 1] || 0) + 1];
  const rows = []; let from = 1;
  for (const n of ns) { const isLast = n === ns[ns.length - 1]; rows.push({ label: isLast ? `ab ${from}` : `${from}–${n}`, c: tierAt(ct, n), p: tierAt(pt, n) }); from = n + 1; }
  return (
    <div className="pr-mg">
      <div className="pr-mh"><span>Menge</span><span>Kunde</span><span>Partner</span><span>Marge</span></div>
      {rows.map((r, i) => <div key={i} className="pr-mr"><span>{r.label}</span><span>${r.c}</span><span>${r.p}</span><b>${Math.round((r.c - r.p) * 100) / 100}</b></div>)}
      {csw > 0 && psw > 0 ? <div className="pr-mr"><span>Software</span><span>${csw}</span><span>${psw}</span><b>${Math.round((csw - psw) * 100) / 100}</b></div> : null}
    </div>
  );
}

function CustomerEdit({ init, def, partners, onClose, onSaved, toast }) {
  const isNew = !init;
  const [email, setEmail] = React.useState(init ? init.email : "");
  const [name, setName] = React.useState((init && init.name) || "");
  const [company, setCompany] = React.useState((init && init.company) || "");
  const [lang, setLang] = React.useState((init && init.lang) || "en");
  const [pid, setPid] = React.useState(init && init.partnerId ? String(init.partnerId) : "");
  const [own, setOwn] = React.useState(isNew ? true : !!(init && init.tiers));
  const [cur, setCur] = React.useState((init && init.cur) || (def && def.cur) || "usd");
  const [rows, setRows] = React.useState(toRows((init && init.tiers) || (def && def.tiers)));
  const [sw, setSw] = React.useState(init && init.sw ? String(init.sw) : "");
  const [pOwn, setPOwn] = React.useState(isNew ? true : !!(init && init.partner && init.partner.tiers));
  const [pRows, setPRows] = React.useState(toRows(init && init.partner && init.partner.tiers));
  const [pSw, setPSw] = React.useState(init && init.partner && init.partner.sw ? String(init.partner.sw) : "");
  const [note, setNote] = React.useState((init && init.note) || "");
  const [invite, setInvite] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const p = partners.find((x) => String(x.id) === pid);
  const save = async (extra = {}) => {
    setBusy(true);
    try {
      const j = await pricingCustomer({ email: email.trim(), name, company, lang, partnerId: pid || null,
        tiers: own ? fromRows(rows) : null, cur: own ? cur : null, sw: own && sw.trim() ? sw.trim() : null,
        partnerTiers: pOwn ? fromRows(pRows) : null, partnerSw: pSw.trim() ? pSw.trim() : null, note, ...extra });
      toast(j.invited ? "Dashboard angelegt · Login-Link an " + email.trim() + " gesendet" : j.account ? "Dashboard angelegt" : "Gespeichert");
      onSaved();
    } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try { await pricingCustomer({ email: init.email, remove: true }); toast("Eintrag entfernt – Konto bleibt, es gelten wieder Standardpreise und die normale Zuteilung"); onSaved(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const sendLink = async () => {
    setBusy(true);
    try { await pricingInvite(init.email); toast("Login-Link an " + init.email + " gesendet"); onSaved(); } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const openDash = async () => {
    const w = window.open("", "_blank");
    try { const j = await custImpersonate(init.email); if (w) w.location.href = j.url; else window.location.href = j.url; }
    catch (e) { if (w) w.close(); toast("Fehler: " + e.message); }
  };
  const ct = own && cur === "usd" ? rowsTiers(rows) : null;
  return (
    <div className="card pr-card">
      <div className="pr-hd"><b>{init ? init.company || init.name || init.email : "Kunden-Dashboard anlegen"}</b><button type="button" className="circ" aria-label="Schließen" onClick={onClose}><X /></button></div>
      {init ? <div className="pr-st">{init.email}{" · "}{init.account ? <>Konto ✓{init.lastLogin ? ` · zuletzt eingeloggt ${dt(init.lastLogin)}` : " · noch nie eingeloggt"}</> : "noch kein Konto"}{init.invitedAt ? ` · Link gesendet ${dt(init.invitedAt)}` : ""}{` · ${init.orders} Auftr${init.orders === 1 ? "ag" : "äge"}`}</div> : null}

      <div className="pr-sec">1 · Kunde</div>
      {isNew ? <label className="pfld"><span>E-Mail (Login fürs Dashboard)</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kunde@firma.com" /></label> : null}
      <div className="pr-two">
        <label className="pfld"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Rumaan Robe" /></label>
        <label className="pfld"><span>Firma</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="optional" /></label>
      </div>
      <label className="pfld"><span>Sprache (Dashboard + Mails)</span><select className="pr-sel" value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>

      <div className="pr-sec">2 · Partner</div>
      <label className="pfld"><span>Aufträge dieses Kunden gehen an</span>
        <select className="pr-sel" value={pid} onChange={(e) => setPid(e.target.value)}>
          <option value="">Normale Zuteilung (Mehr → Partner)</option>
          {partners.map((x) => <option key={x.id} value={x.id}>{x.name}{x.active ? "" : " (inaktiv)"}</option>)}
        </select>
      </label>
      {p ? <p className="sh">{p.name} macht: {p.services.map((k) => SVC[k] || k).join(", ") || "noch nichts freigegeben"}. Was {p.name} nicht macht, geht an die normale Zuteilung.{p.active ? "" : " Achtung: Partner ist gerade inaktiv – solange gilt die normale Zuteilung."}</p> : null}

      <div className="pr-sec">3 · Preise Kunde <em>sieht der Kunde</em></div>
      <Toggle on={own} set={setOwn} title="Eigene Staffel" sub={own ? "Gilt für Bulk-Uploads und Bestellungen von Hand" : "Aus – es gilt die Standard-Staffel (nur Bulk)"} />
      {own ? <><CurSeg cur={cur} setCur={setCur} /><TierEditor rows={rows} setRows={setRows} cur={cur} /><SwRow value={sw} set={setSw} cur={cur} label="Spezialfall (Software)" /></> : null}

      <div className="pr-sec">4 · Preise Partner <em>sieht nur der Partner, nie der Kunde</em></div>
      <Toggle on={pOwn} set={setPOwn} title="Eigene Partner-Staffel (USD)" sub={pOwn ? "Je gelöschter Bewertung – Stufe nach derselben Anzahl wie beim Kunden" : "Aus – normaler Partnerpreis je Leistung"} />
      {pOwn ? <TierEditor rows={pRows} setRows={setPRows} cur="usd" /> : null}
      <SwRow value={pSw} set={setPSw} cur="usd" label="Spezialfall (Software)" />
      {ct && pOwn ? <Margin ct={ct} pt={rowsTiers(pRows)} csw={nOf(sw)} psw={nOf(pSw)} /> : null}

      <label className="pfld" style={{ marginTop: 14 }}><span>Notiz (nur intern)</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Vereinbarung vom …" /></label>
      {isNew ? <button type="button" className="ir pr-tg" onClick={() => setInvite(!invite)}><span className="t"><b>Login-Link gleich per Mail senden</b><span>{invite ? "Kunde bekommt „Ihr persönliches Dashboard ist da“ mit Ein-Klick-Login" : "Aus – du schickst den Link später"}</span></span><span className={"tg" + (invite ? " on" : "")}><i /></span></button> : null}
      <div className="ctas2">
        {init ? <button type="button" className="cta gh" disabled={busy} onClick={remove}>Entfernen</button> : <button type="button" className="cta gh" disabled={busy} onClick={onClose}>Abbrechen</button>}
        <button type="button" className="cta" disabled={busy || !email.includes("@")} onClick={() => save(isNew ? { create: true, invite } : {})}>{busy ? "Speichere …" : isNew ? <><UserPlus />Dashboard anlegen</> : <><Check />Speichern</>}</button>
      </div>
      {init ? (
        <div className="ctas2" style={{ marginTop: 8 }}>
          <button type="button" className="cta gh" disabled={busy} onClick={sendLink}><Send />Login-Link senden</button>
          <button type="button" className="cta gh" disabled={busy || !init.account} onClick={openDash}><ExternalLink />Dashboard öffnen</button>
        </div>
      ) : null}
    </div>
  );
}

export default function PricingScreen({ ctx }) {
  const { setMoreSub, toast } = ctx;
  const [d, setD] = React.useState(null);
  const [cur, setCur] = React.useState("usd");
  const [rows, setRows] = React.useState(toRows(null));
  const [sw, setSw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [edit, setEdit] = React.useState(null); // null | "new" | customer
  const [q, setQ] = React.useState("");
  const load = React.useCallback(() => pricingInfo().then((j) => { setD(j); if (j.def) { setCur(j.def.cur); setRows(toRows(j.def.tiers)); setSw(j.def.sw ? String(j.def.sw) : ""); } }).catch((e) => toast("Fehler: " + e.message)), [toast]);
  React.useEffect(() => { load(); }, [load]);
  const saveDef = async () => {
    setBusy(true);
    try { await pricingDefault(cur, fromRows(rows), sw.trim() || null); toast("Standard-Staffel gespeichert"); load(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const toggleNo = async () => { try { const j = await pricingNewOrder(!d.newOrder); setD((x) => ({ ...x, newOrder: j.newOrder })); } catch (e) { toast("Fehler: " + e.message); } };
  const partners = (d && d.partners) || [];
  const pName = (id) => (partners.find((x) => x.id === id) || {}).name || "Partner " + id;
  const list = ((d && d.customers) || []).filter((c) => { const v = q.trim().toLowerCase(); return !v || [c.email, c.name, c.company].some((x) => String(x || "").toLowerCase().includes(v)); });
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Kunden & Preise</div>
      {!d ? <div className="aempty"><b>Lädt …</b></div> : (
        <>
          <div className="sec3"><h2>Kunden-Dashboards</h2><button type="button" className="lk" onClick={() => setEdit("new")}><Plus />Anlegen</button></div>
          <p className="sh">Dashboard für einen Kunden anlegen: Partner festlegen, Preise für Kunde und Partner. Der Kunde sieht nur seine Preise, der Partner nur seine.</p>
          {edit === "new" ? <CustomerEdit def={d.def} partners={partners} toast={toast} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /> : null}
          {(d.customers || []).length > 6 ? <label className="pfld"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kunde suchen (Name, Firma, E-Mail)" /></label> : null}
          {list.length ? (
            <div className="info">
              {list.map((c) => (edit && edit.email === c.email ? (
                <div key={c.email} style={{ padding: 8 }}><CustomerEdit init={c} def={d.def} partners={partners} toast={toast} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} /></div>
              ) : (
                <button key={c.email} type="button" className="ir" onClick={() => setEdit(c)}>
                  <span className="t"><b>{c.company || c.name || c.email}</b>
                    <span>{c.company || c.name ? c.email + " · " : ""}{c.partnerId ? pName(c.partnerId) : "normale Zuteilung"}{" · "}{c.tiers ? `Kunde ${range(c.tiers, c.cur)}` : "Standard-Staffel"}{c.partner && c.partner.tiers ? ` · Partner ${range(c.partner.tiers, "usd")}` : ""}{!c.account ? " · noch kein Konto" : c.lastLogin ? "" : " · noch nie eingeloggt"}</span></span>
                  <ChevronRight />
                </button>
              )))}
            </div>
          ) : edit !== "new" ? <div className="aempty"><b>Noch keine Kunden-Dashboards angelegt</b></div> : null}

          <div className="sec3"><h2>Standard-Staffel</h2></div>
          <p className="sh">Gilt für Bulk-Uploads aller Kunden ohne eigene Preise. Preis je gelöschter Bewertung – die Stufe richtet sich nach der Anzahl im Upload. Der Kunde sieht die Staffel und seine Stufe beim Hochladen.{!d.def ? " Noch nicht festgelegt – bis dahin gelten die normalen Preise." : ""}</p>
          <div className="card pr-card">
            <CurSeg cur={cur} setCur={setCur} />
            <TierEditor rows={rows} setRows={setRows} cur={cur} />
            <SwRow value={sw} set={setSw} cur={cur} label="Spezialfall (Software)" />
            <button type="button" className="cta" style={{ marginTop: 12 }} disabled={busy} onClick={saveDef}>{busy ? "Speichere …" : "Standard-Staffel speichern"}</button>
          </div>

          <div className="info" style={{ marginTop: 18 }}>
            <button type="button" className="ir" onClick={toggleNo}>
              <span className="t"><b>„Neue Bestellung" im Kunden-Dashboard</b><span>{d.newOrder ? "An – alle Kunden können von Hand oder per Bulk-Upload bestellen" : "Aus – nur Test-Konten"}</span></span>
              <span className={"tg" + (d.newOrder ? " on" : "")}><i /></span>
            </button>
          </div>
        </>
      )}
    </>
  );
}
