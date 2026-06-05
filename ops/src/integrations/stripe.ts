/*
 * Stripe-Anbindung – ohne SDK, nur fetch + node:crypto (wie mailer.ts).
 * Zugangsdaten werden LAZY gelesen, damit der Server auch ohne Stripe-Vars
 * startet (Vorschau/Health brauchen sie nicht).
 *
 *   STRIPE_SECRET_KEY     sk_live_… (Dashboard → Entwickler → API-Schlüssel)
 *   STRIPE_WEBHOOK_SECRET whsec_…   (beim Anlegen des Webhook-Endpoints)
 */
import crypto from "node:crypto";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Umgebungsvariable ${name} fehlt (siehe .env.example)`);
  return v;
}

export function hasSecretKey(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

/** Minimaler Stripe-API-Aufruf (GET) – z. B. Customer/PaymentIntent nachladen. */
export async function stripeGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path.replace(/^\//, "")}`, {
    headers: { Authorization: `Bearer ${req("STRIPE_SECRET_KEY")}`, "Stripe-Version": "2024-06-20" },
  });
  if (!res.ok) throw new Error(`Stripe GET ${path} fehlgeschlagen (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

export interface StripeCustomer {
  id: string;
  email?: string | null;
  name?: string | null;
  preferred_locales?: string[] | null;
}

export async function retrieveCustomer(id: string): Promise<StripeCustomer> {
  return stripeGet<StripeCustomer>(`customers/${id}`);
}

/* ── Webhook-Signaturprüfung (Stripe-Schema „t=…,v1=…“) ───────────────── */

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export interface VerifyResult {
  ok: boolean;
  event?: any;
  reason?: string;
}

/**
 * Prüft die `Stripe-Signature` gegen den RAW-Body und liefert das Event zurück.
 * @param payload   exakter Roh-Body (String/Buffer), NICHT der geparste JSON.
 * @param header    Wert des `Stripe-Signature`-Headers.
 * @param secret    Webhook-Signing-Secret (whsec_…).
 * @param toleranceSec  maximale Abweichung des Zeitstempels (Default 300 s).
 */
export function verifyStripeSignature(
  payload: string | Buffer,
  header: string | undefined,
  secret: string,
  toleranceSec = 300,
): VerifyResult {
  if (!header) return { ok: false, reason: "kein Stripe-Signature-Header" };
  const body = typeof payload === "string" ? payload : payload.toString("utf8");

  const parts: Record<string, string[]> = {};
  for (const kv of header.split(",")) {
    const i = kv.indexOf("=");
    if (i === -1) continue;
    const k = kv.slice(0, i).trim();
    const v = kv.slice(i + 1).trim();
    (parts[k] ||= []).push(v);
  }
  const t = parts.t?.[0];
  const sigs = parts.v1 ?? [];
  if (!t || sigs.length === 0) return { ok: false, reason: "Signaturformat ungültig" };

  const expected = crypto.createHmac("sha256", secret).update(`${t}.${body}`, "utf8").digest("hex");
  if (!sigs.some((s) => timingSafeEqualHex(s, expected))) {
    return { ok: false, reason: "Signatur stimmt nicht" };
  }
  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (Number.isFinite(toleranceSec) && ageSec > toleranceSec) {
    return { ok: false, reason: `Zeitstempel zu alt (${ageSec}s)` };
  }
  try {
    return { ok: true, event: JSON.parse(body) };
  } catch {
    return { ok: false, reason: "Body ist kein gültiges JSON" };
  }
}

/** "de…" → "de", sonst "en" (für preferred_locales/Currency-Heuristik). */
export function langFromLocale(locale?: string | null): "de" | "en" {
  return (locale || "").toLowerCase().startsWith("de") ? "de" : "en";
}
