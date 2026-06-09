/*
 * Microsoft 365 / Exchange Online E-Mail-Versand über Microsoft Graph (app-only).
 * Nutzt die bestehende Azure-App-Registrierung (Permission: Mail.Send).
 * Kein SDK – nur fetch (Node 20+).
 *
 * Wichtig: Zugangsdaten werden LAZY gelesen (erst beim Senden), damit der
 * Server auch ohne gesetzte Variablen startet (Vorschau braucht sie nicht).
 */
import "dotenv/config";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Umgebungsvariable ${name} fehlt (siehe .env.example)`);
  return v;
}

let cache: { token: string; exp: number } | null = null;

async function token(): Promise<string> {
  if (cache && cache.exp > Date.now() + 60_000) return cache.token;
  const tenant = req("M365_TENANT_ID");
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: req("M365_CLIENT_ID"),
      client_secret: req("M365_CLIENT_SECRET"),
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Graph-Token fehlgeschlagen (${res.status}): ${await res.text()}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  cache = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return j.access_token;
}

export interface MailAttachment {
  filename: string;
  /** Roh-Bytes (Buffer) oder String – wird für Graph base64-kodiert. */
  content: Buffer | string;
  contentType?: string;
}

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: MailAttachment[];
}

const addr = (e: string) => ({ emailAddress: { address: e } });

/** Versendet eine HTML-Mail über das angegebene (oder Standard-)Postfach. */
export async function sendMail(args: SendArgs): Promise<void> {
  const from = args.from || process.env.MAIL_FROM || "info@rapid-remove.com";
  const message: Record<string, unknown> = {
    subject: args.subject,
    body: { contentType: "HTML", content: args.html },
    toRecipients: (Array.isArray(args.to) ? args.to : [args.to]).map(addr),
  };
  if (args.cc?.length) message.ccRecipients = args.cc.map(addr);
  if (args.bcc?.length) message.bccRecipients = args.bcc.map(addr);
  const reply = args.replyTo || process.env.MAIL_REPLY_TO;
  if (reply) message.replyTo = [addr(reply)];
  if (args.attachments?.length) {
    message.attachments = args.attachments.map((a) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: a.filename,
      contentType: a.contentType || "application/octet-stream",
      contentBytes: (Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content)).toString("base64"),
    }));
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message, saveToSentItems: true }),
    },
  );
  if (!res.ok) throw new Error(`Graph sendMail fehlgeschlagen (${res.status}): ${await res.text()}`);
}
