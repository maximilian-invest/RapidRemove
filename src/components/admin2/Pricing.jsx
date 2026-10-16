"use client";
/* Mehr → Kunden & Preise (10/2026, Schritt-für-Schritt seit 16.10.2026)
   - Kunden-Dashboard anlegen: eigener Ablauf, eine Frage pro Seite (Kunde → Sprache → Passwort → Partner →
     Preise Kunde → Preise Partner → Prüfen). Danach Zugangsdaten zum Kopieren.
   - Kunde bearbeiten: Übersicht, jeder Punkt öffnet seine eigene Seite mit „Speichern".
   - je Kunde: fester Partner (nur Bewertungen), eigene Kunden-Staffel + Software-Preis, eigene Partner-Staffel (USD)
     + Partner-Software-Preis. Kunde sieht nur seine Preise, Partner nur seine.
   - Standard-Staffel (Bulk für alle ohne eigene Preise) + Toleranz, Schalter „Neue Bestellung" im Dashboard. */
import React from "react";
import { ArrowLeft, Plus, Trash2, ChevronRight, Send, ExternalLink, UserPlus, Copy, RefreshCw, Users, Handshake, Lock, Globe, Tag, StickyNote, Percent, Check } from "lucide-react";
import { pricingInfo, pricingDefault, pricingCustomer, pricingNewOrder, pricingInvite, custImpersonate } from "@/lib/admin-api";
import { useHistState } from "./navHistory";
import { StepPage, Choice, SumRow, useFlowMode } from "./Steps";

const sym = (cur) => (cur === "usd" ? "$" : "€");
const LANGS = [["en", "Englisch", "GB"], ["de", "Deutsch", "DE"], ["es", "Spanisch", "ES"], ["fr", "Französisch", "FR"], ["it", "Italienisch", "IT"], ["nl", "Niederländisch", "NL"], ["pt", "Portugiesisch", "PT"], ["sv", "Schwedisch", "SE"], ["da", "Dänisch", "DK"], ["no", "Norwegisch", "NO"], ["ja", "Japanisch", "JP"]];
const langName = (k) => (LANGS.find((x) => x[0] === k) || [k, k])[1];
const FLAG = (cc) => String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)));
const SVC = { std: "neue", old: "alte", sw: "Software" };
const REV = ["std", "old", "sw"];
const DASH = "rapid-remove.com/my-reviews";
const EMAIL_OK = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || "").trim());

/* Stufen „ab N Bewertungen → Preis" (14.10.2026). Unter der ersten Stufe: normale Preise. Altformat { upTo } wird umgerechnet. */
const asFrom = (tiers) => {
  if (!tiers || !tiers.length) return [];
  if (tiers[0].from != null) return tiers;
  return tiers.map((t, i, a) => ({ from: i === 0 ? 1 : a[i - 1].upTo + 1, price: t.price }));
};
const toRows = (tiers) => (tiers && tiers.length ? asFrom(tiers).map((t) => ({ from: String(t.from), price: String(t.price) })) : [{ from: "50", price: "" }, { from: "100", price: "" }]);
const nOf = (v) => { const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : NaN; };
const filled = (rows) => rows.filter((r) => String(r.from).trim() || String(r.price).trim());
/** gültige, sortierte Staffel aus den Eingabezeilen – oder null */
const rowsTiers = (rows) => {
  const t = filled(rows).map((x) => ({ from: nOf(x.from), price: nOf(x.price) }));
  if (!t.length || !t.every((x) => x.price > 0 && Number.isInteger(x.from) && x.from >= 1)) return null;
  const s = [...t].sort((a, b) => a.from - b.from);
  return s.every((x, i) => i === 0 || x.from > s[i - 1].from) ? s : null;
};
const tierAt = (tiers, n) => { let p = null; for (const t of asFrom(tiers)) if (n >= t.from) p = t.price; return p; };
const swOk = (v) => !String(v || "").trim() || nOf(v) > 0;
const range = (tiers, cur) => { const ps = (tiers || []).map((t) => t.price); return ps.length ? (Math.max(...ps) === Math.min(...ps) ? `${sym(cur)}${ps[0]}` : `${sym(cur)}${Math.max(...ps)}–${Math.min(...ps)}`) : ""; };
const dt = (v) => (v ? new Date(v).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "");
const genPw = () => {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const r = new Uint32Array(12);
  try { window.crypto.getRandomValues(r); } catch (e) { r.forEach((_, i) => { r[i] = Math.floor(Math.random() * 1e9); }); }
  return Array.from(r, (x) => a[x % a.length]).join("");
};
const copy = (txt, toast, msg) => { try { navigator.clipboard.writeText(txt); toast(msg || "Kopiert"); } catch (e) { toast("Kopieren nicht möglich"); } };

/* Staffel als kurze Liste „ab 50 → $45" */
function TierLines({ tiers, cur, sw }) {
  const t = asFrom(tiers);
  if (!t.length && !(sw > 0)) return null;
  return (
    <span className="aw-tl">
      {t.length && t[0].from > 1 ? <i>unter {t[0].from}: normale Preise</i> : null}
      {t.map((x, k) => <i key={k}>ab {x.from}: <b>{sym(cur)}{x.price}</b></i>)}
      {sw > 0 ? <i>Software: <b>{sym(cur)}{sw}</b></i> : null}
    </span>
  );
}

/* Staffel-Editor: Zeilen „ab N Bewertungen → Preis". Unter der ersten Stufe gelten die normalen Preise. */
function TierEditor({ rows, setRows, cur }) {
  const set = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const first = Math.min(...rows.map((r) => nOf(r.from)).filter((n) => n >= 1));
  return (
    <div className="pr-tiers">
      <div className="pr-row aw-th"><span className="pr-lab">Ab Anzahl Bewertungen</span><span className="pr-p">Preis je Löschung</span><span className="pr-sp" /></div>
      {Number.isFinite(first) && first > 1 ? <div className="pr-row pr-below"><span className="pr-lab">unter {first}</span><span className="pr-p pr-norm">normale Preise</span><span className="pr-sp" /></div> : null}
      {rows.map((r, i) => (
        <div key={i} className="pr-row">
          <span className="pr-lab">ab <input className="po-num" inputMode="numeric" aria-label="ab Anzahl" value={r.from} onChange={(e) => set(i, "from", e.target.value.replace(/[^\d]/g, ""))} /></span>
          <span className="pr-p">{sym(cur)} <input className="po-num" inputMode="decimal" placeholder="Preis" aria-label="Preis" value={r.price} onChange={(e) => set(i, "price", e.target.value.replace(/[^\d.,]/g, ""))} /></span>
          {rows.length > 1 ? <button type="button" className="circ" aria-label="Stufe entfernen" onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 /></button> : <span className="pr-sp" />}
        </div>
      ))}
      {rows.length < 10 ? <button type="button" className="pr-add" onClick={() => setRows([...rows, { from: "", price: "" }])}><Plus />Stufe hinzufügen</button> : null}
    </div>
  );
}
function SwRow({ value, set, cur }) {
  return (
    <div className="pr-row pr-swr">
      <span className="pr-lab">Spezialfall (Software)</span>
      <span className="pr-p">{sym(cur)} <input className="po-num" inputMode="decimal" placeholder="–" aria-label="Software-Preis" value={value} onChange={(e) => set(e.target.value.replace(/[^\d.,]/g, ""))} /></span>
      <span className="pr-sp" />
    </div>
  );
}
function CurSeg({ cur, setCur }) {
  return <div className="pr-seg">{[["usd", "$ Dollar"], ["eur", "€ Euro"]].map(([k, l]) => <button key={k} type="button" className={cur === k ? "on" : ""} onClick={() => setCur(k)}>{l}</button>)}</div>;
}
function ToggleRow({ on, set, title, sub }) {
  return (
    <div className="info">
      <button type="button" className="ir" onClick={() => set(!on)}>
        <span className="t"><b style={{ whiteSpace: "normal" }}>{title}</b><span style={{ whiteSpace: "normal" }}>{sub}</span></span>
        <span className={"tg" + (on ? " on" : "")}><i /></span>
      </button>
    </div>
  );
}

/* Marge je Stufe (nur USD, beide Staffeln gesetzt) – nur für dich im Admin. */
function Margin({ ct, pt, csw, psw }) {
  if (!ct || !pt) return null;
  const pts = [...new Set([...ct.map((t) => t.from), ...pt.map((t) => t.from)])].sort((a, b) => a - b);
  const rows = [];
  if (pts[0] > 1) rows.push({ label: `unter ${pts[0]}`, c: null, p: null });
  pts.forEach((f, i) => { const nx = pts[i + 1]; rows.push({ label: nx ? `${f}–${nx - 1}` : `ab ${f}`, c: tierAt(ct, f), p: tierAt(pt, f) }); });
  const m = (v) => (v == null ? "normal" : "$" + v);
  return (
    <div className="pr-mg">
      <div className="pr-mh"><span>Menge</span><span>Kunde</span><span>Partner</span><span>Marge</span></div>
      {rows.map((r, i) => <div key={i} className="pr-mr"><span>{r.label}</span><span>{m(r.c)}</span><span>{m(r.p)}</span><b>{r.c != null && r.p != null ? "$" + Math.round((r.c - r.p) * 100) / 100 : "–"}</b></div>)}
      {csw > 0 && psw > 0 ? <div className="pr-mr"><span>Software</span><span>${csw}</span><span>${psw}</span><b>${Math.round((csw - psw) * 100) / 100}</b></div> : null}
    </div>
  );
}

/* ---------------- Kunde: Formular-Stand ---------------- */
function formOf(c, def) {
  const defT = def && def.tiers && def.tiers.length ? def.tiers : null;
  const pt = c && c.partner && c.partner.tiers;
  return {
    email: c ? c.email : "", name: (c && c.name) || "", company: (c && c.company) || "", lang: (c && c.lang) || "en",
    pw: c ? c.password || "" : genPw(), pwLock: c ? (c.password ? !!c.pwLocked : true) : true,
    pid: c && c.partnerId ? String(c.partnerId) : "",
    own: c ? !!c.tiers : !defT,
    cur: (c && c.cur) || (def && def.cur) || "usd",
    rows: toRows((c && c.tiers) || defT),
    sw: c ? (c.sw ? String(c.sw) : "") : def && def.sw ? String(def.sw) : "",
    pOwn: !!(pt || (c && c.partner && c.partner.sw)),
    pRows: toRows(pt || (def && def.partner && def.partner.tiers)),
    pSw: c ? (c.partner && c.partner.sw ? String(c.partner.sw) : "") : def && def.partner && def.partner.sw ? String(def.partner.sw) : "",
    note: (c && c.note) || "", invite: true,
  };
}
function payloadOf(f, init) {
  const pt = f.pOwn && filled(f.pRows).length ? rowsTiers(f.pRows) : null;
  const pw = f.pw.trim();
  const pwChanged = pw !== ((init && init.password) || "");
  return {
    email: f.email.trim().toLowerCase(), name: f.name.trim(), company: f.company.trim(), lang: f.lang, partnerId: f.pid || null,
    tiers: f.own ? rowsTiers(f.rows) : null, cur: f.own ? f.cur : null, sw: f.own && f.sw.trim() ? f.sw.trim().replace(",", ".") : null,
    partnerTiers: pt, partnerSw: f.pOwn && f.pSw.trim() ? f.pSw.trim().replace(",", ".") : null, note: f.note.trim(),
    ...(pwChanged && pw ? { password: pw } : {}), ...(pw || (init && init.password) ? { pwLocked: f.pwLock } : {}),
  };
}

/* ---------------- Kunde: einzelne Seiten ---------------- */
function useCustomerPages({ f, set, d, isNew }) {
  const def = d.def;
  const defT = def && def.tiers && def.tiers.length ? def.tiers : null;
  const defPT = def && def.partner && def.partner.tiers && def.partner.tiers.length ? def.partner.tiers : null;
  const partners = d.partners || [];
  const first = f.name.trim().split(/\s+/)[0] || "den Kunden";
  const exists = isNew && EMAIL_OK(f.email) ? (d.customers || []).find((c) => c.email === f.email.trim().toLowerCase()) : null;
  const revP = partners.filter((p) => p.services.some((s) => REV.includes(s)) || String(p.id) === f.pid);
  const p = partners.find((x) => String(x.id) === f.pid);
  const ct = f.own ? rowsTiers(f.rows) : defT;
  const ccur = f.own ? f.cur : (def && def.cur) || "usd";
  const csw = f.own ? nOf(f.sw) : def ? def.sw : null;
  const pt = f.pOwn ? (filled(f.pRows).length ? rowsTiers(f.pRows) : null) : f.own ? null : defPT;
  const psw = f.pOwn ? nOf(f.pSw) : f.own ? null : def && def.partner ? def.partner.sw : null;
  const pOwnOk = (filled(f.pRows).length ? !!rowsTiers(f.pRows) : nOf(f.pSw) > 0) && swOk(f.pSw);

  const pages = {
    who: {
      title: "Wer ist der Kunde?", sub: "Die E-Mail ist gleichzeitig sein Login fürs Dashboard.",
      ok: EMAIL_OK(f.email) && f.name.trim().length > 1 && !exists,
      body: (
        <div className="awf">
          <label className="pfld"><span>E-Mail</span>
            <input type="email" value={f.email} readOnly={!isNew} onChange={(e) => set({ email: e.target.value })} placeholder="kunde@firma.com" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="email" autoFocus={isNew} />
          </label>
          {exists ? <p className="aw-warn">Für diese E-Mail gibt es schon ein Dashboard ({exists.company || exists.name || exists.email}). Bearbeite es in der Liste.</p> : null}
          {!isNew ? <p className="aw-hint">Die E-Mail lässt sich nicht ändern – sie ist der Login.</p> : null}
          <label className="pfld"><span>Name</span><input value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="z. B. Rumaan Robe" /></label>
          <label className="pfld"><span>Firma <em>optional</em></span><input value={f.company} onChange={(e) => set({ company: e.target.value })} placeholder="z. B. Robe Holdings" /></label>
        </div>
      ),
      sum: <><b>{f.name || "–"}{f.company ? " · " + f.company : ""}</b><em>{f.email}</em></>,
    },
    lang: {
      title: "In welcher Sprache?", sub: "Für sein Dashboard und alle Mails an ihn.", ok: true,
      body: (
        <div className="awg">
          {LANGS.map(([k, l, cc]) => <Choice key={k} on={f.lang === k} onClick={() => set({ lang: k })} title={l} icon={<span className="fl">{FLAG(cc)}</span>} />)}
        </div>
      ),
      sum: <b>{langName(f.lang)}</b>,
    },
    pw: {
      title: "Passwort fürs Dashboard", sub: isNew ? "Haben wir schon erzeugt. Du kannst es auch selbst eintippen." : "Du siehst es hier immer – damit kommst du jederzeit in sein Dashboard.",
      ok: f.pw.trim().length >= 8 || (!isNew && !f.pw.trim()),
      body: (
        <>
          <div className="awpw">
            <input value={f.pw} onChange={(e) => set({ pw: e.target.value })} placeholder="mind. 8 Zeichen" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-label="Passwort" />
            <div className="ctas2">
              <button type="button" className="cta gh" onClick={() => set({ pw: genPw() })}><RefreshCw />Neu erzeugen</button>
              <button type="button" className="cta gh" disabled={!f.pw.trim()} onClick={() => copy(f.pw.trim(), d.toast, "Passwort kopiert")}><Copy />Kopieren</button>
            </div>
          </div>
          {f.pw.trim() && f.pw.trim().length < 8 ? <p className="aw-warn">Mindestens 8 Zeichen.</p> : null}
          {!isNew && !f.pw.trim() ? <p className="aw-hint">Noch keins festgelegt – der Kunde hat ein eigenes. Erzeuge eins, wenn du es festlegen willst.</p> : null}
          {f.pw.trim() ? <ToggleRow on={f.pwLock} set={(v) => set({ pwLock: v })} title="Kunde darf es nicht ändern" sub={f.pwLock ? "Empfohlen. „Passwort vergessen“ schickt ihm dann einen Login-Link." : "Er kann es selbst ändern – dann siehst du es hier nicht mehr."} /> : null}
        </>
      ),
      sum: f.pw.trim() ? <><b className="mono">{f.pw.trim()}</b><em>{f.pwLock ? "Kunde kann es nicht ändern" : "Kunde kann es ändern"}</em></> : <b>Eigenes vom Kunden</b>,
    },
    partner: {
      title: "Wer löscht seine Bewertungen?", sub: "Alle Bewertungen dieses Kunden gehen automatisch an diesen Partner.", ok: true,
      body: (
        <>
          <div className="awo">
            <Choice on={!f.pid} onClick={() => set({ pid: "" })} icon={<Users />} title="Normale Zuteilung" sub="Wie unter Partner → Zuteilung eingestellt" />
            {revP.map((x) => (
              <Choice key={x.id} on={f.pid === String(x.id)} onClick={() => set({ pid: String(x.id) })} icon={<Handshake />} title={x.name}
                sub={(REV.filter((k) => x.services.includes(k)).map((k) => SVC[k]).join(" · ") || "macht keine Bewertungen") + (x.active ? "" : " · gerade inaktiv")} />
            ))}
          </div>
          {p && !p.active ? <p className="aw-warn">{p.name} ist gerade inaktiv – solange gilt die normale Zuteilung.</p> : null}
          {p && REV.some((k) => !p.services.includes(k)) ? <p className="aw-hint">Was {p.name} nicht macht ({REV.filter((k) => !p.services.includes(k)).map((k) => SVC[k]).join(", ")}), geht an die normale Zuteilung.</p> : null}
          <p className="aw-hint">Profil-Löschungen machen wir selbst – die gehen nie an diesen Partner.</p>
        </>
      ),
      sum: <b>{p ? p.name : "Normale Zuteilung"}</b>,
    },
    cprice: {
      title: "Was zahlt der Kunde?", sub: "Preis je gelöschter Bewertung – das sieht der Kunde.", ok: f.own || !!defT,
      body: (
        <div className="awo">
          <Choice on={!f.own} disabled={!defT} onClick={() => set({ own: false })} icon={<Tag />} title="Standard-Staffel" sub={defT ? "Wie alle anderen Kunden" : "Noch keine Standard-Staffel festgelegt"}>
            {defT ? <TierLines tiers={defT} cur={def.cur} sw={def.sw} /> : null}
          </Choice>
          <Choice on={f.own} onClick={() => set({ own: true })} icon={<Percent />} title="Eigene Preise" sub="Nur für diesen Kunden – legst du im nächsten Schritt fest" />
        </div>
      ),
      sum: f.own ? (ct ? <TierLines tiers={ct} cur={f.cur} sw={nOf(f.sw)} /> : <b>–</b>) : <b>Standard-Staffel</b>,
    },
    cown: {
      title: `Preise für ${first}`, sub: "Ab wie vielen Bewertungen welcher Preis gilt. Darunter gelten die normalen Preise.",
      ok: !!rowsTiers(f.rows) && swOk(f.sw),
      body: (
        <div className="card pr-card">
          <CurSeg cur={f.cur} setCur={(v) => set({ cur: v })} />
          <TierEditor rows={f.rows} setRows={(v) => set({ rows: v })} cur={f.cur} />
          <SwRow value={f.sw} set={(v) => set({ sw: v })} cur={f.cur} />
          {filled(f.rows).length && !rowsTiers(f.rows) ? <p className="aw-warn" style={{ marginTop: 10 }}>Jede Stufe braucht eine Anzahl und einen Preis – keine Anzahl doppelt.</p> : null}
        </div>
      ),
    },
    pprice: {
      title: "Was bekommt der Partner?", sub: "Sieht nur der Partner – nie der Kunde.", ok: true,
      body: (
        <div className="awo">
          {f.own ? (
            <Choice on={!f.pOwn} onClick={() => set({ pOwn: false })} icon={<Tag />} title="Normaler Partnerpreis" sub="Sein freigegebener Preis je Leistung" />
          ) : (
            <Choice on={!f.pOwn} onClick={() => set({ pOwn: false })} icon={<Tag />} title="Standard-Partner-Staffel" sub={defPT ? "Wie bei allen Kunden mit Standard-Staffel" : "Noch keine festgelegt – dann sein normaler Preis je Leistung"}>
              {defPT ? <TierLines tiers={defPT} cur="usd" sw={def.partner.sw} /> : null}
            </Choice>
          )}
          <Choice on={f.pOwn} onClick={() => set({ pOwn: true })} icon={<Percent />} title="Eigene Partner-Preise" sub="Nur für die Bewertungen dieses Kunden – nächster Schritt" />
        </div>
      ),
      sum: f.pOwn ? <TierLines tiers={pt || []} cur="usd" sw={nOf(f.pSw)} /> : <b>{f.own ? "Normaler Partnerpreis" : "Standard-Partner-Staffel"}</b>,
    },
    pown: {
      title: "Partner-Preise (USD)", sub: "Je gelöschter Bewertung. Die Stufe richtet sich nach derselben Anzahl wie beim Kunden.",
      ok: pOwnOk,
      body: (
        <>
          <div className="card pr-card">
            <TierEditor rows={f.pRows} setRows={(v) => set({ pRows: v })} cur="usd" />
            <SwRow value={f.pSw} set={(v) => set({ pSw: v })} cur="usd" />
            {filled(f.pRows).length && !rowsTiers(f.pRows) ? <p className="aw-warn" style={{ marginTop: 10 }}>Jede Stufe braucht eine Anzahl und einen Preis – keine Anzahl doppelt.</p> : null}
          </div>
          {ccur === "usd" && ct && pt ? <><div className="aw-lab">Deine Marge</div><Margin ct={ct} pt={pt} csw={csw} psw={psw} /></> : null}
        </>
      ),
    },
    note: {
      title: "Interne Notiz", sub: "Sieht nur du – z. B. was vereinbart wurde.", ok: true,
      body: <label className="pfld awf"><textarea rows={4} value={f.note} onChange={(e) => set({ note: e.target.value })} placeholder="z. B. Vereinbarung per Mail vom 15.10." autoFocus /></label>,
      sum: f.note.trim() ? <b style={{ whiteSpace: "normal" }}>{f.note.trim()}</b> : <b className="mute">keine</b>,
    },
  };
  return { pages, ct, pt, exists };
}

/* ---------------- Kunde anlegen (Ablauf) ---------------- */
function NewCustomer({ ctx, d, step, go, close, reload }) {
  useFlowMode(ctx);
  const { toast } = ctx;
  const [f, setF] = React.useState(() => formOf(null, d.def));
  const [busy, setBusy] = React.useState(false);
  const [res, setRes] = React.useState(null);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const { pages } = useCustomerPages({ f, set, d: { ...d, toast }, isNew: true });
  const keys = ["who", "lang", "pw", "partner", "cprice", ...(f.own ? ["cown"] : []), "pprice", ...(f.pOwn ? ["pown"] : []), "sum"];
  const k = step === "done" && !res ? "sum" : step && (keys.includes(step) || step === "done") ? step : "who";
  const i = keys.indexOf(k);

  const create = async () => {
    setBusy(true);
    try {
      const j = await pricingCustomer({ ...payloadOf(f, null), create: true, invite: f.invite });
      setRes({ invited: !!j.invited });
      reload();
      go("done", { replace: true });
    } catch (e) {
      // Dashboard ist angelegt, nur die Mail ging nicht raus → trotzdem „Fertig"-Seite mit Zugangsdaten
      if (/^Gespeichert \+ Konto angelegt/.test(e.message || "")) { setRes({ invited: false, mailErr: true }); reload(); go("done", { replace: true }); }
      else toast("Fehler: " + e.message);
    }
    setBusy(false);
  };
  const openDash = async () => {
    const w = window.open("", "_blank");
    try { const j = await custImpersonate(f.email.trim().toLowerCase()); if (w) w.location.href = j.url; else window.location.href = j.url; }
    catch (e) { if (w) w.close(); toast("Fehler: " + e.message); }
  };

  if (k === "done") {
    const login = `Login: https://${DASH}\nE-Mail: ${f.email.trim().toLowerCase()}\nPasswort: ${f.pw.trim()}`;
    return (
      <div className="naflow aw">
        <div className="nadone aw-done">
          <span className="okc"><Check /></span>
          <h1>Dashboard ist angelegt</h1>
          <p>{f.company.trim() || f.name.trim()}</p>
        </div>
        <div className="nasum aw-sum" style={{ marginTop: 26 }}>
          <div className="aws st"><span className="l">Login</span><span className="v"><b>{DASH}</b></span></div>
          <div className="aws st"><span className="l">E-Mail</span><span className="v"><b>{f.email.trim().toLowerCase()}</b></span></div>
          <div className="aws st"><span className="l">Passwort</span><span className="v"><b className="mono">{f.pw.trim()}</b></span></div>
        </div>
        <p className="aw-hint" style={{ textAlign: "center" }}>{res && res.invited ? `Login-Link ist per Mail an ${f.email.trim()} raus.` : res && res.mailErr ? "Die Mail mit dem Login-Link ging leider nicht raus – schick ihm die Zugangsdaten selbst oder sende den Link später beim Kunden." : "Keine Mail gesendet – den Login-Link kannst du beim Kunden jederzeit senden."}</p>
        <div className="nastick">
          <div className="ctas2" style={{ marginBottom: 10 }}>
            <button type="button" className="cta gh" onClick={() => copy(login, toast, "Zugangsdaten kopiert")}><Copy />Zugangsdaten kopieren</button>
            <button type="button" className="cta gh" onClick={openDash}><ExternalLink />Dashboard öffnen</button>
          </div>
          <button type="button" className="cta" onClick={close}>Fertig</button>
        </div>
      </div>
    );
  }

  if (k === "sum") {
    const jump = (s) => go(s);
    return (
      <StepPage i={i} n={keys.length} onBack={() => go(keys[i - 1])} title="Alles korrekt?" sub="Tippe auf einen Punkt, um ihn zu ändern."
        next={create} nextLabel={busy ? "Wird angelegt …" : "Dashboard anlegen"} final busy={busy}>
        <div className="nasum aw-sum">
          <SumRow label="Kunde" value={pages.who.sum} onClick={() => jump("who")} />
          <SumRow label="Sprache" value={pages.lang.sum} onClick={() => jump("lang")} />
          <SumRow label="Passwort" value={pages.pw.sum} onClick={() => jump("pw")} />
          <SumRow label="Partner" value={pages.partner.sum} onClick={() => jump("partner")} />
          <SumRow label="Preise Kunde" value={pages.cprice.sum} onClick={() => jump(f.own ? "cown" : "cprice")} />
          <SumRow label="Preise Partner" value={pages.pprice.sum} onClick={() => jump(f.pOwn ? "pown" : "pprice")} />
        </div>
        <label className="pfld" style={{ marginTop: 14 }}><span>Interne Notiz <em>optional</em></span><input value={f.note} onChange={(e) => set({ note: e.target.value })} placeholder="z. B. Vereinbarung vom 15.10." /></label>
        <ToggleRow on={f.invite} set={(v) => set({ invite: v })} title="Login-Link gleich per Mail senden" sub={f.invite ? "Kunde bekommt „Ihr persönliches Dashboard ist da“ mit Ein-Klick-Login" : "Aus – du schickst ihn später"} />
      </StepPage>
    );
  }

  const pg = pages[k];
  return (
    <StepPage i={i} n={keys.length} closeIcon={i === 0} onBack={() => (i === 0 ? close() : go(keys[i - 1]))} title={pg.title} sub={pg.sub}
      ok={pg.ok} next={() => go(keys[i + 1])}>
      {pg.body}
    </StepPage>
  );
}

/* ---------------- Kunde bearbeiten: Übersicht + einzelne Seiten ---------------- */
function EditCustomer({ ctx, d, init, step, go, close, reload }) {
  useFlowMode(ctx);
  const { toast } = ctx;
  const [f, setF] = React.useState(() => formOf(init, d.def));
  const [saved, setSaved] = React.useState(() => formOf(init, d.def));
  const [busy, setBusy] = React.useState("");
  const [sure, setSure] = React.useState(false);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const { pages } = useCustomerPages({ f, set, d: { ...d, toast }, isNew: false });

  const save = async () => {
    setBusy("save");
    try { await pricingCustomer(payloadOf(f, init)); setSaved(f); toast("Gespeichert"); reload(); go(null); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy("");
  };
  const cancel = () => { setF(saved); go(null); };
  const sendLink = async () => {
    setBusy("link");
    try { await pricingInvite(init.email); toast("Login-Link an " + init.email + " gesendet"); reload(); } catch (e) { toast("Fehler: " + e.message); }
    setBusy("");
  };
  const openDash = async () => {
    const w = window.open("", "_blank");
    try { const j = await custImpersonate(init.email); if (w) w.location.href = j.url; else window.location.href = j.url; }
    catch (e) { if (w) w.close(); toast("Fehler: " + e.message); }
  };
  const remove = async () => {
    if (!sure) { setSure(true); return; }
    setBusy("rm");
    try { await pricingCustomer({ email: init.email, remove: true }); toast("Entfernt – Konto bleibt, es gelten wieder Standardpreise und die normale Zuteilung"); reload(); close(); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy("");
  };

  if (step && pages[step]) {
    const pg = pages[step];
    // Preise: erst Auswahl, bei „Eigene" weiter zum Editor; sonst direkt speichern
    const chain = step === "cprice" && f.own ? "cown" : step === "pprice" && f.pOwn ? "pown" : null;
    const backTo = step === "cown" ? "cprice" : step === "pown" ? "pprice" : null;
    return (
      <StepPage onBack={() => (backTo ? go(backTo) : cancel())} title={pg.title} sub={pg.sub} ok={pg.ok} busy={busy === "save"}
        next={chain ? () => go(chain) : save} nextLabel={chain ? null : busy === "save" ? "Speichere …" : "Speichern"} final={!chain}>
        {pg.body}
      </StepPage>
    );
  }

  const title = init.company || init.name || init.email;
  const row = (key, icon, label) => (
    <button type="button" className="ir aw-er" onClick={() => go(key)}>
      <span className="ico">{icon}</span>
      <span className="t"><span>{label}</span><span className="aw-v">{pages[key].sum}</span></span>
      <ChevronRight />
    </button>
  );
  return (
    <div className="naflow aw">
      <div className="anav"><button type="button" className="circ keep" aria-label="Zurück" onClick={close}><ArrowLeft /></button></div>
      <div className="ttl" style={{ paddingBottom: 4 }}>{title}</div>
      <p className="sh" style={{ margin: "0 0 16px" }}>{init.account ? (init.lastLogin ? `Zuletzt eingeloggt ${dt(init.lastLogin)}` : "Noch nie eingeloggt") : "Noch kein Konto"}{init.invitedAt ? ` · Link gesendet ${dt(init.invitedAt)}` : ""}{` · ${init.orders || 0} Auftr${init.orders === 1 ? "ag" : "äge"}`}</p>
      <div className="info">
        {row("who", <Users />, "Kunde")}
        {row("lang", <Globe />, "Sprache")}
        {row("pw", <Lock />, "Passwort")}
      </div>
      <div className="info">
        {row("partner", <Handshake />, "Partner")}
        {row("cprice", <Tag />, "Preise Kunde")}
        {row("pprice", <Percent />, "Preise Partner")}
      </div>
      <div className="info">{row("note", <StickyNote />, "Interne Notiz")}</div>
      <div className="ctas2">
        <button type="button" className="cta gh" disabled={!!busy} onClick={sendLink}><Send />{busy === "link" ? "Sende …" : "Login-Link senden"}</button>
        <button type="button" className="cta gh" disabled={!!busy || !init.account} onClick={openDash}><ExternalLink />Dashboard öffnen</button>
      </div>
      <button type="button" className={"cta " + (sure ? "red" : "gh")} style={{ marginTop: 10, color: sure ? undefined : "var(--danger)" }} disabled={busy === "rm"} onClick={remove}>
        <Trash2 />{sure ? "Wirklich entfernen? Nochmal tippen" : "Eintrag entfernen"}</button>
      <p className="aw-hint">Entfernen löscht nur Partner + Preise – das Konto des Kunden bleibt, danach gelten Standardpreise.</p>
      <div style={{ height: 96 }} />
    </div>
  );
}

/* ---------------- Standard-Staffel ---------------- */
function DefaultPricing({ ctx, d, step, go, close, reload }) {
  useFlowMode(ctx);
  const { toast } = ctx;
  const init = () => {
    const def = d.def;
    return { cur: (def && def.cur) || "usd", rows: toRows(def && def.tiers), sw: def && def.sw ? String(def.sw) : "",
      pRows: toRows(def && def.partner && def.partner.tiers), pSw: def && def.partner && def.partner.sw ? String(def.partner.sw) : "",
      tol: def && def.tol != null ? String(def.tol) : "10" };
  };
  const [f, setF] = React.useState(init);
  const [saved, setSaved] = React.useState(init);
  const [busy, setBusy] = React.useState(false);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const ct = rowsTiers(f.rows);
  const pt = filled(f.pRows).length ? rowsTiers(f.pRows) : null;
  const save = async () => {
    setBusy(true);
    try { await pricingDefault(f.cur, ct, f.sw.trim() || null, pt, f.pSw.trim() || null, f.tol.trim() || "10"); setSaved(f); toast("Standard-Staffel gespeichert"); reload(); go(null); }
    catch (e) { toast("Fehler: " + e.message); }
    setBusy(false);
  };
  const cancel = () => { setF(saved); go(null); };
  const tolN = Number(f.tol) || 10;
  const pages = {
    c: { title: "Standard-Preise Kunde", sub: "Für alle Kunden ohne eigene Preise. Der Kunde sieht die Staffel beim Bestellen.", ok: !!ct && swOk(f.sw),
      body: <div className="card pr-card"><CurSeg cur={f.cur} setCur={(v) => set({ cur: v })} /><TierEditor rows={f.rows} setRows={(v) => set({ rows: v })} cur={f.cur} /><SwRow value={f.sw} set={(v) => set({ sw: v })} cur={f.cur} /></div> },
    p: { title: "Standard-Preise Partner", sub: "In USD, sieht nur der Partner. Leer = sein normaler Preis je Leistung.", ok: (!filled(f.pRows).length || !!pt) && swOk(f.pSw),
      body: <><div className="card pr-card"><TierEditor rows={f.pRows} setRows={(v) => set({ pRows: v })} cur="usd" /><SwRow value={f.pSw} set={(v) => set({ pSw: v })} cur="usd" /></div>
        {f.cur === "usd" && ct && pt ? <><div className="aw-lab">Deine Marge</div><Margin ct={ct} pt={pt} csw={nOf(f.sw)} psw={nOf(f.pSw)} /></> : null}</> },
    tol: { title: "Toleranz bei Stornos", sub: "Wenn bei einem Bulk-Auftrag Bewertungen storniert werden (z. B. Software-Fälle).", ok: Number(f.tol) >= 0 && f.tol !== "",
      body: <>
        <div className="card pr-card"><div className="pr-row"><span className="pr-lab">Toleranz</span><span className="pr-p"><input className="po-num" inputMode="numeric" aria-label="Toleranz in Prozent" value={f.tol} onChange={(e) => set({ tol: e.target.value.replace(/[^\d]/g, "").slice(0, 2) })} /> %</span></div></div>
        <p className="aw-hint">Beispiel: Stufe ab 100 – fällt der Auftrag auf {Math.ceil(100 * (1 - tolN / 100))} oder mehr, bleibt der Preis. Darunter muss der Kunde den neuen Preis bestätigen, bis dahin ist der Auftrag pausiert.</p>
      </> },
  };
  if (step && pages[step]) {
    const pg = pages[step];
    return <StepPage onBack={cancel} title={pg.title} sub={pg.sub} ok={pg.ok} busy={busy} next={save} nextLabel={busy ? "Speichere …" : "Speichern"} final>{pg.body}</StepPage>;
  }
  const row = (key, icon, label, val) => (
    <button type="button" className="ir aw-er" onClick={() => go(key)}>
      <span className="ico">{icon}</span><span className="t"><span>{label}</span><span className="aw-v">{val}</span></span><ChevronRight />
    </button>
  );
  const def = d.def;
  return (
    <div className="naflow aw">
      <div className="anav"><button type="button" className="circ keep" aria-label="Zurück" onClick={close}><ArrowLeft /></button></div>
      <div className="ttl" style={{ paddingBottom: 4 }}>Standard-Staffel</div>
      <p className="sh" style={{ margin: "0 0 16px" }}>Gilt für Bulk-Uploads aller Kunden ohne eigene Preise.</p>
      <div className="info">
        {row("c", <Users />, "Preise Kunde", def && def.tiers && def.tiers.length ? <TierLines tiers={def.tiers} cur={def.cur} sw={def.sw} /> : <b className="mute">noch nicht festgelegt – normale Preise</b>)}
        {row("p", <Handshake />, "Preise Partner", def && def.partner && def.partner.tiers && def.partner.tiers.length ? <TierLines tiers={def.partner.tiers} cur="usd" sw={def.partner.sw} /> : <b className="mute">normaler Partnerpreis</b>)}
        {row("tol", <Percent />, "Toleranz bei Stornos", <b>{def && def.tol != null ? def.tol : 10} %</b>)}
      </div>
    </div>
  );
}

/* ---------------- Liste ---------------- */
export default function PricingScreen({ ctx }) {
  const { setMoreSub, toast } = ctx;
  const [d, setD] = React.useState(null);
  const [q, setQ] = React.useState("");
  // Ansicht im Verlauf → Browser-/Wisch-Zurück geht einen Schritt zurück: null | {v:"new"|"edit"|"def", email?, s}
  const [view, setView] = useHistState("prv", null);
  const load = React.useCallback(() => pricingInfo().then(setD).catch((e) => toast("Fehler: " + e.message)), [toast]);
  React.useEffect(() => { load(); }, [load]);
  const go = (s, opt) => setView((v) => ({ ...v, s }), opt);
  const close = () => setView(null);

  if (!d) return <><div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div><div className="aempty"><b>Lädt …</b></div></>;

  if (view && view.v === "new") return <NewCustomer key="new" ctx={ctx} d={d} step={view.s} go={go} close={close} reload={load} />;
  if (view && view.v === "def") return <DefaultPricing key="def" ctx={ctx} d={d} step={view.s} go={go} close={close} reload={load} />;
  if (view && view.v === "edit") {
    const c = (d.customers || []).find((x) => x.email === view.email);
    if (c) return <EditCustomer key={"e:" + c.email} ctx={ctx} d={d} init={c} step={view.s} go={go} close={close} reload={load} />;
  }

  const partners = d.partners || [];
  const pName = (id) => (partners.find((x) => x.id === id) || {}).name || "Partner " + id;
  const all = d.customers || [];
  const list = all.filter((c) => { const v = q.trim().toLowerCase(); return !v || [c.email, c.name, c.company].some((x) => String(x || "").toLowerCase().includes(v)); });
  const toggleNo = async () => { try { const j = await pricingNewOrder(!d.newOrder); setD((x) => ({ ...x, newOrder: j.newOrder })); } catch (e) { toast("Fehler: " + e.message); } };
  const def = d.def;
  return (
    <>
      <div className="anav"><button type="button" className="circ mbk" aria-label="Zurück" onClick={() => setMoreSub(null)}><ArrowLeft /></button></div>
      <div className="ttl">Kunden & Preise</div>
      <button type="button" className="cta or" style={{ marginBottom: 8 }} onClick={() => setView({ v: "new", s: "who" })}><UserPlus />Kunden-Dashboard anlegen</button>
      <p className="sh" style={{ margin: "0 0 20px", textAlign: "center" }}>Schritt für Schritt: Kunde, Login, Partner, Preise.</p>

      <div className="sec3"><h2>Kunden</h2>{all.length ? <span className="px-cnt">{all.length}</span> : null}</div>
      {all.length > 6 ? <label className="pfld"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kunde suchen (Name, Firma, E-Mail)" /></label> : null}
      {list.length ? (
        <div className="info">
          {list.map((c) => (
            <button key={c.email} type="button" className="ir" onClick={() => setView({ v: "edit", email: c.email, s: null })}>
              <span className="t"><b>{c.company || c.name || c.email}</b>
                <span>{c.partnerId ? pName(c.partnerId) : "Normale Zuteilung"}{" · "}{c.tiers ? `eigene Preise ${range(c.tiers, c.cur)}` : "Standard-Staffel"}{!c.account ? " · noch kein Konto" : c.lastLogin ? "" : " · noch nie eingeloggt"}</span></span>
              <ChevronRight />
            </button>
          ))}
        </div>
      ) : <div className="aempty"><b>{all.length ? "Kein Treffer" : "Noch keine Kunden-Dashboards"}</b>{all.length ? null : "Leg oben das erste an."}</div>}

      <div className="sec3" style={{ marginTop: 10 }}><h2>Einstellungen</h2></div>
      <div className="info">
        <button type="button" className="ir" onClick={() => setView({ v: "def", s: null })}>
          <span className="ico"><Tag /></span>
          <span className="t"><b>Standard-Staffel</b><span>{def && def.tiers && def.tiers.length ? `Kunde ${range(def.tiers, def.cur)} · für alle ohne eigene Preise` : "Noch nicht festgelegt"}</span></span>
          <ChevronRight />
        </button>
        <button type="button" className="ir" onClick={toggleNo}>
          <span className="t"><b>„Neue Bestellung" im Kunden-Dashboard</b><span>{d.newOrder ? "An – alle Kunden können selbst bestellen" : "Aus – nur Test-Konten"}</span></span>
          <span className={"tg" + (d.newOrder ? " on" : "")}><i /></span>
        </button>
      </div>
      <div style={{ height: 40 }} />
    </>
  );
}
