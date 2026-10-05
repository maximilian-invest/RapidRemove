"use client";
import React from "react";
import { fetchReportStats } from "@/lib/admin-api";

/* Datenreport-Statistik: NUR Aggregate aus dem neuen System (Sterne, Bewertungs-
   anzahl, Branchen, Gründe). Grundlage für den öffentlichen Report auf
   /en/google-business-profile-removal-report. Keine Namen, E-Mails, Place-IDs.
   Layout nutzt die Admin-Bausteine (.kpis/.kpi, .panel, .grid-2, .chipf). */

const SETS = [
  ["removals", "Gelöschte Profile"],
  ["checks", "Geprüfte Profile"],
  ["profileOrders", "Alle Profil-Aufträge"],
];
const SET_HINT = {
  removals: "Profil-Aufträge mit Status „Gelöscht“ – Sterne zum Zeitpunkt der Bestellung.",
  checks: "Kostenlose Checks mit echtem Google-Profil (ohne Bewertungs-Produkt).",
  profileOrders: "Alle Profil-Aufträge ohne Stornos – inkl. offener.",
};
const STAR_KEYS = ["1.0-1.9", "2.0-2.9", "3.0-3.9", "4.0-4.4", "4.5-5.0"];
const REV_KEYS = ["0", "1-9", "10-49", "50-199", "200+"];
const REASON_LBL = { closed: "Firma geschlossen", bad_reviews: "Unfaire Bewertungen", wrong: "Falsches/doppeltes Profil", moved: "Umzug/Inhaberwechsel", other: "Anderes" };

const de = (v, d = 1) => (v == null ? "—" : Number(v).toFixed(d).replace(".", ","));
const pct = (n, tot) => (tot ? Math.round((n / tot) * 100) : 0);
const sum = (o, keys) => keys.reduce((a, k) => a + ((o && o[k]) || 0), 0);
const dateDe = (iso) => (iso ? new Date(iso).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");

function Bars({ data, keys, labels = {}, suffix = "" }) {
  const tot = sum(data, keys);
  const max = Math.max(1, ...keys.map((k) => (data && data[k]) || 0));
  return (
    <div className="rs-bars">
      {keys.map((k) => {
        const n = (data && data[k]) || 0;
        return (
          <div className="rs-row" key={k}>
            <div className="rs-lbl">{labels[k] || k}{suffix}</div>
            <div className="rs-track"><span style={{ width: `${(n / max) * 100}%` }} /></div>
            <div className="rs-val"><b>{pct(n, tot)} %</b><span>{n}</span></div>
          </div>
        );
      })}
    </div>
  );
}

function Kpi({ label, value, sub }) {
  return (
    <div className="kpi">
      <div className="kt">{label}</div>
      <div className="kv">{value}</div>
      {sub ? <div className="kd" style={{ color: "var(--fg-muted)" }}>{sub}</div> : null}
    </div>
  );
}

export function ReportStatsDashboard({ toast }) {
  const [data, setData] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [set, setSet] = React.useState("removals");
  const load = React.useCallback(async () => {
    setLoading(true); setErr("");
    try { setData(await fetchReportStats()); } catch (e) { setErr(e.message || "Laden fehlgeschlagen."); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const copy = () => {
    try { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast && toast("Statistik kopiert ✓"); } catch (e) { /* kein Clipboard */ }
  };

  const a = data && data[set];
  const rated = a ? sum(a.stars, STAR_KEYS) : 0;
  const below4 = a ? sum(a.stars, ["1.0-1.9", "2.0-2.9", "3.0-3.9"]) : 0;
  const revKnown = a ? sum(a.reviews, REV_KEYS) : 0;
  const unknownRev = (a && a.reviews && a.reviews.unknown) || 0;
  const reasons = (a && a.reasons) || {};
  const reasonTotal = sum(reasons, Object.keys(REASON_LBL));
  const cats = (a && a.categories) || [];
  const catMax = Math.max(1, ...cats.map((c) => c.n));
  const cmp = set === "removals" ? data && data.checks : data && data.removals;

  return (
    <div className="rs">
      <div className="rs-head">
        <div>
          <p className="rs-intro">Nur Summen und Durchschnitte – Grundlage für den öffentlichen Datenreport. Jedes Google-Profil wird einmal gezählt.</p>
          <div className="chips" style={{ marginTop: 14 }}>
            {SETS.map(([k, lab]) => (
              <button key={k} className={"chipf" + (set === k ? " on" : "")} onClick={() => setSet(k)}>
                {lab} {data && data[k] ? <span className="ct">{data[k].n}</span> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="rs-actions">
          <button className="btn btn-secondary" onClick={load} disabled={loading}>{loading ? "Lädt …" : "Neu laden"}</button>
          {data ? <button className="btn btn-primary" onClick={copy}>Als JSON kopieren</button> : null}
        </div>
      </div>

      {err ? <div className="panel" style={{ padding: 22, color: "var(--danger)", fontWeight: 700 }}>{err}</div> : null}
      {!data && loading ? <div className="panel" style={{ padding: 22, color: "var(--fg-muted)" }}>Statistik wird geladen …</div> : null}

      {a ? (
        <React.Fragment>
          <p className="rs-hint">{SET_HINT[set]} Zeitraum: {dateDe(a.from)} – {dateDe(a.to)}.</p>

          <div className="kpis rs-kpis">
            <Kpi label="Profile" value={a.n} sub={`${rated} davon mit Sternen`} />
            <Kpi label="Ø Sterne" value={de(a.avg, 2)}
              sub={`Median ${de(a.median)}${cmp && cmp.avg != null ? ` · ${set === "removals" ? "geprüft" : "gelöscht"} Ø ${de(cmp.avg, 2)}` : ""}`} />
            <Kpi label="Unter 4 Sternen" value={`${pct(below4, rated)} %`} sub={`unter 3 Sternen: ${pct(sum(a.stars, ["1.0-1.9", "2.0-2.9"]), rated)} %`} />
            <Kpi label="Median Rezensionen" value={a.medianReviews == null ? "—" : Math.round(a.medianReviews)}
              sub={`unter 10: ${pct(sum(a.reviews, ["0", "1-9"]), revKnown)} %`} />
          </div>

          <div className="grid-2 rs-grid">
            <div className="panel">
              <div className="panel-head"><div><h2>Sterne-Verteilung</h2><div className="ph-sub">Anteil an {rated} Profilen mit Bewertung</div></div></div>
              <div className="rs-body">
                <Bars data={a.stars} keys={STAR_KEYS} suffix=" ★" />
                {a.stars && a.stars.none ? <p className="rs-note">Ohne Bewertung: {a.stars.none} Profile ({pct(a.stars.none, a.n)} %)</p> : null}
                {a.closed ? <p className="rs-note">Bei Google bereits „dauerhaft geschlossen“: {a.closed} ({pct(a.closed, a.n)} %)</p> : null}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><div><h2>Anzahl Rezensionen</h2><div className="ph-sub">Anteil an {revKnown} Profilen mit bekannter Anzahl</div></div></div>
              <div className="rs-body">
                <Bars data={a.reviews} keys={REV_KEYS} />
                {unknownRev ? <p className="rs-note">Unbekannt: {unknownRev} – bei Checks vor dem 05.10.2026 wurde die Anzahl nicht zuverlässig gespeichert.</p> : null}
              </div>
            </div>
          </div>

          <div className="grid-2 rs-grid">
            <div className="panel">
              <div className="panel-head"><div><h2>Top-Kategorien</h2><div className="ph-sub">Google-Kategorie, wie angezeigt (Deutsch und Englisch gemischt)</div></div></div>
              {cats.length ? (
                <table className="tbl rs-cats">
                  <thead><tr><th>Kategorie</th><th style={{ width: "38%" }}>Profile</th><th style={{ textAlign: "right" }}>Ø Sterne</th></tr></thead>
                  <tbody>
                    {cats.slice(0, 15).map((c) => (
                      <tr key={c.cat}>
                        <td className="rs-cat">{c.cat}</td>
                        <td><div className="rs-inline"><span className="rs-track sm"><span style={{ width: `${(c.n / catMax) * 100}%` }} /></span><b>{c.n}</b></div></td>
                        <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{de(c.avg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="rs-body rs-note">Keine Kategorien vorhanden.</div>}
            </div>
            <div className="panel">
              <div className="panel-head"><div><h2>Gründe</h2><div className="ph-sub">Optionale Frage im Check – seit 05.10.2026</div></div></div>
              <div className="rs-body">
                {set !== "checks" ? <p className="rs-note">Gründe werden beim Check abgefragt – Ansicht „Geprüfte Profile“ wählen.</p>
                  : reasonTotal ? <Bars data={reasons} keys={Object.keys(REASON_LBL)} labels={REASON_LBL} />
                  : <p className="rs-note">Noch keine Angaben. Die Frage läuft seit heute – erste Werte in ein paar Tagen.</p>}
              </div>
            </div>
          </div>
        </React.Fragment>
      ) : null}
    </div>
  );
}
