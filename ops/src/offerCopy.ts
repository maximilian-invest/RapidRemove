/* Texte für das schriftliche Angebot (PDF + Mails + Erinnerungen), 11 Sprachen.
   Platzhalter werden über Funktionen gefüllt. Rechtliche Leitplanken (Maximilian): kein „garantiert",
   kein „Null Risiko"/„Kein Risiko", kein „100 % legal", keine Software/Hacking-Begriffe; Löschung immer
   „über die von Google vorgesehenen Verfahren, im Auftrag des Inhabers". */

export type OfferLang = "de" | "en" | "es" | "fr" | "it" | "nl" | "pt" | "ja" | "sv" | "da" | "no";

export type OfferCopy = {
  pdf: {
    offerFor: string; offer: string; date: string; valid: string; contact: string;
    titleRemove: string; titleReset: string; introRemove: string; introReset: string;
    checked: string; reviewsOn: (n: string) => string; dist: string; src: (d: string) => string;
    goneH: string; goneHReset: string; gReviews: string; gAll: string; gNeg: string; gNegSub: (p: string) => string;
    gVis: string; gVisSub: string; gNew: string; gNewSub: string;
    pos: string; svc: string; qty: string; amt: string;
    itemRemove: string; itemRemoveD: (n: string) => string; itemReset: string; itemResetD: (n: string) => string;
    net: string; vat: (r: string) => string; gross: string; totalNet: string; vatEU: string; vatNon: string;
    dueB: (zero: string) => string; dueR: string; page: (a: number, b: number) => string;
    stepsH: string; steps: [string, string, string][];
    optK: string; optH: string; optP: string; optYear: (p: string) => string; optAlt: (p: string) => string; optBill: string;
    facts: [string, string][];
    terms: [string, string][];
    accH: string; accP: string; people: string; peopleSub: string;
  };
  mail: {
    subject: (p: string, d: string) => string; preview: (id: string, d: string) => string; title: (p: string) => string;
    hello: string; intro: (d: string) => string; introReset: (d: string) => string;
    checked: string; reviews: (n: string) => string; goneH: string; sReviews: string; sAll: string; sNeg: string; sNegSub: (p: string) => string; sAfter: string; sAfterSub: string;
    vat: (r: string) => string; gross: string; netNote: string;
    due: (zero: string) => string; dueR: string; cta: string; ctaSub: string;
    att: (file: string) => string; pdfLink: string; remindNote: string; unsub: string;
  };
  r1: { subject: (p: string) => string; hello: string; p1: (p: string) => string; p2: string; p3: (d: string) => string; bye: string; sign: string; signSub: string };
  r2: { subject: string; title: string; intro: string; qa: [string, string][]; cta: (d: string) => string };
  r3: { subject: (p: string, d: string) => string; title: (d: string) => string; p: (id: string, p: string, d: string, price: string) => string; cta: string; sub: string };
  unsubPage: { h: string; p: string };
};

const de: OfferCopy = {
  pdf: {
    offerFor: "Angebot für", offer: "Angebot", date: "Datum", valid: "Gültig bis", contact: "Ansprechpartner",
    titleRemove: "Löschung Ihres Google-Unternehmensprofils",
    titleReset: "Löschung und Neuanlage Ihres Google-Unternehmensprofils",
    introRemove: "Wir haben Ihr Profil geprüft: Eine Löschung ist möglich. Wir entfernen den Eintrag samt allen Bewertungen aus Google-Suche und Google Maps – über die von Google vorgesehenen Verfahren, in Ihrem Auftrag. Sie zahlen erst, wenn das Profil gelöscht ist.",
    introReset: "Wir haben Ihr Profil geprüft: Eine Löschung ist möglich. Wir entfernen den bestehenden Eintrag samt allen Bewertungen – über die von Google vorgesehenen Verfahren, in Ihrem Auftrag – und richten anschließend ein neues Profil mit korrekten Daten ein. Sie zahlen erst nach erfolgreicher Umsetzung.",
    checked: "Geprüftes Profil", reviewsOn: (n) => `${n} Bewertungen auf Google`, dist: "Verteilung der Bewertungen", src: (d) => `Quelle: Google Maps, Stand ${d}`,
    goneH: "Was mit der Löschung verschwindet", goneHReset: "Was sich ändert",
    gReviews: "Bewertungen", gAll: "alle, ohne Ausnahme", gNeg: "Davon 1–2 Sterne", gNegSub: (p) => `${p} % aller Bewertungen`,
    gVis: "Sichtbarkeit", gVisSub: "Suche & Maps – kein Eintrag mehr", gNew: "Neues Profil", gNewSub: "frischer Start mit 0 Bewertungen",
    pos: "Pos.", svc: "Leistung", qty: "Menge", amt: "Betrag",
    itemRemove: "Löschung Google-Unternehmensprofil",
    itemRemoveD: (n) => `Dauerhafte Entfernung des Eintrags inkl. aller ${n} Bewertungen aus Google-Suche und Google Maps. Bearbeitung durch unser Team, meist ca. 24 Stunden nach Rechteübertragung.`,
    itemReset: "Löschung + Neuanlage Google-Unternehmensprofil",
    itemResetD: (n) => `Entfernung des bestehenden Eintrags inkl. aller ${n} Bewertungen und Einrichtung eines neuen Profils mit korrekten Daten und Kategorien.`,
    net: "Summe netto", vat: (r) => `zzgl. ${r} % USt`, gross: "Gesamt brutto", totalNet: "Gesamt netto",
    vatEU: "zzgl. USt · bei gültiger EU-UID Reverse Charge", vatNon: "Nettopreis, zzgl. ggf. anfallender Steuern",
    dueB: (z) => `Heute fällig: ${z}.`, dueR: "Die Rechnung erhalten Sie erst nach erfolgreicher Löschung. Bleibt das Profil online, zahlen Sie nichts.",
    page: (a, b) => `Seite ${a} von ${b}`,
    stepsH: "So läuft die Löschung ab",
    steps: [
      ["Angebot annehmen", "Online in ca. 1 Minute – alle Angaben sind bereits ausgefüllt.", "Heute"],
      ["Zugriff erteilen", "Sie geben uns Verwaltungszugriff auf das Profil. Kein Passwort, kein Zugriff auf Gmail, Ads oder andere Daten.", "ca. 2 Minuten"],
      ["Profil gelöscht", "Wir beantragen die Löschung über die von Google vorgesehenen Verfahren. Danach erhalten Sie die Rechnung.", "meist ca. 24 Stunden"],
    ],
    optK: "Optional · nicht im Angebotspreis enthalten", optH: "Schutz vor erneuter Eintragung",
    optP: "Jeder kann bei Google einen Ort neu vorschlagen – bei rund 5–10 % der Unternehmen taucht später ein neues, leeres Profil auf. Mit Schutz überwachen wir das automatisch und löschen ein neues Profil kostenlos erneut.",
    optYear: (p) => `${p} / Jahr`, optAlt: (p) => `oder ${p} / Monat · zzgl. USt`, optBill: "Abrechnung erst ab Löschung",
    facts: [["seit 2017", "auf Google-Profile spezialisiert"], ["~4.000", "gelöschte Profile"], ["30+", "Länder"], ["{zero}", "Vorauszahlung"]],
    terms: [
      ["Zahlung", "Rechnung nach erfolgreicher Löschung, zahlbar per Karte, Überweisung, PayPal oder Klarna."],
      ["Voraussetzung Fixpreis", "Inhaber- oder Verwalterzugriff auf das verifizierte Profil. Fehlt der Zugriff, besorgen wir ihn – nur mit Ihrer vorherigen Zustimmung (+{rights})."],
      ["Datenschutz", "EU-Unternehmen, Verarbeitung nach DSGVO. Wir erhalten keinen Zugriff auf Ihr Google-Konto, Gmail oder Ads."],
      ["Grundlage", "Es gelten unsere AGB (rapid-remove.com). Preise netto zzgl. gesetzlicher USt."],
    ],
    accH: "Angebot annehmen", accP: "Scannen Sie den Code oder öffnen Sie den Link – die Bestellung ist bereits mit diesem Profil und Preis vorbereitet.",
    people: "Fragen? Max & Matthias sind für Sie da.", peopleSub: "Mo–Fr 08–18 Uhr · +43 6245 9305300 · WhatsApp · helpdesk@rapid-remove.com",
  },
  mail: {
    subject: (p, d) => `Ihr Angebot für ${p} (gültig bis ${d})`, preview: (id, d) => `Fixpreis-Angebot ${id} – gültig bis ${d}`, title: (p) => `Ihr Angebot für ${p}`,
    hello: "Guten Tag,", intro: (d) => `anbei Ihr Angebot zur Löschung Ihres Google-Unternehmensprofils – als PDF zum Weiterleiten. Der Fixpreis gilt bis ${d}.`,
    introReset: (d) => `anbei Ihr Angebot zur Löschung und Neuanlage Ihres Google-Unternehmensprofils – als PDF zum Weiterleiten. Der Fixpreis gilt bis ${d}.`,
    checked: "GEPRÜFTES PROFIL", reviews: (n) => `${n} Bewertungen`, goneH: "Was mit der Löschung verschwindet",
    sReviews: "BEWERTUNGEN", sAll: "alle, ohne Ausnahme", sNeg: "1–2 STERNE", sNegSub: (p) => `${p} % aller Bewertungen`, sAfter: "SICHTBARKEIT", sAfterSub: "kein Eintrag mehr",
    vat: (r) => `zzgl. ${r} % USt`, gross: "Gesamt brutto", netNote: "zzgl. USt",
    due: (z) => `Heute fällig: ${z}.`, dueR: "Rechnung erst nach erfolgreicher Löschung. Bleibt das Profil online, zahlen Sie nichts.",
    cta: "Angebot annehmen", ctaSub: "Bestellung ist vorbereitet – dauert ca. 1 Minute.",
    att: (f) => `${f} – 2 Seiten mit Ablauf, Konditionen und Ansprechpartnern.`, pdfLink: "Angebot als PDF öffnen",
    remindNote: "Sie erhalten bis zu 3 Erinnerungen zu diesem Angebot, weil Sie das beim Anfordern gewählt haben.", unsub: "Abmelden",
  },
  r1: {
    subject: (p) => `Kurze Frage zu Ihrem Angebot (${p})`, hello: "Guten Tag,",
    p1: (p) => `gestern haben Sie unser Angebot zur Löschung des Google-Profils von ${p} angefordert. Konnten Sie es schon intern besprechen?`,
    p2: "Falls noch etwas offen ist – einfach auf diese Mail antworten, ich melde mich persönlich. Die häufigste Frage vorab: Sie zahlen erst, wenn das Profil wirklich weg ist.",
    p3: (d) => `Hier geht's direkt zum Angebot (gilt bis ${d}):`, bye: "Viele Grüße", sign: "Max", signSub: "Maximilian Hölzl · RapidRemove",
  },
  r2: {
    subject: "Noch Fragen vor der Beauftragung?", title: "Noch Fragen vor der Beauftragung?",
    intro: "Guten Tag, das fragen uns die meisten Unternehmen, bevor sie das Angebot annehmen:",
    qa: [
      ["Ist das seriös?", "Wir arbeiten seit 2017 ausschließlich mit Google-Profilen – über die von Google vorgesehenen Verfahren, im Auftrag des Inhabers. Simple Solution. OG, Hallein, UID ATU72401536."],
      ["Was passiert mit meinen Daten?", "Sie geben uns nur Verwaltungszugriff auf das Profil. Kein Passwort, kein Zugriff auf Gmail, Ads oder andere Konten. Verarbeitung nach DSGVO."],
      ["Was, wenn es nicht klappt?", "Dann zahlen Sie nichts. Die Rechnung kommt erst, wenn das Profil gelöscht ist – heute fällig: {zero}."],
    ],
    cta: (d) => `Angebot ansehen – gültig bis ${d}`,
  },
  r3: {
    subject: (p, d) => `Ihr Angebot für ${p} läuft am ${d} ab`, title: (d) => `Ihr Angebot gilt noch bis ${d}`,
    p: (id, p, d, price) => `Ihr Angebot ${id} für ${p} läuft am ${d} ab. Bis dahin bleibt der Fixpreis von ${price} (zzgl. USt) für Sie festgehalten.`,
    cta: "Angebot annehmen", sub: "Danach können Sie jederzeit ein neues Angebot zum aktuellen Preis anfordern.",
  },
  unsubPage: { h: "Abgemeldet", p: "Sie erhalten keine weiteren Erinnerungen zu diesem Angebot. Das Angebot selbst bleibt bis zum Ablaufdatum gültig." },
};

const en: OfferCopy = {
  pdf: {
    offerFor: "Quote for", offer: "Quote", date: "Date", valid: "Valid until", contact: "Contact",
    titleRemove: "Removal of your Google Business Profile",
    titleReset: "Removal and re-creation of your Google Business Profile",
    introRemove: "We have checked your profile: removal is possible. We remove the listing and all of its reviews from Google Search and Google Maps – through the procedures Google provides, on your behalf. You only pay once the profile has been removed.",
    introReset: "We have checked your profile: removal is possible. We remove the existing listing and all of its reviews – through the procedures Google provides, on your behalf – and then set up a new profile with correct details. You only pay after successful completion.",
    checked: "Checked profile", reviewsOn: (n) => `${n} reviews on Google`, dist: "Rating distribution", src: (d) => `Source: Google Maps, as of ${d}`,
    goneH: "What disappears with the removal", goneHReset: "What changes",
    gReviews: "Reviews", gAll: "all of them, no exceptions", gNeg: "Of which 1–2 stars", gNegSub: (p) => `${p} % of all reviews`,
    gVis: "Visibility", gVisSub: "Search & Maps – no listing anymore", gNew: "New profile", gNewSub: "fresh start with 0 reviews",
    pos: "No.", svc: "Service", qty: "Qty", amt: "Amount",
    itemRemove: "Google Business Profile removal",
    itemRemoveD: (n) => `Permanent removal of the listing incl. all ${n} reviews from Google Search and Google Maps. Handled by our team, usually about 24 hours after access is granted.`,
    itemReset: "Google Business Profile removal + re-creation",
    itemResetD: (n) => `Removal of the existing listing incl. all ${n} reviews and set-up of a new profile with correct details and categories.`,
    net: "Subtotal (net)", vat: (r) => `plus ${r} % VAT`, gross: "Total (gross)", totalNet: "Total (net)",
    vatEU: "plus VAT · reverse charge with a valid EU VAT ID", vatNon: "Net price, plus any applicable taxes",
    dueB: (z) => `Due today: ${z}.`, dueR: "You receive the invoice only after a successful removal. If the profile stays online, you pay nothing.",
    page: (a, b) => `Page ${a} of ${b}`,
    stepsH: "How the removal works",
    steps: [
      ["Accept the quote", "Online in about 1 minute – all details are already filled in.", "Today"],
      ["Grant access", "You give us manager access to the profile. No password, no access to Gmail, Ads or any other data.", "approx. 2 minutes"],
      ["Profile removed", "We request the removal through the procedures Google provides. Then you receive the invoice.", "usually about 24 hours"],
    ],
    optK: "Optional · not included in the quoted price", optH: "Protection against re-listing",
    optP: "Anyone can suggest a place on Google – for about 5–10 % of businesses a new, empty profile appears later. With protection we monitor this automatically and remove a new profile again free of charge.",
    optYear: (p) => `${p} / year`, optAlt: (p) => `or ${p} / month · plus VAT`, optBill: "Billed only from the removal on",
    facts: [["since 2017", "specialised in Google profiles"], ["~4,000", "profiles removed"], ["30+", "countries"], ["{zero}", "upfront payment"]],
    terms: [
      ["Payment", "Invoice after a successful removal, payable by card, bank transfer, PayPal or Klarna."],
      ["Fixed-price requirement", "Owner or manager access to the verified profile. If access is missing, we obtain it – only with your prior consent (+{rights})."],
      ["Data protection", "EU company, processing under the GDPR. We get no access to your Google account, Gmail or Ads."],
      ["Terms", "Our terms and conditions apply (rapid-remove.com). Prices are net, plus statutory VAT where applicable."],
    ],
    accH: "Accept the quote", accP: "Scan the code or open the link – your order is already prepared with this profile and price.",
    people: "Questions? Max & Matthias are here for you.", peopleSub: "Mon–Fri 8 am–6 pm (CET) · +43 6245 9305300 · WhatsApp · helpdesk@rapid-remove.com",
  },
  mail: {
    subject: (p, d) => `Your quote for ${p} (valid until ${d})`, preview: (id, d) => `Fixed-price quote ${id} – valid until ${d}`, title: (p) => `Your quote for ${p}`,
    hello: "Hello,", intro: (d) => `attached is your quote for removing your Google Business Profile – as a PDF you can forward. The fixed price is valid until ${d}.`,
    introReset: (d) => `attached is your quote for removing and re-creating your Google Business Profile – as a PDF you can forward. The fixed price is valid until ${d}.`,
    checked: "CHECKED PROFILE", reviews: (n) => `${n} reviews`, goneH: "What disappears with the removal",
    sReviews: "REVIEWS", sAll: "all of them", sNeg: "1–2 STARS", sNegSub: (p) => `${p} % of all reviews`, sAfter: "VISIBILITY", sAfterSub: "no listing anymore",
    vat: (r) => `plus ${r} % VAT`, gross: "Total (gross)", netNote: "plus applicable taxes",
    due: (z) => `Due today: ${z}.`, dueR: "Invoice only after a successful removal. If the profile stays online, you pay nothing.",
    cta: "Accept quote", ctaSub: "Your order is prepared – takes about 1 minute.",
    att: (f) => `${f} – 2 pages with process, terms and contacts.`, pdfLink: "Open quote as PDF",
    remindNote: "You will receive up to 3 reminders about this quote because you chose this when requesting it.", unsub: "Unsubscribe",
  },
  r1: {
    subject: (p) => `Quick question about your quote (${p})`, hello: "Hello,",
    p1: (p) => `yesterday you requested our quote for removing the Google profile of ${p}. Have you had a chance to discuss it internally?`,
    p2: "If anything is still unclear, just reply to this email and I'll get back to you personally. The most common question up front: you only pay once the profile is really gone.",
    p3: (d) => `Here's the direct link to your quote (valid until ${d}):`, bye: "Best regards", sign: "Max", signSub: "Maximilian Hölzl · RapidRemove",
  },
  r2: {
    subject: "Any questions before you go ahead?", title: "Any questions before you go ahead?",
    intro: "Hello, these are the questions most businesses ask us before accepting the quote:",
    qa: [
      ["Is this legitimate?", "Since 2017 we have worked exclusively on Google profiles – through the procedures Google provides, on behalf of the owner. Simple Solution. OG, Hallein (Austria), VAT ID ATU72401536."],
      ["What happens to my data?", "You only give us manager access to the profile. No password, no access to Gmail, Ads or any other account. Processing under the GDPR."],
      ["What if it doesn't work?", "Then you pay nothing. The invoice only comes once the profile has been removed – due today: {zero}."],
    ],
    cta: (d) => `View quote – valid until ${d}`,
  },
  r3: {
    subject: (p, d) => `Your quote for ${p} expires on ${d}`, title: (d) => `Your quote is valid until ${d}`,
    p: (id, p, d, price) => `Your quote ${id} for ${p} expires on ${d}. Until then the fixed price of ${price} (plus applicable taxes) is held for you.`,
    cta: "Accept quote", sub: "After that you can request a new quote at the current price at any time.",
  },
  unsubPage: { h: "Unsubscribed", p: "You won't receive any more reminders about this quote. The quote itself remains valid until its expiry date." },
};

/* Weitere Sprachen: offerCopyMore.ts (es, fr, it, nl, pt, ja, sv, da, no). Fehlt eine, gilt Englisch. */
import { MORE } from "./offerCopyMore";
const ALL: Partial<Record<OfferLang, OfferCopy>> = { de, en, ...MORE };
export function offerCopy(lang: string): OfferCopy {
  return ALL[lang as OfferLang] || (lang === "de" ? de : en);
}
