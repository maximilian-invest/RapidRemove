/* Template: Garantiefall – Profil erneut aufgetaucht, kostenfrei entfernt / Profile deleted (DE/EN). */
import * as React from "react";
import { EmailShell, P, Support } from "./components";

export interface GarantiefallProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; }

const T = {
  de: {
    title: "Profil gelöscht ✓",
    preview: "Ihr Profil ist erneut aufgetaucht – wir haben es kostenfrei entfernt.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre Treue und das aktivierte Schutzmodell. Ihr Unternehmensprofil ist innerhalb der letzten 24 Stunden erneut aufgetaucht. Der genaue Grund dafür lässt sich leider nicht nachverfolgen – in den meisten Fällen geschieht dies durch Dritte (z. B. Kunden oder Mitarbeiter) oder durch Google selbst. ",
    p1Bold: "Wir haben dieses soeben für Sie kostenfrei entfernt.",
    subject: "Profil gelöscht – Garantiefall erledigt",
  },
  en: {
    title: "Profile Deleted ✓",
    preview: "Your profile reappeared – we have removed it again free of charge.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your loyalty and for having activated the protection plan. Your business profile reappeared within the last 24 hours. Unfortunately, the exact reason cannot be traced – in most cases this occurs due to third parties (such as customers or employees) or by Google itself. ",
    p1Bold: "We have just removed the profile for you free of charge.",
    subject: "Profile deleted",
  },
  es: {
    title: "Perfil eliminado ✓",
    preview: "Su perfil ha vuelto a aparecer; lo hemos eliminado de nuevo sin coste alguno.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su fidelidad y por haber activado el plan de protección. Su perfil de empresa ha vuelto a aparecer en las últimas 24 horas. Lamentablemente, no es posible determinar el motivo exacto: en la mayoría de los casos esto se debe a terceros (como clientes o empleados) o a la propia Google. ",
    p1Bold: "Acabamos de eliminarlo de nuevo por usted sin coste alguno.",
    subject: "Perfil eliminado",
  },
  fr: {
    title: "Fiche supprimée ✓",
    preview: "Votre fiche est réapparue ; nous l'avons de nouveau supprimée gratuitement.",
    greeting: "Madame, Monsieur,",
    p1a: "nous vous remercions de votre fidélité et d'avoir activé le plan de protection. Votre fiche d'établissement est réapparue au cours des dernières 24 heures. La raison exacte ne peut malheureusement pas être déterminée : dans la plupart des cas, cela résulte de l'action de tiers (clients ou employés, par exemple) ou de Google elle-même. ",
    p1Bold: "Nous venons de la supprimer de nouveau pour vous, gratuitement.",
    subject: "Fiche supprimée",
  },
  it: {
    title: "Profilo eliminato ✓",
    preview: "Il suo profilo è ricomparso: lo abbiamo nuovamente rimosso senza alcun costo.",
    greeting: "Gentili Signore e Signori,",
    p1a: "la ringraziamo per la sua fedeltà e per aver attivato il piano di protezione. Il suo profilo aziendale è ricomparso nelle ultime 24 ore. Purtroppo non è possibile risalire al motivo esatto: nella maggior parte dei casi ciò avviene a causa di terzi (come clienti o dipendenti) o di Google stessa. ",
    p1Bold: "Lo abbiamo appena rimosso nuovamente per lei senza alcun costo.",
    subject: "Profilo eliminato",
  },
  nl: {
    title: "Profiel verwijderd ✓",
    preview: "Uw profiel is opnieuw verschenen; we hebben het kosteloos opnieuw verwijderd.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw trouw en voor het activeren van het beschermingsplan. Uw bedrijfsprofiel is in de afgelopen 24 uur opnieuw verschenen. De precieze reden is helaas niet te achterhalen: in de meeste gevallen gebeurt dit door derden (zoals klanten of medewerkers) of door Google zelf. ",
    p1Bold: "We hebben dit zojuist kosteloos voor u verwijderd.",
    subject: "Profiel verwijderd",
  },
  pt: {
    title: "Perfil eliminado ✓",
    preview: "O seu perfil voltou a aparecer; eliminámo-lo novamente sem qualquer custo.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pela sua fidelidade e por ter ativado o plano de proteção. O seu perfil de empresa voltou a aparecer nas últimas 24 horas. Infelizmente, não é possível determinar o motivo exato: na maioria dos casos, isto deve-se a terceiros (como clientes ou colaboradores) ou à própria Google. ",
    p1Bold: "Acabámos de o eliminar novamente, sem qualquer custo para si.",
    subject: "Perfil eliminado",
  },
  ja: {
    title: "プロフィールを削除しました ✓",
    preview: "お客様のプロフィールが再び表示されたため、無料で再度削除いたしました。",
    greeting: "ご担当者様",
    p1a: "このたびはご愛顧を賜り、また保護プランをご利用いただき、誠にありがとうございます。お客様のビジネスプロフィールが過去24時間以内に再び表示されました。正確な原因を特定することは残念ながらできませんが、多くの場合、第三者（お客様や従業員など）またはGoogle自体によって発生します。",
    p1Bold: "ただいま無料で再度削除いたしました。",
    subject: "プロフィールを削除しました",
  },
  sv: {
    title: "Profilen har tagits bort ✓",
    preview: "Din profil har dykt upp igen – vi har tagit bort den på nytt utan kostnad.",
    greeting: "Hej,",
    p1a: "tack för din lojalitet och för att du har aktiverat skyddsplanen. Din företagsprofil har dykt upp igen under de senaste 24 timmarna. Den exakta orsaken går tyvärr inte att spåra – i de flesta fall sker detta genom tredje part (till exempel kunder eller anställda) eller genom Google självt. ",
    p1Bold: "Vi har precis tagit bort den åt dig på nytt utan kostnad.",
    subject: "Profilen har tagits bort",
  },
  da: {
    title: "Profilen er slettet ✓",
    preview: "Din profil er dukket op igen – vi har fjernet den igen uden beregning.",
    greeting: "Kære kunde,",
    p1a: "tak for din loyalitet og for at have aktiveret beskyttelsesplanen. Din virksomhedsprofil er dukket op igen inden for de seneste 24 timer. Den præcise årsag kan desværre ikke spores – i de fleste tilfælde sker det på grund af tredjeparter (såsom kunder eller medarbejdere) eller af Google selv. ",
    p1Bold: "Vi har netop fjernet den igen for dig uden beregning.",
    subject: "Profilen er slettet",
  },
  no: {
    title: "Profilen er slettet ✓",
    preview: "Profilen din har dukket opp igjen – vi har fjernet den på nytt uten kostnad.",
    greeting: "Hei,",
    p1a: "takk for din lojalitet og for at du har aktivert beskyttelsesplanen. Bedriftsprofilen din har dukket opp igjen i løpet av de siste 24 timene. Den nøyaktige årsaken kan dessverre ikke spores – i de fleste tilfeller skjer dette på grunn av tredjeparter (for eksempel kunder eller ansatte) eller av Google selv. ",
    p1Bold: "Vi har akkurat fjernet den på nytt for deg uten kostnad.",
    subject: "Profilen er slettet",
  },
};

export function subject(p: GarantiefallProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Garantiefall({ lang = "de" }: GarantiefallProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <Support lang={lang} phone={lang !== "en"} chat />
    </EmailShell>
  );
}
