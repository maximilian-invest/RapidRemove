/* Template: PayPal-Zahlungserinnerung / PayPal payment reminder.
   Folgt auf den separat verschickten PayPal-Zahlungslink: freundliche Erinnerung
   mit klarer Frist – Zahlung innerhalb von 48 Stunden, sonst wird das Profil
   wiederhergestellt (erscheint wieder bei Google).
   NUR außerhalb DACH (im Admin für lang="de" ausgeblendet + serverseitig abgelehnt) –
   daher KEINE deutsche Fassung; immer in der Landessprache, im lockeren „du"-Ton. */
import * as React from "react";
import { EmailShell, P, NoteBox, brand, type MailLang } from "./components";

/** Berechnete Ersparnis – vorformatierte Beträge in der Währung der Bestellung. */
export interface OfferData {
  regular: string; paypal: string; savings: string;
  sub?: { monthly: string; regular: string; paypal: string } | null;
}

export interface PaypalErinnerungProps {
  lang?: MailLang;
  /** Vorname/Name des Kunden für die persönliche Anrede. */
  name?: string;
  /** Berechnete Ersparnis (konkrete Beträge) – erinnert an den PayPal-Vorteil. */
  offer?: OfferData | null;
  /** Im Admin bearbeitete Text-Overrides (überschreiben die Default-Texte pro Feld). */
  _overrides?: Record<string, string>;
}

/** Ersparnis-Erinnerung mit Platzhaltern ({pp}=PayPal-Preis, {reg}=regulär, {save}=Ersparnis). */
const OFFER_T: Record<string, { savingsLine: string }> = {
  en: { savingsLine: "And don’t forget: with PayPal it’s only {pp} instead of {reg} — {save} saved." },
  es: { savingsLine: "Y no olvides: con PayPal son solo {pp} en lugar de {reg} — ahorras {save}." },
  fr: { savingsLine: "Et n’oublie pas : avec PayPal, c’est seulement {pp} au lieu de {reg} — {save} d’économie." },
  it: { savingsLine: "E non dimenticare: con PayPal sono solo {pp} invece di {reg} — risparmi {save}." },
  nl: { savingsLine: "En vergeet niet: met PayPal is het maar {pp} in plaats van {reg} — {save} bespaard." },
  pt: { savingsLine: "E não te esqueças: com PayPal são apenas {pp} em vez de {reg} — poupas {save}." },
  ja: { savingsLine: "お忘れなく:PayPalなら{reg}のところわずか{pp}——{save}お得です。" },
  sv: { savingsLine: "Och glöm inte: med PayPal är det bara {pp} istället för {reg} — du sparar {save}." },
  da: { savingsLine: "Og husk: med PayPal er det kun {pp} i stedet for {reg} — du sparer {save}." },
  no: { savingsLine: "Og husk: med PayPal er det bare {pp} i stedet for {reg} — du sparer {save}." },
};

function fillOffer(s: string, o?: OfferData | null): string {
  return (s || "").replace(/\{pp\}/g, (o && o.paypal) || "").replace(/\{reg\}/g, (o && o.regular) || "").replace(/\{save\}/g, (o && o.savings) || "");
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: string; p2: string; deadline: string; consequence: string; close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: "Reminder: your payment is still open (48 hours)",
    preview: "A quick reminder – please complete your payment within 48 hours.",
    title: "A quick reminder about your payment",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: "just a friendly reminder – we haven’t received your payment yet.",
    p2: "You can still pay easily via the PayPal link we sent you.",
    deadline: "Please complete the payment within the next 48 hours.",
    consequence: "Otherwise we’ll have to restore your business profile, which means it will appear on Google again.",
    close: "If you’ve already paid or have any questions, just reply to this email – thank you!",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Recordatorio: tu pago sigue pendiente (48 horas)",
    preview: "Un recordatorio rápido: completa tu pago en un plazo de 48 horas.",
    title: "Un recordatorio rápido sobre tu pago",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: "solo un recordatorio amable: todavía no hemos recibido tu pago.",
    p2: "Aún puedes pagar cómodamente a través del enlace de PayPal que te enviamos.",
    deadline: "Te pedimos que completes el pago en las próximas 48 horas.",
    consequence: "De lo contrario, tendremos que restablecer tu perfil de empresa, lo que significa que volverá a aparecer en Google.",
    close: "Si ya has pagado o tienes alguna pregunta, solo responde a este correo. ¡Gracias!",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Rappel : ton paiement est toujours en attente (48 heures)",
    preview: "Un petit rappel : merci d’effectuer ton paiement sous 48 heures.",
    title: "Un petit rappel concernant ton paiement",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: "juste un petit rappel amical : nous n’avons pas encore reçu ton paiement.",
    p2: "Tu peux toujours payer facilement via le lien PayPal que nous t’avons envoyé.",
    deadline: "Merci d’effectuer le paiement dans les 48 heures à venir.",
    consequence: "Sinon, nous devrons rétablir ta fiche d’établissement, ce qui signifie qu’elle réapparaîtra sur Google.",
    close: "Si tu as déjà payé ou si tu as des questions, réponds simplement à cet e-mail. Merci !",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Promemoria: il tuo pagamento è ancora in sospeso (48 ore)",
    preview: "Un rapido promemoria: completa il pagamento entro 48 ore.",
    title: "Un rapido promemoria sul tuo pagamento",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: "solo un promemoria gentile: non abbiamo ancora ricevuto il tuo pagamento.",
    p2: "Puoi ancora pagare comodamente tramite il link PayPal che ti abbiamo inviato.",
    deadline: "Ti chiediamo di completare il pagamento entro le prossime 48 ore.",
    consequence: "In caso contrario, dovremo ripristinare il tuo profilo aziendale, il che significa che riapparirà su Google.",
    close: "Se hai già pagato o hai domande, rispondi semplicemente a questa e-mail. Grazie!",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Herinnering: je betaling staat nog open (48 uur)",
    preview: "Een korte herinnering: rond je betaling binnen 48 uur af.",
    title: "Een korte herinnering over je betaling",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: "even een vriendelijke herinnering: we hebben je betaling nog niet ontvangen.",
    p2: "Je kunt nog steeds eenvoudig betalen via de PayPal-link die we je hebben gestuurd.",
    deadline: "Rond de betaling graag binnen de komende 48 uur af.",
    consequence: "Anders moeten we je bedrijfsprofiel herstellen, wat betekent dat het weer op Google verschijnt.",
    close: "Heb je al betaald of heb je vragen? Reageer dan gewoon op deze e-mail. Bedankt!",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "Lembrete: o teu pagamento continua pendente (48 horas)",
    preview: "Um lembrete rápido: conclui o teu pagamento no prazo de 48 horas.",
    title: "Um lembrete rápido sobre o teu pagamento",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: "só um lembrete simpático: ainda não recebemos o teu pagamento.",
    p2: "Podes pagar comodamente através do link PayPal que te enviámos.",
    deadline: "Pedimos-te que concluas o pagamento nas próximas 48 horas.",
    consequence: "Caso contrário, teremos de repor o teu perfil de empresa, o que significa que voltará a aparecer no Google.",
    close: "Se já pagaste ou tens alguma dúvida, basta responderes a este e-mail. Obrigado!",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "お支払いに関するリマインダー（48時間）",
    preview: "お支払いをあと48時間以内にお願いいたします。",
    title: "お支払いについてのご確認",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: "念のためのご連絡です。まだお支払いを確認できておりません。",
    p2: "先ほどお送りしたPayPalのリンクから、引き続き簡単にお支払いいただけます。",
    deadline: "お手数ですが、今後48時間以内にお支払いをお願いいたします。",
    consequence: "そうでない場合、ビジネスプロフィールを元に戻す必要があり、再びGoogleに表示されてしまいます。",
    close: "すでにお支払い済みの場合やご不明な点がございましたら、このメールにご返信ください。ありがとうございます。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: "Påminnelse: din betalning är fortfarande öppen (48 timmar)",
    preview: "En snabb påminnelse – slutför din betalning inom 48 timmar.",
    title: "En snabb påminnelse om din betalning",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "bara en vänlig påminnelse – vi har ännu inte fått din betalning.",
    p2: "Du kan fortfarande betala enkelt via PayPal-länken vi skickade till dig.",
    deadline: "Vänligen slutför betalningen inom de närmaste 48 timmarna.",
    consequence: "Annars måste vi återställa din företagsprofil, vilket innebär att den visas på Google igen.",
    close: "Om du redan har betalat eller har frågor, svara bara på det här mejlet. Tack!",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Påmindelse: din betaling er stadig åben (48 timer)",
    preview: "En hurtig påmindelse – gennemfør din betaling inden for 48 timer.",
    title: "En hurtig påmindelse om din betaling",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: "bare en venlig påmindelse – vi har endnu ikke modtaget din betaling.",
    p2: "Du kan stadig nemt betale via det PayPal-link, vi sendte til dig.",
    deadline: "Gennemfør venligst betalingen inden for de næste 48 timer.",
    consequence: "Ellers bliver vi nødt til at gendanne din virksomhedsprofil, hvilket betyder, at den vises på Google igen.",
    close: "Hvis du allerede har betalt eller har spørgsmål, så svar blot på denne mail. Tak!",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Påminnelse: betalingen din er fortsatt åpen (48 timer)",
    preview: "En rask påminnelse – fullfør betalingen din innen 48 timer.",
    title: "En rask påminnelse om betalingen din",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: "bare en vennlig påminnelse – vi har ennå ikke mottatt betalingen din.",
    p2: "Du kan fortsatt betale enkelt via PayPal-lenken vi sendte deg.",
    deadline: "Vennligst fullfør betalingen innen de neste 48 timene.",
    consequence: "Ellers må vi gjenopprette bedriftsprofilen din, noe som betyr at den vises på Google igjen.",
    close: "Hvis du allerede har betalt eller har spørsmål, bare svar på denne e-posten. Takk!",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: PaypalErinnerungProps = {}): string {
  return (T[p.lang || "en"] || T.en).subject;
}

export default function PaypalErinnerung({ lang = "en", name = "", offer, _overrides }: PaypalErinnerungProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const who = (name || "").trim();
  const ot = OFFER_T[lang] || OFFER_T.en;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting(who)}</strong></P>
      <P>{t.p1}</P>
      <P>{t.p2}</P>
      {offer ? <P><strong style={{ color: brand.tintText }}>{fillOffer(ot.savingsLine, offer)}</strong></P> : null}

      <NoteBox>
        <strong style={{ color: brand.tintText, fontSize: 15 }}>{t.deadline}</strong>
        <br /><br />{t.consequence}
      </NoteBox>

      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
