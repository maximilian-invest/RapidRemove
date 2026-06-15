/* Gemeinsame Definition des Bestell-Fragebogens.
   Genutzt von der Funnel-Danke-Seite, der öffentlichen Ausfüll-Seite und dem Admin.
   `t` = Frage je Sprache; `short` = deutsches Kurzlabel (Admin ist immer DE). */
export const FORM_QUESTIONS = [
  {
    key: "verified", short: "Verifizierter Inhaber",
    t: {
      de: "Sind Sie verifizierter Inhaber Ihres Google-Unternehmensprofils?",
      en: "Are you the verified owner of your Google Business Profile?",
      es: "¿Es usted el propietario verificado de su perfil de empresa de Google?",
      fr: "Êtes-vous le propriétaire vérifié de votre fiche d'établissement Google ?",
      it: "Sei il proprietario verificato del tuo profilo dell'attività su Google?",
      nl: "Bent u de geverifieerde eigenaar van uw Google-bedrijfsprofiel?",
      pt: "Você é o proprietário verificado do seu Perfil da Empresa no Google?",
      ja: "ご自身がGoogleビジネスプロフィールの確認済みオーナーですか？",
      sv: "Är du den verifierade ägaren av din Google Företagsprofil?",
      da: "Er du den verificerede ejer af din Google Virksomhedsprofil?",
      no: "Er du den verifiserte eieren av din Google bedriftsprofil?",
    },
  },
  {
    key: "smsOk", short: "Telefon empfängt SMS",
    t: {
      de: "Ist die in Ihrem Profil eingetragene Telefonnummer korrekt und kann Textnachrichten (SMS) empfangen?",
      en: "Is the phone number listed in your profile correct and able to receive text messages (SMS)?",
      es: "¿El número de teléfono que figura en su perfil es correcto y puede recibir mensajes de texto (SMS)?",
      fr: "Le numéro de téléphone indiqué sur votre fiche est-il correct et peut-il recevoir des SMS ?",
      it: "Il numero di telefono indicato nel tuo profilo è corretto e può ricevere messaggi (SMS)?",
      nl: "Is het telefoonnummer in uw profiel correct en kan het sms-berichten ontvangen?",
      pt: "O número de telefone no seu perfil está correto e pode receber mensagens de texto (SMS)?",
      ja: "プロフィールに登録された電話番号は正しく、テキストメッセージ（SMS）を受信できますか？",
      sv: "Är telefonnumret i din profil korrekt och kan ta emot textmeddelanden (SMS)?",
      da: "Er telefonnummeret i din profil korrekt og kan modtage tekstbeskeder (SMS)?",
      no: "Er telefonnummeret i profilen din korrekt og kan motta tekstmeldinger (SMS)?",
    },
  },
  {
    key: "payment48", short: "Zahlung sonst Wiederanzeige",
    t: {
      de: "Ihnen ist bewusst, dass Ihr Unternehmen bei nicht fristgerechter Zahlung wieder auf Google angezeigt wird?",
      en: "You are aware that your business will be shown on Google again if payment is not made on time?",
      es: "¿Es consciente de que su empresa volverá a aparecer en Google si el pago no se realiza a tiempo?",
      fr: "Vous êtes conscient que votre établissement réapparaîtra sur Google en cas de paiement hors délai ?",
      it: "Sei consapevole che la tua attività verrà nuovamente mostrata su Google in caso di pagamento non puntuale?",
      nl: "Bent u zich ervan bewust dat uw bedrijf weer op Google wordt getoond als de betaling niet op tijd plaatsvindt?",
      pt: "Tem consciência de que a sua empresa voltará a aparecer no Google se o pagamento não for efetuado a tempo?",
      ja: "期限内にお支払いがない場合、貴社が再びGoogleに表示されることをご了承いただいていますか？",
      sv: "Är du medveten om att ditt företag visas på Google igen om betalningen inte sker i tid?",
      da: "Er du klar over, at din virksomhed vises på Google igen, hvis betalingen ikke sker rettidigt?",
      no: "Er du klar over at virksomheten din vises på Google igjen hvis betalingen ikke skjer i tide?",
    },
  },
];
