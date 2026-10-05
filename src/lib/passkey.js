"use client";
/* Face ID / Touch ID / Fingerabdruck (Passkeys) für Kunden-Dashboard und Partner-App.
   role = "customer" | "partner". Backend: ops /passkey/*. */
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const FLAG = (role) => "rr_pk_" + role;

async function post(path, body) {
  const res = await fetch(OPS + "/passkey/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) { const e = new Error(j.error || "HTTP " + res.status); e.code = j.error; throw e; }
  return j;
}

export const passkeySupported = () => typeof window !== "undefined" && !!window.PublicKeyCredential && !!OPS;
/** Wie das Gerät es nennt: Face ID (iPhone/iPad), Touch ID (Mac), Fingerprint (Android), sonst Passkey. */
export function passkeyName() {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "Face ID";
  if (/Macintosh/i.test(ua) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1) return "Face ID";
  if (/Macintosh/i.test(ua)) return "Touch ID";
  if (/Android/i.test(ua)) return "fingerprint";
  return "passkey";
}
export const passkeyOnDevice = (role) => { try { return localStorage.getItem(FLAG(role)) === "1"; } catch (e) { return false; } };
export const passkeyDismissed = (role) => { try { return localStorage.getItem(FLAG(role) + "_no") === "1"; } catch (e) { return false; } };
export const dismissPasskey = (role) => { try { localStorage.setItem(FLAG(role) + "_no", "1"); } catch (e) { /* */ } };

/** Nach dem Login: Passkey für diese Sitzung anlegen (öffnet Face ID / Touch ID). */
export async function passkeyRegister(role, token) {
  const o = await post("register-options", { role, token });
  const response = await startRegistration({ optionsJSON: o.options });
  await post("register-verify", { role, token, cid: o.cid, response });
  try { localStorage.setItem(FLAG(role), "1"); } catch (e) { /* */ }
  return true;
}
/** Login per Face ID / Touch ID → Sitzungs-Token wie beim Passwort-Login. */
export async function passkeyLogin(role) {
  const o = await post("login-options", { role });
  const response = await startAuthentication({ optionsJSON: o.options });
  const r = await post("login-verify", { role, cid: o.cid, response });
  try { localStorage.setItem(FLAG(role), "1"); } catch (e) { /* */ }
  return r.token;
}
/** Fehlermeldung (Abbruch durch den Nutzer → keine Meldung). */
export function passkeyError(e, T) {
  const n = e && (e.name || "");
  if (n === "NotAllowedError" || n === "AbortError") return "";
  if (e && e.code === "unknown_passkey") return T ? T("pkErrUnknown") : "This passkey isn't linked to an account anymore – please log in with your password.";
  return T ? T("pkErr") : "That didn't work – please log in with your password.";
}
