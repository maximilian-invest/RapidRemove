"use client";
/* RapidRemove — About / Über uns page (standalone route). */
import React from "react";
import { Icon } from "@/components/Icons";
import { Nav, Footer, WhatsAppFloat, useReveal, CountUp } from "@/components/Chrome";
import { LangContext, useLang } from "@/lib/lang-context";
import { I18N } from "@/lib/i18n";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";

const ABOUT_COPY = {
  de: {
    eyebrow: "Über uns",
    h1: "Der Weltmarktführer für die Löschung von Google-Profilen.",
    lead: "Wir geben Unternehmern die Kontrolle über ihren Ruf zurück – schnell, legal und ohne Risiko. Aus Österreich, für Kunden in über 30 Ländern.",
    missionLabel: "Unsere Mission",
    mission: ["Niemand sollte sich seinem Google-Eintrag ", "ausgeliefert", " fühlen. Wir nehmen Ihnen das Problem ab – und Sie zahlen erst, wenn es gelöst ist."],
    missionSign: "— Das Team von RapidRemove",
    storyH: "Aus Frust wurde eine Lösung.",
    story: [
      "RapidRemove entstand aus einer einfachen Beobachtung: Unternehmer waren ihren Google-Unternehmensprofilen schutzlos ausgeliefert. Fake-Bewertungen, veraltete Einträge, Rachekampagnen – und kein Knopf, um das Ganze zu beenden.",
      "Anwälte waren teuer, langsam und unsicher. Also haben wir einen besseren Weg gebaut: eine eigene, juristisch geprüfte Methode, die das gesamte Profil dauerhaft und über die offiziellen Schnittstellen entfernt.",
      "Heute ist daraus der weltweit führende Anbieter für die Löschung von Google-Unternehmensprofilen geworden – mit einem Versprechen, das alles zusammenhält: Bezahlung erst nach Erfolg.",
    ],
    timeline: [
      { y: "2021", t: "Der Anfang", d: "Gegründet in Hallein, Österreich – aus dem Frust über die Ohnmacht gegenüber Google." },
      { y: "2023", t: "Eigene Methode", d: "Entwicklung eines juristisch geprüften Verfahrens über offizielle Schnittstellen." },
      { y: "2024", t: "International", d: "Expansion in über 30 Länder, vollständig mehrsprachig." },
      { y: "2026", t: "Weltmarktführer", d: "Über 1.000 entfernte Profile und 5,0★ auf Trustpilot." },
    ],
    statsLabel: "RapidRemove in Zahlen",
    stats: [
      { v: 1000, suf: "+", l: "entfernte Profile" },
      { v: 30, suf: "+", l: "Länder weltweit" },
      { v: 98, suf: " %", l: "Erfolgsquote" },
      { fmt: "5,0 ★", l: "auf Trustpilot" },
    ],
    valuesLabel: "Wofür wir stehen",
    valuesH: "Vertrauen ist kein Feature. Es ist das Fundament.",
    values: [
      { ic: "shieldCheck", t: "Kein Erfolg, keine Kosten", d: "Sie zahlen ausschließlich nach erfolgreicher Löschung. Bleibt das Profil online, zahlen Sie nichts." },
      { ic: "gavel", t: "100 % legal", d: "Unsere Methode ist juristisch geprüft und arbeitet ausschließlich über offizielle Schnittstellen." },
      { ic: "lock", t: "Diskret & DSGVO-konform", d: "Server in der EU, kein Zugriff auf Ihr Konto oder persönliche Daten. Ihr Anliegen bleibt vertraulich." },
    ],
    teamLabel: "Das Team",
    teamH: "Spezialisten, die Ihren Fall persönlich betreuen.",
    team: [
      { n: "Matthias", r: "Gründer & Geschäftsführung", thm: "tm-orange", img: null },
      { n: "Maximilian Hölzl", r: "Gründer", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" },
      { n: "Lena", r: "Leitung Reputation", thm: "tm-teal" },
      { n: "Dr. Stein", r: "Recht & Compliance", thm: "tm-plum" },
      { n: "Sophie", r: "Kundenbetreuung", thm: "tm-orange" },
    ],
    coH: "Ein Unternehmen aus Österreich – mit Namen und Adresse.",
    coSub: "Hinter RapidRemove steht eine eingetragene Firma in Österreich – kein anonymer Anbieter, sondern ein EU-Betrieb mit klaren, offenen Daten.",
    coFacts: [
      { l: "Firma", v: "Simple Solution OG" },
      { l: "Adresse", v: "Salzgasse 2, 5400 Hallein, Österreich" },
      { l: "UID-Nummer", v: "ATU72401536" },
      { l: "Kontakt", v: "hallo@rapid-remove.com" },
    ],
    coBadges: ["DSGVO-konform", "Server in der EU", "Juristisch geprüft", "Made in Austria"],
    ctaTitle: "Lernen Sie uns kennen – mit dem Gratis-Check.",
    ctaBtn: "Gratis prüfen",
  },
  en: {
    eyebrow: "About us",
    h1: "The world leader in deleting Google profiles.",
    lead: "We give business owners back control over their reputation – fast, legal and risk-free. From Austria, for clients in 30+ countries.",
    missionLabel: "Our mission",
    mission: ["No one should feel ", "at the mercy", " of their Google listing. We take the problem off your hands – and you only pay once it's solved."],
    missionSign: "— The RapidRemove team",
    storyH: "Frustration became a solution.",
    story: [
      "RapidRemove began with a simple observation: business owners were defenceless against their Google business profiles. Fake reviews, outdated listings, revenge campaigns – and no button to end it.",
      "Lawyers were expensive, slow and uncertain. So we built a better way: our own, lawyer-reviewed method that removes the entire profile permanently and through official channels.",
      "Today it has become the world's leading provider for removing Google business profiles – held together by one promise: payment only after success.",
    ],
    timeline: [
      { y: "2021", t: "The beginning", d: "Founded in Hallein, Austria – out of frustration with powerlessness against Google." },
      { y: "2023", t: "Our own method", d: "Developed a lawyer-reviewed process working through official channels." },
      { y: "2024", t: "International", d: "Expanded into 30+ countries, fully multilingual." },
      { y: "2026", t: "World leader", d: "Over 1,000 profiles removed and 5.0★ on Trustpilot." },
    ],
    statsLabel: "RapidRemove in numbers",
    stats: [
      { v: 1000, suf: "+", l: "profiles removed" },
      { v: 30, suf: "+", l: "countries worldwide" },
      { v: 98, suf: "%", l: "success rate" },
      { fmt: "5.0 ★", l: "on Trustpilot" },
    ],
    valuesLabel: "What we stand for",
    valuesH: "Trust isn't a feature. It's the foundation.",
    values: [
      { ic: "shieldCheck", t: "No success, no cost", d: "You pay exclusively after successful removal. If the profile stays online, you pay nothing." },
      { ic: "gavel", t: "100% legal", d: "Our method is lawyer-reviewed and works exclusively through official channels." },
      { ic: "lock", t: "Discreet & GDPR-compliant", d: "EU servers, no access to your account or personal data. Your case stays confidential." },
    ],
    teamLabel: "The team",
    teamH: "Specialists who handle your case personally.",
    team: [
      { n: "Matthias", r: "Founder & CEO", thm: "tm-orange", img: null },
      { n: "Maximilian Hölzl", r: "Founder", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" },
      { n: "Lena", r: "Head of Reputation", thm: "tm-teal" },
      { n: "Dr. Stein", r: "Law & Compliance", thm: "tm-plum" },
      { n: "Sophie", r: "Customer Care", thm: "tm-orange" },
    ],
    coH: "A company from Austria – with a name and an address.",
    coSub: "Behind RapidRemove is a registered company in Austria – not an anonymous provider, but an EU business with clear, open details.",
    coFacts: [
      { l: "Company", v: "Simple Solution OG" },
      { l: "Address", v: "Salzgasse 2, 5400 Hallein, Austria" },
      { l: "VAT ID", v: "ATU72401536" },
      { l: "Contact", v: "hello@rapid-remove.com" },
    ],
    coBadges: ["GDPR-compliant", "EU servers", "Lawyer-reviewed", "Made in Austria"],
    ctaTitle: "Get to know us – with the free check.",
    ctaBtn: "Check for free",
  },
};
Object.assign(ABOUT_COPY, {
  ja: {
    eyebrow: "会社概要", h1: "Googleプロフィール削除の世界的リーダー。",
    lead: "私たちは経営者に評判のコントロールを取り戻します ― 速く、合法的に、リスクなく。オーストリアから、30か国以上のお客様へ。",
    missionLabel: "私たちの使命", mission: ["誰も自分のGoogle掲載に", "翻弄される", "べきではありません。私たちが問題を引き受けます ― そしてお支払いは解決後だけです。"], missionSign: "— RapidRemoveチーム",
    storyH: "不満から解決策が生まれました。",
    story: ["RapidRemoveは単純な気づきから生まれました。経営者は自分のGoogleビジネスプロフィールに対して無防備でした。偽レビュー、古い掲載、報復キャンペーン ― そしてそれを終わらせるボタンがありません。", "弁護士は高額で、遅く、不確実でした。そこで私たちはより良い方法を作りました。公式な手続きを通じてプロフィール全体を永久に削除する、独自の弁護士確認済みの手法です。", "今日それは、Googleビジネスプロフィール削除の世界的リーダーへと成長しました ― すべてをつなぐ1つの約束とともに。成功後にのみお支払い。"],
    timeline: [{ y: "2021", t: "始まり", d: "オーストリア・ハラインで創業 ― Googleへの無力感への不満から。" }, { y: "2023", t: "独自の手法", d: "公式な手続きを通じた、弁護士確認済みのプロセスを開発。" }, { y: "2024", t: "国際展開", d: "30か国以上へ拡大、完全多言語対応。" }, { y: "2026", t: "世界的リーダー", d: "1,000件以上のプロフィール削除、Trustpilotで5.0★。" }],
    statsLabel: "数字で見るRapidRemove", stats: [{ v: 1000, suf: "+", l: "削除したプロフィール" }, { v: 30, suf: "+", l: "世界の国" }, { v: 98, suf: " %", l: "成功率" }, { fmt: "5.0 ★", l: "Trustpilot" }],
    valuesLabel: "私たちの価値観", valuesH: "信頼は機能ではありません。土台です。",
    values: [{ ic: "shieldCheck", t: "成功しなければ費用なし", d: "削除に成功した後にのみお支払いいただきます。プロフィールがオンラインのままなら、お支払いは不要です。" }, { ic: "gavel", t: "100% 合法", d: "私たちの手法は弁護士の確認を受け、公式な手続きのみを通じて行われます。" }, { ic: "lock", t: "秘密厳守・GDPR準拠", d: "EUサーバー、アカウントや個人データへのアクセスなし。あなたの案件は秘密に扱われます。" }],
    teamLabel: "チーム", teamH: "あなたのケースを個別に担当する専門家。",
    team: [{ n: "Matthias", r: "創業者・経営", thm: "tm-orange", img: null }, { n: "Maximilian Hölzl", r: "創業者", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" }, { n: "Lena", r: "評判管理責任者", thm: "tm-teal" }, { n: "Dr. Stein", r: "法務・コンプライアンス", thm: "tm-plum" }, { n: "Sophie", r: "カスタマーサポート", thm: "tm-orange" }],
    coH: "実在する会社。名前と住所があります。", coSub: "RapidRemoveの背後にはオーストリアの登記済み企業があります ― 匿名の業者ではなく、明確な情報を持つ実在のEU事業者です。",
    coFacts: [{ l: "会社", v: "Simple Solution OG" }, { l: "住所", v: "Salzgasse 2, 5400 Hallein, オーストリア" }, { l: "UID番号", v: "ATU72401536" }, { l: "連絡先", v: "hallo@rapid-remove.com" }],
    coBadges: ["GDPR準拠", "EUサーバー", "弁護士確認済み", "Made in Austria"], ctaTitle: "無料チェックで私たちを知ってください。", ctaBtn: "無料でチェック",
  },
  sv: {
    eyebrow: "Om oss", h1: "Världsledaren inom borttagning av Google-profiler.",
    lead: "Vi ger företagare tillbaka kontrollen över sitt rykte – snabbt, lagligt och riskfritt. Från Österrike, för kunder i 30+ länder.",
    missionLabel: "Vårt uppdrag", mission: ["Ingen ska känna sig ", "utlämnad", " åt sin Google-annons. Vi tar problemet ur dina händer – och du betalar först när det är löst."], missionSign: "— Teamet på RapidRemove",
    storyH: "Frustration blev en lösning.",
    story: ["RapidRemove började med en enkel observation: företagare var försvarslösa mot sina Google-företagsprofiler. Falska omdömen, föråldrade annonser, hämndkampanjer – och ingen knapp för att få slut på det.", "Advokater var dyra, långsamma och osäkra. Så vi byggde en bättre väg: vår egen, juridiskt granskade metod som tar bort hela profilen permanent och via officiella kanaler.", "Idag har det blivit världens ledande leverantör för borttagning av Google-företagsprofiler – sammanhållet av ett löfte: betalning först efter framgång."],
    timeline: [{ y: "2021", t: "Början", d: "Grundat i Hallein, Österrike – ur frustration över maktlöshet mot Google." }, { y: "2023", t: "Egen metod", d: "Utvecklade en juridiskt granskad process via officiella kanaler." }, { y: "2024", t: "Internationellt", d: "Expanderade till 30+ länder, helt flerspråkigt." }, { y: "2026", t: "Världsledare", d: "Över 1 000 profiler borttagna och 5,0★ på Trustpilot." }],
    statsLabel: "RapidRemove i siffror", stats: [{ v: 1000, suf: "+", l: "profiler borttagna" }, { v: 30, suf: "+", l: "länder världen över" }, { v: 98, suf: " %", l: "framgångsgrad" }, { fmt: "5,0 ★", l: "på Trustpilot" }],
    valuesLabel: "Vad vi står för", valuesH: "Förtroende är ingen funktion. Det är grunden.",
    values: [{ ic: "shieldCheck", t: "Ingen framgång, ingen kostnad", d: "Du betalar uteslutande efter lyckad borttagning. Förblir profilen online betalar du inget." }, { ic: "gavel", t: "100 % lagligt", d: "Vår metod är juridiskt granskad och arbetar uteslutande via officiella kanaler." }, { ic: "lock", t: "Diskret & GDPR-anpassat", d: "EU-servrar, ingen åtkomst till ditt konto eller persondata. Ditt ärende förblir konfidentiellt." }],
    teamLabel: "Teamet", teamH: "Specialister som hanterar ditt ärende personligen.",
    team: [{ n: "Matthias", r: "Grundare & VD", thm: "tm-orange", img: null }, { n: "Maximilian Hölzl", r: "Grundare", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" }, { n: "Lena", r: "Chef Rykte", thm: "tm-teal" }, { n: "Dr. Stein", r: "Juridik & Compliance", thm: "tm-plum" }, { n: "Sophie", r: "Kundtjänst", thm: "tm-orange" }],
    coH: "Ett riktigt företag. Med namn och adress.", coSub: "Bakom RapidRemove står ett registrerat företag i Österrike – ingen anonym leverantör, utan ett riktigt EU-företag med tydliga uppgifter.",
    coFacts: [{ l: "Företag", v: "Simple Solution OG" }, { l: "Adress", v: "Salzgasse 2, 5400 Hallein, Österrike" }, { l: "Momsnr", v: "ATU72401536" }, { l: "Kontakt", v: "hallo@rapid-remove.com" }],
    coBadges: ["GDPR-anpassat", "EU-servrar", "Juridiskt granskat", "Made in Austria"], ctaTitle: "Lär känna oss – med den gratis kollen.", ctaBtn: "Kolla gratis",
  },
  da: {
    eyebrow: "Om os", h1: "Verdensføreren i fjernelse af Google-profiler.",
    lead: "Vi giver virksomhedsejere kontrollen over deres omdømme tilbage – hurtigt, lovligt og uden risiko. Fra Østrig, for kunder i 30+ lande.",
    missionLabel: "Vores mission", mission: ["Ingen bør føle sig ", "prisgivet", " sin Google-annonce. Vi tager problemet ud af dine hænder – og du betaler først, når det er løst."], missionSign: "— Teamet hos RapidRemove",
    storyH: "Frustration blev til en løsning.",
    story: ["RapidRemove begyndte med en enkel observation: virksomhedsejere var forsvarsløse over for deres Google-virksomhedsprofiler. Falske anmeldelser, forældede annoncer, hævnkampagner – og ingen knap til at gøre en ende på det.", "Advokater var dyre, langsomme og usikre. Så vi byggede en bedre vej: vores egen, juridisk gennemgåede metode, der fjerner hele profilen permanent og via officielle kanaler.", "I dag er det blevet verdens førende udbyder af fjernelse af Google-virksomhedsprofiler – holdt sammen af ét løfte: betaling først efter succes."],
    timeline: [{ y: "2021", t: "Begyndelsen", d: "Grundlagt i Hallein, Østrig – ud af frustration over magtesløshed mod Google." }, { y: "2023", t: "Egen metode", d: "Udviklede en juridisk gennemgået proces via officielle kanaler." }, { y: "2024", t: "Internationalt", d: "Udvidede til 30+ lande, fuldt flersproget." }, { y: "2026", t: "Verdensfører", d: "Over 1.000 profiler fjernet og 5,0★ på Trustpilot." }],
    statsLabel: "RapidRemove i tal", stats: [{ v: 1000, suf: "+", l: "profiler fjernet" }, { v: 30, suf: "+", l: "lande verden over" }, { v: 98, suf: " %", l: "succesrate" }, { fmt: "5,0 ★", l: "på Trustpilot" }],
    valuesLabel: "Hvad vi står for", valuesH: "Tillid er ikke en funktion. Det er fundamentet.",
    values: [{ ic: "shieldCheck", t: "Ingen succes, ingen omkostning", d: "Du betaler udelukkende efter vellykket fjernelse. Forbliver profilen online, betaler du intet." }, { ic: "gavel", t: "100 % lovligt", d: "Vores metode er juridisk gennemgået og arbejder udelukkende via officielle kanaler." }, { ic: "lock", t: "Diskret & GDPR-overholdende", d: "EU-servere, ingen adgang til din konto eller persondata. Din sag forbliver fortrolig." }],
    teamLabel: "Teamet", teamH: "Specialister, der håndterer din sag personligt.",
    team: [{ n: "Matthias", r: "Grundlægger & CEO", thm: "tm-orange", img: null }, { n: "Maximilian Hölzl", r: "Grundlægger", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" }, { n: "Lena", r: "Chef for omdømme", thm: "tm-teal" }, { n: "Dr. Stein", r: "Jura & Compliance", thm: "tm-plum" }, { n: "Sophie", r: "Kundeservice", thm: "tm-orange" }],
    coH: "En rigtig virksomhed. Med navn og adresse.", coSub: "Bag RapidRemove står en registreret virksomhed i Østrig – ingen anonym udbyder, men en rigtig EU-virksomhed med klare oplysninger.",
    coFacts: [{ l: "Virksomhed", v: "Simple Solution OG" }, { l: "Adresse", v: "Salzgasse 2, 5400 Hallein, Østrig" }, { l: "Momsnr.", v: "ATU72401536" }, { l: "Kontakt", v: "hallo@rapid-remove.com" }],
    coBadges: ["GDPR-overholdende", "EU-servere", "Juridisk gennemgået", "Made in Austria"], ctaTitle: "Lær os at kende – med det gratis tjek.", ctaBtn: "Tjek gratis",
  },
  no: {
    eyebrow: "Om oss", h1: "Verdenslederen innen fjerning av Google-profiler.",
    lead: "Vi gir bedriftseiere tilbake kontrollen over omdømmet sitt – raskt, lovlig og uten risiko. Fra Østerrike, for kunder i 30+ land.",
    missionLabel: "Vårt oppdrag", mission: ["Ingen bør føle seg ", "prisgitt", " sin Google-oppføring. Vi tar problemet ut av hendene dine – og du betaler først når det er løst."], missionSign: "— Teamet i RapidRemove",
    storyH: "Frustrasjon ble til en løsning.",
    story: ["RapidRemove begynte med en enkel observasjon: bedriftseiere var forsvarsløse mot sine Google-bedriftsprofiler. Falske omtaler, utdaterte oppføringer, hevnkampanjer – og ingen knapp for å få slutt på det.", "Advokater var dyre, trege og usikre. Så vi bygde en bedre vei: vår egen, juridisk vurderte metode som fjerner hele profilen permanent og via offisielle kanaler.", "I dag har det blitt verdens ledende leverandør for fjerning av Google-bedriftsprofiler – holdt sammen av ett løfte: betaling først etter suksess."],
    timeline: [{ y: "2021", t: "Begynnelsen", d: "Grunnlagt i Hallein, Østerrike – ut av frustrasjon over maktesløshet mot Google." }, { y: "2023", t: "Egen metode", d: "Utviklet en juridisk vurdert prosess via offisielle kanaler." }, { y: "2024", t: "Internasjonalt", d: "Utvidet til 30+ land, fullt flerspråklig." }, { y: "2026", t: "Verdensleder", d: "Over 1 000 profiler fjernet og 5,0★ på Trustpilot." }],
    statsLabel: "RapidRemove i tall", stats: [{ v: 1000, suf: "+", l: "profiler fjernet" }, { v: 30, suf: "+", l: "land verden over" }, { v: 98, suf: " %", l: "suksessrate" }, { fmt: "5,0 ★", l: "på Trustpilot" }],
    valuesLabel: "Hva vi står for", valuesH: "Tillit er ingen funksjon. Det er fundamentet.",
    values: [{ ic: "shieldCheck", t: "Ingen suksess, ingen kostnad", d: "Du betaler utelukkende etter vellykket fjerning. Forblir profilen på nett, betaler du ingenting." }, { ic: "gavel", t: "100 % lovlig", d: "Metoden vår er juridisk vurdert og arbeider utelukkende via offisielle kanaler." }, { ic: "lock", t: "Diskret & GDPR-tilpasset", d: "EU-servere, ingen tilgang til kontoen eller persondataene dine. Saken din forblir konfidensiell." }],
    teamLabel: "Teamet", teamH: "Spesialister som håndterer saken din personlig.",
    team: [{ n: "Matthias", r: "Grunnlegger & CEO", thm: "tm-orange", img: null }, { n: "Maximilian Hölzl", r: "Grunnlegger", thm: "tm-ink", img: "/assets/maximilian-hoelzl.jpg" }, { n: "Lena", r: "Leder omdømme", thm: "tm-teal" }, { n: "Dr. Stein", r: "Juss & Compliance", thm: "tm-plum" }, { n: "Sophie", r: "Kundestøtte", thm: "tm-orange" }],
    coH: "Et ekte selskap. Med navn og adresse.", coSub: "Bak RapidRemove står et registrert selskap i Østerrike – ingen anonym leverandør, men et ekte EU-selskap med tydelige opplysninger.",
    coFacts: [{ l: "Selskap", v: "Simple Solution OG" }, { l: "Adresse", v: "Salzgasse 2, 5400 Hallein, Østerrike" }, { l: "Mva-nr.", v: "ATU72401536" }, { l: "Kontakt", v: "hallo@rapid-remove.com" }],
    coBadges: ["GDPR-tilpasset", "EU-servere", "Juridisk vurdert", "Made in Austria"], ctaTitle: "Bli kjent med oss – med den gratis sjekken.", ctaBtn: "Sjekk gratis",
  },
});

// ES/FR/IT/NL/PT reuse the EN structure (nav label itself is localized).
["es", "fr", "it", "nl", "pt"].forEach((k) => { if (!ABOUT_COPY[k]) ABOUT_COPY[k] = ABOUT_COPY.en; });

function FinalCTABand({ onStart, title, btn }) {
  return (
    <section className="band tight">
      <div className="container">
        <div className="cta-band reveal">
          <div className="glow"></div>
          <h2>{title}</h2>
          <div style={{ position: "relative", marginTop: 8 }}>
            <button className="btn btn-white lg" onClick={() => onStart()}><Icon.search size={19} /> {btn} <Icon.arrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutInner() {
  const { t } = useLang();
  const a = ABOUT_COPY[t.code] || ABOUT_COPY.en;
  useReveal();
  const nav = (p) => { window.location.href = asset(p); };
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="about">
      <Nav onNav={(id) => nav("/#" + id)} onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={toTop} onOrm={() => nav("/?view=reputation")} onDeindex={() => nav("/?view=presse")} active="about" />

      <section className="ab-hero">
        <div className="hero-glow"></div>
        <div className="container">
          <div className="ab-eyebrow reveal"><Icon.rocket size={15} /> {a.eyebrow}</div>
          <h1 className="reveal d1">{a.h1}</h1>
          <p className="ab-lead reveal d2">{a.lead}</p>
        </div>
      </section>

      <section className="ab-mission">
        <div className="glow"></div>
        <div className="container">
          <div className="eyebrow reveal" style={{ color: "var(--orange-400)" }}>{a.missionLabel}</div>
          <div className="mq reveal d1">{a.mission[0]}<b>{a.mission[1]}</b>{a.mission[2]}</div>
          <div className="msign reveal d2">{a.missionSign}</div>
        </div>
      </section>

      <section className="ab-story">
        <div className="container ab-story-grid">
          <div className="reveal">
            <h2>{a.storyH}</h2>
            {a.story.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="ab-timeline reveal d1">
            {a.timeline.map((tl, i) => (
              <div className="ab-tl" key={i}>
                <div className="tl-rail"></div>
                <div className="tl-year">{tl.y}</div>
                <div className="tl-body">
                  <h4>{tl.t}</h4>
                  <p>{tl.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-stats">
        <div className="container">
          <div className="ab-stats-grid">
            {a.stats.map((s, i) => (
              <div className="ab-stat reveal" key={i}>
                <div className="v">{s.fmt ? s.fmt : <CountUp end={s.v} suffix={s.suf} />}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-values">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.shieldCheck size={15} /> {a.valuesLabel}</span>
            <h2>{a.valuesH}</h2>
          </div>
          <div className="ab-val-grid">
            {a.values.map((v, i) => {
              const I = Icon[v.ic] || Icon.shieldCheck;
              return (
                <div className={"ab-val reveal d" + (i + 1)} key={i}>
                  <div className="vic"><I size={26} /></div>
                  <h3>{v.t}</h3>
                  <p>{v.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ab-team">
        <div className="container">
          <div className="sec-head center reveal">
            <span className="eyebrow"><Icon.user size={15} /> {a.teamLabel}</span>
            <h2>{a.teamH}</h2>
          </div>
          <div className="ab-team-grid">
            {a.team.map((m, i) => (
              <div className={"ab-member reveal d" + ((i % 4) + 1)} key={i}>
                <div className={"m-photo " + m.thm}>
                  {m.img
                    ? <img src={asset(m.img)} alt={m.n} />
                    : <span className="m-initial">{m.n[0]}</span>}
                </div>
                <div className="m-name">{m.n}</div>
                <div className="m-role">{m.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-company">
        <div className="container">
          <div className="ab-co-card reveal">
            <div>
              <h2>{a.coH}</h2>
              <p className="co-sub">{a.coSub}</p>
              <div className="ab-co-badges">
                {a.coBadges.map((b, i) => <span className="b" key={i}><Icon.check /> {b}</span>)}
              </div>
            </div>
            <div className="ab-co-facts">
              {a.coFacts.map((f, i) => (
                <div className="ab-co-row" key={i}>
                  <Icon.building />
                  <div>
                    <div className="crl">{f.l}</div>
                    <div className="crv">{f.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FinalCTABand onStart={() => nav("/?start=1")} title={a.ctaTitle} btn={a.ctaBtn} />

      <Footer onStart={() => nav("/?start=1")} onBlog={() => nav("/?view=magazin")} onAbout={toTop} />
      <WhatsAppFloat />
    </div>
  );
}

export default function About() {
  const [lang, setLangState] = React.useState("de");
  React.useEffect(() => {
    try { const s = localStorage.getItem("rr_lang"); if (s && I18N[s]) setLangState(s); } catch (e) {}
  }, []);
  const setLang = (l) => {
    try { localStorage.setItem("rr_lang", l); } catch (e) {}
    window.location.href = asset(localePath(l));
  };
  const t = I18N[lang] || I18N.de;
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <AboutInner />
    </LangContext.Provider>
  );
}
