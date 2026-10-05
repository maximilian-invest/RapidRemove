/* Einmalige Einladung für Bestandskunden (Einzelbewertungen): „Ihr persönliches Dashboard ist da"
   mit persönlichem Login-Link (?k=…, 30 Tage) – ein Klick, eingeloggt, kein Passwort nötig. */
import * as React from "react";
import { Img, Section } from "@react-email/components";
import { EmailShell, P, CtaButton, brand, type MailLang } from "./components";

type L = { subj: string; title: string; hi: (n: string) => string; p: string; f: [string, string][]; btn: string; note: string; later: string; sign: string };
const T: Record<string, L> = {
  en: { subj: "Your personal dashboard is ready", title: "Track your reviews live", hi: (n) => (n ? `Hi ${n},` : "Hi there,"), p: "from now on you can follow the removal of your Google reviews in your own dashboard – every review, every status change and all payments in one place.",
    f: [["Live status", "See which reviews are being worked on and which are already gone."], ["Notifications", "We email you as soon as something changes."], ["Payments & invoices", "Pay with one tap – you only pay for removed reviews."]],
    btn: "Open my dashboard", note: "The button logs you in directly – no password needed (valid for 30 days).", later: "Later just go to rapid-remove.com/my-reviews. No password yet? Tap “Forgot password?” and we’ll send you a link.", sign: "Your RapidRemove team" },
  de: { subj: "Ihr persönliches Dashboard ist da", title: "Ihre Bewertungen live verfolgen", hi: (n) => (n ? `Hallo ${n},` : "Hallo,"), p: "ab sofort können Sie die Löschung Ihrer Google-Bewertungen in Ihrem eigenen Dashboard verfolgen – jede Bewertung, jede Statusänderung und alle Zahlungen an einem Ort.",
    f: [["Status live", "Sehen Sie, welche Bewertungen gerade bearbeitet werden und welche schon weg sind."], ["Benachrichtigungen", "Wir schreiben Ihnen, sobald sich etwas ändert."], ["Zahlungen & Rechnungen", "Mit einem Tipp bezahlen – Sie zahlen nur für gelöschte Bewertungen."]],
    btn: "Mein Dashboard öffnen", note: "Der Button meldet Sie direkt an – ohne Passwort (30 Tage gültig).", later: "Später einfach rapid-remove.com/my-reviews öffnen. Noch kein Passwort? Tippen Sie auf „Passwort vergessen?“ – wir schicken Ihnen einen Link.", sign: "Ihr RapidRemove-Team" },
  es: { subj: "Tu panel personal ya está listo", title: "Sigue tus reseñas en directo", hi: (n) => (n ? `Hola ${n}:` : "Hola:"), p: "a partir de ahora puedes seguir la eliminación de tus reseñas de Google en tu propio panel: cada reseña, cada cambio de estado y todos los pagos en un solo lugar.",
    f: [["Estado en directo", "Mira qué reseñas estamos trabajando y cuáles ya han desaparecido."], ["Notificaciones", "Te escribimos en cuanto haya novedades."], ["Pagos y facturas", "Paga con un toque: solo pagas por las reseñas eliminadas."]],
    btn: "Abrir mi panel", note: "El botón inicia tu sesión directamente, sin contraseña (válido 30 días).", later: "Más adelante, entra en rapid-remove.com/my-reviews. ¿Aún no tienes contraseña? Toca «¿Has olvidado tu contraseña?» y te enviamos un enlace.", sign: "El equipo de RapidRemove" },
  fr: { subj: "Ton tableau de bord personnel est prêt", title: "Suis tes avis en direct", hi: (n) => (n ? `Bonjour ${n},` : "Bonjour,"), p: "désormais, tu peux suivre la suppression de tes avis Google dans ton propre tableau de bord – chaque avis, chaque changement de statut et tous les paiements au même endroit.",
    f: [["Statut en direct", "Vois quels avis sont en cours de traitement et lesquels ont déjà disparu."], ["Notifications", "Nous t’écrivons dès que quelque chose change."], ["Paiements et factures", "Paie en un geste – tu ne paies que les avis supprimés."]],
    btn: "Ouvrir mon tableau de bord", note: "Le bouton te connecte directement – sans mot de passe (valable 30 jours).", later: "Ensuite, va simplement sur rapid-remove.com/my-reviews. Pas encore de mot de passe ? Touche « Mot de passe oublié ? » et nous t’envoyons un lien.", sign: "L’équipe RapidRemove" },
  it: { subj: "La tua dashboard personale è pronta", title: "Segui le tue recensioni in tempo reale", hi: (n) => (n ? `Ciao ${n},` : "Ciao,"), p: "da ora puoi seguire la rimozione delle tue recensioni Google nella tua dashboard: ogni recensione, ogni cambio di stato e tutti i pagamenti in un unico posto.",
    f: [["Stato in tempo reale", "Vedi quali recensioni sono in lavorazione e quali sono già sparite."], ["Notifiche", "Ti scriviamo appena cambia qualcosa."], ["Pagamenti e fatture", "Paga con un tocco: paghi solo le recensioni rimosse."]],
    btn: "Apri la mia dashboard", note: "Il pulsante ti fa accedere direttamente, senza password (valido 30 giorni).", later: "In seguito vai su rapid-remove.com/my-reviews. Non hai ancora una password? Tocca «Password dimenticata?» e ti inviamo un link.", sign: "Il team di RapidRemove" },
  nl: { subj: "Uw persoonlijke dashboard staat klaar", title: "Volg uw reviews live", hi: (n) => (n ? `Beste ${n},` : "Hallo,"), p: "vanaf nu kunt u het verwijderen van uw Google-reviews volgen in uw eigen dashboard – elke review, elke statuswijziging en alle betalingen op één plek.",
    f: [["Live status", "Zie welke reviews in behandeling zijn en welke al weg zijn."], ["Meldingen", "We mailen u zodra er iets verandert."], ["Betalingen & facturen", "Betaal met één tik – u betaalt alleen voor verwijderde reviews."]],
    btn: "Mijn dashboard openen", note: "De knop logt u direct in – zonder wachtwoord (30 dagen geldig).", later: "Ga later gewoon naar rapid-remove.com/my-reviews. Nog geen wachtwoord? Tik op „Wachtwoord vergeten?” en we sturen u een link.", sign: "Het RapidRemove-team" },
  pt: { subj: "O teu painel pessoal está pronto", title: "Acompanha as tuas avaliações em direto", hi: (n) => (n ? `Olá ${n},` : "Olá,"), p: "a partir de agora podes acompanhar a remoção das tuas avaliações do Google no teu próprio painel – cada avaliação, cada mudança de estado e todos os pagamentos num só lugar.",
    f: [["Estado em direto", "Vê que avaliações estão a ser tratadas e quais já desapareceram."], ["Notificações", "Escrevemos-te assim que algo mudar."], ["Pagamentos e faturas", "Paga com um toque – só pagas pelas avaliações removidas."]],
    btn: "Abrir o meu painel", note: "O botão inicia sessão diretamente – sem palavra-passe (válido 30 dias).", later: "Mais tarde, basta ir a rapid-remove.com/my-reviews. Ainda não tens palavra-passe? Toca em «Esqueceste-te da palavra-passe?» e enviamos-te um link.", sign: "A equipa RapidRemove" },
  ja: { subj: "専用ダッシュボードのご案内", title: "口コミの状況をリアルタイムで確認", hi: (n) => (n ? `${n} 様` : "こんにちは。"), p: "本日より、Google口コミの削除状況を専用ダッシュボードでご確認いただけます。各口コミの状況、ステータスの変更、お支払いをまとめて確認できます。",
    f: [["リアルタイムの状況", "対応中の口コミと削除済みの口コミをひと目で確認できます。"], ["お知らせ", "変更があればすぐにメールでお知らせします。"], ["お支払い・請求書", "ワンタップでお支払い。削除された口コミの分のみお支払いいただきます。"]],
    btn: "ダッシュボードを開く", note: "ボタンからパスワードなしで直接ログインできます（30日間有効）。", later: "今後は rapid-remove.com/my-reviews からアクセスしてください。パスワードをお持ちでない場合は「パスワードをお忘れですか？」をタップしてください。リンクをお送りします。", sign: "RapidRemove チーム" },
  sv: { subj: "Din personliga dashboard är klar", title: "Följ dina omdömen live", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "från och med nu kan du följa borttagningen av dina Google-omdömen i din egen dashboard – varje omdöme, varje statusändring och alla betalningar på ett ställe.",
    f: [["Status live", "Se vilka omdömen som hanteras och vilka som redan är borta."], ["Aviseringar", "Vi mejlar dig så fort något ändras."], ["Betalningar & fakturor", "Betala med ett tryck – du betalar bara för borttagna omdömen."]],
    btn: "Öppna min dashboard", note: "Knappen loggar in dig direkt – utan lösenord (gäller i 30 dagar).", later: "Senare går du bara till rapid-remove.com/my-reviews. Inget lösenord än? Tryck på ”Glömt lösenordet?” så skickar vi en länk.", sign: "RapidRemove-teamet" },
  da: { subj: "Dit personlige dashboard er klar", title: "Følg dine anmeldelser live", hi: (n) => (n ? `Hej ${n},` : "Hej,"), p: "fra nu af kan du følge fjernelsen af dine Google-anmeldelser i dit eget dashboard – hver anmeldelse, hver statusændring og alle betalinger samlet ét sted.",
    f: [["Live status", "Se hvilke anmeldelser vi arbejder på, og hvilke der allerede er væk."], ["Notifikationer", "Vi skriver til dig, så snart noget ændrer sig."], ["Betalinger & fakturaer", "Betal med ét tryk – du betaler kun for fjernede anmeldelser."]],
    btn: "Åbn mit dashboard", note: "Knappen logger dig ind direkte – uden adgangskode (gælder i 30 dage).", later: "Senere går du bare til rapid-remove.com/my-reviews. Ingen adgangskode endnu? Tryk på »Glemt adgangskode?«, så sender vi dig et link.", sign: "RapidRemove-teamet" },
  no: { subj: "Ditt personlige dashbord er klart", title: "Følg omtalene dine live", hi: (n) => (n ? `Hei ${n},` : "Hei,"), p: "fra nå av kan du følge fjerningen av Google-omtalene dine i ditt eget dashbord – hver omtale, hver statusendring og alle betalinger på ett sted.",
    f: [["Status live", "Se hvilke omtaler vi jobber med og hvilke som allerede er borte."], ["Varsler", "Vi sender deg e-post så snart noe endrer seg."], ["Betalinger og fakturaer", "Betal med ett trykk – du betaler bare for fjernede omtaler."]],
    btn: "Åpne dashbordet mitt", note: "Knappen logger deg inn direkte – uten passord (gyldig i 30 dager).", later: "Senere går du bare til rapid-remove.com/my-reviews. Ikke passord ennå? Trykk på «Glemt passordet?», så sender vi deg en lenke.", sign: "RapidRemove-teamet" },
};

export const dashInviteSubject = (lang?: string) => (T[lang || "en"] || T.en).subj;

export default function DashInvite({ lang = "en", name = "", url }: { lang?: string; name?: string; url: string }) {
  const l = T[lang] ? lang : "en";
  const t = T[l];
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  return (
    <EmailShell preview={t.p.slice(0, 110)} title={t.title} lang={l as MailLang}>
      <Section style={{ margin: "4px 0 18px", background: "#ffffff", borderRadius: 24, textAlign: "center" as const }}>
        <Img src="https://www.rapid-remove.com/assets/app/rocket-mail.png" width="240" alt="" style={{ display: "block", margin: "0 auto", maxWidth: "100%" }} />
      </Section>
      <P>{t.hi(first)}</P>
      <P>{t.p}</P>
      <Section style={{ background: brand.page, borderRadius: 20, padding: "6px 18px", margin: "8px 0 20px" }}>
        {t.f.map(([h, d], i) => (
          <table key={i} role="presentation" cellPadding={0} cellSpacing={0} style={{ width: "100%", borderCollapse: "collapse", borderTop: i ? "1px solid #e8e8e8" : "none" }}><tbody><tr>
            <td style={{ width: 34, verticalAlign: "top", padding: "14px 0" }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: brand.ink, color: "#ffffff", fontSize: 13, fontWeight: 800, lineHeight: "24px", textAlign: "center" as const }}>✓</div>
            </td>
            <td style={{ verticalAlign: "top", padding: "12px 0", fontFamily: brand.font }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: brand.ink }}>{h}</div>
              <div style={{ fontSize: 14, lineHeight: "1.45", color: brand.muted, marginTop: 2 }}>{d}</div>
            </td>
          </tr></tbody></table>
        ))}
      </Section>
      <CtaButton href={url} full>{t.btn}</CtaButton>
      <div style={{ height: 10 }} />
      <P muted>{t.note}</P>
      <P muted>{t.later}</P>
      <P>{t.sign}</P>
    </EmailShell>
  );
}
