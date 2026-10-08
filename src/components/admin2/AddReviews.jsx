"use client";
/* Admin · Auftrag → „Bewertung hinzufügen" (Nachbestellung).
   Bewertungen aus dem Profil des Auftrags anhaken ODER Links einfügen → zum bestehenden Auftrag.
   Optional: Kunde muss zuerst eine Zahlungsart hinterlegen (nur die neuen warten – laufende Bewertungen laufen weiter).
   Partner bekommt „Review added", Kunde eine Bestätigung „Bewertung hinzugefügt". */
import React from "react";
import { Link as LinkIcon, Clipboard, Check, Info, Loader, Plus, X, CreditCard, Bell, StarOff, Tag } from "lucide-react";
import { placeReviews, resolveReviewLinkApi, addReviewsToOrderApi } from "@/lib/admin-api";
import { reviewQuote } from "@/lib/pricing";
import { Nav } from "./OrdersScreens";
import { money } from "./model";

const isUrl = (s) => /^https?:\/\/\S+$/i.test(String(s || "").trim());
const normU = (u) => String(u || "").trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "");
const normT = (t) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();
const ago = (d) => (d < 0 ? "Datum unbekannt" : d < 1 ? "heute" : d < 7 ? `vor ${d} ${d === 1 ? "Tag" : "Tagen"}` : d < 31 ? `vor ${Math.round(d / 7)} Wo.` : d < 365 ? `vor ${Math.round(d / 30)} Mon.` : `vor ${Math.round(d / 365)} J.`);
const Stars = ({ n }) => <i className="st">{"★".repeat(Math.max(0, Math.min(5, n)))}<s>{"★".repeat(Math.max(0, 5 - n))}</s></i>;
const MSG = { already_ordered: "Diese Bewertung ist schon beauftragt.", cancelled: "Auftrag ist storniert.", order: "Auftrag nicht gefunden (nur Bewertungs-Aufträge).", empty: "Keine gültige Bewertung." };

export default function AddReviews({ ctx, id }) {
  const { orders, back, isDesk, toast, refresh, loadPtasks } = ctx;
  const o = orders.find((x) => x.id === id);
  const [mode, setMode] = React.useState(o && o.placeId ? "profile" : "links");
  const [revs, setRevs] = React.useState(null);
  const [revErr, setRevErr] = React.useState("");
  const [rsf, setRsf] = React.useState("neg");
  const [sel, setSel] = React.useState([]);
  const [rl, setRl] = React.useState([]);
  const [rlin, setRlin] = React.useState("");
  const [gate, setGate] = React.useState(true);
  const [mail, setMail] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [cpAll, setCpAll] = React.useState("");
  React.useEffect(() => {
    if (!o || !o.placeId || mode !== "profile" || revs) return;
    placeReviews(o.placeId, o.lang || "de").then((r) => { if (r.enabled === false) { setRevs([]); setRevErr("Bewertungsliste nicht verfügbar – bitte Links einfügen."); } else setRevs(r.reviews || []); })
      .catch((e) => { setRevs([]); setRevErr("Bewertungen konnten nicht geladen werden: " + e.message); });
  }, [o && o.placeId, mode]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return <Nav back={back} isDesk={isDesk} />;

  const have = o.reviewItems || [];
  const inOrder = (r) => have.some((it) => (r.link && it.url && normU(it.url) === normU(r.link)) || (it.name && it.text && r.text && normT(it.name) === normT(r.name) && normT(it.text).slice(0, 80) === normT(r.text).slice(0, 80)));
  const list = (revs || []).filter((r) => rsf === "all" || (r.rating && r.rating <= 2));
  const items = mode === "links"
    ? rl.map((r) => ({ url: r.url, old: !!r.old, ...(r.info ? { name: r.info.name, rating: r.info.rating, days: r.info.days, ...(r.info.text ? { text: r.info.text } : {}) } : {}) }))
    : (revs || []).filter((r) => sel.includes(r.id)).map((r) => ({ ...(r.link ? { url: r.link } : {}), name: r.name, text: r.text || "★".repeat(r.rating || 0), old: r.days > 28, rating: r.rating, days: r.days }));
  const c = o.country === "US" ? "$" : "€";
  const cpv = (() => { const n = Number(String(cpAll || "").replace(/\s/g, "").replace(",", ".")); return Number.isFinite(n) && n > 0 && n < 100000 ? Math.round(n * 100) / 100 : 0; })();
  if (cpv) for (const it of items) it.cp = cpv;
  const q = reviewQuote(items, "de");
  const paste = async () => { try { const t = await navigator.clipboard.readText(); if (t) setRlin(t.trim()); } catch (e) { toast("Einfügen nicht erlaubt – bitte manuell einfügen"); } };
  const addLink = () => {
    const u = rlin.trim();
    if (!isUrl(u)) { toast("Bitte einen gültigen Link einfügen"); return; }
    if (rl.some((r) => r.url === u)) { setRlin(""); return; }
    setRl((x) => [...x, { url: u, old: false, st: "busy", info: null }]); setRlin("");
    resolveReviewLinkApi(u).then((r) => {
      const info = r.review || null;
      setRl((x) => x.map((y) => (y.url === u ? { ...y, st: info ? "ok" : "unknown", info, old: info ? info.days > 28 : y.old } : y)));
    }).catch(() => setRl((x) => x.map((y) => (y.url === u ? { ...y, st: "unknown" } : y))));
  };
  const save = async () => {
    setBusy(true);
    try {
      const r = await addReviewsToOrderApi({ orderId: o.id, reviewItems: items, gate, sendMail: mail });
      toast(`${r.added} ${r.added === 1 ? "Bewertung" : "Bewertungen"} hinzugefügt · ${r.gate ? "wartet auf Zahlungsart" : r.partner ? "ans Partner-Board" : "gespeichert"}${r.skipped && r.skipped.length ? ` · ${r.skipped.length} schon beauftragt` : ""}`);
      if (refresh) refresh(true);
      if (loadPtasks) loadPtasks();
      back();
    } catch (e) { toast(MSG[e.message] || "Fehler: " + e.message); }
    setBusy(false);
  };

  return (
    <div className="naflow">
      <Nav back={back} isDesk={isDesk} />
      <div className="nah"><h1>Bewertung hinzufügen</h1></div>
      <p className="nasub">{o.id} · {o.profile || o.company || o.name} · {have.length} schon beauftragt</p>
      <div className="seg2 naseg">{[["profile", "Aus dem Profil"], ["links", "Bewertungs-Link"]].map(([k, l]) => <button key={k} type="button" className={mode === k ? "on" : ""} disabled={k === "profile" && !o.placeId} onClick={() => setMode(k)}>{l}</button>)}</div>
      {mode === "links" ? (
        <>
          <div className="usrch nain"><LinkIcon /><input placeholder="Link zur Bewertung" value={rlin} onChange={(e) => setRlin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLink()} inputMode="url" autoComplete="off" />
            <button type="button" className="bt" onClick={() => (rlin.trim() ? addLink() : paste())}>{rlin.trim() ? <><Plus />Hinzufügen</> : <><Clipboard />Einfügen</>}</button></div>
          {rl.length ? (
            <div className="card ls narl">
              {rl.map((r, i) => (
                <div key={r.url} className="rlr">
                  <span className="n">{i + 1}</span>
                  {r.st === "ok" ? (
                    <div className="t"><b>{r.info.name} <Stars n={r.info.rating} /></b><span className="q">{r.info.text || "Nur Sterne, kein Text"}</span><span className={r.old ? "ol" : ""}>{ago(r.info.days)}{r.old ? " · älter 4 Wo." : ""}</span></div>
                  ) : (
                    <div className="t"><b className="lnk">{r.url.replace(/^https?:\/\//, "")}</b>
                      {r.st === "busy" ? <span className="busy"><Loader className="spin" />Bewertung wird erkannt …</span> : (
                        <span className="agep"><em>Alter nicht erkannt:</em>
                          <button type="button" className={!r.old ? "on" : ""} onClick={() => setRl((x) => x.map((y, j) => (j === i ? { ...y, old: false } : y)))}>jünger 4 Wo.</button>
                          <button type="button" className={r.old ? "on" : ""} onClick={() => setRl((x) => x.map((y, j) => (j === i ? { ...y, old: true } : y)))}>älter 4 Wo.</button></span>
                      )}</div>
                  )}
                  <button type="button" className="circ sm" aria-label="Entfernen" onClick={() => setRl((x) => x.filter((_, j) => j !== i))}><X /></button>
                </div>
              ))}
            </div>
          ) : <div className="nahint"><Info />Link aus der Kunden-Mail einfügen (auch maps.app.goo.gl).</div>}
        </>
      ) : (
        <>
          <div className="sec3" style={{ marginTop: 6 }}><h2>Bewertungen wählen</h2>
            <div className="seg2">{[["neg", "1–2 ★"], ["all", "Alle"]].map(([k, l]) => <button key={k} type="button" className={rsf === k ? "on" : ""} onClick={() => setRsf(k)}>{l}</button>)}</div></div>
          {revs === null ? <div className="nahint"><Loader className="spin" />Bewertungen werden geladen …</div>
            : revErr ? <div className="nahint err"><Info />{revErr}</div>
            : !list.length ? <div className="nahint"><Info />{rsf === "neg" ? "Keine 1–2-Sterne-Bewertungen – „Alle“ zeigen." : "Keine Bewertungen gefunden."}</div>
            : (
              <>
                <div className="card ls narl">
                  {list.map((r) => {
                    const done = inOrder(r), on = sel.includes(r.id);
                    return (
                      <button key={r.id} type="button" disabled={done} className={"rlr pk" + (on ? " on" : "") + (done ? " dis" : "")} onClick={() => setSel((x) => (on ? x.filter((y) => y !== r.id) : [...x, r.id]))}>
                        <span className="cb2"><Check /></span>
                        <div className="t"><b>{r.name} <Stars n={r.rating} /></b><span className="q">{r.text || "Nur Sterne, kein Text"}</span><span>{done ? "Schon im Auftrag" : ago(r.days) + (r.days > 28 ? " · älter 4 Wo." : "")}</span></div>
                      </button>
                    );
                  })}
                </div>
                {sel.length ? <button type="button" className="nasel" onClick={() => setSel([])}><X />Auswahl aufheben</button> : null}
              </>
            )}
        </>
      )}
      <label className="naf" style={{ marginTop: 14 }}><span>Preis pro Bewertung · leer = Preisliste</span>
        <div className="usrch nain"><Tag /><input inputMode="decimal" placeholder="Preisliste" value={cpAll} onChange={(e) => setCpAll(e.target.value)} /><b className="curx">{c}</b></div></label>
      {items.length ? <div className="natot"><span>{items.length} {items.length === 1 ? "Bewertung" : "Bewertungen"} · nur bei Löschung</span><b>{money(q.total, c)} max.</b></div> : null}
      <div className="info" style={{ marginTop: 14 }}>
        <button type="button" className="ir" onClick={() => setGate((x) => !x)}>
          <span className="ico"><CreditCard /></span><span className="t"><span>Zahlung</span><b>Kunde muss zuerst Zahlungsart hinterlegen</b></span><span className={"tg" + (gate ? " on" : "")}><i /></span></button>
        <button type="button" className="ir" onClick={() => setMail((x) => !x)}>
          <span className="ico"><Bell /></span><span className="t"><span>Kunde</span><b>Bestätigung „Bewertung hinzugefügt“</b></span><span className={"tg" + (mail ? " on" : "")}><i /></span></button>
      </div>
      <p className="nasub" style={{ marginTop: 4 }}>{gate
        ? "Die neue Bewertung startet erst, wenn der Kunde im Dashboard eine Zahlungsart hinterlegt hat (abgebucht wird nur bei Löschung). Laufende Bewertungen laufen weiter. Hat er schon eine hinterlegt, startet sie sofort."
        : "Die neue Bewertung geht sofort ans Partner-Board. Der Kunde zahlt wie bisher nach der Löschung."}</p>
      <div className="nastick">
        <button type="button" className="cta or" disabled={!items.length || busy} onClick={save}>
          {busy ? <Loader className="spin" /> : <StarOff />}{busy ? "Wird hinzugefügt …" : items.length ? `${items.length} ${items.length === 1 ? "Bewertung" : "Bewertungen"} hinzufügen` : "Bewertung wählen"}
        </button>
      </div>
      {isDesk ? null : <div style={{ height: 8 }} />}
    </div>
  );
}
