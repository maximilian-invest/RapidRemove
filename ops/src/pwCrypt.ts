/* Passwörter zusätzlich verschlüsselt ablegen, damit der Admin sie jederzeit sehen kann
   (AES-256-GCM, Schlüssel aus ADMIN_TOKEN abgeleitet – liegt nur auf dem Server). Gleiches Verfahren wie partnerAuth.ts. */
import crypto from "node:crypto";

const keyOf = (scope: string) => crypto.createHash("sha256").update(scope + "|" + (process.env.ADMIN_TOKEN || "")).digest();
export function encPwScoped(scope: string, pw: string): string | null {
  if (!process.env.ADMIN_TOKEN) return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", keyOf(scope), iv);
  const data = Buffer.concat([c.update(pw, "utf8"), c.final()]);
  return [iv.toString("base64url"), c.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}
export function decPwScoped(scope: string, v: string | null | undefined): string | null {
  try {
    if (!v) return null;
    const [iv, tag, data] = v.split(".").map((x) => Buffer.from(x, "base64url"));
    const d = crypto.createDecipheriv("aes-256-gcm", keyOf(scope), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString("utf8");
  } catch { return null; }
}
