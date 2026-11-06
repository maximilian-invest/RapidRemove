/* Template: Wöchentlicher Schutz-Bericht (06.11.2026, Maximilian) – an alle Kunden mit aktivem Schutz.
   Zeigt je geschütztem Profil: weiterhin gelöscht, zuletzt geprüft, Prüfungen dieser Woche. Link ins Kunden-Dashboard.
   Wird NUR verschickt, wenn alle gezeigten Profile weiterhin gelöscht sind (wieder aufgetauchte Profile meldet das Team separat). 11 Sprachen. */
import * as React from "react";
import { EmailShell, P, NoteBox, CtaButton, Support } from "./components";

type Lang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
export interface SchutzBerichtItem { name: string; lastCheck: string; checks: number; }
export interface SchutzBerichtProps { lang?: Lang; items?: SchutzBerichtItem[]; dashUrl?: string; }

const T: Record<Lang, { subject: (n: string, more: number) => string; title: string; preview: string; greeting: string; intro: string; still: string; last: string; checks: (n: number) => string; cta: string; outro: string; why: string }> = {
  de: { subject: (n, m) => `Schutz-Bericht: ${n}${m ? ` +${m}` : ""} weiterhin gelöscht ✓`, title: "Ihr wöchentlicher Schutz-Bericht", preview: "Wir haben Ihr gelöschtes Profil diese Woche geprüft – alles in Ordnung.", greeting: "Guten Tag,", intro: "wir überwachen Ihr gelöschtes Google Business Profil laufend. Das Ergebnis dieser Woche:", still: "Weiterhin gelöscht", last: "Zuletzt geprüft", checks: (n) => `${n} Prüfung${n === 1 ? "" : "en"} diese Woche`, cta: "Status im Dashboard ansehen", outro: "Taucht das Profil wieder auf, melden wir uns sofort und entfernen es im Rahmen Ihres Schutzes kostenlos erneut.", why: "Sie erhalten diesen Bericht, weil Ihr Schutz bei RapidRemove aktiv ist." },
  en: { subject: (n, m) => `Protection report: ${n}${m ? ` +${m}` : ""} still removed ✓`, title: "Your weekly protection report", preview: "We checked your removed profile this week – all good.", greeting: "Hello,", intro: "we continuously monitor your removed Google Business Profile. This week's result:", still: "Still removed", last: "Last checked", checks: (n) => `${n} check${n === 1 ? "" : "s"} this week`, cta: "View status in your dashboard", outro: "If the profile reappears, we'll let you know right away and remove it again free of charge as part of your protection.", why: "You're receiving this report because your RapidRemove protection is active." },
  es: { subject: (n, m) => `Informe de protección: ${n}${m ? ` +${m}` : ""} sigue eliminado ✓`, title: "Su informe semanal de protección", preview: "Esta semana hemos revisado su perfil eliminado: todo en orden.", greeting: "Hola:", intro: "supervisamos de forma continua su perfil de empresa de Google eliminado. El resultado de esta semana:", still: "Sigue eliminado", last: "Última revisión", checks: (n) => `${n} ${n === 1 ? "revisión" : "revisiones"} esta semana`, cta: "Ver el estado en el panel", outro: "Si el perfil vuelve a aparecer, le avisaremos de inmediato y lo eliminaremos de nuevo gratuitamente como parte de su protección.", why: "Recibe este informe porque su protección de RapidRemove está activa." },
  fr: { subject: (n, m) => `Rapport de protection : ${n}${m ? ` +${m}` : ""} toujours supprimée ✓`, title: "Votre rapport de protection hebdomadaire", preview: "Nous avons vérifié votre fiche supprimée cette semaine : tout va bien.", greeting: "Bonjour,", intro: "nous surveillons en continu votre fiche d'établissement Google supprimée. Le résultat de cette semaine :", still: "Toujours supprimée", last: "Dernière vérification", checks: (n) => `${n} vérification${n === 1 ? "" : "s"} cette semaine`, cta: "Voir le statut dans l'espace client", outro: "Si la fiche réapparaît, nous vous prévenons immédiatement et la supprimons de nouveau gratuitement dans le cadre de votre protection.", why: "Vous recevez ce rapport parce que votre protection RapidRemove est active." },
  it: { subject: (n, m) => `Report di protezione: ${n}${m ? ` +${m}` : ""} ancora rimosso ✓`, title: "Il tuo report settimanale di protezione", preview: "Questa settimana abbiamo controllato il tuo profilo rimosso: tutto a posto.", greeting: "Buongiorno,", intro: "monitoriamo costantemente il tuo profilo dell'attività su Google rimosso. Il risultato di questa settimana:", still: "Ancora rimosso", last: "Ultimo controllo", checks: (n) => `${n} ${n === 1 ? "controllo" : "controlli"} questa settimana`, cta: "Vedi lo stato nella dashboard", outro: "Se il profilo ricompare, ti avvisiamo subito e lo rimuoviamo di nuovo gratuitamente nell'ambito della tua protezione.", why: "Ricevi questo report perché la tua protezione RapidRemove è attiva." },
  nl: { subject: (n, m) => `Beschermingsrapport: ${n}${m ? ` +${m}` : ""} nog steeds verwijderd ✓`, title: "Uw wekelijkse beschermingsrapport", preview: "We hebben uw verwijderde profiel deze week gecontroleerd – alles in orde.", greeting: "Goedendag,", intro: "we bewaken uw verwijderde Google-bedrijfsprofiel doorlopend. Het resultaat van deze week:", still: "Nog steeds verwijderd", last: "Laatst gecontroleerd", checks: (n) => `${n} controle${n === 1 ? "" : "s"} deze week`, cta: "Status bekijken in het dashboard", outro: "Duikt het profiel weer op, dan laten we het u meteen weten en verwijderen we het in het kader van uw bescherming gratis opnieuw.", why: "U ontvangt dit rapport omdat uw RapidRemove-bescherming actief is." },
  pt: { subject: (n, m) => `Relatório de proteção: ${n}${m ? ` +${m}` : ""} continua removido ✓`, title: "O seu relatório semanal de proteção", preview: "Verificámos esta semana o seu perfil removido – está tudo bem.", greeting: "Olá,", intro: "monitorizamos continuamente o seu perfil de empresa do Google removido. O resultado desta semana:", still: "Continua removido", last: "Última verificação", checks: (n) => `${n} ${n === 1 ? "verificação" : "verificações"} esta semana`, cta: "Ver o estado no painel", outro: "Se o perfil voltar a aparecer, avisamos de imediato e removemo-lo novamente sem custos, no âmbito da sua proteção.", why: "Recebe este relatório porque a sua proteção RapidRemove está ativa." },
  ja: { subject: (n, m) => `保護レポート：${n}${m ? ` +${m}` : ""} 引き続き削除済み ✓`, title: "週間保護レポート", preview: "今週、削除済みのプロフィールを確認しました。問題ありません。", greeting: "ご担当者様", intro: "削除済みのGoogleビジネスプロフィールを継続的に監視しています。今週の結果：", still: "引き続き削除済み", last: "最終確認", checks: (n) => `今週の確認回数：${n}回`, cta: "ダッシュボードで状況を見る", outro: "プロフィールが再表示された場合はすぐにご連絡し、保護の範囲内で無料で再度削除いたします。", why: "RapidRemoveの保護が有効なため、このレポートをお送りしています。" },
  sv: { subject: (n, m) => `Skyddsrapport: ${n}${m ? ` +${m}` : ""} fortfarande borttagen ✓`, title: "Din veckovisa skyddsrapport", preview: "Vi har kontrollerat din borttagna profil den här veckan – allt i ordning.", greeting: "Hej,", intro: "vi övervakar din borttagna Google-företagsprofil löpande. Veckans resultat:", still: "Fortfarande borttagen", last: "Senast kontrollerad", checks: (n) => `${n} ${n === 1 ? "kontroll" : "kontroller"} den här veckan`, cta: "Se status i kontrollpanelen", outro: "Om profilen dyker upp igen hör vi av oss direkt och tar bort den igen kostnadsfritt inom ramen för ditt skydd.", why: "Du får den här rapporten eftersom ditt skydd hos RapidRemove är aktivt." },
  da: { subject: (n, m) => `Beskyttelsesrapport: ${n}${m ? ` +${m}` : ""} stadig fjernet ✓`, title: "Din ugentlige beskyttelsesrapport", preview: "Vi har tjekket din fjernede profil i denne uge – alt i orden.", greeting: "Hej,", intro: "vi overvåger løbende din fjernede Google-virksomhedsprofil. Ugens resultat:", still: "Stadig fjernet", last: "Senest tjekket", checks: (n) => `${n} ${n === 1 ? "kontrol" : "kontroller"} i denne uge`, cta: "Se status i kontrolpanelet", outro: "Dukker profilen op igen, giver vi besked med det samme og fjerner den igen gratis som en del af din beskyttelse.", why: "Du modtager denne rapport, fordi din beskyttelse hos RapidRemove er aktiv." },
  no: { subject: (n, m) => `Beskyttelsesrapport: ${n}${m ? ` +${m}` : ""} fortsatt fjernet ✓`, title: "Din ukentlige beskyttelsesrapport", preview: "Vi har sjekket den fjernede profilen din denne uken – alt i orden.", greeting: "Hei,", intro: "vi overvåker den fjernede Google-bedriftsprofilen din løpende. Ukens resultat:", still: "Fortsatt fjernet", last: "Sist sjekket", checks: (n) => `${n} ${n === 1 ? "kontroll" : "kontroller"} denne uken`, cta: "Se status i kontrollpanelet", outro: "Dukker profilen opp igjen, sier vi fra med en gang og fjerner den igjen gratis som en del av beskyttelsen din.", why: "Du mottar denne rapporten fordi beskyttelsen din hos RapidRemove er aktiv." },
};
const pick = (lang?: string) => T[(lang as Lang)] || T.en;

export function subject(p: SchutzBerichtProps = {}): string {
  const items = p.items || [];
  return pick(p.lang).subject(items[0]?.name || "Google Business Profile", Math.max(0, items.length - 1));
}

export default function SchutzBericht({ lang = "de", items = [], dashUrl }: SchutzBerichtProps = {}) {
  const t = pick(lang);
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.intro}</P>
      {items.map((it, i) => (
        <NoteBox key={i}>
          <strong>✓ {it.name}</strong><br />
          {t.still} · {t.last}: {it.lastCheck}<br />
          <span style={{ color: "#6b6259" }}>{t.checks(it.checks)}</span>
        </NoteBox>
      ))}
      {dashUrl ? <P><CtaButton href={dashUrl}>{t.cta}</CtaButton></P> : null}
      <P>{t.outro}</P>
      <P muted>{t.why}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
