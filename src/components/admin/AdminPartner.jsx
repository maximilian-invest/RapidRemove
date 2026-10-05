"use client";
/* Admin → Partner-Board: alle an den Lösch-Partner übergebenen Bewertungen,
   Status (setzt der Partner über seinen geheimen Link), offene Beträge,
   „als bezahlt markieren", Partner-Link + WhatsApp-Text kopieren. */
import React from "react";
import { partnerTasks, partnerUpdate, partnerPay, partnerLink } from "@/lib/admin-api";
import { groupByCustomer } from "@/lib/partner-group";

export const PARTNER_STATUS = {
  new: { label: "Neu", color: "#6b7280" },
  working: { label: "Partner arbeitet", color: "#2f6db3" },
  removed: { label: "Gelöscht ✓", color: "#15803d" },
  not_possible: { label: "Nicht möglich", color: "#b91c1c" },
  software: { label: "Nur per Software", color: "#6b3fb5" },
  cancelled: { label: "Storniert", color: "#9ca3af" },
};
export const PARTNER_KIND = { normal: "normal", old: "alt (> 4 Wo.)", nt: "ohne Text" };

export function PartnerBadge({ task }) {
  if (!task) return null;
  const s = PARTNER_STATUS[task.status] || PARTNER_STATUS.new;
  return (
    <span className="pb-badge" style={{ color: s.color, borderColor: s.color }} title={task.note ? "Partner: " + task.note : ""}>
      {task.code} · {s.label}{task.paid ? " · bezahlt" : ""}
    </span>
  );
}

const usd = (v) => "$" + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const ago = (iso) => {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.round(m / 60);
  if (h < 48) return `vor ${h} Std.`;
  return `vor ${Math.round(h / 24)} T.`;
};

/** WhatsApp-Text für eine Liste von Aufgaben — nach Kunde (Profilname) gegliedert, keine Besteller-Daten. */
export function partnerWhatsAppText(tasks, link) {
  const line = (t) => `${t.code} (${t.kind === "nt" ? "no text" : t.kind === "old" ? "older" : "new"}) – ${t.url || `${t.reviewer || t.name || ""}: "${(t.text || "").slice(0, 80)}"`}`;
  const blocks = groupByCustomer(tasks, "Other").map(([cust, list]) => `*${cust}* (${list.length})\n${list.map(line).join("\n")}`);
  return `New reviews for you (${tasks.length}):\n\n${blocks.join("\n\n")}\n\nPlease update the status here: ${link || "(partner board link)"}`;
}

export function AdminPartner({ toast }) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [filter, setFilter] = React.useState("open");
  const [sel, setSel] = React.useState({});
  const [link, setLink] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const load = React.useCallback(async () => {
    try { setData(await partnerTasks()); setErr(""); } catch (e) { setErr(e.message); }
  }, []);
  React.useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);
  React.useEffect(() => { partnerLink().then((r) => setLink(r.url)).catch(() => {}); }, []);

  const tasks = (data && data.tasks) || [];
  const tot = (data && data.totals) || {};
  const shown = tasks.filter((t) =>
    filter === "open" ? ["new", "working", "software"].includes(t.status)
      : filter === "owed" ? t.status === "removed" && !t.paid
        : filter === "done" ? t.status === "removed"
          : filter === "no" ? t.status === "not_possible"
            : true);
  const selIds = Object.keys(sel).filter((k) => sel[k]).map(Number);
  const selOwed = tasks.filter((t) => selIds.includes(t.id) && t.status === "removed" && !t.paid);

  const copy = async (txt, msg) => {
    try { await navigator.clipboard.writeText(txt); toast(msg || "Kopiert ✓"); } catch (e) { toast("Kopieren nicht möglich"); }
  };
  const pay = async () => {
    if (!selOwed.length || busy) return;
    setBusy(true);
    try {
      const r = await partnerPay(selOwed.map((t) => t.id));
      toast(`${r.tasks} Aufgabe(n) als bezahlt markiert · ${usd(r.amount)}`);
      setSel({}); load();
    } catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const setStatus = async (t, status) => {
    try { await partnerUpdate(t.id, { status }); load(); } catch (e) { toast("Fehler: " + e.message); }
  };
  const setPrice = async (t) => {
    const v = window.prompt(`Partnerpreis für ${t.code} in USD`, String(t.price));
    if (v == null) return;
    try { await partnerUpdate(t.id, { price: Number(String(v).replace(",", ".")) }); load(); } catch (e) { toast("Fehler: " + e.message); }
  };
  const rotate = async () => {
    if (!window.confirm("Neuen Partner-Link erzeugen? Der alte Link funktioniert dann nicht mehr.")) return;
    try { const r = await partnerLink(true); setLink(r.url); copy(r.url, "Neuer Link erzeugt und kopiert ✓"); } catch (e) { toast("Fehler: " + e.message); }
  };
  const newOnes = tasks.filter((t) => t.status === "new");

  return (
    <div className="content pb">
      <div className="pb-kpis">
        <div className="pb-kpi"><b>{tot.open || 0}</b><span>offen beim Partner</span></div>
        <div className="pb-kpi"><b>{tot.removed || 0}</b><span>gelöscht gesamt</span></div>
        <div className="pb-kpi warn"><b>{usd(tot.owedUsd)}</b><span>offen an Partner ({tot.owedCount || 0})</span></div>
        <div className="pb-kpi"><b>{usd(tot.paidUsd)}</b><span>bereits bezahlt</span></div>
      </div>

      <div className="pb-panel">
        <div className="pb-row">
          <b>Partner-Link</b>
          <code className="pb-link">{link ? link.replace(/#.*/, "#••••••") : "…"}</code>
          <button className="btn btn-sec btn-sm" disabled={!link} onClick={() => copy(link, "Partner-Link kopiert ✓")}>Link kopieren</button>
          <button className="btn btn-sec btn-sm" onClick={rotate}>Neuen Link erzeugen</button>
          <button className="btn btn-pri btn-sm" disabled={!newOnes.length} onClick={() => copy(partnerWhatsAppText(newOnes, link), `WhatsApp-Text (${newOnes.length} neue) kopiert ✓`)}>
            WhatsApp-Text: {newOnes.length} neue kopieren
          </button>
        </div>
        <p className="muted pb-hint">Neue Bewertungs-Bestellungen landen automatisch auf dem Board (Kunde = Profilname). Storno nimmt offene Aufgaben wieder herunter. Der Partner sieht keine Kontaktdaten der Besteller.</p>
      </div>

      <div className="pb-tabs">
        {[["open", "Offen"], ["owed", "Zu bezahlen"], ["done", "Gelöscht"], ["no", "Nicht möglich"], ["all", "Alle"]].map(([k, l]) => (
          <button key={k} className={"pb-tab" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
        ))}
        {selOwed.length ? <button className="btn btn-pri btn-sm" style={{ marginLeft: "auto" }} disabled={busy} onClick={pay}>{selOwed.length} als bezahlt markieren · {usd(selOwed.reduce((s, t) => s + t.price, 0))}</button> : null}
      </div>

      {err ? <div className="pb-err">{err}</div> : null}
      {!data ? <p className="muted">Lädt …</p> : !shown.length ? <p className="muted">Keine Aufgaben in diesem Filter.</p> : (
        <div className="pb-table">
          {groupByCustomer(shown, "Ohne Kunde").map(([cust, list]) => (
          <React.Fragment key={cust}>
          <div className="pb-ghead"><b>{cust}</b><span className="muted"> · {list.length} Bewertung{list.length === 1 ? "" : "en"} · {list.filter((t) => t.status === "removed").length} gelöscht · {usd(list.reduce((s, t) => s + Number(t.price || 0), 0))}</span></div>
          {list.map((t) => {
            const s = PARTNER_STATUS[t.status] || PARTNER_STATUS.new;
            return (
              <div key={t.id} className="pb-tr">
                <input type="checkbox" checked={!!sel[t.id]} onChange={() => setSel((m) => ({ ...m, [t.id]: !m[t.id] }))} disabled={!(t.status === "removed" && !t.paid)} title="Gelöscht & unbezahlt → auswählbar" />
                <div className="pb-main">
                  <div className="pb-top">
                    <b>{t.code}</b>
                    <span className="pb-kind">{PARTNER_KIND[t.kind] || t.kind}</span>
                    <button className="pb-price" onClick={() => setPrice(t)} title="Preis ändern">{usd(t.price)}</button>
                    <span className="pb-st" style={{ color: s.color }}>{s.label}{t.paid ? " · bezahlt" : ""}</span>
                    <span className="muted">{ago(t.updated)}</span>
                    {t.orderId ? <span className="muted">· Auftrag {t.orderId}</span> : null}
                  </div>
                  {t.url ? <a href={t.url} target="_blank" rel="noopener noreferrer" className="pb-url">{t.url}</a> : <span className="pb-url">{t.name}: „{t.text}“</span>}
                  {t.note ? <div className="pb-note">Partner: {t.note}</div> : null}
                </div>
                <div className="pb-acts">
                  {t.status !== "cancelled" && !t.paid ? <button className="btn btn-sec btn-sm" onClick={() => setStatus(t, "cancelled")} title="Kunde storniert / nicht mehr bearbeiten">Storno</button> : null}
                  {t.status === "cancelled" ? <button className="btn btn-sec btn-sm" onClick={() => setStatus(t, "new")}>Reaktivieren</button> : null}
                </div>
              </div>
            );
          })}
          </React.Fragment>
          ))}
        </div>
      )}

      {data && data.payouts && data.payouts.length ? (
        <div className="pb-panel" style={{ marginTop: 18 }}>
          <b>Auszahlungen an den Partner</b>
          {data.payouts.map((p) => <div key={p.id} className="pb-pay">#{p.id} · {new Date(p.created).toLocaleDateString("de-AT")} · {p.tasks} Aufgabe(n) · <b>{usd(p.amount)}</b>{p.note ? " · " + p.note : ""}</div>)}
        </div>
      ) : null}
    </div>
  );
}
