/*
 * monitor.ts — Überwachung gelöschter Google-Unternehmensprofile (Admin → Monitor).
 *
 * - Liste: automatisch aus Profil-Bestellungen mit Schutz/Überwachung, sobald sie
 *   „gelöscht" (status=done) sind; dazu manuell hinzugefügte Profile.
 * - Täglicher Scan um 05:00 (Europe/Vienna) + „Alle prüfen" / „Jetzt prüfen".
 *   Prüfung: Place-ID direkt (Places API bzw. SerpApi) und Suche nach Name + Adresse.
 * - Scheinbarer Fund → Verifizierung per Screenshot (ScreenshotOne) inkl. Seitentitel:
 *   nur wenn die Google-Maps-Seite das Profil wirklich zeigt (Firmenname im Titel),
 *   gilt es als „Wieder erschienen". ERST DANN gehen Push + E-Mail (mit Screenshot und
 *   Profil-Link) an helpdesk@rapid-remove.com (MONITOR_ALERT_TO).
 *
 * Schlüssel (Railway): GOOGLE_MAPS_API_KEY (bevorzugt) oder SERPAPI_KEY für die Suche,
 * SCREENSHOTONE_KEY für die Verifizierung. Ohne Suchschlüssel schlägt jede Prüfung fehl
 * (Status „Prüfung fehlgeschlagen"), ohne Screenshot-Schlüssel wird nie alarmiert.
 */
import * as React from "react";
import type { FastifyInstance } from "fastify";
import { render } from "@react-email/render";
import { pool, dbReady, listPushSubscriptions, deletePushSubscription } from "./db";
import { hasWebPush, sendWebPushAll } from "./integrations/webpush";
import { sendPush } from "./integrations/push";
import { sendMail } from "./mailer";
import { captureShot, shotKey } from "./reviewShots";
import { serpKey } from "./reviewsFetch";
import ProfilWiedererschienen, { subject as reappearedSubject } from "./emails/ProfilWiedererschienen";

const SITE_URL = (process.env.SITE_URL || "https://www.rapid-remove.com").replace(/\/+$/, "");
const ALERT_TO = () => (process.env.MONITOR_ALERT_TO || "helpdesk@rapid-remove.com").trim();
const gkey = () => (process.env.GOOGLE_MAPS_API_KEY || "").trim();
const PLACES_BASE = () => (process.env.GOOGLE_PLACES_BASE || "https://places.googleapis.com").replace(/\/+$/, ""); // Override nur für Tests
const TZ = "Europe/Vienna";
const SCAN_HOUR = 5;

type Log = (o: object, m: string) => void;
let log: Log = () => {};

/* ---------------- Datenbank ---------------- */

let ready = false;
async function ensureTables(): Promise<void> {
  if (ready || !pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitor_profiles (
      id            serial PRIMARY KEY,
      order_id      text UNIQUE,
      business_name text NOT NULL,
      address       text,
      place_id      text,
      maps_url      text,
      cust_name     text,
      cust_email    text,
      lang          text,
      type          text NOT NULL DEFAULT 'monthly',
      since         timestamptz NOT NULL DEFAULT now(),
      status        text NOT NULL DEFAULT 'ok',
      last_check_at timestamptz,
      found_at      timestamptz,
      found_url     text,
      paused_at     timestamptz,
      note          text,
      source        text NOT NULL DEFAULT 'order',
      created_at    timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitor_checks (
      id          serial PRIMARY KEY,
      profile_id  integer NOT NULL,
      checked_at  timestamptz NOT NULL DEFAULT now(),
      result      text NOT NULL,
      note        text,
      page_title  text,
      mime        text,
      img         bytea,
      actor       text
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS monitor_checks_profile ON monitor_checks (profile_id, checked_at DESC)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitor_runs (
      id          serial PRIMARY KEY,
      kind        text NOT NULL,
      started_at  timestamptz NOT NULL DEFAULT now(),
      finished_at timestamptz,
      total       integer NOT NULL DEFAULT 0,
      done        integer NOT NULL DEFAULT 0,
      found       integer NOT NULL DEFAULT 0,
      failed      integer NOT NULL DEFAULT 0,
      cancelled   boolean NOT NULL DEFAULT false
    )
  `);
  ready = true;
}

/** Bestellungen mit Schutz/Überwachung, deren Profil gelöscht ist → in die Überwachung. */
async function syncFromOrders(): Promise<void> {
  await pool!.query(`
    INSERT INTO monitor_profiles (order_id, business_name, address, place_id, maps_url, cust_name, cust_email, lang, type, since, source)
    SELECT o.id,
           COALESCE(NULLIF(o.profile, ''), NULLIF(o.company, ''), o.id),
           NULLIF(o.raw->>'addr', ''),
           NULLIF(o.raw->>'placeId', ''),
           NULLIF(o.raw->>'mapsUri', ''),
           o.name, o.email, o.lang,
           CASE WHEN o.protection = 'lifetime' THEN 'lifetime' ELSE 'monthly' END,
           COALESCE(o.done_at, o.created_at),
           'order'
      FROM orders o
     WHERE o.status = 'done'
       AND COALESCE(o.protection, '') NOT IN ('', 'none')
       AND COALESCE(o.service, '') NOT IN ('reviews', 'deindex')
    ON CONFLICT (order_id) DO NOTHING
  `);
}

type Profile = {
  id: number; order_id: string | null; business_name: string; address: string | null; place_id: string | null;
  maps_url: string | null; cust_name: string | null; cust_email: string | null; lang: string | null; type: string;
  since: string; status: string; last_check_at: string | null; found_at: string | null; found_url: string | null;
  paused_at: string | null; note: string | null; source: string;
};

async function getProfile(id: number): Promise<Profile | null> {
  const r = await pool!.query(`SELECT * FROM monitor_profiles WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

async function addCheck(profileId: number, result: string, note: string, extra: { title?: string; mime?: string; img?: Buffer; actor?: string } = {}): Promise<number> {
  const r = await pool!.query(
    `INSERT INTO monitor_checks (profile_id, result, note, page_title, mime, img, actor) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [profileId, result, note.slice(0, 500), extra.title || null, extra.mime || null, extra.img || null, extra.actor || null],
  );
  return r.rows[0].id;
}

/* ---------------- Google-Suche ---------------- */

type Place = { name: string; address: string; placeId: string; mapsUrl: string; status?: string };

const mapsFromId = (pid: string) => "https://www.google.com/maps/place/?q=place_id:" + encodeURIComponent(pid);

/** Profil per Place-ID: Place | null (nicht mehr vorhanden). Wirft bei technischen Fehlern. */
async function placeById(pid: string): Promise<Place | null> {
  if (gkey()) {
    const res = await fetch(`${PLACES_BASE()}/v1/places/${encodeURIComponent(pid)}?languageCode=de`, {
      headers: { "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": "id,displayName,formattedAddress,googleMapsUri,businessStatus" },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status === 404) return null;
    const j: any = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = String(j?.error?.message || res.status);
      if (/not found|no longer valid|invalid.*place id/i.test(msg) || j?.error?.status === "NOT_FOUND") return null;
      throw new Error("Places API: " + msg.slice(0, 160));
    }
    if (!j || !j.id) return null;
    return { name: j.displayName?.text || "", address: j.formattedAddress || "", placeId: j.id, mapsUrl: j.googleMapsUri || mapsFromId(j.id), status: j.businessStatus || "" };
  }
  if (serpKey()) {
    const p = new URLSearchParams({ engine: "google_maps", place_id: pid, hl: "de", api_key: serpKey() });
    const res = await fetch("https://serpapi.com/search.json?" + p, { signal: AbortSignal.timeout(30_000) });
    const j: any = await res.json().catch(() => null);
    if (j && j.error && /hasn't returned any results|no results/i.test(String(j.error))) return null;
    if (!res.ok || !j || j.error) throw new Error("SerpApi: " + String(j?.error || res.status).slice(0, 160));
    const r = j.place_results;
    if (!r || !r.title) return null;
    return { name: r.title, address: r.address || "", placeId: r.place_id || pid, mapsUrl: mapsFromId(r.place_id || pid) };
  }
  throw new Error("Kein Suchschlüssel (GOOGLE_MAPS_API_KEY oder SERPAPI_KEY)");
}

/** Textsuche (Name + Ort/Adresse) → Kandidaten. Wirft bei technischen Fehlern. */
async function searchPlaces(q: string): Promise<Place[]> {
  if (gkey()) {
    const res = await fetch(PLACES_BASE() + "/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.businessStatus" },
      body: JSON.stringify({ textQuery: q, languageCode: "de", pageSize: 10 }),
      signal: AbortSignal.timeout(20_000),
    });
    const j: any = await res.json().catch(() => null);
    if (!res.ok) throw new Error("Places API: " + String(j?.error?.message || res.status).slice(0, 160));
    return ((j && j.places) || []).map((x: any) => ({ name: x.displayName?.text || "", address: x.formattedAddress || "", placeId: x.id, mapsUrl: x.googleMapsUri || mapsFromId(x.id), status: x.businessStatus || "" }));
  }
  if (serpKey()) {
    const p = new URLSearchParams({ engine: "google_maps", q, type: "search", hl: "de", api_key: serpKey() });
    const res = await fetch("https://serpapi.com/search.json?" + p, { signal: AbortSignal.timeout(30_000) });
    const j: any = await res.json().catch(() => null);
    if (j && j.error && /hasn't returned any results|no results/i.test(String(j.error))) return [];
    if (!res.ok || !j || j.error) throw new Error("SerpApi: " + String(j?.error || res.status).slice(0, 160));
    const list: any[] = Array.isArray(j.local_results) ? j.local_results : j.place_results ? [j.place_results] : [];
    return list.filter((x) => x && x.title).map((x) => ({ name: x.title, address: x.address || "", placeId: x.place_id || "", mapsUrl: x.place_id ? mapsFromId(x.place_id) : "" }));
  }
  throw new Error("Kein Suchschlüssel (GOOGLE_MAPS_API_KEY oder SERPAPI_KEY)");
}

/** Profil per Google-CID (Bewertungs-Links enthalten nur „0x…:0x<CID>", keinen Namen).
 *  1) Places-API (Legacy-Details mit cid) → Place-ID → placeById, 2) SerpApi google_maps data_cid. */
async function placeByCid(cid: string): Promise<Place | null> {
  if (!/^\d{5,25}$/.test(cid)) return null;
  if (gkey()) {
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?cid=${cid}&fields=place_id&key=${encodeURIComponent(gkey())}`, { signal: AbortSignal.timeout(15_000) });
      const j: any = await res.json().catch(() => null);
      const pid = j && j.result && j.result.place_id;
      if (pid) { const p = await placeById(pid); if (p) return p; }
    } catch { /* weiter mit SerpApi */ }
  }
  if (serpKey()) {
    const p = new URLSearchParams({ engine: "google_maps", type: "place", data_cid: cid, hl: "de", api_key: serpKey() });
    const res = await fetch("https://serpapi.com/search.json?" + p, { signal: AbortSignal.timeout(30_000) });
    const j: any = await res.json().catch(() => null);
    const x = j && j.place_results;
    if (x && x.title) return { name: x.title, address: x.address || "", placeId: x.place_id || "", mapsUrl: x.place_id ? mapsFromId(x.place_id) : `https://maps.google.com/?cid=${cid}` };
  }
  // 3) Notnagel: Google-Maps-Seite der CID → Vorschau-JSON (Name + Adresse) → normale Suche
  try {
    const ua = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36" };
    const page = await (await fetch(`https://www.google.com/maps?cid=${cid}&hl=de`, { headers: ua, signal: AbortSignal.timeout(15_000) })).text();
    const m = page.match(/<link href="(\/maps\/preview\/place\?[^"]+)"/);
    if (m) {
      const prev = await (await fetch("https://www.google.com" + m[1].replace(/&amp;/g, "&"), { headers: ua, signal: AbortSignal.timeout(15_000) })).text();
      const d = JSON.parse(prev.replace(/^\)\]\}'\s*/, ""));
      const info = d && d[6];
      const name = info && typeof info[11] === "string" ? info[11] : "";
      const addr = info && Array.isArray(info[2]) ? info[2].filter((v: unknown) => typeof v === "string").join(", ") : "";
      if (name) {
        const list = await searchPlaces([name, addr].filter(Boolean).join(", ")).catch(() => [] as Place[]);
        return list[0] || { name, address: addr, placeId: "", mapsUrl: `https://maps.google.com/?cid=${cid}` };
      }
    }
  } catch { /* nichts gefunden */ }
  return null;
}

/* ---------------- Abgleich ---------------- */

const STOP = new Set(["gmbh", "kg", "og", "ag", "eu", "co", "und", "the", "and", "der", "die", "das", "mbh", "gesmbh", "inh", "e", "u", "ltd", "inc", "llc", "srl", "sl", "sa", "bv", "ab", "as", "aps"]);
const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, " ").trim();
const tokens = (s: string) => norm(s).split(" ").filter((t) => t.length >= 3 && !STOP.has(t));

/** Anteil der Namens-Wörter, die im anderen Text vorkommen. */
function nameScore(name: string, other: string): number {
  const a = tokens(name);
  if (!a.length) return norm(name) && norm(other).includes(norm(name)) ? 1 : 0;
  const b = new Set(norm(other).split(" "));
  return a.filter((t) => b.has(t)).length / a.length;
}
const postcode = (s: string) => (String(s || "").match(/\b\d{4,5}\b/) || [""])[0];

function sameBusiness(p: Profile, c: Place): boolean {
  if (nameScore(p.business_name, c.name) < 0.6 && nameScore(c.name, p.business_name) < 0.6) return false;
  const pc = postcode(p.address || ""), cc = postcode(c.address);
  if (pc && cc) return pc === cc;
  // Ohne Postleitzahl: Name muss praktisch identisch sein.
  return norm(p.business_name) === norm(c.name);
}

/** Zeigt die Google-Maps-Seite (laut Seitentitel) wirklich dieses Profil? */
function titleShowsProfile(title: string, name: string): boolean {
  const t = norm(title);
  if (!t || t === "google maps") return false;
  return nameScore(name, title) >= 0.6;
}

/* ---------------- Prüfung ---------------- */

const fmtCity = (addr: string | null) => {
  const a = String(addr || "");
  const m = a.match(/\b\d{4,5}\s+([^,]+)/);
  return m ? m[1].trim() : (a.split(",").slice(-2, -1)[0] || "").trim();
};

/** Prüft EIN Profil. Rückgabe: Ergebnis-Code. */
async function checkProfile(id: number, actor?: string): Promise<"ok" | "found" | "still" | "fail" | "skip"> {
  const p = await getProfile(id);
  if (!p || p.status === "paused" || p.status === "exp") return "skip";
  let cand: Place | null = null;
  try {
    if (p.place_id) {
      const byId = await placeById(p.place_id);
      if (byId) cand = byId;
    }
    if (!cand) {
      const q = [p.business_name, p.address].filter(Boolean).join(", ");
      const list = await searchPlaces(q);
      cand = list.find((c) => sameBusiness(p, c)) || null;
    }
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    await addCheck(id, "fail", "Suche fehlgeschlagen: " + msg, { actor });
    await pool!.query(`UPDATE monitor_profiles SET status = CASE WHEN status = 'found' THEN status ELSE 'fail' END, last_check_at = now() WHERE id = $1`, [id]);
    return "fail";
  }

  if (!cand) {
    // Nicht (mehr) sichtbar. War es als Fund markiert → automatisch „erneut gelöscht".
    const next = p.status === "found" ? "re" : p.status === "fail" ? (p.found_at ? "re" : "ok") : p.status;
    await addCheck(id, p.status === "found" ? "re" : "ok", p.status === "found"
      ? "Nicht mehr bei Google gefunden – automatisch als erneut gelöscht markiert"
      : "Nicht gefunden · Suche nach Name, Adresse und Profil-ID", { actor });
    await pool!.query(`UPDATE monitor_profiles SET status = $2, last_check_at = now() WHERE id = $1`, [id, next]);
    return "ok";
  }

  // Scheinbarer Fund → mit Screenshot verifizieren.
  if (!shotKey()) {
    await addCheck(id, "fail", "Möglicher Treffer (" + cand.name + "), aber keine Verifizierung möglich: SCREENSHOTONE_KEY fehlt", { actor });
    await pool!.query(`UPDATE monitor_profiles SET status = CASE WHEN status = 'found' THEN status ELSE 'fail' END, last_check_at = now() WHERE id = $1`, [id]);
    return "fail";
  }
  let shot: { buf: Buffer; mime: string; title: string } | null = null;
  try { shot = await captureShot(cand.mapsUrl); }
  catch (e) {
    try { shot = await captureShot(cand.mapsUrl); } // 1 Wiederholung
    catch (e2) {
      await addCheck(id, "fail", "Möglicher Treffer (" + cand.name + "), Screenshot fehlgeschlagen: " + String((e2 as Error)?.message || e2), { actor });
      await pool!.query(`UPDATE monitor_profiles SET status = CASE WHEN status = 'found' THEN status ELSE 'fail' END, last_check_at = now() WHERE id = $1`, [id]);
      return "fail";
    }
  }
  const verified = titleShowsProfile(shot.title, p.business_name) || titleShowsProfile(shot.title, cand.name);
  if (!verified) {
    await addCheck(id, "ok", "Möglicher Treffer nicht bestätigt – Google Maps zeigt kein Profil (Titel: „" + (shot.title || "—") + "“)", { title: shot.title, mime: shot.mime, img: shot.buf, actor });
    const next = p.status === "fail" ? (p.found_at ? "re" : "ok") : p.status === "found" ? "re" : p.status;
    await pool!.query(`UPDATE monitor_profiles SET status = $2, last_check_at = now() WHERE id = $1`, [id, next]);
    return "ok";
  }

  const wasFound = p.status === "found";
  const checkId = await addCheck(id, "found", wasFound
    ? "Weiterhin sichtbar · Screenshot aktualisiert"
    : "Profil wieder öffentlich sichtbar · per Screenshot bestätigt" + (cand.placeId && cand.placeId !== p.place_id ? " (neue Profil-ID " + cand.placeId + ")" : ""),
    { title: shot.title, mime: shot.mime, img: shot.buf, actor });
  await pool!.query(
    `UPDATE monitor_profiles SET status = 'found', last_check_at = now(), found_url = $2, found_at = CASE WHEN status = 'found' THEN found_at ELSE now() END WHERE id = $1`,
    [id, cand.mapsUrl],
  );
  if (!wasFound) await alertFound({ ...p, found_url: cand.mapsUrl }, cand, shot, checkId);
  return wasFound ? "still" : "found"; // nur NEUE Funde zählen im Scan-Ergebnis
}

/** Erst NACH der Verifizierung: Push + E-Mail mit Screenshot und Profil-Link an helpdesk@. */
async function alertFound(p: Profile, cand: Place, shot: { buf: Buffer; mime: string }, checkId: number): Promise<void> {
  const city = fmtCity(p.address || cand.address);
  const title = "Profil wieder erschienen";
  const body = `${p.business_name}${city ? " (" + city + ")" : ""} ist wieder bei Google sichtbar`;
  const adminUrl = SITE_URL + "/admin?monitor=" + p.id;
  try {
    if (hasWebPush() && dbReady()) {
      const subs = await listPushSubscriptions();
      if (subs.length) {
        const expired = await sendWebPushAll(subs, { title, body, url: adminUrl, tag: "rr-mon-" + p.id, kind: "monitor" });
        for (const ep of expired) await deletePushSubscription(ep).catch(() => {});
      }
    }
  } catch (e) { log({ err: String(e) }, "Monitor: Web-Push fehlgeschlagen"); }
  try { await sendPush(title, body, adminUrl); } catch (e) { log({ err: String(e) }, "Monitor: Push fehlgeschlagen"); }

  const esc = (s: string) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const row = (l: string, v: string) => v ? `<tr><td style="padding:4px 16px 4px 0;color:#6b6259;white-space:nowrap">${l}</td><td style="padding:4px 0;font-weight:600">${v}</td></tr>` : "";
  const btn = (href: string, label: string, primary: boolean) =>
    `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;border-radius:999px;font-weight:700;text-decoration:none;${primary ? "background:#ff8000;color:#fff" : "background:#fff;color:#1c1916;border:1px solid #e6dfd6"}">${label}</a>`;
  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1c1916;max-width:640px">` +
    `<div style="background:#fdecec;color:#e23b3b;font-weight:800;border-radius:12px;padding:12px 16px;margin:0 0 16px">⚠ Profil wieder erschienen – per Screenshot bestätigt</div>` +
    `<h2 style="margin:0 0 4px;font-size:22px">${esc(p.business_name)}</h2>` +
    `<div style="color:#6b6259;margin:0 0 14px">${esc(cand.address || p.address || "")}</div>` +
    `<table style="border-collapse:collapse;font-size:14px;margin:0 0 16px">` +
    row("Kunde", esc(p.cust_name || "")) + row("E-Mail", esc(p.cust_email || "")) + row("Bestellung", esc(p.order_id || "")) +
    row("Überwachung", p.type === "lifetime" ? "Lebenslang" : "Monatlich") +
    row("Gefunden", new Date().toLocaleString("de-AT", { timeZone: TZ, dateStyle: "short", timeStyle: "short" }) + " Uhr") +
    `</table>` +
    btn(cand.mapsUrl, "Profil bei Google öffnen", true) + btn(adminUrl, "Im Admin ansehen", false) +
    `<div style="margin:12px 0 6px;color:#6b6259;font-size:13px">Beweis-Screenshot:</div>` +
    `<img src="cid:monitor-shot" alt="Screenshot" style="width:100%;max-width:640px;border:1px solid #e6dfd6;border-radius:12px" />` +
    `<div style="margin-top:10px;color:#9a8f84;font-size:12px">Link: <a href="${esc(cand.mapsUrl)}">${esc(cand.mapsUrl)}</a></div>` +
    `</div>`;
  const ext = shot.mime === "image/png" ? "png" : "jpg";
  // Nur für lokale Tests: Mail statt zu senden in einen Ordner schreiben.
  if (process.env.MONITOR_MAIL_DUMP) {
    const fs = await import("node:fs");
    fs.mkdirSync(process.env.MONITOR_MAIL_DUMP, { recursive: true });
    fs.writeFileSync(`${process.env.MONITOR_MAIL_DUMP}/alert-${p.id}.html`, html.replace("cid:monitor-shot", `alert-${p.id}.${ext}`));
    fs.writeFileSync(`${process.env.MONITOR_MAIL_DUMP}/alert-${p.id}.${ext}`, shot.buf);
    return;
  }
  try {
    await sendMail({
      to: ALERT_TO(), subject: `⚠ Profil wieder erschienen – ${p.business_name}${city ? " (" + city + ")" : ""}`, html,
      attachments: [{ filename: `monitor-${p.id}-${checkId}.${ext}`, content: shot.buf, contentType: shot.mime, cid: "monitor-shot" }],
    });
  } catch (e) { log({ err: String(e), id: p.id }, "Monitor: Alarm-Mail fehlgeschlagen"); }
}

/* ---------------- Scan-Läufe ---------------- */

type Run = { id: number; kind: string; total: number; done: number; found: number; failed: number; current: string; cancel: boolean; startedAt: string };
let run: Run | null = null;
const single = new Set<number>();

async function startRun(kind: "auto" | "manual"): Promise<Run | null> {
  if (run || !dbReady() || !pool) return run;
  await ensureTables();
  await syncFromOrders();
  const r = await pool.query(`SELECT id, business_name FROM monitor_profiles WHERE status NOT IN ('paused','exp') AND source <> 'deleted' ORDER BY (status = 'found') DESC, id`);
  const ins = await pool.query(`INSERT INTO monitor_runs (kind, total) VALUES ($1,$2) RETURNING id, started_at`, [kind, r.rows.length]);
  const cur: Run = { id: ins.rows[0].id, kind, total: r.rows.length, done: 0, found: 0, failed: 0, current: "", cancel: false, startedAt: ins.rows[0].started_at };
  run = cur;
  (async () => {
    const retry: number[] = [];
    try {
      for (const row of r.rows as { id: number; business_name: string }[]) {
        if (cur.cancel) break;
        cur.current = row.business_name;
        const res = await checkProfile(row.id, kind === "auto" ? "Auto-Scan" : "Alle prüfen").catch(() => "fail" as const);
        if (res === "fail") retry.push(row.id);
        if (res === "found") cur.found++;
        cur.done++;
        await pool!.query(`UPDATE monitor_runs SET done = $2, found = $3 WHERE id = $1`, [cur.id, cur.done, cur.found]);
      }
      // Fehlgeschlagene einmal am Ende erneut versuchen (z. B. kurzer Google-Timeout).
      for (const id of retry) {
        if (cur.cancel) break;
        const res = await checkProfile(id, "Wiederholung").catch(() => "fail" as const);
        if (res === "fail") cur.failed++;
        if (res === "found") cur.found++;
      }
    } finally {
      await pool!.query(`UPDATE monitor_runs SET finished_at = now(), done = $2, found = $3, failed = $4, cancelled = $5 WHERE id = $1`, [cur.id, cur.done, cur.found, cur.failed, cur.cancel]).catch(() => {});
      log({ run: cur.id, kind, total: cur.total, found: cur.found, failed: cur.failed, cancelled: cur.cancel }, "Monitor-Scan fertig");
      run = null;
    }
  })();
  return cur;
}

function checkSingle(id: number, actor?: string): void {
  if (single.has(id)) return;
  single.add(id);
  checkProfile(id, actor || "Jetzt prüfen").catch(() => {}).finally(() => single.delete(id));
}

/* ---------------- Zeitplan 05:00 ---------------- */

function viennaParts(d = new Date()) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
  const o: Record<string, string> = {};
  for (const x of f.formatToParts(d)) o[x.type] = x.value;
  return { date: `${o.year}-${o.month}-${o.day}`, hour: Number(o.hour) % 24, minute: Number(o.minute) };
}

/** Nächster Auto-Scan als ISO-Zeit (05:00 Wien, heute oder morgen). */
function nextScanAt(): string {
  const now = new Date();
  for (let add = 0; add < 2; add++) {
    // 05:00 Wien = 03:00 oder 04:00 UTC je nach Sommerzeit → beide Kandidaten prüfen.
    for (const utcH of [3, 4]) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + add, utcH, 0));
      const v = viennaParts(d);
      if (v.hour === SCAN_HOUR && v.minute === 0 && d > now) return d.toISOString();
    }
  }
  return new Date(now.getTime() + 24 * 3600e3).toISOString();
}

async function autoTick(): Promise<void> {
  if (!dbReady() || !pool || run) return;
  const v = viennaParts();
  if (v.hour < SCAN_HOUR) return;
  await ensureTables();
  const r = await pool.query(
    `SELECT 1 FROM monitor_runs WHERE kind = 'auto' AND to_char(started_at AT TIME ZONE '${TZ}', 'YYYY-MM-DD') = $1 LIMIT 1`,
    [v.date],
  );
  if (r.rows.length) return;
  await startRun("auto");
}

/* ---------------- Admin-API ---------------- */

const profileOut = (p: any) => ({
  id: p.id, orderId: p.order_id, name: p.business_name, address: p.address || "", placeId: p.place_id || "",
  mapsUrl: p.maps_url || (p.place_id ? mapsFromId(p.place_id) : ""), foundUrl: p.found_url || "",
  custName: p.cust_name || "", custEmail: p.cust_email || "", lang: p.lang || "de", type: p.type,
  since: p.since, status: p.status, lastCheckAt: p.last_check_at, foundAt: p.found_at, pausedAt: p.paused_at,
  note: p.note || "", source: p.source, lastShotId: p.last_shot_id || null, lastNote: p.last_note || "",
});

/** Google-Maps-Link → Name (+ Koordinaten) für die Suche. Kurzlinks werden aufgelöst. */
async function resolveMapsLink(link: string): Promise<{ q: string; placeId?: string; cid?: string }> {
  let url = link.trim();
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) {
    try {
      const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
      const loc = res.headers.get("location");
      if (loc) url = loc;
    } catch { /* weiter mit Original */ }
  }
  let pid = "";
  try {
    const u = new URL(url);
    const q = u.searchParams.get("q") || u.searchParams.get("query") || "";
    const m1 = q.match(/place_id:([A-Za-z0-9_-]+)/); if (m1) pid = m1[1];
    const qp = u.searchParams.get("query_place_id"); if (qp) pid = qp;
    const m = decodeURIComponent(u.pathname).match(/\/maps\/place\/([^/]+)/);
    const name = m ? m[1].replace(/\+/g, " ") : q.replace(/place_id:[A-Za-z0-9_-]+/, "").trim();
    // Bewertungs-/Teilen-Links: /maps/reviews/data=…!1s0x0:0x<CID>… oder ?cid=… → CID (dezimal)
    let cid = u.searchParams.get("cid") || "";
    const hx = decodeURIComponent(url).match(/0x[0-9a-f]+:0x([0-9a-f]{6,16})/i);
    if (!cid && hx) { try { cid = BigInt("0x" + hx[1]).toString(); } catch { /* egal */ } }
    return { q: name, placeId: pid || undefined, cid: cid || undefined };
  } catch { return { q: url }; }
}

/** Bewertungs-Teilen-Link → Profil (über die CID im Link) + Review-ID (für den Abgleich mit SerpApi). */
export async function resolveReviewLink(link: string): Promise<{ place: Place | null; reviewId: string }> {
  let url = link.trim();
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) {
    try { const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000) }); const loc = res.headers.get("location"); if (loc) url = loc; } catch { /* Original */ }
  }
  const dec = (() => { try { return decodeURIComponent(url); } catch { return url; } })();
  const rid = (dec.match(/!1s(C[A-Za-z0-9_-]{16,})/) || [])[1] || "";
  const r = await resolveMapsLink(url);
  let place: Place | null = null;
  if (r.placeId) place = await placeById(r.placeId).catch(() => null);
  if (!place && r.cid) place = await placeByCid(r.cid).catch(() => null);
  if (!place && r.q) place = (await searchPlaces(r.q).catch(() => [] as Place[]))[0] || null;
  return { place, reviewId: rid };
}

export function registerMonitor(app: FastifyInstance, adminOk: (token: unknown) => boolean): void {
  log = (o, m) => app.log.info(o, m);
  const guard = (b: Record<string, unknown>, reply: any) => {
    if (!adminOk(b.token)) { reply.code(401).send({ ok: false, error: "unauthorized" }); return false; }
    if (!dbReady() || !pool) { reply.code(503).send({ ok: false, error: "Keine Datenbank" }); return false; }
    return true;
  };

  app.post("/admin/monitor/list", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    await ensureTables();
    await syncFromOrders();
    const r = await pool!.query(`
      SELECT p.*, lc.id AS last_shot_id, ln.note AS last_note
        FROM monitor_profiles p
        LEFT JOIN LATERAL (SELECT id FROM monitor_checks c WHERE c.profile_id = p.id AND c.img IS NOT NULL AND c.result = 'found' ORDER BY checked_at DESC LIMIT 1) lc ON true
        LEFT JOIN LATERAL (SELECT note FROM monitor_checks c WHERE c.profile_id = p.id ORDER BY checked_at DESC LIMIT 1) ln ON true
      WHERE p.source <> 'deleted'
       ORDER BY p.id`);
    const last = await pool!.query(`SELECT id, kind, started_at, finished_at, total, done, found, failed, cancelled FROM monitor_runs WHERE finished_at IS NOT NULL ORDER BY started_at DESC LIMIT 1`);
    return {
      ok: true,
      keys: { search: !!(gkey() || serpKey()), searchVia: gkey() ? "places" : serpKey() ? "serpapi" : "", screenshots: !!shotKey() },
      profiles: r.rows.map(profileOut),
      run: run ? { id: run.id, kind: run.kind, total: run.total, done: run.done, found: run.found, current: run.current, startedAt: run.startedAt } : null,
      checking: [...single],
      lastRun: last.rows[0] || null,
      nextRunAt: nextScanAt(),
    };
  });

  app.post("/admin/monitor/detail", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    await ensureTables();
    const id = Number(b.id);
    const p = await getProfile(id);
    if (!p) return reply.code(404).send({ ok: false, error: "nicht gefunden" });
    const c = await pool!.query(`SELECT id, checked_at, result, note, page_title, actor, (img IS NOT NULL) AS has_img FROM monitor_checks WHERE profile_id = $1 ORDER BY checked_at DESC LIMIT 200`, [id]);
    return { ok: true, profile: profileOut(p), checks: c.rows, checking: single.has(id) || !!(run && run.current === p.business_name) };
  });

  app.post("/admin/monitor/scan", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    await ensureTables();
    if (b.id) { checkSingle(Number(b.id), String(b.actor || "") || undefined); return { ok: true, single: true }; }
    const r = await startRun("manual");
    return { ok: true, started: !!r };
  });

  app.post("/admin/monitor/cancel", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    if (run) run.cancel = true;
    return { ok: true };
  });

  app.post("/admin/monitor/action", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    await ensureTables();
    const id = Number(b.id);
    const p = await getProfile(id);
    if (!p) return reply.code(404).send({ ok: false, error: "nicht gefunden" });
    const actor = String(b.actor || "Admin").slice(0, 40);
    const a = String(b.action || "");
    if (a === "re") {
      await pool!.query(`UPDATE monitor_profiles SET status = 're' WHERE id = $1`, [id]);
      await addCheck(id, "re", "Erneut bei Google gemeldet und entfernt · " + actor, { actor });
    } else if (a === "pause") {
      await pool!.query(`UPDATE monitor_profiles SET status = 'paused', paused_at = now() WHERE id = $1`, [id]);
      await addCheck(id, "paused", "Überwachung pausiert · " + actor, { actor });
    } else if (a === "resume") {
      await pool!.query(`UPDATE monitor_profiles SET status = CASE WHEN found_at IS NOT NULL THEN 're' ELSE 'ok' END, paused_at = NULL WHERE id = $1`, [id]);
      await addCheck(id, "resumed", "Überwachung fortgesetzt · " + actor, { actor });
    } else if (a === "note") {
      await pool!.query(`UPDATE monitor_profiles SET note = $2 WHERE id = $1`, [id, String(b.note || "").slice(0, 2000)]);
    } else if (a === "type") {
      const t = b.type === "lifetime" ? "lifetime" : "monthly";
      await pool!.query(`UPDATE monitor_profiles SET type = $2 WHERE id = $1`, [id, t]);
    } else if (a === "delete") {
      await pool!.query(`DELETE FROM monitor_checks WHERE profile_id = $1`, [id]);
      await pool!.query(`DELETE FROM monitor_profiles WHERE id = $1`, [id]);
      // Bestellung bleibt bestehen; Sync legt sie NICHT neu an, weil order_id … → Merker setzen:
      if (p.order_id) await pool!.query(`INSERT INTO monitor_profiles (order_id, business_name, status, source) VALUES ($1, $2, 'exp', 'deleted') ON CONFLICT (order_id) DO NOTHING`, [p.order_id, p.business_name]);
    } else return reply.code(400).send({ ok: false, error: "unbekannte Aktion" });
    return { ok: true };
  });

  app.post("/admin/monitor/inform", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    await ensureTables();
    const id = Number(b.id);
    const p = await getProfile(id);
    if (!p) return reply.code(404).send({ ok: false, error: "nicht gefunden" });
    if (!p.cust_email) return reply.code(400).send({ ok: false, error: "Keine Kunden-E-Mail hinterlegt" });
    const lang = (p.lang || "de") as any;
    const props = { lang, business: p.business_name };
    const html = await render(React.createElement(ProfilWiedererschienen as any, props as any));
    try {
      await sendMail({ to: p.cust_email, subject: reappearedSubject(props), html, replyTo: process.env.MAIL_REPLY_TO });
    } catch (e) { return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) }); }
    await addCheck(id, "mail", "Kunde informiert: „Profil wieder erschienen“ an " + p.cust_email, { actor: String(b.actor || "Admin") });
    return { ok: true };
  });

  app.post("/admin/monitor/lookup", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    try {
      let q = String(b.name || "").trim();
      const city = String(b.city || "").trim();
      let pid = "";
      let cid = "";
      if (b.link) { const r = await resolveMapsLink(String(b.link)); q = r.q; pid = r.placeId || ""; cid = r.cid || ""; }
      if (pid) { const p = await placeById(pid); if (p) return { ok: true, place: p }; }
      if (!q && cid) { const p = await placeByCid(cid); if (p) return { ok: true, place: p }; }
      if (!q) return reply.code(400).send({ ok: false, error: "Kein Name im Link gefunden – bitte Firmenname + Ort verwenden" });
      const list = await searchPlaces([q, city].filter(Boolean).join(", "));
      if (!list.length) return { ok: true, place: null };
      return { ok: true, place: list[0], more: list.slice(1, 5) };
    } catch (e) { return reply.code(502).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) }); }
  });

  app.post("/admin/monitor/add", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!guard(b, reply)) return;
    await ensureTables();
    const name = String(b.name || "").trim().slice(0, 200);
    if (!name) return reply.code(400).send({ ok: false, error: "Name fehlt" });
    const orderId = String(b.orderId || "").trim().slice(0, 40) || null;
    let cust = { name: String(b.custName || "").slice(0, 120), email: String(b.custEmail || "").slice(0, 200), lang: String(b.lang || "de").slice(0, 5) };
    if (orderId) {
      const o = await pool!.query(`SELECT name, email, lang FROM orders WHERE id = $1`, [orderId]);
      if (o.rows[0]) cust = { name: o.rows[0].name || cust.name, email: o.rows[0].email || cust.email, lang: o.rows[0].lang || cust.lang };
    }
    const type = b.type === "lifetime" ? "lifetime" : "monthly";
    try {
      const r = await pool!.query(
        `INSERT INTO monitor_profiles (order_id, business_name, address, place_id, maps_url, cust_name, cust_email, lang, type, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'manual')
         ON CONFLICT (order_id) DO UPDATE SET business_name = EXCLUDED.business_name, address = EXCLUDED.address, place_id = EXCLUDED.place_id,
           maps_url = EXCLUDED.maps_url, type = EXCLUDED.type, status = 'ok', source = 'manual', paused_at = NULL
         RETURNING id`,
        [orderId, name, String(b.address || "").slice(0, 300) || null, String(b.placeId || "").slice(0, 200) || null, String(b.mapsUrl || "").slice(0, 500) || null, cust.name || null, cust.email || null, cust.lang || null, type],
      );
      await addCheck(r.rows[0].id, "added", "Zur Überwachung hinzugefügt", { actor: String(b.actor || "Admin") });
      return { ok: true, id: r.rows[0].id };
    } catch (e) { return reply.code(500).send({ ok: false, error: String((e as Error)?.message || e).slice(0, 200) }); }
  });

  app.get("/admin/monitor-shot/:id", async (req, reply) => {
    const q = (req.query || {}) as Record<string, unknown>;
    if (!adminOk(q.token)) return reply.code(401).send("unauthorized");
    if (!dbReady() || !pool) return reply.code(503).send("no db");
    await ensureTables();
    const id = Number((req.params as { id?: string }).id);
    if (!Number.isInteger(id) || id <= 0) return reply.code(400).send("bad id");
    const r = await pool.query(`SELECT mime, img FROM monitor_checks WHERE id = $1 AND img IS NOT NULL`, [id]);
    if (!r.rows[0]) return reply.code(404).send("not found");
    reply.header("Content-Type", r.rows[0].mime || "image/jpeg");
    reply.header("Cache-Control", "private, max-age=86400");
    if (String(q.dl || "") === "1") reply.header("Content-Disposition", `attachment; filename="monitor-${id}.jpg"`);
    return reply.send(r.rows[0].img);
  });
}

/** Zeitplan starten: jede Minute prüfen, ob der 05:00-Scan (Wien) heute schon lief. */
export function startMonitorScheduler(app: FastifyInstance): void {
  log = (o, m) => app.log.info(o, m);
  const tick = () => { autoTick().catch((e) => app.log.error({ err: String(e) }, "Monitor-Zeitplan fehlgeschlagen")); };
  setTimeout(tick, 30_000);
  setInterval(tick, 60_000);
}

export const monitorKeys = () => ({ search: !!(gkey() || serpKey()), screenshots: !!shotKey() });
