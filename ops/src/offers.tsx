/*
 * offers.tsx — Schriftliches Fixpreis-Angebot aus dem Bestellprozess (09.11.2026).
 *
 * Ablauf: Kunde tippt in Schritt 4 („Erst intern besprechen?") seine E-Mail → POST /offer.
 * Der Server legt das Angebot an (Preis wie im Bestellprozess, 14 Tage festgehalten), holt die
 * Sternverteilung (SerpApi), erzeugt das PDF (eigener Chromium) und schickt Mail + PDF.
 * Erinnerungen (nur mit Einwilligung): nach 24 h, nach 4 Tagen, 2 Tage vor Ablauf. Bei Bestellung
 * mit offerId → „angenommen", Erinnerungen stoppen. Admin sieht Verlauf + Kennzahlen.
 *
 * Routen:
 *   POST /offer                       öffentlich (Wizard), rate-limitiert
 *   GET  /offer-info?id&t[&peek=1]    öffentlich mit Token (Angebotsseite), zählt Klicks
 *   GET  /offer-pdf/:id.pdf?t=        öffentlich mit Token, PDF on demand
 *   GET  /offer-o/:id/:t.gif          Zählpixel „geöffnet"
 *   GET  /offer-unsub?id&t            Erinnerungen abbestellen
 *   POST /admin/offers { token }      Liste + Kennzahlen (Admin)
 */
import crypto from "node:crypto";
import * as React from "react";
import type { FastifyInstance } from "fastify";
import { render } from "@react-email/render";
import { Section, Text, Hr, Row, Column } from "@react-email/components";
import QRCode from "qrcode";
import { pool } from "./db";
import { sendMail, mailTrace } from "./mailer";
import { notifyTeam } from "./notify";
import { serpKey } from "./reviewsFetch";
import { resolveTier } from "./priceTier";
import { profilePriceFor, PROTECTION_PRICES } from "./reviewsPricing";
import { offerCopy, type OfferCopy } from "./offerCopy";
import { htmlToPdf } from "./linkProbe";
import { EmailShell, P, CtaButton, Support, brand } from "./emails/components";

const SITE = () => (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
const OPS_PUBLIC = () => (process.env.OPS_PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN : "")).replace(/\/+$/, "");
const VALID_DAYS = 14;
const RIGHTS_FEE = 290;
const EU = new Set(["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK"]);
const LOCALE: Record<string, string> = { de: "de-DE", en: "en-GB", es: "es-ES", fr: "fr-FR", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ja: "ja-JP", sv: "sv-SE", da: "da-DK", no: "nb-NO" };

const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
const isEmail = (e: string) => /^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,24}$/.test(e);

export type Offer = {
  id: string; token: string; created_at: string; valid_until: string; check_id: string | null; place_id: string | null;
  profile: string; category: string | null; addr: string | null; country: string; lang: string; email: string; reminders: boolean;
  service: string; amount: number; cur: string; prem: boolean; rating: number | null; reviews: number | null; dist: Record<string, number> | null;
  source: string | null; status: string; mail_ok: boolean | null; pdf_ok: boolean | null; opened_at: string | null; open_count: number;
  pdf_at: string | null; clicked_at: string | null; click_count: number; accepted_at: string | null; order_id: string | null;
  r1_at: string | null; r2_at: string | null; r3_at: string | null; unsub_at: string | null; expired_at: string | null;
};

let ready = false;
export async function initOffers(): Promise<void> {
  if (!pool || ready) return;
  await pool.query(`CREATE SEQUENCE IF NOT EXISTS offer_seq START 10001`);
  await pool.query(`CREATE TABLE IF NOT EXISTS offers (
      id text PRIMARY KEY, token text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), valid_until timestamptz NOT NULL,
      check_id text, place_id text, profile text, category text, addr text, country text, lang text, email text NOT NULL,
      reminders boolean NOT NULL DEFAULT false, service text, amount numeric, cur text, prem boolean,
      rating numeric, reviews integer, dist jsonb, source text,
      status text NOT NULL DEFAULT 'sent', mail_ok boolean, pdf_ok boolean,
      opened_at timestamptz, open_count integer NOT NULL DEFAULT 0, pdf_at timestamptz,
      clicked_at timestamptz, click_count integer NOT NULL DEFAULT 0,
      accepted_at timestamptz, order_id text, r1_at timestamptz, r2_at timestamptz, r3_at timestamptz,
      unsub_at timestamptz, expired_at timestamptz
    )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS offers_created ON offers (created_at DESC)`);
  ready = true;
}

/* ---------- Formatierung ---------- */
const loc = (o: Pick<Offer, "lang" | "cur">) => (o.lang === "en" && o.cur === "usd" ? "en-US" : LOCALE[o.lang] || "en-GB");
export function fmtMoneyO(o: Pick<Offer, "lang" | "cur">, v: number, frac = true): string {
  try { return new Intl.NumberFormat(loc(o), { style: "currency", currency: o.cur === "usd" ? "USD" : "EUR", minimumFractionDigits: frac ? 2 : 0, maximumFractionDigits: frac ? 2 : 0 }).format(v); }
  catch { return (o.cur === "usd" ? "$" : "€") + v; }
}
const fmtMoneyShort = (o: Pick<Offer, "lang" | "cur">, v: number) => fmtMoneyO(o, v, !Number.isInteger(v));
export function fmtDateO(o: Pick<Offer, "lang" | "cur">, d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  const long = o.lang === "en";
  try { return new Intl.DateTimeFormat(loc(o), long ? { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Vienna" } : { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Vienna" }).format(x); }
  catch { return x.toISOString().slice(0, 10); }
}
const fmtInt = (o: Pick<Offer, "lang" | "cur">, n: number) => { try { return new Intl.NumberFormat(loc(o)).format(n); } catch { return String(n); } };

/** Steuer-Darstellung: AT = 20 % ausgewiesen, übrige EU = Reverse-Charge-Hinweis, sonst Nettopreis. */
function vatOf(o: Offer): { rate: number; mode: "at" | "eu" | "non" } {
  const cc = String(o.country || "").toUpperCase();
  if (cc === "AT") return { rate: 20, mode: "at" };
  if (EU.has(cc)) return { rate: 0, mode: "eu" };
  return { rate: 0, mode: "non" };
}

/* ---------- Sternverteilung (SerpApi google_maps, place_id) ---------- */
type Summary = { dist: Record<string, number> | null; rating: number | null; reviews: number | null; title?: string; address?: string; type?: string };
export async function fetchRatingSummary(placeId: string, lang: string): Promise<Summary> {
  if (!serpKey() || !placeId) return { dist: null, rating: null, reviews: null };
  try {
    const p = new URLSearchParams({ engine: "google_maps", place_id: placeId, hl: lang || "de", api_key: serpKey() });
    const res = await fetch((process.env.SERPAPI_BASE || "https://serpapi.com") + "/search.json?" + p, { signal: AbortSignal.timeout(15_000) });
    const j: any = await res.json().catch(() => null);
    const r = j && j.place_results;
    if (!res.ok || !r) return { dist: null, rating: null, reviews: null };
    let dist: Record<string, number> | null = null;
    if (Array.isArray(r.rating_summary) && r.rating_summary.length) {
      dist = {};
      for (const x of r.rating_summary) { const s = Number(x.stars); if (s >= 1 && s <= 5) dist[String(s)] = Number(x.amount) || 0; }
    }
    return { dist, rating: r.rating != null ? Number(r.rating) : null, reviews: r.reviews != null ? Number(r.reviews) : null, title: r.title, address: r.address, type: r.type };
  } catch { return { dist: null, rating: null, reviews: null }; }
}

/* ---------- Links ---------- */
export const offerUrl = (o: Pick<Offer, "id" | "token">) => `${SITE()}/angebot/${encodeURIComponent(o.id)}?t=${o.token}`;
const pdfUrl = (o: Pick<Offer, "id" | "token">) => `${OPS_PUBLIC()}/offer-pdf/${encodeURIComponent(o.id)}.pdf?t=${o.token}`;
const unsubUrl = (o: Pick<Offer, "id" | "token">) => `${OPS_PUBLIC()}/offer-unsub?id=${encodeURIComponent(o.id)}&t=${o.token}`;
const pixel = (o: Pick<Offer, "id" | "token">) => OPS_PUBLIC() ? `<img src="${OPS_PUBLIC()}/offer-o/${encodeURIComponent(o.id)}/${o.token}.gif" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;opacity:0" />` : "";
const withPixel = (html: string, o: Offer) => { const img = pixel(o); return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, img + "</body>") : html + img; };
const fill = (s: string, o: Offer) => s.replace("{zero}", fmtMoneyShort(o, 0)).replace("{rights}", fmtMoneyShort(o, RIGHTS_FEE));

/* ---------- Kennzahlen aus der Verteilung ---------- */
function stats(o: Offer) {
  const n = Number(o.reviews) || 0;
  const d = o.dist || null;
  const tot = d ? Object.values(d).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
  const neg = d ? (Number(d["1"]) || 0) + (Number(d["2"]) || 0) : null;
  const negPct = neg != null && tot > 0 ? Math.round((neg / tot) * 100) : null;
  return { n, d, tot, neg, negPct };
}
const stars = (r: number | null) => { const v = Math.round(Number(r) || 0); return "★★★★★".slice(0, v) + "☆☆☆☆☆".slice(0, 5 - v); };
const ratingStr = (o: Offer) => (o.rating != null ? Number(o.rating).toLocaleString(loc(o), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "–");

/* ---------- PDF (2 Seiten A4) ---------- */
export async function offerHtml(o: Offer): Promise<string> {
  const c = offerCopy(o.lang).pdf;
  const st = stats(o);
  const v = vatOf(o);
  const net = Number(o.amount) || 0;
  const vatAmt = v.mode === "at" ? Math.round(net * v.rate) / 100 : 0;
  const reset = o.service === "reset";
  const qr = await QRCode.toString(offerUrl(o), { type: "svg", margin: 0, errorCorrectionLevel: "M" }).catch(() => "");
  const date = fmtDateO(o, o.created_at);
  const until = fmtDateO(o, o.valid_until);
  const nTxt = fmtInt(o, st.n);
  const addrLines = esc(o.addr || "").split(/,\s*/).filter(Boolean);
  const addrHtml = addrLines.length > 1 ? addrLines.slice(0, -1).join(", ") + "<br>" + addrLines[addrLines.length - 1] : addrLines.join("");
  const maxBar = st.d ? Math.max(1, ...Object.values(st.d).map((x) => Number(x) || 0)) : 1;
  const bars = st.d ? [5, 4, 3, 2, 1].map((s) => {
    const val = Number(st.d![String(s)]) || 0;
    return `<div class="bar${s <= 2 ? " neg" : ""}"><span>${s}</span><i style="--w:${Math.max(val > 0 ? 2 : 0, Math.round((val / maxBar) * 100))}%"></i><span>${fmtInt(o, val)}</span></div>`;
  }).join("") : "";
  const third = reset ? `<div><span class="k">${esc(c.gNew)}</span><b>0 ★</b><small>${esc(c.gNewSub)}</small></div>` : `<div><span class="k">${esc(c.gVis)}</span><b>0</b><small>${esc(c.gVisSub)}</small></div>`;
  const negCell = st.neg != null ? `<div><span class="k">${esc(c.gNeg)}</span><b class="neg">${fmtInt(o, st.neg)}</b><small>${st.negPct != null ? esc(c.gNegSub(String(st.negPct))) : ""}</small></div>` : "";
  const sumHtml = v.mode === "at"
    ? `<div><span>${esc(c.net)}</span><b>${fmtMoneyO(o, net)}</b></div><div><span>${esc(c.vat(String(v.rate)))}</span><b>${fmtMoneyO(o, vatAmt)}</b></div><div class="tot"><span>${esc(c.gross)}</span><b>${fmtMoneyO(o, net + vatAmt)}</b></div>`
    : `<div class="tot"><span>${esc(c.totalNet)}</span><b>${fmtMoneyO(o, net)}</b></div><div class="vn">${esc(v.mode === "eu" ? c.vatEU : c.vatNon)}</div>`;
  const foot = (a: number) => `<div class="foot"><span><b>RapidRemove</b> · Simple Solution. OG · Salzgasse 2, 5400 Hallein · UID ATU72401536</span><span>${esc(o.id)} · ${esc(c.page(a, 2))}</span></div>`;
  const opt = reset ? "" : `<div class="opt"><div><div class="k">${esc(c.optK)}</div><h2 style="margin-top:6px">${esc(c.optH)}</h2><p>${esc(c.optP)}</p></div><div class="pr"><b>${esc(c.optYear(fmtMoneyShort(o, PROTECTION_PRICES.yearly)))}</b><small>${esc(c.optAlt(fmtMoneyO(o, PROTECTION_PRICES.monthly)))}</small><small>${esc(c.optBill)}</small></div></div>`;
  return `<!doctype html><html lang="${esc(o.lang)}"><head><meta charset="utf-8"><title>${esc(o.id)}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${PDF_CSS}</style></head><body>
<section class="page">
  <div class="head"><div class="brand"><img src="${SITE()}/assets/rapidremove-icon.png" alt=""><b>RapidRemove</b></div>
    <div class="sender"><b>Simple Solution. OG</b> · RapidRemove<br>Salzgasse 2, 5400 Hallein, Österreich<br>helpdesk@rapid-remove.com · +43 6245 9305300<br>UID ATU72401536</div></div>
  <div class="rule"></div>
  <div class="addr"><div class="to"><div class="lbl">${esc(c.offerFor)}</div><b>${esc(o.profile)}</b><span>${addrHtml}</span></div>
    <div class="meta"><div><span>${esc(c.offer)}</span><b class="mono">${esc(o.id)}</b></div><div><span>${esc(c.date)}</span><b>${esc(date)}</b></div><div class="valid"><span>${esc(c.valid)}</span><b>${esc(until)}</b></div><div><span>${esc(c.contact)}</span><b>Maximilian Hölzl</b></div></div></div>
  <h1>${esc(reset ? c.titleReset : c.titleRemove)}</h1>
  <p class="intro">${esc(reset ? c.introReset : c.introRemove)}</p>
  <div class="snap${st.d ? "" : " one"}"><div class="l"><div class="k">${esc(c.checked)}</div><div class="nm">${esc(o.profile)}</div>${o.category ? `<div class="cat">${esc(o.category)}</div>` : ""}${o.addr ? `<div class="ad">${esc(o.addr)}</div>` : ""}
    <div class="rat"><strong>${esc(ratingStr(o))}</strong><div><div class="stars">${stars(o.rating)}</div><small>${esc(c.reviewsOn(nTxt))}</small></div></div></div>
    ${st.d ? `<div class="r"><div class="k">${esc(c.dist)}</div><div class="bars">${bars}</div><div class="src">${esc(c.src(date))}</div></div>` : ""}</div>
  <div class="gone-h"><h2>${esc(reset ? c.goneHReset : c.goneH)}</h2></div>
  <div class="gone${negCell ? "" : " two"}"><div><span class="k">${esc(c.gReviews)}</span><b>${esc(nTxt)}</b><small>${esc(c.gAll)}</small></div>${negCell}${third}</div>
  <table><colgroup><col style="width:12mm"><col><col style="width:18mm"><col style="width:30mm"></colgroup>
    <thead><tr><th>${esc(c.pos)}</th><th>${esc(c.svc)}</th><th class="n">${esc(c.qty)}</th><th class="n">${esc(c.amt)}</th></tr></thead>
    <tbody><tr><td class="pos">1</td><td style="padding-right:8mm"><b>${esc(reset ? c.itemReset : c.itemRemove)}</b><small>${esc(reset ? c.itemResetD(nTxt) : c.itemRemoveD(nTxt))}</small></td><td class="n">1</td><td class="n"><b>${fmtMoneyO(o, net)}</b></td></tr></tbody></table>
  <div class="totals"><div class="sum">${sumHtml}</div>
    <div class="due"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e67300" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg><span><b>${esc(c.dueB(fmtMoneyShort(o, 0)))}</b> ${esc(c.dueR)}</span></div></div>
  ${foot(1)}
</section>
<section class="page">
  <div class="p2h"><div class="brand"><img src="${SITE()}/assets/rapidremove-icon.png" alt=""><b>RapidRemove</b></div><span class="mono">${esc(o.id)} · ${esc(o.profile)}</span></div>
  <div class="rule" style="margin:7mm 0 8mm"></div>
  <h2>${esc(c.stepsH)}</h2>
  <div class="steps">${c.steps.map((s, i) => `<div class="step"><div class="no">${i + 1}</div><b>${esc(s[0])}</b><p>${esc(s[1])}</p><div class="t">${esc(s[2])}</div></div>`).join("")}</div>
  ${opt}
  <div class="facts">${c.facts.map((f) => `<div><b>${esc(fill(f[0], o))}</b><span>${esc(f[1])}</span></div>`).join("")}</div>
  <div class="terms">${c.terms.map((t) => `<div><b>${esc(t[0])}</b>${esc(fill(t[1], o))}</div>`).join("")}</div>
  <div class="accept"><div><h3>${esc(c.accH)}</h3><p>${esc(c.accP)}</p><div class="url mono">${esc(offerUrl(o).replace(/^https?:\/\/(www\.)?/, "").replace(/\?.*$/, ""))}</div></div><div class="qr">${qr}</div></div>
  <div class="people"><div class="av"><img src="${SITE()}/assets/bestell/avatar-max.webp" alt=""><img src="${SITE()}/assets/bestell/avatar-matthias.webp" alt=""></div><div><b>${esc(c.people)}</b><span>${esc(c.peopleSub)}</span></div></div>
  ${foot(2)}
</section></body></html>`;
}

const PDF_CSS = `@page{size:A4;margin:0}:root{--ink:#0f0f0f;--text:#2a2a2a;--muted:#737373;--line:#e7e7e7;--soft:#f6f6f5;--accent:#ff8000;--accent-soft:#fff4e8}
*{box-sizing:border-box}html,body{margin:0;background:#fff}body{font-family:'Geist',-apple-system,'Segoe UI',sans-serif;color:var(--text);-webkit-font-smoothing:antialiased}
.page{width:210mm;height:297mm;background:#fff;position:relative;padding:15mm 18mm 0;overflow:hidden;page-break-after:always}
.mono{font-family:'Geist Mono',ui-monospace,monospace}
.head{display:flex;justify-content:space-between;align-items:flex-start}.brand{display:flex;align-items:center;gap:10px}.brand img{width:34px;height:34px;border-radius:9px;display:block}.brand b{font-size:19px;font-weight:800;letter-spacing:-.5px;color:var(--ink)}
.sender{text-align:right;font-size:8.5pt;line-height:1.55;color:var(--muted)}.sender b{color:var(--ink);font-weight:600}
.rule{height:1px;background:var(--line);margin:6mm 0}
.addr{display:grid;grid-template-columns:1fr 62mm;gap:10mm;align-items:start}.to .lbl{font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}.to b{display:block;font-size:12pt;color:var(--ink);font-weight:600;letter-spacing:-.2px}.to span{display:block;font-size:10pt;line-height:1.5}
.meta{border:1px solid var(--line);border-radius:10px;padding:10px 14px}.meta div{display:flex;justify-content:space-between;gap:10px;font-size:8.8pt;padding:3.5px 0}.meta div span{color:var(--muted)}.meta div b{color:var(--ink);font-weight:600;text-align:right}.meta .valid b{color:var(--accent)}
h1{margin:8mm 0 0;font-size:22pt;line-height:1.08;font-weight:800;letter-spacing:-1px;color:var(--ink)}
.intro{margin:4mm 0 0;font-size:10pt;line-height:1.55;max-width:155mm}
.snap{margin-top:6mm;display:grid;grid-template-columns:1fr 66mm;border:1px solid var(--line);border-radius:14px;overflow:hidden}.snap.one{grid-template-columns:1fr}.snap .l{padding:14px 16px}.snap .r{padding:14px 16px;background:var(--soft);border-left:1px solid var(--line)}
.k{font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}.snap .nm{margin-top:6px;font-size:13pt;font-weight:700;color:var(--ink);letter-spacing:-.3px}.snap .cat{font-size:9pt;color:var(--muted);margin-top:2px}.snap .ad{font-size:9.5pt;margin-top:6px}
.rat{display:flex;align-items:center;gap:10px;margin-top:9px}.rat strong{font-size:24pt;font-weight:700;color:var(--ink);letter-spacing:-1px;line-height:1}.stars{color:#f5a623;font-size:12pt;letter-spacing:1px;line-height:1}.rat small{display:block;font-size:8.5pt;color:var(--muted);margin-top:3px}
.bars{margin-top:8px}.bar{display:grid;grid-template-columns:14px 1fr 40px;gap:8px;align-items:center;font-size:8.3pt;color:var(--muted);padding:2.4px 0}.bar i{display:block;height:5px;border-radius:3px;background:#e9e9e9;position:relative;overflow:hidden}.bar i::after{content:"";position:absolute;inset:0 auto 0 0;width:var(--w);background:#bdbdbd;border-radius:3px}.bar.neg i::after{background:#e5484d}.bar.neg{color:var(--ink)}.bar span:last-child{text-align:right;font-variant-numeric:tabular-nums}.src{margin-top:8px;font-size:7.3pt;color:var(--muted)}
.gone-h{margin-top:5.5mm}h2{margin:0;font-size:12pt;font-weight:700;color:var(--ink);letter-spacing:-.2px}
.gone{margin-top:3.5mm;display:grid;grid-template-columns:repeat(3,1fr);border-radius:14px;background:var(--ink);color:#fff}.gone.two{grid-template-columns:repeat(2,1fr)}.gone div{padding:11px 16px}.gone div+div{border-left:1px solid rgba(255,255,255,.12)}.gone .k{color:rgba(255,255,255,.55)}.gone b{display:block;margin-top:5px;font-size:18pt;font-weight:700;letter-spacing:-.6px;line-height:1.05;font-variant-numeric:tabular-nums}.gone b.neg{color:#ff8a8d}.gone small{display:block;font-size:8pt;color:rgba(255,255,255,.6);margin-top:3px}
table{width:100%;border-collapse:collapse;margin-top:6mm;font-size:9.6pt;table-layout:fixed}th{text-align:left;font-weight:500;font-size:7.5pt;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:0 0 8px;border-bottom:1px solid var(--ink)}td{padding:9px 0;border-bottom:1px solid var(--line);vertical-align:top}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}td.pos{color:var(--muted)}td b{color:var(--ink);font-weight:600}td small{display:block;color:var(--muted);font-size:8.6pt;margin-top:2px;line-height:1.45}
.totals{display:grid;grid-template-columns:1fr 72mm;gap:10mm;align-items:center;margin-top:3mm}.totals .due{order:-1}
.sum{font-size:9.6pt}.sum div{display:flex;justify-content:space-between;padding:3px 0}.sum div span{color:var(--muted)}.sum .tot{border-top:1px solid var(--ink);margin-top:4px;padding-top:8px}.sum .tot span{color:var(--ink);font-weight:600}.sum .tot b{font-size:15pt;font-weight:800;color:var(--ink);letter-spacing:-.4px}.sum .vn{display:block;font-size:8pt;color:var(--muted);padding-top:2px}
.due{display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:12px;background:var(--accent-soft);color:#7a3b00;font-size:9.4pt;line-height:1.45}.due b{color:#5c2c00}.due svg{flex:none;margin-top:1px}
.foot{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;gap:8mm;border-top:1px solid var(--line);padding-top:9px;font-size:7.4pt;line-height:1.55;color:var(--muted)}.foot b{color:var(--text);font-weight:600}
.p2h{display:flex;justify-content:space-between;align-items:center;font-size:8.5pt;color:var(--muted)}
.steps{margin-top:4mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.step{border:1px solid var(--line);border-radius:14px;padding:14px}.step .no{width:24px;height:24px;border-radius:50%;background:var(--ink);color:#fff;font-size:9pt;font-weight:700;display:grid;place-items:center}.step b{display:block;margin-top:10px;font-size:10.5pt;color:var(--ink);font-weight:600;letter-spacing:-.2px}.step p{margin:5px 0 0;font-size:8.8pt;line-height:1.5}.step .t{margin-top:10px;font-size:8pt;color:var(--muted)}
.opt{margin-top:6mm;border:1px dashed #d4d4d4;border-radius:14px;padding:14px 16px;display:grid;grid-template-columns:1fr auto;gap:8mm;align-items:center}.opt p{margin:5px 0 0;font-size:9pt;line-height:1.55}.opt .pr{text-align:right}.opt .pr b{font-size:13pt;font-weight:700;color:var(--ink)}.opt .pr small{display:block;font-size:8pt;color:var(--muted);margin-top:2px}
.facts{margin-top:6mm;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.facts div{padding:10px 0 10px 14px}.facts div+div{border-left:1px solid var(--line)}.facts div:first-child{padding-left:0}.facts b{display:block;font-size:17pt;font-weight:700;color:var(--ink);letter-spacing:-.6px}.facts span{font-size:8.3pt;color:var(--muted)}
.terms{margin-top:6mm;display:grid;grid-template-columns:1fr 1fr;gap:3mm 10mm}.terms div{font-size:8.8pt;line-height:1.55}.terms div b{display:block;color:var(--ink);font-weight:600;font-size:9.2pt;margin-bottom:2px}
.accept{margin-top:6mm;display:grid;grid-template-columns:1fr 26mm;gap:8mm;align-items:center;border-radius:16px;background:var(--soft);padding:16px 18px}.accept h3{margin:0;font-size:13pt;font-weight:700;color:var(--ink);letter-spacing:-.3px}.accept p{margin:5px 0 0;font-size:9pt;line-height:1.55}.accept .url{margin-top:8px;font-size:9pt;color:var(--ink);font-weight:600;word-break:break-all}.accept .qr{background:#fff;border-radius:10px;padding:8px}.accept .qr svg{width:100%;height:auto;display:block}
.people{margin-top:6mm;display:flex;align-items:center;gap:14px}.people .av{display:flex}.people .av img{width:40px;height:40px;border-radius:50%;border:2px solid #fff;object-fit:cover}.people .av img+img{margin-left:-10px}.people b{display:block;font-size:10pt;color:var(--ink);font-weight:600}.people span{font-size:8.8pt;color:var(--muted)}`;

export async function offerPdf(o: Offer): Promise<Buffer> {
  return htmlToPdf(await offerHtml(o));
}

/* ---------- Mails ---------- */
function StatCol({ k, v, sub, neg }: { k: string; v: string; sub: string; neg?: boolean }) {
  return (
    <Column style={{ padding: "12px 12px", verticalAlign: "top" }}>
      <Text style={{ margin: 0, fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,.55)" }}>{k}</Text>
      <Text style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700, lineHeight: "1.05", color: neg ? "#ff8a8d" : "#ffffff" }}>{v}</Text>
      <Text style={{ margin: "3px 0 0", fontSize: 11, lineHeight: "1.35", color: "rgba(255,255,255,.6)" }}>{sub}</Text>
    </Column>
  );
}
function LineRow({ l, r, bold }: { l: React.ReactNode; r: React.ReactNode; bold?: boolean }) {
  return (
    <Row><Column style={{ padding: "6px 0", fontSize: 15, color: bold ? brand.ink : brand.muted, fontWeight: bold ? 700 : 400 }}>{l}</Column>
      <Column align="right" style={{ padding: "6px 0", fontSize: bold ? 20 : 15, color: brand.ink, fontWeight: bold ? 800 : 600, whiteSpace: "nowrap" }}>{r}</Column></Row>
  );
}
function OfferMail({ o, c, hasPdf }: { o: Offer; c: OfferCopy; hasPdf: boolean }) {
  const m = c.mail, pc = c.pdf;
  const st = stats(o), v = vatOf(o), net = Number(o.amount) || 0, vatAmt = v.mode === "at" ? Math.round(net * v.rate) / 100 : 0;
  const reset = o.service === "reset";
  const until = fmtDateO(o, o.valid_until);
  return (
    <EmailShell lang={o.lang as any} preview={m.preview(o.id, until)} title={m.title(o.profile)}>
      <P>{m.hello}</P>
      <P>{reset ? m.introReset(until) : m.intro(until)}</P>
      <Section style={{ border: "1px solid #ececec", borderRadius: 20, padding: "16px 18px", margin: "8px 0 0" }}>
        <Text style={{ margin: 0, fontSize: 11, letterSpacing: "0.08em", color: brand.muted }}>{m.checked}</Text>
        <Text style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 800, color: brand.ink }}>{o.profile}</Text>
        <Text style={{ margin: "2px 0 0", fontSize: 14, color: brand.muted }}>{[o.category, o.addr].filter(Boolean).join(" · ")}</Text>
        <Text style={{ margin: "8px 0 0", fontSize: 14, color: brand.text }}><strong style={{ color: brand.ink, fontSize: 16 }}>{ratingStr(o)}</strong> <span style={{ color: "#f5a623" }}>{stars(o.rating)}</span> &nbsp;{m.reviews(fmtInt(o, st.n))}</Text>
      </Section>
      {!reset ? (
        <>
          <Text style={{ margin: "18px 0 8px", fontSize: 16, fontWeight: 800, color: brand.ink }}>{m.goneH}</Text>
          <Section style={{ background: brand.ink, borderRadius: 18, padding: "4px 6px" }}>
            <Row>
              <StatCol k={m.sReviews} v={fmtInt(o, st.n)} sub={m.sAll} />
              {st.neg != null ? <StatCol k={m.sNeg} v={fmtInt(o, st.neg)} sub={st.negPct != null ? m.sNegSub(String(st.negPct)) : ""} neg /> : null}
              <StatCol k={m.sAfter} v="0" sub={m.sAfterSub} />
            </Row>
          </Section>
        </>
      ) : null}
      <Section style={{ margin: "16px 0 0" }}>
        <LineRow l={reset ? pc.itemReset : pc.itemRemove} r={fmtMoneyO(o, net)} />
        {v.mode === "at" ? <LineRow l={m.vat(String(v.rate))} r={fmtMoneyO(o, vatAmt)} /> : null}
        <Hr style={{ borderColor: brand.ink, margin: "6px 0" }} />
        <LineRow l={v.mode === "at" ? m.gross : pc.totalNet} r={fmtMoneyO(o, net + vatAmt)} bold />
        {v.mode !== "at" ? <Text style={{ margin: "2px 0 0", fontSize: 12, color: brand.muted }}>{v.mode === "eu" ? pc.vatEU : pc.vatNon}</Text> : null}
      </Section>
      <Section style={{ background: "#fff4e8", borderRadius: 16, padding: "12px 16px", margin: "12px 0 18px" }}>
        <Text style={{ margin: 0, fontSize: 14, lineHeight: "1.5", color: "#7a3b00" }}><strong style={{ color: "#5c2c00" }}>{m.due(fmtMoneyShort(o, 0))}</strong> {m.dueR}</Text>
      </Section>
      <CtaButton href={offerUrl(o)} variant="pay" full>{m.cta}</CtaButton>
      <Text style={{ margin: "8px 0 0", fontSize: 13, color: brand.muted, textAlign: "center" as const }}>{m.ctaSub}</Text>
      <Section style={{ background: brand.tint, borderRadius: 16, padding: "12px 16px", margin: "18px 0 0" }}>
        <Text style={{ margin: 0, fontSize: 14, lineHeight: "1.5", color: brand.text }}>
          {hasPdf ? <>📎 <strong style={{ color: brand.ink }}>{m.att(`${o.id}.pdf`)}</strong></> : <a href={pdfUrl(o)} style={{ color: brand.ink, fontWeight: 700 }}>{m.pdfLink}</a>}
        </Text>
      </Section>
      <Support lang={o.lang as any} phone />
      {o.reminders ? <Text style={{ margin: "14px 0 0", fontSize: 11, lineHeight: "1.5", color: "#9a9a9a" }}>{m.remindNote} <a href={unsubUrl(o)} style={{ color: "#9a9a9a" }}>{m.unsub}</a></Text> : null}
    </EmailShell>
  );
}
function R2Mail({ o, c }: { o: Offer; c: OfferCopy }) {
  const r = c.r2, until = fmtDateO(o, o.valid_until);
  return (
    <EmailShell lang={o.lang as any} preview={r.intro} title={r.title}>
      <P>{r.intro}</P>
      {r.qa.map(([q, a], i) => (
        <Section key={i} style={{ margin: "0 0 10px", background: brand.tint, borderRadius: 16, padding: "12px 16px" }}>
          <Text style={{ margin: 0, fontSize: 15, fontWeight: 700, color: brand.ink }}>{q}</Text>
          <Text style={{ margin: "4px 0 0", fontSize: 14, lineHeight: "1.5", color: brand.text }}>{fill(a, o)}</Text>
        </Section>
      ))}
      <Section style={{ margin: "16px 0 6px" }}><CtaButton href={offerUrl(o)} variant="pay" full>{r.cta(until)}</CtaButton></Section>
      <Support lang={o.lang as any} phone />
      <Text style={{ margin: "14px 0 0", fontSize: 11, color: "#9a9a9a" }}><a href={unsubUrl(o)} style={{ color: "#9a9a9a" }}>{c.mail.unsub}</a></Text>
    </EmailShell>
  );
}
function R3Mail({ o, c }: { o: Offer; c: OfferCopy }) {
  const r = c.r3, until = fmtDateO(o, o.valid_until);
  return (
    <EmailShell lang={o.lang as any} preview={r.title(until)} title={r.title(until)}>
      <P>{c.mail.hello} {r.p(o.id, o.profile, until, fmtMoneyShort(o, Number(o.amount) || 0))}</P>
      <Section style={{ margin: "10px 0 6px" }}><CtaButton href={offerUrl(o)} variant="pay" full>{r.cta}</CtaButton></Section>
      <Text style={{ margin: "8px 0 0", fontSize: 13, color: brand.muted, textAlign: "center" as const }}>{r.sub}</Text>
      <Support lang={o.lang as any} phone />
      <Text style={{ margin: "14px 0 0", fontSize: 11, color: "#9a9a9a" }}><a href={unsubUrl(o)} style={{ color: "#9a9a9a" }}>{c.mail.unsub}</a></Text>
    </EmailShell>
  );
}
/** Erinnerung 1: persönliche Text-Mail von Max (bewusst ohne Design). */
function r1Html(o: Offer, c: OfferCopy): string {
  const r = c.r1, until = fmtDateO(o, o.valid_until), u = offerUrl(o);
  return `<!doctype html><html lang="${esc(o.lang)}"><head><meta charset="utf-8"></head><body style="margin:0;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#222;font-size:15px;line-height:1.6">
<div style="max-width:560px;padding:20px 16px"><p>${esc(r.hello)}</p><p>${esc(r.p1(o.profile))}</p><p>${esc(r.p2)}</p>
<p>${esc(r.p3(until))}<br><a href="${esc(u)}" style="color:#111;font-weight:600">${esc(u.replace(/^https?:\/\/(www\.)?/, "").replace(/\?.*$/, ""))}</a></p>
<p>${esc(r.bye)}<br>${esc(r.sign)}</p><p style="font-size:13px;color:#888;margin-top:22px">${esc(r.signSub)}<br>+43 6245 9305300 · WhatsApp</p>
<p style="font-size:11px;color:#aaa;margin-top:18px"><a href="${esc(unsubUrl(o))}" style="color:#aaa">${esc(c.mail.unsub)}</a></p></div></body></html>`;
}

async function sendOfferMail(o: Offer, kind: "offer" | "r1" | "r2" | "r3", log: (o: object, m: string) => void): Promise<boolean> {
  const c = offerCopy(o.lang);
  const until = fmtDateO(o, o.valid_until);
  try {
    if (kind === "offer") {
      let pdf: Buffer | null = null;
      try { pdf = await offerPdf(o); } catch (e) { log({ err: String((e as Error)?.message || e).slice(0, 300), id: o.id }, "Angebot: PDF fehlgeschlagen – Mail mit Link"); }
      const html = withPixel(await render(<OfferMail o={o} c={c} hasPdf={!!pdf} />), o);
      const r = await sendMail({ to: o.email, subject: c.mail.subject(o.profile, until), html, attachments: pdf ? [{ filename: `${o.id}.pdf`, content: pdf, contentType: "application/pdf" }] : undefined });
      await pool!.query(`UPDATE offers SET mail_ok=true, pdf_ok=$2 WHERE id=$1`, [o.id, !!pdf]);
      log({ id: o.id, trace: mailTrace(r) }, "Angebot gesendet");
      return true;
    }
    const subject = kind === "r1" ? c.r1.subject(o.profile) : kind === "r2" ? c.r2.subject : c.r3.subject(o.profile, until);
    const html = withPixel(kind === "r1" ? r1Html(o, c) : await render(kind === "r2" ? <R2Mail o={o} c={c} /> : <R3Mail o={o} c={c} />), o);
    await sendMail({ to: o.email, subject, html });
    await pool!.query(`UPDATE offers SET ${kind}_at=now() WHERE id=$1`, [o.id]);
    return true;
  } catch (e) {
    log({ err: String((e as Error)?.message || e).slice(0, 300), id: o.id, kind }, "Angebot: Mail fehlgeschlagen");
    if (kind === "offer") { await pool!.query(`UPDATE offers SET mail_ok=false WHERE id=$1`, [o.id]).catch(() => {}); void notifyTeam("Angebot: Mail fehlgeschlagen", `${o.profile} · ${o.email} · ${o.id}`, `${SITE()}/admin`, { kind: "customer" }); }
    return false;
  }
}

/* ---------- Angebot anlegen ---------- */
async function getOffer(id: string): Promise<Offer | null> {
  if (!pool || !id) return null;
  const r = await pool.query(`SELECT * FROM offers WHERE id=$1`, [id]);
  return (r.rows[0] as Offer) || null;
}
const tokenOk = (o: Offer | null, t: unknown) => !!o && typeof t === "string" && t.length >= 16 && crypto.timingSafeEqual(Buffer.from(o.token.padEnd(64).slice(0, 64)), Buffer.from(String(t).padEnd(64).slice(0, 64)));
const isExpired = (o: Offer) => o.status === "expired" || new Date(o.valid_until).getTime() < Date.now();

/** Gültiges Angebot für eine Bestellung (Preisbindung): gleiches Profil + Leistung, nicht abgelaufen/angenommen. */
export async function offerForOrder(offerId: unknown, placeId: unknown, service: string): Promise<Offer | null> {
  const id = clip(offerId, 40);
  if (!id || !/^RR-A-\d+$/.test(id)) return null;
  const o = await getOffer(id).catch(() => null);
  if (!o || isExpired(o) || o.status === "accepted") return null;
  if (o.place_id && placeId && String(placeId) !== o.place_id) return null;
  if ((o.service || "remove") !== service) return null;
  return o;
}
export async function markOfferAccepted(offerId: unknown, orderId: string): Promise<void> {
  const id = clip(offerId, 40);
  if (!pool || !id || !/^RR-A-\d+$/.test(id)) return;
  const r = await pool.query(`UPDATE offers SET status='accepted', accepted_at=now(), order_id=$2 WHERE id=$1 AND status<>'accepted' RETURNING profile, amount, cur`, [id, orderId]).catch(() => null);
  const row = r && r.rows[0];
  if (row) void notifyTeam(`Angebot angenommen ✓ · ${row.profile}`, `${id} → Auftrag ${orderId}`, `${SITE()}/admin?order=${encodeURIComponent(orderId)}`, { kind: "customer" });
}

const hits = new Map<string, number[]>();
function limited(key: string, max: number, ms: number): boolean {
  const now = Date.now();
  const a = (hits.get(key) || []).filter((t) => now - t < ms);
  if (a.length >= max) { hits.set(key, a); return true; }
  a.push(now); hits.set(key, a);
  if (hits.size > 20000) hits.clear();
  return false;
}

const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const LANGS = new Set(["de", "en", "es", "fr", "it", "nl", "pt", "ja", "sv", "da", "no"]);

export function registerOffers(app: FastifyInstance, adminOk: (t: unknown) => boolean): void {
  app.post("/offer", async (req, reply) => {
    if (!pool) return reply.code(503).send({ ok: false, error: "db" });
    await initOffers();
    const b = (req.body || {}) as Record<string, unknown>;
    const email = clip(b.email, 200).toLowerCase();
    if (!isEmail(email)) return reply.code(400).send({ ok: false, error: "email" });
    if (limited("ip:" + req.ip, 6, 3600_000) || limited("em:" + email, 3, 86400_000)) return reply.code(429).send({ ok: false, error: "rate" });
    const service = b.service === "reset" ? "reset" : "remove";
    const lang = LANGS.has(String(b.lang)) ? String(b.lang) : "en";
    const country = (clip(b.country, 6) || "DE").toUpperCase();
    const placeId = clip(b.placeId, 120);
    const profile = clip(b.profile, 200);
    if (!profile) return reply.code(400).send({ ok: false, error: "profile" });
    // Preis wie in /order: Server entscheidet (Branche/Neukunde), Währung nach Profil-Land.
    const tier = await resolveTier({ email, placeId, placeType: b.placeType, placeTypes: b.placeTypes, category: b.category, country }).catch(() => null);
    const cur = country === "US" ? "usd" : "eur";
    const prem = !!tier && tier.prem && !tier.legacy;
    const amount = profilePriceFor(service, cur, prem);
    const sum = await fetchRatingSummary(placeId, lang);
    const r = await pool.query(`SELECT nextval('offer_seq') AS n`);
    const id = "RR-A-" + r.rows[0].n;
    const token = crypto.randomBytes(16).toString("hex");
    const validUntil = new Date(Date.now() + VALID_DAYS * 86400_000);
    const ratingIn = Number(String(b.rating || "").replace(",", "."));
    await pool.query(
      `INSERT INTO offers (id, token, valid_until, check_id, place_id, profile, category, addr, country, lang, email, reminders, service, amount, cur, prem, rating, reviews, dist, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [id, token, validUntil, clip(b.checkId, 40) || null, placeId || null, profile, clip(b.category, 120) || null, clip(b.addr, 250) || null, country, lang, email,
       b.reminders === true, service, amount, cur, prem,
       sum.rating ?? (Number.isFinite(ratingIn) && ratingIn > 0 ? ratingIn : null), sum.reviews ?? (Number(b.reviews) || 0), sum.dist ? JSON.stringify(sum.dist) : null, clip(b.source, 40) || null],
    );
    if (b.checkId) await pool.query(`UPDATE checks SET email=COALESCE(NULLIF(email,''), $2) WHERE id=$1`, [clip(b.checkId, 40), email]).catch(() => {});
    const o = await getOffer(id);
    if (o) {
      void (async () => {
        await sendOfferMail(o, "offer", (x, m) => app.log.info(x, m));
        void notifyTeam(`Angebot angefordert · ${profile}`, `${fmtMoneyO(o, amount, false)} · ${email} · ${id}${o.reminders ? " · mit Erinnerungen" : ""}`, `${SITE()}/admin`, { kind: "customer" });
      })();
    }
    return { ok: true, id, validUntil: validUntil.toISOString() };
  });

  app.get("/offer-info", async (req, reply) => {
    const q = (req.query || {}) as Record<string, string>;
    await initOffers().catch(() => {});
    const o = await getOffer(clip(q.id, 40)).catch(() => null);
    if (!tokenOk(o, q.t)) return reply.code(404).send({ ok: false, error: "not found" });
    const x = o as Offer;
    if (q.peek !== "1") await pool!.query(`UPDATE offers SET click_count=click_count+1, clicked_at=COALESCE(clicked_at, now()) WHERE id=$1`, [x.id]).catch(() => {});
    return {
      ok: true, id: x.id, status: isExpired(x) && x.status !== "accepted" ? "expired" : x.status, validUntil: x.valid_until, createdAt: x.created_at,
      profile: x.profile, placeId: x.place_id, category: x.category, addr: x.addr, country: x.country, lang: x.lang, email: x.email,
      service: x.service, amount: Number(x.amount), cur: x.cur, rating: x.rating != null ? Number(x.rating) : null, reviews: x.reviews, dist: x.dist,
      pdfUrl: pdfUrl(x), checkId: x.check_id,
    };
  });

  app.get("/offer-pdf/:file", async (req, reply) => {
    const file = String((req.params as Record<string, string>).file || "");
    const q = (req.query || {}) as Record<string, string>;
    const o = await getOffer(clip(file.replace(/\.pdf$/i, ""), 40)).catch(() => null);
    if (!tokenOk(o, q.t)) return reply.code(404).send("not found");
    try {
      const pdf = await offerPdf(o as Offer);
      await pool!.query(`UPDATE offers SET pdf_at=COALESCE(pdf_at, now()) WHERE id=$1`, [(o as Offer).id]).catch(() => {});
      reply.header("Content-Type", "application/pdf").header("Content-Disposition", `inline; filename="${(o as Offer).id}.pdf"`).header("Cache-Control", "private, max-age=300");
      return reply.send(pdf);
    } catch (e) {
      app.log.error({ err: e }, "Angebot-PDF fehlgeschlagen");
      return reply.code(500).send("PDF derzeit nicht verfügbar – bitte später erneut versuchen.");
    }
  });

  app.get("/offer-o/:id/:file", async (req, reply) => {
    const p = req.params as Record<string, string>;
    const t = String(p.file || "").replace(/\.gif$/i, "");
    const o = await getOffer(clip(p.id, 40)).catch(() => null);
    if (tokenOk(o, t)) await pool!.query(`UPDATE offers SET open_count=open_count+1, opened_at=COALESCE(opened_at, now()) WHERE id=$1`, [(o as Offer).id]).catch(() => {});
    reply.header("Content-Type", "image/gif").header("Cache-Control", "no-store, max-age=0");
    return reply.send(GIF);
  });

  app.get("/offer-unsub", async (req, reply) => {
    const q = (req.query || {}) as Record<string, string>;
    const o = await getOffer(clip(q.id, 40)).catch(() => null);
    reply.header("Content-Type", "text/html; charset=utf-8");
    if (!tokenOk(o, q.t)) return reply.code(404).send("<p>Link ungültig.</p>");
    await pool!.query(`UPDATE offers SET unsub_at=COALESCE(unsub_at, now()) WHERE id=$1`, [(o as Offer).id]).catch(() => {});
    const c = offerCopy((o as Offer).lang).unsubPage;
    return reply.send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.h)}</title></head><body style="margin:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;background:#f4f4f4;color:#111"><div style="max-width:440px;margin:15vh auto;background:#fff;border-radius:24px;padding:28px"><h1 style="margin:0 0 8px;font-size:24px">${esc(c.h)}</h1><p style="margin:0;color:#555;line-height:1.55">${esc(c.p)}</p></div></body></html>`);
  });

  app.post("/admin/offers", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b.token)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return { ok: true, offers: [] };
    await initOffers();
    const r = await pool.query(`SELECT id, created_at, valid_until, check_id, place_id, profile, category, addr, country, lang, email, reminders, service, amount, cur, prem, rating, reviews, source, status, mail_ok, pdf_ok, opened_at, open_count, pdf_at, clicked_at, click_count, accepted_at, order_id, r1_at, r2_at, r3_at, unsub_at FROM offers ORDER BY created_at DESC LIMIT 300`);
    return { ok: true, offers: r.rows.map((x) => ({ ...x, status: x.status === "sent" && new Date(x.valid_until).getTime() < Date.now() ? "expired" : x.status })) };
  });
}

/* ---------- Erinnerungen + Ablauf (alle 10 Min.) ---------- */
function okHour(o: Offer): boolean {
  const tz = o.country === "US" ? "America/New_York" : "Europe/Vienna";
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: tz }).format(new Date()));
  return h >= 8 && h < 19;
}
export async function offerTick(log: (o: object, m: string) => void): Promise<void> {
  if (!pool || process.env.OFFER_REMINDERS === "off") return;
  await initOffers();
  await pool.query(`UPDATE offers SET status='expired', expired_at=now() WHERE status='sent' AND valid_until < now()`);
  const base = `status='sent' AND reminders AND unsub_at IS NULL AND mail_ok IS TRUE AND valid_until > now()`;
  const due = await pool.query(
    `SELECT * FROM (SELECT *, CASE
        WHEN r1_at IS NULL AND created_at < now() - interval '24 hours' AND created_at > now() - interval '72 hours' THEN 'r1'
        WHEN r2_at IS NULL AND created_at < now() - interval '96 hours' AND created_at > now() - interval '8 days' THEN 'r2'
        WHEN r3_at IS NULL AND valid_until < now() + interval '2 days' AND created_at < now() - interval '6 days' THEN 'r3'
      END AS due_kind
     FROM offers WHERE ${base}) x WHERE due_kind IS NOT NULL ORDER BY created_at LIMIT 40`);
  for (const row of due.rows as (Offer & { due_kind: string | null })[]) {
    if (!row.due_kind || !okHour(row)) continue;
    // Bereits bestellt (ohne offerId)? Gleiche E-Mail/gleiches Profil seit dem Angebot → nicht mehr erinnern.
    const ord = await pool.query(`SELECT id FROM orders WHERE created_at > $1 AND (lower(email)=lower($2) OR ($3::text IS NOT NULL AND raw->>'placeId' = $3)) LIMIT 1`, [row.created_at, row.email, row.place_id]).catch(() => ({ rows: [] as { id: string }[] }));
    if (ord.rows.length) { await markOfferAccepted(row.id, ord.rows[0].id); continue; }
    await sendOfferMail(row, row.due_kind as "r1" | "r2" | "r3", log);
  }
}
