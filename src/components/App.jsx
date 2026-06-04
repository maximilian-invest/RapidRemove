"use client";
/* RapidRemove — App root: per-language routing + in-page view state */
import React from "react";
import { I18N } from "@/lib/i18n";
import { LangContext } from "@/lib/lang-context";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { Home } from "@/components/Home";
import { Blog } from "@/components/Blog";
import { Wizard } from "@/components/Wizard";

export default function App({ initialLang = "de" }) {
  const lang = I18N[initialLang] ? initialLang : "de";
  const [route, setRoute] = React.useState("home"); // home | wizard | blog
  const [seed, setSeed] = React.useState("");
  const [homeScroll, setHomeScroll] = React.useState(null);

  // Deep links from other pages: ?start=1 -> wizard, ?view=magazin -> blog, #section -> scroll.
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("start") === "1") setRoute("wizard");
      else if (params.get("view") === "magazin") setRoute("blog");
      const hash = window.location.hash ? window.location.hash.slice(1) : "";
      if (hash) setHomeScroll(hash);
    } catch (e) {}
    try { localStorage.setItem("rr_lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switching language navigates to that locale's own URL (real, crawlable pages).
  const setLang = (l) => {
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    window.location.href = asset(localePath(l));
  };

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
