/* Partner-Statistiken: läuft im Hintergrund mit (DB-Trigger protokolliert JEDEN Statuswechsel einer Partner-Aufgabe,
 * egal ob vom Partner, vom Admin, vom Kunden-Dashboard oder automatisch) und wertet pro Partner aus:
 * Reaktionszeit, Dauer bis gelöscht, Löschquote je Kategorie/Sterne/Textlänge/Alter/Land/Sprache/Unternehmen,
 * nicht löschbare Bewertungen + Gemeinsamkeiten, Arbeitszeiten, Wochenverlauf, offene Altlasten, Kosten.
 * Testaufträge zählen nie. */
import type { FastifyInstance } from "fastify";
import { pool } from "./db";

export async function initPartnerStats(): Promise<void> {
  if (!pool) return;
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS partner_id bigint`);
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS first_working_at timestamptz`);
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS decided_at timestamptz`);
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS rating smallint`);
  await pool.query(`ALTER TABLE partner_tasks ADD COLUMN IF NOT EXISTS age_days integer`);
  await pool.query(`CREATE TABLE IF NOT EXISTS partner_task_events (
    id bigserial PRIMARY KEY, task_id bigint NOT NULL, from_status text, to_status text NOT NULL, at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE INDEX IF NOT EXISTS partner_task_events_task ON partner_task_events (task_id, at)`);
  await pool.query(`
    CREATE OR REPLACE FUNCTION partner_task_status_log() RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO partner_task_events (task_id, from_status, to_status) VALUES (NEW.id, NULL, NEW.status);
        IF NEW.partner_id IS NULL THEN NEW.partner_id := (SELECT id FROM partners WHERE active ORDER BY id LIMIT 1); END IF;
        RETURN NEW;
      END IF;
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO partner_task_events (task_id, from_status, to_status) VALUES (NEW.id, OLD.status, NEW.status);
        IF NEW.status = 'working' AND NEW.first_working_at IS NULL THEN NEW.first_working_at := now(); END IF;
        IF NEW.status IN ('removed','not_possible','software') AND NEW.decided_at IS NULL THEN NEW.decided_at := now(); END IF;
      END IF;
      RETURN NEW;
    END $$ LANGUAGE plpgsql`);
  await pool.query(`DROP TRIGGER IF EXISTS partner_task_status_log ON partner_tasks`);
  await pool.query(`CREATE TRIGGER partner_task_status_log BEFORE INSERT OR UPDATE ON partner_tasks FOR EACH ROW EXECUTE FUNCTION partner_task_status_log()`);
  // Bestand nachtragen (einmalig wirksam, danach greifen die Spalten nur noch für NULL-Werte).
  await pool.query(`UPDATE partner_tasks SET partner_id = (SELECT id FROM partners ORDER BY id LIMIT 1) WHERE partner_id IS NULL`);
  await pool.query(`UPDATE partner_tasks SET first_working_at = COALESCE(working_since, touched_at) WHERE first_working_at IS NULL AND status IN ('working','removed','not_possible','software') AND COALESCE(working_since, touched_at) IS NOT NULL`);
  await pool.query(`UPDATE partner_tasks SET decided_at = CASE WHEN status='removed' THEN COALESCE(removed_at, updated_at) ELSE updated_at END WHERE decided_at IS NULL AND status IN ('removed','not_possible','software')`);
}

/* ---------- Auswertung ---------- */
type T = {
  id: string; code: string; kind: string; status: string; created_at: Date; touched_at: Date | null; first_working_at: Date | null; working_since: Date | null;
  removed_at: Date | null; decided_at: Date | null; updated_at: Date; rating: number | null; age_days: number | null; text: string | null; name: string | null;
  partner_note: string | null; customer: string | null; order_id: string | null; price_usd: string; paid_at: string | null; country: string | null; lang: string | null;
};
const H = 3600e3;
// Dauer in Stunden; ≤ 1 Min. oder negativ = nachgetragene Altdaten ohne echte Zeiten → nicht mitzählen
const hrs = (a: Date | null, b: Date | null) => { if (!a || !b) return null; const d = (new Date(b).getTime() - new Date(a).getTime()) / H; return d > 1 / 60 ? d : null; };
const r1 = (n: number) => Math.round(n * 10) / 10;
function dist(v: (number | null)[]) {
  const a = v.filter((x): x is number => x != null && isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const q = (p: number) => a[Math.min(a.length - 1, Math.floor(p * (a.length - 1) + 0.5))];
  return { n: a.length, median: r1(q(0.5)), avg: r1(a.reduce((s, x) => s + x, 0) / a.length), p90: r1(q(0.9)), min: r1(a[0]), max: r1(a[a.length - 1]) };
}
const DEC = ["removed", "not_possible", "software"];
const KIND_L: Record<string, string> = { normal: "Bis 4 Wochen alt", old: "Älter als 4 Wochen", nt: "Ohne Text (nur Sterne)", profile: "Ganzes Profil" };
const textLen = (t: T) => { const n = (t.text || "").trim().length; if (t.kind === "nt") return "Ohne Text (nur Sterne)"; if (!n) return "Unbekannt"; return n < 80 ? "Kurz (< 80 Zeichen)" : n <= 300 ? "Mittel (80–300)" : "Lang (> 300)"; };
const ageL = (t: T) => { const d = t.age_days; if (d == null || d < 0) return t.kind === "old" ? "Älter als 4 Wochen" : t.kind === "normal" ? "Bis 4 Wochen" : "Unbekannt"; return d <= 28 ? "Bis 4 Wochen" : d <= 180 ? "1–6 Monate" : d <= 365 ? "6–12 Monate" : "Älter als 1 Jahr"; };
const starL = (t: T) => (t.rating && t.rating >= 1 && t.rating <= 5 ? t.rating + " Stern" + (t.rating > 1 ? "e" : "") : "Unbekannt");
const COUNTRY: Record<string, string> = { AT: "Österreich", DE: "Deutschland", CH: "Schweiz", US: "USA", GB: "Großbritannien", JP: "Japan", ES: "Spanien", FR: "Frankreich", IT: "Italien", NL: "Niederlande" };
const vienna = (d: Date) => new Date(new Date(d).toLocaleString("en-US", { timeZone: "Europe/Vienna" }));
const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const STOP = new Set("this that with have from been they them their there will would could should about which when what were your into than then also only just more some very review reviews google cannot can't cant not possible deleted delete removal remove removed because".split(" "));

function group(rows: T[], key: (t: T) => string) {
  const m = new Map<string, T[]>();
  for (const t of rows) { const k = key(t) || "Unbekannt"; if (!m.has(k)) m.set(k, []); m.get(k)!.push(t); }
  return [...m.entries()].map(([label, list]) => {
    const rem = list.filter((t) => t.status === "removed");
    const no = list.filter((t) => t.status === "not_possible").length, sw = list.filter((t) => t.status === "software").length;
    const dec = rem.length + no + sw;
    return {
      label, n: list.length, removed: rem.length, notPossible: no, software: sw, open: list.filter((t) => t.status === "new" || t.status === "working").length,
      rate: dec ? Math.round((rem.length / dec) * 100) : null, dec,
      hours: dist(rem.map((t) => hrs(t.created_at, t.removed_at))),
    };
  }).sort((a, b) => b.n - a.n);
}

function compute(all: T[], now = Date.now()) {
  const rows = all.filter((t) => t.status !== "cancelled");
  const reviews = rows.filter((t) => t.kind !== "profile");
  const rem = rows.filter((t) => t.status === "removed");
  const failed = rows.filter((t) => t.status === "not_possible" || t.status === "software");
  const dec = rows.filter((t) => DEC.includes(t.status));
  const firstWork = (t: T) => t.first_working_at || t.working_since || (t.status !== "new" ? t.touched_at : null);
  const overallRate = dec.length ? rem.length / dec.length : null;

  const times = {
    reaction: dist(rows.map((t) => hrs(t.created_at, t.touched_at))),          // gesendet → erste Partner-Aktion
    toStart: dist(rows.map((t) => hrs(t.created_at, firstWork(t)))),          // gesendet → „Working"
    work: dist(rem.map((t) => hrs(firstWork(t), t.removed_at))),              // „Working" → gelöscht
    total: dist(rem.map((t) => hrs(t.created_at, t.removed_at))),             // gesendet → gelöscht
    toFail: dist(failed.map((t) => hrs(t.created_at, t.decided_at || t.updated_at))), // gesendet → „nicht möglich"/Software
  };
  const buckets = [["< 6 Std.", 0, 6], ["6–24 Std.", 6, 24], ["1–3 Tage", 24, 72], ["3–7 Tage", 72, 168], ["> 7 Tage", 168, 1e9]] as const;
  const totalH = rem.map((t) => hrs(t.created_at, t.removed_at)).filter((x): x is number => x != null);
  const durBuckets = buckets.map(([l, a, b]) => ({ label: l, n: totalH.filter((x) => x >= a && x < b).length }));

  const dims = {
    kind: group(rows, (t) => KIND_L[t.kind] || t.kind),
    stars: group(reviews, starL),
    text: group(reviews, textLen),
    age: group(reviews, ageL),
    country: group(rows, (t) => (t.country ? COUNTRY[t.country.toUpperCase()] || t.country.toUpperCase() : "Unbekannt")),
    lang: group(rows, (t) => (t.lang ? t.lang.toUpperCase() : "Unbekannt")),
    business: group(rows, (t) => t.customer || "Unbekannt").filter((g) => g.n >= 2).slice(0, 12),
    weekday: group(rows, (t) => WD[vienna(t.created_at).getDay()]),
  };

  // Gemeinsamkeiten: wo weicht die Quote / Dauer deutlich vom Schnitt ab? (mind. 3 entschiedene)
  const insights: { tone: "bad" | "good" | "info"; text: string; score: number }[] = [];
  const base = overallRate;
  const DL: Record<string, string> = { kind: "Kategorie", stars: "Sterne", text: "Text", age: "Alter", country: "Land", lang: "Sprache", business: "Unternehmen" };
  const seen = new Set<string>(); // gleiche Gruppe unter zwei Merkmalen (z. B. „Ohne Text") nur 1×
  const once = (k: string) => (seen.has(k) ? false : (seen.add(k), true));
  if (base != null) {
    for (const [dk, groups] of Object.entries(dims)) {
      if (dk === "weekday") continue;
      for (const g of groups) {
        if (g.dec < 3 || g.label === "Unbekannt" || g.rate == null) continue;
        const rate = g.rate / 100;
        const diff = rate - base;
        if (Math.abs(diff) < 0.15) continue;
        const what = `${DL[dk]} „${g.label}“`;
        if (!once(`r|${g.n}|${g.dec}|${g.removed}`)) continue;
        insights.push(diff < 0
          ? { tone: "bad", text: `${what}: nur ${g.rate} % gelöscht (Schnitt ${Math.round(base * 100)} %) – ${g.notPossible + g.software} von ${g.dec} nicht löschbar`, score: Math.abs(diff) * Math.sqrt(g.dec) }
          : { tone: "good", text: `${what}: ${g.rate} % gelöscht (Schnitt ${Math.round(base * 100)} %) – ${g.removed} von ${g.dec}`, score: Math.abs(diff) * Math.sqrt(g.dec) });
      }
    }
  }
  const medAll = times.total ? times.total.median : null;
  if (medAll) {
    for (const [dk, groups] of Object.entries(dims)) {
      if (dk === "weekday" || dk === "business") continue;
      for (const g of groups) {
        if (!g.hours || g.hours.n < 3 || g.label === "Unbekannt") continue;
        if (!once(`h|${g.n}|${g.hours.n}|${g.hours.median}`)) continue;
        if (g.hours.median >= medAll * 1.6 && g.hours.median - medAll >= 6) insights.push({ tone: "info", text: `${DL[dk]} „${g.label}“ dauert länger: Median ${fmtH(g.hours.median)} statt ${fmtH(medAll)}`, score: (g.hours.median / medAll) * Math.sqrt(g.hours.n) * 0.3 });
        else if (g.hours.median <= medAll * 0.6 && medAll - g.hours.median >= 6) insights.push({ tone: "good", text: `${DL[dk]} „${g.label}“ geht schneller: Median ${fmtH(g.hours.median)} statt ${fmtH(medAll)}`, score: (medAll / Math.max(1, g.hours.median)) * Math.sqrt(g.hours.n) * 0.3 });
      }
    }
  }
  const RANK = { bad: 0, info: 1, good: 2 } as const; // Probleme zuerst
  insights.sort((a, b) => RANK[a.tone] - RANK[b.tone] || b.score - a.score);

  // Häufige Wörter in den Partner-Notizen der nicht löschbaren Bewertungen
  const words = new Map<string, number>();
  for (const t of failed) for (const w of String(t.partner_note || "").toLowerCase().match(/[a-zäöüß']{4,}/g) || []) if (!STOP.has(w)) words.set(w, (words.get(w) || 0) + 1);
  const noteWords = [...words.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w, n]) => ({ w, n }));

  // Arbeitszeiten des Partners (Wiener Zeit): wann wird gelöscht / gestartet
  const hours = Array.from({ length: 24 }, () => 0);
  const actAt = [...rem.map((t) => t.removed_at), ...rows.map((t) => firstWork(t))].filter(Boolean) as Date[];
  for (const d of actAt) hours[vienna(d).getHours()]++;

  // Wochenverlauf (letzte 10 Wochen)
  const weeks: { label: string; sent: number; removed: number; failed: number; median: number | null }[] = [];
  for (let i = 9; i >= 0; i--) {
    const end = now - i * 7 * 24 * H, start = end - 7 * 24 * H;
    const inW = (d: Date | null) => !!d && new Date(d).getTime() >= start && new Date(d).getTime() < end;
    const rw = rem.filter((t) => inW(t.removed_at));
    const s = new Date(start + 24 * H);
    weeks.push({ label: `${s.getDate()}.${s.getMonth() + 1}.`, sent: rows.filter((t) => inW(t.created_at)).length, removed: rw.length, failed: failed.filter((t) => inW(t.decided_at || t.updated_at)).length, median: dist(rw.map((t) => hrs(t.created_at, t.removed_at)))?.median ?? null });
  }

  // Offene Altlasten
  const open = rows.filter((t) => t.status === "new" || t.status === "working").map((t) => ({
    code: t.code, status: t.status, customer: t.customer, name: t.name, kind: t.kind, orderId: t.order_id,
    ageH: r1(hrs(t.created_at, new Date(now)) || 0), workingH: t.status === "working" ? r1(hrs(t.working_since || firstWork(t), new Date(now)) || 0) : null, touched: !!t.touched_at,
  })).sort((a, b) => b.ageH - a.ageH);

  const sumUsd = (l: T[]) => Math.round(l.reduce((s, t) => s + Number(t.price_usd || 0), 0) * 100) / 100;
  return {
    counts: { total: rows.length, reviews: reviews.length, removed: rem.length, notPossible: rows.filter((t) => t.status === "not_possible").length, software: rows.filter((t) => t.status === "software").length, open: open.length, cancelled: all.length - rows.length, rate: overallRate == null ? null : Math.round(overallRate * 100) },
    times, durBuckets, dims, insights: insights.slice(0, 12), noteWords, hours, weeks,
    open: { n: open.length, untouched48: open.filter((o) => !o.touched && o.ageH > 48).length, stuck72: open.filter((o) => o.status === "working" && (o.workingH || 0) > 72).length, list: open.slice(0, 10) },
    failed: failed.sort((a, b) => new Date(b.decided_at || b.updated_at).getTime() - new Date(a.decided_at || a.updated_at).getTime()).slice(0, 40).map((t) => ({
      code: t.code, status: t.status, kind: t.kind, name: t.name, text: (t.text || "").slice(0, 220), rating: t.rating, ageDays: t.age_days, customer: t.customer, orderId: t.order_id, note: t.partner_note || "", at: t.decided_at || t.updated_at, country: t.country,
    })),
    money: { paidUsd: sumUsd(rem.filter((t) => t.paid_at)), owedUsd: sumUsd(rem.filter((t) => !t.paid_at)), perRemovedUsd: rem.length ? Math.round((sumUsd(rem) / rem.length) * 100) / 100 : null },
    since: rows.length ? rows.reduce((m, t) => (new Date(t.created_at) < m ? new Date(t.created_at) : m), new Date()) : null,
  };
}
function fmtH(h: number) { return h < 1 ? Math.round(h * 60) + " Min." : h < 48 ? r1(h).toString().replace(".", ",") + " Std." : r1(h / 24).toString().replace(".", ",") + " Tage"; }

export function registerPartnerStats(app: FastifyInstance, adminOk: (b: Record<string, unknown>) => boolean): void {
  app.post("/admin/partner/stats", async (req, reply) => {
    const b = (req.body || {}) as Record<string, unknown>;
    if (!adminOk(b)) return reply.code(401).send({ ok: false, error: "unauthorized" });
    if (!pool) return { ok: true, partners: [] };
    const days = Math.max(0, Math.min(3650, Number(b.days) || 0)); // 0 = alles
    const ps = await pool.query(`SELECT id, name, active FROM partners ORDER BY id`);
    const r = await pool.query(
      `SELECT t.*, o.country, o.lang FROM partner_tasks t LEFT JOIN orders o ON o.id = t.order_id
        WHERE NOT COALESCE(t.test, false) ${days ? "AND t.created_at > now() - make_interval(days => $1::int)" : ""}`,
      days ? [days] : [],
    );
    const rows = r.rows as (T & { partner_id: string | null })[];
    const firstId = ps.rows[0] ? String(ps.rows[0].id) : null;
    const out = ps.rows.map((p) => ({ id: Number(p.id), name: p.name, active: p.active, ...compute(rows.filter((t) => String(t.partner_id ?? firstId) === String(p.id))) }));
    return { ok: true, days, partners: out.filter((p) => p.active || p.counts.total) };
  });
}
