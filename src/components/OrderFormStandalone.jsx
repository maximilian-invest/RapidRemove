"use client";
import React from "react";
import { asset } from "@/lib/base";
import { pagePath } from "@/lib/page-routes";
import OrderForm from "@/components/OrderForm";
import { fetchOrderFormInfo } from "@/lib/order";

/* Öffentliche Seite (per Mail-Link): /auftrag/<id> – Kunde füllt den Fragebogen aus. */
export default function OrderFormStandalone({ orderId }) {
  const [info, setInfo] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    fetchOrderFormInfo(orderId).then((i) => { if (alive) { setInfo(i); setLoaded(true); } });
    return () => { alive = false; };
  }, [orderId]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", background: "#f6f3f0", backgroundImage: "radial-gradient(circle at 18% 10%, #fff4e8 0%, transparent 42%), radial-gradient(circle at 86% 92%, #fdebd6 0%, transparent 46%)", padding: "40px 16px 60px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" style={{ height: 30, marginBottom: 20 }} />
        <div style={{ fontSize: 13.5, color: "#6b6259", fontWeight: 700, marginBottom: 14 }}>
          Bestellung #{orderId}{info && info.company ? " · " + info.company : ""}
        </div>
        {loaded
          ? <OrderForm key={orderId} orderId={orderId} lang={(info && info.lang) || "de"} initial={info && info.form ? info.form : null} />
          : <div style={{ background: "#fff", border: "1px solid #ece7e1", borderRadius: 18, padding: 28, color: "#6b6259", fontWeight: 600 }}>Lädt…</div>}
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 12.5, fontWeight: 600 }}>
          <a href={asset(pagePath("impressum", (info && info.lang) || "de"))} target="_blank" rel="noopener noreferrer" style={{ color: "#8a8079", textDecoration: "none", margin: "0 8px" }}>Impressum</a>
          <span style={{ color: "#cfc7bf" }}>·</span>
          <a href={asset(pagePath("datenschutz", (info && info.lang) || "de"))} target="_blank" rel="noopener noreferrer" style={{ color: "#8a8079", textDecoration: "none", margin: "0 8px" }}>Datenschutz</a>
        </div>
      </div>
    </div>
  );
}
