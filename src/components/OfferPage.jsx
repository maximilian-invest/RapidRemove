"use client";
/* Angebotsseite /angebot?id=<id>&t=<token> (09.11.2026).
   Gültiges Angebot → Bestellprozess wird mit Profil, Leistung und E-Mail vorbereitet und an der Kasse geöffnet
   (gespeicherter Wizard-Stand + Angebots-Kontext für Banner/Preisbindung). Abgelaufen → neues Angebot anfordern
   oder direkt bestellen. Angenommen → Hinweis aufs Kundenportal. */
import React from "react";
import { asset } from "@/lib/base";
import { pagePath } from "@/lib/page-routes";
import { fetchProfileById } from "@/lib/places";
import { fetchOffer, requestOffer } from "@/lib/order";
import { saveWizardSnapshot } from "@/lib/resume";
import { offerUi, setOfferCtx } from "@/lib/offer-copy";
import { dashHref } from "@/lib/portal";
import { Clock, CircleCheck, FileText, X, Loader } from "lucide-react";

const BP_FONT = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap";

export default function OfferPage() {
  const [st, setSt] = React.useState({ k: "loading" });
  const [busy, setBusy] = React.useState(false);
  const [renewed, setRenewed] = React.useState("");
  const lang = st.o ? st.o.lang : (typeof navigator !== "undefined" && /^de/i.test(navigator.language || "") ? "de" : "en");
  const c = offerUi(lang);

  React.useEffect(() => {
    if (!document.querySelector(`link[href="${BP_FONT}"]`)) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = BP_FONT; document.head.appendChild(l); }
    let alive = true;
    (async () => {
      const qs = new URLSearchParams(window.location.search);
      const t = qs.get("t") || "";
      const id = qs.get("id") || "";
      const o = await fetchOffer(id, t).catch(() => null);
      if (!alive) return;
      if (!o) { setSt({ k: "nf" }); return; }
      try { document.documentElement.lang = o.lang || "de"; } catch (e) {}
      if (o.status === "expired") { setSt({ k: "expired", o, t }); return; }
      if (o.status === "accepted") { setSt({ k: "accepted", o, t }); return; }
      await openCheckout(o, t);
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function openCheckout(o, t, withOffer = true) {
    let prof = null;
    if (o.placeId) prof = await fetchProfileById(o.placeId, o.lang).catch(() => null);
    const cand = prof ? { ...prof, id: "p1", primary: true } : {
      id: "p1", primary: true, placeId: o.placeId || "", name: o.profile, cat: o.category || "", addr: o.addr || "", rating: o.rating != null ? String(o.rating) : "", reviews: o.reviews || 0, cc: o.country || "",
    };
    saveWizardSnapshot({
      placeId: cand.placeId || o.placeId || "offer-" + o.id, name: cand.name || o.profile, step: 5, candidates: [cand], selectedId: "p1", multi: false,
      service: o.service || "remove", express: false, protection: null,
      contact: { name: "", email: o.email || "", phone: "", company: o.profile || "", url: "" }, routed: true,
    });
    setOfferCtx(withOffer ? { id: o.id, t, validUntil: o.validUntil, placeId: o.placeId || "", service: o.service || "remove", amount: o.amount, cur: o.cur } : null);
    window.location.replace(asset(pagePath("wizard", o.lang || "de")) + "?resume=1");
  }

  async function renew() {
    const o = st.o; if (!o) return;
    setBusy(true);
    try {
      await requestOffer({ email: o.email, reminders: false, lang: o.lang, service: o.service, placeId: o.placeId, profile: o.profile, category: o.category, addr: o.addr, country: o.country, rating: o.rating, reviews: o.reviews, checkId: o.checkId || "", source: "offer_renew" });
      setRenewed(c.renewed(o.email));
    } catch (e) { setRenewed(c.err); }
    setBusy(false);
  }
  const fmtD = (iso) => { try { return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso)); } catch (e) { return String(iso || "").slice(0, 10); } };

  const wrap = (children) => (
    <div className="ofp">
      <header className="ofp-top"><a href={asset(lang === "de" ? "/" : "/" + lang + "/")}><img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" /></a></header>
      <main className="ofp-main">{children}</main>
      <style>{CSS}</style>
    </div>
  );

  if (st.k === "loading") return wrap(<div className="ofp-load"><Loader className="spin" /><span>{c.loading}</span></div>);
  if (st.k === "nf") return wrap(<><span className="ofp-ic"><X /></span><h1>{c.nf}</h1><p>{c.nfP}</p><a className="ofp-go" href="https://wa.me/43624593053000">WhatsApp</a></>);
  if (st.k === "accepted") return wrap(<><span className="ofp-ic ok"><CircleCheck /></span><h1>{c.accH}</h1><p>{c.accP}</p><a className="ofp-go" href={dashHref("/my-reviews")}>{c.portal}</a></>);
  const o = st.o;
  const [p1, p2, p3] = c.expP(o.id, o.profile, fmtD(o.validUntil));
  return wrap(
    <>
      <span className="ofp-ic"><Clock /></span>
      <h1>{c.expH}</h1>
      <p>{p1}<b>{p2}</b>{p3}</p>
      {renewed ? <div className="ofp-note"><FileText />{renewed}</div> : (
        <div className="ofp-acts">
          <button type="button" className="ofp-go" disabled={busy} onClick={renew}>{busy ? <Loader className="spin" /> : null}{c.renew}</button>
          <button type="button" className="ofp-2" disabled={busy} onClick={() => openCheckout(o, st.t, false)}>{c.direct}</button>
        </div>
      )}
    </>
  );
}

const CSS = `
.ofp{min-height:100vh;background:#fff;font-family:"Geist",system-ui,-apple-system,"Segoe UI",sans-serif;color:#111;-webkit-font-smoothing:antialiased}
.ofp-top{height:64px;display:flex;align-items:center;padding:0 24px;border-bottom:1px solid #eee}
.ofp-top img{height:30px;width:auto;display:block}
.ofp-main{max-width:520px;margin:0 auto;padding:48px 20px 64px}
.ofp-ic{width:56px;height:56px;border-radius:50%;background:#f4f4f4;display:grid;place-items:center}
.ofp-ic svg{width:26px;height:26px}
.ofp-ic.ok{background:#ecfdf5;color:#047857}
.ofp h1{margin:18px 0 0;font-size:36px;line-height:1.08;font-weight:600;letter-spacing:-1.2px}
.ofp p{margin:12px 0 0;font-size:16px;line-height:1.55;color:#6b6b6b}
.ofp p b{color:#111;font-weight:600}
.ofp-acts{display:flex;flex-direction:column;gap:10px;margin-top:26px}
.ofp-go,.ofp-2{height:52px;border:0;border-radius:26px;font:inherit;font-weight:600;font-size:15px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;text-decoration:none;width:100%}
.ofp-go{background:#ff8000;color:#fff;margin-top:26px}
.ofp-acts .ofp-go{margin-top:0}
.ofp-2{background:#f4f4f4;color:#111}
.ofp-go:disabled,.ofp-2:disabled{opacity:.6;cursor:default}
.ofp-note{display:flex;gap:10px;align-items:center;margin-top:24px;padding:14px 16px;border-radius:16px;background:#ecfdf5;color:#047857;font-size:14px;font-weight:500}
.ofp-note svg{width:18px;height:18px;flex:none}
.ofp-load{display:flex;align-items:center;gap:10px;color:#6b6b6b;font-size:15px;padding-top:40px}
.ofp .spin{width:18px;height:18px;animation:ofpspin 1s linear infinite}
@keyframes ofpspin{to{transform:rotate(360deg)}}
@media (max-width:600px){.ofp h1{font-size:30px}.ofp-main{padding-top:36px}}
`;
