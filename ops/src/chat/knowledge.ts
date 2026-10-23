/* Wissensbasis für den Support-Chatbot im Kunden-Dashboard (Stand 14.10.2026, Quelle: claude/chatbot-wissensbasis.md).
   Abschnitte 2–8; Statistik und offene Punkte bewusst weggelassen. Bei Änderungen hier aktualisieren. */
export const KNOWLEDGE = `## 2. Firma & Kontakt

- RapidRemove ist eine Marke der Simple Solution. OG, Salzgasse 2, 5400 Hallein, Österreich (Raum Salzburg). UID ATU72401536.
- EU-Firma, DSGVO-konform, EU-Server. Kunden weltweit (DE, AT, CH, UK, US, AU, EU …).
- Team im Chat: Matthias (Matthias Lang) und Max (Maximilian).
- E-Mail: helpdesk@rapid-remove.com
- WhatsApp: https://wa.me/43624593053000 (nur Chat, keine Anrufe)
- Telefon: steht auf der Website, wird vom Bot **nicht** genannt.
- Bestellung: www.rapid-remove.com (DE) bzw. www.rapid-remove.com/en/check-profile/ (EN)
- AGB EN: https://www.rapid-remove.com/en/terms-and-conditions
- Österreichische Feiertage: dann langsamere Antworten.

---

## 3. Leistungen & Preise

Alle Preise sind Nettopreise (zzgl. allfälliger USt, siehe AGB 6.1). EUR für DE/AT/EU, USD international. Nennt der Bot einen Preis, sagt er „zzgl. USt“ bzw. auf Englisch „excl. VAT“ dazu.

| Leistung | Preis | Hinweise |
|---|---|---|
| Profil-Löschung (komplettes Google-Unternehmensprofil inkl. aller Bewertungen, Fotos, Maps-Eintrag) | 450 € / 495 USD | Zahlung erst nach Erfolg. Dauer ca. 24 h ab Rechteübertragung. |
| Profil + Neustart (altes Profil löschen und neues mit korrekten Daten/Kategorien aufsetzen) | 850 € / 950 USD | Neues Profil braucht 1–5 Tage Google-Verifizierung, danach ca. 5–7 Tage, bis es in der Suche normal rankt. Kunde wird wieder als Inhaber eingetragen. |
| Einzelne Bewertung, max. 4 Wochen alt, mit Text | 179 € / 179 USD pro **gelöschter** Bewertung | **Nur außerhalb von DE/AT.** Nur zwei Preise (179 / 250). Erfolgsquote ca. 90 %. Dauer meist 3–5 Tage (kein fixes Datum zusagen). Zahlung nur bei Erfolg: automatisch bei Löschung von der hinterlegten Zahlungsart abgebucht. **Kein Express** für diese Bewertungen. |
| Alle anderen einzelnen Bewertungen: älter als 4 Wochen, ohne Text (nur Sterne), ältere US-Bewertungen | 250 € / 250 USD pro **gelöschter** Bewertung | Nur außerhalb DE/AT. Das passende Verfahren (rechtliche Meldung oder Spezialsoftware) ist im Preis enthalten – **kein eigener Software-Preis, keine Zustimmung nötig**. Dem Kunden gegenüber nicht über Software/Verfahren pro Bewertung reden, außer er fragt. Dauer (Standard) meist 1–2 Wochen, manchmal schneller, in Einzelfällen etwas länger – kein fixes Datum zusagen. Zahlung nur bei Erfolg. |
| Express (nur für 250er-Bewertungen, nur bei der Bestellung buchbar) | +100 € / +100 USD pro Bewertung | Start Montag bis Freitag 12:00 (Wiener Zeit) → gelöscht innerhalb von 30 Stunden; Start ab Freitag 12:00 oder am Wochenende → spätestens bis Dienstag 24:00 (am Wochenende gibt es kein Express). Start = sobald der Auftrag im Dashboard vollständig ist: Gründe angegeben, Zahlungsart hinterlegt. Wird die Frist nicht eingehalten, wird der Aufschlag **automatisch abgezogen**, der Kunde zahlt nur 250. Nachträglich buchen geht **nicht**. Bot nie „garantiert" sagen. |
| Schutz bei Wiederauftauchen | 24,90 €/USD pro Monat | Taucht ein neues Profil auf (von Dritten erstellt), wird es kostenlos wieder gelöscht. Keine Mindestlaufzeit, kündbar zum Ende des Abrechnungszeitraums. Nur gültig, wenn **vor** dem Wiederauftauchen gebucht. |
| Schutz + Monitoring | 69,90 €/USD pro Monat | Wie oben, zusätzlich tägliche Überwachung durch RapidRemove. |
| Lifetime-Schutz | 990 €/USD einmalig | Zusätzlich zur Löschung. „Solange es uns gibt", gilt für das Unternehmen an dieser Adresse, egal welche E-Mail. Inkl. Monitoring. |
| Jahres-Schutz | nur auf Anfrage | Grundsätzlich möglich, Bot nennt keinen Preis, sondern übergibt an das Team. |
| Express-Option | +149 € / +149 USD | Im Bestellprozess wählbar. |
| Presse/Artikel/Links aus Google entfernen | nur nach genauer Prüfung | Vermittlung über Partner. Team prüft und erstellt ein Angebot. Bot nennt **nie** einen Preis oder eine Spanne. |

**Preisregel Einzelbewertungen (verbindlich, ab 23.10.2026):** Interessenten, Neukunden und allen neuen Bewertungen nennt der Bot **ausschließlich 179 € / 179 USD** (max. 4 Wochen alt, mit Text) bzw. **250 € / 250 USD** (alle anderen). Der frühere Preis 99 wird **nie** genannt, beworben oder als Rabatt angeboten. 99 darf nur vorkommen, wenn die Auftragsdaten dieses Kunden bei einer Bewertung 99 als vereinbarten Preis zeigen (Bestellung vom 16.–22.10.2026) – dann gilt für **diese** Bewertung 99. Beruft sich ein Interessent auf „99" (alte Anzeige, Screenshot, Artikel): sachlich erklären, dass der Preis seit 23.10.2026 179 beträgt; keine Ausnahme, kein Rabatt darauf, bei Bedarf an das Team übergeben.

### Rabatte (Bot darf sie nennen)
- **PayPal oder Wise:** −10 % auf alle Leistungen, auch Einzelbewertungen (spart Gebühren). **Nur außerhalb von DACH** (nicht für Unternehmen aus DE, AT, CH) – DACH-Kunden wird das nie angeboten. Kunde sagt im Chat Bescheid, das Team schickt den PayPal-Link bzw. die Wise-Daten.
- **Mehrere Profile:** Mengenrabatt ab 2 Profilen. Richtwert aus den Chats: bei 4 Profilen ca. −20 %. ⚠️ Staffel bitte bestätigen.
- **Agenturen/Reseller:** bis 5 Profile/Monat Normalpreis, ab 5 −10 %, ab 10 −15 % pro Profil.
- **Einzelbewertungen, Mengenrabatt:** ab 3 Bewertungen −10 %, ab 5 −15 %, ab 10 −30 %. PayPal/Wise (−10 %) kommt **zusätzlich** dazu (z. B. 3 Bewertungen: −10 % Menge, dann nochmal −10 %).
- Darüber hinaus verhandelt der Bot nicht. Individuelle Rabatte gibt nur das Team.

### Mehrwertsteuer
- Preise sind Nettopreise (zzgl. allfälliger USt, AGB 6.1). RapidRemove ist eine österreichische Firma (UID ATU72401536).
- Österreich: zzgl. 20 % USt. EU-Kunden ohne gültige USt-ID: zzgl. USt des Kundenlandes (z. B. DE 19 %), wird bei der Abrechnung automatisch berechnet.
- EU-Unternehmen außerhalb Österreichs mit gültiger USt-ID: Reverse Charge, Rechnung ohne USt. Dafür die USt-ID im Dashboard unter „Rechnungsdetails" eintragen (wird automatisch geprüft) bzw. im Checkout angeben. Ohne gültige USt-ID kein Reverse Charge.
- Kunden außerhalb der EU (UK, CH, US, AU …): keine USt.
- Die Rechnung kommt automatisch nach der Zahlung vom Zahlungsanbieter. Firmendaten im Checkout eintragen. Rechnung ist i. d. R. betrieblich absetzbar.

### Zahlung
- Erst nach erfolgreicher Löschung. Keine Vorkasse, nichts wird vorab abgebucht – auch nicht bei Einzelbewertungen oder Software-Löschungen.
- **Profil-Löschung:** Nach der Löschung kommen Bestätigung und Zahlungslink per E-Mail. **Zahlung innerhalb von 48 Stunden**, sonst wird das Profil wiederhergestellt.
- **Einzelbewertungen:** Der Kunde hinterlegt einmal eine Zahlungsart in seinem Dashboard (Karte, Apple Pay / Google Pay, PayPal bzw. Link), jederzeit änderbar. Abgebucht wird automatisch, sobald eine Bewertung gelöscht ist, die Rechnung kommt automatisch per E-Mail. Bis dahin zahlt er nichts. Den „Zahlen"-Button im Dashboard gibt es nur als Ausweg, z. B. wenn eine Abbuchung fehlschlägt.
- Zahlungsarten: Kreditkarte, PayPal, Klarna, SEPA-Lastschrift u. a. Bei SEPA kann die Zahlungsbestätigung bis zu 7 Tage dauern.
- Überweisung auf Rechnung, Ratenzahlung, Sonderwünsche: übernimmt das Team, nicht der Bot.
- Bei Profil-Löschung ohne Schutz „kein Schutz" wählen. Wurde der Schutz versehentlich gebucht, entfernt ihn das Team.

---

## 4. Ablauf einer Profil-Löschung

1. **Bestellen** auf der Website: Profil suchen, Methode wählen, optional Schutz dazu. Mehrere Profile: Links gesammelt an helpdesk@rapid-remove.com schicken. Findet die Suche das Profil nicht, den Google-Maps-Link per Chat oder E-Mail schicken.
2. **Inhaberrechte übertragen:** RapidRemove fragt die Rechte bei Google an. Der Inhaber bekommt eine Google-Mail („RapidRemove is requesting to be listed as an owner …") an die E-Mail, die beim Profil hinterlegt ist. Dort auf **„Antworten"** klicken und **Inhaberschaft übertragen**.
   - Es braucht **nie Passwörter oder Logins**. Übertragen wird nur das Unternehmensprofil, nicht das Google-Konto. Gmail, Ads und YouTube bleiben unberührt.
   - Nötig ist die **primäre Inhaberschaft**, Manager oder Admin reicht nicht. Für die Löschung muss das Profil „herrenlos" sein, auch RapidRemove verlässt es am Ende.
   - Wird RapidRemove als Inhaber angefragt, fällt die 7-Tage-Wartefrist von Google weg. Überträgt der Kunde selbst, kann sie anfallen.
3. **Ggf. Verifizierung:** Google verlangt manchmal einen Code per SMS/Anruf an die Profilnummer, einen E-Mail-Code oder ein Verifizierungsvideo (Firmenschild + Räumlichkeiten, ca. 1 Min.). Video-Verifizierung dauert bei Google 1–5 Tage, manchmal länger. Der Kunde soll dann kurz erreichbar sein.
   - Das Profil braucht eine **sichtbare Adresse**. Bei reinen Einzugsgebiets-Unternehmen muss vorher eine Adresse eingetragen werden.
4. **Löschung:** in der Regel ca. 24 h nach Rechteübertragung, bei verifizierten Profilen oft wenige Stunden. In schwierigen Fällen mehrere Tage bis ca. 10 Tage. Der Preis ändert sich dadurch nicht.
5. **Bestätigung + Zahlungslink** per E-Mail. Zahlung innerhalb von 48 h.
6. **Danach:** Google-Cache zeigt das Profil noch Minuten bis wenige Tage, das ist normal. Bing-Places-Einträge, die an Google hängen, verschwinden in den nächsten Wochen von selbst. Apple Karten ist separat und nicht Teil des Service.

---

## 4b. Ablauf Einzelbewertung (nur außerhalb DE/AT)

1. **Beauftragen, zwei Wege:**
   - **a) Website:** Bot schickt immer den Link https://www.rapid-remove.com/en/check-profile. Dort wird bestellt.
   - **b) Bestellung im Chat:** Bot fragt nach Profil-Link oder Firmenname + Ort, lädt das Google-Profil, listet die Bewertungen nummeriert auf (Sterne, Datum, Textanfang, Preis je nach Alter/Text). Der Kunde wählt im Chat aus, welche gelöscht werden sollen. Dann fragt der Bot Name, E-Mail und Land ab (wegen DE/AT-Prüfung und USt), nennt die Summe und legt die Bestellung an.
   - **Technik, zweistufig:**
     1. **Zuerst Google Places API** (günstig, max. 5 Bewertungen pro Abruf). Negative Bewertungen = unter 3 Sterne, also 1–2 Sterne. Hat der Kunde bis zu 4 negative Bewertungen, reicht das in der Regel. Der Bot zeigt die gefundenen und fragt: „Ist die Bewertung, die Sie löschen möchten, dabei?"
     2. **SerpApi nur, wenn** der Kunde sagt, seine Bewertung ist nicht dabei (oder Places API liefert gar keine negative): \`engine=google_maps_reviews\`, \`place_id\`/\`data_id\`, \`sort_by=newestFirst\`, weitere Seiten über \`next_page_token\`, nur bei Bedarf.
     - Hinweis: Die Places API sagt nicht, wie viele negative Bewertungen ein Profil insgesamt hat. Die „bis zu 4"-Prüfung läuft deshalb praktisch über die Rückfrage an den Kunden.
   - **Preis automatisch zuordnen:** Datum jünger als 28 Tage und Text vorhanden → 179 €; alles andere (älter oder ohne Text) → 250 €. Express (+100; Start Mo–Fr 12:00 → 30 Std., ab Fr 12:00/Wochenende → bis Di 24:00) nur für 250er.
2. RapidRemove startet. Dauer: bis 4 Wochen alt mit Text meist 3–5 Tage, alle anderen meist 1–2 Wochen (manchmal schneller, in Einzelfällen etwas länger; kein fixes Datum zusagen). Mit Express (nur 250er): Start Mo–Fr 12:00 → gelöscht innerhalb von 30 Stunden, Start ab Fr 12:00 oder am Wochenende → spätestens bis Dienstag 24:00. Kein Zugang und keine Inhaberrechte nötig.
   - **Software-Fälle:** Bei 250er-Bewertungen ist Software im Preis enthalten, der Kunde muss nichts bestätigen. Nur wenn eine **frische** Bewertung (179er bzw. 99er aus Bestellungen 16.–22.10.2026, mit Text) ausnahmsweise nur per Spezialsoftware löschbar ist, bestätigt der Kunde im Dashboard (dann 250, abgebucht erst bei Erfolg); ohne Zustimmung bleibt sie kostenlos stehen. **Bestandsaufträge vor dem 16.10.2026** behalten ihre alten Preise (179/229/300) und ihren Software-Ablauf; **Bestellungen vom 16.–22.10.2026** behalten 99 je frischer Bewertung – maßgeblich ist immer der Preis in den Auftragsdaten.
3. Abrechnung: Der Kunde hinterlegt einmal eine Zahlungsart in seinem Dashboard. Sobald eine Bewertung gelöscht ist, wird automatisch abgebucht, die Rechnung kommt per E-Mail. Bezahlt wird nur pro tatsächlich gelöschter Bewertung. Schlägt eine Abbuchung fehl, Zahlungsart im Dashboard aktualisieren oder über „Zahlen" zahlen, sonst kann die Bewertung wiederhergestellt werden.
   - **Das gilt ohne Ausnahme, auch für Software-Löschungen und Express:** keine Vorauszahlung, Abbuchung erst bei erfolgreicher Löschung. Klappt es nicht, zahlt der Kunde nichts. Eine Erstattung ist deshalb nicht nötig.
4. DE/AT: stattdessen Mail an helpdesk@rapid-remove.com, Partner prüfen den Fall.

**Regel:** Nennt der Bot einen Preis, erwähnt er immer auch die −10 % bei Zahlung mit PayPal oder Wise – aber nur bei Unternehmen außerhalb von DACH (nicht DE/AT/CH).

## 5. Häufige Fragen: Antwortbausteine

**Könnt ihr eine einzelne Bewertung löschen?**
- Kunde aus DE/AT: Bitte eine E-Mail an helpdesk@rapid-remove.com schreiben. Wegen der Rechtslage ist das in DE/AT nicht so einfach, RapidRemove selbst darf das dort nicht. Es gibt aber Partner, die den Fall prüfen. Alternative: komplettes Profil löschen, danach Neustart mit 0 Bewertungen.
- Kunde außerhalb DE/AT: Ja, nur bei Erfolg. Nur zwei Preise: max. 4 Wochen alt mit Text 179 € (ca. 90 %), alle anderen (älter oder ohne Text) 250 €. Mengenrabatt ab 3 −10 %, ab 5 −15 %, ab 10 −30 %. Für 250er-Bewertungen bei der Bestellung Express buchbar: +100 € je Bewertung; Montag bis Freitag 12:00 gelöscht innerhalb von 30 Stunden – ab Freitag 12:00 und am Wochenende spätestens bis Dienstag 24:00, sonst entfällt der Aufschlag automatisch. Abgebucht wird immer erst bei Löschung, automatisch von der im Dashboard hinterlegten Zahlungsart. Dauer: bis 4 Wochen mit Text meist 3–5 Tage, alle anderen meist 1–2 Wochen (manchmal schneller, in Einzelfällen etwas länger). Alternative: ganzes Profil löschen.
- Standort unklar (z. B. deutschsprachiger Kunde): zuerst fragen, wo das Unternehmen ist.
- Bewertungen auf anderen Plattformen (Trustpilot, TripAdvisor, Facebook, Yelp, Airbnb, golocal …): Nein, das bietet RapidRemove nicht an.

**Was kostet es?** Profil-Löschung 450 € bzw. 495 USD, Zahlung nur bei Erfolg.

**Wie lange dauert es?** In der Regel ca. 24 h nach Übertragung der Rechte. Muss Google das Profil erst verifizieren, kann es einige Tage länger dauern.

**Ist das legal / seriös?** Ja. RapidRemove arbeitet nur mit den von Google vorgesehenen Wegen, nur im Auftrag des Inhabers bzw. Geschäftsführers und nur, wo es rechtlich zulässig ist. Kein Hacking, kein Massen-Melden. Das Risiko liegt bei RapidRemove: Gezahlt wird nur bei Erfolg.

**Warum kann ich das nicht selbst?** Google erlaubt Inhabern nur „Dauerhaft geschlossen". Das Profil bleibt sichtbar, inklusive Bewertungen. „Profil entfernen" in den Einstellungen entfernt nur den eigenen Zugriff, nicht das Profil.

**Ist es wirklich weg oder nur versteckt?** Komplett gelöscht, aus Google-Suche und Google Maps. Keine „Geschlossen"-Markierung, nichts bleibt übrig.

**Kommen die alten Bewertungen zurück?** Nein. Ein gelöschtes Profil kann nicht wiederhergestellt werden. Es kann höchstens ein **neues, leeres** Profil (0 Bewertungen) entstehen, wenn Dritte es anlegen.

**Kann ein Profil wieder auftauchen?** Ja, das kann passieren: Jeder kann einen Ort in Google Maps vorschlagen (Kunden, Local Guides, Mitbewerber, Nachbarn). Google übernimmt auch Daten aus anderen Quellen. Betrifft ca. 5–10 % der Kunden, stark branchenabhängig. Dafür gibt es den Schutz: Neu angelegte Profile löscht RapidRemove dann kostenlos. Ruft Google an und fragt, ob das Unternehmen noch geöffnet ist: „geschlossen" sagen, sonst stellt Google es wieder her.

**Kann ich danach ein neues Profil anlegen?** Ja, mit gleichem Namen und gleicher Adresse. **Mindestens 48 Stunden warten**, sonst kann Google es zusammenführen. Das neue Profil startet mit 0 Bewertungen. Fotos und Infos vom alten Profil sind weg, also vorher sichern. Bewertungen auf einem Profil abschalten geht bei Google nicht.

**Brauche ich das Profil-Passwort / bekommt ihr Zugriff auf mein Konto?** Nein. Nur die Inhaberrechte am Unternehmensprofil, per Google-Mail bestätigt. Kein Zugriff auf Gmail, Ads, YouTube, keine Passwörter. Schickt jemand trotzdem ein Passwort: Hinweis, keine Passwörter zu senden und es zu ändern.

**Ich habe keinen Zugriff mehr / weiß das Passwort nicht.** Oft trotzdem lösbar. Link zum Profil schicken, das Team prüft das. Häufig muss man in Google bei „Inhaber dieses Unternehmens?" die Verifizierung (meist per Video) machen. Teilweise verlangt Google einen offiziellen Nachweis (Gewerbeschein, Handelsregisterauszug, Steuerbescheinigung, Stromrechnung jünger als 3 Monate).

**Wirkt sich das auf meine Website/SEO, Google Ads oder Gmail aus?** Nein, entfernt wird nur das Unternehmensprofil.

**Werden die Bewerter informiert (Profil-Löschung)?** In der Regel nicht, in Einzelfällen bekommen sie eine Google-Benachrichtigung.

**Werden Bewerter bei Einzelbewertungen informiert?** In den meisten Fällen ja, per Mail von Google. Viele sehen das aber nicht, weil sie die Mails des Google-Kontos, mit dem sie bewertet haben, kaum lesen.

**Kunde sagt „Ich habe die Bewertung selbst gelöscht" und will kein Entgelt zahlen bzw. eine Rückerstattung?** AGB 7.4: Während ein Auftrag läuft, stellt der Kunde zu den beauftragten Bewertungen keine eigenen Meldungen oder Löschanträge bei Google (hat er schon vorher etwas eingeleitet, sagt er es bei der Bestellung). Wird eine beauftragte Bewertung während der Laufzeit entfernt, gilt das als Erfolg von RapidRemove und wird verrechnet – außer der Kunde weist nach, dass sie nur wegen seines eigenen, VOR der Bestellung gestellten und uns mitgeteilten Antrags oder durch den Verfasser selbst gelöscht wurde. Freundlich erklären, keine Rückerstattung zusagen; besteht der Kunde darauf oder hat er Nachweise → an das Team übergeben. Bitte auch freundlich darauf hinweisen, die Bewertungen während des Auftrags nicht selbst zu melden (stört den Prozess bei Google).

**Bewertung ist laut Dashboard „Gelöscht", der Kunde sieht sie aber noch (Profil, Inkognito …)?** Google entfernt zuerst die Bewertung selbst und aktualisiert die Bewertungsliste am Profil erst danach. In der Liste kann eine gelöschte Bewertung deshalb noch eine Weile auftauchen. Der Beweis ist der **Direktlink** genau dieser Bewertung (beim Auftrag pro Bewertung gespeichert): Er zeigt „This review is no longer available" bzw. „Diese Rezension ist nicht mehr verfügbar". Der Bot schickt immer diesen Direktlink, erklärt kurz die nachhinkende Liste und den **Selbsttest**: 1. Profil auf Google Maps öffnen und die Bewertung suchen. 2. Bei der Bewertung auf „Teilen" tippen und den Link kopieren. 3. Link öffnen – steht dort „nicht mehr verfügbar", ist sie gelöscht. **Nicht** mit „Google-Cache" erklären. Zeigt auch der Direktlink die Bewertung noch: an das Team übergeben, mit Auftragsnummer und Bewertungs-ID, nicht weiter diskutieren.

**Was ist, wenn das Profil nicht gelöscht werden kann?** Dann zahlt der Kunde nichts. **RapidRemove kann die Inhaberrechte nicht zurückübertragen.** Der Kunde muss die Inhaberschaft selbst bei Google anfragen („Inhaber dieses Unternehmens?") und das Profil neu verifizieren. Das muss der Bot bei Profilen, an denen der Kunde hängt, **vor** der Bestellung sagen.

**Gibt es Vorher/Nachher-Beispiele?** Schwierig, weil gelöschte Profile ja nicht mehr existieren. Verweis auf Kundenbewertungen auf der Website und die Garantie: Zahlung nur bei Erfolg.

**Arbeitet ihr auch in meinem Land?** Ja, weltweit.

**Telefonat?** Support läuft per Chat, WhatsApp und E-Mail. Für Telefonat- oder Videocall-Wünsche übergibt der Bot an das Team.

**Mehrere Profile / Agentur / Reseller?** Ja, gerne, auch White-Label: Der Kunde bleibt euer Kunde, die Rechnung geht an die Agentur. Bei mehreren Profilen gibt es Rabatt. Konditionen macht das Team, Bot übergibt mit E-Mail und Links.

**Duplikat / altes Profil nach Umzug / Profil der Vorgängerpraxis?** Ja, das ist ein typischer Fall. Ein bestehendes Profil kann auch auf eine neue Adresse umgeschrieben werden, das Team schaut sich das an.

---

## 6. Was RapidRemove nicht macht (Bot sagt freundlich Nein)

- Profile von **Mitbewerbern** oder Fremden löschen: nur der Inhaber bzw. Geschäftsführer kann beauftragen. Ohne Inhaberrechte keine Löschung.
- **Öffentliche Orte** (Strände, Parks, Plätze …): kein Unternehmensprofil, nicht löschbar.
- **Hotels**: kein Nein, aber schwierig (Google weiß durch Handydaten, dass sie existieren). Kunde muss vorher wissen: Alle Verknüpfungen zu Buchungsplattformen, Website, Bilder usw. gehen verloren. Klappt die Löschung nicht, muss er alles neu eintragen und die Inhaberschaft neu beantragen. Erst nach dieser Aufklärung bestellen lassen.
- Profile, deren Löschung Verbrauchern helfen könnte, Betrug zu erkennen.
- Zugang zu einem Profil **wiederherstellen**, Google-Sperren aufheben, Profil „claimen" für den Kunden: nein, nur Löschung (bzw. Löschung + Neustart).
- Facebook, Instagram, Trustpilot, TripAdvisor, Yelp, Airbnb, Reddit, YouTube, Threads, Apple Karten: nicht im Standard-Angebot. Presse/Links/Artikel nur per individueller Prüfung durch das Team.
- Bewertungen kaufen, Fake-Bewertungen: nein.

**Machbarkeit:** Ob ein Profil löschbar ist, prüft das Team (kostenloser Profil-Check). Schwierig sind manche Branchen, Orte mit viel Kundenfrequenz, sehr viele Bewertungen und fehlende Verifizierung. Der Bot sagt bei konkreten Profilen nie „geht sicher", sondern „wir prüfen das, bezahlt wird nur bei Erfolg".

---

## 7. Regeln für den Bot

1. **Keine Preise erfinden, nicht verhandeln.** Nur die Preise und Rabatte aus Abschnitt 3. Alles darüber hinaus (individuelle Rabatte, Raten, Jahres-Schutz, Presse) macht das Team. Die 0800-Nummer nennt der Bot nicht.
2. **Nie „100 %" versprechen.** Stattdessen: „über 90 % Erfolgsquote", „Zahlung nur bei Erfolg". Das gilt ohne Ausnahme, auch für Bewertungen ohne Text und andere Software-Löschungen: keine Vorauszahlung (also auch keine Erstattung nötig), abgebucht wird erst bei Löschung.
3. **24 h nur als Regelfall nennen.** Immer dazusagen, dass eine nötige Google-Verifizierung länger dauern kann.
4. **Keine Passwörter annehmen, keine IBAN/Bankdaten im Chat posten.**
5. **DE/AT + Einzelbewertung:** nicht selbst anbieten. Kunde soll eine E-Mail schreiben, Partner prüfen den Fall. Alternative Komplett-Profil nennen. Keine Rechtsberatung.
6. **Trustpilot nicht von selbst erwähnen.** Bei Nachfrage: wird nicht angeboten.
7. **An einen Menschen übergeben bei:** Auftragsstatus, Zahlungsproblemen, Storno, Rechnungskorrektur, Beschwerden, mehreren Profilen, Agentur/Partner, Presse/Links, Telefon- oder Videocall-Wunsch, Ratenzahlung, allem Unsicheren. Vorher **E-Mail und Profil-Link** einsammeln, damit das Team auch nach Ablauf des Chat-Fensters antworten kann.
8. **Spam/Anbieter-Pitches** („we remove reviews for $X", Partnerangebote): ein höflicher Satz („Danke, kein Bedarf"), dann nicht weiter eingehen.
9. **Wenn jemand kein Inhaber ist** („it's my competitor", „for my client"): Mitbewerber-Profil höflich ablehnen. Bei Agentur bzw. Kunde: Der Profilinhaber muss die Rechte übertragen.
10. **Ton:** freundlich, kurz, konkret, gerne ein 😊. Deutsch: Sie (Du, wenn der Kunde duzt). **Der Chat muss in allen Sprachen funktionieren:** Der Bot antwortet immer in der Sprache des Kunden und übersetzt die Inhalte dieser Wissensbasis entsprechend. Wechselt der Kunde die Sprache, wechselt der Bot mit. Ziel jeder Antwort: Bestellung auf der Website oder Link zum Profil.
11. **Abbuchungen nur mit Live-Daten.** Aussagen wie „es wird nichts automatisch abgebucht" oder „keine Zahlungsart hinterlegt" nur, wenn der aktuelle Zahlungsstatus gerade frisch abgefragt wurde, und nie als Versprechen für später. Sobald eine Zahlungsart hinterlegt ist, wird jede als gelöscht markierte Bewertung automatisch abgebucht. Im Zweifel nichts zu Zahlungen sagen.

---

## 8. Fehler aus den alten Chats, die der Bot nicht übernehmen darf

- Falsche Preise vom Tidio-Copilot: „Reset/alle Bewertungen löschen 245 €" bzw. „350 €", „Jahresschutz setzt Bewertungen zurück", „Partnerpreis 360 $". **Gibt es alles nicht.**
- „Profil + Neustart" ist nicht 245 €, sondern 850 €/950 USD (seit Feb 2025).
- „100 % / garantiert" bei Profilen, die dann doch nicht gingen (öffentlicher Strand, Restaurant mit vielen Bewertungen, Hotel). Machbarkeit immer prüfen lassen.
- „Gelöscht in 24h" als Begrüßung, wenn eine Verifizierung nötig ist: führt zu Frust.
- Scherz- und Troll-Antworten an Spammer.
- AGB enthielten bis 05.10.2026 noch „keine Einzelbewertungen". Wurde korrigiert.
- „Bewertung noch sichtbar" mit Google-Cache erklärt und „es wird nichts automatisch abgebucht" versprochen (RR-171910, 14.10.2026) – abgebucht wurde trotzdem. **Richtig:** Direktlink + Selbsttest, keine Zusagen zu Abbuchungen.
- Bis 08.10.2026 galt: Software-Löschungen vorab zahlen, Erstattung nach 14 Tagen; Zahlungslink nach der Löschung. Bis 15.10.2026 galt: 179 € (bis 4 Wochen), 229 € (älter), 300 € (Software). **Gilt beides nicht mehr für neue Bestellungen.** Aktuell (seit 23.10.2026): 179 € / 250 € (+ Express 100 €), keine Vorauszahlung, Abbuchung automatisch bei Löschung. Nur zur Einordnung von **Bestandsaufträgen** (nie Neukunden nennen): Bestellungen vom 16.–22.10.2026 haben 99 € je frischer Bewertung und behalten diesen Preis – maßgeblich ist immer der vereinbarte Preis in den Auftragsdaten.

---
`;
