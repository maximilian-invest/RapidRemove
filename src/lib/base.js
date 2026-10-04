/* RapidRemove — base-path helper.
   Empty at root (local dev / Vercel). On GitHub Pages the build injects
   NEXT_PUBLIC_BASE_PATH=/RapidRemove so <img> assets resolve under the subpath. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
/** Interne Links ohne Schrägstrich am Ende (Live-Server leitet /pfad/ per 308 auf
 *  /pfad um → Ahrefs „Page has links to redirect"). Nur im Server-Betrieb; der
 *  GitHub-Pages-Export (trailingSlash: true) behält den Schrägstrich. */
export const cleanHref = (p) => {
  if (BASE_PATH || typeof p !== "string") return p;
  return p.replace(/^(\/[^?#]*?[^/?#])\/+(?=[?#]|$)/, "$1");
};
export const asset = (p) => `${BASE_PATH}${cleanHref(p)}`;
