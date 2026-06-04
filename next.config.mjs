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
    : {}),
};

export default nextConfig;
