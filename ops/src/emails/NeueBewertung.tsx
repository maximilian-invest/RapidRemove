/* Template: Bewertungs-Wächter (11.11.2026, Maximilian) – „Neue negative Bewertung auf Ihrem Profil“.
   Geht an Bestandskunden mit Bewertungs-Aufträgen, sobald auf ihrem Google-Profil eine neue (oder auf 1–3 ★ geänderte)
   Bewertung mit Text erscheint, die noch frisch genug für die Löschung ist. Je Bewertung: Screenshot (Inline-Bild),
   Verfasser, Sterne, Alter, Direktlink, „noch löschbar bis“. Button → Kunden-Dashboard mit vorausgefüllter Bewertung
   (bestätigen dort, abgebucht wird erst nach der Löschung). Abmeldelink unten. 11 Sprachen. */
import * as React from "react";
import { Img, Section, Text } from "@react-email/components";
import { EmailShell, P, NoteBox, CtaButton, Support, A, brand } from "./components";

type Lang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
export interface NeueBewertungItem { name: string; rating: number; rel?: string; text?: string; link?: string; img?: string; until?: string }
export interface NeueBewertungProps { lang?: Lang; first?: string; business?: string; items?: NeueBewertungItem[]; price?: string; dashUrl?: string; unsubUrl?: string }

type Tx = {
  subject: (b: string, n: number, s: number) => string; title: (n: number) => string; preview: (who: string, s: number) => string;
  hi: (f?: string) => string; intro: (b: string, n: number) => string; view: string; until: (d: string) => string;
  why: string; price: (p: string) => string; cta: (n: number) => string; ignore: string; foot: string; unsub: string;
};
const T: Record<Lang, Tx> = {
  de: {
    subject: (b, n, s) => n > 1 ? `${n} neue negative Bewertungen bei ${b}` : `Neue ${s}-Sterne-Bewertung bei ${b}`,
    title: (n) => n > 1 ? "Neue negative Bewertungen" : "Neue negative Bewertung",
    preview: (w, s) => `${w} hat ${s} Stern${s === 1 ? "" : "e"} vergeben – die Bewertung ist noch löschbar.`,
    hi: (f) => f ? `Guten Tag ${f},` : "Guten Tag,",
    intro: (b, n) => n > 1 ? `auf Ihrem Google Business Profil ${b} sind ${n} neue negative Bewertungen erschienen:` : `auf Ihrem Google Business Profil ${b} ist eine neue negative Bewertung erschienen:`,
    view: "Bewertung bei Google ansehen", until: (d) => `Noch löschbar bis ca. ${d}`,
    why: "Frische Bewertungen (jünger als 4 Wochen) können wir in der Regel innerhalb von 1–3 Tagen entfernen lassen, wenn sie gegen die Google-Richtlinien verstoßen. Danach ist eine Löschung nicht mehr möglich – je früher, desto besser.",
    price: (p) => `${p} pro Bewertung – nur bei Erfolg. Vorab wird nichts abgebucht, Ihre hinterlegte Zahlungsart wird erst nach der Löschung belastet.`,
    cta: (n) => n > 1 ? "Bewertungen entfernen lassen" : "Bewertung entfernen lassen",
    ignore: "Ist die Bewertung berechtigt oder möchten Sie nichts unternehmen? Dann ignorieren Sie diese E-Mail einfach.",
    foot: "Sie erhalten diese Nachricht, weil Sie RapidRemove-Kunde sind und wir Ihr Profil auf neue negative Bewertungen überwachen.", unsub: "Keine solchen Hinweise mehr erhalten",
  },
  en: {
    subject: (b, n, s) => n > 1 ? `${n} new negative reviews on ${b}` : `New ${s}-star review on ${b}`,
    title: (n) => n > 1 ? "New negative reviews" : "New negative review",
    preview: (w, s) => `${w} left ${s} star${s === 1 ? "" : "s"} – the review can still be removed.`,
    hi: (f) => f ? `Hello ${f},` : "Hello,",
    intro: (b, n) => n > 1 ? `${n} new negative reviews have appeared on your Google Business Profile ${b}:` : `a new negative review has appeared on your Google Business Profile ${b}:`,
    view: "View review on Google", until: (d) => `Can still be removed until approx. ${d}`,
    why: "Fresh reviews (less than 4 weeks old) can usually be removed within 1–3 days if they violate Google's policies. After that, removal is no longer possible – the sooner, the better.",
    price: (p) => `${p} per review – only if successful. Nothing is charged in advance; your saved payment method is only charged after the removal.`,
    cta: (n) => n > 1 ? "Have these reviews removed" : "Have this review removed",
    ignore: "Is the review justified, or would you rather not take action? Then simply ignore this email.",
    foot: "You're receiving this message because you're a RapidRemove customer and we monitor your profile for new negative reviews.", unsub: "Stop these alerts",
  },
  es: {
    subject: (b, n, s) => n > 1 ? `${n} nuevas reseñas negativas en ${b}` : `Nueva reseña de ${s} estrella${s === 1 ? "" : "s"} en ${b}`,
    title: (n) => n > 1 ? "Nuevas reseñas negativas" : "Nueva reseña negativa",
    preview: (w, s) => `${w} ha dado ${s} estrella${s === 1 ? "" : "s"}: la reseña aún se puede eliminar.`,
    hi: (f) => f ? `Hola, ${f}:` : "Hola:",
    intro: (b, n) => n > 1 ? `han aparecido ${n} nuevas reseñas negativas en su perfil de empresa de Google ${b}:` : `ha aparecido una nueva reseña negativa en su perfil de empresa de Google ${b}:`,
    view: "Ver la reseña en Google", until: (d) => `Se puede eliminar hasta aprox. el ${d}`,
    why: "Las reseñas recientes (de menos de 4 semanas) normalmente se pueden eliminar en 1–3 días si infringen las políticas de Google. Después ya no es posible: cuanto antes, mejor.",
    price: (p) => `${p} por reseña, solo si tiene éxito. No se cobra nada por adelantado; su método de pago guardado solo se carga tras la eliminación.`,
    cta: (n) => n > 1 ? "Solicitar la eliminación" : "Solicitar la eliminación",
    ignore: "¿La reseña está justificada o prefiere no hacer nada? Entonces ignore este correo.",
    foot: "Recibe este mensaje porque es cliente de RapidRemove y supervisamos su perfil por si aparecen nuevas reseñas negativas.", unsub: "No recibir más estos avisos",
  },
  fr: {
    subject: (b, n, s) => n > 1 ? `${n} nouveaux avis négatifs sur ${b}` : `Nouvel avis ${s} étoile${s === 1 ? "" : "s"} sur ${b}`,
    title: (n) => n > 1 ? "Nouveaux avis négatifs" : "Nouvel avis négatif",
    preview: (w, s) => `${w} a donné ${s} étoile${s === 1 ? "" : "s"} – l'avis peut encore être supprimé.`,
    hi: (f) => f ? `Bonjour ${f},` : "Bonjour,",
    intro: (b, n) => n > 1 ? `${n} nouveaux avis négatifs sont apparus sur votre fiche d'établissement Google ${b} :` : `un nouvel avis négatif est apparu sur votre fiche d'établissement Google ${b} :`,
    view: "Voir l'avis sur Google", until: (d) => `Supprimable jusqu'au ${d} environ`,
    why: "Les avis récents (moins de 4 semaines) peuvent généralement être supprimés en 1 à 3 jours s'ils enfreignent les règles de Google. Ensuite, ce n'est plus possible – le plus tôt sera le mieux.",
    price: (p) => `${p} par avis – uniquement en cas de succès. Rien n'est prélevé à l'avance ; votre moyen de paiement enregistré n'est débité qu'après la suppression.`,
    cta: (n) => n > 1 ? "Faire supprimer ces avis" : "Faire supprimer cet avis",
    ignore: "L'avis est justifié ou vous préférez ne rien faire ? Ignorez simplement cet e-mail.",
    foot: "Vous recevez ce message car vous êtes client RapidRemove et nous surveillons votre fiche pour détecter les nouveaux avis négatifs.", unsub: "Ne plus recevoir ces alertes",
  },
  it: {
    subject: (b, n, s) => n > 1 ? `${n} nuove recensioni negative su ${b}` : `Nuova recensione a ${s} stell${s === 1 ? "a" : "e"} su ${b}`,
    title: (n) => n > 1 ? "Nuove recensioni negative" : "Nuova recensione negativa",
    preview: (w, s) => `${w} ha dato ${s} stell${s === 1 ? "a" : "e"}: la recensione si può ancora rimuovere.`,
    hi: (f) => f ? `Buongiorno ${f},` : "Buongiorno,",
    intro: (b, n) => n > 1 ? `sul tuo profilo dell'attività su Google ${b} sono comparse ${n} nuove recensioni negative:` : `sul tuo profilo dell'attività su Google ${b} è comparsa una nuova recensione negativa:`,
    view: "Vedi la recensione su Google", until: (d) => `Rimovibile fino al ${d} circa`,
    why: "Le recensioni recenti (meno di 4 settimane) di solito si possono far rimuovere in 1–3 giorni se violano le norme di Google. Dopo non è più possibile: prima si agisce, meglio è.",
    price: (p) => `${p} a recensione – solo in caso di successo. Nulla viene addebitato in anticipo; il metodo di pagamento salvato viene addebitato solo dopo la rimozione.`,
    cta: (n) => n > 1 ? "Fai rimuovere le recensioni" : "Fai rimuovere la recensione",
    ignore: "La recensione è giustificata o preferisci non fare nulla? Allora ignora semplicemente questa e-mail.",
    foot: "Ricevi questo messaggio perché sei cliente RapidRemove e monitoriamo il tuo profilo per nuove recensioni negative.", unsub: "Non ricevere più questi avvisi",
  },
  nl: {
    subject: (b, n, s) => n > 1 ? `${n} nieuwe negatieve reviews op ${b}` : `Nieuwe ${s}-sterrenreview op ${b}`,
    title: (n) => n > 1 ? "Nieuwe negatieve reviews" : "Nieuwe negatieve review",
    preview: (w, s) => `${w} gaf ${s} ster${s === 1 ? "" : "ren"} – de review kan nog worden verwijderd.`,
    hi: (f) => f ? `Goedendag ${f},` : "Goedendag,",
    intro: (b, n) => n > 1 ? `er zijn ${n} nieuwe negatieve reviews verschenen op uw Google-bedrijfsprofiel ${b}:` : `er is een nieuwe negatieve review verschenen op uw Google-bedrijfsprofiel ${b}:`,
    view: "Review bekijken op Google", until: (d) => `Nog te verwijderen tot ca. ${d}`,
    why: "Recente reviews (jonger dan 4 weken) kunnen meestal binnen 1–3 dagen worden verwijderd als ze in strijd zijn met de richtlijnen van Google. Daarna is dat niet meer mogelijk – hoe eerder, hoe beter.",
    price: (p) => `${p} per review – alleen bij succes. Er wordt vooraf niets afgeschreven; uw opgeslagen betaalmethode wordt pas na de verwijdering belast.`,
    cta: (n) => n > 1 ? "Reviews laten verwijderen" : "Review laten verwijderen",
    ignore: "Is de review terecht of wilt u niets doen? Negeer deze e-mail dan gewoon.",
    foot: "U ontvangt dit bericht omdat u klant bent bij RapidRemove en wij uw profiel bewaken op nieuwe negatieve reviews.", unsub: "Geen meldingen meer ontvangen",
  },
  pt: {
    subject: (b, n, s) => n > 1 ? `${n} novas avaliações negativas em ${b}` : `Nova avaliação de ${s} estrela${s === 1 ? "" : "s"} em ${b}`,
    title: (n) => n > 1 ? "Novas avaliações negativas" : "Nova avaliação negativa",
    preview: (w, s) => `${w} deu ${s} estrela${s === 1 ? "" : "s"} – a avaliação ainda pode ser removida.`,
    hi: (f) => f ? `Olá ${f},` : "Olá,",
    intro: (b, n) => n > 1 ? `surgiram ${n} novas avaliações negativas no seu perfil de empresa do Google ${b}:` : `surgiu uma nova avaliação negativa no seu perfil de empresa do Google ${b}:`,
    view: "Ver a avaliação no Google", until: (d) => `Ainda pode ser removida até cerca de ${d}`,
    why: "As avaliações recentes (com menos de 4 semanas) podem normalmente ser removidas em 1–3 dias se violarem as políticas do Google. Depois disso já não é possível – quanto mais cedo, melhor.",
    price: (p) => `${p} por avaliação – só em caso de sucesso. Nada é cobrado antecipadamente; o seu método de pagamento guardado só é debitado após a remoção.`,
    cta: (n) => n > 1 ? "Pedir a remoção" : "Pedir a remoção",
    ignore: "A avaliação é justificada ou prefere não fazer nada? Então ignore simplesmente este e-mail.",
    foot: "Recebe esta mensagem porque é cliente da RapidRemove e monitorizamos o seu perfil para detetar novas avaliações negativas.", unsub: "Deixar de receber estes avisos",
  },
  ja: {
    subject: (b, n, s) => n > 1 ? `${b}に新しい低評価のクチコミが${n}件` : `${b}に新しい星${s}のクチコミ`,
    title: (n) => n > 1 ? "新しい低評価のクチコミ" : "新しい低評価のクチコミ",
    preview: (w, s) => `${w}さんが星${s}を付けました。まだ削除可能です。`,
    hi: (f) => f ? `${f}様` : "ご担当者様",
    intro: (b, n) => n > 1 ? `Googleビジネスプロフィール「${b}」に新しい低評価のクチコミが${n}件投稿されました。` : `Googleビジネスプロフィール「${b}」に新しい低評価のクチコミが投稿されました。`,
    view: "Googleでクチコミを見る", until: (d) => `削除可能期限：${d}頃まで`,
    why: "投稿から4週間以内のクチコミは、Googleのポリシーに違反している場合、通常1〜3日で削除できます。それを過ぎると削除はできません。お早めのご対応をおすすめします。",
    price: (p) => `1件あたり${p}（成功報酬）。事前の請求はなく、ご登録のお支払い方法への請求は削除完了後のみです。`,
    cta: () => "削除を依頼する",
    ignore: "正当なクチコミである場合や、対応をご希望でない場合は、このメールを無視してください。",
    foot: "RapidRemoveをご利用いただいており、プロフィールの新しい低評価クチコミを監視しているため、このメッセージをお送りしています。", unsub: "今後この通知を受け取らない",
  },
  sv: {
    subject: (b, n, s) => n > 1 ? `${n} nya negativa recensioner på ${b}` : `Ny recension med ${s} stjärn${s === 1 ? "a" : "or"} på ${b}`,
    title: (n) => n > 1 ? "Nya negativa recensioner" : "Ny negativ recension",
    preview: (w, s) => `${w} gav ${s} stjärn${s === 1 ? "a" : "or"} – recensionen kan fortfarande tas bort.`,
    hi: (f) => f ? `Hej ${f},` : "Hej,",
    intro: (b, n) => n > 1 ? `${n} nya negativa recensioner har dykt upp på din Google-företagsprofil ${b}:` : `en ny negativ recension har dykt upp på din Google-företagsprofil ${b}:`,
    view: "Se recensionen på Google", until: (d) => `Kan tas bort till ca ${d}`,
    why: "Färska recensioner (yngre än 4 veckor) kan vi oftast få borttagna inom 1–3 dagar om de bryter mot Googles riktlinjer. Därefter går det inte längre – ju förr, desto bättre.",
    price: (p) => `${p} per recension – endast vid framgång. Inget dras i förväg; din sparade betalningsmetod debiteras först efter borttagningen.`,
    cta: (n) => n > 1 ? "Få recensionerna borttagna" : "Få recensionen borttagen",
    ignore: "Är recensionen befogad eller vill du inte göra något? Ignorera då bara det här mejlet.",
    foot: "Du får det här meddelandet eftersom du är kund hos RapidRemove och vi övervakar din profil för nya negativa recensioner.", unsub: "Sluta få dessa aviseringar",
  },
  da: {
    subject: (b, n, s) => n > 1 ? `${n} nye negative anmeldelser på ${b}` : `Ny anmeldelse med ${s} stjerne${s === 1 ? "" : "r"} på ${b}`,
    title: (n) => n > 1 ? "Nye negative anmeldelser" : "Ny negativ anmeldelse",
    preview: (w, s) => `${w} gav ${s} stjerne${s === 1 ? "" : "r"} – anmeldelsen kan stadig fjernes.`,
    hi: (f) => f ? `Hej ${f},` : "Hej,",
    intro: (b, n) => n > 1 ? `der er kommet ${n} nye negative anmeldelser på din Google-virksomhedsprofil ${b}:` : `der er kommet en ny negativ anmeldelse på din Google-virksomhedsprofil ${b}:`,
    view: "Se anmeldelsen på Google", until: (d) => `Kan fjernes indtil ca. ${d}`,
    why: "Nye anmeldelser (under 4 uger gamle) kan vi som regel få fjernet inden for 1–3 dage, hvis de overtræder Googles retningslinjer. Derefter er det ikke længere muligt – jo før, jo bedre.",
    price: (p) => `${p} pr. anmeldelse – kun ved succes. Der trækkes intet på forhånd; din gemte betalingsmetode belastes først efter fjernelsen.`,
    cta: (n) => n > 1 ? "Få anmeldelserne fjernet" : "Få anmeldelsen fjernet",
    ignore: "Er anmeldelsen berettiget, eller vil du ikke gøre noget? Så ignorer blot denne e-mail.",
    foot: "Du modtager denne besked, fordi du er kunde hos RapidRemove, og vi overvåger din profil for nye negative anmeldelser.", unsub: "Modtag ikke flere af disse beskeder",
  },
  no: {
    subject: (b, n, s) => n > 1 ? `${n} nye negative anmeldelser på ${b}` : `Ny anmeldelse med ${s} stjerne${s === 1 ? "" : "r"} på ${b}`,
    title: (n) => n > 1 ? "Nye negative anmeldelser" : "Ny negativ anmeldelse",
    preview: (w, s) => `${w} ga ${s} stjerne${s === 1 ? "" : "r"} – anmeldelsen kan fortsatt fjernes.`,
    hi: (f) => f ? `Hei ${f},` : "Hei,",
    intro: (b, n) => n > 1 ? `det har kommet ${n} nye negative anmeldelser på Google-bedriftsprofilen din ${b}:` : `det har kommet en ny negativ anmeldelse på Google-bedriftsprofilen din ${b}:`,
    view: "Se anmeldelsen på Google", until: (d) => `Kan fjernes til ca. ${d}`,
    why: "Ferske anmeldelser (yngre enn 4 uker) kan vi som regel få fjernet innen 1–3 dager hvis de bryter Googles retningslinjer. Etter det er det ikke lenger mulig – jo før, jo bedre.",
    price: (p) => `${p} per anmeldelse – kun ved suksess. Ingenting trekkes på forhånd; den lagrede betalingsmetoden din belastes først etter fjerningen.`,
    cta: (n) => n > 1 ? "Få anmeldelsene fjernet" : "Få anmeldelsen fjernet",
    ignore: "Er anmeldelsen berettiget, eller vil du ikke gjøre noe? Da kan du bare ignorere denne e-posten.",
    foot: "Du mottar denne meldingen fordi du er kunde hos RapidRemove og vi overvåker profilen din for nye negative anmeldelser.", unsub: "Ikke motta flere slike varsler",
  },
};
const pick = (lang?: string) => T[(lang as Lang)] || T.en;
const stars = (n: number) => "★★★★★".slice(0, Math.max(0, Math.min(5, n))) + "☆☆☆☆☆".slice(0, 5 - Math.max(0, Math.min(5, n)));

export function subject(p: NeueBewertungProps = {}): string {
  const items = p.items || [];
  return pick(p.lang).subject(p.business || "Google", Math.max(1, items.length), items[0]?.rating || 1);
}

export default function NeueBewertung({ lang = "en", first, business = "Miami Luxury Motors", items = [], price = "$199", dashUrl, unsubUrl }: NeueBewertungProps = {}) {
  const t = pick(lang);
  const list = items.length ? items : [{ name: "Daniella Rocha", rating: 1, rel: "a week ago", text: "", link: "#", until: "Nov 30, 2026" }];
  const n = list.length;
  return (
    <EmailShell preview={t.preview(list[0].name, list[0].rating)} title={t.title(n)} lang={lang}>
      <P><strong>{t.hi(first)}</strong></P>
      <P>{t.intro(business, n)}</P>
      {list.map((it, i) => (
        <Section key={i} style={{ border: `1px solid ${brand.hr}`, borderRadius: 20, overflow: "hidden", margin: "6px 0 16px" }}>
          {it.img ? (
            <a href={it.link || "#"} style={{ display: "block", textDecoration: "none" }}>
              <Img src={it.img} width="494" alt={`${it.name} · ${it.rating}★ · ${(it.text || "").slice(0, 120)}`} style={{ display: "block", width: "100%", maxWidth: 494, height: "auto", borderBottom: `1px solid ${brand.hr}` }} />
            </a>
          ) : it.text ? (
            <Text style={{ margin: 0, padding: "16px 18px 0", fontSize: 15, lineHeight: "1.55", color: brand.text, fontStyle: "italic" }}>„{it.text.length > 400 ? it.text.slice(0, 400) + "…" : it.text}“</Text>
          ) : null}
          <Section style={{ padding: "14px 18px 16px" }}>
            <Text style={{ margin: 0, fontSize: 15, lineHeight: "1.5", color: brand.ink }}>
              <strong>{it.name}</strong>&nbsp;&nbsp;<span style={{ color: "#f5a623", letterSpacing: 1 }}>{stars(it.rating)}</span>{it.rel ? <span style={{ color: brand.muted }}>&nbsp;·&nbsp;{it.rel}</span> : null}
            </Text>
            {it.until ? <Text style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "1.5", color: brand.accentDark, fontWeight: 700 }}>⏱ {t.until(it.until)}</Text> : null}
            {it.link ? <Text style={{ margin: "6px 0 0", fontSize: 14, lineHeight: "1.5" }}><A href={it.link}>{t.view} →</A></Text> : null}
          </Section>
        </Section>
      ))}
      <P>{t.why}</P>
      <NoteBox><strong>{t.price(price)}</strong></NoteBox>
      {dashUrl ? <P><CtaButton href={dashUrl} variant="pay" full>{t.cta(n)}</CtaButton></P> : null}
      <P muted>{t.ignore}</P>
      <Support lang={lang} />
      <P muted>{t.foot}{unsubUrl ? <> <A href={unsubUrl}>{t.unsub}</A></> : null}</P>
    </EmailShell>
  );
}
