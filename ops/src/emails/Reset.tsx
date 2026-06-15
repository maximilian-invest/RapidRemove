/* Template: Zurücksetzen statt Löschen – Änderung des Auftrags / Change of order (DE/EN). */
import * as React from "react";
import { EmailShell, P, CtaButton } from "./components";
import { Section } from "@react-email/components";

export interface ResetProps { lang?: "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no"; confirmUrl?: string; cancelUrl?: string; }

const T = {
  de: {
    title: "Änderung Ihres Auftrags",
    preview: "Wir können Ihr Profil nicht löschen, aber vollständig zurücksetzen.",
    greeting: "Sehr geehrte Damen und Herren,",
    p1a: "vielen Dank für Ihre kürzliche Bestellung. Nach sorgfältiger Überprüfung haben wir festgestellt, dass wir aufgrund von internen, rechtlichen und ethischen Richtlinien ",
    p1Bold: "Ihr Unternehmensprofil nicht gänzlich löschen, sondern nur vollständig zurücksetzen können.",
    p2a: "Dabei werden alle bisherigen Bewertungen – sowohl positive als auch negative – entfernt, Ihre gute Auffindbarkeit auf Google bleibt weiterhin erhalten. ",
    p2Bold: "Wir benötigen lediglich einen Handelsregisterauszug oder Gewerbeschein.",
    confirm: "Bestätigen und Nachweis hochladen",
    cancel: "Auftrag stornieren",
    subject: "Änderung Ihres Auftrags",
  },
  en: {
    title: "Change Of Your Order",
    preview: "We cannot delete your profile, but we can fully reset it instead.",
    greeting: "Dear Sir or Madam,",
    p1a: "thank you for your recent order. After thoroughly reviewing your Google Business Profile, we have determined that due to policy restrictions, ",
    p1Bold: "we are unable to completely delete your profile but can fully reset it instead.",
    p2a: "All previous reviews—both positive and negative—will be removed, while your good visibility on Google remains unaffected. ",
    p2Bold: "We require a commercial register excerpt or a business license.",
    confirm: "Confirm and upload documents",
    cancel: "Cancel order",
    subject: "Change of your order",
  },
  es: {
    title: "Modificación de su pedido",
    preview: "No podemos eliminar su perfil, pero sí restablecerlo por completo.",
    greeting: "Estimados señores:",
    p1a: "muchas gracias por su reciente pedido. Tras una revisión minuciosa, hemos comprobado que, debido a directrices internas, legales y éticas, ",
    p1Bold: "no podemos eliminar por completo su perfil de empresa, sino únicamente restablecerlo en su totalidad.",
    p2a: "Durante este proceso se eliminan todas las reseñas anteriores —tanto positivas como negativas—, mientras que su buena visibilidad en Google se mantiene. ",
    p2Bold: "Únicamente necesitamos un extracto del registro mercantil o una licencia de actividad.",
    confirm: "Confirmar y subir el justificante",
    cancel: "Cancelar el pedido",
    subject: "Modificación de su pedido",
  },
  fr: {
    title: "Modification de votre commande",
    preview: "Nous ne pouvons pas supprimer votre fiche, mais la réinitialiser entièrement.",
    greeting: "Madame, Monsieur,",
    p1a: "merci beaucoup de votre récente commande. Après un examen attentif, nous avons constaté qu'en raison de directives internes, juridiques et éthiques, ",
    p1Bold: "nous ne pouvons pas supprimer entièrement votre fiche d'établissement, mais seulement la réinitialiser intégralement.",
    p2a: "Lors de cette opération, tous les avis précédents — tant positifs que négatifs — sont supprimés, tandis que votre bonne visibilité sur Google reste préservée. ",
    p2Bold: "Nous avons uniquement besoin d'un extrait du registre du commerce ou d'une immatriculation d'entreprise.",
    confirm: "Confirmer et téléverser le justificatif",
    cancel: "Annuler la commande",
    subject: "Modification de votre commande",
  },
  it: {
    title: "Modifica del vostro ordine",
    preview: "Non possiamo eliminare il vostro profilo, ma possiamo reimpostarlo completamente.",
    greeting: "Gentili Signore e Signori,",
    p1a: "grazie di cuore per il vostro recente ordine. Dopo un'attenta verifica, abbiamo constatato che, a causa di direttive interne, legali ed etiche, ",
    p1Bold: "non possiamo eliminare del tutto il vostro profilo dell'attività, ma soltanto reimpostarlo completamente.",
    p2a: "Durante questa operazione vengono rimosse tutte le recensioni precedenti — sia positive che negative —, mentre la vostra buona reperibilità su Google rimane invariata. ",
    p2Bold: "Ci serve unicamente una visura camerale o una licenza commerciale.",
    confirm: "Confermare e caricare il documento",
    cancel: "Annullare l'ordine",
    subject: "Modifica del vostro ordine",
  },
  nl: {
    title: "Wijziging van uw bestelling",
    preview: "Wij kunnen uw profiel niet verwijderen, maar wel volledig resetten.",
    greeting: "Geachte heer/mevrouw,",
    p1a: "hartelijk dank voor uw recente bestelling. Na zorgvuldige controle hebben wij vastgesteld dat wij vanwege interne, juridische en ethische richtlijnen ",
    p1Bold: "uw bedrijfsprofiel niet volledig kunnen verwijderen, maar alleen volledig kunnen resetten.",
    p2a: "Daarbij worden alle eerdere beoordelingen — zowel positieve als negatieve — verwijderd, terwijl uw goede vindbaarheid op Google behouden blijft. ",
    p2Bold: "Wij hebben enkel een uittreksel uit het handelsregister of een KvK-bewijs nodig.",
    confirm: "Bevestigen en bewijs uploaden",
    cancel: "Bestelling annuleren",
    subject: "Wijziging van uw bestelling",
  },
  pt: {
    title: "Alteração da sua encomenda",
    preview: "Não podemos eliminar o seu perfil, mas podemos repô-lo por completo.",
    greeting: "Exmos. Senhores,",
    p1a: "muito obrigado pela sua recente encomenda. Após uma verificação cuidadosa, constatámos que, devido a diretrizes internas, legais e éticas, ",
    p1Bold: "não podemos eliminar totalmente o seu perfil de empresa, mas apenas repô-lo na íntegra.",
    p2a: "Neste processo são removidas todas as avaliações anteriores — tanto positivas como negativas —, mantendo-se a sua boa visibilidade no Google. ",
    p2Bold: "Necessitamos apenas de uma certidão do registo comercial ou de um alvará de atividade.",
    confirm: "Confirmar e carregar o comprovativo",
    cancel: "Cancelar a encomenda",
    subject: "Alteração da sua encomenda",
  },
  ja: {
    title: "ご注文内容の変更について",
    preview: "プロフィールを削除することはできませんが、完全にリセットすることは可能です。",
    greeting: "ご担当者様",
    p1a: "このたびはご注文を賜り、誠にありがとうございます。慎重に確認いたしました結果、社内・法的・倫理的な方針により、",
    p1Bold: "お客様のビジネスプロフィールを完全に削除することはできず、完全にリセットすることのみ可能であることが判明いたしました。",
    p2a: "この処理では、これまでのすべての口コミ（好意的なものも否定的なものも含む）が削除されますが、Google上での良好な検索表示は引き続き維持されます。",
    p2Bold: "必要となるのは、商業登記簿の抄本または営業許可証のみです。",
    confirm: "承認して証明書をアップロード",
    cancel: "注文をキャンセルする",
    subject: "ご注文内容の変更について",
  },
  sv: {
    title: "Ändring av din beställning",
    preview: "Vi kan inte radera din profil, men vi kan återställa den helt.",
    greeting: "Hej,",
    p1a: "tack så mycket för din nyligen gjorda beställning. Efter noggrann granskning har vi konstaterat att vi på grund av interna, juridiska och etiska riktlinjer ",
    p1Bold: "inte kan radera din företagsprofil helt och hållet, utan endast återställa den fullständigt.",
    p2a: "I samband med detta tas alla tidigare omdömen — såväl positiva som negativa — bort, medan din goda synlighet på Google bibehålls. ",
    p2Bold: "Vi behöver endast ett registreringsbevis från Bolagsverket eller ett näringstillstånd.",
    confirm: "Bekräfta och ladda upp underlag",
    cancel: "Annullera beställningen",
    subject: "Ändring av din beställning",
  },
  da: {
    title: "Ændring af din bestilling",
    preview: "Vi kan ikke slette din profil, men vi kan nulstille den fuldstændigt.",
    greeting: "Kære kunde,",
    p1a: "mange tak for din nylige bestilling. Efter en grundig gennemgang har vi konstateret, at vi på grund af interne, juridiske og etiske retningslinjer ",
    p1Bold: "ikke kan slette din virksomhedsprofil helt, men kun nulstille den fuldstændigt.",
    p2a: "I den forbindelse fjernes alle hidtidige anmeldelser — både positive og negative —, mens din gode synlighed på Google bevares. ",
    p2Bold: "Vi har blot brug for et udskrift fra handelsregistret eller et erhvervsbevis.",
    confirm: "Bekræft og upload dokumentation",
    cancel: "Annuller bestillingen",
    subject: "Ændring af din bestilling",
  },
  no: {
    title: "Endring av bestillingen din",
    preview: "Vi kan ikke slette profilen din, men vi kan tilbakestille den fullstendig.",
    greeting: "Hei,",
    p1a: "tusen takk for din nylige bestilling. Etter en grundig gjennomgang har vi fastslått at vi på grunn av interne, juridiske og etiske retningslinjer ",
    p1Bold: "ikke kan slette bedriftsprofilen din helt, men kun tilbakestille den fullstendig.",
    p2a: "I den forbindelse fjernes alle tidligere anmeldelser — både positive og negative —, mens din gode synlighet på Google opprettholdes. ",
    p2Bold: "Vi trenger kun en firmaattest fra foretaksregisteret eller en næringslisens.",
    confirm: "Bekreft og last opp dokumentasjon",
    cancel: "Kanseller bestillingen",
    subject: "Endring av bestillingen din",
  },
};

export function subject(p: ResetProps = {}): string {
  return (T[p.lang || "de"] || T.de).subject;
}

export default function Reset({
  lang = "de", confirmUrl = "https://www.rapid-remove.com", cancelUrl = "mailto:helpdesk@rapid-remove.com",
}: ResetProps = {}) {
  const t = T[lang] || T.de;
  return (
    <EmailShell preview={t.preview} title={t.title} lang={lang}>
      <P><strong>{t.greeting}</strong></P>
      <P>{t.p1a}<strong>{t.p1Bold}</strong></P>
      <P>{t.p2a}<strong>{t.p2Bold}</strong></P>
      <Section style={{ margin: "18px 0 8px" }}>
        <CtaButton href={confirmUrl} full>{t.confirm}</CtaButton>
      </Section>
      <Section style={{ margin: "0 0 6px" }}>
        <CtaButton href={cancelUrl} variant="secondary" full>{t.cancel}</CtaButton>
      </Section>
    </EmailShell>
  );
}
