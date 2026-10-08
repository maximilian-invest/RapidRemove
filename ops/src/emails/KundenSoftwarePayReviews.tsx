/* Mail „Software-Löschung bestätigt – bitte innerhalb von 5 Stunden Zahlungsart hinterlegen" (Einzelbewertungen).
   Seit 08.10.2026 keine Vorkasse mehr: abgebucht wird erst bei erfolgreicher Löschung (Betrag = amount).
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
    subject: "Software-Löschung bestätigt – bitte innerhalb von 5 Stunden Zahlungsart hinterlegen", subjectR: "Noch ca. 1 Stunde – sichern Sie Ihren Platz",
    title: "Ihr Platz ist reserviert", titleR: "Ihr Platz läuft bald ab", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    p1: (n, o) => `gute Nachricht: Die Software-Löschung ist bei ${n === 1 ? "Ihrer Bewertung" : `Ihren ${n} Bewertungen`} möglich${o}. Wie bei der Bestellung vereinbart, zahlen Sie erst, wenn die Bewertung tatsächlich gelöscht ist.`,
    p2: (a) => `Bitte hinterlegen Sie innerhalb der nächsten 5 Stunden eine Zahlungsart in Ihrem Dashboard – dann ist Ihr Platz gesichert und wir starten sofort (ist bereits eine hinterlegt, legen wir direkt los). Abgebucht werden ${a} erst nach erfolgreicher Löschung.`,
    p2r: (a) => `Ihr reservierter Platz läuft in etwa 1 Stunde ab. Bitte hinterlegen Sie jetzt eine Zahlungsart, damit wir starten können – ${a} werden erst abgebucht, wenn die Bewertung gelöscht ist.`,
    box: "Danach kann der Platz jederzeit vergeben werden – je schneller, desto besser. Klappt die Löschung nicht, zahlen Sie nichts.",
    btn: "Zahlungsart hinterlegen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen",
  },
  en: {
    subject: "Software removal confirmed – please add a payment method within 5 hours", subjectR: "About 1 hour left – secure your spot",
    title: "Your spot is reserved", titleR: "Your spot expires soon", hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n, o) => `good news: software removal is possible for ${n === 1 ? "your review" : `your ${n} reviews`}${o}. As agreed when you ordered, you only pay once the review has actually been removed.`,
    p2: (a) => `Please add a payment method in your dashboard within the next 5 hours – then your spot is secured and we start right away (if one is already saved, we start immediately). ${a} is only charged once the removal has succeeded.`,
    p2r: (a) => `Your reserved spot expires in about 1 hour. Please add a payment method now so we can start – ${a} is only charged once the review has been removed.`,
    box: "After that, the spot can be given away at any time – the sooner, the better. If the removal doesn't work, you pay nothing.",
    btn: "Add payment method", close: "Questions? Just reply to this email.", signoff: "Warm regards,",
  },
  es: {
    subject: "Eliminación por software confirmada: añade un método de pago en las próximas 5 horas", subjectR: "Queda aprox. 1 hora: asegura tu plaza",
    title: "Tu plaza está reservada", titleR: "Tu plaza caduca pronto", hi: (n) => (n ? `Hola ${n}:` : "Hola:"),
    p1: (n, o) => `buenas noticias: la eliminación por software es posible para ${n === 1 ? "tu reseña" : `tus ${n} reseñas`}${o}. Como acordamos al hacer el pedido, solo pagas cuando la reseña se haya eliminado de verdad.`,
    p2: (a) => `Añade un método de pago en tu panel en las próximas 5 horas: así tu plaza queda asegurada y empezamos enseguida (si ya tienes uno guardado, empezamos ya). Los ${a} solo se cobran cuando la eliminación haya funcionado.`,
    p2r: (a) => `Tu plaza reservada caduca en aproximadamente 1 hora. Añade ahora un método de pago para que podamos empezar; los ${a} solo se cobran cuando la reseña se haya eliminado.`,
    box: "Después, la plaza puede asignarse a otro en cualquier momento: cuanto antes, mejor. Si la eliminación no funciona, no pagas nada.",
    btn: "Añadir método de pago", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo,",
  },
  fr: {
    subject: "Suppression par logiciel confirmée – ajoute un moyen de paiement sous 5 heures", subjectR: "Encore env. 1 heure – sécurise ta place",
    title: "Ta place est réservée", titleR: "Ta place expire bientôt", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    p1: (n, o) => `bonne nouvelle : la suppression par logiciel est possible pour ${n === 1 ? "ton avis" : `tes ${n} avis`}${o}. Comme convenu à la commande, tu ne paies qu'une fois l'avis réellement supprimé.`,
    p2: (a) => `Ajoute un moyen de paiement dans ton espace client dans les 5 prochaines heures – ta place est alors garantie et nous commençons tout de suite (si tu en as déjà un enregistré, nous démarrons immédiatement). Les ${a} ne sont débités qu'une fois la suppression réussie.`,
    p2r: (a) => `Ta place réservée expire dans environ 1 heure. Ajoute maintenant un moyen de paiement pour que nous puissions commencer – les ${a} ne sont débités qu'une fois l'avis supprimé.`,
    box: "Ensuite, la place peut être attribuée à tout moment – le plus tôt sera le mieux. Si la suppression ne marche pas, tu ne paies rien.",
    btn: "Ajouter un moyen de paiement", close: "Des questions ? Réponds simplement à cet e-mail.", signoff: "Bien à toi,",
  },
  it: {
    subject: "Rimozione via software confermata – aggiungi un metodo di pagamento entro 5 ore", subjectR: "Manca circa 1 ora – assicurati il posto",
    title: "Il tuo posto è riservato", titleR: "Il tuo posto sta per scadere", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n, o) => `buone notizie: la rimozione via software è possibile per ${n === 1 ? "la tua recensione" : `le tue ${n} recensioni`}${o}. Come concordato nell'ordine, paghi solo quando la recensione è stata davvero rimossa.`,
    p2: (a) => `Aggiungi un metodo di pagamento nella dashboard entro le prossime 5 ore: così il tuo posto è garantito e iniziamo subito (se ne hai già uno salvato, partiamo immediatamente). I ${a} vengono addebitati solo a rimozione riuscita.`,
    p2r: (a) => `Il tuo posto riservato scade tra circa 1 ora. Aggiungi ora un metodo di pagamento per permetterci di iniziare: i ${a} vengono addebitati solo quando la recensione è stata rimossa.`,
    box: "Dopo, il posto può essere assegnato in qualsiasi momento: prima è, meglio è. Se la rimozione non riesce, non paghi nulla.",
    btn: "Aggiungi metodo di pagamento", close: "Domande? Rispondi semplicemente a questa e-mail.", signoff: "Un saluto,",
  },
  nl: {
    subject: "Verwijdering via software bevestigd – voeg binnen 5 uur een betaalmethode toe", subjectR: "Nog ca. 1 uur – zet je plek vast",
    title: "Je plek is gereserveerd", titleR: "Je plek verloopt bijna", hi: (n) => (n ? `Beste ${n},` : "Hallo,"),
    p1: (n, o) => `goed nieuws: verwijdering via software is mogelijk voor ${n === 1 ? "je review" : `je ${n} reviews`}${o}. Zoals bij de bestelling afgesproken, betaal je pas als de review echt verwijderd is.`,
    p2: (a) => `Voeg binnen de komende 5 uur een betaalmethode toe in je dashboard – dan staat je plek vast en starten we meteen (heb je er al een opgeslagen, dan beginnen we direct). De ${a} wordt pas afgeschreven als de verwijdering gelukt is.`,
    p2r: (a) => `Je gereserveerde plek verloopt over ongeveer 1 uur. Voeg nu een betaalmethode toe, dan kunnen we starten – de ${a} wordt pas afgeschreven als de review verwijderd is.`,
    box: "Daarna kan de plek op elk moment worden vergeven – hoe sneller, hoe beter. Lukt de verwijdering niet, dan betaal je niets.",
    btn: "Betaalmethode toevoegen", close: "Vragen? Beantwoord gewoon deze e-mail.", signoff: "Met vriendelijke groet,",
  },
  pt: {
    subject: "Remoção por software confirmada – adiciona um método de pagamento nas próximas 5 horas", subjectR: "Falta cerca de 1 hora – garante o teu lugar",
    title: "O teu lugar está reservado", titleR: "O teu lugar expira em breve", hi: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n, o) => `boas notícias: a remoção por software é possível para ${n === 1 ? "a tua avaliação" : `as tuas ${n} avaliações`}${o}. Como combinado na encomenda, só pagas quando a avaliação for realmente removida.`,
    p2: (a) => `Adiciona um método de pagamento no teu painel nas próximas 5 horas – assim o teu lugar fica garantido e começamos logo (se já tiveres um guardado, começamos de imediato). Os ${a} só são cobrados quando a remoção resultar.`,
    p2r: (a) => `O teu lugar reservado expira dentro de cerca de 1 hora. Adiciona agora um método de pagamento para podermos começar – os ${a} só são cobrados quando a avaliação for removida.`,
    box: "Depois disso, o lugar pode ser atribuído a qualquer momento – quanto mais cedo, melhor. Se a remoção não resultar, não pagas nada.",
    btn: "Adicionar método de pagamento", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos,",
  },
  ja: {
    subject: "ソフトウェア削除が確定しました – 5時間以内にお支払い方法をご登録ください", subjectR: "残り約1時間 – 枠を確保してください",
    title: "枠を確保しました", titleR: "まもなく枠の期限です", hi: (n) => (n ? `${n} 様` : "こんにちは。"),
    p1: (n, o) => `朗報です。口コミ${n}件はソフトウェアで削除可能です${o}。ご注文時のとおり、お支払いは口コミが実際に削除された後のみです。`,
    p2: (a) => `今後5時間以内にダッシュボードでお支払い方法をご登録ください。枠が確定し、すぐに開始します（すでにご登録済みの場合は直ちに開始します）。${a}は削除に成功した時点で初めて請求されます。`,
    p2r: (a) => `確保した枠はあと約1時間で期限となります。開始できるよう、今すぐお支払い方法をご登録ください。${a}は口コミが削除された時点で初めて請求されます。`,
    box: "期限後は、いつでも枠が他に割り当てられる可能性があります。お早めのご登録をおすすめします。削除できなかった場合、お支払いは発生しません。",
    btn: "お支払い方法を登録", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。",
  },
  sv: {
    subject: "Borttagning med mjukvara bekräftad – lägg till en betalningsmetod inom 5 timmar", subjectR: "Ca 1 timme kvar – säkra din plats",
    title: "Din plats är reserverad", titleR: "Din plats går snart ut", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n, o) => `goda nyheter: borttagning med mjukvara är möjlig för ${n === 1 ? "ditt omdöme" : `dina ${n} omdömen`}${o}. Som avtalat vid beställningen betalar du först när omdömet faktiskt har tagits bort.`,
    p2: (a) => `Lägg till en betalningsmetod i din översikt inom de närmaste 5 timmarna – då är din plats säkrad och vi börjar direkt (har du redan en sparad börjar vi med en gång). ${a} dras först när borttagningen har lyckats.`,
    p2r: (a) => `Din reserverade plats går ut om ungefär 1 timme. Lägg till en betalningsmetod nu så att vi kan börja – ${a} dras först när omdömet har tagits bort.`,
    box: "Därefter kan platsen när som helst gå till någon annan – ju snabbare, desto bättre. Lyckas borttagningen inte betalar du ingenting.",
    btn: "Lägg till betalningsmetod", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: "Fjernelse med software bekræftet – tilføj en betalingsmetode inden for 5 timer", subjectR: "Ca. 1 time tilbage – sikr din plads",
    title: "Din plads er reserveret", titleR: "Din plads udløber snart", hi: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n, o) => `gode nyheder: fjernelse med software er mulig for ${n === 1 ? "din anmeldelse" : `dine ${n} anmeldelser`}${o}. Som aftalt ved bestillingen betaler du først, når anmeldelsen faktisk er fjernet.`,
    p2: (a) => `Tilføj en betalingsmetode i dit dashboard inden for de næste 5 timer – så er din plads sikret, og vi går i gang med det samme (har du allerede en gemt, starter vi straks). ${a} trækkes først, når fjernelsen er lykkedes.`,
    p2r: (a) => `Din reserverede plads udløber om cirka 1 time. Tilføj en betalingsmetode nu, så vi kan gå i gang – ${a} trækkes først, når anmeldelsen er fjernet.`,
    box: "Derefter kan pladsen til enhver tid gå til en anden – jo hurtigere, jo bedre. Lykkes fjernelsen ikke, betaler du intet.",
    btn: "Tilføj betalingsmetode", close: "Spørgsmål? Svar blot på denne e-mail.", signoff: "Venlig hilsen,",
  },
  no: {
    subject: "Fjerning med programvare bekreftet – legg til en betalingsmetode innen 5 timer", subjectR: "Ca. 1 time igjen – sikre plassen din",
    title: "Plassen din er reservert", titleR: "Plassen din utløper snart", hi: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n, o) => `gode nyheter: fjerning med programvare er mulig for ${n === 1 ? "omtalen din" : `de ${n} omtalene dine`}${o}. Som avtalt ved bestillingen betaler du først når omtalen faktisk er fjernet.`,
    p2: (a) => `Legg til en betalingsmetode i dashbordet innen de neste 5 timene – da er plassen din sikret, og vi starter med en gang (har du allerede en lagret, starter vi umiddelbart). ${a} trekkes først når fjerningen har lyktes.`,
    p2r: (a) => `Den reserverte plassen din utløper om omtrent 1 time. Legg til en betalingsmetode nå, så vi kan starte – ${a} trekkes først når omtalen er fjernet.`,
    box: "Etter det kan plassen når som helst gå til noen andre – jo raskere, jo bedre. Lykkes ikke fjerningen, betaler du ingenting.",
    btn: "Legg til betalingsmetode", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen,",
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
