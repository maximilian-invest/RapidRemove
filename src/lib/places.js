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
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({ textQuery: q, languageCode: lang || "de" }),
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
