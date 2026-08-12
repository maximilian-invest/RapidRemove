"use client";
import React from "react";
import { Icon as BaseIcon } from "@/components/Icons";
import { AdminIcon } from "./AdminIcons";
import { SubsDashboard } from "./AdminSubs";
import { RedirectsDashboard } from "./AdminRedirects";
import { DangerZone } from "./AdminDanger";
import { AssignControl, AssigneeAvatar } from "./AdminAssign";
import { GamifyLiga } from "./GamifyLiga";
import { asset } from "@/lib/base";
import { sendAdminEmail, sendSms, fetchPayLinkUrl, fetchAdminData, fetchStripe, fetchTemplates, sendPayLink, fetchPayLinks, fetchEvents, fetchEmailPreview, sendTemplate, setOrderStatus, correctOrderPayment, markOrderPaid, setOrderAssignee, fetchVapidKey, savePushSub, fetchTemplateDetail, saveTemplateText, saveCheckEmail, enrichCheckEmails, markCheckEnriched } from "@/lib/admin-api";
import { fetchProfileById } from "@/lib/places";
import { SERVICES, STATUS_FLOW, TEMPLATES, AUTOMATIONS, COMPANY, money, crmExtras } from "@/lib/admin-data";
import { FORM_QUESTIONS } from "@/lib/order-form";
const AI = AdminIcon;
const Icon = { ...BaseIcon, ...AdminIcon };
/* RapidRemove Admin — Hauptanwendung (Dashboard, Bestellungen, E-Mail, Rechnungen) */


/* ---------- shared bits ---------- */
function StatusBadge({ status }) {
  const map = {
    new: ["st-new", "Neu"], progress: ["st-progress", "In Bearbeitung"], done: ["st-done", "Gelöscht"], storniert: ["st-refunded", "Storniert"],
  };
  const [cls, label] = map[status] || ["st-pending", status];
  return <span className={"badge-st " + cls}><span className="d"></span>{label}</span>;
}
function CheckBadge({ status }) {
  const map = {
    neu: ["st-new", "Neu geprüft"], kontaktiert: ["st-progress", "Kontaktiert"], konvertiert: ["st-done", "Beauftragt"], "kein-bedarf": ["st-pending", "Kein Bedarf"],
  };
  const [cls, label] = map[status] || ["st-pending", status];
  return <span className={"badge-st " + cls}><span className="d"></span>{label}</span>;
}
function PayBadge({ o }) {
  if (!o || o.status === "storniert") return null; // Stornierte Bestellungen: keine Zahlungsanzeige
  const pay = o.pay;
  if (pay === "paid") return <span className="pay-badge paid"><Icon.checkCircle />Bezahlt</span>;
  if (pay === "refunded") return <span className="pay-badge failed"><AI.refund />Erstattet</span>;
  if (pay === "failed") return <span className="pay-badge failed"><Icon.alert />Fehlgeschlagen</span>;
  // Mahnung(en): genaue Anzahl aus den Events, falls verfügbar – sonst Status aus dem pay-Feld.
  const m = Number(o.mahnungCount) || 0;
  if (m > 1) return <span className="pay-badge mahn"><Icon.mail />{m} Mahnungen gesandt</span>;
  if (pay === "mahnung" || m === 1) return <span className="pay-badge mahn"><Icon.mail />Mahnung gesandt</span>;
  if (pay === "sent" || o.paylinkSent) return <span className="pay-badge sent"><AI.send />Zahlungslink gesandt</span>;
  return <span className="pay-badge pending"><Icon.clock />Ausstehend</span>;
}
/* Herkunft/Quelle als prominentes, farbcodiertes Badge (Google Ads/Affiliate/Direkt …). */
const SOURCE_STYLE = {
  google_ads: { bg: "#e8f0fe", fg: "#1a73e8", bd: "#bcd3fb" },
  ms_ads:     { bg: "#e9f3ff", fg: "#0067b8", bd: "#c4e0ff" },
  meta_ads:   { bg: "#eceefb", fg: "#4456c7", bd: "#d3d9f7" },
  affiliate:  { bg: "var(--orange-50)", fg: "var(--primary)", bd: "#ffd6ab" },
  organic:    { bg: "#e9f9ef", fg: "#15803d", bd: "#bce7cb" },
  referral:   { bg: "#f3effc", fg: "#7c3aed", bd: "#e0d4fb" },
  utm:        { bg: "#fff6e6", fg: "#b45309", bd: "#fbe0b0" },
  direct:     { bg: "var(--neutral-50)", fg: "var(--fg-2)", bd: "var(--hairline)" },
};
function SourceBadge({ source, big }) {
  if (!source) return null;
  const s = SOURCE_STYLE[source.kind] || SOURCE_STYLE.direct;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.fg, border: "1px solid " + s.bd, borderRadius: 999, padding: big ? "5px 13px" : "3px 10px", fontSize: big ? 13 : 11.5, fontWeight: 700, lineHeight: 1.15, whiteSpace: "nowrap" }}>
      <Icon.external size={big ? 15 : 12} /> Quelle:&nbsp;<b style={{ fontWeight: 800 }}>{source.label}</b>
    </span>
  );
}
function initials(name) { return name.split(" ").filter(Boolean).slice(-2).map((s) => s[0]).join("").toUpperCase(); }
/* Stabile Avatar-Farbe aus dem Namen (mobile Bestell-/Kundenkarten). */
const avaColor = (s) => { let h = 0; for (let i = 0; i < (s || "").length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return `hsl(${Math.abs(h) % 360} 58% 52%)`; };
/* Lokaler Nutzungs-Zähler für Vorlagen → speist „Am häufigsten verwendet". */
const TPL_USAGE_KEY = "rr_tpl_usage";
function readTplUsage() { try { return JSON.parse(localStorage.getItem(TPL_USAGE_KEY) || "{}") || {}; } catch (e) { return {}; } }
function bumpTplUsage(key) { try { const u = readTplUsage(); u[key] = (u[key] || 0) + 1; localStorage.setItem(TPL_USAGE_KEY, JSON.stringify(u)); } catch (e) {} }
/* Mobile-Erkennung (matchMedia) für die Design-Layouts (Liste/Detail). */
function useIsMobile(bp = 760) {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width:" + bp + "px)");
    const on = () => setM(mq.matches); on();
    if (mq.addEventListener) mq.addEventListener("change", on); else mq.addListener(on);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", on); else mq.removeListener(on); };
  }, [bp]);
  return m;
}
/* Bestell-Karte für die mobile Liste (Design „mobil-bestellungen"). */
/* ---- Live-Laufzeit einer Bestellung (seit Bestelleingang) ----
   Läuft sichtbar mit, damit das Team Bearbeitungs-Zeitfenster besser einhalten kann.
   Nur für AKTIVE Bestellungen — abgeschlossene/stornierte zeigen keinen laufenden Timer
   (es gibt keinen Abschluss-Zeitstempel, sonst liefe die Uhr endlos weiter).
   Farbschwellen: ab 24 h dezent gelb, ab 48 h rot (bei Bedarf hier anpassbar). */
function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
const TIMER_DONE = ["done", "storniert"];
function ageParts(fromIso, now) {
  const start = fromIso ? new Date(fromIso).getTime() : NaN;
  if (isNaN(start)) return null;
  let s = Math.max(0, Math.floor((now - start) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return { d, h, m, s, totalH: (now - start) / 3600000 };
}
function OrderTimer({ since, status, now, seconds = false }) {
  if (TIMER_DONE.includes(status)) return null; // abgeschlossen/storniert → kein laufender Timer
  const p = ageParts(since, now);
  if (!p) return null;
  const txt = seconds
    ? (p.d ? p.d + (p.d === 1 ? " Tag · " : " Tage · ") : "") + [p.h, p.m, p.s].map((n) => String(n).padStart(2, "0")).join(":")
    : (p.d ? p.d + " T " + p.h + " Std" : p.h ? p.h + " Std " + p.m + " Min" : p.m + " Min");
  const lvl = p.totalH >= 48 ? " late" : p.totalH >= 24 ? " warn" : "";
  return (
    <span className={"otimer" + lvl + (seconds ? " lg" : "")} title="Laufzeit seit Bestelleingang">
      <Icon.clock /> {txt}
    </span>
  );
}
function OrderRow({ o, onClick, now }) {
  return (
    <div className="m-row" onClick={onClick}>
      <div className="m-ava" style={{ background: avaColor(o.name), color: "#fff" }}>{initials(o.name)}</div>
      <div className="m-main">
        <div className="nm">{o.name}</div>
        <div className="meta">{SERVICES[o.service].name} · {o.id}</div>
        {o.affiliate ? <div className="aff-chip">via {o.affiliate}</div> : null}
      </div>
      <div className="right">
        {o.assignee ? <AssigneeAvatar who={o.assignee} size={24} /> : null}
        <span className="amt">{o.amount ? money(o.amount, o.country) : "—"}</span>
        <StatusBadge status={o.status} />
        <OrderTimer since={o.createdAt} status={o.status} now={now} />
      </div>
    </div>
  );
}
/* Profilname im Detail anklickbar → Google Maps bzw. Google-Suche (Name + Ort).
   Adresse/Maps-URL stammen aus der Bestellung; fehlen sie (Altbestand), wird nach
   dem Namen bzw. der getippten Eingabe gesucht. */
function ProfileLinks({ o }) {
  const base = (o.profile || o.company || "").trim();
  if (!base) return "—";
  const q = o.addr ? base + " " + o.addr : (o.company && o.company !== o.profile ? o.company : base);
  // safeHttp: nur http(s) zulassen – blockt javascript:/data: aus Alt-Bestellungen (XSS-Schutz).
  const mapsHref = safeHttp(o.mapsUri) || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q));
  const searchHref = "https://www.google.com/search?q=" + encodeURIComponent(q);
  return (
    <span className="prof-links">
      <span className="pn">{base}</span>
      <a href={mapsHref} target="_blank" rel="noopener noreferrer" title="In Google Maps öffnen"><Icon.mapPin size={13} /> Maps</a>
      <a href={searchHref} target="_blank" rel="noopener noreferrer" title="In Google-Suche öffnen"><Icon.search size={13} /> Google</a>
    </span>
  );
}
/* Profil-Nachweis: Stand des Unternehmensprofils zum Zeitpunkt der Beauftragung.
   Die eindeutige Google Place-ID belegt das exakte Profil (ein neues Profil mit
   gleichem Namen/Adresse hat eine andere ID). */
const BIZ_STATUS = { OPERATIONAL: "Aktiv (gelistet)", CLOSED_TEMPORARILY: "Vorübergehend geschlossen", CLOSED_PERMANENTLY: "Dauerhaft geschlossen" };
const bizStatus = (s) => BIZ_STATUS[s] || s || "—";
function ProfilNachweis({ o }) {
  const mapsHref = safeHttp(o.mapsUri); // nur http(s) → XSS-Schutz gegen javascript:/data:
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 8px" }}>Stand der Beauftragung · {o.created}</div>
      <div className="drow"><span className="dl">Profilname</span><span className="dv">{o.profile || "—"}</span></div>
      <div className="drow"><span className="dl">Adresse</span><span className="dv">{o.addr || "—"}</span></div>
      <div className="drow"><span className="dl">Bewertung</span><span className="dv">{o.rating}★ · {o.reviews}</span></div>
      {o.businessStatus ? <div className="drow"><span className="dl">Status</span><span className="dv">{bizStatus(o.businessStatus)}</span></div> : null}
      <div className="drow"><span className="dl">Google Place-ID</span><span className="dv" style={{ fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", textAlign: "right" }}>{o.placeId || "—"}</span></div>
      {mapsHref ? <a className="btn btn-sec btn-sm" href={mapsHref} target="_blank" rel="noopener noreferrer" style={{ marginTop: 12, width: "100%" }}><Icon.mapPin /> Profil auf Google Maps öffnen</a> : null}
    </div>
  );
}
/* Presse-/Suchergebnis-Auslistung („deindex"): ganz andere Detailansicht.
   Kein Google-Profil, keine Maps/Bewertungen/Place-ID — sondern die zu prüfenden
   Artikel-Links (anklickbar), die Beschreibung und ob Verdrängung gewünscht ist.
   Die Daten stecken im frei-Text-Feld o.note (vom Wizard erzeugt) und werden hier
   robust herausgelesen, damit auch bereits eingegangene Anfragen sauber erscheinen. */
function parsePress(note) {
  const text = String(note || "");
  const links = text.match(/https?:\/\/\S+/g) || [];
  let desc = "", orm = "";
  const dm = text.match(/Beschreibung:\s*(.+)/);
  if (dm && dm[1].trim() !== "—") desc = dm[1].trim();
  const om = text.match(/gew(?:ü|ue)nscht:\s*(ja|nein|yes|no)/i);
  if (om) orm = /^(ja|yes)$/i.test(om[1]) ? "ja" : "nein";
  return { links, desc, orm };
}
function PressInfo({ o, rc = "drow" }) {
  const { links, desc, orm } = parsePress(o.note);
  return (
    <React.Fragment>
      <div className={rc}><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
      <div className={rc} style={{ alignItems: "flex-start" }}><span className="dl">Auszulistende Links</span>
        <span className="dv">{links.length ? (
          <span className="press-arts">
            {links.map((u, i) => {
              let host = u; try { host = new URL(u).hostname.replace(/^www\./, ""); } catch (e) {}
              return <a key={i} className="press-art" href={u} target="_blank" rel="noopener noreferrer" title={u}><Icon.external size={13} /> {host}</a>;
            })}
          </span>
        ) : "—"}</span>
      </div>
      {desc ? <div className={rc} style={{ alignItems: "flex-start" }}><span className="dl">Beschreibung</span><span className="dv" style={{ maxWidth: 320, fontWeight: 600, color: "var(--fg-2)" }}>{desc}</span></div> : null}
      <div className={rc}><span className="dl">Verdrängung gewünscht</span><span className="dv">{orm === "ja" ? "Ja" : orm === "nein" ? "Nein" : "—"}</span></div>
      <div className={rc}><span className="dl">E-Mail</span><span className="dv">{o.email}</span></div>
    </React.Fragment>
  );
}
function fillVars(text, o) {
  const inv = "RE-" + o.id.replace("RR-", "");
  return text
    .replace(/\{\{name\}\}/g, o.name).replace(/\{\{order_id\}\}/g, o.id)
    .replace(/\{\{service\}\}/g, SERVICES[o.service].name).replace(/\{\{profile\}\}/g, o.profile)
    .replace(/\{\{amount\}\}/g, money(o.amount, o.country)).replace(/\{\{invoice_id\}\}/g, inv);
}

/* Sendet dem Kunden mit EINEM Klick genau den Zahlungslink, der zu seiner
   Bestellung passt (Betrag/Leistung/Schutz) — ohne Auswahl-Liste. */
async function sendOrderedPayLink(o, toast, onStatus, onFail) {
  try {
    const tot = o.amount + (o.protection && o.protAmount ? o.protAmount : 0);
    const protectionLabel = o.protection
      ? ((o.protection === "lifetime" ? "Lebenslanger Schutz" : o.protection === "monitor" ? "Schutz + Tägliche Überwachung" : "Monatlicher Schutz") + (o.protAmount ? " – " + money(o.protAmount, o.country) + (o.protection !== "lifetime" ? "/Mon." : "") : ""))
      : "";
    const expressLabel = o.express
      ? ("Express-Bearbeitung (≤6 h)" + (o.expressAmount ? " · +" + money(o.expressAmount, o.country) : ""))
      : undefined;
    await sendPayLink({
      to: o.email, name: o.name, orderId: o.id, currency: o.country === "US" ? "usd" : "eur",
      service: o.service, protection: o.protection || "none", serviceAmount: o.amount || 0,
      protAmount: (o.protection && o.protAmount) ? o.protAmount : 0, protType: o.protection || "",
      total: tot, protectionLabel, express: !!o.express, expressLabel, lang: o.lang || "de", celebrate: true,
    });
    toast("Zahlungslink an " + o.name + " gesendet ✓");
    // Kunde hat den Zahlungslink erhalten → Profil gilt als gelöscht (Zahlung bleibt offen).
    // „Profil gelöscht" nur EINMAL protokollieren – ist der Auftrag schon „done", wird
    // nur der Zahlungsstatus aktualisiert (kein erneuter Status-Eintrag pro Sendung).
    if (onStatus) onStatus(o, "done", true, true, { pay: "sent", noEvent: o.status === "done" });
  } catch (e) {
    // Kein automatisch passender Link → Auswahl-Dialog öffnen, statt still zu scheitern.
    toast("Kein automatisch passender Link — bitte Link auswählen.");
    if (onFail) onFail(o);
  }
}

/* ---------- Sidebar ---------- */
function Sidebar({ view, setView, counts, open, live }) {
  const items = [
    ["dashboard", AI.grid, "Übersicht"],
    ["orders", AI.inbox, "Bestellungen", counts.new],
    ["checks", Icon.search, "Geprüfte Profile"],
    ["subs", AI.euro, "Abos & Umsatz"],
    ["liga", AI.trophy, "Löschungs-Liga"],
    ["templates", Icon.mail, "E-Mail-Vorlagen"],
    ["customers", AI.users, "Kunden"],
    ["redirects", AI.external, "Weiterleitungen"],
  ];
  return (
    <aside className={"side" + (open ? " open" : "")}>
      <div className="side-logo">
        <img src={asset("/assets/rapidremove-logo-white.png")} alt="RapidRemove" />
        <span className="env">{live ? "Live" : "Demo"}</span>
      </div>
      <div className="side-sec">Betrieb</div>
      {items.map(([id, I, label, badge]) => (
        <button key={id} className={"side-link" + (view === id ? " on" : "")} onClick={() => setView(id)}>
          <I /> {label} {badge ? <span className="badge">{badge}</span> : null}
        </button>
      ))}
      <div className="side-foot">
        <div className="ava">RR</div>
        <div>
          <div className="nm">RapidRemove</div>
          <div className="rl">Admin</div>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
// VAPID-Public-Key (base64url) → Uint8Array für pushManager.subscribe.
function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/* Glocke = Web-Push-Schalter: aktiviert Benachrichtigungen für die installierte App. */
function PushBell({ toast }) {
  const [state, setState] = React.useState("idle"); // idle | on | busy | unsupported | blocked
  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setState("unsupported"); return; }
    if (Notification.permission === "denied") { setState("blocked"); return; }
    navigator.serviceWorker.getRegistration()
      .then((reg) => (reg ? reg.pushManager.getSubscription() : null))
      .then((sub) => { if (sub) setState("on"); })
      .catch(() => {});
  }, []);

  const enable = async () => {
    if (state === "on") { toast("Benachrichtigungen sind bereits aktiv ✓"); return; }
    if (state === "unsupported") { toast("Push wird hier nicht unterstützt – die App vom Home-Bildschirm öffnen."); return; }
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.register(asset("/sw.js"));
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState(perm === "denied" ? "blocked" : "idle"); toast("Benachrichtigungen nicht erlaubt."); return; }
      const key = await fetchVapidKey();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(key) });
      await savePushSub(sub.toJSON ? sub.toJSON() : sub);
      setState("on");
      toast("Push-Benachrichtigungen aktiviert ✓");
    } catch (e) {
      setState("idle");
      toast("Push fehlgeschlagen: " + (e.message || e));
    }
  };

  const label = state === "on" ? "Benachrichtigungen aktiv" : state === "blocked" ? "Benachrichtigungen blockiert – im Gerät/Browser erlauben" : state === "unsupported" ? "Push hier nicht verfügbar – App vom Home-Bildschirm öffnen" : "Benachrichtigungen aktivieren";
  return (
    <button className="icon-btn" onClick={enable} disabled={state === "busy"} title={label} aria-label={label}>
      <AI.bell />
      <span className="dot" style={{ background: state === "on" ? "var(--success)" : state === "blocked" ? "var(--danger)" : undefined }}></span>
    </button>
  );
}

function Topbar({ title, onBurger, query, setQuery, toast, onRefresh, refreshing }) {
  return (
    <div className="topbar">
      <button className="icon-btn burger" onClick={onBurger}><Icon.menu /></button>
      <h1>{title}</h1>
      <div className="search">
        <Icon.search />
        <input placeholder="Bestellung, Kunde oder E-Mail suchen…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="tb-right">
        <button className={"icon-btn tb-refresh" + (refreshing ? " busy" : "")} onClick={onRefresh} disabled={refreshing} title="Daten aktualisieren" aria-label="Aktualisieren"><Icon.refresh /></button>
        <PushBell toast={toast} />
        <button className="btn btn-pri"><AI.plus /> Neue Bestellung</button>
      </div>
    </div>
  );
}

/* ---------- Mobile bottom tab bar (Design „Admin Dashboard Mobile") ---------- */
function MobileTabBar({ view, setView, counts }) {
  const tabs = [
    ["dashboard", AI.grid, "Übersicht"],
    ["orders", AI.inbox, "Bestellungen", counts.new],
    ["checks", Icon.search, "Profile"],
    ["subs", AI.euro, "Umsatz"],
    ["liga", AI.trophy, "Liga"],
    ["templates", Icon.mail, "Vorlagen"],
    ["customers", AI.users, "Kunden"],
  ];
  return (
    <nav className="m-tabbar">
      {tabs.map(([id, I, label, badge]) => (
        <button key={id} className={"m-tab" + (view === id ? " on" : "")} onClick={() => setView(id)}>
          <I />
          {badge ? <span className="tbadge">{badge}</span> : null}
          <span className="lbl">{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* Wiederholungs-Prüfungen desselben Kunden zu EINEM Eintrag zusammenfassen: gleiches
   Google-Profil ODER gleiche E-Mail (transitiv per Union-Find). So verwässern Mehrfach-
   Prüfungen (1 Kunde prüft 5×, beauftragt 1×) nicht mehr Zähler & Quote — der Eintrag zählt
   als 1 Prüfung und gilt als konvertiert, sobald IRGENDEINE davon beauftragt wurde.
   `dupes` = Anzahl zusammengefasster Prüfungen (fürs „N× geprüft"-Label). */
function dedupeChecks(list) {
  const arr = list || [];
  if (arr.length < 2) return arr.map((c) => ({ ...c, dupes: 1 }));
  const norm = (s) => (s || "").trim().toLowerCase();
  const parent = arr.map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
  const byP = new Map(), byE = new Map();
  arr.forEach((c, i) => {
    const p = norm(c.profile), e = norm(c.email);
    if (p) { if (byP.has(p)) union(i, byP.get(p)); else byP.set(p, i); }
    if (e) { if (byE.has(e)) union(i, byE.get(e)); else byE.set(e, i); }
  });
  const groups = new Map();
  arr.forEach((c, i) => { const r = find(i); const g = groups.get(r); if (g) g.push(c); else groups.set(r, [c]); });
  const byNewest = (a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  const out = [];
  for (const g of groups.values()) {
    if (g.length === 1) { out.push({ ...g[0], dupes: 1 }); continue; }
    const base = [...g].sort(byNewest)[0];                              // jüngste Prüfung = Repräsentant
    const conv = g.find((c) => c.status === "konvertiert");
    const maxStep = Math.max(0, ...g.map((c) => Number(c.step) || 0));  // tiefste je erreichte Funnel-Stufe
    out.push({
      ...base,
      status: conv ? "konvertiert" : base.status,
      orderId: conv ? conv.orderId : base.orderId,
      step: maxStep > 0 ? maxStep : (base.step != null ? base.step : null),
      source: g.map((c) => c.source).find(Boolean) || base.source || null,
      // Herkunfts-Zusatz aus der ganzen Gruppe: der Motivschlüssel steckt oft nur
      // an einer der zusammengefassten Prüfungen.
      sourceFirst: g.map((c) => c.sourceFirst).find(Boolean) || base.sourceFirst || null,
      utmContent: g.map((c) => c.utmContent).find(Boolean) || base.utmContent || "",
      utmCampaign: g.map((c) => c.utmCampaign).find(Boolean) || base.utmCampaign || "",
      refHost: g.map((c) => c.refHost).find(Boolean) || base.refHost || "",
      amount: conv ? conv.amount : base.amount,
      // Kontakt-/Profil-Bezug aus der ganzen Gruppe zusammenführen (jüngster Eintrag
      // hat z. B. bei manueller Eingabe keine Place-ID, ein älterer aber schon).
      email: base.email || g.map((c) => c.email).find(Boolean) || "",
      placeId: base.placeId || g.map((c) => c.placeId).find(Boolean) || "",
      mapsUri: base.mapsUri || g.map((c) => c.mapsUri).find(Boolean) || "",
      addr: base.addr || g.map((c) => c.addr).find(Boolean) || "",
      // Rückgewinnung gilt für die ganze Gruppe als gesendet (frühester Versand-Zeitpunkt).
      rueckgewinnungAt: g.map((c) => c.rueckgewinnungAt).filter(Boolean).sort()[0] || null,
      dupes: g.length,
    });
  }
  return out.sort(byNewest);
}

/* ---------- Dashboard ---------- */
function Dashboard({ orders, checks: rawChecks, openOrder, openCheck, onOpenChecks }) {
  const isMobile = useIsMobile();
  const [funnelOpen, setFunnelOpen] = React.useState(null); // angeklickte Trichter-Stufe (1–4 | "conv") → Abbrecher-Liste
  // Mehrfach-Prüfungen desselben Kunden zusammenfassen → ehrliche Zähler & Konversionsquote.
  const checks = dedupeChecks(rawChecks);
  const newCount = orders.filter((o) => o.status === "new").length;
  const progressCount = orders.filter((o) => o.status === "progress").length;
  const revenue = orders.filter((o) => o.pay === "paid").reduce((s, o) => s + o.amount, 0);
  const newChecks = checks.filter((c) => c.status === "neu").length;
  // Erfolgsquote: Erfolg = Zahlungslink gesendet (Status „gelöscht"); kein Erfolg = storniert.
  const doneCount = orders.filter((o) => o.status === "done").length;
  const stornoCount = orders.filter((o) => o.status === "storniert").length;
  const successRate = (doneCount + stornoCount) ? Math.round((doneCount / (doneCount + stornoCount)) * 100) : null;
  const kpis = [
    { ic: Icon.checkCircle, label: "Erfolgsquote", val: successRate !== null ? successRate + " %" : "—", d: doneCount + " gelöscht · " + stornoCount + " storniert", up: true },
    { ic: AI.inbox, label: "Neue Bestellungen", val: newCount, d: "+3 heute", up: true },
    { ic: Icon.search, label: "Profile geprüft", val: checks.length, d: newChecks + " neu, unbearbeitet", up: true },
    { ic: Icon.clock, label: "In Bearbeitung", val: progressCount, d: "Ø 19 h Laufzeit", up: true },
    { ic: AI.euro, label: "Umsatz (bezahlt)", val: money(revenue, "DE"), d: "+12,4 % ggü. Vorwoche", up: true },
    { ic: AI.trendUp, label: "Prüfung → Auftrag", val: (checks.length ? Math.round(checks.filter((c) => c.status === "konvertiert").length / checks.length * 100) : 0) + " %", d: "Konversionsrate", up: true },
  ];
  // ── Prüfungs-Trichter & Insights ──
  // Erreichte Stufe je Prüfung (konvertierte zählen als Stufe 4, auch ohne Alt-Tracking).
  const stepOf = (c) => Math.max(Number(c.step) || 1, c.status === "konvertiert" ? 4 : 1);
  const FUNNEL = [{ key: 1, label: "Profil geprüft" }, { key: 2, label: "Preis/Leistung gesehen" }, { key: 3, label: "Checkout erreicht" }, { key: 4, label: "Zahlung gestartet" }];
  // Trichter NUR über Prüfungen MIT Funnel-Daten (Alt-Prüfungen ohne Tracking würden Stufe 1 verzerren).
  const tracked = checks.filter((c) => c.step != null || c.status === "konvertiert");
  const funnelTotal = tracked.length;
  const funnelCounts = FUNNEL.map((f) => ({ ...f, n: tracked.filter((c) => stepOf(c) >= f.key).length }));
  const convCount = tracked.filter((c) => c.status === "konvertiert").length;
  const pctOf = (n) => (funnelTotal ? Math.round((n / funnelTotal) * 100) : 0);
  // Genau bei dieser Stufe abgesprungen: hat sie erreicht, ging aber nicht weiter und wurde kein Auftrag.
  const dropAt = (key) => tracked.filter((c) => c.status !== "konvertiert" && stepOf(c) === key);
  const convChecks = tracked.filter((c) => c.status === "konvertiert");
  const selCohort = funnelOpen == null ? [] : funnelOpen === "conv" ? convChecks : dropAt(funnelOpen);
  const selLabel = funnelOpen === "conv" ? "Auftrag abgeschlossen" : funnelOpen != null ? (FUNNEL[funnelOpen - 1] || {}).label : "";
  // SRC_LABEL liegt jetzt auf Modulebene (auch von „Geprüfte Profile" genutzt).
  const bySource = {};
  for (const c of checks) { if (!c.source) continue; bySource[c.source] = bySource[c.source] || { n: 0, conv: 0 }; bySource[c.source].n++; if (c.status === "konvertiert") bySource[c.source].conv++; }
  const sourceRows = Object.entries(bySource).map(([k, v]) => ({ k, label: SRC_LABEL[k] || k, ...v })).sort((a, b) => b.n - a.n);
  const convRate = (arr) => (arr.length ? Math.round((arr.filter((c) => c.status === "konvertiert").length / arr.length) * 100) : 0);
  const withReviews = checks.filter((c) => (Number(c.reviews) || 0) > 0);
  const noReviews = checks.filter((c) => (Number(c.reviews) || 0) === 0);
  // Abbruchstelle je Prüfung (erreichte Stufe). Tiefer = „heißer" Lead (fast bezahlt).
  const DROP = {
    1: { t: "Profil-Auswahl", bg: "var(--neutral-100)", fg: "var(--fg-2)" },
    2: { t: "Preis/Leistung", bg: "#fff7e6", fg: "#b45309" },
    3: { t: "Checkout", bg: "#ffe9d6", fg: "#c2410c" },
    4: { t: "Zahlung", bg: "#fdecec", fg: "#b42318" },
  };
  if (isMobile) {
    const mobileKpis = kpis.filter((k) => k.label !== "Umsatz (bezahlt)" && k.label !== "Prüfung → Auftrag");
    return (
      <div className="content">
        <div className="m-kpi span" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div className="kl" style={{ marginTop: 0, fontSize: 12.5 }}>Umsatz (bezahlt)</div>
            <div className="kv" style={{ fontSize: 34, marginTop: 6, color: "var(--primary)" }}>{money(revenue, "DE")}</div>
            <div className="kd up" style={{ marginTop: 8 }}><AI.trendUp /> bezahlte Aufträge</div>
          </div>
          <div className="ic" style={{ marginLeft: "auto", marginBottom: 0, width: 44, height: 44 }}><AI.euro style={{ width: 22, height: 22 }} /></div>
        </div>
        <div className="m-kpis" style={{ marginTop: 11 }}>
          {mobileKpis.map((k, i) => (
            <div className="m-kpi" key={i}>
              <div className="ic"><k.ic /></div>
              <div className="kv">{k.val}</div>
              <div className="kl">{k.label}</div>
              <div className={"kd " + (k.up ? "up" : "down")}>{k.up ? <AI.trendUp /> : <AI.trendDown />}{k.d}</div>
            </div>
          ))}
        </div>
        <div className="m-sec-head"><h2>Pipeline heute</h2></div>
        <div className="m-card m-card-pad">
          <div className="m-pipe">
            {STATUS_FLOW.map((s) => {
              const n = orders.filter((o) => o.status === s.id).length;
              const pct = orders.length ? Math.round((n / orders.length) * 100) : 0;
              const col = s.id === "done" ? "var(--success)" : s.id === "progress" ? "var(--warning)" : "var(--primary)";
              return (
                <div className="m-pipe-row" key={s.id}>
                  <div className="t"><span>{s.label}</span><span className="n">{n}</span></div>
                  <div className="m-pipe-bar"><i style={{ width: pct + "%", background: col }}></i></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="m-sec-head"><h2>Neueste Bestellungen</h2></div>
        <div className="m-list">
          {orders.slice(0, 5).map((o) => <OrderRow key={o.id} o={o} onClick={() => openOrder(o)} />)}
        </div>
        <div className="m-trust"><Icon.shieldCheck /> DSGVO-konform · Server in Deutschland</div>
      </div>
    );
  }
  return (
    <div className="content">
      <div className="kpis">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="kt"><span className="ic"><k.ic /></span>{k.label}</div>
            <div className="kv">{k.val}</div>
            <div className={"kd " + (k.up ? "up" : "down")}>{k.up ? <AI.trendUp /> : <AI.trendDown />}{k.d}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h2>Alle Bestellungen</h2>
            <div className="ph-right"><span className="muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{orders.length} gesamt</span></div>
          </div>
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Auftrag</th><th>Kunde</th><th>Leistung</th><th>Status</th><th>Betrag</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} onClick={() => openOrder(o)}>
                    <td><span className="oid">{o.id}</span><div className="muted">{o.created.split("·")[1]}</div></td>
                    <td><div className="cust" style={{ display: "flex", alignItems: "center", gap: 9 }}>{o.assignee ? <AssigneeAvatar who={o.assignee} size={26} /> : null}<div>{o.name}<div className="sub">{o.company}</div></div></div></td>
                    <td>{SERVICES[o.service].name}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><span className="amt">{o.amount ? money(o.amount, o.country) : "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Pipeline heute</h2></div>
          <div style={{ padding: "20px 22px" }}>
            {STATUS_FLOW.map((s) => {
              const n = orders.filter((o) => o.status === s.id).length;
              const pct = Math.round((n / orders.length) * 100);
              return (
                <div key={s.id} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 13.5, fontWeight: 700 }}>
                    <span>{s.label}</span><span style={{ fontFamily: "var(--font-display)" }}>{n}</span>
                  </div>
                  <div style={{ height: 8, background: "var(--neutral-100)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: s.id === "done" ? "var(--success)" : s.id === "progress" ? "var(--warning)" : "var(--primary)", borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
            <div className="stripe-box" style={{ marginTop: 22 }}>
              <span className="sb-logo">stripe</span>
              <div style={{ fontSize: 12.5, color: "var(--fg-2)", fontWeight: 700 }}>Live verbunden</div>
              <span className="sb-status"><span className="badge-st st-done"><span className="d"></span>Aktiv</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Prüfungs-Trichter & Insights (woran scheitern Abschlüsse?) */}
      <div className="panel" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <h2><AI.trendUp style={{ width: 17, height: 17, verticalAlign: "-3px", marginRight: 7, color: "var(--primary)" }} />Prüfungs-Trichter</h2>
          <div className="ph-right"><span className="muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{funnelTotal} mit Funnel-Daten → {convCount} Aufträge ({pctOf(convCount)} %)</span></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 28, padding: "20px 22px" }}>
          <div>
            {funnelCounts.map((f, i) => {
              const dropHere = dropAt(f.key).length;       // genau hier abgesprungen (nicht konvertiert)
              const sel = funnelOpen === f.key;
              const clickable = funnelTotal > 0;           // bei vorhandenen Funnel-Daten ist jede Stufe anklickbar
              return (
                <div key={f.key}
                  onClick={clickable ? () => setFunnelOpen(sel ? null : f.key) : undefined}
                  title={clickable ? "Abgesprungene Kunden bei dieser Stufe anzeigen" : undefined}
                  className={clickable ? "funnel-step" : undefined}
                  style={{ cursor: clickable ? "pointer" : "default", borderRadius: 8, padding: "6px 8px", margin: "0 -8px 9px", background: sel ? "var(--neutral-100)" : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>
                    <span>{f.key}. {f.label}
                      {dropHere > 0 ? <span style={{ color: "var(--danger)", fontWeight: 700, marginLeft: 8 }}>−{dropHere} abgesprungen</span> : null}
                      {clickable ? <span style={{ color: "var(--fg-muted)", fontWeight: 700, marginLeft: 6 }}>{sel ? "▾" : "›"}</span> : null}
                    </span>
                    <span style={{ fontFamily: "var(--font-display)" }}>{f.n} · {pctOf(f.n)} %</span>
                  </div>
                  <div style={{ height: 10, background: "var(--neutral-100)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: pctOf(f.n) + "%", height: "100%", background: sel ? "var(--danger)" : "var(--primary)", borderRadius: 5 }}></div>
                  </div>
                </div>
              );
            })}
            <div
              onClick={funnelTotal > 0 ? () => setFunnelOpen(funnelOpen === "conv" ? null : "conv") : undefined}
              title={funnelTotal > 0 ? "Abgeschlossene Aufträge anzeigen" : undefined}
              className={funnelTotal > 0 ? "funnel-step" : undefined}
              style={{ cursor: funnelTotal > 0 ? "pointer" : "default", borderRadius: 8, padding: "6px 8px", margin: "4px -8px 0", background: funnelOpen === "conv" ? "var(--neutral-100)" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 800, marginBottom: 6, color: "var(--success)" }}>
                <span>✓ Auftrag abgeschlossen{funnelTotal > 0 ? <span style={{ fontWeight: 700, marginLeft: 8, color: "var(--fg-muted)" }}>{funnelOpen === "conv" ? "▾" : "›"}</span> : null}</span><span style={{ fontFamily: "var(--font-display)" }}>{convCount} · {pctOf(convCount)} %</span>
              </div>
              <div style={{ height: 10, background: "var(--neutral-100)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: pctOf(convCount) + "%", height: "100%", background: "var(--success)", borderRadius: 5 }}></div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--fg-muted)", fontWeight: 600 }}>
              Tipp: Auf eine Stufe klicken, um die abgesprungenen Kunden zu sehen.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--fg-muted)", marginBottom: 8 }}>Quelle · Prüfungen → Aufträge</div>
            {sourceRows.length ? sourceRows.map((s) => (
              <div key={s.k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, padding: "5px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span>{s.label}</span><span style={{ fontWeight: 800 }}>{s.n} → {s.conv} <span style={{ color: "var(--fg-muted)", fontWeight: 700 }}>({s.n ? Math.round((s.conv / s.n) * 100) : 0} %)</span></span>
              </div>
            )) : <div style={{ color: "var(--fg-muted)", fontSize: 13 }}>Noch keine Quellen-Daten.</div>}
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--fg-muted)", margin: "16px 0 8px" }}>Profil-Qualität · Abschlussquote</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, padding: "5px 0", borderBottom: "1px solid var(--hairline)" }}>
              <span>Mit Bewertungen</span><span style={{ fontWeight: 800 }}>{withReviews.length} <span style={{ color: "var(--fg-muted)", fontWeight: 700 }}>({convRate(withReviews)} %)</span></span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, padding: "5px 0" }}>
              <span>Ohne Bewertungen (0)</span><span style={{ fontWeight: 800 }}>{noReviews.length} <span style={{ color: "var(--fg-muted)", fontWeight: 700 }}>({convRate(noReviews)} %)</span></span>
            </div>
          </div>
        </div>
        {funnelOpen != null ? (
          <div style={{ borderTop: "1px solid var(--hairline)", padding: "16px 22px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>
                {funnelOpen === "conv"
                  ? <>✓ Abgeschlossene Aufträge</>
                  : <>Abgesprungen bei „{selLabel}"</>}
                <span style={{ color: "var(--fg-muted)", fontWeight: 700 }}> · {selCohort.length} {selCohort.length === 1 ? "Kunde" : "Kunden"}</span>
              </div>
              <button onClick={() => setFunnelOpen(null)}
                style={{ border: "1px solid var(--hairline)", background: "transparent", borderRadius: 8, padding: "5px 11px", fontSize: 12.5, fontWeight: 700, color: "var(--fg-2)", cursor: "pointer" }}>
                Schließen ✕
              </button>
            </div>
            {selCohort.length === 0 ? (
              <div style={{ color: "var(--fg-muted)", fontSize: 13.5, padding: "6px 0" }}>{funnelOpen === "conv" ? "Noch keine abgeschlossenen Aufträge." : "Niemand ist bei dieser Stufe abgesprungen. 🎉"}</div>
            ) : (
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead><tr><th>Prüfung</th><th>Google-Profil</th><th>Kontakt</th><th>Preis gesehen</th><th>Quelle</th></tr></thead>
                  <tbody>
                    {selCohort.map((c) => {
                      const linked = c.orderId ? orders.find((o) => o.id === c.orderId) : null;
                      return (
                        <tr key={c.id} onClick={() => linked ? openCheck(linked) : null} style={{ cursor: linked ? "pointer" : "default" }}>
                          <td><span className="oid">{c.id}</span><div className="muted">{c.created}</div></td>
                          <td><div className="cust">{c.profile || "—"}<div className="sub">{c.name && c.name !== "—" ? c.name : (c.email || "—")}</div></div></td>
                          <td>{c.email
                            ? <a href={"mailto:" + c.email} onClick={(e) => e.stopPropagation()} style={{ color: "var(--primary)", fontWeight: 700 }}>{c.email}</a>
                            : <span className="muted">kein Kontakt</span>}</td>
                          <td><span className="amt">{c.amount ? money(c.amount, "DE") : "—"}</span></td>
                          {/* Quelle = Last-Touch. Darunter das Anzeigenmotiv (utm_content)
                              und – nur wenn abweichend – der First-Touch als Zusatz. */}
                          <td>
                            {SRC_LABEL[c.source] || c.source || <span className="muted">—</span>}
                            {c.utmContent ? <div className="sub" style={{ fontWeight: 700 }}>{c.utmContent}</div> : null}
                            {c.utmCampaign && !c.utmContent ? <div className="sub">{c.utmCampaign}</div> : null}
                            {c.sourceFirst && c.sourceFirst !== c.source
                              ? <div className="sub muted">zuerst: {SRC_LABEL[c.sourceFirst] || c.sourceFirst}</div>
                              : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Geprüfte Profile leben jetzt im eigenen Bereich (Sidebar) – hier nur der Absprung. */}
      <div className="panel" style={{ marginTop: 22 }}>
        <div className="panel-head">
          <h2><Icon.search style={{ width: 17, height: 17, verticalAlign: "-3px", marginRight: 7, color: "var(--primary)" }} />Geprüfte Profile</h2>
          <div className="ph-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{checks.length} Prüfungen · {checks.filter((c) => c.status !== "konvertiert").length} nicht beauftragt</span>
            {onOpenChecks ? <button className="btn btn-sec btn-sm" onClick={onOpenChecks}><Icon.search size={15} /> Alle geprüften Profile öffnen</button> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Lesbare Bezeichnung je Herkunfts-Kürzel (Last-Touch aus lib/attribution.js). */
const SRC_LABEL = { google_ads: "Google Ads", ms_ads: "Microsoft Ads", meta_ads: "Meta Ads", tiktok_ads: "TikTok Ads", affiliate: "Affiliate", organic: "Organisch", referral: "Verweis", utm: "UTM", direct: "Direkt" };
/* „Social Media" fasst die bezahlten sozialen Kanäle zusammen. Meta trennt
   Facebook und Instagram nicht — beide kommen als meta_ads an; welche Platzierung
   es war, steht nur im Ads Manager unter „Aufschlüsselung → Platzierung". */
const SOCIAL_KINDS = ["meta_ads", "tiktok_ads"];
/* Herkunft, die dem Betrachter etwas sagt: bei Verweisen den Host dazu. */
const srcLabelOf = (c) => {
  if (!c || !c.source) return "";
  if (c.source === "referral" && c.refHost) return "Verweis: " + c.refHost;
  return SRC_LABEL[c.source] || c.source;
};

/* ---------- Geprüfte Profile: eigener Bereich (Leads aus dem Prüf-Tool) ---------- */
// Abbruchstelle je Prüfung (erreichte Stufe) – identische Farblogik wie im Dashboard-Trichter.
const CHECK_DROP = {
  1: { t: "Profil-Auswahl", bg: "var(--neutral-100)", fg: "var(--fg-2)" },
  2: { t: "Preis/Leistung", bg: "#fff7e6", fg: "#b45309" },
  3: { t: "Checkout", bg: "#ffe9d6", fg: "#c2410c" },
  4: { t: "Zahlung", bg: "#fdecec", fg: "#b42318" },
};
const checkStepOf = (c) => Math.max(Number(c.step) || 1, c.status === "konvertiert" ? 4 : 1);
// Nur http(s)-Links zulassen – blockt javascript:/data: aus Alt-Daten (XSS-Schutz beim <a href>).
const safeHttp = (u) => {
  if (!u) return "";
  try { return /^https?:$/.test(new URL(u, "https://x").protocol) && /^https?:\/\//i.test(u) ? u : ""; } catch { return ""; }
};
// Klickbarer Google-Link zum geprüften Profil: gespeicherter Maps-Link > Place-ID > Namenssuche.
const checkMapsUrl = (c) =>
  safeHttp(c.mapsUri)
  || (c.placeId ? "https://www.google.com/maps/place/?q=place_id:" + encodeURIComponent(c.placeId) : "")
  || (c.profile ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.profile + (c.addr ? " " + c.addr : "")) : "");
const checkWebSearchUrl = (c) => "https://www.google.com/search?q=" + encodeURIComponent('"' + (c.profile || "") + '" ' + (c.addr || "") + " email kontakt");

function ChecksView({ checks: rawChecks, orders, openOrder, toast }) {
  const checks = dedupeChecks(rawChecks);
  const [filter, setFilter] = React.useState("open"); // open | conv | all
  const [srcFilter, setSrcFilter] = React.useState("all"); // all | social | <kind>
  const [q, setQ] = React.useState("");
  const [saved, setSaved] = React.useState({});           // checkId -> gespeicherte E-Mail (Session)
  const [drafts, setDrafts] = React.useState({});         // checkId -> Eingabefeld-Inhalt
  const [enriching, setEnriching] = React.useState(null); // checkId der laufenden Recherche
  const [cands, setCands] = React.useState({});           // checkId -> { website, emails[] } | { error }
  const [confirmSend, setConfirmSend] = React.useState(null); // { check, email }
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState({});             // checkId -> true nach Versand (Session)

  const effEmail = (c) => (saved[c.id] !== undefined ? saved[c.id] : (c.email || ""));
  const openCount = checks.filter((c) => c.status !== "konvertiert").length;
  const convCount = checks.length - openCount;

  // AUTOMATISCHE Lead-Recherche beim Öffnen der Ansicht: alle offenen Prüfungen ohne
  // E-Mail, die noch nie recherchiert wurden (enrichedAt leer), werden nacheinander
  // abgearbeitet — Website via Places (Browser-Key), E-Mail-Scan + Speichern macht das
  // ops-Backend (autosave). Auch ergebnislose Versuche werden markiert (kein Endlos-Retry).
  const [autoProg, setAutoProg] = React.useState(null); // { done, total, found } | "done"
  const autoRan = React.useRef(false);
  React.useEffect(() => {
    if (autoRan.current) return;
    const queue = checks.filter((c) => c.status !== "konvertiert" && !effEmail(c) && c.placeId && !c.enrichedAt).slice(0, 10);
    if (!queue.length) return;
    autoRan.current = true;
    let alive = true;
    (async () => {
      let found = 0;
      for (let i = 0; i < queue.length; i++) {
        const c = queue[i];
        if (!alive) return;
        setAutoProg({ done: i, total: queue.length, found });
        try {
          const prof = await fetchProfileById(c.placeId, "de");
          if (prof && prof.website) {
            const r = await enrichCheckEmails({ website: prof.website, checkId: c.id, autosave: true });
            if (r.saved) { found++; if (alive) setSaved((m) => ({ ...m, [c.id]: r.saved })); }
          } else {
            await markCheckEnriched({ checkId: c.id }); // keine Website bekannt → nicht erneut versuchen
          }
        } catch (e) { /* einzelner Fehlschlag stoppt die Reihe nicht */ }
      }
      if (!alive) return;
      setAutoProg("done");
      if (found) toast(found + " E-Mail(s) automatisch gefunden ✓");
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checks.length]);
  // Herkunfts-Filter: „Social Media" bündelt die bezahlten sozialen Kanäle,
  // sonst wird auf ein einzelnes Kürzel gefiltert. Prüfungen ohne Herkunft
  // (vor der Umstellung) laufen unter „Unbekannt".
  const matchesSrc = (c) => {
    if (srcFilter === "all") return true;
    if (srcFilter === "social") return SOCIAL_KINDS.includes(c.source);
    if (srcFilter === "none") return !c.source;
    return c.source === srcFilter;
  };
  const srcCount = (k) => checks.filter((c) => (k === "social" ? SOCIAL_KINDS.includes(c.source) : k === "none" ? !c.source : c.source === k)).length;
  // Nur Herkünfte anbieten, die tatsächlich vorkommen — sonst steht die Leiste voll leerer Filter.
  const srcChips = [["all", "Alle Quellen", checks.length]]
    .concat([["social", "Social Media"], ["google_ads", "Google Ads"], ["ms_ads", "Microsoft Ads"],
             ["affiliate", "Affiliate"], ["utm", "UTM"], ["organic", "Organisch"],
             ["referral", "Verweis"], ["direct", "Direkt"], ["none", "Unbekannt"]]
      .map(([k, lab]) => [k, lab, srcCount(k)]).filter(([, , n]) => n > 0));

  const list = checks
    .filter((c) => (filter === "all" ? true : filter === "conv" ? c.status === "konvertiert" : c.status !== "konvertiert"))
    .filter(matchesSrc)
    .filter((c) => {
      const needle = q.trim().toLowerCase();
      if (!needle) return true;
      return (c.profile + " " + c.name + " " + effEmail(c) + " " + (c.addr || "") + " " + c.id
        + " " + srcLabelOf(c) + " " + (c.utmContent || "") + " " + (c.utmCampaign || "")).toLowerCase().includes(needle);
    });

  // Automatische Lead-Recherche: Places (Browser-Key) liefert die Unternehmens-Website,
  // das ops-Backend durchsucht sie nach Kontakt-E-Mails (CORS verhindert das im Browser).
  const doEnrich = async (c) => {
    setEnriching(c.id);
    setCands((m) => ({ ...m, [c.id]: undefined }));
    try {
      if (!c.placeId) throw new Error("keine Place-ID gespeichert (ältere Prüfung) — bitte Web-Suche nutzen");
      const prof = await fetchProfileById(c.placeId, "de");
      if (!prof || !prof.website) throw new Error("Google kennt keine Website zu diesem Profil — bitte Web-Suche nutzen");
      const r = await enrichCheckEmails({ website: prof.website });
      const emails = r.emails || [];
      setCands((m) => ({ ...m, [c.id]: emails.length ? { website: r.website, emails } : { error: "keine E-Mail auf der Website gefunden — bitte Web-Suche nutzen" } }));
    } catch (e) {
      setCands((m) => ({ ...m, [c.id]: { error: e.message } }));
    }
    setEnriching(null);
  };
  const doSaveEmail = async (c, email) => {
    const v = (email || "").trim();
    try {
      await saveCheckEmail({ checkId: c.id, email: v });
      setSaved((m) => ({ ...m, [c.id]: v }));
      setCands((m) => ({ ...m, [c.id]: undefined }));
      setDrafts((m) => ({ ...m, [c.id]: "" }));
      toast(v ? "E-Mail gespeichert ✓" : "E-Mail entfernt");
    } catch (e) { toast("Speichern fehlgeschlagen: " + e.message); }
  };
  const doSend = async () => {
    const { check: c, email } = confirmSend;
    setSending(true);
    try {
      await sendTemplate({ key: "rueckgewinnung", to: email, checkId: c.id, lang: c.lang || "de", name: c.name !== "—" ? (c.name || "") : "", company: c.profile || "" });
      setSent((m) => ({ ...m, [c.id]: new Date().toISOString() })); // Sofort-Anzeige; Server hält den Zeitpunkt dauerhaft
      toast("Rückgewinnung an " + email + " gesendet ✓");
      setConfirmSend(null);
    } catch (e) { toast("Senden fehlgeschlagen: " + e.message); }
    setSending(false);
  };
  // „Angebot gesandt am …": Zeitpunkt kompakt (DD.MM.YYYY) für die Aktionsspalte.
  const fmtSent = (iso) => { try { return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }); } catch (e) { return ""; } };

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <h2><Icon.search style={{ width: 17, height: 17, verticalAlign: "-3px", marginRight: 7, color: "var(--primary)" }} />Geprüfte Profile</h2>
          <div className="ph-right" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {autoProg && autoProg !== "done"
              ? <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>🔎 Auto-Recherche… {autoProg.done}/{autoProg.total}</span>
              : autoProg === "done"
                ? <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", whiteSpace: "nowrap" }}>✓ Auto-Recherche abgeschlossen</span>
                : null}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen (Profil, Name, E-Mail…)"
              style={{ padding: "7px 11px", borderRadius: 8, border: "1px solid var(--hairline)", fontSize: 13, fontWeight: 600, minWidth: 190 }} />
          </div>
        </div>
        <div style={{ padding: "12px 22px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["open", "Nicht beauftragt", openCount], ["conv", "Beauftragt", convCount], ["all", "Alle", checks.length]].map(([k, lab, n]) => (
            <button key={k} className={"chipf" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{lab} <span className="ct">{n}</span></button>
          ))}
        </div>
        {/* Herkunft: eigene Filterleiste. „Social Media" beantwortet direkt,
            wer über die bezahlten sozialen Kanäle geprüft hat. */}
        <div style={{ padding: "10px 22px 0", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: ".04em" }}>Quelle</span>
          {srcChips.map(([k, lab, n]) => (
            <button key={k} className={"chipf" + (srcFilter === k ? " on" : "")} onClick={() => setSrcFilter(k)}>{lab} <span className="ct">{n}</span></button>
          ))}
        </div>
        <div className="tbl-scroll" style={{ marginTop: 10 }}>
          {/* Kompakt: 6 schmale Spalten, eine Zeile pro Profil, kein horizontales Scrollen. */}
          <table className="tbl" style={{ fontSize: 12.5, tableLayout: "fixed", width: "100%" }}>
            <colgroup><col style={{ width: "24%" }} /><col style={{ width: "7%" }} /><col style={{ width: "13%" }} /><col style={{ width: "24%" }} /><col style={{ width: "13%" }} /><col style={{ width: "19%" }} /></colgroup>
            <thead><tr>
              <th style={{ padding: "8px 10px" }}>Google-Profil</th>
              <th style={{ padding: "8px 6px" }}>Bew.</th>
              <th style={{ padding: "8px 6px" }}>Status</th>
              <th style={{ padding: "8px 10px" }}>Kontakt</th>
              <th style={{ padding: "8px 10px" }}>Quelle</th>
              <th style={{ padding: "8px 10px", textAlign: "right" }}>Aktionen</th>
            </tr></thead>
            <tbody>
              {list.map((c) => {
                const linked = c.orderId ? orders.find((o) => o.id === c.orderId) : null;
                const d = CHECK_DROP[checkStepOf(c)] || CHECK_DROP[1];
                const em = effEmail(c);
                const cand = cands[c.id];
                const mapsUrl = checkMapsUrl(c);
                const tdS = { padding: "7px 10px", verticalAlign: "middle" };
                const ell = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
                return (
                  <tr key={c.id} title={c.id + " · " + c.created}>
                    <td style={tdS}>
                      <div style={ell}>
                        {mapsUrl
                          ? <a href={mapsUrl} target="_blank" rel="noreferrer" title={"Google-Profil öffnen: " + (c.profile || "")} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>{c.profile || "—"}</a>
                          : <span style={{ fontWeight: 700 }}>{c.profile || "—"}</span>}
                        {c.dupes > 1 ? <span title={c.dupes + "× geprüft (zusammengefasst)"} style={{ marginLeft: 5, fontSize: 10, fontWeight: 800, color: "var(--primary)", background: "var(--orange-50)", border: "1px solid var(--hairline)", borderRadius: 999, padding: "0 5px", whiteSpace: "nowrap" }}>{c.dupes}×</span> : null}
                      </div>
                      <div className="sub" style={{ ...ell, fontSize: 10.5 }} title={c.addr || ""}>{c.created.split("·")[0]}{c.addr ? " · " + c.addr : ""}</div>
                    </td>
                    <td style={{ ...tdS, padding: "7px 6px", whiteSpace: "nowrap" }}>
                      <span className="amt" style={{ fontFamily: "var(--font-display)", fontSize: 12.5 }}>{c.rating}★</span>
                      <span className="muted" style={{ fontSize: 10.5 }}> {c.reviews}</span>
                    </td>
                    <td style={{ ...tdS, padding: "7px 6px", whiteSpace: "nowrap" }}>
                      {c.status === "konvertiert"
                        ? (linked
                          ? <button onClick={() => openOrder(linked)} title={"Auftrag öffnen: " + c.orderId} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--success)", fontWeight: 800, fontSize: 12, padding: 0 }}>✓ beauftragt →</button>
                          : <span style={{ color: "var(--success)", fontWeight: 800, fontSize: 12 }}>✓ beauftragt</span>)
                        : c.step == null
                          ? <span style={{ color: "var(--fg-muted)", fontWeight: 700 }} title="Vor Einführung des Funnel-Trackings geprüft – keine Stufen-Daten">—</span>
                          : <span title={"Abbruch bei: " + d.t} style={{ display: "inline-block", fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: d.bg, color: d.fg, whiteSpace: "nowrap" }}>{d.t}</span>}
                    </td>
                    <td style={tdS}>
                      {em
                        ? <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                            <a href={"mailto:" + em} title={em} style={{ ...ell, color: "var(--primary)", fontWeight: 700, fontSize: 12, textDecoration: "none", flex: "1 1 auto" }}>{em}</a>
                            <button title="E-Mail ändern" onClick={() => { setSaved((m) => ({ ...m, [c.id]: "" })); setDrafts((m) => ({ ...m, [c.id]: em })); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 0, flex: "none" }}>✎</button>
                          </div>
                        : <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input value={drafts[c.id] || ""} onChange={(e) => setDrafts((m) => ({ ...m, [c.id]: e.target.value }))} placeholder="E-Mail…"
                              style={{ padding: "4px 7px", borderRadius: 7, border: "1px solid var(--hairline)", fontSize: 11.5, fontWeight: 600, width: "100%", minWidth: 0, boxSizing: "border-box" }} />
                            <button className="btn btn-sec btn-sm" style={{ padding: "3px 8px", flex: "none" }} disabled={!(drafts[c.id] || "").includes("@")} onClick={() => doSaveEmail(c, drafts[c.id])}>✓</button>
                          </div>}
                      {c.name !== "—" && c.name ? <div className="sub" style={{ ...ell, fontSize: 10.5 }} title={c.name}>{c.name}</div> : null}
                      {cand && cand.emails ? (
                        <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {cand.emails.map((e) => (
                            <button key={e} className="btn btn-sec btn-sm" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => doSaveEmail(c, e)} title={"Übernehmen (gefunden auf " + (() => { try { return new URL(cand.website).hostname; } catch (err) { return "der Website"; } })() + ")"}>{e} ✓</button>
                          ))}
                        </div>
                      ) : null}
                      {cand && cand.error ? <div style={{ marginTop: 4, fontSize: 10.5, fontWeight: 600, color: "var(--danger)", ...ell }} title={cand.error}>{cand.error}</div> : null}
                    </td>
                    {/* Quelle = Last-Touch. Darunter der Motivschlüssel aus utm_content
                        (welche Anzeige die Prüfung gebracht hat) bzw. die Kampagne. */}
                    <td style={tdS}>
                      {c.source ? (
                        <span
                          title={"Herkunft: " + srcLabelOf(c) + (c.utmCampaign ? " · Kampagne " + c.utmCampaign : "") + (c.sourceFirst && c.sourceFirst !== c.source ? " · zuerst über " + (SRC_LABEL[c.sourceFirst] || c.sourceFirst) : "")}
                          style={{
                            display: "inline-block", maxWidth: "100%", ...ell,
                            fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "1px 8px",
                            border: "1px solid var(--hairline)",
                            background: SOCIAL_KINDS.includes(c.source) ? "var(--orange-50, #fff7e6)" : "var(--neutral-100)",
                            color: SOCIAL_KINDS.includes(c.source) ? "var(--primary)" : "var(--fg-2)",
                          }}>{srcLabelOf(c)}</span>
                      ) : <span className="muted" style={{ fontSize: 11 }}>—</span>}
                      {c.utmContent
                        ? <div className="sub" style={{ ...ell, fontSize: 10.5, fontWeight: 700 }} title={"Anzeigenmotiv: " + c.utmContent}>{c.utmContent}</div>
                        : (c.utmCampaign ? <div className="sub" style={{ ...ell, fontSize: 10.5 }} title={c.utmCampaign}>{c.utmCampaign}</div> : null)}
                    </td>
                    <td style={{ ...tdS, whiteSpace: "nowrap", textAlign: "right" }}>
                      {c.status !== "konvertiert" ? (() => {
                        const sentAt = sent[c.id] || c.rueckgewinnungAt;
                        if (sentAt) return (
                          <span title={"Rückgewinnungs-Angebot gesendet am " + fmtSent(sentAt)} style={{ display: "inline-block", lineHeight: 1.25, color: "var(--success)", fontWeight: 800, fontSize: 11, whiteSpace: "nowrap" }}>
                            ✓ Angebot gesandt<br />am {fmtSent(sentAt)}
                          </span>
                        );
                        return (
                          <div style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                            <button className="btn btn-sec btn-sm" style={{ padding: "4px 8px" }} disabled={enriching === c.id} onClick={() => doEnrich(c)} title="E-Mail-Recherche erneut ausführen (läuft beim Öffnen automatisch)">
                              {enriching === c.id ? "…" : <Icon.refresh size={13} />}
                            </button>
                            <a className="btn btn-sec btn-sm" style={{ padding: "4px 8px" }} href={checkWebSearchUrl(c)} target="_blank" rel="noreferrer" title="Manuelle Web-Suche nach dem Unternehmen"><Icon.globe size={13} /></a>
                            <button className="btn btn-pri btn-sm" style={{ padding: "4px 10px" }} disabled={!em} title={em ? "Rückgewinnungs-Mail senden" : "Zuerst E-Mail hinterlegen"} onClick={() => setConfirmSend({ check: c, email: em })}><Icon.mail size={13} /> Angebot</button>
                          </div>
                        );
                      })() : null}
                    </td>
                  </tr>
                );
              })}
              {!list.length ? <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--fg-muted)", fontWeight: 600, padding: 26 }}>Keine Prüfungen in dieser Ansicht.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      {confirmSend ? (
        <div className="modal-scrim open" onClick={() => setConfirmSend(null)}>
          <div className="modal" style={{ width: 480, maxWidth: "94vw" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.mail size={19} style={{ color: "var(--primary)" }} /></span>
              <div><h3>Rückgewinnung senden</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{confirmSend.check.profile || confirmSend.check.id}</div></div>
              <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={() => setConfirmSend(null)}><Icon.x /></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 600, lineHeight: 1.55 }}>
                Vorlage <strong>„Rückgewinnung (geprüft, nicht beauftragt)"</strong> in Sprache <strong>{(confirmSend.check.lang || "de").toUpperCase()}</strong> an <strong>{confirmSend.email}</strong> senden?
              </p>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", lineHeight: 1.5 }}>
                Hinweis: Der Empfänger hat evtl. nicht selbst geprüft (Kaltkontakt) — die Vorlage ist deshalb neutral formuliert und enthält eine Abmelde-Zeile.
              </p>
            </div>
            <div style={{ padding: "12px 22px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 10 }}>
              <button className="btn btn-pri" disabled={sending} onClick={doSend}><Icon.mail size={15} /> {sending ? "Sendet…" : "Senden"}</button>
              <button className="btn btn-sec" onClick={() => setConfirmSend(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Orders list ---------- */
// Inkasso-Kandidaten: Leistung erbracht (Profil „gelöscht"), aber unbezahlt UND die
// Löschung liegt mehr als 30 Tage zurück → überfällige offene Forderung.
const INKASSO_DAYS = 30;
const INKASSO_MS = INKASSO_DAYS * 24 * 3600 * 1000;
const overdueDays = (o, now) => (o.doneAt ? Math.floor((now - new Date(o.doneAt).getTime()) / 86400000) : null);
const isInkasso = (o, now) => o.status === "done" && !["paid", "refunded"].includes(o.pay) && !!o.doneAt && (now - new Date(o.doneAt).getTime()) > INKASSO_MS;
// „Zahlung offen": Leistung erbracht (Profil „gelöscht") UND unbezahlt. Schließt stornierte
// (Status ≠ done) und noch nicht gelieferte Aufträge aus – die schulden noch nichts.
const OFFEN_PAY = ["pending", "sent", "mahnung", "failed"];
const isZahlungOffen = (o) => o.status === "done" && OFFEN_PAY.includes(o.pay);
const ASSIGNEE_OPTS = [["all", "Alle Betreuer"], ["max", "Max"], ["matthias", "Matthias"], ["none", "Nicht zugewiesen"]];

function Orders({ orders, openOrder, query }) {
  const isMobile = useIsMobile();
  const now = useNow(30000); // Listen-Laufzeiten im Minutentakt aktualisieren
  const [filter, setFilter] = React.useState("all");
  const [assignee, setAssignee] = React.useState("all"); // Betreuer-Filter (Max/Matthias/nicht zugewiesen)
  // Zuerst nach Betreuer eingrenzen – Zähler UND Liste beziehen sich danach auf diese Auswahl.
  const scoped = orders.filter((o) => (assignee === "all" ? true : assignee === "none" ? !o.assignee : o.assignee === assignee));
  const inkassoOrders = scoped.filter((o) => isInkasso(o, now));
  const filters = [
    ["all", "Alle", scoped.length],
    ["new", "Neu", scoped.filter((o) => o.status === "new").length],
    ["progress", "In Bearbeitung", scoped.filter((o) => o.status === "progress").length],
    ["done", "Gelöscht", scoped.filter((o) => o.status === "done").length],
    ["pending", "Zahlung offen", scoped.filter(isZahlungOffen).length],
    ["inkasso", "Inkasso", inkassoOrders.length],
  ];
  let list = scoped;
  if (filter === "pending") list = scoped.filter(isZahlungOffen);
  else if (filter === "inkasso") list = inkassoOrders;
  else if (filter !== "all") list = scoped.filter((o) => o.status === filter);
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter((o) => (o.name + o.email + o.id + o.company).toLowerCase().includes(q));
  }
  // Kontextbezogener Leer-Hinweis: im Inkasso-Reiter ist „leer" die gute Nachricht.
  const emptyMsg = filter === "inkasso"
    ? "Keine überfälligen Forderungen – alle gelöschten Aufträge sind bezahlt oder jünger als 30 Tage. 🎉"
    : "Keine Bestellungen in diesem Filter.";
  if (isMobile) return (
    <div className="content">
      <select value={assignee} onChange={(e) => setAssignee(e.target.value)} title="Nach Betreuer filtern"
        style={{ width: "100%", marginBottom: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid var(--hairline)", fontSize: 14, fontWeight: 700, background: "#fff", color: "var(--fg)" }}>
        {ASSIGNEE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <div className="m-chips">
        {filters.map(([id, label, n]) => (
          <button key={id} className={"m-chip" + (filter === id ? " on" : "")} onClick={() => setFilter(id)}>{label} <span className="ct">{n}</span></button>
        ))}
      </div>
      {list.length ? (
        <div className="m-list">{list.map((o) => <OrderRow key={o.id} o={o} now={now} onClick={() => openOrder(o)} />)}</div>
      ) : (
        <div className="m-empty"><AI.inbox /><p>{emptyMsg}</p></div>
      )}
    </div>
  );
  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head">
          <div className="chips">
            {filters.map(([id, label, n]) => (
              <button key={id} className={"chipf" + (filter === id ? " on" : "")} onClick={() => setFilter(id)}>
                {label} <span className="ct">{n}</span>
              </button>
            ))}
          </div>
          <div className="ph-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} title="Nach Betreuer filtern"
              style={{ padding: "7px 11px", borderRadius: 8, border: "1px solid var(--hairline)", fontSize: 13, fontWeight: 700, background: "#fff", color: "var(--fg)", cursor: "pointer" }}>
              {ASSIGNEE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button className="btn btn-sec btn-sm"><AI.download /> Export</button>
          </div>
        </div>
        {list.length ? (
          <table className="tbl">
            <thead><tr><th>Auftrag</th><th>Kunde</th><th>Leistung</th><th>Zahlung</th><th>Status</th><th>Betrag</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} onClick={() => openOrder(o)}>
                  <td><span className="oid">{o.id}</span><div className="muted">{o.created}</div><OrderTimer since={o.createdAt} status={o.status} now={now} /></td>
                  <td><div className="cust" style={{ display: "flex", alignItems: "center", gap: 9 }}>{o.assignee ? <AssigneeAvatar who={o.assignee} size={26} /> : null}<div>{o.name}<div className="sub">{o.email}</div></div></div></td>
                  <td>{SERVICES[o.service].name}{o.protection ? <div className="muted">+ Schutz</div> : null}</td>
                  <td><PayBadge o={o} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><span className="amt">{o.amount ? money(o.amount, o.country) : "—"}</span>{filter === "inkasso" ? <div className="muted" style={{ color: "var(--danger)", fontWeight: 700, fontSize: 11.5, whiteSpace: "nowrap" }}>seit {overdueDays(o, now)} T. überfällig</div> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><AI.inbox /><p>{emptyMsg}</p></div>
        )}
      </div>
    </div>
  );
}

/* SMS-Vorlage „Zahlungslink" je Sprache (kurz, mit Link). */
const PAYLINK_SMS = {
  de: (n, url) => `Hallo ${n}, Ihr Zahlungslink für RapidRemove: ${url} – Zahlung erst nach erfolgreicher Löschung.`,
  en: (n, url) => `Hello ${n}, your RapidRemove payment link: ${url} – pay only after successful removal.`,
  es: (n, url) => `Hola ${n}, tu enlace de pago de RapidRemove: ${url} – pagas solo tras la eliminación con éxito.`,
  fr: (n, url) => `Bonjour ${n}, votre lien de paiement RapidRemove : ${url} – paiement seulement après suppression réussie.`,
  it: (n, url) => `Ciao ${n}, il tuo link di pagamento RapidRemove: ${url} – paghi solo dopo la rimozione riuscita.`,
  nl: (n, url) => `Hallo ${n}, uw RapidRemove-betaallink: ${url} – betaling pas na succesvolle verwijdering.`,
  pt: (n, url) => `Olá ${n}, o seu link de pagamento RapidRemove: ${url} – pagamento só após remoção bem-sucedida.`,
  ja: (n, url) => `${n} 様、RapidRemoveのお支払いリンク: ${url} – 削除成功後にのみお支払いです。`,
  sv: (n, url) => `Hej ${n}, din RapidRemove-betallänk: ${url} – betala först efter lyckad borttagning.`,
  da: (n, url) => `Hej ${n}, dit RapidRemove-betalingslink: ${url} – betaling først efter vellykket fjernelse.`,
  no: (n, url) => `Hei ${n}, din RapidRemove-betalingslenke: ${url} – betaling først etter vellykket fjerning.`,
};
const payLinkSmsText = (o, url) => (PAYLINK_SMS[o.lang] || PAYLINK_SMS.en)(o.name || "", url);
const PAYLINK_PLACEHOLDER = "[Zahlungslink hier einfügen]";

/* ---------- Order drawer ---------- */
function OrderDrawer({ order, onClose, onStatus, onCompose, onOpenFull, onAssign, onPayLink, toast }) {
  const now = useNow(1000);
  const [smsOpen, setSmsOpen] = React.useState(false);
  const [smsMsg, setSmsMsg] = React.useState("");
  const [smsBusy, setSmsBusy] = React.useState(false);
  const [smsLinkBusy, setSmsLinkBusy] = React.useState(false);
  if (!order) return <React.Fragment><div className="drawer-scrim"></div><div className="drawer"></div></React.Fragment>;
  const o = order;
  const isPress = o.service === "deindex"; // Presse-/Suchergebnis-Auslistung → eigene Ansicht
  const curIdx = STATUS_FLOW.findIndex((s) => s.id === o.status);
  const total = o.amount + (o.protection && o.protAmount ? o.protAmount : 0);
  return (
    <React.Fragment>
      <div className="drawer-scrim open" onClick={onClose}></div>
      <div className="drawer open">
        <div className="drawer-top">
          <div>
            <div className="dt-id">{o.id}</div>
            <div className="dt-sub">{o.created} · {o.country}</div>
            <div style={{ marginTop: 6 }}><OrderTimer since={o.createdAt} status={o.status} now={now} seconds /></div>
            {o.affiliate ? <div className="aff-badge"><Icon.user size={13} /> Affiliate: <b>{o.affiliate}</b></div> : null}
            {o.source ? <div style={{ marginTop: 7 }}><SourceBadge source={o.source} big /></div> : null}
          </div>
          <button className="btn btn-sec btn-sm" style={{ marginLeft: "auto" }} onClick={() => onOpenFull(o)}><Icon.user /> Volle Kundenakte</button>
          <button className="drawer-close" onClick={onClose}><Icon.x /></button>
        </div>
        <div className="drawer-body">
          <div className="dsec" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingBottom: 12 }}>
            <AssignControl order={o} onAssign={onAssign} />
          </div>
          {/* status pipeline */}
          <div className="dsec">
            <h3><Icon.zap /> Status aktualisieren <span className="right"><StatusBadge status={o.status} /></span></h3>
            <div className="dpipe">
              {STATUS_FLOW.map((s, i) => {
                const cls = i < curIdx ? "done" : i === curIdx ? "active" : "";
                return (
                  <div className={"dpipe-step " + cls} key={s.id} onClick={() => onStatus(o, s.id)}>
                    {i < STATUS_FLOW.length - 1 && <div className="dpipe-rail"></div>}
                    <div className="dpipe-dot">{i < curIdx ? <Icon.check /> : i === curIdx ? <Icon.clock /> : i + 1}</div>
                    <div className="dpipe-body">
                      <div className="pt">{s.label}{i === curIdx && <span className="now">JETZT</span>}</div>
                      <div className="pd">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {curIdx < STATUS_FLOW.length - 1 && (
                <button className="btn btn-pri btn-sm" onClick={() => onStatus(o, STATUS_FLOW[curIdx + 1].id)}>
                  <Icon.arrowRight /> Auf „{STATUS_FLOW[curIdx + 1].label}" setzen
                </button>
              )}
              <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES.find((t) => t.id === (o.status === "done" ? "done" : "progress")))}>
                <Icon.mail /> Status-Mail
              </button>
            </div>
          </div>

          {/* customer */}
          <div className="dsec">
            <h3><Icon.user /> Kunde</h3>
            <div className="cust-head">
              <div className="ca">{initials(o.name)}</div>
              <div><div className="cn">{o.name}</div><div className="cm">{o.company}</div></div>
            </div>
            <div className="drow"><span className="dl">E-Mail</span><span className="dv">{o.email}</span></div>
            <div className="drow"><span className="dl">Telefon</span><span className="dv">{o.phone}</span></div>
            <div className="drow"><span className="dl">Affiliate</span><span className="dv">{o.affiliate ? <b style={{ color: "var(--primary, #ff8000)" }}>{o.affiliate}</b> : <span style={{ color: "var(--fg-muted)" }}>— (kein Affiliate)</span>}</span></div>
            <div className="drow"><span className="dl">Quelle</span><span className="dv">{o.source ? o.source.label : "—"}{o.utmContent ? <b style={{ marginLeft: 6 }}>{o.utmContent}</b> : null}</span></div>
            {o.sourceFirst && o.source && o.sourceFirst.kind !== o.source.kind
              ? <div className="drow"><span className="dl">Zuerst über</span><span className="dv">{o.sourceFirst.label}</span></div>
              : null}
            <div className="cust-acts">
              <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES[0])}><Icon.mail /> E-Mail</button>
              <a className="btn btn-sec btn-sm" href={"tel:" + o.phone.replace(/\s/g, "")}><Icon.phone /> Anrufen</a>
              <a className="btn btn-sec btn-sm" href={"https://wa.me/" + o.phone.replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer"><Icon.whatsapp /> WhatsApp</a>
              {o.phone ? <button className={"btn btn-sm" + (smsOpen ? " btn-pri" : " btn-sec")} onClick={() => setSmsOpen((v) => !v)}><Icon.message /> SMS senden</button> : null}
            </div>
            {smsOpen && (
              <div className="sms-box">
                <div className="sms-tpls">
                  <button className="btn btn-ghost btn-sm" disabled={smsLinkBusy}
                    onClick={async () => {
                      setSmsLinkBusy(true);
                      try {
                        const url = await fetchPayLinkUrl({
                          service: o.service, protection: o.protection || "none",
                          currency: o.country === "US" ? "usd" : "eur",
                          serviceAmount: o.amount || 0,
                          protAmount: (o.protection && o.protAmount) ? o.protAmount : 0,
                          protType: o.protection || "", express: !!o.express,
                        });
                        setSmsMsg(payLinkSmsText(o, url));
                      } catch (e) {
                        // Kein passender Stripe-Link (häufig im DACH-Raum) → trotzdem die
                        // Vorlage einsetzen; der Link wird dann manuell eingefügt.
                        setSmsMsg(payLinkSmsText(o, PAYLINK_PLACEHOLDER));
                        toast("Kein hinterlegter Stripe-Link — Vorlage eingefügt, Link bitte ersetzen.");
                      }
                      finally { setSmsLinkBusy(false); }
                    }}><AI.creditCard /> {smsLinkBusy ? "Lädt…" : "Zahlungslink einfügen"}</button>
                </div>
                <textarea className="sms-ta" value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} maxLength={612} rows={3}
                  placeholder={"SMS an " + o.phone + " …"} />
                <div className="sms-foot">
                  <span className="sms-count">{smsMsg.length}/612</span>
                  <button className="btn btn-pri btn-sm" disabled={smsBusy || !smsMsg.trim()}
                    onClick={async () => {
                      setSmsBusy(true);
                      try {
                        await sendSms({ to: o.phone, message: smsMsg, orderId: o.id, country: o.country });
                        toast("SMS an " + o.name + " gesendet ✓");
                        setSmsMsg(""); setSmsOpen(false);
                      } catch (e) { toast("SMS fehlgeschlagen: " + e.message); }
                      finally { setSmsBusy(false); }
                    }}><AI.send /> {smsBusy ? "Senden…" : "Senden"}</button>
                </div>
              </div>
            )}
          </div>

          {/* profile / service (Presse: zu prüfende Inhalte statt Google-Profil) */}
          <div className="dsec">
            {isPress ? (
              <React.Fragment>
                <h3><Icon.fileText /> Auszulistende Inhalte</h3>
                <PressInfo o={o} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <h3><Icon.building /> Profil & Leistung</h3>
                <div className="drow"><span className="dl">Google-Profil</span><span className="dv"><ProfileLinks o={o} /></span></div>
                <div className="drow"><span className="dl">Bewertungen</span><span className="dv">{o.rating}★ · {o.reviews} Stück</span></div>
                <div className="drow"><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
                {o.protection && <div className="drow"><span className="dl">Schutz</span><span className="dv">{o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Tägliche Überwachung" : "Monatlich"}</span></div>}
                <div className="drow"><span className="dl">Notiz</span><span className="dv" style={{ fontWeight: 600, color: "var(--fg-2)", maxWidth: 280 }}>{o.note}</span></div>
              </React.Fragment>
            )}
          </div>

          {/* payment / stripe — bei Presse-Auslistung (kostenlose Prüfung) ausgeblendet */}
          {!isPress && (
          <div className="dsec">
            <h3><Icon.lock /> Zahlung <span className="right"><PayBadge o={o} /></span></h3>
          {o.paypal ? <div style={{ margin: "10px 0 0", background: "#e3effe", border: "1px solid #7fb2f0", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, fontWeight: 800, color: "#1c3a66", display: "flex", gap: 8, alignItems: "center", lineHeight: 1.35 }}><span aria-hidden="true">💳</span> Kunde möchte per PayPal zahlen → 10 % Rabatt gewähren{o.paypal && o.paypal !== "ja" ? " · " + o.paypal : ""}</div> : null}
            <div className="stripe-box" style={{ marginBottom: 14 }}>
              <span className="sb-logo">stripe</span>
              <span className="sb-card"><AI.creditCard /> <span className="dots">•••• 4242</span></span>
              <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Erfasst</span> : o.pay === "failed" ? <span className="badge-st st-refunded"><span className="d"></span>Abgelehnt</span> : <span className="badge-st st-pending"><span className="d"></span>Reserviert</span>}</span>
            </div>
            <div className="drow"><span className="dl">Leistung</span><span className="dv">{o.amount ? money(o.amount, o.country) : "kostenlose Prüfung"}</span></div>
            {o.protection && o.protAmount ? <div className="drow"><span className="dl">Schutz</span><span className="dv">{money(o.protAmount, o.country)}{o.protection !== "lifetime" ? " /Mon." : ""}</span></div> : null}
            <div className="drow"><span className="dl" style={{ fontWeight: 800, color: "var(--fg)" }}>Gesamt</span><span className="dv" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--primary)" }}>{o.amount ? money(total, o.country) : "—"}</span></div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {o.pay !== "paid" && o.amount ? <button className="btn btn-pri btn-sm" onClick={() => sendOrderedPayLink(o, toast, onStatus, onPayLink)}><AI.send /> Zahlungslink senden</button> : null}
              {o.pay === "paid" ? <button className="btn btn-ghost btn-sm" onClick={() => toast("Rückerstattung über Stripe eingeleitet")}><AI.refund /> Erstatten</button> : null}
            </div>
          </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

/* ---------- Email composer ---------- */
function EmailComposer({ data, onClose, toast }) {
  const { order, template } = data || {};
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  React.useEffect(() => {
    if (template && order) { setSubject(fillVars(template.subject, order)); setBody(fillVars(template.body, order)); }
  }, [template, order]);
  if (!data) return <div className="modal-scrim"></div>;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.mail size={19} style={{ color: "var(--primary)" }} /></span>
          <div>
            <h3>E-Mail an {order.name}</h3>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{template ? template.name : "Neue Nachricht"} · {order.email}</div>
          </div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="fld"><label>Betreff</label><input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="fld"><label>Nachricht</label><textarea value={body} onChange={(e) => setBody(e.target.value)}></textarea></div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 800, color: "var(--fg-2)", textTransform: "uppercase", display: "block", marginBottom: 7 }}>Platzhalter einfügen</label>
            <div className="var-row">
              {["{{name}}", "{{order_id}}", "{{profile}}", "{{amount}}", "{{invoice_id}}"].map((v) => (
                <span key={v} className="var-chip" onClick={() => setBody((b) => b + " " + v)}>{v}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto", display: "flex", alignItems: "center", gap: 6 }}><Icon.lock size={14} /> Versand über RapidRemove-Mailserver</span>
          <button className="btn btn-sec" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-pri" onClick={async () => { try { await sendAdminEmail({ to: order.email, subject, text: body, orderId: order.id, label: template ? template.name : "E-Mail" }); onClose(); toast("E-Mail an " + order.name + " gesendet ✓"); } catch (e) { toast("Senden fehlgeschlagen: " + e.message); } }}><AI.send /> Senden</button>
        </div>
      </div>
    </div>
  );
}

const LANG_NAMES = { de: "Deutsch", en: "English", es: "Español", fr: "Français", it: "Italiano", nl: "Nederlands", pt: "Português", ja: "日本語", sv: "Svenska", da: "Dansk", no: "Norsk" };

/* ---------- Vorlagen-Editor: Texte pro Sprache bearbeiten (Overrides in der DB) ---------- */
function TemplateEditor({ tpl, onClose, toast }) {
  const opsBase = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
  const [detail, setDetail] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [lang, setLang] = React.useState("en");
  const [draft, setDraft] = React.useState({});      // { feld: override-text } für die aktuelle Sprache
  const [saving, setSaving] = React.useState(false);
  const [pvNonce, setPvNonce] = React.useState(0);   // erzwingt Vorschau-Reload nach dem Speichern
  React.useEffect(() => {
    let alive = true;
    fetchTemplateDetail(tpl.key)
      .then((d) => { if (!alive) return; setDetail(d); const l = (d.langs || []).includes("en") ? "en" : ((d.langs || [])[0] || "en"); setLang(l); setDraft({ ...((d.overrides && d.overrides[l]) || {}) }); })
      .catch((e) => { if (alive) setErr(e.message || "Fehler"); });
    return () => { alive = false; };
  }, [tpl.key]);
  const switchLang = (l) => { setLang(l); setDraft({ ...((detail.overrides && detail.overrides[l]) || {}) }); };
  const setField = (f, v) => setDraft((d) => ({ ...d, [f]: v }));
  const clearField = (f) => setDraft((d) => { const n = { ...d }; delete n[f]; return n; });
  const save = async () => {
    setSaving(true);
    try {
      await saveTemplateText({ key: tpl.key, lang, fields: draft });
      setDetail((d) => ({ ...d, overrides: { ...(d.overrides || {}), [lang]: { ...draft } } }));
      setPvNonce((n) => n + 1);
      toast && toast("Vorlage gespeichert ✓");
    } catch (e) { toast && toast("Speichern fehlgeschlagen: " + e.message); }
    setSaving(false);
  };
  const notEditable = detail && detail.editable === false;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 880, maxWidth: "96vw", maxHeight: "92vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.mail size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>Vorlage bearbeiten</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{tpl.label}</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body" style={{ overflow: "auto" }}>
          {err ? <div className="empty"><Icon.mail /><p>{err}</p></div> : null}
          {!detail && !err ? <div style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 600 }}>Lädt…</div> : null}
          {notEditable ? <div className="empty"><Icon.mail /><p>Diese Vorlage ist noch nicht bearbeitbar — kommt in Kürze.</p></div> : null}
          {detail && detail.editable ? (
            <React.Fragment>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-2)" }}>Sprache:</span>
                <select value={lang} onChange={(e) => switchLang(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--hairline)", fontWeight: 700, fontSize: 13 }}>
                  {detail.langs.map((l) => <option key={l} value={l}>{LANG_NAMES[l] || l}</option>)}
                </select>
                <span style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 600 }}>Leeres Feld = Standardtext wird verwendet</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {detail.fields.map((f) => {
                  const def = (detail.defaults && detail.defaults[lang] && detail.defaults[lang][f]) || "";
                  const val = draft[f] !== undefined ? draft[f] : "";
                  const overridden = (val || "").trim() !== "";
                  return (
                    <div key={f}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: ".03em" }}>{f}</span>
                        {overridden ? <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>· geändert</span> : <span style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)" }}>· Standard</span>}
                        {overridden ? <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", padding: "2px 8px", fontSize: 11 }} onClick={() => clearField(f)}>↺ Standard</button> : null}
                      </div>
                      <textarea value={val} onChange={(e) => setField(f, e.target.value)} placeholder={def}
                        rows={Math.min(6, Math.max(2, Math.ceil(((def && def.length) || 40) / 70)))}
                        style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 8, border: "1px solid " + (overridden ? "var(--primary)" : "var(--hairline)"), fontSize: 13.5, lineHeight: 1.5, fontFamily: "inherit", resize: "vertical" }} />
                    </div>
                  );
                })}
              </div>
              {opsBase ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 6 }}>Vorschau (gespeicherter Stand)</div>
                  <iframe key={pvNonce} title="Vorschau" src={opsBase + "/preview/" + tpl.key + "?lang=" + lang + "&_=" + pvNonce} style={{ width: "100%", height: 420, border: "1px solid var(--hairline)", borderRadius: 10, background: "#fff" }} />
                </div>
              ) : null}
            </React.Fragment>
          ) : null}
        </div>
        {detail && detail.editable ? (
          <div style={{ padding: "12px 22px", borderTop: "1px solid var(--hairline)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-pri" onClick={save} disabled={saving}><Icon.checkCircle size={16} /> {saving ? "Speichert…" : "Speichern (" + (LANG_NAMES[lang] || lang) + ")"}</button>
            <span style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 600 }}>Gespeichert wird nur die aktuelle Sprache. Vorschau lädt nach dem Speichern neu.</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Templates (echte ops-Vorlagen + Vorschau) ---------- */
function Templates({ toast }) {
  const [tpls, setTpls] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [editing, setEditing] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try { const list = await fetchTemplates(); if (alive) setTpls(list || []); }
      catch (e) { if (alive) setErr(e.message || "Fehler"); }
    })();
    return () => { alive = false; };
  }, []);
  const opsBase = (process.env.NEXT_PUBLIC_OPS_URL || "").replace(/\/+$/, "");
  return (
    <div className="content">
      <div className="panel" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
        <div className="panel-head" style={{ padding: "0 2px 18px", borderBottom: "none" }}>
          <h2>E-Mail-Vorlagen</h2>
          <div className="ph-right muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{tpls ? tpls.length + " echte Vorlagen" : "lädt…"}</div>
        </div>
        {err ? <div className="empty"><Icon.mail /><p>Vorlagen nicht ladbar: {err}</p></div> : null}
        {tpls && !tpls.length && !err ? <div className="empty"><Icon.mail /><p>Keine Vorlagen gefunden.</p></div> : null}
        <div className="tpl-grid">
          {(tpls || []).map((t) => (
            <div className="tpl-card" key={t.key}>
              <div className="tc-top">
                <span className="tc-ic"><Icon.mail size={19} /></span>
                <div><div className="tc-name">{t.label}</div><div className="tc-tag">{t.group}</div></div>
              </div>
              <div className="tc-subj">{t.subject}</div>
              <div className="tc-foot">
                {opsBase
                  ? <React.Fragment><a href={opsBase + "/preview/" + t.key} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}><Icon.eye /> Vorschau DE</a> · <a href={opsBase + "/preview/" + t.key + "?lang=en"} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>EN</a></React.Fragment>
                  : <span>Vorschau (ops-URL fehlt)</span>}
              </div>
              {t.editable
                ? <button className="btn btn-sec btn-sm" style={{ marginTop: 10, width: "100%" }} onClick={() => setEditing(t)}>✏️ Bearbeiten</button>
                : <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--fg-muted)", fontWeight: 600 }}>Bearbeiten folgt in Kürze</div>}
            </div>
          ))}
        </div>
      </div>
      {editing ? <TemplateEditor tpl={editing} onClose={() => setEditing(null)} toast={toast} /> : null}
    </div>
  );
}

/* ---------- Invoice view ---------- */
function InvoiceView({ order, toast }) {
  const o = order || ORDERS.find((x) => x.pay === "paid");
  const inv = "RE-" + o.id.replace("RR-", "");
  const items = [{ name: SERVICES[o.service].name, desc: o.profile, amount: o.amount }];
  if (o.protection && o.protAmount) items.push({ name: "Reputations-Schutz", desc: o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Tägliche Überwachung (mtl.)" : "Monatlich", amount: o.protAmount });
  const net = items.reduce((s, i) => s + i.amount, 0);
  const vat = Math.round(net * 0.2 * 100) / 100;
  return (
    <div className="content">
      <div style={{ display: "flex", gap: 12, marginBottom: 18, alignItems: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, margin: 0 }}>Rechnung {inv}</h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn btn-sec btn-sm" onClick={() => toast("PDF wird erstellt…")}><AI.download /> PDF</button>
          <button className="btn btn-pri btn-sm" onClick={() => toast("Rechnung an " + o.name + " gesendet ✓")}><AI.send /> An Kunde senden</button>
        </div>
      </div>
      <div className="inv-paper">
        <div className="inv-top">
          <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" />
          <div className="inv-meta"><b>Rechnung {inv}</b>Datum: {o.created.split("·")[0]}<br />Fällig: nach Erfolg</div>
        </div>
        <div className="inv-parties">
          <div><div className="lbl">Von</div>{COMPANY.name}<br />{COMPANY.street}<br />{COMPANY.city}<br />UID: {COMPANY.vat}</div>
          <div><div className="lbl">An</div>{o.name}<br />{o.company}<br />{o.email}</div>
        </div>
        <table className="inv-table">
          <thead><tr><th>Position</th><th>Betrag</th></tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}><td><div className="it-name">{it.name}</div><div className="it-desc">{it.desc}</div></td><td>{money(it.amount, o.country)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="inv-tot">
          <div className="tr"><span>Netto</span><span>{money(net, o.country)}</span></div>
          <div className="tr"><span>USt. 20 %</span><span>{money(vat, o.country)}</span></div>
          <div className="tr grand"><span>Gesamt</span><span className="amt">{money(net + vat, o.country)}</span></div>
        </div>
        <div className="stripe-box" style={{ marginTop: 24 }}>
          <span className="sb-logo">stripe</span>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-2)" }}>Zahlung per sicherem Link · {o.pay === "paid" ? "bezahlt" : "ausstehend"}</div>
          <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Bezahlt</span> : <span className="badge-st st-pending"><span className="d"></span>Offen</span>}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Customers (echte Stripe-Kunden) ---------- */
function Customers({ customers, query }) {
  let list = customers || [];
  if (query.trim()) { const q = query.toLowerCase(); list = list.filter((c) => ((c.name || "") + (c.email || "")).toLowerCase().includes(q)); }
  return (
    <div className="content">
      <div className="panel">
        <div className="panel-head"><h2>Kunden</h2><div className="ph-right muted" style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 700 }}>{list.length} aus Stripe</div></div>
        {list.length ? (
          <table className="tbl">
            <thead><tr><th>Kunde</th><th>E-Mail</th><th>Kunde seit</th><th>Stripe-ID</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id || c.email}>
                  <td><div className="cust" style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="ca" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--orange-100)", color: "var(--orange-800)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{initials(c.name || c.email || "?")}</span><div>{c.name || "—"}</div></div></td>
                  <td>{c.email || "—"}</td>
                  <td>{c.date || "—"}</td>
                  <td><span className="oid" style={{ fontSize: 12 }}>{c.id}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty"><AI.users /><p>Keine Stripe-Kunden geladen — ist der STRIPE_SECRET_KEY gesetzt?</p></div>
        )}
      </div>
    </div>
  );
}

/* ---------- Invoice modal (opened from an order) ---------- */
function InvoiceModal({ order, onClose, onCompose, toast }) {
  if (!order) return <div className="modal-scrim"></div>;
  const o = order;
  const inv = "RE-" + o.id.replace("RR-", "");
  const items = [{ name: SERVICES[o.service].name, desc: o.profile, amount: o.amount }];
  if (o.protection && o.protAmount) items.push({ name: "Reputations-Schutz", desc: o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Tägliche Überwachung (mtl.)" : "Monatlich", amount: o.protAmount });
  const net = items.reduce((s, i) => s + i.amount, 0);
  const vat = Math.round(net * 0.2 * 100) / 100;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.fileText size={19} style={{ color: "var(--primary)" }} /></span>
          <div>
            <h3>Rechnung {inv}</h3>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{o.id} · {o.name}</div>
          </div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="inv-paper" style={{ border: "none", padding: 0 }}>
            <div className="inv-top">
              <img src={asset("/assets/rapidremove-logo-full.png")} alt="RapidRemove" />
              <div className="inv-meta"><b>Rechnung {inv}</b>Datum: {o.created.split("·")[0]}<br />Fällig: nach Erfolg</div>
            </div>
            <div className="inv-parties">
              <div><div className="lbl">Von</div>{COMPANY.name}<br />{COMPANY.street}<br />{COMPANY.city}<br />UID: {COMPANY.vat}</div>
              <div><div className="lbl">An</div>{o.name}<br />{o.company}<br />{o.email}</div>
            </div>
            <table className="inv-table">
              <thead><tr><th>Position</th><th>Betrag</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}><td><div className="it-name">{it.name}</div><div className="it-desc">{it.desc}</div></td><td>{money(it.amount, o.country)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="inv-tot">
              <div className="tr"><span>Netto</span><span>{money(net, o.country)}</span></div>
              <div className="tr"><span>USt. 20 %</span><span>{money(vat, o.country)}</span></div>
              <div className="tr grand"><span>Gesamt</span><span className="amt">{money(net + vat, o.country)}</span></div>
            </div>
            <div className="stripe-box" style={{ marginTop: 22 }}>
              <span className="sb-logo">stripe</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--fg-2)" }}>Zahlung per sicherem Link · {o.pay === "paid" ? "bezahlt" : "ausstehend"}</div>
              <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Bezahlt</span> : <span className="badge-st st-pending"><span className="d"></span>Offen</span>}</span>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto", display: "flex", alignItems: "center", gap: 6 }}><Icon.lock size={14} /> Stripe-Zahllink inklusive</span>
          <button className="btn btn-sec" onClick={() => toast("PDF wird erstellt…")}><AI.download /> PDF</button>
          <button className="btn btn-pri" onClick={() => { onClose(); onCompose(o, TEMPLATES.find((t) => t.id === "invoice")); }}><AI.send /> Rechnung + Stripe-Link senden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Confirm-Dialog (im Backend-Design, ersetzt window.confirm) ---------- */
function ConfirmDialog({ ask, onClose }) {
  if (!ask) return null;
  const danger = !!ask.danger;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: danger ? "rgba(220,38,38,.10)" : "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {danger ? <Icon.ban size={18} style={{ color: "#dc2626" }} /> : <Icon.mail size={18} style={{ color: "var(--primary)" }} />}
          </span>
          <div><h3>{ask.title}</h3></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{ask.message}</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-sec" style={{ marginLeft: "auto" }} onClick={onClose}>Abbrechen</button>
          <button className={"btn " + (danger ? "btn-danger" : "btn-pri")} onClick={() => { onClose(); if (ask.onConfirm) ask.onConfirm(); }}>{ask.confirmLabel || "Bestätigen"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Automatik-Erklärung (anklickbares ⚡-Icon neben Auto-Sends) ---------- */
function AutomationInfo({ info, onClose }) {
  if (!info) return null;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.zap size={18} style={{ color: "var(--primary)" }} /></span>
          <div><h3>{info.title}</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>Automatisch — kein manuelles Zutun nötig</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Wann</div>
            <p style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{info.trigger}</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>Was passiert</div>
            <p style={{ fontSize: 14, color: "var(--fg-2)", fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{info.how}</p>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-pri" style={{ marginLeft: "auto" }} onClick={onClose}>Verstanden</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Fragebogen-Block (Status „ausgefüllt?" + Antworten, im Bestell-Detail) ---------- */
function FragebogenBlock({ form, dach, onRequest }) {
  const f = form || {};
  const filled = !!f.filledAt;
  const pp = (typeof f.paypal === "string") ? f.paypal.trim() : ""; // PayPal-Wunsch (E-Mail) aus dem Fragebogen – nur außerhalb DACH abgefragt
  return (
    <React.Fragment>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {filled
          ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Ausgefüllt</span>
          : <span className="badge-st st-pending"><span className="d"></span>Nicht ausgefüllt</span>}
        {!filled ? <button className="btn btn-sec btn-sm" onClick={onRequest}><Icon.mail size={15} /> Per Mail anfordern</button> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {FORM_QUESTIONS.map((q) => {
          const v = f[q.key]; const yes = v === "ja", no = v === "nein";
          return (
            <div key={q.key} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>{q.short}</span>
              <span style={{ fontWeight: 800, flex: "none", color: yes ? "var(--success)" : no ? "var(--danger)" : "var(--fg-muted)" }}>{yes ? "Ja" : no ? "Nein" : "—"}</span>
            </div>
          );
        })}
        {/* PayPal-Wunsch aus dem Fragebogen (Feld „PayPal-E-Mail für 10 % Rabatt") – NUR außerhalb DACH */}
        {!dach ? (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", fontSize: 13, marginTop: 3, borderTop: "1px solid var(--hairline)", paddingTop: 9 }}>
            <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>💳 PayPal-Zahlung (10 % Rabatt)</span>
            <span style={{ fontWeight: 800, flex: "none", color: pp ? "#1c6ef0" : "var(--fg-muted)", textAlign: "right", maxWidth: "62%", overflowWrap: "anywhere" }}>{pp || "—"}</span>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
}

/* Ersparnis für die PayPal-Mails: Einmal-Teile (Löschung/Express/Lifetime) −10 %; Monats-Abo
   (monthly/monitor) = 12 Monate zum Preis von 10 (2 Monate gratis). Beträge in Bestell-Währung. */
function computeOffer(o) {
  const oneTimeReg = (Number(o.amount) || 0)
    + (o.express && o.expressAmount ? Number(o.expressAmount) : 0)
    + (o.protection === "lifetime" && o.protAmount ? Number(o.protAmount) : 0);
  const oneTimePP = Math.round(oneTimeReg * 90) / 100; // −10 %
  const isSub = o.protection === "monthly" || o.protection === "monitor";
  const monthly = isSub && o.protAmount ? Number(o.protAmount) : 0;
  const subReg = Math.round(monthly * 12 * 100) / 100;
  const subPP = Math.round(monthly * 10 * 100) / 100;  // 12 Monate zum Preis von 10
  const regTotal = Math.round((oneTimeReg + subReg) * 100) / 100;
  const ppTotal = Math.round((oneTimePP + subPP) * 100) / 100;
  const save = Math.round((regTotal - ppTotal) * 100) / 100;
  const m = (n) => money(n, o.country);
  return {
    regular: m(regTotal), paypal: m(ppTotal), savings: m(save),
    sub: isSub ? { monthly: m(monthly), regular: m(subReg), paypal: m(subPP) } : null,
  };
}

/* ---------- Customer detail (full CRM record) ---------- */
function CustomerDetail({ order, onBack, onStatus, onCompose, onInvoice, onSms, onPayLink, onStorno, onReactivate, onCorrectPay, onMarkPaid, onAssign, toast }) {
  const o = order;
  const isPress = o.service === "deindex"; // Presse-/Suchergebnis-Auslistung → eigene Detailansicht
  const isMobile = useIsMobile();
  const now = useNow(1000); // Live-Laufzeit-Timer (sekündlich)
  const ex = crmExtras(o);
  const [notes, setNotes] = React.useState(o.note || "");
  const [tab, setTab] = React.useState("activity");
  const [events, setEvents] = React.useState(null);
  // Verlauf STRIKT pro Bestellung (orderId) — jede Bestellung hat ihren eigenen,
  // eindeutigen Verlauf, auch wenn derselbe Kunde mehrfach mit derselben E-Mail
  // bestellt (kein Vermischen mehrerer Aufträge). Voraussetzung: Jedes Event wird
  // serverseitig mit der korrekten orderId protokolliert — gilt seit dem Backend-Fix
  // auch für Zahlungslink-/Mahnung-Mails, die damit zuverlässig im jeweiligen
  // Auftrag erscheinen.
  const reloadEvents = React.useCallback(() => {
    fetchEvents(o.id).then((ev) => setEvents(ev)).catch(() => {});
  }, [o.id]);
  React.useEffect(() => { reloadEvents(); }, [reloadEvents]);
  // Betreuer geändert (zugewiesen/gewechselt) → Verlauf kurz danach nachladen,
  // damit das serverseitig protokollierte Ereignis sofort erscheint.
  const assignFirst = React.useRef(true);
  React.useEffect(() => {
    if (assignFirst.current) { assignFirst.current = false; return; }
    const t1 = setTimeout(reloadEvents, 800);
    const t2 = setTimeout(reloadEvents, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [o.assignee]); // eslint-disable-line react-hooks/exhaustive-deps
  // Zahlungsstatus geändert (Zahlungslink/Mahnung gesendet, bezahlt) → Verlauf nachladen,
  // damit das „Zahlungslink gesendet"-Ereignis (inkl. Vorschau) sofort im Verlauf erscheint.
  const payFirst = React.useRef(true);
  React.useEffect(() => {
    if (payFirst.current) { payFirst.current = false; return; }
    const t1 = setTimeout(reloadEvents, 900);
    const t2 = setTimeout(reloadEvents, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [o.pay]); // eslint-disable-line react-hooks/exhaustive-deps
  // 1:1-Vorschau der EXAKT versendeten Mail (richtige Sprache, richtiger Zahlungslink) zu Kontrollzwecken.
  const [mailPreview, setMailPreview] = React.useState(null); // null | {loading} | {ok,html,subject} | {error}
  const openMailPreview = (id) => {
    setMailPreview({ loading: true });
    fetchEmailPreview(id)
      .then((r) => setMailPreview(r && r.ok ? r : { error: (r && r.error) || "Keine Kopie gespeichert." }))
      .catch((e) => setMailPreview({ error: e.message || "Fehler beim Laden." }));
  };
  // Alle echten ops-Vorlagen laden → jede ist per Klick an den Kunden sendbar.
  const [tpls, setTpls] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    fetchTemplates().then((l) => { if (alive) setTpls(l || []); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  // Bestätigungs-Dialog im Backend-Design (kein natives window.confirm).
  const [ask, setAsk] = React.useState(null);
  // Automatik-Erklärung (⚡-Icon).
  const [autoInfo, setAutoInfo] = React.useState(null);
  // Vorlagen-Nutzung (für „Am häufigsten verwendet") + aufgeklappte Kategorie.
  const [usage, setUsage] = React.useState({});
  const [openGroup, setOpenGroup] = React.useState(null);
  const [stornoMail, setStornoMail] = React.useState(false); // „Auftrag stornieren" → nur Storno-Mails
  React.useEffect(() => { setUsage(readTplUsage()); }, []);
  const automationForKey = (key) => AUTOMATIONS.find((a) => a.keys.includes(key));
  const automationForTitle = (title) => AUTOMATIONS.find((a) => a.match && a.match.test(title || ""));
  const GENERIC_AUTO = { title: "Automatisch versendet", trigger: "Diese Nachricht wurde vom System automatisch ausgelöst (z. B. durch ein Stripe-Ereignis).", how: "Es war kein manuelles Zutun nötig — der Versand erfolgte automatisch im Hintergrund." };
  // Für NICHT-Mail-Automatik (z. B. Zahlungsabgleich): hier wurde NICHTS an den Kunden gesendet.
  const GENERIC_AUTO_EVENT = { title: "Automatisch erfasst", trigger: "Dieser Eintrag wurde vom System automatisch erzeugt — z. B. beim automatischen Stripe-Zahlungsabgleich.", how: "Es wurde KEINE E-Mail an den Kunden gesendet. Der Eintrag dient nur eurer internen Übersicht." };
  const STORNO_KEYS = ["storno", "kundenstorno", "rechtestorno", "scamstorno"];
  const sendReal = (key, label) => {
    setAsk({
      title: "Mail senden",
      message: label + "-Mail an " + o.name + " (" + o.email + ") senden?",
      confirmLabel: "Senden",
      onConfirm: async () => {
        try {
          await sendTemplate({ key, to: o.email, orderId: o.id, lang: o.lang || "de", name: o.name || "", hasSub: o.protection === "monthly" || o.protection === "monitor", hasProtection: !!(o.protection && o.protection !== "none"), offer: computeOffer(o) });
          bumpTplUsage(key); setUsage(readTplUsage()); // Nutzung für „Am häufigsten verwendet" zählen
          // Status-Automatik: Storno-Mail → storniert, Reaktivierungs-Mail → wieder aktiv.
          // PayPal-Vorteil (nach Löschung) → Auftrag „Gelöscht", Zahlung bleibt OFFEN
          // (keepPay=true verhindert das Auto-Umschalten auf „bezahlt"; der PayPal-Eingang
          //  kommt separat, nicht über Stripe).
          let note = "";
          if (STORNO_KEYS.includes(key)) { onStatus(o, "storniert", true); note = " · Bestellung storniert"; }
          else if (key === "reaktivierung") { onStatus(o, "progress", true); note = " · Auftrag reaktiviert"; }
          else if (key === "paypal-angebot") { onStatus(o, "done", true, true, { noEvent: o.status === "done" }); note = " · als gelöscht markiert (Zahlung offen)"; }
          toast(label + " an " + o.name + " gesendet ✓" + note);
          reloadEvents(); setTimeout(reloadEvents, 900); // Verlauf sofort aktualisieren → Mail-Eintrag inkl. „Vorschau" erscheint direkt
        } catch (e) { toast("Senden fehlgeschlagen: " + e.message); }
      },
    });
  };
  // Datenabhängige Vorlagen (brauchen Betrag/Link/Stufe) laufen über eigene Flows,
  // nicht über die generische Vorlagen-Liste (Zahlungslink-Dialog bzw. Mahnung-Button).
  const TPL_VIA_PAYLINK = new Set(["zahlungslink", "mahnung", "paypal-mahnung"]);
  // Vorlagen, die NUR außerhalb DACH angeboten werden (PayPal-Vorteil + -Erinnerung + -Mahnung).
  const NON_DACH_ONLY = new Set(["paypal-angebot", "paypal-erinnerung", "paypal-zahlung-bestaetigt", "paypal-mahnung"]);
  const isDach = (o.lang || "de") === "de";
  const TPL_GROUP_ORDER = ["Mitwirkung", "Storno", "Schutz", "Bestellung"];
  const sendableTpls = (tpls || []).filter((t) => !TPL_VIA_PAYLINK.has(t.key) && !(isDach && NON_DACH_ONLY.has(t.key)));
  const topUsed = [...sendableTpls].sort((a, b) => (usage[b.key] || 0) - (usage[a.key] || 0)).slice(0, 6);
  const renderTplBtn = (t) => {
    const auto = automationForKey(t.key);
    return (
      <span key={t.key} style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <button className="btn btn-sec btn-sm" onClick={() => sendReal(t.key, t.label)}><Icon.mail size={15} /> {t.label}</button>
        {auto ? <button type="button" title="Automatik erklären" onClick={() => setAutoInfo(auto)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 8, border: "1px solid var(--hairline)", background: "var(--orange-50)", color: "var(--primary)", cursor: "pointer", flex: "0 0 auto", padding: 0 }}><Icon.zap size={13} /></button> : null}
      </span>
    );
  };
  const curIdx = STATUS_FLOW.findIndex((s) => s.id === o.status);
  const total = o.amount + (o.protection && o.protAmount ? o.protAmount : 0);
  // Mahnungs-Schutz: wurde an diesen Auftrag in den letzten 6 h schon eine Mahnung
  // gesendet, muss der erneute Versand aktiv bestätigt werden (kein versehentliches Doppel-Mahnen).
  const MAHN_WINDOW_MS = 6 * 3600 * 1000;
  const lastMahnungTs = React.useMemo(() => {
    let latest = 0;
    for (const e of events || []) {
      if (e.ts && /mahnung/i.test(e.t || "")) {
        const ms = new Date(e.ts).getTime();
        if (!isNaN(ms) && ms > latest) latest = ms;
      }
    }
    return latest;
  }, [events]);
  // Mahnlauf (4 Stufen): bereits gesendete Stufen bestimmen die NÄCHSTE Stufe.
  //  0 gesendet → Stufe 1 (Zahlungserinnerung) · 1 → Stufe 2 (2. Erinnerung) ·
  //  2 → Stufe 3 (Mahnung, Inkasso) · ab 3 → Stufe 4 (letzte Mahnung, Reaktivierung).
  const mahnungCount = React.useMemo(() => (events || []).filter((e) => /mahnung/i.test(e.t || "")).length, [events]);
  const mahnStage = Math.min(mahnungCount + 1, 4);
  const mahnLabel = { 1: "Zahlungserinnerung", 2: "2. Erinnerung", 3: "Mahnung", 4: "Letzte Mahnung" }[mahnStage];
  const mahnBtnLabel = { 1: "Zahlungserinnerung senden", 2: "2. Erinnerung senden", 3: "Mahnung senden", 4: "Letzte Mahnung (Reaktivierung)" }[mahnStage];
  // PayPal-Kunden (Zahlung außerhalb Stripe): Mahnung als Text-Mahnlauf per Vorlage, die auf
  // den separat gesendeten PayPal-Link verweist – KEIN Stripe-Zahlungslink. Nur außerhalb DACH.
  const usePaypalMahnung = !!o.paypal && (o.lang || "de") !== "de";
  const doSendMahnung = async () => {
    try {
      if (usePaypalMahnung) {
        // Text-Mahnlauf (Stufe 1–4) für PayPal – verweist auf den bereits gesendeten PayPal-Link.
        await sendTemplate({ key: "paypal-mahnung", to: o.email, orderId: o.id, lang: o.lang || "de", name: o.name || "", service: o.service, offer: computeOffer(o), stage: mahnStage });
      } else {
        const tot = o.amount + (o.protection && o.protAmount ? o.protAmount : 0);
        await sendPayLink({ to: o.email, name: o.name, orderId: o.id, currency: o.country === "US" ? "usd" : "eur", service: o.service, protection: o.protection || "none", serviceAmount: o.amount || 0, protAmount: (o.protection && o.protAmount) ? o.protAmount : 0, protType: o.protection || "", total: tot, protectionLabel: o.protection ? ((o.protection === "lifetime" ? "Lebenslanger Schutz" : o.protection === "monitor" ? "Schutz + Tägliche Überwachung" : "Monatlicher Schutz") + (o.protAmount ? " – " + money(o.protAmount, o.country) + (o.protection !== "lifetime" ? "/Mon." : "") : "")) : "", express: !!o.express, expressLabel: o.express ? ("Express-Bearbeitung (≤6 h)" + (o.expressAmount ? " · +" + money(o.expressAmount, o.country) : "")) : undefined, lang: o.lang || "de", template: "mahnung", stage: mahnStage });
      }
      toast(mahnLabel + (usePaypalMahnung ? " (PayPal)" : "") + " an " + o.name + " gesendet ✓");
      // Status „Profil gelöscht" nur 1× (beim ersten Mal) – danach nur Zahlungsstatus.
      onStatus(o, "done", true, true, { pay: "mahnung", noEvent: o.status === "done" });
      reloadEvents(); setTimeout(reloadEvents, 900);
    } catch (e) { toast(mahnLabel + " fehlgeschlagen: " + e.message); }
  };
  const sendMahnung = () => {
    // Ab Stufe 3 (scharf: Inkasso bzw. Reaktivierung) immer aktiv bestätigen lassen.
    if (mahnStage >= 3) {
      setAsk({
        danger: true,
        title: mahnStage === 4 ? "Letzte Mahnung senden? (Reaktivierung + Inkasso)" : "Mahnung senden? (Inkasso)",
        message: mahnStage === 4
          ? `An ${o.name} geht die LETZTE Mahnung: Zahlung noch HEUTE – sonst ${o.service === "reset" ? "Wiederherstellung der bisherigen Bewertungen" : "Reaktivierung des Profils"} und Übergabe an ein Inkassobüro. Wirklich senden?`
          : `An ${o.name} geht eine Mahnung mit Androhung von Inkasso und ${o.service === "reset" ? "Wiederherstellung der bisherigen Bewertungen" : "Wiederherstellung des Profils"}. Wirklich senden?`,
        confirmLabel: mahnBtnLabel,
        onConfirm: doSendMahnung,
      });
      return;
    }
    const elapsed = lastMahnungTs ? Date.now() - lastMahnungTs : Infinity;
    if (elapsed < MAHN_WINDOW_MS) {
      const mins = Math.max(1, Math.round(elapsed / 60000));
      const ago = mins < 60 ? `vor ${mins} Min` : `vor ${Math.floor(mins / 60)} Std ${String(mins % 60).padStart(2, "0")} Min`;
      setAsk({
        danger: true,
        title: "Achtung: zuletzt vor Kurzem versandt",
        message: `An ${o.name} wurde bereits ${ago} eine Mahnung/Erinnerung gesendet. Erneut so kurz danach kann den Kunden verärgern. Trotzdem senden?`,
        confirmLabel: "Trotzdem senden",
        onConfirm: doSendMahnung,
      });
    } else {
      doSendMahnung();
    }
  };
  // Mail-Vorlagen als Popup (Kategorien + Vorlagen-Links) – für Mobil und Desktop.
  const tplModalEl = openGroup ? (
    <div className="modal-scrim open" onClick={() => setOpenGroup(null)}>
      <div className="modal" style={{ width: 520, maxWidth: "94vw" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.mail size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>Mail-Vorlagen</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>Kategorie wählen – Vorlage an {o.name} senden</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={() => setOpenGroup(null)}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="chips" style={{ marginBottom: 14 }}>
            {TPL_GROUP_ORDER.map((g) => { const n = sendableTpls.filter((t) => t.group === g).length; return n ? <button key={g} className={"chipf" + (openGroup === g ? " on" : "")} onClick={() => setOpenGroup(g)}>{g} <span className="ct">{n}</span></button> : null; })}
          </div>
          <div className="act-btns">{sendableTpls.filter((t) => t.group === openGroup).map((t) => renderTplBtn(t))}</div>
        </div>
      </div>
    </div>
  ) : null;
  // „Auftrag stornieren" → Popup mit NUR den Storno-Mails (Kategorie „Storno", ohne Reaktivierung).
  const stornoTpls = sendableTpls.filter((t) => t.group === "Storno" && t.key !== "reaktivierung");
  const stornoMailEl = stornoMail ? (
    <div className="modal-scrim open" onClick={() => setStornoMail(false)}>
      <div className="modal" style={{ width: 520, maxWidth: "94vw" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--danger-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.ban size={19} style={{ color: "var(--danger)" }} /></span>
          <div><h3>Auftrag stornieren</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>Storno-Mail an {o.name} senden – die Bestellung wird storniert</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={() => setStornoMail(false)}><Icon.x /></button>
        </div>
        <div className="modal-body">
          {stornoTpls.length
            ? <div className="act-btns">{stornoTpls.map((t) => (
                <button key={t.key} className="btn btn-sec btn-sm" onClick={() => { setStornoMail(false); sendReal(t.key, t.label); }}><Icon.mail size={15} /> {t.label}</button>
              ))}</div>
            : <div className="empty"><Icon.mail /><p>Keine Storno-Vorlagen gefunden.</p></div>}
        </div>
      </div>
    </div>
  ) : null;

  // Verlauf/Aktivitäten – wiederverwendbar für Desktop-Tab UND mobile Ansicht.
  const actChip = { marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: "var(--primary)", background: "var(--orange-50)", border: "1px solid var(--hairline)", borderRadius: 999, padding: "1px 8px 1px 6px", textTransform: "uppercase", letterSpacing: ".03em", verticalAlign: "middle", whiteSpace: "nowrap", cursor: "pointer" };
  // Konsistenz-Fallback: Sagt der Zahlungsstatus „gesandt"/„Mahnung", fehlt aber der passende
  // Verlauf-Eintrag (z. B. bei VOR dem Logging-Update versendeten Mails), wird er aus dem
  // Zahlungsstatus abgeleitet ergänzt — so widersprechen sich Badge und Verlauf nie.
  const synthChip = { marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: "var(--fg-muted)", background: "var(--neutral-50)", border: "1px solid var(--hairline)", borderRadius: 999, padding: "1px 8px", textTransform: "uppercase", letterSpacing: ".03em", verticalAlign: "middle", whiteSpace: "nowrap" };
  const evList = events || [];
  const hasLinkEvt = evList.some((e) => /zahlungslink/i.test(e.t || ""));
  const hasMahnEvt = evList.some((e) => /mahnung/i.test(e.t || ""));
  const synthEvents = [];
  if (events) {
    if ((o.pay === "mahnung" || (Number(o.mahnungCount) || 0) > 0) && !hasMahnEvt)
      synthEvents.push({ id: "synth-mahn", ic: "pay", t: "Mahnung gesendet", d: "aus Zahlungsstatus abgeleitet – vor dem Protokoll-Update gesendet (keine Vorschau)", time: "", synthetic: true });
    if ((o.pay === "sent" || o.pay === "mahnung") && !hasLinkEvt)
      synthEvents.push({ id: "synth-link", ic: "pay", t: "Zahlungslink gesendet", d: "aus Zahlungsstatus abgeleitet – vor dem Protokoll-Update gesendet (keine Vorschau)", time: "", synthetic: true });
  }
  const shownEvents = [...synthEvents, ...evList];
  const activityTimeline = (
    <div className="act">
      {shownEvents.length ? shownEvents.map((a, i) => (
        <div className="act-item" key={a.id || i}>
          <div className="act-rail"></div>
          <div className={"act-ic " + a.ic}>{a.ic === "mail" ? <Icon.mail /> : a.ic === "pay" ? <Icon.card /> : a.ic === "status" ? <Icon.zap /> : a.ic === "assign" ? <Icon.users /> : <Icon.fileText />}</div>
          <div className="act-body"><div className="at">{a.t}{a.synthetic ? <span style={synthChip}>abgeleitet</span> : null}{a.auto ? <button type="button" title="Automatik erklären" onClick={() => setAutoInfo(a.ic === "mail" ? (automationForTitle(a.t) || GENERIC_AUTO) : GENERIC_AUTO_EVENT)} style={actChip}><Icon.zap size={11} /> {a.ic === "mail" ? "automatisch versendet" : a.ic === "pay" ? "automatisch erfasst" : "automatisch"}</button> : null}{a.hasHtml ? <button type="button" title="Exakt versendete Mail 1:1 ansehen" onClick={() => openMailPreview(a.id)} style={actChip}><Icon.eye size={11} /> Vorschau</button> : null}</div><div className="ad">{a.d}</div><div className="atime">{a.time}</div></div>
        </div>
      )) : <div style={{ color: "var(--fg-muted)", fontWeight: 600, fontSize: 13.5, padding: 8 }}>{events === null ? "Lädt…" : "Noch keine Aktivität erfasst."}</div>}
    </div>
  );

  if (isMobile) return (
    <div className="m-detail">
      {tplModalEl}
      {stornoMailEl}
      <ConfirmDialog ask={ask} onClose={() => setAsk(null)} />
      <AutomationInfo info={autoInfo} onClose={() => setAutoInfo(null)} />
      <div className="m-detail-head">
        <button className="m-back" onClick={onBack}><Icon.arrowLeft /> Zurück</button>
        <span className="oid">{o.id}</span>
      </div>
      <div className="m-scroll">
        <div className="m-dhero">
          <div className="m-ava" style={{ background: avaColor(o.name), color: "#fff", width: 54, height: 54, fontSize: 21 }}>{initials(o.name)}</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, lineHeight: 1.15 }}>{o.name}</div>
            <div style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 600, marginTop: 2 }}>{o.company} · {o.id}</div>
          </div>
        </div>
        {o.source ? <div style={{ padding: "0 16px 10px" }}><SourceBadge source={o.source} big /></div> : null}
        <div style={{ padding: "0 16px 10px" }}><AssignControl order={o} onAssign={onAssign} compact /></div>
        <div className="m-dbadges"><StatusBadge status={o.status} />{!isPress && <PayBadge o={o} />}<OrderTimer since={o.createdAt} status={o.status} now={now} seconds />
          {o.status !== "storniert"
            ? <button className="stat-toggle danger" onClick={() => setStornoMail(true)}><Icon.ban /> Auftrag stornieren</button>
            : <button className="stat-toggle" onClick={() => setAsk({ title: "Auftrag aktivieren", message: "Auftrag " + o.id + " wieder aktivieren? Der Kunde erhält eine E-Mail, dass sein Auftrag wieder aktiv ist.", confirmLabel: "Aktivieren", onConfirm: () => onReactivate(o) })}><Icon.refresh /> Auftrag aktivieren</button>}
        </div>

        <div className="m-dsec">
          <h3><Icon.zap /> Status <span className="right"><StatusBadge status={o.status} /></span></h3>
          <div className="m-vpipe">
            {STATUS_FLOW.map((s, i) => {
              const cls = i < curIdx ? "done" : i === curIdx ? "active" : "";
              return (
                <div className={"m-vstep " + cls} key={s.id} onClick={() => onStatus(o, s.id)}>
                  {i < STATUS_FLOW.length - 1 && <div className="rail"></div>}
                  <div className="m-vdot">{i < curIdx ? <Icon.check /> : i === curIdx ? <Icon.clock /> : i + 1}</div>
                  <div><div className="pt">{s.label}{i === curIdx && <span className="now">JETZT</span>}</div><div className="pd">{s.desc}</div></div>
                </div>
              );
            })}
          </div>
          {curIdx < STATUS_FLOW.length - 1 && (
            <button className="m-btn m-btn-pri" style={{ marginTop: 14 }} onClick={() => onStatus(o, STATUS_FLOW[curIdx + 1].id)}><Icon.arrowRight /> Weiter: {STATUS_FLOW[curIdx + 1].label}</button>
          )}
        </div>

        <div className="m-dsec">
          {isPress ? (
            <React.Fragment>
              <h3><Icon.fileText /> Auszulistende Inhalte</h3>
              <PressInfo o={o} rc="m-drow" />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h3><Icon.building /> Profil &amp; Leistung</h3>
              <div className="m-drow"><span className="dl">Google-Profil</span><span className="dv"><ProfileLinks o={o} /></span></div>
              <div className="m-drow"><span className="dl">Bewertungen</span><span className="dv">{o.rating}★ · {o.reviews}</span></div>
              <div className="m-drow"><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
              {o.protection && <div className="m-drow"><span className="dl">Schutz</span><span className="dv">{o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Tägliche Überwachung" : "Monatlich"}</span></div>}
              <div className="m-drow"><span className="dl">E-Mail</span><span className="dv">{o.email}</span></div>
              {o.businessStatus ? <div className="m-drow"><span className="dl">Status (Beauftragung)</span><span className="dv">{bizStatus(o.businessStatus)}</span></div> : null}
              {o.placeId ? <div className="m-drow"><span className="dl">Google Place-ID</span><span className="dv" style={{ fontFamily: "monospace", fontSize: 10.5, wordBreak: "break-all", textAlign: "right" }}>{o.placeId}</span></div> : null}
            </React.Fragment>
          )}
        </div>

        {!isPress && (
        <div className="m-dsec">
          <h3><Icon.lock /> Zahlung <span className="right"><PayBadge o={o} /></span></h3>
          {o.paypal ? <div style={{ margin: "10px 0 0", background: "#e3effe", border: "1px solid #7fb2f0", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, fontWeight: 800, color: "#1c3a66", display: "flex", gap: 8, alignItems: "center", lineHeight: 1.35 }}><span aria-hidden="true">💳</span> Kunde möchte per PayPal zahlen → 10 % Rabatt gewähren{o.paypal && o.paypal !== "ja" ? " · " + o.paypal : ""}</div> : null}
          <div className="m-drow"><span className="dl">Leistung</span><span className="dv">{o.amount ? money(o.amount, o.country) : "kostenlose Prüfung"}</span></div>
          {o.protection && o.protAmount ? <div className="m-drow"><span className="dl">Schutz</span><span className="dv">{money(o.protAmount, o.country)}{o.protection !== "lifetime" ? " /Mon." : ""}</span></div> : null}
          <div className="m-drow"><span className="dl" style={{ fontWeight: 800, color: "var(--fg)" }}>Gesamt</span><span className="dv" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--primary)" }}>{o.amount ? money(total, o.country) : "—"}</span></div>
          {o.amount ? <button className="m-btn m-btn-pri" style={{ marginTop: 14 }} onClick={() => sendOrderedPayLink(o, toast, onStatus, onPayLink)}><AI.send /> Zahlungslink senden</button> : null}
          {o.amount ? <button className="m-btn m-btn-sec" style={{ marginTop: 9 }} onClick={() => onPayLink(o)}><AI.creditCard /> Anderen Link wählen…</button> : null}
          {o.pay !== "paid" && o.amount ? <button className="m-btn m-btn-sec" style={{ marginTop: 9 }} onClick={() => onMarkPaid && onMarkPaid(o)}><Icon.checkCircle /> Als bezahlt markieren (z. B. PayPal)</button> : null}
          {o.pay === "paid" ? <button className="m-btn m-btn-sec" style={{ marginTop: 9 }} onClick={() => onCorrectPay && onCorrectPay(o)}><Icon.refresh /> Zahlung korrigieren (nicht erhalten)</button> : null}
        </div>
        )}

        <div className="m-dsec">
          <h3><Icon.mail /> Kommunikation</h3>
          <div className="m-btn-row">
            <button className="m-btn m-btn-sec" onClick={() => onCompose(o, TEMPLATES[0])}><Icon.mail /> E-Mail</button>
            <button className="m-btn m-btn-sec" onClick={() => onSms(o)}><Icon.message /> SMS</button>
            <a className="m-btn m-btn-sec" href={"tel:" + (o.phone || "").replace(/\s/g, "")}><Icon.phone /> Anrufen</a>
          </div>
          {tpls && tpls.length ? (
            <React.Fragment>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: ".04em", margin: "14px 0 7px" }}>Am häufigsten verwendet</div>
              <div className="act-btns">{topUsed.map((t) => renderTplBtn(t))}</div>
              <div className="chips" style={{ marginTop: 10 }}>
                {TPL_GROUP_ORDER.map((g) => {
                  const n = sendableTpls.filter((t) => t.group === g).length;
                  return n ? <button key={g} className="chipf" onClick={() => setOpenGroup(g)}>{g} <span className="ct">{n}</span></button> : null;
                })}
              </div>
            </React.Fragment>
          ) : null}
        </div>

        <div className="m-dsec">
          <h3><Icon.fileText /> Fragebogen</h3>
          <FragebogenBlock form={o.form} dach={o.lang === "de"} onRequest={() => sendReal("fragebogen", "Fragebogen anfordern")} />
        </div>

        <div className="m-dsec">
          <h3><Icon.clock /> Verlauf</h3>
          {activityTimeline}
        </div>
      </div>
    </div>
  );
  return (
    <div className="content">
      {tplModalEl}
      {stornoMailEl}
      <ConfirmDialog ask={ask} onClose={() => setAsk(null)} />
      <AutomationInfo info={autoInfo} onClose={() => setAutoInfo(null)} />
      <button className="cd-back" onClick={onBack}><Icon.arrowLeft /> Zurück zu Bestellungen</button>
      <div className="cd-hero">
        <div className="cd-ava">{initials(o.name)}</div>
        <div>
          <div className="cd-id">{o.name} <StatusBadge status={o.status} /> {!isPress && <PayBadge o={o} />}
            {o.status !== "storniert"
              ? <button className="stat-toggle danger" onClick={() => setStornoMail(true)}><Icon.ban /> Auftrag stornieren</button>
              : <button className="stat-toggle" onClick={() => setAsk({ title: "Auftrag aktivieren", message: "Auftrag " + o.id + " wieder aktivieren? Der Kunde erhält eine E-Mail, dass sein Auftrag wieder aktiv ist.", confirmLabel: "Aktivieren", onConfirm: () => onReactivate(o) })}><Icon.refresh /> Auftrag aktivieren</button>}
          </div>
          <div className="cd-sub">{o.company} · {o.id}</div>
          {o.source ? <div style={{ marginTop: 9 }}><SourceBadge source={o.source} big /></div> : null}
          <div className="cd-meta-row">
            <OrderTimer since={o.createdAt} status={o.status} now={now} seconds />
            <span className="m"><Icon.mail /> {o.email}</span>
            <span className="m"><Icon.phone /> {o.phone}</span>
            <span className="m"><Icon.globe /> {o.country}</span>
          </div>
          <div style={{ marginTop: 12 }}><AssignControl order={o} onAssign={onAssign} /></div>
        </div>
      </div>

      <div className={"cd-grid" + (isPress ? " cd-grid-1" : "")}>
        {/* MAIN COLUMN */}
        <div className="cd-col">
          {/* profile & service (Presse: zu prüfende Inhalte statt Google-Profil) */}
          <div className="panel">
            <div className="panel-head"><h2>{isPress ? "Auszulistende Inhalte" : "Profil & Leistung"}</h2></div>
            <div style={{ padding: "18px 22px" }}>
              {isPress ? <PressInfo o={o} /> : (
                <React.Fragment>
                  <div className="drow"><span className="dl">Google-Profil</span><span className="dv"><ProfileLinks o={o} /></span></div>
                  <div className="drow"><span className="dl">Bewertungen</span><span className="dv">{o.rating}★ · {o.reviews} Stück</span></div>
                  <div className="drow"><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
                  {o.protection && <div className="drow"><span className="dl">Schutz</span><span className="dv">{o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Tägliche Überwachung" : "Monatlich"}</span></div>}
                  <div className="drow"><span className="dl">E-Mail</span><span className="dv">{o.email}</span></div>
                </React.Fragment>
              )}
            </div>
          </div>
          {/* actions */}
          <div className="panel">
            <div className="panel-head"><h2>Aktionen</h2></div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div className="act-grp-l">Kommunikation</div>
                <div className="act-btns">
                  <button className="btn btn-sec btn-sm" onClick={() => onSms(o)}><Icon.message /> SMS senden</button>
                  <button className="btn btn-sec btn-sm" onClick={() => onCompose(o, TEMPLATES[0])}><Icon.mail /> E-Mail (frei)</button>
                  <a className="btn btn-sec btn-sm" href="#"><Icon.whatsapp /> WhatsApp</a>
                </div>
              </div>
              <div>
                {tpls === null ? <div style={{ fontSize: 13, color: "var(--fg-muted)", fontWeight: 600 }}>Vorlagen laden\u2026</div> : null}
                {tpls && tpls.length ? (
                  <React.Fragment>
                    {/* Schnellzugriff: am häufigsten verwendete Vorlagen */}
                    <div style={{ fontSize: 11, fontWeight: 800, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: ".04em", margin: "4px 0 6px" }}>Am häufigsten verwendet</div>
                    <div className="act-btns" style={{ marginBottom: 14 }}>
                      {topUsed.map((t) => renderTplBtn(t))}
                    </div>
                    {/* Kategorien als Buttons – Klick klappt die Vorlagen aus */}
                    <div className="chips">
                      {TPL_GROUP_ORDER.map((g) => {
                        const n = sendableTpls.filter((t) => t.group === g).length;
                        return n ? <button key={g} className="chipf" onClick={() => setOpenGroup(g)}>{g} <span className="ct">{n}</span></button> : null;
                      })}
                    </div>
                  </React.Fragment>
                ) : null}
              </div>
            </div>
          </div>

          {/* Fragebogen */}
          <div className="panel">
            <div className="panel-head"><h2>Fragebogen</h2></div>
            <div style={{ padding: "18px 22px" }}>
              <FragebogenBlock form={o.form} dach={o.lang === "de"} onRequest={() => sendReal("fragebogen", "Fragebogen anfordern")} />
            </div>
          </div>

          {/* status pipeline */}
          <div className="panel">
            <div className="panel-head"><h2>Status</h2><div className="ph-right">
              {curIdx < STATUS_FLOW.length - 1 && <button className="btn btn-pri btn-sm" onClick={() => onStatus(o, STATUS_FLOW[curIdx + 1].id)}><Icon.arrowRight /> {STATUS_FLOW[curIdx + 1].label}</button>}
            </div></div>
            <div style={{ padding: "18px 22px" }}>
              <div className="dpipe">
                {STATUS_FLOW.map((s, i) => {
                  const cls = i < curIdx ? "done" : i === curIdx ? "active" : "";
                  return (
                    <div className={"dpipe-step " + cls} key={s.id} onClick={() => onStatus(o, s.id)}>
                      {i < STATUS_FLOW.length - 1 && <div className="dpipe-rail"></div>}
                      <div className="dpipe-dot">{i < curIdx ? <Icon.check /> : i === curIdx ? <Icon.clock /> : i + 1}</div>
                      <div className="dpipe-body"><div className="pt">{s.label}{i === curIdx && <span className="now">JETZT</span>}</div><div className="pd">{s.desc}</div></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* tabs: activity / order / notes */}
          <div className="panel">
            <div className="panel-head" style={{ paddingBottom: 0, borderBottom: "none" }}>
              <div className="cd-tabs">
                {[["activity", "Verlauf"], ["order", "Bestelldetails"], ["notes", "Notizen"]].map(([id, label]) => (
                  <button key={id} className={"cd-tab" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: "20px 22px" }}>
              {mailPreview && (
                <div onClick={() => setMailPreview(null)} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(28,25,22,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                  <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, width: "min(700px, 96vw)", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 60px rgba(28,25,22,.35)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--hairline)" }}>
                      <Icon.mail size={16} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, color: "var(--fg-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>1:1 wie versendet</div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mailPreview.subject || (mailPreview.loading ? "Lädt…" : mailPreview.error ? "—" : "(kein Betreff)")}</div>
                      </div>
                      <button className="drawer-close" onClick={() => setMailPreview(null)}><Icon.x /></button>
                    </div>
                    {mailPreview.loading
                      ? <div style={{ padding: 28, color: "var(--fg-muted)", fontWeight: 600 }}>Lädt…</div>
                      : mailPreview.error
                        ? <div style={{ padding: 28, color: "var(--danger)", fontWeight: 600 }}>{mailPreview.error}</div>
                        : <iframe title="Mail-Vorschau" srcDoc={mailPreview.html} sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" style={{ width: "100%", height: "72vh", border: "none", background: "#fff" }} />}
                  </div>
                </div>
              )}
              {tab === "activity" && activityTimeline}
              {tab === "order" && (
                <div>
                  {isPress ? <PressInfo o={o} /> : (
                    <React.Fragment>
                      <div className="drow"><span className="dl">Google-Profil</span><span className="dv"><ProfileLinks o={o} /></span></div>
                      <div className="drow"><span className="dl">Bewertungen</span><span className="dv">{o.rating}★ · {o.reviews} Stück</span></div>
                      <div className="drow"><span className="dl">Leistung</span><span className="dv">{SERVICES[o.service].name}</span></div>
                      {o.protection && <div className="drow"><span className="dl">Schutz</span><span className="dv">{o.protection === "lifetime" ? "Lebenslang" : o.protection === "monitor" ? "+ Tägliche Überwachung" : "Monatlich"}</span></div>}
                    </React.Fragment>
                  )}
                  <div className="drow"><span className="dl">Bestelldatum</span><span className="dv">{o.created}</span></div>
                  <div className="drow"><span className="dl">Affiliate</span><span className="dv">{o.affiliate ? <b style={{ color: "var(--primary, #ff8000)" }}>{o.affiliate}</b> : <span style={{ color: "var(--fg-muted)" }}>— (kein Affiliate)</span>}</span></div>
                  <div className="drow"><span className="dl">Quelle</span><span className="dv">{o.source ? o.source.label : "—"}{o.utmContent ? <b style={{ marginLeft: 6 }}>{o.utmContent}</b> : null}</span></div>
            {o.sourceFirst && o.source && o.sourceFirst.kind !== o.source.kind
              ? <div className="drow"><span className="dl">Zuerst über</span><span className="dv">{o.sourceFirst.label}</span></div>
              : null}
                  <div className="drow"><span className="dl" style={{ fontWeight: 800, color: "var(--fg)" }}>Auftragswert</span><span className="dv" style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--primary)" }}>{o.amount ? money(total, o.country) : "kostenlose Prüfung"}</span></div>
                </div>
              )}
              {tab === "notes" && (
                <div>
                  <textarea className="notes-area" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interne Notiz zum Kunden…"></textarea>
                  <button className="btn btn-sec btn-sm" style={{ marginTop: 10 }} onClick={() => toast("Notiz gespeichert")}><Icon.check /> Notiz speichern</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="cd-col">
          {/* billing / stripe — bei Presse-Auslistung (kostenlose Prüfung) komplett ausgeblendet */}
          {!isPress && (
          <div className="dsec">
            <h3><Icon.lock /> Abrechnung <span className="right"><PayBadge o={o} /></span></h3>
              {o.paypal ? <div style={{ margin: "10px 0 0", background: "#e3effe", border: "1px solid #7fb2f0", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, fontWeight: 800, color: "#1c3a66", display: "flex", gap: 8, alignItems: "center", lineHeight: 1.35 }}><span aria-hidden="true">💳</span> Kunde möchte per PayPal zahlen → 10 % Rabatt gewähren{o.paypal && o.paypal !== "ja" ? " · " + o.paypal : ""}</div> : null}
            <div className="stripe-box" style={{ marginBottom: 12 }}>
              <span className="sb-logo">stripe</span>
              <span className="sb-card"><AI.creditCard /> <span className="dots">•••• 4242</span></span>
              <span className="sb-status">{o.pay === "paid" ? <span className="badge-st st-paid"><span className="d" style={{ background: "var(--success)" }}></span>Erfasst</span> : o.pay === "failed" ? <span className="badge-st st-refunded"><span className="d"></span>Abgelehnt</span> : <span className="badge-st st-pending"><span className="d"></span>Reserviert</span>}</span>
            </div>
            <div className="drow"><span className="dl">Rechnungsbetrag</span><span className="dv">{o.amount ? money(o.amount, o.country) : "—"}</span></div>
            {o.protection && o.protAmount ? <div className="drow"><span className="dl">Schutz</span><span className="dv">{money(o.protAmount, o.country)}{o.protection !== "lifetime" ? " /Mon." : ""}</span></div> : null}
            <div style={{ display: "flex", gap: 8, marginTop: 13, flexWrap: "wrap" }}>
              {o.pay !== "paid" && o.amount ? <button className="btn btn-pri btn-sm" onClick={() => sendOrderedPayLink(o, toast, onStatus, onPayLink)}><AI.send /> Zahlungslink senden</button> : null}
              {o.pay !== "paid" && o.amount ? <button className="btn btn-sec btn-sm" onClick={() => onPayLink(o)}><AI.creditCard /> Anderen Link wählen…</button> : null}
              {o.amount && o.pay !== "paid" ? <button className={"btn btn-sm " + (mahnStage >= 3 ? "btn-danger" : "btn-sec")} onClick={sendMahnung} title={usePaypalMahnung ? "Text-Mahnung – verweist auf den gesendeten PayPal-Link" : "Mahnung mit Stripe-Zahlungslink"}><Icon.mail /> {mahnBtnLabel}{usePaypalMahnung ? " (PayPal)" : ""}</button> : null}
              {o.pay !== "paid" && o.amount ? <button className="btn btn-sec btn-sm" onClick={() => onMarkPaid && onMarkPaid(o)}><Icon.checkCircle /> Als bezahlt markieren (z. B. PayPal)</button> : null}
              {o.pay === "paid" ? <button className="btn btn-sec btn-sm" onClick={() => onCorrectPay && onCorrectPay(o)}><Icon.refresh /> Zahlung korrigieren (nicht erhalten)</button> : null}
              {o.pay === "paid" ? <button className="btn btn-ghost btn-sm" onClick={() => toast("Rückerstattung eingeleitet")}><AI.refund /> Erstatten</button> : null}
            </div>
            <div style={{ marginTop: 14, borderTop: "1px solid var(--hairline)", paddingTop: 6 }}>
              {ex.payHist.map((p, i) => (
                <div className="payh" key={i}>
                  <span className={"ph-ic " + p.s}>{p.s === "ok" ? <Icon.check /> : p.s === "fail" ? <Icon.x /> : <Icon.clock />}</span>
                  <div><div style={{ fontWeight: 700 }}>{p.t}</div><div className="ph-meta">{p.meta}</div></div>
                  <span className="ph-amt">{p.amt}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Profil-Nachweis (Stand der Beauftragung) — bei Presse-Auslistung nicht relevant */}
          {!isPress && (
            <div className="dsec">
              <h3><Icon.shieldCheck /> Profil-Nachweis</h3>
              <ProfilNachweis o={o} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ---------- SMS modal ---------- */
function SmsModal({ order, onClose, toast }) {
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [linkBusy, setLinkBusy] = React.useState(false);
  React.useEffect(() => { if (order) setText("Hallo " + (order.name || "").split(" ")[0] + ", kurze Info zu Ihrer Bestellung " + order.id + ": "); }, [order]);
  if (!order) return <div className="modal-scrim"></div>;
  const o = order;
  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.message size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>SMS an {order.name}</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{order.phone}</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="sms-tpls" style={{ marginBottom: 10 }}>
            <button className="btn btn-ghost btn-sm" type="button" disabled={linkBusy}
              onClick={async () => {
                setLinkBusy(true);
                try {
                  const url = await fetchPayLinkUrl({
                    service: o.service, protection: o.protection || "none",
                    currency: o.country === "US" ? "usd" : "eur",
                    serviceAmount: o.amount || 0,
                    protAmount: (o.protection && o.protAmount) ? o.protAmount : 0,
                    protType: o.protection || "", express: !!o.express,
                  });
                  setText(payLinkSmsText(o, url));
                } catch (e) {
                  setText(payLinkSmsText(o, PAYLINK_PLACEHOLDER));
                  toast("Kein hinterlegter Stripe-Link — Vorlage eingefügt, Link bitte ersetzen.");
                } finally { setLinkBusy(false); }
              }}><AI.creditCard /> {linkBusy ? "Lädt…" : "Zahlungslink einfügen"}</button>
          </div>
          <div className="fld"><label>Nachricht ({text.length}/612)</label><textarea maxLength={612} style={{ minHeight: 100 }} value={text} onChange={(e) => setText(e.target.value)}></textarea></div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto" }}>Versand per SMS-Gateway</span>
          <button className="btn btn-sec" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-pri" disabled={busy || !text.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                await sendSms({ to: o.phone, message: text, orderId: o.id, country: o.country });
                toast("SMS an " + o.name + " gesendet ✓");
                onClose();
              } catch (e) { toast("SMS fehlgeschlagen: " + e.message); }
              finally { setBusy(false); }
            }}><AI.send /> {busy ? "Senden…" : "Senden"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Payment-link modal (alle AKTIVEN Stripe-Links zur Auswahl) ---------- */
function PayLinkModal({ order, onClose, toast, onStatus, mode }) {
  const storno = mode === "storno";
  const [links, setLinks] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [sel, setSel] = React.useState(null);
  const [curFilter, setCurFilter] = React.useState("eur");
  React.useEffect(() => {
    if (!order) return;
    setCurFilter(order.country === "US" ? "usd" : "eur");
    setSel(null); setLinks(null); setErr("");
    fetchPayLinks().then((l) => setLinks(l || [])).catch((e) => setErr(e.message || "Fehler"));
  }, [order]);
  if (!order) return <div className="modal-scrim"></div>;

  const fmtMoney = (minor, cur) => {
    const v = (minor || 0) / 100;
    return cur === "usd"
      ? "$" + v.toLocaleString("en-US", { minimumFractionDigits: v % 1 ? 2 : 0 })
      : v.toLocaleString("de-DE", { minimumFractionDigits: v % 1 ? 2 : 0 }) + " €";
  };
  const ivSuffix = (iv) => (iv === "month" ? "/Mon." : iv === "year" ? "/Jahr" : iv === "week" ? "/Wo." : "");
  // Bekannte Schutz-Stufen schöner benennen (Betrag + Intervall sind eindeutig).
  const tierName = (it) => {
    const v = (it.amount || 0) / 100;
    if (it.interval === "month" && v === 24.9) return "Monatlicher Schutz";
    if (it.interval === "month" && v === 69.9) return "Schutz + Tägliche Überwachung";
    if (it.interval === "year" && v === 245) return "Jahresschutz";
    if (it.interval === "once" && v === 990) return "Lebenslanger Schutz";
    return null;
  };
  const itemLabel = (it) => { const n = tierName(it); return (n ? n + " · " : "") + fmtMoney(it.amount, it.currency) + ivSuffix(it.interval); };
  const linkLabel = (l) => (l.items || []).map(itemLabel).join(" + ") || "(leerer Link)";
  const linkCur = (l) => (l.items && l.items[0] && l.items[0].currency) || "eur";
  const linkTotal = (l) => (l.items || []).reduce((s, it) => s + (it.amount || 0), 0) / 100;
  const shown = (links || []).filter((l) => curFilter === "all" || linkCur(l) === curFilter);
  const muted = { fontSize: 13, color: "var(--fg-muted)", fontWeight: 600, padding: "10px 2px" };

  const send = async () => {
    if (!sel) return;
    try {
      await sendPayLink({ to: order.email, name: order.name, orderId: order.id, currency: linkCur(sel), total: linkTotal(sel), protectionLabel: linkLabel(sel), lang: order.lang || "de", url: sel.url, celebrate: !storno });
      if (onStatus) onStatus(order, storno ? "storniert" : "done", true, true, storno ? undefined : { pay: "sent", noEvent: order.status === "done" }); // Storno-Link → storniert; sonst Zahlungslink erhalten → Profil gelöscht (nur 1×)
      onClose(); toast((storno ? "Storno-Link (" : "Zahlungslink (") + linkLabel(sel) + ") an " + order.name + " gesendet ✓");
    } catch (e) { toast((storno ? "Storno-Link" : "Zahlungslink") + " fehlgeschlagen: " + e.message); }
  };

  return (
    <div className="modal-scrim open" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--orange-50)", display: "flex", alignItems: "center", justifyContent: "center" }}><AI.creditCard size={19} style={{ color: "var(--primary)" }} /></span>
          <div><h3>{storno ? "Storno-Zahlungslink senden" : "Zahlungslink senden"}</h3><div style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 600 }}>{order.name} · {storno ? "Storno-Link wählen" : "aktive Stripe-Links"}</div></div>
          <button className="drawer-close" style={{ marginLeft: "auto" }} onClick={onClose}><Icon.x /></button>
        </div>
        <div className="modal-body">
          <div className="chips" style={{ marginBottom: 12 }}>
            {[["eur", "€ EUR"], ["usd", "$ USD"], ["all", "Alle"]].map(([k, lab]) => (
              <button key={k} className={"chipf" + (curFilter === k ? " on" : "")} onClick={() => setCurFilter(k)}>{lab}</button>
            ))}
          </div>
          {err ? <div style={muted}>Links nicht ladbar: {err}</div> : null}
          {links === null && !err ? <div style={muted}>Lade aktive Zahlungslinks…</div> : null}
          {links && !shown.length && !err ? <div style={muted}>Keine aktiven Links{curFilter !== "all" ? " in dieser Währung" : ""} gefunden.</div> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
            {shown.map((l) => (
              <button key={l.id} onClick={() => setSel(l)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 14px", border: "1px solid " + (sel && sel.id === l.id ? "var(--primary)" : "var(--hairline)"), borderRadius: "var(--r-md)", background: sel && sel.id === l.id ? "var(--orange-50)" : "var(--card)", cursor: "pointer", textAlign: "left", width: "100%" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{linkLabel(l)}</span>
                <span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 800, textTransform: "uppercase" }}>{linkCur(l)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontWeight: 700, marginRight: "auto", display: "flex", alignItems: "center", gap: 6 }}><Icon.lock size={14} /> Bestehender aktiver Link aus Stripe</span>
          <button className="btn btn-sec" onClick={onClose}>Abbrechen</button>
          <button className="btn btn-pri" disabled={!sel} onClick={send}><AI.send /> {storno ? "Storno-Link senden" : "Zahlungslink senden"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Root ---------- */
const TITLES = { dashboard: "Übersicht", orders: "Bestellungen", checks: "Geprüfte Profile", subs: "Abos & Umsatz", liga: "Löschungs-Liga", templates: "E-Mail-Vorlagen", customers: "Kunden", redirects: "Weiterleitungen" };

function AdminApp() {
  const [orders, setOrders] = React.useState([]);
  const [checks, setChecks] = React.useState([]);
  const [live, setLive] = React.useState(false);
  const [stripeCustomers, setStripeCustomers] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [view, setView] = React.useState(() => { try { return localStorage.getItem("rr_admin_view") || "dashboard"; } catch (e) { return "dashboard"; } });
  const [active, setActive] = React.useState(null); // order in drawer
  const [compose, setCompose] = React.useState(null); // {order, template}
  const [invoiceModal, setInvoiceModal] = React.useState(null);
  const [detail, setDetail] = React.useState(null); // full customer record
  const [smsOrder, setSmsOrder] = React.useState(null);
  const [payLinkOrder, setPayLinkOrder] = React.useState(null);
  const [stornoOrder, setStornoOrder] = React.useState(null);
  const [assignAsk, setAssignAsk] = React.useState(null); // Übernahme-Bestätigung (bereits zugewiesen)
  const [query, setQuery] = React.useState("");
  const [sideOpen, setSideOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState(null);
  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2600); };

  // Daten (neu) laden — von der Aktualisieren-Schaltfläche und beim Start.
  const reload = async ({ silent } = {}) => {
    if (!silent) setRefreshing(true);
    let data = null;
    try {
      data = await fetchAdminData();
      if (data) { setOrders(data.orders || []); setChecks(data.checks || []); setLive(!!data.db); }
    } catch (e) { /* ohne Backend bleibt es leer — keine Demo-Daten */ }
    try {
      const s = await fetchStripe();
      if (s && s.connected) setStripeCustomers(s.customersList || []);
    } catch (e) { /* Stripe optional */ }
    if (!silent) { setRefreshing(false); toast("Daten aktualisiert ✓"); }
    return data;
  };

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const data = await reload({ silent: true });
      if (alive && data) {
        // Deep-Link (Push/Mail) bzw. zuletzt geöffneten Kunden wieder aufschlagen.
        try {
          let targetId = null;
          try { targetId = new URLSearchParams(window.location.search).get("order"); } catch (e) {}
          const savedId = targetId || localStorage.getItem("rr_admin_detail");
          if (savedId) {
            const rec = (data.orders || []).find((x) => x.id === savedId) || (data.checks || []).find((x) => x.id === savedId);
            if (rec) setDetail(rec);
          }
          if (targetId) { try { const u = new URL(window.location.href); u.searchParams.delete("order"); window.history.replaceState(null, "", u); } catch (e) {} }
        } catch (e) {}
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigation über einen Browser-Reload hinweg merken: aktueller Bereich + offener Kunde.
  React.useEffect(() => { try { localStorage.setItem("rr_admin_view", view); } catch (e) {} }, [view]);
  React.useEffect(() => {
    try { if (detail && detail.id) localStorage.setItem("rr_admin_detail", detail.id); else localStorage.removeItem("rr_admin_detail"); } catch (e) {}
  }, [detail]);

  const counts = { new: orders.filter((o) => o.status === "new").length };
  const openOrder = (o) => setActive(o);
  const openDetail = (o) => { setDetail(o); setActive(null); window.scrollTo({ top: 0 }); };
  const setStatus = (o, id, silent, keepPay, patch) => {
    // patch.pay erlaubt einen expliziten Zahlungsstatus (z. B. "sent" = Zahlungslink gesandt,
    // "mahnung" = Mahnung gesandt) – wird über /admin/order-status dauerhaft gespeichert
    // und überlebt damit jeden Reload (unabhängig von Events/Zählern).
    const nextPay = (patch && patch.pay) ? patch.pay : ((!keepPay && id === "done" && o.pay === "pending") ? "paid" : o.pay);
    const upd = (x) => x && x.id === o.id ? { ...x, status: id, pay: nextPay } : x;
    setOrders((list) => list.map(upd));
    setActive(upd);
    setDetail(upd);
    const s = STATUS_FLOW.find((s) => s.id === id);
    const label = s ? s.label : id;
    // noEvent: nur Status/Zahlung speichern, KEINEN „Status → …"-Eintrag schreiben
    // (z. B. wenn der Auftrag schon „done" ist und nur der Zahlungsstatus via
    // Zahlungslink/Mahnung aktualisiert wird → „Profil gelöscht" nur 1×, nicht pro Sendung).
    const noEvent = !!(patch && patch.noEvent);
    // Dauerhaft im Backend speichern (bleibt bis zur nächsten Änderung).
    setOrderStatus({ orderId: o.id, status: id, pay: nextPay, label, noEvent }).catch((e) => toast("Status nicht gespeichert: " + e.message));
    if (!silent) toast(s ? "Status „" + label + "“ gesetzt" : "Status aktualisiert");
  };
  const assigneeName = (x) => x === "max" ? "Max" : x === "matthias" ? "Matthias" : x;
  // Bestellung Max/Matthias zuweisen (oder entfernen) — SERVER-AUTORITATIV: der Server kennt den
  // aktuellen Betreuer frisch aus der DB und meldet eine Übernahme als Konflikt zurück. So greift
  // die Rückfrage auch dann, wenn dieser Client noch nicht mitbekommen hat, dass bereits jemand
  // zugewiesen ist (früher prüfte der Client nur seine — evtl. veralteten — lokalen Daten).
  const doAssign = async (o, who, force) => {
    try {
      const res = await setOrderAssignee({ orderId: o.id, assignee: who, force: !!force });
      if (res && res.conflict) {
        // Bereits einem ANDEREN Betreuer zugewiesen → Übernahme erst bestätigen lassen.
        setAssignAsk({
          title: "Auftrag übernehmen?",
          message: "Dieser Auftrag ist bereits " + assigneeName(res.current) + " zugewiesen. Wirklich übernehmen?",
          confirmLabel: "Übernehmen",
          onConfirm: () => doAssign(o, who, true),
        });
        return;
      }
      const upd = (x) => x && x.id === o.id ? { ...x, assignee: who } : x;
      setOrders((list) => list.map(upd));
      setActive(upd); setDetail(upd);
      toast(who ? "Bestellung " + o.id + " → " + assigneeName(who) : "Zuweisung entfernt");
    } catch (e) { toast("Zuweisung nicht gespeichert: " + e.message); }
  };
  // Erstzuweisung (noch kein Betreuer) läuft ohne Rückfrage; bei bestehender Zuweisung eines
  // ANDEREN Betreuers meldet der Server einen Konflikt und doAssign zeigt das Pop-up.
  const setAssignee = (o, who) => doAssign(o, who, false);
  const goInvoice = (o) => { setInvoiceModal(o); };
  // „Auftrag stornieren" öffnet jetzt die Storno-Zahlungslink-Auswahl (stornoOrder);
  // als „storniert" markiert der Storno-Dialog die Bestellung nach dem Versand.
  // Gegenstück: Auftrag wieder aktiv setzen UND den Kunden per Mail informieren.
  // Fälschlich (automatisch) erfasste Zahlung korrigieren: pay → ausstehend + Auto-Zuordnung
  // serverseitig sperren. Danach erscheint wieder „Zahlungslink senden".
  const doCorrectPay = async (o) => {
    const upd = (x) => x && x.id === o.id ? { ...x, pay: "pending" } : x;
    setOrders((list) => list.map(upd)); setDetail(upd); setActive(upd);
    try {
      await correctOrderPayment({ orderId: o.id });
      toast("Zahlung von " + o.name + " als unbezahlt markiert · Zahlungslink wieder möglich ✓");
    } catch (e) {
      const back = (x) => x && x.id === o.id ? { ...x, pay: "paid" } : x;
      setOrders((list) => list.map(back)); setDetail(back); setActive(back);
      toast("Korrektur fehlgeschlagen: " + e.message);
    }
  };
  // Zahlung MANUELL als eingegangen erfassen (z. B. PayPal/Überweisung außerhalb Stripe) →
  // pay = 'paid', Status bleibt. Sonst bliebe der Auftrag ewig „offen". Reversibel über
  // „Zahlung korrigieren". Optimistisch, mit Rollback auf den vorherigen Zahlungsstatus.
  const doMarkPaid = async (o) => {
    const prevPay = o.pay;
    const upd = (x) => x && x.id === o.id ? { ...x, pay: "paid" } : x;
    setOrders((list) => list.map(upd)); setDetail(upd); setActive(upd);
    try {
      await markOrderPaid({ orderId: o.id });
      toast("Zahlung von " + o.name + " manuell erfasst ✓");
    } catch (e) {
      const back = (x) => x && x.id === o.id ? { ...x, pay: prevPay } : x;
      setOrders((list) => list.map(back)); setDetail(back); setActive(back);
      toast("Als bezahlt markieren fehlgeschlagen: " + e.message);
    }
  };
  const doReactivate = async (o) => {
    const upd = (x) => x && x.id === o.id ? { ...x, status: "progress", pay: "pending" } : x;
    setOrders((list) => list.map(upd));
    setDetail(upd);
    setActive(upd);
    setOrderStatus({ orderId: o.id, status: "progress", pay: "pending", label: "In Bearbeitung" }).catch((e) => toast("Status nicht gespeichert: " + e.message));
    try {
      await sendTemplate({ key: "reaktivierung", to: o.email, orderId: o.id, lang: o.lang || "de" });
      toast("Auftrag " + o.id + " wieder aktiv · Kunde per Mail informiert ✓");
    } catch (e) {
      toast("Auftrag aktiviert, aber E-Mail fehlgeschlagen: " + e.message);
    }
  };

  let body;
  if (detail) body = <CustomerDetail order={detail} onBack={() => setDetail(null)} onStatus={setStatus} onCompose={(o, t) => setCompose({ order: o, template: t })} onInvoice={(o) => setInvoiceModal(o)} onSms={(o) => setSmsOrder(o)} onPayLink={(o) => setPayLinkOrder(o)} onStorno={(o) => setStornoOrder(o)} onReactivate={doReactivate} onCorrectPay={doCorrectPay} onMarkPaid={doMarkPaid} onAssign={setAssignee} toast={toast} />;
  else if (view === "orders") body = <Orders orders={orders} openOrder={openDetail} query={query} />;
  else if (view === "checks") body = <ChecksView checks={checks} orders={orders} openOrder={openDetail} toast={toast} />;
  else if (view === "subs") body = <SubsDashboard toast={toast} />;
  else if (view === "liga") body = <GamifyLiga />;
  else if (view === "templates") body = <Templates toast={toast} />;
  else if (view === "customers") body = <Customers customers={stripeCustomers} query={query} />;
  else if (view === "redirects") body = <RedirectsDashboard toast={toast} />;
  else body = <Dashboard orders={orders} checks={checks} openOrder={openDetail} openCheck={openDetail} onOpenChecks={() => setView("checks")} />;

  return (
    <div className="adm">
      <Sidebar view={view} setView={(v) => { setView(v); setDetail(null); setSideOpen(false); }} counts={counts} open={sideOpen} live={live} />
      <div className="main">
        <Topbar title={TITLES[view]} onBurger={() => setSideOpen((o) => !o)} query={query} setQuery={setQuery} toast={toast} onRefresh={() => reload()} refreshing={refreshing} />
        {body}
        {view === "dashboard" && !detail ? <DangerZone toast={toast} onDone={() => reload()} /> : null}
      </div>
      <MobileTabBar view={view} setView={(v) => { setView(v); setDetail(null); setSideOpen(false); }} counts={counts} />
      <OrderDrawer order={active} onClose={() => setActive(null)} onStatus={setStatus} onOpenFull={openDetail}
        onCompose={(o, t) => setCompose({ order: o, template: t })} onAssign={setAssignee} onPayLink={(o) => setPayLinkOrder(o)} toast={toast} />
      <EmailComposer data={compose} onClose={() => setCompose(null)} toast={toast} />
      <InvoiceModal order={invoiceModal} onClose={() => setInvoiceModal(null)} onCompose={(o, t) => setCompose({ order: o, template: t })} toast={toast} />
      <SmsModal order={smsOrder} onClose={() => setSmsOrder(null)} toast={toast} />
      <PayLinkModal order={payLinkOrder} onClose={() => setPayLinkOrder(null)} toast={toast} onStatus={setStatus} />
      <PayLinkModal order={stornoOrder} mode="storno" onClose={() => setStornoOrder(null)} toast={toast} onStatus={setStatus} />
      <ConfirmDialog ask={assignAsk} onClose={() => setAssignAsk(null)} />
      <div className={"toast" + (toastMsg ? " show" : "")}><Icon.checkCircle />{toastMsg}</div>
    </div>
  );
}

export { AdminApp };
