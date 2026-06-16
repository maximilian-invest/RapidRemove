/** @type {import('next').NextConfig} */
import { BUILTIN_REDIRECTS } from "./src/lib/builtin-redirects.mjs";

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
        // Fest hinterlegte 301-Weiterleitungen (Single Source of Truth in
        // src/lib/builtin-redirects.mjs – dieselbe Liste zeigt das Admin-Portal
        // read-only an). Im statischen Export nicht unterstützt, daher nur hier.
        async redirects() {
          return BUILTIN_REDIRECTS;
        },
      }),
};

export default nextConfig;
