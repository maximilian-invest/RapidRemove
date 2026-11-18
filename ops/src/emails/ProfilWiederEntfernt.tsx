/* Template: Profil kurz wieder aufgetaucht – bereits wieder entfernt. Kunde wird informiert, dass sein
   gelöschtes Profil wieder bei Google sichtbar war und wir es sofort wieder entfernt haben
   (Monitor → „Kunde informieren" → „Bereits wieder entfernt"). Screenshot inline (cid), Link zum Profil
   zum Selbsttest. 11 Sprachen. */
import * as React from "react";
import { Img } from "@react-email/components";
import { EmailShell, P, CtaButton, Support, brand } from "./components";

type Lang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
export interface ProfilWiederEntferntProps { lang?: Lang; business?: string; shotCid?: string; profileUrl?: string; when?: string; }

type Tx = { title: string; preview: string; greeting: string; p1: string; p2: string; shot: string; p3: string; btn: string; p4: string; subject: string };
export const T: Record<Lang, Tx> = {
  de: { title: "Ihr Profil ist wieder aufgetaucht – und bereits wieder entfernt", preview: "Unsere Überwachung hat es bemerkt, wir haben es sofort wieder entfernt.", greeting: "Sehr geehrte Damen und Herren,", p1: "unsere tägliche Überwachung hat festgestellt, dass Ihr Google Business Profil{b} wieder öffentlich sichtbar war{w}. Das passiert meist durch Dritte (z. B. Kunden oder Mitarbeiter) oder durch Google selbst.", p2: "Wir haben das Profil sofort wieder entfernt – im Rahmen Ihres Schutzes und für Sie kostenfrei. Sie müssen nichts tun.", shot: "So war das Profil kurzzeitig bei Google zu sehen:", p3: "Über den folgenden Link können Sie selbst prüfen, dass das Profil nicht mehr erreichbar ist:", btn: "Profil prüfen", p4: "Wir überwachen Ihr Profil weiterhin täglich.", subject: "Ihr Profil war wieder online – wir haben es bereits entfernt" },
  en: { title: "Your profile reappeared – and has already been removed", preview: "Our monitoring caught it and we removed it right away.", greeting: "Dear Sir or Madam,", p1: "our daily monitoring detected that your Google Business Profile{b} was publicly visible again{w}. This is usually caused by third parties (such as customers or employees) or by Google itself.", p2: "We removed the profile again right away – as part of your protection plan and free of charge. You don't need to do anything.", shot: "This is how the profile briefly appeared on Google:", p3: "You can use the link below to check for yourself that the profile is no longer available:", btn: "Check profile", p4: "We will continue to monitor your profile every day.", subject: "Your profile was back online – we've already removed it" },
  es: { title: "Su perfil volvió a aparecer y ya ha sido eliminado", preview: "Nuestra supervisión lo detectó y lo eliminamos de inmediato.", greeting: "Estimados señores:", p1: "nuestra supervisión diaria detectó que su perfil de empresa de Google{b} volvía a ser visible públicamente{w}. Esto suele deberse a terceros (como clientes o empleados) o a la propia Google.", p2: "Hemos vuelto a eliminar el perfil de inmediato, dentro de su plan de protección y sin coste para usted. No tiene que hacer nada.", shot: "Así se vio el perfil brevemente en Google:", p3: "Con el siguiente enlace puede comprobar usted mismo que el perfil ya no está disponible:", btn: "Comprobar perfil", p4: "Seguimos supervisando su perfil a diario.", subject: "Su perfil volvió a estar en línea: ya lo hemos eliminado" },
  fr: { title: "Votre fiche est réapparue – et a déjà été supprimée", preview: "Notre surveillance l'a détecté et nous l'avons supprimée aussitôt.", greeting: "Madame, Monsieur,", p1: "notre surveillance quotidienne a constaté que votre fiche d'établissement Google{b} était de nouveau visible publiquement{w}. Cela est généralement dû à des tiers (clients ou employés, par exemple) ou à Google elle-même.", p2: "Nous avons aussitôt supprimé la fiche à nouveau, dans le cadre de votre plan de protection et gratuitement. Vous n'avez rien à faire.", shot: "Voici comment la fiche est brièvement apparue sur Google :", p3: "Le lien ci-dessous vous permet de vérifier vous-même que la fiche n'est plus accessible :", btn: "Vérifier la fiche", p4: "Nous continuons à surveiller votre fiche chaque jour.", subject: "Votre fiche était de nouveau en ligne – nous l'avons déjà supprimée" },
  it: { title: "Il vostro profilo è ricomparso – ed è già stato rimosso", preview: "Il nostro monitoraggio lo ha rilevato e lo abbiamo rimosso subito.", greeting: "Gentili Signore e Signori,", p1: "il nostro monitoraggio giornaliero ha rilevato che il vostro profilo dell'attività su Google{b} era di nuovo visibile pubblicamente{w}. Di solito ciò accade a causa di terzi (ad es. clienti o dipendenti) o di Google stessa.", p2: "Abbiamo rimosso subito di nuovo il profilo, nell'ambito della vostra protezione e senza costi per voi. Non dovete fare nulla.", shot: "Ecco come il profilo è apparso brevemente su Google:", p3: "Con il link seguente potete verificare voi stessi che il profilo non è più disponibile:", btn: "Verifica profilo", p4: "Continuiamo a monitorare il vostro profilo ogni giorno.", subject: "Il vostro profilo era di nuovo online – l'abbiamo già rimosso" },
  nl: { title: "Uw profiel was weer zichtbaar – en is al verwijderd", preview: "Onze controle merkte het op en we hebben het direct verwijderd.", greeting: "Geachte heer, mevrouw,", p1: "onze dagelijkse controle heeft vastgesteld dat uw Google-bedrijfsprofiel{b} weer openbaar zichtbaar was{w}. Dit gebeurt meestal door derden (bijv. klanten of medewerkers) of door Google zelf.", p2: "Wij hebben het profiel direct opnieuw verwijderd – in het kader van uw bescherming en kosteloos. U hoeft niets te doen.", shot: "Zo was het profiel kort op Google te zien:", p3: "Via de volgende link kunt u zelf controleren dat het profiel niet meer bereikbaar is:", btn: "Profiel controleren", p4: "Wij blijven uw profiel dagelijks controleren.", subject: "Uw profiel was weer online – we hebben het al verwijderd" },
  pt: { title: "O seu perfil voltou a aparecer – e já foi eliminado", preview: "A nossa monitorização detetou-o e eliminámo-lo de imediato.", greeting: "Exmos. Senhores,", p1: "a nossa monitorização diária detetou que o seu perfil de empresa no Google{b} voltou a estar visível publicamente{w}. Normalmente isto deve-se a terceiros (como clientes ou colaboradores) ou à própria Google.", p2: "Eliminámos novamente o perfil de imediato, no âmbito da sua proteção e sem custos para si. Não precisa de fazer nada.", shot: "Foi assim que o perfil apareceu brevemente no Google:", p3: "Através do link abaixo pode verificar por si mesmo que o perfil já não está disponível:", btn: "Verificar perfil", p4: "Continuamos a monitorizar o seu perfil diariamente.", subject: "O seu perfil voltou a estar online – já o eliminámos" },
  ja: { title: "プロフィールが再表示されましたが、すでに削除済みです", preview: "監視で検知し、直ちに削除いたしました。", greeting: "ご担当者様", p1: "毎日の監視により、お客様のGoogleビジネスプロフィール{b}が再び公開表示されていたことを確認いたしました{w}。多くの場合、第三者（お客様や従業員など）またはGoogle自体によって発生します。", p2: "保護プランの範囲内で、直ちに無料で再度削除いたしました。お客様のご対応は不要です。", shot: "Google上で一時的に表示されていたプロフィール：", p3: "以下のリンクから、プロフィールが表示されなくなったことをご自身でご確認いただけます：", btn: "プロフィールを確認", p4: "引き続き毎日プロフィールを監視いたします。", subject: "プロフィールが再表示されました – すでに削除済みです" },
  sv: { title: "Din profil dök upp igen – och är redan borttagen", preview: "Vår övervakning upptäckte det och vi tog bort den direkt.", greeting: "Hej,", p1: "vår dagliga övervakning har upptäckt att din Google-företagsprofil{b} var offentligt synlig igen{w}. Det beror oftast på tredje part (t.ex. kunder eller anställda) eller på Google själv.", p2: "Vi har tagit bort profilen igen direkt – inom ramen för ditt skydd och utan kostnad. Du behöver inte göra något.", shot: "Så här syntes profilen kortvarigt på Google:", p3: "Via länken nedan kan du själv kontrollera att profilen inte längre är tillgänglig:", btn: "Kontrollera profilen", p4: "Vi fortsätter att övervaka din profil varje dag.", subject: "Din profil var online igen – vi har redan tagit bort den" },
  da: { title: "Din profil dukkede op igen – og er allerede fjernet", preview: "Vores overvågning opdagede det, og vi fjernede den med det samme.", greeting: "Kære modtager,", p1: "vores daglige overvågning har registreret, at din Google-virksomhedsprofil{b} igen var offentligt synlig{w}. Det skyldes oftest tredjeparter (f.eks. kunder eller medarbejdere) eller Google selv.", p2: "Vi har fjernet profilen igen med det samme – som en del af din beskyttelse og gratis. Du skal ikke gøre noget.", shot: "Sådan var profilen kortvarigt synlig på Google:", p3: "Via linket nedenfor kan du selv kontrollere, at profilen ikke længere er tilgængelig:", btn: "Tjek profilen", p4: "Vi fortsætter med at overvåge din profil hver dag.", subject: "Din profil var online igen – vi har allerede fjernet den" },
  no: { title: "Profilen din dukket opp igjen – og er allerede fjernet", preview: "Overvåkingen vår oppdaget det, og vi fjernet den med en gang.", greeting: "Hei,", p1: "den daglige overvåkingen vår har oppdaget at Google-bedriftsprofilen din{b} igjen var offentlig synlig{w}. Dette skyldes som regel tredjeparter (f.eks. kunder eller ansatte) eller Google selv.", p2: "Vi har fjernet profilen igjen med en gang – som en del av beskyttelsen din og uten kostnad. Du trenger ikke gjøre noe.", shot: "Slik var profilen kortvarig synlig på Google:", p3: "Via lenken nedenfor kan du selv sjekke at profilen ikke lenger er tilgjengelig:", btn: "Sjekk profilen", p4: "Vi fortsetter å overvåke profilen din hver dag.", subject: "Profilen din var på nett igjen – vi har allerede fjernet den" },
};

const pick = (lang?: string) => T[(lang as Lang)] || T.en;

export function subject(p: ProfilWiederEntferntProps = {}): string {
  return pick(p.lang).subject;
}

export default function ProfilWiederEntfernt({ lang = "de", business, shotCid, profileUrl, when }: ProfilWiederEntferntProps = {}) {
  const t = pick(lang);
  const b = business ? ` „${business}“` : "";
  const w = when ? ` (${when})` : "";
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1.replace("{b}", b).replace("{w}", w)}</P>
      <P><strong>{t.p2}</strong></P>
      {shotCid ? (
        <>
          <P muted>{t.shot}</P>
          <Img src={`cid:${shotCid}`} alt={business || "Screenshot"} width="100%" style={{ width: "100%", maxWidth: 520, height: "auto", borderRadius: 14, border: `1px solid ${brand.page}`, display: "block", margin: "0 0 18px" }} />
        </>
      ) : null}
      {profileUrl ? (
        <>
          <P>{t.p3}</P>
          <div style={{ margin: "4px 0 20px" }}><CtaButton href={profileUrl}>{t.btn}</CtaButton></div>
        </>
      ) : null}
      <P>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
