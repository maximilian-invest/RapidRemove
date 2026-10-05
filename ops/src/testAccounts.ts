/* Test-Zugänge: Bestellungen mit diesen E-Mails landen nur im Test-Board (der Partner sieht nichts),
 * und ein Partner-Login mit diesen E-Mails sieht nur Testaufträge.
 * Inhaber-Adresse nur als SHA-256 (Repo ist öffentlich). Zusätzlich jede Adresse mit „+test"
 * und optional TEST_EMAILS (Komma-Liste) in der Umgebung. */
import crypto from "crypto";

const TEST_EMAIL_SHA = new Set([
  "101d9a7baf3732fb357fd1315c44cb0bf28e07b00d17fd83b880d6ef10746e4a", // Inhaber
]);
/** Passwort des Inhaber-Test-Logins (im Chat übergeben) – nur der scrypt-Hash. */
export const TEST_LOGIN_PW_HASH = "s1$854c77a82661705d281aef789c039413$72ba40190f5b2faf8d559d54254135af8a0b23e704602348d172201e2249d02e";

const norm = (e: unknown) => String(e || "").trim().toLowerCase();
export function isTestEmail(e: unknown): boolean {
  const s = norm(e);
  if (!s) return false;
  if (/\+test@/.test(s)) return true;
  if (TEST_EMAIL_SHA.has(crypto.createHash("sha256").update(s).digest("hex"))) return true;
  return String(process.env.TEST_EMAILS || "").split(",").map(norm).filter(Boolean).includes(s);
}
