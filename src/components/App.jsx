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
import { OrmPage, DeindexPage } from "@/components/ServicePages";

export default function App({ initialLang = "de" }) {
  const lang = I18N[initialLang] ? initialLang : "de";
  const [route, setRoute] = React.useState("home"); // home | wizard | blog | orm | deindex
  const [seed, setSeed] = React.useState("");
  const [seedProfile, setSeedProfile] = React.useState(null);
  const [homeScroll, setHomeScroll] = React.useState(null);

  // Deep links: ?start=1 -> wizard, ?view=magazin|reputation|presse -> view, #section -> scroll.
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      if (params.get("start") === "1") setRoute("wizard");
      else if (view === "magazin") setRoute("blog");
      else if (view === "reputation") setRoute("orm");
      else if (view === "presse") setRoute("deindex");
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

  // Vom Hero/Live-Suche: entweder ein String (getippter Firmenname) oder ein
  // konkretes Profil-Objekt (in der Live-Suche angeklickt). Mit Profil springt
  // der Wizard direkt zu „Schritt 3" (Machbarkeit) – die Profilsuche entfällt.
  const startWizard = (arg) => {
    if (arg && typeof arg === "object") {
      setSeed(arg.name || "");
      setSeedProfile(arg);
    } else {
      setSeed(typeof arg === "string" ? arg : "");
      setSeedProfile(null);
    }
    setRoute("wizard");
    window.scrollTo({ top: 0 });
  };
  const exitWizard = () => { setRoute("home"); window.scrollTo({ top: 0 }); };
  const openBlog = () => { setRoute("blog"); window.scrollTo({ top: 0 }); };
  const openOrm = () => { setRoute("orm"); window.scrollTo({ top: 0 }); };
  const openDeindex = () => { setRoute("deindex"); window.scrollTo({ top: 0 }); };
  const goHome = (id) => { setHomeScroll(id || "__top"); setRoute("home"); window.scrollTo({ top: 0 }); };
  const onAbout = () => { window.location.href = asset("/ueber-uns/"); };

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {route === "home"
        ? <Home onStart={startWizard} onBlog={openBlog} onOrm={openOrm} onDeindex={openDeindex} scrollTarget={homeScroll} onScrolled={() => setHomeScroll(null)} />
        : route === "blog"
          ? <Blog onStart={startWizard} onGoHome={goHome} onOrm={openOrm} onDeindex={openDeindex} />
          : route === "orm"
            ? <OrmPage onStart={startWizard} onGoHome={goHome} onBlog={openBlog} onAbout={onAbout} onOrm={openOrm} onDeindex={openDeindex} />
            : route === "deindex"
              ? <DeindexPage onStart={startWizard} onGoHome={goHome} onBlog={openBlog} onAbout={onAbout} onOrm={openOrm} onDeindex={openDeindex} />
              : <Wizard key={(seedProfile ? "p:" + (seedProfile.placeId || seedProfile.name) : seed) + lang} initialName={seed} initialProfile={seedProfile} onExit={exitWizard} />}
    </LangContext.Provider>
  );
}
