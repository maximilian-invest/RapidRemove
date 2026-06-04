"use client";
/* RapidRemove — flagship magazine article (detail page).
   "Google-Unternehmensprofil löschen – wie geht das?" — SEO-first, German. */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat } from "@/components/Chrome";
import { LangContext } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { FAQ, ARTICLE_META } from "@/lib/article-google-profil";

const SECTIONS = [
  { id: "ueberblick", label: "Das Wichtigste in Kürze" },
  { id: "selbst-loeschen", label: "Kann man das Profil selbst löschen?" },
  { id: "geschlossen", label: "„Geschlossen“ ist keine Löschung" },
  { id: "optionen", label: "Welche Optionen Sie haben" },
  { id: "anleitung", label: "Anleitung: Schritt für Schritt" },
  { id: "bewertungen", label: "Einzelne Bewertungen vs. Profil" },
  { id: "legal", label: "Ist das legal?" },
  { id: "dauer-kosten", label: "Dauer & Kosten" },
  { id: "ablauf", label: "So läuft es mit RapidRemove" },
  { id: "faq", label: "Häufige Fragen" },
  { id: "fazit", label: "Fazit" },
];

function ArticleBody() {
  const [progress, setProgress] = React.useState(0);
  const [active, setActive] = React.useState(SECTIONS[0].id);
  const [openFaq, setOpenFaq] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const top = window.scrollY || doc.scrollTop;
      const h = doc.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (top / h) * 100) : 0);
      let cur = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 130) cur = s.id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };
  const startCheck = (e) => { if (e) e.preventDefault(); window.location.href = asset("/?start=1"); };

  return (
    <React.Fragment>
      <div className="art-progress"><div className="bar" style={{ width: progress + "%" }} /></div>

      {/* HERO */}
      <header className="art-hero">
        <div className="hero-glow" />
        <div className="container">
          <nav className="art-breadcrumb" aria-label="Breadcrumb">
            <a href={asset("/")}>Start</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <a href={asset("/?view=magazin")}>Magazin</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <span>Google-Unternehmensprofil löschen</span>
          </nav>
          <span className="art-cat"><Icon.ban size={14} /> {ARTICLE_META.category}</span>
          <h1>{ARTICLE_META.h1}</h1>
          <p className="art-dek">{ARTICLE_META.description}</p>
          <div className="art-meta">
            <img className="am-ava" src={asset(ARTICLE_META.authorImage)} alt={ARTICLE_META.author} style={{ objectFit: "cover" }} />
            <span className="am-author">{ARTICLE_META.author}</span>
            <span className="am-dot" />
            <span><Icon.clock />{ARTICLE_META.readingMin} Min. Lesezeit</span>
            <span className="am-dot" />
            <span>Aktualisiert: Juni 2026</span>
          </div>
        </div>
      </header>

      {/* BODY + TOC */}
      <div className="container art-layout">
        <article className="prose">
          {/* Key takeaways */}
          <div className="art-keypoints">
            <h2 id="ueberblick"><Icon.zap size={20} /> Das Wichtigste in Kürze</h2>
            <ul>
              <li><strong>Selbst löschen geht kaum:</strong> Google bietet keinen echten „Profil löschen“-Knopf – nur den Status „dauerhaft geschlossen“.</li>
              <li><strong>„Geschlossen“ ≠ gelöscht:</strong> Eintrag, Name, Adresse und <strong>alle Bewertungen bleiben öffentlich sichtbar.</strong></li>
              <li><strong>Der einzige verlässliche Weg</strong> ist die vollständige Entfernung des Profils über die offiziellen Verfahren – legal und dauerhaft.</li>
              <li><strong>RapidRemove</strong> entfernt das Profil samt aller Bewertungen in <strong>~24 Stunden</strong> – <strong>Zahlung erst nach Erfolg</strong>.</li>
            </ul>
          </div>

          <p className="lead-p">
            Sie googeln Ihr Unternehmen – und sehen ein Profil, das Sie so nicht mehr wollen: voller alter
            Fake- oder Rachebewertungen, mit falschen Daten, oder schlicht ein Eintrag, aus dem Sie endgültig
            raus möchten. Die naheliegende Frage: <strong>Wie kann ich mein Google-Unternehmensprofil löschen?</strong>{" "}
            Die ehrliche Antwort ist leider komplizierter, als Google es Sie glauben lässt. Dieser Leitfaden zeigt
            Ihnen, was wirklich funktioniert – Schritt für Schritt, ohne Marketing-Geschwafel.
          </p>

          <h2 id="selbst-loeschen">Kann man ein Google-Unternehmensprofil selbst löschen?</h2>
          <p>
            Kurz gesagt: <strong>nicht so, wie Sie es erwarten würden.</strong> Google trennt streng zwischen Ihrem
            persönlichen Google-Konto und dem öffentlichen Unternehmensprofil (früher „Google My Business“, heute
            „Google Unternehmensprofil“). Sie können die Inhaberschaft beantragen und einige Daten bearbeiten – einen
            klaren Knopf „Diesen Eintrag und alle Bewertungen endgültig entfernen“ gibt es für Unternehmer aber
            schlicht nicht.
          </p>
          <p>
            Das ist kein Versehen, sondern Absicht: Das Profil mit seinen Bewertungen ist Teil der Google-Suche und
            von Google Maps. Google betrachtet diese Informationen als nützlich für Nutzer – und gibt die Kontrolle
            darüber nur ungern aus der Hand. Genau deshalb stoßen die meisten Unternehmer beim Versuch, ihr Profil
            selbst zu löschen, schnell an eine Wand.
          </p>

          <h2 id="geschlossen">„Dauerhaft geschlossen“ ist <em>keine</em> Löschung</h2>
          <p>
            Die Option, die Google Ihnen anbietet, heißt „Als dauerhaft geschlossen markieren“. Viele halten das für
            eine Löschung – ist es aber nicht. Es ist nur ein <strong>Status-Label</strong>.
          </p>
          <div className="callout warn">
            <Icon.alert />
            <div className="co-body">
              <b>Das passiert bei „geschlossen“ wirklich</b>
              Ihr Profil bleibt in Google-Suche und Google Maps sichtbar – inklusive Name, Adresse, Fotos und
              <strong> sämtlicher Bewertungen</strong>. Darüber prangt lediglich ein durchgestrichenes „Dauerhaft
              geschlossen“. Für potenzielle Kunden sieht das oft <em>schlechter</em> aus als vorher.
            </div>
          </div>
          <p>
            Mit anderen Worten: Wer „schließt“, wird den Eintrag und die Bewertungen nicht los – er macht das Problem
            unter Umständen sogar sichtbarer. Eine <strong>echte Löschung</strong> dagegen entfernt den kompletten
            Eintrag samt aller Bewertungen aus der Anzeige.
          </p>

          <h2 id="optionen">Welche Optionen Sie wirklich haben</h2>
          <p>Realistisch gibt es drei Wege, ein unerwünschtes Profil loszuwerden – mit sehr unterschiedlichem Ergebnis:</p>
          <div className="art-table-wrap">
            <table className="art-table">
              <thead>
                <tr>
                  <th>Kriterium</th>
                  <th>Selbst (DIY)</th>
                  <th>Anwalt</th>
                  <th className="rr">RapidRemove</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Vollständige Löschung möglich?</td><td className="no">Praktisch nein</td><td>Unsicher</td><td className="rr ok">Ja</td></tr>
                <tr><td>Dauer</td><td>—</td><td>3–9 Monate</td><td className="rr">~24 Stunden</td></tr>
                <tr><td>Kosten</td><td>—</td><td>300 €+ / Stunde</td><td className="rr">Fixpreis ab 450 €</td></tr>
                <tr><td>Alle Bewertungen weg</td><td className="no">Nein</td><td>Einzeln, mühsam</td><td className="rr ok">Alle auf einmal</td></tr>
                <tr><td>Erfolg</td><td className="no">Nein</td><td>Ungewiss</td><td className="rr ok">Garantiert (No Cure, No Pay)</td></tr>
                <tr><td>Ihr Aufwand</td><td>Hoch</td><td>Hoch</td><td className="rr">Praktisch null</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Der DIY-Weg endet fast immer bei „dauerhaft geschlossen“. Der Anwaltsweg ist teuer, langsam und ungewiss –
            und löst nicht selten den <a href={asset("/?view=magazin")}>Streisand-Effekt</a> aus, bei dem die
            Aufmerksamkeit erst recht steigt. Bleibt der dritte Weg: die professionelle, vollständige Entfernung.
          </p>

          <h2 id="anleitung">Anleitung: Profil über Google selbst bearbeiten</h2>
          <p>
            Wenn Sie es zuerst selbst versuchen möchten, hier der reale Ablauf. Rechnen Sie damit, dass das Ergebnis
            bestenfalls „geschlossen“ ist – nicht „gelöscht“.
          </p>
          <div className="art-steps">
            {[
              ["Inhaberschaft beanspruchen", "Suchen Sie Ihr Unternehmen bei Google und wählen Sie „Sind Sie Inhaber dieses Unternehmens?“. Google verlangt eine Verifizierung (Postkarte, Telefon, E-Mail oder Video) – das kann Tage bis Wochen dauern."],
              ["Im Unternehmensprofil anmelden", "Verwalten Sie das Profil anschließend direkt aus der Google-Suche heraus (über „Ihr Unternehmensprofil“), wenn die Inhaberschaft bestätigt ist."],
              ["„Profil entfernen“ suchen", "Unter den Einstellungen finden Sie Optionen wie „Unternehmen als dauerhaft geschlossen markieren“ oder „Profil entfernen“. Letzteres entfernt nur die Verwaltungs-Verknüpfung, nicht den öffentlichen Eintrag."],
              ["Das Ergebnis prüfen", "Sehen Sie selbst nach: In der Regel bleibt der Eintrag mit allen Bewertungen sichtbar – jetzt mit dem Label „Dauerhaft geschlossen“. Das eigentliche Problem ist damit nicht gelöst."],
            ].map(([t, d], i) => (
              <div className="art-step" key={i}>
                <div className="sn">{i + 1}</div>
                <div className="st"><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>
          <div className="callout info">
            <Icon.info />
            <div className="co-body">
              <b>Wichtig zu wissen</b>
              Ohne bestätigte Inhaberschaft können Sie kaum etwas ändern. Und selbst mit Inhaberschaft ist die
              vollständige Entfernung des öffentlichen Eintrags über das Standard-Interface nicht vorgesehen.
            </div>
          </div>

          <div className="art-cta">
            <div className="seal" />
            <h3>Lieber direkt prüfen, ob Ihr Profil löschbar ist?</h3>
            <p>Geben Sie Ihren Firmennamen ein – wir finden Ihr echtes Google-Profil und prüfen in Sekunden, ob und wie schnell es entfernt werden kann. Unverbindlich und kostenlos.</p>
            <a className="btn btn-white lg" href={asset("/?start=1")} onClick={startCheck}><Icon.search size={18} /> Gratis-Check starten <Icon.arrowRight size={17} /></a>
            <div className="cta-trust"><Icon.shieldCheck /> Zahlung nur nach erfolgreicher Löschung</div>
          </div>

          <h2 id="bewertungen">Einzelne Bewertungen löschen oder das ganze Profil entfernen?</h2>
          <p>
            Viele starten mit dem Versuch, einzelne schlechte Bewertungen über Google zu <strong>melden</strong>. Das ist
            mühsam und ungewiss: Google lehnt Meldungen häufig ab, jede Bewertung muss einzeln begründet werden – und
            für jede entfernte Bewertung tauchen schnell neue auf. Sie kämpfen gegen Symptome.
          </p>
          <p>
            Der nachhaltige Ansatz setzt an der Wurzel an: <strong>Wird das gesamte Profil entfernt, verschwinden alle
            Bewertungen auf einen Schlag</strong> – Fake-Bewertungen inklusive. Endgültig statt Stückwerk. Genau deshalb
            löschen wir bewusst keine Einzelbewertungen, sondern das komplette Profil.
          </p>
          <div className="callout tip">
            <Icon.checkCircle />
            <div className="co-body">
              <b>Der entscheidende Vorteil</b>
              Ein entferntes Profil kann keine alten <em>und</em> keine neuen Bewertungen mehr anzeigen. Das Problem ist
              damit nicht verschoben, sondern beseitigt.
            </div>
          </div>

          <h2 id="legal">Ist das Löschen legal?</h2>
          <p>
            Ja. Eine professionelle Entfernung arbeitet ausschließlich über die <strong>offiziellen, von Google
            vorgesehenen Verfahren</strong> und wurde juristisch geprüft. Es wird nichts gehackt, nichts umgangen und
            kein unbefugter Zugang verschafft. Ihr Google-Konto, Gmail und etwaige Google-Ads-Konten bleiben dabei
            vollständig unberührt – ebenso Ihre Website, Ihr organisches Ranking und Ihre Kampagnen.
          </p>
          <p>
            Seriös erkennen Sie einen Anbieter daran, dass er eine echte Firma mit Adresse und UID nennt, transparent
            über die Methode spricht und <strong>erst nach Erfolg abrechnet</strong> – nicht an vagen Versprechen von
            „Geheim-Zugängen zu Google“.
          </p>

          <h2 id="dauer-kosten">Wie lange dauert es – und was kostet es?</h2>
          <p>
            Eine professionelle Löschung ist in der Regel <strong>innerhalb von rund 24 Stunden</strong> erledigt – statt
            der Monate, die der Anwaltsweg verschlingt. Bei den Kosten gilt: Ein Anwalt rechnet im Stundentakt (oft
            300 € und mehr) ohne Erfolgsgarantie. RapidRemove arbeitet mit einem <strong>transparenten Fixpreis ab
            450 €</strong> – und Sie zahlen <strong>ausschließlich nach erfolgreicher Löschung</strong>.
          </p>
          <p>
            Klingt der Preis hoch? Rechnen Sie gegen: Eine einzige sichtbare Fake-Bewertung kann die Klickrate deutlich
            senken und kostet Sie über Monate ein Vielfaches. Mehr Details finden Sie auf unserer{" "}
            <a href={asset("/#pricing")}>Preis-Übersicht</a>.
          </p>

          <h2 id="ablauf">So läuft die Löschung mit RapidRemove ab</h2>
          <p>Drei Schritte, transparent geführt – Sie tun fast nichts:</p>
          <div className="art-steps">
            {[
              ["Gratis-Check", "Firmennamen eingeben. Wir finden Ihr Profil und prüfen sofort, ob die Löschung möglich ist – unverbindlich und kostenlos."],
              ["Bestätigen & freigeben", "Sie bestätigen das richtige Profil und erteilen die Bearbeitungsfreigabe. Kein Zugriff auf Gmail, Ads oder persönliche Daten."],
              ["Löschung in ~24 Stunden", "Unser Team entfernt das Profil samt aller Bewertungen – dauerhaft. Bezahlt wird erst danach."],
            ].map(([t, d], i) => (
              <div className="art-step" key={i}>
                <div className="sn">{i + 1}</div>
                <div className="st"><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>

          <h2 id="faq">Häufige Fragen zum Löschen des Google-Unternehmensprofils</h2>
          <div className="art-faq">
            {FAQ.map((f, i) => (
              <div className={"faq-row" + (openFaq === i ? " open" : "")} key={i}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q} <Icon.chevronDown />
                </button>
                <div className="faq-a"><div className="faq-a-inner"><p>{f.a}</p></div></div>
              </div>
            ))}
          </div>

          <h2 id="fazit">Fazit: der schnellste, sicherste Weg zum sauberen Suchergebnis</h2>
          <p>
            Ein Google-Unternehmensprofil selbst zu löschen, scheitert in der Praxis fast immer an Googles eigenem
            System – „dauerhaft geschlossen“ löst das Problem nicht. Der verlässliche Weg ist die vollständige,
            legale Entfernung des kompletten Profils samt aller Bewertungen. Schnell, dauerhaft, planbar –
            und mit Zahlung erst nach Erfolg ohne jedes Risiko.
          </p>

          <div className="art-cta">
            <div className="seal" />
            <h3>Prüfen Sie jetzt kostenlos, ob Ihr Profil löschbar ist</h3>
            <p>In wenigen Sekunden sehen Sie Ihr echtes Profil und erfahren, ob und wie schnell wir es entfernen können. Keine Vorkasse, keine Verpflichtung.</p>
            <a className="btn btn-white lg" href={asset("/?start=1")} onClick={startCheck}><Icon.search size={18} /> Gratis-Check starten <Icon.arrowRight size={17} /></a>
            <div className="cta-trust"><Icon.shieldCheck /> Null Risiko · Zahlung nur nach erfolgreicher Löschung</div>
          </div>

          <div className="art-updated"><Icon.checkCircle /> Zuletzt aktualisiert: Juni 2026 · juristisch geprüft</div>

          <div className="art-author">
            <img className="aa-ava" src={asset(ARTICLE_META.authorImage)} alt={ARTICLE_META.author} style={{ objectFit: "cover" }} />
            <div>
              <div className="aa-name">{ARTICLE_META.author}</div>
              <div className="aa-role">{ARTICLE_META.authorRole}</div>
            </div>
          </div>

          <div className="art-back">
            <a className="btn btn-secondary" href={asset("/?view=magazin")}><Icon.arrowLeft size={17} /> Zurück zum Magazin</a>
          </div>
        </article>

        {/* Sticky TOC */}
        <aside className="art-toc">
          <div className="toc-title">Inhalt</div>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={"#" + s.id} className={active === s.id ? "on" : ""} onClick={goTo(s.id)}>{s.label}</a>
              </li>
            ))}
          </ul>
          <div className="toc-cta">
            <a className="btn btn-primary sm" href={asset("/?start=1")} onClick={startCheck}><Icon.search size={16} /> Gratis-Check</a>
          </div>
        </aside>
      </div>
    </React.Fragment>
  );
}

export default function Article() {
  const [lang, setLangState] = React.useState("de");
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    window.location.href = asset(localePath(l));
  };
  const t = I18N[lang] || I18N.de;
  const nav = (path) => { window.location.href = asset(path); };
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={() => nav("/ueber-uns/")} active="magazin" />
      <ArticleBody />
      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={() => nav("/ueber-uns/")} />
      <WhatsAppFloat />
    </LangContext.Provider>
  );
}
