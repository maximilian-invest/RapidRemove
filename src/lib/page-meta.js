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
  kontakt: { de: "Kontakt", en: "Contact", es: "Contacto", fr: "Contact", it: "Contatti", nl: "Contact", pt: "Contacto", ja: "お問い合わせ", sv: "Kontakt", da: "Kontakt", no: "Kontakt" },
  wizard: { de: "Profil prüfen", en: "Check your profile", es: "Comprobar perfil", fr: "Vérifier la fiche", it: "Verifica profilo", nl: "Profiel checken", pt: "Verificar perfil", ja: "プロフィールを確認", sv: "Kontrollera profil", da: "Tjek profil", no: "Sjekk profil" },
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

export function pageMeta(key, lang) {
  const name = (PAGE_TITLE[key] && (PAGE_TITLE[key][lang] || PAGE_TITLE[key].en)) || "RapidRemove";
  const blurb = BRAND_BLURB[lang] || BRAND_BLURB.en;
  return { name, title: `${name} — RapidRemove`, description: `${name} · ${blurb}` };
}
