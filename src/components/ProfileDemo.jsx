"use client";
/* RapidRemove — Profile Dissolve Demo: a Google business listing that disappears */
import React from "react";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";

const DEMO_COPY = {
  de: { eyebrow: "Sehen Sie es selbst", title: "So verschwindet Ihr Profil – dauerhaft.", sub: "Ihr Unternehmensprofil samt aller Bewertungen wird vollständig aus Google entfernt. Kein „geschlossen“, keine Reste – einfach weg.",
    closed: "Schlechte Bewertungen", removed: "Profil entfernt", removedSub: "Vollständig aus Google verschwunden", chip: "Alle Bewertungen gelöscht",
    phaseFull: "Live auf Google", phaseDel: "Wird entfernt …", phaseDone: "Entfernt ✓", replay: "Nochmal ansehen",
    name: "Müller Zahnarztpraxis", cat: "Zahnarzt", addr: "Hauptstraße 24, 10178 Berlin", reviews: "47 Rezensionen",
    actions: ["Route", "Speichern", "Anrufen", "Website"],
    g: { tabs: ["Alle", "Maps", "Bilder", "News", "Shopping"], results: "Ungefähr 1.240 Ergebnisse (0,38 Sekunden)", orgTitle: "Müller Zahnarztpraxis – Ihre Praxis in Berlin-Mitte", orgDom: "mueller-zahnarzt.de", orgSnippet: "Willkommen in der Müller Zahnarztpraxis. Termin online buchen – moderne Behandlung, zentrale Lage in Berlin.", hours: "Geöffnet", hoursSub: "· schließt 18:00", phaseSearch: "Sucht bei Google …", phaseType: "Eingabe …" },
    rev: [{ n: "Anonym", t: "Unfreundlich und überteuert. Nie wieder!" }, { n: "K. B.", t: "Stundenlang gewartet. Eine Katastrophe." }] },
  en: { eyebrow: "See it yourself", title: "This is how your profile disappears – for good.", sub: "Your business profile and all its reviews are removed from Google completely. No „closed“, no leftovers – simply gone.",
    closed: "Bad reviews", removed: "Profile removed", removedSub: "Completely gone from Google", chip: "All reviews deleted",
    phaseFull: "Live on Google", phaseDel: "Removing …", phaseDone: "Removed ✓", replay: "Watch again",
    name: "Müller Dental Practice", cat: "Dentist", addr: "Hauptstraße 24, 10178 Berlin", reviews: "47 reviews",
    actions: ["Directions", "Save", "Call", "Website"],
    g: { tabs: ["All", "Maps", "Images", "News", "Shopping"], results: "About 1,240 results (0.38 seconds)", orgTitle: "Müller Dental Practice – Your dentist in central Berlin", orgDom: "mueller-dental.com", orgSnippet: "Welcome to Müller Dental Practice. Book online – modern care, central location in Berlin.", hours: "Open", hoursSub: "· closes 6 PM", phaseSearch: "Searching Google …", phaseType: "Typing …" },
    rev: [{ n: "Anonymous", t: "Rude and overpriced. Never again!" }, { n: "K. B.", t: "Waited for hours. A disaster." }] },
  es: { eyebrow: "Véalo usted mismo", title: "Así desaparece su perfil – para siempre.", sub: "Su perfil de empresa y todas sus reseñas se eliminan por completo de Google. Sin „cerrado“, sin restos – simplemente desaparece.",
    closed: "Malas reseñas", removed: "Perfil eliminado", removedSub: "Desaparecido por completo de Google", chip: "Todas las reseñas borradas",
    phaseFull: "En vivo en Google", phaseDel: "Eliminando …", phaseDone: "Eliminado ✓", replay: "Ver de nuevo",
    name: "Clínica Dental Müller", cat: "Dentista", addr: "Hauptstraße 24, 10178 Berlín", reviews: "47 reseñas",
    actions: ["Ruta", "Guardar", "Llamar", "Web"],
    g: { tabs: ["Todo", "Maps", "Imágenes", "Noticias", "Shopping"], results: "Aproximadamente 1.240 resultados (0,38 segundos)", orgTitle: "Clínica Dental Müller – Su dentista en Berlín", orgDom: "mueller-dental.es", orgSnippet: "Bienvenido a la Clínica Dental Müller. Reserve cita online – atención moderna, ubicación céntrica.", hours: "Abierto", hoursSub: "· cierra 18:00", phaseSearch: "Buscando en Google …", phaseType: "Escribiendo …" },
    rev: [{ n: "Anónimo", t: "Antipáticos y caros. ¡Nunca más!" }, { n: "K. B.", t: "Horas de espera. Un desastre." }] },
  fr: { eyebrow: "Voyez par vous-même", title: "Voici comment votre fiche disparaît – définitivement.", sub: "Votre fiche d'établissement et tous ses avis sont entièrement retirés de Google. Pas de „fermé“, aucun reste – tout simplement disparu.",
    closed: "Mauvais avis", removed: "Fiche supprimée", removedSub: "Entièrement disparue de Google", chip: "Tous les avis supprimés",
    phaseFull: "En direct sur Google", phaseDel: "Suppression …", phaseDone: "Supprimée ✓", replay: "Revoir",
    name: "Cabinet Dentaire Müller", cat: "Dentiste", addr: "Hauptstraße 24, 10178 Berlin", reviews: "47 avis",
    actions: ["Itinéraire", "Enregistrer", "Appeler", "Site"],
    g: { tabs: ["Tous", "Maps", "Images", "Actus", "Shopping"], results: "Environ 1 240 résultats (0,38 seconde)", orgTitle: "Cabinet Dentaire Müller – Votre dentiste à Berlin", orgDom: "mueller-dental.fr", orgSnippet: "Bienvenue au Cabinet Dentaire Müller. Prenez rendez-vous en ligne – soins modernes, emplacement central.", hours: "Ouvert", hoursSub: "· ferme à 18:00", phaseSearch: "Recherche Google …", phaseType: "Saisie …" },
    rev: [{ n: "Anonyme", t: "Impoli et hors de prix. Plus jamais !" }, { n: "K. B.", t: "Des heures d'attente. Une catastrophe." }] },
  it: { eyebrow: "Lo veda lei stesso", title: "Ecco come sparisce il suo profilo – per sempre.", sub: "Il suo profilo aziendale e tutte le recensioni vengono rimossi completamente da Google. Niente „chiuso“, nessun residuo – semplicemente sparito.",
    closed: "Recensioni negative", removed: "Profilo rimosso", removedSub: "Sparito del tutto da Google", chip: "Tutte le recensioni eliminate",
    phaseFull: "Live su Google", phaseDel: "Rimozione …", phaseDone: "Rimosso ✓", replay: "Guarda di nuovo",
    name: "Studio Dentistico Müller", cat: "Dentista", addr: "Hauptstraße 24, 10178 Berlino", reviews: "47 recensioni",
    actions: ["Indicazioni", "Salva", "Chiama", "Sito"],
    g: { tabs: ["Tutto", "Maps", "Immagini", "News", "Shopping"], results: "Circa 1.240 risultati (0,38 secondi)", orgTitle: "Studio Dentistico Müller – Il tuo dentista a Berlino", orgDom: "mueller-dental.it", orgSnippet: "Benvenuto allo Studio Dentistico Müller. Prenota online – cure moderne, posizione centrale.", hours: "Aperto", hoursSub: "· chiude alle 18:00", phaseSearch: "Ricerca su Google …", phaseType: "Digitazione …" },
    rev: [{ n: "Anonimo", t: "Scortesi e troppo cari. Mai più!" }, { n: "K. B.", t: "Ore di attesa. Un disastro." }] },
  nl: { eyebrow: "Zie het zelf", title: "Zo verdwijnt uw profiel – voorgoed.", sub: "Uw bedrijfsprofiel en alle reviews worden volledig van Google verwijderd. Geen „gesloten“, geen resten – gewoon weg.",
    closed: "Slechte reviews", removed: "Profiel verwijderd", removedSub: "Volledig weg van Google", chip: "Alle reviews verwijderd",
    phaseFull: "Live op Google", phaseDel: "Verwijderen …", phaseDone: "Verwijderd ✓", replay: "Opnieuw bekijken",
    name: "Tandartspraktijk Müller", cat: "Tandarts", addr: "Hauptstraße 24, 10178 Berlijn", reviews: "47 reviews",
    actions: ["Route", "Opslaan", "Bellen", "Website"],
    g: { tabs: ["Alles", "Maps", "Afbeeldingen", "Nieuws", "Shopping"], results: "Ongeveer 1.240 resultaten (0,38 seconden)", orgTitle: "Tandartspraktijk Müller – Uw tandarts in Berlijn", orgDom: "mueller-dental.nl", orgSnippet: "Welkom bij Tandartspraktijk Müller. Maak online een afspraak – moderne zorg, centrale ligging.", hours: "Geopend", hoursSub: "· sluit om 18:00", phaseSearch: "Zoeken op Google …", phaseType: "Typen …" },
    rev: [{ n: "Anoniem", t: "Onvriendelijk en te duur. Nooit meer!" }, { n: "K. B.", t: "Urenlang gewacht. Een ramp." }] },
  pt: { eyebrow: "Veja você mesmo", title: "É assim que o seu perfil desaparece – para sempre.", sub: "O seu perfil de empresa e todas as avaliações são removidos por completo do Google. Sem „fechado“, sem restos – simplesmente desaparece.",
    closed: "Más avaliações", removed: "Perfil removido", removedSub: "Totalmente fora do Google", chip: "Todas as avaliações eliminadas",
    phaseFull: "Ativo no Google", phaseDel: "A remover …", phaseDone: "Removido ✓", replay: "Ver novamente",
    name: "Clínica Dentária Müller", cat: "Dentista", addr: "Hauptstraße 24, 10178 Berlim", reviews: "47 avaliações",
    actions: ["Rota", "Guardar", "Ligar", "Site"],
    g: { tabs: ["Tudo", "Maps", "Imagens", "Notícias", "Shopping"], results: "Cerca de 1.240 resultados (0,38 segundos)", orgTitle: "Clínica Dentária Müller – O seu dentista em Berlim", orgDom: "mueller-dental.pt", orgSnippet: "Bem-vindo à Clínica Dentária Müller. Marque online – cuidados modernos, localização central.", hours: "Aberto", hoursSub: "· fecha às 18:00", phaseSearch: "A pesquisar no Google …", phaseType: "A escrever …" },
    rev: [{ n: "Anónimo", t: "Mal-educados e caros. Nunca mais!" }, { n: "K. B.", t: "Horas à espera. Um desastre." }] },
};

Object.assign(DEMO_COPY, {
  ja: { eyebrow: "ご自分の目で", title: "こうしてプロフィールは消えます ― 永久に。", sub: "あなたのビジネスプロフィールはすべての口コミとともにGoogleから完全に削除されます。「閉業」でも残りカスでもなく ― ただ消えます。",
    closed: "悪い口コミ", removed: "プロフィール削除", removedSub: "Googleから完全に消滅", chip: "すべての口コミを削除",
    phaseFull: "Googleで公開中", phaseDel: "削除中 …", phaseDone: "削除済み ✓", replay: "もう一度見る",
    name: "ミュラー歯科医院", cat: "歯科", addr: "Hauptstraße 24, 10178 ベルリン", reviews: "47 件のレビュー",
    actions: ["ルート", "保存", "電話", "ウェブサイト"],
    g: { tabs: ["すべて", "地図", "画像", "ニュース", "ショッピング"], results: "約 1,240 件（0.38 秒）", orgTitle: "ミュラー歯科医院 ― ベルリンのあなたの歯科医院", orgDom: "mueller-zahnarzt.de", orgSnippet: "ミュラー歯科医院へようこそ。オンライン予約 ― 最新の治療、ベルリン中心部の好立地。", hours: "営業中", hoursSub: "· 18:00 に閉店", phaseSearch: "Googleで検索中 …", phaseType: "入力中 …" },
    rev: [{ n: "匿名", t: "無愛想で高すぎる。二度と行かない！" }, { n: "K. B.", t: "何時間も待たされた。最悪。" }] },
  sv: { eyebrow: "Se det själv", title: "Så här försvinner din profil – för gott.", sub: "Din företagsprofil och alla omdömen tas bort helt från Google. Inget «stängt», inga rester – bara borta.",
    closed: "Dåliga omdömen", removed: "Profil borttagen", removedSub: "Helt borta från Google", chip: "Alla omdömen raderade",
    phaseFull: "Live på Google", phaseDel: "Tar bort …", phaseDone: "Borttagen ✓", replay: "Se igen",
    name: "Müller Tandvård", cat: "Tandläkare", addr: "Hauptstraße 24, 10178 Berlin", reviews: "47 omdömen",
    actions: ["Vägbeskrivning", "Spara", "Ring", "Webbplats"],
    g: { tabs: ["Alla", "Maps", "Bilder", "Nyheter", "Shopping"], results: "Ungefär 1 240 resultat (0,38 sekunder)", orgTitle: "Müller Tandvård – din tandläkare i Berlin", orgDom: "mueller-dental.se", orgSnippet: "Välkommen till Müller Tandvård. Boka online – modern vård, centralt läge i Berlin.", hours: "Öppet", hoursSub: "· stänger 18:00", phaseSearch: "Söker på Google …", phaseType: "Skriver …" },
    rev: [{ n: "Anonym", t: "Otrevligt och överprisat. Aldrig mer!" }, { n: "K. B.", t: "Väntade i timmar. En katastrof." }] },
  da: { eyebrow: "Se det selv", title: "Sådan forsvinder din profil – for altid.", sub: "Din virksomhedsprofil og alle anmeldelser fjernes helt fra Google. Intet «lukket», ingen rester – bare væk.",
    closed: "Dårlige anmeldelser", removed: "Profil fjernet", removedSub: "Helt væk fra Google", chip: "Alle anmeldelser slettet",
    phaseFull: "Live på Google", phaseDel: "Fjerner …", phaseDone: "Fjernet ✓", replay: "Se igen",
    name: "Müller Tandlæge", cat: "Tandlæge", addr: "Hauptstraße 24, 10178 Berlin", reviews: "47 anmeldelser",
    actions: ["Rute", "Gem", "Ring", "Websted"],
    g: { tabs: ["Alle", "Maps", "Billeder", "Nyheder", "Shopping"], results: "Cirka 1.240 resultater (0,38 sekunder)", orgTitle: "Müller Tandlæge – din tandlæge i Berlin", orgDom: "mueller-dental.dk", orgSnippet: "Velkommen hos Müller Tandlæge. Book online – moderne behandling, central beliggenhed i Berlin.", hours: "Åbent", hoursSub: "· lukker 18:00", phaseSearch: "Søger på Google …", phaseType: "Skriver …" },
    rev: [{ n: "Anonym", t: "Uvenligt og overpris. Aldrig igen!" }, { n: "K. B.", t: "Ventede i timevis. En katastrofe." }] },
  no: { eyebrow: "Se det selv", title: "Slik forsvinner profilen din – for godt.", sub: "Bedriftsprofilen din og alle omtaler fjernes helt fra Google. Ingen «stengt», ingen rester – bare borte.",
    closed: "Dårlige omtaler", removed: "Profil fjernet", removedSub: "Helt borte fra Google", chip: "Alle omtaler slettet",
    phaseFull: "Live på Google", phaseDel: "Fjerner …", phaseDone: "Fjernet ✓", replay: "Se igjen",
    name: "Müller Tannlege", cat: "Tannlege", addr: "Hauptstraße 24, 10178 Berlin", reviews: "47 omtaler",
    actions: ["Rute", "Lagre", "Ring", "Nettsted"],
    g: { tabs: ["Alle", "Maps", "Bilder", "Nyheter", "Shopping"], results: "Omtrent 1 240 resultater (0,38 sekunder)", orgTitle: "Müller Tannlege – tannlegen din i Berlin", orgDom: "mueller-dental.no", orgSnippet: "Velkommen til Müller Tannlege. Bestill time online – moderne behandling, sentral beliggenhet i Berlin.", hours: "Åpent", hoursSub: "· stenger 18:00", phaseSearch: "Søker på Google …", phaseType: "Skriver …" },
    rev: [{ n: "Anonym", t: "Uvennlig og overpriset. Aldri igjen!" }, { n: "K. B.", t: "Ventet i timevis. En katastrofe." }] },
});

const RedStar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#e23b3b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);
const GreyStar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#d6cec6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
);

const GIcon = {
  search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  mic: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="#4285F4" /><path d="M19 11a7 7 0 0 1-14 0" stroke="#34A853" strokeWidth="2" strokeLinecap="round" /><path d="M12 18v3" stroke="#FBBC05" strokeWidth="2" strokeLinecap="round" /></svg>,
};

function ProfileDissolveDemo() {
  const { t } = useLang();
  const c = DEMO_COPY[t.code] || DEMO_COPY.en;
  const g = c.g || DEMO_COPY.en.g;
  const query = c.name;
  const [phase, setPhase] = React.useState("search"); // search | results | deleting | removed
  const [typedN, setTypedN] = React.useState(0);
  const stageRef = React.useRef(null);
  const timers = React.useRef([]);
  const typer = React.useRef(null);
  const inView = React.useRef(false);

  const clearAll = () => {
    timers.current.forEach((id) => clearTimeout(id)); timers.current = [];
    if (typer.current) { clearInterval(typer.current); typer.current = null; }
  };

  const runCycle = React.useCallback(() => {
    clearAll();
    setPhase("search");
    setTypedN(0);
    const charMs = 80;
    let i = 0;
    typer.current = setInterval(() => {
      i++; setTypedN(i);
      if (i >= query.length) { clearInterval(typer.current); typer.current = null; }
    }, charMs);
    const typeDone = query.length * charMs;
    timers.current.push(setTimeout(() => setPhase("results"), typeDone + 600));
    timers.current.push(setTimeout(() => setPhase("deleting"), typeDone + 2700));
    timers.current.push(setTimeout(() => setPhase("removed"), typeDone + 4250));
    timers.current.push(setTimeout(() => { if (inView.current) runCycle(); }, typeDone + 8200));
  }, [query]);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let started = false;
    const begin = () => { if (!started) { started = true; runCycle(); } };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting) begin();
      });
    }, { threshold: 0.35 });
    io.observe(el);
    // Fallback: if IO never reports intersection (some embeds), start anyway.
    const fb = setTimeout(() => { inView.current = true; begin(); }, 1400);
    return () => { io.disconnect(); clearTimeout(fb); clearAll(); };
    // eslint-disable-next-line
  }, []);

  const replay = () => { inView.current = true; runCycle(); };

  const particles = React.useMemo(() => Array.from({ length: 16 }).map((_, i) => ({
    left: 6 + (i * 5.8) % 88 + "%",
    top: 14 + ((i * 37) % 56) + "%",
    dx: (((i * 53) % 100) - 50) + "px",
    dr: (((i * 71) % 120) - 60) + "deg",
    delay: (i % 8) * 0.05 + "s",
    size: 5 + (i % 3) * 2,
  })), []);

  const typed = query.slice(0, typedN);
  const phaseLabel = phase === "search" ? (typedN < query.length ? g.phaseType : g.phaseSearch)
    : phase === "deleting" ? c.phaseDel : phase === "removed" ? c.phaseDone : c.phaseFull;
  const phaseCls = phase === "deleting" ? "del" : phase === "removed" ? "done" : "";

  const KP = (
    <div className="kpanel">
      <div className="kp-photos">
        <div className="big"></div>
        <div className="col"><i></i><i></i></div>
        <div className="kp-badge"><Icon.alert size={13} /> {c.closed}</div>
      </div>
      <div className="kp-body">
        <div className="kp-name">{c.name}</div>
        <div className="kp-sub">
          <span className="kp-rate-num">2,4</span>
          <span className="kp-stars"><RedStar size={15} /><RedStar size={15} /><GreyStar size={15} /><GreyStar size={15} /><GreyStar size={15} /></span>
          <span className="kp-revs">{c.reviews}</span>
          <span className="kp-cat">{c.cat}</span>
        </div>
        <div className="kp-actions">
          {[Icon.mapPin, Icon.globe, Icon.phone, Icon.star].map((I, i) => (
            <div className="kp-act" key={i}><span className="ic"><I size={18} /></span>{c.actions[[0, 3, 2, 1][i]]}</div>
          ))}
        </div>
        <div className="kp-info">
          <div className="kp-line"><Icon.mapPin /> <span>{c.addr}</span></div>
          <div className="kp-line"><Icon.clock /> <span><span className="open">{g.hours}</span> {g.hoursSub}</span></div>
          <div className="kp-line"><Icon.star /> <span>{c.rev[0].t}</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="band">
      <div className="container">
        <div className="demo-split">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.trash size={15} /> {c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.sub}</p>
        </div>

        <div className="demo-main">
        <div className={"demo-stage is-" + phase} ref={stageRef}>
          <div className="serp">
            <div className="serp-bar">
              <div className="g-logo"><b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b></div>
              <div className="g-search">
                <GIcon.search className="g-ic" style={{ width: 20, height: 20 }} />
                <span className="gq">{typed || (phase === "search" && typedN === 0 ? <span className="ph">{query}</span> : query)}{phase === "search" && <span className="caret"></span>}</span>
                <GIcon.mic className="g-mic" style={{ width: 18, height: 18 }} />
              </div>
            </div>
            <div className="serp-tabs">
              {g.tabs.map((tb, i) => <span className={"tb" + (i === 0 ? " on" : "")} key={i}>{tb}</span>)}
            </div>

            {phase === "search" ? (
              <div className="serp-pending">
                {g.phaseSearch}
                <div className="sp-dots"><span></span><span></span><span></span></div>
              </div>
            ) : (
              <div className="serp-body">
                <div className="serp-main">
                  <div className="serp-stats">{g.results}</div>
                  <div className="org">
                    <div className="o-url">
                      <span className="o-fav"><Icon.globe size={14} /></span>
                      <span className="o-site">{c.name}<br /><span className="dom">https://{g.orgDom}</span></span>
                    </div>
                    <h3>{g.orgTitle}</h3>
                    <p>{g.orgSnippet}</p>
                  </div>
                  <div className="org">
                    <div className="o-url">
                      <span className="o-fav"><Icon.mapPin size={14} /></span>
                      <span className="o-site">Google Maps<br /><span className="dom">google.com › maps</span></span>
                    </div>
                    <h3>{c.name} · {c.cat}</h3>
                    <p>2,4 ★ · {c.reviews} · {c.addr}</p>
                  </div>
                </div>

                <div className="serp-right">
                  {KP}
                  <div className="demo-sweep"></div>
                  <div className="demo-particles">
                    {particles.map((p, i) => (
                      <i key={i} style={{ left: p.left, top: p.top, width: p.size, height: p.size, "--dx": p.dx, "--dr": p.dr, animationDelay: p.delay }}></i>
                    ))}
                  </div>
                  <div className="demo-success">
                    <div className="ds-ring"><div className="ds-core"><Icon.check /></div></div>
                    <div className="ds-title">{c.removed}</div>
                    <div className="ds-sub">{c.removedSub}</div>
                    <div className="ds-chip"><Icon.check /> {c.chip}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="demo-controls">
          <span className={"demo-phaselabel " + phaseCls}>{phaseLabel}</span>
          <button className="demo-replay" onClick={replay}><Icon.refresh /> {c.replay}</button>
        </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export { ProfileDissolveDemo };
