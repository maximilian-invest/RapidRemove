/* Article: Google Maps Eintrag löschen

   SEO-Neuaufbau 6.11.2026 nach Suchintention (Vorbild: DE-Flagship
   /magazin/google-unternehmensprofil-loeschen, Pos. 14 → 8). Ziel-Queries (DE/AT):
   google maps eintrag löschen (Pos. 9–15), google maps löschen, google maps
   unternehmen/firma löschen, unternehmen aus google maps löschen/entfernen,
   google maps eintrag löschen lassen, google maps adressen löschen.
   Aufbau: Kurzantwort → offizielle Schritte → „dauerhaft geschlossen“ → fremder /
   doppelter Eintrag → Privatadresse → Sonderfälle → Vergleichstabelle → Service →
   Neustart → Grenzen → FAQ.
   WORDING (verbindlich): Entfernung „im Auftrag des Inhabers, über die von Google
   vorgesehenen Verfahren“; Dauer „meist ca. 24 Stunden nach der Rechteübertragung“
   (+ Verifizierungs-Hinweis); Preise netto (zzgl. USt); keine Einzelbewertungs-
   Löschung in DE/AT; keine Erfolgs- oder Sicherheitsversprechen. */
const article = {
  meta: {
    slug: "google-maps-eintrag-loeschen",
    title: "Google-Maps-Eintrag löschen 2026: So geht's wirklich",
    h1: "Google-Maps-Eintrag löschen: So entfernen Sie Ihr Unternehmen wirklich aus Google Maps",
    description:
      "Google hat keinen Lösch-Button: „Dauerhaft geschlossen“ lässt Eintrag und Bewertungen online. Alle Wege, einen Maps-Eintrag wirklich zu entfernen.",
    keywords: [
      "google maps eintrag löschen",
      "google maps löschen",
      "google maps unternehmen löschen",
      "unternehmen aus google maps löschen",
      "unternehmen aus google maps entfernen",
      "google maps eintrag löschen lassen",
      "google maps firma löschen",
      "google maps adressen löschen",
      "google maps fremden eintrag löschen",
      "doppelten google maps eintrag löschen",
    ],
    author: "Maximilian Hölzl",
    authorRole: "Google-Experte & Gründer",
    date: "2026-06-04",
    updated: "2026-11-06",
  },
  category: "Google-Policy",
  iconKey: "mapPin",
  readingMin: 12,
  dek: "Sie wollen Ihr Unternehmen aus Google Maps löschen – nach einer Schließung, einem Umzug oder weil der Eintrag Ihnen schadet? Wichtig vorab: **Weder „Unternehmensprofil entfernen“ noch „dauerhaft geschlossen“ löscht den Eintrag.** Name, Adresse und alle Bewertungen bleiben online. Hier finden Sie jeden Weg Schritt für Schritt – für eigene, fremde, doppelte und private Einträge – und was davon wirklich zur Löschung führt.",
  blocks: [
    { t: "note", title: "Hinweis", text: "Dieser Beitrag ist eine praktische Anleitung und keine Rechtsberatung. Stand: November 2026 – Google ändert Menüs und Bezeichnungen gelegentlich." },

    { t: "tip", title: "Kurzantwort", text: "Google Maps hat **keinen Lösch-Button** für Unternehmenseinträge. Als Inhaber können Sie nur Ihre **Verwaltung beenden** („Profilinhalt und Administratoren entfernen“) oder das Unternehmen als **„dauerhaft geschlossen“** markieren – in beiden Fällen **bleiben Eintrag und Bewertungen in Google Maps und der Google-Suche sichtbar**. Google selbst entfernt einen Ort nur in bestimmten Fällen, etwa wenn es ihn nie gab, er nicht zulässig ist oder es sich um ein Duplikat handelt. Die **vollständige Entfernung samt aller Bewertungen** übernimmt RapidRemove im Auftrag des Inhabers, über die von Google vorgesehenen Verfahren – **Zahlung erst nach Erfolg**." },

    { t: "h2", id: "offizielle-schritte", text: "Google Maps Eintrag löschen – die offiziellen Schritte", toc: "Offizielle Schritte" },
    { t: "p", text: "Die Funktion, die Google für Inhaber vorsieht, heißt **„Unternehmensprofil entfernen“**. Sie beendet Ihre Verwaltung des Eintrags – den Eintrag selbst löscht sie nicht. So gehen Sie vor, damit Sie genau wissen, was passiert:" },
    { t: "h3", text: "Am Computer (Google-Suche oder Google Maps)" },
    { t: "ol", items: [
      "Melden Sie sich mit dem Google-Konto an, das **Inhaber** des Profils ist, und suchen Sie in der Google-Suche oder in Google Maps nach Ihrem Unternehmen (oder nach „Mein Unternehmen“).",
      "Öffnen Sie Ihr Unternehmensprofil und klicken Sie auf **⋮ Mehr**.",
      "Wählen Sie **„Einstellungen für das Unternehmensprofil“**.",
      "Klicken Sie auf **„Unternehmensprofil entfernen“**.",
      "Wählen Sie **„Profilinhalt und Administratoren entfernen“**. Optional können Sie hier zusätzlich **„Unternehmen als dauerhaft geschlossen markieren“** anhaken.",
      "Bestätigen Sie mit **„Weiter“** → **„Entfernen“**.",
    ] },
    { t: "h3", text: "In der Google-Maps-App" },
    { t: "p", text: "Öffnen Sie die Google-Maps-App mit dem Inhaber-Konto, rufen Sie Ihr Unternehmensprofil auf und wählen Sie im Menü **Mehr** → **„Einstellungen für das Unternehmensprofil“** → **„Unternehmensprofil entfernen“**. Ablauf und Ergebnis sind dieselben wie am Computer; die Bezeichnungen können je nach App-Version leicht abweichen." },
    { t: "h3", text: "Kein Zugriff auf den Eintrag?" },
    { t: "p", text: "Fehlt die Option, sind Sie meist **nicht primärer Inhaber**: Sie sind nur Verwalter, mit dem falschen Google-Konto angemeldet, erst seit weniger als 7 Tagen Inhaber – oder der Eintrag wurde nie von Ihnen beansprucht. Dann müssen Sie zuerst über **„Dieses Unternehmen beanspruchen“** bzw. **„Zugriff anfordern“** die Inhaberschaft beantragen und sich verifizieren. Ohne Inhaberrechte gibt es nur den Weg über „Änderung vorschlagen“ (siehe unten)." },
    { t: "warn", title: "Was laut Google danach passiert", text: "Google schreibt in der eigenen Hilfe sinngemäß: **Kundenrezensionen bleiben sichtbar**, und das Unternehmen **kann weiterhin in der Google-Suche und in Google Maps erscheinen**. Gelöscht werden nur *Ihre* Inhalte – Beiträge, von Ihnen hochgeladene Fotos und Ihre Antworten auf Rezensionen. Die Option steht nur dem **primären Inhaber** zur Verfügung. Kurz: Sie geben die Kontrolle ab, der Eintrag bleibt." },
    { t: "p", text: "Das ist der Grund, warum so viele Inhaber nach dem vermeintlichen Löschen verwundert feststellen, dass ihr Unternehmen weiter in Maps steht – jetzt allerdings ohne ihre Antworten auf negative Bewertungen und ohne Kontrolle darüber, wer den Eintrag bearbeitet. Ausführlich zum Profil selbst: [Google Unternehmensprofil löschen](/magazin/google-unternehmensprofil-loeschen/)." },

    { t: "h2", id: "dauerhaft-geschlossen", text: "Was „dauerhaft geschlossen“ wirklich bewirkt", toc: "„Dauerhaft geschlossen“" },
    { t: "p", text: "Viele halten „dauerhaft geschlossen“ für die Löschung. Tatsächlich ist es nur ein **Status**: Der Eintrag bleibt mit Name, Adresse, Fotos und **allen Bewertungen** öffentlich – ergänzt um den Hinweis „Dauerhaft geschlossen“. Für Interessenten sieht das oft schlechter aus als vorher, weil die Sternebewertung stehen bleibt, Ihre Antworten aber nicht mehr kommen." },
    { t: "ul", items: [
      "**Der Eintrag bleibt sichtbar** – in Google Maps und in der Google-Suche, auch bei Suchen nach Ihrem Namen.",
      "**Die Bewertungen bleiben** – inklusive unfairer oder gefälschter Rezensionen.",
      "**Er verschwindet nur allmählich:** Laut Google werden geschlossene Unternehmen mit der Zeit seltener angezeigt. Eine feste Frist, nach der der Eintrag weg ist, nennt Google nicht.",
      "**Er bleibt bearbeitbar:** Jeder Nutzer kann Änderungen vorschlagen – bis hin zum „Wiedereröffnen“ des Eintrags.",
    ] },
    { t: "p", text: "Wenn Ihr Unternehmen tatsächlich geschlossen hat, ist der Status korrekt und sinnvoll. Wenn Sie den Eintrag aber **loswerden** wollen, löst „dauerhaft geschlossen“ das Problem nicht." },

    { t: "h2", id: "fremder-eintrag", text: "Fremden oder falschen Eintrag aus Google Maps entfernen", toc: "Fremder / falscher Eintrag" },
    { t: "p", text: "Für Einträge, die Ihnen nicht gehören – etwa einen Ort, den es nicht gibt, einen Eintrag unter Ihrer Adresse, mit dem Sie nichts zu tun haben, oder Spam – gibt es nur die Melde-Funktion. Sie steht jedem Google-Nutzer offen:" },
    { t: "ol", items: [
      "Öffnen Sie den Eintrag in **Google Maps** (Browser oder App).",
      "Klicken Sie auf **„Änderung vorschlagen“**.",
      "Wählen Sie **„Als geschlossen melden oder entfernen“**.",
      "Wählen Sie den passenden Grund, z. B. **„Gibt es hier nicht“**, **„Duplikat eines anderen Orts“**, **„Dauerhaft geschlossen“** oder **„Spam“**.",
      "Absenden – Google prüft den Vorschlag und entscheidet selbst.",
    ] },
    { t: "p", text: "Realistisch betrachtet: Google prüft überwiegend automatisiert, und **für echte, existierende Unternehmen werden solche Vorschläge häufig abgelehnt** oder nur in den Status „dauerhaft geschlossen“ umgewandelt. Gute Chancen haben Meldungen, die offensichtlich zutreffen – etwa ein Geschäft, das es an dieser Adresse nie gab. Den Status Ihres Vorschlags sehen Sie in Google Maps unter **„Meine Beiträge“**." },
    { t: "p", text: "Den Eintrag eines **Mitbewerbers** können Sie nicht löschen lassen, nur weil er Ihnen schadet. Liegt ein konkreter Verstoß vor – etwa ein Fake-Eintrag, irreführende Angaben oder Keyword-Spam im Namen – können Sie ihn über die Melde-Funktion bzw. das Beschwerdeformular von Google zur Prüfung melden." },

    { t: "h2", id: "doppelter-eintrag", text: "Doppelten Google-Maps-Eintrag löschen oder zusammenführen", toc: "Doppelter Eintrag" },
    { t: "p", text: "Duplikate entstehen oft nach einem Umzug, einer Namensänderung oder weil ein Kunde Ihr Geschäft ein zweites Mal „hinzugefügt“ hat. Das Vorgehen hängt davon ab, wem die Einträge gehören:" },
    { t: "ul", items: [
      "**Beide Einträge in Ihrem Konto:** Entfernen Sie das überzählige Profil über **„Unternehmensprofil entfernen“** – und nur dieses.",
      "**Duplikat ohne Inhaber:** Öffnen Sie es in Google Maps → **„Änderung vorschlagen“** → **„Als geschlossen melden oder entfernen“** → **„Duplikat eines anderen Orts“**.",
      "**Beide Einträge haben Bewertungen:** Bitten Sie den **Google-Unternehmensprofil-Support**, die Einträge zusammenzuführen, statt eines zu löschen. Sonst gehen die Bewertungen des gelöschten Eintrags verloren.",
    ] },
    { t: "warn", title: "Achtung", text: "Melden Sie nie versehentlich Ihren **verifizierten** Haupteintrag als Duplikat. Sonst riskieren Sie, dass der falsche Eintrag stehen bleibt und Sie die Inhaberschaft neu bestätigen müssen." },

    { t: "h2", id: "privatadresse", text: "Privatadresse oder Wohnadresse aus Google Maps entfernen", toc: "Privatadresse entfernen" },
    { t: "p", text: "Wer „Google Maps Adresse löschen“ sucht, meint meist einen von drei Fällen:" },
    { t: "h3", text: "Ihre Privatadresse steht in Ihrem eigenen Firmeneintrag" },
    { t: "p", text: "Arbeiten Sie von zu Hause aus und besuchen Kunden vor Ort (z. B. Handwerker, mobile Dienstleister), sind Sie für Google ein **Unternehmen mit Einzugsgebiet**. Dann müssen Sie Ihre Wohnadresse nicht zeigen: Öffnen Sie Ihr Profil → **„Unternehmen bearbeiten“** → **„Standort“**, blenden Sie die **Unternehmensadresse für Kunden aus** und legen Sie stattdessen ein **Einzugsgebiet** fest (z. B. Städte oder Bezirke). Die Adresse bleibt Google bekannt, wird aber nicht mehr öffentlich angezeigt." },
    { t: "h3", text: "Ihre Wohnadresse wird als Unternehmen angezeigt" },
    { t: "p", text: "Taucht an Ihrer Privatadresse ein Firmeneintrag auf – etwa ein früheres Gewerbe, ein Vormieter oder ein Eintrag, den jemand anderes angelegt hat –, melden Sie ihn über **„Änderung vorschlagen“** → **„Als geschlossen melden oder entfernen“** → **„Gibt es hier nicht“** bzw. **„Privatwohnung“**, sofern angeboten. Ist es Ihr eigenes früheres Gewerbe, beanspruchen Sie den Eintrag und entfernen danach die Adresse oder den ganzen Eintrag." },
    { t: "h3", text: "Gespeicherte Adressen und Verlauf in der Maps-App" },
    { t: "p", text: "Geht es nur um Adressen in Ihrem eigenen Google-Konto: In der Maps-App unter **„Gespeichert“** → **„Mit Label“** lassen sich „Zuhause“, „Arbeit“ und eigene Labels über **⋮** entfernen. Suchverlauf und besuchte Orte löschen Sie über Ihr **Profilbild** → **„Einstellungen“** → **„Maps-Verlauf“**. Das betrifft nur Ihr Konto – öffentliche Einträge ändern sich dadurch nicht." },

    { t: "h2", id: "umzug-schliessung", text: "Nach Umzug, Schließung, Verkauf oder Ruhestand", toc: "Umzug, Schließung, Verkauf" },
    { t: "ul", items: [
      "**Umzug:** Ändern Sie die Adresse im bestehenden Eintrag, statt einen neuen anzulegen. Ein zweiter Eintrag erzeugt ein Duplikat, und Ihre Bewertungen verteilen sich.",
      "**Namensänderung:** Ändern Sie den Namen im selben Profil. Ein neuer Eintrag beginnt ohne Bewertungshistorie.",
      "**Schließung:** „Dauerhaft geschlossen“ ist korrekt – aber Eintrag und alte Bewertungen bleiben sichtbar und werden oft weiter mit Ihrem Namen in Verbindung gebracht.",
      "**Verkauf:** Übertragen Sie die Inhaberschaft an den Käufer (**„Nutzer hinzufügen“** → Rolle **Inhaber**), statt den Eintrag zu entfernen. Der Käufer übernimmt dann Eintrag und Bewertungen.",
      "**Ruhestand / Geschäftsaufgabe:** Soll nichts mehr an das frühere Unternehmen erinnern – vor allem, wenn der Eintrag Ihren Personennamen trägt –, ist die vollständige Entfernung der saubere Abschluss.",
    ] },
    { t: "p", text: "Speziell zur Frage, wie Sie Ihre Firma insgesamt aus der Google-Suche bekommen: [Firma bei Google löschen](/magazin/firma-bei-google-loeschen/)." },

    { t: "h2", id: "vergleich", text: "Alle Wege im Vergleich", toc: "Wege im Vergleich" },
    { t: "table", head: ["Weg", "Eintrag in Maps", "Bewertungen", "Aufwand"], rows: [
      ["Profilinhalt und Administratoren entfernen", "Bleibt sichtbar, ohne Verwaltung", "Bleiben sichtbar (ohne Ihre Antworten)", "Gering – wenige Klicks, nur primärer Inhaber"],
      ["Dauerhaft geschlossen", "Bleibt sichtbar mit Hinweis, verblasst nur allmählich", "Bleiben sichtbar", "Gering"],
      ["Änderung vorschlagen („Gibt es hier nicht“)", "Google entscheidet – bei echten Unternehmen oft abgelehnt", "Bleiben, solange der Eintrag bleibt", "Gering, Ergebnis ungewiss"],
      ["Anwalt", "Bleibt in der Regel – Ansatz nur gegen einzelne rechtswidrige Inhalte", "Nur einzelne rechtswidrige Bewertungen", "Hoch – Wochen bis Monate, Kosten nach Aufwand"],
      ["**RapidRemove**", "**Wird entfernt** – im Auftrag des Inhabers, über die von Google vorgesehenen Verfahren", "**Verschwinden mit dem Eintrag**", "Gering – Gratis-Check, Rechteübertragung, Zahlung erst nach Erfolg"],
    ] },

    { t: "cta", title: "Lässt sich Ihr Maps-Eintrag entfernen?", text: "Firmennamen eingeben – wir prüfen kostenlos, ob und wie Ihr Eintrag samt aller Bewertungen entfernt werden kann.", btn: "Gratis-Check starten", href: "/?start=1", trust: ["Gratis-Check", "Keine Passwörter nötig", "Zahlung erst nach Erfolg"] },

    { t: "h2", id: "loeschen-lassen", text: "Google Maps Eintrag löschen lassen", toc: "Eintrag löschen lassen" },
    { t: "p", text: "Wenn Sie den Eintrag **vollständig** – inklusive aller Bewertungen – aus Google Maps und der Google-Suche entfernen wollen, reichen die Bordmittel nicht. Genau das übernimmt RapidRemove: Wir entfernen den kompletten Eintrag **im Auftrag des Inhabers, über die von Google vorgesehenen Verfahren**. Mit dem Eintrag verschwinden alle damit verknüpften Bewertungen." },
    { t: "h3", text: "So läuft es ab" },
    { t: "ol", items: [
      "**Gratis-Check:** Sie geben Ihren Firmennamen ein. Wir finden Ihren Eintrag und prüfen, ob und wie er entfernt werden kann.",
      "**Inhaberrechte übertragen:** Sie fügen uns in Ihrem Unternehmensprofil als Inhaber hinzu – das läuft über die Einladungs-E-Mail von Google. **Passwörter brauchen wir nicht**, auf Ihr Google-Konto, Gmail oder Google Ads haben wir keinen Zugriff.",
      "**Entfernung:** Der Eintrag ist **meist ca. 24 Stunden nach der Rechteübertragung** entfernt. Ist vorher eine Verifizierung bei Google nötig – etwa weil der Eintrag noch nicht von Ihnen beansprucht wurde –, dauert es einige Tage länger.",
      "**Zahlung erst danach:** Sie zahlen erst, wenn der Eintrag entfernt ist.",
    ] },
    { t: "h3", text: "Was es kostet" },
    { t: "p", text: "Die Entfernung eines Eintrags kostet **ab 450 € zzgl. USt** – fällig **erst nach erfolgreicher Entfernung**. Optional gibt es einen **Schutz gegen neu angelegte Einträge**, falls Dritte Ihr Unternehmen später erneut auf Google Maps eintragen: **29,90 € pro Monat, 299 € pro Jahr oder einmalig 990 €** (jeweils zzgl. USt, jeweils inkl. täglichem Monitoring)." },
    { t: "warn", title: "Gut zu wissen", text: "Mit dem Eintrag verschwinden auch Ihre **guten Bewertungen und Fotos**. Ihre Website und Ihr Ranking in der normalen Google-Suche bleiben dagegen unberührt. Kann ein Eintrag nicht entfernt werden, müssen Sie die Inhaberschaft anschließend selbst wieder bei Google beantragen." },

    { t: "h2", id: "neu-starten", text: "Danach neu starten?", toc: "Neu starten" },
    { t: "p", text: "Ja, das ist möglich. Nach der vollständigen Entfernung können Sie ein **neues Unternehmensprofil** anlegen und verifizieren. Warten Sie damit **mindestens 48 Stunden** nach der Entfernung, damit Google den neuen Eintrag nicht mit dem alten in Verbindung bringt. Das neue Profil startet mit **0 Bewertungen** – ein echter Neuanfang." },
    { t: "p", text: "Anders sieht es aus, wenn Sie nur „Unternehmensprofil entfernen“ oder „dauerhaft geschlossen“ nutzen und dann ein neues Profil anlegen: Der alte Eintrag existiert weiter, Google sieht ein **Duplikat** an derselben Adresse und führt die Einträge häufig zusammen – samt der alten Bewertungen." },

    { t: "h2", id: "grenzen", text: "Grenzen: Was wir nicht machen", toc: "Grenzen" },
    { t: "ul", items: [
      "**Nur im Auftrag des Inhabers:** Wir arbeiten ausschließlich für den Inhaber bzw. Geschäftsführer des Unternehmens, dessen Eintrag entfernt werden soll.",
      "**Keine Einträge von Mitbewerbern:** Profile anderer Unternehmen entfernen wir nicht.",
      "**Keine öffentlichen Orte:** Sehenswürdigkeiten, Plätze, Behörden oder Straßen sind keine Firmeneinträge und nicht Teil unseres Angebots.",
      "**Google entscheidet:** Ob ein Eintrag entfernt wird, entscheidet allein Google. Deshalb zahlen Sie erst nach Erfolg.",
      "**Keine Einzelbewertungen in Deutschland und Österreich:** Die Entfernung einzelner Bewertungen bieten wir in DE und AT nicht an – unser Angebot betrifft dort den gesamten Eintrag.",
    ] },

    { t: "h2", id: "fazit", text: "Fazit", toc: "Fazit" },
    { t: "p", text: "Einen Google-Maps-Eintrag können Sie mit Googles eigenen Mitteln nicht löschen: „Profilinhalt und Administratoren entfernen“ beendet nur Ihre Verwaltung, „dauerhaft geschlossen“ ist nur ein Status, und Meldungen über „Änderung vorschlagen“ werden bei echten Unternehmen oft abgelehnt. Für Duplikate, Privatadressen und Umzüge gibt es gute Lösungen innerhalb des Profils. Soll der Eintrag samt aller Bewertungen **vollständig verschwinden**, ist die Entfernung im Auftrag des Inhabers über die von Google vorgesehenen Verfahren der direkte Weg – mit Zahlung erst nach Erfolg." },

    { t: "cta", title: "Prüfen Sie jetzt kostenlos, ob Ihr Eintrag entfernt werden kann.", text: "In wenigen Sekunden sehen Sie Ihren Eintrag und erfahren, ob wir ihn entfernen können. ab 450 € zzgl. USt – erst nach erfolgreicher Entfernung.", btn: "Gratis-Check starten", href: "/?start=1", trust: ["Gratis-Check", "Keine Passwörter nötig", "Zahlung erst nach Erfolg"] },
  ],
  faq: [
    { q: "Wie lösche ich einen Google-Maps-Eintrag?", a: "Als Inhaber öffnen Sie Ihr Unternehmensprofil → ⋮ Mehr → „Einstellungen für das Unternehmensprofil“ → „Unternehmensprofil entfernen“ → „Profilinhalt und Administratoren entfernen“ → Weiter → Entfernen. Das beendet aber nur Ihre Verwaltung: Der Eintrag und seine Bewertungen bleiben laut Google meist in Maps und der Suche sichtbar. Eine vollständige Entfernung läuft über die von Google vorgesehenen Verfahren – das übernimmt RapidRemove im Auftrag des Inhabers." },
    { q: "Kann ich meinen Google-Maps-Eintrag selbst löschen?", a: "Nicht vollständig. Sie können Ihre Verwaltung beenden oder das Unternehmen als „dauerhaft geschlossen“ markieren. Einen Button, der den Eintrag samt Bewertungen löscht, gibt es für Inhaber nicht." },
    { q: "Warum ist mein Eintrag nach dem Löschen noch sichtbar?", a: "Weil „Unternehmensprofil entfernen“ nur Ihre Inhalte und Ihren Zugriff löscht – Beiträge, eigene Fotos und Antworten auf Rezensionen. Der öffentliche Eintrag mit Name, Adresse und Bewertungen bleibt bestehen, oft mit dem Hinweis „dauerhaft geschlossen“." },
    { q: "Wie lange bleibt ein geschlossenes Unternehmen auf Google Maps?", a: "Es gibt keine feste Frist. Laut Google werden dauerhaft geschlossene Unternehmen mit der Zeit seltener angezeigt – bis dahin bleiben Eintrag und Bewertungen sichtbar, teils sehr lange." },
    { q: "Wie entferne ich einen fremden Eintrag aus Google Maps?", a: "Eintrag in Google Maps öffnen → „Änderung vorschlagen“ → „Als geschlossen melden oder entfernen“ → Grund wählen, z. B. „Gibt es hier nicht“ oder „Duplikat eines anderen Orts“. Google prüft und entscheidet selbst; bei echten Unternehmen werden solche Vorschläge oft abgelehnt." },
    { q: "Wie lösche ich einen doppelten Google-Maps-Eintrag?", a: "Liegen beide Einträge in Ihrem Konto, entfernen Sie das überzählige Profil. Ein Duplikat ohne Inhaber melden Sie über „Änderung vorschlagen“ → „Duplikat eines anderen Orts“. Haben beide Bewertungen, lassen Sie sie besser vom Google-Support zusammenführen." },
    { q: "Wie lösche ich eine Adresse aus Google Maps?", a: "Ist es Ihre Wohnadresse in Ihrem eigenen Firmeneintrag, blenden Sie unter „Unternehmen bearbeiten“ → „Standort“ die Adresse für Kunden aus und legen ein Einzugsgebiet fest. Wird Ihre Wohnadresse als fremdes Unternehmen angezeigt, melden Sie den Eintrag über „Änderung vorschlagen“. Gespeicherte Adressen wie „Zuhause“ entfernen Sie in der Maps-App unter „Gespeichert“ → „Mit Label“." },
    { q: "Was kostet es, einen Google-Maps-Eintrag löschen zu lassen?", a: "Bei RapidRemove ab 450 € zzgl. USt, fällig erst nach erfolgreicher Entfernung. Optional gibt es einen Schutz gegen neu angelegte Einträge für 29,90 € pro Monat, 299 € pro Jahr oder einmalig 990 € (jeweils zzgl. USt, inkl. täglichem Monitoring)." },
    { q: "Wie lange dauert die Entfernung?", a: "Meist ca. 24 Stunden nach der Rechteübertragung. Ist vorher eine Verifizierung bei Google nötig, dauert es einige Tage länger." },
    { q: "Brauchen Sie mein Passwort?", a: "Nein. Sie fügen uns in Ihrem Unternehmensprofil als Inhaber hinzu; das läuft über eine Einladungs-E-Mail von Google. Auf Ihr Google-Konto, Gmail oder Google Ads haben wir keinen Zugriff." },
    { q: "Kommen die Bewertungen zurück?", a: "Die Bewertungen sind mit dem Eintrag verknüpft und verschwinden mit ihm. Legen Sie später ein neues Profil an, startet es mit 0 Bewertungen." },
    { q: "Kann ein gelöschter Eintrag wieder auftauchen?", a: "Ja, Dritte – etwa Kunden – können Ihr Unternehmen später erneut auf Google Maps eintragen. Dagegen gibt es den optionalen Schutz mit täglichem Monitoring." },
    { q: "Kann ich danach ein neues Profil anlegen?", a: "Ja. Warten Sie nach der vollständigen Entfernung mindestens 48 Stunden, dann können Sie ein neues Profil anlegen und verifizieren. Es startet ohne Bewertungen." },
    { q: "Bleibt meine Website bei Google sichtbar?", a: "Ja. Entfernt wird nur der Eintrag in Google Maps bzw. das Unternehmensprofil. Ihre Website, Ihr Ranking in der normalen Suche und Ihre Google-Ads-Kampagnen bleiben unverändert." },
    { q: "Ist das seriös?", a: "Wir arbeiten ausschließlich im Auftrag des Inhabers bzw. Geschäftsführers und nutzen die von Google vorgesehenen Verfahren. Wir brauchen keine Passwörter, entfernen keine Einträge von Mitbewerbern, und ob ein Eintrag entfernt wird, entscheidet allein Google. Deshalb zahlen Sie erst nach Erfolg." },
    { q: "Entfernen Sie auch einzelne Bewertungen?", a: "In Deutschland und Österreich nicht. Dort entfernen wir den gesamten Eintrag – damit verschwinden alle Bewertungen auf einmal, auch Ihre guten." },
  ],
  // resolveRelated() (lib/articles/catalog.js) nutzt die URL nur als Slug-Schlüssel und
  // rendert daraus /magazin/<slug>/. Relative „/magazin/…“-URLs werden dort NICHT
  // erkannt und fallen stillschweigend weg – daher dieses Schlüsselformat.
  related: [
    { label: "Google Unternehmensprofil löschen – Anleitung", url: "https://www.rapid-remove.com/google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Firma bei Google löschen", url: "https://www.rapid-remove.com/firma-bei-google-loeschen" },
    { label: "Fake-Bewertung bei Google melden und löschen", url: "https://www.rapid-remove.com/fake-google-bewertung-melden-loeschen" },
    { label: "Schlechte Google-Bewertungen – was tun?", url: "https://www.rapid-remove.com/schlechte-google-bewertungen-was-tun" },
  ],
};
export default article;
