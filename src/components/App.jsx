"use client";
/* RapidRemove — App root: routing + language context */
import React from "react";
import { I18N } from "@/lib/i18n";
import { LangContext } from "@/lib/lang-context";
import { Home } from "@/components/Home";
import { Blog } from "@/components/Blog";
import { Wizard } from "@/components/Wizard";

export default function App() {
  const [lang, setLangState] = React.useState("de");
  const [route, setRoute] = React.useState("home"); // home | wizard | blog
  const [seed, setSeed] = React.useState("");
  const [homeScroll, setHomeScroll] = React.useState(null);

  // Load the persisted language after mount (keeps SSR + first paint deterministic).
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("rr_lang");
      if (saved && I18N[saved] && saved !== lang) setLangState(saved);
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    document.documentElement.lang = l;
  };
  React.useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const t = I18N[lang] || I18N.de;

  const startWizard = (name) => {
    setSeed(typeof name === "string" ? name : "");
    setRoute("wizard");
    window.scrollTo({ top: 0 });
  };
  const exitWizard = () => { setRoute("home"); window.scrollTo({ top: 0 }); };
  const openBlog = () => { setRoute("blog"); window.scrollTo({ top: 0 }); };
  const goHome = (id) => { setHomeScroll(id || "__top"); setRoute("home"); };

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {route === "home"
        ? <Home onStart={startWizard} onBlog={openBlog} scrollTarget={homeScroll} onScrolled={() => setHomeScroll(null)} />
        : route === "blog"
          ? <Blog onStart={startWizard} onGoHome={goHome} />
          : <Wizard key={seed + lang} initialName={seed} onExit={exitWizard} />}
    </LangContext.Provider>
  );
}
