"use client";
/* RapidRemove — AGB + Widerrufsbelehrung (deutsche Fassung).
   Quelle: AGB-/Widerrufs-Entwurf (Juni 2026). Die ursprünglich im Entwurf markierten
   [PRÜFEN]-Stellen sind redaktionell aufgelöst; die anwaltliche Prüfung vor dem
   Go-Live (FAGG/KSchG, ECG, Erfolgshonorar, Haftung, Preisauszeichnung) steht aus.
   Lokalisierte Fassungen folgen erst nach anwaltlicher Freigabe der DE-Fassung —
   bis dahin sind /agb und /widerruf bewusst nur auf Deutsch verfügbar (Vertragssprache
   ist gemäß Punkt 12.3 Deutsch). */
import React from "react";
import { Shell } from "@/components/Legal";
import { asset } from "@/lib/base";

const C = {
  legal: "Simple Solution. OG",
  street: "Salzgasse 2",
  city: "5400 Hallein",
  country: "Österreich",
  uid: "ATU72401536",
  fbn: "FN 470700g",
  court: "Landesgericht Salzburg",
  email: "helpdesk@rapid-remove.com",
  phone: "+43 6245 9305300",
  phoneHref: "+4362459305300",
};

/* ────────────────────────── AGB ────────────────────────── */
function AgbBody() {
  return (
    <React.Fragment>
      <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>
      <p className="legal-sub">
        der {C.legal}, {C.street}, {C.city}, {C.country} ({C.fbn}, {C.court}; UID {C.uid}),
        nachfolgend <strong>„RapidRemove"</strong> oder <strong>„wir"</strong>.
      </p>

      <h2>1. Geltungsbereich</h2>
      <p>1.1. Diese AGB gelten für alle Verträge zwischen RapidRemove und ihren Kunden über die auf rapid-remove.com angebotenen Leistungen.</p>
      <p>1.2. Kunde kann sowohl Unternehmer im Sinne des § 1 KSchG als auch Verbraucher sein. Soweit einzelne Bestimmungen nur für Verbraucher oder nur für Unternehmer gelten, ist dies ausdrücklich angeführt. Unser Angebot richtet sich primär an Unternehmer (Inhaber bzw. Verantwortliche von Google-Unternehmensprofilen).</p>
      <p>1.3. Abweichende Geschäftsbedingungen des Kunden gelten nur, wenn wir ihnen ausdrücklich schriftlich zugestimmt haben.</p>

      <h2>2. Leistungen</h2>
      <p>2.1. <strong>Profil-Löschung („Remove"):</strong> Dauerhafte Entfernung eines Google-Unternehmensprofils (Google Business Profile / Google Maps-Eintrag) einschließlich aller damit verbundenen Bewertungen aus der öffentlichen Anzeige der Google-Dienste. Die Entfernung erfolgt ausschließlich über offizielle, von Google vorgesehene Prozesse und Schnittstellen.</p>
      <p>2.2. <strong>Profil-Löschung + Neuanlage („Remove + Restart"):</strong> Leistung gemäß Punkt 2.1 zuzüglich Einrichtung eines neuen Google-Unternehmensprofils mit den vom Kunden bereitgestellten korrekten Unternehmensdaten.</p>
      <p>2.3. <strong>Reputations-Verdrängung:</strong> Laufende Maßnahmen mit dem Ziel, vom Kunden benannte negative Suchergebnisse in der Google-Suche durch andere Inhalte zu verdrängen. Es handelt sich um ein <strong>Bemühen ohne Erfolgsgarantie</strong>; ein bestimmtes Ranking-Ergebnis wird nicht geschuldet. Details (Laufzeit, Umfang, Reporting) ergeben sich aus dem jeweiligen Angebot.</p>
      <p>2.4. <strong>Presse-Auslistung (Vermittlung):</strong> RapidRemove <strong>vermittelt</strong> den Kontakt zu einer Partnerkanzlei und unterstützt bei der Antragstellung. Die rechtliche Prüfung und Vertretung erfolgt ausschließlich durch die Partnerkanzlei; ein gesonderter Vertrag kommt zwischen Kunde und Partnerkanzlei zustande. RapidRemove erbringt <strong>keine Rechtsberatung</strong> und schuldet keinen Auslistungserfolg.</p>
      <p>2.5. <strong>Keine Löschung einzelner Bewertungen:</strong> Gegenstand der Leistung gemäß 2.1/2.2 ist stets die Entfernung des gesamten Profils samt aller Bewertungen, nicht die Entfernung einzelner Rezensionen.</p>
      <p>2.6. <strong>Keine Rechtsdienstleistung:</strong> Sämtliche Leistungen von RapidRemove sind technisch-organisatorischer Natur. RapidRemove erbringt keine Rechtsberatung und keine Vertretung vor Behörden oder Gerichten.</p>

      <h2>3. Vertragsabschluss</h2>
      <p>3.1. Der kostenlose Lösch-Check auf unserer Website ist unverbindlich und stellt kein Angebot dar.</p>
      <p>3.2. Der Vertrag kommt zustande, wenn der Kunde unser Angebot (per Website-Bestellstrecke oder E-Mail) annimmt und wir die Beauftragung bestätigen, spätestens jedoch mit Beginn der Leistungserbringung.</p>
      <p>3.3. <strong>Berechtigung:</strong> Der Kunde sichert zu, dass er zur Verfügung über das betreffende Unternehmensprofil berechtigt ist (als Inhaber des Unternehmens oder mit dessen ausdrücklicher Vollmacht). Die Beauftragung der Löschung fremder Profile ohne Berechtigung ist untersagt; der Kunde hält RapidRemove insoweit schad- und klaglos.</p>

      <h2>4. Mitwirkungspflichten des Kunden</h2>
      <p>4.1. Der Kunde bestätigt das zu entfernende Profil und erteilt die erforderliche Bearbeitungsberechtigung für das Unternehmensprofil. Ein Zugriff auf das Google-Konto, Gmail, Google Ads oder persönliche Daten des Kunden ist dafür nicht erforderlich und wird nicht verlangt.</p>
      <p>4.2. Verzögert sich die Leistungserbringung, weil der Kunde erforderliche Mitwirkungen nicht erbringt, verlängern sich genannte Bearbeitungszeiten entsprechend.</p>

      <h2>5. Bearbeitungszeit</h2>
      <p>5.1. Die Entfernung erfolgt in der Regel innerhalb von <strong>24 bis 48 Stunden</strong> ab Vorliegen aller Mitwirkungen gemäß Punkt 4. Hierbei handelt es sich um eine Zirka-Angabe, nicht um einen Fixtermin. Verzögerungen durch Google-interne Prozesse haben wir nicht zu vertreten.</p>

      <h2>6. Preise und Zahlung</h2>
      <p>6.1. Es gelten die zum Zeitpunkt der Beauftragung auf der Website bzw. im Angebot ausgewiesenen Festpreise. Sämtliche ausgewiesenen Preise sind Endpreise und verstehen sich inklusive allfälliger gesetzlicher Umsatzsteuer. Je nach Region des Kunden erfolgt die Abrechnung in EUR oder USD.</p>
      <p>6.2. <strong>Zahlung nach Erfolg („No Cure, No Pay"):</strong> Für Leistungen gemäß 2.1 und 2.2 wird das Entgelt erst mit Eintritt des Erfolges gemäß Punkt 7 fällig. Bleibt der Erfolg aus, schuldet der Kunde kein Entgelt. Bei der Zahlungsabwicklung kann eine Zahlungsautorisierung bereits bei Beauftragung erfolgen; die Belastung erfolgt erst nach Erfolgseintritt.</p>
      <p>6.3. Für die Reputations-Verdrängung gelten die im Angebot genannten Vergütungen (z. B. einmaliges Audit, monatlicher Retainer); diese sind <strong>nicht</strong> erfolgsabhängig, sofern nicht ausdrücklich anders vereinbart.</p>
      <p>6.4. Zahlungsarten: die im Bestellprozess angebotenen Methoden (z. B. Kreditkarte, PayPal, Klarna, iDEAL); die Abwicklung erfolgt über externe Zahlungsdienstleister.</p>

      <h2>7. Erfolgsdefinition, Abnahme</h2>
      <p>7.1. Der Erfolg der Profil-Löschung tritt ein, wenn das beauftragte Unternehmensprofil in der Google-Suche und auf Google Maps <strong>öffentlich nicht mehr abrufbar</strong> ist. Maßgeblich ist die Nichtabrufbarkeit des Profils selbst; aus technischen Gründen (Caches, Drittseiten, zeitversetzte Synchronisierung einzelner Google-Dienste) können einzelne Inhalte vorübergehend noch auffindbar sein, ohne dass dies den Erfolgseintritt hindert.</p>
      <p>7.2. Wir informieren den Kunden über den Erfolgseintritt. Der Kunde kann binnen 7 Tagen Einwände erheben; andernfalls gilt die Leistung als abgenommen.</p>

      <h2>8. Wiedereinstellungs-Schutz</h2>
      <p>8.1. Wird das entfernte Profil während eines aufrechten Wiedereinstellungs-Schutzes durch Dritte oder durch automatisierte Google-Prozesse erneut öffentlich eingestellt, entfernen wir es auf Mitteilung des Kunden hin kostenlos erneut. Der Schutzzeitraum richtet sich nach dem gewählten Schutz-Paket: beim <strong>Monatlichen Schutz</strong> und beim <strong>Monitoring</strong> für die Laufzeit des aufrechten Abonnements (jeweils monatlich kündbar), beim <strong>Lebenslangen Schutz</strong> dauerhaft. Beim Monitoring sowie beim Lebenslangen Schutz prüfen wir zusätzlich laufend selbst auf Wiedereinstellungen, ohne dass es einer Mitteilung des Kunden bedarf.</p>
      <p>8.2. Nicht umfasst sind Profile, die der Kunde selbst oder mit seiner Zustimmung neu anlegt, sowie inhaltlich neue, abweichende Einträge Dritter (z. B. mit anderer Adresse/Firmierung), die kein Wiederaufleben des ursprünglichen Profils darstellen.</p>

      <h2>9. Gewährleistung und Haftung</h2>
      <p>9.1. Es gelten die gesetzlichen Gewährleistungsbestimmungen.</p>
      <p>9.2. Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Personenschäden. Bei leichter Fahrlässigkeit haften wir — außer bei Personenschäden — nicht; gegenüber Unternehmern ist die Haftung für leichte Fahrlässigkeit, für entgangenen Gewinn, Folgeschäden und reine Vermögensschäden ausgeschlossen.</p>
      <p>9.3. Wir schulden keinen bestimmten wirtschaftlichen Effekt der Löschung (z. B. Umsatz-, Ranking- oder Reputationsentwicklung).</p>

      <h2>10. Datenschutz</h2>
      <p>Informationen zur Verarbeitung personenbezogener Daten finden sich in unserer <a href={asset("/datenschutzerklaerung/")}>Datenschutzerklärung</a>.</p>

      <h2>11. Widerrufsrecht für Verbraucher</h2>
      <p>11.1. Verbrauchern im Sinne des KSchG steht bei Fernabsatzverträgen das gesetzliche Widerrufsrecht nach dem FAGG zu. Es gilt die <a href={asset("/widerruf/")}>Widerrufsbelehrung samt Muster-Widerrufsformular</a>.</p>
      <p>11.2. <strong>Vorzeitiger Beginn:</strong> Wünscht der Verbraucher, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen (insbesondere wegen der Bearbeitungszeit von 24–48 Stunden), verlangen wir hierfür eine <strong>ausdrückliche Erklärung</strong> im Bestellprozess samt Bestätigung der Kenntnisnahme, dass das Widerrufsrecht bei vollständiger Vertragserfüllung erlischt (§ 18 Abs 1 Z 1 FAGG).</p>
      <p>11.3. Widerruft der Verbraucher nach erfolgtem Leistungsbeginn, aber vor vollständiger Erfüllung, schuldet er ein anteiliges Entgelt für die bis zum Widerruf erbrachten Leistungen (§ 16 FAGG).</p>

      <h2>12. Schlussbestimmungen</h2>
      <p>12.1. Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gegenüber Verbrauchern mit gewöhnlichem Aufenthalt in einem anderen Staat bleiben zwingende Verbraucherschutzbestimmungen dieses Staates unberührt.</p>
      <p>12.2. Gerichtsstand für Verträge mit Unternehmern ist das sachlich zuständige Gericht am Sitz von RapidRemove. Für Verbraucher gelten die gesetzlichen Gerichtsstände.</p>
      <p>12.3. Vertragssprache ist Deutsch.</p>
      <p>12.4. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>

      <p className="legal-upd">Stand: Juni 2026</p>
    </React.Fragment>
  );
}

/* ─────────────────── Widerrufsbelehrung ─────────────────── */
function WiderrufBody() {
  return (
    <React.Fragment>
      <h1>Widerrufsbelehrung</h1>
      <p className="legal-sub">Widerrufsbelehrung für Verbraucher gemäß FAGG samt Muster-Widerrufsformular. Vertragspartner: {C.legal}, {C.street}, {C.city}, {C.country}.</p>

      <h2>Widerrufsrecht</h2>
      <p>Sie haben das Recht, diesen Vertrag binnen vierzehn Tagen ohne Angabe von Gründen zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
      <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns</p>
      <p>
        {C.legal}<br />
        {C.street}, {C.city}, {C.country}<br />
        E-Mail: <a href={"mailto:" + C.email}>{C.email}</a><br />
        Telefon: <a href={"tel:" + C.phoneHref}>{C.phone}</a>
      </p>
      <p>mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das nachstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
      <p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>

      <h2>Folgen des Widerrufs</h2>
      <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, sofern mit Ihnen nicht ausdrücklich etwas anderes vereinbart wurde; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
      <p>Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.</p>

      <h2>Erlöschen des Widerrufsrechts</h2>
      <p>Das Widerrufsrecht erlischt vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren (§ 18 Abs 1 Z 1 FAGG).</p>

      <h2>Muster-Widerrufsformular</h2>
      <p><em>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</em></p>
      <p>An: {C.legal}, {C.street}, {C.city}, {C.country}, <a href={"mailto:" + C.email}>{C.email}</a></p>
      <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:</p>
      <p>
        — Bestellt am (*): ____________________<br />
        — Name des/der Verbraucher(s): ____________________<br />
        — Anschrift des/der Verbraucher(s): ____________________<br />
        — Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________________<br />
        — Datum: ____________________
      </p>
      <p>(*) Unzutreffendes streichen.</p>

      <p className="legal-upd">Stand: Juni 2026</p>
    </React.Fragment>
  );
}

export function Agb({ initialLang = "de" }) { return <Shell initialLang={initialLang}><AgbBody /></Shell>; }
export function Widerruf({ initialLang = "de" }) { return <Shell initialLang={initialLang}><WiderrufBody /></Shell>; }
