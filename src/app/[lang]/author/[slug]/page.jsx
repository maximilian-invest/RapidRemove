/* Route: /<lang>/author/<slug> — Autorenprofil in den übrigen Sprachen (E-E-A-T).
   DE liegt unter /autor/<slug>; dieselbe Seite, lokalisiert (Bio/Rolle/Artikel). */
import AuthorPage from "@/components/AuthorPage";
import { AUTHORS, authorUrlFor, authorPersonLd, roleFor, bioFor, authorHreflang } from "@/lib/authors";
import { SITE_URL } from "@/lib/article-google-profil";
import { articlesForAuthor } from "@/lib/articles/catalog";
import { LOCALES, OG_LOCALE } from "@/lib/locales-meta";

export const dynamicParams = false;

export function generateStaticParams() {
  const out = [];
  for (const lang of LOCALES) {
    if (lang === "de") continue; // DE liegt unter /autor/<slug>
    for (const slug of Object.keys(AUTHORS)) out.push({ lang, slug });
  }
  return out;
}

export function generateMetadata({ params }) {
  const { lang, slug } = params;
  const a = AUTHORS[slug];
  if (!a) return {};
  const url = authorUrlFor(a, lang);
  return {
    title: `${a.name} — ${roleFor(a, lang)} · RapidRemove`,
    description: bioFor(a, lang),
    alternates: { canonical: url, languages: authorHreflang(a) },
    openGraph: { type: "profile", title: a.name, description: bioFor(a, lang), url, siteName: "RapidRemove", locale: OG_LOCALE[lang] || "en_US", images: [`${SITE_URL}${a.image}`] },
  };
}

export default function Page({ params }) {
  const { lang, slug } = params;
  const a = AUTHORS[slug];
  const articles = articlesForAuthor(lang, a.slug);
  const ld = { "@context": "https://schema.org", ...authorPersonLd(a), description: bioFor(a, lang), worksFor: { "@type": "Organization", name: "RapidRemove", url: SITE_URL } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AuthorPage author={a} articles={articles} initialLang={lang} />
    </>
  );
}
