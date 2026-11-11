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
  days: number;   // Alter in Tagen (-1 = unbekannt) – zeigt Google „vor 4 Wochen" o. älter, mindestens 28 (siehe ageDays)
  rel?: string;   // Googles Altersangabe wie angezeigt („vor 4 Wochen", „a month ago")
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
/** Wochen laut Googles Anzeige („vor 4 Wochen" → 4, „a week ago" → 1, Monat/Jahr → 99, sonst 0). Alle Website-Sprachen. */
export const relWeeks = (rel: string): number => {
  const s = String(rel || "").toLowerCase();
  if (!s) return 0;
  if (/(month|monat|mes(es)?\b|mois|mese|mesi|maand|månad|måned|måne?d|か月|ヶ月|カ月|year|jahr|año|\ban(s)?\b|anno|anni|jaar|(^|\s)år(\s|$)|年)/.test(s)) return 99;
  if (!/(week|woche|seman|semaine|settiman|weken|vecka|veckor|\buge|\buger|\buke|\buker|週)/.test(s)) return 0;
  const n = s.match(/\d+/);
  return n ? Number(n[0]) : 1;
};
/** Maßgeblich ist, was Google anzeigt (Entscheidung Maximilian 10.11.2026): steht dort „vor 4 Wochen" (oder älter),
 *  gilt die Bewertung als älter als 4 Wochen – auch wenn das ISO-Datum erst 25–27 Tage zurückliegt. */
export const ageDays = (iso: string | undefined, rel?: string): number => {
  const d = daysSince(iso);
  return relWeeks(rel || "") >= 4 && d >= 0 && d < 28 ? 28 : d;
};
/** Cache-Treffer: Alter neu rechnen (Cache bis 6 h alt). */
const fresh = (r: FetchedReview): FetchedReview => ({ ...r, days: r.date ? ageDays(r.date, r.rel) : r.days });

export async function fetchPlaceReviews(placeId: string, lang: string): Promise<FetchedReview[]> {
  const key = serpKey();
  if (!key) throw new Error("SERPAPI_KEY fehlt");
  const ck = placeId + "|" + lang;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.ts < CACHE_MS) return hit.data.map(fresh);

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
        days: ageDays(r.iso_date, r.date),
        rel: String(r.date || "").slice(0, 60),
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
  date: String(r.iso_date || ""), days: ageDays(r.iso_date, r.date), rel: String(r.date || "").slice(0, 60), link: String(r.link || ""),
});
export async function findPlaceReview(placeId: string, reviewId: string, lang: string): Promise<FetchedReview | null> {
  const key = serpKey();
  if (!key || !placeId || !reviewId) return null;
  const ck = placeId + "|" + reviewId;
  const c = oneCache.get(ck);
  if (c && Date.now() - c.ts < CACHE_MS) return c.r ? fresh(c.r) : null;
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

/** Bewertungs-Wächter (reviewWatch.ts): neueste Bewertungen, ohne Cache (der tägliche Scan soll immer den aktuellen Stand
 *  sehen und den Wizard-Cache nicht mit einer kurzen Liste überschreiben).
 *  Regel Maximilian 11.11.2026: Sobald Google bei einer Bewertung „vor 4 Wochen" (oder älter) anzeigt, NICHT weiterblättern –
 *  alles ab da können wir nicht löschen. Geblättert wird also nur, solange die ganze Seite jünger als 4 Wochen ist
 *  (höchstens REVIEW_WATCH_PAGES Seiten, Standard 5). Zurück kommen nur Bewertungen jünger als 4 Wochen. */
export const isTooOld = (r: FetchedReview): boolean => relWeeks(r.rel || "") >= 4 || r.days >= 28;
/** Neueste-zuerst-Liste bis zur ersten Bewertung mit „vor 4 Wochen" (oder älter) – ab da wird nichts mehr genommen. */
export function takeUntilOld(list: FetchedReview[]): { keep: FetchedReview[]; reachedOld: boolean } {
  const keep: FetchedReview[] = [];
  for (const r of list) { if (isTooOld(r)) return { keep, reachedOld: true }; keep.push(r); }
  return { keep, reachedOld: false };
}
export async function fetchNewestReviews(placeId: string, lang: string): Promise<FetchedReview[]> {
  const key = serpKey();
  if (!key) throw new Error("SERPAPI_KEY fehlt");
  const maxPages = Math.min(10, Math.max(1, Number(process.env.REVIEW_WATCH_PAGES) || 5));
  const out: FetchedReview[] = [];
  let token: string | null = null;
  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ engine: "google_maps_reviews", place_id: placeId, sort_by: "newestFirst", hl: lang, api_key: key });
    if (token) { params.set("next_page_token", token); params.set("num", "20"); }
    countCall();
    const res = await fetch((process.env.SERPAPI_BASE || "https://serpapi.com") + "/search.json?" + params.toString(), { signal: AbortSignal.timeout(30_000) });
    const data: any = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) {
      if (out.length) break;
      throw new Error("SerpApi " + res.status + ": " + String(data?.error || "").slice(0, 200));
    }
    // Geänderte Bewertungen („Edited a week ago"): Google sortiert und zeigt nach dem Änderungsdatum → das zählt hier.
    const list: FetchedReview[] = (Array.isArray(data.reviews) ? data.reviews : []).map((x: any, i: number) => {
      const r = mapR(x, i);
      const ed = String(x.iso_date_of_last_edit || "");
      return ed && Date.parse(ed) > Date.parse(r.date || "0") ? { ...r, date: ed, days: ageDays(ed, r.rel) } : r;
    });
    const { keep, reachedOld } = takeUntilOld(list);
    out.push(...keep);
    token = data.serpapi_pagination?.next_page_token || null;
    if (reachedOld || !token || !list.length) break; // „vor 4 Wochen" erreicht → Schluss
  }
  return out;
}
