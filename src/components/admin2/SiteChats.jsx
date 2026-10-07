"use client";
/* Website-Chats (Admin → Website-Chats): wer hat mit Lena geschrieben, Verlauf nachlesen,
   ob ans Team übergeben wurde und ob danach bestellt wurde. Daten: /admin/chat/site (+ /thread). */
import React from "react";
import { ArrowLeft, MessageCircle, Headphones, ShoppingBag, Mail, Globe, ChevronRight } from "lucide-react";
import { siteChats, siteChatThread } from "@/lib/admin-api";

const fmt = (iso) => { if (!iso) return ""; const d = new Date(iso); const today = new Date(); const same = d.toDateString() === today.toDateString(); return same ? d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" }) + " · " + d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }); };
const FLAG = { de: "🇩🇪", en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", it: "🇮🇹", nl: "🇳🇱", pt: "🇵🇹", ja: "🇯🇵", sv: "🇸🇪", da: "🇩🇰", no: "🇳🇴" };
const F = [["all", "Alle"], ["order", "Bestellt"], ["team", "An Team"], ["open", "Ohne Bestellung"]];

export default function SiteChatsScreen({ ctx }) {
  const { setMoreSub, openOrder, orders } = ctx;
  const [d, setD] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [f, setF] = React.useState("all");
  const [sel, setSel] = React.useState(null);
  const [thread, setThread] = React.useState(null);
  const load = React.useCallback(() => siteChats(60).then(setD).catch((e) => setErr(e.message)), []);
  React.useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, [load]);
  React.useEffect(() => {
    if (!sel) { setThread(null); return; }
    let live = true; setThread(null);
    const get = () => siteChatThread(sel.sid).then((r) => live && setThread(r.rows)).catch(() => {});
    get(); const iv = setInterval(get, 10000);
    return () => { live = false; clearInterval(iv); };
  }, [sel]);
  const list = ((d && d.chats) || []).filter((c) => (f === "order" ? c.order_ref : f === "team" ? c.handoff : f === "open" ? !c.order_ref : true));
  const st = (d && d.stats) || {};
  const hasOrder = (id) => (orders || []).some((o) => o.id === id);

  if (sel) {
    return (
      <div className="scx">
        <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={() => setSel(null)}><ArrowLeft /></button></div>
        <div className="ttl">{sel.cust_name || sel.email || "Besucher"}</div>
        <div className="scx-meta">
          <span><Globe />{FLAG[sel.lang] || ""} {(sel.pages || []).join(", ") || "/"}</span>
          <span>{fmt(sel.started)}</span>
          {sel.handoff ? <span className="tg team"><Headphones />An Team übergeben</span> : null}
          {sel.order_ref ? <button type="button" className="tg ord" onClick={() => hasOrder(sel.order_ref) && openOrder(sel.order_ref, true)}><ShoppingBag />Bestellt · #{sel.order_ref}</button> : null}
          {sel.email ? <a className="tg" href={"mailto:" + sel.email}><Mail />{sel.email}</a> : null}
        </div>
        <div className="card scx-thread">
          {!thread ? <div className="aempty"><b>Lädt …</b></div> : thread.map((m, i) => (
            m.role === "event"
              ? <div key={i} className="ev"><Headphones />{m.text} · {fmt(m.created_at)}</div>
              : <div key={i} className={"bb " + (m.role === "user" ? "u" : "b")}><span>{m.text}</span><small>{m.role === "user" ? "Besucher" : "Lena"} · {fmt(m.created_at)}</small></div>
          ))}
        </div>
        {sel.handoff ? <p className="sh">Der weitere Verlauf mit Max/Matthias läuft in Tidio. Dort liegt dieser Verlauf auch im Kontakt unter „ki_chat_verlauf“.</p> : null}
      </div>
    );
  }
  return (
    <div className="scx">
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Website-Chats</div>
      <div className="kgrid scx-k">
        <div className="kc"><span className="kl">Gespräche (60 Tage)</span><b>{st.chats ?? "–"}</b><span className="ks">mit Lena auf der Website</span></div>
        <div className="kc"><span className="kl">Danach bestellt</span><b>{st.ordered ?? "–"}</b><span className="ks">{st.chats ? st.conv + " % Abschlussquote" : "—"}</span></div>
        <div className="kc"><span className="kl">An Team übergeben</span><b>{st.handed ?? "–"}</b><span className="ks">weiter in Tidio</span></div>
      </div>
      <div className="achips">{F.map(([k, l]) => <button key={k} type="button" className={"achip" + (f === k ? " on" : "")} onClick={() => setF(k)}>{l}</button>)}</div>
      {err ? <div className="aempty"><b>Fehler</b>{err}</div> : null}
      {!d && !err ? <div className="aempty"><b>Lädt …</b></div> : null}
      {d && !list.length ? <div className="aempty"><b>Noch keine Chats</b>Sobald jemand auf der Website mit Lena schreibt, steht es hier.</div> : null}
      <div className="card ls">
        {list.map((c) => (
          <button key={c.sid} type="button" className="ord scx-row" onClick={() => setSel(c)}>
            <span className={"mav" + (c.order_ref ? " ok" : c.handoff ? " tm" : "")}>{c.order_ref ? <ShoppingBag /> : c.handoff ? <Headphones /> : <MessageCircle />}</span>
            <span className="t">
              <span className="l1"><b>{c.cust_name || c.email || "Besucher"}</b><span className="p">{fmt(c.last)}</span></span>
              <span className="l2">{FLAG[c.lang] || ""} „{String(c.first_q || "").slice(0, 70)}{String(c.first_q || "").length > 70 ? "…" : ""}“ · {c.n_user} Nachr.{c.order_ref ? " · bestellt #" + c.order_ref : ""}{!c.order_ref && c.handoff ? " · an Team" : ""}</span>
            </span><ChevronRight />
          </button>
        ))}
      </div>
    </div>
  );
}
