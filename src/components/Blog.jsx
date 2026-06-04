"use client";
import React from "react";
import { asset } from "@/lib/base";
import { ARTICLE_SLUG } from "@/lib/article-google-profil";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { useReveal, CountUp, Nav, Footer, WhatsAppFloat } from "@/components/Chrome";


function ArticleMeta({ a, t }) {
  return (
    <div className="article-meta">
      <span className="am-ava">{a.author[0]}</span>
      <span>{a.author}</span>
      <span className="am-dot"></span>
      <span>{a.read} {t.blog.min}</span>
      <span className="am-dot"></span>
      <span>{a.date}</span>
    </div>
  );
}

function AuthStat({ s }) {
  // rating stat: fmt "49->4,9 ★" -> show the part after the arrow, static
  if (s.fmt) {
    const shown = s.fmt.split("->")[1];
    return <div className="as"><div className="v">{shown}</div><div className="l">{s.l}</div></div>;
  }
  return (
    <div className="as">
      <div className="v">{s.pre || ""}<CountUp end={s.v} suffix={s.suf} /></div>
      <div className="l">{s.l}</div>
    </div>
  );
}

function Blog({ onStart, onGoHome }) {
  const { t } = useLang();
  const b = t.blog;
  const [cat, setCat] = React.useState(b.cats[0]);
  useReveal();
  React.useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const featured = b.articles[0];
  const rest = b.articles.slice(1);
  const filtered = cat === b.cats[0] ? rest : rest.filter((a) => a.cat === cat);
  const FeatIcon = Icon[featured.icon] || Icon.star;

  return (
    <div className="mag">
      <Nav onNav={(id) => onGoHome(id)} onStart={() => onStart()} onBlog={() => window.scrollTo({ top: 0, behavior: "smooth" })} active="magazin" />

      {/* hero */}
      <section className="mag-hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="mag-kicker reveal">
            <span className="mk-logo">RapidRemove</span>
            <span className="mk-tag">{b.kicker}</span>
          </div>
          <h1 className="reveal d1">{b.h1}</h1>
          <p className="mag-lead reveal d2">{b.lead}</p>
          <div className="leader-ribbon reveal d3">
            <span className="lr-badge"><Icon.star size={14} /> {b.ribbonBadge}</span>
            <span className="lr-txt">{b.ribbonText("1.000")}</span>
          </div>

          {/* featured */}
          <a className="feat-article reveal d2" href={t.code === "de" ? asset("/" + ARTICLE_SLUG + "/") : undefined} style={{ textDecoration: "none", color: "inherit", cursor: t.code === "de" ? "pointer" : "default" }}>
            <div className={"feat-thumb " + featured.thm}>
              <span className="ft-icon"><FeatIcon /></span>
              <span className="ft-cat"><Icon.star size={13} /> {b.featuredTag}</span>
            </div>
            <div className="feat-body">
              <div className="fb-eyebrow">{featured.cat}</div>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <ArticleMeta a={featured} t={t} />
            </div>
          </a>
        </div>
      </section>

      {/* press band */}
      <div className="press-band">
        <div className="container press-inner">
          <span className="pl-label">{b.pressLabel}</span>
          {b.press.map((p, i) => <span className="pl" key={i}>{p}</span>)}
        </div>
      </div>

      {/* authority numbers */}
      <section className="mag-authority">
        <div className="glow"></div>
        <div className="container">
          <div className="ma-head">
            <span className="eyebrow">{b.authorityEyebrow}</span>
            <h2>{b.authorityTitle}</h2>
          </div>
          <div className="auth-stats">
            {b.authStats.map((s, i) => <AuthStat key={i} s={s} />)}
          </div>
        </div>
      </section>

      {/* article grid */}
      <section className="mag-section soft">
        <div className="container">
          <div className="sec-head reveal" style={{ marginBottom: 28 }}>
            <span className="eyebrow">{b.sectionEyebrow}</span>
            <h2>{b.sectionTitle}</h2>
          </div>
          <div className="cat-row reveal">
            {b.cats.map((c) => (
              <button key={c} className={"cat-chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="art-grid">
            {filtered.map((a, i) => {
              const I = Icon[a.icon] || Icon.star;
              return (
                <article className={"art-card reveal d" + ((i % 3) + 1)} key={a.title}>
                  <div className={"art-thumb " + a.thm}>
                    <span className="at-icon"><I /></span>
                    <span className="at-cat">{a.cat}</span>
                  </div>
                  <div className="art-body">
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <ArticleMeta a={a} t={t} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* global presence */}
      <section className="mag-section">
        <div className="container">
          <div className="globe-strip reveal">
            <div className="gs-left">
              <h2>{b.globeTitle}</h2>
              <p>{b.globeText}</p>
              <div className="globe-tags">
                {b.globeTags.map((g, i) => <span className="gt" key={i}><Icon.mapPin /> {g}</span>)}
              </div>
            </div>
            <div className="globe-vis">
              <div className="ring r1"></div>
              <div className="ring r2"></div>
              <div className="ring r3"></div>
              <div className="core"><Icon.globe /></div>
              {[[18,30],[78,24],[30,72],[68,78],[50,12],[12,55],[88,60],[44,90]].map((pos, i) => (
                <span className="dot" key={i} style={{ left: pos[0] + "%", top: pos[1] + "%" }}></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* newsletter */}
      <section className="mag-section soft">
        <div className="container">
          <div className="mag-news reveal">
            <h2>{b.newsTitle}</h2>
            <p>{b.newsText}</p>
            <div className="news-form">
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <Icon.mail />
                <input className="input" placeholder={b.newsPlaceholder} />
              </div>
              <button className="btn btn-primary lg">{b.newsButton} <Icon.arrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </section>

      <Footer onStart={() => onStart()} onBlog={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <WhatsAppFloat />
    </div>
  );
}

export { Blog };
