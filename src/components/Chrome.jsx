"use client";
import React from "react";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { LANGS } from "@/lib/pricing";


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

/* ---- Navigation ---- */
function Nav({ onNav, onStart, onBlog, onAbout, active }) {
  const { t } = useLang();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["how", t.nav.how], ["why", t.nav.why], ["pricing", t.nav.pricing], ["reviews", t.nav.reviews], ["magazin", t.nav.magazin], ["about", t.nav.about], ["faq", t.nav.faq],
  ];
  const goTo = (id) => { setOpen(false); if (id === "magazin") { onBlog && onBlog(); } else if (id === "about") { onAbout && onAbout(); } else { onNav(id); } };
  return (
    <React.Fragment>
      <nav className={"nav" + (scrolled ? " scrolled" : "")}>
        <div className="container nav-inner">
          <img className="nav-logo" src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <div className="nav-links">
            {links.map(([id, label]) => <a key={id} className={active === id ? "on" : ""} onClick={() => goTo(id)}>{label}</a>)}
          </div>
          <div className="nav-right">
            <LangToggle />
            <button className="btn btn-ghost">{t.nav.login}</button>
            <button className="btn btn-primary sm" onClick={onStart}><span className="ico"><Icon.search size={17} /></span>{t.nav.cta}</button>
            <button className="nav-burger" onClick={() => setOpen(true)} aria-label="Menu"><Icon.menu /></button>
          </div>
        </div>
      </nav>
      <div className={"sheet" + (open ? " open" : "")} onClick={() => setOpen(false)}>
        <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
          <div className="sheet-top">
            <LangToggle />
            <button className="sheet-close" onClick={() => setOpen(false)}><Icon.x /></button>
          </div>
          {links.map(([id, label]) => <a key={id} onClick={() => goTo(id)}>{label}</a>)}
          <a onClick={() => goTo("portal")}>{t.nav.login}</a>
          <button className="btn btn-primary" onClick={() => { setOpen(false); onStart(); }}><Icon.search size={18} />{t.nav.cta}</button>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---- Footer ---- */
function Footer({ onStart, onBlog, onAbout }) {
  const { t } = useLang();
  const linkAction = (l) => {
    if (/Magazin|Magazine|Blog/.test(l)) return onBlog;
    if (/Über uns|About us|Quiénes somos|À propos|Chi siamo|Over ons|Sobre nós/.test(l)) return onAbout;
    if (/check|Check|prüfen/.test(l)) return onStart;
    return undefined;
  };
  return (
    <footer className="footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <img className="foot-logo" src={asset("/assets/rapidremove-logo-white.png")} alt="RapidRemove" />
            <p>{t.footer.tagline}</p>
            <div className="addr">{t.footer.addr}</div>
          </div>
          {t.footer.cols.map((c, i) => (
            <div className="foot-col" key={i}>
              <h4>{c.h}</h4>
              {c.links.map((l, j) => (
                <a key={j} onClick={linkAction(l)}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Simple Solution OG · {t.footer.rights}</span>
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

/* ---- WhatsApp float ---- */
function WhatsAppFloat() {
  const { t } = useLang();
  return (
    <button className="wa-float" title={t.wa} aria-label={t.wa} onClick={() => window.open("https://wa.me/4300000000", "_blank")}>
      <Icon.whatsapp />
    </button>
  );
}

export { useReveal, CountUp, LangToggle, Nav, Footer, StickyCTA, WhatsAppFloat };
