/* Vorauszahlung per PayPal/Wise (25.11.2026, Maximilian): 12,5 % Rabatt, Kunde zahlt VOR dem Start.
   - PrepayBox: Block in der Auftragsbestätigung (Betrag, PayPal-Button bzw. Wise-Konto, Rückerstattung bei Misserfolg)
   - VorauszahlungErhalten: Mail „Zahlung erhalten – wir starten" (Admin „Zahlung erhalten → Auftrag starten")
   - PAID: Texte für die Löschbestätigung eines vorausbezahlten Auftrags (PaymentLink, Variante paidVia) */
import * as React from "react";
import { Section } from "@react-email/components";
import { EmailShell, P, NoteBox, CtaButton, brand } from "./components";
import { VIA, fmtPct } from "./LoeschbestaetigungReviews";

type Lang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";

export interface PrepayInfo {
  method: "paypal" | "wise";
  /** rabattierter Betrag, vorformatiert */
  amount: string;
  /** regulärer Betrag ohne Rabatt, vorformatiert */
  regular: string;
  pct?: number;
  /** paypal.me-Link mit Betrag */
  ppUrl?: string;
  /** Wise-Kontodaten, je Zeile „Bezeichnung: Wert" */
  bankLines?: string[];
  /** Auftragsnummer als Verwendungszweck */
  ref?: string;
}

interface PrepayText { intro: [string, string, string]; title: string; amount: string; pp: string; wise: string; ref: string; refund: string; preview: string }
export const PREPAY: Record<Lang, PrepayText> = {
  de: { intro: ["vielen Dank für Ihren Auftrag. ", "Wir starten, sobald Ihre Zahlung eingegangen ist", "."], title: "Ihre Vorauszahlung · {p} % Rabatt", amount: "Zu zahlen: {t} (statt {r})", pp: "Zahlen Sie jetzt mit einem Klick per PayPal:", wise: "Bitte überweisen Sie {t} per Wise auf folgendes Konto:", ref: "Verwendungszweck: {id}", refund: "Klappt die Löschung nicht, bekommen Sie den vollen Betrag zurück.", preview: "Bitte zahlen Sie {t} vorab – wir starten sofort nach Zahlungseingang." },
  en: { intro: ["thank you for your order. ", "We start as soon as your payment has arrived", "."], title: "Your advance payment · {p}% discount", amount: "Amount due: {t} (instead of {r})", pp: "Pay now with one click via PayPal:", wise: "Please transfer {t} via Wise to the following account:", ref: "Reference: {id}", refund: "If the removal isn't successful, you'll get the full amount back.", preview: "Please pay {t} in advance – we start right after your payment arrives." },
  es: { intro: ["gracias por tu pedido. ", "Empezamos en cuanto recibamos tu pago", "."], title: "Tu pago por adelantado · {p} % de descuento", amount: "Importe: {t} (en lugar de {r})", pp: "Paga ahora con un clic por PayPal:", wise: "Transfiere {t} por Wise a la siguiente cuenta:", ref: "Concepto: {id}", refund: "Si la eliminación no funciona, te devolvemos el importe completo.", preview: "Paga {t} por adelantado: empezamos en cuanto recibamos tu pago." },
  fr: { intro: ["merci pour ta commande. ", "Nous commençons dès réception de ton paiement", "."], title: "Ton paiement anticipé · {p} % de réduction", amount: "Montant : {t} (au lieu de {r})", pp: "Paie maintenant en un clic via PayPal :", wise: "Merci de virer {t} via Wise sur le compte suivant :", ref: "Référence : {id}", refund: "Si la suppression n’aboutit pas, tu es intégralement remboursé.", preview: "Merci de payer {t} à l’avance – nous commençons dès réception du paiement." },
  it: { intro: ["grazie per il tuo ordine. ", "Iniziamo non appena riceviamo il tuo pagamento", "."], title: "Il tuo pagamento anticipato · sconto del {p} %", amount: "Importo: {t} (invece di {r})", pp: "Paga ora con un clic tramite PayPal:", wise: "Trasferisci {t} tramite Wise sul seguente conto:", ref: "Causale: {id}", refund: "Se la rimozione non va a buon fine, ti rimborsiamo l’intero importo.", preview: "Paga {t} in anticipo: iniziamo appena arriva il pagamento." },
  nl: { intro: ["bedankt voor uw opdracht. ", "We starten zodra uw betaling binnen is", "."], title: "Uw vooruitbetaling · {p} % korting", amount: "Te betalen: {t} (in plaats van {r})", pp: "Betaal nu met één klik via PayPal:", wise: "Maak {t} via Wise over naar de volgende rekening:", ref: "Omschrijving: {id}", refund: "Lukt de verwijdering niet, dan krijgt u het volledige bedrag terug.", preview: "Betaal {t} vooraf – we starten direct na ontvangst van uw betaling." },
  pt: { intro: ["obrigado pela tua encomenda. ", "Começamos assim que o teu pagamento chegar", "."], title: "O teu pagamento antecipado · {p} % de desconto", amount: "Valor: {t} (em vez de {r})", pp: "Paga agora com um clique pelo PayPal:", wise: "Transfere {t} por Wise para a seguinte conta:", ref: "Referência: {id}", refund: "Se a remoção não resultar, devolvemos-te o valor total.", preview: "Paga {t} antecipadamente – começamos assim que o pagamento chegar." },
  ja: { intro: ["ご注文ありがとうございます。", "ご入金を確認次第、作業を開始します", "。"], title: "前払い · {p}%割引", amount: "お支払額：{t}（通常 {r}）", pp: "PayPalでワンクリックでお支払いいただけます：", wise: "{t}を以下の口座へWiseでお振込みください：", ref: "参照番号：{id}", refund: "削除できなかった場合は、全額を返金いたします。", preview: "{t}を前払いでお支払いください。ご入金確認後すぐに開始します。" },
  sv: { intro: ["tack för din beställning. ", "Vi börjar så snart din betalning har kommit in", "."], title: "Din förskottsbetalning · {p} % rabatt", amount: "Att betala: {t} (i stället för {r})", pp: "Betala nu med ett klick via PayPal:", wise: "Överför {t} via Wise till följande konto:", ref: "Referens: {id}", refund: "Lyckas inte borttagningen får du tillbaka hela beloppet.", preview: "Betala {t} i förskott – vi börjar direkt när betalningen har kommit in." },
  da: { intro: ["tak for din bestilling. ", "Vi går i gang, så snart din betaling er modtaget", "."], title: "Din forudbetaling · {p} % rabat", amount: "At betale: {t} (i stedet for {r})", pp: "Betal nu med ét klik via PayPal:", wise: "Overfør {t} via Wise til følgende konto:", ref: "Reference: {id}", refund: "Lykkes sletningen ikke, får du hele beløbet tilbage.", preview: "Betal {t} forud – vi går i gang, så snart betalingen er modtaget." },
  no: { intro: ["takk for bestillingen din. ", "Vi starter så snart betalingen din har kommet inn", "."], title: "Din forhåndsbetaling · {p} % rabatt", amount: "Å betale: {t} (i stedet for {r})", pp: "Betal nå med ett klikk via PayPal:", wise: "Overfør {t} via Wise til følgende konto:", ref: "Referanse: {id}", refund: "Lykkes ikke slettingen, får du hele beløpet tilbake.", preview: "Betal {t} på forhånd – vi starter så snart betalingen har kommet inn." },
};

const fill = (s: string, lang: string, p: PrepayInfo) =>
  s.replace("{t}", p.amount).replace("{r}", p.regular).replace("{p}", fmtPct(lang, p.pct)).replace("{id}", p.ref || "").replace("{m}", p.method === "wise" ? "Wise" : "PayPal");

/** Block in der Auftragsbestätigung. */
export function PrepayBox({ lang, p }: { lang: string; p: PrepayInfo }) {
  const t = PREPAY[lang as Lang] || PREPAY.en;
  const v = VIA[lang] || VIA.en;
  return (
    <>
      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{fill(t.title, lang, p)}</span><br />
        <strong>{fill(t.amount, lang, p)}</strong><br />
        {p.method === "wise" ? (
          <>
            {fill(t.wise, lang, p)}<br />
            {(p.bankLines || []).map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}
            {/* Verwendungszweck bewusst NICHT (Dashboard sagt „leer lassen“ – Zuordnung über Betrag/Namen) */}
          </>
        ) : null}
      </NoteBox>
      {p.method === "paypal" && p.ppUrl ? (
        <>
          <P>{t.pp}</P>
          <Section style={{ textAlign: "center", margin: "6px 0 12px" }}>
            <CtaButton variant="pay" href={p.ppUrl} full>{v.ppBtn || "PayPal"}</CtaButton>
          </Section>
          <P><strong>{v.pp2}</strong></P>
        </>
      ) : null}
      <P muted>{t.refund}</P>
    </>
  );
}
export const prepayIntro = (lang: string) => (PREPAY[lang as Lang] || PREPAY.en).intro;
export const prepayPreview = (lang: string, p: PrepayInfo) => fill((PREPAY[lang as Lang] || PREPAY.en).preview, lang, p);

/* ---- Mail „Zahlung erhalten – wir starten" ---- */
interface RecvText { title: string; preview: string; greeting: string; got: string; start: string; refund: string; outro: string; subject: string }
const RECV: Record<Lang, RecvText> = {
  de: { title: "Zahlung erhalten ✓", preview: "Ihre Zahlung ist da – wir starten jetzt mit der Löschung.", greeting: "Sehr geehrte Damen und Herren,", got: "vielen Dank – Ihre Zahlung über {t} per {m} ist bei uns eingegangen.", start: "Wir starten jetzt mit der Löschung Ihres Google-Unternehmensprofils.", refund: "Klappt die Löschung nicht, bekommen Sie den vollen Betrag zurück.", outro: "Wir melden uns, sobald Ihr Profil gelöscht ist. Bei Fragen antworten Sie einfach auf diese E-Mail.", subject: "Zahlung erhalten – wir starten mit der Löschung" },
  en: { title: "Payment received ✓", preview: "Your payment has arrived – we're starting the removal now.", greeting: "Dear Sir or Madam,", got: "thank you – your payment of {t} via {m} has arrived.", start: "We're now starting the removal of your Google Business Profile.", refund: "If the removal isn't successful, you'll get the full amount back.", outro: "We'll be in touch as soon as your profile has been removed. If you have any questions, simply reply to this email.", subject: "Payment received – we're starting the removal" },
  es: { title: "Pago recibido ✓", preview: "Hemos recibido tu pago: empezamos ahora con la eliminación.", greeting: "Hola:", got: "gracias: hemos recibido tu pago de {t} por {m}.", start: "Empezamos ahora con la eliminación de tu Perfil de Empresa de Google.", refund: "Si la eliminación no funciona, te devolvemos el importe completo.", outro: "Te avisaremos en cuanto tu perfil esté eliminado. Si tienes preguntas, responde a este correo.", subject: "Pago recibido: empezamos con la eliminación" },
  fr: { title: "Paiement reçu ✓", preview: "Ton paiement est arrivé – nous commençons la suppression.", greeting: "Bonjour,", got: "merci – nous avons bien reçu ton paiement de {t} via {m}.", start: "Nous commençons maintenant la suppression de ta fiche d’établissement Google.", refund: "Si la suppression n’aboutit pas, tu es intégralement remboursé.", outro: "Nous te recontactons dès que ta fiche est supprimée. Pour toute question, réponds simplement à cet e-mail.", subject: "Paiement reçu – nous commençons la suppression" },
  it: { title: "Pagamento ricevuto ✓", preview: "Il tuo pagamento è arrivato: iniziamo ora la rimozione.", greeting: "Ciao,", got: "grazie: abbiamo ricevuto il tuo pagamento di {t} tramite {m}.", start: "Iniziamo ora la rimozione del tuo Profilo dell’attività su Google.", refund: "Se la rimozione non va a buon fine, ti rimborsiamo l’intero importo.", outro: "Ti contatteremo appena il profilo sarà rimosso. Per domande, rispondi semplicemente a questa email.", subject: "Pagamento ricevuto: iniziamo la rimozione" },
  nl: { title: "Betaling ontvangen ✓", preview: "Uw betaling is binnen – we starten nu met de verwijdering.", greeting: "Geachte heer/mevrouw,", got: "bedankt – uw betaling van {t} via {m} is binnen.", start: "We starten nu met de verwijdering van uw Google-bedrijfsprofiel.", refund: "Lukt de verwijdering niet, dan krijgt u het volledige bedrag terug.", outro: "We laten van ons horen zodra uw profiel verwijderd is. Vragen? Beantwoord gewoon deze e-mail.", subject: "Betaling ontvangen – we starten met de verwijdering" },
  pt: { title: "Pagamento recebido ✓", preview: "O teu pagamento chegou – começamos agora a remoção.", greeting: "Olá,", got: "obrigado – recebemos o teu pagamento de {t} via {m}.", start: "Começamos agora a remoção do teu Perfil da Empresa no Google.", refund: "Se a remoção não resultar, devolvemos-te o valor total.", outro: "Damos notícias assim que o teu perfil estiver removido. Se tiveres dúvidas, responde a este e-mail.", subject: "Pagamento recebido – começamos a remoção" },
  ja: { title: "ご入金を確認しました ✓", preview: "ご入金を確認しました。削除作業を開始します。", greeting: "ご担当者様", got: "{m}による{t}のご入金を確認いたしました。ありがとうございます。", start: "Googleビジネスプロフィールの削除作業を開始します。", refund: "削除できなかった場合は、全額を返金いたします。", outro: "プロフィールの削除が完了しましたらご連絡いたします。ご不明な点は、このメールにご返信ください。", subject: "ご入金確認 – 削除作業を開始します" },
  sv: { title: "Betalning mottagen ✓", preview: "Din betalning har kommit in – vi börjar med borttagningen nu.", greeting: "Hej,", got: "tack – din betalning på {t} via {m} har kommit in.", start: "Vi börjar nu med borttagningen av din Google-företagsprofil.", refund: "Lyckas inte borttagningen får du tillbaka hela beloppet.", outro: "Vi hör av oss så snart profilen är borttagen. Har du frågor svarar du bara på det här mejlet.", subject: "Betalning mottagen – vi börjar med borttagningen" },
  da: { title: "Betaling modtaget ✓", preview: "Din betaling er modtaget – vi går i gang med sletningen nu.", greeting: "Kære kunde,", got: "tak – din betaling på {t} via {m} er modtaget.", start: "Vi går nu i gang med at slette din Google-virksomhedsprofil.", refund: "Lykkes sletningen ikke, får du hele beløbet tilbage.", outro: "Vi vender tilbage, så snart profilen er slettet. Har du spørgsmål, så svar blot på denne e-mail.", subject: "Betaling modtaget – vi går i gang med sletningen" },
  no: { title: "Betaling mottatt ✓", preview: "Betalingen din har kommet inn – vi starter slettingen nå.", greeting: "Hei,", got: "takk – betalingen din på {t} via {m} har kommet inn.", start: "Vi starter nå slettingen av Google-bedriftsprofilen din.", refund: "Lykkes ikke slettingen, får du hele beløpet tilbake.", outro: "Vi tar kontakt så snart profilen er slettet. Har du spørsmål, kan du bare svare på denne e-posten.", subject: "Betaling mottatt – vi starter slettingen" },
};

export interface VorauszahlungErhaltenProps { lang?: Lang; anrede?: string; amount?: string; method?: "paypal" | "wise" }
export function vorauszahlungErhaltenSubject(p: VorauszahlungErhaltenProps = {}): string { return (RECV[p.lang || "en"] || RECV.en).subject; }
export default function VorauszahlungErhalten({ lang = "en", anrede, amount = "", method = "paypal" }: VorauszahlungErhaltenProps = {}) {
  const t = RECV[lang] || RECV.en;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{anrede || t.greeting}</strong></P>
      <P>{t.got.replace("{t}", amount).replace("{m}", method === "wise" ? "Wise" : "PayPal")}</P>
      <P><strong>{t.start}</strong></P>
      <P muted>{t.refund}</P>
      <P muted>{t.outro}</P>
    </EmailShell>
  );
}

/* ---- Löschbestätigung eines vorausbezahlten Auftrags (PaymentLink, paidVia) ---- */
export const PAID: Record<Lang, { total: string; note: string }> = {
  de: { total: "Bezahlt", note: "Bereits per {m} bezahlt – Sie müssen nichts weiter tun. Vielen Dank!" },
  en: { total: "Paid", note: "Already paid via {m} – there's nothing more for you to do. Thank you!" },
  es: { total: "Pagado", note: "Ya pagado por {m}: no tienes que hacer nada más. ¡Gracias!" },
  fr: { total: "Payé", note: "Déjà payé via {m} – tu n’as plus rien à faire. Merci !" },
  it: { total: "Pagato", note: "Già pagato tramite {m}: non devi fare altro. Grazie!" },
  nl: { total: "Betaald", note: "Al betaald via {m} – u hoeft niets meer te doen. Bedankt!" },
  pt: { total: "Pago", note: "Já pago via {m} – não tens de fazer mais nada. Obrigado!" },
  ja: { total: "お支払い済み", note: "{m}でお支払い済みです。これ以上のお手続きは不要です。ありがとうございました。" },
  sv: { total: "Betalt", note: "Redan betalt via {m} – du behöver inte göra något mer. Tack!" },
  da: { total: "Betalt", note: "Allerede betalt via {m} – du skal ikke gøre mere. Tak!" },
  no: { total: "Betalt", note: "Allerede betalt via {m} – du trenger ikke gjøre noe mer. Takk!" },
};
