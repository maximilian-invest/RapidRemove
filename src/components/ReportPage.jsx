"use client";
/* RapidRemove — Datenstudie "Google Business Profile Removal Report".
   EN (Hauptfassung, für internationale Backlinks) + DE. Charts sind reines
   HTML/CSS (responsive, ohne Chart-Library): Balken mit 4px-Enden, 2px-Lücke
   zwischen gestapelten Segmenten, Werte in Text-Tokens, Hover/Focus-Tooltip,
   Datentabelle je Chart. Palette validiert: #e67000 (Englisch/international)
   + #2f6db3 (Deutsch). */
import React from "react";
import "@/styles/report.css";
import { Nav, Footer, WhatsAppFloat, useRouteShell } from "@/components/Chrome";
import { LangContext } from "@/lib/lang-context";
import { asset } from "@/lib/base";
import { localePath } from "@/lib/locales-meta";
import { pagePath, pageHasLocale, pageUrl } from "@/lib/page-routes";
import { HUB_PATH } from "@/lib/articles/hubs";
import { REPORT, COUNTRY_NAME, REPORT_META } from "@/lib/report-data";

const C = {
  en: {
    eyebrow: "Data report · October 2026",
    lead: "What 1,600+ Google Business Profile removals and 20,000+ profile checks since 2022 show about who wants a profile gone — and where they are.",
    by: "By the RapidRemove team · Published 5 October 2026",
    keyH: "Key figures",
    tiles: [
      { v: REPORT.totals.removals, l: "Google Business Profiles removed since 2022" },
      { v: REPORT.totals.checks, l: "free profile checks since March 2024" },
      { v: REPORT.totals.countries, l: "countries our removal clients came from" },
      { v: `${REPORT.totals.enShare2025} %`, l: "of profile checks in 2025 were in English" },
      { v: "3.5 ★", l: "average Google rating of the profiles we removed" },
      { v: "1 in 4", l: "clients add protection against the profile reappearing" },
    ],
    f1: {
      n: "Finding 1",
      h: "More than half of all requests now come in English",
      p: [
        "In 2024, four in ten profile checks on our site were submitted in English. In 2025 it was 55 % — and it has stayed there in 2026. Paid orders followed the same curve: 35 % English in 2024, 52 % in 2025, 54 % in the first half of 2026.",
        "Wanting a Google Business Profile gone is not a local, German-speaking problem. It is the same request everywhere Google Maps is used.",
      ],
      chartH: "Language of profile checks, share per year",
    },
    f2: {
      n: "Finding 2",
      h: "Almost half of all removals are now outside Germany, Austria and Switzerland",
      p: [
        "In 2024 and 2025, about four in ten paid removals were for businesses outside the DACH region. In the first half of 2026 it was 49 % — practically one in two.",
      ],
      chartH: "Paid removals outside Germany, Austria & Switzerland, share per year",
      half: "half",
    },
    f3: {
      n: "Finding 3",
      h: "The US is the second-largest country — ahead of Austria and Switzerland",
      p: [
        "Germany remains the largest single country with 41 % of removals. But the United States comes second with 12 %, ahead of Switzerland and Austria. The UK, the Netherlands, Australia, Canada, Japan, Belgium and the UAE follow.",
      ],
      chartH: "Paid removals by country, January 2024 – June 2026 (n = 826)",
    },
    fs: {
      n: "Finding 4",
      h: "Half of the removed profiles had fewer than 4 stars — but not all of them",
      p: [
        "Since mid-June 2026 we record the Google rating of every profile at the time of the order. The 102 profiles removed since then averaged 3.5 stars (median 3.9). 52 % were below 4 stars, almost one in three below 3 stars. For comparison: all 668 profiles checked in the same period averaged 3.9 stars.",
        "Poor ratings are a major reason — but not the only one. 29 % of the removed profiles had 4.5 stars or more. Closures, outdated or duplicate listings and changes of ownership lead owners to remove a profile too; 5 % were already marked “permanently closed” on Google. Most were small listings: the median profile had about a dozen reviews, 46 % had fewer than ten.",
      ],
      chartH: "Removed profiles by Google star rating at the time of the order (n = 92 rated profiles, June–October 2026)",
      colH: "Stars",
    },
    f4: {
      n: "Finding 5",
      h: "One in four clients make sure the profile stays gone",
      p: [
        "A deleted Google Business Profile can be re-created by anyone — Google users can suggest a business at the same address. 23 % of our clients in 2025 and 27 % in 2026 added ongoing protection that watches for exactly that.",
      ],
    },
    tableToggle: "Show data table",
    thYear: "Year", thEn: "English", thDe: "German", thShare: "Share", thCountry: "Country",
    partial: { mar: "Mar–Dec", h1: "Jan–Jun", subset: "subset" },
    legendEn: "English", legendDe: "German",
    howH: "How these removals happen",
    how: [
      "Every removal counted in this report was commissioned by the owner or managing director of the business concerned. Removals are carried out exclusively through the procedures Google provides for this purpose.",
      "Each request is reviewed before we accept it — in the free check and, where necessary, in a more detailed review afterwards. If a removal is not legally permissible, we decline the case and nothing is charged. We do not remove profiles that could help consumers identify fraud or other harmful activity.",
    ],
    methH: "Methodology",
    meth: [
      "Source: RapidRemove's own order and profile-check records from July 2022 to September 2026, including cases our team handled in 2022–2023 under a previous brand name. All figures are aggregated and rounded; no individual business can be identified.",
      "Profile checks: free checks submitted through our website form (whether a Google Business Profile can be removed). Language = the language version of the form (English or German). The 2024 split covers March–December, the 2026 split January to mid-June.",
      "Removals: completed and paid removals of Google Business Profiles. Country = the country of the business profile as recorded on the order. A country was recorded for 826 removals between January 2024 and June 2026; for 2024 this is a subset of 211.",
      "Star ratings and review counts: as shown on Google at the time of the check or order, recorded since mid-June 2026 — 668 checked and 102 removed profiles, each counted once. Shares may not add up to 100 % due to rounding.",
      "DACH = Germany, Austria and Switzerland. Protection = share of orders that added optional monitoring against the profile being re-created.",
      "These numbers describe RapidRemove's clients — they are not an estimate of the total market.",
    ],
    citeH: "Use this data",
    citeP: "You are welcome to quote the figures and charts — please link to this page as the source. The aggregated data is licensed under CC BY 4.0.",
    citeLabel: "Suggested citation",
    copy: "Copy", copied: "Copied",
    csv: "Download data (CSV)",
    press: "Press & questions:",
    nextH: "Coming in the next edition",
    nextP: "Why owners remove their profile (we now ask our clients after they place their order), plus a breakdown by industry.",
    ctaH: "Your business no longer exists — or there's another legitimate reason to remove the profile?",
    ctaP: "Talk to us. We review your case for free and tell you honestly whether a removal is possible — you only pay if it works.",
    ctaContact: "Contact us now",
    ctaGuide: "Or read our step-by-step guide",
    ctaCheck: "Check my profile for free",
    sourceShort: "Source: RapidRemove",
  },
  de: {
    eyebrow: "Datenreport · Oktober 2026",
    lead: "Was über 1.600 Löschungen von Google-Unternehmensprofilen und 20.000+ Profil-Checks seit 2022 darüber verraten, wer ein Profil loswerden will – und wo.",
    by: "Vom RapidRemove-Team · Veröffentlicht am 5. Oktober 2026",
    keyH: "Die wichtigsten Zahlen",
    tiles: [
      { v: "1.600+", l: "Google-Unternehmensprofile gelöscht seit 2022" },
      { v: "20.000+", l: "kostenlose Profil-Checks seit März 2024" },
      { v: REPORT.totals.countries, l: "Länder, aus denen unsere Kunden kamen" },
      { v: `${REPORT.totals.enShare2025} %`, l: "der Profil-Checks 2025 kamen auf Englisch" },
      { v: "3,5 ★", l: "Sterne im Schnitt hatten die Profile, die wir gelöscht haben" },
      { v: "1 von 4", l: "Kunden sichert sich gegen ein neues Profil ab" },
    ],
    f1: {
      n: "Ergebnis 1",
      h: "Mehr als die Hälfte aller Anfragen kommt inzwischen auf Englisch",
      p: [
        "2024 wurden vier von zehn Profil-Checks auf Englisch gestellt. 2025 waren es 55 % – und dabei ist es 2026 geblieben. Bei den bezahlten Aufträgen dieselbe Kurve: 35 % Englisch 2024, 52 % 2025, 54 % im ersten Halbjahr 2026.",
        "Ein Google-Profil loswerden zu wollen, ist kein deutschsprachiges Thema. Es ist überall dieselbe Anfrage, wo Google Maps genutzt wird.",
      ],
      chartH: "Sprache der Profil-Checks, Anteil pro Jahr",
    },
    f2: {
      n: "Ergebnis 2",
      h: "Fast jede zweite Löschung betrifft Unternehmen außerhalb von DACH",
      p: [
        "2024 und 2025 entfielen rund vier von zehn bezahlten Löschungen auf Unternehmen außerhalb von Deutschland, Österreich und der Schweiz. Im ersten Halbjahr 2026 waren es 49 % – praktisch jede zweite.",
      ],
      chartH: "Bezahlte Löschungen außerhalb von Deutschland, Österreich & Schweiz, Anteil pro Jahr",
      half: "Hälfte",
    },
    f3: {
      n: "Ergebnis 3",
      h: "Die USA sind Land Nr. 2 – noch vor Österreich und der Schweiz",
      p: [
        "Deutschland bleibt mit 41 % der Löschungen das größte Einzelland. Auf Platz zwei folgen aber die USA mit 12 %, vor der Schweiz und Österreich. Danach: Großbritannien, Niederlande, Australien, Kanada, Japan, Belgien und die VAE.",
      ],
      chartH: "Bezahlte Löschungen nach Land, Jänner 2024 – Juni 2026 (n = 826)",
    },
    fs: {
      n: "Ergebnis 4",
      h: "Die Hälfte der gelöschten Profile hatte unter 4 Sterne – aber längst nicht alle",
      p: [
        "Seit Mitte Juni 2026 erfassen wir bei jedem Auftrag die Google-Bewertung des Profils. Die 102 seitdem gelöschten Profile hatten im Schnitt 3,5 Sterne (Median 3,9). 52 % lagen unter 4 Sternen, fast jedes dritte unter 3 Sternen. Zum Vergleich: Alle 668 im selben Zeitraum geprüften Profile kamen im Schnitt auf 3,9 Sterne.",
        "Schlechte Bewertungen sind ein wichtiger Grund – aber nicht der einzige. 29 % der gelöschten Profile hatten 4,5 Sterne oder mehr. Auch Schließungen, veraltete oder doppelte Einträge und Inhaberwechsel sind Gründe für eine Löschung; 5 % waren bei Google bereits als „dauerhaft geschlossen“ markiert. Meist ging es um kleine Profile: Im Median hatten sie rund ein Dutzend Rezensionen, 46 % weniger als zehn.",
      ],
      chartH: "Gelöschte Profile nach Google-Sternen zum Zeitpunkt des Auftrags (n = 92 Profile mit Bewertung, Juni–Oktober 2026)",
      colH: "Sterne",
    },
    f4: {
      n: "Ergebnis 5",
      h: "Jeder vierte Kunde sorgt dafür, dass das Profil weg bleibt",
      p: [
        "Ein gelöschtes Google-Profil kann von jedem neu angelegt werden – Google-Nutzer können ein Unternehmen an derselben Adresse vorschlagen. 23 % unserer Kunden 2025 und 27 % 2026 haben dafür einen laufenden Schutz dazugebucht, der genau das überwacht.",
      ],
    },
    tableToggle: "Datentabelle anzeigen",
    thYear: "Jahr", thEn: "Englisch", thDe: "Deutsch", thShare: "Anteil", thCountry: "Land",
    partial: { mar: "März–Dez.", h1: "Jän.–Juni", subset: "Teilmenge" },
    legendEn: "Englisch", legendDe: "Deutsch",
    howH: "Wie diese Löschungen zustande kommen",
    how: [
      "Jede in diesem Report gezählte Löschung wurde vom Inhaber oder Geschäftsführer des betroffenen Unternehmens beauftragt. Die Löschung erfolgt ausschließlich über die Verfahren, die Google dafür vorsieht.",
      "Jede Anfrage wird vor der Annahme geprüft – im kostenlosen Check und, wo nötig, in einer anschließenden genaueren Prüfung. Ist eine Löschung rechtlich nicht zulässig, lehnen wir den Fall ab; es entstehen keine Kosten. Profile, die Verbrauchern helfen können, Betrug oder andere schädliche Aktivitäten zu erkennen, löschen wir nicht.",
    ],
    methH: "Methodik",
    meth: [
      "Quelle: eigene Auftrags- und Profil-Check-Daten von RapidRemove von Juli 2022 bis September 2026, inklusive der Fälle, die unser Team 2022–2023 unter einem früheren Markennamen bearbeitet hat. Alle Zahlen sind aggregiert und gerundet; einzelne Unternehmen sind nicht erkennbar.",
      "Profil-Checks: kostenlose Prüfungen über das Formular auf unserer Website (ob sich ein Google-Unternehmensprofil löschen lässt). Sprache = Sprachversion des Formulars (Deutsch oder Englisch). 2024 umfasst März–Dezember, 2026 Jänner bis Mitte Juni.",
      "Löschungen: abgeschlossene und bezahlte Löschungen von Google-Unternehmensprofilen. Land = Land des Unternehmensprofils laut Auftrag. Erfasst für 826 Löschungen zwischen Jänner 2024 und Juni 2026; 2024 ist das eine Teilmenge von 211.",
      "Sterne und Anzahl der Rezensionen: wie bei Google zum Zeitpunkt des Checks bzw. Auftrags angezeigt, erfasst seit Mitte Juni 2026 – 668 geprüfte und 102 gelöschte Profile, jedes einmal gezählt. Anteile ergeben wegen Rundung nicht immer 100 %.",
      "DACH = Deutschland, Österreich und Schweiz. Schutz = Anteil der Aufträge mit optionaler Überwachung gegen ein neu angelegtes Profil.",
      "Die Zahlen beschreiben die Kunden von RapidRemove – sie sind keine Schätzung des Gesamtmarkts.",
    ],
    citeH: "Daten verwenden",
    citeP: "Zahlen und Grafiken dürfen gern zitiert werden – bitte mit Link auf diese Seite als Quelle. Die aggregierten Daten stehen unter CC BY 4.0.",
    citeLabel: "Zitiervorschlag",
    copy: "Kopieren", copied: "Kopiert",
    csv: "Daten herunterladen (CSV)",
    press: "Presse & Fragen:",
    nextH: "In der nächsten Ausgabe",
    nextP: "Warum Inhaber ihr Profil löschen lassen (das fragen wir jetzt nach der Bestellung ab) – und eine Auswertung nach Branchen.",
    ctaH: "Ihr Unternehmen gibt es nicht mehr – oder es gibt einen anderen berechtigten Grund für die Löschung?",
    ctaP: "Sprechen Sie mit uns. Wir prüfen Ihren Fall kostenlos und sagen Ihnen ehrlich, ob eine Löschung möglich ist – bezahlt wird nur bei Erfolg.",
    ctaContact: "Jetzt Kontakt aufnehmen",
    ctaGuide: "Oder lesen Sie unseren Ratgeber",
    ctaCheck: "Profil kostenlos prüfen",
    sourceShort: "Quelle: RapidRemove",
  },
};

const fmtPct = (v, lang, dec = 0) => { const n = dec ? Number(v).toFixed(dec) : String(v); return `${lang === "de" ? n.replace(".", ",") : n} %`; };

/* Tooltip: folgt Maus/Fokus innerhalb des Chart-Containers. */
function useTip() {
  const ref = React.useRef(null);
  const [tip, setTip] = React.useState(null);
  const place = (e, text) => {
    const box = ref.current && ref.current.getBoundingClientRect();
    if (!box) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ? e.clientX - box.left : r.left + r.width / 2 - box.left;
    const y = (e.clientY ? e.clientY : r.top) - box.top;
    setTip({ x: Math.max(70, Math.min(box.width - 70, x)), y, text });
  };
  const bind = (text) => ({
    tabIndex: 0, "aria-label": text,
    onMouseEnter: (e) => place(e, text), onMouseMove: (e) => place(e, text),
    onMouseLeave: () => setTip(null), onFocus: (e) => place(e, text), onBlur: () => setTip(null),
  });
  const node = tip ? <div className="rp-tip" style={{ left: tip.x, top: tip.y }} role="status">{tip.text}</div> : null;
  return { ref, bind, node };
}

const yearLabel = (row, c) => (row.partial ? `${row.year} (${c.partial[row.partial]})` : row.year);

function LanguageChart({ c, lang }) {
  const { ref, bind, node } = useTip();
  return (
    <figure className="rp-chart" ref={ref}>
      <figcaption className="rp-chart-h">{c.f1.chartH}</figcaption>
      <div className="rp-legend" aria-hidden="true">
        <span><i className="sw en" />{c.legendEn}</span><span><i className="sw de" />{c.legendDe}</span>
      </div>
      <div className="rp-stack-rows">
        {REPORT.language.map((r) => (
          <div className="rp-stack-row" key={r.year}>
            <div className="rp-y">{yearLabel(r, c)}</div>
            <div className="rp-stack">
              <span className="rp-seg en" style={{ width: `${r.en}%` }} {...bind(`${yearLabel(r, c)} · ${c.legendEn}: ${fmtPct(r.en, lang)}`)} />
              <span className="rp-seg de" style={{ width: `${r.de}%` }} {...bind(`${yearLabel(r, c)} · ${c.legendDe}: ${fmtPct(r.de, lang)}`)} />
            </div>
            <div className="rp-stack-vals">
              <span><b>{fmtPct(r.en, lang)}</b> {c.legendEn}</span>
              <span>{c.legendDe} <b>{fmtPct(r.de, lang)}</b></span>
            </div>
          </div>
        ))}
      </div>
      {node}
      <p className="rp-src">{c.sourceShort}</p>
      <details className="rp-table">
        <summary>{c.tableToggle}</summary>
        <table><thead><tr><th>{c.thYear}</th><th>{c.thEn}</th><th>{c.thDe}</th></tr></thead>
          <tbody>{REPORT.language.map((r) => <tr key={r.year}><td>{yearLabel(r, c)}</td><td>{fmtPct(r.en, lang)}</td><td>{fmtPct(r.de, lang)}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}

function BarChart({ title, rows, c, lang, refLine, refLabel, max = 100, cls = "", dec = 0 }) {
  const { ref, bind, node } = useTip();
  return (
    <figure className={`rp-chart ${cls}`} ref={ref}>
      <figcaption className="rp-chart-h">{title}</figcaption>
      <div className="rp-bars">
        {rows.map((r, i) => (
          <div className={`rp-bar-row${r.muted ? " muted" : ""}`} key={r.label}>
            <div className="rp-y">{r.label}</div>
            <div className="rp-track">
              {refLine ? <span className="rp-ref" style={{ left: `${(refLine / max) * 100}%` }} aria-hidden="true">{i === 0 ? <em>{refLabel}</em> : null}</span> : null}
              <span className="rp-fill" style={{ width: `${(r.v / max) * 100}%` }} {...bind(`${r.label}: ${fmtPct(r.v, lang, dec)}`)} />
            </div>
            <div className="rp-val">{fmtPct(r.v, lang, dec)}</div>
          </div>
        ))}
      </div>
      {node}
      <p className="rp-src">{c.sourceShort}</p>
      <details className="rp-table">
        <summary>{c.tableToggle}</summary>
        <table><thead><tr><th>{rows.colH || ""}</th><th>{c.thShare}</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.label}><td>{r.label}</td><td>{fmtPct(r.v, lang, dec)}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}

function Cite({ c, lang }) {
  const title = REPORT_META[lang].title;
  const text = `RapidRemove (2026). ${title}. ${pageUrl("report", lang)}`;
  const [done, setDone] = React.useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch (e) { /* kein Clipboard */ }
  };
  return (
    <div className="rp-cite">
      <h2>{c.citeH}</h2>
      <p>{c.citeP}</p>
      <div className="rp-cite-box">
        <div className="lbl">{c.citeLabel}</div>
        <code>{text}</code>
        <button type="button" className="btn rp-btn-outline rp-copy" onClick={copy}>{done ? c.copied : c.copy}</button>
      </div>
      <p className="rp-cite-links">
        <a href={asset(REPORT.csv)} download>{c.csv}</a>
        <span> · {c.press} <a href="mailto:helpdesk@rapid-remove.com">helpdesk@rapid-remove.com</a></span>
      </p>
    </div>
  );
}

function ReportBody({ lang, base }) {
  const c = C[lang] || C.en;
  const names = COUNTRY_NAME[lang] || COUNTRY_NAME.en;
  const dachRows = REPORT.outsideDach.map((r) => ({ label: yearLabel(r, c), v: r.v }));
  dachRows.colH = c.thYear;
  const countryRows = REPORT.countries.map((r) => ({ label: names[r.code], v: r.v, muted: r.code === "OTHER" }));
  countryRows.colH = c.thCountry;
  const starRows = REPORT.stars.map((r) => ({ label: `${lang === "de" ? r.k.replace(/\./g, ",") : r.k} ★`, v: r.v }));
  starRows.colH = c.fs.colH;
  const hub = HUB_PATH[lang] || HUB_PATH.en;
  return (
    <div className="rp">
      <Nav onNav={(id) => base.onGoHome(id)} onStart={base.onStart} onBlog={base.onBlog} onAbout={base.onAbout}
        onOrm={base.onOrm} onDeindex={base.onDeindex} onSeo={base.onSeo} active="" />

      <header className="rp-hero">
        <div className="container rp-narrow">
          <div className="rp-eyebrow">{c.eyebrow}</div>
          <h1>{REPORT_META[lang].title}</h1>
          <p className="rp-lead">{c.lead}</p>
          <p className="rp-by">{c.by}</p>
        </div>
      </header>

      <section className="container rp-tiles-wrap" aria-labelledby="rp-key">
        <h2 id="rp-key" className="rp-sr">{c.keyH}</h2>
        <div className="rp-tiles">
          {c.tiles.map((t) => (
            <div className="rp-tile" key={t.l}><div className="v">{t.v}</div><div className="l">{t.l}</div></div>
          ))}
        </div>
      </section>

      <main className="container rp-narrow rp-main">
        <section className="rp-finding">
          <div className="rp-n">{c.f1.n}</div>
          <h2>{c.f1.h}</h2>
          {c.f1.p.map((p) => <p key={p}>{p}</p>)}
          <LanguageChart c={c} lang={lang} />
        </section>

        <section className="rp-finding">
          <div className="rp-n">{c.f2.n}</div>
          <h2>{c.f2.h}</h2>
          {c.f2.p.map((p) => <p key={p}>{p}</p>)}
          <BarChart title={c.f2.chartH} rows={dachRows} c={c} lang={lang} refLine={50} refLabel={c.f2.half} cls="rp-years" />
        </section>

        <section className="rp-finding">
          <div className="rp-n">{c.f3.n}</div>
          <h2>{c.f3.h}</h2>
          {c.f3.p.map((p) => <p key={p}>{p}</p>)}
          <BarChart title={c.f3.chartH} rows={countryRows} c={c} lang={lang} max={45} cls="rp-countries" dec={1} />
        </section>

        <section className="rp-finding">
          <div className="rp-n">{c.fs.n}</div>
          <h2>{c.fs.h}</h2>
          {c.fs.p.map((p) => <p key={p}>{p}</p>)}
          <BarChart title={c.fs.chartH} rows={starRows} c={c} lang={lang} max={35} cls="rp-stars" />
        </section>

        <section className="rp-finding">
          <div className="rp-n">{c.f4.n}</div>
          <h2>{c.f4.h}</h2>
          {c.f4.p.map((p) => <p key={p}>{p}</p>)}
        </section>

        <section className="rp-how">
          <h2>{c.howH}</h2>
          {c.how.map((p) => <p key={p}>{p}</p>)}
        </section>

        <section className="rp-cta">
          <h2>{c.ctaH}</h2>
          <p>{c.ctaP}</p>
          <div className="rp-cta-btns">
            <a className="btn btn-primary" href={asset(pagePath("kontakt", lang))}>{c.ctaContact}</a>
            <a className="btn rp-btn-outline" href={asset(pagePath("wizard", lang))}>{c.ctaCheck}</a>
          </div>
          <p className="rp-cta-guide"><a href={asset(hub)}>{c.ctaGuide} →</a></p>
        </section>

        <Cite c={c} lang={lang} />

        <section className="rp-meth">
          <h2>{c.methH}</h2>
          {c.meth.map((p) => <p key={p}>{p}</p>)}
          <h3>{c.nextH}</h3>
          <p>{c.nextP}</p>
        </section>
      </main>

      <Footer onStart={base.onStart} onBlog={base.onBlog} onAbout={base.onAbout} />
      <WhatsAppFloat />
    </div>
  );
}

/* Route-Hülle: Sprachen ohne eigene Fassung (alles außer en/de) → Startseite. */
export default function ReportPage({ initialLang = "en" }) {
  const { lang, t, setLang, base } = useRouteShell(initialLang, "report");
  const switchLang = (l) => {
    if (pageHasLocale("report", l)) return setLang(l);
    try { localStorage.setItem("rr_lang", l); } catch (e) { /* Privatmodus */ }
    window.location.href = asset(localePath(l));
  };
  return (
    <LangContext.Provider value={{ lang, t, setLang: switchLang }}>
      <ReportBody lang={C[lang] ? lang : "en"} base={base} />
    </LangContext.Provider>
  );
}
