"use client";
/* RapidRemove — Autorenprofil (E-E-A-T). Nav/Footer wie die übrigen Seiten,
   Bio + Liste der Artikel dieses Autors. In allen Sprachen. */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, useRouteShell } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { asset } from "@/lib/base";
import { localePath, magazinePath } from "@/lib/locales-meta";
import { pagePath } from "@/lib/page-routes";
import { roleFor, bioFor } from "@/lib/authors";

const TXT = {
  de: { label: "Autor", by: (n) => `Artikel von ${n}` },
  en: { label: "Author", by: (n) => `Articles by ${n}` },
  es: { label: "Autor", by: (n) => `Artículos de ${n}` },
  fr: { label: "Auteur", by: (n) => `Articles de ${n}` },
  it: { label: "Autore", by: (n) => `Articoli di ${n}` },
  nl: { label: "Auteur", by: (n) => `Artikelen van ${n}` },
  pt: { label: "Autor", by: (n) => `Artigos de ${n}` },
  ja: { label: "著者", by: (n) => `${n}の記事` },
  sv: { label: "Författare", by: (n) => `Artiklar av ${n}` },
  da: { label: "Forfatter", by: (n) => `Artikler af ${n}` },
  no: { label: "Forfatter", by: (n) => `Artikler av ${n}` },
};

function AuthorInner({ author, articles }) {
  const { t } = useLang();
  const lang = t.code;
  const x = TXT[lang] || TXT.en;
  const nav = (p) => { window.location.href = asset(p); };
  return (
    <React.Fragment>
      <Nav onNav={(id) => nav(localePath(lang) + "#" + id)} onStart={() => nav(localePath(lang) + "?start=1")} onBlog={() => nav(magazinePath(lang))} onAbout={() => nav(pagePath("about", lang))} onOrm={() => nav(pagePath("orm", lang))} onDeindex={() => nav(pagePath("deindex", lang))} active="about" />
      <main className="container" style={{ padding: "56px 24px 72px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          <img src={asset(author.image)} alt={author.name} width={96} height={96} style={{ borderRadius: "50%", objectFit: "cover", flex: "none" }} />
          <div>
            <div style={{ fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 12, color: "var(--primary)" }}>{x.label}</div>
            <h1 style={{ margin: "4px 0 2px", fontSize: 32 }}>{author.name}</h1>
            <div style={{ color: "var(--fg-2)", fontWeight: 700 }}>{roleFor(author, lang)}</div>
          </div>
        </div>
        <p style={{ fontSize: 18, lineHeight: 1.75, color: "var(--fg-2)", marginTop: 26 }}>{bioFor(author, lang)}</p>
        {articles.length > 0 && (
          <React.Fragment>
            <h2 style={{ marginTop: 44, fontSize: 22 }}>{x.by(author.name.split(" ")[0])}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {articles.map((a) => {
                const I = Icon[a.icon] || Icon.star;
                return (
                  <a key={a.href} href={asset(a.href)} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 16px", border: "1px solid var(--hairline)", borderRadius: "var(--r-md)", textDecoration: "none", color: "inherit", fontWeight: 700, background: "#fff" }}>
                    <span className={"art-thumb " + (a.thm || "thm-orange")} style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }} aria-hidden="true">
                      <I size={22} />
                    </span>
                    <span style={{ flex: 1 }}>{a.title}</span>
                    <Icon.arrowRight size={17} style={{ color: "var(--primary)", flex: "none" }} />
                  </a>
                );
              })}
            </div>
          </React.Fragment>
        )}
      </main>
      <Footer onStart={() => nav(localePath(lang) + "?start=1")} onBlog={() => nav(magazinePath(lang))} onAbout={() => nav(pagePath("about", lang))} />
    </React.Fragment>
  );
}

export default function AuthorPage({ author, articles = [], initialLang = "de" }) {
  const { lang, t, setLang } = useRouteShell(initialLang, "about");
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <AuthorInner author={author} articles={articles} />
    </LangContext.Provider>
  );
}
