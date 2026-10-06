/* Sammel-Mail „Neuigkeiten im Dashboard" (Einzelbewertungen) — geht 5 Minuten nach der
   letzten Partner-Änderung eines Auftrags raus, damit Kunden nicht pro Klick eine Mail bekommen. */
import * as React from "react";
import { EmailShell, P, Bullets, CtaButton, NoteBox, brand, type MailLang } from "./components";
import { fmtReviewMoney } from "../reviewsPricing";

type St = "checking" | "in_progress" | "removed" | "not_removable" | "software_offer" | "software_in_progress" | "cancelled";
/** Dashboard-Status (customers.ts) → Mail-Bezeichnung. */
type DashSt = "new" | "working" | "removed" | "notpossible" | "software" | "sw_accepted" | "sw_declined" | "cancelled";
const MAP: Record<DashSt, St | "declined"> = { new: "checking", working: "in_progress", removed: "removed", notpossible: "not_removable", software: "software_offer", sw_accepted: "software_in_progress", sw_declined: "declined", cancelled: "cancelled" };
interface L { subjChanged: string; titleChanged: string; subject: string; title: string; hi: (n: string) => string; p: string; st: Record<St, string>; declined: string; swHint: (price: string, dep: string) => string; btn: string; close: string; signoff: string }

const T: Record<string, L> = {
  de: { subjChanged: "Statusänderung – Ihre Bewertungen", titleChanged: "Status geändert", subject: "Neuigkeiten zu Ihren Bewertungen – siehe Dashboard", title: "Neuigkeiten in Ihrem Dashboard", hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"), p: "es gibt Neuigkeiten zur Löschung Ihrer Bewertungen:", st: { checking: "wird geprüft", in_progress: "in Bearbeitung", removed: "gelöscht ✓", not_removable: "nicht löschbar (keine Kosten)", software_offer: "mit Spezial-Software möglich", software_in_progress: "in Bearbeitung (Spezial-Software)", cancelled: "storniert" }, declined: "abgelehnt (keine Kosten)", swHint: (p) => `Bitte entscheiden Sie in Ihrem Dashboard: ${p} pro Bewertung im Voraus bezahlen (99 % Erfolgsquote; volle Rückerstattung, falls die Bewertung nicht spätestens innerhalb von 14 Tagen gelöscht wird) – oder mit einem Klick ablehnen, das kostet nichts.`, btn: "Mein Dashboard öffnen", close: "Fragen? Antworten Sie einfach auf diese E-Mail.", signoff: "Mit freundlichen Grüßen," },
  en: { subjChanged: "Status changed – your reviews", titleChanged: "Status changed", subject: "News on your reviews – see your dashboard", title: "News in your dashboard", hi: (n) => (n ? `Hi ${n},` : "Hi there,"), p: "there's an update on your review removal:", st: { checking: "being checked", in_progress: "in progress", removed: "removed ✓", not_removable: "can't be removed (no charge)", software_offer: "possible with special software", software_in_progress: "in progress (special software)", cancelled: "cancelled" }, declined: "declined (no charge)", swHint: (p) => `Please decide in your dashboard: pay ${p} per review in advance (99 % success rate; full refund if the review isn't removed within 14 days at the latest) – or decline with one click, which costs nothing.`, btn: "Open my dashboard", close: "Questions? Just reply to this email.", signoff: "Warm regards," },
  es: { subjChanged: "Cambio de estado – tus reseñas", titleChanged: "Cambio de estado", subject: "Novedades sobre tus reseñas – mira tu panel", title: "Novedades en tu panel", hi: (n) => (n ? `Hola ${n}:` : "Hola:"), p: "hay novedades sobre la eliminación de tus reseñas:", st: { checking: "en revisión", in_progress: "en curso", removed: "eliminada ✓", not_removable: "no se puede eliminar (sin coste)", software_offer: "posible con software especial", software_in_progress: "en curso (software especial)", cancelled: "cancelada" }, declined: "rechazada (sin coste)", swHint: (p) => `Decide en tu panel: paga ${p} por reseña por adelantado (99 % de éxito; si la reseña no se elimina en un plazo máximo de 14 días, te devolvemos el importe íntegro) o recházalo con un clic, sin ningún coste.`, btn: "Abrir mi panel", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo," },
  fr: { subjChanged: "Changement de statut – tes avis", titleChanged: "Changement de statut", subject: "Du nouveau sur tes avis – vois ton tableau de bord", title: "Du nouveau dans ton tableau de bord", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"), p: "il y a du nouveau sur la suppression de tes avis :", st: { checking: "en vérification", in_progress: "en cours", removed: "supprimé ✓", not_removable: "non supprimable (sans frais)", software_offer: "possible avec logiciel spécial", software_in_progress: "en cours (logiciel spécial)", cancelled: "annulé" }, declined: "refusé (sans frais)", swHint: (p) => `Décide dans ton tableau de bord : paie ${p} par avis d'avance (99 % de réussite ; remboursement intégral si l'avis n'est pas supprimé sous 14 jours au plus tard) – ou refuse en un clic, sans aucun frais.`, btn: "Ouvrir mon tableau de bord", close: "Une question ? Réponds simplement à cet e-mail.", signoff: "Bien à toi," },
  it: { subjChanged: "Stato aggiornato – le tue recensioni", titleChanged: "Stato aggiornato", subject: "Novità sulle tue recensioni – guarda la dashboard", title: "Novità nella tua dashboard", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"), p: "ci sono novità sulla rimozione delle tue recensioni:", st: { checking: "in verifica", in_progress: "in corso", removed: "rimossa ✓", not_removable: "non rimovibile (nessun costo)", software_offer: "possibile con software speciale", software_in_progress: "in corso (software speciale)", cancelled: "annullata" }, declined: "rifiutata (nessun costo)", swHint: (p) => `Decidi nella tua dashboard: paga ${p} a recensione in anticipo (99 % di successo; rimborso completo se la recensione non viene rimossa entro massimo 14 giorni) oppure rifiuta con un clic, senza alcun costo.`, btn: "Apri la mia dashboard", close: "Domande? Rispondi a questa e-mail.", signoff: "Un caro saluto," },
  nl: { subjChanged: "Status gewijzigd – uw reviews", titleChanged: "Status gewijzigd", subject: "Nieuws over uw reviews – bekijk uw dashboard", title: "Nieuws in uw dashboard", hi: (n) => (n ? `Beste ${n},` : "Hallo,"), p: "er is nieuws over het verwijderen van uw reviews:", st: { checking: "wordt gecontroleerd", in_progress: "in behandeling", removed: "verwijderd ✓", not_removable: "niet te verwijderen (geen kosten)", software_offer: "mogelijk met speciale software", software_in_progress: "in behandeling (speciale software)", cancelled: "geannuleerd" }, declined: "afgewezen (geen kosten)", swHint: (p) => `Beslis in uw dashboard: betaal ${p} per review vooraf (99 % slagingskans; volledige terugbetaling als de review niet uiterlijk binnen 14 dagen is verwijderd) – of weiger met één klik, dat kost niets.`, btn: "Mijn dashboard openen", close: "Vragen? Antwoord gewoon op deze e-mail.", signoff: "Met vriendelijke groet," },
  pt: { subjChanged: "Estado alterado – as tuas avaliações", titleChanged: "Estado alterado", subject: "Novidades sobre as tuas avaliações – vê o teu painel", title: "Novidades no teu painel", hi: (n) => (n ? `Olá ${n},` : "Olá,"), p: "há novidades sobre a remoção das tuas avaliações:", st: { checking: "em verificação", in_progress: "em curso", removed: "removida ✓", not_removable: "não removível (sem custos)", software_offer: "possível com software especial", software_in_progress: "em curso (software especial)", cancelled: "cancelada" }, declined: "recusada (sem custos)", swHint: (p) => `Decide no teu painel: paga ${p} por avaliação antecipadamente (99 % de sucesso; reembolso total se a avaliação não for removida no prazo máximo de 14 dias) – ou recusa com um clique, sem qualquer custo.`, btn: "Abrir o meu painel", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos," },
  ja: { subjChanged: "ステータスが変更されました – 口コミ", titleChanged: "ステータスが変更されました", subject: "口コミ削除の最新情報 – ダッシュボードをご確認ください", title: "ダッシュボードに更新があります", hi: (n) => (n ? `${n} 様` : "こんにちは。"), p: "口コミ削除の状況が更新されました：", st: { checking: "確認中", in_progress: "対応中", removed: "削除済み ✓", not_removable: "削除不可（料金なし）", software_offer: "特別ソフトウェアで削除可能", software_in_progress: "対応中（特別ソフトウェア）", cancelled: "キャンセル" }, declined: "お断り済み（料金なし）", swHint: (p) => `ダッシュボードでお選びください：1件${p}の前払い（成功率99%。遅くとも14日以内に削除されなかった場合は全額返金）、またはワンクリックでお断り（費用は一切かかりません）。`, btn: "ダッシュボードを開く", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。" },
  sv: { subjChanged: "Status ändrad – dina omdömen", titleChanged: "Status ändrad", subject: "Nyheter om dina omdömen – se din dashboard", title: "Nyheter i din dashboard", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "det finns nyheter om borttagningen av dina omdömen:", st: { checking: "granskas", in_progress: "pågår", removed: "borttaget ✓", not_removable: "kan inte tas bort (ingen kostnad)", software_offer: "möjligt med särskild programvara", software_in_progress: "pågår (särskild programvara)", cancelled: "avbrutet" }, declined: "avböjt (ingen kostnad)", swHint: (p) => `Bestäm i din dashboard: betala ${p} per omdöme i förskott (99 % chans att lyckas; du får hela beloppet tillbaka om omdömet inte har tagits bort inom senast 14 dagar) – eller tacka nej med ett klick, det kostar ingenting.`, btn: "Öppna min dashboard", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar," },
  da: { subjChanged: "Status ændret – dine anmeldelser", titleChanged: "Status ændret", subject: "Nyt om dine anmeldelser – se dit dashboard", title: "Nyt i dit dashboard", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "der er nyt om fjernelsen af dine anmeldelser:", st: { checking: "bliver tjekket", in_progress: "i gang", removed: "fjernet ✓", not_removable: "kan ikke fjernes (ingen betaling)", software_offer: "muligt med særlig software", software_in_progress: "i gang (særlig software)", cancelled: "annulleret" }, declined: "afvist (ingen betaling)", swHint: (p) => `Beslut i dit dashboard: betal ${p} pr. anmeldelse forud (99 % succesrate; du får hele beløbet tilbage, hvis anmeldelsen ikke er fjernet senest efter 14 dage) – eller sig nej med ét klik, det koster ingenting.`, btn: "Åbn mit dashboard", close: "Spørgsmål? Svar bare på denne mail.", signoff: "Venlig hilsen," },
  no: { subjChanged: "Status endret – omtalene dine", titleChanged: "Status endret", subject: "Nytt om omtalene dine – se dashbordet", title: "Nytt i dashbordet ditt", hi: (n) => (n ? `Hei ${n},` : "Hei,"), p: "det er nytt om fjerningen av omtalene dine:", st: { checking: "sjekkes", in_progress: "pågår", removed: "fjernet ✓", not_removable: "kan ikke fjernes (ingen kostnad)", software_offer: "mulig med spesiell programvare", software_in_progress: "pågår (spesiell programvare)", cancelled: "avbrutt" }, declined: "avslått (ingen kostnad)", swHint: (p) => `Bestem i dashbordet: betal ${p} per omtale på forskudd (99 % suksessrate; du får hele beløpet tilbake hvis omtalen ikke er fjernet senest innen 14 dager) – eller takk nei med ett klikk, det koster ingenting.`, btn: "Åpne dashbordet mitt", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen," },
};

export interface KundenUpdateProps {
  lang?: string; name?: string; dashUrl: string; orderId?: string;
  changed: { url: string | null; name: string | null; status: DashSt; from?: DashSt | null }[];
  cur?: string; swPrice?: number; swDeposit?: number;
}
export function kundenUpdateSubject(p: KundenUpdateProps): string {
  const t = T[p.lang && T[p.lang] ? p.lang : "en"] || T.en;
  return p.changed.some((c) => c.from) ? t.subjChanged : t.subject;
}

/** Kurztext für Push (kleine Statuswechsel gehen nur per Push raus). */
export function kundenUpdatePush(lang: string | undefined, changed: KundenUpdateProps["changed"]): { title: string; body: string } {
  const t = T[lang && T[lang] ? lang : "en"];
  const label = (s: DashSt) => { const m = MAP[s]; return m === "declined" ? t.declined : m ? t.st[m] : s; };
  const parts = changed.slice(0, 3).map((c) => `${c.name || "Google"}: ${label(c.status)}`);
  return { title: t.titleChanged, body: parts.join(" · ") + (changed.length > 3 ? ` · +${changed.length - 3}` : "") };
}

export default function KundenUpdateReviews({ lang = "en", name = "", dashUrl, orderId, changed, cur = "eur", swPrice = 300, swDeposit = 150 }: KundenUpdateProps) {
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const hasSw = changed.some((c) => c.status === "software");
  const changedAny = changed.some((c) => c.from);
  const label = (s: DashSt) => { const m = MAP[s]; return m === "declined" ? t.declined : m ? t.st[m] : s; };
  return (
    <EmailShell preview={changedAny ? t.subjChanged : t.subject} title={changedAny ? t.titleChanged : t.title} lang={l as MailLang}>
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
      {hasSw ? (
        <NoteBox>{t.swHint(fmtReviewMoney(swPrice, cur), fmtReviewMoney(swDeposit, cur))}</NoteBox>
      ) : null}
      <div style={{ textAlign: "center", margin: "10px 0 20px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
