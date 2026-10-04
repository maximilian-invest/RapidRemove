"use client";
/* Admin → Monitor: Überwachung gelöschter Google-Profile. Umsetzung des Design-Handoffs
   „design_handoff_monitor" (Screens, Zustände, Mobil). Daten: ops/monitor.ts. */
import React from "react";
import { monitorList, monitorDetail, monitorScan, monitorCancel, monitorAction, monitorInform, monitorLookup, monitorAdd, monitorShotUrl } from "@/lib/admin-api";

const Mv = ({c,children,...p})=><svg className={"ic "+(c||"")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>;
export const MI = {
eye:p=><Mv {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Mv>,
box:p=><Mv {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></Mv>,
inbox:p=><Mv {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/></Mv>,
users:p=><Mv {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></Mv>,
cal:p=><Mv {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Mv>,
chart:p=><Mv {...p}><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/></Mv>,
cog:p=><Mv {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Mv>,
search:p=><Mv {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Mv>,
bell:p=><Mv {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Mv>,
plus:p=><Mv {...p}><path d="M12 5v14M5 12h14"/></Mv>,
scan:p=><Mv {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></Mv>,
right:p=><Mv {...p}><path d="m9 18 6-6-6-6"/></Mv>,
back:p=><Mv {...p}><path d="m15 18-6-6 6-6"/></Mv>,
x:p=><Mv {...p}><path d="M18 6 6 18M6 6l12 12"/></Mv>,
check:p=><Mv {...p}><path d="M20 6 9 17l-5-5"/></Mv>,
checkC:p=><Mv {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Mv>,
alert:p=><Mv {...p}><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/></Mv>,
redo:p=><Mv {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="m8 13 3 3 5-6"/></Mv>,
off:p=><Mv {...p}><path d="M12 20h.01M8.5 16.4a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8a15 15 0 0 0-11.3-3.8M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-1.7-1.3M2 2l20 20"/></Mv>,
pause:p=><Mv {...p}><circle cx="12" cy="12" r="10"/><path d="M10 15V9M14 15V9"/></Mv>,
play:p=><Mv {...p}><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/></Mv>,
pin:p=><Mv {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></Mv>,
ext:p=><Mv {...p}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></Mv>,
dl:p=><Mv {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Mv>,
mail:p=><Mv {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></Mv>,
file:p=><Mv {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></Mv>,
img:p=><Mv {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></Mv>,
clock:p=><Mv {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Mv>,
more:p=><Mv {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Mv>,
link:p=><Mv {...p}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></Mv>,
star:p=><Mv {...p}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></Mv>,
menu:p=><Mv {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Mv>,
};


/* ---------- Status & Hilfen ---------- */
const MST = {
  found: { l: "Wieder erschienen", i: "alert", c: "bad", o: 0 },
  fail: { l: "Prüfung fehlgeschlagen", i: "off", c: "warn", o: 1 },
  re: { l: "Erneut gelöscht", i: "redo", c: "info", o: 2 },
  ok: { l: "Gelöscht", i: "checkC", c: "ok", o: 3 },
  paused: { l: "Pausiert", i: "pause", c: "neu", o: 4 },
  exp: { l: "Abgelaufen", i: "pause", c: "neu", o: 5 },
};
const FILTERS = [["all", "Alle"], ["found", "Wieder erschienen"], ["ok", "Gelöscht"], ["re", "Erneut gelöscht"], ["fail", "Fehlgeschlagen"], ["paused", "Pausiert / abgelaufen"]];
const matchF = (p, f) => f === "all" || p.status === f || (f === "paused" && p.status === "exp");
const TZ = "Europe/Vienna";
const fmtDT = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("de-AT", { timeZone: TZ, day: "2-digit", month: "2-digit" }) + " · " + d.toLocaleTimeString("de-AT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
};
const fmtTime = (iso) => { const d = new Date(iso); return isNaN(d) ? "—" : d.toLocaleTimeString("de-AT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }); };
const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? "—" : d.toLocaleDateString("de-AT", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }); };
const dayKey = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const dayLabel = (iso) => {
  const d = new Date(iso); if (isNaN(d)) return "";
  const today = new Date(); const tom = new Date(Date.now() + 864e5);
  if (dayKey(d) === dayKey(today)) return "Heute";
  const dm = d.toLocaleDateString("de-AT", { timeZone: TZ, day: "2-digit", month: "2-digit" }).replace(/\.?$/, ".");
  if (dayKey(d) === dayKey(tom)) return "Morgen, " + dm;
  return dm;
};
const typeLabel = (t) => (t === "lifetime" ? "Lebenslang" : "Monatlich");
const cityOf = (addr) => { const m = String(addr || "").match(/\b\d{4,5}\s+([^,]+)/); return m ? m[1].trim() : ""; };

function Status({ s, run }) {
  if (run) return <span className="st run"><MI.scan />Wird geprüft…</span>;
  const m = MST[s] || MST.ok; const C = MI[m.i];
  return <span className={"st " + m.c}><C />{m.l}</span>;
}

function Thumb({ p }) {
  if (p.lastShotId) return <div className="thumb real"><img src={monitorShotUrl(p.lastShotId)} alt="" loading="lazy" /><span className="tag"><MI.img />{fmtTime(p.foundAt)}</span></div>;
  return <div className="thumb"><span className="tag"><MI.img />{fmtTime(p.foundAt)}</span><div className="mini"><b>{p.name}</b><span>{cityOf(p.address)}</span></div></div>;
}

/* ---------- Detail-Drawer ---------- */
const HM = {
  ok: ["ok", "checkC", "Nicht gefunden"], found: ["bad", "alert", "Wieder erschienen"], re: ["info", "redo", "Erneut gelöscht"],
  fail: ["warn", "off", "Prüfung fehlgeschlagen"], mail: ["", "mail", "Kunde informiert"], added: ["", "plus", "Hinzugefügt"],
  paused: ["", "pause", "Pausiert"], resumed: ["", "play", "Fortgesetzt"],
};

function Drawer({ p, onClose, onChanged, toast, onOpenOrder, scanning }) {
  const [d, setD] = React.useState(null);
  const [all, setAll] = React.useState(false);
  const [busy, setBusy] = React.useState("");
  const [note, setNote] = React.useState(p.note || "");
  const load = React.useCallback(() => monitorDetail(p.id).then(setD).catch((e) => setD({ error: e.message })), [p.id]);
  React.useEffect(() => { load(); setNote(p.note || ""); }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const checking = !!(d && d.checking) || scanning;
  React.useEffect(() => {
    if (!checking) return;
    const t = setTimeout(() => { load().then(() => onChanged()); }, 3000);
    return () => clearTimeout(t);
  }, [checking, d]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = (d && d.profile) || p;
  const checks = (d && d.checks) || [];
  const shotC = checks.find((c) => c.has_img && c.result === "found") || checks.find((c) => c.has_img);
  const act = async (a) => {
    setBusy(a);
    try {
      if (a === "check") { await monitorScan(cur.id); toast("Prüfung gestartet …"); setD((x) => ({ ...(x || {}), checking: true })); }
      else if (a === "inform") { await monitorInform(cur.id); toast("Kunde informiert ✓"); }
      else if (a === "re") { await monitorAction(cur.id, "re"); toast("Als erneut gelöscht markiert ✓"); }
      else if (a === "pause") { const on = cur.status === "paused" || cur.status === "exp"; await monitorAction(cur.id, on ? "resume" : "pause"); toast(on ? "Überwachung fortgesetzt" : "Überwachung pausiert"); }
      await load(); onChanged();
    } catch (e) { toast("Fehlgeschlagen: " + e.message); }
    setBusy("");
  };
  const saveNote = () => { if ((note || "") !== (cur.note || "")) monitorAction(cur.id, "note", { note }).then(() => { onChanged(); toast("Notiz gespeichert"); }).catch((e) => toast("Notiz nicht gespeichert: " + e.message)); };
  const inactive = cur.status === "paused" || cur.status === "exp";
  const box = {
    found: ["bad", "alert", "Profil ist wieder bei Google sichtbar", "Gefunden am " + fmtDT(cur.foundAt) + " Uhr, per Screenshot bestätigt. Bitte erneut löschen und den Kunden informieren."],
    re: ["info", "redo", "Nach Fund erneut gelöscht", "Seit der erneuten Löschung wieder unauffällig. Überwachung läuft weiter."],
    fail: ["warn", "off", "Letzte Prüfung fehlgeschlagen", (cur.lastNote || "Google war nicht erreichbar.") + " Beim nächsten Scan wird erneut geprüft – oder jetzt prüfen."],
    paused: ["neu", "pause", "Überwachung pausiert", "Pausiert seit " + fmtDate(cur.pausedAt) + ". Es finden keine täglichen Prüfungen statt."],
    exp: ["neu", "pause", "Überwachung abgelaufen", "Es finden keine täglichen Prüfungen statt."],
  }[cur.status];
  const H = all ? checks : checks.slice(0, 5);
  const gmaps = cur.foundUrl || cur.mapsUrl;
  return (
    <>
      <div className="ov" onClick={onClose}></div>
      <aside className="dr" role="dialog" aria-label={cur.name}>
        <div className="dr-h"><button className="ibtn ghost m-only" onClick={onClose} aria-label="Zurück"><MI.back /></button><span className="ttl">Überwachtes Profil</span><div className="r"><button className="ibtn ghost d-only" onClick={onClose} aria-label="Schließen"><MI.x /></button></div></div>
        <div className="dr-b">
          <section className="pcard">
            <div className="ph"><div style={{ minWidth: 0 }}><h2>{cur.name}</h2>{cur.address ? <div className="ad"><MI.pin />{cur.address}</div> : null}</div><Status s={cur.status} run={checking} /></div>
            {box && <div className={"alarmbox " + box[0]}>{React.createElement(MI[box[1]])}<div>{box[2]}<span>{box[3]}</span></div></div>}
            <div className="kv">
              <div><small>Kunde</small><b>{cur.custName || "—"}</b></div>
              <div><small>E-Mail</small><b>{cur.custEmail || "—"}</b></div>
              <div><small>Bestellung</small>{cur.orderId ? <button className="lk" onClick={() => onOpenOrder(cur.orderId)}>{cur.orderId}<MI.right /></button> : <b>—</b>}</div>
              <div><small>Überwachung</small><b>{typeLabel(cur.type)} · seit {fmtDate(cur.since)}</b></div>
              <div><small>Letzte Prüfung</small><b>{cur.lastCheckAt ? fmtDT(cur.lastCheckAt) + " Uhr" : "— (nächster Scan 05:00)"}</b></div>
              <div><small>Google Maps</small>{gmaps ? <a className="lk" href={gmaps} target="_blank" rel="noopener noreferrer">Profil öffnen<MI.ext /></a> : <b>—</b>}</div>
            </div>
            <div className="qa">
              {cur.status === "found" && <button className="btn sm" disabled={checking || !!busy} onClick={() => act("check")}><MI.scan />Jetzt prüfen</button>}
              <button className="btn sm" disabled={!!busy} onClick={() => act("pause")}>{inactive ? <><MI.play />Überwachung fortsetzen</> : <><MI.pause />Überwachung pausieren</>}</button>
              {cur.status !== "found" && <button className="btn sm" disabled={!!busy || !cur.custEmail} onClick={() => act("inform")}><MI.mail />Kunde informieren</button>}
            </div>
          </section>
          {shotC && <section className="blk">
            <div className="blk-h"><h3>Beweis-Screenshot</h3><div className="r"><span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{fmtDT(shotC.checked_at)}</span></div></div>
            <a className="shot real" href={monitorShotUrl(shotC.id)} target="_blank" rel="noopener noreferrer"><img src={monitorShotUrl(shotC.id)} alt="Screenshot" /><span className="tag">Google Maps · {fmtDT(shotC.checked_at)}</span></a>
            <div className="shot-f">{shotC.result === "found" ? "Automatisch beim Fund aufgenommen" : "Aufnahme bei der Prüfung"}<a className="btn sm" href={monitorShotUrl(shotC.id, true)}><MI.dl />Herunterladen</a></div>
          </section>}
          <section className="blk">
            <div className="blk-h"><h3>Prüf-Historie</h3><div className="r"><span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>täglich 05:00</span></div></div>
            {d && d.error ? <div className="empty-f err-f" style={{ padding: 20 }}>{d.error}</div> : null}
            {checks.length ? <ul className="tl">{H.map((h) => {
              const m = HM[h.result] || HM.ok;
              return <li key={h.id}><span className={"d " + m[0]}>{React.createElement(MI[m[1]])}</span><div><b>{m[2]}</b><div className="x">{h.note}</div>{h.has_img ? <a className="sl2" href={monitorShotUrl(h.id)} target="_blank" rel="noopener noreferrer"><MI.img />Screenshot ansehen</a> : null}</div><time>{fmtDT(h.checked_at)}</time></li>;
            })}</ul> : <div className="empty-f" style={{ padding: 28 }}>{d ? "Noch keine Prüfungen." : "Wird geladen …"}</div>}
            {checks.length > 5 && <button className="more-btn" onClick={() => setAll(!all)}>{all ? "Weniger anzeigen" : "Alle " + checks.length + " Prüfungen anzeigen"}</button>}
          </section>
          <section className="blk"><div className="blk-h"><h3>Notiz</h3></div><div className="note"><textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Interne Notiz – nur für das Team"></textarea></div></section>
        </div>
        <div className="dr-f">
          {cur.status === "found"
            ? <><button className="btn" disabled={!!busy || !cur.custEmail} onClick={() => act("inform")}><MI.mail />Kunde informieren</button><button className="btn pri" disabled={!!busy} onClick={() => act("re")}><MI.redo />Als erneut gelöscht markieren</button></>
            : <button className="btn pri" disabled={checking || inactive || !!busy} onClick={() => act("check")}><MI.scan />{checking ? "Wird geprüft…" : "Jetzt prüfen"}</button>}
        </div>
      </aside>
    </>
  );
}

/* ---------- Profil hinzufügen ---------- */
function AddModal({ onClose, onAdded, orders, toast }) {
  const [mode, setMode] = React.useState("link");
  const [link, setLink] = React.useState("");
  const [nm, setNm] = React.useState("");
  const [ort, setOrt] = React.useState("");
  const [st, setSt] = React.useState("idle"); // idle | load | found | none | err
  const [place, setPlace] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [cust, setCust] = React.useState("");
  const [orderId, setOrderId] = React.useState("");
  const [sugOpen, setSugOpen] = React.useState(false);
  const [type, setType] = React.useState("monthly");
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => { const k = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const can = mode === "link" ? link.trim().length > 6 : nm.trim().length > 1;
  const go = async () => {
    if (!can) return;
    setSt("load"); setErr("");
    try {
      const r = await monitorLookup(mode === "link" ? { link: link.trim() } : { name: nm.trim(), city: ort.trim() });
      if (r.place) { setPlace(r.place); setSt("found"); } else { setPlace(null); setSt("none"); }
    } catch (e) { setErr(e.message); setSt("err"); }
  };
  const ql = cust.trim().toLowerCase();
  const sugs = (orders || []).filter((o) => o.service !== "deindex" && (!ql || [o.id, o.name, o.email, o.company].join(" ").toLowerCase().includes(ql))).slice(0, 6);
  const submit = async () => {
    if (!place) return;
    setSaving(true);
    try {
      const r = await monitorAdd({ name: place.name, address: place.address, placeId: place.placeId, mapsUrl: place.mapsUrl, orderId: orderId || undefined, type });
      onAdded(r.id, place.name);
    } catch (e) { toast("Hinzufügen fehlgeschlagen: " + e.message); setSaving(false); }
  };
  return (
    <div className="mod-w" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="mod" role="dialog">
      <div className="mod-h"><div><h3>Profil hinzufügen</h3><p>Wird ab sofort täglich um 05:00 geprüft.</p></div><button className="ibtn ghost" onClick={onClose} aria-label="Schließen"><MI.x /></button></div>
      <div className="mod-b">
        <div className="seg"><button className={mode === "link" ? "on" : ""} onClick={() => { setMode("link"); setSt("idle"); }}>Google-Maps-Link</button><button className={mode === "name" ? "on" : ""} onClick={() => { setMode("name"); setSt("idle"); }}>Firmenname + Ort</button></div>
        {mode === "link"
          ? <div className="fld"><label>Link zum Profil</label><div className="inrow"><input autoFocus placeholder="https://maps.app.goo.gl/…" value={link} onChange={(e) => { setLink(e.target.value); setSt("idle"); }} onKeyDown={(e) => e.key === "Enter" && go()} /><button className="btn" disabled={!can || st === "load"} onClick={go}>Suchen</button></div></div>
          : <div className="row2"><div className="fld"><label>Firmenname</label><input autoFocus value={nm} onChange={(e) => { setNm(e.target.value); setSt("idle"); }} placeholder="z. B. Gasthaus Zur Linde" /></div><div className="fld"><label>Ort</label><div className="inrow"><input value={ort} onChange={(e) => { setOrt(e.target.value); setSt("idle"); }} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="z. B. Klosterneuburg" /><button className="btn" disabled={!can || st === "load"} onClick={go}>Suchen</button></div></div></div>}
        <div className="fld"><label>Gefundenes Profil</label>
          {st === "found" && place
            ? <div className="prev"><span className="pi"><MI.pin /></span><div style={{ minWidth: 0 }}><b>{place.name}</b><span>{place.address}</span>{place.placeId ? <span className="mono" style={{ color: "var(--fg-muted)" }}>Profil-ID {place.placeId}</span> : null}</div><MI.checkC c="chk" /></div>
            : <div className="prev ph2">{st === "load" ? <><MI.scan style={{ animation: "mon-spin 1s linear infinite", width: 16, height: 16 }} />&nbsp;Suche bei Google…</> : st === "none" ? "Kein Profil gefunden – Name/Ort prüfen" : st === "err" ? <span className="err-f">{err}</span> : "Vorschau erscheint nach der Suche"}</div>}
        </div>
        <div className="fld" style={{ position: "relative" }}><label>Kunde oder Bestellung <em>· optional</em></label>
          <input value={cust} onFocus={() => setSugOpen(true)} onBlur={() => setTimeout(() => setSugOpen(false), 150)} onChange={(e) => { setCust(e.target.value); setOrderId(""); }} placeholder="Name, E-Mail oder Bestell-Nr." />
          {sugOpen && <div className="sug">{sugs.length ? sugs.map((o) => <button key={o.id} onMouseDown={() => { setCust(o.id + " · " + (o.name || o.company || o.email)); setOrderId(o.id); }}><MI.box style={{ width: 15, height: 15, color: "var(--fg-muted)" }} />{o.name || o.company || o.email}<small>{o.id}</small></button>) : <div className="sug-empty">Keine passende Bestellung</div>}</div>}
        </div>
        <div className="fld"><label>Überwachungs-Art</label><div className="opt">{[["monthly", "Monatlich", "Verlängert sich jeden Monat"], ["lifetime", "Lebenslang", "Einmalig bezahlt, ohne Ende"]].map((o) => <button key={o[0]} className={type === o[0] ? "on" : ""} onClick={() => setType(o[0])}>{o[1]}<small>{o[2]}</small></button>)}</div></div>
      </div>
      <div className="mod-f"><button className="btn" onClick={onClose}>Abbrechen</button><button className="btn pri" disabled={st !== "found" || saving} onClick={submit}><MI.eye />{saving ? "Wird angelegt…" : "Überwachung starten"}</button></div>
    </div></div>
  );
}

/* ---------- Monitor (Übersicht) ---------- */
export function Monitor({ orders, toast, onOpenOrder, initialOpen, onFoundCount }) {
  const [data, setData] = React.useState(null);
  const [f, setF] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(initialOpen ? Number(initialOpen) : null);
  const [add, setAdd] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const prevRun = React.useRef(null);
  const load = React.useCallback(() => monitorList().then((d) => { setData(d); return d; }).catch((e) => { setData((x) => x || { error: e.message, profiles: [] }); }), []);
  React.useEffect(() => { load(); }, [load]);
  const busy = !!(data && (data.run || (data.checking || []).length));
  React.useEffect(() => {
    const t = setTimeout(load, busy ? 2500 : 60000);
    return () => clearTimeout(t);
  }, [data, busy, load]);
  // Scan beendet → Toast mit Ergebnis (auch wenn er schneller fertig war als das Polling).
  React.useEffect(() => {
    if (!data) return;
    const lastId = data.lastRun ? data.lastRun.id : 0;
    const waited = prevRun.current; // { lastId } solange ein selbst gestarteter oder laufender Scan beobachtet wird
    if (waited && !data.run && lastId && lastId !== waited.lastId) {
      const r = data.lastRun;
      toast(r.cancelled ? "Scan abgebrochen · " + r.done + " geprüft" : "Scan abgeschlossen · " + r.done + " geprüft · " + (r.found ? r.found + " neue Funde" : "keine neuen Funde"));
      prevRun.current = null;
    } else if (data.run && !waited) prevRun.current = { lastId };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = (data && data.profiles) || [];
  const nFound = list.filter((p) => p.status === "found").length;
  React.useEffect(() => { if (data && onFoundCount) onFoundCount(nFound); }, [nFound, data]); // eslint-disable-line react-hooks/exhaustive-deps
  const active = list.filter((p) => p.status !== "paused" && p.status !== "exp");
  const run = data && data.run;
  const checkingIds = new Set((data && data.checking) || []);
  const scanAll = async () => { setStarting(true); prevRun.current = { lastId: data && data.lastRun ? data.lastRun.id : 0 }; try { await monitorScan(); await load(); } catch (e) { toast("Scan nicht gestartet: " + e.message); } setStarting(false); };
  const cancel = async () => { try { await monitorCancel(); toast("Scan wird abgebrochen …"); } catch (e) { toast(e.message); } };
  const inform = async (p) => { try { await monitorInform(p.id); toast("Kunde informiert ✓"); load(); } catch (e) { toast("Fehlgeschlagen: " + e.message); } };
  const ql = q.trim().toLowerCase();
  const shown = list.filter((p) => matchF(p, f) && (!ql || [p.name, p.address, p.custName, p.custEmail, p.orderId].join(" ").toLowerCase().includes(ql)))
    .sort((a, b) => (MST[a.status] || MST.ok).o - (MST[b.status] || MST.ok).o || String(a.name).localeCompare(String(b.name)));
  const founds = shown.filter((p) => p.status === "found"), rest = shown.filter((p) => p.status !== "found");
  const cnt = (k) => list.filter((p) => matchF(p, k)).length;
  const cur = list.find((p) => p.id === open);
  const empty = data && !data.error && list.length === 0;
  const lr = data && data.lastRun;
  const keys = (data && data.keys) || {};
  const hint = data && !data.error && (!keys.search ? "Suche nicht eingerichtet (GOOGLE_MAPS_API_KEY oder SERPAPI_KEY)" : !keys.screenshots ? "Verifizierung aus: SCREENSHOTONE_KEY fehlt" : "");
  const scanningName = run ? run.current : "";

  return (
    <div className="mon">
      <main className="wrap">
        <div className="mon-head">
          {hint ? <span className="hint">{hint}</span> : null}
          {!empty && <button className="btn" disabled={!!run || starting || !data} onClick={scanAll}><MI.scan />{run ? "Prüfung läuft…" : "Alle prüfen"}</button>}
          <button className="btn pri" onClick={() => setAdd(true)}><MI.plus />Profil</button>
        </div>
        {data && data.error && !list.length ? <div className="empty-f err-f">Monitor konnte nicht geladen werden: {data.error}</div> : null}
        {!data ? <div className="empty-f">Wird geladen …</div> : empty ? (
          <section className="empty">
            <span className="eic"><MI.eye /></span>
            <h2>Noch keine Profile in der Überwachung</h2>
            <p>Bucht ein Kunde „Tägliche Überwachung“ oder Schutz, erscheint sein gelöschtes Profil hier automatisch. Sie können Profile auch selbst hinzufügen.</p>
            <div className="how"><div><i>05:00</i><b>Täglicher Scan</b>Suche nach Name, Adresse und Profil-ID.</div><div><i>Fund</i><b>Sofortiger Alarm</b>Erst per Screenshot bestätigt, dann Push + E-Mail.</div><div><i>Lösung</i><b>Erneut löschen</b>Kunde informieren und Fund abschließen.</div></div>
            <button className="btn pri" onClick={() => setAdd(true)}><MI.plus />Profil hinzufügen</button>
          </section>
        ) : list.length ? (
          <>
            <section className="kpis">
              <div className="kpi"><div className="k"><MI.eye />Überwacht</div><div className="v">{active.length}<small>/ {list.length}</small></div><div className="s">{list.length - active.length} pausiert oder abgelaufen</div></div>
              <div className={"kpi" + (nFound ? " alarm" : "")}><div className="k"><MI.alert />Wieder erschienen</div><div className="v">{nFound}</div><div className="s">{nFound ? "Handlung nötig" : "Keine offenen Funde"}</div></div>
              <div className="kpi"><div className="k"><MI.clock />Letzter Scan</div><div className="v">{lr ? fmtTime(lr.finished_at || lr.started_at) : "—"}</div><div className="s">{lr ? dayLabel(lr.started_at) + " · " + Math.max(0, lr.done - lr.failed) + " ok · " + lr.failed + " fehlgeschlagen" : "Noch kein Scan"}</div></div>
              <div className="kpi"><div className="k"><MI.scan />Nächster Scan</div><div className="v">{data.nextRunAt ? fmtTime(data.nextRunAt) : "05:00"}</div><div className="s">{data.nextRunAt ? dayLabel(data.nextRunAt) : ""}</div></div>
            </section>
            {run && <section className="scanbar"><MI.scan c="sp" /><b>{run.done} von {run.total} geprüft</b><span className="bar"><i style={{ width: (run.total ? run.done / run.total * 100 : 0) + "%" }}></i></span><span className="t">{run.current ? "Prüfe " + run.current + "…" : ""}</span><button className="btn sm" onClick={cancel}>Abbrechen</button></section>}
            <div className="tools">
              <div className="chips">{FILTERS.map(([k, l]) => <button key={k} className={"chip" + (f === k ? " on" : "") + (k === "found" ? " alarm" : "")} onClick={() => setF(k)}>{l}<em>{cnt(k)}</em></button>)}</div>
              <div className="srch"><MI.search /><input placeholder="Firma, Kunde, Bestell-Nr.…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            </div>
            {founds.length > 0 && <>
              <div className="sec-h"><h2>Handlung nötig</h2><span className="n">{founds.length}</span></div>
              <section className="alerts">{founds.map((p) => (
                <div key={p.id} className="al" onClick={() => setOpen(p.id)}>
                  <Thumb p={p} />
                  <div className="body"><Status s="found" run={checkingIds.has(p.id) || scanningName === p.name} /><h3>{p.name}</h3><div className="ad">{p.address}</div><div className="when"><MI.clock />Gefunden {dayLabel(p.foundAt).replace(/^Heute$/, "heute")} {fmtTime(p.foundAt)}{p.custName ? " · " + p.custName : ""}</div>
                    <div className="acts"><button className="btn sm pri" onClick={(e) => { e.stopPropagation(); setOpen(p.id); }}>Ansehen</button><button className="btn sm" disabled={!p.custEmail} onClick={(e) => { e.stopPropagation(); inform(p); }}><MI.mail />Kunde informieren</button></div></div>
                </div>))}
              </section>
            </>}
            {(rest.length > 0 || !founds.length) && <section className="tbl">
              <div className="tr hd"><span>Profil</span><span>Kunde</span><span className="c-type">Art</span><span>Letzte Prüfung</span><span>Status</span><span></span></div>
              {rest.map((p) => {
                const runNow = checkingIds.has(p.id) || scanningName === p.name;
                return (
                  <div key={p.id} className={"tr" + (runNow ? " scanning" : "")} onClick={() => setOpen(p.id)}>
                    <div className="cell c-name"><b>{p.name}</b><span>{p.address || "—"}</span></div>
                    <div className="cell c-cust"><b>{p.custName || "—"}</b><span>{p.orderId || (p.source === "manual" ? "manuell" : "")}</span></div>
                    <div className="type c-type">{typeLabel(p.type)}</div>
                    <div className="cell n c-last">{p.status === "paused" ? "Pausiert seit " + fmtDate(p.pausedAt) : p.lastCheckAt ? fmtDT(p.lastCheckAt) : "— (05:00)"}</div>
                    <div className="c-st"><Status s={p.status} run={runNow} /></div>
                    <MI.right />
                  </div>
                );
              })}
              {!shown.length && <div className="empty-f">Keine Profile für diesen Filter.</div>}
            </section>}
          </>
        ) : null}
      </main>
      {cur && <Drawer p={cur} onClose={() => setOpen(null)} onChanged={load} toast={toast} onOpenOrder={(id) => { setOpen(null); onOpenOrder(id); }} scanning={checkingIds.has(cur.id) || scanningName === cur.name} />}
      {add && <AddModal orders={orders} toast={toast} onClose={() => setAdd(false)} onAdded={(id, name) => { setAdd(false); toast("„" + name + "“ wird überwacht ✓"); load().then(() => setOpen(id)); }} />}
    </div>
  );
}
