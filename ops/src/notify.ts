/*
 * Team-Benachrichtigungen (Push) an EINER Stelle gebündelt:
 *   – Web-Push an alle abonnierten Browser (VAPID) + Server-Push (push.ts).
 * Best effort: wirft nie, damit eine fehlgeschlagene Push nie einen
 * Webhook/Worker/Request kippt.
 */
import { hasWebPush, sendWebPushAll } from "./integrations/webpush";
import { sendPush } from "./integrations/push";
import { dbReady, listPushSubscriptions, deletePushSubscription } from "./db";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");

/** Schickt eine Team-Benachrichtigung an ALLE Kanäle. Best effort. */
export async function notifyTeam(title: string, body: string, url?: string): Promise<void> {
  try {
    if (hasWebPush() && dbReady()) {
      const subs = await listPushSubscriptions();
      if (subs.length) {
        const expired = await sendWebPushAll(subs, { title, body, url });
        for (const ep of expired) await deletePushSubscription(ep).catch(() => {});
      }
    }
  } catch { /* ignore */ }
  try { await sendPush(title, body, url); } catch { /* ignore */ }
}

/** Geldbetrag (Major Units, z. B. 474.9) lesbar formatieren. */
export function fmtMoney(amount?: number | null, cur?: string | null): string {
  if (!amount) return "";
  const c = String(cur || "eur").toLowerCase();
  return c === "usd"
    ? `$${amount.toLocaleString("en-US")}`
    : `${amount.toLocaleString("de-DE", { minimumFractionDigits: amount % 1 ? 2 : 0 })} €`;
}

/** Push „💰 Zahlung eingegangen" fürs Team (Kunde + Betrag + Link zum Auftrag). */
export async function notifyPaymentReceived(opts: { who?: string | null; amount?: number | null; cur?: string | null; orderId?: string | null }): Promise<void> {
  const money = fmtMoney(opts.amount, opts.cur);
  const who = (opts.who || "").trim();
  const body = [who, money].filter(Boolean).join(" · ") || "Eine Zahlung ist eingegangen";
  const url = SITE_URL + "/admin" + (opts.orderId ? "?order=" + encodeURIComponent(String(opts.orderId)) : "");
  await notifyTeam("💰 Zahlung eingegangen 🎉", body, url);
}
