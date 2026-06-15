"use client";
/* RapidRemove — Cookie-/Tracking-Consent (DSGVO).
   GTM, FirstPromoter und die Quellen-Attribution laden erst NACH Einwilligung;
   ohne Einwilligung wird nichts davon geladen. Entscheidung liegt in
   localStorage ("rr_consent": "granted" | "denied"). Über window.rrConsentOpen()
   (Footer „Cookie-Einstellungen") lässt sich die Entscheidung jederzeit ändern. */
import React from "react";
import { usePathname } from "next/navigation";
import { asset } from "@/lib/base";
import { pagePath } from "@/lib/page-routes";
import { LANGS } from "@/lib/pricing";

const KEY = "rr_consent";
const GTM_ID = "GTM-KQH66GNX";
const FPR_CID = "2ykmmr9o";

const TXT = {
  de: { t: "Wir verwenden Cookies für Analyse, Marketing und Affiliate-Tracking (z. B. Google Tag Manager). Diese laden erst nach Ihrer Einwilligung — die Website funktioniert auch ohne.", link: "Datenschutzerklärung", accept: "Akzeptieren", decline: "Ablehnen", settings: "Cookie-Einstellungen" },
  en: { t: "We use cookies for analytics, marketing and affiliate tracking (e.g. Google Tag Manager). They only load after your consent — the site also works without them.", link: "Privacy policy", accept: "Accept", decline: "Decline", settings: "Cookie settings" },
  es: { t: "Utilizamos cookies para análisis, marketing y seguimiento de afiliados (p. ej., Google Tag Manager). Solo se cargan con su consentimiento; el sitio también funciona sin ellas.", link: "Política de privacidad", accept: "Aceptar", decline: "Rechazar", settings: "Configuración de cookies" },
  fr: { t: "Nous utilisons des cookies à des fins d'analyse, de marketing et de suivi d'affiliation (p. ex. Google Tag Manager). Ils ne se chargent qu'après votre consentement — le site fonctionne aussi sans.", link: "Politique de confidentialité", accept: "Accepter", decline: "Refuser", settings: "Paramètres des cookies" },
  it: { t: "Utilizziamo cookie per analisi, marketing e tracciamento affiliati (es. Google Tag Manager). Si caricano solo dopo il suo consenso — il sito funziona anche senza.", link: "Informativa sulla privacy", accept: "Accetta", decline: "Rifiuta", settings: "Impostazioni cookie" },
  nl: { t: "Wij gebruiken cookies voor analyse, marketing en affiliate-tracking (bijv. Google Tag Manager). Ze laden pas na uw toestemming — de site werkt ook zonder.", link: "Privacyverklaring", accept: "Accepteren", decline: "Weigeren", settings: "Cookie-instellingen" },
  pt: { t: "Utilizamos cookies para análise, marketing e rastreio de afiliados (p. ex., Google Tag Manager). Só são carregados após o seu consentimento — o site também funciona sem eles.", link: "Política de privacidade", accept: "Aceitar", decline: "Recusar", settings: "Definições de cookies" },
  ja: { t: "当サイトでは、分析・マーケティング・アフィリエイト計測のためにCookie（例：Google Tag Manager）を使用します。読み込みは同意後にのみ行われ、同意がなくてもサイトはご利用いただけます。", link: "プライバシーポリシー", accept: "同意する", decline: "同意しない", settings: "Cookie設定" },
  sv: { t: "Vi använder cookies för analys, marknadsföring och affiliate-spårning (t.ex. Google Tag Manager). De laddas först efter ditt samtycke — webbplatsen fungerar även utan.", link: "Integritetspolicy", accept: "Acceptera", decline: "Avböj", settings: "Cookie-inställningar" },
  da: { t: "Vi bruger cookies til analyse, marketing og affiliate-tracking (f.eks. Google Tag Manager). De indlæses først efter dit samtykke — siden fungerer også uden.", link: "Privatlivspolitik", accept: "Accepter", decline: "Afvis", settings: "Cookie-indstillinger" },
  no: { t: "Vi bruker informasjonskapsler til analyse, markedsføring og affiliate-sporing (f.eks. Google Tag Manager). De lastes først etter ditt samtykke — siden fungerer også uten.", link: "Personvernerklæring", accept: "Godta", decline: "Avslå", settings: "Cookie-innstillinger" },
};

export const consentLabel = (lang) => (TXT[lang] || TXT.en).settings;

function getCookie(name) { return (document.cookie.match("(^|;) *" + name + "=([^;]*)") || [])[2]; }

/* Quellen-Attribution (referrer/src/friend/tid) — vorher inline im Layout, jetzt consent-gated. */
function runAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    let referrer = "direct";
    if (!document.referrer.includes("rapid-remove.com")) {
      if (params.get("gclid")) referrer = "g_ads";
      else if (params.get("utm") === "reddit_ads") referrer = "reddit_ads";
      else if (document.referrer) {
        if (document.referrer.includes("google")) referrer = "organic_google";
        else if (document.referrer.includes("bing")) referrer = "organic_bing";
        else if (document.referrer.includes("trustpilot")) referrer = "trustpilot";
        else if (document.referrer.includes("chatgpt")) referrer = "chatgpt";
        else if (document.referrer.includes("youtube")) referrer = "youtube";
        else if (document.referrer.includes("reddit")) referrer = "reddit";
        else referrer = document.referrer;
      }
      document.cookie = "referrer=" + referrer + "; path=/; max-age=3600";
    }
    const url = new URL(window.location.href);
    const src = getCookie("referrer");
    if (src) { url.searchParams.set("src", src); window.history.replaceState(null, null, url); }
    if (params.get("friend")) {
      document.cookie = "friend=" + params.get("friend") + "; path=/; max-age=2592000";
    } else {
      const friend = getCookie("friend");
      if (friend) { url.searchParams.set("friend", friend); window.history.replaceState(null, null, url); }
    }
    const tid = getCookie("_fprom_tid");
    if (tid) { url.searchParams.set("tid", tid); window.history.replaceState(null, null, url); }
  } catch (e) { /* Attribution ist optional */ }
}

function loadTrackers() {
  if (typeof window === "undefined" || window.__rrTrackersLoaded) return;
  window.__rrTrackersLoaded = true;
  // Google Tag Manager
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const g = document.createElement("script");
  g.async = true; g.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  document.head.appendChild(g);
  // FirstPromoter (Affiliate)
  const w = window;
  w.fpr = w.fpr || function () { w.fpr.q = w.fpr.q || []; w.fpr.q[arguments[0] === "set" ? "unshift" : "push"](arguments); };
  w.fpr("init", { cid: FPR_CID });
  w.fpr("click");
  const f = document.createElement("script");
  f.async = true; f.src = "https://cdn.firstpromoter.com/fpr.js";
  document.head.appendChild(f);
  runAttribution();
}

export default function Consent() {
  const pathname = usePathname() || "/";
  const seg = pathname.split("/").filter(Boolean)[0];
  const lang = LANGS.some((l) => l.code === seg) ? seg : "de";
  const c = TXT[lang] || TXT.en;
  // Internes Admin-Panel: kein Consent-Banner, kein Tracking.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  // Startet unsichtbar und erscheint NUR, wenn noch keine Entscheidung vorliegt.
  // So blitzt der Banner bei jeder Navigation für bereits entschiedene Nutzer nicht auf.
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (isAdmin) return; // Admin: weder Banner noch GTM laden
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    if (stored === "granted") loadTrackers();
    else if (stored !== "denied") setOpen(true);
    window.rrConsentOpen = () => setOpen(true);
    return () => { if (window.rrConsentOpen) delete window.rrConsentOpen; };
  }, []);

  // Affiliate-Attribution: den Partner-Code aus dem Link (?fpr=… / ?ref=… / ?via=…)
  // als first-party Cookie „rr_aff" sichern. So ist beim späteren Checkout sicher
  // erkennbar, von welchem Affiliate die Bestellung kam — unabhängig davon, welche
  // Cookies FirstPromoter setzt. Funktionale Zuordnung zum werbenden Partner (kein
  // Analytics-/Marketing-Tracking), läuft daher auch ohne Cookie-Einwilligung.
  React.useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const ref = p.get("fpr") || p.get("ref") || p.get("via") || p.get("fp_ref");
      if (ref && ref.trim()) {
        document.cookie = "rr_aff=" + encodeURIComponent(ref.trim().slice(0, 120)) + "; path=/; max-age=7776000; SameSite=Lax";
      }
    } catch (e) { /* Attribution ist optional */ }
  }, []);

  const decide = (granted) => {
    try { localStorage.setItem(KEY, granted ? "granted" : "denied"); } catch (e) {}
    setOpen(false);
    if (granted) loadTrackers();
  };

  if (isAdmin || !open) return null;
  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label={c.settings}>
      <div className="consent-card">
        <p className="consent-tx">
          {c.t} <a href={asset(pagePath("datenschutz", lang))}>{c.link}</a>
        </p>
        <div className="consent-actions">
          <button type="button" className="consent-btn ghost" onClick={() => decide(false)}>{c.decline}</button>
          <button type="button" className="consent-btn solid" onClick={() => decide(true)}>{c.accept}</button>
        </div>
      </div>
    </div>
  );
}
