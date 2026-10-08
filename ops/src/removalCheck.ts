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

export async function checkRemoval(t: Task): Promise<RemovalResult> {
  if (!pool) return { result: "unknown", reason: "no database" };
  await init();
  if (!t.url || !/^https?:\/\//.test(t.url)) return { result: "unknown", reason: "No review link – can't check automatically." };
  if (!shotKey() || !process.env.ANTHROPIC_API_KEY) return { result: "unknown", reason: "Automatic check not available right now." };
  let after: { buf: Buffer; mime: string };
  try { const s = await captureShot(t.url); after = { buf: s.buf, mime: s.mime }; }
  catch (e) { return { result: "unknown", reason: "Google could not be opened right now." }; }
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
