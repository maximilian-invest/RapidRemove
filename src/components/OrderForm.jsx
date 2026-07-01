"use client";
import React from "react";
import { FORM_QUESTIONS } from "@/lib/order-form";
import { submitOrderForm } from "@/lib/order";

const TXT = {
  de: { eyebrow: "Optional · hilft uns", title: "Kurzer Fragebogen", sub: "Tippen Sie einfach auf Ja oder Nein – jede Antwort bringt Ihre Löschung schneller voran.", ja: "Ja", nein: "Nein", doneT: "Vielen Dank!", doneS: "Ihre Antworten wurden gespeichert – das hilft uns sehr.", errMsg: "Konnte nicht gespeichert werden. Bitte erneut versuchen.", ppTitle: "Mit PayPal zahlen & 10 % sparen", ppSub: "PayPal-E-Mail eintragen – wir senden Ihnen eine Zahlungsaufforderung mit 10 % Rabatt.", ppPlaceholder: "Ihre PayPal-E-Mail (optional)" },
  en: { eyebrow: "Optional · helps us", title: "Quick questionnaire", sub: "Just tap Yes or No – every answer helps move your removal forward faster.", ja: "Yes", nein: "No", doneT: "Thank you!", doneS: "Your answers have been saved – this helps us a lot.", errMsg: "Could not be saved. Please try again.", ppTitle: "Pay with PayPal & save 10%", ppSub: "Enter your PayPal email – we'll send you a payment request with 10% off.", ppPlaceholder: "Your PayPal email (optional)" },
  es: { eyebrow: "Opcional · nos ayuda", title: "Breve cuestionario", sub: "Solo toca Sí o No: cada respuesta agiliza tu eliminación.", ja: "Sí", nein: "No", doneT: "¡Muchas gracias!", doneS: "Sus respuestas se han guardado – nos ayuda mucho.", errMsg: "No se pudo guardar. Inténtelo de nuevo.", ppTitle: "Paga con PayPal y ahorra un 10 %", ppSub: "Introduce tu correo de PayPal: te enviaremos una solicitud de pago con un 10 % de descuento.", ppPlaceholder: "Tu correo de PayPal (opcional)" },
  fr: { eyebrow: "Facultatif · nous aide", title: "Court questionnaire", sub: "Touchez simplement Oui ou Non – chaque réponse accélère votre suppression.", ja: "Oui", nein: "Non", doneT: "Merci beaucoup !", doneS: "Vos réponses ont été enregistrées – cela nous aide beaucoup.", errMsg: "Échec de l'enregistrement. Veuillez réessayer.", ppTitle: "Payez avec PayPal et économisez 10 %", ppSub: "Indiquez votre e-mail PayPal – nous vous enverrons une demande de paiement avec 10 % de réduction.", ppPlaceholder: "Votre e-mail PayPal (facultatif)" },
  it: { eyebrow: "Facoltativo · ci aiuta", title: "Breve questionario", sub: "Tocca semplicemente Sì o No: ogni risposta velocizza la tua rimozione.", ja: "Sì", nein: "No", doneT: "Grazie mille!", doneS: "Le tue risposte sono state salvate – ci aiuta molto.", errMsg: "Impossibile salvare. Riprova.", ppTitle: "Paga con PayPal e risparmia il 10%", ppSub: "Inserisci la tua email PayPal: ti invieremo una richiesta di pagamento con il 10% di sconto.", ppPlaceholder: "La tua email PayPal (facoltativo)" },
  nl: { eyebrow: "Optioneel · helpt ons", title: "Korte vragenlijst", sub: "Tik gewoon op Ja of Nee – elk antwoord versnelt uw verwijdering.", ja: "Ja", nein: "Nee", doneT: "Hartelijk dank!", doneS: "Uw antwoorden zijn opgeslagen – dat helpt ons enorm.", errMsg: "Kon niet worden opgeslagen. Probeer het opnieuw.", ppTitle: "Betaal met PayPal en bespaar 10%", ppSub: "Vul uw PayPal-e-mail in – we sturen u een betaalverzoek met 10% korting.", ppPlaceholder: "Uw PayPal-e-mail (optioneel)" },
  pt: { eyebrow: "Opcional · ajuda-nos", title: "Breve questionário", sub: "Basta tocar em Sim ou Não – cada resposta acelera a sua remoção.", ja: "Sim", nein: "Não", doneT: "Muito obrigado!", doneS: "As suas respostas foram guardadas – ajuda-nos muito.", errMsg: "Não foi possível guardar. Tente novamente.", ppTitle: "Pague com PayPal e poupe 10%", ppSub: "Introduza o seu e-mail PayPal – enviamos-lhe um pedido de pagamento com 10% de desconto.", ppPlaceholder: "O seu e-mail PayPal (opcional)" },
  ja: { eyebrow: "任意 · 助かります", title: "簡単なアンケート", sub: "「はい」か「いいえ」をタップするだけ。回答ごとに削除がスムーズに進みます。", ja: "はい", nein: "いいえ", doneT: "ありがとうございます！", doneS: "回答を保存しました。大変助かります。", errMsg: "保存できませんでした。もう一度お試しください。", ppTitle: "PayPalで支払って10％割引", ppSub: "PayPalのメールアドレスをご入力ください。10％割引のお支払いリクエストをお送りします。", ppPlaceholder: "PayPalのメールアドレス（任意）" },
  sv: { eyebrow: "Valfritt · hjälper oss", title: "Kort frågeformulär", sub: "Tryck bara på Ja eller Nej – varje svar snabbar på din borttagning.", ja: "Ja", nein: "Nej", doneT: "Tack så mycket!", doneS: "Dina svar har sparats – det hjälper oss mycket.", errMsg: "Kunde inte sparas. Försök igen.", ppTitle: "Betala med PayPal och spara 10 %", ppSub: "Ange din PayPal-e-post – vi skickar en betalningsbegäran med 10 % rabatt.", ppPlaceholder: "Din PayPal-e-post (valfritt)" },
  da: { eyebrow: "Valgfrit · hjælper os", title: "Kort spørgeskema", sub: "Tryk blot på Ja eller Nej – hvert svar gør din sletning hurtigere.", ja: "Ja", nein: "Nej", doneT: "Mange tak!", doneS: "Dine svar er gemt – det hjælper os meget.", errMsg: "Kunne ikke gemmes. Prøv igen.", ppTitle: "Betal med PayPal og spar 10 %", ppSub: "Indtast din PayPal-e-mail – vi sender dig en betalingsanmodning med 10 % rabat.", ppPlaceholder: "Din PayPal-e-mail (valgfrit)" },
  no: { eyebrow: "Valgfritt · hjelper oss", title: "Kort spørreskjema", sub: "Trykk bare på Ja eller Nei – hvert svar gjør slettingen din raskere.", ja: "Ja", nein: "Nei", doneT: "Tusen takk!", doneS: "Svarene dine er lagret – det hjelper oss mye.", errMsg: "Kunne ikke lagres. Prøv igjen.", ppTitle: "Betal med PayPal og spar 10 %", ppSub: "Skriv inn PayPal-e-posten din – vi sender deg en betalingsforespørsel med 10 % rabatt.", ppPlaceholder: "Din PayPal-e-post (valgfritt)" },
};

export default function OrderForm({ orderId, lang = "de", initial = null, onDone }) {
  const tx = TXT[lang] || TXT.en || TXT.de;
  const initAns = () => {
    const o = {};
    FORM_QUESTIONS.forEach((q) => { o[q.key] = (initial && (initial[q.key] === "ja" || initial[q.key] === "nein")) ? initial[q.key] : null; });
    return o;
  };
  const [ans, setAns] = React.useState(initAns);
  // Bereits beantwortete (oder zuvor ausgefüllte) Fragen starten eingeklappt.
  const [hidden, setHidden] = React.useState(() => {
    const h = {};
    const filled = !!(initial && initial.filledAt);
    FORM_QUESTIONS.forEach((q) => { if (filled || (initial && (initial[q.key] === "ja" || initial[q.key] === "nein"))) h[q.key] = true; });
    return h;
  });
  // PayPal-Wunsch (E-Mail) – optionales Zusatzfeld, nur außerhalb DACH (siehe unten).
  const [paypal, setPaypal] = React.useState(() => (initial && typeof initial.paypal === "string") ? initial.paypal : "");
  const lastSavedPaypal = React.useRef((initial && typeof initial.paypal === "string") ? initial.paypal.trim() : "");
  const [err, setErr] = React.useState("");
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Fragebogen speichern. Der Server ersetzt das Formular komplett, daher IMMER den
  // gesamten Stand senden (alle Ja/Nein-Antworten + PayPal), sonst gingen Felder verloren.
  const save = (nextAns, nextPaypal) => {
    setErr("");
    const payload = { ...nextAns, paypal: (nextPaypal || "").trim() };
    return submitOrderForm(orderId, payload)
      .then(() => { if (onDone) onDone(payload); })
      .catch(() => setErr(tx.errMsg));
  };

  // Eine Antwort wählen → sofort senden, dann die Frage ausblenden (mehr Daten,
  // auch wenn der Kunde nicht alle Fragen beantwortet).
  const answer = (key, v) => {
    const next = { ...ans, [key]: v };
    setAns(next);
    save(next, paypal);
    timers.current.push(setTimeout(() => setHidden((h) => ({ ...h, [key]: true })), 300));
  };

  // PayPal-E-Mail speichern (beim Verlassen des Feldes / Enter) – nur wenn geändert.
  const savePaypal = () => {
    const v = (paypal || "").trim();
    if (v === lastSavedPaypal.current) return;
    lastSavedPaypal.current = v;
    save(ans, v);
  };

  const total = FORM_QUESTIONS.length;
  const answeredCount = FORM_QUESTIONS.filter((q) => ans[q.key]).length;
  const remaining = FORM_QUESTIONS.filter((q) => !hidden[q.key]);
  const allDone = remaining.length === 0;

  // Optionales PayPal-Feld (10 % Rabatt) – nur außerhalb DACH anbieten (lang !== "de").
  // Bleibt sichtbar, egal ob noch Fragen offen sind oder schon alles beantwortet wurde,
  // damit der Kunde es jederzeit ausfüllen kann.
  const paypalBlock = lang !== "de" ? (
    <div style={{ ...S.ppWrap, marginTop: allDone ? 16 : 18 }}>
      <div style={S.ppHead}><span aria-hidden="true" style={{ fontSize: 16 }}>💳</span><span>{tx.ppTitle}</span></div>
      <p style={S.ppSub}>{tx.ppSub}</p>
      <input type="email" inputMode="email" autoComplete="email" enterKeyHint="done" name="paypal"
        value={paypal}
        onChange={(e) => setPaypal(e.target.value)}
        onBlur={savePaypal}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
        placeholder={tx.ppPlaceholder} aria-label={tx.ppPlaceholder} style={S.ppInput} />
    </div>
  ) : null;

  return (
    <div style={S.card}>
      {allDone ? (
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={S.ok}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{tx.doneT}</div>
            <div style={{ fontSize: 14, color: "var(--fg-muted, #6b6259)", fontWeight: 600, marginTop: 2, lineHeight: 1.45 }}>{tx.doneS}</div>
          </div>
        </div>
      ) : (
        <React.Fragment>
          <span style={S.eyebrow}>{tx.eyebrow}</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, margin: "10px 0 4px", color: "var(--fg, #1c1916)" }}>{tx.title}</h3>
          <p style={{ fontSize: 14, color: "var(--fg-muted, #6b6259)", fontWeight: 600, margin: "0 0 12px", lineHeight: 1.5 }}>{tx.sub}</p>
          <div style={S.track}><div style={{ ...S.fill, width: (answeredCount / total * 100) + "%" }} /></div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {remaining.map((q) => {
              const leaving = !!ans[q.key];
              return (
                <div key={q.key} style={{ ...S.rowWrap, maxHeight: leaving ? 0 : 220, opacity: leaving ? 0 : 1, transform: leaving ? "translateX(10px)" : "none" }}>
                  <div style={S.row}>
                    <div style={{ display: "flex", gap: 10, flex: "1 1 220px", minWidth: 0, alignItems: "flex-start" }}>
                      <span style={S.dot} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg, #1c1916)", lineHeight: 1.4 }}>{q.t[lang] || q.t.en || q.t.de}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flex: "none" }}>
                      {[["ja", tx.ja], ["nein", tx.nein]].map(([v, lab]) => (
                        <button key={v} type="button" onClick={() => answer(q.key, v)} style={S.seg(ans[q.key] === v, v)}>{lab}</button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      )}
      {paypalBlock}
      {err ? <div style={{ color: "#e23b3b", fontSize: 13, fontWeight: 700, marginTop: 10 }}>{err}</div> : null}
    </div>
  );
}

const S = {
  card: { background: "#fff", border: "1px solid var(--hairline, #ece7e1)", borderTop: "4px solid var(--primary, #ff8000)", borderRadius: 18, padding: "22px 22px 20px", boxShadow: "0 10px 30px rgba(28,25,22,.06)" },
  eyebrow: { display: "inline-flex", fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--primary, #ff8000)", background: "var(--orange-50, #fff4e8)", padding: "4px 10px", borderRadius: 999 },
  track: { height: 5, borderRadius: 999, background: "var(--orange-50, #fff4e8)", overflow: "hidden", marginBottom: 4 },
  fill: { height: "100%", borderRadius: 999, background: "var(--primary, #ff8000)", transition: "width .3s ease" },
  rowWrap: { overflow: "hidden", transition: "opacity .28s ease, transform .28s ease, max-height .3s ease" },
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 0", borderTop: "1px solid var(--hairline, #f0ebe5)" },
  dot: { flex: "none", width: 7, height: 7, borderRadius: "50%", background: "var(--primary, #ff8000)", marginTop: 7 },
  seg: (on, v) => ({ minWidth: 62, padding: "9px 16px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .12s", border: "1.5px solid " + (on ? (v === "ja" ? "var(--success, #16a34a)" : "var(--primary, #ff8000)") : "var(--hairline-strong, #e2dcd5)"), background: on ? (v === "ja" ? "var(--success, #16a34a)" : "var(--primary, #ff8000)") : "#fff", color: on ? "#fff" : "var(--fg-2, #4b4540)" }),
  ok: { width: 42, height: 42, borderRadius: "50%", background: "var(--success, #16a34a)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" },
  ppWrap: { border: "1px solid var(--hairline, #ece7e1)", background: "var(--orange-50, #fff7ef)", borderRadius: 14, padding: "14px 15px" },
  ppHead: { display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--fg, #1c1916)" },
  ppSub: { fontSize: 12.5, color: "var(--fg-muted, #6b6259)", fontWeight: 600, margin: "5px 0 10px", lineHeight: 1.45 },
  ppInput: { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 10, border: "1.5px solid var(--hairline-strong, #e2dcd5)", fontSize: 14.5, fontWeight: 600, color: "var(--fg, #1c1916)", background: "#fff", outline: "none" },
};
