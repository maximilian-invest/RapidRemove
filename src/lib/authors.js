/* RapidRemove — Autorenprofile (E-E-A-T). Zwei Profile; jeder Artikel wird
   DETERMINISTISCH (Hash des deutschen Slugs) genau einem Autor zugeordnet, damit
   derselbe Artikel in ALLEN Sprachen denselben Autor zeigt. Rolle + Bio liegen in
   allen 11 Sprachen vor (mit EN-Fallback). */
import { SITE_URL } from "@/lib/article-google-profil";

export const AUTHORS = {
  "maximilian-hoelzl": {
    slug: "maximilian-hoelzl",
    name: "Maximilian Hölzl",
    image: "/assets/maximilian-hoelzl.jpg",
  },
  "matthias-lang": {
    slug: "matthias-lang",
    name: "Matthias Lang",
    image: "/assets/matthias-lang.webp",
  },
};

// Rolle (für beide Autoren gleich) je Sprache.
const ROLE_I18N = {
  de: "Google-Experte & Gründer",
  en: "Google Expert & Co-Founder",
  es: "Experto en Google y cofundador",
  fr: "Expert Google & cofondateur",
  it: "Esperto Google e cofondatore",
  nl: "Google-expert & medeoprichter",
  pt: "Especialista em Google e cofundador",
  ja: "Googleエキスパート・共同創業者",
  sv: "Google-expert & medgrundare",
  da: "Google-ekspert & medstifter",
  no: "Google-ekspert & medgründer",
};

// Bio je Autor und Sprache.
const BIO_I18N = {
  "maximilian-hoelzl": {
    de: "Mitgründer von RapidRemove und Google-Experte. Spezialisiert auf die dauerhafte Löschung von Google-Unternehmensprofilen und den Schutz der Online-Reputation von Unternehmen.",
    en: "Co-founder of RapidRemove and Google expert, specialized in permanently deleting Google Business Profiles and protecting companies' online reputation.",
    es: "Cofundador de RapidRemove y experto en Google. Especializado en la eliminación permanente de perfiles de empresa de Google y en proteger la reputación online de las empresas.",
    fr: "Cofondateur de RapidRemove et expert Google. Spécialisé dans la suppression définitive des fiches d'établissement Google et la protection de l'e-réputation des entreprises.",
    it: "Cofondatore di RapidRemove ed esperto Google. Specializzato nell'eliminazione definitiva dei profili dell'attività su Google e nella protezione della reputazione online delle aziende.",
    nl: "Medeoprichter van RapidRemove en Google-expert. Gespecialiseerd in het permanent verwijderen van Google-bedrijfsprofielen en het beschermen van de online reputatie van bedrijven.",
    pt: "Cofundador da RapidRemove e especialista em Google. Especializado na eliminação permanente de perfis de empresa do Google e na proteção da reputação online das empresas.",
    ja: "RapidRemoveの共同創業者でGoogleの専門家。Googleビジネスプロフィールの永久削除と、企業のオンライン評判の保護を専門としています。",
    sv: "Medgrundare av RapidRemove och Google-expert. Specialiserad på permanent borttagning av Google-företagsprofiler och på att skydda företags online-rykte.",
    da: "Medstifter af RapidRemove og Google-ekspert. Specialiseret i permanent fjernelse af Google-virksomhedsprofiler og i at beskytte virksomheders online-omdømme.",
    no: "Medgründer av RapidRemove og Google-ekspert. Spesialisert på permanent fjerning av Google-bedriftsprofiler og på å beskytte bedrifters nettomdømme.",
  },
  "matthias-lang": {
    de: "Mitgründer von RapidRemove und Google-Experte. Begleitet Unternehmen bei der Entfernung negativer Google-Einträge und -Bewertungen und beim Aufbau einer starken Online-Reputation.",
    en: "Co-founder of RapidRemove and Google expert, helping companies remove negative Google listings and reviews and build a strong online reputation.",
    es: "Cofundador de RapidRemove y experto en Google. Acompaña a las empresas en la eliminación de entradas y reseñas negativas de Google y en la construcción de una sólida reputación online.",
    fr: "Cofondateur de RapidRemove et expert Google. Il accompagne les entreprises dans la suppression des fiches et avis Google négatifs et la construction d'une e-réputation solide.",
    it: "Cofondatore di RapidRemove ed esperto Google. Affianca le aziende nella rimozione di schede e recensioni Google negative e nella costruzione di una solida reputazione online.",
    nl: "Medeoprichter van RapidRemove en Google-expert. Begeleidt bedrijven bij het verwijderen van negatieve Google-vermeldingen en reviews en bij het opbouwen van een sterke online reputatie.",
    pt: "Cofundador da RapidRemove e especialista em Google. Acompanha as empresas na remoção de registos e avaliações negativas do Google e na construção de uma sólida reputação online.",
    ja: "RapidRemoveの共同創業者でGoogleの専門家。企業による否定的なGoogle掲載やクチコミの削除、そして強固なオンライン評判の構築を支援しています。",
    sv: "Medgrundare av RapidRemove och Google-expert. Hjälper företag att ta bort negativa Google-annonser och omdömen och att bygga ett starkt online-rykte.",
    da: "Medstifter af RapidRemove og Google-ekspert. Hjælper virksomheder med at fjerne negative Google-annoncer og anmeldelser og opbygge et stærkt online-omdømme.",
    no: "Medgründer av RapidRemove og Google-ekspert. Hjelper bedrifter med å fjerne negative Google-oppføringer og omtaler og bygge et sterkt nettomdømme.",
  },
};

const KEYS = ["maximilian-hoelzl", "matthias-lang"];

// Explizite Autor-Zuordnung, wo die Redaktion bewusst von der Hash-Verteilung
// abweicht. Keyed über den deutschen Slug → bleibt sprachübergreifend stabil.
const AUTHOR_OVERRIDES = {
  "negative-bewertung-ignorieren-antworten-loeschen": "maximilian-hoelzl",
  "online-reputationsmanagement": "maximilian-hoelzl",
};

/** Deterministische, sprachübergreifend stabile Zuordnung Artikel → Autor (via deutschem Slug). */
export function authorFor(deSlug) {
  const s = String(deSlug || "x");
  if (AUTHOR_OVERRIDES[s]) return AUTHORS[AUTHOR_OVERRIDES[s]];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return AUTHORS[KEYS[Math.abs(h) % KEYS.length]];
}

// DE liegt unter /autor/<slug>/, andere Sprachen unter /<lang>/autor/<slug>/.
export const authorPath = (a) => `/autor/${a.slug}/`;
export const authorPathFor = (a, lang) => (lang === "de" ? `/autor/${a.slug}/` : `/${lang}/autor/${a.slug}/`);
export const authorUrl = (a) => `${SITE_URL}/autor/${a.slug}`;
export const authorUrlFor = (a, lang) => `${SITE_URL}${lang === "de" ? "" : "/" + lang}/autor/${a.slug}`;

export const roleFor = (a, lang) => ROLE_I18N[lang] || ROLE_I18N.en;
export const bioFor = (a, lang) => (BIO_I18N[a.slug] && (BIO_I18N[a.slug][lang] || BIO_I18N[a.slug].en)) || "";

/** hreflang-Alternates (alle Sprachen + x-default → DE) für eine Autorenseite. */
export function authorHreflang(a) {
  const langs = Object.keys(ROLE_I18N);
  const m = {};
  for (const l of langs) m[l] = authorUrlFor(a, l);
  m["x-default"] = authorUrlFor(a, "de");
  return m;
}

/** Root-relative langUrls (mit Trailing-Slash) für den In-Page-Sprachumschalter. */
export function authorLangUrls(a) {
  const m = {};
  for (const l of Object.keys(ROLE_I18N)) m[l] = authorPathFor(a, l);
  return m;
}

/** Person-JSON-LD für Article.author (url zeigt auf die Autorenseite). */
export function authorPersonLd(a) {
  return { "@type": "Person", name: a.name, jobTitle: ROLE_I18N.de, image: `${SITE_URL}${a.image}`, url: authorUrl(a) };
}
