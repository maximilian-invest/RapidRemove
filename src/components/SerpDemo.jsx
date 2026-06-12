"use client";
/* Animierte Google-Suche: der negative Presse-Treffer blendet aus → „Aus der
   Google-Suche entfernt". Geteilt zwischen Wizard-Router und der Landingpage
   „Presse auslisten" (DeindexPage). Styles liegen global in wizard.css (.serp-demo). */
import React from "react";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";

export const SERP_TXT = {
  de: { q: "Ihr Name + Unternehmen", own: "Ihre Website — Startseite", ownUrl: "ihre-website.de", neg: "Negativer Artikel über Ihr Unternehmen", negUrl: "presse-portal.de › artikel", negTag: "Presse", other: "Branchenverzeichnis — Eintrag", otherUrl: "verzeichnis.de", gone: "Aus der Google-Suche entfernt" },
  en: { q: "your name + company", own: "Your website — home", ownUrl: "your-website.com", neg: "Negative article about your business", negUrl: "press-portal.com › article", negTag: "Press", other: "Business directory — listing", otherUrl: "directory.com", gone: "Removed from Google Search" },
};

export function PressSerpDemo() {
  const { t } = useLang();
  const x = SERP_TXT[t.code] || SERP_TXT.en;
  const [phase, setPhase] = React.useState(0); // 0 show · 1 fading · 2 removed
  React.useEffect(() => {
    let alive = true; const timers = [];
    const cycle = () => {
      if (!alive) return;
      setPhase(0);
      timers.push(setTimeout(() => alive && setPhase(1), 2000));
      timers.push(setTimeout(() => alive && setPhase(2), 3100));
      timers.push(setTimeout(cycle, 7200));
    };
    cycle();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);
  return (
    <div className="serp-demo" aria-hidden="true">
      <div className="serp-bar"><Icon.search size={15} /> {x.q}</div>
      <div className="serp-results">
        <div className="serp-r"><div className="u">{x.ownUrl}</div><div className="st">{x.own}</div><div className="sk" style={{ width: "72%" }}></div></div>
        <div className={"serp-slot" + (phase === 2 ? " done" : "")}>
          {phase < 2 ? (
            <div className={"serp-r neg" + (phase === 1 ? " fading" : "")}>
              <div className="u">{x.negUrl} <span className="neg-tag">{x.negTag}</span></div>
              <div className="st">{x.neg}</div>
              <div className="sk" style={{ width: "58%" }}></div>
            </div>
          ) : (
            <div className="serp-gone"><Icon.checkCircle /> {x.gone}</div>
          )}
        </div>
        <div className="serp-r"><div className="u">{x.otherUrl}</div><div className="st">{x.other}</div><div className="sk" style={{ width: "64%" }}></div></div>
      </div>
    </div>
  );
}
