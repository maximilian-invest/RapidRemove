/* RapidRemove — localized <title>/description for the secondary pages.
   Plain data (no "use client") so it can be read server-side in
   generateMetadata. Title = "<name> — RapidRemove"; description prepends the
   page name to a localized brand blurb so each page stays unique per locale. */

export const PAGE_TITLE = {
  about: { de: "Über uns", en: "About us", es: "Sobre nosotros", fr: "À propos", it: "Chi siamo", nl: "Over ons", pt: "Sobre nós", ja: "会社概要", sv: "Om oss", da: "Om os", no: "Om oss" },
  impressum: { de: "Impressum", en: "Legal notice", es: "Aviso legal", fr: "Mentions légales", it: "Note legali", nl: "Colofon", pt: "Aviso legal", ja: "法的表示", sv: "Juridisk information", da: "Juridisk meddelelse", no: "Juridisk informasjon" },
  datenschutz: { de: "Datenschutz", en: "Privacy policy", es: "Política de privacidad", fr: "Politique de confidentialité", it: "Informativa privacy", nl: "Privacybeleid", pt: "Política de privacidade", ja: "プライバシーポリシー", sv: "Integritetspolicy", da: "Privatlivspolitik", no: "Personvern" },
  orm: { de: "Reputation verdrängen", en: "Reputation management", es: "Gestión de reputación", fr: "Gestion de réputation", it: "Gestione della reputazione", nl: "Reputatiebeheer", pt: "Gestão de reputação", ja: "オンライン評判管理", sv: "Rykteshantering", da: "Omdømmestyring", no: "Omdømmehåndtering" },
  deindex: { de: "Presse auslisten", en: "Press de-indexing", es: "Desindexar prensa", fr: "Désindexation de presse", it: "Deindicizzazione stampa", nl: "Pers de-indexeren", pt: "Desindexar imprensa", ja: "プレス記事の削除", sv: "Avindexera press", da: "Afindeksér presse", no: "Avindekser presse" },
  seo: { de: "SEO & Sichtbarkeit", en: "SEO & visibility", es: "SEO y visibilidad", fr: "SEO et visibilité", it: "SEO e visibilità", nl: "SEO & zichtbaarheid", pt: "SEO e visibilidade", ja: "SEO・可視性", sv: "SEO och synlighet", da: "SEO og synlighed", no: "SEO og synlighet" },
  kontakt: { de: "Kontakt", en: "Contact", es: "Contacto", fr: "Contact", it: "Contatti", nl: "Contact", pt: "Contacto", ja: "お問い合わせ", sv: "Kontakt", da: "Kontakt", no: "Kontakt" },
  wizard: { de: "Profil prüfen", en: "Check your profile", es: "Comprobar perfil", fr: "Vérifier la fiche", it: "Verifica profilo", nl: "Profiel checken", pt: "Verificar perfil", ja: "プロフィールを確認", sv: "Kontrollera profil", da: "Tjek profil", no: "Sjekk profil" },
  agb: { de: "AGB", en: "Terms & Conditions", es: "Términos y condiciones", fr: "CGV", it: "Termini e condizioni", nl: "Algemene voorwaarden", pt: "Termos e condições", ja: "利用規約", sv: "Allmänna villkor", da: "Handelsbetingelser", no: "Vilkår" },
  widerruf: { de: "Widerrufsbelehrung", en: "Right of withdrawal", es: "Derecho de desistimiento", fr: "Droit de rétractation", it: "Diritto di recesso", nl: "Herroepingsrecht", pt: "Direito de retratação", ja: "撤回権について", sv: "Ångerrätt", da: "Fortrydelsesret", no: "Angrerett" },
  report: { de: "Google-Profil-Löschungen: Report 2026", en: "Google Business Profile Removal Report 2026" },
  // Bewertungs-Produkt: nicht in DACH — bewusst kein de-Eintrag (Seite existiert dort nicht).
  reviews: { en: "Google Review Removal – $179, Pay Only on Success", es: "Eliminar reseña de Google – 179 €, pagas solo si se borra", fr: "Supprimer un avis Google – 179 €, payé seulement au résultat", it: "Eliminare recensione Google – 179 €, paghi solo a risultato", pt: "Remover avaliação do Google – 179 €, só paga se sair", nl: "Google review verwijderen – € 179, alleen betalen bij succes", ja: "Google口コミ削除｜1件$179・削除できた分だけの成功報酬", sv: "Ta bort Google-recension – 179 €, betala bara vid framgång", da: "Fjern Google-anmeldelse – 179 €, betal kun ved succes", no: "Slette Google-anmeldelse – 179 €, betal kun ved suksess" },
};

const BRAND_BLURB = {
  de: "RapidRemove – eingetragene Firma aus Österreich für die professionelle Löschung von Google-Unternehmensprofilen. Bezahlung erst nach Erfolg.",
  en: "RapidRemove — a registered Austrian company for the professional removal of Google Business Profiles. Pay only on success.",
  es: "RapidRemove: empresa austriaca registrada para la eliminación profesional de perfiles de empresa de Google. Pago solo tras el éxito.",
  fr: "RapidRemove — entreprise autrichienne déclarée, spécialisée dans la suppression de fiches d'établissement Google. Paiement uniquement en cas de succès.",
  it: "RapidRemove — azienda austriaca registrata per la rimozione professionale dei profili aziendali Google. Si paga solo in caso di successo.",
  nl: "RapidRemove — geregistreerd Oostenrijks bedrijf voor het professioneel verwijderen van Google-bedrijfsprofielen. Betaling pas na succes.",
  pt: "RapidRemove — empresa austríaca registada para a remoção profissional de perfis de empresa do Google. Pagamento só após sucesso.",
  ja: "RapidRemove — Googleビジネスプロフィールの専門的な削除を行うオーストリアの登記済み企業。成功報酬制。",
  sv: "RapidRemove — registrerat österrikiskt företag för professionell borttagning av Google-företagsprofiler. Betalning först vid framgång.",
  da: "RapidRemove — registreret østrigsk virksomhed for professionel fjernelse af Google-virksomhedsprofiler. Betaling først ved succes.",
  no: "RapidRemove — registrert østerriksk selskap for profesjonell fjerning av Google-bedriftsprofiler. Betaling først ved suksess.",
};

/* Eigenständige Descriptions je Seite (statt Brand-Boilerplate). Vorerst EN;
   Sprachen ohne Eintrag fallen auf "<Name> · Brand-Blurb" zurück. */
const PAGE_DESC = {
  about: { en: "Who is behind RapidRemove: a registered Austrian company specializing in removing Google Business Profiles — over 1,000 cases, pay only after success." },
  orm: { en: "Push negative Google results off page 1: strategy, content and monitoring to win back your online reputation — free initial analysis." },
  deindex: { en: "Have negative press and unwanted Google results de-indexed — free initial legal review via our partner law firm, engagement only if realistic." },
  seo: { en: "Get found on Google by the right customers: local, organic and measurable SEO with transparent monthly reporting — free SEO analysis, no lock-in contracts." },
  kontakt: { en: "Talk to the RapidRemove team about removals, ongoing cases or partnerships — personal reply, usually within 24 hours." },
  report: {
    en: "Data from 1,600+ Google Business Profile removals and 20,000+ profile checks since 2023: removed profiles averaged 3.5 stars, more than half of all requests now come in English, the US is the #2 country.",
    de: "Daten aus über 1.600 Löschungen von Google-Unternehmensprofilen und 20.000+ Profil-Checks seit 2023: gelöschte Profile hatten im Schnitt 3,5 Sterne, jede zweite Anfrage kommt auf Englisch, die USA sind Land Nr. 2.",
  },
  wizard: { en: "Check in seconds whether your Google Business Profile can be removed — free, no sign-up, pay only after successful removal." },
  reviews: {
    en: "Get fake, abusive or policy-violating Google reviews removed through Google's official processes – $179 per removed review, charged only on success. Free assessment first.",
    es: "Eliminamos reseñas de Google falsas, ofensivas o que incumplen sus normas por las vías oficiales. 179 € por reseña eliminada, solo si hay éxito.",
    fr: "Faux avis, insultes ou avis contraires aux règles de Google : nous les faisons supprimer par les voies officielles. 179 € par avis supprimé, au résultat.",
    it: "Rimuoviamo recensioni Google false, offensive o contrarie alle regole con le procedure ufficiali di Google. 179 € per recensione rimossa, solo a risultato.",
    pt: "Removemos avaliações do Google falsas, ofensivas ou que violam as regras, pelas vias oficiais do Google. 179 € por avaliação removida, só paga com sucesso.",
    nl: "Nep-, beledigende of regelschendende Google-reviews laten verwijderen via de officiële procedures van Google. € 179 per verwijderde review, alleen bij succes.",
    ja: "Googleの悪質な口コミ・やらせ口コミを、Google公式の手続きだけで削除します。料金は削除1件あたり$179の完全成功報酬で、消えなければお支払いなし。まずは無料で、削除できるかを正直に診断します。",
    sv: "Ta bort falska eller kränkande Google-recensioner via Googles officiella processer – 179 € per borttagen recension, bara vid framgång. Gratis bedömning först.",
    da: "Få falske eller krænkende Google-anmeldelser fjernet via Googles officielle processer – 179 € pr. fjernet anmeldelse, kun ved succes. Gratis vurdering først.",
    no: "Få falske eller krenkende Google-anmeldelser slettet via Googles offisielle prosesser – 179 € per fjernet anmeldelse, kun ved suksess. Gratis vurdering først.",
  },
};

export function pageMeta(key, lang) {
  const name = (PAGE_TITLE[key] && (PAGE_TITLE[key][lang] || PAGE_TITLE[key].en)) || "RapidRemove";
  const blurb = BRAND_BLURB[lang] || BRAND_BLURB.en;
  const desc = (PAGE_DESC[key] && PAGE_DESC[key][lang]) || `${name} · ${blurb}`;
  return { name, title: `${name} — RapidRemove`, description: desc };
}
