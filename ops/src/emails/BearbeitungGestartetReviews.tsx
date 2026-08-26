/* Template: „Wir haben mit der Löschung begonnen" (Bewertungs-Produkt).
   Wird aus dem Admin gesendet, sobald wir den Auftrag tatsächlich angestoßen
   haben — das Gegenstück zur Auftragsbestätigung (Eingang) und zur
   Löschbestätigung (Ergebnis + Rechnung). Hält fest: Bearbeitung läuft,
   Dauer, Abrechnung nur je gelöschter Bewertung, keine Mitwirkung nötig.
   Produkt nur außerhalb DACH → KEINE deutsche Fassung, „du"-Ton.
   Die Sprache wählt der Admin nach dem Land des Kunden. */
import * as React from "react";
import { EmailShell, P, NoteBox, Bullets, brand, type MailLang } from "./components";

/** Eine Bewertung: Teilen-Link ODER Name + Bewertungstext (Wizard-Alternative). */
export interface ReviewRef { url?: string; name?: string; text?: string }

export interface BearbeitungGestartetReviewsProps {
  lang?: MailLang;
  name?: string;
  /** Die beauftragten Bewertungen (wie im Wizard eingereicht). */
  items?: ReviewRef[];
  /** Veraltet: nur Links — wird zu items normalisiert. */
  urls?: string[];
  /** Formatierter Stückpreis, z. B. "$179" / "179 €". */
  per?: string;
  orderId?: string;
  _overrides?: Record<string, string>;
}

interface Entry {
  subject: (n: number) => string; preview: string; title: string;
  greeting: (n: string) => string;
  p1: (n: number) => string;
  listH: string;
  nextH: string; next1: string; next2: string; next3: string;
  calm: string;
  close: string; signoff: string;
}

export const T: Record<string, Entry> = {
  en: {
    subject: (n) => `We've started – removal of ${n === 1 ? "your review" : `your ${n} reviews`} is under way`,
    preview: "Your case is now actively being worked on.",
    title: "We've started ✓",
    greeting: (n) => (n ? `Hi ${n},` : "Hi there,"),
    p1: (n) => `quick update: we've begun working on ${n === 1 ? "the review" : `the ${n} reviews`} below. Your case is now actively in progress.`,
    listH: "What we're working on",
    nextH: "What happens next",
    next1: "Removals usually take a few days, sometimes up to three weeks.",
    next2: "You don't have to do anything — we'll get in touch as soon as there's news.",
    next3: "You only pay for reviews we actually remove: {per} each, due on the day of removal.",
    calm: "No news for a few days is normal — these things take time on Google's side. We're on it.",
    close: "Questions in the meantime? Just reply to this email.",
    signoff: "Warm regards,",
  },
  es: {
    subject: (n) => `Hemos empezado: la eliminación de ${n === 1 ? "tu reseña" : `tus ${n} reseñas`} está en marcha`,
    preview: "Ya estamos trabajando activamente en tu caso.",
    title: "Hemos empezado ✓",
    greeting: (n) => (n ? `Hola ${n},` : "Hola,"),
    p1: (n) => `una breve actualización: hemos empezado a trabajar en ${n === 1 ? "la reseña" : `las ${n} reseñas`} de abajo. Tu caso está ya en curso.`,
    listH: "En lo que estamos trabajando",
    nextH: "Qué pasa ahora",
    next1: "Las eliminaciones suelen tardar unos días, a veces hasta tres semanas.",
    next2: "No tienes que hacer nada: te avisamos en cuanto haya novedades.",
    next3: "Solo pagas por las reseñas que realmente eliminemos: {per} cada una, con vencimiento el día de la eliminación.",
    calm: "Que pasen unos días sin noticias es normal: en el lado de Google estas cosas llevan su tiempo. Estamos en ello.",
    close: "¿Alguna duda mientras tanto? Responde a este correo.",
    signoff: "Un saludo,",
  },
  fr: {
    subject: (n) => `C'est parti : la suppression ${n === 1 ? "de ton avis" : `de tes ${n} avis`} est en cours`,
    preview: "Ton dossier est désormais traité activement.",
    title: "Nous avons commencé ✓",
    greeting: (n) => (n ? `Salut ${n},` : "Bonjour,"),
    p1: (n) => `petit point : nous avons commencé à travailler sur ${n === 1 ? "l'avis" : `les ${n} avis`} ci-dessous. Ton dossier est maintenant en cours.`,
    listH: "Ce sur quoi nous travaillons",
    nextH: "La suite",
    next1: "Une suppression prend en général quelques jours, parfois jusqu'à trois semaines.",
    next2: "Tu n'as rien à faire — nous te recontactons dès qu'il y a du nouveau.",
    next3: "Tu ne paies que les avis réellement supprimés : {per} par avis, dus le jour de la suppression.",
    calm: "Quelques jours sans nouvelles, c'est normal : côté Google, cela prend du temps. Nous restons dessus.",
    close: "Une question entre-temps ? Réponds simplement à cet e-mail.",
    signoff: "Bien à toi,",
  },
  it: {
    subject: (n) => `Abbiamo iniziato: la rimozione ${n === 1 ? "della tua recensione" : `delle tue ${n} recensioni`} è in corso`,
    preview: "Il tuo caso è ora in lavorazione.",
    title: "Abbiamo iniziato ✓",
    greeting: (n) => (n ? `Ciao ${n},` : "Ciao,"),
    p1: (n) => `un breve aggiornamento: abbiamo iniziato a lavorare su ${n === 1 ? "la recensione" : `le ${n} recensioni`} qui sotto. Il tuo caso è ora in corso.`,
    listH: "Su cosa stiamo lavorando",
    nextH: "Cosa succede ora",
    next1: "Di solito una rimozione richiede qualche giorno, a volte fino a tre settimane.",
    next2: "Non devi fare nulla: ti scriviamo appena ci sono novità.",
    next3: "Paghi solo le recensioni che rimuoviamo davvero: {per} ciascuna, dovute il giorno della rimozione.",
    calm: "Qualche giorno senza notizie è normale: lato Google questi tempi ci sono. Ci stiamo lavorando.",
    close: "Domande nel frattempo? Rispondi a questa e-mail.",
    signoff: "Un caro saluto,",
  },
  nl: {
    subject: (n) => `We zijn begonnen – ${n === 1 ? "je review" : `je ${n} reviews`} zijn in behandeling`,
    preview: "Er wordt nu actief aan je zaak gewerkt.",
    title: "We zijn begonnen ✓",
    greeting: (n) => (n ? `Hallo ${n},` : "Hallo,"),
    p1: (n) => `een korte update: we zijn gestart met ${n === 1 ? "de review" : `de ${n} reviews`} hieronder. Je zaak is nu in behandeling.`,
    listH: "Waar we aan werken",
    nextH: "Wat er nu gebeurt",
    next1: "Een verwijdering duurt meestal een paar dagen, soms tot drie weken.",
    next2: "U hoeft niets te doen — we nemen contact op zodra er nieuws is.",
    next3: "U betaalt alleen voor reviews die we daadwerkelijk verwijderen: {per} per stuk, verschuldigd op de dag van verwijdering.",
    calm: "Een paar dagen zonder nieuws is normaal: aan de kant van Google kost dit tijd. We blijven erbovenop zitten.",
    close: "Vragen in de tussentijd? Beantwoord gewoon deze e-mail.",
    signoff: "Hartelijke groet,",
  },
  pt: {
    subject: (n) => `Já começámos: a remoção ${n === 1 ? "da tua avaliação" : `das tuas ${n} avaliações`} está em curso`,
    preview: "O teu caso está agora a ser tratado.",
    title: "Já começámos ✓",
    greeting: (n) => (n ? `Olá ${n},` : "Olá,"),
    p1: (n) => `uma atualização rápida: começámos a trabalhar ${n === 1 ? "na avaliação" : `nas ${n} avaliações`} abaixo. O teu caso está agora em curso.`,
    listH: "No que estamos a trabalhar",
    nextH: "O que acontece agora",
    next1: "Uma remoção demora normalmente alguns dias, às vezes até três semanas.",
    next2: "Não precisas de fazer nada — entramos em contacto assim que houver novidades.",
    next3: "Só pagas pelas avaliações que removermos de facto: {per} cada, com vencimento no dia da remoção.",
    calm: "Alguns dias sem notícias é normal: do lado do Google isto leva tempo. Estamos em cima do assunto.",
    close: "Dúvidas entretanto? Responde a este e-mail.",
    signoff: "Um abraço,",
  },
  ja: {
    subject: (n) => `作業を開始しました – 口コミ${n}件の削除を進めています`,
    preview: "お客様の案件の対応を開始しました。",
    title: "作業を開始しました ✓",
    greeting: (n) => (n ? `${n}さん、こんにちは。` : "こんにちは。"),
    p1: (n) => `進捗のご連絡です。以下の口コミ${n}件について、削除の作業を開始しました。現在対応中です。`,
    listH: "対応中の口コミ",
    nextH: "今後の流れ",
    next1: "削除には通常数日、長い場合で3週間ほどかかります。",
    next2: "お客様に必要な手続きはありません。進展があり次第ご連絡します。",
    next3: "お支払いは実際に削除できた口コミの分のみです（1件{per}、削除当日が期日）。",
    calm: "数日ご連絡がないこともありますが、Google側の処理には時間がかかるためで、問題ありません。引き続き対応しています。",
    close: "その間にご不明な点があれば、このメールにご返信ください。",
    signoff: "どうぞよろしくお願いいたします。",
  },
  sv: {
    subject: (n) => `Vi har börjat – borttagningen av ${n === 1 ? "ditt omdöme" : `dina ${n} omdömen`} pågår`,
    preview: "Ditt ärende bearbetas nu aktivt.",
    title: "Vi har börjat ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `en kort uppdatering: vi har börjat arbeta med ${n === 1 ? "omdömet" : `de ${n} omdömena`} nedan. Ditt ärende är nu igång.`,
    listH: "Det här arbetar vi med",
    nextH: "Så går det vidare",
    next1: "En borttagning tar oftast några dagar, ibland upp till tre veckor.",
    next2: "Du behöver inte göra något — vi hör av oss så snart det finns nyheter.",
    next3: "Du betalar bara för omdömen som vi faktiskt tar bort: {per} per styck, förfaller samma dag som borttagningen.",
    calm: "Några dagar utan besked är normalt — hos Google tar det här tid. Vi håller i det.",
    close: "Frågor under tiden? Svara bara på det här mejlet.",
    signoff: "Vänliga hälsningar,",
  },
  da: {
    subject: (n) => `Vi er gået i gang – fjernelsen af ${n === 1 ? "din anmeldelse" : `dine ${n} anmeldelser`} er i gang`,
    preview: "Din sag er nu under aktiv behandling.",
    title: "Vi er gået i gang ✓",
    greeting: (n) => (n ? `Hej ${n},` : "Hej,"),
    p1: (n) => `en kort opdatering: vi er gået i gang med ${n === 1 ? "anmeldelsen" : `de ${n} anmeldelser`} nedenfor. Din sag er nu i gang.`,
    listH: "Det arbejder vi med",
    nextH: "Sådan går det videre",
    next1: "En fjernelse tager som regel få dage, nogle gange op til tre uger.",
    next2: "Du skal ikke gøre noget — vi vender tilbage, så snart der er nyt.",
    next3: "Du betaler kun for anmeldelser, vi faktisk fjerner: {per} pr. stk., forfalder på fjernelsesdagen.",
    calm: "Nogle dage uden nyt er normalt — hos Google tager det tid. Vi holder fast i det.",
    close: "Spørgsmål i mellemtiden? Svar blot på denne mail.",
    signoff: "Venlig hilsen,",
  },
  no: {
    subject: (n) => `Vi har startet – fjerningen av ${n === 1 ? "omtalen din" : `de ${n} omtalene dine`} er i gang`,
    preview: "Saken din er nå under aktiv behandling.",
    title: "Vi har startet ✓",
    greeting: (n) => (n ? `Hei ${n},` : "Hei,"),
    p1: (n) => `en kort oppdatering: vi har begynt å jobbe med ${n === 1 ? "omtalen" : `de ${n} omtalene`} nedenfor. Saken din er nå i gang.`,
    listH: "Dette jobber vi med",
    nextH: "Slik går det videre",
    next1: "En fjerning tar vanligvis noen dager, av og til opptil tre uker.",
    next2: "Du trenger ikke gjøre noe — vi tar kontakt så snart det er nytt.",
    next3: "Du betaler kun for omtaler vi faktisk fjerner: {per} per stykk, forfaller samme dag som fjerningen.",
    calm: "Noen dager uten nyheter er normalt — hos Google tar dette tid. Vi står på.",
    close: "Spørsmål i mellomtiden? Bare svar på denne e-posten.",
    signoff: "Vennlig hilsen,",
  },
};

const fill = (s: string, per: string) => (s || "").replace(/\{per\}/g, per || "");

export function subject(p: BearbeitungGestartetReviewsProps): string {
  const t = T[p.lang || "en"] || T.en;
  return t.subject((p.items || []).length || (p.urls || []).length || 1);
}

export default function BearbeitungGestartetReviews({ lang = "en", name = "", items = [], urls = [], per = "", orderId = "", _overrides }: BearbeitungGestartetReviewsProps = {}) {
  const t = { ...(T[lang] || T.en), ...(_overrides || {}) } as Entry;
  const list: ReviewRef[] = items.length ? items : urls.map((u) => ({ url: u }));
  const n = list.length || 1;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting((name || "").trim())}</strong></P>
      <P>{t.p1(n)}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>

      {list.length ? (
        <React.Fragment>
          <P><strong>{t.listH}</strong></P>
          <Bullets items={list.map((it, i) => it.url
            ? <a key={i} href={it.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{it.url}</a>
            : <span key={i}><strong>{it.name}</strong> — “{it.text}”</span>
          )} />
        </React.Fragment>
      ) : null}

      <NoteBox>
        <span style={{ color: brand.tintText, fontWeight: 700 }}>{t.nextH}</span><br />
        1. {t.next1}<br />
        2. {t.next2}<br />
        3. {fill(t.next3, per)}
      </NoteBox>

      <P muted>{t.calm}</P>

      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
