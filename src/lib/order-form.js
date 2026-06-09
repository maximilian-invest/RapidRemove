/* Gemeinsame Definition des Bestell-Fragebogens.
   Genutzt von der Funnel-Danke-Seite, der öffentlichen Ausfüll-Seite und dem Admin. */
export const FORM_QUESTIONS = [
  {
    key: "verified",
    short: "Verifizierter Inhaber",
    de: "Sind Sie verifizierter Inhaber Ihres Google-Unternehmensprofils?",
    en: "Are you the verified owner of your Google Business Profile?",
  },
  {
    key: "smsOk",
    short: "Telefon empfängt SMS",
    de: "Ist die in Ihrem Profil eingetragene Telefonnummer korrekt und kann Textnachrichten (SMS) empfangen?",
    en: "Is the phone number listed in your profile correct and able to receive text messages (SMS)?",
  },
  {
    key: "nameChange",
    short: "Namensänderung ok",
    de: "Sind Sie einverstanden, wenn sich der sichtbare Name Ihres Unternehmensprofils kurzfristig ändert? (kann manchmal für eine Löschung notwendig sein)",
    en: "Do you agree if the visible name of your business profile changes temporarily? (sometimes necessary for a removal)",
  },
  {
    key: "owner",
    short: "Berechtigt / Inhaber",
    de: "Sind Sie der rechtmäßige Inhaber des Unternehmens oder wurden Sie von Ihrem Vorgesetzten beauftragt, die Löschung in Auftrag zu geben?",
    en: "Are you the rightful owner of the business, or were you authorized by your superior to order the removal?",
  },
  {
    key: "payment48",
    short: "48-Std-Zahlung bewusst",
    de: "Ist Ihnen bewusst, dass nach der Löschung eine Zahlung innerhalb von 48 Stunden erfolgen muss, da das Unternehmen ansonsten automatisch wieder online gestellt wird?",
    en: "Are you aware that after removal, payment must be made within 48 hours, otherwise the business is automatically restored online?",
  },
];
