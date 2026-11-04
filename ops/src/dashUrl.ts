/* Adresse des Kunden-Dashboards.
 *
 * Bisher: www.rapid-remove.com/my-reviews. Neu: portal.rapid-remove.com (dieselbe App).
 * Solange PORTAL_URL nicht gesetzt ist, bleibt alles wie bisher – erst wenn die Domain
 * bei Railway läuft, PORTAL_URL=https://portal.rapid-remove.com im ops-Service setzen.
 * Dann gehen alle NEUEN Links (Mails, Login-Links, Passwort-Reset, Admin „Als Kunde öffnen")
 * aufs Portal. www.rapid-remove.com/my-reviews funktioniert unverändert weiter
 * (alte Links, gespeicherte Logins, App am Home-Bildschirm, Push). */
const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
export const PORTAL_URL = (process.env.PORTAL_URL || "").trim().replace(/\/+$/, "");

export const DASH_URL = PORTAL_URL ? `${PORTAL_URL}/my-reviews` : `${SITE_URL}/my-reviews`;

/* Wie die Adresse in Mail-Texten steht („Später einfach … öffnen"). */
export const DASH_HOST = PORTAL_URL ? PORTAL_URL.replace(/^https?:\/\//, "") : "rapid-remove.com/my-reviews";

/* Gehört eine Rückkehr-Adresse (z. B. Stripe success_url) zum Dashboard? */
export function isDashReturnUrl(u: string): boolean {
  const s = String(u || "");
  return s.startsWith(SITE_URL) || (!!PORTAL_URL && s.startsWith(PORTAL_URL)) || /^http:\/\/localhost:\d+\//.test(s);
}
