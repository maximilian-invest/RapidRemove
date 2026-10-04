/* Template: Profil wieder erschienen – Kunde wird informiert, dass sein gelöschtes
   Profil wieder bei Google sichtbar ist und wir es im Rahmen des Schutzes erneut
   entfernen (Monitor → „Kunde informieren"). 11 Sprachen. */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

type Lang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";
export interface ProfilWiedererschienenProps { lang?: Lang; business?: string; }

export const T: Record<Lang, { title: string; preview: string; greeting: string; p1: string; p2: string; p3: string; subject: string }> = {
  de: { title: "Ihr Profil ist wieder aufgetaucht", preview: "Wir haben es bemerkt und kümmern uns darum – kostenfrei.", greeting: "Sehr geehrte Damen und Herren,", p1: "unsere tägliche Überwachung hat festgestellt, dass Ihr Google-Unternehmensprofil{b} wieder öffentlich sichtbar ist. Das passiert meist durch Dritte (z. B. Kunden oder Mitarbeiter) oder durch Google selbst.", p2: "Sie müssen nichts tun: Wir veranlassen die erneute Löschung im Rahmen Ihres Schutzes – für Sie kostenfrei.", p3: "Sobald das Profil wieder entfernt ist, erhalten Sie von uns eine Bestätigung.", subject: "Ihr Profil ist wieder aufgetaucht – wir kümmern uns darum" },
  en: { title: "Your profile has reappeared", preview: "We noticed it and are taking care of it – free of charge.", greeting: "Dear Sir or Madam,", p1: "our daily monitoring has detected that your Google Business Profile{b} is publicly visible again. This is usually caused by third parties (such as customers or employees) or by Google itself.", p2: "You don't need to do anything: we are arranging the removal again as part of your protection plan – free of charge.", p3: "As soon as the profile has been removed again, we will send you a confirmation.", subject: "Your profile has reappeared – we're on it" },
  es: { title: "Su perfil ha vuelto a aparecer", preview: "Lo hemos detectado y nos encargamos de ello, sin coste.", greeting: "Estimados señores:", p1: "nuestra supervisión diaria ha detectado que su perfil de empresa de Google{b} vuelve a ser visible públicamente. Esto suele deberse a terceros (como clientes o empleados) o a la propia Google.", p2: "No tiene que hacer nada: gestionamos de nuevo la eliminación dentro de su plan de protección, sin coste para usted.", p3: "En cuanto el perfil se haya eliminado de nuevo, le enviaremos una confirmación.", subject: "Su perfil ha vuelto a aparecer: nos encargamos" },
  fr: { title: "Votre fiche est réapparue", preview: "Nous l'avons détecté et nous nous en occupons, gratuitement.", greeting: "Madame, Monsieur,", p1: "notre surveillance quotidienne a constaté que votre fiche d'établissement Google{b} est de nouveau visible publiquement. Cela est généralement dû à des tiers (clients ou employés, par exemple) ou à Google elle-même.", p2: "Vous n'avez rien à faire : nous relançons la suppression dans le cadre de votre plan de protection, gratuitement.", p3: "Dès que la fiche aura de nouveau été supprimée, nous vous enverrons une confirmation.", subject: "Votre fiche est réapparue – nous nous en occupons" },
  it: { title: "Il tuo profilo è ricomparso", preview: "Ce ne siamo accorti e ce ne occupiamo noi, gratuitamente.", greeting: "Gentili Signore e Signori,", p1: "il nostro monitoraggio giornaliero ha rilevato che il vostro profilo dell'attività su Google{b} è di nuovo visibile pubblicamente. Di solito ciò accade a causa di terzi (ad es. clienti o dipendenti) o di Google stessa.", p2: "Non dovete fare nulla: avviamo di nuovo la rimozione nell'ambito della vostra protezione, senza costi per voi.", p3: "Non appena il profilo sarà stato rimosso di nuovo, vi invieremo una conferma.", subject: "Il vostro profilo è ricomparso – ce ne occupiamo noi" },
  nl: { title: "Uw profiel is weer verschenen", preview: "We hebben het opgemerkt en regelen het – kosteloos.", greeting: "Geachte heer, mevrouw,", p1: "onze dagelijkse controle heeft vastgesteld dat uw Google-bedrijfsprofiel{b} weer openbaar zichtbaar is. Dit gebeurt meestal door derden (bijv. klanten of medewerkers) of door Google zelf.", p2: "U hoeft niets te doen: wij zorgen in het kader van uw bescherming opnieuw voor de verwijdering – kosteloos.", p3: "Zodra het profiel opnieuw is verwijderd, ontvangt u van ons een bevestiging.", subject: "Uw profiel is weer verschenen – wij regelen het" },
  pt: { title: "O seu perfil voltou a aparecer", preview: "Detetámo-lo e tratamos do assunto, sem custos.", greeting: "Exmos. Senhores,", p1: "a nossa monitorização diária detetou que o seu perfil de empresa no Google{b} voltou a estar visível publicamente. Normalmente isto deve-se a terceiros (como clientes ou colaboradores) ou à própria Google.", p2: "Não precisa de fazer nada: tratamos novamente da eliminação no âmbito da sua proteção, sem custos para si.", p3: "Assim que o perfil for novamente eliminado, enviar-lhe-emos uma confirmação.", subject: "O seu perfil voltou a aparecer – tratamos disso" },
  ja: { title: "プロフィールが再表示されました", preview: "検知いたしました。無料で対応いたします。", greeting: "ご担当者様", p1: "毎日の監視により、お客様のGoogleビジネスプロフィール{b}が再び公開表示されていることを確認いたしました。多くの場合、第三者（お客様や従業員など）またはGoogle自体によって発生します。", p2: "お客様のご対応は不要です。保護プランの範囲内で、無料にて再度削除の手続きを行います。", p3: "プロフィールの削除が完了しましたら、確認のご連絡をお送りいたします。", subject: "プロフィールが再表示されました – 対応いたします" },
  sv: { title: "Din profil har dykt upp igen", preview: "Vi har upptäckt det och tar hand om det – kostnadsfritt.", greeting: "Hej,", p1: "vår dagliga övervakning har upptäckt att din Google-företagsprofil{b} är offentligt synlig igen. Det beror oftast på tredje part (t.ex. kunder eller anställda) eller på Google själv.", p2: "Du behöver inte göra något: vi ser till att profilen tas bort igen inom ramen för ditt skydd – utan kostnad.", p3: "Så snart profilen har tagits bort igen skickar vi en bekräftelse.", subject: "Din profil har dykt upp igen – vi tar hand om det" },
  da: { title: "Din profil er dukket op igen", preview: "Vi har opdaget det og tager os af det – gratis.", greeting: "Kære modtager,", p1: "vores daglige overvågning har registreret, at din Google-virksomhedsprofil{b} igen er offentligt synlig. Det skyldes oftest tredjeparter (f.eks. kunder eller medarbejdere) eller Google selv.", p2: "Du skal ikke gøre noget: Vi sørger for at få profilen fjernet igen som en del af din beskyttelse – gratis.", p3: "Så snart profilen er fjernet igen, sender vi dig en bekræftelse.", subject: "Din profil er dukket op igen – vi tager os af det" },
  no: { title: "Profilen din har dukket opp igjen", preview: "Vi har oppdaget det og tar oss av det – kostnadsfritt.", greeting: "Hei,", p1: "den daglige overvåkingen vår har oppdaget at Google-bedriftsprofilen din{b} igjen er offentlig synlig. Dette skyldes som regel tredjeparter (f.eks. kunder eller ansatte) eller Google selv.", p2: "Du trenger ikke gjøre noe: Vi sørger for at profilen fjernes igjen som en del av beskyttelsen din – uten kostnad.", p3: "Så snart profilen er fjernet igjen, sender vi deg en bekreftelse.", subject: "Profilen din har dukket opp igjen – vi tar oss av det" },
};

const pick = (lang?: string) => T[(lang as Lang)] || T.en;

export function subject(p: ProfilWiedererschienenProps = {}): string {
  return pick(p.lang).subject;
}

export default function ProfilWiedererschienen({ lang = "de", business }: ProfilWiedererschienenProps = {}) {
  const t = pick(lang);
  const b = business ? ` „${business}“` : "";
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1.replace("{b}", b)}</P>
      <P><strong>{t.p2}</strong></P>
      <P>{t.p3}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
