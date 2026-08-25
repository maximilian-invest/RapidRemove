"use client";
/* RapidRemove — Landingpage „Einzelne Bewertung löschen" (Bewertungs-Produkt).
   NUR außerhalb DACH: keine deutsche Fassung, kein de-Slug, kein Link aus der
   deutschen Oberfläche. en/es/fr/it/nl/pt sind freigegebene Handoff-Texte
   (Design-Paket rapid_new_launch_2); ja/sv/da/no im selben Ton ergänzt.
   Abweichungen vom Handoff — bewusst an beschlossene Lösungen angepasst:
   · Preis EN $179 (nicht $200) — ein Stripe-Produkt, 179 in beiden Währungen
   · Bedingungen im Hero sichtbar (max. 4 Wochen alt + muss Text enthalten)
   · FAQ „bis zu drei Wochen" statt zwei (Löschung kann bis zu 3 Wochen dauern)
   · mehrere Bewertungen laufen über das „+" im Wizard, nicht über „schreib uns"
   · alle CTAs öffnen den Wizard direkt in der Bewertungs-Eingabe (?start=reviews) */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat, useReveal, useRouteShell } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { pagePath, pageHasLocale } from "@/lib/page-routes";
import { RVW } from "@/lib/reviews-copy";

/* Seitentexte: src/lib/reviews-copy.js (plain-Modul — auch Server-Code liest
   sie dort für JSON-LD und die Artikel-Promo-Blöcke). */

/* Teilen-Demo: 7-Sekunden-CSS-Schleife (Cursor → Teilen-Icon → Dialog → Link
   kopiert). Läuft rein über Keyframes in services.css (.shd-*). */
function ShareDemo({ r }) {
  return (
    <div className="shd">
      <div className="shd-rev">
        <span className="rvw-av">A</span>
        <div className="shd-lines">
          <b>A. Miller · 1/5</b>
          <span className="stars sm">{[0, 1, 2, 3, 4].map((i) => <Icon.star key={i} style={{ opacity: i < 1 ? 1 : 0.22 }} />)}</span>
          <i></i><i className="w2"></i>
          <div className="shd-actions"><span className="shd-share"><Icon.share size={15} /></span></div>
        </div>
      </div>
      <div className="shd-pop">
        <div className="shd-pop-t">{r.how.shareT}</div>
        <div className="shd-hint">{r.how.copyHint}</div>
        <div className="shd-url">https://share.google/w2VjJz…
          <span className="c2"><Icon.check size={12} /> {r.how.copied}</span>
        </div>
      </div>
      <span className="shd-cursor"></span>
    </div>
  );
}

/* Hero-Demo: Google-artige Bewertungsliste, die 1-Stern-Bewertung in der Mitte
   ist durchgestrichen und trägt die grüne „Entfernt"-Plakette. */
function RvwDemo({ r }) {
  const rows = [
    { k: "ok", n: "Anna M.", s: 5, tx: "Friendly, fast, fair. Recommended." },
    { k: "bad", n: "User92841", s: 1, tx: "Total scam, avoid!!! Never was a customer here." },
    { k: "ok", n: "James T.", s: 5, tx: "Great service, came back twice." },
  ];
  return (
    <div className="rvw-demo">
      <div className="rvw-head"><span className="rvw-pin"><Icon.mapPin size={14} /></span><b>{r.demoName}</b><span className="stars sm">{[0, 1, 2, 3, 4].map((i) => <Icon.star key={i} />)}</span></div>
      {rows.map((row, i) => (
        <div className={"rvw-row " + row.k} key={i}>
          <span className="rvw-av">{row.n[0]}</span>
          <div className="rvw-tx">
            <div className="rvw-meta"><b>{row.n}</b><span className="stars sm">{[0, 1, 2, 3, 4].map((j) => <Icon.star key={j} style={{ opacity: j < row.s ? 1 : 0.22 }} />)}</span></div>
            <p>{row.tx}</p>
          </div>
          {row.k === "bad" && <span className="rvw-gone"><Icon.check size={13} /> {r.demoRemoved}</span>}
        </div>
      ))}
    </div>
  );
}

export function ReviewsServicePage({ onStart, onGoHome, onBlog, onAbout, onOrm, onDeindex, onSeo }) {
  const { t } = useLang();
  const r = RVW[t.code] || RVW.en;
  const [open, setOpen] = React.useState(0);
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  return (
    <div className="lp">
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} onOrm={onOrm} onDeindex={onDeindex} onSeo={onSeo} active="reviews" />
      <section className="lp-hero">
        <div className="hero-glow"></div>
        <div className="container lp-hero-grid">
          <div>
            <span className="eyebrow reveal"><Icon.star size={15} /> {r.eyebrow}</span>
            <h1 className="reveal d1">{r.h1}</h1>
            <p className="lp-lead reveal d2">{r.lead}</p>
            <div className="rvw-price reveal d2"><span className="amt">{r.price}</span><span className="per">{r.per}</span></div>
            <p className="rvw-price-note reveal d2">{r.priceNote}</p>
            {/* Pflicht-Hinweis (beschlossen): max. 4 Wochen alt + muss Text enthalten —
               jeder Kunde sieht ihn hier VOR dem Einstieg in den Wizard. */}
            <p className="rvw-cond reveal d2"><Icon.info size={15} /> <span>{r.condNote}</span></p>
            <div className="lp-cta-row reveal d2">
              <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.search size={18} /> {r.cta} <Icon.arrowRight size={17} /></button>
            </div>
            <div className="lp-assure reveal d3">
              {r.assure.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
            </div>
          </div>
          <div className="reveal d2"><RvwDemo r={r} /></div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.zap size={15} /> {r.stepsEyebrow}</span>
            <h2>{r.stepsH}</h2>
          </div>
          <div className="lp-steps three">
            {r.steps.map((st, i) => (
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
            <span className="eyebrow"><Icon.share size={15} /> {r.how.eyebrow}</span>
            <h2>{r.how.h}</h2>
          </div>
          <div className="shd-grid reveal">
            <div className="shd-steps">
              {r.how.steps.map((s, i) => (
                <div className="shd-step" key={i}><span className="n">{i + 1}</span><p>{s}</p></div>
              ))}
              <div className="shd-alt"><Icon.info size={15} /> {r.how.alt}</div>
            </div>
            <ShareDemo r={r} />
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.shieldCheck size={15} /> {r.honestyEyebrow}</span>
            <h2>{r.honestyH}</h2>
          </div>
          <div className="honesty">
            <div className="honesty-col yes reveal d1">
              <h4><Icon.checkCircle /> {r.yesH}</h4>
              <ul>{r.yes.map((y, i) => <li key={i}><Icon.check /> {y}</li>)}</ul>
            </div>
            <div className="honesty-col no reveal d2">
              <h4><Icon.alert size={20} style={{ color: "var(--fg-muted)" }} /> {r.noH}</h4>
              <ul>{r.no.map((n, i) => <li key={i}><Icon.x /> {n}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="band tight" id="rvw-form">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.mail size={15} /> {r.formEyebrow}</span>
            <h2>{r.formH}</h2>
            <p>{r.formSub}</p>
          </div>
          <div className="reveal">
            <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.search size={18} /> {r.cta} <Icon.arrowRight size={17} /></button>
            <div className="cc-foot" style={{ justifyContent: "center", marginTop: 14 }}><Icon.lock /> {r.priceNote}</div>
          </div>
        </div>
      </section>

      <section className="band tight soft">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.info size={15} /> {r.faqEyebrow}</span>
            <h2>{r.faqH}</h2>
          </div>
          <div className="faq reveal">
            {r.faq.map((it, i) => (
              <div className={"faq-row" + (open === i ? " open" : "")} key={i}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>{it.q} <Icon.chevronDown /></button>
                <div className="faq-a"><div className="faq-a-inner"><p>{it.a}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band tight">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="sec-head center reveal"><h2>{r.finalH}</h2></div>
          <div className="reveal"><button className="btn btn-primary lg" onClick={() => onStart()}><Icon.search size={18} /> {r.finalCta} <Icon.arrowRight size={17} /></button></div>
        </div>
      </section>

      <Footer onStart={() => onStart()} onBlog={onBlog} onAbout={onAbout} />
      <WhatsAppFloat />
    </div>
  );
}

/* Statische Route (/<lang>/<slug>). Alle CTAs öffnen den Wizard direkt in der
   Bewertungs-Eingabe (?start=reviews) — gleiche Zieladresse wie der
   Announcement-Banner. Der Sprachumschalter springt für Sprachen ohne diese
   Seite (Deutsch) auf die jeweilige Startseite statt auf einen toten Slug. */
export function ReviewsRoute({ initialLang = "en" }) {
  const { lang, t, setLang, nav, base } = useRouteShell(initialLang, "reviews");
  const start = () => nav(pagePath("wizard", lang) + "?start=reviews");
  const switchLang = (l) => {
    if (pageHasLocale("reviews", l)) return setLang(l);
    try { localStorage.setItem("rr_lang", l); } catch (e) { /* Privatmodus */ }
    window.location.href = asset(localePath(l));
  };
  return (
    <LangContext.Provider value={{ lang, t, setLang: switchLang }}>
      <ReviewsServicePage {...base} onStart={start} />
    </LangContext.Provider>
  );
}
