/* Route: /autor/<slug> — Autorenprofil (DE), E-E-A-T: Bio + Person-JSON-LD + Artikel des Autors. */
import AuthorPage from "@/components/AuthorPage";
import { AUTHORS, authorUrl, authorPersonLd, roleFor, bioFor, authorHreflang } from "@/lib/authors";
import { SITE_URL } from "@/lib/article-google-profil";
import { articlesForAuthor } from "@/lib/articles/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const a = AUTHORS[params.slug];
  if (!a) return {};
  const url = authorUrl(a);
  return {
    title: `${a.name} — ${roleFor(a, "de")} · RapidRemove`,
    description: bioFor(a, "de"),
    alternates: { canonical: url, languages: authorHreflang(a) },
    openGraph: { type: "profile", title: a.name, description: bioFor(a, "de"), url, siteName: "RapidRemove", locale: "de_DE", images: [`${SITE_URL}${a.image}`] },
  };
}

export default function Page({ params }) {
  const a = AUTHORS[params.slug];
  const articles = articlesForAuthor("de", a.slug);
  const ld = { "@context": "https://schema.org", ...authorPersonLd(a), description: bioFor(a, "de"), worksFor: { "@type": "Organization", name: "RapidRemove", url: SITE_URL } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AuthorPage author={a} articles={articles} initialLang="de" />
    </>
  );
}
