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
import { OfferCard, Checkout, ReviewPicker, ConfirmCard } from "@/components/SiteChatCheckout";
import { CO, PK } from "@/components/sitechat-co-i18n";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const NAME = process.env.NEXT_PUBLIC_CHAT_PERSONA || "Lena";
const KEY = "rr_site_chat", SID = "rr_site_chat_sid", TEASE = "rr_site_chat_tease";
const ss = { get: (k) => { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* */ } } };

const TX = {
  de: { fail: "Der Live-Chat lädt gerade nicht. Schreiben Sie uns an helpdesk@rapid-remove.com oder per WhatsApp – wir antworten schnell.", sub: "RapidRemove Support", ai: "Lena ist unsere KI-Assistentin · das Team ist nur einen Klick entfernt", tT: "Hallo! 👋", tS: "Fragen zur Löschung? Ich helfe sofort weiter.", hi: "Schreiben Sie einfach los.", hiS: "", ph: "Nachricht schreiben …", team: "Mit dem Team chatten", teamGo: "Max oder Matthias übernimmt jetzt hier im Chat.", q: ["Was kostet das?", "Wie lange dauert es?", "Einzelne Bewertung löschen", "Ist das legal?"], err: "Kurz hakt es – ich verbinde Sie mit dem Team.", close: "Schließen", send: "Senden", open: "Chat öffnen" },
  en: { fail: "The live chat isn't loading right now. Email us at helpdesk@rapid-remove.com or message us on WhatsApp – we reply quickly.", sub: "RapidRemove Support", ai: "Lena is our AI assistant · our team is one tap away", tT: "Hi there! 👋", tS: "Questions about removal? I can help right away.", hi: "Just start typing.", hiS: "", ph: "Write a message …", team: "Chat with our team", teamGo: "Max or Matthias will take over right here in the chat.", q: ["How much is it?", "How long does it take?", "Remove a single review", "Is this legal?"], err: "Something went wrong – let me connect you with our team.", close: "Close", send: "Send", open: "Open chat" },
  es: { fail: "El chat en vivo no carga ahora mismo. Escríbenos a helpdesk@rapid-remove.com o por WhatsApp – respondemos rápido.", sub: "RapidRemove Support", ai: "Lena es nuestra asistente con IA · el equipo, a un clic", tT: "¡Hola! 👋", tS: "¿Dudas sobre la eliminación? Te ayudo ahora mismo.", hi: "Escríbenos sin más.", hiS: "", ph: "Escribe un mensaje …", team: "Hablar con el equipo", teamGo: "Max o Matthias te atienden ahora aquí en el chat.", q: ["¿Cuánto cuesta?", "¿Cuánto tarda?", "Eliminar una reseña", "¿Es legal?"], err: "Algo falló – te paso con nuestro equipo.", close: "Cerrar", send: "Enviar", open: "Abrir chat" },
  fr: { fail: "Le chat en direct ne se charge pas. Écris-nous à helpdesk@rapid-remove.com ou sur WhatsApp – nous répondons vite.", sub: "RapidRemove Support", ai: "Lena est notre assistante IA · l'équipe est à un clic", tT: "Bonjour ! 👋", tS: "Des questions sur la suppression ? Je t'aide tout de suite.", hi: "Écris-nous simplement.", hiS: "", ph: "Écrire un message …", team: "Discuter avec l'équipe", teamGo: "Max ou Matthias prend le relais ici dans le chat.", q: ["Combien ça coûte ?", "Combien de temps ?", "Supprimer un avis", "Est-ce légal ?"], err: "Petit souci – je te mets en contact avec l'équipe.", close: "Fermer", send: "Envoyer", open: "Ouvrir le chat" },
  it: { fail: "La chat dal vivo non si carica. Scrivici a helpdesk@rapid-remove.com o su WhatsApp – rispondiamo in fretta.", sub: "RapidRemove Support", ai: "Lena è la nostra assistente IA · il team è a un clic", tT: "Ciao! 👋", tS: "Domande sulla rimozione? Ti aiuto subito.", hi: "Scrivici pure.", hiS: "", ph: "Scrivi un messaggio …", team: "Chatta con il team", teamGo: "Max o Matthias ti risponde ora qui in chat.", q: ["Quanto costa?", "Quanto ci vuole?", "Rimuovere una recensione", "È legale?"], err: "Qualcosa non va – ti metto in contatto con il team.", close: "Chiudi", send: "Invia", open: "Apri chat" },
  nl: { fail: "De live chat laadt nu niet. Mail ons via helpdesk@rapid-remove.com of WhatsApp – we reageren snel.", sub: "RapidRemove Support", ai: "Lena is onze AI-assistent · het team is één klik verwijderd", tT: "Hallo! 👋", tS: "Vragen over verwijderen? Ik help u meteen.", hi: "Schrijf gerust.", hiS: "", ph: "Bericht schrijven …", team: "Chat met het team", teamGo: "Max of Matthias neemt het nu hier in de chat over.", q: ["Wat kost het?", "Hoe lang duurt het?", "Eén review verwijderen", "Is dit legaal?"], err: "Er ging iets mis – ik verbind u met het team.", close: "Sluiten", send: "Versturen", open: "Chat openen" },
  pt: { fail: "O chat ao vivo não está a carregar. Escreve-nos para helpdesk@rapid-remove.com ou por WhatsApp – respondemos depressa.", sub: "RapidRemove Support", ai: "A Lena é a nossa assistente de IA · a equipa está a um clique", tT: "Olá! 👋", tS: "Dúvidas sobre a remoção? Ajudo já.", hi: "Escreve à vontade.", hiS: "", ph: "Escreve uma mensagem …", team: "Falar com a equipa", teamGo: "O Max ou o Matthias continua já aqui no chat.", q: ["Quanto custa?", "Quanto tempo demora?", "Remover uma avaliação", "É legal?"], err: "Algo falhou – passo-te à nossa equipa.", close: "Fechar", send: "Enviar", open: "Abrir chat" },
  ja: { fail: "ライブチャットを読み込めません。helpdesk@rapid-remove.com またはWhatsAppでご連絡ください。すぐに返信します。", sub: "RapidRemove Support", ai: "LenaはAIアシスタントです · ワンクリックでチームにつながります", tT: "こんにちは！👋", tS: "削除についてのご質問はお気軽にどうぞ。", hi: "お気軽にどうぞ。", hiS: "", ph: "メッセージを入力 …", team: "チームとチャット", teamGo: "MaxまたはMatthiasがこのチャットで対応します。", q: ["料金はいくら？", "どのくらいかかる？", "口コミを1件削除", "合法ですか？"], err: "問題が発生しました。チームにおつなぎします。", close: "閉じる", send: "送信", open: "チャットを開く" },
  sv: { fail: "Livechatten laddar inte just nu. Mejla helpdesk@rapid-remove.com eller skriv på WhatsApp – vi svarar snabbt.", sub: "RapidRemove Support", ai: "Lena är vår AI-assistent · teamet är ett klick bort", tT: "Hej! 👋", tS: "Frågor om borttagning? Jag hjälper dig direkt.", hi: "Skriv bara.", hiS: "", ph: "Skriv ett meddelande …", team: "Chatta med teamet", teamGo: "Max eller Matthias tar över här i chatten.", q: ["Vad kostar det?", "Hur lång tid tar det?", "Ta bort ett omdöme", "Är det lagligt?"], err: "Något gick fel – jag kopplar dig till teamet.", close: "Stäng", send: "Skicka", open: "Öppna chatten" },
  da: { fail: "Livechatten indlæser ikke lige nu. Skriv til helpdesk@rapid-remove.com eller på WhatsApp – vi svarer hurtigt.", sub: "RapidRemove Support", ai: "Lena er vores AI-assistent · teamet er et klik væk", tT: "Hej! 👋", tS: "Spørgsmål om fjernelse? Jeg hjælper med det samme.", hi: "Skriv bare løs.", hiS: "", ph: "Skriv en besked …", team: "Chat med teamet", teamGo: "Max eller Matthias tager over her i chatten.", q: ["Hvad koster det?", "Hvor lang tid tager det?", "Fjern en anmeldelse", "Er det lovligt?"], err: "Noget gik galt – jeg forbinder dig med teamet.", close: "Luk", send: "Send", open: "Åbn chat" },
  no: { fail: "Livechatten laster ikke akkurat nå. Skriv til helpdesk@rapid-remove.com eller på WhatsApp – vi svarer raskt.", sub: "RapidRemove Support", ai: "Lena er vår AI-assistent · teamet er ett klikk unna", tT: "Hei! 👋", tS: "Spørsmål om fjerning? Jeg hjelper deg med en gang.", hi: "Bare skriv i vei.", hiS: "", ph: "Skriv en melding …", team: "Chat med teamet", teamGo: "Max eller Matthias tar over her i chatten.", q: ["Hva koster det?", "Hvor lang tid tar det?", "Fjern en omtale", "Er dette lovlig?"], err: "Noe gikk galt – jeg kobler deg til teamet.", close: "Lukk", send: "Send", open: "Åpne chat" },
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
  window.__rrTidioAllowed = true; // nur diese Übergabe darf Tidio öffnen
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
  const [coOpen, setCoOpen] = React.useState(null); // Bestellformular im Chat
  const retained = React.useRef(false);
  const lastPick = React.useRef(null); // zuletzt geladenes Profil mit Bewertungen (für „Namen schreiben“) // Team-Wunsch schon einmal mit „Ich helfe sofort“ beantwortet
  const [handed, setHanded] = React.useState(false); // mit dem Team verbunden → eigene Bubble weg, nur noch Tidio
  React.useEffect(() => { if (ss.get("rr_site_chat_handed")) setHanded(true); }, []);
  const body = React.useRef(null), inp = React.useRef(null), everOpen = React.useRef(false);
  React.useEffect(() => { try { const m = JSON.parse(sessionStorage.getItem(KEY) || "[]"); if (m.length) { setMsgs(m); everOpen.current = true; } } catch (e) { /* */ } }, []);
  React.useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) { /* */ } }, [msgs]);
  // Immer ans Ende scrollen – auch nachdem Karten/Buttons fertig aufgebaut sind (sonst bleibt die Angebotskarte halb verdeckt)
  React.useEffect(() => {
    const b = body.current; if (!b) return undefined;
    const go = () => { b.scrollTop = b.scrollHeight; };
    go(); const r = requestAnimationFrame(go); const t1 = setTimeout(go, 120); const t2 = setTimeout(go, 600);
    return () => { cancelAnimationFrame(r); clearTimeout(t1); clearTimeout(t2); };
  }, [msgs, busy, open]);
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
  const P = PK[lang] || PK.en;
  const maxPct = () => msgs.reduce((m, x) => Math.max(m, (x.co && x.co.pct) || 0), 0);
  const botSay = async (cur, text) => { const n = [...cur, { r: "b", t: text }]; setMsgs(n); return n; };
  /** Bestätigung „Diese X Bewertungen löschen?“ (Bewertungen ohne Text fliegen raus – nur mit Vorauszahlung). */
  const confirmItems = (cur, items, place) => {
    const ok = items.filter((r) => !(r.rating && !String(r.text || "").trim() && r.name));
    const nt = items.length - ok.length;
    if (!ok.length) return [...cur, { r: "b", t: P.nt.replace("{n}", nt) }];
    return [...cur, { conf: { items: ok, nt, place } }];
  };
  /** Google-Links im Chat: Bewertungs-Link(s) → Bestätigung, Profil-Link → Auswahlliste. */
  const handleLinks = async (q, links) => {
    let cur = [...msgs.filter((x) => !x.h && !x.chs), { r: "u", t: q }];
    setMsgs(cur); setTxt(""); setBusy(true);
    const t0 = Date.now();
    const rs = await Promise.all(links.slice(0, 5).map((link) => fetch(OPS + "/chat/site/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid: sidOf(), link, lang, message: q, page: window.location.pathname }) }).then((r) => r.json()).catch(() => ({ ok: false }))));
    const wait = 1400 - (Date.now() - t0); if (wait > 0) await sleep(wait);
    const prof = rs.find((r) => r.ok && r.type === "profile");
    const revs = rs.filter((r) => r.ok && r.type === "review");
    if (prof && !(prof.reviews || []).length) {
      await botSay(cur, P.notIn);
    } else if (prof) {
      lastPick.current = { place: prof.place, reviews: prof.reviews || [] };
      cur = await botSay(cur, P.pick.replace("{name}", prof.place.name));
      cur = [...cur, { pick: { place: prof.place, reviews: prof.reviews || [] } }]; setMsgs(cur);
    } else if (revs.length) {
      const items = revs.map((r) => ({ ...r.review, link: r.review.link }));
      const names = items.map((r) => r.name).filter(Boolean);
      cur = await botSay(cur, names.length ? (names.length > 1 ? P.foundN : P.found).replace("{list}", names.join(", ")) : P.conf.replace("{n}", items.length));
      cur = confirmItems(cur, items, revs[0].place); setMsgs(cur);
    } else {
      await botSay(cur, P.unknown);
    }
    setBusy(false);
  };
  /** Namen aus der geladenen Liste erkennen („Müller, Anna K.“) → Bestätigung. */
  const matchNames = (q) => {
    const pk = lastPick.current; if (!pk || !pk.reviews.length) return null;
    const toks = q.split(/,|;|\n| und | and | & | sowie | y | et | e /i).map((x) => x.trim().toLowerCase()).filter((x) => x.length >= 3);
    if (!toks.length) return null;
    const hits = []; let matched = 0;
    for (const tk of toks) {
      const h = pk.reviews.filter((r) => { const n = String(r.name || "").toLowerCase(); return n && (n.includes(tk) || (n.length >= 5 && tk.split(/\s+/).length <= 6 && tk.includes(n))); });
      if (h.length) { matched++; h.forEach((r) => { if (!hits.includes(r)) hits.push(r); }); }
    }
    return matched && matched >= Math.ceil(toks.length / 2) ? hits.slice(0, 20) : null;
  };
  const send = async (raw, extra = {}) => {
    const q = String(raw || "").trim();
    if (!q || busy) return;
    const links = (q.match(/https?:\/\/\S+/g) || []).filter((u) => /google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/|maps\.google\./i.test(u));
    if (links.length) { await handleLinks(q, links); return; }
    const named = matchNames(q);
    if (named) {
      let cur = [...msgs.filter((x) => !x.h && !x.chs), { r: "u", t: q }];
      setMsgs(cur); setTxt(""); setBusy(true); await sleep(900);
      cur = confirmItems(cur, named, lastPick.current.place); setMsgs(cur); setBusy(false);
      return;
    }
    const history = msgs.filter((m) => m.t && !m.sys).slice(-20).map((m) => ({ role: m.r === "u" ? "user" : "assistant", text: m.t }));
    const next = [...msgs.filter((x) => !x.h && !x.chs), { r: "u", t: q }];
    setMsgs(next); setTxt(""); setBusy(true);
    const t0 = Date.now();
    try {
      const res = await fetch(OPS + "/chat/site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid: sidOf(), message: q, history, lang, page: window.location.pathname, retained: retained.current, ...extra }) });
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
      if (j.retain) retained.current = true;
      if (j.choices && j.choices.length && !j.handoff) { await sleep(250); cur = [...cur, { chs: j.choices }]; setMsgs(cur); }
      if (j.checkout && !j.handoff) { await sleep(500); cur = [...cur, { co: j.checkout }]; setMsgs(cur); }
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
        <div className="sc-top"><AV /><div className="t"><b>{NAME}</b><span>{t.sub}</span></div>
          <button type="button" className="sc-x" onClick={() => setOpen(false)} aria-label={t.close}><ChevronDown /></button></div>
        <div className="sc-body" ref={body}>
          {!msgs.length ? <div className="sc-hi"><AV /><b>{t.hi}</b>{t.hiS ? <span>{t.hiS}</span> : null}</div> : null}
          {msgs.map((m, i) => (m.pick
            ? <ReviewPicker key={i} pick={m.pick} lang={lang} P={P} done={m.done} onNext={(items) => { setMsgs((x) => confirmItems(x.map((y, k) => (k === i ? { ...y, done: 1 } : y)), items, m.pick.place)); }} />
            : m.conf
            ? <ConfirmCard key={i} conf={m.conf} lang={lang} P={P} done={m.done || m.ordered} onYes={() => setCoOpen({ service: "reviews", country: (m.conf.place && m.conf.place.country) || "", placeCountry: (m.conf.place && m.conf.place.country) || "", pct: maxPct(), items: m.conf.items, company: (m.conf.place && m.conf.place.name) || "", idx: i })}
                onNo={() => setMsgs((x) => [...x.map((y, k) => (k === i ? { ...y, done: 1 } : y)), { r: "b", t: P.change }, ...(lastPick.current ? [{ pick: lastPick.current }] : [])])} />
            : m.chs
            ? <div key={i} className="sc-chs">{m.chs.map((c, k) => <button key={k} type="button" className={c.value === "__team__" ? "tm" : ""} style={{ animationDelay: k * 60 + "ms" }} disabled={busy}
                onClick={() => { if (c.value === "__team__") { setMsgs((x) => [...x.filter((y) => !y.chs), { r: "u", t: c.label }]); toTeam([...msgs.filter((y) => !y.chs), { r: "u", t: c.label }]); } else send(c.label); }}>{c.value === "__team__" ? <Headphones /> : null}{c.label}</button>)}</div>
            : m.co
            ? <OfferCard key={i} co={m.co} lang={lang} ordered={m.ordered} onOrder={() => setCoOpen({ ...m.co, idx: i })} />
            : m.h
            ? <button key={i} type="button" className="sc-human" onClick={() => toTeam()}><Headphones />{t.team}</button>
            : m.sys ? <div key={i} className="sc-sys">{m.t}</div>
            : <div key={i} className={"sc-msg " + (m.r === "u" ? "u" : "b")}>{m.t}</div>))}
          {busy ? <div className="sc-msg b typ"><i /><i /><i /></div> : null}
        </div>
        {userCount < 1 ? <div className="sc-qs">{t.q.map((q) => <button key={q} type="button" onClick={() => send(q)} disabled={busy}>{q}</button>)}</div> : null}
        <form className="sc-in" onSubmit={(e) => { e.preventDefault(); send(txt); }}>
          <input ref={inp} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t.ph} autoComplete="off" maxLength={1200} enterKeyHint="send" />
          <button type="submit" disabled={!txt.trim() || busy} aria-label={t.send}><ArrowUp /></button>
        </form>
        <p className="sc-ai">{t.ai}</p>
        {coOpen ? <Checkout co={coOpen} lang={lang} sid={sidOf()} onClose={() => setCoOpen(null)} onDone={(id) => {
          const c = CO[lang] || CO.en;
          setMsgs((m) => [...m.map((x, k) => (k === coOpen.idx ? { ...x, ordered: id } : x)), { r: "b", t: c.okMsg.replace("{id}", id) }]);
          setCoOpen(null);
        }} /> : null}
      </section>
    </div>
  );
}
