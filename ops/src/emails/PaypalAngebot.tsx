/* Template: PayPal-Vorteil / PayPal offer (persönliches Angebot NACH der Löschung).
   NUR außerhalb DACH einsetzbar (im Admin für lang="de" ausgeblendet + serverseitig
   abgelehnt) – immer in der Landessprache, bewusst im lockeren „du"-Ton.
   Kernbotschaft: bei PayPal-Zahlung 10 % Rabatt; bei laufendem Schutz (Abo) alles
   zu EINEM Preis zusammenfassen + 2 Monate gratis. Gilt NUR bei PayPal, sonst wie
   ursprünglich beauftragt. Betrag/Link folgen in einer separaten Zahlungslink-Mail. */
import * as React from "react";
import { EmailShell, P, NoteBox, brand, type MailLang } from "./components";

export interface PaypalAngebotProps {
  lang?: MailLang;
  /** Vorname/Name des Kunden für die persönliche Anrede. */
  name?: string;
  /** Kunde hat einen laufenden Schutz (Abo: monthly/monitor) → Bündel-Angebot + 2 Monate gratis. */
  hasSub?: boolean;
  /** Im Admin bearbeitete Text-Overrides (überschreiben die Default-Texte pro Feld). */
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: string; preview: string; title: string;
  greeting: (n: string) => string;
  thanks: string; deleted: string; offerIntro: string;
  offerMain: string; offerSub: string; caveat: string; close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  de: {
    subject: "Update zu deinem Business-Profil / Dein PayPal-Vorteil",
    preview: "Dein Profil ist gelöscht – und ein PayPal-Vorteil für dich.",
    title: "Erledigt – und ein Vorteil für dich",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    thanks: "vielen Dank noch einmal für deine Bestellung!",
    deleted: "Wir haben dein Business-Profil soeben erfolgreich gelöscht.",
    offerIntro: "Zur Zahlung habe ich noch ein tolles Angebot für dich: Wenn du dich für eine Zahlung per PayPal entscheidest, sparen wir Transaktionsgebühren – und diese Ersparnis gebe ich sehr gerne direkt an dich weiter.",
    offerMain: "Mit PayPal: 10 % Rabatt auf deine Bestellung.",
    offerSub: "Und da du dich für einen laufenden Schutz entschieden hast, fasse ich alles zu einem einzigen Preis zusammen und schenke dir 2 Monate Schutz gratis dazu.",
    caveat: "Damit es klar ist: Dieser Vorteil gilt nur bei Zahlung per PayPal – andernfalls bleibt es bei dem, was du ursprünglich beauftragt hast. Ganz ohne Druck, wie es dir am liebsten ist. :)",
    close: "Gib mir einfach kurz Bescheid, ob das für dich passt – ich schicke dir dann den passenden Zahlungslink in einer separaten E-Mail.",
    signoff: "Viele Grüße",
  },
  en: {
    subject: "Update on your business profile / your PayPal perk",
    preview: "Your profile is deleted – plus a PayPal perk for you.",
    title: "All done – and a perk for you",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    thanks: "thanks again for your order!",
    deleted: "We’ve just successfully deleted your business profile.",
    offerIntro: "About the payment, I have a nice offer for you: if you choose to pay via PayPal, we save on transaction fees – and I’d love to pass those savings straight on to you.",
    offerMain: "With PayPal: 10% off your order.",
    offerSub: "And since you went for ongoing protection, I’ll bundle everything into one single price and add 2 months of protection for free.",
    caveat: "Just so it’s clear: this perk applies only if you pay via PayPal – otherwise everything stays exactly as you originally ordered. No pressure at all, whatever suits you best. :)",
    close: "Just let me know if that works for you – I’ll then send you the matching payment link in a separate email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: "Novedad sobre tu perfil de empresa / Tu ventaja con PayPal",
    preview: "Tu perfil está eliminado – y una ventaja con PayPal para ti.",
    title: "Listo – y una ventaja para ti",
    greeting: (n) => (n ? `Hola ${n}:` : "Hola:"),
    thanks: "¡muchas gracias de nuevo por tu pedido!",
    deleted: "Acabamos de eliminar correctamente tu perfil de empresa.",
    offerIntro: "Sobre el pago, tengo una buena oferta para ti: si decides pagar con PayPal, ahorramos comisiones de transacción – y ese ahorro te lo quiero devolver directamente.",
    offerMain: "Con PayPal: 10 % de descuento en tu pedido.",
    offerSub: "Y como elegiste una protección continua, lo reúno todo en un único precio y te regalo 2 meses de protección gratis.",
    caveat: "Para que quede claro: esta ventaja solo se aplica si pagas con PayPal – de lo contrario, todo queda tal y como lo pediste originalmente. Sin ninguna presión, como tú prefieras. :)",
    close: "Solo dime si te encaja – y te enviaré el enlace de pago correspondiente en un correo aparte.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: "Du nouveau sur ta fiche d’établissement / Ton avantage PayPal",
    preview: "Ta fiche est supprimée – et un avantage PayPal pour toi.",
    title: "C’est fait – et un avantage pour toi",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    thanks: "merci encore pour ta commande !",
    deleted: "Nous venons de supprimer ta fiche d’établissement avec succès.",
    offerIntro: "Concernant le paiement, j’ai une belle offre pour toi : si tu choisis de payer via PayPal, nous économisons des frais de transaction – et cette économie, j’ai très envie de te la reverser directement.",
    offerMain: "Avec PayPal : 10 % de réduction sur ta commande.",
    offerSub: "Et comme tu as opté pour une protection continue, je regroupe tout en un seul prix et je t’offre en plus 2 mois de protection gratuits.",
    caveat: "Pour que ce soit clair : cet avantage s’applique uniquement en cas de paiement via PayPal – sinon, tout reste exactement comme tu l’as commandé au départ. Sans aucune pression, comme tu préfères. :)",
    close: "Dis-moi simplement si ça te convient – je t’enverrai alors le lien de paiement correspondant dans un e-mail séparé.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: "Aggiornamento sul tuo profilo aziendale / Il tuo vantaggio PayPal",
    preview: "Il tuo profilo è stato eliminato – e un vantaggio PayPal per te.",
    title: "Fatto – e un vantaggio per te",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    thanks: "grazie ancora per il tuo ordine!",
    deleted: "Abbiamo appena eliminato con successo il tuo profilo aziendale.",
    offerIntro: "Riguardo al pagamento, ho una bella offerta per te: se scegli di pagare con PayPal, risparmiamo sulle commissioni di transazione – e questo risparmio te lo voglio girare direttamente.",
    offerMain: "Con PayPal: 10% di sconto sul tuo ordine.",
    offerSub: "E dato che hai scelto una protezione continua, riunisco tutto in un unico prezzo e ti regalo 2 mesi di protezione gratis.",
    caveat: "Per essere chiari: questo vantaggio vale solo se paghi con PayPal – altrimenti resta tutto esattamente come hai ordinato all’inizio. Senza alcuna pressione, come preferisci. :)",
    close: "Fammi solo sapere se ti va bene – ti invierò poi il link di pagamento in un’e-mail separata.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: "Update over je bedrijfsprofiel / Jouw PayPal-voordeel",
    preview: "Je profiel is verwijderd – en een PayPal-voordeel voor jou.",
    title: "Klaar – en een voordeel voor jou",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    thanks: "nogmaals bedankt voor je bestelling!",
    deleted: "We hebben je bedrijfsprofiel zojuist succesvol verwijderd.",
    offerIntro: "Over de betaling heb ik nog een mooi aanbod voor je: als je kiest voor betaling via PayPal, besparen we transactiekosten – en die besparing geef ik graag direct aan je door.",
    offerMain: "Met PayPal: 10% korting op je bestelling.",
    offerSub: "En omdat je voor doorlopende bescherming hebt gekozen, breng ik alles samen onder één prijs en geef ik je er 2 maanden bescherming gratis bij.",
    caveat: "Even voor de duidelijkheid: dit voordeel geldt alleen bij betaling via PayPal – anders blijft alles precies zoals je het oorspronkelijk hebt besteld. Helemaal zonder druk, net wat jij wilt. :)",
    close: "Laat me gewoon even weten of dit voor je werkt – dan stuur ik je de bijbehorende betaallink in een aparte e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: "Novidade sobre o teu perfil de empresa / A tua vantagem PayPal",
    preview: "O teu perfil foi eliminado – e uma vantagem PayPal para ti.",
    title: "Feito – e uma vantagem para ti",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    thanks: "obrigado mais uma vez pela tua encomenda!",
    deleted: "Acabámos de eliminar com sucesso o teu perfil de empresa.",
    offerIntro: "Quanto ao pagamento, tenho uma boa oferta para ti: se optares por pagar com PayPal, poupamos comissões de transação – e essa poupança quero passá-la diretamente para ti.",
    offerMain: "Com PayPal: 10% de desconto na tua encomenda.",
    offerSub: "E como escolheste uma proteção contínua, junto tudo num único preço e ofereço-te ainda 2 meses de proteção grátis.",
    caveat: "Só para que fique claro: esta vantagem aplica-se apenas se pagares com PayPal – caso contrário, fica tudo exatamente como encomendaste inicialmente. Sem qualquer pressão, como preferires. :)",
    close: "Diz-me só se te serve – e envio-te depois o link de pagamento correspondente num e-mail à parte.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: "ビジネスプロフィールのお知らせ / PayPal特典のご案内",
    preview: "プロフィールを削除しました – PayPalのお得な特典もあります。",
    title: "完了しました – そしてお得な特典を",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    thanks: "この度はご注文いただき、あらためてありがとうございます!",
    deleted: "先ほど、お客様のビジネスプロフィールを無事に削除いたしました。",
    offerIntro: "お支払いについて、うれしいご提案があります。PayPalでお支払いいただくと決済手数料を節約できるので、その分を直接お客様に還元させていただきます。",
    offerMain: "PayPalでのお支払いで、ご注文が10％割引。",
    offerSub: "さらに継続的な保護もお選びいただいているので、すべてを1つの料金にまとめ、2か月分の保護を無料でお付けします。",
    caveat: "念のためお伝えすると、この特典はPayPalでのお支払いの場合のみ適用されます。それ以外の場合は、最初にご注文いただいた内容のままです。もちろん無理にとは申しません、ご都合の良いように。:)",
    close: "ご希望に合いそうでしたら、ひとことお知らせください。別のメールでお支払いリンクをお送りします。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: "Uppdatering om din företagsprofil / Din PayPal-förmån",
    preview: "Din profil är borttagen – och en PayPal-förmån till dig.",
    title: "Klart – och en förmån till dig",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    thanks: "tack igen för din beställning!",
    deleted: "Vi har precis tagit bort din företagsprofil.",
    offerIntro: "När det gäller betalningen har jag ett fint erbjudande till dig: om du väljer att betala med PayPal sparar vi transaktionsavgifter – och den besparingen vill jag gärna ge direkt till dig.",
    offerMain: "Med PayPal: 10 % rabatt på din beställning.",
    offerSub: "Och eftersom du valde löpande skydd samlar jag allt till ett enda pris och bjuder dig dessutom på 2 månaders skydd gratis.",
    caveat: "Bara så att det är tydligt: den här förmånen gäller endast vid betalning med PayPal – annars är allt precis som du ursprungligen beställde. Helt utan press, precis som du vill. :)",
    close: "Säg bara till om det passar dig – så skickar jag betalningslänken i ett separat mejl.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Opdatering om din virksomhedsprofil / Din PayPal-fordel",
    preview: "Din profil er slettet – og en PayPal-fordel til dig.",
    title: "Klaret – og en fordel til dig",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    thanks: "tak igen for din bestilling!",
    deleted: "Vi har netop slettet din virksomhedsprofil.",
    offerIntro: "Med hensyn til betalingen har jeg et godt tilbud til dig: hvis du vælger at betale med PayPal, sparer vi transaktionsgebyrer – og den besparelse vil jeg gerne give direkte videre til dig.",
    offerMain: "Med PayPal: 10 % rabat på din bestilling.",
    offerSub: "Og da du valgte løbende beskyttelse, samler jeg det hele til én samlet pris og giver dig oven i købet 2 måneders beskyttelse gratis.",
    caveat: "Bare så det er klart: denne fordel gælder kun ved betaling med PayPal – ellers er alt præcis som du oprindeligt bestilte. Helt uden pres, lige som du har lyst. :)",
    close: "Sig bare til, om det passer dig – så sender jeg dig betalingslinket i en separat mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Oppdatering om bedriftsprofilen din / Din PayPal-fordel",
    preview: "Profilen din er slettet – og en PayPal-fordel til deg.",
    title: "Ferdig – og en fordel til deg",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    thanks: "takk igjen for bestillingen din!",
    deleted: "Vi har akkurat slettet bedriftsprofilen din.",
    offerIntro: "Når det gjelder betalingen, har jeg et fint tilbud til deg: hvis du velger å betale med PayPal, sparer vi transaksjonsgebyrer – og den besparelsen vil jeg gjerne gi direkte videre til deg.",
    offerMain: "Med PayPal: 10 % rabatt på bestillingen din.",
    offerSub: "Og siden du valgte løpende beskyttelse, samler jeg alt til én enkelt pris og gir deg i tillegg 2 måneder beskyttelse gratis.",
    caveat: "Bare så det er klart: denne fordelen gjelder kun ved betaling med PayPal – ellers er alt akkurat slik du opprinnelig bestilte. Helt uten press, akkurat som du vil. :)",
    close: "Bare si fra om det passer for deg – så sender jeg deg betalingslenken i en egen e-post.",
    signoff: "Vennlig hilsen,",
  },
};

export function subject(p: PaypalAngebotProps = {}): string {
  return (T[p.lang || "en"] || T.en).subject;
}

export default function PaypalAngebot({ lang = "en", name = "", hasSub = false, _overrides }: PaypalAngebotProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const who = (name || "").trim();
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting(who)}</strong></P>
      <P>{t.thanks}</P>
      <P>{t.deleted}</P>
      <P>{t.offerIntro}</P>

      <NoteBox>
        <strong style={{ color: brand.tintText, fontSize: 15 }}>{t.offerMain}</strong>
        {hasSub ? <><br /><br />{t.offerSub}</> : null}
      </NoteBox>

      <P muted>{t.caveat}</P>
      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
