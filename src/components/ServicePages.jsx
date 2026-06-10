"use client";
/* RapidRemove — additional service landing pages:
   OrmPage ("Reputation verdrängen") + DeindexPage ("Presse auslisten").
   Rendered as in-page views by App.jsx, reachable from the Leistungen nav. */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat, useReveal } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { SVC, ORM, DEIDX } from "@/lib/services-copy";
import { PressSerpDemo } from "@/components/SerpDemo";

/* the design references a few icon names that map onto our set */
const ic = (name) => Icon[name] || (name === "fileText" ? Icon.edit : Icon.shield);

/* ---- Homepage secondary services section ("Mehr als nur Profil-Löschung") ---- */
export function ServicesTrio({ onStart, onOrm, onDeindex }) {
  const { t } = useLang();
  const s = SVC[t.code] || SVC.en;
  const acts = { core: () => onStart(), orm: () => onOrm && onOrm(), deindex: () => onDeindex && onDeindex() };
  return (
    <section className="band soft">
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.shield size={15} /> {s.trioEyebrow}</span>
          <h2>{s.trioTitle}</h2>
          <p>{s.trioSub}</p>
        </div>
        <div className="svc-trio">
          {s.cards.map((c, i) => {
            const I = ic(c.ic);
            return (
              <div className={"svc-card reveal d" + (i + 1) + (c.id === "core" ? " is-core" : "")} key={c.id} onClick={acts[c.id]}>
                <div className="si"><I size={25} /></div>
                <div className="s-tag">{c.tag}</div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
                <span className="s-link">{c.link} <Icon.arrowRight /></span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* shared before/after SERP visual */
/* SERP-Vorher/Nachher-Labels (De-Indexierung) in allen Sprachen */
function SerpBA({ before, after, left, right }) {
  return (
    <div className="serp-ba">
      <div className="serp-ba-head"><div className="before">{before}</div><div className="after">{after}</div></div>
      <div className="serp-ba-cols">
        <div className="serp-ba-col">
          {left.map(([k, n], i) => (
            <div className={"ba-row " + k} key={i}><span className="ba-rank">{n}</span><span className="dot"></span><span className="ln"></span></div>
          ))}
        </div>
        <div className="serp-ba-col">
          {right.map(([k, n], i) => (
            <div className={"ba-row " + k} key={i}><span className="ba-rank">{n}</span><span className="dot"></span><span className="ln"></span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- ORM landing page ("Reputation verdrängen") ---- */
export function OrmPage({ onStart, onGoHome, onBlog, onAbout, onOrm, onDeindex }) {
  const { t } = useLang();
  const o = ORM[t.code] || ORM.en;
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="lp">
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} onOrm={onOrm} onDeindex={onDeindex} active="orm" />
      <section className="lp-hero">
        <div className="hero-glow"></div>
        <div className="container lp-hero-grid">
          <div>
            <span className="eyebrow reveal"><Icon.eye size={15} /> {o.eyebrow}</span>
            <h1 className="reveal d1">{o.h1}</h1>
            <p className="lp-lead reveal d2">{o.lead}</p>
            <div className="lp-cta-row reveal d2">
              <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.search size={18} /> {o.cta} <Icon.arrowRight size={17} /></button>
            </div>
            <div className="lp-assure reveal d3">
              {o.assure.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
            </div>
          </div>
          <div className="reveal d2">
            <SerpBA before={o.baBefore} after={o.baAfter}
              left={[["neg", 1], ["neg", 2], ["neutral", 3], ["neg", 4], ["neutral", 5]]}
              right={[["pos", 1], ["pos", 2], ["neutral", 3], ["pos", 4], ["neg", 5]]} />
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.alert size={15} /> {o.problemEyebrow}</span>
            <h2>{o.problemH}</h2>
            <p>{o.problemSub}</p>
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.zap size={15} /> {o.stepsEyebrow}</span>
            <h2>{o.stepsH}</h2>
          </div>
          <div className="lp-steps">
            {o.steps.map((st, i) => (
              <div className={"lp-step reveal d" + (i + 1)} key={i}>
                <div className="n">{i + 1}</div>
                <h4>{st.t}</h4>
                <p>{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.card size={15} /> {o.pricingEyebrow}</span>
            <h2>{o.pricingH}</h2>
            <p>{o.pricingSub}</p>
          </div>
          <div className="orm-pricing">
            {o.packages.map((pk, i) => (
              <div className={"orm-card reveal d" + (i + 1) + (pk.feat ? " feat" : "")} key={i}>
                {pk.feat && <span className="tag">{pk.tag}</span>}
                <div className="on">{pk.name}</div>
                <div className="op">{pk.price} <small>{pk.per}</small></div>
                <div className="od">{pk.desc}</div>
                <ul>{pk.feats.map((f, j) => <li key={j}><Icon.check /> {f}</li>)}</ul>
                <button className={"btn " + (pk.feat ? "btn-primary" : "btn-secondary")} onClick={() => onStart()}>{pk.cta} <Icon.arrowRight size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.shieldCheck size={15} /> {o.trustEyebrow}</span>
            <h2>{o.trustH}</h2>
            <p>{o.trustSub}</p>
          </div>
          <div className="reveal" style={{ textAlign: "center" }}>
            <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.search size={18} /> {o.cta} <Icon.arrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <Footer onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} />
      <WhatsAppFloat />
    </div>
  );
}

/* ---- De-Index landing page ("Presse auslisten") ---- */
export function DeindexPage({ onStart, onGoHome, onBlog, onAbout, onOrm, onDeindex }) {
  const { t } = useLang();
  const d = DEIDX[t.code] || DEIDX.en;
  const [open, setOpen] = React.useState(0);
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="lp">
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} onOrm={onOrm} onDeindex={onDeindex} active="deindex" />
      <section className="lp-hero">
        <div className="hero-glow"></div>
        <div className="container lp-hero-grid">
          <div>
            <span className="eyebrow reveal">{React.createElement(ic("fileText"), { size: 15 })} {d.eyebrow}</span>
            <h1 className="reveal d1">{d.h1}</h1>
            <p className="lp-lead reveal d2">{d.lead}</p>
            <div className="lp-cta-row reveal d2">
              <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.shieldCheck size={18} /> {d.cta} <Icon.arrowRight size={17} /></button>
            </div>
            <div className="lp-assure reveal d3">
              {d.assure.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
            </div>
          </div>
          <div className="reveal d2">
            <PressSerpDemo />
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.info size={15} /> {d.whatEyebrow}</span>
            <h2>{d.whatH}</h2>
            <p>{d.whatSub}</p>
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.zap size={15} /> {d.stepsEyebrow}</span>
            <h2>{d.stepsH}</h2>
          </div>
          <div className="lp-steps">
            {d.steps.map((st, i) => (
              <div className={"lp-step reveal d" + (i + 1)} key={i}>
                <div className="n">{i + 1}</div>
                <h4>{st.t}</h4>
                <p>{st.d}</p>
              </div>
            ))}
          </div>
          <div className="legal-note reveal"><Icon.gavel /> {d.legalNote}</div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.shield size={15} /> {d.honestyEyebrow}</span>
            <h2>{d.honestyH}</h2>
          </div>
          <div className="honesty">
            <div className="honesty-col yes reveal d1">
              <h4><Icon.checkCircle /> {d.yesH}</h4>
              <ul>{d.yes.map((y, i) => <li key={i}><Icon.check /> {y}</li>)}</ul>
            </div>
            <div className="honesty-col no reveal d2">
              <h4><Icon.alert size={20} style={{ color: "var(--fg-muted)" }} /> {d.noH}</h4>
              <ul>{d.no.map((n, i) => <li key={i}><Icon.x /> {n}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="freecheck-band reveal">
            <span className="eyebrow" style={{ justifyContent: "center" }}><Icon.card size={15} /> {d.priceH}</span>
            <div className="fc-price">{d.priceVal}</div>
            <div className="fc-sub">{d.priceSub}</div>
            <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.shieldCheck size={18} /> {d.cta} <Icon.arrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.info size={15} /> {d.faqEyebrow}</span>
            <h2>{d.faqH}</h2>
          </div>
          <div className="faq reveal">
            {d.faq.map((it, i) => (
              <div className={"faq-row" + (open === i ? " open" : "")} key={i}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>{it.q} <Icon.chevronDown /></button>
                <div className="faq-a"><div className="faq-a-inner"><p>{it.a}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} />
      <WhatsAppFloat />
    </div>
  );
}

/* ---- Standalone-Routen-Wrapper: jede Leistungsseite hat eine eigene, crawlbare
   URL (SEO). Stellt — wie About — den Sprach-Kontext bereit (Sprache aus
   localStorage, Default DE) und verdrahtet alle Navigations-Callbacks auf echte
   URLs. Dadurch führt u. a. das Logo zuverlässig zur Startseite. ---- */
function useRouteShell() {
  const [lang, setLangState] = React.useState("de");
  React.useEffect(() => {
    try { const s = localStorage.getItem("rr_lang"); if (s && I18N[s]) setLangState(s); } catch (e) {}
  }, []);
  const setLang = (l) => {
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    window.location.href = asset(localePath(l));
  };
  const nav = (p) => { window.location.href = asset(p); };
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const t = I18N[lang] || I18N.de;
  // gemeinsame Navigation; die jeweilige Seite überschreibt onOrm/onDeindex mit toTop
  const base = {
    onStart: () => nav("/?start=1"),
    onGoHome: (id) => nav(id && id !== "__top" ? "/#" + id : "/"),
    onBlog: () => nav("/magazin/"),
    onAbout: () => nav("/ueber-uns/"),
    onOrm: () => nav("/reputation-verdraengen/"),
    onDeindex: () => nav("/presse-auslisten/"),
  };
  return { lang, t, setLang, toTop, base };
}

export function DeindexRoute() {
  const { lang, t, setLang, toTop, base } = useRouteShell();
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <DeindexPage {...base} onDeindex={toTop} />
    </LangContext.Provider>
  );
}

export function OrmRoute() {
  const { lang, t, setLang, toTop, base } = useRouteShell();
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <OrmPage {...base} onOrm={toTop} />
    </LangContext.Provider>
  );
}
