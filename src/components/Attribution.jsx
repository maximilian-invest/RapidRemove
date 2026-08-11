"use client";
import React from "react";
import { captureTouch, readTouches, deriveSource } from "@/lib/attribution";

/* Hält die Herkunft fest (First- und Last-Touch) – rendert nichts.
   Läuft bei jedem Dokument-Aufruf einmal; Client-Navigationen innerhalb der
   Seite sind kein neuer Besuch und erzeugen deshalb keinen neuen Touch. */
export default function Attribution() {
  React.useEffect(() => {
    captureTouch();
    // Herkunft an die GTM-Datenschicht geben. Ersetzt den früheren „?src="-Parameter
    // in der URL, der die Adresszeile verschmutzte und die UTM-Parameter ignorierte.
    try {
      const { last, first } = readTouches();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "rr_attribution",
        rr_source: deriveSource({ attribution: last }).kind,
        rr_source_first: deriveSource({ attribution: first }).kind,
        rr_utm_source: last.utm_source || "",
        rr_utm_campaign: last.utm_campaign || "",
        rr_utm_content: last.utm_content || "",
      });
    } catch (e) { /* Attribution ist optional */ }
  }, []);
  return null;
}
