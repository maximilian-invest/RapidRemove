/* Template: Einzelne Bewertung automatisch storniert – nachträglich bearbeitet, ursprünglich älter als 4 Wochen
   (12.11.2026, Maximilian: „ich will das nicht manuell machen“). Google zeigt bei bearbeiteten Bewertungen nur das
   Bearbeitungsdatum („vor einer Woche (bearbeitet)“); maßgeblich ist aber das ursprüngliche Datum. Der Rest des Auftrags
   läuft normal weiter, für die stornierte Bewertung entstehen keine Kosten. 11 Sprachen (DE Sie-Form). */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { DashButton } from "./DashBox";
import { EmailShell, P, NoteBox, A, brand, type MailLang } from "./components";

export interface EditedItem { name?: string; text?: string; url?: string; created?: string }
export interface StornoReviewEditedProps { lang?: MailLang; name?: string; orderId?: string; items?: EditedItem[]; others?: number; dashUrl?: string }

type Tx = {
  subject: (n: number) => string; preview: string; title: (n: number) => string; hi: (n?: string) => string;
  p1: (n: number) => string; why: string; orig: (d: string) => string; view: string;
  rest: string; free: string; close: string;
};
const T: Record<string, Tx> = {
  de: {
    subject: (n) => n > 1 ? `${n} Bewertungen aus Ihrem Auftrag können wir nicht übernehmen` : "Eine Bewertung aus Ihrem Auftrag können wir nicht übernehmen",
    preview: "Die Bewertung wurde nachträglich bearbeitet und ist ursprünglich älter als 4 Wochen – für Sie entstehen keine Kosten.",
    title: (n) => n > 1 ? "Diese Bewertungen sind zu alt" : "Diese Bewertung ist zu alt",
    hi: (n) => n ? `Guten Tag ${n},` : "Guten Tag,",
    p1: (n) => n > 1 ? "wir haben die Bewertungen aus Ihrem Auftrag geprüft. Die folgenden können wir leider nicht übernehmen:" : "wir haben die Bewertungen aus Ihrem Auftrag geprüft. Die folgende können wir leider nicht übernehmen:",
    why: "Sie wurde nachträglich bearbeitet. Google zeigt dann nur das Datum der Bearbeitung an – ursprünglich wurde sie aber vor mehr als 4 Wochen veröffentlicht. Wir können nur Bewertungen übernehmen, die vor weniger als 4 Wochen veröffentlicht wurden.",
    orig: (d) => `Ursprünglich veröffentlicht am ${d}`, view: "Bewertung ansehen",
    rest: "Alle anderen Bewertungen Ihres Auftrags bearbeiten wir ganz normal weiter.",
    free: "Für diese Bewertung entstehen Ihnen keine Kosten – bezahlt wird bei uns immer erst nach einer erfolgreichen Löschung.",
    close: "Bei Fragen antworten Sie einfach auf diese E-Mail.",
  },
  en: {
    subject: (n) => n > 1 ? `We can't take on ${n} reviews from your order` : "We can't take on one review from your order",
    preview: "It was edited later and was originally posted more than 4 weeks ago – no costs for you.",
    title: (n) => n > 1 ? "These reviews are too old" : "This review is too old",
    hi: (n) => n ? `Hi ${n},` : "Hi there,",
    p1: (n) => n > 1 ? "we've checked the reviews in your order. Unfortunately we can't take on the following ones:" : "we've checked the reviews in your order. Unfortunately we can't take on the following one:",
    why: "It was edited later. In that case Google only shows the date of the edit – but it was originally posted more than 4 weeks ago. We can only take on reviews posted less than 4 weeks ago.",
    orig: (d) => `Originally posted on ${d}`, view: "View review",
    rest: "We'll keep working on all other reviews in your order as usual.",
    free: "This review costs you nothing – with us, you only ever pay after a successful removal.",
    close: "Questions? Just reply to this email.",
  },
  es: {
    subject: (n) => n > 1 ? `No podemos asumir ${n} reseñas de tu pedido` : "No podemos asumir una reseña de tu pedido",
    preview: "Se editó más tarde y se publicó originalmente hace más de 4 semanas: sin coste para ti.",
    title: (n) => n > 1 ? "Estas reseñas son demasiado antiguas" : "Esta reseña es demasiado antigua",
    hi: (n) => n ? `Hola, ${n}:` : "Hola:",
    p1: (n) => n > 1 ? "hemos revisado las reseñas de tu pedido. Lamentablemente no podemos asumir las siguientes:" : "hemos revisado las reseñas de tu pedido. Lamentablemente no podemos asumir la siguiente:",
    why: "Se editó más tarde. En ese caso Google solo muestra la fecha de la edición, pero se publicó originalmente hace más de 4 semanas. Solo podemos asumir reseñas publicadas hace menos de 4 semanas.",
    orig: (d) => `Publicada originalmente el ${d}`, view: "Ver la reseña",
    rest: "Seguimos trabajando con normalidad en todas las demás reseñas de tu pedido.",
    free: "Esta reseña no te cuesta nada: con nosotros solo pagas después de una eliminación exitosa.",
    close: "¿Preguntas? Responde a este correo.",
  },
  fr: {
    subject: (n) => n > 1 ? `Nous ne pouvons pas prendre en charge ${n} avis de ta commande` : "Nous ne pouvons pas prendre en charge un avis de ta commande",
    preview: "Il a été modifié plus tard et publié à l'origine il y a plus de 4 semaines – aucun frais pour toi.",
    title: (n) => n > 1 ? "Ces avis sont trop anciens" : "Cet avis est trop ancien",
    hi: (n) => n ? `Bonjour ${n},` : "Bonjour,",
    p1: (n) => n > 1 ? "nous avons vérifié les avis de ta commande. Malheureusement, nous ne pouvons pas prendre en charge les suivants :" : "nous avons vérifié les avis de ta commande. Malheureusement, nous ne pouvons pas prendre en charge celui-ci :",
    why: "Il a été modifié plus tard. Dans ce cas, Google n'affiche que la date de modification – mais il a été publié à l'origine il y a plus de 4 semaines. Nous ne prenons en charge que les avis publiés il y a moins de 4 semaines.",
    orig: (d) => `Publié à l'origine le ${d}`, view: "Voir l'avis",
    rest: "Nous continuons à traiter normalement tous les autres avis de ta commande.",
    free: "Cet avis ne te coûte rien – chez nous, tu ne paies qu'après une suppression réussie.",
    close: "Des questions ? Réponds simplement à cet e-mail.",
  },
  it: {
    subject: (n) => n > 1 ? `Non possiamo prendere in carico ${n} recensioni del tuo ordine` : "Non possiamo prendere in carico una recensione del tuo ordine",
    preview: "È stata modificata in seguito ed era stata pubblicata più di 4 settimane fa – nessun costo per te.",
    title: (n) => n > 1 ? "Queste recensioni sono troppo vecchie" : "Questa recensione è troppo vecchia",
    hi: (n) => n ? `Ciao ${n},` : "Ciao,",
    p1: (n) => n > 1 ? "abbiamo controllato le recensioni del tuo ordine. Purtroppo non possiamo prendere in carico le seguenti:" : "abbiamo controllato le recensioni del tuo ordine. Purtroppo non possiamo prendere in carico la seguente:",
    why: "È stata modificata in seguito. In questo caso Google mostra solo la data della modifica, ma era stata pubblicata più di 4 settimane fa. Possiamo prendere in carico solo recensioni pubblicate meno di 4 settimane fa.",
    orig: (d) => `Pubblicata originariamente il ${d}`, view: "Vedi la recensione",
    rest: "Continuiamo a lavorare normalmente su tutte le altre recensioni del tuo ordine.",
    free: "Questa recensione non ti costa nulla: da noi paghi sempre solo dopo una rimozione riuscita.",
    close: "Domande? Rispondi semplicemente a questa e-mail.",
  },
  nl: {
    subject: (n) => n > 1 ? `${n} reviews uit je bestelling kunnen we niet aannemen` : "Eén review uit je bestelling kunnen we niet aannemen",
    preview: "Hij is later bewerkt en oorspronkelijk meer dan 4 weken geleden geplaatst – geen kosten voor jou.",
    title: (n) => n > 1 ? "Deze reviews zijn te oud" : "Deze review is te oud",
    hi: (n) => n ? `Hoi ${n},` : "Hoi,",
    p1: (n) => n > 1 ? "we hebben de reviews in je bestelling gecontroleerd. Helaas kunnen we de volgende niet aannemen:" : "we hebben de reviews in je bestelling gecontroleerd. Helaas kunnen we de volgende niet aannemen:",
    why: "Hij is later bewerkt. Google toont dan alleen de datum van de bewerking – maar hij is oorspronkelijk meer dan 4 weken geleden geplaatst. We kunnen alleen reviews aannemen die minder dan 4 weken geleden zijn geplaatst.",
    orig: (d) => `Oorspronkelijk geplaatst op ${d}`, view: "Review bekijken",
    rest: "Alle andere reviews in je bestelling behandelen we gewoon verder.",
    free: "Deze review kost je niets – bij ons betaal je altijd pas na een geslaagde verwijdering.",
    close: "Vragen? Beantwoord gewoon deze e-mail.",
  },
  pt: {
    subject: (n) => n > 1 ? `Não podemos aceitar ${n} avaliações da tua encomenda` : "Não podemos aceitar uma avaliação da tua encomenda",
    preview: "Foi editada mais tarde e publicada originalmente há mais de 4 semanas – sem custos para ti.",
    title: (n) => n > 1 ? "Estas avaliações são demasiado antigas" : "Esta avaliação é demasiado antiga",
    hi: (n) => n ? `Olá ${n},` : "Olá,",
    p1: (n) => n > 1 ? "verificámos as avaliações da tua encomenda. Infelizmente não podemos aceitar as seguintes:" : "verificámos as avaliações da tua encomenda. Infelizmente não podemos aceitar a seguinte:",
    why: "Foi editada mais tarde. Nesse caso o Google só mostra a data da edição – mas foi publicada originalmente há mais de 4 semanas. Só podemos aceitar avaliações publicadas há menos de 4 semanas.",
    orig: (d) => `Publicada originalmente a ${d}`, view: "Ver a avaliação",
    rest: "Continuamos a tratar normalmente todas as outras avaliações da tua encomenda.",
    free: "Esta avaliação não te custa nada – connosco só pagas depois de uma remoção bem-sucedida.",
    close: "Dúvidas? Responde simplesmente a este e-mail.",
  },
  ja: {
    subject: (n) => n > 1 ? `ご注文のクチコミ${n}件はお引き受けできません` : "ご注文のクチコミ1件はお引き受けできません",
    preview: "後から編集されたクチコミで、最初の投稿は4週間以上前でした。費用は発生しません。",
    title: () => "投稿から4週間以上経過しています",
    hi: (n) => n ? `${n}様` : "ご担当者様",
    p1: () => "ご注文のクチコミを確認しました。誠に恐れ入りますが、以下のクチコミはお引き受けできません。",
    why: "このクチコミは後から編集されています。その場合Googleには編集日のみが表示されますが、最初の投稿は4週間以上前です。お引き受けできるのは投稿から4週間以内のクチコミのみです。",
    orig: (d) => `最初の投稿日：${d}`, view: "クチコミを見る",
    rest: "ご注文のその他のクチコミは通常どおり対応を続けます。",
    free: "このクチコミについて費用は一切かかりません。お支払いは削除が完了した場合のみです。",
    close: "ご不明な点はこのメールにご返信ください。",
  },
  sv: {
    subject: (n) => n > 1 ? `${n} recensioner i din beställning kan vi inte ta oss an` : "En recension i din beställning kan vi inte ta oss an",
    preview: "Den redigerades i efterhand och publicerades ursprungligen för mer än 4 veckor sedan – inga kostnader för dig.",
    title: (n) => n > 1 ? "De här recensionerna är för gamla" : "Den här recensionen är för gammal",
    hi: (n) => n ? `Hej ${n},` : "Hej,",
    p1: (n) => n > 1 ? "vi har kontrollerat recensionerna i din beställning. Tyvärr kan vi inte ta oss an följande:" : "vi har kontrollerat recensionerna i din beställning. Tyvärr kan vi inte ta oss an följande:",
    why: "Den redigerades i efterhand. Då visar Google bara datumet för redigeringen – men den publicerades ursprungligen för mer än 4 veckor sedan. Vi kan bara ta oss an recensioner som publicerades för mindre än 4 veckor sedan.",
    orig: (d) => `Ursprungligen publicerad ${d}`, view: "Visa recensionen",
    rest: "Alla andra recensioner i din beställning fortsätter vi med som vanligt.",
    free: "Den här recensionen kostar dig ingenting – hos oss betalar du alltid först efter en lyckad borttagning.",
    close: "Frågor? Svara bara på det här mejlet.",
  },
  da: {
    subject: (n) => n > 1 ? `${n} anmeldelser fra din bestilling kan vi ikke påtage os` : "Én anmeldelse fra din bestilling kan vi ikke påtage os",
    preview: "Den blev redigeret senere og oprindeligt offentliggjort for mere end 4 uger siden – ingen omkostninger for dig.",
    title: (n) => n > 1 ? "Disse anmeldelser er for gamle" : "Denne anmeldelse er for gammel",
    hi: (n) => n ? `Hej ${n},` : "Hej,",
    p1: (n) => n > 1 ? "vi har tjekket anmeldelserne i din bestilling. Desværre kan vi ikke påtage os følgende:" : "vi har tjekket anmeldelserne i din bestilling. Desværre kan vi ikke påtage os følgende:",
    why: "Den blev redigeret senere. Så viser Google kun datoen for redigeringen – men den blev oprindeligt offentliggjort for mere end 4 uger siden. Vi kan kun påtage os anmeldelser, der er offentliggjort for mindre end 4 uger siden.",
    orig: (d) => `Oprindeligt offentliggjort ${d}`, view: "Se anmeldelsen",
    rest: "Alle andre anmeldelser i din bestilling arbejder vi videre med som normalt.",
    free: "Denne anmeldelse koster dig intet – hos os betaler du altid først efter en vellykket fjernelse.",
    close: "Spørgsmål? Svar blot på denne e-mail.",
  },
  no: {
    subject: (n) => n > 1 ? `${n} anmeldelser fra bestillingen din kan vi ikke ta på oss` : "Én anmeldelse fra bestillingen din kan vi ikke ta på oss",
    preview: "Den ble redigert senere og opprinnelig publisert for mer enn 4 uker siden – ingen kostnader for deg.",
    title: (n) => n > 1 ? "Disse anmeldelsene er for gamle" : "Denne anmeldelsen er for gammel",
    hi: (n) => n ? `Hei ${n},` : "Hei,",
    p1: (n) => n > 1 ? "vi har sjekket anmeldelsene i bestillingen din. Dessverre kan vi ikke ta på oss følgende:" : "vi har sjekket anmeldelsene i bestillingen din. Dessverre kan vi ikke ta på oss følgende:",
    why: "Den ble redigert senere. Da viser Google bare datoen for redigeringen – men den ble opprinnelig publisert for mer enn 4 uker siden. Vi kan bare ta på oss anmeldelser som ble publisert for mindre enn 4 uker siden.",
    orig: (d) => `Opprinnelig publisert ${d}`, view: "Se anmeldelsen",
    rest: "Alle andre anmeldelser i bestillingen din jobber vi videre med som vanlig.",
    free: "Denne anmeldelsen koster deg ingenting – hos oss betaler du alltid først etter en vellykket fjerning.",
    close: "Spørsmål? Bare svar på denne e-posten.",
  },
};
const LOC: Record<string, string> = { de: "de-AT", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ja: "ja-JP", sv: "sv-SE", da: "da-DK", no: "nb-NO" };
const pick = (l?: string) => T[String(l || "en")] || T.en;
const fmt = (iso: string | undefined, l: string) => { const t = iso ? Date.parse(iso) : NaN; return Number.isFinite(t) ? new Date(t).toLocaleDateString(LOC[l] || "en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Vienna" }) : ""; };

export function subject(p: StornoReviewEditedProps = {}): string { return pick(p.lang).subject(Math.max(1, (p.items || []).length)); }

export default function StornoReviewEdited({ lang = "en", name, items = [], others = 1, dashUrl }: StornoReviewEditedProps = {}) {
  const t = pick(lang);
  const list = items.length ? items : [{ name: "Michelle Rodriguez", text: "Two months ago I gave an excellent review of this business…", url: "#", created: "2026-08-23T03:24:23Z" }];
  const n = list.length;
  return (
    <EmailShell preview={t.preview} title={t.title(n)} lang={lang}>
      <P><strong>{t.hi(name)}</strong></P>
      <P>{t.p1(n)}</P>
      {list.map((it, i) => (
        <Section key={i} style={{ background: brand.tint, borderRadius: 20, padding: "16px 18px", margin: "6px 0 14px" }}>
          <Text style={{ margin: 0, fontSize: 15, lineHeight: "1.5", color: brand.ink }}><strong>{it.name || "Google"}</strong></Text>
          {it.text ? <Text style={{ margin: "6px 0 0", fontSize: 15, lineHeight: "1.55", color: brand.text }}>{it.text.length > 280 ? it.text.slice(0, 280) + "…" : it.text}</Text> : null}
          {it.created ? <Text style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "1.5", color: brand.accentDark, fontWeight: 700 }}>{t.orig(fmt(it.created, lang))}</Text> : null}
          {it.url && it.url !== "#" ? <Text style={{ margin: "6px 0 0", fontSize: 14 }}><A href={it.url}>{t.view} →</A></Text> : null}
        </Section>
      ))}
      <P>{t.why}</P>
      {others > 0 ? <P>{t.rest}</P> : null}
      <NoteBox><strong>{t.free}</strong></NoteBox>
      {dashUrl ? <DashButton url={dashUrl} lang={lang} /> : null}
      <P muted>{t.close}</P>
    </EmailShell>
  );
}
