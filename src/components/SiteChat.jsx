"use client";
/* Website-Chat (rapid-remove.com): KI-Assistentin mit Vornamen beantwortet Fragen sofort (ops /chat/site).
   Wunsch nach einem Menschen oder [[TEAM]] → nahtlos in den Tidio-Live-Chat: Tidio öffnet sich, die letzte Frage
   des Besuchers steht schon drin und der bisherige Verlauf liegt als Kontakt-Eigenschaft beim Team.
   Gekennzeichnet als digitale Assistentin (Transparenzpflicht); Ton bewusst menschlich. */
import React from "react";
import { MessageCircle, ChevronDown, ArrowUp, Headphones, X } from "lucide-react";
import { asset } from "@/lib/base";
import { useLang } from "@/lib/lang-context";
import "@/styles/sitechat.css";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const NAME = process.env.NEXT_PUBLIC_CHAT_PERSONA || "Lena";
const KEY = "rr_site_chat", SID = "rr_site_chat_sid", TEASE = "rr_site_chat_tease";
const ss = { get: (k) => { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* */ } } };

const TX = {
  de: { fail: "Der Live-Chat lädt gerade nicht. Schreiben Sie uns an helpdesk@rapid-remove.com oder per WhatsApp – wir antworten schnell.", sub: "Digitale Assistentin · antwortet sofort", tT: "Hallo! 👋", tS: "Fragen zur Löschung? Ich helfe sofort weiter.", hi: `Hallo, ich bin ${NAME}.`, hiS: "Fragen Sie mich alles zu Preisen, Ablauf und Dauer – oder schreiben Sie direkt mit unserem Team.", ph: "Nachricht schreiben …", team: "Mit dem Team chatten", teamGo: "Max oder Matthias übernimmt jetzt hier im Chat.", q: ["Was kostet das?", "Wie lange dauert es?", "Einzelne Bewertung löschen", "Ist das legal?"], err: "Kurz hakt es – ich verbinde Sie mit dem Team.", close: "Schließen", send: "Senden", open: "Chat öffnen" },
  en: { fail: "The live chat isn't loading right now. Email us at helpdesk@rapid-remove.com or message us on WhatsApp – we reply quickly.", sub: "Digital assistant · replies instantly", tT: "Hi there! 👋", tS: "Questions about removal? I can help right away.", hi: `Hi, I'm ${NAME}.`, hiS: "Ask me anything about prices, process and timing – or chat with our team directly.", ph: "Write a message …", team: "Chat with our team", teamGo: "Max or Matthias will take over right here in the chat.", q: ["How much is it?", "How long does it take?", "Remove a single review", "Is this legal?"], err: "Something went wrong – let me connect you with our team.", close: "Close", send: "Send", open: "Open chat" },
  es: { fail: "El chat en vivo no carga ahora mismo. Escríbenos a helpdesk@rapid-remove.com o por WhatsApp – respondemos rápido.", sub: "Asistente digital · responde al instante", tT: "¡Hola! 👋", tS: "¿Dudas sobre la eliminación? Te ayudo ahora mismo.", hi: `Hola, soy ${NAME}.`, hiS: "Pregúntame sobre precios, proceso y plazos, o habla directamente con nuestro equipo.", ph: "Escribe un mensaje …", team: "Hablar con el equipo", teamGo: "Max o Matthias te atienden ahora aquí en el chat.", q: ["¿Cuánto cuesta?", "¿Cuánto tarda?", "Eliminar una reseña", "¿Es legal?"], err: "Algo falló – te paso con nuestro equipo.", close: "Cerrar", send: "Enviar", open: "Abrir chat" },
  fr: { fail: "Le chat en direct ne se charge pas. Écris-nous à helpdesk@rapid-remove.com ou sur WhatsApp – nous répondons vite.", sub: "Assistante numérique · répond tout de suite", tT: "Bonjour ! 👋", tS: "Des questions sur la suppression ? Je t'aide tout de suite.", hi: `Bonjour, je suis ${NAME}.`, hiS: "Pose-moi tes questions sur les prix, le déroulement et les délais – ou écris directement à notre équipe.", ph: "Écrire un message …", team: "Discuter avec l'équipe", teamGo: "Max ou Matthias prend le relais ici dans le chat.", q: ["Combien ça coûte ?", "Combien de temps ?", "Supprimer un avis", "Est-ce légal ?"], err: "Petit souci – je te mets en contact avec l'équipe.", close: "Fermer", send: "Envoyer", open: "Ouvrir le chat" },
  it: { fail: "La chat dal vivo non si carica. Scrivici a helpdesk@rapid-remove.com o su WhatsApp – rispondiamo in fretta.", sub: "Assistente digitale · risponde subito", tT: "Ciao! 👋", tS: "Domande sulla rimozione? Ti aiuto subito.", hi: `Ciao, sono ${NAME}.`, hiS: "Chiedimi tutto su prezzi, procedura e tempi – oppure scrivi direttamente al nostro team.", ph: "Scrivi un messaggio …", team: "Chatta con il team", teamGo: "Max o Matthias ti risponde ora qui in chat.", q: ["Quanto costa?", "Quanto ci vuole?", "Rimuovere una recensione", "È legale?"], err: "Qualcosa non va – ti metto in contatto con il team.", close: "Chiudi", send: "Invia", open: "Apri chat" },
  nl: { fail: "De live chat laadt nu niet. Mail ons via helpdesk@rapid-remove.com of WhatsApp – we reageren snel.", sub: "Digitale assistent · antwoordt direct", tT: "Hallo! 👋", tS: "Vragen over verwijderen? Ik help u meteen.", hi: `Hallo, ik ben ${NAME}.`, hiS: "Vraag me alles over prijzen, werkwijze en duur – of chat direct met ons team.", ph: "Bericht schrijven …", team: "Chat met het team", teamGo: "Max of Matthias neemt het nu hier in de chat over.", q: ["Wat kost het?", "Hoe lang duurt het?", "Eén review verwijderen", "Is dit legaal?"], err: "Er ging iets mis – ik verbind u met het team.", close: "Sluiten", send: "Versturen", open: "Chat openen" },
  pt: { fail: "O chat ao vivo não está a carregar. Escreve-nos para helpdesk@rapid-remove.com ou por WhatsApp – respondemos depressa.", sub: "Assistente digital · responde já", tT: "Olá! 👋", tS: "Dúvidas sobre a remoção? Ajudo já.", hi: `Olá, sou a ${NAME}.`, hiS: "Pergunta-me sobre preços, processo e prazos – ou fala diretamente com a nossa equipa.", ph: "Escreve uma mensagem …", team: "Falar com a equipa", teamGo: "O Max ou o Matthias continua já aqui no chat.", q: ["Quanto custa?", "Quanto tempo demora?", "Remover uma avaliação", "É legal?"], err: "Algo falhou – passo-te à nossa equipa.", close: "Fechar", send: "Enviar", open: "Abrir chat" },
  ja: { fail: "ライブチャットを読み込めません。helpdesk@rapid-remove.com またはWhatsAppでご連絡ください。すぐに返信します。", sub: "デジタルアシスタント · すぐに返信", tT: "こんにちは！👋", tS: "削除についてのご質問はお気軽にどうぞ。", hi: `こんにちは、${NAME}です。`, hiS: "料金・流れ・期間など何でもご質問ください。チームと直接チャットすることもできます。", ph: "メッセージを入力 …", team: "チームとチャット", teamGo: "MaxまたはMatthiasがこのチャットで対応します。", q: ["料金はいくら？", "どのくらいかかる？", "口コミを1件削除", "合法ですか？"], err: "問題が発生しました。チームにおつなぎします。", close: "閉じる", send: "送信", open: "チャットを開く" },
  sv: { fail: "Livechatten laddar inte just nu. Mejla helpdesk@rapid-remove.com eller skriv på WhatsApp – vi svarar snabbt.", sub: "Digital assistent · svarar direkt", tT: "Hej! 👋", tS: "Frågor om borttagning? Jag hjälper dig direkt.", hi: `Hej, jag heter ${NAME}.`, hiS: "Fråga mig om priser, upplägg och tid – eller chatta direkt med vårt team.", ph: "Skriv ett meddelande …", team: "Chatta med teamet", teamGo: "Max eller Matthias tar över här i chatten.", q: ["Vad kostar det?", "Hur lång tid tar det?", "Ta bort ett omdöme", "Är det lagligt?"], err: "Något gick fel – jag kopplar dig till teamet.", close: "Stäng", send: "Skicka", open: "Öppna chatten" },
  da: { fail: "Livechatten indlæser ikke lige nu. Skriv til helpdesk@rapid-remove.com eller på WhatsApp – vi svarer hurtigt.", sub: "Digital assistent · svarer med det samme", tT: "Hej! 👋", tS: "Spørgsmål om fjernelse? Jeg hjælper med det samme.", hi: `Hej, jeg hedder ${NAME}.`, hiS: "Spørg mig om priser, forløb og tid – eller skriv direkte med vores team.", ph: "Skriv en besked …", team: "Chat med teamet", teamGo: "Max eller Matthias tager over her i chatten.", q: ["Hvad koster det?", "Hvor lang tid tager det?", "Fjern en anmeldelse", "Er det lovligt?"], err: "Noget gik galt – jeg forbinder dig med teamet.", close: "Luk", send: "Send", open: "Åbn chat" },
  no: { fail: "Livechatten laster ikke akkurat nå. Skriv til helpdesk@rapid-remove.com eller på WhatsApp – vi svarer raskt.", sub: "Digital assistent · svarer med en gang", tT: "Hei! 👋", tS: "Spørsmål om fjerning? Jeg hjelper deg med en gang.", hi: `Hei, jeg heter ${NAME}.`, hiS: "Spør meg om priser, forløp og tid – eller chat direkte med teamet vårt.", ph: "Skriv en melding …", team: "Chat med teamet", teamGo: "Max eller Matthias tar over her i chatten.", q: ["Hva koster det?", "Hvor lang tid tar det?", "Fjern en omtale", "Er dette lovlig?"], err: "Noe gikk galt – jeg kobler deg til teamet.", close: "Lukk", send: "Send", open: "Åpne chat" },
};

const AV = () => <span className="sc-av"><img src={asset("/assets/app/rocket-mark.png")} alt="" /></span>;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Lange Antwort an einer Satzgrenze in 2 Nachrichten teilen. */
function splitReply(txt) {
  if (txt.length < 170) return [txt];
  const ss2 = txt.match(/[^.!?。！？]+[.!?。！？]+["“”»)]?\s*|[^.!?。！？]+$/g) || [txt];
  if (ss2.length < 2) return [txt];
  let a = "", i = 0;
  while (i < ss2.length - 1 && (a + ss2[i]).length < txt.length * 0.6) a += ss2[i++];
  if (!a) a = ss2[i++];
  const b = ss2.slice(i).join("").trim();
  return b ? [a.trim(), b] : [txt];
}
const sidOf = () => { let s = ss.get(SID); if (!s) { s = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); ss.set(SID, s); } return s; };

/** Nahtlos an Tidio übergeben: Skript laden lassen, öffnen, letzte Frage + Verlauf mitgeben (je Sitzung 1×). */
export function handoffToTidio(msgs, onFail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("rr-tidio-load"));
  const users = (msgs || []).filter((m) => m.r === "u" && m.t);
  const last = users.slice(-2).map((m) => m.t).join("\n");
  const transcript = (msgs || []).filter((m) => m.t).slice(-16).map((m) => (m.r === "u" ? "Besucher: " : NAME + ": ") + m.t).join("\n");
  const go = () => {
    try {
      const api = window.tidioChatApi;
      if (!api) return;
      if (api.show) api.show();
      api.open();
      if (!ss.get("rr_site_chat_sent")) {
        ss.set("rr_site_chat_sent", "1");
        try { if (api.setContactProperties && transcript) api.setContactProperties({ ki_chat_verlauf: transcript.slice(0, 1900) }); } catch (e) { /* */ }
        try { if (api.messageFromVisitor && last) api.messageFromVisitor(last); } catch (e) { /* */ }
      }
    } catch (e) { /* Tidio nicht verfügbar */ }
  };
  if (window.tidioChatApi) { go(); return; }
  const onReady = () => { document.removeEventListener("tidioChat-ready", onReady); setTimeout(go, 150); };
  document.addEventListener("tidioChat-ready", onReady);
  // Tidio blockiert (Adblocker o. Ä.)? → nach 8 s zurück in den Website-Chat mit E-Mail/WhatsApp
  setTimeout(() => { if (!window.tidioChatApi) { document.removeEventListener("tidioChat-ready", onReady); if (onFail) onFail(); } }, 8000);
}

export default function SiteChat({ hideBubble = false }) {
  const { lang } = useLang();
  const t = TX[lang] || TX.en;
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [txt, setTxt] = React.useState("");
  const [wig, setWig] = React.useState(false);
  const [tease, setTease] = React.useState(false);
  const [handed, setHanded] = React.useState(false); // mit dem Team verbunden → eigene Bubble weg, nur noch Tidio
  React.useEffect(() => { if (ss.get("rr_site_chat_handed")) setHanded(true); }, []);
  const body = React.useRef(null), inp = React.useRef(null), everOpen = React.useRef(false);
  React.useEffect(() => { try { const m = JSON.parse(sessionStorage.getItem(KEY) || "[]"); if (m.length) { setMsgs(m); everOpen.current = true; } } catch (e) { /* */ } }, []);
  React.useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) { /* */ } }, [msgs]);
  React.useEffect(() => { const b = body.current; if (b) b.scrollTop = b.scrollHeight; }, [msgs, busy, open]);
  // Alle „Chat"-Buttons der Seite öffnen jetzt diesen Chat
  React.useEffect(() => {
    window.__rrSiteChat = true;
    const o = () => setOpen(true);
    window.addEventListener("rr-chat-open", o);
    return () => { window.__rrSiteChat = false; window.removeEventListener("rr-chat-open", o); };
  }, []);
  React.useEffect(() => {
    if (!open) return undefined;
    everOpen.current = true; setTease(false); ss.set(TEASE, "x");
    const tm = setTimeout(() => { try { inp.current && window.matchMedia("(min-width: 821px)").matches && inp.current.focus({ preventScroll: true }); } catch (e) { /* */ } }, 380);
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", k);
    return () => { clearTimeout(tm); document.removeEventListener("keydown", k); };
  }, [open]);
  // Launcher wackelt ab und zu; Sprechblase nach 12 s (max. 1× pro Sitzung)
  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [];
    const shake = () => { if (reduce || open || everOpen.current) return; setWig(true); timers.push(setTimeout(() => setWig(false), 900)); };
    const showTease = () => { if (everOpen.current || ss.get(TEASE)) return; ss.set(TEASE, "1"); shake(); setTease(true); timers.push(setTimeout(() => setTease(false), 10000)); };
    timers.push(setTimeout(showTease, 12000));
    const iv = setInterval(shake, 30000);
    return () => { timers.forEach(clearTimeout); clearInterval(iv); };
  }, [open]);

  const toTeam = (list) => {
    const l = list || msgs;
    setMsgs((m) => (m.some((x) => x.sys === 1) ? m : [...m.filter((x) => !x.h), { sys: 1, t: t.teamGo }]));
    try { fetch(OPS + "/chat/site/handoff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid: sidOf(), page: window.location.pathname, lang }), keepalive: true }); } catch (e) { /* */ }
    setTimeout(() => {
      ss.set("rr_site_chat_handed", "1"); setHanded(true); setOpen(false);
      handoffToTidio(l, () => { ss.set("rr_site_chat_handed", ""); setHanded(false); setMsgs((m) => [...m, { sys: 2, t: t.fail }]); setOpen(true); });
    }, 900);
  };
  const send = async (raw) => {
    const q = String(raw || "").trim();
    if (!q || busy) return;
    const history = msgs.filter((m) => m.t && !m.sys).slice(-8).map((m) => ({ role: m.r === "u" ? "user" : "assistant", text: m.t }));
    const next = [...msgs.filter((x) => !x.h), { r: "u", t: q }];
    setMsgs(next); setTxt(""); setBusy(true);
    const t0 = Date.now();
    try {
      const res = await fetch(OPS + "/chat/site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid: sidOf(), message: q, history, lang, page: window.location.pathname }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || "HTTP " + res.status);
      // Natürlich wirken: lange Antworten in 2 Nachrichten, „schreibt …" je nach Länge (Lesezeit + Tippen)
      const parts = splitReply(String(j.reply || "").trim());
      let cur = next;
      for (let k = 0; k < parts.length; k++) {
        const wait = Math.min(5200, 700 + parts[k].length * 28) - (k === 0 ? Date.now() - t0 : 0);
        if (wait > 0) await sleep(wait);
        cur = [...cur, { r: "b", t: parts[k] }];
        setMsgs(cur);
        if (k < parts.length - 1) await sleep(450);
      }
      if (j.handoff) { setMsgs([...cur, { h: 1 }]); setBusy(false); setTimeout(() => toTeam(cur), 1600); return; } // fließend: Team übernimmt automatisch
    } catch (e) {
      setMsgs([...next, { r: "b", t: t.err }, { h: 1 }]);
    }
    setBusy(false);
  };
  const closeTease = (e) => { e.stopPropagation(); setTease(false); ss.set(TEASE, "x"); };
  const userCount = msgs.filter((m) => m.r === "u").length;
  return (
    <div className={"rsc" + (handed ? " handed" : "")}>
      <div className={"sc-tease" + (tease && !open && !hideBubble ? " show" : "")} role="button" tabIndex={-1} onClick={() => setOpen(true)} aria-hidden={!tease || open}>
        <AV /><span><b>{t.tT}</b>{t.tS}</span>
        <button type="button" className="sc-tx" onClick={closeTease} aria-label={t.close}><X /></button>
      </div>
      <button type="button" className={"sc-fab" + (open ? " open" : "") + (wig ? " wig" : "") + (hideBubble && !open ? " gone" : "")} onClick={() => setOpen(!open)} aria-label={open ? t.close : t.open}>
        <MessageCircle className="i1" /><ChevronDown className="i2" />{!open && !everOpen.current ? <span className="dot" /> : null}
      </button>
      <section className={"sc-chat" + (open ? " show" : "")} aria-hidden={!open} role="dialog" aria-label={NAME}>
        <div className="sc-top"><AV /><div className="t"><b>{NAME} · RapidRemove</b><span>{t.sub}</span></div>
          <button type="button" className="sc-x" onClick={() => setOpen(false)} aria-label={t.close}><ChevronDown /></button></div>
        <div className="sc-body" ref={body}>
          {!msgs.length ? <div className="sc-hi"><AV /><b>{t.hi}</b><span>{t.hiS}</span></div> : null}
          {msgs.map((m, i) => (m.h
            ? <button key={i} type="button" className="sc-human" onClick={() => toTeam()}><Headphones />{t.team}</button>
            : m.sys ? <div key={i} className="sc-sys">{m.t}</div>
            : <div key={i} className={"sc-msg " + (m.r === "u" ? "u" : "b")}>{m.t}</div>))}
          {busy ? <div className="sc-msg b typ"><i /><i /><i /></div> : null}
        </div>
        <div className="sc-qs">
          {userCount < 3 ? t.q.map((q) => <button key={q} type="button" onClick={() => send(q)} disabled={busy}>{q}</button>) : null}
          <button type="button" className="tm" onClick={() => toTeam()} disabled={busy}><Headphones />{t.team}</button>
        </div>
        <form className="sc-in" onSubmit={(e) => { e.preventDefault(); send(txt); }}>
          <input ref={inp} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t.ph} autoComplete="off" maxLength={1200} enterKeyHint="send" />
          <button type="submit" disabled={!txt.trim() || busy} aria-label={t.send}><ArrowUp /></button>
        </form>
      </section>
    </div>
  );
}
