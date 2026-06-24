"use client";
import React from "react";
import { resetTestData, resetChecks } from "@/lib/admin-api";

/* Gefahrenzone: einmaliges Leeren aller Test-Bestelldaten vor dem echten Start.
   Doppelt abgesichert (Tippen von „LÖSCHEN" + serverseitiges Bestätigungswort). */
export function DangerZone({ toast, onDone }) {
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(null);
  const [busyChecks, setBusyChecks] = React.useState(false);

  // Nur die Profil-Prüfungen (Funnel/Leads) zurücksetzen – Bestellungen bleiben.
  const runChecks = async () => {
    const typed = typeof window !== "undefined"
      ? window.prompt("Nur die Profil-Prüfungen (Funnel/Leads) zurücksetzen?\n\nBestellungen, Zahlungen und der Verlauf bleiben erhalten. Nicht umkehrbar. Zum Bestätigen LÖSCHEN eintippen:")
      : null;
    if (!typed || typed.trim().toUpperCase() !== "LÖSCHEN") { toast && toast("Abgebrochen."); return; }
    setBusyChecks(true);
    try {
      const r = await resetChecks();
      toast && toast(`Zurückgesetzt: ${r.checks} Prüfungen ✓`);
      onDone && onDone();
    } catch (e) {
      toast && toast("Fehler: " + (e.message || e));
    } finally { setBusyChecks(false); }
  };

  const run = async () => {
    const typed = typeof window !== "undefined"
      ? window.prompt("Wirklich ALLE Bestellungen, Profil-Prüfungen und den Verlauf endgültig löschen?\n\nDas kann nicht rückgängig gemacht werden. Zum Bestätigen LÖSCHEN eintippen:")
      : null;
    if (!typed || typed.trim().toUpperCase() !== "LÖSCHEN") { toast && toast("Abgebrochen."); return; }
    setBusy(true);
    try {
      const r = await resetTestData();
      setDone(r);
      toast && toast(`Gelöscht: ${r.orders} Bestellungen · ${r.checks} Prüfungen ✓`);
      onDone && onDone();
    } catch (e) {
      toast && toast("Fehler: " + (e.message || e));
    } finally { setBusy(false); }
  };

  return (
    <div style={{ padding: "0 20px 44px", maxWidth: 1040, margin: "0 auto" }}>
      {/* Nur Prüfungen zurücksetzen – mildere Variante, Bestellungen bleiben */}
      <div style={{ background: "#fff", border: "1px solid #ffe0b8", borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#b45309" }}>Prüfungen zurücksetzen</div>
        <div style={{ fontSize: 13, color: "#6b6259", margin: "6px 0 14px", lineHeight: 1.5, maxWidth: 640 }}>
          Löscht <b>nur die Profil-Prüfungen</b> (Funnel/Leads) – für eine saubere Messung des Trichters.
          <b> Bestellungen, Zahlungen und der Verlauf bleiben erhalten.</b> Nicht umkehrbar.
        </div>
        <button onClick={runChecks} disabled={busyChecks} style={{ height: 42, padding: "0 18px", border: "none", borderRadius: 9, background: "#f59e0b", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", opacity: busyChecks ? 0.7 : 1 }}>
          {busyChecks ? "Setze zurück…" : "Nur Prüfungen zurücksetzen"}
        </button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #f3c7c7", borderRadius: 16, padding: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#b42318" }}>Gefahrenzone</div>
        <div style={{ fontSize: 13, color: "#6b6259", margin: "6px 0 14px", lineHeight: 1.5, maxWidth: 640 }}>
          Löscht <b>alle</b> Bestellungen, Profil-Prüfungen, den Aktivitäts-Verlauf und geplante Upsell-Mails aus der
          Datenbank — für den sauberen Start. Deine installierten Admin-Geräte (Push-Benachrichtigungen) bleiben
          erhalten. <b>Nicht umkehrbar.</b>
        </div>
        {done ? (
          <div style={{ fontSize: 13, color: "#0a8a4a", fontWeight: 700, marginBottom: 12 }}>
            Gelöscht: {done.orders} Bestellungen · {done.checks} Prüfungen · {done.events} Verlaufseinträge · {done.upsell} Upsell-Mails.
          </div>
        ) : null}
        <button onClick={run} disabled={busy} style={{ height: 42, padding: "0 18px", border: "none", borderRadius: 9, background: "#e23b3b", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Lösche…" : "Alle Bestelldaten löschen"}
        </button>
      </div>
    </div>
  );
}
