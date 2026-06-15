/*
 * Web-Push an die installierte Admin-App (PWA) – RFC 8291 via "web-push".
 * Benachrichtigung kommt von der App selbst → Tap öffnet die App (iOS 16.4+/Android).
 * Zugangsdaten LAZY aus der Umgebung:
 *   VAPID_PUBLIC_KEY   öffentlicher VAPID-Schlüssel (auch im Browser genutzt)
 *   VAPID_PRIVATE_KEY  privater VAPID-Schlüssel (NIEMALS ins Frontend/Repo)
 *   VAPID_SUBJECT      "mailto:helpdesk@rapid-remove.com" (optional)
 */
import webpush from "web-push";

let configured: boolean | null = null;
function init(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) { configured = false; return false; }
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:helpdesk@rapid-remove.com", pub, priv);
    configured = true;
  } catch { configured = false; }
  return configured;
}

export function hasWebPush(): boolean { return init(); }
export function vapidPublicKey(): string { return process.env.VAPID_PUBLIC_KEY || ""; }

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Sendet an alle Subscriptions. Gibt abgelaufene Endpunkte (404/410) zur Löschung zurück. */
export async function sendWebPushAll(subs: PushSub[], payload: { title: string; body: string; url?: string }): Promise<string[]> {
  if (!init() || !subs.length) return [];
  const data = JSON.stringify(payload);
  const expired: string[] = [];
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(s as unknown as webpush.PushSubscription, data);
    } catch (e: unknown) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) expired.push(s.endpoint);
    }
  }));
  return expired;
}
