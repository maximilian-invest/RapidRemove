"use client";
/* RapidRemove — Meta-Pixel im Root-Layout.
   Startet das Pixel, sobald die Einwilligung vorliegt (auch wenn sie erst
   später erteilt wird → Event "rr:consent-changed" aus <Consent />), und zählt
   Seitenwechsel mit: im App Router gibt es bei Navigation keinen Full Reload,
   ohne diese Komponente zählt Meta nur die Einstiegsseite. */
import React from "react";
import { usePathname } from "next/navigation";
import { initMetaPixel, trackPageView } from "@/lib/metaPixel";

export default function MetaPixel() {
  // Bewusst NUR der Pfad, nicht die Query-Zeile: die App schreibt ihre eigene
  // URL per history.replaceState um (?src=/?friend=/?tid= aus der Attribution,
  // ?p=<placeId> aus dem Wizard). Next 14 spiegelt das in useSearchParams —
  // jede dieser Umschreibungen zählte sonst als weiterer Seitenaufruf, obwohl
  // der Nutzer dieselbe Seite sieht. Eine Seite, die sich nur über die Query
  // unterscheidet, gibt es hier nicht.
  const pathname = usePathname() || "/";
  // Internes Admin-Panel: kein Tracking (deckungsgleich mit <Consent />).
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  // Zuletzt gezählter Seitenaufruf. initMetaPixel() feuert den ersten PageView
  // selbst — ohne diesen Abgleich zählte der Einstieg doppelt.
  const counted = React.useRef(null);
  const pathRef = React.useRef(pathname);
  React.useEffect(() => { pathRef.current = pathname; });

  // Start, sobald Einwilligung vorliegt — und erneut, wenn sie später erteilt wird.
  React.useEffect(() => {
    if (isAdmin) return;
    const start = () => { if (initMetaPixel()) counted.current = pathRef.current; };
    start();
    window.addEventListener("rr:consent-changed", start);
    return () => window.removeEventListener("rr:consent-changed", start);
  }, [isAdmin]);

  // Virtuelle Seitenaufrufe (Client-Navigation im App Router).
  React.useEffect(() => {
    if (isAdmin || counted.current === pathname) return;
    if (trackPageView()) counted.current = pathname;
  }, [pathname, isAdmin]);

  return null;
}
