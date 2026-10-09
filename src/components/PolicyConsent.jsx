"use client";
/* Pflicht-Bestätigung bei Einzelbewertungen (nicht bei Profil-Löschung): Kunde versichert, dass die ausgewählten Bewertungen
   nach bestem Wissen gegen die Google-Richtlinien verstoßen. „Google-Richtlinien" (blau) öffnet ein Fenster mit den typischen
   Verstößen (Handy: von unten). Nachweis (Zeit, IP, Gerät, Sprache, Textversion) speichert der Server beim Auftrag. */
import React from "react";
import { createPortal } from "react-dom";

export const POLICY_V = "2026-10-09";
const GURL = (l) => `https://support.google.com/contributionpolicy/answer/7400114?hl=${l || "en"}`;

const T = {
  de: {
    pre: "Ich versichere, dass die ausgewählten Bewertungen nach meinem besten Wissen gegen die ", link: "Google-Richtlinien", post: " verstoßen (z. B. kein echter Kunde, Mitbewerber, Beleidigung, falsche Tatsachenbehauptung).",
    err: "Bitte bestätigen Sie, dass die Bewertungen gegen die Google-Richtlinien verstoßen.",
    h: "Was gegen die Google-Richtlinien verstößt", intro: "Google entfernt Bewertungen, die gegen die Richtlinien für Beiträge verstoßen. Typische Fälle:",
    items: [
      ["Fake & Spam", "Keine echte Erfahrung mit dem Unternehmen, gefälschte oder gekaufte Bewertungen, Mehrfach-Bewertungen."],
      ["Interessenkonflikt", "Bewertungen von Mitbewerbern oder (ehemaligen) Mitarbeitern."],
      ["Themenfremd", "Inhalte ohne Bezug zur Erfahrung mit dem Unternehmen, z. B. Politik oder private Streitigkeiten."],
      ["Beleidigung & Belästigung", "Beschimpfungen, Drohungen, Mobbing oder Angriffe auf einzelne Personen."],
      ["Hassrede & Diskriminierung", "Herabwürdigung wegen Herkunft, Religion, Geschlecht, Behinderung o. Ä."],
      ["Falsche Behauptungen", "Unwahre Aussagen, die als Tatsache dargestellt werden, z. B. Betrug oder Diebstahl."],
      ["Persönliche Daten", "Namen, Telefonnummern, Adressen oder Gesundheitsdaten anderer Personen."],
      ["Anstößige & illegale Inhalte", "Sexuelle, gewaltverherrlichende, gefährliche oder illegale Inhalte."],
      ["Identitätsbetrug", "Bewertung im Namen einer anderen Person oder eines anderen Unternehmens."],
    ],
    src: "Offizielle Google-Richtlinien ansehen", ok: "Verstanden",
  },
  en: {
    pre: "I confirm that, to the best of my knowledge, the selected reviews violate the ", link: "Google policies", post: " (e.g. not a real customer, competitor, insults, false statements of fact).",
    err: "Please confirm that the reviews violate Google's policies.",
    h: "What violates Google's policies", intro: "Google removes reviews that break its contribution policies. Typical cases:",
    items: [
      ["Fake & spam", "No real experience with the business, fake or paid reviews, repeated reviews."],
      ["Conflict of interest", "Reviews by competitors or (former) employees."],
      ["Off-topic", "Content unrelated to an experience with the business, e.g. politics or personal disputes."],
      ["Insults & harassment", "Abuse, threats, bullying or attacks on individual people."],
      ["Hate speech & discrimination", "Demeaning people for their origin, religion, gender, disability or similar."],
      ["False statements", "Untrue claims presented as facts, e.g. fraud or theft."],
      ["Personal information", "Names, phone numbers, addresses or health details of other people."],
      ["Offensive & illegal content", "Sexual, violent, dangerous or illegal content."],
      ["Impersonation", "A review posted in the name of another person or business."],
    ],
    src: "View Google's official policies", ok: "Got it",
  },
  es: {
    pre: "Confirmo que, según mi leal saber y entender, las reseñas seleccionadas infringen las ", link: "políticas de Google", post: " (p. ej., no es un cliente real, competidor, insultos, afirmaciones falsas).",
    err: "Confirma que las reseñas infringen las políticas de Google.",
    h: "Qué infringe las políticas de Google", intro: "Google elimina las reseñas que incumplen sus políticas de contribución. Casos típicos:",
    items: [
      ["Falsas y spam", "Sin experiencia real con el negocio, reseñas falsas o compradas, reseñas repetidas."],
      ["Conflicto de intereses", "Reseñas de competidores o de (ex)empleados."],
      ["Fuera de tema", "Contenido sin relación con la experiencia en el negocio, p. ej. política o disputas personales."],
      ["Insultos y acoso", "Ofensas, amenazas, acoso o ataques a personas concretas."],
      ["Odio y discriminación", "Menosprecio por origen, religión, género, discapacidad u otros motivos."],
      ["Afirmaciones falsas", "Afirmaciones falsas presentadas como hechos, p. ej. estafa o robo."],
      ["Datos personales", "Nombres, teléfonos, direcciones o datos de salud de otras personas."],
      ["Contenido ofensivo o ilegal", "Contenido sexual, violento, peligroso o ilegal."],
      ["Suplantación", "Reseña publicada en nombre de otra persona o empresa."],
    ],
    src: "Ver las políticas oficiales de Google", ok: "Entendido",
  },
  fr: {
    pre: "Je confirme qu'à ma connaissance, les avis sélectionnés enfreignent les ", link: "règles de Google", post: " (p. ex. pas un vrai client, concurrent, insultes, fausses affirmations).",
    err: "Confirme que les avis enfreignent les règles de Google.",
    h: "Ce qui enfreint les règles de Google", intro: "Google supprime les avis qui enfreignent ses règles relatives aux contributions. Cas typiques :",
    items: [
      ["Faux avis & spam", "Aucune expérience réelle avec l'entreprise, avis faux ou achetés, avis répétés."],
      ["Conflit d'intérêts", "Avis de concurrents ou d'(anciens) employés."],
      ["Hors sujet", "Contenu sans lien avec une expérience dans l'entreprise, p. ex. politique ou conflits personnels."],
      ["Insultes & harcèlement", "Injures, menaces, harcèlement ou attaques contre des personnes."],
      ["Haine & discrimination", "Dénigrement en raison de l'origine, la religion, le sexe, un handicap, etc."],
      ["Fausses affirmations", "Affirmations fausses présentées comme des faits, p. ex. escroquerie ou vol."],
      ["Données personnelles", "Noms, numéros de téléphone, adresses ou données de santé d'autres personnes."],
      ["Contenu choquant ou illégal", "Contenu sexuel, violent, dangereux ou illégal."],
      ["Usurpation d'identité", "Avis publié au nom d'une autre personne ou entreprise."],
    ],
    src: "Voir les règles officielles de Google", ok: "Compris",
  },
  it: {
    pre: "Confermo che, per quanto a mia conoscenza, le recensioni selezionate violano le ", link: "norme di Google", post: " (ad es. non un vero cliente, concorrente, insulti, affermazioni false).",
    err: "Conferma che le recensioni violano le norme di Google.",
    h: "Cosa viola le norme di Google", intro: "Google rimuove le recensioni che violano le norme sui contributi. Casi tipici:",
    items: [
      ["Falsi e spam", "Nessuna esperienza reale con l'attività, recensioni false o comprate, recensioni ripetute."],
      ["Conflitto di interessi", "Recensioni di concorrenti o di (ex) dipendenti."],
      ["Fuori tema", "Contenuti non legati all'esperienza con l'attività, ad es. politica o liti personali."],
      ["Insulti e molestie", "Offese, minacce, bullismo o attacchi a singole persone."],
      ["Odio e discriminazione", "Denigrazione per origine, religione, genere, disabilità o simili."],
      ["Affermazioni false", "Affermazioni non vere presentate come fatti, ad es. truffa o furto."],
      ["Dati personali", "Nomi, numeri di telefono, indirizzi o dati sanitari di altre persone."],
      ["Contenuti offensivi o illegali", "Contenuti sessuali, violenti, pericolosi o illegali."],
      ["Furto d'identità", "Recensione pubblicata a nome di un'altra persona o azienda."],
    ],
    src: "Vedi le norme ufficiali di Google", ok: "Ho capito",
  },
  nl: {
    pre: "Ik verklaar dat de geselecteerde reviews naar mijn beste weten in strijd zijn met het ", link: "Google-beleid", post: " (bijv. geen echte klant, concurrent, beledigingen, onware feitelijke beweringen).",
    err: "Bevestig dat de reviews in strijd zijn met het Google-beleid.",
    h: "Wat in strijd is met het Google-beleid", intro: "Google verwijdert reviews die het beleid voor bijdragen schenden. Typische gevallen:",
    items: [
      ["Nep & spam", "Geen echte ervaring met het bedrijf, valse of gekochte reviews, herhaalde reviews."],
      ["Belangenconflict", "Reviews van concurrenten of (oud-)medewerkers."],
      ["Niet ter zake", "Inhoud zonder verband met een ervaring bij het bedrijf, bijv. politiek of persoonlijke ruzies."],
      ["Beledigingen & intimidatie", "Scheldwoorden, bedreigingen, pesten of aanvallen op personen."],
      ["Haat & discriminatie", "Kleineren vanwege afkomst, religie, geslacht, beperking e.d."],
      ["Onware beweringen", "Onware uitspraken die als feit worden gebracht, bijv. oplichting of diefstal."],
      ["Persoonsgegevens", "Namen, telefoonnummers, adressen of gezondheidsgegevens van anderen."],
      ["Aanstootgevend of illegaal", "Seksuele, gewelddadige, gevaarlijke of illegale inhoud."],
      ["Identiteitsfraude", "Review geplaatst namens een andere persoon of een ander bedrijf."],
    ],
    src: "Officieel Google-beleid bekijken", ok: "Begrepen",
  },
  pt: {
    pre: "Confirmo que, tanto quanto sei, as avaliações selecionadas violam as ", link: "políticas da Google", post: " (p. ex. não é um cliente real, concorrente, insultos, afirmações falsas).",
    err: "Confirma que as avaliações violam as políticas da Google.",
    h: "O que viola as políticas da Google", intro: "A Google remove avaliações que violam as políticas de contribuição. Casos típicos:",
    items: [
      ["Falsas e spam", "Sem experiência real com o negócio, avaliações falsas ou compradas, avaliações repetidas."],
      ["Conflito de interesses", "Avaliações de concorrentes ou de (ex-)funcionários."],
      ["Fora do tema", "Conteúdo sem relação com a experiência no negócio, p. ex. política ou disputas pessoais."],
      ["Insultos e assédio", "Ofensas, ameaças, assédio ou ataques a pessoas."],
      ["Ódio e discriminação", "Rebaixamento por origem, religião, género, deficiência ou semelhante."],
      ["Afirmações falsas", "Afirmações falsas apresentadas como factos, p. ex. burla ou roubo."],
      ["Dados pessoais", "Nomes, telefones, moradas ou dados de saúde de outras pessoas."],
      ["Conteúdo ofensivo ou ilegal", "Conteúdo sexual, violento, perigoso ou ilegal."],
      ["Falsificação de identidade", "Avaliação publicada em nome de outra pessoa ou empresa."],
    ],
    src: "Ver as políticas oficiais da Google", ok: "Entendi",
  },
  ja: {
    pre: "選択した口コミが、私の知る限り", link: "Googleのポリシー", post: "に違反していることを確認します（例：実際の顧客ではない、競合他社、侮辱、事実と異なる主張）。",
    err: "口コミがGoogleのポリシーに違反していることを確認してください。",
    h: "Googleのポリシー違反となるもの", intro: "Googleは投稿ポリシーに違反する口コミを削除します。主な例：",
    items: [
      ["偽装・スパム", "実際の利用経験がない、偽の口コミや購入された口コミ、重複投稿。"],
      ["利害関係", "競合他社や（元）従業員による口コミ。"],
      ["無関係な内容", "政治や個人的な争いなど、店舗での体験と関係のない内容。"],
      ["侮辱・嫌がらせ", "暴言、脅迫、いじめ、個人への攻撃。"],
      ["ヘイト・差別", "出身、宗教、性別、障がいなどを理由とした中傷。"],
      ["虚偽の主張", "詐欺や窃盗など、事実として示された虚偽の内容。"],
      ["個人情報", "他人の氏名、電話番号、住所、健康情報。"],
      ["不快・違法なコンテンツ", "性的、暴力的、危険または違法な内容。"],
      ["なりすまし", "他人や他社の名前で投稿された口コミ。"],
    ],
    src: "Googleの公式ポリシーを見る", ok: "わかりました",
  },
  sv: {
    pre: "Jag intygar att de valda omdömena såvitt jag vet bryter mot ", link: "Googles riktlinjer", post: " (t.ex. ingen riktig kund, konkurrent, förolämpningar, osanna påståenden).",
    err: "Bekräfta att omdömena bryter mot Googles riktlinjer.",
    h: "Vad som bryter mot Googles riktlinjer", intro: "Google tar bort omdömen som bryter mot riktlinjerna för bidrag. Typiska fall:",
    items: [
      ["Falska & spam", "Ingen verklig erfarenhet av företaget, falska eller köpta omdömen, upprepade omdömen."],
      ["Intressekonflikt", "Omdömen från konkurrenter eller (tidigare) anställda."],
      ["Ämnesfrämmande", "Innehåll utan koppling till en upplevelse av företaget, t.ex. politik eller privata tvister."],
      ["Förolämpningar & trakasserier", "Glåpord, hot, mobbning eller angrepp på enskilda personer."],
      ["Hat & diskriminering", "Nedvärdering på grund av ursprung, religion, kön, funktionsnedsättning o.d."],
      ["Osanna påståenden", "Osanna uppgifter som framställs som fakta, t.ex. bedrägeri eller stöld."],
      ["Personuppgifter", "Namn, telefonnummer, adresser eller hälsouppgifter om andra."],
      ["Stötande eller olagligt", "Sexuellt, våldsamt, farligt eller olagligt innehåll."],
      ["Identitetsbedrägeri", "Omdöme publicerat i någon annans eller ett annat företags namn."],
    ],
    src: "Se Googles officiella riktlinjer", ok: "Jag förstår",
  },
  da: {
    pre: "Jeg bekræfter, at de valgte anmeldelser efter min bedste overbevisning overtræder ", link: "Googles retningslinjer", post: " (f.eks. ingen rigtig kunde, konkurrent, fornærmelser, usande påstande).",
    err: "Bekræft, at anmeldelserne overtræder Googles retningslinjer.",
    h: "Hvad overtræder Googles retningslinjer", intro: "Google fjerner anmeldelser, der overtræder retningslinjerne for bidrag. Typiske tilfælde:",
    items: [
      ["Falske & spam", "Ingen reel oplevelse med virksomheden, falske eller købte anmeldelser, gentagne anmeldelser."],
      ["Interessekonflikt", "Anmeldelser fra konkurrenter eller (tidligere) medarbejdere."],
      ["Uvedkommende", "Indhold uden forbindelse til en oplevelse med virksomheden, f.eks. politik eller private stridigheder."],
      ["Fornærmelser & chikane", "Skældsord, trusler, mobning eller angreb på enkeltpersoner."],
      ["Had & diskrimination", "Nedgørelse på grund af oprindelse, religion, køn, handicap el.lign."],
      ["Usande påstande", "Usande udsagn fremstillet som fakta, f.eks. svindel eller tyveri."],
      ["Personoplysninger", "Navne, telefonnumre, adresser eller helbredsoplysninger om andre."],
      ["Stødende eller ulovligt", "Seksuelt, voldeligt, farligt eller ulovligt indhold."],
      ["Identitetstyveri", "Anmeldelse skrevet i en anden persons eller virksomheds navn."],
    ],
    src: "Se Googles officielle retningslinjer", ok: "Forstået",
  },
  no: {
    pre: "Jeg bekrefter at de valgte omtalene etter min beste overbevisning bryter med ", link: "Googles retningslinjer", post: " (f.eks. ingen ekte kunde, konkurrent, fornærmelser, usanne påstander).",
    err: "Bekreft at omtalene bryter med Googles retningslinjer.",
    h: "Hva som bryter med Googles retningslinjer", intro: "Google fjerner omtaler som bryter med retningslinjene for bidrag. Typiske tilfeller:",
    items: [
      ["Falske & spam", "Ingen reell erfaring med bedriften, falske eller kjøpte omtaler, gjentatte omtaler."],
      ["Interessekonflikt", "Omtaler fra konkurrenter eller (tidligere) ansatte."],
      ["Utenfor tema", "Innhold uten sammenheng med en opplevelse hos bedriften, f.eks. politikk eller private konflikter."],
      ["Fornærmelser & trakassering", "Skjellsord, trusler, mobbing eller angrep på enkeltpersoner."],
      ["Hat & diskriminering", "Nedverdigelse på grunn av opprinnelse, religion, kjønn, funksjonsnedsettelse o.l."],
      ["Usanne påstander", "Usanne utsagn fremstilt som fakta, f.eks. svindel eller tyveri."],
      ["Personopplysninger", "Navn, telefonnumre, adresser eller helseopplysninger om andre."],
      ["Støtende eller ulovlig", "Seksuelt, voldelig, farlig eller ulovlig innhold."],
      ["Identitetstyveri", "Omtale publisert i en annen persons eller bedrifts navn."],
    ],
    src: "Se Googles offisielle retningslinjer", ok: "Forstått",
  },
};
export const policyText = (lang) => T[lang] || T.en;

const CSS = `
.pcx-bg{font-family:var(--font-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif);position:fixed;inset:0;z-index:2147483000;background:rgba(15,15,15,.45);display:flex;align-items:center;justify-content:center;padding:20px;animation:pcxF .2s ease}
.pcx-sh{background:#fff;color:#141414;width:100%;max-width:520px;max-height:min(86vh,720px);border-radius:22px;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.25);animation:pcxU .28s cubic-bezier(.2,.8,.2,1);font-family:inherit}
.pcx-hd{padding:22px 22px 6px;position:relative}
.pcx-hd h3{margin:0;font-size:19px;line-height:1.3;font-weight:800;padding-right:34px}
.pcx-hd p{margin:8px 0 0;font-size:14px;line-height:1.5;color:#5b5b5b}
.pcx-x{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:0;background:#f1f1f1;font-size:18px;line-height:1;cursor:pointer;color:#333}
.pcx-gr{display:none}
.pcx-ls{overflow:auto;padding:8px 22px 4px;-webkit-overflow-scrolling:touch}
.pcx-it{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid #eee}
.pcx-it:last-child{border-bottom:0}
.pcx-n{flex:0 0 24px;height:24px;border-radius:8px;background:#e8f0fe;color:#1a56db;font-weight:800;font-size:12.5px;display:flex;align-items:center;justify-content:center;margin-top:1px}
.pcx-it b{display:block;font-size:14.5px;line-height:1.35}
.pcx-it .pcx-d{display:block;font-size:13.5px;line-height:1.45;color:#5b5b5b;margin-top:2px}
.pcx-ft{padding:12px 22px 20px;border-top:1px solid #eee;display:flex;flex-direction:column;gap:10px}
.pcx-ft a{color:#1a56db;font-weight:700;font-size:14px;text-decoration:underline;text-align:center}
.pcx-ok{border:0;border-radius:14px;background:#141414;color:#fff;font-weight:800;font-size:15.5px;padding:14px;cursor:pointer;font-family:inherit}
.pcx-lk{background:none;border:0;padding:0;margin:0;font:inherit;color:#1a56db;font-weight:700;text-decoration:underline;cursor:pointer;display:inline}
@media (max-width:640px){
  .pcx-bg{align-items:flex-end;padding:0}
  .pcx-sh{max-width:none;border-radius:22px 22px 0 0;max-height:88vh;animation:pcxS .32s cubic-bezier(.2,.8,.2,1)}
  .pcx-gr{display:block;width:40px;height:5px;border-radius:3px;background:#d6d6d6;margin:9px auto 0}
  .pcx-hd{padding-top:12px}
  .pcx-ft{padding-bottom:calc(18px + env(safe-area-inset-bottom))}
}
@keyframes pcxF{from{opacity:0}to{opacity:1}}
@keyframes pcxU{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
@keyframes pcxS{from{transform:translateY(100%)}to{transform:none}}
`;

/** Fenster mit den Richtlinien. */
export function PolicySheet({ lang, onClose }) {
  const t = policyText(lang);
  const [y0, setY0] = React.useState(null);
  const [dy, setDy] = React.useState(0);
  React.useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    const o = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = o; };
  }, [onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pcx-bg" role="dialog" aria-modal="true" aria-label={t.h} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{CSS}</style>
      <div className="pcx-sh" style={dy ? { transform: `translateY(${dy}px)`, transition: "none" } : undefined}>
        <div className="pcx-gr" onTouchStart={(e) => setY0(e.touches[0].clientY)} onTouchMove={(e) => { if (y0 != null) setDy(Math.max(0, e.touches[0].clientY - y0)); }}
          onTouchEnd={() => { if (dy > 90) onClose(); setDy(0); setY0(null); }} />
        <div className="pcx-hd" onTouchStart={(e) => setY0(e.touches[0].clientY)} onTouchMove={(e) => { if (y0 != null) setDy(Math.max(0, e.touches[0].clientY - y0)); }}
          onTouchEnd={() => { if (dy > 90) onClose(); setDy(0); setY0(null); }}>
          <h3>{t.h}</h3><p>{t.intro}</p>
          <button type="button" className="pcx-x" onClick={onClose} aria-label="×">×</button>
        </div>
        <div className="pcx-ls">
          {t.items.map(([h, d], i) => <div key={i} className="pcx-it"><div className="pcx-n">{i + 1}</div><div><b>{h}</b><span className="pcx-d">{d}</span></div></div>)}
        </div>
        <div className="pcx-ft">
          <a href={GURL(lang)} target="_blank" rel="noopener noreferrer">{t.src}</a>
          <button type="button" className="pcx-ok" onClick={onClose}>{t.ok}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Checkbox + Text mit blauem Link „Google-Richtlinien". */
export default function PolicyConsent({ lang, checked, onChange, error, className, style, textStyle, boxStyle }) {
  const t = policyText(lang);
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <style>{CSS}</style>
      <label className={className} style={{ display: "flex", gap: 11, alignItems: "flex-start", cursor: "pointer", ...style }}>
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)}
          style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, accentColor: "var(--primary, #f97316)", cursor: "pointer", ...boxStyle }} />
        <span style={{ color: error ? "var(--danger, #dc2626)" : "inherit", ...textStyle }}>
          {t.pre}<button type="button" className="pcx-lk" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}>{t.link}</button>{t.post}
        </span>
      </label>
      {open ? <PolicySheet lang={lang} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
