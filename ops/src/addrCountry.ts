/* Land eines Google-Profils aus der Adresse (Kopie von src/lib/pricing.js addrCountry – synchron halten). */
const COUNTRY_RE: [RegExp, string][] = [[/vereinigte staaten|united states|\busa\b|états-unis|estados unidos|stati uniti|verenigde staten|förenta staterna|forenede stater|アメリカ/i, "US"],
  [/deutschland|germany|allemagne|alemania|germania|duitsland|tyskland|ドイツ/i, "DE"], [/österreich|austria|autriche|oostenrijk|østrig|österrike/i, "AT"],
  [/schweiz|switzerland|suisse|svizzera|suiza|zwitserland/i, "CH"], [/vereinigtes königreich|united kingdom|\buk\b|royaume-uni|reino unido|regno unito|england|scotland|wales/i, "GB"],
  [/kanada|canada/i, "CA"], [/australien|australia/i, "AU"],
  [/italien|italy|italia|italie/i, "IT"], [/frankreich|france|francia|frankrijk/i, "FR"], [/spanien|spain|españa|espagne|spagna/i, "ES"],
  [/niederlande|netherlands|nederland|pays-bas|países bajos/i, "NL"], [/belgien|belgium|belgique|belgië|bélgica/i, "BE"], [/luxemburg|luxembourg/i, "LU"],
  [/portugal/i, "PT"], [/irland|ireland|irlande|éire/i, "IE"], [/schweden|sweden|sverige|suède/i, "SE"], [/dänemark|denmark|danmark|danemark/i, "DK"],
  [/norwegen|norway|norge|norvège/i, "NO"], [/finnland|finland|suomi/i, "FI"], [/polen|poland|polska|pologne/i, "PL"],
  [/tschechien|czechia|czech republic|česko/i, "CZ"], [/ungarn|hungary|magyarország/i, "HU"], [/slowenien|slovenia|slovenija/i, "SI"],
  [/kroatien|croatia|hrvatska/i, "HR"], [/griechenland|greece|ελλάδα/i, "GR"], [/liechtenstein/i, "LI"], [/neuseeland|new zealand/i, "NZ"],
  [/arabische emirate|arab emirates|\buae\b/i, "AE"], [/japan|日本/i, "JP"]];
/** Land eines Google-Profils aus der Adresse („…, Austin, TX 78701, USA" → "US"). Unbekannt → "". */
export function addrCountry(addr: unknown): string {
  const a = String(addr || "").trim(); if (!a) return "";
  const last = a.split(",").pop() || "";
  for (const [re, c] of COUNTRY_RE) if (re.test(last)) return c;
  // US-Adresse ohne Ländernamen: „Austin, TX 78701"
  if (/,\s*[A-Z]{2}\s+\d{5}(-\d{4})?\s*$/.test(a)) return "US";
  return "";
}
