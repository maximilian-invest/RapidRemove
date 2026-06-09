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
  // ↓ Ausgabe von `npx tsx src/setupExpressLinks.ts --apply` hier einsetzen
};

/** Liefert den hinterlegten Zahlungslink für ein Szenario – oder undefined.
 *  Bei express=true wird die Express-Tabelle (höherer Einmalbetrag) verwendet. */
export function payLinkFor(service: string, protection: string, currency: string, express = false): string | undefined {
  const cur = (currency || "eur").toLowerCase();
  const prot = protection || "none";
  if (express) return EXPRESS_PAYMENT_LINKS[`${service}|express|${prot}|${cur}`];
  return PAYMENT_LINKS[`${service}|${prot}|${cur}`];
}
