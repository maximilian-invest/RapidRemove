/* RapidRemove — base-path helper.
   Empty at root (local dev / Vercel). On GitHub Pages the build injects
   NEXT_PUBLIC_BASE_PATH=/RapidRemove so <img> assets resolve under the subpath. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p) => `${BASE_PATH}${p}`;
