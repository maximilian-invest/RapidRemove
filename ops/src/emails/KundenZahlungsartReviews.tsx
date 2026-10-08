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
}

export const T: Record<string, L> = {
  de: {
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

export interface ZahlungsartProps { lang?: string; name?: string; dashUrl: string; items: PgItem[]; reminder?: boolean; _overrides?: Record<string, string> }
const tOf = (lang?: string) => T[lang && T[lang] ? lang : "en"];
export const zahlungsartSubject = (p: ZahlungsartProps) => (p.reminder ? tOf(p.lang).subjectR : tOf(p.lang).subject);
export const zahlungsartPush = (lang?: string) => ({ title: tOf(lang).pushT, body: tOf(lang).pushB });

export default function KundenZahlungsartReviews({ lang = "en", name = "", dashUrl, items = [], reminder = false }: ZahlungsartProps) {
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const revs = items.filter((x) => !x.profile);
  const onlyProfile = !revs.length && items.length > 0;
  const lines = items.slice(0, 15).map((x, i) => x.profile
    ? <span key={i}><strong>{t.profile}:</strong> {x.profile}</span>
    : <span key={i}><strong>{x.name || t.review}</strong>{x.text ? <> — “{String(x.text).slice(0, 120)}{String(x.text).length > 120 ? "…" : ""}”</> : x.url ? <> — <a href={x.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{x.url}</a></> : null}</span>);
  return (
    <EmailShell preview={reminder ? t.subjectR : t.subject} title={reminder ? t.titleR : t.title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      <P>{reminder ? t.p1R : onlyProfile ? t.p1prof : t.p1(revs.length)}</P>
      <Bullets items={lines} />
      <P><strong>{t.p2}</strong></P>
      <div style={{ textAlign: "center", margin: "14px 0 18px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <NoteBox><span style={{ color: brand.tintText }}>{t.note}</span></NoteBox>
      <P><span style={{ color: brand.muted }}>{t.close}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
