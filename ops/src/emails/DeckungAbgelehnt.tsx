/* Mail „Deckungsprüfung abgelehnt" (10.11.2026). Kunde hat eine Zahlungsart hinterlegt, die Reservierung über den
   Auftragswert wurde abgelehnt → Zahlungsart nicht gespeichert, Auftrag startet noch nicht. Kunde soll genau wissen,
   warum und was er tun kann. Max. 1 Mail je 30 Min. (autopay.ts). */
import * as React from "react";
import { EmailShell, P, CtaButton, NoteBox, brand, type MailLang } from "./components";

export type CovProps = { lang?: string; name?: string; amount: string; pm?: string; reason: string; dashUrl: string; kind?: "reviews" | "profile" };

interface L { subject: string; title: string; hi: (n: string) => string; p1: (a: string, pm: string) => string; why: string; p2: string; todo: string; t1: string; t2: string; t3: string; btn: string; close: string; signoff: string }
const pmT = (pm: string, fb: string) => (pm && pm !== "—" ? pm : fb);

export const T: Record<string, L> = {
  en: { subject: "Your card was declined – nothing was charged", title: "Card declined – nothing charged", hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (a, pm) => `when you added your payment method (${pmT(pm, "your card")}), we ran a quick check whether the order amount of ${a} is covered. Your bank declined this check, so the payment method was not saved.`,
    why: "Reason:", p2: "Nothing was charged and nothing is reserved on your card. Your order hasn't started yet – we start as soon as a payment method has been added successfully.",
    todo: "What you can do:", t1: "Add a different card or PayPal in your dashboard (takes a minute).", t2: "Or ask your bank to allow the payment, then try the same card again.", t3: "You're still only charged once a removal is actually completed.",
    btn: "Add payment method", close: "Questions? Just reply to this email.", signoff: "Warm regards," },
  de: { subject: "Ihre Karte wurde abgelehnt – es wurde nichts abgebucht", title: "Karte abgelehnt – nichts abgebucht", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (a, pm) => `beim Hinterlegen Ihrer Zahlungsart (${pmT(pm, "Ihre Karte")}) haben wir kurz geprüft, ob der Auftragswert von ${a} gedeckt ist. Ihre Bank hat diese Prüfung abgelehnt, daher wurde die Zahlungsart nicht gespeichert.`,
    why: "Grund:", p2: "Es wurde nichts abgebucht und nichts auf Ihrer Karte reserviert. Ihr Auftrag ist noch nicht gestartet – wir legen los, sobald eine Zahlungsart erfolgreich hinterlegt ist.",
    todo: "Was Sie tun können:", t1: "Eine andere Karte oder PayPal im Dashboard hinterlegen (dauert eine Minute).", t2: "Oder Ihre Bank bitten, die Zahlung freizugeben, und dieselbe Karte nochmal versuchen.", t3: "Abgebucht wird weiterhin erst, wenn eine Löschung tatsächlich abgeschlossen ist.",
    btn: "Zahlungsart hinterlegen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen" },
  es: { subject: "Tu tarjeta fue rechazada – no se ha cobrado nada", title: "Tarjeta rechazada – nada cobrado", hi: (n) => (n ? `Hola ${n}:` : "Hola:"),
    p1: (a, pm) => `al guardar tu método de pago (${pmT(pm, "tu tarjeta")}), comprobamos brevemente si el importe del pedido de ${a} está cubierto. Tu banco rechazó esta comprobación, así que el método de pago no se guardó.`,
    why: "Motivo:", p2: "No se ha cobrado ni reservado nada en tu tarjeta. Tu pedido aún no ha empezado: empezamos en cuanto se guarde correctamente un método de pago.",
    todo: "Qué puedes hacer:", t1: "Guardar otra tarjeta o PayPal en tu panel (tarda un minuto).", t2: "O pedir a tu banco que autorice el pago y volver a intentarlo con la misma tarjeta.", t3: "Solo se cobra cuando una eliminación se ha completado de verdad.",
    btn: "Añadir método de pago", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo," },
  fr: { subject: "Ta carte a été refusée – rien n'a été débité", title: "Carte refusée – rien débité", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    p1: (a, pm) => `lors de l'enregistrement de ton moyen de paiement (${pmT(pm, "ta carte")}), nous avons vérifié rapidement si le montant de la commande de ${a} est couvert. Ta banque a refusé cette vérification, le moyen de paiement n'a donc pas été enregistré.`,
    why: "Motif :", p2: "Rien n'a été débité ni réservé sur ta carte. Ta commande n'a pas encore démarré – nous commençons dès qu'un moyen de paiement est enregistré avec succès.",
    todo: "Ce que tu peux faire :", t1: "Enregistrer une autre carte ou PayPal dans ton espace (une minute).", t2: "Ou demander à ta banque d'autoriser le paiement, puis réessayer avec la même carte.", t3: "Tu n'es toujours débité qu'une fois une suppression réellement terminée.",
    btn: "Ajouter un moyen de paiement", close: "Des questions ? Réponds simplement à cet e-mail.", signoff: "Bien cordialement," },
  it: { subject: "La tua carta è stata rifiutata – non è stato addebitato nulla", title: "Carta rifiutata – nessun addebito", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (a, pm) => `quando hai salvato il tuo metodo di pagamento (${pmT(pm, "la tua carta")}), abbiamo verificato brevemente se l'importo dell'ordine di ${a} è coperto. La tua banca ha rifiutato la verifica, quindi il metodo di pagamento non è stato salvato.`,
    why: "Motivo:", p2: "Non è stato addebitato né riservato nulla sulla tua carta. Il tuo ordine non è ancora partito: iniziamo appena un metodo di pagamento viene salvato correttamente.",
    todo: "Cosa puoi fare:", t1: "Salvare un'altra carta o PayPal nella tua dashboard (un minuto).", t2: "Oppure chiedere alla tua banca di autorizzare il pagamento e riprovare con la stessa carta.", t3: "L'addebito avviene comunque solo a rimozione effettivamente completata.",
    btn: "Aggiungi metodo di pagamento", close: "Domande? Rispondi a questa e-mail.", signoff: "Cordiali saluti," },
  nl: { subject: "Uw kaart is geweigerd – er is niets afgeschreven", title: "Kaart geweigerd – niets afgeschreven", hi: (n) => (n ? `Beste ${n},` : "Beste klant,"),
    p1: (a, pm) => `bij het opslaan van uw betaalmethode (${pmT(pm, "uw kaart")}) hebben we kort gecontroleerd of het orderbedrag van ${a} gedekt is. Uw bank heeft deze controle geweigerd, daarom is de betaalmethode niet opgeslagen.`,
    why: "Reden:", p2: "Er is niets afgeschreven en niets gereserveerd op uw kaart. Uw order is nog niet gestart – we beginnen zodra een betaalmethode succesvol is opgeslagen.",
    todo: "Wat u kunt doen:", t1: "Een andere kaart of PayPal opslaan in uw dashboard (duurt een minuut).", t2: "Of uw bank vragen de betaling toe te staan en dezelfde kaart opnieuw proberen.", t3: "Er wordt nog steeds pas afgeschreven als een verwijdering echt is afgerond.",
    btn: "Betaalmethode toevoegen", close: "Vragen? Beantwoord gewoon deze e-mail.", signoff: "Met vriendelijke groet," },
  pt: { subject: "O teu cartão foi recusado – nada foi cobrado", title: "Cartão recusado – nada cobrado", hi: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (a, pm) => `ao guardar o teu método de pagamento (${pmT(pm, "o teu cartão")}), verificámos rapidamente se o valor da encomenda de ${a} está coberto. O teu banco recusou esta verificação, por isso o método de pagamento não foi guardado.`,
    why: "Motivo:", p2: "Nada foi cobrado nem reservado no teu cartão. A tua encomenda ainda não começou – começamos assim que um método de pagamento for guardado com sucesso.",
    todo: "O que podes fazer:", t1: "Guardar outro cartão ou PayPal no teu painel (demora um minuto).", t2: "Ou pedir ao teu banco para autorizar o pagamento e tentar de novo com o mesmo cartão.", t3: "Continuas a pagar só quando uma remoção estiver realmente concluída.",
    btn: "Adicionar método de pagamento", close: "Dúvidas? Responde a este e-mail.", signoff: "Com os melhores cumprimentos," },
  ja: { subject: "カードが承認されませんでした – 請求は発生していません", title: "カード不承認 – 請求なし", hi: (n) => (n ? `${n} 様` : "お客様"),
    p1: (a, pm) => `お支払い方法（${pmT(pm, "カード")}）のご登録時に、ご注文金額${a}が利用可能か簡単な確認を行いましたが、カード会社により承認されなかったため、お支払い方法は保存されていません。`,
    why: "理由：", p2: "請求も金額の確保も行われていません。ご注文はまだ開始されておらず、お支払い方法の登録が完了次第すぐに開始します。",
    todo: "対処方法：", t1: "ダッシュボードで別のカードまたはPayPalをご登録ください（1分ほどで完了します）。", t2: "またはカード会社に決済の許可を依頼し、同じカードで再度お試しください。", t3: "請求は引き続き、削除が実際に完了した場合のみ行われます。",
    btn: "お支払い方法を登録", close: "ご不明点はこのメールにご返信ください。", signoff: "よろしくお願いいたします。" },
  sv: { subject: "Ditt kort nekades – inget har dragits", title: "Kortet nekades – inget dras", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (a, pm) => `när du sparade din betalningsmetod (${pmT(pm, "ditt kort")}) gjorde vi en snabb kontroll av om ordervärdet på ${a} täcks. Din bank nekade kontrollen, därför sparades betalningsmetoden inte.`,
    why: "Orsak:", p2: "Inget har dragits och inget är reserverat på ditt kort. Din order har inte startat än – vi börjar så snart en betalningsmetod har sparats.",
    todo: "Det här kan du göra:", t1: "Spara ett annat kort eller PayPal i din översikt (tar en minut).", t2: "Eller be din bank att godkänna betalningen och försök igen med samma kort.", t3: "Du debiteras fortfarande först när en borttagning faktiskt är klar.",
    btn: "Lägg till betalningsmetod", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar," },
  da: { subject: "Dit kort blev afvist – der er ikke trukket noget", title: "Kort afvist – intet trukket", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (a, pm) => `da du gemte din betalingsmetode (${pmT(pm, "dit kort")}), tjekkede vi kort, om ordreværdien på ${a} er dækket. Din bank afviste tjekket, derfor blev betalingsmetoden ikke gemt.`,
    why: "Årsag:", p2: "Der er ikke trukket eller reserveret noget på dit kort. Din ordre er ikke startet endnu – vi går i gang, så snart en betalingsmetode er gemt.",
    todo: "Det kan du gøre:", t1: "Gem et andet kort eller PayPal i dit dashboard (tager et minut).", t2: "Eller bed din bank om at godkende betalingen, og prøv det samme kort igen.", t3: "Du betaler stadig først, når en fjernelse faktisk er gennemført.",
    btn: "Tilføj betalingsmetode", close: "Spørgsmål? Svar blot på denne e-mail.", signoff: "Venlig hilsen" },
  no: { subject: "Kortet ditt ble avvist – ingenting er trukket", title: "Kort avvist – ingenting trukket", hi: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (a, pm) => `da du lagret betalingsmetoden din (${pmT(pm, "kortet ditt")}), sjekket vi kort om ordreverdien på ${a} er dekket. Banken din avviste sjekken, derfor ble betalingsmetoden ikke lagret.`,
    why: "Årsak:", p2: "Ingenting er trukket eller reservert på kortet ditt. Ordren din har ikke startet ennå – vi starter så snart en betalingsmetode er lagret.",
    todo: "Dette kan du gjøre:", t1: "Lagre et annet kort eller PayPal i dashbordet ditt (tar et minutt).", t2: "Eller be banken din godkjenne betalingen, og prøv det samme kortet igjen.", t3: "Du belastes fortsatt først når en fjerning faktisk er fullført.",
    btn: "Legg til betalingsmetode", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen" },
};

const tOf = (lang?: string) => T[String(lang || "en").slice(0, 2)] || T.en;
export const deckungAbgelehntSubject = (p: CovProps) => tOf(p.lang).subject;

export default function DeckungAbgelehnt(p: CovProps) {
  const l = T[String(p.lang || "en").slice(0, 2)] ? String(p.lang).slice(0, 2) : "en";
  const t = T[l];
  return (
    <EmailShell preview={t.subject} title={t.title} lang={l as MailLang}>
      <P><strong>{t.hi(String(p.name || "").trim())}</strong></P>
      <P>{t.p1(p.amount, String(p.pm || ""))}</P>
      <NoteBox><strong>{t.why}</strong> {p.reason}</NoteBox>
      <P>{t.p2}</P>
      <P><strong>{t.todo}</strong><br />• {t.t1}<br />• {t.t2}<br /><span style={{ color: brand.muted }}>{t.t3}</span></P>
      <div style={{ textAlign: "center", margin: "14px 0 10px" }}><CtaButton href={p.dashUrl}>{t.btn}</CtaButton></div>
      <P><span style={{ color: brand.muted }}>{t.close}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
