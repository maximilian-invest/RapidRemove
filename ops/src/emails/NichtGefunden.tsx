/* Template: Nicht gefunden – kein Link zum Profil angehängt / Request for information (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface NichtGefundenProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Bitte um Auskunft!",
    preview: "Bei der Bestellung wurde kein Link zum Profil angehängt.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Offenbar wurde bei der Bestellung kein Link zum Profil angehängt. ",
    p1Bold: "Bitte antworten Sie auf diese E-Mail einfach mit dem Namen des Unternehmens oder einem Link",
    p1b: " zum Eintrag, den Sie entfernen / zurücksetzen möchten, vielen Dank!",
    subject: "Bitte um Auskunft",
  },
  en: {
    title: "Request for Information!",
    preview: "It appears that no link to the profile was included in the order.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your trust and your recent order. It appears that no link to the profile was included in the order. ",
    p1Bold: "Please simply reply to this email with the company name or a link",
    p1b: " to the entry you would like to have removed / reset. Thank you very much!",
    subject: "Request for information",
  },
  es: {
    title: "¡Solicitud de información!",
    preview: "En el pedido no se adjuntó ningún enlace al perfil.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su confianza y por su reciente pedido. Al parecer, en el pedido no se adjuntó ningún enlace al perfil. ",
    p1Bold: "Le rogamos que responda simplemente a este correo con el nombre de la empresa o un enlace",
    p1b: " a la ficha que desea eliminar / restablecer. ¡Muchas gracias!",
    subject: "Solicitud de información",
  },
  fr: {
    title: "Demande d'information !",
    preview: "Aucun lien vers la fiche n'a été joint à la commande.",
    greeting: "Madame, Monsieur,",
    p1a: "merci beaucoup pour votre confiance et votre récente commande. Il semble qu'aucun lien vers la fiche n'ait été joint à la commande. ",
    p1Bold: "Merci de répondre simplement à cet e-mail en indiquant le nom de l'entreprise ou un lien",
    p1b: " vers la fiche que vous souhaitez supprimer / réinitialiser. Merci beaucoup !",
    subject: "Demande d'information",
  },
  it: {
    title: "Richiesta di informazioni!",
    preview: "All'ordine non è stato allegato alcun link al profilo.",
    greeting: "Gentili Signore e Signori,",
    p1a: "grazie per la fiducia accordataci e per il suo recente ordine. A quanto pare, all'ordine non è stato allegato alcun link al profilo. ",
    p1Bold: "La preghiamo di rispondere semplicemente a questa e-mail indicando il nome dell'azienda o un link",
    p1b: " alla scheda che desidera rimuovere / ripristinare. Grazie mille!",
    subject: "Richiesta di informazioni",
  },
  nl: {
    title: "Verzoek om informatie!",
    preview: "Bij de bestelling is geen link naar het profiel toegevoegd.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Blijkbaar is er bij de bestelling geen link naar het profiel toegevoegd. ",
    p1Bold: "Beantwoord deze e-mail eenvoudig met de naam van het bedrijf of een link",
    p1b: " naar de vermelding die u wilt laten verwijderen / herstellen. Hartelijk dank!",
    subject: "Verzoek om informatie",
  },
  pt: {
    title: "Pedido de informação!",
    preview: "Não foi anexada qualquer ligação para o perfil na encomenda.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pela sua confiança e pela sua recente encomenda. Ao que parece, não foi anexada qualquer ligação para o perfil na encomenda. ",
    p1Bold: "Pedimos que responda simplesmente a este e-mail com o nome da empresa ou uma ligação",
    p1b: " para a ficha que pretende remover / repor. Muito obrigado!",
    subject: "Pedido de informação",
  },
  ja: {
    title: "情報のお願い！",
    preview: "ご注文時にプロフィールへのリンクが添付されていませんでした。",
    greeting: "ご担当者様",
    p1a: "このたびはご信頼いただき、またご注文いただき誠にありがとうございます。ご注文時にプロフィールへのリンクが添付されていなかったようです。",
    p1Bold: "お手数ですが、このメールに会社名またはリンクをご返信ください",
    p1b: "。削除／リセットをご希望の掲載先をお知らせいただけますと幸いです。どうぞよろしくお願いいたします。",
    subject: "情報のお願い",
  },
  sv: {
    title: "Begäran om information!",
    preview: "Ingen länk till profilen bifogades i beställningen.",
    greeting: "Hej,",
    p1a: "tack så mycket för ditt förtroende och din nyligen gjorda beställning. Det verkar som att ingen länk till profilen bifogades i beställningen. ",
    p1Bold: "Svara gärna på det här mejlet med företagets namn eller en länk",
    p1b: " till den post du vill få borttagen / återställd. Tack så mycket!",
    subject: "Begäran om information",
  },
  da: {
    title: "Anmodning om oplysninger!",
    preview: "Der blev ikke vedhæftet noget link til profilen i bestillingen.",
    greeting: "Kære kunde,",
    p1a: "mange tak for din tillid og din nylige bestilling. Der blev tilsyneladende ikke vedhæftet noget link til profilen i bestillingen. ",
    p1Bold: "Svar venligst blot på denne e-mail med virksomhedens navn eller et link",
    p1b: " til den profil, du ønsker fjernet / nulstillet. Mange tak!",
    subject: "Anmodning om oplysninger",
  },
  no: {
    title: "Forespørsel om informasjon!",
    preview: "Det ble ikke lagt ved noen lenke til profilen i bestillingen.",
    greeting: "Hei,",
    p1a: "tusen takk for tilliten og for din nylige bestilling. Det ser ut til at det ikke ble lagt ved noen lenke til profilen i bestillingen. ",
    p1Bold: "Vennligst svar på denne e-posten med navnet på bedriften eller en lenke",
    p1b: " til oppføringen du ønsker fjernet / tilbakestilt. Tusen takk!",
    subject: "Forespørsel om informasjon",
  },
};

export function subject(p: NichtGefundenProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function NichtGefunden({ lang = "de" }: NichtGefundenProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong>{t.p1b}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
