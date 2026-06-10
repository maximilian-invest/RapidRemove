"use client";
/* Geteilte Social-Proof-Bausteine: echte Trustpilot-Zeile (Live-Zahl) + echte
   Presse-Quellen („Bekannt aus"). Genutzt im Hero (Home) und im Wizard-Router. */
import React from "react";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";

/* Trustpilot: grüne Stern-Kacheln (statisch, sofort sichtbar). */
export function TpStars({ size = 16 }) {
  return (
    <span className="tp-sq-row" style={{ "--tpsq": size + "px" }}>
      {[0, 1, 2, 3, 4].map((i) => <span className="tp-sq" key={i}><Icon.star /></span>)}
    </span>
  );
}

/* Echte, voll stylebare Trustpilot-Zeile mit LIVE-Bewertungszahl (vom ops-Endpoint
   /tp-count, 6 h gecacht; Fallback „260+"). Ersetzt das nicht ausrichtbare iframe-Widget. */
const OPS_BASE = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const TP_LINE = {
  de: ["Sehen Sie unsere ", " Bewertungen auf"],
  en: ["See our ", " reviews on"],
  es: ["Vea nuestras ", " reseñas en"],
  fr: ["Découvrez nos ", " avis sur"],
  it: ["Guarda le nostre ", " recensioni su"],
  nl: ["Bekijk onze ", " reviews op"],
  pt: ["Veja as nossas ", " avaliações no"],
  ja: ["私たちの", "件のレビューはこちら:"],
  sv: ["Se våra ", " omdömen på"],
  da: ["Se vores ", " anmeldelser på"],
  no: ["Se våre ", " omtaler på"],
};
let tpCountOnce = null; // einmal pro Pageload holen, dann teilen alle Instanzen die Zahl
export function TrustpilotLive() {
  const { lang } = useLang();
  const [count, setCount] = React.useState(tpCountOnce);
  React.useEffect(() => {
    if (tpCountOnce != null || !OPS_BASE) return;
    let alive = true;
    try {
      const c = JSON.parse(localStorage.getItem("rr_tp_count") || "null");
      if (c && c.n && Date.now() - c.ts < 6 * 3600_000) { tpCountOnce = c.n; setCount(c.n); return; }
    } catch (e) {}
    fetch(OPS_BASE + "/tp-count")
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j || !j.count) return;
        tpCountOnce = j.count; setCount(j.count);
        try { localStorage.setItem("rr_tp_count", JSON.stringify({ n: j.count, ts: Date.now() })); } catch (e) {}
      })
      .catch(() => { /* Fallback bleibt 260+ */ });
    return () => { alive = false; };
  }, []);
  const url = lang === "de" ? "https://de.trustpilot.com/review/rapid-remove.com" : "https://trustpilot.com/review/rapid-remove.com";
  const tl = TP_LINE[lang] || TP_LINE.en;
  return (
    <a className="tp-line" href={url} target="_blank" rel="noopener noreferrer">
      <TpStars size={17} />
      <span className="tpl-tx"><span className="tpl-lead">{tl[0]}</span><b>{count || "260+"}</b>{tl[1]}</span>
      <span className="tpl-logo"><span className="tp-sq" style={{ "--tpsq": "17px" }}><Icon.star /></span> Trustpilot</span>
    </a>
  );
}

/* „Bekannt aus" – echte Quellen, die RapidRemove erwähnen/verlinken (sprachübergreifend). */
export const PRESS_LINKS = [
  { n: "heise.de", u: "https://www.heise.de/tipps-tricks/Google-My-Business-loeschen-so-klappt-s-6159832.html" },
  { n: "Digital-Lokal", u: "https://www.digital-lokal.de/blog/google-unternehmensprofil-loeschen/" },
  { n: "SEO Online Consulting", u: "https://seo-online-consulting.de/google-unternehmensprofil-loeschen/" },
  { n: "Finafix", u: "https://finafix.com/google-my-business-loeschen/" },
  { n: "IT-Büro", u: "https://it-buero.eu/bewertung-bei-google-loschen/" },
];

const PRESS_LABEL = { de: "Bekannt aus", en: "As seen in", es: "Conocidos por", fr: "Vu dans", it: "Noti da", nl: "Bekend van", pt: "Conhecidos de", ja: "掲載メディア", sv: "Omnämnda i", da: "Kendt fra", no: "Omtalt i" };

/* Echte Presse-Leiste (klickbare Quellen). variant="bar" = zentrierte Karte (Wizard-Router). */
export function PressBand({ variant }) {
  const { lang } = useLang();
  const label = PRESS_LABEL[lang] || PRESS_LABEL.en;
  if (variant === "bar") {
    return (
      <div className="press-bar">
        <div className="pb-label">{label}</div>
        <div className="pb-logos">
          {PRESS_LINKS.map((p, i) => (
            <a className={"pb-logo" + (i === 0 ? " lead" : "")} key={i} href={p.u} target="_blank" rel="noopener noreferrer">{p.n}</a>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="hero-press">
      <span className="hp-label">{label}</span>
      {PRESS_LINKS.map((p, i) => <a key={i} href={p.u} target="_blank" rel="noopener noreferrer">{p.n}</a>)}
    </div>
  );
}
