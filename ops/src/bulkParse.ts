/* Bulk-Upload (10/2026): Google-Bewertungen aus beliebigen Dateien lesen – für Kunden mit hunderten bis tausenden Bewertungen.
 *
 * Unterstützt: CSV/TSV/TXT, Excel (.xlsx/.xlsm, alt .xls), Word (.docx, alt .doc), PDF, OpenOffice (.odt/.ods), PowerPoint
 * (.pptx), RTF, HTML, JSON – und eingefügten Text. Grundidee: Bewertungs-Links stehen als Text in der Datei (auch hinter
 * „Klick hier"-Verlinkungen: die Ziel-Adresse steckt in der Datei). Deshalb:
 *   - ZIP-Formate (docx/xlsx/pptx/odt/ods): alle XML-Teile entpacken und nach Links durchsuchen (auch Hyperlink-Ziele)
 *   - PDF: Text + Link-Anmerkungen über pdf.js
 *   - alte Binärformate (.xls/.doc) und Unbekanntes: Rohdaten als Latin-1 und UTF-16 nach Links durchsuchen
 *   - Tabellen (CSV/Excel): zusätzlich Zeilen OHNE Link, wenn Verfasser + Bewertungstext erkennbar sind (Spaltenköpfe)
 * Ergebnis: eindeutige Bewertungen (doppelte zusammengefasst), dazu was NICHT übernommen wurde (Profil-Links usw.). */
import { unzipSync, strFromU8 } from "fflate";

export type BulkItem = { key: string; url?: string; name?: string; text?: string; business?: string; rating?: number };
export type FileReport = { name: string; found: number; error?: string };
export type ParseResult = { items: BulkItem[]; notReview: string[]; notReviewN: number; noLinkRows: number; dupInFile: number; truncated: boolean; files: FileReport[] };

export const MAX_ITEMS = 5000;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/* ---------- Links ---------- */
const URL_RE = /(?:https?:\/\/|(?<![\w.@/])(?=(?:www\.google\.|google\.|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|share\.google|g\.co\/kgs)))[^\s"'<>\\^`{|}]+/gi;
const ENT: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">", "&#x2F;": "/", "&#47;": "/" };
const unent = (s: string) => s.replace(/&(amp|quot|#39|apos|lt|gt|#x2F|#47);/g, (m) => ENT[m] || m);

/** Roh-Fund säubern: Satzzeichen am Ende, Klammern, Entities, fehlendes https://. */
export function cleanUrl(raw: string): string {
  let u = unent(String(raw || "").trim());
  u = u.replace(/[)\].,;:!?'"»”’]+$/g, "");
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u.replace(/^http:\/\//i, "https://");
}

export type LinkKind = "review" | "short" | "notReview" | "other";
const SHORT_HOST = /^(maps\.app\.goo\.gl|share\.google|g\.co)$/i;
/** Ist das ein Link auf EINE Bewertung? (Kurzlinks: vermutlich – werden beim Bearbeiten aufgelöst.) */
export function classifyLink(u: string): { kind: LinkKind; key: string; reviewId?: string } {
  let url: URL;
  try { url = new URL(u); } catch { return { kind: "other", key: "" }; }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = (() => { try { return decodeURIComponent(url.pathname); } catch { return url.pathname; } })();
  if (SHORT_HOST.test(host) || (host === "goo.gl" && /^\/maps\//i.test(path))) {
    if (host === "g.co" && !/^\/kgs\//i.test(path)) return { kind: "other", key: "" };
    if (path.replace(/\//g, "").length < 4) return { kind: "other", key: "" };
    return { kind: "short", key: `${host}${path}`.toLowerCase().replace(/\/+$/, "") };
  }
  const isGoogle = /^((maps|search)\.)?google\.[a-z.]{2,8}$/.test(host);
  if (!isGoogle) return { kind: "other", key: "" };
  if (host.startsWith("maps.") || /^\/maps/i.test(path)) {
    const full = (() => { try { return decodeURIComponent(u); } catch { return u; } })();
    const rid = (full.match(/!1s(C[A-Za-z0-9_-]{16,})/) || [])[1];
    if (rid) return { kind: "review", key: "rid:" + rid, reviewId: rid };
    if (/^\/maps\/contrib\/\d+\/place\//i.test(path)) return { kind: "review", key: "contrib:" + path.split("/@")[0].toLowerCase() };
    return { kind: "notReview", key: "nr:" + url.origin + path };
  }
  if (host.startsWith("search.google.") || /^\/(local|search)/.test(path)) return { kind: "notReview", key: "nr:" + url.origin + path };
  return { kind: "other", key: "" };
}

/** Alle Links in einem Text. */
export function linksIn(text: string): string[] {
  const out: string[] = [];
  for (const m of String(text || "").matchAll(URL_RE)) out.push(cleanUrl(m[0]));
  return out;
}

/* ---------- Text aus Dateien ---------- */
const ext = (name: string) => (String(name || "").toLowerCase().match(/\.([a-z0-9]{1,5})$/) || [])[1] || "";
const ZIP_EXT = new Set(["docx", "docm", "xlsx", "xlsm", "pptx", "odt", "ods", "odp"]);
const isZip = (b: Buffer) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
const isPdf = (b: Buffer) => b.length > 4 && b.subarray(0, 5).toString("latin1") === "%PDF-";
const IMG_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "heic", "bmp", "tif", "tiff"]);

function zipText(b: Buffer): string {
  const files = unzipSync(new Uint8Array(b), { filter: (f) => /\.(xml|rels)$/i.test(f.name) && f.originalSize < 60 * 1024 * 1024 });
  const parts: string[] = [];
  for (const [n, data] of Object.entries(files)) {
    let s = strFromU8(data);
    // Hyperlink-Ziele (Word/PowerPoint: Target in .rels, OpenOffice: xlink:href, Excel: Target/location) als eigene Wörter
    const hrefs = Array.from(s.matchAll(/\b(?:Target|xlink:href|r:href|href)="([^"]+)"/g)).map((m) => m[1]);
    // Textläufe (Word w:r/w:t, PowerPoint a:r/a:t, OpenOffice text:span/text:a) OHNE Trenner zusammenfügen – sonst zerfällt ein
    // Link, dessen Formatierung mitten drin wechselt. Alle anderen Tags (Zellen, Absätze) werden zu Leerzeichen/Zeilen.
    s = s.replace(/<(w|a):rPr\b[^>]*\/>|<(w|a):rPr\b[\s\S]*?<\/\2:rPr>/g, "")
      .replace(/<\/(w:p|a:p|text:p|text:h|w:tc|row|si)>|<(w:br|w:tab|w:cr|text:line-break|text:tab)\b[^>]*\/?>/g, "\n")
      .replace(/<\/?(w:r|w:t|w:hyperlink|w:proofErr|w:bookmarkStart|w:bookmarkEnd|w:lastRenderedPageBreak|w:softHyphen|w:noBreakHyphen|a:r|a:t|text:span|text:a|text:s|text:soft-page-break)\b[^>]*>/g, "")
      .replace(/<[^>]+>/g, " ");
    parts.push(s, hrefs.map((h) => " " + h + " ").join("\n"));
  }
  return parts.join("\n");
}

async function pdfText(b: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({ data: new Uint8Array(b), isEvalSupported: false, useSystemFonts: false, disableFontFace: true, verbosity: 0 } as never);
  const doc = await task.promise;
  const out: string[] = [];
  const pages = Math.min(doc.numPages, 2000);
  for (let i = 1; i <= pages; i++) {
    const p = await doc.getPage(i);
    const tc = await p.getTextContent();
    // Zeilen zusammensetzen: lange Links werden in PDFs oft umbrochen → Teile ohne Leerzeichen anhängen
    let line = "";
    for (const it of tc.items as { str?: string; hasEOL?: boolean }[]) { line += it.str || ""; if (it.hasEOL) { out.push(line); line = ""; } }
    if (line) out.push(line);
    for (const a of (await p.getAnnotations()) as { url?: string; unsafeUrl?: string }[]) if (a.url || a.unsafeUrl) out.push(" " + (a.url || a.unsafeUrl) + " ");
    p.cleanup();
  }
  await task.destroy();
  return out.join("\n");
}

/** Rohdaten nach Links absuchen (alte Office-Binärformate, Unbekanntes): Latin-1 + UTF-16. */
function rawText(b: Buffer): string {
  const lat = b.toString("latin1");
  // UTF-16 (Word/Excel-Binärformate) – an geraden UND ungeraden Positionen, Links können beliebig ausgerichtet sein
  const u16a = b.toString("utf16le"), u16b = b.subarray(1).toString("utf16le");
  const clean = (x: string) => x.replace(/[^\x20-\x7e\n]/g, " ");
  return clean(lat) + "\n" + clean(u16a) + "\n" + clean(u16b);
}

/* ---------- Tabellen ---------- */
const HDR = {
  link: /^(link|url|review ?link|review ?url|bewertungs?-?link|google ?link|lien|enlace|collegamento)$/i,
  name: /^(name|reviewer|author|autor|verfasser|user|kunde|customer|reviewer ?name|nom|nombre|nome)$/i,
  text: /^(text|review|review ?text|comment|kommentar|bewertung|bewertungstext|rezension|content|texte|reseña|recensione|avis)$/i,
  business: /^(business|company|profile|location|firma|unternehmen|profil|place|standort|google ?profile|business ?name|store|shop|hotel|restaurant)$/i,
  rating: /^(rating|stars?|sterne|bewertung ?\(sterne\)|score|note)$/i,
};
type Cols = { link?: number; name?: number; text?: number; business?: number; rating?: number };
function headerCols(row: string[]): Cols | null {
  const c: Cols = {};
  row.forEach((v, i) => {
    const h = String(v || "").trim();
    for (const k of Object.keys(HDR) as (keyof Cols)[]) if (c[k] === undefined && HDR[k].test(h)) c[k] = i;
  });
  return c.name !== undefined || c.text !== undefined || c.link !== undefined ? c : null;
}

/** CSV/TSV: Trennzeichen erkennen, Anführungszeichen beachten. */
export function parseCsv(s: string): string[][] {
  const first = s.split(/\r?\n/, 5).join("\n");
  const cnt = (ch: string) => (first.match(new RegExp(ch === "|" ? "\\|" : ch, "g")) || []).length;
  const d = [",", ";", "\t", "|"].sort((a, b) => cnt(b) - cnt(a))[0];
  const rows: string[][] = []; let row: string[] = []; let f = ""; let q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
    if (c === '"' && f === "") q = true;
    else if (c === d) { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && s[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x).trim()));
}

async function xlsxRows(b: Buffer): Promise<string[][]> {
  const ExcelJS = (await import("exceljs")).default as unknown as { Workbook: new () => { xlsx: { load: (b: Buffer) => Promise<unknown> }; worksheets: { eachRow: (fn: (r: { values: unknown[] }) => void) => void }[] } };
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(b);
  const rows: string[][] = [];
  for (const ws of wb.worksheets) {
    ws.eachRow((r) => {
      const vals = (Array.isArray(r.values) ? r.values.slice(1) : []).map((v) => {
        if (v == null) return "";
        if (typeof v === "object") { const o = v as Record<string, unknown>; return String(o.hyperlink ? `${o.text ?? ""} ${o.hyperlink}` : o.text ?? o.result ?? (Array.isArray(o.richText) ? (o.richText as { text: string }[]).map((x) => x.text).join("") : "")); }
        return String(v);
      });
      rows.push(vals);
    });
    rows.push([]); // Blattgrenze
  }
  return rows;
}

/** Tabellenzeilen → Einträge (mit Link ODER Verfasser + Text). */
function rowsToEntries(rows: string[][]): { entries: { url?: string; name?: string; text?: string; business?: string; rating?: number }[]; noLink: number } {
  const entries: { url?: string; name?: string; text?: string; business?: string; rating?: number }[] = [];
  let cols: Cols | null = null, noLink = 0;
  for (const r of rows) {
    if (!r.length) { cols = null; continue; }
    const h = headerCols(r);
    if (h && !r.some((x) => linksIn(String(x)).length)) { cols = h; continue; }
    const cell = (i?: number) => (i === undefined ? "" : String(r[i] ?? "").trim());
    const links = r.flatMap((x) => linksIn(String(x)));
    const name = cols ? cell(cols.name).slice(0, 120) : "", text = cols ? cell(cols.text).slice(0, 2000) : "", business = cols ? cell(cols.business).slice(0, 200) : "";
    const rt = cols ? Math.round(Number(cell(cols.rating).replace(",", "."))) : NaN;
    const rating = rt >= 1 && rt <= 5 ? rt : undefined;
    if (links.length) for (const u of links) entries.push({ url: u, ...(name ? { name } : {}), ...(text ? { text } : {}), ...(business ? { business } : {}), ...(rating ? { rating } : {}) });
    else if (name && text) entries.push({ name, text, ...(business ? { business } : {}), ...(rating ? { rating } : {}) });
    else if (r.some((x) => String(x).trim())) noLink++;
  }
  return { entries, noLink };
}

/* ---------- Hauptfunktion ---------- */
export async function parseBulk(files: { name: string; data: Buffer }[], pasted = ""): Promise<ParseResult> {
  const reports: FileReport[] = [];
  const entries: { url?: string; name?: string; text?: string; business?: string; rating?: number }[] = [];
  let noLinkRows = 0;
  const addText = (t: string) => { for (const u of linksIn(t)) entries.push({ url: u }); };
  if (pasted.trim()) {
    const rows = /\t|;|,/.test(pasted) && pasted.split(/\r?\n/).length > 1 ? parseCsv(pasted) : [];
    const head = rows.length ? headerCols(rows[0]) : null;
    if (head && (head.name !== undefined || head.text !== undefined)) { const r = rowsToEntries(rows); entries.push(...r.entries); noLinkRows += r.noLink; }
    else addText(pasted);
    reports.push({ name: "pasted", found: entries.length });
  }
  for (const f of files) {
    const before = entries.length;
    const e = ext(f.name);
    try {
      if (f.data.length > MAX_FILE_BYTES) throw new Error("too_big");
      if (IMG_EXT.has(e)) throw new Error("image");
      if (isPdf(f.data) || e === "pdf") addText(await pdfText(f.data));
      else if (isZip(f.data) || ZIP_EXT.has(e)) {
        if (e === "xlsx" || e === "xlsm") { const r = rowsToEntries(await xlsxRows(f.data)); entries.push(...r.entries); noLinkRows += r.noLink; }
        // Links, die nur als Hyperlink-Ziel (nicht als Text) in der Datei stehen, kommen über die entpackten XML-Teile
        const seen = new Set(entries.slice(before).map((x) => x.url).filter(Boolean));
        for (const u of linksIn(zipText(f.data))) if (!seen.has(u)) { entries.push({ url: u }); seen.add(u); }
      } else if (["csv", "tsv", "txt", "text", "tab"].includes(e) || (!e && !/[\x00-\x08]/.test(f.data.subarray(0, 2000).toString("latin1")))) {
        const s = f.data.toString("utf8").replace(/^﻿/, "");
        const rows = parseCsv(s);
        const head = rows.length ? headerCols(rows[0]) : null;
        if (e !== "txt" && head) { const r = rowsToEntries(rows); entries.push(...r.entries); noLinkRows += r.noLink; }
        else addText(s);
      } else if (["html", "htm", "json", "xml", "md", "rtf", "eml"].includes(e)) addText(unent(f.data.toString("utf8")));
      else addText(rawText(f.data)); // .xls, .doc, .numbers, .pages, Unbekanntes
      reports.push({ name: f.name, found: entries.length - before });
    } catch (err) {
      const m = String((err as Error)?.message || err);
      if (process.env.BULK_DEBUG) console.error("bulkParse", f.name, err);
      reports.push({ name: f.name, found: entries.length - before, error: m === "too_big" || m === "image" ? m : "unreadable" });
    }
  }
  // Einordnen + doppelte zusammenfassen
  const items: BulkItem[] = []; const byKey = new Map<string, BulkItem>(); const notReview = new Map<string, string>();
  let dupInFile = 0, truncated = false;
  for (const en of entries) {
    let key: string;
    if (en.url) {
      const c = classifyLink(en.url);
      if (c.kind === "other") continue; // andere Websites (Firmenseite usw.) ignorieren
      if (c.kind === "notReview") { if (!notReview.has(c.key)) notReview.set(c.key, en.url); continue; }
      key = c.key;
    } else key = "nt:" + `${en.name || ""}|${en.text || ""}`.toLowerCase().replace(/\s+/g, " ").slice(0, 300);
    const had = byKey.get(key);
    if (had) { dupInFile++; for (const k of ["name", "text", "business", "rating"] as const) if (!had[k] && en[k]) (had as Record<string, unknown>)[k] = en[k]; continue; }
    if (items.length >= MAX_ITEMS) { truncated = true; continue; }
    const it: BulkItem = { key, ...en };
    byKey.set(key, it); items.push(it);
  }
  return { items, notReview: [...notReview.values()].slice(0, 20), notReviewN: notReview.size, noLinkRows, dupInFile, truncated, files: reports };
}
