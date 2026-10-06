"use client";
/* Support-Chatbot der Kunden-App (Design-Handoff 12). Nur im Kunden-Dashboard.
   Floating-Button „Help" → Chat (mobil Vollbild von unten, Desktop Panel rechts).
   Antworten: ops /cust/chat (Claude mit Kontext aus den echten Aufträgen), „Team kontaktieren" → /cust/chat/ticket.
   Verlauf bleibt für die Tab-Sitzung erhalten (sessionStorage); an den Server gehen die letzten 8 Nachrichten. */
import React from "react";
import { MessageCircle, ChevronDown, ArrowUp, Headphones, X } from "lucide-react";
import { track } from "./tracker";
import { asset } from "@/lib/base";

const OPS = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
const KEY = "rr_cust_chat";
const TEASE_KEY = "rr_cust_chat_tease"; // Teaser je Tab-Sitzung höchstens 2× (weggeklickt = Ruhe)
const ss = { get: (k) => { try { return sessionStorage.getItem(k) || ""; } catch (e) { return ""; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* */ } } };
const AV = () => <span className="ch-av"><img src={asset("/assets/app/rocket-mark.png")} alt="" /></span>;

async function post(path, body) {
  const res = await fetch(OPS + "/cust/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.ok) { const e = new Error(j.error || "HTTP " + res.status); e.code = j.error; throw e; }
  return j;
}

export default function SupportChat({ token, T, lang, imp, showToast, open, setOpen, sit = {}, hidden = false }) {
  const [msgs, setMsgs] = React.useState(() => { try { return JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) { return []; } });
  const [busy, setBusy] = React.useState(false);
  const [txt, setTxt] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const body = React.useRef(null);
  const inp = React.useRef(null);
  React.useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) { /* */ } }, [msgs]);
  React.useEffect(() => { const b = body.current; if (b) b.scrollTop = b.scrollHeight; }, [msgs, busy, open]);
  React.useEffect(() => {
    if (!open) return;
    if (!imp) track("chat_open", "Chat geöffnet");
    const t = setTimeout(() => { try { inp.current && inp.current.focus({ preventScroll: true }); } catch (e) { /* */ } }, 380);
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = async (raw) => {
    const t = String(raw || "").trim();
    if (!t || busy) return;
    const history = msgs.filter((m) => m.t).slice(-8).map((m) => ({ role: m.r === "u" ? "user" : "assistant", text: m.t }));
    setMsgs((m) => [...m.filter((x) => !x.h), { r: "u", t }]);
    setTxt(""); setBusy(true);
    try {
      const r = await post("chat", { token, message: t, history, lang, contactLabel: T("chContact") });
      setMsgs((m) => [...m, { r: "b", t: String(r.reply || "").trim() }, ...(r.handoff ? [{ h: 1 }] : [])]);
    } catch (e) {
      setMsgs((m) => [...m, { r: "b", t: T("chErr") }, { h: 1 }]);
    }
    setBusy(false);
  };
  const contact = async () => {
    if (imp) { showToast("In der Admin-Ansicht nicht möglich", true); return; }
    if (sent) { showToast(T("chSent")); return; }
    try {
      await post("chat/ticket", { token, transcript: msgs.filter((m) => m.t).map((m) => ({ role: m.r === "u" ? "user" : "assistant", text: m.t })) });
      setSent(true); showToast(T("chSent"));
    } catch (e) { showToast(e.code === "too_many" ? T("tooMany") : T("genericErr"), true); }
  };
  // Launcher: wackelt ab und zu; Sprechblase „Hey, need help?“ nach 6 s und nochmal nach 90 s (max. 2× pro Sitzung).
  const [wig, setWig] = React.useState(false);
  const [tease, setTease] = React.useState(false);
  const everOpen = React.useRef(!!msgs.length);
  React.useEffect(() => { if (open) { everOpen.current = true; setTease(false); ss.set(TEASE_KEY, "x"); } }, [open]);
  React.useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [];
    const shake = () => { if (reduce || open || everOpen.current) return; setWig(true); timers.push(setTimeout(() => setWig(false), 900)); };
    const showTease = () => {
      const n = Number(ss.get(TEASE_KEY) || 0);
      if (everOpen.current || ss.get(TEASE_KEY) === "x" || n >= 2) return;
      ss.set(TEASE_KEY, String(n + 1)); shake(); setTease(true);
      timers.push(setTimeout(() => setTease(false), 9000));
    };
    timers.push(setTimeout(showTease, 6000), setTimeout(showTease, 90000));
    const iv = setInterval(shake, 25000);
    return () => { timers.forEach(clearTimeout); clearInterval(iv); };
  }, [open]);
  const closeTease = (e) => { e.stopPropagation(); setTease(false); ss.set(TEASE_KEY, "x"); };
  // Schnellfragen passend zur Lage des Kunden (nur was auf seine Aufträge zutrifft).
  const QS = [
    sit.sw ? T("chQ2") : null,
    sit.due ? T("chQ3") : null,
    sit.due ? T("chQPay") : null,
    sit.deposit ? T("chQDep") : null,
    sit.open ? T("chQ1") : null,
    sit.open ? T("chQ4") : null,
    sit.notpossible ? T("chQNp") : null,
    !sit.orders ? T("chQHow") : null,
    sit.orders && !sit.open && !sit.due && !sit.sw ? T("chQBack") : null,
    sit.orders && !sit.open && !sit.due && !sit.sw ? T("chQMore") : null,
  ].filter(Boolean).slice(0, 4).concat(T("chQ5"));
  return (
    <>
      <div className={"ctease" + (tease && !open && !hidden ? " show" : "")} role="button" tabIndex={-1} onClick={() => setOpen(true)} aria-hidden={!tease || open}>
        <AV /><span><b>{T("chTeaseT")}</b>{T("chTeaseS")}</span>
        <button type="button" className="ct-x" onClick={closeTease} aria-label={T("chClose")}><X /></button>
      </div>
      <button type="button" className={"cfab" + (open ? " open" : "") + (wig ? " wig" : "") + (hidden && !open ? " gone" : "")} onClick={() => setOpen(!open)} aria-label={open ? T("chClose") : T("chTitle")} data-track="Chat-Button">
        <MessageCircle className="i1" /><ChevronDown className="i2" />{!open && !everOpen.current ? <span className="dot" /> : null}
      </button>
      <section className={"chat" + (open ? " show" : "")} aria-hidden={!open} role="dialog" aria-label={T("chTitle")}>
        <div className="ch-top"><AV /><div className="t"><b>{T("chTitle")}</b><span>{T("chSub")}</span></div>
          <button type="button" className="ch-x" onClick={() => setOpen(false)} aria-label={T("chClose")}><ChevronDown /></button></div>
        <div className="ch-body" ref={body}>
          {!msgs.length ? <div className="ch-hi"><AV /><b>{T("chHi")}</b><span>{T("chHiSub")}</span></div> : null}
          {msgs.map((m, i) => (m.h
            ? <button key={i} type="button" className="ch-human" onClick={contact} disabled={sent}><Headphones />{T("chContact")}</button>
            : <div key={i} className={"msg " + (m.r === "u" ? "u" : "b")}>{m.t}</div>))}
          {busy ? <div className="msg b typ"><i /><i /><i /></div> : null}
        </div>
        {msgs.length <= 6 ? <div className="ch-qs">{QS.map((q) => <button key={q} type="button" onClick={() => send(q)} disabled={busy}>{q}</button>)}</div> : null}
        <form className="ch-in" onSubmit={(e) => { e.preventDefault(); send(txt); }}>
          <input ref={inp} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={T("chPh")} autoComplete="off" maxLength={1500} enterKeyHint="send" />
          <button type="submit" disabled={!txt.trim() || busy} aria-label={T("chSend")}><ArrowUp /></button>
        </form>
      </section>
    </>
  );
}
