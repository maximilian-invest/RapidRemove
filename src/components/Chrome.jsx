"use client";
import React from "react";
import Script from "next/script";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { LANGS } from "@/lib/pricing";
import { SVC, SVC_NAV_LABEL } from "@/lib/services-copy";
import { localePath, LOCALES } from "@/lib/locales-meta";


/* Externe Ziel-URLs (Footer/Navbar) */
const PARTNER_URL = "https://rapid-remove.firstpromoter.com/signup";

/* ---- Scroll reveal hook ---- */
function useReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
}

/* ---- Count-up number ---- */
function CountUp({ end, suffix = "", dur = 1600, format }) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  const started = React.useRef(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduce) { setVal(end); return; }
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && run()), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [end]);
  const shown = format ? format(val) : val.toLocaleString("de-DE");
  return <span ref={ref}>{shown}{suffix}</span>;
}

/* ---- Language menu (scalable dropdown) ---- */
function LangToggle() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const cur = LANGS.find((l) => l.code === lang) || LANGS[0];
  return (
    <div className="langmenu" ref={ref}>
      <button className="langmenu-btn" onClick={() => setOpen((o) => !o)} aria-label="Language">
        <Icon.globe size={17} />
        <span className="lm-code">{cur.code.toUpperCase()}</span>
        <Icon.chevronDown size={15} />
      </button>
      {open && (
        <div className="langmenu-pop">
          {LANGS.map((l) => (
            <button key={l.code} className={"lm-item" + (l.code === lang ? " on" : "")}
              onClick={() => { setLang(l.code); setOpen(false); }}>
              <span className="lm-native">{l.native}</span>
              <span className="lm-region">{l.region}</span>
              {l.code === lang && <span className="lm-check"><Icon.check size={15} /></span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Telefonnummer in der Navbar: erreichbar 9–17 Uhr (Europe/Vienna).
   Außerhalb der Zeiten blockt der Klick und zeigt einen Hinweis mit
   „Trotzdem anrufen" + „Live-Chat öffnen". ---- */
const TEL_NUMBER = "tel:08000900001";
const TEL_HOURS = { from: 9, to: 17 };
const TEL_NOTE = {
  de: ["Telefonisch erreichbar: 9–17 Uhr (MEZ).", "Trotzdem anrufen", "Live-Chat öffnen"],
  en: ["Phone hours: 9 am–5 pm (CET).", "Call anyway", "Open live chat"],
  es: ["Atención telefónica: 9–17 h (CET).", "Llamar igualmente", "Abrir el chat"],
  fr: ["Téléphone : 9 h–17 h (CET).", "Appeler quand même", "Ouvrir le chat"],
  it: ["Telefono: 9–17 (CET).", "Chiama comunque", "Apri la chat"],
  nl: ["Telefonisch bereikbaar: 9–17 uur (CET).", "Toch bellen", "Chat openen"],
  pt: ["Telefone: 9–17 h (CET).", "Ligar mesmo assim", "Abrir o chat"],
  ja: ["電話受付：9〜17時（中央ヨーロッパ時間）", "それでも電話する", "チャットを開く"],
  sv: ["Telefontid: 9–17 (CET).", "Ring ändå", "Öppna chatten"],
  da: ["Telefontid: 9–17 (CET).", "Ring alligevel", "Åbn chatten"],
  no: ["Telefontid: 9–17 (CET).", "Ring likevel", "Åpne chatten"],
};

function viennaHour() {
  try {
    return parseInt(new Intl.DateTimeFormat("de-AT", { hour: "numeric", hour12: false, timeZone: "Europe/Vienna" }).format(new Date()), 10);
  } catch (e) { return new Date().getHours(); }
}

function NavTel() {
  const { lang } = useLang();
  const [note, setNote] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setNote(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const tx = TEL_NOTE[lang] || TEL_NOTE.en;
  const onClick = (e) => {
    const h = viennaHour();
    if (h >= TEL_HOURS.from && h < TEL_HOURS.to) return; // innerhalb der Zeiten: normal anrufen
    e.preventDefault();
    setNote(true);
  };
  return (
    <span className="nav-tel-wrap" ref={ref}>
      <a className="nav-tel" href={TEL_NUMBER} onClick={onClick} aria-label="Telefon 0800 0900001"><Icon.phone size={15} /><span>0800 0900001</span></a>
      {note && (
        <span className="nav-tel-note">
          <b>{tx[0]}</b>
          <a href={TEL_NUMBER} onClick={() => setNote(false)}>{tx[1]}</a>
          <button type="button" onClick={() => { setNote(false); openChat(); }}>{tx[2]}</button>
        </span>
      )}
    </span>
  );
}

/* ---- Navigation ---- */
/* ---- Sprach-Hinweis: erkennt die Browser-Sprache und schlägt (dezent, schließbar) den
   Wechsel zur passenden Sprachversion vor. KEIN Auto-Redirect, kein IP/Geo, SEO-sicher.
   Erscheint nur, wenn die Top-Browsersprache eine unterstützte ANDERE Sprache ist als die
   aktuelle Seite – und respektiert eine bewusste Sprachwahl (rr_lang) sowie ein Wegklicken. ---- */
const LANG_NATIVE = { de: "Deutsch", en: "English", es: "Español", fr: "Français", it: "Italiano", nl: "Nederlands", pt: "Português", ja: "日本語", sv: "Svenska", da: "Dansk", no: "Norsk" };
const LANG_HINT_TXT = {
  de: (n) => `Diese Seite gibt es auch auf ${n}.`,
  en: (n) => `This page is also available in ${n}.`,
  es: (n) => `Esta página también está disponible en ${n}.`,
  fr: (n) => `Cette page est aussi disponible en ${n}.`,
  it: (n) => `Questa pagina è disponibile anche in ${n}.`,
  nl: (n) => `Deze pagina is ook beschikbaar in het ${n}.`,
  pt: (n) => `Esta página também está disponível em ${n}.`,
  ja: (n) => `このページは${n}でもご覧いただけます。`,
  sv: (n) => `Den här sidan finns även på ${n}.`,
  da: (n) => `Denne side findes også på ${n}.`,
  no: (n) => `Denne siden finnes også på ${n}.`,
};
const LANG_HINT_CTA = { de: "Wechseln", en: "Switch", es: "Cambiar", fr: "Changer", it: "Cambia", nl: "Overschakelen", pt: "Mudar", ja: "切り替え", sv: "Byt", da: "Skift", no: "Bytt" };

/* Stufe 2: physischer Standort per IP (externer Geo-Dienst, gecacht 1×/Tag, mit Fallback).
   Sendet die Besucher-IP an einen Drittanbieter → Datenschutz-Hinweis in der Policy ergänzen. */
const COUNTRY_LOCALE = {
  IT: "it", DE: "de", AT: "de", CH: "de", LI: "de", FR: "fr", BE: "fr", LU: "fr", MC: "fr",
  NL: "nl", PT: "pt", BR: "pt", AO: "pt", MZ: "pt", JP: "ja", SE: "sv", DK: "da", NO: "no",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es", GT: "es",
  BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  US: "en", GB: "en", IE: "en", AU: "en", NZ: "en", CA: "en", ZA: "en", IN: "en", SG: "en",
};
async function detectCountry() {
  try { const c = JSON.parse(localStorage.getItem("rr_geo") || "null"); if (c && c.cc && Date.now() - c.ts < 86400000) return c.cc; } catch (e) {}
  for (const url of ["https://get.geojs.io/v1/ip/country.json", "https://api.country.is/"]) {
    try {
      const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(url, { signal: ctrl.signal }); clearTimeout(to);
      const j = await res.json();
      const cc = String(j.country || j.country_code || "").toUpperCase();
      if (cc) { try { localStorage.setItem("rr_geo", JSON.stringify({ cc, ts: Date.now() })); } catch (e) {} return cc; }
    } catch (e) { /* nächster Dienst / offline → kein IP-Hinweis */ }
  }
  return null;
}

function LangHint({ currentLang }) {
  const [target, setTarget] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (localStorage.getItem("rr_lang_hint_off") === "1") return;   // einmal weggeklickt → nie wieder
        if (localStorage.getItem("rr_lang") === currentLang) return;    // bewusste Sprachwahl respektieren
        // 1) Browser-Sprache — stärkstes Signal für die Sprach-Vorliebe.
        let browserTarget = null;
        const cands = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ""];
        for (const c of cands) { const code = String(c).slice(0, 2).toLowerCase(); if (LOCALES.includes(code)) { browserTarget = code; break; } }
        if (browserTarget && browserTarget !== currentLang) { if (alive) setTarget(browserTarget); return; }
        // 2) Physischer Standort per IP — NUR wenn das Sprachsignal schwach ist: kein unterstütztes
        //    Browser-Match ODER Englisch als internationaler Default (z. B. EN-Browser, sitzt in Italien).
        if (browserTarget && browserTarget !== "en") return;
        // Stufe 2 (IP-Standort) NUR mit Einwilligung — ohne Consent kein Drittanbieter-/IP-Call (DSGVO).
        // Consent-Banner/CMP setzt bei Zustimmung localStorage 'rr_geo_consent' = '1'.
        let geoConsent = false; try { geoConsent = localStorage.getItem("rr_geo_consent") === "1"; } catch (e) {}
        if (!geoConsent) return;
        const cc = await detectCountry();
        if (!alive || !cc) return;
        const loc = COUNTRY_LOCALE[cc];
        if (loc && LOCALES.includes(loc) && loc !== currentLang) setTarget(loc);
      } catch (e) { /* kein localStorage/navigator/Netz → kein Hinweis */ }
    })();
    return () => { alive = false; };
  }, [currentLang]);
  if (!target) return null;
  const dismiss = () => { try { localStorage.setItem("rr_lang_hint_off", "1"); } catch (e) {} setTarget(null); };
  const go = () => { try { localStorage.setItem("rr_lang", target); } catch (e) {} window.location.href = asset(localePath(target)); };
  const native = LANG_NATIVE[target] || target;
  return (
    <div className="lang-hint" role="region" aria-label="Sprache">
      <div className="container lang-hint-inner">
        <span className="lh-txt"><Icon.globe size={15} /> {(LANG_HINT_TXT[target] || LANG_HINT_TXT.en)(native)}</span>
        <span className="lh-act">
          <button className="lh-go" onClick={go}>{LANG_HINT_CTA[target] || LANG_HINT_CTA.en} → {native}</button>
          <button className="lh-x" onClick={dismiss} aria-label="Schließen"><Icon.x size={15} /></button>
        </span>
      </div>
    </div>
  );
}

function Nav({ onNav, onStart, onBlog, onAbout, onOrm, onDeindex, active }) {
  const { t } = useLang();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [ddOpen, setDdOpen] = React.useState(false);
  const ddRef = React.useRef(null);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  React.useEffect(() => {
    const onDoc = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const links = [
    ["pricing", t.nav.pricing], ["reviews", t.nav.reviews], ["magazin", t.nav.magazin], ["about", t.nav.about],
  ];
  const goTo = (id) => { setOpen(false); if (id === "magazin") { onBlog && onBlog(); } else if (id === "about") { onAbout && onAbout(); } else { onNav(id); } };
  // Logo / „Home": zur Startseite DER AKTUELLEN SPRACHE (DE = "/", sonst "/<code>/"); auf der Startseite nur nach oben scrollen.
  const goHome = () => {
    setOpen(false);
    const home = asset(localePath(t.code));
    const here = ((typeof window !== "undefined" && window.location.pathname) || "/").replace(/\/+$/, "") || "/";
    if (here === (home.replace(/\/+$/, "") || "/")) window.scrollTo({ top: 0, behavior: "smooth" });
    else window.location.href = home;
  };
  const sv = SVC[t.code] || SVC.en;
  const svLabel = SVC_NAV_LABEL[t.code] || SVC_NAV_LABEL.en;
  const svcAct = { core: () => onStart(), orm: () => onOrm && onOrm(), deindex: () => onDeindex && onDeindex() };
  const svcIcon = (name) => Icon[name] || (name === "fileText" ? Icon.edit : Icon.shield);
  return (
    <React.Fragment>
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="container nav-inner">
          <img className="nav-logo" src={asset("/assets/rapidremove-icon.png")} alt="RapidRemove" onClick={goHome} />
          <div className="nav-links">
            {(onOrm || onDeindex) && (
              <div className={"nav-dd" + (ddOpen ? " open" : "")} ref={ddRef}>
                <button className="nav-dd-btn" onClick={() => setDdOpen((o) => !o)}>{svLabel} <Icon.chevronDown /></button>
                <div className="nav-dd-pop">
                  {sv.cards.map((c) => {
                    const I = svcIcon(c.ic);
                    return (
                      <button className={"nav-dd-item" + (c.id === "core" ? " core" : "")} key={c.id}
                        onClick={() => { setDdOpen(false); (svcAct[c.id] || (() => {}))(); }}>
                        <span className="nav-dd-ic"><I size={20} /></span>
                        <span className="nav-dd-tx"><span className="t">{c.t}</span><span className="d">{c.d}</span></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {links.map(([id, label]) => <a key={id} className={active === id ? "on" : ""} onClick={() => goTo(id)}>{label}</a>)}
            <a href={PARTNER_URL} target="_blank" rel="noopener noreferrer">{(t.footer.cols && t.footer.cols[1] && t.footer.cols[1].links[2]) || "Partner werden"}</a>
          </div>
          <div className="nav-right">
            <NavTel />
            <LangToggle />
            <button className="btn btn-primary sm" onClick={onStart}><span className="ico"><Icon.search size={17} /></span>{t.nav.cta}</button>
            <button className="nav-burger" onClick={() => setOpen(true)} aria-label="Menu"><Icon.menu /></button>
          </div>
        </div>
      </nav>
      <LangHint currentLang={t.code} />
      <div className={"sheet" + (open ? " open" : "")} onClick={() => setOpen(false)}>
        <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-top">
            <LangToggle />
            <button className="sheet-close" onClick={() => setOpen(false)}><Icon.x /></button>
          </div>
          <a onClick={goHome}>Home</a>
          {(onOrm || onDeindex) && <div className="sheet-sub">{svLabel}</div>}
          {(onOrm || onDeindex) && sv.cards.filter((c) => c.id !== "core").map((c) => <a key={c.id} onClick={() => { setOpen(false); (svcAct[c.id] || (() => {}))(); }}>{c.t}</a>)}
          {links.map(([id, label]) => <a key={id} onClick={() => goTo(id)}>{label}</a>)}
          <a href={PARTNER_URL} target="_blank" rel="noopener noreferrer">{(t.footer.cols && t.footer.cols[1] && t.footer.cols[1].links[2]) || "Partner werden"}</a>
          <button className="btn btn-primary" onClick={() => { setOpen(false); onStart(); }}><Icon.search size={18} />{t.nav.cta}</button>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---- Footer ---- */
function Footer({ onStart, onBlog, onAbout }) {
  const { t, lang } = useLang();
  const hb = asset(localePath(lang)); // Sprach-Startseite ("/" bzw. "/es/" …)
  // ALLE Footer-Links klickbar. Spalten & Reihenfolge sind in allen 11 Sprachen identisch:
  // 0 Produkt: So funktioniert's · Preise · Bewertungen · Gratis-Check
  // 1 Unternehmen: Über uns · Magazin · Partner werden · Kontakt (Live-Chat)
  // 2 Rechtliches: Impressum · Datenschutz · AGB · Kundenportal
  const cols = t.footer.cols || [];
  const cells = [
    [{ href: hb + "#how" }, { href: hb + "#pricing" }, { href: hb + "#reviews" }, { onClick: onStart, href: hb + "?start=1" }],
    [{ onClick: onAbout, href: asset("/ueber-uns/") }, { onClick: onBlog, href: lang === "de" ? asset("/magazin/") : hb + "?view=magazin" }, { href: PARTNER_URL, ext: true }, { onClick: openChat, href: "#chat" }],
    [{ href: asset("/impressum/") }, { href: asset("/datenschutzerklaerung/") }, { href: "mailto:helpdesk@rapid-remove.com" }],
  ];
  return (
    <footer className="footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <img className="foot-logo" src={asset("/assets/rapidremove-logo-white.png")} alt="RapidRemove" />
            <p>{t.footer.tagline}</p>
            <div className="addr">{t.footer.addr}</div>
          </div>
          {cols.map((c, i) => (
            <div className="foot-col" key={i}>
              <h4>{c.h}</h4>
              {c.links.map((l, j) => {
                const cell = (cells[i] || [])[j] || {};
                const onClick = cell.onClick ? (e) => { e.preventDefault(); cell.onClick(); } : undefined;
                return (
                  <a key={j} href={cell.href || hb} onClick={onClick}
                    target={cell.ext ? "_blank" : undefined} rel={cell.ext ? "noopener noreferrer" : undefined}>{l}</a>
                );
              })}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Simple Solution. OG · {t.footer.rights}</span>
          <div className="foot-pay">
            {["PayPal", "Klarna", "VISA", "Mastercard", "iDEAL"].map((p) => <span className="pm" key={p}>{p}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---- Sticky mobile CTA ---- */
function StickyCTA({ onStart }) {
  const { t } = useLang();
  return (
    <div className="sticky-cta">
      <div className="sc-meta">
        <b>{t.sticky.t}</b>
        <span>{t.sticky.s}</span>
      </div>
      <button className="btn btn-primary sm" onClick={onStart}><Icon.search size={16} />{t.sticky.b}</button>
    </div>
  );
}

/* ---- Chat-Widget: Tidio (ersetzt den früheren WhatsApp-Float; eigenes Bubble rechts unten) ---- */
function WhatsAppFloat() {
  // Tidio positioniert sein iframe per Inline-Style und überschreibt Stylesheet-Regeln.
  // Deshalb: Versatz MOBIL direkt als Inline-Style mit important-Priorität setzen und
  // dauerhaft durchsetzen (Tidio schreibt seine Styles gelegentlich neu). Gilt nur für
  // die geschlossene Bubble — der geöffnete Chat bleibt unangetastet (Vollbild).
  React.useEffect(() => {
    const MQ = window.matchMedia("(max-width: 920px)");
    let open = false;
    const LIFT = "calc(106px + env(safe-area-inset-bottom))";
    const apply = () => {
      const f = document.getElementById("tidio-chat-iframe");
      if (!f) return;
      if (MQ.matches && !open) f.style.setProperty("bottom", LIFT, "important");
      else f.style.removeProperty("bottom");
    };
    const onOpen = () => { open = true; apply(); };
    const onClose = () => { open = false; apply(); };
    document.addEventListener("tidioChat-ready", apply);
    document.addEventListener("tidioChat-open", onOpen);
    document.addEventListener("tidioChat-close", onClose);
    if (MQ.addEventListener) MQ.addEventListener("change", apply); else MQ.addListener(apply);
    // Durchsetzen: falls Tidio den Inline-Style neu setzt oder das iframe später erscheint.
    const iv = setInterval(() => {
      const f = document.getElementById("tidio-chat-iframe");
      if (f && MQ.matches && !open && f.style.getPropertyValue("bottom") !== LIFT) apply();
    }, 700);
    apply();
    return () => {
      clearInterval(iv);
      document.removeEventListener("tidioChat-ready", apply);
      document.removeEventListener("tidioChat-open", onOpen);
      document.removeEventListener("tidioChat-close", onClose);
      if (MQ.removeEventListener) MQ.removeEventListener("change", apply); else MQ.removeListener(apply);
    };
  }, []);
  return <Script id="tidio-chat" src="https://code.tidio.co/tylql9ee8vvmwslaqmdxgbiuv90hs3sq.js" strategy="afterInteractive" />;
}

/* Öffnet den Tidio-Live-Chat. Ersetzt frühere WhatsApp-/„Kontakt"-Links überall auf der Seite.
   Robust, falls Tidio noch lädt: einmalig auf das 'tidioChat-ready'-Event warten. */
function openChat(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof window === "undefined") return;
  const go = () => {
    try {
      if (!window.tidioChatApi) return;
      if (window.tidioChatApi.show) window.tidioChatApi.show();
      window.tidioChatApi.open();
    } catch (err) { /* Tidio nicht verfügbar */ }
  };
  if (window.tidioChatApi) { go(); return; }
  const onReady = () => { go(); document.removeEventListener("tidioChat-ready", onReady); };
  document.addEventListener("tidioChat-ready", onReady);
}

export { useReveal, CountUp, LangToggle, Nav, Footer, StickyCTA, WhatsAppFloat, openChat };
