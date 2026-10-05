/* Sammel-Mail „Neuigkeiten im Dashboard" (Einzelbewertungen) — geht 5 Minuten nach der
   letzten Partner-Änderung eines Auftrags raus, damit Kunden nicht pro Klick eine Mail bekommen. */
import * as React from "react";
import { EmailShell, P, Bullets, CtaButton, brand, type MailLang } from "./components";

type St = "checking" | "in_progress" | "removed" | "not_removable" | "software_offer" | "software_in_progress" | "cancelled";
interface L { subject: string; title: string; hi: (n: string) => string; p: string; st: Record<St, string>; swHint: string; btn: string; close: string; signoff: string }

const T: Record<string, L> = {
  en: { subject: "News on your reviews – see your dashboard", title: "News in your dashboard", hi: (n) => (n ? `Hi ${n},` : "Hi there,"), p: "there's an update on your review removal:", st: { checking: "being checked", in_progress: "in progress", removed: "removed ✓", not_removable: "can't be removed (no charge)", software_offer: "possible with special software", software_in_progress: "in progress (special software)", cancelled: "cancelled" }, swHint: "For reviews marked “possible with special software” you'll find the deposit button in your dashboard ($300 / 300 € per review, 50 % deposit, 50 % after removal).", btn: "Open my dashboard", close: "Questions? Just reply to this email.", signoff: "Warm regards," },
  es: { subject: "Novedades sobre tus reseñas – mira tu panel", title: "Novedades en tu panel", hi: (n) => (n ? `Hola ${n}:` : "Hola:"), p: "hay novedades sobre la eliminación de tus reseñas:", st: { checking: "en revisión", in_progress: "en curso", removed: "eliminada ✓", not_removable: "no se puede eliminar (sin coste)", software_offer: "posible con software especial", software_in_progress: "en curso (software especial)", cancelled: "cancelada" }, swHint: "Para las reseñas «posibles con software especial» encontrarás el botón del anticipo en tu panel (300 por reseña, 50 % de anticipo, 50 % tras la eliminación).", btn: "Abrir mi panel", close: "¿Preguntas? Responde a este correo.", signoff: "Un saludo," },
  fr: { subject: "Du nouveau sur tes avis – vois ton tableau de bord", title: "Du nouveau dans ton tableau de bord", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"), p: "il y a du nouveau sur la suppression de tes avis :", st: { checking: "en vérification", in_progress: "en cours", removed: "supprimé ✓", not_removable: "non supprimable (sans frais)", software_offer: "possible avec logiciel spécial", software_in_progress: "en cours (logiciel spécial)", cancelled: "annulé" }, swHint: "Pour les avis « possibles avec logiciel spécial », tu trouves le bouton d'acompte dans ton tableau de bord (300 par avis, 50 % d'acompte, 50 % après suppression).", btn: "Ouvrir mon tableau de bord", close: "Une question ? Réponds simplement à cet e-mail.", signoff: "Bien à toi," },
  it: { subject: "Novità sulle tue recensioni – guarda la dashboard", title: "Novità nella tua dashboard", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"), p: "ci sono novità sulla rimozione delle tue recensioni:", st: { checking: "in verifica", in_progress: "in corso", removed: "rimossa ✓", not_removable: "non rimovibile (nessun costo)", software_offer: "possibile con software speciale", software_in_progress: "in corso (software speciale)", cancelled: "annullata" }, swHint: "Per le recensioni «possibili con software speciale» trovi il pulsante dell'acconto nella dashboard (300 a recensione, 50 % di acconto, 50 % dopo la rimozione).", btn: "Apri la mia dashboard", close: "Domande? Rispondi a questa e-mail.", signoff: "Un caro saluto," },
  nl: { subject: "Nieuws over uw reviews – bekijk uw dashboard", title: "Nieuws in uw dashboard", hi: (n) => (n ? `Beste ${n},` : "Hallo,"), p: "er is nieuws over het verwijderen van uw reviews:", st: { checking: "wordt gecontroleerd", in_progress: "in behandeling", removed: "verwijderd ✓", not_removable: "niet te verwijderen (geen kosten)", software_offer: "mogelijk met speciale software", software_in_progress: "in behandeling (speciale software)", cancelled: "geannuleerd" }, swHint: "Voor reviews die „mogelijk met speciale software” zijn, vindt u de knop voor de aanbetaling in uw dashboard (300 per review, 50 % aanbetaling, 50 % na verwijdering).", btn: "Mijn dashboard openen", close: "Vragen? Antwoord gewoon op deze e-mail.", signoff: "Met vriendelijke groet," },
  pt: { subject: "Novidades sobre as tuas avaliações – vê o teu painel", title: "Novidades no teu painel", hi: (n) => (n ? `Olá ${n},` : "Olá,"), p: "há novidades sobre a remoção das tuas avaliações:", st: { checking: "em verificação", in_progress: "em curso", removed: "removida ✓", not_removable: "não removível (sem custos)", software_offer: "possível com software especial", software_in_progress: "em curso (software especial)", cancelled: "cancelada" }, swHint: "Para as avaliações «possíveis com software especial» encontras o botão do sinal no teu painel (300 por avaliação, 50 % de sinal, 50 % após a remoção).", btn: "Abrir o meu painel", close: "Dúvidas? Responde a este e-mail.", signoff: "Cumprimentos," },
  ja: { subject: "口コミ削除の最新情報 – ダッシュボードをご確認ください", title: "ダッシュボードに更新があります", hi: (n) => (n ? `${n} 様` : "こんにちは。"), p: "口コミ削除の状況が更新されました：", st: { checking: "確認中", in_progress: "対応中", removed: "削除済み ✓", not_removable: "削除不可（料金なし）", software_offer: "特別ソフトウェアで削除可能", software_in_progress: "対応中（特別ソフトウェア）", cancelled: "キャンセル" }, swHint: "「特別ソフトウェアで削除可能」の口コミは、ダッシュボードから着手金をお支払いいただけます（1件300、着手金50%・削除後50%）。", btn: "ダッシュボードを開く", close: "ご不明な点は、このメールにご返信ください。", signoff: "よろしくお願いいたします。" },
  sv: { subject: "Nyheter om dina omdömen – se din dashboard", title: "Nyheter i din dashboard", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "det finns nyheter om borttagningen av dina omdömen:", st: { checking: "granskas", in_progress: "pågår", removed: "borttaget ✓", not_removable: "kan inte tas bort (ingen kostnad)", software_offer: "möjligt med särskild programvara", software_in_progress: "pågår (särskild programvara)", cancelled: "avbrutet" }, swHint: "För omdömen som är ”möjliga med särskild programvara” hittar du knappen för handpenningen i din dashboard (300 per omdöme, 50 % handpenning, 50 % efter borttagning).", btn: "Öppna min dashboard", close: "Frågor? Svara bara på det här mejlet.", signoff: "Vänliga hälsningar," },
  da: { subject: "Nyt om dine anmeldelser – se dit dashboard", title: "Nyt i dit dashboard", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "der er nyt om fjernelsen af dine anmeldelser:", st: { checking: "bliver tjekket", in_progress: "i gang", removed: "fjernet ✓", not_removable: "kan ikke fjernes (ingen betaling)", software_offer: "muligt med særlig software", software_in_progress: "i gang (særlig software)", cancelled: "annulleret" }, swHint: "For anmeldelser, der er „mulige med særlig software“, finder du knappen til depositummet i dit dashboard (300 pr. anmeldelse, 50 % depositum, 50 % efter fjernelse).", btn: "Åbn mit dashboard", close: "Spørgsmål? Svar bare på denne mail.", signoff: "Venlig hilsen," },
  no: { subject: "Nytt om omtalene dine – se dashbordet", title: "Nytt i dashbordet ditt", hi: (n) => (n ? `Hei ${n},` : "Hei,"), p: "det er nytt om fjerningen av omtalene dine:", st: { checking: "sjekkes", in_progress: "pågår", removed: "fjernet ✓", not_removable: "kan ikke fjernes (ingen kostnad)", software_offer: "mulig med spesiell programvare", software_in_progress: "pågår (spesiell programvare)", cancelled: "avbrutt" }, swHint: "For omtaler som er «mulige med spesiell programvare», finner du knappen for depositumet i dashbordet (300 per omtale, 50 % depositum, 50 % etter fjerning).", btn: "Åpne dashbordet mitt", close: "Spørsmål? Bare svar på denne e-posten.", signoff: "Vennlig hilsen," },
};

export interface KundenUpdateProps {
  lang?: string; name?: string; dashUrl: string; orderId?: string;
  changed: { url: string | null; name: string | null; status: St }[];
}
export function kundenUpdateSubject(p: KundenUpdateProps): string { return (T[p.lang && p.lang !== "de" ? p.lang : "en"] || T.en).subject; }

export default function KundenUpdateReviews({ lang = "en", name = "", dashUrl, orderId, changed }: KundenUpdateProps) {
  const l = lang && lang !== "de" && T[lang] ? lang : "en";
  const t = T[l];
  const hasSw = changed.some((c) => c.status === "software_offer");
  return (
    <EmailShell preview={t.subject} title={t.title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      <P>{t.p}{orderId ? <span style={{ color: brand.muted }}> · #{orderId}</span> : null}</P>
      {changed.length ? (
        <Bullets items={changed.map((c, i) => (
          <span key={i}>
            {c.url ? <a href={c.url} style={{ color: brand.accent, wordBreak: "break-all" }}>{c.name || c.url}</a> : <strong>{c.name}</strong>}
            {" — "}<strong>{t.st[c.status] || c.status}</strong>
          </span>
        ))} />
      ) : null}
      {hasSw ? <P>{t.swHint}</P> : null}
      <div style={{ textAlign: "center", margin: "10px 0 20px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <P>{t.close}</P>
      <P>{t.signoff}</P>
    </EmailShell>
  );
}
