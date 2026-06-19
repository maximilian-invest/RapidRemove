"use client";
/* RapidRemove — additional service landing pages:
   OrmPage ("Reputation verdrängen") + DeindexPage ("Presse auslisten").
   Rendered as in-page views by App.jsx, reachable from the Leistungen nav. */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat, useReveal, useRouteShell } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { SVC, ORM, DEIDX, SEO } from "@/lib/services-copy";
import { PressSerpDemo } from "@/components/SerpDemo";

/* the design references a few icon names that map onto our set */
const ic = (name) => Icon[name] || (name === "fileText" ? Icon.edit : Icon.shield);

/* ---- Homepage secondary services section ("Mehr als nur Profil-Löschung") ---- */
export function ServicesTrio({ onStart, onOrm, onDeindex, onSeo }) {
  const { t } = useLang();
  const s = SVC[t.code] || SVC.en;
  const acts = { core: () => onStart(), orm: () => onOrm && onOrm(), deindex: () => onDeindex && onDeindex(), seo: () => onSeo && onSeo() };
  return (
    <section className="band">
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.shield size={15} /> {s.trioEyebrow}</span>
          <h2>{s.trioTitle}</h2>
          <p>{s.trioSub}</p>
        </div>
        <div className={"svc-trio" + (s.cards.length === 4 ? " quad" : "")}>
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
export function OrmPage({ onStart, onGoHome, onBlog, onAbout, onOrm, onDeindex, onSeo }) {
  const { t } = useLang();
  const o = ORM[t.code] || ORM.en;
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="lp">
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} onOrm={onOrm} onDeindex={onDeindex} onSeo={onSeo} active="orm" />
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
          <div className="sec-head center reveal" style={{ marginBottom: 0 }}>
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
export function DeindexPage({ onStart, onGoHome, onBlog, onAbout, onOrm, onDeindex, onSeo }) {
  const { t } = useLang();
  const d = DEIDX[t.code] || DEIDX.en;
  const [open, setOpen] = React.useState(0);
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="lp">
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} onOrm={onOrm} onDeindex={onDeindex} onSeo={onSeo} active="deindex" />
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
          <div className="sec-head center reveal" style={{ marginBottom: 0 }}>
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
export function DeindexRoute({ initialLang = "de" }) {
  const { lang, t, setLang, toTop, base } = useRouteShell(initialLang, "deindex");
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <DeindexPage {...base} onDeindex={toTop} />
    </LangContext.Provider>
  );
}

export function OrmRoute({ initialLang = "de" }) {
  const { lang, t, setLang, toTop, base } = useRouteShell(initialLang, "orm");
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <OrmPage {...base} onOrm={toTop} />
    </LangContext.Provider>
  );
}

/* ---- SEO landing page ("SEO & Sichtbarkeit") ---- */
/* Animated "rank climb": the brand row rises from the bottom slot to #1. */
function SeoRankClimb({ seo }) {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROW_H = 62;
  const SLOTS = 5;
  const [pos, setPos] = React.useState(reduce ? 0 : SLOTS - 1);
  const started = React.useRef(false);
  React.useEffect(() => {
    if (reduce || started.current) return;
    started.current = true;
    let cur = SLOTS - 1;
    let timer;
    const step = () => { cur -= 1; setPos(cur); if (cur > 0) timer = setTimeout(step, 620); };
    timer = setTimeout(step, 850);
    return () => clearTimeout(timer);
  }, [reduce]);
  const compSlots = [];
  for (let sLot = 0, ci = 0; sLot < SLOTS; sLot++) { if (sLot !== pos) { compSlots[ci] = sLot; ci++; } }
  const atTop = pos === 0;
  return (
    <div className="seo-rank">
      <div className="seo-rank-bar"><Icon.search size={15} /> <span>{seo.serpQuery}</span></div>
      <div className="seo-rank-list" style={{ height: SLOTS * ROW_H - 9 + "px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div className="seo-row" key={"c" + i} style={{ top: compSlots[i] * ROW_H + "px" }}>
            <span className="rk">{compSlots[i] + 1}</span>
            <div className="seo-row-body"><span className="ln"></span><span className="ln short"></span></div>
          </div>
        ))}
        <div className={"seo-row you" + (atTop ? " top" : "")} style={{ top: pos * ROW_H + "px" }}>
          <span className="rk">{pos + 1}</span>
          <div className="seo-row-body"><span className="ttl">{seo.serpYou}</span><span className="ln short"></span></div>
          <span className={"climb" + (atTop ? " show" : "")}><Icon.trendUp size={14} /> {seo.serpBefore} → {seo.serpAfter}</span>
        </div>
      </div>
    </div>
  );
}

export function SeoPage({ onStart, onGoHome, onBlog, onAbout, onOrm, onDeindex, onSeo, onAnalyse }) {
  const { t } = useLang();
  const s = SEO[t.code] || SEO.en;
  const [open, setOpen] = React.useState(0);
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  const xsAct = { core: () => onStart(), orm: () => onOrm && onOrm(), deindex: () => onDeindex && onDeindex(), kontakt: () => onAnalyse() };
  const scrollPricing = () => {
    const el = document.getElementById("seo-pricing");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" });
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="lp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} onOrm={onOrm} onDeindex={onDeindex} onSeo={onSeo} active="seo" />

      <section className="lp-hero">
        <div className="hero-glow"></div>
        <div className="container lp-hero-grid">
          <div>
            <span className="eyebrow reveal"><Icon.trendUp size={15} /> {s.eyebrow}</span>
            <h1 className="reveal d1">{s.h1}</h1>
            <p className="lp-lead reveal d2">{s.lead}</p>
            <div className="lp-cta-row reveal d2">
              <button className="btn btn-primary lg" onClick={() => onAnalyse()}><Icon.search size={18} /> {s.cta} <Icon.arrowRight size={17} /></button>
              <button className="btn btn-link" onClick={scrollPricing}>{s.secondary} <Icon.chevronDown size={16} /></button>
            </div>
            <div className="lp-assure reveal d3">
              {s.trust.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
            </div>
          </div>
          <div className="reveal d2">
            <SeoRankClimb seo={s} />
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.alert size={15} /> {s.problemEyebrow}</span>
            <h2>{s.problemH}</h2>
            <p>{s.problemSub}</p>
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.zap size={15} /> {s.leversEyebrow}</span>
            <h2>{s.leversH}</h2>
          </div>
          <div className="seo-levers">
            {s.levers.map((l, i) => {
              const I = Icon[l.ic] || Icon.shield;
              return (
                <div className={"seo-lever reveal d" + (i + 1)} key={i}>
                  <div className="sl-ic"><I size={24} /></div>
                  <div><h4>{l.t}</h4><p>{l.d}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.refresh size={15} /> {s.stepsEyebrow}</span>
            <h2>{s.stepsH}</h2>
          </div>
          <div className="lp-steps">
            {s.steps.map((st, i) => (
              <div className={"lp-step reveal d" + (i + 1)} key={i}>
                <div className="n">{i + 1}</div>
                <h4>{st.t}</h4>
                <p>{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band tight" id="seo-pricing">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.card size={15} /> {s.pricingEyebrow}</span>
            <h2>{s.pricingH}</h2>
            <p>{s.pricingSub}</p>
          </div>
          <div className="seo-ptable reveal">
            <div className="seo-pcol head">
              <div className="seo-pcell label"></div>
              {s.rows.map((r, i) => <div className="seo-pcell label" key={i}>{r.label}</div>)}
              <div className="seo-pcell label price-label"></div>
            </div>
            {s.planNames.map((name, c) => (
              <div className={"seo-pcol" + (c === 1 ? " feat" : "")} key={c}>
                {c === 1 && <span className="seo-rec">{s.planRec}</span>}
                <div className="seo-pcell plan">
                  <span className="pn">{name}</span>
                  <span className="pi">{s.planIdeal[c]}</span>
                </div>
                {s.rows.map((r, i) => <div className="seo-pcell" key={i}><span className="m-lab">{r.label}</span><span className="v">{r.vals[c]}</span></div>)}
                <div className="seo-pcell price">
                  <span className="pp">{s.prices[c]}</span><span className="pper">{s.pricePer}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="seo-pricing-cta reveal">
            <button className="btn btn-primary lg" onClick={() => onAnalyse()}><Icon.search size={18} /> {s.pricingCta} <Icon.arrowRight size={17} /></button>
            <p className="risk"><Icon.shieldCheck size={15} /> {s.riskReversal}</p>
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.shieldCheck size={15} /> {s.trustEyebrow}</span>
            <h2>{s.trustH}</h2>
          </div>
          <div className="seo-trust">
            {s.trustPoints.map((p, i) => {
              const I = Icon[p.ic] || Icon.check;
              return (
                <div className={"seo-tcard reveal d" + (i + 1)} key={i}>
                  <div className="st-ic"><I size={24} /></div>
                  <h4>{p.t}</h4>
                  <p>{p.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.sparkle size={15} /> {s.xsEyebrow}</span>
            <h2>{s.xsH}</h2>
            <p>{s.xsSub}</p>
          </div>
          <div className="seo-xsell">
            {s.crossSell.map((c, i) => {
              const I = Icon[c.ic] || Icon.shield;
              return (
                <button className={"seo-xcard reveal d" + (i + 1)} key={c.id} onClick={() => (xsAct[c.id] || (() => {}))()}>
                  <div className="sx-ic"><I size={21} /></div>
                  <div className="sx-tx"><span className="t">{c.t}</span><span className="d">{c.d}</span></div>
                  <Icon.arrowRight size={17} />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.info size={15} /> {s.faqEyebrow}</span>
            <h2>{s.faqH}</h2>
          </div>
          <div className="faq reveal">
            {s.faq.map((it, i) => (
              <div className={"faq-row" + (open === i ? " open" : "")} key={i}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>{it.q} <Icon.chevronDown /></button>
                <div className="faq-a"><div className="faq-a-inner"><p>{it.a}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="freecheck-band reveal">
            <span className="eyebrow" style={{ justifyContent: "center" }}><Icon.trendUp size={15} /> {s.eyebrow}</span>
            <div className="fc-price">{s.finalH}</div>
            <div className="fc-sub">{s.finalSub}</div>
            <button className="btn btn-primary lg" onClick={() => onAnalyse()}><Icon.search size={18} /> {s.finalCta} <Icon.arrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <Footer onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} />
      <WhatsAppFloat />
    </div>
  );
}

export function SeoRoute({ initialLang = "de" }) {
  const { lang, t, setLang, toTop, base } = useRouteShell(initialLang, "seo");
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <SeoPage {...base} onSeo={toTop} onAnalyse={base.onKontakt} />
    </LangContext.Provider>
  );
}
