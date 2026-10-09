/* Pflicht-Checkboxen im Bestellprozess (Website-Wizard + „Neuer Auftrag" im Kunden-Dashboard) und Hinweis bei Doppelbestellung.
   Aus Wizard.jsx herausgelöst, damit das Dashboard nicht den ganzen Wizard laden muss. */
/* Hinweis „Bewertung bereits beauftragt" (Doppelbestellung derselben Bewertung). */
export const DUP_TXT = {
  en: { t: "You've already ordered this review", p: (o) => `We're already working on it in your order ${o} – no need to order it again.`, l: "Open my dashboard" },
  de: { t: "Diese Bewertung wurde bereits beauftragt", p: (o) => `Wir bearbeiten sie schon in Ihrem Auftrag ${o} – eine zweite Bestellung ist nicht nötig.`, l: "Zum Dashboard" },
  es: { t: "Ya has encargado esta reseña", p: (o) => `Ya estamos trabajando en ella en tu pedido ${o}; no hace falta volver a pedirla.`, l: "Abrir mi panel" },
  fr: { t: "Tu as déjà commandé cet avis", p: (o) => `Nous y travaillons déjà dans ta commande ${o} – inutile de la recommander.`, l: "Ouvrir mon tableau de bord" },
  it: { t: "Hai già ordinato questa recensione", p: (o) => `Ci stiamo già lavorando nel tuo ordine ${o}: non serve ordinarla di nuovo.`, l: "Apri la dashboard" },
  nl: { t: "U heeft deze review al besteld", p: (o) => `We werken er al aan in uw bestelling ${o} – opnieuw bestellen is niet nodig.`, l: "Mijn dashboard openen" },
  pt: { t: "Já encomendaste esta avaliação", p: (o) => `Já estamos a tratar dela na tua encomenda ${o} – não é preciso encomendar outra vez.`, l: "Abrir o meu painel" },
  ja: { t: "この口コミはすでにご注文済みです", p: (o) => `ご注文 ${o} で対応中です。再度ご注文いただく必要はありません。`, l: "ダッシュボードを開く" },
  sv: { t: "Du har redan beställt det här omdömet", p: (o) => `Vi arbetar redan med det i din beställning ${o} – du behöver inte beställa igen.`, l: "Öppna min dashboard" },
  da: { t: "Du har allerede bestilt denne anmeldelse", p: (o) => `Vi arbejder allerede på den i din ordre ${o} – du behøver ikke bestille igen.`, l: "Åbn mit dashboard" },
  no: { t: "Du har allerede bestilt denne omtalen", p: (o) => `Vi jobber allerede med den i bestillingen din ${o} – du trenger ikke bestille på nytt.`, l: "Åpne dashbordet mitt" },
};
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
