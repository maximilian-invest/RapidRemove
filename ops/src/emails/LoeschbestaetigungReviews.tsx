/* Template: Löschbestätigung + Rechnung „Einzelne Bewertungen löschen".
   Wird aus dem Admin gesendet, sobald Bewertungen tatsächlich gelöscht sind.
   Bestätigt WELCHE Bewertungen weg sind, weist den Preis JE Löschung aus
   (abgerechnet wird nur, was wirklich gelöscht wurde) und trägt den
   Stripe-Zahlungslink. Fällig am Tag der Löschung — also heute.
   Produkt nur außerhalb DACH → keine deutsche Fassung, „du"-Ton. */
import * as React from "react";
import { EmailShell, P, NoteBox, CtaButton, Bullets, brand, type MailLang } from "./components";

export interface LoeschbestaetigungReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Links der GELÖSCHTEN Bewertungen (nur diese werden berechnet). */
  removedUrls?: string[];
  /** Anzahl eingereichter Bewertungen (für „X von Y"). */
  submittedCount?: number;
  /** Formatierter Stückpreis, z. B. "$179". */
  per?: string;
  /** Formatierter Rechnungsbetrag (Anzahl gelöscht × Stückpreis). */
  total?: string;
  /** Stripe-Zahlungslink. */
  payUrl?: string;
  orderId?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: (n: number) => string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: (n: number, of: number) => string;
  listH: string;
  billH: string; billLine: (n: number, per: string, total: string) => string;
  billOnly: string; due: string;
  cta: string;
  close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: (n) => `Done: ${n} review${n === 1 ? "" : "s"} removed — your invoice`,
    preview: "The reviews are gone. Here's your confirmation and invoice.",
    title: "Reviews removed ✓",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n, of) => of > n
      ? `good news — we've removed ${n} of the ${of} reviews you submitted. As promised, you only pay for what's actually gone.`
      : `good news — ${n === 1 ? "the review you submitted has" : `all ${n} reviews you submitted have`} been removed.`,
    listH: "Removed reviews",
    billH: "Your invoice",
    billLine: (n, per, total) => `${n} removed review${n === 1 ? "" : "s"} × ${per} = ${total}`,
    billOnly: "Only removed reviews are billed — submitted reviews that are still online cost nothing.",
    due: "Due today — payment is due on the day of removal.",
    cta: "Pay securely now",
    close: "Thanks for your trust! Questions about the invoice? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: (n) => `Hecho: ${n} reseña${n === 1 ? "" : "s"} eliminada${n === 1 ? "" : "s"} — tu factura`,
    preview: "Las reseñas ya no están. Aquí tienes la confirmación y la factura.",
    title: "Reseñas eliminadas ✓",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: (n, of) => of > n
      ? `buenas noticias: hemos eliminado ${n} de las ${of} reseñas que enviaste. Como prometimos, solo pagas por lo que realmente ha desaparecido.`
      : `buenas noticias: ${n === 1 ? "la reseña que enviaste ha sido eliminada" : `las ${n} reseñas que enviaste han sido eliminadas`}.`,
    listH: "Reseñas eliminadas",
    billH: "Tu factura",
    billLine: (n, per, total) => `${n} reseña${n === 1 ? "" : "s"} eliminada${n === 1 ? "" : "s"} × ${per} = ${total}`,
    billOnly: "Solo se facturan las reseñas eliminadas: las que sigan en línea no cuestan nada.",
    due: "Vence hoy: el pago se debe el día de la eliminación.",
    cta: "Pagar ahora de forma segura",
    close: "¡Gracias por tu confianza! ¿Dudas sobre la factura? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: (n) => `C'est fait : ${n} avis supprimé${n === 1 ? "" : "s"} — ta facture`,
    preview: "Les avis ont disparu. Voici ta confirmation et ta facture.",
    title: "Avis supprimés ✓",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: (n, of) => of > n
      ? `bonne nouvelle — nous avons supprimé ${n} des ${of} avis que tu as transmis. Comme promis, tu ne paies que ce qui a réellement disparu.`
      : `bonne nouvelle — ${n === 1 ? "l'avis que tu as transmis a été supprimé" : `les ${n} avis que tu as transmis ont été supprimés`}.`,
    listH: "Avis supprimés",
    billH: "Ta facture",
    billLine: (n, per, total) => `${n} avis supprimé${n === 1 ? "" : "s"} × ${per} = ${total}`,
    billOnly: "Seuls les avis supprimés sont facturés — ceux encore en ligne ne coûtent rien.",
    due: "À régler aujourd'hui — le paiement est dû le jour de la suppression.",
    cta: "Payer en toute sécurité",
    close: "Merci pour ta confiance ! Une question sur la facture ? Réponds à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: (n) => `Fatto: ${n} recension${n === 1 ? "e rimossa" : "i rimosse"} — la tua fattura`,
    preview: "Le recensioni sono sparite. Ecco conferma e fattura.",
    title: "Recensioni rimosse ✓",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n, of) => of > n
      ? `buone notizie — abbiamo rimosso ${n} delle ${of} recensioni che hai inviato. Come promesso, paghi solo ciò che è davvero sparito.`
      : `buone notizie — ${n === 1 ? "la recensione che hai inviato è stata rimossa" : `tutte le ${n} recensioni che hai inviato sono state rimosse`}.`,
    listH: "Recensioni rimosse",
    billH: "La tua fattura",
    billLine: (n, per, total) => `${n} recension${n === 1 ? "e rimossa" : "i rimosse"} × ${per} = ${total}`,
    billOnly: "Si fatturano solo le recensioni rimosse — quelle ancora online non costano nulla.",
    due: "Da saldare oggi — il pagamento è dovuto il giorno della rimozione.",
    cta: "Paga ora in sicurezza",
    close: "Grazie per la fiducia! Domande sulla fattura? Rispondi a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: (n) => `Klaar: ${n} review${n === 1 ? "" : "s"} verwijderd — je factuur`,
    preview: "De reviews zijn weg. Hier zijn je bevestiging en factuur.",
    title: "Reviews verwijderd ✓",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: (n, of) => of > n
      ? `goed nieuws — we hebben ${n} van de ${of} ingediende reviews verwijderd. Zoals beloofd betaal je alleen voor wat echt weg is.`
      : `goed nieuws — ${n === 1 ? "de ingediende review is verwijderd" : `alle ${n} ingediende reviews zijn verwijderd`}.`,
    listH: "Verwijderde reviews",
    billH: "Je factuur",
    billLine: (n, per, total) => `${n} verwijderde review${n === 1 ? "" : "s"} × ${per} = ${total}`,
    billOnly: "Alleen verwijderde reviews worden gefactureerd — reviews die nog online staan kosten niets.",
    due: "Vandaag te voldoen — betaling is verschuldigd op de dag van verwijdering.",
    cta: "Nu veilig betalen",
    close: "Bedankt voor je vertrouwen! Vragen over de factuur? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: (n) => `Feito: ${n} avaliaç${n === 1 ? "ão removida" : "ões removidas"} — a tua fatura`,
    preview: "As avaliações desapareceram. Eis a confirmação e a fatura.",
    title: "Avaliações removidas ✓",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n, of) => of > n
      ? `boas notícias — removemos ${n} das ${of} avaliações que enviaste. Como prometido, só pagas o que desapareceu de facto.`
      : `boas notícias — ${n === 1 ? "a avaliação que enviaste foi removida" : `as ${n} avaliações que enviaste foram removidas`}.`,
    listH: "Avaliações removidas",
    billH: "A tua fatura",
    billLine: (n, per, total) => `${n} avaliaç${n === 1 ? "ão removida" : "ões removidas"} × ${per} = ${total}`,
    billOnly: "Só se faturam as avaliações removidas — as que continuam online não custam nada.",
    due: "Vence hoje — o pagamento é devido no dia da remoção.",
    cta: "Pagar agora em segurança",
    close: "Obrigado pela confiança! Dúvidas sobre a fatura? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: (n) => `完了：口コミ${n}件を削除しました — ご請求のご案内`,
    preview: "口コミの削除が完了しました。削除確認と請求書をお送りします。",
    title: "口コミを削除しました ✓",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: (n, of) => of > n
      ? `お送りいただいた${of}件のうち、${n}件の削除が完了しました。お約束どおり、実際に削除できた分のみのご請求です。`
      : `お送りいただいた口コミ${n}件の削除がすべて完了しました。`,
    listH: "削除済みの口コミ",
    billH: "ご請求内容",
    billLine: (n, per, total) => `削除済み${n}件 × ${per} = ${total}`,
    billOnly: "ご請求は削除済みの口コミのみです。まだ表示されている口コミには費用はかかりません。",
    due: "お支払い期日は本日です — 削除当日が期日となります。",
    cta: "今すぐ安全に支払う",
    close: "ご利用ありがとうございます。ご請求についてのご質問は、このメールにご返信ください。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: (n) => `Klart: ${n} omdöme${n === 1 ? "" : "n"} borttagna — din faktura`,
    preview: "Omdömena är borta. Här är din bekräftelse och faktura.",
    title: "Omdömen borttagna ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n, of) => of > n
      ? `goda nyheter — vi har tagit bort ${n} av de ${of} omdömen du skickade in. Som utlovat betalar du bara för det som faktiskt är borta.`
      : `goda nyheter — ${n === 1 ? "omdömet du skickade in har tagits bort" : `alla ${n} omdömen du skickade in har tagits bort`}.`,
    listH: "Borttagna omdömen",
    billH: "Din faktura",
    billLine: (n, per, total) => `${n} borttagna omdömen × ${per} = ${total}`,
    billOnly: "Endast borttagna omdömen faktureras — omdömen som fortfarande är kvar kostar ingenting.",
    due: "Förfaller idag — betalningen ska ske samma dag som borttagningen.",
    cta: "Betala säkert nu",
    close: "Tack för ditt förtroende! Frågor om fakturan? Svara bara på det här mejlet.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: (n) => `Færdig: ${n} anmeldelse${n === 1 ? "" : "r"} fjernet — din faktura`,
    preview: "Anmeldelserne er væk. Her er din bekræftelse og faktura.",
    title: "Anmeldelser fjernet ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n, of) => of > n
      ? `gode nyheder — vi har fjernet ${n} af de ${of} anmeldelser, du indsendte. Som lovet betaler du kun for det, der faktisk er væk.`
      : `gode nyheder — ${n === 1 ? "anmeldelsen, du indsendte, er fjernet" : `alle ${n} anmeldelser, du indsendte, er fjernet`}.`,
    listH: "Fjernede anmeldelser",
    billH: "Din faktura",
    billLine: (n, per, total) => `${n} fjernede anmeldelser × ${per} = ${total}`,
    billOnly: "Kun fjernede anmeldelser faktureres — anmeldelser, der stadig er online, koster ingenting.",
    due: "Forfalder i dag — betalingen forfalder på fjernelsesdagen.",
    cta: "Betal sikkert nu",
    close: "Tak for din tillid! Spørgsmål til fakturaen? Svar blot på denne mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: (n) => `Ferdig: ${n} omtale${n === 1 ? "" : "r"} fjernet — fakturaen din`,
    preview: "Omtalene er borte. Her er bekreftelsen og fakturaen din.",
    title: "Omtaler fjernet ✓",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n, of) => of > n
      ? `gode nyheter — vi har fjernet ${n} av de ${of} omtalene du sendte inn. Som lovet betaler du bare for det som faktisk er borte.`
      : `gode nyheter — ${n === 1 ? "omtalen du sendte inn er fjernet" : `alle ${n} omtalene du sendte inn er fjernet`}.`,
    listH: "Fjernede omtaler",
    billH: "Fakturaen din",
    billLine: (n, per, total) => `${n} fjernede omtaler × ${per} = ${total}`,
    billOnly: "Kun fjernede omtaler faktureres — omtaler som fortsatt ligger ute, koster ingenting.",
    due: "Forfaller i dag — betalingen forfaller samme dag som fjerningen.",
    cta: "Betal trygt nå",
    close: "Takk for tilliten! Spørsmål om fakturaen? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: LoeschbestaetigungReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject((p.removedUrls || []).length || 1);
}

export default function LoeschbestaetigungReviews({ lang = "en", name = "", removedUrls = [], submittedCount = 0, per = "", total = "", payUrl = "", orderId = "", _overrides }: LoeschbestaetigungReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const n = removedUrls.length || 1;
  const of = Math.max(submittedCount, n);
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1(n, of)}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      {removedUrls.length ? (
        <React.Fragment>
          <P><strong>{t.listH}</strong></P>
          <Bullets items={removedUrls.map((u, i) => (
            <span key={i} style={{ wordBreak: "break-all" }}>✓ {u}</span>
          ))} />
        </React.Fragment>
      ) : null}

      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.billH}</span><br />
        <strong>{t.billLine(n, per, total)}</strong><br />
        {t.billOnly}<br />
        <strong>{t.due}</strong>
      </NoteBox>

      {payUrl ? <CtaButton href={payUrl} full>{t.cta}</CtaButton> : null}

      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
