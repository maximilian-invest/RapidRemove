/* RapidRemove — flagship SEO article: metadata + FAQ (shared by the
   server route for <head>/JSON-LD and by the client article for rendering). */

export const SITE_URL = "https://www.rapid-remove.com";
// URL-Vereinheitlichung: JEDER Artikel liegt unter dem Magazin-Slug
// (/magazin/<slug> bzw. /<lang>/<magazineSlug>/<slug>).
export const ARTICLE_SLUG = "magazin/google-unternehmensprofil-loeschen";

export const ARTICLE_META = {
  slug: ARTICLE_SLUG,
  url: `${SITE_URL}/${ARTICLE_SLUG}`,
  category: "Google-Policy",
  title:
    "Google Unternehmensprofil löschen (My Business): Anleitung",
  h1: "Google-Unternehmensprofil löschen – wie geht das wirklich?",
  description:
    "Google Mein Unternehmen löschen: Was „dauerhaft geschlossen“ wirklich bewirkt, warum alle Bewertungen bleiben – und wie das Profil ganz verschwindet.",
  datePublished: "2026-05-12",
  dateModified: "2026-10-11",
  author: "Maximilian Hölzl",
  authorRole: "Gründer & Reputations-Experte, RapidRemove",
  authorImage: "/assets/maximilian-hoelzl.jpg",
  readingMin: 15,
  keywords: [
    "Google Unternehmensprofil löschen",
    "Google My Business löschen",
    "Mein Unternehmen löschen",
    "Google Unternehmensprofil entfernen",
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
    q: "Wie lösche ich mein Google-Unternehmensprofil dauerhaft?",
    a: "Im Unternehmensprofil über das Drei-Punkte-Menü → Einstellungen für das Unternehmensprofil → Unternehmensprofil entfernen → Profilinhalt und Administratoren entfernen. Damit endet Ihre Verwaltung dauerhaft, und Ihre Beiträge, Fotos und Antworten auf Rezensionen werden gelöscht – der öffentliche Eintrag und seine Bewertungen bleiben laut Google aber meist sichtbar. Um den Eintrag selbst zu löschen, muss er über Googles offizielle Entfernungsverfahren entfernt werden.",
  },
  {
    q: "Was passiert, wenn ich mein Google-Unternehmensprofil lösche?",
    a: "Sie verlieren den Zugriff, und Ihre Beiträge, Fotos und Antworten auf Rezensionen werden gelöscht. Der Eintrag selbst, seine Bewertungen und seine Daten bleiben meist in Google-Suche und Maps sichtbar – und jeder kann nun Änderungen daran vorschlagen.",
  },
  {
    q: "Kann ich mein Google-Unternehmensprofil löschen und neu anfangen?",
    a: "Nur, wenn das alte Profil vorher vollständig entfernt wurde. Ein neues Profil für dasselbe Unternehmen an derselben Adresse gilt sonst als Duplikat und wird meist mit dem alten zusammengeführt – samt Bewertungen – oder gesperrt.",
  },
  {
    q: "Wie entferne ich mein Unternehmen aus Google Maps?",
    a: "Jeder kann bei dem Ort in Google Maps „Änderung vorschlagen“ → „Schließen oder entfernen“ wählen. Google entscheidet selbst und behält bei echten Unternehmen meist den Eintrag oder markiert ihn nur als geschlossen. Eine vollständige Entfernung des Eintrags samt Bewertungen läuft über Googles offizielle Entfernungsverfahren.",
  },
  {
    q: "Warum sehe ich in meinem Unternehmensprofil keine Option zum Löschen?",
    a: "Meist, weil Sie Verwalter statt primärer Inhaber sind, erst seit weniger als 7 Tagen Inhaber sind, das Profil nicht unter Ihrem Konto verifiziert ist oder Sie mit einem anderen Google-Konto angemeldet sind.",
  },
  {
    q: "Ist „Google My Business“ dasselbe wie das Google-Unternehmensprofil?",
    a: "Ja. Google My Business (auf Deutsch „Google Mein Unternehmen“) ist der alte Name des Google-Unternehmensprofils. Ob Unternehmenskonto, Firmeneintrag, Google-Eintrag oder Profil – gemeint ist derselbe Eintrag. Wer „Mein Unternehmen löschen“ sucht, meint in aller Regel dieses Profil, nicht die Firma.",
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
