/* DE article: "Firma bei Google löschen" — die Laien-Formulierungen des Kernservice.

   SEO-Ausbau 6.11.2026 (nach dem Vorbild des Flagship-Umbaus nach Suchintention):
   Kurzantwort, Googles offizielle Schritte, Unternehmenskonto/Business-Konto ≠ Eintrag,
   „dauerhaft geschlossen", fremde/alte Firma, Sonderfälle (geschlossen, verkauft,
   umgezogen, umbenannt, Ruhestand), Neustart, Vergleichstabelle, „löschen lassen" +
   Grenzen, erweiterte FAQ.
   Ziel-Suchanfragen: Firma / Unternehmen / Firmeneintrag / Eintrag bei Google löschen,
   entfernen, löschen lassen · Google Unternehmenskonto / Geschäftskonto / Business-Konto löschen.

   WORDING: verbindliche Wortregeln des Inhabers beachten (Dauer nur „meist ca. 24 Stunden
   nach der Rechteübertragung" + Verifizierungs-Hinweis, keine Einzelbewertungen in DE/AT,
   Preise netto „zzgl. USt").

   related: resolveRelated() (catalog.js) löst Einträge über den Artikel-Slug auf und
   rendert immer den kanonischen /magazin/<slug>-Pfad. Relative „/magazin/…"-Werte werden
   dort derzeit verworfen, daher stehen hier die Slugs (Flagship-Schlüssel = FLAGSHIP_SLUG). */
const article = {
  meta: {
    slug: "firma-bei-google-loeschen",
    title: "Firma bei Google löschen 2026: So geht's wirklich",
    h1: "Firma bei Google löschen: Eintrag & Unternehmenskonto richtig entfernen (2026)",
    description:
      "Firma bei Google löschen: Einen Löschen-Button gibt es nicht. Die offiziellen Schritte, was danach sichtbar bleibt und wie der Eintrag ganz verschwindet.",
    author: "Matthias Lang",
    authorRole: "Google-Experte",
    date: "2026-06-04",
    updated: "2026-11-06",
    keywords: [
      "firma bei google löschen",
      "google firma löschen",
      "google unternehmen löschen",
      "unternehmen bei google löschen",
      "google unternehmen entfernen",
      "google eintrag löschen",
      "google eintrag löschen firma",
      "google firmeneintrag löschen",
      "google eintrag löschen lassen",
      "google eintrag entfernen",
      "google unternehmenskonto löschen",
      "google geschäftskonto löschen",
      "google business konto löschen",
      "google business account löschen",
    ],
  },
  category: "Google-Policy",
  iconKey: "building",
  readingMin: 12,
  dek: "„Firma bei Google löschen“ klingt nach einem Klick – einen Löschen-Button gibt es aber nicht. Hier sehen Sie Googles offizielle Schritte, was danach mit Eintrag und Bewertungen passiert, warum das Löschen des Google-Kontos den Firmeneintrag nicht entfernt – und wie Sie den Eintrag vollständig löschen lassen.",
  blocks: [
    { t: "tip", title: "Kurzantwort", text: "Google bietet **keinen Button, mit dem Sie Ihre Firma löschen**. Als Inhaber können Sie nur Ihren eigenen Zugriff entfernen („Profilinhalt und Administratoren entfernen“) oder die Firma als **„dauerhaft geschlossen“** markieren. In beiden Fällen **bleiben der Eintrag und alle Bewertungen** in der Google-Suche und in Google Maps sichtbar. Auch wer sein **Google-Konto oder Unternehmenskonto löscht, löscht den Firmeneintrag nicht** – er wird nur herrenlos. Die vollständige Entfernung des Eintrags samt aller Bewertungen übernimmt RapidRemove **im Auftrag des Inhabers, über die von Google vorgesehenen Verfahren** – bezahlt wird erst nach erfolgreicher Entfernung." },
    { t: "note", title: "Hinweis", text: "Dieser Beitrag ist ein praktischer Überblick und keine Rechtsberatung." },

    { t: "h2", id: "offizielle-schritte", text: "Firma bei Google löschen – die offiziellen Schritte", toc: "Offizielle Schritte" },
    { t: "p", text: "Mit „Firma bei Google löschen“ oder „Google-Eintrag löschen“ ist fast immer das **Google-Unternehmensprofil** gemeint (früher „Google My Business“ bzw. „Google Mein Unternehmen“): der Eintrag mit Name, Adresse, Öffnungszeiten, Fotos und Bewertungen. Die Inhaber-Funktion dafür heißt bei Google **„Unternehmensprofil entfernen“**. So rufen Sie sie auf:" },
    { t: "h3", text: "Am Computer (Google-Suche)" },
    { t: "ol", items: [
      "Mit dem Google-Konto anmelden, dem das Profil gehört, und nach dem eigenen Firmennamen suchen.",
      "Im Unternehmensprofil auf **⋮ Mehr** klicken → **Einstellungen für das Unternehmensprofil**.",
      "**Unternehmensprofil entfernen** wählen → **Profilinhalt und Administratoren entfernen**.",
      "Optional ankreuzen, dass das Unternehmen dauerhaft geschlossen ist.",
      "Mit **Weiter** → **Entfernen** bestätigen.",
    ] },
    { t: "h3", text: "In der Google-Maps-App und bei mehreren Standorten" },
    { t: "p", text: "In der Google-Maps-App öffnen Sie mit dem Inhaber-Konto Ihr Unternehmensprofil und gehen über **Mehr** in dieselben Einstellungen – Schritte und Ergebnis sind gleich. Wer mehrere Filialen verwaltet, markiert sie in der Profilverwaltung und wählt **Aktionen** → **Unternehmen entfernen**." },
    { t: "warn", title: "Was danach wirklich passiert", text: "Laut Googles eigener Hilfe **bleiben die Rezensionen sichtbar**, und das Unternehmen **kann weiterhin in Suche und Maps erscheinen**. Gelöscht werden nur **Ihre** Inhalte: Beiträge, von Ihnen hochgeladene Fotos und Ihre Antworten auf Bewertungen. Kurz gesagt: Sie verlieren die Verwaltung – der Eintrag bleibt." },
    { t: "ul", items: [
      "**Ihr Zugriff endet:** Sie und alle Administratoren verlieren die Kontrolle. Wer das Profil später wieder verwalten will, muss es neu beanspruchen und bestätigen.",
      "**Der Eintrag bleibt:** Name, Adresse, Kategorie und Öffnungszeiten stehen meist weiter in Google.",
      "**Die Bewertungen bleiben:** auch unfaire oder gefälschte – jetzt **ohne Ihre Antworten** daneben.",
      "**Jeder kann ihn ändern:** Ein herrenloser Eintrag lässt sich von Nutzern und von Google bearbeiten, ohne dass Sie benachrichtigt werden.",
    ] },
    { t: "h3", text: "Sie sehen „Unternehmensprofil entfernen“ nicht?" },
    { t: "p", text: "Dann sind Sie meist **Administrator statt primärer Inhaber**, erst seit Kurzem Inhaber (Google verlangt dann einige Tage Wartezeit), mit dem **falschen Google-Konto** angemeldet – oder das Profil wurde nie von Ihnen beansprucht. Alle Gründe und Lösungen finden Sie in der Anleitung [Google-Unternehmensprofil löschen](/magazin/google-unternehmensprofil-loeschen)." },

    { t: "cta", title: "Lässt sich Ihr Firmeneintrag komplett entfernen?", text: "Geben Sie Ihren Firmennamen ein – wir finden Ihren Google-Eintrag und prüfen kostenlos, ob die vollständige Entfernung samt aller Bewertungen möglich ist.", btn: "Gratis-Check starten", href: "/?start=1", trust: ["Gratis-Check", "Keine Passwörter nötig", "Zahlung erst nach Erfolg"] },

    { t: "h2", id: "unternehmenskonto", text: "Google Unternehmenskonto / Business-Konto löschen ≠ Eintrag löschen", toc: "Konto ≠ Eintrag" },
    { t: "p", text: "Wer „Google Unternehmenskonto löschen“, „Google Geschäftskonto löschen“ oder „Google Business-Konto löschen“ sucht, meint oft zwei verschiedene Dinge – und genau hier passieren die meisten Missverständnisse:" },
    { t: "ul", items: [
      "**Das Konto** ist ein ganz normales Google-Konto (oft eine Firmen-Gmail-Adresse), mit dem Sie das Profil verwalten. Ein eigenes „Business-Konto“ mit separatem Löschknopf gibt es nicht.",
      "**Der Eintrag** ist das öffentliche Unternehmensprofil in Suche und Maps. Er existiert unabhängig von Ihrem Konto – Google betrachtet ihn als Information über einen realen Ort.",
    ] },
    { t: "warn", title: "Google-Konto gelöscht – Firma trotzdem bei Google?", text: "Ja, das ist normal. **Wenn Sie Ihr Google-Konto löschen, bleibt der Firmeneintrag bestehen** – mit allen Bewertungen. Er ist danach nur **nicht mehr beansprucht**: Sie haben keinen Zugriff mehr, und jeder kann die Inhaberschaft beantragen oder Änderungen vorschlagen." },
    { t: "p", text: "Dasselbe gilt für **Google Workspace** (früher G Suite): Kündigen Sie Workspace, enden E-Mail, Drive und Co. – Ihr Unternehmensprofil bleibt davon unberührt. Ist das Profil an eine Workspace-Adresse gebunden, verlieren Sie damit allenfalls den Zugriff, nicht den öffentlichen Eintrag." },
    { t: "tip", title: "Die richtige Reihenfolge", text: "Löschen Sie Ihr Google-Konto **erst, wenn der Firmeneintrag erledigt ist** – also entfernt, an einen Nachfolger übertragen oder an ein anderes Konto übergeben. Sonst haben Sie keinen Zugriff mehr auf den Eintrag, der weiter online steht." },

    { t: "h2", id: "dauerhaft-geschlossen", text: "Was „dauerhaft geschlossen“ bewirkt", toc: "„Dauerhaft geschlossen“" },
    { t: "p", text: "Viele Unternehmer markieren ihre Firma als dauerhaft geschlossen (Profil bearbeiten → Öffnungszeiten bzw. Öffnungsstatus) und erwarten, dass der Eintrag damit verschwindet. Das passiert nicht:" },
    { t: "ul", items: [
      "Der Eintrag bleibt mit Name, Adresse, Fotos und **allen Bewertungen** sichtbar – ergänzt um den Hinweis „Dauerhaft geschlossen“.",
      "Laut Google wird ein geschlossener Eintrag in den Ergebnissen **nur nach und nach seltener angezeigt** – eine feste Frist, nach der er verschwindet, nennt Google nicht.",
      "Bei Suchen nach Ihrem Firmennamen erscheint er häufig weiterhin – oft über Jahre.",
      "**„Vorübergehend geschlossen“** ist nur für Pausen gedacht (Umbau, Urlaub, Saisonbetrieb) und ändert an der Sichtbarkeit praktisch nichts.",
    ] },
    { t: "p", text: "Wichtig für Inhaber: Bewertungen bleiben unter Ihrem Firmennamen stehen und tauchen bei jeder Suche nach Ihnen auf – auch wenn Sie längst etwas anderes machen." },

    { t: "h2", id: "fremde-firma", text: "Firmeneintrag einer fremden oder alten Firma entfernen", toc: "Fremde oder alte Firma" },
    { t: "p", text: "Steht an Ihrer Adresse noch die Firma Ihres Vorgängers, ein Eintrag, den jemand anderes angelegt hat, oder eine längst aufgelöste alte Firma, können Sie Google um Entfernung bitten – das kann jeder, auch ohne Inhaberrechte:" },
    { t: "ol", items: [
      "Den Eintrag in Google Maps oder der Google-Suche öffnen.",
      "**Änderung vorschlagen** wählen → **Als geschlossen melden oder entfernen**.",
      "Den passenden Grund angeben, z. B. dauerhaft geschlossen, existiert nicht, umgezogen, Duplikat oder Spam.",
      "Absenden – Google prüft den Vorschlag und **entscheidet allein**.",
    ] },
    { t: "p", text: "Bei echten, ehemals bestehenden Firmen wird ein solcher Vorschlag oft nur in „Dauerhaft geschlossen“ umgewandelt; Eintrag und Bewertungen bleiben. Gehört die alte Firma **Ihnen**, beantragen Sie besser zuerst die Inhaberschaft und entscheiden dann, was mit dem Eintrag passiert. Ist es ein Duplikat Ihrer eigenen Firma, sollten Sie es zusammenführen lassen, statt vorschnell zu löschen. Mehr zu fremden, falschen und doppelten Einträgen: [Google-Maps-Eintrag löschen](/magazin/google-maps-eintrag-loeschen)." },
    { t: "warn", title: "Keine Einträge von Mitbewerbern", text: "Einträge fremder, bestehender Unternehmen entfernen wir nicht – auch nicht auf Wunsch. RapidRemove arbeitet ausschließlich im Auftrag des jeweiligen Inhabers." },

    { t: "h2", id: "sonderfaelle", text: "Firma geschlossen, verkauft, umgezogen, umbenannt oder Ruhestand – was tun?", toc: "Geschlossen, verkauft & Co." },
    { t: "p", text: "Ob Sie den Google-Eintrag löschen sollten, hängt davon ab, warum die Firma nicht mehr so existiert wie bisher:" },
    { t: "h3", text: "Firma geschlossen, Insolvenz oder Ruhestand" },
    { t: "p", text: "Hier wollen die meisten den Eintrag wirklich loswerden – vor allem, wenn Bewertungen unter Ihrem Namen stehen bleiben würden. „Dauerhaft geschlossen“ ist die kostenlose Minimallösung, der Eintrag bleibt aber sichtbar. Wer einen sauberen Abschluss möchte, lässt den Eintrag samt Bewertungen vollständig entfernen." },
    { t: "h3", text: "Firma verkauft oder übergeben" },
    { t: "p", text: "Dann **nicht löschen**, sondern die **Inhaberschaft an den Käufer übertragen**: Käufer als Inhaber hinzufügen, zum primären Inhaber machen, sich selbst entfernen. Eintrag und Bewertungen gehören zum Standort – für den Nachfolger sind sie oft bares Geld wert. Löschen ist nur sinnvoll, wenn beide Seiten bewusst einen Neustart wollen." },
    { t: "h3", text: "Firma umgezogen" },
    { t: "p", text: "Ändern Sie die **Adresse im bestehenden Profil**, statt es zu löschen. Google verlangt danach unter Umständen eine erneute Bestätigung; die Bewertungen ziehen mit um. Ein zweites Profil an der neuen Adresse riskiert dagegen eine Dublette, die Google zusammenführt oder sperrt." },
    { t: "h3", text: "Firma umbenannt oder neue Rechtsform" },
    { t: "p", text: "Ein neuer Name oder der Wechsel etwa vom Einzelunternehmen zur GmbH ist kein Grund zum Löschen: **Namen im Profil ändern**, ggf. neu bestätigen lassen – Bewertungen und Sichtbarkeit bleiben erhalten. Soll die Umbenennung ausdrücklich ein Neuanfang ohne alte Bewertungen sein, ist der Neustart der passende Weg (siehe unten)." },

    { t: "h2", id: "neustart", text: "Eintrag löschen oder Neustart?", toc: "Löschen oder Neustart" },
    { t: "p", text: "Einfach ein zweites Profil anzulegen funktioniert nicht, solange der alte Eintrag existiert: Google erkennt **zwei Profile für dieselbe Firma an derselben Adresse** und führt sie meist wieder zusammen – samt der alten Bewertungen – oder sperrt das neue Profil. Ein echter Neuanfang braucht deshalb zuerst die vollständige Entfernung des alten Eintrags. Danach haben Sie zwei Möglichkeiten:" },
    { t: "ul", items: [
      "**Selbst neu anlegen:** Nach der Entfernung (450 € zzgl. USt) warten Sie rund **48 Stunden** und legen dann selbst ein neues Unternehmensprofil an und bestätigen es.",
      "**Neustart-Paket:** Entfernung plus frisch angelegtes neues Profil für **850 € zzgl. USt** – Sie starten mit einem sauberen Eintrag und **0 Bewertungen**.",
    ] },
    { t: "warn", title: "Ehrlich gesagt", text: "Mit dem alten Eintrag verschwinden auch Ihre **guten Bewertungen und Fotos**. Wer überwiegend positive Bewertungen und nur ein, zwei Ausreißer hat, sollte sich gut überlegen, ob ein kompletter Neustart der richtige Schritt ist." },

    { t: "h2", id: "vergleich", text: "Alle Wege im Vergleich", toc: "Vergleich" },
    { t: "p", text: "„Google Unternehmen entfernen“, „Firmeneintrag löschen“, „Konto löschen“ – bei Google sind das sehr unterschiedliche Vorgänge. So wirken sie sich auf den öffentlichen Eintrag aus:" },
    { t: "table", head: ["Weg", "Eintrag sichtbar?", "Bewertungen", "Aufwand"], rows: [
      ["Unternehmensprofil entfernen (Profilinhalt und Administratoren)", "Ja, jetzt ohne Verwalter", "Bleiben sichtbar", "Wenige Minuten"],
      ["Als „dauerhaft geschlossen“ markieren", "Ja, mit Hinweis „Dauerhaft geschlossen“", "Bleiben sichtbar", "Wenige Minuten"],
      ["Google-Konto bzw. Unternehmenskonto löschen", "Ja, Eintrag wird herrenlos", "Bleiben sichtbar", "Wenige Minuten, Zugriff danach weg"],
      ["Google Workspace kündigen", "Ja, unverändert", "Bleiben sichtbar", "Gering"],
      ["Änderung vorschlagen → Als geschlossen melden oder entfernen", "Google entscheidet, meist ja", "Bleiben meist sichtbar", "Gering, Ergebnis ungewiss"],
      ["**Vollständige Entfernung mit RapidRemove**", "**Nein – aus Suche und Maps entfernt**", "**Alle mit entfernt**", "**Gratis-Check + Rechteübertragung, Zahlung erst nach Erfolg**"],
    ] },
    { t: "p", text: "Der Vergleich zeigt: Alle Wege, die Sie selbst gehen können, ändern Ihren Zugriff oder ein Label – den Eintrag selbst entfernen sie nicht." },

    { t: "cta", title: "Firmeneintrag samt Bewertungen entfernen lassen?", text: "Starten Sie den kostenlosen Check: Wir prüfen Ihren Eintrag und sagen Ihnen, ob die Entfernung möglich ist – unverbindlich.", btn: "Eintrag prüfen", href: "/?start=1", trust: ["Gratis-Check", "Keine Passwörter nötig", "Zahlung erst nach Erfolg"] },

    { t: "h2", id: "loeschen-lassen", text: "Google Eintrag löschen lassen: So läuft es mit RapidRemove", toc: "Eintrag löschen lassen" },
    { t: "p", text: "Wenn der Firmeneintrag wirklich weg soll, entfernt RapidRemove den **kompletten Google-Eintrag inklusive aller Bewertungen** – **im Auftrag des Inhabers, über die von Google vorgesehenen Verfahren**. Der Ablauf:" },
    { t: "ol", items: [
      "**Gratis-Check:** Sie geben Ihren Firmennamen ein, wir finden Ihren Eintrag und prüfen, ob die Entfernung möglich ist.",
      "**Inhaberrechte übertragen:** Sie fügen uns im Unternehmensprofil als Inhaber hinzu – Google verschickt dafür eine Einladung per E-Mail. **Keine Passwörter**, kein Zugriff auf Ihr Gmail, Ihr Google-Konto oder Google Ads.",
      "**Entfernung:** meist ca. **24 Stunden nach der Rechteübertragung**. Verlangt Google zusätzlich eine Verifizierung, kann es einige Tage länger dauern.",
      "**Zahlung erst danach:** Sie zahlen erst, wenn der Eintrag entfernt ist.",
    ] },
    { t: "h3", text: "Was kostet es, den Eintrag löschen zu lassen?" },
    { t: "ul", items: [
      "**450 € zzgl. USt pro Profil** – fällig nur nach erfolgreicher Entfernung.",
      "**Neustart (Entfernung + neues Profil):** 850 € zzgl. USt.",
      "**Mehrere Standorte oder Filialen:** Mengenrabatt auf Anfrage.",
      "**Optionales Schutz-Abo:** 29,90 € pro Monat, 299 € pro Jahr oder 990 € einmalig (jeweils zzgl. USt) – inklusive täglichem Monitoring und erneuter Entfernung, falls Dritte später einen neuen Eintrag für Ihren Standort anlegen.",
    ] },
    { t: "p", text: "Ihre Website, Ihre Platzierungen in der normalen Google-Suche und eventuelle Google-Ads-Kampagnen bleiben von der Entfernung unberührt." },

    { t: "h2", id: "grenzen", text: "Grenzen: was wir nicht machen", toc: "Grenzen" },
    { t: "ul", items: [
      "**Nur im Auftrag des Inhabers:** Wir arbeiten ausschließlich für Inhaber oder Geschäftsführer der jeweiligen Firma.",
      "**Keine Mitbewerber:** Einträge fremder Unternehmen entfernen wir nicht.",
      "**Keine öffentlichen Orte:** Sehenswürdigkeiten, Plätze, Behörden oder ähnliche öffentliche Orte sind ausgeschlossen.",
      "**Google entscheidet:** Die Entscheidung über jede Entfernung trifft allein Google. Deshalb zahlen Sie erst nach erfolgreicher Entfernung.",
      "**Keine einzelnen Bewertungen in Deutschland und Österreich:** Hier entfernen wir nur den kompletten Eintrag. Wer eine einzelne Bewertung loswerden will, findet die Wege in [Google Bewertung löschen lassen](/magazin/google-bewertung-loeschen-lassen).",
    ] },

    { t: "cta", title: "Bereit, Ihre Firma bei Google löschen zu lassen?", text: "Gratis-Check in wenigen Sekunden – Sie entscheiden danach in Ruhe.", btn: "Gratis-Check starten", href: "/?start=1", trust: ["Gratis-Check", "Keine Passwörter nötig", "Zahlung erst nach Erfolg"] },
  ],
  faq: [
    { q: "Wie lösche ich meine Firma bei Google?", a: "Einen Löschen-Button gibt es nicht. Als Inhaber gehen Sie im Unternehmensprofil auf ⋮ Mehr → Einstellungen für das Unternehmensprofil → Unternehmensprofil entfernen → Profilinhalt und Administratoren entfernen → Weiter → Entfernen. Damit endet aber nur Ihr Zugriff – der Eintrag und alle Bewertungen bleiben in Suche und Maps sichtbar. Die vollständige Entfernung übernimmt RapidRemove im Auftrag des Inhabers über die von Google vorgesehenen Verfahren." },
    { q: "Kann ich mein Unternehmen bei Google selbst löschen?", a: "Nur eingeschränkt. Sie können Ihre Verwaltung entfernen oder die Firma als dauerhaft geschlossen markieren. Beides löscht den öffentlichen Eintrag nicht – Name, Adresse und Bewertungen bleiben sichtbar." },
    { q: "Wie lösche ich mein Google Unternehmenskonto bzw. Business-Konto?", a: "Ein eigenes Business-Konto gibt es nicht: Das Unternehmensprofil wird über ein normales Google-Konto verwaltet, das Sie in den Google-Kontoeinstellungen löschen können. Klären Sie vorher, was mit dem Firmeneintrag passieren soll – nach dem Löschen des Kontos haben Sie keinen Zugriff mehr darauf." },
    { q: "Löscht das Löschen des Google-Kontos auch den Firmeneintrag?", a: "Nein. Der Eintrag bleibt mit allen Bewertungen online und ist danach nur nicht mehr beansprucht. Jeder kann dann Änderungen vorschlagen oder die Inhaberschaft beantragen. Dasselbe gilt für die Kündigung von Google Workspace." },
    { q: "Warum ist meine Firma nach dem Schließen noch bei Google?", a: "Weil „dauerhaft geschlossen“ kein Löschen ist. Google zeigt den Eintrag weiter an, nur mit dem Hinweis „Dauerhaft geschlossen“ – inklusive aller Bewertungen." },
    { q: "Wie lange bleibt eine geschlossene Firma bei Google sichtbar?", a: "Eine feste Frist gibt es nicht. Laut Google wird ein geschlossener Eintrag nur nach und nach seltener angezeigt; bei Suchen nach dem Firmennamen erscheint er oft noch sehr lange." },
    { q: "Wie entferne ich die Firma meines Vorgängers bei Google?", a: "Öffnen Sie den Eintrag, wählen Sie „Änderung vorschlagen“ → „Als geschlossen melden oder entfernen“ und geben Sie den passenden Grund an, etwa umgezogen oder existiert nicht. Google prüft den Vorschlag und entscheidet allein. Einträge fremder Firmen entfernen wir nicht – nur im Auftrag des jeweiligen Inhabers." },
    { q: "Was kostet es, den Google-Eintrag löschen zu lassen?", a: "Bei RapidRemove 450 € zzgl. USt pro Profil, fällig erst nach erfolgreicher Entfernung. Entfernung plus neues Profil (Neustart) kostet 850 € zzgl. USt." },
    { q: "Wie lange dauert die Entfernung?", a: "Meist ca. 24 Stunden nach der Rechteübertragung. Verlangt Google zusätzlich eine Verifizierung, kann es einige Tage länger dauern." },
    { q: "Brauchen Sie mein Passwort?", a: "Nein. Sie übertragen uns die Inhaberrechte direkt im Unternehmensprofil, Google bestätigt das per E-Mail-Einladung. Auf Ihr Gmail, Ihr Google-Konto oder Google Ads haben wir keinen Zugriff." },
    { q: "Kommen die Bewertungen nach der Entfernung zurück?", a: "Die Bewertungen hängen am entfernten Eintrag und verschwinden mit ihm. Ein neues Profil startet mit 0 Bewertungen. Verhindern lässt sich nicht, dass Dritte später einen neuen Eintrag für Ihren Standort anlegen – dafür gibt es das optionale Schutz-Abo mit täglichem Monitoring." },
    { q: "Kann ich nach dem Löschen neu anfangen?", a: "Ja. Nach der Entfernung können Sie nach rund 48 Stunden selbst ein neues Profil anlegen, oder Sie buchen den Neustart für 850 € zzgl. USt mit frisch angelegtem Profil. Solange der alte Eintrag existiert, führt Google ein neues Profil meist mit dem alten zusammen." },
    { q: "Ich habe mehrere Standorte – geht das auch?", a: "Ja. Jeder Standort ist ein eigenes Profil und wird einzeln entfernt. Für mehrere Standorte oder Filialen gibt es einen Mengenrabatt auf Anfrage." },
    { q: "Was ist, wenn ich die Firma verkauft habe oder umgezogen bin?", a: "Dann meist nicht löschen: Bei einem Verkauf übertragen Sie die Inhaberschaft an den Käufer, bei einem Umzug ändern Sie die Adresse im bestehenden Profil. Die Bewertungen bleiben so erhalten." },
    { q: "Ist das seriös?", a: "RapidRemove arbeitet ausschließlich im Auftrag des Inhabers, über die von Google vorgesehenen Verfahren, ohne Passwörter und mit Zahlung erst nach erfolgreicher Entfernung. Die Entscheidung trifft Google. Einzelne Bewertungen bieten wir in Deutschland und Österreich nicht an, Einträge von Mitbewerbern entfernen wir nicht." },
  ],
  related: [
    // Schlüssel für resolveRelated(); gerendert wird jeweils /magazin/<slug>.
    { label: "Google Unternehmensprofil löschen – Anleitung", url: "google-unternehmensprofil-loeschen-wie-geht-das" },
    { label: "Google-Maps-Eintrag löschen: eigene, fremde & doppelte Einträge", url: "google-maps-eintrag-loeschen" },
    { label: "Google Bewertung löschen lassen: Kosten & Methoden", url: "google-bewertung-loeschen-lassen" },
    { label: "Negative Google-Bewertung: Anwalt oder Agentur?", url: "negative-google-bewertung-anwalt-oder-technische-loeschung" },
  ],
};
export default article;
