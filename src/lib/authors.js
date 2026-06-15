/* RapidRemove — Autorenprofile (E-E-A-T). Zwei Profile; jeder Artikel wird
   DETERMINISTISCH (Hash des deutschen Slugs) genau einem Autor zugeordnet, damit
   derselbe Artikel in ALLEN Sprachen denselben Autor zeigt. */
import { SITE_URL } from "@/lib/article-google-profil";

export const AUTHORS = {
  "maximilian-hoelzl": {
    slug: "maximilian-hoelzl",
    name: "Maximilian Hölzl",
    role: "Google-Experte & Gründer",
    roleEn: "Google Expert & Co-Founder",
    image: "/assets/maximilian-hoelzl.jpg",
    bio: "Mitgründer von RapidRemove und Google-Experte. Spezialisiert auf die dauerhafte Löschung von Google-Unternehmensprofilen und den Schutz der Online-Reputation von Unternehmen.",
    bioEn: "Co-founder of RapidRemove and Google expert, specialized in permanently deleting Google Business Profiles and protecting companies' online reputation.",
  },
  "matthias-lang": {
    slug: "matthias-lang",
    name: "Matthias Lang",
    role: "Google-Experte & Gründer",
    roleEn: "Google Expert & Co-Founder",
    image: "/assets/matthias-lang.webp",
    bio: "Mitgründer von RapidRemove und Google-Experte. Begleitet Unternehmen bei der Entfernung negativer Google-Einträge und -Bewertungen und beim Aufbau einer starken Online-Reputation.",
    bioEn: "Co-founder of RapidRemove and Google expert, helping companies remove negative Google listings and reviews and build a strong online reputation.",
  },
};

const KEYS = ["maximilian-hoelzl", "matthias-lang"];

/** Deterministische, sprachübergreifend stabile Zuordnung Artikel → Autor (via deutschem Slug). */
export function authorFor(deSlug) {
  const s = String(deSlug || "x");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return AUTHORS[KEYS[Math.abs(h) % KEYS.length]];
}

export const authorPath = (a) => `/autor/${a.slug}/`;
export const authorUrl = (a) => `${SITE_URL}/autor/${a.slug}`;
export const roleFor = (a, lang) => (lang === "de" ? a.role : a.roleEn);
export const bioFor = (a, lang) => (lang === "de" ? a.bio : a.bioEn);

/** Person-JSON-LD für Article.author (url zeigt auf die Autorenseite). */
export function authorPersonLd(a) {
  return { "@type": "Person", name: a.name, jobTitle: a.role, image: `${SITE_URL}${a.image}`, url: authorUrl(a) };
}
