"use client";
/* Black Friday (28.11.2026, Maximilian): −25 % auf alles Einmalige bis So. 29.11.2026 23:59 Wiener Zeit.
   Countdown rechnet mit der absoluten Endzeit (UTC) → zeigt jedem Besucher die richtige Restzeit, egal in welcher Zeitzone.
   Nach Ablauf verschwindet alles von selbst. Preise legt der Server fest (ops/src/reviewsPricing.ts → bfActive). */
import React from "react";
import { BF_END_MS, BF_PCT, bfActive, bfPrice, money } from "@/lib/pricing";

const COPY = {
  de: { tag: "Black Friday", h: `−${BF_PCT} % auf alles`, d: "Profil-Löschung, Neustart und Bewertungen – der Rabatt wird automatisch abgezogen. Nur noch bis Sonntag, 29. November, 23:59 Uhr.", ends: "Endet in", cta: "Jetzt kostenlos prüfen", u: ["Tage", "Std", "Min", "Sek"], tz: "(Wiener Zeit)" },
  en: { tag: "Black Friday", h: `${BF_PCT}% off everything`, d: "Profile removal, restart and reviews – the discount is applied automatically. Ends Sunday, November 29, 11:59 pm (Vienna time).", ends: "Ends in", cta: "Check for free now", u: ["days", "hrs", "min", "sec"], tz: "" },
  fr: { tag: "Black Friday", h: `−${BF_PCT} % sur tout`, d: "Suppression de fiche, nouveau départ et avis – la remise est appliquée automatiquement. Jusqu’au dimanche 29 novembre, 23h59 (heure de Vienne).", ends: "Fin dans", cta: "Vérifier gratuitement", u: ["j", "h", "min", "s"], tz: "" },
  es: { tag: "Black Friday", h: `−${BF_PCT} % en todo`, d: "Eliminación de perfil, nuevo inicio y reseñas: el descuento se aplica automáticamente. Hasta el domingo 29 de noviembre, 23:59 (hora de Viena).", ends: "Termina en", cta: "Comprobar gratis", u: ["d", "h", "min", "s"], tz: "" },
  it: { tag: "Black Friday", h: `−${BF_PCT} % su tutto`, d: "Rimozione del profilo, nuovo avvio e recensioni: lo sconto viene applicato automaticamente. Fino a domenica 29 novembre, 23:59 (ora di Vienna).", ends: "Termina tra", cta: "Verifica gratis", u: ["g", "h", "min", "s"], tz: "" },
  nl: { tag: "Black Friday", h: `−${BF_PCT}% op alles`, d: "Profiel verwijderen, opnieuw starten en reviews – de korting wordt automatisch verrekend. Tot zondag 29 november, 23:59 (Weense tijd).", ends: "Eindigt over", cta: "Nu gratis checken", u: ["d", "u", "min", "s"], tz: "" },
  pt: { tag: "Black Friday", h: `−${BF_PCT}% em tudo`, d: "Remoção de perfil, novo início e avaliações – o desconto é aplicado automaticamente. Até domingo, 29 de novembro, 23:59 (hora de Viena).", ends: "Termina em", cta: "Verificar grátis", u: ["d", "h", "min", "s"], tz: "" },
  sv: { tag: "Black Friday", h: `−${BF_PCT} % på allt`, d: "Profilborttagning, nystart och recensioner – rabatten dras automatiskt. Till söndag 29 november kl. 23:59 (Wien-tid).", ends: "Slutar om", cta: "Kolla gratis nu", u: ["d", "h", "min", "s"], tz: "" },
  da: { tag: "Black Friday", h: `−${BF_PCT} % på alt`, d: "Sletning af profil, ny start og anmeldelser – rabatten trækkes automatisk. Til søndag 29. november kl. 23:59 (Wien-tid).", ends: "Slutter om", cta: "Tjek gratis nu", u: ["d", "t", "min", "s"], tz: "" },
  no: { tag: "Black Friday", h: `−${BF_PCT} % på alt`, d: "Sletting av profil, ny start og anmeldelser – rabatten trekkes automatisk. Til søndag 29. november kl. 23:59 (Wien-tid).", ends: "Slutter om", cta: "Sjekk gratis nå", u: ["d", "t", "min", "s"], tz: "" },
  ja: { tag: "ブラックフライデー", h: `全サービス${BF_PCT}%オフ`, d: "プロフィール削除・再作成・口コミ削除が対象。割引は自動で適用されます。11月29日（日）23:59（ウィーン時間）まで。", ends: "終了まで", cta: "無料でチェック", u: ["日", "時間", "分", "秒"], tz: "" },
};

function useNow(active) {
  const [now, setNow] = React.useState(null); // erst im Browser setzen → kein Hydration-Unterschied
  React.useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

const pad = (n) => String(n).padStart(2, "0");

export function BlackFridayBanner({ lang = "de", onStart }) {
  const now = useNow(true);
  if (now == null || !bfActive(now)) return null;
  const c = COPY[lang] || COPY.en;
  const left = Math.max(0, BF_END_MS - now);
  const d = Math.floor(left / 86400000), h = Math.floor(left / 3600000) % 24, m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
  const parts = [[d, c.u[0]], [h, c.u[1]], [m, c.u[2]], [s, c.u[3]]];
  return (
    <div className="bf-banner hs hs2" role="region" aria-label={c.tag}>
      <div className="bf-l">
        <span className="bf-tag">{c.tag}</span>
        <div className="bf-h">{c.h}</div>
        <p className="bf-d">{c.d}</p>
      </div>
      <div className="bf-r">
        <div className="bf-ends">{c.ends} {c.tz}</div>
        <div className="bf-cd" aria-live="off">
          {parts.map(([v, u], i) => (
            <div className="bf-u" key={i}><b>{i === 0 ? v : pad(v)}</b><small>{u}</small></div>
          ))}
        </div>
        {onStart ? <button type="button" className="bf-cta" onClick={() => onStart()}>{c.cta}</button> : null}
      </div>
    </div>
  );
}

/** Preis mit Durchstreichung während Black Friday (z. B. im Hero). amount = Listenpreis-String/-Zahl. */
export function BfPrice({ lang, amount }) {
  const now = useNow(true);
  const on = now != null && bfActive(now);
  if (!on) return <b>{money(lang, amount)}</b>;
  return <><s className="bf-was">{money(lang, amount)}</s> <b className="bf-now">{money(lang, bfPrice(amount))}</b></>;
}

/** Wie BfPrice, aber mit „ab …“ (Preisübersicht). */
export function BfFrom({ lang, amount, fromPrice }) {
  const now = useNow(true);
  const on = now != null && bfActive(now);
  if (!on) return <>{fromPrice(lang, money(lang, amount))}</>;
  return <><s className="bf-was">{money(lang, amount)}</s> {fromPrice(lang, money(lang, bfPrice(amount)))}</>;
}
