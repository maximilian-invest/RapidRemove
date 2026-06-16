"use client";
import React from "react";
import { asset } from "@/lib/base";

/* Bearbeiter-Zuweisung einer Bestellung: Max oder Matthias, mit einem Klick.
   Fotos = die bestehenden Gründer-/Autorenbilder. */
export const ASSIGNEES = {
  max: { id: "max", name: "Max", full: "Maximilian Hölzl", img: "/assets/maximilian-hoelzl.jpg" },
  matthias: { id: "matthias", name: "Matthias", full: "Matthias Lang", img: "/assets/matthias-lang.webp" },
};

/** Rundes Foto des zugewiesenen Bearbeiters – für die Bestellliste. */
export function AssigneeAvatar({ who, size = 26, ring = "#fff" }) {
  const a = ASSIGNEES[who];
  if (!a) return null;
  return (
    <img
      src={asset(a.img)} alt={a.name} title={"Zugewiesen: " + a.full} width={size} height={size}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ring}`, boxShadow: "0 1px 3px rgba(0,0,0,.18)", flex: "0 0 auto" }}
    />
  );
}

/** „Zuweisen": zwei Köpfe; Klick = zuweisen, erneuter Klick auf den aktiven = entfernen. */
export function AssignControl({ order, onAssign, compact }) {
  const cur = order?.assignee || null;
  const pick = (id) => onAssign && onAssign(order, cur === id ? null : id);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "#6b6259", textTransform: "uppercase", letterSpacing: ".04em" }}>Zuweisen</span>
      {Object.values(ASSIGNEES).map((a) => {
        const on = cur === a.id;
        return (
          <button
            key={a.id} onClick={() => pick(a.id)} title={on ? a.full + " (Klick = entfernen)" : "Zu " + a.full + " zuweisen"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7, padding: compact ? "3px 9px 3px 3px" : "4px 12px 4px 4px",
              borderRadius: 999, border: on ? "2px solid #ff8000" : "2px solid #e2dcd5",
              background: on ? "#fff7ee" : "#fff", cursor: "pointer", fontWeight: 800,
              fontSize: compact ? 12.5 : 13, color: on ? "#1c1916" : "#6b6259",
            }}
          >
            <img src={asset(a.img)} alt={a.name} width={compact ? 24 : 28} height={compact ? 24 : 28}
              style={{ width: compact ? 24 : 28, height: compact ? 24 : 28, borderRadius: "50%", objectFit: "cover", filter: on ? "none" : "grayscale(.35)" }} />
            {a.name}{on ? " ✓" : ""}
          </button>
        );
      })}
    </div>
  );
}
