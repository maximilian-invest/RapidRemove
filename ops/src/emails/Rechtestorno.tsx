/* Template: Rechtestorno – mangels Zugriffsrechte storniert / Missing access rights (DE/EN). */
import * as React from "react";
import { EmailShell, P, A, Support } from "./components";

export interface RechtestornoProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; resumeUrl?: string; }

const T = {
  de: {
    title: "Ihr Auftrag wurde mangels Zugriffsrechte storniert!",
    preview: "Uns wurden keine Bearbeitungsrechte erteilt – Ihr Auftrag wurde storniert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Entfernung benötigen wir zwingend Bearbeitungsrechte auf das Google-Unternehmensprofil, welche uns bis dato nicht erteilt wurden. Ihr Auftrag wurde daher storniert. ",
    link: "Falls Sie den Auftrag wiederaufnehmen wollen, so kontaktieren Sie uns bitte.",
    p2: "Vielen Dank für Ihr Verständnis.",
    subject: "Ihr Auftrag wurde storniert (fehlende Zugriffsrechte)",
  },
  en: {
    title: "Missing Access Rights: Your Order Has Been Canceled!",
    preview: "We were not granted management access – your order has been cancelled.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. To complete the removal process, we require management access to the Google Business Profile, which has not yet been granted. Therefore, your order has been cancelled. ",
    link: "Should you wish to resume the process, please contact us.",
    p2: "Thank you for your understanding.",
    subject: "Your order has been canceled (missing access rights)",
  },
  es: {
    title: "¡Su pedido se ha cancelado por falta de permisos de acceso!",
    preview: "No se nos concedieron permisos de edición: su pedido se ha cancelado.",
    greeting: "Estimados señores:",
    p1: "muchas gracias por su confianza y por su reciente pedido. Para llevar a cabo la eliminación necesitamos imprescindiblemente permisos de edición sobre el perfil de empresa de Google, que hasta la fecha no se nos han concedido. Por ello, su pedido se ha cancelado. ",
    link: "Si desea retomar el pedido, póngase en contacto con nosotros.",
    p2: "Muchas gracias por su comprensión.",
    subject: "Su pedido se ha cancelado (faltan permisos de acceso)",
  },
  fr: {
    title: "Votre commande a été annulée faute de droits d'accès !",
    preview: "Aucun droit de gestion ne nous a été accordé : votre commande a été annulée.",
    greeting: "Madame, Monsieur,",
    p1: "merci beaucoup de votre confiance et de votre récente commande. Pour procéder à la suppression, nous avons impérativement besoin des droits de gestion sur la fiche d'établissement Google, qui ne nous ont pas encore été accordés. Votre commande a donc été annulée. ",
    link: "Si vous souhaitez reprendre la commande, veuillez nous contacter.",
    p2: "Merci de votre compréhension.",
    subject: "Votre commande a été annulée (droits d'accès manquants)",
  },
  it: {
    title: "Il vostro ordine è stato annullato per mancanza di diritti di accesso!",
    preview: "Non ci sono stati concessi diritti di gestione: il vostro ordine è stato annullato.",
    greeting: "Gentili Signore e Signori,",
    p1: "grazie di cuore per la vostra fiducia e per il vostro recente ordine. Per procedere con la rimozione abbiamo assolutamente bisogno dei diritti di gestione sul profilo dell'attività su Google, che finora non ci sono stati concessi. Il vostro ordine è stato pertanto annullato. ",
    link: "Se desiderate riprendere l'ordine, vi preghiamo di contattarci.",
    p2: "Grazie per la vostra comprensione.",
    subject: "Il vostro ordine è stato annullato (diritti di accesso mancanti)",
  },
  nl: {
    title: "Uw bestelling is geannuleerd wegens ontbrekende toegangsrechten!",
    preview: "Ons zijn geen bewerkrechten verleend: uw bestelling is geannuleerd.",
    greeting: "Geachte heer/mevrouw,",
    p1: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Voor de verwijdering hebben wij absoluut bewerkrechten op het Google-bedrijfsprofiel nodig, die ons tot op heden niet zijn verleend. Uw bestelling is daarom geannuleerd. ",
    link: "Mocht u de bestelling willen hervatten, neem dan contact met ons op.",
    p2: "Hartelijk dank voor uw begrip.",
    subject: "Uw bestelling is geannuleerd (ontbrekende toegangsrechten)",
  },
  pt: {
    title: "A sua encomenda foi cancelada por falta de permissões de acesso!",
    preview: "Não nos foram concedidas permissões de edição: a sua encomenda foi cancelada.",
    greeting: "Exmos. Senhores,",
    p1: "muito obrigado pela sua confiança e pela sua recente encomenda. Para procedermos à eliminação, necessitamos imperativamente de permissões de edição sobre o perfil de empresa do Google, que até à data não nos foram concedidas. A sua encomenda foi, por isso, cancelada. ",
    link: "Se pretender retomar a encomenda, entre em contacto connosco.",
    p2: "Muito obrigado pela sua compreensão.",
    subject: "A sua encomenda foi cancelada (faltam permissões de acesso)",
  },
  ja: {
    title: "アクセス権限がないため、ご注文はキャンセルされました。",
    preview: "編集権限が付与されなかったため、ご注文はキャンセルされました。",
    greeting: "ご担当者様",
    p1: "このたびはご信頼とご注文を賜り、誠にありがとうございます。削除を進めるにあたり、Googleビジネスプロフィールへの編集権限が必ず必要となりますが、現時点ではまだ付与されておりません。そのため、ご注文はキャンセルとなりました。",
    link: "ご注文の再開をご希望の場合は、当社までご連絡ください。",
    p2: "ご理解のほど、よろしくお願いいたします。",
    subject: "ご注文はキャンセルされました（アクセス権限の不足）",
  },
  sv: {
    title: "Din beställning har annullerats på grund av saknad åtkomstbehörighet!",
    preview: "Vi har inte beviljats någon redigeringsbehörighet – din beställning har annullerats.",
    greeting: "Hej,",
    p1: "tack så mycket för ditt förtroende och din nyligen gjorda beställning. För att kunna genomföra borttagningen behöver vi ovillkorligen redigeringsbehörighet till Google-företagsprofilen, vilken hittills inte har beviljats oss. Din beställning har därför annullerats. ",
    link: "Om du vill återuppta beställningen, vänligen kontakta oss.",
    p2: "Tack för din förståelse.",
    subject: "Din beställning har annullerats (saknad åtkomstbehörighet)",
  },
  da: {
    title: "Din bestilling er blevet annulleret på grund af manglende adgangsrettigheder!",
    preview: "Vi er ikke blevet tildelt redigeringsrettigheder – din bestilling er blevet annulleret.",
    greeting: "Kære kunde,",
    p1: "mange tak for din tillid og din nylige bestilling. For at gennemføre fjernelsen har vi ubetinget brug for redigeringsrettigheder til Google-virksomhedsprofilen, som hidtil ikke er blevet tildelt os. Din bestilling er derfor blevet annulleret. ",
    link: "Hvis du ønsker at genoptage bestillingen, bedes du kontakte os.",
    p2: "Mange tak for din forståelse.",
    subject: "Din bestilling er blevet annulleret (manglende adgangsrettigheder)",
  },
  no: {
    title: "Bestillingen din er kansellert på grunn av manglende tilgangsrettigheter!",
    preview: "Vi har ikke fått tildelt redigeringsrettigheter – bestillingen din er kansellert.",
    greeting: "Hei,",
    p1: "tusen takk for tilliten din og din nylige bestilling. For å gjennomføre fjerningen trenger vi ubetinget redigeringsrettigheter til Google-bedriftsprofilen, som hittil ikke har blitt tildelt oss. Bestillingen din er derfor kansellert. ",
    link: "Hvis du ønsker å gjenoppta bestillingen, vennligst kontakt oss.",
    p2: "Tusen takk for forståelsen.",
    subject: "Bestillingen din er kansellert (manglende tilgangsrettigheter)",
  },
};

export function subject(p: RechtestornoProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Rechtestorno({ lang = "de", resumeUrl = "mailto:helpdesk@rapid-remove.com" }: RechtestornoProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}<A href={resumeUrl}>{t.link}</A></P>
      <P>{t.p2}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
