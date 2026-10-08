/* Automatische Erinnerung (Einzelbewertungen) — Nachfass-Logik in followup.ts.
   Eine Mail pro Kunde und Tag; enthält alle fälligen Punkte (Zahlung offen · Software-Entscheidung ·
   noch nie eingeloggt · Neuigkeiten nicht angesehen). Button = persönlicher Login-Link ins Dashboard. */
import * as React from "react";
import { EmailShell, P, NoteBox, DangerBox, CtaButton, type MailLang } from "./components";
import ProgressBlock from "./ProgressBlock";
import { progT, fillP, type Progress } from "./progressText";

type N = number;
interface L {
  subjPay1: (a: string) => string; subjPay2: (a: string) => string; subjSw: (n?: N) => string; subjNever: string; subjNews: string;
  tPay1: string; tPay2: string; tSw: string; tNever: string; tNews: string;
  hi: (n: string) => string;
  pay1: (a: string, n: N) => string; pay2: (a: string) => string;
  sw: (n: N) => string; never: string; news: string;
  btn: string; btnPay: string; close: string; signoff: string;
}
const pl = (n: N, one: string, other: string) => (n === 1 ? one : other.replace("{n}", String(n)));

const T: Record<MailLang, L> = {
  en: {
    subjPay1: (a) => `Reminder: ${a} open for your removed reviews`, subjPay2: (a) => `2nd reminder: please pay ${a} within 48 hours`,
    subjSw: () => "We're waiting for your confirmation", subjNever: "Your dashboard is ready – follow your reviews live", subjNews: "You have news in your dashboard",
    tPay1: "Payment reminder", tPay2: "2nd payment reminder", tSw: "Waiting for your confirmation", tNever: "Your dashboard is ready", tNews: "News in your dashboard",
    hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    pay1: (a, n) => `${pl(n, "1 of your reviews has", `{n} of your reviews have`)} been removed – ${a} is still open. You only pay for reviews that were actually removed, and you can pay with one tap in your dashboard.`,
    pay2: (a) => `We haven't received your payment of ${a} yet. Please pay within the next 48 hours – otherwise the removed reviews may be restored.`,
    sw: (n) => `We're waiting for your confirmation before we can start removing ${pl(n, "your review", "your {n} reviews")}. It only takes a minute in your dashboard.`,
    never: "Your personal dashboard is ready. There you can follow the removal of every review live and pay with one tap. No password needed – the button below logs you straight in.",
    news: "There's news on your reviews. Open your dashboard to see what has changed.",
    btn: "Open my dashboard", btnPay: "Pay in my dashboard", close: "Questions? Just reply to this email.", signoff: "Warm regards,",
  },
  de: {
    subjPay1: (a) => `Erinnerung: ${a} offen für Ihre gelöschten Bewertungen`, subjPay2: (a) => `2. Erinnerung: Bitte zahlen Sie ${a} innerhalb von 48 Stunden`,
    subjSw: () => "Wir warten auf Ihre Bestätigung", subjNever: "Ihr Dashboard ist bereit – verfolgen Sie Ihre Bewertungen live", subjNews: "Neuigkeiten in Ihrem Dashboard",
    tPay1: "Zahlungserinnerung", tPay2: "2. Zahlungserinnerung", tSw: "Wir warten auf Ihre Bestätigung", tNever: "Ihr Dashboard ist bereit", tNews: "Neuigkeiten in Ihrem Dashboard",
    hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    pay1: (a, n) => `${pl(n, "1 Ihrer Bewertungen wurde", `{n} Ihrer Bewertungen wurden`)} gelöscht – offen sind noch ${a}. Sie zahlen nur für tatsächlich gelöschte Bewertungen und können in Ihrem Dashboard mit einem Klick bezahlen.`,
    pay2: (a) => `Ihre Zahlung über ${a} ist bei uns noch nicht eingegangen. Bitte zahlen Sie innerhalb der nächsten 48 Stunden – andernfalls können die gelöschten Bewertungen wiederhergestellt werden.`,
    sw: (n) => `Wir warten auf Ihre Bestätigung, bevor wir mit der Löschung ${pl(n, "Ihrer Bewertung", "Ihrer {n} Bewertungen")} starten können. Das dauert in Ihrem Dashboard nur eine Minute.`,
    never: "Ihr persönliches Dashboard ist bereit. Dort verfolgen Sie die Löschung jeder Bewertung live und bezahlen mit einem Klick. Kein Passwort nötig – der Button unten meldet Sie direkt an.",
    news: "Es gibt Neuigkeiten zu Ihren Bewertungen. Öffnen Sie Ihr Dashboard, um zu sehen, was sich geändert hat.",
    btn: "Mein Dashboard öffnen", btnPay: "Im Dashboard bezahlen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen,",
  },
  es: {
    subjPay1: (a) => `Recordatorio: ${a} pendientes por tus reseñas eliminadas`, subjPay2: (a) => `2.º recordatorio: paga ${a} en las próximas 48 horas`,
    subjSw: () => "Esperamos tu confirmación", subjNever: "Tu panel está listo: sigue tus reseñas en directo", subjNews: "Tienes novedades en tu panel",
    tPay1: "Recordatorio de pago", tPay2: "2.º recordatorio de pago", tSw: "Esperamos tu confirmación", tNever: "Tu panel está listo", tNews: "Novedades en tu panel",
    hi: (n) => (n ? `Hola ${n}:` : "Hola:"),
    pay1: (a, n) => `${pl(n, "Se ha eliminado 1 de tus reseñas", `Se han eliminado {n} de tus reseñas`)} y quedan ${a} pendientes. Solo pagas por las reseñas realmente eliminadas y puedes pagar con un clic en tu panel.`,
    pay2: (a) => `Aún no hemos recibido tu pago de ${a}. Por favor, paga en las próximas 48 horas; de lo contrario, las reseñas eliminadas podrían restaurarse.`,
    sw: (n) => `Esperamos tu confirmación para empezar a eliminar ${pl(n, "tu reseña", "tus {n} reseñas")}. En tu panel solo te lleva un minuto.`,
    never: "Tu panel personal está listo. Allí sigues en directo la eliminación de cada reseña y pagas con un clic. Sin contraseña: el botón te conecta directamente.",
    news: "Hay novedades sobre tus reseñas. Abre tu panel para ver qué ha cambiado.",
    btn: "Abrir mi panel", btnPay: "Pagar en mi panel", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo,",
  },
  fr: {
    subjPay1: (a) => `Rappel : ${a} restent à payer pour tes avis supprimés`, subjPay2: (a) => `2e rappel : merci de payer ${a} sous 48 heures`,
    subjSw: () => "Nous attendons ta confirmation", subjNever: "Ton tableau de bord est prêt – suis tes avis en direct", subjNews: "Du nouveau dans ton tableau de bord",
    tPay1: "Rappel de paiement", tPay2: "2e rappel de paiement", tSw: "Nous attendons ta confirmation", tNever: "Ton tableau de bord est prêt", tNews: "Du nouveau dans ton tableau de bord",
    hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    pay1: (a, n) => `${pl(n, "1 de tes avis a été supprimé", `{n} de tes avis ont été supprimés`)} – il reste ${a} à payer. Tu ne paies que les avis réellement supprimés, en un clic dans ton tableau de bord.`,
    pay2: (a) => `Nous n'avons pas encore reçu ton paiement de ${a}. Merci de payer dans les 48 prochaines heures – sinon les avis supprimés pourraient être rétablis.`,
    sw: (n) => `Nous attendons ta confirmation pour commencer la suppression de ${pl(n, "ton avis", "tes {n} avis")}. Ça ne prend qu'une minute dans ton tableau de bord.`,
    never: "Ton tableau de bord personnel est prêt. Tu y suis en direct la suppression de chaque avis et tu paies en un clic. Pas de mot de passe : le bouton te connecte directement.",
    news: "Il y a du nouveau sur tes avis. Ouvre ton tableau de bord pour voir ce qui a changé.",
    btn: "Ouvrir mon tableau de bord", btnPay: "Payer dans mon tableau de bord", close: "Une question ? Réponds simplement à cet e-mail.", signoff: "Bien à toi,",
  },
  it: {
    subjPay1: (a) => `Promemoria: ${a} da pagare per le recensioni rimosse`, subjPay2: (a) => `2° promemoria: paga ${a} entro 48 ore`,
    subjSw: () => "Aspettiamo la tua conferma", subjNever: "La tua dashboard è pronta – segui le recensioni in tempo reale", subjNews: "Novità nella tua dashboard",
    tPay1: "Promemoria di pagamento", tPay2: "2° promemoria di pagamento", tSw: "Aspettiamo la tua conferma", tNever: "La tua dashboard è pronta", tNews: "Novità nella tua dashboard",
    hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    pay1: (a, n) => `${pl(n, "1 delle tue recensioni è stata rimossa", `{n} delle tue recensioni sono state rimosse`)}: restano da pagare ${a}. Paghi solo le recensioni effettivamente rimosse, con un clic nella tua dashboard.`,
    pay2: (a) => `Non abbiamo ancora ricevuto il tuo pagamento di ${a}. Paga entro le prossime 48 ore, altrimenti le recensioni rimosse potrebbero essere ripristinate.`,
    sw: (n) => `Aspettiamo la tua conferma per iniziare a rimuovere ${pl(n, "la tua recensione", "le tue {n} recensioni")}. Nella tua dashboard ci vuole solo un minuto.`,
    never: "La tua dashboard personale è pronta. Lì segui in tempo reale la rimozione di ogni recensione e paghi con un clic. Nessuna password: il pulsante ti fa accedere direttamente.",
    news: "Ci sono novità sulle tue recensioni. Apri la dashboard per vedere cosa è cambiato.",
    btn: "Apri la mia dashboard", btnPay: "Paga nella dashboard", close: "Domande? Rispondi a questa e-mail.", signoff: "Un caro saluto,",
  },
  nl: {
    subjPay1: (a) => `Herinnering: ${a} open voor uw verwijderde reviews`, subjPay2: (a) => `2e herinnering: betaal ${a} binnen 48 uur`,
    subjSw: () => "We wachten op uw bevestiging", subjNever: "Uw dashboard staat klaar – volg uw reviews live", subjNews: "Nieuws in uw dashboard",
    tPay1: "Betalingsherinnering", tPay2: "2e betalingsherinnering", tSw: "We wachten op uw bevestiging", tNever: "Uw dashboard staat klaar", tNews: "Nieuws in uw dashboard",
    hi: (n) => (n ? `Beste ${n},` : "Hallo,"),
    pay1: (a, n) => `${pl(n, "1 van uw reviews is", `{n} van uw reviews zijn`)} verwijderd – er staat nog ${a} open. U betaalt alleen voor reviews die echt zijn verwijderd, met één klik in uw dashboard.`,
    pay2: (a) => `We hebben uw betaling van ${a} nog niet ontvangen. Betaal binnen de komende 48 uur – anders kunnen de verwijderde reviews worden hersteld.`,
    sw: (n) => `We wachten op uw bevestiging voordat we kunnen beginnen met het verwijderen van ${pl(n, "uw review", "uw {n} reviews")}. Het kost maar een minuut in uw dashboard.`,
    never: "Uw persoonlijke dashboard staat klaar. Daar volgt u live het verwijderen van elke review en betaalt u met één klik. Geen wachtwoord nodig – de knop logt u direct in.",
    news: "Er is nieuws over uw reviews. Open uw dashboard om te zien wat er is veranderd.",
    btn: "Mijn dashboard openen", btnPay: "Betalen in mijn dashboard", close: "Vragen? Antwoord gewoon op deze e-mail.", signoff: "Met vriendelijke groet,",
  },
  pt: {
    subjPay1: (a) => `Lembrete: ${a} em aberto pelas avaliações removidas`, subjPay2: (a) => `2.º lembrete: paga ${a} nas próximas 48 horas`,
    subjSw: () => "Aguardamos a tua confirmação", subjNever: "O teu painel está pronto – acompanha as avaliações em direto", subjNews: "Novidades no teu painel",
    tPay1: "Lembrete de pagamento", tPay2: "2.º lembrete de pagamento", tSw: "Aguardamos a tua confirmação", tNever: "O teu painel está pronto", tNews: "Novidades no teu painel",
    hi: (n) => (n ? `Olá ${n},` : "Olá,"),
    pay1: (a, n) => `${pl(n, "1 das tuas avaliações foi removida", `{n} das tuas avaliações foram removidas`)} – faltam pagar ${a}. Só pagas as avaliações realmente removidas, com um clique no teu painel.`,
    pay2: (a) => `Ainda não recebemos o teu pagamento de ${a}. Paga nas próximas 48 horas – caso contrário, as avaliações removidas podem ser repostas.`,
    sw: (n) => `Aguardamos a tua confirmação para começar a remover ${pl(n, "a tua avaliação", "as tuas {n} avaliações")}. No teu painel demora só um minuto.`,
    never: "O teu painel pessoal está pronto. Lá acompanhas em direto a remoção de cada avaliação e pagas com um clique. Sem palavra-passe – o botão inicia sessão diretamente.",
    news: "Há novidades sobre as tuas avaliações. Abre o teu painel para ver o que mudou.",
    btn: "Abrir o meu painel", btnPay: "Pagar no meu painel", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos,",
  },
  ja: {
    subjPay1: (a) => `【ご案内】削除済み口コミの未払い額 ${a}`, subjPay2: (a) => `【再送】48時間以内に ${a} のお支払いをお願いします`,
    subjSw: () => "ご確認をお待ちしています", subjNever: "ダッシュボードの準備ができました – 口コミをリアルタイムで確認", subjNews: "ダッシュボードに新しい情報があります",
    tPay1: "お支払いのご案内", tPay2: "お支払いのご案内（2回目）", tSw: "ご確認をお待ちしています", tNever: "ダッシュボードの準備ができました", tNews: "ダッシュボードに更新があります",
    hi: (n) => (n ? `${n} 様` : "こんにちは。"),
    pay1: (a, n) => `口コミ${n}件の削除が完了し、${a} が未払いです。実際に削除された口コミの分のみのお支払いで、ダッシュボードからワンクリックでお支払いいただけます。`,
    pay2: (a) => `${a} のお支払いをまだ確認できておりません。48時間以内にお支払いください。期限を過ぎると、削除された口コミが復元される場合があります。`,
    sw: (n) => `口コミ${n}件の削除を開始する前に、お客様のご確認をお待ちしています。ダッシュボードで1分ほどで完了します。`,
    never: "お客様専用のダッシュボードの準備ができました。各口コミの削除状況をリアルタイムで確認し、ワンクリックでお支払いいただけます。パスワードは不要です。下のボタンから直接ログインできます。",
    news: "口コミに関する新しい情報があります。ダッシュボードで変更内容をご確認ください。",
    btn: "ダッシュボードを開く", btnPay: "ダッシュボードで支払う", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。",
  },
  sv: {
    subjPay1: (a) => `Påminnelse: ${a} obetalt för dina borttagna omdömen`, subjPay2: (a) => `2:a påminnelsen: betala ${a} inom 48 timmar`,
    subjSw: () => "Vi väntar på din bekräftelse", subjNever: "Din dashboard är klar – följ dina omdömen live", subjNews: "Nyheter i din dashboard",
    tPay1: "Betalningspåminnelse", tPay2: "2:a betalningspåminnelsen", tSw: "Vi väntar på din bekräftelse", tNever: "Din dashboard är klar", tNews: "Nyheter i din dashboard",
    hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    pay1: (a, n) => `${pl(n, "1 av dina omdömen har", `{n} av dina omdömen har`)} tagits bort – ${a} är fortfarande obetalt. Du betalar bara för omdömen som faktiskt tagits bort, med ett klick i din dashboard.`,
    pay2: (a) => `Vi har ännu inte fått din betalning på ${a}. Betala inom de närmaste 48 timmarna – annars kan de borttagna omdömena återställas.`,
    sw: (n) => `Vi väntar på din bekräftelse innan vi kan börja ta bort ${pl(n, "ditt omdöme", "dina {n} omdömen")}. Det tar bara en minut i din dashboard.`,
    never: "Din personliga dashboard är klar. Där följer du borttagningen av varje omdöme live och betalar med ett klick. Inget lösenord behövs – knappen loggar in dig direkt.",
    news: "Det finns nyheter om dina omdömen. Öppna din dashboard för att se vad som har ändrats.",
    btn: "Öppna min dashboard", btnPay: "Betala i min dashboard", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar,",
  },
  da: {
    subjPay1: (a) => `Påmindelse: ${a} udestående for dine fjernede anmeldelser`, subjPay2: (a) => `2. påmindelse: betal ${a} inden for 48 timer`,
    subjSw: () => "Vi venter på din bekræftelse", subjNever: "Dit dashboard er klar – følg dine anmeldelser live", subjNews: "Nyt i dit dashboard",
    tPay1: "Betalingspåmindelse", tPay2: "2. betalingspåmindelse", tSw: "Vi venter på din bekræftelse", tNever: "Dit dashboard er klar", tNews: "Nyt i dit dashboard",
    hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    pay1: (a, n) => `${pl(n, "1 af dine anmeldelser er", `{n} af dine anmeldelser er`)} fjernet – ${a} er stadig udestående. Du betaler kun for anmeldelser, der faktisk er fjernet, med ét klik i dit dashboard.`,
    pay2: (a) => `Vi har endnu ikke modtaget din betaling på ${a}. Betal inden for de næste 48 timer – ellers kan de fjernede anmeldelser blive genoprettet.`,
    sw: (n) => `Vi venter på din bekræftelse, før vi kan begynde at fjerne ${pl(n, "din anmeldelse", "dine {n} anmeldelser")}. Det tager kun et minut i dit dashboard.`,
    never: "Dit personlige dashboard er klar. Her følger du fjernelsen af hver anmeldelse live og betaler med ét klik. Ingen adgangskode – knappen logger dig direkte ind.",
    news: "Der er nyt om dine anmeldelser. Åbn dit dashboard for at se, hvad der er ændret.",
    btn: "Åbn mit dashboard", btnPay: "Betal i mit dashboard", close: "Spørgsmål? Svar bare på denne mail.", signoff: "Venlig hilsen,",
  },
  no: {
    subjPay1: (a) => `Påminnelse: ${a} utestående for de fjernede omtalene dine`, subjPay2: (a) => `2. påminnelse: betal ${a} innen 48 timer`,
    subjSw: () => "Vi venter på bekreftelsen din", subjNever: "Dashbordet ditt er klart – følg omtalene dine live", subjNews: "Nytt i dashbordet ditt",
    tPay1: "Betalingspåminnelse", tPay2: "2. betalingspåminnelse", tSw: "Vi venter på bekreftelsen din", tNever: "Dashbordet ditt er klart", tNews: "Nytt i dashbordet ditt",
    hi: (n) => (n ? `Hei ${n},` : "Hei,"),
    pay1: (a, n) => `${pl(n, "1 av omtalene dine er", `{n} av omtalene dine er`)} fjernet – ${a} er fortsatt utestående. Du betaler bare for omtaler som faktisk er fjernet, med ett klikk i dashbordet.`,
    pay2: (a) => `Vi har ennå ikke mottatt betalingen din på ${a}. Betal innen de neste 48 timene – ellers kan de fjernede omtalene bli gjenopprettet.`,
    sw: (n) => `Vi venter på bekreftelsen din før vi kan begynne å fjerne ${pl(n, "omtalen din", "de {n} omtalene dine")}. Det tar bare et minutt i dashbordet.`,
    never: "Det personlige dashbordet ditt er klart. Der følger du fjerningen av hver omtale live og betaler med ett klikk. Ingen passord – knappen logger deg rett inn.",
    news: "Det er nytt om omtalene dine. Åpne dashbordet for å se hva som er endret.",
    btn: "Åpne dashbordet mitt", btnPay: "Betal i dashbordet", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen,",
  },
};

export interface ErinnerungProps {
  lang?: string; name?: string; dashUrl: string;
  pay?: { stage: 1 | 2; amount: string; n: number; prog?: Progress | null } | null;
  sw?: { n: number; price: string } | null;
  never?: boolean; news?: boolean;
}
const tOf = (lang?: string) => T[(lang && (T as Record<string, L>)[lang] ? lang : "en") as MailLang];

/** Betreff + Überschrift nach dem wichtigsten Punkt (Zahlung > Software > nie eingeloggt > Neuigkeiten). */
export function erinnerungSubject(p: ErinnerungProps): string {
  const t = tOf(p.lang);
  if (p.pay && p.pay.prog) { const pt = progT(p.lang), g = p.pay.prog; return g.hold && g.inProgress ? fillP(pt.holdSubj, { a: p.pay.amount }) : fillP(pt.progSubj, { r: g.removed, n: g.total, a: p.pay.amount }); }
  if (p.pay) return p.pay.stage === 2 ? t.subjPay2(p.pay.amount) : t.subjPay1(p.pay.amount);
  if (p.sw) return t.subjSw(p.sw.n);
  if (p.never) return t.subjNever;
  return t.subjNews;
}
export function erinnerungTitle(p: ErinnerungProps): string {
  const t = tOf(p.lang);
  if (p.pay && p.pay.prog) { const pt = progT(p.lang); return p.pay.prog.hold && p.pay.prog.inProgress ? pt.holdTitle : pt.progTitle; }
  return p.pay ? (p.pay.stage === 2 ? t.tPay2 : t.tPay1) : p.sw ? t.tSw : p.never ? t.tNever : t.tNews;
}

export default function KundenErinnerungReviews(p: ErinnerungProps) {
  const l = (p.lang && (T as Record<string, L>)[p.lang] ? p.lang : "en") as MailLang;
  const t = T[l];
  const title = erinnerungTitle(p);
  return (
    <EmailShell preview={erinnerungSubject(p)} title={title} lang={l}>
      <P><strong>{t.hi((p.name || "").trim())}</strong></P>
      {p.pay && p.pay.prog ? <><P>{progT(l).progP}</P><ProgressBlock p={p.pay.prog} lang={l} payUrl={p.dashUrl} /></> : p.pay ? (p.pay.stage === 2 ? <DangerBox>{t.pay2(p.pay.amount)}</DangerBox> : <NoteBox>{t.pay1(p.pay.amount, p.pay.n)}</NoteBox>) : null}
      {p.sw ? <NoteBox>{t.sw(p.sw.n)}</NoteBox> : null}
      {p.never ? <P>{t.never}</P> : p.news && !p.pay && !p.sw ? <P>{t.news}</P> : null}
      <div style={{ textAlign: "center", margin: "10px 0 20px" }}>
        <CtaButton href={p.dashUrl} variant={p.pay && !p.pay.prog ? "pay" : "primary"}>{p.pay && !p.pay.prog ? t.btnPay : t.btn}</CtaButton>
      </div>
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
