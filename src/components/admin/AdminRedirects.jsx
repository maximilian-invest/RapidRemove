"use client";
import React from "react";
import { fetchRedirects, saveRedirect, deleteRedirect } from "@/lib/admin-api";
import { AdminIcon as AI } from "./AdminIcons";

/* 301/302-Weiterleitungen verwalten. Speichert im ops-Backend; die Middleware
   der Marketing-Site übernimmt aktive Regeln binnen ~1 Minute (ohne Deploy). */

const C = {
  ink: "#1c1916", muted: "#6b6259", border: "#ece7e1", soft: "#f6f3f0",
  primary: "#ff8000", danger: "#e23b3b", ok: "#0a8a4a",
};
const EMPTY = { id: null, source: "", destination: "", code: 301, enabled: true };

const input = {
  width: "100%", height: 42, border: `1.5px solid #e2dcd5`, borderRadius: 9,
  padding: "0 12px", fontSize: 14, boxSizing: "border-box", background: "#fff", color: C.ink,
};
const btn = (bg, fg = "#fff") => ({
  height: 42, padding: "0 16px", border: "none", borderRadius: 9, background: bg, color: fg,
  fontWeight: 800, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap",
});
const ghost = {
  height: 36, padding: "0 12px", border: `1.5px solid ${C.border}`, borderRadius: 9,
  background: "#fff", color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer",
};

export function RedirectsDashboard({ toast }) {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState(EMPTY);
  const [busy, setBusy] = React.useState(false);
  const [q, setQ] = React.useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.rapid-remove.com";

  const load = React.useCallback(async () => {
    setLoading(true); setError("");
    try { const r = await fetchRedirects(); setList(r.redirects || []); if (!r.db) setError("Keine Datenbank verbunden – Weiterleitungen können nicht gespeichert werden."); }
    catch (e) { setError(e.message || "Laden fehlgeschlagen."); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const edit = (r) => { setForm({ id: r.id, source: r.source, destination: r.destination, code: r.code || 301, enabled: r.enabled !== false }); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); };
  const reset = () => setForm(EMPTY);

  const save = async () => {
    if (!form.source.trim() || !form.destination.trim()) { toast && toast("Quelle und Ziel angeben."); return; }
    setBusy(true);
    try {
      await saveRedirect(form);
      toast && toast(form.id ? "Weiterleitung aktualisiert ✓" : "Weiterleitung angelegt ✓");
      reset(); await load();
    } catch (e) { toast && toast("Fehler: " + (e.message || e)); }
    finally { setBusy(false); }
  };

  const toggle = async (r) => {
    try { await saveRedirect({ id: r.id, source: r.source, destination: r.destination, code: r.code, enabled: !r.enabled }); await load(); }
    catch (e) { toast && toast("Fehler: " + (e.message || e)); }
  };

  const remove = async (r) => {
    if (typeof window !== "undefined" && !window.confirm(`Weiterleitung „${r.source}" wirklich löschen?`)) return;
    try { await deleteRedirect(r.id); toast && toast("Weiterleitung gelöscht ✓"); await load(); }
    catch (e) { toast && toast("Fehler: " + (e.message || e)); }
  };

  const filtered = list.filter((r) => {
    const s = q.trim().toLowerCase();
    return !s || r.source.toLowerCase().includes(s) || String(r.destination).toLowerCase().includes(s);
  });

  return (
    <div style={{ padding: "18px 20px 60px", maxWidth: 1040, margin: "0 auto" }}>
      {/* Formular */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: C.ink, marginBottom: 4 }}>{form.id ? "Weiterleitung bearbeiten" : "Neue Weiterleitung"}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
          Quelle ist der alte Pfad (z. B. <code>/alte-seite</code> – vollständige URLs werden automatisch gekürzt). Ziel ist der neue Pfad (<code>/neue-seite</code>) oder eine vollständige URL.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Quelle (alter Pfad)</label>
            <input style={input} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="/alte-url" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: "block", marginBottom: 5 }}>Ziel (neuer Pfad oder URL)</label>
            <input style={input} value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="/neue-url" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 14, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginRight: 8 }}>Typ</label>
            <select style={{ ...input, width: "auto", height: 42, display: "inline-block" }} value={form.code} onChange={(e) => setForm({ ...form, code: Number(e.target.value) })}>
              <option value={301}>301 — dauerhaft (SEO)</option>
              <option value={302}>302 — temporär</option>
              <option value={307}>307 — temporär (Methode)</option>
              <option value={308}>308 — dauerhaft (Methode)</option>
            </select>
          </div>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.ink, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> aktiv
          </label>
          <div style={{ flex: 1 }} />
          {form.id ? <button style={ghost} onClick={reset} disabled={busy}>Abbrechen</button> : null}
          <button style={btn(C.primary)} onClick={save} disabled={busy}>{busy ? "Speichert…" : form.id ? "Änderungen speichern" : "Weiterleitung anlegen"}</button>
        </div>
      </div>

      {/* Hinweis + Suche */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: C.muted, background: "#fff7ee", border: "1px solid #ffe2c2", borderRadius: 8, padding: "7px 11px", fontWeight: 600 }}>
          Aktive Regeln greifen binnen ~1 Minute (Cache) – ohne Deploy.
        </div>
        <div style={{ flex: 1 }} />
        <input style={{ ...input, width: 240, height: 38 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtern…" />
        <button style={ghost} onClick={load}>Aktualisieren</button>
      </div>

      {error ? <div style={{ color: C.danger, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{error}</div> : null}

      {/* Liste */}
      <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 30, color: C.muted, fontSize: 14 }}>Lädt…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 30, color: C.muted, fontSize: 14 }}>{list.length === 0 ? "Noch keine Weiterleitungen angelegt." : "Keine Treffer."}</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.muted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  <th style={{ padding: "11px 14px", fontWeight: 700 }}>Quelle → Ziel</th>
                  <th style={{ padding: "11px 8px", fontWeight: 700 }}>Typ</th>
                  <th style={{ padding: "11px 8px", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "11px 8px", fontWeight: 700, textAlign: "right" }}>Treffer</th>
                  <th style={{ padding: "11px 14px", fontWeight: 700, textAlign: "right" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderTop: `1px solid ${C.border}`, opacity: r.enabled ? 1 : 0.55 }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontWeight: 700, color: C.ink, wordBreak: "break-all" }}>{r.source}</div>
                      <div style={{ color: C.muted, wordBreak: "break-all", display: "flex", alignItems: "center", gap: 5 }}><AI.external size={12} /> {r.destination}</div>
                    </td>
                    <td style={{ padding: "11px 8px", fontWeight: 800, color: r.code === 301 || r.code === 308 ? C.ok : C.muted }}>{r.code}</td>
                    <td style={{ padding: "11px 8px" }}>
                      <button onClick={() => toggle(r)} title="Aktiv/aus" style={{ border: "none", background: "none", cursor: "pointer", fontWeight: 800, fontSize: 12.5, color: r.enabled ? C.ok : C.muted }}>
                        {r.enabled ? "● aktiv" : "○ aus"}
                      </button>
                    </td>
                    <td style={{ padding: "11px 8px", textAlign: "right", color: C.muted, fontVariantNumeric: "tabular-nums" }}>{r.hits ?? 0}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <a href={origin + r.source} target="_blank" rel="noopener noreferrer" title="Testen" style={{ ...ghost, display: "inline-flex", alignItems: "center", textDecoration: "none", marginRight: 6 }}>Test ↗</a>
                      <button style={{ ...ghost, marginRight: 6 }} onClick={() => edit(r)}>Bearbeiten</button>
                      <button style={{ ...ghost, color: C.danger, borderColor: "#f3c7c7" }} onClick={() => remove(r)}>Löschen</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
