/* Template: Zahlung erfolgreich + Empfehlungs-Gutschein / Payment successful + referral gift (DE/EN). */
import * as React from "react";
import { EmailShell, P, A, GiftCard, brand } from "./components";
import { Section, Text, Heading } from "@react-email/components";

export interface ZahlungsbestaetigungGutscheinProps {
  lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
  /** Link zum Rechnungs-Download */
  invoiceUrl?: string;
  /** Persönlicher Empfehlungslink (mit der Kunden-E-Mail) */
  friendUrl?: string;
}

const T = {
  de: {
    title: "Zahlung erfolgreich ✓",
    preview: "Vielen Dank für Ihre Zahlung – Ihre Rechnung & 50 € Empfehlungs-Gutschein.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre Zahlung. Die Rechnung finden Sie im Anhang sowie hier als Download (",
    p1Link: "Rechnung herunterladen",
    p1b: ").",
    amount: "€50",
    giftH: "Empfehlen Sie uns und erhalten Sie 50 € Amazon-Gutschein!",
    giftP: "Gerne geben wir Ihnen etwas zurück und schenken Ihnen 50 € Gutschein bei amazon.de für jeden Freund oder Kollegen, der bei uns durch Sie beauftragt.",
    giftBold: "Geben Sie diesen Personen einfach folgenden Link:",
    subject: "Zahlung erfolgreich – Ihre Rechnung",
  },
  en: {
    title: "Payment Successful ✓",
    preview: "Thank you for your payment – your invoice & $50 referral gift card.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your payment. Please find the invoice attached or ",
    p1Link: "download it here",
    p1b: ".",
    amount: "$50",
    giftH: "Recommend us and receive a $50 Amazon gift card!",
    giftP: "We’d love to give back to you! Receive a $50 voucher for amazon.com for every friend who hires us through your referral.",
    giftBold: "Simply share the following link:",
    subject: "Payment successful – your invoice",
  },
  es: {
    title: "Pago realizado con éxito ✓",
    preview: "Gracias por su pago: su factura y un vale de recomendación de 50 €.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su pago. Encontrará la factura adjunta y también aquí para descargar (",
    p1Link: "descargar factura",
    p1b: ").",
    amount: "€50",
    giftH: "¡Recomiéndenos y reciba un vale de Amazon de 50 €!",
    giftP: "Con mucho gusto le devolvemos algo y le regalamos un vale de 50 € en amazon.de por cada amigo o colega que nos contrate gracias a usted.",
    giftBold: "Solo tiene que facilitar a estas personas el siguiente enlace:",
    subject: "Pago realizado con éxito: su factura",
  },
  fr: {
    title: "Paiement réussi ✓",
    preview: "Merci pour votre paiement : votre facture et un bon de parrainage de 50 €.",
    greeting: "Madame, Monsieur,",
    p1a: "merci beaucoup pour votre paiement. Vous trouverez la facture en pièce jointe ainsi qu'ici en téléchargement (",
    p1Link: "télécharger la facture",
    p1b: ").",
    amount: "€50",
    giftH: "Recommandez-nous et recevez un bon Amazon de 50 € !",
    giftP: "Nous avons à cœur de vous remercier et vous offrons un bon de 50 € sur amazon.de pour chaque ami ou collègue qui fait appel à nous grâce à vous.",
    giftBold: "Il vous suffit de transmettre le lien suivant à ces personnes :",
    subject: "Paiement réussi : votre facture",
  },
  it: {
    title: "Pagamento riuscito ✓",
    preview: "Grazie per il suo pagamento: la sua fattura e un buono di referral da 50 €.",
    greeting: "Gentili Signore e Signori,",
    p1a: "grazie mille per il suo pagamento. Trova la fattura in allegato e qui per il download (",
    p1Link: "scarica la fattura",
    p1b: ").",
    amount: "€50",
    giftH: "Ci consigli e riceva un buono Amazon da 50 €!",
    giftP: "Siamo lieti di ricambiare e le regaliamo un buono da 50 € su amazon.de per ogni amico o collega che ci affida un incarico grazie a lei.",
    giftBold: "Basta che fornisca a queste persone il seguente link:",
    subject: "Pagamento riuscito: la sua fattura",
  },
  nl: {
    title: "Betaling geslaagd ✓",
    preview: "Bedankt voor uw betaling – uw factuur & 50 € aanbevelingsbon.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw betaling. U vindt de factuur in de bijlage en hier om te downloaden (",
    p1Link: "factuur downloaden",
    p1b: ").",
    amount: "€50",
    giftH: "Beveel ons aan en ontvang een Amazon-cadeaubon van 50 €!",
    giftP: "Wij geven u graag iets terug en schenken u een cadeaubon van 50 € bij amazon.de voor elke vriend of collega die ons via u inschakelt.",
    giftBold: "Geef deze personen eenvoudig de volgende link:",
    subject: "Betaling geslaagd – uw factuur",
  },
  pt: {
    title: "Pagamento efetuado com sucesso ✓",
    preview: "Obrigado pelo seu pagamento – a sua fatura e um vale de recomendação de 50 €.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pelo seu pagamento. Encontra a fatura em anexo e também aqui para descarregar (",
    p1Link: "descarregar fatura",
    p1b: ").",
    amount: "€50",
    giftH: "Recomende-nos e receba um vale da Amazon de 50 €!",
    giftP: "Teremos todo o gosto em retribuir e oferecer-lhe um vale de 50 € na amazon.de por cada amigo ou colega que nos contrate graças a si.",
    giftBold: "Basta facultar a estas pessoas o seguinte link:",
    subject: "Pagamento efetuado com sucesso: a sua fatura",
  },
  ja: {
    title: "お支払いが完了しました ✓",
    preview: "お支払いいただきありがとうございます。請求書と50 €の紹介ギフトカードをお送りします。",
    greeting: "ご担当者様",
    p1a: "お支払いいただき誠にありがとうございます。請求書は添付のほか、こちらからもダウンロードいただけます（",
    p1Link: "請求書をダウンロード",
    p1b: "）。",
    amount: "€50",
    giftH: "ご紹介で50 €分のAmazonギフトカードを差し上げます！",
    giftP: "ささやかながら感謝の気持ちとして、お客様のご紹介で当社にご依頼いただいたご友人や同僚お一人につき、amazon.deで使える50 €分のギフトカードを差し上げます。",
    giftBold: "そうした方々に、次のリンクをお伝えいただくだけです：",
    subject: "お支払いが完了しました – 請求書",
  },
  sv: {
    title: "Betalningen lyckades ✓",
    preview: "Tack för din betalning – din faktura och ett presentkort för rekommendation på 50 €.",
    greeting: "Hej,",
    p1a: "tack så mycket för din betalning. Fakturan finns som bilaga och här för nedladdning (",
    p1Link: "ladda ner faktura",
    p1b: ").",
    amount: "€50",
    giftH: "Rekommendera oss och få ett Amazon-presentkort på 50 €!",
    giftP: "Vi vill gärna ge något tillbaka och skänker dig ett presentkort på 50 € hos amazon.de för varje vän eller kollega som anlitar oss tack vare dig.",
    giftBold: "Ge helt enkelt dessa personer följande länk:",
    subject: "Betalningen lyckades – din faktura",
  },
  da: {
    title: "Betalingen blev gennemført ✓",
    preview: "Tak for din betaling – din faktura og et anbefalingsgavekort på 50 €.",
    greeting: "Kære kunde,",
    p1a: "mange tak for din betaling. Du finder fakturaen vedhæftet og her til download (",
    p1Link: "download faktura",
    p1b: ").",
    amount: "€50",
    giftH: "Anbefal os, og modtag et Amazon-gavekort på 50 €!",
    giftP: "Vi giver gerne noget tilbage og forærer dig et gavekort på 50 € hos amazon.de for hver ven eller kollega, der giver os en opgave takket være dig.",
    giftBold: "Giv blot disse personer følgende link:",
    subject: "Betalingen blev gennemført – din faktura",
  },
  no: {
    title: "Betalingen var vellykket ✓",
    preview: "Takk for betalingen din – fakturaen din og et anbefalingsgavekort på 50 €.",
    greeting: "Hei,",
    p1a: "tusen takk for betalingen din. Du finner fakturaen vedlagt og her for nedlasting (",
    p1Link: "last ned faktura",
    p1b: ").",
    amount: "€50",
    giftH: "Anbefal oss, og motta et Amazon-gavekort på 50 €!",
    giftP: "Vi gir gjerne noe tilbake og gir deg et gavekort på 50 € hos amazon.de for hver venn eller kollega som gir oss et oppdrag takket være deg.",
    giftBold: "Bare gi disse personene følgende lenke:",
    subject: "Betalingen var vellykket – fakturaen din",
  },
};

export function subject(p: ZahlungsbestaetigungGutscheinProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function ZahlungsbestaetigungGutschein({
  lang = "de",
  invoiceUrl = "https://rapid-remove.com",
  friendUrl = "https://www.rapid-remove.com/de?friend={{email}}",
}: ZahlungsbestaetigungGutscheinProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<A href={invoiceUrl}>{t.p1Link}</A>{t.p1b}</P>

      {/* Empfehlungs-Block */}
      <Section style={{ background: brand.tint, border: `1px solid ${brand.tintBorder}`, borderRadius: 16, padding: "20px 22px", margin: "8px 0 4px", textAlign: "center" as const }}>
        <GiftCard amount={t.amount} />
        <Heading as="h2" style={{ margin: "4px 0 10px", fontSize: 18, fontWeight: 800, lineHeight: "1.3", color: brand.ink }}>
          {t.giftH}
        </Heading>
        <Text style={{ margin: "0 0 10px", fontSize: 14, lineHeight: "1.6", color: brand.text }}>{t.giftP}</Text>
        <Text style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: brand.text }}>{t.giftBold}</Text>
        <Text style={{ margin: 0, fontSize: 14, wordBreak: "break-all" as const }}>
          <A href={friendUrl}>{friendUrl}</A>
        </Text>
      </Section>
    </EmailShell>
  );
}
