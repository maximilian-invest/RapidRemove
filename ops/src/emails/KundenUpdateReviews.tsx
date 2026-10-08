/* Sammel-Mail „Neuigkeiten im Dashboard" (Einzelbewertungen) — geht 5 Minuten nach der
   letzten Partner-Änderung eines Auftrags raus, damit Kunden nicht pro Klick eine Mail bekommen. */
import * as React from "react";
import { EmailShell, P, Bullets, CtaButton, NoteBox, brand, type MailLang } from "./components";
import { fmtReviewMoney } from "../reviewsPricing";
import ProgressBlock from "./ProgressBlock";
import { progT, fillP, isDone, type Progress } from "./progressText";

type St = "checking" | "in_progress" | "removed" | "not_removable" | "software_offer" | "software_in_progress" | "cancelled";
/** Dashboard-Status (customers.ts) → Mail-Bezeichnung. */
type DashSt = "new" | "working" | "removed" | "notpossible" | "software" | "sw_accepted" | "sw_declined" | "cancelled";
const MAP: Record<DashSt, St | "declined"> = { new: "checking", working: "in_progress", removed: "removed", notpossible: "not_removable", software: "software_offer", sw_accepted: "software_in_progress", sw_declined: "declined", cancelled: "cancelled" };
interface L { subjChanged: string; titleChanged: string; subject: string; title: string; hi: (n: string) => string; p: string; st: Record<St, string>; declined: string; swHint: (price: string, dep: string) => string; btn: string; close: string; signoff: string }

const T: Record<string, L> = {
  de: { subjChanged: "Statusänderung – Ihre Bewertungen", titleChanged: "Status geändert", subject: "Neuigkeiten zu Ihren Bewertungen – siehe Dashboard", title: "Neuigkeiten in Ihrem Dashboard", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"), p: "es gibt Neuigkeiten zur Löschung Ihrer Bewertungen:", st: { checking: "wird geprüft", in_progress: "in Bearbeitung", removed: "gelöscht ✓", not_removable: "nicht löschbar (keine Kosten)", software_offer: "mit Spezial-Software möglich", software_in_progress: "in Bearbeitung (Spezial-Software)", cancelled: "storniert" }, declined: "abgelehnt (keine Kosten)", swHint: (p) => `Bitte entscheiden Sie in Ihrem Dashboard: bestätigen (${p} pro Bewertung, abgebucht erst nach erfolgreicher Löschung – klappt es nicht, zahlen Sie nichts) oder mit einem Klick ablehnen, das kostet nichts.`, btn: "Mein Dashboard öffnen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen," },
  en: { subjChanged: "Status changed – your reviews", titleChanged: "Status changed", subject: "News on your reviews – see your dashboard", title: "News in your dashboard", hi: (n) => (n ? `Hi ${n},` : "Hi there,"), p: "there's an update on your review removal:", st: { checking: "being checked", in_progress: "in progress", removed: "removed ✓", not_removable: "can't be removed (no charge)", software_offer: "possible with special software", software_in_progress: "in progress (special software)", cancelled: "cancelled" }, declined: "declined (no charge)", swHint: (p) => `Please decide in your dashboard: confirm (${p} per review, charged only once the review has been removed – if it doesn't work, you pay nothing) or decline with one click, which costs nothing.`, btn: "Open my dashboard", close: "Questions? Just reply to this email.", signoff: "Warm regards," },
  es: { subjChanged: "Cambio de estado – tus reseñas", titleChanged: "Cambio de estado", subject: "Novedades sobre tus reseñas – mira tu panel", title: "Novedades en tu panel", hi: (n) => (n ? `Hola ${n}:` : "Hola:"), p: "hay novedades sobre la eliminación de tus reseñas:", st: { checking: "en revisión", in_progress: "en curso", removed: "eliminada ✓", not_removable: "no se puede eliminar (sin coste)", software_offer: "posible con software especial", software_in_progress: "en curso (software especial)", cancelled: "cancelada" }, declined: "rechazada (sin coste)", swHint: (p) => `Decide en tu panel: confirma (${p} por reseña, que solo se cobran cuando la reseña se ha eliminado; si no funciona, no pagas nada) o recházalo con un clic, sin ningún coste.`, btn: "Abrir mi panel", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo," },
  fr: { subjChanged: "Changement de statut – tes avis", titleChanged: "Changement de statut", subject: "Du nouveau sur tes avis – vois ton tableau de bord", title: "Du nouveau dans ton tableau de bord", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"), p: "il y a du nouveau sur la suppression de tes avis :", st: { checking: "en vérification", in_progress: "en cours", removed: "supprimé ✓", not_removable: "non supprimable (sans frais)", software_offer: "possible avec logiciel spécial", software_in_progress: "en cours (logiciel spécial)", cancelled: "annulé" }, declined: "refusé (sans frais)", swHint: (p) => `Décide dans ton tableau de bord : confirme (${p} par avis, débités seulement une fois l'avis supprimé – si ça ne marche pas, tu ne paies rien) ou refuse en un clic, sans aucun frais.`, btn: "Ouvrir mon tableau de bord", close: "Une question ? Réponds simplement à cet e-mail.", signoff: "Bien à toi," },
  it: { subjChanged: "Stato aggiornato – le tue recensioni", titleChanged: "Stato aggiornato", subject: "Novità sulle tue recensioni – guarda la dashboard", title: "Novità nella tua dashboard", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"), p: "ci sono novità sulla rimozione delle tue recensioni:", st: { checking: "in verifica", in_progress: "in corso", removed: "rimossa ✓", not_removable: "non rimovibile (nessun costo)", software_offer: "possibile con software speciale", software_in_progress: "in corso (software speciale)", cancelled: "annullata" }, declined: "rifiutata (nessun costo)", swHint: (p) => `Decidi nella tua dashboard: conferma (${p} a recensione, addebitati solo quando la recensione è stata rimossa; se non funziona, non paghi nulla) oppure rifiuta con un clic, senza alcun costo.`, btn: "Apri la mia dashboard", close: "Domande? Rispondi a questa e-mail.", signoff: "Un caro saluto," },
  nl: { subjChanged: "Status gewijzigd – uw reviews", titleChanged: "Status gewijzigd", subject: "Nieuws over uw reviews – bekijk uw dashboard", title: "Nieuws in uw dashboard", hi: (n) => (n ? `Beste ${n},` : "Hallo,"), p: "er is nieuws over het verwijderen van uw reviews:", st: { checking: "wordt gecontroleerd", in_progress: "in behandeling", removed: "verwijderd ✓", not_removable: "niet te verwijderen (geen kosten)", software_offer: "mogelijk met speciale software", software_in_progress: "in behandeling (speciale software)", cancelled: "geannuleerd" }, declined: "afgewezen (geen kosten)", swHint: (p) => `Beslis in uw dashboard: bevestig (${p} per review, pas afgeschreven als de review verwijderd is – lukt het niet, dan betaalt u niets) of weiger met één klik, dat kost niets.`, btn: "Mijn dashboard openen", close: "Vragen? Antwoord gewoon op deze e-mail.", signoff: "Met vriendelijke groet," },
  pt: { subjChanged: "Estado alterado – as tuas avaliações", titleChanged: "Estado alterado", subject: "Novidades sobre as tuas avaliações – vê o teu painel", title: "Novidades no teu painel", hi: (n) => (n ? `Olá ${n},` : "Olá,"), p: "há novidades sobre a remoção das tuas avaliações:", st: { checking: "em verificação", in_progress: "em curso", removed: "removida ✓", not_removable: "não removível (sem custos)", software_offer: "possível com software especial", software_in_progress: "em curso (software especial)", cancelled: "cancelada" }, declined: "recusada (sem custos)", swHint: (p) => `Decide no teu painel: confirma (${p} por avaliação, cobrados só quando a avaliação for removida – se não resultar, não pagas nada) ou recusa com um clique, sem qualquer custo.`, btn: "Abrir o meu painel", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos," },
  ja: { subjChanged: "ステータスが変更されました – 口コミ", titleChanged: "ステータスが変更されました", subject: "口コミ削除の最新情報 – ダッシュボードをご確認ください", title: "ダッシュボードに更新があります", hi: (n) => (n ? `${n} 様` : "こんにちは。"), p: "口コミ削除の状況が更新されました：", st: { checking: "確認中", in_progress: "対応中", removed: "削除済み ✓", not_removable: "削除不可（料金なし）", software_offer: "特別ソフトウェアで削除可能", software_in_progress: "対応中（特別ソフトウェア）", cancelled: "キャンセル" }, declined: "お断り済み（料金なし）", swHint: (p) => `ダッシュボードでお選びください：ご確認（1件${p}。口コミが削除された場合のみ請求され、削除できなかった場合はお支払い不要）、またはワンクリックでお断り（費用は一切かかりません）。`, btn: "ダッシュボードを開く", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。" },
  sv: { subjChanged: "Status ändrad – dina omdömen", titleChanged: "Status ändrad", subject: "Nyheter om dina omdömen – se din dashboard", title: "Nyheter i din dashboard", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "det finns nyheter om borttagningen av dina omdömen:", st: { checking: "granskas", in_progress: "pågår", removed: "borttaget ✓", not_removable: "kan inte tas bort (ingen kostnad)", software_offer: "möjligt med särskild programvara", software_in_progress: "pågår (särskild programvara)", cancelled: "avbrutet" }, declined: "avböjt (ingen kostnad)", swHint: (p) => `Bestäm i din dashboard: bekräfta (${p} per omdöme, dras först när omdömet har tagits bort – lyckas det inte betalar du ingenting) eller tacka nej med ett klick, det kostar ingenting.`, btn: "Öppna min dashboard", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar," },
  da: { subjChanged: "Status ændret – dine anmeldelser", titleChanged: "Status ændret", subject: "Nyt om dine anmeldelser – se dit dashboard", title: "Nyt i dit dashboard", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "der er nyt om fjernelsen af dine anmeldelser:", st: { checking: "bliver tjekket", in_progress: "i gang", removed: "fjernet ✓", not_removable: "kan ikke fjernes (ingen betaling)", software_offer: "muligt med særlig software", software_in_progress: "i gang (særlig software)", cancelled: "annulleret" }, declined: "afvist (ingen betaling)", swHint: (p) => `Beslut i dit dashboard: bekræft (${p} pr. anmeldelse, trækkes først, når anmeldelsen er fjernet – lykkes det ikke, betaler du intet) eller sig nej med ét klik, det koster ingenting.`, btn: "Åbn mit dashboard", close: "Spørgsmål? Svar bare på denne mail.", signoff: "Venlig hilsen," },
  no: { subjChanged: "Status endret – omtalene dine", titleChanged: "Status endret", subject: "Nytt om omtalene dine – se dashbordet", title: "Nytt i dashbordet ditt", hi: (n) => (n ? `Hei ${n},` : "Hei,"), p: "det er nytt om fjerningen av omtalene dine:", st: { checking: "sjekkes", in_progress: "pågår", removed: "fjernet ✓", not_removable: "kan ikke fjernes (ingen kostnad)", software_offer: "mulig med spesiell programvare", software_in_progress: "pågår (spesiell programvare)", cancelled: "avbrutt" }, declined: "avslått (ingen kostnad)", swHint: (p) => `Bestem i dashbordet: bekreft (${p} per omtale, trekkes først når omtalen er fjernet – lykkes det ikke, betaler du ingenting) eller takk nei med ett klikk, det koster ingenting.`, btn: "Åpne dashbordet mitt", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen," },
};

export interface KundenUpdateProps {
  lang?: string; name?: string; dashUrl: string; orderId?: string;
  changed: { url: string | null; name: string | null; status: DashSt; from?: DashSt | null }[];
  cur?: string; swPrice?: number; swDeposit?: number;
  /** Fortschritt des Auftrags (nur bei einem Auftrag je Mail): Balken, offener Betrag, ggf. Zwischenzahlung. */
  progress?: Progress | null;
}
export function kundenUpdateSubject(p: KundenUpdateProps): string {
  const t = T[p.lang && T[p.lang] ? p.lang : "en"] || T.en;
  const pr = p.progress;
  if (pr && isDone(pr) && !(pr.hold && pr.cardFail) && p.changed.some((c) => c.status === "removed")) return fillP(progT(p.lang).doneSubj, { r: pr.removed, n: pr.total }); // fertig → „Auftrag abgeschlossen"
  if (pr && pr.charged && pr.charged.amount > 0 && !(pr.due > 0) && p.changed.some((c) => c.status === "removed")) return fillP(progT(p.lang).autoSubj, { r: pr.removed, n: pr.total });
  if (pr && pr.due > 0 && p.changed.some((c) => c.status === "removed")) {
    const pt = progT(p.lang); const a = fmtReviewMoney(pr.due, pr.cur);
    return pr.hold && pr.inProgress && pr.cardFail ? pt.failSubj : pr.hold && pr.inProgress ? fillP(pt.holdSubj, { a }) : fillP(pt.progSubj, { r: pr.removed, n: pr.total, a });
  }
  return p.changed.some((c) => c.from) ? t.subjChanged : t.subject;
}

/** Kurztext für Push (kleine Statuswechsel gehen nur per Push raus). */
export function kundenUpdatePush(lang: string | undefined, changed: KundenUpdateProps["changed"]): { title: string; body: string } {
  const t = T[lang && T[lang] ? lang : "en"];
  const label = (s: DashSt) => { const m = MAP[s]; return m === "declined" ? t.declined : m ? t.st[m] : s; };
  const parts = changed.slice(0, 3).map((c) => `${c.name || "Google"}: ${label(c.status)}`);
  return { title: t.titleChanged, body: parts.join(" · ") + (changed.length > 3 ? ` · +${changed.length - 3}` : "") };
}

export default function KundenUpdateReviews({ lang = "en", name = "", dashUrl, orderId, changed, cur = "eur", swPrice = 300, swDeposit = 150, progress }: KundenUpdateProps) {
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const hasSw = changed.some((c) => c.status === "software");
  const changedAny = changed.some((c) => c.from);
  const label = (s: DashSt) => { const m = MAP[s]; return m === "declined" ? t.declined : m ? t.st[m] : s; };
  return (
    <EmailShell preview={kundenUpdateSubject({ lang, name, dashUrl, orderId, changed, cur, swPrice, swDeposit, progress })} title={progress && isDone(progress) && changed.some((c) => c.status === "removed") ? progT(l).doneTitle : changedAny ? t.titleChanged : t.title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      <P>{t.p}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      {changed.length ? (
        <Bullets items={changed.map((c, i) => (
          <span key={i}>
            {c.url ? <a href={c.url} style={{ color: brand.ink, fontWeight: 700, wordBreak: "break-all" }}>{c.name || c.url}</a> : <strong>{c.name}</strong>}
            {" — "}{c.from ? <><span style={{ color: brand.muted }}>{label(c.from)}</span>{" → "}</> : null}<strong>{label(c.status)}</strong>
          </span>
        ))} />
      ) : null}
      {progress && changed.some((c) => c.status === "removed") ? <ProgressBlock p={progress} lang={l} payUrl={dashUrl} /> : null}
      {hasSw ? (
        <NoteBox>{t.swHint(fmtReviewMoney(swPrice, cur), fmtReviewMoney(swDeposit, cur))}</NoteBox>
      ) : null}
      <div style={{ textAlign: "center", margin: "10px 0 20px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
