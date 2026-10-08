/*
 * reviewsFetch.ts — lädt die Google-Bewertungen eines Profils über SerpApi
 * (Engine „google_maps_reviews"), damit der Kunde im Bewertungs-Wizard die zu
 * löschenden Bewertungen einfach anhaken kann, statt Links zu suchen.
 *
 * Die Places API liefert höchstens 5 Bewertungen – SerpApi die ganze Liste.
 * Neueste zuerst. Auch ältere Bewertungen sind bestellbar (ca. 50 %, +50), und
 * der Kunde sucht im Wizard nach Bewertername — daher wird bis SERPAPI_PAGES
 * geblättert, unabhängig vom Alter.
 *
 * Schlüssel: Railway-Variable SERPAPI_KEY (NIE ins Repo – es ist öffentlich).
 * Optional: SERPAPI_PAGES (Standard 3 Seiten ≈ bis zu 48 Bewertungen).
 * Ohne Schlüssel antwortet der Endpunkt { enabled: false } und der Wizard
 * zeigt nur die manuelle Link-Eingabe (wie bisher).
 */

export type FetchedReview = {
  id: string;
  name: string;
  photo: string;
  rating: number;
  text: string;
  date: string;   // ISO-Datum
  days: number;   // Alter in Tagen (-1 = unbekannt)
  link: string;
};

export const serpKey = (): string => (process.env.SERPAPI_KEY || "").trim();

const CACHE_MS = 6 * 3600_000;
const cache = new Map<string, { ts: number; data: FetchedReview[] }>();

let usage = { month: "", calls: 0 };
/** Grobe Verbrauchsanzeige (SerpApi-Suchen seit Serverstart im laufenden Monat). */
export function serpUsage() { return { ...usage }; }
function countCall() {
  const m = new Date().toISOString().slice(0, 7);
  if (usage.month !== m) usage = { month: m, calls: 0 };
  usage.calls++;
}

const daysSince = (iso: string | undefined): number => {
  if (!iso) return -1;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / 86_400_000)) : -1;
};

export async function fetchPlaceReviews(placeId: string, lang: string): Promise<FetchedReview[]> {
  const key = serpKey();
  if (!key) throw new Error("SERPAPI_KEY fehlt");
  const ck = placeId + "|" + lang;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.ts < CACHE_MS) return hit.data;

  const maxPages = Math.min(10, Math.max(1, Number(process.env.SERPAPI_PAGES) || 3));
  const out: FetchedReview[] = [];
  let token: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      engine: "google_maps_reviews", place_id: placeId, sort_by: "newestFirst", hl: lang, api_key: key,
    });
    if (token) { params.set("next_page_token", token); params.set("num", "20"); }
    countCall();
    const res = await fetch((process.env.SERPAPI_BASE || "https://serpapi.com") + "/search.json?" + params.toString(), { signal: AbortSignal.timeout(30_000) });
    const data: any = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) {
      if (out.length) break; // was wir haben, reicht
      throw new Error("SerpApi " + res.status + ": " + String(data?.error || "").slice(0, 200));
    }
    const list: any[] = Array.isArray(data.reviews) ? data.reviews : [];
    for (const r of list) {
      out.push({
        id: String(r.review_id || r.link || out.length),
        name: String(r.user?.name || "Google user").slice(0, 120),
        photo: String(r.user?.thumbnail || ""),
        rating: Math.round(Number(r.rating) || 0),
        text: String(r.extracted_snippet?.original || r.snippet || "").slice(0, 2000),
        date: String(r.iso_date || ""),
        days: daysSince(r.iso_date),
        link: String(r.link || ""),
      });
    }
    token = data.serpapi_pagination?.next_page_token || null;
    if (!token || !list.length) break;
  }
  cache.set(ck, { ts: Date.now(), data: out });
  if (cache.size > 500) cache.delete(cache.keys().next().value as string);
  return out;
}

/** Eine bestimmte Bewertung (Review-ID aus dem Teilen-Link) finden – auch wenn sie nicht unter den neuesten ist:
 *  1) neueste Seiten (Cache von fetchPlaceReviews), 2) nach Sternen sortiert (schlechteste zuerst, max. 10 Seiten),
 *  3) beste zuerst (falls eine gute Bewertung gemeint ist). Gefundene Bewertungen 6 h im Cache. */
const oneCache = new Map<string, { ts: number; r: FetchedReview | null }>();
const mapR = (r: any, i: number): FetchedReview => ({
  id: String(r.review_id || r.link || i), name: String(r.user?.name || "Google user").slice(0, 120), photo: String(r.user?.thumbnail || ""),
  rating: Math.round(Number(r.rating) || 0), text: String(r.extracted_snippet?.original || r.snippet || "").slice(0, 2000),
  date: String(r.iso_date || ""), days: daysSince(r.iso_date), link: String(r.link || ""),
});
export async function findPlaceReview(placeId: string, reviewId: string, lang: string): Promise<FetchedReview | null> {
  const key = serpKey();
  if (!key || !placeId || !reviewId) return null;
  const ck = placeId + "|" + reviewId;
  const c = oneCache.get(ck);
  if (c && Date.now() - c.ts < CACHE_MS) return c.r;
  const hit = (l: FetchedReview[]) => l.find((x) => x.id === reviewId || (x.link && x.link.includes(reviewId))) || null;
  let found = hit(await fetchPlaceReviews(placeId, lang).catch(() => [] as FetchedReview[]));
  for (const sort of ["ratingLow", "ratingHigh"]) {
    if (found) break;
    let token: string | null = null;
    for (let page = 0; page < (sort === "ratingLow" ? 10 : 4) && !found; page++) {
      const params = new URLSearchParams({ engine: "google_maps_reviews", place_id: placeId, sort_by: sort, hl: lang, api_key: key });
      if (token) { params.set("next_page_token", token); params.set("num", "20"); }
      countCall();
      const res = await fetch((process.env.SERPAPI_BASE || "https://serpapi.com") + "/search.json?" + params.toString(), { signal: AbortSignal.timeout(30_000) }).catch(() => null);
      const data: any = res ? await res.json().catch(() => null) : null;
      if (!res || !res.ok || !data || data.error) break;
      const list: any[] = Array.isArray(data.reviews) ? data.reviews : [];
      found = hit(list.map(mapR));
      token = data.serpapi_pagination?.next_page_token || null;
      if (!token || !list.length) break;
    }
  }
  oneCache.set(ck, { ts: Date.now(), r: found });
  if (oneCache.size > 500) oneCache.delete(oneCache.keys().next().value as string);
  return found;
}
