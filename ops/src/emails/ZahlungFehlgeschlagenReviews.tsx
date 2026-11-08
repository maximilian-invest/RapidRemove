/* Mail „Zahlung fehlgeschlagen – bitte Zahlungsart aktualisieren" (06.11.2026).
   Geht EINMAL raus, sobald eine automatische Abbuchung (Einzelbewertungen) fehlschlägt – egal, wie abgerechnet wurde
   (Partner, Admin „Gelöschte abrechnen", Auto-Scan). Die Stripe-Rechnung bleibt offen, Stripe versucht es in den nächsten
   7 Tagen noch mehrmals (autopay.ts RETRY_DAYS). Kunde kann die Zahlungsart im Dashboard tauschen oder die Rechnung direkt zahlen. */
import * as React from "react";
import { EmailShell, P, CtaButton, NoteBox, A, brand, type MailLang } from "./components";
import { BilledReviewList, type BilledReview } from "./BilledReviews";

/** reviews: die abgerechneten Bewertungen (Name des Bewerters + Direktlink) – Liste unter den Buttons (08.11.2026). */
export type FailProps = { lang?: string; name?: string; amount: string; pm?: string; n: number; dashUrl: string; invoiceUrl?: string; reason?: string | null; kind?: "reviews" | "profile"; business?: string; reviews?: BilledReview[] };

interface L {
  subject: string; title: string; hi: (n: string) => string;
  p1: (a: string, n: number, pm: string) => string; p1p: (a: string, biz: string, pm: string) => string; why: string; p2: string; btn: string; alt: string; note: string; close: string; signoff: string;
}

const pmTxt = (pm: string, fb: string) => (pm && pm !== "—" ? pm : fb);

export const T: Record<string, L> = {
  en: {
    subject: "Payment failed – please update your payment method", title: "Payment failed", hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (a, n, pm) => `we tried to charge ${a} for ${n === 1 ? "your removed review" : `${n} removed reviews`} to ${pmTxt(pm, "your saved payment method")}, but the payment didn't go through.`,
    p1p: (a, biz, pm) => `we tried to charge ${a} for the completed removal of your Google Business Profile${biz ? ` (${biz})` : ""} to ${pmTxt(pm, "your saved payment method")}, but the payment didn't go through.`,
    why: "Reason from the payment provider:", p2: "Please update your payment method in your dashboard – it takes a minute. We'll automatically try again over the next few days.",
    btn: "Update payment method", alt: "Or pay the invoice directly", note: "Secured by Stripe · you only pay for completed removals", close: "Questions? Just reply to this email.", signoff: "Warm regards,",
  },
  de: {
    subject: "Zahlung fehlgeschlagen – bitte Zahlungsart aktualisieren", title: "Zahlung fehlgeschlagen", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (a, n, pm) => `wir wollten ${a} für ${n === 1 ? "Ihre gelöschte Bewertung" : `${n} gelöschte Bewertungen`} von ${pmTxt(pm, "Ihrer hinterlegten Zahlungsart")} abbuchen – die Zahlung ist leider nicht durchgegangen.`,
    p1p: (a, biz, pm) => `wir wollten ${a} für die abgeschlossene Löschung Ihres Google Business Profils${biz ? ` (${biz})` : ""} von ${pmTxt(pm, "Ihrer hinterlegten Zahlungsart")} abbuchen – die Zahlung ist leider nicht durchgegangen.`,
    why: "Grund laut Zahlungsanbieter:", p2: "Bitte aktualisieren Sie Ihre Zahlungsart im Dashboard – das dauert eine Minute. Wir versuchen es in den nächsten Tagen automatisch noch einmal.",
    btn: "Zahlungsart aktualisieren", alt: "Oder Rechnung direkt bezahlen", note: "Sicher über Stripe · Sie zahlen nur für tatsächlich gelöschte Bewertungen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen",
  },
  es: {
    subject: "Pago fallido – actualiza tu método de pago", title: "Pago fallido", hi: (n) => (n ? `Hola ${n}:` : "Hola:"),
    p1: (a, n, pm) => `intentamos cobrar ${a} por ${n === 1 ? "tu reseña eliminada" : `${n} reseñas eliminadas`} a ${pmTxt(pm, "tu método de pago guardado")}, pero el pago no se ha podido realizar.`,
    p1p: (a, biz, pm) => `intentamos cobrar ${a} por la eliminación completada de tu perfil de Google Business${biz ? ` (${biz})` : ""} a ${pmTxt(pm, "tu método de pago guardado")}, pero el pago no se ha podido realizar.`,
    why: "Motivo según el proveedor de pago:", p2: "Actualiza tu método de pago en tu panel: tarda un minuto. Volveremos a intentarlo automáticamente en los próximos días.",
    btn: "Actualizar método de pago", alt: "O paga la factura directamente", note: "Protegido por Stripe · solo pagas por las reseñas realmente eliminadas", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo,",
  },
  fr: {
    subject: "Paiement échoué – mets à jour ton moyen de paiement", title: "Paiement échoué", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    p1: (a, n, pm) => `nous avons essayé de débiter ${a} pour ${n === 1 ? "ton avis supprimé" : `${n} avis supprimés`} sur ${pmTxt(pm, "ton moyen de paiement enregistré")}, mais le paiement n'est pas passé.`,
    p1p: (a, biz, pm) => `nous avons essayé de débiter ${a} pour la suppression terminée de ton profil Google Business${biz ? ` (${biz})` : ""} sur ${pmTxt(pm, "ton moyen de paiement enregistré")}, mais le paiement n'est pas passé.`,
    why: "Motif indiqué par le prestataire de paiement :", p2: "Mets à jour ton moyen de paiement dans ton espace – ça prend une minute. Nous réessaierons automatiquement dans les prochains jours.",
    btn: "Mettre à jour le moyen de paiement", alt: "Ou payer directement la facture", note: "Sécurisé par Stripe · tu ne paies que les avis réellement supprimés", close: "Des questions ? Réponds simplement à cet e-mail.", signoff: "Bien cordialement,",
  },
  it: {
    subject: "Pagamento non riuscito – aggiorna il metodo di pagamento", title: "Pagamento non riuscito", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (a, n, pm) => `abbiamo provato ad addebitare ${a} per ${n === 1 ? "la tua recensione rimossa" : `${n} recensioni rimosse`} su ${pmTxt(pm, "il tuo metodo di pagamento salvato")}, ma il pagamento non è andato a buon fine.`,
    p1p: (a, biz, pm) => `abbiamo provato ad addebitare ${a} per la rimozione completata del tuo profilo Google Business${biz ? ` (${biz})` : ""} su ${pmTxt(pm, "il tuo metodo di pagamento salvato")}, ma il pagamento non è andato a buon fine.`,
    why: "Motivo indicato dal fornitore di pagamento:", p2: "Aggiorna il metodo di pagamento nella tua dashboard: ci vuole un minuto. Riproveremo automaticamente nei prossimi giorni.",
    btn: "Aggiorna metodo di pagamento", alt: "Oppure paga direttamente la fattura", note: "Protetto da Stripe · paghi solo le recensioni effettivamente rimosse", close: "Domande? Rispondi a questa e-mail.", signoff: "Cordiali saluti,",
  },
  nl: {
    subject: "Betaling mislukt – werk uw betaalmethode bij", title: "Betaling mislukt", hi: (n) => (n ? `Beste ${n},` : "Beste klant,"),
    p1: (a, n, pm) => `we wilden ${a} voor ${n === 1 ? "uw verwijderde review" : `${n} verwijderde reviews`} afschrijven van ${pmTxt(pm, "uw opgeslagen betaalmethode")}, maar de betaling is niet gelukt.`,
    p1p: (a, biz, pm) => `we wilden ${a} voor de voltooide verwijdering van uw Google Bedrijfsprofiel${biz ? ` (${biz})` : ""} afschrijven van ${pmTxt(pm, "uw opgeslagen betaalmethode")}, maar de betaling is niet gelukt.`,
    why: "Reden volgens de betaalprovider:", p2: "Werk uw betaalmethode bij in uw dashboard – dat duurt een minuut. We proberen het de komende dagen automatisch opnieuw.",
    btn: "Betaalmethode bijwerken", alt: "Of betaal de factuur direct", note: "Beveiligd door Stripe · u betaalt alleen voor reviews die echt zijn verwijderd", close: "Vragen? Beantwoord gewoon deze e-mail.", signoff: "Met vriendelijke groet,",
  },
  pt: {
    subject: "Pagamento falhou – atualiza o método de pagamento", title: "Pagamento falhou", hi: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (a, n, pm) => `tentámos cobrar ${a} por ${n === 1 ? "a tua avaliação removida" : `${n} avaliações removidas`} em ${pmTxt(pm, "o teu método de pagamento guardado")}, mas o pagamento não foi concluído.`,
    p1p: (a, biz, pm) => `tentámos cobrar ${a} pela remoção concluída do teu Perfil da Empresa no Google${biz ? ` (${biz})` : ""} em ${pmTxt(pm, "o teu método de pagamento guardado")}, mas o pagamento não foi concluído.`,
    why: "Motivo indicado pelo fornecedor de pagamento:", p2: "Atualiza o método de pagamento no teu painel – demora um minuto. Vamos tentar de novo automaticamente nos próximos dias.",
    btn: "Atualizar método de pagamento", alt: "Ou paga a fatura diretamente", note: "Protegido pela Stripe · só pagas as avaliações realmente removidas", close: "Dúvidas? Responde a este e-mail.", signoff: "Com os melhores cumprimentos,",
  },
  ja: {
    subject: "お支払いに失敗しました – お支払い方法を更新してください", title: "お支払いに失敗しました", hi: (n) => (n ? `${n} 様` : "お客様"),
    p1: (a, n, pm) => `削除済みの口コミ${n}件分の${a}を${pmTxt(pm, "ご登録のお支払い方法")}に請求しましたが、お支払いが完了しませんでした。`,
    p1p: (a, biz, pm) => `Googleビジネスプロフィール${biz ? `（${biz}）` : ""}の削除完了分${a}を${pmTxt(pm, "ご登録のお支払い方法")}に請求しましたが、お支払いが完了しませんでした。`,
    why: "決済会社からの理由：", p2: "ダッシュボードでお支払い方法を更新してください（1分ほどで完了します）。数日以内に自動で再請求いたします。",
    btn: "お支払い方法を更新", alt: "または請求書を直接支払う", note: "Stripeによる安全な決済 · 実際に削除された口コミ分のみのお支払いです", close: "ご不明点はこのメールにご返信ください。", signoff: "よろしくお願いいたします。",
  },
  sv: {
    subject: "Betalningen misslyckades – uppdatera din betalningsmetod", title: "Betalningen misslyckades", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (a, n, pm) => `vi försökte dra ${a} för ${n === 1 ? "ditt borttagna omdöme" : `${n} borttagna omdömen`} från ${pmTxt(pm, "din sparade betalningsmetod")}, men betalningen gick inte igenom.`,
    p1p: (a, biz, pm) => `vi försökte dra ${a} för den genomförda borttagningen av din Google-företagsprofil${biz ? ` (${biz})` : ""} från ${pmTxt(pm, "din sparade betalningsmetod")}, men betalningen gick inte igenom.`,
    why: "Orsak enligt betalleverantören:", p2: "Uppdatera din betalningsmetod i din översikt – det tar en minut. Vi försöker automatiskt igen under de närmaste dagarna.",
    btn: "Uppdatera betalningsmetod", alt: "Eller betala fakturan direkt", note: "Säkert via Stripe · du betalar bara för omdömen som faktiskt tas bort", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Betalingen mislykkedes – opdater din betalingsmetode", title: "Betalingen mislykkedes", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (a, n, pm) => `vi forsøgte at trække ${a} for ${n === 1 ? "din fjernede anmeldelse" : `${n} fjernede anmeldelser`} fra ${pmTxt(pm, "din gemte betalingsmetode")}, men betalingen gik ikke igennem.`,
    p1p: (a, biz, pm) => `vi forsøgte at trække ${a} for den gennemførte fjernelse af din Google Virksomhedsprofil${biz ? ` (${biz})` : ""} fra ${pmTxt(pm, "din gemte betalingsmetode")}, men betalingen gik ikke igennem.`,
    why: "Årsag ifølge betalingsudbyderen:", p2: "Opdater din betalingsmetode i dit dashboard – det tager et minut. Vi prøver automatisk igen i løbet af de næste dage.",
    btn: "Opdater betalingsmetode", alt: "Eller betal fakturaen direkte", note: "Sikret af Stripe · du betaler kun for anmeldelser, der faktisk fjernes", close: "Spørgsmål? Svar blot på denne e-mail.", signoff: "Venlig hilsen",
  },
  no: {
    subject: "Betalingen mislyktes – oppdater betalingsmetoden", title: "Betalingen mislyktes", hi: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (a, n, pm) => `vi prøvde å trekke ${a} for ${n === 1 ? "den fjernede omtalen din" : `${n} fjernede omtaler`} fra ${pmTxt(pm, "den lagrede betalingsmetoden din")}, men betalingen gikk ikke gjennom.`,
    p1p: (a, biz, pm) => `vi prøvde å trekke ${a} for den fullførte fjerningen av Google-bedriftsprofilen din${biz ? ` (${biz})` : ""} fra ${pmTxt(pm, "den lagrede betalingsmetoden din")}, men betalingen gikk ikke gjennom.`,
    why: "Årsak ifølge betalingsleverandøren:", p2: "Oppdater betalingsmetoden i dashbordet ditt – det tar et minutt. Vi prøver automatisk igjen de neste dagene.",
    btn: "Oppdater betalingsmetode", alt: "Eller betal fakturaen direkte", note: "Sikret av Stripe · du betaler bare for omtaler som faktisk er fjernet", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen",
  },
};

const tOf = (lang?: string) => T[String(lang || "en").slice(0, 2)] || T.en;
export const zahlungFehlgeschlagenSubject = (p: FailProps) => tOf(p.lang).subject;

export default function ZahlungFehlgeschlagenReviews(p: FailProps) {
  const l = T[String(p.lang || "en").slice(0, 2)] ? String(p.lang).slice(0, 2) : "en";
  const t = T[l];
  return (
    <EmailShell preview={t.subject} title={t.title} lang={l as MailLang}>
      <P><strong>{t.hi(String(p.name || "").trim())}</strong></P>
      <P>{p.kind === "profile" ? t.p1p(p.amount, String(p.business || ""), String(p.pm || "")) : t.p1(p.amount, Math.max(1, p.n || 1), String(p.pm || ""))}</P>
      {p.reason ? <P><span style={{ color: brand.muted }}>{t.why} {p.reason}</span></P> : null}
      <P><strong>{t.p2}</strong></P>
      <div style={{ textAlign: "center", margin: "14px 0 10px" }}><CtaButton href={p.dashUrl}>{t.btn}</CtaButton></div>
      {p.invoiceUrl ? <P><span style={{ display: "block", textAlign: "center" }}><A href={p.invoiceUrl}>{t.alt}</A></span></P> : null}
      {p.kind !== "profile" ? <BilledReviewList lang={l} items={p.reviews} /> : null}
      <NoteBox><span style={{ color: brand.tintText }}>{p.kind === "profile" ? t.note.split(" · ")[0] : t.note}</span></NoteBox>
      <P><span style={{ color: brand.muted }}>{t.close}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
