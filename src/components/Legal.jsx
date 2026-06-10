"use client";
/* RapidRemove — eigene Rechtsseiten: Impressum + Datenschutzerklärung.
   Ersetzt die früheren Weiterleitungen auf rapid-remove.com.
   Sprachen: DE + EN (andere Locales fallen auf EN zurück).
   HINWEIS: ENTWURF – vor dem Livegang juristisch prüfen lassen und die mit
   […] markierten Pflichtangaben (Firmenbuch, Geschäftsführer, Telefon …) ergänzen. */
import React from "react";
import { Nav, Footer, WhatsAppFloat } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";

const COMPANY = {
  legal: "Simple Solution OG",
  street: "Salzgasse 2",
  city: "5400 Hallein",
  uid: "ATU72401536",
  email: "helpdesk@rapid-remove.com",
};

/* Eigenständige Seiten-Hülle (Nav + Footer + Chat), Sprache aus rr_lang (Default DE). */
function Shell({ children }) {
  const [lang, setLangState] = React.useState("de");
  React.useEffect(() => { try { const s = localStorage.getItem("rr_lang"); if (s && I18N[s]) setLangState(s); } catch (e) {} }, []);
  const setLang = (l) => { try { localStorage.setItem("rr_lang", l); } catch (e) {} window.location.href = asset(localePath(l)); };
  const t = I18N[lang] || I18N.de;
  const nav = (path) => { window.location.href = asset(path); };
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={() => nav("/ueber-uns/")} onOrm={() => nav("/?view=reputation")} onDeindex={() => nav("/?view=presse")} active="" />
      <main className="legal"><div className="container"><article className="legal-doc">{children}</article></div></main>
      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={() => nav("/ueber-uns/")} />
      <WhatsAppFloat />
    </LangContext.Provider>
  );
}

/* ────────────────────────── Impressum ────────────────────────── */
function ImpressumBody() {
  const de = useLang().lang === "de";
  return (
    <React.Fragment>
      <h1>{de ? "Impressum" : "Legal notice (Impressum)"}</h1>
      <p className="legal-sub">{de ? "Angaben gemäß § 5 ECG, § 14 UGB und § 25 MedienG." : "Information pursuant to § 5 ECG, § 14 UGB and § 25 MedienG (Austria)."}</p>

      <h2>{de ? "Medieninhaber & Diensteanbieter" : "Owner & service provider"}</h2>
      <p>{COMPANY.legal}<br />{COMPANY.street}<br />{COMPANY.city}, {de ? "Österreich" : "Austria"}</p>

      <h2>{de ? "Kontakt" : "Contact"}</h2>
      <p>{de ? "E-Mail" : "Email"}: <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a><br />{de ? "Telefon" : "Phone"}: […]</p>

      <h2>{de ? "Vertretungsberechtigt" : "Authorised representatives"}</h2>
      <p>[…] {de ? "(geschäftsführende Gesellschafter)" : "(managing partners)"}</p>

      <h2>{de ? "Register- & Steuerdaten" : "Register & tax details"}</h2>
      <p>{de ? "Umsatzsteuer-Identifikationsnummer (UID)" : "VAT ID (UID)"}: {COMPANY.uid}<br />
        {de ? "Firmenbuchnummer" : "Commercial register no."}: […]<br />
        {de ? "Firmenbuchgericht" : "Register court"}: […]</p>

      <h2>{de ? "Unternehmensgegenstand" : "Business activity"}</h2>
      <p>{de ? "Professionelle Entfernung von Google-Unternehmensprofilen sowie Online-Reputationsdienstleistungen." : "Professional removal of Google Business Profiles and online-reputation services."}</p>

      <h2>{de ? "Kammer & Gewerbe" : "Chamber & trade"}</h2>
      <p>[…] {de ? "(z. B. Mitgliedschaft Wirtschaftskammer Österreich; anwendbare Gewerbeordnung – GewO)" : "(e.g. membership of the Austrian Federal Economic Chamber; applicable trade regulation – GewO)"}</p>

      <h2>{de ? "EU-Streitbeilegung" : "EU dispute resolution"}</h2>
      <p>{de
        ? "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: "
        : "The European Commission provides a platform for online dispute resolution (ODR): "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>. {de
          ? "Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
          : "We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board."}</p>

      <p className="legal-upd">{de ? "Stand: Juni 2026" : "Last updated: June 2026"}</p>
    </React.Fragment>
  );
}

/* ──────────────────────── Datenschutz ───────────────────────── */
function DatenschutzBody() {
  const de = useLang().lang === "de";
  const addr = <span>{COMPANY.legal}, {COMPANY.street}, {COMPANY.city}, {de ? "Österreich" : "Austria"} · <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a></span>;
  return (
    <React.Fragment>
      <h1>{de ? "Datenschutzerklärung" : "Privacy policy"}</h1>
      <p className="legal-sub">{de
        ? "Wir behandeln Ihre personenbezogenen Daten vertraulich und gemäß der DSGVO. Diese Erklärung informiert über Art, Umfang und Zweck der Verarbeitung."
        : "We treat your personal data confidentially and in accordance with the GDPR. This statement explains the nature, scope and purpose of processing."}</p>

      <h2>{de ? "Verantwortlicher" : "Controller"}</h2>
      <p>{addr}</p>

      <h2>{de ? "Verarbeitung bei Anfrage & Beauftragung" : "Processing for enquiries & orders"}</h2>
      <p>{de
        ? "Wenn Sie eine Prüfung anfragen oder einen Auftrag erteilen, verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name, E-Mail, Telefon, Unternehmen, betroffenes Google-Profil) zur Bearbeitung Ihres Anliegens und zur Vertragsabwicklung. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag/vorvertragliche Maßnahmen)."
        : "When you request a check or place an order, we process the data you provide (e.g. name, email, phone, company, the Google profile concerned) to handle your request and perform the contract. Legal basis: Art. 6(1)(b) GDPR (contract/pre-contractual steps)."}</p>

      <h2>{de ? "Zahlungsabwicklung (Stripe)" : "Payments (Stripe)"}</h2>
      <p>{de
        ? "Zahlungen werden über Stripe (Stripe Payments Europe, Ltd., Irland) abgewickelt. Dabei werden die für die Zahlung erforderlichen Daten an Stripe übermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Details: stripe.com/privacy."
        : "Payments are processed via Stripe (Stripe Payments Europe, Ltd., Ireland). The data required for the payment is transmitted to Stripe. Legal basis: Art. 6(1)(b) GDPR. Details: stripe.com/privacy."}</p>

      <h2>{de ? "Live-Chat (Tidio)" : "Live chat (Tidio)"}</h2>
      <p>{de
        ? "Für den Support nutzen wir den Live-Chat von Tidio. Beim Öffnen des Chats können Verbindungsdaten und ggf. Cookies verarbeitet werden. Rechtsgrundlage: Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) bzw. unser berechtigtes Interesse an effizientem Support (Art. 6 Abs. 1 lit. f). […] Anbieter-/AV-Details ergänzen."
        : "For support we use the Tidio live chat. Opening the chat may process connection data and cookies. Legal basis: your consent (Art. 6(1)(a) GDPR) or our legitimate interest in efficient support (Art. 6(1)(f)). […] Complete provider/DPA details."}</p>

      <h2>{de ? "Sprach-/Standorterkennung" : "Language/location detection"}</h2>
      <p>{de
        ? "Damit wir Ihnen die Website in Ihrer Sprache anbieten können, ermitteln wir – ausschließlich mit Ihrer Einwilligung – über einen externen Dienst (GeoJS, get.geojs.io; ersatzweise api.country.is) anhand Ihrer IP-Adresse das Land, aus dem Sie zugreifen. Ihre IP-Adresse wird dabei an den jeweiligen Anbieter übermittelt (ggf. in ein Drittland). Wir speichern lediglich das ermittelte Länderkürzel lokal in Ihrem Browser (kein serverseitiges Protokollieren). Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), jederzeit mit Wirkung für die Zukunft widerrufbar. Ohne Einwilligung erfolgt keine IP-Abfrage; die Spracherkennung nutzt dann nur die lokal im Browser eingestellte Sprache."
        : "To offer you the website in your language, we determine — only with your consent — the country you access from, based on your IP address, via an external service (GeoJS, get.geojs.io; fallback api.country.is). Your IP address is transmitted to the respective provider (possibly to a third country). We only store the detected country code locally in your browser (no server-side logging). Legal basis: consent (Art. 6(1)(a) GDPR), revocable at any time with future effect. Without consent no IP lookup takes place; language detection then uses only the language set locally in your browser."}</p>

      <h2>{de ? "Hosting & Server-Logs" : "Hosting & server logs"}</h2>
      <p>{de
        ? "Unsere Website wird bei einem Infrastruktur-Dienstleister gehostet (Railway). Beim Aufruf können technisch notwendige Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, abgerufene Ressource) verarbeitet werden. Rechtsgrundlage: berechtigtes Interesse an sicherem Betrieb (Art. 6 Abs. 1 lit. f DSGVO). […] Anbieter-/AV- und Drittland-Details ergänzen."
        : "Our website is hosted by an infrastructure provider (Railway). Access data technically required (e.g. IP address, timestamp, requested resource) may be processed. Legal basis: legitimate interest in secure operation (Art. 6(1)(f) GDPR). […] Complete provider/DPA and third-country details."}</p>

      <h2>{de ? "Speicherdauer" : "Retention"}</h2>
      <p>{de
        ? "Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen (z. B. steuer-/handelsrechtlich) dies vorschreiben."
        : "We retain personal data only for as long as necessary for the stated purposes or as required by statutory retention periods (e.g. tax/commercial law)."}</p>

      <h2>{de ? "Ihre Rechte" : "Your rights"}</h2>
      <p>{de
        ? "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Erteilte Einwilligungen können Sie jederzeit widerrufen. Wenden Sie sich dazu an "
        : "You have the right to access, rectification, erasure, restriction of processing, data portability and objection. You may withdraw any consent at any time. To exercise these rights, contact "}<a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a>.</p>

      <h2>{de ? "Beschwerderecht" : "Right to lodge a complaint"}</h2>
      <p>{de
        ? "Es besteht ein Beschwerderecht bei der zuständigen Aufsichtsbehörde – in Österreich der Österreichischen Datenschutzbehörde (dsb.gv.at)."
        : "You have the right to lodge a complaint with the competent supervisory authority — in Austria the Austrian Data Protection Authority (dsb.gv.at)."}</p>

      <p className="legal-upd">{de ? "Stand: Juni 2026" : "Last updated: June 2026"}</p>
    </React.Fragment>
  );
}

export function Impressum() { return <Shell><ImpressumBody /></Shell>; }
export function Datenschutz() { return <Shell><DatenschutzBody /></Shell>; }
