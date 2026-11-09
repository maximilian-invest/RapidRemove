/* Schriftliches Angebot (09.11.2026): Texte für die Box im Bestellprozess, das Banner an der Kasse
   und die Angebotsseite /angebot/<id>. 11 Sprachen; fehlt eine, gilt Englisch. */
const de = {
  boxH: "Erst intern besprechen?",
  boxP: "Wir schicken Ihnen ein schriftliches Fixpreis-Angebot – zum Weiterleiten an Partner oder Steuerberater. Preis gilt 14 Tage.",
  ph: "Ihre E-Mail-Adresse", send: "Angebot senden", sending: "Wird gesendet …",
  rem: "Ja, erinnern Sie mich bis zu 3× an das Angebot. Abmeldung jederzeit.",
  bad: "Bitte eine gültige E-Mail-Adresse eingeben.", err: "Das hat nicht geklappt – bitte erneut versuchen oder uns per WhatsApp schreiben.",
  sentH: "Angebot ist unterwegs",
  sentP: (email, d) => [`Wir haben es an `, email, ` geschickt – als PDF zum Weiterleiten. Preis für Sie festgehalten bis `, d, `.`],
  quick: "Lieber gleich klären?", call: "Anrufen",
  banner: (id, d) => `Angebot ${id} · Preis festgehalten bis ${d}`,
  loading: "Ihr Angebot wird geladen …",
  nf: "Angebot nicht gefunden", nfP: "Der Link ist ungültig oder unvollständig. Bitte öffnen Sie ihn direkt aus der E-Mail oder schreiben Sie uns.",
  expH: "Dieses Angebot ist abgelaufen",
  expP: (id, p, d) => [`Angebot ${id} für `, p, ` galt bis ${d}. Mit einem Klick bekommen Sie ein neues – zum aktuellen Preis, wieder 14 Tage gültig.`],
  renew: "Neues Angebot anfordern", direct: "Direkt bestellen", renewed: (email) => `Neues Angebot ist unterwegs an ${email}.`,
  accH: "Dieses Angebot wurde bereits angenommen", accP: "Den Stand Ihres Auftrags sehen Sie im Kundenportal. Fragen? Schreiben Sie uns jederzeit.", portal: "Zum Kundenportal",
};
const en = {
  boxH: "Need to discuss it internally first?",
  boxP: "We'll send you a written fixed-price quote – to forward to your partner or accountant. Price valid for 14 days.",
  ph: "Your email address", send: "Send quote", sending: "Sending …",
  rem: "Yes, remind me about the quote up to 3 times. Unsubscribe anytime.",
  bad: "Please enter a valid email address.", err: "That didn't work – please try again or message us on WhatsApp.",
  sentH: "Your quote is on its way",
  sentP: (email, d) => [`We've sent it to `, email, ` – as a PDF you can forward. Price held for you until `, d, `.`],
  quick: "Rather sort it out now?", call: "Call",
  banner: (id, d) => `Quote ${id} · price held until ${d}`,
  loading: "Loading your quote …",
  nf: "Quote not found", nfP: "The link is invalid or incomplete. Please open it directly from the email or contact us.",
  expH: "This quote has expired",
  expP: (id, p, d) => [`Quote ${id} for `, p, ` was valid until ${d}. Get a new one with one click – at the current price, valid for another 14 days.`],
  renew: "Request a new quote", direct: "Order directly", renewed: (email) => `A new quote is on its way to ${email}.`,
  accH: "This quote has already been accepted", accP: "You can see the status of your order in the customer portal. Questions? Message us anytime.", portal: "Go to customer portal",
};
import { MORE_OFFER_UI } from "./offer-copy-more";
const ALL = { de, en, ...MORE_OFFER_UI };
export const offerUi = (code) => ALL[code] || en;

/** Angebots-Kontext für den Bestellprozess (gesetzt von der Angebotsseite, gilt für diese Sitzung). */
export function readOfferCtx() {
  try { const o = JSON.parse(sessionStorage.getItem("rr_offer") || "null"); return o && o.id && o.t ? o : null; } catch (e) { return null; }
}
export function setOfferCtx(o) { try { if (o) sessionStorage.setItem("rr_offer", JSON.stringify(o)); else sessionStorage.removeItem("rr_offer"); } catch (e) {} }
