/*
 * custTrack.ts — Dashboard-Aktivität der Kunden (Design-Handoff 9 „Dashboard-Aktivität").
 *
 * Tabelle customer_events: je Kunde (E-Mail) jede Aktion im Kunden-Dashboard —
 * Login (Passwort/Link), Seitenaufrufe, jeder Klick, Zahlung geöffnet/abgebrochen/bezahlt,
 * Software-Entscheidung, Sitzungsende (Dauer) und E-Mail-Öffnungen (Zählpixel in sendMail).
 * Gerät/Browser kommen aus dem User-Agent; die IP wird NICHT gespeichert (DSGVO).
 * Aufbewahrung: Einträge älter als 12 Monate werden beim Start gelöscht.
 *
 * Routen:
 *   POST /cust/track       { token, sid, events:[{type,target,meta,ts}] }  (Dashboard, Batch / Beacon)
 *   GET  /t/o/:k.gif       Zählpixel „E-Mail geöffnet"
 *   POST /admin/activity   { token, email, orderId } → Zusammenfassung + Timeline
 */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool } from "./db";

const SECRET = () => "ct|" + (process.env.ADMIN_TOKEN || "rr");
const norm = (e: unknown) => String(e || "").trim().toLowerCase().slice(0, 200);
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const TYPES = new Set(["login", "page_view", "click", "payment_open", "payment_abort", "payment_success", "software_accept", "software_decline", "form_progress", "logout", "session_end", "mail_open", "dash_open", "chat_open", "chat_message", "chat_ticket"]);

let ready = false;
export async function initCustTrack(): Promise<void> {
  if (!pool || ready) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS customer_events (
      id bigserial PRIMARY KEY,
      email text NOT NULL,
      order_id text,
      session_id text,
      type text NOT NULL,
      target text,
      meta jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS customer_events_email ON customer_events (email, created_at DESC)`);
  await pool.query(`DELETE FROM customer_events WHERE created_at < now() - interval '12 months'`).catch(() => {});
  ready = true;
}

/** Gerät + Browser aus dem User-Agent („iPhone · Safari"). */
export function deviceOf(ua: string): string {
  const u = String(ua || "");
  const dev = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? (/Mobile/.test(u) ? "Android" : "Android-Tablet")
    : /Macintosh|Mac OS X/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : /Linux/.test(u) ? "Linux" : "";
  const br = /Edg\//.test(u) ? "Edge" : /OPR\//.test(u) ? "Opera" : /SamsungBrowser/.test(u) ? "Samsung Internet" : /CriOS|Chrome\//.test(u) ? "Chrome"
    : /FxiOS|Firefox\//.test(u) ? "Firefox" : /Safari\//.test(u) ? "Safari" : "";
  return [dev, br].filter(Boolean).join(" · ");
}

/** Ein Ereignis protokollieren (best effort, wirft nie). */
export async function logCustEvent(email: string, type: string, target?: string | null, meta?: Record<string, unknown> | null, opts: { sid?: string; orderId?: string | null; at?: Date } = {}): Promise<void> {
  if (!pool || !email) return;
  try {
    await initCustTrack();
    await pool.query(
      `INSERT INTO customer_events (email, order_id, session_id, type, target, meta, created_at) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, now()))`,
      [norm(email), opts.orderId || null, opts.sid || null, type, target ? clip(target, 200) : null, meta ? JSON.stringify(meta).slice(0, 2000) : null, opts.at || null],
    );
  } catch { /* egal */ }
}

/* ---- Zählpixel für E-Mail-Öffnungen ---- */
const b64u = (s: string) => Buffer.from(s).toString("base64url");
const sign = (p: string) => crypto.createHmac("sha256", SECRET()).update(p).digest("base64url").slice(0, 16);
const OPS_PUBLIC = () => (process.env.OPS_PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN : "")).replace(/\/+$/, "");
const INTERNAL = () => [process.env.NOTIFY_TO, process.env.CONTACT_TO, process.env.MONITOR_ALERT_TO, process.env.MAIL_FROM, process.env.MAIL_REPLY_TO].map(norm).filter(Boolean);

/** Hängt (nur bei Kunden-Mails an genau eine Adresse) ein unsichtbares Zählpixel an. */
export function withOpenPixel(html: string, to: string | string[], subject: string): string {
  try {
    const base = OPS_PUBLIC();
    if (!base || !html || Array.isArray(to) && to.length !== 1) return html;
    const email = norm(Array.isArray(to) ? to[0] : to);
    if (!email || INTERNAL().includes(email) || /@rapid-remove\.com$/.test(email)) return html;
    const p = b64u(JSON.stringify({ e: email, s: clip(subject, 120), t: Date.now() }));
    const img = `<img src="${base}/t/o/${p}.${sign(p)}.gif" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0" />`;
    return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, img + "</body>") : html + img;
  } catch { return html; }
}
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

/* ---- Routen ---- */
export function registerCustTrack(app: FastifyInstance, deps: { sessionInfo: (t: unknown) => Promise<{ email: string; imp: boolean } | null>; adminOk: (t: unknown) => boolean }): void {
  void initCustTrack().catch(() => {});

  // Batch aus dem Dashboard (fetch keepalive / sendBeacon mit text/plain → JSON-String im Body).
  const hits = new Map<string, number[]>();
  app.post("/cust/track", async (req, reply) => {
    let b = (req.body || {}) as Record<string, unknown>;
    if (typeof req.body === "string") { try { b = JSON.parse(req.body as string); } catch { b = {}; } }
    const sess = await deps.sessionInfo(b.token);
    if (!sess) return reply.code(401).send({ ok: false });
    if (sess.imp) return { ok: true, ignored: true }; // Admin-Ansicht: nichts erfassen
    const email = sess.email;
    const now = Date.now(); const a = (hits.get(email) || []).filter((t) => now - t < 60_000);
    if (a.length > 60) return reply.code(429).send({ ok: false }); a.push(now); hits.set(email, a);
    const sid = clip(b.sid, 40);
    const ua = String(req.headers["user-agent"] || "");
    const list = (Array.isArray(b.events) ? b.events : []).slice(0, 100) as Record<string, unknown>[];
    for (const e of list) {
      const type = String(e.type || "");
      if (!TYPES.has(type)) continue;
      const ts = Number(e.ts); const at = Number.isFinite(ts) && Math.abs(now - ts) < 7 * 864e5 ? new Date(ts) : undefined;
      const meta = (e.meta && typeof e.meta === "object" ? { ...(e.meta as Record<string, unknown>) } : {}) as Record<string, unknown>;
      if (type === "dash_open" || type === "login") meta.device = deviceOf(ua);
      await logCustEvent(email, type, clip(e.target, 200) || null, Object.keys(meta).length ? meta : null, { sid, orderId: clip(e.orderId, 40) || null, at });
    }
    return { ok: true };
  });

  // Zählpixel: /t/o/<payload>.<sig>.gif → „E-Mail geöffnet" (je Mail + Stunde höchstens 1×)
  // Wildcard statt :k – der signierte Payload ist länger als Fastifys maxParamLength (100) → sonst 404.
  app.get("/t/o/*", async (req, reply) => {
    const k = String((req.params as Record<string, string>)["*"] || "").replace(/\.gif$/, "");
    const [p, s] = k.split(".");
    reply.header("Content-Type", "image/gif").header("Cache-Control", "no-store, max-age=0");
    if (p && s && sign(p) === s && pool) {
      try {
        const d = JSON.parse(Buffer.from(p, "base64url").toString()) as { e: string; s: string; t: number };
        if (d.e) {
          const dup = await pool.query(`SELECT 1 FROM customer_events WHERE email=$1 AND type='mail_open' AND target=$2 AND created_at > now() - interval '1 hour' LIMIT 1`, [norm(d.e), clip(d.s, 200)]).catch(() => ({ rows: [1] }));
          if (!dup.rows.length) await logCustEvent(d.e, "mail_open", d.s, { sentAt: d.t, device: deviceOf(String(req.headers["user-agent"] || "")) });
        }
      } catch { /* egal */ }
    }
    return reply.send(GIF);
  });

  // Admin: globaler Feed aller Kunden (Design-Handoff 11 „Aktivitäten").
  // { token, filter: all|login|payment|click, q, emails[], types[], cursor:"ts|id", limit }
  //  → { stats:{loginsToday, paymentAborts7d}, seen:[emails mit Login/Dashboard], items:[…], nextCursor }
  app.post("/admin/activity/feed", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!deps.adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "Keine Datenbank" });
    await initCustTrack();
    const FT: Record<string, string[]> = {
      login: ["login", "dash_open"],
      payment: ["payment_open", "payment_abort", "payment_success"],
      click: ["page_view", "click"],
    };
    const where: string[] = [];
    const args: unknown[] = [];
    const filter = String(b.filter || "all");
    if (FT[filter]) { args.push(FT[filter]); where.push(`type = ANY($${args.length})`); }
    const q = clip(b.q, 80).toLowerCase();
    if (q) {
      const or: string[] = [];
      args.push("%" + q.replace(/[%_\\]/g, (m) => "\\" + m) + "%");
      const p = `$${args.length}`;
      or.push(`email ILIKE ${p}`, `order_id ILIKE ${p}`, `target ILIKE ${p}`, `meta::text ILIKE ${p}`);
      const emails = (Array.isArray(b.emails) ? b.emails : []).slice(0, 300).map(norm).filter(Boolean);
      if (emails.length) { args.push(emails); or.push(`email = ANY($${args.length})`); }
      const types = (Array.isArray(b.types) ? b.types : []).map(String).filter((t) => TYPES.has(t));
      if (types.length) { args.push(types); or.push(`type = ANY($${args.length})`); }
      where.push("(" + or.join(" OR ") + ")");
    }
    const cur = String(b.cursor || "").split("|");
    if (cur.length === 2 && cur[0] && Number(cur[1])) {
      args.push(cur[0], Number(cur[1]));
      where.push(`(created_at, id) < ($${args.length - 1}::timestamptz, $${args.length})`);
    }
    const limit = Math.min(Math.max(Number(b.limit) || 50, 10), 200);
    args.push(limit + 1);
    const rows = (await pool.query(
      `SELECT id, email, order_id, type, target, meta, created_at FROM customer_events ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC, id DESC LIMIT $${args.length}`,
      args,
    )).rows as { id: string; email: string; order_id: string | null; type: string; target: string | null; meta: unknown; created_at: Date }[];
    const more = rows.length > limit;
    const list = rows.slice(0, limit);
    const last = list[list.length - 1];
    let stats = null; let seen: string[] | null = null;
    if (!b.cursor) {
      const s = await pool.query(`SELECT
          count(*) FILTER (WHERE type IN ('login','dash_open') AND created_at >= (date_trunc('day', now() AT TIME ZONE 'Europe/Vienna') AT TIME ZONE 'Europe/Vienna'))::int AS logins_today,
          count(*) FILTER (WHERE type = 'payment_abort' AND created_at > now() - interval '7 days')::int AS aborts
        FROM customer_events`);
      stats = { loginsToday: s.rows[0].logins_today, paymentAborts7d: s.rows[0].aborts };
      // „schon da gewesen": Ereignisse, Passwort-Login (last_login) oder eine echte (nicht-Admin-)Sitzung, z. B. per Login-Link
      const sv = await pool.query(`SELECT DISTINCT email FROM customer_events WHERE type IN ('login','dash_open','page_view','click')
        UNION SELECT email FROM cust_accounts WHERE last_login IS NOT NULL
        UNION SELECT email FROM cust_sessions WHERE NOT impersonation`).catch(() => pool!.query(`SELECT DISTINCT email FROM customer_events WHERE type IN ('login','dash_open','page_view','click')`));
      seen = sv.rows.map((r: { email: string }) => r.email);
    }
    return {
      ok: true, stats, seen,
      items: list.map((r) => ({ id: Number(r.id), email: r.email, orderId: r.order_id, type: r.type, target: r.target, meta: r.meta, ts: r.created_at })),
      nextCursor: more && last ? new Date(last.created_at).toISOString() + "|" + last.id : null,
    };
  });

  // Admin: Aktivität eines Kunden (über die E-Mail des Auftrags)
  app.post("/admin/activity", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!deps.adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "Keine Datenbank" });
    await initCustTrack();
    const email = norm(b.email);
    if (!email) return reply.code(400).send({ ok: false, error: "E-Mail fehlt" });
    const acc = await pool.query(`SELECT a.created_at, COALESCE(a.last_login, (SELECT max(created_at) FROM cust_sessions s WHERE s.email=a.email AND NOT s.impersonation)) AS last_login FROM cust_accounts a WHERE a.email=$1`, [email]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
    if (!acc.rows[0]) {
      const ss = await pool.query(`SELECT max(created_at) AS t FROM cust_sessions WHERE email=$1 AND NOT impersonation`, [email]).catch(() => ({ rows: [] as Record<string, unknown>[] }));
      if (ss.rows[0] && ss.rows[0].t) acc.rows.push({ created_at: null, last_login: ss.rows[0].t });
    }
    const ev = await pool.query(`SELECT id, order_id, session_id, type, target, meta, created_at FROM customer_events WHERE email=$1 ORDER BY created_at DESC LIMIT 500`, [email]);
    const cnt = await pool.query(`SELECT type, count(*)::int AS n, max(created_at) AS last FROM customer_events WHERE email=$1 GROUP BY type`, [email]);
    const by = Object.fromEntries(cnt.rows.map((r: { type: string; n: number; last: string }) => [r.type, r]));
    const logins = (by.login ? by.login.n : 0);
    const opens = (by.dash_open ? by.dash_open.n : 0);
    const clicks = (by.click ? by.click.n : 0) + (by.page_view ? by.page_view.n : 0);
    const seen = ev.rows.find((r: { type: string }) => r.type !== "mail_open");
    const lastAct = ev.rows.find((r: { type: string }) => !["logout", "session_end", "mail_open"].includes(r.type));
    return {
      ok: true,
      account: acc.rows[0] ? { createdAt: acc.rows[0].created_at, lastLogin: acc.rows[0].last_login } : null,
      loginCount: logins, openCount: opens, clickCount: clicks,
      lastSeenAt: seen ? seen.created_at : (acc.rows[0] && acc.rows[0].last_login) || null,
      lastAction: lastAct ? { type: lastAct.type, target: lastAct.target } : null,
      events: ev.rows.map((r: { id: string; order_id: string | null; session_id: string | null; type: string; target: string | null; meta: unknown; created_at: string }) => ({ id: Number(r.id), orderId: r.order_id, sid: r.session_id, type: r.type, target: r.target, meta: r.meta, ts: r.created_at })),
    };
  });
}
