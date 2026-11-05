/* Reputations-Score (Vorschau) — ganzheitlicher Scan eines Unternehmens.
 *
 * Nur für Konten in REP_PREVIEW_EMAILS (Standard: maximilian@hoelzl.investments).
 * Quellen: Google Places (Profil), SerpApi (Google Seite 1–5, Google-Vorschläge,
 * Bing, Google News, Google-Maps-Bewertungen, KI-Übersicht), PageSpeed Insights,
 * Startseite der Website, Claude (KI-Antwort mit Websuche + Einordnung der Treffer).
 *
 * Routen:  POST /cust/rep/state   { token }                 → Standorte + letzter Scan
 *          POST /cust/rep/search  { token, q }              → Google-Profile zur Auswahl
 *          POST /cust/rep/scan    { token, placeId | locationId } → Scan starten (läuft im Hintergrund)
 *          POST /cust/rep/request { token, locationId, action }   → Anfrage ans Team (Push)
 */
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { pool } from "./db";
import { customerSessionInfo } from "./customers";
import { notifyTeam } from "./notify";
import { withBrowserPage } from "./linkProbe";

/* eslint-disable @typescript-eslint/no-explicit-any */
type J = Record<string, any>;

const PREVIEW = () => (process.env.REP_PREVIEW_EMAILS || "maximilian@hoelzl.investments").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const enabledFor = (email: string) => PREVIEW().includes(String(email || "").trim().toLowerCase());
const gkey = () => (process.env.GOOGLE_MAPS_API_KEY || "").trim();
const skey = () => (process.env.SERPAPI_KEY || "").trim();
const SERP_BASE = () => (process.env.SERPAPI_BASE || "https://serpapi.com").replace(/\/+$/, "");
const MODEL = () => process.env.REP_MODEL || process.env.CHAT_MODEL || "claude-sonnet-5-5";
const PAGES = () => Math.min(5, Math.max(1, Number(process.env.REP_PAGES) || 5));
const id = () => crypto.randomBytes(9).toString("base64url");

/* ---------------- Datenbank ---------------- */
let ready = false;
async function init(): Promise<void> {
  if (!pool || ready) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS rep_locations (
    id text PRIMARY KEY, email text NOT NULL, name text, address text, city text, country text,
    place_id text, website text, maps_url text, rating numeric, reviews integer, created_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE TABLE IF NOT EXISTS rep_scans (
    id text PRIMARY KEY, location_id text NOT NULL, email text NOT NULL, status text NOT NULL DEFAULT 'running',
    progress integer NOT NULL DEFAULT 0, step text, score integer, result jsonb, error text,
    created_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS rep_scans_loc ON rep_scans (location_id, created_at DESC)`);
  // Abgebrochene Scans (Neustart des Servers) nicht ewig „läuft“ anzeigen
  await pool.query(`UPDATE rep_scans SET status='error', error='abgebrochen', finished_at=now() WHERE status='running' AND created_at < now() - interval '20 minutes'`);
  ready = true;
}

/* ---------------- Externe Quellen ---------------- */
async function serp(params: Record<string, string>, ms = 45_000): Promise<J> {
  if (!skey()) throw new Error("SERPAPI_KEY fehlt");
  const p = new URLSearchParams({ ...params, api_key: skey() });
  const res = await fetch(SERP_BASE() + "/search.json?" + p.toString(), { signal: AbortSignal.timeout(ms) });
  const j = (await res.json().catch(() => ({}))) as J;
  if (!res.ok || j.error) {
    // „Keine Ergebnisse“ ist kein Fehler
    if (/hasn't returned any results|no results/i.test(String(j.error || ""))) return {};
    throw new Error(String(j.error || "SerpApi HTTP " + res.status));
  }
  return j;
}

const PLACE_FIELDS = "id,displayName,formattedAddress,addressComponents,rating,userRatingCount,websiteUri,googleMapsUri,primaryTypeDisplayName";
async function placesSearch(q: string): Promise<J[]> {
  if (!gkey()) throw new Error("GOOGLE_MAPS_API_KEY fehlt");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": PLACE_FIELDS.split(",").map((f) => "places." + f).join(",") },
    body: JSON.stringify({ textQuery: q, languageCode: "de", pageSize: 6 }),
    signal: AbortSignal.timeout(10_000),
  });
  const j = (await res.json().catch(() => ({}))) as J;
  if (!res.ok) throw new Error(j.error?.message || "Places HTTP " + res.status);
  return Array.isArray(j.places) ? j.places : [];
}
async function placeDetails(placeId: string): Promise<J> {
  if (!gkey()) throw new Error("GOOGLE_MAPS_API_KEY fehlt");
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de`, {
    headers: { "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": PLACE_FIELDS },
    signal: AbortSignal.timeout(10_000),
  });
  const j = (await res.json().catch(() => ({}))) as J;
  if (!res.ok) throw new Error(j.error?.message || "Places HTTP " + res.status);
  return j;
}
const comp = (p: J, t: string) => (Array.isArray(p.addressComponents) ? p.addressComponents : []).find((x: J) => (x.types || []).includes(t));
function placeView(p: J) {
  const city = comp(p, "locality")?.longText || comp(p, "postal_town")?.longText || comp(p, "administrative_area_level_3")?.longText || comp(p, "administrative_area_level_2")?.longText || "";
  return {
    placeId: String(p.id || ""), name: String(p.displayName?.text || ""), address: String(p.formattedAddress || ""), city: String(city),
    country: String(comp(p, "country")?.shortText || "").toLowerCase(), rating: Number(p.rating) || null, reviews: Number(p.userRatingCount) || 0,
    website: String(p.websiteUri || ""), mapsUrl: String(p.googleMapsUri || ""), type: String(p.primaryTypeDisplayName?.text || ""),
  };
}

async function askClaude(system: string, user: string, opts: { search?: boolean; maxTokens?: number } = {}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY fehlt");
  const call = async (withSearch: boolean) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: AbortSignal.timeout(120_000),
      headers: {
        "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01",
        ...(process.env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID.trim() } : {}),
      },
      body: JSON.stringify({
        model: MODEL(), max_tokens: opts.maxTokens || 1500, system,
        messages: [{ role: "user", content: user }],
        ...(withSearch ? { tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }] } : {}),
      }),
    });
    const j = (await res.json().catch(() => ({}))) as J;
    if (!res.ok) throw new Error(j.error?.message || "Claude HTTP " + res.status);
    return (Array.isArray(j.content) ? j.content : []).filter((c: J) => c.type === "text").map((c: J) => c.text || "").join("").trim();
  };
  if (opts.search) { try { return await call(true); } catch (e) { console.warn("Rep-Scan: Websuche nicht verfügbar, ohne Suche:", (e as Error).message); } }
  return call(false);
}
/** ChatGPT (OpenAI Responses API, mit Websuche falls verfügbar). Modell: OPENAI_MODEL, Standard gpt-5-mini. */
async function askChatGPT(prompt: string): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || "").trim();
  if (!key) return "";
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  const tries: (J[] | null)[] = [[{ type: "web_search" }], [{ type: "web_search_preview" }], null];
  for (const tools of tries) {
    try {
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST", signal: AbortSignal.timeout(120_000),
        headers: { "content-type": "application/json", authorization: "Bearer " + key },
        body: JSON.stringify({ model, input: prompt, ...(tools ? { tools } : {}) }),
      });
      const j = (await res.json().catch(() => ({}))) as J;
      if (!res.ok) { console.warn("Rep-Scan ChatGPT", res.status, String(j.error?.message || "").slice(0, 160)); if (res.status === 401 || res.status === 429) return ""; continue; }
      if (typeof j.output_text === "string" && j.output_text.trim()) return j.output_text.trim();
      const txt = (Array.isArray(j.output) ? j.output : []).filter((o: J) => o.type === "message")
        .flatMap((o: J) => (Array.isArray(o.content) ? o.content : [])).filter((c: J) => c.type === "output_text").map((c: J) => c.text || "").join("").trim();
      if (txt) return txt;
    } catch (e) { console.warn("Rep-Scan ChatGPT", (e as Error).message); }
  }
  return "";
}
function parseJson(t: string): J | null {
  const s = t.replace(/^```(?:json)?/m, "").replace(/```\s*$/m, "");
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b < a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
}

const decode = (t: string) => t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");

/* ---------------- Website-Check (eigener Browser, kein Fremd-Kontingent) ----------------
 * Ladezeit: Seite im Handy-Modus mit gedrosselter Leitung (wie Google: ~1,6 Mbit/s, 150 ms, 4× langsamere CPU) laden,
 * Erster Inhalt (FCP), Hauptinhalt (LCP), Layout-Sprünge (CLS) und Datenmenge messen → 0–100.
 * SEO: 11 nachvollziehbare Grundlagen-Checks am fertigen HTML → Anteil erfüllt = 0–100. */
type Check = { key: string; label: string; ok: boolean; detail: string };
type Audit = { perf: number | null; seo: number | null; metrics: { fcp: number | null; lcp: number | null; cls: number | null; kb: number | null; requests: number | null } | null; checks: Check[]; finalUrl: string; html: string };
const lin = (v: number, good: number, mid: number, bad: number) => (v <= good ? 100 : v <= mid ? 100 - ((v - good) / (mid - good)) * 50 : v >= bad ? 0 : 50 - ((v - mid) / (bad - mid)) * 50);
function perfScore(m: { fcp: number | null; lcp: number | null; cls: number | null; kb: number | null }): number | null {
  const parts: [number, number][] = [];
  if (m.fcp != null) parts.push([lin(m.fcp / 1000, 1.8, 3, 6), 15]);
  if (m.lcp != null) parts.push([lin(m.lcp / 1000, 2.5, 4, 8), 40]);
  if (m.cls != null) parts.push([lin(m.cls, 0.1, 0.25, 0.5), 15]);
  if (m.kb != null) parts.push([lin(m.kb / 1024, 1.6, 4, 8), 30]);
  if (!parts.length) return null;
  const w = parts.reduce((x, [, k]) => x + k, 0);
  return Math.round(parts.reduce((x, [v, k]) => x + v * k, 0) / w);
}
function seoChecks(html: string, finalUrl: string, robotsOk: boolean | null, sitemapOk: boolean | null): Check[] {
  const h = html.slice(0, 800_000);
  const title = decode((h.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim());
  const metaC = (name: string) => decode(h.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)`, "i"))?.[1] || h.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i"))?.[1] || "").trim();
  const desc = metaC("description");
  const robots = metaC("robots").toLowerCase();
  const h1 = (h.match(/<h1[\s>]/gi) || []).length;
  const imgs = h.match(/<img\b[^>]*>/gi) || [];
  const withAlt = imgs.filter((t) => /\balt=["'][^"']+["']/i.test(t)).length;
  const ld = [...h.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(" ");
  const ldBiz = /"@type"\s*:\s*"?(\[?[^"\]]*)?(LocalBusiness|Organization|Dentist|Restaurant|Store|ProfessionalService|MedicalBusiness|RealEstateAgent|Hotel|LegalService|AutoDealer|HomeAndConstructionBusiness|[A-Za-z]+Business)/i.test(ld);
  const C = (key: string, label: string, ok: boolean, detail: string): Check => ({ key, label, ok, detail });
  const out = [
    C("https", "Sichere Verbindung (https)", /^https:/i.test(finalUrl), /^https:/i.test(finalUrl) ? "ja" : "Seite läuft ohne https"),
    C("title", "Seitentitel", title.length >= 10 && title.length <= 65, title ? `„${title.slice(0, 70)}“ (${title.length} Zeichen${title.length > 65 ? ", zu lang" : title.length < 10 ? ", zu kurz" : ""})` : "fehlt"),
    C("desc", "Beschreibung für Google", desc.length >= 50 && desc.length <= 170, desc ? `${desc.length} Zeichen${desc.length < 50 ? " – zu kurz" : desc.length > 170 ? " – zu lang" : ""}` : "fehlt – Google zeigt dann irgendeinen Text"),
    C("h1", "Hauptüberschrift (H1)", h1 >= 1, h1 ? `${h1} vorhanden` : "fehlt"),
    C("viewport", "Für Handys optimiert", /<meta[^>]+name=["']viewport["']/i.test(h), /<meta[^>]+name=["']viewport["']/i.test(h) ? "ja" : "kein Viewport-Tag"),
    C("lang", "Sprache angegeben", /<html[^>]+lang=["'][a-z]{2}/i.test(h), /<html[^>]+lang=["'][a-z]{2}/i.test(h) ? "ja" : "fehlt"),
    C("index", "Darf bei Google erscheinen", !/noindex/.test(robots), /noindex/.test(robots) ? "auf noindex gestellt!" : "ja"),
    C("canonical", "Eindeutige Adresse (Canonical)", /<link[^>]+rel=["']canonical["']/i.test(h), /<link[^>]+rel=["']canonical["']/i.test(h) ? "ja" : "fehlt"),
    C("alt", "Bildbeschreibungen", !imgs.length || withAlt / imgs.length >= 0.8, imgs.length ? `${withAlt} von ${imgs.length} Bildern beschrieben` : "keine Bilder"),
    C("schema", "Firmendaten für Google (Schema)", ldBiz, ldBiz ? "vorhanden" : "fehlt – hilft bei Google-Karte & KI-Antworten"),
    C("sitemap", "Sitemap & robots.txt", !!robotsOk && !!sitemapOk, `robots.txt ${robotsOk ? "✓" : "fehlt"} · Sitemap ${sitemapOk ? "✓" : "fehlt"}`),
  ];
  return out;
}
async function okUrl(u: string): Promise<boolean> {
  try { const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "user-agent": "Mozilla/5.0 (compatible; RapidRemoveScan/1.0)" } }); if (!r.ok) return false; const t = (await r.text()).slice(0, 2000); return !/<html/i.test(t) || /urlset|sitemapindex/i.test(t); }
  catch { return false; }
}
export async function siteAudit(url: string): Promise<Audit> {
  const origin = (() => { try { return new URL(url).origin; } catch { return ""; } })();
  const [robotsOk, sitemapOk] = origin ? await Promise.all([okUrl(origin + "/robots.txt"), okUrl(origin + "/sitemap.xml").then(async (x) => x || okUrl(origin + "/sitemap_index.xml"))]) : [null, null];
  let metrics: Audit["metrics"] = null, html = "", finalUrl = url;
  try {
    const r = await withBrowserPage(async (page) => {
      const cdp = await page.target().createCDPSession();
      await page.setUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36");
      await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      let bytes = 0, reqs = 0;
      cdp.on("Network.loadingFinished", (e: J) => { bytes += Number(e.encodedDataLength) || 0; reqs++; });
      await page.evaluateOnNewDocument(() => {
        (window as any).__lcp = 0; (window as any).__cls = 0;
        try { new PerformanceObserver((l) => { for (const e of l.getEntries()) (window as any).__lcp = (e as any).startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); } catch { /* */ }
        try { new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch { /* */ }
      });
      await page.goto(url, { waitUntil: "load", timeout: 60_000 });
      await new Promise((res) => setTimeout(res, 2500));
      const m = await page.evaluate(() => {
        const fcp = performance.getEntriesByName("first-contentful-paint")[0] as PerformanceEntry | undefined;
        return { fcp: fcp ? fcp.startTime : null, lcp: (window as any).__lcp || null, cls: Math.round(((window as any).__cls || 0) * 1000) / 1000 };
      });
      return { m, bytes, reqs, html: await page.content(), finalUrl: page.url() };
    });
    metrics = { fcp: r.m.fcp ? Math.round(r.m.fcp) : null, lcp: r.m.lcp ? Math.round(r.m.lcp || r.m.fcp) : r.m.fcp ? Math.round(r.m.fcp) : null, cls: r.m.cls, kb: r.bytes ? Math.round(r.bytes / 1024) : null, requests: r.reqs || null };
    html = r.html; finalUrl = r.finalUrl || url;
  } catch (e) {
    console.warn("Rep-Scan Website-Browser", (e as Error).message);
    try { const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15_000), headers: { "user-agent": "Mozilla/5.0 (compatible; RapidRemoveScan/1.0)" } }); html = await res.text(); finalUrl = res.url || url; } catch { /* */ }
  }
  const checks = html ? seoChecks(html, finalUrl, robotsOk, sitemapOk) : [];
  const seo = checks.length ? Math.round((checks.filter((c) => c.ok).length / checks.length) * 100) : null;
  return { perf: metrics ? perfScore(metrics) : null, seo, metrics, checks, finalUrl, html };
}

const SOCIAL: [string, RegExp][] = [
  ["Facebook", /(^|\.)facebook\.com\/(?!sharer|share|plugins|dialog|tr\b)[^/?#]+/i], ["Instagram", /(^|\.)instagram\.com\/(?!p\/|explore)[^/?#]+/i],
  ["LinkedIn", /(^|\.)linkedin\.com\/(company|in)\/[^/?#]+/i], ["YouTube", /(^|\.)youtube\.com\/(@|c\/|channel\/|user\/)[^/?#]+/i],
  ["TikTok", /(^|\.)tiktok\.com\/@[^/?#]+/i], ["X", /(^|\.)(twitter|x)\.com\/(?!intent|share|home)[^/?#]+/i],
];
async function homepage(url: string): Promise<{ https: boolean; title: string; desc: string; social: { net: string; url: string }[]; ok: boolean }> {
  const out = { https: /^https:/i.test(url), title: "", desc: "", social: [] as { net: string; url: string }[], ok: false };
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(12_000), headers: { "user-agent": "Mozilla/5.0 (compatible; RapidRemoveScan/1.0)" } });
    out.https = /^https:/i.test(res.url || url);
    const html = (await res.text()).slice(0, 600_000);
    out.ok = res.ok;
    out.title = decode((html.match(/<title[^>]*>([^<]{0,200})/i)?.[1] || "").trim());
    out.desc = decode((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,400})/i)?.[1] || "").trim());
    const links = [...html.matchAll(/href=["'](https?:\/\/[^"'#\s]+)/gi)].map((m) => m[1]);
    for (const [net, re] of SOCIAL) { const hit = links.find((l) => re.test(l.replace(/^https?:\/\//, ""))); if (hit) out.social.push({ net, url: hit }); }
  } catch { /* Website nicht erreichbar */ }
  return out;
}

/* ---------------- Auswertung ---------------- */
const NEG_WORDS = /abzock|betrug|betrüger|scam|fake|insolven|pleite|konkurs|klage|anzeige|warnung|warnt|beschwerde|skandal|polizei|gericht|schlecht|erfahrungen negativ|unseriös|kriminell|ripoff|fraud|lawsuit/i;
const FORUM = /reddit\.|gutefrage\.|forum|community|wer-weiss-was|quora\.|cosmiq|urbia\.|med1\.|forumla|board/i;
const REVIEW = /trustpilot|jameda|docfinder|herold|werkenntdenbesten|provenexpert|kununu|yelp|tripadvisor|google\.com\/maps|golocal|11880|ekomi|trusted|bewertung/i;
const SOCIALD = /facebook\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com|twitter\.com|x\.com|pinterest\./i;
const DIRS = /herold\.at|gelbeseiten|dasoertliche|firmenabc|wko\.at|firmen\.wko|cylex|meinestadt|branchenbuch|11880|northdata|firmenwissen|compnet/i;
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

type Item = { i: number; src: "google" | "bing" | "news"; pos: number; title: string; snippet: string; link: string; date?: string; rating?: number | null; about?: string; sent?: string; type?: string; note?: string };
export type Ctx = {
  loc: J; items: Item[]; suggestions: { q: string; neg: boolean }[]; aiOverview: string | null; aiOverviewSent: string | null;
  ki: { name: string; known: boolean; sent: string; quote: string }[]; reviews: { total: number; unanswered: number; negUnanswered: number };
  web: { url: string; perf: number | null; seo: number | null; https: boolean; title: string; desc: string; ok: boolean; metrics?: Audit["metrics"]; checks?: Check[] }; social: { net: string; url: string }[];
  summary: string;
};
const clamp = (v: number) => Math.max(0, Math.min(10, v));
const W = { search: 25, reviews: 20, press: 15, ki: 15, social: 10, web: 15 } as const;
type AreaKey = keyof typeof W;
type Fix = { negPage1?: boolean; answer?: boolean; social?: boolean; web?: boolean; ki?: boolean; suggest?: boolean };

function areaScores(c: Ctx, fix: Fix = {}): Record<AreaKey, number> {
  const self = c.items.filter((x) => x.about !== "other");
  const g = self.filter((x) => x.src === "google");
  const isNeg = (x: Item) => x.sent === "neg" && !(fix.negPage1 && x.pos <= 10);
  const negG1 = g.filter((x) => x.pos <= 10 && isNeg(x)).length;
  const negG2 = g.filter((x) => x.pos > 10 && isNeg(x)).length;
  const negB = self.filter((x) => x.src === "bing" && isNeg(x)).length;
  const own = g.find((x) => x.type === "own");
  const selfP1 = g.filter((x) => x.pos <= 10).length;
  const negSug = fix.suggest ? 0 : c.suggestions.filter((s) => s.neg).length;
  let search = 10 - 2.5 * negG1 - Math.min(3, 0.7 * negG2) - Math.min(2, 1 * negB) - 1.5 * negSug;
  if (!own || own.pos > 3) search -= 1.5;
  if (selfP1 < 4) search -= 1.5;
  // Bewertungen
  const r = Number(c.loc.rating) || 0, n = Number(c.loc.reviews) || 0;
  const others = self.filter((x) => typeof x.rating === "number" && x.rating! > 0 && x.type === "review").map((x) => x.rating as number);
  const avg = others.length ? (r * 2 + others.reduce((a, b) => a + b, 0)) / (2 + others.length) : r;
  let reviews = r ? ((avg - 2.9) / 1.8) * 10 : 3;
  if (n < 10) reviews -= 2; else if (n < 30) reviews -= 1; else if (n >= 100) reviews += 1;
  if (!fix.answer && c.reviews.total >= 4 && c.reviews.unanswered / c.reviews.total >= 0.5) reviews -= 1;
  if (!fix.answer && c.reviews.negUnanswered > 0) reviews -= 0.5;
  // Presse & Foren
  const pf = self.filter((x) => x.type === "press" || x.type === "forum" || x.src === "news");
  const seen = new Set<string>();
  let press = 10;
  for (const x of pf) {
    if (seen.has(x.link)) continue; seen.add(x.link);
    if (isNeg(x)) press -= x.src === "news" ? 2 : x.pos <= 10 ? 4 : 1.5;
    else if (x.sent === "pos") press += 0.5;
  }
  // KI
  const one = (k: Ctx["ki"][number]) => (!k.known ? 4 : k.sent === "pos" ? 9 : k.sent === "neg" ? 3 : 6.5);
  let ki = fix.ki ? 9 : !c.ki.length ? 5 : c.ki.reduce((s, k) => s + one(k), 0) / c.ki.length;
  if (c.aiOverview) ki += c.aiOverviewSent === "neg" ? -3 : c.aiOverviewSent === "pos" ? 1 : 0;
  // Social
  const nets = new Set(c.social.map((s) => s.net));
  const ns = fix.social ? Math.max(3, nets.size) : nets.size;
  let social = ns === 0 ? 2 : ns === 1 ? 5 : ns === 2 ? 7 : 9;
  if (c.web.ok && c.social.length) social += 1;
  // Website & SEO
  let web = 2;
  if (c.web.url) {
    const perf = fix.web ? 90 : c.web.perf ?? 70, seo = fix.web ? 95 : c.web.seo ?? 80; // nicht messbar → neutral
    web = (perf * 0.4 + seo * 0.6) / 10;
    if (!c.web.https) web -= 1;
    if (!c.web.ok) web -= 3;
    if (!own || own.pos > 10) web -= 2;
  }
  return { search: clamp(search), reviews: clamp(reviews), press: clamp(Math.min(10, press)), ki: clamp(ki), social: clamp(social), web: clamp(web) };
}
const total = (a: Record<AreaKey, number>) => Math.round((Object.keys(W) as AreaKey[]).reduce((s, k) => s + (a[k] / 10) * W[k], 0));
const tier = (s: number) => (s < 40 ? "Kritisch" : s < 60 ? "Ausbaufähig" : s < 70 ? "Gut" : s < 85 ? "Sehr gut" : "Exzellent");
const status10 = (v: number) => (v >= 8 ? "Gut" : v >= 5 ? "Mittel" : "Achtung");

export function evaluate(c: Ctx): J {
  const a = areaScores(c);
  const score = total(a);
  const self = c.items.filter((x) => x.about !== "other");
  const negP1 = self.filter((x) => x.src === "google" && x.pos <= 10 && x.sent === "neg");
  const gain = (f: Fix) => total(areaScores(c, f)) - score;
  const todos: J[] = [];
  if (negP1.length) {
    const t = negP1[0].type === "forum" ? "Forenbeitrag" : negP1[0].type === "press" ? "Artikel" : "Eintrag";
    todos.push({ key: "neg", title: negP1.length > 1 ? `${negP1.length} negative Treffer auf Seite 1` : `Negativer ${t} auf Seite 1`, who: "wir", action: "verdraengen", points: gain({ negPage1: true }), area: "press" });
  }
  const negSug = c.suggestions.filter((s) => s.neg);
  if (negSug.length) todos.push({ key: "suggest", title: `„${negSug[0].q}“ in den Google-Vorschlägen`, who: "wir", action: "vorschlag", points: gain({ suggest: true }), area: "search" });
  if (c.reviews.unanswered > 0) todos.push({ key: "answer", title: `${c.reviews.unanswered} von ${c.reviews.total} neuesten Bewertungen ohne Antwort`, who: "selbst", action: "antworten", points: gain({ answer: true }), area: "reviews" });
  const kiBad = c.ki.filter((k) => !k.known || k.sent !== "pos");
  if (kiBad.length) todos.push({ key: "ki", title: kiBad.every((k) => !k.known) ? `${kiBad.map((k) => k.name).join(" und ")} ${kiBad.length > 1 ? "kennen" : "kennt"} Sie noch kaum` : `${kiBad.map((k) => k.name).join(" und ")} ${kiBad.length > 1 ? "antworten" : "antwortet"} nicht positiv über Sie`, who: "wir", action: "ki", points: gain({ ki: true }), area: "ki" });
  if (new Set(c.social.map((s) => s.net)).size < 3) todos.push({ key: "social", title: c.social.length ? "Nur wenige Social-Media-Profile gefunden" : "Keine Social-Media-Profile gefunden", who: "selbst", action: "social", points: gain({ social: true }), area: "social" });
  if (c.web.url && ((c.web.perf != null && c.web.perf < 70) || (c.web.seo != null && c.web.seo < 85))) todos.push({ key: "web", title: c.web.perf != null && c.web.perf < 70 ? `Website lädt am Handy langsam (${c.web.perf}/100)` : `${(c.web.checks || []).filter((x) => !x.ok).length} SEO-Grundlagen fehlen auf Ihrer Website`, who: "wir", action: "website", points: gain({ web: true }), area: "web" });
  if (!c.web.url) todos.push({ key: "web", title: "Keine Website im Google-Profil", who: "selbst", action: "website", points: 3, area: "web" });
  const top = todos.filter((t) => t.points > 0).sort((x, y) => y.points - x.points).slice(0, 3);
  const potential = Math.min(100, score + top.reduce((s, t) => s + t.points, 0));
  const pick = (f: (x: Item) => boolean) => self.filter(f).slice(0, 12).map((x) => ({ title: x.title, link: x.link, src: x.src, pos: x.pos, sent: x.sent || "neu", type: x.type || "other", note: x.note || "", date: x.date || "", host: host(x.link) }));
  const AREAS: { key: AreaKey; name: string; text: (v: number) => string; items: J[] }[] = [
    { key: "press", name: "Presse & Foren", text: () => (negP1.some((x) => x.type !== "own") ? "Ein negativer Treffer steht auf Seite 1 bei Google. Viele Kunden sehen ihn, bevor sie Kontakt aufnehmen." : "Wir prüfen Zeitungen, Online-Magazine und Foren auf Beiträge über Sie."), items: pick((x) => x.type === "press" || x.type === "forum" || x.src === "news") },
    { key: "search", name: "Google- & Bing-Suche", text: () => "Was Kunden sehen, wenn sie Ihren Namen bei Google oder Bing suchen.", items: pick((x) => x.src !== "news") },
    { key: "ki", name: "KI-Antworten", text: () => "Was KI-Assistenten antworten, wenn jemand nach Ihnen fragt.", items: [] },
    { key: "reviews", name: "Bewertungen", text: () => "Ihre Sterne auf Google und anderen Bewertungsplattformen.", items: pick((x) => x.type === "review") },
    { key: "social", name: "Social Media", text: () => "Ihre Profile in sozialen Netzwerken.", items: c.social.map((s) => ({ title: s.net, link: s.url, src: "web", sent: "pos", type: "social", host: host(s.url) })) },
    { key: "web", name: "Website & SEO", text: () => "Ladezeit, Technik und Auffindbarkeit Ihrer Website.", items: [] },
  ];
  const areas = AREAS.map((x) => { const s10 = Math.max(0, Math.min(10, Math.round(a[x.key] - 0.1))); return { key: x.key, name: x.name, score10: s10, status: status10(s10), text: x.text(a[x.key]), items: x.items }; })
    .sort((p, q) => p.score10 - q.score10);
  const g1 = c.items.filter((x) => x.src === "google" && x.pos <= 10).sort((p, q) => p.pos - q.pos);
  const serp1 = g1.map((x) => ({ pos: x.pos, sent: x.about === "other" ? "other" : x.sent || "neu", title: x.title, link: x.link, host: host(x.link) }));
  const flags = negP1.length + negSug.length + (c.aiOverviewSent === "neg" ? 1 : 0);
  return {
    score, tier: tier(score), potential, areas, todos: top, serp1,
    kpis: { flags, rating: c.loc.rating, reviews: c.loc.reviews, page1Pos: serp1.filter((x) => x.sent === "pos").length, page1Total: serp1.length },
    ki: [...c.ki, ...(c.aiOverview ? [{ name: "Google KI-Übersicht", known: true, sent: c.aiOverviewSent || "neu", quote: c.aiOverview.slice(0, 400) }] : [])],
    suggestions: c.suggestions, website: c.web, social: c.social, reviewsInfo: c.reviews, summary: c.summary,
    sources: c.items.length + c.suggestions.length + c.ki.length + (c.web.url ? 2 : 0) + c.reviews.total + 1,
  };
}

/* ---------------- Scan ---------------- */
async function setStep(scanId: string, progress: number, step: string) {
  await pool!.query(`UPDATE rep_scans SET progress=$2, step=$3 WHERE id=$1`, [scanId, progress, step]).catch(() => {});
}
async function runScan(scanId: string, loc: J): Promise<void> {
  const name = String(loc.name || ""), city = String(loc.city || "");
  const gl = String(loc.country || "at") || "at";
  const q = city && !name.toLowerCase().includes(city.toLowerCase()) ? `${name} ${city}` : name;
  const items: Item[] = [];
  let n = 0;
  const add = (src: Item["src"], pos: number, r: J) => {
    const link = String(r.link || r.url || ""); if (!link) return;
    const rating = Number(r.rich_snippet?.top?.detected_extensions?.rating ?? r.rating) || null;
    items.push({ i: n++, src, pos, title: String(r.title || "").slice(0, 160), snippet: String(r.snippet || r.description || "").slice(0, 260), link, date: String(r.date || ""), rating });
  };
  try {
    await setStep(scanId, 4, "Google-Profil");
    if (loc.place_id) {
      const p = placeView(await placeDetails(loc.place_id).catch(() => ({})));
      if (p.name) {
        loc.rating = p.rating; loc.reviews = p.reviews; loc.website = loc.website || p.website;
        await pool!.query(`UPDATE rep_locations SET rating=$2, reviews=$3, website=COALESCE(NULLIF(website,''),$4) WHERE id=$1`, [loc.id, p.rating, p.reviews, p.website]);
      }
    }
    // Google Seite 1–5
    let aiOverview: string | null = null; let aiToken = "";
    for (let pg = 0; pg < PAGES(); pg++) {
      await setStep(scanId, 8 + pg * 8, `Google-Suche Seite ${pg + 1}`);
      const j = await serp({ engine: "google", q, gl, hl: "de", num: "10", start: String(pg * 10) }).catch((e) => { console.warn("Rep-Scan Google", e.message); return {} as J; });
      (Array.isArray(j.organic_results) ? j.organic_results : []).forEach((r: J, k: number) => add("google", pg * 10 + (Number(r.position) > 0 && Number(r.position) <= 10 ? Number(r.position) : k + 1), r));
      if (pg === 0 && j.ai_overview) {
        const ao = j.ai_overview as J;
        if (Array.isArray(ao.text_blocks)) aiOverview = ao.text_blocks.map((b: J) => b.snippet || (Array.isArray(b.list) ? b.list.map((l: J) => l.snippet || "").join(" ") : "")).join(" ").trim() || null;
        aiToken = String(ao.page_token || "");
      }
    }
    if (!aiOverview && aiToken) {
      const j = await serp({ engine: "google_ai_overview", page_token: aiToken }).catch(() => ({} as J));
      const tb = j.ai_overview?.text_blocks;
      if (Array.isArray(tb)) aiOverview = tb.map((b: J) => b.snippet || "").join(" ").trim() || null;
    }
    await setStep(scanId, 50, "Google-Vorschläge");
    const ac = await serp({ engine: "google_autocomplete", q: name, gl, hl: "de" }).catch(() => ({} as J));
    const suggestions = (Array.isArray(ac.suggestions) ? ac.suggestions : []).slice(0, 10).map((s: J) => ({ q: String(s.value || ""), neg: NEG_WORDS.test(String(s.value || "")) })).filter((s: { q: string }) => s.q);
    await setStep(scanId, 55, "Bing-Suche");
    const bj = await serp({ engine: "bing", q, cc: gl.toUpperCase() }).catch(() => ({} as J));
    (Array.isArray(bj.organic_results) ? bj.organic_results : []).slice(0, 10).forEach((r: J, k: number) => add("bing", k + 1, r));
    await setStep(scanId, 60, "Presse & News");
    const nj = await serp({ engine: "google_news", q: `"${name}"`, gl, hl: "de" }).catch(() => ({} as J));
    (Array.isArray(nj.news_results) ? nj.news_results : []).slice(0, 10).forEach((r: J, k: number) => add("news", k + 1, { ...r, snippet: r.snippet || r.source?.name || "" }));
    await setStep(scanId, 64, "Bewertungen");
    const reviews = { total: 0, unanswered: 0, negUnanswered: 0 };
    if (loc.place_id) {
      const rj = await serp({ engine: "google_maps_reviews", place_id: loc.place_id, hl: "de", sort_by: "newestFirst" }).catch(() => ({} as J));
      const list = Array.isArray(rj.reviews) ? rj.reviews.slice(0, 10) : [];
      reviews.total = list.length;
      for (const r of list) { const ans = !!(r.response && (r.response.snippet || r.response.extracted_snippet)); if (!ans) { reviews.unanswered++; if (Number(r.rating) <= 2) reviews.negUnanswered++; } }
    }
    await setStep(scanId, 70, "Website & SEO");
    const site = String(loc.website || "");
    const [au, hp] = site ? await Promise.all([siteAudit(site), homepage(site)]) : [{ perf: null, seo: null, metrics: null, checks: [], finalUrl: "", html: "" } as Audit, { https: false, title: "", desc: "", social: [], ok: false }];
    const social = [...hp.social];
    for (const x of items) for (const [net, re] of SOCIAL) if (!social.some((s) => s.net === net) && re.test(x.link.replace(/^https?:\/\//, "")) && x.about !== "other") social.push({ net, url: x.link });
    await setStep(scanId, 78, "KI-Antworten");
    const kiQ = `Was weißt du über „${name}“${city ? " in " + city : ""}? Würdest du das Unternehmen empfehlen?`;
    const [kiText, gptText] = await Promise.all([
      askClaude("Du bist ein hilfreicher KI-Assistent. Antworte auf Deutsch in 3–5 Sätzen, so wie du einer Person antworten würdest, die das fragt. Nutze die Websuche, wenn du sie hast.", kiQ, { search: true, maxTokens: 800 })
        .catch((e) => { console.warn("Rep-Scan KI", e.message); return ""; }),
      askChatGPT(kiQ + " Antworte auf Deutsch in 3–5 Sätzen."),
    ]);
    await setStep(scanId, 86, "Treffer einordnen");
    const ownHost = host(site);
    const list = items.slice(0, 90).map((x) => ({ i: x.i, src: x.src, pos: x.pos, title: x.title, snippet: x.snippet, host: host(x.link) }));
    const cls = parseJson(await askClaude(
      "Du ordnest Suchtreffer für einen Reputations-Check ein. Antworte NUR mit JSON, ohne Erklärung.",
      `Unternehmen: ${name}\nOrt: ${city || "unbekannt"}\nEigene Website: ${ownHost || "keine"}\n\nSuchtreffer (JSON):\n${JSON.stringify(list)}\n\nAntwort von Claude auf „Was weißt du über das Unternehmen?“:\n${kiText || "(keine)"}\n\nAntwort von ChatGPT auf dieselbe Frage:\n${gptText || "(keine)"}\n\nGoogle KI-Übersicht:\n${aiOverview || "(keine)"}\n\n` +
      `Gib zurück: {"items":[{"i":Zahl,"about":"self|other|unclear","sent":"pos|neu|neg","type":"own|press|forum|review|social|directory|other","note":"nur bei neg: kurzer Grund, max 12 Wörter"}],"ki":{"known":true|false,"sent":"pos|neu|neg","quote":"1 Satz aus der Claude-Antwort"},"gpt":{"known":true|false,"sent":"pos|neu|neg","quote":"1 Satz aus der ChatGPT-Antwort"},"aiOverview":"pos|neu|neg|none","summary":"1 Satz Gesamteindruck für den Inhaber, sachlich"}\n` +
      `Regeln: "about":"other" wenn der Treffer klar ein anderes Unternehmen/eine andere Person meint. "own" = eigene Website/eigene Profile. "neg" nur bei echter Kritik, Warnung, Beschwerde, schlechter Bewertung (<3 Sterne) oder negativer Berichterstattung über DIESES Unternehmen. Verzeichnisse/Branchenbücher = "directory", neutral.`,
      { maxTokens: 6000 },
    ).catch((e) => { console.warn("Rep-Scan Einordnung", e.message); return ""; }));
    const byI = new Map<number, J>((Array.isArray(cls?.items) ? cls!.items : []).map((x: J) => [Number(x.i), x]));
    for (const x of items) {
      const c = byI.get(x.i);
      const h = host(x.link);
      x.about = c?.about || "unclear";
      x.sent = c?.sent || (x.rating && x.rating < 3 ? "neg" : "neu");
      x.type = c?.type || (ownHost && h.endsWith(ownHost) ? "own" : SOCIALD.test(h) ? "social" : REVIEW.test(h) ? "review" : FORUM.test(h) ? "forum" : DIRS.test(h) ? "directory" : x.src === "news" ? "press" : "other");
      if (ownHost && h.endsWith(ownHost)) x.type = "own";
      x.note = c?.note || "";
    }
    const first = (t: string) => t.split(/(?<=[.!?])\s/)[0] || "";
    const ki = [
      ...(gptText ? [{ name: "ChatGPT", known: cls?.gpt?.known !== false, sent: String(cls?.gpt?.sent || "neu"), quote: String(cls?.gpt?.quote || first(gptText)).slice(0, 300) }] : []),
      ...(kiText ? [{ name: "Claude", known: cls?.ki?.known !== false, sent: String(cls?.ki?.sent || "neu"), quote: String(cls?.ki?.quote || first(kiText)).slice(0, 300) }] : []),
    ];
    const ctx: Ctx = {
      loc, items, suggestions, aiOverview, aiOverviewSent: aiOverview ? String(cls?.aiOverview || "neu") : null, ki, reviews,
      web: { url: site, perf: au.perf, seo: au.seo, https: hp.https || /^https:/i.test(au.finalUrl), title: hp.title, desc: hp.desc, ok: hp.ok || !!au.html, metrics: au.metrics, checks: au.checks }, social, summary: String(cls?.summary || ""),
    };
    await setStep(scanId, 95, "Score berechnen");
    const result: J = { ...evaluate(ctx), query: q, scannedAt: new Date().toISOString(), location: { name, city, address: loc.address, mapsUrl: loc.maps_url } };
    await pool!.query(`UPDATE rep_scans SET status='done', progress=100, step='fertig', score=$2, result=$3, finished_at=now() WHERE id=$1`, [scanId, result.score, JSON.stringify(result)]);
  } catch (e) {
    console.error("Rep-Scan fehlgeschlagen", e);
    await pool!.query(`UPDATE rep_scans SET status='error', error=$2, finished_at=now() WHERE id=$1`, [scanId, String((e as Error).message || e).slice(0, 300)]).catch(() => {});
  }
}

/* ---------------- Routen ---------------- */
export function registerRepScore(app: FastifyInstance): void {
  void init().catch((e) => app.log.error({ err: e }, "Rep-Tabellen"));
  const auth = async (b: J) => {
    const s = await customerSessionInfo(b.token);
    if (!s || !pool) return null;
    if (!enabledFor(s.email)) return { email: s.email, imp: s.imp, off: true };
    await init();
    return { email: s.email, imp: s.imp, off: false };
  };
  const locsOf = async (email: string) => {
    const r = await pool!.query(`SELECT * FROM rep_locations WHERE email=$1 ORDER BY created_at`, [email]);
    const out: J[] = [];
    for (const l of r.rows) {
      const s = await pool!.query(`SELECT id, status, progress, step, score, result, error, created_at, finished_at FROM rep_scans WHERE location_id=$1 ORDER BY created_at DESC LIMIT 24`, [l.id]);
      const done = s.rows.filter((x) => x.status === "done");
      const cur = s.rows[0] || null;
      out.push({
        id: l.id, name: l.name, address: l.address, city: l.city, website: l.website, mapsUrl: l.maps_url,
        scan: cur ? { id: cur.id, status: cur.status, progress: cur.progress, step: cur.step, error: cur.error, at: cur.created_at } : null,
        latest: done[0] ? { ...done[0].result, at: done[0].finished_at } : null,
        prevScore: done[1] ? done[1].score : null, prevAt: done[1] ? done[1].finished_at : null,
        history: done.slice().reverse().map((x) => ({ at: x.finished_at, score: x.score })),
      });
    }
    return out;
  };

  app.post("/cust/rep/state", async (req, reply) => {
    const a = await auth((req.body || {}) as J);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return { ok: true, enabled: false };
    return { ok: true, enabled: true, locations: await locsOf(a.email), keys: { places: !!gkey(), serp: !!skey(), ai: !!process.env.ANTHROPIC_API_KEY } };
  });

  app.post("/cust/rep/search", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    const q = String(b.q || "").trim().slice(0, 120);
    if (q.length < 3) return { ok: true, results: [] };
    try { return { ok: true, results: (await placesSearch(q)).map(placeView) }; }
    catch (e) { app.log.warn({ err: e }, "Rep-Suche"); return reply.code(502).send({ ok: false, error: "search" }); }
  });

  app.post("/cust/rep/scan", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    if (a.imp) return reply.code(403).send({ ok: false, error: "imp" });
    if (!skey() || !process.env.ANTHROPIC_API_KEY) return reply.code(503).send({ ok: false, error: "keys" });
    let loc: J | null = null;
    if (b.locationId) loc = (await pool!.query(`SELECT * FROM rep_locations WHERE id=$1 AND email=$2`, [String(b.locationId), a.email])).rows[0] || null;
    else if (b.placeId) {
      const ex = (await pool!.query(`SELECT * FROM rep_locations WHERE email=$1 AND place_id=$2`, [a.email, String(b.placeId)])).rows[0];
      if (ex) loc = ex;
      else {
        const p = placeView(await placeDetails(String(b.placeId)).catch(() => ({})));
        if (!p.placeId) return reply.code(400).send({ ok: false, error: "place" });
        const nid = id();
        await pool!.query(`INSERT INTO rep_locations (id, email, name, address, city, country, place_id, website, maps_url, rating, reviews) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [nid, a.email, p.name, p.address, p.city, p.country || "at", p.placeId, p.website, p.mapsUrl, p.rating, p.reviews]);
        loc = (await pool!.query(`SELECT * FROM rep_locations WHERE id=$1`, [nid])).rows[0];
      }
    }
    if (!loc) return reply.code(404).send({ ok: false, error: "location" });
    const running = await pool!.query(`SELECT id FROM rep_scans WHERE location_id=$1 AND status='running' AND created_at > now() - interval '20 minutes'`, [loc.id]);
    if (running.rowCount) return { ok: true, locationId: loc.id, scanId: running.rows[0].id };
    const sid = id();
    await pool!.query(`INSERT INTO rep_scans (id, location_id, email, status, progress, step) VALUES ($1,$2,$3,'running',1,'Start')`, [sid, loc.id, a.email]);
    void runScan(sid, loc);
    return { ok: true, locationId: loc.id, scanId: sid };
  });

  app.post("/cust/rep/request", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    const loc = b.locationId ? (await pool!.query(`SELECT name, city FROM rep_locations WHERE id=$1 AND email=$2`, [String(b.locationId), a.email])).rows[0] : null;
    const what = String(b.action || "anfrage").slice(0, 60);
    if (!a.imp) await notifyTeam("Reputation-Anfrage", `${a.email} · ${loc ? loc.name + (loc.city ? ", " + loc.city : "") : ""} · ${what}`);
    return { ok: true };
  });
}
