"use client";
import React from "react";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { money, profileFor } from "@/lib/pricing";
import { searchProfiles, placesEnabled, manualCandidate } from "@/lib/places";
import { submitOrder, submitCheck } from "@/lib/order";
import { TrustpilotLive, PressBand } from "@/components/Proof";
import { PressSerpDemo } from "@/components/SerpDemo";
import OrderForm from "@/components/OrderForm";
import { mountIngestionAnim } from "@/lib/ingestion-anim";
import { pagePath } from "@/lib/page-routes";

/* ---- mandatory privacy / terms consent label, per locale ---- */
/* Checkbox 1: AGB + Widerrufsbelehrung gelesen & akzeptiert (zwei Links: /agb + /widerruf).
   Die verlinkten Texte sind die deutsche Fassung (Vertragssprache Deutsch, Punkt 12.3 AGB);
   lokalisierte Fassungen folgen nach anwaltlicher Freigabe. */
const AGB_CONSENT = {
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
const FAGG_CONSENT = {
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
/* ---- numeric helpers ---- */
const num = (v) => parseFloat(String(v).replace(/\s/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")) || 0;
function fmtMoney(lang, n) {
  const p = profileFor(lang);
  const loc = lang === "en" ? "en-US" : "de-DE";
  const s = Number.isInteger(n) ? n.toLocaleString(loc) : n.toLocaleString(loc, { minimumFractionDigits: 2 });
  return p.suffix ? `${s} ${p.sym}` : `${p.sym}${s}`;
}

/* ---- conversion copy (de + en, fallback en). Self-contained so locale files stay untouched ---- */
const CONV = {
  de: {
    rating: "4,9", reviewsN: "260+ Bewertungen", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "Profile gelöscht", successRate: "98 % Erfolgsquote",
    avgTime: "Ø 24 h", liveNow: "gerade aktiv",
    activityPre: "Gerade gelöscht",
    ago: (m) => `vor ${m} Min.`,
    activity: [
      { biz: "Zahnarztpraxis", city: "München", min: 2 },
      { biz: "Friseursalon", city: "Hamburg", min: 6 },
      { biz: "Restaurant", city: "Köln", min: 11 },
      { biz: "Autohaus", city: "Berlin", min: 14 },
      { biz: "Fitnessstudio", city: "Wien", min: 19 },
      { biz: "Hotel", city: "Stuttgart", min: 24 },
      { biz: "Kosmetikstudio", city: "Frankfurt", min: 29 },
      { biz: "Handwerksbetrieb", city: "Zürich", min: 33 },
    ],
    quotes: [
      { q: "Wir kämpften seit Jahren mit dem Google-Profil. Dank RapidRemove und dem freundlichen Service war es innerhalb von einem Tag gelöscht.", a: "Martin K.", r: "Praxisinhaber, München" },
      { q: "Endlich wieder ruhig schlafen. Die haben mir das komplett abgenommen.", a: "Sabine R.", r: "Restaurantbesitzerin, Köln" },
      { q: "Schnell, diskret, professionell — und Zahlung wirklich erst nach Erfolg.", a: "Tobias W.", r: "Geschäftsführer, Berlin" },
    ],
    expEyebrow: "Schneller fertig?",
    expTitle: "Express-Löschung",
    expDesc: "Ihr Fall springt an den Anfang der Warteschlange — Bearbeitung in ~6 Stunden statt ~24 Stunden.",
    expGuarantee: "Schaffen wir die 6 Stunden nicht, entfällt der Express-Aufpreis automatisch. Null Risiko.",
    expSlots: (n) => `Heute noch ${n} Express-Slots frei`,
    expAdd: "Express dazubuchen", expOn: "Express aktiv",
    protEyebrow: "Empfohlen — fast alle behalten ihn",
    protH: "Schutz vor erneuter Eintragung",
    protSub: "Dritte — oft Mitbewerber — können Ihr Profil jederzeit wieder bei Google eintragen. Auch Google selbst trägt Profile durch Website-Einträge oder Nutzerdaten neu ein. Mit Schutz entfernen wir es dauerhaft kostenlos erneut.",
    tierMonthlyLabel: "Monatlich", tierMonitorLabel: "Automatische Überwachung", tierLifetimeLabel: "Lebenslang",
    tierMonthlyDesc: "Wir überwachen monatlich und entfernen erneute Einträge kostenlos.",
    tierMonitorDesc: "Tägliche Überwachung, sofortige Entfernung & Monats-Report. Maximale Sicherheit.",
    tierLifetimeDesc: "Einmal zahlen, nie wieder Sorgen — dauerhafter Schutz ohne laufende Kosten.",
    tierMonitorBadge: "Beliebteste", tierLifetimeBadge: "Best Value", protPopularBadge: "Von 90 % der Kunden gewählt",
    lifetimeMath: "Günstiger als 4 Jahre Monatsschutz — danach nie wieder zahlen.",
    monitorMath: "Für alle, die ganz sichergehen wollen.",
    expTimeOn: "Gelöscht in ~6 Std.", expTimeOff: "In ~6 Std. statt ~24 Std.",
    protSectionLabel: "Schutz vor erneuter Eintragung",
    protLead: "Dritte – oft Mitbewerber – können Ihr Profil jederzeit wieder eintragen. Mit Schutz entfernen wir es kostenlos erneut.",
    protMonthlyName: "Monatlicher Schutz", protMonthlyShort: "Keine laufende Überwachung – Sie melden uns einen erneuten Eintrag, wir entfernen ihn gratis.",
    protMonitorName: "Automatische Überwachung", protMonitorShort: "Tägl. Überwachung & Sofort-Entfernung.",
    protLifetimeName: "Lebenslanger Schutz", protLifetimeShort: "Einmal zahlen, nie wieder Sorgen — dauerhaft.", protNoneName: "Kein Schutz", protNoneDesc: "Kann auch später gewählt werden.", checkingH: "Profil wird geprüft …", checkSteps: ["Profil gefunden", "Bewertungen analysiert", "Löschbarkeit bestätigt"], protOffContinue: "Ohne Schutz fortfahren", delOk: "Profil kann gelöscht werden", expertCta: "Sprechen Sie mit den Google-Experten", mostChosen: "Meistgewählt",
    protToggleOn: "Aktiviert", protToggleOff: "Deaktiviert",
    protOffTitle: "Ungeschützt – das ist riskant",
    protOffBody: "Ohne Schutz entfernen wir ein erneut eingetragenes Profil NICHT kostenlos. Dritte – oft Mitbewerber – tragen es erfahrungsgemäß häufig wieder ein. Das Risiko tragen dann Sie allein.",
    protOffAck: "Risiko verstanden – ohne Schutz fortfahren", protOffAcked: "Ohne Schutz bestätigt",
    perMonthShort: "/ Mon.", onceShort: "einmalig", perMonthAffix: "mtl.", perMonthPre: true, cancelAnytime: "Jederzeit kündbar",
    keepProt: "9 von 10 Kunden behalten den Schutz",
    noProtLink: "Ich brauche keinen Schutz",
    noProtTitle: "Kein Schutz gewählt",
    noProtBody: "Ohne Schutz entfernen wir ein erneut eingetragenes Profil nicht kostenlos. Das passiert leider häufig.",
    addProtBack: "Schutz doch hinzufügen",
    sumExpress: "Express-Löschung (~6 h)", sumAfter: "danach",
    lastChanceTitle: "Letzte Chance: Express dazubuchen",
    lastChanceDesc: "Profil in ~6 h statt ~24 h gelöscht — kein Aufpreis, falls wir die 6 h verfehlen.",
    afterSuccess: "Alles erst nach Erfolg fällig.",
    protStepLabel: "Schutz · Schritt 5", subtotal: "Zwischensumme",
    toProtect: "Weiter", toCheckout: "Weiter",
    totalAfter: "Gesamt nach Erfolg",
    doneCrossH: "Noch mehr für Ihren Ruf?",
    doneCrossSub: "Optional, jederzeit — unsere Ergänzungen rund um Ihre Online-Reputation.",
    xsOrmTitle: "Reputation verbessern", xsOrmDesc: "Negative Ergebnisse aus Google verdrängen lassen.", xsOrmPrice: "Auf Anfrage",
    xsPressTitle: "Presseartikel auslisten", xsPressDesc: "Unerwünschte Artikel aus den Suchergebnissen entfernen.", xsPressPrice: "Auf Anfrage",
    asideBadges: ["DSGVO-konform", "Server in der EU"],
  },
  en: {
    rating: "4.9", reviewsN: "260+ reviews", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profiles removed", successRate: "98% success rate",
    avgTime: "avg. 24 h", liveNow: "active now",
    activityPre: "Just removed",
    ago: (m) => `${m} min ago`,
    activity: [
      { biz: "Dental practice", city: "Munich", min: 2 },
      { biz: "Hair salon", city: "Hamburg", min: 6 },
      { biz: "Restaurant", city: "Cologne", min: 11 },
      { biz: "Car dealership", city: "Berlin", min: 14 },
      { biz: "Gym", city: "Vienna", min: 19 },
      { biz: "Hotel", city: "Stuttgart", min: 24 },
      { biz: "Beauty studio", city: "Frankfurt", min: 29 },
      { biz: "Trades business", city: "Zurich", min: 33 },
    ],
    quotes: [
      { q: "We struggled for years with the Google profile. Thanks to RapidRemove and the friendly service it was deleted within a single day.", a: "Martin K.", r: "Practice owner, Munich" },
      { q: "Finally sleeping well again. They took the whole thing off my hands.", a: "Sabine R.", r: "Restaurant owner, Cologne" },
      { q: "Fast, discreet, professional — and you really pay only after success.", a: "Tobias W.", r: "Managing director, Berlin" },
    ],
    expEyebrow: "Want it faster?",
    expTitle: "Express removal",
    expDesc: "Your case jumps to the front of the queue — handled in ~6 hours instead of ~24.",
    expGuarantee: "If we miss the 6 hours, the express surcharge is waived automatically. Zero risk.",
    expSlots: (n) => `${n} express slots left today`,
    expAdd: "Add express", expOn: "Express active",
    protEyebrow: "Recommended — almost everyone keeps it",
    protH: "Protection against re-listing",
    protSub: "Third parties — often competitors — can re-list your profile on Google anytime. Even Google itself re-lists profiles via website entries or user data. With protection we remove it again for free, permanently.",
    tierMonthlyLabel: "Monthly", tierMonitorLabel: "Automatic monitoring", tierLifetimeLabel: "Lifetime",
    tierMonthlyDesc: "We monitor monthly and remove any re-listings for free.",
    tierMonitorDesc: "Daily monitoring, instant removal & monthly report. Maximum safety.",
    tierLifetimeDesc: "Pay once, never worry again — permanent protection with no recurring cost.",
    tierMonitorBadge: "Most popular", tierLifetimeBadge: "Best value", protPopularBadge: "Chosen by 90% of customers",
    lifetimeMath: "Cheaper than 4 years of monthly protection — then never pay again.",
    monitorMath: "For those who want to be completely safe.",
    expTimeOn: "Removed in ~6 h", expTimeOff: "In ~6 h instead of ~24 h",
    protSectionLabel: "Protection against re-listing",
    protLead: "Third parties — often competitors — can re-list your profile anytime. With protection we remove it again for free.",
    protMonthlyName: "Monthly protection", protMonthlyShort: "No active monitoring — you report a re-listing and we remove it for free.",
    protMonitorName: "Automatic monitoring", protMonitorShort: "Daily monitoring & instant removal.",
    protLifetimeName: "Lifetime protection", protLifetimeShort: "Pay once, never worry again — permanent.", protNoneName: "No protection", protNoneDesc: "Can also be added later.", checkingH: "Checking profile …", checkSteps: ["Profile found", "Reviews analyzed", "Removability confirmed"], protOffContinue: "Continue without protection", delOk: "Profile can be removed", expertCta: "Talk to the Google experts", mostChosen: "Most chosen",
    protToggleOn: "On", protToggleOff: "Off",
    protOffTitle: "Unprotected — this is risky",
    protOffBody: "Without protection we will NOT remove a re-listed profile for free. Third parties — often competitors — frequently re-list it. You'd carry that risk alone.",
    protOffAck: "I understand the risk — continue without protection", protOffAcked: "Continuing without protection",
    perMonthShort: "/ mo.", onceShort: "once", perMonthAffix: "/mo.", perMonthPre: false, cancelAnytime: "Cancel anytime",
    keepProt: "9 in 10 customers keep protection",
    noProtLink: "I don't need protection",
    noProtTitle: "No protection selected",
    noProtBody: "Without protection we won't remove a re-listed profile for free. Unfortunately this happens often.",
    addProtBack: "Add protection after all",
    sumExpress: "Express removal (~6 h)", sumAfter: "then",
    lastChanceTitle: "Last chance: add express",
    lastChanceDesc: "Profile removed in ~6 h instead of ~24 — no surcharge if we miss the 6 h.",
    afterSuccess: "Everything due only after success.",
    protStepLabel: "Protection · Step 5", subtotal: "Subtotal",
    toProtect: "Continue", toCheckout: "Continue",
    totalAfter: "Total after success",
    doneCrossH: "More for your reputation?",
    doneCrossSub: "Optional, anytime — our add-ons around your online reputation.",
    xsOrmTitle: "Improve reputation", xsOrmDesc: "Push negative results out of Google search.", xsOrmPrice: "On request",
    xsPressTitle: "De-index press articles", xsPressDesc: "Remove unwanted articles from search results.", xsPressPrice: "On request",
    asideBadges: ["GDPR-compliant", "EU servers"],
  },
  es: {
    rating: "4,9", reviewsN: "260+ reseñas", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "perfiles eliminados", successRate: "98 % de éxito",
    avgTime: "≈ 24 h", liveNow: "activos ahora",
    activityPre: "Recién eliminado",
    ago: (m) => `hace ${m} min`,
    activity: [
      { biz: "Clínica dental", city: "Madrid", min: 2 },
      { biz: "Peluquería", city: "Barcelona", min: 6 },
      { biz: "Restaurante", city: "Valencia", min: 11 },
      { biz: "Concesionario", city: "Sevilla", min: 14 },
      { biz: "Gimnasio", city: "Málaga", min: 19 },
      { biz: "Hotel", city: "Bilbao", min: 24 },
      { biz: "Centro de estética", city: "Zaragoza", min: 29 },
      { biz: "Empresa de reformas", city: "Murcia", min: 33 },
    ],
    quotes: [
      { q: "Llevábamos años luchando con el perfil de Google. Gracias a RapidRemove y a su amable servicio, se eliminó en un solo día.", a: "Martín G.", r: "Propietario de clínica, Madrid" },
      { q: "Por fin vuelvo a dormir tranquila. Se encargaron de todo.", a: "Sara R.", r: "Dueña de restaurante, Valencia" },
      { q: "Rápido, discreto, profesional — y de verdad se paga solo tras el éxito.", a: "Tomás V.", r: "Director general, Barcelona" },
    ],
    expEyebrow: "¿Lo quieres más rápido?",
    expTitle: "Eliminación exprés",
    expDesc: "Tu caso pasa al principio de la cola — gestionado en ~6 horas en lugar de ~24.",
    expGuarantee: "Si no cumplimos las 6 horas, el recargo exprés se anula automáticamente. Sin riesgo.",
    expSlots: (n) => `Hoy quedan ${n} plazas exprés`,
    expAdd: "Añadir exprés", expOn: "Exprés activo",
    protEyebrow: "Recomendado — casi todos lo mantienen",
    protH: "Protección contra una nueva publicación",
    protSub: "Terceros — a menudo competidores — pueden volver a publicar tu perfil en Google en cualquier momento. Incluso Google vuelve a crear perfiles a partir de datos de sitios web o de usuarios. Con protección lo eliminamos de nuevo gratis, de forma permanente.",
    tierMonthlyLabel: "Mensual", tierMonitorLabel: "Monitorización automática", tierLifetimeLabel: "De por vida", protMonitorName: "Monitorización automática",
    tierMonthlyDesc: "Vigilamos cada mes y eliminamos las nuevas publicaciones gratis.",
    tierMonitorDesc: "Vigilancia diaria, eliminación inmediata e informe mensual. Máxima seguridad.",
    tierLifetimeDesc: "Paga una vez y olvídate — protección permanente sin costes recurrentes.",
    tierMonitorBadge: "Más popular", tierLifetimeBadge: "Mejor valor", protPopularBadge: "Elegido por el 90 % de los clientes",
    lifetimeMath: "Más barato que 4 años de protección mensual — y luego nunca más pagas.",
    monitorMath: "Para quienes quieren ir totalmente sobre seguro.",
    perMonthShort: "/ mes", onceShort: "único", perMonthAffix: "/mes", perMonthPre: false, cancelAnytime: "Cancelable en cualquier momento",
    keepProt: "9 de cada 10 clientes mantienen la protección",
    noProtLink: "No necesito protección",
    noProtTitle: "Sin protección seleccionada",
    noProtBody: "Sin protección no eliminamos gratis un perfil que se vuelva a publicar. Por desgracia ocurre a menudo.",
    addProtBack: "Añadir protección de todos modos",
    sumExpress: "Eliminación exprés (~6 h)", sumAfter: "después",
    lastChanceTitle: "Última oportunidad: añade exprés",
    lastChanceDesc: "Perfil eliminado en ~6 h en lugar de ~24 — sin recargo si no cumplimos las 6 h.",
    afterSuccess: "Todo se paga solo tras el éxito.",
    protStepLabel: "Protección · Paso 5", subtotal: "Subtotal", mostChosen: "Más elegido", protNoneName: "Sin protección", protNoneDesc: "También se puede elegir más tarde.", checkingH: "Comprobando el perfil …", checkSteps: ["Perfil encontrado", "Reseñas analizadas", "Eliminación confirmada"], protOffContinue: "Continuar sin protección", delOk: "El perfil se puede eliminar", expertCta: "Habla con los expertos en Google",
    toProtect: "Continuar", toCheckout: "Continuar",
    totalAfter: "Total tras el éxito",
    doneCrossH: "¿Aún más para tu reputación?",
    doneCrossSub: "Opcional, cuando quieras — nuestros complementos para tu reputación online.",
    xsOrmTitle: "Mejorar la reputación", xsOrmDesc: "Desplaza los resultados negativos de Google.", xsOrmPrice: "Bajo consulta",
    xsPressTitle: "Desindexar artículos de prensa", xsPressDesc: "Elimina artículos no deseados de los resultados de búsqueda.", xsPressPrice: "Bajo consulta",
    asideBadges: ["Conforme al RGPD", "Servidores en la UE"],
  },
  fr: {
    rating: "4,9", reviewsN: "260+ avis", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profils supprimés", successRate: "98 % de réussite",
    avgTime: "≈ 24 h", liveNow: "actifs maintenant",
    activityPre: "Vient d'être supprimé",
    ago: (m) => `il y a ${m} min`,
    activity: [
      { biz: "Cabinet dentaire", city: "Paris", min: 2 },
      { biz: "Salon de coiffure", city: "Lyon", min: 6 },
      { biz: "Restaurant", city: "Marseille", min: 11 },
      { biz: "Concession auto", city: "Toulouse", min: 14 },
      { biz: "Salle de sport", city: "Nice", min: 19 },
      { biz: "Hôtel", city: "Bordeaux", min: 24 },
      { biz: "Institut de beauté", city: "Lille", min: 29 },
      { biz: "Entreprise artisanale", city: "Genève", min: 33 },
    ],
    quotes: [
      { q: "Nous nous battions depuis des années avec la fiche Google. Grâce à RapidRemove et à son service aimable, elle a été supprimée en une seule journée.", a: "Martin C.", r: "Gérant de cabinet, Paris" },
      { q: "Je dors enfin tranquille. Ils ont tout pris en charge.", a: "Sophie R.", r: "Restauratrice, Marseille" },
      { q: "Rapide, discret, professionnel — et on ne paie vraiment qu'après le succès.", a: "Thomas V.", r: "Directeur général, Lyon" },
    ],
    expEyebrow: "Vous le voulez plus vite ?",
    expTitle: "Suppression express",
    expDesc: "Votre dossier passe en tête de file — traité en ~6 heures au lieu de ~24.",
    expGuarantee: "Si nous dépassons les 6 heures, le supplément express est annulé automatiquement. Aucun risque.",
    expSlots: (n) => `Encore ${n} créneaux express aujourd'hui`,
    expAdd: "Ajouter l'express", expOn: "Express activé",
    protEyebrow: "Recommandé — presque tout le monde le garde",
    protH: "Protection contre une nouvelle publication",
    protSub: "Des tiers — souvent des concurrents — peuvent réinscrire votre fiche sur Google à tout moment. Google lui-même réinscrit des fiches via les données de sites web ou d'utilisateurs. Avec la protection, nous la supprimons à nouveau gratuitement, durablement.",
    tierMonthlyLabel: "Mensuel", tierMonitorLabel: "Surveillance automatique", tierLifetimeLabel: "À vie", protMonitorName: "Surveillance automatique",
    tierMonthlyDesc: "Nous surveillons chaque mois et supprimons gratuitement toute réinscription.",
    tierMonitorDesc: "Surveillance quotidienne, suppression immédiate et rapport mensuel. Sécurité maximale.",
    tierLifetimeDesc: "Payez une fois, ne vous inquiétez plus — protection permanente sans frais récurrents.",
    tierMonitorBadge: "Le plus choisi", tierLifetimeBadge: "Meilleur rapport", protPopularBadge: "Choisi par 90 % des clients",
    lifetimeMath: "Moins cher que 4 ans de protection mensuelle — ensuite, plus jamais de paiement.",
    monitorMath: "Pour celles et ceux qui veulent une sécurité totale.",
    perMonthShort: "/ mois", onceShort: "unique", perMonthAffix: "/mois", perMonthPre: false, cancelAnytime: "Résiliable à tout moment",
    keepProt: "9 clients sur 10 gardent la protection",
    noProtLink: "Je n'ai pas besoin de protection",
    noProtTitle: "Aucune protection sélectionnée",
    noProtBody: "Sans protection, nous ne supprimons pas gratuitement une fiche réinscrite. Cela arrive malheureusement souvent.",
    addProtBack: "Ajouter quand même la protection",
    sumExpress: "Suppression express (~6 h)", sumAfter: "ensuite",
    lastChanceTitle: "Dernière chance : ajouter l'express",
    lastChanceDesc: "Fiche supprimée en ~6 h au lieu de ~24 — sans supplément si nous dépassons les 6 h.",
    afterSuccess: "Tout n'est dû qu'après le succès.",
    protStepLabel: "Protection · Étape 5", subtotal: "Sous-total", mostChosen: "Le plus choisi", protNoneName: "Sans protection", protNoneDesc: "Peut aussi être choisi plus tard.", checkingH: "Vérification de la fiche …", checkSteps: ["Fiche trouvée", "Avis analysés", "Suppression confirmée"], protOffContinue: "Continuer sans protection", delOk: "La fiche peut être supprimée", expertCta: "Parlez aux experts Google",
    toProtect: "Continuer", toCheckout: "Continuer",
    totalAfter: "Total après le succès",
    doneCrossH: "Encore plus pour votre réputation ?",
    doneCrossSub: "En option, à tout moment — nos compléments pour votre réputation en ligne.",
    xsOrmTitle: "Améliorer la réputation", xsOrmDesc: "Faites reculer les résultats négatifs dans Google.", xsOrmPrice: "Sur demande",
    xsPressTitle: "Désindexer des articles de presse", xsPressDesc: "Retirez les articles indésirables des résultats de recherche.", xsPressPrice: "Sur demande",
    asideBadges: ["Conforme au RGPD", "Serveurs dans l'UE"],
  },
  it: {
    rating: "4,9", reviewsN: "260+ recensioni", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profili eliminati", successRate: "98% di successo",
    avgTime: "≈ 24 h", liveNow: "attivi ora",
    activityPre: "Appena eliminato",
    ago: (m) => `${m} min fa`,
    activity: [
      { biz: "Studio dentistico", city: "Milano", min: 2 },
      { biz: "Parrucchiere", city: "Roma", min: 6 },
      { biz: "Ristorante", city: "Napoli", min: 11 },
      { biz: "Concessionaria", city: "Torino", min: 14 },
      { biz: "Palestra", city: "Bologna", min: 19 },
      { biz: "Hotel", city: "Firenze", min: 24 },
      { biz: "Centro estetico", city: "Verona", min: 29 },
      { biz: "Impresa artigiana", city: "Palermo", min: 33 },
    ],
    quotes: [
      { q: "Lottavamo da anni con il profilo Google. Grazie a RapidRemove e al servizio cortese, è stato eliminato in un solo giorno.", a: "Marco G.", r: "Titolare di studio, Milano" },
      { q: "Finalmente dormo di nuovo serena. Hanno fatto tutto loro.", a: "Sara R.", r: "Ristoratrice, Napoli" },
      { q: "Veloce, discreto, professionale — e si paga davvero solo dopo il successo.", a: "Tommaso V.", r: "Amministratore, Roma" },
    ],
    expEyebrow: "Lo vuoi più in fretta?",
    expTitle: "Rimozione express",
    expDesc: "Il tuo caso passa in cima alla coda — gestito in ~6 ore invece di ~24.",
    expGuarantee: "Se non rispettiamo le 6 ore, il supplemento express viene annullato automaticamente. Zero rischi.",
    expSlots: (n) => `Oggi restano ${n} posti express`,
    expAdd: "Aggiungi express", expOn: "Express attivo",
    protEyebrow: "Consigliato — quasi tutti lo mantengono",
    protH: "Protezione da una nuova pubblicazione",
    protSub: "Terzi — spesso concorrenti — possono ripubblicare il tuo profilo su Google in qualsiasi momento. Anche Google ricrea profili tramite dati di siti web o degli utenti. Con la protezione lo rimuoviamo di nuovo gratis, in modo permanente.",
    tierMonthlyLabel: "Mensile", tierMonitorLabel: "Monitoraggio automatico", tierLifetimeLabel: "A vita", protMonitorName: "Monitoraggio automatico",
    tierMonthlyDesc: "Monitoriamo ogni mese e rimuoviamo gratis le nuove pubblicazioni.",
    tierMonitorDesc: "Monitoraggio quotidiano, rimozione immediata e report mensile. Massima sicurezza.",
    tierLifetimeDesc: "Paghi una volta e non ci pensi più — protezione permanente senza costi ricorrenti.",
    tierMonitorBadge: "Più scelto", tierLifetimeBadge: "Miglior valore", protPopularBadge: "Scelto dal 90% dei clienti",
    lifetimeMath: "Più conveniente di 4 anni di protezione mensile — poi non paghi mai più.",
    monitorMath: "Per chi vuole andare davvero sul sicuro.",
    perMonthShort: "/ mese", onceShort: "una tantum", perMonthAffix: "/mese", perMonthPre: false, cancelAnytime: "Annullabile in qualsiasi momento",
    keepProt: "9 clienti su 10 mantengono la protezione",
    noProtLink: "Non mi serve la protezione",
    noProtTitle: "Nessuna protezione selezionata",
    noProtBody: "Senza protezione non rimuoviamo gratis un profilo ripubblicato. Purtroppo capita spesso.",
    addProtBack: "Aggiungi comunque la protezione",
    sumExpress: "Rimozione express (~6 h)", sumAfter: "poi",
    lastChanceTitle: "Ultima occasione: aggiungi express",
    lastChanceDesc: "Profilo rimosso in ~6 h invece di ~24 — nessun supplemento se non rispettiamo le 6 h.",
    afterSuccess: "Tutto dovuto solo dopo il successo.",
    protStepLabel: "Protezione · Passo 5", subtotal: "Subtotale", mostChosen: "Più scelto", protNoneName: "Nessuna protezione", protNoneDesc: "Può essere scelto anche in seguito.", checkingH: "Verifica del profilo …", checkSteps: ["Profilo trovato", "Recensioni analizzate", "Rimozione confermata"], protOffContinue: "Continua senza protezione", delOk: "Il profilo può essere rimosso", expertCta: "Parla con gli esperti di Google",
    toProtect: "Continua", toCheckout: "Continua",
    totalAfter: "Totale dopo il successo",
    doneCrossH: "Ancora di più per la tua reputazione?",
    doneCrossSub: "Opzionale, quando vuoi — i nostri servizi aggiuntivi per la tua reputazione online.",
    xsOrmTitle: "Migliorare la reputazione", xsOrmDesc: "Fai retrocedere i risultati negativi su Google.", xsOrmPrice: "Su richiesta",
    xsPressTitle: "Deindicizzare articoli di stampa", xsPressDesc: "Rimuovi gli articoli indesiderati dai risultati di ricerca.", xsPressPrice: "Su richiesta",
    asideBadges: ["Conforme al GDPR", "Server nell'UE"],
  },
  nl: {
    rating: "4,9", reviewsN: "260+ beoordelingen", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profielen verwijderd", successRate: "98% succes",
    avgTime: "ø 24 u", liveNow: "nu actief",
    activityPre: "Net verwijderd",
    ago: (m) => `${m} min geleden`,
    activity: [
      { biz: "Tandartspraktijk", city: "Amsterdam", min: 2 },
      { biz: "Kapsalon", city: "Rotterdam", min: 6 },
      { biz: "Restaurant", city: "Den Haag", min: 11 },
      { biz: "Autobedrijf", city: "Utrecht", min: 14 },
      { biz: "Sportschool", city: "Eindhoven", min: 19 },
      { biz: "Hotel", city: "Antwerpen", min: 24 },
      { biz: "Schoonheidssalon", city: "Gent", min: 29 },
      { biz: "Klusbedrijf", city: "Brugge", min: 33 },
    ],
    quotes: [
      { q: "We worstelden al jaren met het Google-profiel. Dankzij RapidRemove en de vriendelijke service was het binnen één dag verwijderd.", a: "Mark V.", r: "Praktijkhouder, Amsterdam" },
      { q: "Eindelijk weer rustig slapen. Ze hebben het volledig uit handen genomen.", a: "Sanne R.", r: "Restauranthouder, Den Haag" },
      { q: "Snel, discreet, professioneel — en je betaalt echt pas na succes.", a: "Tom W.", r: "Directeur, Rotterdam" },
    ],
    expEyebrow: "Sneller klaar?",
    expTitle: "Express-verwijdering",
    expDesc: "Uw zaak gaat vooraan in de wachtrij — behandeld in ~6 uur in plaats van ~24.",
    expGuarantee: "Halen we de 6 uur niet, dan vervalt de express-toeslag automatisch. Geen risico.",
    expSlots: (n) => `Vandaag nog ${n} express-plekken vrij`,
    expAdd: "Express toevoegen", expOn: "Express actief",
    protEyebrow: "Aanbevolen — bijna iedereen houdt het",
    protH: "Bescherming tegen opnieuw plaatsen",
    protSub: "Derden — vaak concurrenten — kunnen uw profiel op elk moment opnieuw op Google plaatsen. Zelfs Google maakt profielen opnieuw aan via website- of gebruikersgegevens. Met bescherming verwijderen we het opnieuw gratis, permanent.",
    tierMonthlyLabel: "Maandelijks", tierMonitorLabel: "Automatische monitoring", tierLifetimeLabel: "Levenslang", protMonitorName: "Automatische monitoring",
    tierMonthlyDesc: "We monitoren maandelijks en verwijderen nieuwe plaatsingen gratis.",
    tierMonitorDesc: "Dagelijkse monitoring, directe verwijdering & maandrapport. Maximale zekerheid.",
    tierLifetimeDesc: "Eén keer betalen, nooit meer zorgen — permanente bescherming zonder vaste kosten.",
    tierMonitorBadge: "Populairst", tierLifetimeBadge: "Beste waarde", protPopularBadge: "Gekozen door 90% van de klanten",
    lifetimeMath: "Goedkoper dan 4 jaar maandbescherming — daarna nooit meer betalen.",
    monitorMath: "Voor wie helemaal zeker wil zijn.",
    perMonthShort: "/ mnd", onceShort: "eenmalig", perMonthAffix: "/mnd", perMonthPre: false, cancelAnytime: "Op elk moment opzegbaar",
    keepProt: "9 van de 10 klanten houden de bescherming",
    noProtLink: "Ik heb geen bescherming nodig",
    noProtTitle: "Geen bescherming gekozen",
    noProtBody: "Zonder bescherming verwijderen we een opnieuw geplaatst profiel niet gratis. Dat gebeurt helaas vaak.",
    addProtBack: "Toch bescherming toevoegen",
    sumExpress: "Express-verwijdering (~6 u)", sumAfter: "daarna",
    lastChanceTitle: "Laatste kans: express toevoegen",
    lastChanceDesc: "Profiel verwijderd in ~6 u in plaats van ~24 — geen toeslag als we de 6 u niet halen.",
    afterSuccess: "Alles pas verschuldigd na succes.",
    protStepLabel: "Bescherming · Stap 5", subtotal: "Subtotaal", mostChosen: "Meest gekozen", protNoneName: "Geen bescherming", protNoneDesc: "Kan ook later worden gekozen.", checkingH: "Profiel wordt gecontroleerd …", checkSteps: ["Profiel gevonden", "Reviews geanalyseerd", "Verwijdering bevestigd"], protOffContinue: "Doorgaan zonder bescherming", delOk: "Profiel kan worden verwijderd", expertCta: "Praat met de Google-experts",
    toProtect: "Verder", toCheckout: "Verder",
    totalAfter: "Totaal na succes",
    doneCrossH: "Nog meer voor uw reputatie?",
    doneCrossSub: "Optioneel, altijd — onze aanvullingen voor uw online reputatie.",
    xsOrmTitle: "Reputatie verbeteren", xsOrmDesc: "Negatieve resultaten uit Google wegdrukken.", xsOrmPrice: "Op aanvraag",
    xsPressTitle: "Persartikelen de-indexeren", xsPressDesc: "Verwijder ongewenste artikelen uit de zoekresultaten.", xsPressPrice: "Op aanvraag",
    asideBadges: ["AVG-conform", "Servers in de EU"],
  },
  pt: {
    rating: "4,9", reviewsN: "260+ avaliações", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "perfis eliminados", successRate: "98% de sucesso",
    avgTime: "≈ 24 h", liveNow: "ativos agora",
    activityPre: "Acabado de eliminar",
    ago: (m) => `há ${m} min`,
    activity: [
      { biz: "Clínica dentária", city: "Lisboa", min: 2 },
      { biz: "Cabeleireiro", city: "Porto", min: 6 },
      { biz: "Restaurante", city: "Braga", min: 11 },
      { biz: "Stand automóvel", city: "Coimbra", min: 14 },
      { biz: "Ginásio", city: "Faro", min: 19 },
      { biz: "Hotel", city: "Aveiro", min: 24 },
      { biz: "Centro de estética", city: "Funchal", min: 29 },
      { biz: "Empresa de remodelações", city: "Setúbal", min: 33 },
    ],
    quotes: [
      { q: "Lutávamos há anos com o perfil do Google. Graças à RapidRemove e ao serviço simpático, foi eliminado num único dia.", a: "Miguel G.", r: "Proprietário de clínica, Lisboa" },
      { q: "Finalmente volto a dormir descansada. Trataram de tudo por mim.", a: "Sara R.", r: "Dona de restaurante, Braga" },
      { q: "Rápido, discreto, profissional — e paga-se mesmo só após o sucesso.", a: "Tomás V.", r: "Diretor-geral, Porto" },
    ],
    expEyebrow: "Quer mais rápido?",
    expTitle: "Eliminação expresso",
    expDesc: "O seu caso passa para o início da fila — tratado em ~6 horas em vez de ~24.",
    expGuarantee: "Se não cumprirmos as 6 horas, a taxa expresso é anulada automaticamente. Risco zero.",
    expSlots: (n) => `Hoje ainda há ${n} vagas expresso`,
    expAdd: "Adicionar expresso", expOn: "Expresso ativo",
    protEyebrow: "Recomendado — quase todos o mantêm",
    protH: "Proteção contra nova publicação",
    protSub: "Terceiros — muitas vezes concorrentes — podem voltar a publicar o seu perfil no Google a qualquer momento. Até o próprio Google recria perfis a partir de dados de sites ou de utilizadores. Com proteção, removemo-lo de novo gratuitamente, de forma permanente.",
    tierMonthlyLabel: "Mensal", tierMonitorLabel: "Monitorização automática", tierLifetimeLabel: "Vitalícia", protMonitorName: "Monitorização automática",
    tierMonthlyDesc: "Monitorizamos mensalmente e removemos novas publicações gratuitamente.",
    tierMonitorDesc: "Monitorização diária, remoção imediata e relatório mensal. Segurança máxima.",
    tierLifetimeDesc: "Pague uma vez e nunca mais se preocupe — proteção permanente sem custos recorrentes.",
    tierMonitorBadge: "Mais escolhido", tierLifetimeBadge: "Melhor valor", protPopularBadge: "Escolhido por 90% dos clientes",
    lifetimeMath: "Mais barato do que 4 anos de proteção mensal — depois nunca mais paga.",
    monitorMath: "Para quem quer ficar totalmente descansado.",
    perMonthShort: "/ mês", onceShort: "única", perMonthAffix: "/mês", perMonthPre: false, cancelAnytime: "Cancele quando quiser",
    keepProt: "9 em cada 10 clientes mantêm a proteção",
    noProtLink: "Não preciso de proteção",
    noProtTitle: "Nenhuma proteção selecionada",
    noProtBody: "Sem proteção não removemos gratuitamente um perfil que seja republicado. Infelizmente acontece com frequência.",
    addProtBack: "Afinal adicionar proteção",
    sumExpress: "Eliminação expresso (~6 h)", sumAfter: "depois",
    lastChanceTitle: "Última oportunidade: adicionar expresso",
    lastChanceDesc: "Perfil removido em ~6 h em vez de ~24 — sem taxa se não cumprirmos as 6 h.",
    afterSuccess: "Tudo só é devido após o sucesso.",
    protStepLabel: "Proteção · Passo 5", subtotal: "Subtotal", mostChosen: "Mais escolhido", protNoneName: "Sem proteção", protNoneDesc: "Também pode ser escolhido mais tarde.", checkingH: "A verificar o perfil …", checkSteps: ["Perfil encontrado", "Avaliações analisadas", "Remoção confirmada"], protOffContinue: "Continuar sem proteção", delOk: "O perfil pode ser removido", expertCta: "Fale com os especialistas em Google",
    toProtect: "Continuar", toCheckout: "Continuar",
    totalAfter: "Total após o sucesso",
    doneCrossH: "Ainda mais para a sua reputação?",
    doneCrossSub: "Opcional, quando quiser — os nossos complementos para a sua reputação online.",
    xsOrmTitle: "Melhorar a reputação", xsOrmDesc: "Faça recuar os resultados negativos do Google.", xsOrmPrice: "Sob consulta",
    xsPressTitle: "Desindexar artigos de imprensa", xsPressDesc: "Remova artigos indesejados dos resultados de pesquisa.", xsPressPrice: "Sob consulta",
    asideBadges: ["Conforme o RGPD", "Servidores na UE"],
  },
  ja: {
    rating: "4.9", reviewsN: "260件以上のレビュー", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "件のプロフィールを削除", successRate: "98% 成功率",
    avgTime: "平均24時間", liveNow: "対応中",
    activityPre: "削除完了",
    ago: (m) => `${m}分前`,
    activity: [
      { biz: "歯科医院", city: "東京", min: 2 },
      { biz: "美容室", city: "大阪", min: 6 },
      { biz: "レストラン", city: "横浜", min: 11 },
      { biz: "自動車販売店", city: "名古屋", min: 14 },
      { biz: "ジム", city: "札幌", min: 19 },
      { biz: "ホテル", city: "福岡", min: 24 },
      { biz: "エステサロン", city: "神戸", min: 29 },
      { biz: "工務店", city: "京都", min: 33 },
    ],
    quotes: [
      { q: "Googleプロフィールに何年も悩まされていました。RapidRemoveと親切なサポートのおかげで、たった1日で削除できました。", a: "佐藤 健", r: "クリニック経営、東京" },
      { q: "ようやく安心して眠れます。すべて任せられました。", a: "鈴木 さや", r: "レストラン経営、横浜" },
      { q: "迅速・慎重・プロフェッショナル。しかも本当に成功後のみのお支払いです。", a: "高橋 亮", r: "代表取締役、大阪" },
    ],
    expEyebrow: "もっと早く?",
    expTitle: "エクスプレス削除",
    expDesc: "あなたの案件が列の先頭へ — 約24時間ではなく約6時間で対応します。",
    expGuarantee: "6時間に間に合わなければ、エクスプレス料金は自動的に無料になります。リスクはありません。",
    expSlots: (n) => `本日残り${n}枠のエクスプレス`,
    expAdd: "エクスプレスを追加", expOn: "エクスプレス有効",
    protEyebrow: "おすすめ — ほぼ全員が継続",
    protH: "再登録からの保護",
    protSub: "第三者(多くは競合)はいつでもあなたのプロフィールをGoogleに再登録できます。Google自身も、ウェブサイトの情報やユーザーデータからプロフィールを再登録することがあります。保護があれば、何度でも無料で永続的に削除します。",
    tierMonthlyLabel: "月額", tierMonitorLabel: "自動モニタリング", tierLifetimeLabel: "永久", protMonitorName: "自動モニタリング",
    tierMonthlyDesc: "毎月監視し、再登録を無料で削除します。",
    tierMonitorDesc: "毎日の監視、即時削除、月次レポート。最大限の安心。",
    tierLifetimeDesc: "一度のお支払いで以後安心 — 継続費用なしの永続保護。",
    tierMonitorBadge: "人気No.1", tierLifetimeBadge: "最もお得", protPopularBadge: "お客様の90%が選択",
    lifetimeMath: "月額保護4年分より安く — その後は二度と支払い不要。",
    monitorMath: "完全に万全を期したい方へ。",
    perMonthShort: "/ 月", onceShort: "一回", perMonthAffix: "月額", perMonthPre: true, cancelAnytime: "いつでも解約可能",
    keepProt: "10人中9人のお客様が保護を継続",
    noProtLink: "保護は不要です",
    noProtTitle: "保護が選択されていません",
    noProtBody: "保護がない場合、再登録されたプロフィールを無料では削除しません。残念ながら頻繁に起こります。",
    addProtBack: "やはり保護を追加",
    sumExpress: "エクスプレス削除(約6時間)", sumAfter: "その後",
    lastChanceTitle: "最後のチャンス:エクスプレス追加",
    lastChanceDesc: "約24時間ではなく約6時間で削除 — 6時間に間に合わなければ追加料金なし。",
    afterSuccess: "お支払いはすべて成功後のみ。",
    protStepLabel: "保護 · ステップ5", subtotal: "小計", mostChosen: "最も選ばれている", protNoneName: "保護なし", protNoneDesc: "後からでも選択できます。", checkingH: "プロフィールを確認中 …", checkSteps: ["プロフィールを確認", "レビューを分析", "削除可能を確認"], protOffContinue: "保護なしで続行", delOk: "プロフィールは削除可能です", expertCta: "Googleの専門家に相談",
    toProtect: "次へ", toCheckout: "次へ",
    totalAfter: "成功後の合計",
    doneCrossH: "評判のためにさらに?",
    doneCrossSub: "任意・いつでも — オンライン評判に関する追加サービス。",
    xsOrmTitle: "評判を改善", xsOrmDesc: "Googleの否定的な検索結果を押し下げます。", xsOrmPrice: "お問い合わせ",
    xsPressTitle: "報道記事の登録解除", xsPressDesc: "不要な記事を検索結果から削除します。", xsPressPrice: "お問い合わせ",
    asideBadges: ["GDPR準拠", "EUのサーバー"],
  },
  sv: {
    rating: "4,9", reviewsN: "260+ omdömen", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profiler borttagna", successRate: "98 % lyckade",
    avgTime: "ø 24 h", liveNow: "aktiva nu",
    activityPre: "Nyss borttaget",
    ago: (m) => `${m} min sedan`,
    activity: [
      { biz: "Tandläkarmottagning", city: "Stockholm", min: 2 },
      { biz: "Frisörsalong", city: "Göteborg", min: 6 },
      { biz: "Restaurang", city: "Malmö", min: 11 },
      { biz: "Bilhandlare", city: "Uppsala", min: 14 },
      { biz: "Gym", city: "Västerås", min: 19 },
      { biz: "Hotell", city: "Örebro", min: 24 },
      { biz: "Skönhetssalong", city: "Linköping", min: 29 },
      { biz: "Hantverksföretag", city: "Helsingborg", min: 33 },
    ],
    quotes: [
      { q: "Vi kämpade i åratal med Google-profilen. Tack vare RapidRemove och den vänliga servicen var den borttagen på en enda dag.", a: "Martin K.", r: "Mottagningsägare, Stockholm" },
      { q: "Äntligen sover jag gott igen. De tog hand om allt.", a: "Sara R.", r: "Restaurangägare, Malmö" },
      { q: "Snabbt, diskret, professionellt — och man betalar verkligen först efter resultat.", a: "Tobias V.", r: "VD, Göteborg" },
    ],
    expEyebrow: "Vill du ha det snabbare?",
    expTitle: "Expressborttagning",
    expDesc: "Ditt ärende hamnar först i kön — hanteras på ~6 timmar i stället för ~24.",
    expGuarantee: "Klarar vi inte de 6 timmarna slopas expresstillägget automatiskt. Noll risk.",
    expSlots: (n) => `${n} expressplatser kvar idag`,
    expAdd: "Lägg till express", expOn: "Express aktiv",
    protEyebrow: "Rekommenderas — nästan alla behåller det",
    protH: "Skydd mot ny publicering",
    protSub: "Tredje part — ofta konkurrenter — kan när som helst lägga upp din profil igen på Google. Även Google återskapar profiler via webbplats- eller användardata. Med skydd tar vi bort den gratis igen, permanent.",
    tierMonthlyLabel: "Månadsvis", tierMonitorLabel: "Automatisk övervakning", tierLifetimeLabel: "Livstid", protMonitorName: "Automatisk övervakning",
    tierMonthlyDesc: "Vi övervakar varje månad och tar bort nya publiceringar gratis.",
    tierMonitorDesc: "Daglig övervakning, omedelbar borttagning och månadsrapport. Maximal trygghet.",
    tierLifetimeDesc: "Betala en gång, slipp oroa dig — permanent skydd utan löpande kostnad.",
    tierMonitorBadge: "Populärast", tierLifetimeBadge: "Bäst värde", protPopularBadge: "Vald av 90 % av kunderna",
    lifetimeMath: "Billigare än 4 års månadsskydd — sedan betalar du aldrig igen.",
    monitorMath: "För dig som vill vara helt på den säkra sidan.",
    perMonthShort: "/ mån", onceShort: "engång", perMonthAffix: "/mån", perMonthPre: false, cancelAnytime: "Avsluta när som helst",
    keepProt: "9 av 10 kunder behåller skyddet",
    noProtLink: "Jag behöver inget skydd",
    noProtTitle: "Inget skydd valt",
    noProtBody: "Utan skydd tar vi inte bort en återpublicerad profil gratis. Tyvärr händer det ofta.",
    addProtBack: "Lägg till skydd ändå",
    sumExpress: "Expressborttagning (~6 h)", sumAfter: "därefter",
    lastChanceTitle: "Sista chansen: lägg till express",
    lastChanceDesc: "Profil borttagen på ~6 h i stället för ~24 — inget tillägg om vi missar de 6 h.",
    afterSuccess: "Allt betalas först efter resultat.",
    protStepLabel: "Skydd · Steg 5", subtotal: "Delsumma", mostChosen: "Mest vald", protNoneName: "Inget skydd", protNoneDesc: "Kan även väljas senare.", checkingH: "Kontrollerar profilen …", checkSteps: ["Profil hittad", "Omdömen analyserade", "Borttagning bekräftad"], protOffContinue: "Fortsätt utan skydd", delOk: "Profilen kan tas bort", expertCta: "Prata med Google-experterna",
    toProtect: "Fortsätt", toCheckout: "Fortsätt",
    totalAfter: "Totalt efter resultat",
    doneCrossH: "Ännu mer för ditt rykte?",
    doneCrossSub: "Valfritt, när som helst — våra tillägg för ditt rykte online.",
    xsOrmTitle: "Förbättra ryktet", xsOrmDesc: "Tryck ner negativa resultat i Google.", xsOrmPrice: "På förfrågan",
    xsPressTitle: "Avindexera pressartiklar", xsPressDesc: "Ta bort oönskade artiklar från sökresultaten.", xsPressPrice: "På förfrågan",
    asideBadges: ["GDPR-förenligt", "Servrar inom EU"],
  },
  da: {
    rating: "4,9", reviewsN: "260+ anmeldelser", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profiler fjernet", successRate: "98 % succes",
    avgTime: "ø 24 t", liveNow: "aktive nu",
    activityPre: "Lige fjernet",
    ago: (m) => `for ${m} min. siden`,
    activity: [
      { biz: "Tandlægeklinik", city: "København", min: 2 },
      { biz: "Frisørsalon", city: "Aarhus", min: 6 },
      { biz: "Restaurant", city: "Odense", min: 11 },
      { biz: "Bilforhandler", city: "Aalborg", min: 14 },
      { biz: "Fitnesscenter", city: "Esbjerg", min: 19 },
      { biz: "Hotel", city: "Randers", min: 24 },
      { biz: "Skønhedsklinik", city: "Kolding", min: 29 },
      { biz: "Håndværksvirksomhed", city: "Vejle", min: 33 },
    ],
    quotes: [
      { q: "Vi kæmpede i årevis med Google-profilen. Takket være RapidRemove og den venlige service var den slettet på én enkelt dag.", a: "Martin K.", r: "Klinikejer, København" },
      { q: "Endelig sover jeg godt igen. De tog sig af det hele.", a: "Sara R.", r: "Restaurantejer, Odense" },
      { q: "Hurtigt, diskret, professionelt — og man betaler virkelig først efter resultat.", a: "Tobias V.", r: "Direktør, Aarhus" },
    ],
    expEyebrow: "Vil du have det hurtigere?",
    expTitle: "Ekspresfjernelse",
    expDesc: "Din sag ryger forrest i køen — behandlet på ~6 timer i stedet for ~24.",
    expGuarantee: "Når vi ikke de 6 timer, bortfalder ekspresgebyret automatisk. Nul risiko.",
    expSlots: (n) => `${n} eksprespladser tilbage i dag`,
    expAdd: "Tilføj ekspres", expOn: "Ekspres aktiv",
    protEyebrow: "Anbefales — næsten alle beholder det",
    protH: "Beskyttelse mod ny oprettelse",
    protSub: "Tredjeparter — ofte konkurrenter — kan til enhver tid oprette din profil igen på Google. Selv Google genopretter profiler via websteds- eller brugerdata. Med beskyttelse fjerner vi den igen gratis, permanent.",
    tierMonthlyLabel: "Månedligt", tierMonitorLabel: "Automatisk overvågning", tierLifetimeLabel: "Livsvarig", protMonitorName: "Automatisk overvågning",
    tierMonthlyDesc: "Vi overvåger månedligt og fjerner nye oprettelser gratis.",
    tierMonitorDesc: "Daglig overvågning, øjeblikkelig fjernelse og månedsrapport. Maksimal sikkerhed.",
    tierLifetimeDesc: "Betal én gang, og vær fri for bekymringer — permanent beskyttelse uden løbende udgifter.",
    tierMonitorBadge: "Mest valgte", tierLifetimeBadge: "Bedste værdi", protPopularBadge: "Valgt af 90 % af kunderne",
    lifetimeMath: "Billigere end 4 års månedsbeskyttelse — derefter betaler du aldrig igen.",
    monitorMath: "For dig, der vil være helt på den sikre side.",
    perMonthShort: "/ md.", onceShort: "engang", perMonthAffix: "/md.", perMonthPre: false, cancelAnytime: "Opsig når som helst",
    keepProt: "9 ud af 10 kunder beholder beskyttelsen",
    noProtLink: "Jeg har ikke brug for beskyttelse",
    noProtTitle: "Ingen beskyttelse valgt",
    noProtBody: "Uden beskyttelse fjerner vi ikke en genoprettet profil gratis. Det sker desværre ofte.",
    addProtBack: "Tilføj beskyttelse alligevel",
    sumExpress: "Ekspresfjernelse (~6 t)", sumAfter: "derefter",
    lastChanceTitle: "Sidste chance: tilføj ekspres",
    lastChanceDesc: "Profil fjernet på ~6 t i stedet for ~24 — intet gebyr, hvis vi ikke når de 6 t.",
    afterSuccess: "Alt forfalder først efter resultat.",
    protStepLabel: "Beskyttelse · Trin 5", subtotal: "Subtotal", mostChosen: "Mest valgt", protNoneName: "Ingen beskyttelse", protNoneDesc: "Kan også vælges senere.", checkingH: "Tjekker profilen …", checkSteps: ["Profil fundet", "Anmeldelser analyseret", "Fjernelse bekræftet"], protOffContinue: "Fortsæt uden beskyttelse", delOk: "Profilen kan fjernes", expertCta: "Tal med Google-eksperterne",
    toProtect: "Videre", toCheckout: "Videre",
    totalAfter: "I alt efter resultat",
    doneCrossH: "Endnu mere for dit omdømme?",
    doneCrossSub: "Valgfrit, når som helst — vores tillæg til dit online omdømme.",
    xsOrmTitle: "Forbedr omdømmet", xsOrmDesc: "Skub negative resultater ned i Google.", xsOrmPrice: "På forespørgsel",
    xsPressTitle: "Afindeksér presseartikler", xsPressDesc: "Fjern uønskede artikler fra søgeresultaterne.", xsPressPrice: "På forespørgsel",
    asideBadges: ["GDPR-overholdelse", "Servere i EU"],
  },
  no: {
    rating: "4,9", reviewsN: "260+ anmeldelser", trustpilot: "Trustpilot",
    counterBase: 1024, counterLabel: "profiler fjernet", successRate: "98 % suksess",
    avgTime: "ø 24 t", liveNow: "aktive nå",
    activityPre: "Nettopp fjernet",
    ago: (m) => `for ${m} min siden`,
    activity: [
      { biz: "Tannlegekontor", city: "Oslo", min: 2 },
      { biz: "Frisørsalong", city: "Bergen", min: 6 },
      { biz: "Restaurant", city: "Trondheim", min: 11 },
      { biz: "Bilforhandler", city: "Stavanger", min: 14 },
      { biz: "Treningssenter", city: "Drammen", min: 19 },
      { biz: "Hotell", city: "Fredrikstad", min: 24 },
      { biz: "Skjønnhetssalong", city: "Kristiansand", min: 29 },
      { biz: "Håndverksbedrift", city: "Tromsø", min: 33 },
    ],
    quotes: [
      { q: "Vi kjempet i årevis med Google-profilen. Takket være RapidRemove og den vennlige servicen var den slettet på én enkelt dag.", a: "Martin K.", r: "Klinikkeier, Oslo" },
      { q: "Endelig sover jeg godt igjen. De tok seg av alt.", a: "Sara R.", r: "Restauranteier, Trondheim" },
      { q: "Raskt, diskré, profesjonelt — og du betaler virkelig først etter resultat.", a: "Tobias V.", r: "Daglig leder, Bergen" },
    ],
    expEyebrow: "Vil du ha det raskere?",
    expTitle: "Ekspressfjerning",
    expDesc: "Saken din havner først i køen — behandlet på ~6 timer i stedet for ~24.",
    expGuarantee: "Klarer vi ikke de 6 timene, bortfaller ekspresstillegget automatisk. Null risiko.",
    expSlots: (n) => `${n} ekspressplasser igjen i dag`,
    expAdd: "Legg til ekspress", expOn: "Ekspress aktiv",
    protEyebrow: "Anbefalt — nesten alle beholder det",
    protH: "Beskyttelse mot ny oppføring",
    protSub: "Tredjeparter — ofte konkurrenter — kan når som helst legge ut profilen din på Google igjen. Selv Google gjenoppretter profiler via nettsteds- eller brukerdata. Med beskyttelse fjerner vi den gratis igjen, permanent.",
    tierMonthlyLabel: "Månedlig", tierMonitorLabel: "Automatisk overvåking", tierLifetimeLabel: "Livsvarig", protMonitorName: "Automatisk overvåking",
    tierMonthlyDesc: "Vi overvåker månedlig og fjerner nye oppføringer gratis.",
    tierMonitorDesc: "Daglig overvåking, umiddelbar fjerning og månedsrapport. Maksimal trygghet.",
    tierLifetimeDesc: "Betal én gang, slipp å bekymre deg — permanent beskyttelse uten løpende kostnad.",
    tierMonitorBadge: "Mest valgt", tierLifetimeBadge: "Best verdi", protPopularBadge: "Valgt av 90 % av kundene",
    lifetimeMath: "Billigere enn 4 års månedsbeskyttelse — deretter betaler du aldri igjen.",
    monitorMath: "For deg som vil være helt på den sikre siden.",
    perMonthShort: "/ mnd", onceShort: "engang", perMonthAffix: "/mnd", perMonthPre: false, cancelAnytime: "Avslutt når som helst",
    keepProt: "9 av 10 kunder beholder beskyttelsen",
    noProtLink: "Jeg trenger ikke beskyttelse",
    noProtTitle: "Ingen beskyttelse valgt",
    noProtBody: "Uten beskyttelse fjerner vi ikke en ny oppføring gratis. Dessverre skjer det ofte.",
    addProtBack: "Legg til beskyttelse likevel",
    sumExpress: "Ekspressfjerning (~6 t)", sumAfter: "deretter",
    lastChanceTitle: "Siste sjanse: legg til ekspress",
    lastChanceDesc: "Profil fjernet på ~6 t i stedet for ~24 — ingen tillegg hvis vi ikke når de 6 t.",
    afterSuccess: "Alt forfaller først etter resultat.",
    protStepLabel: "Beskyttelse · Trinn 5", subtotal: "Delsum", mostChosen: "Mest valgt", protNoneName: "Ingen beskyttelse", protNoneDesc: "Kan også velges senere.", checkingH: "Sjekker profilen …", checkSteps: ["Profil funnet", "Omtaler analysert", "Fjerning bekreftet"], protOffContinue: "Fortsett uten beskyttelse", delOk: "Profilen kan fjernes", expertCta: "Snakk med Google-ekspertene",
    toProtect: "Videre", toCheckout: "Videre",
    totalAfter: "Totalt etter resultat",
    doneCrossH: "Enda mer for omdømmet ditt?",
    doneCrossSub: "Valgfritt, når som helst — våre tillegg for omdømmet ditt på nett.",
    xsOrmTitle: "Forbedre omdømmet", xsOrmDesc: "Skyv negative resultater ned i Google.", xsOrmPrice: "På forespørsel",
    xsPressTitle: "Avindekser presseartikler", xsPressDesc: "Fjern uønskede artikler fra søkeresultatene.", xsPressPrice: "På forespørsel",
    asideBadges: ["GDPR-samsvar", "Servere i EU"],
  },
};
function convFor(code) { return { ...CONV.en, ...(CONV[code] || {}) }; }

/* ---- plausible profile candidates from a typed business name (demo fallback only) ---- */
function makeCandidates(rawName, lang) {
  const name = (rawName || "").trim() || (lang === "de" ? "Ihr Unternehmen" : "Your Business");
  const base = name.replace(/,.*$/, "").trim();
  const dePool = [
    { street: "Hauptstraße 24", city: "10178 Berlin", cat: lang === "de" ? "Dienstleister" : "Service" },
    { street: "Bahnhofstraße 8", city: "80335 München", cat: lang === "de" ? "Geschäft" : "Shop" },
    { street: "Ringstraße 5", city: "1010 Wien", cat: lang === "de" ? "Filiale" : "Branch" },
  ];
  return [
    { id: "p1", name: base, cat: dePool[0].cat, rating: "2,4", reviews: 47, addr: `${dePool[0].street}, ${dePool[0].city}`, primary: true },
    { id: "p2", name: `${base} – Zweigstelle`, cat: dePool[1].cat, rating: "3,1", reviews: 12, addr: `${dePool[1].street}, ${dePool[1].city}` },
    { id: "p3", name: `${base} GmbH`, cat: dePool[2].cat, rating: "4,0", reviews: 8, addr: `${dePool[2].street}, ${dePool[2].city}` },
  ];
}

/* ---- Step indicator ---- */
function Stepper({ step, onNav }) {
  const { t } = useLang();
  const labels = t.wizard.steps;
  return (
    <div className="stepper">
      <div className="stepper-track">
        {labels.map((label, i) => {
          const clickable = !!onNav && i < step; // nur bereits erledigte Schritte sind anklickbar
          return (
          <React.Fragment key={i}>
            <div
              className={"stepper-node" + (i < step ? " done" : i === step ? " active" : "") + (clickable ? " is-nav" : "")}
              onClick={clickable ? () => onNav(i) : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNav(i); } } : undefined}
            >
              <div className="stepper-dot">{i < step ? <Icon.check /> : i + 1}</div>
              <div className="stepper-label">{label}</div>
            </div>
            {i < labels.length - 1 && (
              <div className={"stepper-bar" + (i < step ? " filled" : "")}><div className="fill"></div></div>
            )}
          </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ---- rating assessment (3 modes: möglich / empfohlen / dringend empfohlen) ---- */
const ASSESS = {
  de: { urgent: "Löschung dringend empfohlen", recommend: "Löschung empfohlen", possible: "Löschung möglich" },
  en: { urgent: "Removal strongly recommended", recommend: "Removal recommended", possible: "Removal possible" },
  es: { urgent: "Eliminación muy recomendable", recommend: "Eliminación recomendada", possible: "Eliminación posible" },
  fr: { urgent: "Suppression fortement recommandée", recommend: "Suppression recommandée", possible: "Suppression possible" },
  it: { urgent: "Rimozione fortemente consigliata", recommend: "Rimozione consigliata", possible: "Rimozione possibile" },
  nl: { urgent: "Verwijdering sterk aanbevolen", recommend: "Verwijdering aanbevolen", possible: "Verwijdering mogelijk" },
  pt: { urgent: "Remoção fortemente recomendada", recommend: "Remoção recomendada", possible: "Remoção possível" },
  ja: { urgent: "削除を強く推奨", recommend: "削除を推奨", possible: "削除が可能" },
  sv: { urgent: "Borttagning starkt rekommenderad", recommend: "Borttagning rekommenderas", possible: "Borttagning möjlig" },
  da: { urgent: "Fjernelse stærkt anbefalet", recommend: "Fjernelse anbefales", possible: "Fjernelse mulig" },
  no: { urgent: "Fjerning sterkt anbefalt", recommend: "Fjerning anbefales", possible: "Fjerning mulig" },
};
/* ---- protection nudge copy ---- */
const PROT_NUDGE = {
  de: { keep: "Ja, Schutz behalten", remove: "Schutz trotzdem entfernen" },
  en: { keep: "Yes, keep protection", remove: "Remove protection anyway" },
  es: { keep: "Sí, mantener la protección", remove: "Quitar la protección igualmente" },
  fr: { keep: "Oui, garder la protection", remove: "Retirer quand même la protection" },
  it: { keep: "Sì, mantieni la protezione", remove: "Rimuovi comunque la protezione" },
  nl: { keep: "Ja, bescherming houden", remove: "Bescherming toch verwijderen" },
  pt: { keep: "Sim, manter a proteção", remove: "Remover a proteção mesmo assim" },
  ja: { keep: "はい、保護を継続", remove: "それでも保護を外す" },
  sv: { keep: "Ja, behåll skyddet", remove: "Ta bort skyddet ändå" },
  da: { keep: "Ja, behold beskyttelsen", remove: "Fjern beskyttelsen alligevel" },
  no: { keep: "Ja, behold beskyttelsen", remove: "Fjern beskyttelsen likevel" },
};
/* ---- „Mehrere Profile löschen?" – Karte unter den Treffern öffnet eine Helpdesk-Mail ---- */
const MULTI_PROFILE = {
  de: { t: "Mehrere Profile löschen?", d: "Schreiben Sie uns – wir entfernen alle auf einmal." },
  en: { t: "Delete multiple profiles?", d: "Write to us — we'll remove them all at once." },
  es: { t: "¿Eliminar varios perfiles?", d: "Escríbanos: los eliminamos todos a la vez." },
  fr: { t: "Supprimer plusieurs profils ?", d: "Écrivez-nous — nous les supprimons tous." },
  it: { t: "Eliminare più profili?", d: "Scrivici: li rimuoviamo tutti insieme." },
  nl: { t: "Meerdere profielen verwijderen?", d: "Mail ons — we verwijderen ze allemaal." },
  pt: { t: "Excluir vários perfis?", d: "Escreva-nos — removemos todos de uma vez." },
  ja: { t: "複数のプロフィールを削除しますか？", d: "ご連絡ください ― すべて一度に削除します。" },
  sv: { t: "Ta bort flera profiler?", d: "Skriv till oss – vi tar bort alla på en gång." },
  da: { t: "Slet flere profiler?", d: "Skriv til os – vi fjerner dem alle på én gang." },
  no: { t: "Slette flere profiler?", d: "Skriv til oss – vi fjerner alle på én gang." },
};
/* „Profil ist nicht in der Liste" — Fallback-Kachel + Text auf Schritt 3 (unklar identifiziert). */
const NOT_IN_LIST = {
  de: { tile: "Profil ist nicht in der Liste?", h: "Ihr Profil wurde nicht eindeutig identifiziert", sub: "Sie können optional einen Google-Maps-Link einfügen oder jetzt fortfahren – wir identifizieren Ihr Profil dann automatisch.", linkLabel: "Genauen Google-Maps-Link einfügen (optional)", checkBtn: "Profil prüfen", contBtn: "Mit diesem Profil fortfahren" },
  en: { tile: "Profile not in the list?", h: "Your profile wasn't uniquely identified", sub: "You can optionally paste a Google Maps link, or continue now — we'll identify your profile automatically.", linkLabel: "Paste the exact Google Maps link (optional)", checkBtn: "Check profile", contBtn: "Continue with this profile" },
  es: { tile: "El perfil no está en la lista", h: "Tu perfil no se identificó con exactitud", sub: "Puedes pegar opcionalmente un enlace de Google Maps o continuar ahora; identificaremos tu perfil automáticamente.", linkLabel: "Pega el enlace exacto de Google Maps (opcional)", checkBtn: "Comprobar perfil", contBtn: "Continuar con este perfil" },
  fr: { tile: "Le profil n'est pas dans la liste", h: "Votre fiche n'a pas été identifiée précisément", sub: "Vous pouvez éventuellement coller un lien Google Maps ou continuer maintenant — nous identifierons votre fiche automatiquement.", linkLabel: "Collez le lien Google Maps exact (facultatif)", checkBtn: "Vérifier la fiche", contBtn: "Continuer avec cette fiche" },
  it: { tile: "Il profilo non è nell'elenco", h: "Il tuo profilo non è stato identificato con certezza", sub: "Puoi facoltativamente incollare un link di Google Maps o continuare ora: identificheremo il tuo profilo automaticamente.", linkLabel: "Incolla il link esatto di Google Maps (facoltativo)", checkBtn: "Verifica profilo", contBtn: "Continua con questo profilo" },
  nl: { tile: "Profiel staat niet in de lijst", h: "Uw profiel is niet eenduidig geïdentificeerd", sub: "U kunt optioneel een Google Maps-link plakken of nu doorgaan — we identificeren uw profiel dan automatisch.", linkLabel: "Plak de exacte Google Maps-link (optioneel)", checkBtn: "Profiel controleren", contBtn: "Doorgaan met dit profiel" },
  pt: { tile: "O perfil não está na lista", h: "O seu perfil não foi identificado de forma inequívoca", sub: "Pode opcionalmente colar um link do Google Maps ou continuar agora — identificamos o seu perfil automaticamente.", linkLabel: "Cole o link exato do Google Maps (opcional)", checkBtn: "Verificar perfil", contBtn: "Continuar com este perfil" },
  ja: { tile: "プロフィールが一覧にありません", h: "プロフィールを一意に特定できませんでした", sub: "任意でGoogleマップのリンクを貼り付けるか、このまま進めてください。プロフィールは自動で特定します。", linkLabel: "正確なGoogleマップのリンクを貼り付け（任意）", checkBtn: "プロフィールを確認", contBtn: "このプロフィールで続行" },
  sv: { tile: "Profilen finns inte i listan", h: "Din profil kunde inte identifieras entydigt", sub: "Du kan valfritt klistra in en Google Maps-länk eller fortsätta nu – vi identifierar din profil automatiskt.", linkLabel: "Klistra in exakt Google Maps-länk (valfritt)", checkBtn: "Kontrollera profil", contBtn: "Fortsätt med denna profil" },
  da: { tile: "Profilen er ikke på listen", h: "Din profil blev ikke entydigt identificeret", sub: "Du kan valgfrit indsætte et Google Maps-link eller fortsætte nu – vi identificerer din profil automatisk.", linkLabel: "Indsæt det præcise Google Maps-link (valgfrit)", checkBtn: "Tjek profil", contBtn: "Fortsæt med denne profil" },
  no: { tile: "Profilen er ikke i listen", h: "Profilen din ble ikke entydig identifisert", sub: "Du kan eventuelt lime inn en Google Maps-lenke eller fortsette nå – vi identifiserer profilen din automatisk.", linkLabel: "Lim inn den nøyaktige Google Maps-lenken (valgfritt)", checkBtn: "Sjekk profil", contBtn: "Fortsett med denne profilen" },
};
// Erkennt echte Google-Maps-Links (Place, maps.google, App-/Kurz-Links).
function isGMapsLink(u) {
  const s = (u || "").trim().toLowerCase();
  if (!/^https?:\/\//.test(s)) return false;
  return /(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/)/.test(s);
}
// Öffnet den Tidio-Live-Chat (robust, falls Tidio noch lädt).
function openTidioChat(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof window === "undefined") return;
  const run = () => { try { if (!window.tidioChatApi) return; if (window.tidioChatApi.show) window.tidioChatApi.show(); window.tidioChatApi.open(); } catch (err) {} };
  if (window.tidioChatApi) { run(); return; }
  const onReady = () => { run(); document.removeEventListener("tidioChat-ready", onReady); };
  document.addEventListener("tidioChat-ready", onReady);
}
/* Benanntes Event in die GTM-Datenschicht schieben. No-op auf dem Server; vor dem
   Consent geladenen GTM liegen die Events in window.dataLayer und werden verarbeitet,
   sobald GTM (nach Einwilligung) lädt. */
function gtmPush(event, data) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...(data || {}) });
}
// Telefon (nur DACH) + E-Mail als zusätzliche Kontaktwege.
function ContactLine({ lang }) {
  return (
    <div className="wz-contact">
      {lang === "de" && <a className="wc-ic" href="tel:08000900001" aria-label="Anruf 0800 09 00 00 1" title="0800 09 00 00 1"><Icon.phone size={18} /></a>}
      <a className="wc-ic" href="mailto:helpdesk@rapid-remove.com" aria-label="E-Mail" title="helpdesk@rapid-remove.com"><Icon.mail size={18} /></a>
    </div>
  );
}
/* Kontakt-Box im Checkout (höchste Absprungrate): Gesichter + alle direkten Kanäle. */
const CHECKOUT_HELP = {
  de: { title: "Fragen vor dem Abschluss?", sub: "Wir sind für Sie da und antworten in Minuten.", chat: "Live-Chat", email: "E-Mail", phone: "Anrufen" },
  en: { title: "Questions before you finish?", sub: "We're right here for you — usually a reply within minutes.", chat: "Live chat", email: "Email", phone: "Call us" },
  es: { title: "¿Dudas antes de terminar?", sub: "Estamos aquí para ayudarte: normalmente respondemos en minutos.", chat: "Chat en vivo", email: "Correo", phone: "Llamar" },
  fr: { title: "Une question avant de finaliser ?", sub: "Nous sommes là pour vous — réponse en quelques minutes en général.", chat: "Chat en direct", email: "E-mail", phone: "Appeler" },
  it: { title: "Domande prima di concludere?", sub: "Siamo qui per te — di solito rispondiamo in pochi minuti.", chat: "Chat dal vivo", email: "E-mail", phone: "Chiama" },
  nl: { title: "Vragen voordat u afrondt?", sub: "We staan direct voor u klaar — meestal antwoord binnen enkele minuten.", chat: "Livechat", email: "E-mail", phone: "Bellen" },
  pt: { title: "Dúvidas antes de finalizar?", sub: "Estamos aqui para si — normalmente respondemos em minutos.", chat: "Chat ao vivo", email: "E-mail", phone: "Ligar" },
  ja: { title: "ご購入前にご質問は？", sub: "すぐに対応します — たいてい数分で返信します。", chat: "ライブチャット", email: "メール", phone: "電話" },
  sv: { title: "Frågor innan du slutför?", sub: "Vi finns här för dig — oftast svar inom några minuter.", chat: "Livechatt", email: "E-post", phone: "Ring oss" },
  da: { title: "Spørgsmål inden du afslutter?", sub: "Vi er klar til at hjælpe — som regel svar inden for få minutter.", chat: "Livechat", email: "E-mail", phone: "Ring" },
  no: { title: "Spørsmål før du fullfører?", sub: "Vi er her for deg — vanligvis svar i løpet av minutter.", chat: "Live-chat", email: "E-post", phone: "Ring" },
};
function CheckoutHelp({ lang }) {
  const tx = CHECKOUT_HELP[lang] || CHECKOUT_HELP.en;
  const isDe = lang === "de";
  const phoneHref = isDe ? "tel:08000900001" : "tel:+4362459305300";
  const phoneTitle = isDe ? "0800 09 00 00 1" : "+43 6245 9305300";
  return (
    <div className="co-help">
      <div className="co-help-head">
        <span className="we-avas">
          <img src={asset("/assets/maximilian-hoelzl.jpg")} alt="Maximilian" width={44} height={44} loading="lazy" decoding="async" />
          <img src={asset("/assets/matthias-lang.webp")} alt="Matthias" width={44} height={44} loading="lazy" decoding="async" />
        </span>
        <div className="co-help-tx">
          <strong>{tx.title}</strong>
          <span>{tx.sub}</span>
        </div>
      </div>
      <div className="co-help-grid">
        <button type="button" className="co-ch" onClick={openTidioChat}><Icon.message size={17} /> {tx.chat}</button>
        <a className="co-ch wa" href="https://wa.me/43624593053000" target="_blank" rel="noopener noreferrer"><Icon.whatsapp size={17} /> WhatsApp</a>
        <a className="co-ch" href="mailto:helpdesk@rapid-remove.com"><Icon.mail size={17} /> {tx.email}</a>
        <a className="co-ch" href={phoneHref} title={phoneTitle}><Icon.phone size={17} /> {tx.phone}</a>
      </div>
    </div>
  );
}
// Liest den Profilnamen aus einem vollständigen Google-Maps-Link (…/maps/place/Name/…).
function extractMapsName(url) {
  try {
    const m = (url || "").match(/\/maps\/place\/([^/@?]+)/);
    if (m && m[1]) return decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
  } catch (e) {}
  return "";
}
/* ---- kleine Wizard-Labels, die früher nur DE/EN waren ---- */
const WZ_MISC = {
  de: { now: "Jetzt", afterSuccess: "nach Erfolg", continueTyped: "So fortfahren – auch wenn nicht gelistet", notMine: "Nicht Ihr Profil?", schutz: "Schutz", schutzClaim: "Kostenlose Entfernung, wenn das Profil wiederauftaucht.", ueberw: "Überwachung", ueberwTxt: "Wir überwachen täglich, ob das Profil wieder auftaucht.", inklusive: "Inklusive", expressTile: "Express (< 6 Std.)", toProtect: "Weiter zum Schutz", finish: "Abschließen", ptCancelPill: "Monatlich kündbar", ptMonthlyNote: "Kostenlose, erneute Entfernung bei Bedarf", ptMonitorNote: "Automatische Entfernung ohne Ihr Zutun", ptLifetimeNote: "Einmal zahlen, für immer Schutz mit Überwachung" },
  en: { now: "Now", afterSuccess: "after success", continueTyped: "Continue with this — even if not listed", notMine: "Not your profile?", schutz: "Protection", schutzClaim: "Free removal if the profile reappears.", ueberw: "Monitoring", ueberwTxt: "We check daily whether the profile reappears.", inklusive: "Included", expressTile: "Express (< 6 h)", toProtect: "Continue to protection", finish: "Finish", ptCancelPill: "Cancel anytime", ptMonthlyNote: "Free re-removal whenever needed", ptMonitorNote: "Automatic removal without you lifting a finger", ptLifetimeNote: "Pay once, protection forever with monitoring" },
  es: { now: "Ahora", afterSuccess: "tras el éxito", continueTyped: "Continuar así, aunque no aparezca", notMine: "¿No es tu perfil?", schutz: "Protección", schutzClaim: "Eliminación gratuita si el perfil reaparece.", ueberw: "Monitorización", ueberwTxt: "Comprobamos a diario si el perfil reaparece.", inklusive: "Incluido", expressTile: "Exprés (< 6 h)", toProtect: "Continuar a la protección", finish: "Finalizar", ptCancelPill: "Cancelable cada mes", ptMonthlyNote: "Eliminación gratuita de nuevo cuando lo necesites", ptMonitorNote: "Eliminación automática sin que tengas que hacer nada", ptLifetimeNote: "Paga una vez, protección para siempre con monitorización" },
  fr: { now: "Maintenant", afterSuccess: "après le succès", continueTyped: "Continuer ainsi, même si non répertorié", notMine: "Ce n'est pas votre fiche ?", schutz: "Protection", schutzClaim: "Suppression gratuite si la fiche réapparaît.", ueberw: "Surveillance", ueberwTxt: "Nous vérifions chaque jour si la fiche réapparaît.", inklusive: "Inclus", expressTile: "Express (< 6 h)", toProtect: "Continuer vers la protection", finish: "Finaliser", ptCancelPill: "Résiliable chaque mois", ptMonthlyNote: "Nouvelle suppression gratuite si besoin", ptMonitorNote: "Suppression automatique sans aucune action de votre part", ptLifetimeNote: "Payez une fois, protection à vie avec surveillance" },
  it: { now: "Ora", afterSuccess: "dopo il successo", continueTyped: "Continua così, anche se non elencato", notMine: "Non è il tuo profilo?", schutz: "Protezione", schutzClaim: "Rimozione gratuita se il profilo riappare.", ueberw: "Monitoraggio", ueberwTxt: "Controlliamo ogni giorno se il profilo riappare.", inklusive: "Incluso", expressTile: "Express (< 6 h)", toProtect: "Vai alla protezione", finish: "Completa", ptCancelPill: "Disdici ogni mese", ptMonthlyNote: "Nuova rimozione gratuita all'occorrenza", ptMonitorNote: "Rimozione automatica senza alcun intervento da parte tua", ptLifetimeNote: "Paghi una volta, protezione per sempre con monitoraggio" },
  nl: { now: "Nu", afterSuccess: "na succes", continueTyped: "Zo doorgaan – ook als niet vermeld", notMine: "Niet uw profiel?", schutz: "Bescherming", schutzClaim: "Gratis verwijdering als het profiel weer opduikt.", ueberw: "Monitoring", ueberwTxt: "We controleren dagelijks of het profiel weer opduikt.", inklusive: "Inbegrepen", expressTile: "Spoed (< 6 u)", toProtect: "Verder naar bescherming", finish: "Afronden", ptCancelPill: "Maandelijks opzegbaar", ptMonthlyNote: "Gratis opnieuw verwijderen wanneer nodig", ptMonitorNote: "Automatische verwijdering zonder dat u iets hoeft te doen", ptLifetimeNote: "Eenmalig betalen, voor altijd bescherming met monitoring" },
  pt: { now: "Agora", afterSuccess: "após o sucesso", continueTyped: "Continuar assim, mesmo se não listado", notMine: "Não é o seu perfil?", schutz: "Proteção", schutzClaim: "Remoção gratuita se o perfil reaparecer.", ueberw: "Monitorização", ueberwTxt: "Verificamos diariamente se o perfil reaparece.", inklusive: "Incluído", expressTile: "Expresso (< 6 h)", toProtect: "Continuar para a proteção", finish: "Finalizar", ptCancelPill: "Cancelável mensalmente", ptMonthlyNote: "Nova remoção gratuita quando necessário", ptMonitorNote: "Remoção automática sem qualquer ação da sua parte", ptLifetimeNote: "Pague uma vez, proteção para sempre com monitorização" },
  ja: { now: "現在", afterSuccess: "成功後", continueTyped: "リストになくても続行", notMine: "あなたのプロフィールではありませんか？", schutz: "保護", schutzClaim: "プロフィールが再表示されたら無料で削除します。", ueberw: "モニタリング", ueberwTxt: "プロフィールが再表示されないか毎日監視します。", inklusive: "込み", expressTile: "エクスプレス（6時間以内）", toProtect: "保護へ進む", finish: "完了", ptCancelPill: "毎月解約可能", ptMonthlyNote: "必要なときに無料で再削除", ptMonitorNote: "あなたの手間なしで自動削除", ptLifetimeNote: "一度の支払いで、モニタリング付きの永久保護" },
  sv: { now: "Nu", afterSuccess: "efter framgång", continueTyped: "Fortsätt ändå – även om den inte är listad", notMine: "Inte din profil?", schutz: "Skydd", schutzClaim: "Gratis borttagning om profilen dyker upp igen.", ueberw: "Övervakning", ueberwTxt: "Vi kontrollerar dagligen om profilen dyker upp igen.", inklusive: "Ingår", expressTile: "Express (< 6 h)", toProtect: "Vidare till skydd", finish: "Slutför", ptCancelPill: "Sägs upp månadsvis", ptMonthlyNote: "Gratis ny borttagning vid behov", ptMonitorNote: "Automatisk borttagning utan att du behöver göra något", ptLifetimeNote: "Betala en gång, skydd för alltid med övervakning" },
  da: { now: "Nu", afterSuccess: "efter succes", continueTyped: "Fortsæt alligevel – også hvis ikke anført", notMine: "Ikke din profil?", schutz: "Beskyttelse", schutzClaim: "Gratis fjernelse, hvis profilen dukker op igen.", ueberw: "Overvågning", ueberwTxt: "Vi tjekker dagligt, om profilen dukker op igen.", inklusive: "Inkluderet", expressTile: "Ekspres (< 6 t)", toProtect: "Videre til beskyttelse", finish: "Afslut", ptCancelPill: "Opsigeligt månedligt", ptMonthlyNote: "Gratis ny fjernelse efter behov", ptMonitorNote: "Automatisk fjernelse uden at du gør noget", ptLifetimeNote: "Betal én gang, beskyttelse for altid med overvågning" },
  no: { now: "Nå", afterSuccess: "etter suksess", continueTyped: "Fortsett likevel – også om ikke oppført", notMine: "Ikke profilen din?", schutz: "Beskyttelse", schutzClaim: "Gratis fjerning hvis profilen dukker opp igjen.", ueberw: "Overvåking", ueberwTxt: "Vi sjekker daglig om profilen dukker opp igjen.", inklusive: "Inkludert", expressTile: "Ekspress (< 6 t)", toProtect: "Videre til beskyttelse", finish: "Fullfør", ptCancelPill: "Kan sies opp månedlig", ptMonthlyNote: "Gratis ny fjerning ved behov", ptMonitorNote: "Automatisk fjerning uten at du gjør noe", ptLifetimeNote: "Betal én gang, beskyttelse for alltid med overvåking" },
};

function ratingAssessment(ratingStr, lang) {
  const m = ASSESS[lang] || ASSESS.en;
  // Immer „Löschung möglich" (grün) – kein Gelb/Rot mehr anzeigen.
  return { label: m.possible, tone: "ok" };
}

/* ---- Profile card ---- */
function ProfileCard({ c, selected, onClick, selectable = true, cta = false, reviewsLabel, assessOk = false }) {
  const { lang } = useLang();
  const a = c.rating != null ? ratingAssessment(c.rating, lang) : null;
  return (
    <div className={"profile-card reveal-in" + (selected ? " sel" : "")} onClick={(selectable || cta) ? onClick : undefined} style={(!selectable && !cta) ? { cursor: "default" } : null} role={cta ? "button" : undefined} tabIndex={cta ? 0 : undefined} onKeyDown={cta ? (e) => { if ((e.key === "Enter" || e.key === " ") && onClick) { e.preventDefault(); onClick(); } } : undefined}>
      <div className="profile-thumb"><Icon.building /></div>
      <div className="profile-main">
        <div className="pn">{c.name}</div>
        {c.cat && <div className="pcat">{c.cat}</div>}
        {c.rating != null && (
          <React.Fragment>
            <div className="profile-rating">
              <span className="stars sm" style={{ color: "var(--primary)" }}>{[0,1,2,3,4].map(i => <Icon.star key={i} size={14} />)}</span>
              <span className="rv">{c.rating}</span>
              <span className="rc">· {c.reviews} {reviewsLabel}</span>
            </div>
            <div className={"rate-assess " + (assessOk ? "ok" : a.tone)}>{(assessOk || a.tone === "ok") ? <Icon.checkCircle /> : <Icon.alert />} {a.label}</div>
          </React.Fragment>
        )}
        {c.addr && <div className="profile-addr"><Icon.mapPin /> {c.addr}</div>}
      </div>
      {selectable && <div className="profile-radio"><Icon.check /></div>}
      {!selectable && cta && <span className="nm-go"><Icon.arrowRight size={18} /></span>}
    </div>
  );
}

/* ===================== SOCIAL-PROOF PRIMITIVES ===================== */
function LiveCounter({ base, label, sub }) {
  const [n, setN] = React.useState(base);
  React.useEffect(() => {
    let raf, start;
    const from = Math.max(0, base - 180);
    const dur = 1100;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(from + (base - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const iv = setInterval(() => setN((x) => x + 1), 7000 + Math.random() * 4000);
    return () => { cancelAnimationFrame(raf); clearInterval(iv); };
  }, [base]);
  return (
    <div className="live-counter">
      <span className="lc-num">{n.toLocaleString("de-DE")}</span>
      <span className="lc-label">{label}</span>
      {sub && <span className="lc-sub">{sub}</span>}
    </div>
  );
}

function TrustBar() {
  const { t } = useLang();
  const conv = convFor(t.code);
  return (
    <div className="wz-trustbar">
      <div className="wzt-inner">
        <div className="wzt-item wzt-stars">
          <span className="wzt-rate">{conv.rating}</span>
          <span className="stars sm">{[0,1,2,3,4].map(i => <Icon.star key={i} size={15} />)}</span>
          <span className="wzt-muted">{conv.trustpilot} · {conv.reviewsN}</span>
        </div>
        <div className="wzt-sep"></div>
        <div className="wzt-item"><Icon.checkCircle size={16} /> <b>{(1024).toLocaleString("de-DE")}+</b> <span className="wzt-muted">{conv.counterLabel}</span></div>
        <div className="wzt-sep d-hide"></div>
        <div className="wzt-item d-hide"><Icon.shieldCheck size={16} /> <b>{conv.successRate}</b></div>
        <div className="wzt-sep d-hide"></div>
        <div className="wzt-item d-hide"><Icon.clock size={16} /> <span className="wzt-muted">{conv.avgTime}</span></div>
      </div>
    </div>
  );
}

function ActivityToast() {
  const { t } = useLang();
  const conv = convFor(t.code);
  const [i, setI] = React.useState(0);
  const [show, setShow] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    if (dismissed) return;
    let alive = true;
    const cycle = () => { if (!alive) return; setShow(true); setTimeout(() => { if (alive) setShow(false); }, 5200); };
    const first = setTimeout(cycle, 2600);
    const iv = setInterval(() => { setI((x) => (x + 1) % conv.activity.length); cycle(); }, 9000);
    return () => { alive = false; clearTimeout(first); clearInterval(iv); };
  }, [dismissed, conv.activity.length]);
  if (dismissed) return null;
  const a = conv.activity[i];
  return (
    <div className={"act-toast" + (show ? " in" : "")}>
      <div className="at-ic"><Icon.checkCircle size={20} /></div>
      <div className="at-body">
        <div className="at-top">{conv.activityPre} · <b>{a.biz}</b></div>
        <div className="at-sub">{a.city} · {conv.ago(a.min)}</div>
      </div>
      <button className="at-x" onClick={() => setDismissed(true)} aria-label="schließen"><Icon.x size={14} /></button>
    </div>
  );
}

function Testimonial({ q, tp }) {
  return (
    <div className="testi">
      <div className="testi-stars">{[0,1,2,3,4].map(i => <Icon.star key={i} size={14} />)}</div>
      <p className="testi-q">„{q.q}"</p>
      <div className="testi-a"><span className="ta-av">{q.a.charAt(0)}</span><span><b>{q.a}</b><small>{q.r}</small></span></div>
      {tp && (
        <span className="testi-tp">
          <span className="tp-sq" style={{ "--tpsq": "16px" }}><Icon.star /></span>
          <span className="testi-tp-tx">{tp}</span>
        </span>
      )}
    </div>
  );
}

/* Vanilla-JS-Ingestion-Animation (aus dem Design): erklärt, wie ein gelöschtes
   Profil wieder zurückkommt. Wird in Schritt 5 gezeigt, wenn der Schutz aus ist. */
function IngestionAnim({ lang }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) return mountIngestionAnim(ref.current, { lang: lang === "de" ? "de" : "en" });
  }, [lang]);
  return <div ref={ref} className="pt-ingest" />;
}

/* „Profil wird geprüft" — kurze Schein-Prüfung zwischen Schritt 2 und 3 (CSS-Stagger). */
function CheckingAnim({ conv }) {
  return (
    <div className="prof-check">
      <div className="pc-orb"><span className="pc-ring"></span><Icon.search size={26} /></div>
      <h1 className="wz-h" style={{ fontSize: 23, textAlign: "center", margin: 0 }}>{conv.checkingH}</h1>
      <ul className="pc-list">
        {(conv.checkSteps || []).map((s, i) => (
          <li className="pc-item" style={{ animationDelay: (0.45 + i * 0.6) + "s" }} key={i}>
            <span className="pc-chk"><Icon.check size={13} /></span> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Konfetti-Burst (reines CSS) als Overlay beim Erfolg auf Schritt 3. */
function Confetti() {
  const bits = React.useMemo(() => {
    const cols = ["#ff8000", "#16a34a", "#2b7fff", "#fbbc04", "#e23b3b", "#9b5de5"];
    return Array.from({ length: 80 }, (_, i) => ({
      left: Math.random() * 100, delay: Math.random() * 0.35, dur: 2.2 + Math.random() * 1.4,
      bg: cols[i % cols.length], w: 6 + Math.random() * 7, h: 9 + Math.random() * 7,
    }));
  }, []);
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} className="confetti-bit" style={{ left: b.left + "%", width: b.w, height: b.h, background: b.bg, animationDelay: b.delay + "s", animationDuration: b.dur + "s" }} />
      ))}
    </div>
  );
}

/* ============ WIZARD ROOT ============ */
/* ---- Router (erste Seite) + Presse-/Einzeltreffer-Flow (aus dem Design portiert).
   de + en ausformuliert; übrige Sprachen erben EN (wie im Design). ---- */
const ROUTER_COPY = {
  de: {
    routerEyebrow: "Kurz vorab", routerH: "Worum geht es?",
    routerSub: "Wählen Sie Ihren gewünschten Service aus.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Meistgewählt", t: "Google-Unternehmensprofil löschen", d: "Ihr Unternehmensprofil samt aller Bewertungen dauerhaft entfernen." },
      { id: "press", ic: "fileText", t: "Negative Presse oder Suchergebnisse", d: "Ein Artikel oder Treffer in der Google-Suche, der verschwinden soll." },
      { id: "unsure", ic: "help", t: "Nicht sicher", d: "Zwei kurze Fragen — wir leiten Sie weiter." },
    ],
    qH: "Zwei kurze Fragen",
    q1: "Geht es um Ihr eigenes Google-Unternehmensprofil?",
    q1yes: "Ja, um mein Unternehmensprofil", q1no: "Nein, um etwas anderes im Netz",
    q2: "Handelt es sich um einen Presseartikel oder eine fremde Website?",
    q2yes: "Ja, Presse / fremde Website", q2no: "Nein, eher Bewertungen / mein Profil",
    pressIntakeH: "Negative Presse oder Suchergebnisse",
    pressIntakeSub: "Wir prüfen kostenlos, ob eine Auslistung in Frage kommt, und übernehmen die Antragstellung. Die rechtliche Einzelfallprüfung erfolgt durch unsere Partnerkanzlei.",
    pressUrl: "Link zum Artikel / Suchergebnis", pressAddUrl: "Weiteren Link hinzufügen", pressEmail: "Ihre E-Mail", pressDesc: "Worum geht es? (kurz)",
    pressBtn: "Kostenlose Prüfung anfragen",
    pressPriceH: "Zur Orientierung: 1.500 – 4.000 € pro Artikel",
    pressPriceSub: "Je nach Schwierigkeit des Falls — bei mehreren Artikeln sind Mengenpreise möglich. Diese Angabe dient nur Ihrer Einordnung vorab: Ein verbindliches Angebot erhalten Sie erst nach der kostenlosen Prüfung, Kosten entstehen nur bei Beauftragung.",
    pressAltQ: "Falls sich das Suchergebnis nicht entfernen lässt:",
    pressAltHint: "Nicht jeder Treffer kann gelöscht werden — z. B. wegen Pressefreiheit. Als Alternative können wir den Treffer mit positiven Inhalten von Seite 1 der Google-Suche verdrängen, sodass ihn kaum noch jemand sieht. Sollen wir Ihnen in dem Fall dazu ein Angebot machen?",
    pressAltReq: "Bitte beantworten Sie noch die Frage oben, dann können Sie die Prüfung anfragen.",
    pressAltYes: "Ja, Alternative anbieten", pressAltNo: "Nein, nur Entfernung",
    pressDoneH: "Anfrage erhalten — wir melden uns.", pressDoneSub: "Wir prüfen Ihren Fall kostenlos und melden uns mit einer ehrlichen Einschätzung. Keine Kosten, keine Verpflichtung.",
  },
  en: {
    routerEyebrow: "Quick start", routerH: "What's this about?",
    routerSub: "Choose your desired service.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Most chosen", t: "Delete your Google business profile", d: "Permanently remove your business profile and all its reviews." },
      { id: "press", ic: "fileText", t: "Negative press or search results", d: "An article or result in Google search you want gone." },
      { id: "unsure", ic: "help", t: "Not sure", d: "Two quick questions — we'll route you." },
    ],
    qH: "Two quick questions",
    q1: "Is this about your own Google business profile?",
    q1yes: "Yes, my business profile", q1no: "No, something else online",
    q2: "Is it a press article or a third-party website?",
    q2yes: "Yes, press / third-party site", q2no: "No, more like reviews / my profile",
    pressIntakeH: "Negative press or search results",
    pressIntakeSub: "We check for free whether de-indexing is an option and handle the application. The legal case-by-case review is done by our partner law firm.",
    pressUrl: "Link to the article / result", pressAddUrl: "Add another link", pressEmail: "Your email", pressDesc: "What's it about? (briefly)",
    pressBtn: "Request a free assessment",
    pressPriceH: "For orientation: €1,500 – €4,000 per article",
    pressPriceSub: "Depending on the difficulty of the case — volume pricing is available for multiple articles. This range is only meant to help you decide upfront: you'll receive a binding quote only after the free assessment, and you pay nothing unless you engage us.",
    pressAltQ: "If the search result can't be removed:",
    pressAltHint: "Not every result can be removed — e.g. because of press freedom. As an alternative, we can push the result off page 1 of Google Search with positive content, so hardly anyone sees it anymore. Should we send you a quote for that if removal fails?",
    pressAltReq: "Please answer the question above first — then you can request the assessment.",
    pressAltYes: "Yes, offer the alternative", pressAltNo: "No, removal only",
    pressDoneH: "Request received — we'll be in touch.", pressDoneSub: "We assess your case for free and get back to you with an honest opinion. No cost, no obligation.",
  },
  es: {
    routerEyebrow: "Antes de empezar", routerH: "¿De qué se trata?",
    routerSub: "Elija el servicio que desea.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Más elegido", t: "Eliminar tu perfil de empresa de Google", d: "Eliminar de forma permanente tu perfil de empresa y todas sus reseñas." },
      { id: "press", ic: "fileText", t: "Prensa negativa o resultados de búsqueda", d: "Un artículo o resultado en la búsqueda de Google que quiere que desaparezca." },
      { id: "unsure", ic: "help", t: "No estoy seguro", d: "Dos preguntas rápidas — le orientamos." },
    ],
    qH: "Dos preguntas rápidas",
    q1: "¿Se trata de su propio perfil de empresa de Google?",
    q1yes: "Sí, de mi perfil de empresa", q1no: "No, de otra cosa en internet",
    q2: "¿Se trata de un artículo de prensa o de un sitio web ajeno?",
    q2yes: "Sí, prensa / sitio ajeno", q2no: "No, más bien reseñas / mi perfil",
    pressIntakeH: "Prensa negativa o resultados de búsqueda",
    pressIntakeSub: "Comprobamos gratis si es posible la desindexación y nos encargamos de la solicitud. La revisión jurídica de cada caso la realiza nuestro despacho asociado.",
    pressUrl: "Enlace al artículo / resultado", pressAddUrl: "Añadir otro enlace", pressEmail: "Su correo electrónico", pressDesc: "¿De qué se trata? (brevemente)",
    pressBtn: "Solicitar una evaluación gratuita",
    pressPriceH: "Como orientación: 1.500 – 4.000 € por artículo",
    pressPriceSub: "Según la dificultad del caso — con varios artículos es posible un precio por volumen. Esta indicación solo sirve para su orientación previa: recibirá una oferta vinculante únicamente tras la evaluación gratuita y solo paga si nos contrata.",
    pressAltQ: "Si el resultado de búsqueda no se puede eliminar:",
    pressAltHint: "No todos los resultados se pueden eliminar — p. ej. por la libertad de prensa. Como alternativa, podemos desplazar el resultado de la página 1 de la búsqueda de Google con contenido positivo, de modo que casi nadie lo vea. ¿Quiere que le hagamos una oferta para ese caso?",
    pressAltReq: "Responda primero la pregunta de arriba, entonces podrá solicitar la evaluación.",
    pressAltYes: "Sí, ofrecer la alternativa", pressAltNo: "No, solo eliminación",
    pressDoneH: "Solicitud recibida — le contactaremos.", pressDoneSub: "Evaluamos su caso gratis y le respondemos con una opinión honesta. Sin coste, sin compromiso.",
  },
  fr: {
    routerEyebrow: "Pour commencer", routerH: "De quoi s'agit-il ?",
    routerSub: "Choisissez le service souhaité.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Le plus choisi", t: "Supprimer votre fiche d'établissement Google", d: "Supprimer définitivement votre fiche d'établissement et tous ses avis." },
      { id: "press", ic: "fileText", t: "Presse négative ou résultats de recherche", d: "Un article ou un résultat dans la recherche Google que vous voulez voir disparaître." },
      { id: "unsure", ic: "help", t: "Je ne sais pas", d: "Deux questions rapides — nous vous orientons." },
    ],
    qH: "Deux questions rapides",
    q1: "S'agit-il de votre propre fiche d'établissement Google ?",
    q1yes: "Oui, ma fiche d'établissement", q1no: "Non, autre chose en ligne",
    q2: "S'agit-il d'un article de presse ou d'un site tiers ?",
    q2yes: "Oui, presse / site tiers", q2no: "Non, plutôt des avis / ma fiche",
    pressIntakeH: "Presse négative ou résultats de recherche",
    pressIntakeSub: "Nous vérifions gratuitement si un déréférencement est envisageable et nous nous chargeons de la demande. L'examen juridique au cas par cas est réalisé par notre cabinet partenaire.",
    pressUrl: "Lien vers l'article / le résultat", pressAddUrl: "Ajouter un autre lien", pressEmail: "Votre e-mail", pressDesc: "De quoi s'agit-il ? (brièvement)",
    pressBtn: "Demander une évaluation gratuite",
    pressPriceH: "À titre indicatif : 1 500 – 4 000 € par article",
    pressPriceSub: "Selon la difficulté du dossier — un tarif dégressif est possible pour plusieurs articles. Cette indication ne sert qu'à vous situer en amont : vous ne recevez une offre ferme qu'après l'évaluation gratuite et ne payez que si vous nous mandatez.",
    pressAltQ: "Si le résultat de recherche ne peut pas être supprimé :",
    pressAltHint: "Tous les résultats ne peuvent pas être supprimés — par exemple en raison de la liberté de la presse. En alternative, nous pouvons reléguer le résultat hors de la page 1 de Google avec du contenu positif, de sorte que presque personne ne le voie. Souhaitez-vous une offre pour cette solution si la suppression échoue ?",
    pressAltReq: "Veuillez d'abord répondre à la question ci-dessus, puis vous pourrez demander l'évaluation.",
    pressAltYes: "Oui, proposer l'alternative", pressAltNo: "Non, suppression uniquement",
    pressDoneH: "Demande reçue — nous vous recontactons.", pressDoneSub: "Nous évaluons votre cas gratuitement et revenons vers vous avec un avis honnête. Sans frais, sans engagement.",
  },
  it: {
    routerEyebrow: "Per iniziare", routerH: "Di cosa si tratta?",
    routerSub: "Scelga il servizio desiderato.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Più scelto", t: "Eliminare il tuo profilo aziendale Google", d: "Rimuovere definitivamente il tuo profilo aziendale e tutte le sue recensioni." },
      { id: "press", ic: "fileText", t: "Stampa negativa o risultati di ricerca", d: "Un articolo o un risultato nella ricerca Google che vuole far sparire." },
      { id: "unsure", ic: "help", t: "Non sono sicuro", d: "Due brevi domande — la indirizziamo noi." },
    ],
    qH: "Due brevi domande",
    q1: "Si tratta del suo profilo aziendale Google?",
    q1yes: "Sì, il mio profilo aziendale", q1no: "No, qualcos'altro online",
    q2: "Si tratta di un articolo di stampa o di un sito di terzi?",
    q2yes: "Sì, stampa / sito di terzi", q2no: "No, piuttosto recensioni / il mio profilo",
    pressIntakeH: "Stampa negativa o risultati di ricerca",
    pressIntakeSub: "Verifichiamo gratuitamente se è possibile una deindicizzazione e ci occupiamo della richiesta. L'esame legale caso per caso è svolto dal nostro studio legale partner.",
    pressUrl: "Link all'articolo / risultato", pressAddUrl: "Aggiungi un altro link", pressEmail: "La sua e-mail", pressDesc: "Di cosa si tratta? (in breve)",
    pressBtn: "Richiedi una valutazione gratuita",
    pressPriceH: "Indicativamente: 1.500 – 4.000 € per articolo",
    pressPriceSub: "A seconda della difficoltà del caso — per più articoli sono possibili prezzi per volume. Questa indicazione serve solo a orientarla in anticipo: riceverà un'offerta vincolante solo dopo la valutazione gratuita e paga solo se ci incarica.",
    pressAltQ: "Se il risultato di ricerca non può essere rimosso:",
    pressAltHint: "Non tutti i risultati possono essere rimossi — ad es. per la libertà di stampa. In alternativa possiamo spostare il risultato fuori dalla pagina 1 di Google con contenuti positivi, così che quasi nessuno lo veda più. Vuole che le facciamo un'offerta in tal caso?",
    pressAltReq: "Risponda prima alla domanda qui sopra, poi potrà richiedere la valutazione.",
    pressAltYes: "Sì, proponete l'alternativa", pressAltNo: "No, solo rimozione",
    pressDoneH: "Richiesta ricevuta — la ricontatteremo.", pressDoneSub: "Valutiamo il suo caso gratuitamente e le rispondiamo con un parere onesto. Nessun costo, nessun obbligo.",
  },
  nl: {
    routerEyebrow: "Om te beginnen", routerH: "Waar gaat het om?",
    routerSub: "Kies de gewenste dienst.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Meest gekozen", t: "Uw Google-bedrijfsprofiel verwijderen", d: "Uw bedrijfsprofiel en alle reviews definitief verwijderen." },
      { id: "press", ic: "fileText", t: "Negatieve pers of zoekresultaten", d: "Een artikel of resultaat in Google dat u wilt laten verdwijnen." },
      { id: "unsure", ic: "help", t: "Niet zeker", d: "Twee korte vragen — wij wijzen u de weg." },
    ],
    qH: "Twee korte vragen",
    q1: "Gaat het om uw eigen Google-bedrijfsprofiel?",
    q1yes: "Ja, om mijn bedrijfsprofiel", q1no: "Nee, om iets anders online",
    q2: "Gaat het om een persartikel of een externe website?",
    q2yes: "Ja, pers / externe site", q2no: "Nee, eerder reviews / mijn profiel",
    pressIntakeH: "Negatieve pers of zoekresultaten",
    pressIntakeSub: "Wij controleren gratis of de-indexering mogelijk is en verzorgen de aanvraag. De juridische beoordeling per geval gebeurt door ons partnerkantoor.",
    pressUrl: "Link naar het artikel / resultaat", pressAddUrl: "Nog een link toevoegen", pressEmail: "Uw e-mail", pressDesc: "Waar gaat het om? (kort)",
    pressBtn: "Gratis beoordeling aanvragen",
    pressPriceH: "Ter oriëntatie: 1.500 – 4.000 € per artikel",
    pressPriceSub: "Afhankelijk van de moeilijkheid van de zaak — bij meerdere artikelen is een staffelprijs mogelijk. Deze indicatie dient alleen ter oriëntatie vooraf: u ontvangt pas na de gratis beoordeling een bindende offerte en betaalt alleen bij opdracht.",
    pressAltQ: "Als het zoekresultaat niet verwijderd kan worden:",
    pressAltHint: "Niet elk resultaat kan worden verwijderd — bijv. vanwege persvrijheid. Als alternatief kunnen we het resultaat met positieve content van pagina 1 van Google verdringen, zodat bijna niemand het nog ziet. Zullen we u daarvoor een offerte sturen als verwijdering niet lukt?",
    pressAltReq: "Beantwoord eerst de vraag hierboven, dan kunt u de beoordeling aanvragen.",
    pressAltYes: "Ja, alternatief aanbieden", pressAltNo: "Nee, alleen verwijdering",
    pressDoneH: "Aanvraag ontvangen — we nemen contact op.", pressDoneSub: "We beoordelen uw zaak gratis en komen bij u terug met een eerlijk oordeel. Geen kosten, geen verplichting.",
  },
  pt: {
    routerEyebrow: "Para começar", routerH: "Do que se trata?",
    routerSub: "Escolha o serviço pretendido.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Mais escolhido", t: "Eliminar o seu perfil de empresa do Google", d: "Remover de forma permanente o seu perfil de empresa e todas as suas avaliações." },
      { id: "press", ic: "fileText", t: "Imprensa negativa ou resultados de pesquisa", d: "Um artigo ou resultado na pesquisa do Google que quer ver desaparecer." },
      { id: "unsure", ic: "help", t: "Não tenho a certeza", d: "Duas perguntas rápidas — nós encaminhamos." },
    ],
    qH: "Duas perguntas rápidas",
    q1: "Trata-se do seu próprio perfil de empresa do Google?",
    q1yes: "Sim, do meu perfil de empresa", q1no: "Não, de outra coisa online",
    q2: "Trata-se de um artigo de imprensa ou de um site de terceiros?",
    q2yes: "Sim, imprensa / site de terceiros", q2no: "Não, antes avaliações / o meu perfil",
    pressIntakeH: "Imprensa negativa ou resultados de pesquisa",
    pressIntakeSub: "Verificamos gratuitamente se a desindexação é possível e tratamos do pedido. A análise jurídica caso a caso é feita pela nossa sociedade de advogados parceira.",
    pressUrl: "Link para o artigo / resultado", pressAddUrl: "Adicionar outro link", pressEmail: "O seu e-mail", pressDesc: "Do que se trata? (brevemente)",
    pressBtn: "Pedir uma avaliação gratuita",
    pressPriceH: "Como orientação: 1.500 – 4.000 € por artigo",
    pressPriceSub: "Consoante a dificuldade do caso — com vários artigos é possível um preço por volume. Esta indicação serve apenas para a sua orientação prévia: só recebe uma proposta vinculativa após a avaliação gratuita e só paga se nos contratar.",
    pressAltQ: "Se o resultado de pesquisa não puder ser removido:",
    pressAltHint: "Nem todos os resultados podem ser removidos — p. ex. devido à liberdade de imprensa. Em alternativa, podemos empurrar o resultado para fora da página 1 do Google com conteúdos positivos, de modo que quase ninguém o veja. Quer que lhe façamos uma proposta para esse caso?",
    pressAltReq: "Responda primeiro à pergunta acima e poderá então pedir a avaliação.",
    pressAltYes: "Sim, propor a alternativa", pressAltNo: "Não, apenas remoção",
    pressDoneH: "Pedido recebido — entraremos em contacto.", pressDoneSub: "Avaliamos o seu caso gratuitamente e respondemos com uma opinião honesta. Sem custos, sem compromisso.",
  },
  ja: {
    routerEyebrow: "はじめに", routerH: "どのようなご相談ですか？",
    routerSub: "ご希望のサービスをお選びください。",
    tiles: [
      { id: "delete", ic: "trash", badge: "最も選ばれています", t: "Googleビジネスプロフィールを削除", d: "あなたのビジネスプロフィールとすべての口コミを完全に削除します。" },
      { id: "press", ic: "fileText", t: "ネガティブな記事・検索結果", d: "Google検索に表示される、消したい記事や検索結果。" },
      { id: "unsure", ic: "help", t: "わからない", d: "簡単な2つの質問で、最適なサービスへご案内します。" },
    ],
    qH: "簡単な2つの質問",
    q1: "ご自身のGoogleビジネスプロフィールについてですか？",
    q1yes: "はい、自分のビジネスプロフィールです", q1no: "いいえ、ネット上の別のものです",
    q2: "報道記事や第三者のウェブサイトについてですか？",
    q2yes: "はい、報道・第三者サイトです", q2no: "いいえ、口コミ・自分のプロフィールです",
    pressIntakeH: "ネガティブな記事・検索結果",
    pressIntakeSub: "検索結果からの削除（デインデックス）が可能かどうかを無料で確認し、申請を代行します。個別案件の法的審査は提携法律事務所が行います。",
    pressUrl: "記事・検索結果へのリンク", pressAddUrl: "リンクを追加", pressEmail: "メールアドレス", pressDesc: "どのような内容ですか？（簡単に）",
    pressBtn: "無料診断を申し込む",
    pressPriceH: "目安：1記事あたり 1,500～4,000 €",
    pressPriceSub: "案件の難易度によります。複数の記事の場合はボリューム価格も可能です。この金額は事前の目安にすぎません。正式なお見積もりは無料診断の後にお渡しし、ご依頼いただいた場合のみ費用が発生します。",
    pressAltQ: "検索結果を削除できない場合：",
    pressAltHint: "すべての結果を削除できるわけではありません（例：報道の自由のため）。代替策として、ポジティブなコンテンツでその結果をGoogle検索1ページ目から押し下げ、ほとんど見られないようにできます。削除できない場合、その提案を差し上げましょうか？",
    pressAltReq: "先に上記の質問にお答えいただくと、診断を申し込めます。",
    pressAltYes: "はい、代替策も提案してほしい", pressAltNo: "いいえ、削除のみ",
    pressDoneH: "お申し込みを受け付けました — ご連絡します。", pressDoneSub: "あなたの案件を無料で診断し、率直な見解をお伝えします。費用も義務もありません。",
  },
  sv: {
    routerEyebrow: "Innan vi börjar", routerH: "Vad gäller det?",
    routerSub: "Välj den tjänst du vill ha.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Mest vald", t: "Ta bort din Google-företagsprofil", d: "Ta bort din företagsprofil och alla dess recensioner permanent." },
      { id: "press", ic: "fileText", t: "Negativ press eller sökresultat", d: "En artikel eller ett resultat i Google-sökningen som du vill få bort." },
      { id: "unsure", ic: "help", t: "Osäker", d: "Två snabba frågor — vi vägleder dig." },
    ],
    qH: "Två snabba frågor",
    q1: "Gäller det din egen Google-företagsprofil?",
    q1yes: "Ja, min företagsprofil", q1no: "Nej, något annat på nätet",
    q2: "Rör det sig om en pressartikel eller en extern webbplats?",
    q2yes: "Ja, press / extern webbplats", q2no: "Nej, snarare recensioner / min profil",
    pressIntakeH: "Negativ press eller sökresultat",
    pressIntakeSub: "Vi kontrollerar kostnadsfritt om avindexering är möjlig och sköter ansökan. Den juridiska bedömningen från fall till fall görs av vår partnerbyrå.",
    pressUrl: "Länk till artikeln / resultatet", pressAddUrl: "Lägg till en länk till", pressEmail: "Din e-post", pressDesc: "Vad gäller det? (kort)",
    pressBtn: "Begär en kostnadsfri bedömning",
    pressPriceH: "Som riktlinje: 1 500 – 4 000 € per artikel",
    pressPriceSub: "Beroende på ärendets svårighetsgrad — för flera artiklar är volympris möjligt. Denna uppgift är endast till för din vägledning i förväg: du får ett bindande erbjudande först efter den kostnadsfria bedömningen och betalar bara om du anlitar oss.",
    pressAltQ: "Om sökresultatet inte kan tas bort:",
    pressAltHint: "Alla resultat kan inte tas bort — t.ex. på grund av pressfriheten. Som alternativ kan vi tränga undan resultatet från sida 1 i Google med positivt innehåll, så att nästan ingen längre ser det. Vill du att vi skickar ett erbjudande om det om borttagning inte lyckas?",
    pressAltReq: "Svara först på frågan ovan, sedan kan du begära bedömningen.",
    pressAltYes: "Ja, erbjud alternativet", pressAltNo: "Nej, endast borttagning",
    pressDoneH: "Förfrågan mottagen — vi hör av oss.", pressDoneSub: "Vi bedömer ditt ärende kostnadsfritt och återkommer med en ärlig bedömning. Ingen kostnad, ingen förpliktelse.",
  },
  da: {
    routerEyebrow: "Inden vi går i gang", routerH: "Hvad drejer det sig om?",
    routerSub: "Vælg den ønskede ydelse.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Oftest valgt", t: "Slet din Google-virksomhedsprofil", d: "Fjern din virksomhedsprofil og alle dens anmeldelser permanent." },
      { id: "press", ic: "fileText", t: "Negativ presse eller søgeresultater", d: "En artikel eller et resultat i Google-søgningen, som du vil have væk." },
      { id: "unsure", ic: "help", t: "Ikke sikker", d: "To korte spørgsmål — så guider vi dig." },
    ],
    qH: "To korte spørgsmål",
    q1: "Drejer det sig om din egen Google-virksomhedsprofil?",
    q1yes: "Ja, min virksomhedsprofil", q1no: "Nej, noget andet på nettet",
    q2: "Er det en presseartikel eller et tredjeparts-website?",
    q2yes: "Ja, presse / tredjeparts-website", q2no: "Nej, snarere anmeldelser / min profil",
    pressIntakeH: "Negativ presse eller søgeresultater",
    pressIntakeSub: "Vi tjekker gratis, om af-indeksering er en mulighed, og står for ansøgningen. Den juridiske vurdering fra sag til sag foretages af vores partneradvokat.",
    pressUrl: "Link til artiklen / resultatet", pressAddUrl: "Tilføj et link mere", pressEmail: "Din e-mail", pressDesc: "Hvad drejer det sig om? (kort)",
    pressBtn: "Anmod om en gratis vurdering",
    pressPriceH: "Til orientering: 1.500 – 4.000 € pr. artikel",
    pressPriceSub: "Afhængigt af sagens sværhedsgrad — ved flere artikler er mængderabat mulig. Denne angivelse er kun til din orientering på forhånd: du får først et bindende tilbud efter den gratis vurdering og betaler kun, hvis du giver os opgaven.",
    pressAltQ: "Hvis søgeresultatet ikke kan fjernes:",
    pressAltHint: "Ikke alle resultater kan fjernes — f.eks. på grund af pressefriheden. Som alternativ kan vi skubbe resultatet væk fra side 1 i Google med positivt indhold, så næsten ingen ser det længere. Skal vi sende dig et tilbud på det, hvis fjernelse ikke lykkes?",
    pressAltReq: "Besvar først spørgsmålet ovenfor, så kan du anmode om vurderingen.",
    pressAltYes: "Ja, tilbyd alternativet", pressAltNo: "Nej, kun fjernelse",
    pressDoneH: "Anmodning modtaget — vi vender tilbage.", pressDoneSub: "Vi vurderer din sag gratis og vender tilbage med en ærlig vurdering. Ingen omkostninger, ingen forpligtelse.",
  },
  no: {
    routerEyebrow: "Før vi starter", routerH: "Hva gjelder det?",
    routerSub: "Velg ønsket tjeneste.",
    tiles: [
      { id: "delete", ic: "trash", badge: "Oftest valgt", t: "Slett Google-bedriftsprofilen din", d: "Fjern bedriftsprofilen din og alle vurderingene permanent." },
      { id: "press", ic: "fileText", t: "Negativ presse eller søkeresultater", d: "En artikkel eller et resultat i Google-søket som du vil bli kvitt." },
      { id: "unsure", ic: "help", t: "Usikker", d: "To korte spørsmål — så veileder vi deg." },
    ],
    qH: "To korte spørsmål",
    q1: "Gjelder det din egen Google-bedriftsprofil?",
    q1yes: "Ja, bedriftsprofilen min", q1no: "Nei, noe annet på nettet",
    q2: "Dreier det seg om en pressartikkel eller et tredjeparts nettsted?",
    q2yes: "Ja, presse / tredjeparts nettsted", q2no: "Nei, heller vurderinger / profilen min",
    pressIntakeH: "Negativ presse eller søkeresultater",
    pressIntakeSub: "Vi sjekker gratis om avindeksering er mulig, og tar oss av søknaden. Den juridiske vurderingen fra sak til sak gjøres av vårt partneradvokatfirma.",
    pressUrl: "Lenke til artikkelen / resultatet", pressAddUrl: "Legg til en lenke til", pressEmail: "Din e-post", pressDesc: "Hva gjelder det? (kort)",
    pressBtn: "Be om en gratis vurdering",
    pressPriceH: "Til orientering: 1 500 – 4 000 € per artikkel",
    pressPriceSub: "Avhengig av hvor vanskelig saken er — ved flere artikler er mengdepris mulig. Denne angivelsen er bare ment som en pekepinn på forhånd: du får et bindende tilbud først etter den gratis vurderingen, og betaler bare hvis du gir oss oppdraget.",
    pressAltQ: "Hvis søkeresultatet ikke kan fjernes:",
    pressAltHint: "Ikke alle resultater kan fjernes — f.eks. på grunn av pressefriheten. Som alternativ kan vi skyve resultatet bort fra side 1 i Google med positivt innhold, slik at nesten ingen ser det lenger. Skal vi sende deg et tilbud på det hvis fjerning ikke lykkes?",
    pressAltReq: "Svar først på spørsmålet ovenfor, så kan du be om vurderingen.",
    pressAltYes: "Ja, tilby alternativet", pressAltNo: "Nei, bare fjerning",
    pressDoneH: "Forespørsel mottatt — vi tar kontakt.", pressDoneSub: "Vi vurderer saken din gratis og kommer tilbake med en ærlig vurdering. Ingen kostnad, ingen forpliktelse.",
  },
};
const routerCopy = (code) => ROUTER_COPY[code] || ROUTER_COPY.en;

function Wizard({ initialName, initialProfile, onExit, onOrm, onDeindex, onSelectProfile }) {
  const { t, lang } = useLang();
  const w = t.wizard;
  const wm = WZ_MISC[t.code] || WZ_MISC.en;
  const nil = NOT_IN_LIST[t.code] || NOT_IN_LIST.en;
  const conv = convFor(t.code);
  const p = profileFor(lang);
  // Mit einem in der Live-Suche gewählten Profil starten wir direkt auf der
  // Machbarkeits-Karte (Schritt 3 / Index 2) – ohne erneute Profilsuche.
  const [step, setStep] = React.useState(initialProfile ? 1 : 0);
  const [name, setName] = React.useState(initialName || "");
  const [candidates, setCandidates] = React.useState(() =>
    initialProfile ? [{ ...initialProfile, id: "p1", primary: true }] : makeCandidates(initialName, lang));
  const [phase, setPhase] = React.useState(initialProfile ? "checking" : "searching"); // searching | found | checking
  const [confetti, setConfetti] = React.useState(false);
  const [profileLink, setProfileLink] = React.useState("");
  const [multi, setMulti] = React.useState(initialProfile ? false : true);
  const [selectedId, setSelectedId] = React.useState("p1");
  const [service, setService] = React.useState(null);
  const [express, setExpress] = React.useState(false);
  const [protection, setProtection] = React.useState("monthly"); // null | monthly | monitor | lifetime — Schutz default ON
  // Schutz-Schritt: offener Info-Tooltip. Hier auf Komponentenebene (Steps werden via Body() inline gerendert → Hooks müssen stabil sein).
  const [ptInfo, setPtInfo] = React.useState(null);
  React.useEffect(() => {
    if (!ptInfo) return;
    const close = () => setPtInfo(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [ptInfo]);
  const [contact, setContact] = React.useState({ name: "", email: "", phone: "", company: initialName || "", url: "" });
  const [errors, setErrors] = React.useState({});
  const [processing, setProcessing] = React.useState(false);
  const [agbOk, setAgbOk] = React.useState(false);
  const [faggOk, setFaggOk] = React.useState(false); // § 18 FAGG: vorzeitiger Leistungsbeginn / Widerrufsverzicht
  const [orderId] = React.useState(() => "RR-" + Math.floor(100000 + Math.random() * 899999));
  const [checkId] = React.useState(() => "CHK-" + Math.floor(100000 + Math.random() * 899999));
  // Erste Seite (Router): nur zeigen, wenn der Wizard OHNE Profil/Namen geöffnet wurde
  // (generischer „Gratis-Check"). Mit Hero-Suche bleibt der Lösch-Flow unverändert.
  const rc = routerCopy(t.code);
  const [routed, setRouted] = React.useState(!!(initialName && initialName.trim()) || !!initialProfile);
  const [pressMode, setPressMode] = React.useState(false);
  const [unsureStep, setUnsureStep] = React.useState(0);
  const [pressData, setPressData] = React.useState({ urls: [""], email: "", desc: "", orm: "" });
  const [pressDone, setPressDone] = React.useState(false);
  const checkSent = React.useRef(false);
  const checkedRef = React.useRef(null); // Schlüssel des zuletzt geprüften Profils — keine Wiederholung bei gleicher Wahl
  const bodyRef = React.useRef(null);
  // Live-Suche in Schritt 1 (wie in der Kopfzeile): tippen schlägt echte Profile vor.
  const [sug, setSug] = React.useState([]);
  const [acOpen, setAcOpen] = React.useState(false);
  const acRef = React.useRef(null);
  const nameRef = React.useRef(null);

  React.useEffect(() => { if (bodyRef.current) window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // Schritt 4 (Leistung) wird immer ohne Vorauswahl betreten — auch beim Zurückkommen.
  React.useEffect(() => { if (step === 3) setService(null); }, [step]);

  // GTM-/dataLayer-Funnel-Events. initiate_checkout beim Öffnen des Wizards
  // (= Aufruf der Profil-prüfen-Ansicht); die Schritt-Events einmalig pro Sitzung.
  const gtmFired = React.useRef({});
  React.useEffect(() => { gtmPush("initiate_checkout"); }, []);
  React.useEffect(() => {
    if (step === 3 && !gtmFired.current.check_profile) { gtmFired.current.check_profile = true; gtmPush("check_profile"); }      // „Schritt 4" (Leistung wählen)
    if (step === 5 && !gtmFired.current.add_to_cart) { gtmFired.current.add_to_cart = true; gtmPush("add_to_cart"); }            // „Schritt 6" (Checkout)
  }, [step]);

  // Autofokus auf das Namensfeld nur am Desktop — am Handy soll sich die Tastatur
  // nicht ungefragt öffnen (sie erscheint erst, wenn man das Feld antippt).
  React.useEffect(() => {
    if (step !== 0 || !nameRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 620px)").matches) return;
    nameRef.current.focus();
  }, [step]);

  // Von der Startseite mit konkretem Profil: kurze Prüf-Animation, dann Schritt 3 (Bestätigen) + Konfetti.
  React.useEffect(() => {
    if (initialProfile) {
      const id = setTimeout(() => {
        checkedRef.current = initialProfile.placeId || initialProfile.name;
        go(3); // eindeutiges Profil → Schritt 3 entfällt, direkt zu Schritt 4
        setPhase("found");
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }, 2400);
      return () => clearTimeout(id);
    }
    if (initialName && initialName.trim()) { startSearch(initialName); }
    // eslint-disable-next-line
  }, []);

  // Entprellte Profilvorschläge, solange wir auf Schritt 1 (Namenseingabe) sind.
  React.useEffect(() => {
    if (step !== 0) { setSug([]); return; }
    const q = (name || "").trim();
    if (q.length < 2) { setSug([]); return; }
    let alive = true;
    const id = setTimeout(() => {
      searchProfiles(q, lang).then((r) => { if (alive) setSug(r || []); }).catch(() => { if (alive) setSug([]); });
    }, 280);
    return () => { alive = false; clearTimeout(id); };
  }, [name, lang, step]);
  React.useEffect(() => {
    const onDoc = (e) => { if (acRef.current && !acRef.current.contains(e.target)) setAcOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

  // Gewähltes Profil an die App melden → placeId landet als ?p= in der URL (teilbar).
  const selPlaceId = (selected && selected.placeId) || "";
  React.useEffect(() => { if (onSelectProfile) onSelectProfile(selPlaceId); }, [selPlaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSearch = (n) => {
    const nm = (n != null ? n : name);
    if (!nm.trim()) return;
    setName(nm);
    setContact((c) => ({ ...c, company: nm }));
    setPhase("searching");
    setStep(1);
    runSearch(nm);
  };

  // Echte Google-Places-Suche; Mindest-Anzeigezeit für die Karten-Animation.
  const runSearch = async (nm) => {
    const minDelay = new Promise((r) => setTimeout(r, 900));
    let results = null;
    if (placesEnabled()) {
      try { results = await searchProfiles(nm, lang); }
      catch (e) { if (typeof console !== "undefined") console.warn("Places-Suche fehlgeschlagen:", e.message); }
    }
    await minDelay;
    let list;
    if (results && results.length) {
      // Nur die tatsächlich gefundenen Profile zeigen — kein Platzhalter mit dem getippten Titel.
      list = results.slice(0, 4);
    }
    else if (placesEnabled()) list = [{ ...manualCandidate(nm, lang)[0], unverified: true }];
    else list = makeCandidates(nm, lang);
    setCandidates(list);
    setSelectedId(list[0].id);
    setMulti(list.length > 1);
    setPhase("found");
  };

  const go = (n) => setStep(n);

  // Navigation per Wisch (nach links = ein Schritt zurück) und per Klick auf einen erledigten Stepper-Schritt.
  const canStepBack = step > 0 && step < 6 && !processing;
  const touchRef = React.useRef(null);
  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) { touchRef.current = null; return; }
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const s = touchRef.current; touchRef.current = null;
    if (!s || !canStepBack) return;
    const tt = e.changedTouches && e.changedTouches[0]; if (!tt) return;
    const dx = tt.clientX - s.x, dy = tt.clientY - s.y;
    // klarer horizontaler Rechtswisch (von links nach rechts, iOS-typisch) = ein Schritt zurück
    if (dx > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(step - 1);
  };

  /* pricing */
  const servicePriceNum = num(service === "remove" ? p.deletion : p.reset);
  const serviceName = service === "remove" ? w.s4.opt1.t : w.s4.opt2.t;
  const protLabel = protection === "monthly" ? conv.tierMonthlyLabel : protection === "monitor" ? conv.tierMonitorLabel : protection === "lifetime" ? conv.tierLifetimeLabel : null;
  const protPriceVal = protection === "monthly" ? p.protMonthly : protection === "monitor" ? p.protMonitor : protection === "lifetime" ? p.protLifetime : null;
  const recurringNum = (protection === "monthly" || protection === "monitor") ? num(protPriceVal) : 0;
  const oneTimeTotal = servicePriceNum + (express ? num(p.express) : 0) + (protection === "lifetime" ? num(p.protLifetime) : 0);
  const leistungTotal = servicePriceNum + (express ? num(p.express) : 0);

  const country = lang === "en" ? "US" : "DE";
  const persistCheck = () => {
    if (checkSent.current) return;
    checkSent.current = true;
    submitCheck({
      checkId, profile: selected ? selected.name : name, category: selected ? selected.cat : "",
      rating: selected ? selected.rating : "", reviews: selected ? selected.reviews : 0,
      recommend: service, name, country, lang,
    }).catch((e) => { if (typeof console !== "undefined") console.warn("Prüfung senden fehlgeschlagen:", e.message); });
  };
  const proceedFromSearch = () => {
    persistCheck();
    if (selected) setContact((c) => ({ ...c, company: selected.name }));
    // Schritt 3 (Bestätigen) NUR bei unklar identifiziertem Profil.
    if (selected && selected.unverified) { go(2); return; }
    const key = selected ? (selected.placeId || selected.name) : "";
    // Gleiches Profil wie zuletzt geprüft → ohne Animation direkt zu Schritt 4.
    if (key && key === checkedRef.current) { go(3); return; }
    setPhase("checking");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      checkedRef.current = key;
      go(3);
      setPhase("found");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }, 2400);
  };
  // „Profil ist nicht in der Liste": mit dem getippten Namen weiter zu Schritt 3 (unklar identifiziert).
  const pickNotInList = () => {
    const c = { ...manualCandidate(name, lang)[0], id: "punsure", unverified: true };
    setCandidates([c]);
    setSelectedId("punsure");
    setMulti(false);
    setContact((x) => ({ ...x, company: name }));
    setProfileLink("");
    checkedRef.current = c.placeId || c.name;
    go(2);
  };
  // Echter Maps-Link eingetragen → Profil „prüfen" und danach das ECHTE Profil aus dem Link anzeigen.
  const verifyWithLink = () => {
    const fromLink = extractMapsName(profileLink);
    const linkUri = profileLink.trim();
    setPhase("checking");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    const minDelay = new Promise((r) => setTimeout(r, 2400));
    const lookup = (fromLink && placesEnabled())
      ? searchProfiles(fromLink, lang).then((r) => (r && r.length ? r[0] : null)).catch(() => null)
      : Promise.resolve(null);
    Promise.all([lookup, minDelay]).then(([real]) => {
      setCandidates((cs) => cs.map((c) => {
        if (c.id !== selectedId) return c;
        if (real) return { ...real, id: c.id, primary: true, unverified: false, mapsUri: linkUri };
        return { ...c, name: fromLink || c.name, unverified: false, mapsUri: linkUri };
      }));
      const nm = real ? real.name : fromLink;
      if (nm) { setName(nm); setContact((x) => ({ ...x, company: nm })); }
      checkedRef.current = real ? (real.placeId || real.name) : (fromLink || (selected && selected.name) || "");
      go(3); // jetzt verifiziert → direkt zu Schritt 4
      setPhase("found");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    });
  };
  // Direktwahl eines eindeutigen Profils aus der Live-Suche → gleich zu Schritt 3.
  const pickProfile = (profile) => {
    setAcOpen(false);
    setName(profile.name || "");
    setContact((c) => ({ ...c, company: profile.name || "" }));
    setCandidates([{ ...profile, id: "p1", primary: true }]);
    setSelectedId("p1");
    setMulti(false);
    const key = profile.placeId || profile.name;
    if (key && key === checkedRef.current) { go(3); return; }
    setPhase("checking");
    go(1);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      checkedRef.current = key;
      go(3);
      setPhase("found");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }, 2400);
  };

  const submit = () => {
    const er = {};
    if (!contact.name.trim()) er.name = w.s5.errName;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) er.email = w.s5.errEmail;
    if (!contact.company.trim()) er.company = w.s5.errCompany;
    if (!agbOk) er.agb = (AGB_CONSENT[t.code] || AGB_CONSENT.en).err;
    if (!faggOk) er.fagg = (FAGG_CONSENT[t.code] || FAGG_CONSENT.en).err;
    setErrors(er);
    if (Object.keys(er).length) return;
    setProcessing(true);
    persistCheck();
    // Affiliate-Attribution (FirstPromoter): Tracking-ID (_fprom_tid) für die Sale-
    // Zuordnung UND den lesbaren Partner-Code (_fprom_ref) mitschicken, damit im
    // Admin/Push direkt sichtbar ist, von welchem Affiliate die Bestellung kommt.
    const fprCookie = (n) => (typeof document !== "undefined" && (document.cookie.match(new RegExp("(?:^|;\\s*)" + n + "=([^;]+)")) || [])[1]) || "";
    const fprTid = fprCookie("_fprom_tid");
    // Affiliate-Code: bevorzugt der selbst aus ?fpr= gesicherte Wert (rr_aff),
    // sonst FirstPromoters _fprom_ref-Cookie (Format/Existenz nicht garantiert).
    const fprRef = fprCookie("rr_aff") || fprCookie("_fprom_ref");
    // Bestellung im Hintergrund ans ops-Backend. Profil-Nachweis (Place-ID etc.) inklusive.
    submitOrder({
      email: contact.email, name: contact.name, phone: contact.phone,
      company: contact.company, service, protection: protection || "",
      express: !!express, expressAmount: express ? num(p.express) : 0,
      profile: selected ? selected.name : "", orderId, lang,
      addr: selected ? (selected.addr || "") : "", mapsUri: selected ? (selected.mapsUri || "") : "",
      placeId: selected ? (selected.placeId || "") : "", businessStatus: selected ? (selected.businessStatus || "") : "",
      category: selected ? selected.cat : "", rating: selected ? selected.rating : "",
      reviews: selected ? selected.reviews : 0,
      amount: leistungTotal, protAmount: protPriceVal ? num(protPriceVal) : 0,
      country, checkId, saleTotal: oneTimeTotal, fprTid, fprRef,
      // Einwilligungen (Nachweis): AGB/Widerruf akzeptiert + ausdrückliches Verlangen
      // auf vorzeitigen Leistungsbeginn (§ 18 Abs 1 Z 1 FAGG), inkl. Zeitstempel.
      agbConsent: true, faggConsent: true, consentAt: new Date().toISOString(),
    }).catch((e) => { if (typeof console !== "undefined") console.warn("Bestellung senden fehlgeschlagen:", e.message); });
    // Conversion ans dataLayer (Google Tag Manager): Bestellung abgeschlossen.
    // „order" mit E-Mail + Telefon in der Datenschicht.
    gtmPush("order", { email: contact.email, phone: contact.phone, transaction_id: orderId, value: oneTimeTotal, currency: country === "US" ? "USD" : "EUR" });
    setTimeout(() => { setProcessing(false); setStep(6); }, 2400);
  };

  /* ---------- step bodies ---------- */
  function StepName() {
    return (
      <div className="wz-grid-name">
        <div className="wz-card pad-lg">
          <div className="wz-eyebrow"><Icon.search size={14} /> {w.s1.eyebrow}</div>
          <h1 className="wz-h">{w.s1.h}</h1>
          <p className="wz-sub">{w.s1.sub}</p>
          <div className="hero-ac" ref={acRef}>
            <div className="wz-bigfield">
              <Icon.building size={22} />
              <input className="wz-biginput" ref={nameRef} placeholder={w.s1.placeholder} value={name}
                onChange={(e) => { setName(e.target.value); setAcOpen(true); }} onFocus={() => setAcOpen(true)}
                onKeyDown={(e) => e.key === "Enter" && startSearch(name)} />
            </div>
            {acOpen && name.trim().length >= 2 && (
              <div className="hero-ac-pop">
                {sug.map((s) => (
                  <button type="button" className="hero-ac-item" key={s.placeId || s.id} onClick={() => pickProfile(s)}>
                    <Icon.building />
                    <span className="ac-tx"><span className="ac-n">{s.name}</span>{s.addr ? <span className="ac-a">{s.addr}</span> : null}</span>
                  </button>
                ))}
                <button type="button" className="hero-ac-item use" onClick={() => { setAcOpen(false); startSearch(name); }}>
                  <Icon.arrowRight />
                  <span className="ac-tx"><span className="ac-n">„{name.trim()}“</span><span className="ac-a">{wm.continueTyped}</span></span>
                </button>
              </div>
            )}
          </div>
          <div className="wz-actions">
            <button className="btn btn-primary lg grow" onClick={() => startSearch(name)} disabled={!name.trim()}>
              <Icon.search size={19} /> {w.s1.button} <Icon.arrowRight size={18} />
            </button>
          </div>
        </div>
        <aside className="wz-aside">
          <button type="button" className="wz-expert" onClick={openTidioChat}>
            <span className="we-avas">
              <img src={asset("/assets/maximilian-hoelzl.jpg")} alt="Maximilian" width={42} height={42} />
              <img src={asset("/assets/matthias-lang.webp")} alt="Matthias" width={42} height={42} />
            </span>
            <span className="we-tx">{conv.expertCta}</span>
            <span className="we-arrow"><Icon.arrowRight size={16} /></span>
          </button>
          <Testimonial q={conv.quotes[0]} tp={`${conv.reviewsN} · ${conv.trustpilot}`} />
        </aside>
      </div>
    );
  }

  function StepSearch() {
    const mp = MULTI_PROFILE[t.code] || MULTI_PROFILE.en;
    return (
      <div className="wz-card">
        {phase === "checking" ? <CheckingAnim conv={conv} /> : (<React.Fragment>
        <div className="wz-eyebrow"><Icon.mapPin size={14} /> {w.s2.eyebrow}</div>
        {phase === "searching"
          ? <div className="search-status"><span className="spin"></span> {w.s2.searching}</div>
          : (multi
              ? <React.Fragment><h1 className="wz-h" style={{ fontSize: 26 }}>{w.s2.multiH}</h1><p className="wz-sub" style={{ marginBottom: 18 }}>{w.s2.multiSub}</p></React.Fragment>
              : <React.Fragment><h1 className="wz-h" style={{ fontSize: 26 }}>{w.s2.h}</h1><p className="wz-sub" style={{ marginBottom: 18 }}>{w.s2.sub}</p></React.Fragment>)
        }
        {phase === "found" && (
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {(multi ? candidates : candidates.filter((c) => c.primary)).map((c) => (
              <ProfileCard key={c.id} c={c} selected={selectedId === c.id} onClick={() => setSelectedId(c.id)} reviewsLabel={w.s2.reviews} />
            ))}
            <div className="nm-group">
            <div className="profile-card not-mine-card reveal-in" onClick={pickNotInList} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pickNotInList(); }}>
              <div className="profile-thumb"><Icon.help /></div>
              <div className="profile-main"><div className="pn">{nil.tile}</div></div>
              <span className="nm-go"><Icon.arrowRight size={18} /></span>
            </div>
            <a className="profile-card not-mine-card reveal-in" href={"mailto:helpdesk@rapid-remove.com?subject=" + encodeURIComponent(mp.t)} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="profile-thumb"><Icon.mail /></div>
              <div className="profile-main"><div className="pn">{mp.t}</div></div>
              <span className="nm-go"><Icon.arrowRight size={18} /></span>
            </a>
            </div>
            <div className="wz-actions" style={{ marginTop: 6 }}>
              <button className="btn btn-secondary" onClick={() => go(0)}><Icon.arrowLeft size={17} /> {w.back}</button>
              <button className="btn btn-primary grow" onClick={proceedFromSearch}><span className="wz-lbl-full">{w.s2.button}</span><span className="wz-lbl-short">{conv.toCheckout}</span> <Icon.arrowRight size={18} /></button>
            </div>
          </div>
        )}
        </React.Fragment>)}
      </div>
    );
  }

  function StepConfirm() {
    if (phase === "checking") return <div className="wz-card"><CheckingAnim conv={conv} /></div>;
    const unsure = !!(selected && selected.unverified);
    const linkOk = isGMapsLink(profileLink);
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.shieldCheck size={14} /> {w.s3.eyebrow}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{unsure ? nil.h : w.s3.h}</h1>
        <p className="wz-sub" style={{ marginBottom: 20 }}>{unsure ? nil.sub : w.s3.sub}</p>
        <ProfileCard c={selected} selectable={false} cta={!unsure} onClick={() => { persistCheck(); go(3); }} reviewsLabel={w.s2.reviews} assessOk />
        {unsure ? (
          <React.Fragment>
            <div className="fld full" style={{ marginTop: 16 }}>
              <label>{nil.linkLabel}</label>
              <input value={profileLink} onChange={(e) => setProfileLink(e.target.value)} placeholder="https://maps.google.com/…" inputMode="url" aria-label={nil.linkLabel} />
            </div>
            <div className="wz-actions" style={{ marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => go(1)}><Icon.arrowLeft size={17} /> {w.back}</button>
              {linkOk
                ? <button className="btn btn-primary grow" onClick={verifyWithLink}>{nil.checkBtn} <Icon.arrowRight size={18} /></button>
                : <button className="btn btn-primary grow" onClick={() => { persistCheck(); go(3); }}>{conv.toCheckout} <Icon.arrowRight size={18} /></button>}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="profile-card not-mine-card" onClick={() => go(0)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go(0); }}>
              <div className="profile-thumb"><Icon.search /></div>
              <div className="profile-main"><div className="pn">{wm.notMine}</div></div>
              <span className="nm-go"><Icon.arrowRight size={18} /></span>
            </div>
            <div className="wz-actions" style={{ marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => go(1)}><Icon.arrowLeft size={17} /> {w.back}</button>
              <button className="btn btn-primary grow" onClick={() => { persistCheck(); go(3); }}>{conv.toCheckout} <Icon.arrowRight size={18} /></button>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }

  function StepService() {
    // Keine Vorauswahl: Tippen auf eine Leistung wählt sie und springt sofort weiter.
    // Reset hat KEINEN Schutz → Schritt 5 (Schutz) überspringen, direkt zum Checkout.
    const pick = (s) => {
      setService(s);
      if (s === "reset") { setExpress(false); setProtection(null); go(5); }
      else go(4);
    };
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.trash size={14} /> {w.s4.eyebrow}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{w.s4.h}</h1>
        <p className="wz-sub" style={{ marginBottom: 14 }}>{w.s4.sub}</p>
        <div className="svc-ok"><Icon.checkCircle size={16} /> {conv.delOk}</div>

        <div className="opt-list">
          <div className={"opt" + (service === "remove" ? " sel" : "")} onClick={() => pick("remove")}>
            {w.s4.opt1.badge && <span className="opt-flag">{w.s4.opt1.badge}</span>}
            <div className="opt-radio"></div>
            <div className="opt-ic"><Icon.trash size={22} /></div>
            <div className="opt-main">
              <div className="ot">{w.s4.opt1.t}</div>
              <div className="od">{w.s4.opt1.d}</div>
            </div>
            <div className="opt-price">{money(lang, p.deletion)}<small>{wm.afterSuccess}</small></div>
          </div>

          <div className={"opt" + (service === "reset" ? " sel" : "")} onClick={() => pick("reset")}>
            <div className="opt-radio"></div>
            <div className="opt-ic"><Icon.refresh size={22} /></div>
            <div className="opt-main">
              <div className="ot">{w.s4.opt2.t}</div>
              <div className="od">{w.s4.opt2.d}</div>
            </div>
            <div className="opt-price">{money(lang, p.reset)}<small>{wm.afterSuccess}</small></div>
          </div>
        </div>

        <div className="wz-actions" style={{ marginTop: 22 }}>
          <button className="btn btn-secondary" onClick={() => go(selected && selected.unverified ? 2 : 1)}><Icon.arrowLeft size={17} /> {w.back}</button>
        </div>
      </div>
    );
  }

  function StepProtect() {
    // Gleiche Kachel-Darstellung wie Schritt 4 (.opt) — konsistentes Wizard-Bild.
    // „Kein Schutz" ist eine eigene Kachel; bei Auswahl erscheint Warnung + Animation.
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.shieldCheck size={14} /> {conv.protStepLabel}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{conv.protH}</h1>
        <p className="wz-sub" style={{ marginBottom: 22 }}>{conv.protSub}</p>

        <div className="opt-list">
          <div className={"opt" + (protection === "monthly" ? " sel" : "")} onClick={() => setProtection("monthly")}>
            <span className="opt-flag">{conv.mostChosen}</span>
            <div className="opt-radio"></div>
            <div className="opt-ic"><Icon.shieldCheck size={22} /></div>
            <div className="opt-main">
              <div className="ot">{conv.protMonthlyName}</div>
              <div className="od">{wm.ptMonthlyNote}</div>
            </div>
            <div className="opt-price">{conv.perMonthPre && <span className="opt-per">{conv.perMonthAffix} </span>}{money(lang, p.protMonthly)}{!conv.perMonthPre && <span className="opt-per">{conv.perMonthAffix}</span>}<small>{conv.cancelAnytime}</small></div>
          </div>

          <div className={"opt" + (protection === "monitor" ? " sel" : "")} onClick={() => setProtection("monitor")}>
            <div className="opt-radio"></div>
            <div className="opt-ic"><Icon.shieldCheck size={22} /></div>
            <div className="opt-main">
              <div className="ot">{conv.protMonitorName}</div>
              <div className="od">{wm.ptMonitorNote}</div>
            </div>
            <div className="opt-price">{conv.perMonthPre && <span className="opt-per">{conv.perMonthAffix} </span>}{money(lang, p.protMonitor)}{!conv.perMonthPre && <span className="opt-per">{conv.perMonthAffix}</span>}<small>{conv.cancelAnytime}</small></div>
          </div>

          <div className={"opt" + (protection === "lifetime" ? " sel" : "")} onClick={() => setProtection("lifetime")}>
            <div className="opt-radio"></div>
            <div className="opt-ic"><Icon.shieldCheck size={22} /></div>
            <div className="opt-main">
              <div className="ot">{conv.protLifetimeName}</div>
              <div className="od">{wm.ptLifetimeNote}</div>
            </div>
            <div className="opt-price">{money(lang, p.protLifetime)}<small>{conv.onceShort}</small></div>
          </div>

          <div className={"opt" + (protection === null ? " sel" : "")} onClick={() => setProtection(null)}>
            <div className="opt-radio"></div>
            <div className="opt-ic"><Icon.shield size={22} /></div>
            <div className="opt-main">
              <div className="ot">{conv.protNoneName}</div>
              <div className="od">{conv.protNoneDesc}</div>
            </div>
          </div>
        </div>

        {protection === null && (
          <React.Fragment>
            <div className="pt-skip-warn"><Icon.alert size={22} /><span>{conv.protOffBody}</span></div>
            <IngestionAnim lang={lang} />
          </React.Fragment>
        )}

        <div className="svc-cta">
          <div className="wz-actions">
            <button className="btn btn-secondary" onClick={() => go(3)}><Icon.arrowLeft size={17} /> {w.back}</button>
            <button className="btn btn-primary grow" onClick={() => go(5)}>{protection === null ? <React.Fragment><span className="wz-lbl-full">{conv.protOffContinue}</span><span className="wz-lbl-short">{conv.toCheckout}</span></React.Fragment> : conv.toCheckout} <Icon.arrowRight size={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  function OrderSummary() {
    return (
      <div className="summary">
        <h3><Icon.cart size={20} /> {w.s5.sumTitle}</h3>
        <div className="sum-row"><span className="sl">{w.s5.sumProfile}</span><span className="sv ellip">{selected.name}</span></div>
        <div className="sum-row"><span className="sl">{serviceName}</span><span className="sv">{fmtMoney(lang, servicePriceNum)}</span></div>

        {/* Express lässt sich hier zubuchen; der Schutz wird in Schritt 5 gewählt */}
        <div className="sum-opts">
          <div className="sum-opt">
            <span className="so-l"><Icon.zap size={16} /> {wm.expressTile}</span>
            <span className="so-r">
              <span className="so-price">+{money(lang, p.express)}</span>
              <button type="button" className={"switch sm" + (express ? " on" : "")} aria-label={wm.expressTile} onClick={() => setExpress(!express)}></button>
            </span>
          </div>
        </div>

        <div className="sum-row muted"><span className="sl">{w.s5.sumDueNow}</span><span className="sv">{money(lang, w.s5.dueNow)}</span></div>
        <div className="sum-total"><span className="sl">{w.s5.sumTotal}</span><span className="sv">{fmtMoney(lang, oneTimeTotal)}</span></div>
        {recurringNum > 0 && <div className="sum-recurring">{conv.sumAfter} <b>{money(lang, protPriceVal)} {conv.perMonthShort}</b></div>}
        <div className="sum-note"><Icon.shieldCheck /> {w.s5.sumNote}</div>
      </div>
    );
  }

  function StepCheckout() {
    const set = (k) => (e) => setContact((c) => ({ ...c, [k]: e.target.value }));
    const ag = AGB_CONSENT[t.code] || AGB_CONSENT.en;
    const fg = FAGG_CONSENT[t.code] || FAGG_CONSENT.en;
    if (processing) {
      return (
        <div className="wz-card">
          <div className="del-demo removing removed">
            <ProfileCard c={selected} selectable={false} reviewsLabel={w.s2.reviews} />
            <div className="del-stamp"><div className="ok"><div className="ring"><Icon.check /></div></div></div>
          </div>
          <div className="processing">
            <div className="ring"></div>
            <b>{w.s5.processing}</b>
            <span>{w.s5.payNote}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="wz-split">
        <div className="wz-card">
          <div className="wz-eyebrow"><Icon.lock size={14} /> {w.s5.eyebrow}</div>
          <h1 className="wz-h" style={{ fontSize: 26 }}>{w.s5.h}</h1>
          <p className="wz-sub" style={{ marginBottom: 22 }}>{w.s5.sub}</p>
          <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <div className="form-grid">
              <div className={"fld full" + (errors.name ? " err" : "")}>
                <input value={contact.name} onChange={set("name")} placeholder={w.s5.f.name} aria-label={w.s5.f.name}
                  type="text" name="name" autoComplete="name" autoCapitalize="words" enterKeyHint="next" />
                {errors.name && <div className="emsg">{errors.name}</div>}
              </div>
              <div className={"fld full" + (errors.email ? " err" : "")}>
                <input value={contact.email} onChange={set("email")} placeholder={w.s5.f.email} aria-label={w.s5.f.email}
                  type="email" name="email" autoComplete="email" inputMode="email" autoCapitalize="off" spellCheck={false} enterKeyHint="next" />
                {errors.email && <div className="emsg">{errors.email}</div>}
              </div>
              <div className="fld full">
                <input value={contact.phone} onChange={set("phone")} placeholder={w.s5.f.phone} aria-label={w.s5.f.phone}
                  type="tel" name="tel" autoComplete="tel" inputMode="tel" enterKeyHint="next" />
              </div>
              <div className={"fld full" + (errors.company ? " err" : "")}>
                <input value={contact.company} onChange={set("company")} placeholder={w.s5.f.company} aria-label={w.s5.f.company}
                  type="text" name="organization" autoComplete="organization" enterKeyHint="done" />
                {errors.company && <div className="emsg">{errors.company}</div>}
              </div>
            </div>

            <label className={"agb-consent" + (errors.agb ? " err" : "")} style={{ display: "flex", gap: 11, alignItems: "flex-start", marginTop: 22, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
              <input type="checkbox" checked={agbOk}
                onChange={(e) => { setAgbOk(e.target.checked); if (e.target.checked) setErrors((x) => { const { agb, ...r } = x; return r; }); }}
                style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: "var(--primary)", cursor: "pointer" }} />
              <span style={{ color: errors.agb ? "var(--danger)" : "inherit" }}>
                {ag.pre}
                <a href={asset(pagePath("agb", t.code))} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 700 }}
                  onClick={(e) => e.stopPropagation()}>{ag.agb}</a>
                {ag.mid}
                <a href={asset(pagePath("widerruf", t.code))} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 700 }}
                  onClick={(e) => e.stopPropagation()}>{ag.wid}</a>
                {ag.post}
              </span>
            </label>
            {errors.agb && <div className="emsg" style={{ marginTop: 7, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>{errors.agb}</div>}
            <label className={"agb-consent" + (errors.fagg ? " err" : "")} style={{ display: "flex", gap: 11, alignItems: "flex-start", marginTop: 12, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
              <input type="checkbox" checked={faggOk}
                onChange={(e) => { setFaggOk(e.target.checked); if (e.target.checked) setErrors((x) => { const { fagg, ...r } = x; return r; }); }}
                style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: "var(--primary)", cursor: "pointer" }} />
              <span style={{ color: errors.fagg ? "var(--danger)" : "inherit" }}>{fg.txt}</span>
            </label>
            {errors.fagg && <div className="emsg" style={{ marginTop: 7, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>{errors.fagg}</div>}
            <button type="submit" className="btn btn-primary btn-block lg co-submit-desktop" style={{ marginTop: 16 }}>
              <Icon.lock size={18} /> {w.s5.button}
            </button>
          </form>
          <div className="wz-actions" style={{ marginTop: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={() => go(service === "reset" ? 3 : 4)}><Icon.arrowLeft size={17} /> {w.back}</button>
            <button type="button" className="btn btn-primary grow co-submit-mobile" onClick={submit}><Icon.lock size={17} /> {wm.finish}</button>
          </div>
        </div>
        <div className="wz-aside">
          <OrderSummary />
          <CheckoutHelp lang={lang} />
          <div className="checkout-testi"><Testimonial q={conv.quotes[0]} tp={`${conv.reviewsN} · ${conv.trustpilot}`} /></div>
        </div>
      </div>
    );
  }

  function StepDone() {
    return (
      <div className="wz-card pad-lg">
        <div className="ty-hero">
          <div className="ty-check"><div className="core"><Icon.check /></div></div>
          <div className="wz-eyebrow" style={{ justifyContent: "center", color: "var(--success)" }}><Icon.checkCircle size={14} /> {w.s6.badge}</div>
          <h1 className="wz-h" style={{ fontSize: 30 }}>{w.s6.h}</h1>
          <p className="wz-sub" style={{ margin: "0 auto 0", textAlign: "center" }}>{w.s6.sub}</p>
          <div className="ty-order">{w.s6.order} <b>#{orderId}</b></div>
        </div>

        <div style={{ marginTop: 24 }}>
          <OrderForm orderId={orderId} lang={t.code} />
        </div>

        <div style={{ marginTop: 30 }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, margin: "0 0 6px" }}>{w.s6.pipeTitle}</h4>
          <div className="pipeline">
            {w.s6.pipe.map((s, i) => (
              <div className={"pl-step" + (s.done ? " done" : s.now ? " active" : "")} key={i}>
                {i < w.s6.pipe.length - 1 && <div className="pl-rail"></div>}
                <div className="pl-dot">{s.done ? <Icon.check /> : s.now ? <Icon.clock /> : <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", display: "block" }}></span>}</div>
                <div className="pl-body">
                  <h4>{s.t}</h4>
                  <p>{s.d}</p>
                  {s.now && <span className="tnow"><Icon.clock size={13} /> {wm.now}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ty-next">
          <h4>{w.s6.nextTitle}</h4>
          <p>{w.s6.nextBody}</p>
        </div>

        {(onOrm || onDeindex) && (
          <div className="done-cross">
            <div className="dc-head">
              <h4>{conv.doneCrossH}</h4>
              <p>{conv.doneCrossSub}</p>
            </div>
            <div className="dc-grid">
              <button className="dc-card" onClick={() => onOrm && onOrm()}>
                <span className="dc-ic"><Icon.eye size={22} /></span>
                <span className="dc-main">
                  <span className="dc-t">{conv.xsOrmTitle}</span>
                  <span className="dc-d">{conv.xsOrmDesc}</span>
                  <span className="dc-p">{conv.xsOrmPrice}</span>
                </span>
                <Icon.arrowRight className="dc-arrow" size={18} />
              </button>
              <button className="dc-card" onClick={() => onDeindex && onDeindex()}>
                <span className="dc-ic"><Icon.globe size={22} /></span>
                <span className="dc-main">
                  <span className="dc-t">{conv.xsPressTitle}</span>
                  <span className="dc-d">{conv.xsPressDesc}</span>
                  <span className="dc-p">{conv.xsPressPrice}</span>
                </span>
                <Icon.arrowRight className="dc-arrow" size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="ty-cta-row">
          <button className="btn btn-primary lg" onClick={onExit}>{w.s6.home} <Icon.arrowRight size={18} /></button>
        </div>
      </div>
    );
  }

  const Top = (
    <div className="wz-top">
      <div className="wz-top-inner">
        <img className="logo" src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" onClick={onExit} />
        <button className="back" onClick={onExit}><Icon.x size={16} /> {w.backHome}</button>
      </div>
    </div>
  );

  /* ---- erste Seite: Service-Router (mit den anderen Dienstleistungen) ---- */
  function RouterScreen() {
    const pick = (id) => { if (id === "delete") setRouted(true); else if (id === "press") setPressMode(true); else setUnsureStep(1); };
    if (unsureStep > 0) {
      return (
        <div className="wz-card pad-lg router">
          <div className="wz-eyebrow"><Icon.info size={14} /> {rc.qH}</div>
          <h1 className="wz-h" style={{ fontSize: 28 }}>{unsureStep === 1 ? rc.q1 : rc.q2}</h1>
          <div className="router-q" style={{ marginTop: 18 }}>
            {unsureStep === 1 ? (
              <React.Fragment>
                <button className="rq-opt" onClick={() => setRouted(true)}><Icon.check /> {rc.q1yes}</button>
                <button className="rq-opt" onClick={() => setUnsureStep(2)}><Icon.arrowRight /> {rc.q1no}</button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <button className="rq-opt" onClick={() => { setUnsureStep(0); setPressMode(true); }}><Icon.edit /> {rc.q2yes}</button>
                <button className="rq-opt" onClick={() => setRouted(true)}><Icon.trash /> {rc.q2no}</button>
              </React.Fragment>
            )}
          </div>
          <div className="wz-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={() => setUnsureStep(unsureStep === 2 ? 1 : 0)}><Icon.arrowLeft size={17} /> {w.back}</button>
          </div>
        </div>
      );
    }
    return (
      <div className="wz-card pad-lg router">
        <div className="wz-eyebrow"><Icon.search size={14} /> {rc.routerEyebrow}</div>
        <h1 className="wz-h" style={{ fontSize: 30 }}>{rc.routerH}</h1>
        <p className="wz-sub">{rc.routerSub}</p>
        <div className="router-tiles">
          {rc.tiles.map((tl) => {
            const I = Icon[tl.ic] || (tl.ic === "fileText" ? Icon.edit : Icon.trash);
            return (
              <button className={"router-tile" + (tl.id === "delete" ? " primary" : "")} key={tl.id} onClick={() => pick(tl.id)}>
                {tl.badge && <span className="rt-badge">{tl.badge}</span>}
                <span className="rt-ic"><I size={27} /></span>
                <span className="rt-main">
                  <span className="rt-t">{tl.t}</span>
                  <span className="rt-d">{tl.d}</span>
                </span>
                <Icon.arrowRight className="rt-arrow" size={20} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---- Wizard fürs Löschen einzelner Treffer in der Google-Suche (Presse/Auslistung) ---- */
  function PressIntake() {
    const set = (k) => (e) => setPressData({ ...pressData, [k]: e.target.value });
    const setUrl = (i) => (e) => { const urls = pressData.urls.slice(); urls[i] = e.target.value; setPressData({ ...pressData, urls }); };
    const addUrl = () => setPressData({ ...pressData, urls: [...pressData.urls, ""] });
    const rmUrl = (i) => () => setPressData({ ...pressData, urls: pressData.urls.filter((_, j) => j !== i) });
    const submitPress = () => {
      const urls = (pressData.urls || []).filter((u) => u && u.trim());
      // Landet im Admin-Panel als Bestellung „deindex" (Presse auslisten – Prüfung):
      // Links + Beschreibung als Notiz, damit die Partnerkanzlei sie prüfen kann.
      const note = `Links:\n${urls.join("\n") || "—"}\n\nBeschreibung: ${pressData.desc || "—"}\nAlternative (Verdrängung) gewünscht: ${pressData.orm === "yes" ? "ja" : "nein"}`;
      submitOrder({ service: "deindex", email: pressData.email, profile: "Presse-Auslistung", note, company: "", amount: 0, protAmount: 0, lang, country, orderId }).catch(() => {});
      setPressDone(true);
    };
    if (pressDone) {
      return (
        <div className="wz-card pad-lg">
          <div className="ty-hero">
            <div className="ty-check"><div className="core"><Icon.check /></div></div>
            <h1 className="wz-h" style={{ fontSize: 28 }}>{rc.pressDoneH}</h1>
            <p className="wz-sub" style={{ margin: "0 auto", textAlign: "center" }}>{rc.pressDoneSub}</p>
          </div>
          <div className="ty-cta-row"><button className="btn btn-secondary lg" onClick={onExit}>{w.s6.home}</button></div>
        </div>
      );
    }
    return (
      <div className="wz-card pad-lg">
        <div className="wz-eyebrow"><Icon.edit size={14} /> {rc.pressIntakeH}</div>
        <h1 className="wz-h" style={{ fontSize: 26 }}>{rc.pressIntakeH}</h1>
        <p className="wz-sub">{rc.pressIntakeSub}</p>
        <PressSerpDemo />
        <div className="press-price">
          <div className="pp-ic"><Icon.info /></div>
          <div className="pp-body"><b>{rc.pressPriceH}</b><p>{rc.pressPriceSub}</p></div>
        </div>
        <div className="form-grid">
          <div className="fld full">
            <label>{rc.pressUrl}</label>
            <div className="url-list">
              {pressData.urls.map((u, i) => (
                <div className="url-row" key={i}>
                  <input value={u} onChange={setUrl(i)} placeholder="https://…" />
                  {pressData.urls.length > 1 ? <button type="button" className="url-rm" onClick={rmUrl(i)} aria-label="Entfernen"><Icon.x /></button> : null}
                </div>
              ))}
              <button type="button" className="url-add" onClick={addUrl}><span aria-hidden="true" style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>+</span> {rc.pressAddUrl}</button>
            </div>
          </div>
          <div className="fld full"><label>{rc.pressEmail}</label><input value={pressData.email} onChange={set("email")} placeholder="name@firma.com" /></div>
          <div className="fld full"><label>{rc.pressDesc}</label><input value={pressData.desc} onChange={set("desc")} placeholder="" /></div>
        </div>
        <div className="press-alt">
          <b>{rc.pressAltQ}</b>
          <p>{rc.pressAltHint}</p>
          <div className="pa-opts">
            <button type="button" className={"pa-opt" + (pressData.orm === "yes" ? " sel" : "")} onClick={() => setPressData({ ...pressData, orm: "yes" })}><Icon.check /> {rc.pressAltYes}</button>
            <button type="button" className={"pa-opt" + (pressData.orm === "no" ? " sel" : "")} onClick={() => setPressData({ ...pressData, orm: "no" })}>{rc.pressAltNo}</button>
          </div>
        </div>
        <button className="btn btn-primary btn-block lg" style={{ marginTop: 18 }} disabled={!pressData.orm} onClick={submitPress}><Icon.shieldCheck size={18} /> {rc.pressBtn}</button>
        {!pressData.orm ? <div className="pa-req">{rc.pressAltReq}</div> : null}
        <div className="wz-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => setPressMode(false)}><Icon.arrowLeft size={17} /> {w.back}</button>
        </div>
      </div>
    );
  }

  if (!routed && !pressMode) {
    return (
      <div className="wz">
        {Top}
        <div className="wz-body" ref={bodyRef}><div className="step-panel" key={"router" + unsureStep}>{RouterScreen()}</div></div>
        <ActivityToast />
      </div>
    );
  }
  if (pressMode) {
    return (
      <div className="wz">
        {Top}
        <div className="wz-body" ref={bodyRef}><div className="step-panel" key={"press" + pressDone}>{PressIntake()}</div></div>
      </div>
    );
  }

  const bodies = [StepName, StepSearch, StepConfirm, StepService, StepProtect, StepCheckout, StepDone];
  const Body = bodies[step];
  const wideStep = [0, 5].includes(step) && !processing;

  return (
    <div className="wz">
      {Top}
      <Stepper step={step} onNav={canStepBack ? go : null} />
      <div className={"wz-body" + (wideStep ? " wide" : "")} ref={bodyRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="step-panel" key={step + (processing ? "p" : "") + phase}>
          {Body()}
        </div>
      </div>
      <ActivityToast />
      {confetti && <Confetti />}
    </div>
  );
}

export { Wizard };
