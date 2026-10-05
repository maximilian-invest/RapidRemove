"use client";
import React from "react";
import { fetchReportStats } from "@/lib/admin-api";

/* Datenreport-Statistik: NUR Aggregate aus dem neuen System (Sterne, Bewertungs-
   anzahl, Branchen, Gründe). Grundlage für den öffentlichen Report auf
   /en/google-business-profile-removal-report. Keine Namen, E-Mails, Place-IDs. */

const C = { ink: "#1c1916", muted: "#6b6259", border: "#ece7e1", soft: "#f6f3f0", bar: "#e67000" };
const STAR_KEYS = ["1.0-1.9", "2.0-2.9", "3.0-3.9", "4.0-4.4", "4.5-5.0", "none"];
const STAR_LBL = { none: "keine Bewertung" };
const REV_KEYS = ["0", "1-9", "10-49", "50-199", "200+", "unknown"];
const REV_LBL = { unknown: "unbekannt" };
const REASON_LBL = { closed: "Firma geschlossen", bad_reviews: "Schlechte/unfaire Bewertungen", wrong: "Falsches/doppeltes/fremdes Profil", moved: "Umzug/Inhaberwechsel", other: "Anderes" };
const fmt = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d).replace(".", ","));
const pct = (n, tot) => (tot ? Math.round((n / tot) * 100) : 0);

function Dist({ title, data, keys, labels = {} }) {
  const tot = keys.reduce((a, k) => a + (data[k] || 0), 0);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{title}</div>
      {keys.map((k) => (
        <div key={k} style={{ display: "grid", gridTemplateColumns: "120px 1fr 64px", gap: 8, alignItems: "center", fontSize: 13, margin: "3px 0" }}>
          <span style={{ color: C.ink, fontWeight: 600 }}>{labels[k] || k}</span>
          <span style={{ height: 10, background: C.soft, borderRadius: 4 }}><span style={{ display: "block", height: "100%", width: pct(data[k] || 0, tot) + "%", background: C.bar, borderRadius: 4 }} /></span>
          <span style={{ textAlign: "right", fontWeight: 700 }}>{data[k] || 0} · {pct(data[k] || 0, tot)} %</span>
        </div>
      ))}
    </div>
  );
}

function Block({ title, a }) {
  if (!a) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
        {a.from ? `${a.from.slice(0, 10)} – ${(a.to || "").slice(0, 10)}` : "keine Daten"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
        {[["Profile", a.n], ["Ø Sterne", fmt(a.avg, 2)], ["Median Sterne", fmt(a.median)], ["Median Bewertungen", a.medianReviews == null ? "—" : Math.round(a.medianReviews)]].map(([l, v]) => (
          <div key={l} style={{ background: C.soft, borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{v}</div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>
      {a.closed ? <div style={{ fontSize: 13, marginTop: 10, color: C.muted }}>Bei Auftrag schon „dauerhaft geschlossen“: <b style={{ color: C.ink }}>{a.closed} ({pct(a.closed, a.n)} %)</b></div> : null}
      <Dist title="Sterne" data={a.stars || {}} keys={STAR_KEYS} labels={STAR_LBL} />
      <Dist title="Anzahl Bewertungen" data={a.reviews || {}} keys={REV_KEYS} labels={REV_LBL} />
      {a.reasons && Object.keys(a.reasons).length ? <Dist title="Grund (optional angegeben)" data={a.reasons} keys={Object.keys(REASON_LBL)} labels={REASON_LBL} /> : null}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Top-Branchen (Google-Kategorie)</div>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {(a.categories || []).slice(0, 20).map((c) => (
              <tr key={c.cat} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "4px 0", color: C.ink }}>{c.cat}</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>{c.n}</td>
                <td style={{ textAlign: "right", color: C.muted, width: 70 }}>Ø {fmt(c.avg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportStatsDashboard({ toast }) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const load = React.useCallback(async () => {
    setLoading(true); setErr("");
    try { setData(await fetchReportStats()); } catch (e) { setErr(e.message || "Laden fehlgeschlagen."); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const copy = () => {
    try { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast && toast("Statistik kopiert ✓"); } catch (e) { /* kein Clipboard */ }
  };
  return (
    <div style={{ padding: "4px 0 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: C.ink }}>Report-Statistik</h2>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 4 }}>Nur Summen und Durchschnitte – Grundlage für den öffentlichen Datenreport. Je Google-Profil einmal gezählt.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={load} style={{ height: 38, padding: "0 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, background: "#fff", fontWeight: 700, cursor: "pointer" }}>Neu laden</button>
          {data ? <button onClick={copy} style={{ height: 38, padding: "0 14px", borderRadius: 9, border: "none", background: "#ff8000", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Als JSON kopieren</button> : null}
        </div>
      </div>
      {loading ? <div style={{ color: C.muted }}>Lädt …</div> : null}
      {err ? <div style={{ color: "#e23b3b", fontWeight: 700 }}>{err}</div> : null}
      {data ? (
        <div id="report-stats" data-json={JSON.stringify(data)} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 14 }}>
          <Block title="Geprüfte Profile (Gratis-Check)" a={data.checks} />
          <Block title="Gelöschte Profile (Status „Gelöscht“)" a={data.removals} />
          <Block title="Alle Profil-Aufträge (ohne Storno)" a={data.profileOrders} />
        </div>
      ) : null}
    </div>
  );
}
