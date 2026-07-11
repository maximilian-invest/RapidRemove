/* RapidRemove — Google-Places-Profilsuche (Browser-seitig).
 *
 * Sucht echte Google-Unternehmensprofile zum eingegebenen Firmennamen und
 * liefert sie im Kandidaten-Format des Wizards zurück.
 *
 * Wichtig: nutzt die **Places API (New)** direkt aus dem Browser. Das ist die
 * einzige Places-Variante, die mit einem **Referrer-beschränkten** Browser-Key
 * funktioniert (CORS + Referer-Prüfung). Solche Maps-Browser-Keys sind bewusst
 * öffentlich (sie stehen ohnehin im ausgelieferten JS); abgesichert werden sie
 * über die erlaubten HTTP-Referrer in der Google-Cloud-Console – NICHT über
 * Geheimhaltung. Darum darf der Key hier als Default stehen. Überschreiben
 * lässt er sich jederzeit per Build-Variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 *
 * Voraussetzungen in der Cloud-Console:
 *  - „Places API (New)“ aktiviert
 *  - der Schlüssel auf die Auslieferungs-Domain(s) eingeschränkt (HTTP-Referrer)
 *  - ein Tages-/Kostenlimit (Quota) als Missbrauchsschutz empfohlen
 */

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyA1T047gDmDSUlc68hv-ooNOf996r46-3g";
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.primaryTypeDisplayName",
  "places.businessStatus",
  "places.googleMapsUri",
].join(",");

/* Pro Website-Sprache im passenden Land suchen (CLDR-Regioncode), damit die
   Suche nicht an der IP des Besuchers hängt. Deutsch bleibt bewusst OHNE
   Regioncode → DACH-/Standort-Bias (findet AT, DE und CH automatisch). */
const REGION_BY_LANG = {
  en: "GB", es: "ES", fr: "FR", it: "IT", nl: "NL",
  pt: "PT", ja: "JP", sv: "SE", da: "DK", no: "NO",
};

/** true, wenn ein Maps-Key vorhanden ist (sonst läuft der Wizard im Demo-Modus). */
export function placesEnabled() {
  return !!KEY;
}

function fmtRating(r, lang) {
  if (r == null) return null;
  const s = (Math.round(r * 10) / 10).toFixed(1);
  return lang === "de" ? s.replace(".", ",") : s;
}

/**
 * Sucht Profile zu `query`. Liefert ein Array im Wizard-Kandidatenformat:
 *   { id, placeId, name, cat, rating, reviews, addr, mapsUri, businessStatus, primary }
 * Wirft bei API-/Netzfehlern (vom Aufrufer abgefangen → Fallback).
 */
export async function searchProfiles(query, lang = "de") {
  const q = (query || "").trim();
  if (!KEY || !q) return [];
  const reqBody = { textQuery: q, languageCode: lang || "de" };
  const region = REGION_BY_LANG[lang];
  if (region) reqBody.regionCode = region; // biast die Suche aufs Land der Sprache (statt auf die IP)
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(reqBody),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Places ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const places = Array.isArray(data.places) ? data.places : [];
  return places.slice(0, 5).map((p, i) => ({
    id: "p" + (i + 1),
    placeId: p.id || "",
    name: p.displayName?.text || q,
    cat: p.primaryTypeDisplayName?.text || "",
    rating: fmtRating(p.rating, lang),
    reviews: p.userRatingCount || 0,
    addr: p.formattedAddress || "",
    mapsUri: p.googleMapsUri || "",
    businessStatus: p.businessStatus || "",
    primary: i === 0,
  }));
}

/** Einzelner „manueller“ Kandidat, falls nichts gefunden wurde – Nutzer kann
 *  trotzdem fortfahren (Name übernehmen, ohne Bewertung/Adresse). */
export function manualCandidate(query, lang = "de") {
  const q = (query || "").trim();
  return [{
    id: "p1",
    placeId: "",
    name: q || (lang === "de" ? "Ihr Unternehmen" : "Your Business"),
    cat: "",
    rating: null,
    reviews: 0,
    addr: "",
    mapsUri: "",
    businessStatus: "",
    primary: true,
  }];
}

/* Place-Details (New): einzelnes Profil per placeId laden. Damit lässt sich ein
   per ?p=<placeId> geteilter Wizard-Link wieder zum vollen Profil auflösen. */
const DETAIL_FIELD_MASK = [
  "id", "displayName", "formattedAddress", "rating", "userRatingCount",
  "primaryTypeDisplayName", "businessStatus", "googleMapsUri", "websiteUri",
].join(",");

/** Lädt ein Profil per placeId; liefert es im Wizard-Kandidatenformat oder null. */
export async function fetchProfileById(placeId, lang = "de") {
  const id = (placeId || "").trim();
  if (!KEY || !id) return null;
  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${encodeURIComponent(lang || "de")}`;
    const res = await fetch(url, { headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": DETAIL_FIELD_MASK } });
    if (!res.ok) return null;
    const p = await res.json();
    if (!p || !p.id) return null;
    return {
      id: "p1", placeId: p.id, name: p.displayName?.text || "",
      cat: p.primaryTypeDisplayName?.text || "", rating: fmtRating(p.rating, lang),
      reviews: p.userRatingCount || 0, addr: p.formattedAddress || "",
      mapsUri: p.googleMapsUri || "", businessStatus: p.businessStatus || "", primary: true,
      website: p.websiteUri || "", // Unternehmens-Website (für die Lead-Recherche im Admin)
    };
  } catch (e) { return null; }
}
