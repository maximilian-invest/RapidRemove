"use client";
/* RapidRemove — flagship magazine article (detail page).
   "Google-Unternehmensprofil löschen – wie geht das?" — SEO-first, German. */
import React from "react";
import "@/styles/article.css";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat } from "@/components/Chrome";
import { LangContext } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { FAQ, ARTICLE_META } from "@/lib/article-google-profil";
import { CLUSTER_CARDS } from "@/lib/articles/registry";
import { authorFor, authorPath, roleFor } from "@/lib/authors";
import { mountIngestionAnim } from "@/lib/ingestion-anim";

// Hub-Artikel: deterministisch zugeordneter Autor (gleicher Schlüssel wie überall).
const HUB_AUTHOR = authorFor("google-unternehmensprofil-loeschen");

// Animation zur Entstehung eines Profils (dieselbe wie im Wizard bei „ohne Schutz").
function ArticleIngestAnim() {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) return mountIngestionAnim(ref.current, { lang: "de" }); }, []);
  return (
    <figure style={{ margin: "28px 0" }}>
      <div ref={ref} className="pt-ingest" />
      <figcaption style={{ textAlign: "center", fontSize: 14, color: "var(--fg-muted)", marginTop: 12 }}>Drei Wege, wie ein Unternehmensprofil entsteht – meist ganz ohne Zutun des Inhabers.</figcaption>
    </figure>
  );
}

const SECTIONS = [
  { id: "ueberblick", label: "Das Wichtigste in Kürze" },
  { id: "selbst-loeschen", label: "Kein „Löschen“-Knopf" },
  { id: "anleitung", label: "Googles offizielle Schritte" },
  { id: "optionen", label: "Alle Optionen im Vergleich" },
  { id: "was-passiert", label: "Was passiert nach dem Löschen?" },
  { id: "neu-anfangen", label: "Löschen und neu anfangen" },
  { id: "maps", label: "Aus Google Maps entfernen" },
  { id: "keine-option", label: "Keine Löschen-Option?" },
  { id: "wege", label: "Selbst, Anwalt oder Profi" },
  { id: "bewertungen", label: "Einzelne Bewertungen vs. Profil" },
  { id: "legal", label: "Ist das legal?" },
  { id: "dauer-kosten", label: "Dauer & Kosten" },
  { id: "ablauf", label: "So läuft es mit RapidRemove" },
  { id: "herkunft", label: "Wer hat das Profil angelegt?" },
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
            <a href={asset("/magazin/")}>Magazin</a><Icon.chevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
            <span>Google-Unternehmensprofil löschen</span>
          </nav>
          <span className="art-cat"><Icon.ban size={14} /> {ARTICLE_META.category}</span>
          <h1>{ARTICLE_META.h1}</h1>
          <p className="art-dek">{ARTICLE_META.description}</p>
          <div className="art-meta">
            <img className="am-ava" src={asset(HUB_AUTHOR.image)} alt={HUB_AUTHOR.name} style={{ objectFit: "cover" }} />
            <a className="am-author" href={asset(authorPath(HUB_AUTHOR))} style={{ color: "inherit", textDecoration: "none" }}>{HUB_AUTHOR.name}</a>
            <span className="am-dot" />
            <span><Icon.clock />{ARTICLE_META.readingMin} Min. Lesezeit</span>
            <span className="am-dot" />
            <span>Aktualisiert: Oktober 2026</span>
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
              <li><strong>Selbst löschen geht kaum:</strong> Google bietet keinen echten „Profil löschen“-Knopf. „Unternehmensprofil entfernen“ nimmt das Profil nur aus Ihrem Konto, „dauerhaft geschlossen“ ist nur ein Status.</li>
              <li><strong>„Geschlossen“ ≠ gelöscht:</strong> Eintrag, Name, Adresse und <strong>alle Bewertungen bleiben öffentlich sichtbar.</strong></li>
              <li><strong>Der einzige verlässliche Weg</strong> ist die vollständige Entfernung des Profils über Googles offizielle Verfahren – dauerhaft, samt aller Bewertungen.</li>
              <li><strong>RapidRemove</strong> entfernt das Profil samt aller Bewertungen in der Regel in <strong>24–48 Stunden</strong> – <strong>Zahlung erst nach Erfolg</strong>.</li>
            </ul>
          </div>

          <p className="lead-p">
            Sie googeln Ihr Unternehmen – und sehen ein Profil, das Sie so nicht mehr wollen: voller alter
            Fake- oder Rachebewertungen, mit falschen Daten, oder schlicht ein Eintrag, aus dem Sie endgültig
            raus möchten. Die naheliegende Frage: <strong>Wie kann ich mein Google-Unternehmensprofil löschen?</strong>{" "}
            (Viele suchen auch nach „Google My Business löschen“, „Mein Unternehmen löschen“ oder <a href={asset("/magazin/firma-bei-google-loeschen/")}>„Firma bei Google löschen“</a> – gemeint ist dasselbe.){" "}
            Dieser Leitfaden zeigt Googles offizielle Schritte, was jede Option wirklich bewirkt – und was tatsächlich funktioniert.
          </p>

          <div className="callout tip">
            <Icon.checkCircle />
            <div className="co-body">
              <b>Kurze Antwort</b>
              Ein Google-Unternehmensprofil lässt sich nicht einfach löschen. Als Inhaber können Sie es bei Google nur
              <strong> aus Ihrem Konto entfernen</strong> (Einstellungen für das Unternehmensprofil → Unternehmensprofil
              entfernen) oder als <strong>dauerhaft geschlossen</strong> markieren. In beiden Fällen bleiben der öffentliche
              Eintrag und <strong>alle Bewertungen in Google-Suche und Google Maps</strong>. Vollständig verschwindet das
              Profil samt aller Bewertungen nur über Googles offizielle Entfernungsverfahren – genau das übernimmt
              RapidRemove, Zahlung erst nach Erfolg.
            </div>
          </div>

          <h2 id="selbst-loeschen">Warum es keinen einfachen „Löschen“-Knopf gibt</h2>
          <p>
            Google trennt streng zwischen Ihrem persönlichen Google-Konto und dem öffentlichen Unternehmensprofil (früher
            „Google My Business“, auf Deutsch auch „Google Mein Unternehmen“). Sie können die Inhaberschaft beantragen,
            Daten bearbeiten und das Profil aus Ihrem Konto entfernen – einen Knopf „Diesen Eintrag und alle Bewertungen
            endgültig löschen“ gibt es für Unternehmer aber nicht.
          </p>
          <p>
            Das ist kein Versehen, sondern Absicht: Das Profil beschreibt einen realen Ort und gehört aus Googles Sicht
            zur Google-Suche und zu Google Maps – nicht Ihnen, auch wenn Sie es verwalten. Genau deshalb stoßen die meisten
            Unternehmer beim Versuch, ihr Profil selbst zu löschen, schnell an eine Wand.
          </p>
          <div className="callout warn">
            <Icon.alert />
            <div className="co-body">
              <b>„Dauerhaft geschlossen“ ist keine Löschung</b>
              Wer sein Unternehmen als dauerhaft geschlossen markiert, bleibt in Google-Suche und Google Maps sichtbar –
              mit Name, Adresse, Fotos und <strong>sämtlichen Bewertungen</strong>. Darüber steht lediglich ein
              durchgestrichenes „Dauerhaft geschlossen“. Für potenzielle Kunden sieht das oft <em>schlechter</em> aus als vorher.
            </div>
          </div>

          <h2 id="anleitung">Google-Unternehmensprofil löschen: Googles offizielle Schritte</h2>
          <p>
            In Googles eigener Sprache heißt die Inhaber-Funktion <strong>„Unternehmensprofil entfernen“</strong>. Sie
            existiert – entfernt das Profil aber aus <em>Ihrem Konto</em>, nicht den Eintrag aus Google. So funktioniert
            sie, damit Sie genau wissen, was Sie tun (und was nicht):
          </p>
          <h3>Am Computer (Google-Suche)</h3>
          <ol>
            <li>Mit dem Google-Konto anmelden, dem das Profil gehört, und nach dem eigenen Firmennamen (oder „Mein Unternehmen“) suchen.</li>
            <li>Im Unternehmensprofil das Drei-Punkte-Menü <strong>(⋮)</strong> öffnen → <strong>Einstellungen für das Unternehmensprofil</strong>.</li>
            <li><strong>Unternehmensprofil entfernen</strong> wählen → <strong>Profilinhalt und Administratoren entfernen</strong>.</li>
            <li>Optional ankreuzen, dass das Unternehmen dauerhaft geschlossen ist.</li>
            <li>Mit <strong>Weiter</strong> → <strong>Entfernen</strong> bestätigen.</li>
          </ol>
          <h3>In der Google-Maps-App</h3>
          <p>
            Mit dem Inhaber-Konto Google Maps öffnen, zum eigenen Unternehmensprofil wechseln und über das Menü dieselben
            Einstellungen aufrufen. Schritte und Ergebnis sind die gleichen wie am Computer.
          </p>
          <h3>Mehrere Profile auf einmal</h3>
          <p>
            Wer mehrere Standorte verwaltet, markiert in der Profilverwaltung die gewünschten Einträge und wählt
            <strong> Aktionen</strong> → <strong>Unternehmen entfernen</strong> → <strong>Entfernen</strong>.
          </p>
          <div className="callout warn">
            <Icon.alert />
            <div className="co-body">
              <b>Was laut Google danach passiert</b>
              Laut Googles eigener Hilfe <strong>bleiben Kundenrezensionen sichtbar</strong>, und das Unternehmen
              <strong> kann weiterhin in Suche und Maps erscheinen</strong>. Gelöscht werden nur <em>Ihre</em> Inhalte:
              Beiträge, von Ihnen hochgeladene Fotos und Ihre Antworten auf Rezensionen. Das darf nur der
              <strong> primäre Inhaber</strong>, neue Inhaber müssen <strong>7 Tage</strong> warten. Kurz gesagt: Die offizielle
              Option beendet <em>Ihre</em> Verwaltung des Profils – sie löscht das Profil nicht.
            </div>
          </div>

          <h2 id="optionen">Löschen, schließen, entfernen: was jede Option wirklich bewirkt</h2>
          <p>
            Gesucht wird nach „Mein Unternehmen löschen“, „Google My Business löschen“, „Google-Firmeneintrag löschen“ oder
            „Google-Konto löschen“ – bei Google sind das aber sehr unterschiedliche Vorgänge. Das passiert jeweils mit dem
            öffentlichen Eintrag und den Bewertungen:
          </p>
          <div className="art-table-wrap">
            <table className="art-table">
              <thead>
                <tr><th>Option</th><th>Wo</th><th>Öffentlicher Eintrag</th><th>Bewertungen</th></tr>
              </thead>
              <tbody>
                <tr><td>Unternehmensprofil entfernen (aus dem Konto)</td><td>Einstellungen für das Unternehmensprofil</td><td>Bleibt online, jetzt ohne Verwalter</td><td className="no">Bleiben sichtbar</td></tr>
                <tr><td>Als dauerhaft geschlossen markieren</td><td>Profil bearbeiten → Öffnungsstatus</td><td>Bleibt online mit „Dauerhaft geschlossen“</td><td className="no">Bleiben sichtbar</td></tr>
                <tr><td>Als vorübergehend geschlossen markieren</td><td>Profil bearbeiten → Öffnungsstatus</td><td>Bleibt online, „Vorübergehend geschlossen“</td><td className="no">Bleiben sichtbar</td></tr>
                <tr><td>Google-Konto löschen</td><td>Einstellungen des Google-Kontos</td><td>Bleibt online, wird herrenlos</td><td className="no">Bleiben sichtbar</td></tr>
                <tr><td>„Änderung vorschlagen“ → „Schließen oder entfernen“ (jeder)</td><td>Google Maps / Suche</td><td>Google entscheidet – meist abgelehnt</td><td>Bleiben, außer Google entfernt den Eintrag</td></tr>
                <tr><td>Vollständige Profil-Entfernung (RapidRemove)</td><td>Googles offizielle Entfernungsverfahren</td><td className="rr ok">Aus Suche und Maps entfernt</td><td className="rr ok">Alle mit entfernt</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Noch eine häufige Verwechslung: <strong>„Google My Business“ bzw. „Google Mein Unternehmen“ ist nur der alte Name
            des Google-Unternehmensprofils.</strong> Ob Sie es Unternehmenskonto, Firmeneintrag, Google-Eintrag oder Profil
            nennen – es ist derselbe Eintrag, und es gelten dieselben Regeln. Wer „Mein Unternehmen löschen“ sucht, meint in
            aller Regel genau dieses Profil – nicht die Firma selbst.
          </p>

          <h2 id="was-passiert">Was passiert, wenn ich mein Google-Unternehmensprofil lösche?</h2>
          <p>Viele erwarten, dass der Eintrag verschwindet, sobald sie ihn aus dem Konto entfernen. Tatsächlich passiert Folgendes:</p>
          <ul>
            <li><strong>Ihr Zugriff endet:</strong> Sie und alle Verwalter verlieren die Kontrolle. Um das Profil wieder zu verwalten, muss es neu beansprucht und verifiziert werden.</li>
            <li><strong>Ihre Inhalte sind weg:</strong> Beiträge, Ihre Fotos und Ihre Antworten auf Rezensionen werden dauerhaft gelöscht.</li>
            <li><strong>Der Eintrag bleibt:</strong> Name, Adresse, Kategorie und Öffnungszeiten bleiben meist in Google-Suche und Google Maps sichtbar.</li>
            <li><strong>Die Bewertungen bleiben:</strong> Jede Kundenbewertung – auch Fake- oder unfaire – bleibt öffentlich, jetzt <strong>ohne Ihre Antworten</strong> daneben.</li>
            <li><strong>Jeder kann ihn ändern:</strong> Ein herrenloses Profil können Nutzer und Google selbst bearbeiten, und Sie werden nicht mehr benachrichtigt.</li>
          </ul>
          <p>Deshalb macht das Entfernen aus dem Konto die Lage oft schlimmer: Die negativen Bewertungen stehen weiter da, Ihre Sicht der Dinge aber nicht mehr.</p>

          <h2 id="neu-anfangen">Profil löschen und neu anfangen – geht das?</h2>
          <p>
            Nicht, indem Sie einfach ein neues anlegen. Existiert der alte Eintrag noch – und nach „Unternehmensprofil
            entfernen“ tut er das –, sieht Google ein <strong>zweites Profil für dasselbe Unternehmen an derselben Adresse</strong>.
            Solche Dubletten werden meist mit dem alten Eintrag zusammengeführt (samt Bewertungen), oder das neue Profil wird
            gesperrt. So oder so kommen die alten Bewertungen zurück.
          </p>
          <p>
            Ein echter Neustart läuft in zwei Schritten: Zuerst wird das <strong>alte Profil vollständig entfernt</strong>,
            inklusive aller Bewertungen; danach legen Sie bei Bedarf ein <strong>sauberes neues Profil</strong> an und
            verifizieren es. RapidRemove übernimmt den ersten Schritt – Fixpreis, Zahlung erst nach Erfolg –, Ihre Website und
            Ihr Ranking in der normalen Google-Suche bleiben unberührt.
          </p>

          <h2 id="maps">Unternehmen aus Google Maps entfernen</h2>
          <p>Bei Google Maps kann jeder – Inhaber oder nicht – Google bitten, einen Ort zu schließen oder zu entfernen:</p>
          <ol>
            <li>Den Ort in Google Maps oder der Google-Suche öffnen.</li>
            <li><strong>Änderung vorschlagen</strong> → <strong>Schließen oder entfernen</strong> wählen.</li>
            <li>Einen Grund angeben, etwa dauerhaft geschlossen, existiert nicht, Duplikat oder Spam.</li>
            <li>Absenden – Google prüft den Vorschlag und entscheidet selbst.</li>
          </ol>
          <p>
            Bei echten, bestehenden Unternehmen werden solche Vorschläge meist abgelehnt oder in ein „Dauerhaft
            geschlossen“ umgewandelt – Eintrag und Bewertungen bleiben. Mehr zu eigenen, fremden und doppelten Einträgen:{" "}
            <a href={asset("/magazin/google-maps-eintrag-loeschen/")}>Google-Maps-Eintrag löschen</a>.
          </p>

          <h2 id="keine-option">Warum sehe ich keine Option zum Löschen?</h2>
          <p>Fehlt „Unternehmensprofil entfernen“ in Ihren Einstellungen, liegt es fast immer an einem dieser Gründe:</p>
          <ul>
            <li><strong>Sie sind Verwalter, nicht primärer Inhaber.</strong> Nur der primäre Inhaber kann Profilinhalt und Administratoren entfernen.</li>
            <li><strong>Sie sind erst seit Kurzem Inhaber.</strong> Neue Inhaber müssen 7 Tage warten, bis die Option erscheint.</li>
            <li><strong>Das Profil ist nicht von Ihnen beansprucht oder verifiziert.</strong> Dann gehört es niemandem – oder einem anderen Google-Konto.</li>
            <li><strong>Sie sind mit dem falschen Google-Konto angemeldet.</strong> Viele Betriebe haben mehrere; prüfen Sie, welchem das Profil gehört.</li>
          </ul>
          <p>Und selbst wenn Sie den Knopf finden: Er entfernt das Profil aus Ihrem Konto, nicht aus Google.</p>

          <div className="art-cta">
            <div className="seal" />
            <h3>Lieber direkt prüfen, ob Ihr Profil löschbar ist?</h3>
            <p>Geben Sie Ihren Firmennamen ein – wir finden Ihr echtes Google-Profil und prüfen in Sekunden, ob und wie schnell es entfernt werden kann. Unverbindlich und kostenlos.</p>
            <a className="btn btn-white lg" href={asset("/?start=1")} onClick={startCheck}><Icon.search size={18} /> Gratis-Check starten <Icon.arrowRight size={17} /></a>
            <div className="cta-trust"><Icon.shieldCheck /> Zahlung nur nach erfolgreicher Löschung</div>
          </div>

          <h2 id="wege">Selbst, Anwalt oder Profi: die Wege im Vergleich</h2>
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
                <tr><td>Dauer</td><td>—</td><td>3–9 Monate</td><td className="rr">meist 24–48 Stunden</td></tr>
                <tr><td>Kosten</td><td>—</td><td>300 €+ / Stunde</td><td className="rr">Fixpreis ab 450 €</td></tr>
                <tr><td>Alle Bewertungen weg</td><td className="no">Nein</td><td>Einzeln, mühsam</td><td className="rr ok">Alle auf einmal</td></tr>
                <tr><td>Bezahlung</td><td>—</td><td>Stundenhonorar, auch ohne Erfolg</td><td className="rr ok">Nur nach Erfolg</td></tr>
                <tr><td>Ihr Aufwand</td><td>Hoch</td><td>Hoch</td><td className="rr">Praktisch null</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Der DIY-Weg endet fast immer bei „dauerhaft geschlossen“. Der Anwaltsweg ist teuer, langsam und ungewiss –
            und löst nicht selten den <a href={asset("/magazin/negative-google-bewertung-anwalt-oder-technische-loeschung/")}>Streisand-Effekt</a> aus, bei dem die
            Aufmerksamkeit erst recht steigt. Bleibt der dritte Weg: die vollständige Entfernung über Googles offizielle Verfahren.
          </p>

          <h2 id="bewertungen">Einzelne Bewertungen löschen oder das ganze Profil entfernen?</h2>
          <p>
            Viele starten mit dem Versuch, einzelne schlechte Bewertungen über Google zu <a href={asset("/magazin/fake-google-bewertung-melden-loeschen/")}><strong>melden</strong></a>. Das ist
            mühsam und ungewiss: Google lehnt Meldungen häufig ab, jede Bewertung muss einzeln begründet werden – und
            für jede entfernte Bewertung tauchen schnell neue auf. Sie kämpfen gegen Symptome.
          </p>
          <p>
            Der nachhaltige Ansatz setzt an der Wurzel an: <strong>Wird das gesamte Profil entfernt, verschwinden alle
            Bewertungen auf einen Schlag</strong> – Fake-Bewertungen inklusive. Endgültig statt Stückwerk. Genau deshalb
            löschen wir bewusst keine Einzelbewertungen, sondern das komplette Profil. Wer zunächst nur
            <a href={asset("/magazin/google-bewertung-loeschen-lassen/")}> einzelne Google-Bewertungen löschen lassen</a> möchte,
            findet dort die Methoden und Kosten im Vergleich.
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
            vorgesehenen Verfahren</strong>, im Auftrag des Inhabers, und wurde juristisch geprüft. Ihr Google-Konto, Gmail
            und etwaige Google-Ads-Konten bleiben dabei vollständig unberührt – ebenso Ihre Website, Ihr organisches Ranking
            und Ihre Kampagnen. Wann eine Löschung rechtlich zulässig ist und wer dabei helfen darf, erklärt unser Ratgeber{" "}
            <a href={asset("/magazin/negative-google-bewertung-anwalt-oder-technische-loeschung/")}>Google-Bewertung löschen: Wann ist das legal?</a>
          </p>
          <p>
            Seriös erkennen Sie einen Anbieter daran, dass er eine echte Firma mit Adresse und UID nennt, transparent
            über die Methode spricht und <strong>erst nach Erfolg abrechnet</strong> – nicht an vagen Versprechen von
            „Geheim-Zugängen zu Google“.
          </p>

          <h2 id="dauer-kosten">Wie lange dauert es – und was kostet es?</h2>
          <p>
            Eine professionelle Löschung ist in der Regel <strong>innerhalb von 24–48 Stunden</strong> erledigt – statt
            der Monate, die der Anwaltsweg verschlingt. Bei den Kosten gilt: Ein Anwalt rechnet im Stundentakt (oft
            300 € und mehr) ohne Erfolgsgarantie. RapidRemove arbeitet mit einem <strong>transparenten Fixpreis ab
            450 €</strong> – und Sie zahlen <strong>ausschließlich nach erfolgreicher Löschung</strong>.
          </p>
          <p>
            Klingt der Preis hoch? Rechnen Sie gegen: Eine einzige sichtbare Fake-Bewertung kann die Klickrate deutlich
            senken und kostet Sie über Monate ein Vielfaches. Alle Details zum Service:{" "}
            <a href={asset("/")}>Google-Unternehmensprofil löschen lassen</a> – inklusive{" "}
            <a href={asset("/#pricing")}>Preis-Übersicht</a>.
          </p>

          <h2 id="ablauf">So läuft die Löschung mit RapidRemove ab</h2>
          <p>Drei Schritte, transparent geführt – Sie tun fast nichts:</p>
          <div className="art-steps">
            {[
              ["Gratis-Check", "Firmennamen eingeben. Wir finden Ihr Profil und prüfen sofort, ob die Löschung möglich ist – unverbindlich und kostenlos."],
              ["Bestätigen & freigeben", "Sie bestätigen das richtige Profil und erteilen die Bearbeitungsfreigabe. Kein Zugriff auf Gmail, Ads oder persönliche Daten."],
              ["Löschung in 24–48 Stunden", "Unser Team entfernt das Profil samt aller Bewertungen – dauerhaft. Bezahlt wird erst danach."],
            ].map(([t, d], i) => (
              <div className="art-step" key={i}>
                <div className="sn">{i + 1}</div>
                <div className="st"><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>

          <h2 id="herkunft">Wer hat dieses Profil überhaupt angelegt?</h2>
          <p>
            Die meisten Unternehmer, die uns kontaktieren, haben ihr Profil nie selbst erstellt – und sind ehrlich
            überrascht, dass es existiert. Das ist kein Einzelfall, sondern der Normalfall. Ein Google-Unternehmensprofil
            entsteht in den seltensten Fällen aktiv durch den Inhaber. Viel häufiger legt es jemand anderes an, oder
            Google generiert es vollautomatisch. Wer verstehen will, warum sich so ein Eintrag später so schwer wieder
            loswerden lässt, sollte zuerst wissen, wie er dorthin gekommen ist. Im Wesentlichen gibt es drei Wege.
          </p>
          <p>
            Und es ist kein regionales Phänomen: Laut unserem{" "}
            <a href={asset("/google-profil-loeschungen-report")}>Datenreport 2026</a> – Basis sind über 1.600 Löschungen
            seit 2023 – kommt inzwischen mehr als die Hälfte aller Anfragen auf Englisch, von Unternehmen aus über 50 Ländern.
          </p>

          <ArticleIngestAnim />

          <h3>Weg 1: Jemand fügt den Ort von Hand hinzu</h3>
          <p>
            Jeder Google-Nutzer kann in der Maps-App auf eine Adresse oder eine freie Fläche tippen und „Fehlenden Ort
            hinzufügen“ wählen. Damit lässt sich ein Unternehmen eintragen, ohne dass man irgendetwas damit zu tun hat –
            das machen Kunden, ehemalige Mitarbeiter, Wettbewerber oder besonders aktive Maps-Nutzer (Local Guides).
          </p>
          <p>Ganz ungeprüft geht das allerdings nicht. Bevor ein gemeldeter Ort sichtbar wird, läuft im Hintergrund eine automatische Prüfung:</p>
          <ul>
            <li><strong>Standort:</strong> Befindet sich der Nutzer tatsächlich in der Nähe des Ortes, den er anlegen will? Das verhindert, dass jemand aus Berlin spaßeshalber ein Café in München erfindet.</li>
            <li><strong>Dubletten-Check:</strong> Gibt es an dieser Koordinate oder direkt nebenan schon einen ähnlichen Namen oder dieselbe Kategorie?</li>
            <li><strong>Abgleich mit dem Web:</strong> Google sucht parallel nach dem Namen, um zu prüfen, ob das Geschäft online überhaupt irgendwo auftaucht.</li>
          </ul>
          <p>Passt das Bild zusammen, wird der Punkt freigeschaltet – und ist dann als <strong>nicht beanspruchtes Profil</strong> für alle sichtbar.</p>

          <h3>Weg 2: Google erstellt das Profil selbst aus Web-Daten</h3>
          <p>
            Das ist der Weg, mit dem die wenigsten rechnen: Google legt Profile in großer Zahl eigenständig an – ohne
            Zutun und ohne Zustimmung des Inhabers. Der Hintergrund ist simpel: Google will die reale Welt möglichst
            lückenlos abbilden und wartet nicht darauf, dass ein neuer Betrieb sich selbst meldet.
          </p>
          <p>
            Dafür durchsuchen Googles Crawler laufend das Internet nach sogenannten <strong>NAP-Daten</strong> – Name,
            Adresse, Telefonnummer (engl. <em>Name, Address, Phone</em>). Aus diesen Bruchstücken setzt das System ein
            Profil zusammen, ausgelöst zum Beispiel durch:
          </p>
          <ul>
            <li><strong>Strukturierte Daten auf der Website:</strong> Hinterlegt eine Firmenseite im Quelltext das standardisierte <code>LocalBusiness</code>-Markup (maschinenlesbare Angaben nach Schema.org), liest Google Adresse, Telefon und Öffnungszeiten direkt und sauber aus.</li>
            <li><strong>Digitale Spuren im Netz:</strong> Google kombiniert Angaben aus Facebook-Seiten, Instagram-Profilen, Erwähnungen in Lokalmedien und Einträgen in Online-Telefonbüchern.</li>
            <li><strong>Konsistenz-Abgleich:</strong> Taucht derselbe Betrieb mit derselben Adresse mehrfach übereinstimmend auf – etwa auf der eigenen Website, bei Facebook und in einem lokalen Blog – erstellt Google daraus automatisch einen neuen Eintrag auf Maps.</li>
          </ul>
          <p>Die meisten Inhaber bemerken das erst, wenn sie auf der Karte plötzlich den Button „Als Inhaber beanspruchen“ sehen.</p>

          <h3>Weg 3: Massen-Import aus offiziellen Registern</h3>
          <p>
            Der dritte Weg wird oft unterschätzt: Google übernimmt Daten in großem Stil aus offiziellen Quellen und von
            Datenaggregatoren, mit denen feste Vereinbarungen bestehen.
          </p>
          <ul>
            <li><strong>Handels- und Gewerberegister:</strong> Sobald ein Unternehmen beim Gewerbeamt oder im Handelsregister angemeldet ist, fließen diese Angaben – meist über zwischengeschaltete Datenbanken – in regelmäßigen Abständen zu Google.</li>
            <li><strong>Branchenbücher:</strong> Google gleicht seine Karten mit den Gelben Seiten und den Telefonbuch-Registern des jeweiligen Landes ab. Ein neuer Eintrag dort kann automatisch einen neuen Punkt auf Maps auslösen.</li>
          </ul>
          <p>So kann ein Profil entstehen, kurz nachdem Sie Ihr Gewerbe angemeldet haben – ganz ohne dass Sie selbst je bei Google waren.</p>

          <p><strong>Warum das wichtig ist:</strong> Wie das Profil entstanden ist, ändert nichts an der Folge: Sobald es existiert, sammelt es Bewertungen und erscheint in Suche und Maps. Sie müssen es also weder angelegt haben noch verwalten, um davon betroffen zu sein – und genau deshalb reicht es auch nicht, sich einfach nicht darum zu kümmern. Loswerden muss man es trotzdem aktiv.</p>

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

          <h2 id="weiterlesen">Weiterlesen: passende Ratgeber aus dem Magazin</h2>
          <ul>
            {CLUSTER_CARDS.map((c) => (
              <li key={c.slug}><a href={asset("/magazin/" + c.slug + "/")}>{c.title}</a></li>
            ))}
          </ul>

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
            <img className="aa-ava" src={asset(HUB_AUTHOR.image)} alt={HUB_AUTHOR.name} style={{ objectFit: "cover" }} />
            <div>
              <a className="aa-name" href={asset(authorPath(HUB_AUTHOR))} style={{ color: "inherit", textDecoration: "none" }}>{HUB_AUTHOR.name}</a>
              <div className="aa-role">{roleFor(HUB_AUTHOR, "de")}</div>
            </div>
          </div>

          <div className="art-back">
            <a className="btn btn-secondary" href={asset("/magazin/")}><Icon.arrowLeft size={17} /> Zurück zum Magazin</a>
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
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/magazin/")} onAbout={() => nav("/ueber-uns/")} onOrm={() => nav("/reputation-verdraengen/")} onDeindex={() => nav("/presse-auslisten/")} active="magazin" />
      <ArticleBody />
      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/magazin/")} onAbout={() => nav("/ueber-uns/")} />
      <WhatsAppFloat />
    </LangContext.Provider>
  );
}
