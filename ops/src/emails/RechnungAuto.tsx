/* Rechnung bei automatischer Abbuchung („Automatisch bezahlen"): Stripe-Rechnung als PDF im Anhang.
   Geht nach JEDER erfolgreichen Abbuchung raus (eigene Mail – unabhängig von den Stripe-E-Mail-Einstellungen). */
import * as React from "react";
import { EmailShell, P, NoteBox, CtaButton, type MailLang } from "./components";

type L = { subject: string; title: string; hi: string; hi0: string; p: string; note: string; btn: string; close: string; signoff: string };
const T: Record<MailLang, L> = {
  de: {"subject": "Ihre Rechnung {nr} – {a} automatisch bezahlt", "title": "Ihre Rechnung", "hi": "Guten Tag {n},", "hi0": "Guten Tag,", "p": "für {k} gelöschte Bewertung(en) haben wir {a} automatisch von {pm} abgebucht. Ihre Rechnung {nr} finden Sie im Anhang dieser E-Mail.", "note": "Sie zahlen nur für tatsächlich gelöschte Bewertungen. Alle Rechnungen finden Sie auch in Ihrem Dashboard unter „Zahlungen“.", "btn": "Rechnung online ansehen", "close": "Fragen? Antworten Sie einfach auf diese E-Mail.", "signoff": "Mit freundlichen Grüßen,"},
  en: {"subject": "Your invoice {nr} – {a} paid automatically", "title": "Your invoice", "hi": "Hi {n},", "hi0": "Hi there,", "p": "for {k} removed review(s) we've automatically charged {a} to {pm}. Your invoice {nr} is attached to this email.", "note": "You only pay for reviews that are actually removed. All invoices are also in your dashboard under “Payments”.", "btn": "View invoice online", "close": "Questions? Just reply to this email.", "signoff": "Warm regards,"},
  es: {"subject": "Tu factura {nr} – {a} pagados automáticamente", "title": "Tu factura", "hi": "Hola {n}:", "hi0": "Hola:", "p": "por {k} reseña(s) eliminada(s) hemos cobrado automáticamente {a} a {pm}. Encontrarás tu factura {nr} adjunta a este correo.", "note": "Solo pagas por las reseñas eliminadas de verdad. Todas las facturas están también en tu panel, en “Pagos”.", "btn": "Ver factura online", "close": "¿Preguntas? Responde a este correo.", "signoff": "Un saludo,"},
  fr: {"subject": "Ta facture {nr} – {a} payés automatiquement", "title": "Ta facture", "hi": "Bonjour {n},", "hi0": "Bonjour,", "p": "pour {k} avis supprimé(s), nous avons débité automatiquement {a} sur {pm}. Ta facture {nr} est jointe à cet e-mail.", "note": "Tu ne paies que les avis réellement supprimés. Toutes les factures sont aussi dans ton tableau de bord, sous « Paiements ».", "btn": "Voir la facture en ligne", "close": "Une question ? Réponds simplement à cet e-mail.", "signoff": "Bien à toi,"},
  it: {"subject": "La tua fattura {nr} – {a} pagati automaticamente", "title": "La tua fattura", "hi": "Ciao {n},", "hi0": "Ciao,", "p": "per {k} recensione/i rimossa/e abbiamo addebitato automaticamente {a} su {pm}. Trovi la fattura {nr} in allegato a questa e-mail.", "note": "Paghi solo le recensioni davvero rimosse. Tutte le fatture sono anche nella tua dashboard, in “Pagamenti”.", "btn": "Vedi fattura online", "close": "Domande? Rispondi a questa e-mail.", "signoff": "Un caro saluto,"},
  nl: {"subject": "Uw factuur {nr} – {a} automatisch betaald", "title": "Uw factuur", "hi": "Beste {n},", "hi0": "Hallo,", "p": "voor {k} verwijderde review(s) hebben we automatisch {a} afgeschreven van {pm}. Uw factuur {nr} vindt u in de bijlage.", "note": "U betaalt alleen voor reviews die echt zijn verwijderd. Alle facturen staan ook in uw dashboard onder ‘Betalingen’.", "btn": "Factuur online bekijken", "close": "Vragen? Antwoord gewoon op deze e-mail.", "signoff": "Met vriendelijke groet,"},
  pt: {"subject": "A tua fatura {nr} – {a} pagos automaticamente", "title": "A tua fatura", "hi": "Olá {n},", "hi0": "Olá,", "p": "por {k} avaliação(ões) removida(s) cobrámos automaticamente {a} em {pm}. A tua fatura {nr} segue em anexo.", "note": "Só pagas pelas avaliações realmente removidas. Todas as faturas estão também no teu painel, em “Pagamentos”.", "btn": "Ver fatura online", "close": "Dúvidas? Responde a este e-mail.", "signoff": "Cumprimentos,"},
  ja: {"subject": "請求書 {nr} – {a} を自動でお支払いいただきました", "title": "請求書", "hi": "{n} 様", "hi0": "こんにちは。", "p": "削除された口コミ{k}件分として、{pm}に{a}を自動請求しました。請求書 {nr} をこのメールに添付しています。", "note": "お支払いは実際に削除された口コミの分だけです。すべての請求書はダッシュボードの「お支払い」でもご確認いただけます。", "btn": "請求書をオンラインで見る", "close": "ご不明な点は、このメールにご返信ください。", "signoff": "よろしくお願いいたします。"},
  sv: {"subject": "Din faktura {nr} – {a} betalt automatiskt", "title": "Din faktura", "hi": "Hej {n},", "hi0": "Hej,", "p": "för {k} borttaget/borttagna omdöme(n) har vi automatiskt dragit {a} från {pm}. Din faktura {nr} finns bifogad i detta mejl.", "note": "Du betalar bara för omdömen som faktiskt tas bort. Alla fakturor finns även i din översikt under ”Betalningar”.", "btn": "Visa faktura online", "close": "Frågor? Svara bara på det här mejlet.", "signoff": "Vänliga hälsningar,"},
  da: {"subject": "Din faktura {nr} – {a} betalt automatisk", "title": "Din faktura", "hi": "Hej {n},", "hi0": "Hej,", "p": "for {k} fjernet/fjernede anmeldelse(r) har vi automatisk trukket {a} fra {pm}. Din faktura {nr} er vedhæftet denne mail.", "note": "Du betaler kun for anmeldelser, der faktisk fjernes. Alle fakturaer ligger også i dit dashboard under “Betalinger”.", "btn": "Se faktura online", "close": "Spørgsmål? Svar bare på denne mail.", "signoff": "Venlig hilsen,"},
  no: {"subject": "Fakturaen din {nr} – {a} betalt automatisk", "title": "Fakturaen din", "hi": "Hei {n},", "hi0": "Hei,", "p": "for {k} fjernet/fjernede anmeldelse(r) har vi automatisk trukket {a} fra {pm}. Fakturaen {nr} ligger vedlagt i denne e-posten.", "note": "Du betaler bare for anmeldelser som faktisk fjernes. Alle fakturaer finnes også i dashbordet under «Betalinger».", "btn": "Se faktura på nett", "close": "Spørsmål? Bare svar på denne e-posten.", "signoff": "Vennlig hilsen,"},
};
export interface RechnungAutoProps { lang?: string; name?: string; nr: string; amount: string; pm: string; n: number; url: string }
const tOf = (l?: string) => T[(l && (T as Record<string, L>)[l] ? l : "en") as MailLang];
const fill = (s: string, p: RechnungAutoProps) => s.replace("{nr}", p.nr).replace("{a}", p.amount).replace("{pm}", p.pm).replace("{k}", String(p.n)).replace("{n}", (p.name || "").trim());
export const rechnungAutoSubject = (p: RechnungAutoProps) => fill(tOf(p.lang).subject, p);
export default function RechnungAuto(p: RechnungAutoProps) {
  const l = (p.lang && (T as Record<string, L>)[p.lang] ? p.lang : "en") as MailLang;
  const t = T[l];
  return (
    <EmailShell preview={fill(t.subject, p)} title={t.title} lang={l}>
      <P><strong>{(p.name || "").trim() ? fill(t.hi, p) : t.hi0}</strong></P>
      <P>{fill(t.p, p)}</P>
      <NoteBox>{t.note}</NoteBox>
      {p.url ? <div style={{ textAlign: "center", margin: "10px 0 20px" }}><CtaButton href={p.url}>{t.btn}</CtaButton></div> : null}
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
