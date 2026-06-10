/* Template: Nachweise benötigt – Bitte um Auskunft / Request for information, documents (DE/EN). */
import * as React from "react";
import { EmailShell, P, Bullets, Support } from "./components";

export interface NachweiseBenoetigtProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Bitte um Auskunft!",
    preview: "Zum Zurücksetzen Ihres Profils benötigen wir einen Nachweis.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Um Ihr Google-Unternehmensprofil zurückzusetzen, benötigen wir ",
    p1Bold: "zwingend eines oder mehrere der folgenden Dokumente als Nachweis:",
    items: [
      "Handelsregisterauszug / Firmenbuchauszug",
      "Gewerbeberechtigung",
      "Steuerdokument",
      "USt.-ID-Nr.-Dokument",
      "Rechnung von Strom- oder Wasserversorger (nicht älter als 3 Monate)",
    ],
    p2: "Bitte antworten Sie einfach auf diese E-Mail und senden Sie uns die Dokumente im Anhang, danke!",
    subject: "Bitte um Auskunft – Nachweise benötigt",
  },
  en: {
    title: "Request for Information!",
    preview: "To reset your profile we require a proof document.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your trust and your recent order. In order to reset your Google Business Profile, we ",
    p1Bold: "urgently require one or more of the following documents as proof:",
    items: [
      "Excerpt from the commercial register / company register",
      "Trade license",
      "Tax document",
      "VAT ID document",
      "Utility bill (electricity or water, no older than 3 months)",
    ],
    p2: "Please simply reply to this email and attach the relevant documents. Thank you!",
    subject: "Request for information – documents needed",
  },
  es: {
    title: "¡Solicitud de información!",
    preview: "Para restablecer su perfil, necesitamos un justificante.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su confianza y por su reciente pedido. Para restablecer su perfil de empresa de Google, necesitamos ",
    p1Bold: "obligatoriamente uno o varios de los siguientes documentos como justificante:",
    items: [
      "Extracto del registro mercantil",
      "Licencia de actividad",
      "Documento fiscal",
      "Documento del número de identificación fiscal (NIF-IVA)",
      "Factura de suministro de electricidad o agua (no anterior a 3 meses)",
    ],
    p2: "Simplemente responda a este correo electrónico y envíenos los documentos adjuntos. ¡Gracias!",
    subject: "Solicitud de información – justificantes necesarios",
  },
  fr: {
    title: "Demande d'informations !",
    preview: "Pour réinitialiser votre fiche, nous avons besoin d'un justificatif.",
    greeting: "Madame, Monsieur,",
    p1a: "nous vous remercions de votre confiance et de votre récente commande. Afin de réinitialiser votre fiche d'établissement Google, nous avons ",
    p1Bold: "impérativement besoin d'un ou de plusieurs des documents suivants à titre de justificatif :",
    items: [
      "Extrait du registre du commerce",
      "Autorisation d'exercer une activité commerciale",
      "Document fiscal",
      "Document attestant le numéro de TVA intracommunautaire",
      "Facture d'électricité ou d'eau (datant de moins de 3 mois)",
    ],
    p2: "Il vous suffit de répondre à cet e-mail en joignant les documents. Merci !",
    subject: "Demande d'informations – justificatifs requis",
  },
  it: {
    title: "Richiesta di informazioni!",
    preview: "Per ripristinare il suo profilo abbiamo bisogno di un documento giustificativo.",
    greeting: "Gentili Signore e Signori,",
    p1a: "la ringraziamo per la sua fiducia e per il suo recente ordine. Per ripristinare il suo profilo dell'attività su Google, abbiamo ",
    p1Bold: "tassativamente bisogno di uno o più dei seguenti documenti come prova:",
    items: [
      "Visura camerale",
      "Licenza commerciale",
      "Documento fiscale",
      "Documento attestante la partita IVA",
      "Bolletta dell'elettricità o dell'acqua (non più vecchia di 3 mesi)",
    ],
    p2: "La preghiamo semplicemente di rispondere a questa e-mail allegando i documenti, grazie!",
    subject: "Richiesta di informazioni – documenti necessari",
  },
  nl: {
    title: "Verzoek om informatie!",
    preview: "Om uw profiel te herstellen hebben we een bewijsstuk nodig.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Om uw Google-bedrijfsprofiel te herstellen, hebben we ",
    p1Bold: "noodzakelijkerwijs een of meer van de volgende documenten als bewijs nodig:",
    items: [
      "Uittreksel uit het handelsregister",
      "Vergunning voor bedrijfsuitoefening",
      "Belastingdocument",
      "Document met btw-identificatienummer",
      "Factuur van elektriciteits- of waterleverancier (niet ouder dan 3 maanden)",
    ],
    p2: "Beantwoord deze e-mail gewoon en stuur ons de documenten als bijlage, alvast bedankt!",
    subject: "Verzoek om informatie – bewijsstukken nodig",
  },
  pt: {
    title: "Pedido de informações!",
    preview: "Para repor o seu perfil, necessitamos de um comprovativo.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pela sua confiança e pelo seu recente pedido. Para repor o seu perfil de empresa do Google, necessitamos ",
    p1Bold: "obrigatoriamente de um ou mais dos seguintes documentos como comprovativo:",
    items: [
      "Certidão do registo comercial",
      "Licença de atividade comercial",
      "Documento fiscal",
      "Documento do número de identificação fiscal (NIF/IVA)",
      "Fatura de eletricidade ou água (com menos de 3 meses)",
    ],
    p2: "Basta responder a este e-mail e enviar-nos os documentos em anexo, obrigado!",
    subject: "Pedido de informações – comprovativos necessários",
  },
  ja: {
    title: "情報のお願い",
    preview: "お客様のプロフィールを復元するため、証明書類が必要です。",
    greeting: "ご担当者様",
    p1a: "このたびはご信頼を賜り、またご注文をいただき、誠にありがとうございます。お客様のGoogleビジネスプロフィールを復元するため、",
    p1Bold: "証明として以下の書類のいずれか、または複数を必ずご提出いただく必要がございます:",
    items: [
      "商業登記簿謄本",
      "営業許可証",
      "税務書類",
      "登録番号（適格請求書発行事業者）が確認できる書類",
      "電気または水道の請求書（発行から3か月以内のもの）",
    ],
    p2: "本メールにご返信いただき、書類を添付のうえお送りください。よろしくお願いいたします。",
    subject: "情報のお願い – 証明書類が必要です",
  },
  sv: {
    title: "Begäran om uppgifter!",
    preview: "För att återställa din profil behöver vi ett underlag.",
    greeting: "Hej,",
    p1a: "tack för ditt förtroende och för din nyligen gjorda beställning. För att återställa din Google-företagsprofil behöver vi ",
    p1Bold: "ovillkorligen ett eller flera av följande dokument som underlag:",
    items: [
      "Registreringsbevis från Bolagsverket",
      "Näringstillstånd",
      "Skattedokument",
      "Dokument med momsregistreringsnummer (VAT-nummer)",
      "Faktura från el- eller vattenleverantör (högst 3 månader gammal)",
    ],
    p2: "Svara bara på det här e-postmeddelandet och bifoga dokumenten, tack!",
    subject: "Begäran om uppgifter – underlag krävs",
  },
  da: {
    title: "Anmodning om oplysninger!",
    preview: "For at nulstille din profil har vi brug for dokumentation.",
    greeting: "Kære kunde,",
    p1a: "tak for din tillid og for din nylige bestilling. For at nulstille din Google-virksomhedsprofil har vi ",
    p1Bold: "ubetinget brug for et eller flere af følgende dokumenter som dokumentation:",
    items: [
      "Udskrift fra virksomhedsregistret (CVR)",
      "Næringsbrev",
      "Skattedokument",
      "Dokument med momsregistreringsnummer",
      "Regning fra el- eller vandforsyning (højst 3 måneder gammel)",
    ],
    p2: "Du skal blot besvare denne e-mail og sende os dokumenterne som vedhæftet fil, tak!",
    subject: "Anmodning om oplysninger – dokumentation kræves",
  },
  no: {
    title: "Anmodning om opplysninger!",
    preview: "For å tilbakestille profilen din trenger vi dokumentasjon.",
    greeting: "Hei,",
    p1a: "takk for tilliten og for din nylige bestilling. For å tilbakestille Google-bedriftsprofilen din trenger vi ",
    p1Bold: "ubetinget ett eller flere av følgende dokumenter som dokumentasjon:",
    items: [
      "Firmaattest fra Brønnøysundregistrene",
      "Næringstillatelse",
      "Skattedokument",
      "Dokument med organisasjonsnummer (MVA)",
      "Faktura fra strøm- eller vannleverandør (ikke eldre enn 3 måneder)",
    ],
    p2: "Du trenger bare å svare på denne e-posten og sende oss dokumentene som vedlegg, takk!",
    subject: "Anmodning om opplysninger – dokumentasjon kreves",
  },
};

export function subject(p: NachweiseBenoetigtProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function NachweiseBenoetigt({ lang = "de" }: NachweiseBenoetigtProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <Bullets items={t.items} />
      <P>{t.p2}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
