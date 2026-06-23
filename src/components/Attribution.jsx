"use client";
import React from "react";
import { captureFirstTouch } from "@/lib/attribution";

/* Hält beim ersten Besuch die Herkunft fest (First-Touch) – rendert nichts. */
export default function Attribution() {
  React.useEffect(() => { captureFirstTouch(); }, []);
  return null;
}
