"use client";
/* Eigenständige Magazin-Seite unter /magazin/ (echte, crawlbare URL statt ?view=magazin).
   Gleiche Hülle wie Article.jsx: LangContext (DE), Navigation per echten URLs. */
import React from "react";
import { Blog } from "@/components/Blog";
import { LangContext } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { pagePath } from "@/lib/page-routes";

export default function MagazinStandalone({ lang: initialLang = "de", magCards = [] }) {
  const [lang] = React.useState(I18N[initialLang] ? initialLang : "de");
  const setLang = (l) => {
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    window.location.href = asset(localePath(l));
  };
  const t = I18N[lang] || I18N.de;
  const hb = localePath(lang); // "/" bzw. "/<code>/"
  const nav = (path) => { window.location.href = asset(path); };
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <Blog
        onStart={() => nav(hb + "?start=1")}
        onGoHome={(id) => nav(id && id !== "__top" ? hb + "#" + id : hb)}
        onOrm={() => nav(pagePath("orm", lang))}
        onDeindex={() => nav(pagePath("deindex", lang))}
        magCards={magCards}
      />
    </LangContext.Provider>
  );
}
