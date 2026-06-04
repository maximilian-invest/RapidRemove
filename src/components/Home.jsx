"use client";
import React from "react";
import { asset } from "@/lib/base";
import { Icon } from "@/components/Icons";
import { useLang } from "@/lib/lang-context";
import { money, profileFor } from "@/lib/pricing";
import { useReveal, CountUp, Nav, Footer, StickyCTA, WhatsAppFloat } from "@/components/Chrome";
import { ProfileDissolveDemo } from "@/components/ProfileDemo";


const TEAM_COPY = {
  de: { title: "Ein ganzes Team kümmert sich um Ihren Fall.", sub: "Spezialisten für Online-Reputation und Recht — in über 30 Ländern, rund um die Uhr erreichbar.", stats: ["40+ Spezialisten", "30+ Länder", "Antwort in Minuten"], more: "+35" },
  en: { title: "A whole team handles your case.", sub: "Specialists in online reputation and law — across 30+ countries, reachable around the clock.", stats: ["40+ specialists", "30+ countries", "Reply in minutes"], more: "+35" },
  es: { title: "Todo un equipo se ocupa de tu caso.", sub: "Especialistas en reputación online y derecho — en más de 30 países, disponibles a toda hora.", stats: ["40+ especialistas", "30+ países", "Respuesta en minutos"], more: "+35" },
  fr: { title: "Toute une équipe gère votre dossier.", sub: "Spécialistes en e-réputation et droit — dans plus de 30 pays, joignables à toute heure.", stats: ["40+ spécialistes", "30+ pays", "Réponse en minutes"], more: "+35" },
  it: { title: "Un intero team segue il tuo caso.", sub: "Specialisti in reputazione online e diritto — in oltre 30 Paesi, raggiungibili 24 ore su 24.", stats: ["40+ specialisti", "30+ Paesi", "Risposta in pochi minuti"], more: "+35" },
  nl: { title: "Een heel team behandelt uw zaak.", sub: "Specialisten in online reputatie en recht — in 30+ landen, dag en nacht bereikbaar.", stats: ["40+ specialisten", "30+ landen", "Antwoord in minuten"], more: "+35" },
  pt: { title: "Uma equipa inteira trata do seu caso.", sub: "Especialistas em reputação online e direito — em mais de 30 países, disponíveis 24 horas.", stats: ["40+ especialistas", "30+ países", "Resposta em minutos"], more: "+35" },
};

Object.assign(TEAM_COPY, {
  ja: { title: "チーム全体があなたのケースを担当します。", sub: "オンライン評判と法律の専門家 ― 30か国以上で、24時間対応。", stats: ["40+ スペシャリスト", "30+ か国", "数分で返信"], more: "+35" },
  sv: { title: "Ett helt team tar hand om ditt ärende.", sub: "Specialister på online-rykte och juridik – i 30+ länder, dygnet runt.", stats: ["40+ specialister", "30+ länder", "Svar inom minuter"], more: "+35" },
  da: { title: "Et helt team tager sig af din sag.", sub: "Specialister i online-omdømme og jura – i 30+ lande, døgnet rundt.", stats: ["40+ specialister", "30+ lande", "Svar inden for minutter"], more: "+35" },
  no: { title: "Et helt team tar seg av saken din.", sub: "Spesialister på nettomdømme og juss – i 30+ land, døgnet rundt.", stats: ["40+ spesialister", "30+ land", "Svar i løpet av minutter"], more: "+35" },
});

const HERO_FLOAT = {
  de: { done: "Profil gelöscht", sub: "Alle Bewertungen entfernt" },
  en: { done: "Profile deleted", sub: "All reviews removed" },
  es: { done: "Perfil eliminado", sub: "Todas las reseñas fuera" },
  fr: { done: "Fiche supprimée", sub: "Tous les avis retirés" },
  it: { done: "Profilo eliminato", sub: "Tutte le recensioni rimosse" },
  nl: { done: "Profiel verwijderd", sub: "Alle reviews weg" },
  pt: { done: "Perfil eliminado", sub: "Todas as avaliações fora" }
};

const WP_COPY = {
  de: { eyebrow: "Unser Ansatz", title: "Wir löschen keine Einzelbewertungen — sondern das ganze Profil.",
    lead: "Einzelne Bewertungen zu entfernen ist mühsam und ungewiss: Google lehnt oft ab, und für jede gelöschte Bewertung tauchen neue auf. Wir gehen das Problem an der Wurzel an.",
    singleH: "Einzelne Bewertung löschen", single: ["Wochenlang — und oft abgelehnt", "Eine weg, neue kommen nach", "Ein Antrag pro Bewertung"],
    wholeH: "Das ganze Profil entfernen", badge: "Unser Weg", whole: ["In 24 Stunden, mit Erfolgsgarantie", "Alle Bewertungen auf einmal weg", "Dauerhaft — kein Wiederauftauchen"],
    note: ["Deshalb entfernen wir bewusst das ", "komplette Profil samt aller Bewertungen", ". Endgültig statt Stückwerk."] },
  en: { eyebrow: "Our approach", title: "We don't delete individual reviews — we remove the entire profile.",
    lead: "Removing single reviews is tedious and uncertain: Google often refuses, and for every review deleted, new ones appear. We tackle the problem at the root.",
    singleH: "Delete a single review", single: ["Weeks — and often refused", "One gone, new ones follow", "One request per review"],
    wholeH: "Remove the whole profile", badge: "Our way", whole: ["In 24 hours, with a success guarantee", "All reviews gone at once", "Permanent — no reappearing"],
    note: ["That's why we deliberately remove the ", "complete profile with all its reviews", ". Final, not piecemeal."] },
  es: { eyebrow: "Nuestro enfoque", title: "No eliminamos reseñas individuales: quitamos el perfil completo.",
    lead: "Eliminar reseñas sueltas es tedioso e incierto: Google suele rechazarlo y, por cada reseña borrada, aparecen nuevas. Atacamos el problema de raíz.",
    singleH: "Eliminar una reseña suelta", single: ["Semanas, y a menudo rechazado", "Una fuera, llegan nuevas", "Una solicitud por reseña"],
    wholeH: "Quitar el perfil completo", badge: "Nuestra vía", whole: ["En 24 horas, con garantía de éxito", "Todas las reseñas fuera de una vez", "Permanente, sin reaparición"],
    note: ["Por eso eliminamos a propósito el ", "perfil completo con todas sus reseñas", ". Definitivo, no a trozos."] },
  fr: { eyebrow: "Notre approche", title: "Nous ne supprimons pas les avis un par un — nous retirons toute la fiche.",
    lead: "Supprimer des avis isolés est laborieux et incertain : Google refuse souvent, et pour chaque avis supprimé, de nouveaux apparaissent. Nous traitons le problème à la racine.",
    singleH: "Supprimer un avis isolé", single: ["Des semaines, et souvent refusé", "Un retiré, d'autres arrivent", "Une demande par avis"],
    wholeH: "Retirer toute la fiche", badge: "Notre voie", whole: ["En 24 heures, avec garantie de succès", "Tous les avis retirés d'un coup", "Permanent, sans réapparition"],
    note: ["C'est pourquoi nous retirons délibérément la ", "fiche complète avec tous ses avis", ". Définitif, pas au compte-gouttes."] },
  it: { eyebrow: "Il nostro approccio", title: "Non eliminiamo le singole recensioni: rimuoviamo l'intero profilo.",
    lead: "Rimuovere singole recensioni è faticoso e incerto: Google spesso rifiuta e, per ogni recensione eliminata, ne arrivano di nuove. Affrontiamo il problema alla radice.",
    singleH: "Eliminare una singola recensione", single: ["Settimane, e spesso rifiutato", "Una via, ne arrivano di nuove", "Una richiesta per recensione"],
    wholeH: "Rimuovere l'intero profilo", badge: "La nostra via", whole: ["In 24 ore, con garanzia di successo", "Tutte le recensioni via in una volta", "Permanente, senza ricomparse"],
    note: ["Per questo rimuoviamo di proposito il ", "profilo completo con tutte le recensioni", ". Definitivo, non a pezzi."] },
  nl: { eyebrow: "Onze aanpak", title: "We verwijderen geen losse reviews — maar het hele profiel.",
    lead: "Losse reviews verwijderen is moeizaam en onzeker: Google weigert vaak, en voor elke verwijderde review komen nieuwe terug. Wij pakken het probleem bij de wortel aan.",
    singleH: "Eén review verwijderen", single: ["Wekenlang, en vaak geweigerd", "Eén weg, nieuwe komen erbij", "Eén verzoek per review"],
    wholeH: "Het hele profiel verwijderen", badge: "Onze weg", whole: ["In 24 uur, met succesgarantie", "Alle reviews in één keer weg", "Permanent, geen terugkeer"],
    note: ["Daarom verwijderen we bewust het ", "volledige profiel met alle reviews", ". Definitief, geen stukwerk."] },
  pt: { eyebrow: "A nossa abordagem", title: "Não eliminamos avaliações individuais — removemos o perfil inteiro.",
    lead: "Remover avaliações isoladas é trabalhoso e incerto: o Google recusa muitas vezes e, por cada avaliação eliminada, surgem novas. Atacamos o problema pela raiz.",
    singleH: "Eliminar uma avaliação isolada", single: ["Semanas, e muitas vezes recusado", "Uma fora, surgem novas", "Um pedido por avaliação"],
    wholeH: "Remover o perfil inteiro", badge: "O nosso caminho", whole: ["Em 24 horas, com garantia de sucesso", "Todas as avaliações fora de uma vez", "Permanente, sem reaparecer"],
    note: ["Por isso removemos de propósito o ", "perfil completo com todas as avaliações", ". Definitivo, não aos bocados."] }
};

Object.assign(WP_COPY, {
  ja: { eyebrow: "私たちのアプローチ", title: "個別の口コミではなく、プロフィール全体を削除します。",
    lead: "個別の口コミを消すのは手間がかかり不確実です。Googleはしばしば拒否し、削除しても新たな口コミが現れます。私たちは問題を根本から解決します。",
    singleH: "個別の口コミを削除", single: ["何週間も ― そしてしばしば拒否される", "1件消えても新たに増える", "口コミごとに申請が必要"],
    wholeH: "プロフィール全体を削除", badge: "私たちの方法", whole: ["24時間で、成功保証付き", "すべての口コミが一度に消える", "永久 ― 再表示なし"],
    note: ["だからこそ私たちはあえて", "すべての口コミを含むプロフィール全体", "を削除します。継ぎはぎではなく、完全に。"] },
  sv: { eyebrow: "Vår metod", title: "Vi tar inte bort enskilda omdömen – utan hela profilen.",
    lead: "Att ta bort enskilda omdömen är mödosamt och osäkert: Google nekar ofta, och för varje borttaget omdöme dyker nya upp. Vi angriper problemet vid roten.",
    singleH: "Ta bort ett enskilt omdöme", single: ["Veckor – och ofta nekat", "Ett borta, nya tillkommer", "En begäran per omdöme"],
    wholeH: "Ta bort hela profilen", badge: "Vår väg", whole: ["På 24 timmar, med framgångsgaranti", "Alla omdömen borta på en gång", "Permanent – ingen återkomst"],
    note: ["Därför tar vi medvetet bort ", "hela profilen med alla omdömen", ". Slutgiltigt, inte styckevis."] },
  da: { eyebrow: "Vores tilgang", title: "Vi fjerner ikke enkelte anmeldelser – men hele profilen.",
    lead: "At fjerne enkelte anmeldelser er besværligt og usikkert: Google afviser ofte, og for hver fjernet anmeldelse dukker nye op. Vi angriber problemet ved roden.",
    singleH: "Fjern en enkelt anmeldelse", single: ["Ugevis – og ofte afvist", "Én væk, nye kommer til", "Én anmodning pr. anmeldelse"],
    wholeH: "Fjern hele profilen", badge: "Vores vej", whole: ["På 24 timer, med succesgaranti", "Alle anmeldelser væk på én gang", "Permanent – ingen genkomst"],
    note: ["Derfor fjerner vi bevidst ", "hele profilen med alle anmeldelser", ". Endeligt, ikke stykkevis."] },
  no: { eyebrow: "Vår tilnærming", title: "Vi fjerner ikke enkeltomtaler – men hele profilen.",
    lead: "Å fjerne enkeltomtaler er møysommelig og usikkert: Google avslår ofte, og for hver fjernet omtale dukker nye opp. Vi angriper problemet ved roten.",
    singleH: "Fjern en enkelt omtale", single: ["Ukevis – og ofte avslått", "Én borte, nye kommer til", "Én forespørsel per omtale"],
    wholeH: "Fjern hele profilen", badge: "Vår vei", whole: ["På 24 timer, med suksessgaranti", "Alle omtaler borte på én gang", "Permanent – ingen gjenkomst"],
    note: ["Derfor fjerner vi bevisst ", "hele profilen med alle omtaler", ". Endelig, ikke stykkevis."] },
});

/* ============ HERO ============ */
function Hero({ onStart }) {
  const { t } = useLang();
  const [name, setName] = React.useState("");
  const go = () => onStart(name);
  return (
    <section className="hero">
      <div className="hero-glow"></div>
      <div className="hero-mesh"></div>
      <div className="container hero-grid">
        <div>
          <span className="chip hs hs1"><Icon.shieldCheck size={15} /> {t.hero.chip}</span>
          <h1 className="hs hs2">{t.hero.h1a} <span className="hl">{t.hero.h1b}</span></h1>
          <p className="lead hs hs3">{t.hero.lead}</p>
          <div className="hero-proof hs hs5">
            <div className="ava-stack">
              {["M", "K", "T", "S", "L"].map((x) => <span className="av" key={x}>{x}</span>)}
            </div>
            <div className="pr-meta">
              <span className="stars sm">{[0, 1, 2, 3, 4].map((i) => <Icon.star key={i} />)}</span>
              <div className="pr-line"><b>{t.hero.trust[0]}/5</b> · {t.hero.trust[1]} · Trustpilot</div>
            </div>
          </div>
          <div className="hero-subproof hs hs6"><Icon.check /> {t.hero.trust[2]} <span className="dot"></span> {t.hero.trust[4]}</div>
          <div className="hero-assure hs hs6">
            {t.hero.assure.map((a, i) => <div key={i}><Icon.check /> {a}</div>)}
          </div>
        </div>

        <div className="hero-card-col hs hs4">
          <div className="float-card tp">
            <span className="fc-tp"><Icon.star /></span>
            <div>
              <div className="fc-strong">{t.hero.trust[0]} <span className="stars sm" style={{ verticalAlign: "middle" }}>{[0, 1, 2, 3, 4].map((i) => <Icon.star key={i} size={12} />)}</span></div>
              <div className="fc-cap">Trustpilot</div>
            </div>
          </div>
        <div className="check-card">
          <div className="cc-head">
            <span className="lv"><span className="pulse"></span> Live</span>
            <span className="eyebrow" style={{ margin: 0 }}>{t.hero.cardEyebrow}</span>
          </div>
          <div className="ttl">{t.hero.cardTitle}</div>
          <div className="sub">{t.hero.cardSub}</div>
          <div className="field">
            <Icon.search />
            <input className="input" placeholder={t.hero.placeholder} value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()} />
          </div>
          <button className="btn btn-primary btn-block lg" onClick={go}>
            <Icon.search size={19} /> {t.hero.button} <Icon.arrowRight size={18} />
          </button>
          <div className="risk-banner"><Icon.shieldCheck /> {t.riskReversal}</div>
          <div className="cc-foot"><Icon.lock /> {t.hero.foot}</div>
        </div>
        </div>
      </div>
    </section>);

}

/* ============ TRUST BAR ============ */
function TrustBar() {
  const { t } = useLang();
  return (
    <div className="trustbar">
      <div className="container trustbar-inner">
        <div className="tb-item"><Icon.star className="tp" size={20} style={{ color: "#00b67a" }} /> <b>Trustpilot</b> {t.trustbar.rating}</div>
        <div className="tb-sep"></div>
        <div className="tb-item"><span style={{ color: "var(--primary)", fontFamily: "var(--font-display)", fontSize: 16 }}>heise.de</span> {t.trustbar.legal.split("&")[0]}</div>
        <div className="tb-sep"></div>
        <div className="tb-item"><Icon.shieldCheck size={20} /> {t.trustbar.legal}</div>
        <div className="tb-sep"></div>
        <div className="tb-item"><Icon.globe size={20} /> {t.trustbar.eu}</div>
        <div className="tb-sep"></div>
        <div className="tb-item"><Icon.lock size={20} /> {t.trustbar.pay}</div>
      </div>
    </div>);

}

/* ============ PROBLEM ============ */
function Problem({ id }) {
  const { t } = useLang();
  const painIcons = [Icon.starOff, Icon.ban, Icon.gavel];
  return (
    <section className="band soft" id={id}>
      <div className="container">
        <div className="sec-head reveal">
          <span className="eyebrow"><Icon.alert size={15} /> {t.problem.eyebrow}</span>
          <h2>{t.problem.h2}</h2>
          <p>{t.problem.sub}</p>
        </div>
        <div className="pgrid3">
          {t.problem.cards.map((c, i) => {
            const I = painIcons[i];
            return (
              <div className={`pain reveal d${i + 1}`} key={i}>
                <div className="pic"><I size={25} /></div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>);

          })}
        </div>
      </div>
    </section>);

}

/* ============ HOW IT WORKS ============ */
function How({ id, onStart }) {
  const { t } = useLang();
  const icons = [Icon.search, Icon.shieldCheck, Icon.trash];
  return (
    <section className="band" id={id}>
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.zap size={15} /> {t.how.eyebrow}</span>
          <h2>{t.how.h2}</h2>
          <p>{t.how.sub}</p>
        </div>
        <div className="steps">
          {t.how.steps.map((s, i) => {
            const I = icons[i];
            return (
              <div className={`step reveal d${i + 1}`} key={i}>
                <span className="n">{i + 1}</span>
                <div className="ic"><I size={26} /></div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <div className="assure"><Icon.check /> {s.a}</div>
              </div>);

          })}
        </div>
        <div className="reveal" style={{ textAlign: "center", marginTop: 44 }}>
          <button className="btn btn-primary lg" onClick={() => onStart()}><Icon.search size={19} /> {t.how.cta} <Icon.arrowRight size={18} /></button>
        </div>
      </div>
    </section>);

}

/* ============ WHY / COMPARISON ============ */
function Why({ id }) {
  const { t } = useLang();
  const yesIcon = <Icon.check className="ci" />;
  return (
    <section className="band soft" id={id}>
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.sparkle size={15} /> {t.why.eyebrow}</span>
          <h2>{t.why.h2}</h2>
          <p>{t.why.sub}</p>
        </div>
        <div className="cmp reveal">
          <div className="cmp-inner">
            <div className="cmp-row cmp-head">
              <div className="cmp-cell"></div>
              <div className="cmp-cell cmp-col-rr">
                <span className="lg"><img src={asset("/assets/rapidremove-logo-white.png")} alt="RapidRemove" /></span>
              </div>
              <div className="cmp-cell">{t.why.cols[2]}</div>
              <div className="cmp-cell">{t.why.cols[3]}</div>
            </div>
            {t.why.rows.map((r, i) =>
            <div className="cmp-row" key={i}>
                <div className="cmp-cell">{r.l}</div>
                <div className="cmp-cell cmp-col-rr yes">{yesIcon}{r.rr}</div>
                <div className="cmp-cell no">{r.law}</div>
                <div className="cmp-cell no">{r.diy}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}

/* ============ TRUST & SECURITY ============ */
function TrustSecurity({ id }) {
  const { t } = useLang();
  const icons = [Icon.building, Icon.shieldCheck, Icon.gavel, Icon.refresh];
  return (
    <section className="band" id={id}>
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.lock size={15} /> {t.trust.eyebrow}</span>
          <h2>{t.trust.h2}</h2>
          <p>{t.trust.sub}</p>
        </div>
        <div className="trust-wrap">
          <div className="reveal">
            <div className="ncnp">
              <div className="seal"></div>
              <span className="badge"><Icon.shieldCheck size={16} /> {t.trust.ncnpBadge}</span>
              <div className="big">{t.trust.ncnpTitle}</div>
              <p>{t.trust.ncnpBody}</p>
            </div>
            <div className="team-card">
              <div className="team-top">
                <div className="team-stack" data-comment-anchor="036ab80e57-b-256-17">
                  {["M", "L", "S", "T", "A", "J"].map((x) => <span className="av" key={x}>{x}</span>)}
                  <span className="av more">{(TEAM_COPY[t.code] || TEAM_COPY.en).more}</span>
                </div>
                <div className="pacts">
                  <a title="WhatsApp" href="https://wa.me/4300000000" target="_blank"><Icon.whatsapp size={20} /></a>
                  <a title="Telefon" href="tel:+4300000000"><Icon.phone size={20} /></a>
                  <a title="E-Mail" href="mailto:hallo@rapid-remove.com"><Icon.mail size={20} /></a>
                </div>
              </div>
              <div className="team-head">
                <b>{(TEAM_COPY[t.code] || TEAM_COPY.en).title}</b>
                <p>{(TEAM_COPY[t.code] || TEAM_COPY.en).sub}</p>
              </div>
              <div className="team-stats">
                {(TEAM_COPY[t.code] || TEAM_COPY.en).stats.map((s, i) => (
                  <span className="ts" key={i}><Icon.shieldCheck /> {s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="trust-list">
            {t.trust.items.map((it, i) => {
              const I = icons[i];
              return (
                <div className={`tl-item reveal d${i + 1}`} key={i}>
                  <div className="tlic"><I size={22} /></div>
                  <div>
                    <h4>{it.t}</h4>
                    <p>{it.d}</p>
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}

/* ============ SOCIAL PROOF ============ */
function Social({ id }) {
  const { t } = useLang();
  return (
    <section className="band soft" id={id}>
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.star size={15} /> {t.social.eyebrow}</span>
          <h2>{t.social.h2}</h2>
          <p>{t.social.sub}</p>
        </div>

        {/* Trustpilot widget */}
        <div className="tp-widget reveal">
          <div className="tp-star"><Icon.star /></div>
          <div>
            <div className="tp-stars stars">{[0, 1, 2, 3, 4].map((i) => <Icon.star key={i} />)}</div>
            <div className="tp-meta" style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 4 }}>
              <b style={{ color: "var(--fg)" }}>{t.social.tpScore}</b> · {t.social.tpCount}
            </div>
          </div>
          <a className="btn btn-secondary sm" href="https://www.trustpilot.com/review/rapid-remove.com" target="_blank" style={{ marginLeft: "auto" }}>
            {t.social.tpLink} <Icon.arrowRight size={15} />
          </a>
        </div>

        {/* Stats */}
        <div className="stats reveal" style={{ marginBottom: 48 }}>
          {t.social.stats.map((s, i) =>
          <div className="stat" key={i}>
              <div className="v"><CountUp end={s.v} suffix={s.suf} /></div>
              <div className="l">{s.l}</div>
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="tgrid">
          {t.social.testimonials.map((tm, i) =>
          <div className={`tcard reveal d${i + 1}`} key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="stars sm">{[0, 1, 2, 3, 4].map((j) => <Icon.star key={j} />)}</span>
                <span className="tverify"><Icon.checkCircle /> {t.code === "de" ? "Verifiziert" : "Verified"}</span>
              </div>
              <p>"{tm.q}"</p>
              <div className="tauthor">
                <div className="tav">{tm.n[0]}</div>
                <div><b>{tm.n}</b><span>{tm.r}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ============ PRICING ============ */
function Pricing({ id, onStart }) {
  const { t, lang } = useLang();
  const p = profileFor(lang);
  return (
    <section className="band" id={id}>
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.card size={15} /> {t.pricing.eyebrow}</span>
          <h2>{t.pricing.h2}</h2>
          <p>{t.pricing.sub}</p>
        </div>
        <div className="value-anchor reveal">
          <div className="va-side va-old">
            <div className="lbl">{t.pricing.anchorOldLabel}</div>
            <div className="amt">{t.pricing.anchorOldAmt}</div>
            <div className="sub">{t.pricing.anchorOldSub}</div>
          </div>
          <div className="va-arrow"><Icon.arrowRight size={22} /></div>
          <div className="va-side va-new">
            <div className="lbl">{t.pricing.anchorNewLabel}</div>
            <div className="amt">{t.pricing.anchorNewAmt}</div>
            <div className="sub"><Icon.shieldCheck /> {t.pricing.anchorNewSub}</div>
          </div>
        </div>
        <div className="pgrid">
          {t.pricing.cards.map((c, i) =>
          <div className={`pcard reveal d${i + 1}` + (c.feat ? " feat" : "")} key={i}>
              {c.feat && <span className="tag">{c.tag}</span>}
              <div className="pname">{c.name}</div>
              <div className="pdesc">{c.desc}</div>
              <div className="price">{money(lang, c.price)}</div>
              <ul>
                {c.feats.map((f, j) => <li key={j}><Icon.check /> {f}</li>)}
              </ul>
              <button className={"btn " + (c.feat ? "btn-primary" : "btn-secondary")} onClick={() => onStart()}>{c.cta} <Icon.arrowRight size={17} /></button>
              <div className="perf"><Icon.shieldCheck /> {t.pricing.perf}</div>
            </div>
          )}
        </div>
        <div className="protect reveal">
          <div className="shield"><Icon.shield size={26} /></div>
          <div>
            <h4>{t.pricing.protTitle}</h4>
            <p>{t.pricing.protDesc}</p>
          </div>
          <div className="pp">{money(lang, t.pricing.protPrice)} <small>{t.pricing.protPer}</small>
            <small style={{ marginTop: 4 }}>{t.code === "de" ? "oder" : "or"} {money(lang, t.pricing.protLifetime)} {t.pricing.protLifetimeLabel}</small>
          </div>
        </div>

        <div className="price-why reveal">
          <div className="pw-h">{t.pricing.whyTitle}</div>
          <div className="pw-sub">{t.pricing.whySub}</div>
          <div className="pw-grid">
            {t.pricing.why.map((it, i) => {
              const I = [Icon.zap, Icon.shieldCheck, Icon.clock, Icon.star][i];
              return (
                <div className="pw-item" key={i}>
                  <div className="pw-ic"><I size={24} /></div>
                  <h4>{it.t}</h4>
                  <p>{it.d}</p>
                </div>);

            })}
          </div>
        </div>
      </div>
    </section>);

}

/* ============ FAQ ============ */
function FAQ({ id }) {
  const { t } = useLang();
  const [open, setOpen] = React.useState(0);
  return (
    <section className="band soft" id={id}>
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.info size={15} /> {t.faq.eyebrow}</span>
          <h2>{t.faq.h2}</h2>
        </div>
        <div className="faq reveal">
          {t.faq.items.map((it, i) =>
          <div className={"faq-row" + (open === i ? " open" : "")} key={i}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                {it.q} <Icon.chevronDown />
              </button>
              <div className="faq-a"><div className="faq-a-inner"><p>{it.a}</p></div></div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ============ FINAL CTA ============ */
function FinalCTA({ onStart }) {
  const { t } = useLang();
  const [name, setName] = React.useState("");
  return (
    <section className="band tight">
      <div className="container">
        <div className="cta-band reveal">
          <div className="glow"></div>
          <h2>{t.cta.h2}</h2>
          <p>{t.cta.sub}</p>
          <div className="cta-form">
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <Icon.search />
              <input className="input" placeholder={t.cta.placeholder} value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onStart(name)} />
            </div>
            <button className="btn btn-primary lg" onClick={() => onStart(name)}>{t.cta.button} <Icon.arrowRight size={18} /></button>
          </div>
          <div className="trustrow">
            {t.cta.trust.map((x, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Icon.check /> {x}</span>)}
          </div>
        </div>
      </div>
    </section>);

}

/* ============ VIDEO / EXPLAINER ============ */
const VIDEO_COPY = {
  de: { eyebrow: "Im Video", title: "Sehen Sie in 90 Sekunden, wie es funktioniert.", sub: "Ein kurzer Überblick – vom Gratis-Check bis zum gelöschten Profil." },
  en: { eyebrow: "On video", title: "See how it works in 90 seconds.", sub: "A quick overview – from the free check to the deleted profile." },
  es: { eyebrow: "En v\u00eddeo", title: "Vea c\u00f3mo funciona en 90 segundos.", sub: "Un resumen r\u00e1pido – del an\u00e1lisis gratis al perfil eliminado." },
  fr: { eyebrow: "En vid\u00e9o", title: "D\u00e9couvrez comment \u00e7a marche en 90 secondes.", sub: "Un aper\u00e7u rapide – de l'analyse gratuite \u00e0 la fiche supprim\u00e9e." },
  it: { eyebrow: "Nel video", title: "Guarda come funziona in 90 secondi.", sub: "Una panoramica rapida – dall'analisi gratuita al profilo eliminato." },
  nl: { eyebrow: "In video", title: "Zie in 90 seconden hoe het werkt.", sub: "Een kort overzicht – van gratis check tot verwijderd profiel." },
  pt: { eyebrow: "Em v\u00eddeo", title: "Veja como funciona em 90 segundos.", sub: "Uma vis\u00e3o r\u00e1pida – da an\u00e1lise gr\u00e1tis ao perfil eliminado." }
};
function VideoSection() {
  const { lang } = useLang();
  if (lang !== "de") return null; // explainer video runs on the German site only
  const v = VIDEO_COPY[lang] || VIDEO_COPY.en;
  return (
    <section className="band tint">
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.rocket size={15} /> {v.eyebrow}</span>
          <h2>{v.title}</h2>
          <p>{v.sub}</p>
        </div>
        <div className="video-wrap reveal">
          <div className="video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/4Lqfo6WUQAA?rel=0"
            title="RapidRemove" loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen></iframe>
          </div>
        </div>
      </div>
    </section>);

}

/* ============ WHOLE PROFILE vs SINGLE REVIEW ============ */
function WholeProfile() {
  const { t } = useLang();
  const c = WP_COPY[t.code] || WP_COPY.en;
  return (
    <section className="band tint">
      <div className="container">
        <div className="sec-head center reveal">
          <span className="eyebrow"><Icon.shieldCheck size={15} /> {c.eyebrow}</span>
          <h2>{c.title}</h2>
          <p>{c.lead}</p>
        </div>
        <div className="wp-compare">
          <div className="wp-col single reveal d1">
            <h3>{c.singleH}</h3>
            {c.single.map((s, i) =>
            <div className={"wp-item" + (i === 0 ? " first" : "")} key={i}><Icon.x /> {s}</div>
            )}
          </div>
          <div className="wp-col whole reveal d2">
            <span className="wp-badge">{c.badge}</span>
            <h3>{c.wholeH}</h3>
            {c.whole.map((s, i) =>
            <div className={"wp-item" + (i === 0 ? " first" : "")} key={i}><Icon.check /> {s}</div>
            )}
          </div>
        </div>
        <div className="wp-note reveal">{c.note[0]}<b>{c.note[1]}</b>{c.note[2]}</div>
      </div>
    </section>);

}

/* ============ HOME ROOT ============ */
function Home({ onStart, onBlog, scrollTarget, onScrolled }) {
  useReveal();
  React.useEffect(() => {
    if (!scrollTarget) return;
    if (scrollTarget === "__top") {window.scrollTo({ top: 0 });} else
    {
      const el = document.getElementById(scrollTarget);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64 });
    }
    onScrolled && onScrolled();
  }, [scrollTarget]);
  const onNav = (id) => {
    if (id === "portal") return;
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  return (
    <React.Fragment>
      <Nav onNav={onNav} onStart={() => onStart()} onBlog={onBlog} onAbout={() => (window.location.href = asset("/ueber-uns/"))} />
      <Hero onStart={onStart} />
      <TrustBar />
      <Problem id="problem" />
      <How id="how" onStart={onStart} />
      <ProfileDissolveDemo />
      <VideoSection />
      <Why id="why" />
      <WholeProfile />
      <TrustSecurity id="trust" />
      <Social id="reviews" />
      <Pricing id="pricing" onStart={onStart} />
      <FAQ id="faq" />
      <FinalCTA onStart={onStart} />
      <Footer onStart={() => onStart()} onBlog={onBlog} onAbout={() => (window.location.href = asset("/ueber-uns/"))} />
      <StickyCTA onStart={() => onStart()} />
      <WhatsAppFloat />
    </React.Fragment>);

}

export { Home };
