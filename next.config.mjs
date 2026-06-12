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
            { source: "/en/magazine", destination: "/en/magazin", permanent: true },
            { source: "/en/magazine/:path*", destination: "/en/magazin/:path*", permanent: true },
            { source: "/es/revista", destination: "/es/magazin", permanent: true },
            { source: "/es/revista/:path*", destination: "/es/magazin/:path*", permanent: true },
            { source: "/en/about", destination: "/en/about-us", permanent: true },
          ];
        },
      }),
};

export default nextConfig;
