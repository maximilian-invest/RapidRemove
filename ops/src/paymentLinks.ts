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

/** Liefert den hinterlegten Zahlungslink für ein Szenario – oder undefined. */
export function payLinkFor(service: string, protection: string, currency: string): string | undefined {
  const key = `${service}|${protection || "none"}|${(currency || "eur").toLowerCase()}`;
  return PAYMENT_LINKS[key];
}
