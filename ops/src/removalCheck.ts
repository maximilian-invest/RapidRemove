/* „Removed" nur mit Prüfung (08.10.2026): Bevor eine Aufgabe auf „removed" geht (= Kunde wird belastet),
 * öffnet Lena (KI) den Bewertungs-Link JETZT (Screenshot über ScreenshotOne) und vergleicht ihn mit dem
 * Screenshot von der Bestellung. Ergebnis:
 *   gone    → Status wird gesetzt, Partner sieht „Verified – removed"
 *   visible → Status bleibt, Partner sieht „Still visible on Google" + aktuellen Screenshot
 *   unknown → (kein Link / Screenshot-Dienst/KI nicht verfügbar / Seite nicht eindeutig) → Partner muss ausdrücklich bestätigen
 * Jede Prüfung wird gespeichert (removal_checks) – Nachweis für Admin und Kunde. */
import { pool } from "./db";
import { captureShot, shotKey } from "./reviewShots";

const MODEL = () => process.env.REMOVAL_MODEL || process.env.VERIFY_MODEL || process.env.CHAT_MODEL || "claude-sonnet-5-5";
export type RemovalResult = { result: "gone" | "visible" | "unknown"; reason: string; checkId?: number };

let ready = false;
async function init(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`CREATE TABLE IF NOT EXISTS removal_checks (
    id serial PRIMARY KEY, task_id bigint NOT NULL, order_id text, result text NOT NULL, reason text, confidence real,
    mime text, img bytea, created_at timestamptz NOT NULL DEFAULT now())`);
  ready = true;
}

type Task = { id: string | number; order_id: string | null; url: string | null; name: string | null; text: string | null };

async function ai(before: { buf: Buffer; mime: string } | null, after: { buf: Buffer; mime: string }, t: Task): Promise<{ visible: boolean | null; confidence: number; reason: string } | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const system = `You check whether ONE specific Google review has been deleted. A removal partner claims it is gone; the customer is charged only if that is true, so be strict.
You get ${before ? "two screenshots: BEFORE (taken when the order was placed – shows the review) and AFTER (taken just now by opening the same review link)" : "one screenshot AFTER (taken just now by opening the review link)"}.
When a Google review is deleted, its link usually opens the business page / Google Maps without that review, a generic Maps view, or a "not available" notice.
If AFTER still shows the same review (same reviewer name and same text/stars), it is still visible.
If AFTER is a consent page, a blank/loading page, an error that is not about the review, or otherwise does not allow a decision, answer visible: null.
Answer ONLY with JSON: {"visible": true|false|null, "confidence": 0.0-1.0, "reason": "one short sentence in English for the partner"}`;
  const info = `The review: reviewer "${t.name || "?"}"${t.text ? `, text: "${String(t.text).slice(0, 400)}"` : " (rating without text)"}. Review link: ${t.url}`;
  const img = (x: { buf: Buffer; mime: string }) => ({ type: "image", source: { type: "base64", media_type: x.mime, data: x.buf.toString("base64") } });
  const content = [
    ...(before ? [{ type: "text", text: "BEFORE:" }, img(before)] : []),
    { type: "text", text: "AFTER:" }, img(after), { type: "text", text: info },
  ];
  const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 60_000);
  try {
    const res = await fetch(`${(process.env.VERIFY_AI_URL || "https://api.anthropic.com").replace(/\/+$/, "")}/v1/messages`, {
      method: "POST", signal: ctl.signal,
      headers: {
        "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01",
        ...(process.env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID.trim() } : {}),
      },
      body: JSON.stringify({ model: MODEL(), max_tokens: 300, system, messages: [{ role: "user", content }] }),
    });
    const j = (await res.json().catch(() => ({}))) as { content?: { type: string; text?: string }[]; error?: { message?: string } };
    if (!res.ok) throw new Error(j.error?.message || "HTTP " + res.status);
    const txt = (j.content || []).filter((c) => c.type === "text").map((c) => c.text || "").join("");
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const o = JSON.parse(m[0]) as { visible?: boolean | null; confidence?: number; reason?: string };
    return { visible: o.visible === true ? true : o.visible === false ? false : null, confidence: Math.max(0, Math.min(1, Number(o.confidence) || 0)), reason: String(o.reason || "").slice(0, 300) };
  } catch (e) {
    console.error("Löschprüfung: KI fehlgeschlagen", e);
    return null;
  } finally { clearTimeout(tm); }
}

/* Methode 1 (ohne Screenshot): Bewertungsliste des Profils live über SerpApi (google_maps_reviews).
 * Profil (data_id) und Bewertungs-ID stehen im Google-Link. Sortiert nach Sternen (schlechteste zuerst) wird die
 * Liste durchgegangen: Bewertung gefunden → noch sichtbar. Alle Bewertungen mit diesen Sternen gesehen (oder Liste zu Ende)
 * und nicht gefunden → gelöscht. Sonst (sehr viele Bewertungen) → nicht eindeutig → Methode 2. */
async function serpCheck(t: Task, rating: number | null, placeId: string | null): Promise<{ result: "gone" | "visible"; reason: string } | { result: "unknown"; why: string }> {
  const key = (process.env.SERPAPI_KEY || "").trim();
  if (!key) return { result: "unknown", why: "SERPAPI_KEY fehlt" };
  const url = String(t.url || "");
  const dataId = (/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/i.exec(url) || [])[1] || "";
  const reviewId = (/!1s(Ci[0-9A-Za-z_-]{10,})/.exec(url) || [])[1] || "";
  if (!dataId && !placeId) return { result: "unknown", why: "kein Profil im Link" };
  const nm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const wantName = nm(String(t.name || "")), wantText = nm(String(t.text || "")).slice(0, 60);
  const high = rating != null && rating >= 4;
  let token: string | null = null;
  for (let page = 0; page < 10; page++) {
    const p = new URLSearchParams({ engine: "google_maps_reviews", sort_by: high ? "ratingHigh" : "ratingLow", hl: "en", api_key: key });
    if (dataId) p.set("data_id", dataId); else p.set("place_id", placeId!);
    if (token) { p.set("next_page_token", token); p.set("num", "20"); }
    let data: any = null;
    try { const res = await fetch((process.env.SERPAPI_BASE || "https://serpapi.com") + "/search.json?" + p.toString(), { signal: AbortSignal.timeout(30_000) }); data = await res.json().catch(() => null); if (!res.ok || !data || data.error) return { result: "unknown", why: "SerpApi: " + String(data?.error || res.status).slice(0, 120) }; }
    catch (e) { return { result: "unknown", why: "SerpApi nicht erreichbar" }; }
    const list: any[] = Array.isArray(data.reviews) ? data.reviews : [];
    for (const r of list) {
      const rid = String(r.review_id || ""), link = String(r.link || "");
      const sameId = !!reviewId && (rid === reviewId || link.includes(reviewId));
      const sameLink = !!url && link === url;
      const txt = nm(String(r.extracted_snippet?.original || r.snippet || ""));
      const samePerson = !!wantName && nm(String(r.user?.name || "")) === wantName && (!wantText || txt.startsWith(wantText.slice(0, 30)) || txt.includes(wantText.slice(0, 30)));
      if (sameId || sameLink || samePerson) return { result: "visible", reason: `The review by ${t.name || "the reviewer"} is still listed on Google.` };
      const rr = Math.round(Number(r.rating) || 0);
      // Sterne-Band verlassen (sortiert) → alle Bewertungen mit diesen Sternen geprüft, nicht dabei → gelöscht
      if (rating != null && rr && (high ? rr < rating : rr > rating)) return { result: "gone", reason: `All ${rating}-star reviews checked – ${t.name || "the review"} is no longer listed.` };
    }
    token = data.serpapi_pagination?.next_page_token || null;
    if (!token || !list.length) return { result: "gone", reason: `All reviews of this profile checked – ${t.name || "the review"} is no longer listed.` };
  }
  return { result: "unknown", why: "zu viele Bewertungen mit diesen Sternen" };
}

export async function checkRemoval(t: Task): Promise<RemovalResult & { why?: string }> {
  if (!pool) return { result: "unknown", reason: "no database" };
  await init();
  if (!t.url || !/^https?:\/\//.test(t.url)) return { result: "unknown", reason: "No review link – can't check automatically.", why: "kein Link" };
  // Sterne + Profil aus der Bestellung (für Methode 1)
  let rating: number | null = null, placeId: string | null = null;
  if (t.order_id) {
    const o = (await pool.query(`SELECT raw FROM orders WHERE id=$1`, [t.order_id]).catch(() => ({ rows: [] as { raw: any }[] }))).rows[0];
    const items: any[] = Array.isArray(o?.raw?.reviewItems) ? o.raw.reviewItems : [];
    const it = items.find((x) => x && (x.url === t.url || (x.name === t.name && x.text === t.text)));
    rating = it && Number(it.rating) >= 1 ? Math.round(Number(it.rating)) : null;
    placeId = String(o?.raw?.placeId || "") || null;
  }
  const sc = await serpCheck(t, rating, placeId).catch((e) => ({ result: "unknown" as const, why: String((e as Error)?.message || e) }));
  if (sc.result !== "unknown") {
    await pool.query(`INSERT INTO removal_checks (task_id, order_id, result, reason, confidence) VALUES ($1,$2,$3,$4,$5)`,
      [Number(t.id), t.order_id, sc.result, sc.reason + " (Google review list)", 0.95]).catch(() => {});
    return { result: sc.result, reason: sc.reason };
  }
  // Methode 2: Screenshot jetzt + KI-Vergleich mit dem Screenshot von der Bestellung
  if (!shotKey() || !process.env.ANTHROPIC_API_KEY) return { result: "unknown", reason: "The check isn't possible right now.", why: `Liste: ${sc.why} · Screenshot/KI nicht eingerichtet` };
  let after: { buf: Buffer; mime: string };
  try { const s = await captureShot(t.url); after = { buf: s.buf, mime: s.mime }; }
  catch (e) { return { result: "unknown", reason: "Google could not be checked right now.", why: `Liste: ${sc.why} · Screenshot: ${String((e as Error)?.message || e).replace(/https?:\S+/g, "").slice(0, 160)}` }; }
  const b = t.order_id ? (await pool.query(`SELECT mime, img FROM review_shots WHERE order_id=$1 AND url=$2 AND status='ok' AND img IS NOT NULL ORDER BY created_at LIMIT 1`, [t.order_id, t.url]).catch(() => ({ rows: [] as { mime: string; img: Buffer }[] }))).rows[0] : null;
  const before = b ? { buf: b.img as Buffer, mime: String(b.mime || "image/jpeg") } : null;
  const v = await ai(before, after, t);
  const result: RemovalResult["result"] = !v ? "unknown" : v.visible === true && v.confidence >= 0.5 ? "visible" : v.visible === false && v.confidence >= 0.6 ? "gone" : "unknown";
  const reason = v?.reason || "The check was not conclusive.";
  const r = await pool.query(`INSERT INTO removal_checks (task_id, order_id, result, reason, confidence, mime, img) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [Number(t.id), t.order_id, result, reason, v?.confidence ?? null, after.mime, after.buf]).catch(() => ({ rows: [] as { id: number }[] }));
  return { result, reason, checkId: r.rows[0]?.id };
}

export async function removalShot(id: number, taskIds?: number[]): Promise<{ mime: string; img: Buffer } | null> {
  if (!pool) return null;
  await init();
  const r = await pool.query(`SELECT mime, img, task_id FROM removal_checks WHERE id=$1`, [id]);
  const x = r.rows[0];
  if (!x || (taskIds && !taskIds.includes(Number(x.task_id)))) return null;
  return { mime: x.mime, img: x.img };
}
