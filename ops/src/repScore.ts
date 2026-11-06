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
import { customerSessionInfo, loadCustomerOrders } from "./customers";
import { notifyTeam } from "./notify";
import { withBrowserPage } from "./linkProbe";
import { resolveTier } from "./priceTier";
import { profilePriceFor, PROFILE_EXPRESS_FEE, PROTECTION_PRICES, freshPriceFor } from "./reviewsPricing";

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
  await pool.query(`ALTER TABLE rep_locations ADD COLUMN IF NOT EXISTS profile jsonb, ADD COLUMN IF NOT EXISTS profile_at timestamptz, ADD COLUMN IF NOT EXISTS archived_at timestamptz, ADD COLUMN IF NOT EXISTS website_manual text`);
  // Wöchentlicher Recherche-Cache je Standort: Suchtreffer, Suchbegriffe, KI-Antworten + Einordnung
  await pool.query(`CREATE TABLE IF NOT EXISTS rep_cache (location_id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
  // Aus dem Reputations-Portal beauftragte Maßnahmen (für „In Arbeit“); Profil/Bewertungen zusätzlich als echter Auftrag (order_id)
  await pool.query(`CREATE TABLE IF NOT EXISTS rep_orders (id text PRIMARY KEY, location_id text NOT NULL, email text NOT NULL, kind text NOT NULL, detail jsonb, points integer, order_id text, created_at timestamptz NOT NULL DEFAULT now())`);
  // Abgebrochene Scans (Neustart des Servers) nicht ewig „läuft“ anzeigen
  // Scans laufen im Prozess: nach einem Neustart (Deploy) ist jeder „laufende“ Scan tot → als abgebrochen markieren
  await pool.query(`UPDATE rep_scans SET status='error', error='abgebrochen (Server-Neustart)', finished_at=now() WHERE status='running'`);
  ready = true;
}

/* ---------------- Externe Quellen ---------------- */
const GLOC: Record<string, string> = { at: "Austria", de: "Germany", ch: "Switzerland", li: "Liechtenstein", it: "Italy", lu: "Luxembourg" };
const GDOM: Record<string, string> = { at: "google.at", de: "google.de", ch: "google.ch", li: "google.li", it: "google.it", lu: "google.lu" };
/* Postgres-jsonb verträgt kein \u0000 und keine halben Unicode-Zeichen (kommen aus gelesenen Webseiten) */
const pgJson = (v: unknown) => JSON.stringify(v).replace(/\\u0000/g, "").replace(/\\ud[89ab][0-9a-f]{2}(?!\\ud[c-f][0-9a-f]{2})/gi, "").replace(/(?<!\\ud[89ab][0-9a-f]{2})\\ud[c-f][0-9a-f]{2}/gi, "");
/* Warum eine KI nicht geantwortet hat (Guthaben leer, Key ungültig …) – wird je Scan ausgewertet */
const aiErr = new Map<string, { why: string; at: number }>();
const aiErrTold = new Map<string, number>();
function noteAi(ai: string, status: number, msg: string) {
  const m = String(msg || "");
  // 429 = zu viele Anfragen bzw. Kontingent (Gemini meldet auch das Minuten-/Tageskontingent als „exceeded your current quota“) – das ist KEIN fehlendes Guthaben
  const why = status === 402 || /insufficient (funds|balance|credit)|credit balance|no credits|out of credits|payment required/i.test(m) ? "kein Guthaben"
    : status === 401 || /invalid api key|api key not valid|unauthor/i.test(m) ? "Key ungültig"
    : status === 429 && /quota/i.test(m) ? "Kontingent erschöpft"
    : status === 429 ? "Limit erreicht" : "Fehler " + status;
  aiErr.set(ai, { why, at: Date.now() });
  if (why !== "Limit erreicht" && Date.now() - (aiErrTold.get(ai) || 0) > 6 * 3600_000) { aiErrTold.set(ai, Date.now()); void notifyTeam(`${ai}: ${why}`, `Reputations-Scans: ${ai} antwortet nicht (${why}). ${m.slice(0, 140)}`).catch(() => {}); }
}
/* DataForSEO (Basic Auth: DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD) – Suchvolumen, Ranking-Keywords, Backlinks, Erwähnungen */
const dfsOn = () => !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
const DFS_LOC: Record<string, number> = { at: 2040, de: 2276, ch: 2756, li: 2438, it: 2380, lu: 2442 };
async function dfs(path: string, task: J, ms = 60_000, all = false): Promise<J | null> {
  if (!dfsOn()) return null;
  try {
    const auth = Buffer.from(`${String(process.env.DATAFORSEO_LOGIN).trim()}:${String(process.env.DATAFORSEO_PASSWORD).trim()}`).toString("base64");
    const res = await fetch(`https://api.dataforseo.com/v3/${path}`, { method: "POST", signal: AbortSignal.timeout(ms), headers: { authorization: "Basic " + auth, "content-type": "application/json" }, body: JSON.stringify([task]) });
    const j = (await res.json().catch(() => ({}))) as J;
    const t = j.tasks?.[0];
    if (!res.ok || !t || Number(t.status_code) !== 20000) { console.warn("Rep-Scan DataForSEO", path, res.status, t?.status_code, String(t?.status_message || j.status_message || "").slice(0, 160)); return null; }
    console.log("Rep-Scan DataForSEO", path, "Kosten $" + Number(t.cost || 0).toFixed(4));
    return all ? (Array.isArray(t.result) ? t.result : []) : t.result?.[0] ?? { items: [] };
  } catch (e) { console.warn("Rep-Scan DataForSEO", path, (e as Error).message); return null; }
}
/* SerpApi-Kontingent aufgebraucht → merken, Scan sauber abbrechen statt mit leeren Daten weiterzurechnen */
let serpOutAt = 0;
let serpOutTold = 0;
const QUOTA_RE = /run out of searches|out of searches|exceeded|limit reached|plan.*(limit|searches)|account.*(suspended|disabled)|invalid api key/i;
async function serp(params: Record<string, string>, ms = 45_000): Promise<J> {
  if (!skey()) throw new Error("SERPAPI_KEY fehlt");
  if (serpOutAt && Date.now() - serpOutAt < 10 * 60_000) throw new Error("SerpApi-Kontingent aufgebraucht");
  const geo = params.engine === "google" && params.gl && GDOM[params.gl] ? { ...(!params.google_domain ? { google_domain: GDOM[params.gl] } : {}), ...(!params.location && GLOC[params.gl] ? { location: GLOC[params.gl] } : {}) } : {};
  const p = new URLSearchParams({ ...geo, ...params, api_key: skey() });
  const res = await fetch(SERP_BASE() + "/search.json?" + p.toString(), { signal: AbortSignal.timeout(ms) });
  const j = (await res.json().catch(() => ({}))) as J;
  if (!res.ok || j.error) {
    // „Keine Ergebnisse“ ist kein Fehler
    if (/hasn't returned any results|no results/i.test(String(j.error || ""))) return {};
    if (res.status === 429 || res.status === 401 || QUOTA_RE.test(String(j.error || ""))) {
      serpOutAt = Date.now();
      console.error("Rep-Scan SerpApi gesperrt/aufgebraucht:", res.status, String(j.error || ""));
      if (Date.now() - serpOutTold > 6 * 3600_000) { serpOutTold = Date.now(); void notifyTeam("SerpApi aufgebraucht", `Reputations-Scans pausiert: ${String(j.error || "HTTP " + res.status).slice(0, 160)} – bitte Kontingent aufstocken.`).catch(() => {}); }
    }
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
const PROFILE_FIELDS = ",location,regularOpeningHours,nationalPhoneNumber,internationalPhoneNumber,photos,businessStatus";
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

type Src = { t: string; u: string };
const pushSrc = (sink: Src[] | undefined, u: unknown, t: unknown) => {
  if (!sink) return;
  const url = String(u || "").replace(/[?&]utm_[^&#]*/g, "").replace(/\?$/, "");
  if (!/^https?:\/\//.test(url) || sink.some((x) => x.u === url) || sink.length >= 8) return;
  sink.push({ u: url, t: String(t || "").slice(0, 160) });
};
async function askClaude(system: string, user: string, opts: { search?: boolean; maxTokens?: number; sink?: Src[] } = {}): Promise<string> {
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
    if (!res.ok) { if (withSearch === false || res.status === 401 || res.status === 402 || /credit|billing/i.test(String(j.error?.message || ""))) noteAi("Claude", res.status, String(j.error?.message || "")); throw new Error(j.error?.message || "Claude HTTP " + res.status); }
    const content = Array.isArray(j.content) ? j.content : [];
    // Websuche kann pausieren (stop_reason „pause_turn“) → Antwort mit dem bisherigen Verlauf fortsetzen
    if (j.stop_reason === "pause_turn") { messages = [{ role: "user", content: user }, { role: "assistant", content }]; continue; }
    if (withSearch && !content.some((c: J) => c.type === "text" && c.text)) console.warn("Rep-Scan Claude-Websuche leer:", j.stop_reason, content.map((c: J) => c.type + (c.type === "web_search_tool_result" && c.content?.error_code ? ":" + c.content.error_code : "")).join(","));
    for (const c of content) if (c.type === "text" && Array.isArray(c.citations)) for (const ci of c.citations) pushSrc(opts.sink, ci.url, ci.title);
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
async function askChatGPT(prompt: string, sink?: Src[]): Promise<string> {
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
      if (!res.ok) { console.warn("Rep-Scan ChatGPT", res.status, String(j.error?.message || "").slice(0, 160)); if (res.status === 401 || res.status === 429) { noteAi("ChatGPT", res.status, String(j.error?.message || "")); return ""; } continue; }
      for (const o of Array.isArray(j.output) ? j.output : []) for (const c of Array.isArray(o.content) ? o.content : []) for (const an of Array.isArray(c.annotations) ? c.annotations : []) if (an.type === "url_citation") pushSrc(sink, an.url, an.title);
      if (typeof j.output_text === "string" && j.output_text.trim()) return j.output_text.trim();
      const txt = (Array.isArray(j.output) ? j.output : []).filter((o: J) => o.type === "message")
        .flatMap((o: J) => (Array.isArray(o.content) ? o.content : [])).filter((c: J) => c.type === "output_text").map((c: J) => c.text || "").join("").trim();
      if (txt) return txt;
    } catch (e) { console.warn("Rep-Scan ChatGPT", (e as Error).message); }
  }
  return "";
}
/** Gemini mit Google-Suche (Grounding). Modell: GEMINI_MODEL, Standard gemini-flash-latest. */
/* Gemini/Perplexity: nicht alle Fragen gleichzeitig schicken (sonst 429), bei 429 kurz warten und erneut versuchen */
const lanes = new Map<string, { n: number; q: (() => void)[] }>();
async function lane<T>(name: string, max: number, fn: () => Promise<T>): Promise<T> {
  const l = lanes.get(name) || { n: 0, q: [] }; lanes.set(name, l);
  if (l.n >= max) await new Promise<void>((r) => l.q.push(r));
  l.n++;
  try { return await fn(); } finally { l.n--; const nx = l.q.shift(); if (nx) nx(); }
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function fetch429(url: string, init: RequestInit, tries = 3): Promise<Response> {
  let res = await fetch(url, init);
  for (let i = 1; i < tries && res.status === 429; i++) {
    const ra = Number(res.headers.get("retry-after")) || 0;
    await wait(Math.min(20_000, ra ? ra * 1000 : 4000 * i));
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(90_000) });
  }
  return res;
}
async function askGemini(prompt: string, sink?: Src[]): Promise<string> { return lane("gemini", Number(process.env.GEMINI_PARALLEL) || 2, () => askGemini0(prompt, sink)); }
async function askGemini0(prompt: string, sink?: Src[]): Promise<string> {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) return "";
  const models = [process.env.GEMINI_MODEL || "gemini-flash-latest", "gemini-2.5-flash"];
  for (const model of [...new Set(models)]) {
    try {
      const res = await fetch429(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", signal: AbortSignal.timeout(90_000),
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }),
      });
      const j = (await res.json().catch(() => ({}))) as J;
      if (!res.ok) { console.warn("Rep-Scan Gemini", model, res.status, String(j.error?.message || "").slice(0, 160)); if (res.status === 404) continue; noteAi("Gemini", res.status, String(j.error?.message || "")); return ""; }
      const c = j.candidates?.[0] || {};
      for (const ch of Array.isArray(c.groundingMetadata?.groundingChunks) ? c.groundingMetadata.groundingChunks : []) if (ch.web) pushSrc(sink, ch.web.uri, ch.web.title);
      return (Array.isArray(c.content?.parts) ? c.content.parts : []).map((x: J) => x.text || "").join("").trim();
    } catch (e) { console.warn("Rep-Scan Gemini", (e as Error).message); return ""; }
  }
  return "";
}
/** Perplexity (Sonar, sucht immer im Web). Modell: PERPLEXITY_MODEL, Standard sonar. */
async function askPerplexity(prompt: string, sink?: Src[]): Promise<string> { return lane("pplx", Number(process.env.PERPLEXITY_PARALLEL) || 2, () => askPerplexity0(prompt, sink)); }
async function askPerplexity0(prompt: string, sink?: Src[]): Promise<string> {
  const key = (process.env.PERPLEXITY_API_KEY || "").trim();
  if (!key) return "";
  // Perplexity hat Sonar durch die Agent-API ersetzt (/v1/responses bzw. /v1/agent)
  for (const path of ["v1/responses", "v1/agent"]) {
    try {
      const res = await fetch429(`https://api.perplexity.ai/${path}`, {
        method: "POST", signal: AbortSignal.timeout(90_000),
        headers: { "content-type": "application/json", authorization: "Bearer " + key },
        body: JSON.stringify({ input: prompt, effort: process.env.PERPLEXITY_EFFORT || "fast", ...(process.env.PERPLEXITY_MODEL ? { model: process.env.PERPLEXITY_MODEL } : {}) }),
      });
      const j = (await res.json().catch(() => ({}))) as J;
      if (res.status === 404) continue;
      if (!res.ok) { const m = String(j.error?.message || j.detail || j.message || ""); console.warn("Rep-Scan Perplexity", path, res.status, m.slice(0, 160)); noteAi("Perplexity", res.status, m); return ""; }
      const out: J[] = Array.isArray(j.output) ? j.output : [];
      for (const o of out) if (o.type === "search_results") for (const r of Array.isArray(o.results) ? o.results : []) pushSrc(sink, r.url, r.title);
      const txt = typeof j.output_text === "string" && j.output_text.trim() ? j.output_text : out.filter((o) => o.type === "message").flatMap((o) => (Array.isArray(o.content) ? o.content : [])).map((c: J) => c.text || "").join("");
      return String(txt).replace(/\[\d+\]/g, "").trim();
    } catch (e) { console.warn("Rep-Scan Perplexity", (e as Error).message); return ""; }
  }
  return "";
}
/* KI-Antworten nach Thema statt nach KI: je Thema ein Score aus allen KIs + eine gemeinsame Zusammenfassung */
const DIMS: { key: string; name: string; hint: string }[] = [
  { key: "kennen", name: "Bekanntheit", hint: "Kennen KIs Ihr Unternehmen?" },
  { key: "angebot", name: "Leistungen", hint: "Wissen KIs, was Sie anbieten?" },
  { key: "serioes", name: "Seriosität", hint: "Halten KIs Sie für seriös?" },
  { key: "erfahrungen", name: "Kundenerfahrungen", hint: "Was KIs über Erfahrungen von Kunden wissen" },
  { key: "kritik", name: "Kritik & Warnungen", hint: "Nennen KIs Kritik oder Beschwerden?" },
  { key: "rec", name: "Empfehlung", hint: "Nennen KIs Sie, wenn Kunden nach Ihrer Leistung fragen?" },
];
const kiAnsVal = (key: string, a: J) => (key === "rec" ? (!a.mentioned ? 1 : !a.rank || a.rank <= 1 ? 10 : a.rank <= 3 ? 8 : 6) : !a.known ? (key === "kennen" ? 2 : 4) : a.sent === "pos" ? 9 : a.sent === "neg" ? 3 : 6.5);
function buildDims(ki: J[], sums: J[] | undefined): J[] {
  const sm = new Map<string, string>((Array.isArray(sums) ? sums : []).map((d: J) => [String(d.key), String(d.sum || "")]));
  return DIMS.map((d) => {
    const ans = ki.flatMap((k) => (Array.isArray(k.answers) ? k.answers : []).filter((a: J) => (d.key === "rec" ? String(a.key).startsWith("rec") : a.key === d.key) && a.sent !== "none").map((a: J) => ({ ...a, ai: k.name })));
    if (!ans.length) return null;
    const score = Math.round(ans.reduce((s2: number, a: J) => s2 + kiAnsVal(d.key, a), 0) / ans.length);
    // Quellen, auf die sich die KIs bei diesem Thema stützen (mit kurzer Einordnung, worum es geht)
    const all: Src[] = [];
    for (const a of ans as J[]) for (const x of (Array.isArray(a.src) ? a.src : []) as Src[]) if (!all.some((y) => y.u === x.u)) all.push(x);
    const rf = new Map<string, J>((Array.isArray(sums) ? sums : []).filter((x: J) => x.key === d.key).flatMap((x: J) => (Array.isArray(x.refs) ? x.refs : [])).map((r: J) => [String(r.url || ""), r]));
    const refs = all.map((x) => { const r = rf.get(x.u) || {}; return { title: x.t || host(x.u), url: x.u, host: host(x.u), about: String(r.about || "").slice(0, 160), sent: String(r.sent || "neu") }; })
      .sort((p, q) => (p.sent === "neg" ? 0 : p.sent === "neu" ? 1 : 2) - (q.sent === "neg" ? 0 : q.sent === "neu" ? 1 : 2)).slice(0, 8);
    const others = d.key === "rec" ? [...ans.flatMap((a: J) => (Array.isArray(a.others) ? a.others : []) as string[]).reduce((m, v) => m.set(v, (m.get(v) || 0) + 1), new Map<string, number>()).entries()].sort((p, q) => q[1] - p[1]).slice(0, 6).map(([v]) => v) : undefined;
    const qs = d.key === "rec" ? [...new Set(ans.map((a: J) => String(a.q)))] : undefined;
    return { key: d.key, name: d.name, hint: d.hint, score, n: ans.length, others, qs, mentioned: d.key === "rec" ? ans.filter((a: J) => a.mentioned).length : undefined, ais: [...new Set(ans.map((a: J) => a.ai))], neg: ans.filter((a: J) => a.known && a.sent === "neg").length, pos: ans.filter((a: J) => a.known && a.sent === "pos").length, sum: (sm.get(d.key) || "").slice(0, 300), refs };
  }).filter(Boolean) as J[];
}
/* Zusammenfassung je Bereich (Suche, Bewertungen, Presse, Social, Website) aus den Scan-Daten */
const SUM_SYS = "Du schreibst für einen Reputations-Check kurze Zusammenfassungen für den Inhaber eines Unternehmens. Deutsch, sachlich, konkret, in eigenen Worten, niemals wörtlich zitieren, keine Floskeln, keine Werbung. Kritisches zuerst, dann Positives, dann – falls sinnvoll – was zu tun ist. Aussagen von der eigenen Website sind keine Belege. Sprich allgemein von „KI-Systemen“ (z. B. „KI-Systeme raten zu …“, „KI-Systeme kennen …“) – nie „beide KIs“, „zwei KIs“, „alle drei“ oder andere Anzahlen, und nenne keine einzelnen KI-Namen.";
function areaDigest(r: J): J {
  const pickI = (it: J[]) => (it || []).slice(0, 14).map((x: J) => ({ t: String(x.title || "").slice(0, 110), h: x.host, p: x.pos, s: x.sent, typ: x.type, n: x.note || undefined, d: x.date || undefined }));
  const out: J = {};
  for (const a of (r.areas || []) as J[]) {
    if (a.key === "ki") continue;
    const d: J = { bereich: a.name, score: a.score10 + "/10", fakten: (a.facts || []).map((f: J) => `${f.label}: ${f.value}`) };
    if (a.key === "search") { d.treffer = pickI(a.items); d.vorschlaege = (r.suggestions || []).slice(0, 8).map((x: J) => x.q + (x.neg ? " (negativ)" : "")); }
    else if (a.key === "social") d.profile = (a.items || []).map((x: J) => `${x.title}${x.followers ? " · " + x.followers : ""}${x.inGoogle === true ? " · im Google-Profil" : x.inGoogle === false ? " · nicht im Google-Profil" : ""}`);
    else if (a.key === "web") d.suchbegriffe = (r.kws || []).map((k: J) => `${k.q}: ${k.mine ? k.mine.length + " von " + (k.top || 10) + " Treffern auf Seite 1 gehören dem Unternehmen oder nennen es (" + k.mine.map((m: J) => "#" + m.p + " " + m.h).join(", ") + "); " : ""}eigene Website ${k.g ? "Platz " + k.g : "nicht in Top 30"}, Maps ${k.pack ? "Top 3 (Platz " + k.pack + ")" : k.maps ? "Platz " + k.maps : "nicht gefunden"}${k.lead ? ", Maps-Platz 1: " + k.lead : ""}`), d.website = r.website ? { url: r.website.url, ladezeit: r.website.perf, metriken: r.website.metrics, checks: (r.website.checks || []).map((c: J) => `${c.ok ? "✓" : "✕"} ${c.label}`) } : "keine Website";
    else if (a.key === "reviews") { d.googleProfil = r.gbp ? (r.gbp.checks || []).map((c: J) => `${c.ok ? "✓" : "✕"} ${c.label}`) : undefined; d.portale = pickI(a.items); }
    else d.treffer = pickI(a.items);
    out[a.key] = d;
  }
  return out;
}
async function summarizeAreas(r: J): Promise<J> {
  const dg = areaDigest(r);
  const keys = Object.keys(dg);
  if (!keys.length) return {};
  const t = await askClaude(SUM_SYS, `Unternehmen: ${r.location?.name || r.query || ""}${r.location?.city ? ", " + r.location.city : ""}\n\nScan-Daten je Bereich (JSON):\n${JSON.stringify(dg)}\n\nSchreibe je Bereich 2–3 Sätze (max 60 Wörter), die erklären, was ein Kunde dort sieht und wie es wirkt – mit konkreten Namen/Zahlen aus den Daten. Erfinde nichts.\nGib NUR JSON zurück: {${keys.map((k) => `"${k}":"…"`).join(",")}}`, { maxTokens: 2500 });
  const j = parseJson(t) || {};
  const out: J = {};
  for (const k of keys) if (j[k]) out[k] = String(j[k]).slice(0, 600);
  return out;
}
/* Ältere Scans ohne Zusammenfassungen: einmalig nachtragen (ohne Websuche) */
const kiBusy = new Set<string>();
const SUM_V = 2;
const needsKi = (r: J) => Array.isArray(r.ki) && r.ki.some((x: J) => Array.isArray(x.answers) && x.answers.some((a: J) => a.text)) && ((r.sumV || 0) < SUM_V || !r.kiSummary || !Array.isArray(r.kiDims) || !r.kiDims.some((d: J) => d.sum));
const needsAreas = (r: J) => Array.isArray(r.areas) && (!r.areaSums || (r.sumV || 0) < SUM_V);
const needsKiSum = (r: J | null) => !!r && (needsKi(r) || needsAreas(r));
async function backfillKiSums(scanId: string, r: J): Promise<void> {
  if (kiBusy.has(scanId) || !pool) return;
  kiBusy.add(scanId);
  try {
    const jobs: Promise<void>[] = [];
    if (needsKi(r)) jobs.push((async () => {
      const ais = (r.ki as J[]).filter((x) => Array.isArray(x.answers));
      const body = ais.map((x, i) => `### KI ${i + 1}: ${x.name}\n` + (x.answers as J[]).map((a: J, k: number) => `F${k + 1} [${a.key}] (${a.q}): ${a.text ? String(a.text).slice(0, 900) : "(keine Antwort)"}`).join("\n")).join("\n\n");
      const t = await askClaude(SUM_SYS, `Unternehmen: ${r.location?.name || r.query || ""}\n\nAntworten verschiedener KIs auf Kundenfragen:\n${body}\n\nGib NUR JSON zurück: {"kiSummary":"2–3 Sätze Gesamtfazit aller KIs, Kritik zuerst","dims":[{"key":"Schlüssel aus den eckigen Klammern","sum":"1–2 Sätze, was ALLE KIs zusammen zu dieser Frage sagen, max 30 Wörter"}]}`, { maxTokens: 2500 });
      const j = parseJson(t);
      if (!j) { console.warn("Rep-Scan KI-Zusammenfassung: keine gültige Antwort"); return; }
      if (j.kiSummary) r.kiSummary = String(j.kiSummary).slice(0, 600);
      r.kiDims = buildDims(r.ki, j.dims);
    })());
    if (needsAreas(r)) jobs.push(summarizeAreas(r).then((x) => { r.areaSums = x; }));
    await Promise.all(jobs.map((p) => p.catch((e) => console.warn("Rep-Scan Zusammenfassung", (e as Error).message))));
    if (!r.areaSums) r.areaSums = {};
    r.sumV = SUM_V;
    await pool.query(`UPDATE rep_scans SET result=$2 WHERE id=$1`, [scanId, pgJson(r)]);
    console.log("Rep-Scan Zusammenfassungen nachgetragen:", scanId);
  } catch (e) { console.warn("Rep-Scan Zusammenfassung", (e as Error).message); }
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
/* Recherche-Zusätze: so sucht jemand, der schon einen Anbieter im Kopf hat – nicht jemand, der einen sucht */
const RESEARCH_RE = /\b(seriös|serioes|erfahrung(en)?|bewertung(en)? (zu|von)|test|kosten|kostenlos|gratis|preis(e)?|selber|selbst|anleitung|tutorial|reddit|forum|gutefrage|wiki|definition|was ist|wie (geht|funktioniert)|job(s)?|gehalt|ausbildung|abzocke|betrug|kündigen|stornieren|login|anmelden)\b/i;
type KwHit = { p: number; u: string; h: string; t: string; k: string };
type Kw = { vol?: number; mine?: KwHit[]; top?: number; q: string; g: number | null; pack: number | null; maps: number | null; lead?: string; err?: boolean; noMaps?: boolean };
const kwOk = (k: Kw) => !k.err;
const kwVal = (k: Kw) => {
  const firstMine = k.mine && k.mine.length ? Math.min(...k.mine.map((m) => m.p)) : null;
  const best = k.g != null && firstMine != null ? Math.min(k.g, firstMine) : k.g ?? firstMine;
  const share = k.mine ? k.mine.length : 0;
  k = { ...k, g: best };
  const o0 = share >= 4 ? 10 : share >= 2 && best != null && best <= 5 ? 10 : k.g == null ? 1 : k.g <= 3 ? 10 : k.g <= 6 ? 8 : k.g <= 10 ? 6 : k.g <= 20 ? 3.5 : 2;
  if (k.noMaps) return o0;
  const o = o0;
  const l = k.pack != null ? 10 : k.maps == null ? 1 : k.maps <= 3 ? 9 : k.maps <= 10 ? 6 : 3;
  return Math.max(o, l);
};
type Audit = { src?: string; perf: number | null; seo: number | null; metrics: { fcp: number | null; lcp: number | null; cls: number | null; kb: number | null; requests: number | null } | null; checks: Check[]; finalUrl: string; html: string };
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
  // Attributwert in "…" darf ' enthalten (z. B. „we're“) und umgekehrt – sonst wird die Beschreibung beim Apostroph abgeschnitten
  const metaC = (name: string) => { const m = h.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=(?:"([^"]*)"|'([^']*)')`, "i")) || h.match(new RegExp(`<meta[^>]+content=(?:"([^"]*)"|'([^']*)')[^>]*(?:name|property)=["']${name}["']`, "i")); return decode((m?.[1] ?? m?.[2] ?? "")).trim(); };
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
/* Offizielle Google-Messung (PageSpeed Insights, Handy) – Key in PAGESPEED_API */
async function pageSpeed(url: string): Promise<{ perf: number; metrics: NonNullable<Audit["metrics"]> } | null> {
  const key = (process.env.PAGESPEED_API || process.env.PAGESPEED_API_KEY || "").trim();
  if (!key) return null;
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=${encodeURIComponent(url)}&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(90_000) });
    const j = (await res.json().catch(() => ({}))) as J;
    if (!res.ok) { console.warn("Rep-Scan PageSpeed", res.status, String(j.error?.message || "").slice(0, 140)); return null; }
    const lr = j.lighthouseResult || {}, au = lr.audits || {};
    const sc = Number(lr.categories?.performance?.score);
    if (!Number.isFinite(sc)) return null;
    const num = (k: string) => (Number.isFinite(Number(au[k]?.numericValue)) ? Math.round(Number(au[k].numericValue)) : null);
    return { perf: Math.round(sc * 100), metrics: { fcp: num("first-contentful-paint"), lcp: num("largest-contentful-paint"), cls: Number.isFinite(Number(au["cumulative-layout-shift"]?.numericValue)) ? Math.round(Number(au["cumulative-layout-shift"].numericValue) * 1000) / 1000 : null, kb: num("total-byte-weight") != null ? Math.round(num("total-byte-weight")! / 1024) : null, requests: null } };
  } catch (e) { console.warn("Rep-Scan PageSpeed", (e as Error).message); return null; }
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
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
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
  const KEEP = new Set(["https", "viewport", "index", "title", "desc", "schema"]);
  const checks = html ? seoChecks(html, finalUrl, robotsOk, sitemapOk).filter((c) => KEEP.has(c.key)) : [];
  const seo = checks.length ? Math.round((checks.filter((c) => c.ok).length / checks.length) * 100) : null;
  const ps = await pageSpeed(url);
  if (ps) return { perf: ps.perf, seo, metrics: { ...ps.metrics, kb: ps.metrics.kb ?? metrics?.kb ?? null, requests: metrics?.requests ?? null }, checks, finalUrl, html, src: "google" };
  return { perf: metrics ? perfScore(metrics) : null, seo, metrics, checks, finalUrl, html };
}

const SOCIAL: [string, RegExp][] = [
  ["Facebook", /(^|\.)facebook\.com\/(?!sharer|share|plugins|dialog|tr\b)[^/?#]+/i], ["Instagram", /(^|\.)instagram\.com\/(?!p\/|explore)[^/?#]+/i],
  ["LinkedIn", /(^|\.)linkedin\.com\/(company|in)\/[^/?#]+/i], ["YouTube", /(^|\.)youtube\.com\/(@|c\/|channel\/|user\/)[^/?#]+/i],
  ["TikTok", /(^|\.)tiktok\.com\/@[^/?#]+/i], ["X", /(^|\.)(twitter|x)\.com\/(?!intent|share|home)[^/?#]+/i],
];
/* Website des Kunden lesen: Startseite + wichtigste Unterseiten (Leistungen, Preise, Über uns, FAQ …) als reiner Text */
const htmlText = (h: string) => decode(h.replace(/&amp;/g, "&").replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|section|tr)>/gi, "\n").replace(/<[^>]+>/g, " ")).replace(/[ \t\u00a0]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
async function readSite(url: string): Promise<{ pages: { url: string; text: string }[] }> {
  const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36" };
  const get = async (u: string) => { try { const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(12_000), headers: UA }); if (!r.ok || !/html/i.test(r.headers.get("content-type") || "")) return null; return { url: r.url || u, html: (await r.text()).slice(0, 800_000) }; } catch { return null; } };
  const home = await get(url);
  if (!home) return { pages: [] };
  const base = new URL(home.url);
  const PRIO = /leistung|service|angebot|produkt|preis|kosten|paket|ueber|uber|about|team|unternehmen|faq|fragen|so-funktioniert|ablauf|warum|referenz|branchen|loesung|solution|pricing|how/i;
  const SKIP = /impressum|datenschutz|privacy|agb|terms|cookie|login|warenkorb|cart|checkout|widerruf|\.(pdf|jpe?g|png|gif|webp|svg|ico|css|js|woff2?|xml|zip)(\?|$)|\/_next\/|\/assets?\/|\/wp-(content|includes|json)\/|\?|#|mailto:|tel:|\/tag\/|\/category\//i;
  const links = [...new Set([...home.html.matchAll(/href=["']([^"'#\s]+)/gi)].map((m) => { try { return new URL(m[1], base).toString().replace(/\/$/, ""); } catch { return ""; } })
    .filter((u) => u && host(u) === host(base.toString()) && u !== base.toString().replace(/\/$/, "") && !SKIP.test(u) && !/^\/[a-z]{2}(-[a-z]{2})?$/i.test(new URL(u).pathname)))];
  const pick = [...links.filter((u) => PRIO.test(new URL(u).pathname)), ...links.filter((u) => !PRIO.test(new URL(u).pathname))].slice(0, 7);
  const sub = (await Promise.all(pick.map(get))).filter(Boolean) as { url: string; html: string }[];
  // Menü/Fußzeile, die auf jeder Seite steht, nur einmal (auf der Startseite) behalten
  const homeLines = new Set(htmlText(home.html).split("\n").map((l) => l.trim()).filter(Boolean));
  const clean = (p: { url: string; html: string }, i: number) => { const t = htmlText(p.html); return i === 0 ? t : t.split("\n").filter((l) => !homeLines.has(l.trim())).join("\n"); };
  return { pages: [home, ...sub].map((p, i) => ({ url: p.url, text: clean(p, i).slice(0, 6000) })).filter((p) => p.text.length > 80) };
}
/* Treffer wirklich lesen: Seite abrufen und prüfen, ob sie das Unternehmen nennt, verlinkt oder ihm gehört */
type Hit = { k: "own" | "channel" | "links" | "names" | "none" | "blocked"; ex?: string };
function makeChecker(brand: string[], ownHost: string) {
  const memo = new Map<string, Promise<Hit>>();
  const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Safari/537.36", "accept-language": "de-AT,de;q=0.9,en;q=0.6" };
  const names = brand.filter((b) => b.length >= 4).map((b) => b.toLowerCase());
  let active = 0; const queue: (() => void)[] = [];
  const slot = async <T,>(fn: () => Promise<T>): Promise<T> => { if (active >= 10) await new Promise<void>((r) => queue.push(r)); active++; try { return await fn(); } finally { active--; queue.shift()?.(); } };
  const check = (url: string): Promise<Hit> => {
    const key = url.replace(/[#?].*$/, "");
    if (memo.has(key)) return memo.get(key)!;
    const pr = slot(async (): Promise<Hit> => {
      const h = host(url);
      if (ownHost && h.endsWith(ownHost)) return { k: "own" };
      try {
        const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(9000), headers: /youtube\.com|youtu\.be/.test(h) ? { ...UA, cookie: "SOCS=CAI; CONSENT=YES+1" } : UA });
        if (!r.ok) return { k: "blocked" };
        const html = (await r.text()).slice(0, 1_500_000);
        const low = html.toLowerCase();
        if (/youtube\.com|youtu\.be/.test(h)) {
          // Kanalname zuverlässig über oEmbed (die Videoseite zeigt oft nur ein Cookie-Banner)
          const oe = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(6000) }).then((x) => (x.ok ? x.json() : null)).catch(() => null) as J | null;
          const an = String(oe?.author_name || "").toLowerCase();
          if (an && names.some((n) => an.replace(/\s+/g, "").includes(n.replace(/\s+/g, "")))) return { k: "channel", ex: `YouTube-Kanal: ${oe!.author_name} – ${String(oe!.title || "")}` };
        }
        if (/youtube\.com|youtu\.be/.test(h)) {
          const ch = (html.match(/"ownerChannelName":"([^"]+)"/)?.[1] || html.match(/<link itemprop="name" content="([^"]+)"/)?.[1] || "").toLowerCase();
          if (ch && names.some((n) => ch.includes(n) || n.includes(ch))) return { k: "channel", ex: `YouTube-Kanal: ${ch}` };
        }
        const linked = !!ownHost && new RegExp(`href=["'][^"']*${ownHost.replace(/\./g, "\\.")}`, "i").test(html);
        const text = htmlText(html);
        const tl = text.toLowerCase();
        const at = names.map((n) => tl.indexOf(n)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? -1;
        const ex = at >= 0 ? text.slice(Math.max(0, at - 160), at + 200).replace(/\s+/g, " ").trim() : undefined;
        if (linked) return { k: "links", ex };
        if (at >= 0 || (ownHost && low.includes(ownHost)) || names.some((n) => low.includes(n))) return { k: "names", ex };
        return { k: "none" };
      } catch { return { k: "blocked" }; }
    });
    memo.set(key, pr);
    return pr;
  };
  return { check, memo };
}
const PROFILE_V = 2;
/* nur Fragen behalten, die zu einer angebotenen Leistung gehören und keine ausgeschlossene berühren */
function recOk(j: J): string[] {
  const services = (Array.isArray(j.services) ? j.services : []).map((x: unknown) => String(x).toLowerCase());
  const no = (Array.isArray(j.notOffered) ? j.notOffered : []).map((x: unknown) => String(x).toLowerCase());
  const words = (t: string) => t.split(/[^a-zäöüß0-9]+/).filter((w) => w.length >= 6).map((w) => w.slice(0, 7));
  const noWords = new Set(no.flatMap(words));
  const svcWords = new Set(services.flatMap(words));
  const out: string[] = [];
  for (const r of Array.isArray(j.recQuestions) ? j.recQuestions : []) {
    const q = String(typeof r === "string" ? r : r?.q || "").trim();
    const sv = String(typeof r === "string" ? "" : r?.service || "").toLowerCase();
    if (!q) continue;
    const qw = words(q.toLowerCase());
    const hitsNo = qw.filter((w) => noWords.has(w) && !svcWords.has(w)).length;
    if (hitsNo > 0) continue;
    if (sv && services.length && !services.some((s2) => s2.includes(sv.slice(0, 12)) || sv.includes(s2.slice(0, 12)))) continue;
    out.push(q);
  }
  return out.slice(0, 3);
}
type Profile = { pv?: number; summary: string; services: string[]; notOffered: string[]; customers: string; reach: string; countries: string[]; usp: string[]; recQuestions: string[]; pages: number };
async function buildProfile(fullName: string, loc: J, city: string, site: string): Promise<Profile | null> {
  const rs = site ? await readSite(site) : { pages: [] };
  const web = rs.pages.map((p) => `### ${p.url}\n${p.text}`).join("\n\n").slice(0, 32_000);
  const t = await askClaude("Du analysierst Unternehmen für einen Reputations-Check. Antworte NUR mit JSON. Erfinde nichts – nur was auf der Website steht bzw. aus Kategorie und Ort klar ist.",
    `Unternehmen: ${fullName}\nGoogle-Kategorie: ${loc.type || "?"}\nStandort: ${[city, loc.address].filter(Boolean).join(", ") || "?"}\n\nWebsite-Inhalte:\n${web || "(keine Website lesbar)"}\n\n` +
    `Erstelle einen Steckbrief:\n{"summary":"2 Sätze: was das Unternehmen konkret macht und für wen","services":["konkrete angebotene Leistungen, max 8, kurz"],"notOffered":["Leistungen, die die Website ausdrücklich NICHT oder nur eingeschränkt anbietet, inkl. Einschränkung (z. B. „Bewertungslöschung – nicht im DACH-Raum“); leer, wenn nichts erwähnt"],"customers":"Zielkunden, kurz","reach":"lokal|regional|ueberregional|international","countries":["ISO-Ländercodes, in denen aktiv angeboten wird, z. B. AT, DE, CH"],"usp":["max 4 Besonderheiten, z. B. Festpreis, Garantie"],"recQuestions":[{"q":"Frage","service":"exakt eine der Leistungen aus services, um die es geht"} – 3 Stück; NUR zu angebotenen Leistungen (services), NIE zu notOffered. Fragen, wie ein echter potenzieller Kunde eine KI (ChatGPT) nach genau dieser Leistung fragen würde – OHNE den Firmennamen, natürlich formuliert, z. B. „Welche Firma kann mein Google-Unternehmensprofil dauerhaft löschen?“; bei lokalen/regionalen Firmen mit Ort/Region, bei überregionalen ohne"]}\n` +
    `reach: "lokal" = Kunden aus Ort und Umgebung (Restaurant, Friseur, Arzt), "regional" = Bundesland/Großraum (Bauträger, Makler, Kanzlei), "ueberregional" = ganzes Land/DACH oder online, "international" = mehrere Länder/weltweit.`, { maxTokens: 1500 }).catch(() => "");
  const j = parseJson(t);
  if (!j || !j.summary) return null;
  // Gegenprüfung: Kundenfragen, die eine ausgeschlossene Leistung betreffen, fliegen raus
  if (Array.isArray(j.recQuestions) && j.recQuestions.length && Array.isArray(j.notOffered) && j.notOffered.length) {
    const qs = j.recQuestions.map((r: J) => String(typeof r === "string" ? r : r?.q || ""));
    const v = parseJson(await askClaude("Antworte NUR mit JSON.", `Angebotene Leistungen: ${(j.services || []).join("; ")}\nNICHT angeboten: ${j.notOffered.join("; ")}\n\nFragen:\n${qs.map((q: string, i: number) => `${i}: ${q}`).join("\n")}\n\nWelche Fragen betreffen ausschließlich angebotene Leistungen und nichts aus „NICHT angeboten“ (auch nicht teilweise, z. B. Bewertungen löschen, wenn das ausgeschlossen ist)? {"keep":[Indizes]}`, { maxTokens: 200 }).catch(() => ""));
    if (v && Array.isArray(v.keep)) j.recQuestions = j.recQuestions.filter((_: unknown, i: number) => v.keep.map(Number).includes(i));
  }
  const arr = (x: unknown, n: number) => (Array.isArray(x) ? x : []).map((v) => String(v).trim()).filter(Boolean).slice(0, n);
  return { summary: String(j.summary).slice(0, 400), services: arr(j.services, 8), notOffered: arr(j.notOffered, 6), customers: String(j.customers || "").slice(0, 160), reach: /^(lokal|regional|ueberregional|international)$/.test(String(j.reach)) ? String(j.reach) : "lokal", countries: arr(j.countries, 12).map((c) => c.toUpperCase().slice(0, 2)), usp: arr(j.usp, 4), recQuestions: recOk(j), pages: rs.pages.length, pv: PROFILE_V };
}
async function homepage(url: string): Promise<{ https: boolean; title: string; desc: string; social: { net: string; url: string }[]; ok: boolean }> {
  const out = { https: /^https:/i.test(url), title: "", desc: "", social: [] as { net: string; url: string }[], ok: false };
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(12_000), headers: { "user-agent": "Mozilla/5.0 (compatible; RapidRemoveScan/1.0)" } });
    out.https = /^https:/i.test(res.url || url);
    const html = (await res.text()).slice(0, 600_000);
    out.ok = res.ok;
    out.title = decode((html.match(/<title[^>]*>([^<]{0,200})/i)?.[1] || "").trim());
    { const dm = html.match(/<meta[^>]+name=["']description["'][^>]+content=(?:"([^"]{0,400})|'([^']{0,400}))/i); out.desc = decode((dm?.[1] ?? dm?.[2] ?? "").trim()); }
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
type Item = { senti?: string; i: number; src: "google" | "bing" | "news" | "mention" | "link" | "web"; pos: number; title: string; snippet: string; link: string; date?: string; rating?: number | null; votes?: number | null; about?: string; sent?: string; type?: string; note?: string };
export type Ctx = {
  loc: J; items: Item[]; suggestions: { q: string; neg: boolean }[]; aiOverview: string | null; aiOverviewSent: string | null; aiOverviewSum?: string;
  ki: { name: string; known: boolean; sent: string; quote: string; sum?: string; answers?: { key: string; q: string; text: string; sent: string; known: boolean; quote: string; sum?: string; src?: Src[] }[] }[]; kiSummary?: string; reviews: { total: number; unanswered: number; negUnanswered: number; neg?: number; list?: J[] }; tier?: J | null;
  kiWhy?: Record<string, string>; kws?: Kw[]; backlinks?: { rank: number; domains: number; links: number } | null;
  web: { fromGbp?: boolean; via?: string; url: string; perf: number | null; seo: number | null; https: boolean; title: string; desc: string; ok: boolean; metrics?: Audit["metrics"]; checks?: Check[] }; social: Social[]; kgSeen?: boolean; kiTried?: string[];
  summary: string;
};
const clamp = (v: number) => Math.max(0, Math.min(10, v));
const W = { search: 30, reviews: 20, press: 15, ki: 15, social: 10, web: 10 } as const;
type AreaKey = keyof typeof W;
type Fix = { rank?: boolean; gbp?: boolean; negPage1?: boolean; answer?: boolean; social?: boolean; web?: boolean; ki?: boolean; suggest?: boolean; gLink?: boolean; revOverride?: number };

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
  if (fix.revOverride != null) reviews = fix.revOverride;
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
  const one = (k: Ctx["ki"][number]) => { const a = (k.answers || []).filter((x) => x.sent !== "none"); return a.length ? a.reduce((s2, x) => s2 + (x.key.startsWith("rec") ? kiAnsVal("rec", x as J) : val(x.known, x.sent)), 0) / a.length : val(k.known, k.sent); };
  let ki = fix.ki ? 9 : !c.ki.length ? 5 : c.ki.reduce((s, k) => s + one(k), 0) / c.ki.length;
  // Aus den Themen rechnen: Kritik und Kundenerfahrungen zählen am meisten, das schwächste Thema deckelt den Wert
  const dims = fix.ki ? [] : buildDims(c.ki as unknown as J[], undefined);
  if (dims.length) {
    const DW: Record<string, number> = { kritik: 2.5, erfahrungen: 2.5, serioes: 2, rec: 1.5, kennen: 1, angebot: 0.5 };
    const wsum = dims.reduce((a2, d) => a2 + (DW[d.key] || 1), 0);
    ki = dims.reduce((a2, d) => a2 + Number(d.score) * (DW[d.key] || 1), 0) / wsum;
    const worst = Math.min(...dims.filter((d) => d.key !== "angebot").map((d) => Number(d.score)));
    if (worst <= 2) ki = Math.min(ki, 5); else if (worst <= 3) ki = Math.min(ki, 6); else if (worst <= 4) ki = Math.min(ki, 7);
  }
  if (c.aiOverview && c.aiOverviewSent === "neg") ki -= 2;
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
    if (c.web.fromGbp === false && !fix.web) web -= 1.5;
  }
  // Ranking bei Suchbegriffen ohne Firmennamen zählt am meisten
  const kOk = (c.kws || []).filter(kwOk);
  if (kOk.length) {
    const wt = (k: Kw) => (k.vol != null ? Math.log10(k.vol + 10) : 1.5);
    const rank = fix.rank ? 9 : kOk.reduce((s2, k) => s2 + kwVal(k) * wt(k), 0) / kOk.reduce((s2, k) => s2 + wt(k), 0);
    web = rank * 0.7 + Math.max(0, web) * 0.3;
  }
  return { search: clamp(search), reviews: clamp(reviews), press: clamp(Math.min(10, press)), ki: clamp(ki), social: clamp(social), web: clamp(web) };
}
const total = (a: Record<AreaKey, number>) => Math.round((Object.keys(W) as AreaKey[]).reduce((s, k) => s + (a[k] / 10) * W[k], 0));
const tier = (s: number) => (s < 40 ? "Kritisch" : s < 60 ? "Ausbaufähig" : s < 70 ? "Gut" : s < 85 ? "Sehr gut" : "Exzellent");
const status10 = (v: number) => (v >= 8 ? "Gut" : v >= 5 ? "Mittel" : "Achtung");

/* Rote Flaggen: alles, was ein Kunde sofort negativ wahrnimmt */
const shortT = (t: string) => (String(t || "").length > 60 ? String(t).slice(0, 58) + "…" : String(t || ""));
function redFlags(c: Ctx): { t: string; area: AreaKey }[] {
  const f: { t: string; area: AreaKey }[] = [];
  const self = c.items.filter((x) => x.about !== "other");
  for (const x of self.filter((y) => y.src === "google" && y.pos <= 10 && y.sent === "neg")) f.push({ t: `Negativer Treffer auf Google Seite 1: ${shortT(x.title)}`, area: "search" });
  for (const sg of c.suggestions.filter((y) => y.neg)) f.push({ t: `„${sg.q}“ in den Google-Vorschlägen`, area: "search" });
  const r = Number(c.loc.rating) || 0, n = Number(c.loc.reviews) || 0;
  if (r && n >= 3 && r < 3.8) f.push({ t: `Nur ${String(r).replace(".", ",")} Sterne auf Google (${n} Bewertungen)`, area: "reviews" });
  if ((c.reviews.neg || 0) >= 3) f.push({ t: `${c.reviews.neg} von ${c.reviews.total} neuesten Google-Bewertungen kritisch`, area: "reviews" });
  else if (c.reviews.negUnanswered > 0) f.push({ t: `${c.reviews.negUnanswered} kritische Bewertung${c.reviews.negUnanswered > 1 ? "en" : ""} ohne Antwort`, area: "reviews" });
  const seenP = new Set<string>();
  for (const x of self.filter((y) => y.type === "review" && typeof y.rating === "number" && (y.rating as number) > 0 && (y.rating as number) < 3.5)) { const h = host(x.link); if (seenP.has(h)) continue; seenP.add(h); f.push({ t: `${String(x.rating).replace(".", ",")} Sterne auf ${h}`, area: "reviews" }); }
  for (const x of self.filter((y) => y.sent === "neg" && y.src !== "google" && (y.type === "press" || y.type === "forum")).slice(0, 3)) f.push({ t: `Kritischer ${x.type === "press" ? "Artikel" : "Forenbeitrag"}: ${shortT(x.title)}`, area: "press" });
  for (const d of buildDims(c.ki as unknown as J[], undefined)) if (["kritik", "erfahrungen", "serioes"].includes(String(d.key)) && Number(d.score) <= 3) f.push({ t: `KI-Systeme: ${d.name} nur ${d.score}/10`, area: "ki" });
  if (c.aiOverviewSent === "neg") f.push({ t: "Google KI-Übersicht äußert sich negativ", area: "ki" });
  return f;
}
// schwächster Kernbereich und Anzahl roter Flaggen deckeln den Gesamtscore
const capOf = (ar: Record<AreaKey, number>, nf: number) => Math.min(ar.reviews <= 2 || ar.search <= 2 ? 45 : ar.reviews <= 4 || ar.search <= 4 ? 60 : 100, nf >= 4 ? 50 : nf >= 2 ? 65 : 100);
const scoreOf = (c: Ctx, fix: Fix = {}) => { const a = areaScores(c, fix); return Math.min(total(a), capOf(a, redFlags(c).length)); };

/* ---------------- Maßnahmen (Logik: claude/massnahmen-logik.md, 06.11.2026) ----------------
 * Jede Maßnahme wird simuliert: Daten so ändern, als wäre sie erfolgreich erledigt, dann Score MIT neu berechneten roten
 * Flaggen und Deckel. Kombinationen werden gemeinsam gerechnet (nicht addiert) → combos["press|profile:reset"] = Score. */
// Branchen, die vom Google-Profil leben (Laufkundschaft, Maps) → Neustart statt reiner Löschung
const PROFILE_DEP = new Set(["gastro", "hotel", "beauty", "medical", "health", "auto", "cardealer", "retail"]);
type MSel = { profile?: "reset" | "remove"; reviews?: boolean; press?: boolean; web?: boolean };
// Nur Artikel/Beiträge, die sich löschen lassen – Bewertungsportale (Trustpilot & Co.) entfernen ihre Firmenseiten nicht
const isNegPressItem = (x: Item) => x.about !== "other" && x.sent === "neg" && x.type !== "review" && !REVIEW.test(host(x.link)) && (x.type === "press" || x.type === "forum" || x.src === "news");
function simScore(c: Ctx, sel: MSel, rev: J[]): number {
  const c2 = structuredClone(c) as Ctx;
  const fix: Fix = {};
  if (sel.profile) {
    // Profil weg: keine Google-Sterne mehr; neu angelegt = neutral (0 Bewertungen), nur gelöscht = etwas weniger (keine Präsenz)
    c2.loc = { ...c2.loc, rating: null, reviews: 0 };
    c2.reviews = { total: 0, unanswered: 0, negUnanswered: 0, neg: 0, list: [] };
    fix.revOverride = sel.profile === "reset" ? 6 : 5;
    fix.gbp = true;
  } else if (sel.reviews && rev.length) {
    const r = Number(c.loc.rating) || 0, n = Number(c.loc.reviews) || 0, k = rev.length, sum = rev.reduce((s, x) => s + Number(x.rating), 0);
    const un = rev.filter((x) => !x.answered).length;
    c2.loc = { ...c2.loc, rating: n - k > 0 ? Math.round(((r * n - sum) / (n - k)) * 10) / 10 : null, reviews: Math.max(0, n - k) };
    c2.reviews = { ...c2.reviews, neg: Math.max(0, (c2.reviews.neg || 0) - k), negUnanswered: Math.max(0, c2.reviews.negUnanswered - un), unanswered: Math.max(0, c2.reviews.unanswered - un) };
  }
  if (sel.press) for (const x of c2.items) if (isNegPressItem(x)) x.sent = "neu";
  if (sel.web) c2.web = { ...c2.web, url: c2.web.url || "https://neu.example", perf: 90, seo: 95, https: true, ok: true, fromGbp: true };
  return scoreOf(c2, fix);
}
const newestReviewDays = (s: string) => { const t = Date.parse(s); return Number.isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / 86400000)) : null; };
function buildMeasures(c: Ctx, score: number, selfTodos: J[]): J {
  const t = c.tier || {};
  const cc = String(t.cc || c.loc.country || "").toUpperCase();
  const cur = cc === "US" ? "usd" : "eur";
  const prem = !!t.prem && !t.legacy;
  const r = Number(c.loc.rating) || 0, n = Number(c.loc.reviews) || 0;
  const st = String(c.loc.gbp?.status || "OPERATIONAL");
  const list = (c.reviews.list || []) as J[];
  const items: J[] = [];
  const recent30 = list.filter((x) => Number(x.rating) <= 2 && x.days != null && x.days <= 30).length;
  // 1) Google-Profil (≤ 4,2 Sterne oder dauerhaft geschlossen)
  let profile: J | null = null;
  if (c.loc.place_id && (st === "CLOSED_PERMANENTLY" || (n > 0 && r > 0 && r <= 4.2))) {
    const closed = st === "CLOSED_PERMANENTLY";
    const dep = PROFILE_DEP.has(String(t.ind || ""));
    const noWeb = !c.web.url;
    const rec = closed ? "remove" : dep || noWeb ? "reset" : "remove";
    profile = {
      key: "profile", title: "Google-Profil löschen", rec, cur,
      variants: [{ id: "reset", label: "Löschen + neu anlegen", price: profilePriceFor("reset", cur, prem) }, { id: "remove", label: "Nur löschen", price: profilePriceFor("remove", cur, prem) }].filter((v) => !closed || v.id === "remove"),
      express: PROFILE_EXPRESS_FEE,
      sub: closed ? "Als dauerhaft geschlossen angezeigt" : `${String(r).replace(".", ",")} ★ bei ${n} Bewertungen`,
      alert: recent30 ? `${recent30} neue kritische in 30 Tagen` : (c.reviews.neg || 0) >= 3 ? `${c.reviews.neg} der ${c.reviews.total} neuesten kritisch` : "",
      warnRemove: noWeb ? "Ohne Website sind Sie danach bei Google nicht mehr auffindbar." : "",
    };
    items.push(profile);
  }
  // 2) Einzelne Bewertungen (> 4,2 Sterne; 1–2 ★ mit Text, höchstens 28 Tage alt; DE/AT nur, wenn der Schnitt sichtbar steigt)
  let rev: J[] = [];
  if (!profile && r > 4.2 && n > 0) {
    const del = list.filter((x) => Number(x.rating) <= 2 && String(x.text || "").trim() && x.days != null && x.days <= 28);
    if (del.length) {
      const k = del.length, sum = del.reduce((s, x) => s + Number(x.rating), 0);
      const to = n - k > 0 ? Math.round(((r * n - sum) / (n - k)) * 10) / 10 : r;
      const dach = cc === "DE" || cc === "AT";
      if (!dach || to >= Math.round((r + 0.1) * 10) / 10) {
        rev = del;
        const price = t.fresh || freshPriceFor(cc, prem);
        items.push({ key: "reviews", title: `${k} ${k === 1 ? "Bewertung" : "Bewertungen"} löschen`, cur, price, total: price * k, from: r, to,
          left: Math.min(...del.map((x) => 28 - Number(x.days))),
          reviews: del.map((x) => ({ id: x.id, name: x.name, rating: x.rating, text: String(x.text).slice(0, 140), days: x.days, left: 28 - Number(x.days) })) });
      }
    }
  }
  // 3) Negative Artikel/Beiträge → kostenlose Löschprüfung (KI-Zitate besonders wichtig)
  const self = c.items.filter((x) => x.about !== "other");
  const negP = [...new Map(self.filter(isNegPressItem).map((x) => [x.link.replace(/[?#].*$/, "").replace(/\/$/, ""), x])).values()]
    .sort((p, q) => (p.src === "google" ? p.pos : 50) - (q.src === "google" ? q.pos : 50)).slice(0, 8);
  if (negP.length) {
    const cites = (u: string) => { const h = host(u); return c.ki.filter((k) => (k.answers || []).some((a) => (a.src || []).some((s) => host(s.u) === h))).map((k) => k.name); };
    const ps = negP.map((x) => ({ title: x.title, link: x.link, host: host(x.link), pos: x.src === "google" ? x.pos : null, ai: cites(x.link) }));
    const aiAll = [...new Set(ps.flatMap((x) => x.ai))];
    const top = ps.find((x) => x.pos != null && x.pos <= 10);
    items.push({ key: "press", title: `${ps.length} negative${ps.length === 1 ? "n Beitrag" : " Beiträge"} löschen lassen`, price: 0, uncertain: true,
      sub: "Kostenlose Prüfung, sonst verdrängen", alert: aiAll.length ? `${aiAll.join(" und ")} ${aiAll.length > 1 ? "zitieren" : "zitiert"} das` : top ? `Google Platz ${top.pos}` : "", items: ps });
  }
  // 4) Eigene Website
  if (!c.web.url) items.push({ key: "web", title: "Eigene Website", price: 2000, bot: 49.9, sub: "3 Entwürfe, individuell für Sie" });
  // 5) Schutz (nur zusammen mit einer Profil-Maßnahme)
  if (profile) items.push({ key: "schutz", title: "Schutz nach der Löschung", options: [{ id: "monthly", price: PROTECTION_PRICES.monthly, per: "Monat" }, { id: "yearly", price: PROTECTION_PRICES.yearly, per: "Jahr" }, { id: "lifetime", price: PROTECTION_PRICES.lifetime, per: "einmalig" }] });
  // Gemeinsame Simulation aller Kombinationen
  const pv: (MSel["profile"] | undefined)[] = [undefined, ...(profile ? profile.variants.map((v: J) => v.id) : [])];
  const others = (["reviews", "press", "web"] as const).filter((k) => items.some((x) => x.key === k));
  const combos: Record<string, number> = {};
  for (const p of pv) for (let m = 0; m < 1 << others.length; m++) {
    const sel: MSel = { profile: p };
    const keyParts = p ? [`profile:${p}`] : [];
    others.forEach((k, i) => { if (m & (1 << i)) { sel[k] = true; keyParts.push(k); } });
    combos[keyParts.sort().join("|")] = simScore(c, sel, rev);
  }
  for (const x of items) {
    if (x.key === "profile") for (const v of x.variants) v.points = Math.max(0, (combos[`profile:${v.id}`] ?? score) - score);
    else if (x.key !== "schutz") x.points = Math.max(0, (combos[x.key] ?? score) - score);
  }
  const free = selfTodos.filter((x) => !profile || (x.key !== "gbp" && x.key !== "answer"));
  if (n < 30 || profile) free.push({ key: "collect", title: profile ? "Nach dem Neustart Bewertungen sammeln" : "Mehr Bewertungen sammeln", sub: "QR-Code für Ihr Profil" });
  return { base: score, items, combos, free, alert: recent30 >= 2 ? `${recent30} neue 1–2-Sterne-Bewertungen in 30 Tagen` : "" };
}

export function evaluate(c: Ctx): J {
  const a = areaScores(c);
  const flagList = redFlags(c);
  const score = Math.min(total(a), capOf(a, flagList.length));
  const self = c.items.filter((x) => x.about !== "other");
  const negP1 = self.filter((x) => x.src === "google" && x.pos <= 10 && x.sent === "neg");
  const gain = (f: Fix) => { const a2 = areaScores(c, f); return Math.max(0, Math.min(total(a2), capOf(a2, flagList.length)) - score); };
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
  if (c.web.url && ((c.web.perf != null && c.web.perf < 70) || (c.web.seo != null && c.web.seo < 85))) todos.push({ key: "web", title: c.web.perf != null && c.web.perf < 70 ? `Website lädt am Handy langsam (${c.web.perf}/100)` : `${(c.web.checks || []).filter((x) => !x.ok).length} Grundlagen fehlen auf Ihrer Website`, who: "wir", action: "website", points: gain({ web: true }), area: "web" });
  const kChecked = (c.kws || []).filter(kwOk);
  const weak = kChecked.filter((k) => kwVal(k) < 6);
  if (weak.length) todos.push({ key: "rank", title: `Bei ${weak.length} von ${kChecked.length} Suchbegriffen kaum gefunden`, who: "wir", action: "ranking", points: gain({ rank: true }), area: "web" });
  if (!c.web.url) todos.unshift({ key: "web", title: "Eigene Website fehlt – wichtig für Ihren Ruf", who: "wir", action: "website", points: Math.max(3, gain({ web: true })), area: "web" });
  else if (c.web.fromGbp === false) todos.push({ key: "weblink", title: `Website ${host(c.web.url)} im Google-Profil eintragen`, who: "selbst", action: "website", points: gain({ web: true }) || 2, area: "web" });
  let measures: J | null = null;
  try { measures = buildMeasures(c, score, todos.filter((t) => t.who === "selbst").map((t) => ({ key: t.key, title: t.title, area: t.area, glink: t.glink }))); }
  catch (e) { console.warn("Rep-Maßnahmen", (e as Error).message); }
  const webT = todos.find((t) => t.key === "web");
  const top = [...(webT ? [webT] : []), ...todos.filter((t) => t.points > 0 && t !== webT).sort((x, y) => y.points - x.points)].slice(0, 3);
  const potential = Math.min(100, score + top.reduce((s, t) => s + t.points, 0));
  const pick = (f: (x: Item) => boolean) => [...new Map(self.filter(f).map((x) => [x.link.replace(/[?#].*$/, "").replace(/\/$/, ""), x])).values()].sort((p, q) => (p.src === "google" ? 0 : 1) - (q.src === "google" ? 0 : 1) || p.pos - q.pos).slice(0, 12).map((x) => ({ title: x.title, link: x.link, src: x.src, pos: x.pos, sent: x.sent || "neu", type: x.type || "other", note: x.note || "", date: x.date || "", host: host(x.link), read: ((x as J).hit as Hit | undefined)?.k, rating: x.rating || null, votes: x.votes || null, snippet: x.snippet ? x.snippet.slice(0, 200) : "" }));
  // Suche: ALLE Treffer von Google Seite 1–5 + Bing zeigen (auch „andere Firma“), sortiert nach Position
  const allSearch = [...new Map(c.items.filter((x) => x.src === "google" || x.src === "bing").sort((p, q) => (p.src === "google" ? 0 : 1) - (q.src === "google" ? 0 : 1) || p.pos - q.pos)
    .map((x) => [x.src + x.link.replace(/[?#].*$/, "").replace(/\/$/, ""), x])).values()].slice(0, 60)
    .map((x) => ({ title: x.title, link: x.link, src: x.src, pos: x.pos, sent: x.about === "other" ? "other" : x.sent || "neu", type: x.type || "other", note: x.note || "", date: x.date || "", host: host(x.link), read: ((x as J).hit as Hit | undefined)?.k, rating: x.rating || null, votes: x.votes || null, snippet: x.snippet ? x.snippet.slice(0, 200) : "" }));
  const AREAS: { key: AreaKey; name: string; text: (v: number) => string; items: J[] }[] = [
    { key: "press", name: "Presse & Foren", text: () => (negP1.some((x) => x.type !== "own") ? "Ein negativer Treffer steht auf Seite 1 bei Google. Viele Kunden sehen ihn, bevor sie Kontakt aufnehmen." : "Wir prüfen Zeitungen, Online-Magazine und Foren auf Beiträge über Sie."), items: pick((x) => x.type === "press" || x.type === "forum" || x.src === "news") },
    { key: "search", name: "Google- & Bing-Suche", text: () => "Was Kunden sehen, wenn sie Ihren Namen bei Google oder Bing suchen.", items: allSearch },
    { key: "ki", name: "KI-Antworten", text: () => "Was KI-Assistenten antworten, wenn jemand nach Ihnen fragt.", items: [] },
    { key: "reviews", name: "Bewertungen", text: () => "Ihre Sterne auf Google und anderen Bewertungsplattformen.", items: pick((x) => x.type === "review") },
    { key: "social", name: "Social Media", text: () => "Ihre Profile in sozialen Netzwerken.", items: c.social.map((s) => ({ title: s.net, link: s.url, src: "web", sent: "pos", type: "social", host: host(s.url), followers: s.followers || "", inGoogle: c.kgSeen ? !!s.inGoogle : null })) },
    { key: "web", name: "Website", text: () => "Wie Ihre Website auf Kunden wirkt: erreichbar, sicher, schnell, gut dargestellt.", items: [] },
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
      { label: "Geprüft", value: "Google News, Google Seite 1–5, verlinkende Seiten und Erwähnungen im ganzen Netz" },
      ...(c.backlinks ? [{ label: "Domains, die auf Sie verlinken", value: `${c.backlinks.domains.toLocaleString("de-AT")} · Stärke ${c.backlinks.rank}/100` }] : []),
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
      ...(missing.length ? [{ label: "Nicht geantwortet", value: missing.map((n) => (c.kiWhy && c.kiWhy[n] ? `${n} (${c.kiWhy[n]})` : n)).join(", "), tone: "bad" as const }] : []),
    ],
    social: [
      { label: "Gefunden", value: c.social.length ? [...new Set(c.social.map((x) => x.net))].join(", ") : "keine Profile", tone: c.social.length >= 2 ? "good" : "bad" },
      { label: "Im Google-Profil", value: !c.kgSeen ? "nicht feststellbar" : c.social.length ? `${c.social.filter((x) => x.inGoogle).length} von ${c.social.length} sichtbar` : "–" },
    ],
    web: (() => {
      const base = [
        { label: "Geprüft", value: "Google-Profil, Google-Firmenkasten und Google-Suche nach dem Namen (Seite 1–5)" },
        { label: "Website im Google-Profil", value: c.web.fromGbp === false || !c.web.url ? "nicht hinterlegt" : "hinterlegt", tone: c.web.fromGbp === false || !c.web.url ? "bad" as const : "good" as const },
        { label: "Eigene Website", value: c.web.url ? host(c.web.url) + (c.web.via === "kg" ? " (aus dem Google-Firmenkasten)" : c.web.via === "google" ? " (über die Google-Suche gefunden)" : c.web.via === "manual" ? " (von Ihnen eingetragen)" : "") : "keine gefunden", tone: c.web.url ? "good" as const : "bad" as const },
        ...(c.web.url && c.web.perf != null ? [{ label: "Ladezeit am Handy (Google PageSpeed)", value: `${c.web.perf}/100`, tone: c.web.perf >= 70 ? "good" as const : "bad" as const }] : []),
      ];
      const ks = (c.kws || []).filter(kwOk);
      if (!ks.length) return base;
      const p1 = ks.filter((k) => k.g != null && k.g <= 10).length;
      void base;
      const mineN = ks.reduce((a2, k) => a2 + (k.mine ? k.mine.length : 0), 0), topN = ks.reduce((a2, k) => a2 + (k.top || 0), 0);
      return [
        ...(ks.some((k) => k.vol != null) ? [{ label: "Suchen pro Monat (alle Begriffe)", value: `≈ ${ks.reduce((a2, k) => a2 + (k.vol || 0), 0).toLocaleString("de-AT")}` }] : []),
        ...(ks.some((k) => k.mine) ? [{ label: "Plätze auf Seite 1, die Ihnen gehören oder Sie nennen", value: `${mineN} von ${topN}`, tone: mineN >= topN * 0.3 ? "good" as const : "bad" as const }] : []),
        { label: "Website auf Seite 1", value: `${p1} von ${ks.length}`, tone: p1 >= ks.length / 2 ? "good" as const : "bad" as const },
        { label: "Google Top 30", value: `${ks.filter((k) => k.g != null).length} von ${ks.length}` },
        ...(ks.some((k) => !k.noMaps) ? [{ label: "Maps Top 3", value: `${ks.filter((k) => k.pack != null || (k.maps != null && k.maps <= 3)).length} von ${ks.length}` }] : []),
      ];
    })(),
  };
  const areas = AREAS.map((x) => { const s10 = Math.max(0, Math.min(10, Math.round(a[x.key] - 0.1))); return { key: x.key, name: x.name, score10: s10, status: status10(s10), text: x.text(a[x.key]), items: x.items, facts: FACTS[x.key] }; })
    .sort((p, q) => p.score10 - q.score10);
  const g1 = c.items.filter((x) => x.src === "google" && x.pos <= 10).sort((p, q) => p.pos - q.pos);
  const serp1 = g1.map((x) => ({ pos: x.pos, sent: x.about === "other" ? "other" : x.sent || "neu", title: x.title, link: x.link, host: host(x.link) }));
  const flags = flagList.length;
  return {
    score, tier: tier(score), potential, areas, todos: top, serp1, measures,
    flagList,
    kpis: { flags, rating: c.loc.rating, reviews: c.loc.reviews, page1Pos: serp1.filter((x) => x.sent === "pos").length, page1Total: serp1.length },
    kiSummary: c.kiSummary || "",
    ki: [...c.ki, ...(c.aiOverview && !c.ki.some((k) => k.name === "Google KI-Übersicht") ? [{ name: "Google KI-Übersicht", known: true, sent: c.aiOverviewSent || "neu", quote: "", sum: c.aiOverviewSum || "" }] : [])],
    kws: c.kws || [],
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
  const scanStart = Date.now();
  const fullName = String(loc.name || ""), city = String(loc.city || "");
  const name = fullName.split(/\s+[|–—·:]\s+|\s+-\s+/)[0].trim() || fullName;
  const gl = String(loc.country || "at") || "at";
  let q = city && !name.toLowerCase().includes(city.toLowerCase()) ? `${name} ${city}` : name;
  let scope = "lokal";
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
          url: p.mapsUrl || loc.maps_url || "", website: !!p.website, phone: !!(raw.nationalPhoneNumber || raw.internationalPhoneNumber), phoneNo: String(raw.internationalPhoneNumber || raw.nationalPhoneNumber || ""),
          hours: !!(raw.regularOpeningHours && (raw.regularOpeningHours.periods || raw.regularOpeningHours.weekdayDescriptions)),
          photos: Array.isArray(raw.photos) ? raw.photos.length : 0, status: String(raw.businessStatus || "OPERATIONAL"), type: p.type,
          lat: Number(raw.location?.latitude) || null, lng: Number(raw.location?.longitude) || null,
          state: String(comp(raw, "administrative_area_level_1")?.longText || ""), district: String(comp(raw, "administrative_area_level_2")?.longText || ""),
        };
        loc.rating = p.rating; loc.reviews = p.reviews; loc.website = loc.website || p.website; loc.type = p.type;
        await pool!.query(`UPDATE rep_locations SET rating=$2, reviews=$3, website=COALESCE(NULLIF(website,''),$4) WHERE id=$1`, [loc.id, p.rating, p.reviews, p.website]);
      }
    }
    let site = String(loc.website || "");
    const siteFromGbp = !!site;
    let siteVia = siteFromGbp ? "gbp" : "";
    if (!site && loc.website_manual) { site = String(loc.website_manual); siteVia = "manual"; }
    let hp0 = site ? await homepage(site) : { https: false, title: "", desc: "", social: [] as { net: string; url: string }[], ok: false };
    let profile: Profile | null = loc.profile && Number(loc.profile.pv) === PROFILE_V && loc.profile_at && Date.now() - new Date(loc.profile_at).getTime() < 7 * 86400_000 && Number(process.env.REP_CACHE_DAYS ?? 7) > 0 ? (loc.profile as Profile) : null;
    if (!profile) {
      await say(6, site ? `Lese die Website ${host(site)}: Leistungen, Preise, Über uns` : "Erstelle den Steckbrief aus dem Google-Profil");
      profile = await buildProfile(fullName, loc, city, site).catch((e) => { console.warn("Rep-Scan Steckbrief", (e as Error).message); return null; });
      if (profile) await pool!.query(`UPDATE rep_locations SET profile=$2, profile_at=now() WHERE id=$1`, [loc.id, JSON.stringify(profile)]).catch(() => {});
    }
    if (profile) { scope = profile.reach === "international" ? "ueberregional" : profile.reach; await say(7, `Steckbrief: ${short(profile.services.slice(0, 3).join(", ") || profile.summary)}`); }
    const national = scope === "ueberregional";
    if (national) q = name;
    // Recherche im Netz ändert sich nicht stündlich → höchstens einmal pro Woche neu (spart Such- und KI-Kosten)
    const CACHE_V = 14;
    const cRow = await pool!.query(`SELECT data, created_at FROM rep_cache WHERE location_id=$1 AND created_at > now() - make_interval(days => $2)`, [loc.id, Math.max(0, Number(process.env.REP_CACHE_DAYS ?? 7))]).catch(() => ({ rows: [] as J[] }));
    const cache: J | null = cRow.rows[0] && cRow.rows[0].data?.q === q && cRow.rows[0].data?.v === CACHE_V ? cRow.rows[0].data : null;
    const cacheDay = cache ? new Date(cRow.rows[0].created_at).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) : "";
    const own0 = host(String(loc.website || ""));
    // alle Schreibweisen: „Rapid Remove“, „RapidRemove“, „rapid-remove.com“
    const nameOr = [...new Set([name, name.includes(" ") && name.length <= 30 ? name.replace(/\s+/g, "") : "", own0].filter(Boolean))].map((x) => `"${x}"`).join(" OR ");
    let aiOverview: string | null = null;
    let suggestions: { q: string; neg: boolean }[] = [];
    let kg: J | undefined;
    let backlinkSum: { rank: number; domains: number; links: number } | null = cache?.backlinkSum || null;
    if (cache) {
      for (const x of cache.items as Item[]) items.push({ ...x });
      n = items.length;
      aiOverview = cache.aiOverview || null; suggestions = cache.suggestions || []; kg = cache.kg || undefined;
      await say(62, `Suchergebnisse vom ${cacheDay} übernommen (${items.length} Fundstellen) – werden wöchentlich neu geprüft`);
    } else {
      // Google Seite 1–5
      let aiToken = "";
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
      suggestions = (Array.isArray(ac.suggestions) ? ac.suggestions : []).slice(0, 10).map((s: J) => ({ q: String(s.value || ""), neg: NEG_WORDS.test(String(s.value || "")) })).filter((s: { q: string }) => s.q);
      const negS = suggestions.find((x: { neg: boolean }) => x.neg);
      if (negS) await say(52, `Achtung: „${short(negS.q)}“ steht in den Google-Vorschlägen`);
      await say(55, `Suche bei Bing nach „${short(q)}“`);
      const bj = await serp({ engine: "bing", q, cc: gl.toUpperCase() }).catch(() => ({} as J));
      (Array.isArray(bj.organic_results) ? bj.organic_results : []).slice(0, 10).forEach((r: J, k: number) => add("bing", k + 1, r));
      await say(60, `Durchsuche Google News nach „${short(name)}“`);
      const nj = await serp({ engine: "google_news", q: nameOr, gl, hl: "de" }).catch(() => ({} as J));
      (Array.isArray(nj.news_results) ? nj.news_results : []).slice(0, 10).forEach((r: J, k: number) => add("news", k + 1, { ...r, snippet: r.snippet || r.source?.name || "" }));
      // Erwähnungen ohne Ort und ohne eigene Website: findet Presse/Magazin-Artikel, die bei „Name + Ort“ untergehen
      await say(62, `Suche Artikel und Erwähnungen über „${short(name)}“ im ganzen Netz`);
      for (let pg = 0; pg < 3; pg++) {
        const mj = await serp({ engine: "google", q: `${nameOr}${own0 ? " -site:" + own0 : ""}`, gl, hl: "de", num: "10", start: String(pg * 10) }).catch(() => ({} as J));
        (Array.isArray(mj.organic_results) ? mj.organic_results : []).forEach((r: J, k: number) => add("mention", pg * 10 + k + 1, r));
      }
      kg = gPages[0]?.knowledge_graph as J | undefined;
      if (dfsOn()) {
        const dloc = DFS_LOC[gl] || 2040;
        await say(63, own0 ? `Suche alle Seiten, die auf ${own0} verlinken, und Erwähnungen im ganzen Netz` : "Suche Erwähnungen im ganzen Netz");
        const [bs, bl, ca] = await Promise.all([
          own0 ? dfs("backlinks/summary/live", { target: own0, include_subdomains: true, exclude_internal_backlinks: true, rank_scale: "one_hundred", backlinks_status_type: "live" }) : Promise.resolve(null),
          own0 ? dfs("backlinks/backlinks/live", { target: own0, mode: "one_per_domain", limit: 60, order_by: ["domain_from_rank,desc"], exclude_internal_backlinks: true, rank_scale: "one_hundred", backlinks_status_type: "live" }) : Promise.resolve(null),
          dfs("content_analysis/search/live", { keyword: `"${name}"`, search_mode: "one_per_domain", limit: 60, rank_scale: "one_hundred", order_by: ["content_info.date_published,desc"] }),
        ]);
        if (bs) backlinkSum = { rank: Number(bs.rank) || 0, domains: Number(bs.referring_main_domains || bs.referring_domains) || 0, links: Number(bs.backlinks) || 0 };
        let nb = 0;
        for (const x of (Array.isArray(bl?.items) ? bl!.items : []) as J[]) {
          const u = String(x.url_from || ""); if (!u || (own0 && host(u).endsWith(own0)) || items.some((y) => y.link === u)) continue;
          add("link", ++nb, { link: u, title: String(x.page_from_title || x.domain_from || "").slice(0, 160), snippet: x.anchor ? `Linktext: „${String(x.anchor).slice(0, 120)}“` : "", date: String(x.first_seen || "").slice(0, 10) });
        }
        let nc = 0;
        for (const x of (Array.isArray(ca?.items) ? ca!.items : []) as J[]) {
          const u = String(x.url || ""); if (!u || (own0 && host(u).endsWith(own0)) || items.some((y) => y.link === u)) continue;
          const ci = x.content_info || {}, ct = ci.connotation_types || {};
          const pol = Number(ct.negative) > 0.5 ? "eher negativ" : Number(ct.positive) > 0.5 ? "eher positiv" : "neutral";
          add("web", ++nc, { link: u, title: String(ci.main_title || ci.title || x.domain || "").slice(0, 160), snippet: String(ci.snippet || "").slice(0, 260), date: String(ci.date_published || "").slice(0, 10) });
          items[items.length - 1].senti = pol;
        }
        await say(64, `${nb} verlinkende Seiten und ${nc} Erwähnungen gefunden${backlinkSum ? ` · ${backlinkSum.domains} Domains verlinken auf Sie` : ""}`);
      }
    }
    if (!cache && serpOutAt && Date.now() - serpOutAt < 10 * 60_000) throw new Error("Suchdienst vorübergehend nicht verfügbar");
    const itemsRaw = items.map((x) => ({ ...x }));
    const checker = makeChecker([name, name.replace(/\s+/g, ""), fullName !== name ? fullName : ""].filter(Boolean), own0);
    const cachedHits: Record<string, Hit> = cache && cache.hits ? cache.hits : {};
    for (const [u, h] of Object.entries(cachedHits)) checker.memo.set(u, Promise.resolve(h));
    // alle Treffer der Namenssuche/Erwähnungen/News lesen (läuft parallel zu den KI-Fragen)
    const hitsP = Promise.all(items.filter((x) => x.src !== "bing" || x.pos <= 10).slice(0, 160).map(async (x) => { (x as J).hit = await checker.check(x.link); }));
    await say(64, `${items.filter((x) => x.src === "mention" || x.src === "news").length} Erwähnungen gefunden · lese jetzt die neuesten Google-Bewertungen`);
    const reviews = { total: 0, unanswered: 0, negUnanswered: 0, neg: 0 };
    if (loc.place_id) {
      const rj = await serp({ engine: "google_maps_reviews", place_id: loc.place_id, hl: "de", sort_by: "newestFirst" }).catch(() => ({} as J));
      const list = Array.isArray(rj.reviews) ? rj.reviews.slice(0, 10) : [];
      reviews.total = list.length;
      const rl: J[] = [];
      for (const r of list) {
        if (Number(r.rating) <= 2) reviews.neg++;
        const ans = !!(r.response && (r.response.snippet || r.response.extracted_snippet));
        if (!ans) { reviews.unanswered++; if (Number(r.rating) <= 2) reviews.negUnanswered++; }
        rl.push({ id: String(r.review_id || ""), name: String(r.user?.name || "").slice(0, 60), rating: Number(r.rating) || 0, text: String(r.extracted_snippet?.original || r.snippet || "").slice(0, 600), days: newestReviewDays(String(r.iso_date || "")), link: String(r.link || ""), answered: ans });
      }
      (reviews as J).list = rl;
    }
    if (reviews.total) await say(67, `${reviews.total} neueste Bewertungen gelesen · ${reviews.unanswered} davon ohne Antwort`);
    if (!site) {
      const PLATF = /(facebook|instagram|linkedin|youtube|tiktok|twitter|x\.com|pinterest|google|bing|apple\.com|herold|firmenabc|wko|gelbeseiten|11880|tripadvisor|yelp|falstaff|wikipedia|meinbezirk|kununu|trustpilot|provenexpert|localitybiz|cylex|infobel|firmeninfo|northdata|moneyhouse|dasoertliche|branchenbuch|golocal|wlw|compass|firmenbuch|stadtbranchenbuch|hotfrog|werkenntdenbesten|immoscout|willhaben|amazon|ebay)\./i;
      const STOP = new Set(["gmbh", "und", "der", "die", "das", "kg", "og", "co", "the", "salzburg", "wien", "graz", "linz", "innsbruck", String(city).toLowerCase()]);
      const toks = name.toLowerCase().split(/[^a-zäöüß0-9]+/).filter((t) => t.length >= 4 && !STOP.has(t)).map((t) => t.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss"));
      const kgSite = String(kg?.website || "");
      // Kandidaten: Firmenkasten + Treffer, deren Domain ein Wort aus dem Namen enthält – aber nur übernehmen, wenn die Seite nachweislich zu DIESER Firma gehört
      const cands = [...new Set([kgSite, ...items.filter((x) => x.src === "google" && x.pos <= 20 && !PLATF.test(host(x.link)) && toks.some((t) => host(x.link).replace(/-/g, "").includes(t) || host(x.link).includes(t.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u")))).sort((p2, q2) => p2.pos - q2.pos).map((x) => x.link)].filter((u) => u && !PLATF.test(host(u))).map((u) => { try { return new URL(u).origin + "/"; } catch { return ""; } }).filter(Boolean))].slice(0, 4);
      const digits = (t: string) => t.replace(/\D/g, "");
      const phone = digits(String((loc.gbp as J | undefined)?.phoneNo || "")).slice(-8);
      const street = String(loc.address || "").split(",")[0].toLowerCase().replace(/\s+\d.*$/, "").trim();
      const nameFull = name.toLowerCase();
      for (const u of cands) {
        try {
          const r0 = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(10_000), headers: { "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/138 Safari/537.36" } });
          if (!r0.ok) continue;
          const html = (await r0.text()).slice(0, 800_000);
          const low = htmlText(html).toLowerCase();
          const ok = (phone.length >= 6 && digits(low).includes(phone)) || (street.length >= 5 && low.includes(street)) || low.includes(nameFull);
          if (!ok) { console.log("Rep-Scan Website-Kandidat verworfen (gehört nicht zur Firma):", u); continue; }
          site = u; siteVia = u === (kgSite && new URL(kgSite).origin + "/") ? "kg" : "google"; hp0 = await homepage(site);
          await say(69, `Im Google-Profil fehlt die Website – gefunden und geprüft: ${host(site)}`);
          break;
        } catch { /* nächster Kandidat */ }
      }
    }
    await say(70, site ? ((process.env.PAGESPEED_API || process.env.PAGESPEED_API_KEY) ? `Messe die Ladezeit von ${host(site)} mit Google PageSpeed (Handy)` : `Lade ${host(site)} wie ein Handy im mobilen Netz und messe die Ladezeit`) : "Kein Website-Link im Google-Profil – überspringe Website-Check");
    const [au, hp] = site ? await Promise.all([siteAudit(site), Promise.resolve(hp0)]) : [{ perf: null, seo: null, metrics: null, checks: [], finalUrl: "", html: "" } as Audit, { https: false, title: "", desc: "", social: [], ok: false }];
    if (site) await say(74, au.metrics?.lcp ? `${host(site)}: ${au.src === "google" ? "PageSpeed " + au.perf + "/100 · " : ""}fertig geladen nach ${(au.metrics.lcp / 1000).toFixed(1).replace(".", ",")} s · prüfe ${au.checks.length} SEO-Grundlagen` : `Prüfe ${host(site)}: Titel, Beschreibung, Überschriften, Firmendaten`);
    // Suchbegriffe, mit denen Kunden suchen (ohne Firmennamen) → Platz bei Google und Maps
    const norm = (t: string) => String(t || "").toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
    let kwVol = new Map<string, number>();
    // Ranking bei Suchbegriffen (SEO) ist abgeschaltet – wir sind Reputation, nicht SEO. Nur mit REP_KEYWORDS=1.
    const kwPromise: Promise<Kw[]> = process.env.REP_KEYWORDS !== "1" ? Promise.resolve([] as Kw[]) : cache && Array.isArray(cache.kws) && cache.kws.length ? Promise.resolve(cache.kws as Kw[]) : (async () => {
      const g0 = loc.gbp as J | undefined;
      const ctxTxt = [loc.type && `Kategorie: ${loc.type}`, city && `Ort: ${city}`, g0?.district && `Bezirk: ${g0.district}`, g0?.state && `Bundesland/Region: ${g0.state}`, loc.address && `Adresse: ${loc.address}`, hp.title && `Website-Titel: ${hp.title}`, hp.desc && `Website-Beschreibung: ${hp.desc}`,
        ...items.filter((x) => x.src === "google").slice(0, 8).map((x) => `Treffer: ${x.title} – ${x.snippet}`)].filter(Boolean).join("\n");
      // 1) Ausgangsbegriffe (Leistung, ggf. + Region) → 2) Google-Vorschläge = das, was Menschen wirklich tippen → 3) die passendsten 8 auswählen
      const regionRule = national ? "OHNE Ort oder Region – der Standort ist egal." : scope === "regional" ? "mit Bundesland, Landeshauptstadt/Großraum oder Bezirk (z. B. „Salzburg“, „Salzburg Umgebung“, „Flachgau“), den kleinen Ort höchstens 1×." : "mit dem Ort oder der nächsten Stadt.";
      const prof = profile ? `\nSteckbrief: ${profile.summary}\nAngeboten: ${profile.services.join("; ")}${profile.notOffered.length ? "\nNICHT angeboten: " + profile.notOffered.join("; ") : ""}` : "";
      const t1 = await askClaude("Du bist SEO-Berater. Antworte NUR mit JSON.", `Unternehmen: ${name}\n${ctxTxt}${prof}\n\nNenne 5 kurze Ausgangsbegriffe (1–3 Wörter), mit denen jemand bei Google nach der DIENSTLEISTUNG dieses Unternehmens sucht – keine Firmennamen, keine Produkte/Objekte (nicht „Wohnung kaufen“). ${regionRule}\nNur für angebotene Leistungen, nie für „NICHT angeboten“.\n{"seeds":["…"]}`, { maxTokens: 400 }).catch(() => "");
      const seeds: string[] = ((parseJson(t1) || {}).seeds || []).map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 5);
      const sugg: string[] = [];
      await Promise.all(seeds.map(async (sd) => {
        const a = await serp({ engine: "google_autocomplete", q: sd, gl, hl: "de" }).catch(() => ({} as J));
        for (const x of (Array.isArray(a.suggestions) ? a.suggestions : []).slice(0, 8)) { const v = String(x.value || "").trim(); if (v && !sugg.includes(v) && !RESEARCH_RE.test(v)) sugg.push(v); }
      }));
      const t = sugg.length ? await askClaude("Du bist SEO-Berater. Antworte NUR mit JSON.", `Unternehmen: ${name}\n${ctxTxt}${prof}\n\nDas sind echte Google-Vorschläge, also Begriffe, die Menschen tatsächlich suchen:\n${sugg.map((x) => "- " + x).join("\n")}\n\nWähle daraus bis zu 8 Begriffe, bei denen potenzielle KUNDEN genau diese Dienstleistung suchen und dieses Unternehmen gefunden werden sollte. Nicht: Leistungen aus „NICHT angeboten“, Firmennamen, Anleitungen zum Selbermachen, Jobs, Recherche-Zusätze wie „seriös“, „erfahrungen“, „kosten“, irrelevante Themen. ${national ? "Begriffe mit Ortsnamen weglassen." : ""} Übernimm die Begriffe wörtlich.\n{"keywords":["…"]}`, { maxTokens: 500 }).catch(() => "") : "";
      let kjx = parseJson(t) || {};
      // DataForSEO: Begriffe, für die die Domain schon rankt, + Suchvolumen aller Kandidaten → nur Begriffe, die wirklich gesucht werden
      if (dfsOn()) {
        const dloc = DFS_LOC[gl] || 2040;
        const [rk, sv] = await Promise.all([
          own0 ? dfs("dataforseo_labs/google/ranked_keywords/live", { target: own0, location_code: dloc, language_code: "de", item_types: ["organic"], limit: 100, filters: [["keyword_data.keyword_info.search_volume", ">", 0]], order_by: ["keyword_data.keyword_info.search_volume,desc"] }) : Promise.resolve(null),
          dfs("keywords_data/google_ads/search_volume/live", { keywords: [...new Set([...sugg, ...seeds].map((x) => x.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim()).filter((x) => x && x.split(" ").length <= 10 && x.length <= 80))].slice(0, 200), location_code: dloc, language_code: "de" }, 60_000, true),
        ]);
        const ranked = ((rk?.items || []) as J[]).map((x) => ({ q: String(x.keyword_data?.keyword || ""), vol: Number(x.keyword_data?.keyword_info?.search_volume) || 0, pos: Number(x.ranked_serp_element?.serp_item?.rank_group) || null })).filter((x) => x.q && !RESEARCH_RE.test(x.q) && !norm(x.q).includes(norm(name).slice(0, 8)));
        const vols = new Map<string, number>(((Array.isArray(sv) ? sv : []) as J[]).map((x) => [String(x.keyword || "").toLowerCase(), Number(x.search_volume) || 0]));
        for (const r0 of ranked) vols.set(r0.q.toLowerCase(), Math.max(vols.get(r0.q.toLowerCase()) || 0, r0.vol));
        const cand = [...new Map([...ranked.map((x) => [x.q.toLowerCase(), `${x.q} (≈${x.vol}/Monat, Ihre Website rankt auf Platz ${x.pos ?? "?"})`] as const), ...[...sugg, ...seeds].map((x) => [x.toLowerCase(), `${x} (≈${vols.get(x.toLowerCase()) ?? "?"}/Monat)`] as const)]).values()];
        if (cand.length) {
          await say(76, `${ranked.length} Suchbegriffe gefunden, für die Sie schon ranken · prüfe Suchvolumen`);
          const t2 = await askClaude("Du bist SEO-Berater. Antworte NUR mit JSON.", `Unternehmen: ${name}\n${ctxTxt}${prof}\n\nKandidaten mit echtem monatlichem Google-Suchvolumen:\n${cand.slice(0, 160).map((x) => "- " + x).join("\n")}\n\nWähle die 8 wichtigsten Begriffe, bei denen potenzielle KUNDEN genau eine angebotene Leistung suchen. Nimm, wenn vorhanden, mindestens 3 Begriffe, für die die Website schon rankt. Bevorzuge hohes Suchvolumen; Begriffe unter 10 Suchen/Monat nur, wenn es nichts Besseres gibt. Nicht: Leistungen aus „NICHT angeboten“, Firmennamen, Anleitungen, Recherche-Zusätze, Jobs. ${national ? "Keine Ortsnamen." : ""} Übernimm die Begriffe wörtlich ohne die Klammer.\n{"keywords":["…"]}`, { maxTokens: 500 }).catch(() => "");
          const k2 = parseJson(t2);
          if (k2 && Array.isArray(k2.keywords) && k2.keywords.length) kjx = k2;
        }
        kwVol = vols;
      }
      const kj = kjx;
      let kws: string[] = ((kj.keywords || []) as unknown[]).map((x) => String(x).trim()).filter((x: string) => x && !RESEARCH_RE.test(x) && !norm(x).includes(norm(name).slice(0, 8)));
      if (kws.length < 4) kws = [...kws, ...seeds.filter((x) => !kws.includes(x))];
      if (!kws.length) kws = [`${loc.type || "Anbieter"}${national ? "" : " " + city}`.trim()];
      kws = [...new Set(kws)].slice(0, 8);
      kws = kws.map((x) => x.replace(/\s*\(≈.*$/, "").trim()).filter(Boolean);
      const ll = g0 && g0.lat && g0.lng ? `@${g0.lat},${g0.lng},12z` : "";
      const isMe = (x: J) => (loc.place_id && x.place_id === loc.place_id) || (!!norm(x.title) && (norm(x.title) === norm(name) || norm(x.title) === norm(fullName)));
      let done = 0;
      let dbgLogged = false;
      // höchstens 3 Begriffe gleichzeitig + 1 Wiederholung – sonst laufen SerpApi-Abfragen in Timeouts
      const retry = async (pp: Record<string, string>): Promise<J | null> => {
        for (let t2 = 0; t2 < 2; t2++) { try { return await serp(pp, 75_000); } catch (e) { if (/Kontingent/.test((e as Error).message)) return null; console.warn("Rep-Scan Suchbegriff", pp.engine, pp.q, "Versuch", t2 + 1, (e as Error).message); } }
        return null;
      };
      const one = async (q0: string): Promise<Kw> => {
        const mP = national ? Promise.resolve({} as J) : retry({ engine: "google_maps", q: q0, hl: "de", type: "search", ...(ll ? { ll } : {}) });
        // Google Platz 1–30: nächste Seite nur abfragen, wenn die eigene Website noch nicht gefunden ist
        let g: J = {}; let gPos: number | null = null; let gErr = false; let top10: { p: number; u: string; t: string }[] = [];
        let dr = dfsOn() ? await dfs("serp/google/organic/live/advanced", { keyword: q0, location_code: DFS_LOC[gl] || 2040, language_code: "de", device: "desktop", depth: 30 }, 75_000) : null;
        // DataForSEO liefert teils Google-Weiterleitungslinks statt der Ziel-URL → echte Adresse herausholen
        const realUrl = (x: J): string => {
          const u = String(x.url || "");
          if (/(^|\.)google\.[a-z.]+$/i.test(host(u)) && !/support\.google|business\.google|developers\.google/i.test(host(u))) {
            try { const q2 = new URL(u).searchParams; const t2 = q2.get("q") || q2.get("url") || q2.get("u"); if (t2 && /^https?:\/\//.test(t2)) return t2; } catch { /* */ }
            if (x.domain && !/google\./i.test(String(x.domain))) return `https://${x.domain}${x.breadcrumb && String(x.breadcrumb).includes("›") ? "" : ""}`;
          }
          return u;
        };
        if (dr && Array.isArray(dr.items) && !dbgLogged) { dbgLogged = true; console.log("Rep-Scan DataForSEO SERP Beispiel:", JSON.stringify((dr.items as J[]).filter((x) => x.type === "organic").slice(0, 2).map((x) => ({ url: x.url, domain: x.domain, title: x.title, rank: x.rank_group }))).slice(0, 600)); }
        const dOrg = dr && Array.isArray(dr.items) ? (dr.items as J[]).filter((x) => x.type === "organic" && (x.url || x.domain)).map((x) => ({ ...x, url: realUrl(x) }) as J) : ([] as J[]);
        // nur Google-Adressen = Antwort unbrauchbar → SerpApi nehmen
        if (dr && dOrg.length && dOrg.every((x) => /(^|\.)google\./i.test(host(String(x.url))))) { console.warn("Rep-Scan DataForSEO SERP nur Google-Links – nehme SerpApi", q0); dr = null; }
        if (dr && Array.isArray(dr.items)) {
          const org = dOrg;
          top10 = org.filter((x) => Number(x.rank_group) <= 10).map((x) => ({ p: Number(x.rank_group), u: String(x.url), t: String(x.title || "").slice(0, 120) }));
          const me = own0 ? org.find((x) => host(String(x.url)).endsWith(own0)) : undefined;
          if (me) gPos = Number(me.rank_group) || null;
          const lp = (dr.items as J[]).find((x) => x.type === "local_pack" || x.type === "maps");
          if (lp) g = { local_results: { places: (Array.isArray(lp.items) ? lp.items : [lp]).map((x: J) => ({ title: x.title, place_id: x.place_id })) } };
        }
        for (let pg = 0; pg < 3 && !(dr && Array.isArray(dr.items)); pg++) {
          const j0 = await retry({ engine: "google", q: q0, gl, hl: "de", num: "10", start: String(pg * 10) });
          if (!j0) { if (pg === 0) gErr = true; break; }
          const j = j0;
          if (pg === 0) g = j;
          const org: J[] = Array.isArray(j.organic_results) ? j.organic_results : [];
          if (pg === 0) top10 = org.slice(0, 10).map((x, k2) => ({ p: Number(x.position) > 0 && Number(x.position) <= 10 ? Number(x.position) : k2 + 1, u: String(x.link || ""), t: String(x.title || "").slice(0, 120) })).filter((x) => x.u);
          const oi = own0 ? org.findIndex((x) => host(String(x.link || "")).endsWith(own0)) : -1;
          if (oi >= 0) { gPos = pg * 10 + (Number(org[oi].position) > 0 && Number(org[oi].position) <= 10 ? Number(org[oi].position) : oi + 1); break; }
          if (!own0 || org.length < 5) break;
        }
        const m = (await mP) || {};
        const mine: KwHit[] = [];
        for (const x of top10) { const hh = await checker.check(x.u); if (hh.k !== "none" && hh.k !== "blocked") mine.push({ p: x.p, u: x.u, h: host(x.u), t: x.t, k: hh.k }); }
        const pk: J[] = Array.isArray(g.local_results?.places) ? g.local_results.places : Array.isArray(g.local_results) ? g.local_results : [];
        const pi = pk.findIndex(isMe);
        const ml: J[] = Array.isArray(m.local_results) ? m.local_results : m.place_results ? [m.place_results] : [];
        const mi = ml.findIndex(isMe);
        const lead = mi === 0 ? undefined : String(ml[0]?.title || "") || undefined;
        done++;
        void say(77, `Suchbegriff „${short(q0)}“: ${gErr ? "Google nicht erreichbar" : `${mine.length} von ${top10.length} Treffern auf Seite 1 gehören zu Ihnen oder nennen Sie`}${national ? "" : " · " + (mi >= 0 ? "Maps Platz " + (mi + 1) : "nicht in Maps")} (${done} von ${kws.length})`);
        console.log(`Rep-Scan Suchbegriff „${q0}“ own=${own0 || "-"} quelle=${dr && Array.isArray(dr.items) ? "dataforseo" : "serpapi"} platz=${gPos ?? "-"} top10=${top10.map((x) => x.p + ":" + host(x.u)).join(" ")} meins=${mine.map((m) => m.p + ":" + m.k).join(" ") || "-"}`);
        const vol = kwVol.get(q0.toLowerCase());
        return { ...(vol != null ? { vol } : {}), q: q0, mine, top: top10.length, g: gPos, pack: national || pi < 0 ? null : pi + 1, maps: national || mi < 0 ? null : mi + 1, lead: national ? undefined : lead, ...(gErr ? { err: true } : {}), ...(national ? { noMaps: true } : {}) } as Kw;
      };
      const out: Kw[] = new Array(kws.length);
      let next = 0;
      await Promise.all(Array.from({ length: Math.min(3, kws.length) }, async () => { while (next < kws.length) { const i = next++; out[i] = await one(kws[i]); } }));
      return out;
    })().catch((e) => { console.warn("Rep-Scan Suchbegriffe", (e as Error).message); return [] as Kw[]; });
    await say(76, "Suche Facebook-, Instagram-, LinkedIn- und YouTube-Profile");
    const social: Social[] = [...hp.social];
    for (const x of items) for (const [net, re] of SOCIAL) if (!social.some((s) => s.net === net) && re.test(x.link.replace(/^https?:\/\//, "")) && x.about !== "other") social.push({ net, url: x.link });
    // Profile, die Google im Firmenprofil (Knowledge Panel, Bereich „Profile“) zeigt
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
    await say(78, social.length ? `Gefunden: ${[...new Set(social.map((x) => x.net))].join(", ")} · frage jetzt ChatGPT, Claude, Gemini & Perplexity` : "Frage jetzt ChatGPT, Claude, Gemini & Perplexity");
    // Fester Fragenkatalog – so wie echte Kunden fragen. Jede KI bekommt jede Frage einzeln.
    const inCity = city && !national ? ` in ${city}` : "";
    const branche = String(loc.type || "").trim() || (profile?.services[0] || "Anbieter");
    const QUESTIONS = [
      { key: "kennen", q: `Kennst du die Firma „${name}“${inCity}?` },
      { key: "angebot", q: `Was bietet „${name}“${inCity} genau an?` },
      { key: "serioes", q: `Ist „${name}“${inCity} seriös?` },
      { key: "erfahrungen", q: `Welche Erfahrungen haben Kunden mit „${name}“${inCity} gemacht?` },
      { key: "kritik", q: `Gibt es Kritik oder Beschwerden über „${name}“${inCity}?` },
      // so fragt ein echter Kunde, der die Firma noch nicht kennt → wird sie empfohlen?
      ...((profile?.recQuestions.length ? profile.recQuestions : [national ? `Welcher Anbieter ist für ${branche} empfehlenswert?` : `Welche ${branche} in ${city || "der Region"} kannst du empfehlen?`]).slice(0, 3).map((x, i) => ({ key: "rec" + (i + 1), q: x }))),
    ];
    const SYS = "Du bist ein hilfreicher KI-Assistent. Antworte auf Deutsch in 2–4 Sätzen, so wie du einer Person antworten würdest, die das fragt. Nutze die Websuche, wenn du sie hast.";
    // Grundlage, falls Claudes eigene Websuche nicht liefert: echte Such-Treffer (Google, News, Erwähnungen) – keine eigene Website
    const snips = items.filter((x) => x.src !== "bing" && !(own0 && host(x.link).endsWith(own0))).slice(0, 30)
      .map((x) => `- ${x.title} (${host(x.link)})${x.snippet ? ": " + x.snippet : ""}`).join("\n");
    const askClaudeWeb = async (qq: string, sink?: Src[]): Promise<string> => {
      const t = await askClaude(SYS, qq, { search: true, maxTokens: 4000, sink }).catch((e) => { console.warn("Rep-Scan KI", e.message); return ""; });
      if (t && !/nicht live|kann .{0,30}nicht .{0,20}(nachsehen|suchen|recherchieren)|keinen (internet|web)zugriff|no (internet|web) access/i.test(t)) return t;
      return askClaude(SYS + " Dir liegen aktuelle Suchergebnisse aus dem Web vor – nutze sie wie eine Websuche, erfinde nichts dazu.", `${qq}\n\nAktuelle Suchergebnisse:\n${snips || "(keine)"}`, { maxTokens: 700 })
        .catch((e) => { console.warn("Rep-Scan KI (Suchergebnisse)", e.message); return t; });
    };
    let kiDone = 0;
    const kiTotal = QUESTIONS.length * 4;
    const told = <T,>(ai: string, x: { q: string }, pr: Promise<T>) => pr.then((v) => { kiDone++; void say(78 + Math.round((kiDone / kiTotal) * 8), `${ai} gefragt: „${short(x.q.replace(/„|“/g, ""))}“ (${kiDone} von ${kiTotal})`); return v; });
    // KI-Antworten aus dem Cache nur, wenn alle eingerichteten KIs damals geantwortet haben (sonst neu fragen, z. B. nach einem Limit)
    const cachedAll = !!cache && (!process.env.OPENAI_API_KEY || (cache.gptAns || []).some(Boolean)) && (!process.env.GEMINI_API_KEY || (cache.gemAns || []).some(Boolean)) && (!process.env.PERPLEXITY_API_KEY || (cache.pplxAns || []).some(Boolean));
    const fromCache = !!(cache && cachedAll && cache.qk === QUESTIONS.map((x) => x.key).join(",") && Array.isArray(cache.claudeAns));
    const newSrc = (): Src[][] => QUESTIONS.map(() => [] as Src[]);
    const claudeSrc: Src[][] = fromCache && Array.isArray(cache!.claudeSrc) ? cache!.claudeSrc : newSrc();
    const gptSrc: Src[][] = fromCache && Array.isArray(cache!.gptSrc) ? cache!.gptSrc : newSrc();
    const pplxSrc: Src[][] = fromCache && Array.isArray(cache!.pplxSrc) ? cache!.pplxSrc : newSrc();
    const gemSrc: Src[][] = fromCache && Array.isArray(cache!.gemSrc) ? cache!.gemSrc : newSrc();
    const srcTxt = (l: Src[]) => (l && l.length ? `\nQuellen: ${l.map((x) => `${x.t || host(x.u)} <${x.u}>`).join(" | ")}` : "");
    if (fromCache) await say(84, `KI-Antworten vom ${cacheDay} übernommen`);
    const googSrc: Src[][] = fromCache && Array.isArray(cache!.googSrc) ? cache!.googSrc : newSrc();
    // Google: KI-Übersicht zu jeder Kundenfrage (ohne Firmennamen) – was Kunden direkt bei Google sehen
    const googP: Promise<string[]> = fromCache && Array.isArray(cache!.googAns) ? Promise.resolve(cache!.googAns as string[]) : Promise.all(QUESTIONS.map(async (x, i) => {
      if (!x.key.startsWith("rec")) return "";
      const j = await serp({ engine: "google", q: x.q, gl, hl: "de" }, 60_000).catch(() => ({} as J));
      let ao: J | null = j.ai_overview || null;
      if (ao && !Array.isArray(ao.text_blocks) && ao.page_token) ao = (await serp({ engine: "google_ai_overview", page_token: String(ao.page_token) }).catch(() => ({} as J))).ai_overview || null;
      const blocks: J[] = Array.isArray(ao?.text_blocks) ? ao!.text_blocks : [];
      const flat = (b: J): string => [b.snippet, ...(Array.isArray(b.list) ? b.list.map(flat) : []), ...(Array.isArray(b.text_blocks) ? b.text_blocks.map(flat) : [])].filter(Boolean).join(" ");
      for (const r0 of Array.isArray(ao?.references) ? ao!.references : []) pushSrc(googSrc[i], r0.link, r0.title || r0.source);
      const org: J[] = Array.isArray(j.organic_results) ? j.organic_results : [];
      const me = own0 ? org.findIndex((o) => host(String(o.link || "")).endsWith(own0)) : -1;
      const txt = blocks.map(flat).join(" ").trim();
      return txt ? txt + (me >= 0 ? `\n[Google-Suchergebnis: Website auf Platz ${me + 1}]` : "") : "";
    }));
    const [claudeAns, gptAns, pplxAns, gemAns]: string[][] = fromCache ? [cache!.claudeAns, cache!.gptAns, cache!.pplxAns, cache!.gemAns || []] : await Promise.all([
      Promise.all(QUESTIONS.map((x, i) => told("Claude", x, askClaudeWeb(x.q, claudeSrc[i])))),
      Promise.all(QUESTIONS.map((x, i) => told("ChatGPT", x, askChatGPT(x.q + " Antworte auf Deutsch in 2–4 Sätzen.", gptSrc[i])))),
      Promise.all(QUESTIONS.map((x, i) => told("Perplexity", x, askPerplexity(x.q + " Antworte auf Deutsch in 2–4 Sätzen.", pplxSrc[i])))),
      Promise.all(QUESTIONS.map((x, i) => told("Gemini", x, askGemini(x.q + " Antworte auf Deutsch in 2–4 Sätzen.", gemSrc[i])))),
    ]);
    const googAns = await googP;
    const googText = googAns.filter(Boolean).length ? QUESTIONS.map((x, i) => (googAns[i] ? `F: ${x.q}\nA: ${googAns[i]}${srcTxt(googSrc[i])}` : "")).filter(Boolean).join("\n\n") : "";
    const kiText = claudeAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${claudeAns[i] || "(keine Antwort)"}${srcTxt(claudeSrc[i])}`).join("\n\n") : "";
    const gemText = gemAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${gemAns[i] || "(keine Antwort)"}${srcTxt(gemSrc[i])}`).join("\n\n") : "";
    const pplxText = pplxAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${pplxAns[i] || "(keine Antwort)"}${srcTxt(pplxSrc[i])}`).join("\n\n") : "";
    const gptText = gptAns.filter(Boolean).length ? QUESTIONS.map((x, i) => `F: ${x.q}\nA: ${gptAns[i] || "(keine Antwort)"}${srcTxt(gptSrc[i])}`).join("\n\n") : "";
    await say(86, `Ordne ${items.length} Fundstellen ein: positiv, negativ oder andere Firma`);
    const ownHost = host(site);
    await say(87, `Lese ${checker.memo.size} gefundene Seiten: nennen oder verlinken sie Sie?`);
    await hitsP;
    { const cnt2: Record<string, number> = {}; for (const [, p2] of checker.memo) { const h2 = await p2; cnt2[h2.k] = (cnt2[h2.k] || 0) + 1; } console.log(`Rep-Scan Seiten gelesen (own=${own0 || "-"}, website=${site || "-"}):`, JSON.stringify(cnt2)); }
    const hitTxt: Record<string, string> = { own: "eigene Website", channel: "eigener Kanal", links: "Seite verlinkt das Unternehmen", names: "Seite nennt das Unternehmen", none: "Seite gelesen – Unternehmen kommt NICHT vor", blocked: "Seite nicht lesbar" };
    const list = items.slice(0, 160).map((x) => { const h = (x as J).hit as Hit | undefined; return { ...(x.senti ? { stimmung: x.senti } : {}), i: x.i, src: x.src, pos: x.pos, title: x.title, snippet: x.snippet, host: host(x.link), ...(h ? { gelesen: hitTxt[h.k], ...(h.ex ? { textstelle: h.ex.slice(0, 360) } : {}) } : {}) }; });
    const cls = fromCache && cache!.cls ? (cache!.cls as J) : parseJson(await askClaude(
      "Du ordnest Suchtreffer für einen Reputations-Check ein. Antworte NUR mit JSON, ohne Erklärung.",
      `Unternehmen: ${name}\nOrt: ${city || "unbekannt"}\nEigene Website: ${ownHost || "keine"}\n\nSuchtreffer (JSON):\n${JSON.stringify(list)}\n\nAntworten von Claude (Fragen F1–F${QUESTIONS.length}):\n${kiText || "(keine)"}\n\nAntworten von ChatGPT auf dieselben Fragen:\n${gptText || "(keine)"}\n\nAntworten von Perplexity auf dieselben Fragen:\n${pplxText || "(keine)"}\n\nAntworten von Gemini auf dieselben Fragen:\n${gemText || "(keine)"}\n\nGoogle KI-Übersicht zu den Empfehlungsfragen:\n${googText || "(keine)"}\n\nGoogle KI-Übersicht:\n${aiOverview || "(keine)"}\n\n` +
      `Gib zurück: {"items":[{"i":Zahl,"about":"self|other|unclear","sent":"pos|neu|neg","type":"own|press|forum|review|social|directory|other","note":"nur bei neg: kurzer Grund, max 12 Wörter"}],"ki":{"known":true|false,"sent":"pos|neu|neg","sum":"1 Satz Fazit dieser KI in eigenen Worten, max 20 Wörter","answers":[{"mentioned":true|false,"rank":Zahl|null,"others":["nur bei Empfehlungsfragen: andere genannte Anbieter, max 5"],"sent":"pos|neu|neg","known":true|false,"sum":"1 sachlicher Satz, was die KI zu dieser Frage sagt – in EIGENEN Worten zusammengefasst, max 18 Wörter, KEIN wörtliches Zitat"} – genau ${QUESTIONS.length}, in Reihenfolge F1–F${QUESTIONS.length}]},"gpt":{gleiches Format für ChatGPT},"pplx":{gleiches Format für Perplexity},"gem":{gleiches Format für Gemini},"goog":{gleiches Format für die Google KI-Übersicht; Fragen ohne Antwort mit sent "none"},"aiOverview":"pos|neu|neg|none","aiOverviewSum":"1 Satz, was die Google KI-Übersicht sagt, eigene Worte, max 20 Wörter (leer wenn keine)","dims":[{"key":"kennen|angebot|serioes|erfahrungen|kritik|rec","sum":"1–2 Sätze: was ALLE KIs zusammen zu diesem Punkt sagen, eigene Worte, max 30 Wörter, kein Zitat","refs":[{"url":"exakt eine der bei dieser Frage angegebenen Quellen-URLs","about":"worum es in dieser Quelle geht bzw. was dort kritisiert/gelobt wird, max 14 Wörter, konkret","sent":"pos|neu|neg"}]} – je Frage einer; die Empfehlungsfragen (rec1, rec2 …) gemeinsam unter "key":"rec"],"kiSummary":"2–3 Sätze Gesamtfazit, was KI-Systeme insgesamt über das Unternehmen sagen – sachlich, eigene Worte, Kritik zuerst nennen","summary":"1 Satz Gesamteindruck für den Inhaber, sachlich"}\n` +
      `Fragen: ${QUESTIONS.map((x, i) => `F${i + 1} [${x.key}] ${x.q}`).join(" | ")}. Die Fragen mit [rec…] sind Empfehlungsfragen OHNE Firmennamen: "mentioned" = nennt die Antwort dieses Unternehmen (${name}${own0 ? " / " + own0 : ""})? "rank" = an welcher Stelle unter den genannten Anbietern (1 = zuerst), sonst null; "others" = die anderen genannten Anbieter; "sent" = pos wenn empfohlen, neg wenn nicht genannt. ` +
      (profile ? `Steckbrief des Unternehmens: ${profile.summary} Angeboten: ${profile.services.join("; ")}.${profile.notOffered.length ? " NICHT angeboten: " + profile.notOffered.join("; ") + " – fehlende Treffer dazu sind keine Schwäche." : ""} ` : "") +
      `Regeln zu den KI-Antworten: Bei "kiSummary" und "dims": Sprich allgemein von „KI-Systemen“ (z. B. „KI-Systeme raten zu …“, „KI-Systeme kennen …“) – nie „beide KIs“, „zwei KIs“, „alle drei“ oder andere Anzahlen, und nenne keine einzelnen KI-Namen. "sent" bewertet immer, ob die Antwort für das Unternehmen gut (pos) oder schlecht (neg) ist – bei der Kritik-Frage [kritik] also pos, wenn keine Kritik bekannt ist, und neg, wenn Kritik genannt wird. ` +
      `Quellen: src "google" = Suche nach dem Namen, "mention" = Erwähnungssuche, "news" = Google News, "link" = Seite verlinkt nachweislich auf die Website des Unternehmens, "web" = Erwähnung im Netz (mit "stimmung" laut Textanalyse). ` +
      `Regeln: Gib für JEDEN Treffer (alle i) eine Zeile zurück. Bei vielen Treffern steht unter "gelesen" das Ergebnis, nachdem wir die Seite wirklich geöffnet haben, und unter "textstelle" der Text rund um die Erwähnung – das hat Vorrang vor Titel/Snippet: "Seite nennt/verlinkt das Unternehmen" → "about":"self" und "sent" nach der Textstelle (Empfehlung = pos, Warnung/Kritik = neg); "kommt NICHT vor" → meist "other", außer der Titel nennt das Unternehmen eindeutig. "about":"self" = der Treffer betrifft dieses Unternehmen oder erwähnt es – auch fremde Seiten wie Verzeichnisse, Presse, Social-Media-Profile, Bewertungsportale. "about":"other" NUR wenn der Treffer eindeutig ein anderes Unternehmen/eine andere Person mit ähnlichem Namen meint. Im Zweifel "self" oder "unclear". "own" = eigene Website/eigene Profile. "press" = jeder redaktionelle Beitrag über das Unternehmen: Zeitungen, Online-Magazine, Wirtschafts- und Fachmagazine (z. B. Forbes, Wirtschaftsjournal), Interviews, Berichte, Pressemitteilungen – auch wenn positiv. "neg" nur bei echter Kritik, Warnung, Beschwerde, schlechter Bewertung (<3 Sterne) oder negativer Berichterstattung über DIESES Unternehmen. Verzeichnisse/Branchenbücher = "directory", neutral. Für KI-Antworten: Aussagen, die sich nur auf die eigene Website oder Eigendarstellung des Unternehmens stützen (z. B. Kundenstimmen auf der eigenen Website), zählen NICHT als positiv → "neu". Positiv nur bei echten, unabhängigen Belegen (Bewertungen, Presse, klare Empfehlung). Sagt eine KI, sie habe keine verlässlichen Informationen oder könne nicht nachsehen → "known": false.`,
      { maxTokens: 16000 },
    ).catch((e) => { console.warn("Rep-Scan Einordnung", e.message); return ""; }));
    if (!cls) console.warn("Rep-Scan Einordnung: kein gültiges JSON – nutze einfache Regeln");
    // Neu recherchiert und brauchbar → für eine Woche merken
    if (!cache && serpOutAt && Date.now() - serpOutAt < 10 * 60_000) throw new Error("Suchdienst vorübergehend nicht verfügbar");
    if (!fromCache && cls && [claudeAns, gptAns, pplxAns, gemAns].filter((a) => a.some(Boolean)).length >= 2) {
      const kwsNow = await kwPromise;
      await pool!.query(`INSERT INTO rep_cache (location_id, data, created_at) VALUES ($1,$2,now()) ON CONFLICT (location_id) DO UPDATE SET data=EXCLUDED.data, created_at=now()`,
        [loc.id, pgJson({ v: CACHE_V, q, qk: QUESTIONS.map((x) => x.key).join(","), items: itemsRaw, aiOverview, suggestions, kg: kg || null, kws: kwsNow, backlinkSum, hits: Object.fromEntries(await Promise.all([...checker.memo.entries()].map(async ([u, p2]) => [u, await p2] as const))), claudeAns, gptAns, pplxAns, gemAns, googAns, googSrc, claudeSrc, gptSrc, pplxSrc, gemSrc, cls })]).catch((e) => console.warn("Rep-Scan Cache", (e as Error).message));
    }
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
    const mk = (nm: string, raw: string[], c: J | undefined, srcs: Src[][]) => {
      const ans = QUESTIONS.map((x, i) => {
        const a = Array.isArray(c?.answers) ? c!.answers[i] || {} : {};
        const src = raw[i] ? srcs[i] || [] : [];
        if (x.key.startsWith("rec")) {
          const txt = String(raw[i] || "").toLowerCase();
          const textHit = [name, name.replace(/\s+/g, ""), own0].filter(Boolean).some((v) => txt.includes(String(v).toLowerCase())) || srcs[i]?.some((x2) => !!own0 && host(x2.u).endsWith(own0));
          const hit = textHit || a.mentioned === true;
          const rank = hit ? Number(a.rank) || null : null;
          return { key: x.key, q: x.q, text: String(raw[i] || "").slice(0, 900), sent: raw[i] ? (hit ? "pos" : "neg") : "none", known: true, mentioned: hit, rank, others: (Array.isArray(a.others) ? a.others : []).map((v: unknown) => String(v).slice(0, 60)).slice(0, 5), quote: "", sum: String(a.sum || "").slice(0, 220), src };
        }
        return { key: x.key, q: x.q, text: String(raw[i] || "").slice(0, 900), sent: raw[i] ? String(a.sent || "neu") : "none", known: raw[i] ? a.known !== false : false, quote: String(a.quote || first(raw[i])).slice(0, 300), sum: String(a.sum || "").slice(0, 220), src };
      });
      const kn = ans.filter((a) => a.sent !== "none");
      return { name: nm, known: c?.known !== false && kn.some((a) => a.known), sent: String(c?.sent || "neu"), quote: String((ans.find((a) => a.key === "serioes") || ans[0]).quote || ""), sum: String(c?.sum || "").slice(0, 240), answers: ans };
    };
    const ki = [
      ...(gptText ? [mk("ChatGPT", gptAns, cls?.gpt, gptSrc)] : []),
      ...(kiText ? [mk("Claude", claudeAns, cls?.ki, claudeSrc)] : []),
      ...(gemText ? [mk("Gemini", gemAns, cls?.gem, gemSrc)] : []),
      ...(googText ? [mk("Google KI-Übersicht", googAns, cls?.goog, googSrc)] : []),
      ...(pplxText ? [mk("Perplexity", pplxAns, cls?.pplx, pplxSrc)] : []),
    ];
    // Zusammenspiel KI ↔ Presse & Foren: Quellen, die KIs bei Kritik/Erfahrungen/Seriosität negativ zitieren, sind auch in
    // Presse & Foren kritisch – vorhandene Treffer werden auf „kritisch“ gestellt, fehlende Artikel kommen dazu.
    {
      const norm = (u: string) => String(u || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/[?#].*$/, "").replace(/\/$/, "").toLowerCase();
      const SKIP = /handelsregister|moneyhouse|zefix|northdata|wikipedia|google\.|linkedin|xing|easymonitoring|help\.ch|local\.ch|search\.ch|dnb\.com|companyhouse|firmenwissen/i;
      const cited = new Map<string, { u: string; t: string; by: Set<string> }>();
      for (const k of ki) for (const a of k.answers || []) {
        if (a.sent !== "neg" || !["kritik", "erfahrungen", "serioes"].includes(a.key)) continue;
        for (const s of a.src || []) {
          const h = host(s.u);
          if (!h || (own0 && h.endsWith(own0)) || SKIP.test(h) || DIRS.test(h) || SOCIALD.test(h)) continue;
          const key = norm(s.u); const e = cited.get(key) || { u: s.u, t: s.t, by: new Set<string>() }; e.by.add(k.name); cited.set(key, e);
        }
      }
      let up = 0, add = 0;
      for (const [key, e] of cited) {
        const by = `von ${[...e.by].join(", ")} als Kritik genannt`;
        const hit = items.filter((x) => norm(x.link) === key && x.about !== "other" && x.type !== "own");
        if (hit.length) { for (const x of hit) if (x.sent !== "neg") { x.sent = "neg"; x.note = x.note ? x.note + " · " + by : by; up++; } continue; }
        const h = host(e.u);
        const known = PRESS.test(h) || FORUM.test(h) || REVIEW.test(h);
        if (add >= 6 || (!known && e.by.size < 2)) continue;
        items.push({ i: 100000 + add, src: "web", pos: 99, title: String(e.t || h).slice(0, 160), snippet: "", link: e.u, sent: "neg", about: "self", type: REVIEW.test(h) ? "review" : FORUM.test(h) ? "forum" : "press", note: by });
        add++;
      }
      if (up || add) console.log(`Rep-Scan ${name}: KI-Kritikquellen → ${up} Treffer auf kritisch, ${add} neu in Presse & Foren`);
    }
    const ctx: Ctx = {
      loc, items, suggestions, aiOverview, aiOverviewSent: aiOverview ? String(cls?.aiOverview || "neu") : null, aiOverviewSum: aiOverview ? String(cls?.aiOverviewSum || "").slice(0, 240) : "", ki, reviews,
      kiSummary: String(cls?.kiSummary || "").slice(0, 600), kws: await kwPromise, kiWhy: Object.fromEntries([...aiErr.entries()].filter(([, v]) => v.at >= scanStart).map(([k, v]) => [k, v.why])), backlinks: backlinkSum, kgSeen, kiTried: ["ChatGPT", "Claude", "Gemini", "Perplexity"].filter((n) => (n === "ChatGPT" ? !!process.env.OPENAI_API_KEY : n === "Claude" ? !!process.env.ANTHROPIC_API_KEY : n === "Gemini" ? !!process.env.GEMINI_API_KEY : !!process.env.PERPLEXITY_API_KEY)), web: { fromGbp: siteFromGbp, via: siteVia, url: site, perf: au.perf, seo: au.seo, https: hp.https || /^https:/i.test(au.finalUrl), title: hp.title, desc: hp.desc, ok: hp.ok || !!au.html, metrics: au.metrics, checks: au.checks }, social, summary: String(cls?.summary || ""),
    };
    ctx.tier = loc.place_id ? await resolveTier({ email: loc.email, placeId: loc.place_id, country: String(loc.country || "").toUpperCase() }).catch(() => null) : null;
    await say(95, "Berechne Ihren Score aus 6 Bereichen und die besten Maßnahmen");
    const result: J = { ...evaluate(ctx), pagesRead: checker.memo.size, profile: profile || null, kiDims: buildDims(ki, cls?.dims), query: q, scannedAt: new Date().toISOString(), location: { name, city, address: loc.address, mapsUrl: loc.maps_url } };
    await say(97, "Schreibe die Zusammenfassungen für jeden Bereich");
    result.sumV = SUM_V;
    result.areaSums = await summarizeAreas(result).catch((e) => { console.warn("Rep-Scan Bereichs-Zusammenfassung", (e as Error).message); return {}; });
    await pool!.query(`UPDATE rep_scans SET status='done', progress=100, step='fertig', score=$2, result=$3, finished_at=now() WHERE id=$1`, [scanId, result.score, pgJson(result)]);
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
    const r = await pool!.query(`SELECT * FROM rep_locations WHERE email=$1 AND archived_at IS NULL ORDER BY created_at`, [email]);
    const out: J[] = [];
    for (const l of r.rows) {
      const s = await pool!.query(`SELECT id, status, progress, step, score, result, error, created_at, finished_at FROM rep_scans WHERE location_id=$1 ORDER BY created_at DESC LIMIT 24`, [l.id]);
      const done = s.rows.filter((x) => x.status === "done");
      const cur = s.rows[0] || null;
      const kiPending = !!done[0] && needsKiSum(done[0].result) && !!process.env.ANTHROPIC_API_KEY;
      if (kiPending) void backfillKiSums(done[0].id, done[0].result);
      // In Arbeit: im Portal beauftragte Maßnahmen + laufende Aufträge für dieses Google-Profil
      const inWork: J[] = [];
      const seenK = new Set<string>();
      const LBL: Record<string, string> = { profile: "Google-Profil löschen", reviews: "Bewertungen löschen", press: "Negative Beiträge prüfen", web: "Eigene Website" };
      const oo = l.place_id ? await pool!.query(`SELECT id, service, status, created_at FROM orders WHERE lower(email)=$1 AND raw->>'placeId'=$2 AND COALESCE(status,'') NOT IN ('done','storniert','konvertiert') AND created_at > now() - interval '180 days' ORDER BY created_at DESC`, [String(l.email).toLowerCase(), l.place_id]).catch(() => ({ rows: [] as J[] })) : { rows: [] as J[] };
      const ro = await pool!.query(`SELECT kind, detail, points, order_id, created_at FROM rep_orders WHERE location_id=$1 AND created_at > now() - interval '120 days' ORDER BY created_at DESC`, [l.id]).catch(() => ({ rows: [] as J[] }));
      for (const x of ro.rows) { if (seenK.has(x.kind)) continue; seenK.add(x.kind); inWork.push({ kind: x.kind, label: (x.detail && x.detail.label) || LBL[x.kind] || x.kind, at: x.created_at, orderId: x.order_id || null, points: x.points ?? null }); }
      for (const o of oo.rows) {
        const k = o.service === "remove" || o.service === "reset" ? "profile" : o.service === "reviews" ? "reviews" : o.service === "press" ? "press" : "";
        if (!k || seenK.has(k)) continue; seenK.add(k);
        inWork.push({ kind: k, label: k === "profile" && o.service === "reset" ? "Google-Profil löschen + neu anlegen" : LBL[k], at: o.created_at, orderId: o.id, points: null });
      }
      out.push({
        id: l.id, name: l.name, address: l.address, city: l.city, website: l.website, mapsUrl: l.maps_url, inWork,
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
    const arch = await pool!.query(`SELECT l.id, l.name, l.address, l.city, l.archived_at, (SELECT score FROM rep_scans s WHERE s.location_id=l.id AND s.status='done' ORDER BY s.created_at DESC LIMIT 1) AS score FROM rep_locations l WHERE l.email=$1 AND l.archived_at IS NOT NULL ORDER BY l.archived_at DESC`, [a.email]).catch(() => ({ rows: [] as J[] }));
    return { ok: true, enabled: true, locations: await locsOf(a.email), archived: arch.rows.map((x) => ({ id: x.id, name: x.name, address: x.address, city: x.city, at: x.archived_at, score: x.score })), keys: { places: !!gkey(), serp: !!skey(), ai: !!process.env.ANTHROPIC_API_KEY } };
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
      if (ex) { loc = ex; if (ex.archived_at) await pool!.query(`UPDATE rep_locations SET archived_at=NULL WHERE id=$1`, [ex.id]); }
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

  /* Website selbst eintragen (wenn keine im Google-Profil steht oder die gefundene falsch ist) */
  app.post("/cust/rep/website", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    if (a.imp) return reply.code(403).send({ ok: false, error: "imp" });
    let u = String(b.url || "").trim().slice(0, 300);
    if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
    if (u) { try { const x = new URL(u); if (!/\./.test(x.hostname)) throw new Error("host"); u = x.origin + (x.pathname === "/" ? "/" : x.pathname); } catch { return reply.code(400).send({ ok: false, error: "url" }); } }
    const r = await pool!.query(`UPDATE rep_locations SET website_manual=$3 WHERE id=$1 AND email=$2 AND archived_at IS NULL`, [String(b.locationId || ""), a.email, u || null]);
    if (!r.rowCount) return reply.code(404).send({ ok: false, error: "location" });
    return { ok: true, url: u };
  });

  /* Standort entfernen = archivieren: verschwindet aus dem Portal, Verlauf bleibt (beim erneuten Hinzufügen wieder da) */
  app.post("/cust/rep/archive", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    if (a.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const r = await pool!.query(`UPDATE rep_locations SET archived_at=now() WHERE id=$1 AND email=$2 AND archived_at IS NULL`, [String(b.locationId || ""), a.email]);
    if (!r.rowCount) return reply.code(404).send({ ok: false, error: "location" });
    return { ok: true };
  });

  /* Archivierten Standort wieder aktivieren bzw. endgültig löschen (mit allen Scans, Cache und Portal-Beauftragungen) */
  app.post("/cust/rep/unarchive", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    if (a.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const r = await pool!.query(`UPDATE rep_locations SET archived_at=NULL WHERE id=$1 AND email=$2 AND archived_at IS NOT NULL`, [String(b.locationId || ""), a.email]);
    if (!r.rowCount) return reply.code(404).send({ ok: false, error: "location" });
    return { ok: true };
  });
  app.post("/cust/rep/delete", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    if (a.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const lid = String(b.locationId || "");
    const r = await pool!.query(`DELETE FROM rep_locations WHERE id=$1 AND email=$2 AND archived_at IS NOT NULL`, [lid, a.email]);
    if (!r.rowCount) return reply.code(404).send({ ok: false, error: "location" });
    await pool!.query(`DELETE FROM rep_scans WHERE location_id=$1`, [lid]).catch(() => {});
    await pool!.query(`DELETE FROM rep_cache WHERE location_id=$1`, [lid]).catch(() => {});
    await pool!.query(`DELETE FROM rep_orders WHERE location_id=$1`, [lid]).catch(() => {});
    return { ok: true };
  });

  app.post("/cust/rep/request", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    const loc = b.locationId ? (await pool!.query(`SELECT name, city FROM rep_locations WHERE id=$1 AND email=$2`, [String(b.locationId), a.email])).rows[0] : null;
    const LBL: Record<string, string> = { website: "Website-Angebot (2.000 € pauschal, 3 Designentwürfe)", website_chatbot: "Website-Angebot (2.000 € pauschal) + Chatbot 49,90 €/Monat" };
    const what = LBL[String(b.action)] || String(b.action || "anfrage").slice(0, 60);
    if (!a.imp) await notifyTeam("Reputation-Anfrage", `${a.email} · ${loc ? loc.name + (loc.city ? ", " + loc.city : "") : ""} · ${what}`);
    return { ok: true };
  });

  /* Maßnahmen beauftragen (06.11.2026): Profil + Bewertungen als echter Auftrag über POST /order (Preis, Mails, Zahlungsart,
   * Partner – alles wie auf der Website); Löschprüfung und Website als Anfrage ans Team. Alles nur, was der letzte Scan
   * tatsächlich empfiehlt (Server prüft gegen result.measures, nicht gegen den Browser). */
  const orderHits = new Map<string, number[]>();
  app.post("/cust/rep/order", async (req, reply) => {
    const b = (req.body || {}) as J;
    const a = await auth(b);
    if (!a) return reply.code(401).send({ ok: false, error: "session" });
    if (a.off) return reply.code(403).send({ ok: false, error: "off" });
    if (a.imp) return reply.code(403).send({ ok: false, error: "imp" });
    const now = Date.now(); const hh = (orderHits.get(a.email) || []).filter((x) => now - x < 3600_000);
    if (hh.length >= 6) return reply.code(429).send({ ok: false, error: "rate" });
    hh.push(now); orderHits.set(a.email, hh);
    const loc = (await pool!.query(`SELECT * FROM rep_locations WHERE id=$1 AND email=$2 AND archived_at IS NULL`, [String(b.locationId || ""), a.email])).rows[0];
    if (!loc) return reply.code(404).send({ ok: false, error: "location" });
    const last = (await pool!.query(`SELECT result FROM rep_scans WHERE location_id=$1 AND status='done' ORDER BY created_at DESC LIMIT 1`, [loc.id])).rows[0];
    const M = last?.result?.measures as J | undefined;
    if (!M || !Array.isArray(M.items)) return reply.code(409).send({ ok: false, error: "rescan" });
    const get = (k: string) => (M.items as J[]).find((x) => x.key === k);
    const s = (b.sel || {}) as J;
    const prof = s.profile ? get("profile") : null;
    const variant = prof && (prof.variants as J[]).some((v) => v.id === s.profile) ? String(s.profile) : "";
    const revM = s.reviews ? get("reviews") : null;
    const pressM = s.press ? get("press") : null;
    const webM = s.web ? get("web") : null;
    const prot = variant === "remove" && get("schutz") && ["monthly", "yearly", "lifetime"].includes(String(s.schutz || "")) ? String(s.schutz) : "";
    if (!variant && !revM && !pressM && !webM) return reply.code(400).send({ ok: false, error: "empty" });
    if ((variant || revM) && b.agb !== true) return reply.code(400).send({ ok: false, error: "agb" });
    if (revM && b.risk !== true) return reply.code(400).send({ ok: false, error: "risk" });
    const cust = await loadCustomerOrders(a.email).catch(() => ({ name: "", lang: "de", orders: [] as unknown[] }));
    const lastO = (await pool!.query(`SELECT name, phone, company, country FROM orders WHERE lower(email)=$1 ORDER BY created_at DESC LIMIT 1`, [a.email]).catch(() => ({ rows: [] as J[] }))).rows[0] || {};
    const cc = String(loc.country || lastO.country || "AT").toUpperCase();
    const ip = String((req.headers["x-forwarded-for"] as string) || req.ip || "").split(",")[0].trim();
    const base = {
      email: a.email, name: cust.name || lastO.name || "", phone: lastO.phone || "", company: loc.name || lastO.company || "", lang: "de", country: cc,
      profile: loc.name, addr: loc.address || "", mapsUri: loc.maps_url || "", placeId: loc.place_id, placeName: loc.name, placeAddr: loc.address || "", profileCountry: cc,
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(),
      source: "dashboard", sourceFirst: "dashboard", referrer: "Reputations-Portal", landing: "/my-reviews",
    };
    const place = async (payload: J) => {
      const orderId = "RR-" + (100000 + crypto.randomInt(900000));
      const res = await app.inject({ method: "POST", url: "/order", payload: { ...base, ...payload, orderId }, headers: { "content-type": "application/json", "x-forwarded-for": ip, "user-agent": String(req.headers["user-agent"] || "").slice(0, 240) } });
      const j = (() => { try { return JSON.parse(res.body); } catch { return {}; } })() as J;
      if (res.statusCode >= 400 || j.ok === false || j.saved === false) throw new Error(String(j.error || `order ${res.statusCode}`));
      return orderId;
    };
    const rec = async (kind: string, detail: J, points: number | null, orderId: string | null) =>
      pool!.query(`INSERT INTO rep_orders (id, location_id, email, kind, detail, points, order_id) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id(), loc.id, a.email, kind, pgJson(detail), points, orderId]);
    const done: J[] = [];
    try {
      if (variant) {
        const v = (prof!.variants as J[]).find((x) => x.id === variant)!;
        const wantX = variant === "remove" && s.express === true;
        const oid = await place({ service: variant === "reset" ? "reset" : "remove", protection: prot, express: wantX,
          note: `Reputations-Portal: ${v.label}${wantX ? " + Express" : ""}${prot ? ` + Schutz (${prot})` : ""}` });
        await rec("profile", { label: variant === "reset" ? "Google-Profil löschen + neu anlegen" : "Google-Profil löschen", variant, prot, express: wantX }, Number(v.points) || null, oid);
        done.push({ kind: "profile", orderId: oid });
      }
      if (revM) {
        const items = (revM.reviews as J[]).map((x) => {
          const full = ((last.result.reviewsInfo?.list || []) as J[]).find((y) => y.id === x.id) || x;
          return { ...(full.link ? { url: full.link } : {}), name: full.name, text: full.text, rating: full.rating, days: full.days };
        });
        const oid = await place({ service: "reviews", protection: "", riskConsent: { at: new Date().toISOString(), ip, ua: String(req.headers["user-agent"] || "").slice(0, 240), v: "2026-10-29", via: "reputation" }, reviewItems: items, reviewUrls: items.map((x) => x.url).filter(Boolean), reviewCount: items.length,
          note: `Reputations-Portal (Empfehlung nach Reputations-Check, ${cc}): ${items.length} Bewertung${items.length === 1 ? "" : "en"}\n${items.map((x) => x.url || `${x.name} — "${x.text || ""}"`).join("\n")}` });
        await rec("reviews", { label: revM.title, n: items.length }, Number(revM.points) || null, oid);
        done.push({ kind: "reviews", orderId: oid });
      }
    } catch (e) {
      app.log.warn({ err: e }, "Rep-Auftrag");
      return reply.code(502).send({ ok: false, error: "order", done });
    }
    const asks: string[] = [];
    if (pressM) { await rec("press", { label: "Negative Beiträge prüfen", links: (pressM.items as J[]).map((x) => x.link) }, Number(pressM.points) || null, null); asks.push(`Löschprüfung:\n${(pressM.items as J[]).map((x) => `• ${x.title} – ${x.link}`).join("\n")}`); done.push({ kind: "press" }); }
    if (webM) { await rec("web", { label: s.bot ? "Eigene Website + Chatbot" : "Eigene Website", bot: !!s.bot }, Number(webM.points) || null, null); asks.push(s.bot ? "Website (2.000 €) + Chatbot 49,90 €/Monat" : "Website (2.000 €)"); done.push({ kind: "web" }); }
    await notifyTeam("Reputation: Maßnahmen beauftragt", `${a.email} · ${loc.name}${loc.city ? ", " + loc.city : ""}\n${done.map((d) => d.kind + (d.orderId ? ` (${d.orderId})` : "")).join(", ")}${asks.length ? "\n\n" + asks.join("\n\n") : ""}`).catch(() => {});
    return { ok: true, done };
  });
}
