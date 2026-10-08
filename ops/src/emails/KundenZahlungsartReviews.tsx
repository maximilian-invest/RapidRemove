/* Mail „Zahlungsart fehlt noch – an Ihren Bewertungen wird nicht gearbeitet" (08.10.2026).
   Geht an Kunden, deren Auftrag (bzw. Nachbestellung) auf die hinterlegte Zahlungsart wartet (payGate). Mehrmals täglich
   (pgRemind.ts), bis die Zahlungsart da ist. Listet die wartenden Bewertungen bzw. das Profil. reminder=true → ab der 2. Mail. */
import * as React from "react";
import { EmailShell, P, CtaButton, NoteBox, Bullets, brand, type MailLang } from "./components";

export type PgItem = { name?: string | null; text?: string | null; url?: string | null; profile?: string | null };

interface L {
  subject: string; subjectR: string; title: string; titleR: string; hi: (n: string) => string;
  p1: (n: number) => string; p1prof: string; p1R: string;
  p2: string; btn: string; note: string; close: string; signoff: string; profile: string; review: string;
  pushT: string; pushB: string;
  fS: string; fT: string; fP1: string; fP2: string; lS: string; lT: string; lP1: string; lP2: string; cS: string; cT: string; cP1: string; cP2: string; cBtn: string;
}

export const T: Record<string, L> = {
  de: {
    fS: "Letzte Erinnerung: Ihr Auftrag wird am {date} storniert",
    fT: "Ihr Auftrag ist pausiert",
    fP1: "seit {days} Tagen fehlt Ihre Zahlungsart – deshalb haben wir an Folgendem nicht gearbeitet:",
    fP2: "Ihr Auftrag bleibt bis zum {date} für Sie reserviert. Hinterlegen Sie bis dahin Ihre Zahlungsart, starten wir sofort – abgebucht wird weiterhin erst bei erfolgreicher Löschung. Andernfalls wird der Auftrag am {date} automatisch storniert; es entstehen Ihnen keine Kosten.",
    lS: "Noch 3 Tage: Ihr Auftrag wird am {date} storniert",
    lT: "Ihr Auftrag läuft bald ab",
    lP1: "ohne Zahlungsart können wir an Folgendem nicht arbeiten:",
    lP2: "Am {date} wird Ihr Auftrag automatisch storniert. Möchten Sie die Löschung noch? Dann hinterlegen Sie jetzt Ihre Zahlungsart – abgebucht wird nichts, bevor eine Bewertung tatsächlich gelöscht ist.",
    cS: "Ihr Auftrag wurde storniert",
    cT: "Auftrag storniert",
    cP1: "da keine Zahlungsart hinterlegt wurde, haben wir Folgendes storniert:",
    cP2: "Es entstehen Ihnen keine Kosten. Möchten Sie die Bewertungen doch noch löschen lassen? Sie können jederzeit neu beauftragen – oder antworten Sie einfach auf diese E-Mail, dann reaktivieren wir Ihren Auftrag.",
    cBtn: "Neu beauftragen",
    subject: "Ihre Bewertungen werden noch nicht bearbeitet – bitte Zahlungsart hinterlegen", subjectR: "Erinnerung: Zahlungsart noch nicht hinterlegt – Ihre Bewertungen warten",
    title: "Wir können noch nicht starten", titleR: "Immer noch keine Zahlungsart hinterlegt", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (n) => `an ${n === 1 ? "Ihrer Bewertung" : "Ihren Bewertungen"} wird derzeit noch nicht gearbeitet:`,
    p1prof: "an Ihrem Auftrag wird derzeit noch nicht gearbeitet:",
    p1R: "Ihre Zahlungsart ist immer noch nicht hinterlegt – deshalb liegt Folgendes weiterhin still:",
    p2: "Bitte hinterlegen Sie schnellstmöglich Ihre Zahlungsart in Ihrem Dashboard. Keine Sorge: Dabei wird nichts abgebucht – erst wenn eine Bewertung tatsächlich gelöscht ist. Ohne hinterlegte Zahlungsart können wir aber nicht mit der Bearbeitung beginnen.",
    btn: "Zahlungsart jetzt hinterlegen", note: "Dauert nur 1 Minute · sicher über Stripe · jederzeit änderbar",
    close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen", profile: "Google-Profil", review: "Bewertung",
    pushT: "Zahlungsart fehlt noch", pushB: "An Ihren Bewertungen wird noch nicht gearbeitet – bitte hinterlegen (es wird nichts abgebucht).",
  },
  en: {
    fS: "Final reminder: your order will be cancelled on {date}",
    fT: "Your order is on hold",
    fP1: "your payment method has been missing for {days} days – so we haven't worked on the following:",
    fP2: "Your order stays reserved for you until {date}. Add your payment method by then and we start right away – you're still only charged once a removal has succeeded. Otherwise the order will be cancelled automatically on {date}, at no cost to you.",
    lS: "3 days left: your order will be cancelled on {date}",
    lT: "Your order expires soon",
    lP1: "without a payment method we can't work on the following:",
    lP2: "Your order will be cancelled automatically on {date}. Still want the removal? Then add your payment method now – nothing is charged before a review has actually been removed.",
    cS: "Your order has been cancelled",
    cT: "Order cancelled",
    cP1: "since no payment method was added, we've cancelled the following:",
    cP2: "There's no cost to you. Still want the reviews removed? You can order again anytime – or simply reply to this email and we'll reactivate your order.",
    cBtn: "Order again",
    subject: "Your reviews aren't being worked on yet – please add a payment method", subjectR: "Reminder: payment method still missing – your reviews are waiting",
    title: "We can't start yet", titleR: "Still no payment method saved", hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n) => `we're not working on ${n === 1 ? "your review" : "your reviews"} yet:`,
    p1prof: "we're not working on your order yet:",
    p1R: "Your payment method still hasn't been saved – so the following is still on hold:",
    p2: "Please add your payment method in your dashboard as soon as possible. Don't worry: nothing is charged – only once a review has actually been removed. But without a saved payment method we can't start working on it.",
    btn: "Add payment method now", note: "Takes 1 minute · secured by Stripe · change it anytime",
    close: "Questions? Just reply to this email.", signoff: "Warm regards,", profile: "Google profile", review: "Review",
    pushT: "Payment method missing", pushB: "Your reviews aren't being worked on yet – please add one (nothing is charged).",
  },
  es: {
    fS: "Último aviso: tu pedido se cancelará el {date}",
    fT: "Tu pedido está en pausa",
    fP1: "hace {days} días que falta tu método de pago, así que no hemos trabajado en lo siguiente:",
    fP2: "Tu pedido queda reservado hasta el {date}. Si añades tu método de pago antes, empezamos enseguida; solo se cobra cuando la eliminación funciona. Si no, el pedido se cancelará automáticamente el {date}, sin ningún coste para ti.",
    lS: "Quedan 3 días: tu pedido se cancelará el {date}",
    lT: "Tu pedido caduca pronto",
    lP1: "sin método de pago no podemos trabajar en lo siguiente:",
    lP2: "Tu pedido se cancelará automáticamente el {date}. ¿Sigues queriendo la eliminación? Añade ahora tu método de pago: no se cobra nada antes de que una reseña se haya eliminado de verdad.",
    cS: "Tu pedido ha sido cancelado",
    cT: "Pedido cancelado",
    cP1: "como no se añadió ningún método de pago, hemos cancelado lo siguiente:",
    cP2: "No tienes ningún coste. ¿Aún quieres eliminar las reseñas? Puedes volver a pedirlo cuando quieras o responder a este correo y reactivamos tu pedido.",
    cBtn: "Volver a pedir",
    subject: "Aún no estamos trabajando en tus reseñas: añade un método de pago", subjectR: "Recordatorio: falta tu método de pago – tus reseñas esperan",
    title: "Todavía no podemos empezar", titleR: "Sigue sin método de pago", hi: (n) => (n ? `Hola ${n}:` : "Hola:"),
    p1: (n) => `todavía no estamos trabajando en ${n === 1 ? "tu reseña" : "tus reseñas"}:`,
    p1prof: "todavía no estamos trabajando en tu pedido:",
    p1R: "Tu método de pago sigue sin añadirse, así que esto sigue parado:",
    p2: "Añade tu método de pago en tu panel lo antes posible. Tranquilo: no se cobra nada, solo cuando una reseña se haya eliminado de verdad. Pero sin un método de pago guardado no podemos empezar.",
    btn: "Añadir método de pago", note: "Tarda 1 minuto · protegido por Stripe · puedes cambiarlo cuando quieras",
    close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo,", profile: "Perfil de Google", review: "Reseña",
    pushT: "Falta el método de pago", pushB: "Aún no trabajamos en tus reseñas: añádelo (no se cobra nada).",
  },
  fr: {
    fS: "Dernier rappel : ta commande sera annulée le {date}",
    fT: "Ta commande est en pause",
    fP1: "ton moyen de paiement manque depuis {days} jours – nous n’avons donc pas travaillé sur ce qui suit :",
    fP2: "Ta commande reste réservée jusqu’au {date}. Ajoute ton moyen de paiement d’ici là et nous commençons tout de suite – tu n’es toujours débité qu’en cas de suppression réussie. Sinon, la commande sera annulée automatiquement le {date}, sans frais pour toi.",
    lS: "Plus que 3 jours : ta commande sera annulée le {date}",
    lT: "Ta commande expire bientôt",
    lP1: "sans moyen de paiement, nous ne pouvons pas travailler sur ce qui suit :",
    lP2: "Ta commande sera annulée automatiquement le {date}. Tu veux toujours la suppression ? Ajoute ton moyen de paiement maintenant – rien n’est débité avant qu’un avis ait réellement été supprimé.",
    cS: "Ta commande a été annulée",
    cT: "Commande annulée",
    cP1: "aucun moyen de paiement n’ayant été ajouté, nous avons annulé ce qui suit :",
    cP2: "Cela ne te coûte rien. Tu veux quand même faire supprimer les avis ? Tu peux recommander à tout moment – ou réponds simplement à cet e-mail et nous réactivons ta commande.",
    cBtn: "Commander à nouveau",
    subject: "Nous ne traitons pas encore tes avis – ajoute un moyen de paiement", subjectR: "Rappel : moyen de paiement toujours manquant – tes avis attendent",
    title: "Nous ne pouvons pas encore commencer", titleR: "Toujours aucun moyen de paiement", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    p1: (n) => `nous ne travaillons pas encore sur ${n === 1 ? "ton avis" : "tes avis"} :`,
    p1prof: "nous ne travaillons pas encore sur ta commande :",
    p1R: "Ton moyen de paiement n’est toujours pas enregistré – c’est donc toujours en attente :",
    p2: "Ajoute ton moyen de paiement dans ton espace client dès que possible. Pas d’inquiétude : rien n’est débité – seulement quand un avis a réellement été supprimé. Mais sans moyen de paiement enregistré, nous ne pouvons pas commencer.",
    btn: "Ajouter un moyen de paiement", note: "1 minute · sécurisé par Stripe · modifiable à tout moment",
    close: "Des questions ? Réponds simplement à cet e-mail.", signoff: "Bien cordialement,", profile: "Profil Google", review: "Avis",
    pushT: "Moyen de paiement manquant", pushB: "Nous ne travaillons pas encore sur tes avis – ajoute-le (rien n’est débité).",
  },
  it: {
    fS: "Ultimo promemoria: il tuo ordine verrà annullato il {date}",
    fT: "Il tuo ordine è in pausa",
    fP1: "da {days} giorni manca il tuo metodo di pagamento, quindi non abbiamo lavorato a quanto segue:",
    fP2: "Il tuo ordine resta riservato fino al {date}. Se aggiungi il metodo di pagamento entro quella data iniziamo subito; l’addebito avviene sempre solo a rimozione riuscita. Altrimenti l’ordine verrà annullato automaticamente il {date}, senza costi per te.",
    lS: "Mancano 3 giorni: il tuo ordine verrà annullato il {date}",
    lT: "Il tuo ordine scade presto",
    lP1: "senza metodo di pagamento non possiamo lavorare a quanto segue:",
    lP2: "Il {date} il tuo ordine verrà annullato automaticamente. Vuoi ancora la rimozione? Aggiungi ora il metodo di pagamento: non viene addebitato nulla prima che una recensione sia stata davvero rimossa.",
    cS: "Il tuo ordine è stato annullato",
    cT: "Ordine annullato",
    cP1: "poiché non è stato aggiunto alcun metodo di pagamento, abbiamo annullato quanto segue:",
    cP2: "Non ti costa nulla. Vuoi comunque far rimuovere le recensioni? Puoi ordinare di nuovo in qualsiasi momento, oppure rispondi a questa e-mail e riattiviamo il tuo ordine.",
    cBtn: "Ordina di nuovo",
    subject: "Non stiamo ancora lavorando alle tue recensioni – aggiungi un metodo di pagamento", subjectR: "Promemoria: manca ancora il metodo di pagamento – le tue recensioni aspettano",
    title: "Non possiamo ancora iniziare", titleR: "Ancora nessun metodo di pagamento", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n) => `non stiamo ancora lavorando ${n === 1 ? "alla tua recensione" : "alle tue recensioni"}:`,
    p1prof: "non stiamo ancora lavorando al tuo ordine:",
    p1R: "Il tuo metodo di pagamento non è ancora stato aggiunto, quindi è tutto ancora fermo:",
    p2: "Aggiungi il prima possibile il tuo metodo di pagamento nella dashboard. Nessuna preoccupazione: non viene addebitato nulla, solo quando una recensione è stata davvero rimossa. Senza un metodo di pagamento salvato però non possiamo iniziare.",
    btn: "Aggiungi metodo di pagamento", note: "Richiede 1 minuto · protetto da Stripe · modificabile in qualsiasi momento",
    close: "Domande? Rispondi pure a questa e-mail.", signoff: "Cordiali saluti,", profile: "Profilo Google", review: "Recensione",
    pushT: "Manca il metodo di pagamento", pushB: "Non stiamo ancora lavorando alle tue recensioni: aggiungilo (non viene addebitato nulla).",
  },
  nl: {
    fS: "Laatste herinnering: uw opdracht wordt op {date} geannuleerd",
    fT: "Uw opdracht staat stil",
    fP1: "uw betaalmethode ontbreekt al {days} dagen – daarom hebben we niet gewerkt aan het volgende:",
    fP2: "Uw opdracht blijft tot {date} voor u gereserveerd. Voegt u voor die datum uw betaalmethode toe, dan starten we meteen – er wordt nog steeds pas afgeschreven bij een geslaagde verwijdering. Anders wordt de opdracht op {date} automatisch geannuleerd, zonder kosten voor u.",
    lS: "Nog 3 dagen: uw opdracht wordt op {date} geannuleerd",
    lT: "Uw opdracht verloopt binnenkort",
    lP1: "zonder betaalmethode kunnen we niet werken aan het volgende:",
    lP2: "Op {date} wordt uw opdracht automatisch geannuleerd. Wilt u de verwijdering nog? Voeg dan nu uw betaalmethode toe – er wordt niets afgeschreven voordat een review echt verwijderd is.",
    cS: "Uw opdracht is geannuleerd",
    cT: "Opdracht geannuleerd",
    cP1: "omdat er geen betaalmethode is toegevoegd, hebben we het volgende geannuleerd:",
    cP2: "Er zijn geen kosten voor u. Wilt u de reviews toch laten verwijderen? U kunt op elk moment opnieuw bestellen – of beantwoord gewoon deze e-mail, dan activeren we uw opdracht opnieuw.",
    cBtn: "Opnieuw bestellen",
    subject: "We werken nog niet aan uw reviews – voeg een betaalmethode toe", subjectR: "Herinnering: betaalmethode ontbreekt nog – uw reviews wachten",
    title: "We kunnen nog niet starten", titleR: "Nog steeds geen betaalmethode", hi: (n) => (n ? `Beste ${n},` : "Beste klant,"),
    p1: (n) => `we werken nog niet aan ${n === 1 ? "uw review" : "uw reviews"}:`,
    p1prof: "we werken nog niet aan uw opdracht:",
    p1R: "Uw betaalmethode is nog steeds niet toegevoegd – daarom ligt het volgende nog stil:",
    p2: "Voeg zo snel mogelijk uw betaalmethode toe in uw dashboard. Geen zorgen: er wordt niets afgeschreven – pas als een review echt verwijderd is. Maar zonder opgeslagen betaalmethode kunnen we niet beginnen.",
    btn: "Betaalmethode toevoegen", note: "Duurt 1 minuut · beveiligd door Stripe · altijd te wijzigen",
    close: "Vragen? Beantwoord gewoon deze e-mail.", signoff: "Met vriendelijke groet,", profile: "Google-profiel", review: "Review",
    pushT: "Betaalmethode ontbreekt", pushB: "We werken nog niet aan uw reviews – voeg er een toe (er wordt niets afgeschreven).",
  },
  pt: {
    fS: "Último lembrete: a tua encomenda será cancelada a {date}",
    fT: "A tua encomenda está em pausa",
    fP1: "há {days} dias que falta o teu método de pagamento – por isso não trabalhámos no seguinte:",
    fP2: "A tua encomenda fica reservada até {date}. Se adicionares o método de pagamento até lá, começamos de imediato – continuas a pagar só quando a remoção resultar. Caso contrário, a encomenda é cancelada automaticamente a {date}, sem custos para ti.",
    lS: "Faltam 3 dias: a tua encomenda será cancelada a {date}",
    lT: "A tua encomenda expira em breve",
    lP1: "sem método de pagamento não podemos trabalhar no seguinte:",
    lP2: "A {date} a tua encomenda será cancelada automaticamente. Ainda queres a remoção? Adiciona agora o teu método de pagamento – nada é cobrado antes de uma avaliação ser realmente removida.",
    cS: "A tua encomenda foi cancelada",
    cT: "Encomenda cancelada",
    cP1: "como não foi adicionado nenhum método de pagamento, cancelámos o seguinte:",
    cP2: "Não tens qualquer custo. Ainda queres remover as avaliações? Podes encomendar de novo a qualquer momento – ou responde a este e-mail e reativamos a tua encomenda.",
    cBtn: "Encomendar de novo",
    subject: "Ainda não estamos a trabalhar nas tuas avaliações – adiciona um método de pagamento", subjectR: "Lembrete: falta o método de pagamento – as tuas avaliações estão à espera",
    title: "Ainda não podemos começar", titleR: "Continua sem método de pagamento", hi: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n) => `ainda não estamos a trabalhar ${n === 1 ? "na tua avaliação" : "nas tuas avaliações"}:`,
    p1prof: "ainda não estamos a trabalhar na tua encomenda:",
    p1R: "O teu método de pagamento continua por adicionar – por isso isto continua parado:",
    p2: "Adiciona o teu método de pagamento no painel o mais depressa possível. Não te preocupes: nada é cobrado – só quando uma avaliação for realmente removida. Mas sem um método de pagamento guardado não podemos começar.",
    btn: "Adicionar método de pagamento", note: "Demora 1 minuto · protegido pela Stripe · alterável a qualquer momento",
    close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos,", profile: "Perfil Google", review: "Avaliação",
    pushT: "Falta o método de pagamento", pushB: "Ainda não estamos a trabalhar nas tuas avaliações – adiciona-o (nada é cobrado).",
  },
  ja: {
    fS: "最終のお知らせ：ご注文は{date}にキャンセルされます",
    fT: "ご注文は保留中です",
    fP1: "お支払い方法が{days}日間未登録のため、以下の作業を行っていません：",
    fP2: "ご注文は{date}まで確保されています。それまでにお支払い方法をご登録いただければ、すぐに開始します。請求は引き続き削除に成功した場合のみです。ご登録がない場合、ご注文は{date}に自動的にキャンセルされます。費用は一切かかりません。",
    lS: "あと3日：ご注文は{date}にキャンセルされます",
    lT: "ご注文の期限が近づいています",
    lP1: "お支払い方法がないため、以下の作業を行えません：",
    lP2: "ご注文は{date}に自動的にキャンセルされます。削除をご希望の場合は、今すぐお支払い方法をご登録ください。口コミが実際に削除されるまで料金は発生しません。",
    cS: "ご注文はキャンセルされました",
    cT: "ご注文キャンセル",
    cP1: "お支払い方法が登録されなかったため、以下をキャンセルしました：",
    cP2: "費用は一切かかりません。やはり口コミの削除をご希望の場合は、いつでも再度ご注文いただくか、このメールにご返信ください。ご注文を再開いたします。",
    cBtn: "もう一度注文する",
    subject: "口コミの作業はまだ始まっていません – お支払い方法をご登録ください", subjectR: "リマインダー：お支払い方法が未登録です – 口コミが待機中です",
    title: "まだ開始できません", titleR: "お支払い方法がまだ登録されていません", hi: (n) => (n ? `${n} 様` : "お客様"),
    p1: () => "以下の口コミについて、まだ作業を開始できていません：",
    p1prof: "ご注文の作業をまだ開始できていません：",
    p1R: "お支払い方法がまだ登録されていないため、以下は引き続き保留中です：",
    p2: "できるだけ早くダッシュボードでお支払い方法をご登録ください。ご安心ください。登録時に料金は発生せず、口コミが実際に削除された場合にのみ請求されます。ただし、お支払い方法が登録されていないと作業を開始できません。",
    btn: "お支払い方法を登録する", note: "1分で完了 · Stripeで安全 · いつでも変更可能",
    close: "ご不明な点はこのメールにご返信ください。", signoff: "よろしくお願いいたします。", profile: "Googleプロフィール", review: "口コミ",
    pushT: "お支払い方法が未登録です", pushB: "口コミの作業はまだ始まっていません。ご登録ください（料金は発生しません）。",
  },
  sv: {
    fS: "Sista påminnelsen: din beställning avbryts den {date}",
    fT: "Din beställning är pausad",
    fP1: "din betalningsmetod har saknats i {days} dagar – därför har vi inte arbetat med följande:",
    fP2: "Din beställning är reserverad för dig till och med {date}. Lägger du till din betalningsmetod innan dess börjar vi direkt – du debiteras fortfarande bara vid lyckad borttagning. Annars avbryts beställningen automatiskt den {date}, utan kostnad för dig.",
    lS: "3 dagar kvar: din beställning avbryts den {date}",
    lT: "Din beställning går snart ut",
    lP1: "utan betalningsmetod kan vi inte arbeta med följande:",
    lP2: "Den {date} avbryts din beställning automatiskt. Vill du fortfarande ha borttagningen? Lägg då till din betalningsmetod nu – ingenting debiteras innan ett omdöme faktiskt har tagits bort.",
    cS: "Din beställning har avbrutits",
    cT: "Beställning avbruten",
    cP1: "eftersom ingen betalningsmetod lades till har vi avbrutit följande:",
    cP2: "Det kostar dig ingenting. Vill du ändå få omdömena borttagna? Du kan beställa igen när som helst – eller svara på det här mejlet så återaktiverar vi din beställning.",
    cBtn: "Beställ igen",
    subject: "Vi arbetar inte med dina omdömen ännu – lägg till en betalningsmetod", subjectR: "Påminnelse: betalningsmetod saknas fortfarande – dina omdömen väntar",
    title: "Vi kan inte börja ännu", titleR: "Fortfarande ingen betalningsmetod", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `vi arbetar inte med ${n === 1 ? "ditt omdöme" : "dina omdömen"} ännu:`,
    p1prof: "vi arbetar inte med din beställning ännu:",
    p1R: "Din betalningsmetod är fortfarande inte tillagd – därför står följande fortfarande still:",
    p2: "Lägg till din betalningsmetod i din översikt så snart som möjligt. Ingen fara: ingenting debiteras – först när ett omdöme faktiskt har tagits bort. Men utan sparad betalningsmetod kan vi inte börja.",
    btn: "Lägg till betalningsmetod", note: "Tar 1 minut · säkert via Stripe · kan ändras när som helst",
    close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar,", profile: "Google-profil", review: "Omdöme",
    pushT: "Betalningsmetod saknas", pushB: "Vi arbetar inte med dina omdömen ännu – lägg till en (inget debiteras).",
  },
  da: {
    fS: "Sidste påmindelse: din ordre annulleres den {date}",
    fT: "Din ordre er sat på pause",
    fP1: "din betalingsmetode har manglet i {days} dage – derfor har vi ikke arbejdet på følgende:",
    fP2: "Din ordre er reserveret til dig indtil den {date}. Tilføjer du din betalingsmetode inden da, går vi straks i gang – der trækkes stadig kun ved vellykket fjernelse. Ellers annulleres ordren automatisk den {date}, uden omkostninger for dig.",
    lS: "3 dage tilbage: din ordre annulleres den {date}",
    lT: "Din ordre udløber snart",
    lP1: "uden betalingsmetode kan vi ikke arbejde på følgende:",
    lP2: "Den {date} annulleres din ordre automatisk. Vil du stadig have fjernelsen? Så tilføj din betalingsmetode nu – der trækkes intet, før en anmeldelse faktisk er fjernet.",
    cS: "Din ordre er annulleret",
    cT: "Ordre annulleret",
    cP1: "da der ikke blev tilføjet en betalingsmetode, har vi annulleret følgende:",
    cP2: "Det koster dig ingenting. Vil du alligevel have anmeldelserne fjernet? Du kan bestille igen når som helst – eller svar blot på denne e-mail, så genaktiverer vi din ordre.",
    cBtn: "Bestil igen",
    subject: "Vi arbejder ikke på dine anmeldelser endnu – tilføj en betalingsmetode", subjectR: "Påmindelse: betalingsmetode mangler stadig – dine anmeldelser venter",
    title: "Vi kan ikke gå i gang endnu", titleR: "Stadig ingen betalingsmetode", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `vi arbejder ikke på ${n === 1 ? "din anmeldelse" : "dine anmeldelser"} endnu:`,
    p1prof: "vi arbejder ikke på din ordre endnu:",
    p1R: "Din betalingsmetode er stadig ikke tilføjet – derfor ligger følgende stadig stille:",
    p2: "Tilføj din betalingsmetode i dit dashboard hurtigst muligt. Bare rolig: der trækkes intet – først når en anmeldelse faktisk er fjernet. Men uden en gemt betalingsmetode kan vi ikke gå i gang.",
    btn: "Tilføj betalingsmetode", note: "Tager 1 minut · sikret af Stripe · kan ændres når som helst",
    close: "Spørgsmål? Svar blot på denne e-mail.", signoff: "Venlig hilsen", profile: "Google-profil", review: "Anmeldelse",
    pushT: "Betalingsmetode mangler", pushB: "Vi arbejder ikke på dine anmeldelser endnu – tilføj en (der trækkes intet).",
  },
  no: {
    fS: "Siste påminnelse: bestillingen din kanselleres {date}",
    fT: "Bestillingen din er satt på pause",
    fP1: "betalingsmetoden din har manglet i {days} dager – derfor har vi ikke jobbet med følgende:",
    fP2: "Bestillingen din er reservert for deg til {date}. Legger du til betalingsmetoden før det, starter vi med en gang – du belastes fortsatt bare ved vellykket fjerning. Ellers kanselleres bestillingen automatisk {date}, uten kostnad for deg.",
    lS: "3 dager igjen: bestillingen din kanselleres {date}",
    lT: "Bestillingen din utløper snart",
    lP1: "uten betalingsmetode kan vi ikke jobbe med følgende:",
    lP2: "{date} kanselleres bestillingen din automatisk. Vil du fortsatt ha fjerningen? Legg til betalingsmetoden nå – ingenting belastes før en anmeldelse faktisk er fjernet.",
    cS: "Bestillingen din er kansellert",
    cT: "Bestilling kansellert",
    cP1: "siden ingen betalingsmetode ble lagt til, har vi kansellert følgende:",
    cP2: "Det koster deg ingenting. Vil du likevel få anmeldelsene fjernet? Du kan bestille på nytt når som helst – eller bare svar på denne e-posten, så reaktiverer vi bestillingen.",
    cBtn: "Bestill på nytt",
    subject: "Vi jobber ikke med anmeldelsene dine ennå – legg til en betalingsmetode", subjectR: "Påminnelse: betalingsmetode mangler fortsatt – anmeldelsene dine venter",
    title: "Vi kan ikke starte ennå", titleR: "Fortsatt ingen betalingsmetode", hi: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n) => `vi jobber ikke med ${n === 1 ? "anmeldelsen din" : "anmeldelsene dine"} ennå:`,
    p1prof: "vi jobber ikke med bestillingen din ennå:",
    p1R: "Betalingsmetoden din er fortsatt ikke lagt til – derfor står følgende fortsatt stille:",
    p2: "Legg til betalingsmetoden din i dashbordet så snart som mulig. Ingen grunn til bekymring: ingenting belastes – først når en anmeldelse faktisk er fjernet. Men uten en lagret betalingsmetode kan vi ikke starte.",
    btn: "Legg til betalingsmetode", note: "Tar 1 minutt · sikret av Stripe · kan endres når som helst",
    close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen", profile: "Google-profil", review: "Anmeldelse",
    pushT: "Betalingsmetode mangler", pushB: "Vi jobber ikke med anmeldelsene dine ennå – legg til en (ingenting belastes).",
  },
};

/** mode: "first" (1. Mail) · "reminder" · "final" (pausiert, Frist bis date) · "last" (3 Tage vor Storno) · "cancelled" (storniert) */
export type PgMode = "first" | "reminder" | "final" | "last" | "cancelled";
export interface ZahlungsartProps { lang?: string; name?: string; dashUrl: string; siteUrl?: string; items: PgItem[]; reminder?: boolean; mode?: PgMode; date?: string; days?: number; _overrides?: Record<string, string> }
const LOC: Record<string, string> = { de: "de-AT", en: "en-GB", es: "es-ES", fr: "fr-FR", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ja: "ja-JP", sv: "sv-SE", da: "da-DK", no: "nb-NO" };
const fmtDate = (iso: string | undefined, lang: string) => { try { return new Date(String(iso)).toLocaleDateString(LOC[lang] || "en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch { return String(iso || ""); } };
const fill = (s: string, p: ZahlungsartProps, l: string) => s.replace(/\{date\}/g, fmtDate(p.date, l)).replace(/\{days\}/g, String(p.days || 7));
const tOf = (lang?: string) => T[lang && T[lang] ? lang : "en"];
const modeOf = (p: ZahlungsartProps): PgMode => p.mode || (p.reminder ? "reminder" : "first");
export const zahlungsartSubject = (p: ZahlungsartProps) => {
  const t = tOf(p.lang), m = modeOf(p), l = p.lang && T[p.lang] ? p.lang : "en";
  return m === "final" ? fill(t.fS, p, l) : m === "last" ? fill(t.lS, p, l) : m === "cancelled" ? t.cS : m === "reminder" ? t.subjectR : t.subject;
};
export const zahlungsartPush = (lang?: string) => ({ title: tOf(lang).pushT, body: tOf(lang).pushB });

export default function KundenZahlungsartReviews(p: ZahlungsartProps) {
  const { lang = "en", name = "", dashUrl, siteUrl = "https://rapid-remove.com", items = [] } = p;
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const m = modeOf(p);
  const revs = items.filter((x) => !x.profile);
  const onlyProfile = !revs.length && items.length > 0;
  const lines = items.slice(0, 15).map((x, i) => x.profile
    ? <span key={i}><strong>{t.profile}:</strong> {x.profile}</span>
    : <span key={i}><strong>{x.name || t.review}</strong>{x.text ? <> — “{String(x.text).slice(0, 120)}{String(x.text).length > 120 ? "…" : ""}”</> : x.url ? <> — <a href={x.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{x.url}</a></> : null}</span>);
  const title = m === "final" ? t.fT : m === "last" ? t.lT : m === "cancelled" ? t.cT : m === "reminder" ? t.titleR : t.title;
  const p1 = m === "final" ? fill(t.fP1, p, l) : m === "last" ? t.lP1 : m === "cancelled" ? t.cP1 : m === "reminder" ? t.p1R : onlyProfile ? t.p1prof : t.p1(revs.length);
  const p2 = m === "final" ? fill(t.fP2, p, l) : m === "last" ? fill(t.lP2, p, l) : m === "cancelled" ? t.cP2 : t.p2;
  return (
    <EmailShell preview={zahlungsartSubject(p)} title={title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      <P>{p1}</P>
      <Bullets items={lines} />
      <P><strong>{p2}</strong></P>
      <div style={{ textAlign: "center", margin: "14px 0 18px" }}><CtaButton href={m === "cancelled" ? siteUrl : dashUrl}>{m === "cancelled" ? t.cBtn : t.btn}</CtaButton></div>
      {m === "cancelled" ? null : <NoteBox><span style={{ color: brand.tintText }}>{t.note}</span></NoteBox>}
      <P><span style={{ color: brand.muted }}>{t.close}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
