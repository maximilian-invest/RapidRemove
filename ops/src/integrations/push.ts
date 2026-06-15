/*
 * Push-Benachrichtigung aufs Handy bei neuen Bestellungen – opt-in per Env.
 * Es genügt EINER der folgenden Dienste (beide werden bedient, wenn gesetzt):
 *
 *   ntfy.sh (kostenlos, ohne Konto):
 *     NTFY_TOPIC=<geheimer-topic-name>      App "ntfy" installieren → Topic abonnieren
 *     NTFY_SERVER=https://ntfy.sh           (optional, Standard ntfy.sh)
 *     NTFY_TOKEN=tk_…                       (optional, nur bei geschütztem Topic)
 *
 *   Pushover (App einmalig ~5 €, sehr zuverlässig):
 *     PUSHOVER_TOKEN=<app-api-token>
 *     PUSHOVER_USER=<user-key>
 *
 * Kein Dienst gesetzt → no-op (Backend läuft normal weiter).
 */

export function hasPush(): boolean {
  return !!(process.env.NTFY_TOPIC || (process.env.PUSHOVER_TOKEN && process.env.PUSHOVER_USER));
}

// ntfy-Header dürfen nur ASCII enthalten – Nicht-ASCII (Umlaute etc.) entfernen.
const ascii = (s: string) => s.replace(/[^\x20-\x7E]/g, "").trim() || "RapidRemove";

/** Sendet eine Push-Nachricht an alle konfigurierten Dienste. Best-effort, wirft nicht. */
export async function sendPush(title: string, message: string, url?: string): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (process.env.NTFY_TOPIC) {
    const server = (process.env.NTFY_SERVER || "https://ntfy.sh").replace(/\/+$/, "");
    const headers: Record<string, string> = { Title: ascii(title), Priority: "high", Tags: "package" };
    if (url) headers.Click = url;
    if (process.env.NTFY_TOKEN) headers.Authorization = `Bearer ${process.env.NTFY_TOKEN}`;
    tasks.push(fetch(`${server}/${encodeURIComponent(process.env.NTFY_TOPIC)}`, { method: "POST", headers, body: message }));
  }

  if (process.env.PUSHOVER_TOKEN && process.env.PUSHOVER_USER) {
    const form = new URLSearchParams({
      token: process.env.PUSHOVER_TOKEN, user: process.env.PUSHOVER_USER,
      title, message, priority: "1",
    });
    if (url) form.set("url", url);
    tasks.push(fetch("https://api.pushover.net/1/messages.json", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString(),
    }));
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((r) => { if (r.status === "rejected") console.warn("Push fehlgeschlagen:", r.reason); });
}
