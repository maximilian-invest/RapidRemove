"use client";
/* RapidRemove — AGB + Widerrufsbelehrung, vollständig lokalisiert (11 Sprachen).
   Quelle: AGB-/Widerrufs-Entwurf (Juni 2026); [PRÜFEN]-Stellen redaktionell aufgelöst.
   Vertragssprache ist Deutsch (Punkt 12.3) — die Übersetzungen dienen der Information,
   maßgeblich ist die deutsche Fassung (in jeder Übersetzung ausgewiesen).
   Anwaltliche Prüfung vor Go-Live weiterhin erforderlich.
   Texte als Daten (TERMS) + Mini-Renderer: **fett**, [Label](@ds|@widerruf|mailto:|tel:), \n = Umbruch. */
import React from "react";
import { Shell } from "@/components/Legal";
import { useLang } from "@/lib/lang-context";
import { asset } from "@/lib/base";
import { pagePath } from "@/lib/page-routes";

const resolveHref = (href, lang) =>
  href === "@ds" ? asset(pagePath("datenschutz", lang))
  : href === "@widerruf" ? asset(pagePath("widerruf", lang))
  : href;

function renderInline(s, lang) {
  const parts = s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) return <a key={i} href={resolveHref(m[2], lang)}>{m[1]}</a>;
    return p;
  });
}

function Rich({ text, lang }) {
  return text.split("\n").map((ln, i) => (
    <React.Fragment key={i}>{i > 0 && <br />}{renderInline(ln, lang)}</React.Fragment>
  ));
}

function DocBody({ doc }) {
  const { lang } = useLang();
  return (
    <React.Fragment>
      <h1>{doc.title}</h1>
      <p className="legal-sub"><Rich text={doc.sub} lang={lang} /></p>
      {doc.secs.map((s, i) => (
        <React.Fragment key={i}>
          <h2>{s.h}</h2>
          {s.ps.map((p, j) => <p key={j}><Rich text={p} lang={lang} /></p>)}
        </React.Fragment>
      ))}
      <p className="legal-upd">{doc.upd}</p>
    </React.Fragment>
  );
}

function AgbBody() { const { lang } = useLang(); return <DocBody doc={(TERMS[lang] || TERMS.en).agb} />; }
function WiderrufBody() { const { lang } = useLang(); return <DocBody doc={(TERMS[lang] || TERMS.en).wid} />; }

export function Agb({ initialLang = "de" }) { return <Shell initialLang={initialLang} pageKey="agb"><AgbBody /></Shell>; }
export function Widerruf({ initialLang = "de" }) { return <Shell initialLang={initialLang} pageKey="widerruf"><WiderrufBody /></Shell>; }

/* Firmen-/Kontaktbausteine (in allen Sprachen identisch). */
const CO = "Simple Solution. OG";
const ADDR = "Salzgasse 2, 5400 Hallein";
const MAIL = "[helpdesk@rapid-remove.com](mailto:helpdesk@rapid-remove.com)";
const TEL = "[+43 6245 9305300](tel:+4362459305300)";

const TERMS = {};

/* ────────────────────────── DE ────────────────────────── */
TERMS.de = {
  agb: {
    title: "Allgemeine Geschäftsbedingungen (AGB)",
    sub: `der ${CO}, ${ADDR}, Österreich (FN 470700g, Landesgericht Salzburg; UID ATU72401536), nachfolgend **„RapidRemove“** oder **„wir“**.`,
    secs: [
      { h: "1. Geltungsbereich", ps: [
        "1.1. Diese AGB gelten für alle Verträge zwischen RapidRemove und ihren Kunden über die auf rapid-remove.com angebotenen Leistungen.",
        "1.2. Kunde kann sowohl Unternehmer im Sinne des § 1 KSchG als auch Verbraucher sein. Soweit einzelne Bestimmungen nur für Verbraucher oder nur für Unternehmer gelten, ist dies ausdrücklich angeführt. Unser Angebot richtet sich primär an Unternehmer (Inhaber bzw. Verantwortliche von Google-Unternehmensprofilen).",
        "1.3. Abweichende Geschäftsbedingungen des Kunden gelten nur, wenn wir ihnen ausdrücklich schriftlich zugestimmt haben.",
      ] },
      { h: "2. Leistungen", ps: [
        "2.1. **Profil-Löschung („Remove“):** Dauerhafte Entfernung eines Google-Unternehmensprofils (Google Business Profile / Google Maps-Eintrag) einschließlich aller damit verbundenen Bewertungen aus der öffentlichen Anzeige der Google-Dienste. Die Entfernung erfolgt ausschließlich über offizielle, von Google vorgesehene Prozesse und Schnittstellen.",
        "2.2. **Profil-Löschung + Neuanlage („Remove + Restart“):** Leistung gemäß Punkt 2.1 zuzüglich Einrichtung eines neuen Google-Unternehmensprofils mit den vom Kunden bereitgestellten korrekten Unternehmensdaten.",
        "2.3. **Reputations-Verdrängung:** Laufende Maßnahmen mit dem Ziel, vom Kunden benannte negative Suchergebnisse in der Google-Suche durch andere Inhalte zu verdrängen. Es handelt sich um ein **Bemühen ohne Erfolgsgarantie**; ein bestimmtes Ranking-Ergebnis wird nicht geschuldet. Details (Laufzeit, Umfang, Reporting) ergeben sich aus dem jeweiligen Angebot.",
        "2.4. **Presse-Auslistung (Vermittlung):** RapidRemove **vermittelt** den Kontakt zu einer Partnerkanzlei und unterstützt bei der Antragstellung. Die rechtliche Prüfung und Vertretung erfolgt ausschließlich durch die Partnerkanzlei; ein gesonderter Vertrag kommt zwischen Kunde und Partnerkanzlei zustande. RapidRemove erbringt **keine Rechtsberatung** und schuldet keinen Auslistungserfolg.",
        "2.5. **Keine Löschung einzelner Bewertungen:** Gegenstand der Leistung gemäß 2.1/2.2 ist stets die Entfernung des gesamten Profils samt aller Bewertungen, nicht die Entfernung einzelner Rezensionen.",
        "2.6. **Keine Rechtsdienstleistung:** Sämtliche Leistungen von RapidRemove sind technisch-organisatorischer Natur. RapidRemove erbringt keine Rechtsberatung und keine Vertretung vor Behörden oder Gerichten.",
      ] },
      { h: "3. Vertragsabschluss", ps: [
        "3.1. Der kostenlose Lösch-Check auf unserer Website ist unverbindlich und stellt kein Angebot dar.",
        "3.2. Der Vertrag kommt zustande, wenn der Kunde unser Angebot (per Website-Bestellstrecke oder E-Mail) annimmt und wir die Beauftragung bestätigen, spätestens jedoch mit Beginn der Leistungserbringung.",
        "3.3. **Berechtigung:** Der Kunde sichert zu, dass er zur Verfügung über das betreffende Unternehmensprofil berechtigt ist (als Inhaber des Unternehmens oder mit dessen ausdrücklicher Vollmacht). Die Beauftragung der Löschung fremder Profile ohne Berechtigung ist untersagt; der Kunde hält RapidRemove insoweit schad- und klaglos.",
      ] },
      { h: "4. Mitwirkungspflichten des Kunden", ps: [
        "4.1. Der Kunde bestätigt das zu entfernende Profil und erteilt die erforderliche Bearbeitungsberechtigung für das Unternehmensprofil. Ein Zugriff auf das Google-Konto, Gmail, Google Ads oder persönliche Daten des Kunden ist dafür nicht erforderlich und wird nicht verlangt.",
        "4.2. Verzögert sich die Leistungserbringung, weil der Kunde erforderliche Mitwirkungen nicht erbringt, verlängern sich genannte Bearbeitungszeiten entsprechend.",
      ] },
      { h: "5. Bearbeitungszeit", ps: [
        "5.1. Die Entfernung erfolgt in der Regel innerhalb von **24 bis 48 Stunden** ab Vorliegen aller Mitwirkungen gemäß Punkt 4. Hierbei handelt es sich um eine Zirka-Angabe, nicht um einen Fixtermin. Verzögerungen durch Google-interne Prozesse haben wir nicht zu vertreten.",
      ] },
      { h: "6. Preise und Zahlung", ps: [
        "6.1. Es gelten die zum Zeitpunkt der Beauftragung auf der Website bzw. im Angebot ausgewiesenen Festpreise. Sämtliche ausgewiesenen Preise sind Endpreise und verstehen sich inklusive allfälliger gesetzlicher Umsatzsteuer. Je nach Region des Kunden erfolgt die Abrechnung in EUR oder USD.",
        "6.2. **Zahlung nach Erfolg („No Cure, No Pay“):** Für Leistungen gemäß 2.1 und 2.2 wird das Entgelt erst mit Eintritt des Erfolges gemäß Punkt 7 fällig. Bleibt der Erfolg aus, schuldet der Kunde kein Entgelt. Bei der Zahlungsabwicklung kann eine Zahlungsautorisierung bereits bei Beauftragung erfolgen; die Belastung erfolgt erst nach Erfolgseintritt.",
        "6.3. Für die Reputations-Verdrängung gelten die im Angebot genannten Vergütungen (z. B. einmaliges Audit, monatlicher Retainer); diese sind **nicht** erfolgsabhängig, sofern nicht ausdrücklich anders vereinbart.",
        "6.4. Zahlungsarten: die im Bestellprozess angebotenen Methoden (z. B. Kreditkarte, PayPal, Klarna, iDEAL); die Abwicklung erfolgt über externe Zahlungsdienstleister.",
      ] },
      { h: "7. Erfolgsdefinition, Abnahme", ps: [
        "7.1. Der Erfolg der Profil-Löschung tritt ein, wenn das beauftragte Unternehmensprofil in der Google-Suche und auf Google Maps **öffentlich nicht mehr abrufbar** ist. Maßgeblich ist die Nichtabrufbarkeit des Profils selbst; aus technischen Gründen (Caches, Drittseiten, zeitversetzte Synchronisierung einzelner Google-Dienste) können einzelne Inhalte vorübergehend noch auffindbar sein, ohne dass dies den Erfolgseintritt hindert.",
        "7.2. Wir informieren den Kunden über den Erfolgseintritt. Der Kunde kann binnen 7 Tagen Einwände erheben; andernfalls gilt die Leistung als abgenommen.",
      ] },
      { h: "8. Wiedereinstellungs-Schutz", ps: [
        "8.1. Wird das entfernte Profil während eines aufrechten Wiedereinstellungs-Schutzes durch Dritte oder durch automatisierte Google-Prozesse erneut öffentlich eingestellt, entfernen wir es auf Mitteilung des Kunden hin kostenlos erneut. Der Schutzzeitraum richtet sich nach dem gewählten Schutz-Paket: beim **Monatlichen Schutz** und bei der **Täglichen Überwachung** für die Laufzeit des aufrechten Abonnements (jeweils monatlich kündbar), beim **Lebenslangen Schutz** dauerhaft. Bei der Täglichen Überwachung sowie beim Lebenslangen Schutz prüfen wir zusätzlich laufend selbst auf Wiedereinstellungen, ohne dass es einer Mitteilung des Kunden bedarf.",
        "8.2. Nicht umfasst sind Profile, die der Kunde selbst oder mit seiner Zustimmung neu anlegt, sowie inhaltlich neue, abweichende Einträge Dritter (z. B. mit anderer Adresse/Firmierung), die kein Wiederaufleben des ursprünglichen Profils darstellen.",
      ] },
      { h: "9. Gewährleistung und Haftung", ps: [
        "9.1. Es gelten die gesetzlichen Gewährleistungsbestimmungen.",
        "9.2. Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Personenschäden. Bei leichter Fahrlässigkeit haften wir — außer bei Personenschäden — nicht; gegenüber Unternehmern ist die Haftung für leichte Fahrlässigkeit, für entgangenen Gewinn, Folgeschäden und reine Vermögensschäden ausgeschlossen.",
        "9.3. Wir schulden keinen bestimmten wirtschaftlichen Effekt der Löschung (z. B. Umsatz-, Ranking- oder Reputationsentwicklung).",
      ] },
      { h: "10. Datenschutz", ps: [
        "Informationen zur Verarbeitung personenbezogener Daten finden sich in unserer [Datenschutzerklärung](@ds).",
      ] },
      { h: "11. Widerrufsrecht für Verbraucher", ps: [
        "11.1. Verbrauchern im Sinne des KSchG steht bei Fernabsatzverträgen das gesetzliche Widerrufsrecht nach dem FAGG zu. Es gilt die [Widerrufsbelehrung samt Muster-Widerrufsformular](@widerruf).",
        "11.2. **Vorzeitiger Beginn:** Wünscht der Verbraucher, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen (insbesondere wegen der Bearbeitungszeit von 24–48 Stunden), verlangen wir hierfür eine **ausdrückliche Erklärung** im Bestellprozess samt Bestätigung der Kenntnisnahme, dass das Widerrufsrecht bei vollständiger Vertragserfüllung erlischt (§ 18 Abs 1 Z 1 FAGG).",
        "11.3. Widerruft der Verbraucher nach erfolgtem Leistungsbeginn, aber vor vollständiger Erfüllung, schuldet er ein anteiliges Entgelt für die bis zum Widerruf erbrachten Leistungen (§ 16 FAGG).",
      ] },
      { h: "12. Schlussbestimmungen", ps: [
        "12.1. Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts. Gegenüber Verbrauchern mit gewöhnlichem Aufenthalt in einem anderen Staat bleiben zwingende Verbraucherschutzbestimmungen dieses Staates unberührt.",
        "12.2. Gerichtsstand für Verträge mit Unternehmern ist das sachlich zuständige Gericht am Sitz von RapidRemove. Für Verbraucher gelten die gesetzlichen Gerichtsstände.",
        "12.3. Vertragssprache ist Deutsch.",
        "12.4. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
      ] },
    ],
    upd: "Stand: Juni 2026",
  },
  wid: {
    title: "Widerrufsbelehrung",
    sub: `Widerrufsbelehrung für Verbraucher gemäß FAGG samt Muster-Widerrufsformular. Vertragspartner: ${CO}, ${ADDR}, Österreich.`,
    secs: [
      { h: "Widerrufsrecht", ps: [
        "Sie haben das Recht, diesen Vertrag binnen vierzehn Tagen ohne Angabe von Gründen zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.",
        "Um Ihr Widerrufsrecht auszuüben, müssen Sie uns",
        `${CO}\n${ADDR}, Österreich\nE-Mail: ${MAIL}\nTelefon: ${TEL}`,
        "mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das nachstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.",
        "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
      ] },
      { h: "Folgen des Widerrufs", ps: [
        "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, sofern mit Ihnen nicht ausdrücklich etwas anderes vereinbart wurde; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
        "Haben Sie verlangt, dass die Dienstleistung während der Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.",
      ] },
      { h: "Erlöschen des Widerrufsrechts", ps: [
        "Das Widerrufsrecht erlischt vorzeitig, wenn wir die Dienstleistung vollständig erbracht haben und mit der Ausführung der Dienstleistung erst begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung durch uns verlieren (§ 18 Abs 1 Z 1 FAGG).",
      ] },
      { h: "Muster-Widerrufsformular", ps: [
        "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)",
        `An: ${CO}, ${ADDR}, Österreich, ${MAIL}`,
        "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung:",
        "— Bestellt am (*): ____________________\n— Name des/der Verbraucher(s): ____________________\n— Anschrift des/der Verbraucher(s): ____________________\n— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): ____________________\n— Datum: ____________________",
        "(*) Unzutreffendes streichen.",
      ] },
    ],
    upd: "Stand: Juni 2026",
  },
};

/* ────────────────────────── EN ────────────────────────── */
TERMS.en = {
  agb: {
    title: "Terms & Conditions (AGB)",
    sub: `of ${CO}, ${ADDR}, Austria (FN 470700g, Regional Court of Salzburg; VAT ID ATU72401536), hereinafter **"RapidRemove"** or **"we"**. Convenience translation — the German version is authoritative.`,
    secs: [
      { h: "1. Scope", ps: [
        "1.1. These Terms apply to all contracts between RapidRemove and its customers concerning the services offered on rapid-remove.com.",
        "1.2. Customers may be entrepreneurs within the meaning of § 1 of the Austrian Consumer Protection Act (KSchG) as well as consumers. Where individual provisions apply only to consumers or only to entrepreneurs, this is expressly stated. Our offering is primarily aimed at entrepreneurs (owners or persons responsible for Google business profiles).",
        "1.3. Deviating terms and conditions of the customer apply only if we have expressly agreed to them in writing.",
      ] },
      { h: "2. Services", ps: [
        "2.1. **Profile removal (\"Remove\"):** Permanent removal of a Google business profile (Google Business Profile / Google Maps listing) including all associated reviews from the public display of Google services. Removal is carried out exclusively via official processes and interfaces provided by Google.",
        "2.2. **Profile removal + new setup (\"Remove + Restart\"):** Service pursuant to clause 2.1 plus setup of a new Google business profile with the correct business data provided by the customer.",
        "2.3. **Reputation suppression:** Ongoing measures aimed at pushing negative search results named by the customer out of Google Search with other content. This is an **effort without a guarantee of success**; no specific ranking result is owed. Details (term, scope, reporting) follow from the respective offer.",
        "2.4. **Press de-indexing (referral):** RapidRemove **refers** the customer to a partner law firm and assists with the application. Legal review and representation are carried out exclusively by the partner law firm; a separate contract is concluded between the customer and the partner law firm. RapidRemove provides **no legal advice** and owes no de-indexing success.",
        "2.5. **No removal of individual reviews:** The subject of the service pursuant to 2.1/2.2 is always the removal of the entire profile including all reviews, not the removal of individual reviews.",
        "2.6. **No legal services:** All RapidRemove services are of a technical-organisational nature. RapidRemove provides no legal advice and no representation before authorities or courts.",
      ] },
      { h: "3. Conclusion of contract", ps: [
        "3.1. The free removal check on our website is non-binding and does not constitute an offer.",
        "3.2. The contract is concluded when the customer accepts our offer (via the website order flow or e-mail) and we confirm the engagement, at the latest, however, when performance of the service begins.",
        "3.3. **Authorisation:** The customer warrants that they are entitled to dispose of the business profile in question (as the owner of the business or with its express authority). Commissioning the removal of third-party profiles without authorisation is prohibited; the customer shall indemnify and hold RapidRemove harmless in this respect.",
      ] },
      { h: "4. Customer's duties to cooperate", ps: [
        "4.1. The customer confirms the profile to be removed and grants the required editing authorisation for the business profile. Access to the customer's Google account, Gmail, Google Ads or personal data is not required for this and will not be requested.",
        "4.2. If performance is delayed because the customer fails to provide required cooperation, the stated processing times are extended accordingly.",
      ] },
      { h: "5. Processing time", ps: [
        "5.1. Removal is generally carried out within **24 to 48 hours** from receipt of all cooperation pursuant to clause 4. This is an approximate figure, not a fixed deadline. We are not responsible for delays caused by Google-internal processes.",
      ] },
      { h: "6. Prices and payment", ps: [
        "6.1. The fixed prices shown on the website or in the offer at the time of the engagement apply. All prices shown are final prices and include any applicable statutory VAT. Depending on the customer's region, billing is in EUR or USD.",
        "6.2. **Payment on success (\"No Cure, No Pay\"):** For services pursuant to 2.1 and 2.2, the fee becomes due only upon occurrence of success pursuant to clause 7. If success does not occur, the customer owes no fee. During payment processing, a payment authorisation may already take place at the time of the engagement; the charge is made only after success has occurred.",
        "6.3. For reputation suppression, the fees stated in the offer apply (e.g. one-off audit, monthly retainer); these are **not** success-based unless expressly agreed otherwise.",
        "6.4. Payment methods: the methods offered in the order process (e.g. credit card, PayPal, Klarna, iDEAL); processing is handled by external payment service providers.",
      ] },
      { h: "7. Definition of success, acceptance", ps: [
        "7.1. The success of the profile removal occurs when the commissioned business profile is **no longer publicly retrievable** in Google Search and on Google Maps. Decisive is the non-retrievability of the profile itself; for technical reasons (caches, third-party sites, time-delayed synchronisation of individual Google services), individual contents may temporarily remain findable without this preventing the occurrence of success.",
        "7.2. We inform the customer of the occurrence of success. The customer may raise objections within 7 days; otherwise the service is deemed accepted.",
      ] },
      { h: "8. Re-listing protection", ps: [
        "8.1. If the removed profile is publicly re-listed by third parties or by automated Google processes during active re-listing protection, we will remove it again free of charge upon notification by the customer. The protection period depends on the chosen protection package: for **Monthly protection** and **Daily monitoring**, for the term of the active subscription (each cancellable monthly); for **Lifetime protection**, permanently. With Daily monitoring and Lifetime protection we additionally check for re-listings ourselves on an ongoing basis, without any notification by the customer being required.",
        "8.2. Not covered are profiles that the customer creates anew themselves or with their consent, as well as substantively new, deviating listings by third parties (e.g. with a different address/company name) that do not constitute a revival of the original profile.",
      ] },
      { h: "9. Warranty and liability", ps: [
        "9.1. The statutory warranty provisions apply.",
        "9.2. We are liable without limitation for intent and gross negligence as well as for personal injury. In cases of slight negligence we are not liable — except for personal injury; vis-à-vis entrepreneurs, liability for slight negligence, lost profit, consequential damage and pure financial loss is excluded.",
        "9.3. We do not owe any specific economic effect of the removal (e.g. revenue, ranking or reputation development).",
      ] },
      { h: "10. Data protection", ps: [
        "Information on the processing of personal data can be found in our [privacy policy](@ds).",
      ] },
      { h: "11. Right of withdrawal for consumers", ps: [
        "11.1. Consumers within the meaning of the KSchG are entitled to the statutory right of withdrawal under the Austrian Distance Selling Act (FAGG) for distance contracts. The [withdrawal policy including the model withdrawal form](@widerruf) applies.",
        "11.2. **Early start:** If the consumer wishes us to begin the service before the withdrawal period expires (in particular because of the 24–48 hour processing time), we require an **express declaration** in the order process together with confirmation of acknowledgement that the right of withdrawal lapses upon complete performance of the contract (§ 18 para 1 no 1 FAGG).",
        "11.3. If the consumer withdraws after performance has begun but before complete performance, they owe a proportionate fee for the services rendered up to the withdrawal (§ 16 FAGG).",
      ] },
      { h: "12. Final provisions", ps: [
        "12.1. Austrian law applies, excluding the UN Convention on Contracts for the International Sale of Goods. For consumers habitually resident in another state, the mandatory consumer protection provisions of that state remain unaffected.",
        "12.2. The place of jurisdiction for contracts with entrepreneurs is the court with subject-matter jurisdiction at RapidRemove's registered office. For consumers, the statutory places of jurisdiction apply.",
        "12.3. The contract language is German. This translation is provided for convenience only; the German version prevails.",
        "12.4. Should individual provisions be invalid, the validity of the remaining provisions remains unaffected.",
      ] },
    ],
    upd: "Version: June 2026",
  },
  wid: {
    title: "Right of withdrawal",
    sub: `Withdrawal policy for consumers under the Austrian Distance Selling Act (FAGG) including the model withdrawal form. Contracting party: ${CO}, ${ADDR}, Austria. Convenience translation — the German version is authoritative.`,
    secs: [
      { h: "Right of withdrawal", ps: [
        "You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period is fourteen days from the day of the conclusion of the contract.",
        "To exercise your right of withdrawal, you must inform us",
        `${CO}\n${ADDR}, Austria\nE-mail: ${MAIL}\nPhone: ${TEL}`,
        "of your decision to withdraw from this contract by an unequivocal statement (e.g. a letter sent by post or an e-mail). You may use the model withdrawal form below, but it is not obligatory.",
        "To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.",
      ] },
      { h: "Effects of withdrawal", ps: [
        "If you withdraw from this contract, we shall reimburse to you all payments received from you without undue delay and in any event not later than fourteen days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.",
        "If you requested that the service begin during the withdrawal period, you shall pay us an amount which is in proportion to what has been provided until you have communicated to us your withdrawal from this contract, in comparison with the full coverage of the contract.",
      ] },
      { h: "Lapse of the right of withdrawal", ps: [
        "The right of withdrawal lapses early if we have fully performed the service and began performing the service only after you gave your express consent and simultaneously confirmed your awareness that you lose your right of withdrawal upon complete performance of the contract by us (§ 18 para 1 no 1 FAGG).",
      ] },
      { h: "Model withdrawal form", ps: [
        "(If you wish to withdraw from the contract, please fill in this form and return it.)",
        `To: ${CO}, ${ADDR}, Austria, ${MAIL}`,
        "I/We (*) hereby withdraw from the contract concluded by me/us (*) for the provision of the following service:",
        "— Ordered on (*): ____________________\n— Name of the consumer(s): ____________________\n— Address of the consumer(s): ____________________\n— Signature of the consumer(s) (only if this form is notified on paper): ____________________\n— Date: ____________________",
        "(*) Delete as appropriate.",
      ] },
    ],
    upd: "Version: June 2026",
  },
};

/* ────────────────────────── ES ────────────────────────── */
TERMS.es = {
  agb: {
    title: "Términos y condiciones (AGB)",
    sub: `de ${CO}, ${ADDR}, Austria (FN 470700g, Tribunal Regional de Salzburgo; NIF-IVA ATU72401536), en adelante **«RapidRemove»** o **«nosotros»**. Traducción de cortesía: la versión alemana es la vinculante.`,
    secs: [
      { h: "1. Ámbito de aplicación", ps: [
        "1.1. Estos términos se aplican a todos los contratos entre RapidRemove y sus clientes sobre los servicios ofrecidos en rapid-remove.com.",
        "1.2. El cliente puede ser tanto empresario en el sentido del § 1 de la Ley austriaca de Protección del Consumidor (KSchG) como consumidor. Cuando una disposición se aplique solo a consumidores o solo a empresarios, se indicará expresamente. Nuestra oferta se dirige principalmente a empresarios (titulares o responsables de perfiles de empresa de Google).",
        "1.3. Las condiciones divergentes del cliente solo se aplicarán si las hemos aceptado expresamente por escrito.",
      ] },
      { h: "2. Servicios", ps: [
        "2.1. **Eliminación del perfil («Remove»):** Eliminación permanente de un perfil de empresa de Google (Google Business Profile / ficha de Google Maps), incluidas todas las reseñas asociadas, de la visualización pública de los servicios de Google. La eliminación se realiza exclusivamente a través de los procesos e interfaces oficiales previstos por Google.",
        "2.2. **Eliminación + nueva creación («Remove + Restart»):** Servicio según el punto 2.1 más la creación de un nuevo perfil de empresa de Google con los datos correctos facilitados por el cliente.",
        "2.3. **Desplazamiento de reputación:** Medidas continuas con el objetivo de desplazar de la búsqueda de Google, mediante otros contenidos, los resultados negativos indicados por el cliente. Se trata de un **esfuerzo sin garantía de éxito**; no se debe un resultado de posicionamiento concreto. Los detalles (duración, alcance, informes) se derivan de la oferta correspondiente.",
        "2.4. **Desindexación de prensa (intermediación):** RapidRemove **intermedia** el contacto con un bufete asociado y asiste en la solicitud. La revisión jurídica y la representación corren exclusivamente a cargo del bufete asociado; entre el cliente y el bufete se celebra un contrato separado. RapidRemove **no presta asesoramiento jurídico** y no debe ningún éxito de desindexación.",
        "2.5. **No se eliminan reseñas individuales:** El objeto del servicio según 2.1/2.2 es siempre la eliminación del perfil completo con todas sus reseñas, no la eliminación de reseñas individuales.",
        "2.6. **No es un servicio jurídico:** Todos los servicios de RapidRemove son de naturaleza técnico-organizativa. RapidRemove no presta asesoramiento jurídico ni representación ante autoridades o tribunales.",
      ] },
      { h: "3. Celebración del contrato", ps: [
        "3.1. La comprobación gratuita de eliminación en nuestra web no es vinculante y no constituye una oferta.",
        "3.2. El contrato se celebra cuando el cliente acepta nuestra oferta (a través del proceso de pedido de la web o por correo electrónico) y confirmamos el encargo, a más tardar, sin embargo, con el inicio de la prestación del servicio.",
        "3.3. **Legitimación:** El cliente garantiza que está legitimado para disponer del perfil de empresa en cuestión (como titular de la empresa o con su poder expreso). Está prohibido encargar la eliminación de perfiles ajenos sin legitimación; el cliente mantendrá indemne a RapidRemove a este respecto.",
      ] },
      { h: "4. Deberes de colaboración del cliente", ps: [
        "4.1. El cliente confirma el perfil que debe eliminarse y concede la autorización de edición necesaria para el perfil de empresa. Para ello no se requiere ni se solicita acceso a la cuenta de Google, Gmail, Google Ads ni a datos personales del cliente.",
        "4.2. Si la prestación se retrasa porque el cliente no aporta la colaboración necesaria, los plazos de tramitación indicados se prolongarán en consecuencia.",
      ] },
      { h: "5. Plazo de tramitación", ps: [
        "5.1. La eliminación se realiza por lo general en un plazo de **24 a 48 horas** desde que se dispone de toda la colaboración según el punto 4. Se trata de una indicación aproximada, no de una fecha fija. No respondemos de los retrasos debidos a procesos internos de Google.",
      ] },
      { h: "6. Precios y pago", ps: [
        "6.1. Se aplican los precios fijos indicados en la web o en la oferta en el momento del encargo. Todos los precios indicados son precios finales e incluyen, en su caso, el IVA legal. Según la región del cliente, la facturación se realiza en EUR o USD.",
        "6.2. **Pago tras el éxito («No Cure, No Pay»):** Para los servicios según 2.1 y 2.2, la remuneración solo vence con la consecución del éxito según el punto 7. Si el éxito no se produce, el cliente no debe remuneración alguna. En la tramitación del pago puede realizarse una autorización de pago ya en el momento del encargo; el cargo solo se efectúa tras la consecución del éxito.",
        "6.3. Para el desplazamiento de reputación se aplican las remuneraciones indicadas en la oferta (p. ej. auditoría única, cuota mensual); estas **no** dependen del éxito, salvo acuerdo expreso en contrario.",
        "6.4. Formas de pago: los métodos ofrecidos en el proceso de pedido (p. ej. tarjeta de crédito, PayPal, Klarna, iDEAL); la tramitación corre a cargo de proveedores de pago externos.",
      ] },
      { h: "7. Definición de éxito, aceptación", ps: [
        "7.1. El éxito de la eliminación del perfil se produce cuando el perfil de empresa encargado **ya no es públicamente accesible** en la búsqueda de Google ni en Google Maps. Lo decisivo es la no accesibilidad del propio perfil; por razones técnicas (cachés, sitios de terceros, sincronización diferida de algunos servicios de Google) algunos contenidos pueden seguir siendo localizables temporalmente sin que ello impida la consecución del éxito.",
        "7.2. Informamos al cliente de la consecución del éxito. El cliente puede presentar objeciones en un plazo de 7 días; de lo contrario, el servicio se considera aceptado.",
      ] },
      { h: "8. Protección contra la republicación", ps: [
        "8.1. Si el perfil eliminado vuelve a publicarse públicamente por terceros o por procesos automatizados de Google durante una protección contra republicación vigente, lo eliminaremos de nuevo gratuitamente previa comunicación del cliente. El periodo de protección depende del paquete elegido: con la **Protección mensual** y la **Monitorización diaria**, durante la vigencia de la suscripción activa (cancelable mensualmente); con la **Protección de por vida**, de forma permanente. Con la Monitorización diaria y la Protección de por vida comprobamos además nosotros mismos de forma continua si hay republicaciones, sin necesidad de comunicación del cliente.",
        "8.2. No están cubiertos los perfiles que el propio cliente cree de nuevo o que se creen con su consentimiento, ni las entradas de terceros sustancialmente nuevas y divergentes (p. ej. con otra dirección/denominación) que no constituyan un resurgimiento del perfil original.",
      ] },
      { h: "9. Garantía y responsabilidad", ps: [
        "9.1. Se aplican las disposiciones legales de garantía.",
        "9.2. Respondemos de forma ilimitada por dolo y negligencia grave, así como por daños personales. En caso de negligencia leve no respondemos — salvo por daños personales; frente a empresarios queda excluida la responsabilidad por negligencia leve, lucro cesante, daños indirectos y daños puramente patrimoniales.",
        "9.3. No debemos ningún efecto económico concreto de la eliminación (p. ej. evolución de ingresos, posicionamiento o reputación).",
      ] },
      { h: "10. Protección de datos", ps: [
        "La información sobre el tratamiento de datos personales se encuentra en nuestra [política de privacidad](@ds).",
      ] },
      { h: "11. Derecho de desistimiento para consumidores", ps: [
        "11.1. Los consumidores en el sentido de la KSchG disponen, en los contratos a distancia, del derecho legal de desistimiento conforme a la FAGG. Se aplica la [información sobre desistimiento con el formulario modelo](@widerruf).",
        "11.2. **Inicio anticipado:** Si el consumidor desea que comencemos el servicio antes de que expire el plazo de desistimiento (en particular por el plazo de tramitación de 24–48 horas), exigimos para ello una **declaración expresa** en el proceso de pedido junto con la confirmación de que conoce que el derecho de desistimiento se extingue con el cumplimiento íntegro del contrato (§ 18 apdo. 1 n.º 1 FAGG).",
        "11.3. Si el consumidor desiste tras el inicio de la prestación pero antes de su cumplimiento íntegro, deberá una remuneración proporcional por los servicios prestados hasta el desistimiento (§ 16 FAGG).",
      ] },
      { h: "12. Disposiciones finales", ps: [
        "12.1. Se aplica el Derecho austriaco con exclusión de la Convención de las Naciones Unidas sobre la Compraventa. Frente a consumidores con residencia habitual en otro Estado quedan inalteradas las disposiciones imperativas de protección del consumidor de ese Estado.",
        "12.2. El fuero para contratos con empresarios es el tribunal competente en la sede de RapidRemove. Para los consumidores rigen los fueros legales.",
        "12.3. La lengua del contrato es el alemán. Esta traducción se facilita únicamente a título informativo; prevalece la versión alemana.",
        "12.4. Si alguna disposición fuera ineficaz, la eficacia de las restantes no se verá afectada.",
      ] },
    ],
    upd: "Versión: junio de 2026",
  },
  wid: {
    title: "Derecho de desistimiento",
    sub: `Información sobre desistimiento para consumidores conforme a la FAGG, con formulario modelo. Parte contratante: ${CO}, ${ADDR}, Austria. Traducción de cortesía: la versión alemana es la vinculante.`,
    secs: [
      { h: "Derecho de desistimiento", ps: [
        "Tiene usted derecho a desistir del presente contrato en un plazo de catorce días sin necesidad de justificación. El plazo de desistimiento es de catorce días a partir del día de la celebración del contrato.",
        "Para ejercer su derecho de desistimiento, deberá notificarnos",
        `${CO}\n${ADDR}, Austria\nCorreo electrónico: ${MAIL}\nTeléfono: ${TEL}`,
        "su decisión de desistir del contrato mediante una declaración inequívoca (por ejemplo, una carta enviada por correo postal o un correo electrónico). Podrá utilizar el formulario modelo que figura a continuación, aunque su uso no es obligatorio.",
        "Para cumplir el plazo de desistimiento, basta con que la comunicación relativa al ejercicio de este derecho sea enviada antes de que venza el plazo.",
      ] },
      { h: "Consecuencias del desistimiento", ps: [
        "En caso de desistimiento por su parte, le devolveremos todos los pagos recibidos de usted sin demora indebida y, en todo caso, a más tardar catorce días a partir de la fecha en la que recibamos la comunicación de su desistimiento. Procederemos a efectuar dicho reembolso utilizando el mismo medio de pago empleado por usted para la transacción inicial, a no ser que se haya acordado expresamente otra cosa; en ningún caso incurrirá usted en gastos como consecuencia del reembolso.",
        "Si solicitó que el servicio comenzara durante el plazo de desistimiento, nos abonará un importe proporcional a la parte del servicio ya prestada en el momento en que nos comunique su desistimiento, en relación con el alcance total del servicio previsto en el contrato.",
      ] },
      { h: "Extinción del derecho de desistimiento", ps: [
        "El derecho de desistimiento se extingue anticipadamente si hemos prestado íntegramente el servicio y solo comenzamos su ejecución después de que usted diera su consentimiento expreso y confirmara al mismo tiempo que conoce que pierde su derecho de desistimiento con el cumplimiento íntegro del contrato por nuestra parte (§ 18 apdo. 1 n.º 1 FAGG).",
      ] },
      { h: "Formulario de desistimiento modelo", ps: [
        "(Si desea desistir del contrato, rellene este formulario y envíenoslo.)",
        `A: ${CO}, ${ADDR}, Austria, ${MAIL}`,
        "Por la presente declaro/declaramos (*) que desisto/desistimos (*) del contrato celebrado para la prestación del siguiente servicio:",
        "— Pedido el (*): ____________________\n— Nombre del consumidor / de los consumidores: ____________________\n— Dirección del consumidor / de los consumidores: ____________________\n— Firma del consumidor / de los consumidores (solo si se comunica en papel): ____________________\n— Fecha: ____________________",
        "(*) Táchese lo que no proceda.",
      ] },
    ],
    upd: "Versión: junio de 2026",
  },
};

/* ────────────────────────── FR ────────────────────────── */
TERMS.fr = {
  agb: {
    title: "Conditions générales de vente (CGV)",
    sub: `de ${CO}, ${ADDR}, Autriche (FN 470700g, tribunal régional de Salzbourg ; n° TVA ATU72401536), ci-après **« RapidRemove »** ou **« nous »**. Traduction de courtoisie — la version allemande fait foi.`,
    secs: [
      { h: "1. Champ d'application", ps: [
        "1.1. Les présentes CGV s'appliquent à tous les contrats entre RapidRemove et ses clients portant sur les prestations proposées sur rapid-remove.com.",
        "1.2. Le client peut être aussi bien un professionnel au sens du § 1 de la loi autrichienne sur la protection des consommateurs (KSchG) qu'un consommateur. Lorsque certaines dispositions ne s'appliquent qu'aux consommateurs ou qu'aux professionnels, cela est expressément indiqué. Notre offre s'adresse principalement aux professionnels (titulaires ou responsables de fiches d'établissement Google).",
        "1.3. Les conditions divergentes du client ne s'appliquent que si nous les avons expressément acceptées par écrit.",
      ] },
      { h: "2. Prestations", ps: [
        "2.1. **Suppression de fiche (« Remove ») :** Suppression définitive d'une fiche d'établissement Google (Google Business Profile / fiche Google Maps), y compris tous les avis associés, de l'affichage public des services Google. La suppression s'effectue exclusivement via les processus et interfaces officiels prévus par Google.",
        "2.2. **Suppression + nouvelle création (« Remove + Restart ») :** Prestation selon le point 2.1, plus la création d'une nouvelle fiche d'établissement Google avec les données correctes fournies par le client.",
        "2.3. **Refoulement de réputation :** Mesures continues visant à refouler de la recherche Google, au moyen d'autres contenus, les résultats négatifs désignés par le client. Il s'agit d'un **effort sans garantie de résultat** ; aucun résultat de classement déterminé n'est dû. Les détails (durée, étendue, reporting) résultent de l'offre concernée.",
        "2.4. **Désindexation de presse (mise en relation) :** RapidRemove **met en relation** avec un cabinet partenaire et assiste dans la demande. L'examen juridique et la représentation relèvent exclusivement du cabinet partenaire ; un contrat distinct est conclu entre le client et le cabinet partenaire. RapidRemove ne fournit **aucun conseil juridique** et ne doit aucun succès de désindexation.",
        "2.5. **Pas de suppression d'avis individuels :** L'objet de la prestation selon 2.1/2.2 est toujours la suppression de la fiche entière avec tous ses avis, et non la suppression d'avis individuels.",
        "2.6. **Pas de service juridique :** Toutes les prestations de RapidRemove sont de nature technico-organisationnelle. RapidRemove ne fournit ni conseil juridique ni représentation devant les autorités ou les tribunaux.",
      ] },
      { h: "3. Conclusion du contrat", ps: [
        "3.1. La vérification gratuite de suppression sur notre site est sans engagement et ne constitue pas une offre.",
        "3.2. Le contrat est conclu lorsque le client accepte notre offre (via le parcours de commande du site ou par e-mail) et que nous confirmons la mission, au plus tard toutefois au début de l'exécution de la prestation.",
        "3.3. **Habilitation :** Le client garantit qu'il est habilité à disposer de la fiche d'établissement concernée (en tant que titulaire de l'entreprise ou avec son mandat exprès). Il est interdit de commander la suppression de fiches de tiers sans habilitation ; le client garantit RapidRemove contre toute réclamation à cet égard.",
      ] },
      { h: "4. Obligations de coopération du client", ps: [
        "4.1. Le client confirme la fiche à supprimer et accorde l'autorisation de modification requise pour la fiche d'établissement. Un accès au compte Google, à Gmail, à Google Ads ou aux données personnelles du client n'est pas nécessaire à cet effet et ne sera pas demandé.",
        "4.2. Si l'exécution est retardée parce que le client ne fournit pas la coopération requise, les délais de traitement indiqués sont prolongés en conséquence.",
      ] },
      { h: "5. Délai de traitement", ps: [
        "5.1. La suppression intervient en règle générale dans un délai de **24 à 48 heures** à compter de la réception de toutes les coopérations selon le point 4. Il s'agit d'une indication approximative et non d'une échéance ferme. Nous ne répondons pas des retards dus aux processus internes de Google.",
      ] },
      { h: "6. Prix et paiement", ps: [
        "6.1. Les prix fixes indiqués sur le site ou dans l'offre au moment de la commande s'appliquent. Tous les prix indiqués sont des prix définitifs et s'entendent TVA légale éventuelle incluse. Selon la région du client, la facturation s'effectue en EUR ou en USD.",
        "6.2. **Paiement après succès (« No Cure, No Pay ») :** Pour les prestations selon 2.1 et 2.2, la rémunération n'est exigible qu'à la survenance du succès selon le point 7. À défaut de succès, le client ne doit aucune rémunération. Lors du traitement du paiement, une autorisation de paiement peut déjà intervenir à la commande ; le débit n'a lieu qu'après la survenance du succès.",
        "6.3. Pour le refoulement de réputation, les rémunérations indiquées dans l'offre s'appliquent (p. ex. audit unique, forfait mensuel) ; elles ne dépendent **pas** du succès, sauf accord exprès contraire.",
        "6.4. Moyens de paiement : les méthodes proposées dans le processus de commande (p. ex. carte bancaire, PayPal, Klarna, iDEAL) ; le traitement est assuré par des prestataires de paiement externes.",
      ] },
      { h: "7. Définition du succès, réception", ps: [
        "7.1. Le succès de la suppression de la fiche survient lorsque la fiche d'établissement commandée **n'est plus accessible publiquement** dans la recherche Google et sur Google Maps. Est déterminante la non-accessibilité de la fiche elle-même ; pour des raisons techniques (caches, sites tiers, synchronisation différée de certains services Google), certains contenus peuvent rester temporairement trouvables sans que cela empêche la survenance du succès.",
        "7.2. Nous informons le client de la survenance du succès. Le client peut soulever des objections dans un délai de 7 jours ; à défaut, la prestation est réputée réceptionnée.",
      ] },
      { h: "8. Protection contre la republication", ps: [
        "8.1. Si la fiche supprimée est de nouveau publiée publiquement par des tiers ou par des processus automatisés de Google pendant une protection contre la republication en cours, nous la supprimons de nouveau gratuitement sur notification du client. La période de protection dépend du forfait choisi : pour la **Protection mensuelle** et la **Surveillance quotidienne**, pendant la durée de l'abonnement en cours (résiliable mensuellement) ; pour la **Protection à vie**, de façon permanente. Avec la Surveillance quotidienne et la Protection à vie, nous vérifions en outre nous-mêmes en continu l'absence de republication, sans qu'une notification du client soit nécessaire.",
        "8.2. Ne sont pas couvertes les fiches que le client crée lui-même ou avec son accord, ainsi que les inscriptions de tiers substantiellement nouvelles et divergentes (p. ex. avec une autre adresse/raison sociale) qui ne constituent pas une résurgence de la fiche d'origine.",
      ] },
      { h: "9. Garantie et responsabilité", ps: [
        "9.1. Les dispositions légales en matière de garantie s'appliquent.",
        "9.2. Nous répondons sans limitation du dol et de la négligence grave ainsi que des dommages corporels. En cas de négligence légère, nous ne répondons pas — sauf dommages corporels ; à l'égard des professionnels, la responsabilité pour négligence légère, manque à gagner, dommages indirects et préjudices purement pécuniaires est exclue.",
        "9.3. Nous ne devons aucun effet économique déterminé de la suppression (p. ex. évolution du chiffre d'affaires, du classement ou de la réputation).",
      ] },
      { h: "10. Protection des données", ps: [
        "Les informations sur le traitement des données personnelles figurent dans notre [politique de confidentialité](@ds).",
      ] },
      { h: "11. Droit de rétractation des consommateurs", ps: [
        "11.1. Les consommateurs au sens de la KSchG bénéficient, pour les contrats à distance, du droit légal de rétractation selon la FAGG. L'[information sur la rétractation avec le formulaire type](@widerruf) s'applique.",
        "11.2. **Début anticipé :** Si le consommateur souhaite que nous commencions la prestation avant l'expiration du délai de rétractation (notamment en raison du délai de traitement de 24–48 heures), nous exigeons à cet effet une **déclaration expresse** dans le processus de commande, accompagnée de la confirmation qu'il sait que le droit de rétractation s'éteint en cas d'exécution intégrale du contrat (§ 18 al. 1 ch. 1 FAGG).",
        "11.3. Si le consommateur se rétracte après le début de la prestation mais avant son exécution intégrale, il doit une rémunération proportionnelle pour les prestations fournies jusqu'à la rétractation (§ 16 FAGG).",
      ] },
      { h: "12. Dispositions finales", ps: [
        "12.1. Le droit autrichien s'applique, à l'exclusion de la Convention des Nations unies sur les contrats de vente internationale de marchandises. À l'égard des consommateurs ayant leur résidence habituelle dans un autre État, les dispositions impératives de protection des consommateurs de cet État demeurent applicables.",
        "12.2. Le for des contrats avec des professionnels est le tribunal matériellement compétent au siège de RapidRemove. Pour les consommateurs, les fors légaux s'appliquent.",
        "12.3. La langue du contrat est l'allemand. La présente traduction est fournie à titre informatif ; la version allemande prévaut.",
        "12.4. Si certaines dispositions étaient invalides, la validité des autres dispositions n'en serait pas affectée.",
      ] },
    ],
    upd: "Version : juin 2026",
  },
  wid: {
    title: "Droit de rétractation",
    sub: `Information sur la rétractation pour les consommateurs selon la FAGG, avec formulaire type. Cocontractant : ${CO}, ${ADDR}, Autriche. Traduction de courtoisie — la version allemande fait foi.`,
    secs: [
      { h: "Droit de rétractation", ps: [
        "Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de quatorze jours. Le délai de rétractation expire quatorze jours après le jour de la conclusion du contrat.",
        "Pour exercer votre droit de rétractation, vous devez nous notifier",
        `${CO}\n${ADDR}, Autriche\nE-mail : ${MAIL}\nTéléphone : ${TEL}`,
        "votre décision de rétractation du présent contrat au moyen d'une déclaration dénuée d'ambiguïté (par exemple, lettre envoyée par la poste ou courrier électronique). Vous pouvez utiliser le modèle de formulaire de rétractation ci-dessous, mais ce n'est pas obligatoire.",
        "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l'exercice du droit de rétractation avant l'expiration du délai de rétractation.",
      ] },
      { h: "Effets de la rétractation", ps: [
        "En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous sans retard excessif et, en tout état de cause, au plus tard quatorze jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d'un moyen différent ; en tout état de cause, ce remboursement n'occasionnera pas de frais pour vous.",
        "Si vous avez demandé de commencer la prestation de services pendant le délai de rétractation, vous devrez nous payer un montant proportionnel à ce qui vous a été fourni jusqu'au moment où vous nous avez informés de votre rétractation du présent contrat, par rapport à l'ensemble des prestations prévues par le contrat.",
      ] },
      { h: "Extinction du droit de rétractation", ps: [
        "Le droit de rétractation s'éteint de manière anticipée si nous avons intégralement exécuté la prestation et si nous n'avons commencé son exécution qu'après que vous avez donné votre accord exprès et confirmé en même temps savoir que vous perdez votre droit de rétractation en cas d'exécution intégrale du contrat par nos soins (§ 18 al. 1 ch. 1 FAGG).",
      ] },
      { h: "Modèle de formulaire de rétractation", ps: [
        "(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat.)",
        `À : ${CO}, ${ADDR}, Autriche, ${MAIL}`,
        "Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la prestation de services ci-dessous :",
        "— Commandé le (*) : ____________________\n— Nom du (des) consommateur(s) : ____________________\n— Adresse du (des) consommateur(s) : ____________________\n— Signature du (des) consommateur(s) (uniquement en cas de notification sur papier) : ____________________\n— Date : ____________________",
        "(*) Rayez la mention inutile.",
      ] },
    ],
    upd: "Version : juin 2026",
  },
};

/* ────────────────────────── IT ────────────────────────── */
TERMS.it = {
  agb: {
    title: "Termini e condizioni (AGB)",
    sub: `di ${CO}, ${ADDR}, Austria (FN 470700g, Tribunale regionale di Salisburgo; P. IVA ATU72401536), di seguito **«RapidRemove»** o **«noi»**. Traduzione di cortesia — fa fede la versione tedesca.`,
    secs: [
      { h: "1. Ambito di applicazione", ps: [
        "1.1. I presenti termini si applicano a tutti i contratti tra RapidRemove e i suoi clienti relativi ai servizi offerti su rapid-remove.com.",
        "1.2. Il cliente può essere sia un imprenditore ai sensi del § 1 della legge austriaca sulla tutela dei consumatori (KSchG) sia un consumatore. Ove singole disposizioni valgano solo per i consumatori o solo per gli imprenditori, ciò è espressamente indicato. La nostra offerta si rivolge principalmente agli imprenditori (titolari o responsabili di profili aziendali Google).",
        "1.3. Condizioni divergenti del cliente si applicano solo se le abbiamo espressamente accettate per iscritto.",
      ] },
      { h: "2. Servizi", ps: [
        "2.1. **Rimozione del profilo («Remove»):** Rimozione permanente di un profilo aziendale Google (Google Business Profile / scheda Google Maps), comprese tutte le recensioni associate, dalla visualizzazione pubblica dei servizi Google. La rimozione avviene esclusivamente tramite i processi e le interfacce ufficiali previsti da Google.",
        "2.2. **Rimozione + nuova creazione («Remove + Restart»):** Servizio di cui al punto 2.1 più la creazione di un nuovo profilo aziendale Google con i dati corretti forniti dal cliente.",
        "2.3. **Spostamento della reputazione:** Misure continuative volte a spostare fuori dalla ricerca Google, tramite altri contenuti, i risultati negativi indicati dal cliente. Si tratta di un **impegno senza garanzia di risultato**; non è dovuto un determinato risultato di posizionamento. I dettagli (durata, ambito, reporting) risultano dalla relativa offerta.",
        "2.4. **Deindicizzazione stampa (intermediazione):** RapidRemove **media** il contatto con uno studio legale partner e assiste nella richiesta. L'esame legale e la rappresentanza spettano esclusivamente allo studio partner; tra cliente e studio partner si conclude un contratto separato. RapidRemove non fornisce **alcuna consulenza legale** e non deve alcun successo di deindicizzazione.",
        "2.5. **Nessuna rimozione di singole recensioni:** Oggetto del servizio di cui a 2.1/2.2 è sempre la rimozione dell'intero profilo con tutte le recensioni, non la rimozione di singole recensioni.",
        "2.6. **Nessun servizio legale:** Tutti i servizi di RapidRemove sono di natura tecnico-organizzativa. RapidRemove non fornisce consulenza legale né rappresentanza davanti ad autorità o tribunali.",
      ] },
      { h: "3. Conclusione del contratto", ps: [
        "3.1. La verifica gratuita di rimozione sul nostro sito non è vincolante e non costituisce un'offerta.",
        "3.2. Il contratto si conclude quando il cliente accetta la nostra offerta (tramite il percorso d'ordine del sito o via e-mail) e noi confermiamo l'incarico, al più tardi tuttavia con l'inizio dell'esecuzione del servizio.",
        "3.3. **Legittimazione:** Il cliente garantisce di essere legittimato a disporre del profilo aziendale in questione (quale titolare dell'azienda o con sua espressa procura). È vietato incaricare la rimozione di profili altrui senza legittimazione; il cliente manleva RapidRemove al riguardo.",
      ] },
      { h: "4. Obblighi di collaborazione del cliente", ps: [
        "4.1. Il cliente conferma il profilo da rimuovere e concede l'autorizzazione di modifica necessaria per il profilo aziendale. A tal fine non è necessario né viene richiesto l'accesso all'account Google, a Gmail, a Google Ads o ai dati personali del cliente.",
        "4.2. Se l'esecuzione subisce ritardi perché il cliente non fornisce la collaborazione necessaria, i tempi di lavorazione indicati si prolungano di conseguenza.",
      ] },
      { h: "5. Tempi di lavorazione", ps: [
        "5.1. La rimozione avviene di regola entro **24–48 ore** dalla disponibilità di tutte le collaborazioni di cui al punto 4. Si tratta di un'indicazione approssimativa, non di una scadenza fissa. Non rispondiamo dei ritardi dovuti a processi interni di Google.",
      ] },
      { h: "6. Prezzi e pagamento", ps: [
        "6.1. Si applicano i prezzi fissi indicati sul sito o nell'offerta al momento dell'incarico. Tutti i prezzi indicati sono prezzi finali e si intendono comprensivi dell'eventuale IVA di legge. A seconda della regione del cliente, la fatturazione avviene in EUR o USD.",
        "6.2. **Pagamento dopo il successo («No Cure, No Pay»):** Per i servizi di cui a 2.1 e 2.2 il compenso diventa esigibile solo con il verificarsi del successo di cui al punto 7. Se il successo non si verifica, il cliente non deve alcun compenso. Nell'elaborazione del pagamento, un'autorizzazione di pagamento può avvenire già al momento dell'incarico; l'addebito avviene solo dopo il verificarsi del successo.",
        "6.3. Per lo spostamento della reputazione valgono i compensi indicati nell'offerta (ad es. audit una tantum, canone mensile); questi **non** dipendono dal successo, salvo espresso accordo contrario.",
        "6.4. Modalità di pagamento: i metodi offerti nel processo d'ordine (ad es. carta di credito, PayPal, Klarna, iDEAL); l'elaborazione avviene tramite fornitori di pagamento esterni.",
      ] },
      { h: "7. Definizione del successo, accettazione", ps: [
        "7.1. Il successo della rimozione del profilo si verifica quando il profilo aziendale incaricato **non è più pubblicamente raggiungibile** nella ricerca Google e su Google Maps. Decisiva è la non raggiungibilità del profilo stesso; per motivi tecnici (cache, siti di terzi, sincronizzazione differita di singoli servizi Google) singoli contenuti possono rimanere temporaneamente reperibili senza che ciò impedisca il verificarsi del successo.",
        "7.2. Informiamo il cliente del verificarsi del successo. Il cliente può sollevare obiezioni entro 7 giorni; in caso contrario il servizio si considera accettato.",
      ] },
      { h: "8. Protezione contro la ripubblicazione", ps: [
        "8.1. Se il profilo rimosso viene nuovamente pubblicato da terzi o da processi automatizzati di Google durante una protezione contro la ripubblicazione in corso, lo rimuoviamo di nuovo gratuitamente su segnalazione del cliente. Il periodo di protezione dipende dal pacchetto scelto: con la **Protezione mensile** e il **Monitoraggio giornaliero** per la durata dell'abbonamento attivo (disdicibile mensilmente); con la **Protezione a vita** in modo permanente. Con il Monitoraggio giornaliero e la Protezione a vita verifichiamo inoltre noi stessi in modo continuativo eventuali ripubblicazioni, senza necessità di segnalazione da parte del cliente.",
        "8.2. Non sono coperti i profili che il cliente crea nuovamente da sé o con il suo consenso, né le voci di terzi sostanzialmente nuove e divergenti (ad es. con altro indirizzo/denominazione) che non costituiscono una rinascita del profilo originario.",
      ] },
      { h: "9. Garanzia e responsabilità", ps: [
        "9.1. Si applicano le disposizioni di legge in materia di garanzia.",
        "9.2. Rispondiamo illimitatamente per dolo e colpa grave nonché per danni alle persone. In caso di colpa lieve non rispondiamo — salvo danni alle persone; nei confronti degli imprenditori è esclusa la responsabilità per colpa lieve, mancato guadagno, danni indiretti e danni puramente patrimoniali.",
        "9.3. Non dobbiamo alcun determinato effetto economico della rimozione (ad es. andamento di fatturato, posizionamento o reputazione).",
      ] },
      { h: "10. Protezione dei dati", ps: [
        "Le informazioni sul trattamento dei dati personali si trovano nella nostra [informativa sulla privacy](@ds).",
      ] },
      { h: "11. Diritto di recesso per i consumatori", ps: [
        "11.1. Ai consumatori ai sensi della KSchG spetta, nei contratti a distanza, il diritto legale di recesso secondo la FAGG. Si applica l'[informativa sul recesso con modulo tipo](@widerruf).",
        "11.2. **Inizio anticipato:** Se il consumatore desidera che iniziamo il servizio prima della scadenza del termine di recesso (in particolare per i tempi di lavorazione di 24–48 ore), richiediamo a tal fine una **dichiarazione espressa** nel processo d'ordine, con conferma di essere a conoscenza che il diritto di recesso si estingue con il completo adempimento del contratto (§ 18 c. 1 n. 1 FAGG).",
        "11.3. Se il consumatore recede dopo l'inizio dell'esecuzione ma prima del completo adempimento, deve un compenso proporzionale per i servizi resi fino al recesso (§ 16 FAGG).",
      ] },
      { h: "12. Disposizioni finali", ps: [
        "12.1. Si applica il diritto austriaco con esclusione della Convenzione ONU sulla vendita. Nei confronti dei consumatori con residenza abituale in un altro Stato restano salve le disposizioni imperative di tutela dei consumatori di tale Stato.",
        "12.2. Foro competente per i contratti con imprenditori è il tribunale competente per materia presso la sede di RapidRemove. Per i consumatori valgono i fori legali.",
        "12.3. La lingua del contratto è il tedesco. La presente traduzione è fornita a solo scopo informativo; prevale la versione tedesca.",
        "12.4. L'eventuale invalidità di singole disposizioni non pregiudica la validità delle restanti.",
      ] },
    ],
    upd: "Versione: giugno 2026",
  },
  wid: {
    title: "Diritto di recesso",
    sub: `Informativa sul recesso per i consumatori ai sensi della FAGG, con modulo tipo. Controparte contrattuale: ${CO}, ${ADDR}, Austria. Traduzione di cortesia — fa fede la versione tedesca.`,
    secs: [
      { h: "Diritto di recesso", ps: [
        "Lei ha il diritto di recedere dal presente contratto entro quattordici giorni senza dover fornire alcuna motivazione. Il termine di recesso è di quattordici giorni dal giorno della conclusione del contratto.",
        "Per esercitare il diritto di recesso, Lei deve informarci",
        `${CO}\n${ADDR}, Austria\nE-mail: ${MAIL}\nTelefono: ${TEL}`,
        "della Sua decisione di recedere dal presente contratto tramite una dichiarazione esplicita (ad esempio una lettera inviata per posta o un'e-mail). A tal fine può utilizzare il modulo tipo di recesso riportato di seguito, il cui uso però non è obbligatorio.",
        "Per rispettare il termine di recesso è sufficiente che Lei invii la comunicazione relativa all'esercizio del diritto di recesso prima della scadenza del termine di recesso.",
      ] },
      { h: "Effetti del recesso", ps: [
        "Se Lei recede dal presente contratto, Le saranno rimborsati tutti i pagamenti che ha effettuato a nostro favore senza indebito ritardo e comunque entro quattordici giorni dal giorno in cui siamo informati della Sua decisione di recedere dal presente contratto. Detti rimborsi saranno effettuati utilizzando lo stesso mezzo di pagamento da Lei usato per la transazione iniziale, salvo che sia stato espressamente convenuto altrimenti; in ogni caso non dovrà sostenere alcun costo quale conseguenza di tale rimborso.",
        "Se ha chiesto che il servizio inizi durante il periodo di recesso, è tenuto a pagarci un importo proporzionale a quanto fornito fino al momento in cui ci ha comunicato il Suo recesso dal presente contratto, rispetto a tutte le prestazioni previste dal contratto.",
      ] },
      { h: "Estinzione del diritto di recesso", ps: [
        "Il diritto di recesso si estingue anticipatamente se abbiamo eseguito integralmente il servizio e abbiamo iniziato l'esecuzione solo dopo che Lei ha dato il Suo espresso consenso e ha confermato al contempo di essere a conoscenza che perde il diritto di recesso con il completo adempimento del contratto da parte nostra (§ 18 c. 1 n. 1 FAGG).",
      ] },
      { h: "Modulo tipo di recesso", ps: [
        "(Se desidera recedere dal contratto, compili il presente modulo e lo rinvii.)",
        `A: ${CO}, ${ADDR}, Austria, ${MAIL}`,
        "Con la presente io/noi (*) notifichiamo il recesso dal mio/nostro (*) contratto per la prestazione del seguente servizio:",
        "— Ordinato il (*): ____________________\n— Nome del/dei consumatore/i: ____________________\n— Indirizzo del/dei consumatore/i: ____________________\n— Firma del/dei consumatore/i (solo se il modulo è notificato in versione cartacea): ____________________\n— Data: ____________________",
        "(*) Cancellare la dicitura inutile.",
      ] },
    ],
    upd: "Versione: giugno 2026",
  },
};

/* ────────────────────────── NL ────────────────────────── */
TERMS.nl = {
  agb: {
    title: "Algemene voorwaarden (AGB)",
    sub: `van ${CO}, ${ADDR}, Oostenrijk (FN 470700g, Landesgericht Salzburg; btw-nr. ATU72401536), hierna **„RapidRemove“** of **„wij“**. Gemaksvertaling — de Duitse versie is bindend.`,
    secs: [
      { h: "1. Toepassingsgebied", ps: [
        "1.1. Deze voorwaarden gelden voor alle overeenkomsten tussen RapidRemove en haar klanten over de op rapid-remove.com aangeboden diensten.",
        "1.2. De klant kan zowel ondernemer in de zin van § 1 van de Oostenrijkse consumentenwet (KSchG) als consument zijn. Voor zover afzonderlijke bepalingen alleen voor consumenten of alleen voor ondernemers gelden, is dit uitdrukkelijk vermeld. Ons aanbod richt zich primair op ondernemers (eigenaren of verantwoordelijken van Google-bedrijfsprofielen).",
        "1.3. Afwijkende voorwaarden van de klant gelden alleen als wij daarmee uitdrukkelijk schriftelijk hebben ingestemd.",
      ] },
      { h: "2. Diensten", ps: [
        "2.1. **Profielverwijdering („Remove“):** Permanente verwijdering van een Google-bedrijfsprofiel (Google Business Profile / Google Maps-vermelding) inclusief alle bijbehorende reviews uit de openbare weergave van de Google-diensten. De verwijdering gebeurt uitsluitend via officiële, door Google voorziene processen en interfaces.",
        "2.2. **Profielverwijdering + nieuwe aanmaak („Remove + Restart“):** Dienst volgens punt 2.1 plus het opzetten van een nieuw Google-bedrijfsprofiel met de door de klant aangeleverde correcte bedrijfsgegevens.",
        "2.3. **Reputatieverdringing:** Doorlopende maatregelen met het doel door de klant benoemde negatieve zoekresultaten in Google Zoeken door andere content te verdringen. Het betreft een **inspanning zonder succesgarantie**; een bepaald rankingresultaat is niet verschuldigd. Details (looptijd, omvang, rapportage) volgen uit de betreffende offerte.",
        "2.4. **Pers-deïndexering (bemiddeling):** RapidRemove **bemiddelt** het contact met een partnerkantoor en ondersteunt bij de aanvraag. De juridische beoordeling en vertegenwoordiging gebeuren uitsluitend door het partnerkantoor; tussen klant en partnerkantoor komt een afzonderlijke overeenkomst tot stand. RapidRemove verleent **geen juridisch advies** en is geen deïndexeringssucces verschuldigd.",
        "2.5. **Geen verwijdering van afzonderlijke reviews:** Voorwerp van de dienst volgens 2.1/2.2 is steeds de verwijdering van het volledige profiel met alle reviews, niet de verwijdering van afzonderlijke recensies.",
        "2.6. **Geen juridische dienstverlening:** Alle diensten van RapidRemove zijn technisch-organisatorisch van aard. RapidRemove verleent geen juridisch advies en geen vertegenwoordiging voor autoriteiten of rechtbanken.",
      ] },
      { h: "3. Totstandkoming van de overeenkomst", ps: [
        "3.1. De gratis verwijdercheck op onze website is vrijblijvend en vormt geen aanbod.",
        "3.2. De overeenkomst komt tot stand wanneer de klant ons aanbod aanvaardt (via het bestelproces op de website of per e-mail) en wij de opdracht bevestigen, uiterlijk echter bij aanvang van de dienstverlening.",
        "3.3. **Bevoegdheid:** De klant staat ervoor in dat hij bevoegd is over het betreffende bedrijfsprofiel te beschikken (als eigenaar van de onderneming of met diens uitdrukkelijke volmacht). Het opdragen van de verwijdering van andermans profielen zonder bevoegdheid is verboden; de klant vrijwaart RapidRemove in zoverre.",
      ] },
      { h: "4. Medewerkingsplichten van de klant", ps: [
        "4.1. De klant bevestigt het te verwijderen profiel en verleent de vereiste bewerkingsrechten voor het bedrijfsprofiel. Toegang tot het Google-account, Gmail, Google Ads of persoonlijke gegevens van de klant is daarvoor niet nodig en wordt niet gevraagd.",
        "4.2. Loopt de dienstverlening vertraging op doordat de klant vereiste medewerking niet verleent, dan worden genoemde verwerkingstijden dienovereenkomstig verlengd.",
      ] },
      { h: "5. Verwerkingstijd", ps: [
        "5.1. De verwijdering vindt in de regel plaats binnen **24 tot 48 uur** nadat alle medewerking volgens punt 4 voorligt. Het betreft een circa-indicatie, geen fatale termijn. Vertragingen door Google-interne processen komen niet voor onze rekening.",
      ] },
      { h: "6. Prijzen en betaling", ps: [
        "6.1. De op het moment van de opdracht op de website resp. in de offerte vermelde vaste prijzen gelden. Alle vermelde prijzen zijn eindprijzen en zijn inclusief eventuele wettelijke btw. Afhankelijk van de regio van de klant wordt gefactureerd in EUR of USD.",
        "6.2. **Betaling na succes („No Cure, No Pay“):** Voor diensten volgens 2.1 en 2.2 wordt de vergoeding pas verschuldigd bij het intreden van het succes volgens punt 7. Blijft het succes uit, dan is de klant geen vergoeding verschuldigd. Bij de betalingsafwikkeling kan een betalingsautorisatie al bij de opdracht plaatsvinden; de afschrijving gebeurt pas na het intreden van het succes.",
        "6.3. Voor reputatieverdringing gelden de in de offerte genoemde vergoedingen (bijv. eenmalige audit, maandelijkse retainer); deze zijn **niet** succesafhankelijk, tenzij uitdrukkelijk anders overeengekomen.",
        "6.4. Betaalmethoden: de in het bestelproces aangeboden methoden (bijv. creditcard, PayPal, Klarna, iDEAL); de afwikkeling verloopt via externe betaaldienstverleners.",
      ] },
      { h: "7. Succesdefinitie, acceptatie", ps: [
        "7.1. Het succes van de profielverwijdering treedt in wanneer het opgedragen bedrijfsprofiel in Google Zoeken en op Google Maps **publiek niet meer oproepbaar** is. Bepalend is de niet-oproepbaarheid van het profiel zelf; om technische redenen (caches, sites van derden, vertraagde synchronisatie van afzonderlijke Google-diensten) kunnen afzonderlijke inhouden tijdelijk nog vindbaar zijn zonder dat dit het intreden van het succes verhindert.",
        "7.2. Wij informeren de klant over het intreden van het succes. De klant kan binnen 7 dagen bezwaren indienen; anders geldt de dienst als geaccepteerd.",
      ] },
      { h: "8. Bescherming tegen herplaatsing", ps: [
        "8.1. Wordt het verwijderde profiel tijdens een lopende herplaatsingsbescherming door derden of door geautomatiseerde Google-processen opnieuw openbaar geplaatst, dan verwijderen wij het op melding van de klant kosteloos opnieuw. De beschermingsperiode hangt af van het gekozen pakket: bij de **Maandelijkse bescherming** en bij **Dagelijkse monitoring** voor de looptijd van het lopende abonnement (telkens maandelijks opzegbaar), bij de **Levenslange bescherming** permanent. Bij Dagelijkse monitoring en bij de Levenslange bescherming controleren wij bovendien zelf doorlopend op herplaatsingen, zonder dat een melding van de klant nodig is.",
        "8.2. Niet gedekt zijn profielen die de klant zelf of met zijn instemming opnieuw aanmaakt, alsmede inhoudelijk nieuwe, afwijkende vermeldingen van derden (bijv. met ander adres/andere firmanaam) die geen herleving van het oorspronkelijke profiel vormen.",
      ] },
      { h: "9. Garantie en aansprakelijkheid", ps: [
        "9.1. De wettelijke garantiebepalingen zijn van toepassing.",
        "9.2. Wij zijn onbeperkt aansprakelijk voor opzet en grove nalatigheid alsmede voor personenschade. Bij lichte nalatigheid zijn wij — behalve bij personenschade — niet aansprakelijk; jegens ondernemers is de aansprakelijkheid voor lichte nalatigheid, gederfde winst, gevolgschade en zuivere vermogensschade uitgesloten.",
        "9.3. Wij zijn geen bepaald economisch effect van de verwijdering verschuldigd (bijv. omzet-, ranking- of reputatieontwikkeling).",
      ] },
      { h: "10. Gegevensbescherming", ps: [
        "Informatie over de verwerking van persoonsgegevens vindt u in ons [privacybeleid](@ds).",
      ] },
      { h: "11. Herroepingsrecht voor consumenten", ps: [
        "11.1. Consumenten in de zin van de KSchG hebben bij overeenkomsten op afstand het wettelijke herroepingsrecht volgens de FAGG. De [herroepingsinformatie met modelformulier](@widerruf) is van toepassing.",
        "11.2. **Vervroegde aanvang:** Wenst de consument dat wij vóór het verstrijken van de herroepingstermijn met de dienst beginnen (met name vanwege de verwerkingstijd van 24–48 uur), dan verlangen wij daarvoor een **uitdrukkelijke verklaring** in het bestelproces samen met de bevestiging van de kennisneming dat het herroepingsrecht bij volledige nakoming van de overeenkomst vervalt (§ 18 lid 1 nr. 1 FAGG).",
        "11.3. Herroept de consument na aanvang van de dienstverlening maar vóór volledige nakoming, dan is hij een evenredige vergoeding verschuldigd voor de tot de herroeping verrichte diensten (§ 16 FAGG).",
      ] },
      { h: "12. Slotbepalingen", ps: [
        "12.1. Oostenrijks recht is van toepassing met uitsluiting van het Weens Koopverdrag. Jegens consumenten met gewone verblijfplaats in een andere staat blijven de dwingende consumentenbeschermingsbepalingen van die staat onverlet.",
        "12.2. Bevoegde rechter voor overeenkomsten met ondernemers is de materieel bevoegde rechter in de vestigingsplaats van RapidRemove. Voor consumenten gelden de wettelijke bevoegde rechters.",
        "12.3. De contracttaal is Duits. Deze vertaling dient uitsluitend ter informatie; de Duitse versie prevaleert.",
        "12.4. Mochten afzonderlijke bepalingen ongeldig zijn, dan blijft de geldigheid van de overige bepalingen onverlet.",
      ] },
    ],
    upd: "Versie: juni 2026",
  },
  wid: {
    title: "Herroepingsrecht",
    sub: `Herroepingsinformatie voor consumenten volgens de FAGG, met modelformulier. Contractpartij: ${CO}, ${ADDR}, Oostenrijk. Gemaksvertaling — de Duitse versie is bindend.`,
    secs: [
      { h: "Herroepingsrecht", ps: [
        "U heeft het recht om binnen een termijn van veertien dagen zonder opgave van redenen de overeenkomst te herroepen. De herroepingstermijn bedraagt veertien dagen vanaf de dag van de sluiting van de overeenkomst.",
        "Om het herroepingsrecht uit te oefenen, moet u ons",
        `${CO}\n${ADDR}, Oostenrijk\nE-mail: ${MAIL}\nTelefoon: ${TEL}`,
        "via een ondubbelzinnige verklaring (bijv. een per post verzonden brief of een e-mail) op de hoogte stellen van uw beslissing de overeenkomst te herroepen. U kunt hiervoor gebruikmaken van het onderstaande modelformulier voor herroeping, maar bent hiertoe niet verplicht.",
        "Om de herroepingstermijn na te leven volstaat het om uw mededeling betreffende uw uitoefening van het herroepingsrecht te verzenden voordat de herroepingstermijn is verstreken.",
      ] },
      { h: "Gevolgen van de herroeping", ps: [
        "Als u de overeenkomst herroept, ontvangt u alle betalingen die u tot op dat moment heeft gedaan onverwijld en in ieder geval niet later dan veertien dagen nadat wij op de hoogte zijn gesteld van uw beslissing de overeenkomst te herroepen, van ons terug. Wij betalen u terug met hetzelfde betaalmiddel als waarmee u de oorspronkelijke transactie heeft verricht, tenzij u uitdrukkelijk anderszins heeft ingestemd; in ieder geval zullen u voor zulke terugbetaling geen kosten in rekening worden gebracht.",
        "Als u heeft verzocht om de verrichting van diensten te laten beginnen tijdens de herroepingstermijn, betaalt u een bedrag dat evenredig is aan hetgeen op het moment dat u ons ervan in kennis heeft gesteld dat u de overeenkomst herroept reeds geleverd is, vergeleken met de volledige uitvoering van de overeenkomst.",
      ] },
      { h: "Verval van het herroepingsrecht", ps: [
        "Het herroepingsrecht vervalt voortijdig wanneer wij de dienst volledig hebben verricht en pas met de uitvoering van de dienst zijn begonnen nadat u daartoe uw uitdrukkelijke toestemming heeft gegeven en tegelijkertijd heeft bevestigd te weten dat u uw herroepingsrecht verliest zodra wij de overeenkomst volledig zijn nagekomen (§ 18 lid 1 nr. 1 FAGG).",
      ] },
      { h: "Modelformulier voor herroeping", ps: [
        "(Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt herroepen.)",
        `Aan: ${CO}, ${ADDR}, Oostenrijk, ${MAIL}`,
        "Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst betreffende de verrichting van de volgende dienst herroep/herroepen (*):",
        "— Besteld op (*): ____________________\n— Naam consument(en): ____________________\n— Adres consument(en): ____________________\n— Handtekening consument(en) (alleen wanneer dit formulier op papier wordt ingediend): ____________________\n— Datum: ____________________",
        "(*) Doorhalen wat niet van toepassing is.",
      ] },
    ],
    upd: "Versie: juni 2026",
  },
};

/* ────────────────────────── PT ────────────────────────── */
TERMS.pt = {
  agb: {
    title: "Termos e condições (AGB)",
    sub: `da ${CO}, ${ADDR}, Áustria (FN 470700g, Tribunal Regional de Salzburgo; NIF-IVA ATU72401536), doravante **«RapidRemove»** ou **«nós»**. Tradução de cortesia — a versão alemã é a vinculativa.`,
    secs: [
      { h: "1. Âmbito de aplicação", ps: [
        "1.1. Estes termos aplicam-se a todos os contratos entre a RapidRemove e os seus clientes relativos aos serviços oferecidos em rapid-remove.com.",
        "1.2. O cliente pode ser tanto empresário na aceção do § 1 da lei austríaca de proteção do consumidor (KSchG) como consumidor. Quando determinadas disposições se apliquem apenas a consumidores ou apenas a empresários, tal é expressamente indicado. A nossa oferta dirige-se primariamente a empresários (titulares ou responsáveis por perfis de empresa Google).",
        "1.3. Condições divergentes do cliente só se aplicam se as tivermos aceitado expressamente por escrito.",
      ] },
      { h: "2. Serviços", ps: [
        "2.1. **Remoção do perfil («Remove»):** Remoção permanente de um perfil de empresa Google (Google Business Profile / ficha do Google Maps), incluindo todas as avaliações associadas, da exibição pública dos serviços Google. A remoção é efetuada exclusivamente através dos processos e interfaces oficiais previstos pela Google.",
        "2.2. **Remoção + nova criação («Remove + Restart»):** Serviço nos termos do ponto 2.1, acrescido da criação de um novo perfil de empresa Google com os dados corretos fornecidos pelo cliente.",
        "2.3. **Supressão de reputação:** Medidas contínuas com o objetivo de afastar da pesquisa Google, através de outros conteúdos, os resultados negativos indicados pelo cliente. Trata-se de um **esforço sem garantia de êxito**; não é devido um resultado de posicionamento específico. Os detalhes (duração, âmbito, relatórios) resultam da respetiva proposta.",
        "2.4. **Desindexação de imprensa (intermediação):** A RapidRemove **intermedeia** o contacto com um escritório de advogados parceiro e apoia no pedido. A análise jurídica e a representação cabem exclusivamente ao escritório parceiro; entre o cliente e o escritório parceiro é celebrado um contrato separado. A RapidRemove **não presta aconselhamento jurídico** e não deve qualquer êxito de desindexação.",
        "2.5. **Sem remoção de avaliações individuais:** O objeto do serviço nos termos de 2.1/2.2 é sempre a remoção do perfil completo com todas as avaliações, não a remoção de avaliações individuais.",
        "2.6. **Sem serviços jurídicos:** Todos os serviços da RapidRemove são de natureza técnico-organizativa. A RapidRemove não presta aconselhamento jurídico nem representação perante autoridades ou tribunais.",
      ] },
      { h: "3. Celebração do contrato", ps: [
        "3.1. A verificação gratuita de remoção no nosso site não é vinculativa e não constitui uma proposta.",
        "3.2. O contrato é celebrado quando o cliente aceita a nossa proposta (através do processo de encomenda do site ou por e-mail) e nós confirmamos a adjudicação, o mais tardar, porém, com o início da prestação do serviço.",
        "3.3. **Legitimidade:** O cliente garante que está legitimado a dispor do perfil de empresa em causa (como titular da empresa ou com a sua procuração expressa). É proibido encomendar a remoção de perfis alheios sem legitimidade; o cliente exonera a RapidRemove de qualquer responsabilidade a este respeito.",
      ] },
      { h: "4. Deveres de colaboração do cliente", ps: [
        "4.1. O cliente confirma o perfil a remover e concede a autorização de edição necessária para o perfil de empresa. Para tal não é necessário nem solicitado acesso à conta Google, ao Gmail, ao Google Ads ou a dados pessoais do cliente.",
        "4.2. Se a prestação se atrasar porque o cliente não presta a colaboração necessária, os prazos de processamento indicados prolongam-se em conformidade.",
      ] },
      { h: "5. Prazo de processamento", ps: [
        "5.1. A remoção é efetuada, em regra, no prazo de **24 a 48 horas** a contar da disponibilidade de toda a colaboração nos termos do ponto 4. Trata-se de uma indicação aproximada, não de um prazo fixo. Não respondemos por atrasos devidos a processos internos da Google.",
      ] },
      { h: "6. Preços e pagamento", ps: [
        "6.1. Aplicam-se os preços fixos indicados no site ou na proposta no momento da adjudicação. Todos os preços indicados são preços finais e incluem o IVA legal eventualmente aplicável. Consoante a região do cliente, a faturação é feita em EUR ou USD.",
        "6.2. **Pagamento após êxito («No Cure, No Pay»):** Para os serviços nos termos de 2.1 e 2.2, a remuneração só se vence com a ocorrência do êxito nos termos do ponto 7. Se o êxito não ocorrer, o cliente não deve qualquer remuneração. No processamento do pagamento, pode ocorrer uma autorização de pagamento logo na adjudicação; o débito só é efetuado após a ocorrência do êxito.",
        "6.3. Para a supressão de reputação aplicam-se as remunerações indicadas na proposta (p. ex. auditoria única, avença mensal); estas **não** dependem do êxito, salvo acordo expresso em contrário.",
        "6.4. Formas de pagamento: os métodos oferecidos no processo de encomenda (p. ex. cartão de crédito, PayPal, Klarna, iDEAL); o processamento é efetuado por prestadores de pagamento externos.",
      ] },
      { h: "7. Definição de êxito, aceitação", ps: [
        "7.1. O êxito da remoção do perfil ocorre quando o perfil de empresa adjudicado **deixa de estar publicamente acessível** na pesquisa Google e no Google Maps. Determinante é a inacessibilidade do próprio perfil; por razões técnicas (caches, sites de terceiros, sincronização diferida de determinados serviços Google), alguns conteúdos podem permanecer temporariamente localizáveis sem que tal impeça a ocorrência do êxito.",
        "7.2. Informamos o cliente da ocorrência do êxito. O cliente pode apresentar objeções no prazo de 7 dias; caso contrário, o serviço considera-se aceite.",
      ] },
      { h: "8. Proteção contra republicação", ps: [
        "8.1. Se o perfil removido voltar a ser publicado publicamente por terceiros ou por processos automatizados da Google durante uma proteção contra republicação em vigor, removemo-lo de novo gratuitamente mediante comunicação do cliente. O período de proteção depende do pacote escolhido: na **Proteção mensal** e na **Monitorização diária**, durante a vigência da subscrição ativa (cancelável mensalmente); na **Proteção vitalícia**, de forma permanente. Na Monitorização diária e na Proteção vitalícia verificamos, além disso, nós próprios continuamente a existência de republicações, sem necessidade de comunicação do cliente.",
        "8.2. Não estão abrangidos os perfis que o próprio cliente crie de novo ou que sejam criados com o seu consentimento, nem entradas de terceiros substancialmente novas e divergentes (p. ex. com outro endereço/denominação) que não constituam um renascimento do perfil original.",
      ] },
      { h: "9. Garantia e responsabilidade", ps: [
        "9.1. Aplicam-se as disposições legais de garantia.",
        "9.2. Respondemos de forma ilimitada por dolo e negligência grosseira, bem como por danos pessoais. Em caso de negligência leve não respondemos — exceto por danos pessoais; perante empresários fica excluída a responsabilidade por negligência leve, lucros cessantes, danos indiretos e danos puramente patrimoniais.",
        "9.3. Não devemos qualquer efeito económico específico da remoção (p. ex. evolução de receitas, posicionamento ou reputação).",
      ] },
      { h: "10. Proteção de dados", ps: [
        "As informações sobre o tratamento de dados pessoais encontram-se na nossa [política de privacidade](@ds).",
      ] },
      { h: "11. Direito de retratação para consumidores", ps: [
        "11.1. Os consumidores na aceção da KSchG dispõem, nos contratos à distância, do direito legal de retratação nos termos da FAGG. Aplica-se a [informação sobre retratação com formulário modelo](@widerruf).",
        "11.2. **Início antecipado:** Se o consumidor desejar que iniciemos o serviço antes do termo do prazo de retratação (em particular devido ao prazo de processamento de 24–48 horas), exigimos para tal uma **declaração expressa** no processo de encomenda, juntamente com a confirmação de que tem conhecimento de que o direito de retratação se extingue com o cumprimento integral do contrato (§ 18 n.º 1 al. 1 FAGG).",
        "11.3. Se o consumidor se retratar após o início da prestação mas antes do cumprimento integral, deve uma remuneração proporcional pelos serviços prestados até à retratação (§ 16 FAGG).",
      ] },
      { h: "12. Disposições finais", ps: [
        "12.1. Aplica-se o direito austríaco, com exclusão da Convenção da ONU sobre a compra e venda. Perante consumidores com residência habitual noutro Estado, permanecem inalteradas as disposições imperativas de proteção do consumidor desse Estado.",
        "12.2. O foro competente para contratos com empresários é o tribunal materialmente competente na sede da RapidRemove. Para os consumidores aplicam-se os foros legais.",
        "12.3. A língua do contrato é o alemão. Esta tradução é disponibilizada apenas a título informativo; prevalece a versão alemã.",
        "12.4. Se determinadas disposições forem inválidas, a validade das restantes não é afetada.",
      ] },
    ],
    upd: "Versão: junho de 2026",
  },
  wid: {
    title: "Direito de retratação",
    sub: `Informação sobre retratação para consumidores nos termos da FAGG, com formulário modelo. Parte contratante: ${CO}, ${ADDR}, Áustria. Tradução de cortesia — a versão alemã é a vinculativa.`,
    secs: [
      { h: "Direito de retratação", ps: [
        "Tem o direito de se retratar do presente contrato no prazo de catorze dias sem indicar qualquer motivo. O prazo de retratação é de catorze dias a contar do dia da celebração do contrato.",
        "Para exercer o seu direito de retratação, deve comunicar-nos",
        `${CO}\n${ADDR}, Áustria\nE-mail: ${MAIL}\nTelefone: ${TEL}`,
        "a sua decisão de retratação do presente contrato por meio de uma declaração inequívoca (por exemplo, carta enviada pelo correio ou e-mail). Pode utilizar o formulário modelo de retratação abaixo, que, porém, não é obrigatório.",
        "Para que o prazo de retratação seja respeitado, basta que envie a comunicação relativa ao exercício do direito de retratação antes do termo do prazo de retratação.",
      ] },
      { h: "Efeitos da retratação", ps: [
        "Em caso de retratação do presente contrato, ser-lhe-ão reembolsados todos os pagamentos que recebemos de si, sem demora injustificada e, em qualquer caso, o mais tardar catorze dias a contar da data em que formos informados da sua decisão de retratação do presente contrato. Efetuamos esse reembolso usando o mesmo meio de pagamento que utilizou na transação inicial, salvo acordo expresso em contrário; em qualquer caso, não incorre em quaisquer custos como consequência de tal reembolso.",
        "Se solicitou que o serviço se iniciasse durante o prazo de retratação, deve pagar-nos um montante proporcional ao que já foi prestado até ao momento em que nos comunicou a sua retratação do presente contrato, em relação ao conjunto das prestações previstas no contrato.",
      ] },
      { h: "Extinção do direito de retratação", ps: [
        "O direito de retratação extingue-se antecipadamente se tivermos prestado integralmente o serviço e só tivermos começado a executá-lo depois de o consumidor ter dado o seu consentimento expresso e confirmado, em simultâneo, que tem conhecimento de que perde o seu direito de retratação com o cumprimento integral do contrato pela nossa parte (§ 18 n.º 1 al. 1 FAGG).",
      ] },
      { h: "Formulário modelo de retratação", ps: [
        "(Se pretende retratar-se do contrato, preencha este formulário e devolva-o.)",
        `Para: ${CO}, ${ADDR}, Áustria, ${MAIL}`,
        "Pela presente comunico/comunicamos (*) que me retrato/nos retratamos (*) do contrato celebrado relativo à prestação do seguinte serviço:",
        "— Encomendado em (*): ____________________\n— Nome do(s) consumidor(es): ____________________\n— Endereço do(s) consumidor(es): ____________________\n— Assinatura do(s) consumidor(es) (apenas em caso de comunicação em papel): ____________________\n— Data: ____________________",
        "(*) Riscar o que não interessa.",
      ] },
    ],
    upd: "Versão: junho de 2026",
  },
};

/* ────────────────────────── JA ────────────────────────── */
TERMS.ja = {
  agb: {
    title: "利用規約（AGB）",
    sub: `${CO}（${ADDR}、オーストリア。FN 470700g、ザルツブルク地方裁判所。VAT番号 ATU72401536）、以下**「RapidRemove」**または**「当社」**といいます。本訳は参考訳であり、ドイツ語版が優先します。`,
    secs: [
      { h: "1. 適用範囲", ps: [
        "1.1. 本規約は、rapid-remove.com で提供されるサービスに関する、RapidRemoveとその顧客との間のすべての契約に適用されます。",
        "1.2. 顧客は、オーストリア消費者保護法（KSchG）第1条にいう事業者にも消費者にもなり得ます。個々の条項が消費者のみ、または事業者のみに適用される場合は、その旨を明示します。当社のサービスは主として事業者（Googleビジネスプロフィールの所有者・責任者）を対象としています。",
        "1.3. 顧客の異なる取引条件は、当社が書面で明示的に同意した場合に限り適用されます。",
      ] },
      { h: "2. サービス", ps: [
        "2.1. **プロフィール削除（「Remove」）：** Googleビジネスプロフィール（Google Business Profile／Googleマップの掲載）を、関連するすべてのレビューを含めて、Googleサービスの公開表示から恒久的に削除します。削除は、Googleが定める公式のプロセスおよびインターフェースのみを通じて行われます。",
        "2.2. **プロフィール削除＋新規作成（「Remove + Restart」）：** 2.1のサービスに加え、顧客が提供する正しい企業データによる新しいGoogleビジネスプロフィールの設定。",
        "2.3. **レピュテーション対策（押し下げ）：** 顧客が指定したGoogle検索のネガティブな検索結果を、他のコンテンツによって押し下げることを目的とした継続的な施策。これは**成果保証のない努力義務**であり、特定の順位という結果を負うものではありません。詳細（期間・範囲・レポート）は各見積りによります。",
        "2.4. **プレス記事の削除（仲介）：** RapidRemoveは提携法律事務所との連絡を**仲介**し、申請を支援します。法的審査および代理は提携法律事務所のみが行い、顧客と提携法律事務所の間で別個の契約が成立します。RapidRemoveは**法的助言を行わず**、削除の成果を負いません。",
        "2.5. **個別レビューの削除は行いません：** 2.1／2.2のサービスの対象は、常にすべてのレビューを含むプロフィール全体の削除であり、個別のレビューの削除ではありません。",
        "2.6. **法務サービスではありません：** RapidRemoveのすべてのサービスは技術的・組織的な性質のものです。RapidRemoveは法的助言や、官庁・裁判所での代理を行いません。",
      ] },
      { h: "3. 契約の成立", ps: [
        "3.1. 当社ウェブサイト上の無料削除チェックは拘束力がなく、申込みを構成しません。",
        "3.2. 契約は、顧客が当社の申込み（ウェブサイトの注文フローまたはメール経由）を承諾し、当社が受注を確認した時点で成立します。ただし遅くともサービス提供の開始時に成立します。",
        "3.3. **権限：** 顧客は、当該ビジネスプロフィールを処分する権限（企業の所有者として、またはその明示的な委任による）を有することを保証します。権限なく他者のプロフィールの削除を依頼することは禁止されます。顧客はこの点につきRapidRemoveを免責します。",
      ] },
      { h: "4. 顧客の協力義務", ps: [
        "4.1. 顧客は削除対象のプロフィールを確認し、ビジネスプロフィールに必要な編集権限を付与します。そのために顧客のGoogleアカウント、Gmail、Google広告または個人データへのアクセスは不要であり、要求されません。",
        "4.2. 顧客が必要な協力を行わないことによりサービス提供が遅延する場合、記載の処理期間はそれに応じて延長されます。",
      ] },
      { h: "5. 処理期間", ps: [
        "5.1. 削除は通常、第4条によるすべての協力が揃ってから**24〜48時間以内**に行われます。これは目安であり、確定期日ではありません。Google内部のプロセスによる遅延について当社は責任を負いません。",
      ] },
      { h: "6. 価格と支払い", ps: [
        "6.1. 依頼時点でウェブサイトまたは見積りに表示された固定価格が適用されます。表示価格はすべて最終価格であり、適用される法定VATを含みます。顧客の地域に応じて、EURまたはUSDで請求されます。",
        "6.2. **成功後の支払い（「No Cure, No Pay」）：** 2.1および2.2のサービスの報酬は、第7条による成功の発生をもって初めて支払期日が到来します。成功しなかった場合、顧客は報酬を負いません。決済処理では、依頼時点で支払いの与信（オーソリ）が行われることがありますが、請求は成功発生後にのみ行われます。",
        "6.3. レピュテーション対策には見積りに記載の報酬（例：一回限りの監査、月額リテイナー）が適用されます。これらは、明示的に別段の合意がない限り、成功報酬では**ありません**。",
        "6.4. 支払方法：注文プロセスで提供される方法（例：クレジットカード、PayPal、Klarna、iDEAL）。処理は外部の決済サービス事業者を通じて行われます。",
      ] },
      { h: "7. 成功の定義・検収", ps: [
        "7.1. プロフィール削除の成功は、依頼されたビジネスプロフィールがGoogle検索およびGoogleマップで**公開状態として呼び出せなくなった**時点で発生します。決定的なのはプロフィール自体の非到達性です。技術的理由（キャッシュ、第三者サイト、個々のGoogleサービスの同期遅延）により、一部のコンテンツが一時的に検索可能な場合がありますが、これは成功の発生を妨げません。",
        "7.2. 当社は成功の発生を顧客に通知します。顧客は7日以内に異議を申し立てることができます。申し立てがない場合、サービスは検収されたものとみなされます。",
      ] },
      { h: "8. 再掲載保護", ps: [
        "8.1. 有効な再掲載保護の期間中に、削除されたプロフィールが第三者またはGoogleの自動プロセスによって再び公開された場合、顧客からの通知により当社は無償で再度削除します。保護期間は選択した保護パッケージによります：**月額保護**および**毎日のモニタリング**では有効なサブスクリプションの期間中（いずれも月単位で解約可能）、**生涯保護**では恒久的。毎日のモニタリングおよび生涯保護では、顧客からの通知がなくても、当社自身が継続的に再掲載を確認します。",
        "8.2. 顧客自身がまたはその同意のもとで新規作成するプロフィール、および元のプロフィールの復活にあたらない、内容的に新しい第三者の別個の掲載（例：別の住所・商号）は対象外です。",
      ] },
      { h: "9. 保証と責任", ps: [
        "9.1. 法定の瑕疵担保規定が適用されます。",
        "9.2. 当社は、故意および重過失ならびに人身損害について無制限に責任を負います。軽過失の場合、人身損害を除き、当社は責任を負いません。事業者に対しては、軽過失、逸失利益、間接損害および純粋な財産的損害についての責任は排除されます。",
        "9.3. 当社は、削除による特定の経済的効果（例：売上・順位・評判の推移）を負うものではありません。",
      ] },
      { h: "10. データ保護", ps: [
        "個人データの取扱いに関する情報は、当社の[プライバシーポリシー](@ds)をご覧ください。",
      ] },
      { h: "11. 消費者の撤回権", ps: [
        "11.1. KSchGにいう消費者には、通信販売契約においてFAGGによる法定の撤回権があります。[撤回権に関する説明とモデル撤回フォーム](@widerruf)が適用されます。",
        "11.2. **早期開始：** 消費者が撤回期間の満了前のサービス開始を希望する場合（特に24〜48時間の処理期間のため）、当社は注文プロセスにおいて、契約の完全な履行により撤回権が消滅することの認識の確認とあわせた**明示的な意思表示**を求めます（FAGG第18条第1項第1号）。",
        "11.3. 消費者がサービス開始後・完全履行前に撤回した場合、撤回までに提供されたサービスに対する按分報酬を支払う義務があります（FAGG第16条）。",
      ] },
      { h: "12. 最終条項", ps: [
        "12.1. 国連動産売買条約を除外した上で、オーストリア法が適用されます。他の国に常居所を有する消費者に対しては、当該国の強行的な消費者保護規定が引き続き適用されます。",
        "12.2. 事業者との契約の裁判管轄は、RapidRemoveの所在地を管轄する裁判所とします。消費者には法定の裁判管轄が適用されます。",
        "12.3. 契約言語はドイツ語です。本訳は参考情報としてのみ提供され、ドイツ語版が優先します。",
        "12.4. 個々の条項が無効であっても、その他の条項の有効性は影響を受けません。",
      ] },
    ],
    upd: "版：2026年6月",
  },
  wid: {
    title: "撤回権について",
    sub: `FAGGに基づく消費者向けの撤回権に関する説明とモデル撤回フォーム。契約当事者：${CO}、${ADDR}、オーストリア。本訳は参考訳であり、ドイツ語版が優先します。`,
    secs: [
      { h: "撤回権", ps: [
        "お客様は、理由を示すことなく、14日以内に本契約を撤回する権利を有します。撤回期間は、契約締結日から14日間です。",
        "撤回権を行使するには、当社",
        `${CO}\n${ADDR}、オーストリア\nメール：${MAIL}\n電話：${TEL}`,
        "に対し、本契約を撤回する旨の明確な意思表示（例：郵送の書面またはメール）によりご連絡ください。下記のモデル撤回フォームを使用できますが、その使用は義務ではありません。",
        "撤回期間の遵守には、撤回権行使の通知を撤回期間の満了前に発送すれば足ります。",
      ] },
      { h: "撤回の効果", ps: [
        "お客様が本契約を撤回した場合、当社は、お客様から受領したすべての支払いを、撤回の通知が当社に到達した日から遅滞なく、遅くとも14日以内に返金します。返金には、明示的に別段の合意がない限り、当初の取引で使用されたものと同じ決済手段を使用します。いかなる場合も、この返金によりお客様に手数料が課されることはありません。",
        "撤回期間中にサービスを開始するよう求めた場合、お客様は、本契約の撤回を当社に通知した時点までに既に提供されたサービスの、契約で定められたサービス全体に対する割合に相当する適切な金額を当社に支払うものとします。",
      ] },
      { h: "撤回権の消滅", ps: [
        "当社がサービスを完全に提供し、かつ、お客様が明示的な同意を与え、同時に当社による契約の完全な履行により撤回権を失うことを認識している旨を確認した後に初めてサービスの実施を開始した場合、撤回権は早期に消滅します（FAGG第18条第1項第1号）。",
      ] },
      { h: "モデル撤回フォーム", ps: [
        "（契約を撤回する場合は、本フォームに記入のうえご返送ください。）",
        `宛先：${CO}、${ADDR}、オーストリア、${MAIL}`,
        "私／私たち（*）は、以下のサービスの提供に関して締結した契約をここに撤回します：",
        "— 注文日（*）：____________________\n— 消費者の氏名：____________________\n— 消費者の住所：____________________\n— 消費者の署名（書面による通知の場合のみ）：____________________\n— 日付：____________________",
        "（*）該当しない方を削除してください。",
      ] },
    ],
    upd: "版：2026年6月",
  },
};

/* ────────────────────────── SV ────────────────────────── */
TERMS.sv = {
  agb: {
    title: "Allmänna villkor (AGB)",
    sub: `för ${CO}, ${ADDR}, Österrike (FN 470700g, regiondomstolen i Salzburg; momsnr ATU72401536), nedan **”RapidRemove”** eller **”vi”**. Översättning för bekvämlighet — den tyska versionen är bindande.`,
    secs: [
      { h: "1. Tillämpningsområde", ps: [
        "1.1. Dessa villkor gäller för alla avtal mellan RapidRemove och dess kunder om de tjänster som erbjuds på rapid-remove.com.",
        "1.2. Kunden kan vara såväl näringsidkare i den mening som avses i § 1 i den österrikiska konsumentskyddslagen (KSchG) som konsument. Om enskilda bestämmelser endast gäller konsumenter eller endast näringsidkare anges detta uttryckligen. Vårt erbjudande riktar sig främst till näringsidkare (innehavare eller ansvariga för Google-företagsprofiler).",
        "1.3. Avvikande villkor från kunden gäller endast om vi uttryckligen har godkänt dem skriftligen.",
      ] },
      { h: "2. Tjänster", ps: [
        "2.1. **Profilborttagning (”Remove”):** Permanent borttagning av en Google-företagsprofil (Google Business Profile / Google Maps-post) inklusive alla tillhörande omdömen från den offentliga visningen i Googles tjänster. Borttagningen sker uteslutande via officiella processer och gränssnitt som Google tillhandahåller.",
        "2.2. **Profilborttagning + ny profil (”Remove + Restart”):** Tjänst enligt punkt 2.1 plus uppsättning av en ny Google-företagsprofil med de korrekta företagsuppgifter som kunden tillhandahåller.",
        "2.3. **Ryktesundanträngning:** Löpande åtgärder med målet att med annat innehåll tränga undan negativa sökresultat som kunden angett i Google-sökningen. Det rör sig om en **ansträngning utan resultatgaranti**; något visst rankingresultat är inte utlovat. Detaljer (löptid, omfattning, rapportering) framgår av respektive offert.",
        "2.4. **Avindexering av press (förmedling):** RapidRemove **förmedlar** kontakten med en partnerbyrå och hjälper till med ansökan. Juridisk granskning och representation sker uteslutande genom partnerbyrån; ett separat avtal ingås mellan kunden och partnerbyrån. RapidRemove tillhandahåller **ingen juridisk rådgivning** och ansvarar inte för någon avindexeringsframgång.",
        "2.5. **Ingen borttagning av enskilda omdömen:** Föremålet för tjänsten enligt 2.1/2.2 är alltid borttagning av hela profilen med alla omdömen, inte borttagning av enskilda recensioner.",
        "2.6. **Ingen juridisk tjänst:** Samtliga RapidRemoves tjänster är av teknisk-organisatorisk natur. RapidRemove tillhandahåller ingen juridisk rådgivning och ingen representation inför myndigheter eller domstolar.",
      ] },
      { h: "3. Avtalets ingående", ps: [
        "3.1. Den kostnadsfria borttagningskollen på vår webbplats är inte bindande och utgör inget anbud.",
        "3.2. Avtalet ingås när kunden accepterar vårt anbud (via webbplatsens beställningsflöde eller e-post) och vi bekräftar uppdraget, dock senast när tjänsten börjar utföras.",
        "3.3. **Behörighet:** Kunden garanterar att denne har rätt att förfoga över den aktuella företagsprofilen (som ägare av företaget eller med dess uttryckliga fullmakt). Det är förbjudet att beställa borttagning av andras profiler utan behörighet; kunden håller RapidRemove skadeslös i detta avseende.",
      ] },
      { h: "4. Kundens medverkansskyldigheter", ps: [
        "4.1. Kunden bekräftar profilen som ska tas bort och beviljar den redigeringsbehörighet som krävs för företagsprofilen. Åtkomst till kundens Google-konto, Gmail, Google Ads eller personuppgifter krävs inte för detta och begärs inte.",
        "4.2. Om utförandet försenas på grund av att kunden inte tillhandahåller nödvändig medverkan förlängs angivna handläggningstider i motsvarande mån.",
      ] },
      { h: "5. Handläggningstid", ps: [
        "5.1. Borttagningen sker i regel inom **24 till 48 timmar** från det att all medverkan enligt punkt 4 föreligger. Det rör sig om en cirkauppgift, inte en fast tidpunkt. Förseningar på grund av Googles interna processer ansvarar vi inte för.",
      ] },
      { h: "6. Priser och betalning", ps: [
        "6.1. De fasta priser som anges på webbplatsen respektive i offerten vid tidpunkten för uppdraget gäller. Samtliga angivna priser är slutpriser och inkluderar eventuell lagstadgad moms. Beroende på kundens region faktureras i EUR eller USD.",
        "6.2. **Betalning efter framgång (”No Cure, No Pay”):** För tjänster enligt 2.1 och 2.2 förfaller ersättningen först när framgång enligt punkt 7 inträtt. Uteblir framgången är kunden inte skyldig någon ersättning. Vid betalningshanteringen kan en betalningsauktorisation ske redan vid uppdraget; debiteringen sker först efter att framgång inträtt.",
        "6.3. För ryktesundanträngning gäller de ersättningar som anges i offerten (t.ex. engångsaudit, månadsretainer); dessa är **inte** framgångsbaserade om inte annat uttryckligen avtalats.",
        "6.4. Betalningssätt: de metoder som erbjuds i beställningsprocessen (t.ex. kreditkort, PayPal, Klarna, iDEAL); hanteringen sker via externa betaltjänstleverantörer.",
      ] },
      { h: "7. Definition av framgång, godkännande", ps: [
        "7.1. Framgången med profilborttagningen inträder när den beställda företagsprofilen **inte längre är offentligt åtkomlig** i Google-sökningen och på Google Maps. Avgörande är att själva profilen inte går att nå; av tekniska skäl (cacher, tredjepartswebbplatser, tidsförskjuten synkronisering av enskilda Google-tjänster) kan enskilt innehåll tillfälligt fortfarande vara sökbart utan att detta hindrar att framgång inträder.",
        "7.2. Vi informerar kunden när framgång inträtt. Kunden kan invända inom 7 dagar; annars anses tjänsten godkänd.",
      ] },
      { h: "8. Skydd mot återpublicering", ps: [
        "8.1. Om den borttagna profilen under ett aktivt återpubliceringsskydd på nytt publiceras offentligt av tredje part eller genom Googles automatiserade processer tar vi bort den igen kostnadsfritt efter meddelande från kunden. Skyddsperioden beror på valt skyddspaket: vid **Månadsskydd** och **Daglig övervakning** under det aktiva abonnemangets löptid (vardera uppsägbart månadsvis), vid **Livstidsskydd** permanent. Vid Daglig övervakning och Livstidsskydd kontrollerar vi dessutom själva löpande om återpublicering skett, utan att något meddelande från kunden krävs.",
        "8.2. Omfattas gör inte profiler som kunden själv eller med dennes samtycke skapar på nytt, samt innehållsmässigt nya, avvikande poster från tredje part (t.ex. med annan adress/firma) som inte utgör ett återupplivande av den ursprungliga profilen.",
      ] },
      { h: "9. Garanti och ansvar", ps: [
        "9.1. De lagstadgade garantibestämmelserna gäller.",
        "9.2. Vi ansvarar obegränsat för uppsåt och grov vårdslöshet samt för personskador. Vid ringa vårdslöshet ansvarar vi inte — utom vid personskador; gentemot näringsidkare är ansvaret för ringa vårdslöshet, utebliven vinst, följdskador och rena förmögenhetsskador uteslutet.",
        "9.3. Vi ansvarar inte för någon viss ekonomisk effekt av borttagningen (t.ex. omsättnings-, ranking- eller ryktesutveckling).",
      ] },
      { h: "10. Dataskydd", ps: [
        "Information om behandlingen av personuppgifter finns i vår [integritetspolicy](@ds).",
      ] },
      { h: "11. Ångerrätt för konsumenter", ps: [
        "11.1. Konsumenter i KSchG:s mening har vid distansavtal den lagstadgade ångerrätten enligt FAGG. [Ångerrättsinformationen med standardformulär](@widerruf) gäller.",
        "11.2. **Tidig start:** Om konsumenten önskar att vi påbörjar tjänsten innan ångerfristen löpt ut (särskilt på grund av handläggningstiden på 24–48 timmar) kräver vi en **uttrycklig begäran** i beställningsprocessen tillsammans med bekräftelse på kännedom om att ångerrätten upphör vid fullständigt fullgörande av avtalet (§ 18 st 1 p 1 FAGG).",
        "11.3. Om konsumenten ångrar sig efter att tjänsten påbörjats men före fullständigt fullgörande ska denne betala en proportionell ersättning för de tjänster som utförts fram till ångrandet (§ 16 FAGG).",
      ] },
      { h: "12. Slutbestämmelser", ps: [
        "12.1. Österrikisk rätt gäller med uteslutande av FN:s köprättskonvention. Gentemot konsumenter med hemvist i en annan stat förblir tvingande konsumentskyddsbestämmelser i den staten opåverkade.",
        "12.2. Forum för avtal med näringsidkare är den sakligt behöriga domstolen på RapidRemoves säte. För konsumenter gäller de lagstadgade fora.",
        "12.3. Avtalsspråket är tyska. Denna översättning tillhandahålls endast i informationssyfte; den tyska versionen har företräde.",
        "12.4. Skulle enskilda bestämmelser vara ogiltiga påverkas inte giltigheten av övriga bestämmelser.",
      ] },
    ],
    upd: "Version: juni 2026",
  },
  wid: {
    title: "Ångerrätt",
    sub: `Ångerrättsinformation för konsumenter enligt FAGG, med standardformulär. Avtalspart: ${CO}, ${ADDR}, Österrike. Översättning för bekvämlighet — den tyska versionen är bindande.`,
    secs: [
      { h: "Ångerrätt", ps: [
        "Du har rätt att frånträda detta avtal utan att ange något skäl inom fjorton dagar. Ångerfristen löper ut fjorton dagar efter dagen då avtalet ingicks.",
        "Vill du utöva ångerrätten ska du skicka oss",
        `${CO}\n${ADDR}, Österrike\nE-post: ${MAIL}\nTelefon: ${TEL}`,
        "ett klart och tydligt meddelande om ditt beslut att frånträda avtalet (t.ex. ett brev skickat per post eller e-post). Du kan använda standardformuläret nedan, men du måste inte använda det.",
        "För att du ska hinna utöva din ångerrätt i tid räcker det med att du sänder in ditt meddelande om att du tänker utöva ångerrätten innan ångerfristen gått ut.",
      ] },
      { h: "Verkan av utövad ångerrätt", ps: [
        "Om du frånträder detta avtal kommer vi att betala tillbaka alla betalningar vi fått från dig utan onödigt dröjsmål och i vilket fall som helst senast fjorton dagar från och med den dag då vi underrättades om ditt beslut att frånträda avtalet. Vi kommer att använda samma betalningsmedel för återbetalningen som du själv har använt för den inledande affärshändelsen, om du inte uttryckligen kommit överens med oss om något annat. I vilket fall som helst kommer återbetalningen inte att kosta dig något.",
        "Om du begärt att tjänsterna ska börja utföras redan under ångerfristen ska du betala ett belopp som står i proportion till vad du mottagit till dess att du meddelade oss din avsikt att frånträda avtalet, jämfört med hela omfattningen av avtalet.",
      ] },
      { h: "Ångerrättens upphörande", ps: [
        "Ångerrätten upphör i förtid om vi har fullgjort tjänsten helt och börjat utföra tjänsten först efter att du gett ditt uttryckliga samtycke och samtidigt bekräftat din kännedom om att du förlorar din ångerrätt när avtalet fullgjorts helt av oss (§ 18 st 1 p 1 FAGG).",
      ] },
      { h: "Standardformulär för utövande av ångerrätten", ps: [
        "(Om du vill frånträda avtalet, fyll i detta formulär och skicka tillbaka det.)",
        `Till: ${CO}, ${ADDR}, Österrike, ${MAIL}`,
        "Jag/Vi (*) meddelar härmed att jag/vi (*) frånträder mitt/vårt (*) avtal om tillhandahållande av följande tjänst:",
        "— Beställdes den (*): ____________________\n— Konsumentens/konsumenternas namn: ____________________\n— Konsumentens/konsumenternas adress: ____________________\n— Konsumentens/konsumenternas underskrift (endast om detta formulär meddelas på papper): ____________________\n— Datum: ____________________",
        "(*) Stryk det som inte är tillämpligt.",
      ] },
    ],
    upd: "Version: juni 2026",
  },
};

/* ────────────────────────── DA ────────────────────────── */
TERMS.da = {
  agb: {
    title: "Handelsbetingelser (AGB)",
    sub: `for ${CO}, ${ADDR}, Østrig (FN 470700g, regionalretten i Salzburg; momsnr. ATU72401536), herefter **„RapidRemove“** eller **„vi“**. Oversættelse til orientering — den tyske version er bindende.`,
    secs: [
      { h: "1. Anvendelsesområde", ps: [
        "1.1. Disse betingelser gælder for alle aftaler mellem RapidRemove og dets kunder om de ydelser, der tilbydes på rapid-remove.com.",
        "1.2. Kunden kan være såvel erhvervsdrivende i henhold til § 1 i den østrigske forbrugerbeskyttelseslov (KSchG) som forbruger. Hvor enkelte bestemmelser kun gælder for forbrugere eller kun for erhvervsdrivende, er dette udtrykkeligt anført. Vores tilbud henvender sig primært til erhvervsdrivende (indehavere eller ansvarlige for Google-virksomhedsprofiler).",
        "1.3. Afvigende betingelser fra kunden gælder kun, hvis vi udtrykkeligt har accepteret dem skriftligt.",
      ] },
      { h: "2. Ydelser", ps: [
        "2.1. **Profilsletning („Remove“):** Permanent fjernelse af en Google-virksomhedsprofil (Google Business Profile / Google Maps-opslag) inklusive alle tilknyttede anmeldelser fra den offentlige visning i Googles tjenester. Fjernelsen sker udelukkende via officielle processer og grænseflader, som Google stiller til rådighed.",
        "2.2. **Profilsletning + ny oprettelse („Remove + Restart“):** Ydelse i henhold til punkt 2.1 plus oprettelse af en ny Google-virksomhedsprofil med de korrekte virksomhedsdata, som kunden stiller til rådighed.",
        "2.3. **Omdømmefortrængning:** Løbende tiltag med det formål at fortrænge negative søgeresultater, som kunden har udpeget, fra Google-søgningen med andet indhold. Der er tale om en **indsats uden succesgaranti**; et bestemt placeringsresultat skyldes ikke. Detaljer (løbetid, omfang, rapportering) fremgår af det enkelte tilbud.",
        "2.4. **Afindeksering af presse (formidling):** RapidRemove **formidler** kontakten til et partneradvokatkontor og hjælper med ansøgningen. Juridisk vurdering og repræsentation varetages udelukkende af partnerkontoret; der indgås en separat aftale mellem kunden og partnerkontoret. RapidRemove yder **ingen juridisk rådgivning** og skylder ingen afindekseringssucces.",
        "2.5. **Ingen sletning af enkelte anmeldelser:** Genstanden for ydelsen i henhold til 2.1/2.2 er altid fjernelse af hele profilen med alle anmeldelser, ikke fjernelse af enkelte anmeldelser.",
        "2.6. **Ingen juridisk tjenesteydelse:** Samtlige RapidRemoves ydelser er af teknisk-organisatorisk karakter. RapidRemove yder ingen juridisk rådgivning og ingen repræsentation over for myndigheder eller domstole.",
      ] },
      { h: "3. Aftalens indgåelse", ps: [
        "3.1. Det gratis slettetjek på vores hjemmeside er uforpligtende og udgør ikke et tilbud.",
        "3.2. Aftalen indgås, når kunden accepterer vores tilbud (via hjemmesidens bestillingsflow eller e-mail), og vi bekræfter opgaven, dog senest når udførelsen af ydelsen påbegyndes.",
        "3.3. **Beføjelse:** Kunden indestår for, at denne er berettiget til at disponere over den pågældende virksomhedsprofil (som indehaver af virksomheden eller med dennes udtrykkelige fuldmagt). Det er forbudt at bestille sletning af andres profiler uden beføjelse; kunden holder RapidRemove skadesløs i denne henseende.",
      ] },
      { h: "4. Kundens medvirkenspligter", ps: [
        "4.1. Kunden bekræfter den profil, der skal fjernes, og giver den nødvendige redigeringstilladelse til virksomhedsprofilen. Adgang til kundens Google-konto, Gmail, Google Ads eller personlige data er ikke nødvendig hertil og kræves ikke.",
        "4.2. Forsinkes udførelsen, fordi kunden ikke yder den nødvendige medvirken, forlænges de angivne behandlingstider tilsvarende.",
      ] },
      { h: "5. Behandlingstid", ps: [
        "5.1. Fjernelsen sker som regel inden for **24 til 48 timer**, fra al medvirken i henhold til punkt 4 foreligger. Der er tale om en cirka-angivelse, ikke en fast frist. Forsinkelser som følge af Googles interne processer er vi ikke ansvarlige for.",
      ] },
      { h: "6. Priser og betaling", ps: [
        "6.1. De faste priser, der er angivet på hjemmesiden hhv. i tilbuddet på bestillingstidspunktet, gælder. Alle angivne priser er slutpriser og er inklusive eventuel lovpligtig moms. Afhængigt af kundens region faktureres i EUR eller USD.",
        "6.2. **Betaling efter succes („No Cure, No Pay“):** For ydelser i henhold til 2.1 og 2.2 forfalder vederlaget først, når succesen i henhold til punkt 7 er indtrådt. Udebliver succesen, skylder kunden intet vederlag. Ved betalingsbehandlingen kan en betalingsautorisation allerede ske ved bestillingen; trækket sker først efter succesens indtræden.",
        "6.3. For omdømmefortrængning gælder de vederlag, der er angivet i tilbuddet (f.eks. engangsaudit, månedlig retainer); disse er **ikke** succesafhængige, medmindre andet udtrykkeligt er aftalt.",
        "6.4. Betalingsmetoder: de metoder, der tilbydes i bestillingsprocessen (f.eks. kreditkort, PayPal, Klarna, iDEAL); behandlingen sker via eksterne betalingstjenesteudbydere.",
      ] },
      { h: "7. Definition af succes, godkendelse", ps: [
        "7.1. Succesen med profilsletningen indtræder, når den bestilte virksomhedsprofil **ikke længere er offentligt tilgængelig** i Google-søgningen og på Google Maps. Afgørende er, at selve profilen ikke kan hentes; af tekniske årsager (caches, tredjepartssider, tidsforskudt synkronisering af enkelte Google-tjenester) kan enkelte indholdselementer midlertidigt stadig kunne findes, uden at dette hindrer succesens indtræden.",
        "7.2. Vi informerer kunden om succesens indtræden. Kunden kan gøre indsigelse inden for 7 dage; ellers anses ydelsen for godkendt.",
      ] },
      { h: "8. Beskyttelse mod genoprettelse", ps: [
        "8.1. Hvis den fjernede profil under en aktiv genoprettelsesbeskyttelse på ny offentliggøres af tredjepart eller af Googles automatiserede processer, fjerner vi den igen gratis efter meddelelse fra kunden. Beskyttelsesperioden afhænger af den valgte beskyttelsespakke: ved **Månedlig beskyttelse** og **Daglig overvågning** i det aktive abonnements løbetid (begge kan opsiges månedligt), ved **Livstidsbeskyttelse** permanent. Ved Daglig overvågning og Livstidsbeskyttelse kontrollerer vi desuden selv løbende for genoprettelser, uden at en meddelelse fra kunden er nødvendig.",
        "8.2. Ikke omfattet er profiler, som kunden selv eller med dennes samtykke opretter på ny, samt indholdsmæssigt nye, afvigende opslag fra tredjepart (f.eks. med anden adresse/andet firmanavn), der ikke udgør en genoplivning af den oprindelige profil.",
      ] },
      { h: "9. Garanti og ansvar", ps: [
        "9.1. De lovbestemte garantibestemmelser gælder.",
        "9.2. Vi hæfter ubegrænset for forsæt og grov uagtsomhed samt for personskader. Ved simpel uagtsomhed hæfter vi ikke — bortset fra personskader; over for erhvervsdrivende er ansvaret for simpel uagtsomhed, tabt fortjeneste, følgeskader og rene formueskader udelukket.",
        "9.3. Vi skylder ingen bestemt økonomisk effekt af sletningen (f.eks. omsætnings-, placerings- eller omdømmeudvikling).",
      ] },
      { h: "10. Databeskyttelse", ps: [
        "Oplysninger om behandlingen af personoplysninger findes i vores [privatlivspolitik](@ds).",
      ] },
      { h: "11. Fortrydelsesret for forbrugere", ps: [
        "11.1. Forbrugere i KSchG's forstand har ved fjernsalgsaftaler den lovbestemte fortrydelsesret efter FAGG. [Fortrydelsesoplysningerne med standardfortrydelsesformular](@widerruf) gælder.",
        "11.2. **Tidlig start:** Ønsker forbrugeren, at vi påbegynder ydelsen inden fortrydelsesfristens udløb (navnlig på grund af behandlingstiden på 24–48 timer), kræver vi hertil en **udtrykkelig erklæring** i bestillingsprocessen samt bekræftelse af kendskabet til, at fortrydelsesretten bortfalder ved aftalens fuldstændige opfyldelse (§ 18 stk. 1 nr. 1 FAGG).",
        "11.3. Fortryder forbrugeren efter ydelsens påbegyndelse, men inden fuldstændig opfyldelse, skylder denne et forholdsmæssigt vederlag for de ydelser, der er leveret indtil fortrydelsen (§ 16 FAGG).",
      ] },
      { h: "12. Afsluttende bestemmelser", ps: [
        "12.1. Østrigsk ret finder anvendelse med udelukkelse af FN's købelovskonvention. Over for forbrugere med sædvanligt opholdssted i en anden stat forbliver denne stats ufravigelige forbrugerbeskyttelsesbestemmelser uberørte.",
        "12.2. Værneting for aftaler med erhvervsdrivende er den sagligt kompetente domstol på RapidRemoves hjemsted. For forbrugere gælder de lovbestemte værneting.",
        "12.3. Aftalesproget er tysk. Denne oversættelse stilles kun til rådighed til orientering; den tyske version har forrang.",
        "12.4. Skulle enkelte bestemmelser være ugyldige, berøres gyldigheden af de øvrige bestemmelser ikke.",
      ] },
    ],
    upd: "Version: juni 2026",
  },
  wid: {
    title: "Fortrydelsesret",
    sub: `Fortrydelsesoplysninger for forbrugere i henhold til FAGG, med standardfortrydelsesformular. Aftalepart: ${CO}, ${ADDR}, Østrig. Oversættelse til orientering — den tyske version er bindende.`,
    secs: [
      { h: "Fortrydelsesret", ps: [
        "Du har ret til at træde tilbage fra denne aftale uden begrundelse inden for 14 dage. Fortrydelsesfristen udløber 14 dage efter den dag, hvor aftalen blev indgået.",
        "For at udøve fortrydelsesretten skal du meddele os",
        `${CO}\n${ADDR}, Østrig\nE-mail: ${MAIL}\nTelefon: ${TEL}`,
        "din beslutning om at fortryde denne aftale i en utvetydig erklæring (f.eks. et brev sendt med post eller en e-mail). Du kan benytte standardfortrydelsesformularen nedenfor, men det er ikke obligatorisk.",
        "Fortrydelsesfristen er overholdt, hvis du sender din meddelelse om udøvelse af fortrydelsesretten, inden fortrydelsesfristen er udløbet.",
      ] },
      { h: "Følger af fortrydelse", ps: [
        "Hvis du udøver din fortrydelsesret i denne aftale, refunderer vi alle betalinger modtaget fra dig uden unødig forsinkelse og under alle omstændigheder senest 14 dage fra den dato, hvor vi har modtaget meddelelse om din beslutning om at fortryde denne aftale. Vi gennemfører en sådan tilbagebetaling med samme betalingsmiddel, som du benyttede ved den oprindelige transaktion, medmindre du udtrykkeligt har indvilget i noget andet. Under alle omstændigheder pålægges du ingen former for gebyrer som følge af tilbagebetalingen.",
        "Hvis du har anmodet om, at ydelsen skal påbegyndes inden fortrydelsesfristens udløb, skal du betale os et beløb, som står i forhold til omfanget af de ydelser, der er leveret indtil det tidspunkt, hvor du informerede os om din udøvelse af aftalens fortrydelsesret, sammenlignet med det fulde omfang af de ydelser, der er fastsat i aftalen.",
      ] },
      { h: "Fortrydelsesrettens bortfald", ps: [
        "Fortrydelsesretten bortfalder før tid, hvis vi har leveret ydelsen fuldt ud og først er begyndt på udførelsen af ydelsen, efter at du har givet dit udtrykkelige samtykke hertil og samtidig bekræftet dit kendskab til, at du mister din fortrydelsesret, når aftalen er fuldstændigt opfyldt af os (§ 18 stk. 1 nr. 1 FAGG).",
      ] },
      { h: "Standardfortrydelsesformular", ps: [
        "(Denne formular udfyldes og returneres kun, hvis fortrydelsesretten gøres gældende.)",
        `Til: ${CO}, ${ADDR}, Østrig, ${MAIL}`,
        "Jeg/Vi (*) meddeler herved, at jeg/vi (*) ønsker at gøre fortrydelsesretten gældende i forbindelse med min/vores (*) aftale om levering af følgende tjenesteydelse:",
        "— Bestilt den (*): ____________________\n— Forbrugerens/forbrugernes navn: ____________________\n— Forbrugerens/forbrugernes adresse: ____________________\n— Forbrugerens/forbrugernes underskrift (kun hvis formularens indhold meddeles på papir): ____________________\n— Dato: ____________________",
        "(*) Det ikke relevante udstreges.",
      ] },
    ],
    upd: "Version: juni 2026",
  },
};

/* ────────────────────────── NO ────────────────────────── */
TERMS.no = {
  agb: {
    title: "Vilkår (AGB)",
    sub: `for ${CO}, ${ADDR}, Østerrike (FN 470700g, regionsdomstolen i Salzburg; mva-nr. ATU72401536), heretter **«RapidRemove»** eller **«vi»**. Oversettelse til orientering — den tyske versjonen er bindende.`,
    secs: [
      { h: "1. Virkeområde", ps: [
        "1.1. Disse vilkårene gjelder for alle avtaler mellom RapidRemove og dets kunder om tjenestene som tilbys på rapid-remove.com.",
        "1.2. Kunden kan være både næringsdrivende i henhold til § 1 i den østerrikske forbrukerbeskyttelsesloven (KSchG) og forbruker. Der enkelte bestemmelser bare gjelder forbrukere eller bare næringsdrivende, er dette uttrykkelig angitt. Tilbudet vårt retter seg primært mot næringsdrivende (innehavere eller ansvarlige for Google-bedriftsprofiler).",
        "1.3. Avvikende vilkår fra kunden gjelder bare hvis vi uttrykkelig har godtatt dem skriftlig.",
      ] },
      { h: "2. Tjenester", ps: [
        "2.1. **Profilsletting («Remove»):** Permanent fjerning av en Google-bedriftsprofil (Google Business Profile / Google Maps-oppføring) inkludert alle tilknyttede omtaler fra den offentlige visningen i Googles tjenester. Fjerningen skjer utelukkende via offisielle prosesser og grensesnitt som Google har lagt til rette for.",
        "2.2. **Profilsletting + ny opprettelse («Remove + Restart»):** Tjeneste i henhold til punkt 2.1 pluss oppsett av en ny Google-bedriftsprofil med de korrekte bedriftsdataene kunden oppgir.",
        "2.3. **Omdømmefortrengning:** Løpende tiltak med mål om å fortrenge negative søkeresultater som kunden har utpekt, fra Google-søket med annet innhold. Det dreier seg om en **innsats uten resultatgaranti**; et bestemt rangeringsresultat skyldes ikke. Detaljer (varighet, omfang, rapportering) følger av det enkelte tilbudet.",
        "2.4. **Avindeksering av presse (formidling):** RapidRemove **formidler** kontakten med et partneradvokatkontor og bistår med søknaden. Juridisk vurdering og representasjon utføres utelukkende av partnerkontoret; det inngås en egen avtale mellom kunden og partnerkontoret. RapidRemove yter **ingen juridisk rådgivning** og skylder ingen avindekseringssuksess.",
        "2.5. **Ingen sletting av enkeltomtaler:** Gjenstanden for tjenesten etter 2.1/2.2 er alltid fjerning av hele profilen med alle omtaler, ikke fjerning av enkeltanmeldelser.",
        "2.6. **Ingen juridisk tjeneste:** Samtlige av RapidRemoves tjenester er av teknisk-organisatorisk art. RapidRemove yter ingen juridisk rådgivning og ingen representasjon overfor myndigheter eller domstoler.",
      ] },
      { h: "3. Avtaleinngåelse", ps: [
        "3.1. Den gratis slettesjekken på nettstedet vårt er uforpliktende og utgjør ikke et tilbud.",
        "3.2. Avtalen inngås når kunden aksepterer tilbudet vårt (via nettstedets bestillingsflyt eller e-post) og vi bekrefter oppdraget, men senest når utførelsen av tjenesten begynner.",
        "3.3. **Berettigelse:** Kunden garanterer at vedkommende er berettiget til å disponere over den aktuelle bedriftsprofilen (som eier av virksomheten eller med dennes uttrykkelige fullmakt). Det er forbudt å bestille sletting av andres profiler uten berettigelse; kunden holder RapidRemove skadesløs i denne forbindelse.",
      ] },
      { h: "4. Kundens medvirkningsplikter", ps: [
        "4.1. Kunden bekrefter profilen som skal fjernes, og gir den nødvendige redigeringstillatelsen for bedriftsprofilen. Tilgang til kundens Google-konto, Gmail, Google Ads eller personlige data er ikke nødvendig for dette og kreves ikke.",
        "4.2. Forsinkes utførelsen fordi kunden ikke yter nødvendig medvirkning, forlenges de angitte behandlingstidene tilsvarende.",
      ] },
      { h: "5. Behandlingstid", ps: [
        "5.1. Fjerningen skjer som regel innen **24 til 48 timer** fra all medvirkning etter punkt 4 foreligger. Dette er en cirka-angivelse, ikke en fast frist. Forsinkelser som følge av Googles interne prosesser er vi ikke ansvarlige for.",
      ] },
      { h: "6. Priser og betaling", ps: [
        "6.1. De faste prisene som er angitt på nettstedet hhv. i tilbudet på bestillingstidspunktet, gjelder. Alle angitte priser er sluttpriser og inkluderer eventuell lovpålagt mva. Avhengig av kundens region faktureres det i EUR eller USD.",
        "6.2. **Betaling etter suksess («No Cure, No Pay»):** For tjenester etter 2.1 og 2.2 forfaller vederlaget først når suksessen etter punkt 7 har inntrådt. Uteblir suksessen, skylder kunden ikke noe vederlag. Ved betalingsbehandlingen kan en betalingsautorisasjon allerede skje ved bestillingen; belastningen skjer først etter at suksessen har inntrådt.",
        "6.3. For omdømmefortrengning gjelder vederlagene angitt i tilbudet (f.eks. engangsaudit, månedlig retainer); disse er **ikke** suksessavhengige med mindre annet er uttrykkelig avtalt.",
        "6.4. Betalingsmåter: metodene som tilbys i bestillingsprosessen (f.eks. kredittkort, PayPal, Klarna, iDEAL); behandlingen skjer via eksterne betalingstjenesteleverandører.",
      ] },
      { h: "7. Definisjon av suksess, godkjenning", ps: [
        "7.1. Suksessen med profilslettingen inntrer når den bestilte bedriftsprofilen **ikke lenger er offentlig tilgjengelig** i Google-søket og på Google Maps. Avgjørende er at selve profilen ikke kan hentes opp; av tekniske grunner (cacher, tredjepartsnettsteder, tidsforskjøvet synkronisering av enkelte Google-tjenester) kan enkelte innholdselementer midlertidig fortsatt være søkbare uten at dette hindrer at suksessen inntrer.",
        "7.2. Vi informerer kunden om at suksessen har inntrådt. Kunden kan fremme innsigelser innen 7 dager; ellers anses tjenesten som godkjent.",
      ] },
      { h: "8. Beskyttelse mot gjenoppretting", ps: [
        "8.1. Blir den fjernede profilen under en aktiv gjenopprettingsbeskyttelse på nytt offentlig publisert av tredjeparter eller av Googles automatiserte prosesser, fjerner vi den igjen gratis etter melding fra kunden. Beskyttelsesperioden avhenger av valgt beskyttelsespakke: ved **Månedlig beskyttelse** og **Daglig overvåking** i det aktive abonnementets løpetid (begge kan sies opp månedlig), ved **Livsvarig beskyttelse** permanent. Ved Daglig overvåking og Livsvarig beskyttelse sjekker vi i tillegg selv løpende for gjenopprettinger, uten at det kreves melding fra kunden.",
        "8.2. Ikke omfattet er profiler som kunden selv eller med dennes samtykke oppretter på nytt, samt innholdsmessig nye, avvikende oppføringer fra tredjeparter (f.eks. med annen adresse/annet firmanavn) som ikke utgjør en gjenoppliving av den opprinnelige profilen.",
      ] },
      { h: "9. Garanti og ansvar", ps: [
        "9.1. De lovbestemte garantibestemmelsene gjelder.",
        "9.2. Vi er ubegrenset ansvarlige for forsett og grov uaktsomhet samt for personskader. Ved simpel uaktsomhet er vi ikke ansvarlige — unntatt ved personskader; overfor næringsdrivende er ansvaret for simpel uaktsomhet, tapt fortjeneste, følgeskader og rene formuestap utelukket.",
        "9.3. Vi skylder ingen bestemt økonomisk effekt av slettingen (f.eks. omsetnings-, rangerings- eller omdømmeutvikling).",
      ] },
      { h: "10. Personvern", ps: [
        "Informasjon om behandlingen av personopplysninger finnes i vår [personvernerklæring](@ds).",
      ] },
      { h: "11. Angrerett for forbrukere", ps: [
        "11.1. Forbrukere i KSchGs forstand har ved fjernsalgsavtaler den lovbestemte angreretten etter FAGG. [Angrerettsinformasjonen med standard angreskjema](@widerruf) gjelder.",
        "11.2. **Tidlig oppstart:** Ønsker forbrukeren at vi begynner tjenesten før angrefristen utløper (særlig på grunn av behandlingstiden på 24–48 timer), krever vi en **uttrykkelig erklæring** i bestillingsprosessen sammen med bekreftelse på kjennskap til at angreretten bortfaller ved fullstendig oppfyllelse av avtalen (§ 18 første ledd nr. 1 FAGG).",
        "11.3. Angrer forbrukeren etter at tjenesten er påbegynt, men før fullstendig oppfyllelse, skylder vedkommende et forholdsmessig vederlag for tjenestene som er levert frem til angringen (§ 16 FAGG).",
      ] },
      { h: "12. Avsluttende bestemmelser", ps: [
        "12.1. Østerriksk rett gjelder med utelukkelse av FN-konvensjonen om internasjonale løsørekjøp. Overfor forbrukere med vanlig opphold i en annen stat forblir denne statens ufravikelige forbrukervernbestemmelser uberørt.",
        "12.2. Verneting for avtaler med næringsdrivende er den saklig kompetente domstolen på RapidRemoves forretningssted. For forbrukere gjelder de lovbestemte vernetingene.",
        "12.3. Avtalespråket er tysk. Denne oversettelsen er kun til orientering; den tyske versjonen har forrang.",
        "12.4. Skulle enkelte bestemmelser være ugyldige, berøres ikke gyldigheten av de øvrige bestemmelsene.",
      ] },
    ],
    upd: "Versjon: juni 2026",
  },
  wid: {
    title: "Angrerett",
    sub: `Angrerettsinformasjon for forbrukere etter FAGG, med standard angreskjema. Avtalepart: ${CO}, ${ADDR}, Østerrike. Oversettelse til orientering — den tyske versjonen er bindende.`,
    secs: [
      { h: "Angrerett", ps: [
        "Du har rett til å gå fra denne avtalen innen fjorten dager uten å oppgi noen grunn. Angrefristen er fjorten dager fra den dagen avtalen ble inngått.",
        "For å utøve angreretten må du informere oss",
        `${CO}\n${ADDR}, Østerrike\nE-post: ${MAIL}\nTelefon: ${TEL}`,
        "om din beslutning om å gå fra denne avtalen i en utvetydig erklæring (f.eks. et brev sendt i posten eller en e-post). Du kan bruke standard angreskjemaet nedenfor, men det er ikke obligatorisk.",
        "For å overholde angrefristen er det tilstrekkelig at du sender meldingen om at du vil bruke angreretten før angrefristen utløper.",
      ] },
      { h: "Virkninger av at angreretten brukes", ps: [
        "Dersom du går fra denne avtalen, skal vi tilbakebetale alle betalinger vi har mottatt fra deg, uten unødig opphold og i alle tilfeller senest fjorten dager etter den dagen vi mottar melding om din beslutning om å gå fra denne avtalen. Vi foretar tilbakebetalingen med samme betalingsmiddel som du benyttet ved den opprinnelige transaksjonen, med mindre noe annet uttrykkelig er avtalt med deg; du vil ikke i noe tilfelle bli pålagt gebyrer som følge av tilbakebetalingen.",
        "Dersom du har bedt om at tjenesten skal påbegynnes i angrefristen, skal du betale oss et beløp som står i forhold til det som er levert frem til du underrettet oss om at du gjør angreretten gjeldende, sammenlignet med full oppfyllelse av avtalen.",
      ] },
      { h: "Bortfall av angreretten", ps: [
        "Angreretten bortfaller før tiden dersom vi har levert tjenesten fullt ut og først begynte å utføre tjenesten etter at du ga ditt uttrykkelige samtykke og samtidig bekreftet at du er kjent med at du mister angreretten når avtalen er fullstendig oppfylt av oss (§ 18 første ledd nr. 1 FAGG).",
      ] },
      { h: "Standard angreskjema", ps: [
        "(Fyll bare ut og returner dette skjemaet dersom du ønsker å gå fra avtalen.)",
        `Til: ${CO}, ${ADDR}, Østerrike, ${MAIL}`,
        "Jeg/Vi (*) går herved fra min/vår (*) avtale om levering av følgende tjeneste:",
        "— Bestilt den (*): ____________________\n— Forbrukerens/forbrukernes navn: ____________________\n— Forbrukerens/forbrukernes adresse: ____________________\n— Forbrukerens/forbrukernes underskrift (bare dersom skjemaet leveres på papir): ____________________\n— Dato: ____________________",
        "(*) Stryk det som ikke passer.",
      ] },
    ],
    upd: "Versjon: juni 2026",
  },
};
