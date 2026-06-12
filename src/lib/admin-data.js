/* RapidRemove Admin — Mock-Daten (Bestellungen, Vorlagen, Rechnungen) */

const SERVICES = {
  remove:   { name: "Profil entfernen", price: 450 },
  reset:    { name: "Profil + Neustart", price: 850 },
  express:  { name: "Express-Löschung", price: 690 },
  deindex:  { name: "Presse auslisten (Prüfung)", price: 0 },
  orm:      { name: "Reputations-Audit", price: 290 },
};

const ORDERS = [
  { id: "RR-204871", created: "05.06.2026 · 09:14", name: "Dr. Markus Berger", email: "m.berger@zahnarzt-berger.de", phone: "+49 211 5523900",
    company: "Zahnarztpraxis Dr. Berger", profile: "Zahnarztpraxis Dr. Berger, Düsseldorf", reviews: 47, rating: "2,4",
    service: "reset", protection: "monitor", status: "new", pay: "pending", amount: 850, protAmount: 69.9, country: "DE",
    note: "Mehrere Fake-Bewertungen nach Mitarbeiterstreit. Wünscht diskrete Behandlung." },
  { id: "RR-204865", created: "05.06.2026 · 08:02", name: "Sandra Hoffmann", email: "s.hoffmann@architektur-hoffmann.de", phone: "+49 40 8829110",
    company: "Hoffmann Architekturbüro", profile: "Hoffmann Architektur, Hamburg", reviews: 12, rating: "3,1",
    service: "remove", protection: null, status: "new", pay: "pending", amount: 450, protAmount: 0, country: "DE",
    note: "Möchte komplett aus Google Maps verschwinden." },
  { id: "RR-204858", created: "04.06.2026 · 17:41", name: "Thomas Wagner", email: "wagner@autohaus-wagner.at", phone: "+43 1 4029988",
    company: "Autohaus Wagner GmbH", profile: "Autohaus Wagner, Wien", reviews: 88, rating: "2,9",
    service: "reset", protection: "lifetime", status: "progress", pay: "paid", amount: 850, protAmount: 990, country: "AT",
    note: "Antrag eingereicht. Wartet auf Google-Bestätigung." },
  { id: "RR-204844", created: "04.06.2026 · 14:20", name: "Elena Petrova", email: "elena@petrova-consulting.com", phone: "+44 20 71234567",
    company: "Petrova Consulting Ltd", profile: "Petrova Consulting, London", reviews: 31, rating: "3,4",
    service: "express", protection: "monthly", status: "progress", pay: "paid", amount: 690, protAmount: 24.9, country: "UK",
    note: "Express-Bearbeitung gebucht. In aktiver Bearbeitung." },
  { id: "RR-204821", created: "03.06.2026 · 11:08", name: "Giulia Romano", email: "g.romano@ristoranteromano.it", phone: "+39 06 99221100",
    company: "Ristorante Romano", profile: "Ristorante Romano, Roma", reviews: 156, rating: "3,8",
    service: "remove", protection: "monthly", status: "done", pay: "paid", amount: 450, protAmount: 24.9, country: "IT",
    note: "Profil erfolgreich gelöscht. Tägliche Überwachung aktiv." },
  { id: "RR-204799", created: "02.06.2026 · 16:55", name: "Lukas Maier", email: "l.maier@maier-immobilien.de", phone: "+49 89 33440011",
    company: "Maier Immobilien", profile: "Maier Immobilien, München", reviews: 23, rating: "2,1",
    service: "remove", protection: null, status: "done", pay: "paid", amount: 450, protAmount: 0, country: "DE",
    note: "Profil gelöscht, Kunde zufrieden, Trustpilot-Bewertung erhalten." },
  { id: "RR-204781", created: "02.06.2026 · 10:30", name: "Pierre Dubois", email: "p.dubois@cabinet-dubois.fr", phone: "+33 1 44556677",
    company: "Cabinet Dubois", profile: "Cabinet Dubois, Paris", reviews: 9, rating: "3,6",
    service: "deindex", protection: null, status: "new", pay: "pending", amount: 0, protAmount: 0, country: "FR",
    note: "Anfrage Presse-Auslistung. Wartet auf kostenlose Prüfung durch Partnerkanzlei." },
  { id: "RR-204772", created: "01.06.2026 · 13:47", name: "Anna Schmidt", email: "a.schmidt@schmidt-friseur.de", phone: "+49 30 22113344",
    company: "Salon Schmidt", profile: "Salon Schmidt, Berlin", reviews: 64, rating: "3,2",
    service: "reset", protection: "monitor", status: "done", pay: "paid", amount: 850, protAmount: 69.9, country: "DE",
    note: "Abgeschlossen. Neues Profil aufgesetzt." },
  { id: "RR-204760", created: "31.05.2026 · 19:12", name: "Robert King", email: "robert@kingdental.com", phone: "+1 312 5550199",
    company: "King Dental Chicago", profile: "King Dental, Chicago", reviews: 102, rating: "2,7",
    service: "reset", protection: "lifetime", status: "progress", pay: "paid", amount: 950, protAmount: 990, country: "US",
    note: "USD-Kunde. Antrag läuft." },
  { id: "RR-204741", created: "31.05.2026 · 08:25", name: "Maria Gomez", email: "maria@clinicagomez.es", phone: "+34 91 5559988",
    company: "Clínica Gómez", profile: "Clínica Gómez, Madrid", reviews: 18, rating: "3,0",
    service: "remove", protection: null, status: "new", pay: "failed", amount: 495, protAmount: 0, country: "ES",
    note: "Zahlung fehlgeschlagen — Karte abgelehnt. Erneut anfragen." },
];

/* Geprüfte Profile — Leads aus dem kostenlosen „Profil prüfen"-Tool der Website.
   Noch keine Bestellung; manche wurden bereits in einen Auftrag umgewandelt. */
const CHECKS = [
  { id: "PR-30912", created: "05.06.2026 · 11:42", name: "Jens Brandl", email: "j.brandl@brandl-dachdecker.de",
    profile: "Brandl Bedachungen, Köln", reviews: 38, rating: "2,3", flagged: 14, recommend: "remove",
    status: "neu", orderId: null },
  { id: "PR-30908", created: "05.06.2026 · 10:18", name: "Caterina Lutz", email: "info@lutz-kosmetik.de",
    profile: "Kosmetikstudio Lutz, Stuttgart", reviews: 21, rating: "2,8", flagged: 7, recommend: "reset",
    status: "kontaktiert", orderId: null },
  { id: "PR-30901", created: "05.06.2026 · 08:55", name: "—", email: "kanzlei@weber-recht.de",
    profile: "Weber Rechtsanwälte, Frankfurt", reviews: 9, rating: "3,9", flagged: 1, recommend: "deindex",
    status: "kein-bedarf", orderId: null },
  { id: "PR-30887", created: "04.06.2026 · 16:30", name: "Markus Berger", email: "m.berger@zahnarzt-berger.de",
    profile: "Zahnarztpraxis Dr. Berger, Düsseldorf", reviews: 47, rating: "2,4", flagged: 19, recommend: "reset",
    status: "konvertiert", orderId: "RR-204871" },
  { id: "PR-30875", created: "04.06.2026 · 13:12", name: "Sofia Klein", email: "s.klein@klein-fitness.de",
    profile: "Klein Fitness & Wellness, Leipzig", reviews: 64, rating: "2,6", flagged: 11, recommend: "remove",
    status: "neu", orderId: null },
  { id: "PR-30862", created: "03.06.2026 · 18:47", name: "—", email: "kontakt@gasthaus-sonne.at",
    profile: "Gasthaus zur Sonne, Innsbruck", reviews: 112, rating: "3,1", flagged: 23, recommend: "reset",
    status: "kontaktiert", orderId: null },
  { id: "PR-30850", created: "03.06.2026 · 09:33", name: "Sandra Hoffmann", email: "s.hoffmann@architektur-hoffmann.de",
    profile: "Hoffmann Architektur, Hamburg", reviews: 12, rating: "3,1", flagged: 5, recommend: "remove",
    status: "konvertiert", orderId: "RR-204865" },
  { id: "PR-30841", created: "02.06.2026 · 14:05", name: "Tobias Vogt", email: "t.vogt@vogt-elektro.de",
    profile: "Vogt Elektrotechnik, Nürnberg", reviews: 28, rating: "3,3", flagged: 3, recommend: "remove",
    status: "neu", orderId: null },
  { id: "PR-30829", created: "01.06.2026 · 19:50", name: "—", email: "praxis@dr-falk.de",
    profile: "Praxis Dr. Falk, Bremen", reviews: 53, rating: "2,2", flagged: 17, recommend: "reset",
    status: "neu", orderId: null },
];

const STATUS_FLOW = [
  { id: "new", label: "Bestellung eingegangen", desc: "Anfrage erhalten, Details prüfen" },
  { id: "progress", label: "In Bearbeitung", desc: "Löschung über offizielle Schnittstellen eingeleitet" },
  { id: "done", label: "Profil gelöscht", desc: "Profil & Bewertungen entfernt — Zahlung ausgelöst" },
];

const TEMPLATES = [
  { id: "received", icon: "inbox", tag: "Auto · bei Bestellung", name: "Bestellbestätigung", subject: "Ihre Bestellung {{order_id}} ist eingegangen",
    body: "Hallo {{name}},\n\nvielen Dank für Ihr Vertrauen. Wir haben Ihre Bestellung {{order_id}} für „{{service}}“ erhalten und prüfen aktuell die Details Ihres Profils.\n\nSie müssen nichts weiter tun – wir melden uns innerhalb von 24 Stunden mit dem ersten Status-Update. Bezahlt wird erst nach erfolgreicher Löschung.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "progress", icon: "clock", tag: "Status-Update", name: "In Bearbeitung", subject: "Update zu {{order_id}}: Wir haben die Löschung eingeleitet",
    body: "Hallo {{name}},\n\nkurzes Update: Wir haben die Löschung Ihres Profils „{{profile}}“ über die offiziellen Schnittstellen eingeleitet.\n\nDie Bearbeitung dauert in der Regel 24 Stunden. Sobald das Profil entfernt ist, informieren wir Sie sofort.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "done", icon: "check", tag: "Erfolg + Zahlung", name: "Profil gelöscht", subject: "Erledigt! Ihr Profil wurde gelöscht ✓",
    body: "Hallo {{name}},\n\ngeschafft – Ihr Unternehmensprofil „{{profile}}“ wurde samt aller Bewertungen dauerhaft aus Google entfernt.\n\nWie vereinbart wird der Betrag von {{amount}} nun fällig. Die Rechnung finden Sie im Anhang.\n\nWenn Sie zufrieden sind, freuen wir uns sehr über Ihre Bewertung auf Trustpilot.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "invoice", icon: "fileText", tag: "Rechnung", name: "Rechnung senden", subject: "Ihre Rechnung {{invoice_id}} von RapidRemove",
    body: "Hallo {{name}},\n\nanbei erhalten Sie Ihre Rechnung {{invoice_id}} über {{amount}} für die erfolgreiche Löschung Ihres Profils.\n\nZahlbar über den sicheren Stripe-Link in dieser E-Mail. Bei Fragen sind wir jederzeit für Sie da.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "payfail", icon: "alert", tag: "Zahlung", name: "Zahlung fehlgeschlagen", subject: "Kleine Sache: Ihre Zahlung für {{order_id}}",
    body: "Hallo {{name}},\n\nbei der Zahlung für Ihre Bestellung {{order_id}} gab es ein Problem – Ihre Karte wurde von der Bank abgelehnt.\n\nKein Stress: Über den folgenden sicheren Link können Sie die Zahlung in 30 Sekunden erneut vornehmen. Ihr Auftrag bleibt für Sie reserviert.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "deindex", icon: "gavel", tag: "Presse · Auslistung", name: "Presse-Prüfung Ergebnis", subject: "Ergebnis Ihrer kostenlosen Prüfung – {{order_id}}",
    body: "Hallo {{name}},\n\nwir haben Ihren Fall gemeinsam mit unserer Partnerkanzlei geprüft. Eine Auslistung des genannten Suchergebnisses kommt grundsätzlich in Frage.\n\nGerne erläutern wir Ihnen die nächsten Schritte und den individuellen Aufwand in einem kurzen Gespräch. Eine Erfolgsgarantie können wir – das wissen Sie – nicht geben, da die Entscheidung bei Google liegt.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "rechte", icon: "lock", tag: "Aktion · Rechte", name: "Rechte benötigt", subject: "Aktion erforderlich: Bearbeitungsrechte für {{profile}}",
    body: "Hallo {{name}},\n\num Ihr Profil löschen zu können, benötigen wir die Bearbeitungsrechte für Ihr Google-Unternehmensprofil „{{profile}}“.\n\nBitte fügen Sie dazu unsere Adresse helpdesk@rapid-remove.com als Administrator in Ihrem Google-Unternehmensprofil hinzu. Eine kurze Schritt-für-Schritt-Anleitung finden Sie hier: [Link]\n\nWir haben keinerlei Zugriff auf Ihr Google-Konto, Gmail oder Ihre Daten – nur auf das Profil selbst.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "adresse", icon: "mapPin", tag: "Aktion · Adresse", name: "Adresse hinterlegen", subject: "Bitte Rechnungsadresse bestätigen – {{order_id}}",
    body: "Hallo {{name}},\n\nfür die Rechnungsstellung benötigen wir noch Ihre vollständige Rechnungsadresse.\n\nBitte antworten Sie kurz mit: Firma, Straße & Hausnummer, PLZ & Ort sowie (falls vorhanden) Ihre UID-Nummer.\n\nVielen Dank!\nIhr RapidRemove-Team" },
  { id: "verify", icon: "shieldCheck", tag: "Aktion · Verifizierung", name: "Verifizieren", subject: "Kurze Verifizierung für {{order_id}}",
    body: "Hallo {{name}},\n\nzur Sicherheit bestätigen wir kurz, dass Sie berechtigt sind, die Löschung des Profils „{{profile}}“ zu beauftragen.\n\nBitte senden Sie uns eine kurze Bestätigung von Ihrer geschäftlichen E-Mail-Adresse oder einen Nachweis Ihrer Inhaberschaft (z. B. Gewerbeanmeldung). Das schützt Sie und uns gleichermaßen.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
  { id: "garantie", icon: "refresh", tag: "Aktion · Garantie", name: "Garantiefall", subject: "Ihr Garantiefall – wir entfernen das Profil erneut",
    body: "Hallo {{name}},\n\nIhr Profil „{{profile}}“ ist erneut bei Google aufgetaucht? Kein Problem – das ist Ihr Garantiefall.\n\nWir entfernen das Profil im Rahmen Ihres Schutzes selbstverständlich kostenlos erneut. Wir haben den Vorgang bereits eingeleitet und melden uns mit dem Status.\n\nHerzliche Grüße\nIhr RapidRemove-Team" },
];

const COMPANY = {
  name: "Simple Solution. OG", street: "Salzgasse 2", city: "5400 Hallein, Österreich",
  vat: "ATU72401536", email: "helpdesk@rapid-remove.com", iban: "AT00 0000 0000 0000 0000",
};

/* ---- Abos & Umsatz (Reputations-Schutz Abonnements über Stripe) ---- */
const SUBS = {
  mrr: 3140, arr: 37674, active: 134, trialing: 0, overdue: 4,
  monthRevenue: 2297, paidInvoices: 15, newCustomers: 4, churned: 1,
  reactivatable: 4,
};

/* Abo-Mix — Verteilung der aktiven Abonnements auf die Tarife */
const PLANS = [
  { label: "24,90 €/Mo", count: 51, mrr: 1270, cur: "EUR", color: "var(--primary)" },
  { label: "245,00 €/Mo", count: 30, mrr: 613, cur: "EUR", color: "#3b82f6" },
  { label: "24,90 $/Mo", count: 28, mrr: 697, cur: "USD", color: "#10b981" },
  { label: "245,00 $/Mo", count: 24, mrr: 490, cur: "USD", color: "#a855f7" },
  { label: "69,90 €/Mo", count: 1, mrr: 70, cur: "EUR", color: "#ec4899" },
];

/* Umsatz pro Tag (Monat bis heute, bezahlte Rechnungen) */
const DAILY_REV = [
  { d: "01.06.", v: 920 }, { d: "02.06.", v: 60 }, { d: "03.06.", v: 45 }, { d: "04.06.", v: 210 },
  { d: "05.06.", v: 90 }, { d: "06.06.", v: 330 }, { d: "07.06.", v: 180 }, { d: "08.06.", v: 462 },
];

const WEEKLY_REV = [
  { d: "17.03.", v: 1180 }, { d: "24.03.", v: 1240 }, { d: "31.03.", v: 1090 }, { d: "07.04.", v: 1320 },
  { d: "14.04.", v: 1410 }, { d: "21.04.", v: 1280 }, { d: "28.04.", v: 1520 }, { d: "05.05.", v: 1605 },
  { d: "12.05.", v: 1490 }, { d: "19.05.", v: 1710 }, { d: "26.05.", v: 1840 }, { d: "02.06.", v: 1297 },
];

const MONTHLY_REV = [
  { d: "Jul", v: 1980 }, { d: "Aug", v: 2110 }, { d: "Sep", v: 2040 }, { d: "Okt", v: 2260 },
  { d: "Nov", v: 2390 }, { d: "Dez", v: 2580 }, { d: "Jan", v: 2120 }, { d: "Feb", v: 2240 },
  { d: "Mär", v: 2410 }, { d: "Apr", v: 2530 }, { d: "Mai", v: 2470 }, { d: "Jun", v: 2297 },
];

/* Letzte Zahlungen (Stripe-Abrechnungen im Monat) */
const PAYMENTS = [
  { name: "Michael Karl-Heinz Flamm", date: "07.06.26", plan: "1 × Schutz", price: "24,90 € / Monat", amount: 25, cur: "EUR", status: "bezahlt" },
  { name: "Michael Karl-Heinz Flamm", date: "07.06.26", plan: "1 × Schutz", price: "24,90 € / Monat", amount: 25, cur: "EUR", status: "bezahlt" },
  { name: "Mr O Cox", date: "07.06.26", plan: "1 × Protection", price: "$24.90 / month", amount: 25, cur: "USD", status: "bezahlt" },
  { name: "Aasish Ponna", date: "06.06.26", plan: "1 × Protection", price: "$24.90 / month", amount: 25, cur: "USD", status: "bezahlt" },
  { name: "ALEXANDRE PURCHASE", date: "06.06.26", plan: "1 × Protection", price: "$24.90 / month", amount: 25, cur: "USD", status: "bezahlt" },
  { name: "AndreasFey", date: "06.06.26", plan: "1 × Schutz", price: "24,90 € / Monat", amount: 30, cur: "EUR", status: "bezahlt" },
  { name: "Bruidskleding Hannelore", date: "05.06.26", plan: "1 × Protection", price: "$24.90 / month", amount: 25, cur: "USD", status: "bezahlt" },
  { name: "Petrova Consulting Ltd", date: "05.06.26", plan: "1 × Protection", price: "$24.90 / month", amount: 25, cur: "USD", status: "offen" },
  { name: "Salon Schmidt", date: "04.06.26", plan: "1 × Schutz", price: "69,90 € / Monat", amount: 70, cur: "EUR", status: "bezahlt" },
  { name: "Clínica Gómez", date: "04.06.26", plan: "1 × Schutz", price: "24,90 € / Monat", amount: 25, cur: "EUR", status: "fehlgeschlagen" },
];


function money(amount, country) {
  const usd = country === "US";
  if (usd) return "$" + Number(amount).toLocaleString("en-US", { minimumFractionDigits: amount % 1 ? 2 : 0 });
  return Number(amount).toLocaleString("de-DE", { minimumFractionDigits: amount % 1 ? 2 : 0 }) + " €";
}


/* per-customer CRM extras (Asana, activity, payment history, files) */
function crmExtras(o) {
  const inv = "RE-" + o.id.replace("RR-", "");
  const asanaId = "12154" + o.id.replace(/\D/g, "").slice(-8);
  const subStatus = o.status === "done" ? ["done", "done", "done"] : o.status === "progress" ? ["done", "done", "open"] : ["done", "open", "open"];
  const asanaSubs = [
    { t: "Profil verifizieren", s: subStatus[0] },
    { t: "Löschantrag stellen", s: subStatus[1] },
    { t: "Erfolg bestätigen & abrechnen", s: subStatus[2] },
  ];
  const activity = [];
  if (o.status === "done") activity.push({ ic: "pay", t: "Zahlung erfasst", d: money(o.amount, o.country) + " über Stripe", time: o.created.split("·")[0] });
  if (o.status === "done") activity.push({ ic: "status", t: "Status → Profil gelöscht", d: "Erfolg bestätigt", time: o.created.split("·")[0] });
  if (o.pay === "failed") activity.push({ ic: "pay", t: "Zahlung fehlgeschlagen", d: "Karte abgelehnt — Link erneut senden", time: o.created.split("·")[0] });
  activity.push({ ic: "mail", t: "Bestellbestätigung gesendet", d: "an " + o.email, time: o.created.split("·")[0] });
  if (o.status !== "new") activity.push({ ic: "status", t: "Status → In Bearbeitung", d: "Asana-Task aktualisiert", time: o.created.split("·")[0] });
  activity.push({ ic: "note", t: "Bestellung eingegangen", d: o.id + " erstellt", time: o.created });
  const payHist = [];
  if (o.pay === "paid") payHist.push({ s: "ok", t: "Zahlung erfasst", amt: money(o.amount, o.country), meta: "Stripe · " + o.created.split("·")[0] });
  if (o.pay === "failed") payHist.push({ s: "fail", t: "Belastung abgelehnt", amt: money(o.amount, o.country), meta: "Stripe · Karte abgelehnt" });
  const files = [
    { n: "Screenshot_Profil.png", sz: "248 KB" },
    { n: inv + ".pdf", sz: "62 KB" },
  ];
  return { inv, asanaId, asanaSubs, activity, payHist, files };
}
/* Automatisierungen — was im Hintergrund ohne manuelles Zutun passiert.
   Wird im Admin neben automatischen Sends als anklickbares ⚡-Icon erklärt.
   `match` ordnet einen Aktivitäts-Eintrag (über den Titel) zu, `keys` ordnet
   die passenden Vorlagen-Buttons zu. */
const AUTOMATIONS = [
  { id: "neues-abo", keys: ["neues-abo"], match: /Schutz aktiviert|neues Abo|Protection Activated/i,
    title: "Schutz aktiviert (neues Abo)",
    trigger: "Sobald der Kunde ein Abo abschließt (Stripe: subscription.created).",
    how: "Der Kunde erhält automatisch die Mail „Schutz aktiviert“. Noch offene Schutzhinweis-Mails (Upsell-Serie) werden gestoppt." },
  { id: "zahlung", keys: ["zahlungsbestaetigung"], match: /Zahlung erfolgreich|Rechnung|Zahlungsbest/i,
    title: "Zahlung erfolgreich / Rechnung",
    trigger: "Nach erfolgreicher Zahlung (Stripe: invoice.paid).",
    how: "Der Kunde bekommt automatisch die Zahlungsbestätigung samt Rechnungs-PDF. Bei manuell erstellten Rechnungen geht zusätzlich eine Trustpilot-Bewertungseinladung als BCC raus." },
  { id: "schutzhinweis", keys: ["schutzhinweis"], match: /Schutzmodell|Hinweis zum Schutz/i,
    title: "Hinweis zum Schutzmodell (Upsell)",
    trigger: "Nach einer Einmal-Löschung ohne Abo (kein Reset-Auftrag, Betrag < 990 €).",
    how: "Automatische 3-teilige Serie über zwei Wochen (Tag 0, 7, 14). Schließt der Kunde zwischendurch ein Abo ab, stoppt die Serie automatisch." },
  { id: "abo-deaktiviert", keys: ["abo-deaktiviert"], match: /Schutz deaktiviert/i,
    title: "Schutz deaktiviert",
    trigger: "Wenn ein Abo wegen Zahlungsausfall endet — nicht bei einer Kündigung auf Kundenwunsch.",
    how: "Der Kunde wird automatisch informiert, dass der Schutz ausläuft." },
  { id: "bestellung", keys: ["auftragsbestaetigung"], match: /Bestellbestätigung|Bestellung eingegangen/i,
    title: "Bestellbestätigung",
    trigger: "Sobald eine neue Bestellung im Funnel eingeht.",
    how: "Der Kunde erhält automatisch die Bestellbestätigung per E-Mail." },
  { id: "storno", keys: ["storno", "kundenstorno", "rechtestorno", "scamstorno"], match: null,
    title: "Storno → Status „storniert“",
    trigger: "Beim Senden einer Storno-Mail aus diesem Bereich.",
    how: "Die Bestellung wird automatisch auf den Status „storniert“ gesetzt." },
  { id: "reaktivierung", keys: ["reaktivierung"], match: /reaktiviert|wieder aktiviert/i,
    title: "Reaktivierung → Auftrag aktiv",
    trigger: "Beim Senden der Mail „Auftrag wieder aktiviert“.",
    how: "Die Bestellung wird automatisch wieder aktiviert (Status zurück auf „In Bearbeitung“)." },
];

export { SERVICES, ORDERS, CHECKS, STATUS_FLOW, TEMPLATES, AUTOMATIONS, COMPANY, SUBS, PLANS, DAILY_REV, WEEKLY_REV, MONTHLY_REV, PAYMENTS, money, crmExtras };
