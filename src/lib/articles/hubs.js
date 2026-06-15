/* RapidRemove — the "Lead/Hub" article ("Delete Google Business Profile").
   Exists in all 11 languages. DE is rendered by the bespoke Article.jsx; the
   other 10 use the data-driven MagArticle (one data file + one route each).
   This LIGHT module centralizes the slugs/paths and the lightweight magazine-card
   meta so hreflang, the magazine grid, related-link resolution and the sitemap
   all share one source of truth — without importing the heavy article bodies. */
import { SITE_URL } from "@/lib/article-google-profil";

// Root-relative paths WITH trailing slash (on-site links / langUrls / card href).
export const HUB_PATH = {
  de: "/magazin/google-unternehmensprofil-loeschen/",
  en: "/en/delete-google-business-profile/",
  es: "/es/eliminar-perfil-de-empresa-google/",
  pt: "/pt/eliminar-perfil-empresa-google/",
  it: "/it/eliminare-profilo-attivita-google/",
  fr: "/fr/supprimer-profil-etablissement-google/",
  ja: "/ja/google-business-profile-sakujo/",
  no: "/no/slett-google-bedriftsprofil/",
  sv: "/sv/radera-google-foretagsprofil/",
  da: "/da/slet-google-virksomhedsprofil/",
  nl: "/nl/google-bedrijfsprofiel-verwijderen/",
};

export const hubPath = (lang) => HUB_PATH[lang] || null;
export const hubUrl = (lang) => (HUB_PATH[lang] ? SITE_URL + HUB_PATH[lang].replace(/\/$/, "") : null);

/** hreflang alternates for the hub: every language version + x-default → DE. */
export function hubHreflang() {
  const m = {};
  for (const l of Object.keys(HUB_PATH)) m[l] = hubUrl(l);
  m["x-default"] = hubUrl("de");
  return m;
}

/** Root-relative langUrls map (with trailing slash) for the in-page switcher. */
export const hubLangUrls = () => ({ ...HUB_PATH });

// Lightweight magazine-card meta for the localized hubs (DE has its own flagship
// presentation; not listed here). slug/title/excerpt/cat only — no article body.
export const HUB_CARD = {
  en: { slug: "delete-google-business-profile", cat: "Google policy",
        title: "Delete Google Business Profile: Complete Guide (2026)",
        excerpt: "Why “permanently closed” isn't deletion — and how to remove your Google Business Profile and all its reviews for good." },
  es: { slug: "eliminar-perfil-de-empresa-google", cat: "Política de Google",
        title: "Eliminar perfil de empresa de Google: guía completa",
        excerpt: "Por qué «cerrado definitivamente» no es una eliminación — y el camino real para borrar el perfil y todas las reseñas." },
  pt: { slug: "eliminar-perfil-empresa-google", cat: "Políticas do Google",
        title: "Eliminar perfil de empresa do Google: guia completo",
        excerpt: "Por que «encerrado definitivamente» não é uma eliminação — e o caminho real para remover o perfil e todas as avaliações." },
  it: { slug: "eliminare-profilo-attivita-google", cat: "Norme di Google",
        title: "Eliminare il profilo dell'attività su Google: guida completa",
        excerpt: "Perché «definitivamente chiusa» non è un'eliminazione — e la via reale per rimuovere il profilo e tutte le recensioni." },
  fr: { slug: "supprimer-profil-etablissement-google", cat: "Règles Google",
        title: "Supprimer sa fiche d'établissement Google : le guide complet",
        excerpt: "Pourquoi « définitivement fermé » n'est pas une suppression — et la voie fiable pour retirer la fiche et tous les avis." },
  ja: { slug: "google-business-profile-sakujo", cat: "Googleポリシー",
        title: "Googleビジネスプロフィールを削除する方法（完全ガイド）",
        excerpt: "「完全に閉業」は削除ではない理由と、プロフィールとすべてのクチコミを本当に消す方法。" },
  no: { slug: "slett-google-bedriftsprofil", cat: "Googles retningslinjer",
        title: "Slette Google-bedriftsprofil: steg for steg",
        excerpt: "Hvorfor «permanent stengt» ikke er sletting — og den pålitelige veien til å fjerne profilen og alle anmeldelser." },
  sv: { slug: "radera-google-foretagsprofil", cat: "Googles policy",
        title: "Radera Google-företagsprofil: komplett guide",
        excerpt: "Varför »permanent stängd» inte är radering — och den tillförlitliga vägen att ta bort profilen och alla recensioner." },
  da: { slug: "slet-google-virksomhedsprofil", cat: "Googles politik",
        title: "Slet Google-virksomhedsprofil: sådan gør du",
        excerpt: "Hvorfor »permanent lukket« ikke er en sletning — og den pålidelige vej til at fjerne profilen og alle anmeldelser." },
  nl: { slug: "google-bedrijfsprofiel-verwijderen", cat: "Google-beleid",
        title: "Google-bedrijfsprofiel verwijderen: handleiding",
        excerpt: "Waarom „permanent gesloten” geen verwijdering is — en de betrouwbare route om het profiel en alle reviews te verwijderen." },
};
