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
  de: { t: "Wir verwenden Cookies für Analyse, Marketing und Affiliate-Tracking (z. B. Google Tag Manager, Meta-Pixel). Diese laden erst nach Ihrer Einwilligung — die Website funktioniert auch ohne.", link: "Datenschutzerklärung", accept: "Akzeptieren", decline: "Ablehnen", settings: "Cookie-Einstellungen" },
  en: { t: "We use cookies for analytics, marketing and affiliate tracking (e.g. Google Tag Manager, Meta Pixel). They only load after your consent — the site also works without them.", link: "Privacy policy", accept: "Accept", decline: "Decline", settings: "Cookie settings" },
  es: { t: "Utilizamos cookies para análisis, marketing y seguimiento de afiliados (p. ej., Google Tag Manager, píxel de Meta). Solo se cargan con su consentimiento; el sitio también funciona sin ellas.", link: "Política de privacidad", accept: "Aceptar", decline: "Rechazar", settings: "Configuración de cookies" },
  fr: { t: "Nous utilisons des cookies à des fins d'analyse, de marketing et de suivi d'affiliation (p. ex. Google Tag Manager, pixel Meta). Ils ne se chargent qu'après votre consentement — le site fonctionne aussi sans.", link: "Politique de confidentialité", accept: "Accepter", decline: "Refuser", settings: "Paramètres des cookies" },
  it: { t: "Utilizziamo cookie per analisi, marketing e tracciamento affiliati (es. Google Tag Manager, Meta Pixel). Si caricano solo dopo il suo consenso — il sito funziona anche senza.", link: "Informativa sulla privacy", accept: "Accetta", decline: "Rifiuta", settings: "Impostazioni cookie" },
  nl: { t: "Wij gebruiken cookies voor analyse, marketing en affiliate-tracking (bijv. Google Tag Manager, Meta-pixel). Ze laden pas na uw toestemming — de site werkt ook zonder.", link: "Privacyverklaring", accept: "Accepteren", decline: "Weigeren", settings: "Cookie-instellingen" },
  pt: { t: "Utilizamos cookies para análise, marketing e rastreio de afiliados (p. ex., Google Tag Manager, pixel da Meta). Só são carregados após o seu consentimento — o site também funciona sem eles.", link: "Política de privacidade", accept: "Aceitar", decline: "Recusar", settings: "Definições de cookies" },
  ja: { t: "当サイトでは、分析・マーケティング・アフィリエイト計測のためにCookie（例：Google Tag Manager、Metaピクセル）を使用します。読み込みは同意後にのみ行われ、同意がなくてもサイトはご利用いただけます。", link: "プライバシーポリシー", accept: "同意する", decline: "同意しない", settings: "Cookie設定" },
  sv: { t: "Vi använder cookies för analys, marknadsföring och affiliate-spårning (t.ex. Google Tag Manager, Meta-pixel). De laddas först efter ditt samtycke — webbplatsen fungerar även utan.", link: "Integritetspolicy", accept: "Acceptera", decline: "Avböj", settings: "Cookie-inställningar" },
  da: { t: "Vi bruger cookies til analyse, marketing og affiliate-tracking (f.eks. Google Tag Manager, Meta-pixel). De indlæses først efter dit samtykke — siden fungerer også uden.", link: "Privatlivspolitik", accept: "Accepter", decline: "Afvis", settings: "Cookie-indstillinger" },
  no: { t: "Vi bruker informasjonskapsler til analyse, markedsføring og affiliate-sporing (f.eks. Google Tag Manager, Meta-pixel). De lastes først etter ditt samtykke — siden fungerer også uten.", link: "Personvernerklæring", accept: "Godta", decline: "Avslå", settings: "Cookie-innstillinger" },
};

export const consentLabel = (lang) => (TXT[lang] || TXT.en).settings;

/* ENTFERNT: runAttribution().
   Der Pfad kannte nur gclid und utm=reddit_ads — weder utm_source noch fbclid.
   Er schrieb ein „referrer"-Cookie und hängte ?src=/?friend=/?tid= an die URL,
   und weil er UTM ignorierte, stand dort bei einem bezahlten Meta-Klick
   „src=direct". Gelesen hat diese Werte niemand: weder das Frontend noch das
   ops-Backend — die Quelle im Admin kommt aus lib/attribution.js. Der Pfad hat
   also nichts geliefert, aber bei der Fehlersuche eine falsche Ursache
   vorgetäuscht. Die korrekte Herkunft geht jetzt aus <Attribution /> an
   window.dataLayer (Event „rr_attribution"), damit GTM sie weiter sieht —
   ohne die Adresszeile zu verschmutzen.
   HINWEIS: Falls ein GTM-Tag noch den URL-Parameter „src" ausliest, muss es auf
   die dataLayer-Variable rr_source umgestellt werden. */

function loadTrackers() {
  if (typeof window === "undefined" || window.__rrTrackersLoaded) return;
  window.__rrTrackersLoaded = true;
  // Billige Vorbereitung SOFORT: dataLayer + Queues stehen, Events/Klicks sammeln sich darin.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const w = window;
  w.fpr = w.fpr || function () { w.fpr.q = w.fpr.q || []; w.fpr.q[arguments[0] === "set" ? "unshift" : "push"](arguments); };
  w.fpr("init", { cid: FPR_CID });
  w.fpr("click");
  // Schwere Skripte (gtm.js, fpr.js) erst nach 'load' + im Idle anhängen → blockiert den
  // kritischen Renderpfad nicht (CWV). GTM/FirstPromoter verarbeiten die gequeueten
  // Events/Klicks beim Laden nach.
  const inject = () => {
    const g = document.createElement("script");
    g.async = true; g.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(g);
    const f = document.createElement("script");
    f.async = true; f.src = "https://cdn.firstpromoter.com/fpr.js";
    document.head.appendChild(f);
  };
  const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
  if (document.readyState === "complete") ric(inject);
  else window.addEventListener("load", () => ric(inject), { once: true });
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
    if (isAdmin) return; // Admin: kein Tracking, kein Banner
    // GTM/Tracking laden jetzt UNABHÄNGIG von der Cookie-Einwilligung (auf ausdrücklichen
    // Wunsch — bewusst nicht DSGVO-konform). So feuern die GTM-Events (und FirstPromoter)
    // auch ohne Zustimmung; das Ablehnen stoppt das bereits geladene Tracking nicht.
    loadTrackers();
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    // Banner nur als Hinweis zeigen, solange noch keine Entscheidung vorliegt.
    if (stored !== "granted" && stored !== "denied") setOpen(true);
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
    // Alles, was auf die Einwilligung wartet (Meta-Pixel), sofort informieren.
    // Ohne dieses Event startet das Pixel erst beim nächsten Seitenaufruf — und
    // damit ginge genau der Besuch verloren, für den gerade bezahlt wurde.
    try { window.dispatchEvent(new Event("rr:consent-changed")); } catch (e) {}
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
