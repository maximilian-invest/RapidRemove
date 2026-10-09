"use client";
/* Admin · Konto → Partner: alle Lösch-Partner inkl. Bewerbungen, Detail (Freigabe, Leistungen + Preise, Pause),
   Einladungslink und Zuteilung „welcher Partner bekommt welche Aufträge automatisch". */
import React from "react";
import {
  ArrowLeft, Handshake, ChevronRight, BarChart3, Banknote, Zap, UserPlus, Check, X, Pause, Play, Copy, Loader, Mail, MessageCircle, Clock,
} from "lucide-react";
import { useHistState } from "./navHistory";
import { partnerStatusApi, partnerInviteApi, partnerRoutesApi, partnerSave } from "@/lib/admin-api";

const ST_L = { pending: ["Bewerbung", "#b26b00"], active: ["Aktiv", "var(--success)"], paused: ["Pausiert", "var(--g3)"], rejected: ["Abgelehnt", "var(--danger)"] };
const usd = (n) => "$" + Number(n || 0).toLocaleString("de-AT", { maximumFractionDigits: 2 });
const dt = (d) => (d ? new Date(d).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "");
const FLAG = (cc) => (cc && cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "");

export function svcList(partners) { return (partners && partners.services) || [{ id: "std", label: "Google-Bewertungen (bis 4 Wochen)", price: 10 }, { id: "old", label: "Google-Bewertungen (älter als 4 Wochen)", price: 40 }, { id: "sw", label: "Software-Fälle", price: 150 }, { id: "profile", label: "Ganze Google-Profile löschen", price: 50 }]; }

/* ---------------- Liste ---------------- */
export function PartnersScreen({ ctx }) {
  const { setMoreSub, partners, toast } = ctx;
  const [sub, setSub] = useHistState("psub", () => {
    try { const id = new URLSearchParams(window.location.search).get("partner"); if (id) return { v: "detail", id: Number(id) }; } catch (e) {}
    return null;
  });
  if (sub && sub.v === "detail") return <PartnerDetail ctx={ctx} id={sub.id} back={() => setSub(null)} />;
  if (sub && sub.v === "invite") return <InviteScreen ctx={ctx} back={() => setSub(null)} />;
  const list = (partners && partners.partners) || [];
  const groups = [["pending", "Neue Bewerbungen"], ["active", "Aktiv"], ["paused", "Pausiert"], ["rejected", "Abgelehnt"]];
  const svc = svcList(partners);
  const routes = (partners && partners.routes) || {};
  const routed = svc.filter((s) => routes[s.id]).length;
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Partner</div>
      {!partners ? <div className="aempty"><b>Lädt …</b></div> : null}
      <button type="button" className="cta or" style={{ marginBottom: 14 }} onClick={() => setSub({ v: "invite" })}><UserPlus />Partner einladen</button>
      <div className="info">
        <button type="button" className="ir" onClick={() => setMoreSub("settings")}><span className="ico"><Zap /></span><span className="t"><b>Zuteilung</b><span>{routed ? `${routed} von ${svc.length} Leistungen gehen automatisch an Partner` : "Keine automatische Weiterleitung"}</span></span><ChevronRight /></button>
        <button type="button" className="ir" onClick={() => setMoreSub("payouts")}><span className="ico"><Banknote /></span><span className="t"><b>Auszahlungen</b><span>Automatisch · Gutschriften · {usd(list.reduce((x, p) => x + (p.stats ? p.stats.owedUsd : 0), 0))} offen</span></span><ChevronRight /></button>
        <button type="button" className="ir" onClick={() => setMoreSub("pstats")}><span className="ico"><BarChart3 /></span><span className="t"><b>Statistiken</b><span>Zeiten, Löschquoten je Partner</span></span><ChevronRight /></button>
      </div>
      {groups.map(([k, l]) => {
        const g = list.filter((p) => p.status === k);
        if (!g.length) return null;
        return (
          <React.Fragment key={k}>
            <div className="sec3"><h2>{l}</h2><span className="px-cnt">{g.length}</span></div>
            <div className="info">
              {g.map((p) => (
                <button key={p.id} type="button" className="ir" onClick={() => setSub({ v: "detail", id: p.id })}>
                  <span className="ico" style={{ fontSize: 16 }}>{FLAG(p.country) || <Handshake />}</span>
                  <span className="t"><b>{p.name}{p.company ? " · " + p.company : ""}</b>
                    <span>{k === "pending" ? `Beworben ${dt(p.applied)} · ${(p.services || []).map((s) => (svc.find((x) => x.id === s.id) || {}).label || s.id).join(", ")}`
                      : `${Object.keys(p.approved || {}).length} Leistungen · ${p.stats.open} in Arbeit · ${p.stats.removed} gelöscht${p.stats.owedUsd ? " · " + usd(p.stats.owedUsd) + " offen" : ""}`}</span></span>
                  <ChevronRight />
                </button>
              ))}
            </div>
          </React.Fragment>
        );
      })}
      {partners && !list.length ? <div className="aempty"><b>Noch keine Partner</b>Lade einen Partner ein – er registriert sich selbst.</div> : null}
      <p className="sh">Ablauf: Einladungslink schicken → Partner registriert sich mit seinen Leistungen → hier freigeben (Leistungen + Preis je Löschung) → er richtet die Auszahlung ein → unter „Zuteilung“ festlegen, welche Aufträge er automatisch bekommt.</p>
      {toast ? null : null}
    </>
  );
}

/* ---------------- Detail ---------------- */
function PartnerDetail({ ctx, id, back }) {
  const { partners, toast, loadPartners } = ctx;
  const p = ((partners && partners.partners) || []).find((x) => x.id === id);
  const svc = svcList(partners);
  const [ap, setAp] = React.useState(null); // { svc: price | "" } – nur angehakte
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState("");
  React.useEffect(() => {
    if (!p) return;
    const applied = Object.fromEntries((p.services || []).map((s) => [s.id, s.price]));
    const base = p.status === "pending" || !Object.keys(p.approved || {}).length
      ? Object.fromEntries(Object.entries(applied).map(([k, v]) => [k, v || (svc.find((s) => s.id === k) || {}).price || ""]))
      : { ...p.approved };
    setAp(base); setNote(p.adminNote || "");
  }, [p && p.id, p && p.status]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p || !ap) return <><div className="anav"><button type="button" className="circ mbk keep" aria-label="Zurück" onClick={back}><ArrowLeft /></button></div><div className="aempty"><b>{partners ? "Partner nicht gefunden" : "Lädt …"}</b></div></>;
  const st = ST_L[p.status] || ST_L.active;
  const approvedOut = Object.fromEntries(Object.entries(ap).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)]));
  const run = async (k, fn, msg) => { setBusy(k); try { await fn(); toast(msg); if (loadPartners) await loadPartners(); } catch (e) { toast("Fehler: " + e.message); } setBusy(""); };
  const applied = Object.fromEntries((p.services || []).map((s) => [s.id, s]));
  const wa = (p.whatsapp || "").replace(/[^\d]/g, "");
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk keep" aria-label="Zurück" onClick={back}><ArrowLeft /></button></div>
      <div className="ttl">{p.name}</div>
      <p className="sh" style={{ marginTop: -6 }}><b style={{ color: st[1] }}>{st[0]}</b>{p.company ? " · " + p.company : ""}{p.country ? " · " + FLAG(p.country) + " " + p.country : ""}{p.invited ? " · eingeladen" : ""}{p.applied ? " · beworben " + dt(p.applied) : ""}</p>
      <div className="info">
        {p.email ? <a className="ir" href={"mailto:" + p.email}><span className="ico"><Mail /></span><span className="t"><b>{p.email}</b><span>E-Mail{p.login ? " · Login: " + p.login : ""}</span></span><ChevronRight /></a> : null}
        {wa ? <a className="ir" href={"https://wa.me/" + wa} target="_blank" rel="noreferrer"><span className="ico"><MessageCircle /></span><span className="t"><b>{p.whatsapp}</b><span>WhatsApp</span></span><ChevronRight /></a> : null}
        {p.capacity ? <div className="ir"><span className="ico"><Clock /></span><span className="t"><b>{p.capacity} Löschungen / Woche</b><span>Kapazität laut Bewerbung</span></span></div> : null}
        <div className="ir"><span className="ico"><Banknote /></span><span className="t"><b>{p.payoutMethod === "stripe" ? "Bankkonto (Stripe)" : p.payoutMethod === "bank" ? "Bankkonto (Airwallex)" : p.payoutMethod === "payoneer" ? "Payoneer" : "Noch nicht eingerichtet"}</b><span>Auszahlung{p.legalName ? " · " + p.legalName : ""}</span></span></div>
      </div>
      {p.about ? <><div className="sec3"><h2>Über sich</h2></div><div className="card" style={{ padding: 14, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", marginBottom: 16 }}>{p.about}</div></> : null}

      <div className="sec3"><h2>Leistungen & Preis je Löschung</h2></div>
      <div className="info">
        {svc.map((s) => {
          const on = ap[s.id] != null && ap[s.id] !== false;
          return (
            <div key={s.id} className="ir">
              <button type="button" className={"tg" + (on ? " on" : "")} aria-label={s.label} onClick={() => setAp((m) => { const n = { ...m }; if (on) delete n[s.id]; else n[s.id] = (applied[s.id] && applied[s.id].price) || s.price; return n; })}><i /></button>
              <span className="t"><b>{s.label}</b><span>{applied[s.id] ? `beworben${applied[s.id].price ? " zu $" + applied[s.id].price : ""}` : "nicht beworben"} · Standard ${s.price}</span></span>
              {on ? <input className="po-num" type="number" min="1" inputMode="decimal" value={ap[s.id]} onChange={(e) => setAp((m) => ({ ...m, [s.id]: e.target.value }))} aria-label={"Preis " + s.label} /> : null}
            </div>
          );
        })}
      </div>
      <label className="pfld"><span>Interne Notiz</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></label>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {p.status === "pending" || p.status === "rejected" ? (
          <button type="button" className="cta or" disabled={!!busy || !Object.keys(approvedOut).length} onClick={() => run("ok", async () => { await partnerSave({ id: p.id, name: p.name, email: p.email, whatsapp: p.whatsapp, company: p.company, note: p.note, adminNote: note }); await partnerStatusApi(p.id, "approve", { approved: approvedOut }); }, `${p.name} freigegeben – Mail ist raus`)}>
            {busy === "ok" ? <Loader className="spin" /> : <Check />}Freigeben ({Object.keys(approvedOut).length} Leistungen)</button>
        ) : (
          <button type="button" className="cta" disabled={!!busy} onClick={() => run("save", () => partnerSave({ id: p.id, name: p.name, email: p.email, whatsapp: p.whatsapp, company: p.company, note: p.note, adminNote: note, approved: approvedOut }), "Gespeichert")}>
            {busy === "save" ? <Loader className="spin" /> : <Check />}Leistungen & Preise speichern</button>
        )}
        <div className="ctas2">
          {p.status === "active" ? <button type="button" className="cta gh" disabled={!!busy} onClick={() => run("pause", () => partnerStatusApi(p.id, "pause"), "Pausiert – bekommt keine neuen Aufträge")}><Pause />Pausieren</button> : null}
          {p.status === "paused" ? <button type="button" className="cta gh" disabled={!!busy} onClick={() => run("resume", () => partnerStatusApi(p.id, "resume"), "Wieder aktiv")}><Play />Fortsetzen</button> : null}
          {p.status !== "rejected" ? <button type="button" className="cta gh" disabled={!!busy} onClick={() => { if (window.confirm(`${p.name} wirklich ablehnen?`)) run("rej", () => partnerStatusApi(p.id, "reject"), "Abgelehnt"); }} style={{ color: "var(--danger)" }}><X />Ablehnen</button> : null}
        </div>
      </div>
      <p className="sh" style={{ marginTop: 12 }}>Pausiert = bekommt keine neuen Aufträge, laufende kann er fertig machen und wird dafür bezahlt. Preise gelten für neue Aufgaben.</p>
      <div style={{ height: 96 }} />
    </>
  );
}

/* ---------------- Einladen ---------------- */
function InviteScreen({ ctx, back }) {
  const { toast, partners } = ctx;
  const svc = svcList(partners);
  const [f, setF] = React.useState({ name: "", email: "", services: [], prices: {} });
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const create = async () => {
    setBusy(true);
    try { const j = await partnerInviteApi({ ...f, prices: Object.fromEntries(f.services.map((id) => [id, Number(f.prices[id] ?? (svc.find((x) => x.id === id) || {}).price) || null])) }); setUrl(j.url); } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const msg = `Hi${f.name ? " " + f.name.split(" ")[0] : ""}, please register as a RapidRemove partner here: ${url}`;
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk keep" aria-label="Zurück" onClick={back}><ArrowLeft /></button></div>
      <div className="ttl">Partner einladen</div>
      <p className="sh">Eingeladene Partner müssen sich nicht bewerben: Sie legen über den Link nur Kontakt + Login an und sind sofort freigegeben – mit den Leistungen und Preisen von hier (ohne Auswahl: die Leistungen, die er angibt, zum Standardpreis). Danach richtet er die Auszahlung ein (EU/UK/CH/US/CA: Stripe). Link 14 Tage gültig, einmal verwendbar.</p>
      {!url ? (
        <>
          <label className="pfld"><span>Name (optional)</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="pfld"><span>E-Mail (optional)</span><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <div className="sec3"><h2>Leistungen vorauswählen</h2></div>
          <div className="info">
            {svc.map((s) => {
              const on = f.services.includes(s.id);
              return (
                <React.Fragment key={s.id}>
                  <button type="button" className="ir" onClick={() => setF({ ...f, services: on ? f.services.filter((x) => x !== s.id) : [...f.services, s.id] })}><span className="t"><b>{s.label}</b>{on ? <span>Preis je Löschung (USD)</span> : null}</span><span className={"tg" + (on ? " on" : "")}><i /></span></button>
                  {on ? <div className="ir" style={{ paddingTop: 0 }}><span className="t" /><input className="po-sel" style={{ width: 110, textAlign: "right" }} type="number" min="1" step="1" inputMode="decimal" value={f.prices[s.id] ?? s.price} onChange={(e) => setF({ ...f, prices: { ...f.prices, [s.id]: e.target.value } })} /></div> : null}
                </React.Fragment>
              );
            })}
          </div>
          <button type="button" className="cta or" disabled={busy} onClick={create}>{busy ? <Loader className="spin" /> : <UserPlus />}Einladungslink erstellen</button>
        </>
      ) : (
        <>
          <div className="card" style={{ padding: 14, fontSize: 13, wordBreak: "break-all", marginBottom: 12 }}>{url}</div>
          <div className="ctas2">
            <button type="button" className="cta" onClick={() => { try { navigator.clipboard.writeText(url); toast("Link kopiert"); } catch (e) {} }}><Copy />Kopieren</button>
            <a className="cta gh" href={"https://wa.me/?text=" + encodeURIComponent(msg)} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a>
          </div>
          {f.email ? <a className="cta gh" style={{ marginTop: 10 }} href={`mailto:${f.email}?subject=${encodeURIComponent("RapidRemove partner registration")}&body=${encodeURIComponent(msg)}`}><Mail />Per E-Mail senden</a> : null}
          <button type="button" className="cta gh" style={{ marginTop: 10 }} onClick={() => { setUrl(""); setF({ name: "", email: "", services: [], prices: {} }); }}>Weitere Einladung</button>
        </>
      )}
    </>
  );
}

/* ---------------- Zuteilung (Einstellungen) ---------------- */
export function RoutesBlock({ ctx }) {
  const { partners, toast, loadPartners } = ctx;
  const svc = svcList(partners);
  const routes = (partners && partners.routes) || {};
  const list = ((partners && partners.partners) || []).filter((p) => p.status === "active");
  const [busy, setBusy] = React.useState("");
  const change = async (sid, v) => {
    setBusy(sid);
    try { await partnerRoutesApi({ [sid]: v ? Number(v) : null }); toast(v ? `${svc.find((s) => s.id === sid).label} → ${list.find((p) => String(p.id) === String(v)).name}` : "Weiterleitung aus – manuell übergeben"); if (loadPartners) await loadPartners(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy("");
  };
  return (
    <>
      <div className="sec3"><h2>Automatische Weiterleitung</h2></div>
      <p className="sh">Neue Aufträge gehen je Leistung direkt an den gewählten Partner (nur freigegebene, aktive Partner). „Aus“ = bleibt bei dir, du übergibst manuell.</p>
      <div className="info">
        {svc.map((s) => {
          const opts = list.filter((p) => p.approved && p.approved[s.id] != null);
          const cur = routes[s.id] ? String(routes[s.id]) : "";
          const curP = list.find((p) => String(p.id) === cur);
          return (
            <label key={s.id} className="ir">
              <span className="t"><b style={{ whiteSpace: "normal" }}>{s.label}</b><span>{curP ? `${curP.name} · $${curP.approved[s.id]} je Löschung` : "Aus · manuell"}</span></span>
              {busy === s.id ? <Loader className="spin" /> : null}
              <select className="po-sel" value={cur} onChange={(e) => change(s.id, e.target.value)}>
                <option value="">Aus</option>
                {opts.map((p) => <option key={p.id} value={p.id}>{p.name}{p.active === false ? " (pausiert)" : ""}</option>)}
              </select>
            </label>
          );
        })}
      </div>
    </>
  );
}
