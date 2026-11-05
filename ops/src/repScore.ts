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
  // Scans laufen im Prozess: nach einem Neustart (Deploy) ist jeder „laufende“ Scan tot → als abgebrochen markieren
  await pool.query(`UPDATE rep_scans SET status='error', error='abgebrochen (Server-Neustart)', finished_at=now() WHERE status='running'`);
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
const PROFILE_FIELDS = ",regularOpeningHours,nationalPhoneNumber,internationalPhoneNumber,photos,businessStatus";
async function placeDetails(placeId: string, full = false): Promise<J> {
  if (!gkey()) throw new Error("GOOGLE_MAPS_API_KEY fehlt");
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=de`, {
    headers: { "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": PLACE_FIELDS + (full ? PROFILE_FIELDS : "") },
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
   let messages: J[] = [{ role: "user", content: user }];
   for (let turn = 0; turn < 4; turn++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: AbortSignal.timeout(120_000),
      headers: {
        "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01",
        ...(process.env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID.trim() } : {}),
      },
      body: JSON.stringify({
        model: MODEL(), max_tokens: opts.maxTokens || 1500, system,
        messages,
        ...(withSearch ? { tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }] } : {}),
      }),
    });
    const j = (await res.json().catch(() => ({}))) as J;
    if (!res.ok) throw new Error(j.error?.message || "Claude HTTP " + res.status);
    const content = Array.isArray(j.content) ? j.content : [];
    // Websuche kann pausieren (stop_reason „pause_turn“) → Antwort mit dem bisherigen Verlauf fortsetzen
    if (j.stop_reason === "pause_turn") { messages = [{ role: "user", content: user }, { role: "assistant", content }]; continue; }
    if (withSearch && !content.some((c: J) => c.type === "text" && c.text)) console.warn("Rep-Scan Claude-Websuche leer:", j.stop_reason, content.map((c: J) => c.type + (c.type === "web_search_tool_result" && c.content?.error_code ? ":" + c.content.error_code : "")).join(","));
    return content.filter((c: J) => c.type === "text").map((c: J) => c.text || "").join("").trim();
   }
   return "";
  };
  if (opts.search) {
    try { const t = await call(true); if (t) return t; console.warn("Rep-Scan: Claude mit Websuche ohne Text – frage ohne Suche"); }
    catch (e) { console.warn("Rep-Scan: Websuche nicht verfügbar, ohne Suche:", (e as Error).message); }
  }
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
/** Perplexity (Sonar, sucht immer im Web). Modell: PERPLEXITY_MODEL, Standard sonar. */
async function askPerplexity(prompt: string): Promise<string> {
  const key = (process.env.PERPLEXITY_API_KEY || "").trim();
  if (!key) return "";
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST", signal: AbortSignal.timeout(90_000),
      headers: { "content-type": "application/json", authorization: "Bearer " + key },
      body: JSON.stringify({ model: process.env.PERPLEXITY_MODEL || "sonar", messages: [{ role: "user", content: prompt }], max_tokens: 500 }),
    });
    const j = (await res.json().catch(() => ({}))) as J;
    if (!res.ok) { console.warn("Rep-Scan Perplexity", res.status, String(j.error?.message || j.detail || "").slice(0, 160)); return ""; }
    return String(j.choices?.[0]?.message?.content || "").replace(/\[\d+\]/g, "").trim();
  } catch (e) { console.warn("Rep-Scan Perplexity", (e as Error).message); return ""; }
}
/* Ältere Scans ohne Zusammenfassungen: aus den gespeicherten Antworten nachträglich zusammenfassen (einmalig, ohne Websuche) */
const kiBusy = new Set<string>();
const needsKiSum = (r: J | null) => !!r && !r.kiSummary && Array.isArray(r.ki) && r.ki.some((x: J) => Array.isArray(x.answers) && x.answers.some((a: J) => a.text && !a.sum));
async function backfillKiSums(scanId: string, r: J): Promise<void> {
  if (kiBusy.has(scanId) || !pool) return;
  kiBusy.add(scanId);
  try {
    const ais = (r.ki as J[]).filter((x) => Array.isArray(x.answers));
    const body = ais.map((x, i) => `### KI ${i + 1}: ${x.name}\n` + (x.answers as J[]).map((a: J, k: number) => `F${k + 1} (${a.q}): ${a.text ? String(a.text).slice(0, 900) : "(keine Antwort)"}`).join("\n")).join("\n\n");
    const t = await askClaude("Du fasst KI-Antworten über ein Unternehmen für dessen Inhaber zusammen. Sachlich, Deutsch, in EIGENEN Worten, niemals wörtlich zitieren. Aussagen, die nur von der eigenen Website stammen, nicht als Beleg werten.",
      `Unternehmen: ${r.location?.name || r.query || ""}\n\n${body}\n\nGib NUR JSON zurück: {"kiSummary":"2–3 Sätze Gesamtfazit aller KIs, Kritik zuerst","ais":[{"sum":"1 Satz Fazit dieser KI, max 20 Wörter","answers":["1 Satz je Frage F1–F5 in eigenen Worten, max 18 Wörter, leer wenn keine Antwort"]}] – ais in derselben Reihenfolge wie oben}`, { maxTokens: 2500 });
    const j = parseJson(t);
    if (!j || !j.kiSummary) { console.warn("Rep-Scan KI-Zusammenfassung: keine gültige Antwort"); return; }
    ais.forEach((x, i) => {
      const y = Array.isArray(j.ais) ? j.ais[i] || {} : {};
      if (y.sum) x.sum = String(y.sum).slice(0, 240);
      (x.answers as J[]).forEach((a: J, k: number) => { const v = Array.isArray(y.answers) ? y.answers[k] : ""; if (v && a.text) a.sum = String(v).slice(0, 220); });
    });
    r.kiSummary = String(j.kiSummary).slice(0, 600);
    await pool.query(`UPDATE rep_scans SET result=$2 WHERE id=$1`, [scanId, JSON.stringify(r)]);
    console.log("Rep-Scan KI-Zusammenfassung nachgetragen:", scanId);
  } catch (e) { console.warn("Rep-Scan KI-Zusammenfassung", (e as Error).message); }
  finally { kiBusy.delete(scanId); }
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
const PRESS = /forbes|journal|zeitung|zeitschrift|news|nachrichten|kurier|krone\.at|derstandard|diepresse|orf\.at|heute\.at|kleinezeitung|tips\.at|meinbezirk|trend\.at|gewinn\.at|leadersnet|profil\.at|falter\.at|salzburg24|vol\.at|noen\.at|bezirksblaetter|magazin|presse|wirtschaft(?!skammer)|immobilien-?(magazin|redaktion|brief)|handelsblatt|spiegel\.de|welt\.de|faz\.net|sueddeutsche|focus\.de|t-online|merkur|blick\.ch|nzz\.ch|bz-|report|kurier|businessart|economy|regional|lokal|bote|anzeiger|rundschau|tagblatt|echo\b|post\.at|online\.at\/artikel/i;
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

type Social = { net: string; url: string; followers?: string; inGoogle?: boolean | null };
type Item = { i: number; src: "google" | "bing" | "news" | "mention"; pos: number; title: string; snippet: string; link: string; date?: string; rating?: number | null; votes?: number | null; about?: string; sent?: string; type?: string; note?: string };
export type Ctx = {
  loc: J; items: Item[]; suggestions: { q: string; neg: boolean }[]; aiOverview: string | null; aiOverviewSent: string | null; aiOverviewSum?: string;
  ki: { name: string; known: boolean; sent: string; quote: string; sum?: string; answers?: { key: string; q: string; text: string; sent: string; known: boolean; quote: string; sum?: string }[] }[]; kiSummary?: string; reviews: { total: number; unanswered: number; negUnanswered: number };
  web: { url: string; perf: number | null; seo: number | null; https: boolean; title: string; desc: string; ok: boolean; metrics?: Audit["metrics"]; checks?: Check[] }; social: Social[]; kgSeen?: boolean; kiTried?: string[];
  summary: string;
};
const clamp = (v: number) => Math.max(0, Math.min(10, v));
const W = { search: 25, reviews: 20, press: 15, ki: 15, social: 10, web: 15 } as const;
type AreaKey = keyof typeof W;
type Fix = { gbp?: boolean; negPage1?: boolean; answer?: boolean; social?: boolean; web?: boolean; ki?: boolean; suggest?: boolean; gLink?: boolean };

const gbpMissing = (g: J) => [!g.website && "Website", !g.phone && "Telefonnummer", !g.hours && "Öffnungszeiten", g.photos < 8 && "Fotos"].filter(Boolean) as string[];
function gbpChecks(g: J, rv: { total: number; unanswered: number }, n: number): J[] {
  return [
    { key: "status", ok: g.status === "OPERATIONAL", label: g.status === "OPERATIONAL" ? "Als geöffnet angezeigt" : g.status === "CLOSED_TEMPORARILY" ? "Als vorübergehend geschlossen angezeigt" : "Als dauerhaft geschlossen angezeigt", detail: g.status === "OPERATIONAL" ? "Kunden sehen, dass Sie erreichbar sind." : "Kunden halten Sie für geschlossen – bitte im Profil korrigieren." },
    { key: "website", ok: !!g.website, label: "Website hinterlegt", detail: g.website ? "Kunden kommen mit einem Klick auf Ihre Seite." : "Ohne Website wirkt das Profil unvollständig." },
    { key: "phone", ok: !!g.phone, label: "Telefonnummer hinterlegt", detail: g.phone ? "Anrufen direkt aus Google möglich." : "Kunden können Sie aus Google nicht anrufen." },
    { key: "hours", ok: !!g.hours, label: "Öffnungszeiten hinterlegt", detail: g.hours ? "Kunden sehen, wann Sie erreichbar sind." : "Fehlende Öffnungszeiten kosten Vertrauen und Anfragen." },
    { key: "photos", ok: g.photos >= 8, label: g.photos >= 10 ? "10+ Fotos" : `${g.photos} ${g.photos === 1 ? "Foto" : "Fotos"}`, detail: g.photos >= 8 ? "Genug Bilder, damit Kunden sich ein Bild machen." : "Profile mit vielen Fotos bekommen deutlich mehr Klicks – Ziel: mind. 10." },
    { key: "count", ok: n >= 30, label: `${n} Bewertungen`, detail: n >= 30 ? "Genug Bewertungen, damit der Schnitt glaubwürdig ist." : "Unter 30 Bewertungen wirkt der Schnitt wenig belastbar – einzelne Ausreißer zählen stark." },
    ...(rv.total ? [{ key: "answers", ok: rv.unanswered === 0, label: rv.unanswered ? `${rv.unanswered} von ${rv.total} neuesten Bewertungen ohne Antwort` : "Alle neuesten Bewertungen beantwortet", detail: rv.unanswered ? "Antworten zeigt Kunden, dass Sie sich kümmern." : "Sehr gut – Kunden sehen, dass Sie reagieren." }] : []),
  ];
}
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
  // andere Portale nach Anzahl ihrer Bewertungen gewichten (2 Trustpilot-Bewertungen zählen nicht so viel wie 10 auf Google)
  const others = self.filter((x) => typeof x.rating === "number" && x.rating! > 0 && x.type === "review").map((x) => ({ r: x.rating as number, n: Math.max(1, Number(x.votes) || 3) }));
  const gw = Math.max(3, n);
  const avg = others.length && r ? (r * gw + others.reduce((a, b) => a + b.r * b.n, 0)) / (gw + others.reduce((a, b) => a + b.n, 0)) : r || (others.length ? others[0].r : 0);
  let reviews = r ? ((avg - 2.9) / 1.8) * 10 : 3;
  if (n < 10) reviews -= 2; else if (n < 30) reviews -= 1; else if (n >= 100) reviews += 1;
  if (!fix.answer && c.reviews.total >= 4 && c.reviews.unanswered / c.reviews.total >= 0.5) reviews -= 1;
  if (!fix.answer && c.reviews.negUnanswered > 0) reviews -= 0.5;
  const gb = c.loc.gbp as J | undefined;
  if (gb && !fix.gbp) reviews -= Math.min(1.5, 0.5 * gbpMissing(gb).length);
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
  const val = (known: boolean, sent: string) => (!known ? 4 : sent === "pos" ? 9 : sent === "neg" ? 3 : 6.5);
  const one = (k: Ctx["ki"][number]) => { const a = (k.answers || []).filter((x) => x.sent !== "none"); return a.length ? a.reduce((s2, x) => s2 + val(x.known, x.sent), 0) / a.length : val(k.known, k.sent); };
  let ki = fix.ki ? 9 : !c.ki.length ? 5 : c.ki.reduce((s, k) => s + one(k), 0) / c.ki.length;
  if (c.aiOverview) ki += c.aiOverviewSent === "neg" ? -3 : c.aiOverviewSent === "pos" ? 1 : 0;
  // Social
  const nets = new Set(c.social.map((s) => s.net));
  const ns = fix.social ? Math.max(3, nets.size) : nets.size;
  let social = ns === 0 ? 2 : ns === 1 ? 5 : ns === 2 ? 7 : 9;
  if (c.web.ok && c.social.length) social += 1;
  // Randinfo: Profile auch im Google-Profil sichtbar → kleiner Bonus (nur wenn Google das Profil gezeigt hat)
  if (c.kgSeen && c.social.length && (fix.gLink || c.social.every((x) => x.inGoogle))) social += 0.5;
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
  const gbMiss = c.loc.gbp ? gbpMissing(c.loc.gbp) : [];
  if (gbMiss.length) todos.push({ key: "gbp", title: `Google-Profil unvollständig: ${gbMiss.join(", ")} fehlen`, who: "selbst", action: "gbp", points: gain({ gbp: true }), area: "reviews", glink: c.loc.gbp.url || undefined });
  const kiBad = c.ki.filter((k) => !k.known || k.sent !== "pos");
  if (kiBad.length) todos.push({ key: "ki", title: kiBad.every((k) => !k.known) ? `${kiBad.map((k) => k.name).join(" und ")} ${kiBad.length > 1 ? "kennen" : "kennt"} Sie noch kaum` : `${kiBad.map((k) => k.name).join(" und ")} ${kiBad.length > 1 ? "antworten" : "antwortet"} nicht positiv über Sie`, who: "wir", action: "ki", points: gain({ ki: true }), area: "ki" });
  const notLinked = c.kgSeen ? c.social.filter((x) => x.inGoogle === false) : [];
  if (notLinked.length) todos.push({ key: "glink", title: `${notLinked.map((x) => x.net).join(", ")} im Google Business Profil verlinken`, who: "selbst", action: "glink", points: gain({ gLink: true }), area: "social" });
  if (new Set(c.social.map((s) => s.net)).size < 3) todos.push({ key: "social", title: c.social.length ? "Nur wenige Social-Media-Profile gefunden" : "Keine Social-Media-Profile gefunden", who: "selbst", action: "social", points: gain({ social: true }), area: "social" });
  if (c.web.url && ((c.web.perf != null && c.web.perf < 70) || (c.web.seo != null && c.web.seo < 85))) todos.push({ key: "web", title: c.web.perf != null && c.web.perf < 70 ? `Website lädt am Handy langsam (${c.web.perf}/100)` : `${(c.web.checks || []).filter((x) => !x.ok).length} SEO-Grundlagen fehlen auf Ihrer Website`, who: "wir", action: "website", points: gain({ web: true }), area: "web" });
  if (!c.web.url) todos.push({ key: "web", title: "Keine Website im Google-Profil", who: "selbst", action: "website", points: 3, area: "web" });
  const top = todos.filter((t) => t.points > 0).sort((x, y) => y.points - x.points).slice(0, 3);
  const potential = Math.min(100, score + top.reduce((s, t) => s + t.points, 0));
  const pick = (f: (x: Item) => boolean) => [...new Map(self.filter(f).map((x) => [x.link.replace(/[?#].*$/, "").replace(/\/$/, ""), x])).values()].sort((p, q) => (p.src === "google" ? 0 : 1) - (q.src === "google" ? 0 : 1) || p.pos - q.pos).slice(0, 12).map((x) => ({ title: x.title, link: x.link, src: x.src, pos: x.pos, sent: x.sent || "neu", type: x.type || "other", note: x.note || "", date: x.date || "", host: host(x.link) }));
  // Suche: ALLE Treffer von Google Seite 1–5 + Bing zeigen (auch „andere Firma“), sortiert nach Position
  const allSearch = [...new Map(c.items.filter((x) => x.src === "google" || x.src === "bing").sort((p, q) => (p.src === "google" ? 0 : 1) - (q.src === "google" ? 0 : 1) || p.pos - q.pos)
    .map((x) => [x.src + x.link.replace(/[?#].*$/, "").replace(/\/$/, ""), x])).values()].slice(0, 60)
    .map((x) => ({ title: x.title, link: x.link, src: x.src, pos: x.pos, sent: x.about === "other" ? "other" : x.sent || "neu", type: x.type || "other", note: x.note || "", date: x.date || "", host: host(x.link) }));
  const AREAS: { key: AreaKey; name: string; text: (v: number) => string; items: J[] }[] = [
    { key: "press", name: "Presse & Foren", text: () => (negP1.some((x) => x.type !== "own") ? "Ein negativer Treffer steht auf Seite 1 bei Google. Viele Kunden sehen ihn, bevor sie Kontakt aufnehmen." : "Wir prüfen Zeitungen, Online-Magazine und Foren auf Beiträge über Sie."), items: pick((x) => x.type === "press" || x.type === "forum" || x.src === "news") },
    { key: "search", name: "Google- & Bing-Suche", text: () => "Was Kunden sehen, wenn sie Ihren Namen bei Google oder Bing suchen.", items: allSearch },
    { key: "ki", name: "KI-Antworten", text: () => "Was KI-Assistenten antworten, wenn jemand nach Ihnen fragt.", items: [] },
    { key: "reviews", name: "Bewertungen", text: () => "Ihre Sterne auf Google und anderen Bewertungsplattformen.", items: pick((x) => x.type === "review") },
    { key: "social", name: "Social Media", text: () => "Ihre Profile in sozialen Netzwerken.", items: c.social.map((s) => ({ title: s.net, link: s.url, src: "web", sent: "pos", type: "social", host: host(s.url), followers: s.followers || "", inGoogle: c.kgSeen ? !!s.inGoogle : null })) },
    { key: "web", name: "Website & SEO", text: () => "Ladezeit, Technik und Auffindbarkeit Ihrer Website.", items: [] },
  ];
  // Fakten je Bereich: was geprüft wurde und was herauskam – auch wenn nichts Auffälliges gefunden wurde
  const own1 = self.find((x) => x.src === "google" && x.type === "own");
  const g1all = c.items.filter((x) => x.src === "google" && x.pos <= 10);
  const pressAll = [...new Map(self.filter((x) => x.type === "press" || x.src === "news").map((x) => [x.link, x])).values()];
  const reviewHosts = [...new Set(self.filter((x) => x.type === "review").map((x) => host(x.link)).filter((h) => h && !/google\./.test(h)))];
  const negSugs = c.suggestions.filter((x) => x.neg);
  const answered = c.ki.map((k) => k.name);
  const missing = (c.kiTried || []).filter((n) => !answered.includes(n));
  const FACTS: Record<AreaKey, { label: string; value: string; tone?: "good" | "bad" }[]> = {
    search: [
      { label: "Google Seite 1", value: `${g1all.filter((x) => x.about !== "other" && x.sent === "pos").length} positiv · ${g1all.filter((x) => x.about !== "other" && x.sent === "neg").length} negativ · ${g1all.filter((x) => x.about === "other").length} andere Firma`, tone: g1all.some((x) => x.about !== "other" && x.sent === "neg") ? "bad" : "good" },
      { label: "Eigene Website", value: own1 ? `Google Platz ${own1.pos}` : "nicht unter den ersten 50 Treffern", tone: own1 && own1.pos <= 3 ? "good" : "bad" },
      { label: "Google-Vorschläge", value: negSugs.length ? `kritisch: „${negSugs[0].q}“` : `unauffällig (${c.suggestions.length} geprüft)`, tone: negSugs.length ? "bad" : "good" },
      { label: "Geprüft", value: `${c.items.filter((x) => x.src === "google").length} Google-Treffer (Seite 1–5) · ${c.items.filter((x) => x.src === "bing").length} Bing-Treffer` },
    ],
    press: [
      { label: "Geprüft", value: "Google News, Google Seite 1–5 und Erwähnungen im ganzen Netz" },
      { label: "Artikel & Beiträge", value: pressAll.length ? `${pressAll.length} gefunden` : "keine gefunden", tone: pressAll.length ? "good" : undefined },
      { label: "Davon kritisch", value: String(pressAll.filter((x) => x.sent === "neg").length), tone: pressAll.some((x) => x.sent === "neg") ? "bad" : "good" },
    ],
    reviews: [
      { label: "Google", value: c.loc.rating ? `${String(c.loc.rating).replace(".", ",")} ★ · ${c.loc.reviews || 0} Bewertungen` : "noch keine Bewertungen", tone: Number(c.loc.rating) >= 4.3 ? "good" : Number(c.loc.rating) && Number(c.loc.rating) < 3.8 ? "bad" : undefined },
      { label: "Neueste Bewertungen", value: c.reviews.total ? `${c.reviews.total} gelesen · ${c.reviews.unanswered} ohne Antwort${c.reviews.negUnanswered ? ` (${c.reviews.negUnanswered} davon kritisch)` : ""}` : "nicht abrufbar", tone: c.reviews.total && c.reviews.unanswered / c.reviews.total >= 0.5 ? "bad" : c.reviews.total ? "good" : undefined },
      { label: "Andere Bewertungsportale", value: reviewHosts.length ? reviewHosts.slice(0, 5).join(", ") : "keine gefunden" },
    ],
    ki: [
      { label: "Gefragt", value: (c.kiTried && c.kiTried.length ? c.kiTried : answered).join(", ") + (c.aiOverview ? " + Google KI-Übersicht" : "") },
      ...(missing.length ? [{ label: "Nicht geantwortet", value: missing.join(", "), tone: "bad" as const }] : []),
    ],
    social: [
      { label: "Gefunden", value: c.social.length ? [...new Set(c.social.map((x) => x.net))].join(", ") : "keine Profile", tone: c.social.length >= 2 ? "good" : "bad" },
      { label: "Im Google-Profil", value: !c.kgSeen ? "nicht feststellbar" : c.social.length ? `${c.social.filter((x) => x.inGoogle).length} von ${c.social.length} sichtbar` : "–" },
    ],
    web: [],
  };
  const areas = AREAS.map((x) => { const s10 = Math.max(0, Math.min(10, Math.round(a[x.key] - 0.1))); return { key: x.key, name: x.name, score10: s10, status: status10(s10), text: x.text(a[x.key]), items: x.items, facts: FACTS[x.key] }; })
    .sort((p, q) => p.score10 - q.score10);
  const g1 = c.items.filter((x) => x.src === "google" && x.pos <= 10).sort((p, q) => p.pos - q.pos);
  const serp1 = g1.map((x) => ({ pos: x.pos, sent: x.about === "other" ? "other" : x.sent || "neu", title: x.title, link: x.link, host: host(x.link) }));
  const flags = negP1.length + negSug.length + (c.aiOverviewSent === "neg" ? 1 : 0);
  return {
    score, tier: tier(score), potential, areas, todos: top, serp1,
    kpis: { flags, rating: c.loc.rating, reviews: c.loc.reviews, page1Pos: serp1.filter((x) => x.sent === "pos").length, page1Total: serp1.length },
    kiSummary: c.kiSummary || "",
    ki: [...c.ki, ...(c.aiOverview ? [{ name: "Google KI-Übersicht", known: true, sent: c.aiOverviewSent || "neu", quote: "", sum: c.aiOverviewSum || "" }] : [])],
    gbp: c.loc.gbp ? { url: c.loc.gbp.url, type: c.loc.gbp.type, rating: c.loc.rating, reviews: c.loc.reviews, checks: gbpChecks(c.loc.gbp, c.reviews, Number(c.loc.reviews) || 0) } : null,
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
    items.push({ i: n++, src, pos, title: String(r.title || "").slice(0, 160), snippet: String(r.snippet || r.description || "").slice(0, 260), link, date: String(r.date || ""), rating, votes: Number(r.rich_snippet?.top?.detected_extensions?.reviews ?? r.rich_snippet?.top?.detected_extensions?.votes ?? r.reviews) || null });
  };
  // Fortschritt nie rückwärts (parallele Abfragen melden sich in beliebiger Reihenfolge)
  let pmax = 0;
  const say = (progress: number, step: string) => { pmax = Math.max(pmax, progress); return setStep(scanId, pmax, step.slice(0, 140)); };
  const short = (t: string) => (t.length > 46 ? t.slice(0, 44) + "…" : t);
  try {
    await say(4, `Lese das Google-Profil von „${short(name)}“`);
    if (loc.place_id) {
      const raw = await placeDetails(loc.place_id, true).catch(() => ({} as J));
      const p = placeView(raw);
      if (p.name) {
        loc.gbp = {
          url: p.mapsUrl || loc.maps_url || "", website: !!p.website, phone: !!(raw.nationalPhoneNumber || raw.internationalPhoneNumber),
          hours: !!(raw.regularOpeningHours && (raw.regularOpeningHours.periods || raw.regularOpeningHours.weekdayDescriptions)),
          photos: Array.isArray(raw.photos) ? raw.photos.length : 0, status: String(raw.businessStatus || "OPERATIONAL"), type: p.type,
        };
        loc.rating = p.rating; loc.reviews = p.reviews; loc.website = loc.website || p.website; loc.type = p.type;
        await pool!.query(`UPDATE rep_locations SET rating=$2, reviews=$3, website=COALESCE(NULLIF(website,''),$4) WHERE id=$1`, [loc.id, p.rating, p.reviews, p.website]);
      }
    }
    // Google Seite 1–5
    let aiOverview: string | null = null; let aiToken = "";
    await say(8, `Google-Suche nach „${short(q)}“ – Seite 1 bis ${PAGES()}`);
    let gDone = 0, gHits = 0;
    const gPage = async (pg: number): Promise<J> => {
      for (let t = 0; t < 2; t++) {
        try {
          const j = await serp({ engine: "google", q, gl, hl: "de", num: "10", start: String(pg * 10) }, 90_000);
          gDone++; gHits += Array.isArray(j.organic_results) ? j.organic_results.length : 0;
          void say(8 + gDone * 7, `Google Seite ${pg + 1} gelesen · ${gHits} Treffer bisher (${gDone} von ${PAGES()} Seiten)`);
          return j;
        }
        catch (e) { console.warn("Rep-Scan Google Seite", pg + 1, "Versuch", t + 1, (e as Error).message); }
      }
      return {};
    };
    const gPages = await Promise.all(Array.from({ length: PAGES() }, (_, pg) => gPage(pg)));
    await say(45, `${gHits} Google-Treffer zu „${short(q)}“ gesammelt`);
    for (let pg = 0; pg < PAGES(); pg++) {
      const j = gPages[pg];
      (Array.isArray(j.organic_results) ? j.organic_results : []).forEach((r: J, k: number) => add("google", pg * 10 + (Number(r.position) > 0 && Number(r.position) <= 10 ? Number(r.position) : k + 1), r));
      if (pg === 0 && j.ai_overview) {
        const ao = j.ai_overview as J;
        if (Array.isArray(ao.text_blocks)) aiOverview = ao.text_blocks.map((b: J) => b.snippet || (Array.isArray(b.list) ? b.list.map((l: J) => l.snippet || "").join(" ") : "")).join(" ").trim() || null;
        aiToken = String(ao.page_token || "");
      }
    }
    if (!aiOverview && aiToken) {
      await say(47, "Lese Googles KI-Übersicht zu Ihrem Namen");
      const j = await serp({ engine: "google_ai_overview", page_token: aiToken }).catch(() => ({} as J));
      const tb = j.ai_overview?.text_blocks;
      if (Array.isArray(tb)) aiOverview = tb.map((b: J) => b.snippet || "").join(" ").trim() || null;
    }
    await say(50, `Prüfe, was Google beim Tippen von „${short(name)}“ vorschlägt`);
    const ac = await serp({ engine: "google_autocomplete", q: name, gl, hl: "de" }).catch(() => ({} as J));
    const suggestions = (Array.isArray(ac.suggestions) ? ac.suggestions : []).slice(0, 10).map((s: J) => ({ q: String(s.value || ""), neg: NEG_WORDS.test(String(s.value || "")) })).filter((s: { q: string }) => s.q);
    const negS = suggestions.find((x: { neg: boolean }) => x.neg);
    if (negS) await say(52, `Achtung: „${short(negS.q)}“ steht in den Google-Vorschlägen`);
    await say(55, `Suche bei Bing nach „${short(q)}“`);
    const bj = await serp({ engine: "bing", q, cc: gl.toUpperCase() }).catch(() => ({} as J));
    (Array.isArray(bj.organic_results) ? bj.organic_results : []).slice(0, 10).forEach((r: J, k: number) => add("bing", k + 1, r));
    await say(60, `Durchsuche Google News nach „${short(name)}“`);
    const nj = await serp({ engine: "google_news", q: `"${name}"`, gl, hl: "de" }).catch(() => ({} as J));
    (Array.isArray(nj.news_results) ? nj.news_results : []).slice(0, 10).forEach((r: J, k: number) => add("news", k + 1, { ...r, snippet: r.snippet || r.source?.name || "" }));
    // Erwähnungen ohne Ort und ohne eigene Website: findet Presse/Magazin-Artikel, die bei „Name + Ort“ untergehen
    await say(62, `Suche Artikel und Erwähnungen über „${short(name)}“ im ganzen Netz`);
    const own0 = host(String(loc.website || ""));
    for (let pg = 0; pg < 2; pg++) {
      const mj = await serp({ engine: "google", q: `"${name}"${own0 ? " -site:" + own0 : ""}`, gl, hl: "de", num: "10", start: String(pg * 10) }).catch(() => ({} as J));
      (Array.isArray(mj.organic_results) ? mj.organic_results : []).forEach((r: J, k: number) => add("mention", pg * 10 + k + 1, r));
    }
    await say(64, `${items.filter((x) => x.src === "mention" || x.src === "news").length} Erwähnungen gefunden · lese jetzt die neuesten Google-Bewertungen`);
    const reviews = { total: 0, unanswered: 0, negUnanswered: 0 };
    if (loc.place_id) {
      const rj = await serp({ engine: "google_maps_reviews", place_id: loc.place_id, hl: "de", sort_by: "newestFirst" }).catch(() => ({} as J));
      const list = Array.isArray(rj.reviews) ? rj.reviews.slice(0, 10) : [];
      reviews.total = list.length;
      for (const r of list) { const ans = !!(r.response && (r.response.snippet || r.response.extracted_snippet)); if (!ans) { reviews.unanswered++; if (Number(r.rating) <= 2) reviews.negUnanswered++; } }
    }
    if (reviews.total) await say(67, `${reviews.total} neueste Bewertungen gelesen · ${reviews.unanswered} davon ohne Antwort`);
    const site = String(loc.website || "");
    await say(70, site ? `Lade ${host(site)} wie ein Handy im mobilen Netz und messe die Ladezeit` : "Kein Website-Link im Google-Profil – überspringe Website-Check");
    const [au, hp] = site ? await Promise.all([siteAudit(site), homepage(site)]) : [{ perf: null, seo: null, metrics: null, checks: [], finalUrl: "", html: "" } as Audit, { https: false, title: "", desc: "", social: [], ok: false }];
    if (site) await say(74, au.metrics?.lcp ? `${host(site)}: fertig geladen nach ${(au.metrics.lcp / 1000).toFixed(1).replace(".", ",")} s · prüfe ${au.checks.length} SEO-Grundlagen` : `Prüfe ${host(site)}: Titel, Beschreibung, Überschriften, Firmendaten`);
    await say(76, "Suche Facebook-, Instagram-, LinkedIn- und YouTube-Profile");
    const social: Social[] = [...hp.social];
    for (const x of items) for (const [net, re] of SOCIAL) if (!social.some((s) => s.net === net) && re.test(x.link.replace(/^https?:\/\//, "")) && x.about !== "other") social.push({ net, url: x.link });
    // Profile, die Google im Firmenprofil (Knowledge Panel, Bereich „Profile“) zeigt
    const kg = gPages[0]?.knowledge_graph as J | undefined;
    const kgLinks: string[] = (Array.isArray(kg?.profiles) ? kg!.profiles : []).map((x: J) => String(x.link || "")).filter(Boolean);
    const kgSeen = !!kg && (Array.isArray(kg.profiles) || !!kg.title);
    for (const l of kgLinks) for (const [net, re] of SOCIAL) if (re.test(l.replace(/^https?:\/\//, "")) && !social.some((s) => s.net === net)) social.push({ net, url: l });
    for (const s0 of social) {
      const re = SOCIAL.find(([n]) => n === s0.net)?.[1];
      s0.inGoogle = kgSeen ? kgLinks.some((l) => !!re && re.test(l.replace(/^https?:\/\//, ""))) : null;
      // Follower aus den Such-Snippets (z. B. „1.234 Follower“, „2,3 Tsd. Abonnenten“)
      const hit = items.find((x) => !!re && re.test(x.link.replace(/^https?:\/\//, "")) && /follower|abonnent|gefällt|likes|fans/i.test(x.snippet + " " + x.title));
      const m = hit && (hit.snippet + " " + hit.title).match(/([\d.,]+\s?(?:Tsd\.?|Mio\.?|K|M)?)\s*(Follower|Abonnent(?:en|innen)?|„Gefällt mir“-Angaben|Gefällt-mir|Likes|Fans)/i);
      if (m) s0.followers = `${m[1].trim()} ${/abonn/i.test(m[2]) ? "Abonnenten" : /gef|like|fan/i.test(m[2]) ? "Likes" : "Follower"}`;
    }
    await say(78, social.length ? `Gefunden: ${[...new Set(social.map((x) => x.net))].join(", ")} · frage jetzt ChatGPT, Claude & Perplexity` : "Frage jetzt ChatGPT, Claude & Perplexity");
    // Fester Fragenkatalog – so wie echte Kunden fragen. Jede KI bekommt jede Frage einzeln.
    const inCity = city ? ` in ${city}` : "";
    const branche = String(loc.type || "").trim() || "Anbieter";
    const QUESTIONS = [
      { key: "kennen", q: `Kennst du die Firma „${name}“${inCity}?` },
      { key: "serioes", q: `Ist „${name}“${inCity} seriös?` },
      { key: "erfahrungen", q: `Welche Erfahrungen haben Kunden mit „${name}“${inCity} gemacht?` },
      { key: "beauftragen", q: `Soll ich „${name}“${inCity} beauftragen?` },
      { key: "besser", q: `Gibt es${city ? " in der Region " + city : " in der Region"} bessere ${branche} als „${name}“?` },
    ];
    const SYS = "Du bist ein hilfreicher KI-Assistent. Antworte auf Deutsch in 2–4 Sätzen, so wie du einer Person antworten würdest, die das fragt. Nutze die Websuche, wenn du sie hast.";
    // Grundlage, falls Claudes eigene Websuche nicht liefert: echte Such-Treffer (Google, News, Erwähnungen) – keine eigene Website
    const snips = items.filter((x) => x.src !== "bing" && !(own0 && host(x.link).endsWith(own0))).slice(0, 30)
      .map((x) => `- ${x.title} (${host(x.link)})${x.snippet ? ": " + x.snippet : ""}`).join("\n");
    const askClaudeWeb = async (qq: string): Promise<string> => {
      const t = await askClaude(SYS, qq, { search: true, maxTokens: 700 }).catch((e) => { console.warn("Rep-Scan KI", e.message); return ""; });
      if (t && !/nicht live|kann .{0,30}nicht .{0,20}(nachsehen|suchen|recherchieren)|keinen (internet|web)zugriff|no (internet|web) access/i.test(t)) return t;
      return askClaude(SYS + " Dir liegen aktuelle Suchergebnisse aus dem Web vor – nutze sie wie eine Websuche, erfinde nichts dazu.", `${qq}\n\nAktuelle Suchergebnisse:\n${snips || "(keine)"}`, { maxTokens: 700 })
        .catch((e) => { console.warn("Rep-Scan KI (Suchergebnisse)", e.message); return t; });
    };
    let kiDone = 0;
    const kiTotal = QUESTIONS.length * 3;
    const told = <T,>(ai: string, x: { q: string }, pr: Promise<T>) => pr.then((v) => { kiDone++; void say(78 + Math.round((kiDone / kiTotal) * 8), `${ai} gefragt: „${short(x.q.replace(/„|“/g, ""))}“ (${kiDone} von ${kiTotal})`); return v; });
    const [claudeAns, gptAns, pplxAns] = await Promise.all([
      Promise.all(QUESTIONS.map((x) => told("Claude", x, askClaudeWeb(x.q)))),
      Promise.all(QUESTIONS.map((x) => told("ChatGPT", x, askChatGPT(x.q + " Antworte auf Deutsch in 2–4 Sätzen.")))),
      Promise.all(QUESTIONS.map((x) => told("Perplexity", x, askPerplexity(x.q + " Antworte auf Deutsch in 2–4 Sätzen.")))),
    ]);
    const kiText = claudeAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${claudeAns[i] || "(keine Antwort)"}`).join("\n\n") : "";
    const pplxText = pplxAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${pplxAns[i] || "(keine Antwort)"}`).join("\n\n") : "";
    const gptText = gptAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${gptAns[i] || "(keine Antwort)"}`).join("\n\n") : "";
    await say(86, `Ordne ${items.length} Fundstellen ein: positiv, negativ oder andere Firma`);
    const ownHost = host(site);
    const list = items.slice(0, 90).map((x) => ({ i: x.i, src: x.src, pos: x.pos, title: x.title, snippet: x.snippet, host: host(x.link) }));
    const cls = parseJson(await askClaude(
      "Du ordnest Suchtreffer für einen Reputations-Check ein. Antworte NUR mit JSON, ohne Erklärung.",
      `Unternehmen: ${name}\nOrt: ${city || "unbekannt"}\nEigene Website: ${ownHost || "keine"}\n\nSuchtreffer (JSON):\n${JSON.stringify(list)}\n\nAntworten von Claude (Fragen F1–F5):\n${kiText || "(keine)"}\n\nAntworten von ChatGPT auf dieselben Fragen:\n${gptText || "(keine)"}\n\nAntworten von Perplexity auf dieselben Fragen:\n${pplxText || "(keine)"}\n\nGoogle KI-Übersicht:\n${aiOverview || "(keine)"}\n\n` +
      `Gib zurück: {"items":[{"i":Zahl,"about":"self|other|unclear","sent":"pos|neu|neg","type":"own|press|forum|review|social|directory|other","note":"nur bei neg: kurzer Grund, max 12 Wörter"}],"ki":{"known":true|false,"sent":"pos|neu|neg","sum":"1 Satz Fazit dieser KI in eigenen Worten, max 20 Wörter","answers":[{"sent":"pos|neu|neg","known":true|false,"sum":"1 sachlicher Satz, was die KI zu dieser Frage sagt – in EIGENEN Worten zusammengefasst, max 18 Wörter, KEIN wörtliches Zitat"} – genau 5, in Reihenfolge F1–F5]},"gpt":{gleiches Format für ChatGPT},"pplx":{gleiches Format für Perplexity},"aiOverview":"pos|neu|neg|none","aiOverviewSum":"1 Satz, was die Google KI-Übersicht sagt, eigene Worte, max 20 Wörter (leer wenn keine)","kiSummary":"2–3 Sätze Gesamtfazit, was die KIs insgesamt über das Unternehmen sagen – sachlich, eigene Worte, Kritik zuerst nennen","summary":"1 Satz Gesamteindruck für den Inhaber, sachlich"}\n` +
      `Regeln: Gib für JEDEN Treffer (alle i) eine Zeile zurück. "about":"self" = der Treffer betrifft dieses Unternehmen oder erwähnt es – auch fremde Seiten wie Verzeichnisse, Presse, Social-Media-Profile, Bewertungsportale. "about":"other" NUR wenn der Treffer eindeutig ein anderes Unternehmen/eine andere Person mit ähnlichem Namen meint. Im Zweifel "self" oder "unclear". "own" = eigene Website/eigene Profile. "press" = jeder redaktionelle Beitrag über das Unternehmen: Zeitungen, Online-Magazine, Wirtschafts- und Fachmagazine (z. B. Forbes, Wirtschaftsjournal), Interviews, Berichte, Pressemitteilungen – auch wenn positiv. "neg" nur bei echter Kritik, Warnung, Beschwerde, schlechter Bewertung (<3 Sterne) oder negativer Berichterstattung über DIESES Unternehmen. Verzeichnisse/Branchenbücher = "directory", neutral. Für KI-Antworten: Aussagen, die sich nur auf die eigene Website oder Eigendarstellung des Unternehmens stützen (z. B. Kundenstimmen auf der eigenen Website), zählen NICHT als positiv → "neu". Positiv nur bei echten, unabhängigen Belegen (Bewertungen, Presse, klare Empfehlung). Sagt eine KI, sie habe keine verlässlichen Informationen oder könne nicht nachsehen → "known": false.`,
      { maxTokens: 16000 },
    ).catch((e) => { console.warn("Rep-Scan Einordnung", e.message); return ""; }));
    if (!cls) console.warn("Rep-Scan Einordnung: kein gültiges JSON – nutze einfache Regeln");
    const byI = new Map<number, J>((Array.isArray(cls?.items) ? cls!.items : []).map((x: J) => [Number(x.i), x]));
    for (const x of items) {
      const c = byI.get(x.i);
      const h = host(x.link);
      x.about = c?.about || "unclear";
      x.sent = c?.sent || (x.rating && x.rating < 3 ? "neg" : "neu");
      x.type = c?.type || (ownHost && h.endsWith(ownHost) ? "own" : SOCIALD.test(h) ? "social" : REVIEW.test(h) ? "review" : FORUM.test(h) ? "forum" : DIRS.test(h) ? "directory" : x.src === "news" || PRESS.test(h) ? "press" : "other");
      // Sicherheitsnetz: Medien-Domain, die die KI nur als „other/unclear“ eingeordnet hat → Presse
      if ((x.type === "other" || !x.type) && x.about !== "other" && (PRESS.test(h) || x.src === "news")) x.type = "press";
      if (ownHost && h.endsWith(ownHost)) x.type = "own";
      x.note = c?.note || "";
    }
    const cnt = (f: (x: Item) => boolean) => items.filter(f).length;
    console.log(`Rep-Scan ${name}: Treffer google=${cnt((x) => x.src === "google")} bing=${cnt((x) => x.src === "bing")} news=${cnt((x) => x.src === "news")} erwähnt=${cnt((x) => x.src === "mention")} · eingeordnet=${byI.size} · andere Firma=${cnt((x) => x.about === "other")} · negativ=${cnt((x) => x.sent === "neg")} · presse=${cnt((x) => x.type === "press")}`);
    const first = (t: string) => (t || "").split(/(?<=[.!?])\s/)[0] || "";
    const mk = (nm: string, raw: string[], c: J | undefined) => {
      const ans = QUESTIONS.map((x, i) => {
        const a = Array.isArray(c?.answers) ? c!.answers[i] || {} : {};
        return { key: x.key, q: x.q, text: String(raw[i] || "").slice(0, 900), sent: raw[i] ? String(a.sent || "neu") : "none", known: raw[i] ? a.known !== false : false, quote: String(a.quote || first(raw[i])).slice(0, 300), sum: String(a.sum || "").slice(0, 220) };
      });
      const kn = ans.filter((a) => a.sent !== "none");
      return { name: nm, known: c?.known !== false && kn.some((a) => a.known), sent: String(c?.sent || "neu"), quote: String((ans.find((a) => a.key === "serioes") || ans[0]).quote || ""), sum: String(c?.sum || "").slice(0, 240), answers: ans };
    };
    const ki = [
      ...(gptText ? [mk("ChatGPT", gptAns, cls?.gpt)] : []),
      ...(kiText ? [mk("Claude", claudeAns, cls?.ki)] : []),
      ...(pplxText ? [mk("Perplexity", pplxAns, cls?.pplx)] : []),
    ];
    const ctx: Ctx = {
      loc, items, suggestions, aiOverview, aiOverviewSent: aiOverview ? String(cls?.aiOverview || "neu") : null, aiOverviewSum: aiOverview ? String(cls?.aiOverviewSum || "").slice(0, 240) : "", ki, reviews,
      kiSummary: String(cls?.kiSummary || "").slice(0, 600), kgSeen, kiTried: ["ChatGPT", "Claude", "Perplexity"].filter((n) => (n === "ChatGPT" ? !!process.env.OPENAI_API_KEY : n === "Claude" ? !!process.env.ANTHROPIC_API_KEY : !!process.env.PERPLEXITY_API_KEY)), web: { url: site, perf: au.perf, seo: au.seo, https: hp.https || /^https:/i.test(au.finalUrl), title: hp.title, desc: hp.desc, ok: hp.ok || !!au.html, metrics: au.metrics, checks: au.checks }, social, summary: String(cls?.summary || ""),
    };
    await say(95, "Berechne Ihren Score aus 6 Bereichen und die besten Maßnahmen");
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
      const kiPending = !!done[0] && needsKiSum(done[0].result) && !!process.env.ANTHROPIC_API_KEY;
      if (kiPending) void backfillKiSums(done[0].id, done[0].result);
      out.push({
        id: l.id, name: l.name, address: l.address, city: l.city, website: l.website, mapsUrl: l.maps_url,
        scan: cur ? (cur.status === "running" && Date.now() - new Date(cur.created_at).getTime() > 12 * 60_000
          ? { id: cur.id, status: "error", progress: cur.progress, step: cur.step, error: "abgebrochen", at: cur.created_at }
          : { id: cur.id, status: cur.status, progress: cur.progress, step: cur.step, error: cur.error, at: cur.created_at }) : null,
        latest: done[0] ? { ...done[0].result, at: done[0].finished_at, kiPending } : null,
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
    const running = await pool!.query(`SELECT id FROM rep_scans WHERE location_id=$1 AND status='running' AND created_at > now() - interval '12 minutes'`, [loc.id]);
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
