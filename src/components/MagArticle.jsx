"use client";
/* RapidRemove — generic magazine article renderer (data-driven, SEO editorial, i18n). */
import React from "react";
import "@/styles/article.css";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat } from "@/components/Chrome";
import { LangContext } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { magazinePath } from "@/lib/locales-meta";
import { pagePath } from "@/lib/page-routes";
import { uiFor } from "@/lib/articles/registry";
import { mountIngestionAnim } from "@/lib/ingestion-anim";

/* inline **bold**, *italic*, and [label](url) links. Absolute (https://) → external
   (new tab); root-relative (/…) → on-site link via asset() (same tab, base-path aware). */
function inline(text, k = "i") {
  const s = String(text);
  const re = /\*\*(.+?)\*\*|\*([^*\n]+?)\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
  const out = [];
  let last = 0, m, idx = 0;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(<React.Fragment key={k + idx++}>{s.slice(last, m.index)}</React.Fragment>);
    if (m[1] !== undefined) out.push(<strong key={k + idx++}>{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k + idx++}>{m[2]}</em>);
    else if (/^https?:\/\//.test(m[4])) out.push(<a key={k + idx++} href={m[4]} target="_blank" rel="noopener noreferrer">{m[3]}</a>);
    else out.push(<a key={k + idx++} href={asset(m[4])}>{m[3]}</a>);
    last = re.lastIndex;
  }
  if (last < s.length) out.push(<React.Fragment key={k + idx++}>{s.slice(last)}</React.Fragment>);
  return out;
}

// Animation zur Entstehung eines Profils (dieselbe wie im Wizard bei „ohne Schutz").
function ArticleIngestAnim({ caption, lang }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) return mountIngestionAnim(ref.current, { lang: lang === "de" ? "de" : "en" }); }, [lang]);
  return (
    <figure style={{ margin: "28px 0" }}>
      <div ref={ref} className="pt-ingest" />
      {caption && <figcaption style={{ textAlign: "center", fontSize: 14, color: "var(--fg-muted)", marginTop: 12 }}>{caption}</figcaption>}
    </figure>
  );
}

function Body({ data, lang, ui, related }) {
  const hb = lang === "de" ? "/" : `/${lang}/`;
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
  const startCheck = (e) => { if (e) e.preventDefault(); window.location.href = asset(hb + "?start=1"); };

  const CTA = ({ b }) => (
    <div className="art-cta">
      <div className="seal" />
      {b.title && <h3>{b.title}</h3>}
      {b.text && <p>{inline(b.text)}</p>}
      <a className="btn btn-white lg" href={asset(hb + "?start=1")} onClick={startCheck}>
        <Icon.search size={18} /> {b.btn || ui.ctaBtn} <Icon.arrowRight size={17} />
      </a>
      {b.trust && <div className="cta-trust"><Icon.shieldCheck /> {b.trust.join(" · ")}</div>}
    </div>
  );

  const renderBlock = (b, i) => {
    switch (b.t) {
      case "h2": return <h2 id={b.id} key={i}>{b.text}</h2>;
      case "h3": return <h3 key={i}>{b.text}</h3>;
      case "anim": return <ArticleIngestAnim caption={b.caption} lang={lang} key={i} />;
      case "p": return <p key={i}>{inline(b.text)}</p>;
      case "lead": return <p className="lead-p" key={i}>{inline(b.text)}</p>;
      case "ul": return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ul>;
      case "ol": return <ol key={i}>{b.items.map((it, j) => <li key={j}>{inline(it)}</li>)}</ol>;
      case "note": return <div className="callout info" key={i}><Icon.info /><div className="co-body">{b.title && <b>{b.title}</b>}{inline(b.text)}</div></div>;
      case "tip": return <div className="callout tip" key={i}><Icon.checkCircle /><div className="co-body">{b.title && <b>{b.title}</b>}{inline(b.text)}</div></div>;
      case "warn": return <div className="callout warn" key={i}><Icon.alert /><div className="co-body">{b.title && <b>{b.title}</b>}{inline(b.text)}</div></div>;
      case "quote": return <blockquote className="art-quote" key={i}>{inline(b.text)}</blockquote>;
      case "table": return (
        <div className="art-table-wrap" key={i}>
          <table className="art-table">
            <thead><tr>{b.head.map((h, j) => <th key={j} className={j === b.rrCol ? "rr" : ""}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((row, r) => (<tr key={r}>{row.map((c, j) => <td key={j} className={j === b.rrCol ? "rr" : ""}>{inline(c)}</td>)}</tr>))}</tbody>
          </table>
        </div>
      );
      case "cta": return <CTA b={b} key={i} />;
      default: return null;
    }
  };

  return (
    <React.Fragment>
      <div className="art-progress"><div className="bar" style={{ width: progress + "%" }} /></div>

      <header className="art-hero">
        <div className="hero-glow" />
        <div className="container">
          <nav className="art-breadcrumb" aria-label="Breadcrumb">
            <a href={asset(hb)}>{ui.bcStart}</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <a href={asset(magazinePath(lang))}>{ui.bcMagazin}</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <span>{data.meta.h1 || data.meta.title}</span>
          </nav>
          <span className="art-cat">{(() => { const C = Icon[data.iconKey] || Icon.star; return <C size={14} />; })()} {data.category}</span>
          <h1>{data.meta.h1 || data.meta.title}</h1>
          {data.dek && <p className="art-dek">{inline(data.dek)}</p>}
          <div className="art-meta">
            <span className="am-ava">{data.meta.author[0]}</span>
            <a className="am-author" href={asset(data.meta.authorHref || pagePath("about", lang))} style={{ color: "inherit", textDecoration: "none" }}>{data.meta.author}</a>
            {data.meta.authorRole && <span> · {data.meta.authorRole}</span>}
            <span className="am-dot" />
            <span><Icon.clock />{data.readingMin || 7} {ui.reading}</span>
            <span className="am-dot" />
            <span>{ui.updated}</span>
          </div>
        </div>
      </header>

      <div className="container art-layout">
        <article className="prose">
          {data.blocks.map(renderBlock)}

          {data.faq && data.faq.length > 0 && (
            <React.Fragment>
              <h2 id="faq">{ui.faqHeading}</h2>
              <div className="art-faq">
                {data.faq.map((f, i) => (
                  <div className={"faq-row" + (openFaq === i ? " open" : "")} key={i}>
                    <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{f.q} <Icon.chevronDown /></button>
                    <div className="faq-a"><div className="faq-a-inner"><p>{inline(f.a)}</p></div></div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          )}

          {related && related.length > 0 && (
            <React.Fragment>
              <h2 id="weiterlesen">{ui.related}</h2>
              <ul className="art-related">
                {related.map((r, i) => (
                  <li key={i}><a href={asset(r.href)}><Icon.arrowRight size={16} /> {r.label}</a></li>
                ))}
              </ul>
            </React.Fragment>
          )}

          <div className="art-updated"><Icon.checkCircle /> {ui.lastUpdated}</div>
          <div className="art-author">
            <div className="aa-ava">{data.meta.author[0]}</div>
            <div>
              <a className="aa-name" href={asset(data.meta.authorHref || pagePath("about", lang))} style={{ color: "inherit", textDecoration: "none" }}>{data.meta.author}</a>
              <div className="aa-role">{data.meta.authorRole || "RapidRemove"}</div>
            </div>
          </div>
          <div className="art-back">
            <a className="btn btn-secondary" href={asset(magazinePath(lang))}><Icon.arrowLeft size={17} /> {ui.back}</a>
          </div>
        </article>

        <aside className="art-toc">
          <div className="toc-title">{ui.tocTitle}</div>
          <ul>
            {sections.map((s) => (
              <li key={s.id}><a href={"#" + s.id} className={active === s.id ? "on" : ""} onClick={goTo(s.id)}>{s.label}</a></li>
            ))}
            {data.faq && data.faq.length > 0 && <li><a href="#faq" className={active === "faq" ? "on" : ""} onClick={goTo("faq")}>{ui.tocFaq}</a></li>}
          </ul>
          <div className="toc-cta">
            <a className="btn btn-primary sm" href={asset(hb + "?start=1")} onClick={startCheck}><Icon.search size={16} /> {ui.tocCta}</a>
          </div>
        </aside>
      </div>
    </React.Fragment>
  );
}

export default function MagArticle({ data, lang = "de", ui, langUrls = {}, related = [] }) {
  const strings = ui || uiFor(lang);
  const [l, setL] = React.useState(lang);
  const setLang = (code) => {
    setL(code);
    try { localStorage.setItem("rr_lang", code); } catch (e) {}
    const u = langUrls[code] || (code === "de" ? "/" : `/${code}/`);
    window.location.href = asset(u);
  };
  const t = I18N[l] || I18N.de;
  const nav = (p) => { window.location.href = asset(p); };
  const hb = lang === "de" ? "/" : `/${lang}/`;
  return (
    <LangContext.Provider value={{ lang: l, t, setLang }}>
      <Nav onNav={(id) => nav(hb + "#" + id)} onStart={() => nav(hb + "?start=1")} onBlog={() => nav(magazinePath(lang))} onAbout={() => nav(pagePath("about", lang))} onOrm={() => nav(pagePath("orm", lang))} onDeindex={() => nav(pagePath("deindex", lang))} active="magazin" />
      <Body data={data} lang={lang} ui={strings} related={related} />
      <Footer onStart={() => nav(hb + "?start=1")} onBlog={() => nav(magazinePath(lang))} onAbout={() => nav(pagePath("about", lang))} />
      <WhatsAppFloat />
    </LangContext.Provider>
  );
}
