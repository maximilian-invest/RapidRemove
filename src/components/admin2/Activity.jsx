"use client";
/* Neues Admin — Dashboard-Aktivität (Design-Handoff 9): Zeile im Auftrag + eigener Screen mit Timeline.
   Daten: ops /admin/activity (customer_events je Kunden-E-Mail). */
import React from "react";
import {
  Activity as ActIcon, ChevronRight, LogIn, LogOut, Eye, MousePointerClick, CreditCard, XCircle, CheckCircle2, ClipboardList,
  MailOpen, UserX, Send, Loader, MonitorSmartphone, Ban, ArrowLeft, Search,
} from "lucide-react";
import { customerActivity, custInviteOne, activityFeed } from "@/lib/admin-api";
import { isOffen, ageMin, fmtAge } from "./model";

export const ACT_EV = {
  mail_open: [MailOpen, "E-Mail geöffnet", "var(--info)"],
  login: [LogIn, "Eingeloggt", "var(--success)"],
  dash_open: [MonitorSmartphone, "Dashboard geöffnet", "var(--success)"],
  page_view: [Eye, "Angesehen", "var(--ink)"],
  click: [MousePointerClick, "Geklickt", "var(--ink)"],
  payment_open: [CreditCard, "Zahlung geöffnet", "var(--orange-800)"],
  payment_abort: [XCircle, "Zahlung abgebrochen", "var(--danger)"],
  payment_success: [CheckCircle2, "Bezahlt", "var(--success)"],
  software_accept: [CheckCircle2, "Software angenommen", "var(--success)"],
  software_decline: [Ban, "Software abgelehnt", "var(--danger)"],
  form_progress: [ClipboardList, "Fragebogen", "var(--ink)"],
  logout: [LogOut, "Ausgeloggt", "var(--g3)"],
  session_end: [LogOut, "Sitzung beendet", "var(--g3)"],
};
const p2 = (n) => String(n).padStart(2, "0");
export function relTime(iso, now = Date.now()) {
  if (!iso) return "—";
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Min.`;
  if (m < 1440) return `vor ${Math.floor(m / 60)} Std.`;
  const d = Math.floor(m / 1440);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
}
const dayLbl = (iso, now = new Date()) => {
  const d = new Date(iso); const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const n = Math.round((b - a) / 864e5);
  return n === 0 ? "Heute" : n === 1 ? "Gestern" : n < 7 ? `Vor ${n} Tagen` : `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`;
};
const hhmm = (iso) => { const d = new Date(iso); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
const detailOf = (e) => {
  const m = e.meta || {};
  if (e.type === "login" || e.type === "dash_open") return [e.target !== "Dashboard geöffnet" ? e.target : "", m.device].filter(Boolean).join(" · ");
  if (e.type === "click") return e.target ? `„${e.target}“` : "";
  if (e.type === "mail_open") return [e.target, m.device].filter(Boolean).join(" · ");
  return e.target || "";
};

/** Lädt die Aktivität einer E-Mail (mit kleinem Cache im Speicher). */
const cache = new Map();
export function useActivity(email, orderId, bump) {
  const key = (email || "").toLowerCase();
  const [d, setD] = React.useState(() => cache.get(key) || null);
  React.useEffect(() => {
    if (!key) return;
    let alive = true;
    customerActivity(key, orderId).then((r) => { cache.set(key, r); if (alive) setD(r); }).catch(() => { if (alive) setD((x) => x || { error: true, events: [] }); });
    return () => { alive = false; };
  }, [key, orderId, bump]);
  return d;
}

/** Zeile „Dashboard-Aktivität" im Auftrag (über „Fortschritt"). */
export function ActivityRow({ o, onOpen }) {
  const a = useActivity(o.email, o.id);
  const ev = (a && a.events) || [];
  const seen = !!(a && (a.lastSeenAt || ev.some((e) => e.type !== "mail_open")));
  const last = ev.find((e) => !["logout", "session_end", "mail_open"].includes(e.type));
  const logins = a ? (a.loginCount || 0) + (a.openCount || 0) : 0;
  return (
    <div className="info">
      <button type="button" className="ir" onClick={onOpen}>
        <span className="ico"><ActIcon /></span>
        <span className="t"><span>Dashboard-Aktivität</span>
          <b style={{ color: !a ? "var(--g3)" : seen ? "var(--ink)" : "var(--danger)" }}>
            {!a ? "Lädt …" : seen ? `Zuletzt ${relTime(a.lastSeenAt || (last && last.ts))}${last ? " · " + ACT_EV[last.type][1] : ""}` : "Noch nie eingeloggt"}</b></span>
        {seen && logins ? <span className="alive">{logins}×</span> : null}
        <ChevronRight />
      </button>
    </div>
  );
}

/** Screen „Aktivität". */
export function ActivityScreen({ ctx, id }) {
  const { orders, back, toast, isDesk } = ctx;
  const o = orders.find((x) => x.id === id);
  const [bump, setBump] = React.useState(0);
  const a = useActivity(o && o.email, o && o.id, bump);
  const [busy, setBusy] = React.useState(false);
  const [limit, setLimit] = React.useState(150);
  if (!o) return null;
  const ev = (a && a.events) || [];
  const seen = !!(a && (a.lastSeenAt || ev.some((e) => e.type !== "mail_open")));
  const logins = a ? (a.loginCount || 0) + (a.openCount || 0) : 0;
  const days = [];
  for (const e of ev.slice(0, limit)) {
    const l = dayLbl(e.ts);
    if (!days.length || days[days.length - 1][0] !== l) days.push([l, []]);
    days[days.length - 1][1].push(e);
  }
  const invite = async () => {
    setBusy(true);
    try { await custInviteOne({ email: o.email, name: o.name, lang: o.lang, orderId: o.id }); toast("Login-Link an " + o.email + " gesendet"); setBump((x) => x + 1); }
    catch (e) { toast("Senden fehlgeschlagen: " + e.message); }
    setBusy(false);
  };
  return (
    <>
      <div className="anav"><button type="button" className="circ" aria-label="Zurück" onClick={back}><ArrowLeft /></button>
        <button type="button" className="circ" aria-label="Aktualisieren" onClick={() => setBump((x) => x + 1)}>{a ? <ActIcon /> : <Loader className="spin" />}</button></div>
      <div className="dh"><div><h1>Aktivität</h1><p>{o.id} · {o.name || o.email}</p></div></div>
      <div className="rsum">
        <div><b>{a ? logins : "–"}</b><span>Logins</span></div>
        <div><b>{a ? a.clickCount || 0 : "–"}</b><span>Klicks</span></div>
        <div><b style={{ fontSize: 18, lineHeight: 1.6 }}>{a && seen ? relTime(a.lastSeenAt) : "—"}</b><span>Zuletzt</span></div>
      </div>
      {a && !seen ? (
        <div className="anever"><span className="mi"><UserX /></span><b>Noch nie eingeloggt</b>
          <span>{o.name || "Der Kunde"} hat das Dashboard noch nicht geöffnet.</span>
          <button type="button" className="cta" disabled={busy || !o.email} onClick={invite}><Send />{busy ? "Sendet …" : "Login-Link senden"}</button></div>
      ) : null}
      {days.map(([l, list]) => (
        <React.Fragment key={l}>
          <div className="lbl" style={{ marginTop: 18 }}>{l}</div>
          <div className="card atl">
            {list.map((e) => {
              const E = ACT_EV[e.type] || [Eye, e.type, "var(--ink)"]; const I = E[0];
              return (
                <div key={e.id} className="ae">
                  <span className="ad" style={{ color: E[2] }}><I /></span>
                  <div className="t"><b>{E[1]}</b><span>{detailOf(e) || " "}</span></div>
                  <span className="ah">{hhmm(e.ts)}</span>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}
      {ev.length > limit ? <button type="button" className="more-b" style={{ marginTop: 12 }} onClick={() => setLimit((x) => x + 200)}>Ältere anzeigen</button> : null}
      {a && seen && !ev.length ? <p className="sh" style={{ marginTop: 14 }}>Zuletzt eingeloggt {relTime(a.lastSeenAt)} – Details werden ab jetzt erfasst.</p> : null}
      {a && seen ? (
        <div className="ctas" style={{ marginTop: 18 }}><button type="button" className="cta gh" disabled={busy || !o.email} onClick={invite}><Send />{busy ? "Sendet …" : "Login-Link erneut senden"}</button></div>
      ) : null}
      {isDesk ? null : <div style={{ height: 8 }} />}
    </>
  );
}

/* ---------------- Globaler Feed „Aktivitäten" (Design-Handoff 11) ---------------- */
const GA_F = [["all", "Alle"], ["login", "Logins"], ["payment", "Zahlungen"], ["click", "Klicks"], ["never", "Nie eingeloggt"]];
export function GlobalActivityScreen({ ctx }) {
  const { orders, openOrder, setMoreSub, now } = ctx;
  const [f, setF] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [dq, setDq] = React.useState("");
  const [d, setD] = React.useState(null); // { stats, seen, items, nextCursor }
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  React.useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 250); return () => clearTimeout(t); }, [q]);

  // Kunde je E-Mail = neuester Auftrag dieser E-Mail
  const byEmail = React.useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const k = (o.email || "").toLowerCase(); if (!k) continue;
      const x = m.get(k); if (!x || String(o.createdAt || "") > String(x.createdAt || "")) m.set(k, o);
    }
    return m;
  }, [orders]);
  const byId = React.useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);
  const orderOf = (e) => (e.orderId && byId.get(e.orderId)) || byEmail.get((e.email || "").toLowerCase()) || null;

  const params = React.useCallback((cursor) => {
    const ql = dq.toLowerCase();
    const emails = ql ? [...byEmail.entries()].filter(([, o]) => ((o.name || "") + " " + o.id).toLowerCase().includes(ql)).map(([k]) => k).concat(orders.filter((o) => o.id.toLowerCase().includes(ql) && o.email).map((o) => o.email.toLowerCase())) : [];
    const types = ql ? Object.entries(ACT_EV).filter(([, v]) => v[1].toLowerCase().includes(ql)).map(([k]) => k) : [];
    return { filter: f === "never" ? "all" : f, q: dq, emails: [...new Set(emails)].slice(0, 300), types, cursor, limit: 50 };
  }, [f, dq, byEmail, orders]);

  const load = React.useCallback(async (silent) => {
    if (!silent) setBusy(true);
    try {
      const r = await activityFeed(params(null));
      setErr("");
      setD((old) => {
        if (!silent || !old) return r;
        // Polling: neue Einträge oben einfließen lassen, Geladenes behalten
        const ids = new Set(old.items.map((e) => e.id));
        const fresh = r.items.filter((e) => !ids.has(e.id)).map((e) => ({ ...e, fresh: true }));
        return { ...old, stats: r.stats, seen: r.seen, items: fresh.concat(old.items) };
      });
    } catch (e) { setErr(e.message); }
    if (!silent) setBusy(false);
  }, [params]);
  React.useEffect(() => { setD(null); load(false); }, [load]);
  React.useEffect(() => { const t = setInterval(() => { if (document.visibilityState === "visible") load(true); }, 30000); return () => clearInterval(t); }, [load]);
  const more = async () => {
    if (!d || !d.nextCursor || busy) return;
    setBusy(true);
    try { const r = await activityFeed(params(d.nextCursor)); setD((o) => ({ ...o, items: o.items.concat(r.items), nextCursor: r.nextCursor })); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  // Infinite Scroll
  const sentinel = React.useRef(null);
  React.useEffect(() => {
    const el = sentinel.current; if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) more(); }, { rootMargin: "400px" });
    io.observe(el); return () => io.disconnect();
  });

  const seen = React.useMemo(() => new Set((d && d.seen) || []), [d]);
  const neverAll = React.useMemo(() => {
    if (!d) return [];
    return [...byEmail.values()].filter((o) => isOffen(o) && !seen.has((o.email || "").toLowerCase()))
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }, [d, byEmail, seen]);
  const ql = dq.toLowerCase();
  const never = neverAll.filter((o) => !ql || ((o.name || "") + " " + o.id + " " + (o.email || "")).toLowerCase().includes(ql));

  const items = (d && d.items) || [];
  const days = [];
  for (const e of items) {
    const l = dayLbl(e.ts);
    if (!days.length || days[days.length - 1][0] !== l) days.push([l, []]);
    days[days.length - 1][1].push(e);
  }
  const st = (d && d.stats) || {};
  return (
    <>
      <div className="anav"><button type="button" className="circ mback" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Aktivitäten</div>
      <div className="usrch" style={{ marginBottom: 12 }}><Search /><input type="search" placeholder="Kunde, RR-Nr., E-Mail, Aktion" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="rsum" style={{ marginTop: 0 }}>
        <button type="button" onClick={() => setF("login")}><b>{d ? st.loginsToday || 0 : "–"}</b><span>Logins heute</span></button>
        <button type="button" onClick={() => setF("payment")}><b style={{ color: st.paymentAborts7d ? "var(--danger)" : undefined }}>{d ? st.paymentAborts7d || 0 : "–"}</b><span>Abbrüche · 7 T</span></button>
        <button type="button" onClick={() => setF("never")}><b>{d ? neverAll.length : "–"}</b><span>Nie eingeloggt</span></button>
      </div>
      <div className="achips">{GA_F.map(([k, l]) => <button key={k} type="button" className={"achip" + (f === k ? " on" : "")} onClick={() => setF(k)}>{l}{k === "never" && d ? <span className="n">{neverAll.length}</span> : null}</button>)}</div>
      {err ? <div className="aempty"><b>Fehler</b>{err}</div> : null}
      {!d && !err ? <div className="aempty"><b><Loader className="spin" style={{ width: 22, height: 22 }} /></b>Lädt …</div> : null}
      {d && f === "never" ? (
        <div className="card atl">
          {never.length ? never.map((o) => (
            <button key={o.id} type="button" className="ae ga" onClick={() => openOrder(o.id, true)}>
              <span className="ad" style={{ color: "var(--danger)" }}><UserX /></span>
              <div className="t"><b>{o.name || o.email}</b><span>{o.id} · seit {fmtAge(ageMin(o, null, now))}</span></div>
              <ChevronRight />
            </button>
          )) : <div className="aempty"><b>{q ? "Nichts gefunden" : "Alle waren schon da"}</b></div>}
        </div>
      ) : null}
      {d && f !== "never" ? (
        <>
          {!items.length ? <div className="aempty"><b>{dq ? "Nichts gefunden" : "Noch keine Aktivität"}</b>{dq ? "" : "Sobald Kunden das Dashboard öffnen, erscheint es hier."}</div> : null}
          {days.map(([l, list]) => (
            <React.Fragment key={l}>
              <div className="lbl" style={{ marginTop: 18 }}>{l}</div>
              <div className="card atl">
                {list.map((e) => {
                  const E = ACT_EV[e.type] || [Eye, e.type, "var(--ink)"]; const I = E[0];
                  const o = orderOf(e);
                  return (
                    <button key={e.id} type="button" className={"ae ga" + (e.fresh ? " fresh" : "")} disabled={!o} onClick={() => o && openOrder(o.id, true)}>
                      <span className="ad" style={{ color: E[2] }}><I /></span>
                      <div className="t"><b>{(o && o.name) || e.email} · <i>{E[1]}</i></b><span>{[detailOf(e), o ? o.id : ""].filter(Boolean).join(" · ") || " "}</span></div>
                      <span className="ah">{hhmm(e.ts)}</span>
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
          {d.nextCursor ? <button ref={sentinel} type="button" className="more-b" style={{ marginTop: 12 }} disabled={busy} onClick={more}>{busy ? "Lädt …" : "Ältere anzeigen"}</button> : null}
        </>
      ) : null}
      <p className="sh" style={{ marginTop: 14 }}>Admin-Ansichten werden nicht erfasst.</p>
    </>
  );
}
