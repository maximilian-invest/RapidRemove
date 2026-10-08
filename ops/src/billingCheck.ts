/* Rechnungsdetails prüfen (Dashboard → Zahlung & Abrechnung):
 *  1) Adresse: muss existieren und zum gewählten Land passen (Google Places Text Search; Fallback: PLZ-Format je Land).
 *  2) UID / USt-IdNr.: EU → VIES (EU-Kommission), GB → HMRC, CH → Format (CHE-123.456.789), sonst nur Format.
 * Kein Treffer / falsches Land → Speichern wird abgelehnt (mit verständlichem Grund). Dienst nicht erreichbar → gespeichert, aber „nicht geprüft". */

const gkey = () => (process.env.GOOGLE_MAPS_API_KEY || "").trim();

/** PLZ-Formate (Fallback, wenn Google nicht erreichbar ist). */
const ZIP: Record<string, RegExp> = {
  AT: /^\d{4}$/, DE: /^\d{5}$/, CH: /^\d{4}$/, LI: /^94\d{2}$/, IT: /^\d{5}$/, NL: /^\d{4}\s?[A-Z]{2}$/i, BE: /^\d{4}$/, LU: /^(L-)?\d{4}$/i,
  FR: /^\d{5}$/, ES: /^\d{5}$/, PT: /^\d{4}-\d{3}$/, IE: /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i, GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
  DK: /^\d{4}$/, SE: /^\d{3}\s?\d{2}$/, NO: /^\d{4}$/, FI: /^\d{5}$/, PL: /^\d{2}-\d{3}$/, CZ: /^\d{3}\s?\d{2}$/, SK: /^\d{3}\s?\d{2}$/,
  HU: /^\d{4}$/, SI: /^\d{4}$/, HR: /^\d{5}$/, US: /^\d{5}(-\d{4})?$/, CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, AU: /^\d{4}$/, NZ: /^\d{4}$/, ZA: /^\d{4}$/,
};
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");

export type AddrResult = { ok: boolean; reason?: string; checked: boolean; formatted?: string };

export async function checkAddress(a: { line1: string; postal: string; city: string; country: string }): Promise<AddrResult> {
  const c = a.country.toUpperCase();
  if (!a.line1 && !a.postal && !a.city) return { ok: true, checked: false }; // keine Adresse angegeben → ok (nur Name/Firma)
  if (!c) return { ok: false, checked: false, reason: "country" };
  if (!a.postal || !a.city || !a.line1) return { ok: false, checked: false, reason: "incomplete" };
  if (ZIP[c] && !ZIP[c].test(a.postal.trim())) return { ok: false, checked: false, reason: "zip" };
  if (!gkey()) return { ok: true, checked: false };
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": gkey(), "X-Goog-FieldMask": "places.formattedAddress,places.addressComponents" },
      body: JSON.stringify({ textQuery: `${a.line1}, ${a.postal} ${a.city}`, regionCode: c, languageCode: "de", pageSize: 3 }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: true, checked: false };
    const j = (await res.json()) as { places?: { formattedAddress?: string; addressComponents?: { shortText?: string; longText?: string; types?: string[] }[] }[] };
    const places = j.places || [];
    if (!places.length) return { ok: false, checked: true, reason: "notfound" };
    const comp = (p: (typeof places)[number], t: string) => (p.addressComponents || []).find((x) => (x.types || []).includes(t));
    // Treffer, dessen Land = gewähltes Land und PLZ bzw. Ort passt.
    const zipN = norm(a.postal), cityN = norm(a.city);
    const good = places.find((p) => {
      const cc = String(comp(p, "country")?.shortText || "").toUpperCase();
      if (cc !== c) return false;
      const pz = norm(String(comp(p, "postal_code")?.longText || ""));
      const loc = [comp(p, "locality"), comp(p, "postal_town"), comp(p, "administrative_area_level_3"), comp(p, "sublocality"), comp(p, "administrative_area_level_2")]
        .map((x) => norm(String(x?.longText || ""))).filter(Boolean);
      const zipOk = !pz || pz === zipN || pz.startsWith(zipN) || zipN.startsWith(pz);
      const cityOk = !loc.length || loc.some((l) => l === cityN || l.includes(cityN) || cityN.includes(l));
      return zipOk && cityOk;
    });
    if (good) return { ok: true, checked: true, formatted: good.formattedAddress };
    const wrongCountry = places.every((p) => String(comp(p, "country")?.shortText || "").toUpperCase() !== c);
    return { ok: false, checked: true, reason: wrongCountry ? "country_mismatch" : "mismatch" };
  } catch {
    return { ok: true, checked: false };
  }
}

export type VatResult = { ok: boolean; status: "valid" | "invalid" | "unchecked"; reason?: string; name?: string; vat: string };
const EU = new Set(["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK", "XI"]);

export async function checkVat(raw: string, country: string): Promise<VatResult> {
  const v = raw.toUpperCase().replace(/[\s.\-]/g, "");
  if (!v) return { ok: true, status: "unchecked", vat: "" };
  const c = country.toUpperCase();
  const viesCc = c === "GR" ? "EL" : c;
  // Schweiz/Liechtenstein: UID-Format CHE-123.456.789 (+ MWST)
  if (c === "CH" || c === "LI") {
    const m = /^CHE(\d{9})(MWST|TVA|IVA)?$/.exec(v);
    return m ? { ok: true, status: "unchecked", vat: `CHE-${m[1].slice(0, 3)}.${m[1].slice(3, 6)}.${m[1].slice(6)}${m[2] ? " " + m[2] : ""}` } : { ok: false, status: "invalid", reason: "vat_format", vat: v };
  }
  if (c === "GB") {
    const num = v.replace(/^GB/, "");
    if (!/^\d{9}(\d{3})?$/.test(num)) return { ok: false, status: "invalid", reason: "vat_format", vat: v };
    try {
      const r = await fetch(`https://api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup/${num}`, { headers: { Accept: "application/vnd.hmrc.1.0+json" }, signal: AbortSignal.timeout(8000) });
      if (r.status === 404) return { ok: false, status: "invalid", reason: "vat_invalid", vat: "GB" + num };
      if (r.ok) { const j = (await r.json()) as { target?: { name?: string } }; return { ok: true, status: "valid", name: j.target?.name, vat: "GB" + num }; }
    } catch { /* nicht erreichbar */ }
    return { ok: true, status: "unchecked", vat: "GB" + num };
  }
  if (!EU.has(viesCc)) return { ok: true, status: "unchecked", vat: v }; // außerhalb EU/GB/CH: nur speichern
  const pre = v.slice(0, 2);
  if (/^[A-Z]{2}$/.test(pre) && pre !== viesCc) return { ok: false, status: "invalid", reason: "vat_country", vat: v };
  const num = /^[A-Z]{2}/.test(v) && pre === viesCc ? v.slice(2) : v;
  if (!/^[0-9A-Z]{2,14}$/.test(num)) return { ok: false, status: "invalid", reason: "vat_format", vat: v };
  try {
    const r = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${viesCc}/vat/${encodeURIComponent(num)}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      const j = (await r.json()) as { isValid?: boolean; name?: string; userError?: string };
      if (j.isValid === true) return { ok: true, status: "valid", name: j.name && j.name !== "---" ? j.name : undefined, vat: viesCc + num };
      if (j.isValid === false && (!j.userError || j.userError === "INVALID" || j.userError === "VALID")) return { ok: false, status: "invalid", reason: "vat_invalid", vat: viesCc + num };
    }
  } catch { /* VIES nicht erreichbar (kommt vor) */ }
  return { ok: true, status: "unchecked", vat: viesCc + num };
}
