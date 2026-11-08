/* Liste der abgerechneten (gelöschten) Bewertungen – Name des Bewerters + Direktlink zur Bewertung (08.11.2026).
   Maximilian: „In alle Mails, wenn eine Bewertung abgerechnet wird – egal ob Zahlung fehlgeschlagen oder was auch immer –
   müssen alle Links zu den gelöschten Bewertungen mit dem Namen des Bewerters stehen."
   Eingesetzt in: Zahlung fehlgeschlagen, Rechnung (automatische Abbuchung), Löschbestätigung + Rechnung, Mahnung,
   automatische Zahlungserinnerung, Zahlungsbestätigung Wise/PayPal. */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { brand } from "./components";

export type BilledReview = { name?: string | null; url?: string | null; text?: string | null };

const H: Record<string, (n: number) => string> = {
  de: (n) => (n === 1 ? "Gelöschte Bewertung" : `Gelöschte Bewertungen (${n})`),
  en: (n) => (n === 1 ? "Removed review" : `Removed reviews (${n})`),
  es: (n) => (n === 1 ? "Reseña eliminada" : `Reseñas eliminadas (${n})`),
  fr: (n) => (n === 1 ? "Avis supprimé" : `Avis supprimés (${n})`),
  it: (n) => (n === 1 ? "Recensione rimossa" : `Recensioni rimosse (${n})`),
  nl: (n) => (n === 1 ? "Verwijderde review" : `Verwijderde reviews (${n})`),
  pt: (n) => (n === 1 ? "Avaliação removida" : `Avaliações removidas (${n})`),
  ja: (n) => `削除された口コミ（${n}件）`,
  sv: (n) => (n === 1 ? "Borttaget omdöme" : `Borttagna omdömen (${n})`),
  da: (n) => (n === 1 ? "Fjernet anmeldelse" : `Fjernede anmeldelser (${n})`),
  no: (n) => (n === 1 ? "Fjernet omtale" : `Fjernede omtaler (${n})`),
};
/** Kein Name bekannt (nur Link eingereicht). */
const NO_NAME: Record<string, string> = { de: "Bewertung", en: "Review", es: "Reseña", fr: "Avis", it: "Recensione", nl: "Review", pt: "Avaliação", ja: "口コミ", sv: "Omdöme", da: "Anmeldelse", no: "Omtale" };
/** Hinweis unter der Liste: Link öffnen = selbst prüfen, dass die Bewertung weg ist. */
const HINT: Record<string, string> = {
  de: "Ein Klick auf den Link zeigt Ihnen, dass die Bewertung nicht mehr verfügbar ist.",
  en: "Open a link to see for yourself that the review is no longer available.",
  es: "Abre un enlace para comprobar que la reseña ya no está disponible.",
  fr: "Ouvre un lien pour vérifier toi-même que l'avis n'est plus disponible.",
  it: "Apri un link per verificare tu stesso che la recensione non è più disponibile.",
  nl: "Open een link om zelf te zien dat de review niet meer beschikbaar is.",
  pt: "Abre um link para confirmares que a avaliação já não está disponível.",
  ja: "リンクを開くと、口コミが表示されなくなったことをご確認いただけます。",
  sv: "Öppna en länk för att själv se att omdömet inte längre är tillgängligt.",
  da: "Åbn et link for selv at se, at anmeldelsen ikke længere er tilgængelig.",
  no: "Åpne en lenke for å se selv at omtalen ikke lenger er tilgjengelig.",
};

/** Lesbarer Linktext: Host + Anfang des Pfads (Google-Direktlinks sind oft 200+ Zeichen lang). */
export function shortUrl(u: string): string {
  try {
    const x = new URL(u);
    const s = (x.host.replace(/^www\./, "") + x.pathname + (x.search || "")).replace(/\/$/, "");
    return s.length > 48 ? s.slice(0, 46) + "…" : s;
  } catch { return u.length > 48 ? u.slice(0, 46) + "…" : u; }
}

/** Gleiche Bewertung nicht doppelt zeigen (Schlüssel wie customers.ts keyOf). */
export function dedupeReviews(items: BilledReview[]): BilledReview[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const k = it.url || `${it.name || ""}|${it.text || ""}`;
    if (!k || k === "|" || seen.has(k)) return false;
    seen.add(k); return true;
  });
}

export function BilledReviewList({ lang = "en", items, heading }: { lang?: string; items?: BilledReview[] | null; heading?: string }) {
  const list = dedupeReviews(items || []);
  if (!list.length) return null;
  const l = String(lang || "en").slice(0, 2);
  const h = heading || (H[l] || H.en)(list.length);
  const hasLink = list.some((it) => !!it.url);
  return (
    <Section style={{ background: brand.tint, borderRadius: 20, padding: "16px 18px", margin: "6px 0 16px" }}>
      <Text style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: brand.ink }}>{h}</Text>
      {list.map((it, i) => {
        const name = String(it.name || "").trim();
        const text = String(it.text || "").trim();
        return (
          <Text key={i} style={{ margin: i === list.length - 1 ? 0 : "0 0 10px", fontSize: 14.5, lineHeight: "1.45", color: brand.text }}>
            <span style={{ color: brand.ink, fontWeight: 800 }}>✓</span>&nbsp;&nbsp;<strong>{name || `${NO_NAME[l] || NO_NAME.en} ${i + 1}`}</strong>
            {it.url
              ? <><br /><span style={{ paddingLeft: 20, display: "inline-block" }}><a href={it.url} style={{ color: brand.ink, textDecoration: "underline", wordBreak: "break-all" }}>{shortUrl(it.url)}</a></span></>
              : text ? <><br /><span style={{ paddingLeft: 20, display: "inline-block", color: brand.muted }}>“{text.length > 140 ? text.slice(0, 138) + "…" : text}”</span></> : null}
          </Text>
        );
      })}
      {hasLink ? <Text style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: "1.45", color: brand.muted }}>{HINT[l] || HINT.en}</Text> : null}
    </Section>
  );
}
