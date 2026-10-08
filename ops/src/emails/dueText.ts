/* Zahlungsziel abgelaufen: Betreff + Einleitung für die Mahnung (Profil, Stripe) und die PayPal-/Wise-Mahnung.
 * {d} = Datum des Zahlungsziels in der Sprache des Kunden. Gesendet automatisch, sobald das im Admin gesetzte
 * Zahlungsziel ohne Zahlung abläuft (server.ts → Zahlungsziel-Worker). */
type L = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
const T: Record<L, [string, string]> = {
  de: ["Zahlungsziel abgelaufen – Ihre Rechnung ist noch offen", "das vereinbarte Zahlungsziel ({d}) ist abgelaufen, Ihre Zahlung ist bei uns aber noch nicht eingegangen. Bitte begleichen Sie den offenen Betrag umgehend."],
  en: ["Payment deadline passed – your invoice is still open", "the agreed payment deadline ({d}) has passed, but we haven't received your payment yet. Please settle the outstanding amount right away."],
  es: ["Plazo de pago vencido: su factura sigue pendiente", "el plazo de pago acordado ({d}) ha vencido y todavía no hemos recibido su pago. Le rogamos que abone el importe pendiente de inmediato."],
  fr: ["Échéance de paiement dépassée – votre facture est toujours ouverte", "l’échéance de paiement convenue ({d}) est dépassée et nous n’avons pas encore reçu votre paiement. Merci de régler le montant dû sans délai."],
  it: ["Termine di pagamento scaduto – la sua fattura è ancora aperta", "il termine di pagamento concordato ({d}) è scaduto e non abbiamo ancora ricevuto il suo pagamento. La preghiamo di saldare subito l’importo dovuto."],
  nl: ["Betalingstermijn verstreken – uw factuur staat nog open", "de afgesproken betalingstermijn ({d}) is verstreken, maar we hebben uw betaling nog niet ontvangen. Wij verzoeken u het openstaande bedrag direct te voldoen."],
  pt: ["Prazo de pagamento expirado – a sua fatura continua em aberto", "o prazo de pagamento acordado ({d}) expirou e ainda não recebemos o seu pagamento. Pedimos que liquide o valor em dívida de imediato."],
  ja: ["お支払い期限超過のお知らせ", "お約束のお支払い期限（{d}）を過ぎましたが、まだお支払いを確認できておりません。至急お支払いくださいますようお願いいたします。"],
  sv: ["Betalningsfristen har gått ut – din faktura är fortfarande obetald", "den överenskomna betalningsfristen ({d}) har gått ut, men vi har ännu inte fått din betalning. Vänligen betala det utestående beloppet omgående."],
  da: ["Betalingsfristen er overskredet – din faktura er stadig åben", "den aftalte betalingsfrist ({d}) er overskredet, men vi har endnu ikke modtaget din betaling. Betal venligst det skyldige beløb med det samme."],
  no: ["Betalingsfristen er utløpt – fakturaen din er fortsatt åpen", "den avtalte betalingsfristen ({d}) er utløpt, men vi har ennå ikke mottatt betalingen din. Vennligst betal det utestående beløpet umiddelbart."],
};
const LOC: Record<L, string> = { de: "de-AT", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ja: "ja-JP", sv: "sv-SE", da: "da-DK", no: "nb-NO" };
const pick = (l?: string): L => ((l && l in T ? l : "en") as L);
/** Datum (ISO) in der Sprache des Kunden, z. B. „8. Oktober 2026". */
export function dueDateText(iso: string | undefined, lang?: string): string {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d.getTime())) return String(iso);
  try { return d.toLocaleDateString(LOC[pick(lang)], { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Vienna" }); } catch { return d.toISOString().slice(0, 10); }
}
export const dueSubject = (lang?: string) => T[pick(lang)][0];
export const dueIntro = (lang: string | undefined, iso: string) => T[pick(lang)][1].replace("{d}", dueDateText(iso, lang));

const BOX: Record<L, string> = {
  de: "Bitte begleichen Sie den offenen Betrag jetzt über den Button unten.",
  en: "Please pay the outstanding amount now using the button below.",
  es: "Le rogamos que abone ahora el importe pendiente con el botón de abajo.",
  fr: "Merci de régler dès maintenant le montant dû via le bouton ci-dessous.",
  it: "La preghiamo di saldare ora l’importo dovuto tramite il pulsante qui sotto.",
  nl: "Voldoe het openstaande bedrag nu via de knop hieronder.",
  pt: "Pedimos que pague agora o valor em dívida através do botão abaixo.",
  ja: "下のボタンから、今すぐ未払い金額をお支払いください。",
  sv: "Vänligen betala det utestående beloppet nu via knappen nedan.",
  da: "Betal venligst det skyldige beløb nu via knappen nedenfor.",
  no: "Vennligst betal det utestående beløpet nå via knappen nedenfor.",
};
/** Hinweisbox der Stripe-Mahnung bei abgelaufenem Zahlungsziel (statt „innerhalb von 48 Stunden fällig“). */
export const dueBox = (lang?: string) => BOX[pick(lang)];
