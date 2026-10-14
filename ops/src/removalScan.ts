/* Auto-Scan einer Bestellung (14.10.2026) – Partner-Dashboard, Button „Scan all reviews".
 *
 * Grundsatz: „Gelöscht" belastet die Karte des Kunden automatisch. Deshalb markiert der Scan eine Bewertung NUR dann
 * als gelöscht, wenn ZWEI unabhängige Quellen übereinstimmen – und es einen Nachweis gibt, dass die Bewertung bei
 * der Bestellung wirklich online war:
 *
 *   1. Google-Link (eigener Browser):  Google zeigt ausdrücklich „This review is no longer available" o. ä.
 *   2. Google-Bewertungsliste (SerpApi, ohne Cache): die Bewertung ist dort NICHT mehr gelistet
 *      – geprüft über Review-ID UND Verfassername (strenger als die normale Prüfung: Name allein reicht, um „noch da" anzunehmen).
 *   3. Nachweis „war online": Bewertung kam bei der Bestellung aus der Google-Liste (Alter bekannt), ODER eine frühere
 *      Prüfung hat sie sichtbar gesehen, ODER der Partner hat sie auf „Working" gesetzt.
 *
 * Alles andere (eine Quelle unklar, Quellen widersprechen sich, kein Nachweis) → NICHTS wird geändert, der Kunde wird
 * nicht belastet; der Partner sieht den Grund, das Team bekommt eine Push-Nachricht.
 * Bewusst KEINE KI/Screenshot-Entscheidung: die ist für die automatische Verrechnung nicht eindeutig genug. */
import { pool } from "./db";
import { expandShortLink, resolveReviewLink } from "./monitor";
import { probeReviewLink } from "./linkProbe";

export type ScanTask = { id: string | number; order_id: string | null; url: string | null; name: string | null; text: string | null; rating?: number | null; status: string };
export type LinkSignal = "gone" | "visible" | "unknown";
export type ListSignal = { state: "absent" | "listed" | "unknown"; detail: string };
export type ScanDecision = { result: "gone" | "visible" | "unknown"; reason: string; why: string };

const norm = (x: string) => String(x || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

/** Reine Entscheidung (ohne Netz) – getestet in removalScan.test.ts. Nur „gone", wenn alles eindeutig zusammenpasst. */
export function decide(link: LinkSignal, list: ListSignal, existed: boolean, who: string): ScanDecision {
  const w = who || "the reviewer";
  if (link === "visible") return { result: "visible", reason: `The review by ${w} is still shown on Google.`, why: "Link: sichtbar" };
  if (list.state === "listed" && link !== "gone") return { result: "visible", reason: `The review by ${w} is still listed on Google.`, why: "Liste: noch gelistet · " + list.detail };
  if (link !== "gone") return { result: "unknown", reason: "Google could not be checked clearly right now – nothing was changed.", why: "Link: nicht eindeutig" };
  if (list.state === "listed") return { result: "unknown", reason: "Google's review page says removed, but Google's review list still shows it. Google usually catches up within a day – nothing was changed, please scan again later.", why: "Link: gelöscht · Liste: noch gelistet · " + list.detail };
  if (list.state !== "absent") return { result: "unknown", reason: "The second check (Google review list) wasn't possible right now – nothing was changed.", why: "Link: gelöscht · Liste: " + list.detail };
  if (!existed) return { result: "unknown", reason: "We can't prove this review was online when the order was placed – RapidRemove will confirm it by hand.", why: "Link + Liste: gelöscht · kein Nachweis, dass die Bewertung bei Bestellung online war" };
  return { result: "gone", reason: "Double-checked: Google says the review is no longer available and it's gone from the review list.", why: "Link: gelöscht · Liste: " + list.detail };
}

type Page = { reviews: { review_id?: string; link?: string; user?: { name?: string }; rating?: number }[]; next: string | null; error?: string };
export type PageFetcher = (p: { dataId: string; placeId: string; sort: "ratingLow" | "ratingHigh"; token: string | null }) => Promise<Page>;

const serpFetcher: PageFetcher = async ({ dataId, placeId, sort, token }) => {
  const key = (process.env.SERPAPI_KEY || "").trim();
  if (!key) return { reviews: [], next: null, error: "SERPAPI_KEY fehlt" };
  const p = new URLSearchParams({ engine: "google_maps_reviews", sort_by: sort, hl: "en", no_cache: "true", api_key: key });
  if (dataId) p.set("data_id", dataId); else p.set("place_id", placeId);
  if (token) { p.set("next_page_token", token); p.set("num", "20"); }
  try {
    const res = await fetch((process.env.SERPAPI_BASE || "https://serpapi.com") + "/search.json?" + p.toString(), { signal: AbortSignal.timeout(30_000) });
    const data: any = await res.json().catch(() => null);
    if (!res.ok || !data || data.error) return { reviews: [], next: null, error: "SerpApi: " + String(data?.error || res.status).slice(0, 120) };
    return { reviews: Array.isArray(data.reviews) ? data.reviews : [], next: data.serpapi_pagination?.next_page_token || null };
  } catch { return { reviews: [], next: null, error: "SerpApi nicht erreichbar" }; }
};

/** Bewertungsliste streng durchsuchen. „absent" nur, wenn die Liste zu Ende ist ODER der Sterne-Bereich mit 1 Stern
 *  Sicherheitsabstand vollständig gesehen wurde – ohne Treffer bei Review-ID, Link oder Verfassername. */
export async function strictListCheck(a: { url: string; reviewId: string; name: string; rating: number | null; placeId: string | null }, fetchPage: PageFetcher = serpFetcher, maxPages = 12): Promise<ListSignal> {
  const dataId0 = (/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i.exec(a.url) || [])[1] || "";
  const dataId = /^0x0:/i.test(dataId0) ? "" : dataId0;
  if (!dataId && !a.placeId) return { state: "unknown", detail: "kein Profil im Link" };
  const wantName = norm(a.name);
  if (!a.reviewId && wantName.length < 2) return { state: "unknown", detail: "weder Review-ID noch Verfassername" };
  const high = a.rating != null && a.rating >= 4;
  let token: string | null = null, seen = 0;
  for (let page = 0; page < maxPages; page++) {
    const pg = await fetchPage({ dataId, placeId: a.placeId || "", sort: high ? "ratingHigh" : "ratingLow", token });
    if (pg.error) return { state: "unknown", detail: pg.error };
    for (const r of pg.reviews) {
      seen++;
      const rid = String(r.review_id || ""), link = String(r.link || "");
      const byId = !!a.reviewId && (rid === a.reviewId || link.includes(a.reviewId));
      const byLink = !!link && link === a.url;
      const byName = wantName.length >= 2 && norm(String(r.user?.name || "")) === wantName;
      if (byId || byLink || byName) return { state: "listed", detail: `${byId ? "Review-ID" : byLink ? "Link" : "Verfassername"} gefunden${r.rating ? ` (${Math.round(Number(r.rating))}★)` : ""}` };
      const rr = Math.round(Number(r.rating) || 0);
      // Sterne-Bereich + 1 Stern Abstand komplett gesehen → nicht mehr gelistet
      if (a.rating != null && rr && (high ? rr < a.rating - 1 : rr > a.rating + 1)) return { state: "absent", detail: `alle Bewertungen mit ${a.rating}★ (±1) geprüft, ${seen} gesehen` };
    }
    token = pg.next;
    if (!token || !pg.reviews.length) return { state: "absent", detail: `ganze Liste geprüft (${seen} Bewertungen)` };
  }
  return { state: "unknown", detail: `zu viele Bewertungen (${seen} geprüft, nicht zu Ende)` };
}

let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS removal_checks (
    id serial PRIMARY KEY, task_id bigint NOT NULL, order_id text, result text NOT NULL, reason text, confidence real,
    mime text, img bytea, created_at timestamptz NOT NULL DEFAULT now())`);
  ready = true;
}

/** Google-Link öffnen; ist der Browser gerade ausgelastet (andere Prüfung), kurz warten und erneut versuchen. */
async function probeWithRetry(url: string, name: string | null): Promise<{ state: LinkSignal; note: string }> {
  for (let i = 0; i < 6; i++) {
    const p = await probeReviewLink(url, name).catch((e) => ({ state: "unknown" as const, text: "", ms: 0, error: String((e as Error)?.message || e) }));
    if (p.state !== "unknown") return { state: p.state, note: `${p.ms} ms` };
    if (!/ausgelastet/.test(String(p.error || ""))) return { state: "unknown", note: String(p.error || "unklar").slice(0, 160) };
    await new Promise((r) => setTimeout(r, 4000));
  }
  return { state: "unknown", note: "Browser dauerhaft ausgelastet" };
}

/** Strenge Prüfung EINER Bewertung für den Auto-Scan. Speichert jede Prüfung in removal_checks (Nachweis). */
export async function checkRemovalStrict(t: ScanTask): Promise<ScanDecision> {
  if (!pool) return { result: "unknown", reason: "The check isn't possible right now.", why: "keine Datenbank" };
  await init();
  const save = (d: ScanDecision) => pool!.query(`INSERT INTO removal_checks (task_id, order_id, result, reason, confidence) VALUES ($1,$2,$3,$4,$5)`,
    [Number(t.id), t.order_id, d.result, `Auto-Scan (doppelt): ${d.why}`, d.result === "gone" ? 0.99 : null]).catch(() => {});
  if (!t.url || !/^https?:\/\//.test(t.url)) { const d: ScanDecision = { result: "unknown", reason: "No review link – can't check automatically.", why: "kein Link" }; await save(d); return d; }
  const longUrl = await expandShortLink(t.url).catch(() => t.url as string);
  const dec = (() => { try { return decodeURIComponent(longUrl); } catch { return longUrl; } })();
  const reviewId = (dec.match(/!1s(C[A-Za-z0-9_-]{16,})/) || [])[1] || "";

  // Bestellung: Sterne, Profil und ob die Bewertung aus der Google-Liste kam (Alter bekannt = war bei Bestellung online)
  let rating: number | null = null, placeId: string | null = null, fromList = false;
  if (t.order_id) {
    const o = (await pool.query(`SELECT raw FROM orders WHERE id=$1`, [t.order_id]).catch(() => ({ rows: [] as { raw: any }[] }))).rows[0];
    const items: any[] = Array.isArray(o?.raw?.reviewItems) ? o.raw.reviewItems : [];
    const it = items.find((x) => x && ((t.url && x.url === t.url) || (x.name === t.name && x.text === t.text)));
    rating = it && Number(it.rating) >= 1 ? Math.round(Number(it.rating)) : null;
    fromList = !!it && Number.isFinite(Number(it.days)) && it.days !== null && it.days !== undefined && Number(it.days) >= 0;
    placeId = String(o?.raw?.placeId || "") || null;
  }
  if (rating == null && Number(t.rating) >= 1 && Number(t.rating) <= 5) rating = Math.round(Number(t.rating));

  // Quelle 1: Google-Link
  const link = await probeWithRetry(longUrl, t.name);
  if (link.state === "visible") { const d = decide("visible", { state: "unknown", detail: "nicht nötig" }, true, t.name || ""); d.why += ` (${link.note})`; await save(d); return d; }
  if (link.state !== "gone") { const d = decide("unknown", { state: "unknown", detail: "nicht geprüft" }, true, t.name || ""); d.why += ` (${link.note})`; await save(d); return d; }

  // Quelle 2: Bewertungsliste
  if (!placeId) placeId = (await resolveReviewLink(longUrl).catch(() => null))?.place?.placeId || null;
  const list = await strictListCheck({ url: longUrl, reviewId, name: String(t.name || ""), rating, placeId }).catch((e) => ({ state: "unknown" as const, detail: String((e as Error)?.message || e).slice(0, 120) }));

  // Nachweis „war bei Bestellung online"
  let existed = fromList || t.status === "working";
  if (!existed) existed = ((await pool.query(`SELECT 1 FROM removal_checks WHERE task_id=$1 AND result='visible' LIMIT 1`, [Number(t.id)]).catch(() => ({ rows: [] }))).rows.length > 0);

  const d = decide("gone", list, existed, t.name || "");
  await save(d);
  return d;
}
