/** @type {import('next').NextConfig} */
import { BUILTIN_REDIRECTS } from "./src/lib/builtin-redirects.mjs";

// Only the GitHub-Pages workflow (GITHUB_PAGES=true) produces a fully static
// export served from the /RapidRemove/ subpath. Every other host — Railway
// production (Node server) and local dev — runs in server mode so that
// src/middleware.ts and redirects() work. The static-export options are
// assigned conditionally at runtime (not as an inline config literal) so the
// platform builder does not mis-detect this as a static-only site and try to
// serve a non-existent `out/` directory.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = { reactStrictMode: true };

if (isPages) {
  nextConfig.output = "export";
  nextConfig.basePath = basePath;
  nextConfig.assetPrefix = basePath ? `${basePath}/` : undefined;
  nextConfig.images = { unoptimized: true };
  nextConfig.trailingSlash = true;
} else {
  // Fest hinterlegte 301-Weiterleitungen (Single Source of Truth in
  // src/lib/builtin-redirects.mjs – dieselbe Liste zeigt das Admin-Portal
  // read-only an). Im statischen Export nicht unterstützt, daher nur hier.
  nextConfig.redirects = async () => BUILTIN_REDIRECTS;
}

export default nextConfig;
