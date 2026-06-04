"use client";
/* RapidRemove — generic magazine article renderer (data-driven, SEO editorial). */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat } from "@/components/Chrome";
import { LangContext } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { resolveHref } from "@/lib/articles/registry";

/* inline **bold** -> <strong> */
function inline(text, k = "i") {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={k + i}>{p}</strong> : <React.Fragment key={k + i}>{p}</React.Fragment>
  );
}

function Body({ data }) {
  const sections = data.blocks.filter((b) => b.t === "h2").map((b) => ({ id: b.id, label: b.toc || b.text }));
  const [progress, setProgress] = React.useState(0);
  const [active, setActive] = React.useState(sections[0] ? sections[0].id : "");
  const [openFaq, setOpenFaq] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const top = window.scrollY || doc.scrollTop;
      const h = doc.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (top / h) * 100) : 0);
      let cur = sections[0] ? sections[0].id : "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 130) cur = s.id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (id) => (e) => { e.preventDefault(); const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); };
  const startCheck = (e) => { if (e) e.preventDefault(); window.location.href = asset("/?start=1"); };

  const CTA = ({ b }) => (
    <div className="art-cta">
      <div className="seal" />
      {b.title && <h3>{b.title}</h3>}
      {b.text && <p>{inline(b.text)}</p>}
      <a className="btn btn-white lg" href={asset(resolveHref(b.href) || "/?start=1")} onClick={b.href && resolveHref(b.href) !== "/?start=1" ? undefined : startCheck}>
        <Icon.search size={18} /> {b.btn || "Gratis prüfen"} <Icon.arrowRight size={17} />
      </a>
      {b.trust && <div className="cta-trust"><Icon.shieldCheck /> {b.trust.join(" · ")}</div>}
    </div>
  );

  const renderBlock = (b, i) => {
    switch (b.t) {
      case "h2": return <h2 id={b.id} key={i}>{b.text}</h2>;
      case "h3": return <h3 key={i}>{b.text}</h3>;
      case "p": return <p key={i}>{inline(b.text)}</p>;
      case "lead": return <p className="lead-p" key={i}>{inline(b.text)}</p>;
      case "ul": return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
      case "ol": return <ol key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>;
      case "note": return (
        <div className="callout info" key={i}><Icon.info /><div className="co-body">{b.title && <b>{b.title}</b>}{inline(b.text)}</div></div>
      );
      case "tip": return (
        <div className="callout tip" key={i}><Icon.checkCircle /><div className="co-body">{b.title && <b>{b.title}</b>}{inline(b.text)}</div></div>
      );
      case "warn": return (
        <div className="callout warn" key={i}><Icon.alert /><div className="co-body">{b.title && <b>{b.title}</b>}{inline(b.text)}</div></div>
      );
      case "quote": return <blockquote className="art-quote" key={i}>{inline(b.text)}</blockquote>;
      case "table": return (
        <div className="art-table-wrap" key={i}>
          <table className="art-table">
            <thead><tr>{b.head.map((h, j) => <th key={j} className={j === b.rrCol ? "rr" : ""}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((row, r) => (
              <tr key={r}>{row.map((c, j) => <td key={j} className={j === b.rrCol ? "rr" : ""}>{inline(c)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      );
      case "cta": return <CTA b={b} key={i} />;
      default: return null;
    }
  };

  const related = (data.related || [])
    .map((r) => ({ label: r.label, href: resolveHref(r.url) }))
    .filter((r) => r.href);

  return (
    <React.Fragment>
      <div className="art-progress"><div className="bar" style={{ width: progress + "%" }} /></div>

      <header className="art-hero">
        <div className="hero-glow" />
        <div className="container">
          <nav className="art-breadcrumb" aria-label="Breadcrumb">
            <a href={asset("/")}>Start</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <a href={asset("/?view=magazin")}>Magazin</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <span>{data.meta.h1 || data.meta.title}</span>
          </nav>
          <span className="art-cat">{(() => { const C = Icon[data.iconKey] || Icon.star; return <C size={14} />; })()} {data.category}</span>
          <h1>{data.meta.h1 || data.meta.title}</h1>
          {data.dek && <p className="art-dek">{inline(data.dek)}</p>}
          <div className="art-meta">
            <span className="am-ava">{data.meta.author[0]}</span>
            <span className="am-author">{data.meta.author}</span>
            {data.meta.authorRole && <span> · {data.meta.authorRole}</span>}
            <span className="am-dot" />
            <span><Icon.clock />{data.readingMin || 7} Min. Lesezeit</span>
            <span className="am-dot" />
            <span>Aktualisiert: Juni 2026</span>
          </div>
        </div>
      </header>

      <div className="container art-layout">
        <article className="prose">
          {data.blocks.map(renderBlock)}

          {data.faq && data.faq.length > 0 && (
            <React.Fragment>
              <h2 id="faq">Häufig gestellte Fragen</h2>
              <div className="art-faq">
                {data.faq.map((f, i) => (
                  <div className={"faq-row" + (openFaq === i ? " open" : "")} key={i}>
                    <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{f.q} <Icon.chevronDown /></button>
                    <div className="faq-a"><div className="faq-a-inner"><p>{f.a}</p></div></div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          )}

          {related.length > 0 && (
            <React.Fragment>
              <h2 id="weiterlesen">Weiterlesen</h2>
              <ul className="art-related">
                {related.map((r, i) => (
                  <li key={i}><a href={asset(r.href)}><Icon.arrowRight size={16} /> {r.label}</a></li>
                ))}
              </ul>
            </React.Fragment>
          )}

          <div className="art-updated"><Icon.checkCircle /> Zuletzt aktualisiert: Juni 2026 · keine Rechtsberatung</div>
          <div className="art-author">
            <div className="aa-ava">{data.meta.author[0]}</div>
            <div>
              <div className="aa-name">{data.meta.author}</div>
              <div className="aa-role">{data.meta.authorRole || "RapidRemove"}</div>
            </div>
          </div>
          <div className="art-back">
            <a className="btn btn-secondary" href={asset("/?view=magazin")}><Icon.arrowLeft size={17} /> Zurück zum Magazin</a>
          </div>
        </article>

        <aside className="art-toc">
          <div className="toc-title">Inhalt</div>
          <ul>
            {sections.map((s) => (
              <li key={s.id}><a href={"#" + s.id} className={active === s.id ? "on" : ""} onClick={goTo(s.id)}>{s.label}</a></li>
            ))}
            {data.faq && data.faq.length > 0 && <li><a href="#faq" className={active === "faq" ? "on" : ""} onClick={goTo("faq")}>Häufige Fragen</a></li>}
          </ul>
          <div className="toc-cta">
            <a className="btn btn-primary sm" href={asset("/?start=1")} onClick={startCheck}><Icon.search size={16} /> Gratis-Check</a>
          </div>
        </aside>
      </div>
    </React.Fragment>
  );
}

export default function MagArticle({ data }) {
  const [lang, setLangState] = React.useState("de");
  const setLang = (l) => { setLangState(l); try { localStorage.setItem("rr_lang", l); } catch (e) {} window.location.href = asset(l === "de" ? "/" : "/" + l + "/"); };
  const t = I18N[lang] || I18N.de;
  const nav = (p) => { window.location.href = asset(p); };
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={() => nav("/ueber-uns/")} active="magazin" />
      <Body data={data} />
      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={() => nav("/ueber-uns/")} />
      <WhatsAppFloat />
    </LangContext.Provider>
  );
}
