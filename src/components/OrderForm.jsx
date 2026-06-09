"use client";
import React from "react";
import { FORM_QUESTIONS } from "@/lib/order-form";
import { submitOrderForm } from "@/lib/order";

const TXT = {
  de: { eyebrow: "Optional · hilft uns", title: "Kurzer Fragebogen", sub: "Hilft uns, Ihre Löschung schneller zu bearbeiten. Freiwillig – Sie können es überspringen.", ja: "Ja", nein: "Nein", submit: "Antworten senden", sending: "Senden…", skip: "Kein Muss – Sie können diese Seite auch einfach schließen.", doneT: "Vielen Dank!", doneS: "Ihre Antworten wurden gespeichert – das hilft uns sehr.", errMsg: "Konnte nicht gespeichert werden. Bitte erneut versuchen." },
  en: { eyebrow: "Optional · helps us", title: "Quick questionnaire", sub: "Helps us process your removal faster. Optional – you can skip it.", ja: "Yes", nein: "No", submit: "Send answers", sending: "Sending…", skip: "No obligation – you can simply close this page.", doneT: "Thank you!", doneS: "Your answers have been saved – this helps us a lot.", errMsg: "Could not be saved. Please try again." },
};

export default function OrderForm({ orderId, lang = "de", initial = null, onDone }) {
  const tx = TXT[lang] || TXT.de;
  const isEn = lang === "en";
  const [ans, setAns] = React.useState(() => {
    const o = {};
    FORM_QUESTIONS.forEach((q) => { o[q.key] = (initial && (initial[q.key] === "ja" || initial[q.key] === "nein")) ? initial[q.key] : null; });
    return o;
  });
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(!!(initial && initial.filledAt));
  const [err, setErr] = React.useState("");

  const set = (k, v) => setAns((a) => ({ ...a, [k]: a[k] === v ? null : v }));
  const answered = Object.values(ans).filter(Boolean).length;

  const submit = async () => {
    setBusy(true); setErr("");
    try { await submitOrderForm(orderId, ans); setDone(true); if (onDone) onDone(ans); }
    catch (e) { setErr(tx.errMsg); }
    finally { setBusy(false); }
  };

  if (done) return (
    <div style={S.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={S.ok}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>{tx.doneT}</div>
          <div style={{ fontSize: 14, color: "var(--fg-muted, #6b6259)", fontWeight: 600, marginTop: 2, lineHeight: 1.45 }}>{tx.doneS}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.card}>
      <span style={S.eyebrow}>{tx.eyebrow}</span>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 21, margin: "10px 0 4px", color: "var(--fg, #1c1916)" }}>{tx.title}</h3>
      <p style={{ fontSize: 14, color: "var(--fg-muted, #6b6259)", fontWeight: 600, margin: "0 0 6px", lineHeight: 1.5 }}>{tx.sub}</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {FORM_QUESTIONS.map((q, i) => (
          <div key={q.key} style={S.row}>
            <div style={{ display: "flex", gap: 10, flex: "1 1 220px", minWidth: 0, alignItems: "flex-start" }}>
              <span style={S.num}>{i + 1}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg, #1c1916)", lineHeight: 1.4 }}>{isEn ? q.en : q.de}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flex: "none" }}>
              {[["ja", tx.ja], ["nein", tx.nein]].map(([v, lab]) => (
                <button key={v} type="button" onClick={() => set(q.key, v)} style={S.seg(ans[q.key] === v, v)}>{lab}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {err ? <div style={{ color: "#e23b3b", fontSize: 13, fontWeight: 700, marginTop: 12 }}>{err}</div> : null}
      <button type="button" onClick={submit} disabled={busy} style={S.submit(busy)}>
        {busy ? tx.sending : tx.submit}{answered ? " · " + answered + "/" + FORM_QUESTIONS.length : ""}
      </button>
      <div style={{ fontSize: 12.5, color: "var(--fg-muted, #8a8079)", fontWeight: 600, marginTop: 10, textAlign: "center" }}>{tx.skip}</div>
    </div>
  );
}

const S = {
  card: { background: "#fff", border: "1px solid var(--hairline, #ece7e1)", borderTop: "4px solid var(--primary, #ff8000)", borderRadius: 18, padding: "22px 22px 20px", boxShadow: "0 10px 30px rgba(28,25,22,.06)" },
  eyebrow: { display: "inline-flex", fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--primary, #ff8000)", background: "var(--orange-50, #fff4e8)", padding: "4px 10px", borderRadius: 999 },
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 0", borderTop: "1px solid var(--hairline, #f0ebe5)" },
  num: { flex: "none", width: 22, height: 22, borderRadius: "50%", background: "var(--orange-50, #fff4e8)", color: "var(--primary, #ff8000)", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 },
  seg: (on, v) => ({ minWidth: 62, padding: "9px 16px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all .12s", border: "1.5px solid " + (on ? (v === "ja" ? "var(--success, #16a34a)" : "var(--primary, #ff8000)") : "var(--hairline-strong, #e2dcd5)"), background: on ? (v === "ja" ? "var(--success, #16a34a)" : "var(--primary, #ff8000)") : "#fff", color: on ? "#fff" : "var(--fg-2, #4b4540)" }),
  submit: (busy) => ({ width: "100%", height: 48, marginTop: 16, border: "none", borderRadius: 12, background: "var(--primary, #ff8000)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: busy ? 0.7 : 1 }),
  ok: { width: 42, height: 42, borderRadius: "50%", background: "var(--success, #16a34a)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" },
};
