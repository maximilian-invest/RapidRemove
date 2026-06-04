"use client";
/* RapidRemove — About / Über uns page (standalone route). */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat, useReveal, CountUp } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";

const ABOUT_COPY = {
  de: {
    eyebrow: "Über uns",
    h1: "Der Weltmarktführer für die Löschung von Google-Profilen.",
    lead: "Wir geben Unternehmern die Kontrolle über ihren Ruf zurück – schnell, legal und ohne Risiko. Aus Österreich, für Kunden in über 30 Ländern.",
    missionLabel: "Unsere Mission",
    mission: ["Niemand sollte sich seinem Google-Eintrag ", "ausgeliefert", " fühlen. Wir nehmen Ihnen das Problem ab – und Sie zahlen erst, wenn es gelöst ist."],
    missionSign: "— Das Team von RapidRemove",
    storyH: "Aus Frust wurde eine Lösung.",
    story: [
      "RapidRemove entstand aus einer einfachen Beobachtung: Unternehmer waren ihren Google-Unternehmensprofilen schutzlos ausgeliefert. Fake-Bewertungen, veraltete Einträge, Rachekampagnen – und kein Knopf, um das Ganze zu beenden.",
      "Anwälte waren teuer, langsam und unsicher. Also haben wir einen besseren Weg gebaut: eine eigene, juristisch geprüfte Methode, die das gesamte Profil dauerhaft und über die offiziellen Schnittstellen entfernt.",
      "Heute ist daraus der weltweit führende Anbieter für die Löschung von Google-Unternehmensprofilen geworden – mit einem Versprechen, das alles zusammenhält: Bezahlung erst nach Erfolg.",
    ],
    timeline: [
      { y: "2021", t: "Der Anfang", d: "Gegründet in Hallein, Österreich – aus dem Frust über die Ohnmacht gegenüber Google." },
      { y: "2023", t: "Eigene Methode", d: "Entwicklung eines juristisch geprüften Verfahrens über offizielle Schnittstellen." },
      { y: "2024", t: "International", d: "Expansion in über 30 Länder, vollständig mehrsprachig." },
      { y: "2026", t: "Weltmarktführer", d: "Über 1.000 entfernte Profile und 5,0★ auf Trustpilot." },
    ],
    statsLabel: "RapidRemove in Zahlen",
    stats: [
      { v: 1000, suf: "+", l: "entfernte Profile" },
      { v: 30, suf: "+", l: "Länder weltweit" },
      { v: 98, suf: " %", l: "Erfolgsquote" },
      { fmt: "5,0 ★", l: "auf Trustpilot" },
    ],
    valuesLabel: "Wofür wir stehen",
    valuesH: "Vertrauen ist kein Feature. Es ist das Fundament.",
    values: [
      { ic: "shieldCheck", t: "Kein Erfolg, keine Kosten", d: "Sie zahlen ausschließlich nach erfolgreicher Löschung. Bleibt das Profil online, zahlen Sie nichts." },
      { ic: "gavel", t: "100 % legal", d: "Unsere Methode ist juristisch geprüft und arbeitet ausschließlich über offizielle Schnittstellen." },
      { ic: "lock", t: "Diskret & DSGVO-konform", d: "Server in der EU, kein Zugriff auf Ihr Konto oder persönliche Daten. Ihr Anliegen bleibt vertraulich." },
    ],
    teamLabel: "Das Team",
    teamH: "Spezialisten, die Ihren Fall persönlich betreuen.",
    team: [
      { n: "Matthias", r: "Gründer & Geschäftsführung", thm: "tm-orange", img: null },
      { n: "Maximilian Hölzl", r: "Gründer", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" },
      { n: "Lena", r: "Leitung Reputation", thm: "tm-teal" },
      { n: "Dr. Stein", r: "Recht & Compliance", thm: "tm-plum" },
      { n: "Sophie", r: "Kundenbetreuung", thm: "tm-orange" },
    ],
    coH: "Ein echtes Unternehmen. Mit Namen und Adresse.",
    coSub: "Hinter RapidRemove steht eine eingetragene Firma in Österreich – kein anonymer Anbieter, sondern ein realer EU-Betrieb mit klaren Daten.",
    coFacts: [
      { l: "Firma", v: "Simple Solution OG" },
      { l: "Adresse", v: "Salzgasse 2, 5400 Hallein, Österreich" },
      { l: "UID-Nummer", v: "ATU72401536" },
      { l: "Kontakt", v: "hallo@rapid-remove.com" },
    ],
    coBadges: ["DSGVO-konform", "Server in der EU", "Juristisch geprüft", "Made in Austria"],
    ctaTitle: "Lernen Sie uns kennen – mit dem Gratis-Check.",
    ctaBtn: "Gratis prüfen",
  },
  en: {
    eyebrow: "About us",
    h1: "The world leader in deleting Google profiles.",
    lead: "We give business owners back control over their reputation – fast, legal and risk-free. From Austria, for clients in 30+ countries.",
    missionLabel: "Our mission",
    mission: ["No one should feel ", "at the mercy", " of their Google listing. We take the problem off your hands – and you only pay once it's solved."],
    missionSign: "— The RapidRemove team",
    storyH: "Frustration became a solution.",
    story: [
      "RapidRemove began with a simple observation: business owners were defenceless against their Google business profiles. Fake reviews, outdated listings, revenge campaigns – and no button to end it.",
      "Lawyers were expensive, slow and uncertain. So we built a better way: our own, lawyer-reviewed method that removes the entire profile permanently and through official channels.",
      "Today it has become the world's leading provider for removing Google business profiles – held together by one promise: payment only after success.",
    ],
    timeline: [
      { y: "2021", t: "The beginning", d: "Founded in Hallein, Austria – out of frustration with powerlessness against Google." },
      { y: "2023", t: "Our own method", d: "Developed a lawyer-reviewed process working through official channels." },
      { y: "2024", t: "International", d: "Expanded into 30+ countries, fully multilingual." },
      { y: "2026", t: "World leader", d: "Over 1,000 profiles removed and 5.0★ on Trustpilot." },
    ],
    statsLabel: "RapidRemove in numbers",
    stats: [
      { v: 1000, suf: "+", l: "profiles removed" },
      { v: 30, suf: "+", l: "countries worldwide" },
      { v: 98, suf: "%", l: "success rate" },
      { fmt: "5.0 ★", l: "on Trustpilot" },
    ],
    valuesLabel: "What we stand for",
    valuesH: "Trust isn't a feature. It's the foundation.",
    values: [
      { ic: "shieldCheck", t: "No success, no cost", d: "You pay exclusively after successful removal. If the profile stays online, you pay nothing." },
      { ic: "gavel", t: "100% legal", d: "Our method is lawyer-reviewed and works exclusively through official channels." },
      { ic: "lock", t: "Discreet & GDPR-compliant", d: "EU servers, no access to your account or personal data. Your case stays confidential." },
    ],
    teamLabel: "The team",
    teamH: "Specialists who handle your case personally.",
    team: [
      { n: "Matthias", r: "Founder & CEO", thm: "tm-orange", img: null },
      { n: "Maximilian Hölzl", r: "Founder", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" },
      { n: "Lena", r: "Head of Reputation", thm: "tm-teal" },
      { n: "Dr. Stein", r: "Law & Compliance", thm: "tm-plum" },
      { n: "Sophie", r: "Customer Care", thm: "tm-orange" },
    ],
    coH: "A real company. With a name and an address.",
    coSub: "Behind RapidRemove is a registered company in Austria – not an anonymous provider, but a real EU business with clear details.",
    coFacts: [
      { l: "Company", v: "Simple Solution OG" },
      { l: "Address", v: "Salzgasse 2, 5400 Hallein, Austria" },
      { l: "VAT ID", v: "ATU72401536" },
      { l: "Contact", v: "hello@rapid-remove.com" },
    ],
    coBadges: ["GDPR-compliant", "EU servers", "Lawyer-reviewed", "Made in Austria"],
    ctaTitle: "Get to know us – with the free check.",
    ctaBtn: "Check for free",
  },
};
// ES/FR/IT/NL/PT reuse the EN structure (nav label itself is localized).
["es", "fr", "it", "nl", "pt"].forEach((k) => { if (!ABOUT_COPY[k]) ABOUT_COPY[k] = ABOUT_COPY.en; });

function FinalCTABand({ onStart, title, btn }) {
  return (
    <section className="band tight">
      <div className="container">
        <div className="cta-band reveal">
          <div className="glow"></div>
          <h2>{title}</h2>
          <div style={{ position: "relative", marginTop: 8 }}>
            <button className="btn btn-white lg" onClick={() => onStart()}><Icon.search size={19} /> {btn} <Icon.arrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutInner() {
  const { t } = useLang();
  const a = ABOUT_COPY[t.code] || ABOUT_COPY.en;
  useReveal();
  const nav = (p) => { window.location.href = asset(p); };
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="about">
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={toTop} active="about" />

      <section className="ab-hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="ab-eyebrow reveal"><Icon.rocket size={15} /> {a.eyebrow}</div>
          <h1 className="reveal d1">{a.h1}</h1>
          <p className="ab-lead reveal d2">{a.lead}</p>
        </div>
      </section>

      <section className="ab-mission">
        <div className="glow"></div>
        <div className="container">
          <div className="eyebrow reveal" style={{ color: "var(--orange-400)" }}>{a.missionLabel}</div>
          <div className="mq reveal d1">{a.mission[0]}<b>{a.mission[1]}</b>{a.mission[2]}</div>
          <div className="msign reveal d2">{a.missionSign}</div>
        </div>
      </section>

      <section className="ab-story">
        <div className="container ab-story-grid">
          <div className="reveal">
            <h2>{a.storyH}</h2>
            {a.story.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="ab-timeline reveal d1">
            {a.timeline.map((tl, i) => (
              <div className="ab-tl" key={i}>
                <div className="tl-rail"></div>
                <div className="tl-year">{tl.y}</div>
                <div className="tl-body">
                  <h4>{tl.t}</h4>
                  <p>{tl.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-stats">
        <div className="container">
          <div className="ab-stats-grid">
            {a.stats.map((s, i) => (
              <div className="ab-stat reveal" key={i}>
                <div className="v">{s.fmt ? s.fmt : <CountUp end={s.v} suffix={s.suf} />}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-values">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.shieldCheck size={15} /> {a.valuesLabel}</span>
            <h2>{a.valuesH}</h2>
          </div>
          <div className="ab-val-grid">
            {a.values.map((v, i) => {
              const I = Icon[v.ic] || Icon.shieldCheck;
              return (
                <div className={"ab-val reveal d" + (i + 1)} key={i}>
                  <div className="vic"><I size={26} /></div>
                  <h3>{v.t}</h3>
                  <p>{v.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ab-team">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.user size={15} /> {a.teamLabel}</span>
            <h2>{a.teamH}</h2>
          </div>
          <div className="ab-team-grid">
            {a.team.map((m, i) => (
              <div className={"ab-member reveal d" + ((i % 4) + 1)} key={i}>
                <div className={"m-photo " + m.thm}>
                  {m.img
                    ? <img src={asset(m.img)} alt={m.n} />
                    : <span className="m-initial">{m.n[0]}</span>}
                </div>
                <div className="m-name">{m.n}</div>
                <div className="m-role">{m.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-company">
        <div className="container">
          <div className="ab-co-card reveal">
            <div>
              <h2>{a.coH}</h2>
              <p className="co-sub">{a.coSub}</p>
              <div className="ab-co-badges">
                {a.coBadges.map((b, i) => <span className="b" key={i}><Icon.check /> {b}</span>)}
              </div>
            </div>
            <div className="ab-co-facts">
              {a.coFacts.map((f, i) => (
                <div className="ab-co-row" key={i}>
                  <Icon.building />
                  <div>
                    <div className="crl">{f.l}</div>
                    <div className="crv">{f.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FinalCTABand onStart={() => nav("/?start=1")} title={a.ctaTitle} btn={a.ctaBtn} />

      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={toTop} />
      <WhatsAppFloat />
    </div>
  );
}

export default function About() {
  const [lang, setLangState] = React.useState("de");
  React.useEffect(() => {
    try { const s = localStorage.getItem("rr_lang"); if (s && I18N[s]) setLangState(s); } catch (e) {}
  }, []);
  const setLang = (l) => {
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    window.location.href = asset(localePath(l));
  };
  const t = I18N[lang] || I18N.de;
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <AboutInner />
    </LangContext.Provider>
  );
}
