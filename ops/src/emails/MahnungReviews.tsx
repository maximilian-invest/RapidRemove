/* Template: Mahnung / Zahlungserinnerung „Einzelne Bewertungen löschen".
   Wird aus dem Admin gesendet, wenn die Rechnung zur Bewertungs-Löschung
   offen ist. 3-stufig: 1) freundliche Erinnerung, 2) 2. Mahnung, 3) letzte
   Mahnung — bei Stufe 3 drohen wir an, die gelöschten Bewertungen wieder
   online zu stellen (+ Inkasso). Zahlung jeweils innerhalb 48 Stunden.
   Produkt nur außerhalb DACH → keine deutsche Fassung, „du"-Ton. */
import * as React from "react";
import { EmailShell, P, NoteBox, DangerBox, CtaButton, brand, type MailLang } from "./components";

/** Eine offene (gelöschte, aber unbezahlte) Bewertung. */
export interface MahnungReviewRef { url?: string; name?: string; text?: string }

export interface MahnungReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Die offenen (gelöschten) Bewertungen — Anzahl treibt Rechnungsbetrag + Drohung. */
  removedItems?: MahnungReviewRef[];
  removedUrls?: string[];
  per?: string;   // Stückpreis, z. B. "$179"
  total?: string; // Rechnungsbetrag
  payUrl?: string;
  orderId?: string;
  /** Mahnstufe 1–3 (3 = letzte Mahnung, Bewertung geht wieder online). */
  stage?: number;
  /** Kunde zahlt per PayPal/Wise (10 % Rabatt) → kein Stripe-Button, Hinweis auf die gesendeten Zahlungsdaten. */
  method?: "paypal" | "wise";
  /** Rabattierter Betrag bei PayPal/Wise (−10 %). */
  payTotal?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string[];   // [Stufe1, Stufe2, Stufe3]
  preview: string[];
  title: string[];
  greeting: (n: string) => string;
  intro: string[];
  billH: string;
  billLine: (n: number, per: string, total: string) => string;
  deadline: string;    // 48-Stunden-Frist
  warnH: string;
  warn: (n: number) => string;  // nur Stufe 3
  cta: string;
  close: string;
  signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: ["Payment reminder — your invoice is still open", "Second reminder — invoice still unpaid", "Final notice — the removed reviews go back online"],
    preview: ["A quick reminder about your open invoice.", "Your invoice is still open — please pay within 48 hours.", "Final notice: unpaid removed reviews will be republished."],
    title: ["Payment reminder", "Second reminder", "Final notice"],
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    intro: [
      "a friendly reminder — the invoice for the reviews we removed for you is still open. Please complete your payment within the next 48 hours.",
      "your invoice for the removed reviews is still unpaid. Please settle it within 48 hours to avoid further steps.",
      "despite our reminders, your invoice for the removed reviews is still unpaid. This is our final notice.",
    ],
    billH: "Open invoice",
    billLine: (n, per, total) => `${n} removed review${n === 1 ? "" : "s"} × ${per} = ${total}`,
    deadline: "Payment is due within 48 hours.",
    warnH: "What happens if you don't pay",
    warn: (n) => `If your payment does not reach us in time, we will reverse the removal and ${n === 1 ? "the review will be published again" : `the ${n} reviews will be published again`}. The claim may also be handed to a collection agency.`,
    cta: "Pay securely now",
    close: "Already paid in the meantime? Then please ignore this reminder — thank you!",
    signoff: "Warm regards,",
  },
  es: {
    subject: ["Recordatorio de pago — tu factura sigue pendiente", "Segundo recordatorio — factura aún sin pagar", "Último aviso — las reseñas eliminadas vuelven a publicarse"],
    preview: ["Un recordatorio sobre tu factura pendiente.", "Tu factura sigue pendiente — paga en 48 horas.", "Último aviso: las reseñas no pagadas se volverán a publicar."],
    title: ["Recordatorio de pago", "Segundo recordatorio", "Último aviso"],
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    intro: [
      "un recordatorio amable: la factura por las reseñas que eliminamos sigue pendiente. Por favor, complétalo en las próximas 48 horas.",
      "tu factura por las reseñas eliminadas sigue sin pagarse. Págala en un plazo de 48 horas para evitar más pasos.",
      "a pesar de nuestros recordatorios, tu factura por las reseñas eliminadas sigue sin pagarse. Este es el último aviso.",
    ],
    billH: "Factura pendiente",
    billLine: (n, per, total) => `${n} reseña${n === 1 ? "" : "s"} eliminada${n === 1 ? "" : "s"} × ${per} = ${total}`,
    deadline: "El pago vence en un plazo de 48 horas.",
    warnH: "Qué ocurre si no pagas",
    warn: (n) => `Si no recibimos tu pago a tiempo, revertiremos la eliminación y ${n === 1 ? "la reseña se volverá a publicar" : `las ${n} reseñas se volverán a publicar`}. Además, la deuda podría pasar a una agencia de cobros.`,
    cta: "Pagar ahora de forma segura",
    close: "¿Ya has pagado? Entonces ignora este recordatorio, ¡gracias!",
    signoff: "Un saludo,",
  },
  fr: {
    subject: ["Rappel de paiement — ta facture est en attente", "Deuxième rappel — facture toujours impayée", "Dernier avis — les avis supprimés seront republiés"],
    preview: ["Un rappel concernant ta facture en attente.", "Ta facture est toujours en attente — paie sous 48 heures.", "Dernier avis : les avis impayés seront republiés."],
    title: ["Rappel de paiement", "Deuxième rappel", "Dernier avertissement"],
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    intro: [
      "un petit rappel — la facture pour les avis que nous avons supprimés est toujours en attente. Merci de régler sous 48 heures.",
      "ta facture pour les avis supprimés est toujours impayée. Merci de la régler sous 48 heures pour éviter d'autres démarches.",
      "malgré nos rappels, ta facture pour les avis supprimés reste impayée. Ceci est notre dernier avertissement.",
    ],
    billH: "Facture en attente",
    billLine: (n, per, total) => `${n} avis supprimé${n === 1 ? "" : "s"} × ${per} = ${total}`,
    deadline: "Le paiement est dû sous 48 heures.",
    warnH: "Ce qui se passe sans paiement",
    warn: (n) => `Sans réception de ton paiement dans les délais, nous annulerons la suppression et ${n === 1 ? "l'avis sera de nouveau publié" : `les ${n} avis seront de nouveau publiés`}. La créance pourra aussi être confiée à une agence de recouvrement.`,
    cta: "Payer en toute sécurité",
    close: "Déjà payé ? Dans ce cas, ignore ce rappel — merci !",
    signoff: "Bien à toi,",
  },
  it: {
    subject: ["Sollecito di pagamento — la tua fattura è aperta", "Secondo sollecito — fattura ancora da saldare", "Ultimo avviso — le recensioni rimosse tornano online"],
    preview: ["Un promemoria sulla tua fattura aperta.", "La tua fattura è ancora aperta — paga entro 48 ore.", "Ultimo avviso: le recensioni non pagate verranno ripubblicate."],
    title: ["Sollecito di pagamento", "Secondo sollecito", "Ultimo avviso"],
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    intro: [
      "un promemoria gentile — la fattura per le recensioni che abbiamo rimosso è ancora aperta. Salda entro le prossime 48 ore.",
      "la tua fattura per le recensioni rimosse non è ancora stata saldata. Provvedi entro 48 ore per evitare ulteriori passi.",
      "nonostante i nostri solleciti, la fattura per le recensioni rimosse risulta ancora non pagata. Questo è l'ultimo avviso.",
    ],
    billH: "Fattura aperta",
    billLine: (n, per, total) => `${n} recension${n === 1 ? "e rimossa" : "i rimosse"} × ${per} = ${total}`,
    deadline: "Il pagamento è dovuto entro 48 ore.",
    warnH: "Cosa succede in mancanza di pagamento",
    warn: (n) => `Se il pagamento non ci perverrà in tempo, annulleremo la rimozione e ${n === 1 ? "la recensione verrà ripubblicata" : `le ${n} recensioni verranno ripubblicate`}. Il credito potrà inoltre essere affidato a un'agenzia di recupero.`,
    cta: "Paga ora in sicurezza",
    close: "Hai già pagato? Allora ignora questo sollecito — grazie!",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: ["Betalingsherinnering — je factuur staat open", "Tweede herinnering — factuur nog niet betaald", "Laatste aanmaning — de verwijderde reviews komen weer online"],
    preview: ["Een herinnering over je openstaande factuur.", "Je factuur staat nog open — betaal binnen 48 uur.", "Laatste aanmaning: onbetaalde reviews worden opnieuw geplaatst."],
    title: ["Betalingsherinnering", "Tweede herinnering", "Laatste aanmaning"],
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    intro: [
      "een vriendelijke herinnering — de factuur voor de reviews die we hebben verwijderd staat nog open. Betaal binnen de komende 48 uur.",
      "je factuur voor de verwijderde reviews is nog niet betaald. Betaal binnen 48 uur om verdere stappen te voorkomen.",
      "ondanks onze herinneringen is je factuur voor de verwijderde reviews nog niet betaald. Dit is onze laatste aanmaning.",
    ],
    billH: "Openstaande factuur",
    billLine: (n, per, total) => `${n} verwijderde review${n === 1 ? "" : "s"} × ${per} = ${total}`,
    deadline: "Betaling dient binnen 48 uur te gebeuren.",
    warnH: "Wat er gebeurt zonder betaling",
    warn: (n) => `Ontvangen we je betaling niet op tijd, dan draaien we de verwijdering terug en ${n === 1 ? "wordt de review opnieuw geplaatst" : `worden de ${n} reviews opnieuw geplaatst`}. De vordering kan bovendien worden overgedragen aan een incassobureau.`,
    cta: "Nu veilig betalen",
    close: "Al betaald? Negeer deze herinnering dan — bedankt!",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: ["Lembrete de pagamento — a tua fatura está em aberto", "Segundo lembrete — fatura ainda por pagar", "Aviso final — as avaliações removidas voltam a ficar online"],
    preview: ["Um lembrete sobre a tua fatura em aberto.", "A tua fatura continua em aberto — paga em 48 horas.", "Aviso final: avaliações não pagas serão republicadas."],
    title: ["Lembrete de pagamento", "Segundo lembrete", "Aviso final"],
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    intro: [
      "um lembrete amigável — a fatura das avaliações que removemos continua em aberto. Regulariza nas próximas 48 horas.",
      "a tua fatura das avaliações removidas continua por pagar. Regulariza em 48 horas para evitar mais passos.",
      "apesar dos nossos lembretes, a fatura das avaliações removidas continua por pagar. Este é o aviso final.",
    ],
    billH: "Fatura em aberto",
    billLine: (n, per, total) => `${n} avaliaç${n === 1 ? "ão removida" : "ões removidas"} × ${per} = ${total}`,
    deadline: "O pagamento é devido no prazo de 48 horas.",
    warnH: "O que acontece sem pagamento",
    warn: (n) => `Se o pagamento não chegar a tempo, revertemos a remoção e ${n === 1 ? "a avaliação volta a ser publicada" : `as ${n} avaliações voltam a ser publicadas`}. A dívida poderá ainda ser entregue a uma agência de cobrança.`,
    cta: "Pagar agora em segurança",
    close: "Já pagaste? Então ignora este lembrete — obrigado!",
    signoff: "Um abraço,",
  },
  ja: {
    subject: ["お支払いのお願い — ご請求が未払いです", "再度のお願い — ご請求がまだ未払いです", "最終通知 — 削除した口コミが再び公開されます"],
    preview: ["未払いのご請求についてのお知らせです。", "ご請求はまだ未払いです。48時間以内にお支払いください。", "最終通知：未払いの口コミは再公開されます。"],
    title: ["お支払いのお願い", "再度のお願い", "最終通知"],
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    intro: [
      "削除した口コミのご請求がまだ未払いとなっております。48時間以内にお支払いをお願いいたします。",
      "削除した口コミのご請求がまだ確認できておりません。次の手続きを避けるため、48時間以内にお支払いください。",
      "度重なるご連絡にもかかわらず、削除した口コミのご請求が未払いのままです。これが最終のご通知です。",
    ],
    billH: "未払いのご請求",
    billLine: (n, per, total) => `削除済み${n}件 × ${per} = ${total}`,
    deadline: "お支払い期日は48時間以内です。",
    warnH: "お支払いがない場合",
    warn: (n) => `期日までにお支払いが確認できない場合、削除を取り消し、口コミ${n}件を再び公開します。また、債権を回収会社に引き渡す場合があります。`,
    cta: "今すぐ安全に支払う",
    close: "行き違いでお支払い済みの場合は、本通知を無視してください。ありがとうございます。",
    signoff: "何卒よろしくお願いいたします。",
  },
  sv: {
    subject: ["Betalningspåminnelse — din faktura är obetald", "Andra påminnelsen — fakturan är fortfarande obetald", "Sista påminnelse — de borttagna omdömena publiceras igen"],
    preview: ["En påminnelse om din obetalda faktura.", "Din faktura är fortfarande obetald — betala inom 48 timmar.", "Sista påminnelse: obetalda omdömen publiceras igen."],
    title: ["Betalningspåminnelse", "Andra påminnelsen", "Sista påminnelse"],
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    intro: [
      "en vänlig påminnelse — fakturan för omdömena vi tog bort är fortfarande obetald. Betala inom de närmaste 48 timmarna.",
      "din faktura för de borttagna omdömena är fortfarande obetald. Betala inom 48 timmar för att undvika ytterligare åtgärder.",
      "trots våra påminnelser är fakturan för de borttagna omdömena fortfarande obetald. Detta är vår sista påminnelse.",
    ],
    billH: "Obetald faktura",
    billLine: (n, per, total) => `${n} borttagna omdömen × ${per} = ${total}`,
    deadline: "Betalning ska ske inom 48 timmar.",
    warnH: "Vad som händer utan betalning",
    warn: (n) => `Om vi inte får din betalning i tid återställer vi borttagningen och ${n === 1 ? "omdömet publiceras igen" : `de ${n} omdömena publiceras igen`}. Fordran kan dessutom lämnas till inkasso.`,
    cta: "Betala säkert nu",
    close: "Har du redan betalat? Bortse då från denna påminnelse — tack!",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: ["Betalingspåmindelse — din faktura er ubetalt", "Anden påmindelse — fakturaen er stadig ubetalt", "Sidste varsel — de fjernede anmeldelser offentliggøres igen"],
    preview: ["En påmindelse om din ubetalte faktura.", "Din faktura er stadig ubetalt — betal inden for 48 timer.", "Sidste varsel: ubetalte anmeldelser offentliggøres igen."],
    title: ["Betalingspåmindelse", "Anden påmindelse", "Sidste varsel"],
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    intro: [
      "en venlig påmindelse — fakturaen for de anmeldelser, vi fjernede, er stadig ubetalt. Betal venligst inden for de næste 48 timer.",
      "din faktura for de fjernede anmeldelser er stadig ubetalt. Betal inden for 48 timer for at undgå yderligere skridt.",
      "trods vores påmindelser er fakturaen for de fjernede anmeldelser stadig ubetalt. Dette er vores sidste varsel.",
    ],
    billH: "Ubetalt faktura",
    billLine: (n, per, total) => `${n} fjernede anmeldelser × ${per} = ${total}`,
    deadline: "Betaling forfalder inden for 48 timer.",
    warnH: "Hvad der sker uden betaling",
    warn: (n) => `Modtager vi ikke din betaling til tiden, annullerer vi fjernelsen, og ${n === 1 ? "anmeldelsen offentliggøres igen" : `de ${n} anmeldelser offentliggøres igen`}. Kravet kan desuden overdrages til inkasso.`,
    cta: "Betal sikkert nu",
    close: "Har du allerede betalt? Så se bort fra denne påmindelse — tak!",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: ["Betalingspåminnelse — fakturaen din er ubetalt", "Andre påminnelse — fakturaen er fortsatt ubetalt", "Siste varsel — de fjernede omtalene publiseres igjen"],
    preview: ["En påminnelse om den ubetalte fakturaen din.", "Fakturaen din er fortsatt ubetalt — betal innen 48 timer.", "Siste varsel: ubetalte omtaler publiseres igjen."],
    title: ["Betalingspåminnelse", "Andre påminnelse", "Siste varsel"],
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    intro: [
      "en vennlig påminnelse — fakturaen for omtalene vi fjernet er fortsatt ubetalt. Vennligst betal innen de neste 48 timene.",
      "fakturaen din for de fjernede omtalene er fortsatt ubetalt. Betal innen 48 timer for å unngå ytterligere skritt.",
      "til tross for våre påminnelser er fakturaen for de fjernede omtalene fortsatt ubetalt. Dette er vårt siste varsel.",
    ],
    billH: "Ubetalt faktura",
    billLine: (n, per, total) => `${n} fjernede omtaler × ${per} = ${total}`,
    deadline: "Betaling forfaller innen 48 timer.",
    warnH: "Hva som skjer uten betaling",
    warn: (n) => `Dersom vi ikke mottar betalingen din i tide, reverserer vi fjerningen og ${n === 1 ? "omtalen publiseres igjen" : `de ${n} omtalene publiseres igjen`}. Kravet kan i tillegg bli overført til inkasso.`,
    cta: "Betal trygt nå",
    close: "Har du allerede betalt? Se da bort fra denne påminnelsen — takk!",
    signoff: "Vennlig hilsen,",
  },
};

const clampStage = (s: unknown): number => ([1, 2, 3].includes(Number(s)) ? Number(s) : 1);

export function subject(p: MahnungReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject[clampStage(p.stage) - 1];
}

const PAY_VIA: Record<string, string> = {"de": "Bitte zahle über die {m}-Zahlungsdaten, die wir dir geschickt haben – mit 10 % Rabatt: {t}.", "en": "Please pay via the {m} payment details we sent you – with your 10% discount: {t}.", "es": "Paga a través de los datos de pago de {m} que te enviamos, con tu 10 % de descuento: {t}.", "fr": "Merci de payer via les coordonnées de paiement {m} que nous t’avons envoyées – avec ta remise de 10 % : {t}.", "it": "Paga tramite i dati di pagamento {m} che ti abbiamo inviato, con il tuo sconto del 10%: {t}.", "nl": "Betaal via de {m}-betaalgegevens die we je hebben gestuurd – met je 10% korting: {t}.", "pt": "Paga através dos dados de pagamento {m} que te enviámos – com o teu desconto de 10%: {t}.", "ja": "お送りした{m}のお支払い情報からお支払いください（10%割引後：{t}）。", "sv": "Betala via {m}-betalningsuppgifterna vi skickade till dig – med din rabatt på 10 %: {t}.", "da": "Betal via de {m}-betalingsoplysninger, vi sendte dig – med din rabat på 10 %: {t}.", "no": "Betal via {m}-betalingsopplysningene vi sendte deg – med rabatten din på 10 %: {t}."};

export default function MahnungReviews({ lang = "en", name = "", removedItems = [], removedUrls = [], per = "", total = "", payUrl = "", orderId = "", stage = 1, method, payTotal = "", _overrides }: MahnungReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const list: MahnungReviewRef[] = removedItems.length ? removedItems : removedUrls.map((u) => ({ url: u }));
  const n = list.length || 1;
  const s = clampStage(stage);
  const i = s - 1;
  return (
    <EmailShell preview={t.preview[i]} title={t.title[i]} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.intro[i]}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.billH}</span><br />
        <strong>{t.billLine(n, per, total)}</strong><br />
        <strong>{t.deadline}</strong>
      </NoteBox>

      {s === 3 ? (
        <DangerBox>
          <strong>{t.warnH}</strong><br />
          {t.warn(n)}
        </DangerBox>
      ) : null}

      {method ? <P><strong style={{ color: brand.tintText }}>{(PAY_VIA[lang] || PAY_VIA.en).replace("{m}", method === "wise" ? "Wise" : "PayPal").replace("{t}", payTotal || total)}</strong></P>
        : payUrl ? <CtaButton variant="pay" href={payUrl} full>{t.cta}</CtaButton> : null}

      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
