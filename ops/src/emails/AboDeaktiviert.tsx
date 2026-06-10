/* Template: Abo deaktiviert – Schutz wegen Zahlungsproblem deaktiviert / Protection canceled (DE/EN). */
import * as React from "react";
import { EmailShell, P, DangerBox, CtaButton, Support } from "./components";
import { Section } from "@react-email/components";

export interface AboDeaktiviertProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; reactivateUrl?: string; }

const T = {
  de: {
    title: "Der Schutz wurde deaktiviert!",
    preview: "Ihr Schutz wurde deaktiviert, da die Zahlung wiederholt fehlschlug.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1: "unser Schutz-Plan hilft gegen das Wiederauftauchen eines ungewünschten Google-Unternehmensprofils.",
    p2Bold: "Der Schutz wurde deaktiviert, da die Zahlung wiederholt fehlschlug",
    p2: " (abgelaufene Karte, mangelnde Deckung, etc.).",
    warnA: "Bitte beachten Sie, dass Ihr Profil ",
    warnBold: "nun jederzeit wiederauftauchen und bewertet werden kann.",
    warnB: " Sollte der Schutz nicht reaktiviert werden, ist eine ",
    warnBold2: "Löschung nur gegen Entgelt möglich.",
    cta: "Problem beheben / Schutz reaktivieren",
    p3: "Bitte aktivieren Sie Ihren Schutz schnellstmöglich manuell oder informieren Sie uns als Antwort auf diese E-Mail, falls Sie Hilfe bei der Aktualisierung Ihrer Zahlungsmethode benötigen.",
    p4: "Sollte der Schutz nicht mehr gewünscht sein, so ignorieren Sie bitte diese E-Mail.",
    subject: "Ihr Schutz wurde deaktiviert",
  },
  en: {
    title: "Protection Has Been Canceled!",
    preview: "Your protection has been canceled because the payment repeatedly failed.",
    greeting: "Dear Sir or Madam,",
    p1: "our protection plan helps prevent the reappearance of an unwanted Google Business Profile.",
    p2Bold: "The protection has been canceled because the payment repeatedly failed",
    p2: " (expired card, insufficient funds, etc.).",
    warnA: "Please note that your profile may ",
    warnBold: "now reappear and receive reviews at any time.",
    warnB: " If the protection is not reactivated, removal can ",
    warnBold2: "only be provided at an additional cost.",
    cta: "Fix the issue / Reactivate protection",
    p3: "Please reactivate your protection manually as soon as possible, or reply to this email if you need assistance updating your payment details.",
    p4: "If you no longer wish to continue with the protection, simply ignore this email. The service will automatically expire.",
    subject: "Your protection has been canceled",
  },
  es: {
    title: "¡La protección ha sido desactivada!",
    preview: "Su protección ha sido desactivada porque el pago falló repetidamente.",
    greeting: "Estimados señores:",
    p1: "nuestro plan de protección ayuda a evitar que reaparezca un perfil de empresa de Google no deseado.",
    p2Bold: "La protección ha sido desactivada porque el pago falló repetidamente",
    p2: " (tarjeta caducada, fondos insuficientes, etc.).",
    warnA: "Tenga en cuenta que su perfil ",
    warnBold: "ahora puede reaparecer y recibir reseñas en cualquier momento.",
    warnB: " Si no se reactiva la protección, la eliminación ",
    warnBold2: "solo será posible con un coste adicional.",
    cta: "Solucionar el problema / Reactivar la protección",
    p3: "Reactive su protección manualmente lo antes posible o respóndanos a este correo si necesita ayuda para actualizar su método de pago.",
    p4: "Si ya no desea continuar con la protección, simplemente ignore este correo.",
    subject: "Su protección ha sido desactivada",
  },
  fr: {
    title: "La protection a été désactivée !",
    preview: "Votre protection a été désactivée car le paiement a échoué à plusieurs reprises.",
    greeting: "Madame, Monsieur,",
    p1: "notre formule de protection permet d'éviter la réapparition d'une fiche d'établissement Google indésirable.",
    p2Bold: "La protection a été désactivée car le paiement a échoué à plusieurs reprises",
    p2: " (carte expirée, fonds insuffisants, etc.).",
    warnA: "Veuillez noter que votre fiche ",
    warnBold: "peut désormais réapparaître et recevoir des avis à tout moment.",
    warnB: " Si la protection n'est pas réactivée, la suppression ",
    warnBold2: "ne sera possible que moyennant des frais supplémentaires.",
    cta: "Résoudre le problème / Réactiver la protection",
    p3: "Veuillez réactiver votre protection manuellement dès que possible, ou répondez à cet e-mail si vous avez besoin d'aide pour mettre à jour votre moyen de paiement.",
    p4: "Si vous ne souhaitez plus poursuivre la protection, ignorez simplement cet e-mail.",
    subject: "Votre protection a été désactivée",
  },
  it: {
    title: "La protezione è stata disattivata!",
    preview: "La sua protezione è stata disattivata perché il pagamento è fallito ripetutamente.",
    greeting: "Gentili Signore e Signori,",
    p1: "il nostro piano di protezione aiuta a impedire la ricomparsa di un profilo dell'attività su Google indesiderato.",
    p2Bold: "La protezione è stata disattivata perché il pagamento è fallito ripetutamente",
    p2: " (carta scaduta, fondi insufficienti, ecc.).",
    warnA: "La preghiamo di notare che il suo profilo ",
    warnBold: "può ora ricomparire e ricevere recensioni in qualsiasi momento.",
    warnB: " Se la protezione non viene riattivata, la rimozione ",
    warnBold2: "sarà possibile solo a pagamento.",
    cta: "Risolvere il problema / Riattivare la protezione",
    p3: "La preghiamo di riattivare la sua protezione manualmente al più presto oppure di risponderci a questa e-mail se ha bisogno di aiuto per aggiornare il suo metodo di pagamento.",
    p4: "Se non desidera più proseguire con la protezione, ignori semplicemente questa e-mail.",
    subject: "La sua protezione è stata disattivata",
  },
  nl: {
    title: "De bescherming is gedeactiveerd!",
    preview: "Uw bescherming is gedeactiveerd omdat de betaling herhaaldelijk is mislukt.",
    greeting: "Geachte heer/mevrouw,",
    p1: "ons beschermingsplan helpt voorkomen dat een ongewenst Google-bedrijfsprofiel opnieuw verschijnt.",
    p2Bold: "De bescherming is gedeactiveerd omdat de betaling herhaaldelijk is mislukt",
    p2: " (verlopen kaart, onvoldoende saldo, enz.).",
    warnA: "Houd er rekening mee dat uw profiel ",
    warnBold: "nu op elk moment opnieuw kan verschijnen en beoordelingen kan ontvangen.",
    warnB: " Als de bescherming niet opnieuw wordt geactiveerd, is verwijdering ",
    warnBold2: "alleen tegen betaling mogelijk.",
    cta: "Probleem oplossen / Bescherming heractiveren",
    p3: "Activeer uw bescherming zo snel mogelijk handmatig opnieuw, of antwoord op deze e-mail als u hulp nodig hebt bij het bijwerken van uw betaalmethode.",
    p4: "Als u de bescherming niet langer wenst, kunt u deze e-mail eenvoudig negeren.",
    subject: "Uw bescherming is gedeactiveerd",
  },
  pt: {
    title: "A proteção foi desativada!",
    preview: "A sua proteção foi desativada porque o pagamento falhou repetidamente.",
    greeting: "Exmos. Senhores,",
    p1: "o nosso plano de proteção ajuda a evitar que um perfil de empresa do Google indesejado volte a aparecer.",
    p2Bold: "A proteção foi desativada porque o pagamento falhou repetidamente",
    p2: " (cartão expirado, saldo insuficiente, etc.).",
    warnA: "Tenha em atenção que o seu perfil ",
    warnBold: "pode agora voltar a aparecer e receber avaliações a qualquer momento.",
    warnB: " Se a proteção não for reativada, a eliminação ",
    warnBold2: "só será possível mediante pagamento adicional.",
    cta: "Resolver o problema / Reativar a proteção",
    p3: "Reative a sua proteção manualmente o mais rapidamente possível ou responda a este e-mail se precisar de ajuda para atualizar o seu método de pagamento.",
    p4: "Se já não pretender continuar com a proteção, basta ignorar este e-mail.",
    subject: "A sua proteção foi desativada",
  },
  ja: {
    title: "保護が無効になりました!",
    preview: "お支払いが繰り返し失敗したため、保護が無効になりました。",
    greeting: "ご担当者様",
    p1: "当社の保護プランは、不要なGoogleビジネスプロフィールの再表示を防ぐのに役立ちます。",
    p2Bold: "お支払いが繰り返し失敗したため、保護が無効になりました",
    p2: "(カードの有効期限切れ、残高不足など)。",
    warnA: "現在、お客様のプロフィールは",
    warnBold: "いつでも再表示され、口コミが投稿される可能性があります。",
    warnB: " 保護が再有効化されない場合、削除は",
    warnBold2: "追加料金が発生する場合のみ可能です。",
    cta: "問題を解決 / 保護を再有効化",
    p3: "できるだけ早く手動で保護を再有効化していただくか、お支払い方法の更新にサポートが必要な場合はこのメールにご返信ください。",
    p4: "保護の継続をご希望でない場合は、このメールを無視していただいて構いません。",
    subject: "お客様の保護が無効になりました",
  },
  sv: {
    title: "Skyddet har inaktiverats!",
    preview: "Ditt skydd har inaktiverats eftersom betalningen upprepade gånger misslyckades.",
    greeting: "Hej,",
    p1: "vår skyddsplan hjälper till att förhindra att en oönskad Google-företagsprofil dyker upp igen.",
    p2Bold: "Skyddet har inaktiverats eftersom betalningen upprepade gånger misslyckades",
    p2: " (utgånget kort, otillräckliga medel osv.).",
    warnA: "Observera att din profil ",
    warnBold: "nu kan dyka upp igen och få omdömen när som helst.",
    warnB: " Om skyddet inte återaktiveras är borttagning ",
    warnBold2: "endast möjlig mot en avgift.",
    cta: "Åtgärda problemet / Återaktivera skyddet",
    p3: "Återaktivera ditt skydd manuellt så snart som möjligt, eller svara på det här e-postmeddelandet om du behöver hjälp med att uppdatera din betalningsmetod.",
    p4: "Om du inte längre vill fortsätta med skyddet kan du bara bortse från det här e-postmeddelandet.",
    subject: "Ditt skydd har inaktiverats",
  },
  da: {
    title: "Beskyttelsen er blevet deaktiveret!",
    preview: "Din beskyttelse er blevet deaktiveret, fordi betalingen gentagne gange mislykkedes.",
    greeting: "Kære kunde,",
    p1: "vores beskyttelsesplan hjælper med at forhindre, at en uønsket Google-virksomhedsprofil dukker op igen.",
    p2Bold: "Beskyttelsen er blevet deaktiveret, fordi betalingen gentagne gange mislykkedes",
    p2: " (udløbet kort, manglende dækning osv.).",
    warnA: "Vær opmærksom på, at din profil ",
    warnBold: "nu til enhver tid kan dukke op igen og modtage anmeldelser.",
    warnB: " Hvis beskyttelsen ikke genaktiveres, er fjernelse ",
    warnBold2: "kun mulig mod betaling.",
    cta: "Løs problemet / Genaktivér beskyttelsen",
    p3: "Genaktivér venligst din beskyttelse manuelt hurtigst muligt, eller svar på denne e-mail, hvis du har brug for hjælp til at opdatere din betalingsmetode.",
    p4: "Hvis du ikke længere ønsker at fortsætte med beskyttelsen, kan du blot ignorere denne e-mail.",
    subject: "Din beskyttelse er blevet deaktiveret",
  },
  no: {
    title: "Beskyttelsen er deaktivert!",
    preview: "Beskyttelsen din er deaktivert fordi betalingen mislyktes gjentatte ganger.",
    greeting: "Hei,",
    p1: "beskyttelsesplanen vår bidrar til å hindre at en uønsket Google-bedriftsprofil dukker opp igjen.",
    p2Bold: "Beskyttelsen er deaktivert fordi betalingen mislyktes gjentatte ganger",
    p2: " (utløpt kort, manglende dekning osv.).",
    warnA: "Vær oppmerksom på at profilen din ",
    warnBold: "nå når som helst kan dukke opp igjen og motta anmeldelser.",
    warnB: " Hvis beskyttelsen ikke reaktiveres, er fjerning ",
    warnBold2: "kun mulig mot betaling.",
    cta: "Løs problemet / Reaktiver beskyttelsen",
    p3: "Reaktiver beskyttelsen din manuelt så snart som mulig, eller svar på denne e-posten hvis du trenger hjelp til å oppdatere betalingsmåten din.",
    p4: "Hvis du ikke lenger ønsker å fortsette med beskyttelsen, kan du bare se bort fra denne e-posten.",
    subject: "Beskyttelsen din er deaktivert",
  },
};

export function subject(p: AboDeaktiviertProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function AboDeaktiviert({ lang = "de", reactivateUrl = "https://rapid-remove.com" }: AboDeaktiviertProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1}</P>
      <P><strong>{t.p2Bold}</strong>{t.p2}</P>
      <DangerBox>
        {t.warnA}<strong>{t.warnBold}</strong>{t.warnB}<strong>{t.warnBold2}</strong>
      </DangerBox>
      <Section style={{ margin: "4px 0 14px" }}>
        <CtaButton href={reactivateUrl} variant="danger" full>{t.cta}</CtaButton>
      </Section>
      <P>{t.p3}</P>
      <P muted>{t.p4}</P>
      <Support lang={lang} />
    </EmailShell>
  );
}
