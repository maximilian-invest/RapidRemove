/* Bestehende Stripe-Zahlungslinks – EIN fertiger Link pro Szenario.
 *
 * WICHTIG: Hier wird NICHTS in Stripe erzeugt. Es werden ausschließlich diese
 * bereits in Stripe angelegten Links verschickt. Trag unten die echten URLs ein.
 *
 * Schlüssel:  `${service}|${protection}|${currency}`
 *   service:     remove | reset | express | …   (Leistungs-Key der Bestellung)
 *   protection:  none | monthly | monitor | lifetime
 *   currency:    eur | usd
 *
 * Beispiel:
 *   "remove|monthly|eur": "https://buy.stripe.com/abc123",
 *   "remove|none|eur":    "https://buy.stripe.com/def456",
 */
export const PAYMENT_LINKS: Record<string, string> = {
  // ↓ hier die echten Stripe-Links eintragen (Schlüssel = service|protection|currency)
};

/* Express-Bearbeitung (Aufpreis): EIGENE Links, da der Einmalbetrag höher ist.
 * Schlüssel:  `${service}|express|${protection}|${currency}`
 * Diese Tabelle füllt das Skript `setupExpressLinks.ts` (Ausgabe einfach hier einsetzen). */
export const EXPRESS_PAYMENT_LINKS: Record<string, string> = {
  "remove|express|none|eur":     "https://buy.stripe.com/7sY8wO89j1BZ18K9U42cg1d",
  "remove|express|monthly|eur":  "https://buy.stripe.com/dRm6oG4X72G37x85DO2cg1e",
  "remove|express|monitor|eur":  "https://buy.stripe.com/cNi7sK1KVbczbNo8Q02cg1f",
  "remove|express|lifetime|eur": "https://buy.stripe.com/5kQ6oG75f80n2cOeak2cg1g",
  "remove|express|none|usd":     "https://buy.stripe.com/cNicN489j6Wj18K8Q02cg1h",
  "remove|express|monthly|usd":  "https://buy.stripe.com/aFabJ061b4Ob6t48Q02cg1i",
  "remove|express|monitor|usd":  "https://buy.stripe.com/9B69AS89j94r6t46HS2cg1j",
  "remove|express|lifetime|usd": "https://buy.stripe.com/3cIeVc75f5Sf7x89U42cg1k",
};

/** Liefert den hinterlegten Zahlungslink für ein Szenario – oder undefined.
 *  Bei express=true wird die Express-Tabelle (höherer Einmalbetrag) verwendet. */
export function payLinkFor(service: string, protection: string, currency: string, express = false): string | undefined {
  const cur = (currency || "eur").toLowerCase();
  const prot = protection || "none";
  if (express) return EXPRESS_PAYMENT_LINKS[`${service}|express|${prot}|${cur}`];
  return PAYMENT_LINKS[`${service}|${prot}|${cur}`];
}

/* Bewertungs-Produkt „Einzelne Bewertungen löschen" — 179 je Bewertung,
 * abgerechnet NUR je tatsächlich gelöschter Bewertung. Ein Link je Stückzahl:
 * Schlüssel `reviews|<anzahl>|<currency>` (Anzahl 1–10). Die Links legt der
 * Admin-Button „Bewertungs-Links anlegen" (POST /admin/setup-reviews) an —
 * gleiche Mechanik wie bei Express (setupExpressLinks). Ausgabe hier einsetzen. */
export const REVIEWS_PAYMENT_LINKS: Record<string, string> = {
  // ↓ per /admin/setup-reviews erzeugen und hier eintragen (reviews|1|eur … reviews|10|usd)
};

/** Zahlungslink für N gelöschte Bewertungen – oder undefined (dann Betrag-Match). */
export function reviewsLinkFor(count: number, currency: string): string | undefined {
  const cur = (currency || "eur").toLowerCase();
  return REVIEWS_PAYMENT_LINKS[`reviews|${Math.max(1, Math.floor(count))}|${cur}`];
}
