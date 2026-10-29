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

/* Checkbox 3 (nur Bewertungs-Bestellungen, 29.10.2026): „Bestellung auf eigenes Risiko" – Google kann Löschungen nachträglich
   rückgängig machen. Pflicht vor dem Bestell-Button (Website, Website-Chat, Kunden-Dashboard inkl. „Weitere Bewertung hinzufügen").
   RISK_V bei jeder inhaltlichen Textänderung hochzählen (Nachweis je Auftrag, ops/src/riskConsent.ts). */
export const RISK_V = "2026-10-29";
export const RISK_CONSENT = {
  de: { txt: "Mir ist bewusst, dass Google eine Löschung nachträglich rückgängig machen kann. Ob das passiert, entscheidet allein Google, RapidRemove hat darauf keinen Einfluss. Ich bestelle auf eigenes Risiko.", err: "Bitte bestätigen Sie, dass Sie auf eigenes Risiko bestellen." },
  en: { txt: "I understand that Google may reverse a removal at a later point. Whether this happens is solely Google's decision and RapidRemove has no influence over it. I am ordering at my own risk.", err: "Please confirm that you are ordering at your own risk." },
  es: { txt: "Soy consciente de que Google puede revertir una eliminación más adelante. Si esto ocurre lo decide únicamente Google y RapidRemove no tiene ninguna influencia sobre ello. Hago el pedido bajo mi propio riesgo.", err: "Confirma que haces el pedido bajo tu propio riesgo." },
  fr: { txt: "Je suis conscient(e) que Google peut annuler une suppression ultérieurement. C'est Google seul qui en décide, RapidRemove n'a aucune influence là-dessus. Je commande à mes propres risques.", err: "Veuillez confirmer que vous commandez à vos propres risques." },
  it: { txt: "Sono consapevole che Google può annullare una rimozione in un secondo momento. Se ciò accade lo decide esclusivamente Google e RapidRemove non ha alcuna influenza al riguardo. Ordino a mio rischio.", err: "Conferma che ordini a tuo rischio." },
  nl: { txt: "Ik ben mij ervan bewust dat Google een verwijdering later kan terugdraaien. Of dat gebeurt, beslist alleen Google; RapidRemove heeft daar geen invloed op. Ik bestel op eigen risico.", err: "Bevestig dat u op eigen risico bestelt." },
  pt: { txt: "Estou ciente de que a Google pode reverter uma remoção mais tarde. Se isso acontece é decidido exclusivamente pela Google e a RapidRemove não tem qualquer influência sobre isso. Faço a encomenda por minha conta e risco.", err: "Confirme que faz a encomenda por sua conta e risco." },
  ja: { txt: "Googleが削除を後から取り消す場合があることを理解しています。取り消すかどうかはGoogleのみが判断し、RapidRemoveはこれに影響を及ぼすことができません。自己責任で注文します。", err: "自己責任で注文することを確認してください。" },
  sv: { txt: "Jag är medveten om att Google i efterhand kan häva en borttagning. Om det sker avgör enbart Google och RapidRemove har inget inflytande över det. Jag beställer på egen risk.", err: "Bekräfta att du beställer på egen risk." },
  da: { txt: "Jeg er klar over, at Google senere kan omgøre en fjernelse. Om det sker, afgør Google alene, og RapidRemove har ingen indflydelse på det. Jeg bestiller på egen risiko.", err: "Bekræft, at du bestiller på egen risiko." },
  no: { txt: "Jeg er klar over at Google i ettertid kan omgjøre en fjerning. Om det skjer, avgjør Google alene, og RapidRemove har ingen innflytelse på det. Jeg bestiller på egen risiko.", err: "Bekreft at du bestiller på egen risiko." },
};
