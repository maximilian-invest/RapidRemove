/* Template: PayPal-Zahlung bestätigt / PayPal payment confirmed.
   Wird manuell aus dem Admin gesendet, nachdem die PayPal-Zahlung erfasst wurde
   („Als bezahlt markieren"). Bestätigt den Zahlungseingang und – falls der Kunde
   einen Schutz gebucht hat (hasProtection) – dass der Schutz jetzt aktiv ist.
   NUR außerhalb DACH (im Admin für lang="de" ausgeblendet + serverseitig abgelehnt),
   daher KEINE deutsche Fassung; immer in der Landessprache, im lockeren „du"-Ton. */
import * as React from "react";
import { EmailShell, P, NoteBox, brand, type MailLang } from "./components";

export interface PaypalZahlungBestaetigtProps {
  lang?: MailLang;
  /** Vorname/Name des Kunden für die persönliche Anrede. */
  name?: string;
  /** Kunde hat einen Schutz gebucht (monthly/monitor/lifetime) → „Schutz ist jetzt aktiv". */
  hasProtection?: boolean;
  /** Im Admin bearbeitete Text-Overrides (überschreiben die Default-Texte pro Feld). */
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: string; p2: string; protectionActive: string; close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: "Payment received – thank you!",
    preview: "We’ve received your PayPal payment – all done.",
    title: "Payment received ✓",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: "we’ve successfully received your payment via PayPal – thank you very much!",
    p2: "Everything is now fully settled, and the deletion of your business profile is complete.",
    protectionActive: "Good to know: your booked protection is now active. We keep an eye on your profile and remove any re-listing right away, so it stays gone for good.",
    close: "If you have any questions, just reply to this email. Thanks again for your trust!",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Pago recibido – ¡gracias!",
    preview: "Hemos recibido tu pago por PayPal – todo listo.",
    title: "Pago recibido ✓",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: "hemos recibido correctamente tu pago por PayPal – ¡muchas gracias!",
    p2: "Todo está saldado y la eliminación de tu perfil de empresa está completa.",
    protectionActive: "Para que lo sepas: tu protección contratada ya está activa. Vigilamos tu perfil y eliminamos de inmediato cualquier reaparición, para que se quede fuera para siempre.",
    close: "Si tienes cualquier pregunta, solo responde a este correo. ¡Gracias de nuevo por tu confianza!",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Paiement reçu – merci !",
    preview: "Nous avons bien reçu ton paiement PayPal – tout est réglé.",
    title: "Paiement reçu ✓",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: "nous avons bien reçu ton paiement via PayPal – un grand merci !",
    p2: "Tout est désormais réglé et la suppression de ta fiche d’établissement est terminée.",
    protectionActive: "Bon à savoir : ta protection souscrite est désormais active. Nous surveillons ta fiche et supprimons immédiatement toute réapparition, pour qu’elle reste supprimée définitivement.",
    close: "Si tu as des questions, réponds simplement à cet e-mail. Merci encore pour ta confiance !",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Pagamento ricevuto – grazie!",
    preview: "Abbiamo ricevuto il tuo pagamento PayPal – tutto a posto.",
    title: "Pagamento ricevuto ✓",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "abbiamo ricevuto correttamente il tuo pagamento tramite PayPal – grazie mille!",
    p2: "Ora è tutto saldato e l’eliminazione del tuo profilo aziendale è completa.",
    protectionActive: "Da sapere: la protezione che hai scelto è ora attiva. Teniamo d’occhio il tuo profilo e rimuoviamo subito ogni ricomparsa, così resta eliminato per sempre.",
    close: "Se hai domande, rispondi semplicemente a questa e-mail. Grazie ancora per la fiducia!",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Betaling ontvangen – bedankt!",
    preview: "We hebben je PayPal-betaling ontvangen – helemaal klaar.",
    title: "Betaling ontvangen ✓",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: "we hebben je betaling via PayPal goed ontvangen – heel erg bedankt!",
    p2: "Alles is nu voldaan en de verwijdering van je bedrijfsprofiel is compleet.",
    protectionActive: "Goed om te weten: je geboekte bescherming is nu actief. We houden je profiel in de gaten en verwijderen elke heropname meteen, zodat het definitief weg blijft.",
    close: "Heb je vragen? Reageer dan gewoon op deze e-mail. Nogmaals bedankt voor je vertrouwen!",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "Pagamento recebido – obrigado!",
    preview: "Recebemos o teu pagamento PayPal – está tudo tratado.",
    title: "Pagamento recebido ✓",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: "recebemos com sucesso o teu pagamento através do PayPal – muito obrigado!",
    p2: "Está tudo liquidado e a eliminação do teu perfil de empresa está concluída.",
    protectionActive: "Para que saibas: a proteção que contrataste está agora ativa. Vigiamos o teu perfil e removemos de imediato qualquer reaparição, para que fique eliminado para sempre.",
    close: "Se tiveres alguma dúvida, basta responderes a este e-mail. Obrigado mais uma vez pela tua confiança!",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "お支払いを受領しました – ありがとうございます",
    preview: "PayPalでのお支払いを受領しました。すべて完了です。",
    title: "お支払いを受領しました ✓",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: "PayPalでのお支払いを無事に受領いたしました。誠にありがとうございます!",
    p2: "これですべての精算が完了し、ビジネスプロフィールの削除も完了しています。",
    protectionActive: "ご参考まで:お申し込みいただいた保護が有効になりました。プロフィールを監視し、再表示があればすぐに削除しますので、今後も表示されません。",
    close: "ご不明な点がございましたら、このメールにご返信ください。このたびはご信頼いただきありがとうございました。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: "Betalning mottagen – tack!",
    preview: "Vi har tagit emot din PayPal-betalning – allt är klart.",
    title: "Betalning mottagen ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "vi har tagit emot din betalning via PayPal – tack så mycket!",
    p2: "Allt är nu betalt och borttagningen av din företagsprofil är klar.",
    protectionActive: "Bra att veta: ditt valda skydd är nu aktivt. Vi håller koll på din profil och tar bort varje återpublicering direkt, så att den förblir borttagen.",
    close: "Har du frågor? Svara bara på det här mejlet. Tack än en gång för ditt förtroende!",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Betaling modtaget – tak!",
    preview: "Vi har modtaget din PayPal-betaling – alt er på plads.",
    title: "Betaling modtaget ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "vi har modtaget din betaling via PayPal – mange tak!",
    p2: "Alt er nu betalt, og sletningen af din virksomhedsprofil er fuldført.",
    protectionActive: "Godt at vide: din valgte beskyttelse er nu aktiv. Vi holder øje med din profil og fjerner straks enhver genoprettelse, så den forbliver slettet.",
    close: "Har du spørgsmål, så svar blot på denne mail. Tak igen for din tillid!",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Betaling mottatt – takk!",
    preview: "Vi har mottatt PayPal-betalingen din – alt er i orden.",
    title: "Betaling mottatt ✓",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: "vi har mottatt betalingen din via PayPal – tusen takk!",
    p2: "Alt er nå betalt, og slettingen av bedriftsprofilen din er fullført.",
    protectionActive: "Greit å vite: beskyttelsen du bestilte er nå aktiv. Vi følger med på profilen din og fjerner enhver ny oppføring med en gang, så den forblir slettet.",
    close: "Har du spørsmål, bare svar på denne e-posten. Takk igjen for tilliten!",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: PaypalZahlungBestaetigtProps = {}): string {
  return (T[p.lang || "en"] || T.en).subject;
}

export default function PaypalZahlungBestaetigt({ lang = "en", name = "", hasProtection = false, _overrides }: PaypalZahlungBestaetigtProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const who = (name || "").trim();
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting(who)}</strong></P>
      <P>{t.p1}</P>
      <P>{t.p2}</P>

      {hasProtection ? (
        <NoteBox>
          <span style={{ color: brand.tintText, fontWeight: 700 }}>🛡️ </span>{t.protectionActive}
        </NoteBox>
      ) : null}

      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
