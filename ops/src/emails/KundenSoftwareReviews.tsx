/* Eigene Mail für den Fall „nur mit Spezial-Software löschbar" (Einzelbewertungen).
   Aufbau: gute Nachricht (löschbar) → der Haken (nur per Software, Vorauszahlung) → Konditionen →
   Entscheidung im Dashboard (zahlen oder kostenlos ablehnen). Andere Änderungen derselben Sammel-Mail
   (gelöscht, nicht löschbar …) stehen klein darunter, damit der Kunde nur EINE Mail bekommt.
   Sprachen: vorerst EN + DE; für alle anderen geht weiter KundenUpdateReviews raus (SW_MAIL_LANGS). */
import * as React from "react";
import { Section, Text } from "@react-email/components";
import { EmailShell, P, Bullets, CtaButton, brand, type MailLang } from "./components";
import { fmtReviewMoney } from "../reviewsPricing";

export const SW_MAIL_LANGS = new Set(["en", "de"]);

type Item = { url: string | null; name: string | null; status: string; from?: string | null };

interface L {
  subject: (n: number) => string; title: string; hi: (n: string) => string;
  intro: (order: string) => string;
  goodH: string; good: (n: number) => string;
  badH: string; bad: (n: number) => string;
  terms: (price: string) => string[];
  decide: (n: number) => string; decline: string;
  btn: string; others: string; st: Record<string, string>; close: string; signoff: string;
}

const T: Record<string, L> = {
  en: {
    subject: (n) => `Good news and bad news about your review${n > 1 ? "s" : ""}`,
    title: "Good news – with one catch",
    hi: (n) => (n ? `Hi ${n},` : "Hi there,"),
    intro: (o) => `we have an update on your order${o ? ` #${o}` : ""} – some good news and some bad news.`,
    goodH: "The good news",
    good: (n) => (n > 1 ? `These ${n} reviews can be removed:` : "This review can be removed:"),
    badH: "The catch",
    bad: (n) => `Google won't take ${n > 1 ? "them" : "it"} down through the standard route. ${n > 1 ? "They" : "It"} can only be removed with our special software – a separate, more involved process that is paid in advance.`,
    terms: (p) => [`${p} per review, paid in advance`, "99 % success rate", "Full refund if a review isn't removed within 14 days at the latest"],
    decide: (n) => `Just tell us in your dashboard how you'd like to proceed${n > 1 ? " – you can decide for each review separately" : ""}.`,
    decline: "Prefer not to? Decline with one click – it costs you nothing, and the rest of your order isn't affected.",
    btn: "Decide in my dashboard",
    others: "Other updates on your order:",
    st: { removed: "removed ✓", notpossible: "can't be removed (no charge)", working: "in progress", new: "being checked", sw_accepted: "in progress (special software)", sw_declined: "declined (no charge)", cancelled: "cancelled" },
    close: "Questions? Just reply to this email.",
    signoff: "Warm regards,",
  },
  de: {
    subject: (n) => `Gute und schlechte Nachrichten zu Ihre${n > 1 ? "n Bewertungen" : "r Bewertung"}`,
    title: "Gute Nachricht – mit einem Haken",
    hi: (n) => (n ? `Guten Tag ${n},` : "Guten Tag,"),
    intro: (o) => `es gibt Neuigkeiten zu Ihrem Auftrag${o ? ` #${o}` : ""} – eine gute und eine schlechte Nachricht.`,
    goodH: "Die gute Nachricht",
    good: (n) => (n > 1 ? `Diese ${n} Bewertungen können gelöscht werden:` : "Diese Bewertung kann gelöscht werden:"),
    badH: "Der Haken",
    bad: (n) => `Google entfernt sie nicht über den normalen Weg. ${n > 1 ? "Sie lassen" : "Sie lässt"} sich nur mit unserer Spezial-Software löschen – ein eigenes, aufwendigeres Verfahren, das im Voraus bezahlt wird.`,
    terms: (p) => [`${p} pro Bewertung, im Voraus`, "99 % Erfolgsquote", "Volle Rückerstattung, falls eine Bewertung nicht spätestens nach 14 Tagen gelöscht ist"],
    decide: (n) => `Sagen Sie uns einfach in Ihrem Dashboard, wie Sie weitermachen möchten${n > 1 ? " – Sie können für jede Bewertung einzeln entscheiden" : ""}.`,
    decline: "Lieber nicht? Mit einem Klick ablehnen – das kostet Sie nichts, und der Rest Ihres Auftrags läuft unverändert weiter.",
    btn: "Im Dashboard entscheiden",
    others: "Weitere Neuigkeiten zu Ihrem Auftrag:",
    st: { removed: "gelöscht ✓", notpossible: "nicht löschbar (keine Kosten)", working: "in Bearbeitung", new: "wird geprüft", sw_accepted: "in Bearbeitung (Spezial-Software)", sw_declined: "abgelehnt (keine Kosten)", cancelled: "storniert" },
    close: "Fragen? Antworten Sie einfach auf diese E-Mail.",
    signoff: "Mit freundlichen Grüßen,",
  },
};

export interface KundenSoftwareProps {
  lang?: string; name?: string; dashUrl: string; orderId?: string;
  changed: Item[]; cur?: string; swPrice?: number;
}
const tOf = (lang?: string) => T[lang && T[lang] ? lang : "en"];
export const kundenSoftwareSubject = (p: KundenSoftwareProps) => tOf(p.lang).subject(p.changed.filter((c) => c.status === "software").length);

function Box({ bg, border, children }: { bg: string; border: string; children: React.ReactNode }) {
  return <Section style={{ background: bg, borderLeft: `4px solid ${border}`, borderRadius: 16, padding: "14px 18px", margin: "6px 0 14px" }}>{children}</Section>;
}
const H = ({ c, children }: { c: string; children: React.ReactNode }) => (
  <Text style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: c }}>{children}</Text>
);
const link = (c: Item) => (c.url
  ? <a href={c.url} style={{ color: brand.ink, fontWeight: 700, wordBreak: "break-all" }}>{c.name || c.url}</a>
  : <strong>{c.name}</strong>);

export default function KundenSoftwareReviews({ lang = "en", name = "", dashUrl, orderId, changed, cur = "usd", swPrice = 300 }: KundenSoftwareProps) {
  const l = lang && T[lang] ? lang : "en";
  const t = T[l];
  const sw = changed.filter((c) => c.status === "software");
  const others = changed.filter((c) => c.status !== "software");
  const n = sw.length;
  const price = fmtReviewMoney(swPrice, cur);
  return (
    <EmailShell preview={t.subject(n)} title={t.title} lang={l as MailLang}>
      <P><strong>{t.hi((name || "").trim())}</strong></P>
      <P>{t.intro(orderId || "")}</P>

      <Box bg="#e9f9ef" border="#16a34a">
        <H c="#15803d">{t.goodH}</H>
        <Text style={{ margin: "0 0 4px", fontSize: 15, lineHeight: "1.55", color: brand.text }}>{t.good(n)}</Text>
        <Bullets items={sw.map((c, i) => <span key={i}>{link(c)}</span>)} />
      </Box>

      <Box bg="#fff4e5" border={brand.accent}>
        <H c={brand.accentDark}>{t.badH}</H>
        <Text style={{ margin: 0, fontSize: 15, lineHeight: "1.55", color: brand.text }}>{t.bad(n)}</Text>
      </Box>

      <Bullets items={t.terms(price).map((x, i) => <strong key={i}>{x}</strong>)} />
      <P>{t.decide(n)}</P>
      <div style={{ textAlign: "center", margin: "10px 0 18px" }}><CtaButton href={dashUrl}>{t.btn}</CtaButton></div>
      <P muted>{t.decline}</P>

      {others.length ? (
        <>
          <P>{t.others}</P>
          <Bullets items={others.map((c, i) => <span key={i}>{link(c)}{" — "}<strong>{t.st[c.status] || c.status}</strong></span>)} />
        </>
      ) : null}

      <P>{t.close}</P>
      <P>{t.signoff}<br />RapidRemove</P>
    </EmailShell>
  );
}
