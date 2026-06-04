/* RapidRemove — flagship SEO article: metadata + FAQ (shared by the
   server route for <head>/JSON-LD and by the client article for rendering). */

export const SITE_URL = "https://rapid-remove.com";
export const ARTICLE_SLUG = "magazin/google-unternehmensprofil-loeschen";

export const ARTICLE_META = {
  slug: ARTICLE_SLUG,
  url: `${SITE_URL}/${ARTICLE_SLUG}`,
  category: "Google-Policy",
  title:
    "Google-Unternehmensprofil löschen: Anleitung 2026 (so geht's wirklich)",
  h1: "Google-Unternehmensprofil löschen – wie geht das wirklich?",
  description:
    "Google lässt Sie Ihr Unternehmensprofil nicht einfach löschen. Diese Anleitung zeigt Schritt für Schritt, welche Wege es 2026 wirklich gibt, warum „dauerhaft geschlossen“ keine Löschung ist – und wie Sie das Profil samt aller Bewertungen dauerhaft und legal entfernen.",
  datePublished: "2026-05-12",
  dateModified: "2026-06-04",
  author: "Maximilian Hölzl",
  authorRole: "Gründer & Reputations-Experte, RapidRemove",
  authorImage: "/assets/maximilian-hoelzl.jpg",
  readingMin: 11,
  keywords: [
    "Google Unternehmensprofil löschen",
    "Google My Business löschen",
    "Google Maps Eintrag löschen",
    "Google Business Profile entfernen",
    "Unternehmensprofil bei Google löschen",
    "Google Bewertungen löschen lassen",
    "Google Eintrag dauerhaft löschen",
  ],
};

/* FAQ — rendered as an accordion AND emitted as FAQPage structured data. */
export const FAQ = [
  {
    q: "Kann ich mein Google-Unternehmensprofil selbst löschen?",
    a: "Nur eingeschränkt. Google bietet keinen einfachen „Profil löschen“-Knopf. Sie können die Inhaberschaft beantragen und das Profil als „dauerhaft geschlossen“ markieren – der Eintrag samt aller Bewertungen bleibt dann aber weiterhin öffentlich sichtbar. Eine vollständige, dauerhafte Entfernung über das Standard-Interface ist für Unternehmer praktisch nicht vorgesehen.",
  },
  {
    q: "Was ist der Unterschied zwischen „dauerhaft geschlossen“ und „gelöscht“?",
    a: "„Dauerhaft geschlossen“ ist nur ein Status. Das Profil bleibt in der Google-Suche und auf Google Maps sichtbar, inklusive Name, Adresse und allen Bewertungen – versehen mit dem Hinweis „Dauerhaft geschlossen“. Eine echte Löschung entfernt den Eintrag und alle Bewertungen vollständig aus der Anzeige.",
  },
  {
    q: "Ist es legal, ein Google-Unternehmensprofil löschen zu lassen?",
    a: "Ja. Die Entfernung erfolgt über die offiziellen, von Google vorgesehenen Verfahren und wurde juristisch geprüft. Es wird kein unbefugter Zugriff verschafft und nichts umgangen. Ihr Google-Konto, Gmail und etwaige Ads-Konten bleiben vollständig unberührt.",
  },
  {
    q: "Werden auch alle Bewertungen entfernt?",
    a: "Ja. Wird das gesamte Unternehmensprofil entfernt, verschwinden alle damit verknüpften Bewertungen auf einen Schlag – auch Fake- und Rachebewertungen. Das ist der entscheidende Vorteil gegenüber dem mühsamen Melden einzelner Bewertungen.",
  },
  {
    q: "Wie lange dauert die Löschung?",
    a: "In der Regel ist das Profil innerhalb von rund 24 Stunden entfernt. Den genauen Status verfolgen Sie jederzeit im Kundenportal.",
  },
  {
    q: "Beeinflusst die Löschung mein SEO, meine Website oder Google Ads?",
    a: "Nein. Entfernt wird ausschließlich das Unternehmensprofil (Google Maps / Google Unternehmensprofil). Ihre Website, Ihr Ranking in der organischen Suche und Ihre Werbekampagnen bleiben unverändert.",
  },
  {
    q: "Was kostet es, ein Google-Unternehmensprofil löschen zu lassen?",
    a: "Bei RapidRemove gilt ein transparenter Fixpreis ab 450 € – und Sie zahlen ausschließlich nach erfolgreicher Löschung (No Cure, No Pay). Ein Anwalt kostet dagegen oft 300 € und mehr pro Stunde, ohne Erfolgsgarantie.",
  },
  {
    q: "Kann das Profil danach wieder auftauchen?",
    a: "Dritte können theoretisch ein neues Profil anlegen. Mit dem optionalen Schutz überwachen wir Ihren Eintrag und entfernen ein erneut auftauchendes Profil im Schutzzeitraum kostenlos wieder.",
  },
];
