/* Mail „Software-Löschung bestätigt – bitte innerhalb von 5 Stunden zahlen" (Einzelbewertungen).
   Nur für Software-Fälle, denen der Kunde schon bei der Bestellung zugestimmt hat (alte US-Bewertung / ohne Text):
   der Partner hat bestätigt, dass es geht → Platz ist reserviert. reminder=true → Erinnerung ca. 1 Std. vor Ablauf.
   Ersetzt für diese Fälle die allgemeine „Update/Entscheidung"-Mail und die Software-Nachfass-Mails. */
import * as React from "react";
import { EmailShell, P, CtaButton, NoteBox, brand, type MailLang } from "./components";

interface L {
  subject: string; subjectR: string; title: string; titleR: string; hi: (n: string) => string;
  p1: (n: number, order: string) => string; p2: (amount: string) => string; p2r: (amount: string) => string;
  box: string; btn: string; close: string; signoff: string;
}

const T: Record<string, L> = {
  de: {
    subject: "Software-Löschung bestätigt – bitte innerhalb von 5 Stunden zahlen", subjectR: "Noch ca. 1 Stunde – sichern Sie Ihren Platz",
    title: "Ihr Platz ist reserviert", titleR: "Ihr Platz läuft bald ab", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (n, o) => `gute Nachricht: Die Software-Löschung ist bei ${n === 1 ? "Ihrer Bewertung" : `Ihren ${n} Bewertungen`} möglich${o}. Wie bei der Bestellung vereinbart, wird sie vorab bezahlt.`,
    p2: (a) => `Bitte zahlen Sie ${a} innerhalb der nächsten 5 Stunden – dann ist Ihr Platz gesichert und wir starten sofort.`,
    p2r: (a) => `Ihr reservierter Platz läuft in etwa 1 Stunde ab. Bitte zahlen Sie jetzt ${a}, damit wir starten können.`,
    box: "Danach kann der Platz jederzeit vergeben werden. Je schneller Sie zahlen, desto besser. Erfolgsquote 99 % – ist die Bewertung nach spätestens 14 Tagen nicht gelöscht, erhalten Sie den vollen Betrag zurück.",
    btn: "Jetzt bezahlen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen",
  },
  en: {
    subject: "Software removal confirmed – please pay within 5 hours", subjectR: "About 1 hour left – secure your spot",
    title: "Your spot is reserved", titleR: "Your spot expires soon", hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n, o) => `good news: software removal is possible for ${n === 1 ? "your review" : `your ${n} reviews`}${o}. As agreed when you ordered, it's paid upfront.`,
    p2: (a) => `Please pay ${a} within the next 5 hours – then your spot is secured and we start right away.`,
    p2r: (a) => `Your reserved spot expires in about 1 hour. Please pay ${a} now so we can start.`,
    box: "After that, the spot can be given away at any time – the sooner you pay, the better. 99 % success rate: if the review isn't removed within 14 days at the latest, you get a full refund.",
    btn: "Pay now", close: "Questions? Just reply to this email.", signoff: "Warm regards,",
  },
  es: {
    subject: "Eliminación por software confirmada: paga en las próximas 5 horas", subjectR: "Queda aprox. 1 hora: asegura tu plaza",
    title: "Tu plaza está reservada", titleR: "Tu plaza caduca pronto", hi: (n) => (n ? `Hola ${n}:` : "Hola:"),
    p1: (n, o) => `buenas noticias: la eliminación por software es posible para ${n === 1 ? "tu reseña" : `tus ${n} reseñas`}${o}. Como acordamos al hacer el pedido, se paga por adelantado.`,
    p2: (a) => `Paga ${a} en las próximas 5 horas: así tu plaza queda asegurada y empezamos enseguida.`,
    p2r: (a) => `Tu plaza reservada caduca en aproximadamente 1 hora. Paga ahora ${a} para que podamos empezar.`,
    box: "Después, la plaza puede asignarse a otro en cualquier momento: cuanto antes pagues, mejor. 99 % de éxito: si la reseña no se elimina en un máximo de 14 días, te devolvemos el importe íntegro.",
    btn: "Pagar ahora", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo,",
  },
  fr: {
    subject: "Suppression par logiciel confirmée – merci de payer sous 5 heures", subjectR: "Encore env. 1 heure – sécurise ta place",
    title: "Ta place est réservée", titleR: "Ta place expire bientôt", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    p1: (n, o) => `bonne nouvelle : la suppression par logiciel est possible pour ${n === 1 ? "ton avis" : `tes ${n} avis`}${o}. Comme convenu à la commande, elle se paie d'avance.`,
    p2: (a) => `Merci de payer ${a} dans les 5 prochaines heures – ta place est alors garantie et nous commençons tout de suite.`,
    p2r: (a) => `Ta place réservée expire dans environ 1 heure. Paie ${a} maintenant pour que nous puissions commencer.`,
    box: "Ensuite, la place peut être attribuée à tout moment – plus tu paies vite, mieux c'est. 99 % de réussite : si l'avis n'est pas supprimé sous 14 jours au plus tard, nous te remboursons l'intégralité.",
    btn: "Payer maintenant", close: "Des questions ? Réponds simplement à cet e-mail.", signoff: "Bien à toi,",
  },
  it: {
    subject: "Rimozione via software confermata – paga entro 5 ore", subjectR: "Manca circa 1 ora – assicurati il posto",
    title: "Il tuo posto è riservato", titleR: "Il tuo posto sta per scadere", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n, o) => `buone notizie: la rimozione via software è possibile per ${n === 1 ? "la tua recensione" : `le tue ${n} recensioni`}${o}. Come concordato nell'ordine, si paga in anticipo.`,
    p2: (a) => `Paga ${a} entro le prossime 5 ore: così il tuo posto è garantito e iniziamo subito.`,
    p2r: (a) => `Il tuo posto riservato scade tra circa 1 ora. Paga ora ${a} per permetterci di iniziare.`,
    box: "Dopo, il posto può essere assegnato in qualsiasi momento: prima paghi, meglio è. 99 % di successo: se la recensione non viene rimossa entro 14 giorni al massimo, ti rimborsiamo l'intero importo.",
    btn: "Paga ora", close: "Domande? Rispondi semplicemente a questa e-mail.", signoff: "Un saluto,",
  },
  nl: {
    subject: "Verwijdering via software bevestigd – graag binnen 5 uur betalen", subjectR: "Nog ca. 1 uur – zet je plek vast",
    title: "Je plek is gereserveerd", titleR: "Je plek verloopt bijna", hi: (n) => (n ? `Beste ${n},` : "Hallo,"),
    p1: (n, o) => `goed nieuws: verwijdering via software is mogelijk voor ${n === 1 ? "je review" : `je ${n} reviews`}${o}. Zoals bij de bestelling afgesproken, wordt die vooraf betaald.`,
    p2: (a) => `Betaal ${a} binnen de komende 5 uur – dan staat je plek vast en starten we meteen.`,
    p2r: (a) => `Je gereserveerde plek verloopt over ongeveer 1 uur. Betaal nu ${a}, dan kunnen we starten.`,
    box: "Daarna kan de plek op elk moment worden vergeven – hoe sneller je betaalt, hoe beter. 99 % succes: is de review na uiterlijk 14 dagen niet verwijderd, dan krijg je het volledige bedrag terug.",
    btn: "Nu betalen", close: "Vragen? Beantwoord gewoon deze e-mail.", signoff: "Met vriendelijke groet,",
  },
  pt: {
    subject: "Remoção por software confirmada – paga nas próximas 5 horas", subjectR: "Falta cerca de 1 hora – garante o teu lugar",
    title: "O teu lugar está reservado", titleR: "O teu lugar expira em breve", hi: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n, o) => `boas notícias: a remoção por software é possível para ${n === 1 ? "a tua avaliação" : `as tuas ${n} avaliações`}${o}. Como combinado na encomenda, é paga antecipadamente.`,
    p2: (a) => `Paga ${a} nas próximas 5 horas – assim o teu lugar fica garantido e começamos logo.`,
    p2r: (a) => `O teu lugar reservado expira dentro de cerca de 1 hora. Paga agora ${a} para podermos começar.`,
    box: "Depois disso, o lugar pode ser atribuído a qualquer momento – quanto mais cedo pagares, melhor. 99 % de sucesso: se a avaliação não for removida no prazo máximo de 14 dias, devolvemos-te o valor total.",
    btn: "Pagar agora", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos,",
  },
  ja: {
    subject: "ソフトウェア削除が確定しました – 5時間以内にお支払いください", subjectR: "残り約1時間 – 枠を確保してください",
    title: "枠を確保しました", titleR: "まもなく枠の期限です", hi: (n) => (n ? `${n} 様` : "こんにちは。"),
    p1: (n, o) => `朗報です。口コミ${n}件はソフトウェアで削除可能です${o}。ご注文時のとおり前払いとなります。`,
    p2: (a) => `今後5時間以内に${a}をお支払いください。枠が確定し、すぐに開始します。`,
    p2r: (a) => `確保した枠はあと約1時間で期限となります。開始できるよう、今すぐ${a}をお支払いください。`,
    box: "期限後は、いつでも枠が他に割り当てられる可能性があります。お早めのお支払いをおすすめします。成功率99 %：遅くとも14日以内に削除されない場合は全額返金します。",
    btn: "今すぐ支払う", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。",
  },
  sv: {
    subject: "Borttagning med mjukvara bekräftad – betala inom 5 timmar", subjectR: "Ca 1 timme kvar – säkra din plats",
    title: "Din plats är reserverad", titleR: "Din plats går snart ut", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n, o) => `goda nyheter: borttagning med mjukvara är möjlig för ${n === 1 ? "ditt omdöme" : `dina ${n} omdömen`}${o}. Som avtalat vid beställningen betalas den i förskott.`,
    p2: (a) => `Betala ${a} inom de närmaste 5 timmarna – då är din plats säkrad och vi börjar direkt.`,
    p2r: (a) => `Din reserverade plats går ut om ungefär 1 timme. Betala ${a} nu så att vi kan börja.`,
    box: "Därefter kan platsen när som helst gå till någon annan – ju snabbare du betalar, desto bättre. 99 % lyckandegrad: tas omdömet inte bort inom senast 14 dagar får du hela beloppet tillbaka.",
    btn: "Betala nu", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Fjernelse med software bekræftet – betal inden for 5 timer", subjectR: "Ca. 1 time tilbage – sikr din plads",
    title: "Din plads er reserveret", titleR: "Din plads udløber snart", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n, o) => `gode nyheder: fjernelse med software er mulig for ${n === 1 ? "din anmeldelse" : `dine ${n} anmeldelser`}${o}. Som aftalt ved bestillingen betales den forud.`,
    p2: (a) => `Betal ${a} inden for de næste 5 timer – så er din plads sikret, og vi går i gang med det samme.`,
    p2r: (a) => `Din reserverede plads udløber om cirka 1 time. Betal ${a} nu, så vi kan gå i gang.`,
    box: "Derefter kan pladsen til enhver tid gå til en anden – jo hurtigere du betaler, jo bedre. 99 % succesrate: bliver anmeldelsen ikke fjernet senest inden for 14 dage, får du hele beløbet tilbage.",
    btn: "Betal nu", close: "Spørgsmål? Svar blot på denne e-mail.", signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Fjerning med programvare bekreftet – betal innen 5 timer", subjectR: "Ca. 1 time igjen – sikre plassen din",
    title: "Plassen din er reservert", titleR: "Plassen din utløper snart", hi: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n, o) => `gode nyheter: fjerning med programvare er mulig for ${n === 1 ? "omtalen din" : `de ${n} omtalene dine`}${o}. Som avtalt ved bestillingen betales den på forskudd.`,
    p2: (a) => `Betal ${a} innen de neste 5 timene – da er plassen din sikret, og vi starter med en gang.`,
    p2r: (a) => `Den reserverte plassen din utløper om omtrent 1 time. Betal ${a} nå, så vi kan starte.`,
    box: "Etter det kan plassen når som helst gå til noen andre – jo raskere du betaler, jo bedre. 99 % suksessrate: blir omtalen ikke fjernet senest innen 14 dager, får du hele beløpet tilbake.",
    btn: "Betal nå", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen,",
  },
};

export interface KundenSoftwarePayProps { lang?: string; name?: string; dashUrl: string; orderId?: string; n?: number; amount: string; reminder?: boolean }
// Erinnerung beginnt direkt nach der Anrede („Hi Max,") → klein weiter, wo das üblich ist (DE: „Ihr" bleibt groß).
const LOWER = new Set(["en", "fr", "it", "nl", "pt", "sv", "da", "no"]);
const lcFirst = (x: string) => x.charAt(0).toLowerCase() + x.slice(1);
const tOf = (lang?: string) => T[lang && T[lang] ? lang : "en"];
export const kundenSoftwarePaySubject = (p: KundenSoftwarePayProps) => (p.reminder ? tOf(p.lang).subjectR : tOf(p.lang).subject);

export default function KundenSoftwarePayReviews({ lang = "en", name = "", dashUrl, orderId, n = 1, amount, reminder = false }: KundenSoftwarePayProps) {
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const order = orderId ? ` (#${orderId})` : "";
  return (
    <EmailShell preview={reminder ? t.subjectR : t.subject} title={reminder ? t.titleR : t.title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      {reminder ? null : <P>{t.p1(n, order)}</P>}
      <P><strong>{reminder ? (LOWER.has(l) ? lcFirst(t.p2r(amount)) : t.p2r(amount)) : t.p2(amount)}</strong></P>
      <div style={{ textAlign: "center", margin: "14px 0 22px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <NoteBox><span style={{ color: brand.tintText }}>{t.box}</span></NoteBox>
      <P><span style={{ color: brand.muted }}>{t.close}</span></P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
