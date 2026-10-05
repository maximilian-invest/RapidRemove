"use client";
/* Partner board (rapid-remove.com/partner#<secret>) — for our review-removal partner.
   Shows ONLY task code, review link, type, price and status; no customer data.
   The partner updates the status with one tap; we see it instantly in our admin. */
import React from "react";
import "@/styles/partner.css";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const KEY = "rr_partner_t";

const STATUS = {
  new: { label: "New", cls: "new" },
  working: { label: "Working on it", cls: "working" },
  removed: { label: "Removed ✓", cls: "removed" },
  not_possible: { label: "Not possible", cls: "no" },
  software: { label: "Software only", cls: "soft" },
};
const KIND = { normal: "New review", old: "Older than 4 weeks", nt: "No text · software" };
const usd = (v) => "$" + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const ago = (iso) => {
  if (!iso) return "";
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
};

async function call(path, body) {
  const res = await fetch(OPS + "/partner/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) throw new Error(j.error || "HTTP " + res.status);
  return j;
}

function TaskCard({ t, token, onSaved }) {
  const [note, setNote] = React.useState(t.note || "");
  const [busy, setBusy] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => { setNote(t.note || ""); }, [t.note]);
  const save = async (status) => {
    setBusy(status || "note");
    try { await call("update", { t: token, id: t.id, ...(status ? { status } : {}), note }); onSaved(); }
    catch (e) { alert("Could not save: " + e.message); }
    setBusy("");
  };
  const s = STATUS[t.status] || STATUS.new;
  const copy = async () => { try { await navigator.clipboard.writeText(t.url || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) {} };
  const locked = !!t.paid;
  return (
    <div className={"pt-card st-" + s.cls}>
      <div className="pt-head">
        <span className="pt-code">{t.code}</span>
        <span className={"pt-kind k-" + t.kind}>{KIND[t.kind] || t.kind}</span>
        <span className="pt-price">{usd(t.price)}</span>
        <span className={"pt-status s-" + s.cls}>{s.label}{t.paid ? " · paid" : ""}</span>
      </div>
      {t.url ? (
        <div className="pt-linkrow">
          <a className="pt-open" href={t.url} target="_blank" rel="noopener noreferrer">Open review ↗</a>
          <button type="button" className="pt-copy" onClick={copy}>{copied ? "Copied ✓" : "Copy link"}</button>
        </div>
      ) : null}
      {t.reviewer || t.text ? <div className="pt-review"><b>{t.reviewer || "Reviewer"}</b>{t.text ? <>: “{t.text.length > 220 ? t.text.slice(0, 220) + " …" : t.text}”</> : <i> (no text)</i>}</div> : null}
      <div className="pt-meta">Sent {ago(t.created)}{t.updated !== t.created ? ` · updated ${ago(t.updated)}` : ""}</div>
      {!locked ? (
        <>
          <div className="pt-btns">
            <button type="button" className={"b-working" + (t.status === "working" ? " on" : "")} disabled={!!busy} onClick={() => save("working")}>Working</button>
            <button type="button" className={"b-removed" + (t.status === "removed" ? " on" : "")} disabled={!!busy} onClick={() => save("removed")}>Removed ✓</button>
            <button type="button" className={"b-no" + (t.status === "not_possible" ? " on" : "")} disabled={!!busy} onClick={() => save("not_possible")}>Not possible</button>
            <button type="button" className={"b-soft" + (t.status === "software" ? " on" : "")} disabled={!!busy} onClick={() => save("software")}>Software only</button>
          </div>
          <div className="pt-noterow">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional) – e.g. reason or ETA" maxLength={500} />
            <button type="button" disabled={!!busy || note === (t.note || "")} onClick={() => save("")}>Save note</button>
          </div>
        </>
      ) : t.note ? <div className="pt-review">Note: {t.note}</div> : null}
    </div>
  );
}

export default function PartnerBoard() {
  const [token, setToken] = React.useState("");
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [tab, setTab] = React.useState("todo");
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    let t = "";
    try { t = (window.location.hash || "").replace(/^#/, ""); } catch (e) {}
    if (t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    else { try { t = localStorage.getItem(KEY) || ""; } catch (e) {} }
    setToken(t);
  }, []);

  const load = React.useCallback(async () => {
    if (!token) return;
    try { setData(await call("tasks", { t: token })); setErr(""); }
    catch (e) { setErr(e.message === "invalid link" ? "This link is not valid (anymore). Please ask RapidRemove for the current link." : "Could not load: " + e.message); }
  }, [token]);
  React.useEffect(() => { load(); const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

  if (!OPS) return <div className="pt-wrap"><p>Not configured.</p></div>;
  if (!token) return <div className="pt-wrap"><h1 className="pt-h">Partner Board</h1><p className="pt-muted">Please open the personal link you received from RapidRemove.</p></div>;

  const tasks = (data && data.tasks) || [];
  const tot = (data && data.totals) || {};
  const qq = q.trim().toLowerCase();
  const shown = tasks.filter((t) => {
    if (qq && !(`${t.code} ${t.url || ""} ${t.reviewer || ""}`.toLowerCase().includes(qq))) return false;
    if (tab === "todo") return ["new", "working", "software"].includes(t.status);
    if (tab === "removed") return t.status === "removed";
    if (tab === "no") return t.status === "not_possible";
    return true;
  });
  const cnt = (f) => tasks.filter(f).length;

  return (
    <div className="pt-wrap">
      <header className="pt-top">
        <div>
          <div className="pt-brand">RapidRemove × Partner</div>
          <h1 className="pt-h">Review tasks</h1>
        </div>
        <button type="button" className="pt-refresh" onClick={load}>Refresh</button>
      </header>

      {err ? <div className="pt-err">{err}</div> : null}

      <div className="pt-kpis">
        <div><b>{tot.open || 0}</b><span>open</span></div>
        <div><b>{tot.removed || 0}</b><span>removed</span></div>
        <div className="hl"><b>{usd(tot.owedUsd)}</b><span>to be paid ({tot.owedCount || 0})</span></div>
        <div><b>{usd(tot.paidUsd)}</b><span>paid</span></div>
      </div>

      <div className="pt-howto">
        <b>How it works:</b> every review has its own number (e.g. RV-0012). Tap <b>Working</b> when you start, <b>Removed ✓</b> when it is gone,
        <b> Not possible</b> if it can't be removed, or <b>Software only</b> if it needs the software. Please always refer to the number in WhatsApp.
      </div>

      <div className="pt-tabs">
        <button type="button" className={tab === "todo" ? "on" : ""} onClick={() => setTab("todo")}>To do ({cnt((t) => ["new", "working", "software"].includes(t.status))})</button>
        <button type="button" className={tab === "removed" ? "on" : ""} onClick={() => setTab("removed")}>Removed ({cnt((t) => t.status === "removed")})</button>
        <button type="button" className={tab === "no" ? "on" : ""} onClick={() => setTab("no")}>Not possible ({cnt((t) => t.status === "not_possible")})</button>
        <button type="button" className={tab === "all" ? "on" : ""} onClick={() => setTab("all")}>All ({tasks.length})</button>
        <input className="pt-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search RV-number …" />
      </div>

      {!data && !err ? <p className="pt-muted">Loading …</p> : null}
      {data && !shown.length ? <p className="pt-muted">Nothing here right now.</p> : null}
      <div className="pt-list">
        {shown.map((t) => <TaskCard key={t.id} t={t} token={token} onSaved={load} />)}
      </div>

      {data && data.payouts && data.payouts.length ? (
        <div className="pt-payouts">
          <b>Payments</b>
          {data.payouts.map((p) => <div key={p.id}>{new Date(p.created).toLocaleDateString("en-GB")} · {p.tasks} review(s) · <b>{usd(p.amount)}</b></div>)}
        </div>
      ) : null}
      <p className="pt-foot">Private link – please don't share it. Contact: helpdesk@rapid-remove.com</p>
    </div>
  );
}
