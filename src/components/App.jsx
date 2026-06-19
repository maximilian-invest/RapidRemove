"use client";
/* RapidRemove — App root: per-language routing + in-page view state */
import React from "react";
import { I18N } from "@/lib/i18n";
import { LangContext } from "@/lib/lang-context";
import { asset } from "@/lib/base";
import { localePath, magazinePath } from "@/lib/locales-meta";
import { pagePath } from "@/lib/page-routes";
import { fetchProfileById } from "@/lib/places";
import { loadWizardSnapshot } from "@/lib/resume";
import { Home } from "@/components/Home";
import { Wizard } from "@/components/Wizard";
import { WhatsAppFloat } from "@/components/Chrome";

export default function App({ initialLang = "de", initialView = null, magCards = [] }) {
  const lang = I18N[initialLang] ? initialLang : "de";
  const [route, setRoute] = React.useState(initialView === "wizard" ? "wizard" : "home"); // home | wizard
  const [seed, setSeed] = React.useState("");
  const [seedProfile, setSeedProfile] = React.useState(null);
  const [resumeSnap, setResumeSnap] = React.useState(null);
  const [bootDone, setBootDone] = React.useState(false); // Deep-Link-Effekt gelaufen? (verhindert „kurz vorab"-Aufblitzen beim Weitermachen)
  const [homeScroll, setHomeScroll] = React.useState(null);

  // Eigene, lokalisierte Wizard-URL (z. B. /profil-pruefen, /it/verifica-profilo);
  // die placeId des gewählten Profils hängt als ?p= dran (teil-/wiederherstellbar).
  const wizardUrl = (placeId) => asset(pagePath("wizard", lang)) + (placeId ? "?p=" + encodeURIComponent(placeId) : "");
  const homeUrl = asset(localePath(lang));
  const setUrl = (u) => { try { if (typeof window !== "undefined" && window.location.pathname + window.location.search !== u) window.history.replaceState(null, "", u); } catch (e) {} };

  // Deep links: ?p=<placeId>/?start=1/initialView -> wizard, ?view=… -> redirect, #section -> scroll.
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      const pid = params.get("p");
      // „Weitermachen": gespeicherten Wizard-Stand wiederherstellen (Schritt + Auswahlen).
      if (params.get("resume") === "1") {
        setRoute("wizard");
        const snap = loadWizardSnapshot();
        if (snap && snap.step != null && Array.isArray(snap.candidates) && snap.candidates.length) {
          setResumeSnap(snap); // vollständiger Stand → exakt dort weitermachen
        } else if (snap && snap.placeId) {
          // älterer/teilweiser Stand → wenigstens das geprüfte Profil laden (Schritt „Machbarkeit")
          fetchProfileById(snap.placeId, lang).then((prof) => { if (prof) { setSeed(prof.name || ""); setSeedProfile(prof); } }).catch(() => {});
        } else if (pid) {
          fetchProfileById(pid, lang).then((prof) => { if (prof) { setSeed(prof.name || ""); setSeedProfile(prof); } }).catch(() => {});
        }
      }
      else if (initialView === "wizard" || params.get("start") === "1" || pid) {
        setRoute("wizard");
        if (pid) fetchProfileById(pid, lang).then((prof) => { if (prof) { setSeed(prof.name || ""); setSeedProfile(prof); } }).catch(() => {});
      }
      else if (view === "magazin") { window.location.replace(asset(magazinePath(lang))); return; }
      else if (view === "reputation") { window.location.replace(asset(pagePath("orm", lang))); return; }
      else if (view === "presse") { window.location.replace(asset(pagePath("deindex", lang))); return; }
      const hash = window.location.hash ? window.location.hash.slice(1) : "";
      if (hash) setHomeScroll(hash);
    } catch (e) {}
    try { localStorage.setItem("rr_lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    setBootDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sobald der Wizard offen ist, die Wizard-URL setzen (Basis-Slug; placeId folgt per onSelectProfile).
  React.useEffect(() => {
    if (route === "wizard") setUrl(wizardUrl(seedProfile && seedProfile.placeId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

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
    const obj = arg && typeof arg === "object";
    if (obj) { setSeed(arg.name || ""); setSeedProfile(arg); }
    else { setSeed(typeof arg === "string" ? arg : ""); setSeedProfile(null); }
    setRoute("wizard");
    setUrl(wizardUrl(obj ? arg.placeId : ""));
    window.scrollTo({ top: 0 });
  };
  const exitWizard = () => { setRoute("home"); setUrl(homeUrl); window.scrollTo({ top: 0 }); };
  // Jede Sprache hat eine echte, crawlbare Magazin-Route (SEO).
  const openBlog = () => { window.location.href = asset(magazinePath(lang)); };
  // Eigene, crawlbare Leistungsseiten (SEO) statt In-App-Ansicht.
  const openOrm = () => { window.location.href = asset(pagePath("orm", lang)); };
  const openDeindex = () => { window.location.href = asset(pagePath("deindex", lang)); };
  const openSeo = () => { window.location.href = asset(pagePath("seo", lang)); };
  const goHome = (id) => { setHomeScroll(id || "__top"); setRoute("home"); setUrl(homeUrl); window.scrollTo({ top: 0 }); };
  const onAbout = () => { window.location.href = asset(pagePath("about", lang)); };
  // Der Wizard meldet das aktuell gewählte Profil → placeId in die URL spiegeln (?p=).
  const onWizardSelect = (placeId) => setUrl(wizardUrl(placeId));

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {route === "home"
        ? <Home onStart={startWizard} onBlog={openBlog} onOrm={openOrm} onDeindex={openDeindex} onSeo={openSeo} scrollTarget={homeScroll} onScrolled={() => setHomeScroll(null)} />
        : !bootDone
          // Erst nach dem Deep-Link-Effekt rendern → beim „Weitermachen" kein Aufblitzen
          // der „kurz vorab"-Startseite; der Wizard startet direkt im gespeicherten Schritt.
          ? <div style={{ minHeight: "82vh" }} aria-hidden />
          : <Wizard key={resumeSnap ? "resume:" + resumeSnap.placeId : (seedProfile ? "p:" + (seedProfile.placeId || seedProfile.name) : seed) + lang} initialResume={resumeSnap} initialName={seed} initialProfile={seedProfile} onExit={exitWizard} onOrm={openOrm} onDeindex={openDeindex} onSelectProfile={onWizardSelect} />}
      {/* Tidio-Live-Chat IMMER laden (auch wenn man direkt auf der Wizard-URL landet);
          im Wizard wird die geschlossene Bubble mobil ausgeblendet. */}
      <WhatsAppFloat hideBubble={route === "wizard"} />
    </LangContext.Provider>
  );
}
