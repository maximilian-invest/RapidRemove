"use client";
/* RapidRemove — Erklärvideo (60–70 s, DE + EN) als Abschnitt für Startseite,
   Über uns und Reputation verdrängen. Deutsch bekommt die deutsche Fassung,
   alle anderen Sprachen die englische (mit Hinweis „Video auf Englisch").
   Klick-zum-Abspielen: bis zum Klick wird nur das Poster geladen (kein
   Video-Traffic, kein Autoplay mit Ton). */
import React from "react";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";

const SRC = {
  de: { mp4: "/video/rapidremove-erklaervideo-de-v2.mp4", poster: "/video/explainer-poster-de.webp", dur: "1:09" },
  en: { mp4: "/video/rapidremove-explainer-en-v3.mp4", poster: "/video/explainer-poster-en.webp", dur: "1:01" },
};

const COPY = {
  de: { eyebrow: "In 60 Sekunden", title: "Ihr Ruf entscheidet, wer den Anruf bekommt.", sub: "Bewertung, Google-Profil oder negative Presse: Sie kommen mit Ihrem Problem – wir lösen es. Kurz erklärt im Video.", play: "Video ansehen", note: "" },
  en: { eyebrow: "In 60 seconds", title: "Your reputation decides who gets the call.", sub: "Bad reviews, your Google profile or negative press: you come to us with your problem – we solve it. Explained in one minute.", play: "Watch the video", note: "" },
  es: { eyebrow: "En 60 segundos", title: "Tu reputación decide quién recibe la llamada.", sub: "Reseñas, perfil de Google o prensa negativa: tú nos traes el problema, nosotros lo resolvemos. Explicado en un minuto.", play: "Ver el vídeo", note: "Vídeo en inglés" },
  fr: { eyebrow: "En 60 secondes", title: "Votre réputation décide qui reçoit l'appel.", sub: "Avis, fiche Google ou presse négative : vous venez avec votre problème, nous le résolvons. Expliqué en une minute.", play: "Voir la vidéo", note: "Vidéo en anglais" },
  it: { eyebrow: "In 60 secondi", title: "La tua reputazione decide chi riceve la chiamata.", sub: "Recensioni, profilo Google o stampa negativa: tu porti il problema, noi lo risolviamo. Spiegato in un minuto.", play: "Guarda il video", note: "Video in inglese" },
  nl: { eyebrow: "In 60 seconden", title: "Uw reputatie bepaalt wie het telefoontje krijgt.", sub: "Reviews, Google-profiel of negatieve pers: u komt met uw probleem, wij lossen het op. In één minuut uitgelegd.", play: "Bekijk de video", note: "Video in het Engels" },
  pt: { eyebrow: "Em 60 segundos", title: "A sua reputação decide quem recebe a chamada.", sub: "Avaliações, perfil Google ou imprensa negativa: traga-nos o problema, nós resolvemos. Explicado num minuto.", play: "Ver o vídeo", note: "Vídeo em inglês" },
  ja: { eyebrow: "60秒でわかる", title: "電話がかかってくるかどうかは、評判で決まる。", sub: "口コミ、Googleプロフィール、ネガティブな記事。問題をお持ちいただければ、私たちが解決します。1分の動画でご紹介。", play: "動画を見る", note: "動画は英語です" },
  sv: { eyebrow: "På 60 sekunder", title: "Ditt rykte avgör vem som får samtalet.", sub: "Omdömen, Google-profil eller negativ press: du kommer med problemet – vi löser det. Förklarat på en minut.", play: "Se videon", note: "Video på engelska" },
  da: { eyebrow: "På 60 sekunder", title: "Dit omdømme afgør, hvem der får opkaldet.", sub: "Anmeldelser, Google-profil eller negativ presse: du kommer med problemet – vi løser det. Forklaret på ét minut.", play: "Se videoen", note: "Video på engelsk" },
  no: { eyebrow: "På 60 sekunder", title: "Omdømmet ditt avgjør hvem som får telefonen.", sub: "Anmeldelser, Google-profil eller negativ presse: du kommer med problemet – vi løser det. Forklart på ett minutt.", play: "Se videoen", note: "Video på engelsk" },
};

/** Nur der Player (ohne Abschnitt) — für eigene Layouts. */
export function ExplainerPlayer({ lang }) {
  const v = lang === "de" ? SRC.de : SRC.en;
  const c = COPY[lang] || COPY.en;
  const [playing, setPlaying] = React.useState(false);
  return (
    <div className="xv-frame">
      {playing ? (
        <video className="xv-video" src={asset(v.mp4)} poster={asset(v.poster)} controls autoPlay playsInline preload="auto" />
      ) : (
        <button type="button" className="xv-poster" onClick={() => setPlaying(true)} aria-label={c.play}>
          <img src={asset(v.poster)} alt="" loading="lazy" decoding="async" width="1280" height="720" />
          <span className="xv-play"><span className="xv-tri" aria-hidden="true" /> {c.play} <span className="xv-dur">{v.dur}</span></span>
        </button>
      )}
    </div>
  );
}

/** Abschnitt mit Überschrift + Player. tone: Hintergrund-Klasse des Bands. */
export function ExplainerVideo({ tone = "tint", compact = false }) {
  const { t } = useLang();
  const lang = t.code;
  const c = COPY[lang] || COPY.en;
  return (
    <section className={"band " + tone + (compact ? " tight" : "")} id="erklaervideo">
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.rocket size={15} /> {c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.sub}</p>
        </div>
        <div className="xv-wrap reveal">
          <ExplainerPlayer lang={lang} />
          {c.note ? <div className="xv-note">{c.note}</div> : null}
        </div>
      </div>
    </section>
  );
}
