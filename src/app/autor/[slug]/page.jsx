/* Route: /autor/<slug> — Autorenprofil (DE), E-E-A-T: Bio + Person-JSON-LD + Artikel des Autors. */
import AuthorPage from "@/components/AuthorPage";
import { AUTHORS, authorFor, authorUrl, authorPersonLd } from "@/lib/authors";
import { SITE_URL } from "@/lib/article-google-profil";
import { CLUSTER_CARDS } from "@/lib/articles/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const a = AUTHORS[params.slug];
  if (!a) return {};
  const url = authorUrl(a);
  return {
    title: `${a.name} — ${a.role} · RapidRemove`,
    description: a.bio,
    alternates: { canonical: url },
    openGraph: { type: "profile", title: a.name, description: a.bio, url, siteName: "RapidRemove", locale: "de_DE", images: [`${SITE_URL}${a.image}`] },
  };
}

// Hub + Cluster, gefiltert nach deterministischer Autor-Zuordnung.
function articlesForAuthor(a) {
  const HUB = { slug: "google-unternehmensprofil-loeschen", title: "Google-Unternehmensprofil löschen lassen", href: "/google-unternehmensprofil-loeschen/" };
  const all = [HUB, ...CLUSTER_CARDS.map((c) => ({ slug: c.slug, title: c.title, href: `/${c.slug}/` }))];
  return all.filter((art) => authorFor(art.slug).slug === a.slug);
}

export default function Page({ params }) {
  const a = AUTHORS[params.slug];
  const articles = articlesForAuthor(a);
  const ld = { "@context": "https://schema.org", ...authorPersonLd(a), description: a.bio, worksFor: { "@type": "Organization", name: "RapidRemove", url: SITE_URL } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <AuthorPage author={a} articles={articles} />
    </>
  );
}
