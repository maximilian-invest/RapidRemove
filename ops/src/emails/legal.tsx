/* AGB + Widerrufsbelehrung als Bestandteil der Auftragsbestätigung (dauerhafter
   Datenträger gemäß FAGG). Volltext in der deutschen Fassung — Vertragssprache ist
   Deutsch (Punkt 12.3 AGB); lokalisierte Fassungen folgen nach anwaltlicher Freigabe.
   Für alle Sprachen wird eine lokalisierte Einleitung + Links vorangestellt. */
import * as React from "react";
import { Hr, Section, Text } from "@react-email/components";
import { brand, A, MailLang } from "./components";

/* Lokalisierte Seiten-Slugs — synchron halten mit src/lib/page-routes.js (PAGE_SLUGS). */
const SITE = "https://www.rapid-remove.com";
const AGB_SLUG: Record<MailLang, string> = { de: "agb", en: "terms-and-conditions", es: "terminos-y-condiciones", fr: "cgv", it: "termini-e-condizioni", nl: "algemene-voorwaarden", pt: "termos-e-condicoes", ja: "terms", sv: "allmanna-villkor", da: "handelsbetingelser", no: "vilkar" };
const WID_SLUG: Record<MailLang, string> = { de: "widerruf", en: "right-of-withdrawal", es: "desistimiento", fr: "retractation", it: "recesso", nl: "herroepingsrecht", pt: "retratacao", ja: "withdrawal", sv: "angerratt", da: "fortrydelsesret", no: "angrerett" };
const agbUrl = (l: MailLang) => (l === "de" ? `${SITE}/agb/` : `${SITE}/${l}/${AGB_SLUG[l] || AGB_SLUG.en}/`);
const widUrl = (l: MailLang) => (l === "de" ? `${SITE}/widerruf/` : `${SITE}/${l}/${WID_SLUG[l] || WID_SLUG.en}/`);

const INTRO: Record<MailLang, { h: string; p: string; agb: string; wid: string }> = {
  de: { h: "AGB & Widerrufsbelehrung", p: "Nachstehend finden Sie unsere Allgemeinen Geschäftsbedingungen und die Widerrufsbelehrung im Volltext — sie sind Bestandteil dieser Bestätigung.", agb: "AGB online", wid: "Widerrufsbelehrung online" },
  en: { h: "Terms & withdrawal policy", p: "Below you will find our Terms & Conditions and the withdrawal policy in full — they form part of this confirmation. The German version is authoritative (contract language is German).", agb: "Terms online", wid: "Withdrawal policy online" },
  es: { h: "Términos e información sobre desistimiento", p: "A continuación encontrará nuestros Términos y Condiciones y la información sobre desistimiento en su texto íntegro: forman parte de esta confirmación. La versión alemana es la vinculante (la lengua del contrato es el alemán).", agb: "Términos en línea", wid: "Información sobre desistimiento en línea" },
  fr: { h: "CGV & information sur la rétractation", p: "Vous trouverez ci-dessous nos CGV et l'information sur le droit de rétractation en texte intégral — elles font partie de cette confirmation. La version allemande fait foi (la langue du contrat est l'allemand).", agb: "CGV en ligne", wid: "Information sur la rétractation en ligne" },
  it: { h: "Termini e informativa sul recesso", p: "Di seguito trova i nostri Termini e Condizioni e l'informativa sul recesso in versione integrale: fanno parte di questa conferma. Fa fede la versione tedesca (la lingua del contratto è il tedesco).", agb: "Termini online", wid: "Informativa sul recesso online" },
  nl: { h: "Voorwaarden & herroepingsinformatie", p: "Hieronder vindt u onze algemene voorwaarden en de herroepingsinformatie in de volledige tekst — zij maken deel uit van deze bevestiging. De Duitse versie is bindend (de contracttaal is Duits).", agb: "Voorwaarden online", wid: "Herroepingsinformatie online" },
  pt: { h: "Termos e informação sobre retratação", p: "Abaixo encontra os nossos Termos e Condições e a informação sobre retratação em texto integral — fazem parte desta confirmação. A versão alemã é a vinculativa (a língua do contrato é o alemão).", agb: "Termos online", wid: "Informação sobre retratação online" },
  ja: { h: "利用規約と撤回権に関する説明", p: "以下に、利用規約（AGB）と撤回権に関する説明の全文を記載します。これらは本確認メールの一部です。契約言語はドイツ語であり、ドイツ語版が優先します。", agb: "利用規約（オンライン）", wid: "撤回権に関する説明（オンライン）" },
  sv: { h: "Villkor & ångerrättsinformation", p: "Nedan hittar du våra allmänna villkor och ångerrättsinformationen i fulltext — de är en del av denna bekräftelse. Den tyska versionen är bindande (avtalsspråket är tyska).", agb: "Villkor online", wid: "Ångerrättsinformation online" },
  da: { h: "Vilkår & fortrydelsesoplysninger", p: "Nedenfor finder du vores handelsbetingelser og fortrydelsesoplysningerne i fuld tekst — de er en del af denne bekræftelse. Den tyske version er bindende (aftalesproget er tysk).", agb: "Vilkår online", wid: "Fortrydelsesoplysninger online" },
  no: { h: "Vilkår & angrerettsinformasjon", p: "Nedenfor finner du våre vilkår og angrerettsinformasjonen i fulltekst — de er en del av denne bekreftelsen. Den tyske versjonen er bindende (avtalespråket er tysk).", agb: "Vilkår på nett", wid: "Angrerettsinformasjon på nett" },
};

const h2: React.CSSProperties = { margin: "14px 0 4px", fontSize: 12, lineHeight: "1.45", fontWeight: 800, color: brand.ink };
const sp: React.CSSProperties = { margin: "0 0 6px", fontSize: 11, lineHeight: "1.55", color: brand.muted };

function H({ children }: { children: React.ReactNode }) { return <Text style={h2}>{children}</Text>; }
function S({ children }: { children: React.ReactNode }) { return <Text style={sp}>{children}</Text>; }

/** Volltext AGB + Widerrufsbelehrung (deutsche Fassung) als Kleindruck. */
function GermanFullText() {
  return (
    <Section>
      <Text style={{ ...h2, fontSize: 13 }}>Allgemeine Geschäftsbedingungen (AGB)</Text>
      <S>der Simple Solution. OG, Salzgasse 2, 5400 Hallein, Österreich (FN 470700g, Landesgericht Salzburg; UID ATU72401536), nachfolgend „RapidRemove" oder „wir". Stand: Juni 2026.</S>

      <H>1. Geltungsbereich</H>
      <S>1.1. Diese AGB gelten für alle Verträge zwischen RapidRemove und ihren Kunden über die auf rapid-remove.com angebotenen Leistungen. 1.2. Kunde kann sowohl Unternehmer im Sinne des § 1 KSchG als auch Verbraucher sein. Soweit einzelne Bestimmungen nur für Verbraucher oder nur für Unternehmer gelten, ist dies ausdrücklich angeführt. Unser Angebot richtet sich primär an Unternehmer (Inhaber bzw. Verantwortliche von Google-Unternehmensprofilen). 1.3. Abweichende Geschäftsbedingungen des Kunden gelten nur, wenn wir ihnen ausdrücklich schriftlich zugestimmt haben.</S>

      <H>2. Leistungen</H>
      <S>2.1. Profil-Löschung („Remove"): Dauerhafte Entfernung eines Google-Unternehmensprofils (Google Business Profile / Google Maps-Eintrag) einschließlich aller damit verbundenen Bewertungen aus der öffentlichen Anzeige der Google-Dienste. Die Entfernung erfolgt ausschließlich über offizielle, von Google vorgesehene Prozesse und Schnittstellen. 2.2. Profil-Löschung + Neuanlage („Remove + Restart"): Leistung gemäß Punkt 2.1 zuzüglich Einrichtung eines neuen Google-Unternehmensprofils mit den vom Kunden bereitgestellten korrekten Unternehmensdaten. 2.3. Reputations-Verdrängung: Laufende Maßnahmen mit dem Ziel, vom Kunden benannte negative Suchergebnisse in der Google-Suche durch andere Inhalte zu verdrängen. Es handelt sich um ein Bemühen ohne Erfolgsgarantie; ein bestimmtes Ranking-Ergebnis wird nicht geschuldet. Details (Laufzeit, Umfang, Reporting) ergeben sich aus dem jeweiligen Angebot. 2.4. Presse-Auslistung (Vermittlung): RapidRemove vermittelt den Kontakt zu einer Partnerkanzlei und unterstützt bei der Antragstellung. Die rechtliche Prüfung und Vertretung erfolgt ausschließlich durch die Partnerkanzlei; ein gesonderter Vertrag kommt zwischen Kunde und Partnerkanzlei zustande. RapidRemove erbringt keine Rechtsberatung und schuldet keinen Auslistungserfolg. 2.5. Keine Löschung einzelner Bewertungen: Gegenstand der Leistung gemäß 2.1/2.2 ist stets die Entfernung des gesamten Profils samt aller Bewertungen, nicht die Entfernung einzelner Rezensionen. 2.6. Keine Rechtsdienstleistung: Sämtliche Leistungen von RapidRemove sind technisch-organisatorischer Natur. RapidRemove erbringt keine Rechtsberatung und keine Vertretung vor Behörden oder Gerichten.</S>

      <H>3. Vertragsabschluss</H>
      <S>3.1. Der kostenlose Lösch-Check auf unserer Website ist unverbindlich und stellt kein Angebot dar. 3.2. Der Vertrag kommt zustande, wenn der Kunde unser Angebot (per Website-Bestellstrecke oder E-Mail) annimmt und wir die Beauftragung bestätigen, spätestens jedoch mit Beginn der Leistungserbringung. 3.3. Berechtigung: Der Kunde sichert zu, dass er zur Verfügung über das betreffende Unternehmensprofil berechtigt ist (als Inhaber des Unternehmens oder mit dessen ausdrücklicher Vollmacht). Die Beauftragung der Löschung fremder Profile ohne Berechtigung ist untersagt; der Kunde hält RapidRemove insoweit schad- und klaglos.</S>

      <H>4. Mitwirkungspflichten des Kunden</H>
      <S>4.1. Der Kunde bestätigt das zu entfernende Profil und erteilt die erforderliche Bearbeitungsberechtigung für das Unternehmensprofil. Ein Zugriff auf das Google-Konto, Gmail, Google Ads oder persönliche Daten des Kunden ist dafür nicht erforderlich und wird nicht verlangt. 4.2. Verzögert sich die Leistungserbringung, weil der Kunde erforderliche Mitwirkungen nicht erbringt, verlängern sich genannte Bearbeitungszeiten entsprechend.</S>

      <H>5. Bearbeitungszeit</H>
      <S>5.1. Die Entfernung erfolgt in der Regel innerhalb von 24 bis 48 Stunden ab Vorliegen aller Mitwirkungen gemäß Punkt 4. Hierbei handelt es sich um eine Zirka-Angabe, nicht um einen Fixtermin. Verzögerungen durch Google-interne Prozesse haben wir nicht zu vertreten.</S>

      <H>6. Preise und Zahlung</H>
      <S>6.1. Es gelten die zum Zeitpunkt der Beauftragung auf der Website bzw. im Angebot ausgewiesenen Festpreise. Sämtliche ausgewiesenen Preise sind Endpreise und verstehen sich inklusive allfälliger gesetzlicher Umsatzsteuer. Je nach Region des Kunden erfolgt die Abrechnung in EUR oder USD. 6.2. Zahlung nach Erfolg („No Cure, No Pay"): Für Leistungen gemäß 2.1 und 2.2 wird das Entgelt erst mit Eintritt des Erfolges gemäß Punkt 7 fällig. Bleibt der Erfolg aus, schuldet der Kunde kein Entgelt. Bei der Zahlungsabwicklung kann eine Zahlungsautorisierung bereits bei Beauftragung erfolgen; die Belastung erfolgt erst nach Erfolgseintritt. 6.3. Für die Reputations-Verdrängung gelten die im Angebot genannten Vergütungen (z. B. einmaliges Audit, monatlicher Retainer); diese sind nicht erfolgsabhängig, sofern nicht ausdrücklich anders vereinbart. 6.4. Zahlungsarten: die im Bestellprozess angebotenen Methoden (z. B. Kreditkarte, PayPal, Klarna, iDEAL); die Abwicklung erfolgt über externe Zahlungsdienstleister.</S>

      <H>7. Erfolgsdefinition, Abnahme</H>
      <S>7.1. Der Erfolg der Profil-Löschung tritt ein, wenn das beauftragte Unternehmensprofil in der Google-Suche und auf Google Maps öffentlich nicht mehr abrufbar ist. Maßgeblich ist die Nichtabrufbarkeit des Profils selbst; aus technischen Gründen (Caches, Drittseiten, zeitversetzte Synchronisierung einzelner Google-Dienste) können einzelne Inhalte vorübergehend noch auffindbar sein, ohne dass dies den Erfolgseintritt hindert. 7.2. Wir informieren den Kunden über den Erfolgseintritt. Der Kunde kann binnen 7 Tagen Einwände erheben; andernfalls gilt die Leistung als abgenommen.</S>

      <H>8. Wiedereinstellungs-Schutz</H>
      <S>8.1. Wird das entfernte Profil während eines aufrechten Wiedereinstellungs-Schutzes durch Dritte oder durch automatisierte Google-Prozesse erneut öffentlich eingestellt, entfernen wir es auf Mitteilung des Kunden hin kostenlos erneut. Der Schutzzeitraum richtet sich nach dem gewählten Schutz-Paket: beim Monatlichen Schutz und beim Monitoring für die Laufzeit des aufrechten Abonnements (jeweils monatlich kündbar), beim Lebenslangen Schutz dauerhaft. Beim Monitoring sowie beim Lebenslangen Schutz prüfen wir zusätzlich laufend selbst auf Wiedereinstellungen, ohne dass es einer Mitteilung des Kunden bedarf. 8.2. Nicht umfasst sind Profile, die der Kunde selbst oder mit seiner Zustimmung neu anlegt, sowie inhaltlich neue, abweichende Einträge Dritter (z. B. mit anderer Adresse/Firmierung), die kein Wiederaufleben des ursprünglichen Profils darstellen.</S>

      <H>9. Gewährleistung und Haftung</H>
      <S>9.1. Es gelten die gesetzlichen Gewährleistungsbestimmungen. 9.2. Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Personenschäden. Bei leichter Fahrlässigkeit haften wir — außer bei Personenschäden — nicht; gegenüber Unternehmern ist die Haftung für leichte Fahrlässigkeit, für entgangenen Gewinn, Folgeschäden und reine Vermögensschäden ausgeschlossen. 9.3. Wir schulden keinen bestimmten wirtschaftlichen Effekt der Löschung (z. B. Umsatz-, Ranking- oder Reputationsentwicklung).</S>

      <H>10. Datenschutz</H>
      <S>Informationen zur Verarbeitung personenbezogener Daten finden sich in unserer Datenschutzerklärung unter rapid-remove.com/datenschutzerklaerung.</S>

      <H>11. Widerrufsrecht für Verbraucher</H>
      <S>11.1. Verbrauchern im Sinne des KSchG steht bei Fernabsatzverträgen das gesetzliche Widerrufsrecht nach dem FAGG zu. Es gilt die nachstehende Widerrufsbelehrung. 11.2. Vorzeitiger Beginn: Wünscht der Verbraucher, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen (insbesondere wegen der Bearbeitungszeit von 24–48 Stunden), verlangen wir hierfür eine ausdrückliche Erklärung im Bestellprozess samt Bestätigung der Kenntnisnahme, dass das Widerrufsrecht bei vollständiger Vertragserfüllung erlischt (§ 18 Abs 1 Z 1 FAGG). 11.3. Widerruft der Verbraucher nach erfolgtem Leistungsbeginn, aber vor vollständiger Erfüllung, schuldet er ein anteiliges Entgelt für die bis zum Widerruf erbrachten Leistungen (§ 16 FAGG).</S>

      <H>12. Schlussbestimmungen</H>
      <S>12.1. Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gegenüber Verbrauchern mit gewöhnlichem Aufenthalt in einem anderen Staat bleiben zwingende Verbraucherschutzbestimmungen dieses Staates unberührt. 12.2. Gerichtsstand für Verträge mit Unternehmern ist das sachlich zuständige Gericht am Sitz von RapidRemove. Für Verbraucher gelten die gesetzlichen Gerichtsstände. 12.3. Vertragssprache ist Deutsch. 12.4. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</S>

      <Text style={{ ...h2, fontSize: 13, marginTop: 18 }}>Widerrufsbelehrung für Verbraucher (FAGG)</Text>
      <H>Widerrufsrecht</H>
      <S>Sie haben das Recht, diesen Vertrag binnen vierzehn Tagen ohne Angabe von Gründen zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses. Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Simple Solution. OG, Salzgasse 2, 5400 Hallein, Österreich, E-Mail: helpdesk@rapid-remove.com, Telefon: +43 6245 9305300) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das nachstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</S>
      <H>Folgen des Widerrufs</H>
      <S>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, sofern mit Ihnen nicht ausdrücklich etwas anderes vereinbart wurde; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet. Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.</S>
      <H>Erlöschen des Widerrufsrechts</H>
      <S>Das Widerrufsrecht erlischt vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren (§ 18 Abs 1 Z 1 FAGG).</S>
      <H>Muster-Widerrufsformular</H>
      <S>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.) An: Simple Solution. OG, Salzgasse 2, 5400 Hallein, Österreich, helpdesk@rapid-remove.com — Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung: — Bestellt am (*): ___ — Name des/der Verbraucher(s): ___ — Anschrift des/der Verbraucher(s): ___ — Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ___ — Datum: ___ (*) Unzutreffendes streichen.</S>
    </Section>
  );
}

/** Anhang an die Auftragsbestätigung: lokalisierte Einleitung + Links + deutscher Volltext. */
export function LegalSection({ lang = "de" }: { lang?: MailLang }) {
  const t = INTRO[lang] || INTRO.de;
  return (
    <Section>
      <Hr style={{ borderColor: brand.hr, margin: "20px 0 14px" }} />
      <Text style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: brand.ink }}>{t.h}</Text>
      <Text style={{ margin: "0 0 6px", fontSize: 12, lineHeight: "1.55", color: brand.muted }}>{t.p}</Text>
      <Text style={{ margin: "0 0 10px", fontSize: 12, lineHeight: "1.55", color: brand.muted }}>
        <A href={agbUrl(lang)}>{t.agb}</A> · <A href={widUrl(lang)}>{t.wid}</A>
      </Text>
      <GermanFullText />
    </Section>
  );
}
