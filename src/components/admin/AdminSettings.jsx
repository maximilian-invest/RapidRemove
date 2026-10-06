"use client";
/* Admin → Einstellungen & Admin → Partner.
   Einstellungen: automatische Weiterleitung neuer Bestellungen ans Partner-Board (Bewertungen / Profile).
   Partner: Liste der Lösch-Partner mit Kontakt (derzeit Reputation Vault). */
import React from "react";
import { partnerSettings, partnersList, partnerSave, partnerLink } from "@/lib/admin-api";

function Toggle({ on, busy, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} disabled={busy} className={"sw-tgl" + (on ? " on" : "")} onClick={() => onChange(!on)}>
      <span className="knob" />
    </button>
  );
}

export function AdminSettings({ toast }) {
  const [s, setS] = React.useState(null);
  const [busy, setBusy] = React.useState("");
  const [err, setErr] = React.useState("");
  React.useEffect(() => { partnerSettings().then(setS).catch((e) => setErr(e.message)); }, []);
  const set = async (key, val) => {
    setBusy(key);
    try { const r = await partnerSettings({ [key]: val }); setS(r); toast(`Weiterleitung ${key === "autoReviews" ? "Bewertungen" : "Profile"}: ${val ? "an" : "aus"} ✓`); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy("");
  };
  const rows = [
    ["autoReviews", "Bewertungen", "Neue Bestellung „Einzelne Bewertungen löschen“ → jede Bewertung landet sofort als Aufgabe im Partner-Board (Kunde = Profilname)."],
    ["autoProfiles", "Profile", "Neue Profil-Bestellung (Löschung, Neustart, Express) → das Google-Profil landet als eine Aufgabe im Partner-Board (Partnerpreis 50 USD, je Aufgabe änderbar)."],
  ];
  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head"><div><h2>Automatische Weiterleitung an Partner</h2><div className="ph-sub">Gilt für neue Bestellungen ab dem Einschalten. Stornierte Aufträge verschwinden automatisch vom Board.</div></div></div>
        {err ? <div className="set-err">{err}</div> : null}
        {rows.map(([key, title, desc]) => (
          <div key={key} className="set-row">
            <div className="set-txt"><b>{title}</b><span>{desc}</span></div>
            {s ? <Toggle on={s[key]} busy={busy === key} label={title} onChange={(v) => set(key, v)} /> : <span className="muted">…</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

const EMPTY = { id: 0, name: "", email: "", phone: "", note: "", active: true };

export function AdminPartners({ toast }) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [edit, setEdit] = React.useState(null);
  const [link, setLink] = React.useState("");
  const load = React.useCallback(() => partnersList().then((r) => { setData(r); setErr(""); }).catch((e) => setErr(e.message)), []);
  React.useEffect(() => { load(); partnerLink().then((r) => setLink(r.url)).catch(() => {}); }, [load]);
  const save = async () => {
    try { await partnerSave(edit); toast("Partner gespeichert ✓"); setEdit(null); load(); }
    catch (e) { toast("Fehler: " + e.message); }
  };
  const usd = (v) => "$" + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  const copy = async (txt, msg) => { try { await navigator.clipboard.writeText(txt); toast(msg); } catch (e) { toast("Kopieren nicht möglich"); } };
  const b = (data && data.board) || {};
  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <div><h2>Partner</h2><div className="ph-sub">Lösch-Partner, an die Bewertungen und Profile weitergeleitet werden.</div></div>
          <div className="ph-right"><button className="btn btn-sec btn-sm" onClick={() => setEdit({ ...EMPTY })}>+ Partner anlegen</button></div>
        </div>
        {err ? <div className="set-err">{err}</div> : null}
        {!data && !err ? <div className="set-row"><span className="muted">Lädt …</span></div> : null}
        {data && !data.partners.length ? <div className="set-row"><span className="muted">Noch keine Partner.</span></div> : null}
        {data && data.partners.map((p) => (
          <div key={p.id} className="pt-row">
            <div className="pt-ava">{p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="pt-main">
              <div className="pt-name">{p.name} {p.active ? <span className="pt-tag on">aktiv</span> : <span className="pt-tag">inaktiv</span>}</div>
              <div className="pt-meta">
                {p.email ? <a href={"mailto:" + p.email}>{p.email}</a> : <span className="muted">keine E-Mail</span>}
                {p.phone ? <> · <a href={"https://wa.me/" + p.phone.replace(/[^\d]/g, "")} target="_blank" rel="noopener noreferrer">{p.phone}</a></> : null}
                {p.note ? <> · <span className="muted">{p.note}</span></> : null}
              </div>
              {p.active ? (
                <div className="pt-kpis">
                  <span><b>{b.open || 0}</b> offen</span><span><b>{b.removed || 0}</b> gelöscht</span>
                  <span><b>{usd(b.owedUsd)}</b> offen zu zahlen</span><span><b>{usd(b.paidUsd)}</b> bezahlt</span>
                </div>
              ) : null}
            </div>
            <div className="pt-acts">
              {p.active && link ? <button className="btn btn-sec btn-sm" onClick={() => copy(link, "Partner-Link kopiert ✓")}>Board-Link kopieren</button> : null}
              <button className="btn btn-sec btn-sm" onClick={() => setEdit({ ...p })}>Bearbeiten</button>
            </div>
          </div>
        ))}
      </div>

      {edit ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head"><h2>{edit.id ? "Partner bearbeiten" : "Partner anlegen"}</h2></div>
          <div className="pt-form">
            {[["name", "Name *"], ["email", "E-Mail"], ["phone", "Telefon / WhatsApp"], ["note", "Notiz"]].map(([k, l]) => (
              <label key={k}><span>{l}</span><input value={edit[k] || ""} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></label>
            ))}
            <label className="pt-chk"><input type="checkbox" checked={!!edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> aktiv</label>
            <div className="pt-formacts">
              <button className="btn btn-pri btn-sm" disabled={!edit.name.trim()} onClick={save}>Speichern</button>
              <button className="btn btn-sec btn-sm" onClick={() => setEdit(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
