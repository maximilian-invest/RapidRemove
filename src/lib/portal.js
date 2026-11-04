/* Kunden-Dashboard: neue Adresse portal.rapid-remove.com (dieselbe App wie /my-reviews).
 * Solange NEXT_PUBLIC_PORTAL_URL nicht gesetzt ist, bleibt alles wie bisher (/my-reviews auf www).
 * www.rapid-remove.com/my-reviews funktioniert auch danach unverändert weiter. */
export const PORTAL_URL = (process.env.NEXT_PUBLIC_PORTAL_URL || "").trim().replace(/\/+$/, "");

/* Link ins Dashboard, z. B. dashHref("/my-reviews?order=RR-1"). */
export function dashHref(path = "/my-reviews") {
  const p = path.startsWith("/") ? path : "/" + path;
  return PORTAL_URL ? PORTAL_URL + p : p;
}

/* Beschriftung des Login-Buttons in der Navigation. */
export const LOGIN_LABEL = { de: "Login", en: "Log in", es: "Acceder", fr: "Connexion", it: "Accedi", nl: "Inloggen", pt: "Entrar", ja: "ログイン", sv: "Logga in", da: "Log ind", no: "Logg inn" };
