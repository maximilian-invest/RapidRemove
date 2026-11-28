/*
 * campaign.tsx — Aktions-Mails in Chargen (28.11.2026, Maximilian: „in Chargen, immer 25 alle paar Stunden“).
 *
 * Je Empfänger wird ein persönliches Fixpreis-Angebot (offers-Tabelle, RR-A-…) mit Aktionsrabatt angelegt.
 * Der Link führt wie beim schriftlichen Angebot an die Kasse; der Bestellprozess übernimmt den Angebotspreis
 * (server.ts → offerForOrder, nie teurer als der Listenpreis). Die Mails liegen in campaign_mails und werden
 * gedrosselt verschickt: höchstens CAMPAIGN_BATCH (Standard 25) je Charge, Chargen-Abstand je Eintrag (send_after).
 * Jede Mail hat einen Abmeldelink (/c/unsub) – abgemeldete Adressen bekommen keine weiteren Aktions-Mails.
 *
 * Routen:
 *   POST /admin/campaign/create  { token, campaign, items:[{ email, lang, profile, placeId, country, category, checkId, pct, segment, sendAfter }] }
 *   POST /admin/campaign/status  { token, campaign? }
 *   POST /admin/campaign/cancel  { token, campaign }   offene (noch nicht gesendete) Mails stoppen
 *   GET  /c/unsub?e=&t=          Abmelden (öffentlich, HMAC-gesichert)
 */
import crypto from "node:crypto";
import * as React from "react";
import type { FastifyInstance } from "fastify";
import { render } from "@react-email/render";
import { pool } from "./db";
import { sendMail } from "./mailer";
import { notifyTeam } from "./notify";
import { resolveTier } from "./priceTier";
import { profilePriceFor } from "./reviewsPricing";
import { initOffers, offerUrl } from "./offers";
import { EmailShell, P, CtaButton, Support, type MailLang } from "./emails/components";

const OPS_PUBLIC = () => (process.env.OPS_PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN : "")).replace(/\/+$/, "");
const VALID_DAYS = 14;
const BATCH = () => Math.max(1, Math.min(100, Number(process.env.CAMPAIGN_BATCH) || 25));
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const isEmail = (e: string) => /^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,24}$/.test(e);
const secret = () => process.env.CAMPAIGN_SECRET || process.env.ADMIN_TOKEN || "rr-campaign";
const sig = (email: string) => crypto.createHmac("sha256", secret()).update(email.toLowerCase()).digest("hex").slice(0, 32);
const unsubUrl = (email: string) => `${OPS_PUBLIC()}/c/unsub?e=${encodeURIComponent(email)}&t=${sig(email)}`;

let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await initOffers();
  await pool.query(`CREATE TABLE IF NOT EXISTS campaign_mails (
    id serial PRIMARY KEY, campaign text NOT NULL, email text NOT NULL, lang text, segment text, profile text,
    offer_id text, pct int, amount numeric, cur text, subject text, html text,
    send_after timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, error text, tries int NOT NULL DEFAULT 0,
    canceled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (campaign, email))`);
  await pool.query(`CREATE TABLE IF NOT EXISTS campaign_unsub (email text PRIMARY KEY, at timestamptz NOT NULL DEFAULT now())`);
  ready = true;
}

type Lang = "de" | "en" | "fr";
const L = (l: string): Lang => (l === "de" || l === "fr" ? l : "en");
const money = (n: number, cur: string, lang: Lang) =>
  new Intl.NumberFormat(lang === "de" ? "de-AT" : lang === "fr" ? "fr-FR" : "en-GB", { style: "currency", currency: cur.toUpperCase(), maximumFractionDigits: 0 }).format(n);
const dateStr = (d: Date, lang: Lang) => d.toLocaleDateString(lang === "de" ? "de-AT" : lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

type Seg = "A" | "C" | "D";
const COPY: Record<Lang, {
  subject: (p: string, pct: number, seg: Seg) => string; title: (pct: number) => string; hello: string;
  intro: (p: string, seg: Seg) => string; offer: (pct: number, list: string, price: string, until: string) => string;
  how: string; cta: string; owner: string; vat: string; unsub: string;
}> = {
  de: {
    subject: (p, pct, s) => s === "A" ? `Ihr Google-Profil „${p}“ ist wieder online – ${pct} % Rabatt` : `${pct} % Rabatt auf die Löschung von „${p}“`,
    title: (pct) => `${pct} % Rabatt für Sie`,
    hello: "Guten Tag,",
    intro: (p, s) => s === "A"
      ? `uns ist aufgefallen, dass das Google Business Profil „${p}“ wieder bei Google Maps zu sehen ist. Als bestehender Kunde bekommen Sie die erneute Löschung zum Vorzugspreis.`
      : s === "C"
        ? `Sie hatten bei uns ein Angebot für die Löschung des Google Business Profils „${p}“ angefordert. Damit die Entscheidung leichter fällt, haben wir den Preis für Sie gesenkt.`
        : `für das Google Business Profil „${p}“ wurde bei uns eine kostenlose Prüfung durchgeführt – die Löschung ist möglich. Für kurze Zeit bekommen Sie sie zum Aktionspreis.`,
    offer: (pct, list, price, until) => `Ihr persönlicher Preis: ${price} statt ${list} (−${pct} %). Das Angebot gilt bis ${until}.`,
    how: "Sie zahlen erst, wenn das Profil gelöscht ist. Die Löschung dauert in der Regel rund 24 Stunden.",
    cta: "Angebot ansehen & beauftragen",
    owner: "Wir löschen Profile nur im Auftrag der Inhaberin bzw. des Inhabers oder der Geschäftsführung.",
    vat: "Preise zzgl. USt.",
    unsub: "Sie möchten keine solchen Angebote mehr? Hier abmelden",
  },
  en: {
    subject: (p, pct, s) => s === "A" ? `Your Google profile “${p}” is back online – ${pct}% off` : `${pct}% off removing “${p}”`,
    title: (pct) => `${pct}% off for you`,
    hello: "Hello,",
    intro: (p, s) => s === "A"
      ? `we noticed that the Google Business Profile “${p}” is visible on Google Maps again. As an existing customer, you get the removal again at a preferred price.`
      : s === "C"
        ? `you requested a quote from us for removing the Google Business Profile “${p}”. To make the decision easier, we have lowered the price for you.`
        : `a free check was run with us for the Google Business Profile “${p}” – removal is possible. For a short time, you can get it at a special price.`,
    offer: (pct, list, price, until) => `Your personal price: ${price} instead of ${list} (−${pct}%). The offer is valid until ${until}.`,
    how: "You only pay once the profile has been removed. Removal usually takes around 24 hours.",
    cta: "View offer & order",
    owner: "We only remove profiles on behalf of the business owner or management.",
    vat: "Prices excl. VAT.",
    unsub: "Don’t want offers like this? Unsubscribe",
  },
  fr: {
    subject: (p, pct, s) => s === "A" ? `Votre fiche Google « ${p} » est de nouveau en ligne – ${pct} % de remise` : `${pct} % de remise sur la suppression de « ${p} »`,
    title: (pct) => `${pct} % de remise pour vous`,
    hello: "Bonjour,",
    intro: (p, s) => s === "A"
      ? `nous avons remarqué que la fiche Google Business « ${p} » est de nouveau visible sur Google Maps. En tant que client, vous bénéficiez d’un tarif préférentiel pour une nouvelle suppression.`
      : s === "C"
        ? `vous nous aviez demandé un devis pour la suppression de la fiche Google Business « ${p} ». Pour faciliter votre décision, nous avons baissé le prix pour vous.`
        : `une vérification gratuite a été effectuée chez nous pour la fiche Google Business « ${p} » – la suppression est possible. Pour une durée limitée, elle vous est proposée à prix réduit.`,
    offer: (pct, list, price, until) => `Votre prix personnel : ${price} au lieu de ${list} (−${pct} %). Offre valable jusqu’au ${until}.`,
    how: "Vous ne payez qu’une fois la fiche supprimée. La suppression prend en général environ 24 heures.",
    cta: "Voir l’offre et commander",
    owner: "Nous supprimons des fiches uniquement pour le compte du propriétaire ou de la direction de l’entreprise.",
    vat: "Prix HT.",
    unsub: "Vous ne souhaitez plus recevoir ce type d’offre ? Se désabonner",
  },
};

async function mailHtml(a: { lang: Lang; seg: Seg; profile: string; pct: number; list: number; price: number; cur: string; until: Date; url: string; email: string }): Promise<{ subject: string; html: string }> {
  const c = COPY[a.lang];
  const el = (
    <EmailShell lang={a.lang as MailLang} preview={c.offer(a.pct, money(a.list, a.cur, a.lang), money(a.price, a.cur, a.lang), dateStr(a.until, a.lang))} title={c.title(a.pct)}>
      <P>{c.hello}</P>
      <P>{c.intro(a.profile, a.seg)}</P>
      <P><strong>{c.offer(a.pct, money(a.list, a.cur, a.lang), money(a.price, a.cur, a.lang), dateStr(a.until, a.lang))}</strong></P>
      <P>{c.how}</P>
      <CtaButton href={a.url} variant="pay">{c.cta}</CtaButton>
      <div style={{ height: 14 }} />
      <P muted>{c.owner} {c.vat}</P>
      <Support lang={a.lang as MailLang} />
      <P muted><a href={unsubUrl(a.email)} style={{ color: "#6b6b6b" }}>{c.unsub}</a></P>
    </EmailShell>
  );
  return { subject: c.subject(a.profile, a.pct, a.seg), html: await render(el) };
}

export function registerCampaign(app: FastifyInstance, adminOk: (t: unknown) => boolean): void {
  app.post("/admin/campaign/create", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "db" });
    await init();
    const campaign = clip(b.campaign, 60);
    if (!campaign) return reply.code(400).send({ ok: false, error: "campaign" });
    const items = Array.isArray(b.items) ? (b.items as Record<string, unknown>[]).slice(0, 500) : [];
    const out: { email: string; ok: boolean; offerId?: string; amount?: number; cur?: string; error?: string }[] = [];
    for (const it of items) {
      const email = clip(it.email, 200).toLowerCase();
      try {
        if (!isEmail(email)) throw new Error("email");
        const un = await pool.query(`SELECT 1 FROM campaign_unsub WHERE email=$1`, [email]);
        if (un.rowCount) throw new Error("abgemeldet");
        const dup = await pool.query(`SELECT 1 FROM campaign_mails WHERE campaign=$1 AND email=$2`, [campaign, email]);
        if (dup.rowCount) throw new Error("schon in der Aktion");
        const lang = L(clip(it.lang, 5));
        const seg: Seg = it.segment === "A" ? "A" : it.segment === "C" ? "C" : "D";
        const profile = clip(it.profile, 200);
        const placeId = clip(it.placeId, 120);
        const country = (clip(it.country, 6) || "DE").toUpperCase();
        const pct = Math.max(1, Math.min(30, Math.round(Number(it.pct) || 0)));
        if (!profile) throw new Error("profile");
        const tier = await resolveTier({ email, placeId, category: it.category, country }).catch(() => null);
        const cur = country === "US" ? "usd" : "eur";
        const prem = !!tier && tier.prem && !tier.legacy;
        const list = profilePriceFor("remove", cur, prem);
        const price = Math.round(list * (100 - pct) / 100);
        const n = await pool.query(`SELECT nextval('offer_seq') AS n`);
        const id = "RR-A-" + n.rows[0].n;
        const token = crypto.randomBytes(16).toString("hex");
        const until = new Date(Date.now() + VALID_DAYS * 86400_000);
        await pool.query(
          `INSERT INTO offers (id, token, valid_until, check_id, place_id, profile, category, addr, country, lang, email, reminders, service, amount, cur, prem, source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false,'remove',$12,$13,$14,$15)`,
          [id, token, until, clip(it.checkId, 40) || null, placeId || null, profile, clip(it.category, 120) || null, null, country, lang, email, price, cur, prem, ("aktion:" + campaign).slice(0, 40)],
        );
        const m = await mailHtml({ lang, seg, profile, pct, list, price, cur, until, url: offerUrl({ id, token }), email });
        const sendAfter = it.sendAfter ? new Date(String(it.sendAfter)) : new Date();
        await pool.query(
          `INSERT INTO campaign_mails (campaign, email, lang, segment, profile, offer_id, pct, amount, cur, subject, html, send_after) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [campaign, email, lang, seg, profile, id, pct, price, cur, m.subject, m.html, isNaN(sendAfter.getTime()) ? new Date() : sendAfter],
        );
        out.push({ email, ok: true, offerId: id, amount: price, cur });
      } catch (e) {
        out.push({ email, ok: false, error: (e as Error).message });
      }
    }
    return { ok: true, created: out.filter((x) => x.ok).length, items: out };
  });

  app.post("/admin/campaign/preview", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    const lang = L(clip(b.lang, 5));
    const seg: Seg = b.segment === "A" ? "A" : b.segment === "C" ? "C" : "D";
    const m = await mailHtml({ lang, seg, profile: clip(b.profile, 200) || "Musterfirma GmbH", pct: Math.round(Number(b.pct) || 15), list: 495, price: Math.round(495 * (100 - (Number(b.pct) || 15)) / 100), cur: "eur", until: new Date(Date.now() + VALID_DAYS * 86400_000), url: "https://www.rapid-remove.com/angebot?id=RR-A-0&t=preview", email: "preview@example.com" });
    return { ok: true, subject: m.subject, html: m.html };
  });

  app.post("/admin/campaign/status", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "db" });
    await init();
    const c = clip(b.campaign, 60);
    const r = await pool.query(
      `SELECT m.campaign, m.email, m.segment, m.profile, m.offer_id, m.pct, m.amount, m.cur, m.send_after, m.sent_at, m.error, m.canceled,
              o.opened_at, o.clicked_at, o.status AS offer_status, o.order_id
         FROM campaign_mails m LEFT JOIN offers o ON o.id = m.offer_id
        WHERE ($1 = '' OR m.campaign = $1) ORDER BY m.send_after, m.id`, [c]);
    const rows = r.rows;
    return { ok: true, total: rows.length, sent: rows.filter((x) => x.sent_at).length, pending: rows.filter((x) => !x.sent_at && !x.canceled).length, failed: rows.filter((x) => x.error && !x.sent_at).length, rows };
  });

  app.post("/admin/campaign/cancel", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return reply.code(503).send({ ok: false, error: "db" });
    await init();
    const r = await pool.query(`UPDATE campaign_mails SET canceled=true WHERE campaign=$1 AND sent_at IS NULL`, [clip(b.campaign, 60)]);
    return { ok: true, canceled: r.rowCount };
  });

  app.get("/c/unsub", async (req, reply) => {
    const q = (req.query || {}) as Record<string, string>;
    const email = clip(q.e, 200).toLowerCase();
    reply.type("text/html; charset=utf-8");
    const page = (t: string) => `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><div style="font-family:system-ui,sans-serif;max-width:520px;margin:60px auto;padding:0 20px;color:#111"><h2>RapidRemove</h2><p>${t}</p></div>`;
    if (!pool || !isEmail(email) || !q.t || q.t !== sig(email)) return reply.code(400).send(page("Link ungültig. / Invalid link."));
    await init();
    await pool.query(`INSERT INTO campaign_unsub (email) VALUES ($1) ON CONFLICT DO NOTHING`, [email]);
    await pool.query(`UPDATE campaign_mails SET canceled=true WHERE email=$1 AND sent_at IS NULL`, [email]);
    void notifyTeam("Aktions-Mail abgemeldet", email, undefined, { kind: "info" });
    return page("Sie wurden abgemeldet und erhalten keine weiteren Angebote dieser Art. / You have been unsubscribed.");
  });
}

/** Worker: verschickt fällige Aktions-Mails, höchstens eine Charge (CAMPAIGN_BATCH) je Durchlauf. */
let busy = false;
export async function campaignTick(log: (o: object, m: string) => void): Promise<void> {
  if (busy || !pool || process.env.CAMPAIGN_SEND === "off") return;
  busy = true;
  try {
    await init();
    const r = await pool.query(
      `SELECT m.* FROM campaign_mails m
        WHERE m.sent_at IS NULL AND NOT m.canceled AND m.send_after <= now() AND m.tries < 3
          AND NOT EXISTS (SELECT 1 FROM campaign_unsub u WHERE u.email = m.email)
        ORDER BY m.send_after, m.id LIMIT $1`, [BATCH()]);
    let sent = 0;
    for (const m of r.rows) {
      try {
        await sendMail({ to: m.email, subject: m.subject, html: m.html, replyTo: process.env.MAIL_REPLY_TO });
        await pool.query(`UPDATE campaign_mails SET sent_at=now(), error=NULL, tries=tries+1 WHERE id=$1`, [m.id]);
        await pool.query(`UPDATE offers SET mail_ok=true WHERE id=$1`, [m.offer_id]).catch(() => {});
        sent++;
      } catch (e) {
        await pool.query(`UPDATE campaign_mails SET error=$2, tries=tries+1 WHERE id=$1`, [m.id, String((e as Error).message).slice(0, 300)]);
      }
      await new Promise((res) => setTimeout(res, 4000)); // sanft fürs Postfach (M365-Drosselung)
    }
    if (sent) {
      log({ sent }, "Aktions-Mails verschickt");
      void notifyTeam(`Aktions-Mails: ${sent} verschickt`, `Charge abgeschlossen`, undefined, { kind: "info" });
    }
  } finally {
    busy = false;
  }
}
