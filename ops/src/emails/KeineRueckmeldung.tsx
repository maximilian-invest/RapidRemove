/* Template: Storno Profil-Auftrag – keine Rückmeldung vom Kunden (Zugriffsrechte, Nachweise,
   Zahlungsart …). Für remove / reset / express. Sie-Form in allen Sprachen wie Storno/Kundenstorno.
   11 Sprachen. */
import * as React from "react";
import { EmailShell, P, NoteBox, Support, brand, type MailLang } from "./components";

export interface KeineRueckmeldungProps { lang?: MailLang; orderId?: string; }

interface Copy {
  title: string; preview: string; greeting: string;
  p1: string; p1Bold: string;
  freeH: string; free: string;
  resumeH: string; resume: string;
  close: string; subject: string;
}

const T: Record<MailLang, Copy> = {
  de: {
    title: "Ihr Auftrag wurde storniert!",
    preview: "Wir haben leider keine Rückmeldung von Ihnen erhalten – Ihr Auftrag wurde storniert.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "vielen Dank für Ihr Vertrauen und Ihre kürzliche Bestellung. Für die Bearbeitung benötigen wir noch Ihre Mithilfe (z. B. Zugriffsrechte auf das Profil, Nachweise oder eine Zahlungsart). Wir haben uns dazu bei Ihnen gemeldet, leider aber keine Rückmeldung erhalten. ",
    p1Bold: "Ihr Auftrag wurde daher storniert.",
    freeH: "Keine Kosten für Sie",
    free: "Für Sie entstehen keine Kosten.",
    resumeH: "Doch weitermachen?",
    resume: "Ist unsere Nachricht untergegangen? Antworten Sie einfach auf diese E-Mail – wir nehmen Ihren Auftrag gerne wieder auf.",
    close: "Vielen Dank für Ihr Verständnis und alles Gute weiterhin!",
    subject: "Ihr Auftrag wurde storniert (keine Rückmeldung)",
  },
  en: {
    title: "Your Order Has Been Canceled!",
    preview: "Unfortunately we haven't heard back from you – your order has been cancelled.",
    greeting: "Dear Sir or Madam,",
    p1: "thank you once again for placing your trust in us and for your recent order. To process it, we still need your input (e.g. access to the profile, proof documents or a payment method). We contacted you about this but unfortunately did not receive a reply. ",
    p1Bold: "Your order has therefore been cancelled.",
    freeH: "No costs for you",
    free: "There are no costs for you.",
    resumeH: "Still want to go ahead?",
    resume: "Did our message get lost? Simply reply to this email – we'll be happy to resume your order.",
    close: "Thank you for your understanding, and we wish you continued success in your business.",
    subject: "Your order has been canceled (no reply received)",
  },
  es: {
    title: "¡Su pedido ha sido cancelado!",
    preview: "Lamentablemente no hemos recibido respuesta suya: su pedido ha sido cancelado.",
    greeting: "Estimados señores:",
    p1: "muchas gracias por su confianza y por su reciente pedido. Para tramitarlo aún necesitamos su colaboración (p. ej., acceso al perfil, documentos acreditativos o un método de pago). Nos pusimos en contacto con usted al respecto, pero lamentablemente no recibimos respuesta. ",
    p1Bold: "Por ello, su pedido ha sido cancelado.",
    freeH: "Sin coste para usted",
    free: "No se le cobrará nada.",
    resumeH: "¿Desea continuar?",
    resume: "¿Se le pasó nuestro mensaje? Simplemente responda a este correo y retomaremos su pedido con mucho gusto.",
    close: "Muchas gracias por su comprensión y le deseamos mucho éxito en el futuro.",
    subject: "Su pedido ha sido cancelado (sin respuesta)",
  },
  fr: {
    title: "Votre commande a été annulée !",
    preview: "Nous n'avons malheureusement pas reçu de réponse de votre part : votre commande a été annulée.",
    greeting: "Madame, Monsieur,",
    p1: "merci beaucoup pour votre confiance et votre récente commande. Pour la traiter, nous avons encore besoin de votre collaboration (p. ex. droits d'accès à la fiche, justificatifs ou moyen de paiement). Nous vous avons contacté à ce sujet, mais n'avons malheureusement reçu aucune réponse. ",
    p1Bold: "Votre commande a donc été annulée.",
    freeH: "Aucun frais pour vous",
    free: "Aucun frais ne vous sera facturé.",
    resumeH: "Vous souhaitez poursuivre ?",
    resume: "Notre message vous a échappé ? Répondez simplement à cet e-mail – nous reprendrons volontiers votre commande.",
    close: "Merci de votre compréhension et nous vous souhaitons une bonne continuation !",
    subject: "Votre commande a été annulée (sans réponse)",
  },
  it: {
    title: "Il suo ordine è stato annullato!",
    preview: "Purtroppo non abbiamo ricevuto risposta da lei: il suo ordine è stato annullato.",
    greeting: "Gentili Signore e Signori,",
    p1: "la ringraziamo per la fiducia accordataci e per il suo recente ordine. Per elaborarlo abbiamo ancora bisogno della sua collaborazione (ad es. accesso al profilo, documenti giustificativi o un metodo di pagamento). L'abbiamo contattata a questo proposito, ma purtroppo non abbiamo ricevuto risposta. ",
    p1Bold: "Il suo ordine è stato quindi annullato.",
    freeH: "Nessun costo per lei",
    free: "Non le verrà addebitato nulla.",
    resumeH: "Desidera proseguire?",
    resume: "Il nostro messaggio le è sfuggito? Risponda semplicemente a questa e-mail: riprenderemo volentieri il suo ordine.",
    close: "La ringraziamo per la comprensione e le auguriamo ogni bene!",
    subject: "Il suo ordine è stato annullato (nessuna risposta)",
  },
  nl: {
    title: "Uw bestelling is geannuleerd!",
    preview: "Wij hebben helaas geen reactie van u ontvangen – uw bestelling is geannuleerd.",
    greeting: "Geachte heer/mevrouw,",
    p1: "hartelijk dank voor uw vertrouwen en uw recente bestelling. Voor de verwerking hebben wij nog uw medewerking nodig (bijv. toegang tot het profiel, bewijsstukken of een betaalmethode). Wij hebben hierover contact met u opgenomen, maar helaas geen reactie ontvangen. ",
    p1Bold: "Uw bestelling is daarom geannuleerd.",
    freeH: "Geen kosten voor u",
    free: "Er worden geen kosten in rekening gebracht.",
    resumeH: "Toch verder?",
    resume: "Is ons bericht ondergesneeuwd? Beantwoord dan gewoon deze e-mail – wij nemen uw bestelling graag weer op.",
    close: "Hartelijk dank voor uw begrip en het allerbeste gewenst!",
    subject: "Uw bestelling is geannuleerd (geen reactie)",
  },
  pt: {
    title: "O seu pedido foi cancelado!",
    preview: "Infelizmente não recebemos resposta da sua parte – o seu pedido foi cancelado.",
    greeting: "Exmos. Senhores,",
    p1: "muito obrigado pela sua confiança e pelo seu recente pedido. Para o processar, ainda precisamos da sua colaboração (p. ex., acesso ao perfil, documentos comprovativos ou um método de pagamento). Contactámo-lo sobre isso, mas infelizmente não recebemos resposta. ",
    p1Bold: "Por isso, o seu pedido foi cancelado.",
    freeH: "Sem custos para si",
    free: "Não lhe será cobrado nada.",
    resumeH: "Pretende continuar?",
    resume: "A nossa mensagem passou-lhe despercebida? Basta responder a este e-mail – teremos todo o gosto em retomar o seu pedido.",
    close: "Muito obrigado pela sua compreensão e desejamos-lhe as maiores felicidades!",
    subject: "O seu pedido foi cancelado (sem resposta)",
  },
  ja: {
    title: "ご注文はキャンセルされました。",
    preview: "お客様からのご返信をいただけなかったため、ご注文をキャンセルいたしました。",
    greeting: "ご担当者様",
    p1: "このたびはご信頼いただき、またご注文を賜り、誠にありがとうございます。手続きを進めるにあたり、お客様のご協力（プロフィールへのアクセス権、証明書類、お支払い方法など）が必要です。この件について当社よりご連絡いたしましたが、ご返信をいただけませんでした。",
    p1Bold: "そのため、ご注文をキャンセルさせていただきました。",
    freeH: "費用は発生しません",
    free: "お客様に費用は一切発生しません。",
    resumeH: "引き続きご希望の場合",
    resume: "当社のメールが見落とされていた場合は、このメールにご返信いただくだけで、ご注文を再開いたします。",
    close: "ご理解いただき誠にありがとうございます。今後のますますのご発展をお祈り申し上げます。",
    subject: "ご注文はキャンセルされました（ご返信なし）",
  },
  sv: {
    title: "Din beställning har annullerats!",
    preview: "Vi har tyvärr inte fått något svar från dig – din beställning har annullerats.",
    greeting: "Hej,",
    p1: "tack för ditt förtroende och för din nyligen gjorda beställning. För att kunna genomföra den behöver vi fortfarande din hjälp (t.ex. åtkomst till profilen, styrkande dokument eller en betalningsmetod). Vi kontaktade dig om detta men fick tyvärr inget svar. ",
    p1Bold: "Din beställning har därför annullerats.",
    freeH: "Inga kostnader för dig",
    free: "Du debiteras ingenting.",
    resumeH: "Vill du ändå fortsätta?",
    resume: "Missade du vårt meddelande? Svara bara på detta e-postmeddelande – vi återupptar gärna din beställning.",
    close: "Tack för din förståelse och lycka till framöver!",
    subject: "Din beställning har annullerats (inget svar)",
  },
  da: {
    title: "Din ordre er blevet annulleret!",
    preview: "Vi har desværre ikke hørt fra dig – din ordre er blevet annulleret.",
    greeting: "Kære kunde,",
    p1: "mange tak for din tillid og din nylige bestilling. For at kunne behandle den har vi stadig brug for din hjælp (f.eks. adgang til profilen, dokumentation eller en betalingsmetode). Vi har kontaktet dig om dette, men har desværre ikke modtaget noget svar. ",
    p1Bold: "Din ordre er derfor blevet annulleret.",
    freeH: "Ingen omkostninger for dig",
    free: "Du bliver ikke opkrævet noget.",
    resumeH: "Vil du alligevel fortsætte?",
    resume: "Er vores besked gået tabt? Så svar blot på denne e-mail – vi genoptager gerne din ordre.",
    close: "Mange tak for din forståelse, og fortsat alt det bedste!",
    subject: "Din ordre er blevet annulleret (intet svar)",
  },
  no: {
    title: "Bestillingen din er kansellert!",
    preview: "Vi har dessverre ikke hørt fra deg – bestillingen din er kansellert.",
    greeting: "Hei,",
    p1: "tusen takk for tilliten og for din nylige bestilling. For å kunne behandle den trenger vi fortsatt hjelp fra deg (f.eks. tilgang til profilen, dokumentasjon eller en betalingsmetode). Vi tok kontakt med deg om dette, men fikk dessverre ikke noe svar. ",
    p1Bold: "Bestillingen din er derfor kansellert.",
    freeH: "Ingen kostnader for deg",
    free: "Du blir ikke belastet noe.",
    resumeH: "Vil du likevel fortsette?",
    resume: "Har meldingen vår gått deg hus forbi? Bare svar på denne e-posten – vi gjenopptar gjerne bestillingen din.",
    close: "Tusen takk for forståelsen, og fortsatt alt godt!",
    subject: "Bestillingen din er kansellert (ingen svar)",
  },
};

export function subject(p: KeineRueckmeldungProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function KeineRueckmeldung({ lang = "de", orderId = "" }: KeineRueckmeldungProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}<strong>{t.p1Bold}</strong>{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.freeH}</span><br />
        {t.free}
      </NoteBox>
      <P><strong>{t.resumeH}</strong> {t.resume}</P>
      <P>{t.close}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
