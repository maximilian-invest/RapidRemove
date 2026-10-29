/* Einwilligungs-Texte im Bestellprozess (Website-Wizard, Dashboard-Neubestellung): AGB + Widerruf, vorzeitiger Leistungsbeginn (FAGG). */
export const AGB_CONSENT = {
  de: { pre: "Ich habe die ", agb: "AGB", mid: " und die ", wid: "Widerrufsbelehrung", post: " gelesen und akzeptiere sie.", err: "Bitte bestätigen Sie AGB und Widerrufsbelehrung." },
  en: { pre: "I have read and accept the ", agb: "Terms & Conditions", mid: " and the ", wid: "withdrawal policy", post: ".", err: "Please confirm the Terms and the withdrawal policy." },
  es: { pre: "He leído y acepto los ", agb: "Términos y Condiciones", mid: " y la ", wid: "información sobre desistimiento", post: ".", err: "Confirme los Términos y la información sobre desistimiento." },
  fr: { pre: "J'ai lu et j'accepte les ", agb: "CGV", mid: " et l'", wid: "information sur le droit de rétractation", post: ".", err: "Veuillez confirmer les CGV et l'information sur la rétractation." },
  it: { pre: "Ho letto e accetto i ", agb: "Termini e Condizioni", mid: " e l'", wid: "informativa sul recesso", post: ".", err: "Conferma i Termini e l'informativa sul recesso." },
  nl: { pre: "Ik heb de ", agb: "algemene voorwaarden", mid: " en de ", wid: "herroepingsinformatie", post: " gelezen en accepteer ze.", err: "Bevestig de voorwaarden en de herroepingsinformatie." },
  pt: { pre: "Li e aceito os ", agb: "Termos e Condições", mid: " e a ", wid: "informação sobre retratação", post: ".", err: "Confirme os Termos e a informação sobre retratação." },
  ja: { pre: "", agb: "利用規約（AGB）", mid: "と", wid: "撤回権に関する説明", post: "を読み、同意します。", err: "利用規約と撤回権に関する説明に同意してください。" },
  sv: { pre: "Jag har läst och godkänner ", agb: "villkoren (AGB)", mid: " och ", wid: "ångerrättsinformationen", post: ".", err: "Bekräfta villkoren och ångerrättsinformationen." },
  da: { pre: "Jeg har læst og accepterer ", agb: "vilkårene (AGB)", mid: " og ", wid: "fortrydelsesoplysningerne", post: ".", err: "Bekræft vilkårene og fortrydelsesoplysningerne." },
  no: { pre: "Jeg har lest og godtar ", agb: "vilkårene (AGB)", mid: " og ", wid: "angrerettsinformasjonen", post: ".", err: "Bekreft vilkårene og angrerettsinformasjonen." },
};
/* Checkbox 2 (§ 18 Abs 1 Z 1 FAGG): ausdrückliches Verlangen auf vorzeitigen Leistungsbeginn
   + Kenntnisnahme, dass das Widerrufsrecht bei vollständiger Erfüllung erlischt. */
export const FAGG_CONSENT = {
  de: { txt: "Ich verlange ausdrücklich, dass RapidRemove vor Ablauf der Widerrufsfrist mit der Dienstleistung beginnt. Mir ist bekannt, dass ich mein Widerrufsrecht verliere, sobald die Dienstleistung vollständig erbracht ist.", err: "Bitte bestätigen Sie den vorzeitigen Leistungsbeginn." },
  en: { txt: "I expressly request that RapidRemove begin the service before the withdrawal period expires. I am aware that I lose my right of withdrawal once the service has been performed in full.", err: "Please confirm the early start of the service." },
  es: { txt: "Solicito expresamente que RapidRemove comience la prestación del servicio antes de que expire el plazo de desistimiento. Soy consciente de que pierdo mi derecho de desistimiento una vez que el servicio se haya prestado por completo.", err: "Confirme el inicio anticipado del servicio." },
  fr: { txt: "Je demande expressément que RapidRemove commence la prestation avant l'expiration du délai de rétractation. Je reconnais perdre mon droit de rétractation dès que la prestation aura été entièrement exécutée.", err: "Veuillez confirmer le début anticipé de la prestation." },
  it: { txt: "Chiedo espressamente che RapidRemove inizi la prestazione del servizio prima della scadenza del termine di recesso. Sono consapevole che perderò il diritto di recesso una volta che il servizio sarà stato eseguito integralmente.", err: "Conferma l'inizio anticipato del servizio." },
  nl: { txt: "Ik verzoek uitdrukkelijk dat RapidRemove vóór het verstrijken van de herroepingstermijn met de dienst begint. Ik ben mij ervan bewust dat ik mijn herroepingsrecht verlies zodra de dienst volledig is uitgevoerd.", err: "Bevestig de vervroegde start van de dienst." },
  pt: { txt: "Solicito expressamente que a RapidRemove inicie o serviço antes do termo do prazo de retratação. Estou ciente de que perco o meu direito de retratação assim que o serviço estiver integralmente prestado.", err: "Confirme o início antecipado do serviço." },
  ja: { txt: "撤回期間の満了前にRapidRemoveがサービスの提供を開始することを明示的に求めます。サービスが完全に履行された時点で撤回権を失うことを了承しています。", err: "サービスの早期開始に同意してください。" },
  sv: { txt: "Jag begär uttryckligen att RapidRemove påbörjar tjänsten innan ångerfristen löper ut. Jag är medveten om att jag förlorar min ångerrätt när tjänsten har fullgjorts helt.", err: "Bekräfta den förtida starten av tjänsten." },
  da: { txt: "Jeg anmoder udtrykkeligt om, at RapidRemove påbegynder tjenesten, inden fortrydelsesfristen udløber. Jeg er bekendt med, at jeg mister min fortrydelsesret, så snart tjenesten er fuldt udført.", err: "Bekræft den tidlige start af tjenesten." },
  no: { txt: "Jeg ber uttrykkelig om at RapidRemove starter tjenesten før angrefristen utløper. Jeg er innforstått med at jeg mister angreretten min så snart tjenesten er fullt utført.", err: "Bekreft tidlig oppstart av tjenesten." },
};

/* Checkbox 3 (nur Bewertungs-Aufträge): Risikohinweis – Google kann entfernte Bewertungen nach Einspruch des Verfassers wieder anzeigen.
   Kein kostenloser erneuter Löschversuch, keine Erstattung. Pflichtfeld bei Website-Bestellung und Dashboard-Nachbestellung. */
export const RISK_CONSENT_VERSION = "2026-10-29";
export const RISK_CONSENT = {
  de: {
    pre: "Ich verstehe, dass ich auf eigenes Risiko bestelle: Google kann eine gelöschte Bewertung jederzeit wieder anzeigen. RapidRemove hat darauf keinen Einfluss; eine wiederhergestellte Bewertung wird nicht kostenlos erneut gelöscht oder erstattet (",
    link: "§ 7.5 AGB",
    post: ").",
    err: "Bitte bestätigen Sie den Risikohinweis.",
  },
  en: {
    pre: "I understand that I am ordering at my own risk: Google may restore a removed review at any time. RapidRemove has no influence on this, and a restored review is not removed again for free or refunded (",
    link: "§ 7.5 T&C",
    post: ").",
    err: "Please confirm the risk notice.",
  },
  es: {
    pre: "Entiendo que estoy haciendo el pedido bajo mi propia responsabilidad: Google puede volver a mostrar una reseña eliminada en cualquier momento. RapidRemove no tiene influencia sobre esto; una reseña restaurada no se elimina de nuevo de forma gratuita ni se reembolsa (",
    link: "§ 7.5 T&C",
    post: ").",
    err: "Por favor, confirme el aviso de riesgo.",
  },
  fr: {
    pre: "Je comprends que je commande à mes propres risques : Google peut réafficher un avis supprimé à tout moment. RapidRemove n'a aucune influence là-dessus ; un avis restauré n'est pas supprimé à nouveau gratuitement ni remboursé (",
    link: "§ 7.5 CGV",
    post: ").",
    err: "Veuillez confirmer l'avis de risque.",
  },
  it: {
    pre: "Capisco che sto ordinando a mio rischio: Google può ripristinare una recensione rimossa in qualsiasi momento. RapidRemove non ha alcuna influenza su questo; una recensione ripristinata non viene rimossa nuovamente gratuitamente né rimborsata (",
    link: "§ 7.5 T&C",
    post: ").",
    err: "Si prega di confermare l'avviso di rischio.",
  },
  nl: {
    pre: "Ik begrijp dat ik op eigen risico bestel: Google kan een verwijderde review op elk moment opnieuw tonen. RapidRemove heeft hierop geen invloed; een herstelde review wordt niet gratis opnieuw verwijderd of terugbetaald (",
    link: "§ 7.5 AV",
    post: ").",
    err: "Bevestig de risico-aanwijzing.",
  },
  pt: {
    pre: "Compreendo que estou a encomendar por minha conta e risco: a Google pode restaurar uma avaliação removida a qualquer momento. A RapidRemove não tem qualquer influência sobre isso; uma avaliação restaurada não é removida novamente de forma gratuita nem reembolsada (",
    link: "§ 7.5 T&C",
    post: ").",
    err: "Por favor, confirme o aviso de risco.",
  },
  ja: {
    pre: "私は自己責任で注文することを理解しています：Googleは削除された口コミをいつでも復元する可能性があります。RapidRemoveはこれに影響を与えることができず、復元された口コミは無料で再度削除されたり、返金されたりしません（",
    link: "§ 7.5 利用規約",
    post: "）。",
    err: "リスクに関する注意事項を確認してください。",
  },
  sv: {
    pre: "Jag förstår att jag beställer på egen risk: Google kan återställa ett borttaget omdöme när som helst. RapidRemove har ingen påverkan på detta; ett återställt omdöme tas inte bort igen gratis eller återbetalas (",
    link: "§ 7.5 AGB",
    post: ").",
    err: "Vänligen bekräfta riskmeddelandet.",
  },
  da: {
    pre: "Jeg forstår, at jeg bestiller på egen risiko: Google kan gendanne en fjernet anmeldelse når som helst. RapidRemove har ingen indflydelse på dette; en gendannet anmeldelse fjernes ikke igen gratis eller refunderes (",
    link: "§ 7.5 AGB",
    post: ").",
    err: "Bekræft venligst risikooplysningen.",
  },
  no: {
    pre: "Jeg forstår at jeg bestiller på egen risiko: Google kan gjenopprette en fjernet omtale når som helst. RapidRemove har ingen innflytelse på dette; en gjenopprettet omtale fjernes ikke på nytt gratis eller refunderes (",
    link: "§ 7.5 AGB",
    post: ").",
    err: "Bekreft risikoinformasjonen.",
  },
};
