"use client";
import React from "react";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { money, profileFor } from "@/lib/pricing";
import { searchProfiles, placesEnabled, manualCandidate } from "@/lib/places";
import { submitOrder, submitCheck } from "@/lib/order";
import OrderForm from "@/components/OrderForm";

/* ---- mandatory privacy / terms consent label, per locale ---- */
const AGB_CONSENT = {
  de: { pre: "Ich habe die ", link: "Datenschutzerklärung & AGB", post: " gelesen und stimme zu.", err: "Bitte bestätigen Sie die Datenschutzerklärung." },
  en: { pre: "I have read and agree to the ", link: "Privacy Policy & Terms", post: ".", err: "Please confirm the privacy policy." },
  es: { pre: "He leído y acepto la ", link: "Política de Privacidad y los Términos", post: ".", err: "Confirme la política de privacidad." },
  fr: { pre: "J'ai lu et j'accepte la ", link: "politique de confidentialité et les CGV", post: ".", err: "Veuillez confirmer la politique de confidentialité." },
  it: { pre: "Ho letto e accetto l'", link: "Informativa sulla privacy e i Termini", post: ".", err: "Conferma l'informativa sulla privacy." },
  nl: { pre: "Ik heb het ", link: "privacybeleid & de voorwaarden", post: " gelezen en ga akkoord.", err: "Bevestig het privacybeleid." },
  pt: { pre: "Li e aceito a ", link: "Política de Privacidade e os Termos", post: ".", err: "Confirme a política de privacidade." },
  ja: { pre: "", link: "プライバシーポリシーと利用規約", post: "を読み、同意します。", err: "プライバシーポリシーに同意してください。" },
  sv: { pre: "Jag har läst och godkänner ", link: "integritetspolicyn och villkoren", post: ".", err: "Bekräfta integritetspolicyn." },
  da: { pre: "Jeg har læst og accepterer ", link: "privatlivspolitikken og vilkårene", post: ".", err: "Bekræft privatlivspolitikken." },
  no: { pre: "Jeg har lest og godtar ", link: "personvernerklæringen og vilkårene", post: ".", err: "Bekreft personvernerklæringen." },
};
// Deutsche AGB/Datenschutz lokal; alle anderen Sprachen → englische GTC.
const GTC_EN = "https://onecdn.io/media/rapidremovegtc-7e48fe7f-35be-4849-861a-e10de91526fd.pdf";

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
    rating: "4,9", reviewsN: "266 Bewertungen", trustpilot: "Trustpilot",
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
      { q: "Innerhalb eines Tages war das gefälschte Profil weg. Hätte ich nicht für möglich gehalten.", a: "Martin K.", r: "Praxisinhaber, München" },
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
    protSub: "Dritte — oft Mitbewerber — können Ihr Profil jederzeit wieder bei Google eintragen. Mit Schutz entfernen wir es dauerhaft kostenlos erneut.",
    tierMonthlyLabel: "Monatlich", tierMonitorLabel: "Monitoring", tierLifetimeLabel: "Lebenslang",
    tierMonthlyDesc: "Wir überwachen monatlich und entfernen erneute Einträge kostenlos.",
    tierMonitorDesc: "Tägliche Überwachung, sofortige Entfernung & Monats-Report. Maximale Sicherheit.",
    tierLifetimeDesc: "Einmal zahlen, nie wieder Sorgen — dauerhafter Schutz ohne laufende Kosten.",
    tierMonitorBadge: "Beliebteste", tierLifetimeBadge: "Best Value",
    lifetimeMath: "Günstiger als 4 Jahre Monatsschutz — danach nie wieder zahlen.",
    monitorMath: "Für alle, die ganz sichergehen wollen.",
    perMonthShort: "/ Mon.", onceShort: "einmalig",
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
    toProtect: "Weiter zum Schutz", toCheckout: "Weiter zum Checkout",
    totalAfter: "Gesamt nach Erfolg",
    doneCrossH: "Noch mehr für Ihren Ruf?",
    doneCrossSub: "Optional, jederzeit — unsere Ergänzungen rund um Ihre Online-Reputation.",
    xsOrmTitle: "Reputation verbessern", xsOrmDesc: "Negative Ergebnisse aus Google verdrängen lassen.", xsOrmPrice: "Auf Anfrage",
    xsPressTitle: "Presseartikel auslisten", xsPressDesc: "Unerwünschte Artikel aus den Suchergebnissen entfernen.", xsPressPrice: "Auf Anfrage",
    asideBadges: ["DSGVO-konform", "Server in Deutschland"],
  },
  en: {
    rating: "4.9", reviewsN: "266 reviews", trustpilot: "Trustpilot",
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
      { q: "The fake profile was gone within a day. I didn't think it was possible.", a: "Martin K.", r: "Practice owner, Munich" },
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
    protSub: "Third parties — often competitors — can re-list your profile on Google anytime. With protection we remove it again for free, permanently.",
    tierMonthlyLabel: "Monthly", tierMonitorLabel: "Monitoring", tierLifetimeLabel: "Lifetime",
    tierMonthlyDesc: "We monitor monthly and remove any re-listings for free.",
    tierMonitorDesc: "Daily monitoring, instant removal & monthly report. Maximum safety.",
    tierLifetimeDesc: "Pay once, never worry again — permanent protection with no recurring cost.",
    tierMonitorBadge: "Most popular", tierLifetimeBadge: "Best value",
    lifetimeMath: "Cheaper than 4 years of monthly protection — then never pay again.",
    monitorMath: "For those who want to be completely safe.",
    perMonthShort: "/ mo.", onceShort: "once",
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
    toProtect: "Continue to protection", toCheckout: "Continue to checkout",
    totalAfter: "Total after success",
    doneCrossH: "More for your reputation?",
    doneCrossSub: "Optional, anytime — our add-ons around your online reputation.",
    xsOrmTitle: "Improve reputation", xsOrmDesc: "Push negative results out of Google search.", xsOrmPrice: "On request",
    xsPressTitle: "De-index press articles", xsPressDesc: "Remove unwanted articles from search results.", xsPressPrice: "On request",
    asideBadges: ["GDPR-compliant", "EU servers"],
  },
};
function convFor(code) { return CONV[code] || CONV.en; }

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
              className={"stepper-node" + (i < step ? " done" : i === step ? " active" : "") + (clickable ? " nav" : "")}
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
      <div className="stepper-count">{t.wizard.stepCount(step + 1, labels.length)}</div>
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
/* ---- kleine Wizard-Labels, die früher nur DE/EN waren ---- */
const WZ_MISC = {
  de: { now: "Jetzt", afterSuccess: "nach Erfolg", continueTyped: "So fortfahren – auch wenn nicht gelistet" },
  en: { now: "Now", afterSuccess: "after success", continueTyped: "Continue with this — even if not listed" },
  es: { now: "Ahora", afterSuccess: "tras el éxito", continueTyped: "Continuar así, aunque no aparezca" },
  fr: { now: "Maintenant", afterSuccess: "après le succès", continueTyped: "Continuer ainsi, même si non répertorié" },
  it: { now: "Ora", afterSuccess: "dopo il successo", continueTyped: "Continua così, anche se non elencato" },
  nl: { now: "Nu", afterSuccess: "na succes", continueTyped: "Zo doorgaan – ook als niet vermeld" },
  pt: { now: "Agora", afterSuccess: "após o sucesso", continueTyped: "Continuar assim, mesmo se não listado" },
  ja: { now: "現在", afterSuccess: "成功後", continueTyped: "リストになくても続行" },
  sv: { now: "Nu", afterSuccess: "efter framgång", continueTyped: "Fortsätt ändå – även om den inte är listad" },
  da: { now: "Nu", afterSuccess: "efter succes", continueTyped: "Fortsæt alligevel – også hvis ikke anført" },
  no: { now: "Nå", afterSuccess: "etter suksess", continueTyped: "Fortsett likevel – også om ikke oppført" },
};

function ratingAssessment(ratingStr, lang) {
  const r = parseFloat(String(ratingStr).replace(",", ".")) || 0;
  const m = ASSESS[lang] || ASSESS.en;
  let key, tone;
  if (r < 3.0) { key = "urgent"; tone = "bad"; }
  else if (r < 4.2) { key = "recommend"; tone = "warn"; }
  else { key = "possible"; tone = "ok"; }
  return { label: m[key], tone };
}

/* ---- Profile card ---- */
function ProfileCard({ c, selected, onClick, selectable = true, reviewsLabel }) {
  const { lang } = useLang();
  const a = c.rating != null ? ratingAssessment(c.rating, lang) : null;
  return (
    <div className={"profile-card reveal-in" + (selected ? " sel" : "")} onClick={selectable ? onClick : undefined} style={!selectable ? { cursor: "default" } : null}>
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
            <div className={"rate-assess " + a.tone}>{a.tone === "ok" ? <Icon.checkCircle /> : <Icon.alert />} {a.label}</div>
          </React.Fragment>
        )}
        {c.addr && <div className="profile-addr"><Icon.mapPin /> {c.addr}</div>}
      </div>
      {selectable && <div className="profile-radio"><Icon.check /></div>}
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

function Testimonial({ q }) {
  return (
    <div className="testi">
      <div className="testi-stars">{[0,1,2,3,4].map(i => <Icon.star key={i} size={14} />)}</div>
      <p className="testi-q">„{q.q}"</p>
      <div className="testi-a"><span className="ta-av">{q.a.charAt(0)}</span><span><b>{q.a}</b><small>{q.r}</small></span></div>
    </div>
  );
}

/* ============ WIZARD ROOT ============ */
function Wizard({ initialName, initialProfile, onExit, onOrm, onDeindex }) {
  const { t, lang } = useLang();
  const w = t.wizard;
  const wm = WZ_MISC[t.code] || WZ_MISC.en;
  const conv = convFor(t.code);
  const p = profileFor(lang);
  // Mit einem in der Live-Suche gewählten Profil starten wir direkt auf der
  // Machbarkeits-Karte (Schritt 3 / Index 2) – ohne erneute Profilsuche.
  const [step, setStep] = React.useState(initialProfile ? 2 : 0);
  const [name, setName] = React.useState(initialName || "");
  const [candidates, setCandidates] = React.useState(() =>
    initialProfile ? [{ ...initialProfile, id: "p1", primary: true }] : makeCandidates(initialName, lang));
  const [phase, setPhase] = React.useState(initialProfile ? "found" : "searching"); // searching | found
  const [multi, setMulti] = React.useState(initialProfile ? false : true);
  const [selectedId, setSelectedId] = React.useState("p1");
  const [service, setService] = React.useState("remove");
  const [express, setExpress] = React.useState(false);
  const [protection, setProtection] = React.useState("monthly"); // null | monthly | monitor | lifetime — default ON
  const [showSkip, setShowSkip] = React.useState(false);
  const [contact, setContact] = React.useState({ name: "", email: "", phone: "", company: initialName || "", url: "" });
  const [errors, setErrors] = React.useState({});
  const [processing, setProcessing] = React.useState(false);
  const [agbOk, setAgbOk] = React.useState(false);
  const [orderId] = React.useState(() => "RR-" + Math.floor(100000 + Math.random() * 899999));
  const [checkId] = React.useState(() => "CHK-" + Math.floor(100000 + Math.random() * 899999));
  const checkSent = React.useRef(false);
  const bodyRef = React.useRef(null);
  // Live-Suche in Schritt 1 (wie in der Kopfzeile): tippen schlägt echte Profile vor.
  const [sug, setSug] = React.useState([]);
  const [acOpen, setAcOpen] = React.useState(false);
  const acRef = React.useRef(null);

  React.useEffect(() => { if (bodyRef.current) window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // Mit konkretem Profil bleiben wir auf Schritt 3; sonst startet ein getippter Name die Suche.
  React.useEffect(() => {
    if (initialProfile) return;
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
      list = results.slice(0, 4);
      if (nm.trim()) list = [...list, { ...manualCandidate(nm, lang)[0], id: "pmanual", primary: false }];
    }
    else if (placesEnabled()) list = manualCandidate(nm, lang);
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
  const proceedFromSearch = () => { persistCheck(); go(2); };
  // Direktwahl eines eindeutigen Profils aus der Live-Suche → gleich zu Schritt 3.
  const pickProfile = (profile) => {
    setAcOpen(false);
    setName(profile.name || "");
    setContact((c) => ({ ...c, company: profile.name || "" }));
    setCandidates([{ ...profile, id: "p1", primary: true }]);
    setSelectedId("p1");
    setMulti(false);
    setPhase("found");
    go(2);
  };

  const submit = () => {
    const er = {};
    if (!contact.name.trim()) er.name = w.s5.errName;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) er.email = w.s5.errEmail;
    if (!agbOk) er.agb = (AGB_CONSENT[t.code] || AGB_CONSENT.en).err;
    setErrors(er);
    if (Object.keys(er).length) return;
    setProcessing(true);
    persistCheck();
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
      country, checkId,
    }).catch((e) => { if (typeof console !== "undefined") console.warn("Bestellung senden fehlgeschlagen:", e.message); });
    // Conversion ans dataLayer (Google Tag Manager): Bestellung aufgegeben.
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "purchase", transaction_id: orderId, value: oneTimeTotal, currency: country === "US" ? "USD" : "EUR" });
    }
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
              <input className="wz-biginput" autoFocus placeholder={w.s1.placeholder} value={name}
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
          {w.s1.hint && (<p className="wz-hint"><Icon.info size={17} /> {w.s1.hint}</p>)}
          <div className="wz-actions">
            <button className="btn btn-primary lg grow" onClick={() => startSearch(name)} disabled={!name.trim()}>
              <Icon.search size={19} /> {w.s1.button} <Icon.arrowRight size={18} />
            </button>
          </div>
          <div className="wz-mini-assure">
            {w.s1.assure.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
          </div>
          <div className="risk-banner" style={{ marginTop: 18 }}><Icon.shieldCheck /> {t.riskReversal}</div>
        </div>
        <aside className="wz-aside">
          <LiveCounter base={conv.counterBase} label={conv.counterLabel} sub={conv.successRate + " · " + conv.avgTime} />
          <Testimonial q={conv.quotes[0]} />
          <div className="aside-badges">
            <span><Icon.lock size={15} /> {conv.asideBadges[0]}</span>
            <span><Icon.shieldCheck size={15} /> {conv.asideBadges[1]}</span>
          </div>
        </aside>
      </div>
    );
  }

  function StepSearch() {
    const mp = MULTI_PROFILE[t.code] || MULTI_PROFILE.en;
    return (
      <div className="wz-card">
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
            <a className="profile-card reveal-in" href={"mailto:helpdesk@rapid-remove.com?subject=" + encodeURIComponent(mp.t)} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="profile-thumb"><Icon.building /></div>
              <div className="profile-main">
                <div className="pn">{mp.t}</div>
                <div className="pcat">{mp.d}</div>
              </div>
              <div className="profile-radio"><Icon.check /></div>
            </a>
            <div className="wz-actions" style={{ marginTop: 6 }}>
              <button className="btn btn-secondary" onClick={() => go(0)}><Icon.arrowLeft size={17} /> {w.back}</button>
              <button className="btn btn-primary grow" onClick={proceedFromSearch}>{w.s2.button} <Icon.arrowRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function StepConfirm() {
    return (
      <div className="wz-grid-confirm">
        <div className="wz-card">
          <div className="wz-eyebrow"><Icon.shieldCheck size={14} /> {w.s3.eyebrow}</div>
          <h1 className="wz-h" style={{ fontSize: 28 }}>{w.s3.h}</h1>
          <p className="wz-sub" style={{ marginBottom: 20 }}>{w.s3.sub}</p>
          <ProfileCard c={selected} selectable={false} reviewsLabel={w.s2.reviews} />
          <div className="feasible">
            <div className="feasible-head"><Icon.checkCircle /> {w.s3.checkTitle}</div>
            <div className="feasible-rows">
              {w.s3.rows.map((r, i) => (
                <div className="feasible-row" key={i}>
                  <Icon.check /> <span className="lbl">{r.l}</span> <span className="val">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="wz-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={() => go(1)}><Icon.arrowLeft size={17} /> {w.back}</button>
            <button className="btn btn-primary grow" onClick={() => { persistCheck(); go(3); }}>{w.s3.button} <Icon.arrowRight size={18} /></button>
          </div>
          <div className="wz-trust-strip">
            {w.trustStrip.slice(3).map((x, i) => <span className="t" key={i}><Icon.check /> {x}</span>)}
          </div>
        </div>
        <aside className="wz-aside">
          <div className="stat-card">
            <div className="stat-num">{conv.successRate.split(" ")[0]}</div>
            <div className="stat-lbl">{conv.successRate.replace(/^\S+\s/, "")}</div>
          </div>
          <Testimonial q={conv.quotes[1]} />
        </aside>
      </div>
    );
  }

  function StepService() {
    const opts = [
      { id: "remove", t: w.s4.opt1.t, d: w.s4.opt1.d, price: p.deletion, badge: w.s4.opt1.badge, ic: "trash" },
      { id: "reset", t: w.s4.opt2.t, d: w.s4.opt2.d, price: p.reset, badge: w.s4.opt2.badge, ic: "refresh" },
    ];
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.trash size={14} /> {w.s4.eyebrow}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{w.s4.h}</h1>
        <p className="wz-sub" style={{ marginBottom: 22 }}>{w.s4.sub}</p>
        <div className="opt-list">
          {opts.map((o) => {
            const I = Icon[o.ic] || Icon.trash;
            return (
              <div className={"opt" + (service === o.id ? " sel" : "")} key={o.id} onClick={() => setService(o.id)}>
                <div className="opt-radio"></div>
                <div className="opt-ic"><I size={22} /></div>
                <div className="opt-main">
                  <div className="ot">{o.t} {o.badge && <span className="obadge">{o.badge}</span>}</div>
                  <div className="od">{o.d}</div>
                </div>
                <div className="opt-price">{money(lang, o.price)}<small>{wm.afterSuccess}</small></div>
              </div>
            );
          })}
        </div>

        <div className={"express" + (express ? " on" : "")} onClick={() => setExpress(!express)}>
          <div className="ex-ic"><Icon.zap size={24} /></div>
          <div className="ex-main">
            <div className="ex-eyebrow">{conv.expEyebrow}</div>
            <h4>{conv.expTitle} <span className="ex-price">+{money(lang, p.express)}</span></h4>
            <p>{conv.expDesc}</p>
            <div className="ex-guarantee"><Icon.shieldCheck size={14} /> {conv.expGuarantee}</div>
            <div className="ex-slots"><span className="ex-dot"></span> {conv.expSlots(3)}</div>
          </div>
          <button className={"switch" + (express ? " on" : "")} aria-label="toggle" onClick={(e) => { e.stopPropagation(); setExpress(!express); }}></button>
        </div>

        <div className="svc-cta">
          <div className="svc-total">
            <span className="st-l">{conv.subtotal}</span>
            <span className="st-v">{fmtMoney(lang, leistungTotal)}</span>
          </div>
          <div className="wz-actions">
            <button className="btn btn-secondary" onClick={() => go(2)}><Icon.arrowLeft size={17} /> {w.back}</button>
            <button className="btn btn-primary grow" onClick={() => go(4)}>{conv.toProtect} <Icon.arrowRight size={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  function StepProtect() {
    const nudge = PROT_NUDGE[t.code] || PROT_NUDGE.en;
    const tiers = [
      { id: "monthly", label: conv.tierMonthlyLabel, price: money(lang, p.protMonthly), per: conv.perMonthShort, desc: conv.tierMonthlyDesc, badge: null, foot: null },
      { id: "monitor", label: conv.tierMonitorLabel, price: money(lang, p.protMonitor), per: conv.perMonthShort, desc: conv.tierMonitorDesc, badge: conv.tierMonitorBadge, foot: conv.monitorMath },
      { id: "lifetime", label: conv.tierLifetimeLabel, price: money(lang, p.protLifetime), per: conv.onceShort, desc: conv.tierLifetimeDesc, badge: conv.tierLifetimeBadge, foot: conv.lifetimeMath },
    ];
    return (
      <div className="wz-card">
        <div className="wz-eyebrow"><Icon.shieldCheck size={14} /> {conv.protStepLabel}</div>
        <h1 className="wz-h" style={{ fontSize: 28 }}>{conv.protH}</h1>
        <p className="wz-sub" style={{ marginBottom: 8 }}>{conv.protSub}</p>
        <div className="prot-eyebrow" style={{ marginBottom: 18 }}><Icon.star size={13} /> {conv.protEyebrow}</div>

        <div className="tier-grid">
          {tiers.map((tier) => (
            <button key={tier.id} className={"tier" + (protection === tier.id ? " sel" : "") + (tier.badge === conv.tierLifetimeBadge ? " best" : "")} onClick={() => setProtection(tier.id)}>
              {tier.badge && <span className={"tier-badge" + (tier.badge === conv.tierLifetimeBadge ? " gold" : "")}>{tier.badge}</span>}
              <span className="tier-radio"></span>
              <span className="tier-label">{tier.label}</span>
              <span className="tier-price">{tier.price}<small>{tier.per}</small></span>
              <span className="tier-desc">{tier.desc}</span>
              {tier.foot && <span className="tier-foot"><Icon.check size={13} /> {tier.foot}</span>}
            </button>
          ))}
        </div>
        {protection
          ? <div className="prot-foot">
              <span className="prot-social"><Icon.shieldCheck size={15} /> {conv.keepProt}</span>
              <button className="prot-skip-link" onClick={() => setShowSkip(true)}>{conv.noProtLink}</button>
            </div>
          : <div className="no-prot">
              <Icon.alert />
              <div>
                <b>{conv.noProtTitle}</b>
                <div className="np-body">{conv.noProtBody}</div>
              </div>
              <button className="btn btn-primary sm" onClick={() => setProtection("monthly")}>{conv.addProtBack}</button>
            </div>
        }
        {showSkip && (
          <div className="mini-dialog">
            <Icon.alert />
            <div>
              <b>{w.s4.skipTitle}</b>
              <div style={{ marginTop: 4 }}>{w.s4.skipBody}</div>
              <div className="md-actions">
                <button className="keep" onClick={() => setShowSkip(false)}>{nudge.keep}</button>
                <button className="skip" onClick={() => { setProtection(null); setShowSkip(false); }}>{nudge.remove}</button>
              </div>
            </div>
          </div>
        )}

        <div className="risk-banner" style={{ marginTop: 20 }}><Icon.shieldCheck /> {t.riskReversal}</div>

        <div className="svc-cta">
          <div className="svc-total">
            <span className="st-l">{conv.totalAfter}</span>
            <span className="st-v">{fmtMoney(lang, oneTimeTotal)}{recurringNum > 0 && <em> + {money(lang, protPriceVal)} {conv.perMonthShort}</em>}</span>
          </div>
          <div className="wz-actions">
            <button className="btn btn-secondary" onClick={() => go(3)}><Icon.arrowLeft size={17} /> {w.back}</button>
            <button className="btn btn-primary grow" disabled={showSkip} onClick={() => go(5)}>{conv.toCheckout} <Icon.arrowRight size={18} /></button>
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
        {express && <div className="sum-row accent"><span className="sl"><Icon.zap /> {conv.sumExpress}</span><span className="sv">+{fmtMoney(lang, num(p.express))}</span></div>}
        <div className={"sum-row" + (protection ? "" : " muted")}>
          <span className="sl">{w.s5.sumProtect}{protLabel ? `: ${protLabel}` : ""}</span>
          <span className="sv">{protection ? (protection === "lifetime" ? fmtMoney(lang, num(p.protLifetime)) : `${money(lang, protPriceVal)} ${conv.perMonthShort}`) : w.s5.noneProtect}</span>
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
          <div className="form-grid">
            <div className={"fld full" + (errors.name ? " err" : "")}>
              <label>{w.s5.f.name}</label>
              <input value={contact.name} onChange={set("name")} placeholder={w.s5.f.name} />
              {errors.name && <div className="emsg">{errors.name}</div>}
            </div>
            <div className={"fld" + (errors.email ? " err" : "")}>
              <label>{w.s5.f.email}</label>
              <input value={contact.email} onChange={set("email")} placeholder="name@firma.com" />
              {errors.email && <div className="emsg">{errors.email}</div>}
            </div>
            <div className="fld">
              <label>{w.s5.f.phone}</label>
              <input value={contact.phone} onChange={set("phone")} placeholder="+43 …" />
            </div>
            <div className="fld full">
              <label>{w.s5.f.company}</label>
              <input value={contact.company} onChange={set("company")} placeholder={w.s5.f.company} />
            </div>
          </div>

          {!express && (
            <div className="last-chance" onClick={() => setExpress(true)}>
              <div className="lc-ic"><Icon.zap size={20} /></div>
              <div className="lc-main">
                <b>{conv.lastChanceTitle} <span className="lc-price">+{money(lang, p.express)}</span></b>
                <p>{conv.lastChanceDesc}</p>
              </div>
              <button className="btn btn-primary sm" onClick={(e) => { e.stopPropagation(); setExpress(true); }}>{conv.expAdd}</button>
            </div>
          )}

          <label className={"agb-consent" + (errors.agb ? " err" : "")} style={{ display: "flex", gap: 11, alignItems: "flex-start", marginTop: 22, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
            <input type="checkbox" checked={agbOk}
              onChange={(e) => { setAgbOk(e.target.checked); if (e.target.checked) setErrors((x) => { const { agb, ...r } = x; return r; }); }}
              style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: "var(--primary)", cursor: "pointer" }} />
            <span style={{ color: errors.agb ? "var(--danger)" : "inherit" }}>
              {ag.pre}
              <a href={t.code === "de" ? asset("/rapidremove-agb-datenschutz.pdf") : GTC_EN} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 700 }}
                onClick={(e) => e.stopPropagation()}>{ag.link}</a>
              {ag.post}
            </span>
          </label>
          {errors.agb && <div className="emsg" style={{ marginTop: 7, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>{errors.agb}</div>}
          <button className="btn btn-primary btn-block lg" style={{ marginTop: 16 }} onClick={submit}>
            <Icon.lock size={18} /> {w.s5.button}
          </button>
          <div className="risk-banner lg" style={{ marginTop: 14 }}><Icon.shieldCheck /> {t.riskReversal}</div>
          <div className="checkout-testi"><Testimonial q={conv.quotes[2]} /></div>
          <div className="wz-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-secondary" onClick={() => go(4)}><Icon.arrowLeft size={17} /> {w.back}</button>
          </div>
        </div>
        <OrderSummary />
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
        <div className="ty-next" style={{ background: "var(--orange-50)", borderColor: "var(--orange-200)" }}>
          <p style={{ display: "flex", gap: 10, alignItems: "flex-start" }}><Icon.star size={18} style={{ color: "var(--primary)", flex: "none", marginTop: 1 }} /> {w.s6.reviewHint}</p>
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
          <button className="btn btn-primary lg" onClick={() => window.open("#", "_self")}>{w.s6.portal} <Icon.arrowRight size={18} /></button>
          <button className="btn btn-secondary lg" onClick={onExit}>{w.s6.home}</button>
        </div>
      </div>
    );
  }

  const bodies = [StepName, StepSearch, StepConfirm, StepService, StepProtect, StepCheckout, StepDone];
  const Body = bodies[step];
  const wideStep = [0, 2, 4, 5].includes(step) && !processing;

  return (
    <div className="wz">
      <div className="wz-top">
        <div className="wz-top-inner">
          <img className="logo" src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" onClick={onExit} />
          <div className="wz-secure"><Icon.lock /> {w.secure}</div>
          <button className="back" onClick={onExit}><Icon.x size={16} /> {w.backHome}</button>
        </div>
      </div>
      <Stepper step={step} onNav={canStepBack ? go : null} />
      <TrustBar />
      <div className={"wz-body" + (wideStep ? " wide" : "")} ref={bodyRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="step-panel" key={step + (processing ? "p" : "") + phase}>
          {Body()}
        </div>
      </div>
      <ActivityToast />
    </div>
  );
}

export { Wizard };
