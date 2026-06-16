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
  es: { q: "su nombre + empresa", own: "Su sitio web — inicio", ownUrl: "su-sitio-web.es", neg: "Artículo negativo sobre su empresa", negUrl: "portal-prensa.es › artículo", negTag: "Prensa", other: "Directorio de empresas — ficha", otherUrl: "directorio.es", gone: "Eliminado de la Búsqueda de Google" },
  pt: { q: "o seu nome + empresa", own: "O seu site — início", ownUrl: "o-seu-site.pt", neg: "Artigo negativo sobre a sua empresa", negUrl: "portal-imprensa.pt › artigo", negTag: "Imprensa", other: "Diretório de empresas — registo", otherUrl: "diretorio.pt", gone: "Removido da Pesquisa Google" },
  it: { q: "il tuo nome + azienda", own: "Il tuo sito web — home", ownUrl: "tuo-sito.it", neg: "Articolo negativo sulla tua azienda", negUrl: "portale-stampa.it › articolo", negTag: "Stampa", other: "Elenco aziende — scheda", otherUrl: "elenco.it", gone: "Rimosso dalla Ricerca Google" },
  fr: { q: "votre nom + entreprise", own: "Votre site web — accueil", ownUrl: "votre-site.fr", neg: "Article négatif sur votre entreprise", negUrl: "portail-presse.fr › article", negTag: "Presse", other: "Annuaire d'entreprises — fiche", otherUrl: "annuaire.fr", gone: "Supprimé de la recherche Google" },
  nl: { q: "uw naam + bedrijf", own: "Uw website — home", ownUrl: "uw-website.nl", neg: "Negatief artikel over uw bedrijf", negUrl: "pers-portaal.nl › artikel", negTag: "Pers", other: "Bedrijvengids — vermelding", otherUrl: "bedrijvengids.nl", gone: "Verwijderd uit Google Zoeken" },
  ja: { q: "あなたの名前 + 会社名", own: "あなたのウェブサイト — ホーム", ownUrl: "your-website.jp", neg: "あなたの会社に関する否定的な記事", negUrl: "press-portal.jp › 記事", negTag: "報道", other: "企業ディレクトリ — 掲載", otherUrl: "directory.jp", gone: "Google 検索から削除されました" },
  sv: { q: "ditt namn + företag", own: "Din webbplats — startsida", ownUrl: "din-webbplats.se", neg: "Negativ artikel om ditt företag", negUrl: "press-portal.se › artikel", negTag: "Press", other: "Företagskatalog — post", otherUrl: "katalog.se", gone: "Borttagen från Google Sök" },
  da: { q: "dit navn + virksomhed", own: "Dit websted — forside", ownUrl: "dit-websted.dk", neg: "Negativ artikel om din virksomhed", negUrl: "presse-portal.dk › artikel", negTag: "Presse", other: "Virksomhedsregister — post", otherUrl: "register.dk", gone: "Fjernet fra Google Søgning" },
  no: { q: "navnet ditt + bedrift", own: "Nettstedet ditt — hjem", ownUrl: "nettstedet-ditt.no", neg: "Negativ artikkel om bedriften din", negUrl: "presse-portal.no › artikkel", negTag: "Presse", other: "Bedriftskatalog — oppføring", otherUrl: "katalog.no", gone: "Fjernet fra Google Søk" },
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
