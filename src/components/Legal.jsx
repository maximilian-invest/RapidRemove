"use client";
/* RapidRemove — eigene Rechtsseiten: Impressum + Datenschutzerklärung.
   Vollständig lokalisiert in allen 11 Sprachen (de, en, es, fr, it, nl, pt, ja, sv, da, no);
   die Sprache folgt der Website-Sprache (rr_lang). Mit […] markierte Pflichtangaben
   (Telefon, Geschäftsführer, Firmenbuch, Kammer) bitte noch ergänzen. */
import React from "react";
import { Nav, Footer, WhatsAppFloat } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";

const COMPANY = {
  legal: "Simple Solution. OG",
  street: "Salzgasse 2",
  city: "5400 Hallein",
  uid: "ATU72401536",
  fbn: "470700g",
  court: "Salzburg",
  reps: "Matthias Lang, Maximilian Hölzl",
  shares: "Matthias Lang 50 %, Maximilian Hölzl 50 %",
  authority: "Bezirkshauptmannschaft Hallein",
  profession: "Werbeagentur",
  phone: "+43 6245 9305300",
  phoneHref: "+4362459305300",
  email: "helpdesk@rapid-remove.com",
};

/* ── Übersetzungen (Impressum + Datenschutz) ──────────────────────────────
   ds.secs: [Überschrift, Text] in fester Reihenfolge:
   Anfrage/Bestellung · Stripe · Tidio · Geo-IP · Hosting · Speicherdauer */
const L = {
  de: {
    country: "Österreich",
    imp: {
      title: "Impressum",
      sub: "Angaben gemäß § 5 ECG, § 14 UGB und § 25 MedienG.",
      owner: "Medieninhaber & Diensteanbieter",
      contact: "Kontakt", email: "E-Mail", phone: "Telefon",
      rep: "Vertretungsberechtigt", repTxt: "[…] (geschäftsführende Gesellschafter)",
      reg: "Register- & Steuerdaten", uid: "Umsatzsteuer-Identifikationsnummer (UID)", fbn: "Firmenbuchnummer", court: "Firmenbuchgericht",
      biz: "Unternehmensgegenstand", bizTxt: "Professionelle Entfernung von Google-Unternehmensprofilen sowie Online-Reputationsdienstleistungen.",
      chamber: "Kammer & Gewerbe", chamberTxt: "Mitglied der Wirtschaftskammer Österreich (WKO). Anwendbare Rechtsvorschrift: Gewerbeordnung (GewO), abrufbar unter",
      shares: "Beteiligungsverhältnisse", authority: "Aufsichtsbehörde / Gewerbebehörde", profession: "Berufsbezeichnung",
      notes: [
        ["Haftung für Inhalte dieser Website", "Wir entwickeln die Inhalte dieser Website ständig weiter und bemühen uns, korrekte und aktuelle Informationen bereitzustellen. Eine Haftung für die Korrektheit aller Inhalte können wir jedoch nicht übernehmen, insbesondere für jene, die von Dritten bereitgestellt wurden. Als Diensteanbieter sind wir nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Sollten Ihnen rechtswidrige Inhalte auffallen, bitten wir um umgehende Kontaktaufnahme, damit wir diese entfernen können."],
        ["Haftung für Links auf dieser Website", "Unsere Website enthält Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte können wir keine Haftung übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich. Werden uns Rechtswidrigkeiten bekannt, entfernen wir die betreffenden Links umgehend."],
        ["Urheberrecht", "Alle Inhalte dieser Website (Bilder, Fotos, Texte, Videos) unterliegen dem Urheberrecht. Bitte fragen Sie uns, bevor Sie Inhalte dieser Website verbreiten, vervielfältigen oder verwerten. Falls erforderlich, verfolgen wir die unerlaubte Nutzung rechtlich."],
        ["Bildernachweis", "Die Bilder, Fotos und Grafiken auf dieser Website sind urheberrechtlich geschützt."],
      ],
      eu: "EU-Streitbeilegung",
      euTxt1: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: ",
      euTxt2: "Wir sind weder verpflichtet noch bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      upd: "Stand: Juni 2026",
    },
    ds: {
      title: "Datenschutzerklärung",
      sub: "Wir behandeln Ihre personenbezogenen Daten vertraulich und gemäß der DSGVO. Diese Erklärung informiert über Art, Umfang und Zweck der Verarbeitung.",
      controller: "Verantwortlicher",
      secs: [
        ["Verarbeitung bei Anfrage & Beauftragung", "Wenn Sie eine Prüfung anfragen oder einen Auftrag erteilen, verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name, E-Mail, Telefon, Unternehmen, betroffenes Google-Profil) zur Bearbeitung Ihres Anliegens und zur Vertragsabwicklung. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag/vorvertragliche Maßnahmen)."],
        ["Zahlungsabwicklung (Stripe)", "Zahlungen werden über Stripe (Stripe Payments Europe, Ltd., Irland) abgewickelt. Dabei werden die für die Zahlung erforderlichen Daten an Stripe übermittelt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Details: stripe.com/privacy."],
        ["Live-Chat (Tidio)", "Für den Support nutzen wir den Live-Chat von Tidio. Beim Öffnen des Chats können Verbindungsdaten und ggf. Cookies verarbeitet werden. Rechtsgrundlage: Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) bzw. unser berechtigtes Interesse an effizientem Support (Art. 6 Abs. 1 lit. f)."],
        ["Sprach-/Standorterkennung", "Damit wir Ihnen die Website in Ihrer Sprache anbieten können, ermitteln wir – ausschließlich mit Ihrer Einwilligung – über einen externen Dienst (GeoJS, get.geojs.io; ersatzweise api.country.is) anhand Ihrer IP-Adresse das Land, aus dem Sie zugreifen. Ihre IP-Adresse wird dabei an den jeweiligen Anbieter übermittelt (ggf. in ein Drittland). Wir speichern lediglich das ermittelte Länderkürzel lokal in Ihrem Browser (kein serverseitiges Protokollieren). Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), jederzeit mit Wirkung für die Zukunft widerrufbar. Ohne Einwilligung erfolgt keine IP-Abfrage; die Spracherkennung nutzt dann nur die lokal im Browser eingestellte Sprache."],
        ["Hosting & Server-Logs", "Unsere Website wird bei einem Infrastruktur-Dienstleister gehostet (Railway). Beim Aufruf können technisch notwendige Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, abgerufene Ressource) verarbeitet werden. Rechtsgrundlage: berechtigtes Interesse an sicherem Betrieb (Art. 6 Abs. 1 lit. f DSGVO)."],
        ["Speicherdauer", "Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen (z. B. steuer-/handelsrechtlich) dies vorschreiben."],
      ],
      rightsH: "Ihre Rechte",
      rightsTxt: "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Erteilte Einwilligungen können Sie jederzeit widerrufen. Wenden Sie sich dazu an ",
      rightsTail: ".",
      complaintH: "Beschwerderecht",
      complaintTxt: "Es besteht ein Beschwerderecht bei der zuständigen Aufsichtsbehörde – in Österreich der Österreichischen Datenschutzbehörde (dsb.gv.at).",
      upd: "Stand: Juni 2026",
    },
  },

  en: {
    country: "Austria",
    imp: {
      title: "Legal notice (Impressum)",
      sub: "Information pursuant to § 5 ECG, § 14 UGB and § 25 MedienG (Austria).",
      owner: "Owner & service provider",
      contact: "Contact", email: "Email", phone: "Phone",
      rep: "Authorised representatives", repTxt: "[…] (managing partners)",
      reg: "Register & tax details", uid: "VAT ID (UID)", fbn: "Commercial register no.", court: "Register court",
      biz: "Business activity", bizTxt: "Professional removal of Google Business Profiles and online-reputation services.",
      chamber: "Chamber & trade", chamberTxt: "Member of the Austrian Federal Economic Chamber (WKO). Applicable regulation: the Austrian Trade Act (Gewerbeordnung, GewO), available at",
      shares: "Ownership structure", authority: "Supervisory / trade authority", profession: "Professional title",
      notes: [
        ["Liability for the content of this website", "We continuously develop the content of this website and strive to provide correct and up-to-date information. However, we cannot assume liability for the accuracy of all content, in particular content provided by third parties. As a service provider we are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate unlawful activity. If you notice unlawful content, please contact us immediately so that we can remove it."],
        ["Liability for links on this website", "Our website contains links to external websites over whose content we have no influence. We therefore cannot accept any liability for this third-party content. The respective provider is always responsible for the content of linked pages. If we become aware of any legal infringements, we will remove the relevant links without delay."],
        ["Copyright", "All content on this website (images, photos, texts, videos) is protected by copyright. Please ask us before distributing, reproducing or otherwise using the content of this website. Where necessary, we will pursue the unauthorised use of our content by legal means."],
        ["Image credits", "The images, photos and graphics on this website are protected by copyright."],
      ],
      eu: "EU dispute resolution",
      euTxt1: "The European Commission provides a platform for online dispute resolution (ODR): ",
      euTxt2: "We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
      upd: "Last updated: June 2026",
    },
    ds: {
      title: "Privacy policy",
      sub: "We treat your personal data confidentially and in accordance with the GDPR. This statement explains the nature, scope and purpose of processing.",
      controller: "Controller",
      secs: [
        ["Processing for enquiries & orders", "When you request a check or place an order, we process the data you provide (e.g. name, email, phone, company, the Google profile concerned) to handle your request and perform the contract. Legal basis: Art. 6(1)(b) GDPR (contract/pre-contractual steps)."],
        ["Payments (Stripe)", "Payments are processed via Stripe (Stripe Payments Europe, Ltd., Ireland). The data required for the payment is transmitted to Stripe. Legal basis: Art. 6(1)(b) GDPR. Details: stripe.com/privacy."],
        ["Live chat (Tidio)", "For support we use the Tidio live chat. Opening the chat may process connection data and cookies. Legal basis: your consent (Art. 6(1)(a) GDPR) or our legitimate interest in efficient support (Art. 6(1)(f))."],
        ["Language/location detection", "To offer you the website in your language, we determine — only with your consent — the country you access from, based on your IP address, via an external service (GeoJS, get.geojs.io; fallback api.country.is). Your IP address is transmitted to the respective provider (possibly to a third country). We only store the detected country code locally in your browser (no server-side logging). Legal basis: consent (Art. 6(1)(a) GDPR), revocable at any time with future effect. Without consent no IP lookup takes place; language detection then uses only the language set locally in your browser."],
        ["Hosting & server logs", "Our website is hosted by an infrastructure provider (Railway). Access data technically required (e.g. IP address, timestamp, requested resource) may be processed. Legal basis: legitimate interest in secure operation (Art. 6(1)(f) GDPR)."],
        ["Retention", "We retain personal data only for as long as necessary for the stated purposes or as required by statutory retention periods (e.g. tax/commercial law)."],
      ],
      rightsH: "Your rights",
      rightsTxt: "You have the right to access, rectification, erasure, restriction of processing, data portability and objection. You may withdraw any consent at any time. To exercise these rights, contact ",
      rightsTail: ".",
      complaintH: "Right to lodge a complaint",
      complaintTxt: "You have the right to lodge a complaint with the competent supervisory authority — in Austria the Austrian Data Protection Authority (dsb.gv.at).",
      upd: "Last updated: June 2026",
    },
  },

  es: {
    country: "Austria",
    imp: {
      title: "Aviso legal (Impressum)",
      sub: "Información conforme a los §§ 5 ECG, 14 UGB y 25 MedienG (Austria).",
      owner: "Propietario y proveedor del servicio",
      contact: "Contacto", email: "Correo electrónico", phone: "Teléfono",
      rep: "Representantes autorizados", repTxt: "[…] (socios gerentes)",
      reg: "Datos registrales y fiscales", uid: "Número de identificación a efectos del IVA (UID)", fbn: "Número de registro mercantil", court: "Tribunal del registro",
      biz: "Objeto de la empresa", bizTxt: "Eliminación profesional de perfiles de empresa de Google y servicios de reputación online.",
      chamber: "Cámara y actividad", chamberTxt: "Miembro de la Cámara Económica de Austria (WKO). Normativa aplicable: el Reglamento de Actividades de Austria (Gewerbeordnung, GewO), disponible en",
      shares: "Estructura de participación", authority: "Autoridad de supervisión y de actividad", profession: "Denominación profesional",
      notes: [
        ["Responsabilidad por el contenido de este sitio web", "Desarrollamos continuamente el contenido de este sitio web y nos esforzamos por ofrecer información correcta y actualizada. No obstante, no podemos asumir responsabilidad por la exactitud de todos los contenidos, en particular los facilitados por terceros. Como prestador de servicios no estamos obligados a supervisar la información ajena transmitida o almacenada ni a investigar circunstancias que indiquen una actividad ilícita. Si detecta contenidos ilícitos, le rogamos que nos lo comunique de inmediato para poder eliminarlos."],
        ["Responsabilidad por los enlaces de este sitio web", "Nuestro sitio web contiene enlaces a sitios externos sobre cuyo contenido no tenemos influencia. Por ello no podemos asumir responsabilidad por dichos contenidos ajenos. Del contenido de las páginas enlazadas es siempre responsable el respectivo proveedor. Si tenemos conocimiento de infracciones, eliminaremos los enlaces correspondientes de inmediato."],
        ["Derechos de autor", "Todos los contenidos de este sitio web (imágenes, fotos, textos, vídeos) están protegidos por derechos de autor. Le rogamos que nos consulte antes de difundir, reproducir o explotar los contenidos de este sitio. En caso necesario, perseguiremos judicialmente el uso no autorizado de nuestros contenidos."],
        ["Créditos de las imágenes", "Las imágenes, fotos y gráficos de este sitio web están protegidos por derechos de autor."],
      ],
      eu: "Resolución de litigios de la UE",
      euTxt1: "La Comisión Europea pone a disposición una plataforma de resolución de litigios en línea (ODR): ",
      euTxt2: "No estamos obligados ni dispuestos a participar en procedimientos de resolución de litigios ante una junta arbitral de consumo.",
      upd: "Última actualización: junio de 2026",
    },
    ds: {
      title: "Política de privacidad",
      sub: "Tratamos sus datos personales de forma confidencial y conforme al RGPD. Esta declaración informa sobre la naturaleza, el alcance y la finalidad del tratamiento.",
      controller: "Responsable del tratamiento",
      secs: [
        ["Tratamiento en consultas y pedidos", "Cuando solicita una comprobación o realiza un pedido, tratamos los datos que nos facilita (p. ej., nombre, correo electrónico, teléfono, empresa, el perfil de Google afectado) para tramitar su solicitud y ejecutar el contrato. Base jurídica: art. 6, apdo. 1, letra b del RGPD (contrato/medidas precontractuales)."],
        ["Pagos (Stripe)", "Los pagos se procesan a través de Stripe (Stripe Payments Europe, Ltd., Irlanda). Los datos necesarios para el pago se transmiten a Stripe. Base jurídica: art. 6, apdo. 1, letra b del RGPD. Más información: stripe.com/privacy."],
        ["Chat en vivo (Tidio)", "Para el soporte utilizamos el chat en vivo de Tidio. Al abrir el chat pueden tratarse datos de conexión y, en su caso, cookies. Base jurídica: su consentimiento (art. 6, apdo. 1, letra a del RGPD) o nuestro interés legítimo en un soporte eficiente (art. 6, apdo. 1, letra f)."],
        ["Detección de idioma/ubicación", "Para ofrecerle el sitio web en su idioma, determinamos —únicamente con su consentimiento— el país desde el que accede a partir de su dirección IP, mediante un servicio externo (GeoJS, get.geojs.io; alternativa api.country.is). Su dirección IP se transmite al proveedor correspondiente (en su caso, a un tercer país). Solo almacenamos el código de país detectado localmente en su navegador (sin registro en el servidor). Base jurídica: su consentimiento (art. 6, apdo. 1, letra a del RGPD), que puede retirar en cualquier momento con efecto futuro. Sin consentimiento no se realiza ninguna consulta de IP; la detección de idioma utiliza entonces únicamente el idioma configurado localmente en su navegador."],
        ["Alojamiento y registros del servidor", "Nuestro sitio web se aloja en un proveedor de infraestructura (Railway). Al acceder pueden tratarse datos técnicamente necesarios (p. ej., dirección IP, fecha y hora, recurso solicitado). Base jurídica: interés legítimo en un funcionamiento seguro (art. 6, apdo. 1, letra f del RGPD)."],
        ["Plazo de conservación", "Conservamos los datos personales solo durante el tiempo necesario para los fines indicados o mientras lo exijan los plazos legales de conservación (p. ej., fiscales o mercantiles)."],
      ],
      rightsH: "Sus derechos",
      rightsTxt: "Tiene derecho de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición. Puede retirar en cualquier momento los consentimientos otorgados. Para ejercer estos derechos, diríjase a ",
      rightsTail: ".",
      complaintH: "Derecho de reclamación",
      complaintTxt: "Tiene derecho a presentar una reclamación ante la autoridad de control competente; en Austria, la Autoridad de Protección de Datos austriaca (dsb.gv.at).",
      upd: "Última actualización: junio de 2026",
    },
  },

  fr: {
    country: "Autriche",
    imp: {
      title: "Mentions légales (Impressum)",
      sub: "Informations conformément aux §§ 5 ECG, 14 UGB et 25 MedienG (Autriche).",
      owner: "Propriétaire & prestataire de services",
      contact: "Contact", email: "E-mail", phone: "Téléphone",
      rep: "Représentants autorisés", repTxt: "[…] (associés gérants)",
      reg: "Données d'enregistrement & fiscales", uid: "Numéro d'identification TVA (UID)", fbn: "Numéro du registre du commerce", court: "Tribunal du registre",
      biz: "Objet de l'entreprise", bizTxt: "Suppression professionnelle de fiches d'établissement Google et services de réputation en ligne.",
      chamber: "Chambre & activité", chamberTxt: "Membre de la Chambre économique d'Autriche (WKO). Réglementation applicable : le code autrichien des activités (Gewerbeordnung, GewO), disponible sur",
      shares: "Répartition du capital", authority: "Autorité de surveillance / autorité commerciale", profession: "Titre professionnel",
      notes: [
        ["Responsabilité quant au contenu de ce site", "Nous développons en permanence le contenu de ce site et nous efforçons de fournir des informations correctes et à jour. Nous ne pouvons toutefois pas garantir l'exactitude de l'ensemble des contenus, en particulier ceux fournis par des tiers. En tant que prestataire de services, nous ne sommes pas tenus de surveiller les informations de tiers transmises ou stockées, ni de rechercher des circonstances révélant une activité illicite. Si vous constatez des contenus illicites, merci de nous contacter sans délai afin que nous puissions les supprimer."],
        ["Responsabilité quant aux liens présents sur ce site", "Notre site contient des liens vers des sites externes dont nous ne maîtrisons pas le contenu. Nous déclinons donc toute responsabilité concernant ces contenus tiers. Le fournisseur respectif est toujours responsable du contenu des pages liées. Dès que nous avons connaissance d'infractions, nous supprimons les liens concernés sans délai."],
        ["Droit d'auteur", "L'ensemble des contenus de ce site (images, photos, textes, vidéos) est protégé par le droit d'auteur. Merci de nous consulter avant de diffuser, reproduire ou exploiter les contenus de ce site. Le cas échéant, nous poursuivrons en justice toute utilisation non autorisée de nos contenus."],
        ["Crédits photographiques", "Les images, photos et graphiques de ce site sont protégés par le droit d'auteur."],
      ],
      eu: "Règlement des litiges de l'UE",
      euTxt1: "La Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) : ",
      euTxt2: "Nous ne sommes ni tenus ni disposés à participer à une procédure de règlement des litiges devant un organisme de conciliation pour consommateurs.",
      upd: "Dernière mise à jour : juin 2026",
    },
    ds: {
      title: "Politique de confidentialité",
      sub: "Nous traitons vos données personnelles de manière confidentielle et conformément au RGPD. La présente déclaration vous informe de la nature, de l'étendue et de la finalité des traitements.",
      controller: "Responsable du traitement",
      secs: [
        ["Traitement lors des demandes & commandes", "Lorsque vous demandez une vérification ou passez commande, nous traitons les données que vous fournissez (p. ex. nom, e-mail, téléphone, entreprise, la fiche Google concernée) pour traiter votre demande et exécuter le contrat. Base juridique : art. 6, § 1, point b du RGPD (contrat/mesures précontractuelles)."],
        ["Paiements (Stripe)", "Les paiements sont traités via Stripe (Stripe Payments Europe, Ltd., Irlande). Les données nécessaires au paiement sont transmises à Stripe. Base juridique : art. 6, § 1, point b du RGPD. Détails : stripe.com/privacy."],
        ["Chat en direct (Tidio)", "Pour le support, nous utilisons le chat en direct de Tidio. À l'ouverture du chat, des données de connexion et, le cas échéant, des cookies peuvent être traités. Base juridique : votre consentement (art. 6, § 1, point a du RGPD) ou notre intérêt légitime à un support efficace (art. 6, § 1, point f)."],
        ["Détection de la langue/localisation", "Afin de vous proposer le site dans votre langue, nous déterminons — uniquement avec votre consentement — le pays depuis lequel vous vous connectez à partir de votre adresse IP, via un service externe (GeoJS, get.geojs.io ; à défaut api.country.is). Votre adresse IP est transmise au prestataire concerné (le cas échéant vers un pays tiers). Nous ne stockons que le code pays détecté, localement dans votre navigateur (aucune journalisation côté serveur). Base juridique : votre consentement (art. 6, § 1, point a du RGPD), révocable à tout moment avec effet pour l'avenir. Sans consentement, aucune requête IP n'est effectuée ; la détection de la langue utilise alors uniquement la langue configurée localement dans votre navigateur."],
        ["Hébergement & journaux serveur", "Notre site est hébergé chez un prestataire d'infrastructure (Railway). Lors de l'accès, des données techniquement nécessaires (p. ex. adresse IP, horodatage, ressource demandée) peuvent être traitées. Base juridique : intérêt légitime à une exploitation sécurisée (art. 6, § 1, point f du RGPD)."],
        ["Durée de conservation", "Nous ne conservons les données personnelles que le temps nécessaire aux finalités indiquées ou conformément aux obligations légales de conservation (p. ex. fiscales/commerciales)."],
      ],
      rightsH: "Vos droits",
      rightsTxt: "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation du traitement, de portabilité et d'opposition. Vous pouvez révoquer à tout moment les consentements donnés. Pour exercer ces droits, contactez ",
      rightsTail: ".",
      complaintH: "Droit de réclamation",
      complaintTxt: "Vous avez le droit d'introduire une réclamation auprès de l'autorité de contrôle compétente — en Autriche, l'autorité autrichienne de protection des données (dsb.gv.at).",
      upd: "Dernière mise à jour : juin 2026",
    },
  },

  it: {
    country: "Austria",
    imp: {
      title: "Note legali (Impressum)",
      sub: "Informazioni ai sensi dei §§ 5 ECG, 14 UGB e 25 MedienG (Austria).",
      owner: "Proprietario & fornitore del servizio",
      contact: "Contatto", email: "E-mail", phone: "Telefono",
      rep: "Rappresentanti autorizzati", repTxt: "[…] (soci amministratori)",
      reg: "Dati di registro & fiscali", uid: "Partita IVA (UID)", fbn: "Numero del registro delle imprese", court: "Tribunale del registro",
      biz: "Oggetto sociale", bizTxt: "Rimozione professionale di profili aziendali Google e servizi di reputazione online.",
      chamber: "Camera & attività", chamberTxt: "Membro della Camera economica austriaca (WKO). Normativa applicabile: il Codice austriaco delle attività (Gewerbeordnung, GewO), disponibile su",
      shares: "Assetto partecipativo", authority: "Autorità di vigilanza / autorità commerciale", profession: "Qualifica professionale",
      notes: [
        ["Responsabilità per i contenuti di questo sito", "Sviluppiamo costantemente i contenuti di questo sito e ci impegniamo a fornire informazioni corrette e aggiornate. Non possiamo tuttavia assumere alcuna responsabilità per la correttezza di tutti i contenuti, in particolare quelli forniti da terzi. In qualità di fornitori di servizi non siamo tenuti a sorvegliare le informazioni altrui trasmesse o memorizzate, né a ricercare circostanze che indichino un'attività illecita. Qualora notiate contenuti illeciti, vi preghiamo di contattarci immediatamente affinché possiamo rimuoverli."],
        ["Responsabilità per i link presenti su questo sito", "Il nostro sito contiene link a siti esterni sui cui contenuti non abbiamo alcuna influenza. Non possiamo pertanto assumere alcuna responsabilità per tali contenuti di terzi. Del contenuto delle pagine collegate è sempre responsabile il rispettivo fornitore. Qualora veniamo a conoscenza di violazioni di legge, rimuoveremo immediatamente i relativi link."],
        ["Diritto d'autore", "Tutti i contenuti di questo sito (immagini, foto, testi, video) sono protetti dal diritto d'autore. Vi preghiamo di contattarci prima di diffondere, riprodurre o utilizzare i contenuti di questo sito. Se necessario, perseguiremo legalmente l'uso non autorizzato dei nostri contenuti."],
        ["Crediti delle immagini", "Le immagini, le foto e i grafici presenti su questo sito sono protetti dal diritto d'autore."],
      ],
      eu: "Risoluzione delle controversie UE",
      euTxt1: "La Commissione europea mette a disposizione una piattaforma per la risoluzione online delle controversie (ODR): ",
      euTxt2: "Non siamo obbligati né disposti a partecipare a procedure di risoluzione delle controversie dinanzi a un organismo di conciliazione dei consumatori.",
      upd: "Ultimo aggiornamento: giugno 2026",
    },
    ds: {
      title: "Informativa sulla privacy",
      sub: "Trattiamo i suoi dati personali in modo riservato e in conformità al GDPR. La presente informativa illustra natura, ambito e finalità del trattamento.",
      controller: "Titolare del trattamento",
      secs: [
        ["Trattamento per richieste & ordini", "Quando richiede una verifica o effettua un ordine, trattiamo i dati da lei forniti (ad es. nome, e-mail, telefono, azienda, il profilo Google interessato) per gestire la sua richiesta ed eseguire il contratto. Base giuridica: art. 6, par. 1, lett. b del GDPR (contratto/misure precontrattuali)."],
        ["Pagamenti (Stripe)", "I pagamenti sono gestiti tramite Stripe (Stripe Payments Europe, Ltd., Irlanda). I dati necessari al pagamento vengono trasmessi a Stripe. Base giuridica: art. 6, par. 1, lett. b del GDPR. Dettagli: stripe.com/privacy."],
        ["Chat dal vivo (Tidio)", "Per l'assistenza utilizziamo la live chat di Tidio. All'apertura della chat possono essere trattati dati di connessione ed eventuali cookie. Base giuridica: il suo consenso (art. 6, par. 1, lett. a del GDPR) o il nostro legittimo interesse a un'assistenza efficiente (art. 6, par. 1, lett. f)."],
        ["Rilevamento della lingua/posizione", "Per offrirle il sito web nella sua lingua, determiniamo — esclusivamente con il suo consenso — il Paese da cui accede in base al suo indirizzo IP, tramite un servizio esterno (GeoJS, get.geojs.io; in alternativa api.country.is). Il suo indirizzo IP viene trasmesso al rispettivo fornitore (eventualmente in un Paese terzo). Memorizziamo solo il codice del Paese rilevato, localmente nel suo browser (nessuna registrazione lato server). Base giuridica: il suo consenso (art. 6, par. 1, lett. a del GDPR), revocabile in qualsiasi momento con effetto per il futuro. Senza consenso non viene effettuata alcuna richiesta IP; il rilevamento della lingua utilizza quindi solo la lingua impostata localmente nel suo browser."],
        ["Hosting & log del server", "Il nostro sito è ospitato presso un fornitore di infrastruttura (Railway). All'accesso possono essere trattati dati tecnicamente necessari (ad es. indirizzo IP, data e ora, risorsa richiesta). Base giuridica: legittimo interesse a un funzionamento sicuro (art. 6, par. 1, lett. f del GDPR)."],
        ["Conservazione", "Conserviamo i dati personali solo per il tempo necessario alle finalità indicate o secondo gli obblighi legali di conservazione (ad es. fiscali/commerciali)."],
      ],
      rightsH: "I suoi diritti",
      rightsTxt: "Lei ha diritto di accesso, rettifica, cancellazione, limitazione del trattamento, portabilità dei dati e opposizione. Può revocare in qualsiasi momento i consensi prestati. Per esercitare questi diritti contatti ",
      rightsTail: ".",
      complaintH: "Diritto di reclamo",
      complaintTxt: "Ha il diritto di proporre reclamo all'autorità di controllo competente — in Austria l'Autorità austriaca per la protezione dei dati (dsb.gv.at).",
      upd: "Ultimo aggiornamento: giugno 2026",
    },
  },

  nl: {
    country: "Oostenrijk",
    imp: {
      title: "Juridische kennisgeving (Impressum)",
      sub: "Informatie conform §§ 5 ECG, 14 UGB en 25 MedienG (Oostenrijk).",
      owner: "Eigenaar & dienstverlener",
      contact: "Contact", email: "E-mail", phone: "Telefoon",
      rep: "Vertegenwoordigingsbevoegden", repTxt: "[…] (beherende vennoten)",
      reg: "Register- & belastinggegevens", uid: "Btw-identificatienummer (UID)", fbn: "Handelsregisternummer", court: "Registerrechtbank",
      biz: "Bedrijfsactiviteit", bizTxt: "Professionele verwijdering van Google-bedrijfsprofielen en online-reputatiediensten.",
      chamber: "Kamer & bedrijfsvoering", chamberTxt: "Lid van de Oostenrijkse Kamer van Koophandel (WKO). Toepasselijke regelgeving: de Oostenrijkse Gewerbeordnung (GewO), beschikbaar op",
      shares: "Eigendomsverhoudingen", authority: "Toezichthoudende / bedrijfsautoriteit", profession: "Beroepsbenaming",
      notes: [
        ["Aansprakelijkheid voor de inhoud van deze website", "Wij ontwikkelen de inhoud van deze website voortdurend verder en streven ernaar correcte en actuele informatie te verstrekken. Wij kunnen echter geen aansprakelijkheid aanvaarden voor de juistheid van alle inhoud, in het bijzonder die van derden. Als dienstverlener zijn wij niet verplicht doorgegeven of opgeslagen informatie van derden te controleren of onderzoek te doen naar omstandigheden die op een onwettige activiteit wijzen. Mocht u onwettige inhoud opmerken, neem dan onmiddellijk contact met ons op zodat wij deze kunnen verwijderen."],
        ["Aansprakelijkheid voor links op deze website", "Onze website bevat links naar externe websites waarop wij geen invloed hebben. Voor deze inhoud van derden kunnen wij dan ook geen aansprakelijkheid aanvaarden. Voor de inhoud van de gelinkte pagina's is steeds de betreffende aanbieder verantwoordelijk. Zodra wij kennis krijgen van inbreuken, verwijderen wij de betreffende links onverwijld."],
        ["Auteursrecht", "Alle inhoud op deze website (afbeeldingen, foto's, teksten, video's) is auteursrechtelijk beschermd. Vraag het ons voordat u de inhoud van deze website verspreidt, verveelvoudigt of exploiteert. Indien nodig vervolgen wij onrechtmatig gebruik van onze inhoud langs juridische weg."],
        ["Beeldverantwoording", "De afbeeldingen, foto's en grafieken op deze website zijn auteursrechtelijk beschermd."],
      ],
      eu: "EU-geschillenbeslechting",
      euTxt1: "De Europese Commissie biedt een platform voor onlinegeschillenbeslechting (ODR): ",
      euTxt2: "Wij zijn niet verplicht en niet bereid deel te nemen aan geschillenbeslechtingsprocedures voor een consumentengeschillencommissie.",
      upd: "Laatst bijgewerkt: juni 2026",
    },
    ds: {
      title: "Privacyverklaring",
      sub: "Wij behandelen uw persoonsgegevens vertrouwelijk en conform de AVG. Deze verklaring informeert u over aard, omvang en doel van de verwerking.",
      controller: "Verwerkingsverantwoordelijke",
      secs: [
        ["Verwerking bij aanvragen & bestellingen", "Wanneer u een controle aanvraagt of een bestelling plaatst, verwerken wij de door u verstrekte gegevens (bijv. naam, e-mail, telefoon, bedrijf, het betrokken Google-profiel) om uw verzoek af te handelen en de overeenkomst uit te voeren. Rechtsgrondslag: art. 6 lid 1 sub b AVG (overeenkomst/precontractuele maatregelen)."],
        ["Betalingen (Stripe)", "Betalingen verlopen via Stripe (Stripe Payments Europe, Ltd., Ierland). De voor de betaling vereiste gegevens worden aan Stripe doorgegeven. Rechtsgrondslag: art. 6 lid 1 sub b AVG. Details: stripe.com/privacy."],
        ["Livechat (Tidio)", "Voor support gebruiken wij de livechat van Tidio. Bij het openen van de chat kunnen verbindingsgegevens en eventueel cookies worden verwerkt. Rechtsgrondslag: uw toestemming (art. 6 lid 1 sub a AVG) of ons gerechtvaardigd belang bij efficiënte support (art. 6 lid 1 sub f)."],
        ["Taal-/locatieherkenning", "Om u de website in uw taal aan te bieden, bepalen wij — uitsluitend met uw toestemming — op basis van uw IP-adres het land van waaruit u de site bezoekt, via een externe dienst (GeoJS, get.geojs.io; als alternatief api.country.is). Uw IP-adres wordt daarbij doorgegeven aan de betreffende aanbieder (eventueel naar een derde land). Wij slaan uitsluitend de vastgestelde landcode lokaal in uw browser op (geen registratie aan serverzijde). Rechtsgrondslag: uw toestemming (art. 6 lid 1 sub a AVG), te allen tijde met werking voor de toekomst in te trekken. Zonder toestemming vindt er geen IP-opvraging plaats; de taalherkenning gebruikt dan alleen de taal die lokaal in uw browser is ingesteld."],
        ["Hosting & serverlogs", "Onze website wordt gehost bij een infrastructuuraanbieder (Railway). Bij het bezoek kunnen technisch noodzakelijke toegangsgegevens (bijv. IP-adres, tijdstip, opgevraagde bron) worden verwerkt. Rechtsgrondslag: gerechtvaardigd belang bij een veilige werking (art. 6 lid 1 sub f AVG)."],
        ["Bewaartermijn", "Wij bewaren persoonsgegevens slechts zolang dit voor de genoemde doeleinden nodig is of wettelijke bewaartermijnen (bijv. fiscaal/handelsrechtelijk) dit voorschrijven."],
      ],
      rightsH: "Uw rechten",
      rightsTxt: "U heeft recht op inzage, rectificatie, wissing, beperking van de verwerking, gegevensoverdraagbaarheid en bezwaar. Gegeven toestemmingen kunt u te allen tijde intrekken. Neem hiervoor contact op via ",
      rightsTail: ".",
      complaintH: "Klachtrecht",
      complaintTxt: "U heeft het recht een klacht in te dienen bij de bevoegde toezichthouder — in Oostenrijk de Oostenrijkse gegevensbeschermingsautoriteit (dsb.gv.at).",
      upd: "Laatst bijgewerkt: juni 2026",
    },
  },

  pt: {
    country: "Áustria",
    imp: {
      title: "Aviso legal (Impressum)",
      sub: "Informações nos termos dos §§ 5 ECG, 14 UGB e 25 MedienG (Áustria).",
      owner: "Proprietário & prestador do serviço",
      contact: "Contacto", email: "E-mail", phone: "Telefone",
      rep: "Representantes autorizados", repTxt: "[…] (sócios-gerentes)",
      reg: "Dados de registo & fiscais", uid: "Número de identificação de IVA (UID)", fbn: "Número de registo comercial", court: "Tribunal de registo",
      biz: "Objeto da empresa", bizTxt: "Remoção profissional de perfis de empresa do Google e serviços de reputação online.",
      chamber: "Câmara & atividade", chamberTxt: "Membro da Câmara Económica da Áustria (WKO). Regulamentação aplicável: o Código de Atividades da Áustria (Gewerbeordnung, GewO), disponível em",
      shares: "Estrutura de participação", authority: "Autoridade de supervisão / autoridade comercial", profession: "Designação profissional",
      notes: [
        ["Responsabilidade pelo conteúdo deste site", "Desenvolvemos continuamente o conteúdo deste site e esforçamo-nos por disponibilizar informações corretas e atualizadas. Contudo, não podemos assumir responsabilidade pela exatidão de todos os conteúdos, em particular os fornecidos por terceiros. Enquanto prestadores de serviços, não somos obrigados a vigiar informações de terceiros transmitidas ou armazenadas, nem a investigar circunstâncias que indiciem uma atividade ilícita. Caso detete conteúdos ilícitos, agradecemos que nos contacte de imediato para que possamos removê-los."],
        ["Responsabilidade pelas ligações neste site", "O nosso site contém ligações para sites externos sobre cujo conteúdo não temos influência. Por conseguinte, não podemos assumir qualquer responsabilidade por esses conteúdos de terceiros. Pelo conteúdo das páginas ligadas é sempre responsável o respetivo fornecedor. Logo que tenhamos conhecimento de infrações, removeremos de imediato as ligações em causa."],
        ["Direitos de autor", "Todos os conteúdos deste site (imagens, fotos, textos, vídeos) estão protegidos por direitos de autor. Solicitamos que nos consulte antes de divulgar, reproduzir ou utilizar os conteúdos deste site. Se necessário, perseguiremos judicialmente a utilização não autorizada dos nossos conteúdos."],
        ["Créditos das imagens", "As imagens, fotos e grafismos deste site estão protegidos por direitos de autor."],
      ],
      eu: "Resolução de litígios da UE",
      euTxt1: "A Comissão Europeia disponibiliza uma plataforma de resolução de litígios em linha (RLL): ",
      euTxt2: "Não estamos obrigados nem dispostos a participar em procedimentos de resolução de litígios perante uma entidade de arbitragem de consumo.",
      upd: "Última atualização: junho de 2026",
    },
    ds: {
      title: "Política de privacidade",
      sub: "Tratamos os seus dados pessoais de forma confidencial e em conformidade com o RGPD. Esta declaração informa sobre a natureza, o âmbito e a finalidade do tratamento.",
      controller: "Responsável pelo tratamento",
      secs: [
        ["Tratamento em pedidos & encomendas", "Quando solicita uma verificação ou efetua uma encomenda, tratamos os dados que fornece (p. ex., nome, e-mail, telefone, empresa, o perfil Google em causa) para processar o seu pedido e executar o contrato. Base jurídica: art. 6.º, n.º 1, alínea b) do RGPD (contrato/diligências pré-contratuais)."],
        ["Pagamentos (Stripe)", "Os pagamentos são processados através da Stripe (Stripe Payments Europe, Ltd., Irlanda). Os dados necessários ao pagamento são transmitidos à Stripe. Base jurídica: art. 6.º, n.º 1, alínea b) do RGPD. Detalhes: stripe.com/privacy."],
        ["Chat ao vivo (Tidio)", "Para o suporte utilizamos o chat ao vivo da Tidio. Ao abrir o chat podem ser tratados dados de ligação e, se aplicável, cookies. Base jurídica: o seu consentimento (art. 6.º, n.º 1, alínea a) do RGPD) ou o nosso interesse legítimo num suporte eficiente (art. 6.º, n.º 1, alínea f))."],
        ["Deteção de idioma/localização", "Para lhe oferecermos o site no seu idioma, determinamos — exclusivamente com o seu consentimento — o país a partir do qual acede, com base no seu endereço IP, através de um serviço externo (GeoJS, get.geojs.io; em alternativa api.country.is). O seu endereço IP é transmitido ao respetivo fornecedor (eventualmente para um país terceiro). Armazenamos apenas o código de país detetado, localmente no seu navegador (sem registo do lado do servidor). Base jurídica: o seu consentimento (art. 6.º, n.º 1, alínea a) do RGPD), que pode retirar a qualquer momento com efeitos para o futuro. Sem consentimento não é efetuada qualquer consulta de IP; a deteção de idioma utiliza então apenas o idioma definido localmente no seu navegador."],
        ["Alojamento & registos do servidor", "O nosso site é alojado num fornecedor de infraestrutura (Railway). No acesso podem ser tratados dados tecnicamente necessários (p. ex., endereço IP, data/hora, recurso solicitado). Base jurídica: interesse legítimo num funcionamento seguro (art. 6.º, n.º 1, alínea f) do RGPD)."],
        ["Prazo de conservação", "Conservamos os dados pessoais apenas pelo tempo necessário às finalidades indicadas ou conforme exigido pelos prazos legais de conservação (p. ex., fiscais/comerciais)."],
      ],
      rightsH: "Os seus direitos",
      rightsTxt: "Tem direito de acesso, retificação, apagamento, limitação do tratamento, portabilidade e oposição. Pode retirar a qualquer momento os consentimentos dados. Para exercer estes direitos, contacte ",
      rightsTail: ".",
      complaintH: "Direito de reclamação",
      complaintTxt: "Tem o direito de apresentar reclamação à autoridade de controlo competente — na Áustria, a Autoridade Austríaca de Proteção de Dados (dsb.gv.at).",
      upd: "Última atualização: junho de 2026",
    },
  },

  ja: {
    country: "オーストリア",
    imp: {
      title: "法的表示（Impressum）",
      sub: "オーストリア法（ECG第5条、UGB第14条、MedienG第25条）に基づく表示。",
      owner: "メディア所有者・サービス提供者",
      contact: "連絡先", email: "メール", phone: "電話",
      rep: "代表者", repTxt: "[…]（業務執行社員）",
      reg: "登記・税務情報", uid: "VAT番号（UID）", fbn: "商業登記番号", court: "登記裁判所",
      biz: "事業内容", bizTxt: "Googleビジネスプロフィールの専門的な削除およびオンライン評判管理サービス。",
      chamber: "商工会議所・営業", chamberTxt: "オーストリア連邦経済会議所（WKO）会員。適用法令：オーストリア営業法（Gewerbeordnung, GewO）。参照先：",
      shares: "出資比率", authority: "監督官庁／営業許可官庁", profession: "職業名称",
      notes: [
        ["当ウェブサイトのコンテンツに関する責任", "当社は当ウェブサイトのコンテンツを継続的に発展させ、正確かつ最新の情報の提供に努めています。ただし、すべてのコンテンツ、とりわけ第三者が提供したコンテンツの正確性について責任を負うことはできません。サービス提供者として、当社は送信または保存された第三者の情報を監視する義務、または違法行為を示す状況を調査する義務を負いません。違法なコンテンツにお気づきの場合は、削除できるよう速やかにご連絡ください。"],
        ["当ウェブサイトのリンクに関する責任", "当ウェブサイトには、当社が内容を管理できない外部サイトへのリンクが含まれています。これら第三者のコンテンツについて当社は責任を負いません。リンク先ページの内容については、常に各提供者が責任を負います。違法性が判明した場合、当社は該当リンクを速やかに削除します。"],
        ["著作権", "当ウェブサイトのすべてのコンテンツ（画像、写真、テキスト、動画）は著作権で保護されています。当ウェブサイトのコンテンツを配布・複製・利用される場合は、事前に当社へお問い合わせください。必要に応じて、無断使用に対して法的措置を講じます。"],
        ["画像の出典", "当ウェブサイトの画像、写真およびグラフィックは著作権で保護されています。"],
      ],
      eu: "EU紛争解決",
      euTxt1: "欧州委員会はオンライン紛争解決（ODR）プラットフォームを提供しています: ",
      euTxt2: "当社は、消費者仲裁機関での紛争解決手続に参加する義務はなく、参加する意思もありません。",
      upd: "最終更新：2026年6月",
    },
    ds: {
      title: "プライバシーポリシー",
      sub: "当社はお客様の個人データを秘密として扱い、GDPRに従って処理します。本ポリシーでは処理の種類・範囲・目的についてご説明します。",
      controller: "管理者",
      secs: [
        ["お問い合わせ・ご注文時の処理", "チェックのご依頼やご注文の際、当社はお客様が提供したデータ（例：氏名、メール、電話、会社名、対象のGoogleプロフィール）を、ご依頼への対応および契約履行のために処理します。法的根拠：GDPR第6条第1項(b)（契約／契約前の措置）。"],
        ["決済（Stripe）", "決済はStripe（Stripe Payments Europe, Ltd.、アイルランド）を通じて処理されます。決済に必要なデータがStripeに送信されます。法的根拠：GDPR第6条第1項(b)。詳細：stripe.com/privacy。"],
        ["ライブチャット（Tidio）", "サポートのためにTidioのライブチャットを使用しています。チャットを開くと、接続データや場合によりCookieが処理されることがあります。法的根拠：お客様の同意（GDPR第6条第1項(a)）または効率的なサポートに対する正当な利益（同(f)）。"],
        ["言語・地域の判定", "お客様の言語でウェブサイトを表示するため、お客様の同意がある場合に限り、外部サービス（GeoJS, get.geojs.io、予備として api.country.is）を用いて、IPアドレスからアクセス元の国を判定します。その際、お客様のIPアドレスは当該プロバイダー（場合により第三国）へ送信されます。判定した国コードのみをお客様のブラウザ内にローカルで保存します（サーバー側での記録は行いません）。法的根拠：お客様の同意（GDPR第6条第1項(a)）であり、将来に向けていつでも撤回できます。同意がない場合、IPの照会は行わず、言語判定はブラウザにローカル設定された言語のみを使用します。"],
        ["ホスティング・サーバーログ", "当サイトはインフラ事業者（Railway）でホストされています。アクセス時に技術的に必要なデータ（例：IPアドレス、時刻、要求されたリソース）が処理されることがあります。法的根拠：安全な運用に対する正当な利益（GDPR第6条第1項(f)）。"],
        ["保存期間", "個人データは、記載の目的に必要な期間、または法定保存期間（例：税法・商法）が求める期間に限り保存します。"],
      ],
      rightsH: "お客様の権利",
      rightsTxt: "お客様には、アクセス、訂正、削除、処理の制限、データポータビリティおよび異議申立ての権利があります。与えた同意は、将来に向けていつでも撤回できます。権利行使のご連絡先: ",
      rightsTail: "。",
      complaintH: "苦情申立ての権利",
      complaintTxt: "管轄の監督機関に苦情を申し立てる権利があります。オーストリアではオーストリア・データ保護庁（dsb.gv.at）です。",
      upd: "最終更新：2026年6月",
    },
  },

  sv: {
    country: "Österrike",
    imp: {
      title: "Juridisk information (Impressum)",
      sub: "Uppgifter enligt §§ 5 ECG, 14 UGB och 25 MedienG (Österrike).",
      owner: "Ägare & tjänsteleverantör",
      contact: "Kontakt", email: "E-post", phone: "Telefon",
      rep: "Behöriga företrädare", repTxt: "[…] (verkställande bolagsmän)",
      reg: "Register- & skatteuppgifter", uid: "Momsregistreringsnummer (UID)", fbn: "Handelsregisternummer", court: "Registerdomstol",
      biz: "Verksamhet", bizTxt: "Professionell borttagning av Google-företagsprofiler samt tjänster för online-rykte.",
      chamber: "Kammare & näring", chamberTxt: "Medlem i Österrikes handelskammare (WKO). Tillämplig författning: den österrikiska näringsförordningen (Gewerbeordnung, GewO), tillgänglig på",
      shares: "Ägarförhållanden", authority: "Tillsyns- och näringsmyndighet", profession: "Yrkesbeteckning",
      notes: [
        ["Ansvar för innehållet på denna webbplats", "Vi utvecklar fortlöpande innehållet på denna webbplats och strävar efter att tillhandahålla korrekt och aktuell information. Vi kan dock inte ansvara för att allt innehåll är korrekt, särskilt sådant som tillhandahållits av tredje part. Som tjänsteleverantör är vi inte skyldiga att övervaka överförd eller lagrad information från tredje part eller att efterforska omständigheter som tyder på olaglig verksamhet. Om du upptäcker olagligt innehåll ber vi dig kontakta oss omgående så att vi kan ta bort det."],
        ["Ansvar för länkar på denna webbplats", "Vår webbplats innehåller länkar till externa webbplatser vars innehåll vi inte kan påverka. Vi kan därför inte ta något ansvar för detta innehåll från tredje part. För innehållet på länkade sidor ansvarar alltid respektive leverantör. Om vi får kännedom om överträdelser tar vi omedelbart bort de aktuella länkarna."],
        ["Upphovsrätt", "Allt innehåll på denna webbplats (bilder, foton, texter, videor) är skyddat av upphovsrätt. Kontakta oss innan du sprider, mångfaldigar eller använder innehållet på denna webbplats. Vid behov beivrar vi otillåten användning av vårt innehåll rättsligt."],
        ["Bildkällor", "Bilderna, fotona och grafiken på denna webbplats är skyddade av upphovsrätt."],
      ],
      eu: "EU-tvistlösning",
      euTxt1: "Europeiska kommissionen tillhandahåller en plattform för tvistlösning online (ODR): ",
      euTxt2: "Vi är varken skyldiga eller villiga att delta i tvistlösningsförfaranden inför en konsumentskiljenämnd.",
      upd: "Senast uppdaterad: juni 2026",
    },
    ds: {
      title: "Integritetspolicy",
      sub: "Vi behandlar dina personuppgifter konfidentiellt och i enlighet med GDPR. Denna policy informerar om behandlingens art, omfattning och ändamål.",
      controller: "Personuppgiftsansvarig",
      secs: [
        ["Behandling vid förfrågningar & beställningar", "När du begär en kontroll eller lägger en beställning behandlar vi de uppgifter du lämnar (t.ex. namn, e-post, telefon, företag, den berörda Google-profilen) för att hantera ditt ärende och fullgöra avtalet. Rättslig grund: art. 6.1 b GDPR (avtal/åtgärder före avtal)."],
        ["Betalningar (Stripe)", "Betalningar hanteras via Stripe (Stripe Payments Europe, Ltd., Irland). De uppgifter som krävs för betalningen överförs till Stripe. Rättslig grund: art. 6.1 b GDPR. Mer info: stripe.com/privacy."],
        ["Livechatt (Tidio)", "För support använder vi Tidios livechatt. När chatten öppnas kan anslutningsdata och eventuella cookies behandlas. Rättslig grund: ditt samtycke (art. 6.1 a GDPR) eller vårt berättigade intresse av effektiv support (art. 6.1 f)."],
        ["Språk-/platsidentifiering", "För att kunna erbjuda dig webbplatsen på ditt språk fastställer vi – endast med ditt samtycke – vilket land du besöker från utifrån din IP-adress, via en extern tjänst (GeoJS, get.geojs.io; alternativt api.country.is). Din IP-adress överförs då till respektive leverantör (eventuellt till ett tredjeland). Vi lagrar endast den fastställda landskoden, lokalt i din webbläsare (ingen serverloggning). Rättslig grund: ditt samtycke (art. 6.1 a GDPR), som du när som helst kan återkalla med verkan för framtiden. Utan samtycke görs ingen IP-förfrågan; språkidentifieringen använder då endast det språk som är inställt lokalt i din webbläsare."],
        ["Hosting & serverloggar", "Vår webbplats hostas hos en infrastrukturleverantör (Railway). Vid besök kan tekniskt nödvändiga åtkomstdata (t.ex. IP-adress, tidpunkt, begärd resurs) behandlas. Rättslig grund: berättigat intresse av säker drift (art. 6.1 f GDPR)."],
        ["Lagringstid", "Vi lagrar personuppgifter endast så länge det krävs för angivna ändamål eller enligt lagstadgade lagringstider (t.ex. skatte-/handelsrätt)."],
      ],
      rightsH: "Dina rättigheter",
      rightsTxt: "Du har rätt till tillgång, rättelse, radering, begränsning av behandling, dataportabilitet samt invändning. Lämnade samtycken kan när som helst återkallas. Kontakta ",
      rightsTail: ".",
      complaintH: "Rätt att klaga",
      complaintTxt: "Du har rätt att lämna in klagomål till behörig tillsynsmyndighet — i Österrike den österrikiska dataskyddsmyndigheten (dsb.gv.at).",
      upd: "Senast uppdaterad: juni 2026",
    },
  },

  da: {
    country: "Østrig",
    imp: {
      title: "Juridisk meddelelse (Impressum)",
      sub: "Oplysninger i henhold til §§ 5 ECG, 14 UGB og 25 MedienG (Østrig).",
      owner: "Ejer & tjenesteudbyder",
      contact: "Kontakt", email: "E-mail", phone: "Telefon",
      rep: "Tegningsberettigede", repTxt: "[…] (forretningsførende selskabsdeltagere)",
      reg: "Register- & skatteoplysninger", uid: "Momsregistreringsnummer (UID)", fbn: "Handelsregisternummer", court: "Registerdomstol",
      biz: "Virksomhedens formål", bizTxt: "Professionel fjernelse af Google-virksomhedsprofiler samt online-omdømmetjenester.",
      chamber: "Kammer & erhverv", chamberTxt: "Medlem af det østrigske handelskammer (WKO). Gældende regler: den østrigske erhvervslov (Gewerbeordnung, GewO), tilgængelig på",
      shares: "Ejerforhold", authority: "Tilsyns- og erhvervsmyndighed", profession: "Erhvervsbetegnelse",
      notes: [
        ["Ansvar for indholdet på dette websted", "Vi udvikler løbende indholdet på dette websted og bestræber os på at levere korrekte og aktuelle oplysninger. Vi kan dog ikke påtage os ansvar for, at alt indhold er korrekt, navnlig indhold leveret af tredjeparter. Som tjenesteudbyder er vi ikke forpligtet til at overvåge fremmede oplysninger, der er overført eller lagret, eller at undersøge forhold, der tyder på ulovlig aktivitet. Hvis du bemærker ulovligt indhold, beder vi dig kontakte os omgående, så vi kan fjerne det."],
        ["Ansvar for links på dette websted", "Vores websted indeholder links til eksterne websteder, hvis indhold vi ikke har indflydelse på. Vi kan derfor ikke påtage os ansvar for dette tredjepartsindhold. For indholdet på de linkede sider er den pågældende udbyder altid ansvarlig. Bliver vi bekendt med retsstridigheder, fjerner vi straks de pågældende links."],
        ["Ophavsret", "Alt indhold på dette websted (billeder, fotos, tekster, videoer) er beskyttet af ophavsret. Kontakt os, før du distribuerer, mangfoldiggør eller udnytter indholdet på dette websted. Om nødvendigt forfølger vi uautoriseret brug af vores indhold retsligt."],
        ["Billedkilder", "Billederne, fotoene og grafikken på dette websted er beskyttet af ophavsret."],
      ],
      eu: "EU-tvistbilæggelse",
      euTxt1: "Europa-Kommissionen stiller en platform til onlinetvistbilæggelse (OTB) til rådighed: ",
      euTxt2: "Vi er hverken forpligtede eller villige til at deltage i tvistbilæggelsesprocedurer ved et forbrugerklagenævn.",
      upd: "Senest opdateret: juni 2026",
    },
    ds: {
      title: "Privatlivspolitik",
      sub: "Vi behandler dine personoplysninger fortroligt og i overensstemmelse med GDPR. Denne erklæring oplyser om behandlingens art, omfang og formål.",
      controller: "Dataansvarlig",
      secs: [
        ["Behandling ved henvendelser & bestillinger", "Når du anmoder om et tjek eller afgiver en bestilling, behandler vi de oplysninger, du giver (f.eks. navn, e-mail, telefon, virksomhed, den berørte Google-profil) for at håndtere din henvendelse og opfylde aftalen. Retsgrundlag: art. 6, stk. 1, litra b GDPR (kontrakt/foranstaltninger forud for kontrakt)."],
        ["Betalinger (Stripe)", "Betalinger behandles via Stripe (Stripe Payments Europe, Ltd., Irland). De oplysninger, der er nødvendige for betalingen, overføres til Stripe. Retsgrundlag: art. 6, stk. 1, litra b GDPR. Detaljer: stripe.com/privacy."],
        ["Livechat (Tidio)", "Til support bruger vi Tidios livechat. Når chatten åbnes, kan forbindelsesdata og eventuelle cookies blive behandlet. Retsgrundlag: dit samtykke (art. 6, stk. 1, litra a GDPR) eller vores legitime interesse i effektiv support (litra f)."],
        ["Sprog-/placeringsregistrering", "For at kunne tilbyde dig webstedet på dit sprog fastlægger vi – udelukkende med dit samtykke – ud fra din IP-adresse, hvilket land du tilgår fra, via en ekstern tjeneste (GeoJS, get.geojs.io; alternativt api.country.is). Din IP-adresse videregives herved til den pågældende udbyder (eventuelt til et tredjeland). Vi gemmer kun den fundne landekode, lokalt i din browser (ingen logning på serversiden). Retsgrundlag: dit samtykke (art. 6, stk. 1, litra a GDPR), som du til enhver tid kan tilbagekalde med virkning for fremtiden. Uden samtykke foretages ingen IP-forespørgsel; sprogregistreringen anvender da kun det sprog, der er indstillet lokalt i din browser."],
        ["Hosting & serverlogfiler", "Vores websted hostes hos en infrastrukturudbyder (Railway). Ved besøg kan teknisk nødvendige adgangsdata (f.eks. IP-adresse, tidspunkt, ønsket ressource) blive behandlet. Retsgrundlag: legitim interesse i sikker drift (art. 6, stk. 1, litra f GDPR)."],
        ["Opbevaringsperiode", "Vi opbevarer kun personoplysninger, så længe det er nødvendigt til de nævnte formål, eller så længe lovbestemte opbevaringsfrister (f.eks. skatte-/handelsret) kræver det."],
      ],
      rightsH: "Dine rettigheder",
      rightsTxt: "Du har ret til indsigt, berigtigelse, sletning, begrænsning af behandling, dataportabilitet samt indsigelse. Afgivne samtykker kan til enhver tid trækkes tilbage. Kontakt ",
      rightsTail: ".",
      complaintH: "Klageret",
      complaintTxt: "Du har ret til at klage til den kompetente tilsynsmyndighed — i Østrig den østrigske databeskyttelsesmyndighed (dsb.gv.at).",
      upd: "Senest opdateret: juni 2026",
    },
  },

  no: {
    country: "Østerrike",
    imp: {
      title: "Juridisk informasjon (Impressum)",
      sub: "Opplysninger i henhold til §§ 5 ECG, 14 UGB og 25 MedienG (Østerrike).",
      owner: "Eier & tjenesteleverandør",
      contact: "Kontakt", email: "E-post", phone: "Telefon",
      rep: "Representanter", repTxt: "[…] (forretningsførende deltakere)",
      reg: "Register- & skatteopplysninger", uid: "MVA-nummer (UID)", fbn: "Foretaksregisternummer", court: "Registerdomstol",
      biz: "Virksomhet", bizTxt: "Profesjonell fjerning av Google-bedriftsprofiler samt tjenester for omdømme på nett.",
      chamber: "Kammer & næring", chamberTxt: "Medlem av Østerrikes næringskammer (WKO). Gjeldende regelverk: den østerrikske næringsloven (Gewerbeordnung, GewO), tilgjengelig på",
      shares: "Eierforhold", authority: "Tilsyns- og næringsmyndighet", profession: "Yrkestittel",
      notes: [
        ["Ansvar for innholdet på dette nettstedet", "Vi videreutvikler stadig innholdet på dette nettstedet og bestreber oss på å gi korrekt og oppdatert informasjon. Vi kan likevel ikke påta oss ansvar for at alt innhold er korrekt, særlig innhold levert av tredjeparter. Som tjenesteleverandør er vi ikke forpliktet til å overvåke overført eller lagret informasjon fra tredjeparter, eller å undersøke forhold som tyder på ulovlig aktivitet. Oppdager du ulovlig innhold, ber vi deg kontakte oss omgående slik at vi kan fjerne det."],
        ["Ansvar for lenker på dette nettstedet", "Nettstedet vårt inneholder lenker til eksterne nettsteder som vi ikke har innflytelse på innholdet til. Vi kan derfor ikke påta oss ansvar for dette tredjepartsinnholdet. For innholdet på de lenkede sidene er det alltid den aktuelle leverandøren som er ansvarlig. Blir vi kjent med lovbrudd, fjerner vi de aktuelle lenkene umiddelbart."],
        ["Opphavsrett", "Alt innhold på dette nettstedet (bilder, foto, tekster, videoer) er beskyttet av opphavsrett. Kontakt oss før du distribuerer, mangfoldiggjør eller utnytter innholdet på dette nettstedet. Ved behov forfølger vi uautorisert bruk av innholdet vårt rettslig."],
        ["Bildekreditering", "Bildene, fotoene og grafikken på dette nettstedet er beskyttet av opphavsrett."],
      ],
      eu: "EU-tvisteløsning",
      euTxt1: "EU-kommisjonen tilbyr en plattform for nettbasert tvisteløsning (ODR): ",
      euTxt2: "Vi er verken forpliktet eller villige til å delta i tvisteløsningsprosedyrer for et forbrukerklageorgan.",
      upd: "Sist oppdatert: juni 2026",
    },
    ds: {
      title: "Personvernerklæring",
      sub: "Vi behandler personopplysningene dine konfidensielt og i samsvar med GDPR. Denne erklæringen informerer om behandlingens art, omfang og formål.",
      controller: "Behandlingsansvarlig",
      secs: [
        ["Behandling ved henvendelser & bestillinger", "Når du ber om en sjekk eller legger inn en bestilling, behandler vi opplysningene du oppgir (f.eks. navn, e-post, telefon, firma, den aktuelle Google-profilen) for å håndtere henvendelsen og oppfylle avtalen. Rettslig grunnlag: art. 6 nr. 1 bokstav b GDPR (avtale/tiltak før avtaleinngåelse)."],
        ["Betalinger (Stripe)", "Betalinger behandles via Stripe (Stripe Payments Europe, Ltd., Irland). Opplysningene som kreves for betalingen, overføres til Stripe. Rettslig grunnlag: art. 6 nr. 1 bokstav b GDPR. Detaljer: stripe.com/privacy."],
        ["Livechat (Tidio)", "For support bruker vi Tidios livechat. Når chatten åpnes, kan tilkoblingsdata og eventuelle informasjonskapsler behandles. Rettslig grunnlag: ditt samtykke (art. 6 nr. 1 bokstav a GDPR) eller vår berettigede interesse i effektiv support (bokstav f)."],
        ["Språk-/stedsgjenkjenning", "For å kunne tilby deg nettstedet på ditt språk fastslår vi – kun med ditt samtykke – hvilket land du besøker fra basert på IP-adressen din, via en ekstern tjeneste (GeoJS, get.geojs.io; alternativt api.country.is). IP-adressen din overføres da til den aktuelle leverandøren (eventuelt til et tredjeland). Vi lagrer kun den fastslåtte landekoden, lokalt i nettleseren din (ingen logging på serversiden). Rettslig grunnlag: ditt samtykke (personvernforordningen art. 6 nr. 1 bokstav a), som du når som helst kan trekke tilbake med virkning for fremtiden. Uten samtykke gjøres ingen IP-forespørsel; språkgjenkjenningen bruker da bare språket som er stilt inn lokalt i nettleseren din."],
        ["Hosting & serverlogger", "Nettstedet vårt hostes hos en infrastrukturleverandør (Railway). Ved besøk kan teknisk nødvendige tilgangsdata (f.eks. IP-adresse, tidspunkt, forespurt ressurs) behandles. Rettslig grunnlag: berettiget interesse i sikker drift (art. 6 nr. 1 bokstav f GDPR)."],
        ["Lagringstid", "Vi lagrer personopplysninger bare så lenge det er nødvendig for de nevnte formålene, eller så lenge lovpålagte oppbevaringsfrister (f.eks. skatte-/regnskapsrett) krever det."],
      ],
      rightsH: "Dine rettigheter",
      rightsTxt: "Du har rett til innsyn, retting, sletting, begrensning av behandling, dataportabilitet og innsigelse. Avgitte samtykker kan når som helst trekkes tilbake. Kontakt ",
      rightsTail: ".",
      complaintH: "Klagerett",
      complaintTxt: "Du har rett til å klage til kompetent tilsynsmyndighet — i Østerrike det østerrikske datatilsynet (dsb.gv.at).",
      upd: "Sist oppdatert: juni 2026",
    },
  },
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
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/magazin/")} onAbout={() => nav("/ueber-uns/")} onOrm={() => nav("/reputation-verdraengen/")} onDeindex={() => nav("/presse-auslisten/")} active="" />
      <main className="legal"><div className="container"><article className="legal-doc">{children}</article></div></main>
      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/magazin/")} onAbout={() => nav("/ueber-uns/")} />
      <WhatsAppFloat />
    </LangContext.Provider>
  );
}

/* ────────────────────────── Impressum ────────────────────────── */
function ImpressumBody() {
  const { lang } = useLang();
  const c = L[lang] || L.en;
  const i = c.imp;
  return (
    <React.Fragment>
      <h1>{i.title}</h1>
      <p className="legal-sub">{i.sub}</p>

      <h2>{i.owner}</h2>
      <p>{COMPANY.legal}<br />{COMPANY.street}<br />{COMPANY.city}, {c.country}</p>

      <h2>{i.contact}</h2>
      <p>{i.email}: <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a><br />{i.phone}: <a href={"tel:" + COMPANY.phoneHref}>{COMPANY.phone}</a></p>

      <h2>{i.rep}</h2>
      <p>{COMPANY.reps}</p>

      <h2>{i.shares}</h2>
      <p>{COMPANY.shares}</p>

      <h2>{i.reg}</h2>
      <p>{i.uid}: {COMPANY.uid}<br />{i.fbn}: {COMPANY.fbn}<br />{i.court}: {COMPANY.court}</p>

      <h2>{i.biz}</h2>
      <p>{i.bizTxt}</p>

      <h2>{i.profession}</h2>
      <p>{COMPANY.profession} ({c.country})</p>

      <h2>{i.chamber}</h2>
      <p>{i.chamberTxt} <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer">ris.bka.gv.at</a>.</p>

      <h2>{i.authority}</h2>
      <p>{COMPANY.authority}</p>

      <h2>{i.eu}</h2>
      <p>{i.euTxt1}<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>. {i.euTxt2}</p>

      {(i.notes || []).map(([h, txt], idx) => (
        <React.Fragment key={"n" + idx}>
          <h2>{h}</h2>
          <p>{txt}</p>
        </React.Fragment>
      ))}

      <p className="legal-upd">{i.upd}</p>
    </React.Fragment>
  );
}

/* ──────────────────────── Datenschutz ───────────────────────── */
function DatenschutzBody() {
  const { lang } = useLang();
  const c = L[lang] || L.en;
  const d = c.ds;
  return (
    <React.Fragment>
      <h1>{d.title}</h1>
      <p className="legal-sub">{d.sub}</p>

      <h2>{d.controller}</h2>
      <p>{COMPANY.legal}, {COMPANY.street}, {COMPANY.city}, {c.country} · <a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a></p>

      {d.secs.map(([h, txt], idx) => (
        <React.Fragment key={idx}>
          <h2>{h}</h2>
          <p>{txt}</p>
        </React.Fragment>
      ))}

      <h2>{d.rightsH}</h2>
      <p>{d.rightsTxt}<a href={"mailto:" + COMPANY.email}>{COMPANY.email}</a>{d.rightsTail}</p>

      <h2>{d.complaintH}</h2>
      <p>{d.complaintTxt}</p>

      <p className="legal-upd">{d.upd}</p>
    </React.Fragment>
  );
}

export function Impressum() { return <Shell><ImpressumBody /></Shell>; }
export function Datenschutz() { return <Shell><DatenschutzBody /></Shell>; }
