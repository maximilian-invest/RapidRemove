/** @type {import('next').NextConfig} */

// When building for GitHub Pages we produce a fully static export served from
// the /RapidRemove/ subpath. Local dev and other hosts (e.g. Vercel) stay at root.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath ? `${basePath}/` : undefined,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {
        // Häufig erratene englisch-/spanischsprachige Pfade auf die echten Routen
        // umleiten statt 404. (Im statischen Export nicht unterstützt, daher nur hier.)
        async redirects() {
          return [
            // Magazin: alte deutsche Slugs (/<lang>/magazin) → neue lokalisierte Slugs (301).
            { source: "/en/magazin", destination: "/en/magazine", permanent: true },
            { source: "/es/magazin", destination: "/es/revista", permanent: true },
            { source: "/fr/magazin", destination: "/fr/magazine", permanent: true },
            { source: "/it/magazin", destination: "/it/rivista", permanent: true },
            { source: "/nl/magazin", destination: "/nl/magazine", permanent: true },
            { source: "/pt/magazin", destination: "/pt/revista", permanent: true },
            { source: "/ja/magazin", destination: "/ja/magazine", permanent: true },
            { source: "/sv/magazin", destination: "/sv/magasin", permanent: true },
            { source: "/da/magazin", destination: "/da/magasin", permanent: true },
            { source: "/no/magazin", destination: "/no/magasin", permanent: true },
            { source: "/en/about", destination: "/en/about-us", permanent: true },
            // 301 von den alten (backlink-starken) Blog-URLs auf die neuen Hub-Artikel (SEO-Migration).
            { source: "/how-to-remove-google-business-profile", destination: "/en/delete-google-business-profile", permanent: true },
            { source: "/google-unternehmensprofil-loeschen-wie-geht-das", destination: "/magazin/google-unternehmensprofil-loeschen", permanent: true },
          ];
        },
      }),
};

export default nextConfig;
